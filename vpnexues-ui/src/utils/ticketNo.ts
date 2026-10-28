/**
 * Display-only sequence numbers (TKVPN-000001, CUSVPN-000001 …).
 * Derived from the FULL fetched dataset ordered by createdAt ascending, so an
 * item keeps its number across status/search filters and across admin views.
 * This is presentation only — the backend id (UUID) stays the record key.
 * For truly gapless server-authoritative numbering, a *_no column +
 * backfill migration would be needed instead.
 */
export const TICKET_PREFIX = 'TKVPN';
export const CUSTOMER_PREFIX = 'CUSVPN';

export function formatSeqNo(prefix: string, seq: number): string {
  return `${prefix}-${String(seq).padStart(6, '0')}`;
}

export function formatTicketNo(seq: number): string {
  return formatSeqNo(TICKET_PREFIX, seq);
}

export function formatCustomerNo(seq: number): string {
  return formatSeqNo(CUSTOMER_PREFIX, seq);
}

export function buildSeqIndex<T extends { id: string; createdAt: string }>(
  rows: readonly T[],
  prefix: string,
): Map<string, string> {
  const ordered = [...rows].sort((a, b) =>
    a.createdAt < b.createdAt ? -1 : a.createdAt > b.createdAt ? 1 : a.id < b.id ? -1 : 1,
  );
  const index = new Map<string, string>();
  ordered.forEach((r, i) => {
    if (!index.has(r.id)) index.set(r.id, formatSeqNo(prefix, i + 1));
  });
  return index;
}

export function buildTicketIndex<T extends { id: string; createdAt: string }>(
  rows: readonly T[],
): Map<string, string> {
  return buildSeqIndex(rows, TICKET_PREFIX);
}

export function buildCustomerIndex<T extends { id: string; createdAt: string }>(
  rows: readonly T[],
): Map<string, string> {
  return buildSeqIndex(rows, CUSTOMER_PREFIX);
}

export function seqNo(index: Map<string, string>, id: string): string {
  return index.get(id) ?? id;
}

export function ticketNo(index: Map<string, string>, id: string): string {
  return seqNo(index, id);
}

export function customerNo(index: Map<string, string>, id: string): string {
  return seqNo(index, id);
}
