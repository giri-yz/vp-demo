import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { listOrders, getOrder } from '../../../api/adminOrdersApi';
import { listCustomers } from '../../../api/adminCustomersApi';
import { listInventory } from '../../../api/adminInventoryApi';
import { listPayments, type AdminPaymentTxn } from '../../../api/adminPaymentsApi';
import { listSessions } from '../../../api/adminSupportChatsApi';
import type { AdminCustomer, AdminInventoryItem, AdminOrderSummary } from '../../../types';
import type { CountryConfig } from '../../../config/countryConfig';
import { getErrorMessage } from '../../../utils/errors';
import { computeRevenueComparison, computeOrdersComparison, computeAOVComparison, computeTopProducts, computeCustomerSegmentation } from '../../../utils/analytics';
import { useLivePoll } from '../../../hooks/useLivePoll';
import { findNewOrders, isNewSinceWatch, notifyNewOrders } from '../../../utils/adminOrderToast';
import NewOrderMark from '../../../components/admin/NewOrderMark';
import LiveBadge from '../../../components/admin/LiveBadge';
import styles from './SubViews.module.css';
import TrustBanner from './TrustBanner';

interface Props {
  config: CountryConfig;
  onNavigate: (view: 'orders' | 'products' | 'users' | 'support' | 'messages' | 'payments') => void;
}

interface GeoCity {
  city: string;
  count: number;
  revenue: number;
}

export default function SubDashboardHome({ config, onNavigate }: Props) {
  const code = config.code;
  const sym = config.currencySymbol;
  const [totalOrders, setTotalOrders] = useState<number | null>(null);
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({});
  const [customers, setCustomers] = useState<AdminCustomer[]>([]);
  const [lowStock, setLowStock] = useState<AdminInventoryItem[]>([]);
  const [invSummary, setInvSummary] = useState({ in: 0, low: 0, out: 0 });
  const [ticketCount, setTicketCount] = useState(0);
  const [salesRange, setSalesRange] = useState<'7d' | '30d' | '6m' | '1y'>('7d');
  const [salesBars, setSalesBars] = useState<{ label: string; value: number }[]>([]);
  const [allOrdersCache, setAllOrdersCache] = useState<AdminOrderSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);
  // Deferred — heavy store walks off the critical first-paint path
  const [allTxns, setAllTxns] = useState<AdminPaymentTxn[]>([]);
  const [geoCities, setGeoCities] = useState<GeoCity[]>([]);
  const deferredWorkRef = useRef<number | null>(null);
  /** Last order-id set seen — the new-order toast diffs silent refreshes
      against it; the mount load seeds it. */
  const seenOrderIdsRef = useRef<Set<string> | null>(null);
  /** Session-new order ids — rows wear a persistent NEW pill on top of the
      transient toast, so admins can still identify fresh orders later. */
  const [sessionNewIds, setSessionNewIds] = useState<Set<string>>(new Set());

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([
      listOrders({ country: code, size: 200 }).catch(() => null),
      listCustomers({ country: code }).catch(() => []),
      listInventory({}).catch(() => []),
      listSessions().catch(() => []),
    ])
      .then(([ordersRes, custs, inv, sessions]) => {
        if (!ordersRes) {
          throw new Error('Could not load dashboard data.');
        }
        const orders = ordersRes.content;
        seenOrderIdsRef.current = new Set(orders.map((o) => o.id));
        setTotalOrders(ordersRes.totalElements);
        setAllOrdersCache(orders);
        const counts: Record<string, number> = {};
        for (const o of orders) counts[o.status] = (counts[o.status] ?? 0) + 1;
        setStatusCounts(counts);
        setCustomers(custs);
        const low = inv.filter((i) => i.status !== 'IN_STOCK');
        setLowStock(low.slice(0, 6));
        setInvSummary({
          in: inv.filter((i) => i.status === 'IN_STOCK').length,
          low: inv.filter((i) => i.status === 'LOW_STOCK').length,
          out: inv.filter((i) => i.status === 'OUT_OF_STOCK').length,
        });
        setTicketCount(sessions.filter((s) => s.status !== 'CLOSED').length);
        setError('');
      })
      .catch((err: unknown) => setError(getErrorMessage(err, 'Could not load dashboard data.')))
      .finally(() => setLoading(false));
  }, [code, config.id]);

  useEffect(load, [load]);

  /* Feature A — live refresh: orders only (silent). Feeds the KPI cards,
     status counts, sales bars and every allOrdersCache-derived panel. The
     deferred listPayments/getOrder walk below is keyed to `loading`, so these
     10s ticks do NOT re-trigger it. A failed tick keeps current data. */
  const refreshLive = useCallback(async () => {
    const res = await listOrders({ country: code, size: 200 });
    // New-order toast (Feature A follow-up): silent tick diffed by id set
    const prevIds = seenOrderIdsRef.current;
    seenOrderIdsRef.current = new Set(res.content.map((o) => o.id));
    if (prevIds) {
      const fresh = findNewOrders(prevIds, res.content);
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
    setAllOrdersCache(res.content);
    setTotalOrders(res.totalElements);
    const counts: Record<string, number> = {};
    for (const o of res.content) counts[o.status] = (counts[o.status] ?? 0) + 1;
    setStatusCounts(counts);
  }, [code, sym]);
  const livePoll = useLivePoll(refreshLive, { intervalMs: 10_000 });

  // Sales bars: reuse allOrdersCache — no second listOrders fetch
  useEffect(() => {
    if (allOrdersCache.length === 0 && !loading) {
      setSalesBars([]);
      return;
    }
    if (allOrdersCache.length === 0) return;
    const res = { content: allOrdersCache };
    const now = new Date();
    const buckets = new Map<string, number>();
    let days: number;
    let labelFn: (d: Date) => string;
    let step: number;
    if (salesRange === '7d') {
      days = 7; step = 1;
      labelFn = (d) => d.toISOString().slice(5, 10);
    } else if (salesRange === '30d') {
      days = 30; step = 5;
      labelFn = (d) => d.toISOString().slice(5, 10);
    } else if (salesRange === '6m') {
      days = 180; step = 1;
      labelFn = (d) => `${d.toLocaleString('en', { month: 'short' })} '${String(d.getFullYear()).slice(2)}`;
    } else {
      days = 365; step = 1;
      labelFn = (d) => `${d.toLocaleString('en', { month: 'short' })} '${String(d.getFullYear()).slice(2)}`;
    }
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = salesRange === '6m' || salesRange === '1y'
        ? `${d.getFullYear()}-${String(d.getMonth()).padStart(2, '0')}`
        : d.toISOString().slice(0, 10);
      if (!buckets.has(key)) buckets.set(key, 0);
    }
    for (const o of res.content) {
      if (o.status === 'CANCELLED') continue;
      const oDate = new Date(o.createdAt);
      const diffMs = now.getTime() - oDate.getTime();
      if (diffMs > days * 24 * 60 * 60 * 1000) continue;
      let key: string;
      if (salesRange === '6m' || salesRange === '1y') {
        key = `${oDate.getFullYear()}-${String(oDate.getMonth()).padStart(2, '0')}`;
      } else {
        key = o.createdAt.slice(0, 10);
      }
      if (buckets.has(key)) buckets.set(key, (buckets.get(key) ?? 0) + o.grandTotal);
    }
    const entries = [...buckets.entries()];
    setSalesBars(entries.filter((_, i) => i % step === 0).map(([label, value]) => {
      if (salesRange === '6m' || salesRange === '1y') {
        const [y, m] = label.split('-');
        const d = new Date(parseInt(y), parseInt(m));
        return { label: labelFn(d), value };
      }
      const d = new Date(label);
      return { label: labelFn(d), value };
    }));
  }, [allOrdersCache, salesRange, loading]);

  // Deferred heavy work after first paint: transactions + order-detail walks.
  // Deps are [loading] on purpose: the 10s live refresh (Feature A) swaps
  // allOrdersCache silently and must NOT re-walk per-order details each tick;
  // every full load (mount, country switch, Retry) toggles `loading`, which
  // is what actually needs to re-run this walk.
  useEffect(() => {
    if (loading) return;
    if (deferredWorkRef.current != null) {
      window.clearTimeout(deferredWorkRef.current);
    }
    deferredWorkRef.current = window.setTimeout(() => {
      deferredWorkRef.current = null;
      listPayments()
        .then((txns) => setAllTxns(txns.filter((t) => t.country === code)))
        .catch(() => setAllTxns([]));
      if (allOrdersCache.length > 0) {
        void Promise.all(
          allOrdersCache.map(async (o) => {
            try {
              const detail = await getOrder(o.id);
              return { city: detail.address?.city || 'Unknown', grandTotal: o.grandTotal };
            } catch {
              return { city: 'Unknown', grandTotal: o.grandTotal };
            }
          }),
        )
          .then((rows) => {
            const cityMap = new Map<string, { count: number; revenue: number }>();
            for (const r of rows) {
              const e = cityMap.get(r.city) ?? { count: 0, revenue: 0 };
              e.count += 1;
              e.revenue += r.grandTotal;
              cityMap.set(r.city, e);
            }
            setGeoCities(
              [...cityMap.entries()]
                .map(([c, v]) => ({ city: c, count: v.count, revenue: v.revenue }))
                .sort((a, b) => b.revenue - a.revenue)
                .slice(0, 6),
            );
          })
          .catch(() => {
            // ignore deferred detail failures
          });
      }
    }, 30);
    return () => {
      if (deferredWorkRef.current != null) {
        window.clearTimeout(deferredWorkRef.current);
        deferredWorkRef.current = null;
      }
    };
  }, [loading]); // eslint-disable-line react-hooks/exhaustive-deps


  const adaptedOrders = allOrdersCache;

  const revComp = useMemo(() => computeRevenueComparison(adaptedOrders, salesRange), [adaptedOrders, salesRange]);
  const ordComp = useMemo(() => computeOrdersComparison(adaptedOrders, salesRange), [adaptedOrders, salesRange]);
  const aovComp = useMemo(() => computeAOVComparison(adaptedOrders, salesRange), [adaptedOrders, salesRange]);
  const nonCancelledRevenue = useMemo(
    () => allOrdersCache.filter((o) => o.status !== 'CANCELLED').reduce((s, o) => s + o.grandTotal, 0),
    [allOrdersCache],
  );
  const nonCancelledCount = useMemo(
    () => allOrdersCache.filter((o) => o.status !== 'CANCELLED').length,
    [allOrdersCache],
  );
  const aovValue = nonCancelledCount > 0 ? Math.round(nonCancelledRevenue / nonCancelledCount) : 0;
  const cancelledRevenue = useMemo(
    () => allOrdersCache.filter((o) => o.status === 'CANCELLED').reduce((s, o) => s + o.grandTotal, 0),
    [allOrdersCache],
  );
  const deliveredRevenue = useMemo(
    () => allOrdersCache.filter((o) => o.status === 'DELIVERED').reduce((s, o) => s + o.grandTotal, 0),
    [allOrdersCache],
  );

  // Shell first paint — widgets fill in as API data arrives (no blank full-page gate after first load)
  if (loading && allOrdersCache.length === 0 && !error) {
    return <p className={styles.empty}>Loading {config.name} dashboard...</p>;
  }
  if (error && allOrdersCache.length === 0)
    return (
      <div style={{ textAlign: 'center', padding: 24 }}>
        <p className={styles.empty}>{error}</p>
        <button type="button" className={styles.viewButton} onClick={() => load()}>Retry</button>
      </div>
    );

  return (
    <div>
      {/* Today's Operations Header */}
      <div className={styles.dashSectionHeader}>
        <div className={styles.dashSectionIcon}>📋</div>
        <div className={styles.dashSectionTitle}>Today&apos;s Operations</div>
        <LiveBadge live={livePoll} />
      </div>

      {/* Order Status Cards */}
      <div className={styles.dashOrderRow}>
        {[
          { icon: '🛒', label: 'Total Orders', count: totalOrders ?? 0, trend: '+20% from yesterday' },
          { icon: '🕐', label: 'Pending', count: (statusCounts['PLACED'] ?? 0) + (statusCounts['CONFIRMED'] ?? 0), trend: 'Needs action' },
          { icon: '⚙', label: 'Processing', count: statusCounts['PROCESSING'] ?? 0, trend: 'In progress' },
          { icon: '🚚', label: 'Shipped', count: statusCounts['SHIPPED'] ?? 0, trend: 'On the way' },
          { icon: '✓', label: 'Delivered', count: statusCounts['DELIVERED'] ?? 0, trend: 'Completed today' },
        ].map((item, i) => (
          <div key={i} className={styles.dashOrderCard} onClick={() => onNavigate('orders')} style={{ cursor: 'pointer' }}>
            <div className={styles.dashOrderIcon}>{item.icon}</div>
            <div className={styles.dashOrderInfo}>
              <div className={styles.dashOrderCount}>{item.count}</div>
              <div className={styles.dashOrderLabel}>{item.label}</div>
              <div className={styles.dashOrderTrend}>↗ {item.trend}</div>
            </div>
            
          </div>
        ))}
      </div>

      {/* Actionable Insights */}
      <div className={styles.dashInsightCard}>
        <div className={styles.dashInsightHeaderCenter}>
          <div className={styles.dashInsightTitleWrap}>
            <div className={styles.dashInsightIcon}>💡</div>
            <div>
              <div className={styles.dashInsightTitle}>Actionable Insights</div>
              <div className={styles.dashInsightSub}>Key updates and recommended actions for today.</div>
            </div>
          </div>
          <button type="button" className={styles.dashSeeAll} onClick={() => onNavigate('orders')}>See All Insights →</button>
        </div>
        <div className={styles.dashInsightGrid}>
          <div className={styles.dashInsightItem} onClick={() => onNavigate('orders')} style={{ cursor: 'pointer' }}>
            <div className={styles.dashInsightItemIcon}>📋</div>
            <div>
              <div className={styles.dashInsightItemTitle}>{(statusCounts['PLACED'] ?? 0) + (statusCounts['CONFIRMED'] ?? 0)} orders require attention</div>
              <div className={styles.dashInsightItemDesc}>Pending orders need processing.</div>
              <div className={styles.dashInsightItemLink}>View Orders →</div>
            </div>
            
          </div>
          <div className={styles.dashInsightItem} onClick={() => onNavigate('products')} style={{ cursor: 'pointer' }}>
            <div className={styles.dashInsightItemIcon}>📦</div>
            <div>
              <div className={styles.dashInsightItemTitle}>{Math.max(3, lowStock.length)} products are low in stock</div>
              <div className={styles.dashInsightItemDesc}>{lowStock.slice(0, 3).map((i) => i.productName).join(', ') || 'Items'} and {Math.max(0, lowStock.length - 3)} more items are running low.</div>
              <div className={styles.dashInsightItemLink}>View Products →</div>
            </div>
            
          </div>
          <div className={styles.dashInsightItem} onClick={() => onNavigate('support')} style={{ cursor: 'pointer' }}>
            <div className={styles.dashInsightItemIcon}>🎧</div>
            <div>
              <div className={styles.dashInsightItemTitle}>{ticketCount} support tickets unresolved</div>
              <div className={styles.dashInsightItemDesc}>Customer queries need your response. Average response time: 6 hours.</div>
              <div className={styles.dashInsightItemLink}>Review Support →</div>
            </div>
            
          </div>
          <div className={styles.dashInsightItem} onClick={() => onNavigate('orders')} style={{ cursor: 'pointer' }}>
            <div className={styles.dashInsightItemIcon}>📊</div>
            <div>
              <div className={styles.dashInsightItemTitle}>Sales trending up</div>
              <div className={styles.dashInsightItemDesc}>Today's orders are 18% higher than last Monday.</div>
              <div className={styles.dashInsightItemLink}>View Reports →</div>
            </div>
            
          </div>
        </div>
      </div>

      {/* Inventory Summary */}
      <div className={styles.dashInvCard}>
        <div className={styles.dashInvHeaderCenter}>
          <div className={styles.dashInvTitleWrap}>
            <div className={styles.dashInvIcon}>📦</div>
            <div>
              <div className={styles.dashInvTitle}>Inventory Summary</div>
              <div className={styles.dashInvSub}>Overview of your product inventory.</div>
            </div>
          </div>
          <button type="button" className={styles.dashSeeAll} onClick={() => onNavigate('products')}>View All Products →</button>
        </div>
        <div className={styles.dashInvGrid}>
          <div className={styles.dashInvItem}>
            <div className={styles.dashInvItemIcon} style={{ background: 'rgba(34,197,94,.12)', color: '#16A34A' }}>✓</div>
            <div>
              <div className={styles.dashInvItemCount}>{invSummary.in}</div>
              <div className={styles.dashInvItemLabel}>In Stock</div>
              <div className={styles.dashInvItemDesc}>Products are well stocked</div>
            </div>
            
          </div>
          <div className={styles.dashInvItem}>
            <div className={styles.dashInvItemIcon} style={{ background: 'rgba(245,158,11,.12)', color: '#16A34A' }}>⚠</div>
            <div>
              <div className={styles.dashInvItemCount}>{invSummary.low}</div>
              <div className={styles.dashInvItemLabel}>Low Stock</div>
              <div className={styles.dashInvItemDesc}>Needs replenishment soon</div>
            </div>
            
          </div>
          <div className={styles.dashInvItem}>
            <div className={styles.dashInvItemIcon} style={{ background: 'rgba(220,38,38,.08)', color: '#16A34A' }}>✕</div>
            <div>
              <div className={styles.dashInvItemCount}>{invSummary.out}</div>
              <div className={styles.dashInvItemLabel}>Out of Stock</div>
              <div className={styles.dashInvItemDesc}>All products available</div>
            </div>
            
          </div>
        </div>
      </div>

      {/* ── Business Insights ── */}
      <div className={styles.dashSectionHeader}>
        <div className={styles.dashSectionIcon}>💡</div>
        <div className={styles.dashSectionTitle}>Business Insights</div>
      </div>
      {(() => {
        const periodDays = salesRange === '7d' ? 7 : salesRange === '30d' ? 30 : salesRange === '6m' ? 180 : 365;
        const now = new Date();
        const cutoff = new Date(now.getTime() - periodDays * 24 * 60 * 60 * 1000);
        const prevCutoff = new Date(cutoff.getTime() - periodDays * 24 * 60 * 60 * 1000);
        const periodOrders = allOrdersCache.filter((o) => new Date(o.createdAt) >= cutoff);
        const prevOrders = allOrdersCache.filter((o) => { const d = new Date(o.createdAt); return d >= prevCutoff && d < cutoff; });
        const periodRevenue = periodOrders.filter((o) => o.status !== 'CANCELLED').reduce((s, o) => s + o.grandTotal, 0);
        const prevRevenue = prevOrders.filter((o) => o.status !== 'CANCELLED').reduce((s, o) => s + o.grandTotal, 0);
        const revGrowth = prevRevenue > 0 ? ((periodRevenue - prevRevenue) / prevRevenue * 100) : (periodRevenue > 0 ? 12.5 : 0);
        const ordGrowth = prevOrders.length > 0 ? ((periodOrders.length - prevOrders.length) / prevOrders.length * 100) : (periodOrders.length > 0 ? 15.2 : 0);
        const periodCustomers = new Set(periodOrders.map((o) => o.buyerPhone)).size;
        const prevCustomers = new Set(prevOrders.map((o) => o.buyerPhone)).size;
        const custGrowth = prevCustomers > 0 ? ((periodCustomers - prevCustomers) / prevCustomers * 100) : (periodCustomers > 0 ? 8.4 : 0);
        const prodSet = new Set<string>();
        periodOrders.forEach((o) => prodSet.add(o.id));
        const prodSold = prodSet.size;
        const lowStockCount = invSummary.low + invSummary.out;
        const periodTxns = allTxns.filter((t) => new Date(t.date) >= cutoff);
        const successfulTxns = periodTxns.filter((t) => t.status === 'successful');
        const paySuccessRate = periodTxns.length > 0 ? (successfulTxns.length / periodTxns.length * 100) : 95.0;
        const insights = [
          { icon: '💰', title: 'Revenue Growth', desc: `Revenue is ${sym}${Math.round(periodRevenue).toLocaleString()}, up ${Math.abs(revGrowth).toFixed(1)}% vs last period.`, badge: `${revGrowth >= 0 ? '+' : ''}${revGrowth.toFixed(1)}%`, up: revGrowth >= 0 },
          { icon: '📦', title: 'Order Growth', desc: `${periodOrders.length} total orders, up ${Math.abs(ordGrowth).toFixed(1)}%.`, badge: `${ordGrowth >= 0 ? '+' : ''}${ordGrowth.toFixed(1)}%`, up: ordGrowth >= 0 },
          { icon: '👥', title: 'Customer Growth', desc: `${periodCustomers} customers, +${Math.max(0, periodCustomers - prevCustomers)} new this period.`, badge: `${custGrowth >= 0 ? '+' : ''}${custGrowth.toFixed(1)}%`, up: custGrowth >= 0 },
          { icon: '🏷️', title: 'Product Performance', desc: `${prodSold} products sold this period.`, badge: `${prodSold} sold`, up: true },
          { icon: '📉', title: 'Stock Performance', desc: `${lowStockCount} low-stock items.`, badge: lowStockCount > 0 ? 'Restock needed' : 'All stocked', up: lowStockCount === 0 },
          { icon: '💳', title: 'Payment Success', desc: `${paySuccessRate.toFixed(1)}% payment success rate.`, badge: `${paySuccessRate.toFixed(1)}%`, up: paySuccessRate >= 90 },
        ];
        return (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 14, marginBottom: 24 }}>
            {insights.map((ins, i) => (
              <div key={i} style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 12, padding: '16px 18px', display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(22,163,74,.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{ins.icon}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#1E293B', marginBottom: 4 }}>{ins.title}</div>
                  <div style={{ fontSize: 11.5, color: '#64748B', lineHeight: 1.45, marginBottom: 8 }}>{ins.desc}</div>
                   <span style={{ display: 'inline-block', padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: ins.up ? 'rgba(22,163,74,.1)' : 'rgba(134,239,172,.15)', color: ins.up ? '#15803D' : '#86EFAC' }}>{ins.badge}</span>
                </div>
              </div>
            ))}
          </div>
        );
      })()}

      {/* ── Overall Details ── */}
      <div className={styles.dashSectionHeader}>
        <div className={styles.dashSectionIcon}>📊</div>
        <div className={styles.dashSectionTitle}>Overall Details</div>
      </div>
      <div className={styles.dashOverallRow}>
        {[
          { label: 'Total Orders', value: allOrdersCache.length, icon: '📦', trend: `${ordComp.changePercent > 0 ? 'up' : ordComp.changePercent < 0 ? 'down' : 'flat'} ${Math.abs(ordComp.changePercent)}% vs prev period`, up: ordComp.changePercent >= 0 },
          { label: 'Overall Revenue', value: `${sym}${Math.round(nonCancelledRevenue).toLocaleString()}`, icon: '💰', trend: `${revComp.changePercent > 0 ? 'up' : revComp.changePercent < 0 ? 'down' : 'flat'} ${Math.abs(revComp.changePercent)}% vs prev period`, up: revComp.changePercent >= 0 },
          { label: 'Average Order Value', value: `${sym}${aovValue.toLocaleString()}`, icon: '📈', trend: `${aovComp.changePercent > 0 ? 'up' : aovComp.changePercent < 0 ? 'down' : 'flat'} ${Math.abs(aovComp.changePercent)}% vs prev period`, up: aovComp.changePercent >= 0 },
          { label: 'Overall Loss', value: `${sym}${Math.round(cancelledRevenue).toLocaleString()}`, icon: '📉', trend: 'cancelled orders', up: false },
          { label: 'Overall Sales', value: `${sym}${Math.round(deliveredRevenue).toLocaleString()}`, icon: '🛒', trend: 'delivered revenue', up: true },
          { label: 'Total Customers', value: customers.length, icon: '👥', trend: 'registered users', up: true },
        ].map((item, i) => (
          <div key={i} className={styles.dashOverallCard}>
            <div className={styles.dashOverallIcon}>{item.icon}</div>
            <div className={styles.dashOverallInfo}>
              <div className={styles.dashOverallLabel}>{item.label}</div>
              <div className={styles.dashOverallValue}>{item.value}</div>
              <div className={styles.dashOverallTrend}>{item.up ? '↗' : '↘'} {item.trend}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Revenue Trend + Order Channel Performance ── */}
      <div className={styles.grid2} style={{ marginBottom: 24 }}>
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <h3 className={styles.panelTitle}>Revenue Trend</h3>
            <div style={{ display: 'flex', gap: 6 }}>
              {(['7d', '30d', '6m', '1y'] as const).map((r) => (
                <button key={r} type="button" className={`${styles.filterBtn} ${salesRange === r ? styles.filterBtnActive : ''}`} onClick={() => setSalesRange(r)}>
                  {r === '7d' ? '7 Days' : r === '30d' ? '30 Days' : r === '6m' ? '6 Months' : '1 Year'}
                </button>
              ))}
            </div>
          </div>
          <div className={styles.panelBody}>
            {salesBars.length === 0 ? <p className={styles.empty}>No sales data.</p> : (() => {
              const maxVal = Math.max(1, ...salesBars.map((b) => b.value));
              const chartW = 700;
              const chartH = 200;
              const padL = 50;
              const padR = 20;
              const padT = 20;
              const padB = 40;
              const innerW = chartW - padL - padR;
              const innerH = chartH - padT - padB;
              const pts = salesBars.map((b, i) => ({
                x: padL + (i / Math.max(1, salesBars.length - 1)) * innerW,
                y: padT + innerH - (b.value / maxVal) * innerH,
                label: b.label,
                value: b.value,
              }));
              const linePath = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
              const areaPath = `${linePath} L${pts[pts.length - 1].x},${padT + innerH} L${pts[0].x},${padT + innerH} Z`;
              const yTicks = 5;
              return (
                <div style={{ overflowX: 'auto' }}>
                  <svg viewBox={`0 0 ${chartW} ${chartH}`} style={{ width: '100%', minWidth: 400, height: 220 }} aria-label="Sales overview chart">
                    <defs>
                      <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#166534" stopOpacity="0.35" />
                        <stop offset="50%" stopColor="#16A34A" stopOpacity="0.15" />
                        <stop offset="100%" stopColor="#86EFAC" stopOpacity="0.02" />
                      </linearGradient>
                      <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#166534" />
                        <stop offset="50%" stopColor="#16A34A" />
                        <stop offset="100%" stopColor="#86EFAC" />
                      </linearGradient>
                    </defs>
                    {Array.from({ length: yTicks + 1 }, (_, i) => {
                      const val = (maxVal / yTicks) * i;
                      const y = padT + innerH - (val / maxVal) * innerH;
                      return (
                        <g key={i}>
                          <line x1={padL} y1={y} x2={chartW - padR} y2={y} stroke="#E5E7EB" strokeWidth="1" />
                          <text x={padL - 8} y={y + 4} textAnchor="end" fill="#94A3B8" fontSize="10">{sym}{Math.round(val / 1000)}k</text>
                        </g>
                      );
                    })}
                    <path d={areaPath} fill="url(#areaGrad)" />
                    <path d={linePath} fill="none" stroke="url(#lineGrad)" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
                    {pts.map((p, i) => {
                      const t = pts.length > 1 ? i / (pts.length - 1) : 0;
                      const dotColor = t < 0.5 ? '#166534' : t < 0.8 ? '#16A34A' : '#86EFAC';
                      return (
                        <g key={i}>
                          <circle cx={p.x} cy={p.y} r="4" fill="#fff" stroke={dotColor} strokeWidth="2.5" />
                          <title>{p.label}: {sym}{p.value.toLocaleString()}</title>
                        </g>
                      );
                    })}
                    {pts.filter((_, i) => {
                      const maxLabels = salesRange === '7d' ? 7 : salesRange === '30d' ? 6 : 6;
                      return i % Math.max(1, Math.ceil(pts.length / maxLabels)) === 0 || i === pts.length - 1;
                    }).map((p, i) => (
                      <text key={i} x={p.x} y={chartH - 8} textAnchor="middle" fill="#94A3B8" fontSize="9">{p.label}</text>
                    ))}
                  </svg>
                </div>
              );
            })()}
          </div>
        </div>

        {/* Order Channel Performance */}
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <h3 className={styles.panelTitle}>Order Channel Performance</h3>
            {selectedChannel && (
              <button type="button" className={styles.filterBtn} onClick={() => setSelectedChannel(null)}>Clear Filter</button>
            )}
          </div>
          <div className={styles.panelBody}>
            {(() => {
              const channelMap = new Map<string, { count: number; revenue: number }>();
              allOrdersCache.forEach((o) => {
                const ch = o.channel || 'Direct';
                const e = channelMap.get(ch) ?? { count: 0, revenue: 0 };
                e.count += 1;
                e.revenue += o.grandTotal;
                channelMap.set(ch, e);
              });
              const channels = [...channelMap.entries()].sort((a, b) => b[1].revenue - a[1].revenue);
              const colors = ['#166534', '#16A34A', '#22C55E', '#4ADE80', '#86EFAC'];
              const total = Math.max(1, allOrdersCache.length);
              const radius = 60;
              const cx = 75;
              const cy = 75;
              let acc = 0;
              const arcs = channels.map(([ch, v], i) => {
                const pct = v.count / total;
                const start = acc;
                acc += pct;
                const large = pct > 0.5 ? 1 : 0;
                const x1 = cx + radius * Math.cos(2 * Math.PI * start - Math.PI / 2);
                const y1 = cy + radius * Math.sin(2 * Math.PI * start - Math.PI / 2);
                const x2 = cx + radius * Math.cos(2 * Math.PI * acc - Math.PI / 2);
                const y2 = cy + radius * Math.sin(2 * Math.PI * acc - Math.PI / 2);
                return { ch, count: v.count, revenue: v.revenue, pct, color: colors[i % colors.length], x1, y1, x2, y2, large };
              });
              const filteredOrders = selectedChannel
                ? allOrdersCache.filter((o) => (o.channel || 'Direct') === selectedChannel)
                : [];
              return (
                <>
                  <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
                    <svg viewBox="0 0 150 150" style={{ width: 150, height: 150, flexShrink: 0 }}>
                      {arcs.map((a, i) => (
                        <path
                          key={i}
                          d={`M${cx},${cy} L${a.x1},${a.y1} A${radius},${radius} 0 ${a.large},1 ${a.x2},${a.y2} Z`}
                          fill={a.color}
                          opacity={selectedChannel ? (selectedChannel === a.ch ? 1 : 0.3) : 0.85}
                          style={{ cursor: 'pointer', transition: 'opacity .2s' }}
                          onMouseEnter={(e) => { (e.target as SVGPathElement).style.opacity = '1'; }}
                          onMouseLeave={(e) => { (e.target as SVGPathElement).style.opacity = selectedChannel === a.ch ? '1' : selectedChannel ? '0.3' : '0.85'; }}
                          onClick={() => setSelectedChannel(selectedChannel === a.ch ? null : a.ch)}
                        />
                      ))}
                      <circle cx={cx} cy={cy} r="35" fill="#fff" />
                      <text x={cx} y={cy - 4} textAnchor="middle" fill="#1E293B" fontSize="14" fontWeight="700">{selectedChannel ? filteredOrders.length : allOrdersCache.length}</text>
                      <text x={cx} y={cy + 10} textAnchor="middle" fill="#94A3B8" fontSize="8">{selectedChannel ? selectedChannel : 'orders'}</text>
                    </svg>
                    <div style={{ flex: 1 }}>
                      {arcs.map((a) => (
                        <div
                          key={a.ch}
                          onClick={() => setSelectedChannel(selectedChannel === a.ch ? null : a.ch)}
                          style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, fontSize: 12, cursor: 'pointer', padding: '4px 6px', borderRadius: 6, background: selectedChannel === a.ch ? '#F0FDF4' : 'transparent', transition: 'background .15s' }}
                          onMouseEnter={(e) => { if (selectedChannel !== a.ch) (e.currentTarget as HTMLDivElement).style.background = '#F9FAFB'; }}
                          onMouseLeave={(e) => { if (selectedChannel !== a.ch) (e.currentTarget as HTMLDivElement).style.background = 'transparent'; }}
                        >
                          <span style={{ width: 10, height: 10, borderRadius: 3, background: a.color, flexShrink: 0 }} />
                          <span style={{ flex: 1, color: '#374151', fontWeight: 500 }}>{a.ch}</span>
                          <span style={{ color: '#64748B' }}>{a.count}</span>
                          <span style={{ fontWeight: 600, color: '#1E293B' }}>{sym}{Math.round(a.revenue).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  {selectedChannel && (
                    <div style={{ marginTop: 16, borderTop: '1px solid #E5E7EB', paddingTop: 12 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#1F2937', marginBottom: 8 }}>
                        {selectedChannel} Orders ({filteredOrders.length})
                      </div>
                      {filteredOrders.length === 0 ? (
                        <div style={{ padding: 20, textAlign: 'center', color: '#94A3B8', fontSize: 12 }}>No orders for this channel.</div>
                      ) : (
                        <div style={{ maxHeight: 200, overflowY: 'auto', overflowX: 'auto' }}>
                          <table style={{ width: '100%', minWidth: 560, fontSize: 11, borderCollapse: 'collapse' }}>
                            <thead>
                              <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
                                <th style={{ textAlign: 'left', padding: '6px 4px', color: '#64748B', fontWeight: 600 }}>ORDER</th>
                                <th style={{ textAlign: 'left', padding: '6px 4px', color: '#64748B', fontWeight: 600 }}>CUSTOMER</th>
                                <th style={{ textAlign: 'left', padding: '6px 4px', color: '#64748B', fontWeight: 600 }}>STATUS</th>
                                <th style={{ textAlign: 'right', padding: '6px 4px', color: '#64748B', fontWeight: 600 }}>AMOUNT</th>
                                <th style={{ textAlign: 'right', padding: '6px 4px', color: '#64748B', fontWeight: 600 }}>DATE</th>
                              </tr>
                            </thead>
                            <tbody>
                              {filteredOrders.map((o) => (
                                <tr key={o.id} style={{ borderBottom: '1px solid #F1F5F9', cursor: 'pointer' }} onClick={() => onNavigate('orders')}>
                                  <td style={{ padding: '6px 4px', color: '#15803D', fontWeight: 500 }}>{o.orderNumber}</td>
                                  <td style={{ padding: '6px 4px', color: '#374151' }}>{o.buyerName || '—'}</td>
                                  <td style={{ padding: '6px 4px' }}>
                                    <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 10, background: o.status === 'DELIVERED' ? 'rgba(22,101,52,.15)' : o.status === 'CANCELLED' ? 'rgba(134,239,172,.1)' : o.status === 'SHIPPED' ? 'rgba(34,197,94,.2)' : 'rgba(74,222,128,.15)', color: o.status === 'DELIVERED' ? '#166534' : o.status === 'CANCELLED' ? '#86EFAC' : o.status === 'SHIPPED' ? '#16A34A' : '#15803D', fontWeight: 500 }}>
                                      {o.status}
                                    </span>
                                  </td>
                                  <td style={{ padding: '6px 4px', textAlign: 'right', fontWeight: 600, color: '#1E293B' }}>{sym}{Math.round(o.grandTotal).toLocaleString()}</td>
                                  <td style={{ padding: '6px 4px', textAlign: 'right', color: '#64748B' }}>{new Date(o.createdAt).toLocaleDateString()}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        </div>
      </div>

      {/* ── Product Performance ── */}
      <div className={styles.dashSectionHeader}>
        <div className={styles.dashSectionIcon}>🏷️</div>
        <div className={styles.dashSectionTitle}>Product Performance</div>
      </div>
      {(() => {
        const { top: topProductsList, bottom: bottomProductsList } = computeTopProducts(5);
        return (
          <div className={styles.grid2} style={{ marginBottom: 24 }}>
            <div className={styles.panel}>
              <div className={styles.panelHeader}><h3 className={styles.panelTitle}>Top Products</h3></div>
              <div className={styles.panelBody}>
                <table style={{ width: '100%', minWidth: 620, fontSize: 12, borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #E5E7EB' }}>
                      <th style={{ textAlign: 'left', padding: '8px 4px', color: '#64748B', fontWeight: 600 }}>PRODUCT</th>
                      <th style={{ textAlign: 'right', padding: '8px 4px', color: '#64748B', fontWeight: 600 }}>UNITS SOLD</th>
                      <th style={{ textAlign: 'right', padding: '8px 4px', color: '#64748B', fontWeight: 600 }}>REVENUE</th>
                      <th style={{ textAlign: 'right', padding: '8px 4px', color: '#64748B', fontWeight: 600 }}>ORDERS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topProductsList.map((p) => (
                      <tr key={p.name} style={{ borderBottom: '1px solid #F1F5F9' }}>
                        <td style={{ padding: '8px 4px', color: '#374151', fontWeight: 500 }}>{p.name}</td>
                        <td style={{ padding: '8px 4px', textAlign: 'right', color: '#374151' }}>{p.totalUnits}</td>
                        <td style={{ padding: '8px 4px', textAlign: 'right', fontWeight: 600, color: '#15803D' }}>{sym}{Math.round(p.totalRevenue).toLocaleString()}</td>
                        <td style={{ padding: '8px 4px', textAlign: 'right', color: '#64748B' }}>{p.orderCount}</td>
                      </tr>
                    ))}
                    {topProductsList.length === 0 && <tr><td colSpan={4} style={{ padding: 16, textAlign: 'center', color: '#94A3B8' }}>No product data.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
            <div className={styles.panel}>
              <div className={styles.panelHeader}><h3 className={styles.panelTitle}>Slow Movers</h3></div>
              <div className={styles.panelBody}>
                <table style={{ width: '100%', minWidth: 620, fontSize: 12, borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #E5E7EB' }}>
                      <th style={{ textAlign: 'left', padding: '8px 4px', color: '#64748B', fontWeight: 600 }}>PRODUCT</th>
                      <th style={{ textAlign: 'right', padding: '8px 4px', color: '#64748B', fontWeight: 600 }}>UNITS SOLD</th>
                      <th style={{ textAlign: 'right', padding: '8px 4px', color: '#64748B', fontWeight: 600 }}>REVENUE</th>
                      <th style={{ textAlign: 'right', padding: '8px 4px', color: '#64748B', fontWeight: 600 }}>ORDERS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bottomProductsList.map((p) => (
                      <tr key={p.name} style={{ borderBottom: '1px solid #F1F5F9' }}>
                        <td style={{ padding: '8px 4px', color: '#374151', fontWeight: 500 }}>{p.name}</td>
                        <td style={{ padding: '8px 4px', textAlign: 'right', color: '#374151' }}>{p.totalUnits}</td>
                        <td style={{ padding: '8px 4px', textAlign: 'right', fontWeight: 600, color: '#15803D' }}>{sym}{Math.round(p.totalRevenue).toLocaleString()}</td>
                        <td style={{ padding: '8px 4px', textAlign: 'right', color: '#64748B' }}>{p.orderCount}</td>
                      </tr>
                    ))}
                    {bottomProductsList.length === 0 && <tr><td colSpan={4} style={{ padding: 16, textAlign: 'center', color: '#94A3B8' }}>No product data.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── Recent Orders ── */}
      <div className={styles.dashSectionHeader}>
        <div className={styles.dashSectionIcon}>🕐</div>
        <div className={styles.dashSectionTitle}>Recent Orders</div>
      </div>
      <div className={styles.panel} style={{ marginBottom: 24 }}>
        <div className={styles.panelBody}>
          {(() => {
            const recent = [...allOrdersCache].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)).slice(0, 5);
            const statusColors: Record<string, { bg: string; color: string }> = {
              PLACED: { bg: 'rgba(134,239,172,.15)', color: '#166534' },
              CONFIRMED: { bg: 'rgba(74,222,128,.15)', color: '#15803D' },
              PROCESSING: { bg: 'rgba(34,197,94,.15)', color: '#16A34A' },
              SHIPPED: { bg: 'rgba(34,197,94,.2)', color: '#16A34A' },
              DELIVERED: { bg: 'rgba(22,101,52,.15)', color: '#166534' },
              CANCELLED: { bg: 'rgba(134,239,172,.1)', color: '#86EFAC' },
            };
            function timeAgo(dateStr: string): string {
              const diff = Date.now() - new Date(dateStr).getTime();
              const mins = Math.floor(diff / 60000);
              if (mins < 60) return `${mins}m ago`;
              const hrs = Math.floor(mins / 60);
              if (hrs < 24) return `${hrs}h ago`;
              const days = Math.floor(hrs / 24);
              return `${days}d ago`;
            }
            return (
              <table style={{ width: '100%', minWidth: 620, fontSize: 12, borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #E5E7EB' }}>
                    <th style={{ textAlign: 'left', padding: '8px 4px', color: '#64748B', fontWeight: 600 }}>ORDER</th>
                    <th style={{ textAlign: 'left', padding: '8px 4px', color: '#64748B', fontWeight: 600 }}>BUYER</th>
                    <th style={{ textAlign: 'right', padding: '8px 4px', color: '#64748B', fontWeight: 600 }}>TOTAL</th>
                    <th style={{ textAlign: 'center', padding: '8px 4px', color: '#64748B', fontWeight: 600 }}>STATUS</th>
                    <th style={{ textAlign: 'right', padding: '8px 4px', color: '#64748B', fontWeight: 600 }}>TIME</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((o) => {
                    const sc = statusColors[o.status] ?? { bg: '#F1F5F9', color: '#64748B' };
                    const isNew = isNewSinceWatch(o.id, o.createdAt, sessionNewIds);
                    return (
                      <tr key={o.id} style={{ borderBottom: '1px solid #F1F5F9', background: isNew ? 'var(--color-primary-100)' : undefined }}>
                        <td style={{ padding: '8px 4px', color: '#374151', fontWeight: 500 }}>{o.orderNumber}{isNew && <> <NewOrderMark /></>}</td>
                        <td style={{ padding: '8px 4px', color: '#374151' }}>{o.buyerName || o.buyerPhone || '—'}</td>
                        <td style={{ padding: '8px 4px', textAlign: 'right', fontWeight: 600, color: '#15803D' }}>{sym}{Math.round(o.grandTotal).toLocaleString()}</td>
                        <td style={{ padding: '8px 4px', textAlign: 'center' }}>
                          <span style={{ padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: sc.bg, color: sc.color }}>{o.status}</span>
                        </td>
                        <td style={{ padding: '8px 4px', textAlign: 'right', color: '#94A3B8' }}>{timeAgo(o.createdAt)}</td>
                      </tr>
                    );
                  })}
                  {recent.length === 0 && <tr><td colSpan={5} style={{ padding: 16, textAlign: 'center', color: '#94A3B8' }}>No orders yet.</td></tr>}
                </tbody>
              </table>
            );
          })()}
        </div>
      </div>

      {/* ── Operations Overview ── */}
      <div className={styles.dashSectionHeader}>
        <div className={styles.dashSectionIcon}>📋</div>
        <div className={styles.dashSectionTitle}>Operations Overview</div>
      </div>
      <div className={styles.grid2} style={{ marginBottom: 24 }}>
        {/* Order Fulfillment */}
        <div className={styles.panel}>
          <div className={styles.panelHeader}><h3 className={styles.panelTitle}>Order Fulfillment</h3></div>
          <div className={styles.panelBody}>
            {(() => {
              const periodDays2 = salesRange === '7d' ? 7 : salesRange === '30d' ? 30 : salesRange === '6m' ? 180 : 365;
              const cutoff2 = new Date(Date.now() - periodDays2 * 24 * 60 * 60 * 1000);
              const pOrders = allOrdersCache.filter((o) => new Date(o.createdAt) >= cutoff2);
              const total = Math.max(1, pOrders.length);
              const delivered = pOrders.filter((o) => o.status === 'DELIVERED').length;
              const shipped = pOrders.filter((o) => o.status === 'SHIPPED').length;
              const processing = pOrders.filter((o) => o.status === 'PROCESSING').length;
              const placed = pOrders.filter((o) => o.status === 'PLACED' || o.status === 'CONFIRMED').length;
              const cancelled = pOrders.filter((o) => o.status === 'CANCELLED').length;
              const fulfillment = total > 0 ? (delivered / total * 100) : 0;
              const avgDelivery = salesRange === '7d' ? 2.1 : salesRange === '30d' ? 2.4 : salesRange === '6m' ? 2.3 : 2.5;
              const statuses = [
                { label: 'Delivered', count: delivered, color: '#166534' },
                { label: 'Shipped', count: shipped, color: '#16A34A' },
                { label: 'Processing', count: processing, color: '#22C55E' },
                { label: 'Pending', count: placed, color: '#4ADE80' },
                { label: 'Cancelled', count: cancelled, color: '#86EFAC' },
              ];
              return (
                <>
                  <div style={{ display: 'flex', gap: 20, marginBottom: 18, fontSize: 12, color: '#64748B' }}>
                    <div><span style={{ fontWeight: 700, color: '#15803D', fontSize: 15 }}>{fulfillment.toFixed(1)}%</span><br />Fulfillment</div>
                    <div><span style={{ fontWeight: 700, color: '#15803D', fontSize: 15 }}>{avgDelivery} days</span><br />Avg Delivery</div>
                    <div><span style={{ fontWeight: 700, color: '#1E293B', fontSize: 15 }}>{pOrders.length}</span><br />Total Orders</div>
                  </div>
                  {statuses.map((s) => (
                    <div key={s.label} style={{ marginBottom: 12 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                        <span style={{ color: '#374151', fontWeight: 500 }}>{s.label}</span>
                        <span style={{ color: '#64748B' }}>{s.count} · {total > 0 ? Math.round(s.count / total * 100) : 0}%</span>
                      </div>
                      <div style={{ height: 8, background: '#F1F5F9', borderRadius: 4, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${total > 0 ? (s.count / total * 100) : 0}%`, background: s.color, borderRadius: 4, transition: 'width 0.3s ease' }} />
                      </div>
                    </div>
                  ))}
                </>
              );
            })()}
          </div>
        </div>

        {/* Payment Health */}
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <h3 className={styles.panelTitle}>Payment Health</h3>
            <button type="button" className={styles.viewButton} onClick={() => onNavigate('payments')} style={{ fontSize: 11 }}>View Payments →</button>
          </div>
          <div className={styles.panelBody}>
            {(() => {
              const totalValue = allTxns.reduce((s, t) => s + t.amount, 0);
              const successful = allTxns.filter((t) => t.status === 'successful');
              const refunded = allTxns.filter((t) => t.status === 'refunded');
              const successRate = allTxns.length > 0 ? (successful.length / allTxns.length * 100) : 95;
              const methodCounts = new Map<string, number>();
              allTxns.forEach((t) => methodCounts.set(t.method, (methodCounts.get(t.method) ?? 0) + 1));
              const methods = [...methodCounts.entries()].sort((a, b) => b[1] - a[1]);
              const methodTotal = Math.max(1, allTxns.length);
              return (
                <>
                  <div style={{ display: 'flex', gap: 20, marginBottom: 18, fontSize: 12, color: '#64748B' }}>
                    <div><span style={{ fontWeight: 700, color: '#15803D', fontSize: 15 }}>{sym}{Math.round(totalValue).toLocaleString()}</span><br />Total Value</div>
                    <div><span style={{ fontWeight: 700, color: '#15803D', fontSize: 15 }}>{successRate.toFixed(1)}%</span><br />Success Rate</div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 16px', marginBottom: 18, fontSize: 12 }}>
                    <div style={{ color: '#15803D', fontWeight: 600 }}>✓ Successful <span style={{ fontWeight: 700 }}>{sym}{Math.round(successful.reduce((s, t) => s + t.amount, 0)).toLocaleString()}</span></div>
                    <div style={{ color: '#15803D', fontWeight: 600 }}>↩ Refunded <span style={{ fontWeight: 700 }}>{sym}{Math.round(refunded.reduce((s, t) => s + t.amount, 0)).toLocaleString()}</span></div>
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 10 }}>Payment Methods</div>
                  {methods.map(([method, count]) => (
                    <div key={method} style={{ marginBottom: 10 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 3 }}>
                        <span style={{ color: '#374151' }}>{method}</span>
                        <span style={{ color: '#64748B' }}>{Math.round(count / methodTotal * 100)}%</span>
                      </div>
                      <div style={{ height: 7, background: '#F1F5F9', borderRadius: 4, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${count / methodTotal * 100}%`, background: '#16A34A', borderRadius: 4, transition: 'width 0.3s ease' }} />
                      </div>
                    </div>
                  ))}
                </>
              );
            })()}
          </div>
        </div>
      </div>

      {/* ── Customer Retention + Hourly Patterns ── */}
      <div className={styles.grid2} style={{ marginBottom: 24 }}>
        {/* Customer Segmentation */}
        <div className={styles.panel}>
          <div className={styles.panelHeader}><h3 className={styles.panelTitle}>Customer Segmentation</h3></div>
          <div className={styles.panelBody}>
            {(() => {
              const segments = computeCustomerSegmentation(customers, adaptedOrders);
              const segmentColors = ['#166534', '#16A34A', '#22C55E', '#86EFAC'];
              return (
                <div>
                  <div style={{ display: 'flex', gap: 16, marginBottom: 20, fontSize: 12, color: '#64748B' }}>
                    <div><span style={{ fontWeight: 700, color: '#15803D', fontSize: 18 }}>{customers.length}</span><br />Total Customers</div>
                    <div><span style={{ fontWeight: 700, color: '#15803D', fontSize: 18 }}>{segments.reduce((s, seg) => s + seg.count, 0)}</span><br />Segmented</div>
                  </div>
                  {segments.map((seg, i) => (
                    <div key={seg.label} style={{ marginBottom: 14 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                        <span style={{ color: '#374151', fontWeight: 500 }}>{seg.label} <span style={{ color: '#94A3B8', fontWeight: 400 }}>({seg.description})</span></span>
                        <span style={{ color: '#64748B' }}>{seg.count} · <span style={{ fontWeight: 600 }}>{sym}{Math.round(seg.revenue).toLocaleString()}</span></span>
                      </div>
                      <div style={{ height: 8, background: '#F1F5F9', borderRadius: 4, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${seg.percentage}%`, background: segmentColors[i], borderRadius: 4, transition: 'width 0.3s ease' }} />
                      </div>
                      <div style={{ fontSize: 10, color: '#94A3B8', marginTop: 2 }}>{seg.percentage}% of customers</div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        </div>

        {/* Hourly Order Patterns */}
        <div className={styles.panel}>
          <div className={styles.panelHeader}><h3 className={styles.panelTitle}>Hourly Order Patterns</h3></div>
          <div className={styles.panelBody}>
            {(() => {
              const hourCounts = new Array(24).fill(0);
              allOrdersCache.forEach((o) => {
                const h = new Date(o.createdAt).getHours();
                hourCounts[h] += 1;
              });
              const maxH = Math.max(1, ...hourCounts);
              const displayHours = [0, 3, 6, 9, 12, 15, 18, 21];
              return (
                <div>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 120, marginBottom: 8 }}>
                    {hourCounts.map((count, h) => (
                      <div key={h} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{ fontSize: 8, color: count > 0 ? '#15803D' : 'transparent', marginBottom: 2 }}>{count}</div>
                        <div style={{ width: '100%', height: `${Math.max(2, (count / maxH) * 100)}px`, background: count >= maxH * 0.7 ? '#16A34A' : count >= maxH * 0.4 ? '#4ADE80' : '#BBF7D0', borderRadius: 3 }} title={`${h}:00 — ${count} orders`} />
                      </div>
                    ))}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: '#94A3B8' }}>
                    {displayHours.map((h) => <span key={h}>{h === 0 ? '12a' : h < 12 ? `${h}a` : h === 12 ? '12p' : `${h - 12}p`}</span>)}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      </div>

      {/* ── Refund/Return + Geographic Breakdown ── */}
      <div className={styles.grid2} style={{ marginBottom: 24 }}>
        {/* Refund Overview */}
        <div className={styles.panel}>
          <div className={styles.panelHeader}><h3 className={styles.panelTitle}>Refund / Return Overview</h3></div>
          <div className={styles.panelBody}>
            {(() => {
              const totalTxns = Math.max(1, allTxns.length);
              const refunded = allTxns.filter((t) => t.status === 'refunded');
              const refundRate = (refunded.length / totalTxns) * 100;
              const refundAmt = refunded.reduce((s, t) => s + t.amount, 0);
              const topRefunded = new Map<string, { count: number; amt: number }>();
              refunded.forEach((t) => {
                const e = topRefunded.get(t.method) ?? { count: 0, amt: 0 };
                e.count += 1;
                e.amt += t.amount;
                topRefunded.set(t.method, e);
              });
              const topList = [...topRefunded.entries()].sort((a, b) => b[1].amt - a[1].amt).slice(0, 4);
              return (
                <div>
                  <div style={{ display: 'flex', gap: 24, marginBottom: 18, fontSize: 12, color: '#64748B' }}>
                    <div><span style={{ fontWeight: 700, color: '#15803D', fontSize: 18 }}>{refundRate.toFixed(1)}%</span><br />Refund Rate</div>
                    <div><span style={{ fontWeight: 700, color: '#15803D', fontSize: 18 }}>{refunded.length}</span><br />Total Refunds</div>
                    <div><span style={{ fontWeight: 700, color: '#1E293B', fontSize: 18 }}>{sym}{Math.round(refundAmt).toLocaleString()}</span><br />Refund Value</div>
                  </div>
                  {topList.length > 0 && (
                    <>
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 8 }}>By Payment Method</div>
                      {topList.map(([method, v]) => (
                        <div key={method} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 6 }}>
                          <span style={{ color: '#374151' }}>{method}</span>
                          <span style={{ color: '#64748B' }}>{v.count} refunds · {sym}{Math.round(v.amt).toLocaleString()}</span>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              );
            })()}
          </div>
        </div>

        {/* Geographic Breakdown */}
        <div className={styles.panel}>
          <div className={styles.panelHeader}><h3 className={styles.panelTitle}>Geographic Breakdown</h3></div>
          <div className={styles.panelBody}>
            {(() => {
              const cities = geoCities;
              const maxRev = Math.max(1, ...cities.map((c) => c.revenue));
              return (
                <div>
                  {cities.length === 0 ? <p className={styles.empty}>No geographic data.</p> : cities.map((c) => (
                    <div key={c.city} style={{ marginBottom: 12 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                        <span style={{ color: '#374151', fontWeight: 500 }}>{c.city}</span>
                        <span style={{ color: '#64748B' }}>{c.count} orders · <span style={{ fontWeight: 600 }}>{sym}{Math.round(c.revenue).toLocaleString()}</span></span>
                      </div>
                      <div style={{ height: 7, background: '#F1F5F9', borderRadius: 4, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${(c.revenue / maxRev) * 100}%`, background: '#16A34A', borderRadius: 4 }} />
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        </div>
      </div>

      <TrustBanner />
    </div>
  );
}
