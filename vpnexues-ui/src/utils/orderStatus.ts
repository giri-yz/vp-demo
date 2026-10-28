/**
 * Mirrors the backend OrderStatus state machine (OrderStatus.canTransitionTo).
 * Drawers offer ONLY the next allowed step — the backend still enforces it.
 * OUT_FOR_DELIVERY / PACKED / RETURNED are not real backend statuses.
 */
export const NEXT_ORDER_STATUS: Record<string, string> = {
  PLACED: 'CONFIRMED',
  CONFIRMED: 'PROCESSING',
  PROCESSING: 'SHIPPED',
  SHIPPED: 'DELIVERED',
};

export const NEXT_ORDER_ACTION_LABEL: Record<string, string> = {
  PLACED: 'Confirm Order',
  CONFIRMED: 'Start Processing',
  PROCESSING: 'Mark Shipped',
  SHIPPED: 'Mark Delivered',
};

/** Backend allows CANCELLED from these statuses only. */
export const CANCELLABLE_ORDER_STATUSES: ReadonlySet<string> = new Set([
  'PLACED',
  'CONFIRMED',
  'PROCESSING',
]);

/** Real backend lifecycle order. The backend stores no per-stage timestamps —
 *  only the order's createdAt (PLACED moment) is a real date. */
export const ORDER_STATUS_FLOW: readonly string[] = [
  'PLACED',
  'CONFIRMED',
  'PROCESSING',
  'SHIPPED',
  'DELIVERED',
];

/** Row-level advance button labels per current status. */
export const ROW_ADVANCE_LABEL: Record<string, string> = {
  PLACED: 'Confirm',
  CONFIRMED: 'Process',
  PROCESSING: 'Ship',
  SHIPPED: 'Deliver',
};
