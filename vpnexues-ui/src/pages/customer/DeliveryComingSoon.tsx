import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../../i18n/LanguageContext';
import styles from './css/DeliveryComingSoon.module.css';

/* Shown IN PLACE of OrderSuccess when checkout returns
   409 DELIVERY_NOT_AVAILABLE (backend rejects before any order, payment or
   stock movement exists). The selected city travels in router state only —
   no browser storage, per the no-PII-in-browser rule. A direct visit with no
   state still renders fine, just without the city chip. */
interface ComingSoonState {
  city?: string;
}

/* Mirror of the seeded serviceable_cities coverage (V51 + V52 correction) —
   display only; the backend stays authoritative. */
const DELIVERING_TO = ['Singapore', 'Salem', 'Chennai', 'Coimbatore'];

function ComingSoonIllustration() {
  return (
    <svg
      viewBox="0 0 220 220"
      className={styles.illustration}
      aria-hidden="true"
      focusable="false"
    >
      {/* dashed coverage orbit */}
      <circle className={styles.orbit} cx="110" cy="110" r="92" />
      <circle className={styles.orbitDotOne} cx="110" cy="18" r="6" />
      <circle className={styles.orbitDotTwo} cx="202" cy="110" r="4.5" />
      <circle className={styles.orbitDotThree} cx="18" cy="110" r="5" />

      {/* map pin with a sprout inside — fresh produce is on the way */}
      <g transform="translate(62, 44)">
        <path
          className={styles.pinBody}
          d="M48 6C26.9 6 9.5 23.4 9.5 44.6 9.5 74.4 48 106 48 106s38.5-31.6 38.5-61.4C86.5 23.4 69.1 6 48 6z"
        />
        <circle className={styles.pinCore} cx="48" cy="44" r="24" />
        {/* sprout: stem + two leaves */}
        <path className={styles.sproutStem} d="M48 58V40" />
        <path className={styles.sproutLeafLeft} d="M48 46c-8 0-13.5-5-14-13 8.5-.5 14 4.5 14 13z" />
        <path className={styles.sproutLeafRight} d="M48 42c8.5 0 14.5-5.5 15-14-9-.5-15 5-15 14z" />
        <path className={styles.pinShine} d="M24 34c2.5-7 7.5-12.6 14-16" />
      </g>
    </svg>
  );
}

export default function DeliveryComingSoon() {
  const location = useLocation();
  const state = location.state as ComingSoonState | null;
  const city = (state?.city ?? '').trim();
  const { t } = useLanguage();

  return (
    <div className={styles.page}>
      <span className={`${styles.blob} ${styles.blobOne}`} aria-hidden="true" />
      <span className={`${styles.blob} ${styles.blobTwo}`} aria-hidden="true" />
      <span className={`${styles.blob} ${styles.blobThree}`} aria-hidden="true" />

      <svg className={styles.wave} viewBox="0 0 1440 240" preserveAspectRatio="none" aria-hidden="true" focusable="false">
        <path className={styles.waveSoft} d="M0 96C220 24 420 132 700 84C960 40 1180 136 1440 60L1440 240L0 240Z" />
        <path className={styles.waveDeep} d="M0 154C240 96 480 190 760 138C1010 92 1220 178 1440 122L1440 240L0 240Z" />
      </svg>

      <div className={styles.content}>
        <ComingSoonIllustration />

        <span className={styles.badge}>
          <span className={styles.badgeDot} aria-hidden="true" />
          {t('deliveryComingSoon.badge')}
        </span>

        <h1 className={styles.title}>{t('deliveryComingSoon.title')}</h1>
        <p className={styles.subtitle}>{t('deliveryComingSoon.subtitle')}</p>

        {city && (
          <div className={styles.cityChip}>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true" focusable="false">
              <path
                d="M12 21s7-6.1 7-11a7 7 0 10-14 0c0 4.9 7 11 7 11z"
                stroke="currentColor"
                strokeWidth="1.9"
                strokeLinejoin="round"
              />
              <circle cx="12" cy="10" r="2.6" stroke="currentColor" strokeWidth="1.9" />
            </svg>
            <span className={styles.cityChipLabel}>{t('deliveryComingSoon.cityLabel')}</span>
            <strong className={styles.cityChipValue}>{city}</strong>
            <span className={styles.cityChipPill}>{t('deliveryComingSoon.badge')}</span>
          </div>
        )}

        <div className={styles.card}>
          <div className={styles.cardRow}>
            <span className={styles.cardIcon} aria-hidden="true">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 7h11v9H3zM14 10h4l3 3v3h-7z" />
                <circle cx="7" cy="18.5" r="1.9" />
                <circle cx="17.5" cy="18.5" r="1.9" />
              </svg>
            </span>
            <div className={styles.cardRowBody}>
              <strong className={styles.cardTitle}>{t('deliveryComingSoon.noOrderTitle')}</strong>
              <p className={styles.cardText}>{t('deliveryComingSoon.noOrderNote')}</p>
            </div>
          </div>

          <div className={styles.cardDivider} />

          <div className={styles.cardRow}>
            <span className={styles.cardIcon} aria-hidden="true">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="9" />
                <path d="M3.5 12h17M12 3.2c2.6 2.6 3.9 5.6 3.9 8.8s-1.3 6.2-3.9 8.8c-2.6-2.6-3.9-5.6-3.9-8.8S9.4 5.8 12 3.2z" />
              </svg>
            </span>
            <div className={styles.cardRowBody}>
              <strong className={styles.cardTitle}>{t('deliveryComingSoon.deliveringTitle')}</strong>
              <div className={styles.cityTags}>
                {DELIVERING_TO.map((name) => (
                  <span key={name} className={styles.cityTag}>{name}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className={styles.ctaGroup}>
          <Link to="/shop" className={styles.ctaPrimary}>
            {t('deliveryComingSoon.continueShopping')}
            <svg viewBox="0 0 24 24" fill="none" width="16" height="16" aria-hidden="true" focusable="false">
              <path d="M5 12H19M19 12L13 6M19 12L13 18" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
          <Link to="/" className={styles.ctaSecondary}>
            {t('deliveryComingSoon.backToHome')}
          </Link>
        </div>
      </div>
    </div>
  );
}
