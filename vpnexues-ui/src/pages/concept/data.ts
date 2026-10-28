export type CountryId = 'india' | 'singapore' | 'srilanka' | 'australia' | 'uae' | 'malaysia';
export type Tone = 'live' | 'soon' | 'aus';

export interface Country {
  id: CountryId;
  name: string;
  live: boolean;
  /** how the transport icon on the hero route travels, if at all */
  mode: 'home' | 'air' | 'sea';
  /** hero route colour */
  route: 'lime' | 'blue';
  heroNote: string[];
  presence: { badge: string; body: string; details?: string[] };
}

/* Order matters: it is the clockwise "petal" order around the logo in the hero. */
export const COUNTRIES: Country[] = [
  { id: 'india', name: 'India', live: true, mode: 'home', route: 'lime', heroNote: ['Bengaluru HQ', 'Salem · Tirupattur'],
    presence: { badge: 'Active business', body: 'Sourcing base and operating foundation for VP NEXUES.', details: ['Bengaluru — Headquarters', 'Salem', 'Tirupattur'] } },
  { id: 'singapore', name: 'Singapore', live: true, mode: 'air', route: 'lime', heroNote: ['Office presence', 'Address section below'],
    presence: { badge: 'Office presence', body: 'Active market and office presence for international business.' } },
  { id: 'malaysia', name: 'Malaysia', live: false, mode: 'sea', route: 'blue', heroNote: ['Future market'],
    presence: { badge: 'Coming soon', body: 'Future business presence to strengthen Southeast Asia outreach.' } },
  { id: 'australia', name: 'Australia', live: false, mode: 'air', route: 'lime', heroNote: ['Future expansion'],
    presence: { badge: 'Coming soon', body: 'Future export market in the VP NEXUES roadmap.' } },
  { id: 'srilanka', name: 'Sri Lanka', live: false, mode: 'sea', route: 'blue', heroNote: ['New office plan'],
    presence: { badge: 'Coming soon', body: 'New office plan supporting the next stage of regional growth.' } },
  { id: 'uae', name: 'UAE', live: false, mode: 'air', route: 'blue', heroNote: ['Future market'],
    presence: { badge: 'Coming soon', body: 'Future market and expansion opportunity in the Middle East.' } },
];

/* The presence cards read better in this order (live markets first). */
export const PRESENCE_ORDER: CountryId[] = ['india', 'singapore', 'srilanka', 'australia', 'malaysia', 'uae'];

export const HERO_META = [
  { title: 'India', lines: ['Bengaluru HQ', 'Salem · Tirupattur'] },
  { title: 'Singapore', lines: ['Office presence', 'Export operations'] },
  { title: 'Coming soon', lines: ['Sri Lanka · Australia', 'Malaysia · UAE'] },
];

export interface MapMarker {
  id: CountryId;
  tone: Tone;
  x: number;
  y: number;
  status: string;
  name: string;
  sub: string;
  anchor: 'start' | 'end';
  lx: number;
  ly: number;
}

export const MAP_MARKERS: MapMarker[] = [
  { id: 'uae', tone: 'soon', x: 76.7, y: 102.4, status: 'Coming soon', name: 'UAE', sub: 'Future market', anchor: 'start', lx: 104, ly: 52 },
  { id: 'india', tone: 'live', x: 228, y: 190.2, status: 'Live now', name: 'India', sub: 'Bengaluru HQ · Salem · Tirupattur', anchor: 'start', lx: 290, ly: 112 },
  { id: 'srilanka', tone: 'soon', x: 243.6, y: 232.2, status: 'Coming soon', name: 'Sri Lanka', sub: 'New office plan', anchor: 'end', lx: 222, ly: 308 },
  { id: 'malaysia', tone: 'soon', x: 391.5, y: 258.1, status: 'Coming soon', name: 'Malaysia', sub: 'Future market', anchor: 'start', lx: 472, ly: 190 },
  { id: 'singapore', tone: 'live', x: 405.8, y: 270, status: 'Live now', name: 'Singapore', sub: 'Office presence', anchor: 'start', lx: 472, ly: 296 },
  { id: 'australia', tone: 'aus', x: 488.6, y: 508.5, status: 'Coming soon', name: 'Australia', sub: 'Future expansion', anchor: 'end', lx: 452, ly: 470 },
];

export const MAP_ROUTES: { d: string; blue?: boolean }[] = [
  { d: 'M77 102 Q152 111 228 190' },
  { d: 'M228 190 Q327 170 406 270' },
  { d: 'M406 270 Q437 429 489 509' },
  { d: 'M244 232 Q396 390 489 509', blue: true },
  { d: 'M244 232 Q318 275 391.5 258', blue: true },
];
export const PLANE_PATH = MAP_ROUTES[1].d;
export const SHIP_PATH = MAP_ROUTES[3].d;

export const MAP_STATS = [
  { value: 2, label: 'Live now', tone: 'live' },
  { value: 4, label: 'Coming soon', tone: 'soon' },
  { value: 6, label: 'Markets', tone: 'all' },
] as const;

export const MAP_NOTES = [
  { head: [{ id: 'india', text: 'India' }], body: 'Bengaluru HQ, Salem and Tirupattur form the base.' },
  { head: [{ id: 'singapore', text: 'Singapore' }], body: 'Visible as an active office and business destination.' },
  { head: [
      { id: 'srilanka', text: 'Sri Lanka' }, { id: 'australia', text: 'Australia' },
      { id: 'malaysia', text: 'Malaysia' }, { id: 'uae', text: 'UAE' },
    ], body: 'Presented as the next layers of business growth.' },
] as const;

export const CATEGORIES = [
  { id: 'fruits', n: '01', title: 'Fruits', body: 'Sourced for freshness, quality and a stronger product story.', glyph: '◒' },
  { id: 'vegetables', n: '02', title: 'Vegetables', body: 'Presented as a strong part of exports and app-led commerce.', glyph: '✳' },
  { id: 'groceries', n: '03', title: 'Groceries', body: 'Supporting a broader ecosystem of practical daily categories.', glyph: '▤' },
] as const;

export const B2B_STEPS = ['Discover supply', 'Discuss requirements', 'Build partnerships'];

export const B2B_CARDS = [
  { id: 'trade', tag: 'GLOBAL TRADE', title: 'Importers & Distributors', body: 'Explore sourcing discussions for fruits, vegetables and groceries across international markets.', foot: 'International supply' },
  { id: 'retail', tag: 'DOMESTIC B2B', title: 'Supermarkets & Retail', body: 'A business-facing path for wholesale requirements, category discovery and retailer partnerships.', foot: 'Retail supply' },
  { id: 'collab', tag: 'COLLABORATION', title: 'Sourcing & Partnerships', body: 'Connect with the team to discuss business needs, supplier interest and potential trade opportunities.', foot: 'Grow together' },
] as const;

export type ChoiceKey = 'exports' | 'buyer' | 'seller';
export const CHOICES: { key: ChoiceKey; label: string; glyph: string }[] = [
  { key: 'exports', label: 'Global Exports', glyph: '↗' },
  { key: 'buyer', label: 'Buyer App', glyph: '◈' },
  { key: 'seller', label: 'Seller App', glyph: '▣' },
];

export const ECOSYSTEM: Record<ChoiceKey, { title: string; desc: string; items: [string, string, string][] }> = {
  exports: { title: 'Global Exports', desc: 'Three core ideas behind the export journey.', items: [
    ['✳', 'Locations first', 'India, Singapore, Sri Lanka, Australia, Malaysia and UAE all remain visible in the story.'],
    ['↗', 'Trade network', 'India works as the sourcing base while Singapore holds active office presence.'],
    ['◎', 'Growth roadmap', 'Sri Lanka, Australia, Malaysia and UAE are clearly marked as coming soon.'] ] },
  buyer: { title: 'Buyer App', desc: 'Three ideas shaping the customer experience.', items: [
    ['◈', 'Discover', 'A mobile-first place to explore the VP NEXUES experience.'],
    ['▦', 'Browse', 'Fresh categories organized around everyday convenience.'],
    ['↗', 'Download', 'Website visitors are guided toward the app when it becomes publicly available.'] ] },
  seller: { title: 'Seller App', desc: 'Three ideas shaping the seller experience.', items: [
    ['▣', 'Join', 'A dedicated entry point for sellers and suppliers.'],
    ['◎', 'Manage', 'Future tools for product and business participation.'],
    ['↗', 'Grow', 'A digital channel designed to support seller expansion.'] ] },
};

export type AppKind = 'buyer' | 'seller';
export const APP_MODAL: Record<AppKind, { title: string; text: string }> = {
  buyer: { title: 'Discover the Buyer App', text: 'The Buyer App is currently under testing.' },
  seller: { title: 'Discover the Seller App', text: 'The Seller App is currently in development.' },
};
