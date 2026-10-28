/* ─── Feature A follow-up: "new order arrived" toast bus ─────────────────────
   Any live-polling admin view emits here when its 10s silent refresh sees
   order ids it never saw before; a single <OrderToaster /> per dashboard shell
   renders the popup. State lives on a window singleton so Vite HMR's dual
   module copies (dev) share one bus — same trick as whatsappPopup's store. */

import type { AdminOrderSummary } from '../types';

export interface NewOrdersNotice {
  /** how many genuinely-new orders this announcement covers */
  count: number;
  /** pre-formatted line, e.g. "Anees · ₹455" — built by the emitting view with
      its own currency formatting, so the toast and the rows always agree */
  body: string;
}

type Listener = (notice: NewOrdersNotice) => void;

interface ToastBus {
  listeners: Set<Listener>;
  /** order id -> epoch ms when it was announced (double-toast memory) */
  announced: Map<string, number>;
}

const ANNOUNCE_MEMORY_MS = 15 * 60_000;

function bus(): ToastBus {
  const w = window as unknown as { __vpxAdminToastBus?: ToastBus };
  if (!w.__vpxAdminToastBus) {
    w.__vpxAdminToastBus = { listeners: new Set(), announced: new Map() };
  }
  return w.__vpxAdminToastBus;
}

export function subscribeNewOrders(cb: Listener): () => void {
  const b = bus();
  b.listeners.add(cb);
  return () => {
    b.listeners.delete(cb);
  };
}

/** Ids present in `next` that were not in the caller's previous snapshot.
    Views keep the snapshot in a ref and update it on EVERY load (silent or
    not) — so filter switches and remounts rebase the diff instead of toasting. */
export function findNewOrders(prevIds: Set<string>, next: AdminOrderSummary[]): AdminOrderSummary[] {
  return next.filter((o) => !prevIds.has(o.id));
}

/** Announce newly arrived orders. Each order id is announced at most once per
    15 minutes, so a view remount, a country/filter switch, or a second polling
    surface can never double-toast the same purchase. */
export function notifyNewOrders(
  newOrders: AdminOrderSummary[],
  formatBody: (fresh: AdminOrderSummary[]) => string
): void {
  if (newOrders.length === 0) return;
  const b = bus();
  const now = Date.now();
  for (const [id, at] of b.announced) {
    if (now - at > ANNOUNCE_MEMORY_MS) b.announced.delete(id);
  }
  const fresh = newOrders.filter((o) => !b.announced.has(o.id));
  if (fresh.length === 0) return;
  for (const o of fresh) b.announced.set(o.id, now);
  const notice: NewOrdersNotice = { count: fresh.length, body: formatBody(fresh) };
  for (const listener of [...b.listeners]) {
    try {
      listener(notice);
    } catch {
      /* one broken listener must never kill the polling tick */
    }
  }
}

const FRESH_WINDOW_MS = 24 * 60 * 60_000;

/** Persistent row-marker rule (companion to the transient toast): an order is
    "new" when it arrived during this admin session OR within the last 24 hours —
    the window also covers purchases made just before the page was opened, which
    never produce a toast. */
export function isNewSinceWatch(
  orderId: string,
  createdAt: string,
  sessionNewIds: Set<string>,
  now = Date.now()
): boolean {
  if (sessionNewIds.has(orderId)) return true;
  const t = new Date(createdAt).getTime();
  return Number.isFinite(t) && now - t < FRESH_WINDOW_MS;
}
