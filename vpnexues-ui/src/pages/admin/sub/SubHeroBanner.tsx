import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import ExportMenu from '../../../components/admin/ExportMenu';
import { listOrders } from '../../../api/adminOrdersApi';
import { listPayments, type AdminPaymentTxn } from '../../../api/adminPaymentsApi';
import { list as listContactMessages } from '../../../api/adminContactMessagesApi';
import { printTable, type ExportData } from '../../../utils/csvExport';
import type { AdminOrderSummary, ContactMessage } from '../../../types';
import type { CountryConfig } from '../../../config/countryConfig';
import s from '../css/SuperAdminDashboard.module.css';
import b from './SubViews.module.css';

export type SubHeroView =
  | 'dashboard'
  | 'products'
  | 'users'
  | 'reports'
  | 'payments'
  | 'support'
  | 'messages'
  | 'profile'
  | 'settings';

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function firstName(name?: string): string {
  return name?.trim().split(' ')[0] || 'Admin';
}

function getRangeLabel(key: string): string {
  const now = new Date();
  const fmt = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const fmtFull = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const monday = new Date(now);
  monday.setDate(monday.getDate() - ((now.getDay() + 6) % 7));
  const sunday = new Date(monday);
  sunday.setDate(sunday.getDate() + 6);
  switch (key) {
    case 'lastWeek': {
      const lm = new Date(monday); lm.setDate(lm.getDate() - 7);
      const ls = new Date(lm); ls.setDate(ls.getDate() + 6);
      return `${fmt(lm)} - ${fmt(ls)}, ${ls.getFullYear()}`;
    }
    case 'thisMonth': {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      return `${fmt(start)} - ${fmt(end)}, ${end.getFullYear()}`;
    }
    case 'lastMonth': {
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const end = new Date(now.getFullYear(), now.getMonth(), 0);
      return `${fmt(start)} - ${fmt(end)}, ${end.getFullYear()}`;
    }
    case 'last3Months': {
      const start = new Date(now.getFullYear(), now.getMonth() - 2, 1);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      return `${fmt(start)} - ${fmtFull(end)}`;
    }
    default:
      return `${fmt(monday)} - ${fmt(sunday)}, ${sunday.getFullYear()}`;
  }
}

const RANGE_OPTIONS = [
  { key: 'thisWeek', label: 'This Week' },
  { key: 'lastWeek', label: 'Last Week' },
  { key: 'thisMonth', label: 'This Month' },
  { key: 'lastMonth', label: 'Last Month' },
  { key: 'last3Months', label: 'Last 3 Months' },
];

const TRANSPARENT_EXPORT_STYLE: React.CSSProperties = {
  width: '100%',
  height: '100%',
  padding: 0,
  margin: 0,
  background: 'transparent',
  border: 'none',
  borderRadius: 10,
  color: 'inherit',
  fontSize: 'inherit',
  fontWeight: 'inherit',
  fontFamily: 'inherit',
  boxShadow: 'none',
  cursor: 'pointer',
};

/**
 * Shared sub-admin hero banner, rendered by the SubAdminDashboard shell so every
 * page gets a header. Each view mirrors the matching super-admin page banner
 * (dashboard greeting hero, users art hero, payments payHero, support supHero,
 * reports art plate, products image hero); views without a super equivalent use
 * the dashHero art. Styles come from the super-admin module so both dashboards
 * stay pixel-consistent.
 */
export default function SubHeroBanner({
  view,
  config,
  adminName,
}: {
  view: SubHeroView;
  config: CountryConfig;
  adminName?: string;
}) {
  const [orders, setOrders] = useState<AdminOrderSummary[]>([]);
  const [txns, setTxns] = useState<AdminPaymentTxn[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);

  const [dateRangeOpen, setDateRangeOpen] = useState(false);
  const [selectedRange, setSelectedRange] = useState('thisWeek');
  const [dateMenuPos, setDateMenuPos] = useState({ top: 0, left: 0, width: 200 });
  const dateButtonRef = useRef<HTMLButtonElement>(null);
  const dateMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    listOrders({ country: config.code, size: 500 })
      .then((res) => { if (!cancelled) setOrders(res.content); })
      .catch(() => undefined);
    return () => { cancelled = true; };
  }, [config.code]);

  useEffect(() => {
    if (view !== 'payments') return;
    let cancelled = false;
    listPayments()
      .then((all) => { if (!cancelled) setTxns(all); })
      .catch(() => undefined);
    return () => { cancelled = true; };
  }, [view]);

  useEffect(() => {
    if (view !== 'support') return;
    let cancelled = false;
    listContactMessages()
      .then((all) => { if (!cancelled) setMessages(all); })
      .catch(() => undefined);
    return () => { cancelled = true; };
  }, [view]);

  useEffect(() => {
    if (!dateRangeOpen) return;
    const rect = dateButtonRef.current?.getBoundingClientRect();
    if (rect) {
      const menuW = 200;
      let left = rect.right - menuW;
      if (left < 8) left = 8;
      setDateMenuPos({ top: rect.bottom + 8, left, width: menuW }); // fixed = viewport-relative (no scrollY)
    }
    const onScroll = () => setDateRangeOpen(false);
    const onResize = () => {
      const r = dateButtonRef.current?.getBoundingClientRect();
      if (r) {
        const menuW = 200;
        let left = r.right - menuW;
        if (left < 8) left = 8;
        setDateMenuPos({ top: r.bottom + 8, left, width: menuW });
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
    };
  }, [dateRangeOpen]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      const inButton = dateButtonRef.current?.contains(target);
      const inMenu = dateMenuRef.current?.contains(target);
      if (!inButton && !inMenu) setDateRangeOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const pageTitle: Record<SubHeroView, string> = {
    dashboard: `${greeting()}, ${firstName(adminName)}`,
    products: 'Farm Fresh Products',
    users: 'Customers & Orders',
    reports: 'Reports & Analytics',
    payments: 'Payment Analytics',
    support: 'Support Messages',
    messages: 'Messages',
    profile: 'My Account',
    settings: 'Settings',
  };

  function getExportData(): ExportData {
    const title = `${pageTitle[view]} — ${config.name}`;
    const filename = `subadmin-${view}-${config.code.toLowerCase()}-export.csv`;
    if (view === 'payments') {
      const rows = txns
        .filter((t) => t.country === config.code)
        .map((t) => [t.orderNumber, t.customer, t.method, t.status, t.amount]);
      return { filename, title, columns: ['Order #', 'Customer', 'Method', 'Status', 'Amount'], rows };
    }
    if (view === 'support') {
      const rows = messages
        .filter((m) => !m.countryCode || m.countryCode === config.code)
        .map((m) => [m.name, m.email, m.subject, m.status, m.createdAt.slice(0, 10)]);
      return { filename, title, columns: ['Name', 'Email', 'Subject', 'Status', 'Date'], rows };
    }
    const rows = orders.map((o) => [o.orderNumber, o.buyerName ?? o.buyerPhone ?? '', o.status, o.grandTotal, o.createdAt.slice(0, 10)]);
    return { filename, title, columns: ['Order #', 'Buyer', 'Status', 'Total', 'Date'], rows };
  }

  const printReport = () => printTable(getExportData());

  if (view === 'dashboard' || view === 'messages' || view === 'profile' || view === 'settings') {
    const subtitle =
      view === 'dashboard'
        ? `Overview of ${config.name}. Here's what's happening today.`
        : view === 'messages'
          ? `Customer conversations for ${config.name}.`
          : view === 'profile'
            ? 'Manage your profile and security settings.'
            : `Store settings and preferences for ${config.name}.`;
    return (
      <div className={`${s.banner} ${s.dashHero} ${b.subHeroTaller}`}>
        <div className={s.bannerContent}>
          <div className={s.dashHeroGreeting}>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: 'var(--overlay-white-15)', border: '1px solid var(--overlay-white-20)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg className={s.dashHeroIcon} width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
            </div>
            <div>
              <h1 className={s.bannerTitle}>{pageTitle[view]}</h1>
              <p className={s.bannerSubtitle}>{subtitle}</p>
            </div>
          </div>
        </div>
        {view === 'dashboard' && (
          <div className={s.bannerActions} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ position: 'relative' }}>
              <button
                ref={dateButtonRef}
                type="button"
                className={s.dashHeroDateBtn}
                onClick={() => setDateRangeOpen(!dateRangeOpen)}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                {getRangeLabel(selectedRange)}
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: dateRangeOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}><polyline points="6 9 12 15 18 9" /></svg>
              </button>
              {dateRangeOpen && createPortal(
                <div
                  ref={dateMenuRef}
                  className={b.subDateMenu}
                  style={{ top: dateMenuPos.top, left: dateMenuPos.left, width: dateMenuPos.width }}
                >
                  {RANGE_OPTIONS.map((opt) => (
                    <button
                      key={opt.key}
                      type="button"
                      className={selectedRange === opt.key ? `${b.subDateOpt} ${b.subDateOptActive}` : b.subDateOpt}
                      onClick={() => { setSelectedRange(opt.key); setDateRangeOpen(false); }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>,
                document.body
              )}
            </div>
            <ExportMenu
              getData={getExportData}
              label="Export Report"
              buttonStyle={{ background: 'var(--color-white)', color: 'var(--hero-ink)', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600 }}
            />
          </div>
        )}
      </div>
    );
  }

  if (view === 'users') {
    return (
      <div className={`${s.banner} ${s.usersHero} ${b.subHeroTaller}`}>
        <div className={s.usersHeroLayer}>
          <div className={s.usersHeroScrim}><div /></div>
          <div className={s.usersHeroText}>
            <div className={s.usersHeroIcon} aria-hidden="true">
              <svg className={b.subIconWhite} width="22" height="22" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
            </div>
            <div>
              <h1 className={`${s.bannerTitle} ${s.usersHeroTitle}`}>{pageTitle.users}</h1>
              <p className={`${s.bannerSubtitle} ${s.usersHeroSub}`}>Manage customers and orders for {config.name}</p>
            </div>
          </div>
          <div className={`${s.usersHeroHit} ${s.usersHeroExportHit}`}>
            <ExportMenu getData={getExportData} buttonStyle={TRANSPARENT_EXPORT_STYLE} />
          </div>
          <button
            type="button"
            className={`${s.usersHeroHit} ${s.usersHeroAddHit}`}
            onClick={printReport}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="6 9 6 2 18 2 18 9" /><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><rect x="6" y="14" width="12" height="8" /></svg>
            Print
          </button>
        </div>
      </div>
    );
  }

  if (view === 'products') {
    return (
      <div className={b.subProdHero}>
        <img src="/assets-ui/img/product-banner.png" alt="" className={b.subProdHeroImg} />
        <div className={b.subProdHeroOverlay}>
          <div className={b.subProdHeroHead}>
            <svg className={b.subProdHeroIcon} width="28" height="28" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" /></svg>
            <h1 className={b.subProdHeroTitle}>{pageTitle.products}</h1>
          </div>
          <p className={b.subProdHeroSub}>Manage and monitor all your products across {config.name}</p>
        </div>
      </div>
    );
  }

  if (view === 'reports') {
    return (
      <div className={b.subRptHero}>
        {/* Art-coloured plates hide the text baked into reports.jpeg so only the crisp React copy reads */}
        <div className={b.subRptPlateL} />
        <div className={b.subRptPlateMid}>
          <div className={b.subRptPlateMidArt} />
          <div className={b.subRptQuote}>
            <span>Better Insights</span>
            <span>Bigger Growth</span>
          </div>
        </div>
        <div className={b.subRptHead}>
          <div className={b.subRptIcon}>
            <i className="fas fa-chart-line" />
          </div>
          <div>
            <h1 className={b.subRptTitle}>{pageTitle.reports}</h1>
            <p className={b.subRptSub}>Comprehensive business intelligence and reporting dashboard</p>
          </div>
        </div>
        <div className={b.subRptActions}>
          <ExportMenu getData={getExportData} />
          <button type="button" className={`${s.bannerBtn} ${s.reportsPrintBtn}`} onClick={printReport}><i className="fas fa-print" style={{ marginRight: 6 }} />Print</button>
        </div>
      </div>
    );
  }

  if (view === 'payments') {
    return (
      <div className={`${s.payHero} ${b.subHeroTaller}`}>
        <div className={s.payHeroArt} aria-hidden="true">
          <div className={s.payHeroLandscape}>
            <svg viewBox="0 0 560 170" preserveAspectRatio="xMaxYMax meet" xmlns="http://www.w3.org/2000/svg">
              <circle className={b.subFillWhite} cx="470" cy="26" r="22" opacity=".55" />
              <path d="M140 88 C210 58 270 74 330 82 C395 90 470 62 560 72 L560 170 L140 170 Z" fill="rgb(230,244,222)" />
              <g fill="rgb(176,214,158)">
                <ellipse cx="360" cy="74" rx="13" ry="9" />
                <ellipse cx="382" cy="77" rx="10" ry="7" />
                <ellipse cx="342" cy="78" rx="9" ry="6" />
                <ellipse cx="500" cy="64" rx="12" ry="8" />
                <ellipse cx="520" cy="67" rx="9" ry="6" />
              </g>
              <path d="M90 112 C175 86 250 104 330 110 C415 116 495 94 560 102 L560 170 L90 170 Z" fill="rgb(211,235,198)" />
              <g>
                <rect x="424" y="84" width="5" height="22" rx="2.5" fill="rgb(150,116,78)" />
                <circle cx="426" cy="80" r="17" fill="rgb(127,191,99)" />
                <circle cx="412" cy="88" r="11" fill="rgb(111,178,85)" />
                <circle cx="441" cy="87" r="12" fill="rgb(143,203,114)" />
                <rect x="474" y="94" width="4" height="16" rx="2" fill="rgb(150,116,78)" />
                <circle cx="476" cy="90" r="13" fill="rgb(111,178,85)" />
                <circle cx="487" cy="95" r="9" fill="rgb(143,203,114)" />
              </g>
              <path d="M40 134 C140 116 260 140 360 134 C450 128 520 140 560 136 L560 170 L40 170 Z" fill="rgb(191,227,169)" />
              <path d="M0 152 C130 138 270 158 400 150 C470 146 530 154 560 152 L560 170 L0 170 Z" fill="rgb(168,216,142)" />
              <path d="M0 163 C150 155 310 168 450 160 L560 162 L560 170 L0 170 Z" fill="rgb(147,205,118)" />
              <g fill="none" stroke="rgb(130,192,102)" strokeWidth="1.3" opacity=".55">
                <path d="M30 144 C150 132 300 150 555 140" />
                <path d="M15 156 C170 146 330 164 555 152" />
                <path d="M5 166 C180 158 350 170 555 162" />
              </g>
              <path d="M556 170 C520 156 470 148 430 140 C395 133 365 124 348 114" fill="none" stroke="rgb(246,242,224)" strokeWidth="8" strokeLinecap="round" opacity=".85" />
            </svg>
          </div>
          <div className={s.payHeroSprig}>
            <svg viewBox="0 0 78 34" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 31 C20 26 44 18 72 5" fill="none" stroke="rgb(124,177,99)" strokeWidth="2" strokeLinecap="round" opacity=".8" />
              <g opacity=".75">
                <path d="M0 0 C4 -7 12 -10 19 -9 C17 -2 9 3 0 0 Z" fill="rgb(140,199,109)" transform="translate(14,26) rotate(205)" />
                <path d="M0 0 C4 -7 12 -10 19 -9 C17 -2 9 3 0 0 Z" fill="rgb(120,183,92)" transform="translate(28,21) rotate(28)" />
                <path d="M0 0 C4 -7 12 -10 19 -9 C17 -2 9 3 0 0 Z" fill="rgb(140,199,109)" transform="translate(42,16) rotate(212)" />
                <path d="M0 0 C4 -7 12 -10 19 -9 C17 -2 9 3 0 0 Z" fill="rgb(120,183,92)" transform="translate(56,11) rotate(32)" />
                <path d="M0 0 C4 -7 12 -10 19 -9 C17 -2 9 3 0 0 Z" fill="rgb(140,199,109)" transform="translate(72,5) rotate(-58)" />
              </g>
            </svg>
          </div>
        </div>
        <div className={s.payHeroRow}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div className={s.payHeroIcon}>
              <svg className={b.subIconWhite} width="26" height="26" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" /></svg>
            </div>
            <div className={s.payHeroTitleBlock}>
              <h1 className={s.payHeroTitle}>{pageTitle.payments}</h1>
              <p className={s.payHeroSub}>Track payment transactions for {config.name}</p>
            </div>
          </div>
          <div className={s.payHeroActions}>
            <ExportMenu getData={getExportData} buttonStyle={{ background: 'var(--hero-green)', border: '1px solid var(--hero-green)', color: 'var(--color-white)', boxShadow: 'var(--hero-export-shadow)' }} />
            <button type="button" onClick={printReport} className={s.payHeroPrintBtn}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9" /><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><rect x="6" y="14" width="12" height="8" /></svg>
              Print
            </button>
          </div>
        </div>
      </div>
    );
  }

  // view === 'support'
  return (
    <div className={`${s.payHero} ${s.supHero} ${b.subHeroTaller}`}>
      <span style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)', whiteSpace: 'nowrap' }}>
        {pageTitle.support} — manage customer support inquiries for {config.name}
      </span>
      {/* Visible buttons laid over the Print / Export pills drawn into support.jpeg */}
      <div className={s.supHeroHits}>
        <button
          type="button"
          className={`${s.supHeroHit} ${s.supHeroPrintHit}`}
          onClick={printReport}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="6 9 6 2 18 2 18 9" /><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><rect x="6" y="14" width="12" height="8" /></svg>
          Print
        </button>
        <div className={`${s.supHeroHit} ${s.supHeroExportHit}`}>
          <ExportMenu getData={getExportData} buttonStyle={TRANSPARENT_EXPORT_STYLE} />
        </div>
      </div>
    </div>
  );
}
