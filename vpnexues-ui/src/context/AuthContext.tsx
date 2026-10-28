import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../config/firebase';
import type { User } from '../types';
import * as authApi from '../api/authApi';
import { clearCart } from '../api/cartApi';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  refresh: () => Promise<void>;
  setUser: (user: User | null) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const current = await authApi.getCurrentUser();
      setUserState(current);
    } catch {
      // Transport failure (cold start / timeout / 5xx) — NOT a logout. Retry
      // inline so `loading` stays true meanwhile and the previous user is kept
      // on a second failure (the old setTimeout retry could never run because
      // getCurrentUser used to swallow every error and return null).
      try {
        const r = await authApi.getCurrentUser();
        setUserState(r);
      } catch {
        // still unreachable — keep whatever state we already had
      }
    }
  }, []);

  useEffect(() => {
    if (!auth) {
      // Firebase may be unconfigured, but an OTP-less login session can still
      // live in the httpOnly `vpx_at` cookie — try it before giving up.
      refresh();
      setLoading(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, async () => {
      // Also runs when there is NO Firebase user: an OTP-less login never creates
      // a Firebase session, so the cookie is the only thing that can restore it.
      await refresh();
      setLoading(false);
    });

    return () => unsubscribe();
  }, [refresh]);

  const setUser = useCallback((next: User | null) => {
    setUserState(next);
  }, []);

  const logout = useCallback(async () => {
    window.dispatchEvent(new Event('auth:logout'));
    localStorage.removeItem('vpnexues-guest-addresses');
    localStorage.removeItem('vpnexues_orders');
    localStorage.removeItem('vpnexues_coupon');
    localStorage.removeItem('vpnexues_placed_orders'); // QA-06: purge stored orders on logout
    // QA-25: locally-stored blog comments carry the commenter's name — sweep them on logout.
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const k = localStorage.key(i);
      if (k && k.startsWith('blog-comments-')) localStorage.removeItem(k);
    }
    try { await clearCart(); } catch { /* ignore */ }
    await authApi.logout();
    setUserState(null);
    window.location.href = '/';
  }, []);

  return <AuthContext.Provider value={{ user, loading, refresh, setUser, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
