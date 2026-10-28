import PageHero from '../../components/common/PageHero';
import GalleryStrip from '../../components/common/GalleryStrip';
import CtaDiscountBanner from '../../components/common/CtaDiscountBanner';
import Reveal from '../../components/common/Reveal';
import { useLanguage } from '../../i18n/LanguageContext';
import styles from './css/History.module.css';

export default function History() {
  const { t } = useLanguage();

  const PROGRESS = [
    { label: t('history.customerSatisfaction'), percent: 98 },
    { label: t('history.onTimeDelivery'), percent: 95 },
    { label: t('history.repeatCustomers'), percent: 87 },
  ];

  const MILESTONES = [
    { year: '2016', text: t('history.milestone2016') },
    { year: '2018', text: t('history.milestone2018') },
    { year: '2022', text: t('history.milestone2022') },
    { year: '2025', text: t('history.milestone2025') },
  ];

  return (
    <div>
      <PageHero title={t('history.title')} subtitle={t('history.subtitle')} />

      <section className={styles.story}>
        <div className={`container ${styles.storyInner}`}>
          <Reveal className={styles.storyText}>
            <span className={styles.eyebrow}>{t('history.aboutCompany')}</span>
            <h2>{t('history.builtOnTrust')}</h2>
            <p>
              {t('history.storyBody')}
            </p>
            <div className={styles.progressList}>
              {PROGRESS.map((p) => (
                <div key={p.label} className={styles.progressItem}>
                  <div className={styles.progressLabel}>
                    <span>{p.label}</span>
                    <span>{p.percent}%</span>
                  </div>
                  <div className={styles.progressTrack}>
                    <div className={styles.progressFill} style={{ width: `${p.percent}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
          <img src="https://res.cloudinary.com/eqjshlur/image/upload/v1790001395/vpnexues/old/site-assets/about/choose-01.webp" alt="Our journey" className={styles.storyImage} />
        </div>
      </section>

      <section className={styles.timelineSection}>
        <div className="container">
          <h2 className={styles.sectionHead}>{t('history.title')}</h2>
          <Reveal className={styles.timeline}>
            {MILESTONES.map((m) => (
              <div key={m.year} className={`card ${styles.milestone}`}>
                <span className={styles.year}>{m.year}</span>
                <p>{m.text}</p>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      <GalleryStrip title={t('history.galleryTitle')} />

      <CtaDiscountBanner />
    </div>
  );
}
