import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import type { MouseEvent as ReactMouseEvent } from 'react';
import { listOrders, getOrder } from '../../../api/adminOrdersApi';
import type { AdminOrderSummary, AdminOrderDetail } from '../../../types';
import { getAllCountries } from '../../../config/countryConfig';
import SideDrawer from '../../../components/admin/SideDrawer';
import LiveBadge from '../../../components/admin/LiveBadge';
import { useLivePoll } from '../../../hooks/useLivePoll';
import { findNewOrders, isNewSinceWatch, notifyNewOrders } from '../../../utils/adminOrderToast';
import NewOrderMark from '../../../components/admin/NewOrderMark';
import markStyles from '../../../components/admin/css/NewOrderMark.module.css';
import { ORDER_STATUS_FLOW } from '../../../utils/orderStatus';
import styles from '../css/SuperOrdersView.module.css';

const PAGE_SIZE = 15;
const ACTIVE_STATUSES = ['PLACED', 'CONFIRMED', 'PROCESSING'] as const;

/* Existing status pill colors — copied from SubDashboardHome (light backgrounds) */
const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  PLACED:     { bg: 'rgba(134,239,172,.15)', color: '#166534' },
  CONFIRMED:  { bg: 'rgba(74,222,128,.15)',  color: '#15803D' },
  PROCESSING: { bg: 'rgba(34,197,94,.15)',   color: '#16A34A' },
  SHIPPED:    { bg: 'rgba(34,197,94,.2)',    color: '#16A34A' },
  DELIVERED:  { bg: 'rgba(22,101,52,.15)',   color: '#166534' },
  CANCELLED:  { bg: 'rgba(134,239,172,.1)',  color: '#86EFAC' },
};

/* Dark-drawer variant — same colors PaymentDrawer already uses on #14532D */
const STATUS_COLORS_DARK: Record<string, { bg: string; color: string }> = {
  PLACED:     { bg: 'rgba(96,165,250,.18)',  color: '#60A5FA' },
  CONFIRMED:  { bg: 'rgba(20,184,166,.18)',  color: '#14B8A6' },
  PROCESSING: { bg: 'rgba(251,191,36,.18)',  color: '#FBBF24' },
  SHIPPED:    { bg: 'rgba(126,188,81,.18)',  color: '#7EBC51' },
  DELIVERED:  { bg: 'rgba(34,197,94,.18)',   color: '#4ADE80' },
  CANCELLED:  { bg: 'rgba(239,68,68,.18)',   color: '#F87171' },
};

const STATUS_TABS = [
  { key: '', label: 'All' },
  { key: 'PLACED', label: 'New' },
  { key: 'CONFIRMED', label: 'Confirmed' },
  { key: 'PROCESSING', label: 'Processing' },
  { key: 'SHIPPED', label: 'Shipped' },
  { key: 'DELIVERED', label: 'Delivered' },
  { key: 'CANCELLED', label: 'Cancelled' },
] as const;

function StatusPill({ status, dark = false, count }: { status: string; dark?: boolean; count?: number }) {
  const map = dark ? STATUS_COLORS_DARK : STATUS_COLORS;
  const c = map[status] ?? (dark
    ? { bg: 'rgba(148,163,184,.18)', color: '#94A3B8' }
    : { bg: '#F1F5F9', color: '#64748B' });
  return (
    <span style={{
      display: 'inline-block', padding: '3px 10px', borderRadius: 20,
      fontSize: 10.5, fontWeight: 700, letterSpacing: .4, background: c.bg, color: c.color,
      textTransform: 'uppercase' as const, whiteSpace: 'nowrap',
    }}>
      {status.replace(/_/g, ' ')}{count && count > 1 ? ` ×${count}` : ''}
    </span>
  );
}

function fmtDate(iso: string) {
  try { return new Date(iso).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }); }
  catch { return iso; }
}

function ageLabel(iso: string) {
  const ms = Date.now() - new Date(iso).getTime();
  if (ms < 0) return 'now';
  const m = Math.floor(ms / 60000);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ${m % 60}m`;
  return `${Math.floor(h / 24)}d`;
}

/* Past-order row: colored status pill + expand button showing THAT order's full
   detail inline (status/payment/timeline/products).
   MONITORING ONLY — super admin never changes status; sub-admin owns that. */
function PastOrderRow({ order, isCurrent, onOpen, age }: {
  order: AdminOrderSummary; isCurrent: boolean;
  onOpen: (id: string) => void; age?: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const [detail, setDetail] = useState<AdminOrderDetail | null>(null);
  const [loading, setLoading] = useState(false);

  async function loadDetail() {
    setLoading(true);
    try { setDetail(await getOrder(order.id)); }
    catch { setDetail(null); }
    finally { setLoading(false); }
  }

  async function toggle(e: ReactMouseEvent) {
    e.stopPropagation();
    if (expanded) { setExpanded(false); return; }
    setExpanded(true);
    if (!detail) await loadDetail();
  }

  const st = detail?.status ?? order.status;

  return (
    <div
      onClick={() => onOpen(order.id)}
      style={{
        padding: '10px 12px', borderRadius: 8, cursor: 'pointer',
        background: isCurrent ? 'rgba(22,163,74,.15)' : 'rgba(255,255,255,.05)',
        border: isCurrent ? '1px solid rgba(22,163,74,.4)' : '1px solid transparent',
        transition: 'all .15s',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>{order.orderNumber}</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,.5)', marginTop: 2 }}>
            {fmtDate(order.createdAt)} · {order.channel.toLowerCase()}
            {age && <span style={{ color: '#FBBF24', fontWeight: 600 }}> · ⏱ {ageLabel(order.createdAt)} ago</span>}
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#16A34A' }}>₹{order.grandTotal.toLocaleString()}</span>
          <StatusPill status={st} dark />
        </div>
        <button
          type="button"
          onClick={toggle}
          title={expanded ? 'Hide order detail' : 'Show order detail'}
          style={{
            marginLeft: 8, width: 26, height: 26, borderRadius: 6, flexShrink: 0,
            border: '1px solid rgba(255,255,255,.2)', background: 'rgba(255,255,255,.08)',
            color: '#fff', fontSize: 11, cursor: 'pointer', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
          }}
        >
          {expanded ? '▾' : '▸'}
        </button>
      </div>

      {expanded && (
        <div onClick={(e) => e.stopPropagation()} style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid rgba(255,255,255,.1)' }}>
          {loading || !detail ? (
            <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,.5)' }}>{loading ? 'Loading order detail…' : 'Order detail not available.'}</div>
          ) : (
            <>
              {/* Status / payment / date / channel */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                {[
                  { label: 'STATUS', pill: true, v: st },
                  { label: 'PAYMENT', v: detail.paymentMethod },
                  { label: 'DATE', v: fmtDate(detail.createdAt) },
                  { label: 'CHANNEL', v: detail.channel.toLowerCase() },
                ].map((f) => (
                  <div key={f.label} style={{ background: 'rgba(255,255,255,.05)', borderRadius: 6, padding: '8px 10px' }}>
                    <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: .6, textTransform: 'uppercase' as const, color: 'rgba(255,255,255,.4)', marginBottom: 3 }}>{f.label}</div>
                    {f.pill
                      ? <StatusPill status={f.v} dark />
                      : <div style={{ fontSize: 12, fontWeight: 500, color: '#fff' }}>{f.v}</div>}
                  </div>
                ))}
              </div>

              {/* Timeline */}
              <div style={{ marginTop: 8 }}>
                <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: .8, textTransform: 'uppercase' as const, color: 'rgba(255,255,255,.4)', marginBottom: 5 }}>ORDER TIMELINE</div>
                {st === 'CANCELLED' ? (
                  <div style={{ fontSize: 11.5, color: '#F87171' }}>Order cancelled — no further stages.</div>
                ) : (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 10px' }}>
                    {ORDER_STATUS_FLOW.map((step) => {
                      const idx = ORDER_STATUS_FLOW.indexOf(step);
                      const done = idx <= ORDER_STATUS_FLOW.indexOf(st);
                      return (
                        <span key={step} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11 }}>
                          <span style={{ width: 7, height: 7, borderRadius: '50%', background: done ? '#16A34A' : 'rgba(255,255,255,.2)', flexShrink: 0 }} />
                          <span style={{ color: done ? '#fff' : 'rgba(255,255,255,.45)', fontWeight: done ? 600 : 400 }}>{step.replace(/_/g, ' ')}</span>
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Monitoring note — status is owned by sub-admin */}
              <div style={{ marginTop: 8, fontSize: 11, color: 'rgba(255,255,255,.45)' }}>
                Status is managed by the sub-admin · refreshes automatically
              </div>

              {/* Products */}
              <div style={{ marginTop: 8 }}>
                <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: .8, textTransform: 'uppercase' as const, color: 'rgba(255,255,255,.4)', marginBottom: 5 }}>
                  PRODUCTS ORDERED ({detail.items.length})
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {detail.items.map((it, i) => (
                    <div key={`${it.name}-${i}`} style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      fontSize: 11.5, background: 'rgba(255,255,255,.04)', borderRadius: 6, padding: '6px 8px',
                    }}>
                      <span style={{ color: 'rgba(255,255,255,.85)', flex: 1, minWidth: 0 }}>
                        {it.name}
                        <span style={{ color: 'rgba(255,255,255,.45)' }}>
                          {' '}{it.weightKg ? `${it.weightKg}kg` : `×${it.qty}`}{it.boxType ? ` · ${it.boxType}` : ''}
                        </span>
                      </span>
                      <span style={{ color: '#16A34A', fontWeight: 700, marginLeft: 8 }}>₹{it.lineTotal.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 700, color: '#16A34A', marginTop: 6, paddingTop: 6, borderTop: '1px solid rgba(255,255,255,.1)' }}>
                  <span>Grand Total</span><span>₹{detail.grandTotal.toLocaleString()}</span>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

/* ═══════════ Order Detail Drawer ═══════════ */
function OrderDetailDrawer({ orderId, onClose, onSwitchOrder }: {
  orderId: string; onClose: () => void; onSwitchOrder?: (id: string) => void;
}) {
  const [detail, setDetail] = useState<AdminOrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [allOrders, setAllOrders] = useState<AdminOrderSummary[]>([]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getOrder(orderId).then(async (d) => {
      if (cancelled) return;
      setDetail(d);
      try {
        // A blank phone must NEVER drop the param: axios omits it and the backend
        // then returns the 200 latest orders of EVERY customer — tier/spend/AOV
        // would be computed from unrelated rows.
        if (d.buyer.phone) {
          const res = await listOrders({ buyerPhone: d.buyer.phone, size: 200 });
          if (!cancelled) setAllOrders(res.content);
        } else if (!cancelled) {
          setAllOrders([d]);
        }
      } catch { if (!cancelled) setAllOrders([]); }
    }).catch(() => { if (!cancelled) setDetail(null); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [orderId]);

  if (loading) {
    return <SideDrawer title="Order Details" onClose={onClose} width={520}>
      <p style={{ color: 'rgba(255,255,255,.5)', textAlign: 'center', padding: '40px 0' }}>Loading…</p>
    </SideDrawer>;
  }
  if (!detail) {
    return <SideDrawer title="Order Details" onClose={onClose} width={520}>
      <p style={{ color: 'rgba(255,255,255,.5)', textAlign: 'center', padding: '40px 0' }}>Order not found.</p>
    </SideDrawer>;
  }

  const orderCount = allOrders.length;
  const totalSpent = allOrders.reduce((s, o) => s + o.grandTotal, 0);
  const aov = orderCount > 0 ? Math.round(totalSpent / orderCount) : 0;
  const tier = orderCount >= 6 ? 'Gold' : orderCount >= 2 ? 'Silver' : 'Bronze';

  return (
    <SideDrawer title={`Order #${detail.orderNumber}`} onClose={onClose} width={520}>
      {/* Customer header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, paddingBottom: 16, borderBottom: '1px solid rgba(255,255,255,.12)' }}>
        <div style={{
          width: 52, height: 52, borderRadius: '50%',
          background: 'linear-gradient(135deg, #16A34A, #14532D)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 20, fontWeight: 700, color: '#fff', flexShrink: 0,
        }}>
          {detail.buyer.name ? detail.buyer.name.charAt(0).toUpperCase() : '👤'}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>{detail.buyer.name ?? '—'}</div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,.6)', marginTop: 2 }}>{detail.buyer.phone}</div>
          {detail.buyer.email && <div style={{ fontSize: 12, color: 'rgba(255,255,255,.45)' }}>{detail.buyer.email}</div>}
        </div>
        <span style={{
          padding: '3px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700, color: '#fff',
          background: tier === 'Gold' ? '#B8860B' : tier === 'Silver' ? '#9CA3AF' : '#8B6914',
        }}>{tier}</span>
      </div>

      {/* Stats strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 110px), 1fr))', gap: 10, padding: '14px 0', borderBottom: '1px solid rgba(255,255,255,.12)' }}>
        {[
          { label: 'ORDERS', value: String(orderCount) },
          { label: 'TOTAL SPENT', value: `₹${totalSpent.toLocaleString()}` },
          { label: 'AOV', value: `₹${aov.toLocaleString()}` },
          { label: 'TIER', value: tier },
        ].map((s) => (
          <div key={s.label} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: .7, textTransform: 'uppercase' as const, color: 'rgba(255,255,255,.4)', marginBottom: 4 }}>{s.label}</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Customer Info */}
      <div style={{ marginTop: 18 }}>
        <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase' as const, color: 'rgba(255,255,255,.45)', marginBottom: 10 }}>CUSTOMER INFORMATION</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {[
            { label: 'FULL NAME', value: detail.buyer.name ?? '—' },
            { label: 'PHONE', value: detail.buyer.phone },
            { label: 'EMAIL', value: detail.buyer.email ?? '—' },
            { label: 'COUNTRY', value: detail.countryCode },
          ].map((f) => (
            <div key={f.label} style={{ background: 'rgba(255,255,255,.06)', borderRadius: 8, padding: '10px 12px' }}>
              <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: .6, textTransform: 'uppercase' as const, color: 'rgba(255,255,255,.4)', marginBottom: 3 }}>{f.label}</div>
              <div style={{ fontSize: 13, fontWeight: 500, color: '#fff', wordBreak: 'break-word' }}>{f.value}</div>
            </div>
          ))}
          {detail.address && (
            <div style={{ background: 'rgba(255,255,255,.06)', borderRadius: 8, padding: '10px 12px', gridColumn: 'span 2' }}>
              <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: .6, textTransform: 'uppercase' as const, color: 'rgba(255,255,255,.4)', marginBottom: 3 }}>DELIVERY ADDRESS</div>
              <div style={{ fontSize: 13, fontWeight: 500, color: '#fff' }}>
                {detail.address.addressLine}{detail.address.flat ? `, ${detail.address.flat}` : ''}, {detail.address.city}, {detail.address.state} {detail.address.pincode}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* All Orders — each row expands (▸) to THAT order's full detail.
          The old always-visible bottom "ORDER DETAIL" block was removed (duplicate). */}
      {orderCount > 0 && (
        <div style={{ marginTop: 18 }}>
          <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase' as const, color: 'rgba(255,255,255,.45)', marginBottom: 10 }}>ALL ORDERS ({orderCount}) · tap ▸ for detail</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {[...allOrders].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).map((co) => (
              <PastOrderRow
                key={co.id}
                order={co}
                isCurrent={detail.id === co.id}
                onOpen={(id) => onSwitchOrder?.(id)}
              />
            ))}
          </div>
        </div>
      )}
    </SideDrawer>
  );
}

/* ═══════════ Active Orders Drawer (⚡) ═══════════ */
function ActiveOrdersDrawer({ buyerPhone, buyerName, onClose, onOpenOrder }: {
  buyerPhone: string; buyerName: string; onClose: () => void; onOpenOrder?: (id: string) => void;
}) {
  const [orders, setOrders] = useState<AdminOrderSummary[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchActive = useCallback(async () => {
    try {
      const results = await Promise.all(
        ACTIVE_STATUSES.map((s) => listOrders({ buyerPhone, status: s, size: 50 }))
      );
      const merged = results.flatMap((r) => r.content);
      merged.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setOrders(merged);
    } catch { /* keep previous */ }
    finally { setLoading(false); }
  }, [buyerPhone]);

  useEffect(() => {
    // blank phone → axios would omit buyerPhone and the backend returns everyone's orders
    if (!buyerPhone) { setLoading(false); return; }
    void fetchActive();
  }, [buyerPhone, fetchActive]);
  // Feature A — the drawer rides the shared 10s live tick (pauses with the tab hidden).
  useLivePoll(fetchActive, { intervalMs: 10_000, enabled: !!buyerPhone });

  return (
    <SideDrawer title={`⚡ Active Orders — ${buyerName}`} onClose={onClose} width={480}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8, fontSize: 12,
        color: 'rgba(255,255,255,.55)', paddingBottom: 14,
        borderBottom: '1px solid rgba(255,255,255,.1)', marginBottom: 14,
      }}>
        <span style={{
          width: 8, height: 8, borderRadius: '50%', background: '#22C55E',
          animation: 'pulse 2s infinite', flexShrink: 0,
        }} />
        Placed / Confirmed / Processing only · tap ▸ for products &amp; timeline · auto-refresh 30s
      </div>
      {loading ? (
        <p style={{ color: 'rgba(255,255,255,.5)', textAlign: 'center', padding: '40px 0' }}>Loading active orders…</p>
      ) : orders.length === 0 ? (
        <p style={{ color: 'rgba(255,255,255,.5)', textAlign: 'center', padding: '40px 0' }}>No active orders for this customer.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {orders.map((o) => (
            <PastOrderRow
              key={o.id}
              order={o}
              isCurrent={false}
              age
              onOpen={(id) => onOpenOrder?.(id)}
            />
          ))}
        </div>
      )}
      <div style={{
        marginTop: 16, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,.1)',
        fontSize: 12.5, fontWeight: 600, color: 'rgba(255,255,255,.5)', textAlign: 'center',
      }}>
        {orders.length} active order{orders.length !== 1 ? 's' : ''}
      </div>
    </SideDrawer>
  );
}

/* ═══════════ Main SuperOrdersView ═══════════ */
export default function SuperOrdersView() {
  const [orders, setOrders] = useState<AdminOrderSummary[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [status, setStatus] = useState('');
  const [country, setCountry] = useState('');
  const [countryOpen, setCountryOpen] = useState(false);
  const [countryCounts, setCountryCounts] = useState<Record<string, number>>({});
  const countryButtonRef = useRef<HTMLButtonElement>(null);
  const [countryMenuPos, setCountryMenuPos] = useState({ top: 0, left: 0, width: 230 });
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [quickView, setQuickView] = useState<{ phone: string; name: string } | null>(null);
  const [detailId, setDetailId] = useState<string | null>(null);
  /** Last order-id set seen by `load` — the new-order toast diffs silent
      refreshes against it; non-silent loads (mount, filter, page) rebase it. */
  const seenOrderIdsRef = useRef<Set<string> | null>(null);
  /** Session-new order ids — rows wear a persistent NEW pill on top of the
      transient toast, so admins can still identify fresh orders later. */
  const [sessionNewIds, setSessionNewIds] = useState<Set<string>>(new Set());

  /* silent = live refresh (Feature A): no spinner flash, and a failed tick
     throws instead of wiping the visible rows. */
  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await listOrders({ status: status || undefined, country: country || undefined, page, size: PAGE_SIZE });
      setOrders(res.content);
      setTotalPages(res.totalPages);
      setTotal(res.totalElements);
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
            const sum = arr.reduce((s, o) => s + o.grandTotal, 0);
            return arr.length === 1
              ? `${arr[0].buyerName ?? arr[0].orderNumber} · ₹${sum.toLocaleString()}`
              : `${arr.length} orders · ₹${sum.toLocaleString()} total`;
          });
        }
      }
    } catch (err) {
      if (silent) throw err;
      setOrders([]);
    } finally {
      if (!silent) setLoading(false);
    }
  }, [status, country, page]);

  const loadCounts = useCallback(async (silent = false) => {
    try {
      const entries = await Promise.all(
        STATUS_TABS.map(async (t) => {
          const r = await listOrders({ status: t.key || undefined, country: country || undefined, size: 1 });
          return [t.key || 'ALL', r.totalElements] as const;
        })
      );
      setCounts(Object.fromEntries(entries));
    } catch (err) {
      if (silent) throw err;
    }
  }, [country]);

  useEffect(() => { void load(); }, [load]);
  useEffect(() => { void loadCounts(); }, [loadCounts]);

  /* Per-country order totals for the country switcher menu. Extracted into a
     callback so the live tick (Feature A) can refresh them too. */
  const loadCountryCounts = useCallback(async () => {
    const entries = await Promise.all(
      getAllCountries().map(async (cc) => {
        const r = await listOrders({ country: cc.code, size: 1 });
        return [cc.code, r.totalElements] as const;
      })
    );
    setCountryCounts(Object.fromEntries(entries));
  }, []);
  useEffect(() => { void loadCountryCounts().catch(() => { /* ignore */ }); }, [loadCountryCounts]);

  /* Country menu placement — portaled to document.body so no ancestor
     transform/stacking context can clip it. Closes on scroll/resize/Escape. */
  useEffect(() => {
    if (!countryOpen) return;
    const place = () => {
      const rect = countryButtonRef.current?.getBoundingClientRect();
      if (!rect) return;
      const menuW = Math.max(rect.width, 230);
      let left = rect.right - menuW;
      if (left < 8) left = 8;
      setCountryMenuPos({ top: rect.bottom + 8, left, width: menuW });
    };
    place();
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setCountryOpen(false); };
    const onScroll = () => setCountryOpen(false);
    window.addEventListener('keydown', onKey);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', place);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', place);
    };
  }, [countryOpen]);

  /* Feature A — live refresh: one 10s tick re-reads the list, the status-tab
     counts and the per-country totals. Silent — no spinner, no row wipe on a
     flaky call (the hook flips to Reconnecting and backs off instead). */
  const livePoll = useLivePoll(async () => {
    await load(true); // the list is the critical leg — its failure drives backoff
    void loadCounts(true).catch(() => { /* counts are cosmetic */ });
    void loadCountryCounts().catch(() => { /* same */ });
  }, { intervalMs: 10_000 });

  /* Same account (phone) → ONE row: combined count/amount + all statuses.
     Orders without a phone stay as individual rows (key = order id). */
  const groupedRows = useMemo(() => {
    const map = new Map<string, {
      key: string; phone: string | null; name: string; country: string | null;
      latest: AdminOrderSummary; total: number; orders: AdminOrderSummary[];
      statuses: { status: string; n: number }[]; hasActive: boolean;
    }>();
    for (const o of [...orders].sort((a, b) => b.createdAt.localeCompare(a.createdAt))) {
      const key = o.buyerPhone ?? o.id;
      let g = map.get(key);
      if (!g) {
        g = {
          key, phone: o.buyerPhone, name: o.buyerName ?? '—', country: o.countryCode,
          latest: o, total: 0, orders: [], statuses: [], hasActive: false,
        };
        map.set(key, g);
      }
      g.orders.push(o);
      g.total += o.grandTotal;
      if (o.createdAt >= g.latest.createdAt) { g.latest = o; g.name = o.buyerName ?? g.name; }
      const st = g.statuses.find((s) => s.status === o.status);
      if (st) st.n += 1; else g.statuses.push({ status: o.status, n: 1 });
      if (ACTIVE_STATUSES.includes(o.status as typeof ACTIVE_STATUSES[number])) g.hasActive = true;
    }
    return [...map.values()].sort((a, b) => b.latest.createdAt.localeCompare(a.latest.createdAt));
  }, [orders]);

  /** A grouped row is "new" when ANY of its orders is session-new or < 24h old. */
  const groupIsNew = (g: (typeof groupedRows)[number]) =>
    g.orders.some((o) => isNewSinceWatch(o.id, o.createdAt, sessionNewIds));
  const newGroupedCount = groupedRows.filter(groupIsNew).length;

  return (
    <div>
      {/* ── Banner ── */}
      <div className={styles.banner}>
        <div className={styles.bannerContent}>
          <div className={styles.bannerIcon}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <h2 className={styles.bannerTitle}>Orders</h2>
              {newGroupedCount > 0 && <NewOrderMark label={`${newGroupedCount} new`} onDark />}
              <LiveBadge live={livePoll} variant="onDark" />
            </div>
            <p className={styles.bannerSubtitle}>{country ? `${getAllCountries().find((cc) => cc.code === country)?.name ?? country} · ${total} orders · newest first` : `All countries · ${total} orders · newest first`}</p>
          </div>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div className={styles.kpiGrid}>
        <div className={`${styles.kpiCard} ${styles.kpiGreen}`}>
          <div className={styles.kpiTitle}>TOTAL ORDERS</div>
          <div className={styles.kpiAmount}>{counts.ALL ?? '—'}</div>
        </div>
        <div className={`${styles.kpiCard} ${styles.kpiTeal}`}>
          <div className={styles.kpiTitle}>ACTIVE (IN-PROCESS)</div>
          <div className={styles.kpiAmount}>
            {(counts.PLACED ?? 0) + (counts.CONFIRMED ?? 0) + (counts.PROCESSING ?? 0) || '—'}
          </div>
        </div>
        <div className={`${styles.kpiCard} ${styles.kpiAmber}`}>
          <div className={styles.kpiTitle}>DELIVERED</div>
          <div className={styles.kpiAmount}>{counts.DELIVERED ?? '—'}</div>
        </div>
        <div className={`${styles.kpiCard} ${styles.kpiRed}`}>
          <div className={styles.kpiTitle}>CANCELLED</div>
          <div className={styles.kpiAmount}>{counts.CANCELLED ?? '—'}</div>
        </div>
      </div>

      {/* ── Tabs + country switcher ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 20 }}>
      <div className={styles.tabs} style={{ marginBottom: 0 }}>
        {STATUS_TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            className={`${styles.tab} ${status === t.key ? styles.tabActive : ''}`}
            onClick={() => { setStatus(t.key); setPage(0); }}
          >
            {t.label}
            <span className={styles.tabCount}>{counts[t.key || 'ALL'] ?? 0}</span>
          </button>
        ))}
      </div>
      <div style={{ flexShrink: 0 }}>
        <button
          ref={countryButtonRef}
          type="button"
          onClick={() => setCountryOpen((o) => !o)}
          aria-haspopup="listbox"
          aria-expanded={countryOpen}
          title="Filter orders by country"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 20, border: '1px solid #E2E8F0', fontSize: 13, fontWeight: 500, background: country ? '#2E7D32' : '#fff', color: country ? '#fff' : '#64748B', cursor: 'pointer' }}
        >
          {(() => {
            const sel = getAllCountries().find((cc) => cc.code === country);
            return sel ? (
              <img src={sel.flagImg} alt="" style={{ width: 22, height: 15, objectFit: 'cover', borderRadius: 3 }} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            ) : (
              <span aria-hidden="true">🌐</span>
            );
          })()}
          {getAllCountries().find((cc) => cc.code === country)?.name ?? 'All countries'} ({country ? (countryCounts[country] ?? total) : (Object.values(countryCounts).reduce((s, n) => s + n, 0) || total)})
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: countryOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}><polyline points="6 9 12 15 18 9" /></svg>
        </button>
        {countryOpen && createPortal(
          <>
            <div style={{ position: 'fixed', inset: 0, zIndex: 9998 }} onClick={() => setCountryOpen(false)} />
            <div role="listbox" aria-label="Filter orders by country" style={{ position: 'fixed', top: countryMenuPos.top, left: countryMenuPos.left, width: countryMenuPos.width, zIndex: 9999, background: '#fff', border: '1px solid #E2E8F0', borderRadius: 12, boxShadow: '0 12px 32px rgba(0,0,0,.18)', padding: 6 }}>
              <button
                type="button"
                role="option"
                aria-selected={!country}
                onClick={() => { setCountry(''); setPage(0); setCountryOpen(false); }}
                style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '9px 12px', borderRadius: 8, border: 'none', background: !country ? '#F0FDF4' : 'transparent', cursor: 'pointer', fontSize: 13, fontWeight: !country ? 700 : 500, color: '#1E293B', textAlign: 'left' }}
              >
                <span aria-hidden="true" style={{ width: 22, textAlign: 'center' }}>🌐</span>
                <span style={{ flex: 1 }}>All countries ({Object.values(countryCounts).reduce((s, n) => s + n, 0) || total})</span>
                {!country && <span aria-hidden="true" style={{ color: '#2E7D32', fontWeight: 800 }}>✓</span>}
              </button>
              {getAllCountries().map((cc) => {
                const n = countryCounts[cc.code] ?? 0;
                const active = country === cc.code;
                return (
                  <button
                    key={cc.code}
                    type="button"
                    role="option"
                    aria-selected={active}
                    onClick={() => { setCountry(cc.code); setPage(0); setCountryOpen(false); }}
                    style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '9px 12px', borderRadius: 8, border: 'none', background: active ? '#F0FDF4' : 'transparent', cursor: 'pointer', fontSize: 13, fontWeight: active ? 700 : 500, color: '#1E293B', textAlign: 'left' }}
                  >
                    <img src={cc.flagImg} alt="" style={{ width: 22, height: 15, objectFit: 'cover', borderRadius: 3, flexShrink: 0 }} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                    <span style={{ flex: 1 }}>{cc.name} ({n})</span>
                    {active && <span aria-hidden="true" style={{ color: '#2E7D32', fontWeight: 800 }}>✓</span>}
                  </button>
                );
              })}
            </div>
          </>,
          document.body,
        )}
      </div>
      </div>

      {/* ── Table Panel ── */}
      <div className={styles.panel}>
        <div className={styles.panelHeader}>
          <h3 className={styles.panelTitle}>{country ? `Orders in ${getAllCountries().find((cc) => cc.code === country)?.name ?? country}` : 'All Orders'}</h3>
        </div>
        {loading ? (
          <div className={styles.placeholder}>Loading orders…</div>
        ) : orders.length === 0 ? (
          <div className={styles.placeholder}>No orders found.</div>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Order ID</th><th>Customer</th><th>Phone</th><th>Country</th>
                  <th>Date</th><th>Amount</th><th>Status</th><th>View</th>
                </tr>
              </thead>
              <tbody>
                {groupedRows.map((g) => (
                  <tr key={g.key} className={groupIsNew(g) ? markStyles.rowNew : undefined}>
                    <td style={{ fontWeight: 600 }}>
                      {g.orders.length > 1 ? `${g.orders.length} orders` : `#${g.orders[0].orderNumber}`}{groupIsNew(g) && <> <NewOrderMark /></>}
                    </td>
                    <td>{g.name}</td>
                    <td>{g.phone ?? '—'}</td>
                    <td>{g.country ?? '—'}</td>
                    <td>{fmtDate(g.latest.createdAt)}</td>
                    <td style={{ fontWeight: 600 }}>₹{g.total.toFixed(0)}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        {g.statuses.map((s) => <StatusPill key={s.status} status={s.status} count={s.n} />)}
                      </div>
                    </td>
                    <td>
                      <div className={styles.actions}>
                        <button type="button" className={styles.viewBtn} onClick={() => setDetailId(g.latest.id)} title="View details">
                          👁
                        </button>
                        {g.phone && g.hasActive && (
                          <button
                            type="button"
                            className={styles.boltBtn}
                            title="Show this customer's active orders (Placed/Confirmed/Processing)"
                            onClick={() => setQuickView({ phone: g.phone!, name: g.name })}
                          >
                            ⚡
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {totalPages > 1 && (
          <div className={styles.pagination}>
            <span>Page {page + 1} of {totalPages} · {total} orders</span>
            <div className={styles.pageBtns}>
              <button type="button" className={styles.pageBtn} disabled={page === 0} onClick={() => setPage(page - 1)}>← Prev</button>
              <button type="button" className={styles.pageBtn} disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)}>Next →</button>
            </div>
          </div>
        )}
      </div>

      {/* ── Drawers ── */}
      {quickView && (
        <ActiveOrdersDrawer
          buyerPhone={quickView.phone ?? ''}
          buyerName={quickView.name}
          onClose={() => setQuickView(null)}
          onOpenOrder={(id) => { setQuickView(null); setDetailId(id); }}
        />
      )}
      {detailId && (
        <OrderDetailDrawer
          orderId={detailId}
          onClose={() => setDetailId(null)}
          onSwitchOrder={(id) => setDetailId(id)}
        />
      )}
    </div>
  );
}
