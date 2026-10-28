import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import 'swiper/css';
import { listProducts } from '../../api/productsApi';
import { useCountry } from '../../context/CountryContext';
import { useCart } from '../../context/CartContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { getProductName } from '../../i18n/productNames';
import { currencySymbol } from '../../utils/currency';
import { mediaUrl } from '../../utils/mediaUrl';
import { flagSrc } from '../../utils/flags';
import { HERO_SLIDES } from '../../components/common/heroSlides';
import type { Product, CountryCode } from '../../types';
import ProductCard from '../../components/common/ProductCard';
import FilterSheet from '../../components/common/FilterSheet';
import type { FilterSection } from '../../components/common/FilterSheet';
import { IconClose, IconSliders, IconSearch, IconCart, IconArrowRight } from '../../components/common/icons';

import styles from './css/BoxBuilder.module.css';

const COUNTRY_FLAG: Record<CountryCode, string> = { IN: 'in', SG: 'sg', US: 'us', AE: 'ae' };
const COUNTRIES: CountryCode[] = ['IN', 'SG', 'US', 'AE'];

const CATEGORIES: { key: string; value: string; icon: string; iconCls: string }[] = [
  { key: 'shop.all', value: '', icon: '🛒', iconCls: 'fa-seedling' },
  { key: 'shop.vegetables', value: 'Vegetables', icon: '🥦', iconCls: 'fa-leaf' },
  { key: 'shop.fruits', value: 'Fruits', icon: '🍎', iconCls: 'fa-apple-whole' },
  /* TEMP (07-Oct-2026): Beverages pill hidden per head — restore to re-enable */
  { key: 'shop.groceries', value: 'Groceries', icon: '🛒', iconCls: 'fa-basket-shopping' },
];
const PAGE_SIZE = 24;
const SEARCH_DEBOUNCE_MS = 300;
const MINIMUM_KG = 10;

export default function BigBox() {
  const { country, setCountry } = useCountry();
  const { cart, loading: cartLoading, refresh, removeItem } = useCart();
  const { t, lang } = useLanguage();
  const navigate = useNavigate();

  const [category, setCategory] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [desktopSearchOpen, setDesktopSearchOpen] = useState(false);
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [priceRanges, setPriceRanges] = useState<string[]>([]);
  const [preferences, setPreferences] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'recommended' | 'price-asc' | 'price-desc' | 'name-asc'>('recommended');
  const [page, setPage] = useState(0);
  const [products, setProducts] = useState<Product[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const kgStripRef = useRef<HTMLDivElement>(null);
  const [showSticky, setShowSticky] = useState(false);
  const filterBtnRef = useRef<HTMLButtonElement>(null);
  /* Same stale-response guard as Shop: a superseded/aborted fetch must not overwrite the newest list. */
  const productsReqId = useRef(0);
  const ordSumRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(0);
      setSearch(searchInput);
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    const reqId = ++productsReqId.current;
    setLoading(true);
    listProducts({ country, category: category || undefined, search: search || undefined, page, size: PAGE_SIZE })
      .then((res) => {
        if (reqId !== productsReqId.current) return;
        setProducts((prev) => (page === 0 ? res.content : [...prev, ...res.content]));
        setTotalPages(res.totalPages);
        setTotalElements(res.totalElements);
      })
      .finally(() => { if (reqId === productsReqId.current) setLoading(false); });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [country, category, search, page]);

  useEffect(() => {
    const onScroll = () => {
      if (kgStripRef.current) {
        const rect = kgStripRef.current.getBoundingClientRect();
        setShowSticky(rect.bottom < 0);
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* Hide desktop global header on scroll down, keep pills toolbar sticky */
  useEffect(() => {
    const handler = () => {
      const desktop = window.matchMedia('(min-width: 992px)').matches;
      document.body.classList.toggle('shop-header-hidden', desktop && window.scrollY > 150);
    };
    window.addEventListener('scroll', handler, { passive: true });
    window.addEventListener('resize', handler);
    handler();
    return () => {
      window.removeEventListener('scroll', handler);
      window.removeEventListener('resize', handler);
      document.body.classList.remove('shop-header-hidden');
    };
  }, []);

  const selectCategory = useCallback((next: string) => {
    setPage(0);
    setProducts([]);
    setCategory(next);
  }, []);

  const currency = currencySymbol(country);
  const bigBoxItems = cart?.items.filter((i) => i.boxType === 'BIG_BOX') ?? [];
  const summary = cart?.boxSummaries?.find((s) => s.boxType === 'BIG_BOX') ?? null;
  const totalKg = bigBoxItems.reduce((sum, i) => sum + (i.weightKg ?? 0), 0);
  const minimumMet = summary?.minimumMet ?? totalKg >= MINIMUM_KG;
  const kgToUnlock = Math.max(0, MINIMUM_KG - totalKg);
  const progress = Math.min(100, (totalKg / MINIMUM_KG) * 100);
  const subtotal = summary?.subtotal ?? 0;
  const discount = summary?.premiumOrDiscount ?? 0;
  const total = summary?.total ?? 0;
  const hasMore = page < totalPages - 1;

  const filteredProducts = useMemo(() => {
    let items = products;
    if (priceRanges.length > 0) {
      items = items.filter((p) => {
        return priceRanges.some((range) => {
          if (range === 'under-500') return p.price < 500;
          if (range === '500-1000') return p.price >= 500 && p.price <= 1000;
          if (range === '1000-2000') return p.price > 1000 && p.price <= 2000;
          return true;
        });
      });
    }
    if (preferences.length > 0) {
      items = items.filter((p) => {
        return preferences.some((pref) => {
          if (pref === 'Sale') return p.discountPct != null && p.discountPct > 0;
          if (pref === 'TopDeals') return p.discountPct != null && p.discountPct >= 15;
          if (pref === 'Budget') return p.price < 50;
          if (pref === 'Premium') return p.price >= 150;
          return true;
        });
      });
    }
    return items;
  }, [products, priceRanges, preferences]);

  const sortedProducts = useMemo(() => {
    const arr = [...filteredProducts];
    if (sortBy === 'price-asc') arr.sort((a, b) => a.price - b.price);
    else if (sortBy === 'price-desc') arr.sort((a, b) => b.price - a.price);
    else if (sortBy === 'name-asc') arr.sort((a, b) => a.name.localeCompare(b.name));
    return arr;
  }, [filteredProducts, sortBy]);

  const filterSections: FilterSection[] = useMemo(() => [
    {
      id: 'category',
      label: t('shop.category'),
      items: CATEGORIES.map((c) => ({ value: c.value, label: t(c.key), icon: c.icon })),
      activeValues: category ? [category] : [],
      onToggle: (v) => selectCategory(v),
    },
    {
      id: 'price',
      label: t('shop.priceRange'),
      items: [
        { value: 'under-500', label: `${t('shop.under')} ${currency}500` },
        { value: '500-1000', label: `${currency}500 - ${currency}1,000` },
        { value: '1000-2000', label: `${currency}1,000 - ${currency}2,000` },
      ],
      activeValues: priceRanges,
      onToggle: (v) => setPriceRanges((prev) => prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]),
    },
    {
      id: 'preference',
      label: t('shop.preference'),
      items: [
        { value: 'Sale', label: `🏷️ ${t('shop.sale')}` },
        { value: 'TopDeals', label: `🔥 ${t('shop.topDeals')}` },
        { value: 'Budget', label: `💰 ${t('shop.budget')}` },
        { value: 'Premium', label: `✨ ${t('shop.premium')}` },
      ],
      activeValues: preferences,
      onToggle: (v) => setPreferences((prev) => prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]),
    },
  ], [category, priceRanges, preferences, currency, selectCategory, t]);

  const quickLinks = [
    { value: 'shop', label: t('shop.title'), icon: '🛒', onClick: () => navigate('/shop') },
    { value: 'small-box', label: t('shop.smallBox'), icon: '📦', onClick: () => navigate('/pricing/small-box') },
    { value: 'b2b', label: t('shop.b2b'), icon: '🤝', onClick: () => navigate('/pricing/b2b') },
  ];

  async function handleGoToCart() {
    setAdding(true);
    try {
      await refresh();
      navigate('/cart');
    } finally {
      setAdding(false);
    }
  }

  return (
    <div className={styles.pageWrapper} data-page="big-box">
      {/* ===== Mobile Header ===== */}
      <header className={styles.mobileHeader}>
        <button type="button" className={styles.backBtn} onClick={() => navigate(-1)} aria-label={t('shop.goBack')}>
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
            aria-label={t('shop.selectMarket')}
          >
            {COUNTRIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="m6 9 6 6 6-6" />
          </svg>
        </div>
      </header>

      {/* ===== Mobile Hero Banner ===== */}
      <section className={styles.heroSliderSection}>
        <Swiper
          modules={[Autoplay]}
          loop
          autoplay={{ delay: 3000, disableOnInteraction: false }}
          speed={500}
          className={styles.heroSlider}
        >
          {HERO_SLIDES.map((src) => (
            <SwiperSlide key={src}>
              <img src={src} alt={t('shop.heroAlt')} className={styles.heroSlide} loading="lazy" />
            </SwiperSlide>
          ))}
        </Swiper>
      </section>

      {/* ===== Desktop pg-banner ===== */}
      <section className={`${styles.desktopBanner} ${styles.desktopBannerBigBox}`}>
        <div className={styles.desktopBannerInner}>
          <nav className={styles.breadcrumb}>
            <Link to="/">{t('shop.home')}</Link> <span>/</span> <span>{t('shop.bigBox')}</span>
          </nav>
          <h1>📦 {t('shop.bigBoxTitle')}</h1>
          <p>{t('shop.bigBoxHeroDesc')}</p>
        </div>
      </section>

      {/* ===== Builder Section ===== */}
      <section className={styles.builderSection}>
        <div className={styles.builderContainer}>

          {/* Desktop Kg Strip */}
          <div className={styles.kgStrip} ref={kgStripRef}>
            <div className={styles.kgNum}>
              {cartLoading ? '—' : totalKg.toFixed(1)}<small> kg</small>
            </div>
            <div className={styles.kgProgress}>
              <div className={styles.kgLbl}>
                {minimumMet
                  ? `${totalKg.toFixed(1)} ${t('shop.kgDiscountActive')}`
                  : t('shop.kgAddMore').replace('{kg}', kgToUnlock.toFixed(1))}
              </div>
              <div className={styles.progBarWrap}>
                <div className={styles.progBar} style={{ width: `${progress}%` }} />
              </div>
              <div className={styles.kgScale}>
                <span>0 kg</span>
                <span>{t('shop.kgScaleMin')}</span>
              </div>
            </div>
            <div className={`${styles.kgStatus} ${minimumMet ? styles.kgStatusReady : ''}`}>
              {minimumMet ? t('shop.discountActive') : t('shop.belowMinimum')}
            </div>
          </div>

          {/* Sticky floating counter */}
          <AnimatePresence>
            {showSticky && (
              <motion.div
                className={styles.stickyCounter}
                initial={{ y: -60, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -60, opacity: 0 }}
                transition={{ duration: 0.25 }}
              >
                <div className={styles.stickyLbl}>{t('shop.weight')}</div>
                <div className={styles.stickyCnt}>
                  {totalKg.toFixed(1)} <span>kg</span>
                </div>
                <div className={styles.stickyBarWrap}>
                  <div className={styles.stickyBar} style={{ width: `${progress}%` }} />
                </div>
                <div className={styles.stickyNote}>
                  {minimumMet ? t('shop.discount12Off') : t('shop.kgToGo').replace('{kg}', kgToUnlock.toFixed(1))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 2-column layout */}
          <div className={styles.builderLayout}>
            {/* Left column */}
            <div className={styles.builderMain}>
              {/* Desktop segmented toolbar — same as Shop */}
              <div className={styles.segWrap}>
                <nav className={styles.segContainer}>
                  {CATEGORIES.map((c) => (
<button
                    key={c.value}
                    type="button"
                    className={`${styles.segPill} ${category === c.value ? styles.segPillActive : ''}`}
                    onClick={() => selectCategory(c.value)}
                  >
                    <span className={styles.segPillIcon}><i className={`fa-solid ${c.iconCls}`} /></span>
                    {t(c.key)}
                  </button>
                ))}
              </nav>
              <div className={styles.segActions}>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                  className={styles.segSortSelect}
                  aria-label={t('shop.sortProducts')}
                >
                  <option value="recommended">{t('shop.recommended')}</option>
                  <option value="price-asc">{t('shop.priceLowHigh')}</option>
                  <option value="price-desc">{t('shop.priceHighLow')}</option>
                  <option value="name-asc">{t('shop.nameAToZ')}</option>
                </select>
                <button
                  type="button"
                  className={styles.segSearchBtn}
                  onClick={() => setDesktopSearchOpen((v) => !v)}
                  aria-label={desktopSearchOpen ? t('shop.closeSearchAria') : t('shop.searchAria')}
                >
                  {desktopSearchOpen ? <IconClose /> : <IconSearch />}
                </button>
                <button
                  ref={filterBtnRef}
                  type="button"
                  className={styles.segFilterBtn}
                  onClick={() => setFilterSheetOpen(true)}
                >
                  <IconSliders /> {t('shop.filterOptions')}
                </button>
                </div>
              </div>

              {/* Desktop "Choose Your Products" header — compact */}
              <div className={styles.bbProductsHeaderCompact}>
                <div>
                  <h3 className={styles.bbProductsTitle}>{t('shop.chooseYourProducts')}</h3>
                  <p className={styles.bbProductsSubtitle}>{t('shop.setQuantityInKg')}</p>
                </div>
                <div className={styles.bbProductsCount}>
                  {t('shop.selected')}: <strong>{bigBoxItems.length}</strong>
                </div>
              </div>

              {/* Mobile sticky catalog heading + category rail */}
              <div className={styles.mobileStickyHead}>

              {/* Mobile sticky catalog heading */}
              <div className={styles.mobileCatalogBar}>
                <div className={styles.mobileCatalogInner}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                    <h2 className={styles.mobileCatalogTitle}>{t('shop.bigBox')}</h2>
                    <span className={styles.mobileCatalogCount}>{totalElements} {t('shop.productsWord')}</span>
                  </div>
                  <div className={styles.mobileCatalogActions}>
                    <button
                      type="button"
                      className={styles.mobileIconBtn}
                      aria-label={searchOpen ? t('shop.closeSearchAria') : t('shop.searchBtn')}
                      onClick={() => {
                        setSearchOpen((v) => !v);
                        if (searchOpen) setSearchInput('');
                      }}
                    >
                      {searchOpen ? <IconClose /> : <IconSearch />}
                    </button>
                    <button type="button" className={styles.mobileFilterBtn} onClick={() => setFilterSheetOpen(true)}>
                      <IconSliders /> {t('shop.filter')}
                    </button>
                  </div>
                </div>
              </div>

              {/* Mobile search */}
              <AnimatePresence initial={false}>
                {searchOpen && (
                  <motion.div
                    className={styles.searchBoxWrap}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.22 }}
                  >
                    <div className={styles.searchBox}>
                      <IconSearch className={styles.searchBoxIcon} />
                      <input
                        autoFocus
                        type="text"
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        placeholder={t('shop.searchPlaceholder')}
                        aria-label={t('shop.searchAria')}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Mobile category scroll */}
              <nav className={styles.catRail} aria-label={t('shop.category')}>
                {CATEGORIES.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    className={`${styles.railPill} ${category === c.value ? styles.railPillActive : ''}`}
                    onClick={() => selectCategory(c.value)}
                  >
                    <span className={styles.railPillIcon}>{c.icon}</span>
                    {t(c.key)}
                  </button>
                ))}
              </nav>

              </div>{/* end mobileStickyHead */}

              {/* Product grid */}
              {loading && products.length === 0 ? (
                <div className={styles.productGrid}>
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className={styles.skeletonCard} />
                  ))}
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className={styles.emptyState}>
                  <IconSearch className={styles.emptyIcon} />
                  <p>{t('shop.noMatchFilters')}</p>
                </div>
              ) : (
                <div className={styles.productGrid}>
                  {sortedProducts.map((p, i) => (
                    <ProductCard key={p.id} product={p} boxType="BIG_BOX" compact flyTargetEl={i < 4 ? ordSumRef : undefined} />
                  ))}
                </div>
              )}

              {/* Load more */}
              {hasMore && (
                <div className={styles.loadMoreWrap}>
                  <p className={styles.loadMoreStatus}>
                    {t('shop.loadMoreShowing').replace('{shown}', String(filteredProducts.length)).replace('{total}', String(totalElements))}
                  </p>
                  <button
                    type="button"
                    className={styles.loadMoreBtn}
                    disabled={loading}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    {loading ? t('shop.loading') : t('shop.loadMoreProducts')}
                  </button>
                </div>
              )}
            </div>

            {/* Right panel: Order Summary */}
            <aside className={styles.ordSum} ref={ordSumRef}>
              <h4>🛒 {t('shop.orderSummary')}</h4>
              <div className={styles.ordKgBox}>
                <div className={styles.ordLabel}>{t('shop.totalWeight')}</div>
                <div className={styles.ordSquareProgress}>
                  <div className={styles.ordSquareTrack}>
                    <div
                      className={styles.ordSquareFill}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className={styles.ordSquareCount}>
                    <span className={styles.ordSquareNum}>{cartLoading ? '—' : totalKg.toFixed(1)}</span>
                    <span className={styles.ordSquareTotal}>{t('shop.kgMin')}</span>
                  </div>
                </div>
                <div className={`${styles.ordMsg} ${minimumMet ? styles.ordMsgReady : ''}`}>
                  {minimumMet
                    ? t('shop.bulkDiscountApplied')
                    : t('shop.needKgMore').replace('{kg}', kgToUnlock.toFixed(1))}
                </div>
              </div>
              <div className={styles.productsRow}>
                {t('shop.products')} <span className={styles.productsCount}>{bigBoxItems.length}</span>
              </div>

              {bigBoxItems.length > 0 ? (
                <div className={styles.ordProducts}>
                  {bigBoxItems.map((item) => (
                    <div key={item.id} className={styles.ordItem}>
                      <span className={styles.ordItemThumb}>
                        {item.imageUrl ? <img src={mediaUrl(item.imageUrl)} alt="" onError={(e) => { (e.target as HTMLImageElement).src = `https://placehold.co/200x200/f4f9f0/4a7c3f?text=${encodeURIComponent(item.name.split(' ')[0])}&font=roboto`; }} /> : '🥬'}
                      </span>
                      <span className={styles.ordItemName}>{getProductName(item.name, lang)}</span>
                      <span className={styles.ordItemQty}>{(item.weightKg ?? 0).toFixed(1)} kg</span>
                      <span className={styles.ordItemPrice}>
                        {currency}{item.lineTotal.toFixed(2)}
                      </span>
                      <button
                        type="button"
                        className={styles.ordItemRemove}
                        onClick={() => void removeItem(item.id)}
                        aria-label={t('cart.remove')}
                        title={t('cart.remove')}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className={styles.ordEmptyList}>{t('shop.noProductsAdded')}</p>
              )}

              <div className={styles.ordBottom}>
                <div className={styles.sumRow}>
                  <span>{t('shop.subtotal')}</span>
                  <span>{currency}{subtotal.toFixed(2)}</span>
                </div>
                <div className={styles.sumRow}>
                  <span>{t('shop.bulkDiscount12')}</span>
                  <span className={minimumMet ? styles.ordSavingsActive : styles.ordSavingsMuted}>
                    {minimumMet ? `-${currency}${discount.toFixed(2)}` : t('shop.unlocksAt10Kg')}
                  </span>
                </div>
                <div className={`${styles.sumRow} ${styles.tot}`}>
                  <span>{t('shop.total')}</span>
                  <span>{currency}{total.toFixed(2)}</span>
                </div>

                <div className={styles.ordFooter}>
                  <button
                    type="button"
                    className={`${styles.ordBtn} ${minimumMet ? styles.ordBtnActive : ''}`}
                    disabled={!minimumMet || adding}
                    onClick={handleGoToCart}
                  >
                    🛒 {minimumMet ? t('shop.goToCart') : t('shop.addToBigBoxCart')}
                  </button>
                  <p className={styles.ordHint}>
                    {minimumMet ? t('shop.readyToCheckout') : t('shop.addKgMoreUnlock').replace('{kg}', kgToUnlock.toFixed(1))}
                  </p>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* ===== Mobile Selection Bar (gradient green) ===== */}
      {totalKg > 0 && (
        <div className={styles.selectionBar} data-fly-target>
          <div className={styles.selectionBarProg}>
            <div className={styles.selectionBarProgFill} style={{ width: `${Math.min((totalKg / MINIMUM_KG) * 100, 100)}%` }} />
          </div>
          <div className={styles.selectionBarRow}>
            <span className={styles.selectionBarIcon}>
              <IconCart />
              <span className={styles.selectionBarCount}>{bigBoxItems.length}</span>
            </span>
            <span className={styles.selectionBarDetails}>
              <strong>{currency}{total.toFixed(2)}</strong>
              <span>{minimumMet ? t('shop.bulkUnlockedKg').replace('{kg}', totalKg.toFixed(1)) : t('shop.moreKgUnlockBulk').replace('{n}', (MINIMUM_KG - totalKg).toFixed(1))}</span>
            </span>
            <button
              type="button"
              className={`${styles.selectionBarBtn} ${minimumMet ? styles.selectionBarBtnActive : ''}`}
              disabled={!minimumMet || adding}
              onClick={handleGoToCart}
            >
              {minimumMet ? t('shop.goToCart') : t('shop.addToCart')} <IconArrowRight />
            </button>
          </div>
        </div>
      )}

      {/* ===== Filter Sheet — anchored */}
      <FilterSheet
        isOpen={filterSheetOpen}
        onClose={() => setFilterSheetOpen(false)}
        onClear={() => {
          selectCategory('');
          setPriceRanges([]);
          setPreferences([]);
        }}
        onApply={() => setFilterSheetOpen(false)}
        sections={filterSections}
        quickLinks={quickLinks}
        anchorRef={filterBtnRef}
      />


    </div>
  );
}
