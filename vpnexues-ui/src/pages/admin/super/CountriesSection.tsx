import SubAdminsView from './SubAdminsView';
import styles from '../css/SuperAdminDashboard.module.css';
import csStyles from '../css/CountriesSection.module.css';
import ScrollReveal from '../../../components/admin/ScrollReveal';

/** Legacy "Countries & Sub Admins" combined view — countries tab hidden (no backend yet). */
export default function CountriesSection() {

  return (
    <div>
      <ScrollReveal>
      <div className={`${styles.banner} ${styles.countriesHero}`}>
        <div className={styles.bannerContent}>
          <div className={csStyles.bannerIcon}>
            <i className="fas fa-globe-americas" />
          </div>
            <div>
            <h1 className={styles.bannerTitle}>Countries & Sub Admins</h1>
            <p className={styles.bannerSubtitle}>Manage sub-admin accounts</p>
          </div>
        </div>
      </div>
      </ScrollReveal>
      <ScrollReveal delay={100}>
      <div className={csStyles.tabBar}>
        {/* Static label, not a control — the countries tab is hidden, so a
            dead <button> would announce "button" to screen readers and do
            nothing when activated. */}
        <div
          className={`${csStyles.tab} ${csStyles.tabActive}`}
          role="presentation"
        >
          <i className="fas fa-user-shield" /> Sub Admins
        </div>
      </div>
      </ScrollReveal>
      <ScrollReveal delay={200}>
      <SubAdminsView embedded />
      </ScrollReveal>
    </div>
  );
}
