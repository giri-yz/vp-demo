export interface Product {
  id: string;
  name: string;
  slug: string;
  category: string;
  description: string | null;
  price: number;
  oldPrice: number | null;
  unit: string;
  sku: string;
  imageUrl: string | null;
  discountPct: number | null;
  badges: string[];
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface CartItem {
  id: string;
  productId: string | null;
  name: string;
  imageUrl: string | null;
  unit: string | null;
  boxType: string | null;
  qty: number;
  weightKg: number | null;
  unitPrice: number;
  oldPrice: number | null;
  lineTotal: number;
}

export interface BoxSummary {
  boxType: string;
  progressValue: number;
  threshold: number;
  minimumMet: boolean;
  subtotal: number;
  premiumOrDiscount: number;
  total: number;
}

export interface Cart {
  id: string;
  items: CartItem[];
  itemTotal: number;
  boxSummaries: BoxSummary[];
}

export interface Address {
  id: string;
  label: string;
  name: string;
  phone: string;
  addressLine: string;
  flat: string | null;
  landmark: string | null;
  city: string;
  pincode: string;
  state: string;
  /** ISO-3166 alpha-2 country this address is in (V59). Null on legacy rows. */
  country: string | null;
  isDefault: boolean;
  lat: number | null;
  lng: number | null;
}

export type CreateAddressInput = Omit<Address, 'id'>;

export interface CouponApplyResult {
  valid: boolean;
  code: string;
  discountAmount: number;
  message: string;
}

export interface OrderItem {
  name: string;
  imageUrl: string | null;
  boxType: string | null;
  qty: number;
  weightKg: number | null;
  unitPrice: number;
  lineTotal: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  status: string;
  channel: string;
  itemTotal: number;
  discount: number;
  boxDiscount: number;
  deliveryFee: number;
  tax: number;
  tip: number;
  grandTotal: number;
  paymentMethod: string;
  couponCode: string | null;
  items: OrderItem[];
  createdAt: string;
}

export interface CheckoutInput {
  addressId: string;
  paymentMethod: string;
  couponCode?: string;
  tip?: number;
}

export interface User {
  id: string;
  name: string | null;
  email: string | null;
  phone: string;
  emailVerified: boolean;
}

export type CountryCode = 'IN' | 'SG' | 'US' | 'AE' | 'LK' | 'MY';

export type AdminRole = 'ADMIN' | 'SUB_ADMIN' | 'SUPER_ADMIN';

export interface AdminSession {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
  /** Assigned country for SUB_ADMIN/ADMIN (backend sends this; demo sessions omit it). */
  countryCode?: string | null;
  /** Granted module keys; empty/missing = legacy account with full access. */
  modules?: string[];
  /** Granted action keys (view/edit/delete/export); empty/missing = full permission inside granted modules. */
  permissions?: string[];
}

export interface AdminOrderSummary {
  id: string;
  orderNumber: string;
  buyerName: string | null;
  buyerPhone: string | null;
  countryCode: string | null;
  channel: string;
  status: string;
  grandTotal: number;
  createdAt: string;
}

export interface AdminInventoryItem {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  category: string;
  imageUrl: string | null;
  quantity: number;
  reorderThreshold: number;
  status: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';
  updatedAt: string;
}

export interface DashboardSummary {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  recentOrders: AdminOrderSummary[];
  lowStockItems: AdminInventoryItem[];
}

/** Real backend OrderStatus values only — mirrors backend entity/OrderStatus.java
 *  (RETURNED / PACKED / OUT_FOR_DELIVERY / IN_TRANSIT / PENDING do not exist server-side). */
export const ORDER_STATUSES = ['PLACED', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'] as const;
export const ORDER_CHANNELS = ['SHOP', 'SMALL_BOX', 'BIG_BOX', 'B2B'] as const;

export interface AdminOrderDetail {
  id: string;
  orderNumber: string;
  status: string;
  channel: string;
  buyer: User;
  address: Address;
  items: OrderItem[];
  itemTotal: number;
  discount: number;
  boxDiscount: number;
  deliveryFee: number;
  tax: number;
  tip: number;
  grandTotal: number;
  paymentMethod: string;
  couponCode: string | null;
  countryCode: string;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  emoji: string | null;
  active: boolean;
}

export const B2B_ENQUIRY_STATUSES = ['PENDING', 'ACCEPTED', 'IN_REVIEW', 'DECLINED'] as const;

export interface B2BEnquiry {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  phone: string | null;
  countryCode: string;
  productInterest: string | null;
  quantity: string | null;
  estimatedValue: number | null;
  status: string;
  createdAt: string;
}

export interface StoreSettings {
  websiteName: string | null;
  tagline: string | null;
  defaultCurrency: string;
  timezone: string | null;
  dateFormat: string | null;
  timeFormat: string | null;
  websiteEmail: string | null;
  websitePhone: string | null;
  storeName: string | null;
  storeEmail: string | null;
  storePhone: string | null;
  storeAddress: string | null;
  storeDescription: string | null;
  freeShippingThreshold: number | null;
  standardShippingRate: number | null;
  expressShippingRate: number | null;
  defaultDeliveryDays: number | null;
  facebookUrl: string | null;
  instagramUrl: string | null;
  twitterUrl: string | null;
  youtubeUrl: string | null;
  whatsappUrl: string | null;
  telegramUrl: string | null;
  smallBoxStandardSlots: number | null;
  smallBoxPremiumRate: number | null;
  bigBoxMinKg: number | null;
  bigBoxDiscountRate: number | null;
}

export interface AdminUserSummary {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
  active: boolean;
  countryCode?: string | null;
  phone?: string | null;
  modules?: string[] | null;
  permissions?: string[] | null;
  lastLogin?: string | null;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string | null;
  location: string | null;
  rating: number;
  quote: string;
  photoUrl: string | null;
  active: boolean;
}

export const CONTACT_MESSAGE_STATUSES = ['NEW', 'READ', 'REPLIED', 'CLOSED'] as const;

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  countryCode: string | null;
  subject: string;
  message: string;
  status: string;
  priority: string | null;
  category: string | null;
  assignedTo: string | null;
  createdAt: string;
  lastResponseAt: string | null;
  address: string | null;
  orderId: string | null;
  productName: string | null;
  productPrice: number | null;
}

export interface AdminCustomer {
  id: string;
  name: string | null;
  email: string | null;
  phone: string;
  countryCode: string | null;
  orderCount: number;
  totalSpent: number;
  customerType: string;
  registeredAt: string;
}

export interface AdminProduct {
  id: string;
  name: string;
  slug: string;
  category: string;
  description: string | null;
  basePrice: number;
  oldPrice: number | null;
  unit: string;
  sku: string;
  imageUrl: string | null;
  discountPct: number | null;
  badges: string[];
  active: boolean;
  createdAt: string;
  /** Effective price per market (IN/SG/US/AE + override regions), same values the shop serves. */
  prices?: Record<string, { price: number; oldPrice: number | null }>;
}
