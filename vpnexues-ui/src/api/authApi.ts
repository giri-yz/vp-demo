import { signInWithPhoneNumber, type ConfirmationResult, type RecaptchaVerifier } from 'firebase/auth';
import { auth } from '../config/firebase';
import httpClient from './httpClient';
import type { User } from '../types';

let _confirmationResult: ConfirmationResult | null = null;
let _confirmationPhone: string | null = null;
/**
 * Set once Firebase `confirm()` succeeded but BEFORE the backend verify POST
 * runs. If that POST fails (Render cold start, Firebase JWKS warm-up), the
 * next "Verify" tap reuses this instead of asking Firebase to confirm a code
 * the user already consumed — the classic "first attempt fails, second works"
 * trap that used to strand users on "Session expired. Please resend OTP."
 */
let _confirmedSession: { phone: string; uid: string; idToken: string } | null = null;

/** Drop every piece of OTP state — called when the auth modal closes. */
export function resetOtpSession(): void {
  _confirmationResult = null;
  _confirmationPhone = null;
  _confirmedSession = null;
}

const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/**
 * Send OTP via Firebase Auth (phone).
 * Firebase handles SMS delivery via reCAPTCHA verification.
 */
export async function sendOtp(phone: string, appVerifier: RecaptchaVerifier): Promise<ConfirmationResult> {
  if (!auth) throw new Error('Firebase is not configured. Set VITE_FIREBASE_API_KEY.');
  const confirmationResult = await signInWithPhoneNumber(auth, phone, appVerifier);
  _confirmationResult = confirmationResult;
  _confirmationPhone = phone;
  _confirmedSession = null;
  return confirmationResult;
}

function errorCode(err: unknown): string {
  return (err as { code?: string })?.code ?? '';
}

function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}

/**
 * Firebase `confirm()` can fail transiently (network blip, internal error,
 * captcha-check race) while the code itself is still valid. Retry ONCE after
 * a short pause so the very first "Verify" tap succeeds more often. Definitive
 * answers (wrong code, expired code) are never retried.
 */
async function confirmWithRetry(confirmation: ConfirmationResult, code: string) {
  try {
    return await confirmation.confirm(code);
  } catch (err) {
    const c = errorCode(err);
    const msg = errorMessage(err);
    const transient =
      c === 'auth/internal-error' ||
      c === 'auth/network-request-failed' ||
      c === 'auth/captcha-check-failed' ||
      msg.includes('Failed to fetch') ||
      msg.includes('timeout');
    if (!transient) throw err;
    console.warn('[Firebase] confirm() failed transiently, retrying once:', c || msg);
    await delay(1200);
    return confirmation.confirm(code);
  }
}

/**
 * The backend verify POST is worth retrying once: Render's free instance cold
 * start and the first-time Firebase JWKS fetch both made the FIRST attempt
 * fail while the SECOND (seconds later, instance warm / JWKS cached) succeeded.
 */
function isRetryableVerifyError(err: unknown): boolean {
  const msg = errorMessage(err);
  if (msg.includes('timeout') || msg.includes('Network Error')) return true;
  const status =
    typeof err === 'object' && err !== null && 'response' in err
      ? (err as { response?: { status?: number } }).response?.status
      : undefined;
  if (status !== undefined && status >= 500) return true;
  const backendMessage =
    typeof err === 'object' && err !== null && 'response' in err
      ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
      : undefined;
  // JWKS not fetched yet on the server -> "Invalid Firebase session" once.
  return Boolean(backendMessage && backendMessage.includes('Invalid Firebase session'));
}

/**
 * Verify OTP via Firebase Auth, then sync user with backend.
 * `name` + `email` are required by the backend for brand-new users (signup);
 * omit them for returning-user login.
 */
export async function verifyOtp(phone: string, code: string, name?: string, email?: string): Promise<User> {
  let uid: string;
  let idToken: string;

  if (_confirmedSession && _confirmedSession.phone === phone) {
    // Firebase already accepted this code on a previous tap; only the backend
    // call failed. Skip straight to the backend retry.
    console.log('[Firebase] Reusing confirmed session for backend retry');
    uid = _confirmedSession.uid;
    idToken = _confirmedSession.idToken;
  } else {
    if (!_confirmationResult || _confirmationPhone !== phone) {
      // A confirmation for a DIFFERENT number must never verify this one —
      // that would create an account whose phone and Firebase UID disagree.
      resetOtpSession();
      throw new Error('No OTP confirmation pending. Please request a new code.');
    }
    console.log('[Firebase] Confirming OTP with confirmationResult...');
    const { user: firebaseUser } = await confirmWithRetry(_confirmationResult, code);
    _confirmationResult = null;
    _confirmationPhone = null;
    console.log('[Firebase] OTP confirmed');

    idToken = await firebaseUser.getIdToken();
    uid = firebaseUser.uid;
    _confirmedSession = { phone, uid, idToken };
  }

  console.log('[Firebase] Sending ID token to backend...');
  const body = { phone, code, name, email, firebaseUid: uid, accessToken: idToken };
  const post = () => httpClient.post<User>('/api/auth/otp/verify', body, { timeout: 45000 });

  let response;
  try {
    response = await post();
  } catch (err: unknown) {
    if (!isRetryableVerifyError(err)) throw err;
    console.warn('[Firebase] Backend verify failed transiently, retrying once:', errorMessage(err));
    await delay(900);
    response = await post();
  }

  resetOtpSession();
  console.log('[Firebase] Backend verify success');
  return response.data;
}

/**
 * Device-aware phone login.
 *
 * The backend only starts a session when the caller also presents the `vpx_dv`
 * cookie of a browser that already passed OTP (trusted device):
 * - `requiresOtp: false` + `user` — trusted device, session cookie is set.
 * - `requiresOtp: true` + `user: null` — registered number but a NEW device:
 *   no session yet; the caller must send a Firebase OTP and call `verifyOtp`,
 *   which then trusts this device for future passwordless logins.
 * - 404 — no account for this number (route to signup).
 *
 * Tolerates the pre-device-login backend response (a bare `UserDto` with no
 * `requiresOtp` key, session already issued) so this frontend can go live
 * before or after the backend deploy without breaking login.
 */
export interface LoginResult {
  requiresOtp: boolean;
  user: User | null;
}

interface LoginResponse {
  requiresOtp: boolean;
  user: User | null;
}

export async function loginByPhone(phone: string): Promise<LoginResult> {
  const post = () =>
    httpClient.post<LoginResponse | User>('/api/auth/login', { phone }, { timeout: 60000 });
  let data: LoginResponse | User;
  try {
    ({ data } = await post());
  } catch (err: unknown) {
    // Render's free instance sleeps after inactivity; the first request wakes
    // it and may time out (default 15s). One retry on the already-waking
    // instance turns "Login failed: timeout" into a normal login.
    const msg = err instanceof Error ? err.message : String(err);
    if (!msg.includes('timeout')) throw err;
    ({ data } = await post());
  }
  if (data && typeof data === 'object' && 'requiresOtp' in data) {
    const res = data as LoginResponse;
    return { requiresOtp: Boolean(res.requiresOtp), user: res.user ?? null };
  }
  // Old backend: a bare UserDto OBJECT means the session was already issued.
  // Never trust anything else — a string body (an HTML error page a CDN can
  // substitute for a failed API call) is truthy and would otherwise become the
  // "user", rendering the dashboard as "Guest User" with no real session.
  if (data && typeof data === 'object' && 'id' in data) {
    return { requiresOtp: false, user: data as User };
  }
  throw new Error('Unexpected login response');
}

/**
 * Returns current user or null when not logged in.
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    // Refresh the Firebase token only when a Firebase session exists. OTP-less
    // logins have no Firebase user at all — the `vpx_at` cookie alone proves
    // the session, and the backend accepts it directly.
    if (auth?.currentUser) {
      await auth.currentUser.getIdToken(true);
    }

    const { data } = await httpClient.get<User>('/api/auth/me', { timeout: 10000 });
    return data;
  } catch (err) {
    // ONLY a genuine 401 means "not logged in". Render cold starts (60-100s),
    // timeouts, 5xx and network failures must NOT wipe an existing session —
    // rethrow so AuthContext keeps the previous user and retries.
    const status = (err as { response?: { status?: number } })?.response?.status;
    if (status === 401) return null;
    throw err;
  }
}

export async function getIdToken(): Promise<string | null> {
  try {
    if (!auth) return null;
    const firebaseUser = auth.currentUser;
    if (!firebaseUser) return null;
    return await firebaseUser.getIdToken();
  } catch {
    return null;
  }
}

export async function logout(): Promise<void> {
  try {
    if (auth) await auth.signOut();
  } catch {
    // Firebase may be unavailable
  }
  try {
    await httpClient.post('/api/auth/logout');
  } catch {
    // Backend may be unavailable
  }
}

export async function deleteAccount(): Promise<void> {
  await httpClient.delete('/api/account');
}
