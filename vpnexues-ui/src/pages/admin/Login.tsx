import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { getAdminHome, isAllowedRedirect } from '../../utils/adminScope';
import { getErrorMessage } from '../../utils/errors';
import styles from './css/Login.module.css';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function AdminLogin() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { admin, login } = useAdminAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  /** Feature B — one-time access pass (desktop form only; see UI-CHANGE-RULES.md). */
  const [passcode, setPasscode] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [showPwM, setShowPwM] = useState(false);
  const [msg, setMsg] = useState({ text: '', type: '' });
  const [msgM, setMsgM] = useState({ text: '', type: '' });
  const [emailErr, setEmailErr] = useState('');
  const [emailErrM, setEmailErrM] = useState('');
  const [busy, setBusy] = useState(false);
  const [showMobileLogin, setShowMobileLogin] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  // Set by performLogin for each successful login. Left empty on purpose: the
  // destination is resolved from the signed-in admin (getAdminHome) rather than
  // defaulting everyone to the super-admin entrance.
  const [pendingRedirect, setPendingRedirect] = useState('');
  const [navigating, setNavigating] = useState(false);

  const doNavigate = useCallback((path: string) => navigate(path, { replace: true }), [navigate]);

  // Auto-redirect only for a pre-existing session (not right after a fresh
  // login — the welcome screen owns navigation in that case).
  useEffect(() => {
    if (admin && !showWelcome) {
      const redirect = searchParams.get('redirect');
      doNavigate(redirect && isAllowedRedirect(admin, redirect) ? redirect : getAdminHome(admin));
    }
  }, [admin, showWelcome, searchParams, doNavigate]);

  function showMsg(text: string, type: string) {
    setMsg({ text, type });
    setBusy(false);
  }

  function showMsgM(text: string, type: string) {
    setMsgM({ text, type });
    setBusy(false);
  }

  // Shared server-side login; show is the per-form error renderer.
  // `code` is Feature B's one-time access pass — both the desktop and mobile forms
  // carry the field; the Super Admin simply leaves it blank.
  async function performLogin(emailVal: string, pw: string, show: (text: string, type: string) => void, code?: string) {
    setBusy(true);
    try {
      const session = await login(emailVal, pw, code);
      const redirect = searchParams.get('redirect');
      setPendingRedirect(redirect && isAllowedRedirect(session, redirect) ? redirect : getAdminHome(session));
      setBusy(false);
      setShowWelcome(true);
    } catch (err) {
      show(
        getErrorMessage(err, 'Access Denied. No dashboard is assigned to this account. Please contact the Super Administrator.'),
        'error',
      );
    }
  }

  // Desktop login (legacy: lines 314-339)
  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    const emailVal = email.toLowerCase().trim();
    const pw = password;
    setMsg({ text: '', type: '' });
    setEmailErr('');

    if (!emailVal || !pw) {
      showMsg('Please enter email and password', 'error');
      return;
    }

    if (!EMAIL_RE.test(emailVal)) {
      setEmailErr('Invalid email address');
      return;
    }

    // Deliberately not blocking on an empty pass: the Super Admin signs in with the
    // password alone, and the backend gives the precise error for gated accounts.
    void performLogin(emailVal, pw, showMsg, passcode);
  }

  // Mobile login (legacy: lines 340-365)
  function handleLoginM(e: React.FormEvent) {
    e.preventDefault();
    const emailVal = email.toLowerCase().trim();
    const pw = password;
    setMsgM({ text: '', type: '' });
    setEmailErrM('');

    if (!emailVal || !pw) {
      showMsgM('Please enter email and password', 'error');
      return;
    }

    if (!EMAIL_RE.test(emailVal)) {
      setEmailErrM('Invalid email address');
      return;
    }

    void performLogin(emailVal, pw, showMsgM, passcode);
  }

  // Welcome screen → go to dashboard (legacy: lines 388-390)
  function goToDashboard() {
    setNavigating(true);
  }

  useEffect(() => {
    if (navigating) {
      // pendingRedirect is set by performLogin on success; the fallback resolves
      // the signed-in admin's own home so no role inherits the super-admin entrance.
      const target = pendingRedirect || (admin ? getAdminHome(admin) : '/admin/login');
      const t = setTimeout(() => doNavigate(target), 400);
      return () => clearTimeout(t);
    }
  }, [navigating, pendingRedirect, admin, doNavigate]);

  return (
      <div className={`${styles.wrap} ${navigating ? styles.pageFlipping : ''}`}>
      {/* LEFT PANEL (desktop) */}
      <div className={styles.leftPanel}>
        <img src="https://res.cloudinary.com/eqjshlur/image/upload/v1790002057/vpnexues/old/javascript-assets/delivery%20banner%201.png" alt="VPNexues" className={styles.lpBg} />
      </div>

      {/* MOBILE SPLASH (<=1024px) */}
      {!showMobileLogin && (
        <div className={styles.mobileSplash}>
          <img src="https://res.cloudinary.com/eqjshlur/image/upload/v1790002072/vpnexues/old/javascript-assets/delivery%20mobile%201.png" alt="VPNexues" className={styles.splashImg} />
          <div className={styles.splashOverlay}>
            <img src="https://res.cloudinary.com/eqjshlur/image/upload/v1790001831/vpnexues/old/site-assets/logo/vp-logo.svg" alt="VPNexues" className={styles.splashLogo} />
            <div className={styles.splashTitle}>VPNexues</div>
            <div className={styles.splashTagline}>விவசாயம் காப்போம்</div>
            <button className={styles.welcomeBtn} onClick={() => setShowMobileLogin(true)}>
              Welcome <i className="fas fa-arrow-right" />
            </button>
          </div>
        </div>
      )}

      {/* MOBILE LOGIN (<=1024px) */}
      <div className={`${styles.mobileLoginWrap} ${showMobileLogin ? styles.show : ''}`}>
        <button className={styles.mobileBackBtn} onClick={() => setShowMobileLogin(false)}>
          <i className="fas fa-arrow-left" /> Back
        </button>
        <div className={styles.loginForm}>
          <div className={styles.brand}>
            <img src="https://res.cloudinary.com/eqjshlur/image/upload/v1790001831/vpnexues/old/site-assets/logo/vp-logo.svg" alt="VPNexues" className={styles.brandLogo} />
            <div className={styles.brandText}>
              <h1>VPNexues</h1>
              <div className={styles.tagline}>விவசாயம் காப்போம்</div>
            </div>
          </div>
          <h2>Welcome Back</h2>
          <p className={styles.subtitle}>Sign in to access your dashboard</p>
          {msgM.text && (
            <div className={`${styles.msg} ${styles.show} ${styles[msgM.type] || ''}`}>
              <i className="fas fa-exclamation-circle" />
              <span>{msgM.text}</span>
            </div>
          )}
          <form onSubmit={handleLoginM}>
            <div className={styles.formGroup}>
              <label>Email Address</label>
              <div className={`${styles.inputWrap} ${emailErrM ? styles.inputError : ''}`}>
                <i className="fas fa-envelope icon" />
                <input
                  type="email"
                  placeholder="Enter your email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setEmailErrM(''); }}
                />
              </div>
              {emailErrM && <div className={styles.fieldError}>{emailErrM}</div>}
            </div>
            <div className={styles.formGroup}>
              <label>Password</label>
              <div className={styles.inputWrap}>
                <i className="fas fa-lock icon" />
                <input
                  type={showPwM ? 'text' : 'password'}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button type="button" className={styles.togglePw} onClick={() => setShowPwM(!showPwM)}>
                  <i className={showPwM ? 'fas fa-eye-slash' : 'fas fa-eye'} />
                </button>
              </div>
            </div>
            {/* Feature B — one-time access pass. Same field the desktop form shows. */}
            <div className={styles.formGroup}>
              <label>
                One-time access pass <span style={{ fontWeight: 400, opacity: 0.7 }}>· from your Super Admin</span>
              </label>
              <div className={styles.inputWrap}>
                <i className="fas fa-key icon" />
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="6-digit code"
                  autoComplete="one-time-code"
                  maxLength={12}
                  value={passcode}
                  onChange={(e) => {
                    setPasscode(e.target.value.replace(/\D/g, ''));
                    if (msgM.text) setMsgM({ text: '', type: '' });
                  }}
                  style={{ letterSpacing: '.3em' }}
                />
                {passcode && (
                  <button type="button" className={styles.togglePw} onClick={() => setPasscode('')} aria-label="Clear access pass">
                    <i className="fas fa-xmark" />
                  </button>
                )}
              </div>
              <div style={{ fontSize: 11.5, color: '#8A94A6', marginTop: 6 }}>
                Newer sub-admin accounts only — Super Admin and the original IN/USA/AE/SG admins can leave this blank.
              </div>
            </div>
            <button type="submit" className={styles.loginBtn} disabled={busy}>
              <i className="fas fa-right-to-bracket" /> Sign In
            </button>
          </form>
          <div className={styles.formFooter}>Contact Super Admin for account access</div>
        </div>
      </div>

      {/* RIGHT PANEL (desktop) */}
      <div className={styles.rightPanel}>
        <div className={styles.loginForm}>
          <div className={styles.brand}>
            <img src="https://res.cloudinary.com/eqjshlur/image/upload/v1790001831/vpnexues/old/site-assets/logo/vp-logo.svg" alt="VPNexues" className={styles.brandLogo} />
            <div className={styles.brandText}>
              <h1>VPNexues</h1>
              <div className={styles.tagline}>விவசாயம் காப்போம்</div>
            </div>
          </div>
          <h2>Welcome Back</h2>
          <p className={styles.subtitle}>Sign in to access your dashboard</p>
          {msg.text && (
            <div className={`${styles.msg} ${styles.show} ${styles[msg.type] || ''}`}>
              <i className="fas fa-exclamation-circle" />
              <span>{msg.text}</span>
            </div>
          )}
          <form onSubmit={handleLogin}>
            <div className={styles.formGroup}>
              <label>Email Address</label>
              <div className={`${styles.inputWrap} ${emailErr ? styles.inputError : ''}`}>
                <i className="fas fa-envelope icon" />
                <input
                  type="email"
                  placeholder="Enter your email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setEmailErr(''); }}
                />
              </div>
              {emailErr && <div className={styles.fieldError}>{emailErr}</div>}
            </div>
            <div className={styles.formGroup}>
              <label>Password</label>
              <div className={styles.inputWrap}>
                <i className="fas fa-lock icon" />
                <input
                  type={showPw ? 'text' : 'password'}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button type="button" className={styles.togglePw} onClick={() => setShowPw(!showPw)}>
                  <i className={showPw ? 'fas fa-eye-slash' : 'fas fa-eye'} />
                </button>
              </div>
            </div>
            {/* Feature B — one-time access pass. The mobile form above carries the same field. */}
            <div className={styles.formGroup}>
              <label>
                One-time access pass <span style={{ fontWeight: 400, opacity: 0.7 }}>· from your Super Admin</span>
              </label>
              <div className={styles.inputWrap}>
                <i className="fas fa-key icon" />
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="6-digit code"
                  autoComplete="one-time-code"
                  maxLength={12}
                  value={passcode}
                  onChange={(e) => {
                    setPasscode(e.target.value.replace(/\D/g, ''));
                    if (msg.text) setMsg({ text: '', type: '' });
                  }}
                  style={{ letterSpacing: '.3em' }}
                />
                {passcode && (
                  <button type="button" className={styles.togglePw} onClick={() => setPasscode('')} aria-label="Clear access pass">
                    <i className="fas fa-xmark" />
                  </button>
                )}
              </div>
              <div style={{ fontSize: 11.5, color: '#8A94A6', marginTop: 6 }}>
                Newer sub-admin accounts only — Super Admin and the original IN/USA/AE/SG admins can leave this blank.
              </div>
            </div>
            <button type="submit" className={styles.loginBtn} disabled={busy}>
              <i className="fas fa-right-to-bracket" /> Sign In
            </button>
          </form>
          <div className={styles.formFooter}>Contact Super Admin for account access</div>
        </div>
      </div>

      {/* WELCOME SCREEN (after login) */}
      <div className={`${styles.welcomeScreen} ${showWelcome ? styles.show : ''}`}>
        <img src="https://res.cloudinary.com/eqjshlur/image/upload/v1790002142/vpnexues/old/javascript-assets/Frontpage%20banner.jpg" alt="Welcome to VPNexues" />
        <button className={`${styles.welcomeScreenBtn} ${navigating ? styles.clicked : ''}`} onClick={goToDashboard} disabled={navigating}>
          Go to Dashboard <i className="fas fa-arrow-right" />
        </button>
      </div>
    </div>
  );
}
