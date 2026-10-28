import { memo, useState } from 'react';
import type { MouseEvent, RefObject } from 'react';
import { Link } from 'react-router-dom';
import { useReducedMotion } from 'framer-motion';
import StatCounter from './StatCounter';
import type { Product } from '../../types';
import { useCart } from '../../context/CartContext';
import { useCountry } from '../../context/CountryContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { getProductName } from '../../i18n/productNames';
import { currencySymbol } from '../../utils/currency';
import {
  cloudinaryWidth,
  cloudinarySrcSet,
  isCloudinaryUrl,
  PRODUCT_IMG_WIDTHS,
  PRODUCT_IMG_SIZES,
} from '../../utils/imageUrls';
import { IconMinus, IconPlus } from './icons';
import ProductInformationModal from './ProductInformationModal';
import { flyToCartFx } from './flyToCartFx';
import styles from './css/ProductCard.module.css';

const BIG_BOX_WEIGHT_STEP = 0.5;

/* "per kg" → "kg", "per 500g" → "500g" — show quantity as "2 kg" not "2 per kg". */
function shortUnit(unit: string): string {
  return unit.replace(/^per\s+/i, '');
}

const MAX_TILT = 4;

/* srcset candidates — matches the card image box (≈170px mobile / ≈220px desktop / ≈350px tablet). */
const CARD_SRC_WIDTHS = [320, 480, 800];
const CARD_SIZES = '(min-width: 1280px) 220px, (min-width: 768px) 350px, 46vw';

function handleCardMove(e: MouseEvent<HTMLDivElement>) {
  const el = e.currentTarget;
  const rect = el.getBoundingClientRect();
  if (!rect.width || !rect.height) return;
  const x = (e.clientX - rect.left) / rect.width;
  const y = (e.clientY - rect.top) / rect.height;
  el.style.setProperty('--card-rx', `${(MAX_TILT * y - MAX_TILT / 2).toFixed(2)}deg`);
  el.style.setProperty('--card-ry', `${(MAX_TILT * x - MAX_TILT / 2).toFixed(2)}deg`);
}

function handleCardLeave(e: MouseEvent<HTMLDivElement>) {
  const el = e.currentTarget;
  el.style.removeProperty('--card-rx');
  el.style.removeProperty('--card-ry');
}

interface ProductCardProps {
  product: Product;
  /** When set, this card manages a Small/Big Box cart line (via setBoxItem) instead of a plain cart line.
   *  BIG_BOX steps by weight (kg) instead of item count — the box is sold by weight, not piece count. */
  boxType?: 'SMALL_BOX' | 'BIG_BOX';
  /** Desktop-only smaller card (image 156px, tighter fonts) — used by the Small/Big Box builder grids. */
  compact?: boolean;
  /** When set AND visible, the add flight lands here (Order Summary box) instead of the header cart.
   *  Box pages pass it only for the first row of cards. */
  flyTargetEl?: RefObject<HTMLElement | null>;
  /** Shop only (first 15 cards): serve the image as responsive WebP renditions
   *  (srcset/sizes + lazy loading + width/height) instead of the full original JPEG. */
  optimized?: boolean;
  /** Image fetch priority: `true` → eager + fetchpriority=high, `false` → native lazy loading,
   *  omitted → eager (unchanged default for pages other than Shop). */
  priority?: boolean;
}

export default memo(function ProductCard({ product, boxType, compact, flyTargetEl, optimized, priority }: ProductCardProps) {
  const { cart, addItem, updateItem, removeItem, setBoxItem } = useCart();
  const { country } = useCountry();
  const { t, lang } = useLanguage();
  const [productInfoOpen, setProductInfoOpen] = useState(false);
  const reduceMotion = useReducedMotion();
  const currency = currencySymbol(country);
  const isWeightBased = boxType === 'BIG_BOX';
  const cartItem = cart?.items.find(
    (i) => i.productId === product.id && (boxType ? i.boxType === boxType : !i.boxType)
  );
  const weight = cartItem?.weightKg ?? 0;
  /* Snapshot of the visible product for the optimistic cart line (instant correct prices). */
  const snap = {
    name: product.name,
    unitPrice: product.price,
    unit: product.unit,
    imageUrl: product.imageUrl,
    oldPrice: product.oldPrice,
  };

  /* Order-summary landing only when the box is actually on screen — on
     mobile/tablet the summary sits below the grid, so the default
     (selectionBar / header cart) target stays better. */
  function resolveFlyTarget(): HTMLElement | null {
    const el = flyTargetEl?.current;
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.top < window.innerHeight && r.bottom > 0 ? el : null;
  }

  function handleAdd(e: MouseEvent<HTMLButtonElement>) {
    flyToCartFx(e.currentTarget, { targetEl: resolveFlyTarget() });
    if (isWeightBased) setBoxItem(product.id, 'BIG_BOX', 1, BIG_BOX_WEIGHT_STEP, snap);
    else if (boxType) setBoxItem(product.id, boxType, 1, null, snap);
    else addItem(product.id, 1, snap);
  }

  function handleIncrease(e: MouseEvent<HTMLButtonElement>) {
    if (!cartItem) return;
    flyToCartFx(e.currentTarget, {
      feedbackEl: e.currentTarget.parentElement?.querySelector<HTMLElement>('output'),
      targetEl: resolveFlyTarget(),
    });
    if (isWeightBased) setBoxItem(product.id, 'BIG_BOX', 1, Math.round((weight + BIG_BOX_WEIGHT_STEP) * 10) / 10, snap);
    else if (boxType) setBoxItem(product.id, boxType, cartItem.qty + 1, null, snap);
    else updateItem(cartItem.id, cartItem.qty + 1);
  }

  function handleDecrease() {
    if (!cartItem) return;
    if (isWeightBased) {
      const next = Math.round((weight - BIG_BOX_WEIGHT_STEP) * 10) / 10;
      if (next <= 0) removeItem(cartItem.id);
      else setBoxItem(product.id, 'BIG_BOX', 1, next, snap);
    } else if (boxType) {
      if (cartItem.qty <= 1) removeItem(cartItem.id);
      else setBoxItem(product.id, boxType, cartItem.qty - 1, null, snap);
    } else if (cartItem.qty > 1) {
      updateItem(cartItem.id, cartItem.qty - 1);
    } else {
      removeItem(cartItem.id);
    }
  }

  return (
    <div
      className={`${styles.card} ${cartItem ? styles.selected : ''} ${compact ? styles.compact : ''}`}
      data-category={product.category}
      onMouseMove={handleCardMove}
      onMouseLeave={handleCardLeave}
    >
      {cartItem && (
        <span className={styles.selectedBadge} aria-hidden="true">
          ✓
        </span>
      )}
      <div className={styles.imageContainer}>
        <Link to={`/shop/${product.slug}`} className={styles.imageWrap}>
          {product.discountPct != null && <span className={styles.discountBadge}>{product.discountPct}{t('product.percentOff')}</span>}
          {product.imageUrl ? (
            <img
              className={styles.image}
              src={optimized ? cloudinaryWidth(product.imageUrl, 640) : product.imageUrl}
              srcSet={optimized
                ? cloudinarySrcSet(product.imageUrl, PRODUCT_IMG_WIDTHS)
                : cloudinarySrcSet(product.imageUrl, CARD_SRC_WIDTHS)}
              sizes={optimized
                ? PRODUCT_IMG_SIZES
                : (isCloudinaryUrl(product.imageUrl) ? CARD_SIZES : undefined)}
              width={optimized ? 400 : undefined}
              height={optimized ? 400 : undefined}
              loading={priority === false ? 'lazy' : 'eager'}
              fetchPriority={priority ? 'high' : 'auto'}
              decoding="async"
              alt={getProductName(product.name, lang)}
              onError={(e) => {
                const el = e.currentTarget;
                // Transformed URL failed → drop srcset so the browser retries the original URL.
                if (el.hasAttribute('srcset')) {
                  el.removeAttribute('srcset');
                  el.removeAttribute('sizes');
                  return;
                }
                if (!el.src.includes('placehold.co')) {
                  el.src = `https://placehold.co/400x400/f4f9f0/4a7c3f?text=${encodeURIComponent(product.name.split(' ')[0])}&font=roboto`;
                }
              }}
            />
          ) : (
            <span className={styles.fallback}>🥬</span>
          )}
        </Link>
        <button
          type="button"
          className={styles.productInfoButton}
          onClick={() => setProductInfoOpen(true)}
          aria-label={`${t('cart.productInfo')}: ${getProductName(product.name, lang)}`}
          title={t('cart.productInfo')}
        >
          i
        </button>
      </div>
      <div className={styles.body}>
        <h3 className={styles.name}>
          <Link to={`/shop/${product.slug}`}>{getProductName(product.name, lang)}</Link>
        </h3>
        <div className={styles.priceRow}>
          {product.oldPrice != null && (
            <span className={styles.oldPrice}>
              {currency}
              {product.oldPrice.toFixed(2)}
            </span>
          )}
          <span className={styles.price}>
            {currency}
            {/* Count-up when the card scrolls into view (repo's own StatCounter —
                react-countup is broken through Vite's CJS interop here). Plain
                text for reduced-motion users to keep the number exact. */}
            {reduceMotion ? (
              product.price.toFixed(2)
            ) : (
              <StatCounter end={product.price} decimals={2} duration={0.9} />
            )}
          </span>
          <span className={styles.unit}>· {shortUnit(product.unit)}</span>
        </div>
        {cartItem ? (
          <div className={styles.quantity}>
            <button type="button" onClick={handleDecrease} aria-label={t('product.decreaseQty')}>
              <IconMinus />
            </button>
            <output>
              {isWeightBased ? weight.toFixed(1) : cartItem.qty}
            </output>
            <button type="button" onClick={handleIncrease} aria-label={t('product.increaseQty')}>
              <IconPlus />
            </button>
          </div>
        ) : (
          <button type="button" className={styles.addBtn} onClick={handleAdd}>
            {t('shop.add')}
          </button>
        )}
      </div>
        {productInfoOpen && (
          <ProductInformationModal
            name={product.name}
            imageUrl={product.imageUrl}
            onClose={() => setProductInfoOpen(false)}
          />
        )}
    </div>
  );
});
