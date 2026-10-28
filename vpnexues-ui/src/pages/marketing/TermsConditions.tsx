import { Link } from 'react-router-dom';
import { useLanguage } from '../../i18n/LanguageContext';
import styles from './css/Legal.module.css';

type LegalSection = { title: string; body: string };

export default function TermsConditions() {
  const { t, tRaw } = useLanguage();
  const raw = tRaw('terms.sections');
  const sections: LegalSection[] = Array.isArray(raw) ? raw as LegalSection[] : [];

  return (
    <div>
      {/* Banner — mobile + desktop */}
      <section className={styles.banner}>
        <div className={styles.bannerInner}>
          <div className={styles.breadcrumb}>
            <Link to="/">{t('terms.breadcrumbHome')}</Link> <span>&rsaquo;</span> {t('terms.title')}
          </div>
          <h1>&#128220; {t('terms.title')}</h1>
          <p>{t('terms.bannerDesc')}</p>
          <span className={styles.bannerMeta}>{t('terms.bannerMeta')}</span>
        </div>
      </section>

      {/* Content */}
      <section className={styles.section}>
        <div className="container">
          <article className={styles.card}>
            <h1 className={styles.docTitle}>{t('terms.title')}</h1>
            <p className={styles.docMeta}>{t('terms.docMeta')}</p>
            <p className={styles.docApplies}>{t('terms.docApplies')}</p>

            {sections.map((sec, i) => (
              <div key={i} className={styles.legalSection}>
                <h2>{i + 1}. {sec.title}</h2>
                <div dangerouslySetInnerHTML={{ __html: sec.body }} />
              </div>
            ))}

            <div className={styles.docFooter}>
              {t('terms.footerPrefix')} <Link to="/privacy">{t('terms.footerLink')}</Link> {t('terms.footerSuffix')}
            </div>
          </article>
        </div>
      </section>
    </div>
  );
}
