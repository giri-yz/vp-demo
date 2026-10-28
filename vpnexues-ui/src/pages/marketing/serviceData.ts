export interface Service {
  icon: string;
  title: string;
  slug: string;
  summary: string;
  details: string[];
  photo?: string;
}

export const SERVICES: Service[] = [
  {
    icon: '🥬',
    title: 'Grocery Delivery',
    slug: 'grocery-delivery',
    summary: 'Fresh produce and pantry staples delivered same-day.',
    details: [
      'Same-day delivery across our service areas.',
      'Sourced directly from partner farms — no warehouse delay.',
      'Live order tracking from checkout to your door.',
    ],
    photo: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001892/vpnexues/old/site-assets/service/service-01.jpg',
  },
  {
    icon: '📦',
    title: 'Small Box Subscription',
    slug: 'small-box',
    summary: 'A curated weekly box sized for individuals and couples.',
    details: [
      'Minimum 10 items per box, +15% past item 10 for flexibility.',
      'Swap items each week based on what is in season.',
      'Pause or cancel anytime from your account.',
    ],
    photo: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001895/vpnexues/old/site-assets/service/service-02.jpg',
  },
  {
    icon: '🛒',
    title: 'Big Box Bulk Orders',
    slug: 'big-box',
    summary: 'Bulk pricing on orders over 10kg for larger households.',
    details: [
      '12% bulk discount automatically applied past 10kg.',
      'Ideal for large families or shared households.',
      'Combine with a standing weekly order.',
    ],
    photo: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001897/vpnexues/old/site-assets/service/service-03.jpg',
  },
  {
    icon: '🏢',
    title: 'B2B Supply',
    slug: 'b2b-supply',
    summary: 'Wholesale produce supply for restaurants and retailers.',
    details: [
      'Dedicated account manager and custom pricing.',
      'Flexible delivery schedules for commercial kitchens.',
      'Invoice-based billing for approved business accounts.',
    ],
    photo: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001900/vpnexues/old/site-assets/service/service-04.jpg',
  },
  {
    icon: '📍',
    title: 'Store Pickup',
    slug: 'store-pickup',
    summary: 'Skip delivery and collect your order from a pickup point.',
    details: [
      'No delivery fee when you collect in person.',
      'Order ready within 2 hours of placing it.',
      'Pickup points across major service areas.',
    ],
    photo: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001902/vpnexues/old/site-assets/service/store-pickup.jpg',
  },
  {
    icon: '🎁',
    title: 'Gift Boxes',
    slug: 'gift-boxes',
    summary: 'Curated grocery gift boxes for any occasion.',
    details: [
      'Themed boxes: breakfast, wellness, celebration, and more.',
      'Add a personal note at checkout.',
      'Ship directly to the recipient.',
    ],
    photo: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001887/vpnexues/old/site-assets/service/gift-boxes.jpg',
  },
  {
    icon: '🌱',
    title: 'Organic Certification',
    slug: 'organic-certification',
    summary: 'Every organic item is verified and certified.',
    details: [
      'All organic listings are certification-verified at intake.',
      'Full traceability back to the source farm.',
      'Certificates available on request for any order.',
    ],
    photo: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001890/vpnexues/old/site-assets/service/organic-certification.jpg',
  },
  {
    icon: '🔄',
    title: 'Easy Returns',
    slug: 'easy-returns',
    summary: 'Not happy with an item? Replacement or refund, no questions asked.',
    details: [
      'Report an issue within 24 hours of delivery.',
      'Choose a replacement or a refund to your original payment method.',
      'No return shipping needed for perishables.',
    ],
    photo: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001884/vpnexues/old/site-assets/service/easy-returns.jpg',
  },
];
