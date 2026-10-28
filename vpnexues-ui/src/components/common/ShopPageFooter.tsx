import { useLanguage } from '../../i18n/LanguageContext';
import styles from './css/ShopPageFooter.module.css';

export default function ShopPageFooter() {
  const { t } = useLanguage();
  return (
    <footer className={styles.footer}>
      {t('footer.copyright')}
    </footer>
  );
}
