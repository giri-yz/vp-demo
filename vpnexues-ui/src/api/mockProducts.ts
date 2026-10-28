import type { Product, PageResponse, Cart, CartItem, BoxSummary, CountryCode } from '../types';
import { matchesRecipeCatalog } from '../utils/recipeSearch';

interface MockProduct {
  id: number;
  name: string;
  slug: string;
  category: string;
  description: string | null;
  unit: string;
  sku: string;
  imageUrl: string;
  badges: string[];
  prices: Partial<Record<CountryCode, { price: number; oldPrice?: number }>>;
}

function toSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

const SUPABASE_PRODUCT_BASE = 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001329/vpnexues';

function toCloudinaryUrl(img: string): string {
  if (!img) return img;
  if (img.startsWith('https://')) return img;
  if (img.startsWith('/images/products/')) {
    const filename = img.replace(/^\/images\/products?\//, '');
    return `${SUPABASE_PRODUCT_BASE}/${encodeURIComponent(filename)}`;
  }
  return img;
}

function mp(
  id: number, name: string, cat: string, unit: string, sku: string, img: string,
  inr: number, inrOld: number | null, sgd: number, sgdOld: number | null
): MockProduct {
  const usd = Math.round(sgd * 0.74 * 100) / 100;
  const aed = Math.round(sgd * 2.72 * 100) / 100;
  const usdOld = sgdOld != null ? Math.round(sgdOld * 0.74 * 100) / 100 : undefined;
  const aedOld = sgdOld != null ? Math.round(sgdOld * 2.72 * 100) / 100 : undefined;
  const cloudUrl = toCloudinaryUrl(img);
  return {
    id, name, slug: toSlug(name), category: cat, description: null, unit, sku, imageUrl: cloudUrl, badges: [],
    prices: {
      IN: { price: inr, ...(inrOld != null ? { oldPrice: inrOld } : {}) },
      SG: { price: sgd, ...(sgdOld != null ? { oldPrice: sgdOld } : {}) },
      US: { price: usd, ...(usdOld != null ? { oldPrice: usdOld } : {}) },
      AE: { price: aed, ...(aedOld != null ? { oldPrice: aedOld } : {}) },
    },
  };
}

const MOCK_PRODUCTS: MockProduct[] = [
  // â”€â”€ VEGETABLES (50 items) â”€â”€
  /* IN prices aligned with the corrected product_price_overrides rows: 40 struck / 30 selling. */
  mp(1,'Vine Tomatoes','Vegetables','per kg','GPNX-002','https://res.cloudinary.com/eqjshlur/image/upload/v1790001329/vpnexues/Vine%20Tomatoes.jpg',30,40,3.90,4.80),
  mp(2,'Organic Carrots','Vegetables','per 500g','GPNX-001','https://res.cloudinary.com/eqjshlur/image/upload/v1790001247/vpnexues/Organic%20Carrots.jpg',45,56,2.80,3.50),
  mp(3,'Red Onions','Vegetables','per kg','GPNX-005','https://res.cloudinary.com/eqjshlur/image/upload/v1790001286/vpnexues/Red%20Onions.jpg',45,56,2.20,2.80),
  mp(4,'Okra / Ladyfinger','Vegetables','per 300g','GPNX-024','https://res.cloudinary.com/eqjshlur/image/upload/v1790001239/vpnexues/Okra%20-%20Ladyfinger.jpg',12,15,2.80,3.50),
  mp(5,'Drumstick (Moringa)','Vegetables','per bunch','GPNX-031','https://res.cloudinary.com/eqjshlur/image/upload/v1790001222/vpnexues/Moringa%20Drumsticks.jpg',15,19,3.50,null),
  mp(6,'Chilli Peppers','Vegetables','per 100g','GPNX-036','https://res.cloudinary.com/eqjshlur/image/upload/v1790001032/vpnexues/Chilli%20Peppers.jpg',5,6,2.10,2.60),
  mp(7,'Snake Gourd','Vegetables','per pc','GPNX-049','https://res.cloudinary.com/eqjshlur/image/upload/v1790001287/vpnexues/Ridge%20Gourd.jpg',13,17,2.90,3.60),
  mp(8,'Bitter Gourd','Vegetables','per 500g','GPNX-028','https://res.cloudinary.com/eqjshlur/image/upload/v1790000995/vpnexues/Bitter%20Gourd%20Organic.jpg',22,28,2.40,3.00),
  mp(9,'Ridge Gourd','Vegetables','per pc','GPNX-047','https://res.cloudinary.com/eqjshlur/image/upload/v1790001287/vpnexues/Ridge%20Gourd.jpg',15,19,2.60,3.20),
  mp(10,'Cauliflower','Vegetables','per pc','GPNX-013','https://res.cloudinary.com/eqjshlur/image/upload/v1790001017/vpnexues/Cauliflower.jpg',35,44,3.90,4.80),
  mp(11,'Bell Peppers Mix','Vegetables','per 3 pcs','GPNX-006','https://res.cloudinary.com/eqjshlur/image/upload/v1790000990/vpnexues/Bell%20Peppers%20Mix.jpg',100,120,4.50,5.80),
  mp(12,'Coriander','Vegetables','per bunch','GPNX-035','https://res.cloudinary.com/eqjshlur/image/upload/v1790001076/vpnexues/Curry%20Leaves.jpg',25,30,1.20,null),
  mp(13,'Green Beans','Vegetables','per 300g','GPNX-016','https://res.cloudinary.com/eqjshlur/image/upload/v1790001163/vpnexues/Green%20Beans.jpg',15,19,2.80,3.40),
  mp(14,'Sweet Potato','Vegetables','per kg','GPNX-015','https://res.cloudinary.com/eqjshlur/image/upload/v1790001313/vpnexues/Sweet%20Potato.jpg',30,38,3.10,3.80),
  mp(15,'Pumpkin','Vegetables','per kg','GPNX-020','https://res.cloudinary.com/eqjshlur/image/upload/v1790001270/vpnexues/Pumpkin.jpg',26,33,4.80,6.00),
  mp(16,'Baby Spinach','Vegetables','per 200g','GPNX-003','https://res.cloudinary.com/eqjshlur/image/upload/v1790000973/vpnexues/Baby%20Spinach.jpg',25,32,3.20,null),
  mp(17,'Sweet Corn','Vegetables','per pc','GPNX-004','https://res.cloudinary.com/eqjshlur/image/upload/v1790001311/vpnexues/Sweet%20Corn.jpg',25,32,1.90,2.50),
  mp(18,'Broccoli Head','Vegetables','per pc','GPNX-007','https://res.cloudinary.com/eqjshlur/image/upload/v1790001000/vpnexues/Broccoli%20Head.jpg',60,75,3.50,4.20),
  mp(19,'Cucumber','Vegetables','per pc','GPNX-008','https://res.cloudinary.com/eqjshlur/image/upload/v1790001067/vpnexues/Cucumber.jpg',15,20,1.80,null),
  mp(20,'Zucchini','Vegetables','per 500g','GPNX-009','https://res.cloudinary.com/eqjshlur/image/upload/v1790001347/vpnexues/Zucchini.jpg',35,44,2.90,3.60),
  /* IN prices aligned with the corrected product_price_overrides rows: 50 struck / 39 selling. */
  mp(21,'Cherry Tomatoes','Vegetables','per 250g','GPNX-010','https://res.cloudinary.com/eqjshlur/image/upload/v1790001025/vpnexues/Cherry%20Tomatoes.jpg',49,50,4.20,5.00),
  mp(22,'Kale Bunch','Vegetables','per bunch','GPNX-011','https://res.cloudinary.com/eqjshlur/image/upload/v1790001192/vpnexues/Kale%20Bunch.jpg',25,32,3.80,null),
  mp(23,'Purple Cabbage','Vegetables','per pc','GPNX-012','https://res.cloudinary.com/eqjshlur/image/upload/v1790001272/vpnexues/Purple%20Cabbage.jpg',35,44,3.20,4.00),
  mp(24,'White Radish','Vegetables','per kg','GPNX-014','https://res.cloudinary.com/eqjshlur/image/upload/v1790001336/vpnexues/White%20Radish.jpg',35,44,2.50,null),
  mp(25,'Leek','Vegetables','per 2 pcs','GPNX-017','https://res.cloudinary.com/eqjshlur/image/upload/v1790001200/vpnexues/Leek.jpg',20,25,2.90,null),
  mp(26,'Beetroot','Vegetables','per kg','GPNX-018','https://res.cloudinary.com/eqjshlur/image/upload/v1790000988/vpnexues/Beetroot.jpg',35,44,3.50,4.20),
  mp(27,'Celery','Vegetables','per bunch','GPNX-019','https://res.cloudinary.com/eqjshlur/image/upload/v1790001019/vpnexues/Celery.jpg',15,20,2.40,null),
  mp(28,'Eggplant','Vegetables','per pc','GPNX-021','https://res.cloudinary.com/eqjshlur/image/upload/v1790001096/vpnexues/Eggplant.jpg',25,32,2.60,3.20),
  mp(29,'Asparagus','Vegetables','per bunch','GPNX-022','https://res.cloudinary.com/eqjshlur/image/upload/v1790000971/vpnexues/Asparagus.jpg',120,150,5.90,7.50),
  mp(30,'Pak Choi','Vegetables','per bunch','GPNX-023','https://res.cloudinary.com/eqjshlur/image/upload/v1790001251/vpnexues/Pak%20Choi.jpg',20,25,2.20,null),
  mp(31,'Spring Onions','Vegetables','per bunch','GPNX-025','https://res.cloudinary.com/eqjshlur/image/upload/v1790001303/vpnexues/Spring%20Onions%20Fresh.jpg',15,20,1.50,null),
  mp(32,'Coriander','Vegetables','per bunch','GPNX-026','https://res.cloudinary.com/eqjshlur/image/upload/v1790001132/vpnexues/Fresh%20Mint.jpg',12,15,1.20,null),
  mp(33,'Mint Leaves','Vegetables','per bunch','GPNX-027','https://res.cloudinary.com/eqjshlur/image/upload/v1790001217/vpnexues/Mint%20Leaves.jpg',12,15,1.50,null),
  mp(34,'Long Beans','Vegetables','per 300g','GPNX-029','https://res.cloudinary.com/eqjshlur/image/upload/v1790001344/vpnexues/Yardlong%20Beans.jpg',14,18,2.20,null),
  mp(35,'French Beans','Vegetables','per 250g','GPNX-030','https://res.cloudinary.com/eqjshlur/image/upload/v1790001107/vpnexues/French%20Beans.jpg',20,25,3.20,4.00),
  // GPNX-032: the asset named "Bottle Gourd.jpg" is actually a GREEN CHILLI photo, while
  // "Bitter Gourd.jpg" holds the real bottle gourd shot (mis-named at upload). Use the latter.
  mp(36,'Bottle Gourd','Vegetables','per pc','GPNX-032','https://res.cloudinary.com/eqjshlur/image/upload/v1790000995/vpnexues/Bitter%20Gourd.jpg',20,25,2.60,3.20),
  mp(37,'Taro Root','Vegetables','per kg','GPNX-033','https://res.cloudinary.com/eqjshlur/image/upload/v1790001320/vpnexues/Taro%20Root.jpg',35,44,3.80,4.50),
  mp(38,'Lotus Root','Vegetables','per 500g','GPNX-034','https://res.cloudinary.com/eqjshlur/image/upload/v1790001206/vpnexues/Lotus%20Root.jpg',35,44,4.20,5.00),
  mp(39,'Green Capsicum','Vegetables','per 3 pcs','GPNX-037','https://res.cloudinary.com/eqjshlur/image/upload/v1790000990/vpnexues/Bell%20Peppers%20Mix.jpg',55,70,3.40,4.20),
  mp(40,'Watercress','Vegetables','per bunch','GPNX-038','https://res.cloudinary.com/eqjshlur/image/upload/v1790001332/vpnexues/Watercress.jpg',15,20,2.80,null),
  mp(41,'Yam (Purple)','Vegetables','per kg','GPNX-039','https://res.cloudinary.com/eqjshlur/image/upload/v1790001274/vpnexues/Purple%20Sweet%20Potato.jpg',35,44,4.50,5.50),
  mp(42,'Bitter Melon','Vegetables','per 500g','GPNX-040','https://res.cloudinary.com/eqjshlur/image/upload/v1790000996/vpnexues/Bitter%20Melon.jpg',22,28,2.60,3.20),
  mp(43,'Iceberg Lettuce','Vegetables','per pc','GPNX-041','https://res.cloudinary.com/eqjshlur/image/upload/v1790001182/vpnexues/Iceberg%20Lettuce.jpg',20,25,2.90,null),
  mp(44,'Butterhead Lettuce','Vegetables','per pc','GPNX-042','https://res.cloudinary.com/eqjshlur/image/upload/v1790001063/vpnexues/Cos%20Lettuce.jpg',25,30,3.20,3.90),
  mp(45,'Turnip','Vegetables','per kg','GPNX-043','https://res.cloudinary.com/eqjshlur/image/upload/v1790001152/vpnexues/Fresh%20Turnips.jpg',35,44,2.40,null),
  mp(46,'Fennel Bulb','Vegetables','per pc','GPNX-044','https://res.cloudinary.com/eqjshlur/image/upload/v1790001121/vpnexues/Fresh%20Fennel.jpg',40,50,4.20,5.00),
  mp(47,'Pointed Gourd','Vegetables','per 500g','GPNX-045','https://res.cloudinary.com/eqjshlur/image/upload/v1790001258/vpnexues/Pointed%20Gourd.jpg',20,25,2.80,3.50),
  mp(48,'Cluster Beans','Vegetables','per 300g','GPNX-046','https://res.cloudinary.com/eqjshlur/image/upload/v1790001107/vpnexues/French%20Beans.jpg',11,14,2.50,null),
  mp(49,'Colocasia Leaves','Vegetables','per bunch','GPNX-048','https://res.cloudinary.com/eqjshlur/image/upload/v1790001058/vpnexues/Colocasia%20Leaves.jpg',12,15,2.20,null),
  mp(50,'Banana Flower','Vegetables','per pc','GPNX-050','https://res.cloudinary.com/eqjshlur/image/upload/v1790000978/vpnexues/Banana%20Flower.jpg',6,8,3.50,4.20),

  // â”€â”€ FRUITS (40 items) â”€â”€
  mp(51,'Green Apples','Fruits','per kg','GPNX-054','https://res.cloudinary.com/eqjshlur/image/upload/v1790001162/vpnexues/Green%20Apples.jpg',220,260,5.80,7.20),
  mp(52,'Orange Navel','Fruits','per kg','GPNX-061','https://res.cloudinary.com/eqjshlur/image/upload/v1790001137/vpnexues/Fresh%20Oranges.jpg',62,81,7.80,9.50),
  mp(53,'Red Grapes','Fruits','per 500g','GPNX-059','https://res.cloudinary.com/eqjshlur/image/upload/v1790001283/vpnexues/Red%20Grapes.jpg',100,130,6.50,8.50),
  mp(54,'Pomegranate','Fruits','per 2 pcs','GPNX-056','https://res.cloudinary.com/eqjshlur/image/upload/v1790001145/vpnexues/Fresh%20Pomegranate.jpg',150,180,8.80,11.00),
  mp(55,'Fresh Pineapple','Fruits','per pc','GPNX-057','https://res.cloudinary.com/eqjshlur/image/upload/v1790001142/vpnexues/Fresh%20Pineapple.jpg',40,50,4.20,5.50),
  mp(56,'Guava','Fruits','per 500g','GPNX-067','https://res.cloudinary.com/eqjshlur/image/upload/v1790001126/vpnexues/Fresh%20Guava.jpg',54,70,4.20,5.50),
  mp(57,'Sapodilla (Chiku)','Fruits','per 500g','GPNX-068','https://res.cloudinary.com/eqjshlur/image/upload/v1790001295/vpnexues/Sapodilla.jpg',46,60,3.80,5.00),
  mp(58,'Fresh Bananas','Fruits','per bunch','GPNX-052','https://res.cloudinary.com/eqjshlur/image/upload/v1790001114/vpnexues/Fresh%20Bananas.jpg',40,50,3.20,4.00),
  mp(59,'Kiwi Fruit','Fruits','per 4 pcs','GPNX-063','https://res.cloudinary.com/eqjshlur/image/upload/v1790001193/vpnexues/Kiwi%20Fruit.jpg',120,140,9.50,11.00),
  mp(60,'Rambutan','Fruits','per 500g','GPNX-070','https://res.cloudinary.com/eqjshlur/image/upload/v1790001279/vpnexues/Rambutan.jpg',65,81,5.20,6.50),
  mp(61,'Strawberries','Fruits','per 250g','GPNX-060','https://res.cloudinary.com/eqjshlur/image/upload/v1790001148/vpnexues/Fresh%20Strawberries.jpg',150,180,12.00,15.00),
  mp(62,'Dragon Fruit (White)','Fruits','per pc','GPNX-053','https://res.cloudinary.com/eqjshlur/image/upload/v1790001083/vpnexues/Dragon%20Fruit.jpg',75,90,7.50,9.80),
  mp(63,'Alphonso Mango','Fruits','per 3 pcs','GPNX-051','https://res.cloudinary.com/eqjshlur/image/upload/v1790000963/vpnexues/Alphonso%20Mango.jpg',180,220,12.00,15.00),
  mp(64,'Papaya','Fruits','per kg','GPNX-055','https://res.cloudinary.com/eqjshlur/image/upload/v1790001138/vpnexues/Fresh%20Papaya.jpg',55,70,5.50,7.00),
  mp(65,'Watermelon','Fruits','per pc','GPNX-058','https://res.cloudinary.com/eqjshlur/image/upload/v1790001334/vpnexues/Watermelon.jpg',30,38,3.50,4.50),
  mp(66,'Lemon','Fruits','per 6 pcs','GPNX-062','https://res.cloudinary.com/eqjshlur/image/upload/v1790001129/vpnexues/Fresh%20Lemons.jpg',30,38,2.80,null),
  mp(67,'Ripe Avocado','Fruits','per 2 pcs','GPNX-064','https://res.cloudinary.com/eqjshlur/image/upload/v1790001111/vpnexues/Fresh%20Avocado.jpg',180,220,14.00,17.50),
  mp(68,'Blueberries','Fruits','per 125g','GPNX-065','https://res.cloudinary.com/eqjshlur/image/upload/v1790001115/vpnexues/Fresh%20Blueberries.jpg',200,240,15.00,18.00),
  mp(69,'Passion Fruit','Fruits','per 4 pcs','GPNX-066','https://res.cloudinary.com/eqjshlur/image/upload/v1790001254/vpnexues/Passion%20Fruit.jpg',42,52,3.50,4.50),
  mp(70,'Jackfruit','Fruits','per 500g','GPNX-069','https://res.cloudinary.com/eqjshlur/image/upload/v1790001127/vpnexues/Fresh%20Jackfruit.jpg',30,38,2.80,3.50),
  mp(71,'Longan','Fruits','per 500g','GPNX-071','https://res.cloudinary.com/eqjshlur/image/upload/v1790001203/vpnexues/Longan.jpg',60,80,4.80,6.50),
  mp(72,'Star Fruit','Fruits','per 3 pcs','GPNX-072','https://res.cloudinary.com/eqjshlur/image/upload/v1790001307/vpnexues/Star%20Fruit.jpg',42,60,3.50,5.00),
  mp(73,'Custard Apple','Fruits','per pc','GPNX-073','https://res.cloudinary.com/eqjshlur/image/upload/v1790001079/vpnexues/Custard%20Apple.jpg',55,70,5.80,7.00),
  mp(74,'Pear','Fruits','per kg','GPNX-074','https://res.cloudinary.com/eqjshlur/image/upload/v1790001170/vpnexues/Green%20Pears.jpg',100,130,6.20,8.00),
  mp(75,'Dates Medjool','Fruits','per 250g','GPNX-075','https://res.cloudinary.com/eqjshlur/image/upload/v1790001215/vpnexues/Medjool%20Dates.jpg',150,180,12.50,16.00),
  mp(76,'Fig','Fruits','per 250g','GPNX-076','https://res.cloudinary.com/eqjshlur/image/upload/v1790001122/vpnexues/Fresh%20Figs.jpg',120,145,9.90,12.00),
  mp(77,'Plums','Fruits','per 500g','GPNX-077','https://res.cloudinary.com/eqjshlur/image/upload/v1790001144/vpnexues/Fresh%20Plums.jpg',120,150,7.50,9.00),
  mp(78,'Cherries','Fruits','per 250g','GPNX-078','https://res.cloudinary.com/eqjshlur/image/upload/v1790001117/vpnexues/Fresh%20Cherries.jpg',180,220,14.00,18.00),
  mp(79,'Red Banana','Fruits','per bunch','GPNX-079','https://res.cloudinary.com/eqjshlur/image/upload/v1790001282/vpnexues/Red%20Bananas.jpg',40,50,4.50,5.80),
  mp(80,'Coconut (Fresh)','Fruits','per pc','GPNX-080','https://res.cloudinary.com/eqjshlur/image/upload/v1790001119/vpnexues/Fresh%20Coconut.jpg',22,28,3.50,null),
  mp(81,'Soursop','Fruits','per pc','GPNX-081','https://res.cloudinary.com/eqjshlur/image/upload/v1790001301/vpnexues/Soursop.jpg',50,65,8.90,11.00),
  mp(82,'Peaches','Fruits','per kg','GPNX-082','https://res.cloudinary.com/eqjshlur/image/upload/v1790001140/vpnexues/Fresh%20Peaches.jpg',150,190,8.50,10.50),
  mp(83,'Raspberries','Fruits','per 125g','GPNX-083','https://res.cloudinary.com/eqjshlur/image/upload/v1790001147/vpnexues/Fresh%20Raspberries.jpg',200,240,9.50,12.00),
  mp(84,'Mandarin Oranges','Fruits','per kg','GPNX-084','https://res.cloudinary.com/eqjshlur/image/upload/v1790001210/vpnexues/Mandarin%20Oranges.jpg',62,81,7.80,9.50),
  mp(85,'Tamarind','Fruits','per 250g','GPNX-085','https://res.cloudinary.com/eqjshlur/image/upload/v1790001150/vpnexues/Fresh%20Tamarind.jpg',25,32,3.20,null),
  mp(86,'Grape Fruit','Fruits','per pc','GPNX-086','https://res.cloudinary.com/eqjshlur/image/upload/v1790001159/vpnexues/Grape%20Fruit.jpg',65,80,5.90,7.20),
  mp(87,'Cantaloupe Melon','Fruits','per pc','GPNX-087','https://res.cloudinary.com/eqjshlur/image/upload/v1790001230/vpnexues/Muskmelon.jpg',40,50,6.50,8.00),
  mp(88,'Lychee','Fruits','per 500g','GPNX-088','https://res.cloudinary.com/eqjshlur/image/upload/v1790001131/vpnexues/Fresh%20Lychee.jpg',180,220,8.80,11.00),
  mp(89,'Apricots','Fruits','per 500g','GPNX-089','https://res.cloudinary.com/eqjshlur/image/upload/v1790001109/vpnexues/Fresh%20Apricots.jpg',120,145,9.20,11.00),
  mp(90,'Banana Blossom','Fruits','per pc','GPNX-090','https://res.cloudinary.com/eqjshlur/image/upload/v1790000974/vpnexues/Banana%20Blossom.jpg',20,25,3.90,null),


  // â”€â”€ BEVERAGES (25 items) â”€â”€
  mp(91,'Cold-Pressed Juice Mix','Beverages','per 300ml','GPNX-091','https://res.cloudinary.com/eqjshlur/image/upload/f_auto,q_auto/v1790954701/monika-designs/GPNX-091.png',120,150,8.90,11.00),
  mp(92,'Coconut Water','Beverages','per 500ml','GPNX-092','https://res.cloudinary.com/eqjshlur/image/upload/f_auto,q_auto/v1790954835/monika-designs/GPNX-092.png',80,100,4.50,5.80),
  mp(93,'Turmeric Latte Mix','Beverages','per 300g','GPNX-093','https://res.cloudinary.com/eqjshlur/image/upload/f_auto,q_auto/v1790954776/monika-designs/GPNX-093.png',120,150,8.90,11.00),
  mp(94,'Herbal Green Tea','Beverages','per 300ml','GPNX-094','https://res.cloudinary.com/eqjshlur/image/upload/f_auto,q_auto/v1790954715/monika-designs/GPNX-094.png',90,110,7.20,9.50),
  mp(95,'Sugarcane Juice','Beverages','per 300ml','GPNX-095','https://res.cloudinary.com/eqjshlur/image/upload/f_auto,q_auto/v1790954770/monika-designs/GPNX-095.png',45,56,3.80,null),
  mp(96,'Mango Lassi','Beverages','per 500ml','GPNX-096','https://res.cloudinary.com/eqjshlur/image/upload/f_auto,q_auto/v1790954797/monika-designs/GPNX-096.png',60,75,5.50,null),
  mp(97,'Rose Milk','Beverages','per 500ml','GPNX-097','https://res.cloudinary.com/eqjshlur/image/upload/f_auto,q_auto/v1790954763/monika-designs/GPNX-097.png',45,56,4.20,5.00),
  mp(98,'Nannari Sarbath','Beverages','per 500ml','GPNX-098','https://res.cloudinary.com/eqjshlur/image/upload/f_auto,q_auto/v1790954812/monika-designs/GPNX-098.png',50,62,4.50,5.50),
  mp(99,'Aloe Vera Juice','Beverages','per 500ml','GPNX-099','https://res.cloudinary.com/eqjshlur/image/upload/v1790000960/vpnexues/Aloe%20Vera%20Juice.jpg',75,94,6.80,8.50),
  mp(100,'Tender Coconut Water','Beverages','per 500ml','GPNX-100','https://res.cloudinary.com/eqjshlur/image/upload/v1790001321/vpnexues/Tender%20Coconut%20Water.jpg',30,38,3.50,null),
  mp(101,'Amla Juice','Beverages','per 500ml','GPNX-101','https://res.cloudinary.com/eqjshlur/image/upload/v1790000967/vpnexues/Amla%20Juice.jpg',80,100,5.90,7.50),
  mp(102,'Moringa Tea','Beverages','per 500ml','GPNX-102','https://res.cloudinary.com/eqjshlur/image/upload/f_auto,q_auto/v1790954790/monika-designs/GPNX-102.png',80,100,7.50,9.00),
  mp(103,'Tamarind Drink','Beverages','per 500ml','GPNX-103','https://res.cloudinary.com/eqjshlur/image/upload/f_auto,q_auto/v1790947715/monika-designs/GPNX-103.png',45,56,3.90,null),
  mp(104,'Carrot-Ginger Juice','Beverages','per 500ml','GPNX-104','https://res.cloudinary.com/eqjshlur/image/upload/v1790001012/vpnexues/Carrot-Ginger%20Juice.jpg',60,75,5.20,6.50),
  mp(105,'Hibiscus Iced Tea','Beverages','per 500ml','GPNX-105','https://res.cloudinary.com/eqjshlur/image/upload/f_auto,q_auto/v1790954847/monika-designs/GPNX-105.png',85,105,6.20,7.80),
  mp(106,'Vetiver Cooler','Beverages','per 500ml','GPNX-106','https://res.cloudinary.com/eqjshlur/image/upload/f_auto,q_auto/v1790954783/monika-designs/GPNX-106.png',55,70,4.80,null),
  mp(107,'Barley Water','Beverages','per 500ml','GPNX-107','https://res.cloudinary.com/eqjshlur/image/upload/v1790000981/vpnexues/Barley%20Water.jpg',50,62,4.20,5.00),
  mp(108,'Kokum Sherbet','Beverages','per 500ml','GPNX-108','https://res.cloudinary.com/eqjshlur/image/upload/f_auto,q_auto/v1790954741/monika-designs/GPNX-108.png',65,80,4.90,6.00),
  mp(109,'Jamun Juice','Beverages','per 500ml','GPNX-109','https://res.cloudinary.com/eqjshlur/image/upload/f_auto,q_auto/v1790954728/monika-designs/GPNX-109.png',80,100,6.50,8.00),
  mp(110,'Pineapple Vinegar','Beverages','per 500ml','GPNX-110','https://res.cloudinary.com/eqjshlur/image/upload/f_auto,q_auto/v1790954821/monika-designs/GPNX-110.png',120,150,9.50,12.00),
  mp(185,'Masala Chai','Beverages','per 500ml','GPNX-185','https://res.cloudinary.com/eqjshlur/image/upload/f_auto,q_auto/v1790947588/monika-designs/GPNX-185.png',340,425,5.50,null),
  mp(186,'Fresh Orange Juice','Beverages','per 500ml','GPNX-186','https://res.cloudinary.com/eqjshlur/image/upload/f_auto,q_auto/v1790954708/monika-designs/GPNX-186.png',280,350,4.50,null),
  mp(187,'Iced Coffee','Beverages','per 500ml','GPNX-187','https://res.cloudinary.com/eqjshlur/image/upload/f_auto,q_auto/v1790954721/monika-designs/GPNX-187.png',365,455,5.90,null),
  mp(188,'Jasmine Green Tea','Beverages','per 300ml','GPNX-188','https://res.cloudinary.com/eqjshlur/image/upload/f_auto,q_auto/v1790954735/monika-designs/GPNX-188.png',90,110,6.90,null),
  mp(189,'Protein Shake','Beverages','per 500ml','GPNX-189','https://res.cloudinary.com/eqjshlur/image/upload/f_auto,q_auto/v1790954756/monika-designs/GPNX-189.png',465,580,7.50,null),

  // â”€â”€ GROCERIES (44 items) â”€â”€
  mp(111,'Basmati Rice','Groceries','per 2kg','GPNX-111','https://res.cloudinary.com/eqjshlur/image/upload/vpnexues/groceries/basmati-rice.jpg',250,300,9.80,12.50),
  mp(112,'Cold-Pressed Coconut Oil','Groceries','per 500ml','GPNX-112','https://res.cloudinary.com/eqjshlur/image/upload/vpnexues/groceries/cold-pressed-coconut-oil.jpg',450,550,14.50,18.00),
  mp(113,'Garlic Bulbs','Groceries','per 250g','GPNX-113','https://res.cloudinary.com/eqjshlur/image/upload/vpnexues/groceries/garlic-bulbs.jpg',150,180,3.90,5.00),
  mp(114,'Free Range Eggs','Groceries','per 12 pcs','GPNX-114','https://res.cloudinary.com/eqjshlur/image/upload/v1790001104/vpnexues/Free%20Range%20Eggs.jpg',220,265,6.50,8.00),
  mp(115,'Moringa Powder','Groceries','per 150g','GPNX-115','https://res.cloudinary.com/eqjshlur/image/upload/vpnexues/groceries/moringa-powder.jpg',350,420,11.00,14.00),
  mp(116,'Chickpeas','Groceries','per 500g','GPNX-116','https://res.cloudinary.com/eqjshlur/image/upload/vpnexues/groceries/chickpeas.jpg',120,150,5.20,null),
  mp(117,'Red Lentils (Masoor)','Groceries','per 500g','GPNX-117','https://res.cloudinary.com/eqjshlur/image/upload/vpnexues/groceries/red-lentils-%28masoor%29.jpg',110,130,4.80,6.00),
  mp(118,'Yellow Lentils (Toor)','Groceries','per 500g','GPNX-118','https://res.cloudinary.com/eqjshlur/image/upload/vpnexues/groceries/yellow-lentils.jpg',120,150,5.50,7.00),
  mp(119,'Whole Black Pepper','Groceries','per 100g','GPNX-119','https://res.cloudinary.com/eqjshlur/image/upload/vpnexues/groceries/whole-black-pepper.jpg',300,380,6.80,8.50),
  mp(120,'Turmeric Powder','Groceries','per 200g','GPNX-120','https://res.cloudinary.com/eqjshlur/image/upload/vpnexues/groceries/turmeric-powder.jpg',150,180,4.20,5.50),
  mp(121,'Cumin Seeds','Groceries','per 100g','GPNX-121','https://res.cloudinary.com/eqjshlur/image/upload/vpnexues/groceries/cumin-seeds.jpg',120,150,3.80,null),
  mp(122,'Coriander Seeds','Groceries','per 100g','GPNX-122','https://res.cloudinary.com/eqjshlur/image/upload/vpnexues/groceries/coriander-seeds.jpg',100,120,3.50,null),
  mp(123,'Cardamom (Green)','Groceries','per 50g','GPNX-123','https://res.cloudinary.com/eqjshlur/image/upload/vpnexues/groceries/cardamom-%28green%29.jpg',600,750,8.90,11.00),
  mp(124,'Cinnamon Sticks','Groceries','per 50g','GPNX-124','https://res.cloudinary.com/eqjshlur/image/upload/vpnexues/groceries/cinnamon-sticks.jpg',200,260,5.20,6.50),
  mp(125,'Cloves','Groceries','per 50g','GPNX-125','https://res.cloudinary.com/eqjshlur/image/upload/vpnexues/groceries/cloves.jpg',400,500,6.50,8.00),
  mp(126,'Sesame Seeds (White)','Groceries','per 250g','GPNX-126','https://res.cloudinary.com/eqjshlur/image/upload/vpnexues/groceries/sesame-seeds-%28white%29.jpg',120,150,4.20,null),
  mp(127,'Mustard Seeds','Groceries','per 200g','GPNX-127','https://res.cloudinary.com/eqjshlur/image/upload/vpnexues/groceries/mustard-seeds.jpg',80,100,2.80,null),
  mp(128,'Fenugreek Seeds','Groceries','per 200g','GPNX-128','https://res.cloudinary.com/eqjshlur/image/upload/vpnexues/groceries/fenugreek-seeds.jpg',90,110,3.20,null),
  mp(129,'Groundnut Oil','Groceries','per 1L','GPNX-129','https://res.cloudinary.com/eqjshlur/image/upload/vpnexues/groceries/groundnut-oil.jpg',450,560,12.50,15.00),
  mp(130,'Jaggery (Cane)','Groceries','per 500g','GPNX-130','https://res.cloudinary.com/eqjshlur/image/upload/vpnexues/groceries/jaggery-%28cane%29.jpg',120,150,4.90,6.00),
  mp(131,'Honey (Raw Wildflower)','Groceries','per 500g','GPNX-131','https://res.cloudinary.com/eqjshlur/image/upload/vpnexues/groceries/honey.jpg',650,800,14.90,18.00),
  mp(132,'Ghee (Cow Milk)','Groceries','per 500g','GPNX-132','https://res.cloudinary.com/eqjshlur/image/upload/vpnexues/groceries/ghee-%28cow-milk%29-jar.jpg',800,950,18.00,22.00),
  mp(133,'Tapioca Flour','Groceries','per 500g','GPNX-133','https://res.cloudinary.com/eqjshlur/image/upload/vpnexues/groceries/tapioca-flour.jpg',150,180,4.50,null),
  mp(134,'Ragi Flour (Millet)','Groceries','per 500g','GPNX-134','https://res.cloudinary.com/eqjshlur/image/upload/vpnexues/groceries/ragi-flour-%28millet%29.jpg',200,250,5.80,7.20),
  mp(135,'Quinoa','Groceries','per 500g','GPNX-135','https://res.cloudinary.com/eqjshlur/image/upload/vpnexues/groceries/quinoa.jpg',120,150,11.90,15.00),
  mp(136,'Oats (Rolled)','Groceries','per 500g','GPNX-136','https://res.cloudinary.com/eqjshlur/image/upload/vpnexues/groceries/oats-%28rolled%29.jpg',150,180,6.50,null),
  mp(137,'Almonds','Groceries','per 250g','GPNX-137','https://res.cloudinary.com/eqjshlur/image/upload/vpnexues/groceries/almonds.jpg',180,220,15.90,19.00),
  mp(138,'Cashew Nuts','Groceries','per 250g','GPNX-138','https://res.cloudinary.com/eqjshlur/image/upload/vpnexues/groceries/cashew-nuts.jpg',400,500,14.50,18.00),
  mp(139,'Walnut Kernels','Groceries','per 250g','GPNX-139','https://res.cloudinary.com/eqjshlur/image/upload/vpnexues/groceries/walnut-kernels.jpg',300,380,16.90,20.00),
  mp(140,'Flaxseeds','Groceries','per 250g','GPNX-140','https://res.cloudinary.com/eqjshlur/image/upload/vpnexues/groceries/flaxseeds.jpg',350,450,4.80,6.00),
  mp(141,'Chia Seeds','Groceries','per 250g','GPNX-141','https://res.cloudinary.com/eqjshlur/image/upload/vpnexues/groceries/chia-seeds.jpg',120,150,7.90,9.50),
  mp(142,'Sunflower Seeds','Groceries','per 250g','GPNX-142','https://res.cloudinary.com/eqjshlur/image/upload/vpnexues/groceries/sunflower-seeds.jpg',150,180,4.50,null),
  mp(143,'Pumpkin Seeds','Groceries','per 250g','GPNX-143','https://res.cloudinary.com/eqjshlur/image/upload/vpnexues/groceries/pumpkin-seeds.jpg',180,220,6.80,8.50),
  mp(144,'Dry Red Chilli','Groceries','per 100g','GPNX-144','https://res.cloudinary.com/eqjshlur/image/upload/vpnexues/groceries/dry-red-chilli.jpg',150,180,3.50,4.50),
  mp(145,'Star Anise','Groceries','per 50g','GPNX-145','https://res.cloudinary.com/eqjshlur/image/upload/vpnexues/groceries/star-anise.jpg',200,250,4.90,null),
  mp(146,'Dried Mango Powder','Groceries','per 100g','GPNX-146','https://res.cloudinary.com/eqjshlur/image/upload/vpnexues/groceries/dried-mango-powder.jpg',80,100,5.20,6.50),
  mp(147,'Tamarind Paste','Groceries','per 200g','GPNX-147','https://res.cloudinary.com/eqjshlur/image/upload/vpnexues/groceries/tamarind-paste.jpg',120,150,3.90,4.80),
  mp(148,'Coconut Milk','Groceries','per 400ml','GPNX-148','https://res.cloudinary.com/eqjshlur/image/upload/vpnexues/groceries/coconut-milk-can.jpg',300,380,4.20,5.50),
  mp(149,'Brown Rice','Groceries','per 2kg','GPNX-149','https://res.cloudinary.com/eqjshlur/image/upload/vpnexues/groceries/brown-rice.jpg',80,100,8.90,11.00),
  mp(150,'Mung Beans (Green)','Groceries','per 500g','GPNX-150','https://res.cloudinary.com/eqjshlur/image/upload/vpnexues/groceries/mung-beans-%28green%29.jpg',100,120,4.50,5.80),
  mp(151,'Dried Chilli Flakes','Groceries','per 100g','GPNX-151','https://res.cloudinary.com/eqjshlur/image/upload/vpnexues/groceries/dried-chilli-flakes.jpg',120,150,3.20,null),
  mp(152,'Dried Fenugreek Leaves','Groceries','per 100g','GPNX-152','https://res.cloudinary.com/eqjshlur/image/upload/vpnexues/groceries/dried-fenugreek-leaves-%28kasuri-methi%29.jpg',90,110,4.20,5.20),
  mp(153,'Asafoetida (Hing)','Groceries','per 50g','GPNX-153','https://res.cloudinary.com/eqjshlur/image/upload/vpnexues/groceries/asafoetida-%28hing%29.jpg',80,100,5.50,null),
  mp(154,'Dried Coconut (Kopra)','Groceries','per 500g','GPNX-154','https://res.cloudinary.com/eqjshlur/image/upload/vpnexues/groceries/dried-coconut-%28copra%29.jpg',120,150,6.80,8.50),

  // â”€â”€ BOX EXTRA FRUITS (14 items) â”€â”€
  mp(156,'Pomelo','Fruits','per pc','GPNX-156','https://res.cloudinary.com/eqjshlur/image/upload/v1790001138/vpnexues/Fresh%20Papaya.jpg',30,38,3.90,null),
  mp(157,'Mangosteen','Fruits','per pc','GPNX-157','https://res.cloudinary.com/eqjshlur/image/upload/v1790001279/vpnexues/Rambutan.jpg',85,105,3.90,null),
  mp(158,'Langsat','Fruits','per pc','GPNX-158','https://res.cloudinary.com/eqjshlur/image/upload/v1790001203/vpnexues/Longan.jpg',40,52,3.90,null),
  mp(159,'Salak','Fruits','per pc','GPNX-159','https://res.cloudinary.com/eqjshlur/image/upload/v1790001298/vpnexues/Snake%20Fruit.jpg',35,45,3.90,null),
  mp(160,'Java Apple','Fruits','per pc','GPNX-160','https://res.cloudinary.com/eqjshlur/image/upload/v1790001307/vpnexues/Star%20Fruit.jpg',50,65,3.90,null),
  mp(170,'Malay Gooseberry','Fruits','per pc','GPNX-170','https://res.cloudinary.com/eqjshlur/image/upload/v1790001126/vpnexues/Fresh%20Guava.jpg',40,52,3.90,null),
  mp(171,'Rose Myrtle','Fruits','per pc','GPNX-171','https://res.cloudinary.com/eqjshlur/image/upload/v1790001144/vpnexues/Fresh%20Plums.jpg',35,45,3.90,null),
  mp(172,'Snake Fruit','Fruits','per pc','GPNX-172','https://res.cloudinary.com/eqjshlur/image/upload/v1790001298/vpnexues/Snake%20Fruit.jpg',30,40,3.90,null),
  mp(173,'Durian','Fruits','per pc','GPNX-173','https://res.cloudinary.com/eqjshlur/image/upload/v1790001127/vpnexues/Fresh%20Jackfruit.jpg',120,150,3.90,null),
  mp(174,'Rose Apple','Fruits','per pc','GPNX-174','https://res.cloudinary.com/eqjshlur/image/upload/v1790001117/vpnexues/Fresh%20Cherries.jpg',40,52,3.90,null),
  mp(175,'Golden Delicious Apples','Fruits','per pc','GPNX-175','https://res.cloudinary.com/eqjshlur/image/upload/v1790001158/vpnexues/Golden%20Delicious%20Apples.jpg',35,45,3.90,null),

  // â”€â”€ BOX EXTRA GROCERIES (9 items) â”€â”€
  mp(176,'Peanut Oil','Groceries','per 250ml','GPNX-176','https://res.cloudinary.com/eqjshlur/image/upload/vpnexues/groceries/peanut-oil.jpg',120,150,10.50,13.00),
  mp(177,'Raw Peanuts','Groceries','per 250g','GPNX-177','https://res.cloudinary.com/eqjshlur/image/upload/vpnexues/groceries/raw-peanuts.jpg',100,120,10.50,13.00),
  mp(178,'Sesame Oil','Groceries','per 250ml','GPNX-178','https://res.cloudinary.com/eqjshlur/image/upload/vpnexues/groceries/sesame-oil.jpg',80,100,10.50,13.00),
  mp(179,'Frozen Vegetables','Groceries','per pack','GPNX-179','https://res.cloudinary.com/eqjshlur/image/upload/vpnexues/groceries/frozen-vegetables.jpg',120,150,10.50,13.00),
  mp(180,'Butter','Groceries','per 250g','GPNX-180','https://res.cloudinary.com/eqjshlur/image/upload/vpnexues/groceries/butter-pack.jpg',450,550,10.50,13.00),
  mp(181,'Farm Fresh Cow Ghee','Groceries','per 250ml','GPNX-181','https://res.cloudinary.com/eqjshlur/image/upload/vpnexues/groceries/ghee-%28cow-milk%29-pouch.jpg',200,250,10.50,13.00),
  mp(182,'Paneer Cheese Cubes','Groceries','per pack','GPNX-182','https://res.cloudinary.com/eqjshlur/image/upload/vpnexues/groceries/paneer-cheese-cubes.jpg',150,180,10.50,13.00),
  mp(183,'Curd','Groceries','per cup','GPNX-183','https://res.cloudinary.com/eqjshlur/image/upload/vpnexues/groceries/curd.jpg',120,150,10.50,13.00),
  mp(184,'Cheese','Groceries','per pack','GPNX-184','https://res.cloudinary.com/eqjshlur/image/upload/vpnexues/groceries/cheese.jpg',150,190,10.50,13.00),
];

/* Badge percentages fixed by marketing (shop page review, 14-Oct-2026) — these
   two tomatoes show a badge that is not derived from their struck/selling
   prices, so the mock can't compute them. Mirrors products.discount_pct. */
const DISCOUNT_PCT_OVERRIDES: Record<string, number> = {
  'GPNX-002': 21, // Vine Tomatoes  (struck 40.00 / selling 30.00)
  'GPNX-010': 23, // Cherry Tomatoes (struck 50.00 / selling 49.00)
};

function toProduct(mock: MockProduct, country: CountryCode): Product {
  const pricing = mock.prices[country] ?? mock.prices['SG']!;
  /* "% OFF" badges that are set by marketing and intentionally differ from the
     figure computed off oldPrice/price. Mirrors products.discount_pct in the DB. */
  const discountPct = DISCOUNT_PCT_OVERRIDES[mock.sku]
    ?? (pricing.oldPrice ? Math.round(((pricing.oldPrice - pricing.price) / pricing.oldPrice) * 100) : null);
  return {
    id: String(mock.id),
    name: mock.name,
    slug: mock.slug,
    category: mock.category,
    description: mock.description,
    price: pricing.price,
    oldPrice: pricing.oldPrice ?? null,
    unit: mock.unit,
    sku: mock.sku,
    imageUrl: mock.imageUrl,
    discountPct,
    badges: mock.badges,
  };
}

const BESTSELLER_RANK: Record<string, number> = {
  'vine-tomatoes': 1000, 'farm-tomatoes-legacy': 999, 'red-onions': 950, 'red-onions-legacy': 950, 'cauliflower': 900, 'broccoli-head': 850, 'white-radish': 840, 'organic-carrots': 830, 'cucumber': 820, 'green-beans': 810, 'beetroot': 800, 'french-beans': 790, 'bell-peppers-mix': 780, 'baby-spinach': 770, 'mint-leaves': 760, 'green-capsicum': 750, 'okra-ladyfinger': 740, 'bitter-gourd': 730, 'bottle-gourd': 720, 'eggplant': 710, 'sweet-potato': 700, 'purple-cabbage': 690, 'pumpkin': 680, 'ridge-gourd': 670, 'cherry-tomatoes': 660, 'spring-onions': 650, 'curry-leaves': 640, 'colocasia-leaves': 630, 'coconut-fresh': 620, 'coconut-milk': 610, 'fresh-bananas': 590, 'alphonso-mango': 580, 'fresh-papaya': 570, 'watermelon': 560, 'fresh-oranges': 550, 'kiwi-fruit': 540, 'fresh-pomegranate': 530, 'green-apples': 520, 'red-grapes': 510, 'basmati-rice': 500,
};

export function getCatalogProductsByNames(names: string[], country: CountryCode): Product[] {
  const result: Product[] = [];
  for (const name of names) {
    const mock = MOCK_PRODUCTS.find((m) => matchesRecipeCatalog(m.name, [name]));
    if (mock && !result.some((r) => r.id === String(mock.id))) {
      result.push(toProduct(mock, country));
    }
  }
  return result;
}

export function getMockProducts(params: {
  country: string;
  category?: string;
  search?: string;
  recipeProductNames?: string[];
  page?: number;
  size?: number;
}): PageResponse<Product> {
  const country = (params.country as CountryCode) || 'SG';
  const page = params.page ?? 0;
  const size = params.size ?? 24;

  let filtered = MOCK_PRODUCTS.map((m) => toProduct(m, country));

  const hasRecipe = !!params.recipeProductNames && params.recipeProductNames.length > 0;
  if (params.category && !hasRecipe) {
    filtered = filtered.filter((p) => p.category === params.category);
  }
  if (hasRecipe) {
    // User explicitly selected a recipe or cuisine: filter to its catalog ingredients, in recipe order
    const rNames = params.recipeProductNames!;
    filtered = filtered.filter((p) => matchesRecipeCatalog(p.name, rNames));
    const recipeIdx = (name: string) => rNames.findIndex((rp) => matchesRecipeCatalog(name, [rp]));
    filtered.sort((a, b) => recipeIdx(a.name) - recipeIdx(b.name));
    const totalElements = filtered.length;
    const size = params.size ?? 24;
    const page = params.page ?? 0;
    return { content: filtered.slice(page * size, (page + 1) * size), page, size, totalElements, totalPages: Math.ceil(totalElements / size) };
  }
  if (params.search) {
    const q = params.search.toLowerCase();
    filtered = filtered.filter(
      (p) => p.name.toLowerCase().includes(q) || (p.description ?? '').toLowerCase().includes(q) || p.category.toLowerCase().includes(q)
    );
  }

  // Bestseller sorting â€” tomato first, onion second â€” even offline (matches DB V8 sales_count)
  filtered.sort((a, b) => (BESTSELLER_RANK[b.slug] ?? 0) - (BESTSELLER_RANK[a.slug] ?? 0) || a.name.localeCompare(b.name));

  const totalElements = filtered.length;
  const totalPages = Math.ceil(totalElements / size);
  const content = filtered.slice(page * size, (page + 1) * size);

  return { content, page, size, totalElements, totalPages };
}

// â”€â”€ Local mock cart (in-memory + localStorage persistence) â”€â”€

const MOCK_CART_STORAGE_KEY = 'vpnexues-mock-cart';

function loadMockCartItems(): CartItem[] {
  try {
    const raw = localStorage.getItem(MOCK_CART_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveMockCartItems(): void {
  try {
    localStorage.setItem(MOCK_CART_STORAGE_KEY, JSON.stringify(mockCartItems));
  } catch { /* quota exceeded â€” silently ignore */ }
}

let mockCartItems: CartItem[] = loadMockCartItems();
let mockCartId = 'mock-cart-1';

function recomputeCart(): Cart {
  const itemTotal = mockCartItems.reduce((sum, i) => sum + i.lineTotal, 0);
  const boxSummaries: BoxSummary[] = [];

  const smallBoxItems = mockCartItems.filter((i) => i.boxType === 'SMALL_BOX');
  if (smallBoxItems.length > 0) {
    const sbQty = smallBoxItems.reduce((sum, i) => sum + i.qty, 0);
    const threshold = 10;
    const premium = sbQty > threshold ? smallBoxItems.reduce((sum, i) => {
      const excessQty = Math.max(0, i.qty - threshold);
      return sum + excessQty * i.unitPrice * 0.15;
    }, 0) : 0;
    boxSummaries.push({
      boxType: 'SMALL_BOX',
      progressValue: Math.min(sbQty, threshold),
      threshold,
      minimumMet: sbQty >= threshold,
      subtotal: smallBoxItems.reduce((sum, i) => sum + i.lineTotal, 0),
      premiumOrDiscount: premium,
      total: smallBoxItems.reduce((sum, i) => sum + i.lineTotal, 0) + premium,
    });
  }

  const bigBoxItems = mockCartItems.filter((i) => i.boxType === 'BIG_BOX');
  if (bigBoxItems.length > 0) {
    const totalKg = bigBoxItems.reduce((sum, i) => sum + (i.weightKg ?? 0), 0);
    const subtotal = bigBoxItems.reduce((sum, i) => sum + i.lineTotal, 0);
    const discount = totalKg >= 10 ? subtotal * 0.12 : 0;
    boxSummaries.push({
      boxType: 'BIG_BOX',
      progressValue: Math.min(totalKg, 10),
      threshold: 10,
      minimumMet: totalKg >= 10,
      subtotal,
      premiumOrDiscount: -discount,
      total: subtotal - discount,
    });
  }

  return { id: mockCartId, items: mockCartItems, itemTotal, boxSummaries };
}

function findMockByProductId(productId: string): MockProduct | undefined {
  return MOCK_PRODUCTS.find((m) => String(m.id) === productId || m.slug === productId);
}

export function mockAddToCart(productId: string, qty: number, country: string): Cart {
  const mockProduct = findMockByProductId(productId);
  if (!mockProduct) return recomputeCart();

  const product = toProduct(mockProduct, country as CountryCode);
  const existing = mockCartItems.find((i) => i.productId === product.id && !i.boxType);
  if (existing) {
    existing.qty += qty;
    existing.lineTotal = existing.unitPrice * existing.qty;
  } else {
    mockCartItems.push({
      id: crypto.randomUUID(),
      productId: product.id,
      name: product.name,
      imageUrl: product.imageUrl,
      unit: product.unit,
      boxType: null,
      qty,
      weightKg: null,
      unitPrice: product.price,
      oldPrice: product.oldPrice,
      lineTotal: product.price * qty,
    });
  }
  saveMockCartItems();
  return recomputeCart();
}

export function mockSetBoxItem(productId: string, boxType: 'SMALL_BOX' | 'BIG_BOX', qty: number, weightKg: number | null, country: string): Cart {
  const mockProduct = findMockByProductId(productId);
  if (!mockProduct) return recomputeCart();

  const product = toProduct(mockProduct, country as CountryCode);
  const existing = mockCartItems.find((i) => i.productId === product.id && i.boxType === boxType);

  if (boxType === 'BIG_BOX' && weightKg !== null) {
    const lineWeight = weightKg;
    const lineQty = Math.round(lineWeight / 0.5);
    if (existing) {
      if (lineQty <= 0) {
        mockCartItems = mockCartItems.filter((i) => i !== existing);
      } else {
        existing.weightKg = lineWeight;
        existing.qty = lineQty;
        existing.lineTotal = product.price * lineWeight;
      }
    } else if (lineQty > 0) {
      mockCartItems.push({
        id: crypto.randomUUID(),
        productId: product.id,
        name: product.name,
        imageUrl: product.imageUrl,
        unit: product.unit,
        boxType,
        qty: lineQty,
        weightKg: lineWeight,
        unitPrice: product.price,
        oldPrice: product.oldPrice,
        lineTotal: product.price * lineWeight,
      });
    }
  } else {
    if (existing) {
      if (qty <= 0) {
        mockCartItems = mockCartItems.filter((i) => i !== existing);
      } else {
        existing.qty = qty;
        existing.lineTotal = existing.unitPrice * qty;
      }
    } else if (qty > 0) {
      mockCartItems.push({
        id: crypto.randomUUID(),
        productId: product.id,
        name: product.name,
        imageUrl: product.imageUrl,
        unit: product.unit,
        boxType,
        qty,
        weightKg,
        unitPrice: product.price,
        oldPrice: product.oldPrice,
        lineTotal: product.price * qty,
      });
    }
  }
  saveMockCartItems();
  return recomputeCart();
}

export function mockUpdateCartItem(itemId: string, qty: number): Cart {
  const item = mockCartItems.find((i) => i.id === itemId);
  if (item) {
    item.qty = qty;
    item.lineTotal = item.unitPrice * qty;
  }
  saveMockCartItems();
  return recomputeCart();
}

export function mockRemoveCartItem(itemId: string): Cart {
  mockCartItems = mockCartItems.filter((i) => i.id !== itemId);
  saveMockCartItems();
  return recomputeCart();
}

export function mockClearCart(): Cart {
  mockCartItems = [];
  saveMockCartItems();
  return recomputeCart();
}

export function mockGetCart(): Cart {
  return recomputeCart();
}
