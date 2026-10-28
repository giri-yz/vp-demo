import axios, { type AxiosRequestConfig } from 'axios';
import { auth } from '../config/firebase';
import { API_BASE_URL } from '../config/appConfig';

/** Set by AdminAuthContext when the session is a local demo (backend unreachable). */
let _isDemo = false;
export function setDemoMode(on: boolean) { _isDemo = on; }

const httpClient = axios.create({
  // '' keeps the dev Vite proxy (/api -> :8080); set VITE_API_BASE_URL to hit
  // the backend directly (its CORS must then allow the frontend origin).
  baseURL: API_BASE_URL || undefined,
  withCredentials: true,
  // Render cold starts take 2-6s; 10s was aborting cart sync during warm-up.
  timeout: 15000,
});

let _cachedToken: string | null = null;
let _tokenRefreshedAt = 0;
const TOKEN_CACHE_TTL_MS = 30_000;

async function getFirebaseToken(): Promise<string | null> {
  const now = Date.now();
  if (now - _tokenRefreshedAt < TOKEN_CACHE_TTL_MS) {
    // never serve a cached token after sign-out / account switch
    return auth?.currentUser ? _cachedToken : null;
  }
  try {
    if (!auth) return null;
    const firebaseUser = auth.currentUser;
    if (!firebaseUser) {
      _cachedToken = null;
      return null;
    }
    _cachedToken = await firebaseUser.getIdToken();
    _tokenRefreshedAt = now;
    return _cachedToken;
  } catch {
    return null;
  }
}

export function invalidateAuthToken(): void {
  _cachedToken = null;
  _tokenRefreshedAt = 0;
}

httpClient.interceptors.request.use(async (config) => {
  if (_isDemo) return config;

  const token = await getFirebaseToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

/**
 * Admin access cookies live only 30 minutes. On any admin 401/403 we try the
 * refresh endpoint once (it rotates the refresh cookie and issues a fresh
 * access cookie), then replay the original request. Without this, every admin
 * screen dies with "Could not load dashboard data." half an hour after login.
 */
let _refreshing: Promise<boolean> | null = null;
function refreshAdminSession(): Promise<boolean> {
  if (!_refreshing) {
    _refreshing = httpClient
      .post('/api/admin/auth/refresh')
      .then(() => true)
      .catch(() => false)
      .finally(() => {
        _refreshing = null;
      });
  }
  return _refreshing;
}

httpClient.interceptors.response.use(
  (response) => {
    // CloudFront used to remap API 403/404 -> /index.html with status 200, so a
    // "successful" response could actually be an HTML page. Trusting it once made
    // an HTML string the "user" (Guest dashboard). Any HTML body on an API call
    // is always an infrastructure error — reject loudly instead of returning data.
    const contentType = String(response.headers?.['content-type'] ?? '');
    if (
      typeof response.data === 'string' &&
      (contentType.includes('text/html') || /^\s*<(!doctype|html)/i.test(response.data))
    ) {
      return Promise.reject(new Error('Unexpected HTML response from API'));
    }
    return response;
  },
  async (error) => {
    const cfg = error.config as
      | (AxiosRequestConfig & { url?: string; _retried?: boolean })
      | undefined;
    const status = error.response?.status as number | undefined;
    const isAdminApi =
      typeof cfg?.url === 'string' &&
      cfg.url.startsWith('/api/admin') &&
      !cfg.url.startsWith('/api/admin/auth/refresh') &&
      !cfg.url.startsWith('/api/admin/auth/login');

    if (!_isDemo && isAdminApi && (status === 401 || status === 403) && !cfg?._retried) {
      if (cfg) cfg._retried = true;
      if (await refreshAdminSession()) {
        return httpClient.request(cfg as AxiosRequestConfig);
      }
    }
    return Promise.reject(error);
  }
);

export default httpClient;
