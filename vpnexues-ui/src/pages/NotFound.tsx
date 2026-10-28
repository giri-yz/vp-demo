import { Link } from 'react-router-dom';
import { useLanguage } from '../i18n/LanguageContext';

export default function NotFound() {
  const { t } = useLanguage();

  return (
    <div className="container" style={{ padding: '100px 0', textAlign: 'center' }}>
      <h1>{t('notFound.title')}</h1>
      <p style={{ margin: 'var(--space-4) 0', color: 'var(--color-text-muted)' }}>{t('notFound.subtitle')}</p>
      <p style={{ margin: '0 0 var(--space-6)', color: 'var(--color-text-muted)' }}>{t('notFound.desc')}</p>
      <Link to="/" className="btn btn-primary">
        {t('notFound.backHome')}
      </Link>
    </div>
  );
}
