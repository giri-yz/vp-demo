import type { ReactNode } from 'react';
import styles from './css/SideDrawer.module.css';

interface SideDrawerProps {
  title: string;
  onClose: () => void;
  children: ReactNode;
  width?: number;
}

export default function SideDrawer({ title, onClose, children, width = 480 }: SideDrawerProps) {
  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.drawer} style={{ width }} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>{title}</h2>
          <button type="button" className={styles.close} onClick={onClose} aria-label="Close">
            &times;
          </button>
        </div>
        <div className={styles.body}>{children}</div>
      </div>
    </div>
  );
}
