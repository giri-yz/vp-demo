import { Link } from 'react-router-dom';
import { useLanguage } from '../../i18n/LanguageContext';
import styles from './css/PageHero.module.css';

/** Shared hero banner for every Phase 4 marketing page — matches the static site's reused .{page}-hero-section shape. */
export default function PageHero({ title, subtitle }: { title: string; subtitle?: string }) {
  const { t } = useLanguage();
  return (
    <section className={styles.hero}>
      <div className="container">
        <nav className={styles.breadcrumb}>
          <Link to="/">{t('shop.home')}</Link> <span>/</span> <span>{title}</span>
        </nav>
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
    </section>
  );
}
