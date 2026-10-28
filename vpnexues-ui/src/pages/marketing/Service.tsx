import { Link } from 'react-router-dom';
import { IconLeaf, IconArrowRight, IconMapPin, IconPackage, IconShieldCheck, IconCart } from '../../components/common/icons';
import { SERVICES } from './serviceData';
import { useLanguage } from '../../i18n/LanguageContext';
import styles from './css/Service.module.css';

const SERVICE_ICONS: Record<string, string> = {
  'grocery-delivery': '🥬',
  'small-box': '📦',
  'big-box': '🛒',
  'b2b-supply': '🏢',
  'store-pickup': '📍',
  'gift-boxes': '🎁',
  'organic-certification': '🌱',
  'easy-returns': '🔄',
};

function ServiceCardIcon({ slug }: { slug: string }) {
  switch (slug) {
    case 'store-pickup':
      return <IconMapPin className={styles.placeholderSvgIcon} />;
    case 'gift-boxes':
      return <IconPackage className={styles.placeholderSvgIcon} />;
    case 'organic-certification':
      return <IconShieldCheck className={styles.placeholderSvgIcon} />;
    case 'easy-returns':
      return <IconCart className={styles.placeholderSvgIcon} />;
    default:
      return <IconLeaf className={styles.placeholderSvgIcon} />;
  }
}

export default function Service() {
  const { t } = useLanguage();
  return (
    <div className={styles.page}>
      {/* Mobile Hero */}
      <section className={styles.mobileHero}>
        <div className={styles.heroIcon}>🚜</div>
        <h1 className={styles.heroTitle}>{t('about.ourServices')}</h1>
        <p className={styles.heroSubtitle}>{t('service.heroSubtitle')}</p>
      </section>

      {/* Desktop pg-banner */}
      <section className={styles.desktopBanner}>
        <div className={styles.desktopBannerInner}>
          <nav className={styles.breadcrumb}>
            <Link to="/">{t('shop.home')}</Link>
            <span className={styles.breadSep}>&rsaquo;</span>
            {t('service.breadcrumbServices')}
          </nav>
          <div className={styles.bannerContent}>
            <div className={styles.bannerIcon}>🚜</div>
            <h1>{t('about.ourServices')}</h1>
            <p>{t('service.heroSubtitle')}</p>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className={styles.gridSection}>
        <div className={styles.gridWrap}>
          <div className={styles.grid}>
            {SERVICES.map((s) => (
              <Link key={s.slug} to={`/service/${s.slug}`} className={styles.card}>
                {s.photo ? (
                  <img src={s.photo} alt={s.title} className={styles.cardImg} />
                ) : (
                  <div className={styles.cardImgPlaceholder}>
                    <ServiceCardIcon slug={s.slug} />
                  </div>
                )}
                <div className={styles.cardBody}>
                  <div className={styles.cardIconBadge}>
                    <span>{SERVICE_ICONS[s.slug] ?? s.icon}</span>
                  </div>
                  <h3 className={styles.cardTitle}>{s.title}</h3>
                  <p className={styles.cardDesc}>{s.summary}</p>
                  <span className={styles.cardLink}>
                    {t('home.learnMore')} <IconArrowRight />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.cta}>
        <div className={styles.ctaInner}>
          <IconLeaf className={styles.ctaLeaf} />
          <h2>{t('service.ctaTitle')}</h2>
          <Link to="/shop" className={styles.ctaBtn}>
            {t('header.shopNow')} <IconArrowRight />
          </Link>
        </div>
      </section>
    </div>
  );
}
