import { useEffect, useState, useCallback, useMemo, useRef, Fragment } from 'react';
import { getOrder, listOrders, updateOrderStatus } from '../../../api/adminOrdersApi';
import { listCustomers } from '../../../api/adminCustomersApi';
import type { AdminCustomer, AdminOrderDetail, AdminOrderSummary } from '../../../types';
import type { CountryConfig } from '../../../config/countryConfig';
import { ORDER_STATUSES } from '../../../types';
import SideDrawer from '../../../components/admin/SideDrawer';
import LiveBadge from '../../../components/admin/LiveBadge';
import ExportMenu from '../../../components/admin/ExportMenu';
import SubOrdersView from './SubOrdersView';import { type ExportData } from '../../../utils/csvExport';
import { getErrorMessage } from '../../../utils/errors';
import { useLivePoll } from '../../../hooks/useLivePoll';
import { findNewOrders, isNewSinceWatch, notifyNewOrders } from '../../../utils/adminOrderToast';
import NewOrderMark from '../../../components/admin/NewOrderMark';
import markStyles from '../../../components/admin/css/NewOrderMark.module.css';
import { hasModule, hasPermission } from '../../../utils/adminScope';
import { useAdminAuth } from '../../../context/AdminAuthContext';
import { CANCELLABLE_ORDER_STATUSES, NEXT_ORDER_ACTION_LABEL, NEXT_ORDER_STATUS } from '../../../utils/orderStatus';
import { buildCustomerIndex, customerNo } from '../../../utils/ticketNo';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUsers, faClipboardList, faChartLine, faSync,
  faEye, faEllipsisV, faSearch, faPrint,
  faPhone, faCopy, faCommentDots, faFilter,
} from '@fortawesome/free-solid-svg-icons';
import { computeCLV, computeCustomerSegmentation } from '../../../utils/analytics';
import styles from './SubViews.module.css';
import TrustBanner from './TrustBanner';

type TabType = 'all' | 'SHOP' | 'SMALL_BOX' | 'BIG_BOX' | 'B2B';

/** Real backend lifecycle only — OUT_FOR_DELIVERY is not a server-side status
 *  (matches utils/orderStatus.ts ORDER_STATUS_FLOW and the customer OrderDetail steps). */
const ORDER_STATUS_TIMELINE = ['PLACED', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'];

/**
 * Fetch ALL orders for a country. The admin orders endpoint defaults to size=20 and
 * hard-caps at 200, and applies no sort — one bare call silently drops every row past
 * the first page (stats/filters/export then run on a random subset). Pages through
 * until every order is in, so this view stays correct at any order count.
 */
async function fetchAllCountryOrders(country: string): Promise<AdminOrderSummary[]> {
  const first = await listOrders({ country, page: 0, size: 200 });
  const all = [...first.content];
  if (first.totalPages > 1) {
    const rest = await Promise.all(
      Array.from({ length: first.totalPages - 1 }, (_, i) =>
        listOrders({ country, page: i + 1, size: 200 }),
      ),
    );
    for (const page of rest) all.push(...page.content);
  }
  return all;
}

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(ta);
      return ok;
    } catch {
      return false;
    }
  }
}

/** Statuses that count as "not completed yet" — what the gold star marks. */
const OPEN_ORDER_STATUSES = new Set(['PLACED', 'CONFIRMED', 'PROCESSING', 'SHIPPED']);

interface CustomerRow {
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  cityName: string;
  orderCount: number;
  openOrderCount: number;
  totalSpent: number;
  lastOrderDate: string;
  lastOrderNumber: string;
  lastOrderId: string | null;
  countryCode: string;
  predictedCLV: number;
  churnRisk: 'Low' | 'Medium' | 'High';
}

export default function SubCustomersOrdersView({ config }: { config: CountryConfig }) {
  const code = config.code;
  const sym = config.currencySymbol;
  const { admin } = useAdminAuth();
  // Module grants: the Customers table needs 'users', the Orders section needs 'orders'.
  const canCustomers = hasModule(admin, 'users');
  const canOrders = hasModule(admin, 'orders');
  const canEdit = hasPermission(admin, 'edit');
  const canExport = hasPermission(admin, 'export');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [customers, setCustomers] = useState<AdminCustomer[]>([]);
  const [allOrders, setAllOrders] = useState<AdminOrderSummary[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [search, setSearch] = useState('');
  const [city, setCity] = useState('');
  const [orderStatus, setOrderStatus] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sort, setSort] = useState('lastOrder');
  // Mobile-only collapsible filter panel (see .coFilterToggle in SubViews.module.css).
  const [coFiltersOpen, setCoFiltersOpen] = useState(false);
  // Badge on the mobile filter toggle = collapsible fields currently active.
  const activeFilterCount = [city, orderStatus, paymentStatus, dateFrom, dateTo].filter(Boolean).length;
  const [drawerCustomer, setDrawerCustomer] = useState<AdminCustomer | null>(null);
  const [drawerCustomerOrders, setDrawerCustomerOrders] = useState<AdminOrderSummary[]>([]);
  const [drawerSelectedOrder, setDrawerSelectedOrder] = useState<AdminOrderDetail | null>(null);
  const [orderCityMap, setOrderCityMap] = useState<Map<string, string>>(new Map());
  const [section, setSection] = useState<'customers' | 'orders'>(canCustomers ? 'customers' : 'orders');
  const [statusSaving, setStatusSaving] = useState(false);
  const [statusError, setStatusError] = useState('');
  const [moreMenuFor, setMoreMenuFor] = useState('');
  const [copiedId, setCopiedId] = useState('');

  useEffect(() => {
    if (!moreMenuFor) return;
    const close = () => setMoreMenuFor('');
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMoreMenuFor('');
    };
    document.addEventListener('click', close);
    document.addEventListener('keydown', onEsc);
    return () => {
      document.removeEventListener('click', close);
      document.removeEventListener('keydown', onEsc);
    };
  }, [moreMenuFor]);

  // QA-07: fetch the country dataset once per country change (or manual refresh).
  // Tab/search/status/date/city/payment filters are client-side over this dataset —
  // typing never refires fetchAllCountryOrders / listCustomers / the city-map loop.
  // Feature A: `silent` = live refresh — no spinner; city lookups are incremental
  // (only order ids never tried before) so a 10s tick is not 50 getOrder calls;
  // a failed tick throws so the hook can back off without touching current rows.
  const cityMapRef = useRef<Map<string, string>>(new Map());
  const cityTriedRef = useRef<Set<string>>(new Set());
  /** Last order-id set seen by `loadData` — the new-order toast diffs silent
      refreshes against it; non-silent loads only rebase the set. */
  const seenOrderIdsRef = useRef<Set<string> | null>(null);
  /** Session-new order ids — rows wear a persistent NEW pill on top of the
      transient toast, so admins can still identify fresh orders later. */
  const [sessionNewIds, setSessionNewIds] = useState<Set<string>>(new Set());

  const loadData = useCallback((silent = false) => {
    if (!silent) setLoading(true);
    return Promise.all([
      fetchAllCountryOrders(code),
      listCustomers({ country: code }),
    ])
      .then(async ([allOrds, custs]) => {
        setCustomers(custs);
        setAllOrders(allOrds);

        // New-order toast (Feature A follow-up): diff silent ticks against the
        // last seen id set. Non-silent loads only rebase the set.
        const prevIds = seenOrderIdsRef.current;
        seenOrderIdsRef.current = new Set(allOrds.map((o) => o.id));
        if (silent && prevIds) {
          const fresh = findNewOrders(prevIds, allOrds);
          if (fresh.length > 0) {
            setSessionNewIds((prev) => {
              const next = new Set(prev);
              for (const o of fresh) next.add(o.id);
              return next;
            });
            notifyNewOrders(fresh, (arr) => {
              const sum = arr.reduce((t, o) => t + o.grandTotal, 0);
              return arr.length === 1
                ? `${arr[0].buyerName ?? arr[0].orderNumber} · ${sym}${sum.toLocaleString()}`
                : `${arr.length} orders · ${sym}${sum.toLocaleString()} total`;
            });
          }
        }

        const uniqueOrderIds = [...new Set(allOrds.map((o) => o.id))].slice(0, 50);
        const cityMap = silent ? new Map(cityMapRef.current) : new Map<string, string>();
        const tried = silent ? cityTriedRef.current : new Set<string>();
        await Promise.all(
          uniqueOrderIds.filter((id) => !tried.has(id)).map(async (id) => {
            tried.add(id);
            try {
              const detail = await getOrder(id);
              if (detail.address?.city) {
                cityMap.set(id, detail.address.city);
              }
            } catch { /* ignore */ }
          })
        );
        cityMapRef.current = cityMap;
        cityTriedRef.current = tried;
        setOrderCityMap(cityMap);
        setError('');
      })
      .catch((err: unknown) => {
        if (silent) throw err;
        setError(getErrorMessage(err, 'Could not load data.'));
      })
      .finally(() => { if (!silent) setLoading(false); });
  }, [code, sym]);

  useEffect(() => { void loadData(); }, [loadData]);

  /* Feature A — live refresh: re-read the country order set every 10s while the
     Customers section is on screen. Disabled on the Orders section — the
     embedded SubOrdersView polls its own page, so they never double-fetch. */
  const livePoll = useLivePoll(() => loadData(true), { intervalMs: 10_000, enabled: section === 'customers' });

  // Old call sites (Retry button, post-mutation refreshes) keep the `load` name.
  const load = loadData;

  const orders = useMemo(() => {
    let filtered = allOrders;
    if (activeTab !== 'all') {
      filtered = filtered.filter((o) => o.channel.toUpperCase().replace(/\s/g, '_') === activeTab);
    }
    const q = search.toLowerCase().trim();
    if (q) {
      filtered = filtered.filter((o) =>
        `${o.orderNumber} ${o.buyerName ?? ''} ${o.buyerPhone ?? ''}`.toLowerCase().includes(q)
      );
    }
    if (orderStatus) {
      filtered = filtered.filter((o) => o.status === orderStatus);
    }
    if (dateFrom) {
      filtered = filtered.filter((o) => o.createdAt.slice(0, 10) >= dateFrom);
    }
    if (dateTo) {
      filtered = filtered.filter((o) => o.createdAt.slice(0, 10) <= dateTo);
    }
    if (city) {
      filtered = filtered.filter((o) => orderCityMap.get(o.id) === city);
    }
    if (paymentStatus) {
      // Summary rows already carry status — same values the old per-row getOrder read.
      filtered = filtered.filter((o) => {
        const ps = o.status === 'DELIVERED' ? 'Paid' : o.status === 'CANCELLED' ? 'Refunded' : 'Pending';
        return ps === paymentStatus;
      });
    }
    return filtered;
  }, [allOrders, activeTab, search, orderStatus, dateFrom, dateTo, city, orderCityMap, paymentStatus]);

  const clvData = useMemo(() => {
    const clv = computeCLV(customers, orders);
    return new Map(clv.map(c => [c.customerId, c]));
  }, [customers, orders]);

  const segments = useMemo(() => computeCustomerSegmentation(customers, orders), [customers, orders]);

  const customerRows: CustomerRow[] = useMemo(() => {
    const custMap = new Map<string, { customer: AdminCustomer; custOrders: AdminOrderSummary[] }>();
    customers.forEach((c) => {
      const custOrders = orders.filter((o) => o.buyerPhone === c.phone);
      custMap.set(c.phone, { customer: c, custOrders });
    });

    orders.forEach((o) => {
      if (!custMap.has(o.buyerPhone ?? '')) {
        const dummy: AdminCustomer = {
          id: `guest-${o.id}`,
          name: o.buyerName ?? null,
          email: null,
          phone: o.buyerPhone ?? '',
          countryCode: code,
          orderCount: 1,
          totalSpent: o.grandTotal,
          customerType: 'B2C',
          registeredAt: o.createdAt,
        };
        custMap.set(o.buyerPhone ?? '', { customer: dummy, custOrders: [o] });
      }
    });

    const rows: CustomerRow[] = [];
    custMap.forEach(({ customer: c, custOrders }) => {
      const sortedByDate = [...custOrders].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      const lastOrd = sortedByDate[0];
      const totalSpent = custOrders.reduce((sum, o) => sum + o.grandTotal, 0);
      // Gold star marker: orders still open (Placed/Confirmed/Processing/
      // Shipped) — the sub-admin's "this isn't completed yet" intimation.
      const openOrderCount = custOrders.filter((o) => OPEN_ORDER_STATUSES.has(o.status)).length;

      let cityName = '—';
      for (const o of custOrders) {
        const city = orderCityMap.get(o.id);
        if (city) { cityName = city; break; }
      }

      rows.push({
        customerId: c.id,
        customerName: c.name ?? '—',
        customerEmail: c.email ?? '',
        customerPhone: c.phone,
        cityName,
        orderCount: custOrders.length,
        openOrderCount,
        totalSpent,
        lastOrderDate: lastOrd?.createdAt ?? '',
        lastOrderNumber: lastOrd?.orderNumber ?? '',
        lastOrderId: lastOrd?.id ?? null,
        countryCode: c.countryCode ?? code,
        predictedCLV: clvData.get(c.id)?.predictedCLV ?? 0,
        churnRisk: clvData.get(c.id)?.churnRisk ?? 'Low',
      });
    });

    if (sort === 'lastOrder') rows.sort((a, b) => b.lastOrderDate.localeCompare(a.lastOrderDate));
    if (sort === 'name') rows.sort((a, b) => a.customerName.localeCompare(b.customerName));
    if (sort === 'orders') rows.sort((a, b) => b.orderCount - a.orderCount);
    if (sort === 'spent') rows.sort((a, b) => b.totalSpent - a.totalSpent);

    return rows;
  }, [customers, orders, sort, code, orderCityMap, clvData]);

  /** A customer row is "new" when its last order is session-new or < 24h old. */
  const rowIsNew = (row: CustomerRow) =>
    !!row.lastOrderId && isNewSinceWatch(row.lastOrderId, row.lastOrderDate, sessionNewIds);
  const newCustCount = customerRows.filter(rowIsNew).length;

  // Stable display numbers (oldest customer first), independent of sort/filter.
  // Mirrors the guest-collapse in customerRows (one dummy per unmatched phone).
  const custIndex = useMemo(() => {
    const base: { id: string; createdAt: string }[] = customers.map((c) => ({
      id: c.id,
      createdAt: c.registeredAt,
    }));
    const phones = new Set(customers.map((c) => c.phone));
    const guestFirst = new Map<string, string>();
    for (const o of orders) {
      const ph = o.buyerPhone ?? '';
      if (!phones.has(ph) && !guestFirst.has(ph)) guestFirst.set(ph, o.id);
    }
    for (const [, orderId] of guestFirst) {
      const o = orders.find((x) => x.id === orderId);
      if (o) base.push({ id: `guest-${o.id}`, createdAt: o.createdAt });
    }
    return buildCustomerIndex(base);
  }, [customers, orders]);

  const totalRevenue = useMemo(() => orders.reduce((sum, o) => sum + o.grandTotal, 0), [orders]);
  const avgOrderValue = orders.length > 0 ? Math.round(totalRevenue / orders.length) : 0;
  const repeatCustomers = useMemo(() => {
    const custOrderCounts = new Map<string, number>();
    orders.forEach((o) => {
      const phone = o.buyerPhone ?? '';
      custOrderCounts.set(phone, (custOrderCounts.get(phone) ?? 0) + 1);
    });
    return Array.from(custOrderCounts.values()).filter((c) => c >= 2).length;
  }, [orders]);

  const cities = useMemo(() => {
    const set = new Set<string>();
    orderCityMap.forEach((city) => { if (city) set.add(city); });
    return Array.from(set).sort();
  }, [orderCityMap]);

  const openDrawer = useCallback(async (customerId: string) => {
    const cust = customers.find((c) => c.id === customerId);
    if (!cust) return;
    setDrawerCustomer(cust);
    const custOrders = orders.filter((o) => o.buyerPhone === cust.phone);
    setDrawerCustomerOrders(custOrders);
    setDrawerSelectedOrder(null);
  }, [customers, orders]);

  const openDrawerOrder = useCallback(async (orderId: string) => {
    try {
      const d = await getOrder(orderId);
      setDrawerSelectedOrder(d);
    } catch {
      setDrawerSelectedOrder(null);
    }
  }, []);

  async function advanceDrawerOrderStatus(next: string) {
    if (!drawerSelectedOrder || statusSaving) return;
    setStatusSaving(true);
    setStatusError('');
    try {
      const updated = await updateOrderStatus(drawerSelectedOrder.id, next);
      setDrawerSelectedOrder(updated);
      load();
    } catch (err: unknown) {
      setStatusError(getErrorMessage(err, 'Could not update order status.'));
    } finally {
      setStatusSaving(false);
    }
  }

  async function cancelDrawerOrder() {
    if (!drawerSelectedOrder || statusSaving) return;
    if (!window.confirm(`Cancel order ${drawerSelectedOrder.orderNumber}? This cannot be undone.`)) return;
    setStatusSaving(true);
    setStatusError('');
    try {
      const updated = await updateOrderStatus(drawerSelectedOrder.id, 'CANCELLED');
      setDrawerSelectedOrder(updated);
      load();
    } catch (err: unknown) {
      setStatusError(getErrorMessage(err, 'Could not cancel order.'));
    } finally {
      setStatusSaving(false);
    }
  }

  function getExportData(): ExportData {
    return {
      filename: `${config.id}-customers-orders.csv`,
      title: `Customers & Orders — ${config.name}`,
      columns: ['Customer ID', 'Name', 'Phone', 'Email', 'City', 'Orders', 'Total Spent', 'Last Order'],
      rows: customerRows.map((r) => [
        customerNo(custIndex, r.customerId), r.customerName, r.customerPhone, r.customerEmail,
        r.cityName, String(r.orderCount), String(r.totalSpent), r.lastOrderDate,
      ]),
    };
  }

  function getTimelineIndex(status: string): number {
    const idx = ORDER_STATUS_TIMELINE.indexOf(status);
    return idx >= 0 ? idx : ORDER_STATUS_TIMELINE.length;
  }

  return (
    <div>
      <div className={styles.filterRow} style={{ marginBottom: 12 }}>
        {(['customers', 'orders'] as const)
          .filter((sec) => (sec === 'customers' ? canCustomers : canOrders))
          .map((sec) => (
          <button
            key={sec}
            type="button"
            className={`${styles.filterBtn} ${section === sec ? styles.filterBtnActive : ''}`}
            onClick={() => setSection(sec)}
          >
            {sec === 'customers' ? 'Customers' : 'Orders'}
          </button>
        ))}
        {section === 'customers' && (
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
            {newCustCount > 0 && <NewOrderMark label={`${newCustCount} new`} />}
            <LiveBadge live={livePoll} />
          </div>
        )}
      </div>

      {section === 'customers' ? (
      <>
      <div className={styles.panel} style={{ marginBottom: 16 }}>
        <div className={styles.filterRow}>
          {([
            { key: 'all', label: 'All Orders', icon: faClipboardList },
            { key: 'SHOP', label: 'Shop', icon: faClipboardList },
            { key: 'SMALL_BOX', label: 'Small Box', icon: faClipboardList },
            { key: 'BIG_BOX', label: 'Big Box', icon: faClipboardList },
            { key: 'B2B', label: 'B2B', icon: faClipboardList },
          ] as const).map((tab) => (
            <button
              key={tab.key}
              type="button"
              className={`${styles.filterBtn} ${activeTab === tab.key ? styles.filterBtnActive : ''}`}
              onClick={() => setActiveTab(tab.key)}
            >
              <FontAwesomeIcon icon={tab.icon} style={{ marginRight: 6, fontSize: 12 }} />
              {tab.label}
            </button>
          ))}
        </div>
        <div className={`${styles.coFilters} ${coFiltersOpen ? styles.coFiltersOpen : ''}`}>
          <div className={`${styles.coFilterGroup} ${styles.coFilterSearch}`}>
            <label className={styles.coFilterLabel}>
              <FontAwesomeIcon icon={faSearch} style={{ marginRight: 4, fontSize: 10 }} />
              SEARCH
            </label>
            <input
              className={styles.coFilterInput}
              placeholder="Customer name, email, phone or Order ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className={styles.coFilterGroup}>
            <label className={styles.coFilterLabel}>CITY</label>
            <select className={styles.coFilterSelect} value={city} onChange={(e) => setCity(e.target.value)}>
              <option value="">All Cities</option>
              {cities.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className={styles.coFilterGroup}>
            <label className={styles.coFilterLabel}>ORDER STATUS</label>
            <select className={styles.coFilterSelect} value={orderStatus} onChange={(e) => setOrderStatus(e.target.value)}>
              <option value="">All Statuses</option>
              {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())}</option>)}
            </select>
          </div>
          <div className={styles.coFilterGroup}>
            <label className={styles.coFilterLabel}>PAYMENT STATUS</label>
            <select className={styles.coFilterSelect} value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value)}>
              <option value="">All Statuses</option>
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
              <option value="Refunded">Refunded</option>
            </select>
          </div>
          <div className={styles.coFilterGroup}>
            <label className={styles.coFilterLabel}>DATE FROM</label>
            <input className={styles.coFilterInput} type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
          </div>
          <div className={styles.coFilterGroup}>
            <label className={styles.coFilterLabel}>DATE TO</label>
            <input className={styles.coFilterInput} type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
          </div>
          {/* Mobile only (display:none on desktop): reveals the five select/date
              fields above when the filter row collapses on phones. */}
          <button
            type="button"
            className={styles.coFilterToggle}
            onClick={() => setCoFiltersOpen((v) => !v)}
            aria-expanded={coFiltersOpen}
          >
            <FontAwesomeIcon icon={faFilter} style={{ fontSize: 12 }} />
            {coFiltersOpen ? 'Hide filters' : 'Filters'}
            {activeFilterCount > 0 && (
              <span className={styles.coFilterCount}>{activeFilterCount}</span>
            )}
            <span aria-hidden="true">{coFiltersOpen ? '▴' : '▾'}</span>
          </button>
        </div>
      </div>

      <div className={styles.coKpiGrid}>
        <div className={styles.coKpiCard}>
          <div className={styles.coKpiInfo}>
            <div className={styles.coKpiLabel}>TOTAL CUSTOMERS</div>
            <div className={styles.coKpiValue}>{customers.length}</div>
            <div className={styles.coKpiSub}>Registered & active buyers</div>
          </div>
          <div className={styles.coKpiIcon}>
            <FontAwesomeIcon icon={faUsers} />
          </div>
        </div>
        <div className={styles.coKpiCard}>
          <div className={styles.coKpiInfo}>
            <div className={styles.coKpiLabel}>TOTAL ORDERS</div>
            <div className={styles.coKpiValue}>{orders.length}</div>
            <div className={styles.coKpiSub}>Across all customers</div>
          </div>
          <div className={styles.coKpiIcon}>
            <FontAwesomeIcon icon={faClipboardList} />
          </div>
        </div>
        <div className={styles.coKpiCard}>
          <div className={styles.coKpiInfo}>
            <div className={styles.coKpiLabel}>TOTAL REVENUE</div>
            <div className={styles.coKpiValue}>{sym}{totalRevenue.toLocaleString()}</div>
            <div className={styles.coKpiSub}>Gross order value</div>
          </div>
          <div className={styles.coKpiIcon}>
            <span style={{ fontSize: 18, fontWeight: 800, color: '#16A34A' }}>{sym}</span>
          </div>
        </div>
        <div className={styles.coKpiCard}>
          <div className={styles.coKpiInfo}>
            <div className={styles.coKpiLabel}>AOV</div>
            <div className={styles.coKpiValue}>{sym}{avgOrderValue.toLocaleString()}</div>
            <div className={styles.coKpiSub}>Average order value</div>
          </div>
          <div className={styles.coKpiIcon}>
            <FontAwesomeIcon icon={faChartLine} />
          </div>
        </div>
        <div className={styles.coKpiCard}>
          <div className={styles.coKpiInfo}>
            <div className={styles.coKpiLabel}>REPEAT CUSTOMERS</div>
            <div className={styles.coKpiValue}>{repeatCustomers}</div>
            <div className={styles.coKpiSub}>Placed 2+ orders</div>
          </div>
          <div className={styles.coKpiIcon}>
            <FontAwesomeIcon icon={faSync} />
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12, marginBottom: 16 }}>
        {segments.map((seg) => (
          <div key={seg.label} className={`${styles.coKpiCard} ${styles.coSegCard}`} style={{ padding: 14 }}>
            <div className={styles.coKpiInfo}>
              <div className={styles.coKpiLabel}>{seg.label.toUpperCase()}</div>
              <div className={styles.coKpiValue}>{seg.count}</div>
              <div className={styles.coKpiSub}>{seg.description}</div>
              <div style={{ marginTop: 6 }}>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginBottom: 2 }}>{seg.percentage}% of customers</div>
                <div style={{ height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.1)', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${seg.percentage}%`, borderRadius: 2, background: '#16A34A' }} />
                </div>
              </div>
              <div style={{ marginTop: 4, fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>{sym}{seg.revenue.toLocaleString()} revenue</div>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.coResultsBar}>
        <span className={styles.coResultsCount}>Showing 1–{customerRows.length} of {customerRows.length} customers</span>
        <div className={styles.coSortActions}>
          <span className={styles.coResultsCount}>Sort:</span>
          {[
            { key: 'lastOrder', label: 'Last Order' },
            { key: 'name', label: 'Name' },
            { key: 'orders', label: 'Total Orders' },
            { key: 'spent', label: 'Total Spent' },
          ].map((s) => (
            <button
              key={s.key}
              type="button"
              className={`${styles.coSortBtn} ${sort === s.key ? styles.coSortBtnActive : ''}`}
              onClick={() => setSort(s.key)}
            >
              {s.label}
            </button>
          ))}
          {canExport && (
            <ExportMenu getData={getExportData} />
          )}
          {canExport && (
            <button type="button" className={styles.coSortBtn} onClick={() => window.print()}>
              <FontAwesomeIcon icon={faPrint} style={{ marginRight: 4, fontSize: 11 }} />
              Print
            </button>
          )}
        </div>
      </div>

      <div className={styles.panel}>
        {loading ? (
          <p className={styles.empty}>Loading...</p>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: 24 }}>
            <p className={styles.empty}>{error}</p>
            <button type="button" className={styles.viewButton} onClick={load}>Retry</button>
          </div>
        ) : customerRows.length === 0 ? (
          <p className={styles.empty}>No customers in {config.name} match these filters.</p>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.coTable}>
              <thead>
                <tr>
                  <th>CUSTOMER ID</th>
                  <th>NAME</th>
                  <th>PHONE</th>
                  <th>CITY</th>
                  <th>ORDERS</th>
                  <th>TOTAL SPENT</th>
                  <th>LAST ORDER</th>
                  <th>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {customerRows.map((row) => (
                  <tr key={row.customerId} className={rowIsNew(row) ? markStyles.rowNew : undefined}>
                    <td style={{ fontWeight: 600, fontSize: 13 }}>{customerNo(custIndex, row.customerId)}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div className={styles.coAvatar}>
                          {row.customerName ? row.customerName.charAt(0).toUpperCase() : '👤'}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span>{row.customerName}</span>
                            {row.openOrderCount > 0 && (
                              <span
                                title={`${row.openOrderCount} order${row.openOrderCount > 1 ? 's' : ''} not completed yet`}
                                style={{ display: 'inline-flex', alignItems: 'center', gap: 2, color: 'var(--color-gold-dark)', fontSize: 11, fontWeight: 700 }}
                              >
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="var(--color-gold)" aria-hidden="true">
                                  <path d="M12 2l2.95 6.3 6.55.62-4.9 4.5 1.4 6.48L12 16.9 6 19.9l1.4-6.48-4.9-4.5 6.55-.62L12 2z" />
                                </svg>
                                {row.openOrderCount}
                              </span>
                            )}
                          </div>
                          {row.customerEmail && <div className={styles.muted}>{row.customerEmail}</div>}
                        </div>
                      </div>
                    </td>
                    <td>{row.customerPhone}</td>
                    <td>{row.cityName}</td>
                    <td style={{ textAlign: 'center', fontWeight: 600 }}>{row.orderCount}</td>
                    <td style={{ fontWeight: 700 }}>{sym}{row.totalSpent.toLocaleString()}</td>
                    <td>
                      <div style={{ fontSize: 12, lineHeight: 1.4 }}>
                        <div>{row.lastOrderDate ? new Date(row.lastOrderDate).toLocaleString() : '—'} {rowIsNew(row) && <NewOrderMark />}</div>
                        {row.lastOrderNumber && <div className={styles.muted}>{row.lastOrderNumber}</div>}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center', position: 'relative' }}>
                        <button
                          type="button"
                          className={styles.coActionBtn}
                          onClick={() => void openDrawer(row.customerId)}
                          title="View Details"
                        >
                          <FontAwesomeIcon icon={faEye} />
                        </button>
                        <button
                          type="button"
                          className={styles.coActionBtn}
                          title="More Actions"
                          aria-haspopup="menu"
                          aria-expanded={moreMenuFor === row.customerId}
                          onClick={(e) => {
                            e.stopPropagation();
                            setMoreMenuFor((cur) => (cur === row.customerId ? '' : row.customerId));
                          }}
                        >
                          <FontAwesomeIcon icon={faEllipsisV} />
                        </button>
                        {moreMenuFor === row.customerId && (() => {
                          // QA-03: phone arrives unvalidated from the API and can be null at
                          // runtime despite the declared type — guard before string ops.
                          const digits = (row.customerPhone ?? '').replace(/\D/g, '');
                          const dial = config.phoneCode.replace(/\D/g, '');
                          const waDigits = digits.startsWith(dial)
                            ? digits
                            : digits.length === 10 ? `${dial}${digits}` : digits;
                          const hasPhone = digits.length > 0;
                          const itemBase = `${styles.coMoreItem}${hasPhone ? '' : ` ${styles.coMoreItemDisabled}`}`;
                          return (
                            <div
                              className={styles.coMoreMenu}
                              role="menu"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <a
                                className={itemBase}
                                role="menuitem"
                                href={hasPhone ? `tel:${row.customerPhone}` : undefined}
                                onClick={() => setMoreMenuFor('')}
                              >
                                <FontAwesomeIcon icon={faPhone} />
                                Call {row.customerPhone || ''}
                              </a>
                              <a
                                className={itemBase}
                                role="menuitem"
                                href={hasPhone ? `https://wa.me/${waDigits}` : undefined}
                                target="_blank"
                                rel="noreferrer"
                                onClick={() => setMoreMenuFor('')}
                              >
                                <FontAwesomeIcon icon={faCommentDots} />
                                WhatsApp
                              </a>
                              <button
                                type="button"
                                className={styles.coMoreItem}
                                role="menuitem"
                                onClick={async () => {
                                  const ok = await copyText(row.customerId);
                                  if (ok) {
                                    setCopiedId(row.customerId);
                                    setTimeout(() => setCopiedId(''), 1500);
                                  }
                                  setMoreMenuFor('');
                                }}
                              >
                                <FontAwesomeIcon icon={faCopy} />
                                {copiedId === row.customerId ? 'Copied!' : 'Copy Customer ID'}
                              </button>
                            </div>
                          );
                        })()}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      </>
      ) : (
        <SubOrdersView config={config} embedded />
      )}

      {drawerCustomer && (
        <SideDrawer title="Customer Details" onClose={() => { setDrawerCustomer(null); setDrawerCustomerOrders([]); setDrawerSelectedOrder(null); }} width={520}>
          {(() => {
            const drawerOrderCount = drawerCustomerOrders.length;
            const drawerTotalSpent = drawerCustomerOrders.reduce((s, o) => s + o.grandTotal, 0);
            const drawerAOV = drawerOrderCount > 0 ? Math.round(drawerTotalSpent / drawerOrderCount) : 0;
            const tier = drawerOrderCount >= 6 ? 'Gold' : drawerOrderCount >= 2 ? 'Silver' : 'Bronze';
            const risk = clvData.get(drawerCustomer.id)?.churnRisk ?? 'Low';
            const clv = clvData.get(drawerCustomer.id)?.predictedCLV ?? 0;
            const lastOrd = drawerCustomerOrders.length > 0
              ? [...drawerCustomerOrders].sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0]
              : null;

            // ORDER DETAIL — rendered directly beneath the selected order's own
            // row inside the All Orders list below (only ever one expanded at a time).
            const selectedOrderDetail = drawerSelectedOrder ? (
              <div className={styles.drawerSection}>
                <div className={styles.drawerSectionTitle}>ORDER DETAIL — {drawerSelectedOrder.orderNumber}</div>
                <div className={styles.drawerInfoGrid}>
                  <div className={styles.drawerInfoCard}>
                    <div className={styles.drawerInfoLabel}>STATUS</div>
                    <div className={styles.drawerInfoValue} style={{ color: '#fff' }}>{drawerSelectedOrder.status.replace(/_/g, ' ')}</div>
                  </div>
                  <div className={styles.drawerInfoCard}>
                    <div className={styles.drawerInfoLabel}>PAYMENT</div>
                    <div className={styles.drawerInfoValue}>{drawerSelectedOrder.paymentMethod}</div>
                  </div>
                  <div className={styles.drawerInfoCard}>
                    <div className={styles.drawerInfoLabel}>DATE</div>
                    <div className={styles.drawerInfoValue}>{new Date(drawerSelectedOrder.createdAt).toLocaleString()}</div>
                  </div>
                  <div className={styles.drawerInfoCard}>
                    <div className={styles.drawerInfoLabel}>CHANNEL</div>
                    <div className={styles.drawerInfoValue}>{drawerSelectedOrder.channel.toLowerCase()}</div>
                  </div>
                  {drawerSelectedOrder.address && (
                    <div className={styles.drawerInfoCard} style={{ gridColumn: 'span 2' }}>
                      <div className={styles.drawerInfoLabel}>DELIVERY ADDRESS</div>
                      <div className={styles.drawerInfoValue}>
                        {drawerSelectedOrder.address.addressLine}{drawerSelectedOrder.address.flat ? `, ${drawerSelectedOrder.address.flat}` : ''}, {drawerSelectedOrder.address.city}, {drawerSelectedOrder.address.state} {drawerSelectedOrder.address.pincode}
                      </div>
                    </div>
                  )}
                </div>

                {/* Status Actions — only the next allowed step (backend enforces the state machine); hidden without the edit permission */}
                {canEdit && (
                <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
                  {NEXT_ORDER_STATUS[drawerSelectedOrder.status] && (
                    <button
                      type="button"
                      disabled={statusSaving}
                      onClick={() => void advanceDrawerOrderStatus(NEXT_ORDER_STATUS[drawerSelectedOrder.status])}
                      style={{ background: '#16A34A', color: '#fff', padding: '9px 18px', borderRadius: 8, fontSize: 13, fontWeight: 700, border: 'none', cursor: statusSaving ? 'wait' : 'pointer', opacity: statusSaving ? 0.6 : 1 }}
                    >
                      {statusSaving ? 'Saving...' : NEXT_ORDER_ACTION_LABEL[drawerSelectedOrder.status]}
                    </button>
                  )}
                  {CANCELLABLE_ORDER_STATUSES.has(drawerSelectedOrder.status) && (
                    <button
                      type="button"
                      disabled={statusSaving}
                      onClick={() => void cancelDrawerOrder()}
                      style={{ background: 'transparent', color: '#F87171', padding: '9px 18px', borderRadius: 8, fontSize: 13, fontWeight: 700, border: '1px solid #F87171', cursor: statusSaving ? 'wait' : 'pointer', opacity: statusSaving ? 0.6 : 1 }}
                    >
                      Cancel Order
                    </button>
                  )}
                </div>
                )}
                {statusError && <p style={{ color: '#FCA5A5', fontSize: 12, marginTop: 8 }}>{statusError}</p>}

                {/* Ordered Products with Costs */}
                {drawerSelectedOrder.items.length > 0 && (
                  <div style={{ marginTop: 12 }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.5)', letterSpacing: 0.8, marginBottom: 8 }}>PRODUCTS ORDERED ({drawerSelectedOrder.items.length})</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {drawerSelectedOrder.items.map((item, idx) => (
                        <div key={`${item.name}-${idx}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: 'rgba(255,255,255,0.05)', borderRadius: 8 }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>{item.name}</div>
                            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>
                              {item.weightKg ? `${item.weightKg} kg` : `Qty: ${item.qty}`}{item.boxType ? ` · ${item.boxType}` : ''}
                            </div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{sym}{item.lineTotal.toLocaleString()}</div>
                            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>{sym}{item.unitPrice.toLocaleString()} × {item.qty}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                    {/* Price Summary */}
                    <div style={{ marginTop: 10, padding: '10px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: 8 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'rgba(255,255,255,0.6)', marginBottom: 4 }}>
                        <span>Subtotal</span><span>{sym}{drawerSelectedOrder.itemTotal.toLocaleString()}</span>
                      </div>
                      {drawerSelectedOrder.discount > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'rgba(255,255,255,0.6)', marginBottom: 4 }}>
                          <span>Discount</span><span>-{sym}{drawerSelectedOrder.discount.toLocaleString()}</span>
                        </div>
                      )}
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'rgba(255,255,255,0.6)', marginBottom: 4 }}>
                        <span>Tax</span><span>{sym}{drawerSelectedOrder.tax.toLocaleString()}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'rgba(255,255,255,0.6)', marginBottom: 4 }}>
                        <span>Delivery</span><span>{sym}{drawerSelectedOrder.deliveryFee.toLocaleString()}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, fontWeight: 700, color: '#fff', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 6, marginTop: 4 }}>
                        <span>Grand Total</span><span>{sym}{drawerSelectedOrder.grandTotal.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Order Timeline */}
                <div style={{ marginTop: 14 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.5)', letterSpacing: 0.8, marginBottom: 8 }}>TIMELINE</div>
                  <div className={styles.drawerTimeline}>
                    {ORDER_STATUS_TIMELINE.map((step, idx) => {
                      const currentIdx = getTimelineIndex(drawerSelectedOrder.status);
                      const isActive = idx <= currentIdx;
                      const isCurrent = idx === currentIdx;
                      // Only the placed date is real — the backend stores no per-stage
                      // timestamps, so later steps never get fabricated dates.
                      const stepState = idx === 0
                        ? `${new Date(drawerSelectedOrder.createdAt).toLocaleDateString()}, ${new Date(drawerSelectedOrder.createdAt).toLocaleTimeString()}`
                        : idx <= currentIdx ? 'Completed' : 'Pending';
                      return (
                        <div key={step} className={`${styles.drawerTimelineItem} ${isActive ? styles.drawerTimelineActive : ''}`}>
                          <div className={`${styles.drawerTimelineDot} ${isActive ? styles.drawerTimelineDotActive : ''} ${isCurrent ? styles.drawerTimelineDotCurrent : ''}`} />
                          <div className={styles.drawerTimelineContent}>
                            <div className={`${styles.drawerTimelineLabel} ${isActive ? styles.drawerTimelineLabelActive : ''}`}>
                              {step.replace(/_/g, ' ')}
                            </div>
                            <div className={styles.drawerTimelineDate}>
                              {stepState}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : null;

            return (
              <div className={styles.drawerContent}>
                {/* Customer Profile Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 0', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                  <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg, #16A34A, #14532D)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                    {drawerCustomer.name ? drawerCustomer.name.charAt(0).toUpperCase() : '👤'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 18, fontWeight: 700, color: '#fff' }}>{drawerCustomer.name ?? '—'}</div>
                    <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', marginTop: 2 }}>{drawerCustomer.phone}</div>
                    {drawerCustomer.email && <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>{drawerCustomer.email}</div>}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                    <span style={{
                      display: 'inline-block', padding: '3px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700,
                      color: '#fff', background: tier === 'Gold' ? '#B8860B' : tier === 'Silver' ? '#9CA3AF' : '#8B6914',
                    }}>
                      {tier}
                    </span>
                  </div>
                </div>

                {/* Customer Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 110px), 1fr))', gap: 10, padding: '16px 0', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                  {[
                    { label: 'ORDERS', value: String(drawerOrderCount) },
                    { label: 'TOTAL SPENT', value: `${sym}${drawerTotalSpent.toLocaleString()}` },
                    { label: 'AOV', value: `${sym}${drawerAOV.toLocaleString()}` },
                    { label: 'PREDICTED CLV', value: `${sym}${clv.toLocaleString()}` },
                  ].map((s) => (
                    <div key={s.label} style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', letterSpacing: 0.8, marginBottom: 4 }}>{s.label}</div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>{s.value}</div>
                    </div>
                  ))}
                </div>

                {/* Customer Info */}
                <div className={styles.drawerSection}>
                  <div className={styles.drawerSectionTitle}>CUSTOMER INFORMATION</div>
                  <div className={styles.drawerInfoGrid}>
                    <div className={styles.drawerInfoCard}>
                      <div className={styles.drawerInfoLabel}>FULL NAME</div>
                      <div className={styles.drawerInfoValue}>{drawerCustomer.name ?? '—'}</div>
                    </div>
                    <div className={styles.drawerInfoCard}>
                      <div className={styles.drawerInfoLabel}>PHONE</div>
                      <div className={styles.drawerInfoValue}>{drawerCustomer.phone || '—'}</div>
                    </div>
                    <div className={styles.drawerInfoCard}>
                      <div className={styles.drawerInfoLabel}>EMAIL</div>
                      <div className={styles.drawerInfoValue}>{drawerCustomer.email ?? '—'}</div>
                    </div>
                    <div className={styles.drawerInfoCard}>
                      <div className={styles.drawerInfoLabel}>CUSTOMER ID</div>
                      <div className={styles.drawerInfoValue}>{customerNo(custIndex, drawerCustomer.id)}</div>
                    </div>
                    <div className={styles.drawerInfoCard}>
                      <div className={styles.drawerInfoLabel}>REGISTERED</div>
                      <div className={styles.drawerInfoValue}>{new Date(drawerCustomer.registeredAt).toLocaleDateString()}</div>
                    </div>
                    <div className={styles.drawerInfoCard}>
                      <div className={styles.drawerInfoLabel}>COUNTRY</div>
                      <div className={styles.drawerInfoValue}>{config.name}</div>
                    </div>
                    <div className={styles.drawerInfoCard}>
                      <div className={styles.drawerInfoLabel}>STATUS</div>
                      <div className={styles.drawerInfoValue} style={{ color: '#fff' }}>
                        {drawerOrderCount >= 2 ? 'Active' : 'Inactive'}
                      </div>
                    </div>
                    <div className={styles.drawerInfoCard}>
                      <div className={styles.drawerInfoLabel}>TYPE</div>
                      <div className={styles.drawerInfoValue}>{drawerCustomer.customerType ?? 'B2C'}</div>
                    </div>
                  </div>
                </div>

                {/* Orders List */}
                <div className={styles.drawerSection}>
                  <div className={styles.drawerSectionTitle}>ALL ORDERS ({drawerOrderCount})</div>
                  {drawerCustomerOrders.length === 0 ? (
                    <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', padding: 12 }}>No orders found.</div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {[...drawerCustomerOrders].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).map((co) => (
                        <Fragment key={co.id}>
                          <div
                            onClick={() => void openDrawerOrder(co.id)}
                            style={{
                              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                              padding: '10px 12px', borderRadius: 8, cursor: 'pointer',
                              background: drawerSelectedOrder?.id === co.id ? 'rgba(22,163,74,0.2)' : 'rgba(255,255,255,0.05)',
                              border: drawerSelectedOrder?.id === co.id ? '1px solid rgba(22,163,74,0.4)' : '1px solid transparent',
                              transition: 'all 0.15s',
                            }}
                          >
                            <div>
                              <div style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>{co.orderNumber}</div>
                              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>
                                {new Date(co.createdAt).toLocaleDateString()} · {co.channel.toLowerCase()}
                              </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{sym}{co.grandTotal.toLocaleString()}</div>
                              <div style={{ fontSize: 11, color: '#fff', marginTop: 2 }}>{co.status.replace(/_/g, ' ')}</div>
                            </div>
                          </div>
                          {drawerSelectedOrder && drawerSelectedOrder.id === co.id && selectedOrderDetail}
                        </Fragment>
                      ))}
                    </div>
                  )}
                </div>

                {/* Previous Orders Summary */}
                {drawerCustomerOrders.length > 1 && (
                  <div className={styles.drawerSection}>
                    <div className={styles.drawerSectionTitle}>PREVIOUS ORDERS ({drawerCustomerOrders.length - 1})</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {[...drawerCustomerOrders]
                        .filter(o => !drawerSelectedOrder || o.id !== drawerSelectedOrder.id)
                        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
                        .map((co) => (
                          <div
                            key={co.id}
                            onClick={() => void openDrawerOrder(co.id)}
                            style={{
                              padding: '10px 12px', borderRadius: 8, cursor: 'pointer',
                              background: 'rgba(255,255,255,0.05)', border: '1px solid transparent',
                              transition: 'all 0.15s',
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div>
                                <div style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>{co.orderNumber}</div>
                                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>
                                  {new Date(co.createdAt).toLocaleDateString()} · {co.channel.toLowerCase()}
                                </div>
                              </div>
                              <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{sym}{co.grandTotal.toLocaleString()}</div>
                                <div style={{ fontSize: 11, color: '#fff', marginTop: 2 }}>{co.status.replace(/_/g, ' ')}</div>
                              </div>
                            </div>
                          </div>
                        ))
                      }
                    </div>
                  </div>
                )}
              </div>
            );
          })()}
        </SideDrawer>
      )}
      <TrustBanner />
    </div>
  );
}
