import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useCountry } from '../../context/CountryContext';
import { useAddress } from '../../context/AddressContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { getProductName } from '../../i18n/productNames';
import { formatPrice } from '../../utils/currency';
import { mediaUrl } from '../../utils/mediaUrl';
import { DELIVERY_FEES, DEFAULT_DELIVERY_FEE, freeDeliveryThresholdFor } from '../../utils/delivery';
import { applyCoupon, couponMessageKey, COUPON_NOT_ELIGIBLE_MESSAGE } from '../../api/couponsApi';
import { listOrders } from '../../api/ordersApi';
import AddMoreItemsMenu from '../../components/common/AddMoreItemsMenu';
import AddressModal from '../../components/common/AddressModal';
import ProductInformationModal from '../../components/common/ProductInformationModal';
import { IconApple, IconBasket, IconLeaf, IconArrowRight, IconCart } from '../../components/common/icons';
import type { CartItem } from '../../types';
import styles from './css/Cart.module.css';

const FIRST_ORDER_CODE = 'FIRST200';
const FIRST_ORDER_DISCOUNT = 200;
const FIRST_ORDER_MIN_ORDER = 500;

const TAGLINES = ['Fresh & Natural', 'Farm Fresh', 'Organic', 'Fresh & Healthy', '100% Organic'];

function taglineFor(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) | 0;
  return TAGLINES[Math.abs(h) % TAGLINES.length];
}

/* Three category cards under the cart list — photo tile with a bottom-up
   green gradient, icon badge, subtitle and an "Explore" pill.
   Images are the Home page category shots (Cloudinary). */
const CATEGORY_BANNERS = [
  { key: 'Fruits', labelKey: 'shop.fruits', subKey: 'cart.bannerFruitsSub', img: 'https://res.cloudinary.com/eqjshlur/image/upload/f_auto,q_auto:good,w_900/v1791290096/vpnexues/home/fruits-home-new.jpg', icon: IconApple },
  { key: 'Vegetables', labelKey: 'shop.vegetables', subKey: 'cart.bannerVegetablesSub', img: 'https://res.cloudinary.com/eqjshlur/image/upload/f_auto,q_auto:good,w_900/v1791290370/vpnexues/home/vegetables-home-new.jpg', icon: IconLeaf },
  { key: 'Groceries', labelKey: 'shop.groceries', subKey: 'cart.bannerGroceriesSub', img: 'https://res.cloudinary.com/eqjshlur/image/upload/f_auto,q_auto:good,w_900/v1791290592/vpnexues/home/groceries-home-new.jpg', icon: IconBasket },
] as const;

export default function Cart() {
  const { cart, loading, updateItem, removeItem } = useCart();
  const { country } = useCountry();
  const { selectedAddress } = useAddress();
  const { t, lang } = useLanguage();
  const navigate = useNavigate();

  const [addrModalOpen, setAddrModalOpen] = useState(false);
  const [productInfoItem, setProductInfoItem] = useState<CartItem | null>(null);

  /* ─── First-order coupon (FIRST200 → ₹200 off) ─── */
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponEnabled, setCouponEnabled] = useState(true);
  /* Feedback is stored as an i18n KEY (+ raw fallback for unknown backend text)
     and translated at render time, so switching language re-renders it too. */
  const [couponMsgKey, setCouponMsgKey] = useState('');
  const [couponMsgRaw, setCouponMsgRaw] = useState('');
  const couponMessage = couponMsgKey ? t(couponMsgKey) : couponMsgRaw;
  const [couponInput, setCouponInput] = useState('');
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  useEffect(() => {
    let cancelled = false;
    try {
      const raw = localStorage.getItem('vpnexues_coupon');
      if (raw) {
        const saved = JSON.parse(raw) as { code?: string; discount?: number; enabled?: boolean };
        if (saved.code) {
          // QA-15: never display a discount read from browser storage — re-validate
          // with the server so the shown payable total always matches server math.
          applyCoupon(saved.code, country)
            .then((result) => {
              if (cancelled) return;
              if (result.valid && result.discountAmount > 0) {
                setCouponCode(result.code);
                setCouponDiscount(result.discountAmount);
                setCouponEnabled(saved.enabled !== false);
                persistCoupon(result.code, saved.enabled !== false);
              } else {
                clearStoredCoupon();
              }
            })
            .catch(() => {
              if (cancelled) return;
              clearStoredCoupon();
            });
        }
      }
    } catch { /* ignore corrupt storage */ }
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [country]);

  function persistCoupon(code: string, enabled: boolean) {
    localStorage.setItem('vpnexues_coupon', JSON.stringify({ code, enabled }));
  }

  function clearStoredCoupon() {
    setCouponDiscount(0);
    setCouponEnabled(false);
    setCouponCode('');
    localStorage.removeItem('vpnexues_coupon');
  }

  function toggleCoupon(nextEnabled: boolean) {
    setCouponEnabled(nextEnabled);
    setCouponMsgKey('');
    setCouponMsgRaw('');
    if (couponCode && couponDiscount > 0) {
      persistCoupon(couponCode, nextEnabled);
    }
  }

  function getCartTotalForCoupon() {
    const bigBoxDisc = (cart?.boxSummaries ?? []).reduce(
      (sum, s) => sum + (s.boxType === 'BIG_BOX' ? s.premiumOrDiscount : 0), 0
    );
    return Math.max(0, (cart?.itemTotal ?? 0) - bigBoxDisc);
  }

  async function clearFirstOrderCoupon(messageKey: string) {
    setCouponMsgKey(messageKey);
    setCouponMsgRaw('');
    setCouponDiscount(0);
    setCouponEnabled(false);
    setCouponCode('');
    setCouponInput('');
    localStorage.removeItem('vpnexues_coupon');
  }

  /* Backend coupon messages are English-only — store the i18n key so the
     shopper's current language is used at render time. */
  function showBackendCouponMessage(message: string | undefined) {
    if (!message) {
      setCouponMsgKey('cart.couponFailed');
      setCouponMsgRaw('');
      return;
    }
    const key = couponMessageKey(message);
    if (key) {
      setCouponMsgKey(key);
      setCouponMsgRaw('');
    } else {
      setCouponMsgKey('');
      setCouponMsgRaw(message);
    }
  }

  async function handleApplyCoupon(rawCode: string) {
    const code = rawCode.trim();
    if (!code || applyingCoupon) return;
    const cartTotal = getCartTotalForCoupon();
    const isFirstOrderCode = code.toUpperCase() === FIRST_ORDER_CODE;
    /* FIRST200: cart must be ₹500+ */
    if (isFirstOrderCode && cartTotal < FIRST_ORDER_MIN_ORDER) {
      await clearFirstOrderCoupon('cart.couponNotEligible');
      return;
    }
    /* FIRST200: first-time only — only trust a successful empty order list as proof */
    let verifiedFirstTime = false;
    if (isFirstOrderCode) {
      try {
        const priorOrders = await listOrders();
        if (priorOrders.length > 0) {
          await clearFirstOrderCoupon('cart.couponNotEligible');
          return;
        }
        verifiedFirstTime = true;
      } catch {
        /* Guest or network error — backend re-checks with userId at checkout */
      }
    }
    setApplyingCoupon(true);
    try {
      const result = await applyCoupon(code, country);
      if (result.valid) {
        let discount = Number(result.discountAmount) || 0;
        /* Server validates against ITS cart — empty/unsynced cart can return discount 0. */
        if (discount <= 0 && isFirstOrderCode && cartTotal >= FIRST_ORDER_MIN_ORDER && verifiedFirstTime) {
          discount = FIRST_ORDER_DISCOUNT;
        }
        discount = Math.min(discount, cartTotal);
        showBackendCouponMessage(result.message);
        setCouponCode(result.code);
        setCouponDiscount(discount);
        setCouponEnabled(true);
        setCouponInput('');
        persistCoupon(result.code, true);
      } else if (
        isFirstOrderCode &&
        verifiedFirstTime &&
        cartTotal >= FIRST_ORDER_MIN_ORDER &&
        result.message?.trim() === COUPON_NOT_ELIGIBLE_MESSAGE
      ) {
        /* Order history is empty and local cart is ₹500+ — usually an empty/unsynced server cart.
           Never override expired/invalid (those have different messages). */
        const discount = Math.min(FIRST_ORDER_DISCOUNT, cartTotal);
        setCouponMsgKey('cart.couponApplied');
        setCouponMsgRaw('');
        setCouponCode(FIRST_ORDER_CODE);
        setCouponDiscount(discount);
        setCouponEnabled(true);
        setCouponInput('');
        persistCoupon(FIRST_ORDER_CODE, true);
      } else {
        showBackendCouponMessage(result.message);
        setCouponDiscount(0);
        setCouponEnabled(false);
        setCouponCode('');
        setCouponInput('');
        localStorage.removeItem('vpnexues_coupon');
      }
    } catch {
      setCouponMsgKey('cart.couponFailed');
      setCouponMsgRaw('');
      setCouponDiscount(0);
      setCouponEnabled(false);
    } finally {
      setApplyingCoupon(false);
    }
  }

  /* Drop FIRST200 automatically if the cart falls below the ₹500 minimum */
  useEffect(() => {
    if (couponCode?.toUpperCase() !== FIRST_ORDER_CODE) return;
    const cartTotal = getCartTotalForCoupon();
    if (cartTotal > 0 && cartTotal < FIRST_ORDER_MIN_ORDER) {
      setCouponDiscount(0);
      setCouponEnabled(false);
      setCouponCode('');
      setCouponMsgKey('cart.couponNotEligible');
      setCouponMsgRaw('');
      localStorage.removeItem('vpnexues_coupon');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cart?.itemTotal, cart?.boxSummaries, couponCode]);

  function goToCheckout() {
    navigate('/checkout-temp');
  }

  if (loading) return (
    <div className={`${styles.page} ${styles.pageEmpty}`}>
      <div className={styles.loadingWrap}>
        <div className={styles.loadingSpinner} />
        <span>{t('shop.loading')}</span>
      </div>
    </div>
  );

  if (!cart || cart.items.length === 0) {
    return (
      <div className={`${styles.page} ${styles.pageEmpty}`}>
        <div className={styles.bgFixed} />
        <div className={styles.bgOverlay} />
        <header className={styles.cartHeader}>
          <Link to="/shop" className={styles.backBtn}><i className="fas fa-chevron-left" /></Link>
          <div className={styles.cartHeaderCenter}>
            <div className={styles.cartHeaderTitleRow}>
              <i className="fas fa-shopping-cart" />
              <h1>{t('cart.myCart')}</h1>
            </div>
            <p className={styles.cartHeaderSub}>{t('cart.headerSub')}</p>
          </div>
        </header>
        <section className={styles.desktopBanner}>
          <div className={styles.bannerOverlay}>
            <div className="container">
              <div className={styles.bannerContent}>
                <div className={styles.breadcrumb}><Link to="/">{t('nav.home')}</Link> <span>&rsaquo;</span> {t('cart.myCart')}</div>
                <div className={styles.bannerIcon}><IconCart width={26} height={26} aria-hidden="true" /></div>
                <h1>{t('cart.myCart')}</h1>
                <p>{t('cart.bannerDesc')}</p>
              </div>
            </div>
          </div>
        </section>
        <div className="container">
          <div className={styles.emptyCard}>
            <div className={styles.emptyGlow} aria-hidden="true" />
            <span className={`${styles.sparkle} ${styles.sparkle1}`} aria-hidden="true" />
            <span className={`${styles.sparkle} ${styles.sparkle2}`} aria-hidden="true" />
            <span className={`${styles.sparkle} ${styles.sparkle3}`} aria-hidden="true" />
            <span className={`${styles.sparkle} ${styles.sparkle4}`} aria-hidden="true" />

            <div className={styles.emptyStage}>
              <span className={`${styles.butterfly} ${styles.butterfly1}`} aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 5.5c1.4-2.2 4.6-2.4 5.6-.6.9 1.7-.5 3.6-2.3 4.2-.5.2-1 .3-1.4.4.3.1.7.2 1.1.4 1.6.7 2.6 2.5 1.6 4-1.1 1.7-4.2 1.2-5.3-1-.4-.8-.5-1.7-.5-2.5 0 .8-.1 1.7-.5 2.5-1.1 2.2-4.2 2.7-5.3 1-1-1.5 0-3.3 1.6-4 .4-.2.8-.3 1.1-.4-.4-.1-.9-.2-1.4-.4C4.9 8.5 3.5 6.6 4.4 4.9 5.4 3.1 8.6 3.3 10 5.5z" />
                </svg>
              </span>
              <span className={`${styles.butterfly} ${styles.butterfly2}`} aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 5.5c1.4-2.2 4.6-2.4 5.6-.6.9 1.7-.5 3.6-2.3 4.2-.5.2-1 .3-1.4.4.3.1.7.2 1.1.4 1.6.7 2.6 2.5 1.6 4-1.1 1.7-4.2 1.2-5.3-1-.4-.8-.5-1.7-.5-2.5 0 .8-.1 1.7-.5 2.5-1.1 2.2-4.2 2.7-5.3 1-1-1.5 0-3.3 1.6-4 .4-.2.8-.3 1.1-.4-.4-.1-.9-.2-1.4-.4C4.9 8.5 3.5 6.6 4.4 4.9 5.4 3.1 8.6 3.3 10 5.5z" />
                </svg>
              </span>

              <div className={styles.emptyIllustration}>
                <div className={styles.dropBasket}>
                  <span className={`${styles.dropVeg} ${styles.dropVeg1}`}>
                    <svg viewBox="0 0 40 40" aria-hidden="true">
                      <circle cx="20" cy="24" r="13" fill="#E23B2E" />
                      <circle cx="20" cy="11" r="4.5" fill="#3E8E41" />
                      <rect x="18.6" y="5" width="2.8" height="7" rx="1.4" fill="#2F6B33" />
                      <ellipse cx="15" cy="19" rx="4" ry="2.6" fill="#fff" opacity=".3" transform="rotate(-25 15 19)" />
                    </svg>
                  </span>
                  <span className={`${styles.dropVeg} ${styles.dropVeg2}`}>
                    <svg viewBox="0 0 40 40" aria-hidden="true">
                      <path d="M13 16h14l-7 21Z" fill="#F08A24" />
                      <path d="M17.6 21h4M16.4 26h5" stroke="#D9741A" strokeWidth="1.6" strokeLinecap="round" />
                      <path d="M20 16c-3-5-8-6-10-4 3 1 5 4 6 7Z" fill="#3E8E41" />
                      <path d="M20 16c3-5 8-6 10-4-3 1-5 4-6 7Z" fill="#5FA84C" />
                      <path d="M20 16c0-5 2-8 5-9-2 3-3 6-3 9Z" fill="#4E9A46" />
                    </svg>
                  </span>
                  <span className={`${styles.dropVeg} ${styles.dropVeg3}`}>
                    <svg viewBox="0 0 40 40" aria-hidden="true">
                      <rect x="17" y="21" width="6" height="14" rx="3" fill="#A8D08D" />
                      <circle cx="13" cy="19" r="7" fill="#3E8E41" />
                      <circle cx="27" cy="19" r="7" fill="#4E9A46" />
                      <circle cx="20" cy="13" r="8" fill="#5FA84C" />
                      <circle cx="20" cy="21" r="7" fill="#4E9A46" />
                      <circle cx="16" cy="14" r="3" fill="#8FCB72" opacity=".7" />
                    </svg>
                  </span>
                  <span className={`${styles.dropVeg} ${styles.dropVeg4}`}>
                    <svg viewBox="0 0 40 40" aria-hidden="true">
                      <ellipse cx="20" cy="25" rx="10" ry="13" fill="#6B3FA0" transform="rotate(12 20 25)" />
                      <ellipse cx="15.5" cy="20" rx="3" ry="5" fill="#fff" opacity=".22" transform="rotate(12 16 20)" />
                      <circle cx="20" cy="12" r="5" fill="#3E8E41" />
                      <rect x="18.6" y="5" width="2.8" height="7" rx="1.4" fill="#2F6B33" />
                    </svg>
                  </span>

                  <svg className={styles.basketSvg} viewBox="0 0 240 200" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <defs>
                      <linearGradient id="vpBasketBody" x1="120" y1="60" x2="120" y2="150" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#D9EBCB" />
                        <stop offset="1" stopColor="#B4D3A0" />
                      </linearGradient>
                      <linearGradient id="vpBasketRim" x1="120" y1="50" x2="120" y2="68" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#2A6B41" />
                        <stop offset="1" stopColor="#14472F" />
                      </linearGradient>
                    </defs>

                    <ellipse cx="120" cy="178" rx="72" ry="10" fill="#14472F" opacity=".09" />

                    {/* handle */}
                    <path d="M88 62C88 30 152 30 152 62" stroke="#1a5c38" strokeWidth="7" strokeLinecap="round" opacity=".9" />

                    {/* front wall — drawn after the veggies so they rest INSIDE the basket */}
                    <path d="M60 62h120l-13 74a11 11 0 0 1-11 9H84a11 11 0 0 1-11-9L60 62Z" fill="url(#vpBasketBody)" stroke="#14472F" strokeWidth="5" strokeLinejoin="round" />

                    {/* horizontal weave */}
                    <g stroke="#14472F" strokeWidth="2.6" opacity=".2" strokeLinecap="round">
                      <path d="M72 84h96" />
                      <path d="M74 102h92" />
                      <path d="M77 120h86" />
                    </g>
                    {/* vertical weave */}
                    <g stroke="#14472F" strokeWidth="2" opacity=".13" strokeLinecap="round">
                      <path d="M96 66 91 143" />
                      <path d="M120 66v79" />
                      <path d="M144 66l5 77" />
                    </g>

                    {/* rim */}
                    <rect className={styles.basketRim} x="50" y="50" width="140" height="16" rx="8" fill="url(#vpBasketRim)" />

                    {/* VPnexues brand badge */}
                    <circle cx="120" cy="105" r="26" fill="#fff" />
                    <image href="/images/logo/vp-logo.svg" x="95" y="80" width="50" height="50" />
                  </svg>
                </div>
              </div>
            </div>

            <div className={styles.emptyCopy}>
              <span className={styles.emptyPill}>{t('cart.emptyPill')}</span>
              <h3 className={styles.emptyTitle}>{t('cart.emptyTitle')}</h3>
              <p className={styles.emptyDesc}>
                {t('cart.emptyDesc')}
              </p>
            </div>

            <div className={styles.emptyActions}>
              <Link to="/shop" className={styles.emptyBtn}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
                  <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" />
                </svg>
                {t('cart.startShopping')}
              </Link>
            </div>

            <div className={styles.emptyFeatures}>
              <div className={styles.emptyFeature}>
                <span className={`${styles.emptyFeatureIcon} ${styles.featGreen}`}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                </span>
                <div>
                  <strong>{t('cart.featOrganic')}</strong>
                  <small>{t('cart.featOrganicSub')}</small>
                </div>
              </div>
              <div className={styles.emptyFeature}>
                <span className={`${styles.emptyFeatureIcon} ${styles.featGold}`}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 5v3h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
                </span>
                <div>
                  <strong>{t('cart.featFreeDelivery')}</strong>
                  <small>{t('cart.featFreeDeliverySub')}</small>
                </div>
              </div>
              <div className={styles.emptyFeature}>
                <span className={`${styles.emptyFeatureIcon} ${styles.featCoral}`}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
                </span>
                <div>
                  <strong>{t('cart.featFarmDoor')}</strong>
                  <small>{t('cart.featFarmDoorSub')}</small>
                </div>
              </div>
            </div>

            <div className={styles.emptyCats}>
              <span className={styles.emptyCatLabel}>{t('cart.popular')}</span>
              <Link to="/shop?category=Vegetables" className={styles.emptyCatPill}>{t('shop.vegetables')}</Link>
              <Link to="/shop?category=Fruits" className={styles.emptyCatPill}>{t('shop.fruits')}</Link>
              {/* TEMP (07-Oct-2026): beverages pill removed per head */}
              <Link to="/shop?category=Groceries" className={styles.emptyCatPill}>{t('shop.groceries')}</Link>
            </div>
          </div>
        </div>
        <div className={styles.cartFooter}>
          {t('cart.copyright')}
        </div>
      </div>
    );
  }

  const bigBoxDiscount = (cart.boxSummaries ?? []).reduce(
    (sum, s) => sum + (s.boxType === 'BIG_BOX' ? s.premiumOrDiscount : 0), 0
  );
  const total = Math.max(0, cart.itemTotal - bigBoxDiscount);
  /* Discount only counts when the coupon checkbox is ticked */
  const appliedCouponDiscount = couponDiscount > 0 && couponEnabled ? couponDiscount : 0;
  const finalTotal = Math.max(0, total - appliedCouponDiscount);
  const itemCount = cart.items.reduce((sum, i) => sum + i.qty, 0);
  /* BIG_BOX lines carry qty=1 + weight in weightKg — weight-aware so a 12 kg box
     isn't understated ~12x in the "actual amount" row (and its savings row shows). */
  const actualAmount = cart.items.reduce(
    (sum, i) => sum + (i.oldPrice ?? i.unitPrice) * (i.boxType === 'BIG_BOX' ? (i.weightKg ?? 1) : i.qty), 0
  );
  const discount = actualAmount - cart.itemTotal;

  const deliveryThreshold = freeDeliveryThresholdFor(country);
  const isFreeDelivery = cart.itemTotal >= deliveryThreshold;
  const deliveryRemaining = Math.max(0, deliveryThreshold - cart.itemTotal);
  const deliveryProgressPct = Math.min(Math.max((cart.itemTotal / deliveryThreshold) * 100, 0), 100);
  /* QA-12: fee is in the same currency as the subtotal/threshold — a flat 40
     printed as $40/د.إ40, larger than the free-delivery threshold itself. */
  const deliveryCharge = isFreeDelivery ? 0 : (DELIVERY_FEES[country] ?? DEFAULT_DELIVERY_FEE);
  const estimatedTotal = finalTotal + deliveryCharge;

  /* Savings — only count coupon when enabled */
  const totalSavings = cart.items.reduce((sum, i) => {
    const old = i.oldPrice ?? i.unitPrice;
    return sum + Math.max(0, old - i.unitPrice) * i.qty;
  }, 0) + appliedCouponDiscount;

  /* Offer banner shows when coupon is not actively discounting the total */
  const showFirstOrderBanner = appliedCouponDiscount <= 0;
  /* Applied row / success message only while the coupon is actually on */
  const showAppliedRow = appliedCouponDiscount > 0 && couponCode.length > 0;

  const allItems: CartItem[] = cart.items;

  return (
    <div className={styles.page}>
      <div className={styles.bgFixed} />
      <div className={styles.bgOverlay} />

      <header className={styles.cartHeader}>
        <Link to="/shop" className={styles.backBtn}><i className="fas fa-chevron-left" /></Link>
        <div className={styles.cartHeaderCenter}>
          <div className={styles.cartHeaderTitleRow}>
            <i className="fas fa-shopping-cart" />
            <h1>{t('cart.myCart')}</h1>
          </div>
          <p className={styles.cartHeaderSub}>{t('cart.headerSub')}</p>
        </div>
      </header>

      <div className={styles.stickyCheckoutBar}>
        <div className={styles.stickyBarInfo}>
          <div className={styles.stickyBarItemCount}><i className="fas fa-tag" /> {itemCount} {t('shop.items')}</div>
          <div className={styles.stickyBarTotal}>{formatPrice(estimatedTotal, country)}</div>
          <div className={styles.stickyBarDeliveryLine}>
            <i className="fas fa-truck" />
            {isFreeDelivery
              ? <span>{t('cart.freeDelivery')}</span>
              : deliveryRemaining > 0 && <span>{formatPrice(deliveryRemaining, country)} {t('cart.moreForFreeDelivery')}</span>}
          </div>
        </div>
        <button className={styles.stickyBarCheckoutBtn} onClick={goToCheckout}>
          <i className="fas fa-shield-halved" />
          <span>{t('cart.checkout')}</span>
          <i className="fas fa-chevron-right" />
        </button>
      </div>

      <section className={styles.desktopBanner}>
        <div className={styles.bannerOverlay}>
          <div className="container">
            <div className={styles.bannerContent}>
              <div className={styles.breadcrumb}><Link to="/">{t('nav.home')}</Link> <span>&rsaquo;</span> {t('cart.myCart')}</div>
              <div className={styles.bannerIcon}><IconCart width={26} height={26} aria-hidden="true" /></div>
              <h1>{t('cart.myCart')}</h1>
              <p>{t('cart.bannerDesc')}</p>
            </div>
          </div>
        </div>
      </section>

      <div className="container">
        <div className={styles.content}>
          <section className={styles.column}>
            <div className={styles.cartCard}>
              <div className={styles.tableHeader}>
                <span className={styles.colProduct}>{t('cart.product')}</span>
                <span className={styles.colPrice}>{t('cart.price')}</span>
                <span className={styles.colQty}>{t('cart.quantity')}</span>
                <span className={styles.colSubtotal}>{t('cart.subtotal')}</span>
              </div>

              <div className={`${styles.cartItemsList} ${allItems.length > 3 ? styles.hasManyItems : ''}`} data-cart-list>
                {allItems.map((item, i) => {
                  const hasDiscount = item.oldPrice != null && item.oldPrice > item.unitPrice;
                  const discountPct = hasDiscount ? Math.round((1 - item.unitPrice / item.oldPrice!) * 100) : 0;

                  return (
                    <div key={item.id} className={styles.cartItem} data-pid={item.productId} style={{ animationDelay: `${i * 0.08}s` }}>
                      <span className={styles.countBadge}>{item.qty} {t('shop.items')}</span>
                      <button className={styles.removeBtn} onClick={() => removeItem(item.id)}>{t('cart.remove')}</button>

                      <div className={styles.colProduct}>
                        <div className={styles.itemEmoji}>
                          {item.imageUrl
                            ? <img src={mediaUrl(item.imageUrl)} alt={item.name} onError={(e) => { (e.target as HTMLImageElement).src = `https://placehold.co/200x200/f4f9f0/4a7c3f?text=${encodeURIComponent(item.name.split(' ')[0])}&font=roboto`; }} />
                            : <span>&#x1F955;</span>}
                          {item.productId && (
                            <button
                              type="button"
                              className={styles.productInfoButton}
                              onClick={() => setProductInfoItem(item)}
                              aria-label={`${t('cart.productInfo')}: ${getProductName(item.name, lang)}`}
                              title={t('cart.productInfo')}
                            >
                              <span aria-hidden="true">i</span>
                            </button>
                          )}
                        </div>
                        <div className={styles.itemInfo}>
                          <div className={styles.itemName}>
                            <span className={styles.itemNameText}>{getProductName(item.name, lang)}</span>
                          </div>
                          {item.unit && <div className={styles.itemWeight}>{item.unit}</div>}
                          <div className={styles.itemTagline}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66.95-2.3c.48.17.98.3 1.34.3C19 20 22 3 22 3c-1 2-8 2.25-13 3.25S2 11.5 2 13.5s1.75 3.75 1.75 3.75C7 8 17 8 17 8z" /></svg>
                            <span>{taglineFor(item.name)}</span>
                          </div>
                        </div>
                      </div>

                      <div className={styles.colPrice}>
                        <div className={styles.itemPrice}>
                          <span>{formatPrice(item.unitPrice * item.qty, country)}</span>
                          {hasDiscount && (
                            <>
                              <span className={styles.oldPrice}>{formatPrice(item.oldPrice! * item.qty, country)}</span>
                              <span className={styles.discountBadge}>{discountPct}% off</span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className={styles.colQty}>
                        {item.boxType === 'BIG_BOX' ? (
                          <div className={styles.weightBadge}>{(item.weightKg ?? 0).toFixed(1)} kg</div>
                        ) : (
                          <div className={styles.qtyControl}>
                            <button className={styles.qtyBtn} onClick={() => item.qty <= 1 ? removeItem(item.id) : updateItem(item.id, item.qty - 1)}>&minus;</button>
                            <div className={styles.qtyNum}>{item.qty}</div>
                            <button className={styles.qtyBtn} onClick={() => updateItem(item.id, item.qty + 1)}>+</button>
                          </div>
                        )}
                      </div>

                      <div className={styles.colSubtotal}>
                        <div className={styles.itemSubtotal}>{formatPrice(item.lineTotal, country)}</div>
                        <button className={styles.removeIcon} onClick={() => removeItem(item.id)} title={t('cart.remove')}>
                          <i className="fas fa-trash-alt" />
                        </button>
                      </div>
                    </div>
                  );
                })}

                <div className={styles.farmersStrip}>
                  <span className={styles.farmersStripIcon}>
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path d="M12 21c0-6 2.5-10.5 8.5-12.5C19.5 15.5 16.5 19.5 12 21z" fill="#2E9E4F" />
                      <path d="M12 21C10.4 15.2 7.4 11.8 3.2 10.8 4.2 17 7.4 20 12 21z" fill="#7CB342" />
                      <path d="M12 21v-5.5" stroke="#2E7D32" strokeWidth="1.8" strokeLinecap="round" />
                    </svg>
                  </span>
                  <div className={styles.farmersStripText}>
                    <strong>{t('cart.farmersTitle')}</strong>
                    <small>{t('cart.farmersSub')}</small>
                  </div>
                  <span className={styles.farmersStripEnd}>
                    <i className="fas fa-hands-holding-heart" />
                    <i className="fas fa-chevron-right" />
                  </span>
                </div>
              </div>

              <div className={styles.summaryMobile}>
                <div className={styles.mobileCoupon}>
                  <div className={styles.mobileCouponLeft}>
                    <span className={styles.mobileCouponIcon}><i className="fas fa-tag" /></span>
                    <div className={styles.mobileCouponTitle}>{t('cart.couponLabel')}</div>
                  </div>
                  <div className={styles.mobileCouponRight}>
                    <input
                      type="text"
                      placeholder={t('cart.couponPlaceholder')}
                      className={styles.mobileCouponField}
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                    />
                    <button
                      className={styles.mobileCouponBtn}
                      disabled={applyingCoupon}
                      onClick={() => handleApplyCoupon(couponInput)}
                    >
                      {applyingCoupon ? '...' : t('cart.apply')}
                    </button>
                  </div>
                </div>
                {couponMessage && !showAppliedRow && (
                  <div className={styles.couponError}>
                    {couponMessage}
                  </div>
                )}
                {couponMessage && showAppliedRow && (
                  <div className={styles.couponSuccess}>
                    {couponMessage}
                  </div>
                )}
                {showFirstOrderBanner && (
                  <div className={styles.ftBanner}>
                    <div className={styles.ftBannerLeft}>
                      <div className={styles.ftBannerBadge}>
                        <span className={styles.ftBannerGiftIcon}>&#x1F381;</span>
                        <span className={styles.ftBannerTag}>{t('cart.ftTag')}</span>
                      </div>
                      <div className={styles.ftBannerTitle}>
                        {t('cart.ftGet')} <span className={styles.ftBannerHighlight}>&#x20B9;200</span> {t('cart.ftOff')}
                      </div>
                      <div className={styles.ftBannerSub}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="#5B8C51"><path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66l.95-2.3c.48.17.98.3 1.34.3C19 20 22 3 22 3c-1 2-8 2.25-13 3.25S2 11.5 2 13.5s1.75 3.75 1.75 3.75C7 8 17 8 17 8z"/></svg>
                          {t('cart.ftTerms')}
                      </div>
                      <button
                        className={styles.ftBannerBtn}
                        disabled={applyingCoupon}
                        onClick={() => handleApplyCoupon(FIRST_ORDER_CODE)}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
                        {applyingCoupon ? t('cart.applying') : `${t('cart.apply')} ${FIRST_ORDER_CODE}`}
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                      </button>
                    </div>
                    <div className={styles.ftBannerRight}>
                      <div className={styles.ftBannerCircle}>
                        <svg className={styles.ftBannerGiftBox} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <rect x="22" y="54" width="76" height="48" rx="4" fill="#F5ECD7" stroke="#E5D9B8" strokeWidth="1.5"/>
                          <rect x="18" y="42" width="84" height="16" rx="3" fill="#FAF6E8" stroke="#E5D9B8" strokeWidth="1.5"/>
                          <rect x="52" y="42" width="16" height="60" fill="#1B6B2A"/>
                          <rect x="18" y="48" width="84" height="5" fill="#1B6B2A"/>
                          <path d="M60 42C60 42 48 28 40 32C33 36 42 42 60 42C78 42 87 36 80 32C72 28 60 42 60 42Z" fill="#1B6B2A"/>
                          <path d="M60 42C60 42 54 30 60 24C66 30 60 42 60 42Z" fill="#228B34"/>
                          <circle cx="60" cy="41" r="5" fill="#0F5120"/>
                        </svg>
                      </div>
                      <svg className={styles.ftLeaf1} width="28" height="28" viewBox="0 0 24 24" fill="#3DA35D"><path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66l.95-2.3c.48.17.98.3 1.34.3C19 20 22 3 22 3c-1 2-8 2.25-13 3.25S2 11.5 2 13.5s1.75 3.75 1.75 3.75C7 8 17 8 17 8z"/></svg>
                      <svg className={styles.ftLeaf2} width="24" height="24" viewBox="0 0 24 24" fill="#2E9E4F"><path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66l.95-2.3c.48.17.98.3 1.34.3C19 20 22 3 22 3c-1 2-8 2.25-13 3.25S2 11.5 2 13.5s1.75 3.75 1.75 3.75C7 8 17 8 17 8z"/></svg>
                      <svg className={styles.ftSparkle1} width="18" height="18" viewBox="0 0 24 24" fill="#F2B233"><path d="M12 2L13.5 9.5L21 11L13.5 12.5L12 20L10.5 12.5L3 11L10.5 9.5L12 2Z"/></svg>
                      <svg className={styles.ftSparkle2} width="14" height="14" viewBox="0 0 24 24" fill="#F2B233"><path d="M12 2L13.5 9.5L21 11L13.5 12.5L12 20L10.5 12.5L3 11L10.5 9.5L12 2Z"/></svg>
                    </div>
                  </div>
                )}
                {showAppliedRow && (
                  <label className={`${styles.ftBannerApplied} ${!couponEnabled ? styles.ftBannerAppliedOff : ''}`}>
                    <span className={styles.ftBannerAppliedText}>
                      &quot;{couponCode}&quot; {t('cart.appliedSaved')} {formatPrice(couponDiscount, country)}
                    </span>
                    <input
                      type="checkbox"
                      className={styles.couponToggle}
                      checked={couponEnabled}
                      onChange={(e) => toggleCoupon(e.target.checked)}
                      aria-label={`${couponCode} ${couponEnabled ? t('cart.couponRemove') : t('cart.couponApply')}`}
                    />
                  </label>
                )}
                {totalSavings > 0 && (
                  <div className={styles.mobileSavings}>
                    <i className="fas fa-badge-check" /> {t('cart.youAreSaving')} <strong>{formatPrice(totalSavings, country)}</strong> {t('cart.onThisOrder')}
                  </div>
                )}
                <div className={styles.summaryRowTotal}>
                  <span>{t('cart.total')}</span>
                  <span>{formatPrice(estimatedTotal, country)}</span>
                </div>
              </div>

              <div className={styles.checkoutWrapMobile}>
                <button className={styles.checkoutBtn} onClick={goToCheckout}>
                  <span>{t('cart.checkout')}</span>
                  <span className={styles.checkoutTotal}>{formatPrice(estimatedTotal, country)}</span>
                  <i className="far fa-arrow-right" />
                </button>
              </div>

              <div className={styles.cardExtras}>
                <div className={styles.catBanners}>
                  {CATEGORY_BANNERS.map(({ key, labelKey, subKey, img, icon: Icon }) => (
                    <Link key={key} to={`/shop?category=${key}`} className={styles.catBanner}>
                      <img className={styles.catBannerImg} src={img} alt="" loading="lazy" />
                      <span className={styles.catBannerShade} />
                      <span className={styles.catBannerBody}>
                        <span className={styles.catBannerIcon}>
                          <Icon width={18} height={18} aria-hidden="true" />
                        </span>
                        <span className={styles.catBannerTitle}>{t(labelKey)}</span>
                        <span className={styles.catBannerSub}>{t(subKey)}</span>
                        <span className={styles.catBannerCta}>
                          {t('cart.bannerExplore')}
                          <IconArrowRight width={14} height={14} aria-hidden="true" />
                        </span>
                      </span>
                    </Link>
                  ))}
                </div>

                <AddMoreItemsMenu />
              </div>
            </div>
          </section>

          <aside className={styles.sidebar}>
            <div className={styles.sidebarCard}>
              <div className={styles.sidebarTitle}><i className="fas fa-location-dot" /> {t('cart.deliveryAddress')}</div>
              {selectedAddress ? (
                <div className={styles.addrSaved}>
                  <strong>{selectedAddress.label}</strong>
                  <span>{selectedAddress.addressLine}</span>
                  {selectedAddress.flat && <span>{selectedAddress.flat}</span>}
                </div>
              ) : (
                <p className={styles.addrEmpty}>{t('cart.noAddressSet')}</p>
              )}
              <button className={styles.sidebarAddrBtn} onClick={() => setAddrModalOpen(true)}>
                <i className="fas fa-plus" /> {selectedAddress ? t('cart.change') : t('cart.addAddress')}
              </button>
            </div>

            <div className={`${styles.sidebarCard} ${styles.sidebarSummary}`}>
              <div className={styles.osHeader}>
                <div className={styles.osHeaderTitle}><i className="fas fa-receipt" /> {t('cart.orderSummary')}</div>
                <div className={styles.osItemCount}>{itemCount} {t('shop.items')}</div>
              </div>
              <div className={styles.osDivider} />
              <div className={styles.osTop}>
                  <div className={styles.osRows}>
                    <div className={styles.osRow}><span>{t('cart.actualAmount')}</span><span>{formatPrice(actualAmount, country)}</span></div>
                    {discount > 0 && (
                      <div className={styles.osRow}><span>{t('cart.discount')}</span><span className={styles.osDiscountVal}>-{formatPrice(discount, country)}</span></div>
                    )}
                    <div className={styles.osDividerThin} />
                    <div className={styles.osRow}><span>{t('cart.subtotal')}</span><span>{formatPrice(cart.itemTotal, country)}</span></div>
                    <div className={styles.osRow}><span>{t('cart.delivery')}</span>
                      {isFreeDelivery
                        ? <span className={styles.osFree}>{t('cart.free')}</span>
                        : <span className={styles.osCharged}>{formatPrice(deliveryCharge, country)}</span>
                      }
                    </div>
                    {appliedCouponDiscount > 0 && (
                      <div className={styles.osRow}><span>Coupon ({couponCode})</span><span className={styles.osDiscountVal}>-{formatPrice(appliedCouponDiscount, country)}</span></div>
                    )}
                  </div>
                  {/* Delivery progress */}
                  {deliveryThreshold > 0 && (
                    <div className={styles.osDeliveryProgress}>
                      <div className={styles.osDeliveryMsg}>
                        {isFreeDelivery
                          ? <>{t('cart.freeDeliveryUnlocked')}</>
                          : <>{t('cart.addMoreForFree')} <span className={styles.osMsgAmount}>{formatPrice(deliveryRemaining, country)}</span> {t('cart.moreForFree')}</>
                        }
                      </div>
                      <div className={styles.osProgressTrack}>
                        <div className={styles.osProgressFill} style={{ width: `${deliveryProgressPct}%` }} />
                      </div>
                    </div>
                  )}
                  {/* Coupon code */}
                  <div className={styles.osCoupon}>
                    <div className={styles.osCouponLabel}><i className="fas fa-tag" /> {t('cart.couponLabel')}</div>
                    <div className={styles.osCouponInput}>
                      <input
                        type="text"
                        placeholder={t('cart.couponPlaceholder')}
                        className={styles.osCouponField}
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value)}
                      />
                      <button
                        className={styles.osCouponBtn}
                        disabled={applyingCoupon}
                        onClick={() => handleApplyCoupon(couponInput)}
                      >
                        {applyingCoupon ? '...' : t('cart.apply')}
                      </button>
                    </div>
                    {couponMessage && !showAppliedRow && (
                      <div className={styles.couponError}>
                        {couponMessage}
                      </div>
                    )}
                    {couponMessage && showAppliedRow && (
                      <div className={styles.couponSuccess}>
                        {couponMessage}
                      </div>
                    )}
                  </div>
                </div>
                <div className={styles.osBottom}>
                  <div className={styles.osDivider} />
                  {/* First Order Offer banner — sits directly above Estimated Total */}
                  {showFirstOrderBanner && (
                    <div className={styles.ftBanner}>
                      <div className={styles.ftBannerLeft}>
                        <div className={styles.ftBannerBadge}>
                          <span className={styles.ftBannerGiftIcon}>&#x1F381;</span>
                          <span className={styles.ftBannerTag}>{t('cart.ftTag')}</span>
                        </div>
                        <div className={styles.ftBannerTitle}>
                          {t('cart.ftGet')} <span className={styles.ftBannerHighlight}>&#x20B9;200</span> {t('cart.ftOff')}
                        </div>
                        <div className={styles.ftBannerSub}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="#5B8C51"><path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66l.95-2.3c.48.17.98.3 1.34.3C19 20 22 3 22 3c-1 2-8 2.25-13 3.25S2 11.5 2 13.5s1.75 3.75 1.75 3.75C7 8 17 8 17 8z"/></svg>
                        {t('cart.ftTerms')}
                        </div>
                        <button
                          className={styles.ftBannerBtn}
                          disabled={applyingCoupon}
                          onClick={() => handleApplyCoupon(FIRST_ORDER_CODE)}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
                          {applyingCoupon ? t('cart.applying') : `${t('cart.apply')} ${FIRST_ORDER_CODE}`}
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                        </button>
                      </div>
                      <div className={styles.ftBannerRight}>
                        <div className={styles.ftBannerCircle}>
                          <svg className={styles.ftBannerGiftBox} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect x="22" y="54" width="76" height="48" rx="4" fill="#F5ECD7" stroke="#E5D9B8" strokeWidth="1.5"/>
                            <rect x="18" y="42" width="84" height="16" rx="3" fill="#FAF6E8" stroke="#E5D9B8" strokeWidth="1.5"/>
                            <rect x="52" y="42" width="16" height="60" fill="#1B6B2A"/>
                            <rect x="18" y="48" width="84" height="5" fill="#1B6B2A"/>
                            <path d="M60 42C60 42 48 28 40 32C33 36 42 42 60 42C78 42 87 36 80 32C72 28 60 42 60 42Z" fill="#1B6B2A"/>
                            <path d="M60 42C60 42 54 30 60 24C66 30 60 42 60 42Z" fill="#228B34"/>
                            <circle cx="60" cy="41" r="5" fill="#0F5120"/>
                          </svg>
                        </div>
                        <svg className={styles.ftLeaf1} width="28" height="28" viewBox="0 0 24 24" fill="#3DA35D"><path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66.95-2.3c.48.17.98.3 1.34.3C19 20 22 3 22 3c-1 2-8 2.25-13 3.25S2 11.5 2 13.5s1.75 3.75 1.75 3.75C7 8 17 8 17 8z"/></svg>
                        <svg className={styles.ftLeaf2} width="24" height="24" viewBox="0 0 24 24" fill="#2E9E4F"><path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66.95-2.3c.48.17.98.3 1.34.3C19 20 22 3 22 3c-1 2-8 2.25-13 3.25S2 11.5 2 13.5s1.75 3.75 1.75 3.75C7 8 17 8 17 8z"/></svg>
                        <svg className={styles.ftSparkle1} width="18" height="18" viewBox="0 0 24 24" fill="#F2B233"><path d="M12 2L13.5 9.5L21 11L13.5 12.5L12 20L10.5 12.5L3 11L10.5 9.5L12 2Z"/></svg>
                        <svg className={styles.ftSparkle2} width="14" height="14" viewBox="0 0 24 24" fill="#F2B233"><path d="M12 2L13.5 9.5L21 11L13.5 12.5L12 20L10.5 12.5L3 11L10.5 9.5L12 2Z"/></svg>
                      </div>
                    </div>
                  )}
                  {showAppliedRow && (
                    <label className={`${styles.ftBannerApplied} ${!couponEnabled ? styles.ftBannerAppliedOff : ''}`}>
                      <span className={styles.ftBannerAppliedText}>
                        &quot;{couponCode}&quot; {t('cart.appliedSaved')} {formatPrice(couponDiscount, country)}
                      </span>
                      <input
                        type="checkbox"
                        className={styles.couponToggle}
                        checked={couponEnabled}
                        onChange={(e) => toggleCoupon(e.target.checked)}
                        aria-label={`${couponCode} ${couponEnabled ? t('cart.couponRemove') : t('cart.couponApply')}`}
                      />
                    </label>
                  )}
                  {totalSavings > 0 && (
                    <div className={styles.osSavings}>
                      <i className="fas fa-tag" /> {t('cart.youAreSaving')} <strong>{formatPrice(totalSavings, country)}</strong> {t('cart.onThisCart')}
                    </div>
                  )}
                  <div className={styles.osTotalRow}>
                    <span className={styles.osTotalLabel}>{t('cart.estimatedTotal')}</span>
                    <span className={styles.osTotalValue}>{formatPrice(estimatedTotal, country)}</span>
                  </div>
                  <button className={styles.osCheckoutBtn} onClick={goToCheckout}>
                    <i className="fas fa-lock" />
                    <span>{t('cart.checkout')}</span>
                    <i className="fas fa-arrow-right" />
                  </button>
                </div>
            </div>
          </aside>
        </div>

        <div className={styles.trustSection}>
          <div className={styles.trustGrid}>
            <div className={styles.trustBadge}>
              <div className={`${styles.trustIcon} ${styles.trustShipping}`}><i className="fas fa-truck" /></div>
              <div><h4>{t('cart.freeShipping')}</h4><p>{t('cart.freeShippingDesc')}</p></div>
            </div>
            <div className={styles.trustBadge}>
              <div className={`${styles.trustIcon} ${styles.trustPayment}`}><i className="fas fa-lock" /></div>
              <div><h4>{t('cart.securePayment')}</h4><p>{t('cart.securePaymentDesc')}</p></div>
            </div>
            <div className={styles.trustBadge}>
              <div className={`${styles.trustIcon} ${styles.trustSupport}`}><i className="fas fa-headset" /></div>
              <div><h4>{t('cart.support247')}</h4><p>{t('cart.support247Desc')}</p></div>
            </div>
            <div className={styles.trustBadge}>
              <div className={`${styles.trustIcon} ${styles.trustFresh}`}><i className="fas fa-leaf" /></div>
              <div><h4>{t('cart.freshnessGuaranteed')}</h4><p>{t('cart.freshnessGuaranteedDesc')}</p></div>
            </div>
          </div>
          <div className={styles.trustBanner}>
            <div className={styles.trustBannerOverlay} />
            <div className={styles.trustBannerInner}>
              <div className={styles.trustBannerItem}>
                <div className={styles.trustBannerIcon}><i className="fas fa-truck" /></div>
                <div className={styles.trustBannerText}><strong>{t('cart.freeShipping')}</strong><small>{t('cart.freeShippingDesc')}</small></div>
              </div>
              <div className={styles.trustBannerItem}>
                <div className={styles.trustBannerIcon}><i className="fas fa-lock" /></div>
                <div className={styles.trustBannerText}><strong>{t('cart.securePayment')}</strong><small>{t('cart.securePaymentDesc')}</small></div>
              </div>
              <div className={styles.trustBannerItem}>
                <div className={styles.trustBannerIcon}><i className="fas fa-headset" /></div>
                <div className={styles.trustBannerText}><strong>{t('cart.support247')}</strong><small>{t('cart.support247Desc')}</small></div>
              </div>
              <div className={styles.trustBannerItem}>
                <div className={styles.trustBannerIcon}><i className="fas fa-leaf" /></div>
                <div className={styles.trustBannerText}><strong>{t('cart.freshnessGuaranteed')}</strong><small>{t('cart.freshnessGuaranteedDesc')}</small></div>
              </div>
              <div className={styles.trustBannerItem}>
                <div className={styles.trustBannerIcon}><i className="fas fa-tractor" /></div>
                <div className={styles.trustBannerText}><strong>{t('cart.directFromFarmers')}</strong><small>{t('cart.directFromFarmersDesc')}</small></div>
              </div>
              <div className={styles.trustBannerItem}>
                <div className={styles.trustBannerIcon}><i className="fas fa-exchange-alt" /></div>
                <div className={styles.trustBannerText}><strong>{t('cart.easyReturns')}</strong><small>{t('cart.easyReturnsDesc')}</small></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AddressModal open={addrModalOpen} onClose={() => setAddrModalOpen(false)} />
      {productInfoItem && (
        <ProductInformationModal
          name={productInfoItem.name}
          imageUrl={productInfoItem.imageUrl}
          onClose={() => setProductInfoItem(null)}
        />
      )}
    </div>
  );
}
