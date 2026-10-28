import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useCountry } from '../../context/CountryContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { freeDeliveryThresholdFor, deliveryFeeFor } from '../../utils/delivery';
import * as addressesApi from '../../api/addressesApi';
import * as couponsApi from '../../api/couponsApi';
import * as ordersApi from '../../api/ordersApi';
import type { Address } from '../../types';
import Reveal from '../../components/common/Reveal';
import PaymentMethodPicker from '../../components/checkout/PaymentMethodPicker';
import TipSelector from '../../components/checkout/TipSelector';
import CouponSheet from '../../components/checkout/CouponSheet';
import AddressModal from '../../components/addresses/AddressModal';
import styles from './css/Checkout.module.css';

export default function Checkout() {
  const { cart, loading: cartLoading, refresh: refreshCart } = useCart();
  const { user } = useAuth();
  const { country } = useCountry();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [addressModalOpen, setAddressModalOpen] = useState(false);

  const [paymentMethod, setPaymentMethod] = useState('Cash on Delivery');
  const [tip, setTip] = useState(0);
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  /* Stored as key + raw fallback and translated at render, so language switches re-render it. */
  const [couponMsgKey, setCouponMsgKey] = useState('');
  const [couponMsgRaw, setCouponMsgRaw] = useState('');
  const couponMessage = couponMsgKey ? t(couponMsgKey) : couponMsgRaw;

  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState('');
  const [addrLoading, setAddrLoading] = useState(true);
  const [addrError, setAddrError] = useState('');

  function loadAddresses() {
    setAddrLoading(true);
    setAddrError('');
    addressesApi.listAddresses().then((list) => {
      setAddresses(list);
      const def = list.find((a) => a.isDefault) ?? list[0];
      if (def) setSelectedAddressId(def.id);
      else setAddressModalOpen(true);
    }).catch(() => {
      setAddrError(t('checkout.loadAddressesFailed') === 'checkout.loadAddressesFailed' ? 'Could not load addresses. Please retry.' : t('checkout.loadAddressesFailed'));
    }).finally(() => {
      setAddrLoading(false);
    });
  }

  useEffect(() => {
    loadAddresses();
  }, []);

  function handleAddressAdded(address: Address) {
    setAddresses((prev) => [...prev, address]);
    setSelectedAddressId(address.id);
  }

  async function handleApplyCoupon(code: string) {
    const result = await couponsApi.applyCoupon(code, country);
    /* Backend coupon messages are English-only — store the i18n key instead. */
    if (!result.message) {
      setCouponMsgKey('cart.couponFailed');
      setCouponMsgRaw('');
    } else {
      const key = couponsApi.couponMessageKey(result.message);
      setCouponMsgKey(key);
      setCouponMsgRaw(key ? '' : result.message);
    }
    setCouponCode(code);
    setDiscount(result.valid ? result.discountAmount : 0);
  }

  async function handlePlaceOrder() {
    if (!selectedAddressId) {
      setError(t('checkout.selectOrAddAddress'));
      return;
    }
    setError('');
    setPlacing(true);
    try {
      const order = await ordersApi.checkout(
        {
          addressId: selectedAddressId,
          paymentMethod,
          couponCode: discount > 0 ? couponCode : undefined,
          tip: tip > 0 ? tip : undefined,
        },
        country
      );
      await refreshCart();
      navigate(`/orders/${order.id}/success`, { state: { order, address: selectedAddress } });
    } catch (err: unknown) {
      let message = t('checkout.couldNotPlaceOrder');
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosErr = err as { response?: { status?: number; data?: { message?: string; code?: string; city?: string } } };
        const status = axiosErr.response?.status;
        if (status === 409 && axiosErr.response?.data?.code === 'DELIVERY_NOT_AVAILABLE') {
          /* Non-deliverable city → Coming Soon page in place of OrderReceived.
             Nothing was ordered or charged; the cart is left intact. */
          navigate('/delivery/coming-soon', {
            replace: true,
            state: { city: axiosErr.response.data.city || selectedAddress?.city || '' },
          });
          return;
        }
        if (status === 401 || status === 403) {
          message = t('checkout.sessionExpired');
        } else {
          message = axiosErr.response?.data?.message ?? t('checkout.couldNotPlaceOrder');
        }
      }
      setError(message);
    } finally {
      setPlacing(false);
    }
  }

  if (cartLoading) return <div className="container">{t('shop.loading')}</div>;
  if (!cart || cart.items.length === 0) {
    return (
      <div className="container">
        <p>{t('checkout.yourCartEmpty')}</p>
      </div>
    );
  }

  const itemTotal = cart.itemTotal;
  /* premiumOrDiscount arrives POSITIVE for a Big Box discount (PricingService) —
     the old Math.min(0, ...) made this hard-coded 0 and the displayed total then
     disagreed with the amount the backend charges. */
  const boxDiscount = (cart.boxSummaries ?? []).reduce(
    (sum, s) => sum + (s.boxType === 'BIG_BOX' ? Math.max(0, s.premiumOrDiscount) : 0), 0
  );
  const deliveryThreshold = freeDeliveryThresholdFor(country);
  const deliveryFee = deliveryFeeFor(country, itemTotal);
  const grandTotal = Math.max(0, itemTotal - discount - boxDiscount + deliveryFee + tip);
  const selectedAddress = addresses.find((a) => a.id === selectedAddressId);

  return (
    <div className="container">
      <Reveal className={styles.wrap}>
        <div>
          <h1>{t('checkout.title')}</h1>

          <div className={`card ${styles.section}`}>
            <h3>{t('checkout.deliveringTo')}</h3>
            {selectedAddress ? (
              <div className={styles.addressSummary}>
                <div>
                  <strong>{selectedAddress.label}</strong> — {selectedAddress.name}, {selectedAddress.phone}
                  <div>
                    {selectedAddress.addressLine}, {selectedAddress.city}, {selectedAddress.state} {selectedAddress.pincode}
                  </div>
                </div>
                <button type="button" className="btn btn-outline" onClick={() => setAddressModalOpen(true)}>
                  {t('checkout.change')}
                </button>
              </div>
            ) : (
              <button type="button" className="btn btn-primary" onClick={() => setAddressModalOpen(true)}>
                {t('checkout.addAddress')}
              </button>
            )}
          </div>

          <AddressModal
            open={addressModalOpen}
            addresses={addresses}
            selectedAddressId={selectedAddressId}
            onClose={() => setAddressModalOpen(false)}
            onSelect={setSelectedAddressId}
            onAddressAdded={handleAddressAdded}
          />

          <div className={`card ${styles.section}`}>
            <h3>{t('checkout.paymentMethod')}</h3>
            <PaymentMethodPicker value={paymentMethod} onChange={setPaymentMethod} />
          </div>

          <div className={`card ${styles.section}`}>
            <h3>{t('checkout.tipDeliveryPartner')}</h3>
            <TipSelector value={tip} onChange={setTip} />
          </div>

          <div className={`card ${styles.section}`}>
            <h3>{t('checkout.coupon')}</h3>
            <CouponSheet appliedCode={couponCode} discount={discount} message={couponMessage} onApply={handleApplyCoupon} />
          </div>
        </div>

        <div className={`card ${styles.summary}`}>
          <h3>{t('checkout.orderSummary')}</h3>
          {selectedAddress && (
            <p className={styles.summaryAddress}>
              {t('checkout.deliveringTo')} <strong>{selectedAddress.label}</strong> — {selectedAddress.city}
            </p>
          )}

          {(cart.boxSummaries ?? []).map((s) => (
            <div key={s.boxType} className={styles.summaryRow}>
              <span>{s.boxType === 'SMALL_BOX' ? t('checkout.smallBox') : t('checkout.bigBox')}</span>
              <span>{s.subtotal.toFixed(2)}</span>
            </div>
          ))}

          <div className={styles.summaryRow}>
            <span>{t('checkout.itemTotal')}</span>
            <span>{itemTotal.toFixed(2)}</span>
          </div>
          {discount > 0 && (
            <div className={styles.summaryRow}>
              <span>{t('checkout.couponDiscount')}</span>
              <span>-{discount.toFixed(2)}</span>
            </div>
          )}
          {boxDiscount > 0 && (
            <div className={styles.summaryRow}>
              <span>{t('checkout.bigBoxDiscount')}</span>
              <span>-{boxDiscount.toFixed(2)}</span>
            </div>
          )}
          <div className={styles.summaryRow}>
            <span>{t('checkout.deliveryFee')}</span>
            <span>{deliveryFee === 0 ? t('checkout.free') : deliveryFee.toFixed(2)}</span>
          </div>
          {tip > 0 && (
            <div className={styles.summaryRow}>
              <span>{t('checkout.deliveryTip')}</span>
              <span>{tip.toFixed(2)}</span>
            </div>
          )}
          <div className={styles.summaryTotal}>
            <span>{t('cart.total')}</span>
            <span>{grandTotal.toFixed(2)}</span>
          </div>
          {error && (
            <p className="badge badge-danger" style={{ marginBottom: 'var(--space-4)', display: 'block' }}>
              {error}
            </p>
          )}
          {addrError && (
            <p className="badge badge-danger" style={{ marginBottom: 'var(--space-4)', display: 'block' }}>
              {addrError}{' '}
              <button type="button" onClick={loadAddresses} disabled={addrLoading} style={{ textDecoration: 'underline', background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontWeight: 700 }}>
                {t('shop.retry')}
              </button>
            </p>
          )}
          <button
            className="btn btn-primary"
            style={{ width: '100%' }}
            disabled={placing || addrLoading || !selectedAddressId}
            onClick={handlePlaceOrder}
          >
            {placing ? t('checkout.placingOrder') : `${t('checkout.pay')} ${grandTotal.toFixed(2)}`}
          </button>
        </div>
      </Reveal>
    </div>
  );
}
