import { motion } from 'framer-motion';
import styles from './css/ProgressBar.module.css';

export default function ProgressBar({ title, percent }: { title: string; percent: number }) {
  return (
    <div className={styles.item}>
      <div className={styles.head}>
        <h6 className={styles.title}>{title}</h6>
        <span className={styles.point}>{percent}%</span>
      </div>
      <div className={styles.track}>
        <motion.div
          className={styles.value}
          initial={{ width: 0 }}
          whileInView={{ width: `${percent}%` }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}
