import { Link, useParams } from 'react-router-dom';
import { IconLeaf, IconArrowRight, IconCheck } from '../../components/common/icons';
import { SERVICES } from './serviceData';
import NotFound from '../NotFound';
import { useLanguage } from '../../i18n/LanguageContext';
import styles from './css/ServiceDetails.module.css';

export default function ServiceDetails() {
  const { t } = useLanguage();
  const { slug } = useParams<{ slug: string }>();
  const service = SERVICES.find((s) => s.slug === slug);

  if (!service) return <NotFound />;

  return (
    <div className={styles.page}>
      {/* Mobile Header */}
      <div className={styles.mobileHeader}>
        <Link to="/service" className={styles.backBtn}>←</Link>
        <span className={styles.mobileHeaderTitle}>{service.title}</span>
        <Link to="/cart" className={styles.cartIcon}>🛒</Link>
      </div>

      {/* Desktop pg-banner */}
      <section className={styles.desktopBanner}>
        <div className={styles.desktopBannerInner}>
          <nav className={styles.breadcrumb}>
            <Link to="/">{t('shop.home')}</Link>
            <span className={styles.breadSep}>&rsaquo;</span>
            <Link to="/service">{t('service.breadcrumbServices')}</Link>
            <span className={styles.breadSep}>&rsaquo;</span>
            {service.title}
          </nav>
          <h1>{service.title}</h1>
          <p>{service.summary}</p>
        </div>
      </section>

      {/* Main Content */}
      <section className={styles.contentSection}>
        <div className={styles.contentWrap}>
          {/* Sidebar */}
          <aside className={styles.sidebar}>
            <div className={styles.sidebarCard}>
              <h3>{t('about.ourServices')}</h3>
              <nav className={styles.serviceNav}>
                {SERVICES.map((s) => (
                  <Link
                    key={s.slug}
                    to={`/service/${s.slug}`}
                    className={`${styles.navItem} ${s.slug === service.slug ? styles.navActive : ''}`}
                  >
                    <span className={styles.navIcon}>{s.icon}</span>
                    <span className={styles.navLabel}>{s.title}</span>
                    <IconArrowRight className={styles.navArrow} />
                  </Link>
                ))}
              </nav>
            </div>

            {/* CTA Card */}
            <div className={styles.sidebarCta}>
              <div className={styles.sidebarCtaOverlay} />
              <div className={styles.sidebarCtaContent}>
                <h4>{t('service.sidebarCta')}</h4>
                <Link to="/contact" className={styles.sidebarCtaBtn}>
                  {t('service.letsTalk')} <IconArrowRight />
                </Link>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className={styles.main}>
            {/* Hero Image */}
            {service.photo ? (
              <img src={service.photo} alt={service.title} className={styles.heroImg} />
            ) : (
              <div className={styles.heroImgPlaceholder}>
                <span className={styles.heroPlaceholderIcon}>{service.icon}</span>
              </div>
            )}

            <h2 className={styles.mainTitle}>{service.title}</h2>
            <p className={styles.mainSummary}>{service.summary}</p>

            {/* Feature Boxes */}
            <div className={styles.featureRow}>
              <div className={styles.featureBox}>
                <div className={styles.featureIconWrap}>
                  <IconLeaf />
                </div>
                <div>
                  <h4>{t('service.featureOrganic')}</h4>
                  <p>{t('service.featureOrganicDesc')}</p>
                </div>
              </div>
              <div className={styles.featureBox}>
                <div className={styles.featureIconWrap}>
                  <IconCheck />
                </div>
                <div>
                  <h4>{t('service.featureQuality')}</h4>
                  <p>{t('service.featureQualityDesc')}</p>
                </div>
              </div>
            </div>

            {/* Details */}
            <div className={styles.detailsCard}>
              <h3>{t('service.whatsIncluded')}</h3>
              <ul className={styles.detailList}>
                {service.details.map((d) => (
                  <li key={d}>
                    <span className={styles.checkIcon}>
                      <IconCheck />
                    </span>
                    {d}
                  </li>
                ))}
              </ul>
            </div>


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
