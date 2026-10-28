import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useAuthModal } from '../../context/AuthModalContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { IconLock, IconShieldCheck, IconTruck, IconFresh } from './icons';
import styles from './css/RequireAuth.module.css';

export default function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const { openAuthModal } = useAuthModal();
  const { t } = useLanguage();

  useEffect(() => {
    if (!loading && !user) {
      openAuthModal();
    }
  }, [loading, user, openAuthModal]);

  if (loading) {
    return (
      <div className={styles.loadingWrap}>
        <div className={styles.spinner} />
      </div>
    );
  }

  if (!user) {
    return (
      <div className={styles.wrap}>
        <div className={styles.card}>
          <div className={styles.iconWrap}>
            <IconLock className={styles.icon} />
          </div>
          <h2 className={styles.title}>{t('common.loginRequired')}</h2>
          <p className={styles.subtitle}>
            {t('common.loginToContinueDesc')}
          </p>
          <button
            type="button"
            className={styles.loginBtn}
            onClick={() => openAuthModal()}
          >
            <IconShieldCheck className={styles.loginBtnIcon} />
            {t('common.loginToContinue')}
          </button>
          <div className={styles.trustRow}>
            <span className={styles.trustItem}>
              <IconShieldCheck className={styles.trustIcon} />
              {t('checkout.secure')}
            </span>
            <span className={styles.trustItem}>
              <IconTruck className={styles.trustIcon} />
              {t('checkout.fastDelivery')}
            </span>
            <span className={styles.trustItem}>
              <IconFresh className={styles.trustIcon} />
              {t('checkout.fresh')}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
