import { useEffect, useRef, useState } from 'react';

export type LivePollStatus = 'live' | 'reconnecting' | 'paused';

export interface LivePollState {
  /** 'live' = last refresh ok · 'reconnecting' = API failing (backing off) · 'paused' = disabled or tab hidden */
  status: LivePollStatus;
  /** consecutive failed refreshes (0 while healthy) */
  retryCount: number;
  /** epoch ms of the next scheduled refresh (null while paused/disabled) */
  nextAt: number | null;
  /** run a refresh right now (wired to the badge's Retry button) */
  retryNow: () => void;
}

interface Options {
  /** gap between one refresh settling and the next starting; default 10s */
  intervalMs?: number;
  /** pause the whole loop (e.g. while a sibling view is the one polling) */
  enabled?: boolean;
  /** ceiling for the exponential error back-off; default 60s */
  maxBackoffMs?: number;
}

/**
 * Feature A — shared live-refresh loop for admin order/counter panels.
 *
 * Mechanics:
 * - Sequential setTimeout chain: the next tick is scheduled only AFTER the
 *   task settles, so two refreshes can never overlap.
 * - Pauses while the tab is hidden (document.hidden) and refreshes the moment
 *   the admin returns (visibilitychange).
 * - On failure the gap backs off 10s → 20s → 40s → 60s (cap) and the state
 *   flips to 'reconnecting' so the UI can show the Live/Reconnecting badge.
 * - The task runs through a ref, so callers can pass an inline closure (fresh
 *   filters/page every render) without re-subscribing the loop each render.
 * - No immediate run on mount: the view's own mount effect owns the first
 *   load; the first live poll lands one interval later.
 */
export function useLivePoll(
  task: () => void | Promise<void>,
  { intervalMs = 10_000, enabled = true, maxBackoffMs = 60_000 }: Options = {},
): LivePollState {
  const taskRef = useRef(task);
  taskRef.current = task; // always run the latest closure (filters, page...)
  const retryNowRef = useRef<() => void>(() => {});

  const [status, setStatus] = useState<LivePollStatus>('live');
  const [retryCount, setRetryCount] = useState(0);
  const [nextAt, setNextAt] = useState<number | null>(null);

  const timerRef = useRef<number | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    const clearTimer = () => {
      if (timerRef.current != null) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };

    if (!enabled) {
      clearTimer();
      retryNowRef.current = () => {};
      setStatus('paused');
      setNextAt(null);
      return () => {
        mountedRef.current = false;
        clearTimer();
      };
    }

    let fails = 0;

    const schedule = (delay: number) => {
      clearTimer();
      if (!mountedRef.current) return;
      setNextAt(Date.now() + delay);
      timerRef.current = window.setTimeout(() => {
        timerRef.current = null;
        void run();
      }, delay);
    };

    const run = async () => {
      if (document.hidden) {
        // Tab in the background — skip the fetch, re-check at the normal cadence.
        if (mountedRef.current) {
          setStatus('paused');
          setNextAt(null);
        }
        schedule(intervalMs);
        return;
      }
      try {
        await taskRef.current();
        fails = 0;
        if (!mountedRef.current) return;
        setRetryCount(0);
        setStatus('live');
        schedule(intervalMs);
      } catch {
        fails += 1;
        if (!mountedRef.current) return;
        setRetryCount(fails);
        setStatus('reconnecting');
        schedule(Math.min(intervalMs * 2 ** fails, maxBackoffMs));
      }
    };

    retryNowRef.current = () => {
      clearTimer();
      void run();
    };

    const onVisibility = () => {
      // Back on screen → refresh immediately instead of waiting out the timer.
      if (!document.hidden && mountedRef.current) {
        clearTimer();
        void run();
      }
    };
    document.addEventListener('visibilitychange', onVisibility);

    schedule(intervalMs);

    return () => {
      mountedRef.current = false;
      clearTimer();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [enabled, intervalMs, maxBackoffMs]);

  return {
    status,
    retryCount,
    nextAt,
    retryNow: () => retryNowRef.current(),
  };
}
