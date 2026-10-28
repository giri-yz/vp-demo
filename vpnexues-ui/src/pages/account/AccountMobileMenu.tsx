import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../i18n/LanguageContext';
import s from './css/AccountMobileMenu.module.css';

interface Props {
  /** Dashboard stays on mobile layout until 1024px — pass true there so the menu hides at 1024 instead of 768. */
  until1024?: boolean;
}

/** Mobile-only top-left dropdown with all account nav options. */
export default function AccountMobileMenu({ until1024 = false }: Props) {
  const { t } = useLanguage();
  const location = useLocation();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const NAV_ITEMS = [
    { path: '/account', icon: 'fas fa-home', label: t('account.dashboard') },
    { path: '/account/orders', icon: 'fas fa-shopping-bag', label: t('account.orders') },
    { path: '/account/payment-history', icon: 'fas fa-credit-card', label: t('account.payments') },
    { path: '/account/order-tracking', icon: 'fas fa-truck', label: t('account.orderTracking') },
    { path: '/account/personal-info', icon: 'fas fa-user', label: t('account.personalInformation') },
    { path: '/account/addresses', icon: 'fas fa-map-marker-alt', label: t('account.addresses') },
    { path: '/account/help-support', icon: 'fas fa-headset', label: t('account.helpSupport') },
    { path: '/account/notifications', icon: 'fas fa-bell', label: t('account.notifications') },
    { path: '/account/terms', icon: 'fas fa-file-alt', label: t('account.terms') },
    { path: '/privacy', icon: 'fas fa-user-shield', label: t('footer.privacyPolicy') },
    { path: '/account-deletion', icon: 'fas fa-user-slash', label: t('accountDeletion.title') },
  ];

  function isActive(path: string): boolean {
    if (path === '/account') return location.pathname === '/account';
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  }

  // Close on navigation + Escape
  useEffect(() => { setOpen(false); }, [location.pathname]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open ]);

  return (
    <div className={`${s.wrap} ${until1024 ? s.until1024 : ''}`}>
      <button
        type="button"
        className={`${s.toggle} ${open ? s.toggleOpen : ''}`}
        aria-expanded={open}
        aria-label={t('account.menu')}
        onClick={() => setOpen(v => !v)}
      >
        <i className={`fas ${open ? 'fa-times' : 'fa-bars'}`} />
        <span>{t('account.menu')}</span>
        <i className={`fas fa-chevron-down ${s.caret} ${open ? s.caretOpen : ''}`} />
      </button>
      {open && (
        <>
          <button type="button" aria-hidden="true" tabIndex={-1} className={s.backdrop} onClick={() => setOpen(false)} />
          <nav className={s.panel} aria-label={t('account.menu')}>
            {NAV_ITEMS.map(item => (
              <Link
                key={item.path}
                to={item.path}
                className={`${s.link} ${isActive(item.path) ? s.linkActive : ''}`}
              >
                <span className={s.linkIcon}><i className={item.icon} /></span>
                <span className={s.linkLabel}>{item.label}</span>
                <i className={`fas fa-chevron-right ${s.linkChev}`} />
              </Link>
            ))}
            <button
              type="button"
              className={s.logoutBtn}
              onClick={() => { setOpen(false); void logout().finally(() => navigate('/')); }}
            >
              <span className={`${s.linkIcon} ${s.logoutIcon}`}><i className="fas fa-sign-out-alt" /></span>
              <span className={s.linkLabel}>{t('account.logout')}</span>
            </button>
          </nav>
        </>
      )}
    </div>
  );
}
