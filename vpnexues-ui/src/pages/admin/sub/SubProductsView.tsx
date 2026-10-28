import { useEffect, useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash, faTrash, faBox, faGrip, faList, faPlus, faSearch, faCamera, faThLarge } from '@fortawesome/free-solid-svg-icons';
import { listProducts, updateProduct, createProduct, deactivateProduct, setProductVisibility } from '../../../api/adminProductsApi';
import { listCategories } from '../../../api/adminCategoriesApi';
import { listInventory } from '../../../api/adminInventoryApi';
import { computeSalesVelocity } from '../../../utils/analytics';
import type { AdminInventoryItem, AdminProduct, Category } from '../../../types';
import type { CountryConfig } from '../../../config/countryConfig';
import { countryConfigs } from '../../../config/countryConfig';
import Modal from '../../../components/admin/Modal';
import SideDrawer from '../../../components/admin/SideDrawer';
import { useToast } from '../../../components/admin/Toast';
import { hasPermission } from '../../../utils/adminScope';
import { useAdminAuth } from '../../../context/AdminAuthContext';
import { getErrorMessage } from '../../../utils/errors';
import styles from './SubViews.module.css';
import TrustBanner from './TrustBanner';

interface ProductForm {
  name: string;
  category: string;
  price: string;
  oldPrice: string;
  stock: string;
  unit: string;
  description: string;
  sku: string;
  imageUrl: string;
  badges: string;
}

const EMPTY_FORM: ProductForm = { name: '', category: '', price: '', oldPrice: '', stock: '', unit: 'kg', description: '', sku: '', imageUrl: '', badges: '' };

/** Add Product form only offers these three; Beverages stays in DB for existing products. */
const ADD_PRODUCT_CATEGORIES = ['Vegetables', 'Fruits', 'Groceries', 'Beverages', 'Spices'] as const;

export default function SubProductsView({ config }: { config: CountryConfig }) {
  const { admin } = useAdminAuth();
  const canEdit = hasPermission(admin, 'edit');
  const canDelete = hasPermission(admin, 'delete');
  /** Visibility is its own grant, but a full edit implies it — mirrors the controller's any-of check. */
  const canHide = hasPermission(admin, 'hide') || canEdit;
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [stockByProduct, setStockByProduct] = useState<Record<string, AdminInventoryItem>>({});
  const [category, setCategory] = useState('');
  const [productFilter, setProductFilter] = useState<'all' | 'fast' | 'slow' | 'low' | 'out' | 'hidden'>('all');
  const [sort, setSort] = useState('');
  const [search, setSearch] = useState('');
  const [grid, setGrid] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewing, setViewing] = useState<AdminProduct | null>(null);
  const [deleting, setDeleting] = useState<AdminProduct | null>(null);
  /** Row id whose hide/show request is in flight — keeps the toggle from double-firing. */
  const [toggling, setToggling] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<ProductForm>(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());
  const [imagePreview, setImagePreview] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [priceSuccess, setPriceSuccess] = useState<{ product: AdminProduct; newPrice: number } | null>(null);
  const [drawerPrice, setDrawerPrice] = useState('');
  const [drawerSaving, setDrawerSaving] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [productDropdownOpen, setProductDropdownOpen] = useState(false);
  const productDropdownRef = useRef<HTMLDivElement>(null);
  const { notify } = useToast();

  function load() {
    setLoading(true);
    Promise.all([
      listProducts({ category: category || undefined, search: search || undefined, page: 0, size: 1000 }),
      listInventory({}),
    ])
      .then(([res, inv]) => {
        setProducts(res.content);
        const map: Record<string, AdminInventoryItem> = {};
        for (const item of inv) map[item.productId] = item;
        setStockByProduct(map);
        setError('');
      })
      .catch((err: unknown) => setError(getErrorMessage(err, 'Could not load products.')))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    listCategories().then(setCategories).catch(() => setCategories([]));
  }, []);

  useEffect(load, [category, search]);

  useEffect(() => {
    if (!productDropdownOpen) return;
    function handleClickOutside(e: MouseEvent) {
      if (productDropdownRef.current && !productDropdownRef.current.contains(e.target as Node)) {
        setProductDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [productDropdownOpen]);

  const addFormCategories = (() => {
    const fromApi = categories.filter((c) => (ADD_PRODUCT_CATEGORIES as readonly string[]).includes(c.name));
    if (fromApi.length > 0) return fromApi;
    return ADD_PRODUCT_CATEGORIES.map((name) => ({ id: name.toLowerCase(), name, slug: name.toLowerCase(), emoji: name === 'Vegetables' ? '🥬' : name === 'Fruits' ? '🍎' : name === 'Groceries' ? '🛒' : name === 'Beverages' ? '☕' : name === 'Spices' ? '🌶️' : '', active: true }));
  })();

  // const productSales = computeProductSales();
  const salesByName = new Map();
  const salesUnits: number[] = [];
  const medianSales = 0;

  /** This dashboard's region price — same value the shop serves for config.code (falls back to SGD base). */
  const ownPrice = (p: AdminProduct) => p.prices?.[config.code] ?? { price: p.basePrice, oldPrice: p.oldPrice };

  /** The four priced markets (must match PricingService.PRICED_REGIONS). */
  const REGION_CODES = ['IN', 'SG', 'US', 'AE'] as const;
  const regionMeta = (code: string) => Object.values(countryConfigs).find((c) => c.code === code);

  let visible = products.filter((p) => {
    if (!p.imageUrl) return false;
    if (selectedProduct && p.id !== selectedProduct) return false;
    if (productFilter === 'hidden' && p.active) return false;
    if (productFilter === 'low' && stockByProduct[p.id]?.status !== 'LOW_STOCK') return false;
    if (productFilter === 'out' && stockByProduct[p.id]?.status !== 'OUT_OF_STOCK') return false;
    if (salesByName.size > 0 && (productFilter === 'fast' || productFilter === 'slow')) {
      const info = salesByName.get(p.name);
      const units = info?.totalUnits ?? 0;
      if (productFilter === 'fast' && units < medianSales) return false;
      if (productFilter === 'slow' && units >= medianSales) return false;
    }
    return true;
  });
  if (sort === 'price-asc') visible = [...visible].sort((a, b) => ownPrice(a).price - ownPrice(b).price);
  if (sort === 'price-desc') visible = [...visible].sort((a, b) => ownPrice(b).price - ownPrice(a).price);
  if (sort === 'name') visible = [...visible].sort((a, b) => a.name.localeCompare(b.name));

  function openDetail(p: AdminProduct) {
    setViewing(p);
    setDrawerPrice(String(ownPrice(p).price));
  }

  async function handleDrawerPriceUpdate() {
    if (!viewing) return;
    const newPrice = Number(drawerPrice);
    if (Number.isNaN(newPrice) || newPrice <= 0) {
      notify('Please enter a valid price.', 'error');
      return;
    }
    setDrawerSaving(true);
    try {
      const updated = await updateProduct(viewing.id, {
        name: viewing.name,
        category: viewing.category,
        basePrice: newPrice,
        countryCode: config.code,
        unit: viewing.unit,
        active: viewing.active,
      });
      setPriceSuccess({ product: updated, newPrice });
      setViewing(null);
      load();
    } catch (err: unknown) {
      notify(getErrorMessage(err, 'Could not update price.'), 'error');
    } finally {
      setDrawerSaving(false);
    }
  }

  /**
   * Hide a product from the shop (or put it back). Uses the dedicated visibility endpoint, which
   * carries nothing but the `active` flag, so a toggle can never touch a price — and it works with
   * the standalone "Hide / Show" permission as well as a full edit.
   *
   * The row stays in this admin list (every public shop query is already `active = true`, so it
   * drops off the storefront immediately) and can be brought back the same way.
   */
  async function toggleActive(p: AdminProduct) {
    const hiding = p.active;
    setToggling(p.id);
    try {
      await setProductVisibility(p.id, !p.active);
      notify(hiding ? `${p.name} is now hidden from the shop.` : `${p.name} is visible on the shop again.`);
      load();
      // Keep an open detail drawer in sync so the status card doesn't show the old value.
      setViewing((cur) => (cur && cur.id === p.id ? { ...cur, active: !p.active } : cur));
    } catch (err: unknown) {
      notify(getErrorMessage(err, 'Could not update visibility.'), 'error');
    } finally {
      setToggling(null);
    }
  }

  function openDelete(p: AdminProduct) {
    setDeleting(p);
    setViewing(null);
  }

  async function confirmDelete() {
    if (!deleting) return;
    try {
      await deactivateProduct(deleting.id);
      setDeleting(null);
      load();
      notify('Product deleted.');
    } catch (err: unknown) {
      notify(getErrorMessage(err, 'Could not delete product.'), 'error');
    }
  }

  function openCreate() {
    setForm({ ...EMPTY_FORM, category: addFormCategories[0]?.name ?? '' });
    setFormError('');
    setImagePreview('');
    setCreating(true);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const price = Number(form.price);
    if (!form.name.trim() || !form.category || Number.isNaN(price)) {
      setFormError('Name, category and a numeric price are required.');
      return;
    }
    setSaving(true);
    try {
      await createProduct({
        name: form.name.trim(),
        category: form.category,
        basePrice: price,
        countryCode: config.code,
        oldPrice: form.oldPrice ? Number(form.oldPrice) : undefined,
        unit: form.unit,
        description: form.description.trim() || undefined,
        sku: form.sku.trim() || `SKU-${Date.now()}`,
        imageUrl: form.imageUrl.trim() || imagePreview || undefined,
        badges: form.badges ? form.badges.split(',').map((b) => b.trim()).filter(Boolean) : undefined,
      });
      setCreating(false);
      load();
      notify('Product added.');
    } catch (err: unknown) {
      setFormError(getErrorMessage(err, 'Something went wrong.'));
    } finally {
      setSaving(false);
    }
  }

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setFormError('Image must be under 5 MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setImagePreview(result);
      setForm({ ...form, imageUrl: result });
    };
    reader.readAsDataURL(file);
  }

  const stockCounts = {
    all: products.length,
    in: products.filter((p) => { const q = stockByProduct[p.id]?.quantity; return q !== undefined && q > 0; }).length,
    low: products.filter((p) => stockByProduct[p.id]?.status === 'LOW_STOCK').length,
    out: products.filter((p) => stockByProduct[p.id]?.status === 'OUT_OF_STOCK').length,
    hidden: products.filter((p) => !p.active).length,
    fast: products.filter((p) => { const units = salesByName.get(p.name)?.totalUnits ?? 0; return units >= medianSales; }).length,
    slow: products.filter((p) => { const units = salesByName.get(p.name)?.totalUnits ?? 0; return units < medianSales; }).length,
  };

  const filteredStats = (() => {
    if (selectedProduct) {
      const prod = products.find(p => p.id === selectedProduct);
      const sales = salesByName.get(prod?.name ?? '');
      const stock = stockByProduct[selectedProduct];
      return {
        total: 1,
        inStock: stock && stock.quantity > 0 ? 1 : 0,
        lowStock: stock?.status === 'LOW_STOCK' ? 1 : 0,
        outOfStock: stock?.status === 'OUT_OF_STOCK' ? 1 : 0,
        totalRevenue: sales?.totalRevenue ?? 0,
        productsSold: sales?.totalUnits ?? 0,
        orderCount: sales?.orderCount ?? 0,
        totalOrders: sales?.orderCount ?? 0,
        stockQty: stock?.quantity ?? 0,
        unitPrice: prod ? ownPrice(prod).price : 0,
        inventoryValue: (stock?.quantity ?? 0) * (prod ? ownPrice(prod).price : 0),
      };
    }
    return {
      total: visible.length,
      inStock: visible.filter((p) => { const q = stockByProduct[p.id]?.quantity; return q !== undefined && q > 0; }).length,
      lowStock: visible.filter((p) => stockByProduct[p.id]?.status === 'LOW_STOCK').length,
      outOfStock: visible.filter((p) => stockByProduct[p.id]?.status === 'OUT_OF_STOCK').length,
      totalRevenue: visible.reduce((s, p) => s + (salesByName.get(p.name)?.totalRevenue ?? 0), 0),
      productsSold: visible.reduce((s, p) => s + (salesByName.get(p.name)?.totalUnits ?? 0), 0),
      orderCount: visible.reduce((s, p) => s + (salesByName.get(p.name)?.orderCount ?? 0), 0),
      totalOrders: visible.reduce((s, p) => s + (salesByName.get(p.name)?.orderCount ?? 0), 0),
      stockQty: visible.reduce((sum, p) => sum + (stockByProduct[p.id]?.quantity ?? 0), 0),
      unitPrice: 0,
      inventoryValue: visible.reduce((sum, p) => { const qty = stockByProduct[p.id]?.quantity ?? 0; return sum + qty * ownPrice(p).price; }, 0),
    };
  })();

  return (
    <div>
      <div className={styles.pfCategoryRow}>
        <button type="button" className={`${styles.pfCategoryPill} ${category === '' ? styles.pfCategoryPillActive : ''}`} onClick={() => setCategory('')}>
          <span className={styles.pfCategoryName}>All Products</span>
          {category === '' && <span className={styles.pfCategoryCheck}>✓</span>}
        </button>
        {categories.map((c) => (
          <button key={c.id} type="button" className={`${styles.pfCategoryPill} ${category === c.name ? styles.pfCategoryPillActive : ''}`} onClick={() => setCategory(c.name)}>
            <span className={styles.pfCategoryName}>{c.name}</span>
            {category === c.name && <span className={styles.pfCategoryCheck}>✓</span>}
          </button>
        ))}
      </div>

      <div className={styles.pfFilterContainer}>
        <div className={styles.pfFilterBar}>
          <div className={styles.pfSearchWrap}>
            <FontAwesomeIcon icon={faSearch} className={styles.pfSearchIcon} />
            <input
              type="text"
              placeholder="Search by product name..."
              className={styles.pfSearchInput}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className={styles.pfCustomDropdown} ref={productDropdownRef}>
            <button
              type="button"
              className={`${styles.pfDropdownBtn} ${productDropdownOpen ? styles.pfDropdownBtnActive : ''}`}
              onClick={() => setProductDropdownOpen((o) => !o)}
            >
              {selectedProduct ? (products.find((p) => p.id === selectedProduct)?.name ?? 'Product') : 'All Products'}
              <span className={styles.pfDropdownArrow}>▾</span>
            </button>
            {productDropdownOpen && (
              <div className={styles.pfDropdownMenu}>
                <button
                  type="button"
                  className={`${styles.pfDropdownItem} ${selectedProduct === '' ? styles.pfDropdownItemActive : ''}`}
                  onClick={() => { setSelectedProduct(''); setProductDropdownOpen(false); }}
                >
                  All Products
                </button>
                {products.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    className={`${styles.pfDropdownItem} ${selectedProduct === p.id ? styles.pfDropdownItemActive : ''}`}
                    onClick={() => { setSelectedProduct(p.id); setProductDropdownOpen(false); }}
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            )}
          </div>
          <select className={styles.pfFilterSelect} value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="">Sort: Name</option>
            <option value="name">Sort: Name A–Z</option>
            <option value="price-asc">Sort: Price Low–High</option>
            <option value="price-desc">Sort: Price High–Low</option>
          </select>
          <div className={styles.pfViewToggle}>
            <button type="button" className={`${styles.pfViewBtn} ${grid ? styles.pfViewBtnActive : ''}`} onClick={() => setGrid(true)}>
              <FontAwesomeIcon icon={faGrip} />
            </button>
            <button type="button" className={`${styles.pfViewBtn} ${!grid ? styles.pfViewBtnActive : ''}`} onClick={() => setGrid(false)}>
              <FontAwesomeIcon icon={faList} />
            </button>
          </div>
          {canEdit && (
            <button type="button" className={styles.pfAddBtn} onClick={openCreate}>
              <FontAwesomeIcon icon={faPlus} /> Add Product
            </button>
          )}
        </div>
        <div className={styles.pfFilterPillsRow}>
          <button type="button" className={`${styles.pfFilterPill} ${productFilter === 'all' ? styles.pfFilterPillActive : ''}`} onClick={() => setProductFilter('all')}>
            All Products <span className={styles.pfFilterPillCount}>{stockCounts.all}</span>
          </button>
          <button type="button" className={`${styles.pfFilterPill} ${productFilter === 'fast' ? styles.pfFilterPillActive : ''}`} onClick={() => setProductFilter('fast')}>
            Fast Moving <span className={styles.pfFilterPillCount}>{stockCounts.fast}</span>
          </button>
          <button type="button" className={`${styles.pfFilterPill} ${productFilter === 'slow' ? styles.pfFilterPillActive : ''}`} onClick={() => setProductFilter('slow')}>
            Slow Moving <span className={styles.pfFilterPillCount}>{stockCounts.slow}</span>
          </button>
          <button type="button" className={`${styles.pfFilterPill} ${productFilter === 'low' ? styles.pfFilterPillActive : ''}`} onClick={() => setProductFilter('low')}>
            Low Stock <span className={styles.pfFilterPillCount}>{stockCounts.low}</span>
          </button>
          <button type="button" className={`${styles.pfFilterPill} ${productFilter === 'out' ? styles.pfFilterPillActive : ''}`} onClick={() => setProductFilter('out')}>
            Out of Stock <span className={styles.pfFilterPillCount}>{stockCounts.out}</span>
          </button>
          <button type="button" className={`${styles.pfFilterPill} ${productFilter === 'hidden' ? styles.pfFilterPillActive : ''}`} onClick={() => setProductFilter('hidden')}>
            Hidden from Shop <span className={styles.pfFilterPillCount}>{stockCounts.hidden}</span>
          </button>
        </div>
      </div>

      <div className={styles.pfStatsRow}>
        <div className={styles.pfStatCard}>
          <div className={`${styles.pfStatIcon} ${styles.pfStatIconBlue}`}><FontAwesomeIcon icon={faBox} /></div>
          <div className={styles.pfStatInfo}>
            <span className={styles.pfStatLabel}>{selectedProduct ? 'PRODUCT' : 'TOTAL PRODUCTS'}</span>
            <span className={styles.pfStatValue}>{selectedProduct ? (products.find(p => p.id === selectedProduct)?.name ?? '—').slice(0, 18) : filteredStats.total}</span>
            <span className={styles.pfStatSub}>{selectedProduct ? 'selected product' : productFilter !== 'all' ? `filtered ${productFilter}` : category ? 'in this category' : 'across all categories'}</span>
          </div>
        </div>
        <div className={styles.pfStatCard}>
          <div className={`${styles.pfStatIcon} ${styles.pfStatIconGreen}`}>
            {selectedProduct ? <FontAwesomeIcon icon={faBox} /> : '📦'}
          </div>
          <div className={styles.pfStatInfo}>
            <span className={styles.pfStatLabel}>{selectedProduct ? 'STOCK QTY' : 'STOCK'}</span>
            <span className={styles.pfStatValue}>{selectedProduct ? `${filteredStats.stockQty} units` : filteredStats.stockQty.toLocaleString()}</span>
            <span className={styles.pfStatSub}>{selectedProduct ? `at ${config.currencySymbol}${filteredStats.unitPrice}/unit` : 'total units across all products'}</span>
          </div>
        </div>
        <div className={styles.pfStatCard}>
          <div className={`${styles.pfStatIcon} ${styles.pfStatIconPurple}`}>📈</div>
          <div className={styles.pfStatInfo}>
            <span className={styles.pfStatLabel}>TOTAL REVENUE</span>
            <span className={styles.pfStatValue}>{config.currencySymbol}{Math.round(filteredStats.totalRevenue).toLocaleString()}</span>
            <span className={styles.pfStatSub}>{selectedProduct ? 'from this product' : productFilter !== 'all' ? 'filtered products' : 'across all products'}</span>
          </div>
        </div>
        <div className={styles.pfStatCard}>
          <div className={`${styles.pfStatIcon} ${styles.pfStatIconBlue}`}>💰</div>
          <div className={styles.pfStatInfo}>
            <span className={styles.pfStatLabel}>INVENTORY VALUE</span>
            <span className={styles.pfStatValue}>{config.currencySymbol}{Math.round(filteredStats.inventoryValue).toLocaleString()}</span>
            <span className={styles.pfStatSub}>at current selling price</span>
          </div>
        </div>
        <div className={styles.pfStatCard}>
          <div className={`${styles.pfStatIcon} ${styles.pfStatIconBlue}`}>📋</div>
          <div className={styles.pfStatInfo}>
            <span className={styles.pfStatLabel}>{selectedProduct ? 'ORDERS SOLD IN' : 'TOTAL ORDERS'}</span>
            <span className={styles.pfStatValue}>{filteredStats.totalOrders}</span>
            <span className={styles.pfStatSub}>{selectedProduct ? 'orders containing this product' : productFilter !== 'all' ? `orders with filtered ${productFilter}` : 'across all products'}</span>
          </div>
        </div>
      </div>

      <div className={styles.panel}>
        {loading ? (
          <p className={styles.empty}>Loading...</p>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: 24 }}>
            <p className={styles.empty}>{error}</p>
            <button type="button" className={styles.viewButton} onClick={load}>Retry</button>
          </div>
        ) : visible.length === 0 ? (
          <p className={styles.empty}>No products match these filters.</p>
        ) : grid ? (
          <div className={styles.panelBody}>
            <div className={styles.productGrid}>
              {visible.map((p) => {
                const qty = stockByProduct[p.id]?.quantity;
                const stockStatus = stockByProduct[p.id]?.status;
                const stockBadgeClass = stockStatus === 'OUT_OF_STOCK' ? styles.productStockBadgeOut
                  : stockStatus === 'LOW_STOCK' ? styles.productStockBadgeLow
                  : qty !== undefined && qty > 0 ? styles.productStockBadgeIn : '';
                const stockLabel = stockStatus === 'OUT_OF_STOCK' ? 'Out of Stock'
                  : stockStatus === 'LOW_STOCK' ? 'Low Stock'
                  : qty !== undefined && qty > 0 ? 'In Stock' : '';
                const saleInfo = salesByName.get(p.name);
                return (
                  <div key={p.id} className={styles.productCard} onClick={() => openDetail(p)}>
                    <div className={styles.productImageWrap}>
                      {p.imageUrl && !failedImages.has(p.id) ? (
                        <img src={p.imageUrl} alt={p.name} className={styles.productImage} onError={() => { setFailedImages((prev) => new Set(prev).add(p.id)); }} />
                      ) : (
                        <span className={styles.productEmoji}>📦</span>
                      )}
                      {stockLabel && <span className={`${styles.productStockBadge} ${stockBadgeClass}`}>{stockLabel}</span>}
                    </div>
                    <div className={styles.productInfo}>
                      <span className={styles.productName}>{p.name}</span>
                      <span className={styles.productCategory}>{p.category}</span>
                      <span className={styles.productPrice}>{config.currencySymbol}{ownPrice(p).price.toLocaleString()} <span className={styles.productPriceUnit}>· {p.unit}</span></span>
                      {saleInfo && <span className={styles.productCategory}>{saleInfo.totalUnits} sold · {saleInfo.orderCount} orders</span>}
                    </div>
                    <div className={styles.productActions} onClick={(e) => e.stopPropagation()}>
                      <button type="button" title="View" onClick={() => openDetail(p)}><FontAwesomeIcon icon={faEye} /></button>
                      {canHide && (
                        <button type="button" title={p.active ? 'Hide from shop' : 'Show on shop'} disabled={toggling === p.id} onClick={() => void toggleActive(p)}><FontAwesomeIcon icon={p.active ? faEyeSlash : faEye} /></button>
                      )}
                      {canDelete && (
                        <button type="button" title="Delete" onClick={() => openDelete(p)}><FontAwesomeIcon icon={faTrash} /></button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead><tr><th>Name</th><th>Category</th><th>Price</th><th>Stock</th><th>Action</th></tr></thead>
              <tbody>
                {visible.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        {p.imageUrl && !failedImages.has(p.id) ? (
                          <img src={p.imageUrl} alt={p.name} style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} onError={() => { setFailedImages((prev) => new Set(prev).add(p.id)); }} />
                        ) : (
                          <span style={{ width: 40, height: 40, borderRadius: 8, background: '#F1F8F1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>📦</span>
                        )}
                        <span>{p.name}</span>
                      </div>
                    </td>
                    <td>{p.category}</td>
                    <td>{config.currencySymbol}{ownPrice(p).price.toLocaleString()} / {p.unit}</td>
                    <td>{stockByProduct[p.id]?.quantity ?? '—'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button type="button" title="View" onClick={() => openDetail(p)} style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid #E2E8F0', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B' }}>
                          <FontAwesomeIcon icon={faEye} />
                        </button>
                        {canHide && (
                          <button type="button" title={p.active ? 'Hide from shop' : 'Show on shop'} disabled={toggling === p.id} onClick={() => void toggleActive(p)} style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid #E2E8F0', background: p.active ? '#fff' : '#F1F5F9', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: p.active ? '#64748B' : '#16A34A' }}>
                            <FontAwesomeIcon icon={p.active ? faEyeSlash : faEye} />
                          </button>
                        )}
                        {canDelete && (
                          <button type="button" title="Delete" onClick={() => openDelete(p)} style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid #E2E8F0', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B' }}>
                            <FontAwesomeIcon icon={faTrash} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {viewing && (
        <SideDrawer title="Product Details" onClose={() => setViewing(null)}>
          <div className={styles.sdProductHeader}>
            <div className={styles.sdProductImageWrap}>
              {viewing.imageUrl && !failedImages.has(viewing.id) ? (
                <img src={viewing.imageUrl} alt={viewing.name} className={styles.sdProductImage} onError={() => { setFailedImages((prev) => new Set(prev).add(viewing.id)); }} />
              ) : (
                <span className={styles.sdProductEmoji}>📦</span>
              )}
            </div>
            <div className={styles.sdProductMeta}>
              <h3 className={styles.sdProductName}>{viewing.name}</h3>
              {stockByProduct[viewing.id] && (
                <span className={`${styles.sdStockBadge} ${stockByProduct[viewing.id].status === 'OUT_OF_STOCK' ? styles.sdStockBadgeOut : stockByProduct[viewing.id].status === 'LOW_STOCK' ? styles.sdStockBadgeLow : styles.sdStockBadgeIn}`}>
                  {stockByProduct[viewing.id].status === 'OUT_OF_STOCK' ? 'Out of Stock' : stockByProduct[viewing.id].status === 'LOW_STOCK' ? 'Low Stock' : 'In Stock'}
                </span>
              )}
              <span className={styles.sdProductCategory}>{viewing.category}</span>
              <span className={styles.sdProductUnit}>{viewing.unit}</span>
            </div>
          </div>

          <div className={styles.sdSection}>
            <h4 className={styles.sdSectionTitle}>💰 Price Summary</h4>
            <div className={styles.sdPriceGrid}>
              <div className={styles.sdPriceCard}>
                <span className={styles.sdPriceLabel}>Stock</span>
                <span className={styles.sdPriceValue}>{stockByProduct[viewing.id]?.quantity ?? '—'}</span>
              </div>
              <div className={styles.sdPriceCard}>
                <span className={styles.sdPriceLabel}>Selling Price ({config.name})</span>
                <span className={styles.sdPriceValue}>{config.currencySymbol}{ownPrice(viewing).price.toLocaleString()}</span>
              </div>
              {REGION_CODES.map((rc) => {
                const meta = regionMeta(rc);
                const rp = viewing.prices?.[rc];
                return (
                  <div key={rc} className={styles.sdPriceCard}>
                    <span className={styles.sdPriceLabel}>{meta ? `${meta.name} (${rc})` : rc}</span>
                    <span className={styles.sdPriceValue}>{meta ? meta.currencySymbol : ''}{rp ? rp.price.toLocaleString() : '—'}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {canEdit && (
            <div className={styles.sdSection}>
              <h4 className={styles.sdSectionTitle}>✏️ Edit Price</h4>
              <div className={styles.sdEditPriceRow}>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  placeholder="New price"
                  className={styles.sdEditPriceInput}
                  value={drawerPrice}
                  onChange={(e) => setDrawerPrice(e.target.value)}
                />
                <button type="button" className={styles.sdUpdatePriceBtn} onClick={() => void handleDrawerPriceUpdate()} disabled={drawerSaving}>
                  {drawerSaving ? 'Updating...' : 'Update Price'}
                </button>
              </div>
            </div>
          )}

          <div className={styles.sdSection}>
            <h4 className={styles.sdSectionTitle}>📦 Reorder Point</h4>
            <div className={styles.sdAnalyticsGrid}>
              {(() => {
                const velocityData = computeSalesVelocity([]).find((v) => v.name === viewing.name);
                if (!velocityData) {
                  return <p className={styles.empty}>Insufficient sales data</p>;
                }
                return (
                  <>
                    <div className={styles.sdAnalyticsCard}>
                      <span className={styles.sdAnalyticsLabel}>Avg Daily Sales</span>
                      <span className={styles.sdAnalyticsValue}>{velocityData.avgDailySales}</span>
                    </div>
                    <div className={styles.sdAnalyticsCard}>
                      <span className={styles.sdAnalyticsLabel}>Days to Stockout</span>
                      <span className={styles.sdAnalyticsValue}>{velocityData.daysToStockout ?? '—'}</span>
                    </div>
                    <div className={styles.sdAnalyticsCard}>
                      <span className={styles.sdAnalyticsLabel}>Suggested Reorder Qty (7-day supply)</span>
                      <span className={styles.sdAnalyticsValue}>{velocityData.suggestedReorderQty}</span>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>

          <div className={styles.sdSection}>
            <h4 className={styles.sdSectionTitle}>📋 Product Details</h4>
            <div className={styles.sdDetailGrid}>
              <div className={styles.sdDetailCard}>
                <span className={styles.sdDetailLabel}>Category</span>
                <span className={styles.sdDetailValue}>{viewing.category}</span>
              </div>
              <div className={styles.sdDetailCard}>
                <span className={styles.sdDetailLabel}>Unit</span>
                <span className={styles.sdDetailValue}>{viewing.unit}</span>
              </div>
              <div className={styles.sdDetailCard}>
                <span className={styles.sdDetailLabel}>Stock</span>
                <span className={styles.sdDetailValue}>{stockByProduct[viewing.id]?.quantity ?? '—'}</span>
              </div>
              <div className={styles.sdDetailCard}>
                <span className={styles.sdDetailLabel}>SKU</span>
                <span className={styles.sdDetailValue}>{viewing.sku || '—'}</span>
              </div>
              <div className={styles.sdDetailCard}>
                <span className={styles.sdDetailLabel}>Status</span>
                <span className={styles.sdDetailValue} style={{ color: viewing.active ? '#16A34A' : '#94A3B8' }}>
                  {viewing.active ? 'Live on shop' : 'Hidden from shop'}
                </span>
                {canHide && (
                  <button
                    type="button"
                    disabled={toggling === viewing.id}
                    onClick={() => void toggleActive(viewing)}
                    style={{ marginTop: 8, width: '100%', padding: '7px 10px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: `1px solid ${viewing.active ? '#FCA5A5' : '#86EFAC'}`, background: viewing.active ? '#FEF2F2' : '#F0FDF4', color: viewing.active ? '#DC2626' : '#16A34A' }}
                  >
                    {toggling === viewing.id ? 'Saving…' : viewing.active ? 'Hide from shop' : 'Show on shop'}
                  </button>
                )}
              </div>
              <div className={styles.sdDetailCard}>
                <span className={styles.sdDetailLabel}>Created</span>
                <span className={styles.sdDetailValue}>{new Date(viewing.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          <div className={styles.sdSection}>
            <h4 className={styles.sdSectionTitle}>📊 Price History ({config.name})</h4>
            <div className={styles.sdPriceHistoryList}>
              <div className={styles.sdPriceHistoryItem}>
                <span className={styles.sdPriceHistoryDate}>{new Date(viewing.createdAt).toLocaleDateString()}</span>
                <span className={styles.sdPriceHistoryLabel}>Initial Price</span>
                <span className={styles.sdPriceHistoryValue}>{config.currencySymbol}{ownPrice(viewing).price.toLocaleString()}</span>
              </div>
              {ownPrice(viewing).oldPrice && (
                <div className={styles.sdPriceHistoryItem}>
                  <span className={styles.sdPriceHistoryDate}>Previous</span>
                  <span className={styles.sdPriceHistoryLabel}>Old Price</span>
                  <span className={styles.sdPriceHistoryValue}>{config.currencySymbol}{ownPrice(viewing).oldPrice!.toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>

          <div className={styles.sdSection}>
            <h4 className={styles.sdSectionTitle}>📈 Orders & Revenue Over Time</h4>
            <div className={styles.sdChartPlaceholder}>
              {(() => {
                const viewingSales = salesByName.get(viewing.name);
                if (!viewingSales || viewingSales.totalRevenue === 0) {
                  return <p className={styles.empty}>No sales data available</p>;
                }
                const revenue = viewingSales.totalRevenue;
                return (
                  <div className={styles.sdChartBars}>
                    <div className={styles.sdChartBar} style={{ height: '100%' }}>
                      <span className={styles.sdChartBarLabel}>{config.currencySymbol}{revenue.toLocaleString()}</span>
                    </div>
                  </div>
                );
              })()}
              <div className={styles.sdChartLegend}>
                <span className={styles.sdChartLegendItem}><span className={`${styles.sdChartLegendDot} ${styles.sdChartLegendDotGreen}`} /> Total Revenue</span>
              </div>
            </div>
          </div>

          <div className={styles.sdSection}>
            <h4 className={styles.sdSectionTitle}>📦 Product Sales Analytics</h4>
            <div className={styles.sdAnalyticsGrid}>
              {(() => {
                const viewingSales = salesByName.get(viewing.name);
                const aov = viewingSales && viewingSales.orderCount > 0 ? Math.round(viewingSales.totalRevenue / viewingSales.orderCount) : 0;
                const profit = viewingSales ? Math.round(viewingSales.totalRevenue * 0.4) : 0;
                return (
                  <>
                    <div className={styles.sdAnalyticsCard}>
                      <span className={styles.sdAnalyticsLabel}>Total Orders</span>
                      <span className={styles.sdAnalyticsValue}>{viewingSales?.orderCount ?? '—'}</span>
                    </div>
                    <div className={styles.sdAnalyticsCard}>
                      <span className={styles.sdAnalyticsLabel}>Units Sold</span>
                      <span className={styles.sdAnalyticsValue}>{viewingSales?.totalUnits ?? '—'}</span>
                    </div>
                    <div className={styles.sdAnalyticsCard}>
                      <span className={styles.sdAnalyticsLabel}>Total Revenue</span>
                      <span className={styles.sdAnalyticsValue}>{config.currencySymbol}{(viewingSales?.totalRevenue ?? 0).toLocaleString()}</span>
                    </div>
                    <div className={styles.sdAnalyticsCard}>
                      <span className={styles.sdAnalyticsLabel}>AOV</span>
                      <span className={styles.sdAnalyticsValue}>{config.currencySymbol}{aov.toLocaleString()}</span>
                    </div>
                    <div className={styles.sdAnalyticsCard}>
                      <span className={styles.sdAnalyticsLabel}>Total Profit</span>
                      <span className={styles.sdAnalyticsValue}>{config.currencySymbol}{profit.toLocaleString()}</span>
                    </div>
                    <div className={styles.sdAnalyticsCard}>
                      <span className={styles.sdAnalyticsLabel}>Profit Margin</span>
                      <span className={styles.sdAnalyticsValue}>40%</span>
                    </div>
                    <div className={styles.sdAnalyticsCard}>
                      <span className={styles.sdAnalyticsLabel}>Return Rate</span>
                      <span className={styles.sdAnalyticsValue}>0%</span>
                    </div>
                    <div className={styles.sdAnalyticsCard}>
                      <span className={styles.sdAnalyticsLabel}>Cancelled</span>
                      <span className={styles.sdAnalyticsValue}>0</span>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>

          <div className={styles.sdSection}>
            <h4 className={styles.sdSectionTitle}>🌍 {config.name} — Product Sales</h4>
            <div className={styles.sdCountrySalesGrid}>
              {(() => {
                const viewingSales = salesByName.get(viewing.name);
                const aov = viewingSales && viewingSales.orderCount > 0 ? Math.round(viewingSales.totalRevenue / viewingSales.orderCount) : 0;
                const profit = viewingSales ? Math.round(viewingSales.totalRevenue * 0.4) : 0;
                return (
                  <>
                    <div className={styles.sdCountrySalesCard}>
                      <span className={styles.sdCountrySalesLabel}>Country</span>
                      <span className={styles.sdCountrySalesValue}>{config.name}</span>
                    </div>
                    <div className={styles.sdCountrySalesCard}>
                      <span className={styles.sdCountrySalesLabel}>Orders</span>
                      <span className={styles.sdCountrySalesValue}>{viewingSales?.orderCount ?? 0}</span>
                    </div>
                    <div className={styles.sdCountrySalesCard}>
                      <span className={styles.sdCountrySalesLabel}>Units</span>
                      <span className={styles.sdCountrySalesValue}>{viewingSales?.totalUnits ?? 0}</span>
                    </div>
                    <div className={styles.sdCountrySalesCard}>
                      <span className={styles.sdCountrySalesLabel}>Revenue</span>
                      <span className={styles.sdCountrySalesValue}>{config.currencySymbol}{(viewingSales?.totalRevenue ?? 0).toLocaleString()}</span>
                    </div>
                    <div className={styles.sdCountrySalesCard}>
                      <span className={styles.sdCountrySalesLabel}>AOV</span>
                      <span className={styles.sdCountrySalesValue}>{config.currencySymbol}{aov.toLocaleString()}</span>
                    </div>
                    <div className={styles.sdCountrySalesCard}>
                      <span className={styles.sdCountrySalesLabel}>Profit</span>
                      <span className={styles.sdCountrySalesValue}>{config.currencySymbol}{profit.toLocaleString()}</span>
                    </div>
                    <div className={styles.sdCountrySalesCard}>
                      <span className={styles.sdCountrySalesLabel}>Return Rate</span>
                      <span className={styles.sdCountrySalesValue}>0%</span>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        </SideDrawer>
      )}

      {deleting && (
        <Modal title="Confirm Delete" onClose={() => setDeleting(null)}>
          <div className={styles.deleteModalContent}>
            <div className={styles.deleteModalImageWrap}>
              {deleting.imageUrl && !failedImages.has(deleting.id) ? (
                <img src={deleting.imageUrl} alt={deleting.name} className={styles.deleteModalImage} onError={() => { setFailedImages((prev) => new Set(prev).add(deleting.id)); }} />
              ) : (
                <span className={styles.deleteModalEmoji}>📦</span>
              )}
            </div>
            <p className={styles.deleteModalText}>Are you sure you want to delete the product?</p>
            <p className={styles.deleteModalName}>{deleting.name}</p>
          </div>
          <div className={styles.actions}>
            <button type="button" className={styles.ghostButton} onClick={() => setDeleting(null)}>No</button>
            <button type="button" className={styles.deleteButton} onClick={() => void confirmDelete()}>Yes</button>
          </div>
        </Modal>
      )}

      {creating && (
        <Modal title="Add Product" onClose={() => setCreating(false)} headerDark>
          {formError && <p className={styles.formError}>{formError}</p>}
          <form onSubmit={(e) => void handleCreate(e)} className={styles.addProductForm}>
            <div className={styles.addProductImageSection}>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} hidden />
              <button type="button" className={styles.addProductImageUpload} onClick={() => fileInputRef.current?.click()}>
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className={styles.addProductImagePreview} />
                ) : (
                  <>
                    <FontAwesomeIcon icon={faCamera} className={styles.addProductImageIcon} />
                    <span className={styles.addProductImageText}>Upload Photo</span>
                    <span className={styles.addProductImageHint}>JPG, PNG up to 5 MB</span>
                  </>
                )}
              </button>
              <div className={styles.addProductImageUrl}>
                <label>Or paste image URL</label>
                <input type="url" placeholder="https://..." value={form.imageUrl} onChange={(e) => { setForm({ ...form, imageUrl: e.target.value }); if (e.target.value) setImagePreview(e.target.value); }} />
              </div>
            </div>

            <div className={styles.addProductFields}>
              <div className={styles.addProductRow}>
                <div className={`${styles.field} ${styles.addProductField}`}>
                  <label>Product Name *</label>
                  <input required placeholder="e.g. Organic Carrots" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </div>
                <div className={`${styles.field} ${styles.addProductField}`}>
                  <label>Category *</label>
                  <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                    <option value="">Select…</option>
                    {addFormCategories.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
                  </select>
                </div>
              </div>

              <div className={styles.addProductRow}>
                <div className={`${styles.field} ${styles.addProductField}`}>
                  <label>Price ({config.currencySymbol}) *</label>
                  <input required type="number" step="0.01" min="0" placeholder="0.00" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
                </div>
                <div className={`${styles.field} ${styles.addProductField}`}>
                  <label>Old Price ({config.currencySymbol})</label>
                  <input type="number" step="0.01" min="0" placeholder="Optional" value={form.oldPrice} onChange={(e) => setForm({ ...form, oldPrice: e.target.value })} />
                </div>
              </div>

              <div className={styles.addProductRow}>
                <div className={`${styles.field} ${styles.addProductField}`}>
                  <label>Stock Quantity</label>
                  <input type="number" min="0" placeholder="0" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
                </div>
                <div className={`${styles.field} ${styles.addProductField}`}>
                  <label>Unit</label>
                  <select value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })}>
                    <option value="kg">kg</option>
                    <option value="g">g</option>
                    <option value="lb">lb</option>
                    <option value="oz">oz</option>
                    <option value="piece">piece</option>
                    <option value="pack">pack</option>
                    <option value="dozen">dozen</option>
                    <option value="litre">litre</option>
                    <option value="ml">ml</option>
                  </select>
                </div>
              </div>

              <div className={styles.addProductRow}>
                <div className={`${styles.field} ${styles.addProductField}`}>
                  <label>SKU</label>
                  <input placeholder="Auto-generated if empty" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} />
                </div>
                <div className={`${styles.field} ${styles.addProductField}`}>
                  <label>Badges</label>
                  <input placeholder="e.g. Organic, Fresh (comma separated)" value={form.badges} onChange={(e) => setForm({ ...form, badges: e.target.value })} />
                </div>
              </div>

              <div className={`${styles.field} ${styles.addProductFull}`}>
                <label>Description</label>
                <textarea rows={3} placeholder="Product description..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
            </div>

            <div className={styles.addProductActions}>
              <button type="button" className={styles.addProductCancelBtn} onClick={() => setCreating(false)}>Cancel</button>
              <button type="submit" className={styles.addProductSaveBtn} disabled={saving}>{saving ? 'Saving...' : 'Add Product'}</button>
            </div>
          </form>
        </Modal>
      )}

      {priceSuccess && (
        <div className={styles.priceSuccessOverlay} onClick={() => setPriceSuccess(null)}>
          <div className={styles.priceSuccessCard} onClick={(e) => e.stopPropagation()}>
            <button type="button" className={styles.priceSuccessClose} onClick={() => setPriceSuccess(null)}>✕</button>
            <div className={styles.priceSuccessCheckWrap}>
              <div className={styles.priceSuccessCheck}>✓</div>
            </div>
            <p className={styles.priceSuccessTitle}>Price updated successfully</p>
            <div className={styles.priceSuccessDivider} />
            <div className={styles.priceSuccessProduct}>
              <div className={styles.priceSuccessImageWrap}>
                {priceSuccess.product.imageUrl && !failedImages.has(priceSuccess.product.id) ? (
                  <img src={priceSuccess.product.imageUrl} alt={priceSuccess.product.name} className={styles.priceSuccessImage} onError={() => { setFailedImages((prev) => new Set(prev).add(priceSuccess.product.id)); }} />
                ) : (
                  <span className={styles.priceSuccessEmoji}>📦</span>
                )}
              </div>
              <div className={styles.priceSuccessInfo}>
                <p className={styles.priceSuccessName}>{priceSuccess.product.name}</p>
                <p className={styles.priceSuccessNewPrice}>New Price: <span className={styles.priceSuccessAmount}>{config.currencySymbol}{priceSuccess.newPrice.toLocaleString()}</span></p>
              </div>
            </div>
          </div>
        </div>
      )}
      <TrustBanner />
    </div>
  );
}
