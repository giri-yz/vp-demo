import PageHero from '../../components/common/PageHero';
import PlaceholderImage from '../../components/common/PlaceholderImage';
import GalleryStrip from '../../components/common/GalleryStrip';
import CtaDiscountBanner from '../../components/common/CtaDiscountBanner';
import { useLanguage } from '../../i18n/LanguageContext';
import styles from './css/Project.module.css';

export default function Project() {
  const { t } = useLanguage();

  const PROJECTS = [
    { icon: '🏗️', title: t('project.p1'), category: t('project.catInfrastructure'), year: '2025' },
    { icon: '🌾', title: t('project.p2'), category: t('project.catSourcing'), year: '2024' },
    { icon: '📱', title: t('project.p3'), category: t('project.catTechnology'), year: '2024' },
    { icon: '🚛', title: t('project.p4'), category: t('project.catSustainability'), year: '2023' },
    { icon: '🏪', title: t('project.p5'), category: t('project.catRetail'), year: '2023' },
    { icon: '♻️', title: t('project.p6'), category: t('project.catSustainability'), year: '2022' },
  ];

  return (
    <div>
      <PageHero title={t('project.title')} subtitle={t('project.subtitle')} />

      <section className={styles.section}>
        <div className={`container ${styles.grid}`}>
          {PROJECTS.map((p) => (
            <div key={p.title} className={`card ${styles.card}`}>
              <PlaceholderImage icon={p.icon} aspect="4 / 3" />
              <div className={styles.cardBody}>
                <span className="badge badge-primary">{p.category}</span>
                <h3>{p.title}</h3>
                <span className={styles.year}>{p.year}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <GalleryStrip title={t('project.projectsInPictures')} />

      <CtaDiscountBanner />
    </div>
  );
}
