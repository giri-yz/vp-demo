import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCountry } from '../../context/CountryContext';
import { formatPrice } from '../../utils/currency';
import { mediaUrl } from '../../utils/mediaUrl';
import { useRipple } from '../../components/common/Ripple';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { getProductName } from '../../i18n/productNames';
import * as ordersApi from '../../api/ordersApi';
import type { Order } from '../../types';
import AccountLayout from './AccountLayout';
import s from './css/PaymentHistory.module.css';

interface PaymentItem { name: string; image?: string; price: number; qty: number; }
interface Payment { date: string; amount: number; method: string; status: 'paid' | 'failed'; orderId: string; orderDbId?: string; items: PaymentItem[]; failReason?: string; }

const METHOD_ICONS: Record<string, string> = { UPI: 'fas fa-mobile-alt', Card: 'fas fa-credit-card', 'Cash on Delivery': 'fas fa-money-bill-wave', 'Net Banking': 'fas fa-university', Wallet: 'fas fa-wallet' };
const TAB_KEYS = ['All', 'Paid', 'Failed', 'UPI', 'Card', 'Cash on Delivery', 'Net Banking'] as const;

const DATE_LOCALES: Record<string, string> = { en: 'en-IN', ta: 'ta-IN', hi: 'hi-IN', si: 'si-LK', ms: 'ms-MY' };

function formatDate(d: string, locale: string) {
  try { return new Date(d).toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' }); }
  catch { return d; }
}

export default function PaymentHistory() {
  const { country } = useCountry();
  const { user } = useAuth();
  const { t, lang } = useLanguage();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [activeTab, setActiveTab] = useState('All');
  const dateLocale = DATE_LOCALES[lang] ?? 'en-IN';
  const rippleDark = useRipple('dark');
  const rippleLight = useRipple('light');
  const navigate = useNavigate();

  const tabLabel = (key: string) => {
    switch (key) {
      case 'All': return t('account.tabAll');
      case 'Paid': return t('account.tabPaid');
      case 'Failed': return t('account.tabFailed');
      case 'UPI': return t('account.tabUPI');
      case 'Card': return t('account.tabCard');
      case 'Cash on Delivery': return t('checkout.cashOnDelivery');
      case 'Net Banking': return t('account.tabNetBanking');
      case 'Wallet': return t('account.tabWallet');
      default: return key;
    }
  };

  function mapOrderToPayment(o: Order | Record<string, unknown>): Payment {
    const ord = o as unknown as Order & Record<string, unknown>;
    return {
      date: (ord.createdAt as string) || new Date().toISOString(),
      amount: (ord.grandTotal as number) ?? (ord as unknown as { total: number }).total ?? 0,
      method: (ord.paymentMethod as string) || 'Cash on Delivery',
      status: (ord.status === 'CANCELLED' ? 'failed' : 'paid') as Payment['status'],
      orderId: (ord.orderNumber as string) || (ord.id as string) || '-',
      orderDbId: (ord.id as string) || undefined,
      items: ((ord.items as unknown as Array<Record<string, unknown>>) || []).map(it => ({
        name: (it.name as string) || 'Item',
        image: mediaUrl(it.imageUrl as string) || undefined,
        price: (it.price as number) ?? (it.unitPrice as number) ?? 0,
        qty: (it.qty as number) ?? 1,
      })),
    };
  }

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (user) {
        try {
          const apiOrders = await ordersApi.listOrders();
          if (!cancelled && apiOrders.length > 0) {
            const mapped = apiOrders.map(mapOrderToPayment);
            mapped.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            setPayments(mapped);
            return;
          }
        } catch { /* fall through */ }
      }
      if (!cancelled) setPayments([]);
    }
    load();
    return () => { cancelled = true; };
  }, [user]);

  const filtered = useMemo(() => {
    if (activeTab === 'All') return payments;
    if (activeTab === 'Paid') return payments.filter(p => p.status === 'paid');
    if (activeTab === 'Failed') return payments.filter(p => p.status === 'failed');
    return payments.filter(p => p.method === activeTab);
  }, [payments, activeTab]);

  const totalPaid = payments.filter(p => p.status === 'paid').reduce((s, p) => s + p.amount, 0);
  const totalFailed = payments.filter(p => p.status === 'failed').length;

  return (
    <AccountLayout title={t('account.paymentHistory')} breadcrumb={t('account.paymentHistory')}>
      {/* Summary */}
      <div className={s.summary}>
        <div className={s.summaryItem}>
          <div className={s.summaryIcon}><i className="fas fa-wallet" /></div>
          <span className={s.summaryValue}>{formatPrice(totalPaid, country)}</span>
          <span className={s.summaryLabel}>{t('account.totalPaid')}</span>
        </div>
        <div className={s.summaryItem}>
          <div className={s.summaryIcon}><i className="fas fa-receipt" /></div>
          <span className={s.summaryValue}>{payments.length}</span>
          <span className={s.summaryLabel}>{t('account.paymentsCount')}</span>
        </div>
        <div className={s.summaryItem}>
          <div className={s.summaryIcon}><i className="fas fa-exclamation-circle" /></div>
          <span className={s.summaryValue} style={totalFailed > 0 ? { color: '#fca5a5' } : undefined}>{totalFailed}</span>
          <span className={s.summaryLabel}>{t('account.failedCount')}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className={s.tabsWrap}>
        <div className={s.tabs}>
          {TAB_KEYS.map(tab => (
            <button key={tab} type="button" className={activeTab === tab ? s.tabActive : s.tab} onClick={e => { (activeTab === tab ? rippleLight : rippleDark)(e); setActiveTab(tab); }}>{tabLabel(tab)}</button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className={s.list}>
        {filtered.length === 0 ? (
          <div className={s.empty}>
            <div className={s.emptyIcon}><i className="fas fa-receipt" /></div>
            <p className={s.emptyText}>{t('account.noPayments')}</p>
            <p style={{ fontSize: 12, color: '#333', margin: '6px 0 14px', textAlign: 'center' }}>{t('account.codAppear')}</p>
            <Link to="/shop" onClick={rippleDark} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 18px', borderRadius: 10, background: 'linear-gradient(135deg,#14472F,#1a5c38)', color: '#fff', fontWeight: 700, fontSize: 13, textDecoration: 'none', boxShadow: '0 4px 12px rgba(20,71,47,.2)' }}><i className="fas fa-store" /> {t('account.startShopping')}</Link>
          </div>
        ) : (
          filtered.map((p, i) => (
            <div
              key={i}
              className={`${s.card} ${p.status === 'failed' ? s.cardFailed : ''}`}
              onClick={(e) => { rippleDark(e); if (p.orderDbId) navigate(`/account/orders/${p.orderDbId}`); }}
              style={{ cursor: p.orderDbId ? 'pointer' : 'default' }}
              role={p.orderDbId ? 'button' : undefined}
              tabIndex={p.orderDbId ? 0 : undefined}
              onKeyDown={p.orderDbId ? (e) => { if (e.key === 'Enter' || e.key === ' ') navigate(`/account/orders/${p.orderDbId as string}`); } : undefined}
            >
              <div className={s.cardHeader}>
                <div className={s.cardMethod}>
                  <div className={s.cardMethodIcon}><i className={METHOD_ICONS[p.method] || 'fas fa-wallet'} /></div>
                  <div>
                    <div className={s.cardMethodName}>{tabLabel(p.method)}</div>
                    <div className={s.cardMethodSub}>{p.items.length} {p.items.length === 1 ? t('account.item') : t('account.items')} • {formatDate(p.date, dateLocale)}</div>
                  </div>
                </div>
                <span className={p.status === 'paid' ? s.badgePaid : s.badgeFailed}>{p.status === 'paid' ? t('account.paid') : t('account.failed')}</span>
              </div>
              {p.items?.length > 0 && (
                <div className={s.cardItems}>
                  {p.items.map((item, j) => (
                    <div key={j} className={s.cardItem}>
                      {item.image ? <img src={item.image} alt={item.name} className={s.itemImg} /> : <span className={s.itemImgPlaceholder}><i className="fas fa-box" /></span>}
                      <div className={s.itemInfo}>
                        <span className={s.itemName}>{getProductName(item.name, lang)}</span>
                        <span className={s.itemMeta}>{t('account.qtyLabel')} {item.qty} {item.price ? `• ${formatPrice(item.price, country)}` : ''}</span>
                      </div>
                      {item.price ? <span className={s.itemPrice}>{formatPrice(item.price * item.qty, country)}</span> : null}
                    </div>
                  ))}
                </div>
              )}
              {p.failReason && <p className={s.failReason}><i className="fas fa-exclamation-triangle" /> {p.failReason}</p>}
              <div className={s.cardFooter}>
                <span className={s.cardDate}><i className="fas fa-calendar-alt" /> {formatDate(p.date, dateLocale)}</span>
                <span className={s.cardAmount}>{formatPrice(p.amount, country)}</span>
              </div>
              <div className={s.cardOrderId}><span>{t('orderSuccess.orderId')}: <strong>{p.orderId}</strong></span><i className="fas fa-chevron-right" style={{ fontSize: 10, color: '#555' }} /></div>
            </div>
          ))
        )}
      </div>
    </AccountLayout>
  );
}
