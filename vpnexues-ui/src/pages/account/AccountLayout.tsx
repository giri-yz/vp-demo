import { useCallback, useState, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useAvatar } from '../../hooks/useAvatar';
import { useRipple } from '../../components/common/Ripple';
import { useLanguage } from '../../i18n/LanguageContext';
import AccountSidebar from './AccountSidebar';
import AccountMobileMenu from './AccountMobileMenu';
import s from './css/AccountLayout.module.css';
import acc from './css/Account.module.css';

interface Props { children: React.ReactNode; title?: string; breadcrumb?: string; }

export default function AccountLayout({ children, title, breadcrumb }: Props) {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const rippleDark = useRipple('dark');
  const rippleRed = useRipple('red');
  const { avatar, setAvatar } = useAvatar();
  const [localName] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const NAV_ITEMS = [
    { path: '/account', icon: 'fas fa-th-large', emoji: '📊', label: t('account.dashboard') },
    { path: '/account/orders', icon: 'fas fa-shopping-bag', emoji: '📦', label: t('account.orders') },
    { path: '/account/payment-history', icon: 'fas fa-credit-card', emoji: '💳', label: t('account.payments') },
    { path: '/account/order-tracking', icon: 'fas fa-truck', emoji: '🚚', label: t('account.orderTracking') },
    { path: '/account/personal-info', icon: 'fas fa-user', emoji: '👤', label: t('account.personalInfo') },
    { path: '/account/addresses', icon: 'fas fa-map-marker-alt', emoji: '📍', label: t('account.addresses') },
    { path: '/account/help-support', icon: 'fas fa-headset', emoji: '🎧', label: t('account.helpSupport') },
    { path: '/account/notifications', icon: 'fas fa-bell', emoji: '🔔', label: t('account.notifications') },
    { path: '/account/terms', icon: 'fas fa-file-alt', emoji: '📄', label: t('account.terms') },
    { path: '/privacy', icon: 'fas fa-user-shield', emoji: '🔒', label: t('footer.privacyPolicy') },
    { path: '/account-deletion', icon: 'fas fa-user-slash', emoji: '🗑️', label: t('accountDeletion.title') },
  ];
  function handleAvatarFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f || !f.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = () => { setAvatar(reader.result as string); };
    reader.readAsDataURL(f);
    e.target.value = '';
  }
  const displayName = user?.name || localName || t('account.guestUser');
  const handleLogout = useCallback((e: React.MouseEvent<HTMLElement>) => {
    rippleRed(e);
    setTimeout(() => { logout(); navigate('/'); }, 180);
  }, [logout, navigate, rippleRed]);
  const activePath = location.pathname;

  const pillNav = NAV_ITEMS.map(item => (
    <Link
      key={item.path}
      to={item.path}
      className={`${s.mobileNavPill} ${activePath === item.path ? s.mobileNavPillActive : ''}`}
      onClick={e => {
        const el = e.currentTarget as HTMLElement;
        const rect = el.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height) * 2.2;
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        const span = document.createElement('span');
        const isActive = activePath === item.path;
        span.style.cssText = `position:absolute;border-radius:50%;pointer-events:none;transform:scale(0);animation:rippleAnim .6s ease-out forwards;background:${isActive ? 'radial-gradient(circle,rgba(20,71,47,.14) 0%,transparent 70%)' : 'radial-gradient(circle,rgba(255,255,255,.35) 0%,transparent 70%)'};width:${size}px;height:${size}px;left:${x}px;top:${y}px;z-index:10;`;
        el.style.position = 'relative'; el.style.overflow = 'hidden';
        el.appendChild(span); span.addEventListener('animationend', () => span.remove());
      }}
    >
      <span style={{ fontSize: 13, lineHeight: 1 }}>{item.emoji}</span> {item.label}
    </Link>
  ));

  return (
    <div className={s.layout}>
      {/* Mobile Header */}
      <header className={s.mobileHeader}>
        <button className={s.backBtn} onClick={e => { rippleDark(e); setTimeout(() => navigate(-1), 120); }} aria-label={t('account.goBack')}>
          <i className="fas fa-chevron-left" />
        </button>
        <Link to="/" className={s.brand}>
          <img src="https://res.cloudinary.com/eqjshlur/image/upload/v1790001831/vpnexues/old/site-assets/logo/vp-logo.svg" alt="" className={s.brandLogo} />
          <span className={s.brandText}>
            <strong>VPNexues</strong>
            <small>விவசாயம் காப்போம்</small>
          </span>
        </Link>
        <div className={s.headerSpacer} />
      </header>

      {/* Mobile Sidebar: profile + pill nav */}
      <div className={s.mobileSidebar}>
        <div className={s.mobileProfile}>
          <div className={s.mobileAvatar} style={{ overflow: 'visible', position: 'relative' }}>
            <div style={{ width: '100%', height: '100%', borderRadius: '50%', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {avatar?.startsWith('data:') ? (
                <img src={avatar} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
              ) : avatar?.startsWith('fas') || avatar?.startsWith('far') || avatar?.startsWith('fab') ? (
                <i className={avatar} />
              ) : (
                <span style={{ fontSize: 22 }}>👤</span>
              )}
            </div>
            <button className={s.mobileAvatarEdit} onClick={() => fileRef.current?.click()} aria-label={t('account.changePhoto')}>
              <i className="fas fa-camera" />
            </button>
          </div>
          <div className={s.mobileProfileInfo}>
            <span className={s.mobileProfileName}>{displayName}</span>
            <span className={s.mobileProfileSub}>{user?.phone ?? user?.email ?? ''}</span>
          </div>
        </div>
        <div className={s.mobileNav}>{pillNav}</div>
          <button className={s.mobileLogout} onClick={handleLogout}>
            <i className="fas fa-sign-out-alt" /> {t('account.logout')}
        </button>
      </div>

      {/* Two-column shell */}
      <div className={s.shell}>
        {/* Desktop Sidebar — shared new-design sidebar */}
        <div className={s.desktopSidebar}>
          <AccountSidebar asideClass={acc.sideBox} />
        </div>

        {/* Main Content */}
        <div className={s.mainContent}>
          <AccountMobileMenu />
          {(title || breadcrumb) && (
            <div style={{ marginBottom: 20 }}>
              {breadcrumb && <div style={{ fontSize: 13, color: '#444', marginBottom: 4 }}><Link to="/account" style={{ color: '#16a34a', textDecoration: 'none', fontWeight: 600 }}>{t('account.account')}</Link> / {breadcrumb}</div>}
              {title && <h1 style={{ fontSize: 24, fontWeight: 800, color: '#111827', margin: 0 }}>{title}</h1>}
            </div>
          )}
          {children}
        </div>
      </div>

      <input ref={fileRef} type="file" accept="image/*" hidden onChange={handleAvatarFile} />

      {/* Copyright Footer */}
      <footer className={s.footer}>
        &copy; 2026 VPNexues Import &amp; Export. All Rights Reserved.
      </footer>
    </div>
  );
}
