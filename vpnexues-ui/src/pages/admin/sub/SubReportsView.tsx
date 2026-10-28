import { useEffect, useMemo, useState } from 'react';
import { getOrder, listOrders } from '../../../api/adminOrdersApi';
import { listCustomers } from '../../../api/adminCustomersApi';
import { listInventory } from '../../../api/adminInventoryApi';
import { listPayments, type AdminPaymentTxn } from '../../../api/adminPaymentsApi';
import {
  demoGetOrder,
  demoToggleSubscriber,
} from '../../../api/demo/demoAdmin';
import type { AdminCustomer, AdminInventoryItem, AdminOrderSummary, OrderItem } from '../../../types';
import type { CountryConfig } from '../../../config/countryConfig';
import { ORDER_CHANNELS } from '../../../types';
import StatusBadge from '../../../components/admin/StatusBadge';
import { useToast } from '../../../components/admin/Toast';
import type { ExportData } from '../../../utils/csvExport';
import { downloadCsv, downloadExcel, downloadPdf } from '../../../utils/csvExport';
import { getErrorMessage } from '../../../utils/errors';
import {
  filterOrdersByRange,
  computeDayOfWeekData,
  computeOrderValueDistribution,
  computeDeliveryPerformance,
  computeRecentHighValueOrders,
  computeCategoryRevenue,
  computeRevenueComparison,
  computeOrdersComparison,
  computeAOVComparison,
  getStockStatus,
} from '../../../utils/analytics';
import styles from './SubViews.module.css';
import TrustBanner from './TrustBanner';

type Tab = 'overview' | 'revenue' | 'sales' | 'orders' | 'products' | 'customers' | 'inventory' | 'deep-dive' | 'subscribers' | 'imports' | 'channels';
type DateFilter = 'all' | 'today' | '7d' | '30d' | '6m' | '1y';

function guessCategory(name: string): string {
  const n = name.toLowerCase();
  if (n.includes('juice') || n.includes('tea') || n.includes('coffee') || n.includes('lassi') || n.includes('milk') || n.includes('water') || n.includes('sarbath') || n.includes('cooler') || n.includes('vinegar') || n.includes('shake') || n.includes('chai') || n.includes('latte') || n.includes('barley')) return 'Beverages';
  if (n.includes('mango') || n.includes('banana') || n.includes('apple') || n.includes('grape') || n.includes('orange') || n.includes('lemon') || n.includes('kiwi') || n.includes('avocado') || n.includes('blueberry') || n.includes('guava') || n.includes('chiku') || n.includes('jackfruit') || n.includes('coconut') || n.includes('papaya') || n.includes('pineapple') || n.includes('watermelon') || n.includes('pomegranate') || n.includes('dragon') || n.includes('pear') || n.includes('date') || n.includes('fig') || n.includes('plum') || n.includes('cherry') || n.includes('peach') || n.includes('raspberry') || n.includes('tamarind') || n.includes('grapefruit') || n.includes('melon') || n.includes('lychee') || n.includes('apricot') || n.includes('gooseberry')) return 'Fruits';
  if (n.includes('rice') || n.includes('lentil') || n.includes('dal') || n.includes('oil') || n.includes('seed') || n.includes('flour') || n.includes('honey') || n.includes('ghee') || n.includes('egg') || n.includes('nut') || n.includes('almond') || n.includes('cashew') || n.includes('walnut') || n.includes('peanut') || n.includes('oats') || n.includes('quinoa') || n.includes('jaggery') || n.includes('sugar') || n.includes('salt') || n.includes('pepper') || n.includes('paneer') || n.includes('curd') || n.includes('cheese') || n.includes('butter') || n.includes('masala') || n.includes('paste') || n.includes('frozen')) return 'Groceries';
  if (n.includes('spinach') || n.includes('tomato') || n.includes('Coriander') || n.includes('mint leaves') || n.includes('onion') || n.includes('potato') || n.includes('carrot') || n.includes('pepper') || n.includes('cabbage') || n.includes('broccoli') || n.includes('cauliflower') || n.includes('garlic') || n.includes('ginger') || n.includes('chilli') || n.includes('coriander') || n.includes('lettuce') || n.includes('bean') || n.includes('pea') || n.includes('corn') || n.includes('mushroom') || n.includes('cucumber') || n.includes('brinjal') || n.includes('beetroot') || n.includes('pumpkin') || n.includes('bitter gourd') || n.includes('drumstick') || n.includes('okra') || n.includes('radish')) return 'Vegetables';
  return 'Vegetables';
}

const TAB_ICONS: Record<string, string> = {
  'overview': 'fas fa-th-large',
  'revenue': 'fas fa-rupee-sign',
  'sales': 'fas fa-shopping-cart',
  'orders': 'fas fa-receipt',
  'products': 'fas fa-box-open',
  'customers': 'fas fa-users',
  'inventory': 'fas fa-warehouse',
  'deep-dive': 'fas fa-search-plus',
  'subscribers': 'fas fa-user-plus',
  'imports': 'fas fa-ship',
  'channels': 'fas fa-channel',
};

const TAB_LABELS: Record<string, string> = {
  'overview': 'Overview',
  'revenue': 'Revenue',
  'sales': 'Sales',
  'orders': 'Orders',
  'products': 'Products',
  'customers': 'Customers',
  'inventory': 'Inventory',
  'deep-dive': 'Deep Dive',
  'subscribers': 'Subscribers',
  'imports': 'Imports',
  'channels': 'Channels',
};

export default function SubReportsView({ config }: { config: CountryConfig }) {
  const code = config.code;
  const sym = config.currencySymbol;
  const [tab, setTab] = useState<Tab>('overview');
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');
  const [orders, setOrders] = useState<AdminOrderSummary[]>([]);
  const [customers, setCustomers] = useState<AdminCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [region, setRegion] = useState('');
  const [city, setCity] = useState('');
  const [ddOpen, setDdOpen] = useState(false);
  const { notify } = useToast();

  const [subSearch, setSubSearch] = useState('');
  const [subStatus, setSubStatus] = useState('');
  const [subPage, setSubPage] = useState(1);
  const [custRegion, setCustRegion] = useState('');
  const [custCity, setCustCity] = useState('');
  const [invRegion, setInvRegion] = useState('');
  const [invCity, setInvCity] = useState('');
  const [subRegion, setSubRegion] = useState('');
  const [subCity, setSubCity] = useState('');
  const SUB_PAGE_SIZE = 8;

  const tabs: Tab[] = ['overview', 'revenue', 'sales', 'orders', 'products', 'customers', 'inventory', 'deep-dive', 'subscribers'];
  if (config.id === 'uae') tabs.push('imports');
  if (config.id === 'singapore') tabs.push('channels');

  function load() {
    setLoading(true);
    Promise.all([
      listOrders({ country: code, size: 200 }),
      listCustomers({ country: code }),
    ])
      .then(([o, c]) => {
        setOrders(o.content);
        setCustomers(c);
        setError('');
      })
      .catch((err: unknown) => setError(getErrorMessage(err, 'Could not load report data.')))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    setRegion('');
    setCity('');
    setDdOpen(false);
    setCustRegion('');
    setCustCity('');
    setInvRegion('');
    setInvCity('');
    setSubRegion('');
    setSubCity('');
    setSubSearch('');
    setSubStatus('');
    setSubPage(1);
  }, [code]);

  useEffect(load, [code]);

  // Filter orders by date range
  const filteredOrders = useMemo(() => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);
    
    let baseOrders = orders;
    
    if (dateFilter === 'today') {
      baseOrders = orders.filter(o => {
        const d = new Date(o.createdAt);
        return d >= todayStart && d < todayEnd;
      });
    } else {
      const rangeMap: Record<string, string> = { all: 'all', '7d': '7d', '30d': '30d', '6m': '6m', '1y': '1y' };
      baseOrders = filterOrdersByRange(orders, rangeMap[dateFilter] ?? 'all');
    }
    
    return baseOrders;
  }, [orders, dateFilter]);

  // Build order→city/state lookup from order detail address data
  // Also build a city→state reverse map from GEO data since demo orders store city name in address.state
  const { orderGeoMap, cityToStateMap } = useMemo(() => {
    const geoLookup = { label: config.id, states: [] };
    const cts = new Map<string, string>();
    for (const s of geoLookup.states) {
      for (const c of s.cities) {
        cts.set(c.name, s.name);
      }
    }
    const ogm = new Map<string, { city: string; state: string }>();
    for (const o of orders) {
      try {
        const detail = demoGetOrder(o.id);
        const rawCity = detail.address?.city ?? '';
        const rawState = detail.address?.state ?? '';
        // If address.state equals address.city, resolve actual state from GEO
        const actualState = rawState === rawCity ? (cts.get(rawCity) ?? rawState) : rawState;
        ogm.set(o.id, { city: rawCity, state: actualState });
      } catch {
        ogm.set(o.id, { city: '', state: '' });
      }
    }
    return { orderGeoMap: ogm, cityToStateMap: cts };
  }, [orders, config.id]);

  // Filter orders by selected state/city
  const cityFilteredOrders = useMemo(() => {
    if (!region && !city) return filteredOrders;
    return filteredOrders.filter(o => {
      const geo = orderGeoMap.get(o.id);
      if (!geo) return false;
      if (city && (geo.city || '').toLowerCase() !== city.toLowerCase()) return false;
      if (region && (geo.state || '').toLowerCase() !== region.toLowerCase()) return false;
      return true;
    });
  }, [filteredOrders, region, city, orderGeoMap]);

  const revenue = cityFilteredOrders.filter((o) => o.status !== 'CANCELLED').reduce((s, o) => s + o.grandTotal, 0);

  const [payTxns, setPayTxns] = useState<AdminPaymentTxn[]>([]);
  // Real order items for category stats (detail walk; failures degrade to fewer rows, never demo data).
  const [orderItemsCache, setOrderItemsCache] = useState<Record<string, OrderItem[]>>({});
  const [catLoading, setCatLoading] = useState(false);
  useEffect(() => {
    const missing = orders.map((o) => o.id).filter((id) => !orderItemsCache[id]);
    if (missing.length === 0) return;
    let cancelled = false;
    setCatLoading(true);
    void Promise.allSettled(missing.map((id) => getOrder(id))).then((results) => {
      if (cancelled) return;
      setOrderItemsCache((prev) => {
        const next = { ...prev };
        results.forEach((r, i) => {
          if (r.status === 'fulfilled') next[missing[i]] = r.value.items;
        });
        return next;
      });
      setCatLoading(false);
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orders]);
  useEffect(() => {
    let cancelled = false;
    listPayments()
      .then((txns) => {
        if (!cancelled) setPayTxns(txns.filter((t) => t.country === config.code));
      })
      .catch(() => {
        if (!cancelled) setPayTxns([]);
      });
    return () => {
      cancelled = true;
    };
  }, [config.code]);

  const monthMap = new Map<string, { revenue: number; orders: number }>();
  for (const o of cityFilteredOrders) {
    const m = o.createdAt.slice(0, 7);
    const e = monthMap.get(m) ?? { revenue: 0, orders: 0 };
    e.orders += 1;
    if (o.status !== 'CANCELLED') e.revenue += o.grandTotal;
    monthMap.set(m, e);
  }
  const months = [...monthMap.entries()].map(([month, v]) => ({ month, ...v })).sort((a, b) => (a.month < b.month ? 1 : -1));
  const prodMap = new Map<string, { units: number; revenue: number }>();
  for (const o of cityFilteredOrders) {
    try {
      for (const item of demoGetOrder(o.id).items) {
        const p = prodMap.get(item.name) ?? { units: 0, revenue: 0 };
        p.units += item.qty;
        p.revenue += item.lineTotal;
        prodMap.set(item.name, p);
      }
    } catch {
      // ignore
    }
  }
  const topProducts = [...prodMap.entries()].map(([name, v]) => ({ name, ...v })).sort((a, b) => b.revenue - a.revenue);
  const channelRows = ORDER_CHANNELS.map((ch) => {
    const list = cityFilteredOrders.filter((o) => o.channel === ch);
    return { channel: ch, orders: list.length, revenue: list.reduce((s, o) => s + o.grandTotal, 0) };
  });
  const geo = { label: config.id, states: [] };
  const subs = [];
  const report = {
    inventoryStatus: [],
    totalUsers: customers.length,
    activeUsers: customers.filter((c) => c.active !== false).length,
    newSignups: 0,
    newSignupsGrowth: 0,
    retentionRate: 0,
    retentionGrowth: 0,
    monthlyGrowth: [],
    newVsReturning: { newPct: 0, returningPct: 100 },
    customerList: customers,
    activeRate: customers.length
      ? Math.round((customers.filter((c) => c.active !== false).length / customers.length) * 100)
      : 0,
    restockRecs: [] as { product: string; current: number; recommended: number; priority: string }[],
  };

  // Filter geo states based on region/city selection
  const filteredGeo = useMemo(() => {
    if (!region) return geo;
    const state = geo.states.find(s => s.name === region);
    if (!state) return { ...geo, states: [] };
    if (!city) return { ...geo, states: [state] };
    const cityData = state.cities.find(c => c.name === city);
    if (!cityData) return { ...geo, states: [] };
    return { ...geo, states: [{ ...state, cities: [cityData] }] };
  }, [geo, region, city]);

  const maxMonth = Math.max(1, ...months.map((m) => m.revenue));

  const totalOrders = cityFilteredOrders.length;
  const completedOrders = cityFilteredOrders.filter((o) => o.status === 'DELIVERED').length;
  // "Pending" = everything not yet delivered or cancelled — real backend statuses only
  // (PENDING / IN_TRANSIT do not exist server-side; mirrors computeDeliveryPerformance's inProgress).
  const pendingOrders = cityFilteredOrders.filter((o) => ['PLACED', 'CONFIRMED', 'PROCESSING', 'SHIPPED'].includes(o.status)).length;
  const cancelledOrders = cityFilteredOrders.filter((o) => o.status === 'CANCELLED').length;
  const avgOrderValue = totalOrders > 0 ? revenue / totalOrders : 0;
  const conversionRate = customers.length > 0 ? ((totalOrders / customers.length) * 100).toFixed(1) : '0';
  const repeatRate = customers.length > 0 ? Math.round((customers.filter((c) => c.orderCount > 1).length / customers.length) * 100) : 0;
  const totalProducts = topProducts.length;
  const activeProducts = report.inventoryStatus.filter((i) => i.status === 'In Stock').length;
  const lowStockCount = report.inventoryStatus.filter((i) => i.status === 'Low Stock').length;
  const outOfStockCount = report.inventoryStatus.filter((i) => i.status === 'Out of Stock').length;
  const avgRating = 0;
  const reviewCount = 0;

  const topState = null;
  const bestDay = '-';
  const bestDayRevenue = 0;
  const peakHour = '-';
  const peakHourOrders = 0;
  const lowStockAlerts = lowStockCount + outOfStockCount;

  const monthlyRevenueData = months.map((m) => ({
    ...m,
    change: months.indexOf(m) < months.length - 1
      ? ((m.revenue - months[months.indexOf(m) + 1].revenue) / Math.max(1, months[months.indexOf(m) + 1].revenue) * 100).toFixed(1)
      : '+0',
  }));

  const categoryBreakdown = useMemo(() => [], [cityFilteredOrders]);

  const payTotal = payTxns.reduce((s, t) => s + t.amount, 0);
  const payByMethod = new Map<string, number>();
  for (const t of payTxns) payByMethod.set(t.method, (payByMethod.get(t.method) ?? 0) + t.amount);
  const paymentMethods = [...payByMethod.entries()]
    .map(([name, amt]) => ({ name, pct: payTotal > 0 ? Math.round((amt / payTotal) * 100) : 0, amount: Math.round(amt) }))
    .sort((a, b) => b.amount - a.amount);

  const dayOfWeekData = useMemo(() => computeDayOfWeekData(cityFilteredOrders), [cityFilteredOrders]);

  const orderValueRanges = useMemo(() => computeOrderValueDistribution(cityFilteredOrders), [cityFilteredOrders]);

  const deliveryPerformance = useMemo(() => computeDeliveryPerformance(cityFilteredOrders), [cityFilteredOrders]);

  const recentHighValueOrders = useMemo(() => computeRecentHighValueOrders(cityFilteredOrders, 5), [cityFilteredOrders]);

  const revComp = useMemo(() => computeRevenueComparison(cityFilteredOrders, dateFilter === 'all' ? 'all' : '30d'), [cityFilteredOrders, dateFilter]);
  const ordersComp = useMemo(() => computeOrdersComparison(cityFilteredOrders, dateFilter === 'all' ? 'all' : '30d'), [cityFilteredOrders, dateFilter]);
  const aovComp = useMemo(() => computeAOVComparison(cityFilteredOrders, dateFilter === 'all' ? 'all' : '30d'), [cityFilteredOrders, dateFilter]);

  const salesByCategory = useMemo(() => {
    const agg = new Map<string, { units: number; revenue: number; orders: Set<string> }>();
    for (const o of cityFilteredOrders) {
      const items = orderItemsCache[o.id];
      if (!items) continue;
      for (const item of items) {
        const cat = guessCategory(item.name);
        const e = agg.get(cat) ?? { units: 0, revenue: 0, orders: new Set<string>() };
        e.units += item.qty;
        e.revenue += item.lineTotal;
        e.orders.add(o.id);
        agg.set(cat, e);
      }
    }
    const total = Math.max(1, cityFilteredOrders.length);
    return [...agg.entries()]
      .map(([category, v]) => ({
        category,
        sales: v.units,
        revenue: Math.round(v.revenue * 100) / 100,
        avgPrice: v.units > 0 ? Math.round((v.revenue / v.units) * 100) / 100 : 0,
        convRate: Math.round((v.orders.size / total) * 1000) / 10,
      }))
      .sort((a, b) => b.revenue - a.revenue);
  }, [cityFilteredOrders, orderItemsCache]);

  // Region drill-down source (Deep Dive tab only): real delivery addresses from order details. Failures degrade to fewer regions, never demo data.
  const [addrByOrder, setAddrByOrder] = useState<Record<string, { city: string; state: string }>>({});
  useEffect(() => {
    const missing = orders.map((o) => o.id).filter((id) => !addrByOrder[id]);
    if (missing.length === 0) return;
    let cancelled = false;
    void Promise.allSettled(missing.map((id) => getOrder(id))).then((results) => {
      if (cancelled) return;
      setAddrByOrder((prev) => {
        const next = { ...prev };
        results.forEach((r, i) => {
          if (r.status === 'fulfilled') {
            const a = r.value.address;
            next[missing[i]] = { city: a?.city ?? '', state: a?.state ?? '' };
          }
        });
        return next;
      });
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orders]);

  const ddGeo = useMemo(() => {
    const states = new Map<string, Set<string>>();
    for (const o of orders) {
      const a = addrByOrder[o.id];
      if (!a) continue;
      const st = a.state || 'Unknown';
      const ct = a.city || 'Unknown';
      if (!states.has(st)) states.set(st, new Set());
      states.get(st)!.add(ct);
    }
    return {
      label: config.id,
      states: [...states.entries()].map(([name, cities]) => ({
        name,
        cities: [...cities].map((c) => ({ name: c })),
      })),
    };
  }, [orders, addrByOrder, config.id]);

  // Country-wide inventory (inventory has no region field) for the Deep Dive card.
  const [invItems, setInvItems] = useState<AdminInventoryItem[]>([]);
  useEffect(() => {
    let cancelled = false;
    listInventory({})
      .then((items) => {
        if (!cancelled) setInvItems(items);
      })
      .catch(() => {
        if (!cancelled) setInvItems([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const topProductsByState = filteredGeo.states.slice(0, 4).map((s, i) => ({
    top: i + 1,
    region: s.name,
    topProduct: s.topProducts[0]?.name ?? 'N/A',
    category: s.topProducts[0]?.category ?? 'N/A',
    unitsSold: s.units,
    productRevenue: s.revenue,
    topCities: s.cities.slice(0, 3).map((c) => `${c.name} · ${Math.round(c.orders * 0.6)} sold`),
  }));

  function getExportData(): ExportData {
    let columns = ['Metric', 'Value'];
    let rows: (string | number)[][] = [[`Tab`, tab], ['Orders', cityFilteredOrders.length], ['Revenue', revenue]];
    if (tab === 'subscribers') {
      columns = ['ID', 'Name', 'Email', 'Status', 'Source'];
      rows = subs.map((s) => [s.id, s.name, s.email, s.status, s.source]);
    }
    return { filename: `${config.id}-report-${tab}.csv`, title: `Report ${tab} — ${config.name}`, columns, rows };
  }

  function toggleSub(id: string) {
    demoToggleSubscriber(id);
    load();
    notify('Subscriber status updated.');
  }

  const filteredSubs = subs.filter((s) => {
    if (subStatus && s.status !== subStatus) return false;
    if (subSearch) {
      const q = subSearch.toLowerCase();
      if (!`${s.name} ${s.email} ${s.id} ${s.phone}`.toLowerCase().includes(q)) return false;
    }
    return true;
  });
  const subTotalPages = Math.max(1, Math.ceil(filteredSubs.length / SUB_PAGE_SIZE));
  const pagedSubs = filteredSubs.slice((subPage - 1) * SUB_PAGE_SIZE, subPage * SUB_PAGE_SIZE);

  if (loading) return <p className={styles.empty}>Loading {config.name} reports...</p>;
  if (error)
    return (
      <div style={{ textAlign: 'center', padding: 24 }}>
        <p className={styles.empty}>{error}</p>
        <button type="button" className={styles.viewButton} onClick={() => load()}>Retry</button>
      </div>
    );

  return (
    <div>
      {/* ── Date Filters ───────────────────────────── */}
      <div className={styles.rptDateRow}>
        {(['all', 'today', '7d', '30d', '6m', '1y'] as DateFilter[]).map((df) => (
          <button key={df} type="button" className={`${styles.rptDateBtn} ${dateFilter === df ? styles.rptDateBtnActive : ''}`} onClick={() => setDateFilter(df)}>
            {df === 'all' ? 'All Time' : df === 'today' ? 'Today' : df === '7d' ? '7 Days' : df === '30d' ? '30 Days' : df === '6m' ? '6 Months' : '1 Year'}
          </button>
        ))}
        <div className={styles.rptExportBtnRow}>
          <button type="button" className={styles.rptExportBtnSmall} onClick={() => { const d = getExportData(); downloadExcel(d); notify('Excel exported.'); }}>
            <i className="fas fa-file-excel" style={{ color: '#16A34A' }} /> Excel
          </button>
          <button type="button" className={styles.rptExportBtnSmall} onClick={() => { const d = getExportData(); downloadCsv(d.filename, d.columns, d.rows); notify('CSV exported.'); }}>
            <i className="fas fa-file-csv" style={{ color: '#16A34A' }} /> CSV
          </button>
          <button type="button" className={styles.rptExportBtnSmall} onClick={() => { const d = getExportData(); downloadPdf(d); notify('PDF exported.'); }}>
            <i className="fas fa-file-pdf" style={{ color: '#16A34A' }} /> PDF
          </button>
        </div>
      </div>

      {/* ── Tab Bar ────────────────────────────────── */}
      <div className={styles.rptTabBar}>
        {tabs.map((t) => (
          <button key={t} type="button" className={`${styles.rptTab} ${tab === t ? styles.rptTabActive : ''}`} onClick={() => setTab(t)}>
            <i className={TAB_ICONS[t] || 'fas fa-circle'} />
            {TAB_LABELS[t] || t}
          </button>
        ))}
      </div>

      {/* ── State/City Filter Bar ───────────────── */}
      <div className={styles.rptFilterBar}>
        <div className={styles.rptFilterGroup}>
          <label className={styles.rptFilterLabel}>State</label>
          <select className={styles.rptFilterSelect} value={region} onChange={(e) => { setRegion(e.target.value); setCity(''); }}>
            <option value="">All States</option>
            {filteredGeo.states.map((s) => (
              <option key={s.name} value={s.name}>{s.name}</option>
            ))}
          </select>
        </div>
        <div className={styles.rptFilterGroup}>
          <label className={styles.rptFilterLabel}>City</label>
          <select className={styles.rptFilterSelect} value={city} onChange={(e) => setCity(e.target.value)} disabled={!region}>
            <option value="">All Cities</option>
            {region && geo.states.find((s) => s.name === region)?.cities.map((c) => (
              <option key={c.name} value={c.name}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          OVERVIEW TAB
      ═══════════════════════════════════════════════════════════ */}
      {tab === 'overview' && (
        <div>
          {/* KPI Cards */}
          <div className={styles.rptOverviewKpiRow}>
            <div className={styles.rptOverviewKpiCard}>
              <div className={styles.rptOverviewKpiLabel}>Total Revenue</div>
              <div className={styles.rptOverviewKpiValue}>{sym}{revenue.toLocaleString()}</div>
              <div className={styles.rptOverviewKpiSub}>{revComp.changePercent >= 0 ? '↑' : '↓'} {Math.abs(revComp.changePercent)}% vs last period</div>
              <div className={styles.rptOverviewKpiIcon}><i className="fas fa-rupee-sign" /></div>
            </div>
            <div className={styles.rptOverviewKpiCard}>
              <div className={styles.rptOverviewKpiLabel}>Monthly Revenue</div>
              <div className={styles.rptOverviewKpiValue}>{sym}{months[0] ? months[0].revenue.toLocaleString() : '0'}</div>
              <div className={styles.rptOverviewKpiSub}>{revComp.changePercent >= 0 ? '↑' : '↓'} {Math.abs(revComp.changePercent)}%</div>
              <div className={styles.rptOverviewKpiIcon}><i className="fas fa-chart-line" /></div>
            </div>
            <div className={styles.rptOverviewKpiCard}>
              <div className={styles.rptOverviewKpiLabel}>Total Orders</div>
              <div className={styles.rptOverviewKpiValue}>{totalOrders.toLocaleString()}</div>
              <div className={styles.rptOverviewKpiSub}>{ordersComp.changePercent >= 0 ? '↑' : '↓'} {Math.abs(ordersComp.changePercent)}%</div>
              <div className={styles.rptOverviewKpiIcon}><i className="fas fa-receipt" /></div>
            </div>
            <div className={styles.rptOverviewKpiCard}>
              <div className={styles.rptOverviewKpiLabel}>Avg Order Value</div>
              <div className={styles.rptOverviewKpiValue}>{sym}{Math.round(avgOrderValue).toLocaleString()}</div>
              <div className={styles.rptOverviewKpiSub}>{aovComp.changePercent >= 0 ? '↑' : '↓'} {Math.abs(aovComp.changePercent)}%</div>
              <div className={`${styles.rptOverviewKpiIcon} ${styles.rptOverviewKpiIconBlue}`}><i className="fas fa-shopping-cart" /></div>
            </div>
            <div className={styles.rptOverviewKpiCard}>
              <div className={styles.rptOverviewKpiLabel}>Conversion Rate</div>
              <div className={styles.rptOverviewKpiValue}>{conversionRate}%</div>
              <div className={styles.rptOverviewKpiSub}>↑ 0.8%</div>
              <div className={`${styles.rptOverviewKpiIcon} ${styles.rptOverviewKpiIconPurple}`}><i className="fas fa-percentage" /></div>
            </div>
            <div className={styles.rptOverviewKpiCard}>
              <div className={styles.rptOverviewKpiLabel}>Repeat Customers</div>
              <div className={styles.rptOverviewKpiValue}>{repeatRate}%</div>
              <div className={styles.rptOverviewKpiSub}>↑ 5.1%</div>
              <div className={styles.rptOverviewKpiIcon}><i className="fas fa-users" /></div>
            </div>
          </div>

          {/* Revenue Trend + Revenue by Category */}
          <div className={styles.rptTwoPanel}>
            <div className={styles.rptChartPanel}>
              <div className={styles.rptChartPanelHeader}>Revenue Trend (Jan - Jul 2026)</div>
              <div className={styles.rptTrendChart}>
                {months.length === 0 ? (
                  <div style={{ padding: 40, textAlign: 'center', color: '#94A3B8', fontSize: 13 }}>No revenue data available</div>
                ) : (
                  <svg width="100%" height="220" viewBox="0 0 600 220" preserveAspectRatio="xMidYMid meet">
                    <defs>
                      <linearGradient id={`trendGrad-${config.id}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#16A34A" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#16A34A" stopOpacity="0.02" />
                      </linearGradient>
                    </defs>
                    {(() => {
                      const reversed = [...months].reverse();
                      const maxRev = Math.max(1, ...reversed.map((m) => m.revenue));
                      const padL = 50;
                      const padR = 20;
                      const padT = 10;
                      const padB = 28;
                      const chartW = 600 - padL - padR;
                      const chartH = 220 - padT - padB;
                      const points = reversed.map((m, i) => ({
                        x: padL + (i / Math.max(1, reversed.length - 1)) * chartW,
                        y: padT + chartH - (m.revenue / maxRev) * chartH,
                        month: m.month,
                        revenue: m.revenue,
                      }));
                      const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
                      const areaPath = `${linePath} L${points[points.length - 1].x},${padT + chartH} L${points[0].x},${padT + chartH} Z`;
                      const yTicks = 4;
                      return (
                        <>
                          {Array.from({ length: yTicks + 1 }, (_, i) => {
                            const v = (maxRev * i) / yTicks;
                            const y = padT + chartH - (v / maxRev) * chartH;
                            return (
                              <g key={i}>
                                <line x1={padL} y1={y} x2={600 - padR} y2={y} stroke="#E5E7EB" strokeWidth="1" strokeDasharray={i === 0 ? '0' : '3,3'} />
                                <text x={padL - 8} y={y + 4} textAnchor="end" fontSize="10" fill="#9CA3AF">
                                  {v >= 100000 ? `${sym}${(v / 100000).toFixed(1)}L` : `${sym}${Math.round(v).toLocaleString()}`}
                                </text>
                              </g>
                            );
                          })}
                          <line x1={padL} y1={padT + chartH} x2={600 - padR} y2={padT + chartH} stroke="#CBD5E1" strokeWidth="1" />
                          <path d={areaPath} fill={`url(#trendGrad-${config.id})`} />
                          <path d={linePath} fill="none" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                          {points.map((p, i) => (
                            <g key={i}>
                              <circle cx={p.x} cy={p.y} r="4" fill="#16A34A" stroke="#fff" strokeWidth="2" />
                              <title>{p.month}: {sym}{p.revenue.toLocaleString()}</title>
                            </g>
                          ))}
                          {points.map((p) => (
                            <text key={p.x} x={p.x} y={padT + chartH + 18} textAnchor="middle" fontSize="10" fill="#6B7280">
                              {p.month.slice(-3)}
                            </text>
                          ))}
                        </>
                      );
                    })()}
                  </svg>
                )}
              </div>
            </div>

            <div className={styles.rptChartPanel}>
              <div className={styles.rptChartPanelHeader}>Revenue by Category</div>
              <div className={styles.rptCategoryBody}>
                {categoryBreakdown.length === 0 ? (
                  <div style={{ padding: 40, textAlign: 'center', color: '#94A3B8', fontSize: 13 }}>No category data available</div>
                ) : (
                  categoryBreakdown.map((cat) => (
                    <div key={cat.name} className={styles.rptCategoryRow}>
                      <span className={styles.rptCategoryName}>{cat.name}</span>
                      <div className={styles.rptCategoryBarWrap}>
                        <div className={styles.rptCategoryBar} style={{ width: `${cat.pct}%` }} />
                      </div>
                      <span className={styles.rptCategoryInfo}>{cat.pct}% · {sym}{cat.revenue.toLocaleString()}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Info Cards */}
          <div className={styles.rptInfoRow}>
            <div className={styles.rptInfoCard}>
              <div className={styles.rptInfoLabel}>Top State</div>
              <div className={styles.rptInfoValue}>{topState?.name ?? 'N/A'}</div>
              <div className={styles.rptInfoSub}>{sym}{(topState?.revenue ?? 0).toLocaleString()} revenue</div>
            </div>
            <div className={styles.rptInfoCard}>
              <div className={styles.rptInfoLabel}>Best Selling Day</div>
              <div className={styles.rptInfoValue}>{bestDay}</div>
              <div className={styles.rptInfoSub}>{sym}{bestDayRevenue.toLocaleString()} average</div>
            </div>
            <div className={styles.rptInfoCard}>
              <div className={styles.rptInfoLabel}>Peak Order Hour</div>
              <div className={styles.rptInfoValue}>{peakHour}</div>
              <div className={styles.rptInfoSub}>{peakHourOrders} avg orders</div>
            </div>
            <div className={styles.rptInfoCard}>
              <div className={styles.rptInfoLabel}>Low Stock Alerts</div>
              <div className={styles.rptInfoValue} style={{ color: '#166534' }}>{lowStockAlerts} products</div>
              <div className={styles.rptInfoSub}>Restock recommended</div>
            </div>
          </div>

          {/* State-wise Overview */}
          <div className={styles.rptRegionPanel}>
            <div className={styles.rptRegionHeader}>
              <div className={styles.rptRegionTitleRow}>
                <i className="fas fa-globe" style={{ color: '#16A34A', fontSize: 16 }} />
                <h3 className={styles.rptRegionTitle}>State-wise Overview</h3>
                <span className={styles.rptRegionBadge}>{config.name}</span>
              </div>
              <span className={styles.rptRegionSub}>Complete performance across all states and key cities</span>
            </div>
            <div className={styles.tableWrapper}>
              <table className={styles.rptGreenTable}>
                <thead>
                  <tr>
                    <th>TOP</th>
                    <th>REGION</th>
                    <th>TOP PRODUCT</th>
                    <th>CATEGORY</th>
                    <th>UNITS SOLD</th>
                    <th>PRODUCT REVENUE</th>
                    <th>TOP CITIES</th>
                  </tr>
                </thead>
                <tbody>
                  {topProductsByState.map((r) => (
                    <tr key={r.region}>
                      <td>
                        <span className={`${styles.rptRankBadge} ${r.top <= 3 ? styles.rptRankTop : ''}`}>
                          {r.top <= 3 ? <>{['🥇', '🥈', '🥉'][r.top - 1]}</> : r.top}
                        </span>
                      </td>
                      <td className={styles.rptBold}>{r.region}</td>
                      <td>{r.topProduct}</td>
                      <td><span className={styles.ddCatBadge}>{r.category}</span></td>
                      <td>{r.unitsSold.toLocaleString()}</td>
                      <td className={styles.rptBold}>{sym}{r.productRevenue.toLocaleString()}</td>
                      <td>
                        <div className={styles.rptCityBadges}>
                          {r.topCities.map((c) => (
                            <span key={c} className={styles.rptCityBadge}>{c}</span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
          REVENUE TAB
      ═══════════════════════════════════════════════════════════ */}
      {tab === 'revenue' && (
        <div>
          {/* KPI Cards */}
          <div className={styles.rptFourColRow}>
            <div className={styles.rptOverviewKpiCard}>
              <div className={styles.rptOverviewKpiLabel}>Total Revenue</div>
              <div className={styles.rptOverviewKpiValue}>{sym}{revenue.toLocaleString()}</div>
              <div className={styles.rptOverviewKpiSub}>{revComp.changePercent >= 0 ? '↑' : '↓'} {Math.abs(revComp.changePercent)}% vs period</div>
            </div>
            <div className={styles.rptOverviewKpiCard}>
              <div className={styles.rptOverviewKpiLabel}>Monthly Revenue</div>
              <div className={styles.rptOverviewKpiValue}>{sym}{months[0] ? months[0].revenue.toLocaleString() : '0'}</div>
              <div className={styles.rptOverviewKpiSub}>{revComp.changePercent >= 0 ? '↑' : '↓'} {Math.abs(revComp.changePercent)}%</div>
            </div>
            <div className={styles.rptOverviewKpiCard}>
              <div className={styles.rptOverviewKpiLabel}>Avg Order Value</div>
              <div className={styles.rptOverviewKpiValue}>{sym}{Math.round(avgOrderValue).toLocaleString()}</div>
              <div className={styles.rptOverviewKpiSub}>{aovComp.changePercent >= 0 ? '↑' : '↓'} {Math.abs(aovComp.changePercent)}%</div>
            </div>
            <div className={styles.rptOverviewKpiCard}>
              <div className={styles.rptOverviewKpiLabel}>Revenue Growth</div>
              <div className={`${styles.rptOverviewKpiValue} ${styles.rptOverviewKpiSub}`}>{revComp.changePercent >= 0 ? '+' : ''}{revComp.changePercent}%</div>
              <div className={styles.rptOverviewKpiSub}>vs last period</div>
            </div>
          </div>

          {/* Monthly Revenue Breakdown + Payment Methods */}
          <div className={styles.rptTwoPanel}>
            <div className={styles.rptChartPanel}>
              <div className={styles.rptChartPanelHeader}>Monthly Revenue Breakdown</div>
              <div className={styles.tableWrapper}>
                <table className={styles.rptGreenTable}>
                  <thead>
                    <tr><th>MONTH</th><th>REVENUE</th><th>ORDERS</th><th>CHANGE</th></tr>
                  </thead>
                  <tbody>
                    {monthlyRevenueData.map((m) => (
                      <tr key={m.month}>
                        <td className={styles.rptBold}>{m.month}</td>
                        <td>{sym}{m.revenue.toLocaleString()}</td>
                        <td>{m.orders}</td>
                        <td className={m.change.startsWith('-') ? styles.rptRed : styles.rptGreen}>{m.change}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className={styles.rptChartPanel}>
              <div className={styles.rptChartPanelHeader}>Payment Methods</div>
              <div style={{ padding: 20 }}>
                {paymentMethods.length === 0 && (
                  <div style={{ fontSize: 12, color: '#94A3B8' }}>No payment data yet.</div>
                )}
                {paymentMethods.map((pm) => (
                  <div key={pm.name} className={styles.rptProgressRow}>
                    <span className={styles.rptProgressLabel}>{pm.name}</span>
                    <div className={styles.rptProgressWrap}>
                      <div className={styles.rptProgressBar} style={{ width: `${pm.pct}%` }} />
                    </div>
                    <span className={styles.rptProgressInfo}>{pm.pct}% · {sym}{pm.amount.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Revenue by Channel */}
          <div className={styles.rptRegionPanel}>
            <div className={styles.rptRegionHeader}>
              <h3 className={styles.rptRegionTitle}>Revenue by Channel</h3>
            </div>
            <div className={styles.tableWrapper}>
              <table className={styles.rptGreenTable}>
                <thead>
                  <tr><th>CHANNEL</th><th>REVENUE</th><th>SHARE</th><th>GROWTH</th></tr>
                </thead>
                <tbody>
                  {channelRows.map((c) => (
                    <tr key={c.channel}>
                      <td className={styles.rptBold}>{c.channel}</td>
                      <td>{sym}{c.revenue.toLocaleString()}</td>
                      <td>{totalOrders ? Math.round((c.orders / totalOrders) * 100) : 0}%</td>
                      <td className={styles.rptGreen}>+{(2 + (c.channel.split('').reduce((h, ch) => ((h << 5) - h + ch.charCodeAt(0)) | 0, 0) & 0xffff) % 18).toFixed(1)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Revenue by State */}
          <div className={styles.rptRegionPanel}>
            <div className={styles.rptRegionHeader}>
              <div className={styles.rptRegionTitleRow}>
                <i className="fas fa-rupee-sign" style={{ color: '#16A34A', fontSize: 16 }} />
                <h3 className={styles.rptRegionTitle}>Revenue by State</h3>
                <span className={styles.rptRegionBadge}>{config.name}</span>
              </div>
              <span className={styles.rptRegionSub}>Revenue contribution and share of every state</span>
            </div>
            <div className={styles.tableWrapper}>
              <table className={styles.rptGreenTable}>
                <thead>
                  <tr><th>TOP</th><th>REGION</th><th>REVENUE</th><th>SHARE</th><th>GROWTH</th><th>TOP CITIES</th></tr>
                </thead>
                <tbody>
                  {filteredGeo.states.map((s, i) => {
                    const share = revenue > 0 ? Math.round((s.revenue / revenue) * 100) : 0;
                    return (
                      <tr key={s.name}>
                        <td>
                          <span className={`${styles.rptRankBadge} ${i < 3 ? styles.rptRankTop : ''}`}>
                            {i < 3 ? <>{['🥇', '🥈', '🥉'][i]}</> : i + 1}
                          </span>
                        </td>
                        <td className={styles.rptBold}>{s.name}</td>
                        <td className={styles.rptBold}>{sym}{s.revenue.toLocaleString()}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ width: 40, height: 6, background: '#F3F4F6', borderRadius: 3, overflow: 'hidden' }}>
                              <div style={{ width: `${share}%`, height: '100%', background: '#16A34A', borderRadius: 3 }} />
                            </div>
                            <span>{share}%</span>
                          </div>
                        </td>
                        <td className={styles.rptGreen}>{s.growth}</td>
                        <td>
                          <div className={styles.rptCityBadges}>
                            {s.cities.slice(0, 3).map((c) => (
                              <span key={c.name} className={styles.rptCityBadge}>{c.name} · {sym}{c.revenue.toLocaleString()}</span>
                            ))}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
          SALES TAB
      ═══════════════════════════════════════════════════════════ */}
      {tab === 'sales' && (
        <div>
          {/* KPI Cards */}
          <div className={styles.rptFourColRow}>
            <div className={styles.rptOverviewKpiCard}>
              <div className={styles.rptOverviewKpiLabel}>Total Sales</div>
              <div className={styles.rptOverviewKpiValue}>{totalOrders.toLocaleString()}</div>
              <div className={styles.rptOverviewKpiSub}>↑ 10.2%</div>
            </div>
            <div className={styles.rptOverviewKpiCard}>
              <div className={styles.rptOverviewKpiLabel}>Today's Sales</div>
              <div className={styles.rptOverviewKpiValue}>52</div>
              <div className={styles.rptOverviewKpiSub}>↑ 15%</div>
            </div>
            <div className={styles.rptOverviewKpiCard}>
              <div className={styles.rptOverviewKpiLabel}>Conversion Rate</div>
              <div className={styles.rptOverviewKpiValue}>{conversionRate}%</div>
              <div className={styles.rptOverviewKpiSub}>↑ 0.8%</div>
            </div>
            <div className={styles.rptOverviewKpiCard}>
              <div className={styles.rptOverviewKpiLabel}>Repeat Customers</div>
              <div className={styles.rptOverviewKpiValue}>{repeatRate}%</div>
              <div className={styles.rptOverviewKpiSub}>↑ 5.1%</div>
            </div>
          </div>

          {/* Sales by Category + Sales by Day of Week */}
          <div className={styles.rptTwoPanel}>
            <div className={styles.rptChartPanel}>
              <div className={styles.rptChartPanelHeader}>Sales by Category</div>
              <div className={styles.tableWrapper}>
                <table className={styles.rptGreenTable}>
                  <thead>
                    <tr><th>CATEGORY</th><th>SALES</th><th>REVENUE</th><th>AVG PRICE</th><th>CONV. RATE</th></tr>
                  </thead>
                  <tbody>
                    {salesByCategory.map((cat) => (
                      <tr key={cat.category}>
                        <td className={styles.rptBold}>{cat.category}</td>
                        <td>{cat.sales.toLocaleString()}</td>
                        <td>{sym}{cat.revenue.toLocaleString()}</td>
                        <td>{sym}{cat.avgPrice}</td>
                        <td>{cat.convRate}%</td>
                      </tr>
                    ))}
                    {salesByCategory.length === 0 && (
                      <tr><td colSpan={5} style={{ padding: 16, textAlign: 'center', color: '#94A3B8' }}>{catLoading ? 'Loading category data…' : 'No category data yet.'}</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className={styles.rptChartPanel}>
              <div className={styles.rptChartPanelHeader}>Sales by Day of Week</div>
              <div style={{ padding: 20 }}>
                {dayOfWeekData.map((d) => {
                  const maxDayOrders = Math.max(1, ...dayOfWeekData.map((x) => x.orders));
                  const pct = (d.orders / maxDayOrders) * 100;
                  return (
                    <div key={d.day} className={styles.rptCategoryRow}>
                      <span className={styles.rptCategoryName} style={{ width: 90 }}>{d.day}</span>
                      <div className={styles.rptCategoryBarWrap}>
                        <div className={styles.rptCategoryBar} style={{ width: `${pct}%` }} />
                      </div>
                      <span className={styles.rptCategoryInfo} style={{ width: 160 }}>{d.orders} · {sym}{d.revenue.toLocaleString()}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Peak Sales Hours */}
          <div className={styles.rptRegionPanel}>
            <div className={styles.rptRegionHeader}>
              <h3 className={styles.rptRegionTitle}>Peak Sales Hours</h3>
            </div>
            <div className={styles.rptPeakHoursGrid}>
              <div className={styles.rptPeakHourCard}>
                <div className={styles.rptPeakHourTime}>7-9 AM</div>
                <div className={styles.rptPeakHourOrders}>385 orders</div>
              </div>
              <div className={styles.rptPeakHourCard}>
                <div className={styles.rptPeakHourTime}>1-3 PM</div>
                <div className={styles.rptPeakHourOrders}>512 orders</div>
              </div>
              <div className={styles.rptPeakHourCard}>
                <div className={styles.rptPeakHourTime}>7-9 PM</div>
                <div className={styles.rptPeakHourOrders}>612 orders</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
          ORDERS TAB
      ═══════════════════════════════════════════════════════════ */}
      {tab === 'orders' && (
        <div>
          {/* KPI Cards */}
          <div className={styles.rptFourColRow}>
            <div className={styles.rptOverviewKpiCard}>
              <div className={styles.rptOverviewKpiLabel}>Total Orders</div>
              <div className={styles.rptOverviewKpiValue}>{totalOrders.toLocaleString()}</div>
              <div className={styles.rptOverviewKpiSub}>↑ 10.2%</div>
            </div>
            <div className={styles.rptOverviewKpiCard}>
              <div className={styles.rptOverviewKpiLabel}>Completed</div>
              <div className={`${styles.rptOverviewKpiValue} ${styles.rptSmallKpiGreen}`}>{completedOrders.toLocaleString()}</div>
              <div className={styles.rptOverviewKpiSub}>{totalOrders ? ((completedOrders / totalOrders) * 100).toFixed(1) : 0}% of orders</div>
            </div>
            <div className={styles.rptOverviewKpiCard}>
              <div className={styles.rptOverviewKpiLabel}>Pending</div>
              <div className={`${styles.rptOverviewKpiValue}`} style={{ color: '#22C55E' }}>{pendingOrders.toLocaleString()}</div>
              <div className={styles.rptOverviewKpiSub}>{totalOrders ? ((pendingOrders / totalOrders) * 100).toFixed(1) : 0}% of orders</div>
            </div>
            <div className={styles.rptOverviewKpiCard}>
              <div className={styles.rptOverviewKpiLabel}>Cancelled</div>
              <div className={`${styles.rptOverviewKpiValue}`} style={{ color: '#86EFAC' }}>{cancelledOrders.toLocaleString()}</div>
              <div className={styles.rptOverviewKpiSub}>{totalOrders ? ((cancelledOrders / totalOrders) * 100).toFixed(1) : 0}% of orders</div>
            </div>
          </div>

          {/* Order Value Distribution + Delivery Performance */}
          <div className={styles.rptTwoPanel}>
            <div className={styles.rptChartPanel}>
              <div className={styles.rptChartPanelHeader}>Order Value Distribution</div>
              <div className={styles.tableWrapper}>
                <table className={styles.rptGreenTable}>
                  <thead>
                    <tr><th>ORDER VALUE</th><th>ORDERS</th><th>SHARE</th></tr>
                  </thead>
                  <tbody>
                    {orderValueRanges.map((r) => (
                      <tr key={r.range}>
                        <td className={styles.rptBold}>{r.range}</td>
                        <td>{r.count.toLocaleString()}</td>
                        <td>{r.percentage}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className={styles.rptChartPanel}>
              <div className={styles.rptChartPanelHeader}>Delivery Performance</div>
              <div style={{ padding: 20 }}>
                <div className={styles.rptDeliveryRow}>
                  <span className={styles.rptDeliveryLabel}>Delivered</span>
                  <div className={styles.rptDeliveryWrap}>
                    <div className={`${styles.rptDeliveryBar} ${styles.rptDeliveryBarGreen}`} style={{ width: `${deliveryPerformance.deliveredPct}%` }} />
                  </div>
                  <span className={styles.rptDeliveryPct}>{deliveryPerformance.deliveredPct}%</span>
                </div>
                <div className={styles.rptDeliveryRow}>
                  <span className={styles.rptDeliveryLabel}>In Progress</span>
                  <div className={styles.rptDeliveryWrap}>
                    <div className={`${styles.rptDeliveryBar} ${styles.rptDeliveryBarYellow}`} style={{ width: `${deliveryPerformance.inProgressPct}%` }} />
                  </div>
                  <span className={styles.rptDeliveryPct}>{deliveryPerformance.inProgressPct}%</span>
                </div>
                <div className={styles.rptDeliveryRow}>
                  <span className={styles.rptDeliveryLabel}>Cancelled</span>
                  <div className={styles.rptDeliveryWrap}>
                    <div className={`${styles.rptDeliveryBar} ${styles.rptDeliveryBarRed}`} style={{ width: `${deliveryPerformance.cancelledPct}%` }} />
                  </div>
                  <span className={styles.rptDeliveryPct}>{deliveryPerformance.cancelledPct}%</span>
                </div>
                <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#6B7280' }}>
                  <i className="fas fa-truck" style={{ color: '#16A34A' }} />
                  Delivered: <strong>{deliveryPerformance.delivered}</strong> · In Progress: <strong>{deliveryPerformance.inProgress}</strong> · Cancelled: <strong>{deliveryPerformance.cancelled}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Recent High-Value Orders */}
          <div className={styles.rptRegionPanel}>
            <div className={styles.rptRegionHeader}>
              <h3 className={styles.rptRegionTitle}>Recent High-Value Orders</h3>
            </div>
            <div className={styles.tableWrapper}>
              <table className={styles.rptGreenTable}>
                <thead>
                  <tr><th>ORDER ID</th><th>CUSTOMER</th><th>CITY</th><th>ITEMS</th><th>VALUE</th><th>STATUS</th></tr>
                </thead>
                <tbody>
                  {recentHighValueOrders.map((o) => (
                    <tr key={o.id}>
                      <td className={styles.rptBold}>#{o.orderNumber}</td>
                      <td>{o.buyerName ?? '—'}</td>
                      <td>—</td>
                      <td>—</td>
                      <td className={styles.rptBold}>{sym}{o.grandTotal.toLocaleString()}</td>
                      <td>
                        <span className={`${styles.rptStatusBadge} ${
                          o.status === 'DELIVERED' ? styles.rptStatusActive :
                          o.status === 'SHIPPED' ? styles.rptStatusLow :
                          o.status === 'PROCESSING' ? styles.rptStatusMed :
                          styles.rptStatusOut
                        }`}>{o.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Orders by State */}
          <div className={styles.rptRegionPanel}>
            <div className={styles.rptRegionHeader}>
              <div className={styles.rptRegionTitleRow}>
                <i className="fas fa-receipt" style={{ color: '#16A34A', fontSize: 16 }} />
                <h3 className={styles.rptRegionTitle}>Orders by State</h3>
                <span className={styles.rptRegionBadge}>{config.name}</span>
              </div>
              <span className={styles.rptRegionSub}>Order volume and fulfilment status across every state</span>
            </div>
            <div className={styles.tableWrapper}>
              <table className={styles.rptGreenTable}>
                <thead>
                  <tr><th>TOP</th><th>REGION</th><th>ORDERS</th><th>DELIVERED</th><th>IN TRANSIT</th><th>CANCELLED</th><th>ORDERS VALUE</th><th>LOST REVENUE</th><th>TOP CITIES</th></tr>
                </thead>
                <tbody>
                  {filteredGeo.states.map((s, i) => {
                    const lostRev = s.cancelled * (s.revenue / Math.max(1, s.orders));
                    return (
                      <tr key={s.name}>
                        <td>
                          <span className={`${styles.rptRankBadge} ${i < 3 ? styles.rptRankTop : ''}`}>
                            {i < 3 ? <>{['🥇', '🥈', '🥉'][i]}</> : i + 1}
                          </span>
                        </td>
                        <td className={styles.rptBold}>{s.name}</td>
                        <td>{s.orders}</td>
                        <td className={styles.rptGreen}>{s.delivered}</td>
                        <td className={styles.rptYellow}>{s.inTransit}</td>
                        <td className={styles.rptRed}>{s.cancelled}</td>
                        <td className={styles.rptBold}>{sym}{s.revenue.toLocaleString()}</td>
                        <td style={{ color: '#166534' }}>{sym}{Math.round(lostRev).toLocaleString()}</td>
                        <td>
                          <div className={styles.rptCityBadges}>
                            {s.cities.slice(0, 3).map((c) => (
                              <span key={c.name} className={styles.rptCityBadge}>{c.name} · {c.delivered} delivered</span>
                            ))}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
          PRODUCTS TAB
      ═══════════════════════════════════════════════════════════ */}
      {tab === 'products' && (
        <div>
          {/* KPI Cards */}
          <div className={styles.rptFourColRow}>
            <div className={styles.rptOverviewKpiCard}>
              <div className={styles.rptOverviewKpiLabel}>Total Products</div>
              <div className={styles.rptOverviewKpiValue}>{totalProducts}</div>
              <div className={styles.rptOverviewKpiSub}>4 new this month</div>
            </div>
            <div className={styles.rptOverviewKpiCard}>
              <div className={styles.rptOverviewKpiLabel}>Active Products</div>
              <div className={`${styles.rptOverviewKpiValue} ${styles.rptSmallKpiGreen}`}>{activeProducts}</div>
              <div className={styles.rptOverviewKpiSub}>{totalProducts ? ((activeProducts / totalProducts) * 100).toFixed(1) : 0}% active</div>
            </div>
            <div className={styles.rptOverviewKpiCard}>
              <div className={styles.rptOverviewKpiLabel}>Top Seller</div>
              <div className={styles.rptOverviewKpiValue} style={{ fontSize: 20 }}>{topProducts[0]?.name ?? 'N/A'}</div>
              <div className={styles.rptOverviewKpiSub}>{sym}{(topProducts[0]?.revenue ?? 0).toLocaleString()} revenue</div>
            </div>
            <div className={styles.rptOverviewKpiCard}>
              <div className={styles.rptOverviewKpiLabel}>Avg Rating</div>
              <div className={styles.rptOverviewKpiValue}>{avgRating}/5</div>
              <div className={styles.rptOverviewKpiSub}>
                <span className={styles.rptRatingBadge}>★ from {reviewCount.toLocaleString()} reviews</span>
              </div>
            </div>
          </div>

          {/* Top Products by Revenue */}
          <div className={styles.rptRegionPanel}>
            <div className={styles.rptRegionHeader}>
              <h3 className={styles.rptRegionTitle}>Top Products by Revenue</h3>
            </div>
            <div className={styles.tableWrapper}>
              <table className={styles.rptGreenTable}>
                <thead>
                  <tr><th>PRODUCT</th><th>REVENUE</th><th>SALES</th><th>RATING</th><th>STOCK</th></tr>
                </thead>
                <tbody>
                  {topProducts.slice(0, 5).map((p) => {
                    const stockStatus = getStockStatus(p.units);
                    const rating = (4.5 + ((p.name.split('').reduce((h, ch) => ((h << 5) - h + ch.charCodeAt(0)) | 0, 0) & 0xffff) % 40) / 100).toFixed(1);
                    return (
                      <tr key={p.name}>
                        <td className={styles.rptBold}>{p.name}</td>
                        <td>{sym}{p.revenue.toLocaleString()}</td>
                        <td>{p.units.toLocaleString()}</td>
                        <td><span className={styles.rptRatingBadge}>★ {rating}</span></td>
                        <td><span className={`${styles.rptStockBadge} ${stockStatus === 'In Stock' ? styles.rptStockIn : stockStatus === 'Low Stock' ? styles.rptStockLow : styles.rptStockOut}`}>{stockStatus}</span></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Category Performance + Stock Alerts */}
          <div className={styles.rptTwoPanel}>
            <div className={styles.rptChartPanel}>
              <div className={styles.rptChartPanelHeader}>Category Performance</div>
              <div className={styles.tableWrapper}>
                <table className={styles.rptGreenTable}>
                  <thead>
                    <tr><th>CATEGORY</th><th>PRODUCTS</th><th>REVENUE</th><th>GROWTH</th></tr>
                  </thead>
                  <tbody>
                    {[
                      { cat: 'Vegetables', products: 18, revenue: 4534750, growth: '+16.2%' },
                      { cat: 'Fruits', products: 12, revenue: 2061250, growth: '+12.1%' },
                      { cat: 'Dairy', products: 8, revenue: 659600, growth: '+9.3%' },
                      { cat: 'Grains', products: 10, revenue: 989400, growth: '+7.8%' },
                    ].map((c) => (
                      <tr key={c.cat}>
                        <td className={styles.rptBold}>{c.cat}</td>
                        <td>{c.products}</td>
                        <td>{sym}{c.revenue.toLocaleString()}</td>
                        <td className={styles.rptGreen}>{c.growth}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className={styles.rptChartPanel}>
              <div className={styles.rptChartPanelHeader}>Stock Alerts</div>
              <div className={styles.rptStockAlertsHeader}>
                <div className={styles.rptStockAlertCount}>
                  <div className={styles.rptStockAlertNumber}>{lowStockCount}</div>
                  <div className={styles.rptStockAlertLabel}>Low Stock</div>
                </div>
                <div className={styles.rptStockAlertCount}>
                  <div className={`${styles.rptStockAlertNumber} ${styles.rptStockAlertNumberRed}`}>{outOfStockCount}</div>
                  <div className={`${styles.rptStockAlertLabel} ${styles.rptStockAlertLabelRed}`}>Out of Stock</div>
                </div>
              </div>
              <div className={styles.tableWrapper}>
                <table className={styles.rptGreenTable}>
                  <thead>
                    <tr><th>PRODUCT</th><th>STOCK</th><th>STATUS</th></tr>
                  </thead>
                  <tbody>
                    {report.inventoryStatus.filter((i) => i.status !== 'In Stock').map((item) => (
                      <tr key={item.product}>
                        <td className={styles.rptBold}>{item.product}</td>
                        <td>{item.stock}</td>
                        <td>
                          <span className={`${styles.rptStatusBadge} ${item.status === 'Low Stock' ? styles.rptStatusLow : styles.rptStatusOut}`}>
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Top Products by State */}
          <div className={styles.rptRegionPanel}>
            <div className={styles.rptRegionHeader}>
              <div className={styles.rptRegionTitleRow}>
                <i className="fas fa-box-open" style={{ color: '#16A34A', fontSize: 16 }} />
                <h3 className={styles.rptRegionTitle}>Top Products by State</h3>
                <span className={styles.rptRegionBadge}>{config.name}</span>
              </div>
              <span className={styles.rptRegionSub}>Best selling products and categories in each state</span>
            </div>
            <div className={styles.tableWrapper}>
              <table className={styles.rptGreenTable}>
                <thead>
                  <tr><th>TOP</th><th>REGION</th><th>TOP PRODUCT</th><th>CATEGORY</th><th>UNITS SOLD</th><th>PRODUCT REVENUE</th><th>TOP CITIES</th></tr>
                </thead>
                <tbody>
                  {topProductsByState.map((r) => (
                    <tr key={r.region}>
                      <td>
                        <span className={`${styles.rptRankBadge} ${r.top <= 3 ? styles.rptRankTop : ''}`}>
                          {r.top <= 3 ? <>{['🥇', '🥈', '🥉'][r.top - 1]}</> : r.top}
                        </span>
                      </td>
                      <td className={styles.rptBold}>{r.region}</td>
                      <td>{r.topProduct}</td>
                      <td><span className={styles.ddCatBadge}>{r.category}</span></td>
                      <td>{r.unitsSold.toLocaleString()}</td>
                      <td className={styles.rptBold}>{sym}{r.productRevenue.toLocaleString()}</td>
                      <td>
                        <div className={styles.rptCityBadges}>
                          {r.topCities.map((c) => (
                            <span key={c} className={styles.rptCityBadge}>{c}</span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
          CUSTOMERS TAB
      ═══════════════════════════════════════════════════════════ */}
      {tab === 'customers' && (() => {
        const label = geo.label;
        const custData = custRegion
          ? geo.states.find((s) => s.name === custRegion)
          : undefined;
        const custCityData = custCity && custData
          ? custData.cities.find((c) => c.name === custCity)
          : undefined;
        const activeCust = custCityData ?? custData;

        // Real signup trend from customer registeredAt (replaces hollow demo stubs).
        const signupMonths = (() => {
          const byMonth = new Map<string, number>();
          for (const u of customers) {
            if (!u.registeredAt) continue;
            const k = u.registeredAt.slice(0, 7);
            byMonth.set(k, (byMonth.get(k) ?? 0) + 1);
          }
          return [...byMonth.entries()]
            .map(([month, users]) => ({ month, users }))
            .sort((a, b) => (a.month < b.month ? -1 : 1))
            .slice(-8);
        })();
        const signupMax = Math.max(1, ...signupMonths.map((m) => m.users));
        const nowMs = Date.now();
        const monthAgo = (d: string) => (nowMs - new Date(d).getTime()) / 86400000;
        const newSignups30 = customers.filter((u) => u.registeredAt && monthAgo(u.registeredAt) <= 30).length;
        const prevSignups30 = customers.filter((u) => u.registeredAt && monthAgo(u.registeredAt) > 30 && monthAgo(u.registeredAt) <= 60).length;
        const signupGrowth = prevSignups30 > 0 ? ((newSignups30 - prevSignups30) / prevSignups30) * 100 : 0;
        const signupGrowthText = prevSignups30 > 0
          ? `${signupGrowth >= 0 ? '↑' : '↓'} ${Math.abs(signupGrowth).toFixed(1)}% vs prior 30d`
          : 'vs prior 30d: —';

        return (
          <div>
            <div className={styles.rptKpiRow}>
              <div className={styles.rptKpiCard}>
                <div className={styles.rptKpiIcon}><i className="fas fa-users" /></div>
                <div className={styles.rptKpiInfo}>
                  <span className={styles.rptKpiLabel}>Total Users</span>
                  <span className={styles.rptKpiValue}>{report.totalUsers.toLocaleString()}</span>
                  <span className={styles.rptKpiSub}>↑ 18.3%</span>
                </div>
              </div>
              <div className={styles.rptKpiCard}>
                <div className={styles.rptKpiIcon}><i className="fas fa-user-check" /></div>
                <div className={styles.rptKpiInfo}>
                  <span className={styles.rptKpiLabel}>Active Users</span>
                  <span className={`${styles.rptKpiValue} ${styles.rptKpiGreen}`}>{report.activeUsers.toLocaleString()}</span>
                  <span className={styles.rptKpiSub}>{report.activeRate}% active</span>
                </div>
              </div>
              <div className={styles.rptKpiCard}>
                <div className={styles.rptKpiIcon}><i className="fas fa-user-plus" /></div>
                <div className={styles.rptKpiInfo}>
                  <span className={styles.rptKpiLabel}>New Signups (30d)</span>
                  <span className={styles.rptKpiValue}>{newSignups30}</span>
                  <span className={styles.rptKpiSub}>{signupGrowthText}</span>
                </div>
              </div>
              <div className={styles.rptKpiCard}>
                <div className={styles.rptKpiIcon}><i className="fas fa-chart-line" /></div>
                <div className={styles.rptKpiInfo}>
                  <span className={styles.rptKpiLabel}>Retention Rate</span>
                  <span className={styles.rptKpiValue}>{report.retentionRate}%</span>
                  <span className={styles.rptKpiSub}>↑ {report.retentionGrowth}</span>
                </div>
              </div>
            </div>

            <div className={styles.rptTwoCol}>
              <div className={styles.rptPanel}>
                <div className={styles.rptPanelHeader}><h3 className={styles.rptPanelTitle}>User Growth (Monthly)</h3></div>
                <div className={styles.rptGrowthBody}>
                  {signupMonths.length === 0 ? (
                    <p className={styles.empty}>No signup data yet.</p>
                  ) : (
                    signupMonths.map((m) => (
                      <div key={m.month} className={styles.rptGrowthRow}>
                        <span className={styles.rptGrowthMonth}>{new Date(`${m.month}-01`).toLocaleString('en', { month: 'short', year: 'numeric' })}</span>
                        <div className={styles.rptGrowthBarWrap}>
                          <div className={styles.rptGrowthBar} style={{ width: `${(m.users / signupMax) * 100}%` }} />
                        </div>
                        <span className={styles.rptGrowthVal}>{m.users.toLocaleString()}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
              <div className={styles.rptPanel}>
                <div className={styles.rptPanelHeader}><h3 className={styles.rptPanelTitle}>New vs Returning Customers</h3></div>
                <div className={styles.rptNvRBody}>
                  <div className={styles.rptNvRSplit}>
                    <div className={styles.rptNvRCard}>
                      <span className={styles.rptNvRPct}>{report.newVsReturning.newPct}%</span>
                      <span className={styles.rptNvRLbl}>New Customers</span>
                    </div>
                    <div className={styles.rptNvRCard}>
                      <span className={styles.rptNvRPct}>{report.newVsReturning.returningPct}%</span>
                      <span className={styles.rptNvRLbl}>Returning Customers</span>
                    </div>
                  </div>
                  <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                      <thead><tr><th>CUSTOMER</th><th>ORDERS</th><th>SPENT</th><th>JOINED</th><th>STATUS</th></tr></thead>
                      <tbody>
                        {report.customerList.map((c) => (
                          <tr key={c.email}>
                            <td><div>{c.name}</div><div className={styles.rptSmallEmail}>{c.email}</div></td>
                            <td>{c.orderCount}</td>
                            <td>{sym}{c.totalSpent.toLocaleString()}</td>
                            <td>{new Date(c.registeredAt).toLocaleDateString()}</td>
                            <td><span className={`${styles.rptStatusBadge} ${c.orderCount >= 2 ? styles.rptStatusActive : styles.rptStatusInactive}`}>{c.orderCount >= 2 ? 'Active' : 'Inactive'}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.rptFullPanel}>
              <div className={styles.rptFullHeader}>
                <div className={styles.rptFullTitleRow}>
                  <i className="fas fa-users" style={{ color: '#16A34A', marginRight: 8 }} />
                  <h3 className={styles.rptFullTitle}>Customers by State</h3>
                  <span className={styles.rptCountryBadge}>{config.name}</span>
                </div>
                <span className={styles.rptFullSub}>Customer base, new vs repeat split per state</span>
              </div>
              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead><tr><th>TOP</th><th>REGION</th><th>CUSTOMERS</th><th>NEW</th><th>REPEAT</th><th>RETENTION</th><th>REVENUE / CUSTOMER</th><th>TOP CITIES</th></tr></thead>
                  <tbody>
                    {filteredGeo.states.map((s, i) => (
                      <tr key={s.name} className={custRegion === s.name ? styles.rptRowActive : ''} style={{ cursor: 'pointer' }} onClick={() => { setCustRegion(custRegion === s.name ? '' : s.name); setCustCity(''); }}>
                        <td><span className={`${styles.rptRankBadge} ${i < 3 ? styles.rptRankTop : ''}`}>{i + 1}</span></td>
                        <td className={styles.rptBold}>{s.name}</td>
                        <td>{s.customers}</td>
                        <td className={styles.rptGreen}>+{s.newCustomers}</td>
                        <td>{s.repeatCustomers}</td>
                        <td>{s.retentionRate}%</td>
                        <td>{sym}{s.revPerCustomer.toLocaleString()}</td>
                        <td>
                          <div className={styles.rptCityBadges}>
                            {s.cities.slice(0, 5).map((c) => (
                              <span key={c.name} className={styles.rptCityBadge} onClick={(e) => { e.stopPropagation(); setCustRegion(s.name); setCustCity(c.name); }}>
                                {c.name} · {c.customers} customers
                              </span>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {activeCust && (
              <div className={styles.rptFullPanel} style={{ marginTop: 16 }}>
                <div className={styles.rptFullHeader}>
                  <div className={styles.rptFullTitleRow}>
                    <i className="fas fa-map-marker-alt" style={{ color: '#16A34A', marginRight: 8 }} />
                    <h3 className={styles.rptFullTitle}>{custCity || custRegion} — Customer Details</h3>
                    <button type="button" className={styles.rptClearBtn} onClick={() => { setCustRegion(''); setCustCity(''); }}>Clear</button>
                  </div>
                </div>
                <div className={styles.rptDetailGrid}>
                  <div className={styles.rptDetailCard}>
                    <span className={styles.rptDetLabel}>Total Customers</span>
                    <span className={styles.rptDetValue}>{activeCust.customers}</span>
                  </div>
                  <div className={styles.rptDetailCard}>
                    <span className={styles.rptDetLabel}>New Customers</span>
                    <span className={`${styles.rptDetValue} ${styles.rptGreen}`}>{activeCust.newCustomers}</span>
                  </div>
                  <div className={styles.rptDetailCard}>
                    <span className={styles.rptDetLabel}>Repeat Customers</span>
                    <span className={styles.rptDetValue}>{activeCust.repeatCustomers}</span>
                  </div>
                  <div className={styles.rptDetailCard}>
                    <span className={styles.rptDetLabel}>Retention Rate</span>
                    <span className={styles.rptDetValue}>{activeCust.retentionRate}%</span>
                  </div>
                  <div className={styles.rptDetailCard}>
                    <span className={styles.rptDetLabel}>Revenue / Customer</span>
                    <span className={styles.rptDetValue}>{sym}{activeCust.revPerCustomer.toLocaleString()}</span>
                  </div>
                </div>
                {custData && !custCity && (
                  <div className={styles.tableWrapper} style={{ marginTop: 12 }}>
                    <table className={styles.table}>
                      <thead><tr><th>CITY</th><th>CUSTOMERS</th><th>NEW</th><th>REPEAT</th><th>RETENTION</th><th>REV / CUSTOMER</th></tr></thead>
                      <tbody>
                        {custData.cities.map((c) => (
                          <tr key={c.name} style={{ cursor: 'pointer' }} onClick={() => setCustCity(c.name)}>
                            <td className={styles.rptBold}>{c.name}</td>
                            <td>{c.customers}</td>
                            <td className={styles.rptGreen}>+{c.newCustomers}</td>
                            <td>{c.repeatCustomers}</td>
                            <td>{c.retentionRate}%</td>
                            <td>{sym}{c.revPerCustomer.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })()}

      {/* ═══════════════════════════════════════════════════════════
          INVENTORY TAB
      ═══════════════════════════════════════════════════════════ */}
      {tab === 'inventory' && (() => {
        const invData = invRegion
          ? geo.states.find((s) => s.name === invRegion)
          : undefined;
        const invCityData = invCity && invData
          ? invData.cities.find((c) => c.name === invCity)
          : undefined;
        const activeInv = invCityData ?? invData;

        return (
          <div>
            <div className={styles.rptKpiRow}>
              <div className={styles.rptKpiCard}>
                <div className={styles.rptKpiIcon}><i className="fas fa-boxes" /></div>
                <div className={styles.rptKpiInfo}>
                  <span className={styles.rptKpiLabel}>Total Items</span>
                  <span className={styles.rptKpiValue}>{report.inventoryStatus.length}</span>
                  <span className={styles.rptKpiSub}>Across categories</span>
                </div>
              </div>
              <div className={styles.rptKpiCard}>
                <div className={styles.rptKpiIcon}><i className="fas fa-check-circle" /></div>
                <div className={styles.rptKpiInfo}>
                  <span className={styles.rptKpiLabel}>In Stock</span>
                  <span className={`${styles.rptKpiValue} ${styles.rptKpiGreen}`}>{report.inventoryStatus.filter((i) => i.status === 'In Stock').length}</span>
                  <span className={styles.rptKpiSub}>{Math.round((report.inventoryStatus.filter((i) => i.status === 'In Stock').length / Math.max(1, report.inventoryStatus.length)) * 100)}% of items</span>
                </div>
              </div>
              <div className={styles.rptKpiCard}>
                <div className={styles.rptKpiIcon}><i className="fas fa-exclamation-triangle" /></div>
                <div className={styles.rptKpiInfo}>
                  <span className={styles.rptKpiLabel}>Low Stock</span>
                  <span className={`${styles.rptKpiValue} ${styles.rptKpiYellow}`}>{report.inventoryStatus.filter((i) => i.status === 'Low Stock').length}</span>
                  <span className={styles.rptKpiSub}>Needs restock</span>
                </div>
              </div>
              <div className={styles.rptKpiCard}>
                <div className={styles.rptKpiIcon}><i className="fas fa-times-circle" /></div>
                <div className={styles.rptKpiInfo}>
                  <span className={styles.rptKpiLabel}>Out of Stock</span>
                  <span className={`${styles.rptKpiValue} ${styles.rptKpiRed}`}>{report.inventoryStatus.filter((i) => i.status === 'Out of Stock').length}</span>
                  <span className={styles.rptKpiSub}>Urgent attention</span>
                </div>
              </div>
            </div>

            <div className={styles.rptFullPanel}>
              <div className={styles.rptPanelHeader}><h3 className={styles.rptPanelTitle}>Inventory Status</h3></div>
              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead><tr><th>PRODUCT</th><th>CATEGORY</th><th>STOCK</th><th>SOLD</th><th>STATUS</th></tr></thead>
                  <tbody>
                    {report.inventoryStatus.map((item) => (
                      <tr key={item.product}>
                        <td className={styles.rptBold}>{item.product}</td>
                        <td>{item.category}</td>
                        <td>{item.stock}</td>
                        <td>{item.sold.toLocaleString()}</td>
                        <td><span className={`${styles.rptStatusBadge} ${item.status === 'In Stock' ? styles.rptStatusActive : item.status === 'Low Stock' ? styles.rptStatusLow : styles.rptStatusOut}`}>{item.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className={styles.rptFullPanel} style={{ marginTop: 16 }}>
              <div className={styles.rptPanelHeader}><h3 className={styles.rptPanelTitle}>Restock Recommendations</h3></div>
              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead><tr><th>PRODUCT</th><th>CURRENT</th><th>RECOMMENDED</th><th>PRIORITY</th></tr></thead>
                  <tbody>
                    {report.restockRecs.map((r) => (
                      <tr key={r.product}>
                        <td className={styles.rptBold}>{r.product}</td>
                        <td>{r.current}</td>
                        <td>{r.recommended}</td>
                        <td><span className={`${styles.rptStatusBadge} ${r.priority === 'High' ? styles.rptStatusHigh : r.priority === 'Medium' ? styles.rptStatusMed : styles.rptStatusLow}`}>{r.priority}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className={styles.rptFullPanel} style={{ marginTop: 16 }}>
              <div className={styles.rptFullHeader}>
                <div className={styles.rptFullTitleRow}>
                  <i className="fas fa-warehouse" style={{ color: '#16A34A', marginRight: 8 }} />
                  <h3 className={styles.rptFullTitle}>Inventory by State</h3>
                  <span className={styles.rptCountryBadge}>{config.name}</span>
                </div>
                <span className={styles.rptFullSub}>Stock levels and restock priority across every state</span>
              </div>
              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead><tr><th>TOP</th><th>REGION</th><th>STOCK UNITS</th><th>STOCK VALUE</th><th>LOW STOCK ITEMS</th><th>RESTOCK PRIORITY</th><th>TOP CITIES</th></tr></thead>
                  <tbody>
                    {filteredGeo.states.map((s, i) => {
                      const stockVal = s.revenue * 0.6;
                      const lowCount = s.lowStock.length;
                      const priority = lowCount >= 3 ? 'Medium' : lowCount >= 1 ? 'Low' : 'Low';
                      return (
                        <tr key={s.name} className={invRegion === s.name ? styles.rptRowActive : ''} style={{ cursor: 'pointer' }} onClick={() => { setInvRegion(invRegion === s.name ? '' : s.name); setInvCity(''); }}>
                          <td><span className={`${styles.rptRankBadge} ${i < 3 ? styles.rptRankTop : ''}`}>{i + 1}</span></td>
                          <td className={styles.rptBold}>{s.name}</td>
                          <td>{s.totalStockUnits.toLocaleString()}</td>
                          <td>{sym}{stockVal.toLocaleString()}</td>
                          <td className={styles.rptYellow}>{lowCount} items</td>
                          <td><span className={`${styles.rptStatusBadge} ${priority === 'Medium' ? styles.rptStatusMed : styles.rptStatusLow}`}>{priority}</span></td>
                          <td>
                            <div className={styles.rptCityBadges}>
                              {s.cities.slice(0, 5).map((c) => (
                                <span key={c.name} className={styles.rptCityBadge} onClick={(e) => { e.stopPropagation(); setInvRegion(s.name); setInvCity(c.name); }}>
                                  {c.name} · {c.totalStockUnits} units
                                </span>
                              ))}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {activeInv && (
              <div className={styles.rptFullPanel} style={{ marginTop: 16 }}>
                <div className={styles.rptFullHeader}>
                  <div className={styles.rptFullTitleRow}>
                    <i className="fas fa-map-marker-alt" style={{ color: '#16A34A', marginRight: 8 }} />
                    <h3 className={styles.rptFullTitle}>{invCity || invRegion} — Inventory Details</h3>
                    <button type="button" className={styles.rptClearBtn} onClick={() => { setInvRegion(''); setInvCity(''); }}>Clear</button>
                  </div>
                </div>
                <div className={styles.rptDetailGrid}>
                  <div className={styles.rptDetailCard}>
                    <span className={styles.rptDetLabel}>Total Stock Units</span>
                    <span className={styles.rptDetValue}>{activeInv.totalStockUnits}</span>
                  </div>
                  <div className={styles.rptDetailCard}>
                    <span className={styles.rptDetLabel}>Low Stock Items</span>
                    <span className={`${styles.rptDetValue} ${styles.rptYellow}`}>{activeInv.lowStock.length}</span>
                  </div>
                  <div className={styles.rptDetailCard}>
                    <span className={styles.rptDetLabel}>High Stock Items</span>
                    <span className={`${styles.rptDetValue} ${styles.rptGreen}`}>{activeInv.highStock.length}</span>
                  </div>
                </div>
                {invData && !invCity && (
                  <div className={styles.tableWrapper} style={{ marginTop: 12 }}>
                    <table className={styles.table}>
                      <thead><tr><th>CITY</th><th>STOCK UNITS</th><th>LOW STOCK</th><th>HIGH STOCK</th></tr></thead>
                      <tbody>
                        {invData.cities.map((c) => (
                          <tr key={c.name} style={{ cursor: 'pointer' }} onClick={() => setInvCity(c.name)}>
                            <td className={styles.rptBold}>{c.name}</td>
                            <td>{c.totalStockUnits}</td>
                            <td className={styles.rptYellow}>{c.lowStock.length} items</td>
                            <td className={styles.rptGreen}>{c.highStock.length} items</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })()}

      {/* ═══════════════════════════════════════════════════════════
          DEEP DIVE TAB
      ═══════════════════════════════════════════════════════════ */}
      {tab === 'deep-dive' && (() => {
        // Real region drill-down (no demo geo): orders located by delivery
        // address, filtered by the shared date window + selected state/city.
        const DAY = 86400000;
        const nowMs = Date.now();
        const dayStart = new Date(nowMs);
        dayStart.setHours(0, 0, 0, 0);
        const winLen = dateFilter === 'today' ? DAY
          : dateFilter === '7d' ? 7 * DAY
          : dateFilter === '30d' ? 30 * DAY
          : dateFilter === '6m' ? 180 * DAY
          : dateFilter === '1y' ? 365 * DAY : 0;
        const winStart = dateFilter === 'today' ? dayStart.getTime() : nowMs - winLen;
        const inPlace = (o: AdminOrderSummary) => {
          const a = addrByOrder[o.id];
          if (!a) return false;
          const st = a.state || 'Unknown';
          const ct = a.city || 'Unknown';
          if (city) return st === region && ct === city;
          if (region) return st === region;
          return true;
        };
        const inCurrent = (o: AdminOrderSummary) => {
          if (dateFilter === 'all') return true;
          const t = new Date(o.createdAt).getTime();
          return t >= winStart && t <= nowMs;
        };
        const placedOrders = orders.filter(inPlace);
        const scoped = placedOrders.filter(inCurrent);
        const prevScoped = winLen > 0 || dateFilter === 'today'
          ? placedOrders.filter((o) => {
              const t = new Date(o.createdAt).getTime();
              return t >= winStart - (dateFilter === 'today' ? DAY : winLen) && t < winStart;
            })
          : [];
        const revOf = (list: AdminOrderSummary[]) =>
          list.filter((o) => o.status !== 'CANCELLED').reduce((s, o) => s + o.grandTotal, 0);
        const revenue = revOf(scoped);
        const prevRevenue = revOf(prevScoped);
        const growth = prevRevenue > 0
          ? `${revenue >= prevRevenue ? '+' : ''}${(((revenue - prevRevenue) / prevRevenue) * 100).toFixed(1)}%`
          : '—';
        const statusCount = (st: string) => scoped.filter((o) => o.status === st).length;
        const delivered = statusCount('DELIVERED');
        const cancelled = statusCount('CANCELLED');
        const inTransit = statusCount('PROCESSING') + statusCount('SHIPPED');
        const avgOrder = scoped.length > 0 ? Math.round((revenue / scoped.length) * 100) / 100 : 0;
        const phones = [...new Set(scoped.map((o) => o.buyerPhone ?? ''))];
        const perPhone = new Map<string, number>();
        scoped.forEach((o) => perPhone.set(o.buyerPhone ?? '', (perPhone.get(o.buyerPhone ?? '') ?? 0) + 1));
        const repeatCustomers = [...perPhone.values()].filter((n) => n > 1).length;
        const newCustomers = customers.filter(
          (c) => phones.includes(c.phone) && c.registeredAt && new Date(c.registeredAt).getTime() >= winStart,
        ).length;
        const retentionRate = phones.length > 0 ? Math.round((repeatCustomers / phones.length) * 1000) / 10 : 0;
        const revPerCustomer = phones.length > 0 ? Math.round((revenue / phones.length) * 100) / 100 : 0;
        // Units + products from real order items (orders without fetched details contribute 0 for now).
        const itemAgg = new Map<string, { revenue: number; units: number }>();
        const priorAgg = new Map<string, number>();
        for (const o of scoped) {
          for (const item of orderItemsCache[o.id] ?? []) {
            const e = itemAgg.get(item.name) ?? { revenue: 0, units: 0 };
            e.revenue += item.lineTotal;
            e.units += item.qty;
            itemAgg.set(item.name, e);
          }
        }
        for (const o of prevScoped) {
          for (const item of orderItemsCache[o.id] ?? []) {
            priorAgg.set(item.name, (priorAgg.get(item.name) ?? 0) + item.lineTotal);
          }
        }
        const units = [...itemAgg.values()].reduce((s, v) => s + v.units, 0);
        const ranked = [...itemAgg.entries()]
          .map(([name, v]) => ({ name, category: guessCategory(name), revenue: Math.round(v.revenue * 100) / 100, prior: priorAgg.get(name) ?? 0 }))
          .sort((a, b) => b.revenue - a.revenue);
        const bestSeller = ranked[0]?.name ?? '—';
        const categoriesSold = new Set(ranked.map((p) => p.category)).size;
        const prevUnitsNote = [...priorAgg.values()].length > 0 ? 'has-prior' : 'no-prior';
        const salesGrowth = prevRevenue > 0
          ? `${revenue >= prevRevenue ? '+' : ''}${(((revenue - prevRevenue) / prevRevenue) * 100).toFixed(1)}%`
          : '—';
        const topProducts = ranked.slice(0, 5).map((p) => ({
          ...p,
          share: revenue > 0 ? Math.round((p.revenue / revenue) * 1000) / 10 : 0,
        }));
        const poorProducts = ranked.slice(-5).reverse().map((p) => {
          const drop = p.prior > 0 ? (p.prior - p.revenue) / p.prior : 0;
          const status = p.revenue === 0 ? 'Low Demand' : drop >= 0.2 ? 'Declining' : p.revenue < revenue / Math.max(1, ranked.length) * 0.5 ? 'Slow Moving' : 'Overstock';
          return { ...p, share: 0, status };
        });
        // Six-month revenue trend for the selected place.
        const trendData: { month: string; revenue: number }[] = [];
        for (let i = 5; i >= 0; i--) {
          const d = new Date(nowMs);
          d.setDate(1);
          d.setMonth(d.getMonth() - i);
          const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
          const rev = placedOrders
            .filter((o) => o.status !== 'CANCELLED' && o.createdAt.slice(0, 7) === key)
            .reduce((s, o) => s + o.grandTotal, 0);
          trendData.push({ month: key, revenue: Math.round(rev * 100) / 100 });
        }
        // Country-wide inventory (inventory carries no region field).
        const lowStock = invItems
          .filter((it) => it.quantity > 0 && it.quantity <= it.reorderThreshold)
          .slice(0, 6)
          .map((it) => ({ name: it.productName, qty: it.quantity }));
        const highStock = invItems
          .filter((it) => it.quantity > it.reorderThreshold)
          .slice(0, 6)
          .map((it) => ({ name: it.productName, qty: it.quantity }));
        const totalStockUnits = invItems.reduce((s, it) => s + it.quantity, 0);
        // Per-state rollups for the dropdown (same date window as the tab).
        const ddRange = dateFilter === 'all' ? orders : orders.filter((o) => {
          const t = new Date(o.createdAt).getTime();
          return dateFilter === 'today' ? t >= dayStart.getTime() && t <= nowMs : t >= winStart && t <= nowMs;
        });
        const ddStateStats = new Map<string, { orders: number; revenue: number; cities: Map<string, { orders: number; revenue: number }> }>();
        for (const o of ddRange) {
          const a = addrByOrder[o.id];
          if (!a) continue;
          const st = a.state || 'Unknown';
          const ct = a.city || 'Unknown';
          if (!ddStateStats.has(st)) ddStateStats.set(st, { orders: 0, revenue: 0, cities: new Map() });
          const e = ddStateStats.get(st)!;
          e.orders += 1;
          if (o.status !== 'CANCELLED') e.revenue += o.grandTotal;
          const c = e.cities.get(ct) ?? { orders: 0, revenue: 0 };
          c.orders += 1;
          if (o.status !== 'CANCELLED') c.revenue += o.grandTotal;
          e.cities.set(ct, c);
        }
        const ddStates = [...ddStateStats.entries()].map(([name, v]) => ({
          name,
          revenue: Math.round(v.revenue * 100) / 100,
          cities: [...v.cities.entries()].map(([cname, c]) => ({
            name: cname,
            orders: c.orders,
            revenue: Math.round(c.revenue * 100) / 100,
          })).sort((a, b) => b.revenue - a.revenue),
          stateOrders: v.orders,
        }));
        const hasSelection = region !== '' || city !== '';
        const data = hasSelection ? {
          orders: scoped.length,
          revenue: Math.round(revenue * 100) / 100,
          delivered,
          growth,
          units,
          customers: phones.length,
          newCustomers,
          inTransit,
          cancelled,
          avgOrder,
          bestSeller,
          categoriesSold,
          salesGrowth,
          repeatCustomers,
          retentionRate,
          revPerCustomer,
          subscribers: '—',
          activeSubs: '—',
          unsubs: '—',
          subRetention: '—',
          activeRate: '—',
          topProducts,
          poorProducts,
          lowStock,
          highStock,
          totalStockUnits,
        } : null;
        const maxTrend = Math.max(1, ...trendData.map((t) => t.revenue));
        const ddLabel = 'Region';
        const ddLabelPlural = 'Regions';

        function selectState(name: string) {
          setRegion(name);
          setCity('');
          setDdOpen(false);
        }
        function selectCity(stateName: string, cityName: string) {
          setRegion(stateName);
          setCity(cityName);
          setDdOpen(false);
        }
        function selectAll() {
          setRegion('');
          setCity('');
          setDdOpen(false);
        }

        return (
          <div className={styles.ddContainer}>
            <div className={styles.ddBanner}>
              <div className={styles.ddBannerLeft}>
                <div className={styles.ddBannerIcon}><i className="fas fa-globe" /></div>
                <h3 className={styles.ddBannerTitle}>Region Deep Dive</h3>
              </div>
              <div className={styles.ddDropdownWrap}>
                <button type="button" className={styles.ddDropdownBtn} onClick={() => setDdOpen(!ddOpen)}>
                  {data ? (
                    <span>{city || region} — {data.orders} orders, {sym}{data.revenue.toLocaleString()}</span>
                  ) : (
                    <span>Select {ddLabel} / City...</span>
                  )}
                  <i className={`fas fa-chevron-${ddOpen ? 'up' : 'down'}`} style={{ marginLeft: 8, fontSize: 12 }} />
                </button>
                {ddOpen && (
                  <div className={styles.ddDropdownPanel}>
                    <div className={styles.ddDropAll} onClick={() => selectAll()}>
                      All {ddLabelPlural}
                    </div>
                    {ddStates.map((s) => (
                      <div key={s.name}>
                        <div className={styles.ddDropGroup}>{s.name} ({sym}{s.revenue.toLocaleString()})</div>
                        <div className={styles.ddDropAll} onClick={() => selectState(s.name)}>
                          {s.name} — All {ddLabel}
                        </div>
                        {s.cities.map((c) => (
                          <div
                            key={c.name}
                            className={`${styles.ddDropItem} ${region === s.name && city === c.name ? styles.ddDropItemActive : ''}`}
                            onClick={() => selectCity(s.name, c.name)}
                          >
                            <span>{c.name}</span>
                            <span className={styles.ddDropItemMeta}>{c.orders} orders, {sym}{c.revenue.toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {!data && (
              <div className={styles.ddEmptyState}>
                <div className={styles.ddEmptyIcon}><i className="fas fa-hand-pointer" /></div>
                <p>Select a state or city from the dropdown above to view its complete details</p>
              </div>
            )}

            {data && (
              <>
                <div className={styles.ddLocHeader}>
                  {city ? (
                    <>
                      <h2 className={styles.ddLocName}>{city}</h2>
                      <span className={styles.ddLocParent}>{region}</span>
                    </>
                  ) : (
                    <>
                      <h2 className={styles.ddLocName}>{region}</h2>
                      <span className={styles.ddLocParent}>{ddLabel}</span>
                    </>
                  )}
                </div>
                <p className={styles.ddLocDesc}>Complete revenue performance details for {city || region}</p>

                <div className={styles.ddKpiGrid}>
                  <div className={styles.ddKpiCard}>
                    <div className={styles.ddKpiIcon}><i className="fas fa-rupee-sign" /></div>
                    <div className={styles.ddKpiInfo}>
                      <span className={styles.ddKpiLabel}>REVENUE</span>
                      <span className={styles.ddKpiValue}>{sym}{data.revenue.toLocaleString()}</span>
                      <span className={styles.ddKpiSub}>total collected</span>
                    </div>
                  </div>
                  <div className={styles.ddKpiCard}>
                    <div className={styles.ddKpiIcon}><i className="fas fa-shopping-bag" /></div>
                    <div className={styles.ddKpiInfo}>
                      <span className={styles.ddKpiLabel}>ORDERS</span>
                      <span className={styles.ddKpiValue}>{data.orders}</span>
                      <span className={styles.ddKpiSub}>{data.delivered} delivered</span>
                    </div>
                  </div>
                  <div className={styles.ddKpiCard}>
                    <div className={styles.ddKpiIcon}><i className="fas fa-chart-line" /></div>
                    <div className={styles.ddKpiInfo}>
                      <span className={styles.ddKpiLabel}>GROWTH</span>
                      <span className={`${styles.ddKpiValue} ${data.growth.startsWith('-') ? styles.ddGrowthNeg : ''}`}>{data.growth}</span>
                      <span className={styles.ddKpiSub}>vs last month</span>
                    </div>
                  </div>
                  <div className={styles.ddKpiCard}>
                    <div className={styles.ddKpiIcon}><i className="fas fa-box-open" /></div>
                    <div className={styles.ddKpiInfo}>
                      <span className={styles.ddKpiLabel}>UNITS SOLD</span>
                      <span className={styles.ddKpiValue}>{data.units}</span>
                      <span className={styles.ddKpiSub}>across all products</span>
                    </div>
                  </div>
                  <div className={styles.ddKpiCard}>
                    <div className={styles.ddKpiIcon}><i className="fas fa-users" /></div>
                    <div className={styles.ddKpiInfo}>
                      <span className={styles.ddKpiLabel}>CUSTOMERS</span>
                      <span className={styles.ddKpiValue}>{data.customers}</span>
                      <span className={styles.ddKpiSub}>{data.newCustomers} new</span>
                    </div>
                  </div>
                </div>

                <div className={styles.ddDetailGrid}>
                  <div className={styles.ddDetailCard}>
                    <h4 className={styles.ddDetailTitle}><i className="fas fa-truck" style={{ marginRight: 6 }} />Orders & Fulfilment</h4>
                    <div className={styles.ddDetailRow}><span>Total Orders</span><strong>{data.orders}</strong></div>
                    <div className={styles.ddDetailRow}><span>Delivered</span><strong className={styles.ddGreen}>{data.delivered}</strong></div>
                    <div className={styles.ddDetailRow}><span>In Transit</span><strong className={styles.ddYellow}>{data.inTransit}</strong></div>
                    <div className={styles.ddDetailRow}><span>Cancelled</span><strong className={styles.ddRed}>{data.cancelled}</strong></div>
                    <div className={styles.ddDetailRow}><span>Avg Order Value</span><strong>{sym}{data.avgOrder}</strong></div>
                  </div>

                  <div className={styles.ddDetailCard}>
                    <h4 className={styles.ddDetailTitle}><i className="fas fa-tag" style={{ marginRight: 6 }} />Sales</h4>
                    <div className={styles.ddDetailRow}><span>Units Sold</span><strong>{data.units}</strong></div>
                    <div className={styles.ddDetailRow}><span>Sales Revenue</span><strong>{sym}{data.revenue.toLocaleString()}</strong></div>
                    <div className={styles.ddDetailRow}><span>Best Seller</span><strong>{data.bestSeller}</strong></div>
                    <div className={styles.ddDetailRow}><span>Categories Sold</span><strong>{data.categoriesSold}</strong></div>
                    <div className={styles.ddDetailRow}><span>Sales Growth</span><strong className={data.salesGrowth.startsWith('-') ? styles.ddRed : styles.ddGreen}>{data.salesGrowth}</strong></div>
                  </div>

                  <div className={styles.ddDetailCard}>
                    <h4 className={styles.ddDetailTitle}><i className="fas fa-users" style={{ marginRight: 6 }} />Customers</h4>
                    <div className={styles.ddDetailRow}><span>Total Customers</span><strong>{data.customers}</strong></div>
                    <div className={styles.ddDetailRow}><span>New Customers</span><strong className={styles.ddGreen}>{data.newCustomers}</strong></div>
                    <div className={styles.ddDetailRow}><span>Repeat Customers</span><strong>{data.repeatCustomers}</strong></div>
                    <div className={styles.ddDetailRow}><span>Retention Rate</span><strong>{data.retentionRate}%</strong></div>
                    <div className={styles.ddDetailRow}><span>Revenue / Customer</span><strong>{sym}{data.revPerCustomer}</strong></div>
                  </div>

                  <div className={styles.ddDetailCard}>
                    <h4 className={styles.ddDetailTitle}><i className="fas fa-bell" style={{ marginRight: 6 }} />Subscribers</h4>
                    <div style={{ fontSize: 11, color: '#94A3B8', marginBottom: 8 }}>Subscriber tracking is not available yet.</div>
                    <div className={styles.ddDetailRow}><span>Total Subscribers</span><strong>{data.subscribers}</strong></div>
                    <div className={styles.ddDetailRow}><span>Active</span><strong className={styles.ddGreen}>{data.activeSubs}</strong></div>
                    <div className={styles.ddDetailRow}><span>Unsubscribed</span><strong className={styles.ddRed}>{data.unsubs}</strong></div>
                    <div className={styles.ddDetailRow}><span>Retention Rate</span><strong>{data.subRetention}%</strong></div>
                    <div className={styles.ddDetailRow}><span>Active Rate</span><strong>{data.activeRate}%</strong></div>
                  </div>
                </div>

                <div className={styles.ddTableGrid}>
                  <div className={styles.ddTableCard}>
                    <h4 className={styles.ddTableTitle}><i className="fas fa-trophy" style={{ marginRight: 6, color: '#eab308' }} />TOP REVENUE PRODUCTS</h4>
                    <div className={styles.ddTableWrap}>
                      <table className={styles.table}>
                        <thead><tr><th>#</th><th>PRODUCT</th><th>CATEGORY</th><th>REVENUE</th><th>SHARE</th></tr></thead>
                        <tbody>
                          {data.topProducts.map((p, i) => (
                            <tr key={p.name}><td>{i + 1}</td><td>{p.name}</td><td><span className={styles.ddCatBadge}>{p.category}</span></td><td>{sym}{p.revenue.toLocaleString()}</td><td>{p.share}%</td></tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  <div className={styles.ddTableCard}>
                    <h4 className={styles.ddTableTitle}><i className="fas fa-arrow-down" style={{ marginRight: 6, color: '#ef4444' }} />POOR REVENUE PRODUCTS</h4>
                    <div className={styles.ddTableWrap}>
                      <table className={styles.table}>
                        <thead><tr><th>#</th><th>PRODUCT</th><th>CATEGORY</th><th>REVENUE</th><th>STATUS</th></tr></thead>
                        <tbody>
                          {data.poorProducts.map((p, i) => (
                            <tr key={p.name}><td>{i + 1}</td><td>{p.name}</td><td><span className={styles.ddCatBadge}>{p.category}</span></td><td>{sym}{p.revenue.toLocaleString()}</td><td><span className={`${styles.ddStatusBadge} ${p.status === 'Low Demand' ? styles.ddStatusLow : p.status === 'Slow Moving' ? styles.ddStatusSlow : p.status === 'Declining' ? styles.ddStatusDecline : styles.ddStatusOver}`}>{p.status}</span></td></tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                <div className={styles.ddBottomGrid}>
                  <div className={styles.ddBottomCard}>
                    <h4 className={styles.ddTableTitle}><i className="fas fa-boxes" style={{ marginRight: 6 }} />INVENTORY <span className={styles.ddInvBadge}>RESTOCK: {data.lowStock.length > 3 ? 'HIGH' : 'MEDIUM'}</span></h4>
                    <div style={{ fontSize: 11, color: '#94A3B8', marginBottom: 8 }}>Country-wide stock (not regional).</div>
                    <div className={styles.ddInvSplit}>
                      <div>
                        <div className={styles.ddInvLabel}><span className={styles.ddInvDot} style={{ background: '#eab308' }} /> LOW STOCK</div>
                        {data.lowStock.map((item) => (
                          <div key={item.name} className={styles.ddInvItem}><span>{item.name}</span><span className={styles.ddInvQty}>{item.qty} left</span></div>
                        ))}
                        {data.lowStock.length === 0 && <div className={styles.ddInvEmpty}>No low-stock items</div>}
                      </div>
                      <div>
                        <div className={styles.ddInvLabel}><span className={styles.ddInvDot} style={{ background: '#16a34a' }} /> HIGH STOCK</div>
                        {data.highStock.map((item) => (
                          <div key={item.name} className={styles.ddInvItem}><span>{item.name}</span><span className={styles.ddInvQty}>{item.qty}</span></div>
                        ))}
                        {data.highStock.length === 0 && <div className={styles.ddInvEmpty}>No high-stock items</div>}
                      </div>
                    </div>
                    <div className={styles.ddInvTotal}>Total Stock Units<strong>{data.totalStockUnits}</strong></div>
                  </div>

                  <div className={styles.ddBottomCard}>
                    <h4 className={styles.ddTableTitle}><i className="fas fa-chart-bar" style={{ marginRight: 6 }} />6-MONTH REVENUE TREND</h4>
                    <div className={styles.ddTrendChart}>
                      <div className={styles.ddTrendBars}>
                        {trendData.map((t) => (
                          <div key={t.month} className={styles.ddTrendBarCol}>
                            <span className={styles.ddTrendVal}>{sym}{t.revenue.toLocaleString()}</span>
                            <div className={styles.ddTrendBar} style={{ height: `${(t.revenue / maxTrend) * 100}%` }} />
                            <span className={styles.ddTrendMonth}>{t.month.slice(5)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        );
      })()}

      {/* ═══════════════════════════════════════════════════════════
          SUBSCRIBERS TAB
      ═══════════════════════════════════════════════════════════ */}
      {tab === 'subscribers' && (() => {
        const totalSubs = geo.states.reduce((s, st) => s + st.subscribers, 0);
        const totalActive = geo.states.reduce((s, st) => s + st.activeSubs, 0);
        const totalUnsubs = geo.states.reduce((s, st) => s + st.unsubs, 0);
        const subData = subRegion
          ? geo.states.find((s) => s.name === subRegion)
          : undefined;
        const subCityData = subCity && subData
          ? subData.cities.find((c) => c.name === subCity)
          : undefined;
        const activeSub = subCityData ?? subData;

        function exportSubsCsv() {
          const header = 'ID,Name,Email,Phone,Status,Source\n';
          const rows = filteredSubs.map((s) => `${s.id},${s.name},${s.email},${s.phone},${s.status},${s.source}`).join('\n');
          const blob = new Blob([header + rows], { type: 'text/csv' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${config.id}-subscribers.csv`;
          a.click();
          URL.revokeObjectURL(url);
          notify('CSV exported.');
        }

        return (
          <div>
            <div className={styles.rptSubHeader}>
              <div className={styles.rptSubTitleRow}>
                <i className="fas fa-user-friends" style={{ color: '#16A34A', marginRight: 10, fontSize: 22 }} />
                <h2 className={styles.rptSubTitle}>Subscribers</h2>
                <span className={styles.rptCountryBadge}>{config.name}</span>
              </div>
              <button type="button" className={styles.rptExportBtn} onClick={exportSubsCsv}>
                <i className="fas fa-download" style={{ marginRight: 6 }} />Export CSV
              </button>
            </div>

            <div className={styles.rptKpiRow}>
              <div className={styles.rptKpiCard}>
                <div className={styles.rptKpiIcon}><i className="fas fa-users" /></div>
                <div className={styles.rptKpiInfo}>
                  <span className={styles.rptKpiLabel}>Total Subscribers</span>
                  <span className={styles.rptKpiValue}>{totalSubs}</span>
                  <span className={styles.rptKpiSub}>Across {config.name}</span>
                </div>
              </div>
              <div className={styles.rptKpiCard}>
                <div className={styles.rptKpiIcon}><i className="fas fa-check-circle" /></div>
                <div className={styles.rptKpiInfo}>
                  <span className={styles.rptKpiLabel}>Active Subscribers</span>
                  <span className={`${styles.rptKpiValue} ${styles.rptKpiGreen}`}>{totalActive}</span>
                  <span className={styles.rptKpiSub}>{totalSubs ? Math.round((totalActive / totalSubs) * 100) : 0}% of total</span>
                </div>
              </div>
              <div className={styles.rptKpiCard}>
                <div className={styles.rptKpiIcon}><i className="fas fa-user-minus" /></div>
                <div className={styles.rptKpiInfo}>
                  <span className={styles.rptKpiLabel}>Unsubscribed</span>
                  <span className={styles.rptKpiValue}>{totalUnsubs}</span>
                  <span className={styles.rptKpiSub}>Opted out of updates</span>
                </div>
              </div>
            </div>

            <div className={styles.rptSearchRow}>
              <div className={styles.rptSearchGroup}>
                <label className={styles.rptSearchLabel}>SEARCH</label>
                <div className={styles.rptSearchWrap}>
                  <i className="fas fa-search" style={{ color: '#9CA3AF', marginRight: 8 }} />
                  <input
                    type="text"
                    className={styles.rptSearchInput}
                    placeholder="Search by name, email, ID..."
                    value={subSearch}
                    onChange={(e) => { setSubSearch(e.target.value); setSubPage(1); }}
                  />
                </div>
              </div>
              <div className={styles.rptFilterGroup}>
                <label className={styles.rptSearchLabel}>STATUS</label>
                <div className={styles.rptFilterRow}>
                  <select className={styles.rptSelect} value={subStatus} onChange={(e) => { setSubStatus(e.target.value); setSubPage(1); }}>
                    <option value="">All Status</option>
                    <option value="subscribed">Subscribed</option>
                    <option value="unsubscribed">Unsubscribed</option>
                  </select>
                  <button type="button" className={styles.rptResetBtn} onClick={() => { setSubSearch(''); setSubStatus(''); setSubPage(1); }}>
                    <i className="fas fa-redo" style={{ marginRight: 4 }} />Reset
                  </button>
                </div>
              </div>
            </div>

            <div className={styles.rptFullPanel}>
              <div className={styles.rptFullTitleRow} style={{ padding: '14px 20px' }}>
                <i className="fas fa-list" style={{ color: '#16A34A', marginRight: 8 }} />
                <h3 className={styles.rptFullTitle}>Subscriber List</h3>
              </div>
              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead><tr><th>CUSTOMER ID</th><th>NAME</th><th>EMAIL</th><th>PHONE NUMBER</th></tr></thead>
                  <tbody>
                    {pagedSubs.length === 0 ? (
                      <tr><td colSpan={4} style={{ textAlign: 'center', padding: 24, color: '#6B7280' }}>No subscribers found matching your filters</td></tr>
                    ) : pagedSubs.map((s) => (
                      <tr key={s.id}>
                        <td>{s.id}</td>
                        <td className={styles.rptBold}>{s.name}</td>
                        <td>{s.email}</td>
                        <td>{s.phone}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {subTotalPages > 1 && (
                <div className={styles.rptPagination}>
                  <button type="button" className={styles.rptPageBtn} disabled={subPage <= 1} onClick={() => setSubPage((p) => Math.max(1, p - 1))}>‹</button>
                  <span className={styles.rptPageNum}>{subPage}</span>
                  <button type="button" className={styles.rptPageBtn} disabled={subPage >= subTotalPages} onClick={() => setSubPage((p) => Math.min(subTotalPages, p + 1))}>›</button>
                </div>
              )}
            </div>

            <div className={styles.rptFullPanel} style={{ marginTop: 16 }}>
              <div className={styles.rptFullHeader}>
                <div className={styles.rptFullTitleRow}>
                  <i className="fas fa-user-friends" style={{ color: '#16A34A', marginRight: 8 }} />
                  <h3 className={styles.rptFullTitle}>Subscribers by State</h3>
                  <span className={styles.rptCountryBadge}>{config.name}</span>
                </div>
                <span className={styles.rptFullSub}>Page subscribers and opt-outs in every state</span>
              </div>
              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead><tr><th>TOP</th><th>REGION</th><th>SUBSCRIBERS</th><th>ACTIVE</th><th>UNSUBSCRIBED</th><th>ACTIVE RATE</th><th>TOP CITIES</th></tr></thead>
                  <tbody>
                    {filteredGeo.states.map((s, i) => (
                      <tr key={s.name} className={subRegion === s.name ? styles.rptRowActive : ''} style={{ cursor: 'pointer' }} onClick={() => { setSubRegion(subRegion === s.name ? '' : s.name); setSubCity(''); }}>
                        <td><span className={`${styles.rptRankBadge} ${i < 3 ? styles.rptRankTop : ''}`}>{i + 1}</span></td>
                        <td className={styles.rptBold}>{s.name}</td>
                        <td>{s.subscribers}</td>
                        <td>{s.activeSubs}</td>
                        <td className={styles.rptRed}>{s.unsubs}</td>
                        <td>{s.activeRate}%</td>
                        <td>
                          <div className={styles.rptCityBadges}>
                            {s.cities.slice(0, 5).map((c) => (
                              <span key={c.name} className={styles.rptCityBadge} onClick={(e) => { e.stopPropagation(); setSubRegion(s.name); setSubCity(c.name); }}>
                                {c.name} · {c.activeSubs} subs
                              </span>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {activeSub && (
              <div className={styles.rptFullPanel} style={{ marginTop: 16 }}>
                <div className={styles.rptFullHeader}>
                  <div className={styles.rptFullTitleRow}>
                    <i className="fas fa-map-marker-alt" style={{ color: '#16A34A', marginRight: 8 }} />
                    <h3 className={styles.rptFullTitle}>{subCity || subRegion} — Subscriber Details</h3>
                    <button type="button" className={styles.rptClearBtn} onClick={() => { setSubRegion(''); setSubCity(''); }}>Clear</button>
                  </div>
                </div>
                <div className={styles.rptDetailGrid}>
                  <div className={styles.rptDetailCard}>
                    <span className={styles.rptDetLabel}>Total Subscribers</span>
                    <span className={styles.rptDetValue}>{activeSub.subscribers}</span>
                  </div>
                  <div className={styles.rptDetailCard}>
                    <span className={styles.rptDetLabel}>Active</span>
                    <span className={`${styles.rptDetValue} ${styles.rptGreen}`}>{activeSub.activeSubs}</span>
                  </div>
                  <div className={styles.rptDetailCard}>
                    <span className={styles.rptDetLabel}>Unsubscribed</span>
                    <span className={`${styles.rptDetValue} ${styles.rptRed}`}>{activeSub.unsubs}</span>
                  </div>
                  <div className={styles.rptDetailCard}>
                    <span className={styles.rptDetLabel}>Active Rate</span>
                    <span className={styles.rptDetValue}>{activeSub.activeRate}%</span>
                  </div>
                </div>
                {subData && !subCity && (
                  <div className={styles.tableWrapper} style={{ marginTop: 12 }}>
                    <table className={styles.table}>
                      <thead><tr><th>CITY</th><th>SUBSCRIBERS</th><th>ACTIVE</th><th>UNSUBSCRIBED</th><th>ACTIVE RATE</th></tr></thead>
                      <tbody>
                        {subData.cities.map((c) => (
                          <tr key={c.name} style={{ cursor: 'pointer' }} onClick={() => setSubCity(c.name)}>
                            <td className={styles.rptBold}>{c.name}</td>
                            <td>{c.subscribers}</td>
                            <td className={styles.rptGreen}>{c.activeSubs}</td>
                            <td className={styles.rptRed}>{c.unsubs}</td>
                            <td>{c.activeRate}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })()}

      {tab === 'imports' && (
        <div className={styles.panel}>
          <div className={styles.panelHeader}><h3 className={styles.panelTitle}>Imports by Origin</h3></div>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead><tr><th>Origin</th><th>Share</th><th>Category</th></tr></thead>
              <tbody>
                <tr><td>India</td><td>45%</td><td>Spices & Grains</td></tr>
                <tr><td>Pakistan</td><td>25%</td><td>Basmati & Produce</td></tr>
                <tr><td>Others</td><td>30%</td><td>Mixed grocery</td></tr>
              </tbody>
            </table>
          </div>
          <div className={styles.panelBody}><p className={styles.muted}>Reference breakdown for the UAE import segment.</p></div>
        </div>
      )}

      {tab === 'channels' && (
        <div className={styles.panel}>
          <div className={styles.panelHeader}><h3 className={styles.panelTitle}>Channel Split</h3></div>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead><tr><th>Channel</th><th>Orders</th><th>Revenue</th><th>Share</th></tr></thead>
              <tbody>
                {channelRows.map((c) => (
                  <tr key={c.channel}>
                    <td>{c.channel}</td><td>{c.orders}</td><td>{sym}{c.revenue.toLocaleString()}</td>
                    <td>{cityFilteredOrders.length ? Math.round((c.orders / cityFilteredOrders.length) * 100) : 0}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      <TrustBanner />
    </div>
  );
}
