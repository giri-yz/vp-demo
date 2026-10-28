import { useLocation, useParams, Link } from 'react-router-dom';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import type { Order, OrderItem, Address } from '../../types';
import { useCountry } from '../../context/CountryContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { formatPrice } from '../../utils/currency';
import { deliverWhatsAppPopup } from '../../utils/whatsappPopup';
import * as ordersApi from '../../api/ordersApi';
import OrderFeedbackModal from './OrderFeedbackModal';
import styles from './css/OrderSuccess.module.css';

/* WhatsApp handoff (mirrors the B2B enquiry flow): after an order is placed the
   customer's chat opens with the full order + customer + exact location details
   prefilled, addressed to the orders desk. */
const WA_NUMBER = '916383086471';

function LeafSprig({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 240 240" className={className} aria-hidden="true" focusable="false">
      <path
        d="M24 226C70 190 108 156 150 122C180 98 208 76 228 62"
        fill="none"
        stroke="currentColor"
        strokeWidth="5"
        strokeLinecap="round"
        opacity="0.7"
      />
      <g fill="currentColor">
        <path d="M0 0 Q26 -15 52 0 Q26 15 0 0" transform="translate(52,204) rotate(-112)" />
        <path d="M0 0 Q24 -14 48 0 Q24 14 0 0" transform="translate(84,176) rotate(22)" />
        <path d="M0 0 Q26 -15 52 0 Q26 15 0 0" transform="translate(114,146) rotate(-112)" />
        <path d="M0 0 Q24 -14 48 0 Q24 14 0 0" transform="translate(146,118) rotate(22)" />
        <path d="M0 0 Q24 -14 48 0 Q24 14 0 0" transform="translate(178,90) rotate(-112)" />
        <path d="M0 0 Q20 -12 40 0 Q20 12 0 0" transform="translate(206,66) rotate(22)" />
      </g>
    </svg>
  );
}

function DetailIcon({ children }: { children: ReactNode }) {
  return (
    <span className={styles.detailIcon} aria-hidden="true">
      <svg
        viewBox="0 0 24 24"
        width="16"
        height="16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {children}
      </svg>
    </span>
  );
}

function BasketIllustration() {
  return (
    <svg viewBox="0 0 340 340" className={styles.basketSvg} aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="osBasketBody" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#dfb277" />
          <stop offset="55%" stopColor="#c8935a" />
          <stop offset="100%" stopColor="#ab7844" />
        </linearGradient>
        <linearGradient id="osBasketRim" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#d3a066" />
          <stop offset="100%" stopColor="#a4703f" />
        </linearGradient>
        <linearGradient id="osTomato" x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0%" stopColor="#ef7165" />
          <stop offset="100%" stopColor="#d44a3f" />
        </linearGradient>
        <clipPath id="osBasketClip">
          <path d="M62 196 L278 196 L250 288 Q247 298 237 298 L103 298 Q93 298 90 288 Z" />
        </clipPath>
      </defs>

      <ellipse cx="172" cy="310" rx="112" ry="16" fill="rgba(44,79,37,0.16)" />

      <path
        d="M84 196C92 106 248 106 256 196"
        fill="none"
        stroke="#a4703f"
        strokeWidth="13"
        strokeLinecap="round"
      />

      <g>
        <rect x="66" y="150" width="15" height="46" rx="7" fill="#a8c487" />
        <circle cx="62" cy="142" r="17" fill="#4c8b3f" />
        <circle cx="83" cy="136" r="19" fill="#5b9a48" />
        <circle cx="73" cy="154" r="16" fill="#417a36" />
        <circle cx="93" cy="152" r="13" fill="#55904a" />
      </g>

      <g>
        <circle cx="116" cy="158" r="35" fill="#8cbb7b" />
        <circle cx="154" cy="140" r="31" fill="#a5cd96" />
        <circle cx="98" cy="180" r="27" fill="#6aa358" />
        <circle cx="140" cy="176" r="30" fill="#7fb069" />
        <path d="M154 112C160 96 178 94 186 104C176 116 162 120 154 112Z" fill="#8cbb7b" />
        <path d="M100 128C88 114 96 98 110 98C116 112 112 124 100 128Z" fill="#a5cd96" />
      </g>

      <g>
        <circle cx="214" cy="154" r="31" fill="url(#osTomato)" />
        <ellipse cx="204" cy="143" rx="10" ry="6" fill="rgba(255,255,255,0.35)" transform="rotate(-28 204 143)" />
        <g fill="#4c8b3f">
          <ellipse cx="214" cy="126" rx="13" ry="5" />
          <ellipse cx="202" cy="130" rx="10" ry="4.4" transform="rotate(-42 202 130)" />
          <ellipse cx="226" cy="130" rx="10" ry="4.4" transform="rotate(42 226 130)" />
        </g>
        <path d="M214 124V112" stroke="#4c8b3f" strokeWidth="5" strokeLinecap="round" />
      </g>

      <g transform="translate(274,150) rotate(22)">
        <path d="M-16 -62 L16 -62 L6 44 Q0 58 -6 44 Z" fill="#f08c3c" />
        <g stroke="#d9722b" strokeWidth="4" strokeLinecap="round" opacity="0.65">
          <path d="M-11 -34 L10 -34" />
          <path d="M-8 -8 L12 -8" />
          <path d="M-5 16 L10 16" />
        </g>
        <g fill="#5b8c51">
          <ellipse cx="-14" cy="-78" rx="7" ry="17" transform="rotate(-26 -14 -78)" />
          <ellipse cx="2" cy="-84" rx="7" ry="19" />
          <ellipse cx="17" cy="-77" rx="7" ry="16" transform="rotate(26 17 -77)" />
        </g>
      </g>

      <path
        d="M62 196 L278 196 L250 288 Q247 298 237 298 L103 298 Q93 298 90 288 Z"
        fill="url(#osBasketBody)"
      />
      <g clipPath="url(#osBasketClip)">
        <path d="M50 218H292" stroke="rgba(255,255,255,0.24)" strokeWidth="8" />
        <path d="M50 250H292" stroke="rgba(0,0,0,0.07)" strokeWidth="8" />
        <path d="M50 280H292" stroke="rgba(255,255,255,0.18)" strokeWidth="8" />
        <g stroke="rgba(0,0,0,0.08)" strokeWidth="5">
          <path d="M78 190L84 302" />
          <path d="M110 190L118 302" />
          <path d="M146 190L150 302" />
          <path d="M184 190L182 302" />
          <path d="M222 190L214 302" />
          <path d="M256 190L244 302" />
        </g>
      </g>

      <rect x="54" y="184" width="232" height="27" rx="13.5" fill="url(#osBasketRim)" />
      <path d="M64 192H276" stroke="rgba(255,255,255,0.22)" strokeWidth="3" strokeLinecap="round" />

      <path
        d="M124 186C118 218 123 248 117 270C136 281 160 281 177 270C171 246 176 216 170 186Z"
        fill="#f8f4e9"
      />
      <g stroke="rgba(44,79,37,0.12)" strokeWidth="2.5" fill="none" strokeLinecap="round">
        <path d="M142 190C140 220 143 246 139 268" />
        <path d="M158 190C157 220 160 246 156 268" />
      </g>
    </svg>
  );
}

export default function OrderSuccess() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const state = location.state as { order?: Order; address?: Address } | null;
  const { country } = useCountry();
  const { user } = useAuth();
  const { t } = useLanguage();

  /* Primary: router state passed by checkout. Fallback: fetch the order from
     the server (QA-06 — never from browser storage) so a hard refresh of this
     URL still shows the order. The address is only carried in router state. */
  const [fetchedOrder, setFetchedOrder] = useState<Order | null>(null);
  const order = state?.order ?? fetchedOrder;
  const address = state?.address ?? null;

  useEffect(() => {
    if (state?.order || !id) return;
    let cancelled = false;
    ordersApi.getOrder(id)
      .then((o) => { if (!cancelled) setFetchedOrder(o); })
      .catch(() => { /* order unavailable — page renders its empty state */ });
    return () => { cancelled = true; };
  }, [id, state?.order]);

  /* History note: this page used to call window.history.replaceState('/',) here to
     skip Back-to-checkout, but that desynced React Router (URL '/' while the success
     component still rendered — refresh/share/Back all behaved unpredictably). Back
     simply returns to checkout, which shows the now-empty cart — correct behaviour. */

  const deliveryAddress = address
    ? (() => {
        const line = address.addressLine ?? '';
        const parts = [address.city, address.state, address.pincode]
          .filter(Boolean)
          .filter((p) => !line.includes(p));
        return parts.length > 0 ? `${line}, ${parts.join(', ')}` : line;
      })()
    : null;

  /* Exact location: Google Maps pin when the address was saved with map
     coordinates (AddressModal stores lat/lng), otherwise a Maps search link
     built from the written address. */
  const mapsLink =
    address && address.lat != null && address.lng != null
      ? `https://www.google.com/maps?q=${address.lat},${address.lng}`
      : deliveryAddress
        ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(deliveryAddress)}`
        : null;

  /* Prefilled message for the orders desk: customer info, full item list,
     money breakdown and the delivery location (English — support-side text). */
  function buildWhatsAppText(): string {
    if (!order) return 'Hi VPNexues! I just placed an order on your website.';
    const lines: string[] = [
      'Hi VPNexues! I just placed an order on your website.',
      '',
      'ORDER',
      `Order ID: #${order.orderNumber || order.id.slice(-8)}`,
      `Placed at: ${new Date(order.createdAt).toLocaleString('en-IN')}`,
      `Payment: ${order.paymentMethod || 'Cash on Delivery'}`,
      '',
      'CUSTOMER',
      `Name: ${address?.name || '-'}`,
      `Phone: ${address?.phone || '-'}`,
    ];
    if (user?.email) lines.push(`Email: ${user.email}`);
    if (deliveryAddress || mapsLink) {
      lines.push('', 'DELIVERY LOCATION');
      if (deliveryAddress) lines.push(`Address: ${deliveryAddress}`);
      if (mapsLink) lines.push(`Exact location: ${mapsLink}`);
    }
    lines.push('', 'ITEMS');
    /* Group by box type (Shop / Small Box / Big Box) instead of leaking raw
       enums like [SMALL_BOX] into the line. Big Box is weight-priced
       (lineTotal = unitPrice x weightKg — see PricingService.computeBigBoxPricing),
       so it shows "x kg x price/kg"; its qty field is only 0.5kg steps and is
       misleading. Small Box charges +15% on units past the first 10, so the
       qty x price multiplication is only printed when it actually equals the
       line total. */
    const fmtKg = (n: number) => String(Math.round(n * 10) / 10);
    const itemLine = (it: OrderItem, i: number): string => {
      const unit = formatPrice(it.unitPrice, country);
      const total = formatPrice(it.lineTotal, country);
      if (it.boxType === 'BIG_BOX' && it.weightKg != null) {
        return `${i}. ${it.name} - ${fmtKg(parseFloat(String(it.weightKg)))}kg x ${unit}/kg = ${total}`;
      }
      const expected = it.unitPrice * it.qty;
      if (Math.abs(expected - it.lineTotal) < 0.01) {
        return `${i}. ${it.name} - Qty ${it.qty} x ${unit} = ${total}`;
      }
      return `${i}. ${it.name} - Qty ${it.qty} x ${unit} (incl. box pricing) = ${total}`;
    };
    const groups: Array<{ label: string; items: OrderItem[] }> = [
      { label: 'SHOP', items: order.items.filter((i) => !i.boxType) },
      { label: 'SMALL BOX', items: order.items.filter((i) => i.boxType === 'SMALL_BOX') },
      { label: 'BIG BOX', items: order.items.filter((i) => i.boxType === 'BIG_BOX') },
    ].filter((g) => g.items.length > 0);
    for (const g of groups) {
      /* Single plain-shop order keeps the old flat format; any box group (or a
         mixed cart) gets a labelled header so the desk knows what it is. */
      const showLabel = groups.length > 1 || g.label !== 'SHOP';
      if (showLabel) {
        const count =
          g.label === 'SMALL BOX'
            ? ` (${g.items.reduce((n, i) => n + i.qty, 0)} units)`
            : g.label === 'BIG BOX'
              ? ` (${fmtKg(g.items.reduce((n, i) => n + (parseFloat(String(i.weightKg ?? 0)) || 0), 0))} kg)`
              : '';
        lines.push('', `${g.label}${count}`);
      }
      g.items.forEach((it, idx) => lines.push(itemLine(it, idx + 1)));
    }
    lines.push('', 'AMOUNTS');
    lines.push(`Item total: ${formatPrice(order.itemTotal, country)}`);
    if (order.discount > 0) lines.push(`Discount: -${formatPrice(order.discount, country)}`);
    if (order.boxDiscount > 0) lines.push(`Box discount: -${formatPrice(order.boxDiscount, country)}`);
    if (order.deliveryFee > 0) lines.push(`Delivery fee: ${formatPrice(order.deliveryFee, country)}`);
    if (order.tax > 0) lines.push(`Tax: ${formatPrice(order.tax, country)}`);
    if (order.tip > 0) lines.push(`Tip: ${formatPrice(order.tip, country)}`);
    lines.push(`Grand total: ${formatPrice(order.grandTotal, country)}`);
    lines.push('', 'Please confirm my order. Thank you!');
    lines.push(
      '',
      'Want more fresh farm produce? Explore our full shop and order again anytime:',
      'https://www.vpnexues.com/shop',
    );
    return lines.join('\n');
  }

  const waLink = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(buildWhatsAppText())}`;

  /* WhatsApp only AFTER this page has been seen (v3, matches mobile):
     the Place Order click creates NOTHING (no window, no focus jump) — the
     rejected v2 popup was visible at the screen corner. 3s after this page
     mounts (animations end ~1.8s) deliverWhatsAppPopup() opens wa.me in a
     new tab/window; if the browser blocks that popup we do NOTHING — the
     customer stays on the order confirmation (v4: no same-tab hijack; the
     visible "Continue on WhatsApp" button is the guaranteed path). The
     "already
     opened" flag is set INSIDE the callback: React StrictMode (dev)
     double-invokes effects — run #1's cleanup clears its timer and run #2
     must still schedule a live one.
     The feedback popup auto-opens ~5s after mount; while it is open the
     WhatsApp handoff is deferred (never cancelled) so the two overlays
     never fight for attention — once the customer finishes/dismisses the
     feedback popup, WhatsApp delivers immediately. */
  const waOpenedRef = useRef(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const waPendingRef = useRef(false);

  const fireWhatsApp = () => {
    if (waOpenedRef.current) return;
    waOpenedRef.current = true;
    // Auto-handoff: if the browser blocks the popup, do NOTHING — the
    // customer stays on the order confirmation (no same-tab hijack).
    deliverWhatsAppPopup(waLink, { sameTabFallback: false });
  };

  useEffect(() => {
    if (!order) return;
    const timer = window.setTimeout(() => {
      if (waOpenedRef.current) return;
      if (feedbackOpen) {
        waPendingRef.current = true;
        return;
      }
      waOpenedRef.current = true;
      // Auto-handoff: blocked popup = stay on this page, never redirect.
      deliverWhatsAppPopup(waLink, { sameTabFallback: false });
    }, 3000);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order, feedbackOpen]);

  /* Flush the deferred WhatsApp handoff once the feedback popup closes. */
  useEffect(() => {
    if (!feedbackOpen && waPendingRef.current) {
      waPendingRef.current = false;
      fireWhatsApp();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [feedbackOpen]);

  /* Auto-open the feedback popup 5s after mount, so the customer sees the
     confirmed order first. StrictMode-safe:
     the "already shown" flag is set inside the timer callback. */
  const feedbackShownRef = useRef(false);
  useEffect(() => {
    if (!order) return;
    const timer = window.setTimeout(() => {
      if (feedbackShownRef.current) return;
      feedbackShownRef.current = true;
      setFeedbackOpen(true);
    }, 5000);
    return () => window.clearTimeout(timer);
  }, [order]);

  return (
    <div className={styles.page}>
      <span className={`${styles.blob} ${styles.blobOne}`} aria-hidden="true" />
      <span className={`${styles.blob} ${styles.blobTwo}`} aria-hidden="true" />
      <span className={`${styles.blob} ${styles.blobThree}`} aria-hidden="true" />
      <span className={`${styles.blob} ${styles.blobFour}`} aria-hidden="true" />

      <svg className={styles.wave} viewBox="0 0 1440 240" preserveAspectRatio="none" aria-hidden="true" focusable="false">
        <path className={styles.waveSoft} d="M0 96C220 24 420 132 700 84C960 40 1180 136 1440 60L1440 240L0 240Z" />
        <path className={styles.waveDeep} d="M0 154C240 96 480 190 760 138C1010 92 1220 178 1440 122L1440 240L0 240Z" />
      </svg>

      <LeafSprig className={`${styles.leaf} ${styles.leafTl}`} />
      <LeafSprig className={`${styles.leaf} ${styles.leafTr}`} />
      <LeafSprig className={`${styles.leaf} ${styles.leafBl}`} />
      <LeafSprig className={`${styles.leaf} ${styles.leafBr}`} />

      <div className={styles.thanksNote}>
        <svg viewBox="0 0 24 24" className={styles.thanksLeaf} aria-hidden="true" focusable="false">
          <path d="M4 20C4 11 11 4 20 4C20 13 13 20 4 20Z" fill="currentColor" />
          <path className={styles.thanksLeafVein} d="M5.5 18.5L17 7" strokeWidth="1.6" opacity="0.7" />
        </svg>
        <p className={styles.thanksText}>{t('orderSuccess.thankYou')}</p>
        <svg className={styles.thanksUnderline} viewBox="0 0 200 14" preserveAspectRatio="none" aria-hidden="true" focusable="false">
          <path
            d="M4 9C42 3 78 12 118 6C150 1 176 8 196 5"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
          />
        </svg>
      </div>

      <div className={styles.basket} aria-hidden="true">
        <BasketIllustration />
      </div>

      <div className={styles.content}>
        <div className={styles.checkWrap}>
          <svg viewBox="0 0 120 120" className={styles.ring}>
            <circle cx="60" cy="60" r="54" />
          </svg>
          <div className={styles.circleBg} />
          <svg viewBox="0 0 120 120" className={styles.check}>
            <path d="M35 62L52 79L86 42" />
          </svg>
        </div>

        <h1 className={styles.heading}>{t('orderSuccess.orderReceived')}</h1>

        <p className={styles.subtitle}>
          {t('orderSuccess.freshBasketConfirmed')}
        </p>

        <div className={styles.orderCard}>
          <div className={styles.orderRow}>
            <DetailIcon>
              <rect x="4" y="3" width="16" height="18" rx="3" />
              <path d="M8 8h8M8 12h8M8 16h5" />
            </DetailIcon>
            <div className={styles.rowBody}>
              <span className={styles.orderLabel}>{t('orderSuccess.orderId')}</span>
              <span className={styles.orderValue}>
                #{order?.orderNumber || id?.slice(-8) || '000000'}
              </span>
            </div>
          </div>
          <div className={styles.orderRow}>
            <DetailIcon>
              <path d="M20.6 13.4l-7.2 7.2a2 2 0 01-2.8 0L3 13V3h10l7.6 7.6a2 2 0 010 2.8z" />
              <circle cx="7.6" cy="7.6" r="1.4" />
            </DetailIcon>
            <div className={styles.rowBody}>
              <span className={styles.orderLabel}>{t('orderSuccess.totalAmount')}</span>
              <span className={styles.orderValue}>
                {order ? formatPrice(order.grandTotal, country) : formatPrice(0, country)}
              </span>
            </div>
          </div>
          <div className={styles.orderRow}>
            <DetailIcon>
              <rect x="2.5" y="5" width="19" height="14" rx="3" />
              <path d="M2.5 10h19" />
              <path d="M6 15h4" />
            </DetailIcon>
            <div className={styles.rowBody}>
              <span className={styles.orderLabel}>{t('orderSuccess.paymentMethod')}</span>
              <span className={styles.orderValue}>
                {order?.paymentMethod || t('orderSuccess.cashOnDelivery')}
              </span>
            </div>
          </div>
          <div className={styles.orderDivider} />
          <div className={styles.orderRow}>
            <DetailIcon>
              <circle cx="12" cy="12" r="9" />
              <path d="M8.5 12.3l2.6 2.6 4.7-5.2" />
            </DetailIcon>
            <div className={styles.rowBody}>
              <span className={styles.orderLabel}>{t('orderSuccess.orderStatus')}</span>
              <span className={styles.statusBadge}>{t('orderSuccess.confirmed')}</span>
            </div>
          </div>
          {address && (
            <>
              <div className={styles.orderDivider} />
              <div className={styles.orderRow}>
                <DetailIcon>
                  <circle cx="12" cy="8" r="3.6" />
                  <path d="M5 20a7 7 0 0114 0" />
                </DetailIcon>
                <div className={styles.rowBody}>
                  <span className={styles.orderLabel}>{t('orderSuccess.customerName')}</span>
                  <span className={styles.orderValue}>{address.name}</span>
                </div>
              </div>
              <div className={styles.orderRow}>
                <DetailIcon>
                  <path d="M7 3h3l1.6 4-2 1.4a12 12 0 005.5 5.5l1.4-2 4 1.6v3a2 2 0 01-2.2 2A17 17 0 015 5.2 2 2 0 017 3z" />
                </DetailIcon>
                <div className={styles.rowBody}>
                  <span className={styles.orderLabel}>{t('orderSuccess.contactNumber')}</span>
                  <span className={styles.orderValue}>{address.phone}</span>
                </div>
              </div>
              {deliveryAddress && (
                <div className={`${styles.orderRow} ${styles.rowStack}`}>
                  <DetailIcon>
                    <path d="M12 21s7-6.1 7-11a7 7 0 10-14 0c0 4.9 7 11 7 11z" />
                    <circle cx="12" cy="10" r="2.6" />
                  </DetailIcon>
                  <div className={styles.rowBody}>
                    <span className={styles.orderLabel}>{t('orderSuccess.deliveryAddress')}</span>
                    <span className={styles.orderValue}>{deliveryAddress}</span>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <div className={styles.ctaGroup}>
          <button type="button" className={styles.ctaWhatsapp} onClick={() => { waOpenedRef.current = true; deliverWhatsAppPopup(waLink); }}>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true" focusable="false">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            {t('orderSuccess.sendWhatsapp')}
          </button>
          <Link to="/shop" className={styles.ctaPrimary}>
            {t('orderSuccess.continueShopping')}
            <svg viewBox="0 0 24 24" fill="none" width="16" height="16">
              <path d="M5 12H19M19 12L13 6M19 12L13 18" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
          <Link to="/account/orders" className={styles.ctaSecondary}>
            {t('orderSuccess.viewMyOrders')}
          </Link>
        </div>

        {order && !feedbackOpen && (
          <button
            type="button"
            className={styles.ratePill}
            onClick={() => setFeedbackOpen(true)}
          >
            <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true" focusable="false">
              <path d="M12 2l2.9 6.2 6.8.9-5 4.7 1.3 6.7L12 17.2 6 20.5l1.3-6.7-5-4.7 6.8-.9L12 2z" />
            </svg>
            {t('orderSuccess.rateExperience')}
          </button>
        )}
      </div>

      <OrderFeedbackModal
        open={feedbackOpen}
        onClose={() => setFeedbackOpen(false)}
        orderNumber={order?.orderNumber || id?.slice(-8)}
        countryCode={country}
      />
    </div>
  );
}
