import type { AdminOrderDetail, AdminCustomer, AdminInventoryItem } from '../types';
// import { DEMO_INVENTORY, computeProductSales, type ProductSalesInfo } from '../api/demo/demoData';

// Minimal order shape shared by both AdminOrderSummary and AdminOrderDetail
export interface MinimalOrder {
  id: string;
  orderNumber: string;
  buyerName: string | null;
  buyerPhone: string | null;
  countryCode: string | null;
  channel: string;
  status: string;
  grandTotal: number;
  createdAt: string;
  buyer?: { phone: string };
  items?: { name: string; qty: number; lineTotal: number }[];
  paymentMethod?: string;
}

// ── Product sales (aggregated from the orders handed in by the caller) ──
export interface ProductSalesInfo {
  name: string;
  totalUnits: number;
  totalRevenue: number;
  orderCount: number;
}

export function computeProductSales(orders: MinimalOrder[] = []): ProductSalesInfo[] {
  const map = new Map<string, ProductSalesInfo>();
  for (const o of orders) {
    for (const item of o.items ?? []) {
      const e = map.get(item.name) ?? { name: item.name, totalUnits: 0, totalRevenue: 0, orderCount: 0 };
      e.totalUnits += item.qty;
      e.totalRevenue += item.lineTotal;
      e.orderCount += 1;
      map.set(item.name, e);
    }
  }
  return [...map.values()].sort((a, b) => b.totalRevenue - a.totalRevenue);
}

// ── Period Comparison ──
export interface PeriodComparison {
  current: number;
  previous: number;
  change: number;
  changePercent: number;
}

export function computePeriodComparison(current: number, previous: number): PeriodComparison {
  const change = current - previous;
  const changePercent = previous > 0 ? Math.round((change / previous) * 1000) / 10 : 0;
  return { current, previous, change, changePercent };
}

export function filterOrdersByRange(orders: MinimalOrder[], range: string): MinimalOrder[] {
  if (range === 'all') return orders;
  const now = new Date();
  let cutoff: Date;
  switch (range) {
    case '7d': cutoff = new Date(now.getTime() - 7 * 86400000); break;
    case '30d': cutoff = new Date(now.getTime() - 30 * 86400000); break;
    case '6m': cutoff = new Date(now.getTime() - 180 * 86400000); break;
    case '1y': cutoff = new Date(now.getTime() - 365 * 86400000); break;
    default: return orders;
  }
  return orders.filter(o => new Date(o.createdAt) >= cutoff);
}

export function computeRevenueComparison(orders: MinimalOrder[], range: string): PeriodComparison {
  const filtered = filterOrdersByRange(orders, range);
  const revenue = filtered.filter(o => o.status !== 'CANCELLED').reduce((s, o) => s + o.grandTotal, 0);

  const now = new Date();
  let prevStart: Date, prevEnd: Date;
  switch (range) {
    case '7d':
      prevEnd = new Date(now.getTime() - 7 * 86400000);
      prevStart = new Date(now.getTime() - 14 * 86400000);
      break;
    case '30d':
      prevEnd = new Date(now.getTime() - 30 * 86400000);
      prevStart = new Date(now.getTime() - 60 * 86400000);
      break;
    case '6m':
      prevEnd = new Date(now.getTime() - 180 * 86400000);
      prevStart = new Date(now.getTime() - 360 * 86400000);
      break;
    case '1y':
      prevEnd = new Date(now.getTime() - 365 * 86400000);
      prevStart = new Date(now.getTime() - 730 * 86400000);
      break;
    default:
      return computePeriodComparison(revenue, 0);
  }
  const prevRevenue = orders.filter(o => {
    const d = new Date(o.createdAt);
    return d >= prevStart && d < prevEnd && o.status !== 'CANCELLED';
  }).reduce((s, o) => s + o.grandTotal, 0);

  return computePeriodComparison(revenue, prevRevenue);
}

export function computeOrdersComparison(orders: MinimalOrder[], range: string): PeriodComparison {
  const filtered = filterOrdersByRange(orders, range);
  const count = filtered.length;

  const now = new Date();
  let prevStart: Date, prevEnd: Date;
  switch (range) {
    case '7d':
      prevEnd = new Date(now.getTime() - 7 * 86400000);
      prevStart = new Date(now.getTime() - 14 * 86400000);
      break;
    case '30d':
      prevEnd = new Date(now.getTime() - 30 * 86400000);
      prevStart = new Date(now.getTime() - 60 * 86400000);
      break;
    case '6m':
      prevEnd = new Date(now.getTime() - 180 * 86400000);
      prevStart = new Date(now.getTime() - 360 * 86400000);
      break;
    case '1y':
      prevEnd = new Date(now.getTime() - 365 * 86400000);
      prevStart = new Date(now.getTime() - 730 * 86400000);
      break;
    default:
      return computePeriodComparison(count, 0);
  }
  const prevCount = orders.filter(o => {
    const d = new Date(o.createdAt);
    return d >= prevStart && d < prevEnd;
  }).length;

  return computePeriodComparison(count, prevCount);
}

export function computeAOVComparison(orders: MinimalOrder[], range: string): PeriodComparison {
  const filtered = filterOrdersByRange(orders, range);
  const nonCancelled = filtered.filter(o => o.status !== 'CANCELLED');
  const aov = nonCancelled.length > 0 ? Math.round(nonCancelled.reduce((s, o) => s + o.grandTotal, 0) / nonCancelled.length) : 0;

  const now = new Date();
  let prevStart: Date, prevEnd: Date;
  switch (range) {
    case '7d':
      prevEnd = new Date(now.getTime() - 7 * 86400000);
      prevStart = new Date(now.getTime() - 14 * 86400000);
      break;
    case '30d':
      prevEnd = new Date(now.getTime() - 30 * 86400000);
      prevStart = new Date(now.getTime() - 60 * 86400000);
      break;
    case '6m':
      prevEnd = new Date(now.getTime() - 180 * 86400000);
      prevStart = new Date(now.getTime() - 360 * 86400000);
      break;
    case '1y':
      prevEnd = new Date(now.getTime() - 365 * 86400000);
      prevStart = new Date(now.getTime() - 730 * 86400000);
      break;
    default:
      return computePeriodComparison(aov, 0);
  }
  const prevOrders = orders.filter(o => {
    const d = new Date(o.createdAt);
    return d >= prevStart && d < prevEnd && o.status !== 'CANCELLED';
  });
  const prevAov = prevOrders.length > 0 ? Math.round(prevOrders.reduce((s, o) => s + o.grandTotal, 0) / prevOrders.length) : 0;

  return computePeriodComparison(aov, prevAov);
}

// ── Customer Segmentation ──
export interface CustomerSegment {
  label: string;
  description: string;
  count: number;
  revenue: number;
  percentage: number;
}

export function computeCustomerSegmentation(customers: AdminCustomer[], orders: MinimalOrder[]): CustomerSegment[] {
  const orderCountMap = new Map<string, number>();
  const revenueMap = new Map<string, number>();
  for (const o of orders) {
    const key = o.buyer?.phone ?? o.buyerPhone ?? o.buyerName ?? 'unknown';
    orderCountMap.set(key, (orderCountMap.get(key) ?? 0) + 1);
    revenueMap.set(key, (revenueMap.get(key) ?? 0) + o.grandTotal);
  }

  const segments: { label: string; description: string; min: number; max: number }[] = [
    { label: 'One-time', description: '1 order only', min: 1, max: 1 },
    { label: 'Occasional', description: '2-3 orders', min: 2, max: 3 },
    { label: 'Regular', description: '4-5 orders', min: 4, max: 5 },
    { label: 'Loyal', description: '6+ orders', min: 6, max: Infinity },
  ];

  const totalCustomers = customers.length || 1;
  return segments.map(seg => {
    let count = 0;
    let revenue = 0;
    for (const [phone, cnt] of orderCountMap) {
      if (cnt >= seg.min && cnt <= seg.max) {
        count++;
        revenue += revenueMap.get(phone) ?? 0;
      }
    }
    return {
      label: seg.label,
      description: seg.description,
      count,
      revenue,
      percentage: Math.round((count / totalCustomers) * 100),
    };
  });
}

// ── Customer Lifetime Value ──
export interface CustomerCLV {
  customerId: string;
  name: string;
  orderCount: number;
  totalSpent: number;
  avgOrderValue: number;
  accountAgeDays: number;
  predictedCLV: number;
  frequencyPerMonth: number;
  churnRisk: 'Low' | 'Medium' | 'High';
}

export function computeCLV(customers: AdminCustomer[], orders: MinimalOrder[]): CustomerCLV[] {
  return customers.map(c => {
    const custOrders = orders.filter(o => {
      const phone = o.buyer?.phone ?? o.buyerPhone;
      return phone === c.phone;
    });
    const totalSpent = custOrders.reduce((s, o) => s + o.grandTotal, 0);
    const orderCount = custOrders.length;
    const avgOrderValue = orderCount > 0 ? Math.round(totalSpent / orderCount) : 0;

    const now = new Date();
    const registeredAt = new Date(c.registeredAt);
    const accountAgeDays = Math.max(1, Math.floor((now.getTime() - registeredAt.getTime()) / 86400000));
    const frequencyPerMonth = Math.round((orderCount / Math.max(1, accountAgeDays / 30)) * 10) / 10;

    const predictedCLV = Math.round(avgOrderValue * frequencyPerMonth * 12);

    const lastOrderDate = custOrders.length > 0
      ? new Date(Math.max(...custOrders.map(o => new Date(o.createdAt).getTime())))
      : registeredAt;
    const daysSinceLastOrder = Math.floor((now.getTime() - lastOrderDate.getTime()) / 86400000);
    const churnRisk: 'Low' | 'Medium' | 'High' =
      daysSinceLastOrder > 30 ? 'High' : daysSinceLastOrder > 14 ? 'Medium' : 'Low';

    return {
      customerId: c.id,
      name: c.name ?? '—',
      orderCount,
      totalSpent,
      avgOrderValue,
      accountAgeDays,
      predictedCLV,
      frequencyPerMonth,
      churnRisk,
    };
  });
}

// ── Sales Velocity ──
export interface ProductVelocity {
  name: string;
  totalUnits: number;
  totalRevenue: number;
  orderCount: number;
  avgDailySales: number;
  daysToStockout: number | null;
  suggestedReorderQty: number;
}

export function computeSalesVelocity(
  orders: MinimalOrder[],
  inventory: AdminInventoryItem[] = [],
): ProductVelocity[] {
  const sales = computeProductSales(orders);
  const inventoryMap = new Map<string, number>();
  for (const inv of inventory) {
    inventoryMap.set(inv.productName, inv.quantity);
  }

  const dateRange = orders.length > 0
    ? Math.max(1, Math.floor(
        (Math.max(...orders.map(o => new Date(o.createdAt).getTime())) -
         Math.min(...orders.map(o => new Date(o.createdAt).getTime()))) / 86400000
      ))
    : 1;

  return sales.map(s => {
    const avgDailySales = s.totalUnits / Math.max(1, dateRange);
    const stock = inventoryMap.get(s.name) ?? 0;
    const daysToStockout = avgDailySales > 0 ? Math.floor(stock / avgDailySales) : null;
    const suggestedReorderQty = Math.round(avgDailySales * 7);

    return {
      name: s.name,
      totalUnits: s.totalUnits,
      totalRevenue: s.totalRevenue,
      orderCount: s.orderCount,
      avgDailySales: Math.round(avgDailySales * 10) / 10,
      daysToStockout,
      suggestedReorderQty,
    };
  });
}

// ── Top/Bottom Products ──
export interface TopProduct {
  name: string;
  totalUnits: number;
  totalRevenue: number;
  orderCount: number;
}

export function computeTopProducts(n: number = 5): { top: TopProduct[]; bottom: TopProduct[] } {
  // const sales = computeProductSales();
  return { top: [], bottom: [] }; // demo removed
}

// ── Payment Trends ──
export interface PaymentMethodTrend {
  method: string;
  count: number;
  revenue: number;
  successCount: number;
  successRate: number;
  avgAmount: number;
}

export interface PaymentTrends {
  methods: PaymentMethodTrend[];
  overallSuccessRate: number;
  totalTransactions: number;
  totalRevenue: number;
}

export function computePaymentTrends(transactions: { method: string; amount: number; status: string }[]): PaymentTrends {
  const methodMap = new Map<string, { count: number; revenue: number; success: number }>();
  let totalRevenue = 0;
  let totalSuccess = 0;

  for (const t of transactions) {
    const e = methodMap.get(t.method) ?? { count: 0, revenue: 0, success: 0 };
    e.count++;
    e.revenue += t.amount;
    if (t.status === 'successful') {
      e.success++;
      totalSuccess++;
    }
    methodMap.set(t.method, e);
    totalRevenue += t.amount;
  }

  const methods: PaymentMethodTrend[] = [...methodMap.entries()]
    .map(([method, v]) => ({
      method,
      count: v.count,
      revenue: v.revenue,
      successCount: v.success,
      successRate: Math.round((v.success / Math.max(1, v.count)) * 1000) / 10,
      avgAmount: Math.round(v.revenue / Math.max(1, v.count)),
    }))
    .sort((a, b) => b.revenue - a.revenue);

  return {
    methods,
    overallSuccessRate: Math.round((totalSuccess / Math.max(1, transactions.length)) * 1000) / 10,
    totalTransactions: transactions.length,
    totalRevenue,
  };
}

// ── Order Patterns ──
export interface OrderPatterns {
  busiestHour: { hour: string; count: number };
  avgBasketSize: number;
  topPaymentMethod: string;
  channelBreakdown: { channel: string; count: number; revenue: number }[];
  dayOfWeekBreakdown: { day: string; count: number; revenue: number }[];
}

export function computeOrderPatterns(orders: MinimalOrder[]): OrderPatterns {
  const hourMap = new Map<number, number>();
  const channelMap = new Map<string, { count: number; revenue: number }>();
  const dayMap = new Map<string, { count: number; revenue: number }>();
  const paymentMap = new Map<string, number>();

  for (const o of orders) {
    const d = new Date(o.createdAt);
    const hour = d.getHours();
    hourMap.set(hour, (hourMap.get(hour) ?? 0) + 1);

    const ch = o.channel;
    const ce = channelMap.get(ch) ?? { count: 0, revenue: 0 };
    ce.count++;
    ce.revenue += o.grandTotal;
    channelMap.set(ch, ce);

    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const day = dayNames[d.getDay()];
    const de = dayMap.get(day) ?? { count: 0, revenue: 0 };
    de.count++;
    de.revenue += o.grandTotal;
    dayMap.set(day, de);

    const pm = o.paymentMethod ?? 'Unknown';
    paymentMap.set(pm, (paymentMap.get(pm) ?? 0) + 1);
  }

  let busiestHourNum = 0;
  let busiestCount = 0;
  for (const [h, c] of hourMap) {
    if (c > busiestCount) { busiestHourNum = h; busiestCount = c; }
  }

  const topPayment = [...paymentMap.entries()].sort((a, b) => b[1] - a[1])[0];

  const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const dayOfWeekBreakdown = dayOrder.map(d => ({
    day: d,
    count: dayMap.get(d)?.count ?? 0,
    revenue: dayMap.get(d)?.revenue ?? 0,
  }));

  return {
    busiestHour: { hour: `${busiestHourNum}:00`, count: busiestCount },
    avgBasketSize: 0,
    topPaymentMethod: topPayment?.[0] ?? '—',
    channelBreakdown: [...channelMap.entries()]
      .map(([channel, v]) => ({ channel, count: v.count, revenue: v.revenue }))
      .sort((a, b) => b.count - a.count),
    dayOfWeekBreakdown,
  };
}

// ── Daily Revenue Map ──
export function buildDailyRevenueMap(orders: MinimalOrder[]): Map<string, { revenue: number; count: number }> {
  const map = new Map<string, { revenue: number; count: number }>();
  for (const o of orders) {
    if (o.status === 'CANCELLED') continue;
    const key = o.createdAt.substring(0, 10);
    const e = map.get(key) ?? { revenue: 0, count: 0 };
    e.revenue += o.grandTotal;
    e.count++;
    map.set(key, e);
  }
  return map;
}

// ── Monthly Revenue ──
export function buildMonthlyRevenue(orders: MinimalOrder[]): { month: string; revenue: number; orders: number }[] {
  const map = new Map<string, { revenue: number; orders: number }>();
  for (const o of orders) {
    if (o.status === 'CANCELLED') continue;
    const key = o.createdAt.substring(0, 7);
    const e = map.get(key) ?? { revenue: 0, orders: 0 };
    e.revenue += o.grandTotal;
    e.orders++;
    map.set(key, e);
  }
  return [...map.entries()]
    .map(([month, v]) => ({ month, ...v }))
    .sort((a, b) => a.month.localeCompare(b.month));
}

// ── Category Revenue ──
export function computeCategoryRevenue(orders: MinimalOrder[]): { category: string; revenue: number; count: number }[] {
  const map = new Map<string, { revenue: number; count: number }>();
  for (const o of orders) {
    if (o.status === 'CANCELLED') continue;
    if (!o.items) continue;
    for (const item of o.items) {
      const cat = guessCategory(item.name);
      const e = map.get(cat) ?? { revenue: 0, count: 0 };
      e.revenue += item.lineTotal;
      e.count += item.qty;
      map.set(cat, e);
    }
  }
  return [...map.entries()]
    .map(([category, v]) => ({ category, ...v }))
    .sort((a, b) => b.revenue - a.revenue);
}

function guessCategory(name: string): string {
  const n = name.toLowerCase();
  if (n.includes('rice') || n.includes('lentil') || n.includes('dal') || n.includes('oil') || n.includes('seed') || n.includes('flour') || n.includes('honey') || n.includes('ghee') || n.includes('egg') || n.includes('nut') || n.includes('almond') || n.includes('cashew') || n.includes('walnut') || n.includes('peanut') || n.includes('oats') || n.includes('quinoa') || n.includes('jaggery') || n.includes('sugar') || n.includes('salt') || n.includes('pepper') || n.includes('cumin') || n.includes('coriander seed') || n.includes('cardamom') || n.includes('cinnamon') || n.includes('clove') || n.includes('asafoetida') || n.includes('fenugreek') || n.includes('mustard seed') || n.includes('coconut milk') || n.includes('paneer') || n.includes('curd') || n.includes('cheese') || n.includes('butter') || n.includes('masala') || n.includes('paste') || n.includes('flakes') || n.includes('chilli flake') || n.includes('dry red') || n.includes('star anise') || n.includes('mango powder') || n.includes('dried coconut') || n.includes('dried fenugreek') || n.includes('tapioca') || n.includes('ragi') || n.includes('mung') || n.includes('chickpea') || n.includes('frozen')) return 'Groceries';
  if (n.includes('juice') || n.includes('tea') || n.includes('coffee') || n.includes('lassi') || n.includes('milk') || n.includes('water') || n.includes('sarbath') || n.includes('cooler') || n.includes('vinegar') || n.includes('shake') || n.includes('chai') || n.includes('latte') || n.includes('sarbat') || n.includes('sherbet') || n.includes('barley')) return 'Beverages';
  if (n.includes('mango') || n.includes('banana') || n.includes('apple') || n.includes('grape') || n.includes('orange') || n.includes('lemon') || n.includes('kiwi') || n.includes('avocado') || n.includes('blueberry') || n.includes('passion') || n.includes('guava') || n.includes('chiku') || n.includes('jackfruit') || n.includes('rambutan') || n.includes('longan') || n.includes('star fruit') || n.includes('custard') || n.includes('pear') || n.includes('date') || n.includes('fig') || n.includes('plum') || n.includes('cherry') || n.includes('coconut') || n.includes('soursop') || n.includes('peach') || n.includes('raspberry') || n.includes('tamarind') || n.includes('grapefruit') || n.includes('melon') || n.includes('lychee') || n.includes('apricot') || n.includes('blossom') || n.includes('papaya') || n.includes('pineapple') || n.includes('watermelon') || n.includes('pomegranate') || n.includes('dragon') || n.includes('durian') || n.includes('mangosteen') || n.includes('pomelo') || n.includes('langsat') || n.includes('salak') || n.includes('java apple') || n.includes('gooseberry') || n.includes('rose apple') || n.includes('rose myrtle') || n.includes('snake fruit')) return 'Fruits';
  return 'Vegetables';
}

// ── Day of Week Data (from actual orders) ──
export function computeDayOfWeekData(orders: MinimalOrder[]): { day: string; orders: number; revenue: number }[] {
  const map = new Map<string, { orders: number; revenue: number }>();
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  for (const d of dayNames) map.set(d, { orders: 0, revenue: 0 });

  for (const o of orders) {
    if (o.status === 'CANCELLED') continue;
    const day = dayNames[new Date(o.createdAt).getDay()];
    const e = map.get(day)!;
    e.orders++;
    e.revenue += o.grandTotal;
  }

  return dayNames.map(day => ({ day, ...map.get(day)! }));
}

// ── Order Value Distribution ──
export function computeOrderValueDistribution(orders: MinimalOrder[]): { range: string; count: number; percentage: number }[] {
  const nonCancelled = orders.filter(o => o.status !== 'CANCELLED');
  const ranges = [
    { label: 'Under 100', min: 0, max: 100 },
    { label: '100-500', min: 100, max: 500 },
    { label: '500-1000', min: 500, max: 1000 },
    { label: '1000-2000', min: 1000, max: 2000 },
    { label: 'Over 2000', min: 2000, max: Infinity },
  ];

  const total = nonCancelled.length || 1;
  return ranges.map(r => {
    const count = nonCancelled.filter(o => o.grandTotal >= r.min && o.grandTotal < r.max).length;
    return { range: r.label, count, percentage: Math.round((count / total) * 100) };
  });
}

// ── Delivery Performance (from order statuses) ──
export function computeDeliveryPerformance(orders: MinimalOrder[]): {
  delivered: number;
  cancelled: number;
  inProgress: number;
  deliveredPct: number;
  cancelledPct: number;
  inProgressPct: number;
} {
  const total = orders.length || 1;
  const delivered = orders.filter(o => o.status === 'DELIVERED').length;
  const cancelled = orders.filter(o => o.status === 'CANCELLED').length;
  const inProgress = orders.length - delivered - cancelled;
  return {
    delivered,
    cancelled,
    inProgress,
    deliveredPct: Math.round((delivered / total) * 100),
    cancelledPct: Math.round((cancelled / total) * 100),
    inProgressPct: Math.round((inProgress / total) * 100),
  };
}

// ── Recent High Value Orders ──
export function computeRecentHighValueOrders(orders: MinimalOrder[], n: number = 5): MinimalOrder[] {
  return orders
    .filter(o => o.status !== 'CANCELLED')
    .sort((a, b) => b.grandTotal - a.grandTotal)
    .slice(0, n);
}

// ── Stock Status (fixed logic) ──
export function getStockStatus(quantity: number): 'In Stock' | 'Low Stock' | 'Out of Stock' {
  if (quantity <= 0) return 'Out of Stock';
  if (quantity <= 100) return 'Low Stock';
  return 'In Stock';
}
