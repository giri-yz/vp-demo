const STATUS_VARIANT: Record<string, 'success' | 'warning' | 'danger' | 'info'> = {
  // Orders
  DELIVERED: 'success',
  CONFIRMED: 'info',
  PLACED: 'info',
  PROCESSING: 'info',
  SHIPPED: 'info',
  CANCELLED: 'danger',
  // Inventory
  IN_STOCK: 'success',
  LOW_STOCK: 'warning',
  OUT_OF_STOCK: 'danger',
  // B2B enquiries
  ACCEPTED: 'success',
  PENDING: 'warning',
  IN_REVIEW: 'warning',
  DECLINED: 'danger',
  // Contact messages
  NEW: 'warning',
  READ: 'info',
  REPLIED: 'success',
  CLOSED: 'success',
};

/** Shared status→color mapping for admin tables (Orders/Inventory/B2B Enquiries/Contact Messages) — uses the global .badge-* classes from global.css, not a local CSS module. */
export default function StatusBadge({ status, plain }: { status: string; plain?: boolean }) {
  if (plain) {
    return <span style={{ fontSize: 13, color: '#15803D', fontWeight: 500 }}>{status.replaceAll('_', ' ').toLowerCase()}</span>;
  }
  const variant = STATUS_VARIANT[status] ?? 'info';
  return <span className={`badge badge-${variant}`}>{status.replaceAll('_', ' ')}</span>;
}
