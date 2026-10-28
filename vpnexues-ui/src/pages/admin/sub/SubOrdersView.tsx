import { useEffect, useMemo, useState, useCallback, useRef, Fragment } from 'react';
import { getOrder, listOrders, updateOrderStatus } from '../../../api/adminOrdersApi';
import { listPayments, type AdminPaymentTxn } from '../../../api/adminPaymentsApi';
import { listCustomers } from '../../../api/adminCustomersApi';
import type { AdminCustomer, AdminOrderDetail, AdminOrderSummary } from '../../../types';
import type { CountryConfig } from '../../../config/countryConfig';
import SideDrawer from '../../../components/admin/SideDrawer';
import LiveBadge from '../../../components/admin/LiveBadge';
import StatusBadge from '../../../components/admin/StatusBadge';
import ExportMenu from '../../../components/admin/ExportMenu';
import { useLivePoll } from '../../../hooks/useLivePoll';
import { findNewOrders, isNewSinceWatch, notifyNewOrders } from '../../../utils/adminOrderToast';
import NewOrderMark from '../../../components/admin/NewOrderMark';
import markStyles from '../../../components/admin/css/NewOrderMark.module.css';
import { type ExportData } from '../../../utils/csvExport';
import { getErrorMessage } from '../../../utils/errors';
import { hasPermission } from '../../../utils/adminScope';
import { useAdminAuth } from '../../../context/AdminAuthContext';
import { CANCELLABLE_ORDER_STATUSES, NEXT_ORDER_ACTION_LABEL, NEXT_ORDER_STATUS, ORDER_STATUS_FLOW, ROW_ADVANCE_LABEL } from '../../../utils/orderStatus';
import { buildCustomerIndex, customerNo } from '../../../utils/ticketNo';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClipboardList } from '@fortawesome/free-solid-svg-icons';
import { useToast } from '../../../components/admin/Toast';
import { computeOrderPatterns, computeCLV } from '../../../utils/analytics';
import styles from './SubViews.module.css';

const PAGE_SIZE = 10;

/** Tabs use ONLY real backend OrderStatus values (PACKED / OUT_FOR_DELIVERY / RETURNED do not exist server-side). */
const STATUS_TABS: { value: string; label: string; emptyLabel: string }[] = [
  { value: '', label: 'All Orders', emptyLabel: 'orders' },
  { value: 'PLACED', label: 'New', emptyLabel: 'new orders' },
  { value: 'CONFIRMED', label: 'Confirmed', emptyLabel: 'confirmed orders' },
  { value: 'PROCESSING', label: 'Processing', emptyLabel: 'processing orders' },
  { value: 'SHIPPED', label: 'Shipped', emptyLabel: 'shipped orders' },
  { value: 'DELIVERED', label: 'Delivered', emptyLabel: 'delivered orders' },
  { value: 'CANCELLED', label: 'Cancelled', emptyLabel: 'cancelled orders' },
];

const PAY_STATUS_LABEL: Record<string, string> = {
  successful: 'Paid',
  pending: 'Pending',
  failed: 'Failed',
  refunded: 'Refunded',
};

export default function SubOrdersView({ config, embedded = false }: { config: CountryConfig; embedded?: boolean }) {
  const code = config.code;
  const sym = config.currencySymbol;
  /** Last order-id set seen by `fetchPage` — the new-order toast diffs silent
      refreshes against it; non-silent loads (mount, filter, page) rebase it. */
  const seenOrderIdsRef = useRef<Set<string> | null>(null);
  /** Session-new order ids — rows wear a persistent NEW pill on top of the
      transient toast, so admins can still identify fresh orders later. */
  const [sessionNewIds, setSessionNewIds] = useState<Set<string>>(new Set());
  const { notify } = useToast();
  const { admin } = useAdminAuth();
  const canEdit = hasPermission(admin, 'edit');
  const canExport = hasPermission(admin, 'export');
  const [pageOrders, setPageOrders] = useState<AdminOrderSummary[]>([]);
  const [payMethods, setPayMethods] = useState<Record<string, string | null>>({});
  const [payLoading, setPayLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [page, setPage] = useState(0);
  const [status, setStatus] = useState('');
  const [channel, setChannel] = useState('');
  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [payment, setPayment] = useState('');
  const [sort, setSort] = useState('newest');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [insightsOpen, setInsightsOpen] = useState(false);
  const [detail, setDetail] = useState<AdminOrderDetail | null>(null);
  const [detailCustomer, setDetailCustomer] = useState<AdminCustomer | null>(null);
  const [detailOrders, setDetailOrders] = useState<AdminOrderSummary[]>([]);
  const [customers, setCustomers] = useState<AdminCustomer[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<string[]>([]);
  const [statusSaving, setStatusSaving] = useState(false);
  const [statusError, setStatusError] = useState('');
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [detailMap, setDetailMap] = useState<Record<string, AdminOrderDetail>>({});
  const [payTxns, setPayTxns] = useState<AdminPaymentTxn[]>([]);
  const [rowSavingId, setRowSavingId] = useState<string | null>(null);

  const payByOrderId = useCallback(() => {
    const map = new Map<string, AdminPaymentTxn>();
    for (const t of payTxns) {
      if (!map.has(t.orderId)) map.set(t.orderId, t);
    }
    return map;
  }, [payTxns]);

  // QA-07: fetch only what the API needs (country/status/page). Search, dates,
  // channel, sort and the payment-method filter are client-side over the fetched
  // page — typing never refires listOrders/listCustomers/getOrder.
  /* silent = live refresh (Feature A): no spinner flash; a failed tick throws
     (the hook backs off) instead of surfacing an error over good rows. */
  const fetchPage = useCallback((silent = false) => {
    if (!silent) setLoading(true);
    return Promise.all([
      listOrders({ country: code, status: status || undefined, page, size: PAGE_SIZE }),
      listCustomers({ country: code }),
    ])
      .then(([res, custs]) => {
        setCustomers(custs);
        setPageOrders(res.content);
        setTotalPages(res.totalPages);
        setTotalElements(res.totalElements);
        setError('');
        // New-order toast (Feature A follow-up): diff silent ticks against the
        // last seen id set. Mount/filter/page loads only rebase the set.
        const prevIds = seenOrderIdsRef.current;
        seenOrderIdsRef.current = new Set(res.content.map((o) => o.id));
        if (silent && prevIds) {
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
      })
      .catch((err: unknown) => {
        if (silent) throw err;
        setError(getErrorMessage(err, 'Could not load orders.'));
      })
      .finally(() => { if (!silent) setLoading(false); });
  }, [code, status, page, sym]);

  useEffect(() => { void fetchPage(); }, [fetchPage]);

  // Payment-method filter needs per-row detail (paymentMethod lives only on the
  // detail payload). Bounded to one page (≤ PAGE_SIZE rows) and only fires when
  // the page rows or the selected method change — not on keystrokes.
  useEffect(() => {
    if (!payment) {
      setPayMethods({});
      setPayLoading(false);
      return;
    }
    let cancelled = false;
    setPayLoading(true);
    Promise.all(
      pageOrders.map(async (o) => {
        try {
          const d = await getOrder(o.id);
          return [o.id, d.paymentMethod ?? null] as const;
        } catch {
          return [o.id, null] as const;
        }
      }),
    ).then((pairs) => {
      if (cancelled) return;
      setPayMethods(Object.fromEntries(pairs));
      setPayLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [pageOrders, payment]);

  const orders = useMemo(() => {
    let content = pageOrders;
    if (payment) {
      // Keep rows whose detail fetch failed (matches the old load() behaviour).
      content = content.filter((o) => payMethods[o.id] == null || payMethods[o.id] === payment);
    }
    const q = search.toLowerCase().trim();
    if (q) content = content.filter((o) => `${o.orderNumber} ${o.buyerName ?? ''} ${o.buyerPhone ?? ''}`.toLowerCase().includes(q));
    if (dateFrom) content = content.filter((o) => o.createdAt.slice(0, 10) >= dateFrom);
    if (dateTo) content = content.filter((o) => o.createdAt.slice(0, 10) <= dateTo);
    if (channel) content = content.filter((o) => o.channel.toLowerCase() === channel);
    if (sort === 'oldest') return [...content].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    if (sort === 'amount-desc') return [...content].sort((a, b) => b.grandTotal - a.grandTotal);
    if (sort === 'amount-asc') return [...content].sort((a, b) => a.grandTotal - b.grandTotal);
    return [...content].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [pageOrders, payMethods, payment, search, dateFrom, dateTo, channel, sort]);

  const busy = loading || payLoading;

  // Payments once per country: drives the payment-method filter AND per-row pay-status cells.
  useEffect(() => {
    let cancelled = false;
    listPayments()
      .then((txns) => {
        if (cancelled) return;
        const mine = txns.filter((t) => t.country === code);
        setPayTxns(mine);
        setPaymentMethods([...new Set(mine.map((t) => t.method))].sort());
      })
      .catch(() => {
        if (!cancelled) {
          setPayTxns([]);
          setPaymentMethods([]);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [code]);

  // Real status counts: one lightweight totalElements query per real status (no new endpoint).
  const fetchCounts = useCallback(() => {
    const tabs = STATUS_TABS.filter((t) => t.value !== '');
    Promise.all([
      listOrders({ country: code, size: 1 }).catch(() => null),
      ...tabs.map((t) => listOrders({ country: code, status: t.value, size: 1 }).catch(() => null)),
    ]).then(([all, ...perStatus]) => {
      const next: Record<string, number> = { ALL: all?.totalElements ?? 0 };
      tabs.forEach((t, i) => {
        next[t.value] = perStatus[i]?.totalElements ?? 0;
      });
      setCounts(next);
    }).catch(() => {});
  }, [code]);

  useEffect(() => {
    fetchCounts();
  }, [fetchCounts]);

  /* Feature A — live refresh: current page + status-tab counts every 10s.
     Runs even when embedded in Customers & Orders (that parent pauses its own
     poll while this section is shown, so the two never double-fetch). */
  const livePoll = useLivePoll(async () => {
    await fetchPage(true);
    fetchCounts(); // cosmetic counts — fire-and-forget
  }, { intervalMs: 10_000 });

  // Enrich visible page rows with real detail data (items, payment method, delivery city).
  // Failures degrade to '—' cells — never demo data, never a full-page error.
  useEffect(() => {
    const missing = orders.map((o) => o.id).filter((id) => !detailMap[id]);
    if (missing.length === 0) return;
    let cancelled = false;
    void Promise.allSettled(missing.map((id) => getOrder(id))).then((results) => {
      if (cancelled) return;
      setDetailMap((prev) => {
        const next = { ...prev };
        results.forEach((r, i) => {
          if (r.status === 'fulfilled') next[missing[i]] = r.value;
        });
        return next;
      });
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orders]);

  function refreshOrders() {
    fetchPage();
    fetchCounts();
  }

  // Display numbers over registered customers (oldest first); guests have no id here.
  const ordCustIndex = useMemo(
    () => buildCustomerIndex(customers.map((c) => ({ id: c.id, createdAt: c.registeredAt }))),
    [customers],
  );

  useEffect(() => {
    setPage(0);
  }, [search, dateFrom, dateTo, payment, sort, channel, status]);

  const openDetail = useCallback(async (id: string) => {
    try {
      const d = await getOrder(id);
      setDetail(d);
      const q = `${d.buyer.name ?? ''} ${d.buyer.phone ?? ''} ${d.buyer.email ?? ''}`.toLowerCase();
      const cust = customers.find((c) => {
        const cq = `${c.name ?? ''} ${c.email ?? ''} ${c.phone}`.toLowerCase();
        return q.includes(c.phone) || (c.email && q.includes(c.email.toLowerCase()));
      }) ?? null;
      setDetailCustomer(cust);
      if (cust) {
        const custOrders = orders.filter((o) =>
          `${o.buyerName ?? ''} ${o.buyerPhone ?? ''}`.toLowerCase().includes(cust.phone.toLowerCase()),
        );
        setDetailOrders(custOrders);
      } else {
        setDetailOrders([]);
      }
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Could not load order details.'));
    }
  }, [customers, orders]);

  async function advanceDetailStatus(next: string) {
    if (!detail || statusSaving) return;
    setStatusSaving(true);
    setStatusError('');
    try {
      const updated = await updateOrderStatus(detail.id, next);
      setDetail(updated);
      notify(`Order ${updated.orderNumber} moved to ${next.replace(/_/g, ' ')}.`);
      refreshOrders();
    } catch (err: unknown) {
      const message = getErrorMessage(err, 'Could not update order status.');
      setStatusError(message);
      notify(message, 'error');
    } finally {
      setStatusSaving(false);
    }
  }

  async function cancelDetailOrder() {
    if (!detail || statusSaving) return;
    if (!window.confirm(`Cancel order ${detail.orderNumber}? This cannot be undone.`)) return;
    setStatusSaving(true);
    setStatusError('');
    try {
      const updated = await updateOrderStatus(detail.id, 'CANCELLED');
      setDetail(updated);
      notify(`Order ${updated.orderNumber} cancelled.`);
      refreshOrders();
    } catch (err: unknown) {
      const message = getErrorMessage(err, 'Could not cancel order.');
      setStatusError(message);
      notify(message, 'error');
    } finally {
      setStatusSaving(false);
    }
  }

  // Row-level actions: backend success first, then re-fetch — the order moves
  // tables automatically because every tab is a live server-side status query.
  async function advanceRowOrder(id: string, orderNumber: string, next: string) {
    if (rowSavingId) return;
    setRowSavingId(id);
    try {
      await updateOrderStatus(id, next);
      notify(`Order ${orderNumber} moved to ${next.replace(/_/g, ' ')}.`);
      refreshOrders();
    } catch (err: unknown) {
      notify(getErrorMessage(err, 'Could not update order status.'), 'error');
    } finally {
      setRowSavingId(null);
    }
  }

  async function cancelRowOrder(id: string, orderNumber: string) {
    if (rowSavingId) return;
    if (!window.confirm(`Cancel order ${orderNumber}? This cannot be undone.`)) return;
    setRowSavingId(id);
    try {
      await updateOrderStatus(id, 'CANCELLED');
      notify(`Order ${orderNumber} cancelled.`);
      refreshOrders();
    } catch (err: unknown) {
      notify(getErrorMessage(err, 'Could not cancel order.'), 'error');
    } finally {
      setRowSavingId(null);
    }
  }

  function getExportData(): ExportData {
    return {
      filename: `${config.id}-orders-${status || 'all'}.csv`,
      title: `Orders — ${config.name}`,
      columns: ['Order', 'Buyer', 'Channel', 'Status', 'Total'],
      rows: orders.map((o) => [o.orderNumber, o.buyerName ?? o.buyerPhone ?? '', o.channel, o.status, o.grandTotal]),
    };
  }

  function resetFilters() {
    setSearch('');
    setDateFrom('');
    setDateTo('');
    setPayment('');
    setChannel('');
    setStatus('');
    setSort('newest');
  }

  const activeTab = STATUS_TABS.find((t) => t.value === status) ?? STATUS_TABS[0];
  const tabTotal = status === '' ? (counts.ALL ?? 0) : (counts[status] ?? 0);

  const newVisibleCount = orders.filter((o) => isNewSinceWatch(o.id, o.createdAt, sessionNewIds)).length;

  const orderPatterns = computeOrderPatterns(orders);

  return (
    <div>
      {!embedded && (
      <div className={styles.subPageBanner}>
        <div className={styles.subPageBannerIcon}><FontAwesomeIcon icon={faClipboardList} /></div>
        <h1 className={styles.subPageBannerTitle}>Orders</h1>
        <span className={styles.subPageBannerBadge}>{config.name}</span>
      </div>
      )}

      <div className={styles.toolbar}>
        <h2 className={styles.sectionTitle}>Orders — {config.name} ({tabTotal})</h2>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {newVisibleCount > 0 && <NewOrderMark label={`${newVisibleCount} new`} />}
          <LiveBadge live={livePoll} />
          <button type="button" className={styles.filtersBtn} onClick={() => setFiltersOpen(!filtersOpen)}>
            ☰ Filters
          </button>
          {canExport && <ExportMenu getData={getExportData} />}
        </div>
      </div>

      <div className={styles.filterRow} role="tablist" aria-label="Order status">
        {STATUS_TABS.map((t) => {
          const count = t.value === '' ? (counts.ALL ?? 0) : (counts[t.value] ?? 0);
          return (
            <button
              key={t.value || 'all'}
              type="button"
              role="tab"
              aria-selected={status === t.value}
              className={`${styles.filterBtn} ${status === t.value ? styles.filterBtnActive : ''}`}
              onClick={() => { setStatus(t.value); setPage(0); }}
            >
              {t.label}
              <span style={{ marginLeft: 6, padding: '1px 9px', borderRadius: 12, fontSize: 11, fontWeight: 700, background: status === t.value ? 'rgba(255,255,255,.25)' : 'rgba(22,163,74,.12)', color: status === t.value ? '#fff' : '#15803D' }}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {filtersOpen && (
        <div className={styles.filterPanel}>
          <div className={styles.filterPanelRow}>
            <input
              className={styles.filterInput}
              placeholder="Search order ID, customer name, phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div className={styles.filterDateGroup}>
              <label className={styles.filterLabel}>From</label>
              <input className={styles.filterDate} type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
            </div>
            <div className={styles.filterDateGroup}>
              <label className={styles.filterLabel}>To</label>
              <input className={styles.filterDate} type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
            </div>
          </div>
          <div className={styles.filterPanelRow}>
            <select className={styles.filterSelect} value={channel} onChange={(e) => setChannel(e.target.value)}>
              <option value="">All channels</option>
              <option value="shop">shop</option>
              <option value="b2b">b2b</option>
              <option value="big_box">big_box</option>
              <option value="small_box">small_box</option>
            </select>
            <select className={styles.filterSelect} value={payment} onChange={(e) => setPayment(e.target.value)}>
              <option value="">All payment methods</option>
              {paymentMethods.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
            <select className={styles.filterSelect} value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="newest">Sort: Newest</option>
              <option value="oldest">Sort: Oldest</option>
              <option value="amount-desc">Sort: Highest amount</option>
              <option value="amount-asc">Sort: Lowest amount</option>
            </select>
            <button type="button" className={styles.filterApplyBtn} onClick={fetchPage}>Apply</button>
            <button type="button" className={styles.filterResetBtn} onClick={resetFilters}>Reset</button>
          </div>
        </div>
      )}

      <div className={styles.panel}>
        {busy ? (
          <p className={styles.empty}>Loading...</p>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: 24 }}>
            <p className={styles.empty}>{error}</p>
            <button type="button" className={styles.viewButton} onClick={fetchPage}>Retry</button>
          </div>
        ) : orders.length === 0 ? (
          <p className={styles.empty}>No {activeTab.emptyLabel} found for {config.name}.</p>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead><tr><th>Order ID</th><th>Customer</th><th>Mobile</th><th>Order Date</th><th>Items</th><th>Amount</th><th>Payment</th><th>Pay Status</th><th>Delivery</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {orders.map((o) => {
                  const d = detailMap[o.id];
                  const isNew = isNewSinceWatch(o.id, o.createdAt, sessionNewIds);
                  const txn = payByOrderId().get(o.id);
                  const itemQty = d ? d.items.reduce((s, i) => s + i.qty, 0) : null;
                  const payMethod = d?.paymentMethod ?? txn?.method ?? null;
                  const payStatus = txn ? (PAY_STATUS_LABEL[txn.status] ?? txn.status) : null;
                  const delivery = d?.address ? (d.address.city || d.address.addressLine || null) : null;
                  const next = NEXT_ORDER_STATUS[o.status];
                  const busy = rowSavingId === o.id;
                  return (
                    <tr key={o.id} className={isNew ? markStyles.rowNew : undefined}>
                      <td style={{ fontWeight: 700 }}>{o.orderNumber}{isNew && <> <NewOrderMark /></>}</td>
                      <td>{o.buyerName ?? '—'}</td>
                      <td>{o.buyerPhone ?? '—'}</td>
                      <td>{new Date(o.createdAt).toLocaleDateString()}</td>
                      <td>{itemQty ?? '—'}</td>
                      <td>{sym} {o.grandTotal.toLocaleString()}</td>
                      <td>{payMethod ?? '—'}</td>
                      <td>{payStatus ?? '—'}</td>
                      <td style={{ maxWidth: 240, whiteSpace: 'normal', wordBreak: 'break-word' }}>{delivery ?? '—'}</td>
                      <td><StatusBadge status={o.status} /></td>
                      <td>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          <button type="button" className={styles.viewButton} onClick={() => void openDetail(o.id)}>View</button>
                          {canEdit && next && (
                            <button
                              type="button"
                              className={styles.viewButton}
                              disabled={busy}
                              onClick={() => void advanceRowOrder(o.id, o.orderNumber, next)}
                              title={NEXT_ORDER_ACTION_LABEL[o.status] ?? next}
                            >
                              {busy ? '...' : (ROW_ADVANCE_LABEL[o.status] ?? 'Advance')}
                            </button>
                          )}
                          {canEdit && CANCELLABLE_ORDER_STATUSES.has(o.status) && (
                            <button
                              type="button"
                              className={styles.viewButton}
                              disabled={busy}
                              onClick={() => void cancelRowOrder(o.id, o.orderNumber)}
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        {totalPages > 1 && (
          <div className={styles.panelBody} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button type="button" className={styles.viewButton} disabled={page === 0} onClick={() => setPage(page - 1)}>Prev</button>
            <span className={styles.muted}>Page {page + 1} of {totalPages} ({totalElements} orders)</span>
            <button type="button" className={styles.viewButton} disabled={page + 1 >= totalPages} onClick={() => setPage(page + 1)}>Next</button>
          </div>
        )}
      </div>

      {!loading && orders.length > 0 && (
        <div className={styles.panel} style={{ marginTop: 16 }}>
          <button type="button" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '14px 18px', width: '100%', textAlign: 'left', fontWeight: 600, fontSize: 14, color: '#1E293B', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }} onClick={() => setInsightsOpen(!insightsOpen)}>
            <span>📊 Order Insights</span>
            <span style={{ fontSize: 12, color: '#64748B' }}>{insightsOpen ? '▲' : '▼'}</span>
          </button>
          {insightsOpen && (
            <div style={{ padding: '0 18px 16px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', marginBottom: 4 }}>Busiest Hour</div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: '#1E293B' }}>{orderPatterns.busiestHour.hour} <span style={{ fontSize: 12, color: '#64748B' }}>({orderPatterns.busiestHour.count} orders)</span></div>
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', marginBottom: 4 }}>Avg Basket Size</div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: '#1E293B' }}>{orderPatterns.avgBasketSize} items</div>
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', marginBottom: 4 }}>Top Payment Method</div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: '#1E293B' }}>{orderPatterns.topPaymentMethod}</div>
                </div>
              </div>
              {orderPatterns.channelBreakdown.length > 0 && (
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', marginBottom: 6 }}>Channel Breakdown</div>
                  {(() => {
                    const maxCount = Math.max(...orderPatterns.channelBreakdown.map(c => c.count), 1);
                    return orderPatterns.channelBreakdown.map(c => (
                      <div key={c.channel} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <span style={{ width: 80, fontSize: 13, color: '#1E293B', textTransform: 'capitalize' }}>{c.channel.toLowerCase()}</span>
                        <div style={{ flex: 1, height: 10, background: '#F1F5F9', borderRadius: 5, overflow: 'hidden' }}>
                          <div style={{ width: `${(c.count / maxCount) * 100}%`, height: '100%', background: 'linear-gradient(90deg, #22C55E, #14532D)', borderRadius: 5 }} />
                        </div>
                        <span style={{ width: 40, fontSize: 12, color: '#64748B', textAlign: 'right' }}>{c.count}</span>
                      </div>
                    ));
                  })()}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {detail && detailCustomer && (
        <SideDrawer title="Customer Details" onClose={() => { setDetail(null); setDetailCustomer(null); setDetailOrders([]); }} width={520}>
          {(() => {
            const drawerOrderCount = detailOrders.length;
            const drawerTotalSpent = detailOrders.reduce((s, o) => s + o.grandTotal, 0);
            const drawerAOV = drawerOrderCount > 0 ? Math.round(drawerTotalSpent / drawerOrderCount) : 0;
            const tier = drawerOrderCount >= 6 ? 'Gold' : drawerOrderCount >= 2 ? 'Silver' : 'Bronze';
            const clvResult = computeCLV([detailCustomer], detailOrders);
            const risk = clvResult[0]?.churnRisk ?? 'Low';
            const clv = clvResult[0]?.predictedCLV ?? 0;

            // ORDER DETAIL — rendered directly beneath the selected order's own
            // row inside the All Orders list below (only ever one expanded at a time).
            const selectedOrderDetail = (
              <div className={styles.drawerSection}>
                <div className={styles.drawerSectionTitle}>ORDER DETAIL — {detail.orderNumber}</div>
                <div className={styles.drawerInfoGrid}>
                  <div className={styles.drawerInfoCard}>
                    <div className={styles.drawerInfoLabel}>STATUS</div>
                    <div className={styles.drawerInfoValue} style={{ color: '#fff' }}>{detail.status.replace(/_/g, ' ')}</div>
                  </div>
                  <div className={styles.drawerInfoCard}>
                    <div className={styles.drawerInfoLabel}>PAYMENT</div>
                    <div className={styles.drawerInfoValue}>{detail.paymentMethod}</div>
                  </div>
                  <div className={styles.drawerInfoCard}>
                    <div className={styles.drawerInfoLabel}>DATE</div>
                    <div className={styles.drawerInfoValue}>{new Date(detail.createdAt).toLocaleString()}</div>
                  </div>
                  <div className={styles.drawerInfoCard}>
                    <div className={styles.drawerInfoLabel}>CHANNEL</div>
                    <div className={styles.drawerInfoValue}>{detail.channel.toLowerCase()}</div>
                  </div>
                </div>

                {/* Order Timeline — only the placed date is real; the backend stores no per-stage timestamps. */}
                <div style={{ marginTop: 12 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.5)', letterSpacing: 0.8, marginBottom: 8 }}>ORDER TIMELINE</div>
                  {detail.status === 'CANCELLED' ? (
                    <div style={{ fontSize: 12, color: '#FCA5A5' }}>Order placed {new Date(detail.createdAt).toLocaleString()} · Cancelled (no further stages)</div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {ORDER_STATUS_FLOW.map((step) => {
                        const reachedIdx = ORDER_STATUS_FLOW.indexOf(detail.status);
                        const idx = ORDER_STATUS_FLOW.indexOf(step);
                        const state = idx === 0 ? `Placed · ${new Date(detail.createdAt).toLocaleString()}` : idx <= reachedIdx ? 'Completed' : 'Pending';
                        return (
                          <div key={step} style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 12 }}>
                            <span style={{ width: 8, height: 8, borderRadius: '50%', background: idx <= reachedIdx ? '#16A34A' : 'rgba(255,255,255,0.2)', flexShrink: 0 }} />
                            <span style={{ color: '#fff', fontWeight: 600 }}>{step.replace(/_/g, ' ')}</span>
                            <span style={{ color: 'rgba(255,255,255,0.5)' }}>{state}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Status Actions — only the next allowed step (backend enforces the state machine); hidden without the edit permission */}
                {canEdit && (
                <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
                  {NEXT_ORDER_STATUS[detail.status] && (
                    <button
                      type="button"
                      disabled={statusSaving}
                      onClick={() => void advanceDetailStatus(NEXT_ORDER_STATUS[detail.status])}
                      style={{ background: '#16A34A', color: '#fff', padding: '9px 18px', borderRadius: 8, fontSize: 13, fontWeight: 700, border: 'none', cursor: statusSaving ? 'wait' : 'pointer', opacity: statusSaving ? 0.6 : 1 }}
                    >
                      {statusSaving ? 'Saving...' : NEXT_ORDER_ACTION_LABEL[detail.status]}
                    </button>
                  )}
                  {CANCELLABLE_ORDER_STATUSES.has(detail.status) && (
                    <button
                      type="button"
                      disabled={statusSaving}
                      onClick={() => void cancelDetailOrder()}
                      style={{ background: 'transparent', color: '#F87171', padding: '9px 18px', borderRadius: 8, fontSize: 13, fontWeight: 700, border: '1px solid #F87171', cursor: statusSaving ? 'wait' : 'pointer', opacity: statusSaving ? 0.6 : 1 }}
                    >
                      Cancel Order
                    </button>
                  )}
                </div>
                )}
                {statusError && <p style={{ color: '#FCA5A5', fontSize: 12, marginTop: 8 }}>{statusError}</p>}

                {/* Ordered Products with Costs */}
                {detail.items.length > 0 && (
                  <div style={{ marginTop: 12 }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.5)', letterSpacing: 0.8, marginBottom: 8 }}>PRODUCTS ORDERED ({detail.items.length})</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {detail.items.map((item, idx) => (
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
                        <span>Subtotal</span><span>{sym}{detail.itemTotal.toLocaleString()}</span>
                      </div>
                      {detail.discount > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'rgba(255,255,255,0.6)', marginBottom: 4 }}>
                          <span>Discount</span><span>-{sym}{detail.discount.toLocaleString()}</span>
                        </div>
                      )}
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'rgba(255,255,255,0.6)', marginBottom: 4 }}>
                        <span>Tax</span><span>{sym}{detail.tax.toLocaleString()}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'rgba(255,255,255,0.6)', marginBottom: 4 }}>
                        <span>Delivery</span><span>{sym}{detail.deliveryFee.toLocaleString()}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, fontWeight: 700, color: '#fff', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 6, marginTop: 4 }}>
                        <span>Grand Total</span><span>{sym}{detail.grandTotal.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );

            return (
              <div className={styles.drawerContent}>
                {/* Customer Profile Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 0', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                  <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg, #16A34A, #14532D)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                    {detail.buyer.name ? detail.buyer.name.charAt(0).toUpperCase() : '👤'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 18, fontWeight: 700, color: '#fff' }}>{detail.buyer.name ?? '—'}</div>
                    <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', marginTop: 2 }}>{detail.buyer.phone}</div>
                    {detail.buyer.email && <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>{detail.buyer.email}</div>}
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
                      <div className={styles.drawerInfoValue}>{detail.buyer.name ?? '—'}</div>
                    </div>
                    <div className={styles.drawerInfoCard}>
                      <div className={styles.drawerInfoLabel}>PHONE</div>
                      <div className={styles.drawerInfoValue}>{detail.buyer.phone}</div>
                    </div>
                    <div className={styles.drawerInfoCard}>
                      <div className={styles.drawerInfoLabel}>EMAIL</div>
                      <div className={styles.drawerInfoValue}>{detail.buyer.email ?? '—'}</div>
                    </div>
                    <div className={styles.drawerInfoCard}>
                      <div className={styles.drawerInfoLabel}>CUSTOMER ID</div>
                      <div className={styles.drawerInfoValue}>{detailCustomer ? customerNo(ordCustIndex, detailCustomer.id) : '—'}</div>
                    </div>
                    <div className={styles.drawerInfoCard}>
                      <div className={styles.drawerInfoLabel}>REGISTERED</div>
                      <div className={styles.drawerInfoValue}>{new Date(detailCustomer.registeredAt).toLocaleDateString()}</div>
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
                      <div className={styles.drawerInfoValue}>{detailCustomer.customerType ?? 'B2C'}</div>
                    </div>
                    {detail.address && (
                      <div className={styles.drawerInfoCard} style={{ gridColumn: 'span 2' }}>
                        <div className={styles.drawerInfoLabel}>DELIVERY ADDRESS</div>
                        <div className={styles.drawerInfoValue}>
                          {detail.address.addressLine}{detail.address.flat ? `, ${detail.address.flat}` : ''}, {detail.address.city}, {detail.address.state} {detail.address.pincode}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Orders List */}
                <div className={styles.drawerSection}>
                  <div className={styles.drawerSectionTitle}>ALL ORDERS ({drawerOrderCount})</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {detailOrders.sort((a, b) => b.createdAt.localeCompare(a.createdAt)).map((co) => (
                      <Fragment key={co.id}>
                        <div
                          onClick={() => void openDetail(co.id)}
                          style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            padding: '10px 12px', borderRadius: 8, cursor: 'pointer',
                            background: detail.id === co.id ? 'rgba(22,163,74,0.2)' : 'rgba(255,255,255,0.05)',
                            border: detail.id === co.id ? '1px solid rgba(22,163,74,0.4)' : '1px solid transparent',
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
                        {detail.id === co.id && selectedOrderDetail}
                      </Fragment>
                    ))}
                  </div>
                </div>

                {/* ORDER DETAIL — normally renders inline above, directly beneath its own
                    row. This fallback only fires when the selected order is not part of
                    that list (guest orders matched by email), so it never disappears. */}
                {!detailOrders.some((o) => o.id === detail.id) && selectedOrderDetail}

                {/* Previous Orders */}
                {detailOrders.length > 1 && (
                  <div className={styles.drawerSection}>
                    <div className={styles.drawerSectionTitle}>PREVIOUS ORDERS ({detailOrders.filter(o => o.id !== detail.id).length})</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {detailOrders
                        .filter(o => o.id !== detail.id)
                        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
                        .map((co) => (
                          <div
                            key={co.id}
                            onClick={() => void openDetail(co.id)}
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
    </div>
  );
}
