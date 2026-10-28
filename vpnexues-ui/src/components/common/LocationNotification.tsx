import { useCountry } from '../../context/CountryContext';
import { flagSrc } from '../../utils/flags';
import { useLanguage } from '../../i18n/LanguageContext';
import styles from './css/LocationNotification.module.css';

const FLAG_IMAGES: Record<string, string> = {
  IN: 'in',
  SG: 'sg',
  US: 'us',
  AE: 'ae',
};

export default function LocationNotification() {
  const { notification, clearNotification } = useCountry();
  const { t } = useLanguage();

  if (!notification) return null;

  const flag = FLAG_IMAGES[notification.country] || 'sg';
  const message = t('common.locationDetected').replace('{name}', t(`country.${notification.country}`));

  return (
    <div className={styles.banner}>
      <div className={styles.inner}>
        <img
          src={flagSrc(flag)}
          alt=""
          className={styles.flag}
        />
        <span className={styles.text}>{message}</span>
        <button
          type="button"
          className={styles.close}
          onClick={clearNotification}
          aria-label={t('common.dismiss')}
        >
          &times;
        </button>
      </div>
    </div>
  );
}
