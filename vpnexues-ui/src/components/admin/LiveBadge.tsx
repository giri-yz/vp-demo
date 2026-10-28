import { useEffect, useState } from 'react';
import type { LivePollState } from '../../../hooks/useLivePoll';
import styles from './css/LiveBadge.module.css';

interface Props {
  live: LivePollState;
  /** 'onDark' = glassy pill for the dark-green banners; 'light' (default) for light panels */
  variant?: 'light' | 'onDark';
}

/**
 * Feature A — Live/Reconnecting pill for admin order surfaces.
 * Healthy: pulsing dot + "Live" + seconds-to-next-refresh. Failing: amber
 * "Reconnecting… (×N)" + a manual Retry button. The 1s countdown tick lives
 * inside this component so the host view doesn't re-render every second.
 */
export default function LiveBadge({ live, variant = 'light' }: Props) {
  const { status, retryCount, nextAt, retryNow } = live;
  const [, setTick] = useState(0);

  useEffect(() => {
    if (status !== 'live' || nextAt == null) return;
    const id = window.setInterval(() => setTick((t) => t + 1), 1000);
    return () => window.clearInterval(id);
  }, [status, nextAt]);

  if (status === 'paused') return null;

  if (status === 'reconnecting') {
    return (
      <span
        className={`${styles.badge} ${styles.reconnecting} ${variant === 'onDark' ? styles.onDark : ''}`}
        role="status"
        aria-live="polite"
      >
        <span className={styles.dot} />
        <span className={styles.label}>Reconnecting…{retryCount > 0 ? ` (×${retryCount})` : ''}</span>
        <button type="button" className={styles.retryBtn} onClick={retryNow}>Retry</button>
      </span>
    );
  }

  const secs = nextAt != null ? Math.max(0, Math.ceil((nextAt - Date.now()) / 1000)) : 0;
  return (
    <span
      className={`${styles.badge} ${variant === 'onDark' ? styles.onDark : ''}`}
      role="status"
      aria-live="polite"
    >
      <span className={`${styles.dot} ${styles.dotPulse}`} />
      <span className={styles.label}>Live</span>
      <span className={styles.countdown}>{secs}s</span>
    </span>
  );
}
