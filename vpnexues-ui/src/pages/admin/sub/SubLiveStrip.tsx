import { useCallback, useEffect, useState } from 'react';
import { listPayments } from '../../../api/adminPaymentsApi';
import { listInventory } from '../../../api/adminInventoryApi';
import { listOrders } from '../../../api/adminOrdersApi';
import type { CountryConfig } from '../../../config/countryConfig';
import { useLivePoll } from '../../../hooks/useLivePoll';
import styles from './SubViews.module.css';

interface LiveEvent {
  time: string;
  text: string;
  highlight: string;
  severity?: 'low' | 'medium' | 'high';
}

export default function SubLiveStrip({ config }: { config: CountryConfig }) {
  const [events, setEvents] = useState<LiveEvent[]>([]);
  const [clock, setClock] = useState('--:--:--');
  const [tzAbbr, setTzAbbr] = useState('');

  useEffect(() => {
    const tick = () => {
      try {
        const now = new Date();
        setClock(
          now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true, timeZone: config.timezone }),
        );
        const tzParts = now.toLocaleTimeString('en-US', { timeZone: config.timezone, timeZoneName: 'short' }).split(' ');
        setTzAbbr(tzParts[tzParts.length - 1] ?? '');
      } catch {
        setClock(new Date().toLocaleTimeString());
      }
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [config.timezone]);

  /* Feature A — this strip advertises "Live Activity", so it must actually be
     live: re-fetch orders/inventory/payments on the shared 10s tick. A failed
     refresh keeps the previous events (initial state is already empty). */
  const load = useCallback(async () => {
    const [orders, inv, txns] = await Promise.all([
      listOrders({ country: config.code, size: 5 }),
      listInventory({}).catch(() => []),
      listPayments().catch(() => []),
    ]);
    const pendingTx = txns.filter((t) => t.country === config.code && t.status === 'pending').length;

    const now = new Date();
    const fmt = (d: Date) => d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: config.timezone });

    const evts: LiveEvent[] = [];
    orders.content.forEach((o) => {
      const t = new Date(o.createdAt); // real event time (was fabricated now - i*10min)
      evts.push({ time: fmt(t), text: 'New order', highlight: `${o.orderNumber} — ${o.status}`, severity: o.status === 'PLACED' ? 'medium' : undefined });
    });
    inv.filter((i) => i.status !== 'IN_STOCK').slice(0, 2).forEach((i) => {
      const t = now; // stock alerts are current-state, not backdated events
      evts.push({ time: fmt(t), text: `Low stock: ${i.productName}`, highlight: `(${i.quantity})`, severity: 'low' });
    });
    if (pendingTx > 0) {
      evts.push({ time: fmt(now), text: 'Pending payments:', highlight: String(pendingTx), severity: 'low' });
    }

    setEvents(evts);
  }, [config]);

  useEffect(() => {
    load().catch(() => { /* keep previous events */ });
  }, [load]);
  useLivePoll(load, { intervalMs: 10_000 });

  if (events.length === 0) return null;

  return (
    <div className={styles.liveStrip}>
      <span className={styles.liveDot} />
      <span className={styles.liveLabel}>
        <span className={styles.liveBolt}>⚡</span>
        Live Activity
      </span>
      <div className={styles.liveTrack}>
        <div className={styles.liveTrackInner}>
          {[...events, ...events].map((evt, i) => (
            <span key={i} className={styles.liveItem}>
              <span className={styles.liveItemTime}>{evt.time}</span>
              <span className={styles.liveItemText}>{evt.text}</span>
              <span className={`${styles.liveItemHighlight} ${evt.severity === 'low' ? styles.liveHigh : evt.severity === 'medium' ? styles.liveMed : ''}`}>
                {evt.highlight}
              </span>
            </span>
          ))}
        </div>
      </div>
      <span className={styles.liveClock}>
        {clock}
        {tzAbbr && <span className={styles.liveTzBadge}>{tzAbbr}</span>}
      </span>
    </div>
  );
}
