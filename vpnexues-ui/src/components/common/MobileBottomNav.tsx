import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useAuthModal } from '../../context/AuthModalContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { IconCart, IconGrid, IconHome, IconUser } from './icons';
import CategoriesPopup from './CategoriesPopup';
import styles from './css/MobileBottomNav.module.css';

export default function MobileBottomNav() {
  const { t } = useLanguage();
  const { cart } = useCart();
  const { user } = useAuth();
  const { openAuthModal } = useAuthModal();
  const location = useLocation();
  const [catOpen, setCatOpen] = useState(() => sessionStorage.getItem('vpnexues_cat_popup') === 'open');
  const itemCount = cart?.items?.reduce((sum, i) => sum + i.qty, 0) ?? 0;

  useEffect(() => {
    if (sessionStorage.getItem('vpnexues_cat_popup') === 'open') {
      setCatOpen(true);
    }
  }, [location.pathname]);

  return (
    <>
      <nav className={styles.nav} aria-label="Mobile bottom navigation">
        <NavLink to="/" end className={({ isActive }) => `${styles.item} ${isActive ? styles.active : ''}`}>
          <IconHome className={styles.icon} />
          <span>{t('mobileNav.home')}</span>
        </NavLink>
        <button
          type="button"
          className={styles.item}
          onClick={() => setCatOpen(true)}
          aria-haspopup="dialog"
        >
          <IconGrid className={styles.icon} />
          <span>{t('mobileNav.categories')}</span>
        </button>
        <NavLink to="/cart" className={({ isActive }) => `${styles.item} ${isActive ? styles.active : ''}`}>
          <span className={styles.iconWrap}>
            <IconCart className={styles.icon} />
            {itemCount > 0 && <span className={styles.badge}>{itemCount}</span>}
          </span>
          <span>{t('mobileNav.cart')}</span>
        </NavLink>
        {user ? (
          <NavLink to="/account" className={({ isActive }) => `${styles.item} ${isActive ? styles.active : ''}`}>
            <IconUser className={styles.icon} />
            <span>{t('mobileNav.account')}</span>
          </NavLink>
        ) : (
          <button type="button" className={styles.item} onClick={() => openAuthModal()}>
            <IconUser className={styles.icon} />
            <span>{t('mobileNav.login')}</span>
          </button>
        )}
      </nav>
      <CategoriesPopup isOpen={catOpen} onClose={() => { setCatOpen(false); sessionStorage.removeItem('vpnexues_cat_popup'); }} onNavigate={() => sessionStorage.setItem('vpnexues_cat_popup', 'open')} />
    </>
  );
}
