import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { AdminSession } from '../types';
import { getCurrentAdmin, login as apiLogin, logout as apiLogout } from '../api/adminAuthApi';
import { getDemoSession } from '../utils/adminScope';
import { setDemoMode } from '../api/httpClient';

interface AdminAuthContextValue {
  admin: AdminSession | null;
  loading: boolean;
  /** True when the session is a local demo session (backend unreachable). */
  isDemo: boolean;
  login: (email: string, password: string, passcode?: string) => Promise<AdminSession>;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextValue | undefined>(undefined);

const DEMO_STORAGE_KEY = 'vpnexues-demo-admin';

function readDemoSession(): AdminSession | null {
  try {
    const raw = sessionStorage.getItem(DEMO_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AdminSession;
    if (parsed && typeof parsed.email === 'string' && (parsed.role === 'ADMIN' || parsed.role === 'SUPER_ADMIN')) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

/** Dev-only offline fallback: never used in production builds, never on 401. */
function isNetworkFailure(err: unknown): boolean {
  return !!err && typeof err === 'object' && !('response' in err);
}

/**
 * Admin auth context backed by the server session (httpOnly cookie).
 * No identity data is stored in localStorage — demo sessions use sessionStorage only.
 */
export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<AdminSession | null>(null);
  const [isDemo, setIsDemo] = useState(false);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      // getCurrentAdmin returns null on 401/403 (after the httpClient has already
      // tried a token refresh + replay once), so "no session" is a normal outcome.
      const session = await getCurrentAdmin();
      if (session) {
        sessionStorage.removeItem(DEMO_STORAGE_KEY);
        setAdmin(session);
        setIsDemo(false);
        return;
      }
      const demo = readDemoSession();
      if (import.meta.env.DEV && demo) {
        setAdmin(demo);
        setIsDemo(true);
        return;
      }
      setAdmin(null);
      setIsDemo(false);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, password: string, passcode?: string) => {
    try {
      const session = await apiLogin(email, password, passcode);
      sessionStorage.removeItem(DEMO_STORAGE_KEY);
      setAdmin(session);
      setIsDemo(false);
      return session;
    } catch (err) {
      if (import.meta.env.DEV && isNetworkFailure(err)) {
        const demo = getDemoSession(email);
        if (demo) {
          sessionStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(demo));
          setAdmin(demo);
          setIsDemo(true);
          return demo;
        }
        throw new Error('Access Denied. No dashboard is assigned to this account. Please contact the Super Administrator.');
      }
      throw err;
    }
  }, []);

  useEffect(() => {
    // Validate the server session on mount (guards show "Loading..." until this
    // settles). Never pre-populate a demo/fake admin here — that used to render
    // the dashboard without a real cookie, so every API call failed with 403.
    refresh();
  }, [refresh]);

  useEffect(() => {
    setDemoMode(isDemo);
  }, [isDemo]);

  const logout = useCallback(async () => {
    try {
      await apiLogout();
    } catch {
      // Best effort: server session may already be gone; still clear locally.
    }
    sessionStorage.removeItem(DEMO_STORAGE_KEY);
    setAdmin(null);
    setIsDemo(false);
  }, []);

  return <AdminAuthContext.Provider value={{ admin, loading, isDemo, login, refresh, logout }}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth(): AdminAuthContextValue {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error('useAdminAuth must be used within AdminAuthProvider');
  return ctx;
}
