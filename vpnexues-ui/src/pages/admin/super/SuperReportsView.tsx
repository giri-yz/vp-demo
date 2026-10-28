import { useEffect, useState, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { getSummary } from '../../../api/adminDashboardApi';
import { listOrders } from '../../../api/adminOrdersApi';
import { listCustomers } from '../../../api/adminCustomersApi';
import { listProducts } from '../../../api/adminProductsApi';
import { listInventory } from '../../../api/adminInventoryApi';
import { listPayments, type AdminPaymentTxn } from '../../../api/adminPaymentsApi';
import type { DashboardSummary } from '../../../types';
import { ORDER_STATUSES, type CountryCode } from '../../../types';
import ExportMenu from '../../../components/admin/ExportMenu';
import { printTable, type ExportData } from '../../../utils/csvExport';
import { getErrorMessage } from '../../../utils/errors';
import { formatPrice } from '../../../utils/currency';
import styles from '../css/SuperAdminDashboard.module.css';
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

type Tab = 'revenue' | 'sales' | 'orders' | 'country' | 'product' | 'category' | 'user' | 'inventory';

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTH_KEYS = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];

/* Fixed SVG geometry for the revenue chart — module scope so the per-frame
   renders driven by useCountUp() don't reallocate them. */
const SVG_W = 900;
const SVG_H = 280;
const PAD_L = 55;
const PAD_R = 20;
const PAD_T = 15;
const PAD_B = 35;
const CHART_W = SVG_W - PAD_L - PAD_R;
const CHART_H = SVG_H - PAD_T - PAD_B;
const Y_TICKS = 5;

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'revenue', label: 'Revenue', icon: 'fas fa-dollar-sign' },
  { id: 'sales', label: 'Sales', icon: 'fas fa-shopping-cart' },
  { id: 'orders', label: 'Orders', icon: 'fas fa-box' },
  { id: 'country', label: 'Country', icon: 'fas fa-globe' },
  { id: 'product', label: 'Products', icon: 'fas fa-carrot' },
  { id: 'category', label: 'Categories', icon: 'fas fa-tags' },
  { id: 'user', label: 'Users', icon: 'fas fa-users' },
  { id: 'inventory', label: 'Inventory', icon: 'fas fa-warehouse' },
];

const FLAGS: Record<string, string> = {
  IN: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001490/vpnexues/old/site-assets/assets-ui/img/in-flag.svg',
  UAE: '/images/uae-flag.svg',
  AE: '/images/uae-flag.svg',
  US: '/images/us-flag.svg',
  SG: '/images/sg-flag.svg',
  LK: '/images/lk-flag.svg',
};

const COUNTRY_NAMES: Record<string, string> = {
  IN: 'India', India: 'India',
  UAE: 'UAE', AE: 'UAE',
  US: 'United States',
  SG: 'Singapore',
  LK: 'Sri Lanka',
};

const CURRENCY_SYMBOLS: Record<string, string> = {
  IN: '₹', India: '₹',
  UAE: 'AED ', AE: 'AED ',
  US: '$',
  SG: 'S$',
  LK: 'Rs. ',
};

const DEMO_TOTAL_PRODUCTS = 179;
const DEMO_LOW_STOCK = 18;
const DEMO_TOTAL_CUSTOMERS = 9120;

const DEMO_MONTHS: { month: string; revenue: number; orders: number }[] = [
  { month: '2025-11', revenue: 470, orders: 9 },
  { month: '2025-12', revenue: 655, orders: 12 },
  { month: '2026-01', revenue: 402, orders: 8 },
  { month: '2026-02', revenue: 528, orders: 10 },
  { month: '2026-03', revenue: 585, orders: 11 },
  { month: '2026-04', revenue: 540, orders: 10 },
  { month: '2026-05', revenue: 655, orders: 12 },
  { month: '2026-06', revenue: 602, orders: 11 },
  { month: '2026-07', revenue: 700, orders: 13 },
  { month: '2026-08', revenue: 660, orders: 12 },
  { month: '2026-09', revenue: 653, orders: 14 },
  { month: '2026-10', revenue: 498, orders: 10 },
];

const DEMO_ORDER_COUNTRIES = [
  { id: 'in', code: 'IN', name: 'India', flagImg: FLAGS.IN, orders: 44, revenue: 107800, growth: 12.4 },
  { id: 'us', code: 'US', name: 'United States', flagImg: FLAGS.US, orders: 31, revenue: 2108, growth: 8.6 },
  { id: 'sg', code: 'SG', name: 'Singapore', flagImg: FLAGS.SG, orders: 23, revenue: 1978, growth: 6.2 },
  { id: 'ae', code: 'AE', name: 'UAE', flagImg: FLAGS.AE, orders: 19, revenue: 5985, growth: 9.4 },
  { id: 'lk', code: 'LK', name: 'Sri Lanka', flagImg: FLAGS.LK, orders: 15, revenue: 147750, growth: 4.8 },
];

const DEMO_BY_COUNTRY_USD: { code: string; orders: number; revenue: number }[] = [
  { code: 'IN', orders: 44, revenue: 1290 },
  { code: 'US', orders: 31, revenue: 2108 },
  { code: 'SG', orders: 23, revenue: 1465 },
  { code: 'AE', orders: 19, revenue: 1630 },
  { code: 'LK', orders: 15, revenue: 455 },
];

const DEMO_USER_SHARES: { code: string; share: number; revPerUser: number }[] = [
  { code: 'IN', share: 0.4693, revPerUser: 58 },
  { code: 'US', share: 0.2039, revPerUser: 132 },
  { code: 'SG', share: 0.136, revPerUser: 148 },
  { code: 'AE', share: 0.1075, revPerUser: 121 },
  { code: 'LK', share: 0.0833, revPerUser: 26 },
];

const DEMO_REV_PER_USER: Record<string, number> = {
  IN: 58, US: 132, SG: 148, AE: 121, LK: 26,
};

const DEMO_STATUS_COUNTS: Record<string, number> = {
  PLACED: 3, CONFIRMED: 1, PROCESSING: 2, SHIPPED: 6, DELIVERED: 116, CANCELLED: 2,
};

const DEMO_TOP_PRODUCTS: { name: string; category: string; units: number; revenue: number }[] = [
  { name: 'Alphonso Mango', category: 'Fruits', units: 312, revenue: 3744 },
  { name: 'Basmati Rice', category: 'Groceries', units: 268, revenue: 2626 },
  { name: 'Vine Tomatoes', category: 'Vegetables', units: 615, revenue: 2399 },
  { name: 'Fresh Bananas', category: 'Fruits', units: 690, revenue: 2208 },
  { name: 'Cold-Pressed Coconut Oil', category: 'Groceries', units: 142, revenue: 2059 },
  { name: 'Pomegranate', category: 'Fruits', units: 218, revenue: 1918 },
  { name: 'Free Range Eggs', category: 'Groceries', units: 274, revenue: 1781 },
  { name: 'Baby Spinach', category: 'Vegetables', units: 512, revenue: 1638 },
];

const DEMO_CATEGORY_STATS: Record<string, { revenue: number; avgPrice: number; growth: number }> = {
  Vegetables: { revenue: 89420, avgPrice: 4.8, growth: 12.4 },
  Fruits: { revenue: 78650, avgPrice: 6.4, growth: 9.8 },
  Groceries: { revenue: 52340, avgPrice: 8.6, growth: 7.2 },
  Beverages: { revenue: 34270, avgPrice: 5.4, growth: 5.6 },
  Spices: { revenue: 21890, avgPrice: 6.2, growth: 4.1 },
  'Box Extra': { revenue: 12650, avgPrice: 7.1, growth: 6.5 },
};

const DEMO_CATEGORY_ROWS: { name: string; products: number; revenue: number }[] = [
  { name: 'Vegetables', products: 44, revenue: 0 },
  { name: 'Fruits', products: 38, revenue: 0 },
  { name: 'Groceries', products: 52, revenue: 0 },
  { name: 'Beverages', products: 26, revenue: 0 },
  { name: 'Spices', products: 12, revenue: 0 },
  { name: 'Box Extra', products: 7, revenue: 0 },
];

function demoCategoryStats(name: string, products: number): { revenue: number; avgPrice: number; growth: number } {
  const known = DEMO_CATEGORY_STATS[name];
  if (known) return known;
  const code = name.charCodeAt(0) || 70;
  const code2 = name.charCodeAt(1) || 71;
  return {
    revenue: products * 640,
    avgPrice: Math.round((3 + (code % 90) / 10) * 10) / 10,
    growth: Math.round((2 + (code2 % 80) / 10) * 10) / 10,
  };
}

const DEMO_INVENTORY_COUNTRIES = [
  { id: 'in', name: 'India', flagImg: FLAGS.IN, total: 68, inStock: 60, lowStock: 5, outOfStock: 3, stockValue: 32600, turnover: '8.4' },
  { id: 'us', name: 'United States', flagImg: FLAGS.US, total: 42, inStock: 38, lowStock: 4, outOfStock: 0, stockValue: 21150, turnover: '7.6' },
  { id: 'sg', name: 'Singapore', flagImg: FLAGS.SG, total: 31, inStock: 28, lowStock: 3, outOfStock: 0, stockValue: 14200, turnover: '6.9' },
  { id: 'ae', name: 'UAE', flagImg: FLAGS.AE, total: 24, inStock: 20, lowStock: 3, outOfStock: 1, stockValue: 11400, turnover: '7.2' },
  { id: 'lk', name: 'Sri Lanka', flagImg: FLAGS.LK, total: 17, inStock: 13, lowStock: 3, outOfStock: 1, stockValue: 10070, turnover: '6.1' },
];

function Bar({ pct }: { pct: number }) {
  return (
    <div style={{ height: 8, background: '#E5E7EB', borderRadius: 4, overflow: 'hidden', minWidth: 120 }}>
      <div style={{ height: '100%', width: `${Math.min(100, Math.max(0, pct))}%`, background: '#16A34A', borderRadius: 4 }} />
    </div>
  );
}

export default function SuperReportsView() {
  const [tab, setTab] = useState<Tab>('revenue');
  const [range, setRange] = useState('all');
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);
  const breakdownInView = useInView(0.1);

  const retryRef = useRef(0);
  function load() {
    setLoading(true);
    getSummary()
      .then((s) => { setSummary(s); setError(''); retryRef.current = 0; })
      .catch((err: unknown) => {
        setError(getErrorMessage(err, 'Could not load report data.'));
        if (retryRef.current < 1) {
          retryRef.current += 1;
          setTimeout(() => load(), 2500);
        }
      })
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  useEffect(() => {
    if (!loading && summary) {
      const id = requestAnimationFrame(() => {
        requestAnimationFrame(() => setMounted(true));
      });
      return () => cancelAnimationFrame(id);
    }
  }, [loading, summary]);

  const [userMounted, setUserMounted] = useState(false);
  useEffect(() => {
    if (tab === 'user' && !loading && summary) {
      setUserMounted(false);
      const t = setTimeout(() => {
        const id = requestAnimationFrame(() => {
          requestAnimationFrame(() => setUserMounted(true));
        });
      }, 50);
      return () => clearTimeout(t);
    }
  }, [tab, loading, summary]);

  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({});
  const [clientStatusCounts, setClientStatusCounts] = useState<Record<string, number>>({});
  const [payTxns, setPayTxns] = useState<AdminPaymentTxn[]>([]);
  const [orderRows, setOrderRows] = useState<{ month: string; country: string; total: number; status: string }[]>([]);
  const [scopeCountry, setScopeCountry] = useState('ALL');
  const [scopeOpen, setScopeOpen] = useState(false);
  const scopeRef = useRef<HTMLDivElement>(null);
  const scopeButtonRef = useRef<HTMLButtonElement>(null);
  const scopeMenuRef = useRef<HTMLDivElement>(null);
  const [scopeMenuPos, setScopeMenuPos] = useState({ top: 0, left: 0, width: 208 });
  const [extra, setExtra] = useState<{
    months: { month: string; revenue: number; orders: number }[];
    byCountry: { code: string; orders: number; revenue: number }[];
    topProducts: { name: string; units: number; revenue: number }[];
    byCategory: { name: string; products: number; revenue: number }[];
    byUserCountry: { code: string; users: number }[];
    inv: { label: string; count: number }[];
    productCount: number;
  } | null>(null);

  useEffect(() => {
    async function compute() {
      try {
        const [allOrders, customers, products, inv] = await Promise.all([
          listOrders({ size: 200 }),
          listCustomers({}),
          listProducts({ size: 200 }),
          listInventory({}),
        ]);
        const details = allOrders.content.map((o) => null);
        const clientCounts: Record<string, number> = {};
        for (const o of allOrders.content) clientCounts[o.status] = (clientCounts[o.status] ?? 0) + 1;
        setClientStatusCounts(clientCounts);
        setOrderRows(allOrders.content.map((o) => ({
          month: o.createdAt.slice(0, 7),
          country: o.countryCode ?? '?',
          total: o.status === 'CANCELLED' ? 0 : o.grandTotal,
          status: o.status,
        })));
        const monthMap = new Map<string, { revenue: number; orders: number }>();
        const countryMap = new Map<string, { orders: number; revenue: number }>();
        const prodMap = new Map<string, { units: number; revenue: number }>();
        for (const o of allOrders.content) {
          const month = o.createdAt.slice(0, 7);
          const m = monthMap.get(month) ?? { revenue: 0, orders: 0 };
          m.revenue += o.status === 'CANCELLED' ? 0 : o.grandTotal;
          m.orders += 1;
          monthMap.set(month, m);
          const c = countryMap.get(o.countryCode ?? '?') ?? { orders: 0, revenue: 0 };
          c.orders += 1;
          c.revenue += o.status === 'CANCELLED' ? 0 : o.grandTotal;
          countryMap.set(o.countryCode ?? '?', c);
        }
        for (const d of details) {
          if (!d) continue;
          for (const item of d.items) {
            const p = prodMap.get(item.name) ?? { units: 0, revenue: 0 };
            p.units += item.qty;
            p.revenue += item.lineTotal;
            prodMap.set(item.name, p);
          }
        }
        const catMap = new Map<string, { products: number; revenue: number }>();
        for (const p of products.content) {
          const c = catMap.get(p.category) ?? { products: 0, revenue: 0 };
          c.products += 1;
          c.revenue += prodMap.get(p.name)?.revenue ?? 0;
          catMap.set(p.category, c);
        }
        const userCountry = new Map<string, number>();
        for (const u of customers) userCountry.set(u.countryCode ?? '?', (userCountry.get(u.countryCode ?? '?') ?? 0) + 1);
        const invCounts = new Map<string, number>();
        for (const i of inv) invCounts.set(i.status, (invCounts.get(i.status) ?? 0) + 1);
        setExtra({
          months: [...monthMap.entries()].map(([month, v]) => ({ month, ...v })).sort((a, b) => (a.month < b.month ? 1 : -1)),
          byCountry: [...countryMap.entries()].map(([code, v]) => ({ code, ...v })),
          topProducts: [...prodMap.entries()].map(([name, v]) => ({ name, ...v })).sort((a, b) => b.revenue - a.revenue),
          byCategory: [...catMap.entries()].map(([name, v]) => ({ name, ...v })),
          byUserCountry: [...userCountry.entries()].map(([code, users]) => ({ code, users })),
          inv: [...invCounts.entries()].map(([label, count]) => ({ label, count })),
          productCount: products.totalElements,
        });
      } catch { setExtra(null); }
    }
    void compute();
  }, []);

  useEffect(() => {
    async function counts() {
      const entries = await Promise.all(
        ORDER_STATUSES.map(async (status) => {
          try { const res = await listOrders({ status, size: 1 }); return [status, res.totalElements] as const; }
          catch { return [status, -1] as const; }
        }),
      );
      setStatusCounts(Object.fromEntries(entries));
    }
    void counts();
  }, []);

  useEffect(() => {
    let cancelled = false;
    listPayments()
      .then((txns) => {
        if (!cancelled) setPayTxns(txns);
      })
      .catch(() => {
        // a failed load must read as "no data" — never fabricate transactions
        if (!cancelled) setPayTxns([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

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

  const isScoped = scopeCountry !== 'ALL';
  const scopedRows = isScoped ? orderRows.filter((o) => o.country === scopeCountry) : [];
  const matchScope = (codeOrId?: string) => !isScoped || (codeOrId ?? '').toUpperCase() === scopeCountry;

  const scopeOptions = useMemo(() => {
    const codes = new Set<string>(['IN', 'US', 'SG', 'AE', 'LK']);
    for (const o of orderRows) if (o.country) codes.add(o.country);
    for (const t of payTxns) if (t.country) codes.add(t.country);
    const preferred = ['IN', 'US', 'SG', 'AE', 'LK'];
    const rank = (cc: string) => { const i = preferred.indexOf(cc); return i === -1 ? 99 : i; };
    return [...codes]
      .sort((a, b) => rank(a) - rank(b) || (COUNTRY_NAMES[a] ?? a).localeCompare(COUNTRY_NAMES[b] ?? b))
      .map((cc) => ({ code: cc, name: COUNTRY_NAMES[cc] ?? cc, flagImg: FLAGS[cc] ?? '' }));
  }, [orderRows, payTxns]);

  const scopedMonths = isScoped ? (() => {
    const m = new Map<string, { revenue: number; orders: number }>();
    for (const o of scopedRows) {
      const e = m.get(o.month) ?? { revenue: 0, orders: 0 };
      e.revenue += o.total;
      e.orders += 1;
      m.set(o.month, e);
    }
    return [...m.entries()].map(([month, v]) => ({ month, ...v })).sort((a, b) => (a.month < b.month ? 1 : -1));
  })() : null;

  const monthsData = scopedMonths ?? (extra?.months?.length ? extra.months : DEMO_MONTHS);
  const kpiOrdersRaw = (extra?.months ?? []).reduce((s, m) => s + m.orders, 0);
  const apiCountsTotal = Object.values(statusCounts).filter((v) => v > 0).reduce((s, v) => s + v, 0);
  const clientCountsTotal = Object.values(clientStatusCounts).reduce((s, v) => s + v, 0);
  const hasRealOrders = kpiOrdersRaw > 0 || apiCountsTotal > 0 || clientCountsTotal > 0;

  function effCount(s: string): number {
    const api = statusCounts[s];
    if (api != null && api > 0) return api;
    const cl = clientStatusCounts[s];
    if (cl != null && cl > 0) return cl;
    if (hasRealOrders) return 0;
    return DEMO_STATUS_COUNTS[s] ?? 0;
  }
  const pendingEff = effCount('PLACED') + effCount('CONFIRMED');

  const scopedStatusCount = (s: string) => scopedRows.filter((o) => o.status === s).length;
  const scopeDelivered = isScoped ? scopedStatusCount('DELIVERED') : effCount('DELIVERED');
  const scopeShipped = isScoped ? scopedStatusCount('SHIPPED') : effCount('SHIPPED');
  const scopeProcessing = isScoped ? scopedStatusCount('PROCESSING') : effCount('PROCESSING');
  const scopePending = isScoped ? scopedStatusCount('PLACED') + scopedStatusCount('CONFIRMED') : pendingEff;
  const scopeCancelled = isScoped ? scopedStatusCount('CANCELLED') : effCount('CANCELLED');

  const topProductsList: { name: string; units: number; revenue: number; category?: string }[] =
    extra?.topProducts?.length ? extra.topProducts : DEMO_TOP_PRODUCTS;
  const productCount = extra?.productCount || DEMO_TOTAL_PRODUCTS;
  const lowStockCount = extra?.inv?.length ? (extra.inv.find((i) => i.label === 'LOW_STOCK')?.count ?? 0) : DEMO_LOW_STOCK;
  const scopedUsers = isScoped
    ? ((extra?.byUserCountry ?? []).find((u) => u.code === scopeCountry)?.users
      ?? (hasRealOrders ? 0 : Math.round(DEMO_TOTAL_CUSTOMERS * (DEMO_USER_SHARES.find((s) => s.code === scopeCountry)?.share ?? 0.2))))
    : null;
  const totalUsers = (scopedUsers ?? summary?.totalCustomers) || DEMO_TOTAL_CUSTOMERS;
  const countryRevSrc = extra?.byCountry ?? [];
  const baseCountryRev = countryRevSrc.length > 0 ? countryRevSrc : hasRealOrders ? [] : DEMO_BY_COUNTRY_USD;
  const countryRev = !isScoped ? baseCountryRev : (() => {
    const rev = scopedRows.reduce((s, o) => s + o.total, 0);
    if (rev > 0 || scopedRows.length > 0 || hasRealOrders) {
      return [{ code: scopeCountry, orders: scopedRows.length, revenue: rev }];
    }
    const d = DEMO_BY_COUNTRY_USD.find((c) => c.code === scopeCountry);
    return d ? [{ ...d }] : [];
  })();

  const revSym = (() => {
    let top = '';
    let topAmt = 0;
    for (const c of countryRev) {
      if (c.revenue > topAmt) { topAmt = c.revenue; top = c.code; }
    }
    return (top && CURRENCY_SYMBOLS[top]) || '';
  })();

  const orderCountryRows = countryRevSrc.length > 0
    ? countryRevSrc.map((c) => ({ id: c.code, code: c.code, name: COUNTRY_NAMES[c.code] ?? c.code, flagImg: FLAGS[c.code], orders: c.orders }))
    : hasRealOrders ? [] : DEMO_ORDER_COUNTRIES;

  const countryTabRows = useMemo(() => {
    const src = extra?.byCountry ?? [];
    return src.length > 0
      ? src.map((c) => {
          const customers = (extra?.byUserCountry ?? []).find((u) => u.code === c.code)?.users ?? 0;
          return {
            id: c.code,
            code: c.code,
            name: COUNTRY_NAMES[c.code] ?? c.code,
            flagImg: FLAGS[c.code],
            orders: c.orders,
            revenue: c.revenue,
            customers,
            growth: Math.round((c.orders / Math.max(customers, 1)) * 10) / 10,
          };
        })
      : hasRealOrders
        ? []
        : DEMO_ORDER_COUNTRIES.map((c) => ({
            ...c,
            customers: Math.round(totalUsers * (DEMO_USER_SHARES.find((s) => s.code === c.code)?.share ?? 0.2)),
          }));
  }, [extra, hasRealOrders, totalUsers]);

  const userCountryRows = useMemo(() => {
    const live = extra?.byUserCountry ?? [];
    return live.length > 0
      ? live.map((u) => ({
          id: u.code,
          name: COUNTRY_NAMES[u.code] ?? u.code,
          flagImg: FLAGS[u.code],
          customers: u.users,
          revPerUser: DEMO_REV_PER_USER[u.code] ?? 40,
        }))
      : DEMO_USER_SHARES.map((s) => ({
          id: s.code,
          name: COUNTRY_NAMES[s.code] ?? s.code,
          flagImg: FLAGS[s.code],
          customers: Math.round(totalUsers * s.share),
          revPerUser: s.revPerUser,
        }));
  }, [extra, totalUsers]);

  const categoryRows = useMemo(() => (extra?.byCategory?.length ? extra.byCategory : DEMO_CATEGORY_ROWS).map((c) => {
    const orders = Math.round(c.products * 8.5);
    if (c.revenue > 0) {
      return {
        name: c.name,
        products: c.products,
        orders,
        revenue: c.revenue,
        avgPrice: c.products > 0 ? Math.round(c.revenue / c.products) : 0,
        growth: Math.round((c.revenue / Math.max(c.products, 1)) * 10) / 10,
      };
    }
    const d = demoCategoryStats(c.name, c.products);
    return { name: c.name, products: c.products, orders, revenue: d.revenue, avgPrice: d.avgPrice, growth: d.growth };
  }), [extra]);

  function getExportData(): ExportData {
    const columns: string[] = ['Metric', 'Value'];
    let rows: (string | number)[][] = [];
    if (tab === 'revenue') rows = monthsData.map((m) => [m.month, `${m.orders} orders / $${m.revenue.toLocaleString()}`]);
    if (tab === 'sales') rows = countryRev.map((c) => [c.code, `${c.orders} orders / $${c.revenue.toLocaleString()}`]);
    if (tab === 'orders') rows = ORDER_STATUSES.map((s) => [s, isScoped ? scopedStatusCount(s) : effCount(s)]);
    if (tab === 'country') rows = countryTabRows.map((c) => [c.name, `${c.orders} orders / ${c.revenue}`]);
    if (tab === 'product') rows = topProductsList.map((p) => [p.name, `${p.units} units / $${p.revenue.toLocaleString()}`]);
    if (tab === 'category') rows = categoryRows.map((c) => [c.name, `${c.products} products / $${c.revenue.toLocaleString()}`]);
    if (tab === 'user') rows = userCountryRows.map((u) => [u.name, `${u.customers} users`]);
    if (tab === 'inventory') rows = DEMO_INVENTORY_COUNTRIES.map((i) => [i.name, i.total]);
    return { filename: `report-${tab}.csv`, title: `Report — ${tab}`, columns, rows };
  }

  function printList() {
    const d = getExportData();
    printTable({ filename: 'reports-analytics.csv', title: d.title, columns: d.columns, rows: d.rows });
  }

  const maxRevenue = Math.max(1, ...(monthsData.map((m) => m.revenue) ?? [1]));
  const rangedMonths = useMemo(() => monthsData.filter((_m, i, arr) => {
    if (range === 'all') return true;
    const keep = range === 'm1' ? 1 : 3;
    return i >= arr.length - keep;
  }), [monthsData, range]);
  const kpiRevenue = monthsData.reduce((s, m) => s + m.revenue, 0);
  const kpiOrders = monthsData.reduce((s, m) => s + m.orders, 0);
  const kpiAvg = kpiOrders > 0 ? kpiRevenue / kpiOrders : 0;
  const refundTxns = useMemo(
    () => payTxns.filter((t) => t.status === 'refunded' && (!isScoped || t.country === scopeCountry)),
    [payTxns, isScoped, scopeCountry]);
  const kpiRefunds = refundTxns.reduce((s, t) => s + t.amount, 0);

  const profitMargin = kpiRevenue > 0 ? Math.round(((kpiRevenue - kpiRefunds) / kpiRevenue) * 1000) / 10 : 0;

  const animRevenue = useCountUp(kpiRevenue);
  const animAvg = useCountUp(kpiAvg);
  const animProfit = useCountUp(profitMargin);
  const animRefunds = useCountUp(kpiRefunds);

  const animDaily = useCountUp(4892, 4000);
  const animWeekly = useCountUp(12456, 4000);
  const animMonthly = useCountUp(18420, 4000);
  const animSession = useCountUp(45, 4000);

  const maxCountryRev = Math.max(1, ...countryRev.map((c) => c.revenue));

  const chartMonths = rangedMonths.length > 0 ? rangedMonths : monthsData;

  // Chart geometry is memoized: the useCountUp() hooks below re-render this
  // component on every animation frame, and building the path/area strings
  // each time was the most expensive part of a frame.
  const { chartPoints, smoothLine, areaPoints, niceMax } = useMemo(() => {
    const existingMap = new Map(chartMonths.map((m) => [m.month.slice(5), m.revenue]));
    const full12 = MONTH_KEYS.map((key, i) => ({
      label: MONTH_NAMES[i],
      revenue: existingMap.get(key) ?? 0,
    }));

    const chartMax = Math.max(1, ...full12.map((m) => m.revenue));
    const max = Math.ceil(chartMax / 50000) * 50000 || 50000;

    const pts = full12.map((m, i) => {
      const x = PAD_L + (i / Math.max(1, full12.length - 1)) * CHART_W;
      const y = PAD_T + CHART_H - (max > 0 ? (m.revenue / max) * CHART_H : 0);
      return { x, y, label: m.label, revenue: m.revenue };
    });

    function smoothPath(p: { x: number; y: number }[]): string {
      if (p.length < 2) return '';
      let d = `M${p[0].x},${p[0].y}`;
      for (let i = 0; i < p.length - 1; i++) {
        const p0 = p[Math.max(0, i - 1)];
        const p1 = p[i];
        const p2 = p[i + 1];
        const p3 = p[Math.min(p.length - 1, i + 2)];
        const cp1x = p1.x + (p2.x - p0.x) / 6;
        const cp1y = p1.y + (p2.y - p0.y) / 6;
        const cp2x = p2.x - (p3.x - p1.x) / 6;
        const cp2y = p2.y - (p3.y - p1.y) / 6;
        d += ` C${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`;
      }
      return d;
    }

    const line = smoothPath(pts);
    const area = pts.length > 0
      ? `${line} L${pts[pts.length - 1].x},${PAD_T + CHART_H} L${pts[0].x},${PAD_T + CHART_H} Z`
      : '';

    return { chartPoints: pts, smoothLine: line, areaPoints: area, niceMax: max };
  }, [chartMonths]);

  const [hovered, setHovered] = useState<number | null>(null);

  const productSales = kpiRevenue * 0.85;
  const deliveryFees = kpiRevenue * 0.10;
  const subRevenue = kpiRevenue * 0.033;
  const otherIncome = kpiRevenue * 0.017;
  const breakdownTotal = productSales + deliveryFees + subRevenue + otherIncome;

  const animProductSales = useCountUp(productSales);
  const animDeliveryFees = useCountUp(deliveryFees);
  const animSubRevenue = useCountUp(subRevenue);
  const animOtherIncome = useCountUp(otherIncome);
  const breakdownMax = Math.max(1, breakdownTotal);

  return (
    <div>
      {/* Banner */}
      <ScrollReveal>
      <div className={styles.rptBanner} style={{ position: 'relative', backgroundImage: "url('/images/superadmin/reports.jpeg')", backgroundSize: 'contain', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', backgroundColor: '#E8EFE0', borderRadius: 16, padding: '32px 28px', marginBottom: 20, minHeight: 112, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Art-coloured plate: hides the faded title/subtitle baked into reports.jpeg (x 1.5%-36%) so only the crisp React text reads */}
        <div style={{ position: 'absolute', zIndex: 0, left: 0, top: 0, bottom: 0, width: '54%', borderRadius: '16px 0 0 16px', background: 'linear-gradient(to bottom, rgb(237,244,237), rgb(235,243,234))', WebkitMaskImage: 'linear-gradient(to right, #000 0%, #000 74%, transparent 100%)', maskImage: 'linear-gradient(to right, #000 0%, #000 74%, transparent 100%)', pointerEvents: 'none' }} />
        {/* Art-coloured plate: hides the faded "Better Insights / Bigger Growth" script baked into reports.jpeg (x 55.3%-66.1%) */}
        <div style={{ position: 'absolute', zIndex: 0, left: '52%', width: '18%', top: 0, bottom: 0, pointerEvents: 'none', WebkitMaskImage: 'linear-gradient(to right, transparent 0%, #000 12%, #000 88%, transparent 100%)', maskImage: 'linear-gradient(to right, transparent 0%, #000 12%, #000 88%, transparent 100%)' }}>
          <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, background: 'linear-gradient(to bottom, rgb(232,240,223), rgb(243,244,226))', WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, #000 14%, #000 86%, transparent 100%)', maskImage: 'linear-gradient(to bottom, transparent 0%, #000 14%, #000 86%, transparent 100%)' }} />
          <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', fontStyle: 'italic', fontWeight: 700, fontSize: 17, lineHeight: 1.35, color: '#1B5E39', textShadow: '0 1px 0 rgba(255,255,255,.55)' }}>
            <span>Better Insights</span>
            <span>Bigger Growth</span>
          </div>
        </div>
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: '#1B5E39', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, color: '#fff' }}>
            <i className="fas fa-chart-line" />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#164A2B' }}>Reports & Analytics</h1>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: '#2F5D3A' }}>{isScoped
              ? `Country report for ${COUNTRY_NAMES[scopeCountry] ?? scopeCountry}`
              : 'Comprehensive business intelligence and reporting dashboard'}</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, marginLeft: 'auto', position: 'relative', zIndex: 1 }}>
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
              {isScoped ? (COUNTRY_NAMES[scopeCountry] ?? scopeCountry) : 'All Countries'}
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
                  aria-selected={!isScoped}
                  className={`${styles.dashCountryOpt} ${!isScoped ? styles.dashCountryOptActive : ''}`}
                  onClick={() => { setScopeCountry('ALL'); setScopeOpen(false); }}
                >
                  <span className={styles.dashCountryFlagAll}>🌐</span>
                  <span className={styles.dashCountryOptName}>All Countries</span>
                  {!isScoped && (
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
          <ExportMenu getData={getExportData} />
          <button type="button" className={`${styles.bannerBtn} ${styles.reportsPrintBtn}`} onClick={printList}><i className="fas fa-print" style={{ marginRight: 6 }} />Print</button>
        </div>
      </div>
      </ScrollReveal>

      {/* Tabs with icons */}
      <ScrollReveal delay={100}>
      <div className={styles.tabs}>
        {TABS.map((t) => (
          <button key={t.id} type="button" className={`${styles.tab} ${tab === t.id ? styles.tabActive : ''}`} onClick={() => setTab(t.id)}>
            <i className={t.icon} style={{ marginRight: 6 }} />{t.label}
          </button>
        ))}
      </div>
      </ScrollReveal>

      {/* KPI Cards — only for Revenue tab */}
      {!loading && !error && summary && tab === 'revenue' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginBottom: 20 }}>
          {/* Total Revenue */}
          <div style={{ background: '#F0F9F1', border: '1px solid #D5EBD9', borderRadius: 18, padding: '18px 20px', position: 'relative', overflow: 'hidden' }}>
            <svg viewBox="0 0 64 64" aria-hidden="true" style={{ position: 'absolute', right: 8, bottom: 8, width: 46, height: 46, opacity: .75 }}>
              <path d="M9 57 C22 49 34 37 53 13" fill="none" stroke="#7CB163" strokeWidth="2" strokeLinecap="round" />
              <g opacity=".8">
                <path d="M0 0 C5 -9 15 -13 24 -11 C21 -2 11 4 0 0 Z" fill="#8CC76D" transform="translate(16,50) rotate(205)" />
                <path d="M0 0 C5 -9 15 -13 24 -11 C21 -2 11 4 0 0 Z" fill="#78B45C" transform="translate(25,43) rotate(25)" />
                <path d="M0 0 C5 -9 15 -13 24 -11 C21 -2 11 4 0 0 Z" fill="#8CC76D" transform="translate(33,35) rotate(215)" />
                <path d="M0 0 C5 -9 15 -13 24 -11 C21 -2 11 4 0 0 Z" fill="#78B45C" transform="translate(41,27) rotate(30)" />
                <path d="M0 0 C5 -9 15 -13 24 -11 C21 -2 11 4 0 0 Z" fill="#8CC76D" transform="translate(48,19) rotate(225)" />
              </g>
            </svg>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#D9F0DE', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#15803D', flexShrink: 0 }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M9.5 2C8.7 2 8 2.7 8 3.5c0 .4.2.8.4 1.1C6.6 5.5 5.5 7.3 5.2 9.4c-.9.5-1.4 1.1-1.4 1.9 0 .9.7 1.6 1.7 2-.3.9-.5 1.9-.5 2.9 0 3.3 2.9 5.8 7 5.8s7-2.5 7-5.8c0-1-.2-2-.5-2.9 1-.4 1.7-1.1 1.7-2 0-.8-.5-1.4-1.4-1.9C19.5 7.3 18.4 5.5 16.6 4.6c.2-.3.4-.7.4-1.1 0-.8-.7-1.5-1.5-1.5h-6zM12 9.5c1.7 0 3.2.7 3.7 1.7.2.4.1.9-.3 1.1-.4.2-.9.1-1.1-.3-.3-.5-1.2-.9-2.3-.9-1.2 0-2.1.4-2.4 1-.2.4-.7.6-1.1.4-.4-.2-.6-.7-.4-1.1.5-1.1 2-1.9 4-1.9zM12 12.6c2.9 0 5.5 1 5.5 2.6 0 1.7-2.6 2.9-5.5 2.9s-5.5-1.2-5.5-2.9c0-1.6 2.6-2.6 5.5-2.6z" /></svg>
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#1E293B', flex: 1 }}>Total Revenue</div>
              <span style={{ fontSize: 16, color: '#94A3B8', lineHeight: 1, userSelect: 'none' }} aria-hidden="true">⋮</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 6, background: '#D9F0DE', color: '#15803D' }}>↑ 12.5%</span>
              <span style={{ fontSize: 11, color: '#94A3B8' }}>from last month</span>
            </div>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#1E293B', marginBottom: 10 }}>{revSym}{animRevenue.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 12 }}>
              {countryRev.map((c) => (
                <div key={c.code} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#475569' }}>
                  <img src={FLAGS[c.code] ?? ''} alt="" style={{ width: 18, height: 13, borderRadius: 2, objectFit: 'cover', flexShrink: 0 }} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                  <span style={{ marginLeft: 'auto', fontWeight: 700, color: '#1E293B' }}>{CURRENCY_SYMBOLS[c.code] ?? ''}{c.revenue.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                </div>
              ))}
            </div>
            <div style={{ height: 8, background: '#E4EFE6', borderRadius: 4, overflow: 'hidden', marginBottom: 8 }}>
              <div style={{ height: '100%', width: mounted ? '100%' : '0%', background: 'linear-gradient(90deg, #22C55E, #16A34A)', borderRadius: 4, transition: 'width 2.8s cubic-bezier(0.22,1,0.36,1)' }} />
            </div>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#15803D', display: 'flex', alignItems: 'center', gap: 5 }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
              All successful payments
            </div>
          </div>

          {/* Avg. Order Value */}
          <div style={{ background: '#EFF6FF', border: '1px solid #D6E4FB', borderRadius: 18, padding: '18px 20px', position: 'relative', overflow: 'hidden' }}>
            <svg viewBox="0 0 64 64" aria-hidden="true" style={{ position: 'absolute', right: 8, bottom: 8, width: 46, height: 46, opacity: .75 }}>
              <path d="M9 57 C22 49 34 37 53 13" fill="none" stroke="#93B8E8" strokeWidth="2" strokeLinecap="round" />
              <g opacity=".8">
                <path d="M0 0 C5 -9 15 -13 24 -11 C21 -2 11 4 0 0 Z" fill="#A9C7EE" transform="translate(16,50) rotate(205)" />
                <path d="M0 0 C5 -9 15 -13 24 -11 C21 -2 11 4 0 0 Z" fill="#8FB4E6" transform="translate(25,43) rotate(25)" />
                <path d="M0 0 C5 -9 15 -13 24 -11 C21 -2 11 4 0 0 Z" fill="#A9C7EE" transform="translate(33,35) rotate(215)" />
                <path d="M0 0 C5 -9 15 -13 24 -11 C21 -2 11 4 0 0 Z" fill="#8FB4E6" transform="translate(41,27) rotate(30)" />
                <path d="M0 0 C5 -9 15 -13 24 -11 C21 -2 11 4 0 0 Z" fill="#A9C7EE" transform="translate(48,19) rotate(225)" />
              </g>
            </svg>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#D6E7FA', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563EB', flexShrink: 0 }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /><polyline points="16 7 22 7 22 13" /></svg>
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#1E293B', flex: 1 }}>Avg. Order Value</div>
              <span style={{ fontSize: 16, color: '#94A3B8', lineHeight: 1, userSelect: 'none' }} aria-hidden="true">⋮</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 6, background: '#D6E7FA', color: '#2563EB' }}>↑ 3.2%</span>
              <span style={{ fontSize: 11, color: '#94A3B8' }}>from last month</span>
            </div>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#1E293B', marginBottom: 10 }}>{revSym}{animAvg.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 12 }}>
              {countryRev.map((c) => {
                const avg = c.orders > 0 ? c.revenue / c.orders : 0;
                return (
                  <div key={c.code} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#475569' }}>
                    <img src={FLAGS[c.code] ?? ''} alt="" style={{ width: 18, height: 13, borderRadius: 2, objectFit: 'cover', flexShrink: 0 }} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                    <span style={{ marginLeft: 'auto', fontWeight: 700, color: '#1E293B' }}>{CURRENCY_SYMBOLS[c.code] ?? ''}{avg.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                  </div>
                );
              })}
            </div>
            <div style={{ height: 8, background: '#DEE9F8', borderRadius: 4, overflow: 'hidden', marginBottom: 8 }}>
              <div style={{ height: '100%', width: mounted ? '78%' : '0%', background: 'linear-gradient(90deg, #60A5FA, #3B82F6)', borderRadius: 4, transition: 'width 2.8s cubic-bezier(0.22,1,0.36,1) 0.3s' }} />
            </div>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#2563EB', display: 'flex', alignItems: 'center', gap: 5 }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /><polyline points="16 7 22 7 22 13" /></svg>
              3.2% from last month
            </div>
          </div>

          {/* Profit Margin */}
          <div style={{ background: '#FFFBEB', border: '1px solid #FDE9A9', borderRadius: 18, padding: '18px 20px', position: 'relative', overflow: 'hidden' }}>
            <svg viewBox="0 0 64 64" aria-hidden="true" style={{ position: 'absolute', right: 8, bottom: 8, width: 46, height: 46, opacity: .75 }}>
              <path d="M9 57 C22 49 34 37 53 13" fill="none" stroke="#D9B45C" strokeWidth="2" strokeLinecap="round" />
              <g opacity=".8">
                <path d="M0 0 C5 -9 15 -13 24 -11 C21 -2 11 4 0 0 Z" fill="#E5C46E" transform="translate(16,50) rotate(205)" />
                <path d="M0 0 C5 -9 15 -13 24 -11 C21 -2 11 4 0 0 Z" fill="#D9B45C" transform="translate(25,43) rotate(25)" />
                <path d="M0 0 C5 -9 15 -13 24 -11 C21 -2 11 4 0 0 Z" fill="#E5C46E" transform="translate(33,35) rotate(215)" />
                <path d="M0 0 C5 -9 15 -13 24 -11 C21 -2 11 4 0 0 Z" fill="#D9B45C" transform="translate(41,27) rotate(30)" />
                <path d="M0 0 C5 -9 15 -13 24 -11 C21 -2 11 4 0 0 Z" fill="#E5C46E" transform="translate(48,19) rotate(225)" />
              </g>
            </svg>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#FCEFC7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D97706', flexShrink: 0 }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="5" x2="5" y2="19" /><circle cx="6.5" cy="6.5" r="2.5" /><circle cx="17.5" cy="17.5" r="2.5" /></svg>
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#1E293B', flex: 1 }}>Profit Margin</div>
              <span style={{ fontSize: 16, color: '#94A3B8', lineHeight: 1, userSelect: 'none' }} aria-hidden="true">⋮</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 6, background: '#FCEFC7', color: '#B45309' }}>↑ 1.5%</span>
              <span style={{ fontSize: 11, color: '#94A3B8' }}>from last month</span>
            </div>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#1E293B', marginBottom: 10 }}>{animProfit.toFixed(1)}%</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 12 }}>
              {countryRev.map((c) => {
                const share = kpiRevenue > 0 ? Math.round((c.revenue / kpiRevenue) * 1000) / 10 : 0;
                return (
                  <div key={c.code} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#475569' }}>
                    <img src={FLAGS[c.code] ?? ''} alt="" style={{ width: 18, height: 13, borderRadius: 2, objectFit: 'cover', flexShrink: 0 }} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                    <span style={{ marginLeft: 'auto', fontWeight: 700, color: '#1E293B' }}>{share}%</span>
                  </div>
                );
              })}
            </div>
            <div style={{ height: 8, background: '#F5ECD4', borderRadius: 4, overflow: 'hidden', marginBottom: 8 }}>
              <div style={{ height: '100%', width: mounted ? '65%' : '0%', background: 'linear-gradient(90deg, #FBBF24, #F59E0B)', borderRadius: 4, transition: 'width 2.8s cubic-bezier(0.22,1,0.36,1) 0.6s' }} />
            </div>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#B45309', display: 'flex', alignItems: 'center', gap: 5 }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15" /></svg>
              1.5% from last month
            </div>
          </div>

          {/* Refunds */}
          <div style={{ background: '#FEF2F2', border: '1px solid #FBCFCF', borderRadius: 18, padding: '18px 20px', position: 'relative', overflow: 'hidden' }}>
            <svg viewBox="0 0 64 64" aria-hidden="true" style={{ position: 'absolute', right: 8, bottom: 8, width: 46, height: 46, opacity: .75 }}>
              <path d="M9 57 C22 49 34 37 53 13" fill="none" stroke="#E8A0A0" strokeWidth="2" strokeLinecap="round" />
              <g opacity=".8">
                <path d="M0 0 C5 -9 15 -13 24 -11 C21 -2 11 4 0 0 Z" fill="#F0B4B4" transform="translate(16,50) rotate(205)" />
                <path d="M0 0 C5 -9 15 -13 24 -11 C21 -2 11 4 0 0 Z" fill="#E8A0A0" transform="translate(25,43) rotate(25)" />
                <path d="M0 0 C5 -9 15 -13 24 -11 C21 -2 11 4 0 0 Z" fill="#F0B4B4" transform="translate(33,35) rotate(215)" />
                <path d="M0 0 C5 -9 15 -13 24 -11 C21 -2 11 4 0 0 Z" fill="#E8A0A0" transform="translate(41,27) rotate(30)" />
                <path d="M0 0 C5 -9 15 -13 24 -11 C21 -2 11 4 0 0 Z" fill="#F0B4B4" transform="translate(48,19) rotate(225)" />
              </g>
            </svg>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#FBDCDC', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#DC2626', flexShrink: 0 }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 14 4 9 9 4" /><path d="M20 20v-7a4 4 0 0 0-4-4H4" /></svg>
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#1E293B', flex: 1 }}>Refunds</div>
              <span style={{ fontSize: 16, color: '#94A3B8', lineHeight: 1, userSelect: 'none' }} aria-hidden="true">⋮</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 6, background: '#FBDCDC', color: '#DC2626' }}>↓ 8.1%</span>
              <span style={{ fontSize: 11, color: '#94A3B8' }}>from last month</span>
            </div>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#1E293B', marginBottom: 10 }}>{revSym}{animRefunds.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 12 }}>
              {countryRev.map((c) => {
                const countryRefunds = refundTxns.filter((t) => t.country === c.code).reduce((s, t) => s + t.amount, 0);
                return (
                  <div key={c.code} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#475569' }}>
                    <img src={FLAGS[c.code] ?? ''} alt="" style={{ width: 18, height: 13, borderRadius: 2, objectFit: 'cover', flexShrink: 0 }} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                    <span style={{ marginLeft: 'auto', fontWeight: 700, color: '#1E293B' }}>{CURRENCY_SYMBOLS[c.code] ?? ''}{countryRefunds.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                  </div>
                );
              })}
            </div>
            <div style={{ height: 8, background: '#F6E3E3', borderRadius: 4, overflow: 'hidden', marginBottom: 8 }}>
              <div style={{ height: '100%', width: mounted ? '42%' : '0%', background: 'linear-gradient(90deg, #F87171, #EF4444)', borderRadius: 4, transition: 'width 2.8s cubic-bezier(0.22,1,0.36,1) 0.9s' }} />
            </div>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#DC2626', display: 'flex', alignItems: 'center', gap: 5 }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
              8.1% from last month
            </div>
          </div>
          </div>
          )}

      <ScrollReveal delay={200}>
      {loading ? (
        <div className={styles.panel}><div className={styles.panelBody}><p className={styles.placeholder}>Loading...</p></div></div>
      ) : error || !summary ? (
        <div className={styles.panel}>
          <div className={styles.panelBody}>
            <p className={styles.placeholder}>{error || 'Could not load report data.'}</p>
            <button type="button" className={styles.viewButton} onClick={load}>Retry</button>
          </div>
        </div>
      ) : (
        <>
          {/* Revenue Trend Chart */}
          {tab === 'revenue' && chartPoints.length > 0 && (
            <div className={styles.panel} style={{ marginBottom: 20, position: 'relative', overflow: 'hidden' }}>
              <svg viewBox="0 0 64 64" aria-hidden="true" style={{ position: 'absolute', right: 12, top: 64, width: 52, height: 52, opacity: .7 }}>
                <path d="M9 57 C22 49 34 37 53 13" fill="none" stroke="#7CB163" strokeWidth="2" strokeLinecap="round" />
                <g opacity=".8">
                  <path d="M0 0 C5 -9 15 -13 24 -11 C21 -2 11 4 0 0 Z" fill="#8CC76D" transform="translate(16,50) rotate(205)" />
                  <path d="M0 0 C5 -9 15 -13 24 -11 C21 -2 11 4 0 0 Z" fill="#78B45C" transform="translate(25,43) rotate(25)" />
                  <path d="M0 0 C5 -9 15 -13 24 -11 C21 -2 11 4 0 0 Z" fill="#8CC76D" transform="translate(33,35) rotate(215)" />
                  <path d="M0 0 C5 -9 15 -13 24 -11 C21 -2 11 4 0 0 Z" fill="#78B45C" transform="translate(41,27) rotate(30)" />
                </g>
              </svg>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, padding: '18px 20px 4px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#E4F3E8', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#15803D', flexShrink: 0 }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /><polyline points="16 7 22 7 22 13" /></svg>
                  </div>
                  <div>
                    <h2 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: '#1E293B' }}>Revenue Trend (Last 12 Months)</h2>
                    <p style={{ margin: '2px 0 0', fontSize: 12, color: '#94A3B8' }}>Your total revenue performance over the last 12 months</p>
                  </div>
                </div>
                <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 12px', borderRadius: 10, border: '1px solid #D5EBD9', background: '#F0FDF4', fontSize: 12, fontWeight: 700, color: '#15803D', cursor: 'pointer', flexShrink: 0 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                  <select value={range} onChange={(e) => setRange(e.target.value)} aria-label="Trend range" style={{ border: 0, background: 'transparent', fontSize: 12, fontWeight: 700, color: '#15803D', cursor: 'pointer', fontFamily: 'inherit', outline: 'none' }}>
                    <option value="all">Last 12 months</option>
                    <option value="m3">Last 3 months</option>
                    <option value="m1">Last month</option>
                  </select>
                </label>
              </div>
              <div className={styles.panelBody} style={{ padding: '8px 20px 20px' }}>
                <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} style={{ width: '100%', height: 'auto', overflow: 'visible' }}>
                  <defs>
                    <linearGradient id="revAreaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#2E7D32" stopOpacity={0.25} />
                      <stop offset="60%" stopColor="#2E7D32" stopOpacity={0.08} />
                      <stop offset="100%" stopColor="#2E7D32" stopOpacity={0.01} />
                    </linearGradient>
                    <filter id="dotShadow" x="-50%" y="-50%" width="200%" height="200%">
                      <feDropShadow dx="0" dy="1" stdDeviation="2" floodColor="#2E7D32" floodOpacity="0.3" />
                    </filter>
                  </defs>

                  {/* Y-axis grid lines & labels */}
                  {Array.from({ length: Y_TICKS + 1 }, (_, i) => {
                    const val = (niceMax * i) / Y_TICKS;
                    const y = PAD_T + CHART_H - (niceMax > 0 ? (val / niceMax) * CHART_H : 0);
                    const label = val >= 1000 ? `${revSym}${Math.round(val / 1000)}k` : `${revSym}${val}`;
                    return (
                      <g key={`ytick-${i}`}>
                        <line x1={PAD_L} y1={y} x2={SVG_W - PAD_R} y2={y} stroke="#E5E7EB" strokeWidth={1} strokeDasharray={i === 0 ? '0' : '4,4'} />
                        <text x={PAD_L - 10} y={y + 4} textAnchor="end" fontSize={11} fill="#94A3B8" fontFamily="Inter, sans-serif">{label}</text>
                      </g>
                    );
                  })}

                  {/* X-axis baseline */}
                  <line x1={PAD_L} y1={PAD_T + CHART_H} x2={SVG_W - PAD_R} y2={PAD_T + CHART_H} stroke="#E5E7EB" strokeWidth={1} />

                  {/* Area gradient fill */}
                  <path d={areaPoints} fill="url(#revAreaGrad)" className={styles.payTrendArea} />

                  {/* Line */}
                  <path
                    d={smoothLine}
                    fill="none"
                    stroke="#2E7D32"
                    strokeWidth={3}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    pathLength="1"
                    className={styles.payTrendLine}
                  />

                  {/* Data points */}
                  {chartPoints.map((p, i) => (
                    <g key={`dot-${i}`}
                      onMouseEnter={() => setHovered(i)}
                      onMouseLeave={() => setHovered(null)}
                      style={{ cursor: 'pointer' }}
                    >
                      <circle cx={p.x} cy={p.y} r={8} fill="transparent" />
                      <circle cx={p.x} cy={p.y} r={5.5} fill="#fff" stroke="#2E7D32" strokeWidth={2.5} filter="url(#dotShadow)" className={styles.payTrendDot} style={{ animationDelay: `${1.8 + i * 0.15}s` }} />
                      <circle cx={p.x} cy={p.y} r={3} fill="#2E7D32" className={styles.payTrendDot} style={{ animationDelay: `${1.8 + i * 0.15}s` }} />

                      {/* Tooltip */}
                      {hovered === i && (
                        <g>
                          <rect x={p.x - 60} y={p.y - 52} width={120} height={40} rx={10} fill="#14532D" opacity={0.97} />
                          <text x={p.x} y={p.y - 35} textAnchor="middle" fontSize={11} fontWeight={400} fill="#BBF7D0" fontFamily="Inter, sans-serif">{p.label}</text>
                          <text x={p.x} y={p.y - 19} textAnchor="middle" fontSize={12} fontWeight={700} fill="#fff" fontFamily="Inter, sans-serif">{revSym}{p.revenue.toLocaleString()}</text>
                          <polygon points={`${p.x - 5},${p.y - 12} ${p.x + 5},${p.y - 12} ${p.x},${p.y - 6}`} fill="#14532D" opacity={0.97} />
                        </g>
                      )}
                    </g>
                  ))}

                  {/* X-axis month labels */}
                  {chartPoints.map((p, i) => (
                    <text key={`xlbl-${i}`} x={p.x} y={PAD_T + CHART_H + 22} textAnchor="middle" fontSize={11} fontWeight={500} fill="#64748B" fontFamily="Inter, sans-serif">{p.label}</text>
                  ))}
                </svg>

                <style>{`
                  @keyframes chartLineIn {
                    from { stroke-dasharray: 2000; stroke-dashoffset: 2000; }
                    to { stroke-dasharray: 2000; stroke-dashoffset: 0; }
                  }
                  @keyframes chartAreaIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                  }
                `}</style>
              </div>
            </div>
          )}

          {/* Sales KPI Cards */}
          {tab === 'sales' && !loading && !error && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginBottom: 20 }}>
              {/* Total Orders */}
              <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 18, padding: '18px 20px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, background: 'linear-gradient(180deg, #22C55E, #16A34A)', borderRadius: '18px 0 0 18px' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(46,125,50,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2E7D32', fontSize: 16, flexShrink: 0 }}><i className="fas fa-box" /></div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '.5px' }}>Total Orders</div>
                  </div>
                </div>
                <div style={{ fontSize: 24, fontWeight: 800, color: '#1E293B', marginBottom: 6 }}>{kpiOrders.toLocaleString()}</div>
                <div style={{ height: 8, background: '#F1F5F9', borderRadius: 4, overflow: 'hidden', marginBottom: 8 }}>
                  <div style={{ height: '100%', width: '100%', background: 'linear-gradient(90deg, #22C55E, #16A34A)', borderRadius: 4 }} />
                </div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#2E7D32' }}>Across all countries</div>
              </div>

              {/* Completed Orders */}
              <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 18, padding: '18px 20px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, background: 'linear-gradient(180deg, #14B8A6, #0D9488)', borderRadius: '18px 0 0 18px' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(20,184,166,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#14B8A6', fontSize: 16, flexShrink: 0 }}><i className="fas fa-check-circle" /></div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '.5px' }}>Completed Orders</div>
                  </div>
                </div>
                <div style={{ fontSize: 24, fontWeight: 800, color: '#1E293B', marginBottom: 6 }}>{scopeDelivered.toLocaleString()}</div>
                <div style={{ height: 8, background: '#F1F5F9', borderRadius: 4, overflow: 'hidden', marginBottom: 8 }}>
                  <div style={{ height: '100%', width: kpiOrders > 0 ? `${(scopeDelivered / kpiOrders) * 100}%` : '0%', background: 'linear-gradient(90deg, #14B8A6, #0D9488)', borderRadius: 4 }} />
                </div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#14B8A6' }}>Successfully delivered</div>
              </div>

              {/* Pending Orders */}
              <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 18, padding: '18px 20px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, background: 'linear-gradient(180deg, #F59E0B, #D97706)', borderRadius: '18px 0 0 18px' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(245,158,11,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#F59E0B', fontSize: 16, flexShrink: 0 }}><i className="fas fa-clock" /></div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '.5px' }}>Pending Orders</div>
                  </div>
                </div>
                <div style={{ fontSize: 24, fontWeight: 800, color: '#1E293B', marginBottom: 6 }}>{scopePending.toLocaleString()}</div>
                <div style={{ height: 8, background: '#F1F5F9', borderRadius: 4, overflow: 'hidden', marginBottom: 8 }}>
                  <div style={{ height: '100%', width: kpiOrders > 0 ? `${(scopePending / kpiOrders) * 100}%` : '0%', background: 'linear-gradient(90deg, #F59E0B, #D97706)', borderRadius: 4 }} />
                </div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#D97706' }}>Awaiting processing</div>
              </div>

              {/* Cancelled Orders */}
              <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 18, padding: '18px 20px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, background: 'linear-gradient(180deg, #EF4444, #DC2626)', borderRadius: '18px 0 0 18px' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(239,68,68,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#EF4444', fontSize: 16, flexShrink: 0 }}><i className="fas fa-times-circle" /></div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '.5px' }}>Cancelled Orders</div>
                  </div>
                </div>
                <div style={{ fontSize: 24, fontWeight: 800, color: '#1E293B', marginBottom: 6 }}>{scopeCancelled.toLocaleString()}</div>
                <div style={{ height: 8, background: '#F1F5F9', borderRadius: 4, overflow: 'hidden', marginBottom: 8 }}>
                  <div style={{ height: '100%', width: kpiOrders > 0 ? `${(scopeCancelled / kpiOrders) * 100}%` : '0%', background: 'linear-gradient(90deg, #EF4444, #DC2626)', borderRadius: 4 }} />
                </div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#EF4444' }}>Cancelled by customers</div>
              </div>
            </div>
          )}

          {/* Orders KPI Cards */}
          {tab === 'orders' && !loading && !error && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginBottom: 20 }}>
              {/* Delivered */}
              <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 18, padding: '18px 20px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, background: 'linear-gradient(180deg, #22C55E, #16A34A)', borderRadius: '18px 0 0 18px' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(46,125,50,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2E7D32', fontSize: 16, flexShrink: 0 }}><i className="fas fa-truck" /></div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '.5px' }}>Delivered</div>
                  </div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: '#1E293B' }}>{scopeDelivered.toLocaleString()}</div>
                </div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#2E7D32', display: 'flex', alignItems: 'center', gap: 4 }}>↑ {kpiOrders > 0 ? Math.round((scopeDelivered / kpiOrders) * 1000) / 10 : 0}%</div>
              </div>

              {/* Shipped */}
              <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 18, padding: '18px 20px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, background: 'linear-gradient(180deg, #3B82F6, #2563EB)', borderRadius: '18px 0 0 18px' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(59,130,246,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3B82F6', fontSize: 16, flexShrink: 0 }}><i className="fas fa-shipping-fast" /></div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '.5px' }}>Shipped</div>
                  </div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: '#1E293B' }}>{scopeShipped.toLocaleString()}</div>
                </div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#3B82F6' }}>{kpiOrders > 0 ? Math.round((scopeShipped / kpiOrders) * 1000) / 10 : 0}%</div>
              </div>

              {/* Processing */}
              <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 18, padding: '18px 20px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, background: 'linear-gradient(180deg, #8B5CF6, #7C3AED)', borderRadius: '18px 0 0 18px' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(139,92,246,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8B5CF6', fontSize: 16, flexShrink: 0 }}><i className="fas fa-cog" /></div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '.5px' }}>Processing</div>
                  </div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: '#1E293B' }}>{scopeProcessing.toLocaleString()}</div>
                </div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#8B5CF6' }}>{kpiOrders > 0 ? Math.round((scopeProcessing / kpiOrders) * 1000) / 10 : 0}%</div>
              </div>

              {/* Cancelled (real backend status — there is no RETURNED status server-side) */}
              <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 18, padding: '18px 20px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, background: 'linear-gradient(180deg, #EF4444, #DC2600)', borderRadius: '18px 0 0 18px' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(239,68,68,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#EF4444', fontSize: 16, flexShrink: 0 }}><i className="fas fa-ban" /></div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '.5px' }}>Cancelled</div>
                  </div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: '#1E293B' }}>{scopeCancelled.toLocaleString()}</div>
                </div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#EF4444', display: 'flex', alignItems: 'center', gap: 4 }}>↓ {kpiOrders > 0 ? Math.round((scopeCancelled / kpiOrders) * 1000) / 10 : 0}%</div>
              </div>
            </div>
          )}

          {/* Product KPI Cards */}
          {tab === 'product' && !loading && !error && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginBottom: 20 }}>
              {/* Total Products */}
              <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 18, padding: '18px 20px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, background: 'linear-gradient(180deg, #22C55E, #16A34A)', borderRadius: '18px 0 0 18px' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(46,125,50,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2E7D32', fontSize: 16, flexShrink: 0 }}><i className="fas fa-boxes" /></div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '.5px' }}>Total Products</div>
                  </div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: '#1E293B' }}>{productCount.toLocaleString()}</div>
                </div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#2E7D32' }}>Across all categories</div>
              </div>

              {/* Top Seller */}
              <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 18, padding: '18px 20px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, background: 'linear-gradient(180deg, #3B82F6, #2563EB)', borderRadius: '18px 0 0 18px' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(59,130,246,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3B82F6', fontSize: 16, flexShrink: 0 }}><i className="fas fa-trophy" /></div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '.5px' }}>Top Seller</div>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: '#1E293B', textAlign: 'right', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{topProductsList[0]?.name ?? '—'}</div>
                </div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#3B82F6' }}>{topProductsList[0] ? `$${topProductsList[0].revenue.toLocaleString()}` : '—'}</div>
              </div>

              {/* Avg Stock */}
              <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 18, padding: '18px 20px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, background: 'linear-gradient(180deg, #8B5CF6, #7C3AED)', borderRadius: '18px 0 0 18px' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(139,92,246,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8B5CF6', fontSize: 16, flexShrink: 0 }}><i className="fas fa-warehouse" /></div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '.5px' }}>Avg Stock</div>
                  </div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: '#1E293B' }}>{topProductsList.length ? Math.round(topProductsList.reduce((a, p) => a + p.units, 0) / topProductsList.length) : '—'}</div>
                </div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#8B5CF6' }}>Units per product</div>
              </div>

              {/* Low Stock Items */}
              <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 18, padding: '18px 20px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, background: 'linear-gradient(180deg, #EF4444, #DC2626)', borderRadius: '18px 0 0 18px' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(239,68,68,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#EF4444', fontSize: 16, flexShrink: 0 }}><i className="fas fa-exclamation-triangle" /></div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '.5px' }}>Low Stock Items</div>
                  </div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: '#1E293B' }}>{lowStockCount}</div>
                </div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#EF4444' }}>Need restocking</div>
              </div>
            </div>
          )}

          {/* Revenue by Country + Revenue Breakdown (2-column grid) */}
          {tab === 'revenue' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 20, marginBottom: 20 }}>
              <div className={styles.panel}>
                <div className={styles.panelHeader}><h2 className={styles.panelTitle}>Revenue by Country</h2></div>
                <div className={styles.panelBody}>
                  {countryRev.length === 0 ? (
                    <p className={styles.placeholder}>No data</p>
                  ) : (
                    countryRev.map((c, i) => (
                      <div key={c.code} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: i < countryRev.length - 1 ? '1px solid #E2E8F0' : 'none' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <img src={FLAGS[c.code] ?? ''} alt="" style={{ width: 20, height: 20, borderRadius: '50%', objectFit: 'cover' }} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                          <span style={{ fontSize: 13, fontWeight: 500 }}>{COUNTRY_NAMES[c.code] ?? c.code}</span>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: 14, fontWeight: 700 }}>{CURRENCY_SYMBOLS[c.code] ?? ''}{c.revenue.toLocaleString()}</div>
                          <div style={{ fontSize: 11, color: '#2E7D32' }}>{kpiRevenue > 0 ? Math.round((c.revenue / kpiRevenue) * 1000) / 10 : 0}%</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
              <div ref={breakdownInView.ref} className={styles.panel}>
                <div className={styles.panelHeader}><h2 className={styles.panelTitle}>Revenue Breakdown</h2></div>
                <div className={styles.panelBody}>
                  {([
                    { label: 'Product Sales', value: productSales, anim: animProductSales, pct: breakdownTotal > 0 ? Math.round((productSales / breakdownTotal) * 100) : 0 },
                    { label: 'Delivery Fees', value: deliveryFees, anim: animDeliveryFees, pct: breakdownTotal > 0 ? Math.round((deliveryFees / breakdownTotal) * 100) : 0 },
                    { label: 'Subscription Revenue', value: subRevenue, anim: animSubRevenue, pct: breakdownTotal > 0 ? Math.round((subRevenue / breakdownTotal) * 100) : 0 },
                    { label: 'Other Income', value: otherIncome, anim: animOtherIncome, pct: breakdownTotal > 0 ? Math.round((otherIncome / breakdownTotal) * 100) : 0 },
                  ] as const).map((b, i) => (
                    <div key={b.label} style={{ marginBottom: i < 3 ? 16 : 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                        <span style={{ fontSize: 13 }}>{b.label}</span>
                        <span style={{ fontSize: 13, fontWeight: 600 }}>${Math.round(b.anim).toLocaleString()}</span>
                      </div>
                      <div style={{ height: 8, background: '#E2E8F0', borderRadius: 4 }}>
                        <div style={{ height: '100%', width: breakdownInView.inView ? `${b.pct}%` : '0%', background: '#7EBC51', borderRadius: 4, transition: `width 2.8s cubic-bezier(0.22,1,0.36,1) ${0.6 + i * 0.2}s` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Category KPI Cards */}
          {tab === 'category' && !loading && !error && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(155px, 1fr))', gap: 16, marginBottom: 20 }}>
              {/* Vegetables */}
              <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 18, padding: '20px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
                <div style={{ fontSize: 40, marginBottom: 8 }}>🥬</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#1E293B', marginBottom: 4 }}>Vegetables</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: '#16A34A', marginBottom: 4 }}>$89,420</div>
                <div style={{ fontSize: 12, color: '#64748B' }}>156 products • 35.1%</div>
              </div>

              {/* Fruits */}
              <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 18, padding: '20px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
                <div style={{ fontSize: 40, marginBottom: 8 }}>🍎</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#1E293B', marginBottom: 4 }}>Fruits</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: '#3B82F6', marginBottom: 4 }}>$78,650</div>
                <div style={{ fontSize: 12, color: '#64748B' }}>128 products • 30.9%</div>
              </div>

              {/* Groceries */}
              <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 18, padding: '20px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
                <div style={{ fontSize: 40, marginBottom: 8 }}>🛒</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#1E293B', marginBottom: 4 }}>Groceries</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: '#3B82F6', marginBottom: 4 }}>$52,340</div>
                <div style={{ fontSize: 12, color: '#64748B' }}>98 products • 20.5%</div>
              </div>

              {/* Beverages */}
              <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 18, padding: '20px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
                <div style={{ fontSize: 40, marginBottom: 8 }}>🥤</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#1E293B', marginBottom: 4 }}>Beverages</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: '#F59E0B', marginBottom: 4 }}>$34,270</div>
                <div style={{ fontSize: 12, color: '#64748B' }}>142 products • 13.5%</div>
              </div>

              {/* Spices */}
              <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 18, padding: '20px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
                <div style={{ fontSize: 40, marginBottom: 8 }}>🌶️</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#1E293B', marginBottom: 4 }}>Spices</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: '#EF4444', marginBottom: 4 }}>$21,890</div>
                <div style={{ fontSize: 12, color: '#64748B' }}>86 products • 8.6%</div>
              </div>
            </div>
          )}

          {/* User KPI Cards */}
          {tab === 'user' && !loading && !error && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginBottom: 20 }}>
              {/* Total Users */}
              <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 18, padding: '18px 20px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, background: 'linear-gradient(180deg, #22C55E, #16A34A)', borderRadius: '18px 0 0 18px' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(46,125,50,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2E7D32', fontSize: 16, flexShrink: 0 }}><i className="fas fa-users" /></div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '.5px' }}>Total Users</div>
                  </div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: '#1E293B' }}>{totalUsers.toLocaleString()}</div>
                </div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#2E7D32', display: 'flex', alignItems: 'center', gap: 4 }}>↑ 342 new this month</div>
              </div>

              {/* Active Users */}
              <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 18, padding: '18px 20px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, background: 'linear-gradient(180deg, #3B82F6, #2563EB)', borderRadius: '18px 0 0 18px' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(59,130,246,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3B82F6', fontSize: 16, flexShrink: 0 }}><i className="fas fa-user-check" /></div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '.5px' }}>Active Users</div>
                  </div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: '#1E293B' }}>{Math.round(totalUsers * 0.847).toLocaleString()}</div>
                </div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#3B82F6' }}>84.7% active rate</div>
              </div>

              {/* New Signups */}
              <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 18, padding: '18px 20px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, background: 'linear-gradient(180deg, #8B5CF6, #7C3AED)', borderRadius: '18px 0 0 18px' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(139,92,246,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8B5CF6', fontSize: 16, flexShrink: 0 }}><i className="fas fa-user-plus" /></div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '.5px' }}>New Signups</div>
                  </div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: '#1E293B' }}>1,245</div>
                </div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#2E7D32', display: 'flex', alignItems: 'center', gap: 4 }}>↑ 18.3% from last month</div>
              </div>

              {/* Retention Rate */}
              <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 18, padding: '18px 20px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, background: 'linear-gradient(180deg, #F59E0B, #D97706)', borderRadius: '18px 0 0 18px' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(245,158,11,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#F59E0B', fontSize: 16, flexShrink: 0 }}><i className="fas fa-sync-alt" /></div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '.5px' }}>Retention Rate</div>
                  </div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: '#1E293B' }}>76.4%</div>
                </div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#2E7D32', display: 'flex', alignItems: 'center', gap: 4 }}>↑ 2.1% from last month</div>
              </div>
            </div>
          )}

          {/* Inventory KPI Cards */}
          {tab === 'inventory' && !loading && !error && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginBottom: 20 }}>
              {/* Total Stock Value */}
              <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 18, padding: '18px 20px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, background: 'linear-gradient(180deg, #22C55E, #16A34A)', borderRadius: '18px 0 0 18px' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(46,125,50,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2E7D32', fontSize: 16, flexShrink: 0 }}><i className="fas fa-warehouse" /></div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '.5px' }}>Total Stock Value</div>
                  </div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: '#1E293B' }}>$89,420</div>
                </div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#2E7D32', display: 'flex', alignItems: 'center', gap: 4 }}>↑ 5.2% from last month</div>
              </div>

              {/* Total Units */}
              <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 18, padding: '18px 20px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, background: 'linear-gradient(180deg, #3B82F6, #2563EB)', borderRadius: '18px 0 0 18px' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(59,130,246,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3B82F6', fontSize: 16, flexShrink: 0 }}><i className="fas fa-boxes" /></div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '.5px' }}>Total Units</div>
                  </div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: '#1E293B' }}>12,456</div>
                </div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#2E7D32', display: 'flex', alignItems: 'center', gap: 4 }}>↑ 234 units added</div>
              </div>

              {/* Low Stock Items */}
              <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 18, padding: '18px 20px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, background: 'linear-gradient(180deg, #F59E0B, #D97706)', borderRadius: '18px 0 0 18px' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(245,158,11,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#F59E0B', fontSize: 16, flexShrink: 0 }}><i className="fas fa-exclamation-triangle" /></div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '.5px' }}>Low Stock Items</div>
                  </div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: '#1E293B' }}>18</div>
                </div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#EF4444', display: 'flex', alignItems: 'center', gap: 4 }}>↓ Need restocking</div>
              </div>

              {/* Out of Stock */}
              <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 18, padding: '18px 20px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, background: 'linear-gradient(180deg, #EF4444, #DC2626)', borderRadius: '18px 0 0 18px' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(239,68,68,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#EF4444', fontSize: 16, flexShrink: 0 }}><i className="fas fa-times-circle" /></div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '.5px' }}>Out of Stock</div>
                  </div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: '#1E293B' }}>5</div>
                </div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#EF4444', display: 'flex', alignItems: 'center', gap: 4 }}>↓ 0.95% of products</div>
              </div>
            </div>
          )}

          {/* Tab content tables */}
          {tab !== 'revenue' && tab !== 'user' && (
          <div className={styles.panel}>
            <div className={styles.panelHeader}><h2 className={styles.panelTitle}>{tab === 'product' ? 'Top Products by Revenue' : tab === 'inventory' ? 'Inventory Status by Country' : TABS.find((t) => t.id === tab)?.label}</h2></div>
            <div className={styles.tableWrapper}>
              {tab === 'sales' && (
                <table className={styles.table}>
                  <thead><tr><th>Country</th><th>Orders</th><th>Revenue</th><th>Avg Order</th><th>Top Product</th><th>Share</th></tr></thead>
                  <tbody>
                    {countryRev.map((c) => {
                      const share = kpiRevenue > 0 ? Math.round((c.revenue / kpiRevenue) * 100) : 0;
                      const topProduct = c.revenue > 30000 ? 'Big Box Bundle' : c.revenue > 15000 ? 'Small Box Pack' : 'Single Box';
                      return (
                        <tr key={c.code}>
                          <td style={{ fontWeight: 600 }}>
                            <img src={FLAGS[c.code] ?? ''} alt="" style={{ width: 16, height: 16, borderRadius: '50%', objectFit: 'cover', marginRight: 6, verticalAlign: 'middle' }} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                            {COUNTRY_NAMES[c.code] ?? c.code}
                          </td>
                          <td>{c.orders}</td><td style={{ fontWeight: 600 }}>{CURRENCY_SYMBOLS[c.code] ?? ''}{c.revenue.toLocaleString()}</td>
                          <td>{CURRENCY_SYMBOLS[c.code] ?? ''}{c.orders ? Math.round(c.revenue / c.orders).toLocaleString() : 0}</td>
                          <td style={{ color: '#64748B', fontSize: 13 }}>{topProduct}</td>
                          <td style={{ color: '#2E7D32' }}>{share}%</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
              {tab === 'orders' && (
                <>
                  <table className={styles.table}>
                    <thead><tr><th>Country</th><th>Total</th><th>Delivered</th><th>Shipped</th><th>Processing</th><th>Pending</th><th>Cancelled</th><th>Returned</th></tr></thead>
                    <tbody>
                      {orderCountryRows.filter((c) => matchScope(c.code ?? c.id)).map((c) => {
                        const total = c.orders;
                        const delivered = Math.round(total * 0.88);
                        const shipped = Math.round(total * 0.04);
                        const processing = Math.round(total * 0.02);
                        const pending = Math.round(total * 0.03);
                        const cancelled = Math.round(total * 0.02);
                        const returned = total - delivered - shipped - processing - pending - cancelled;
                        return (
                          <tr key={c.id}>
                            <td style={{ fontWeight: 600 }}>
                              <img src={c.flagImg ?? ''} alt="" style={{ width: 16, height: 16, borderRadius: '50%', objectFit: 'cover', marginRight: 6, verticalAlign: 'middle' }} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                              {c.name}
                            </td>
                            <td style={{ fontWeight: 600 }}>{total.toLocaleString()}</td>
                            <td style={{ color: '#2E7D32' }}>{delivered.toLocaleString()}</td>
                            <td style={{ color: '#3B82F6' }}>{shipped.toLocaleString()}</td>
                            <td style={{ color: '#8B5CF6' }}>{processing.toLocaleString()}</td>
                            <td>{pending.toLocaleString()}</td>
                            <td style={{ color: '#EF4444' }}>{cancelled.toLocaleString()}</td>
                            <td style={{ color: '#F59E0B' }}>{returned.toLocaleString()}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </>
              )}
              {tab === 'country' && (
                <table className={styles.table}>
                  <thead><tr><th>Country</th><th>Orders</th><th>Revenue</th><th>Customers</th><th>Products</th><th>Growth</th></tr></thead>
                  <tbody>
                    {countryTabRows.filter((c) => matchScope(c.code)).map((c) => {
                      const products = Math.round(c.orders * 1.2);
                      const growth = c.growth;
                      return (
                        <tr key={c.id}>
                          <td style={{ fontWeight: 600 }}>
                            <img src={c.flagImg ?? ''} alt="" style={{ width: 16, height: 16, borderRadius: '50%', objectFit: 'cover', marginRight: 6, verticalAlign: 'middle' }} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                            {c.name}
                          </td>
                          <td>{c.orders.toLocaleString()}</td>
                          <td style={{ fontWeight: 600 }}>{formatPrice(c.revenue, c.code as CountryCode)}</td>
                          <td>{c.customers.toLocaleString()}</td>
                          <td style={{ fontWeight: 600 }}>{products.toLocaleString()}</td>
                          <td style={{ color: '#2E7D32', fontWeight: 600 }}>+{growth}%</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
              {tab === 'product' && (
                <table className={styles.table}>
                  <thead><tr><th>Product</th><th>Category</th><th>Units Sold</th><th>Revenue</th><th>Stock</th><th>Rating</th></tr></thead>
                  <tbody>
                    {topProductsList.map((p, i) => {
                      const stock = Math.round(p.units * 1.5);
                      const rating = (4 + (i < 3 ? 0.5 - i * 0.1 : 0)).toFixed(1);
                      return (
                        <tr key={p.name}>
                          <td style={{ fontWeight: 600 }}>{p.name}</td>
                          <td style={{ color: '#64748B' }}>{p.category ?? extra?.byCategory?.[i % extra.byCategory.length]?.name ?? 'General'}</td>
                          <td>{p.units.toLocaleString()}</td>
                          <td style={{ fontWeight: 600 }}>${p.revenue.toLocaleString()}</td>
                          <td style={{ color: stock < 50 ? '#EF4444' : '#2E7D32', fontWeight: 600 }}>{stock}</td>
                          <td style={{ color: '#F59E0B' }}>★ {rating}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
              {tab === 'category' && (
                <table className={styles.table}>
                  <thead><tr><th>Category</th><th>Products</th><th>Orders</th><th>Revenue</th><th>Avg Price</th><th>Growth</th><th>Top Product</th></tr></thead>
                  <tbody>
                    {categoryRows.map((c) => {
                      const orders = c.orders;
                      const avgPrice = c.avgPrice;
                      const growth = c.growth;
                      const topProducts = ['Organic Tomatoes', 'Baby Spinach', 'Brown Rice', 'Coriander', 'Mint Leaves'];
                      const topProduct = topProducts[Math.abs(c.name.charCodeAt(0)) % topProducts.length];
                      return (
                        <tr key={c.name}>
                          <td style={{ fontWeight: 600 }}>{c.name}</td>
                          <td>{c.products}</td>
                          <td>{orders.toLocaleString()}</td>
                          <td style={{ fontWeight: 600 }}>${c.revenue.toLocaleString()}</td>
                          <td>${avgPrice}</td>
                          <td style={{ color: '#2E7D32', fontWeight: 600 }}>+{growth}%</td>
                          <td style={{ color: '#64748B', fontSize: 13 }}>{topProduct}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
              {tab === 'inventory' && (
                <table className={styles.table}>
                  <thead><tr><th>Country</th><th>Total Products</th><th>In Stock</th><th>Low Stock</th><th>Out of Stock</th><th>Stock Value</th><th>Turnover Rate</th></tr></thead>
                  <tbody>
                    {DEMO_INVENTORY_COUNTRIES.map((c) => {
                      const total = c.total;
                      const inStock = c.inStock;
                      const lowStock = c.lowStock;
                      const outOfStock = c.outOfStock;
                      const stockValue = c.stockValue;
                      const turnover = c.turnover;
                      return (
                        <tr key={c.id}>
                          <td style={{ fontWeight: 600 }}>
                            <img src={c.flagImg ?? ''} alt="" style={{ width: 16, height: 16, borderRadius: '50%', objectFit: 'cover', marginRight: 6, verticalAlign: 'middle' }} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                            {c.name}
                          </td>
                          <td style={{ fontWeight: 600 }}>{total.toLocaleString()}</td>
                          <td style={{ color: '#2E7D32' }}>{inStock.toLocaleString()}</td>
                          <td style={{ color: '#F59E0B' }}>{lowStock.toLocaleString()}</td>
                          <td style={{ color: '#EF4444' }}>{outOfStock.toLocaleString()}</td>
                          <td style={{ fontWeight: 600 }}>${stockValue.toLocaleString()}</td>
                          <td>{turnover}x</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
           </div>
           </div>
          )}

          {/* User Tab Content - Two Column Layout */}
          {tab === 'user' && !loading && !error && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 20 }}>
              {/* Users by Country Table */}
              <div className={styles.panel}>
                <div className={styles.panelHeader}><h2 className={styles.panelTitle}>Users by Country</h2></div>
                <div className={styles.tableWrapper}>
                  <table className={styles.table}>
                    <thead><tr><th>Country</th><th>Total</th><th>Active</th><th>New</th><th>Revenue/User</th></tr></thead>
                    <tbody>
                      {userCountryRows.filter((c) => matchScope(c.id)).map((c) => {
                        const total = c.customers;
                        const active = Math.round(total * 0.85);
                        const newUsers = Math.round(total * 0.04);
                        const revPerUser = c.revPerUser;
                        return (
                          <tr key={c.id}>
                            <td style={{ fontWeight: 600 }}>
                              <img src={c.flagImg ?? ''} alt="" style={{ width: 16, height: 16, borderRadius: '50%', objectFit: 'cover', marginRight: 6, verticalAlign: 'middle' }} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                              {c.name}
                            </td>
                            <td style={{ fontWeight: 600 }}>{total.toLocaleString()}</td>
                            <td style={{ color: '#2E7D32' }}>{active.toLocaleString()}</td>
                            <td style={{ color: '#3B82F6' }}>{newUsers.toLocaleString()}</td>
                            <td style={{ fontWeight: 600 }}>${revPerUser.toFixed(2)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* User Engagement Panel */}
              <div className={styles.panel}>
                <div className={styles.panelHeader}><h2 className={styles.panelTitle}>User Engagement</h2></div>
                <div className={styles.panelBody}>
                  {([
                    { label: 'Daily Active Users', value: 4892, anim: animDaily, max: 20000, color: '#2E7D32' },
                    { label: 'Weekly Active Users', value: 12456, anim: animWeekly, max: 20000, color: '#3B82F6' },
                    { label: 'Monthly Active Users', value: 18420, anim: animMonthly, max: 20000, color: '#3B82F6' },
                    { label: 'Avg. Session Duration', value: 45, anim: animSession, max: 60, color: '#F59E0B', suffix: 'min' },
                  ] as const).map((item, i) => (
                    <div key={item.label} style={{ marginBottom: i < 3 ? 20 : 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: '#1E293B' }}>{item.label}</span>
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#1E293B' }}>{Math.round(item.anim).toLocaleString()}{item.suffix ? ` ${item.suffix}` : ''}</span>
                      </div>
                      <div style={{ height: 12, background: '#E5E7EB', borderRadius: 6, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: userMounted ? `${Math.min(100, (item.value / item.max) * 100)}%` : '0%', background: item.color, borderRadius: 6, transition: `width 4s cubic-bezier(0.22,1,0.36,1) ${0.3 + i * 0.3}s` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      )}
      </ScrollReveal>
    </div>
  );
}
