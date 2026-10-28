import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import * as ordersApi from '../../api/ordersApi';
import type { Order } from '../../types';
import { useCountry } from '../../context/CountryContext';
import { formatPrice } from '../../utils/currency';
import { mediaUrl } from '../../utils/mediaUrl';
import { useRipple } from '../../components/common/Ripple';
import { useLanguage } from '../../i18n/LanguageContext';
import { getProductName } from '../../i18n/productNames';
import AccountLayout from './AccountLayout';
import s from './css/OrderDetail.module.css';

const STEPS = ['PLACED', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'];
const CANCELLABLE = ['PLACED', 'CONFIRMED', 'PROCESSING'];

function getStepClass(status: string, step: string): string {
  const si = STEPS.indexOf(status);
  const ti = STEPS.indexOf(step);
  if (status === 'CANCELLED') return '';
  if (ti < si) return s.stepDone;
  if (ti === si) return s.stepActive;
  return '';
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

function getDeliveryRange(_iso: string): string {
  return '30 mins';
}

export default function OrderDetail() {
  const { id = '' } = useParams();
  const { t, lang } = useLanguage();
  const { country } = useCountry();
  const rippleDark = useRipple('dark');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState('');
  const [confirmingCancel, setConfirmingCancel] = useState(false);
  const itemsCardRef = useRef<HTMLDivElement>(null);
  const sideColRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setFailed(false);
    setOrder(null);
    ordersApi
      .getOrder(id)
      .then((o) => {
        if (!cancelled) setOrder(o);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  async function confirmCancel() {
    if (!order || cancelling) return;
    setCancelling(true);
    setCancelError('');
    try {
      const updated = await ordersApi.cancelOrder(order.id);
      setOrder(updated);
      setConfirmingCancel(false);
    } catch {
      setCancelError(t('account.cancelOrderFailed'));
    } finally {
      setCancelling(false);
    }
  }

  useEffect(() => {
    const card = itemsCardRef.current;
    const side = sideColRef.current;
    if (!order || !card || !side) return;
    const mq = window.matchMedia('(min-width: 1024px)');
    const align = () => {
      card.style.removeProperty('height');
      if (!mq.matches) return;
      const sideH = Math.round(side.getBoundingClientRect().height);
      if (Math.round(card.getBoundingClientRect().height) > sideH) {
        card.style.height = `${sideH}px`;
      }
    };
    align();

    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(align) : null;
    ro?.observe(side);
    window.addEventListener('resize', align);
    return () => {
      ro?.disconnect();
      window.removeEventListener('resize', align);
      card.style.removeProperty('height');
    };
  }, [order, lang]);

  const STATUS_CONFIG: Record<string, { label: string; icon: string; cls: string }> = {
    PLACED: { label: t('account.statusPlaced'), icon: 'fas fa-check-circle', cls: 'badgeInfo' },
    CONFIRMED: { label: t('account.statusConfirmed'), icon: 'fas fa-clipboard-check', cls: 'badgeInfo' },
    PROCESSING: { label: t('account.statusProcessing'), icon: 'fas fa-cog', cls: 'badgeWarning' },
    SHIPPED: { label: t('account.statusShipped'), icon: 'fas fa-truck', cls: 'badgeWarning' },
    DELIVERED: { label: t('account.statusDelivered'), icon: 'fas fa-box-open', cls: 'badgeSuccess' },
    CANCELLED: { label: t('account.statusCancelled'), icon: 'fas fa-times-circle', cls: 'badgeDanger' },
  };

  const money = (v: number) => formatPrice(Number(v) || 0, country);
  const num = (v: number) => Number(v) || 0;

  return (
    <AccountLayout title={t('account.orderDetailsTitle')} breadcrumb={t('account.orderDetailsTitle')}>
      <div className={s.topRow}>
        <Link to="/account/orders" className={s.backLink}>
          <i className="fas fa-arrow-left" /> {t('account.backToOrders')}
        </Link>
      </div>

      {loading ? (
        <div className={s.empty}>
          <div className={s.spinnerWrap}>
            <div className={s.spinner} />
          </div>
          <p className={s.emptyText}>{t('account.loadingOrders')}</p>
        </div>
      ) : failed || !order ? (
        <div className={s.notFound}>
          <div className={s.notFoundIcon}>
            <i className="fas fa-box-open" />
          </div>
          <h4>{t('account.orderNotFound')}</h4>
          <p>{t('account.orderNotFoundDesc')}</p>
          <Link to="/account/orders" className={s.backBtn}>
            <i className="fas fa-arrow-left" /> {t('account.backToOrders')}
          </Link>
        </div>
      ) : (
        (() => {
          const st = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.PLACED;
          return (
            <>
              {/* ── Status card ── */}
              <div className={s.card}>
                <div className={s.statusTop}>
                  <div className={s.statusInfo}>
                    <span className={s.orderNum}>#{order.orderNumber}</span>
                    <span className={s.placedAt}>
                      <i className="fas fa-calendar-alt" /> {t('account.placedOn')} {formatDate(order.createdAt)},{' '}
                      {formatTime(order.createdAt)}
                    </span>
                  </div>
                  <span className={`${s.badge} ${s[st.cls]}`}>
                    <i className={st.icon} /> {st.label}
                  </span>
                </div>

                <div className={s.deliveryRow}>
                  <div className={s.deliveryIcon}>
                    <i className="fas fa-truck" />
                  </div>
                  <div className={s.deliveryText}>
                    <span className={s.deliveryLabel}>{t('account.expectedDelivery')}</span>
                    <span className={s.deliveryDate}>
                      {order.status === 'CANCELLED' ? '\u2014' : getDeliveryRange(order.createdAt)}
                    </span>
                  </div>
                </div>

                {order.status === 'CANCELLED' ? (
                  <div className={s.cancelledNote}>
                    <i className="fas fa-exclamation-circle" /> {t('account.statusCancelled')}
                  </div>
                ) : (
                  <div className={s.progress}>
                    {STEPS.map((step, i) => (
                      <div key={step} className={`${s.step} ${getStepClass(order.status, step)}`}>
                        <div className={s.stepDot}>{i + 1}</div>
                        <div className={s.stepLabel}>{step}</div>
                        {i < STEPS.length - 1 && <div className={s.stepLine} />}
                      </div>
                    ))}
                  </div>
                )}
                {CANCELLABLE.includes(order.status) && (
                  <div style={{ marginTop: 14, borderTop: '1px solid #eee', paddingTop: 12 }}>
                    {!confirmingCancel ? (
                      <button
                        type="button"
                        onClick={(e) => { rippleDark(e); setCancelError(''); setConfirmingCancel(true); }}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '9px 16px', borderRadius: 10, border: '1px solid #fecaca', background: '#fff', color: '#dc2626', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}
                      >
                        <i className="fas fa-ban" /> {t('account.cancelOrder')}
                      </button>
                    ) : (
                      <div>
                        <p style={{ fontSize: 13, color: '#444', margin: '0 0 10px' }}>{t('account.cancelOrderHint')}</p>
                        {cancelError && <p style={{ fontSize: 13, color: '#dc2626', margin: '0 0 10px' }}>{cancelError}</p>}
                        <div style={{ display: 'flex', gap: 10 }}>
                          <button
                            type="button"
                            onClick={() => { setConfirmingCancel(false); setCancelError(''); }}
                            disabled={cancelling}
                            style={{ padding: '9px 16px', borderRadius: 10, border: '1px solid #e5e7eb', background: '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}
                          >
                            {t('account.cancel')}
                          </button>
                          <button
                            type="button"
                            onClick={confirmCancel}
                            disabled={cancelling}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '9px 16px', borderRadius: 10, border: 'none', background: '#dc2626', color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer', opacity: cancelling ? 0.6 : 1 }}
                          >
                            {cancelling ? <i className="fas fa-spinner fa-spin" /> : <i className="fas fa-ban" />} {t('account.cancelOrder')}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className={s.grid}>
                {/* ── Items card ── */}
                <div className={`${s.card} ${s.itemsCard}`} ref={itemsCardRef}>
                  <h4 className={s.cardTitle}>
                    {t('account.items')} ({order.items.length})
                  </h4>
                  <div className={s.itemList}>
                    {order.items.map((item, idx) => (
                      <div key={idx} className={s.itemRow}>
                        {item.imageUrl ? (
                          <img src={mediaUrl(item.imageUrl)} alt={item.name} className={s.itemImg} />
                        ) : (
                          <div className={s.itemImgPlaceholder}>
                            <i className="fas fa-leaf" />
                          </div>
                        )}
                        <div className={s.itemInfo}>
                          <span className={s.itemName}>{getProductName(item.name, lang)}</span>
                          <span className={s.itemMeta}>
                            {t('account.qtyLabel')} {item.qty} &times; {money(item.unitPrice)}
                            {item.weightKg ? ` \u00B7 ${item.weightKg} kg` : ''}
                            {item.boxType ? ` \u00B7 ${item.boxType}` : ''}
                          </span>
                        </div>
                        <span className={s.itemTotal}>{money(item.lineTotal)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className={s.sideCol} ref={sideColRef}>
                  {/* ── Price details card ── */}
                  <div className={s.card}>
                    <h4 className={s.cardTitle}>{t('account.priceDetails')}</h4>
                    <div className={s.priceList}>
                      <div className={s.priceRow}>
                        <span>{t('checkout.itemTotal')}</span>
                        <span>{money(order.itemTotal)}</span>
                      </div>
                      {num(order.discount) > 0 && (
                        <div className={`${s.priceRow} ${s.priceDiscount}`}>
                          <span>
                            {order.couponCode
                              ? `${t('checkout.couponDiscount')} (${order.couponCode})`
                              : t('account.discount')}
                          </span>
                          <span>-{money(order.discount)}</span>
                        </div>
                      )}
                      {num(order.boxDiscount) > 0 && (
                        <div className={`${s.priceRow} ${s.priceDiscount}`}>
                          <span>{t('checkout.bigBoxDiscount')}</span>
                          <span>-{money(order.boxDiscount)}</span>
                        </div>
                      )}
                      <div className={s.priceRow}>
                        <span>{t('checkout.deliveryFee')}</span>
                        <span>{num(order.deliveryFee) > 0 ? money(order.deliveryFee) : t('checkout.free')}</span>
                      </div>
                      {num(order.tax) > 0 && (
                        <div className={s.priceRow}>
                          <span>{t('account.tax')}</span>
                          <span>{money(order.tax)}</span>
                        </div>
                      )}
                      {num(order.tip) > 0 && (
                        <div className={s.priceRow}>
                          <span>{t('checkout.deliveryTip')}</span>
                          <span>{money(order.tip)}</span>
                        </div>
                      )}
                      <div className={s.priceTotal}>
                        <span>{t('checkout.total')}</span>
                        <span>{money(order.grandTotal)}</span>
                      </div>
                    </div>
                  </div>

                  {/* ── Payment card ── */}
                  <div className={s.card}>
                    <h4 className={s.cardTitle}>{t('checkout.paymentMethod')}</h4>
                    <div className={s.payRow}>
                      <span className={s.payLabel}>
                        <i className="fas fa-wallet" /> {t('checkout.paymentMethod')}
                      </span>
                      <span className={s.payValue}>
                        {/cod|cash/i.test(order.paymentMethod)
                          ? t('checkout.cashOnDelivery')
                          : order.paymentMethod || '\u2014'}
                      </span>
                    </div>
                    <div className={s.payRow}>
                      <span className={s.payLabel}>
                        <i className="fas fa-store" /> {t('account.channel')}
                      </span>
                      <span className={s.payValue}>{order.channel || '\u2014'}</span>
                    </div>
                    {order.couponCode && (
                      <div className={s.payRow}>
                        <span className={s.payLabel}>
                          <i className="fas fa-tag" /> {t('checkout.coupon')}
                        </span>
                        <span className={s.couponChip}>{order.couponCode}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          );
        })()
      )}
    </AccountLayout>
  );
}
