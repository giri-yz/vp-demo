import { useCallback, useEffect, useState, type MouseEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import * as ordersApi from '../../api/ordersApi';
import type { Order } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useCountry } from '../../context/CountryContext';
import { formatPrice } from '../../utils/currency';
import { mediaUrl } from '../../utils/mediaUrl';
import { getErrorMessage } from '../../utils/errors';
import { useRipple } from '../../components/common/Ripple';
import { useLanguage } from '../../i18n/LanguageContext';
import { getProductName } from '../../i18n/productNames';
import ChatPanel from '../../components/common/ChatPanel';
import AccountLayout from './AccountLayout';
import s from './css/Orders.module.css';

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

/** Newest first — belt & braces in case the API ever returns an unsorted page. */
function sortByNewest(list: Order[]): Order[] {
  return [...list].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export default function Orders() {
  const { t, lang } = useLanguage();
  const { user } = useAuth();
  const { country } = useCountry();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrders, setExpandedOrders] = useState<Record<string, boolean>>({});
  const rippleDark = useRipple('dark');
  const [loadError, setLoadError] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const STATUS_CONFIG: Record<string, { label: string; icon: string; cls: string }> = {
    PLACED:     { label: t('account.statusPlaced'),     icon: 'fas fa-check-circle',    cls: 'badgeInfo' },
    CONFIRMED:  { label: t('account.statusConfirmed'),  icon: 'fas fa-clipboard-check', cls: 'badgeInfo' },
    PROCESSING: { label: t('account.statusProcessing'), icon: 'fas fa-cog',             cls: 'badgeWarning' },
    SHIPPED:    { label: t('account.statusShipped'),    icon: 'fas fa-truck',           cls: 'badgeWarning' },
    DELIVERED:  { label: t('account.statusDelivered'),  icon: 'fas fa-box-open',        cls: 'badgeSuccess' },
    CANCELLED:  { label: t('account.statusCancelled'),  icon: 'fas fa-times-circle',    cls: 'badgeDanger' },
  };
  type FilterKey = 'ALL' | 'PLACED' | 'PROCESSING' | 'CANCELLED';
  type StatusFilter = Exclude<FilterKey, 'ALL'>;
  const [filter, setFilter] = useState<StatusFilter | null>(null);
  const CANCELLABLE = ['PLACED', 'CONFIRMED', 'PROCESSING'];
  const FILTER_GROUPS: Record<StatusFilter, string[]> = {
    PLACED: ['PLACED', 'CONFIRMED'],
    PROCESSING: ['PROCESSING', 'SHIPPED', 'DELIVERED'],
    CANCELLED: ['CANCELLED'],
  };
  const filters: Array<{ key: FilterKey; icon: string; label: string; cls: string }> = [
    { key: 'ALL', icon: 'fas fa-list', label: t('account.tabAll'), cls: s.chipAll },
    { key: 'PLACED', icon: 'fas fa-check-circle', label: t('account.statusPlaced'), cls: s.chipPlaced },
    { key: 'PROCESSING', icon: 'fas fa-cog', label: t('account.statusProcessing'), cls: s.chipProcessing },
    { key: 'CANCELLED', icon: 'fas fa-times-circle', label: t('account.statusCancelled'), cls: s.chipCancelled },
  ];
  const visibleOrders = filter ? orders.filter(o => FILTER_GROUPS[filter].includes(o.status)) : orders;

  const [chatOpen, setChatOpen] = useState(false);
  const [cancelTarget, setCancelTarget] = useState<Order | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState('');

  function openCancel(order: Order, e: MouseEvent) {
    e.stopPropagation();
    setCancelError('');
    setCancelTarget(order);
  }

  function closeCancel() {
    if (cancelling) return;
    setCancelTarget(null);
    setCancelError('');
  }

  async function confirmCancel() {
    if (!cancelTarget) return;
    setCancelling(true);
    setCancelError('');
    try {
      const updated = await ordersApi.cancelOrder(cancelTarget.id);
      setOrders(prev => prev.map(o => (o.id === updated.id ? updated : o)));
      setCancelTarget(null);
    } catch (err) {
      setCancelError(getErrorMessage(err, t('account.cancelOrderFailed')));
    } finally {
      setCancelling(false);
    }
  }

  const [chatOrderContext, setChatOrderContext] = useState<{ orderNumber: string; items: string[]; status: string; total: number; createdAt: string } | null>(null);

  const refreshOrders = useCallback(async () => {
    if (!user) return;
    setRefreshing(true);
    try {
      const apiOrders = await ordersApi.listOrders();
      setOrders(sortByNewest(apiOrders));
      setLoadError(false);
    } catch (err) {
      /* Keep whatever is on screen, but FLAG it — never silently show a stale
       * or empty list while the API is failing (that hid new orders). */
      console.error('[orders] refresh failed', err);
      setLoadError(true);
    } finally {
      setRefreshing(false);
    }
  }, [user]);

  function toggleFilter(key: FilterKey) {
    const next = key === 'ALL' || filter === key ? null : key;
    setFilter(next);
    if (next !== filter) void refreshOrders();
  }

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        if (user) {
          const apiOrders = await ordersApi.listOrders();
          if (!cancelled) {
            setOrders(sortByNewest(apiOrders));
            setLoadError(false);
          }
        } else {
          if (!cancelled) {
            setOrders([]);
            setLoadError(false);
          }
        }
      } catch (err) {
        console.error('[orders] initial load failed', err);
        if (!cancelled) setLoadError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [user]);

  /* Re-pull whenever the tab regains focus or a login just completed — the list
   * may have loaded before the session cookie was ready, or an order may have
   * been placed while this tab was in the background. */
  useEffect(() => {
    if (!user) return;
    const onFocus = () => { void refreshOrders(); };
    const onVisibility = () => {
      if (document.visibilityState === 'visible') void refreshOrders();
    };
    const onLogin = () => { void refreshOrders(); };
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('auth:login', onLogin);
    return () => {
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('auth:login', onLogin);
    };
  }, [user, refreshOrders]);

  return (
    <AccountLayout title={t('account.orders')} breadcrumb={t('account.orders')}>
      <div className={s.page}>
        <div className={s.header}>
          <div className={s.titleWrap}>
            <h1 className={s.h1}>{t('account.orderHistory')}</h1>
            {visibleOrders.length > 0 && (
              <span className={s.orderCount}>{visibleOrders.length} {visibleOrders.length === 1 ? t('account.order') : t('account.ordersPlural')}</span>
            )}
            <button
              type="button"
              className={s.refreshBtn}
              onClick={() => void refreshOrders()}
              disabled={refreshing || loading}
              aria-label={t('account.refresh')}
              title={t('account.refresh')}
            >
              <i className={refreshing ? 'fas fa-spinner fa-spin' : 'fas fa-sync-alt'} />
            </button>
          </div>
          <div className={s.filterChips}>
            {filters.map(f => (
              <button
                key={f.key}
                type="button"
                className={`${s.chip} ${f.cls} ${filter === (f.key === 'ALL' ? null : f.key) ? s.chipActive : ''}`}
                onClick={() => toggleFilter(f.key)}
              >
                <i className={f.icon} /> {f.label}
              </button>
            ))}
          </div>
        </div>

      {!loading && loadError && orders.length > 0 && (
        <div className={s.loadWarn} role="alert">
          <i className="fas fa-exclamation-triangle" /> {t('account.ordersLoadError')}
        </div>
      )}

      {loading ? (
        <div className={s.empty}>
          <div className={s.spinnerWrap}><div className={s.spinner} /></div>
          <p className={s.emptyText}>{t('account.loadingOrders')}</p>
        </div>
      ) : loadError && orders.length === 0 ? (
        <div className={s.emptyState}>
          <div className={s.emptyIconWrap}>
            <i className="fas fa-exclamation-circle" />
          </div>
          <h4>{t('account.ordersLoadError')}</h4>
          <button
            type="button"
            className={s.shopBtn}
            onClick={() => { setLoadError(false); void refreshOrders(); }}
          >
            <i className="fas fa-sync-alt" /> {t('account.retry')}
          </button>
        </div>
      ) : orders.length === 0 ? (
        <div className={s.emptyState}>
          <div className={s.emptyIconWrap}>
            <i className="fas fa-shopping-bag" />
          </div>
          <h4>{t('account.noOrdersYet')}</h4>
          <p>{t('account.noOrdersDesc')}</p>
          <Link to="/shop" className={s.shopBtn}>
            <i className="fas fa-store" /> {t('account.startShopping')}
          </Link>
        </div>
      ) : visibleOrders.length === 0 ? (
        <div className={s.emptyState}>
          <div className={s.emptyIconWrap}>
            <i className="fas fa-filter" />
          </div>
          <h4>{t('account.noOrdersYet')}</h4>
          <p>{t('account.noOrdersDesc')}</p>
        </div>
      ) : (
        <div className={s.ordersList}>
          {visibleOrders.map((order) => {
            const st = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.PLACED;
            const maxThumbs = 14;
            const isExpanded = expandedOrders[order.id] ?? false;
            const visibleItems = isExpanded ? order.items : order.items.slice(0, maxThumbs);
            const extraCount = order.items.length - maxThumbs;
            return (
              <div
                key={order.id}
                className={s.orderCard}
                onClick={(e) => { rippleDark(e); navigate(`/account/orders/${order.id}`); }}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigate(`/account/orders/${order.id}`); } }}
                role="button"
                tabIndex={0}
                style={{ position: 'relative', overflow: 'hidden', cursor: 'pointer' }}
              >
                {/* Card Top Row */}
                <div className={s.cardTop}>
                  <div className={s.cardHeadRow}>
                    <div className={s.cardIcon}>
                      <i className="fas fa-box-open" />
                    </div>
                    <div className={s.cardInfo}>
                      <span className={s.orderNum}>#{order.orderNumber}</span>
                      <span className={s.orderDateFull}>
                        <i className="fas fa-calendar-alt" /> {t('account.placedOn')} {formatDate(order.createdAt)}, {formatTime(order.createdAt)}
                      </span>
                    </div>
                    <span className={`${s.badge} ${s[st.cls]}`}>
                      <i className={st.icon} /> {st.label}
                    </span>
                  </div>
                  <div className={s.cardMetaRow}>
                    <div className={s.deliveryInfo}>
                      <div className={s.deliveryIcon}><i className="fas fa-truck" /></div>
                      <div className={s.deliveryText}>
                        <span className={s.deliveryLabel}>{t('account.expectedDelivery')}</span>
                        <span className={s.deliveryDate}>{'Within 30 minutes'}</span>
                      </div>
                    </div>
                    <div className={s.cardTotal}>
                      <span className={s.totalLabel}>{t('account.totalAmount')}</span>
                      <span className={s.totalValue}>{formatPrice(order.grandTotal, country)}</span>
                    </div>
                  </div>
                  <div className={s.cardActionsRow}>
                    <button
                      className={s.helpBtn}
                      onClick={(e) => {
                        e.stopPropagation();
                        setChatOrderContext({
                          orderNumber: order.orderNumber,
                          items: order.items.map(i => i.name),
                          status: order.status,
                          total: order.grandTotal,
                          createdAt: order.createdAt,
                        });
                        setChatOpen(true);
                      }}
                    >
                      <i className="fas fa-headset" /> {t('account.helpSupport')}
                    </button>
                    <Link to={`/account/orders/${order.id}`} className={s.viewBtn} onClick={(e) => e.stopPropagation()}>
                      <i className="fas fa-eye" /> {t('account.viewDetails')} <i className="fas fa-arrow-right" />
                    </Link>
                  </div>
                </div>

                {/* Items Section */}
                <div className={s.itemsSection}>
                  <div className={s.itemsHeader}>
                    <span className={s.itemsTitle}>{t('account.items')} ({order.items.length})</span>
                  </div>
                  <div className={`${s.itemsRow} ${isExpanded ? s.itemsRowExpanded : ''}`}>
                    {visibleItems.map((item, idx) => (
                      <div key={idx} className={s.itemChip}>
                        {item.imageUrl ? (
                          <img src={mediaUrl(item.imageUrl)} alt={item.name} className={s.itemThumb} />
                        ) : (
                          <div className={s.itemThumbPlaceholder}>
                            <i className="fas fa-leaf" />
                          </div>
                        )}
                        <span className={s.itemName}>{getProductName(item.name, lang)}</span>
                        <span className={s.itemQty}>x{item.qty}</span>
                      </div>
                    ))}
                    {!isExpanded && extraCount > 0 && (
                      <button
                        className={s.moreItems}
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpandedOrders(prev => ({ ...prev, [order.id]: true }));
                        }}
                      >
                        +{extraCount} {t('account.moreItems')}
                      </button>
                    )}
                    {isExpanded && extraCount > 0 && (
                      <button
                        className={s.moreItems}
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpandedOrders(prev => ({ ...prev, [order.id]: false }));
                        }}
                      >
                        <i className="fas fa-chevron-up" /> {t('account.showLess')}
                      </button>
                    )}
                  </div>
                  {(CANCELLABLE.includes(order.status) || cancelTarget?.id === order.id) && (
                    <div className={s.itemsFooter}>
                      {CANCELLABLE.includes(order.status) && (
                        <button className={s.cancelBtn} onClick={(e) => openCancel(order, e)}>
                          <i className="fas fa-ban" /> {t('account.cancelOrder')}
                        </button>
                      )}
                      {cancelTarget?.id === order.id && (
                        <div className={s.cancelPopover} onClick={(e) => e.stopPropagation()}>
                          <p className={s.popHint}>{t('account.cancelOrderHint')}</p>
                          {cancelError && <p className={s.modalError}>{cancelError}</p>}
                          <div className={s.popActions}>
                            <button className={s.popDismiss} onClick={closeCancel} disabled={cancelling}>
                              {t('account.cancel')}
                            </button>
                            <button className={s.popConfirm} onClick={confirmCancel} disabled={cancelling}>
                              {cancelling ? <i className="fas fa-spinner fa-spin" /> : <i className="fas fa-ban" />} {t('account.cancelOrder')}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
      </div>
      <ChatPanel
        open={chatOpen}
        onClose={() => setChatOpen(false)}
        orderContext={chatOrderContext}
      />
    </AccountLayout>
  );
}
