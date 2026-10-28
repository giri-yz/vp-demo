import { useCallback, useEffect, useRef, useState } from 'react';
import { subscribeNewOrders, type NewOrdersNotice } from '../../utils/adminOrderToast';
import styles from './css/OrderToaster.module.css';

/* Feature A follow-up — pops a small "New order" card whenever a live-polling
   admin view announces a new purchase (see utils/adminOrderToast). One instance
   is mounted per dashboard shell (super + sub). Auto-dismisses after 6s;
   hovering/focusing pauses the timer; clicking closes it early. The container
   is an aria-live status region, so screen readers announce arrivals too. */

const AUTO_DISMISS_MS = 6000;
const MAX_VISIBLE = 3;

interface ToastItem extends NewOrdersNotice {
  key: number;
}

export default function OrderToaster() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const keyRef = useRef(0);
  const timersRef = useRef<Map<number, number>>(new Map());

  const clearTimer = useCallback((key: number) => {
    const t = timersRef.current.get(key);
    if (t !== undefined) {
      window.clearTimeout(t);
      timersRef.current.delete(key);
    }
  }, []);

  const dismiss = useCallback(
    (key: number) => {
      clearTimer(key);
      setToasts((prev) => prev.filter((t) => t.key !== key));
    },
    [clearTimer]
  );

  useEffect(() => {
    const unsubscribe = subscribeNewOrders((notice) => {
      const key = ++keyRef.current; // computed OUTSIDE the state updater (StrictMode-safe)
      setToasts((prev) => {
        // Stack is full → the oldest card (and its timer) goes
        if (prev.length >= MAX_VISIBLE) clearTimer(prev[0].key);
        return [...prev, { ...notice, key }].slice(-MAX_VISIBLE);
      });
      timersRef.current.set(key, window.setTimeout(() => dismiss(key), AUTO_DISMISS_MS));
    });
    const timers = timersRef.current;
    return () => {
      unsubscribe();
      for (const t of timers.values()) window.clearTimeout(t);
      timers.clear();
    };
  }, [dismiss, clearTimer]);

  if (toasts.length === 0) return null;

  const pause = (key: number) => clearTimer(key);
  const resume = (key: number) => {
    if (!timersRef.current.has(key)) {
      timersRef.current.set(key, window.setTimeout(() => dismiss(key), AUTO_DISMISS_MS));
    }
  };

  return (
    <div className={styles.toaster} role="status" aria-live="polite">
      {toasts.map((t) => (
        <button
          key={t.key}
          type="button"
          className={styles.toast}
          onClick={() => dismiss(t.key)}
          onMouseEnter={() => pause(t.key)}
          onMouseLeave={() => resume(t.key)}
          onFocus={() => pause(t.key)}
          onBlur={() => resume(t.key)}
        >
          <span className={styles.icon} aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
              <line x1="12" y1="13" x2="12" y2="16" />
            </svg>
          </span>
          <span className={styles.text}>
            <span className={styles.title}>
              {t.count === 1 ? 'New order received' : `${t.count} new orders received`}
            </span>
            <span className={styles.body}>{t.body}</span>
          </span>
          <span className={styles.pulse} aria-hidden="true" />
        </button>
      ))}
    </div>
  );
}
