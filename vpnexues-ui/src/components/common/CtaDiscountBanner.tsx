import { Link } from 'react-router-dom';
import { useLanguage } from '../../i18n/LanguageContext';
import styles from './css/CtaDiscountBanner.module.css';

/** Reused across About/History/Project/Service/Team-Details — matches the static site's cta-discount-section-4. */
export default function CtaDiscountBanner() {
  const { t } = useLanguage();
  return (
    <section className={styles.section}>
      <div className={`container ${styles.inner}`}>
        <div>
          <h2>{t('ctaDiscount.title')}</h2>
          <p>{t('ctaDiscount.desc')}</p>
        </div>
        <Link to="/shop" className="btn btn-gold">
          {t('ctaDiscount.shopNow')}
        </Link>
      </div>
    </section>
  );
}
