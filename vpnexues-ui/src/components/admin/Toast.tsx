import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import styles from './css/Toast.module.css';

interface ToastItem {
  id: number;
  message: string;
  kind: 'success' | 'error';
}

interface ToastContextValue {
  notify: (message: string, kind?: 'success' | 'error') => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

let nextId = 1;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const notify = useCallback((message: string, kind: 'success' | 'error' = 'success') => {
    const id = nextId++;
    setItems((prev) => [...prev, { id, message, kind }]);
    setTimeout(() => {
      setItems((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  return (
    <ToastContext.Provider value={{ notify }}>
      {children}
      <div className={styles.container}>
        {items.map((t) => (
          <div key={t.id} className={`${styles.toast} ${t.kind === 'success' ? styles.success : styles.error}`}>
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
