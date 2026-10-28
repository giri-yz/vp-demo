import styles from './TrustBanner.module.css';

const TRUST_ITEMS = [
  {
    title: '100% fresh',
    subtitle: 'Carefully selected',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#14532D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49 4.49 0 0 0 8 20c4 0 8.5-3 9.5-7" />
        <path d="M17 8c.5-1.5 1-3 1-5 0 0-1.5 0-3 1" />
        <circle cx="17" cy="8" r="1" fill="#14532D" />
      </svg>
    ),
  },
  {
    title: 'Quality assured',
    subtitle: 'Checked with care',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#14532D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <polyline points="9 12 11 14 15 10" />
      </svg>
    ),
  },
  {
    title: 'On-time delivery',
    subtitle: 'Freshness on schedule',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#14532D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
  {
    title: 'Trusted by business',
    subtitle: 'Supply you can plan',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#14532D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    title: 'Great support',
    subtitle: 'People who listen',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#14532D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
        <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
      </svg>
    ),
  },
];

export default function TrustBanner() {
  return (
    <div className={styles.banner}>
      {TRUST_ITEMS.map((item) => (
        <div key={item.title} className={styles.item}>
          <div className={styles.icon}>{item.icon}</div>
          <div className={styles.title}>{item.title}</div>
          <div className={styles.subtitle}>{item.subtitle}</div>
        </div>
      ))}
    </div>
  );
}
