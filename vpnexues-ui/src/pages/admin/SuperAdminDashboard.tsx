import { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';
import AlertBell, { type AlertItem } from '../../components/admin/AlertBell';
import AdminSearch from '../../components/admin/AdminSearch';
import { getSummary } from '../../api/adminDashboardApi';
import { listOrders } from '../../api/adminOrdersApi';
import { list as listContactMessages } from '../../api/adminContactMessagesApi';
import OrderToaster from '../../components/admin/OrderToaster';
import styles from './css/SuperAdminDashboard.module.css';

/**
 * Each admin tab is its own chunk so opening the dashboard doesn't download the
 * whole admin UI (reports/charts, the users table, demo data seeds, ...) up
 * front. Only the dashboard home is needed for first paint.
 */
const DashboardHome = lazy(() => import('./super/DashboardHome'));
const CountriesSection = lazy(() => import('./super/CountriesSection'));
const SuperUsersView = lazy(() => import('./super/SuperUsersView'));
const SuperOrdersView = lazy(() => import('./super/SuperOrdersView'));
const SuperProductsView = lazy(() => import('./super/SuperProductsView'));
const SuperPaymentsView = lazy(() => import('./super/SuperPaymentsView'));
const SuperCategoriesView = lazy(() => import('./super/SuperCategoriesView'));
const SuperReportsView = lazy(() => import('./super/SuperReportsView'));
const SuperSupportView = lazy(() => import('./super/SuperSupportView'));
const SuperSettingsView = lazy(() => import('./super/SuperSettingsView'));
const SuperProfileView = lazy(() => import('./super/SuperProfileView'));

function ViewFallback() {
  return (
    <div style={{ padding: '48px 24px', textAlign: 'center', color: '#64748B', fontSize: 14 }}>
      Loading…
    </div>
  );
}

function NavIcon({ icon }: { icon: string }) {
  const common = { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  switch (icon) {
    case 'dashboard':
      return <svg {...common}><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>;
    case 'countries':
      return <svg {...common}><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>;
    case 'users':
      return <svg {...common}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>;
    case 'products':
      return <svg {...common}><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" /></svg>;
    case 'payments':
      return <svg {...common}><rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" /></svg>;
    case 'reports':
      return <svg {...common}><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>;
    case 'activity':
      return <svg {...common}><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>;
    case 'support':
      return <svg {...common}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22 6 12 13 2 6" /></svg>;
    case 'messages':
      return <svg {...common}><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>;
    case 'settings':
      return <svg {...common}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>;
    case 'profile':
      return <svg {...common}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>;
    default:
      return <svg {...common}><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>;
  }
}

type ViewType =
  | 'dashboard'
  | 'countries'
  | 'users'
  | 'orders'
  | 'products'
  | 'payments'
  | 'categories'
  | 'reports'
  | 'support'
  | 'settings'
  | 'profile';

export default function SuperAdminDashboard() {
  const navigate = useNavigate();
  const { isDemo, logout } = useAdminAuth();
  const [activeView, setActiveView] = useState<ViewType>('dashboard');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [drawerOpen]);

  function selectView(view: ViewType) {
    setActiveView(view);
    setDrawerOpen(false);
    setProfileOpen(false);
  }

  async function handleLogout() {
    await logout();
    navigate('/admin/login');
  }

  async function fetchAlerts(): Promise<AlertItem[]> {
    const [summary, newMessages, placed] = await Promise.all([
      getSummary().catch(() => null),
      listContactMessages('NEW').catch(() => []),
      listOrders({ status: 'PLACED', size: 1 }).catch(() => null),
    ]);
    const stamp = new Date().toLocaleString();
    return [
      { id: 'orders', label: 'New orders', detail: 'PLACED — needs processing', count: placed?.totalElements ?? 0, time: stamp, kind: 'order', onOpen: () => selectView('orders') },
      { id: 'messages', label: 'Unread messages', detail: 'NEW contact messages', count: (newMessages ?? []).length, time: stamp, kind: 'message', onOpen: () => selectView('support') },
      { id: 'stock', label: 'Low stock', detail: 'Store inventory', count: summary?.lowStockItems.length ?? 0, time: stamp, kind: 'stock', onOpen: () => selectView('dashboard') },
    ];
  }

  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return <DashboardHome onNavigate={(v) => selectView(v)} />;
      case 'countries':
        return <CountriesSection />;
      case 'users':
        return <SuperUsersView />;
      case 'orders':
        return <SuperOrdersView />;
      case 'products':
        return <SuperProductsView />;
      case 'payments':
        return <SuperPaymentsView />;
      case 'categories':
        return <SuperCategoriesView />;
      case 'reports':
        return <SuperReportsView />;
      case 'support':
        return <SuperSupportView />;
      case 'settings':
        return <SuperSettingsView />;
      case 'profile':
        return <SuperProfileView />;
      default:
        return <DashboardHome />;
    }
  };

  const TOP_ITEMS: { id: ViewType; label: string; icon: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
    { id: 'countries', label: 'Countries & Sub Admins', icon: 'countries' },
    { id: 'users', label: 'Users', icon: 'users' },
    { id: 'orders', label: 'Orders', icon: 'orders' },
    { id: 'products', label: 'Products', icon: 'products' },
    { id: 'payments', label: 'Payment Analytics', icon: 'payments' },
    { id: 'reports', label: 'Reports & Analytics', icon: 'reports' },
    { id: 'support', label: 'Support', icon: 'support' },
  ];

  const ALL_ITEMS: { id: ViewType; label: string; icon: string; section?: number }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard', section: 1 },
    { id: 'countries', label: 'Countries & Sub Admins', icon: 'countries', section: 1 },
    { id: 'users', label: 'Users', icon: 'users', section: 1 },
    { id: 'orders', label: 'Orders', icon: 'orders', section: 1 },
    { id: 'products', label: 'Products', icon: 'products', section: 2 },
    { id: 'payments', label: 'Payment Analytics', icon: 'payments', section: 2 },
    { id: 'reports', label: 'Reports & Analytics', icon: 'reports', section: 3 },
    { id: 'support', label: 'Support Messages', icon: 'support', section: 3 },
    { id: 'settings', label: 'Settings', icon: 'settings', section: 4 },
  ];

  return (
    <div className={styles.superShell}>
      <OrderToaster />
      {/* ── Full-width top navbar (legacy architecture) ── */}
      <header className={styles.topbar}>
        <div className={styles.topbarLeft}>
          <button type="button" className={styles.hamburger} onClick={() => setDrawerOpen(!drawerOpen)} aria-label="Toggle menu">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" /></svg>
          </button>
          <button type="button" className={styles.topbarLogo} onClick={() => selectView('dashboard')} aria-label="Go to dashboard" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <img src="https://res.cloudinary.com/eqjshlur/image/upload/v1790001831/vpnexues/old/site-assets/logo/vp-logo.svg" alt="VPNexues" />
            <span className={styles.topbarLogoText}>VPNexues</span>
          </button>
        </div>
        <div className={styles.topbarCenter}>
          <nav className={styles.topbarNav}>
            {TOP_ITEMS.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`${styles.topbarNavItem} ${activeView === item.id ? styles.active : ''}`}
                onClick={() => selectView(item.id)}
              >
                <span className={styles.topbarNavIcon}><NavIcon icon={item.icon} /></span> {item.label}
              </button>
            ))}
          </nav>
        </div>
        <div className={styles.topbarRight}>
          <div className={styles.topbarSearch}>
            <AdminSearch />
          </div>
          <AlertBell fetchAlerts={fetchAlerts} />
          <div ref={profileRef} className={styles.profileMenu}>
            <button type="button" className={styles.profileTrigger} onClick={() => setProfileOpen(!profileOpen)} aria-label="Profile menu">
              <div className={styles.profileAvatar}>S</div>
            </button>
            {profileOpen && (
              <div className={`${styles.profileDropdown} ${styles.show}`}>
                <button type="button" onClick={() => selectView('profile')}><NavIcon icon="profile" /> My Account</button>
                <button type="button" onClick={() => selectView('settings')}><NavIcon icon="settings" /> Settings</button>
                <button type="button" onClick={() => void handleLogout()}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg> Logout</button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── Drawer (mobile/tablet only) ── */}
      {drawerOpen && <div className={styles.drawerOverlay} onClick={() => setDrawerOpen(false)} />}
      <aside className={`${styles.sidebar} ${drawerOpen ? styles.open : ''} ${collapsed ? styles.collapsed : ''}`}>
        <div className={styles.sidebarHeader}>
          <img src="https://res.cloudinary.com/eqjshlur/image/upload/v1790001831/vpnexues/old/site-assets/logo/vp-logo.svg" alt="VPNexues" />
          {!collapsed && (
            <div className={styles.brand}>
              <h2>VPNexues</h2>
              <div className={styles.brandSubtitle}>Global Administration</div>
            </div>
          )}
        </div>
        <button type="button" className={styles.collapseToggle} onClick={() => setCollapsed(!collapsed)} title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
          {collapsed ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
          )}
        </button>
        <nav className={styles.nav}>
          {[1, 2, 3, 4].map((section) => (
            <div key={section}>
              {section > 1 && <div className={styles.navDivider} />}
              {ALL_ITEMS.filter((item) => item.section === section).map((item) => (
                <button
                  key={item.id}
                  type="button"
                  title={item.label}
                  className={`${styles.navItem} ${activeView === item.id ? styles.active : ''}`}
                  onClick={() => selectView(item.id)}
                  style={{ position: 'relative' }}
                >
                  <span className={styles.navIcon}><NavIcon icon={item.icon} /></span>
                  <span>{item.label}</span>
                  {collapsed && <span className={styles.navTooltip}>{item.label}</span>}
                </button>
              ))}
            </div>
          ))}
        </nav>
        <button type="button" className={styles.logoutButton} onClick={() => void handleLogout()}>
          <span className={styles.navIcon}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg></span> Logout
        </button>
      </aside>

      {/* ── Main content (full viewport width, no sidebar offset) ── */}
      <div className={styles.mainArea}>
        <div className={styles.content}>
          <Suspense fallback={<ViewFallback />}>{renderView()}</Suspense>
        </div>
      </div>
    </div>
  );
}
