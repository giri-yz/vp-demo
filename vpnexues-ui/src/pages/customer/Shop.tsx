import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import 'swiper/css';
import { listProducts } from '../../api/productsApi';
import { useCountry } from '../../context/CountryContext';
import { useCart } from '../../context/CartContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { getProductName } from '../../i18n/productNames';
import { currencySymbol, formatPrice } from '../../utils/currency';
import { cloudinaryImg } from '../../utils/imageUrls';
import { mediaUrl } from '../../utils/mediaUrl';
import { flagSrc } from '../../utils/flags';
import { freeDeliveryThresholdFor } from '../../utils/delivery';
import type { Product, CountryCode } from '../../types';
import { searchRecipesAndCuisines, matchesRecipeCatalog } from '../../utils/recipeSearch';
import { REGIONAL_RECIPES, type Recipe } from '../../data/recipes';
import { getCatalogProductsByNames } from '../../api/mockProducts';
import ProductCard from '../../components/common/ProductCard';
import FilterSheet from '../../components/common/FilterSheet';
import type { FilterSection } from '../../components/common/FilterSheet';
import { HERO_SLIDES } from '../../components/common/heroSlides';
import CtaDiscountBanner from '../../components/common/CtaDiscountBanner';
import Seo from '../../components/common/Seo';
import { SEO } from '../../config/seoMeta';
import type { SeoMeta } from '../../config/seoMeta';

import {
  IconArrowRight,
  IconCart,
  IconClose,
  IconSliders,
  IconSearch,
} from '../../components/common/icons';
import styles from './css/Shop.module.css';

const CATEGORY_KEYS: { key: string; value: string; icon: string; iconCls: string }[] = [
  { key: 'shop.all', value: '', icon: '🛒', iconCls: 'fa-seedling' },
  { key: 'shop.vegetables', value: 'Vegetables', icon: '🥦', iconCls: 'fa-leaf' },
  { key: 'shop.fruits', value: 'Fruits', icon: '🍎', iconCls: 'fa-apple-whole' },
  /* TEMP (07-Oct-2026): Beverages pill hidden per head — restore to re-enable */
  { key: 'shop.groceries', value: 'Groceries', icon: '🛒', iconCls: 'fa-basket-shopping' },
];

/* SEO metadata per shop category. Unfiltered /shop intentionally keeps the
 * shell metadata — marketing approved category-only coverage. */
const CATEGORY_SEO: Record<string, SeoMeta> = {
  Vegetables: SEO.shopVegetables,
  Fruits: SEO.shopFruits,
  Groceries: SEO.shopGroceries,
};

const PAGE_SIZE = 24;
const SEARCH_DEBOUNCE_MS = 300;

const COUNTRY_FLAG: Record<CountryCode, string> = { IN: 'in', SG: 'sg', US: 'us', AE: 'ae' };
const COUNTRIES: CountryCode[] = ['IN', 'SG', 'US', 'AE'];

export default function Shop() {
  const { country, setCountry } = useCountry();
  const { cart, loading: cartLoading, removeItem, addItem } = useCart();
  const { t, lang } = useLanguage();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const category = searchParams.get('category') ?? '';
  const seoMeta = CATEGORY_SEO[category];
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [activeRecipeFilter, setActiveRecipeFilter] = useState<{
    type: 'recipe' | 'cuisine';
    title: string;
    cuisine?: string;
    mealType?: string;
    prepTime?: string;
    instructions?: string;
    recipes: Recipe[];
    catalogProducts: string[];
    selectedRecipe?: Recipe;
  } | null>(null);
  const [recipeSuggestionsOpen, setRecipeSuggestionsOpen] = useState(false);
  const searchBoxContainerRef = useRef<HTMLDivElement>(null);
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [priceRanges, setPriceRanges] = useState<string[]>([]);
  const [preferences, setPreferences] = useState<string[]>([]);
  const [page, setPage] = useState(0);
  const [products, setProducts] = useState<Product[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadTick, setReloadTick] = useState(0);
  const [sortBy, setSortBy] = useState<'recommended' | 'price-asc' | 'price-desc' | 'name-asc'>('recommended');
  const [showScrollTop, setShowScrollTop] = useState(false);
  const mainColRef = useRef<HTMLDivElement>(null);
  const filterBtnRef = useRef<HTMLButtonElement>(null);
  /* Monotonic id so a slow/aborted (stale) products response can never overwrite a newer one —
     e.g. an aborted SG fetch falling back to mock data must not clobber the fresh IN list
     (mock ids don't match backend cart productIds, which breaks the Add → stepper switch). */
  const productsReqId = useRef(0);
  const ordSumRef = useRef<HTMLElement>(null);

  // Live recipe and cuisine matches as user types
  const liveRecipeMatch = useMemo(() => {
    return searchRecipesAndCuisines(searchInput);
  }, [searchInput]);

  // Preview products in the live suggestions dropdown (under search input)
  const previewRecipeProducts = useMemo(() => {
    if (!liveRecipeMatch.isRecipeQuery || liveRecipeMatch.catalogProductNames.length === 0) return [];
    return getCatalogProductsByNames(liveRecipeMatch.catalogProductNames.slice(0, 8), country as CountryCode);
  }, [liveRecipeMatch, country]);

  // Open suggestions when typing 2+ characters and matches a recipe
  useEffect(() => {
    if (searchInput.trim().length >= 2 && liveRecipeMatch.isRecipeQuery) {
      setRecipeSuggestionsOpen(true);
    } else {
      setRecipeSuggestionsOpen(false);
    }
  }, [searchInput, liveRecipeMatch.isRecipeQuery]);

  // Click outside listener for suggestions dropdown
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (searchBoxContainerRef.current && !searchBoxContainerRef.current.contains(e.target as Node)) {
        setRecipeSuggestionsOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  const handleSelectRecipe = useCallback((recipe: Recipe) => {
    setActiveRecipeFilter({
      type: 'recipe',
      title: recipe.name,
      cuisine: recipe.cuisine,
      mealType: recipe.mealType,
      prepTime: recipe.prepTime,
      instructions: recipe.instructions,
      recipes: [recipe],
      catalogProducts: recipe.catalogProducts,
      selectedRecipe: recipe,
    });
    setRecipeSuggestionsOpen(false);
    setPage(0);
  }, []);

  const handleSelectCuisine = useCallback((cuisineName: string) => {
    const cuisineRecipes = REGIONAL_RECIPES.filter(
      (r) => r.cuisine.toLowerCase() === cuisineName.toLowerCase()
    );
    const prodSet = new Set<string>();
    cuisineRecipes.forEach((r) => r.catalogProducts.forEach((p) => prodSet.add(p)));
    setActiveRecipeFilter({
      type: 'cuisine',
      title: `${cuisineName} Cuisine`,
      cuisine: cuisineName,
      recipes: cuisineRecipes,
      catalogProducts: Array.from(prodSet),
    });
    setRecipeSuggestionsOpen(false);
    setPage(0);
  }, []);

  const handleClearRecipeFilter = useCallback(() => {
    setActiveRecipeFilter(null);
    setPage(0);
  }, []);

  /* The recipe banner only exists after the user explicitly picks a recipe/cuisine from the
   * suggestions; plain typing is always a product search. */
  const selectedRecipe = activeRecipeFilter?.selectedRecipe ?? null;
  const setSelectedRecipe = useCallback((recipe: Recipe | null) => {
    setActiveRecipeFilter((prev) => (prev ? { ...prev, selectedRecipe: recipe ?? undefined } : prev));
  }, []);

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
    setError(null);
    const recipeProds = activeRecipeFilter ? activeRecipeFilter.catalogProducts : undefined;
    listProducts({
      country,
      category: recipeProds ? undefined : (category || undefined),
      search: recipeProds ? undefined : (search || undefined),
      recipeProductNames: recipeProds,
      page,
      size: PAGE_SIZE,
    })
      .then((res) => {
        if (reqId !== productsReqId.current) return;
        setProducts((prev) => (page === 0 ? res.content : [...prev, ...res.content]));
        setTotalPages(res.totalPages);
        setTotalElements(res.totalElements);
      })
      .catch(() => { if (reqId === productsReqId.current) setError(t('shop.loadError')); })
      .finally(() => { if (reqId === productsReqId.current) setLoading(false); });
  }, [country, category, search, page, reloadTick, t, activeRecipeFilter]);

  useEffect(() => {
    const onScroll = () => {
      setShowScrollTop(window.scrollY > 400);
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
    if (next) {
      setSearchParams({ category: next });
    } else {
      setSearchParams({});
    }
  }, [setSearchParams]);

  const currency = currencySymbol(country);
  const cartCount = cart?.items?.reduce((sum, i) => sum + i.qty, 0) ?? 0;
  const itemTotal = cart?.itemTotal ?? 0;
  /* Summary rows: plain shop lines individually + one grouped row per box type.
   * Box lines can never match a Shop card (ProductCard only pairs `!i.boxType`),
   * so listing them raw made the summary show items the grid said weren't added. */
  const shopItems = cart?.items.filter((i) => !i.boxType) ?? [];
  const boxGroups = (['SMALL_BOX', 'BIG_BOX'] as const)
    .map((type) => ({ type, lines: (cart?.items ?? []).filter((i) => i.boxType === type) }))
    .filter((group) => group.lines.length > 0);
  const summaryRowCount = shopItems.length + boxGroups.length;
  const savings =
    cart?.items?.reduce((sum, i) => sum + Math.max(0, ((i.oldPrice ?? i.unitPrice) - i.unitPrice) * i.qty), 0) ?? 0;
  const viewCartEnabled = cartCount > 0;
  /* Free-delivery progress (same country thresholds as the Cart page) — replaces the old
     "n / 10" counter, which wrongly implied Shop has a 10-item box minimum. */
  const deliveryThreshold = freeDeliveryThresholdFor(country);
  const isFreeDelivery = itemTotal >= deliveryThreshold;
  const deliveryRemaining = Math.max(0, deliveryThreshold - itemTotal);
  const deliveryProgressPct = Math.min(Math.max((itemTotal / deliveryThreshold) * 100, 0), 100);
  const hasMore = page < totalPages - 1;
  const activeCategory = CATEGORY_KEYS.find((c) => c.value === category);
  const catalogTitle = useMemo(() => {
    if (activeRecipeFilter) return selectedRecipe?.name ?? activeRecipeFilter.title;
    return activeCategory && activeCategory.value ? t(activeCategory.key) : t('shop.allProducts');
  }, [activeRecipeFilter, selectedRecipe, activeCategory, t]);
  const sortedProducts = useMemo(() => {
    let arr = [...products];
    if (priceRanges.length > 0) {
      arr = arr.filter((p) => priceRanges.some((range) => {
        if (range === 'under-500') return p.price < 500;
        if (range === '500-1000') return p.price >= 500 && p.price <= 1000;
        if (range === '1000-2000') return p.price > 1000 && p.price <= 2000;
        return true;
      }));
    }
    if (preferences.length > 0) {
      arr = arr.filter((p) => preferences.some((pref) => {
        if (pref === 'Sale') return p.discountPct != null && p.discountPct > 0;
        if (pref === 'TopDeals') return p.discountPct != null && p.discountPct >= 15;
        if (pref === 'Budget') return p.price < 50;
        if (pref === 'Premium') return p.price >= 150;
        return true;
      }));
    }
    if (sortBy === 'price-asc') arr.sort((a, b) => a.price - b.price);
    else if (sortBy === 'price-desc') arr.sort((a, b) => b.price - a.price);
    else if (sortBy === 'name-asc') arr.sort((a, b) => a.name.localeCompare(b.name));
    return arr;
  }, [products, sortBy, priceRanges, preferences]);

  const displayedProducts = useMemo(() => {
    if (selectedRecipe) {
      return sortedProducts.filter((p) =>
        matchesRecipeCatalog(p.name, selectedRecipe.catalogProducts)
      );
    }
    return sortedProducts;
  }, [sortedProducts, selectedRecipe]);


  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const filterSections: FilterSection[] = useMemo(() => [
    {
      id: 'category',
      label: t('shop.category'),
      items: CATEGORY_KEYS.map((c) => ({ value: c.value, label: t(c.key), icon: c.icon })),
      activeValues: category ? [category] : [],
      onToggle: (v) => {
        setPage(0);
        setProducts([]);
        if (v) setSearchParams({ category: v }); else setSearchParams({});
      },
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
  ], [category, priceRanges, preferences, currency, setSearchParams, t]);

  const quickLinks = [
    { value: 'small-box', label: t('shop.smallBox'), icon: '📦', onClick: () => navigate('/pricing/small-box') },
    { value: 'big-box', label: t('shop.bigBox'), icon: '📦', onClick: () => navigate('/pricing/big-box') },
    { value: 'b2b', label: t('shop.b2b'), icon: '🤝', onClick: () => navigate('/pricing/b2b') },
  ];

  return (
    <div className={styles.shopPage}>
      {seoMeta && <Seo {...seoMeta} />}
      {/* Mobile Header — sticky, grid: back + brand + country pill */}
      <header className={styles.mobileHeader}>
        <button type="button" className={styles.backBtn} onClick={() => navigate('/')} aria-label={t('common.goBack')}>
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

      {/* Hero Banner — Swiper carousel */}
      <section className={styles.heroSection}>
        <Swiper
          modules={[Autoplay]}
          loop
          autoplay={{ delay: 3500, disableOnInteraction: false }}
          speed={500}
          className={styles.heroSlider}
        >
          {HERO_SLIDES.map((src, i) => (
            <SwiperSlide key={src}>
              <img src={src} alt="VPNexues Organic Produce" className={styles.heroSlide} loading={i === 0 ? 'eager' : 'lazy'} />
            </SwiperSlide>
          ))}
        </Swiper>
      </section>

      {/* Desktop Heading — pg-banner style */}
      <section className={styles.desktopHeading}>
        <div className={styles.desktopHeadingInner}>
          <nav className={styles.breadcrumb}>
            <Link to="/">{t('shop.home')}</Link>
            <span className={styles.breadSep}>&rsaquo;</span>
            {t('shop.title')}
          </nav>
          <h1>&#128722; {t('shop.farmFreshProducts')}</h1>
          <p>{t('shop.organicDesc')} {t('shop.minimumOrder')} {formatPrice(country === 'IN' ? 500 : country === 'SG' ? 10 : country === 'US' ? 8 : 30, country)}. {t('shop.freeDeliveryAbove')} {formatPrice(country === 'IN' ? 1000 : country === 'SG' ? 20 : country === 'US' ? 15 : 60, country)}.</p>
        </div>
      </section>

      {/* Main Shop Section */}
      <section className={styles.shopSection}>
        <div className={styles.layout}>
          <div className={styles.mainCol} ref={mainColRef}>
            {/* Desktop Toolbar — spans full mainCol width */}
            <div className={styles.desktopToolbar}>
              <div className={styles.desktopToolbarInner}>
                <div className={styles.desktopCatBar}>
                  {CATEGORY_KEYS.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      className={`${styles.desktopPill} ${category === c.value ? styles.desktopPillActive : ''}`}
                      onClick={() => selectCategory(c.value)}
                    >
                      <span className={styles.pillIcon}><i className={`fa-solid ${c.iconCls}`} /></span>
                      {t(c.key)}
                    </button>
                  ))}
                </div>
                <div className={styles.toolbarActions}>
                  <label htmlFor="shop-sort" className={styles.visuallyHidden}>{t('shop.sortProducts')}</label>
                  <select id="shop-sort" value={sortBy} onChange={(e) => setSortBy(e.target.value as typeof sortBy)} className={styles.sortSelect} aria-label={t('shop.sortProducts')}>
                    <option value="recommended">{t('shop.recommended')}</option>
                    <option value="price-asc">{t('shop.priceLowHigh')}</option>
                    <option value="price-desc">{t('shop.priceHighLow')}</option>
                    <option value="name-asc">{t('shop.nameAToZ')}</option>
                  </select>
                  <button
                    type="button"
                    className={styles.toolbarSearchBtn}
                    onClick={() => setSearchOpen((v) => !v)}
                    aria-label={searchOpen ? t('shop.closeSearchAria') : t('shop.searchAria')}
                  >
                    {searchOpen ? <IconClose /> : <IconSearch />}
                  </button>
                  <button
                    ref={filterBtnRef}
                    type="button"
                    className={styles.toolbarFilterBtn}
                    onClick={() => setFilterSheetOpen(true)}
                  >
                    <IconSliders /> {t('shop.filterOptions')}
                  </button>
                </div>
              </div>
            </div>

            {/* Mobile Sticky Head — catalog title + search + filter */}
            <div className={styles.mobileStickyHead}>
              <div className={styles.mobileProductsHeader}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 0 }}>
                  <span className={styles.mobileCatalogTitle}>{catalogTitle}</span>
                  <span className={styles.mobileCatalogCount}>{totalElements} {t('shop.productsWord')}</span>
                </div>
                <div className={styles.mobileActions}>
                  <button
                    type="button"
                    className={styles.mobileSearchBtn}
                    onClick={() => setSearchOpen((v) => !v)}
                    aria-label={searchOpen ? t('shop.closeSearchAria') : t('shop.searchAria')}
                  >
                    {searchOpen ? <IconClose /> : <IconSearch />}
                  </button>
                  <button
                    type="button"
                    className={styles.mobileFilterBtn}
                    onClick={() => setFilterSheetOpen(true)}
                  >
                    <IconSliders /> {t('shop.filter')}
                  </button>
                </div>
              </div>
              {/* Mobile Category Scroll */}
              <nav className={styles.mobileCatBar} aria-label={t('shop.category')}>
                {CATEGORY_KEYS.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    className={`${styles.mobileCatPill} ${category === c.value ? styles.mobileCatPillActive : ''}`}
                    onClick={() => selectCategory(c.value)}
                  >
                    <span className={styles.mobileCatIcon}>{c.icon}</span>
                    {t(c.key)}
                  </button>
                ))}
              </nav>
            </div>

            {/* Search Box */}
            <AnimatePresence initial={false}>
              {searchOpen && (
                <motion.div
                  className={styles.searchBoxWrap}
                  ref={searchBoxContainerRef}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.22, ease: 'easeInOut' }}
                >
                  <div className={styles.searchBox}>
                    <IconSearch className={styles.searchBoxIcon} />
                    <input
                      autoFocus
                      type="text"
                      value={searchInput}
                      onChange={(e) => {
                        setSearchInput(e.target.value);
                        if (activeRecipeFilter) handleClearRecipeFilter();
                      }}
                      placeholder={t('shop.searchPlaceholder')}
                      aria-label={t('shop.searchAria')}
                    />
                    {searchInput && (
                      <button
                        type="button"
                        className={styles.searchClearBtn}
                        onClick={() => {
                          setSearchInput('');
                          setSearch('');
                          handleClearRecipeFilter();
                          setRecipeSuggestionsOpen(false);
                        }}
                        aria-label="Clear search"
                        title="Clear search"
                      >
                        <IconClose />
                      </button>
                    )}
                  </div>

                  {/* Recipe & Cuisine Suggestions Dropdown */}
                  {recipeSuggestionsOpen && liveRecipeMatch.isRecipeQuery && (
                    <div className={styles.suggestionsDropdown}>
                      <div className={styles.suggestionsHeader}>
                        <div className={styles.suggestionsHeading}>
                          <span>🍲</span> Recipe & Cuisine Suggestions
                        </div>
                        {liveRecipeMatch.cuisines.length > 0 && (
                          <button
                            type="button"
                            className={styles.suggestionsCuisineTag}
                            onClick={() => {
                              handleSelectCuisine(liveRecipeMatch.cuisines[0]);
                              setSearchInput('');
                              setSearch('');
                            }}
                            title={`Show all ${liveRecipeMatch.cuisines[0]} ingredients`}
                          >
                            {liveRecipeMatch.cuisines[0]}
                          </button>
                        )}
                      </div>

                      {/* Recipe Chips */}
                      <div className={styles.recipeSuggestionsChips}>
                        {liveRecipeMatch.recipes.slice(0, 5).map((r) => (
                          <button
                            key={r.id}
                            type="button"
                            className={`${styles.recipeChip} ${selectedRecipe?.id === r.id ? styles.recipeChipActive : ''}`}
                            onClick={() => {
                              handleSelectRecipe(r);
                              setSearchInput('');
                              setSearch('');
                            }}
                          >
                            <span>🍲 {r.name}</span>
                            <span className={styles.recipeChipCount}>{r.catalogProducts.length} items</span>
                          </button>
                        ))}
                      </div>

                      {/* Preview Products from our Catalog */}
                      {previewRecipeProducts.length > 0 && (
                        <div className={styles.suggestionsProdSection}>
                          <div className={styles.suggestionsProdTitle}>
                            Necessary Products in our Catalog ({previewRecipeProducts.length}):
                          </div>
                          <div className={styles.suggestionsProductsScroll}>
                            {previewRecipeProducts.map((p) => (
                              <div key={p.id} className={styles.miniProdCard}>
                                {p.imageUrl ? (
                                  <img
                                    src={cloudinaryImg(mediaUrl(p.imageUrl), 80)}
                                    alt={p.name}
                                    className={styles.miniProdThumb}
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src = `https://placehold.co/80x80/f4f9f0/4a7c3f?text=${encodeURIComponent(p.name.split(' ')[0])}&font=roboto`;
                                    }}
                                  />
                                ) : (
                                  <div className={styles.miniProdThumb} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🥬</div>
                                )}
                                <div className={styles.miniProdInfo}>
                                  <p className={styles.miniProdName} title={getProductName(p.name, lang)}>
                                    {getProductName(p.name, lang)}
                                  </p>
                                  <p className={styles.miniProdPrice}>
                                    {formatPrice(p.price, country)}
                                  </p>
                                </div>
                                <button
                                  type="button"
                                  className={styles.miniProdAddBtn}
                                  onClick={async (e) => {
                                    e.stopPropagation();
                                    await addItem(p.id, 1, {
                                      name: p.name,
                                      unitPrice: p.price,
                                      unit: p.unit,
                                      imageUrl: p.imageUrl,
                                      oldPrice: p.oldPrice ?? null,
                                    });
                                  }}
                                  title={`Add ${p.name} to cart`}
                                >
                                  +
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className={styles.suggestionsFooter}>
                        <span>Ingredients shown directly in catalog below</span>
                        <button
                          type="button"
                          className={styles.suggestionsFooterLink}
                          onClick={() => setRecipeSuggestionsOpen(false)}
                        >
                          View All in Catalog ↓
                        </button>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Product Grid */}
            {error && products.length === 0 ? (
              <div className={styles.emptyState} role="alert">
                <IconSearch className={styles.emptyIcon} />
                <p>{error}</p>
                <button type="button" className={styles.loadMoreBtn} onClick={() => { setError(null); setReloadTick((x) => x + 1); }}>{t('shop.retry')}</button>
              </div>
            ) : loading && products.length === 0 ? (
              <div className={styles.grid}>
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className={styles.skeletonCard} />
                ))}
              </div>
            ) : displayedProducts.length === 0 ? (
              <div className={styles.emptyState}>
                <IconSearch className={styles.emptyIcon} />
                <p>{t('shop.noProductsFound')}</p>
              </div>
            ) : (
              <>
                {/* Recipe Hero Banner in Catalog Section */}
                {activeRecipeFilter && (
                  <div className={styles.recipeBanner}>
                    <div className={styles.recipeBannerTop}>
                      <div className={styles.recipeIconBox}>
                        🍲
                      </div>
                      <div className={styles.recipeInfoBox}>
                        <div className={styles.recipeTitleRow}>
                          <h3 className={styles.recipeHeading}>
                            {selectedRecipe ? selectedRecipe.name : activeRecipeFilter.title}
                          </h3>
                          <span className={styles.recipeCuisineBadge}>
                            {selectedRecipe?.cuisine ?? activeRecipeFilter.cuisine ?? 'Regional Cuisine'}
                          </span>
                          {selectedRecipe?.mealType && (
                            <span className={styles.recipeMealBadge}>{selectedRecipe.mealType}</span>
                          )}
                          {selectedRecipe?.prepTime && (
                            <span className={styles.recipeTimeBadge}>⏱ {selectedRecipe.prepTime}m prep</span>
                          )}
                        </div>
                        <p className={styles.recipeSubtitle}>
                          Showing <strong>{displayedProducts.length} items</strong> from our product catalog used in this recipe.
                        </p>
                        {selectedRecipe?.instructions && (
                          <p className={styles.recipeMethod}>
                            <span className={styles.methodLabel}>Recipe Method:</span> {selectedRecipe.instructions}
                          </p>
                        )}
                      </div>
                      <button
                        type="button"
                        className={styles.recipeClearBtn}
                        onClick={() => {
                          setSearchInput('');
                          setSearch('');
                          handleClearRecipeFilter();
                        }}
                        title="Show all products"
                      >
                        <IconClose /> Clear Filter
                      </button>
                    </div>

                    {/* Matching dish pills if multiple recipes matched */}
                    {activeRecipeFilter.recipes.length > 1 && (
                      <div className={styles.recipeTabs}>
                        <span className={styles.recipeTabsLabel}>Matching Dishes:</span>
                        <button
                          type="button"
                          className={`${styles.recipeTabPill} ${!selectedRecipe ? styles.recipeTabPillActive : ''}`}
                          onClick={() => setSelectedRecipe(null)}
                        >
                          All Matching ({sortedProducts.length})
                        </button>
                        {activeRecipeFilter.recipes.slice(0, 6).map((r) => (
                          <button
                            key={r.id}
                            type="button"
                            className={`${styles.recipeTabPill} ${selectedRecipe?.id === r.id ? styles.recipeTabPillActive : ''}`}
                            onClick={() => setSelectedRecipe(r)}
                          >
                            {r.name} ({r.catalogProducts.length})
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Quick Action: Add all ingredients to cart */}
                    {displayedProducts.length > 0 && (
                      <div className={styles.recipeBannerFooter}>
                        <button
                          type="button"
                          className={styles.addAllRecipeBtn}
                          onClick={async () => {
                            for (const p of displayedProducts) {
                              await addItem(p.id, 1, {
                                name: p.name,
                                unitPrice: p.price,
                                unit: p.unit,
                                imageUrl: p.imageUrl,
                                oldPrice: p.oldPrice ?? null,
                              });
                            }
                          }}
                        >
                          🛒 Add All {displayedProducts.length} Recipe Ingredients to Cart
                        </button>
                      </div>
                    )}
                  </div>
                )}

                <div className={styles.grid}>
                  {displayedProducts.map((p, i) => (
                    <ProductCard key={p.id} product={p} optimized={i < 15} priority={i < 8} flyTargetEl={i < 4 ? ordSumRef : undefined} />
                  ))}
                </div>
              </>
            )}

            {/* Load More */}
            {hasMore && (
              <div className={styles.loadMoreWrap}>
                <p className={styles.loadMoreStatus}>
                  {t('shop.loadMoreShowing')
                    .replace('{shown}', String(Math.min((page + 1) * 24, totalElements)))
                    .replace('{total}', String(totalElements))}
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

          {/* Order Summary Sidebar — dark green */}
          <aside className={styles.ordSum} ref={ordSumRef}>
            <h4>📋 {t('shop.orderSummary')}</h4>
            <div className={styles.ordKgBox}>
              <div className={styles.ordLabel}>🚚 {t('cart.freeDelivery').toUpperCase()}</div>
              <div className={styles.ordSquareProgress}>
                <div className={styles.ordSquareTrack}>
                  <div
                    className={styles.ordSquareFill}
                    style={{ width: `${deliveryProgressPct}%` }}
                  />
                </div>
                <div className={styles.ordSquareCount}>
                  <span className={styles.ordSquareNum}>{cartCount}</span>
                  <span className={styles.ordSquareTotal}>{t('shop.items')}</span>
                </div>
              </div>
              <div className={`${styles.ordMsg} ${isFreeDelivery && cartCount > 0 ? styles.ordMsgReady : ''}`}>
                {cartCount === 0
                  ? t('shop.addItemsToStart')
                  : isFreeDelivery
                    ? `🎉 ${t('cart.freeDeliveryUnlocked')}`
                    : <>{t('cart.addMoreForFree')} <strong>{formatPrice(deliveryRemaining, country)}</strong> {t('cart.moreForFree')}</>}
              </div>
            </div>
            <div className={styles.productsRow}>
              {t('shop.products')} <span className={styles.productsCount}>{summaryRowCount}</span>
            </div>

            {cart && cart.items.length > 0 ? (
              <div className={styles.ordProducts}>
                {shopItems.map((item) => (
                  <div key={item.id} className={styles.ordItem}>
                    <span className={styles.ordItemThumb}>
                      {item.imageUrl ? <img src={cloudinaryImg(mediaUrl(item.imageUrl), 128)} alt="" loading="lazy" decoding="async" onError={(e) => { (e.target as HTMLImageElement).src = `https://placehold.co/200x200/f4f9f0/4a7c3f?text=${encodeURIComponent(item.name.split(' ')[0])}&font=roboto`; }} /> : '🥬'}
                    </span>
                    <span className={styles.ordItemName}>{getProductName(item.name, lang)}</span>
                    <span className={styles.ordItemQty}>x{item.qty}</span>
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
                {boxGroups.map((group) => {
                  const units = group.lines.reduce((sum, i) => sum + i.qty, 0);
                  const total = group.lines.reduce((sum, i) => sum + i.lineTotal, 0);
                  return (
                    <div key={group.type} className={styles.ordItem}>
                      <span className={styles.ordItemThumb}>{group.type === 'SMALL_BOX' ? '📦' : '🎁'}</span>
                      <span className={styles.ordItemName}>
                        {group.type === 'SMALL_BOX' ? t('home.smallBox') : t('home.bigBox')}
                      </span>
                      <span className={styles.ordItemQty}>x{units}</span>
                      <span className={styles.ordItemPrice}>
                        {currency}{total.toFixed(2)}
                      </span>
                      <button
                        type="button"
                        className={styles.ordItemRemove}
                        onClick={() => { group.lines.forEach((line) => void removeItem(line.id)); }}
                        aria-label={t('cart.remove')}
                        title={t('cart.remove')}
                      >
                        ×
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className={styles.ordEmptyList}>{t('shop.noProductsAdded')}</p>
            )}

            <div className={styles.ordBottom}>
              <div className={styles.sumRow}>
                <span>{t('shop.subtotal')}</span>
                <span>{currency}{itemTotal.toFixed(2)}</span>
              </div>
              <div className={styles.sumRow}>
                <span>{t('shop.savings')}</span>
                <span className={savings > 0 ? styles.ordSavingsActive : styles.ordSavingsMuted}>
                  {savings > 0 ? `${currency}${savings.toFixed(2)}` : '0'}
                </span>
              </div>
              <div className={`${styles.sumRow} ${styles.tot}`}>
                <span>{t('shop.total')}</span>
                <span>{currency}{itemTotal.toFixed(2)}</span>
              </div>

              <div className={styles.ordFooter}>
                <Link
                  to="/cart"
                  className={`${styles.ordBtn} ${viewCartEnabled ? styles.ordBtnActive : ''}`}
                  aria-disabled={!viewCartEnabled}
                  onClick={(e) => {
                    if (!viewCartEnabled) e.preventDefault();
                  }}
                >
                  🛒 {t('shop.viewCart')}
                </Link>
                <p className={styles.ordHint}>{viewCartEnabled ? t('shop.readyToCheckout') : t('shop.addItemsToStart')}</p>
              </div>
            </div>
          </aside>
        </div>
      </section>

      {/* Company Info */}
      <section className={styles.companyInfo}>
        <div className="container">
          <p>
            {t('shop.companyDesc1')}
          </p>
          <p>
            {t('shop.companyDesc2')}
          </p>
          <h2>{t('shop.freshOrganicHeading')}</h2>
          <p>
            {t('shop.freshOrganicDesc')}
          </p>
        </div>
      </section>

      <div className={styles.shopExtras}>
        <CtaDiscountBanner />
      </div>

      {/* Bottom Cart Bar — mobile only */}
      {!cartLoading && cartCount > 0 && cart && (() => {
        const totalSavings = cart.items.reduce((sum, i) => {
          if (i.oldPrice && i.oldPrice > i.unitPrice) return sum + (i.oldPrice - i.unitPrice) * i.qty;
          return sum;
        }, 0);
        return (
          <Link to="/cart" className={styles.cartJump} data-fly-target>
            <div className={styles.cartJumpProg}>
              <div className={styles.cartJumpProgFill} style={{ width: '100%' }} />
            </div>
            <div className={styles.cartJumpRow}>
              <span className={styles.cartJumpIcon}>
                <IconCart />
                <span className={styles.cartJumpCount}>{cartCount}</span>
              </span>
              <span className={styles.cartJumpDetails}>
                <span className={styles.cartJumpPrice}>{currency}{cart.itemTotal.toFixed(2)}</span>
                <span className={styles.cartJumpSavings}>
                  {totalSavings > 0
                    ? t('shop.cartJumpSaved').replace('{amount}', formatPrice(totalSavings, country))
                    : t('shop.cartJumpItems').replace('{n}', String(cartCount))
                  }
                </span>
              </span>
              <span className={styles.cartJumpProceed}>
                {t('shop.viewCart')} <IconArrowRight />
              </span>
            </div>
          </Link>
        );
      })()}

      {/* Filter Sheet — mobile bottom sheet / desktop anchored */}
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

      {/* Scroll to top */}
      {showScrollTop && (
        <button type="button" className={styles.scrollTopBtn} onClick={scrollToTop} aria-label={t('common.scrollTop')}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="m18 15-6-6-6 6" />
          </svg>
        </button>
      )}


    </div>
  );
}
