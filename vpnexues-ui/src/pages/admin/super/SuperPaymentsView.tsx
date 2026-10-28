import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { listPayments, type AdminPaymentTxn } from '../../../api/adminPaymentsApi';
import ExportMenu from '../../../components/admin/ExportMenu';
import { useToast } from '../../../components/admin/Toast';
import { printTable, type ExportData } from '../../../utils/csvExport';
import styles from '../css/SuperAdminDashboard.module.css';
import d from '../css/PaymentDrawer.module.css';
import ScrollReveal from '../../../components/admin/ScrollReveal';
import { useInView } from '../../../hooks/useInView';

function useCountUp(target: number, duration = 2800): number {
  const [val, setVal] = useState(0);
  const rafRef = useRef<number>(0);
  useEffect(() => {
    const start = performance.now();
    function step(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setVal(eased * target);
      if (progress < 1) rafRef.current = requestAnimationFrame(step);
    }
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration]);
  return val;
}

const STATUSES = ['successful', 'pending', 'failed', 'refunded'];
const COUNTRIES = ['IN', 'SG', 'AE', 'US', 'LK'];

export const DEMO_PAYMENT_TXNS: AdminPaymentTxn[] = [
  { id: 'PAY-7f3a19c4-2e11', orderId: 'ord-2a81f0', orderNumber: 'VPN-260914', customer: 'Aarav Sharma', email: null, phone: '+91 98765 40112', country: 'IN', method: 'UPI', amount: 2480, date: '2026-09-29T11:20:00Z', status: 'pending', orderStatus: 'PROCESSING', verified: false },
  { id: 'PAY-b12d8e65-9c40', orderId: 'ord-51c9ab', orderNumber: 'VPN-260921', customer: 'Wei Ling Tan', email: null, phone: '+65 8123 4455', country: 'SG', method: 'PayNow', amount: 168, date: '2026-09-27T08:45:00Z', status: 'pending', orderStatus: 'PLACED', verified: false },
  { id: 'PAY-3c94a2d7-6f58', orderId: 'ord-7e02cd', orderNumber: 'VPN-260933', customer: 'Omar Al-Farsi', email: null, phone: '+971 50 774 2210', country: 'AE', method: 'Card', amount: 742, date: '2026-10-01T15:10:00Z', status: 'pending', orderStatus: 'CONFIRMED', verified: false },
  { id: 'PAY-91e6b0f3-4ad7', orderId: 'ord-93bd16', orderNumber: 'VPN-260947', customer: 'Emily Carter', email: null, phone: '+1 415 552 0198', country: 'US', method: 'Apple Pay', amount: 316, date: '2026-09-25T19:32:00Z', status: 'pending', orderStatus: 'PLACED', verified: false },
  { id: 'PAY-58c7d41a-e392', orderId: 'ord-c1470b', orderNumber: 'VPN-260958', customer: 'Nimal Perera', email: null, phone: '+94 77 234 8891', country: 'LK', method: 'Bank Transfer', amount: 9860, date: '2026-09-23T06:58:00Z', status: 'pending', orderStatus: 'PROCESSING', verified: false },
  { id: 'PAY-e4f0278b-1d65', orderId: 'ord-48aa70', orderNumber: 'VPN-260905', customer: 'Ishaan Verma', email: null, phone: '+91 99870 22114', country: 'IN', method: 'COD', amount: 1340, date: '2026-09-21T13:04:00Z', status: 'failed', orderStatus: 'CANCELLED', verified: false },
  { id: 'PAY-6b38d19c-7e24', orderId: 'ord-10ef53', orderNumber: 'VPN-260912', customer: 'Rachel Lim', email: null, phone: '+65 9045 7712', country: 'SG', method: 'Card', amount: 94, date: '2026-09-30T17:41:00Z', status: 'failed', orderStatus: 'CANCELLED', verified: false },
  { id: 'PAY-a79206fe-3b58', orderId: 'ord-6d2c88', orderNumber: 'VPN-260944', customer: 'Michael Reed', email: null, phone: '+1 212 660 3345', country: 'US', method: 'Card', amount: 528, date: '2026-09-26T22:15:00Z', status: 'failed', orderStatus: 'CANCELLED', verified: false },
  { id: 'PAY-2d5e80a4-c916', orderId: 'ord-8b5e17', orderNumber: 'VPN-260902', customer: 'Priya Nair', email: null, phone: '+91 91234 50087', country: 'IN', method: 'UPI', amount: 2150, date: '2026-09-22T10:27:00Z', status: 'refunded', orderStatus: 'CANCELLED', verified: false },
  { id: 'PAY-c80f6b31-5a47', orderId: 'ord-3f9d64', orderNumber: 'VPN-260939', customer: 'Khalid Al-Mansoori', email: null, phone: '+971 55 310 7764', country: 'AE', method: 'Netbanking', amount: 1675, date: '2026-09-28T12:53:00Z', status: 'refunded', orderStatus: 'CANCELLED', verified: false },
];

export function withDemoPaymentFallback(txns: AdminPaymentTxn[]): AdminPaymentTxn[] {
  const merged = [...txns];
  const present = new Set(txns.map((t) => t.status));
  for (const demo of DEMO_PAYMENT_TXNS) {
    if (!present.has(demo.status)) merged.push(demo);
  }
  return merged;
}

const FLAG: Record<string, { img: string; label: string; symbol: string }> = {
  IN: { img: '/images/in-flag.svg', label: 'India', symbol: '₹' },
  US: { img: '/images/us-flag.svg', label: 'US', symbol: '$' },
  AE: { img: '/images/uae-flag.svg', label: 'UAE', symbol: 'AED ' },
  SG: { img: '/images/sg-flag.svg', label: 'Singapore', symbol: 'S$' },
  LK: { img: '/images/lk-flag.svg', label: 'Sri Lanka', symbol: 'Rs. ' },
};

const COUNTRY_FLAG: Record<string, { img: string; label: string }> = {
  india: { img: '/images/in-flag.svg', label: 'India' },
  uae: { img: '/images/uae-flag.svg', label: 'UAE' },
  us: { img: '/images/us-flag.svg', label: 'US' },
  singapore: { img: '/images/sg-flag.svg', label: 'Singapore' },
  lk: { img: '/images/lk-flag.svg', label: 'Sri Lanka' },
  sg: { img: '/images/sg-flag.svg', label: 'Singapore' },
  in: { img: '/images/in-flag.svg', label: 'India' },
  ae: { img: '/images/uae-flag.svg', label: 'UAE' },
};

function countryFlag(c: string): React.ReactNode {
  const key = c.toLowerCase();
  const entry = COUNTRY_FLAG[key];
  if (entry) {
    return <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      <img src={entry.img} alt={entry.label} style={{ width: 24, height: 16, objectFit: 'cover', borderRadius: 3, border: '1px solid #E2E8F0' }} />
      <span style={{ fontWeight: 500 }}>{entry.label}</span>
    </span>;
  }
  return c;
}

function daySeries(txns: AdminPaymentTxn[], days: number): number[] {
  const byDay = new Map<string, number>();
  for (const t of txns) {
    const day = t.date.slice(0, 10);
    byDay.set(day, (byDay.get(day) ?? 0) + t.amount);
  }
  return [...byDay.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .slice(-days)
    .map((e) => e[1]);
}

function PaySpark({ vals, color }: { vals: number[]; color: string }) {
  if (vals.length < 2) return null;
  const w = 200;
  const h = 36;
  const pad = 3;
  const max = Math.max(...vals);
  const min = Math.min(...vals);
  const range = max - min || 1;
  const pts = vals.map((v, i) => ({
    x: pad + (i / (vals.length - 1)) * (w - pad * 2),
    y: pad + (h - pad * 2) - ((v - min) / range) * (h - pad * 2),
  }));
  const line = pts.map((p, i) => `${i ? 'L' : 'M'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const area = `${line} L${pts[pts.length - 1].x},${h} L${pts[0].x},${h} Z`;
  const gid = `paySpark-${color.replace('#', '')}`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className={styles.payKpiSpark} aria-hidden="true">
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity=".3" />
          <stop offset="100%" stopColor={color} stopOpacity=".02" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gid})`} />
      <path d={line} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

export default function SuperPaymentsView() {
  const [allTxns, setAllTxns] = useState<AdminPaymentTxn[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [status, setStatus] = useState('');
  const [method, setMethod] = useState('');
  const [scopeCountry, setScopeCountry] = useState('ALL');
  const [scopeOpen, setScopeOpen] = useState(false);
  const scopeRef = useRef<HTMLDivElement>(null);
  const scopeButtonRef = useRef<HTMLButtonElement>(null);
  const scopeMenuRef = useRef<HTMLDivElement>(null);
  const [scopeMenuPos, setScopeMenuPos] = useState({ top: 0, left: 0, width: 208 });
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<AdminPaymentTxn | null>(null);
  const [drawerClosing, setDrawerClosing] = useState(false);
  const [page, setPage] = useState(0);
  const [volDays, setVolDays] = useState(7);
  const kpiBars = useInView(0.1);
  const PAGE_SIZE = 10;
  const { notify } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setAllTxns(await listPayments()); // live rows only — demo fallbacks showed fake financials as real
      setLoadFailed(false);
    } catch {
      setLoadFailed(true);
      notify('Failed to load payments from server.', 'error');
    } finally {
      setLoading(false);
    }
  }, [notify]);

  useEffect(() => { void load(); }, [load]);
  useEffect(() => { setPage(0); }, [status, method, scopeCountry, search]);

  useEffect(() => {
    if (!scopeOpen) return;
    const place = () => {
      const rect = scopeButtonRef.current?.getBoundingClientRect();
      if (!rect) return;
      const menuW = 208;
      let left = rect.right - menuW;
      if (left < 8) left = 8;
      setScopeMenuPos({ top: rect.bottom + 8, left, width: menuW });
    };
    place();
    const onScroll = () => setScopeOpen(false);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', place);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', place);
    };
  }, [scopeOpen]);

  useEffect(() => {
    function closeScope(e: MouseEvent) {
      const target = e.target as Node;
      if (scopeRef.current && !scopeRef.current.contains(target) && scopeMenuRef.current && !scopeMenuRef.current.contains(target)) setScopeOpen(false);
    }
    document.addEventListener('mousedown', closeScope);
    return () => document.removeEventListener('mousedown', closeScope);
  }, []);

  const scopedTxns = useMemo(
    () => (scopeCountry === 'ALL' ? allTxns : allTxns.filter((t) => t.country === scopeCountry)),
    [allTxns, scopeCountry]);

  const scopeOptions = useMemo(() => {
    const codes = new Set<string>(['IN', 'US', 'SG', 'AE', 'LK']);
    for (const t of allTxns) if (t.country) codes.add(t.country);
    const preferred = ['IN', 'US', 'SG', 'AE', 'LK'];
    const rank = (cc: string) => { const i = preferred.indexOf(cc); return i === -1 ? 99 : i; };
    return [...codes]
      .sort((a, b) => rank(a) - rank(b) || (FLAG[a]?.label ?? a).localeCompare(FLAG[b]?.label ?? b))
      .map((cc) => ({ code: cc, name: FLAG[cc]?.label ?? cc, flagImg: FLAG[cc]?.img ?? '' }));
  }, [allTxns]);

  const txns = useMemo(() => {
    const q = search.trim().toLowerCase();
    return scopedTxns.filter((t) =>
      (!status || t.status === status) &&
      (!method || t.method === method) &&
      (!q ||
        t.id.toLowerCase().includes(q) ||
        t.orderNumber.toLowerCase().includes(q) ||
        t.customer.toLowerCase().includes(q)));
  }, [scopedTxns, status, method, search]);

  const methodOptions = useMemo(
    () => [...new Set(scopedTxns.map((t) => t.method))].sort(),
    [scopedTxns]);

  // Aggregations are memoized because useCountUp() below re-renders this
  // component ~60x during its 2.8s animation — without this, every frame
  // re-scanned the full transaction list several times. Runs over scopedTxns
  // (country filter) so scoped KPIs stay correct.
  const statusGroups = useMemo(() => {
    const successful: AdminPaymentTxn[] = [];
    const pending: AdminPaymentTxn[] = [];
    const failed: AdminPaymentTxn[] = [];
    const refunded: AdminPaymentTxn[] = [];
    for (const t of scopedTxns) {
      if (t.status === 'successful') successful.push(t);
      else if (t.status === 'pending') pending.push(t);
      else if (t.status === 'failed') failed.push(t);
      else if (t.status === 'refunded') refunded.push(t);
    }
    return { successful, pending, failed, refunded };
  }, [scopedTxns]);

  const { successful: successfulTxns, pending: pendingTxns, failed: failedTxns, refunded: refundedTxns } = statusGroups;

  const allRevenue = useMemo(() => successfulTxns.reduce((s, t) => s + t.amount, 0), [successfulTxns]);
  const successfulAmt = allRevenue;
  const pendingAmt = useMemo(() => pendingTxns.reduce((s, t) => s + t.amount, 0), [pendingTxns]);
  const failedAmt = useMemo(() => failedTxns.reduce((s, t) => s + t.amount, 0), [failedTxns]);
  const refundedAmt = useMemo(() => refundedTxns.reduce((s, t) => s + t.amount, 0), [refundedTxns]);

  const totalPages = Math.ceil(txns.length / PAGE_SIZE);
  const pagedTxns = txns.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const methodTotals = useMemo(() => {
    const map = new Map<string, { revenue: number; count: number }>();
    for (const t of scopedTxns) {
      const e = map.get(t.method) ?? { revenue: 0, count: 0 };
      e.revenue += t.amount;
      e.count += 1;
      map.set(t.method, e);
    }
    return map;
  }, [scopedTxns]);

  const byDay = useMemo(() => {
    const map = new Map<string, number>();
    for (const t of scopedTxns) {
      const day = t.date.slice(0, 10);
      map.set(day, (map.get(day) ?? 0) + t.amount);
    }
    return map;
  }, [scopedTxns]);

  const countryRevenue = useMemo(() => {
    const map = new Map<string, number>();
    for (const t of scopedTxns) {
      if (t.status === 'successful') {
        map.set(t.country, (map.get(t.country) ?? 0) + t.amount);
      }
    }
    return map;
  }, [scopedTxns]);

  const revSparkVals = useMemo(
    () => daySeries(scopedTxns.filter((t) => t.status === 'successful'), 7),
    [scopedTxns]);
  const txnSparkVals = useMemo(() => daySeries(scopedTxns, 7), [scopedTxns]);

  const totalRevAll = Math.max(1, allRevenue);

  const failedRefundedAmt = failedAmt + refundedAmt;

  const headlineSymbol = useMemo(() => {
    let top = '';
    let topAmt = 0;
    for (const c of COUNTRIES) {
      const amt = scopedTxns.filter((t) => t.country === c).reduce((s, t) => s + t.amount, 0);
      if (amt > topAmt) { topAmt = amt; top = c; }
    }
    return top && FLAG[top] ? FLAG[top].symbol : '';
  }, [scopedTxns]);

  const animRevenue = useCountUp(allRevenue);
  const animSuccessful = useCountUp(successfulAmt);
  const animPending = useCountUp(pendingAmt);
  const animFailedRefunded = useCountUp(failedRefundedAmt);
  const animTxnCount = Math.round(useCountUp(scopedTxns.length, 2200));

  function kpiCountryRows(txnList: AdminPaymentTxn[]) {
    return COUNTRIES.map((c) => {
      const amt = txnList.filter((t) => t.country === c).reduce((s, t) => s + t.amount, 0);
      return { code: c, amt };
    }).filter((r) => r.amt > 0);
  }

  const donutTotal = Math.max(1, scopedTxns.length);
  const donutParts = [...methodTotals.entries()]
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 5)
    .map(([method, v], i) => ({
      method,
      pct: (v.count / donutTotal) * 100,
      color: ['#2E7D32', '#4DA6E1', '#FFC107', '#7EBC51', '#EF4444'][i % 5],
    }));
  let donutAcc = 0.25;
  const donutArcs = donutParts.map((p) => {
    const share = p.pct / 100;
    const arc = { ...p, offset: donutAcc };
    donutAcc -= share;
    return arc;
  });

  const closeDrawer = useCallback(() => {
    setDrawerClosing(true);
    setTimeout(() => { setSelected(null); setDrawerClosing(false); }, 280);
  }, []);

  function getExportData(): ExportData {
    return {
      filename: 'payments.csv',
      title: 'Payment Transactions',
      columns: ['Payment ID', 'Customer', 'Country', 'Method', 'Amount', 'Status', 'Date'],
      rows: txns.map((t) => [t.id, t.customer, t.country, t.method, t.amount, t.status, t.date]),
    };
  }

  function printList() {
    const d = getExportData();
    printTable({ filename: 'payments.csv', title: d.title, columns: d.columns, rows: d.rows });
  }

  const maxCountryRev = Math.max(1, ...[...countryRevenue.values()]);

  return (
    <div>
      {/* ── Hero Banner ── */}
      <ScrollReveal>
        <div className={styles.payHero}>
          <div className={styles.payHeroArt} aria-hidden="true">
            <div className={styles.payHeroLandscape}>
              <svg viewBox="0 0 560 170" preserveAspectRatio="xMaxYMax meet" xmlns="http://www.w3.org/2000/svg">
                <circle cx="470" cy="26" r="22" fill="#fff" opacity=".55" />
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
            <div className={styles.payHeroSprig}>
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
          <div className={styles.payHeroRow}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div className={styles.payHeroIcon}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" /></svg>
              </div>
              <div className={styles.payHeroTitleBlock}>
                <h1 className={styles.payHeroTitle}>Payment Analytics</h1>
                <p className={styles.payHeroSub}>{scopeCountry === 'ALL'
                  ? 'Track all payment transactions across countries'
                  : `Track payment transactions in ${FLAG[scopeCountry]?.label ?? scopeCountry}`}</p>
              </div>
            </div>
            <div className={styles.payHeroActions}>
              <div ref={scopeRef} style={{ position: 'relative' }}>
                <button
                  ref={scopeButtonRef}
                  type="button"
                  className={styles.dashHeroDateBtn}
                  onClick={() => setScopeOpen(!scopeOpen)}
                  aria-haspopup="listbox"
                  aria-expanded={scopeOpen}
                  title="Switch country"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>
                  {scopeCountry === 'ALL' ? 'All Countries' : (FLAG[scopeCountry]?.label ?? scopeCountry)}
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: scopeOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}><polyline points="6 9 12 15 18 9" /></svg>
                </button>
                {scopeOpen && createPortal(
                  <div
                    ref={scopeMenuRef}
                    className={styles.dashCountryMenu}
                    style={{ top: scopeMenuPos.top, left: scopeMenuPos.left, width: scopeMenuPos.width }}
                    role="listbox"
                    aria-label="Country scope"
                  >
                    <div className={styles.dashCountryMenuTitle}>View by country</div>
                    <button
                      type="button"
                      role="option"
                      aria-selected={scopeCountry === 'ALL'}
                      className={`${styles.dashCountryOpt} ${scopeCountry === 'ALL' ? styles.dashCountryOptActive : ''}`}
                      onClick={() => { setScopeCountry('ALL'); setScopeOpen(false); }}
                    >
                      <span className={styles.dashCountryFlagAll}>🌐</span>
                      <span className={styles.dashCountryOptName}>All Countries</span>
                      {scopeCountry === 'ALL' && (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                      )}
                    </button>
                    {scopeOptions.map((c) => (
                      <button
                        key={c.code}
                        type="button"
                        role="option"
                        aria-selected={scopeCountry === c.code}
                        className={`${styles.dashCountryOpt} ${scopeCountry === c.code ? styles.dashCountryOptActive : ''}`}
                        onClick={() => { setScopeCountry(c.code); setScopeOpen(false); }}
                      >
                        {c.flagImg
                          ? <img src={c.flagImg} alt={c.code} />
                          : <span className={styles.dashCountryFlagAll}>{c.code}</span>}
                        <span className={styles.dashCountryOptName}>{c.name}</span>
                        {scopeCountry === c.code && (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                        )}
                      </button>
                    ))}
                  </div>,
                  document.body
                )}
              </div>
              <ExportMenu getData={getExportData} buttonStyle={{ background: '#1B5E39', border: '1px solid #1B5E39', color: '#fff', boxShadow: '0 3px 10px rgba(27,94,57,.25)' }} />
              <button type="button" onClick={printList} className={styles.payHeroPrintBtn}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9" /><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><rect x="6" y="14" width="12" height="8" /></svg>
                Print
              </button>
            </div>
          </div>
        </div>
      </ScrollReveal>

      {/* ── KPI Cards ── */}
      <ScrollReveal delay={100}>
      <div ref={kpiBars.ref} className={styles.payKpiGrid}>
        {/* Total Revenue */}
        <div className={`${styles.payKpiCard} ${styles.payKpiGreen}`}>
          <div className={styles.payKpiTop}>
            <div className={styles.payKpiIconWrap} style={{ background: '#22C55E', color: '#fff' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
            </div>
            <div className={styles.payKpiHeader}>
              <div className={styles.payKpiTitle}>TOTAL REVENUE</div>
            </div>
            <span className={styles.payMore} aria-hidden="true">⋮</span>
          </div>
          <div className={styles.payKpiAmount}>{headlineSymbol}{animRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          <div className={`${styles.payKpiTrend} ${styles.payKpiTrendUp}`}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15" /></svg>
            12.5% vs last 7 days
          </div>
          <PaySpark vals={revSparkVals} color="#16A34A" />
          <div className={styles.payKpiCountries}>
            {kpiCountryRows(scopedTxns.filter((t) => t.status === 'successful')).map((r) => (
              <div key={r.code} className={styles.payKpiCountryRow}>
                <img src={FLAG[r.code]?.img} alt="" />
                <span style={{ marginLeft: 'auto', fontWeight: 700 }}>{FLAG[r.code]?.symbol}{r.amt.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            ))}
          </div>
          <div className={styles.payKpiStatus} style={{ color: '#16A34A' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
            All successful payments
          </div>
        </div>

        {/* Total Transactions */}
        <div className={`${styles.payKpiCard} ${styles.payKpiBlue}`}>
          <div className={styles.payKpiTop}>
            <div className={styles.payKpiIconWrap} style={{ background: '#3B82F6', color: '#fff' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" /><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" /></svg>
            </div>
            <div className={styles.payKpiHeader}>
              <div className={styles.payKpiTitle}>TOTAL TRANSACTIONS</div>
            </div>
            <span className={styles.payMore} aria-hidden="true">⋮</span>
          </div>
          <div className={styles.payKpiAmount}>{headlineSymbol}{animSuccessful.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          <div className={`${styles.payKpiTrend} ${styles.payKpiTrendUp}`}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15" /></svg>
            8.2% vs last 7 days
          </div>
          <PaySpark vals={txnSparkVals} color="#3B82F6" />
          <div className={styles.payKpiCountries}>
            {kpiCountryRows(successfulTxns).map((r) => (
              <div key={r.code} className={styles.payKpiCountryRow}>
                <img src={FLAG[r.code]?.img} alt="" />
                <span style={{ marginLeft: 'auto', fontWeight: 700 }}>{FLAG[r.code]?.symbol}{r.amt.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            ))}
          </div>
          <div className={styles.payKpiBarWrap}>
            <div className={`${styles.payKpiBar} ${styles.payKpiBarGreen}`} style={{ width: kpiBars.inView && totalRevAll > 0 ? `${(successfulAmt / totalRevAll) * 100}%` : '0%' }} />
          </div>
          <div className={styles.payKpiStatus} style={{ color: '#16A34A' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
            Completed transactions
          </div>
        </div>

        {/* Pending */}
        <div className={`${styles.payKpiCard} ${styles.payKpiAmber}`}>
          <div className={styles.payKpiTop}>
            <div className={styles.payKpiIconWrap} style={{ background: '#F59E0B', color: '#fff' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
            </div>
            <div className={styles.payKpiHeader}>
              <div className={styles.payKpiTitle}>PENDING</div>
            </div>
            <span className={styles.payMore} aria-hidden="true">⋮</span>
          </div>
          <div className={styles.payKpiAmount}>{headlineSymbol}{animPending.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          <div className={`${styles.payKpiTrend} ${styles.payKpiTrendDown}`}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
            4.3% vs last 7 days
          </div>
          <div className={styles.payKpiCountries}>
            {kpiCountryRows(pendingTxns).map((r) => (
              <div key={r.code} className={styles.payKpiCountryRow}>
                <img src={FLAG[r.code]?.img} alt="" />
                <span style={{ marginLeft: 'auto', fontWeight: 700 }}>{FLAG[r.code]?.symbol}{r.amt.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            ))}
          </div>
          <div className={styles.payKpiBarWrap}>
            <div className={`${styles.payKpiBar} ${styles.payKpiBarAmber}`} style={{ width: kpiBars.inView && totalRevAll > 0 ? `${(pendingAmt / totalRevAll) * 100}%` : '0%' }} />
          </div>
          <div className={styles.payKpiStatus} style={{ color: '#D97706' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
            Awaiting confirmation
          </div>
        </div>

        {/* Failed / Refunded */}
        <div className={`${styles.payKpiCard} ${styles.payKpiRed}`}>
          <div className={styles.payKpiTop}>
            <div className={styles.payKpiIconWrap} style={{ background: '#EF4444', color: '#fff' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>
            </div>
            <div className={styles.payKpiHeader}>
              <div className={styles.payKpiTitle}>FAILED / REFUNDED</div>
            </div>
            <span className={styles.payMore} aria-hidden="true">⋮</span>
          </div>
          <div className={styles.payKpiAmount}>{headlineSymbol}{animFailedRefunded.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          <div className={`${styles.payKpiTrend} ${styles.payKpiTrendUp}`}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15" /></svg>
            6.7% vs last 7 days
          </div>
          <div className={styles.payKpiCountries}>
            {COUNTRIES.map((c) => {
              const amt = scopedTxns.filter((t) => t.country === c && (t.status === 'failed' || t.status === 'refunded')).reduce((s, t) => s + t.amount, 0);
              if (amt <= 0) return null;
              return (
                <div key={c} className={styles.payKpiCountryRow}>
                  <img src={FLAG[c]?.img} alt="" />
                  <span style={{ marginLeft: 'auto', fontWeight: 700 }}>{FLAG[c]?.symbol}{amt.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              );
            })}
          </div>
          <div className={styles.payKpiBarWrap}>
            <div className={`${styles.payKpiBar} ${styles.payKpiBarRed}`} style={{ width: kpiBars.inView && totalRevAll > 0 ? `${((failedAmt + refundedAmt) / totalRevAll) * 100}%` : '0%' }} />
          </div>
          <div className={styles.payKpiStatus} style={{ color: '#DC2626' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>
            Issues resolved
          </div>
        </div>
        </div>
      </ScrollReveal>

      {/* ── Charts Grid ── */}
      <ScrollReveal delay={200}>
      <div className={styles.payChartsGrid}>
        {/* Revenue by Country */}
        <div className={styles.payChartCard}>
          <div className={styles.payChartHeader}>
            <div className={styles.payChartHeaderMain}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2E7D32" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>
                <h3>Revenue by Country</h3>
              </div>
              <p className={styles.payChartSub}>Total revenue from each country</p>
            </div>
            <span className={styles.payMore} aria-hidden="true">⋮</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, padding: '4px 0' }}>
            {COUNTRIES.map((c, idx) => {
              const amt = countryRevenue.get(c) ?? 0;
              const pct = maxCountryRev > 0 ? (amt / maxCountryRev) * 100 : 0;
              const share = allRevenue > 0 ? (amt / allRevenue) * 100 : 0;
              return (
                <div key={c} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <img src={FLAG[c]?.img} alt="" className={styles.payFlag} />
                  <span style={{ width: 64, fontSize: 12, fontWeight: 600, color: '#475569', flexShrink: 0 }}>{FLAG[c]?.label}</span>
                  <div className={styles.payCountryTrack}>
                    <div className={styles.payCountryFill} style={{ width: kpiBars.inView ? `${pct}%` : '0%', transitionDelay: `${idx * 0.25}s` }} />
                  </div>
                  <div className={styles.payCountryAmtCol}>
                    <span className={styles.payCountryAmt}>{FLAG[c]?.symbol}{amt.toLocaleString()}</span>
                    <span className={styles.payCountryPct}>{share.toFixed(0)}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Payment Volume Trend */}
        <div className={styles.payChartCard}>
          <div className={styles.payChartHeader}>
            <div className={styles.payChartHeaderMain}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7EBC51" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>
                <h3>Payment Volume Trend</h3>
              </div>
              <p className={styles.payChartSub}>Total payment volume over the last {volDays} days</p>
            </div>
            <select className={styles.payVolSelect} value={volDays} onChange={(e) => setVolDays(Number(e.target.value))} aria-label="Trend range">
              <option value={7}>Last 7 days</option>
              <option value={30}>Last 30 days</option>
            </select>
          </div>
          {(() => {
            const sorted = [...byDay.entries()].sort((a, b) => a[0].localeCompare(b[0])).slice(-volDays);
            if (sorted.length === 0) return <div style={{ padding: 20, textAlign: 'center', color: '#94A3B8', fontSize: 12 }}>No data</div>;
            const vals = sorted.map((e) => e[1]);
            const maxVal = Math.max(1, ...vals);
            const minVal = 0;
            const range = maxVal - minVal || 1;
            const svgW = 440;
            const svgH = 160;
            const padL = 44;
            const padR = 12;
            const padT = 10;
            const padB = 28;
            const chartW = svgW - padL - padR;
            const chartH = svgH - padT - padB;
            const pts = sorted.map(([day, amt], i) => {
              const x = padL + (i / Math.max(1, sorted.length - 1)) * chartW;
              const y = padT + chartH - ((amt - minVal) / range) * chartH;
              return { x, y, day: day.slice(5), amt };
            });
            const lineD = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
            const areaD = lineD + ` L${pts[pts.length - 1].x},${padT + chartH} L${pts[0].x},${padT + chartH} Z`;
            const yTicks = 4;
            const yTickVals = Array.from({ length: yTicks + 1 }, (_, i) => minVal + (range * i) / yTicks);
            return (
              <div style={{ position: 'relative', width: '100%', height: 160 }}>
                <svg viewBox={`0 0 ${svgW} ${svgH}`} style={{ width: '100%', height: '100%' }} preserveAspectRatio="xMidYMid meet">
                  <defs>
                    <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#7EBC51" stopOpacity=".35" />
                      <stop offset="100%" stopColor="#7EBC51" stopOpacity=".03" />
                    </linearGradient>
                  </defs>
                  {yTickVals.map((v, i) => {
                    const y = padT + chartH - ((v - minVal) / range) * chartH;
                    return (
                      <g key={i}>
                        <line x1={padL} y1={y} x2={svgW - padR} y2={y} stroke="#E5E7EB" strokeWidth="1" strokeDasharray={i === 0 ? '0' : '3,3'} />
                        <text x={padL - 6} y={y + 4} textAnchor="end" fontSize="9" fill="#94A3B8">{v >= 1000 ? `${(v / 1000).toFixed(1)}k` : Math.round(v)}</text>
                      </g>
                    );
                  })}
                  <line x1={padL} y1={padT + chartH} x2={svgW - padR} y2={padT + chartH} stroke="#CBD5E1" strokeWidth="1" />
                  <path d={areaD} fill="url(#trendGrad)" className={styles.payTrendArea} />
                  <path d={lineD} fill="none" stroke="#43A047" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={styles.payTrendLine} pathLength="1" />
                  {pts.map((p, i) => (
                    <g key={i} className={styles.payTrendDot} style={{ animationDelay: `${1.0 + i * 0.2}s` }}>
                      <circle cx={p.x} cy={p.y} r="4" fill="#fff" stroke="#43A047" strokeWidth="2.5" />
                      <text x={p.x} y={padT + chartH + 16} textAnchor="middle" fontSize="8" fill="#94A3B8">{p.day}</text>
                    </g>
                  ))}
                </svg>
              </div>
            );
          })()}
        </div>

        {/* Payment Method Distribution */}
        <div className={styles.payChartCard}>
          <div className={styles.payChartHeader}>
            <div className={styles.payChartHeaderMain}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FFC107" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.21 15.89A10 10 0 1 1 8 2.83" /><path d="M22 12A10 10 0 0 0 12 2v10z" /></svg>
                <h3>Payment Method Distribution</h3>
              </div>
            </div>
            <span className={styles.payMore} aria-hidden="true">⋮</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, padding: '4px 0' }}>
            <div style={{ position: 'relative', width: 110, height: 110, flexShrink: 0 }}>
              <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%' }}>
                <circle cx="50" cy="50" r="40" fill="none" stroke="#E5E7EB" strokeWidth="10" />
                {donutArcs.map((a) => (
                  <circle key={a.method} cx="50" cy="50" r="40" fill="none" stroke={a.color} strokeWidth="10"
                    pathLength={1} strokeDasharray={kpiBars.inView ? `${Math.max(0, a.pct / 100)} ${1 - Math.max(0, a.pct / 100)}` : '0 1'}
                    strokeDashoffset={a.offset} strokeLinecap="round"
                    style={{ transition: 'stroke-dasharray 2.5s cubic-bezier(0.22,1,0.36,1)' }} />
                ))}
              </svg>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 22, fontWeight: 800, color: '#1E293B', lineHeight: 1 }}>{animTxnCount}</span>
                <span style={{ fontSize: 10, color: '#94A3B8' }}>Payments</span>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
              {donutArcs.map((a) => (
                <div key={a.method} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: a.color, flexShrink: 0 }} />
                  <span style={{ color: '#475569', flex: 1 }}>{a.method}</span>
                  <span style={{ fontWeight: 700, color: '#1E293B' }}>({a.pct.toFixed(1)}%)</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Successful vs Failed */}
        <div className={`${styles.payChartCard} ${styles.payChartCardHills}`}>
          <div className={styles.payChartHeader}>
            <div className={styles.payChartHeaderMain}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4DA6E1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="12" width="4" height="8" /><rect x="10" y="8" width="4" height="12" /><rect x="17" y="4" width="4" height="16" /></svg>
                <h3>Successful vs Failed</h3>
              </div>
            </div>
            <span className={styles.payMore} aria-hidden="true">⋮</span>
          </div>
          {(() => {
            const bars = [
              { label: 'Successful', count: successfulTxns.length, color: '#22C55E' },
              { label: 'Pending', count: pendingTxns.length, color: '#F59E0B' },
              { label: 'Failed', count: failedTxns.length, color: '#EF4444' },
              { label: 'Refunded', count: refundedTxns.length, color: '#F87171' },
            ];
            const maxCount = Math.max(1, ...bars.map((b) => b.count));
            const svgW = 440;
            const svgH = 160;
            const padL = 32;
            const padR = 12;
            const padT = 14;
            const padB = 28;
            const chartW = svgW - padL - padR;
            const chartH = svgH - padT - padB;
            const barW = Math.min(48, chartW / bars.length * 0.55);
            const gap = chartW / bars.length;
            const yTicks = 4;
            const yTickVals = Array.from({ length: yTicks + 1 }, (_, i) => Math.round((maxCount * i) / yTicks));
            return (
              <div style={{ position: 'relative', width: '100%', height: 160 }}>
                <svg viewBox={`0 0 ${svgW} ${svgH}`} style={{ width: '100%', height: '100%' }} preserveAspectRatio="xMidYMid meet">
                  {yTickVals.map((v, i) => {
                    const y = padT + chartH - (v / maxCount) * chartH;
                    return (
                      <g key={i}>
                        <line x1={padL} y1={y} x2={svgW - padR} y2={y} stroke="#E5E7EB" strokeWidth="1" strokeDasharray={i === 0 ? '0' : '3,3'} />
                        <text x={padL - 6} y={y + 4} textAnchor="end" fontSize="9" fill="#94A3B8">{v}</text>
                      </g>
                    );
                  })}
                  <line x1={padL} y1={padT + chartH} x2={svgW - padR} y2={padT + chartH} stroke="#CBD5E1" strokeWidth="1" />
                  {bars.map((b, i) => {
                    const cx = padL + gap * i + gap / 2;
                    const h = maxCount > 0 ? (b.count / maxCount) * chartH : 0;
                    const animH = kpiBars.inView ? h : 0;
                    const barY = padT + chartH - animH;
                    const rx = Math.min(6, barW / 2);
                    return (
                      <g key={b.label}>
                        <text x={cx} y={padT + chartH - h - 6} textAnchor="middle" fontSize="11" fontWeight="700" fill="#1E293B" style={{ opacity: kpiBars.inView ? 1 : 0, transition: 'opacity 0.8s ease 1.2s' }}>{b.count}</text>
                        <rect x={cx - barW / 2} y={barY} width={barW} height={Math.max(2, animH)} rx={rx} fill={b.color}
                          style={{ transition: `all 2.2s cubic-bezier(0.22,1,0.36,1) ${0.3 + i * 0.25}s` }} />
                        <text x={cx} y={padT + chartH + 16} textAnchor="middle" fontSize="9" fill="#94A3B8">{b.label}</text>
                      </g>
                    );
                  })}
                </svg>
              </div>
            );
          })()}
        </div>
      </div>
      </ScrollReveal>

      {/* ── Status Filter Tabs ── */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
        {['', ...STATUSES].map((s) => {
          const active = status === s;
          return (
            <button key={s || 'all'} type="button" onClick={() => setStatus(s)}
              style={{
                padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 500,
                background: active ? '#2E7D32' : '#F1F5F9', color: active ? '#fff' : '#64748B',
                border: `1px solid ${active ? '#2E7D32' : '#E2E8F0'}`, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 6, transition: 'all .2s',
              }}>
              <span>{s ? s.charAt(0).toUpperCase() + s.slice(1) : 'All'}</span>
            </button>
          );
        })}
      </div>

      {/* ── Advanced Filters ── */}
      <div className={styles.panel} style={{ marginBottom: 16 }}>
        <div style={{ padding: '16px 20px', display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ flex: 1, minWidth: 180 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#64748B', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '.5px' }}>Search</label>
            <input placeholder="Payment ID, customer..." value={search} onChange={(e) => setSearch(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', border: '1px solid #E2E8F0', borderRadius: 8, fontSize: 13, fontFamily: 'inherit' }} />
          </div>
          <div style={{ minWidth: 160 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#64748B', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '.5px' }}>Payment Method</label>
            <select value={method} onChange={(e) => setMethod(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', border: '1px solid #E2E8F0', borderRadius: 8, fontSize: 13, fontFamily: 'inherit', background: '#fff' }}>
              <option value="">All Methods</option>
              {methodOptions.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <button type="button" onClick={() => { setStatus(''); setMethod(''); setSearch(''); }}
            style={{ padding: '8px 16px', border: '1px solid #E2E8F0', borderRadius: 8, background: '#F8FAFC', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
            Reset
          </button>
        </div>
      </div>

      {/* ── Transactions Table ── */}
      <div className={styles.panel}>
        <div className={styles.panelHeader}>
          <h2 className={styles.panelTitle}>Transactions ({txns.length})</h2>
          <button type="button" onClick={printList} style={{ padding: '6px 14px', borderRadius: 8, border: '1px solid #E2E8F0', background: '#F8FAFC', fontSize: 12, fontWeight: 500, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4, color: '#374151', transition: 'all .15s' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9" /><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><rect x="6" y="14" width="12" height="8" /></svg>
            Print
          </button>
        </div>
        {txns.length === 0 ? (
          <div className={styles.panelBody}><p className={styles.placeholder}>
            {loading ? 'Loading transactions…' : loadFailed ? 'Could not load transactions from server.' : 'No transactions match these filters.'}
          </p></div>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead><tr><th>Payment ID</th><th>Customer</th><th>Country</th><th>Method</th><th>Amount</th><th>Status</th><th>Date</th><th>Action</th></tr></thead>
              <tbody>
                {pagedTxns.map((t) => (
                  <tr key={t.id}>
                    <td>{t.id}</td><td>{t.customer}</td><td>{countryFlag(t.country)}</td><td>{t.method}</td>
                    <td>{FLAG[t.country]?.symbol ?? ''}{t.amount.toLocaleString()}</td><td>{t.status}{t.verified ? ' ✓' : ''}</td>
                    <td>{new Date(t.date).toLocaleDateString()}</td>
                    <td><button type="button" className={styles.viewBtn} title="View" onClick={() => setSelected(t)}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                    </button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {totalPages > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, padding: '16px 0 4px' }}>
            <button type="button" disabled={page === 0} onClick={() => setPage((p) => p - 1)}
              style={{ padding: '6px 16px', borderRadius: 8, border: '1px solid #E2E8F0', background: page === 0 ? '#F1F5F9' : '#fff', color: page === 0 ? '#94A3B8' : '#1E293B', fontSize: 13, fontWeight: 600, cursor: page === 0 ? 'default' : 'pointer' }}>
              Previous
            </button>
            <span style={{ fontSize: 13, color: '#475569', fontWeight: 600 }}>Page {page + 1} of {totalPages}</span>
            <button type="button" disabled={page >= totalPages - 1} onClick={() => setPage((p) => p + 1)}
              style={{ padding: '6px 16px', borderRadius: 8, border: '1px solid #E2E8F0', background: page >= totalPages - 1 ? '#F1F5F9' : '#fff', color: page >= totalPages - 1 ? '#94A3B8' : '#1E293B', fontSize: 13, fontWeight: 600, cursor: page >= totalPages - 1 ? 'default' : 'pointer' }}>
              Next
            </button>
          </div>
        )}
      </div>

      {selected && (
        <>
          <div className={d.overlay} onClick={closeDrawer} />
          <div className={`${d.panel} ${drawerClosing ? d.closing : ''}`}>
            <div className={d.header}>
              <div className={d.headerTop}>
                <div className={d.txnId}>{selected.id}</div>
                <button type="button" className={d.closeBtn} onClick={closeDrawer} aria-label="Close">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                </button>
              </div>
              <div className={d.subInfo}>
                Order {selected.orderNumber} &middot; {new Date(selected.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} {new Date(selected.date).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
              </div>
              <div className={d.badges}>
                <span className={`${d.badge} ${
                  selected.status === 'successful' ? d.badgeSuccessful :
                  selected.status === 'pending' ? d.badgePending :
                  selected.status === 'failed' ? d.badgeFailed : d.badgeRefunded
                }`}>
                  {selected.status === 'successful' && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>}
                  {selected.status === 'pending' && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>}
                  {selected.status.charAt(0).toUpperCase() + selected.status.slice(1)}
                </span>
                <span className={`${d.badge} ${selected.verified ? d.badgeVerified : d.badgeUnverified}`}>
                  {selected.verified ? 'Verified' : 'Under Review'}
                </span>
              </div>
            </div>

            <div className={d.body}>
              <div className={d.amountBox}>
                <div className={d.amountLabel}>Payment Amount</div>
                <div className={d.amountValue}>{FLAG[selected.country]?.symbol ?? ''}{selected.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              </div>

              <div className={d.section}>
                <div className={d.sectionTitle}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" /></svg>
                  Transaction Details
                </div>
                <div className={d.infoGrid}>
                  <div className={d.infoCard}>
                    <div className={d.infoCardLabel}>Transaction ID</div>
                    <div className={d.infoCardValue}>{selected.id}</div>
                  </div>
                  <div className={d.infoCard}>
                    <div className={d.infoCardLabel}>Order ID</div>
                    <div className={d.infoCardValue}>{selected.orderId}</div>
                  </div>
                  <div className={d.infoCard}>
                    <div className={d.infoCardLabel}>Payment Date</div>
                    <div className={d.infoCardValue}>{new Date(selected.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                  </div>
                  <div className={d.infoCard}>
                    <div className={d.infoCardLabel}>Amount</div>
                    <div className={`${d.infoCardValue} ${d.green}`}>{FLAG[selected.country]?.symbol ?? ''}{selected.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                  </div>
                  <div className={d.infoCard}>
                    <div className={d.infoCardLabel}>Payment Method</div>
                    <div className={d.infoCardValue}>{selected.method}</div>
                  </div>
                  <div className={d.infoCard}>
                    <div className={d.infoCardLabel}>Platform / Gateway</div>
                    <div className={d.infoCardValue}>Web</div>
                  </div>
                </div>
              </div>

              <div className={d.divider} />

              <div className={d.section}>
                <div className={d.sectionTitle}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                  Verification
                </div>
                <div className={d.infoGrid}>
                  <div className={d.infoCard}>
                    <div className={d.infoCardLabel}>Verification Status</div>
                    <div className={`${d.infoCardValue} ${selected.verified ? d.green : d.amber}`}>
                      {selected.verified ? 'Verified' : 'Under Review'}
                    </div>
                  </div>
                  <div className={d.infoCard}>
                    <div className={d.infoCardLabel}>Risk Level</div>
                    <div className={`${d.infoCardValue} ${d.green}`}>
                      {selected.status === 'failed' || selected.status === 'refunded' ? 'Medium' : 'Low'}
                    </div>
                  </div>
                </div>
              </div>

              <div className={d.divider} />

              <div className={d.section}>
                <div className={d.sectionTitle}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                  Customer Details
                </div>
                <div className={d.infoGrid}>
                  <div className={d.infoCard}>
                    <div className={d.infoCardLabel}>Customer Name</div>
                    <div className={d.infoCardValue}>{selected.customer}</div>
                  </div>
                  <div className={d.infoCard}>
                    <div className={d.infoCardLabel}>Country</div>
                    <div className={d.infoCardValue}>{FLAG[selected.country]?.label ?? selected.country}</div>
                  </div>
                  <div className={d.infoCard}>
                    <div className={d.infoCardLabel}>Phone</div>
                    <div className={d.infoCardValue}>{selected.phone ?? '—'}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className={d.actions}>
              <button type="button" className={`${d.btn} ${d.btnClose}`} onClick={closeDrawer}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                Close
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
