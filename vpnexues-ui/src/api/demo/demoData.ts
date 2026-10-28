import type {
  AdminCustomer,
  AdminInventoryItem,
  AdminOrderDetail,
  AdminOrderSummary,
  AdminProduct,
  AdminUserSummary,
  B2BEnquiry,
  Category,
  ContactMessage,
  StoreSettings,
  Testimonial,
} from '../../types';

export const DEMO_CATEGORIES: Category[] = [
  { id: 'cat-veg', name: 'Vegetables', slug: 'vegetables', emoji: 'ðŸ¥¬', active: true },
  { id: 'cat-fruit', name: 'Fruits', slug: 'fruits', emoji: 'ðŸŽ', active: true },
  { id: 'cat-grocery', name: 'Groceries', slug: 'groceries', emoji: 'ðŸ›’', active: true },
  { id: 'cat-bev', name: 'Beverages', slug: 'beverages', emoji: 'ðŸ§ƒ', active: true },
  { id: 'cat-spice', name: 'Spices', slug: 'spices', emoji: 'ðŸŒ¶ï¸', active: true },
];

export const DEMO_PRODUCTS: AdminProduct[] = [
  { id: 'p-GPNX-002', name: 'Vine Tomatoes', slug: 'vine-tomatoes', category: 'Vegetables', description: null, basePrice: 30, oldPrice: 40, unit: 'per kg', sku: 'GPNX-002', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001329/vpnexues/Vine%20Tomatoes.jpg', discountPct: 21, badges: ['Organic'], active: true, createdAt: '2026-02-02T00:00:00' },
  { id: 'p-GPNX-001', name: 'Organic Carrots', slug: 'organic-carrots', category: 'Vegetables', description: null, basePrice: 45, oldPrice: 56, unit: 'per 500g', sku: 'GPNX-001', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001247/vpnexues/Organic%20Carrots.jpg', discountPct: 20, badges: ['Organic'], active: true, createdAt: '2026-01-01T00:00:00' },
  { id: 'p-GPNX-005', name: 'Red Onions', slug: 'red-onions', category: 'Vegetables', description: null, basePrice: 45, oldPrice: 56, unit: 'per kg', sku: 'GPNX-005', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001286/vpnexues/Red%20Onions.jpg', discountPct: 20, badges: ['Organic'], active: true, createdAt: '2026-05-05T00:00:00' },
  { id: 'p-GPNX-024', name: 'Okra / Ladyfinger', slug: 'okra-ladyfinger', category: 'Vegetables', description: null, basePrice: 12, oldPrice: 15, unit: 'per 300g', sku: 'GPNX-024', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001239/vpnexues/Okra%20-%20Ladyfinger.jpg', discountPct: 20, badges: [], active: true, createdAt: '2026-08-24T00:00:00' },
  { id: 'p-GPNX-031', name: 'Drumstick (Moringa)', slug: 'drumstick-moringa', category: 'Vegetables', description: null, basePrice: 15, oldPrice: 19, unit: 'per bunch', sku: 'GPNX-031', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001222/vpnexues/Moringa%20Drumsticks.jpg', discountPct: 21, badges: [], active: true, createdAt: '2026-07-03T00:00:00' },
  { id: 'p-GPNX-036', name: 'Chilli Peppers', slug: 'chilli-peppers', category: 'Vegetables', description: null, basePrice: 5, oldPrice: 6, unit: 'per 100g', sku: 'GPNX-036', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001032/vpnexues/Chilli%20Peppers.jpg', discountPct: 17, badges: [], active: true, createdAt: '2026-04-08T00:00:00' },
  { id: 'p-GPNX-049', name: 'Snake Gourd', slug: 'snake-gourd', category: 'Vegetables', description: null, basePrice: 13, oldPrice: 17, unit: 'per pc', sku: 'GPNX-049', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001287/vpnexues/Ridge%20Gourd.jpg', discountPct: 24, badges: [], active: true, createdAt: '2026-01-21T00:00:00' },
  { id: 'p-GPNX-028', name: 'Bitter Gourd', slug: 'bitter-gourd', category: 'Vegetables', description: null, basePrice: 22, oldPrice: 28, unit: 'per 500g', sku: 'GPNX-028', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790000995/vpnexues/Bitter%20Gourd%20Organic.jpg', discountPct: 21, badges: [], active: true, createdAt: '2026-04-28T00:00:00' },
  { id: 'p-GPNX-047', name: 'Ridge Gourd', slug: 'ridge-gourd', category: 'Vegetables', description: null, basePrice: 15, oldPrice: 19, unit: 'per pc', sku: 'GPNX-047', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001287/vpnexues/Ridge%20Gourd.jpg', discountPct: 21, badges: [], active: true, createdAt: '2026-07-19T00:00:00' },
  { id: 'p-GPNX-013', name: 'Cauliflower', slug: 'cauliflower', category: 'Vegetables', description: null, basePrice: 35, oldPrice: 44, unit: 'per pc', sku: 'GPNX-013', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001017/vpnexues/Cauliflower.jpg', discountPct: 20, badges: [], active: true, createdAt: '2026-05-13T00:00:00' },
  { id: 'p-GPNX-006', name: 'Bell Peppers Mix', slug: 'bell-peppers-mix', category: 'Vegetables', description: null, basePrice: 100, oldPrice: 120, unit: 'per 3 pcs', sku: 'GPNX-006', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790000990/vpnexues/Bell%20Peppers%20Mix.jpg', discountPct: 17, badges: ['Organic'], active: true, createdAt: '2026-06-06T00:00:00' },
  { id: 'p-GPNX-035', name: 'Coriander', slug: 'curry-leaves', category: 'Vegetables', description: null, basePrice: 25, oldPrice: 30, unit: 'per bunch', sku: 'GPNX-035', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001076/vpnexues/Curry%20Leaves.jpg', discountPct: 17, badges: [], active: true, createdAt: '2026-03-07T00:00:00' },
  { id: 'p-GPNX-016', name: 'Green Beans', slug: 'green-beans', category: 'Vegetables', description: null, basePrice: 15, oldPrice: 19, unit: 'per 300g', sku: 'GPNX-016', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001163/vpnexues/Green%20Beans.jpg', discountPct: 21, badges: [], active: true, createdAt: '2026-08-16T00:00:00' },
  { id: 'p-GPNX-015', name: 'Sweet Potato', slug: 'sweet-potato', category: 'Vegetables', description: null, basePrice: 30, oldPrice: 38, unit: 'per kg', sku: 'GPNX-015', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001313/vpnexues/Sweet%20Potato.jpg', discountPct: 21, badges: [], active: true, createdAt: '2026-07-15T00:00:00' },
  { id: 'p-GPNX-020', name: 'Pumpkin', slug: 'pumpkin', category: 'Vegetables', description: null, basePrice: 26, oldPrice: 33, unit: 'per kg', sku: 'GPNX-020', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001270/vpnexues/Pumpkin.jpg', discountPct: 21, badges: [], active: true, createdAt: '2026-04-20T00:00:00' },
  { id: 'p-GPNX-003', name: 'Baby Spinach', slug: 'baby-spinach', category: 'Vegetables', description: null, basePrice: 25, oldPrice: 32, unit: 'per 200g', sku: 'GPNX-003', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790000973/vpnexues/Baby%20Spinach.jpg', discountPct: 22, badges: ['Organic'], active: true, createdAt: '2026-03-03T00:00:00' },
  { id: 'p-GPNX-004', name: 'Sweet Corn', slug: 'sweet-corn', category: 'Vegetables', description: null, basePrice: 25, oldPrice: 32, unit: 'per pc', sku: 'GPNX-004', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001311/vpnexues/Sweet%20Corn.jpg', discountPct: 22, badges: ['Organic'], active: true, createdAt: '2026-04-04T00:00:00' },
  { id: 'p-GPNX-007', name: 'Broccoli Head', slug: 'broccoli-head', category: 'Vegetables', description: null, basePrice: 60, oldPrice: 75, unit: 'per pc', sku: 'GPNX-007', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001000/vpnexues/Broccoli%20Head.jpg', discountPct: 20, badges: ['Organic'], active: true, createdAt: '2026-07-07T00:00:00' },
  { id: 'p-GPNX-008', name: 'Cucumber', slug: 'cucumber', category: 'Vegetables', description: null, basePrice: 15, oldPrice: 20, unit: 'per pc', sku: 'GPNX-008', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001067/vpnexues/Cucumber.jpg', discountPct: 25, badges: ['Organic'], active: true, createdAt: '2026-08-08T00:00:00' },
  { id: 'p-GPNX-009', name: 'Zucchini', slug: 'zucchini', category: 'Vegetables', description: null, basePrice: 35, oldPrice: 44, unit: 'per 500g', sku: 'GPNX-009', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001347/vpnexues/Zucchini.jpg', discountPct: 20, badges: ['Organic'], active: true, createdAt: '2026-01-09T00:00:00' },
  { id: 'p-GPNX-010', name: 'Cherry Tomatoes', slug: 'cherry-tomatoes', category: 'Vegetables', description: null, basePrice: 49, oldPrice: 50, unit: 'per 250g', sku: 'GPNX-010', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001025/vpnexues/Cherry%20Tomatoes.jpg', discountPct: 23, badges: ['Organic'], active: true, createdAt: '2026-02-10T00:00:00' },
  { id: 'p-GPNX-011', name: 'Kale Bunch', slug: 'kale-bunch', category: 'Vegetables', description: null, basePrice: 25, oldPrice: 32, unit: 'per bunch', sku: 'GPNX-011', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001192/vpnexues/Kale%20Bunch.jpg', discountPct: 22, badges: [], active: true, createdAt: '2026-03-11T00:00:00' },
  { id: 'p-GPNX-012', name: 'Purple Cabbage', slug: 'purple-cabbage', category: 'Vegetables', description: null, basePrice: 35, oldPrice: 44, unit: 'per pc', sku: 'GPNX-012', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001272/vpnexues/Purple%20Cabbage.jpg', discountPct: 20, badges: [], active: true, createdAt: '2026-04-12T00:00:00' },
  { id: 'p-GPNX-014', name: 'White Radish', slug: 'white-radish', category: 'Vegetables', description: null, basePrice: 35, oldPrice: 44, unit: 'per kg', sku: 'GPNX-014', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001336/vpnexues/White%20Radish.jpg', discountPct: 20, badges: [], active: true, createdAt: '2026-06-14T00:00:00' },
  { id: 'p-GPNX-017', name: 'Leek', slug: 'leek', category: 'Vegetables', description: null, basePrice: 20, oldPrice: 25, unit: 'per 2 pcs', sku: 'GPNX-017', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001200/vpnexues/Leek.jpg', discountPct: 20, badges: [], active: true, createdAt: '2026-01-17T00:00:00' },
  { id: 'p-GPNX-018', name: 'Beetroot', slug: 'beetroot', category: 'Vegetables', description: null, basePrice: 35, oldPrice: 44, unit: 'per kg', sku: 'GPNX-018', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790000988/vpnexues/Beetroot.jpg', discountPct: 20, badges: [], active: true, createdAt: '2026-02-18T00:00:00' },
  { id: 'p-GPNX-019', name: 'Celery', slug: 'celery', category: 'Vegetables', description: null, basePrice: 15, oldPrice: 20, unit: 'per bunch', sku: 'GPNX-019', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001019/vpnexues/Celery.jpg', discountPct: 25, badges: [], active: true, createdAt: '2026-03-19T00:00:00' },
  { id: 'p-GPNX-021', name: 'Eggplant', slug: 'eggplant', category: 'Vegetables', description: null, basePrice: 25, oldPrice: 32, unit: 'per pc', sku: 'GPNX-021', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001096/vpnexues/Eggplant.jpg', discountPct: 22, badges: [], active: true, createdAt: '2026-05-21T00:00:00' },
  { id: 'p-GPNX-022', name: 'Asparagus', slug: 'asparagus', category: 'Vegetables', description: null, basePrice: 120, oldPrice: 150, unit: 'per bunch', sku: 'GPNX-022', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790000971/vpnexues/Asparagus.jpg', discountPct: 20, badges: [], active: true, createdAt: '2026-06-22T00:00:00' },
  { id: 'p-GPNX-023', name: 'Pak Choi', slug: 'pak-choi', category: 'Vegetables', description: null, basePrice: 20, oldPrice: 25, unit: 'per bunch', sku: 'GPNX-023', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001251/vpnexues/Pak%20Choi.jpg', discountPct: 20, badges: [], active: true, createdAt: '2026-07-23T00:00:00' },
  { id: 'p-GPNX-025', name: 'Spring Onions', slug: 'spring-onions', category: 'Vegetables', description: null, basePrice: 15, oldPrice: 20, unit: 'per bunch', sku: 'GPNX-025', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001304/vpnexues/Spring%20Onions.jpg', discountPct: 25, badges: [], active: true, createdAt: '2026-01-25T00:00:00' },
  { id: 'p-GPNX-026', name: 'Coriander', slug: 'coriander', category: 'Vegetables', description: null, basePrice: 12, oldPrice: 15, unit: 'per bunch', sku: 'GPNX-026', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001060/vpnexues/Coriander%20Seeds.jpg', discountPct: 20, badges: [], active: true, createdAt: '2026-02-26T00:00:00' },
  { id: 'p-GPNX-027', name: 'Mint Leaves', slug: 'mint-leaves', category: 'Vegetables', description: null, basePrice: 12, oldPrice: 15, unit: 'per bunch', sku: 'GPNX-027', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001217/vpnexues/Mint%20Leaves.jpg', discountPct: 20, badges: [], active: true, createdAt: '2026-03-27T00:00:00' },
  { id: 'p-GPNX-029', name: 'Long Beans', slug: 'long-beans', category: 'Vegetables', description: null, basePrice: 14, oldPrice: 18, unit: 'per 300g', sku: 'GPNX-029', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001344/vpnexues/Yardlong%20Beans.jpg', discountPct: 22, badges: [], active: true, createdAt: '2026-05-01T00:00:00' },
  { id: 'p-GPNX-030', name: 'French Beans', slug: 'french-beans', category: 'Vegetables', description: null, basePrice: 20, oldPrice: 25, unit: 'per 250g', sku: 'GPNX-030', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001107/vpnexues/French%20Beans.jpg', discountPct: 20, badges: [], active: true, createdAt: '2026-06-02T00:00:00' },
  // "Bottle Gourd.jpg" on Cloudinary is really a green chilli photo; the true bottle gourd
  // shot lives under the mis-named "Bitter Gourd.jpg" asset (v1790000995).
  { id: 'p-GPNX-032', name: 'Bottle Gourd', slug: 'bottle-gourd', category: 'Vegetables', description: null, basePrice: 20, oldPrice: 25, unit: 'per pc', sku: 'GPNX-032', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790000995/vpnexues/Bitter%20Gourd.jpg', discountPct: 20, badges: [], active: true, createdAt: '2026-08-04T00:00:00' },
  { id: 'p-GPNX-033', name: 'Taro Root', slug: 'taro-root', category: 'Vegetables', description: null, basePrice: 35, oldPrice: 44, unit: 'per kg', sku: 'GPNX-033', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001320/vpnexues/Taro%20Root.jpg', discountPct: 20, badges: [], active: true, createdAt: '2026-01-05T00:00:00' },
  { id: 'p-GPNX-034', name: 'Lotus Root', slug: 'lotus-root', category: 'Vegetables', description: null, basePrice: 35, oldPrice: 44, unit: 'per 500g', sku: 'GPNX-034', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001206/vpnexues/Lotus%20Root.jpg', discountPct: 20, badges: [], active: true, createdAt: '2026-02-06T00:00:00' },
  { id: 'p-GPNX-037', name: 'Green Capsicum', slug: 'green-capsicum', category: 'Vegetables', description: null, basePrice: 55, oldPrice: 70, unit: 'per 3 pcs', sku: 'GPNX-037', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790000990/vpnexues/Bell%20Peppers%20Mix.jpg', discountPct: 21, badges: [], active: true, createdAt: '2026-05-09T00:00:00' },
  { id: 'p-GPNX-038', name: 'Watercress', slug: 'watercress', category: 'Vegetables', description: null, basePrice: 15, oldPrice: 20, unit: 'per bunch', sku: 'GPNX-038', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001332/vpnexues/Watercress.jpg', discountPct: 25, badges: [], active: true, createdAt: '2026-06-10T00:00:00' },
  { id: 'p-GPNX-039', name: 'Yam (Purple)', slug: 'yam-purple', category: 'Vegetables', description: null, basePrice: 35, oldPrice: 44, unit: 'per kg', sku: 'GPNX-039', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001274/vpnexues/Purple%20Sweet%20Potato.jpg', discountPct: 20, badges: [], active: true, createdAt: '2026-07-11T00:00:00' },
  { id: 'p-GPNX-040', name: 'Bitter Melon', slug: 'bitter-melon', category: 'Vegetables', description: null, basePrice: 22, oldPrice: 28, unit: 'per 500g', sku: 'GPNX-040', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790000996/vpnexues/Bitter%20Melon.jpg', discountPct: 21, badges: [], active: true, createdAt: '2026-08-12T00:00:00' },
  { id: 'p-GPNX-041', name: 'Iceberg Lettuce', slug: 'iceberg-lettuce', category: 'Vegetables', description: null, basePrice: 20, oldPrice: 25, unit: 'per pc', sku: 'GPNX-041', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001182/vpnexues/Iceberg%20Lettuce.jpg', discountPct: 20, badges: [], active: true, createdAt: '2026-01-13T00:00:00' },
  { id: 'p-GPNX-042', name: 'Butterhead Lettuce', slug: 'butterhead-lettuce', category: 'Vegetables', description: null, basePrice: 25, oldPrice: 30, unit: 'per pc', sku: 'GPNX-042', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001063/vpnexues/Cos%20Lettuce.jpg', discountPct: 17, badges: [], active: true, createdAt: '2026-02-14T00:00:00' },
  { id: 'p-GPNX-043', name: 'Turnip', slug: 'turnip', category: 'Vegetables', description: null, basePrice: 35, oldPrice: 44, unit: 'per kg', sku: 'GPNX-043', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001152/vpnexues/Fresh%20Turnips.jpg', discountPct: 20, badges: [], active: true, createdAt: '2026-03-15T00:00:00' },
  { id: 'p-GPNX-044', name: 'Fennel Bulb', slug: 'fennel-bulb', category: 'Vegetables', description: null, basePrice: 40, oldPrice: 50, unit: 'per pc', sku: 'GPNX-044', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001121/vpnexues/Fresh%20Fennel.jpg', discountPct: 20, badges: [], active: true, createdAt: '2026-04-16T00:00:00' },
  { id: 'p-GPNX-045', name: 'Pointed Gourd', slug: 'pointed-gourd', category: 'Vegetables', description: null, basePrice: 20, oldPrice: 25, unit: 'per 500g', sku: 'GPNX-045', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001258/vpnexues/Pointed%20Gourd.jpg', discountPct: 20, badges: [], active: true, createdAt: '2026-05-17T00:00:00' },
  { id: 'p-GPNX-046', name: 'Cluster Beans', slug: 'cluster-beans', category: 'Vegetables', description: null, basePrice: 11, oldPrice: 14, unit: 'per 300g', sku: 'GPNX-046', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001107/vpnexues/French%20Beans.jpg', discountPct: 21, badges: [], active: true, createdAt: '2026-06-18T00:00:00' },
  { id: 'p-GPNX-048', name: 'Colocasia Leaves', slug: 'colocasia-leaves', category: 'Vegetables', description: null, basePrice: 12, oldPrice: 15, unit: 'per bunch', sku: 'GPNX-048', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001058/vpnexues/Colocasia%20Leaves.jpg', discountPct: 20, badges: [], active: true, createdAt: '2026-08-20T00:00:00' },
  { id: 'p-GPNX-050', name: 'Banana Flower', slug: 'banana-flower', category: 'Vegetables', description: null, basePrice: 6, oldPrice: 8, unit: 'per pc', sku: 'GPNX-050', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790000978/vpnexues/Banana%20Flower.jpg', discountPct: 25, badges: [], active: true, createdAt: '2026-02-22T00:00:00' },
  { id: 'p-GPNX-054', name: 'Green Apples', slug: 'green-apples', category: 'Fruits', description: null, basePrice: 220, oldPrice: 260, unit: 'per kg', sku: 'GPNX-054', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001162/vpnexues/Green%20Apples.jpg', discountPct: 15, badges: [], active: true, createdAt: '2026-06-26T00:00:00' },
  { id: 'p-GPNX-061', name: 'Orange Navel', slug: 'orange-navel', category: 'Fruits', description: null, basePrice: 62, oldPrice: 81, unit: 'per kg', sku: 'GPNX-061', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001137/vpnexues/Fresh%20Oranges.jpg', discountPct: 23, badges: [], active: true, createdAt: '2026-05-05T00:00:00' },
  { id: 'p-GPNX-059', name: 'Red Grapes', slug: 'red-grapes', category: 'Fruits', description: null, basePrice: 100, oldPrice: 130, unit: 'per 500g', sku: 'GPNX-059', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001283/vpnexues/Red%20Grapes.jpg', discountPct: 23, badges: [], active: true, createdAt: '2026-03-03T00:00:00' },
  { id: 'p-GPNX-056', name: 'Pomegranate', slug: 'pomegranate', category: 'Fruits', description: null, basePrice: 150, oldPrice: 180, unit: 'per 2 pcs', sku: 'GPNX-056', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001145/vpnexues/Fresh%20Pomegranate.jpg', discountPct: 17, badges: [], active: true, createdAt: '2026-08-28T00:00:00' },
  { id: 'p-GPNX-057', name: 'Fresh Pineapple', slug: 'fresh-pineapple', category: 'Fruits', description: null, basePrice: 40, oldPrice: 50, unit: 'per pc', sku: 'GPNX-057', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001142/vpnexues/Fresh%20Pineapple.jpg', discountPct: 20, badges: [], active: true, createdAt: '2026-01-01T00:00:00' },
  { id: 'p-GPNX-067', name: 'Guava', slug: 'guava', category: 'Fruits', description: null, basePrice: 54, oldPrice: 70, unit: 'per 500g', sku: 'GPNX-067', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001126/vpnexues/Fresh%20Guava.jpg', discountPct: 23, badges: [], active: true, createdAt: '2026-03-11T00:00:00' },
  { id: 'p-GPNX-068', name: 'Sapodilla (Chiku)', slug: 'sapodilla-chiku', category: 'Fruits', description: null, basePrice: 46, oldPrice: 60, unit: 'per 500g', sku: 'GPNX-068', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001295/vpnexues/Sapodilla.jpg', discountPct: 23, badges: [], active: true, createdAt: '2026-04-12T00:00:00' },
  { id: 'p-GPNX-052', name: 'Fresh Bananas', slug: 'fresh-bananas', category: 'Fruits', description: null, basePrice: 40, oldPrice: 50, unit: 'per bunch', sku: 'GPNX-052', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001114/vpnexues/Fresh%20Bananas.jpg', discountPct: 20, badges: [], active: true, createdAt: '2026-04-24T00:00:00' },
  { id: 'p-GPNX-063', name: 'Kiwi Fruit', slug: 'kiwi-fruit', category: 'Fruits', description: null, basePrice: 120, oldPrice: 140, unit: 'per 4 pcs', sku: 'GPNX-063', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001193/vpnexues/Kiwi%20Fruit.jpg', discountPct: 14, badges: [], active: true, createdAt: '2026-07-07T00:00:00' },
  { id: 'p-GPNX-070', name: 'Rambutan', slug: 'rambutan', category: 'Fruits', description: null, basePrice: 65, oldPrice: 81, unit: 'per 500g', sku: 'GPNX-070', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001279/vpnexues/Rambutan.jpg', discountPct: 20, badges: [], active: true, createdAt: '2026-06-14T00:00:00' },
  { id: 'p-GPNX-060', name: 'Strawberries', slug: 'strawberries', category: 'Fruits', description: null, basePrice: 150, oldPrice: 180, unit: 'per 250g', sku: 'GPNX-060', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001148/vpnexues/Fresh%20Strawberries.jpg', discountPct: 17, badges: [], active: true, createdAt: '2026-04-04T00:00:00' },
  { id: 'p-GPNX-053', name: 'Dragon Fruit (White)', slug: 'dragon-fruit-white', category: 'Fruits', description: null, basePrice: 75, oldPrice: 90, unit: 'per pc', sku: 'GPNX-053', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001083/vpnexues/Dragon%20Fruit.jpg', discountPct: 17, badges: [], active: true, createdAt: '2026-05-25T00:00:00' },
  { id: 'p-GPNX-051', name: 'Alphonso Mango', slug: 'alphonso-mango', category: 'Fruits', description: null, basePrice: 180, oldPrice: 220, unit: 'per 3 pcs', sku: 'GPNX-051', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790000963/vpnexues/Alphonso%20Mango.jpg', discountPct: 18, badges: [], active: true, createdAt: '2026-03-23T00:00:00' },
  { id: 'p-GPNX-055', name: 'Papaya', slug: 'papaya', category: 'Fruits', description: null, basePrice: 55, oldPrice: 70, unit: 'per kg', sku: 'GPNX-055', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001138/vpnexues/Fresh%20Papaya.jpg', discountPct: 21, badges: [], active: true, createdAt: '2026-07-27T00:00:00' },
  { id: 'p-GPNX-058', name: 'Watermelon', slug: 'watermelon', category: 'Fruits', description: null, basePrice: 30, oldPrice: 38, unit: 'per pc', sku: 'GPNX-058', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001334/vpnexues/Watermelon.jpg', discountPct: 21, badges: [], active: true, createdAt: '2026-02-02T00:00:00' },
  { id: 'p-GPNX-062', name: 'Lemon', slug: 'lemon', category: 'Fruits', description: null, basePrice: 30, oldPrice: 38, unit: 'per 6 pcs', sku: 'GPNX-062', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001129/vpnexues/Fresh%20Lemons.jpg', discountPct: 21, badges: [], active: true, createdAt: '2026-06-06T00:00:00' },
  { id: 'p-GPNX-064', name: 'Ripe Avocado', slug: 'ripe-avocado', category: 'Fruits', description: null, basePrice: 180, oldPrice: 220, unit: 'per 2 pcs', sku: 'GPNX-064', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001111/vpnexues/Fresh%20Avocado.jpg', discountPct: 18, badges: [], active: true, createdAt: '2026-08-08T00:00:00' },
  { id: 'p-GPNX-065', name: 'Blueberries', slug: 'blueberries', category: 'Fruits', description: null, basePrice: 200, oldPrice: 240, unit: 'per 125g', sku: 'GPNX-065', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001115/vpnexues/Fresh%20Blueberries.jpg', discountPct: 17, badges: [], active: true, createdAt: '2026-01-09T00:00:00' },
  { id: 'p-GPNX-066', name: 'Passion Fruit', slug: 'passion-fruit', category: 'Fruits', description: null, basePrice: 42, oldPrice: 52, unit: 'per 4 pcs', sku: 'GPNX-066', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001254/vpnexues/Passion%20Fruit.jpg', discountPct: 19, badges: [], active: true, createdAt: '2026-02-10T00:00:00' },
  { id: 'p-GPNX-069', name: 'Jackfruit', slug: 'jackfruit', category: 'Fruits', description: null, basePrice: 30, oldPrice: 38, unit: 'per 500g', sku: 'GPNX-069', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001127/vpnexues/Fresh%20Jackfruit.jpg', discountPct: 21, badges: [], active: true, createdAt: '2026-05-13T00:00:00' },
  { id: 'p-GPNX-071', name: 'Longan', slug: 'longan', category: 'Fruits', description: null, basePrice: 60, oldPrice: 80, unit: 'per 500g', sku: 'GPNX-071', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001203/vpnexues/Longan.jpg', discountPct: 25, badges: [], active: true, createdAt: '2026-07-15T00:00:00' },
  { id: 'p-GPNX-072', name: 'Star Fruit', slug: 'star-fruit', category: 'Fruits', description: null, basePrice: 42, oldPrice: 60, unit: 'per 3 pcs', sku: 'GPNX-072', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001307/vpnexues/Star%20Fruit.jpg', discountPct: 30, badges: [], active: true, createdAt: '2026-08-16T00:00:00' },
  { id: 'p-GPNX-073', name: 'Custard Apple', slug: 'custard-apple', category: 'Fruits', description: null, basePrice: 55, oldPrice: 70, unit: 'per pc', sku: 'GPNX-073', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001079/vpnexues/Custard%20Apple.jpg', discountPct: 21, badges: [], active: true, createdAt: '2026-01-17T00:00:00' },
  { id: 'p-GPNX-074', name: 'Pear', slug: 'pear', category: 'Fruits', description: null, basePrice: 100, oldPrice: 130, unit: 'per kg', sku: 'GPNX-074', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001170/vpnexues/Green%20Pears.jpg', discountPct: 23, badges: [], active: true, createdAt: '2026-02-18T00:00:00' },
  { id: 'p-GPNX-075', name: 'Dates Medjool', slug: 'dates-medjool', category: 'Fruits', description: null, basePrice: 150, oldPrice: 180, unit: 'per 250g', sku: 'GPNX-075', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001215/vpnexues/Medjool%20Dates.jpg', discountPct: 17, badges: [], active: true, createdAt: '2026-03-19T00:00:00' },
  { id: 'p-GPNX-076', name: 'Fig', slug: 'fig', category: 'Fruits', description: null, basePrice: 120, oldPrice: 145, unit: 'per 250g', sku: 'GPNX-076', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001122/vpnexues/Fresh%20Figs.jpg', discountPct: 17, badges: [], active: true, createdAt: '2026-04-20T00:00:00' },
  { id: 'p-GPNX-077', name: 'Plums', slug: 'plums', category: 'Fruits', description: null, basePrice: 120, oldPrice: 150, unit: 'per 500g', sku: 'GPNX-077', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001144/vpnexues/Fresh%20Plums.jpg', discountPct: 20, badges: [], active: true, createdAt: '2026-05-21T00:00:00' },
  { id: 'p-GPNX-078', name: 'Cherries', slug: 'cherries', category: 'Fruits', description: null, basePrice: 180, oldPrice: 220, unit: 'per 250g', sku: 'GPNX-078', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001117/vpnexues/Fresh%20Cherries.jpg', discountPct: 18, badges: [], active: true, createdAt: '2026-06-22T00:00:00' },
  { id: 'p-GPNX-079', name: 'Red Banana', slug: 'red-banana', category: 'Fruits', description: null, basePrice: 40, oldPrice: 50, unit: 'per bunch', sku: 'GPNX-079', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001282/vpnexues/Red%20Bananas.jpg', discountPct: 20, badges: [], active: true, createdAt: '2026-07-23T00:00:00' },
  { id: 'p-GPNX-080', name: 'Coconut (Fresh)', slug: 'coconut-fresh', category: 'Fruits', description: null, basePrice: 22, oldPrice: 28, unit: 'per pc', sku: 'GPNX-080', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001119/vpnexues/Fresh%20Coconut.jpg', discountPct: 21, badges: [], active: true, createdAt: '2026-08-24T00:00:00' },
  { id: 'p-GPNX-081', name: 'Soursop', slug: 'soursop', category: 'Fruits', description: null, basePrice: 50, oldPrice: 65, unit: 'per pc', sku: 'GPNX-081', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001301/vpnexues/Soursop.jpg', discountPct: 23, badges: [], active: true, createdAt: '2026-01-25T00:00:00' },
  { id: 'p-GPNX-082', name: 'Peaches', slug: 'peaches', category: 'Fruits', description: null, basePrice: 150, oldPrice: 190, unit: 'per kg', sku: 'GPNX-082', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001140/vpnexues/Fresh%20Peaches.jpg', discountPct: 21, badges: [], active: true, createdAt: '2026-02-26T00:00:00' },
  { id: 'p-GPNX-083', name: 'Raspberries', slug: 'raspberries', category: 'Fruits', description: null, basePrice: 200, oldPrice: 240, unit: 'per 125g', sku: 'GPNX-083', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001147/vpnexues/Fresh%20Raspberries.jpg', discountPct: 17, badges: [], active: true, createdAt: '2026-03-27T00:00:00' },
  { id: 'p-GPNX-084', name: 'Mandarin Oranges', slug: 'mandarin-oranges', category: 'Fruits', description: null, basePrice: 62, oldPrice: 81, unit: 'per kg', sku: 'GPNX-084', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001210/vpnexues/Mandarin%20Oranges.jpg', discountPct: 23, badges: [], active: true, createdAt: '2026-04-28T00:00:00' },
  { id: 'p-GPNX-085', name: 'Tamarind', slug: 'tamarind', category: 'Fruits', description: null, basePrice: 25, oldPrice: 32, unit: 'per 250g', sku: 'GPNX-085', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001150/vpnexues/Fresh%20Tamarind.jpg', discountPct: 22, badges: [], active: true, createdAt: '2026-05-01T00:00:00' },
  { id: 'p-GPNX-086', name: 'Grape Fruit', slug: 'grape-fruit', category: 'Fruits', description: null, basePrice: 65, oldPrice: 80, unit: 'per pc', sku: 'GPNX-086', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001159/vpnexues/Grape%20Fruit.jpg', discountPct: 19, badges: [], active: true, createdAt: '2026-06-02T00:00:00' },
  { id: 'p-GPNX-087', name: 'Cantaloupe Melon', slug: 'cantaloupe-melon', category: 'Fruits', description: null, basePrice: 40, oldPrice: 50, unit: 'per pc', sku: 'GPNX-087', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001230/vpnexues/Muskmelon.jpg', discountPct: 20, badges: [], active: true, createdAt: '2026-07-03T00:00:00' },
  { id: 'p-GPNX-088', name: 'Lychee', slug: 'lychee', category: 'Fruits', description: null, basePrice: 180, oldPrice: 220, unit: 'per 500g', sku: 'GPNX-088', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001131/vpnexues/Fresh%20Lychee.jpg', discountPct: 18, badges: [], active: true, createdAt: '2026-08-04T00:00:00' },
  { id: 'p-GPNX-089', name: 'Apricots', slug: 'apricots', category: 'Fruits', description: null, basePrice: 120, oldPrice: 145, unit: 'per 500g', sku: 'GPNX-089', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001109/vpnexues/Fresh%20Apricots.jpg', discountPct: 17, badges: [], active: true, createdAt: '2026-01-05T00:00:00' },
  { id: 'p-GPNX-090', name: 'Banana Blossom', slug: 'banana-blossom', category: 'Fruits', description: null, basePrice: 20, oldPrice: 25, unit: 'per pc', sku: 'GPNX-090', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790000974/vpnexues/Banana%20Blossom.jpg', discountPct: 20, badges: [], active: true, createdAt: '2026-02-06T00:00:00' },
  { id: 'p-GPNX-091', name: 'Cold-Pressed Juice Mix', slug: 'cold-pressed-juice-mix', category: 'Beverages', description: null, basePrice: 120, oldPrice: 150, unit: 'per 300ml', sku: 'GPNX-091', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/f_auto,q_auto/v1790954701/monika-designs/GPNX-091.png', discountPct: 20, badges: [], active: true, createdAt: '2026-03-07T00:00:00' },
  { id: 'p-GPNX-092', name: 'Coconut Water', slug: 'coconut-water', category: 'Beverages', description: null, basePrice: 80, oldPrice: 100, unit: 'per 500ml', sku: 'GPNX-092', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/f_auto,q_auto/v1790954835/monika-designs/GPNX-092.png', discountPct: 20, badges: [], active: true, createdAt: '2026-04-08T00:00:00' },
  { id: 'p-GPNX-093', name: 'Turmeric Latte Mix', slug: 'turmeric-latte-mix', category: 'Beverages', description: null, basePrice: 120, oldPrice: 150, unit: 'per 300g', sku: 'GPNX-093', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/f_auto,q_auto/v1790954776/monika-designs/GPNX-093.png', discountPct: 20, badges: [], active: true, createdAt: '2026-05-09T00:00:00' },
  { id: 'p-GPNX-094', name: 'Herbal Green Tea', slug: 'herbal-green-tea', category: 'Beverages', description: null, basePrice: 90, oldPrice: 110, unit: 'per 300ml', sku: 'GPNX-094', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/f_auto,q_auto/v1790954715/monika-designs/GPNX-094.png', discountPct: 18, badges: [], active: true, createdAt: '2026-06-10T00:00:00' },
  { id: 'p-GPNX-095', name: 'Sugarcane Juice', slug: 'sugarcane-juice', category: 'Beverages', description: null, basePrice: 45, oldPrice: 56, unit: 'per 300ml', sku: 'GPNX-095', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/f_auto,q_auto/v1790954770/monika-designs/GPNX-095.png', discountPct: 20, badges: [], active: true, createdAt: '2026-07-11T00:00:00' },
  { id: 'p-GPNX-096', name: 'Mango Lassi', slug: 'mango-lassi', category: 'Beverages', description: null, basePrice: 60, oldPrice: 75, unit: 'per 500ml', sku: 'GPNX-096', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/f_auto,q_auto/v1790954797/monika-designs/GPNX-096.png', discountPct: 20, badges: [], active: true, createdAt: '2026-08-12T00:00:00' },
  { id: 'p-GPNX-097', name: 'Rose Milk', slug: 'rose-milk', category: 'Beverages', description: null, basePrice: 45, oldPrice: 56, unit: 'per 500ml', sku: 'GPNX-097', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/f_auto,q_auto/v1790954763/monika-designs/GPNX-097.png', discountPct: 20, badges: [], active: true, createdAt: '2026-01-13T00:00:00' },
  { id: 'p-GPNX-098', name: 'Nannari Sarbath', slug: 'nannari-sarbath', category: 'Beverages', description: null, basePrice: 50, oldPrice: 62, unit: 'per 500ml', sku: 'GPNX-098', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/f_auto,q_auto/v1790954812/monika-designs/GPNX-098.png', discountPct: 19, badges: [], active: true, createdAt: '2026-02-14T00:00:00' },
  { id: 'p-GPNX-099', name: 'Aloe Vera Juice', slug: 'aloe-vera-juice', category: 'Beverages', description: null, basePrice: 75, oldPrice: 94, unit: 'per 500ml', sku: 'GPNX-099', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790000960/vpnexues/Aloe%20Vera%20Juice.jpg', discountPct: 20, badges: [], active: true, createdAt: '2026-03-15T00:00:00' },
  { id: 'p-GPNX-100', name: 'Tender Coconut Water', slug: 'tender-coconut-water', category: 'Beverages', description: null, basePrice: 30, oldPrice: 38, unit: 'per 500ml', sku: 'GPNX-100', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001321/vpnexues/Tender%20Coconut%20Water.jpg', discountPct: 21, badges: [], active: true, createdAt: '2026-04-16T00:00:00' },
  { id: 'p-GPNX-101', name: 'Amla Juice', slug: 'amla-juice', category: 'Beverages', description: null, basePrice: 80, oldPrice: 100, unit: 'per 500ml', sku: 'GPNX-101', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790000967/vpnexues/Amla%20Juice.jpg', discountPct: 20, badges: [], active: true, createdAt: '2026-05-17T00:00:00' },
  { id: 'p-GPNX-102', name: 'Moringa Tea', slug: 'moringa-tea', category: 'Beverages', description: null, basePrice: 80, oldPrice: 100, unit: 'per 500ml', sku: 'GPNX-102', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/f_auto,q_auto/v1790954790/monika-designs/GPNX-102.png', discountPct: 20, badges: [], active: true, createdAt: '2026-06-18T00:00:00' },
  { id: 'p-GPNX-103', name: 'Tamarind Drink', slug: 'tamarind-drink', category: 'Beverages', description: null, basePrice: 45, oldPrice: 56, unit: 'per 500ml', sku: 'GPNX-103', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/f_auto,q_auto/v1790947715/monika-designs/GPNX-103.png', discountPct: 20, badges: [], active: true, createdAt: '2026-07-19T00:00:00' },
  { id: 'p-GPNX-104', name: 'Carrot-Ginger Juice', slug: 'carrot-ginger-juice', category: 'Beverages', description: null, basePrice: 60, oldPrice: 75, unit: 'per 500ml', sku: 'GPNX-104', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001012/vpnexues/Carrot-Ginger%20Juice.jpg', discountPct: 20, badges: [], active: true, createdAt: '2026-08-20T00:00:00' },
  { id: 'p-GPNX-105', name: 'Hibiscus Iced Tea', slug: 'hibiscus-iced-tea', category: 'Beverages', description: null, basePrice: 85, oldPrice: 105, unit: 'per 500ml', sku: 'GPNX-105', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/f_auto,q_auto/v1790954847/monika-designs/GPNX-105.png', discountPct: 19, badges: [], active: true, createdAt: '2026-01-21T00:00:00' },
  { id: 'p-GPNX-106', name: 'Vetiver Cooler', slug: 'vetiver-cooler', category: 'Beverages', description: null, basePrice: 55, oldPrice: 70, unit: 'per 500ml', sku: 'GPNX-106', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/f_auto,q_auto/v1790954783/monika-designs/GPNX-106.png', discountPct: 21, badges: [], active: true, createdAt: '2026-02-22T00:00:00' },
  { id: 'p-GPNX-107', name: 'Barley Water', slug: 'barley-water', category: 'Beverages', description: null, basePrice: 50, oldPrice: 62, unit: 'per 500ml', sku: 'GPNX-107', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790000981/vpnexues/Barley%20Water.jpg', discountPct: 19, badges: [], active: true, createdAt: '2026-03-23T00:00:00' },
  { id: 'p-GPNX-108', name: 'Kokum Sherbet', slug: 'kokum-sherbet', category: 'Beverages', description: null, basePrice: 65, oldPrice: 80, unit: 'per 500ml', sku: 'GPNX-108', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/f_auto,q_auto/v1790954741/monika-designs/GPNX-108.png', discountPct: 19, badges: [], active: true, createdAt: '2026-04-24T00:00:00' },
  { id: 'p-GPNX-109', name: 'Jamun Juice', slug: 'jamun-juice', category: 'Beverages', description: null, basePrice: 80, oldPrice: 100, unit: 'per 500ml', sku: 'GPNX-109', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/f_auto,q_auto/v1790954728/monika-designs/GPNX-109.png', discountPct: 20, badges: [], active: true, createdAt: '2026-05-25T00:00:00' },
  { id: 'p-GPNX-110', name: 'Pineapple Vinegar', slug: 'pineapple-vinegar', category: 'Beverages', description: null, basePrice: 120, oldPrice: 150, unit: 'per 500ml', sku: 'GPNX-110', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/f_auto,q_auto/v1790954821/monika-designs/GPNX-110.png', discountPct: 20, badges: [], active: true, createdAt: '2026-06-26T00:00:00' },
  { id: 'p-GPNX-111', name: 'Basmati Rice', slug: 'basmati-rice', category: 'Groceries', description: null, basePrice: 250, oldPrice: 300, unit: 'per 2kg', sku: 'GPNX-111', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790000986/vpnexues/Basmati%20Rice.jpg', discountPct: 17, badges: [], active: true, createdAt: '2026-07-27T00:00:00' },
  { id: 'p-GPNX-112', name: 'Cold-Pressed Coconut Oil', slug: 'cold-pressed-coconut-oil', category: 'Groceries', description: null, basePrice: 450, oldPrice: 550, unit: 'per 500ml', sku: 'GPNX-112', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001048/vpnexues/Cold%20Pressed%20Coconut%20Oil.jpg', discountPct: 18, badges: ['Best Seller'], active: true, createdAt: '2026-08-28T00:00:00' },
  { id: 'p-GPNX-113', name: 'Garlic Bulbs', slug: 'garlic-bulbs', category: 'Groceries', description: null, basePrice: 150, oldPrice: 180, unit: 'per 250g', sku: 'GPNX-113', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001339/vpnexues/Whole%20Garlic%20Bulbs.jpg', discountPct: 17, badges: [], active: true, createdAt: '2026-01-01T00:00:00' },
  { id: 'p-GPNX-114', name: 'Free Range Eggs', slug: 'free-range-eggs', category: 'Groceries', description: null, basePrice: 220, oldPrice: 265, unit: 'per 12 pcs', sku: 'GPNX-114', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001104/vpnexues/Free%20Range%20Eggs.jpg', discountPct: 17, badges: [], active: true, createdAt: '2026-02-02T00:00:00' },
  { id: 'p-GPNX-115', name: 'Moringa Powder', slug: 'moringa-powder', category: 'Groceries', description: null, basePrice: 350, oldPrice: 420, unit: 'per 150g', sku: 'GPNX-115', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001223/vpnexues/Moringa%20Powder.jpg', discountPct: 17, badges: [], active: true, createdAt: '2026-03-03T00:00:00' },
  { id: 'p-GPNX-116', name: 'Chickpeas', slug: 'chickpeas', category: 'Groceries', description: null, basePrice: 120, oldPrice: 150, unit: 'per 500g', sku: 'GPNX-116', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001030/vpnexues/Chickpeas.jpg', discountPct: 20, badges: [], active: true, createdAt: '2026-04-04T00:00:00' },
  { id: 'p-GPNX-117', name: 'Red Lentils (Masoor)', slug: 'red-lentils-masoor', category: 'Groceries', description: null, basePrice: 110, oldPrice: 130, unit: 'per 500g', sku: 'GPNX-117', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001284/vpnexues/Red%20Lentils%20%28Masoor%29.jpg', discountPct: 15, badges: [], active: true, createdAt: '2026-05-05T00:00:00' },
  { id: 'p-GPNX-118', name: 'Yellow Lentils (Toor)', slug: 'yellow-lentils-toor', category: 'Groceries', description: null, basePrice: 120, oldPrice: 150, unit: 'per 500g', sku: 'GPNX-118', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001345/vpnexues/Yellow%20Lentils.jpg', discountPct: 20, badges: [], active: true, createdAt: '2026-06-06T00:00:00' },
  { id: 'p-GPNX-119', name: 'Whole Black Pepper', slug: 'whole-black-pepper', category: 'Groceries', description: null, basePrice: 300, oldPrice: 380, unit: 'per 100g', sku: 'GPNX-119', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001337/vpnexues/Whole%20Black%20Pepper.jpg', discountPct: 21, badges: [], active: true, createdAt: '2026-07-07T00:00:00' },
  { id: 'p-GPNX-120', name: 'Turmeric Powder', slug: 'turmeric-powder', category: 'Groceries', description: null, basePrice: 150, oldPrice: 180, unit: 'per 200g', sku: 'GPNX-120', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001325/vpnexues/Turmeric%20Powder.jpg', discountPct: 17, badges: [], active: true, createdAt: '2026-08-08T00:00:00' },
  { id: 'p-GPNX-121', name: 'Cumin Seeds', slug: 'cumin-seeds', category: 'Groceries', description: null, basePrice: 120, oldPrice: 150, unit: 'per 100g', sku: 'GPNX-121', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001074/vpnexues/Cumin%20Seeds.jpg', discountPct: 20, badges: [], active: true, createdAt: '2026-01-09T00:00:00' },
  { id: 'p-GPNX-122', name: 'Coriander Seeds', slug: 'coriander-seeds', category: 'Groceries', description: null, basePrice: 100, oldPrice: 120, unit: 'per 100g', sku: 'GPNX-122', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001060/vpnexues/Coriander%20Seeds.jpg', discountPct: 17, badges: [], active: true, createdAt: '2026-02-10T00:00:00' },
  { id: 'p-GPNX-123', name: 'Green Cardamom Pods', slug: 'green-cardamom-pods', category: 'Groceries', description: null, basePrice: 600, oldPrice: 750, unit: 'per 50g', sku: 'GPNX-123', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001167/vpnexues/Green%20Cardamom%20Pods.jpg', discountPct: 20, badges: [], active: true, createdAt: '2026-03-11T00:00:00' },
  { id: 'p-GPNX-124', name: 'Cinnamon Sticks', slug: 'cinnamon-sticks', category: 'Groceries', description: null, basePrice: 200, oldPrice: 260, unit: 'per 50g', sku: 'GPNX-124', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001035/vpnexues/Cinnamon%20Sticks.jpg', discountPct: 23, badges: [], active: true, createdAt: '2026-04-12T00:00:00' },
  { id: 'p-GPNX-125', name: 'Cloves', slug: 'cloves', category: 'Groceries', description: null, basePrice: 400, oldPrice: 500, unit: 'per 50g', sku: 'GPNX-125', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001037/vpnexues/Cloves.jpg', discountPct: 20, badges: [], active: true, createdAt: '2026-05-13T00:00:00' },
  { id: 'p-GPNX-126', name: 'Sesame Seeds', slug: 'sesame-seeds', category: 'Groceries', description: null, basePrice: 120, oldPrice: 150, unit: 'per 250g', sku: 'GPNX-126', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001297/vpnexues/Sesame%20Seeds.jpg', discountPct: 20, badges: [], active: true, createdAt: '2026-06-14T00:00:00' },
  { id: 'p-GPNX-127', name: 'Mustard Seeds', slug: 'mustard-seeds', category: 'Groceries', description: null, basePrice: 80, oldPrice: 100, unit: 'per 200g', sku: 'GPNX-127', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001231/vpnexues/Mustard%20Seeds.jpg', discountPct: 20, badges: [], active: true, createdAt: '2026-07-15T00:00:00' },
  { id: 'p-GPNX-128', name: 'Fenugreek Seeds', slug: 'fenugreek-seeds', category: 'Groceries', description: null, basePrice: 90, oldPrice: 110, unit: 'per 200g', sku: 'GPNX-128', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001101/vpnexues/Fenugreek%20Seeds.jpg', discountPct: 18, badges: [], active: true, createdAt: '2026-08-16T00:00:00' },
  { id: 'p-GPNX-129', name: 'Groundnut Oil', slug: 'groundnut-oil', category: 'Groceries', description: null, basePrice: 450, oldPrice: 560, unit: 'per 1L', sku: 'GPNX-129', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001173/vpnexues/Groundnut%20Oil.jpg', discountPct: 20, badges: [], active: true, createdAt: '2026-01-17T00:00:00' },
  { id: 'p-GPNX-130', name: 'Cane Jaggery', slug: 'cane-jaggery', category: 'Groceries', description: null, basePrice: 120, oldPrice: 150, unit: 'per 500g', sku: 'GPNX-130', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001005/vpnexues/Cane%20Jaggery.jpg', discountPct: 20, badges: [], active: true, createdAt: '2026-02-18T00:00:00' },
  { id: 'p-GPNX-131', name: 'Honey (Raw Wildflower)', slug: 'honey-raw-wildflower', category: 'Groceries', description: null, basePrice: 650, oldPrice: 800, unit: 'per 500g', sku: 'GPNX-131', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001180/vpnexues/Honey%20%28Raw%20Wildflower%29.jpg', discountPct: 19, badges: ['Best Seller'], active: true, createdAt: '2026-03-19T00:00:00' },
  { id: 'p-GPNX-132', name: 'Ghee (Cow Milk)', slug: 'ghee-cow-milk', category: 'Groceries', description: null, basePrice: 800, oldPrice: 950, unit: 'per 500g', sku: 'GPNX-132', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001157/vpnexues/Ghee%20%28Cow%20Milk%29.jpg', discountPct: 16, badges: ['Best Seller'], active: true, createdAt: '2026-04-20T00:00:00' },
  { id: 'p-GPNX-133', name: 'Tapioca Flour', slug: 'tapioca-flour', category: 'Groceries', description: null, basePrice: 150, oldPrice: 180, unit: 'per 500g', sku: 'GPNX-133', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001318/vpnexues/Tapioca%20Flour.jpg', discountPct: 17, badges: [], active: true, createdAt: '2026-05-21T00:00:00' },
  { id: 'p-GPNX-134', name: 'Ragi Flour (Finger Millet)', slug: 'ragi-flour-finger-millet', category: 'Groceries', description: null, basePrice: 200, oldPrice: 250, unit: 'per 500g', sku: 'GPNX-134', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001275/vpnexues/Ragi%20Flour%20%28Finger%20Millet%29.jpg', discountPct: 20, badges: [], active: true, createdAt: '2026-06-22T00:00:00' },
  { id: 'p-GPNX-135', name: 'Organic Quinoa', slug: 'organic-quinoa', category: 'Groceries', description: null, basePrice: 120, oldPrice: 150, unit: 'per 500g', sku: 'GPNX-135', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001249/vpnexues/Organic%20Quinoa.jpg', discountPct: 20, badges: [], active: true, createdAt: '2026-07-23T00:00:00' },
  { id: 'p-GPNX-136', name: 'Oats (Rolled)', slug: 'oats-rolled', category: 'Groceries', description: null, basePrice: 150, oldPrice: 180, unit: 'per 500g', sku: 'GPNX-136', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001237/vpnexues/Oats%20%28Rolled%29.jpg', discountPct: 17, badges: [], active: true, createdAt: '2026-08-24T00:00:00' },
  { id: 'p-GPNX-137', name: 'Almonds', slug: 'almonds', category: 'Groceries', description: null, basePrice: 180, oldPrice: 220, unit: 'per 250g', sku: 'GPNX-137', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790000957/vpnexues/Almonds.jpg', discountPct: 18, badges: ['Best Seller'], active: true, createdAt: '2026-01-25T00:00:00' },
  { id: 'p-GPNX-138', name: 'Cashew Nuts', slug: 'cashew-nuts', category: 'Groceries', description: null, basePrice: 400, oldPrice: 500, unit: 'per 250g', sku: 'GPNX-138', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001015/vpnexues/Cashew%20Nuts.jpg', discountPct: 20, badges: [], active: true, createdAt: '2026-02-26T00:00:00' },
  { id: 'p-GPNX-139', name: 'Walnut Kernels', slug: 'walnut-kernels', category: 'Groceries', description: null, basePrice: 300, oldPrice: 380, unit: 'per 250g', sku: 'GPNX-139', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001331/vpnexues/Walnut%20Kernels.jpg', discountPct: 21, badges: ['Best Seller'], active: true, createdAt: '2026-03-27T00:00:00' },
  { id: 'p-GPNX-140', name: 'Flaxseeds', slug: 'flaxseeds', category: 'Groceries', description: null, basePrice: 350, oldPrice: 450, unit: 'per 250g', sku: 'GPNX-140', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001103/vpnexues/Flaxseeds.jpg', discountPct: 22, badges: [], active: true, createdAt: '2026-04-28T00:00:00' },
  { id: 'p-GPNX-141', name: 'Chia Seeds', slug: 'chia-seeds', category: 'Groceries', description: null, basePrice: 120, oldPrice: 150, unit: 'per 250g', sku: 'GPNX-141', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001027/vpnexues/Chia%20Seeds.jpg', discountPct: 20, badges: [], active: true, createdAt: '2026-05-01T00:00:00' },
  { id: 'p-GPNX-142', name: 'Sunflower Seeds', slug: 'sunflower-seeds', category: 'Groceries', description: null, basePrice: 150, oldPrice: 180, unit: 'per 250g', sku: 'GPNX-142', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001310/vpnexues/Sunflower%20Seeds.jpg', discountPct: 17, badges: [], active: true, createdAt: '2026-06-02T00:00:00' },
  { id: 'p-GPNX-143', name: 'Pumpkin Seeds', slug: 'pumpkin-seeds', category: 'Groceries', description: null, basePrice: 180, oldPrice: 220, unit: 'per 250g', sku: 'GPNX-143', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001268/vpnexues/Pumpkin%20Seeds.jpg', discountPct: 18, badges: [], active: true, createdAt: '2026-07-03T00:00:00' },
  { id: 'p-GPNX-144', name: 'Dry Red Chilli', slug: 'dry-red-chilli', category: 'Groceries', description: null, basePrice: 150, oldPrice: 180, unit: 'per 100g', sku: 'GPNX-144', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001093/vpnexues/Dry%20Red%20Chilli.jpg', discountPct: 17, badges: [], active: true, createdAt: '2026-08-04T00:00:00' },
  { id: 'p-GPNX-145', name: 'Star Anise', slug: 'star-anise', category: 'Groceries', description: null, basePrice: 200, oldPrice: 250, unit: 'per 50g', sku: 'GPNX-145', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001306/vpnexues/Star%20Anise.jpg', discountPct: 20, badges: [], active: true, createdAt: '2026-01-05T00:00:00' },
  { id: 'p-GPNX-146', name: 'Dried Mango Powder (Amchur)', slug: 'dried-mango-powder-amchur', category: 'Groceries', description: null, basePrice: 80, oldPrice: 100, unit: 'per 100g', sku: 'GPNX-146', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001090/vpnexues/Dried%20Mango%20Powder%20%28Amchur%29.jpg', discountPct: 20, badges: [], active: true, createdAt: '2026-02-06T00:00:00' },
  { id: 'p-GPNX-147', name: 'Tamarind Paste', slug: 'tamarind-paste', category: 'Groceries', description: null, basePrice: 120, oldPrice: 150, unit: 'per 200g', sku: 'GPNX-147', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001316/vpnexues/Tamarind%20Paste.jpg', discountPct: 20, badges: [], active: true, createdAt: '2026-03-07T00:00:00' },
  { id: 'p-GPNX-148', name: 'Coconut Milk', slug: 'coconut-milk', category: 'Groceries', description: null, basePrice: 300, oldPrice: 380, unit: 'per 400ml', sku: 'GPNX-148', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001045/vpnexues/Coconut%20Milk.jpg', discountPct: 21, badges: [], active: true, createdAt: '2026-04-08T00:00:00' },
  { id: 'p-GPNX-149', name: 'Brown Rice', slug: 'brown-rice', category: 'Groceries', description: null, basePrice: 80, oldPrice: 100, unit: 'per 2kg', sku: 'GPNX-149', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001002/vpnexues/Brown%20Rice.jpg', discountPct: 20, badges: [], active: true, createdAt: '2026-05-09T00:00:00' },
  { id: 'p-GPNX-150', name: 'Mung Beans (Green)', slug: 'mung-beans-green', category: 'Groceries', description: null, basePrice: 100, oldPrice: 120, unit: 'per 500g', sku: 'GPNX-150', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001225/vpnexues/Mung%20Beans%20%28Green%29%201.jpg', discountPct: 17, badges: [], active: true, createdAt: '2026-06-10T00:00:00' },
  { id: 'p-GPNX-151', name: 'Dried Chilli Flakes', slug: 'dried-chilli-flakes', category: 'Groceries', description: null, basePrice: 120, oldPrice: 150, unit: 'per 100g', sku: 'GPNX-151', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001085/vpnexues/Dried%20Chilli%20Flakes.jpg', discountPct: 20, badges: [], active: true, createdAt: '2026-07-11T00:00:00' },
  { id: 'p-GPNX-152', name: 'Dried Fenugreek Leaves (Kasuri Methi)', slug: 'dried-fenugreek-leaves-kasuri-methi', category: 'Groceries', description: null, basePrice: 90, oldPrice: 110, unit: 'per 100g', sku: 'GPNX-152', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001089/vpnexues/Dried%20Fenugreek%20Leaves%20%28Kasuri%20Methi%29.jpg', discountPct: 18, badges: [], active: true, createdAt: '2026-08-12T00:00:00' },
  { id: 'p-GPNX-153', name: 'Asafoetida', slug: 'asafoetida', category: 'Groceries', description: null, basePrice: 80, oldPrice: 100, unit: 'per 50g', sku: 'GPNX-153', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790000969/vpnexues/Asafoetida.jpg', discountPct: 20, badges: [], active: true, createdAt: '2026-01-13T00:00:00' },
  { id: 'p-GPNX-154', name: 'Dried Coconut (Kopra)', slug: 'dried-coconut-kopra', category: 'Groceries', description: null, basePrice: 120, oldPrice: 150, unit: 'per 500g', sku: 'GPNX-154', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001087/vpnexues/Dried%20Coconut%20%28Kopra%29.jpg', discountPct: 20, badges: [], active: true, createdAt: '2026-02-14T00:00:00' },
  { id: 'p-GPNX-156', name: 'Pomelo', slug: 'pomelo', category: 'Fruits', description: null, basePrice: 30, oldPrice: 38, unit: 'per pc', sku: 'GPNX-156', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001159/vpnexues/Grape%20Fruit.jpg', discountPct: 21, badges: [], active: true, createdAt: '2026-03-15T00:00:00' },
  { id: 'p-GPNX-157', name: 'Mangosteen', slug: 'mangosteen', category: 'Fruits', description: null, basePrice: 85, oldPrice: 105, unit: 'per pc', sku: 'GPNX-157', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001159/vpnexues/Grape%20Fruit.jpg', discountPct: 19, badges: [], active: true, createdAt: '2026-04-16T00:00:00' },
  { id: 'p-GPNX-158', name: 'Langsat', slug: 'langsat', category: 'Fruits', description: null, basePrice: 40, oldPrice: 52, unit: 'per pc', sku: 'GPNX-158', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001203/vpnexues/Longan.jpg', discountPct: 23, badges: [], active: true, createdAt: '2026-05-17T00:00:00' },
  { id: 'p-GPNX-159', name: 'Salak', slug: 'salak', category: 'Fruits', description: null, basePrice: 35, oldPrice: 45, unit: 'per pc', sku: 'GPNX-159', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001298/vpnexues/Snake%20Fruit.jpg', discountPct: 22, badges: [], active: true, createdAt: '2026-06-18T00:00:00' },
  { id: 'p-GPNX-160', name: 'Java Apple', slug: 'java-apple', category: 'Fruits', description: null, basePrice: 50, oldPrice: 65, unit: 'per pc', sku: 'GPNX-160', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001162/vpnexues/Green%20Apples.jpg', discountPct: 23, badges: [], active: true, createdAt: '2026-07-19T00:00:00' },
  { id: 'p-GPNX-170', name: 'Malay Gooseberry', slug: 'malay-gooseberry', category: 'Fruits', description: null, basePrice: 40, oldPrice: 52, unit: 'per pc', sku: 'GPNX-170', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001162/vpnexues/Green%20Apples.jpg', discountPct: 23, badges: [], active: true, createdAt: '2026-08-20T00:00:00' },
  { id: 'p-GPNX-171', name: 'Rose Myrtle', slug: 'rose-myrtle', category: 'Fruits', description: null, basePrice: 35, oldPrice: 45, unit: 'per pc', sku: 'GPNX-171', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001126/vpnexues/Fresh%20Guava.jpg', discountPct: 22, badges: [], active: true, createdAt: '2026-01-21T00:00:00' },
  { id: 'p-GPNX-172', name: 'Snake Fruit', slug: 'snake-fruit', category: 'Fruits', description: null, basePrice: 30, oldPrice: 40, unit: 'per pc', sku: 'GPNX-172', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001298/vpnexues/Snake%20Fruit.jpg', discountPct: 25, badges: [], active: true, createdAt: '2026-02-22T00:00:00' },
  { id: 'p-GPNX-173', name: 'Durian', slug: 'durian', category: 'Fruits', description: null, basePrice: 120, oldPrice: 150, unit: 'per pc', sku: 'GPNX-173', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001127/vpnexues/Fresh%20Jackfruit.jpg', discountPct: 20, badges: [], active: true, createdAt: '2026-03-23T00:00:00' },
  { id: 'p-GPNX-174', name: 'Rose Apple', slug: 'rose-apple', category: 'Fruits', description: null, basePrice: 40, oldPrice: 52, unit: 'per pc', sku: 'GPNX-174', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001162/vpnexues/Green%20Apples.jpg', discountPct: 23, badges: [], active: true, createdAt: '2026-04-24T00:00:00' },
  { id: 'p-GPNX-175', name: 'Golden Delicious Apples', slug: 'golden-delicious-apples', category: 'Fruits', description: null, basePrice: 35, oldPrice: 45, unit: 'per pc', sku: 'GPNX-175', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001158/vpnexues/Golden%20Delicious%20Apples.jpg', discountPct: 22, badges: [], active: true, createdAt: '2026-05-25T00:00:00' },
  { id: 'p-GPNX-176', name: 'Peanut Oil', slug: 'peanut-oil', category: 'Groceries', description: null, basePrice: 120, oldPrice: 150, unit: 'per 250ml', sku: 'GPNX-176', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001050/vpnexues/Cold%20Pressed%20Peanut%20Oil.jpg', discountPct: 20, badges: [], active: true, createdAt: '2026-06-26T00:00:00' },
  { id: 'p-GPNX-177', name: 'Raw Peanuts', slug: 'raw-peanuts', category: 'Groceries', description: null, basePrice: 100, oldPrice: 120, unit: 'per 250g', sku: 'GPNX-177', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001280/vpnexues/Raw%20Peanuts%20%28With%20Shells%29.jpg', discountPct: 17, badges: [], active: true, createdAt: '2026-07-27T00:00:00' },
  { id: 'p-GPNX-178', name: 'Sesame Oil', slug: 'sesame-oil', category: 'Groceries', description: null, basePrice: 80, oldPrice: 100, unit: 'per 250ml', sku: 'GPNX-178', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001265/vpnexues/Pressed%20Sesame%20Oil.jpg', discountPct: 20, badges: [], active: true, createdAt: '2026-08-28T00:00:00' },
  { id: 'p-GPNX-179', name: 'Frozen Mixed Vegetables', slug: 'frozen-mixed-vegetables', category: 'Groceries', description: null, basePrice: 120, oldPrice: 150, unit: 'per pack', sku: 'GPNX-179', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001153/vpnexues/Frozen%20Mixed%20Vegetables.jpg', discountPct: 20, badges: [], active: true, createdAt: '2026-01-01T00:00:00' },
  { id: 'p-GPNX-180', name: 'Premium Dairy Butter', slug: 'premium-dairy-butter', category: 'Groceries', description: null, basePrice: 450, oldPrice: 550, unit: 'per 250g', sku: 'GPNX-180', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001261/vpnexues/Premium%20Dairy%20Butter.jpg', discountPct: 18, badges: [], active: true, createdAt: '2026-02-02T00:00:00' },
  { id: 'p-GPNX-181', name: 'Farm Fresh Cow Ghee', slug: 'farm-fresh-cow-ghee', category: 'Groceries', description: null, basePrice: 200, oldPrice: 250, unit: 'per 250ml', sku: 'GPNX-181', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001098/vpnexues/Farm%20Fresh%20Cow%20Ghee.jpg', discountPct: 20, badges: [], active: true, createdAt: '2026-03-03T00:00:00' },
  { id: 'p-GPNX-182', name: 'Paneer Cheese Cubes', slug: 'paneer-cheese-cubes', category: 'Groceries', description: null, basePrice: 150, oldPrice: 180, unit: 'per pack', sku: 'GPNX-182', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001252/vpnexues/Paneer%20Cheese%20Cubes.jpg', discountPct: 17, badges: [], active: true, createdAt: '2026-04-04T00:00:00' },
  { id: 'p-GPNX-183', name: 'Premium Fresh Curd', slug: 'premium-fresh-curd', category: 'Groceries', description: null, basePrice: 120, oldPrice: 150, unit: 'per cup', sku: 'GPNX-183', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001264/vpnexues/Premium%20Fresh%20Curd.jpg', discountPct: 20, badges: [], active: true, createdAt: '2026-05-05T00:00:00' },
  { id: 'p-GPNX-184', name: 'Premium Fresh Cheese', slug: 'premium-fresh-cheese', category: 'Groceries', description: null, basePrice: 150, oldPrice: 190, unit: 'per pack', sku: 'GPNX-184', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001263/vpnexues/Premium%20Fresh%20Cheese.jpg', discountPct: 21, badges: [], active: true, createdAt: '2026-06-06T00:00:00' },
  { id: 'p-GPNX-185', name: 'Masala Chai', slug: 'masala-chai', category: 'Beverages', description: null, basePrice: 340, oldPrice: 425, unit: 'per 500ml', sku: 'GPNX-185', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/f_auto,q_auto/v1790947588/monika-designs/GPNX-185.png', discountPct: 20, badges: [], active: true, createdAt: '2026-07-07T00:00:00' },
  { id: 'p-GPNX-186', name: 'Fresh Orange Juice', slug: 'fresh-orange-juice', category: 'Beverages', description: null, basePrice: 280, oldPrice: 350, unit: 'per 500ml', sku: 'GPNX-186', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/f_auto,q_auto/v1790954708/monika-designs/GPNX-186.png', discountPct: 20, badges: [], active: true, createdAt: '2026-08-08T00:00:00' },
  { id: 'p-GPNX-187', name: 'Iced Coffee', slug: 'iced-coffee', category: 'Beverages', description: null, basePrice: 365, oldPrice: 455, unit: 'per 500ml', sku: 'GPNX-187', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/f_auto,q_auto/v1790954721/monika-designs/GPNX-187.png', discountPct: 20, badges: [], active: true, createdAt: '2026-01-09T00:00:00' },
  { id: 'p-GPNX-188', name: 'Jasmine Green Tea', slug: 'jasmine-green-tea', category: 'Beverages', description: null, basePrice: 90, oldPrice: 110, unit: 'per 300ml', sku: 'GPNX-188', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/f_auto,q_auto/v1790954735/monika-designs/GPNX-188.png', discountPct: 18, badges: [], active: true, createdAt: '2026-02-10T00:00:00' },
  { id: 'p-GPNX-189', name: 'Protein Shake', slug: 'protein-shake', category: 'Beverages', description: null, basePrice: 465, oldPrice: 580, unit: 'per 500ml', sku: 'GPNX-189', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/f_auto,q_auto/v1790954756/monika-designs/GPNX-189.png', discountPct: 20, badges: [], active: true, createdAt: '2026-03-11T00:00:00' },

];

export const DEMO_INVENTORY: AdminInventoryItem[] = [
  { id: 'inv-p-GPNX-001', productId: 'p-GPNX-001', productName: 'Organic Carrots', sku: 'GPNX-001', category: 'Vegetables', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001247/vpnexues/Organic%20Carrots.jpg', quantity: 265, reorderThreshold: 100, status: 'IN_STOCK', updatedAt: '2026-08-01T00:00:00' },
  { id: 'inv-p-GPNX-002', productId: 'p-GPNX-002', productName: 'Vine Tomatoes', sku: 'GPNX-002', category: 'Vegetables', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001329/vpnexues/Vine%20Tomatoes.jpg', quantity: 264, reorderThreshold: 100, status: 'IN_STOCK', updatedAt: '2026-08-01T00:00:00' },
  { id: 'inv-p-GPNX-003', productId: 'p-GPNX-003', productName: 'Baby Spinach', sku: 'GPNX-003', category: 'Vegetables', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790000973/vpnexues/Baby%20Spinach.jpg', quantity: 263, reorderThreshold: 100, status: 'IN_STOCK', updatedAt: '2026-08-01T00:00:00' },
  { id: 'inv-p-GPNX-004', productId: 'p-GPNX-004', productName: 'Sweet Corn', sku: 'GPNX-004', category: 'Vegetables', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001311/vpnexues/Sweet%20Corn.jpg', quantity: 262, reorderThreshold: 100, status: 'IN_STOCK', updatedAt: '2026-08-01T00:00:00' },
  { id: 'inv-p-GPNX-005', productId: 'p-GPNX-005', productName: 'Red Onions', sku: 'GPNX-005', category: 'Vegetables', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001286/vpnexues/Red%20Onions.jpg', quantity: 261, reorderThreshold: 100, status: 'IN_STOCK', updatedAt: '2026-08-01T00:00:00' },
  { id: 'inv-p-GPNX-006', productId: 'p-GPNX-006', productName: 'Bell Peppers Mix', sku: 'GPNX-006', category: 'Vegetables', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790000990/vpnexues/Bell%20Peppers%20Mix.jpg', quantity: 260, reorderThreshold: 100, status: 'IN_STOCK', updatedAt: '2026-08-01T00:00:00' },
  { id: 'inv-p-GPNX-007', productId: 'p-GPNX-007', productName: 'Broccoli Head', sku: 'GPNX-007', category: 'Vegetables', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001000/vpnexues/Broccoli%20Head.jpg', quantity: 259, reorderThreshold: 100, status: 'IN_STOCK', updatedAt: '2026-08-01T00:00:00' },
  { id: 'inv-p-GPNX-008', productId: 'p-GPNX-008', productName: 'Cucumber', sku: 'GPNX-008', category: 'Vegetables', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001067/vpnexues/Cucumber.jpg', quantity: 258, reorderThreshold: 100, status: 'IN_STOCK', updatedAt: '2026-08-01T00:00:00' },
  { id: 'inv-p-GPNX-009', productId: 'p-GPNX-009', productName: 'Zucchini', sku: 'GPNX-009', category: 'Vegetables', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001347/vpnexues/Zucchini.jpg', quantity: 257, reorderThreshold: 100, status: 'IN_STOCK', updatedAt: '2026-08-01T00:00:00' },
  { id: 'inv-p-GPNX-010', productId: 'p-GPNX-010', productName: 'Cherry Tomatoes', sku: 'GPNX-010', category: 'Vegetables', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001025/vpnexues/Cherry%20Tomatoes.jpg', quantity: 235, reorderThreshold: 100, status: 'IN_STOCK', updatedAt: '2026-08-01T00:00:00' },
  { id: 'inv-p-GPNX-011', productId: 'p-GPNX-011', productName: 'Kale Bunch', sku: 'GPNX-011', category: 'Vegetables', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001192/vpnexues/Kale%20Bunch.jpg', quantity: 234, reorderThreshold: 100, status: 'IN_STOCK', updatedAt: '2026-08-01T00:00:00' },
  { id: 'inv-p-GPNX-012', productId: 'p-GPNX-012', productName: 'Purple Cabbage', sku: 'GPNX-012', category: 'Vegetables', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001272/vpnexues/Purple%20Cabbage.jpg', quantity: 233, reorderThreshold: 100, status: 'IN_STOCK', updatedAt: '2026-08-01T00:00:00' },
  { id: 'inv-p-GPNX-013', productId: 'p-GPNX-013', productName: 'Cauliflower', sku: 'GPNX-013', category: 'Vegetables', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001017/vpnexues/Cauliflower.jpg', quantity: 232, reorderThreshold: 100, status: 'IN_STOCK', updatedAt: '2026-08-01T00:00:00' },
  { id: 'inv-p-GPNX-014', productId: 'p-GPNX-014', productName: 'White Radish', sku: 'GPNX-014', category: 'Vegetables', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001336/vpnexues/White%20Radish.jpg', quantity: 231, reorderThreshold: 100, status: 'IN_STOCK', updatedAt: '2026-08-01T00:00:00' },
  { id: 'inv-p-GPNX-015', productId: 'p-GPNX-015', productName: 'Sweet Potato', sku: 'GPNX-015', category: 'Vegetables', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001313/vpnexues/Sweet%20Potato.jpg', quantity: 230, reorderThreshold: 100, status: 'IN_STOCK', updatedAt: '2026-08-01T00:00:00' },
  { id: 'inv-p-GPNX-016', productId: 'p-GPNX-016', productName: 'Green Beans', sku: 'GPNX-016', category: 'Vegetables', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001163/vpnexues/Green%20Beans.jpg', quantity: 229, reorderThreshold: 100, status: 'IN_STOCK', updatedAt: '2026-08-01T00:00:00' },
  { id: 'inv-p-GPNX-017', productId: 'p-GPNX-017', productName: 'Leek', sku: 'GPNX-017', category: 'Vegetables', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001200/vpnexues/Leek.jpg', quantity: 228, reorderThreshold: 100, status: 'IN_STOCK', updatedAt: '2026-08-01T00:00:00' },
  { id: 'inv-p-GPNX-018', productId: 'p-GPNX-018', productName: 'Beetroot', sku: 'GPNX-018', category: 'Vegetables', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790000988/vpnexues/Beetroot.jpg', quantity: 227, reorderThreshold: 100, status: 'IN_STOCK', updatedAt: '2026-08-01T00:00:00' },
  { id: 'inv-p-GPNX-019', productId: 'p-GPNX-019', productName: 'Celery', sku: 'GPNX-019', category: 'Vegetables', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001019/vpnexues/Celery.jpg', quantity: 226, reorderThreshold: 100, status: 'IN_STOCK', updatedAt: '2026-08-01T00:00:00' },
  { id: 'inv-p-GPNX-020', productId: 'p-GPNX-020', productName: 'Pumpkin', sku: 'GPNX-020', category: 'Vegetables', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001270/vpnexues/Pumpkin.jpg', quantity: 204, reorderThreshold: 100, status: 'IN_STOCK', updatedAt: '2026-08-01T00:00:00' },
  { id: 'inv-p-GPNX-021', productId: 'p-GPNX-021', productName: 'Eggplant', sku: 'GPNX-021', category: 'Vegetables', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001096/vpnexues/Eggplant.jpg', quantity: 203, reorderThreshold: 100, status: 'IN_STOCK', updatedAt: '2026-08-01T00:00:00' },
  { id: 'inv-p-GPNX-022', productId: 'p-GPNX-022', productName: 'Asparagus', sku: 'GPNX-022', category: 'Vegetables', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790000971/vpnexues/Asparagus.jpg', quantity: 202, reorderThreshold: 100, status: 'IN_STOCK', updatedAt: '2026-08-01T00:00:00' },
  { id: 'inv-p-GPNX-023', productId: 'p-GPNX-023', productName: 'Pak Choi', sku: 'GPNX-023', category: 'Vegetables', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001251/vpnexues/Pak%20Choi.jpg', quantity: 201, reorderThreshold: 100, status: 'IN_STOCK', updatedAt: '2026-08-01T00:00:00' },
  { id: 'inv-p-GPNX-024', productId: 'p-GPNX-024', productName: 'Okra / Ladyfinger', sku: 'GPNX-024', category: 'Vegetables', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001239/vpnexues/Okra%20-%20Ladyfinger.jpg', quantity: 200, reorderThreshold: 100, status: 'IN_STOCK', updatedAt: '2026-08-01T00:00:00' },
  { id: 'inv-p-GPNX-025', productId: 'p-GPNX-025', productName: 'Spring Onions', sku: 'GPNX-025', category: 'Vegetables', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001304/vpnexues/Spring%20Onions.jpg', quantity: 199, reorderThreshold: 100, status: 'IN_STOCK', updatedAt: '2026-08-01T00:00:00' },
  { id: 'inv-p-GPNX-026', productId: 'p-GPNX-026', productName: 'Coriander', sku: 'GPNX-026', category: 'Vegetables', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001060/vpnexues/Coriander%20Seeds.jpg', quantity: 198, reorderThreshold: 100, status: 'IN_STOCK', updatedAt: '2026-08-01T00:00:00' },
  { id: 'inv-p-GPNX-027', productId: 'p-GPNX-027', productName: 'Mint Leaves', sku: 'GPNX-027', category: 'Vegetables', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001217/vpnexues/Mint%20Leaves.jpg', quantity: 197, reorderThreshold: 100, status: 'IN_STOCK', updatedAt: '2026-08-01T00:00:00' },
  { id: 'inv-p-GPNX-028', productId: 'p-GPNX-028', productName: 'Bitter Gourd', sku: 'GPNX-028', category: 'Vegetables', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790000995/vpnexues/Bitter%20Gourd%20Organic.jpg', quantity: 196, reorderThreshold: 100, status: 'IN_STOCK', updatedAt: '2026-08-01T00:00:00' },
  { id: 'inv-p-GPNX-029', productId: 'p-GPNX-029', productName: 'Long Beans', sku: 'GPNX-029', category: 'Vegetables', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001344/vpnexues/Yardlong%20Beans.jpg', quantity: 195, reorderThreshold: 100, status: 'IN_STOCK', updatedAt: '2026-08-01T00:00:00' },
  { id: 'inv-p-GPNX-030', productId: 'p-GPNX-030', productName: 'French Beans', sku: 'GPNX-030', category: 'Vegetables', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001107/vpnexues/French%20Beans.jpg', quantity: 173, reorderThreshold: 100, status: 'IN_STOCK', updatedAt: '2026-08-01T00:00:00' },
  { id: 'inv-p-GPNX-031', productId: 'p-GPNX-031', productName: 'Drumstick (Moringa)', sku: 'GPNX-031', category: 'Vegetables', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001222/vpnexues/Moringa%20Drumsticks.jpg', quantity: 172, reorderThreshold: 100, status: 'IN_STOCK', updatedAt: '2026-08-01T00:00:00' },
  { id: 'inv-p-GPNX-032', productId: 'p-GPNX-032', productName: 'Bottle Gourd', sku: 'GPNX-032', category: 'Vegetables', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790000995/vpnexues/Bitter%20Gourd.jpg', quantity: 171, reorderThreshold: 100, status: 'IN_STOCK', updatedAt: '2026-08-01T00:00:00' },
  { id: 'inv-p-GPNX-033', productId: 'p-GPNX-033', productName: 'Taro Root', sku: 'GPNX-033', category: 'Vegetables', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001320/vpnexues/Taro%20Root.jpg', quantity: 170, reorderThreshold: 100, status: 'IN_STOCK', updatedAt: '2026-08-01T00:00:00' },
  { id: 'inv-p-GPNX-034', productId: 'p-GPNX-034', productName: 'Lotus Root', sku: 'GPNX-034', category: 'Vegetables', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001206/vpnexues/Lotus%20Root.jpg', quantity: 169, reorderThreshold: 100, status: 'IN_STOCK', updatedAt: '2026-08-01T00:00:00' },
  { id: 'inv-p-GPNX-035', productId: 'p-GPNX-035', productName: 'Coriander', sku: 'GPNX-035', category: 'Vegetables', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001076/vpnexues/Curry%20Leaves.jpg', quantity: 168, reorderThreshold: 100, status: 'IN_STOCK', updatedAt: '2026-08-01T00:00:00' },
  { id: 'inv-p-GPNX-036', productId: 'p-GPNX-036', productName: 'Chilli Peppers', sku: 'GPNX-036', category: 'Vegetables', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001032/vpnexues/Chilli%20Peppers.jpg', quantity: 167, reorderThreshold: 100, status: 'IN_STOCK', updatedAt: '2026-08-01T00:00:00' },
  { id: 'inv-p-GPNX-037', productId: 'p-GPNX-037', productName: 'Green Capsicum', sku: 'GPNX-037', category: 'Vegetables', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790000990/vpnexues/Bell%20Peppers%20Mix.jpg', quantity: 166, reorderThreshold: 100, status: 'IN_STOCK', updatedAt: '2026-08-01T00:00:00' },
  { id: 'inv-p-GPNX-038', productId: 'p-GPNX-038', productName: 'Watercress', sku: 'GPNX-038', category: 'Vegetables', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001332/vpnexues/Watercress.jpg', quantity: 165, reorderThreshold: 100, status: 'IN_STOCK', updatedAt: '2026-08-01T00:00:00' },
  { id: 'inv-p-GPNX-039', productId: 'p-GPNX-039', productName: 'Yam (Purple)', sku: 'GPNX-039', category: 'Vegetables', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001274/vpnexues/Purple%20Sweet%20Potato.jpg', quantity: 164, reorderThreshold: 100, status: 'IN_STOCK', updatedAt: '2026-08-01T00:00:00' },
  { id: 'inv-p-GPNX-040', productId: 'p-GPNX-040', productName: 'Bitter Melon', sku: 'GPNX-040', category: 'Vegetables', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790000996/vpnexues/Bitter%20Melon.jpg', quantity: 142, reorderThreshold: 100, status: 'IN_STOCK', updatedAt: '2026-08-01T00:00:00' },
  { id: 'inv-p-GPNX-041', productId: 'p-GPNX-041', productName: 'Iceberg Lettuce', sku: 'GPNX-041', category: 'Vegetables', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001182/vpnexues/Iceberg%20Lettuce.jpg', quantity: 141, reorderThreshold: 100, status: 'IN_STOCK', updatedAt: '2026-08-01T00:00:00' },
  { id: 'inv-p-GPNX-042', productId: 'p-GPNX-042', productName: 'Butterhead Lettuce', sku: 'GPNX-042', category: 'Vegetables', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001063/vpnexues/Cos%20Lettuce.jpg', quantity: 140, reorderThreshold: 100, status: 'IN_STOCK', updatedAt: '2026-08-01T00:00:00' },
  { id: 'inv-p-GPNX-043', productId: 'p-GPNX-043', productName: 'Turnip', sku: 'GPNX-043', category: 'Vegetables', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001152/vpnexues/Fresh%20Turnips.jpg', quantity: 139, reorderThreshold: 100, status: 'IN_STOCK', updatedAt: '2026-08-01T00:00:00' },
  { id: 'inv-p-GPNX-044', productId: 'p-GPNX-044', productName: 'Fennel Bulb', sku: 'GPNX-044', category: 'Vegetables', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001121/vpnexues/Fresh%20Fennel.jpg', quantity: 138, reorderThreshold: 100, status: 'IN_STOCK', updatedAt: '2026-08-01T00:00:00' },
  { id: 'inv-p-GPNX-045', productId: 'p-GPNX-045', productName: 'Pointed Gourd', sku: 'GPNX-045', category: 'Vegetables', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001258/vpnexues/Pointed%20Gourd.jpg', quantity: 137, reorderThreshold: 100, status: 'IN_STOCK', updatedAt: '2026-08-01T00:00:00' },
  { id: 'inv-p-GPNX-046', productId: 'p-GPNX-046', productName: 'Cluster Beans', sku: 'GPNX-046', category: 'Vegetables', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001107/vpnexues/French%20Beans.jpg', quantity: 136, reorderThreshold: 100, status: 'IN_STOCK', updatedAt: '2026-08-01T00:00:00' },
  { id: 'inv-p-GPNX-047', productId: 'p-GPNX-047', productName: 'Ridge Gourd', sku: 'GPNX-047', category: 'Vegetables', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001287/vpnexues/Ridge%20Gourd.jpg', quantity: 135, reorderThreshold: 100, status: 'IN_STOCK', updatedAt: '2026-08-01T00:00:00' },
  { id: 'inv-p-GPNX-048', productId: 'p-GPNX-048', productName: 'Colocasia Leaves', sku: 'GPNX-048', category: 'Vegetables', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001058/vpnexues/Colocasia%20Leaves.jpg', quantity: 134, reorderThreshold: 100, status: 'IN_STOCK', updatedAt: '2026-08-01T00:00:00' },
  { id: 'inv-p-GPNX-049', productId: 'p-GPNX-049', productName: 'Snake Gourd', sku: 'GPNX-049', category: 'Vegetables', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001287/vpnexues/Ridge%20Gourd.jpg', quantity: 133, reorderThreshold: 100, status: 'IN_STOCK', updatedAt: '2026-08-01T00:00:00' },
  { id: 'inv-p-GPNX-050', productId: 'p-GPNX-050', productName: 'Banana Flower', sku: 'GPNX-050', category: 'Vegetables', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790000978/vpnexues/Banana%20Flower.jpg', quantity: 111, reorderThreshold: 100, status: 'IN_STOCK', updatedAt: '2026-08-01T00:00:00' },
  { id: 'inv-p-GPNX-051', productId: 'p-GPNX-051', productName: 'Alphonso Mango', sku: 'GPNX-051', category: 'Fruits', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790000963/vpnexues/Alphonso%20Mango.jpg', quantity: 110, reorderThreshold: 100, status: 'IN_STOCK', updatedAt: '2026-08-01T00:00:00' },
  { id: 'inv-p-GPNX-052', productId: 'p-GPNX-052', productName: 'Fresh Bananas', sku: 'GPNX-052', category: 'Fruits', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001114/vpnexues/Fresh%20Bananas.jpg', quantity: 109, reorderThreshold: 100, status: 'IN_STOCK', updatedAt: '2026-08-01T00:00:00' },
  { id: 'inv-p-GPNX-053', productId: 'p-GPNX-053', productName: 'Dragon Fruit (White)', sku: 'GPNX-053', category: 'Fruits', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001083/vpnexues/Dragon%20Fruit.jpg', quantity: 108, reorderThreshold: 100, status: 'IN_STOCK', updatedAt: '2026-08-01T00:00:00' },
  { id: 'inv-p-GPNX-054', productId: 'p-GPNX-054', productName: 'Green Apples', sku: 'GPNX-054', category: 'Fruits', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001162/vpnexues/Green%20Apples.jpg', quantity: 107, reorderThreshold: 100, status: 'IN_STOCK', updatedAt: '2026-08-01T00:00:00' },
  { id: 'inv-p-GPNX-055', productId: 'p-GPNX-055', productName: 'Papaya', sku: 'GPNX-055', category: 'Fruits', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001138/vpnexues/Fresh%20Papaya.jpg', quantity: 106, reorderThreshold: 100, status: 'IN_STOCK', updatedAt: '2026-08-01T00:00:00' },
  { id: 'inv-p-GPNX-056', productId: 'p-GPNX-056', productName: 'Pomegranate', sku: 'GPNX-056', category: 'Fruits', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001145/vpnexues/Fresh%20Pomegranate.jpg', quantity: 105, reorderThreshold: 100, status: 'IN_STOCK', updatedAt: '2026-08-01T00:00:00' },
  { id: 'inv-p-GPNX-057', productId: 'p-GPNX-057', productName: 'Fresh Pineapple', sku: 'GPNX-057', category: 'Fruits', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001142/vpnexues/Fresh%20Pineapple.jpg', quantity: 104, reorderThreshold: 100, status: 'IN_STOCK', updatedAt: '2026-08-01T00:00:00' },
  { id: 'inv-p-GPNX-058', productId: 'p-GPNX-058', productName: 'Watermelon', sku: 'GPNX-058', category: 'Fruits', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001334/vpnexues/Watermelon.jpg', quantity: 103, reorderThreshold: 100, status: 'IN_STOCK', updatedAt: '2026-08-01T00:00:00' },
  { id: 'inv-p-GPNX-059', productId: 'p-GPNX-059', productName: 'Red Grapes', sku: 'GPNX-059', category: 'Fruits', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001283/vpnexues/Red%20Grapes.jpg', quantity: 102, reorderThreshold: 100, status: 'IN_STOCK', updatedAt: '2026-08-01T00:00:00' },
  { id: 'inv-p-GPNX-060', productId: 'p-GPNX-060', productName: 'Strawberries', sku: 'GPNX-060', category: 'Fruits', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001148/vpnexues/Fresh%20Strawberries.jpg', quantity: 80, reorderThreshold: 100, status: 'LOW_STOCK', updatedAt: '2026-08-01T00:00:00' },
  { id: 'inv-p-GPNX-061', productId: 'p-GPNX-061', productName: 'Orange Navel', sku: 'GPNX-061', category: 'Fruits', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001137/vpnexues/Fresh%20Oranges.jpg', quantity: 79, reorderThreshold: 100, status: 'LOW_STOCK', updatedAt: '2026-08-01T00:00:00' },
  { id: 'inv-p-GPNX-062', productId: 'p-GPNX-062', productName: 'Lemon', sku: 'GPNX-062', category: 'Fruits', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001129/vpnexues/Fresh%20Lemons.jpg', quantity: 78, reorderThreshold: 100, status: 'LOW_STOCK', updatedAt: '2026-08-01T00:00:00' },
  { id: 'inv-p-GPNX-063', productId: 'p-GPNX-063', productName: 'Kiwi Fruit', sku: 'GPNX-063', category: 'Fruits', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001193/vpnexues/Kiwi%20Fruit.jpg', quantity: 77, reorderThreshold: 100, status: 'LOW_STOCK', updatedAt: '2026-08-01T00:00:00' },
  { id: 'inv-p-GPNX-064', productId: 'p-GPNX-064', productName: 'Ripe Avocado', sku: 'GPNX-064', category: 'Fruits', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001111/vpnexues/Fresh%20Avocado.jpg', quantity: 76, reorderThreshold: 100, status: 'LOW_STOCK', updatedAt: '2026-08-01T00:00:00' },
  { id: 'inv-p-GPNX-065', productId: 'p-GPNX-065', productName: 'Blueberries', sku: 'GPNX-065', category: 'Fruits', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001115/vpnexues/Fresh%20Blueberries.jpg', quantity: 75, reorderThreshold: 100, status: 'LOW_STOCK', updatedAt: '2026-08-01T00:00:00' },
  { id: 'inv-p-GPNX-066', productId: 'p-GPNX-066', productName: 'Passion Fruit', sku: 'GPNX-066', category: 'Fruits', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001254/vpnexues/Passion%20Fruit.jpg', quantity: 74, reorderThreshold: 100, status: 'LOW_STOCK', updatedAt: '2026-08-01T00:00:00' },
  { id: 'inv-p-GPNX-067', productId: 'p-GPNX-067', productName: 'Guava', sku: 'GPNX-067', category: 'Fruits', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001126/vpnexues/Fresh%20Guava.jpg', quantity: 73, reorderThreshold: 100, status: 'LOW_STOCK', updatedAt: '2026-08-01T00:00:00' },
  { id: 'inv-p-GPNX-068', productId: 'p-GPNX-068', productName: 'Sapodilla (Chiku)', sku: 'GPNX-068', category: 'Fruits', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001295/vpnexues/Sapodilla.jpg', quantity: 72, reorderThreshold: 100, status: 'LOW_STOCK', updatedAt: '2026-08-01T00:00:00' },
  { id: 'inv-p-GPNX-069', productId: 'p-GPNX-069', productName: 'Jackfruit', sku: 'GPNX-069', category: 'Fruits', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001127/vpnexues/Fresh%20Jackfruit.jpg', quantity: 71, reorderThreshold: 100, status: 'LOW_STOCK', updatedAt: '2026-08-01T00:00:00' },
  { id: 'inv-p-GPNX-070', productId: 'p-GPNX-070', productName: 'Rambutan', sku: 'GPNX-070', category: 'Fruits', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001279/vpnexues/Rambutan.jpg', quantity: 49, reorderThreshold: 100, status: 'LOW_STOCK', updatedAt: '2026-08-01T00:00:00' },
  { id: 'inv-p-GPNX-071', productId: 'p-GPNX-071', productName: 'Longan', sku: 'GPNX-071', category: 'Fruits', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001203/vpnexues/Longan.jpg', quantity: 48, reorderThreshold: 100, status: 'LOW_STOCK', updatedAt: '2026-08-01T00:00:00' },
  { id: 'inv-p-GPNX-072', productId: 'p-GPNX-072', productName: 'Star Fruit', sku: 'GPNX-072', category: 'Fruits', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001307/vpnexues/Star%20Fruit.jpg', quantity: 47, reorderThreshold: 100, status: 'LOW_STOCK', updatedAt: '2026-08-01T00:00:00' },
  { id: 'inv-p-GPNX-073', productId: 'p-GPNX-073', productName: 'Custard Apple', sku: 'GPNX-073', category: 'Fruits', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001079/vpnexues/Custard%20Apple.jpg', quantity: 46, reorderThreshold: 100, status: 'LOW_STOCK', updatedAt: '2026-08-01T00:00:00' },
  { id: 'inv-p-GPNX-074', productId: 'p-GPNX-074', productName: 'Pear', sku: 'GPNX-074', category: 'Fruits', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001170/vpnexues/Green%20Pears.jpg', quantity: 45, reorderThreshold: 100, status: 'LOW_STOCK', updatedAt: '2026-08-01T00:00:00' },
  { id: 'inv-p-GPNX-075', productId: 'p-GPNX-075', productName: 'Dates Medjool', sku: 'GPNX-075', category: 'Fruits', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001215/vpnexues/Medjool%20Dates.jpg', quantity: 44, reorderThreshold: 100, status: 'LOW_STOCK', updatedAt: '2026-08-01T00:00:00' },
  { id: 'inv-p-GPNX-076', productId: 'p-GPNX-076', productName: 'Fig', sku: 'GPNX-076', category: 'Fruits', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001122/vpnexues/Fresh%20Figs.jpg', quantity: 43, reorderThreshold: 100, status: 'LOW_STOCK', updatedAt: '2026-08-01T00:00:00' },
  { id: 'inv-p-GPNX-077', productId: 'p-GPNX-077', productName: 'Plums', sku: 'GPNX-077', category: 'Fruits', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001144/vpnexues/Fresh%20Plums.jpg', quantity: 42, reorderThreshold: 100, status: 'LOW_STOCK', updatedAt: '2026-08-01T00:00:00' },
  { id: 'inv-p-GPNX-078', productId: 'p-GPNX-078', productName: 'Cherries', sku: 'GPNX-078', category: 'Fruits', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001117/vpnexues/Fresh%20Cherries.jpg', quantity: 41, reorderThreshold: 100, status: 'LOW_STOCK', updatedAt: '2026-08-01T00:00:00' },
  { id: 'inv-p-GPNX-079', productId: 'p-GPNX-079', productName: 'Red Banana', sku: 'GPNX-079', category: 'Fruits', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001282/vpnexues/Red%20Bananas.jpg', quantity: 40, reorderThreshold: 100, status: 'LOW_STOCK', updatedAt: '2026-08-01T00:00:00' },
  { id: 'inv-p-GPNX-080', productId: 'p-GPNX-080', productName: 'Coconut (Fresh)', sku: 'GPNX-080', category: 'Fruits', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001119/vpnexues/Fresh%20Coconut.jpg', quantity: 18, reorderThreshold: 100, status: 'LOW_STOCK', updatedAt: '2026-08-01T00:00:00' },
  { id: 'inv-p-GPNX-081', productId: 'p-GPNX-081', productName: 'Soursop', sku: 'GPNX-081', category: 'Fruits', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001301/vpnexues/Soursop.jpg', quantity: 17, reorderThreshold: 100, status: 'LOW_STOCK', updatedAt: '2026-08-01T00:00:00' },
  { id: 'inv-p-GPNX-082', productId: 'p-GPNX-082', productName: 'Peaches', sku: 'GPNX-082', category: 'Fruits', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001140/vpnexues/Fresh%20Peaches.jpg', quantity: 16, reorderThreshold: 100, status: 'LOW_STOCK', updatedAt: '2026-08-01T00:00:00' },
  { id: 'inv-p-GPNX-083', productId: 'p-GPNX-083', productName: 'Raspberries', sku: 'GPNX-083', category: 'Fruits', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001147/vpnexues/Fresh%20Raspberries.jpg', quantity: 15, reorderThreshold: 100, status: 'LOW_STOCK', updatedAt: '2026-08-01T00:00:00' },
  { id: 'inv-p-GPNX-084', productId: 'p-GPNX-084', productName: 'Mandarin Oranges', sku: 'GPNX-084', category: 'Fruits', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001210/vpnexues/Mandarin%20Oranges.jpg', quantity: 14, reorderThreshold: 100, status: 'LOW_STOCK', updatedAt: '2026-08-01T00:00:00' },
  { id: 'inv-p-GPNX-085', productId: 'p-GPNX-085', productName: 'Tamarind', sku: 'GPNX-085', category: 'Fruits', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001150/vpnexues/Fresh%20Tamarind.jpg', quantity: 13, reorderThreshold: 100, status: 'LOW_STOCK', updatedAt: '2026-08-01T00:00:00' },
  { id: 'inv-p-GPNX-086', productId: 'p-GPNX-086', productName: 'Grape Fruit', sku: 'GPNX-086', category: 'Fruits', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001159/vpnexues/Grape%20Fruit.jpg', quantity: 12, reorderThreshold: 100, status: 'LOW_STOCK', updatedAt: '2026-08-01T00:00:00' },
  { id: 'inv-p-GPNX-087', productId: 'p-GPNX-087', productName: 'Cantaloupe Melon', sku: 'GPNX-087', category: 'Fruits', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001230/vpnexues/Muskmelon.jpg', quantity: 11, reorderThreshold: 100, status: 'LOW_STOCK', updatedAt: '2026-08-01T00:00:00' },
  { id: 'inv-p-GPNX-088', productId: 'p-GPNX-088', productName: 'Lychee', sku: 'GPNX-088', category: 'Fruits', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001131/vpnexues/Fresh%20Lychee.jpg', quantity: 10, reorderThreshold: 100, status: 'LOW_STOCK', updatedAt: '2026-08-01T00:00:00' },
  { id: 'inv-p-GPNX-089', productId: 'p-GPNX-089', productName: 'Apricots', sku: 'GPNX-089', category: 'Fruits', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001109/vpnexues/Fresh%20Apricots.jpg', quantity: 9, reorderThreshold: 100, status: 'LOW_STOCK', updatedAt: '2026-08-01T00:00:00' },
  { id: 'inv-p-GPNX-090', productId: 'p-GPNX-090', productName: 'Banana Blossom', sku: 'GPNX-090', category: 'Fruits', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790000974/vpnexues/Banana%20Blossom.jpg', quantity: 587, reorderThreshold: 100, status: 'IN_STOCK', updatedAt: '2026-08-01T00:00:00' },
  { id: 'inv-p-GPNX-091', productId: 'p-GPNX-091', productName: 'Cold-Pressed Juice Mix', sku: 'GPNX-091', category: 'Beverages', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/f_auto,q_auto/v1790954701/monika-designs/GPNX-091.png', quantity: 586, reorderThreshold: 80, status: 'IN_STOCK', updatedAt: '2026-08-01T00:00:00' },
  { id: 'inv-p-GPNX-092', productId: 'p-GPNX-092', productName: 'Coconut Water', sku: 'GPNX-092', category: 'Beverages', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/f_auto,q_auto/v1790954835/monika-designs/GPNX-092.png', quantity: 585, reorderThreshold: 80, status: 'IN_STOCK', updatedAt: '2026-08-01T00:00:00' },
  { id: 'inv-p-GPNX-093', productId: 'p-GPNX-093', productName: 'Turmeric Latte Mix', sku: 'GPNX-093', category: 'Beverages', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/f_auto,q_auto/v1790954776/monika-designs/GPNX-093.png', quantity: 584, reorderThreshold: 80, status: 'IN_STOCK', updatedAt: '2026-08-01T00:00:00' },
  { id: 'inv-p-GPNX-094', productId: 'p-GPNX-094', productName: 'Herbal Green Tea', sku: 'GPNX-094', category: 'Beverages', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/f_auto,q_auto/v1790954715/monika-designs/GPNX-094.png', quantity: 583, reorderThreshold: 80, status: 'IN_STOCK', updatedAt: '2026-08-01T00:00:00' },
  { id: 'inv-p-GPNX-095', productId: 'p-GPNX-095', productName: 'Sugarcane Juice', sku: 'GPNX-095', category: 'Beverages', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/f_auto,q_auto/v1790954770/monika-designs/GPNX-095.png', quantity: 582, reorderThreshold: 80, status: 'IN_STOCK', updatedAt: '2026-08-01T00:00:00' },
  { id: 'inv-p-GPNX-096', productId: 'p-GPNX-096', productName: 'Mango Lassi', sku: 'GPNX-096', category: 'Beverages', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/f_auto,q_auto/v1790954797/monika-designs/GPNX-096.png', quantity: 581, reorderThreshold: 80, status: 'IN_STOCK', updatedAt: '2026-08-01T00:00:00' },
  { id: 'inv-p-GPNX-097', productId: 'p-GPNX-097', productName: 'Rose Milk', sku: 'GPNX-097', category: 'Beverages', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/f_auto,q_auto/v1790954763/monika-designs/GPNX-097.png', quantity: 580, reorderThreshold: 80, status: 'IN_STOCK', updatedAt: '2026-08-01T00:00:00' },
  { id: 'inv-p-GPNX-098', productId: 'p-GPNX-098', productName: 'Nannari Sarbath', sku: 'GPNX-098', category: 'Beverages', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/f_auto,q_auto/v1790954812/monika-designs/GPNX-098.png', quantity: 579, reorderThreshold: 80, status: 'IN_STOCK', updatedAt: '2026-08-01T00:00:00' },
  { id: 'inv-p-GPNX-099', productId: 'p-GPNX-099', productName: 'Aloe Vera Juice', sku: 'GPNX-099', category: 'Beverages', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790000960/vpnexues/Aloe%20Vera%20Juice.jpg', quantity: 578, reorderThreshold: 80, status: 'IN_STOCK', updatedAt: '2026-08-01T00:00:00' },
  { id: 'inv-p-GPNX-100', productId: 'p-GPNX-100', productName: 'Tender Coconut Water', sku: 'GPNX-100', category: 'Beverages', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001321/vpnexues/Tender%20Coconut%20Water.jpg', quantity: 505, reorderThreshold: 80, status: 'IN_STOCK', updatedAt: '2026-08-01T00:00:00' },
  { id: 'inv-p-GPNX-101', productId: 'p-GPNX-101', productName: 'Amla Juice', sku: 'GPNX-101', category: 'Beverages', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790000967/vpnexues/Amla%20Juice.jpg', quantity: 504, reorderThreshold: 80, status: 'IN_STOCK', updatedAt: '2026-08-01T00:00:00' },
  { id: 'inv-p-GPNX-102', productId: 'p-GPNX-102', productName: 'Moringa Tea', sku: 'GPNX-102', category: 'Beverages', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/f_auto,q_auto/v1790954790/monika-designs/GPNX-102.png', quantity: 503, reorderThreshold: 80, status: 'IN_STOCK', updatedAt: '2026-08-01T00:00:00' },
  { id: 'inv-p-GPNX-103', productId: 'p-GPNX-103', productName: 'Tamarind Drink', sku: 'GPNX-103', category: 'Beverages', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/f_auto,q_auto/v1790947715/monika-designs/GPNX-103.png', quantity: 502, reorderThreshold: 80, status: 'IN_STOCK', updatedAt: '2026-08-01T00:00:00' },
  { id: 'inv-p-GPNX-104', productId: 'p-GPNX-104', productName: 'Carrot-Ginger Juice', sku: 'GPNX-104', category: 'Beverages', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001012/vpnexues/Carrot-Ginger%20Juice.jpg', quantity: 501, reorderThreshold: 80, status: 'IN_STOCK', updatedAt: '2026-08-01T00:00:00' },
  { id: 'inv-p-GPNX-105', productId: 'p-GPNX-105', productName: 'Hibiscus Iced Tea', sku: 'GPNX-105', category: 'Beverages', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/f_auto,q_auto/v1790954847/monika-designs/GPNX-105.png', quantity: 500, reorderThreshold: 80, status: 'IN_STOCK', updatedAt: '2026-08-01T00:00:00' },
  { id: 'inv-p-GPNX-106', productId: 'p-GPNX-106', productName: 'Vetiver Cooler', sku: 'GPNX-106', category: 'Beverages', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/f_auto,q_auto/v1790954783/monika-designs/GPNX-106.png', quantity: 499, reorderThreshold: 80, status: 'IN_STOCK', updatedAt: '2026-08-01T00:00:00' },
  { id: 'inv-p-GPNX-107', productId: 'p-GPNX-107', productName: 'Barley Water', sku: 'GPNX-107', category: 'Beverages', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790000981/vpnexues/Barley%20Water.jpg', quantity: 498, reorderThreshold: 80, status: 'IN_STOCK', updatedAt: '2026-08-01T00:00:00' },
  { id: 'inv-p-GPNX-108', productId: 'p-GPNX-108', productName: 'Kokum Sherbet', sku: 'GPNX-108', category: 'Beverages', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/f_auto,q_auto/v1790954741/monika-designs/GPNX-108.png', quantity: 497, reorderThreshold: 80, status: 'IN_STOCK', updatedAt: '2026-08-01T00:00:00' },
  { id: 'inv-p-GPNX-109', productId: 'p-GPNX-109', productName: 'Jamun Juice', sku: 'GPNX-109', category: 'Beverages', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/f_auto,q_auto/v1790954728/monika-designs/GPNX-109.png', quantity: 496, reorderThreshold: 80, status: 'IN_STOCK', updatedAt: '2026-08-01T00:00:00' },
  { id: 'inv-p-GPNX-110', productId: 'p-GPNX-110', productName: 'Pineapple Vinegar', sku: 'GPNX-110', category: 'Beverages', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/f_auto,q_auto/v1790954821/monika-designs/GPNX-110.png', quantity: 474, reorderThreshold: 80, status: 'IN_STOCK', updatedAt: '2026-08-01T00:00:00' },
  { id: 'inv-p-GPNX-111', productId: 'p-GPNX-111', productName: 'Basmati Rice', sku: 'GPNX-111', category: 'Groceries', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790000986/vpnexues/Basmati%20Rice.jpg', quantity: 473, reorderThreshold: 50, status: 'IN_STOCK', updatedAt: '2026-08-01T00:00:00' },
  { id: 'inv-p-GPNX-112', productId: 'p-GPNX-112', productName: 'Cold-Pressed Coconut Oil', sku: 'GPNX-112', category: 'Groceries', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001048/vpnexues/Cold%20Pressed%20Coconut%20Oil.jpg', quantity: 472, reorderThreshold: 50, status: 'IN_STOCK', updatedAt: '2026-08-01T00:00:00' },
  { id: 'inv-p-GPNX-113', productId: 'p-GPNX-113', productName: 'Garlic Bulbs', sku: 'GPNX-113', category: 'Groceries', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001339/vpnexues/Whole%20Garlic%20Bulbs.jpg', quantity: 471, reorderThreshold: 50, status: 'IN_STOCK', updatedAt: '2026-08-01T00:00:00' },
  { id: 'inv-p-GPNX-114', productId: 'p-GPNX-114', productName: 'Free Range Eggs', sku: 'GPNX-114', category: 'Groceries', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001104/vpnexues/Free%20Range%20Eggs.jpg', quantity: 470, reorderThreshold: 50, status: 'IN_STOCK', updatedAt: '2026-08-01T00:00:00' },
  { id: 'inv-p-GPNX-115', productId: 'p-GPNX-115', productName: 'Moringa Powder', sku: 'GPNX-115', category: 'Groceries', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001223/vpnexues/Moringa%20Powder.jpg', quantity: 469, reorderThreshold: 50, status: 'IN_STOCK', updatedAt: '2026-08-01T00:00:00' },
  { id: 'inv-p-GPNX-116', productId: 'p-GPNX-116', productName: 'Chickpeas', sku: 'GPNX-116', category: 'Groceries', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001030/vpnexues/Chickpeas.jpg', quantity: 468, reorderThreshold: 50, status: 'IN_STOCK', updatedAt: '2026-08-01T00:00:00' },
  { id: 'inv-p-GPNX-117', productId: 'p-GPNX-117', productName: 'Red Lentils (Masoor)', sku: 'GPNX-117', category: 'Groceries', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001284/vpnexues/Red%20Lentils%20%28Masoor%29.jpg', quantity: 467, reorderThreshold: 50, status: 'IN_STOCK', updatedAt: '2026-08-01T00:00:00' },
  { id: 'inv-p-GPNX-118', productId: 'p-GPNX-118', productName: 'Yellow Lentils (Toor)', sku: 'GPNX-118', category: 'Groceries', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001345/vpnexues/Yellow%20Lentils.jpg', quantity: 466, reorderThreshold: 50, status: 'IN_STOCK', updatedAt: '2026-08-01T00:00:00' },
  { id: 'inv-p-GPNX-119', productId: 'p-GPNX-119', productName: 'Whole Black Pepper', sku: 'GPNX-119', category: 'Groceries', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001337/vpnexues/Whole%20Black%20Pepper.jpg', quantity: 465, reorderThreshold: 50, status: 'IN_STOCK', updatedAt: '2026-08-01T00:00:00' },
  { id: 'inv-p-GPNX-120', productId: 'p-GPNX-120', productName: 'Turmeric Powder', sku: 'GPNX-120', category: 'Groceries', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001325/vpnexues/Turmeric%20Powder.jpg', quantity: 443, reorderThreshold: 50, status: 'IN_STOCK', updatedAt: '2026-08-01T00:00:00' },
  { id: 'inv-p-GPNX-121', productId: 'p-GPNX-121', productName: 'Cumin Seeds', sku: 'GPNX-121', category: 'Groceries', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001074/vpnexues/Cumin%20Seeds.jpg', quantity: 442, reorderThreshold: 50, status: 'IN_STOCK', updatedAt: '2026-08-01T00:00:00' },
  { id: 'inv-p-GPNX-122', productId: 'p-GPNX-122', productName: 'Coriander Seeds', sku: 'GPNX-122', category: 'Groceries', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001060/vpnexues/Coriander%20Seeds.jpg', quantity: 441, reorderThreshold: 50, status: 'IN_STOCK', updatedAt: '2026-08-01T00:00:00' },
  { id: 'inv-p-GPNX-123', productId: 'p-GPNX-123', productName: 'Green Cardamom Pods', sku: 'GPNX-123', category: 'Groceries', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001167/vpnexues/Green%20Cardamom%20Pods.jpg', quantity: 440, reorderThreshold: 50, status: 'IN_STOCK', updatedAt: '2026-08-01T00:00:00' },
  { id: 'inv-p-GPNX-124', productId: 'p-GPNX-124', productName: 'Cinnamon Sticks', sku: 'GPNX-124', category: 'Groceries', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001035/vpnexues/Cinnamon%20Sticks.jpg', quantity: 439, reorderThreshold: 50, status: 'IN_STOCK', updatedAt: '2026-08-01T00:00:00' },
  { id: 'inv-p-GPNX-125', productId: 'p-GPNX-125', productName: 'Cloves', sku: 'GPNX-125', category: 'Groceries', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001037/vpnexues/Cloves.jpg', quantity: 438, reorderThreshold: 50, status: 'IN_STOCK', updatedAt: '2026-08-01T00:00:00' },
  { id: 'inv-p-GPNX-126', productId: 'p-GPNX-126', productName: 'Sesame Seeds', sku: 'GPNX-126', category: 'Groceries', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001297/vpnexues/Sesame%20Seeds.jpg', quantity: 437, reorderThreshold: 50, status: 'IN_STOCK', updatedAt: '2026-08-01T00:00:00' },
  { id: 'inv-p-GPNX-127', productId: 'p-GPNX-127', productName: 'Mustard Seeds', sku: 'GPNX-127', category: 'Groceries', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001231/vpnexues/Mustard%20Seeds.jpg', quantity: 436, reorderThreshold: 50, status: 'IN_STOCK', updatedAt: '2026-08-01T00:00:00' },
  { id: 'inv-p-GPNX-128', productId: 'p-GPNX-128', productName: 'Fenugreek Seeds', sku: 'GPNX-128', category: 'Groceries', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001101/vpnexues/Fenugreek%20Seeds.jpg', quantity: 435, reorderThreshold: 50, status: 'IN_STOCK', updatedAt: '2026-08-01T00:00:00' },
  { id: 'inv-p-GPNX-129', productId: 'p-GPNX-129', productName: 'Groundnut Oil', sku: 'GPNX-129', category: 'Groceries', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001173/vpnexues/Groundnut%20Oil.jpg', quantity: 434, reorderThreshold: 50, status: 'IN_STOCK', updatedAt: '2026-08-01T00:00:00' },
  { id: 'inv-p-GPNX-130', productId: 'p-GPNX-130', productName: 'Cane Jaggery', sku: 'GPNX-130', category: 'Groceries', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001005/vpnexues/Cane%20Jaggery.jpg', quantity: 412, reorderThreshold: 50, status: 'IN_STOCK', updatedAt: '2026-08-01T00:00:00' },
  { id: 'inv-p-GPNX-131', productId: 'p-GPNX-131', productName: 'Honey (Raw Wildflower)', sku: 'GPNX-131', category: 'Groceries', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001180/vpnexues/Honey%20%28Raw%20Wildflower%29.jpg', quantity: 411, reorderThreshold: 50, status: 'IN_STOCK', updatedAt: '2026-08-01T00:00:00' },
  { id: 'inv-p-GPNX-132', productId: 'p-GPNX-132', productName: 'Ghee (Cow Milk)', sku: 'GPNX-132', category: 'Groceries', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001157/vpnexues/Ghee%20%28Cow%20Milk%29.jpg', quantity: 410, reorderThreshold: 50, status: 'IN_STOCK', updatedAt: '2026-08-01T00:00:00' },
  { id: 'inv-p-GPNX-133', productId: 'p-GPNX-133', productName: 'Tapioca Flour', sku: 'GPNX-133', category: 'Groceries', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001318/vpnexues/Tapioca%20Flour.jpg', quantity: 409, reorderThreshold: 50, status: 'IN_STOCK', updatedAt: '2026-08-01T00:00:00' },
  { id: 'inv-p-GPNX-134', productId: 'p-GPNX-134', productName: 'Ragi Flour (Finger Millet)', sku: 'GPNX-134', category: 'Groceries', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001275/vpnexues/Ragi%20Flour%20%28Finger%20Millet%29.jpg', quantity: 408, reorderThreshold: 50, status: 'IN_STOCK', updatedAt: '2026-08-01T00:00:00' },
  { id: 'inv-p-GPNX-135', productId: 'p-GPNX-135', productName: 'Organic Quinoa', sku: 'GPNX-135', category: 'Groceries', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001249/vpnexues/Organic%20Quinoa.jpg', quantity: 407, reorderThreshold: 50, status: 'IN_STOCK', updatedAt: '2026-08-01T00:00:00' },
  { id: 'inv-p-GPNX-136', productId: 'p-GPNX-136', productName: 'Oats (Rolled)', sku: 'GPNX-136', category: 'Groceries', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001237/vpnexues/Oats%20%28Rolled%29.jpg', quantity: 406, reorderThreshold: 50, status: 'IN_STOCK', updatedAt: '2026-08-01T00:00:00' },
  { id: 'inv-p-GPNX-137', productId: 'p-GPNX-137', productName: 'Almonds', sku: 'GPNX-137', category: 'Groceries', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790000957/vpnexues/Almonds.jpg', quantity: 405, reorderThreshold: 50, status: 'IN_STOCK', updatedAt: '2026-08-01T00:00:00' },
  { id: 'inv-p-GPNX-138', productId: 'p-GPNX-138', productName: 'Cashew Nuts', sku: 'GPNX-138', category: 'Groceries', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001015/vpnexues/Cashew%20Nuts.jpg', quantity: 404, reorderThreshold: 50, status: 'IN_STOCK', updatedAt: '2026-08-01T00:00:00' },
  { id: 'inv-p-GPNX-139', productId: 'p-GPNX-139', productName: 'Walnut Kernels', sku: 'GPNX-139', category: 'Groceries', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001331/vpnexues/Walnut%20Kernels.jpg', quantity: 403, reorderThreshold: 50, status: 'IN_STOCK', updatedAt: '2026-08-01T00:00:00' },
  { id: 'inv-p-GPNX-140', productId: 'p-GPNX-140', productName: 'Flaxseeds', sku: 'GPNX-140', category: 'Groceries', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001103/vpnexues/Flaxseeds.jpg', quantity: 381, reorderThreshold: 50, status: 'IN_STOCK', updatedAt: '2026-08-01T00:00:00' },
  { id: 'inv-p-GPNX-141', productId: 'p-GPNX-141', productName: 'Chia Seeds', sku: 'GPNX-141', category: 'Groceries', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001027/vpnexues/Chia%20Seeds.jpg', quantity: 380, reorderThreshold: 50, status: 'IN_STOCK', updatedAt: '2026-08-01T00:00:00' },
  { id: 'inv-p-GPNX-142', productId: 'p-GPNX-142', productName: 'Sunflower Seeds', sku: 'GPNX-142', category: 'Groceries', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001310/vpnexues/Sunflower%20Seeds.jpg', quantity: 379, reorderThreshold: 50, status: 'IN_STOCK', updatedAt: '2026-08-01T00:00:00' },
  { id: 'inv-p-GPNX-143', productId: 'p-GPNX-143', productName: 'Pumpkin Seeds', sku: 'GPNX-143', category: 'Groceries', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001268/vpnexues/Pumpkin%20Seeds.jpg', quantity: 378, reorderThreshold: 50, status: 'IN_STOCK', updatedAt: '2026-08-01T00:00:00' },
  { id: 'inv-p-GPNX-144', productId: 'p-GPNX-144', productName: 'Dry Red Chilli', sku: 'GPNX-144', category: 'Groceries', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001093/vpnexues/Dry%20Red%20Chilli.jpg', quantity: 377, reorderThreshold: 50, status: 'IN_STOCK', updatedAt: '2026-08-01T00:00:00' },
  { id: 'inv-p-GPNX-145', productId: 'p-GPNX-145', productName: 'Star Anise', sku: 'GPNX-145', category: 'Groceries', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001306/vpnexues/Star%20Anise.jpg', quantity: 376, reorderThreshold: 50, status: 'IN_STOCK', updatedAt: '2026-08-01T00:00:00' },
  { id: 'inv-p-GPNX-146', productId: 'p-GPNX-146', productName: 'Dried Mango Powder (Amchur)', sku: 'GPNX-146', category: 'Groceries', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001090/vpnexues/Dried%20Mango%20Powder%20%28Amchur%29.jpg', quantity: 375, reorderThreshold: 50, status: 'IN_STOCK', updatedAt: '2026-08-01T00:00:00' },
  { id: 'inv-p-GPNX-147', productId: 'p-GPNX-147', productName: 'Tamarind Paste', sku: 'GPNX-147', category: 'Groceries', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001316/vpnexues/Tamarind%20Paste.jpg', quantity: 374, reorderThreshold: 50, status: 'IN_STOCK', updatedAt: '2026-08-01T00:00:00' },
  { id: 'inv-p-GPNX-148', productId: 'p-GPNX-148', productName: 'Coconut Milk', sku: 'GPNX-148', category: 'Groceries', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001045/vpnexues/Coconut%20Milk.jpg', quantity: 373, reorderThreshold: 50, status: 'IN_STOCK', updatedAt: '2026-08-01T00:00:00' },
  { id: 'inv-p-GPNX-149', productId: 'p-GPNX-149', productName: 'Brown Rice', sku: 'GPNX-149', category: 'Groceries', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001002/vpnexues/Brown%20Rice.jpg', quantity: 372, reorderThreshold: 50, status: 'IN_STOCK', updatedAt: '2026-08-01T00:00:00' },
  { id: 'inv-p-GPNX-150', productId: 'p-GPNX-150', productName: 'Mung Beans (Green)', sku: 'GPNX-150', category: 'Groceries', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001225/vpnexues/Mung%20Beans%20%28Green%29%201.jpg', quantity: 350, reorderThreshold: 50, status: 'IN_STOCK', updatedAt: '2026-08-01T00:00:00' },
  { id: 'inv-p-GPNX-151', productId: 'p-GPNX-151', productName: 'Dried Chilli Flakes', sku: 'GPNX-151', category: 'Groceries', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001085/vpnexues/Dried%20Chilli%20Flakes.jpg', quantity: 349, reorderThreshold: 50, status: 'IN_STOCK', updatedAt: '2026-08-01T00:00:00' },
  { id: 'inv-p-GPNX-152', productId: 'p-GPNX-152', productName: 'Dried Fenugreek Leaves (Kasuri Methi)', sku: 'GPNX-152', category: 'Groceries', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001089/vpnexues/Dried%20Fenugreek%20Leaves%20%28Kasuri%20Methi%29.jpg', quantity: 348, reorderThreshold: 50, status: 'IN_STOCK', updatedAt: '2026-08-01T00:00:00' },
  { id: 'inv-p-GPNX-153', productId: 'p-GPNX-153', productName: 'Asafoetida', sku: 'GPNX-153', category: 'Groceries', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790000969/vpnexues/Asafoetida.jpg', quantity: 347, reorderThreshold: 50, status: 'IN_STOCK', updatedAt: '2026-08-01T00:00:00' },
  { id: 'inv-p-GPNX-154', productId: 'p-GPNX-154', productName: 'Dried Coconut (Kopra)', sku: 'GPNX-154', category: 'Groceries', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001087/vpnexues/Dried%20Coconut%20%28Kopra%29.jpg', quantity: 346, reorderThreshold: 50, status: 'IN_STOCK', updatedAt: '2026-08-01T00:00:00' },
  { id: 'inv-p-GPNX-156', productId: 'p-GPNX-156', productName: 'Pomelo', sku: 'GPNX-156', category: 'Fruits', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001159/vpnexues/Grape%20Fruit.jpg', quantity: 344, reorderThreshold: 100, status: 'IN_STOCK', updatedAt: '2026-08-01T00:00:00' },
  { id: 'inv-p-GPNX-157', productId: 'p-GPNX-157', productName: 'Mangosteen', sku: 'GPNX-157', category: 'Fruits', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001159/vpnexues/Grape%20Fruit.jpg', quantity: 343, reorderThreshold: 100, status: 'IN_STOCK', updatedAt: '2026-08-01T00:00:00' },
  { id: 'inv-p-GPNX-158', productId: 'p-GPNX-158', productName: 'Langsat', sku: 'GPNX-158', category: 'Fruits', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001203/vpnexues/Longan.jpg', quantity: 342, reorderThreshold: 100, status: 'IN_STOCK', updatedAt: '2026-08-01T00:00:00' },
  { id: 'inv-p-GPNX-159', productId: 'p-GPNX-159', productName: 'Salak', sku: 'GPNX-159', category: 'Fruits', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001298/vpnexues/Snake%20Fruit.jpg', quantity: 341, reorderThreshold: 100, status: 'IN_STOCK', updatedAt: '2026-08-01T00:00:00' },
  { id: 'inv-p-GPNX-160', productId: 'p-GPNX-160', productName: 'Java Apple', sku: 'GPNX-160', category: 'Fruits', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001162/vpnexues/Green%20Apples.jpg', quantity: 319, reorderThreshold: 100, status: 'IN_STOCK', updatedAt: '2026-08-01T00:00:00' },
  { id: 'inv-p-GPNX-170', productId: 'p-GPNX-170', productName: 'Malay Gooseberry', sku: 'GPNX-170', category: 'Fruits', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001162/vpnexues/Green%20Apples.jpg', quantity: 288, reorderThreshold: 100, status: 'IN_STOCK', updatedAt: '2026-08-01T00:00:00' },
  { id: 'inv-p-GPNX-171', productId: 'p-GPNX-171', productName: 'Rose Myrtle', sku: 'GPNX-171', category: 'Fruits', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001126/vpnexues/Fresh%20Guava.jpg', quantity: 287, reorderThreshold: 100, status: 'IN_STOCK', updatedAt: '2026-08-01T00:00:00' },
  { id: 'inv-p-GPNX-172', productId: 'p-GPNX-172', productName: 'Snake Fruit', sku: 'GPNX-172', category: 'Fruits', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001298/vpnexues/Snake%20Fruit.jpg', quantity: 286, reorderThreshold: 100, status: 'IN_STOCK', updatedAt: '2026-08-01T00:00:00' },
  { id: 'inv-p-GPNX-173', productId: 'p-GPNX-173', productName: 'Durian', sku: 'GPNX-173', category: 'Fruits', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001127/vpnexues/Fresh%20Jackfruit.jpg', quantity: 285, reorderThreshold: 100, status: 'IN_STOCK', updatedAt: '2026-08-01T00:00:00' },
  { id: 'inv-p-GPNX-174', productId: 'p-GPNX-174', productName: 'Rose Apple', sku: 'GPNX-174', category: 'Fruits', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001162/vpnexues/Green%20Apples.jpg', quantity: 284, reorderThreshold: 100, status: 'IN_STOCK', updatedAt: '2026-08-01T00:00:00' },
  { id: 'inv-p-GPNX-175', productId: 'p-GPNX-175', productName: 'Golden Delicious Apples', sku: 'GPNX-175', category: 'Fruits', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001158/vpnexues/Golden%20Delicious%20Apples.jpg', quantity: 283, reorderThreshold: 100, status: 'IN_STOCK', updatedAt: '2026-08-01T00:00:00' },
  { id: 'inv-p-GPNX-176', productId: 'p-GPNX-176', productName: 'Peanut Oil', sku: 'GPNX-176', category: 'Groceries', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001050/vpnexues/Cold%20Pressed%20Peanut%20Oil.jpg', quantity: 282, reorderThreshold: 50, status: 'IN_STOCK', updatedAt: '2026-08-01T00:00:00' },
  { id: 'inv-p-GPNX-177', productId: 'p-GPNX-177', productName: 'Raw Peanuts', sku: 'GPNX-177', category: 'Groceries', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001280/vpnexues/Raw%20Peanuts%20%28With%20Shells%29.jpg', quantity: 281, reorderThreshold: 50, status: 'IN_STOCK', updatedAt: '2026-08-01T00:00:00' },
  { id: 'inv-p-GPNX-178', productId: 'p-GPNX-178', productName: 'Sesame Oil', sku: 'GPNX-178', category: 'Groceries', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001265/vpnexues/Pressed%20Sesame%20Oil.jpg', quantity: 280, reorderThreshold: 50, status: 'IN_STOCK', updatedAt: '2026-08-01T00:00:00' },
  { id: 'inv-p-GPNX-179', productId: 'p-GPNX-179', productName: 'Frozen Mixed Vegetables', sku: 'GPNX-179', category: 'Groceries', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001153/vpnexues/Frozen%20Mixed%20Vegetables.jpg', quantity: 279, reorderThreshold: 50, status: 'IN_STOCK', updatedAt: '2026-08-01T00:00:00' },
  { id: 'inv-p-GPNX-180', productId: 'p-GPNX-180', productName: 'Premium Dairy Butter', sku: 'GPNX-180', category: 'Groceries', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001261/vpnexues/Premium%20Dairy%20Butter.jpg', quantity: 257, reorderThreshold: 50, status: 'IN_STOCK', updatedAt: '2026-08-01T00:00:00' },
  { id: 'inv-p-GPNX-181', productId: 'p-GPNX-181', productName: 'Farm Fresh Cow Ghee', sku: 'GPNX-181', category: 'Groceries', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001098/vpnexues/Farm%20Fresh%20Cow%20Ghee.jpg', quantity: 256, reorderThreshold: 50, status: 'IN_STOCK', updatedAt: '2026-08-01T00:00:00' },
  { id: 'inv-p-GPNX-182', productId: 'p-GPNX-182', productName: 'Paneer Cheese Cubes', sku: 'GPNX-182', category: 'Groceries', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001252/vpnexues/Paneer%20Cheese%20Cubes.jpg', quantity: 255, reorderThreshold: 50, status: 'IN_STOCK', updatedAt: '2026-08-01T00:00:00' },
  { id: 'inv-p-GPNX-183', productId: 'p-GPNX-183', productName: 'Premium Fresh Curd', sku: 'GPNX-183', category: 'Groceries', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001264/vpnexues/Premium%20Fresh%20Curd.jpg', quantity: 254, reorderThreshold: 50, status: 'IN_STOCK', updatedAt: '2026-08-01T00:00:00' },
  { id: 'inv-p-GPNX-184', productId: 'p-GPNX-184', productName: 'Premium Fresh Cheese', sku: 'GPNX-184', category: 'Groceries', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001263/vpnexues/Premium%20Fresh%20Cheese.jpg', quantity: 253, reorderThreshold: 50, status: 'IN_STOCK', updatedAt: '2026-08-01T00:00:00' },
  { id: 'inv-p-GPNX-185', productId: 'p-GPNX-185', productName: 'Masala Chai', sku: 'GPNX-185', category: 'Beverages', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/f_auto,q_auto/v1790947588/monika-designs/GPNX-185.png', quantity: 252, reorderThreshold: 80, status: 'IN_STOCK', updatedAt: '2026-08-01T00:00:00' },
  { id: 'inv-p-GPNX-186', productId: 'p-GPNX-186', productName: 'Fresh Orange Juice', sku: 'GPNX-186', category: 'Beverages', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/f_auto,q_auto/v1790954708/monika-designs/GPNX-186.png', quantity: 251, reorderThreshold: 80, status: 'IN_STOCK', updatedAt: '2026-08-01T00:00:00' },
  { id: 'inv-p-GPNX-187', productId: 'p-GPNX-187', productName: 'Iced Coffee', sku: 'GPNX-187', category: 'Beverages', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/f_auto,q_auto/v1790954721/monika-designs/GPNX-187.png', quantity: 250, reorderThreshold: 80, status: 'IN_STOCK', updatedAt: '2026-08-01T00:00:00' },
  { id: 'inv-p-GPNX-188', productId: 'p-GPNX-188', productName: 'Jasmine Green Tea', sku: 'GPNX-188', category: 'Beverages', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/f_auto,q_auto/v1790954735/monika-designs/GPNX-188.png', quantity: 249, reorderThreshold: 80, status: 'IN_STOCK', updatedAt: '2026-08-01T00:00:00' },
  { id: 'inv-p-GPNX-189', productId: 'p-GPNX-189', productName: 'Protein Shake', sku: 'GPNX-189', category: 'Beverages', imageUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/f_auto,q_auto/v1790954756/monika-designs/GPNX-189.png', quantity: 248, reorderThreshold: 80, status: 'IN_STOCK', updatedAt: '2026-08-01T00:00:00' },
];

interface BuyerSeed {
  name: string;
  phone: string;
  email: string;
  city: string;
}

const BUYERS: Record<string, BuyerSeed[]> = {
  IN: [
    { name: 'Priya Sharma', phone: '+91 98765 43210', email: 'priya@email.com', city: 'Mumbai' },
    { name: 'Rahul Patel', phone: '+91 87654 32109', email: 'rahul@email.com', city: 'Chennai' },
    { name: 'Anjali Singh', phone: '+91 76543 21098', email: 'anjali@email.com', city: 'Delhi' },
    { name: 'Vikram Kumar', phone: '+91 65432 10987', email: 'vikram@email.com', city: 'Bengaluru' },
    { name: 'Meena Iyer', phone: '+91 54321 09876', email: 'meena@email.com', city: 'Hyderabad' },
  ],
  SG: [
    { name: 'Mei Chen', phone: '+65 8123 4567', email: 'mei@email.com', city: 'Tampines' },
    { name: 'Raj Kumar', phone: '+65 8234 5678', email: 'rajk@email.com', city: 'Jurong' },
    { name: 'Sarah Lim', phone: '+65 8345 6789', email: 'sarah@email.com', city: 'Bedok' },
    { name: 'Ahmad Ali', phone: '+65 8456 7890', email: 'ahmad@email.com', city: 'Woodlands' },
    { name: 'Grace Tan', phone: '+65 8567 8901', email: 'grace@email.com', city: 'Serangoon' },
  ],
  AE: [
    { name: 'Ahmed Khan', phone: '+971 50 123 4567', email: 'ahmed@email.com', city: 'Dubai' },
    { name: 'Fatima Noor', phone: '+971 55 234 5678', email: 'fatima@email.com', city: 'Abu Dhabi' },
    { name: 'Omar Farouk', phone: '+971 52 345 6789', email: 'omar@email.com', city: 'Sharjah' },
    { name: 'Layla Hassan', phone: '+971 50 456 7890', email: 'layla@email.com', city: 'Dubai' },
    { name: 'Yusuf Malik', phone: '+971 55 567 8901', email: 'yusuf@email.com', city: 'Ajman' },
  ],
  US: [
    { name: 'John Smith', phone: '+1 212 555 0101', email: 'john@email.com', city: 'New York' },
    { name: 'Emily Davis', phone: '+1 312 555 0102', email: 'emily@email.com', city: 'Chicago' },
    { name: 'Michael Brown', phone: '+1 415 555 0103', email: 'michael@email.com', city: 'San Francisco' },
    { name: 'Jessica Wilson', phone: '+1 713 555 0104', email: 'jessica@email.com', city: 'Houston' },
    { name: 'David Miller', phone: '+1 206 555 0105', email: 'david@email.com', city: 'Seattle' },
  ],
};

const ORDER_STATUSES = ['PLACED', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'] as const;
const CHANNELS = ['SHOP', 'SMALL_BOX', 'BIG_BOX', 'B2B'] as const;
const COUNTRY_PAYMENT_METHODS: Record<string, readonly string[]> = {
  IN: ['UPI', 'Card', 'COD', 'Net Banking', 'UPI', 'Card'],
  SG: ['PayNow', 'Card', 'GrabPay', 'COD', 'PayNow', 'Card'],
  AE: ['Card', 'Apple Pay', 'COD', 'Card', 'Apple Pay', 'COD'],
  US: ['Card', 'Apple Pay', 'COD', 'Card', 'Apple Pay', 'COD'],
};

function buildOrders(): AdminOrderDetail[] {
  const out: AdminOrderDetail[] = [];
  const codes = Object.keys(BUYERS);
  const now = new Date();
  codes.forEach((code, ci) => {
    const buyers = BUYERS[code];
    const methods = COUNTRY_PAYMENT_METHODS[code] ?? ['Card', 'UPI', 'COD', 'Net Banking', 'Card', 'UPI'];
    for (let i = 0; i < 6; i++) {
      const b = buyers[i % buyers.length];
      const status = ORDER_STATUSES[(i + ci) % ORDER_STATUSES.length];
      const total = 1200 + ((ci * 6 + i) * 373) % 4200;
      const n = ci * 6 + i + 1;
      const daysAgo = (ci * 6 + i) * 12 + (i * 7) % 15;
      const orderDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
      const createdAt = orderDate.toISOString();
      out.push({
        id: `demo-order-${code}-${n}`,
        orderNumber: `${code}-10${String(n).padStart(2, '0')}`,
        status,
        channel: CHANNELS[(i + ci) % CHANNELS.length],
        buyer: { id: `demo-buyer-${code}-${i}`, name: b.name, email: b.email, phone: b.phone, emailVerified: true },
        address: {
          id: `demo-addr-${code}-${i}`, label: 'Home', name: b.name, phone: b.phone,
          addressLine: `${10 + i} Main Street`, flat: null, landmark: null,
          city: b.city, pincode: '00000', state: b.city, country: 'IN', isDefault: true, lat: null, lng: null,
        },
        items: [
          { name: 'Organic Tomatoes', imageUrl: null, boxType: null, qty: 2 + (i % 3), weightKg: null, unitPrice: 45, lineTotal: 45 * (2 + (i % 3)) },
          { name: 'Brown Rice', imageUrl: null, boxType: null, qty: 1, weightKg: null, unitPrice: 65, lineTotal: 65 },
        ],
        itemTotal: total,
        discount: 0,
        boxDiscount: 0,
        deliveryFee: 50,
        tax: 0,
        tip: 0,
        grandTotal: total + 50,
        paymentMethod: methods[i % methods.length],
        couponCode: null,
        countryCode: code,
        createdAt,
      });
    }
  });
  return out;
}

function buildCustomers(): AdminCustomer[] {
  const out: AdminCustomer[] = [];
  Object.entries(BUYERS).forEach(([code, buyers], ci) => {
    buyers.forEach((b, i) => {
      const custId = `demo-buyer-${code}-${i}`;
      const custOrders = DEMO_ORDER_DETAILS.filter((o) => o.buyer.id === custId);
      const orderCount = custOrders.length;
      const totalSpent = custOrders.reduce((s, o) => s + o.grandTotal, 0);
      out.push({
        id: `demo-cust-${code}-${i}`,
        name: b.name,
        email: b.email,
        phone: b.phone,
        countryCode: code,
        orderCount,
        totalSpent,
        customerType: (ci + i) % 4 === 3 ? 'B2B' : 'B2C',
        registeredAt: `2026-0${1 + ((ci + i) % 6)}-15T00:00:00`,
      });
    });
  });
  return out;
}

export const DEMO_ORDER_DETAILS: AdminOrderDetail[] = buildOrders();

export const DEMO_ORDERS: AdminOrderSummary[] = DEMO_ORDER_DETAILS.map((o) => ({
  id: o.id,
  orderNumber: o.orderNumber,
  buyerName: o.buyer.name,
  buyerPhone: o.buyer.phone,
  countryCode: o.countryCode,
  channel: o.channel,
  status: o.status,
  grandTotal: o.grandTotal,
  createdAt: o.createdAt,
}));

export const DEMO_CUSTOMERS: AdminCustomer[] = buildCustomers();

export interface ProductSalesInfo {
  name: string;
  totalUnits: number;
  totalRevenue: number;
  orderCount: number;
}

export function computeProductSales(): ProductSalesInfo[] {
  const map = new Map<string, ProductSalesInfo>();
  for (const o of DEMO_ORDER_DETAILS) {
    for (const item of o.items) {
      const e = map.get(item.name) ?? { name: item.name, totalUnits: 0, totalRevenue: 0, orderCount: 0 };
      e.totalUnits += item.qty;
      e.totalRevenue += item.lineTotal;
      e.orderCount += 1;
      map.set(item.name, e);
    }
  }
  return [...map.values()].sort((a, b) => b.totalRevenue - a.totalRevenue);
}

export const DEMO_MESSAGES: ContactMessage[] = [
  // â”€â”€ India â”€â”€
  { id: 'demo-msg-1', name: 'Rahul Sharma', email: 'rahul.sharma@email.com', phone: '+91 98765 43210', countryCode: 'IN', subject: 'Delivery delayed for my last order', message: 'My order was expected yesterday but I have not received any update. Please check the status.', status: 'NEW', priority: 'medium', category: 'delivery', assignedTo: 'Admin', createdAt: '2026-08-16T09:00:00', lastResponseAt: null, address: '12 MG Road, Mumbai, Maharashtra 400001', orderId: 'IN-1012', productName: 'Organic Tomatoes (2kg)', productPrice: 45 },
  { id: 'demo-msg-2', name: 'Priya Patel', email: 'priya.patel@email.com', phone: '+91 87654 32109', countryCode: 'IN', subject: 'Requesting refund for damaged item', message: 'The baby spinach I received was wilted and damaged. I would like a full refund for this item.', status: 'NEW', priority: 'high', category: 'refund', assignedTo: 'Admin', createdAt: '2026-08-09T14:00:00', lastResponseAt: null, address: '45 Anna Salai, Chennai, Tamil Nadu 600002', orderId: 'IN-1008', productName: 'Baby Spinach (500g)', productPrice: 32 },
  { id: 'demo-msg-3', name: 'Ravi Kumar', email: 'ravi.kumar@email.com', phone: '+91 76543 21098', countryCode: 'IN', subject: 'Question about order tracking', message: 'How can I track my current order? I cannot find the tracking link in my email.', status: 'REPLIED', priority: 'low', category: 'general', assignedTo: 'Admin', createdAt: '2026-08-02T11:00:00', lastResponseAt: '2026-08-03T10:00:00', address: '78 Park Street, Kolkata, West Bengal 700003', orderId: 'IN-1005', productName: null, productPrice: null },
  { id: 'demo-msg-4', name: 'Ananya Singh', email: 'ananya.singh@email.com', phone: '+91 65432 10987', countryCode: 'IN', subject: 'Change delivery address for order', message: 'I need to update my delivery address for the upcoming order. The new address is in Bangalore.', status: 'CLOSED', priority: 'medium', category: 'order', assignedTo: 'Admin', createdAt: '2026-07-26T08:00:00', lastResponseAt: '2026-07-28T16:00:00', address: '12 Koramangala, Bangalore, Karnataka 560004', orderId: 'IN-1003', productName: null, productPrice: null },

  // â”€â”€ UAE â”€â”€
  { id: 'demo-msg-5', name: 'Ahmed Al-Rashid', email: 'ahmed.alrashid@email.com', phone: '+971 50 123 4567', countryCode: 'AE', subject: 'Delivery delayed for my last order', message: 'My order was expected yesterday but I have not received any update. Please check the status.', status: 'NEW', priority: 'medium', category: 'delivery', assignedTo: 'Admin', createdAt: '2026-08-31T09:00:00', lastResponseAt: null, address: '23 Sheikh Zayed Rd, Dubai, UAE', orderId: 'AE-1010', productName: 'Bell Peppers Mix (3pcs)', productPrice: 100 },
  { id: 'demo-msg-6', name: 'Fatima Al Mansoori', email: 'fatima.al.mansoori@email.com', phone: '+971 55 234 5678', countryCode: 'AE', subject: 'Order issue with missing items', message: 'I received my order but two items were missing from the package. Please arrange for the missing items to be delivered.', status: 'NEW', priority: 'high', category: 'order', assignedTo: 'Admin', createdAt: '2026-08-24T14:00:00', lastResponseAt: null, address: '56 Corniche Rd, Abu Dhabi, UAE', orderId: 'AE-1007', productName: 'Mixed Vegetables Box', productPrice: 150 },
  { id: 'demo-msg-7', name: 'Omar Hassan', email: 'omar.hassan@email.com', phone: '+971 52 345 6789', countryCode: 'AE', subject: 'Product quality concern', message: 'The mangoes I received were overripe and not fresh. I would like to know about your quality guarantee.', status: 'REPLIED', priority: 'low', category: 'product', assignedTo: 'Admin', createdAt: '2026-08-17T11:00:00', lastResponseAt: '2026-08-18T09:30:00', address: '89 Al Nahda, Sharjah, UAE', orderId: 'AE-1004', productName: 'Alphonso Mango (3pcs)', productPrice: 180 },
  { id: 'demo-msg-8', name: 'Layla Khalid', email: 'layla.khalid@email.com', phone: '+971 50 456 7890', countryCode: 'AE', subject: 'Change delivery address for order', message: 'Please change my delivery address for the next scheduled delivery to my office address.', status: 'CLOSED', priority: 'medium', category: 'order', assignedTo: 'Admin', createdAt: '2026-08-10T08:00:00', lastResponseAt: '2026-08-12T14:00:00', address: '34 Jumeirah Beach Rd, Dubai, UAE', orderId: 'AE-1001', productName: null, productPrice: null },

  // â”€â”€ US â”€â”€
  { id: 'demo-msg-9', name: 'John Smith', email: 'john.smith@email.com', phone: '+1 212 555 0101', countryCode: 'US', subject: 'Order not delivered on time', message: 'My scheduled delivery was supposed to arrive on Monday but it is now Wednesday with no update.', status: 'NEW', priority: 'high', category: 'delivery', assignedTo: 'Admin', createdAt: '2026-08-28T10:00:00', lastResponseAt: null, address: '123 Broadway, New York, NY 10001', orderId: 'US-1009', productName: 'Fresh Bananas (1 bunch)', productPrice: 40 },
  { id: 'demo-msg-10', name: 'Emily Davis', email: 'emily.davis@email.com', phone: '+1 312 555 0102', countryCode: 'US', subject: 'Refund for cancelled order', message: 'My order was cancelled but I have not received my refund yet. It has been over 5 business days.', status: 'NEW', priority: 'high', category: 'refund', assignedTo: 'Admin', createdAt: '2026-08-21T14:00:00', lastResponseAt: null, address: '456 Michigan Ave, Chicago, IL 60601', orderId: 'US-1006', productName: 'Dragon Fruit (2pcs)', productPrice: 75 },
  { id: 'demo-msg-11', name: 'Michael Brown', email: 'michael.brown@email.com', phone: '+1 415 555 0103', countryCode: 'US', subject: 'Product quality feedback', message: 'The strawberries I received this week were excellent quality. Great job!', status: 'REPLIED', priority: 'low', category: 'product', assignedTo: 'Admin', createdAt: '2026-08-14T09:00:00', lastResponseAt: '2026-08-15T11:00:00', address: '789 Market St, San Francisco, CA 94105', orderId: 'US-1003', productName: 'Strawberries (250g)', productPrice: 150 },
  { id: 'demo-msg-12', name: 'Jessica Wilson', email: 'jessica.wilson@email.com', phone: '+1 713 555 0104', countryCode: 'US', subject: 'Account access issue', message: 'I cannot log in to my account. My password reset email is not arriving.', status: 'CLOSED', priority: 'medium', category: 'account', assignedTo: 'Admin', createdAt: '2026-08-07T16:00:00', lastResponseAt: '2026-08-09T10:00:00', address: '321 Main St, Houston, TX 77002', orderId: null, productName: null, productPrice: null },

  // â”€â”€ Singapore â”€â”€
  { id: 'demo-msg-13', name: 'Mei Chen', email: 'mei.chen@email.com', phone: '+65 8123 4567', countryCode: 'SG', subject: 'Damaged items in delivery', message: 'Two mango boxes arrived damaged. The packaging was crushed. Requesting replacement or refund.', status: 'NEW', priority: 'medium', category: 'product', assignedTo: 'Admin', createdAt: '2026-08-25T14:00:00', lastResponseAt: null, address: '12 Tampines Ave 10, Singapore 529765', orderId: 'SG-1011', productName: 'Alphonso Mango (3pcs)', productPrice: 180 },
  { id: 'demo-msg-14', name: 'Raj Kumar', email: 'raj.kumar@email.com', phone: '+65 8234 5678', countryCode: 'SG', subject: 'Payment not processed', message: 'I was charged twice for the same order. Please refund the duplicate charge.', status: 'NEW', priority: 'critical', category: 'payment', assignedTo: 'Admin', createdAt: '2026-08-18T11:00:00', lastResponseAt: null, address: '45 Jurong West St 75, Singapore 649042', orderId: 'SG-1008', productName: null, productPrice: null },
  { id: 'demo-msg-15', name: 'Sarah Lim', email: 'sarah.lim@email.com', phone: '+65 8345 6789', countryCode: 'SG', subject: 'Quality feedback on spinach', message: 'The spinach quality this week was excellent! Fresh and well-packed. Keep it up!', status: 'REPLIED', priority: 'low', category: 'product', assignedTo: 'Admin', createdAt: '2026-08-11T10:00:00', lastResponseAt: '2026-08-12T09:00:00', address: '67 Bedok North St 3, Singapore 460067', orderId: 'SG-1004', productName: 'Baby Spinach (200g)', productPrice: 25 },
  { id: 'demo-msg-16', name: 'Grace Tan', email: 'grace.tan@email.com', phone: '+65 8567 8901', countryCode: 'SG', subject: 'Wrong items delivered', message: 'I ordered organic carrots but received regular carrots instead. Please send the correct item.', status: 'CLOSED', priority: 'medium', category: 'order', assignedTo: 'Admin', createdAt: '2026-08-04T08:00:00', lastResponseAt: '2026-08-06T14:00:00', address: '89 Serangoon Central, Singapore 556088', orderId: 'SG-1002', productName: 'Organic Carrots (500g)', productPrice: 45 },
];

export const DEMO_ADMIN_USERS: AdminUserSummary[] = [
  { id: 'demo-admin-1', email: 'superadmin@vpnexues.com', name: 'superadmin', role: 'SUPER_ADMIN', active: true },
  { id: 'demo-admin-2', email: 'india@vpnexues.com', name: 'india', role: 'ADMIN', active: true },
  { id: 'demo-admin-3', email: 'singapore@vpnexues.com', name: 'singapore', role: 'ADMIN', active: true },
  { id: 'demo-admin-4', email: 'uae@vpnexues.com', name: 'uae', role: 'ADMIN', active: true },
  { id: 'demo-admin-5', email: 'usa@vpnexues.com', name: 'usa', role: 'ADMIN', active: true },
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

export const DEMO_SUB_ADMINS: DemoSubAdmin[] = [
  { id: 'SA-IN-001', name: 'Ramesh Kumar', email: 'ramesh.kumar@vpnexues.com', phone: '+91 98456 12345', password: 'admin123', country: 'india', role: 'sub-admin', modules: ['dashboard', 'orders', 'products'], permissions: ['view', 'edit'], status: 'active', lastLogin: '13 Aug 2026, 10:24 AM', createdDate: '05 Jan 2025' },
  { id: 'SA-AE-001', name: 'Fatima Al Maktoum', email: 'fatima@vpnexues.com', phone: '+971 55 123 4567', password: 'admin123', country: 'uae', role: 'admin', modules: ['dashboard', 'orders', 'products', 'users'], permissions: ['view', 'edit', 'delete'], status: 'active', lastLogin: '13 Aug 2026, 09:12 AM', createdDate: '12 Feb 2025' },
  { id: 'SA-US-001', name: 'John Carter', email: 'john.carter@vpnexues.com', phone: '+1 (555) 234-5678', password: 'admin123', country: 'us', role: 'manager', modules: ['dashboard', 'orders'], permissions: ['view'], status: 'active', lastLogin: '12 Aug 2026, 06:45 PM', createdDate: '20 Mar 2025' },
  { id: 'SA-SG-001', name: 'Wei Ling Tan', email: 'wei.ling@vpnexues.com', phone: '+65 9123 4567', password: 'admin123', country: 'singapore', role: 'viewer', modules: ['dashboard'], permissions: ['view'], status: 'inactive', lastLogin: '10 Aug 2026, 03:30 PM', createdDate: '01 Apr 2025' },
];

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

export const DEMO_B2B: B2BEnquiry[] = [
  { id: 'demo-b2b-1', companyName: 'FreshMart Grocers', contactName: 'Arun Prakash', email: 'arun@freshmart.com', phone: '+91 98765 00001', countryCode: 'IN', productInterest: 'Vegetables', quantity: '500 kg/week', estimatedValue: 250000, status: 'PENDING', createdAt: '2026-07-30T00:00:00' },
  { id: 'demo-b2b-2', companyName: 'Island Foods Pte', contactName: 'Wei Ming', email: 'wei@islandfoods.sg', phone: '+65 8123 0001', countryCode: 'SG', productInterest: 'Fruits', quantity: '200 kg/week', estimatedValue: 95000, status: 'IN_REVIEW', createdAt: '2026-07-28T00:00:00' },
  { id: 'demo-b2b-3', companyName: 'Desert Fresh LLC', contactName: 'Omar Farouk', email: 'omar@desertfresh.ae', phone: '+971 50 000 0001', countryCode: 'AE', productInterest: 'Grains', quantity: '1 ton/month', estimatedValue: 180000, status: 'PENDING', createdAt: '2026-07-29T00:00:00' },
  { id: 'demo-b2b-4', companyName: 'Green Bowl Inc', contactName: 'Emily Davis', email: 'emily@greenbowl.com', phone: '+1 312 555 0001', countryCode: 'US', productInterest: 'Herbs', quantity: '100 kg/week', estimatedValue: 60000, status: 'ACCEPTED', createdAt: '2026-07-25T00:00:00' },
];

export const DEMO_TESTIMONIALS: Testimonial[] = [  { id: 'demo-t-1', name: 'Priya Sharma', role: 'Homemaker', location: 'Mumbai', rating: 5, quote: 'Fresh vegetables delivered on time, every time!', photoUrl: null, active: true },
  { id: 'demo-t-2', name: 'Mei Chen', role: 'Chef', location: 'Singapore', rating: 5, quote: 'Restaurant-quality produce at honest prices.', photoUrl: null, active: true },
  { id: 'demo-t-3', name: 'Ahmed Khan', role: 'Store Owner', location: 'Dubai', rating: 4, quote: 'Reliable bulk supply for my grocery store.', photoUrl: null, active: true },
  { id: 'demo-t-4', name: 'John Smith', role: 'Customer', location: 'New York', rating: 4, quote: 'Good quality, delivery took a day extra once.', photoUrl: null, active: false },
];

export const DEMO_SETTINGS: StoreSettings = {
  websiteName: 'VPNexues',
  tagline: 'Fresh groceries, delivered',
  defaultCurrency: 'SGD',
  timezone: 'Asia/Singapore',
  dateFormat: 'DD/MM/YYYY',
  timeFormat: '24h',
  websiteEmail: 'hello@vpnexues.com',
  websitePhone: '+65 6000 0000',
  storeName: 'VPNexues',
  storeEmail: 'hello@vpnexues.com',
  storePhone: '+65 6000 0000',
  storeAddress: null,
  storeDescription: null,
  freeShippingThreshold: 50,
  standardShippingRate: 5,
  expressShippingRate: 12,
  defaultDeliveryDays: 2,
  facebookUrl: null,
  instagramUrl: null,
  twitterUrl: null,
  youtubeUrl: null,
  whatsappUrl: null,
  telegramUrl: null,
  smallBoxStandardSlots: 10,
  smallBoxPremiumRate: 0.15,
  bigBoxMinKg: 10,
  bigBoxDiscountRate: 0.12,
};

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

export const DEMO_COUNTRIES: DemoCountry[] = [
  { id: 'india', name: 'India', code: 'IN', flag: 'ðŸ‡®ðŸ‡³', flagImg: 'https://flagcdn.com/w40/in.png', currency: 'Rupees', currencyCode: 'INR', currencySymbol: 'â‚¹', phoneCode: '+91', language: 'Hindi, English', timezone: 'Asia/Kolkata', orders: 3245, revenue: 'â‚¹82,45,000', customers: 2456, admin: 'India Admin', adminEmail: 'india@vpnexues.com', status: 'active', cities: 'Mumbai, Delhi, Bengaluru, Chennai', createdDate: '01 Jan 2024', lastUpdatedDate: '13 Aug 2026', details: 'India is the primary market with nationwide organic farm delivery.' },
  { id: 'singapore', name: 'Singapore', code: 'SG', flag: 'ðŸ‡¸ðŸ‡¬', flagImg: 'https://flagcdn.com/w40/sg.png', currency: 'Singapore Dollar', currencyCode: 'SGD', currencySymbol: 'S$', phoneCode: '+65', language: 'English, Malay', timezone: 'Asia/Singapore', orders: 1892, revenue: 'S$45,230', customers: 1234, admin: 'Singapore Admin', adminEmail: 'singapore@vpnexues.com', status: 'active', cities: 'Singapore', createdDate: '15 Mar 2024', lastUpdatedDate: '13 Aug 2026', details: 'Singapore market with fast city deliveries.' },
  { id: 'uae', name: 'UAE', code: 'AE', flag: 'ðŸ‡¦ðŸ‡ª', flagImg: 'https://flagcdn.com/w40/ae.png', currency: 'Dirham', currencyCode: 'AED', currencySymbol: 'AED', phoneCode: '+971', language: 'Arabic, English', timezone: 'Asia/Dubai', orders: 2156, revenue: 'AED 125,600', customers: 1876, admin: 'UAE Admin', adminEmail: 'uae@vpnexues.com', status: 'active', cities: 'Dubai, Abu Dhabi, Sharjah', createdDate: '20 Apr 2024', lastUpdatedDate: '13 Aug 2026', details: 'United Arab Emirates operations across all emirates.' },
  { id: 'us', name: 'United States', code: 'US', flag: 'ðŸ‡ºðŸ‡¸', flagImg: 'https://flagcdn.com/w40/us.png', currency: 'US Dollar', currencyCode: 'USD', currencySymbol: '$', phoneCode: '+1', language: 'English', timezone: 'America/New_York', orders: 1567, revenue: '$67,890', customers: 1543, admin: 'US Admin', adminEmail: 'usa@vpnexues.com', status: 'active', cities: 'New York, Los Angeles, Chicago', createdDate: '10 Jun 2024', lastUpdatedDate: '13 Aug 2026', details: 'United States market with multi-state coverage.' },
];

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

export const DEMO_ADMIN_MESSAGES: DemoAdminMessage[] = [
  { id: 'demo-am-1', from: 'Super Admin', fromEmail: 'superadmin@vpnexues.com', to: 'india', subject: 'August targets', body: 'Revenue target increased by 10% for August. Please align your team.', ts: '2026-07-31T10:30:00', read: false, starred: true, sender: 'super' },
  { id: 'demo-am-2', from: 'Super Admin', fromEmail: 'superadmin@vpnexues.com', to: 'india', subject: 'Mumbai node maintenance', body: 'Scheduled maintenance on Aug 2, 2-4 AM IST.', ts: '2026-07-30T14:00:00', read: false, starred: false, sender: 'super' },
  { id: 'demo-am-3', from: 'Super Admin', fromEmail: 'superadmin@vpnexues.com', to: 'all', subject: 'New product guidelines', body: 'Updated listing guidelines are now in effect for all regions.', ts: '2026-07-29T09:00:00', read: true, starred: false, sender: 'super' },
  { id: 'demo-am-4', from: 'India Admin', fromEmail: 'india@vpnexues.com', to: 'super', subject: 'Re: August targets', body: 'Acknowledged. Team briefed and aligned.', ts: '2026-07-31T12:00:00', read: false, starred: false, sender: 'india' },
  { id: 'demo-am-5', from: 'Super Admin', fromEmail: 'superadmin@vpnexues.com', to: 'uae', subject: 'Dubai device abuse', body: 'Please review the multi-device abuse case flagged by the system.', ts: '2026-07-28T16:00:00', read: true, starred: false, sender: 'super' },
  { id: 'demo-am-6', from: 'Singapore Admin', fromEmail: 'singapore@vpnexues.com', to: 'super', subject: 'Stripe timeouts', body: 'Seeing intermittent 504s on payouts since yesterday.', ts: '2026-07-27T11:00:00', read: false, starred: true, sender: 'singapore' },
];

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

export const DEMO_LOGS: DemoLog[] = [
  { id: 'LOG-001', timestamp: '2026-07-31T09:15:00', user: 'superadmin@vpnexues.com', role: 'super-admin', category: 'login', details: 'Super admin signed in', country: 'global', ipAddress: '103.21.244.10', status: 'success', action: 'Login' },
  { id: 'LOG-002', timestamp: '2026-07-31T09:40:00', user: 'india@vpnexues.com', role: 'sub-admin', category: 'product', details: 'Updated price for Organic Tomatoes', country: 'india', ipAddress: '49.37.18.22', status: 'success', action: 'Price update' },
  { id: 'LOG-003', timestamp: '2026-07-31T10:05:00', user: 'superadmin@vpnexues.com', role: 'super-admin', category: 'admin', details: 'Created sub-admin for UAE', country: 'uae', ipAddress: '103.21.244.10', status: 'success', action: 'Admin created' },
  { id: 'LOG-004', timestamp: '2026-07-30T16:20:00', user: 'uae@vpnexues.com', role: 'sub-admin', category: 'settings', details: 'Changed delivery slots', country: 'uae', ipAddress: '86.96.130.5', status: 'success', action: 'Settings update' },
  { id: 'LOG-005', timestamp: '2026-07-30T14:00:00', user: 'unknown', role: '-', category: 'login', details: 'Failed login attempt (wrong password)', country: 'global', ipAddress: '198.51.100.42', status: 'failed', action: 'Login' },
  { id: 'LOG-006', timestamp: '2026-07-30T11:30:00', user: 'singapore@vpnexues.com', role: 'sub-admin', category: 'product', details: 'Added new product Laksa Paste', country: 'singapore', ipAddress: '42.60.17.200', status: 'success', action: 'Product added' },
  { id: 'LOG-007', timestamp: '2026-07-29T18:45:00', user: 'usa@vpnexues.com', role: 'sub-admin', category: 'country', details: 'Viewed US performance report', country: 'us', ipAddress: '192.0.2.88', status: 'success', action: 'Report viewed' },
  { id: 'LOG-008', timestamp: '2026-07-29T09:00:00', user: 'superadmin@vpnexues.com', role: 'super-admin', category: 'settings', details: 'Updated SMTP configuration', country: 'global', ipAddress: '103.21.244.10', status: 'success', action: 'Settings update' },
  { id: 'LOG-009', timestamp: '2026-07-28T20:10:00', user: 'india@vpnexues.com', role: 'sub-admin', category: 'logout', details: 'Sub admin signed out', country: 'india', ipAddress: '49.37.18.22', status: 'success', action: 'Logout' },
  { id: 'LOG-010', timestamp: '2026-07-28T12:00:00', user: 'superadmin@vpnexues.com', role: 'super-admin', category: 'admin', details: 'Deactivated test admin account', country: 'global', ipAddress: '103.21.244.10', status: 'pending', action: 'Deactivation' },
  { id: 'LOG-011', timestamp: '2026-07-27T15:30:00', user: 'uae@vpnexues.com', role: 'sub-admin', category: 'product', details: 'Restocked Almarai Milk', country: 'uae', ipAddress: '86.96.130.5', status: 'success', action: 'Restock' },
  { id: 'LOG-012', timestamp: '2026-07-27T10:00:00', user: 'singapore@vpnexues.com', role: 'sub-admin', category: 'login', details: 'Sub admin signed in', country: 'singapore', ipAddress: '42.60.17.200', status: 'success', action: 'Login' },
];

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

export const DEMO_SUBSCRIBERS: DemoSubscriber[] = [
  { id: 'SUB-001', name: 'Kavitha R', email: 'kavitha@email.com', phone: '+91 90000 11111', country: 'india', source: 'Website Footer', subscribed: '2026-06-01T00:00:00', status: 'subscribed' },
  { id: 'SUB-002', name: 'Suresh M', email: 'suresh@email.com', phone: '+91 90000 22222', country: 'india', source: 'Checkout', subscribed: '2026-06-10T00:00:00', status: 'unsubscribed' },
  { id: 'SUB-003', name: 'Jia Hao', email: 'jiahao@email.com', phone: '+65 9000 1111', country: 'singapore', source: 'Home Popup', subscribed: '2026-06-05T00:00:00', status: 'subscribed' },
  { id: 'SUB-004', name: 'Aisha B', email: 'aisha@email.com', phone: '+971 50 000 1111', country: 'uae', source: 'Blog', subscribed: '2026-06-12T00:00:00', status: 'subscribed' },
  { id: 'SUB-005', name: 'Robert King', email: 'robert@email.com', phone: '+1 212 555 0111', country: 'us', source: 'Website Footer', subscribed: '2026-06-08T00:00:00', status: 'subscribed' },
  { id: 'SUB-006', name: 'Lakshmi V', email: 'lakshmi@email.com', phone: '+91 90000 33333', country: 'india', source: 'Home Popup', subscribed: '2026-07-01T00:00:00', status: 'subscribed' },
];

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

export const DEMO_GEO: Record<string, { label: string; states: DemoGeoState[] }> = {
  india: {
    label: 'State',
    states: [
      {
        name: 'Maharashtra', revenue: 1296500, orders: 1263, units: 3214, customers: 895, growth: '+8%',
        subscribers: 520, activeSubs: 460, unsubs: 60, subRetention: 88, activeRate: 88,
        delivered: 1157, inTransit: 65, cancelled: 41, avgOrder: 1027,
        bestSeller: 'Green Chillies', categoriesSold: 12, salesGrowth: '+8%',
        newCustomers: 245, repeatCustomers: 650, retentionRate: 73, revPerCustomer: 1449,
        topProducts: [
          { name: 'Green Chillies', category: 'Vegetables', revenue: 168000, share: 13 },
          { name: 'Basmati Rice', category: 'Grains', revenue: 145000, share: 11 },
          { name: 'Turmeric Powder', category: 'Spices', revenue: 132000, share: 10 },
          { name: 'Coconut Oil', category: 'Oils', revenue: 118000, share: 9 },
          { name: 'Toor Dal', category: 'Pulses', revenue: 105000, share: 8 },
        ],
        poorProducts: [
          { name: 'Saffron', category: 'Spices', revenue: 8200, status: 'Low Demand' },
          { name: 'Cardamom', category: 'Spices', revenue: 9800, status: 'Slow Moving' },
          { name: 'Poppy Seeds', category: 'Spices', revenue: 6500, status: 'Declining' },
          { name: 'Dry Ginger', category: 'Spices', revenue: 7200, status: 'Low Demand' },
          { name: 'Nutmeg', category: 'Spices', revenue: 5800, status: 'Overstocked' },
        ],
        lowStock: [
          { name: 'Green Chillies', qty: 12 }, { name: 'Fresh Tomatoes', qty: 8 },
          { name: 'Coriander Leaves', qty: 15 }, { name: 'Coriander', qty: 6 },
        ],
        highStock: [{ name: 'Basmati Rice', qty: 280 }, { name: 'Toor Dal', qty: 220 }, { name: 'Sugar', qty: 190 }],
        totalStockUnits: 1840,
        sixMonthTrend: [
          { month: '2026-04', revenue: 177350 }, { month: '2026-05', revenue: 193250 }, { month: '2026-06', revenue: 210350 },
          { month: '2026-07', revenue: 220150 }, { month: '2026-08', revenue: 238550 }, { month: '2026-09', revenue: 256850 },
        ],
        cities: [
          {
            name: 'Mumbai', revenue: 291500, orders: 236, units: 614, customers: 170, growth: '+12%',
            subscribers: 120, activeSubs: 107, unsubs: 13, subRetention: 89, activeRate: 89,
            delivered: 214, inTransit: 11, cancelled: 11, avgOrder: 1235,
            bestSeller: 'Green Chillies', categoriesSold: 10, salesGrowth: '+12%',
            newCustomers: 48, repeatCustomers: 122, retentionRate: 72, revPerCustomer: 1715,
            topProducts: [
              { name: 'Green Chillies', category: 'Fruits', revenue: 40890, share: 24 },
              { name: 'Fresh Tomatoes', category: 'Spices', revenue: 39150, share: 23 },
              { name: 'Spinach', category: 'Oils', revenue: 37830, share: 22 },
              { name: 'Mangoes', category: 'Vegetables', revenue: 28490, share: 17 },
              { name: 'Onions', category: 'Vegetables', revenue: 25230, share: 15 },
            ],
            poorProducts: [
              { name: 'Rice (Basmati)', category: 'Vegetables', revenue: 7920, status: 'Low Demand' },
              { name: 'Coconut Oil', category: 'Vegetables', revenue: 8000, status: 'Slow Moving' },
              { name: 'Organic Potatoes', category: 'Oils', revenue: 16450, status: 'Low Demand' },
              { name: 'Bananas', category: 'Oils', revenue: 18750, status: 'Low Demand' },
              { name: 'Turmeric Powder', category: 'Oils', revenue: 22910, status: 'Low Demand' },
            ],
            lowStock: [{ name: 'Green Chillies', qty: 7 }, { name: 'Mangoes', qty: 4 }, { name: 'Bananas', qty: 7 }, { name: 'Coconut Oil', qty: 2 }],
            highStock: [], totalStockUnits: 324,
            sixMonthTrend: [
              { month: '2026-04', revenue: 39600 }, { month: '2026-05', revenue: 44550 }, { month: '2026-06', revenue: 48400 },
              { month: '2026-07', revenue: 51150 }, { month: '2026-08', revenue: 52800 }, { month: '2026-09', revenue: 55000 },
            ],
          },
          {
            name: 'Pune', revenue: 416000, orders: 239, units: 680, customers: 195, growth: '+12%',
            subscribers: 110, activeSubs: 98, unsubs: 12, subRetention: 89, activeRate: 89,
            delivered: 220, inTransit: 12, cancelled: 7, avgOrder: 1741,
            bestSeller: 'Basmati Rice', categoriesSold: 11, salesGrowth: '+12%',
            newCustomers: 52, repeatCustomers: 143, retentionRate: 73, revPerCustomer: 2133,
            topProducts: [
              { name: 'Basmati Rice', category: 'Grains', revenue: 62400, share: 15 },
              { name: 'Turmeric Powder', category: 'Spices', revenue: 54100, share: 13 },
              { name: 'Toor Dal', category: 'Pulses', revenue: 49900, share: 12 },
              { name: 'Mustard Oil', category: 'Oils', revenue: 41600, share: 10 },
              { name: 'Jaggery', category: 'Grains', revenue: 37400, share: 9 },
            ],
            poorProducts: [
              { name: 'Saffron', category: 'Spices', revenue: 5200, status: 'Low Demand' },
              { name: 'Cardamom', category: 'Spices', revenue: 6100, status: 'Slow Moving' },
              { name: 'Cashews', category: 'Dry Fruits', revenue: 7800, status: 'Declining' },
              { name: 'Almonds', category: 'Dry Fruits', revenue: 8200, status: 'Low Demand' },
              { name: 'Raisins', category: 'Dry Fruits', revenue: 4500, status: 'Overstocked' },
            ],
            lowStock: [{ name: 'Fresh Coriander', qty: 5 }, { name: 'Green Chillies', qty: 9 }, { name: 'Methi Leaves', qty: 3 }],
            highStock: [{ name: 'Basmati Rice', qty: 320 }, { name: 'Sugar', qty: 250 }, { name: 'Salt', qty: 200 }],
            totalStockUnits: 420,
            sixMonthTrend: [
              { month: '2026-04', revenue: 52000 }, { month: '2026-05', revenue: 58000 }, { month: '2026-06', revenue: 65000 },
              { month: '2026-07', revenue: 70000 }, { month: '2026-08', revenue: 78000 }, { month: '2026-09', revenue: 93000 },
            ],
          },
          {
            name: 'Nagpur', revenue: 293000, orders: 338, units: 820, customers: 230, growth: '+6%',
            subscribers: 130, activeSubs: 115, unsubs: 15, subRetention: 88, activeRate: 88,
            delivered: 310, inTransit: 18, cancelled: 10, avgOrder: 867,
            bestSeller: 'Oranges', categoriesSold: 9, salesGrowth: '+6%',
            newCustomers: 65, repeatCustomers: 165, retentionRate: 72, revPerCustomer: 1274,
            topProducts: [
              { name: 'Nagpur Oranges', category: 'Fruits', revenue: 58600, share: 20 },
              { name: 'Wheat Flour', category: 'Grains', revenue: 43900, share: 15 },
              { name: 'Chana Dal', category: 'Pulses', revenue: 38100, share: 13 },
              { name: 'Soybean Oil', category: 'Oils', revenue: 32200, share: 11 },
              { name: 'Red Chili Powder', category: 'Spices', revenue: 26400, share: 9 },
            ],
            poorProducts: [
              { name: 'Dry Figs', category: 'Dry Fruits', revenue: 4100, status: 'Low Demand' },
              { name: 'Apricots', category: 'Dry Fruits', revenue: 5200, status: 'Slow Moving' },
              { name: 'Black Salt', category: 'Condiments', revenue: 3800, status: 'Declining' },
              { name: 'Chaat Masala', category: 'Condiments', revenue: 4500, status: 'Low Demand' },
              { name: 'Amchur Powder', category: 'Spices', revenue: 3200, status: 'Overstocked' },
            ],
            lowStock: [{ name: 'Fresh Oranges', qty: 10 }, { name: 'Green Chillies', qty: 6 }, { name: 'Tomatoes', qty: 8 }],
            highStock: [{ name: 'Wheat Flour', qty: 280 }, { name: 'Rice', qty: 240 }, { name: 'Sugar', qty: 180 }],
            totalStockUnits: 560,
            sixMonthTrend: [
              { month: '2026-04', revenue: 38000 }, { month: '2026-05', revenue: 42000 }, { month: '2026-06', revenue: 46000 },
              { month: '2026-07', revenue: 48000 }, { month: '2026-08', revenue: 52000 }, { month: '2026-09', revenue: 67000 },
            ],
          },
          {
            name: 'Nashik', revenue: 96000, orders: 211, units: 520, customers: 145, growth: '+4%',
            subscribers: 85, activeSubs: 75, unsubs: 10, subRetention: 88, activeRate: 88,
            delivered: 195, inTransit: 10, cancelled: 6, avgOrder: 455,
            bestSeller: 'Onions', categoriesSold: 8, salesGrowth: '+4%',
            newCustomers: 38, repeatCustomers: 107, retentionRate: 74, revPerCustomer: 662,
            topProducts: [
              { name: 'Nashik Onions', category: 'Vegetables', revenue: 24000, share: 25 },
              { name: 'Grapes', category: 'Fruits', revenue: 19200, share: 20 },
              { name: 'Wheat', category: 'Grains', revenue: 14400, share: 15 },
              { name: 'Groundnut Oil', category: 'Oils', revenue: 11500, share: 12 },
              { name: 'Cumin Seeds', category: 'Spices', revenue: 9600, share: 10 },
            ],
            poorProducts: [
              { name: 'Saffron', category: 'Spices', revenue: 1800, status: 'Low Demand' },
              { name: 'Dry Coconut', category: 'Dry Fruits', revenue: 2100, status: 'Slow Moving' },
              { name: 'Fenugreek', category: 'Spices', revenue: 1500, status: 'Declining' },
              { name: 'Carom Seeds', category: 'Spices', revenue: 1200, status: 'Low Demand' },
              { name: 'Asafoetida', category: 'Spices', revenue: 900, status: 'Overstocked' },
            ],
            lowStock: [{ name: 'Onions', qty: 12 }, { name: 'Grapes', qty: 5 }, { name: 'Green Chillies', qty: 8 }],
            highStock: [{ name: 'Wheat', qty: 180 }, { name: 'Rice', qty: 150 }],
            totalStockUnits: 340,
            sixMonthTrend: [
              { month: '2026-04', revenue: 12000 }, { month: '2026-05', revenue: 13500 }, { month: '2026-06', revenue: 14800 },
              { month: '2026-07', revenue: 15200 }, { month: '2026-08', revenue: 16000 }, { month: '2026-09', revenue: 24500 },
            ],
          },
          {
            name: 'Aurangabad', revenue: 200000, orders: 239, units: 580, customers: 155, growth: '+5%',
            subscribers: 75, activeSubs: 65, unsubs: 10, subRetention: 87, activeRate: 87,
            delivered: 218, inTransit: 14, cancelled: 7, avgOrder: 837,
            bestSeller: 'Jowar Flour', categoriesSold: 9, salesGrowth: '+5%',
            newCustomers: 42, repeatCustomers: 113, retentionRate: 73, revPerCustomer: 1290,
            topProducts: [
              { name: 'Jowar Flour', category: 'Grains', revenue: 40000, share: 20 },
              { name: 'Toor Dal', category: 'Pulses', revenue: 34000, share: 17 },
              { name: 'Sunflower Oil', category: 'Oils', revenue: 28000, share: 14 },
              { name: 'Red Chili Powder', category: 'Spices', revenue: 22000, share: 11 },
              { name: 'Besan', category: 'Grains', revenue: 18000, share: 9 },
            ],
            poorProducts: [
              { name: 'Saffron', category: 'Spices', revenue: 2200, status: 'Low Demand' },
              { name: 'Cardamom', category: 'Spices', revenue: 2800, status: 'Slow Moving' },
              { name: 'Dry Ginger', category: 'Spices', revenue: 1900, status: 'Declining' },
              { name: 'Black Pepper', category: 'Spices', revenue: 2400, status: 'Low Demand' },
              { name: 'Cloves', category: 'Spices', revenue: 1600, status: 'Overstocked' },
            ],
            lowStock: [{ name: 'Green Chillies', qty: 6 }, { name: 'Tomatoes', qty: 9 }, { name: 'Onions', qty: 11 }],
            highStock: [{ name: 'Jowar Flour', qty: 200 }, { name: 'Rice', qty: 170 }, { name: 'Sugar', qty: 130 }],
            totalStockUnits: 580,
            sixMonthTrend: [
              { month: '2026-04', revenue: 25000 }, { month: '2026-05', revenue: 28000 }, { month: '2026-06', revenue: 31000 },
              { month: '2026-07', revenue: 33000 }, { month: '2026-08', revenue: 36000 }, { month: '2026-09', revenue: 47000 },
            ],
          },
        ],
      },
      {
        name: 'Tamil Nadu', revenue: 962000, orders: 612, units: 1840, customers: 490, growth: '+7%',
        subscribers: 310, activeSubs: 275, unsubs: 35, subRetention: 89, activeRate: 89,
        delivered: 558, inTransit: 32, cancelled: 22, avgOrder: 1572,
        bestSeller: 'Idli Rice', categoriesSold: 11, salesGrowth: '+7%',
        newCustomers: 125, repeatCustomers: 365, retentionRate: 74, revPerCustomer: 1963,
        topProducts: [
          { name: 'Idli Rice', category: 'Grains', revenue: 154000, share: 16 },
          { name: 'Coconut Oil', category: 'Oils', revenue: 125000, share: 13 },
          { name: 'Sambar Powder', category: 'Spices', revenue: 106000, share: 11 },
          { name: 'Toor Dal', category: 'Pulses', revenue: 96000, share: 10 },
          { name: 'Coriander', category: 'Vegetables', revenue: 77000, share: 8 },
        ],
        poorProducts: [
          { name: 'Saffron', category: 'Spices', revenue: 6800, status: 'Low Demand' },
          { name: 'Fenugreek Seeds', category: 'Spices', revenue: 7200, status: 'Slow Moving' },
          { name: 'Dry Mango', category: 'Dry Fruits', revenue: 5400, status: 'Declining' },
          { name: 'Poppy Seeds', category: 'Spices', revenue: 4800, status: 'Low Demand' },
          { name: 'Asafoetida', category: 'Spices', revenue: 3900, status: 'Overstocked' },
        ],
        lowStock: [{ name: 'Coriander', qty: 8 }, { name: 'Green Chillies', qty: 10 }, { name: 'Coriander', qty: 6 }],
        highStock: [{ name: 'Idli Rice', qty: 260 }, { name: 'Toor Dal', qty: 200 }, { name: 'Sugar', qty: 170 }],
        totalStockUnits: 1420,
        sixMonthTrend: [
          { month: '2026-04', revenue: 128000 }, { month: '2026-05', revenue: 138000 }, { month: '2026-06', revenue: 148000 },
          { month: '2026-07', revenue: 155000 }, { month: '2026-08', revenue: 162000 }, { month: '2026-09', revenue: 231000 },
        ],
        cities: [
          {
            name: 'Chennai', revenue: 99000, orders: 34, units: 95, customers: 28, growth: '+10%',
            subscribers: 22, activeSubs: 20, unsubs: 2, subRetention: 91, activeRate: 91,
            delivered: 30, inTransit: 2, cancelled: 2, avgOrder: 2912,
            bestSeller: 'Coconut Oil', categoriesSold: 8, salesGrowth: '+10%',
            newCustomers: 8, repeatCustomers: 20, retentionRate: 71, revPerCustomer: 3536,
            topProducts: [
              { name: 'Coconut Oil', category: 'Oils', revenue: 24750, share: 25 },
              { name: 'Idli Rice', category: 'Grains', revenue: 19800, share: 20 },
              { name: 'Sambar Powder', category: 'Spices', revenue: 15840, share: 16 },
              { name: 'Toor Dal', category: 'Pulses', revenue: 12870, share: 13 },
              { name: 'Coriander', category: 'Vegetables', revenue: 9900, share: 10 },
            ],
            poorProducts: [
              { name: 'Saffron', category: 'Spices', revenue: 990, status: 'Low Demand' },
              { name: 'Fenugreek', category: 'Spices', revenue: 1188, status: 'Slow Moving' },
              { name: 'Poppy Seeds', category: 'Spices', revenue: 792, status: 'Declining' },
              { name: 'Asafoetida', category: 'Spices', revenue: 594, status: 'Low Demand' },
              { name: 'Dry Ginger', category: 'Spices', revenue: 495, status: 'Overstocked' },
            ],
            lowStock: [{ name: 'Coriander', qty: 3 }, { name: 'Green Chillies', qty: 4 }],
            highStock: [{ name: 'Coconut Oil', qty: 85 }, { name: 'Idli Rice', qty: 72 }],
            totalStockUnits: 195,
            sixMonthTrend: [
              { month: '2026-04', revenue: 12000 }, { month: '2026-05', revenue: 13500 }, { month: '2026-06', revenue: 14800 },
              { month: '2026-07', revenue: 15500 }, { month: '2026-08', revenue: 16200 }, { month: '2026-09', revenue: 27000 },
            ],
          },
          {
            name: 'Coimbatore', revenue: 120000, orders: 59, units: 165, customers: 48, growth: '+6%',
            subscribers: 35, activeSubs: 31, unsubs: 4, subRetention: 89, activeRate: 89,
            delivered: 52, inTransit: 4, cancelled: 3, avgOrder: 2034,
            bestSeller: 'Turmeric Powder', categoriesSold: 9, salesGrowth: '+6%',
            newCustomers: 14, repeatCustomers: 34, retentionRate: 71, revPerCustomer: 2500,
            topProducts: [
              { name: 'Turmeric Powder', category: 'Spices', revenue: 24000, share: 20 },
              { name: 'Idli Rice', category: 'Grains', revenue: 21600, share: 18 },
              { name: 'Toor Dal', category: 'Pulses', revenue: 18000, share: 15 },
              { name: 'Coconut Oil', category: 'Oils', revenue: 15600, share: 13 },
              { name: 'Sambar Powder', category: 'Spices', revenue: 13200, share: 11 },
            ],
            poorProducts: [
              { name: 'Fenugreek', category: 'Spices', revenue: 1440, status: 'Low Demand' },
              { name: 'Poppy Seeds', category: 'Spices', revenue: 960, status: 'Slow Moving' },
              { name: 'Asafoetida', category: 'Spices', revenue: 720, status: 'Declining' },
              { name: 'Dry Mango', category: 'Dry Fruits', revenue: 840, status: 'Low Demand' },
              { name: 'Dry Ginger', category: 'Spices', revenue: 600, status: 'Overstocked' },
            ],
            lowStock: [{ name: 'Turmeric', qty: 5 }, { name: 'Coriander', qty: 3 }],
            highStock: [{ name: 'Idli Rice', qty: 65 }, { name: 'Toor Dal', qty: 55 }],
            totalStockUnits: 180,
            sixMonthTrend: [
              { month: '2026-04', revenue: 15000 }, { month: '2026-05', revenue: 16200 }, { month: '2026-06', revenue: 17500 },
              { month: '2026-07', revenue: 18000 }, { month: '2026-08', revenue: 19200 }, { month: '2026-09', revenue: 34100 },
            ],
          },
          {
            name: 'Salem', revenue: 295000, orders: 90, units: 270, customers: 72, growth: '+5%',
            subscribers: 48, activeSubs: 42, unsubs: 6, subRetention: 88, activeRate: 88,
            delivered: 82, inTransit: 5, cancelled: 3, avgOrder: 3278,
            bestSeller: 'Salem Rasam Powder', categoriesSold: 10, salesGrowth: '+5%',
            newCustomers: 18, repeatCustomers: 54, retentionRate: 75, revPerCustomer: 4097,
            topProducts: [
              { name: 'Salem Rasam Powder', category: 'Spices', revenue: 59000, share: 20 },
              { name: 'Coconut Oil', category: 'Oils', revenue: 47200, share: 16 },
              { name: 'Idli Rice', category: 'Grains', revenue: 41300, share: 14 },
              { name: 'Toor Dal', category: 'Pulses', revenue: 35400, share: 12 },
              { name: 'Sambar Powder', category: 'Spices', revenue: 29500, share: 10 },
            ],
            poorProducts: [
              { name: 'Saffron', category: 'Spices', revenue: 2950, status: 'Low Demand' },
              { name: 'Poppy Seeds', category: 'Spices', revenue: 1770, status: 'Slow Moving' },
              { name: 'Fenugreek', category: 'Spices', revenue: 2065, status: 'Declining' },
              { name: 'Asafoetida', category: 'Spices', revenue: 1180, status: 'Low Demand' },
              { name: 'Dry Ginger', category: 'Spices', revenue: 885, status: 'Overstocked' },
            ],
            lowStock: [{ name: 'Rasam Powder', qty: 6 }, { name: 'Coriander', qty: 4 }],
            highStock: [{ name: 'Idli Rice', qty: 90 }, { name: 'Coconut Oil', qty: 75 }],
            totalStockUnits: 245,
            sixMonthTrend: [
              { month: '2026-04', revenue: 38000 }, { month: '2026-05', revenue: 42000 }, { month: '2026-06', revenue: 46000 },
              { month: '2026-07', revenue: 48000 }, { month: '2026-08', revenue: 52000 }, { month: '2026-09', revenue: 69000 },
            ],
          },
          {
            name: 'Madurai', revenue: 248000, orders: 255, units: 720, customers: 195, growth: '+8%',
            subscribers: 120, activeSubs: 107, unsubs: 13, subRetention: 89, activeRate: 89,
            delivered: 232, inTransit: 14, cancelled: 9, avgOrder: 973,
            bestSeller: 'Jasmine Rice', categoriesSold: 10, salesGrowth: '+8%',
            newCustomers: 55, repeatCustomers: 140, retentionRate: 72, revPerCustomer: 1272,
            topProducts: [
              { name: 'Jasmine Rice', category: 'Grains', revenue: 49600, share: 20 },
              { name: 'Coconut Oil', category: 'Oils', revenue: 39680, share: 16 },
              { name: 'Sambar Powder', category: 'Spices', revenue: 32240, share: 13 },
              { name: 'Toor Dal', category: 'Pulses', revenue: 27280, share: 11 },
              { name: 'Coriander', category: 'Vegetables', revenue: 22320, share: 9 },
            ],
            poorProducts: [
              { name: 'Saffron', category: 'Spices', revenue: 2480, status: 'Low Demand' },
              { name: 'Fenugreek', category: 'Spices', revenue: 1984, status: 'Slow Moving' },
              { name: 'Poppy Seeds', category: 'Spices', revenue: 1488, status: 'Declining' },
              { name: 'Asafoetida', category: 'Spices', revenue: 992, status: 'Low Demand' },
              { name: 'Dry Mango', category: 'Dry Fruits', revenue: 744, status: 'Overstocked' },
            ],
            lowStock: [{ name: 'Coriander', qty: 5 }, { name: 'Green Chillies', qty: 7 }],
            highStock: [{ name: 'Jasmine Rice', qty: 80 }, { name: 'Coconut Oil', qty: 65 }],
            totalStockUnits: 310,
            sixMonthTrend: [
              { month: '2026-04', revenue: 30000 }, { month: '2026-05', revenue: 34000 }, { month: '2026-06', revenue: 38000 },
              { month: '2026-07', revenue: 40000 }, { month: '2026-08', revenue: 42000 }, { month: '2026-09', revenue: 64000 },
            ],
          },
          {
            name: 'Trichy', revenue: 200000, orders: 174, units: 590, customers: 147, growth: '+4%',
            subscribers: 85, activeSubs: 75, unsubs: 10, subRetention: 88, activeRate: 88,
            delivered: 162, inTransit: 7, cancelled: 5, avgOrder: 1149,
            bestSeller: 'Rice', categoriesSold: 9, salesGrowth: '+4%',
            newCustomers: 30, repeatCustomers: 117, retentionRate: 80, revPerCustomer: 1361,
            topProducts: [
              { name: 'Rice', category: 'Grains', revenue: 40000, share: 20 },
              { name: 'Toor Dal', category: 'Pulses', revenue: 34000, share: 17 },
              { name: 'Coconut Oil', category: 'Oils', revenue: 28000, share: 14 },
              { name: 'Sambar Powder', category: 'Spices', revenue: 22000, share: 11 },
              { name: 'Turmeric Powder', category: 'Spices', revenue: 18000, share: 9 },
            ],
            poorProducts: [
              { name: 'Saffron', category: 'Spices', revenue: 1600, status: 'Low Demand' },
              { name: 'Fenugreek', category: 'Spices', revenue: 1400, status: 'Slow Moving' },
              { name: 'Poppy Seeds', category: 'Spices', revenue: 1000, status: 'Declining' },
              { name: 'Asafoetida', category: 'Spices', revenue: 800, status: 'Low Demand' },
              { name: 'Dry Ginger', category: 'Spices', revenue: 600, status: 'Overstocked' },
            ],
            lowStock: [{ name: 'Coriander', qty: 4 }, { name: 'Green Chillies', qty: 5 }],
            highStock: [{ name: 'Rice', qty: 70 }, { name: 'Toor Dal', qty: 55 }],
            totalStockUnits: 255,
            sixMonthTrend: [
              { month: '2026-04', revenue: 25000 }, { month: '2026-05', revenue: 28000 }, { month: '2026-06', revenue: 32000 },
              { month: '2026-07', revenue: 34000 }, { month: '2026-08', revenue: 35000 }, { month: '2026-09', revenue: 46000 },
            ],
          },
        ],
      },
      {
        name: 'Karnataka', revenue: 780000, orders: 520, units: 1560, customers: 420, growth: '+6%',
        subscribers: 280, activeSubs: 248, unsubs: 32, subRetention: 89, activeRate: 89,
        delivered: 475, inTransit: 28, cancelled: 17, avgOrder: 1500,
        bestSeller: 'Ragi Flour', categoriesSold: 10, salesGrowth: '+6%',
        newCustomers: 110, repeatCustomers: 310, retentionRate: 74, revPerCustomer: 1857,
        topProducts: [
          { name: 'Ragi Flour', category: 'Grains', revenue: 124800, share: 16 },
          { name: 'Coffee Powder', category: 'Beverages', revenue: 109200, share: 14 },
          { name: 'Toor Dal', category: 'Pulses', revenue: 93600, share: 12 },
          { name: 'Groundnut Oil', category: 'Oils', revenue: 78000, share: 10 },
          { name: 'Jowar Flour', category: 'Grains', revenue: 62400, share: 8 },
        ],
        poorProducts: [
          { name: 'Saffron', category: 'Spices', revenue: 5400, status: 'Low Demand' },
          { name: 'Poppy Seeds', category: 'Spices', revenue: 6200, status: 'Slow Moving' },
          { name: 'Dry Ginger', category: 'Spices', revenue: 4800, status: 'Declining' },
          { name: 'Cardamom', category: 'Spices', revenue: 5600, status: 'Low Demand' },
          { name: 'Black Pepper', category: 'Spices', revenue: 4200, status: 'Overstocked' },
        ],
        lowStock: [{ name: 'Ragi Flour', qty: 10 }, { name: 'Coriander', qty: 7 }, { name: 'Coriander', qty: 5 }],
        highStock: [{ name: 'Coffee Powder', qty: 200 }, { name: 'Toor Dal', qty: 180 }, { name: 'Rice', qty: 160 }],
        totalStockUnits: 1280,
        sixMonthTrend: [
          { month: '2026-04', revenue: 105000 }, { month: '2026-05', revenue: 115000 }, { month: '2026-06', revenue: 125000 },
          { month: '2026-07', revenue: 130000 }, { month: '2026-08', revenue: 138000 }, { month: '2026-09', revenue: 167000 },
        ],
        cities: [
          {
            name: 'Bengaluru', revenue: 320000, orders: 220, units: 660, customers: 180, growth: '+8%',
            subscribers: 120, activeSubs: 107, unsubs: 13, subRetention: 89, activeRate: 89,
            delivered: 200, inTransit: 12, cancelled: 8, avgOrder: 1455,
            bestSeller: 'Coffee Powder', categoriesSold: 10, salesGrowth: '+8%',
            newCustomers: 48, repeatCustomers: 132, retentionRate: 73, revPerCustomer: 1778,
            topProducts: [
              { name: 'Coffee Powder', category: 'Beverages', revenue: 54400, share: 17 },
              { name: 'Ragi Flour', category: 'Grains', revenue: 44800, share: 14 },
              { name: 'Toor Dal', category: 'Pulses', revenue: 38400, share: 12 },
              { name: 'Groundnut Oil', category: 'Oils', revenue: 32000, share: 10 },
              { name: 'Jowar Flour', category: 'Grains', revenue: 25600, share: 8 },
            ],
            poorProducts: [
              { name: 'Saffron', category: 'Spices', revenue: 2240, status: 'Low Demand' },
              { name: 'Poppy Seeds', category: 'Spices', revenue: 2560, status: 'Slow Moving' },
              { name: 'Dry Ginger', category: 'Spices', revenue: 1920, status: 'Declining' },
              { name: 'Cardamom', category: 'Spices', revenue: 2240, status: 'Low Demand' },
              { name: 'Black Pepper', category: 'Spices', revenue: 1600, status: 'Overstocked' },
            ],
            lowStock: [{ name: 'Coffee Beans', qty: 5 }, { name: 'Coriander', qty: 3 }],
            highStock: [{ name: 'Coffee Powder', qty: 90 }, { name: 'Ragi Flour', qty: 75 }],
            totalStockUnits: 280,
            sixMonthTrend: [
              { month: '2026-04', revenue: 42000 }, { month: '2026-05', revenue: 46000 }, { month: '2026-06', revenue: 50000 },
              { month: '2026-07', revenue: 52000 }, { month: '2026-08', revenue: 55000 }, { month: '2026-09', revenue: 75000 },
            ],
          },
          {
            name: 'Mysuru', revenue: 180000, orders: 120, units: 360, customers: 96, growth: '+5%',
            subscribers: 65, activeSubs: 58, unsubs: 7, subRetention: 89, activeRate: 89,
            delivered: 110, inTransit: 6, cancelled: 4, avgOrder: 1500,
            bestSeller: 'Mysore Sandal Soap', categoriesSold: 8, salesGrowth: '+5%',
            newCustomers: 24, repeatCustomers: 72, retentionRate: 75, revPerCustomer: 1875,
            topProducts: [
              { name: 'Mysore Sandal Soap', category: 'Personal Care', revenue: 36000, share: 20 },
              { name: 'Ragi Flour', category: 'Grains', revenue: 30600, share: 17 },
              { name: 'Coffee Powder', category: 'Beverages', revenue: 25200, share: 14 },
              { name: 'Toor Dal', category: 'Pulses', revenue: 21600, share: 12 },
              { name: 'Groundnut Oil', category: 'Oils', revenue: 18000, share: 10 },
            ],
            poorProducts: [
              { name: 'Saffron', category: 'Spices', revenue: 1260, status: 'Low Demand' },
              { name: 'Poppy Seeds', category: 'Spices', revenue: 1440, status: 'Slow Moving' },
              { name: 'Dry Ginger', category: 'Spices', revenue: 1080, status: 'Declining' },
              { name: 'Cardamom', category: 'Spices', revenue: 900, status: 'Low Demand' },
              { name: 'Black Pepper', category: 'Spices', revenue: 720, status: 'Overstocked' },
            ],
            lowStock: [{ name: 'Ragi Flour', qty: 4 }, { name: 'Coffee Beans', qty: 3 }],
            highStock: [{ name: 'Ragi Flour', qty: 60 }, { name: 'Coffee Powder', qty: 50 }],
            totalStockUnits: 220,
            sixMonthTrend: [
              { month: '2026-04', revenue: 24000 }, { month: '2026-05', revenue: 26000 }, { month: '2026-06', revenue: 28000 },
              { month: '2026-07', revenue: 29000 }, { month: '2026-08', revenue: 31000 }, { month: '2026-09', revenue: 42000 },
            ],
          },
          {
            name: 'Mangaluru', revenue: 120000, orders: 80, units: 240, customers: 64, growth: '+4%',
            subscribers: 42, activeSubs: 37, unsubs: 5, subRetention: 88, activeRate: 88,
            delivered: 73, inTransit: 4, cancelled: 3, avgOrder: 1500,
            bestSeller: 'Cashew Nuts', categoriesSold: 8, salesGrowth: '+4%',
            newCustomers: 16, repeatCustomers: 48, retentionRate: 75, revPerCustomer: 1875,
            topProducts: [
              { name: 'Cashew Nuts', category: 'Dry Fruits', revenue: 26400, share: 22 },
              { name: 'Rice', category: 'Grains', revenue: 21600, share: 18 },
              { name: 'Coconut Oil', category: 'Oils', revenue: 18000, share: 15 },
              { name: 'Toor Dal', category: 'Pulses', revenue: 14400, share: 12 },
              { name: 'Sambar Powder', category: 'Spices', revenue: 10800, share: 9 },
            ],
            poorProducts: [
              { name: 'Saffron', category: 'Spices', revenue: 840, status: 'Low Demand' },
              { name: 'Poppy Seeds', category: 'Spices', revenue: 960, status: 'Slow Moving' },
              { name: 'Dry Ginger', category: 'Spices', revenue: 720, status: 'Declining' },
              { name: 'Cardamom', category: 'Spices', revenue: 600, status: 'Low Demand' },
              { name: 'Black Pepper', category: 'Spices', revenue: 480, status: 'Overstocked' },
            ],
            lowStock: [{ name: 'Cashew Nuts', qty: 3 }, { name: 'Coconut', qty: 5 }],
            highStock: [{ name: 'Rice', qty: 50 }, { name: 'Coconut Oil', qty: 40 }],
            totalStockUnits: 150,
            sixMonthTrend: [
              { month: '2026-04', revenue: 16000 }, { month: '2026-05', revenue: 17500 }, { month: '2026-06', revenue: 19000 },
              { month: '2026-07', revenue: 19500 }, { month: '2026-08', revenue: 20500 }, { month: '2026-09', revenue: 27500 },
            ],
          },
          {
            name: 'Hubballi', revenue: 85000, orders: 55, units: 165, customers: 44, growth: '+3%',
            subscribers: 30, activeSubs: 26, unsubs: 4, subRetention: 87, activeRate: 87,
            delivered: 50, inTransit: 3, cancelled: 2, avgOrder: 1545,
            bestSeller: 'Jowar Flour', categoriesSold: 7, salesGrowth: '+3%',
            newCustomers: 11, repeatCustomers: 33, retentionRate: 75, revPerCustomer: 1932,
            topProducts: [
              { name: 'Jowar Flour', category: 'Grains', revenue: 18700, share: 22 },
              { name: 'Groundnut Oil', category: 'Oils', revenue: 15300, share: 18 },
              { name: 'Toor Dal', category: 'Pulses', revenue: 11900, share: 14 },
              { name: 'Ragi Flour', category: 'Grains', revenue: 10200, share: 12 },
              { name: 'Turmeric Powder', category: 'Spices', revenue: 8500, share: 10 },
            ],
            poorProducts: [
              { name: 'Saffron', category: 'Spices', revenue: 595, status: 'Low Demand' },
              { name: 'Poppy Seeds', category: 'Spices', revenue: 680, status: 'Slow Moving' },
              { name: 'Dry Ginger', category: 'Spices', revenue: 510, status: 'Declining' },
              { name: 'Cardamom', category: 'Spices', revenue: 425, status: 'Low Demand' },
              { name: 'Black Pepper', category: 'Spices', revenue: 340, status: 'Overstocked' },
            ],
            lowStock: [{ name: 'Jowar Flour', qty: 4 }, { name: 'Ragi Flour', qty: 3 }],
            highStock: [{ name: 'Jowar Flour', qty: 45 }, { name: 'Groundnut Oil', qty: 35 }],
            totalStockUnits: 130,
            sixMonthTrend: [
              { month: '2026-04', revenue: 11000 }, { month: '2026-05', revenue: 12000 }, { month: '2026-06', revenue: 13000 },
              { month: '2026-07', revenue: 13500 }, { month: '2026-08', revenue: 14000 }, { month: '2026-09', revenue: 21500 },
            ],
          },
          {
            name: 'Belagavi', revenue: 75000, orders: 45, units: 135, customers: 36, growth: '+3%',
            subscribers: 23, activeSubs: 20, unsubs: 3, subRetention: 87, activeRate: 87,
            delivered: 42, inTransit: 3, cancelled: 0, avgOrder: 1667,
            bestSeller: 'Rice', categoriesSold: 7, salesGrowth: '+3%',
            newCustomers: 11, repeatCustomers: 25, retentionRate: 69, revPerCustomer: 2083,
            topProducts: [
              { name: 'Rice', category: 'Grains', revenue: 16500, share: 22 },
              { name: 'Toor Dal', category: 'Pulses', revenue: 13500, share: 18 },
              { name: 'Groundnut Oil', category: 'Oils', revenue: 10500, share: 14 },
              { name: 'Ragi Flour', category: 'Grains', revenue: 9000, share: 12 },
              { name: 'Turmeric Powder', category: 'Spices', revenue: 7500, share: 10 },
            ],
            poorProducts: [
              { name: 'Saffron', category: 'Spices', revenue: 525, status: 'Low Demand' },
              { name: 'Poppy Seeds', category: 'Spices', revenue: 600, status: 'Slow Moving' },
              { name: 'Dry Ginger', category: 'Spices', revenue: 450, status: 'Declining' },
              { name: 'Cardamom', category: 'Spices', revenue: 375, status: 'Low Demand' },
              { name: 'Black Pepper', category: 'Spices', revenue: 300, status: 'Overstocked' },
            ],
            lowStock: [{ name: 'Ragi Flour', qty: 3 }, { name: 'Coriander', qty: 2 }],
            highStock: [{ name: 'Rice', qty: 40 }, { name: 'Toor Dal', qty: 30 }],
            totalStockUnits: 105,
            sixMonthTrend: [
              { month: '2026-04', revenue: 9500 }, { month: '2026-05', revenue: 10500 }, { month: '2026-06', revenue: 11500 },
              { month: '2026-07', revenue: 12000 }, { month: '2026-08', revenue: 12500 }, { month: '2026-09', revenue: 19000 },
            ],
          },
        ],
      },
    ],
  },
  singapore: {
    label: 'Region',
    states: [
      {
        name: 'Central Region', revenue: 22000, orders: 920, units: 1380, customers: 640, growth: '+9%',
        subscribers: 410, activeSubs: 365, unsubs: 45, subRetention: 89, activeRate: 89,
        delivered: 840, inTransit: 52, cancelled: 28, avgOrder: 24,
        bestSeller: 'Laksa Paste', categoriesSold: 12, salesGrowth: '+9%',
        newCustomers: 160, repeatCustomers: 480, retentionRate: 75, revPerCustomer: 34,
        topProducts: [
          { name: 'Laksa Paste', category: 'Condiments', revenue: 3800, share: 17 },
          { name: 'Kopi O', category: 'Beverages', revenue: 3200, share: 15 },
          { name: 'Chilli Crab Sauce', category: 'Condiments', revenue: 2800, share: 13 },
          { name: 'Bak Kwa', category: 'Meat', revenue: 2400, share: 11 },
          { name: 'Kaya Jam', category: 'Spreads', revenue: 2000, share: 9 },
        ],
        poorProducts: [
          { name: 'Bak Kut Teh Mix', category: 'Condiments', revenue: 180, status: 'Low Demand' },
          { name: 'White Pepper', category: 'Spices', revenue: 120, status: 'Slow Moving' },
          { name: 'Lotus Root Chips', category: 'Snacks', revenue: 95, status: 'Declining' },
          { name: 'Belachan', category: 'Condiments', revenue: 80, status: 'Low Demand' },
          { name: 'Gula Melaka', category: 'Sweeteners', revenue: 65, status: 'Overstocked' },
        ],
        lowStock: [{ name: 'Laksa Paste', qty: 15 }, { name: 'Kopi O', qty: 12 }],
        highStock: [{ name: 'Rice Noodles', qty: 85 }, { name: 'Coconut Milk', qty: 70 }],
        totalStockUnits: 420,
        sixMonthTrend: [
          { month: '2026-04', revenue: 3200 }, { month: '2026-05', revenue: 3400 }, { month: '2026-06', revenue: 3600 },
          { month: '2026-07', revenue: 3700 }, { month: '2026-08', revenue: 3850 }, { month: '2026-09', revenue: 4250 },
        ],
        cities: [
          {
            name: 'Orchard', revenue: 8500, orders: 380, units: 570, customers: 265, growth: '+11%',
            subscribers: 170, activeSubs: 151, unsubs: 19, subRetention: 89, activeRate: 89,
            delivered: 350, inTransit: 22, cancelled: 8, avgOrder: 22,
            bestSeller: 'Kopi O', categoriesSold: 10, salesGrowth: '+11%',
            newCustomers: 66, repeatCustomers: 199, retentionRate: 75, revPerCustomer: 32,
            topProducts: [
              { name: 'Kopi O', category: 'Beverages', revenue: 1700, share: 20 },
              { name: 'Laksa Paste', category: 'Condiments', revenue: 1445, share: 17 },
              { name: 'Chilli Crab Sauce', category: 'Condiments', revenue: 1190, share: 14 },
              { name: 'Kaya Jam', category: 'Spreads', revenue: 1020, share: 12 },
              { name: 'Bak Kwa', category: 'Meat', revenue: 850, share: 10 },
            ],
            poorProducts: [
              { name: 'Bak Kut Teh Mix', category: 'Condiments', revenue: 85, status: 'Low Demand' },
              { name: 'White Pepper', category: 'Spices', revenue: 68, status: 'Slow Moving' },
              { name: 'Lotus Root Chips', category: 'Snacks', revenue: 51, status: 'Declining' },
              { name: 'Belachan', category: 'Condiments', revenue: 34, status: 'Low Demand' },
              { name: 'Gula Melaka', category: 'Sweeteners', revenue: 26, status: 'Overstocked' },
            ],
            lowStock: [{ name: 'Laksa Paste', qty: 6 }, { name: 'Kopi O', qty: 5 }],
            highStock: [{ name: 'Rice Noodles', qty: 35 }, { name: 'Coconut Milk', qty: 28 }],
            totalStockUnits: 145,
            sixMonthTrend: [
              { month: '2026-04', revenue: 1200 }, { month: '2026-05', revenue: 1280 }, { month: '2026-06', revenue: 1350 },
              { month: '2026-07', revenue: 1380 }, { month: '2026-08', revenue: 1440 }, { month: '2026-09', revenue: 1850 },
            ],
          },
          {
            name: 'Marina Bay', revenue: 5200, orders: 230, units: 345, customers: 160, growth: '+8%',
            subscribers: 100, activeSubs: 89, unsubs: 11, subRetention: 89, activeRate: 89,
            delivered: 210, inTransit: 14, cancelled: 6, avgOrder: 23,
            bestSeller: 'Chilli Crab Sauce', categoriesSold: 9, salesGrowth: '+8%',
            newCustomers: 40, repeatCustomers: 120, retentionRate: 75, revPerCustomer: 33,
            topProducts: [
              { name: 'Chilli Crab Sauce', category: 'Condiments', revenue: 1040, share: 20 },
              { name: 'Laksa Paste', category: 'Condiments', revenue: 884, share: 17 },
              { name: 'Kopi O', category: 'Beverages', revenue: 780, share: 15 },
              { name: 'Bak Kwa', category: 'Meat', revenue: 624, share: 12 },
              { name: 'Kaya Jam', category: 'Spreads', revenue: 520, share: 10 },
            ],
            poorProducts: [
              { name: 'Bak Kut Teh Mix', category: 'Condiments', revenue: 52, status: 'Low Demand' },
              { name: 'White Pepper', category: 'Spices', revenue: 36, status: 'Slow Moving' },
              { name: 'Lotus Root Chips', category: 'Snacks', revenue: 26, status: 'Declining' },
              { name: 'Belachan', category: 'Condiments', revenue: 21, status: 'Low Demand' },
              { name: 'Gula Melaka', category: 'Sweeteners', revenue: 16, status: 'Overstocked' },
            ],
            lowStock: [{ name: 'Chilli Crab Sauce', qty: 5 }, { name: 'Laksa Paste', qty: 3 }],
            highStock: [{ name: 'Rice Noodles', qty: 22 }, { name: 'Coconut Milk', qty: 18 }],
            totalStockUnits: 95,
            sixMonthTrend: [
              { month: '2026-04', revenue: 720 }, { month: '2026-05', revenue: 780 }, { month: '2026-06', revenue: 840 },
              { month: '2026-07', revenue: 860 }, { month: '2026-08', revenue: 900 }, { month: '2026-09', revenue: 1100 },
            ],
          },
          {
            name: 'Chinatown', revenue: 4800, orders: 195, units: 292, customers: 138, growth: '+7%',
            subscribers: 85, activeSubs: 76, unsubs: 9, subRetention: 89, activeRate: 89,
            delivered: 178, inTransit: 10, cancelled: 7, avgOrder: 25,
            bestSeller: 'Bak Kwa', categoriesSold: 9, salesGrowth: '+7%',
            newCustomers: 35, repeatCustomers: 103, retentionRate: 75, revPerCustomer: 35,
            topProducts: [
              { name: 'Bak Kwa', category: 'Meat', revenue: 960, share: 20 },
              { name: 'Laksa Paste', category: 'Condiments', revenue: 816, share: 17 },
              { name: 'Kopi O', category: 'Beverages', revenue: 720, share: 15 },
              { name: 'Kaya Jam', category: 'Spreads', revenue: 576, share: 12 },
              { name: 'Chilli Crab Sauce', category: 'Condiments', revenue: 480, share: 10 },
            ],
            poorProducts: [
              { name: 'Bak Kut Teh Mix', category: 'Condiments', revenue: 48, status: 'Low Demand' },
              { name: 'White Pepper', category: 'Spices', revenue: 34, status: 'Slow Moving' },
              { name: 'Lotus Root Chips', category: 'Snacks', revenue: 24, status: 'Declining' },
              { name: 'Belachan', category: 'Condiments', revenue: 19, status: 'Low Demand' },
              { name: 'Gula Melaka', category: 'Sweeteners', revenue: 14, status: 'Overstocked' },
            ],
            lowStock: [{ name: 'Bak Kwa', qty: 4 }, { name: 'Laksa Paste', qty: 3 }],
            highStock: [{ name: 'Rice Noodles', qty: 20 }, { name: 'Soy Sauce', qty: 16 }],
            totalStockUnits: 82,
            sixMonthTrend: [
              { month: '2026-04', revenue: 660 }, { month: '2026-05', revenue: 710 }, { month: '2026-06', revenue: 760 },
              { month: '2026-07', revenue: 780 }, { month: '2026-08', revenue: 810 }, { month: '2026-09', revenue: 1080 },
            ],
          },
          {
            name: 'Bugis', revenue: 2300, orders: 82, units: 123, customers: 56, growth: '+6%',
            subscribers: 35, activeSubs: 31, unsubs: 4, subRetention: 89, activeRate: 89,
            delivered: 75, inTransit: 4, cancelled: 3, avgOrder: 28,
            bestSeller: 'Roti Prata Mix', categoriesSold: 7, salesGrowth: '+6%',
            newCustomers: 14, repeatCustomers: 42, retentionRate: 75, revPerCustomer: 41,
            topProducts: [
              { name: 'Roti Prata Mix', category: 'Baking', revenue: 506, share: 22 },
              { name: 'Kopi O', category: 'Beverages', revenue: 414, share: 18 },
              { name: 'Laksa Paste', category: 'Condiments', revenue: 345, share: 15 },
              { name: 'Kaya Jam', category: 'Spreads', revenue: 276, share: 12 },
              { name: 'Bak Kwa', category: 'Meat', revenue: 230, share: 10 },
            ],
            poorProducts: [
              { name: 'Bak Kut Teh Mix', category: 'Condiments', revenue: 23, status: 'Low Demand' },
              { name: 'White Pepper', category: 'Spices', revenue: 16, status: 'Slow Moving' },
              { name: 'Lotus Root Chips', category: 'Snacks', revenue: 12, status: 'Declining' },
              { name: 'Belachan', category: 'Condiments', revenue: 9, status: 'Low Demand' },
              { name: 'Gula Melaka', category: 'Sweeteners', revenue: 7, status: 'Overstocked' },
            ],
            lowStock: [{ name: 'Roti Prata Mix', qty: 2 }, { name: 'Kopi O', qty: 2 }],
            highStock: [{ name: 'Rice Noodles', qty: 12 }, { name: 'Coconut Milk', qty: 10 }],
            totalStockUnits: 42,
            sixMonthTrend: [
              { month: '2026-04', revenue: 310 }, { month: '2026-05', revenue: 340 }, { month: '2026-06', revenue: 370 },
              { month: '2026-07', revenue: 380 }, { month: '2026-08', revenue: 400 }, { month: '2026-09', revenue: 500 },
            ],
          },
          {
            name: 'River Valley', revenue: 1200, orders: 33, units: 50, customers: 21, growth: '+4%',
            subscribers: 20, activeSubs: 18, unsubs: 2, subRetention: 90, activeRate: 90,
            delivered: 27, inTransit: 2, cancelled: 4, avgOrder: 36,
            bestSeller: 'Kaya Jam', categoriesSold: 6, salesGrowth: '+4%',
            newCustomers: 5, repeatCustomers: 16, retentionRate: 76, revPerCustomer: 57,
            topProducts: [
              { name: 'Kaya Jam', category: 'Spreads', revenue: 264, share: 22 },
              { name: 'Kopi O', category: 'Beverages', revenue: 216, share: 18 },
              { name: 'Laksa Paste', category: 'Condiments', revenue: 180, share: 15 },
              { name: 'Bak Kwa', category: 'Meat', revenue: 144, share: 12 },
              { name: 'Chilli Crab Sauce', category: 'Condiments', revenue: 120, share: 10 },
            ],
            poorProducts: [
              { name: 'Bak Kut Teh Mix', category: 'Condiments', revenue: 12, status: 'Low Demand' },
              { name: 'White Pepper', category: 'Spices', revenue: 8, status: 'Slow Moving' },
              { name: 'Lotus Root Chips', category: 'Snacks', revenue: 6, status: 'Declining' },
              { name: 'Belachan', category: 'Condiments', revenue: 5, status: 'Low Demand' },
              { name: 'Gula Melaka', category: 'Sweeteners', revenue: 3, status: 'Overstocked' },
            ],
            lowStock: [{ name: 'Kaya Jam', qty: 1 }, { name: 'Kopi O', qty: 1 }],
            highStock: [{ name: 'Rice Noodles', qty: 8 }, { name: 'Soy Sauce', qty: 6 }],
            totalStockUnits: 22,
            sixMonthTrend: [
              { month: '2026-04', revenue: 150 }, { month: '2026-05', revenue: 165 }, { month: '2026-06', revenue: 180 },
              { month: '2026-07', revenue: 185 }, { month: '2026-08', revenue: 195 }, { month: '2026-09', revenue: 320 },
            ],
          },
        ],
      },
      {
        name: 'East Region', revenue: 14000, orders: 610, units: 915, customers: 430, growth: '+5%',
        subscribers: 280, activeSubs: 248, unsubs: 32, subRetention: 89, activeRate: 89,
        delivered: 560, inTransit: 35, cancelled: 15, avgOrder: 23,
        bestSeller: 'Char Kway Teow Mix', categoriesSold: 10, salesGrowth: '+5%',
        newCustomers: 108, repeatCustomers: 322, retentionRate: 75, revPerCustomer: 33,
        topProducts: [
          { name: 'Char Kway Teow Mix', category: 'Noodles', revenue: 2600, share: 19 },
          { name: 'Otah', category: 'Seafood', revenue: 2200, share: 16 },
          { name: 'Hainanese Chicken Rice Mix', category: 'Rice', revenue: 1800, share: 13 },
          { name: 'Kaya Jam', category: 'Spreads', revenue: 1500, share: 11 },
          { name: 'Rojak Sauce', category: 'Condiments', revenue: 1200, share: 9 },
        ],
        poorProducts: [
          { name: 'Lotus Root Chips', category: 'Snacks', revenue: 95, status: 'Low Demand' },
          { name: 'Belachan', category: 'Condiments', revenue: 80, status: 'Slow Moving' },
          { name: 'Gula Melaka', category: 'Sweeteners', revenue: 65, status: 'Declining' },
          { name: 'Tempeh', category: 'Soy', revenue: 75, status: 'Low Demand' },
          { name: 'Keropok', category: 'Snacks', revenue: 90, status: 'Overstocked' },
        ],
        lowStock: [{ name: 'Char Kway Teow Mix', qty: 10 }, { name: 'Otah', qty: 8 }],
        highStock: [{ name: 'Rice Noodles', qty: 65 }, { name: 'Coconut Milk', qty: 55 }],
        totalStockUnits: 340,
        sixMonthTrend: [
          { month: '2026-04', revenue: 2050 }, { month: '2026-05', revenue: 2150 }, { month: '2026-06', revenue: 2280 },
          { month: '2026-07', revenue: 2320 }, { month: '2026-08', revenue: 2400 }, { month: '2026-09', revenue: 2800 },
        ],
        cities: [
          {
            name: 'Tampines', revenue: 6200, orders: 270, units: 405, customers: 190, growth: '+6%',
            subscribers: 125, activeSubs: 111, unsubs: 14, subRetention: 89, activeRate: 89,
            delivered: 248, inTransit: 15, cancelled: 7, avgOrder: 23,
            bestSeller: 'Char Kway Teow Mix', categoriesSold: 9, salesGrowth: '+6%',
            newCustomers: 48, repeatCustomers: 142, retentionRate: 75, revPerCustomer: 33,
            topProducts: [
              { name: 'Char Kway Teow Mix', category: 'Noodles', revenue: 1178, share: 19 },
              { name: 'Otah', category: 'Seafood', revenue: 992, share: 16 },
              { name: 'Hainanese Chicken Rice Mix', category: 'Rice', revenue: 806, share: 13 },
              { name: 'Kaya Jam', category: 'Spreads', revenue: 682, share: 11 },
              { name: 'Rojak Sauce', category: 'Condiments', revenue: 558, share: 9 },
            ],
            poorProducts: [
              { name: 'Lotus Root Chips', category: 'Snacks', revenue: 42, status: 'Low Demand' },
              { name: 'Belachan', category: 'Condiments', revenue: 36, status: 'Slow Moving' },
              { name: 'Gula Melaka', category: 'Sweeteners', revenue: 29, status: 'Declining' },
              { name: 'Tempeh', category: 'Soy', revenue: 33, status: 'Low Demand' },
              { name: 'Keropok', category: 'Snacks', revenue: 40, status: 'Overstocked' },
            ],
            lowStock: [{ name: 'Char Kway Teow Mix', qty: 5 }, { name: 'Otah', qty: 4 }],
            highStock: [{ name: 'Rice Noodles', qty: 30 }, { name: 'Coconut Milk', qty: 25 }],
            totalStockUnits: 155,
            sixMonthTrend: [
              { month: '2026-04', revenue: 890 }, { month: '2026-05', revenue: 940 }, { month: '2026-06', revenue: 1010 },
              { month: '2026-07', revenue: 1030 }, { month: '2026-08', revenue: 1070 }, { month: '2026-09', revenue: 1260 },
            ],
          },
          {
            name: 'Bedok', revenue: 4200, orders: 180, units: 270, customers: 128, growth: '+4%',
            subscribers: 82, activeSubs: 73, unsubs: 9, subRetention: 89, activeRate: 89,
            delivered: 164, inTransit: 10, cancelled: 6, avgOrder: 23,
            bestSeller: 'Otah', categoriesSold: 8, salesGrowth: '+4%',
            newCustomers: 32, repeatCustomers: 96, retentionRate: 75, revPerCustomer: 33,
            topProducts: [
              { name: 'Otah', category: 'Seafood', revenue: 840, share: 20 },
              { name: 'Char Kway Teow Mix', category: 'Noodles', revenue: 714, share: 17 },
              { name: 'Hainanese Chicken Rice Mix', category: 'Rice', revenue: 588, share: 14 },
              { name: 'Kaya Jam', category: 'Spreads', revenue: 462, share: 11 },
              { name: 'Rojak Sauce', category: 'Condiments', revenue: 378, share: 9 },
            ],
            poorProducts: [
              { name: 'Lotus Root Chips', category: 'Snacks', revenue: 28, status: 'Low Demand' },
              { name: 'Belachan', category: 'Condiments', revenue: 24, status: 'Slow Moving' },
              { name: 'Gula Melaka', category: 'Sweeteners', revenue: 19, status: 'Declining' },
              { name: 'Tempeh', category: 'Soy', revenue: 22, status: 'Low Demand' },
              { name: 'Keropok', category: 'Snacks', revenue: 27, status: 'Overstocked' },
            ],
            lowStock: [{ name: 'Otah', qty: 3 }, { name: 'Char Kway Teow Mix', qty: 3 }],
            highStock: [{ name: 'Rice Noodles', qty: 20 }, { name: 'Coconut Milk', qty: 16 }],
            totalStockUnits: 100,
            sixMonthTrend: [
              { month: '2026-04', revenue: 600 }, { month: '2026-05', revenue: 635 }, { month: '2026-06', revenue: 675 },
              { month: '2026-07', revenue: 690 }, { month: '2026-08', revenue: 715 }, { month: '2026-09', revenue: 885 },
            ],
          },
          {
            name: 'Pasir Ris', revenue: 2000, orders: 90, units: 135, customers: 64, growth: '+3%',
            subscribers: 42, activeSubs: 37, unsubs: 5, subRetention: 88, activeRate: 88,
            delivered: 82, inTransit: 5, cancelled: 3, avgOrder: 22,
            bestSeller: 'Hainanese Chicken Rice Mix', categoriesSold: 7, salesGrowth: '+3%',
            newCustomers: 16, repeatCustomers: 48, retentionRate: 75, revPerCustomer: 31,
            topProducts: [
              { name: 'Hainanese Chicken Rice Mix', category: 'Rice', revenue: 400, share: 20 },
              { name: 'Char Kway Teow Mix', category: 'Noodles', revenue: 340, share: 17 },
              { name: 'Otah', category: 'Seafood', revenue: 280, share: 14 },
              { name: 'Kaya Jam', category: 'Spreads', revenue: 220, share: 11 },
              { name: 'Rojak Sauce', category: 'Condiments', revenue: 180, share: 9 },
            ],
            poorProducts: [
              { name: 'Lotus Root Chips', category: 'Snacks', revenue: 14, status: 'Low Demand' },
              { name: 'Belachan', category: 'Condiments', revenue: 12, status: 'Slow Moving' },
              { name: 'Gula Melaka', category: 'Sweeteners', revenue: 10, status: 'Declining' },
              { name: 'Tempeh', category: 'Soy', revenue: 11, status: 'Low Demand' },
              { name: 'Keropok', category: 'Snacks', revenue: 13, status: 'Overstocked' },
            ],
            lowStock: [{ name: 'Hainanese Chicken Rice Mix', qty: 2 }, { name: 'Char Kway Teow Mix', qty: 2 }],
            highStock: [{ name: 'Rice Noodles', qty: 10 }, { name: 'Coconut Milk', qty: 8 }],
            totalStockUnits: 48,
            sixMonthTrend: [
              { month: '2026-04', revenue: 270 }, { month: '2026-05', revenue: 290 }, { month: '2026-06', revenue: 310 },
              { month: '2026-07', revenue: 320 }, { month: '2026-08', revenue: 330 }, { month: '2026-09', revenue: 480 },
            ],
          },
          {
            name: 'Paya Lebar', revenue: 1100, orders: 48, units: 72, customers: 34, growth: '+2%',
            subscribers: 22, activeSubs: 20, unsubs: 2, subRetention: 91, activeRate: 91,
            delivered: 44, inTransit: 3, cancelled: 1, avgOrder: 23,
            bestSeller: 'Rojak Sauce', categoriesSold: 6, salesGrowth: '+2%',
            newCustomers: 9, repeatCustomers: 25, retentionRate: 74, revPerCustomer: 32,
            topProducts: [
              { name: 'Rojak Sauce', category: 'Condiments', revenue: 220, share: 20 },
              { name: 'Char Kway Teow Mix', category: 'Noodles', revenue: 187, share: 17 },
              { name: 'Otah', category: 'Seafood', revenue: 154, share: 14 },
              { name: 'Kaya Jam', category: 'Spreads', revenue: 121, share: 11 },
              { name: 'Hainanese Chicken Rice Mix', category: 'Rice', revenue: 99, share: 9 },
            ],
            poorProducts: [
              { name: 'Lotus Root Chips', category: 'Snacks', revenue: 7, status: 'Low Demand' },
              { name: 'Belachan', category: 'Condiments', revenue: 6, status: 'Slow Moving' },
              { name: 'Gula Melaka', category: 'Sweeteners', revenue: 5, status: 'Declining' },
              { name: 'Tempeh', category: 'Soy', revenue: 6, status: 'Low Demand' },
              { name: 'Keropok', category: 'Snacks', revenue: 7, status: 'Overstocked' },
            ],
            lowStock: [{ name: 'Rojak Sauce', qty: 1 }, { name: 'Char Kway Teow Mix', qty: 1 }],
            highStock: [{ name: 'Rice Noodles', qty: 5 }, { name: 'Coconut Milk', qty: 4 }],
            totalStockUnits: 22,
            sixMonthTrend: [
              { month: '2026-04', revenue: 140 }, { month: '2026-05', revenue: 150 }, { month: '2026-06', revenue: 165 },
              { month: '2026-07', revenue: 168 }, { month: '2026-08', revenue: 175 }, { month: '2026-09', revenue: 302 },
            ],
          },
          {
            name: 'Changi', revenue: 500, orders: 22, units: 33, customers: 14, growth: '+1%',
            subscribers: 9, activeSubs: 7, unsubs: 2, subRetention: 78, activeRate: 78,
            delivered: 20, inTransit: 2, cancelled: 0, avgOrder: 23,
            bestSeller: 'Kaya Jam', categoriesSold: 5, salesGrowth: '+1%',
            newCustomers: 3, repeatCustomers: 11, retentionRate: 79, revPerCustomer: 36,
            topProducts: [
              { name: 'Kaya Jam', category: 'Spreads', revenue: 100, share: 20 },
              { name: 'Char Kway Teow Mix', category: 'Noodles', revenue: 85, share: 17 },
              { name: 'Otah', category: 'Seafood', revenue: 70, share: 14 },
              { name: 'Rojak Sauce', category: 'Condiments', revenue: 55, share: 11 },
              { name: 'Hainanese Chicken Rice Mix', category: 'Rice', revenue: 45, share: 9 },
            ],
            poorProducts: [
              { name: 'Lotus Root Chips', category: 'Snacks', revenue: 3, status: 'Low Demand' },
              { name: 'Belachan', category: 'Condiments', revenue: 2, status: 'Slow Moving' },
              { name: 'Gula Melaka', category: 'Sweeteners', revenue: 2, status: 'Declining' },
              { name: 'Tempeh', category: 'Soy', revenue: 2, status: 'Low Demand' },
              { name: 'Keropok', category: 'Snacks', revenue: 3, status: 'Overstocked' },
            ],
            lowStock: [{ name: 'Kaya Jam', qty: 1 }],
            highStock: [{ name: 'Rice Noodles', qty: 3 }],
            totalStockUnits: 8,
            sixMonthTrend: [
              { month: '2026-04', revenue: 50 }, { month: '2026-05', revenue: 55 }, { month: '2026-06', revenue: 60 },
              { month: '2026-07', revenue: 62 }, { month: '2026-08', revenue: 65 }, { month: '2026-09', revenue: 108 },
            ],
          },
        ],
      },
      {
        name: 'West Region', revenue: 10200, orders: 460, units: 690, customers: 330, growth: '+4%',
        subscribers: 210, activeSubs: 186, unsubs: 24, subRetention: 89, activeRate: 89,
        delivered: 424, inTransit: 28, cancelled: 8, avgOrder: 22,
        bestSeller: 'Satay Sauce', categoriesSold: 9, salesGrowth: '+4%',
        newCustomers: 82, repeatCustomers: 248, retentionRate: 75, revPerCustomer: 31,
        topProducts: [
          { name: 'Satay Sauce', category: 'Condiments', revenue: 1900, share: 19 },
          { name: 'Ice Kachang Syrup', category: 'Beverages', revenue: 1600, share: 16 },
          { name: 'Wonton Noodle Mix', category: 'Noodles', revenue: 1300, share: 13 },
          { name: 'Chwee Kueh Mix', category: 'Baking', revenue: 1100, share: 11 },
          { name: 'Rice Noodle Roll Mix', category: 'Noodles', revenue: 850, share: 8 },
        ],
        poorProducts: [
          { name: 'Gula Melaka', category: 'Sweeteners', revenue: 65, status: 'Low Demand' },
          { name: 'Sambal Tumis', category: 'Condiments', revenue: 80, status: 'Slow Moving' },
          { name: 'Tempeh', category: 'Soy', revenue: 55, status: 'Declining' },
          { name: 'Keropok', category: 'Snacks', revenue: 70, status: 'Low Demand' },
          { name: 'Belachan', category: 'Condiments', revenue: 45, status: 'Overstocked' },
        ],
        lowStock: [{ name: 'Satay Sauce', qty: 8 }, { name: 'Ice Kachang Syrup', qty: 6 }],
        highStock: [{ name: 'Rice Noodles', qty: 55 }, { name: 'Coconut Milk', qty: 45 }],
        totalStockUnits: 280,
        sixMonthTrend: [
          { month: '2026-04', revenue: 1480 }, { month: '2026-05', revenue: 1550 }, { month: '2026-06', revenue: 1620 },
          { month: '2026-07', revenue: 1650 }, { month: '2026-08', revenue: 1700 }, { month: '2026-09', revenue: 2200 },
        ],
        cities: [
          {
            name: 'Jurong East', revenue: 4500, orders: 200, units: 300, customers: 143, growth: '+5%',
            subscribers: 90, activeSubs: 80, unsubs: 10, subRetention: 89, activeRate: 89,
            delivered: 184, inTransit: 12, cancelled: 4, avgOrder: 23,
            bestSeller: 'Satay Sauce', categoriesSold: 8, salesGrowth: '+5%',
            newCustomers: 36, repeatCustomers: 107, retentionRate: 75, revPerCustomer: 31,
            topProducts: [
              { name: 'Satay Sauce', category: 'Condiments', revenue: 855, share: 19 },
              { name: 'Ice Kachang Syrup', category: 'Beverages', revenue: 720, share: 16 },
              { name: 'Wonton Noodle Mix', category: 'Noodles', revenue: 585, share: 13 },
              { name: 'Chwee Kueh Mix', category: 'Baking', revenue: 495, share: 11 },
              { name: 'Rice Noodle Roll Mix', category: 'Noodles', revenue: 382, share: 8 },
            ],
            poorProducts: [
              { name: 'Gula Melaka', category: 'Sweeteners', revenue: 29, status: 'Low Demand' },
              { name: 'Sambal Tumis', category: 'Condiments', revenue: 36, status: 'Slow Moving' },
              { name: 'Tempeh', category: 'Soy', revenue: 25, status: 'Declining' },
              { name: 'Keropok', category: 'Snacks', revenue: 32, status: 'Low Demand' },
              { name: 'Belachan', category: 'Condiments', revenue: 20, status: 'Overstocked' },
            ],
            lowStock: [{ name: 'Satay Sauce', qty: 4 }, { name: 'Ice Kachang Syrup', qty: 3 }],
            highStock: [{ name: 'Rice Noodles', qty: 25 }, { name: 'Coconut Milk', qty: 20 }],
            totalStockUnits: 125,
            sixMonthTrend: [
              { month: '2026-04', revenue: 650 }, { month: '2026-05', revenue: 685 }, { month: '2026-06', revenue: 720 },
              { month: '2026-07', revenue: 735 }, { month: '2026-08', revenue: 760 }, { month: '2026-09', revenue: 950 },
            ],
          },
          {
            name: 'Jurong West', revenue: 3000, orders: 135, units: 202, customers: 97, growth: '+3%',
            subscribers: 60, activeSubs: 53, unsubs: 7, subRetention: 88, activeRate: 88,
            delivered: 124, inTransit: 8, cancelled: 3, avgOrder: 22,
            bestSeller: 'Ice Kachang Syrup', categoriesSold: 7, salesGrowth: '+3%',
            newCustomers: 24, repeatCustomers: 73, retentionRate: 75, revPerCustomer: 31,
            topProducts: [
              { name: 'Ice Kachang Syrup', category: 'Beverages', revenue: 480, share: 16 },
              { name: 'Satay Sauce', category: 'Condiments', revenue: 420, share: 14 },
              { name: 'Wonton Noodle Mix', category: 'Noodles', revenue: 360, share: 12 },
              { name: 'Chwee Kueh Mix', category: 'Baking', revenue: 300, share: 10 },
              { name: 'Rice Noodle Roll Mix', category: 'Noodles', revenue: 240, share: 8 },
            ],
            poorProducts: [
              { name: 'Gula Melaka', category: 'Sweeteners', revenue: 18, status: 'Low Demand' },
              { name: 'Sambal Tumis', category: 'Condiments', revenue: 24, status: 'Slow Moving' },
              { name: 'Tempeh', category: 'Soy', revenue: 15, status: 'Declining' },
              { name: 'Keropok', category: 'Snacks', revenue: 21, status: 'Low Demand' },
              { name: 'Belachan', category: 'Condiments', revenue: 12, status: 'Overstocked' },
            ],
            lowStock: [{ name: 'Ice Kachang Syrup', qty: 2 }, { name: 'Satay Sauce', qty: 2 }],
            highStock: [{ name: 'Rice Noodles', qty: 15 }, { name: 'Coconut Milk', qty: 12 }],
            totalStockUnits: 75,
            sixMonthTrend: [
              { month: '2026-04', revenue: 420 }, { month: '2026-05', revenue: 445 }, { month: '2026-06', revenue: 470 },
              { month: '2026-07', revenue: 480 }, { month: '2026-08', revenue: 495 }, { month: '2026-09', revenue: 690 },
            ],
          },
          {
            name: 'Clementi', revenue: 1600, orders: 75, units: 112, customers: 54, growth: '+3%',
            subscribers: 35, activeSubs: 31, unsubs: 4, subRetention: 89, activeRate: 89,
            delivered: 69, inTransit: 4, cancelled: 2, avgOrder: 21,
            bestSeller: 'Wonton Noodle Mix', categoriesSold: 7, salesGrowth: '+3%',
            newCustomers: 14, repeatCustomers: 40, retentionRate: 74, revPerCustomer: 30,
            topProducts: [
              { name: 'Wonton Noodle Mix', category: 'Noodles', revenue: 256, share: 16 },
              { name: 'Satay Sauce', category: 'Condiments', revenue: 224, share: 14 },
              { name: 'Ice Kachang Syrup', category: 'Beverages', revenue: 192, share: 12 },
              { name: 'Chwee Kueh Mix', category: 'Baking', revenue: 160, share: 10 },
              { name: 'Rice Noodle Roll Mix', category: 'Noodles', revenue: 128, share: 8 },
            ],
            poorProducts: [
              { name: 'Gula Melaka', category: 'Sweeteners', revenue: 10, status: 'Low Demand' },
              { name: 'Sambal Tumis', category: 'Condiments', revenue: 13, status: 'Slow Moving' },
              { name: 'Tempeh', category: 'Soy', revenue: 8, status: 'Declining' },
              { name: 'Keropok', category: 'Snacks', revenue: 11, status: 'Low Demand' },
              { name: 'Belachan', category: 'Condiments', revenue: 6, status: 'Overstocked' },
            ],
            lowStock: [{ name: 'Wonton Noodle Mix', qty: 1 }, { name: 'Satay Sauce', qty: 1 }],
            highStock: [{ name: 'Rice Noodles', qty: 8 }, { name: 'Coconut Milk', qty: 6 }],
            totalStockUnits: 40,
            sixMonthTrend: [
              { month: '2026-04', revenue: 220 }, { month: '2026-05', revenue: 235 }, { month: '2026-06', revenue: 250 },
              { month: '2026-07', revenue: 255 }, { month: '2026-08', revenue: 265 }, { month: '2026-09', revenue: 375 },
            ],
          },
          {
            name: 'Bukit Batok', revenue: 700, orders: 32, units: 48, customers: 23, growth: '+2%',
            subscribers: 15, activeSubs: 13, unsubs: 2, subRetention: 87, activeRate: 87,
            delivered: 29, inTransit: 2, cancelled: 1, avgOrder: 22,
            bestSeller: 'Chwee Kueh Mix', categoriesSold: 5, salesGrowth: '+2%',
            newCustomers: 6, repeatCustomers: 17, retentionRate: 74, revPerCustomer: 30,
            topProducts: [
              { name: 'Chwee Kueh Mix', category: 'Baking', revenue: 140, share: 20 },
              { name: 'Satay Sauce', category: 'Condiments', revenue: 119, share: 17 },
              { name: 'Ice Kachang Syrup', category: 'Beverages', revenue: 98, share: 14 },
              { name: 'Wonton Noodle Mix', category: 'Noodles', revenue: 77, share: 11 },
              { name: 'Rice Noodle Roll Mix', category: 'Noodles', revenue: 56, share: 8 },
            ],
            poorProducts: [
              { name: 'Gula Melaka', category: 'Sweeteners', revenue: 4, status: 'Low Demand' },
              { name: 'Sambal Tumis', category: 'Condiments', revenue: 6, status: 'Slow Moving' },
              { name: 'Tempeh', category: 'Soy', revenue: 3, status: 'Declining' },
              { name: 'Keropok', category: 'Snacks', revenue: 5, status: 'Low Demand' },
              { name: 'Belachan', category: 'Condiments', revenue: 2, status: 'Overstocked' },
            ],
            lowStock: [{ name: 'Chwee Kueh Mix', qty: 1 }],
            highStock: [{ name: 'Rice Noodles', qty: 4 }],
            totalStockUnits: 18,
            sixMonthTrend: [
              { month: '2026-04', revenue: 95 }, { month: '2026-05', revenue: 102 }, { month: '2026-06', revenue: 110 },
              { month: '2026-07', revenue: 112 }, { month: '2026-08', revenue: 118 }, { month: '2026-09', revenue: 163 },
            ],
          },
          {
            name: 'Bukit Panjang', revenue: 400, orders: 18, units: 28, customers: 13, growth: '+1%',
            subscribers: 10, activeSubs: 9, unsubs: 1, subRetention: 90, activeRate: 90,
            delivered: 16, inTransit: 2, cancelled: 0, avgOrder: 22,
            bestSeller: 'Rice Noodle Roll Mix', categoriesSold: 4, salesGrowth: '+1%',
            newCustomers: 2, repeatCustomers: 11, retentionRate: 85, revPerCustomer: 31,
            topProducts: [
              { name: 'Rice Noodle Roll Mix', category: 'Noodles', revenue: 80, share: 20 },
              { name: 'Satay Sauce', category: 'Condiments', revenue: 68, share: 17 },
              { name: 'Ice Kachang Syrup', category: 'Beverages', revenue: 56, share: 14 },
              { name: 'Wonton Noodle Mix', category: 'Noodles', revenue: 44, share: 11 },
              { name: 'Chwee Kueh Mix', category: 'Baking', revenue: 36, share: 9 },
            ],
            poorProducts: [
              { name: 'Gula Melaka', category: 'Sweeteners', revenue: 2, status: 'Low Demand' },
              { name: 'Sambal Tumis', category: 'Condiments', revenue: 3, status: 'Slow Moving' },
              { name: 'Tempeh', category: 'Soy', revenue: 2, status: 'Declining' },
              { name: 'Keropok', category: 'Snacks', revenue: 2, status: 'Low Demand' },
              { name: 'Belachan', category: 'Condiments', revenue: 1, status: 'Overstocked' },
            ],
            lowStock: [{ name: 'Rice Noodle Roll Mix', qty: 1 }],
            highStock: [{ name: 'Rice Noodles', qty: 3 }],
            totalStockUnits: 10,
            sixMonthTrend: [
              { month: '2026-04', revenue: 50 }, { month: '2026-05', revenue: 55 }, { month: '2026-06', revenue: 60 },
              { month: '2026-07', revenue: 62 }, { month: '2026-08', revenue: 65 }, { month: '2026-09', revenue: 108 },
            ],
          },
        ],
      },
    ],
  },
  uae: {
    label: 'Emirate',
    states: [
      {
        name: 'Dubai', revenue: 78000, orders: 1340, units: 2010, customers: 920, growth: '+11%',
        subscribers: 580, activeSubs: 516, unsubs: 64, subRetention: 89, activeRate: 89,
        delivered: 1220, inTransit: 82, cancelled: 38, avgOrder: 58,
        bestSeller: 'Saffron', categoriesSold: 12, salesGrowth: '+11%',
        newCustomers: 230, repeatCustomers: 690, retentionRate: 75, revPerCustomer: 85,
        topProducts: [
          { name: 'Saffron', category: 'Spices', revenue: 12500, share: 16 },
          { name: 'Dates Gift Box', category: 'Dry Fruits', revenue: 9800, share: 13 },
          { name: 'Za\'atar Mix', category: 'Condiments', revenue: 7200, share: 9 },
          { name: 'Cardamom Coffee', category: 'Beverages', revenue: 6500, share: 8 },
          { name: 'Halwa', category: 'Sweets', revenue: 5200, share: 7 },
        ],
        poorProducts: [
          { name: 'Dried Lemon', category: 'Spices', revenue: 320, status: 'Low Demand' },
          { name: 'Sumac', category: 'Spices', revenue: 280, status: 'Slow Moving' },
          { name: 'Dried Mint', category: 'Spices', revenue: 180, status: 'Declining' },
          { name: 'Carob Molasses', category: 'Sweeteners', revenue: 220, status: 'Low Demand' },
          { name: 'Nigella Seeds', category: 'Spices', revenue: 150, status: 'Overstocked' },
        ],
        lowStock: [{ name: 'Saffron', qty: 18 }, { name: 'Fresh Dates', qty: 12 }],
        highStock: [{ name: 'Arabic Coffee', qty: 280 }, { name: 'Basmati Rice', qty: 220 }],
        totalStockUnits: 1850,
        sixMonthTrend: [
          { month: '2026-04', revenue: 11200 }, { month: '2026-05', revenue: 12000 }, { month: '2026-06', revenue: 12800 },
          { month: '2026-07', revenue: 13100 }, { month: '2026-08', revenue: 13600 }, { month: '2026-09', revenue: 15300 },
        ],
        cities: [
          {
            name: 'Dubai City', revenue: 32000, orders: 550, units: 825, customers: 380, growth: '+12%',
            subscribers: 240, activeSubs: 214, unsubs: 26, subRetention: 89, activeRate: 89,
            delivered: 500, inTransit: 34, cancelled: 16, avgOrder: 58,
            bestSeller: 'Saffron', categoriesSold: 11, salesGrowth: '+12%',
            newCustomers: 95, repeatCustomers: 285, retentionRate: 75, revPerCustomer: 84,
            topProducts: [
              { name: 'Saffron', category: 'Spices', revenue: 5120, share: 16 },
              { name: 'Dates Gift Box', category: 'Dry Fruits', revenue: 4000, share: 13 },
              { name: 'Za\'atar Mix', category: 'Condiments', revenue: 2944, share: 9 },
              { name: 'Cardamom Coffee', category: 'Beverages', revenue: 2656, share: 8 },
              { name: 'Halwa', category: 'Sweets', revenue: 2112, share: 7 },
            ],
            poorProducts: [
              { name: 'Dried Lemon', category: 'Spices', revenue: 131, status: 'Low Demand' },
              { name: 'Sumac', category: 'Spices', revenue: 115, status: 'Slow Moving' },
              { name: 'Dried Mint', category: 'Spices', revenue: 74, status: 'Declining' },
              { name: 'Carob Molasses', category: 'Sweeteners', revenue: 90, status: 'Low Demand' },
              { name: 'Nigella Seeds', category: 'Spices', revenue: 62, status: 'Overstocked' },
            ],
            lowStock: [{ name: 'Saffron', qty: 8 }, { name: 'Fresh Dates', qty: 5 }],
            highStock: [{ name: 'Arabic Coffee', qty: 115 }, { name: 'Basmati Rice', qty: 90 }],
            totalStockUnits: 760,
            sixMonthTrend: [
              { month: '2026-04', revenue: 4600 }, { month: '2026-05', revenue: 4950 }, { month: '2026-06', revenue: 5300 },
              { month: '2026-07', revenue: 5450 }, { month: '2026-08', revenue: 5650 }, { month: '2026-09', revenue: 6050 },
            ],
          },
          {
            name: 'Jumeirah', revenue: 18000, orders: 310, units: 465, customers: 213, growth: '+10%',
            subscribers: 130, activeSubs: 116, unsubs: 14, subRetention: 89, activeRate: 89,
            delivered: 282, inTransit: 19, cancelled: 9, avgOrder: 58,
            bestSeller: 'Dates Gift Box', categoriesSold: 10, salesGrowth: '+10%',
            newCustomers: 53, repeatCustomers: 160, retentionRate: 75, revPerCustomer: 85,
            topProducts: [
              { name: 'Dates Gift Box', category: 'Dry Fruits', revenue: 2790, share: 16 },
              { name: 'Saffron', category: 'Spices', revenue: 2340, share: 13 },
              { name: 'Cardamom Coffee', category: 'Beverages', revenue: 1800, share: 10 },
              { name: 'Za\'atar Mix', category: 'Condiments', revenue: 1440, share: 8 },
              { name: 'Halwa', category: 'Sweets', revenue: 1080, share: 6 },
            ],
            poorProducts: [
              { name: 'Dried Lemon', category: 'Spices', revenue: 72, status: 'Low Demand' },
              { name: 'Sumac', category: 'Spices', revenue: 63, status: 'Slow Moving' },
              { name: 'Dried Mint', category: 'Spices', revenue: 41, status: 'Declining' },
              { name: 'Carob Molasses', category: 'Sweeteners', revenue: 50, status: 'Low Demand' },
              { name: 'Nigella Seeds', category: 'Spices', revenue: 35, status: 'Overstocked' },
            ],
            lowStock: [{ name: 'Saffron', qty: 4 }, { name: 'Fresh Dates', qty: 3 }],
            highStock: [{ name: 'Arabic Coffee', qty: 65 }, { name: 'Basmati Rice', qty: 50 }],
            totalStockUnits: 425,
            sixMonthTrend: [
              { month: '2026-04', revenue: 2600 }, { month: '2026-05', revenue: 2800 }, { month: '2026-06', revenue: 3000 },
              { month: '2026-07', revenue: 3100 }, { month: '2026-08', revenue: 3200 }, { month: '2026-09', revenue: 3300 },
            ],
          },
          {
            name: 'Deira', revenue: 14000, orders: 240, units: 360, customers: 167, growth: '+9%',
            subscribers: 100, activeSubs: 89, unsubs: 11, subRetention: 89, activeRate: 89,
            delivered: 220, inTransit: 14, cancelled: 6, avgOrder: 58,
            bestSeller: 'Za\'atar Mix', categoriesSold: 9, salesGrowth: '+9%',
            newCustomers: 42, repeatCustomers: 125, retentionRate: 75, revPerCustomer: 84,
            topProducts: [
              { name: 'Za\'atar Mix', category: 'Condiments', revenue: 1820, share: 13 },
              { name: 'Saffron', category: 'Spices', revenue: 1540, share: 11 },
              { name: 'Dates Gift Box', category: 'Dry Fruits', revenue: 1260, share: 9 },
              { name: 'Halwa', category: 'Sweets', revenue: 980, share: 7 },
              { name: 'Cardamom Coffee', category: 'Beverages', revenue: 840, share: 6 },
            ],
            poorProducts: [
              { name: 'Dried Lemon', category: 'Spices', revenue: 56, status: 'Low Demand' },
              { name: 'Sumac', category: 'Spices', revenue: 49, status: 'Slow Moving' },
              { name: 'Dried Mint', category: 'Spices', revenue: 32, status: 'Declining' },
              { name: 'Carob Molasses', category: 'Sweeteners', revenue: 39, status: 'Low Demand' },
              { name: 'Nigella Seeds', category: 'Spices', revenue: 27, status: 'Overstocked' },
            ],
            lowStock: [{ name: 'Saffron', qty: 3 }, { name: 'Fresh Dates', qty: 2 }],
            highStock: [{ name: 'Arabic Coffee', qty: 50 }, { name: 'Basmati Rice', qty: 40 }],
            totalStockUnits: 330,
            sixMonthTrend: [
              { month: '2026-04', revenue: 2000 }, { month: '2026-05', revenue: 2150 }, { month: '2026-06', revenue: 2300 },
              { month: '2026-07', revenue: 2350 }, { month: '2026-08', revenue: 2450 }, { month: '2026-09', revenue: 2750 },
            ],
          },
          {
            name: 'Bur Dubai', revenue: 8500, orders: 148, units: 222, customers: 102, growth: '+8%',
            subscribers: 65, activeSubs: 58, unsubs: 7, subRetention: 89, activeRate: 89,
            delivered: 136, inTransit: 9, cancelled: 3, avgOrder: 57,
            bestSeller: 'Halwa', categoriesSold: 8, salesGrowth: '+8%',
            newCustomers: 26, repeatCustomers: 76, retentionRate: 75, revPerCustomer: 83,
            topProducts: [
              { name: 'Halwa', category: 'Sweets', revenue: 1190, share: 14 },
              { name: 'Saffron', category: 'Spices', revenue: 1020, share: 12 },
              { name: 'Dates Gift Box', category: 'Dry Fruits', revenue: 850, share: 10 },
              { name: 'Za\'atar Mix', category: 'Condiments', revenue: 680, share: 8 },
              { name: 'Cardamom Coffee', category: 'Beverages', revenue: 595, share: 7 },
            ],
            poorProducts: [
              { name: 'Dried Lemon', category: 'Spices', revenue: 34, status: 'Low Demand' },
              { name: 'Sumac', category: 'Spices', revenue: 30, status: 'Slow Moving' },
              { name: 'Dried Mint', category: 'Spices', revenue: 20, status: 'Declining' },
              { name: 'Carob Molasses', category: 'Sweeteners', revenue: 24, status: 'Low Demand' },
              { name: 'Nigella Seeds', category: 'Spices', revenue: 17, status: 'Overstocked' },
            ],
            lowStock: [{ name: 'Saffron', qty: 2 }, { name: 'Fresh Dates', qty: 1 }],
            highStock: [{ name: 'Arabic Coffee', qty: 30 }, { name: 'Basmati Rice', qty: 25 }],
            totalStockUnits: 195,
            sixMonthTrend: [
              { month: '2026-04', revenue: 1200 }, { month: '2026-05', revenue: 1280 }, { month: '2026-06', revenue: 1380 },
              { month: '2026-07', revenue: 1400 }, { month: '2026-08', revenue: 1450 }, { month: '2026-09', revenue: 1790 },
            ],
          },
          {
            name: 'Dubai Marina', revenue: 5500, orders: 92, units: 138, customers: 58, growth: '+7%',
            subscribers: 45, activeSubs: 39, unsubs: 6, subRetention: 87, activeRate: 87,
            delivered: 82, inTransit: 6, cancelled: 4, avgOrder: 60,
            bestSeller: 'Cardamom Coffee', categoriesSold: 7, salesGrowth: '+7%',
            newCustomers: 14, repeatCustomers: 44, retentionRate: 76, revPerCustomer: 95,
            topProducts: [
              { name: 'Cardamom Coffee', category: 'Beverages', revenue: 715, share: 13 },
              { name: 'Saffron', category: 'Spices', revenue: 605, share: 11 },
              { name: 'Dates Gift Box', category: 'Dry Fruits', revenue: 495, share: 9 },
              { name: 'Za\'atar Mix', category: 'Condiments', revenue: 385, share: 7 },
              { name: 'Halwa', category: 'Sweets', revenue: 330, share: 6 },
            ],
            poorProducts: [
              { name: 'Dried Lemon', category: 'Spices', revenue: 22, status: 'Low Demand' },
              { name: 'Sumac', category: 'Spices', revenue: 19, status: 'Slow Moving' },
              { name: 'Dried Mint', category: 'Spices', revenue: 12, status: 'Declining' },
              { name: 'Carob Molasses', category: 'Sweeteners', revenue: 15, status: 'Low Demand' },
              { name: 'Nigella Seeds', category: 'Spices', revenue: 11, status: 'Overstocked' },
            ],
            lowStock: [{ name: 'Saffron', qty: 1 }, { name: 'Fresh Dates', qty: 1 }],
            highStock: [{ name: 'Arabic Coffee', qty: 20 }, { name: 'Basmati Rice', qty: 15 }],
            totalStockUnits: 140,
            sixMonthTrend: [
              { month: '2026-04', revenue: 800 }, { month: '2026-05', revenue: 860 }, { month: '2026-06', revenue: 920 },
              { month: '2026-07', revenue: 940 }, { month: '2026-08', revenue: 980 }, { month: '2026-09', revenue: 1000 },
            ],
          },
        ],
      },
      {
        name: 'Abu Dhabi', revenue: 32000, orders: 560, units: 840, customers: 390, growth: '+4%',
        subscribers: 240, activeSubs: 213, unsubs: 27, subRetention: 89, activeRate: 89,
        delivered: 510, inTransit: 36, cancelled: 14, avgOrder: 57,
        bestSeller: 'Arabic Coffee', categoriesSold: 10, salesGrowth: '+4%',
        newCustomers: 98, repeatCustomers: 292, retentionRate: 75, revPerCustomer: 82,
        topProducts: [
          { name: 'Arabic Coffee', category: 'Beverages', revenue: 5800, share: 18 },
          { name: 'Dates Premium', category: 'Dry Fruits', revenue: 4500, share: 14 },
          { name: 'Oud Powder', category: 'Incense', revenue: 3800, share: 12 },
          { name: 'Bakhoor Mix', category: 'Incense', revenue: 3200, share: 10 },
          { name: 'Luqaimat Mix', category: 'Sweets', revenue: 2600, share: 8 },
        ],
        poorProducts: [
          { name: 'Dried Lime', category: 'Spices', revenue: 180, status: 'Low Demand' },
          { name: 'Carob Molasses', category: 'Sweeteners', revenue: 220, status: 'Slow Moving' },
          { name: 'Dried Mint', category: 'Spices', revenue: 120, status: 'Declining' },
          { name: 'Nigella Seeds', category: 'Spices', revenue: 150, status: 'Low Demand' },
          { name: 'Sumac', category: 'Spices', revenue: 100, status: 'Overstocked' },
        ],
        lowStock: [{ name: 'Arabic Coffee', qty: 15 }, { name: 'Fresh Dates', qty: 10 }],
        highStock: [{ name: 'Basmati Rice', qty: 180 }, { name: 'Sugar', qty: 150 }],
        totalStockUnits: 1200,
        sixMonthTrend: [
          { month: '2026-04', revenue: 4600 }, { month: '2026-05', revenue: 4900 }, { month: '2026-06', revenue: 5200 },
          { month: '2026-07', revenue: 5300 }, { month: '2026-08', revenue: 5500 }, { month: '2026-09', revenue: 6500 },
        ],
        cities: [
          {
            name: 'Abu Dhabi City', revenue: 15000, orders: 262, units: 393, customers: 182, growth: '+5%',
            subscribers: 112, activeSubs: 100, unsubs: 12, subRetention: 89, activeRate: 89,
            delivered: 238, inTransit: 17, cancelled: 7, avgOrder: 57,
            bestSeller: 'Arabic Coffee', categoriesSold: 9, salesGrowth: '+5%',
            newCustomers: 46, repeatCustomers: 136, retentionRate: 75, revPerCustomer: 82,
            topProducts: [
              { name: 'Arabic Coffee', category: 'Beverages', revenue: 2700, share: 18 },
              { name: 'Dates Premium', category: 'Dry Fruits', revenue: 2100, share: 14 },
              { name: 'Oud Powder', category: 'Incense', revenue: 1770, share: 12 },
              { name: 'Bakhoor Mix', category: 'Incense', revenue: 1488, share: 10 },
              { name: 'Luqaimat Mix', category: 'Sweets', revenue: 1206, share: 8 },
            ],
            poorProducts: [
              { name: 'Dried Lime', category: 'Spices', revenue: 84, status: 'Low Demand' },
              { name: 'Carob Molasses', category: 'Sweeteners', revenue: 102, status: 'Slow Moving' },
              { name: 'Dried Mint', category: 'Spices', revenue: 56, status: 'Declining' },
              { name: 'Nigella Seeds', category: 'Spices', revenue: 70, status: 'Low Demand' },
              { name: 'Sumac', category: 'Spices', revenue: 47, status: 'Overstocked' },
            ],
            lowStock: [{ name: 'Arabic Coffee', qty: 7 }, { name: 'Fresh Dates', qty: 5 }],
            highStock: [{ name: 'Basmati Rice', qty: 84 }, { name: 'Sugar', qty: 70 }],
            totalStockUnits: 560,
            sixMonthTrend: [
              { month: '2026-04', revenue: 2150 }, { month: '2026-05', revenue: 2300 }, { month: '2026-06', revenue: 2450 },
              { month: '2026-07', revenue: 2500 }, { month: '2026-08', revenue: 2580 }, { month: '2026-09', revenue: 3020 },
            ],
          },
          {
            name: 'Al Ain', revenue: 8000, orders: 140, units: 210, customers: 98, growth: '+3%',
            subscribers: 60, activeSubs: 53, unsubs: 7, subRetention: 88, activeRate: 88,
            delivered: 128, inTransit: 9, cancelled: 3, avgOrder: 57,
            bestSeller: 'Dates Premium', categoriesSold: 8, salesGrowth: '+3%',
            newCustomers: 25, repeatCustomers: 73, retentionRate: 74, revPerCustomer: 82,
            topProducts: [
              { name: 'Dates Premium', category: 'Dry Fruits', revenue: 1280, share: 16 },
              { name: 'Arabic Coffee', category: 'Beverages', revenue: 1040, share: 13 },
              { name: 'Oud Powder', category: 'Incense', revenue: 880, share: 11 },
              { name: 'Bakhoor Mix', category: 'Incense', revenue: 720, share: 9 },
              { name: 'Luqaimat Mix', category: 'Sweets', revenue: 560, share: 7 },
            ],
            poorProducts: [
              { name: 'Dried Lime', category: 'Spices', revenue: 48, status: 'Low Demand' },
              { name: 'Carob Molasses', category: 'Sweeteners', revenue: 58, status: 'Slow Moving' },
              { name: 'Dried Mint', category: 'Spices', revenue: 32, status: 'Declining' },
              { name: 'Nigella Seeds', category: 'Spices', revenue: 40, status: 'Low Demand' },
              { name: 'Sumac', category: 'Spices', revenue: 27, status: 'Overstocked' },
            ],
            lowStock: [{ name: 'Arabic Coffee', qty: 4 }, { name: 'Fresh Dates', qty: 3 }],
            highStock: [{ name: 'Basmati Rice', qty: 48 }, { name: 'Sugar', qty: 40 }],
            totalStockUnits: 320,
            sixMonthTrend: [
              { month: '2026-04', revenue: 1150 }, { month: '2026-05', revenue: 1230 }, { month: '2026-06', revenue: 1300 },
              { month: '2026-07', revenue: 1330 }, { month: '2026-08', revenue: 1380 }, { month: '2026-09', revenue: 1610 },
            ],
          },
          {
            name: 'Khalifa City', revenue: 5000, orders: 88, units: 132, customers: 61, growth: '+3%',
            subscribers: 38, activeSubs: 34, unsubs: 4, subRetention: 89, activeRate: 89,
            delivered: 80, inTransit: 6, cancelled: 2, avgOrder: 57,
            bestSeller: 'Bakhoor Mix', categoriesSold: 7, salesGrowth: '+3%',
            newCustomers: 15, repeatCustomers: 46, retentionRate: 75, revPerCustomer: 82,
            topProducts: [
              { name: 'Bakhoor Mix', category: 'Incense', revenue: 650, share: 13 },
              { name: 'Arabic Coffee', category: 'Beverages', revenue: 550, share: 11 },
              { name: 'Dates Premium', category: 'Dry Fruits', revenue: 450, share: 9 },
              { name: 'Oud Powder', category: 'Incense', revenue: 380, share: 8 },
              { name: 'Luqaimat Mix', category: 'Sweets', revenue: 300, share: 6 },
            ],
            poorProducts: [
              { name: 'Dried Lime', category: 'Spices', revenue: 30, status: 'Low Demand' },
              { name: 'Carob Molasses', category: 'Sweeteners', revenue: 36, status: 'Slow Moving' },
              { name: 'Dried Mint', category: 'Spices', revenue: 20, status: 'Declining' },
              { name: 'Nigella Seeds', category: 'Spices', revenue: 25, status: 'Low Demand' },
              { name: 'Sumac', category: 'Spices', revenue: 17, status: 'Overstocked' },
            ],
            lowStock: [{ name: 'Bakhoor Mix', qty: 2 }, { name: 'Arabic Coffee', qty: 2 }],
            highStock: [{ name: 'Basmati Rice', qty: 30 }, { name: 'Sugar', qty: 25 }],
            totalStockUnits: 200,
            sixMonthTrend: [
              { month: '2026-04', revenue: 720 }, { month: '2026-05', revenue: 770 }, { month: '2026-06', revenue: 820 },
              { month: '2026-07', revenue: 840 }, { month: '2026-08', revenue: 870 }, { month: '2026-09', revenue: 980 },
            ],
          },
          {
            name: 'Mohamed Bin Zayed City', revenue: 2500, orders: 44, units: 66, customers: 30, growth: '+2%',
            subscribers: 18, activeSubs: 16, unsubs: 2, subRetention: 89, activeRate: 89,
            delivered: 40, inTransit: 3, cancelled: 1, avgOrder: 57,
            bestSeller: 'Luqaimat Mix', categoriesSold: 6, salesGrowth: '+2%',
            newCustomers: 8, repeatCustomers: 22, retentionRate: 73, revPerCustomer: 83,
            topProducts: [
              { name: 'Luqaimat Mix', category: 'Sweets', revenue: 325, share: 13 },
              { name: 'Arabic Coffee', category: 'Beverages', revenue: 275, share: 11 },
              { name: 'Dates Premium', category: 'Dry Fruits', revenue: 225, share: 9 },
              { name: 'Bakhoor Mix', category: 'Incense', revenue: 175, share: 7 },
              { name: 'Oud Powder', category: 'Incense', revenue: 150, share: 6 },
            ],
            poorProducts: [
              { name: 'Dried Lime', category: 'Spices', revenue: 15, status: 'Low Demand' },
              { name: 'Carob Molasses', category: 'Sweeteners', revenue: 18, status: 'Slow Moving' },
              { name: 'Dried Mint', category: 'Spices', revenue: 10, status: 'Declining' },
              { name: 'Nigella Seeds', category: 'Spices', revenue: 13, status: 'Low Demand' },
              { name: 'Sumac', category: 'Spices', revenue: 8, status: 'Overstocked' },
            ],
            lowStock: [{ name: 'Luqaimat Mix', qty: 1 }, { name: 'Arabic Coffee', qty: 1 }],
            highStock: [{ name: 'Basmati Rice', qty: 15 }, { name: 'Sugar', qty: 12 }],
            totalStockUnits: 80,
            sixMonthTrend: [
              { month: '2026-04', revenue: 360 }, { month: '2026-05', revenue: 385 }, { month: '2026-06', revenue: 410 },
              { month: '2026-07', revenue: 420 }, { month: '2026-08', revenue: 435 }, { month: '2026-09', revenue: 490 },
            ],
          },
          {
            name: 'Mussafah', revenue: 1500, orders: 26, units: 39, customers: 19, growth: '+1%',
            subscribers: 12, activeSubs: 10, unsubs: 2, subRetention: 83, activeRate: 83,
            delivered: 23, inTransit: 2, cancelled: 1, avgOrder: 58,
            bestSeller: 'Oud Powder', categoriesSold: 5, salesGrowth: '+1%',
            newCustomers: 4, repeatCustomers: 15, retentionRate: 79, revPerCustomer: 79,
            topProducts: [
              { name: 'Oud Powder', category: 'Incense', revenue: 240, share: 16 },
              { name: 'Arabic Coffee', category: 'Beverages', revenue: 210, share: 14 },
              { name: 'Dates Premium', category: 'Dry Fruits', revenue: 165, share: 11 },
              { name: 'Bakhoor Mix', category: 'Incense', revenue: 135, share: 9 },
              { name: 'Luqaimat Mix', category: 'Sweets', revenue: 105, share: 7 },
            ],
            poorProducts: [
              { name: 'Dried Lime', category: 'Spices', revenue: 8, status: 'Low Demand' },
              { name: 'Carob Molasses', category: 'Sweeteners', revenue: 9, status: 'Slow Moving' },
              { name: 'Dried Mint', category: 'Spices', revenue: 5, status: 'Declining' },
              { name: 'Nigella Seeds', category: 'Spices', revenue: 6, status: 'Low Demand' },
              { name: 'Sumac', category: 'Spices', revenue: 4, status: 'Overstocked' },
            ],
            lowStock: [{ name: 'Oud Powder', qty: 1 }],
            highStock: [{ name: 'Basmati Rice', qty: 8 }],
            totalStockUnits: 40,
            sixMonthTrend: [
              { month: '2026-04', revenue: 220 }, { month: '2026-05', revenue: 235 }, { month: '2026-06', revenue: 250 },
              { month: '2026-07', revenue: 255 }, { month: '2026-08', revenue: 265 }, { month: '2026-09', revenue: 300 },
            ],
          },
        ],
      },
      {
        name: 'Sharjah', revenue: 18500, orders: 380, units: 570, customers: 270, growth: '+6%',
        subscribers: 165, activeSubs: 146, unsubs: 19, subRetention: 88, activeRate: 88,
        delivered: 348, inTransit: 24, cancelled: 8, avgOrder: 49,
        bestSeller: 'Kunafa Mix', categoriesSold: 9, salesGrowth: '+6%',
        newCustomers: 68, repeatCustomers: 202, retentionRate: 75, revPerCustomer: 69,
        topProducts: [
          { name: 'Kunafa Mix', category: 'Sweets', revenue: 3400, share: 18 },
          { name: 'Maamoul', category: 'Sweets', revenue: 2800, share: 15 },
          { name: 'Dates Syrup', category: 'Sweeteners', revenue: 2200, share: 12 },
          { name: 'Chickpea Flour', category: 'Grains', revenue: 1800, share: 10 },
          { name: 'Rose Water', category: 'Beverages', revenue: 1500, share: 8 },
        ],
        poorProducts: [
          { name: 'Nigella Seeds', category: 'Spices', revenue: 120, status: 'Low Demand' },
          { name: 'Mastic Gum', category: 'Incense', revenue: 150, status: 'Slow Moving' },
          { name: 'Dried Mint', category: 'Spices', revenue: 80, status: 'Declining' },
          { name: 'Sumac', category: 'Spices', revenue: 100, status: 'Low Demand' },
          { name: 'Dried Lime', category: 'Spices', revenue: 65, status: 'Overstocked' },
        ],
        lowStock: [{ name: 'Kunafa Mix', qty: 12 }, { name: 'Maamoul', qty: 8 }],
        highStock: [{ name: 'Basmati Rice', qty: 150 }, { name: 'Sugar', qty: 120 }],
        totalStockUnits: 950,
        sixMonthTrend: [
          { month: '2026-04', revenue: 2600 }, { month: '2026-05', revenue: 2800 }, { month: '2026-06', revenue: 3000 },
          { month: '2026-07', revenue: 3100 }, { month: '2026-08', revenue: 3200 }, { month: '2026-09', revenue: 3800 },
        ],
        cities: [
          {
            name: 'Sharjah City', revenue: 8200, orders: 168, units: 252, customers: 119, growth: '+7%',
            subscribers: 73, activeSubs: 65, unsubs: 8, subRetention: 89, activeRate: 89,
            delivered: 154, inTransit: 11, cancelled: 3, avgOrder: 49,
            bestSeller: 'Kunafa Mix', categoriesSold: 8, salesGrowth: '+7%',
            newCustomers: 30, repeatCustomers: 89, retentionRate: 75, revPerCustomer: 69,
            topProducts: [
              { name: 'Kunafa Mix', category: 'Sweets', revenue: 1496, share: 18 },
              { name: 'Maamoul', category: 'Sweets', revenue: 1230, share: 15 },
              { name: 'Dates Syrup', category: 'Sweeteners', revenue: 984, share: 12 },
              { name: 'Chickpea Flour', category: 'Grains', revenue: 820, share: 10 },
              { name: 'Rose Water', category: 'Beverages', revenue: 656, share: 8 },
            ],
            poorProducts: [
              { name: 'Nigella Seeds', category: 'Spices', revenue: 53, status: 'Low Demand' },
              { name: 'Mastic Gum', category: 'Incense', revenue: 66, status: 'Slow Moving' },
              { name: 'Dried Mint', category: 'Spices', revenue: 35, status: 'Declining' },
              { name: 'Sumac', category: 'Spices', revenue: 44, status: 'Low Demand' },
              { name: 'Dried Lime', category: 'Spices', revenue: 29, status: 'Overstocked' },
            ],
            lowStock: [{ name: 'Kunafa Mix', qty: 5 }, { name: 'Maamoul', qty: 4 }],
            highStock: [{ name: 'Basmati Rice', qty: 66 }, { name: 'Sugar', qty: 53 }],
            totalStockUnits: 420,
            sixMonthTrend: [
              { month: '2026-04', revenue: 1150 }, { month: '2026-05', revenue: 1240 }, { month: '2026-06', revenue: 1330 },
              { month: '2026-07', revenue: 1370 }, { month: '2026-08', revenue: 1420 }, { month: '2026-09', revenue: 1690 },
            ],
          },
          {
            name: 'Al Khan', revenue: 4500, orders: 92, units: 138, customers: 65, growth: '+5%',
            subscribers: 40, activeSubs: 35, unsubs: 5, subRetention: 88, activeRate: 88,
            delivered: 84, inTransit: 6, cancelled: 2, avgOrder: 49,
            bestSeller: 'Maamoul', categoriesSold: 7, salesGrowth: '+5%',
            newCustomers: 16, repeatCustomers: 49, retentionRate: 75, revPerCustomer: 69,
            topProducts: [
              { name: 'Maamoul', category: 'Sweets', revenue: 675, share: 15 },
              { name: 'Kunafa Mix', category: 'Sweets', revenue: 585, share: 13 },
              { name: 'Dates Syrup', category: 'Sweeteners', revenue: 450, share: 10 },
              { name: 'Chickpea Flour', category: 'Grains', revenue: 360, share: 8 },
              { name: 'Rose Water', category: 'Beverages', revenue: 315, share: 7 },
            ],
            poorProducts: [
              { name: 'Nigella Seeds', category: 'Spices', revenue: 27, status: 'Low Demand' },
              { name: 'Mastic Gum', category: 'Incense', revenue: 34, status: 'Slow Moving' },
              { name: 'Dried Mint', category: 'Spices', revenue: 18, status: 'Declining' },
              { name: 'Sumac', category: 'Spices', revenue: 22, status: 'Low Demand' },
              { name: 'Dried Lime', category: 'Spices', revenue: 15, status: 'Overstocked' },
            ],
            lowStock: [{ name: 'Maamoul', qty: 3 }, { name: 'Kunafa Mix', qty: 2 }],
            highStock: [{ name: 'Basmati Rice', qty: 36 }, { name: 'Sugar', qty: 29 }],
            totalStockUnits: 230,
            sixMonthTrend: [
              { month: '2026-04', revenue: 630 }, { month: '2026-05', revenue: 680 }, { month: '2026-06', revenue: 730 },
              { month: '2026-07', revenue: 750 }, { month: '2026-08', revenue: 780 }, { month: '2026-09', revenue: 930 },
            ],
          },
          {
            name: 'Al Majaz', revenue: 3200, orders: 66, units: 99, customers: 46, growth: '+5%',
            subscribers: 28, activeSubs: 25, unsubs: 3, subRetention: 89, activeRate: 89,
            delivered: 60, inTransit: 4, cancelled: 2, avgOrder: 48,
            bestSeller: 'Dates Syrup', categoriesSold: 7, salesGrowth: '+5%',
            newCustomers: 12, repeatCustomers: 34, retentionRate: 74, revPerCustomer: 70,
            topProducts: [
              { name: 'Dates Syrup', category: 'Sweeteners', revenue: 384, share: 12 },
              { name: 'Kunafa Mix', category: 'Sweets', revenue: 336, share: 11 },
              { name: 'Maamoul', category: 'Sweets', revenue: 288, share: 9 },
              { name: 'Chickpea Flour', category: 'Grains', revenue: 240, share: 8 },
              { name: 'Rose Water', category: 'Beverages', revenue: 192, share: 6 },
            ],
            poorProducts: [
              { name: 'Nigella Seeds', category: 'Spices', revenue: 19, status: 'Low Demand' },
              { name: 'Mastic Gum', category: 'Incense', revenue: 24, status: 'Slow Moving' },
              { name: 'Dried Mint', category: 'Spices', revenue: 13, status: 'Declining' },
              { name: 'Sumac', category: 'Spices', revenue: 16, status: 'Low Demand' },
              { name: 'Dried Lime', category: 'Spices', revenue: 10, status: 'Overstocked' },
            ],
            lowStock: [{ name: 'Dates Syrup', qty: 2 }, { name: 'Kunafa Mix', qty: 2 }],
            highStock: [{ name: 'Basmati Rice', qty: 26 }, { name: 'Sugar', qty: 21 }],
            totalStockUnits: 165,
            sixMonthTrend: [
              { month: '2026-04', revenue: 450 }, { month: '2026-05', revenue: 490 }, { month: '2026-06', revenue: 530 },
              { month: '2026-07', revenue: 545 }, { month: '2026-08', revenue: 565 }, { month: '2026-09', revenue: 620 },
            ],
          },
          {
            name: 'Al Nahda', revenue: 1800, orders: 37, units: 56, customers: 26, growth: '+3%',
            subscribers: 16, activeSubs: 14, unsubs: 2, subRetention: 88, activeRate: 88,
            delivered: 34, inTransit: 2, cancelled: 1, avgOrder: 49,
            bestSeller: 'Chickpea Flour', categoriesSold: 6, salesGrowth: '+3%',
            newCustomers: 7, repeatCustomers: 19, retentionRate: 73, revPerCustomer: 69,
            topProducts: [
              { name: 'Chickpea Flour', category: 'Grains', revenue: 216, share: 12 },
              { name: 'Kunafa Mix', category: 'Sweets', revenue: 189, share: 11 },
              { name: 'Maamoul', category: 'Sweets', revenue: 162, share: 9 },
              { name: 'Dates Syrup', category: 'Sweeteners', revenue: 135, share: 8 },
              { name: 'Rose Water', category: 'Beverages', revenue: 108, share: 6 },
            ],
            poorProducts: [
              { name: 'Nigella Seeds', category: 'Spices', revenue: 11, status: 'Low Demand' },
              { name: 'Mastic Gum', category: 'Incense', revenue: 13, status: 'Slow Moving' },
              { name: 'Dried Mint', category: 'Spices', revenue: 7, status: 'Declining' },
              { name: 'Sumac', category: 'Spices', revenue: 9, status: 'Low Demand' },
              { name: 'Dried Lime', category: 'Spices', revenue: 6, status: 'Overstocked' },
            ],
            lowStock: [{ name: 'Chickpea Flour', qty: 1 }, { name: 'Kunafa Mix', qty: 1 }],
            highStock: [{ name: 'Basmati Rice', qty: 14 }, { name: 'Sugar', qty: 11 }],
            totalStockUnits: 88,
            sixMonthTrend: [
              { month: '2026-04', revenue: 250 }, { month: '2026-05', revenue: 275 }, { month: '2026-06', revenue: 300 },
              { month: '2026-07', revenue: 310 }, { month: '2026-08', revenue: 320 }, { month: '2026-09', revenue: 345 },
            ],
          },
          {
            name: 'Muwaileh', revenue: 800, orders: 17, units: 25, customers: 14, growth: '+2%',
            subscribers: 8, activeSubs: 7, unsubs: 1, subRetention: 88, activeRate: 88,
            delivered: 16, inTransit: 1, cancelled: 0, avgOrder: 47,
            bestSeller: 'Rose Water', categoriesSold: 5, salesGrowth: '+2%',
            newCustomers: 3, repeatCustomers: 11, retentionRate: 79, revPerCustomer: 57,
            topProducts: [
              { name: 'Rose Water', category: 'Beverages', revenue: 96, share: 12 },
              { name: 'Kunafa Mix', category: 'Sweets', revenue: 80, share: 10 },
              { name: 'Maamoul', category: 'Sweets', revenue: 64, share: 8 },
              { name: 'Dates Syrup', category: 'Sweeteners', revenue: 56, share: 7 },
              { name: 'Chickpea Flour', category: 'Grains', revenue: 48, share: 6 },
            ],
            poorProducts: [
              { name: 'Nigella Seeds', category: 'Spices', revenue: 5, status: 'Low Demand' },
              { name: 'Mastic Gum', category: 'Incense', revenue: 6, status: 'Slow Moving' },
              { name: 'Dried Mint', category: 'Spices', revenue: 3, status: 'Declining' },
              { name: 'Sumac', category: 'Spices', revenue: 4, status: 'Low Demand' },
              { name: 'Dried Lime', category: 'Spices', revenue: 3, status: 'Overstocked' },
            ],
            lowStock: [{ name: 'Rose Water', qty: 1 }],
            highStock: [{ name: 'Basmati Rice', qty: 6 }],
            totalStockUnits: 32,
            sixMonthTrend: [
              { month: '2026-04', revenue: 110 }, { month: '2026-05', revenue: 120 }, { month: '2026-06', revenue: 130 },
              { month: '2026-07', revenue: 135 }, { month: '2026-08', revenue: 140 }, { month: '2026-09', revenue: 170 },
            ],
          },
        ],
      },
    ],
  },
  us: {
    label: 'State',
    states: [
      {
        name: 'California', revenue: 22000, orders: 520, units: 780, customers: 370, growth: '+6%',
        subscribers: 260, activeSubs: 230, unsubs: 30, subRetention: 88, activeRate: 88,
        delivered: 474, inTransit: 32, cancelled: 14, avgOrder: 42,
        bestSeller: 'Almond Butter', categoriesSold: 12, salesGrowth: '+6%',
        newCustomers: 93, repeatCustomers: 277, retentionRate: 75, revPerCustomer: 59,
        topProducts: [
          { name: 'Almond Butter', category: 'Pantry', revenue: 3800, share: 17 },
          { name: 'Avocado Oil', category: 'Oils', revenue: 3200, share: 15 },
          { name: 'Organic Granola', category: 'Breakfast', revenue: 2800, share: 13 },
          { name: 'Sourdough Starter', category: 'Baking', revenue: 2400, share: 11 },
          { name: 'Kombucha SCOBY', category: 'Beverages', revenue: 2000, share: 9 },
        ],
        poorProducts: [
          { name: 'Dried Figs', category: 'Dry Fruits', revenue: 150, status: 'Low Demand' },
          { name: 'Macadamia Nuts', category: 'Dry Fruits', revenue: 200, status: 'Slow Moving' },
          { name: 'Pumpkin Seeds', category: 'Seeds', revenue: 120, status: 'Declining' },
          { name: 'Chia Seeds', category: 'Seeds', revenue: 100, status: 'Low Demand' },
          { name: 'Flax Seeds', category: 'Seeds', revenue: 85, status: 'Overstocked' },
        ],
        lowStock: [{ name: 'Almond Butter', qty: 18 }, { name: 'Avocado Oil', qty: 12 }],
        highStock: [{ name: 'Oat Milk', qty: 180 }, { name: 'Quinoa', qty: 150 }],
        totalStockUnits: 1420,
        sixMonthTrend: [
          { month: '2026-04', revenue: 3100 }, { month: '2026-05', revenue: 3300 }, { month: '2026-06', revenue: 3500 },
          { month: '2026-07', revenue: 3600 }, { month: '2026-08', revenue: 3750 }, { month: '2026-09', revenue: 4750 },
        ],
        cities: [
          {
            name: 'Los Angeles', revenue: 9000, orders: 213, units: 320, customers: 152, growth: '+7%',
            subscribers: 107, activeSubs: 95, unsubs: 12, subRetention: 89, activeRate: 89,
            delivered: 194, inTransit: 13, cancelled: 6, avgOrder: 42,
            bestSeller: 'Almond Butter', categoriesSold: 10, salesGrowth: '+7%',
            newCustomers: 38, repeatCustomers: 114, retentionRate: 75, revPerCustomer: 59,
            topProducts: [
              { name: 'Almond Butter', category: 'Pantry', revenue: 1530, share: 17 },
              { name: 'Avocado Oil', category: 'Oils', revenue: 1260, share: 14 },
              { name: 'Organic Granola', category: 'Breakfast', revenue: 1080, share: 12 },
              { name: 'Sourdough Starter', category: 'Baking', revenue: 900, share: 10 },
              { name: 'Kombucha SCOBY', category: 'Beverages', revenue: 720, share: 8 },
            ],
            poorProducts: [
              { name: 'Dried Figs', category: 'Dry Fruits', revenue: 60, status: 'Low Demand' },
              { name: 'Macadamia Nuts', category: 'Dry Fruits', revenue: 80, status: 'Slow Moving' },
              { name: 'Pumpkin Seeds', category: 'Seeds', revenue: 48, status: 'Declining' },
              { name: 'Chia Seeds', category: 'Seeds', revenue: 40, status: 'Low Demand' },
              { name: 'Flax Seeds', category: 'Seeds', revenue: 34, status: 'Overstocked' },
            ],
            lowStock: [{ name: 'Almond Butter', qty: 7 }, { name: 'Avocado Oil', qty: 5 }],
            highStock: [{ name: 'Oat Milk', qty: 74 }, { name: 'Quinoa', qty: 62 }],
            totalStockUnits: 580,
            sixMonthTrend: [
              { month: '2026-04', revenue: 1250 }, { month: '2026-05', revenue: 1340 }, { month: '2026-06', revenue: 1420 },
              { month: '2026-07', revenue: 1460 }, { month: '2026-08', revenue: 1520 }, { month: '2026-09', revenue: 2010 },
            ],
          },
          {
            name: 'San Diego', revenue: 5500, orders: 130, units: 195, customers: 92, growth: '+5%',
            subscribers: 65, activeSubs: 58, unsubs: 7, subRetention: 89, activeRate: 89,
            delivered: 118, inTransit: 8, cancelled: 4, avgOrder: 42,
            bestSeller: 'Avocado Oil', categoriesSold: 9, salesGrowth: '+5%',
            newCustomers: 23, repeatCustomers: 69, retentionRate: 75, revPerCustomer: 60,
            topProducts: [
              { name: 'Avocado Oil', category: 'Oils', revenue: 825, share: 15 },
              { name: 'Almond Butter', category: 'Pantry', revenue: 715, share: 13 },
              { name: 'Organic Granola', category: 'Breakfast', revenue: 605, share: 11 },
              { name: 'Sourdough Starter', category: 'Baking', revenue: 495, share: 9 },
              { name: 'Kombucha SCOBY', category: 'Beverages', revenue: 440, share: 8 },
            ],
            poorProducts: [
              { name: 'Dried Figs', category: 'Dry Fruits', revenue: 38, status: 'Low Demand' },
              { name: 'Macadamia Nuts', category: 'Dry Fruits', revenue: 50, status: 'Slow Moving' },
              { name: 'Pumpkin Seeds', category: 'Seeds', revenue: 30, status: 'Declining' },
              { name: 'Chia Seeds', category: 'Seeds', revenue: 25, status: 'Low Demand' },
              { name: 'Flax Seeds', category: 'Seeds', revenue: 21, status: 'Overstocked' },
            ],
            lowStock: [{ name: 'Avocado Oil', qty: 4 }, { name: 'Almond Butter', qty: 3 }],
            highStock: [{ name: 'Oat Milk', qty: 45 }, { name: 'Quinoa', qty: 38 }],
            totalStockUnits: 355,
            sixMonthTrend: [
              { month: '2026-04', revenue: 780 }, { month: '2026-05', revenue: 840 }, { month: '2026-06', revenue: 900 },
              { month: '2026-07', revenue: 920 }, { month: '2026-08', revenue: 960 }, { month: '2026-09', revenue: 1100 },
            ],
          },
          {
            name: 'San Jose', revenue: 3800, orders: 90, units: 135, customers: 64, growth: '+5%',
            subscribers: 45, activeSubs: 40, unsubs: 5, subRetention: 89, activeRate: 89,
            delivered: 82, inTransit: 5, cancelled: 3, avgOrder: 42,
            bestSeller: 'Organic Granola', categoriesSold: 8, salesGrowth: '+5%',
            newCustomers: 16, repeatCustomers: 48, retentionRate: 75, revPerCustomer: 59,
            topProducts: [
              { name: 'Organic Granola', category: 'Breakfast', revenue: 570, share: 15 },
              { name: 'Almond Butter', category: 'Pantry', revenue: 494, share: 13 },
              { name: 'Avocado Oil', category: 'Oils', revenue: 418, share: 11 },
              { name: 'Sourdough Starter', category: 'Baking', revenue: 342, share: 9 },
              { name: 'Kombucha SCOBY', category: 'Beverages', revenue: 304, share: 8 },
            ],
            poorProducts: [
              { name: 'Dried Figs', category: 'Dry Fruits', revenue: 26, status: 'Low Demand' },
              { name: 'Macadamia Nuts', category: 'Dry Fruits', revenue: 34, status: 'Slow Moving' },
              { name: 'Pumpkin Seeds', category: 'Seeds', revenue: 21, status: 'Declining' },
              { name: 'Chia Seeds', category: 'Seeds', revenue: 17, status: 'Low Demand' },
              { name: 'Flax Seeds', category: 'Seeds', revenue: 14, status: 'Overstocked' },
            ],
            lowStock: [{ name: 'Organic Granola', qty: 3 }, { name: 'Almond Butter', qty: 2 }],
            highStock: [{ name: 'Oat Milk', qty: 31 }, { name: 'Quinoa', qty: 26 }],
            totalStockUnits: 245,
            sixMonthTrend: [
              { month: '2026-04', revenue: 540 }, { month: '2026-05', revenue: 580 }, { month: '2026-06', revenue: 620 },
              { month: '2026-07', revenue: 635 }, { month: '2026-08', revenue: 660 }, { month: '2026-09', revenue: 765 },
            ],
          },
          {
            name: 'San Francisco', revenue: 2500, orders: 59, units: 89, customers: 42, growth: '+4%',
            subscribers: 30, activeSubs: 27, unsubs: 3, subRetention: 90, activeRate: 90,
            delivered: 54, inTransit: 4, cancelled: 1, avgOrder: 42,
            bestSeller: 'Sourdough Starter', categoriesSold: 7, salesGrowth: '+4%',
            newCustomers: 11, repeatCustomers: 31, retentionRate: 74, revPerCustomer: 60,
            topProducts: [
              { name: 'Sourdough Starter', category: 'Baking', revenue: 375, share: 15 },
              { name: 'Almond Butter', category: 'Pantry', revenue: 325, share: 13 },
              { name: 'Avocado Oil', category: 'Oils', revenue: 275, share: 11 },
              { name: 'Organic Granola', category: 'Breakfast', revenue: 225, share: 9 },
              { name: 'Kombucha SCOBY', category: 'Beverages', revenue: 200, share: 8 },
            ],
            poorProducts: [
              { name: 'Dried Figs', category: 'Dry Fruits', revenue: 17, status: 'Low Demand' },
              { name: 'Macadamia Nuts', category: 'Dry Fruits', revenue: 23, status: 'Slow Moving' },
              { name: 'Pumpkin Seeds', category: 'Seeds', revenue: 14, status: 'Declining' },
              { name: 'Chia Seeds', category: 'Seeds', revenue: 11, status: 'Low Demand' },
              { name: 'Flax Seeds', category: 'Seeds', revenue: 10, status: 'Overstocked' },
            ],
            lowStock: [{ name: 'Sourdough Starter', qty: 2 }, { name: 'Almond Butter', qty: 2 }],
            highStock: [{ name: 'Oat Milk', qty: 21 }, { name: 'Quinoa', qty: 17 }],
            totalStockUnits: 160,
            sixMonthTrend: [
              { month: '2026-04', revenue: 350 }, { month: '2026-05', revenue: 380 }, { month: '2026-06', revenue: 410 },
              { month: '2026-07', revenue: 420 }, { month: '2026-08', revenue: 435 }, { month: '2026-09', revenue: 505 },
            ],
          },
          {
            name: 'Sacramento', revenue: 1200, orders: 28, units: 41, customers: 20, growth: '+3%',
            subscribers: 13, activeSubs: 10, unsubs: 3, subRetention: 77, activeRate: 77,
            delivered: 26, inTransit: 2, cancelled: 0, avgOrder: 43,
            bestSeller: 'Kombucha SCOBY', categoriesSold: 6, salesGrowth: '+3%',
            newCustomers: 5, repeatCustomers: 15, retentionRate: 75, revPerCustomer: 60,
            topProducts: [
              { name: 'Kombucha SCOBY', category: 'Beverages', revenue: 180, share: 15 },
              { name: 'Almond Butter', category: 'Pantry', revenue: 156, share: 13 },
              { name: 'Avocado Oil', category: 'Oils', revenue: 132, share: 11 },
              { name: 'Organic Granola', category: 'Breakfast', revenue: 108, share: 9 },
              { name: 'Sourdough Starter', category: 'Baking', revenue: 96, share: 8 },
            ],
            poorProducts: [
              { name: 'Dried Figs', category: 'Dry Fruits', revenue: 8, status: 'Low Demand' },
              { name: 'Macadamia Nuts', category: 'Dry Fruits', revenue: 10, status: 'Slow Moving' },
              { name: 'Pumpkin Seeds', category: 'Seeds', revenue: 6, status: 'Declining' },
              { name: 'Chia Seeds', category: 'Seeds', revenue: 5, status: 'Low Demand' },
              { name: 'Flax Seeds', category: 'Seeds', revenue: 4, status: 'Overstocked' },
            ],
            lowStock: [{ name: 'Kombucha SCOBY', qty: 1 }],
            highStock: [{ name: 'Oat Milk', qty: 9 }],
            totalStockUnits: 80,
            sixMonthTrend: [
              { month: '2026-04', revenue: 180 }, { month: '2026-05', revenue: 195 }, { month: '2026-06', revenue: 210 },
              { month: '2026-07', revenue: 215 }, { month: '2026-08', revenue: 225 }, { month: '2026-09', revenue: 175 },
            ],
          },
        ],
      },
      {
        name: 'Texas', revenue: 18500, orders: 440, units: 660, customers: 310, growth: '+5%',
        subscribers: 220, activeSubs: 195, unsubs: 25, subRetention: 89, activeRate: 89,
        delivered: 400, inTransit: 28, cancelled: 12, avgOrder: 42,
        bestSeller: 'BBQ Rub', categoriesSold: 10, salesGrowth: '+5%',
        newCustomers: 78, repeatCustomers: 232, retentionRate: 75, revPerCustomer: 60,
        topProducts: [
          { name: 'BBQ Rub', category: 'Spices', revenue: 3400, share: 18 },
          { name: 'Pecan Pie Mix', category: 'Baking', revenue: 2800, share: 15 },
          { name: 'Chili Seasoning', category: 'Spices', revenue: 2400, share: 13 },
          { name: 'Cornbread Mix', category: 'Baking', revenue: 2000, share: 11 },
          { name: 'Hot Sauce', category: 'Condiments', revenue: 1700, share: 9 },
        ],
        poorProducts: [
          { name: 'Dried JalapeÃ±os', category: 'Spices', revenue: 120, status: 'Low Demand' },
          { name: 'Prickly Pear Syrup', category: 'Sweeteners', revenue: 150, status: 'Slow Moving' },
          { name: 'Mesquite Flour', category: 'Grains', revenue: 90, status: 'Declining' },
          { name: 'Pecan Flour', category: 'Grains', revenue: 80, status: 'Low Demand' },
          { name: 'Cactus Candy', category: 'Sweets', revenue: 65, status: 'Overstocked' },
        ],
        lowStock: [{ name: 'BBQ Rub', qty: 15 }, { name: 'Pecan Pie Mix', qty: 10 }],
        highStock: [{ name: 'Corn Flour', qty: 160 }, { name: 'Chili Beans', qty: 140 }],
        totalStockUnits: 1180,
        sixMonthTrend: [
          { month: '2026-04', revenue: 2600 }, { month: '2026-05', revenue: 2800 }, { month: '2026-06', revenue: 2950 },
          { month: '2026-07', revenue: 3050 }, { month: '2026-08', revenue: 3180 }, { month: '2026-09', revenue: 3920 },
        ],
        cities: [
          {
            name: 'Houston', revenue: 7500, orders: 179, units: 269, customers: 126, growth: '+6%',
            subscribers: 90, activeSubs: 80, unsubs: 10, subRetention: 89, activeRate: 89,
            delivered: 163, inTransit: 11, cancelled: 5, avgOrder: 42,
            bestSeller: 'BBQ Rub', categoriesSold: 9, salesGrowth: '+6%',
            newCustomers: 32, repeatCustomers: 94, retentionRate: 75, revPerCustomer: 60,
            topProducts: [
              { name: 'BBQ Rub', category: 'Spices', revenue: 1350, share: 18 },
              { name: 'Pecan Pie Mix', category: 'Baking', revenue: 1125, share: 15 },
              { name: 'Chili Seasoning', category: 'Spices', revenue: 975, share: 13 },
              { name: 'Cornbread Mix', category: 'Baking', revenue: 825, share: 11 },
              { name: 'Hot Sauce', category: 'Condiments', revenue: 675, share: 9 },
            ],
            poorProducts: [
              { name: 'Dried JalapeÃ±os', category: 'Spices', revenue: 48, status: 'Low Demand' },
              { name: 'Prickly Pear Syrup', category: 'Sweeteners', revenue: 60, status: 'Slow Moving' },
              { name: 'Mesquite Flour', category: 'Grains', revenue: 36, status: 'Declining' },
              { name: 'Pecan Flour', category: 'Grains', revenue: 32, status: 'Low Demand' },
              { name: 'Cactus Candy', category: 'Sweets', revenue: 26, status: 'Overstocked' },
            ],
            lowStock: [{ name: 'BBQ Rub', qty: 6 }, { name: 'Pecan Pie Mix', qty: 4 }],
            highStock: [{ name: 'Corn Flour', qty: 65 }, { name: 'Chili Beans', qty: 57 }],
            totalStockUnits: 480,
            sixMonthTrend: [
              { month: '2026-04', revenue: 1050 }, { month: '2026-05', revenue: 1135 }, { month: '2026-06', revenue: 1200 },
              { month: '2026-07', revenue: 1240 }, { month: '2026-08', revenue: 1295 }, { month: '2026-09', revenue: 1580 },
            ],
          },
          {
            name: 'Dallas', revenue: 5200, orders: 124, units: 186, customers: 87, growth: '+5%',
            subscribers: 62, activeSubs: 55, unsubs: 7, subRetention: 89, activeRate: 89,
            delivered: 113, inTransit: 8, cancelled: 3, avgOrder: 42,
            bestSeller: 'Pecan Pie Mix', categoriesSold: 8, salesGrowth: '+5%',
            newCustomers: 22, repeatCustomers: 65, retentionRate: 75, revPerCustomer: 60,
            topProducts: [
              { name: 'Pecan Pie Mix', category: 'Baking', revenue: 780, share: 15 },
              { name: 'BBQ Rub', category: 'Spices', revenue: 676, share: 13 },
              { name: 'Chili Seasoning', category: 'Spices', revenue: 572, share: 11 },
              { name: 'Cornbread Mix', category: 'Baking', revenue: 468, share: 9 },
              { name: 'Hot Sauce', category: 'Condiments', revenue: 364, share: 7 },
            ],
            poorProducts: [
              { name: 'Dried JalapeÃ±os', category: 'Spices', revenue: 31, status: 'Low Demand' },
              { name: 'Prickly Pear Syrup', category: 'Sweeteners', revenue: 39, status: 'Slow Moving' },
              { name: 'Mesquite Flour', category: 'Grains', revenue: 23, status: 'Declining' },
              { name: 'Pecan Flour', category: 'Grains', revenue: 21, status: 'Low Demand' },
              { name: 'Cactus Candy', category: 'Sweets', revenue: 17, status: 'Overstocked' },
            ],
            lowStock: [{ name: 'Pecan Pie Mix', qty: 4 }, { name: 'BBQ Rub', qty: 3 }],
            highStock: [{ name: 'Corn Flour', qty: 45 }, { name: 'Chili Beans', qty: 39 }],
            totalStockUnits: 335,
            sixMonthTrend: [
              { month: '2026-04', revenue: 730 }, { month: '2026-05', revenue: 790 }, { month: '2026-06', revenue: 840 },
              { month: '2026-07', revenue: 865 }, { month: '2026-08', revenue: 900 }, { month: '2026-09', revenue: 1075 },
            ],
          },
          {
            name: 'Austin', revenue: 3200, orders: 76, units: 114, customers: 53, growth: '+4%',
            subscribers: 38, activeSubs: 34, unsubs: 4, subRetention: 89, activeRate: 89,
            delivered: 69, inTransit: 5, cancelled: 2, avgOrder: 42,
            bestSeller: 'Chili Seasoning', categoriesSold: 8, salesGrowth: '+4%',
            newCustomers: 13, repeatCustomers: 40, retentionRate: 75, revPerCustomer: 60,
            topProducts: [
              { name: 'Chili Seasoning', category: 'Spices', revenue: 480, share: 15 },
              { name: 'BBQ Rub', category: 'Spices', revenue: 416, share: 13 },
              { name: 'Pecan Pie Mix', category: 'Baking', revenue: 352, share: 11 },
              { name: 'Cornbread Mix', category: 'Baking', revenue: 288, share: 9 },
              { name: 'Hot Sauce', category: 'Condiments', revenue: 224, share: 7 },
            ],
            poorProducts: [
              { name: 'Dried JalapeÃ±os', category: 'Spices', revenue: 19, status: 'Low Demand' },
              { name: 'Prickly Pear Syrup', category: 'Sweeteners', revenue: 24, status: 'Slow Moving' },
              { name: 'Mesquite Flour', category: 'Grains', revenue: 14, status: 'Declining' },
              { name: 'Pecan Flour', category: 'Grains', revenue: 13, status: 'Low Demand' },
              { name: 'Cactus Candy', category: 'Sweets', revenue: 10, status: 'Overstocked' },
            ],
            lowStock: [{ name: 'Chili Seasoning', qty: 3 }, { name: 'BBQ Rub', qty: 2 }],
            highStock: [{ name: 'Corn Flour', qty: 28 }, { name: 'Chili Beans', qty: 24 }],
            totalStockUnits: 205,
            sixMonthTrend: [
              { month: '2026-04', revenue: 450 }, { month: '2026-05', revenue: 485 }, { month: '2026-06', revenue: 520 },
              { month: '2026-07', revenue: 535 }, { month: '2026-08', revenue: 555 }, { month: '2026-09', revenue: 655 },
            ],
          },
          {
            name: 'San Antonio', revenue: 1800, orders: 43, units: 65, customers: 30, growth: '+3%',
            subscribers: 22, activeSubs: 20, unsubs: 2, subRetention: 91, activeRate: 91,
            delivered: 39, inTransit: 3, cancelled: 1, avgOrder: 42,
            bestSeller: 'Cornbread Mix', categoriesSold: 7, salesGrowth: '+3%',
            newCustomers: 8, repeatCustomers: 22, retentionRate: 73, revPerCustomer: 60,
            topProducts: [
              { name: 'Cornbread Mix', category: 'Baking', revenue: 270, share: 15 },
              { name: 'BBQ Rub', category: 'Spices', revenue: 234, share: 13 },
              { name: 'Chili Seasoning', category: 'Spices', revenue: 198, share: 11 },
              { name: 'Pecan Pie Mix', category: 'Baking', revenue: 162, share: 9 },
              { name: 'Hot Sauce', category: 'Condiments', revenue: 126, share: 7 },
            ],
            poorProducts: [
              { name: 'Dried JalapeÃ±os', category: 'Spices', revenue: 11, status: 'Low Demand' },
              { name: 'Prickly Pear Syrup', category: 'Sweeteners', revenue: 14, status: 'Slow Moving' },
              { name: 'Mesquite Flour', category: 'Grains', revenue: 8, status: 'Declining' },
              { name: 'Pecan Flour', category: 'Grains', revenue: 7, status: 'Low Demand' },
              { name: 'Cactus Candy', category: 'Sweets', revenue: 6, status: 'Overstocked' },
            ],
            lowStock: [{ name: 'Cornbread Mix', qty: 2 }, { name: 'BBQ Rub', qty: 2 }],
            highStock: [{ name: 'Corn Flour', qty: 16 }, { name: 'Chili Beans', qty: 14 }],
            totalStockUnits: 115,
            sixMonthTrend: [
              { month: '2026-04', revenue: 255 }, { month: '2026-05', revenue: 275 }, { month: '2026-06', revenue: 295 },
              { month: '2026-07', revenue: 305 }, { month: '2026-08', revenue: 315 }, { month: '2026-09', revenue: 355 },
            ],
          },
          {
            name: 'Fort Worth', revenue: 800, orders: 18, units: 26, customers: 14, growth: '+2%',
            subscribers: 8, activeSubs: 6, unsubs: 2, subRetention: 75, activeRate: 75,
            delivered: 16, inTransit: 1, cancelled: 1, avgOrder: 44,
            bestSeller: 'Hot Sauce', categoriesSold: 5, salesGrowth: '+2%',
            newCustomers: 3, repeatCustomers: 11, retentionRate: 79, revPerCustomer: 57,
            topProducts: [
              { name: 'Hot Sauce', category: 'Condiments', revenue: 120, share: 15 },
              { name: 'BBQ Rub', category: 'Spices', revenue: 104, share: 13 },
              { name: 'Chili Seasoning', category: 'Spices', revenue: 88, share: 11 },
              { name: 'Cornbread Mix', category: 'Baking', revenue: 72, share: 9 },
              { name: 'Pecan Pie Mix', category: 'Baking', revenue: 56, share: 7 },
            ],
            poorProducts: [
              { name: 'Dried JalapeÃ±os', category: 'Spices', revenue: 5, status: 'Low Demand' },
              { name: 'Prickly Pear Syrup', category: 'Sweeteners', revenue: 6, status: 'Slow Moving' },
              { name: 'Mesquite Flour', category: 'Grains', revenue: 4, status: 'Declining' },
              { name: 'Pecan Flour', category: 'Grains', revenue: 3, status: 'Low Demand' },
              { name: 'Cactus Candy', category: 'Sweets', revenue: 3, status: 'Overstocked' },
            ],
            lowStock: [{ name: 'Hot Sauce', qty: 1 }],
            highStock: [{ name: 'Corn Flour', qty: 6 }],
            totalStockUnits: 45,
            sixMonthTrend: [
              { month: '2026-04', revenue: 115 }, { month: '2026-05', revenue: 125 }, { month: '2026-06', revenue: 135 },
              { month: '2026-07', revenue: 140 }, { month: '2026-08', revenue: 145 }, { month: '2026-09', revenue: 140 },
            ],
          },
        ],
      },
      {
        name: 'New York', revenue: 26000, orders: 622, units: 933, customers: 436, growth: '+7%',
        subscribers: 310, activeSubs: 275, unsubs: 35, subRetention: 89, activeRate: 89,
        delivered: 563, inTransit: 40, cancelled: 19, avgOrder: 42,
        bestSeller: 'Maple Syrup', categoriesSold: 11, salesGrowth: '+7%',
        newCustomers: 110, repeatCustomers: 326, retentionRate: 75, revPerCustomer: 60,
        topProducts: [
          { name: 'Maple Syrup', category: 'Sweeteners', revenue: 4200, share: 16 },
          { name: 'Bagel Seasoning', category: 'Spices', revenue: 3500, share: 13 },
          { name: 'NY Cheesecake Mix', category: 'Baking', revenue: 3000, share: 12 },
          { name: 'Everything Bagel Chips', category: 'Snacks', revenue: 2600, share: 10 },
          { name: 'NY Pizza Sauce', category: 'Condiments', revenue: 2200, share: 8 },
        ],
        poorProducts: [
          { name: 'Pumpkin Spice', category: 'Spices', revenue: 180, status: 'Low Demand' },
          { name: 'Apple Cider Vinegar', category: 'Pantry', revenue: 220, status: 'Slow Moving' },
          { name: 'Dried Cranberries', category: 'Dry Fruits', revenue: 150, status: 'Declining' },
          { name: 'Corn Chowder Mix', category: 'Soups', revenue: 130, status: 'Low Demand' },
          { name: 'Clam Chowder Mix', category: 'Soups', revenue: 110, status: 'Overstocked' },
        ],
        lowStock: [{ name: 'Maple Syrup', qty: 20 }, { name: 'Bagel Seasoning', qty: 14 }],
        highStock: [{ name: 'Oat Milk', qty: 200 }, { name: 'Quinoa', qty: 170 }],
        totalStockUnits: 1560,
        sixMonthTrend: [
          { month: '2026-04', revenue: 3700 }, { month: '2026-05', revenue: 4000 }, { month: '2026-06', revenue: 4200 },
          { month: '2026-07', revenue: 4350 }, { month: '2026-08', revenue: 4500 }, { month: '2026-09', revenue: 5250 },
        ],
        cities: [
          {
            name: 'New York City', revenue: 17000, orders: 400, units: 600, customers: 280, growth: '+9%',
            subscribers: 194, activeSubs: 172, unsubs: 22, subRetention: 89, activeRate: 89,
            delivered: 362, inTransit: 26, cancelled: 12, avgOrder: 43,
            bestSeller: 'Maple Syrup', categoriesSold: 10, salesGrowth: '+9%',
            newCustomers: 70, repeatCustomers: 210, retentionRate: 75, revPerCustomer: 61,
            topProducts: [
              { name: 'Maple Syrup', category: 'Sweeteners', revenue: 2720, share: 16 },
              { name: 'Bagel Seasoning', category: 'Spices', revenue: 2210, share: 13 },
              { name: 'NY Cheesecake Mix', category: 'Baking', revenue: 1870, share: 11 },
              { name: 'Everything Bagel Chips', category: 'Snacks', revenue: 1530, share: 9 },
              { name: 'NY Pizza Sauce', category: 'Condiments', revenue: 1190, share: 7 },
            ],
            poorProducts: [
              { name: 'Pumpkin Spice', category: 'Spices', revenue: 116, status: 'Low Demand' },
              { name: 'Apple Cider Vinegar', category: 'Pantry', revenue: 142, status: 'Slow Moving' },
              { name: 'Dried Cranberries', category: 'Dry Fruits', revenue: 97, status: 'Declining' },
              { name: 'Corn Chowder Mix', category: 'Soups', revenue: 84, status: 'Low Demand' },
              { name: 'Clam Chowder Mix', category: 'Soups', revenue: 71, status: 'Overstocked' },
            ],
            lowStock: [{ name: 'Maple Syrup', qty: 12 }, { name: 'Bagel Seasoning', qty: 8 }],
            highStock: [{ name: 'Oat Milk', qty: 120 }, { name: 'Quinoa', qty: 100 }],
            totalStockUnits: 960,
            sixMonthTrend: [
              { month: '2026-04', revenue: 2400 }, { month: '2026-05', revenue: 2600 }, { month: '2026-06', revenue: 2750 },
              { month: '2026-07', revenue: 2820 }, { month: '2026-08', revenue: 2950 }, { month: '2026-09', revenue: 3480 },
            ],
          },
          {
            name: 'Buffalo', revenue: 4500, orders: 110, units: 165, customers: 78, growth: '+5%',
            subscribers: 52, activeSubs: 46, unsubs: 6, subRetention: 88, activeRate: 88,
            delivered: 100, inTransit: 7, cancelled: 3, avgOrder: 41,
            bestSeller: 'Buffalo Wing Sauce', categoriesSold: 8, salesGrowth: '+5%',
            newCustomers: 20, repeatCustomers: 58, retentionRate: 74, revPerCustomer: 58,
            topProducts: [
              { name: 'Buffalo Wing Sauce', category: 'Condiments', revenue: 720, share: 16 },
              { name: 'Maple Syrup', category: 'Sweeteners', revenue: 585, share: 13 },
              { name: 'Bagel Seasoning', category: 'Spices', revenue: 495, share: 11 },
              { name: 'NY Cheesecake Mix', category: 'Baking', revenue: 405, share: 9 },
              { name: 'Everything Bagel Chips', category: 'Snacks', revenue: 315, share: 7 },
            ],
            poorProducts: [
              { name: 'Pumpkin Spice', category: 'Spices', revenue: 22, status: 'Low Demand' },
              { name: 'Apple Cider Vinegar', category: 'Pantry', revenue: 28, status: 'Slow Moving' },
              { name: 'Dried Cranberries', category: 'Dry Fruits', revenue: 18, status: 'Declining' },
              { name: 'Corn Chowder Mix', category: 'Soups', revenue: 16, status: 'Low Demand' },
              { name: 'Clam Chowder Mix', category: 'Soups', revenue: 14, status: 'Overstocked' },
            ],
            lowStock: [{ name: 'Buffalo Wing Sauce', qty: 3 }, { name: 'Maple Syrup', qty: 3 }],
            highStock: [{ name: 'Oat Milk', qty: 30 }, { name: 'Quinoa', qty: 25 }],
            totalStockUnits: 210,
            sixMonthTrend: [
              { month: '2026-04', revenue: 630 }, { month: '2026-05', revenue: 680 }, { month: '2026-06', revenue: 730 },
              { month: '2026-07', revenue: 750 }, { month: '2026-08', revenue: 780 }, { month: '2026-09', revenue: 930 },
            ],
          },
          {
            name: 'Rochester', revenue: 2500, orders: 62, units: 93, customers: 44, growth: '+4%',
            subscribers: 30, activeSubs: 27, unsubs: 3, subRetention: 90, activeRate: 90,
            delivered: 56, inTransit: 4, cancelled: 2, avgOrder: 40,
            bestSeller: 'NY Cheesecake Mix', categoriesSold: 7, salesGrowth: '+4%',
            newCustomers: 11, repeatCustomers: 33, retentionRate: 75, revPerCustomer: 57,
            topProducts: [
              { name: 'NY Cheesecake Mix', category: 'Baking', revenue: 400, share: 16 },
              { name: 'Maple Syrup', category: 'Sweeteners', revenue: 325, share: 13 },
              { name: 'Bagel Seasoning', category: 'Spices', revenue: 275, share: 11 },
              { name: 'Everything Bagel Chips', category: 'Snacks', revenue: 225, share: 9 },
              { name: 'NY Pizza Sauce', category: 'Condiments', revenue: 175, share: 7 },
            ],
            poorProducts: [
              { name: 'Pumpkin Spice', category: 'Spices', revenue: 12, status: 'Low Demand' },
              { name: 'Apple Cider Vinegar', category: 'Pantry', revenue: 16, status: 'Slow Moving' },
              { name: 'Dried Cranberries', category: 'Dry Fruits', revenue: 10, status: 'Declining' },
              { name: 'Corn Chowder Mix', category: 'Soups', revenue: 9, status: 'Low Demand' },
              { name: 'Clam Chowder Mix', category: 'Soups', revenue: 8, status: 'Overstocked' },
            ],
            lowStock: [{ name: 'NY Cheesecake Mix', qty: 2 }, { name: 'Maple Syrup', qty: 2 }],
            highStock: [{ name: 'Oat Milk', qty: 18 }, { name: 'Quinoa', qty: 15 }],
            totalStockUnits: 120,
            sixMonthTrend: [
              { month: '2026-04', revenue: 350 }, { month: '2026-05', revenue: 380 }, { month: '2026-06', revenue: 410 },
              { month: '2026-07', revenue: 420 }, { month: '2026-08', revenue: 440 }, { month: '2026-09', revenue: 500 },
            ],
          },
          {
            name: 'Yonkers', revenue: 1300, orders: 32, units: 48, customers: 22, growth: '+3%',
            subscribers: 16, activeSubs: 14, unsubs: 2, subRetention: 88, activeRate: 88,
            delivered: 29, inTransit: 2, cancelled: 1, avgOrder: 41,
            bestSeller: 'Everything Bagel Chips', categoriesSold: 6, salesGrowth: '+3%',
            newCustomers: 6, repeatCustomers: 16, retentionRate: 73, revPerCustomer: 59,
            topProducts: [
              { name: 'Everything Bagel Chips', category: 'Snacks', revenue: 208, share: 16 },
              { name: 'Maple Syrup', category: 'Sweeteners', revenue: 169, share: 13 },
              { name: 'Bagel Seasoning', category: 'Spices', revenue: 143, share: 11 },
              { name: 'NY Cheesecake Mix', category: 'Baking', revenue: 117, share: 9 },
              { name: 'NY Pizza Sauce', category: 'Condiments', revenue: 91, share: 7 },
            ],
            poorProducts: [
              { name: 'Pumpkin Spice', category: 'Spices', revenue: 6, status: 'Low Demand' },
              { name: 'Apple Cider Vinegar', category: 'Pantry', revenue: 8, status: 'Slow Moving' },
              { name: 'Dried Cranberries', category: 'Dry Fruits', revenue: 5, status: 'Declining' },
              { name: 'Corn Chowder Mix', category: 'Soups', revenue: 5, status: 'Low Demand' },
              { name: 'Clam Chowder Mix', category: 'Soups', revenue: 4, status: 'Overstocked' },
            ],
            lowStock: [{ name: 'Everything Bagel Chips', qty: 1 }, { name: 'Maple Syrup', qty: 1 }],
            highStock: [{ name: 'Oat Milk', qty: 10 }, { name: 'Quinoa', qty: 8 }],
            totalStockUnits: 65,
            sixMonthTrend: [
              { month: '2026-04', revenue: 180 }, { month: '2026-05', revenue: 195 }, { month: '2026-06', revenue: 210 },
              { month: '2026-07', revenue: 215 }, { month: '2026-08', revenue: 225 }, { month: '2026-09', revenue: 275 },
            ],
          },
          {
            name: 'Syracuse', revenue: 700, orders: 18, units: 27, customers: 12, growth: '+2%',
            subscribers: 8, activeSubs: 7, unsubs: 1, subRetention: 88, activeRate: 88,
            delivered: 16, inTransit: 1, cancelled: 1, avgOrder: 39,
            bestSeller: 'NY Pizza Sauce', categoriesSold: 5, salesGrowth: '+2%',
            newCustomers: 3, repeatCustomers: 9, retentionRate: 75, revPerCustomer: 58,
            topProducts: [
              { name: 'NY Pizza Sauce', category: 'Condiments', revenue: 112, share: 16 },
              { name: 'Maple Syrup', category: 'Sweeteners', revenue: 91, share: 13 },
              { name: 'Bagel Seasoning', category: 'Spices', revenue: 77, share: 11 },
              { name: 'NY Cheesecake Mix', category: 'Baking', revenue: 63, share: 9 },
              { name: 'Everything Bagel Chips', category: 'Snacks', revenue: 49, share: 7 },
            ],
            poorProducts: [
              { name: 'Pumpkin Spice', category: 'Spices', revenue: 3, status: 'Low Demand' },
              { name: 'Apple Cider Vinegar', category: 'Pantry', revenue: 4, status: 'Slow Moving' },
              { name: 'Dried Cranberries', category: 'Dry Fruits', revenue: 3, status: 'Declining' },
              { name: 'Corn Chowder Mix', category: 'Soups', revenue: 2, status: 'Low Demand' },
              { name: 'Clam Chowder Mix', category: 'Soups', revenue: 2, status: 'Overstocked' },
            ],
            lowStock: [{ name: 'NY Pizza Sauce', qty: 1 }],
            highStock: [{ name: 'Oat Milk', qty: 5 }],
            totalStockUnits: 35,
            sixMonthTrend: [
              { month: '2026-04', revenue: 95 }, { month: '2026-05', revenue: 105 }, { month: '2026-06', revenue: 115 },
              { month: '2026-07', revenue: 118 }, { month: '2026-08', revenue: 123 }, { month: '2026-09', revenue: 144 },
            ],
          },
        ],
      },
    ],
  },
};

export interface DemoNote {
  id: string;
  userId: string;
  text: string;
  at: string;
}

export const DEMO_NOTES: DemoNote[] = [
  { id: 'demo-note-1', userId: 'demo-cust-IN-0', text: 'Prefers evening delivery slots.', at: '2026-07-20T00:00:00' },
  { id: 'demo-note-2', userId: 'demo-cust-IN-2', text: 'VIP customer â€” handle complaints on priority.', at: '2026-07-22T00:00:00' },
  { id: 'demo-note-3', userId: 'demo-cust-IN-1', text: 'Requested organic-only product recommendations.', at: '2026-08-01T00:00:00' },
  { id: 'demo-note-4', userId: 'demo-cust-IN-3', text: 'Bulk buyer â€” orders 20kg+ monthly.', at: '2026-08-05T00:00:00' },
  { id: 'demo-note-5', userId: 'demo-cust-SG-0', text: 'Lives in Tampines, prefers morning delivery.', at: '2026-07-25T00:00:00' },
  { id: 'demo-note-6', userId: 'demo-cust-US-0', text: 'New York customer, prefers express shipping.', at: '2026-08-10T00:00:00' },
  { id: 'demo-note-7', userId: 'demo-cust-AE-0', text: 'Dubai customer, prefers evening delivery.', at: '2026-08-12T00:00:00' },
];

export interface DemoUserAddress {
  id: string;
  userId: string;
  label: string;
  line: string;
  city: string;
}

export const DEMO_USER_ADDRESSES: DemoUserAddress[] = [
  { id: 'demo-addr-1', userId: 'demo-cust-IN-0', label: 'Home', line: '14 Rosewood Apartments', city: 'Mumbai' },
  { id: 'demo-addr-2', userId: 'demo-cust-IN-0', label: 'Work', line: '8 Business Park', city: 'Mumbai' },
  { id: 'demo-addr-3', userId: 'demo-cust-IN-1', label: 'Home', line: '22 Anna Salai', city: 'Chennai' },
  { id: 'demo-addr-4', userId: 'demo-cust-IN-2', label: 'Home', line: '5 Connaught Place', city: 'Delhi' },
  { id: 'demo-addr-5', userId: 'demo-cust-IN-2', label: 'Work', line: 'DLF Cyber City, Tower B', city: 'Delhi' },
  { id: 'demo-addr-6', userId: 'demo-cust-IN-3', label: 'Home', line: '31 MG Road', city: 'Bengaluru' },
  { id: 'demo-addr-7', userId: 'demo-cust-IN-4', label: 'Home', line: '7 Jubilee Hills', city: 'Hyderabad' },
  { id: 'demo-addr-8', userId: 'demo-cust-SG-0', label: 'Home', line: 'Blk 123 Tampines St', city: 'Tampines' },
  { id: 'demo-addr-9', userId: 'demo-cust-SG-1', label: 'Home', line: '28 Jurong West Ave', city: 'Jurong' },
  { id: 'demo-addr-10', userId: 'demo-cust-SG-2', label: 'Home', line: '15 Bedok Reservoir Rd', city: 'Bedok' },
  { id: 'demo-addr-11', userId: 'demo-cust-US-0', label: 'Home', line: '42 Broadway, Apt 12', city: 'New York' },
  { id: 'demo-addr-12', userId: 'demo-cust-US-1', label: 'Home', line: '88 Michigan Ave', city: 'Chicago' },
  { id: 'demo-addr-13', userId: 'demo-cust-AE-0', label: 'Home', line: '15 Sheikh Zayed Rd', city: 'Dubai' },
  { id: 'demo-addr-14', userId: 'demo-cust-AE-1', label: 'Home', line: '32 Corniche Rd', city: 'Abu Dhabi' },
];

export interface DemoSession {
  id: string;
  country: string;
  device: string;
  location: string;
  time: string;
  current: boolean;
}

export const DEMO_SESSIONS: DemoSession[] = [
  { id: 'demo-sess-1', country: 'india', device: 'Chrome on Windows', location: 'Mumbai, India', time: 'Today, 9:15 AM', current: true },
  { id: 'demo-sess-2', country: 'india', device: 'Galaxy S24', location: 'Mumbai, India', time: 'Yesterday, 6:30 PM', current: false },
  { id: 'demo-sess-3', country: 'uae', device: 'iPhone 14 Pro', location: 'Dubai, UAE', time: 'Today, 8:00 AM', current: true },
  { id: 'demo-sess-4', country: 'singapore', device: 'MacBook Air', location: 'Singapore', time: 'Today, 10:20 AM', current: true },
  { id: 'demo-sess-5', country: 'us', device: 'MacBook Pro', location: 'New York, US', time: 'Today, 7:45 AM', current: true },
];

export interface DemoPrefs {
  country: string;  emailToggles: Record<string, boolean>;
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

export const DEMO_PREFS: DemoPrefs[] = [
  { country: 'india', emailToggles: { orders: true, tickets: true, users: false, stock: true, payments: true, system: false }, digest: 'Daily', quietFrom: '22:00', quietTo: '07:00', language: 'English', timezone: 'Asia/Kolkata', dateFormat: 'DD/MM/YYYY', currency: 'INR', weight: 'kg', theme: 'Light', density: 'Comfortable', twoFA: true },
  { country: 'uae', emailToggles: { orders: true, tickets: true, users: false, stock: true, payments: true, system: false }, digest: 'Daily', quietFrom: '22:00', quietTo: '07:00', language: 'English', timezone: 'Asia/Dubai', dateFormat: 'DD/MM/YYYY', currency: 'AED', weight: 'kg', theme: 'Light', density: 'Comfortable', twoFA: false },
  { country: 'us', emailToggles: { orders: true, tickets: false, users: false, stock: true, payments: true, system: false }, digest: 'Weekly', quietFrom: '22:00', quietTo: '07:00', language: 'English', timezone: 'America/New_York', dateFormat: 'MM/DD/YYYY', currency: 'USD', weight: 'lb', theme: 'Light', density: 'Comfortable', twoFA: false },
  { country: 'singapore', emailToggles: { orders: true, tickets: true, users: true, stock: true, payments: true, system: true }, digest: 'Daily', quietFrom: '22:00', quietTo: '07:00', language: 'English', timezone: 'Asia/Singapore', dateFormat: 'DD/MM/YYYY', currency: 'SGD', weight: 'kg', theme: 'Light', density: 'Comfortable', twoFA: true },
];

/* â”€â”€ Reports & Analytics: Customers / Inventory / Subscribers demo data â”€â”€ */

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

export const DEMO_REPORTS: Record<string, DemoReportOverview> = {
  india: {
    totalUsers: 2456, activeUsers: 2189, activeRate: 89.1,
    newSignups: 267, newSignupsGrowth: '+22%',
    retentionRate: 89.1, retentionGrowth: '+2.1%',
    monthlyGrowth: [
      { month: 'Feb', users: 1540 }, { month: 'Mar', users: 1702 }, { month: 'Apr', users: 1890 },
      { month: 'May', users: 2098 }, { month: 'Jun', users: 2289 }, { month: 'Jul', users: 2456 },
    ],
    newVsReturning: { newPct: 58, returningPct: 42 },
    customerList: [
      { name: 'Priya Sharma', email: 'priya@email.com', orders: 18, spent: 89400, joined: 'Jan 2026', status: 'Active' },
      { name: 'Rahul Patel', email: 'rahul@email.com', orders: 14, spent: 67200, joined: 'Feb 2026', status: 'Active' },
      { name: 'Anjali Singh', email: 'anjali@email.com', orders: 22, spent: 112500, joined: 'Dec 2025', status: 'Active' },
      { name: 'Vikram Kumar', email: 'vikram@email.com', orders: 9, spent: 45600, joined: 'Mar 2026', status: 'Inactive' },
      { name: 'Deepa Nair', email: 'deepa@email.com', orders: 16, spent: 78300, joined: 'Jan 2026', status: 'Active' },
    ],
    inventoryStatus: [
      { product: 'Organic Potatoes', category: 'Vegetables', stock: 320, sold: 1245, status: 'In Stock' },
      { product: 'Fresh Mangoes', category: 'Fruits', stock: 180, sold: 987, status: 'In Stock' },
      { product: 'Green Chilli', category: 'Vegetables', stock: 28, sold: 654, status: 'Low Stock' },
      { product: 'Fresh Milk', category: 'Dairy', stock: 150, sold: 543, status: 'In Stock' },
      { product: 'Basmati Rice', category: 'Grains', stock: 0, sold: 432, status: 'Out of Stock' },
    ],
    restockRecs: [
      { product: 'Basmati Rice', current: 0, recommended: 200, priority: 'High' },
      { product: 'Green Chilli', current: 28, recommended: 120, priority: 'Medium' },
      { product: 'Tomatoes', current: 15, recommended: 150, priority: 'Medium' },
      { product: 'Onions', current: 45, recommended: 180, priority: 'Low' },
    ],
  },
  singapore: {
    totalUsers: 1180, activeUsers: 1045, activeRate: 88.6,
    newSignups: 142, newSignupsGrowth: '+18%',
    retentionRate: 86.5, retentionGrowth: '+1.8%',
    monthlyGrowth: [
      { month: 'Feb', users: 720 }, { month: 'Mar', users: 810 }, { month: 'Apr', users: 895 },
      { month: 'May', users: 980 }, { month: 'Jun', users: 1090 }, { month: 'Jul', users: 1180 },
    ],
    newVsReturning: { newPct: 54, returningPct: 46 },
    customerList: [
      { name: 'Jia Hao', email: 'jiahao@email.com', orders: 12, spent: 3400, joined: 'Feb 2026', status: 'Active' },
      { name: 'Mei Lin', email: 'meilin@email.com', orders: 8, spent: 2100, joined: 'Mar 2026', status: 'Active' },
      { name: 'Rajan Nair', email: 'rajan@email.com', orders: 15, spent: 4200, joined: 'Jan 2026', status: 'Active' },
      { name: 'Siti Aminah', email: 'siti@email.com', orders: 6, spent: 1800, joined: 'Apr 2026', status: 'Inactive' },
      { name: 'David Wong', email: 'david@email.com', orders: 10, spent: 2900, joined: 'Feb 2026', status: 'Active' },
    ],
    inventoryStatus: [
      { product: 'Rice Noodles', category: 'Noodles', stock: 280, sold: 890, status: 'In Stock' },
      { product: 'Kaya Jam', category: 'Spreads', stock: 95, sold: 560, status: 'In Stock' },
      { product: 'Laksa Paste', category: 'Condiments', stock: 22, sold: 340, status: 'Low Stock' },
      { product: 'Coconut Milk', category: 'Dairy', stock: 160, sold: 480, status: 'In Stock' },
      { product: 'Satay Sauce', category: 'Condiments', stock: 0, sold: 290, status: 'Out of Stock' },
    ],
    restockRecs: [
      { product: 'Satay Sauce', current: 0, recommended: 100, priority: 'High' },
      { product: 'Laksa Paste', current: 22, recommended: 80, priority: 'Medium' },
      { product: 'Otah', current: 35, recommended: 100, priority: 'Medium' },
      { product: 'Char Kway Teow Mix', current: 50, recommended: 120, priority: 'Low' },
    ],
  },
  uae: {
    totalUsers: 1890, activeUsers: 1650, activeRate: 87.3,
    newSignups: 198, newSignupsGrowth: '+25%',
    retentionRate: 85.2, retentionGrowth: '+3.1%',
    monthlyGrowth: [
      { month: 'Feb', users: 1120 }, { month: 'Mar', users: 1280 }, { month: 'Apr', users: 1410 },
      { month: 'May', users: 1560 }, { month: 'Jun', users: 1740 }, { month: 'Jul', users: 1890 },
    ],
    newVsReturning: { newPct: 55, returningPct: 45 },
    customerList: [
      { name: 'Aisha B', email: 'aisha@email.com', orders: 14, spent: 8900, joined: 'Jan 2026', status: 'Active' },
      { name: 'Mohammed Al', email: 'mohammed@email.com', orders: 11, spent: 6700, joined: 'Feb 2026', status: 'Active' },
      { name: 'Fatima Hassan', email: 'fatima@email.com', orders: 18, spent: 11200, joined: 'Dec 2025', status: 'Active' },
      { name: 'Omar Siddiqui', email: 'omar@email.com', orders: 7, spent: 3400, joined: 'Mar 2026', status: 'Inactive' },
      { name: 'Layla K', email: 'layla@email.com', orders: 12, spent: 7600, joined: 'Jan 2026', status: 'Active' },
    ],
    inventoryStatus: [
      { product: 'Dates Premium', category: 'Dry Fruits', stock: 420, sold: 1560, status: 'In Stock' },
      { product: 'Arabic Coffee', category: 'Beverages', stock: 180, sold: 890, status: 'In Stock' },
      { product: 'Oud Powder', category: 'Incense', stock: 35, sold: 420, status: 'Low Stock' },
      { product: 'Saffron', category: 'Spices', stock: 120, sold: 340, status: 'In Stock' },
      { product: 'Bakhoor Mix', category: 'Incense', stock: 0, sold: 280, status: 'Out of Stock' },
    ],
    restockRecs: [
      { product: 'Bakhoor Mix', current: 0, recommended: 150, priority: 'High' },
      { product: 'Oud Powder', current: 35, recommended: 100, priority: 'Medium' },
      { product: 'Luqaimat Mix', current: 45, recommended: 120, priority: 'Medium' },
      { product: 'Dried Lime', current: 60, recommended: 140, priority: 'Low' },
    ],
  },
  us: {
    totalUsers: 3200, activeUsers: 2850, activeRate: 89.1,
    newSignups: 340, newSignupsGrowth: '+20%',
    retentionRate: 87.8, retentionGrowth: '+2.5%',
    monthlyGrowth: [
      { month: 'Feb', users: 1980 }, { month: 'Mar', users: 2200 }, { month: 'Apr', users: 2450 },
      { month: 'May', users: 2680 }, { month: 'Jun', users: 2950 }, { month: 'Jul', users: 3200 },
    ],
    newVsReturning: { newPct: 52, returningPct: 48 },
    customerList: [
      { name: 'Robert King', email: 'robert@email.com', orders: 16, spent: 4800, joined: 'Jan 2026', status: 'Active' },
      { name: 'Sarah Johnson', email: 'sarah@email.com', orders: 12, spent: 3600, joined: 'Feb 2026', status: 'Active' },
      { name: 'Michael Chen', email: 'michael@email.com', orders: 20, spent: 6200, joined: 'Dec 2025', status: 'Active' },
      { name: 'Emily Davis', email: 'emily@email.com', orders: 8, spent: 2400, joined: 'Mar 2026', status: 'Inactive' },
      { name: 'James Wilson', email: 'james@email.com', orders: 14, spent: 4100, joined: 'Jan 2026', status: 'Active' },
    ],
    inventoryStatus: [
      { product: 'Almond Butter', category: 'Pantry', stock: 340, sold: 1120, status: 'In Stock' },
      { product: 'Avocado Oil', category: 'Oils', stock: 210, sold: 890, status: 'In Stock' },
      { product: 'Organic Granola', category: 'Breakfast', stock: 42, sold: 560, status: 'Low Stock' },
      { product: 'Sourdough Starter', category: 'Baking', stock: 180, sold: 670, status: 'In Stock' },
      { product: 'Kombucha SCOBY', category: 'Beverages', stock: 0, sold: 340, status: 'Out of Stock' },
    ],
    restockRecs: [
      { product: 'Kombucha SCOBY', current: 0, recommended: 100, priority: 'High' },
      { product: 'Organic Granola', current: 42, recommended: 120, priority: 'Medium' },
      { product: 'Pecan Pie Mix', current: 38, recommended: 100, priority: 'Medium' },
      { product: 'Maple Syrup', current: 55, recommended: 130, priority: 'Low' },
    ],
  },
};
