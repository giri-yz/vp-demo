import type {
  AdminCustomer,
  AdminInventoryItem,
  AdminOrderDetail,
  AdminOrderSummary,
  AdminProduct,
  AdminRole,
  AdminUserSummary,
  B2BEnquiry,
  Category,
  ContactMessage,
  DashboardSummary,
  PageResponse,
  StoreSettings,
  Testimonial,
} from '../../types';
import type { TestimonialInput } from '../adminTestimonialsApi';
import type { CreateProductInput, ListAdminProductsParams, UpdateProductInput } from '../adminProductsApi';
import type { ListAdminOrdersParams } from '../adminOrdersApi';
import { invalidateCollection, loadCollection, loadCollectionVersioned, saveCollection } from './demoStore';
/*
 * demoData.ts (bundled demo seed rows) was removed upstream. The record shapes
 * and option lists the admin UI imports from this module are declared here, and
 * every demo collection now seeds empty: rows come from the live API, or from
 * edits the user persisted in localStorage while the backend is unreachable.
 */
export const DEMO_MODULES = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'orders', label: 'Orders' },
  { key: 'products', label: 'Products' },
  { key: 'users', label: 'Users' },
  { key: 'reports', label: 'Reports' },
  { key: 'support', label: 'Support' },
];

export const DEMO_PERMISSIONS = [
  { key: 'view', label: 'View' },
  { key: 'edit', label: 'Edit' },
  { key: 'delete', label: 'Delete' },
  { key: 'hide', label: 'Hide / Show' },
  { key: 'export', label: 'Export' },
];

export interface DemoSubAdmin {
  id: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  country: string;
  role: string;
  modules: string[];
  permissions: string[];
  status: string;
  lastLogin: string;
  createdDate: string;
}

export interface DemoCountry {
  id: string;
  name: string;
  code: string;
  flag: string;
  flagImg: string;
  currency: string;
  currencyCode: string;
  currencySymbol: string;
  phoneCode: string;
  language: string;
  timezone: string;
  orders: number;
  revenue: string;
  customers: number;
  admin: string;
  adminEmail: string;
  status: 'active' | 'inactive';
  cities: string;
  createdDate: string;
  lastUpdatedDate: string;
  details: string;
}

export interface DemoAdminMessage {
  id: string;
  from: string;
  fromEmail: string;
  to: string;
  subject: string;
  body: string;
  ts: string;
  read: boolean;
  starred: boolean;
  sender: 'super' | string;
  status?: string;
  priority?: string;
  time?: string;
}

export interface DemoLog {
  id: string;
  timestamp: string;
  user: string;
  role: string;
  category: string;
  details: string;
  country: string;
  ipAddress: string;
  status: string;
  action: string;
}

export interface DemoSubscriber {
  id: string;
  name: string;
  email: string;
  phone: string;
  country: string;
  source: string;
  subscribed: string;
  status: 'subscribed' | 'unsubscribed';
}

export interface DemoGeoInventoryItem { name: string; qty: number; }
export interface DemoGeoTopProduct { name: string; category: string; revenue: number; share: number; }
export interface DemoGeoPoorProduct { name: string; category: string; revenue: number; status: string; }
export interface DemoGeoCity {
  name: string; revenue: number; orders: number; units: number; customers: number; growth: string;
  subscribers: number; activeSubs: number; unsubs: number; subRetention: number; activeRate: number;
  delivered: number; inTransit: number; cancelled: number; avgOrder: number;
  bestSeller: string; categoriesSold: number; salesGrowth: string;
  newCustomers: number; repeatCustomers: number; retentionRate: number; revPerCustomer: number;
  topProducts: DemoGeoTopProduct[]; poorProducts: DemoGeoPoorProduct[];
  lowStock: DemoGeoInventoryItem[]; highStock: DemoGeoInventoryItem[]; totalStockUnits: number;
  sixMonthTrend: { month: string; revenue: number }[];
}
export interface DemoGeoState {
  name: string; revenue: number; orders: number; units: number; customers: number; growth: string;
  subscribers: number; activeSubs: number; unsubs: number; subRetention: number; activeRate: number;
  delivered: number; inTransit: number; cancelled: number; avgOrder: number;
  bestSeller: string; categoriesSold: number; salesGrowth: string;
  newCustomers: number; repeatCustomers: number; retentionRate: number; revPerCustomer: number;
  topProducts: DemoGeoTopProduct[]; poorProducts: DemoGeoPoorProduct[];
  lowStock: DemoGeoInventoryItem[]; highStock: DemoGeoInventoryItem[]; totalStockUnits: number;
  sixMonthTrend: { month: string; revenue: number }[];
  cities: DemoGeoCity[];
}

export interface DemoNote {
  id: string;
  userId: string;
  text: string;
  at: string;
}

export interface DemoUserAddress {
  id: string;
  userId: string;
  label: string;
  line: string;
  city: string;
}

export interface DemoSession {
  id: string;
  country: string;
  device: string;
  location: string;
  time: string;
  current: boolean;
}

export interface DemoPrefs {
  country: string;
  emailToggles: Record<string, boolean>;
  digest: string;
  quietFrom: string;
  quietTo: string;
  language: string;
  timezone: string;
  dateFormat: string;
  currency: string;
  weight: string;
  theme: string;
  density: string;
  twoFA: boolean;
}

export interface DemoReportCustomer {
  name: string; email: string; orders: number; spent: number; joined: string; status: 'Active' | 'Inactive';
}
export interface DemoReportInventoryItem {
  product: string; category: string; stock: number; sold: number; status: 'In Stock' | 'Low Stock' | 'Out of Stock';
}
export interface DemoReportRestock {
  product: string; current: number; recommended: number; priority: 'High' | 'Medium' | 'Low';
}
export interface DemoReportOverview {
  totalUsers: number; activeUsers: number; activeRate: number;
  newSignups: number; newSignupsGrowth: string;
  retentionRate: number; retentionGrowth: string;
  monthlyGrowth: { month: string; users: number }[];
  newVsReturning: { newPct: number; returningPct: number };
  customerList: DemoReportCustomer[];
  inventoryStatus: DemoReportInventoryItem[];
  restockRecs: DemoReportRestock[];
}

/* Empty seeds — no bundled demo rows. */
const DEMO_ADMIN_USERS: AdminUserSummary[] = [];
const DEMO_B2B: B2BEnquiry[] = [];
const DEMO_CATEGORIES: Category[] = [];
const DEMO_CUSTOMERS: AdminCustomer[] = [];
const DEMO_GEO: Record<string, { label: string; states: DemoGeoState[] }> = {};
const DEMO_INVENTORY: AdminInventoryItem[] = [];
const DEMO_LOGS: DemoLog[] = [];
const DEMO_MESSAGES: ContactMessage[] = [];
const DEMO_NOTES: DemoNote[] = [];
const DEMO_ORDER_DETAILS: AdminOrderDetail[] = [];
const DEMO_PREFS: DemoPrefs[] = [];
const DEMO_PRODUCTS: AdminProduct[] = [];
const DEMO_SESSIONS: DemoSession[] = [];
const DEMO_SUBSCRIBERS: DemoSubscriber[] = [];
const DEMO_SUB_ADMINS: DemoSubAdmin[] = [];
const DEMO_TESTIMONIALS: Testimonial[] = [];
const DEMO_USER_ADDRESSES: DemoUserAddress[] = [];
const DEMO_ADMIN_MESSAGES: DemoAdminMessage[] = [];
const DEMO_COUNTRIES: DemoCountry[] = [];
const DEMO_REPORTS: Record<string, DemoReportOverview> = {};
const DEMO_SETTINGS: StoreSettings = {
  websiteName: null,
  tagline: null,
  defaultCurrency: 'USD',
  timezone: null,
  dateFormat: null,
  timeFormat: null,
  websiteEmail: null,
  websitePhone: null,
  storeName: null,
  storeEmail: null,
  storePhone: null,
  storeAddress: null,
  storeDescription: null,
  freeShippingThreshold: null,
  standardShippingRate: null,
  expressShippingRate: null,
  defaultDeliveryDays: null,
  facebookUrl: null,
  instagramUrl: null,
  twitterUrl: null,
  youtubeUrl: null,
  whatsappUrl: null,
  telegramUrl: null,
  smallBoxStandardSlots: null,
  smallBoxPremiumRate: null,
  bigBoxMinKg: null,
  bigBoxDiscountRate: null,
};

/* Neutral (all-zero) report used when no report rows exist for a country. */
const EMPTY_REPORT_OVERVIEW: DemoReportOverview = {
  totalUsers: 0,
  activeUsers: 0,
  activeRate: 0,
  newSignups: 0,
  newSignupsGrowth: '0%',
  retentionRate: 0,
  retentionGrowth: '0%',
  monthlyGrowth: [],
  newVsReturning: { newPct: 0, returningPct: 0 },
  customerList: [],
  inventoryStatus: [],
  restockRecs: [],
};

function paginate<T>(items: T[], page = 0, size = 10): PageResponse<T> {
  const totalElements = items.length;
  const totalPages = Math.max(1, Math.ceil(totalElements / size));
  return { content: items.slice(page * size, page * size + size), page, size, totalElements, totalPages };
}

function uid(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.floor(Math.random() * 1000)}`;
}

function slugify(name: string): string {
  return name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

/* ---------- Orders ---------- */

function orderDetails(): AdminOrderDetail[] {
  const ORDER_SEED_VERSION = 2;
  const versionKey = 'vpnexues-demo-orders-version';
  try {
    const v = parseInt(localStorage.getItem(versionKey) ?? '0', 10);
    if (v < ORDER_SEED_VERSION) {
      localStorage.removeItem('vpnexues-demo-orders');
      localStorage.setItem(versionKey, String(ORDER_SEED_VERSION));
      invalidateCollection('orders');
    }
  } catch { /* ignore */ }
  return loadCollection<AdminOrderDetail>('orders', () => DEMO_ORDER_DETAILS.map((o) => ({ ...o })));
}

function toSummary(o: AdminOrderDetail): AdminOrderSummary {
  return {
    id: o.id, orderNumber: o.orderNumber, buyerName: o.buyer.name, buyerPhone: o.buyer.phone,
    countryCode: o.countryCode, channel: o.channel, status: o.status,
    grandTotal: o.grandTotal, createdAt: o.createdAt,
  };
}

export function demoListOrders(params: ListAdminOrdersParams): PageResponse<AdminOrderSummary> {
  let items = orderDetails();
  if (params.country) items = items.filter((o) => o.countryCode === params.country);
  if (params.status) items = items.filter((o) => o.status === params.status);
  if (params.channel) items = items.filter((o) => o.channel === params.channel);
  if (params.dateFrom) items = items.filter((o) => o.createdAt >= params.dateFrom!);
  if (params.dateTo) items = items.filter((o) => o.createdAt <= params.dateTo!);
  items = [...items].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  return paginate(items.map(toSummary), params.page, params.size);
}

export function demoGetOrder(id: string): AdminOrderDetail {
  const found = orderDetails().find((o) => o.id === id);
  if (!found) throw new Error('Order not found.');
  return found;
}

export function demoUpdateOrderStatus(id: string, status: string): AdminOrderDetail {
  const items = orderDetails();
  const order = items.find((o) => o.id === id);
  if (!order) throw new Error('Order not found.');
  order.status = status;
  saveCollection('orders', items);
  return order;
}

/* ---------- Products ---------- */

function products(): AdminProduct[] {
  const PRODUCT_SEED_VERSION = 4;
  const versionKey = 'vpnexues-demo-products-version';
  try {
    const v = parseInt(localStorage.getItem(versionKey) ?? '0', 10);
    if (v < PRODUCT_SEED_VERSION) {
      localStorage.removeItem('vpnexues-demo-products');
      localStorage.setItem(versionKey, String(PRODUCT_SEED_VERSION));
      invalidateCollection('products');
    }
  } catch { /* ignore */ }
  return loadCollectionVersioned<AdminProduct>('products', '3', () => DEMO_PRODUCTS.map((p) => ({ ...p })));
}

export function demoListProducts(params: ListAdminProductsParams): PageResponse<AdminProduct> {
  let items = products();
  if (params.category) items = items.filter((p) => p.category === params.category);
  if (params.search) {
    const q = params.search.toLowerCase();
    items = items.filter((p) => p.name.toLowerCase().includes(q));
  }
  return paginate(items, params.page, params.size);
}

export function demoCreateProduct(input: CreateProductInput): AdminProduct {
  const items = products();
  const product: AdminProduct = {
    id: uid('demo-prod'), slug: input.slug || slugify(input.name), description: input.description ?? null,
    oldPrice: input.oldPrice ?? null, imageUrl: input.imageUrl ?? null,
    discountPct: input.discountPct ?? null, badges: input.badges ?? [],
    name: input.name, category: input.category, basePrice: input.basePrice,
    unit: input.unit, sku: input.sku, active: true, createdAt: new Date().toISOString(),
  };
  items.unshift(product);
  saveCollection('products', items);
  return product;
}

export function demoUpdateProduct(id: string, input: UpdateProductInput): AdminProduct {
  const items = products();
  const product = items.find((p) => p.id === id);
  if (!product) throw new Error('Product not found.');
  const oldPrice = product.basePrice;
  Object.assign(product, {
    name: input.name, category: input.category, description: input.description ?? null,
    basePrice: input.basePrice, oldPrice: input.oldPrice ?? null, unit: input.unit,
    imageUrl: input.imageUrl ?? null, discountPct: input.discountPct ?? null,
    badges: input.badges ?? [], active: input.active,
  });
  saveCollection('products', items);
  if (oldPrice !== input.basePrice) {
    const hist = loadCollection<{ productId: string; oldPrice: number; newPrice: number; at: string; by: string }>('price-history', () => []);
    hist.unshift({ productId: id, oldPrice, newPrice: input.basePrice, at: new Date().toISOString(), by: 'admin' });
    saveCollection('price-history', hist.slice(0, 200));
  }
  return product;
}

export function demoListPriceHistory(productId: string): { productId: string; oldPrice: number; newPrice: number; at: string; by: string }[] {
  return loadCollection<{ productId: string; oldPrice: number; newPrice: number; at: string; by: string }>('price-history', () => []).filter(
    (h) => h.productId === productId,
  );
}

export interface DemoUserMeta {
  address: string;
  status: 'active' | 'pending' | 'inactive';
  verification: string;
}

const META_SEEDS: Record<string, Partial<DemoUserMeta>> = {
  'demo-cust-IN-0': { address: '14 Rosewood Apartments, Mumbai' },
  'demo-cust-IN-1': { address: '27 Station Road, Chennai' },
  'demo-cust-IN-2': { address: '5 Green Park Colony, Delhi' },
  'demo-cust-IN-3': { address: '8 MG Road, Bengaluru' },
  'demo-cust-IN-4': { address: '3 Jubilee Hills, Hyderabad' },
  'demo-cust-SG-0': { address: 'Blk 123 Tampines St, Tampines' },
  'demo-cust-SG-1': { address: '18 Jurong West Ave, Jurong', status: 'pending', verification: 'pending' },
  'demo-cust-SG-2': { address: '42 Bedok North St, Bedok' },
  'demo-cust-SG-3': { address: '7 Woodlands Drive, Woodlands' },
  'demo-cust-SG-4': { address: '9 Serangoon Central, Serangoon' },
  'demo-cust-AE-0': { address: '21 Sheikh Zayed Rd, Dubai' },
  'demo-cust-AE-1': { address: '15 Corniche Road, Abu Dhabi', status: 'pending', verification: 'pending' },
  'demo-cust-AE-2': { address: '33 King Faisal St, Sharjah' },
  'demo-cust-AE-3': { address: '11 Al Nahda St, Dubai' },
  'demo-cust-AE-4': { address: '6 Sheikh Mubarak St, Ajman' },
  'demo-cust-US-0': { address: '350 Fifth Avenue, New York' },
  'demo-cust-US-1': { address: '233 S Wacker Dr, Chicago' },
  'demo-cust-US-2': { address: '1 Market St, San Francisco', status: 'inactive', verification: 'verified' },
  'demo-cust-US-3': { address: '1000 Main St, Houston' },
  'demo-cust-US-4': { address: '400 Pine St, Seattle' },
};

function userMeta(): Record<string, DemoUserMeta> {
  const stored = loadCollection<{ id: string; meta: DemoUserMeta }>('user-meta', () =>
    Object.entries(META_SEEDS).map(([id, m]) => ({
      id,
      meta: { address: '—', status: 'active', verification: 'verified', ...m } as DemoUserMeta,
    })),
  );
  let changed = false;
  const merged = stored.map((s) => {
    const seed = META_SEEDS[s.id];
    if (seed?.address && s.meta.address === '—') {
      changed = true;
      return { ...s, meta: { ...s.meta, address: seed.address } };
    }
    return s;
  });
  if (changed) saveCollection('user-meta', merged);
  return Object.fromEntries(merged.map((s) => [s.id, s.meta]));
}

function saveUserMeta(map: Record<string, DemoUserMeta>): void {
  saveCollection(
    'user-meta',
    Object.entries(map).map(([id, meta]) => ({ id, meta })),
  );
}

export function demoGetUserMeta(id: string): DemoUserMeta {
  return userMeta()[id] ?? { address: '—', status: 'active', verification: 'verified' };
}

export function demoSaveUserMeta(id: string, patch: Partial<DemoUserMeta>): DemoUserMeta {
  const map = userMeta();
  map[id] = { ...demoGetUserMeta(id), ...patch };
  saveUserMeta(map);
  return map[id];
}

export function demoDeactivateProduct(id: string): void {
  const items = products();
  const product = items.find((p) => p.id === id);
  if (!product) throw new Error('Product not found.');
  product.active = false;
  saveCollection('products', items);
}

/** Demo/offline twin of the visibility endpoint — flips `active` and returns the updated row. */
export function demoSetProductVisibility(id: string, active: boolean): AdminProduct {
  const items = products();
  const product = items.find((p) => p.id === id);
  if (!product) throw new Error('Product not found.');
  product.active = active;
  saveCollection('products', items);
  return { ...product };
}

/* ---------- Categories ---------- */

function categories(): Category[] {
  return loadCollection<Category>('categories', () => DEMO_CATEGORIES.map((c) => ({ ...c })));
}

export function demoListCategories(): Category[] {
  return categories();
}

export function demoCreateCategory(input: { name: string; slug?: string; emoji?: string }): Category {
  const items = categories();
  const cat: Category = { id: uid('demo-cat'), name: input.name, slug: input.slug || slugify(input.name), emoji: input.emoji ?? null, active: true };
  items.push(cat);
  saveCollection('categories', items);
  return cat;
}

export function demoUpdateCategory(id: string, input: { name: string; emoji: string | null; active: boolean }): Category {
  const items = categories();
  const cat = items.find((c) => c.id === id);
  if (!cat) throw new Error('Category not found.');
  cat.name = input.name;
  cat.emoji = input.emoji;
  cat.active = input.active;
  saveCollection('categories', items);
  return cat;
}

export function demoDeleteCategory(id: string): void {
  const removed = categories().find((c) => c.id === id);
  const items = categories().filter((c) => c.id !== id);
  saveCollection('categories', items);
  if (removed) logDeleteEntry(removed.name, 'Category');
}

/* ---------- Inventory ---------- */

function inventory(): AdminInventoryItem[] {
  const INV_SEED_VERSION = 2;
  const versionKey = 'vpnexues-demo-inventory-version';
  try {
    const v = parseInt(localStorage.getItem(versionKey) ?? '0', 10);
    if (v < INV_SEED_VERSION) {
      localStorage.removeItem('vpnexues-demo-inventory');
      localStorage.setItem(versionKey, String(INV_SEED_VERSION));
      invalidateCollection('inventory');
    }
  } catch { /* ignore */ }
  return loadCollection<AdminInventoryItem>('inventory', () => DEMO_INVENTORY.map((i) => ({ ...i })));
}

function stockStatus(quantity: number, threshold: number): AdminInventoryItem['status'] {
  if (quantity <= 0) return 'OUT_OF_STOCK';
  if (quantity <= threshold) return 'LOW_STOCK';
  return 'IN_STOCK';
}

export function demoListInventory(params: { category?: string; status?: string }): AdminInventoryItem[] {
  let items = inventory();
  if (params.category) items = items.filter((i) => i.category === params.category);
  if (params.status) items = items.filter((i) => i.status === params.status);
  return items;
}

export function demoUpdateInventory(id: string, input: { quantity: number; reorderThreshold: number }): AdminInventoryItem {
  const items = inventory();
  const item = items.find((i) => i.id === id);
  if (!item) throw new Error('Inventory item not found.');
  item.quantity = input.quantity;
  item.reorderThreshold = input.reorderThreshold;
  item.status = stockStatus(input.quantity, input.reorderThreshold);
  item.updatedAt = new Date().toISOString();
  saveCollection('inventory', items);
  return item;
}

/* ---------- Customers ---------- */

function customers(): AdminCustomer[] {
  return loadCollection<AdminCustomer>('customers', () => DEMO_CUSTOMERS.map((c) => ({ ...c })));
}

export function demoListCustomers(params: { type?: string; country?: string; search?: string }): AdminCustomer[] {
  let items = customers();
  if (params.type) items = items.filter((c) => c.customerType === params.type);
  if (params.country) items = items.filter((c) => c.countryCode === params.country);
  if (params.search) {
    const q = params.search.toLowerCase();
    items = items.filter((c) => `${c.name ?? ''} ${c.email ?? ''} ${c.phone}`.toLowerCase().includes(q));
  }
  return items;
}

/* ---------- Contact messages (support) ---------- */

function messages(): ContactMessage[] {
  const items = loadCollectionVersioned<ContactMessage>('messages', '3', () => DEMO_MESSAGES.map((m) => ({ ...m })));
  const now = Date.now();
  const FIFTEEN_DAYS = 15 * 24 * 60 * 60 * 1000;
  const needsReset = items.length === 0 || items.every((m) => now - new Date(m.createdAt).getTime() > FIFTEEN_DAYS);
  if (needsReset) {
    const fresh = DEMO_MESSAGES.map((m) => ({ ...m }));
    saveCollection('messages', fresh);
    return fresh;
  }
  return items;
}

export function demoListMessages(status?: string): ContactMessage[] {
  let items = messages();
  if (status) items = items.filter((m) => m.status === status);
  return [...items].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export function demoGetMessage(id: string): ContactMessage {
  const items = messages();
  const msg = items.find((m) => m.id === id);
  if (!msg) throw new Error('Message not found.');
  if (msg.status === 'NEW') {
    msg.status = 'READ';
    saveCollection('messages', items);
  }
  return msg;
}

export function demoUpdateMessageStatus(id: string, status: string): ContactMessage {
  const items = messages();
  const msg = items.find((m) => m.id === id);
  if (!msg) throw new Error('Message not found.');
  msg.status = status;
  if (status === 'REPLIED') msg.lastResponseAt = new Date().toISOString();
  saveCollection('messages', items);
  return msg;
}

export function demoRemoveMessage(id: string): void {
  const items = messages();
  const removed = items.find((m) => m.id === id);
  saveCollection(
    'messages',
    items.filter((m) => m.id !== id),
  );
  // Keep a full copy in the delete log so Settings → Delete History can restore it.
  if (removed) {
    logDeleteEntry(removed.name || removed.email || 'Support message', 'Support message', removed);
  }
}

/* ---------- Admin users ---------- */

function adminUsers(): AdminUserSummary[] {
  return loadCollection<AdminUserSummary>('admin-users', () => DEMO_ADMIN_USERS.map((u) => ({ ...u })));
}

export function demoListAdminUsers(): AdminUserSummary[] {
  return adminUsers();
}

export function demoCreateAdminUser(input: { email: string; password: string; name: string; role: AdminRole }): AdminUserSummary {
  const items = adminUsers();
  if (items.some((u) => u.email.toLowerCase() === input.email.toLowerCase())) {
    throw new Error('An admin with this email already exists.');
  }
  const user: AdminUserSummary = { id: uid('demo-admin'), email: input.email, name: input.name, role: input.role, active: true };
  items.push(user);
  saveCollection('admin-users', items);
  return user;
}

export function demoUpdateAdminUser(id: string, input: { name: string; role: AdminRole; active: boolean }): AdminUserSummary {
  const items = adminUsers();
  const user = items.find((u) => u.id === id);
  if (!user) throw new Error('Admin user not found.');
  user.name = input.name;
  user.role = input.role;
  user.active = input.active;
  saveCollection('admin-users', items);
  return user;
}

export function demoDeleteAdminUser(id: string): void {
  const removed = adminUsers().find((u) => u.id === id);
  saveCollection(
    'admin-users',
    adminUsers().filter((u) => u.id !== id),
  );
  if (removed) logDeleteEntry(removed.email, 'Sub admin');
}

export function demoResetAdminPassword(id: string, password: string): void {
  const items = adminUsers();
  const user = items.find((u) => u.id === id);
  if (!user) throw new Error('Admin user not found.');
  const pwds = loadCollection<{ id: string; password: string }>('admin-passwords', () => []);
  const entry = pwds.find((p) => p.id === id);
  if (entry) entry.password = password;
  else pwds.push({ id, password });
  saveCollection('admin-passwords', pwds);
}

/* ---------- Settings ---------- */

function settings(): StoreSettings {
  const loaded = loadCollection<StoreSettings>('settings', () => [{ ...DEMO_SETTINGS }]);
  return loaded[0] ?? { ...DEMO_SETTINGS };
}

export function demoGetSettings(): StoreSettings {
  return settings();
}

export function demoUpdateSettings(input: StoreSettings): StoreSettings {
  saveCollection('settings', [input]);
  return input;
}

/* ---------- Dashboard summary ---------- */export function demoGetSummary(): DashboardSummary {
  const details = orderDetails();
  const custs = customers();
  const prods = products();
  const inv = inventory();
  const totalRevenue = details.filter((o) => o.status !== 'CANCELLED').reduce((sum, o) => sum + o.grandTotal, 0);
  const recentOrders = [...details].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)).slice(0, 5).map((o) => ({
    id: o.id, orderNumber: o.orderNumber, buyerName: o.buyer.name, buyerPhone: o.buyer.phone,
    countryCode: o.countryCode, channel: o.channel, status: o.status,
    grandTotal: o.grandTotal, createdAt: o.createdAt,
  }));
  return {
    totalRevenue,
    totalOrders: details.length,
    totalCustomers: custs.length,
    totalProducts: prods.length,
    recentOrders,
    lowStockItems: inv.filter((i) => i.status !== 'IN_STOCK'),
  };
}

/* ---------- Offline detection ---------- */

/** True only for transport failures (backend unreachable). HTTP errors pass through.
 * DEV-only by design: in a production build no write may silently "succeed" into
 * the localStorage demo store (admin password change, product deactivation, …)
 * and no read may serve fabricated data — RULES.neverFallbackToDemo. */
export function isOfflineError(err: unknown): boolean {
  return import.meta.env.DEV && !!err && typeof err === 'object' && !('response' in err);
}

/* ---------- B2B enquiries ---------- */

function b2b(): B2BEnquiry[] {
  return loadCollection<B2BEnquiry>('b2b', () => DEMO_B2B.map((b) => ({ ...b })));
}

export function demoListEnquiries(status?: string): B2BEnquiry[] {
  let items = b2b();
  if (status) items = items.filter((b) => b.status === status);
  return items;
}

export function demoUpdateEnquiryStatus(id: string, status: string): B2BEnquiry {
  const items = b2b();
  const found = items.find((b) => b.id === id);
  if (!found) throw new Error('Enquiry not found.');
  found.status = status;
  saveCollection('b2b', items);
  return found;
}

/* ---------- Testimonials ---------- */

function testimonials(): Testimonial[] {
  return loadCollection<Testimonial>('testimonials', () => DEMO_TESTIMONIALS.map((t) => ({ ...t })));
}

export function demoListTestimonials(): Testimonial[] {
  return testimonials();
}

export function demoCreateTestimonial(input: TestimonialInput): Testimonial {
  const items = testimonials();
  const t: Testimonial = {
    id: uid('demo-t'), name: input.name, role: input.role ?? null, location: input.location ?? null,
    rating: input.rating, quote: input.quote, photoUrl: input.photoUrl ?? null, active: true,
  };
  items.unshift(t);
  saveCollection('testimonials', items);
  return t;
}

export function demoUpdateTestimonial(id: string, input: TestimonialInput & { active: boolean }): Testimonial {
  const items = testimonials();
  const t = items.find((x) => x.id === id);
  if (!t) throw new Error('Testimonial not found.');
  Object.assign(t, {
    name: input.name, role: input.role ?? null, location: input.location ?? null,
    rating: input.rating, quote: input.quote, photoUrl: input.photoUrl ?? null, active: input.active,
  });
  saveCollection('testimonials', items);
  return t;
}

export function demoRemoveTestimonial(id: string): void {
  const removed = testimonials().find((t) => t.id === id);
  saveCollection(
    'testimonials',
    testimonials().filter((t) => t.id !== id),
  );
  if (removed) logDeleteEntry(removed.name, 'Testimonial');
}

/* ---------- Countries (demo-managed directory) ---------- */

function countries(): DemoCountry[] {
  const stored = loadCollection<DemoCountry>('countries', () => DEMO_COUNTRIES.map((c) => ({ ...c })));
  const seeds = new Map(DEMO_COUNTRIES.map((c) => [c.id, c]));
  let changed = false;
  const merged = stored.map((s) => {
    const seed = seeds.get(s.id);
    if (!seed) return s;
    const m = { ...seed, ...s, flagImg: seed.flagImg };
    if ((Object.keys(seed) as (keyof DemoCountry)[]).some((k) => m[k] === undefined)) changed = true;
    return m;
  });
  if (changed) saveCollection('countries', merged);
  return merged;
}

export function demoListCountries(): DemoCountry[] {
  return countries();
}

export function demoGetCountry(id: string): DemoCountry {
  const found = countries().find((c) => c.id === id);
  if (!found) throw new Error('Country not found.');
  return found;
}

export function demoCreateCountry(input: Partial<DemoCountry> & { name: string; code: string }): DemoCountry {
  const items = countries();
  const code = input.code.toUpperCase();
  if (items.some((c) => c.code.toUpperCase() === code || c.id === code)) {
    throw new Error(`Country with code ${code} already exists.`);
  }
  const today = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const c: DemoCountry = {
    id: code,
    name: input.name, code,
    flag: input.flag ?? '🏳️', flagImg: input.flagImg ?? 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001490/vpnexues/old/site-assets/assets-ui/img/in-flag.svg',
    currency: input.currency || '—',
    currencyCode: (input.currencyCode || '').trim().toUpperCase() || code,
    currencySymbol: input.currencySymbol ?? '', phoneCode: input.phoneCode || '+0',
    language: input.language || 'English', timezone: input.timezone || 'UTC',
    orders: 0, revenue: '0', customers: 0,
    admin: input.admin || `${input.name} Admin`,
    adminEmail: input.adminEmail || `${code.toLowerCase()}@gmail.com`,
    status: 'active',
    cities: input.cities ?? '', createdDate: input.createdDate ?? today,
    lastUpdatedDate: input.lastUpdatedDate ?? today, details: input.details ?? '',
  };
  items.push(c);
  saveCollection('countries', items);
  return c;
}

export function demoUpdateCountry(id: string, input: Partial<DemoCountry>): DemoCountry {
  const items = countries();
  const c = items.find((x) => x.id === id);
  if (!c) throw new Error('Country not found.');
  Object.assign(c, input);
  saveCollection('countries', items);
  return c;
}

export function demoToggleCountry(id: string): DemoCountry {
  const items = countries();
  const c = items.find((x) => x.id === id);
  if (!c) throw new Error('Country not found.');
  c.status = c.status === 'active' ? 'inactive' : 'active';
  saveCollection('countries', items);
  return c;
}

export function demoDeleteCountry(id: string): void {
  const removed = countries().find((c) => c.id === id);
  saveCollection(
    'countries',
    countries().filter((c) => c.id !== id),
  );
  if (removed) logDeleteEntry(removed.name, 'Country');
}

/* ---------- Customer mutations ---------- */

export function demoAddCustomer(input: { name: string; email: string; phone: string; countryCode: string; customerType: string }): AdminCustomer {
  const items = customers();
  const c: AdminCustomer = {
    id: uid('demo-cust'), name: input.name, email: input.email, phone: input.phone,
    countryCode: input.countryCode, orderCount: 0, totalSpent: 0,
    customerType: input.customerType, registeredAt: new Date().toISOString(),
  };
  items.unshift(c);
  saveCollection('customers', items);
  return c;
}

export function demoUpdateCustomer(id: string, input: { name: string; email: string; phone: string }): AdminCustomer {
  const items = customers();
  const c = items.find((x) => x.id === id);
  if (!c) throw new Error('Customer not found.');
  c.name = input.name;
  c.email = input.email;
  c.phone = input.phone;
  saveCollection('customers', items);
  return c;
}

export function demoDeleteCustomer(id: string): void {
  const removed = customers().find((c) => c.id === id);
  saveCollection(
    'customers',
    customers().filter((c) => c.id !== id),
  );
  if (removed) logDeleteEntry(removed.name ?? removed.phone, 'Customer');
}

/* ---------- Transactions (derived from orders + persisted overrides) ---------- */

export interface DemoTxn {
  id: string;
  orderId: string;
  orderNumber: string;
  customer: string;
  customerId: string;
  customerEmail: string;
  customerPhone: string;
  method: string;
  paymentProvider: string;
  amount: number;
  date: string;
  status: 'successful' | 'pending' | 'failed' | 'refunded';
  orderStatus: string;
  country: string;
  verified: boolean;
  items: { name: string; qty: number; unitPrice: number; lineTotal: number }[];
  itemCount: number;
}

interface TxnOverride {
  orderId: string;
  status?: DemoTxn['status'];
  verified?: boolean;
}

function txnOverrides(): TxnOverride[] {
  const TXN_SEED_VERSION = 2;
  const versionKey = 'vpnexues-demo-txn-version';
  try {
    const v = parseInt(localStorage.getItem(versionKey) ?? '0', 10);
    if (v < TXN_SEED_VERSION) {
      localStorage.removeItem('vpnexues-demo-txn-overrides');
      localStorage.setItem(versionKey, String(TXN_SEED_VERSION));
      invalidateCollection('txn-overrides');
    }
  } catch { /* ignore */ }
  return loadCollection<TxnOverride>('txn-overrides', () => []);
}

function baseTxnStatus(orderStatus: string): DemoTxn['status'] {
  if (orderStatus === 'DELIVERED') return 'successful';
  if (orderStatus === 'CANCELLED') return 'refunded';
  return 'successful';
}

const COUNTRY_PROVIDERS: Record<string, Record<string, string[]>> = {
  IN: {
    UPI: ['Google Pay', 'PhonePe', 'Paytm', 'BHIM UPI', 'Amazon Pay'],
    Card: ['Visa', 'Mastercard', 'RuPay', 'American Express'],
    COD: ['Cash on Delivery'],
    'Net Banking': ['SBI', 'HDFC Bank', 'ICICI Bank', 'Axis Bank', 'Kotak Mahindra Bank', 'Federal Bank', 'Bank of Baroda', 'Canara Bank', 'Punjab National Bank', 'Indian Bank', 'Union Bank of India', 'IDFC FIRST Bank'],
  },
  SG: {
    PayNow: ['PayNow', 'DBS PayLah!', 'OCBC Pay Anyone', 'GrabPay'],
    Card: ['Visa', 'Mastercard', 'American Express'],
    GrabPay: ['GrabPay'],
    COD: ['Cash on Delivery'],
  },
  AE: {
    'Apple Pay': ['Apple Pay', 'Google Pay', 'Samsung Pay'],
    Card: ['Visa', 'Mastercard', 'American Express'],
    COD: ['Cash on Delivery'],
  },
  US: {
    'Apple Pay': ['Apple Pay', 'Google Pay', 'PayPal'],
    Card: ['Visa', 'Mastercard', 'American Express', 'Discover'],
    COD: ['Cash on Delivery'],
  },
  LK: {
    Card: ['Visa', 'Mastercard', 'American Express'],
    'Bank Transfer': ['Bank Transfer', 'FriMi', 'eZ Cash'],
    COD: ['Cash on Delivery'],
  },
};

function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function demoListTransactions(filter: { status?: string; method?: string; country?: string; search?: string }): DemoTxn[] {
  const overrides = new Map(txnOverrides().map((o) => [o.orderId, o]));
  const orders = orderDetails();
  let txns: DemoTxn[] = orders.map((o) => {
    const ov = overrides.get(o.id);
    const countryProviders = COUNTRY_PROVIDERS[o.countryCode] ?? {};
    const methodProviders = countryProviders[o.paymentMethod] ?? [o.paymentMethod];
    const provider = methodProviders[hashStr(o.id) % methodProviders.length];
    return {
      id: `TXN-${o.orderNumber}`,
      orderId: o.id,
      orderNumber: o.orderNumber,
      customer: o.buyer.name ?? o.buyer.phone,
      customerId: o.buyer.id,
      customerEmail: o.buyer.email ?? '—',
      customerPhone: o.buyer.phone,
      method: o.paymentMethod,
      paymentProvider: provider,
      amount: o.grandTotal,
      date: o.createdAt,
      status: ov?.status ?? baseTxnStatus(o.status),
      orderStatus: o.status,
      country: o.countryCode,
      verified: ov?.verified ?? false,
      items: o.items.map((it) => ({ name: it.name, qty: it.qty, unitPrice: it.unitPrice, lineTotal: it.lineTotal })),
      itemCount: o.items.length,
    };
  });
  if (filter.status) txns = txns.filter((t) => t.status === filter.status);
  if (filter.method) txns = txns.filter((t) => t.method === filter.method);
  if (filter.country) txns = txns.filter((t) => t.country === filter.country);
  if (filter.search) {
    const q = filter.search.toLowerCase();
    txns = txns.filter((t) =>
      `${t.id} ${t.customer} ${t.customerId} ${t.orderId} ${t.orderNumber} ${t.paymentProvider}`.toLowerCase().includes(q)
    );
  }
  return [...txns].sort((a, b) => (a.date < b.date ? 1 : -1));
}

function saveTxnOverride(orderId: string, patch: Partial<TxnOverride>): DemoTxn {
  const items = txnOverrides();
  let ov = items.find((o) => o.orderId === orderId);
  if (!ov) {
    ov = { orderId };
    items.push(ov);
  }
  Object.assign(ov, patch);
  saveCollection('txn-overrides', items);
  const found = demoListTransactions({}).find((t) => t.orderId === orderId);
  if (!found) throw new Error('Transaction not found.');
  return found;
}

export function demoVerifyPayment(orderId: string): DemoTxn {
  return saveTxnOverride(orderId, { verified: true });
}

export function demoRefundPayment(orderId: string): DemoTxn {
  return saveTxnOverride(orderId, { status: 'refunded' });
}

/* ---------- Admin messages ---------- */

function adminMessages(): DemoAdminMessage[] {
  return loadCollection<DemoAdminMessage>('admin-messages', () => DEMO_ADMIN_MESSAGES.map((m) => ({ ...m })));
}

export function demoListAdminMessages(viewer: 'super' | string): DemoAdminMessage[] {
  const items = adminMessages();
  const scoped =
    viewer === 'super' ? items.filter((m) => m.to === 'super' || m.sender === 'super') : items.filter((m) => m.to === viewer || m.to === 'all');
  return [...scoped].sort((a, b) => (a.ts < b.ts ? 1 : -1));
}

export function demoSendAdminMessage(input: { from: string; fromEmail: string; to: string; subject: string; body: string; sender: string }): DemoAdminMessage {
  const items = adminMessages();
  const m: DemoAdminMessage = {
    id: uid('demo-am'), from: input.from, fromEmail: input.fromEmail, to: input.to,
    subject: input.subject, body: input.body, ts: new Date().toISOString(),
    read: false, starred: false, sender: input.sender,
  };
  items.unshift(m);
  saveCollection('admin-messages', items);
  return m;
}

export function demoMarkAdminMessageRead(id: string, read = true): DemoAdminMessage {
  const items = adminMessages();
  const m = items.find((x) => x.id === id);
  if (!m) throw new Error('Message not found.');
  m.read = read;
  saveCollection('admin-messages', items);
  return m;
}

export function demoToggleAdminMessageStar(id: string): DemoAdminMessage {
  const items = adminMessages();
  const m = items.find((x) => x.id === id);
  if (!m) throw new Error('Message not found.');
  m.starred = !m.starred;
  saveCollection('admin-messages', items);
  return m;
}

export function demoUpdateAdminMessage(id: string, patch: { status?: string; priority?: string }): DemoAdminMessage {
  const items = adminMessages();
  const m = items.find((x) => x.id === id);
  if (!m) throw new Error('Message not found.');
  if (patch.status !== undefined) m.status = patch.status;
  if (patch.priority !== undefined) m.priority = patch.priority;
  saveCollection('admin-messages', items);
  return m;
}

export function demoDeleteAdminMessage(id: string): void {
  saveCollection(
    'admin-messages',
    adminMessages().filter((m) => m.id !== id),
  );
}

/* ---------- Activity logs ---------- */

function logs(): DemoLog[] {
  return loadCollection<DemoLog>('logs', () => DEMO_LOGS.map((l) => ({ ...l })));
}

export function demoListLogs(filter: { category?: string; country?: string; search?: string }): DemoLog[] {
  let items = logs().map((l) => ({ ...l, country: l.country === 'global' ? 'india' : l.country }));
  if (filter.category) items = items.filter((l) => l.category === filter.category);
  if (filter.country) items = items.filter((l) => l.country === filter.country);
  if (filter.search) {
    const q = filter.search.toLowerCase();
    items = items.filter((l) => `${l.user} ${l.details} ${l.action}`.toLowerCase().includes(q));
  }
  return [...items].sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1));
}

export function demoDeleteLog(id: string): void {
  const removed = logs().find((l) => l.id === id);
  saveCollection(
    'logs',
    logs().filter((l) => l.id !== id),
  );
  if (removed) logDeleteEntry(`${removed.action} (${removed.id})`, 'Activity log');
}

export function demoUpdateLog(id: string, action: string): DemoLog {
  const items = logs();
  const log = items.find((l) => l.id === id);
  if (!log) throw new Error('Log not found.');
  log.action = action;
  saveCollection('logs', items);
  return log;
}

/* ---------- Subscribers ---------- */

function subscribers(): DemoSubscriber[] {
  return loadCollection<DemoSubscriber>('subscribers', () => DEMO_SUBSCRIBERS.map((s) => ({ ...s })));
}

export function demoListSubscribers(filter: { country?: string; status?: string; search?: string }): DemoSubscriber[] {
  let items = subscribers();
  if (filter.country) items = items.filter((s) => s.country === filter.country);
  if (filter.status) items = items.filter((s) => s.status === filter.status);
  if (filter.search) {
    const q = filter.search.toLowerCase();
    items = items.filter((s) => `${s.name} ${s.email} ${s.id}`.toLowerCase().includes(q));
  }
  return items;
}

export function demoToggleSubscriber(id: string): DemoSubscriber {
  const items = subscribers();
  const s = items.find((x) => x.id === id);
  if (!s) throw new Error('Subscriber not found.');
  s.status = s.status === 'subscribed' ? 'unsubscribed' : 'subscribed';
  saveCollection('subscribers', items);
  return s;
}

/* ---------- Geo ---------- */

export function demoGetGeo(country: string): { label: string; states: DemoGeoState[] } {
  return DEMO_GEO[country] ?? { label: 'Region', states: [] };
}

export function demoGetReportOverview(country: string): DemoReportOverview {
  return DEMO_REPORTS[country] ?? EMPTY_REPORT_OVERVIEW;
}

/* ---------- User notes & addresses ---------- */

function notes(): DemoNote[] {
  return loadCollection<DemoNote>('notes', () => DEMO_NOTES.map((n) => ({ ...n })));
}

export function demoListNotes(userId: string): DemoNote[] {
  return notes().filter((n) => n.userId === userId);
}

export function demoAddNote(userId: string, text: string): DemoNote {
  const items = notes();
  const n: DemoNote = { id: uid('demo-note'), userId, text, at: new Date().toISOString() };
  items.unshift(n);
  saveCollection('notes', items);
  return n;
}

function userAddresses(): DemoUserAddress[] {
  return loadCollection<DemoUserAddress>('user-addresses', () => DEMO_USER_ADDRESSES.map((a) => ({ ...a })));
}

export function demoListAddresses(userId: string): DemoUserAddress[] {
  return userAddresses().filter((a) => a.userId === userId);
}

/* ---------- Login sessions ---------- */

function sessions(): DemoSession[] {
  return loadCollection<DemoSession>('sessions', () => DEMO_SESSIONS.map((s) => ({ ...s })));
}

export function demoListSessions(country: string): DemoSession[] {
  return sessions().filter((s) => s.country === country);
}

export function demoRevokeSession(id: string): void {
  saveCollection(
    'sessions',
    sessions().filter((s) => s.id !== id || s.current),
  );
}

/* ---------- Admin preferences ---------- */

function prefs(): DemoPrefs[] {
  return loadCollection<DemoPrefs>('prefs', () => DEMO_PREFS.map((p) => ({ ...p, emailToggles: { ...p.emailToggles } })));
}

const DEFAULT_PREFS: DemoPrefs = {
  country: '', emailToggles: {}, digest: 'Daily', quietFrom: '22:00', quietTo: '07:00',
  language: 'English', timezone: 'UTC', dateFormat: 'DD/MM/YYYY', currency: 'USD',
  weight: 'kg', theme: 'Light', density: 'Comfortable', twoFA: false,
};

export function demoGetPrefs(country: string): DemoPrefs {
  return prefs().find((p) => p.country === country) ?? { ...DEFAULT_PREFS, country };
}

export function demoSavePrefs(input: DemoPrefs): DemoPrefs {
  const items = prefs();
  const idx = items.findIndex((p) => p.country === input.country);
  if (idx >= 0) items[idx] = input;
  else items.push(input);
  saveCollection('prefs', items);
  return input;
}

/* ---------- Platform settings (super admin panels) ---------- */

export interface PlatformSettings {
  platformName: string;
  tagline: string;
  contactEmail: string;
  phone: string;
  timezone: string;
  language: string;
  websiteUrl: string;
  supportUrl: string;
  platformDescription: string;
  platformLogo: string;
  favicon: string;
  maintenanceMode: boolean;
  allowRegistration: boolean;
  emailVerification: boolean;
  multiLanguage: boolean;
  cookieConsent: boolean;
  emailProvider: string;
  smtpHost: string;
  smtpPort: string;
  smtpUsername: string;
  smtpPassword: string;
  fromName: string;
  fromEmail: string;
  twoFA: boolean;
  sessionTimeout: number;
  maxLoginAttempts: number;
  passwordMinLength: number;
  passwordExpiry: number;
  ipWhitelistEnabled: boolean;
  allowedIps: string;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumber: boolean;
  requireSpecialChar: boolean;
  theme: string;
  density: string;
  sidebarStyle: string;
  dashboardLayout: string;
  primaryColor: string;
  notifNewOrder: boolean;
  notifTickets: boolean;
  notifUsers: boolean;
  notifStock: boolean;
  notifPayments: boolean;
  notifMessages: boolean;
  notifUpdates: boolean;
  notifSystem: boolean;
  emailDigest: boolean;
  quietHours: boolean;
  quietHoursFrom: string;
  quietHoursTo: string;
  autoBackups: boolean;
  backupFrequency: string;
  backupFormat: string;
  logRetention: number;
  lastBackup: string;
}

const DEFAULT_PLATFORM: PlatformSettings = {
  platformName: 'VPNexues',
  tagline: 'Fresh groceries, delivered',
  contactEmail: 'hello@vpnexues.com',
  phone: '+65 6000 0000',
  timezone: 'Asia/Singapore',
  language: 'English',
  websiteUrl: 'https://vpnexues.com',
  supportUrl: 'https://vpnexues.com/support',
  platformDescription: 'VPNexues is a modern grocery ordering and delivery platform.',
  platformLogo: '',
  favicon: '',
  maintenanceMode: false,
  allowRegistration: true,
  emailVerification: false,
  multiLanguage: false,
  cookieConsent: false,
  emailProvider: 'Gmail',
  smtpHost: 'smtp.gmail.com',
  smtpPort: '587',
  smtpUsername: 'admin@vpnexues.com',
  smtpPassword: '',
  fromName: 'VPNexues Support',
  fromEmail: 'noreply@vpnexues.com',
  twoFA: false,
  sessionTimeout: 30,
  maxLoginAttempts: 5,
  passwordMinLength: 8,
  passwordExpiry: 90,
  ipWhitelistEnabled: false,
  allowedIps: '',
  requireUppercase: true,
  requireLowercase: true,
  requireNumber: true,
  requireSpecialChar: false,
  theme: 'Light',
  density: 'Comfortable',
  sidebarStyle: 'Full Sidebar',
  dashboardLayout: 'Default',
  primaryColor: '#2E7D32',
  notifNewOrder: true,
  notifTickets: true,
  notifUsers: false,
  notifStock: true,
  notifPayments: true,
  notifMessages: true,
  notifUpdates: false,
  notifSystem: true,
  emailDigest: false,
  quietHours: false,
  quietHoursFrom: '22:00',
  quietHoursTo: '07:00',
  autoBackups: true,
  backupFrequency: 'Daily',
  backupFormat: 'JSON',
  logRetention: 30,
  lastBackup: '17 Aug 2026, 02:00 AM',
};

export function demoGetPlatformSettings(): PlatformSettings {
  const loaded = loadCollection<PlatformSettings>('platform', () => [{ ...DEFAULT_PLATFORM }]);
  return loaded[0] ?? { ...DEFAULT_PLATFORM };
}

export function demoSavePlatformSettings(input: PlatformSettings): PlatformSettings {
  saveCollection('platform', [input]);
  return input;
}

/* ---------- Delete history ---------- */

export interface DeleteLogEntry {
  id: string;
  item: string;
  type: string;
  by: string;
  at: string;
  user?: string;
  data?: unknown;
}

export function logDeleteEntry(item: string, type: string, data?: unknown): void {
  const items = loadCollection<DeleteLogEntry>('delete-history', () => []);
  const user = (data as any)?.name ?? (data as any)?.user ?? undefined;
  items.unshift({ id: uid('demo-del'), item, type, by: 'admin', at: new Date().toISOString(), data, user });
  saveCollection('delete-history', items.slice(0, 50));
}

export function demoRemoveDeleteEntry(id: string): void {
  const items = loadCollection<DeleteLogEntry>('delete-history', () => []);
  saveCollection('delete-history', items.filter((e) => e.id !== id));
}

export function demoRestoreSupportMessage(entry: DeleteLogEntry): void {
  if (entry.data) {
    const msgs = loadCollectionVersioned<ContactMessage>('messages', '3', () => DEMO_MESSAGES.map((m) => ({ ...m })));
    const exists = msgs.some((m) => m.id === (entry.data as ContactMessage).id);
    if (!exists) {
      msgs.unshift(entry.data as ContactMessage);
      saveCollection('messages', msgs);
    }
  }
  demoRemoveDeleteEntry(entry.id);
}

export function demoListDeleteHistory(): DeleteLogEntry[] {
  return loadCollection<DeleteLogEntry>('delete-history', () => []);
}

export function demoClearDeleteHistory(): void {
  saveCollection<DeleteLogEntry>('delete-history', []);
}

/* ---------- Sub-admin profiles (legacy sub-admin-management entity) ---------- */

function subAdmins(): DemoSubAdmin[] {
  return loadCollection<DemoSubAdmin>('sub-admin-profiles', () => DEMO_SUB_ADMINS.map((a) => ({ ...a, modules: [...a.modules], permissions: [...a.permissions] })));
}

export function demoListSubAdmins(filter: { status?: string; country?: string; search?: string }): DemoSubAdmin[] {
  let items = subAdmins();
  if (filter.status) items = items.filter((a) => a.status === filter.status);
  if (filter.country) items = items.filter((a) => a.country === filter.country);
  if (filter.search) {
    const q = filter.search.toLowerCase();
    const countryName = (cc: string): string => cc;
    items = items.filter((a) => `${a.name} ${a.email} ${a.phone} ${countryName(a.country)}`.toLowerCase().includes(q));
  }
  return items;
}

export function demoGetSubAdmin(id: string): DemoSubAdmin {
  const found = subAdmins().find((a) => a.id === id);
  if (!found) throw new Error('Sub admin not found.');
  return found;
}

export function demoCreateSubAdmin(input: { name: string; email: string; phone: string; password: string; country: string; role: string; modules: string[]; permissions: string[] }): DemoSubAdmin {
  if (!input.name.trim() || !input.email.trim()) {
    throw new Error('Full Name and Email are required.');
  }
  const items = subAdmins();
  const a: DemoSubAdmin = {
    id: `SA-${input.country.toUpperCase()}-${String(Date.now()).slice(-4)}`,
    name: input.name.trim(),
    email: input.email.trim(),
    phone: input.phone || '—',
    password: input.password || 'admin123',
    country: input.country || 'india',
    role: input.role || 'sub-admin',
    modules: [...input.modules],
    permissions: [...input.permissions],
    status: 'active',
    lastLogin: 'Never',
    createdDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
  };
  items.push(a);
  saveCollection('sub-admin-profiles', items);
  return a;
}

export function demoUpdateSubAdmin(id: string, input: { name: string; email: string; phone: string; role: string; country: string; modules: string[]; permissions: string[] }): DemoSubAdmin {
  const items = subAdmins();
  const a = items.find((x) => x.id === id);
  if (!a) throw new Error('Sub admin not found.');
  a.name = input.name || a.name;
  a.email = input.email || a.email;
  a.phone = input.phone || a.phone;
  a.role = input.role || a.role;
  a.country = input.country || a.country;
  a.modules = [...input.modules];
  a.permissions = [...input.permissions];
  saveCollection('sub-admin-profiles', items);
  return a;
}

export function demoToggleSubAdmin(id: string): DemoSubAdmin {
  const items = subAdmins();
  const a = items.find((x) => x.id === id);
  if (!a) throw new Error('Sub admin not found.');
  a.status = a.status === 'active' ? 'inactive' : 'active';
  saveCollection('sub-admin-profiles', items);
  return a;
}

export function demoDeleteSubAdmin(id: string): void {
  const removed = subAdmins().find((a) => a.id === id);
  saveCollection(
    'sub-admin-profiles',
    subAdmins().filter((a) => a.id !== id),
  );
  if (removed) logDeleteEntry(removed.name, 'Sub Admin');
}

export function demoResetSubAdminPassword(id: string, password: string): DemoSubAdmin {
  const items = subAdmins();
  const a = items.find((x) => x.id === id);
  if (!a) throw new Error('Sub admin not found.');
  a.password = password || 'admin123';
  saveCollection('sub-admin-profiles', items);
  return a;
}

/* ---------- Notification read/dismiss state (central demo store) ---------- */

export interface DemoNotifState {
  read: string[];
  dismissed: string[];
}

function notifState(): DemoNotifState {
  const rows = loadCollection<DemoNotifState>('notification-state', () => [{ read: [], dismissed: [] }]);
  const s = rows[0] ?? { read: [], dismissed: [] };
  return { read: Array.isArray(s.read) ? s.read : [], dismissed: Array.isArray(s.dismissed) ? s.dismissed : [] };
}

function saveNotifState(s: DemoNotifState): void {
  saveCollection('notification-state', [s]);
}

export function demoIsNotifRead(id: string): boolean {
  return notifState().read.includes(id);
}

export function demoMarkNotifRead(id: string): void {
  const s = notifState();
  if (!s.read.includes(id)) {
    s.read.push(id);
    saveNotifState(s);
  }
}

export function demoMarkAllNotifRead(ids: string[]): void {
  const s = notifState();
  for (const id of ids) {
    if (!s.read.includes(id)) s.read.push(id);
  }
  saveNotifState(s);
}

export function demoDismissNotif(id: string): void {
  const s = notifState();
  if (!s.dismissed.includes(id)) s.dismissed.push(id);
  saveNotifState(s);
}

export function demoClearNotifs(ids: string[]): void {
  const s = notifState();
  for (const id of ids) {
    if (!s.dismissed.includes(id)) s.dismissed.push(id);
  }
  saveNotifState(s);
}

export function demoIsNotifDismissed(id: string): boolean {
  return notifState().dismissed.includes(id);
}
