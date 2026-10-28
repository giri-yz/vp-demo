import styles from './css/PlaceholderImage.module.css';

/**
 * Styled gradient placeholder used wherever the old static site had a real photo. No
 * photography assets exist in this project (see ProductCard's `imageUrl` fallback for the
 * same underlying constraint) — this keeps marketing pages honest instead of pointing
 * `<img>` tags at paths that don't resolve.
 */
export default function PlaceholderImage({
  icon = '🌿',
  label,
  aspect = '4 / 3',
  className,
}: {
  icon?: string;
  label?: string;
  aspect?: string;
  className?: string;
}) {
  return (
    <div className={`${styles.placeholder} ${className ?? ''}`} style={{ aspectRatio: aspect }}>
      <span className={styles.icon}>{icon}</span>
      {label && <span className={styles.label}>{label}</span>}
    </div>
  );
}
