import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';

export type AuthModalTab = 'login' | 'signup';

interface OpenAuthModalOptions {
  tab?: AuthModalTab;
  /** Called once, right after a successful login/signup, before the modal closes. */
  onSuccess?: () => void;
}

interface AuthModalContextValue {
  isOpen: boolean;
  tab: AuthModalTab;
  openAuthModal: (opts?: OpenAuthModalOptions) => void;
  closeAuthModal: () => void;
  switchTab: (tab: AuthModalTab) => void;
  /** Called by the modal itself once auth succeeds — fires onSuccess, then closes. */
  notifySuccess: () => void;
}

const AuthModalContext = createContext<AuthModalContextValue | undefined>(undefined);

/**
 * Global "login/register" modal, replacing the old standalone /login page everywhere
 * (RequireAuth-guarded routes, the account nav icon, guest checkout) — the caller decides
 * what happens after a successful login via `onSuccess` instead of a `redirect` query param.
 */
export function AuthModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [tab, setTab] = useState<AuthModalTab>('login');
  const [onSuccess, setOnSuccess] = useState<(() => void) | undefined>(undefined);

  const openAuthModal = useCallback((opts?: OpenAuthModalOptions) => {
    setTab(opts?.tab ?? 'login');
    setOnSuccess(() => opts?.onSuccess);
    setIsOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setIsOpen(false);
    setOnSuccess(undefined);
  }, []);

  const switchTab = useCallback((next: AuthModalTab) => {
    setTab(next);
  }, []);

  const notifySuccess = useCallback(() => {
    setIsOpen(false);
    onSuccess?.();
    setOnSuccess(undefined);
  }, [onSuccess]);

  return (
    <AuthModalContext.Provider value={{ isOpen, tab, openAuthModal, closeAuthModal, switchTab, notifySuccess }}>
      {children}
    </AuthModalContext.Provider>
  );
}

export function useAuthModal(): AuthModalContextValue {
  const ctx = useContext(AuthModalContext);
  if (!ctx) throw new Error('useAuthModal must be used within AuthModalProvider');
  return ctx;
}
