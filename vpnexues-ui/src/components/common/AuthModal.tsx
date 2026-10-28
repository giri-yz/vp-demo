import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { RecaptchaVerifier } from 'firebase/auth';
import { flagSrc } from '../../utils/flags';
import { invalidateAuthToken } from '../../api/httpClient';
import { auth } from '../../config/firebase';
import * as authApi from '../../api/authApi';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useCountry } from '../../context/CountryContext';
import { useAuthModal } from '../../context/AuthModalContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { IconCheck, IconMail, IconShieldCheck, IconUser } from './icons';
import type { CountryCode } from '../../types';
import styles from './css/AuthModal.module.css';

const RESEND_COOLDOWN_SECONDS = 30;
const RECAPTCHA_SCRIPT_SRC = 'https://www.google.com/recaptcha/api.js?render=explicit';

/**
 * Make sure Google's reCAPTCHA script is actually ready before we ask Firebase
 * to build a verifier. Two things made the old `window.grecaptcha` guard fire
 * falsely and block every signup:
 *   1. Firebase only injects the script when `new RecaptchaVerifier()` runs —
 *      so a pre-check on a fresh page load always saw `undefined`.
 *   2. Google's script is two-stage: at `onload` `grecaptcha` exists with only
 *      `ready`; `render` appears seconds later when the worker file loads.
 * So we inject the script ourselves and POLL until `grecaptcha.render` exists.
 *
 * Returns `true` when ready, `false` only if the script was genuinely blocked
 * (ad-blocker / private window) or never became ready before the timeout.
 */
function ensureRecaptchaScript(timeoutMs = 20000): Promise<boolean> {
  const w = window as { grecaptcha?: { render?: unknown } };
  if (w.grecaptcha?.render) return Promise.resolve(true);

  return new Promise((resolve) => {
    let settled = false;
    const finish = (ok: boolean) => {
      if (settled) return;
      settled = true;
      window.clearInterval(poll);
      window.clearTimeout(timer);
      resolve(ok);
    };
    // grecaptcha.render appears only after Google's worker script loads — poll for it.
    const poll = window.setInterval(() => {
      if (w.grecaptcha?.render) finish(true);
    }, 100);
    const timer = window.setTimeout(() => finish(Boolean(w.grecaptcha?.render)), timeoutMs);

    let el = document.querySelector<HTMLScriptElement>('script[src*="recaptcha/api.js"]');
    if (!el) {
      el = document.createElement('script');
      el.src = RECAPTCHA_SCRIPT_SRC;
      el.async = true;
      el.defer = true;
      el.addEventListener('error', () => finish(false));
      document.head.appendChild(el);
    } else {
      el.addEventListener('error', () => finish(false));
      if (w.grecaptcha?.render) finish(true);
    }
  });
}

const COUNTRY_PHONE: Record<CountryCode, { code: string; flag: string; digits: number }> = {
  IN: { code: '91', flag: 'in', digits: 10 },
  SG: { code: '65', flag: 'sg', digits: 8 },
  US: { code: '1', flag: 'us', digits: 10 },
  AE: { code: '971', flag: 'ae', digits: 9 },
  LK: { code: '94', flag: 'lk', digits: 9 },
  MY: { code: '60', flag: 'my', digits: 9 },
};

type Step = 'phone' | 'otp';

interface OtpFormState {
  phone: string;
  code: string;
  step: Step;
  busy: boolean;
  error: string;
  /** Green info line ("already registered — logging you in…"). */
  info: string;
  /** Amber nudge line ("confirm you're not a robot, then resend"). */
  nudge: string;
  /** True once the OTP was actually sent — hides the consumed checkbox and shows a green tick. */
  captchaSolved: boolean;
  resendIn: number;
}

const EMPTY_FORM: OtpFormState = {
  phone: '',
  code: '',
  step: 'phone',
  busy: false,
  error: '',
  info: '',
  nudge: '',
  captchaSolved: false,
  resendIn: 0,
};

const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/** Resolves with `null` on rejection OR when `ms` elapses first — used for best-effort pre-checks. */
function withDeadline<T>(promise: Promise<T>, ms: number): Promise<T | null> {
  return Promise.race([
    promise.then((v) => v, () => null),
    new Promise<null>((resolve) => setTimeout(() => resolve(null), ms)),
  ]);
}

export default function AuthModal() {
  const { isOpen, tab, closeAuthModal, switchTab, notifySuccess } = useAuthModal();
  const { t } = useLanguage();
  const { setUser } = useAuth();
  const { refresh: refreshCart } = useCart();
  const { country } = useCountry();
  const phonePrefix = COUNTRY_PHONE[country];

  const [login, setLogin] = useState<OtpFormState>(EMPTY_FORM);
  const [signup, setSignup] = useState<OtpFormState>(EMPTY_FORM);
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');

  const resendTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);
  const verifyLockRef = useRef(false);

  useEffect(() => {
    if (!isOpen) return;

    const scrollY = window.scrollY;
    const prevBody = document.body.style.cssText;
    const prevHtml = document.documentElement.style.cssText;
    document.body.style.cssText = `overflow:hidden;position:fixed;top:-${scrollY}px;width:100%;`;
    document.documentElement.style.cssText = `overflow:hidden;`;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') closeAuthModal();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.cssText = prevBody;
      document.documentElement.style.cssText = prevHtml;
      window.scrollTo(0, scrollY);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, closeAuthModal]);

  useEffect(() => {
    return () => {
      if (resendTimer.current) clearInterval(resendTimer.current);
    };
  }, []);

  useEffect(() => {
    if (!isOpen) {
      setLogin(EMPTY_FORM);
      setSignup(EMPTY_FORM);
      setSignupName('');
      setSignupEmail('');
      authApi.resetOtpSession();
      verifyLockRef.current = false;
      if (resendTimer.current) clearInterval(resendTimer.current);
      if (recaptchaVerifierRef.current) {
        try { recaptchaVerifierRef.current.clear(); } catch { /* ignore */ }
        recaptchaVerifierRef.current = null;
      }
    }
  }, [isOpen]);

  // Warm up Google's reCAPTCHA script while the user fills the signup form, so
  // the first "Send OTP" tap doesn't have to wait for the network.
  useEffect(() => {
    if (isOpen && tab === 'signup') void ensureRecaptchaScript();
  }, [isOpen, tab]);

  function getRecaptchaVerifier(): RecaptchaVerifier {
    if (!auth) throw new Error('Firebase is not configured. Set VITE_FIREBASE_API_KEY.');
    if (recaptchaVerifierRef.current) {
      try { recaptchaVerifierRef.current.clear(); } catch { /* ignore */ }
      recaptchaVerifierRef.current = null;
    }

    const container = document.getElementById('recaptcha-container');
    if (container) container.innerHTML = '';

    recaptchaVerifierRef.current = new RecaptchaVerifier(auth, 'recaptcha-container', {
      size: 'normal',
      callback: () => {
        console.log('[reCAPTCHA] solved');
      },
      'expired-callback': () => {
        console.log('[reCAPTCHA] expired');
        recaptchaVerifierRef.current = null;
        // The widget is hidden + considered solved once an OTP went out — a late
        // expiry event from the stale widget must not wipe the OTP screen state.
        setLogin((prev) => (prev.captchaSolved ? prev : { ...prev, error: t('auth.recaptchaExpired') }));
        setSignup((prev) => (prev.captchaSolved ? prev : { ...prev, error: t('auth.recaptchaExpired') }));
      },
      'error-callback': () => {
        console.log('[reCAPTCHA] error');
        recaptchaVerifierRef.current = null;
        setLogin((prev) => (prev.captchaSolved ? prev : { ...prev, error: t('auth.recaptchaFailed') }));
        setSignup((prev) => (prev.captchaSolved ? prev : { ...prev, error: t('auth.recaptchaFailed') }));
      },
    });

    return recaptchaVerifierRef.current;
  }

  function startResendCooldown(setState: typeof setLogin | typeof setSignup) {
    if (resendTimer.current) clearInterval(resendTimer.current);
    setState((prev) => ({ ...prev, resendIn: RESEND_COOLDOWN_SECONDS }));
    resendTimer.current = setInterval(() => {
      setState((prev) => {
        if (prev.resendIn <= 1) {
          if (resendTimer.current) clearInterval(resendTimer.current);
          return { ...prev, resendIn: 0 };
        }
        return { ...prev, resendIn: prev.resendIn - 1 };
      });
    }, 1000);
  }

  if (!isOpen) return null;

  /** Signup cannot start (OTP) or finish (verify) until name + a valid email are entered. */
  function validateSignupProfile(): string {
    if (!signupName.trim()) return t('auth.nameRequired');
    const email = signupEmail.trim();
    if (!email) return t('auth.emailRequired');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return t('auth.invalidEmailFormat');
    return '';
  }

  /**
   * Shared Firebase SMS send — used by first-time signup, first login, the
   * login jump from signup, and every resend.
   */
  async function sendFirebaseOtp(
    fullPhone: string,
    setState: typeof setLogin | typeof setSignup,
    opts?: { info?: string }
  ) {
    let lastErr: unknown = null;
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        console.log('[Firebase] Sending OTP (attempt ' + attempt + ')');
        // Firebase only injects the reCAPTCHA script when the verifier is built.
        // Wait for the script to actually load first, so a slow connection isn't
        // mistaken for a content blocker, and a real blocker still gets the
        // actionable "blocked" message instead of a generic failure.
        const recaptchaReady = await ensureRecaptchaScript();
        if (!recaptchaReady) {
          console.error('[Firebase] reCAPTCHA script failed to load (blocked by browser/extension?)');
          setState((prev) => ({ ...prev, busy: false, error: t('auth.recaptchaBlocked') }));
          return;
        }
        const appVerifier = getRecaptchaVerifier();
        await authApi.sendOtp(fullPhone, appVerifier);
        console.log('[Firebase] OTP sent successfully');
        // The OTP is on its way → the human check has served its purpose. Hide
        // the (consumed, now-unchecked) widget and show a green tick instead —
        // the client saw an empty checkbox next to the OTP form and reported it.
        setState((prev) => ({
          ...prev,
          step: 'otp',
          busy: false,
          error: '',
          nudge: '',
          info: opts?.info ?? '',
          captchaSolved: true,
        }));
        startResendCooldown(setState);
        return;
      } catch (err: unknown) {
        lastErr = err;
        const code = (err as { code?: string })?.code ?? '';
        // Log only the code/message — the raw error object can carry the request
        // payload (phone number) and must never reach the console (QA-23).
        console.error('[Firebase] Send OTP error (attempt ' + attempt + '):', code || String(err));
        // An expired or already-consumed reCAPTCHA token is the most common cause
        // of invalid-app-credential. Rebuild the widget fresh and retry once.
        if (code === 'auth/invalid-app-credential' && attempt === 1) {
          console.log('[Firebase] invalid-app-credential — clearing widget and retrying once');
          continue;
        }
        break;
      }
    }
    const message = lastErr instanceof Error ? lastErr.message : String(lastErr);
    const code = (lastErr as { code?: string })?.code ?? '';
    setState((prev) => ({
      ...prev,
      busy: false,
      error: code === 'auth/invalid-phone-number'
        ? t('auth.invalidPhoneFormat')
        : code === 'auth/too-many-requests'
          ? t('auth.tooManyRequests')
          : code === 'auth/unauthorized-domain'
            ? t('auth.unauthorizedDomain')
            : code === 'auth/captcha-check-failed'
              ? t('auth.recaptchaFailed')
              : code === 'auth/invalid-app-credential'
                ? t('auth.firebaseConfigError')
                : code === 'auth/network-request-failed' || message.includes('Failed to fetch')
                  ? t('auth.networkIssue')
                  : `${t('auth.failedToSendOtp')}: ${message.slice(0, 150)}`,
    }));
  }

  async function handleSendOtp(context: 'login' | 'signup', state: OtpFormState, setState: typeof setLogin | typeof setSignup) {
    const isResend = state.step === 'otp';

    setState((prev) => ({
      ...prev,
      error: '',
      busy: true,
      // Resend: the previous token was consumed with the last SMS — rebuild the
      // widget unchecked and ask the user to tick it again.
      nudge: isResend ? t('auth.verifyHumanAgain') : '',
      info: '',
      captchaSolved: isResend ? false : prev.captchaSolved,
    }));

    if (context === 'signup' && !isResend) {
      const profileError = validateSignupProfile();
      if (profileError) {
        setState((prev) => ({ ...prev, busy: false, error: profileError }));
        return;
      }
    }

    const fullPhone = `+${phonePrefix.code}${state.phone}`;

    // Resends skip both pre-checks: Firebase only needs a fresh SMS, and every
    // /api/auth/login call burns one of the 5-per-number-per-5-minutes budget.
    if (!isResend && context === 'login') {
      // ---- Device-aware login: phone alone only works on a trusted device ----
      try {
        const { requiresOtp, user } = await authApi.loginByPhone(fullPhone);
        if (user && !requiresOtp) {
          // Trusted device (passed OTP here before) → instant session, no SMS.
          // Drop any stale Firebase session from a different account so the
          // cookie session we just created stays the single source of truth.
          try { if (auth) await auth.signOut(); invalidateAuthToken(); } catch { /* best effort */ }
          setUser(user);
          await refreshCart();
          window.dispatchEvent(new Event('auth:login'));
          notifySuccess();
          return;
        }
        // Registered number but a NEW/untrusted device → no session issued.
        // Fall through to the shared Firebase OTP send below; once verified,
        // the backend trusts this device so next login here is passwordless.
        console.log('[Login] Untrusted device — OTP required');
      } catch (err: unknown) {
        // Log only the message — the raw axios error would dump the request
        // body (phone number) into the console (QA-23).
        console.error('[Login] phone-only login error:', err instanceof Error ? err.message : String(err));
        const status =
          typeof err === 'object' && err !== null && 'response' in err
            ? (err as { response?: { status?: number } }).response?.status
            : undefined;

        if (status === 404) {
          // Unknown number — no account, so no OTP either. Carry the number over
          // and drop the user on the signup tab to create the account.
          setSignup((prev) => ({ ...prev, phone: state.phone, error: t('auth.notRegistered') }));
          setState((prev) => ({ ...prev, busy: false }));
          switchTab('signup');
          return;
        }
        const errMsg = err instanceof Error ? err.message : String(err);
        setState((prev) => ({
          ...prev,
          busy: false,
          error:
            status === 429
              ? t('auth.tooManyRequests')
              : errMsg.includes('timeout')
                ? t('auth.serverWaking')
                : `${t('auth.loginFailed')}: ${errMsg.slice(0, 150)}`,
        }));
        return;
      }
    }

    // ---- Signup pre-check: is this number already registered? ----
    // Best-effort with a short deadline — a slow/dead backend must never stop
    // someone from signing up (404 = not registered, timeout/429/offline = we
    // simply don't know and continue as before).
    if (!isResend && context === 'signup') {
      const pre = await withDeadline(authApi.loginByPhone(fullPhone), 4000);

      if (pre && !pre.requiresOtp && pre.user) {
        // (A) Registered AND this browser already proved the phone → intimate
        // the user and log in with no OTP at all, like a normal login here.
        setState((prev) => ({ ...prev, busy: true, error: '', info: t('auth.alreadyRegisteredLoggingIn') }));
        await delay(700);
        try { if (auth) await auth.signOut(); invalidateAuthToken(); } catch { /* best effort */ }
        setUser(pre.user);
        await refreshCart();
        window.dispatchEvent(new Event('auth:login'));
        notifySuccess();
        return;
      }

      if (pre && pre.requiresOtp) {
        // (B) Registered but this device is new → tell the user, jump to the
        // Login tab with the number carried over, and send that OTP right away
        // so the rest is EXACTLY a normal login (one SMS, then this device is
        // trusted for future passwordless logins).
        const loginState: OtpFormState = {
          ...EMPTY_FORM,
          phone: state.phone,
          busy: true,
          info: t('auth.alreadyRegisteredLogin'),
        };
        setLogin(loginState);
        setSignup((prev) => ({ ...prev, busy: false }));
        switchTab('login');
        await sendFirebaseOtp(fullPhone, setLogin, { info: t('auth.alreadyRegisteredLogin') });
        return;
      }
      // Not registered / unknown → fall through to the normal signup OTP.
      console.log('[Signup] pre-check: no registered account (or inconclusive) → sending OTP');
    }

    await sendFirebaseOtp(fullPhone, setState);
  }

  async function handleVerify(
    context: 'login' | 'signup',
    state: OtpFormState,
    setState: typeof setLogin | typeof setSignup
  ) {
    // Double-tap guard: two concurrent confirms race for the same code, and
    // the loser's error would hide the winner's success.
    if (verifyLockRef.current) return;
    verifyLockRef.current = true;
    setState((prev) => ({ ...prev, error: '', info: '', nudge: '', busy: true }));

    try {
      if (context === 'signup') {
        const profileError = validateSignupProfile();
        if (profileError) {
          setState((prev) => ({ ...prev, busy: false, error: profileError }));
          return;
        }
      }

      const user = await authApi.verifyOtp(
        `+${phonePrefix.code}${state.phone}`,
        state.code,
        context === 'signup' ? signupName.trim() : undefined,
        context === 'signup' ? signupEmail.trim() : undefined
      );
      setUser(user);
      await refreshCart();
      window.dispatchEvent(new Event('auth:login'));
      notifySuccess();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      // Log only the message — the raw error object can embed the request
      // payload (phone, OTP code, Firebase UID, ID token) — QA-23.
      console.error('[Firebase] Verify OTP error:', message);
      const backendMessage =
        typeof err === 'object' && err !== null && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      setState((prev) => ({
        ...prev,
        busy: false,
        error: backendMessage
          ? (backendMessage.includes('required to create')
              ? t('auth.accountRequired')
              : backendMessage)
          : (message.includes('auth/invalid-verification-code')
            ? t('auth.invalidOtp')
            : message.includes('auth/code-expired')
              ? t('auth.otpExpired')
              : message.includes('auth/captcha-check-failed')
                ? t('auth.recaptchaFailed')
                : message.includes('No OTP confirmation pending')
                  ? t('auth.sessionExpired')
                  : `${t('auth.verificationFailed')}: ${message.slice(0, 200)}`),
      }));
    } finally {
      verifyLockRef.current = false;
    }
  }

  function renderForm(context: 'login' | 'signup', state: OtpFormState, setState: typeof setLogin | typeof setSignup) {
    return (
      <>
        {context === 'signup' && (
          <>
            <label className={styles.fieldLabel} htmlFor="authSignupName">
              {t('auth.fullName')}
            </label>
            <div className={styles.inputGroup}>
              <IconUser className={styles.fieldIcon} />
              <input
                id="authSignupName"
                type="text"
                placeholder={t('auth.enterFullName')}
                autoComplete="name"
                value={signupName}
                onChange={(e) => setSignupName(e.target.value)}
              />
            </div>
            <label className={styles.fieldLabel} htmlFor="authSignupEmail">
              {t('auth.emailAddress')}
            </label>
            <div className={styles.inputGroup}>
              <IconMail className={styles.fieldIcon} />
              <input
                id="authSignupEmail"
                type="email"
                placeholder={t('auth.enterEmail')}
                autoComplete="email"
                value={signupEmail}
                onChange={(e) => setSignupEmail(e.target.value)}
              />
            </div>
          </>
        )}

        <label className={styles.fieldLabel} htmlFor={`auth${context}Phone`}>
          {context === 'signup' ? t('auth.mobileNumber') : t('auth.phoneNumber')}
        </label>
        <div className={styles.inputGroup}>
          <span className={styles.countryPrefix}>
            <img src={flagSrc(phonePrefix.flag)} alt="" />
            <span>+{phonePrefix.code}</span>
          </span>
          <input
            id={`auth${context}Phone`}
            type="tel"
            placeholder={t('auth.enterPhone')}
            autoComplete="tel"
            inputMode="numeric"
            maxLength={phonePrefix.digits}
            disabled={state.step === 'otp'}
            value={state.phone}
            onChange={(e) => setState((prev) => ({ ...prev, phone: e.target.value.replace(/[^0-9]/g, '') }))}
          />
        </div>

        {state.nudge && <div className={`${styles.otpMessage} ${styles.nudge}`}>{state.nudge}</div>}
        {state.info && <div className={`${styles.otpMessage} ${styles.info}`}>{state.info}</div>}
        {state.error && <div className={`${styles.otpMessage} ${styles.error}`}>{state.error}</div>}

        {state.step === 'phone' ? (
          <button
            type="button"
            className={styles.submitBtn}
            disabled={state.busy || state.phone.length < phonePrefix.digits}
                onClick={() => handleSendOtp(context, state, setState)}
          >
            {state.busy
              ? context === 'login'
                ? t('auth.loggingIn')
                : t('auth.sending')
              : context === 'login'
                ? t('auth.login')
                : t('auth.sendOtp')}
          </button>
        ) : (
          <>
            <div className={styles.inputGroup}>
              <input
                type="tel"
                placeholder={t('auth.enterOtp')}
                autoComplete="one-time-code"
                inputMode="numeric"
                maxLength={6}
                value={state.code}
                onChange={(e) => setState((prev) => ({ ...prev, code: e.target.value.replace(/[^0-9]/g, '') }))}
              />
            </div>
            <div className={styles.verifyRow}>
              <button
                type="button"
                className={styles.resendLink}
                disabled={state.resendIn > 0 || state.busy}
            onClick={() => handleSendOtp(context, state, setState)}
              >
                {state.resendIn > 0 ? `${t('auth.resendOtp')} ${state.resendIn}s` : t('auth.resendOtp')}
              </button>
              <button
                type="button"
                className={`${styles.submitBtn} ${styles.verifyBtn}`}
                disabled={state.busy || state.code.length < 6}
                onClick={() => handleVerify(context, state, setState)}
              >
                <IconCheck className={styles.btnIcon} />{' '}
                {state.busy ? t('auth.verifying') : context === 'signup' ? t('auth.verifyCreate') : t('auth.verifyLogin')}
              </button>
            </div>
          </>
        )}

        <p className={styles.authSwitch}>
          {context === 'login' ? (
            <>
              {t('auth.newUser')}{' '}
              <button type="button" className={styles.resendLink} onClick={() => switchTab('signup')}>
                {t('auth.createAnAccount')}
              </button>
            </>
          ) : (
            <>
              {t('auth.alreadyRegistered')}{' '}
              <button type="button" className={styles.resendLink} onClick={() => switchTab('login')}>
                {t('auth.loginHere')}
              </button>
            </>
          )}
        </p>

        {context === 'login' && (
          <div className={styles.trustStrip}>
            <IconShieldCheck className={styles.trustIcon} />
            <span>
              <strong>{t('auth.trustTitle')}</strong>
              <small>{t('auth.trustDesc')}</small>
            </span>
          </div>
        )}

        <p className={styles.terms}>
          {t('auth.termsText')} <Link to="/terms" onClick={closeAuthModal}>{t('auth.terms')}</Link> &amp; <Link to="/privacy" onClick={closeAuthModal}>{t('auth.privacy')}</Link>.
        </p>
      </>
    );
  }

  const isLogin: boolean = tab === 'login';
  const currentForm: OtpFormState = isLogin ? login : signup;

  return (
    <div
      className={styles.overlay}
      onClick={(e) => {
        if (e.target === e.currentTarget) closeAuthModal();
      }}
    >
      <div className={styles.panel}>
        <button type="button" className={styles.closeBtn} onClick={closeAuthModal} aria-label="Close">
          &times;
        </button>
        <div className={styles.deco}>
          <div className={styles.decoTopbar}>
            <div className={styles.brand}>
              <img className={styles.logo} src="https://res.cloudinary.com/eqjshlur/image/upload/v1790001831/vpnexues/old/site-assets/logo/vp-logo.svg" alt="VPNexues logo" />
              <span className={styles.decoLogo}>
                VPNexues
                <small>விவசாயம் காப்போம்</small>
              </span>
            </div>
          </div>
          <div className={styles.bannerContent}>
            <h2>
              {isLogin ? (
                <>
                  {t('auth.freshVegetables')}
                  <br />
                  {t('auth.deliveredDaily')}
                </>
              ) : (
                <>
                  {t('auth.freshSavings')}
                  <br />
                  {t('auth.firstOrder')}
                </>
              )}
            </h2>
            <p>
              {isLogin
                ? t('auth.freshDesc')
                : t('auth.newUsersDesc')}
            </p>
          </div>
        </div>

        <div className={styles.formArea}>
          <div className={styles.tabs}>
            <button type="button" className={isLogin ? styles.tabActive : styles.tab} onClick={() => switchTab('login')}>
              {t('auth.login')}
            </button>
            <button type="button" className={!isLogin ? styles.tabActive : styles.tab} onClick={() => switchTab('signup')}>
              {t('auth.signup')}
            </button>
          </div>

          <div className={styles.cardHead}>
            <p>{isLogin ? t('auth.welcomeBack') : t('auth.createAccount')}</p>
            <h3>{isLogin ? t('auth.login') : t('auth.signup')}</h3>
          </div>
          {!isLogin && <p className={styles.formSub}>{t('auth.newUsersDesc')}</p>}
          {isLogin && <p className={styles.formSub}>{t('auth.freshDesc')}</p>}

          {isLogin ? renderForm('login', login, setLogin) : renderForm('signup', signup, setSignup)}

          {/* Firebase reCAPTCHA — hidden + replaced by a green tick once the OTP
              has actually been sent (the consumed widget always comes back
              unchecked, which looked like a failed verification to users). */}
          <div className={styles.recaptchaWrap}>
            <div id="recaptcha-container" className={currentForm.captchaSolved ? styles.captchaHidden : undefined} />
            {currentForm.captchaSolved && (
              <span className={styles.captchaVerified}>
                <IconCheck className={styles.captchaCheckIcon} />
                {t('auth.humanVerified')}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
