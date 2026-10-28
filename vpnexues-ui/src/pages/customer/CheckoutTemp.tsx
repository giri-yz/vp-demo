import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import { useCart } from '../../context/CartContext';
import { useCountry } from '../../context/CountryContext';
import { useAuth } from '../../context/AuthContext';
import { useAuthModal } from '../../context/AuthModalContext';
import { useAddress } from '../../context/AddressContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { getProductName } from '../../i18n/productNames';
import { formatPrice } from '../../utils/currency';
import { mediaUrl } from '../../utils/mediaUrl';
import { DELIVERY_FEES, DEFAULT_DELIVERY_FEE, freeDeliveryThresholdFor } from '../../utils/delivery';
import { applyCoupon } from '../../api/couponsApi';
import type { Order, Address } from '../../types';
import * as ordersApi from '../../api/ordersApi';
import * as addressesApi from '../../api/addressesApi';
import AddressModal from '../../components/common/AddressModal';
import { IconCheck } from '../../components/common/icons';
import styles from './css/CheckoutTemp.module.css';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const greenIcon = L.divIcon({
  className: '',
  iconSize: [28, 36],
  iconAnchor: [14, 36],
  popupAnchor: [0, -36],
  html: `<div style="width:28px;height:36px;display:flex;align-items:flex-start;justify-content:center"><svg width="28" height="36" viewBox="0 0 28 36"><path d="M14 0C6.268 0 0 6.268 0 14c0 10.5 14 22 14 22s14-11.5 14-22C28 6.268 21.732 0 14 0z" fill="#055729"/><circle cx="14" cy="14" r="6" fill="#fff"/></svg></div>`,
});

/* Broken product image fallback — same pattern as Cart / Shop / ShopDetails */
function productImageFallback(e: React.SyntheticEvent<HTMLImageElement>, name: string) {
  const el = e.currentTarget as HTMLImageElement;
  const word = (name || 'Item').split(' ')[0];
  el.src = `https://placehold.co/200x200/f4f9f0/4a7c3f?text=${encodeURIComponent(word)}&font=roboto`;
}

/* VPNexues round emblem — mobile header + swipe-to-order thumb */
const LOGO_URL = 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001831/vpnexues/old/site-assets/logo/vp-logo.svg';

/* ── addressId resolution ──
   AddressContext also holds local guest placeholders (localStorage fallback,
   id `guest-…`) that were never stored server-side. POST /api/orders only
   accepts the UUID of an address that exists for this user, so map the
   selected address onto its real stored record before checking out. */
const STORED_ADDRESS_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function normalize(value: string | null | undefined): string {
  return (value ?? '').replace(/\s+/g, ' ').trim().toLowerCase();
}

/* Older localStorage payloads may miss optional fields */
function optionalText(value: string | null | undefined): string {
  return value ?? '';
}

function isStoredAddressId(id: string): boolean {
  return STORED_ADDRESS_ID.test(id);
}

function isSameAddress(stored: Address, local: Address): boolean {
  return (
    normalize(stored.phone) === normalize(local.phone) &&
    normalize(stored.addressLine) === normalize(local.addressLine) &&
    normalize(stored.pincode) === normalize(local.pincode)
  );
}

/* Returns the backend address UUID for the selected address: the id itself when
   it is already stored, otherwise the matching record from GET /api/addresses,
   otherwise the address persisted through POST /api/addresses (existing API —
   no synthetic ids are ever sent to the order endpoint). */
async function resolveAddressId(local: Address): Promise<string> {
  if (isStoredAddressId(local.id)) return local.id;
  const stored = await addressesApi.listAddresses();
  const match = stored.find((a) => isSameAddress(a, local));
  if (match) return match.id;
  const created = await addressesApi.createAddress({
    label: local.label,
    name: local.name,
    phone: local.phone,
    addressLine: local.addressLine,
    flat: local.flat ?? null,
    landmark: local.landmark ?? null,
    city: optionalText(local.city),
    pincode: optionalText(local.pincode),
    state: optionalText(local.state),
    // Carry the country through so checkout gates on the address's real country
    // (V59). Null for legacy drafts, which then fall back to the selector.
    country: local.country ?? null,
    isDefault: stored.length === 0,
    lat: local.lat ?? null,
    lng: local.lng ?? null,
  });
  return created.id;
}

/* ── Swipe-to-Order Slider (mobile only) ── */
function SwipeToOrder({ onSwipeComplete, disabled, placing }: { onSwipeComplete: () => void; disabled: boolean; placing: boolean }) {
  const { t } = useLanguage();
  const trackRef = useRef<HTMLDivElement>(null);
  const [dragX, setDragX] = useState(0);
  const [swiping, setSwiping] = useState(false);
  const startX = useRef(0);
  const thumbWidth = 52;
  const [trackWidth, setTrackWidth] = useState(200);

  useEffect(() => {
    if (trackRef.current) setTrackWidth(trackRef.current.offsetWidth);
  }, []);

  const maxDrag = trackWidth - thumbWidth - 8;

  function handleStart(clientX: number) {
    if (disabled || placing) return;
    setSwiping(true);
    startX.current = clientX - dragX;
  }

  function handleMove(clientX: number) {
    if (!swiping) return;
    const x = Math.max(0, Math.min(clientX - startX.current, maxDrag));
    setDragX(x);
  }

  function handleEnd() {
    if (!swiping) return;
    setSwiping(false);
    const completed = dragX >= maxDrag * 0.85;
    setDragX(0); // always snap back — success is covered by the overlay, invalid shows the address guidance
    if (completed) onSwipeComplete();
  }

  const progress = maxDrag > 0 ? dragX / maxDrag : 0;

  return (
    <div
      ref={trackRef}
      className={styles.swipeTrack}
      role="button"
      tabIndex={disabled || placing ? -1 : 0}
      aria-label={t('checkout.swipeToPlaceOrder')}
      aria-disabled={disabled || placing}
      onKeyDown={(e) => { if ((e.key === 'Enter' || e.key === ' ') && !disabled && !placing) { e.preventDefault(); onSwipeComplete(); } }}
      onTouchStart={(e) => handleStart(e.touches[0].clientX)}
      onTouchMove={(e) => handleMove(e.touches[0].clientX)}
      onTouchEnd={handleEnd}
      onMouseDown={(e) => handleStart(e.clientX)}
      onMouseMove={(e) => { if (swiping) handleMove(e.clientX); }}
      onMouseUp={handleEnd}
      onMouseLeave={() => { if (swiping) handleEnd(); }}
    >
      <div className={styles.swipeFill} style={{ width: `${maxDrag > 0 ? (dragX / maxDrag) * 100 : 0}%` }} />
      <span className={styles.swipeText} style={{ opacity: Math.max(0, 1 - progress * 2) }}>
        {placing ? t('checkout.swipePlacing') : t('checkout.swipeToPlaceOrder')}
      </span>
      <div
        className={styles.swipeThumb}
        style={{ transform: `translateX(${dragX}px)` }}
      >
        <img src={LOGO_URL} alt="" className={styles.swipeThumbLogo} draggable={false} />
      </div>
    </div>
  );
}

export default function CheckoutTemp() {
  const { cart, loading: cartLoading, clearCart, refresh } = useCart();
  const { country } = useCountry();
  const { user } = useAuth();
  const { openAuthModal } = useAuthModal();
  const { selectedAddress } = useAddress();
  const { t, lang } = useLanguage();
  const navigate = useNavigate();

  const [addrModalOpen, setAddrModalOpen] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [error, setError] = useState('');
  const [placedOrder, setPlacedOrder] = useState<{ order: Order; address: Address | null } | null>(null);
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponEnabled, setCouponEnabled] = useState(true);

  /* Delivery-address guidance: ref for scroll-on-invalid, notice text shown inside the card */
  const addrSectionRef = useRef<HTMLDivElement>(null);
  const [addrNotice, setAddrNotice] = useState('');

  /* Adding the address or pinning its location clears the guidance notice */
  useEffect(() => {
    setAddrNotice('');
  }, [selectedAddress?.id, selectedAddress?.lat, selectedAddress?.lng]);

  const isEmptyCart = !cart || cart.items.length === 0;

  useEffect(() => {
    let cancelled = false;
    try {
      const raw = localStorage.getItem('vpnexues_coupon');
      if (raw) {
        const saved = JSON.parse(raw) as { code?: string; enabled?: boolean };
        if (saved.code) {
          // QA-15: never trust a discount stored in the browser — re-validate the
          // code with the server and display only the server-returned amount.
          applyCoupon(saved.code, country)
            .then((result) => {
              if (cancelled) return;
              if (result.valid && result.discountAmount > 0) {
                setCouponCode(result.code);
                setCouponDiscount(result.discountAmount);
                setCouponEnabled(saved.enabled !== false);
              } else {
                setCouponDiscount(0);
                setCouponEnabled(false);
                setCouponCode('');
                localStorage.removeItem('vpnexues_coupon');
              }
            })
            .catch(() => {
              if (cancelled) return;
              setCouponDiscount(0);
              setCouponEnabled(false);
              setCouponCode('');
              localStorage.removeItem('vpnexues_coupon');
            });
        }
      }
    } catch { /* ignore */ }
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [country]);

  /* Drop persisted FIRST200 if checkout cart is under ₹500 or customer already ordered */
  useEffect(() => {
    if (!cart || couponCode.toUpperCase() !== 'FIRST200') return;
    const boxDisc = (cart.boxSummaries ?? []).reduce(
      (sum, s) => sum + (s.boxType === 'BIG_BOX' ? s.premiumOrDiscount : 0), 0
    );
    const cartTotal = Math.max(0, cart.itemTotal - boxDisc);
    if (cartTotal > 0 && cartTotal < 500) {
      setCouponDiscount(0);
      setCouponEnabled(false);
      setCouponCode('');
      localStorage.removeItem('vpnexues_coupon');
      return;
    }
    let cancelled = false;
    ordersApi.listOrders().then((orders) => {
      if (!cancelled && orders.length > 0) {
        setCouponDiscount(0);
        setCouponEnabled(false);
        setCouponCode('');
        localStorage.removeItem('vpnexues_coupon');
      }
    }).catch(() => { /* guest/network — backend enforces at place-order */ });
    return () => { cancelled = true; };
  }, [cart, couponCode]);

  if (cartLoading)
    return (
      <div className={styles.loadingWrap}>
        <div className={styles.loadingSpinner} />
        <span>{t('checkout.loadingCheckout')}</span>
      </div>
    );

  if (isEmptyCart && !orderPlaced && !placedOrder) {
    return (
      <div className={styles.loadingWrap}>
        <div className={styles.loginPrompt}>
          <div className={styles.loginIcon}>
            <svg viewBox="0 0 24 24" fill="none" width="36" height="36">
              <path d="M9 22a1 1 0 100-2 1 1 0 000 2zM20 22a1 1 0 100-2 1 1 0 000 2z" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h3>{t('checkout.yourCartEmpty')}</h3>
          <p>{t('checkout.emptyCartDesc')}</p>
          <Link to="/shop" className={styles.loginBtn} style={{ textDecoration: 'none' }}>
            {t('checkout.browseProducts')}
          </Link>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className={styles.loadingWrap}>
        <div className={styles.loginPrompt}>
          <div className={styles.loginIcon}>
            <svg viewBox="0 0 24 24" fill="none" width="36" height="36">
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="1.5"/>
              <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="1.5"/>
            </svg>
          </div>
          <h3>{t('checkout.loginRequired')}</h3>
          <p>{t('checkout.loginToOrder')}</p>
          <button className={styles.loginBtn} onClick={() => openAuthModal()}>
            {t('checkout.loginSignUp')}
          </button>
        </div>
      </div>
    );
  }

  const itemTotal = cart.itemTotal;
  const boxDiscount = (cart.boxSummaries ?? []).reduce(
    (sum, s) => sum + (s.boxType === 'BIG_BOX' ? s.premiumOrDiscount : 0), 0
  );
  /* Delivery charge — same rule as Cart.tsx: free at/above the country threshold */
  const deliveryThreshold = freeDeliveryThresholdFor(country);
  const isFreeDelivery = itemTotal >= deliveryThreshold;
  /* QA-12: fee is in the same currency as the subtotal/threshold (mirrors Cart + backend). */
  const deliveryFee = isFreeDelivery ? 0 : (DELIVERY_FEES[country] ?? DEFAULT_DELIVERY_FEE);
  const appliedCouponDiscount = couponDiscount > 0 && couponEnabled ? couponDiscount : 0;
  const grandTotal = Math.max(0, itemTotal - boxDiscount - appliedCouponDiscount + deliveryFee);
  const itemCount = cart.items.reduce((sum, i) => sum + i.qty, 0);

  async function handlePlaceOrder() {
    if (!selectedAddress) {
      setError('');
      setAddrNotice(t('checkout.pleaseSelectAddress'));
      addrSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    if (!selectedAddress.lat || !selectedAddress.lng) {
      setError('');
      setAddrNotice(t('checkout.pleasePinLocation'));
      addrSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    setError('');
    setAddrNotice('');
    setPlacing(true);
    try {
      const addressId = await resolveAddressId(selectedAddress);
      const order = await ordersApi.checkout(
        {
          addressId,
          paymentMethod: 'Cash on Delivery',
          couponCode: appliedCouponDiscount > 0 ? couponCode : undefined,
        },
        country
      );
      setOrderPlaced(true);
      setPlacedOrder({ order, address: selectedAddress });
      localStorage.removeItem('vpnexues_coupon');
      clearCart();
      navigate(`/orders/${order.id}/success`, { replace: true, state: { order, address: selectedAddress } });
    } catch (err: unknown) {
      let message = t('checkout.somethingWrong');
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosErr = err as { response?: { status?: number; data?: { message?: string; code?: string; city?: string } } };
        const status = axiosErr.response?.status;
        if (status === 409 && axiosErr.response?.data?.code === 'DELIVERY_NOT_AVAILABLE') {
          /* Non-deliverable city: the backend rejected this BEFORE creating any
             order, payment or stock movement, so there is no OrderReceived page
             to show — the Coming Soon page takes its place. Cart and coupon stay
             untouched, so the customer can go back, change city and retry. */
          navigate('/delivery/coming-soon', {
            replace: true,
            state: { city: axiosErr.response.data.city || selectedAddress?.city || '' },
          });
          return;
        }
        if (status === 401 || status === 403) {
          message = t('checkout.placeYourOrder');
          setTimeout(() => openAuthModal(), 300);
        } else if (
          status === 400 &&
          typeof axiosErr.response?.data?.message === 'string' &&
          axiosErr.response.data.message.toLowerCase().includes('empty cart')
        ) {
          // Server cart is empty although the UI showed items (guest cookie was
          // lost during a cold start). Re-pull the server truth so the user
          // sees the real cart instead of a ghost that can never be ordered.
          void refresh();
          message = t('checkout.cartRefreshed');
        } else {
          message = axiosErr.response?.data?.message ?? t('checkout.couldNotPlaceOrder');
        }
      }
      setError(message);
    } finally {
      setPlacing(false);
    }
  }

  const isAnimating = placing;
  const hasCoords = selectedAddress?.lat != null && selectedAddress?.lng != null;

  return (
    <div className={styles.page}>

      {/* ===== Mobile Header ===== */}
      <header className={styles.mobHeader}>
        <button className={styles.mobBack} onClick={() => navigate('/cart')} aria-label={t('common.goBack')}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <div className={styles.mobCenter}>
          <img src={LOGO_URL} alt="" className={styles.mobLogo} />
          <span className={styles.mobTitle}>{t('checkout.title')}</span>
        </div>
        <div className={styles.mobSpacer} />
      </header>

      {/* ===== Mobile Progress Steps ===== */}
      <div className={styles.mobProgress}>
        <div className={styles.mobStepsRow}>
          <div className={`${styles.mobStep} ${styles.mobStepDone}`}>
            <div className={styles.mobStepDot}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <span>{t('checkout.cart')}</span>
          </div>
          <div className={`${styles.mobStepLine} ${styles.mobStepLineDone}`} />
          <div className={`${styles.mobStep} ${styles.mobStepActive}`}>
            <div className={styles.mobStepDot}>2</div>
            <span>{t('checkout.addressStep')}</span>
          </div>
          <div className={styles.mobStepLine} />
          <div className={styles.mobStep}>
            <div className={styles.mobStepDot}>3</div>
            <span>{t('checkout.payment')}</span>
          </div>
        </div>
      </div>

      {/* ===== Content ===== */}
      <div className={styles.sheet} style={isAnimating ? { opacity: 0.5, pointerEvents: 'none' } : undefined}>

        {/* LEFT COLUMN */}
        <div className={styles.left}>

          {/* ─── Delivery Address ─── */}
          <div ref={addrSectionRef} className={`${styles.sectionCard} ${addrNotice ? styles.sectionCardAlert : ''}`}>
            <div className={styles.sectionHead}>
              <div className={styles.sectionHeadLeft}>
                <div className={styles.sectionIcon}>
                  <svg viewBox="0 0 24 24" fill="none" width="18" height="18"><path d="M12 21s-7-5.6-7-11a7 7 0 1114 0c0 5.4-7 11-7 11z" stroke="currentColor" strokeWidth="1.8"/><circle cx="12" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.8"/></svg>
                </div>
                <span className={styles.stepNum}>1</span>
                <h2>{t('checkout.deliveryAddress')}</h2>
              </div>
              {selectedAddress && (
                <button className={styles.changeBtn} onClick={() => setAddrModalOpen(true)}>
                  {t('checkout.changeAddress')}
                  <svg viewBox="0 0 24 24" fill="none" width="12" height="12"><path d="M12 20h9M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4L16.5 3.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
              )}
            </div>

            {addrNotice && (
              <div className={styles.addrNotice} role="alert">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                <span>{addrNotice}</span>
                <button type="button" onClick={() => { setAddrNotice(''); setAddrModalOpen(true); }}>
                  {t('checkout.addAddress')}
                </button>
              </div>
            )}

            {selectedAddress ? (
              <div className={styles.addrBox}>
                {hasCoords && (
                  <div className={styles.miniMap}>
                    <MapContainer
                      center={[selectedAddress.lat!, selectedAddress.lng!]}
                      zoom={15}
                      className={styles.miniMapInner}
                      zoomControl={false}
                      attributionControl={false}
                      dragging={false}
                      touchZoom={false}
                      doubleClickZoom={false}
                      scrollWheelZoom={false}
                      keyboard={false}
                      boxZoom={false}
                    >
                      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                      <Marker position={[selectedAddress.lat!, selectedAddress.lng!]} icon={greenIcon} />
                    </MapContainer>
                    <div className={styles.miniMapBadge}>
                      <svg viewBox="0 0 24 24" fill="none" width="12" height="12"><polyline points="20 6 9 17 4 12" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      {t('checkout.locationPinned')}
                    </div>
                  </div>
                )}

                {!hasCoords && (
                  <button className={styles.mapRequiredBadge} onClick={() => setAddrModalOpen(true)}>
                    <svg viewBox="0 0 24 24" fill="none" width="16" height="16"><path d="M12 21s-7-5.6-7-11a7 7 0 1114 0c0 5.4-7 11-7 11z" stroke="currentColor" strokeWidth="2"/><circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2"/></svg>
                    <span>{t('checkout.locationNotPinned')}</span>
                  </button>
                )}

                <div className={styles.addrInfo}>
                  <div className={styles.addrHomeIcon}>
                    <svg viewBox="0 0 24 24" fill="none" width="20" height="20"><path d="M3 10.5 12 3l9 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M5 9.5V21h14V9.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M10 21v-6h4v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </div>
                  <div className={styles.addrInfoText}>
                    <div className={styles.addrNameRow}>
                      <span className={styles.addrLabel}>{selectedAddress.label}</span>
                      <span className={styles.addrName}>{selectedAddress.name}</span>
                    </div>
                    <div className={styles.addrPhone}>{selectedAddress.phone}</div>
                    <div className={styles.addrText}>
                      {selectedAddress.addressLine}{selectedAddress.flat ? `, ${selectedAddress.flat}` : ''}
                    </div>
                  </div>
                </div>

                <div className={styles.addrActions}>
                  <button className={styles.addrActionBtn} onClick={() => setAddrModalOpen(true)}>
                    <svg viewBox="0 0 24 24" fill="none" width="14" height="14"><path d="M12 20h9M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4L16.5 3.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    {t('checkout.changeAddress')}
                  </button>
                  <button className={`${styles.addrActionBtn} ${styles.addrActionPrimary}`} onClick={() => setAddrModalOpen(true)}>
                    <svg viewBox="0 0 24 24" fill="none" width="14" height="14"><path d="M12 21s-7-5.6-7-11a7 7 0 1114 0c0 5.4-7 11-7 11z" stroke="currentColor" strokeWidth="2"/><circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2"/></svg>
                    {hasCoords ? t('checkout.pinOnMap') : t('checkout.pinLocation')}
                  </button>
                </div>
              </div>
            ) : (
              <button className={styles.addAddrBtn} onClick={() => setAddrModalOpen(true)}>
                <svg viewBox="0 0 24 24" fill="none" width="18" height="18"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                {t('checkout.addDeliveryAddress')}
              </button>
            )}
          </div>

          {/* ─── Payment Method ─── */}
          <div className={styles.sectionCard}>
            <div className={styles.sectionHead}>
              <div className={styles.sectionHeadLeft}>
                <div className={styles.sectionIcon}>
                  <svg viewBox="0 0 24 24" fill="none" width="18" height="18"><rect width="20" height="12" x="2" y="6" rx="2" stroke="currentColor" strokeWidth="1.8"/><circle cx="12" cy="12" r="2" stroke="currentColor" strokeWidth="1.8"/></svg>
                </div>
                <span className={styles.stepNum}>2</span>
                <div className={styles.sectionHeadText}>
                  <h2>{t('checkout.paymentMethod')}</h2>
                  <p className={styles.sectionSub}>{t('checkout.paymentSubtitle')}</p>
                </div>
              </div>
            </div>

            <div className={`${styles.payRow} ${styles.payRowActive}`}>
              <div className={styles.payIconWrap}>
                <i className="fa-solid fa-money-bill-wave" />
              </div>
              <div className={styles.payText}>
                <div className={styles.payName}>{t('checkout.cashOnDelivery')}</div>
                <div className={styles.payDesc}>{t('checkout.payWhenArrives')}</div>
              </div>
              <div className={styles.radioDot}><div className={styles.radioInner} /></div>
            </div>

            <div className={`${styles.payRow} ${styles.payRowDisabled}`} aria-disabled="true">
              <div className={styles.payIconWrap}>
                <i className="fa-solid fa-credit-card" />
              </div>
              <div className={styles.payText}>
                <div className={styles.payName}>{t('checkout.cardPayment')}</div>
                <div className={styles.payDesc}>{t('checkout.cardPaymentDesc')}</div>
              </div>
              <div className={styles.radioDot} />
              <div className={styles.payExtra}>
                <div className={styles.payBrands}>
                  <span className={styles.brandVisa}>VISA</span>
                  <span className={styles.brandMc}><i /><i /></span>
                  <span className={styles.brandRupay}>RuPay</span>
                </div>
                <span className={styles.soonPill}>{t('checkout.comingSoon')}</span>
              </div>
            </div>

            <div className={`${styles.payRow} ${styles.payRowDisabled}`} aria-disabled="true">
              <div className={styles.payIconWrap}>
                <i className="fa-solid fa-arrow-right-arrow-left" />
              </div>
              <div className={styles.payText}>
                <div className={styles.payName}>{t('checkout.upiPayment')}</div>
                <div className={styles.payDesc}>{t('checkout.upiPaymentDesc')}</div>
              </div>
              <div className={styles.radioDot} />
              <div className={styles.payExtra}>
                <div className={styles.payBrands}>
                  <span className={styles.brandGpay}>G&nbsp;Pay</span>
                  <span className={styles.brandPhonepe}>Pe</span>
                  <span className={styles.brandPaytm}>paytm</span>
                </div>
                <span className={styles.soonPill}>{t('checkout.comingSoon')}</span>
              </div>
            </div>

            <div className={`${styles.payRow} ${styles.payRowDisabled}`} aria-disabled="true">
              <div className={styles.payIconWrap}>
                <i className="fa-solid fa-building-columns" />
              </div>
              <div className={styles.payText}>
                <div className={styles.payName}>{t('checkout.netBanking')}</div>
                <div className={styles.payDesc}>{t('checkout.netBankingDesc')}</div>
              </div>
              <div className={styles.radioDot} />
              <div className={styles.payExtra}>
                <span className={styles.soonPill}>{t('checkout.comingSoon')}</span>
              </div>
            </div>

            <div className={styles.secureBanner}>
              <div className={styles.secureShield}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 11.5 11 13.5 15 9.5"/></svg>
              </div>
              <div className={styles.secureText}>
                <div className={styles.secureTitle}>{t('checkout.securePaymentTitle')}</div>
                <div className={styles.secureDesc}>{t('checkout.securePaymentDesc')}</div>
              </div>
            </div>
          </div>

          {/* ─── Mobile Items Card ─── */}
          <div className={styles.mobItemsCard}>
            <div className={styles.mobItemsHead}>
              <span className={styles.mobItemsTitle}>{t('checkout.yourItems')}</span>
              <span className={styles.mobItemsCount}>{itemCount} {t('shop.items')}</span>
            </div>
            {cart.items.map((item) => (
              <div key={item.id} className={styles.mobItem}>
                <div className={styles.mobItemImg}>
                  {item.imageUrl ? <img src={mediaUrl(item.imageUrl)} alt={item.name} onError={(e) => productImageFallback(e, item.name)} /> : <span>&#x1F955;</span>}
                  <span className={styles.mobItemQty}>×{item.qty}</span>
                </div>
                <div className={styles.mobItemInfo}>
                  <div className={styles.mobItemName}>{getProductName(item.name, lang)}</div>
                  <div className={styles.mobItemUnit}>{item.unit}</div>
                </div>
                <div className={styles.mobItemPrice}>{formatPrice(item.lineTotal, country)}</div>
              </div>
            ))}
            <Link to="/cart" className={styles.editLink}>
              <svg viewBox="0 0 24 24" fill="none" width="14" height="14"><path d="M12 20h9M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4L16.5 3.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              {t('checkout.editOrder')}
            </Link>
          </div>

          {/* ─── Mobile Summary ─── */}
          <div className={styles.mobSummary}>
            <div className={styles.mobSummaryRow}>
              <span>{t('checkout.subtotalItems')} ({itemCount} {t('shop.items')})</span>
              <span>{formatPrice(itemTotal, country)}</span>
            </div>
            {boxDiscount > 0 && (
              <div className={styles.mobSummaryRow}>
                <span className={styles.discountLabel}>{t('checkout.bigBoxDiscount')}</span>
                <span className={styles.discountValue}>-{formatPrice(boxDiscount, country)}</span>
              </div>
            )}
              {appliedCouponDiscount > 0 && (
              <div className={`${styles.mobSummaryRow} ${styles.mobSummaryDiscount}`}>
                <span>Coupon ({couponCode})</span>
                <span>-{formatPrice(appliedCouponDiscount, country)}</span>
              </div>
            )}
            <div className={styles.mobSummaryRow}>
              <span>{t('checkout.delivery')}</span>
              {isFreeDelivery
                ? <span className={styles.freeTag}>{t('checkout.free')}</span>
                : <span className={styles.chargeTag}>{formatPrice(deliveryFee, country)}</span>}
            </div>
            <div className={styles.mobSummaryTotal}>
              <span>{t('checkout.total')}</span>
              <span className={styles.mobSummaryTotalVal}>{formatPrice(grandTotal, country)}</span>
            </div>
            {boxDiscount > 0 && (
              <div className={styles.mobSavings}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
                {t('checkout.youSave')} <strong>{formatPrice(boxDiscount, country)}</strong>
              </div>
            )}
          </div>

          {/* ─── Mobile Trust ─── */}
          <div className={styles.mobTrust}>
            <div className={styles.mobTrustItem}>
              <svg viewBox="0 0 24 24" fill="none" width="14" height="14"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="2"/></svg>
              {t('checkout.secure')}
            </div>
            <div className={styles.mobTrustDot} />
            <div className={styles.mobTrustItem}>
              <svg viewBox="0 0 24 24" fill="none" width="14" height="14"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/><polyline points="12 6 12 12 16 14" stroke="currentColor" strokeWidth="2"/></svg>
              {t('checkout.fastDelivery')}
            </div>
            <div className={styles.mobTrustDot} />
            <div className={styles.mobTrustItem}>
              <svg viewBox="0 0 24 24" fill="none" width="14" height="14"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="2"/><polyline points="22 4 12 14.01 9 11.01" stroke="currentColor" strokeWidth="2"/></svg>
              {t('checkout.fresh')}
            </div>
          </div>

          {error && <div className={styles.errorMsg}>{error}</div>}
        </div>

        {/* RIGHT COLUMN — Order Summary (desktop only) */}
        <div className={styles.right}>
          <div className={styles.summaryCard}>
            <div className={styles.summaryHead}>
              <h3>{t('checkout.orderSummary')}</h3>
              <span className={styles.summaryBadge}>{itemCount} {t('shop.items')}</span>
            </div>

            <div className={styles.summaryItems}>
              {cart.items.map((item) => (
                <div key={item.id} className={styles.sumItem}>
                  <div className={styles.sumItemImg}>
                    {item.imageUrl ? <img src={mediaUrl(item.imageUrl)} alt={item.name} onError={(e) => productImageFallback(e, item.name)} /> : <span>&#x1F955;</span>}
                  </div>
                  <div className={styles.sumItemInfo}>
                    <div className={styles.sumItemName}>{getProductName(item.name, lang)}</div>
                    <div className={styles.sumItemUnit}>{item.unit} × {item.qty}</div>
                  </div>
                  <div className={styles.sumItemPrice}>{formatPrice(item.lineTotal, country)}</div>
                </div>
              ))}
            </div>

            <div className={styles.priceBreakdown}>
              <div className={styles.priceRow}>
                <span className={styles.priceLabel}>{t('checkout.subtotalItems')} ({itemCount} {t('shop.items')})</span>
                <span className={styles.priceValue}>{formatPrice(itemTotal, country)}</span>
              </div>
              {boxDiscount > 0 && (
                <div className={`${styles.priceRow} ${styles.priceDiscount}`}>
                  <span className={styles.priceLabel}>{t('checkout.bigBoxDiscount')}</span>
                  <span className={styles.priceValue}>-{formatPrice(boxDiscount, country)}</span>
                </div>
              )}
            {appliedCouponDiscount > 0 && (
                <div className={`${styles.priceRow} ${styles.priceDiscount}`}>
                  <span className={styles.priceLabel}>Coupon ({couponCode})</span>
                  <span className={styles.priceValue}>-{formatPrice(appliedCouponDiscount, country)}</span>
                </div>
              )}
              <div className={`${styles.priceRow} ${styles.deliveryRow}`}>
                <span className={styles.priceLabel}>
                  {t('checkout.deliveryCharge')}
                  <svg viewBox="0 0 24 24" fill="none" width="14" height="14"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/><line x1="12" y1="16" x2="12" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><line x1="12" y1="8" x2="12.01" y2="8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                </span>
                {isFreeDelivery
                  ? <span className={styles.freeTag}>{t('checkout.free')}</span>
                  : <span className={styles.chargeTag}>{formatPrice(deliveryFee, country)}</span>}
              </div>
            </div>

            <div className={styles.totalBar}>
              <span>{t('checkout.totalAmount')}</span>
              <span className={styles.totalAmount}>{formatPrice(grandTotal, country)}</span>
            </div>

            {boxDiscount > 0 && (
              <div className={styles.savingsChip}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
                {t('checkout.youSave')} <strong>{formatPrice(boxDiscount, country)}</strong>
              </div>
            )}

            <button className={styles.ctaBtn} onClick={handlePlaceOrder} disabled={placing || isAnimating}>
              {placing ? (
                <><div className={styles.ctaSpinner} /> {t('checkout.placingOrder')}</>
              ) : (
                <>
                  {t('checkout.placeOrder')} — {formatPrice(grandTotal, country)}
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </>
              )}
            </button>

            <div className={styles.shipStrip}>
              <div className={styles.shipIcon}>
                <svg viewBox="0 0 24 24" fill="none" width="26" height="26"><rect x="1" y="4" width="14" height="11" rx="2" stroke="currentColor" strokeWidth="1.8"/><path d="M15 8h4l3 3v4h-7V8z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><circle cx="5.5" cy="17.5" r="2.3" stroke="currentColor" strokeWidth="1.8"/><circle cx="17.5" cy="17.5" r="2.3" stroke="currentColor" strokeWidth="1.8"/></svg>
              </div>
              <div className={styles.shipText}>
                <div className={styles.shipTitle}>{t('checkout.freeDeliveryTitle')}</div>
                <div className={styles.shipDesc}>{t('checkout.freeDeliveryDesc').replace('{amount}', formatPrice(deliveryThreshold, country))}</div>
              </div>
            </div>

            <div className={styles.assureGrid}>
              <div className={styles.assureItem}>
                <svg viewBox="0 0 24 24" fill="none" width="26" height="26"><path d="M12 21c-5 0-8-3.5-8-9 0-4 2.5-7.5 8-9 5.5 1.5 8 5 8 9 0 5.5-3 9-8 9z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/><path d="M12 21c0-6 1.5-10.5 5-13.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
                <span>{t('checkout.freshProduce')}</span>
              </div>
              <div className={styles.assureItem}>
                <svg viewBox="0 0 24 24" fill="none" width="26" height="26"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/><polyline points="9 11.5 11 13.5 15 9.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                <span>{t('checkout.safePackaging')}</span>
              </div>
              <div className={styles.assureItem}>
                <svg viewBox="0 0 24 24" fill="none" width="26" height="26"><path d="M12 21v-8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/><path d="M12 13c0-3.5-2.5-6-7-6 0 4 2.5 6.5 7 6z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/><path d="M12 11c0-3 2-5.5 6.5-5.5 0 3.8-2.4 6-6.5 5.5z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/></svg>
                <span>{t('checkout.qualityTrust')}</span>
              </div>
            </div>

            <div className={styles.codNote}>{t('checkout.noOnlinePayment')}</div>
          </div>
        </div>
      </div>

      {/* ===== Mobile Sticky Paybar ===== */}
      <div className={styles.mobPaybar} style={isAnimating ? { opacity: 0.5, pointerEvents: 'none' } : undefined}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, width: '100%' }}>
          <div className={styles.mobPaybarTotal}>
            <span className={styles.mobPaybarLabel}>{t('checkout.total')}</span>
            <span className={styles.mobPaybarValue}>{formatPrice(grandTotal, country)}</span>
          </div>
          <SwipeToOrder onSwipeComplete={handlePlaceOrder} disabled={placing || isAnimating} placing={placing} />
        </div>
      </div>

      {/* ===== Order Placed Toast — gated on the POST actually succeeding, not on
             the in-flight `placing` flag (which used to flash "Order Placed" even
             when the request was still running or about to fail). ===== */}
      {orderPlaced && (
        <div className={styles.overlay}>
          <div className={styles.successCard}>
            <div className={styles.successRing}>
              <div className={styles.successCheck}><IconCheck /></div>
            </div>
            <div>
              <h2>{t('checkout.orderPlaced')}</h2>
              <p>{t('checkout.redirecting')}</p>
            </div>
          </div>
        </div>
      )}

      <AddressModal open={addrModalOpen} onClose={() => setAddrModalOpen(false)} />
    </div>
  );
}
