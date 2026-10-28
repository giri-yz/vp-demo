/* Per-page SEO metadata — English source-of-truth copy approved by marketing
 * (VPNexues SEO rollout). Consumed by components/common/Seo.tsx, which writes
 * document.title plus meta description / og tags into <head> at runtime.
 * `description` is optional: the B2B entry is intentionally title-only until
 * marketing approves description copy. Canonical URLs are deliberately not
 * managed here (not approved). */
export interface SeoMeta {
  title: string;
  description?: string;
}

export const SEO = {
  home: {
    title: 'Fresh Fruit and Vegetable Wholesalers - VPNexues',
    description:
      'Source fresh fruits and vegetables in bulk with VPNexues. Explore wholesale produce for retailers, restaurants and distributors with dependable supply options.',
  },
  shopVegetables: {
    title: 'Fresh Vegetables Online for Daily Needs - VPNexues',
    description:
      'Shop fresh vegetables online with VPNexues. Explore leafy greens, seasonal vegetables and everyday cooking essentials for convenient shopping at home.',
  },
  shopFruits: {
    title: 'Fresh Fruits Online for Everyday Goodness - VPNexues',
    description:
      'Shop fresh fruits online with VPNexues. Discover seasonal favourites and delicious fruit varieties for everyday meals, snacks and convenient home shopping.',
  },
  shopGroceries: {
    title: 'Online Grocery Delivery Services - VPNexues',
    description:
      'Shop everyday essentials with VPNexues online grocery delivery services. Explore groceries, fresh produce and pantry staples for convenient shopping.',
  },
  b2b: {
    // Title-only: marketing has not yet approved a meta description.
    title: 'Wholesale Fruit & Vegetable Suppliers in Salem - VPNexues',
  },
} satisfies Record<string, SeoMeta>;
