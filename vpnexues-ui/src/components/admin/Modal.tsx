import type { ReactNode } from 'react';
import styles from './css/Modal.module.css';

export default function Modal({ title, onClose, children, size = 'default', headerDark = false }: { title: string; onClose: () => void; children: ReactNode; size?: 'default' | 'wide' | 'full'; headerDark?: boolean }) {
  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={`${styles.dialog} ${size === 'wide' ? styles.wide : size === 'full' ? styles.full : ''}`} onClick={(e) => e.stopPropagation()}>
        <div className={`${styles.header} ${headerDark ? styles.headerDark : ''}`}>
          <h2>{title}</h2>
          <button type="button" className={styles.close} onClick={onClose} aria-label="Close">
            &times;
          </button>
        </div>
        <div className={styles.body}>{children}</div>
      </div>
    </div>
  );
}
