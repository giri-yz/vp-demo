import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as ordersApi from '../../api/ordersApi';
import type { Order } from '../../types';
import { useRipple } from '../../components/common/Ripple';
import AccountLayout from './AccountLayout';
import { useLanguage } from '../../i18n/LanguageContext';
import { getProductName } from '../../i18n/productNames';
import { formatPrice } from '../../utils/currency';
import { mediaUrl } from '../../utils/mediaUrl';
import { useCountry } from '../../context/CountryContext';
import s from './css/OrderTracking.module.css';

const STATUS_BADGE: Record<string, string> = {
  PLACED: 'badgeInfo', CONFIRMED: 'badgeInfo',
  PROCESSING: 'badgeWarning', SHIPPED: 'badgeWarning',
  DELIVERED: 'badgeSuccess', CANCELLED: 'badgeDanger',
};
const STEPS = ['PLACED', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'];

function getStepClass(status: string, step: string) {
  const si = STEPS.indexOf(status);
  const ti = STEPS.indexOf(step);
  if (status === 'CANCELLED') return '';
  if (ti < si) return s.stepDone;
  if (ti === si) return s.stepActive;
  return '';
}

export default function OrderTracking() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const rippleDark = useRipple('dark');
  const { t, lang } = useLanguage();
  const { country } = useCountry();
  const navigate = useNavigate();

  useEffect(() => { ordersApi.listOrders().then(setOrders).finally(() => setLoading(false)); }, []);

  return (
    <AccountLayout title={t('account.orderTracking')} breadcrumb={t('account.orderTracking')}>
      <div className={s.pageWrap}>
        <h3 className={s.sectionTitle}>{t('account.trackOrdersRealTime')}</h3>
        {loading ? (
          <div className={s.empty}><div className={s.emptyIcon}><i className="fas fa-spinner fa-spin" /></div><p className={s.emptyText}>{t('shop.loading')}</p></div>
        ) : orders.length === 0 ? (
          <div className={s.empty}>
            <div className={s.emptyIcon}><i className="fas fa-truck" /></div>
            <p className={s.emptyText}>{t('account.noOrdersYet')}</p>
          </div>
        ) : (
          orders.map(order => (
            <div
              key={order.id}
              className={s.trackCard}
              onClick={(e) => { rippleDark(e); navigate(`/account/orders/${order.id}`); }}
              style={{ cursor: 'pointer' }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') navigate(`/account/orders/${order.id}`); }}
            >
              <div className={s.trackTop}>
                <span className={s.trackNumber}>#{order.orderNumber}</span>
                <span className={`${s.badge} ${s[STATUS_BADGE[order.status] ?? 'badgeInfo']}`}>{order.status}</span>
              </div>
              <div className={s.trackMeta}>{new Date(order.createdAt).toLocaleDateString()} · {order.items.length} {order.items.length === 1 ? t('account.item') : t('account.items')}</div>
              <div className={s.trackTotal}>{formatPrice(order.grandTotal, country)}</div>
            <div className={s.progress}>
              {STEPS.map((step, i) => (
                <div key={step} className={`${s.step} ${getStepClass(order.status, step)}`}>
                  <div className={s.stepDot}>{i + 1}</div>
                  <div className={s.stepLabel}>{step}</div>
                  {i < STEPS.length - 1 && <div className={s.stepLine} />}
                </div>
              ))}
            </div>
            <div className={s.items}>
              {order.items.map((item, idx) => (
                <div key={idx} className={s.item}>
                  {item.imageUrl && <img src={mediaUrl(item.imageUrl)} alt={item.name} className={s.itemImg} />}
                  <span className={s.itemName}>{getProductName(item.name, lang)}</span>
                  <span className={s.itemQty}>×{item.qty}</span>
                </div>
              ))}
            </div>
            </div>
          ))
        )}
      </div>
    </AccountLayout>
  );
}
