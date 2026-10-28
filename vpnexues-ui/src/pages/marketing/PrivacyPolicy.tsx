import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../../i18n/LanguageContext';
import styles from './css/Legal.module.css';

type LegalSection = { title: string; body: string };

export default function PrivacyPolicy() {
  const { t, tRaw } = useLanguage();
  const navigate = useNavigate();
  const raw = tRaw('privacy.sections');
  const sections: LegalSection[] = Array.isArray(raw) ? raw as LegalSection[] : [];

  return (
    <div>
      {/* Mobile Header — Shop-style sticky bar (back + logo), hidden on desktop */}
      <header className={styles.mobileHeader}>
        <button type="button" className={styles.backBtn} onClick={() => navigate(-1)} aria-label={t('common.goBack')}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>
        <Link to="/" className={styles.brand}>
          <img src="https://res.cloudinary.com/eqjshlur/image/upload/v1790001831/vpnexues/old/site-assets/logo/vp-logo.svg" alt="" className={styles.brandLogo} />
          <span className={styles.brandText}>
            <strong>VPNexues</strong>
            <small>விவசாயம் காப்போம்</small>
          </span>
        </Link>
        <div className={styles.headerSpacer} />
      </header>

      {/* Banner — mobile + desktop */}
      <section className={styles.banner}>
        <div className={styles.bannerInner}>
          <div className={styles.breadcrumb}>
            <Link to="/">{t('privacy.breadcrumbHome')}</Link> <span>&rsaquo;</span> {t('privacy.title')}
          </div>
          <h1>&#128274; {t('privacy.title')}</h1>
          <p>{t('privacy.bannerDesc')}</p>
          <span className={styles.bannerMeta}>{t('privacy.bannerMeta')}</span>
        </div>
      </section>

      {/* Content */}
      <section className={styles.section}>
        <div className="container">
          <article className={styles.card}>
            <h1 className={styles.docTitle}>{t('privacy.title')}</h1>
            <p className={styles.docMeta}>{t('privacy.docMeta')}</p>
            <p className={styles.docApplies}>{t('privacy.docApplies')}</p>

            {sections.map((sec, i) => (
              <div key={i} className={styles.legalSection}>
                <h2>{i + 1}. {sec.title}</h2>
                <div dangerouslySetInnerHTML={{ __html: sec.body }} />
              </div>
            ))}

            <div className={styles.docFooter}>
              {t('privacy.footerPrefix')} <Link to="/terms">{t('privacy.footerLink')}</Link> {t('privacy.footerSuffix')}
            </div>
          </article>
        </div>
      </section>
    </div>
  );
}
