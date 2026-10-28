import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCountryConfig } from '../../config/countryConfig';
import { useAdminAuth } from '../../context/AdminAuthContext';
import AlertBell, { type AlertItem } from '../../components/admin/AlertBell';
import Modal from '../../components/admin/Modal';
import { listOrders } from '../../api/adminOrdersApi';
import { list as listContactMessages } from '../../api/adminContactMessagesApi';
import { listInventory } from '../../api/adminInventoryApi';
import { demoGetPrefs } from '../../api/demo/demoAdmin';
import { bootstrapAppearanceForCountry } from '../../utils/appearance';
import { hasModule } from '../../utils/adminScope';
import OrderToaster from '../../components/admin/OrderToaster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faThLarge, faBox, faUsers, faChartBar, faCreditCard, faEnvelope,
  faCog, faSignOutAlt, faUserShield, faNewspaper, faBriefcase,
} from '@fortawesome/free-solid-svg-icons';
import SubDashboardHome from './sub/SubDashboardHome';
import SubProductsView from './sub/SubProductsView';
import SubCustomersOrdersView from './sub/SubCustomersOrdersView';
import SubReportsView from './sub/SubReportsView';
import SubPaymentsView from './sub/SubPaymentsView';
import SubSupportView from './sub/SubSupportView';
import SubMessagesView from './sub/SubMessagesView';
import SubAccountView from './sub/SubAccountView';
import SubSettingsView from './sub/SubSettingsView';
import SubContentView from './sub/SubContentView';
import SubCareersView from './sub/SubCareersView';
import SubLiveStrip from './sub/SubLiveStrip';
import SubHeroBanner from './sub/SubHeroBanner';
import styles from './css/SubAdminDashboard.module.css';

type ViewType =
  | 'dashboard'
  | 'products'
  | 'users'
  | 'reports'
  | 'payments'
  | 'support'
  | 'profile'
  | 'messages'
  | 'settings'
  | 'content'
  | 'careers';

const topbarNavItems = [
  { id: 'dashboard' as ViewType, label: 'Overview', icon: faThLarge },
  { id: 'products' as ViewType, label: 'Products Management', icon: faBox },
  { id: 'users' as ViewType, label: 'Customers & Orders', icon: faUsers },
  { id: 'reports' as ViewType, label: 'Report & Analytics', icon: faChartBar },
  { id: 'payments' as ViewType, label: 'Payments', icon: faCreditCard },
  { id: 'support' as ViewType, label: 'Support', icon: faEnvelope },
  { id: 'content' as ViewType, label: 'Team, News & Gallery', icon: faNewspaper },
  { id: 'careers' as ViewType, label: 'Careers', icon: faBriefcase },
];

/** A tab is visible only when its module was granted (SUPER_ADMIN and legacy sessions see all). */
function viewAllowed(admin: Parameters<typeof hasModule>[0], view: ViewType): boolean {
  // "Customers & Orders" is one tab serving two modules — either grant opens it.
  if (view === 'users') return hasModule(admin, 'users') || hasModule(admin, 'orders');
  if (view === 'careers') return hasModule(admin, 'careers');
  return hasModule(admin, view);
}

export default function SubAdminDashboard() {
  const { country } = useParams<{ country: string }>();
  const navigate = useNavigate();
  const { admin, logout } = useAdminAuth();
  const [activeView, setActiveView] = useState<ViewType>('dashboard');
  const [profileOpen, setProfileOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [importantMsgOpen, setImportantMsgOpen] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);
  const profileRef = useRef<HTMLDivElement>(null);
  const hamburgerRef = useRef<HTMLButtonElement>(null);

  const config = getCountryConfig(country || 'india');
  const code = config?.code ?? 'IN';

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Lock background scroll while the mobile nav drawer is open.
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [drawerOpen]);

  // Restore this panel's saved theme/density (Settings → Appearance). This used to
  // hardcode Light/Comfortable, silently wiping the saved choice on every reload.
  useEffect(() => {
    if (config) bootstrapAppearanceForCountry(config.id, demoGetPrefs);
  }, [config]);

  // Land on the first granted tab — e.g. a sub admin without the Overview module
  // must not start on a tab he cannot use.
  const allowedTabKey = topbarNavItems.filter((i) => viewAllowed(admin, i.id)).map((i) => i.id).join(',');
  useEffect(() => {
    const allowed = allowedTabKey.split(',').filter(Boolean) as ViewType[];
    if (allowed.length > 0 && !allowed.includes(activeView)) {
      setActiveView(allowed[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allowedTabKey]);

  // Data behind the Important Message popup — same sources the alert bell already uses.
  useEffect(() => {
    if (!config) return;
    let cancelled = false;
    Promise.all([
      listOrders({ country: code, status: 'PLACED', size: 1 }).catch(() => null),
      listOrders({ country: code, status: 'CONFIRMED', size: 1 }).catch(() => null),
    ])
      .then(([placed, confirmed]) => {
        if (!cancelled) setPendingCount((placed?.totalElements ?? 0) + (confirmed?.totalElements ?? 0));
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [config, code]);

  // Unread admin message count disabled until UI hook added.
  // (Previously broken: setUnreadMsgCount undefined, demoListAdminMessages unimported, duplicate pending logic.)

  if (!config) return <div className={styles.countryMissing}>Country not found</div>;

  const isPreview = admin?.role === 'SUPER_ADMIN';

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  const importantMsgText = pendingCount > 0
    ? `You have ${pendingCount} pending order${pendingCount === 1 ? '' : 's'} awaiting processing. Please review them.`
    : 'There are no pending orders right now.';

  const closeImportantMsg = () => setImportantMsgOpen(false);

  const viewImportantMsg = () => {
    setImportantMsgOpen(false);
    setActiveView('users');
  };

  async function fetchAlerts(): Promise<AlertItem[]> {
    const [placed, newMessages, low, out] = await Promise.all([
      listOrders({ country: code, status: 'PLACED', size: 1 }).catch(() => null),
      listContactMessages('NEW').catch(() => []),
      listInventory({ status: 'LOW_STOCK' }).catch(() => []),
      listInventory({ status: 'OUT_OF_STOCK' }).catch(() => []),
    ]);
    const countryMessages = (newMessages ?? []).filter((m) => !m.countryCode || m.countryCode === code);
    const lowCount = [...(low ?? []), ...(out ?? [])].length;
    const stamp = new Date().toLocaleString();

    return [
      { id: 'orders', label: 'New orders', detail: 'PLACED — needs processing', count: placed?.totalElements ?? 0, time: stamp, kind: 'order', onOpen: () => setActiveView('users') },
      { id: 'support', label: 'Unread support', detail: 'NEW customer messages', count: countryMessages.length, time: stamp, kind: 'support', onOpen: () => setActiveView('support') },
      { id: 'stock', label: 'Low stock', detail: 'Store inventory', count: lowCount, time: stamp, kind: 'stock', onOpen: () => setActiveView('products') },
    ];
  }

  const goView = (view: 'orders' | 'products' | 'users' | 'support' | 'messages' | 'payments') => {
    if (view === 'orders') {
      setActiveView('users');
    } else if (view === 'payments') {
      setActiveView('payments');
    } else {
      setActiveView(view);
    }
  };

  // Nav tabs this session may see (country + module gated) — shared by the desktop pills
  // and the mobile drawer so both always agree.
  const visibleNavItems = topbarNavItems.filter(
    item =>
      (item.id !== 'content' || code === 'IN') &&
      (item.id !== 'careers' || code === 'IN') &&
      viewAllowed(admin, item.id)
  );

  // Close the mobile drawer — and hand focus back to the hamburger BEFORE the
  // drawer turns aria-hidden; a focused element inside an aria-hidden subtree
  // is the accessibility error the console reports (aria-hidden-on-focused…).
  const closeDrawer = () => {
    hamburgerRef.current?.focus();
    setDrawerOpen(false);
  };

  // Single way to switch tabs from either nav surface; always closes the mobile drawer.
  const selectView = (view: ViewType) => {
    setActiveView(view);
    closeDrawer();
    setProfileOpen(false);
  };

  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return <SubDashboardHome config={config} onNavigate={goView} />;
      case 'products':
        return <SubProductsView config={config} />;
      case 'users':
        return <SubCustomersOrdersView config={config} />;
      case 'reports':
        return <SubReportsView config={config} />;
      case 'payments':
        return <SubPaymentsView config={config} />;
      case 'support':
        return <SubSupportView config={config} />;
      case 'messages':
        return <SubMessagesView config={config} />;
      case 'profile':
        return <SubAccountView config={config} />;
      case 'settings':
        return <SubSettingsView config={config} />;
      case 'content':
        return <SubContentView config={config} />;
      case 'careers':
        return <SubCareersView config={config} />;
      default:
        return <SubDashboardHome config={config} onNavigate={goView} />;
    }
  };

  return (
    <div className={styles.root}>
      <OrderToaster />
      {isPreview && (
        <div className={styles.previewBanner}>
          <span>Super Admin Preview Mode — viewing {config.name}</span>
          <button type="button" className={styles.previewButton} onClick={() => navigate('/admin/super-admin')}>
            Back to Super Admin
          </button>
        </div>
      )}

      <div className={styles.main}>
        <div className={styles.topbar}>
          <button
            type="button"
            ref={hamburgerRef}
            className={styles.hamburger}
            onClick={() => setDrawerOpen(true)}
            aria-label="Open menu"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></svg>
          </button>
          <div className={styles.topbarLeft}>
            <img src="https://res.cloudinary.com/eqjshlur/image/upload/v1790001831/vpnexues/old/site-assets/logo/vp-logo.svg" alt="VPNexues" className={styles.topbarLogo} />
            <div className={styles.topbarBrand}>
              <span className={styles.topbarBrandName}>VPNexues</span>
              <span className={styles.topbarBrandSub}>{config.tagline}</span>
            </div>
          </div>
          <div className={styles.pills}>
            {visibleNavItems.map(item => (
              <button
                key={item.id}
                onClick={() => selectView(item.id)}
                className={`${styles.pill} ${activeView === item.id ? styles.pillActive : ''}`}
              >
                <FontAwesomeIcon icon={item.icon} className={styles.pillIcon} />
                {item.label}
              </button>
            ))}
          </div>
          <div className={styles.topbarRight}>
            <AlertBell fetchAlerts={fetchAlerts} />
            <div ref={profileRef} className={styles.profileWrap}>
              <button onClick={() => setProfileOpen(!profileOpen)} className={styles.profileBtn} aria-label="Account menu">
                <FontAwesomeIcon icon={faUserShield} className={styles.profileBtnIcon} />
                <span className={styles.profileBtnLabel}>Account</span>
              </button>
              {profileOpen && (
                <div className={styles.profileMenu}>
                  <div className={styles.profileHead}>
                    <div className={styles.profileName}>{admin?.name ?? 'Admin User'}</div>
                    <div className={styles.profileEmail}>{admin?.email ?? 'admin@vpnexues.com'}</div>
                  </div>
                  <button onClick={() => { setProfileOpen(false); setActiveView('profile'); }} className={styles.menuItem}>
                    <FontAwesomeIcon icon={faUserShield} className={styles.menuItemIcon} /> Account
                  </button>
                  <button onClick={() => { setProfileOpen(false); setActiveView('settings'); }} className={styles.menuItem}>
                    <FontAwesomeIcon icon={faCog} className={styles.menuItemIcon} /> Settings
                  </button>
                  <button onClick={() => void handleLogout()} className={`${styles.menuItem} ${styles.menuItemDanger}`}>
                    <FontAwesomeIcon icon={faSignOutAlt} className={styles.menuItemIcon} /> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Mobile nav drawer (hidden on desktop via CSS) ── */}
        {drawerOpen && <div className={styles.drawerOverlay} onClick={closeDrawer} />}
        <aside className={`${styles.drawer} ${drawerOpen ? styles.drawerOpen : ''}`} aria-hidden={!drawerOpen}>
          <div className={styles.drawerHead}>
            <img src="https://res.cloudinary.com/eqjshlur/image/upload/v1790001831/vpnexues/old/site-assets/logo/vp-logo.svg" alt="VPNexues" className={styles.drawerLogo} />
            <div className={styles.drawerBrand}>
              <span className={styles.drawerBrandName}>VPNexues</span>
              <span className={styles.drawerBrandSub}>{config.tagline}</span>
            </div>
            <button type="button" className={styles.drawerClose} onClick={closeDrawer} aria-label="Close menu">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
            </button>
          </div>
          <nav className={styles.drawerNav}>
            <div className={styles.drawerSection}>Menu</div>
            {visibleNavItems.map(item => (
              <button
                key={item.id}
                type="button"
                onClick={() => selectView(item.id)}
                className={`${styles.drawerItem} ${activeView === item.id ? styles.drawerItemActive : ''}`}
              >
                <span className={styles.drawerItemIcon}><FontAwesomeIcon icon={item.icon} /></span>
                <span>{item.label}</span>
              </button>
            ))}
            <div className={styles.drawerDivider} />
            <div className={styles.drawerSection}>Account</div>
            <button type="button" onClick={() => selectView('profile')} className={`${styles.drawerItem} ${activeView === 'profile' ? styles.drawerItemActive : ''}`}>
              <span className={styles.drawerItemIcon}><FontAwesomeIcon icon={faUserShield} /></span>
              <span>My Account</span>
            </button>
            <button type="button" onClick={() => selectView('settings')} className={`${styles.drawerItem} ${activeView === 'settings' ? styles.drawerItemActive : ''}`}>
              <span className={styles.drawerItemIcon}><FontAwesomeIcon icon={faCog} /></span>
              <span>Settings</span>
            </button>
            <button type="button" onClick={() => { closeDrawer(); void handleLogout(); }} className={`${styles.drawerItem} ${styles.drawerLogout}`}>
              <span className={styles.drawerItemIcon}><FontAwesomeIcon icon={faSignOutAlt} /></span>
              <span>Logout</span>
            </button>
          </nav>
        </aside>

        <div className={styles.content}>
          {/* Shared superadmin-style hero on every page; Team, News & Gallery and Careers keep their
              own banner because they carry the Add Member / Article / Image / Add Job actions. */}
          {activeView !== 'content' && activeView !== 'careers' && (
            <SubHeroBanner view={activeView} config={config} adminName={admin?.name} />
          )}
          {activeView !== 'content' && activeView !== 'careers' && <SubLiveStrip config={config} />}
          {renderView()}
        </div>

        {importantMsgOpen && (
          <Modal title="Important Message" onClose={closeImportantMsg} headerDark>
            <p className={styles.importantMsgBody}>{importantMsgText}</p>
            <div className={styles.importantMsgActions}>
              <button type="button" className={styles.importantMsgView} onClick={viewImportantMsg}>
                View
              </button>
              <button type="button" className={styles.importantMsgCancel} onClick={closeImportantMsg}>
                Cancel
              </button>
            </div>
          </Modal>
        )}
      </div>
    </div>
  );
}
