import { useEffect, useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getProductBySlug, listProducts } from '../../api/productsApi';
import { useCountry } from '../../context/CountryContext';
import { useCart } from '../../context/CartContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { getProductName, getCategoryName } from '../../i18n/productNames';
import { formatPrice } from '../../utils/currency';
import { flagSrc } from '../../utils/flags';
import { freeDeliveryThresholdFor } from '../../utils/delivery';
import type { Product, CountryCode } from '../../types';
import Reveal from '../../components/common/Reveal';
import { IconMinus, IconPlus, IconArrowRight } from '../../components/common/icons';
import styles from './css/ShopDetails.module.css';

const COUNTRY_FLAG: Record<CountryCode, string> = { IN: 'in', SG: 'sg', US: 'us', AE: 'ae' };
const COUNTRIES: CountryCode[] = ['IN', 'SG', 'US', 'AE'];

type Tab = 'description' | 'benefits' | 'farm';

interface BenefitItem { icon: string; title: string; desc: string }
interface CategoryBenefits { items: BenefitItem[]; vitamins: { name: string; level: string }[] }
interface FarmStep { icon: string; title: string; desc: string }

export default function ShopDetails() {
  const { slug } = useParams<{ slug: string }>();
  const { country, setCountry } = useCountry();
  const { addItem } = useCart();
  const { t, tRaw, lang } = useLanguage();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('description');
  const [wishlisted, setWishlisted] = useState(false);
  const [shareMsg, setShareMsg] = useState('');

  async function handleShare() {
    const url = window.location.href;
    try {
      const nav = navigator as Navigator & { share?: (data: { title?: string; text?: string; url?: string }) => Promise<void> };
      if (nav.share) {
        await nav.share({ title: product?.name ?? 'VPNexues', text: product?.name ?? '', url });
        return;
      }
      throw new Error('no-share');
    } catch {
      try {
        await navigator.clipboard.writeText(url);
        setShareMsg(t('shop.linkCopied') === 'shop.linkCopied' ? 'Link copied' : t('shop.linkCopied'));
      } catch {
        setShareMsg(url);
      }
      window.setTimeout(() => setShareMsg(''), 2500);
    }
  }

  useEffect(() => {
    if (!slug) return;
    let cancelled = false; // stale-response guard: fast product→product navigation
    setLoading(true);
    setAdded(false);
    setQty(1);
    setWishlisted(false);
    setShareMsg('');
    getProductBySlug(slug, country)
      .then((p) => {
        if (cancelled) return null;
        setProduct(p);
        return listProducts({ country, category: p.category, size: 6 });
      })
      .then((page) => {
        if (cancelled || !page) return;
        setRelated(page.content.filter((p) => p.slug !== slug).slice(0, 4));
      })
      .catch(() => {
        // unknown slug / backend down — NOT a silent random mock product
        if (!cancelled) {
          setProduct(null);
          setRelated([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [slug, country]);

  const translatedName = product ? getProductName(product.name, lang) : '';

  const benefits = useMemo<CategoryBenefits>(() => {
    const all = tRaw('shopDetails.benefits');
    const map = (all && typeof all === 'object' && !Array.isArray(all)) ? all as Record<string, CategoryBenefits> : {};
    const key = product?.category ?? 'Vegetables';
    const chosen = map[key] ?? map.Vegetables ?? { items: [], vitamins: [] };
    return { items: chosen.items ?? [], vitamins: chosen.vitamins ?? [] };
  }, [product, tRaw]);

  const farmSteps = useMemo<FarmStep[]>(() => {
    const raw = tRaw('shopDetails.farmSteps');
    return Array.isArray(raw) ? raw as FarmStep[] : [];
  }, [tRaw]);

  async function handleAdd() {
    if (!product) return;
    await addItem(product.id, qty, {
      name: product.name,
      unitPrice: product.price,
      unit: product.unit,
      imageUrl: product.imageUrl,
      oldPrice: product.oldPrice,
    });
    setAdded(true);
  }

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.loadingSpinner} />
        <p>{t('shop.loading')}</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className={styles.notFound}>
        <span className={styles.notFoundIcon}>😕</span>
        <h2>{t('shop.noProducts')}</h2>
        <Link to="/shop" className={styles.backLink}>{t('shop.viewDetails')}</Link>
      </div>
    );
  }

  const freeDeliveryThreshold = freeDeliveryThresholdFor(country);

  return (
    <div className={styles.page}>
      <div className={styles.mobileHeader}>
        <button type="button" className={styles.backBtn} onClick={() => navigate(-1)} aria-label="Go back">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>
        <Link to="/" className={styles.brand}>
          <img src="https://res.cloudinary.com/eqjshlur/image/upload/v1790001831/vpnexues/old/site-assets/logo/vp-logo.svg" alt="" className={styles.brandLogo} />
          <span className={styles.brandText}>
            <strong>VPNexues</strong>
            <small>விவசாயம் காப்போம்</small>
          </span>
        </Link>
        <div className={styles.countryPill}>
          <img
            src={flagSrc(COUNTRY_FLAG[country])}
            alt=""
            width={20}
            height={14}
          />
          <select
            value={country}
            onChange={(e) => setCountry(e.target.value as CountryCode)}
            aria-label="Select market"
          >
            {COUNTRIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="m6 9 6 6 6-6" />
          </svg>
        </div>
      </div>

      <section className={styles.desktopBanner}>
        <div className={styles.desktopBannerInner}>
          <nav className={styles.breadcrumb}>
            <Link to="/">{t('nav.home')}</Link>
            <span className={styles.breadSep}>&rsaquo;</span>
            <Link to="/shop">{t('nav.shop')}</Link>
            <span className={styles.breadSep}>&rsaquo;</span>
            <Link to={`/shop?category=${product.category}`}>{getCategoryName(product.category, lang)}</Link>
          </nav>
          <h1>{translatedName}</h1>
        </div>
      </section>

      <Reveal className={styles.container}>
        <button
          type="button"
          className={styles.backRow}
          onClick={() => navigate('/shop')}
          aria-label={t('shop.goBack')}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="m15 18-6-6 6-6" />
          </svg>
          <span>{t('shop.goBack')}</span>
        </button>
        <div className={styles.productGrid}>
          <div className={styles.imageSection}>
            <div className={styles.imageWrap}>
              {product.discountPct != null && (
                <span className={styles.discountBadge}>{product.discountPct}% OFF</span>
              )}
              {product.imageUrl ? (
                <img className={styles.image} src={product.imageUrl} alt={translatedName} onError={(e) => { (e.target as HTMLImageElement).src = `https://placehold.co/400x400/f4f9f0/4a7c3f?text=${encodeURIComponent(translatedName.split(' ')[0])}&font=roboto`; }} />
              ) : (
                <span className={styles.fallback}>🥬</span>
              )}
            </div>
          </div>

          <div className={styles.infoSection}>
            <span className={styles.category}>{getCategoryName(product.category, lang)}</span>
            <h1 className={styles.name}>{translatedName}</h1>

            <div className={styles.rating}>
              {[1, 2, 3, 4, 5].map((s) => (
                <span key={s} className={`${styles.star} ${s <= 4 ? styles.starFilled : ''}`}>★</span>
              ))}
            </div>

            <div className={styles.priceRow}>
              <span className={styles.price}>{formatPrice(product.price, country)}</span>
              {product.oldPrice != null && (
                <span className={styles.oldPrice}>{formatPrice(product.oldPrice, country)}</span>
              )}
              <span className={styles.unit}>/ {product.unit}</span>
            </div>

            {product.description && (
              <p className={styles.shortDesc}>{product.description}</p>
            )}

            <div className={styles.cartRow}>
              <div className={styles.qtyControl}>
                <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Decrease quantity">
                  <IconMinus />
                </button>
                <span className={styles.qtyValue}>{qty}</span>
                <button type="button" onClick={() => setQty((q) => q + 1)} aria-label="Increase quantity">
                  <IconPlus />
                </button>
              </div>
              <button type="button" className={styles.addBtn} onClick={handleAdd}>
                🧺 {t('shop.addToCart')}
              </button>
            </div>

            {added && (
              <div className={styles.addedBadge}>
                ✓ {t('shop.addToCart')} — <Link to="/cart">{t('shop.viewCart')}</Link>
              </div>
            )}

            <div className={styles.actions}>
              <button
                type="button"
                className={styles.actionBtn}
                aria-label="Add to wishlist"
                aria-pressed={wishlisted}
                onClick={() => setWishlisted((v) => !v)}
              >
                {wishlisted ? '♥' : '♡'} <span>{wishlisted ? t('shop.wishlisted') === 'shop.wishlisted' ? 'Wishlisted' : t('shop.wishlisted') : t('product.addToWishlist')}</span>
              </button>
              <button type="button" className={styles.actionBtn} aria-label="Share product" onClick={handleShare}>
                ↗ <span>{t('shop.share')}</span>
              </button>
            </div>
            {shareMsg && (
              <div className={styles.addedBadge} role="status">
                ✓ {shareMsg}
              </div>
            )}

            <div className={styles.meta}>
              <div className={styles.metaRow}>
                <span className={styles.metaLabel}>{t('product.sku')}:</span>
                <span className={styles.metaValue}>{product.sku}</span>
              </div>
              <div className={styles.metaRow}>
                <span className={styles.metaLabel}>{t('shop.category')}:</span>
                <Link to={`/shop?category=${product.category}`} className={styles.metaLink}>{getCategoryName(product.category, lang)}</Link>
              </div>
              <div className={styles.metaRow}>
                <span className={styles.metaLabel}>{t('cart.deliveryAddress')}:</span>
                <span className={styles.metaValue}>{t('shop.freeDeliveryAbove')} {formatPrice(freeDeliveryThreshold, country)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.tabsSection}>
          <div className={styles.tabBar}>
            <button
              type="button"
              className={`${styles.tabBtn} ${activeTab === 'description' ? styles.tabActive : ''}`}
              onClick={() => setActiveTab('description')}
            >
              {t('shop.description')}
            </button>
            <button
              type="button"
              className={`${styles.tabBtn} ${activeTab === 'benefits' ? styles.tabActive : ''}`}
              onClick={() => setActiveTab('benefits')}
            >
              {t('shop.benefitsNutrition')}
            </button>
            <button
              type="button"
              className={`${styles.tabBtn} ${activeTab === 'farm' ? styles.tabActive : ''}`}
              onClick={() => setActiveTab('farm')}
            >
              {t('shop.farmToTable')}
            </button>
          </div>

          <div className={styles.tabContent}>
            {activeTab === 'description' && (
              <div className={styles.tabPane}>
                <h3 className={styles.tabHeading}>{t('shop.productDescription')}</h3>
                <p className={styles.tabText}>
                  {product.description || `${t('shop.freshQuality')} ${translatedName}`}
                </p>
                <div className={styles.featureGrid}>
                  <div className={styles.featureItem}>
                    <span className={styles.featureIcon}>🌿</span>
                    <div>
                      <strong>{t('shop.natural100')}</strong>
                      <p>{t('shop.natural100Desc')}</p>
                    </div>
                  </div>
                  <div className={styles.featureItem}>
                    <span className={styles.featureIcon}>🔬</span>
                    <div>
                      <strong>{t('shop.labTested')}</strong>
                      <p>{t('shop.labTestedDesc')}</p>
                    </div>
                  </div>
                  <div className={styles.featureItem}>
                    <span className={styles.featureIcon}>❄️</span>
                    <div>
                      <strong>{t('shop.coldChain')}</strong>
                      <p>{t('shop.coldChainDesc')}</p>
                    </div>
                  </div>
                  <div className={styles.featureItem}>
                    <span className={styles.featureIcon}>♻️</span>
                    <div>
                      <strong>{t('shop.ecoPackaging')}</strong>
                      <p>{t('shop.ecoPackagingDesc')}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'benefits' && (
              <div className={styles.tabPane}>
                <h3 className={styles.tabHeading}>{t('shopDetails.benefitsHeading')}</h3>
                <div className={styles.benefitsGrid}>
                  {benefits.items.map((b) => (
                    <div key={b.title} className={styles.benefitCard}>
                      <span className={styles.benefitIcon}>{b.icon}</span>
                      <div>
                        <strong>{b.title}</strong>
                        <p>{b.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <h4 className={styles.subHeading}>{t('shop.keyVitamins')}</h4>
                <div className={styles.vitaminsGrid}>
                  {benefits.vitamins.map((v) => (
                    <div key={v.name} className={styles.vitaminItem}>
                      <span className={styles.vitaminName}>{v.name}</span>
                      <span className={`${styles.vitaminAmount} ${v.level === 'veryHigh' ? styles.veryHigh : v.level === 'high' ? styles.high : v.level === 'medium' ? styles.medium : styles.low}`}>
                        {t(`shopDetails.amount.${v.level}`)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'farm' && (
              <div className={styles.tabPane}>
                <h3 className={styles.tabHeading}>{t('shop.fromFarmsToTable')}</h3>
                <p className={styles.tabText}>
                  {t('shop.farmToTableDesc')}
                </p>
                <div className={styles.farmSteps}>
                  {farmSteps.map((step, i) => (
                    <div key={step.title} className={styles.farmStep}>
                      <div className={styles.farmStepNum}>{i + 1}</div>
                      <div className={styles.farmStepIcon}>{step.icon}</div>
                      <div className={styles.farmStepContent}>
                        <h4>{step.title}</h4>
                        <p>{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className={styles.qualityBanner}>
                  <span className={styles.qualityIcon}>🛡️</span>
                  <div>
                    <strong>{t('shop.qualityPromise')}</strong>
                    <p>{t('shop.qualityPromiseDesc')}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {related.length > 0 && (
          <div className={styles.relatedSection}>
            <div className={styles.relatedHeader}>
              <h2>{t('shop.youMayAlsoLike')}</h2>
              <Link to={`/shop?category=${product.category}`} className={styles.viewAll}>
                {t('shop.viewAll')} <IconArrowRight />
              </Link>
            </div>
            <div className={styles.relatedGrid}>
              {related.map((p) => (
                <Link key={p.id} to={`/shop/${p.slug}`} className={styles.relatedCard}>
                  <div className={styles.relatedImageWrap}>
                    {p.imageUrl ? (
                      <img className={styles.relatedImage} src={p.imageUrl} alt={p.name} onError={(e) => { (e.target as HTMLImageElement).src = `https://placehold.co/400x400/f4f9f0/4a7c3f?text=${encodeURIComponent(p.name.split(' ')[0])}&font=roboto`; }} />
                    ) : (
                      <span className={styles.relatedFallback}>🥬</span>
                    )}
                  </div>
                  <div className={styles.relatedBody}>
                    <span className={styles.relatedCategory}>{getCategoryName(p.category, lang)}</span>
                    <h4 className={styles.relatedName}>{getProductName(p.name, lang)}</h4>
                    <div className={styles.relatedPrice}>
                      <span className={styles.relatedPriceValue}>{formatPrice(p.price, country)}</span>
                      <span className={styles.relatedUnit}>/ {p.unit}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </Reveal>
    </div>
  );
}
