import styles from './css/NewOrderMark.module.css';

/* Persistent "NEW" marker on admin order rows — the durable companion to the
   transient new-order toast (see utils/adminOrderToast.isNewSinceWatch for the
   marking rule). A bare <NewOrderMark /> is the row pill; pass `label` to use
   it as the "N new" counter chip next to a LiveBadge; `onDark` for green
   banners. */

export default function NewOrderMark({
  label = 'NEW',
  onDark = false,
}: {
  label?: string;
  onDark?: boolean;
}) {
  return <span className={`${styles.pill} ${onDark ? styles.onDark : ''}`}>{label}</span>;
}
