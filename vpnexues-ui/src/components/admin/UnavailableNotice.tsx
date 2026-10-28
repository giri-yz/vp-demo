import styles from './css/UnavailableNotice.module.css';

export default function UnavailableNotice({ title, detail }: { title: string; detail: string }) {
  return (
    <div className={styles.notice}>
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.detail}>{detail}</p>
    </div>
  );
}
