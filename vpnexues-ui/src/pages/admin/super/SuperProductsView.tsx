import { useEffect, useMemo, useState } from 'react';
import * as adminProductsApi from '../../../api/adminProductsApi';
import * as adminCategoriesApi from '../../../api/adminCategoriesApi';
// demo orders removed — sales stats now computed from real orders when backend provides item-level APIs
import { listInventory } from '../../../api/adminInventoryApi';
import type { AdminInventoryItem, AdminProduct, Category } from '../../../types';
import Modal from '../../../components/admin/Modal';
import ScrollReveal from '../../../components/admin/ScrollReveal';
import { useToast } from '../../../components/admin/Toast';
import { printTable, type ExportData } from '../../../utils/csvExport';
import { getErrorMessage } from '../../../utils/errors';
import * as adminContentApi from '../../../api/adminContentApi';
import { readPhotoFile } from '../../../api/adminTeamApi';
import { assetUrl } from '../../../api/contentApi';
import styles from '../css/SuperAdminDashboard.module.css';

const PAGE_SIZE = 20;

/** Priced markets: the four in PricingService.PRICED_REGIONS plus LK, whose price
    comes from an explicit override (backend AdminProductService already serves
    LK/MY overrides in the prices map; without one it falls back to SGD base). */
const REGIONS = [
  { code: 'IN', label: 'India', flag: '/images/in-flag.svg', symbol: '₹' },
  { code: 'SG', label: 'Singapore', flag: '/images/sg-flag.svg', symbol: 'S$' },
  { code: 'AE', label: 'UAE', flag: '/images/uae-flag.svg', symbol: 'AED ' },
  { code: 'US', label: 'US', flag: '/images/us-flag.svg', symbol: '$' },
  { code: 'LK', label: 'Sri Lanka', flag: '/images/lk-flag.svg', symbol: 'Rs. ' },
] as const;

interface ProductForm {
  name: string;
  category: string;
  description: string;
  basePrice: string;
  unit: string;
  sku: string;
  stock: string;
  emoji: string;
  imageUrl: string;
  active: boolean;
}

const EMPTY_FORM: ProductForm = { name: '', category: '', description: '', basePrice: '', unit: 'per kg', sku: '', stock: '50', emoji: '🛒', imageUrl: '', active: true };

/** Category header styling — known categories keep their brand look; any other
    value in the DB still gets a distinct color so no group ever renders
    invisibly (the old hardcoded 5-name list silently dropped everything else). */
const CATEGORY_STYLES: Record<string, { emoji: string; color: string; bg: string }> = {
  Vegetables: { emoji: '🥬', color: '#16A34A', bg: '#f0fdf4' },
  Fruits: { emoji: '🍎', color: '#E11D48', bg: '#fff1f2' },
  Groceries: { emoji: '🛒', color: '#2563EB', bg: '#eff6ff' },
  Beverages: { emoji: '🥤', color: '#D97706', bg: '#fffbeb' },
  Spices: { emoji: '🌶️', color: '#9333EA', bg: '#faf5ff' },
};
const FALLBACK_CATEGORY_STYLES = [
  { emoji: '🧺', color: '#0891B2', bg: '#ecfeff' },
  { emoji: '🌾', color: '#CA8A04', bg: '#fefce8' },
  { emoji: '🥫', color: '#DB2777', bg: '#fdf2f8' },
  { emoji: '🧂', color: '#4F46E5', bg: '#eef2ff' },
];

function categoryStyle(cat: string) {
  const known = CATEGORY_STYLES[cat];
  if (known) return known;
  // Deterministic pick so the same category always shows the same color.
  let hash = 0;
  for (let i = 0; i < cat.length; i++) hash = (hash + cat.charCodeAt(i)) % FALLBACK_CATEGORY_STYLES.length;
  return FALLBACK_CATEGORY_STYLES[hash];
}

/** Hide a dead product image (old supabase/cloudinary URLs 404/401) and reveal
    the 📦 placeholder beside it, so cards never render as blank boxes. */
function onProductImgError(e: { currentTarget: HTMLImageElement }) {
  const img = e.currentTarget;
  img.style.display = 'none';
  const fallback = img.nextElementSibling as HTMLElement | null;
  if (fallback) fallback.style.display = 'block';
}

/** Converts a data URL (from the client-side downscale) into a Blob for upload. */
function dataUrlToBlob(dataUrl: string): Blob {
  const [head, body] = dataUrl.split(',');
  const mime = /data:([^;,]+)/.exec(head)?.[1] ?? 'image/jpeg';
  const binary = atob(body);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type: mime });
}

export default function SuperProductsView() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [stockByProduct, setStockByProduct] = useState<Record<string, AdminInventoryItem>>({});
  const [page, setPage] = useState(0);
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');
  const [stockFilter, setStockFilter] = useState('');
  const [sort, setSort] = useState('custom');
  const [search, setSearch] = useState('');
  /**
   * Server-side `search` is debounced so typing doesn't fire two HTTP requests
   * (products + inventory) per keystroke. The input still updates instantly.
   */
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [unit, setUnit] = useState('');
  const [region, setRegion] = useState('IN');
  const [moreOpen, setMoreOpen] = useState(false);
  const [grid, setGrid] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState<AdminProduct | null>(null);
  const [priceEdit, setPriceEdit] = useState(false);
  const [priceDraft, setPriceDraft] = useState('');
  const [priceError, setPriceError] = useState('');
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<AdminProduct | null>(null);
  const [form, setForm] = useState<ProductForm>(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const { notify } = useToast();

  function load() {
    setLoading(true);
    Promise.all([
      adminProductsApi.listProducts({ category: category || undefined, search: debouncedSearch || undefined, page: 0, size: 200 }),
      listInventory({}).catch(() => [] as AdminInventoryItem[]),
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
    adminCategoriesApi.listCategories().then(setCategories).catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(load, [category, debouncedSearch]);

  function stockOf(p: AdminProduct): number | null {
    return stockByProduct[p.id]?.quantity ?? null;
  }

  /** Price for the selected region — same value the shop serves for that market (falls back to SGD base). */
  function regionPrice(p: AdminProduct): { price: number; oldPrice: number | null } {
    return p.prices?.[region] ?? { price: p.basePrice, oldPrice: p.oldPrice };
  }
  const regionSymbol = REGIONS.find((r) => r.code === region)?.symbol ?? '';

  function orderStats(p: AdminProduct): { orders: number; units: number; revenue: number } {
    let orders = 0;
    let units = 0;
    let revenue = 0;
    // sales stats from real orders (item-level APIs pending)
    return { orders: 0, units: 0, revenue: 0 };
    return { orders, units, revenue };
  }

  const statsById = useMemo(() => {
    const map = new Map<string, { orders: number; units: number; revenue: number }>();
    for (const p of products) map.set(p.id, orderStats(p));
    return map;
  }, [products]);

  const { ranked, bestIds, slowIds, visible } = useMemo(() => {
    const rank = [...products].sort((a, b) => (statsById.get(b.id)?.revenue ?? 0) - (statsById.get(a.id)?.revenue ?? 0));
    const best = new Set(rank.slice(0, 3).map((p) => p.id));
    const slow = new Set(rank.slice(-3).map((p) => p.id));

    let list = products.filter((p) => {
      if (status === 'in' && !p.active) return false;
      if (status === 'low') {
        const q = stockOf(p);
        if (q === null || q <= 0 || q > 20) return false;
      }
      if (status === 'out') {
        const q = stockOf(p);
        if (q !== 0) return false;
      }
      if (stockFilter) {
        const q = stockOf(p);
        if (q === null) return false;
        if (stockFilter.startsWith('lt')) {
          if (!(q < Number(stockFilter.slice(2)))) return false;
        } else if (!(q >= Number(stockFilter))) return false;
      }
      if (priceMin && !(regionPrice(p).price >= Number(priceMin))) return false;
      if (priceMax && !(regionPrice(p).price <= Number(priceMax))) return false;
      if (unit && p.unit !== unit) return false;
      return true;
    });
    if (sort === 'name') list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    if (sort === 'price_asc') list = [...list].sort((a, b) => regionPrice(a).price - regionPrice(b).price);
    if (sort === 'price_desc') list = [...list].sort((a, b) => regionPrice(b).price - regionPrice(a).price);
    if (sort === 'stock_desc') list = [...list].sort((a, b) => (stockOf(b) ?? -1) - (stockOf(a) ?? -1));
    if (sort === 'stock_asc') list = [...list].sort((a, b) => (stockOf(a) ?? 999999) - (stockOf(b) ?? 999999));
    if (sort === 'sold') list = [...list].sort((a, b) => (statsById.get(b.id)?.units ?? 0) - (statsById.get(a.id)?.units ?? 0));
    return { ranked: rank, bestIds: best, slowIds: slow, visible: list };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products, stockByProduct, status, stockFilter, priceMin, priceMax, unit, sort, region]);

  const totalPages = Math.max(1, Math.ceil(visible.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages - 1);
  const paged = visible.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE);
  const showPager = totalPages > 1;
  const units = useMemo(() => [...new Set(products.map((p) => p.unit))], [products]);
  const inCount = products.filter((p) => p.active).length;
  const lowCount = products.filter((p) => { const q = stockOf(p); return q !== null && q > 0 && q <= 20; }).length;
  const outCount = products.filter((p) => stockOf(p) === 0).length;

  function resetFilters() {
    setCategory('');
    setStatus('');
    setStockFilter('');
    setSort('custom');
    setSearch('');
    setPriceMin('');
    setPriceMax('');
    setUnit('');
    setPage(0);
  }

  function openDetail(p: AdminProduct) {
    setSelected(p);
    setPriceEdit(false);
    setPriceDraft(String(regionPrice(p).price));
    setPriceError('');
  }

  async function confirmPrice() {
    if (!selected) return;
    const val = parseFloat(String(priceDraft).replace(/[^0-9.-]/g, ''));    if (Number.isNaN(val) || val < 0) {
      setPriceError('Please enter a valid price (0 or above).');
      return;
    }
    setSaving(true);
    try {
      const updated = await adminProductsApi.updateProduct(selected.id, {
        name: selected.name, category: selected.category, description: selected.description ?? undefined,
        basePrice: Math.round(val * 100) / 100, unit: selected.unit, active: selected.active, countryCode: region,
      });
      setSelected(updated);
      setPriceEdit(false);
      setPriceError('');
      load();
      notify('Price updated successfully.');
    } catch (err: unknown) {
      setPriceError(getErrorMessage(err, 'Could not update price.'));
    } finally {
      setSaving(false);
    }
  }

  function openCreate() {
    setForm({ ...EMPTY_FORM, category: categories[0]?.name ?? '' });
    setFormError('');
    setCreating(true);
  }

  function openEdit(p: AdminProduct) {
    setForm({ name: p.name, category: p.category, description: p.description ?? '', basePrice: String(regionPrice(p).price), unit: p.unit, sku: p.sku, stock: '', emoji: '', imageUrl: p.imageUrl ?? '', active: p.active });
    setFormError('');
    setEditing(p);
    setSelected(null);
  }

  /** Uploads the picked photo to the server (stored as /uploads/products/<slug>.jpg)
   * so the DB keeps a short path instead of a base64 blob. */
  function pickProductImage() {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      e.target.value = '';
      if (!file) return;
      setUploadingImage(true);
      setFormError('');
      const name = form.name.trim() || (editing?.name ?? '');
      const previous = form.imageUrl;
      readPhotoFile(file, 1280)
        .then((dataUrl) => adminContentApi.uploadPhoto(dataUrlToBlob(dataUrl), name || undefined, previous || undefined, 'products'))
        .then((url) => setForm((f) => ({ ...f, imageUrl: url })))
        .catch((err: unknown) => setFormError(getErrorMessage(err, 'Could not upload that image.')))
        .finally(() => setUploadingImage(false));
    };
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const price = Number(form.basePrice);
    if (!form.name.trim()) {
      setFormError('Please enter a product name.');
      return;
    }
    if (products.some((p) => p.name.toLowerCase() === form.name.trim().toLowerCase() && (!editing || p.id !== editing.id))) {
      setFormError('A product with this name already exists.');
      return;
    }
    if (!(price > 0)) {
      setFormError('Please enter a valid price greater than 0.');
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        await adminProductsApi.updateProduct(editing.id, { name: form.name, category: form.category, description: form.description || undefined, basePrice: price, unit: form.unit, imageUrl: form.imageUrl || undefined, active: form.active, countryCode: region });
        notify('Product updated.');
      } else {
        await adminProductsApi.createProduct({ name: form.name.trim(), category: form.category, description: form.description || undefined, basePrice: price, unit: form.unit || 'per pc', sku: form.sku.trim() || `CUS-${Date.now().toString(36).toUpperCase().slice(-6)}`, imageUrl: form.imageUrl || undefined, countryCode: region });
        notify(`${form.name.trim()} added to ${form.category}`);
      }
      setCreating(false);
      setEditing(null);
      load();
    } catch (err: unknown) {
      setFormError(getErrorMessage(err, 'Something went wrong.'));
    } finally {
      setSaving(false);
    }
  }

  async function deleteProduct(p: AdminProduct) {
    if (!window.confirm(`Delete product ${p.name}?`)) return;
    try {
      await adminProductsApi.deactivateProduct(p.id);
      setSelected(null);
      load();
      notify('Product deactivated.');
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Could not deactivate product.'));
    }
  }

  function getExportData(): ExportData {
    return {
      filename: 'products.csv',
      title: 'Products',
      columns: ['Name', 'Category', 'SKU', 'Price', 'Unit', 'Stock', 'Active'],
      rows: visible.map((p) => [p.name, p.category, p.sku, regionPrice(p).price, p.unit, stockOf(p) ?? '', p.active ? 'Yes' : 'No']),
    };
  }

  function printList() {
    const d = getExportData();
    printTable({ filename: 'products.csv', title: d.title, columns: d.columns, rows: d.rows });
  }

  const catTabs: { key: string; label: string; img: string }[] = [
    { key: '', label: 'All Products', img: '' },
    { key: 'Vegetables', label: 'Vegetables', img: '/assets-ui/img/veg 1.jpeg' },
    { key: 'Fruits', label: 'Fruits', img: '/assets-ui/img/fruit 1.jpeg' },
    { key: 'Groceries', label: 'Groceries', img: '/assets-ui/img/groceries 1.jpeg' },
    { key: 'Beverages', label: 'Beverages', img: '/assets-ui/img/beverages 2.jpeg' },
    { key: 'Spices', label: 'Spices', img: '/assets-ui/img/spices 2.jpeg' },
  ];

  const stockTabs: { key: string; label: string; count: number }[] = [
    { key: '', label: 'All', count: products.length },
    { key: 'in', label: 'In Stock', count: inCount },
    { key: 'low', label: 'Low Stock', count: lowCount },
    { key: 'out', label: 'Out of Stock', count: outCount },
  ];

  return (
    <div>
      {/* ── Hero Banner ── */}
      <ScrollReveal>
        <div style={{ position: 'relative', borderRadius: 18, overflow: 'hidden', marginBottom: 20, boxShadow: '0 4px 20px rgba(0,0,0,.12)' }}>
          <img src="/assets-ui/img/product-banner.png" alt="" style={{ width: '100%', height: 180, objectFit: 'cover', display: 'block' }} />
          <div className={styles.productsBannerOverlay} style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg,rgba(11,47,26,.55) 0%,rgba(11,47,26,.45) 50%,rgba(11,47,26,.55) 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ filter: 'drop-shadow(0 2px 6px rgba(0,0,0,.4))', flexShrink: 0 }}><circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" /></svg>
              <h1 className={styles.productsBannerTitle} style={{ fontWeight: 800, color: '#fff', margin: 0 }}>Farm Fresh Products</h1>
            </div>
            <p className={styles.productsBannerSub} style={{ color: 'rgba(255,255,255,.85)', margin: 0 }}>Manage and monitor all your products across the region</p>
          </div>
        </div>
      </ScrollReveal>

      {/* ── Category Tabs ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 8, marginBottom: 20 }}>
        {catTabs.map((t) => {
          const active = category === t.key;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => { setCategory(t.key); setPage(0); }}
              className={`${styles.catTab} ${active ? styles.catTabActive : ''}`}
            >
              {t.key === '' ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>
              ) : (
                <img src={t.img} alt="" style={{ width: 24, height: 24, borderRadius: 6, objectFit: 'cover', flexShrink: 0 }} />
              )}
              {t.label}
            </button>
          );
        })}
      </div>

      {/* ── Back + Title + Toolbar ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        <button type="button" onClick={() => setCategory('')} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: '1px solid #e2e8f0', borderRadius: 8, padding: '8px 14px', cursor: 'pointer', fontSize: 13, color: '#64748b', fontWeight: 500 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>
          Back
        </button>
        <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>{category || 'All Products'}</h3>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={resetFilters}
            title="Clear all filters"
            style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, padding: '8px 14px', cursor: 'pointer', fontSize: 13, color: '#64748b', fontWeight: 500 }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" /></svg>
            Reset
          </button>
          <button
            type="button"
            onClick={printList}
            title="Print / export filtered list as CSV"
            style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, padding: '8px 14px', cursor: 'pointer', fontSize: 13, color: '#64748b', fontWeight: 500 }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9" /><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><rect x="6" y="14" width="12" height="8" /></svg>
            Print CSV
          </button>
          <button
            type="button"
            onClick={openCreate}
            style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#2E7D32', border: '1px solid #2E7D32', borderRadius: 8, padding: '8px 16px', cursor: 'pointer', fontSize: 13, color: '#fff', fontWeight: 700 }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
            Add Product
          </button>
        </div>
      </div>

      {/* ── Filter Card ── */}
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 'var(--radius, 12px)', boxShadow: '0 1px 3px rgba(0,0,0,.06)', overflow: 'hidden', marginBottom: 24 }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div className={styles.stockTabRow}>
            {stockTabs.map((t) => {
              const active = status === t.key;
              return (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => { setStatus(t.key); setPage(0); }}
                  style={{
                    padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 500,
                    background: active ? '#2E7D32' : '#F1F5F9', color: active ? '#fff' : '#64748B',
                    border: `1px solid ${active ? '#2E7D32' : '#E2E8F0'}`, cursor: 'pointer', transition: 'all .2s',
                  }}
                >
                  {t.label}
                  <span style={{
                    background: active ? 'rgba(255,255,255,.25)' : '#E2E8F0', padding: '1px 7px', borderRadius: 10,
                    fontSize: 11, fontWeight: 600, marginLeft: 4, color: active ? '#fff' : '#64748B',
                  }}>{t.count}</span>
                </button>
              );
            })}
          </div>
          <div className={styles.filterSearchWrap}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }}><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
            <input
              placeholder="Search products..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(0); }}
              style={{ padding: '8px 12px 8px 34px', border: '1px solid #E2E8F0', borderRadius: 8, fontSize: 13, outline: 'none' }}
            />
          </div>
          <div className={styles.regionRow}>
            <span style={{ fontSize: 12, color: '#64748B', fontWeight: 600 }}>Region</span>
            {REGIONS.map((r) => {
              const active = region === r.code;
              return (
                <button
                  key={r.code}
                  type="button"
                  onClick={() => setRegion(r.code)}
                  title={r.label}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                    background: active ? '#2E7D32' : '#F1F5F9', color: active ? '#fff' : '#64748B',
                    border: `1px solid ${active ? '#2E7D32' : '#E2E8F0'}`, cursor: 'pointer', transition: 'all .2s',
                  }}
                >
                  <img src={r.flag} alt={r.code} title={r.label} style={{ width: 16, height: 11, borderRadius: 2, objectFit: 'cover' }} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                  {r.code}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Product Grid ── */}
        <ScrollReveal delay={100}>
          {loading ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#64748B' }}>Loading...</div>
          ) : error ? (
            <div style={{ padding: 40, textAlign: 'center' }}>
              <p style={{ color: '#64748B' }}>{error}</p>
              <button type="button" className={styles.viewButton} onClick={load}>Retry</button>
            </div>
          ) : visible.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#64748B' }}>No products match these filters.</div>
          ) : category === '' ? (
            <div style={{ padding: '0 20px 20px' }}>
              {/* Group by the categories that actually exist in the data (never a
                  hardcoded list) so a product with any category value always shows. */}
              {[...new Set(visible.map((p) => p.category))].map((cat) => {
                const catProducts = visible.filter((p) => p.category === cat);
                if (catProducts.length === 0) return null;
                const { emoji: catEmoji, color: catColor, bg: catBg } = categoryStyle(cat);
                return (
                  <div key={cat} style={{ marginBottom: 32 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, padding: '10px 16px', background: catBg, borderRadius: 10, border: `1px solid ${catColor}20` }}>
                      <span style={{ fontSize: 20 }}>{catEmoji}</span>
                      <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: catColor }}>{cat.trim() || 'Uncategorized'}</h3>
                      <span style={{ fontSize: 12, fontWeight: 600, color: catColor, background: `${catColor}15`, padding: '2px 10px', borderRadius: 20 }}>{catProducts.length}</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 18 }} className={styles.productGrid}>
                      {catProducts.map((p, idx) => {
                        const q = stockOf(p);
                        const stockLabel = q !== null ? (q <= 0 ? 'Out of Stock' : q <= 20 ? 'Low Stock' : 'In Stock') : '';
                        const stockColor = q !== null ? (q <= 0 ? '#DC2626' : q <= 20 ? '#D97706' : '#16A34A') : '#64748B';
                        const stockBg = q !== null ? (q <= 0 ? '#FEE2E2' : q <= 20 ? '#FEF3C7' : '#DCFCE7') : '#F1F5F9';
                        return (
                          <ScrollReveal key={p.id} delay={Math.min(idx * 60, 600)}>
                          <div
                            onClick={() => openDetail(p)}
                            style={{
                              background: '#F1F8F1', border: '1px solid #D5E8D4', borderRadius: 14, overflow: 'hidden',
                              cursor: 'pointer', transition: 'all .2s', boxShadow: '0 1px 3px rgba(0,0,0,.06)',
                            }}
                            className={styles.productCard}
                          >
                            <div style={{ height: 150, background: '#F7FAF7', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', borderBottom: '1px solid #D5E8D4' }}>
                              {p.imageUrl && (
                                <img src={p.imageUrl} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={onProductImgError} />
                              )}
                              <span style={{ fontSize: 46, display: p.imageUrl ? 'none' : 'block' }}>📦</span>
                            </div>
                            <div style={{ padding: '12px 14px' }}>
                              <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
                              <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 2 }}>{p.sku}</div>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8, fontSize: 12, color: '#64748b' }}>
                                <span>{p.category}</span>
                                <span style={{ fontSize: 15, fontWeight: 700, color: '#134B2F' }}>{regionSymbol}{regionPrice(p).price.toLocaleString()} <span style={{ fontSize: 12, fontWeight: 400, color: '#64748B' }}>/ {p.unit}</span></span>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10, paddingTop: 10, borderTop: '1px solid #D5E8D4' }}>
                                {q !== null && (
                                  <span style={{ fontSize: 12, padding: '3px 10px', borderRadius: 20, background: stockBg, color: stockColor, fontWeight: 600 }}>
                                    {stockLabel}
                                  </span>
                                )}
                                <button
                                  type="button"
                                  onClick={(e) => { e.stopPropagation(); openDetail(p); }}
                                  className={styles.viewBtn}
                                  title="View"
                                >
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                                </button>
                              </div>
                            </div>
                          </div>
                          </ScrollReveal>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 18, padding: 20 }} className={styles.productGrid}>
              {paged.map((p, idx) => {
                const q = stockOf(p);
                const stockLabel = q !== null ? (q <= 0 ? 'Out of Stock' : q <= 20 ? 'Low Stock' : 'In Stock') : '';
                const stockColor = q !== null ? (q <= 0 ? '#DC2626' : q <= 20 ? '#D97706' : '#16A34A') : '#64748B';
                const stockBg = q !== null ? (q <= 0 ? '#FEE2E2' : q <= 20 ? '#FEF3C7' : '#DCFCE7') : '#F1F5F9';
                return (
                  <ScrollReveal key={p.id} delay={Math.min(idx * 60, 600)}>
                  <div
                    onClick={() => openDetail(p)}
                    style={{
                      background: '#F1F8F1', border: '1px solid #D5E8D4', borderRadius: 14, overflow: 'hidden',
                      cursor: 'pointer', transition: 'all .2s', boxShadow: '0 1px 3px rgba(0,0,0,.06)',
                    }}
                    className={styles.productCard}
                  >
                    <div style={{ height: 150, background: '#F7FAF7', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', borderBottom: '1px solid #D5E8D4' }}>
                      {p.imageUrl && (
                        <img src={p.imageUrl} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={onProductImgError} />
                      )}
                      <span style={{ fontSize: 46, display: p.imageUrl ? 'none' : 'block' }}>📦</span>
                    </div>
                    <div style={{ padding: '12px 14px' }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
                      <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 2 }}>{p.sku}</div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8, fontSize: 12, color: '#64748b' }}>
                        <span>{p.category}</span>
                        <span style={{ fontSize: 15, fontWeight: 700, color: '#134B2F' }}>{regionSymbol}{regionPrice(p).price.toLocaleString()} <span style={{ fontSize: 12, fontWeight: 400, color: '#64748B' }}>/ {p.unit}</span></span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10, paddingTop: 10, borderTop: '1px solid #D5E8D4' }}>
                        {q !== null && (
                          <span style={{ fontSize: 12, padding: '3px 10px', borderRadius: 20, background: stockBg, color: stockColor, fontWeight: 600 }}>
                            {stockLabel}
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); openDetail(p); }}
                          className={styles.viewBtn}
                          title="View"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                        </button>
                      </div>
                    </div>
                  </div>
                  </ScrollReveal>
                );
              })}
            </div>
          )}
        </ScrollReveal>

        {/* ── Pagination ── */}
        {showPager && (
          <div style={{ display: 'flex', gap: 4, alignItems: 'center', justifyContent: 'center', padding: '12px 20px', borderTop: '1px solid #E2E8F0' }}>
            <button type="button" className={styles.viewButton} disabled={safePage === 0} onClick={() => setPage(safePage - 1)}>Prev</button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                type="button"
                className={styles.viewButton}
                style={i === safePage ? {} : { background: '#F1F5F9', color: '#64748B' }}
                onClick={() => setPage(i)}
              >
                {i + 1}
              </button>
            ))}
            <button type="button" className={styles.viewButton} disabled={safePage + 1 >= totalPages} onClick={() => setPage(safePage + 1)}>Next</button>
          </div>
        )}
      </div>

      {selected && (() => {
        const stats = orderStats(selected);
        const qty = stockOf(selected);

        const countryFlags: Record<string, { img: string; label: string; name: string; currency: string; symbol: string }> = {
          IN: { img: '/images/in-flag.svg', label: 'IN', name: 'INDIA', currency: '₹', symbol: '₹' },
          US: { img: '/images/us-flag.svg', label: 'US', name: 'USA', currency: '$', symbol: '$' },
          AE: { img: '/images/uae-flag.svg', label: 'UAE', name: 'UAE', currency: 'AED', symbol: 'AED ' },
          SG: { img: '/images/sg-flag.svg', label: 'SG', name: 'SINGAPORE', currency: 'S$', symbol: 'S$' },
        };
        // (fake INR rates removed — real per-region prices come from selected.prices)
        const stockLabel = qty !== null ? (qty <= 0 ? 'Out of Stock' : qty <= 20 ? 'Low Stock' : 'In Stock') : 'N/A';
        const stockColor = qty !== null ? (qty <= 0 ? '#EF4444' : qty <= 20 ? '#F59E0B' : '#22C55E') : '#94A3B8';

        const countryOrders = ['IN', 'US', 'AE', 'SG'].map((code) => {
          let orders = 0, units = 0, revenue = 0;
          for (const o of []) {
            if (o.countryCode !== code) continue;
            orders += 1;
            // item-level detail removed; real stats await backend item APIs
          }
          return { code, orders, units, revenue, avg: orders > 0 ? revenue / orders : 0 };
        }).filter((c) => c.orders > 0 || countryFlags[c.code]);

        return (
          <>
            {/* Overlay */}
            <div onClick={() => setSelected(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', zIndex: 999 }} />

            {/* Slide-in Panel */}
            <div style={{
              position: 'fixed', top: 0, right: 0, width: '34vw', minWidth: 380, maxWidth: 520, height: '100vh',
              background: 'linear-gradient(180deg, #0f3d1e 0%, #134B2F 30%, #0d3a1b 100%)',
              zIndex: 1000, display: 'flex', flexDirection: 'column', boxShadow: '-4px 0 30px rgba(0,0,0,.3)',
            }} className={styles.productDetailPanel}>

              {/* ── Header ── */}
              <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid rgba(255,255,255,.1)', flexShrink: 0, display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 64, height: 64, borderRadius: 12, overflow: 'hidden', flexShrink: 0, background: 'rgba(255,255,255,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {selected.imageUrl ? (
                    <img src={selected.imageUrl} alt={selected.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span style={{ fontSize: 28 }}>📦</span>
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 18, fontWeight: 700, color: '#fff' }}>{selected.name}</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,.6)', marginTop: 2 }}>{selected.sku}</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,.6)' }}>{selected.category}</div>
                </div>
                <button onClick={() => setSelected(null)} style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid rgba(255,255,255,.2)', background: 'rgba(255,255,255,.1)', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }} title="Close">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                </button>
              </div>

              {/* ── Scrollable Body ── */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px 24px' }}>

                {/* Country Price Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 24 }}>
                  {['IN', 'US', 'AE', 'SG'].map((code) => {
                    const c = countryFlags[code];
                    const converted = selected.prices?.[code]?.price ?? selected.basePrice;
                    const stockQ = qty !== null ? qty : 0;
                    const sLabel = stockQ <= 0 ? 'Out of Stock' : stockQ <= 20 ? 'Low Stock' : 'In Stock';
                    const sColor = stockQ <= 0 ? '#EF4444' : stockQ <= 20 ? '#F59E0B' : '#22C55E';
                    return (
                      <div key={code} style={{ background: 'rgba(255,255,255,.1)', border: '1px solid rgba(255,255,255,.12)', borderRadius: 12, padding: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                          <img src={c.img} alt="" style={{ width: 24, height: 16, borderRadius: 2, objectFit: 'cover' }} />
                          <span style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>{c.label}</span>
                        </div>
                        <div style={{ fontSize: 24, fontWeight: 800, color: '#fff', lineHeight: 1 }}>{c.symbol}{converted.toFixed(2)}</div>
                        <div style={{ fontSize: 11, color: 'rgba(255,255,255,.5)', marginTop: 4 }}>/ {selected.unit}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 10 }}>
                          <span style={{ width: 7, height: 7, borderRadius: '50%', background: sColor, flexShrink: 0 }} />
                          <span style={{ fontSize: 11, color: 'rgba(255,255,255,.7)' }}>{sLabel} ({stockQ} {selected.unit})</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Country-wise Order Details */}
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,.6)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 14 }}>Country-wise Order Details</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
                    {countryOrders.map((co) => {
                      const c = countryFlags[co.code];
                      return (
                        <div key={co.code} style={{ background: 'rgba(255,255,255,.1)', border: '1px solid rgba(255,255,255,.12)', borderRadius: 12, padding: 14 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                            <img src={c.img} alt="" style={{ width: 22, height: 15, borderRadius: 2, objectFit: 'cover' }} />
                            <span style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>{c.label}</span>
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                            {[
                              { label: 'TOTAL ORDERS', value: co.orders },
                              { label: 'TOTAL REVENUE', value: `${c.symbol}${co.revenue.toLocaleString()}` },
                              { label: 'TOTAL UNITS SOLD', value: co.units },
                              { label: 'AVG ORDER VALUE', value: `${c.symbol}${co.avg.toFixed(2)}` },
                            ].map((m) => (
                              <div key={m.label} style={{ background: 'rgba(255,255,255,.07)', borderRadius: 8, padding: '8px 10px' }}>
                                <div style={{ fontSize: 9, color: 'rgba(255,255,255,.5)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 3 }}>{m.label}</div>
                                <div style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>{m.value}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>


              </div>

              {/* ── Footer Actions ── */}
              <div style={{ padding: '12px 24px', borderTop: '1px solid rgba(255,255,255,.1)', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {priceEdit && (
                  <div style={{ background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.14)', borderRadius: 10, padding: '12px 14px' }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,.75)', marginBottom: 6 }}>
                      Price · {REGIONS.find((r) => r.code === region)?.label} ({regionSymbol.trim()} · {region})
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <input
                        autoFocus
                        value={priceDraft}
                        onChange={(e) => setPriceDraft(e.target.value)}
                        inputMode="decimal"
                        onKeyDown={(e) => { if (e.key === 'Enter') void confirmPrice(); }}
                        style={{ flex: 1, minWidth: 0, padding: '8px 10px', borderRadius: 8, border: '1px solid rgba(255,255,255,.2)', background: 'rgba(0,0,0,.25)', color: '#fff', fontSize: 14 }}
                      />
                      <button
                        type="button"
                        onClick={() => void confirmPrice()}
                        disabled={saving}
                        style={{ padding: '8px 14px', borderRadius: 8, border: 'none', background: '#22C55E', color: '#0b2f1a', fontWeight: 700, cursor: 'pointer', fontSize: 13, opacity: saving ? 0.6 : 1 }}
                      >
                        {saving ? 'Saving…' : 'Save'}
                      </button>
                      <button
                        type="button"
                        onClick={() => { setPriceEdit(false); setPriceError(''); }}
                        style={{ padding: '8px 14px', borderRadius: 8, border: '1px solid rgba(255,255,255,.25)', background: 'transparent', color: '#fff', cursor: 'pointer', fontSize: 13 }}
                      >
                        Cancel
                      </button>
                    </div>
                    {priceError && <div style={{ fontSize: 12, color: '#FCA5A5', marginTop: 6 }}>{priceError}</div>}
                  </div>
                )}
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    type="button"
                    onClick={() => openEdit(selected)}
                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '9px 10px', borderRadius: 9, border: '1px solid rgba(255,255,255,.25)', background: 'rgba(255,255,255,.1)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.83 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" /></svg>
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => { setPriceEdit(true); setPriceDraft(String(regionPrice(selected).price)); setPriceError(''); }}
                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '9px 10px', borderRadius: 9, border: '1px solid rgba(237,221,94,.45)', background: 'rgba(237,221,94,.12)', color: '#EDDD5E', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.83z" /><line x1="7" y1="7" x2="7.01" y2="7" /></svg>
                    Price
                  </button>
                  <button
                    type="button"
                    onClick={() => void deleteProduct(selected)}
                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '9px 10px', borderRadius: 9, border: '1px solid rgba(239,68,68,.5)', background: 'rgba(239,68,68,.12)', color: '#FCA5A5', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                    Delete
                  </button>
                </div>
                <button type="button" onClick={() => setSelected(null)} style={{ width: '100%', padding: '10px', borderRadius: 10, border: '1px solid rgba(255,255,255,.2)', background: 'transparent', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Close</button>
              </div>
            </div>
          </>
        );
      })()}

      {(creating || editing) && (
        <Modal title={editing ? `Edit ${editing.name}` : 'Add New Product'} onClose={() => { setCreating(false); setEditing(null); }}>
          {formError && <p style={{ color: '#DC2626', fontSize: 13 }}>{formError}</p>}
          <form onSubmit={(e) => void handleSubmit(e)}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: 12, marginBottom: 12 }}>
              <div style={{ gridColumn: '1/-1' }}>
                <label style={{ display: 'block', fontSize: 12, marginBottom: 4 }}>Product Name *</label>
                <input required value={form.name} placeholder="e.g. Organic Ginger" onChange={(e) => setForm({ ...form, name: e.target.value })} style={{ width: '100%', padding: '8px 12px' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, marginBottom: 4 }}>Category *</label>
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                  <option value="">Select…</option>
                  {categories.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, marginBottom: 4 }}>Price ({regionSymbol.trim()} · {region}) *</label>
                <input required value={form.basePrice} placeholder="0.00" onChange={(e) => setForm({ ...form, basePrice: e.target.value })} style={{ width: '100%', padding: '8px 12px' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, marginBottom: 4 }}>Stock Qty</label>
                <input value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} style={{ width: '100%', padding: '8px 12px' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, marginBottom: 4 }}>Unit</label>
                <input value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} style={{ width: '100%', padding: '8px 12px' }} />
              </div>
              {!editing && (
                <>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, marginBottom: 4 }}>SKU (auto if empty)</label>
                    <input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} style={{ width: '100%', padding: '8px 12px' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, marginBottom: 4 }}>Emoji</label>
                    <input value={form.emoji} onChange={(e) => setForm({ ...form, emoji: e.target.value })} style={{ width: '100%', padding: '8px 12px' }} />
                  </div>
                </>
              )}
              {editing && (
                <div>
                  <label style={{ display: 'block', fontSize: 12, marginBottom: 4 }}>SKU</label>
                  <input value={form.sku} disabled onChange={(e) => setForm({ ...form, sku: e.target.value })} style={{ width: '100%', padding: '8px 12px' }} />
                </div>
              )}
              <div>
                <label style={{ display: 'block', fontSize: 12, marginBottom: 4 }}>Description</label>
                <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} style={{ width: '100%', padding: '8px 12px' }} />
              </div>
              <div style={{ gridColumn: '1/-1' }}>
                <label style={{ display: 'block', fontSize: 12, marginBottom: 4 }}>Product Image</label>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <div style={{ width: 72, height: 72, borderRadius: 8, overflow: 'hidden', background: '#F7FAF7', border: '1px solid #D5E8D4', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {form.imageUrl ? (
                      <img src={assetUrl(form.imageUrl)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <span style={{ fontSize: 30 }}>{form.emoji || '🛒'}</span>
                    )}
                  </div>
                  <label style={{ padding: '7px 14px', borderRadius: 8, border: '1px solid #134B2F', color: '#134B2F', fontSize: 13, fontWeight: 600, cursor: uploadingImage ? 'wait' : 'pointer', opacity: uploadingImage ? 0.6 : 1 }}>
                    {uploadingImage ? 'Uploading…' : 'Upload image'}
                    <input type="file" accept="image/*" hidden disabled={uploadingImage} onChange={pickProductImage()} />
                  </label>
                  {form.imageUrl && (
                    <button type="button" onClick={() => setForm((f) => ({ ...f, imageUrl: '' }))} style={{ padding: '7px 14px', borderRadius: 8, border: '1px solid #D5E8D4', background: 'transparent', color: '#64748B', fontSize: 13, cursor: 'pointer' }}>
                      Remove
                    </button>
                  )}
                </div>
              </div>
            </div>
            {editing && (
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 13 }}><input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} /> Active</label>
              </div>
            )}
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button type="button" className={styles.viewButton} onClick={() => { setCreating(false); setEditing(null); }}>Cancel</button>
              <button type="submit" className={styles.viewButton} disabled={saving}>{saving ? 'Saving...' : editing ? 'Save' : 'Add Product'}</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

function SalesBars({ productName }: { productName: string }) {
  const [bars, setBars] = useState<{ label: string; revenue: number }[]>([]);
  useEffect(() => {
    try {
      const byDay = new Map<string, number>();
      // sales stats removed — await item-level APIs
      const days = [...byDay.entries()].sort().slice(-7);
      const max = Math.max(1, ...days.map(([, v]) => v));
      setBars(days.map(([label, revenue]) => ({ label: label.slice(5), revenue: Math.max(4, Math.round((revenue / max) * 100)) })));
    } catch {
      setBars([]);
    }
  }, [productName]);
  if (bars.length === 0) return <p style={{ fontSize: 13, color: 'rgba(255,255,255,.4)' }}>No sales recorded yet</p>;
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 100 }}>
      {bars.map((b) => (
        <div key={b.label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <div style={{ width: '100%', maxWidth: 36, height: `${b.revenue}%`, minHeight: 4, background: '#22C55E', borderRadius: '4px 4px 0 0', opacity: 0.8 }} />
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,.5)' }}>{b.label}</span>
        </div>
      ))}
    </div>
  );
}
