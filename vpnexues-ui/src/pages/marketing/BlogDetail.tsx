import { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../../i18n/LanguageContext';
import { assetUrl, fetchNewsById, formatDateDisplay, splitTags, type NewsArticleRow } from '../../api/contentApi';
import { jsonLdScript } from '../../utils/jsonLd';
import NotFound from '../NotFound';
import styles from './css/BlogDetail.module.css';

const ARTICLES: Record<string, {
  image: string; tallImage?: boolean; author: string; authorRole: string;
  comments: number; readTime: string; dateISO: string; dateDisplay: string;
  title: string; desc: string;
  content: string[]; subheadings: string[];
  checkList: string[]; quote: string;
  tags: string[];
  commentList: { name: string; initials: string; date: string; dateISO: string; text: string }[];
}> = {
  '1': {
    image: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001873/vpnexues/old/site-assets/news/news-sustainable.jpg',
    author: 'Pradeep K.',
    authorRole: 'Director, VPNexues',
    comments: 4,
    readTime: '3 min',
    dateISO: '2026-06-12',
    dateDisplay: '12 June, 2026',
    title: 'Sustainable Farming: Feeding the Future Responsibly',
    desc: 'Discover how VPNexues integrates organic practices with modern supply chains to deliver farm-fresh produce across the globe.',
    content: [
      'Discover how VPNexues integrates organic practices with modern supply chains to deliver farm-fresh produce across the globe. From the fertile red soil of Tamil Nadu to dining tables in Singapore, the UAE and Europe, every single harvest follows one clear promise — purity without compromise, and uncompromising quality control at every stage of the journey.',
      'Conventional farming relies heavily on chemical inputs that steadily degrade soil health, groundwater reserves and surrounding biodiversity over time. Sustainable farming completely reverses that trend by working together with nature instead of fighting against it. When the soil is healthy, the crops it grows are healthier too, and when the crops are healthier, the people who eat them feel the difference in every single meal they enjoy.',
      'From farm to table, without compromise — every step of the supply chain is designed to protect freshness, preserve nutrition, and support local farming communities. By shortening the distance between harvest and home, we significantly reduce waste while locking in peak flavour and nutritional value that mass-produced alternatives simply cannot match.',
    ],
    subheadings: ['Why Sustainable Farming Matters', 'From Farm to Table, Without Compromise'],
    checkList: [
      '100% certified organic, chemical-free produce, harvested fresh every single day',
      'Direct sourcing from audited organic farms across Tamil Nadu, without any middlemen',
      'Fair and transparent income for every farmer in our growing network',
      'Complete traceability from the moment of seeding right up to final shipment',
    ],
    quote: 'The future of food depends on the choices we make in the fields today. Grow organically, trade fairly, and eat better.',
    tags: ['Organic', 'Farm', 'Fresh'],
    commentList: [
      { name: 'Ravi Kumar', initials: 'RK', date: '13 June, 2026', dateISO: '2026-06-13', text: 'Great insights on sustainable farming practices. This is exactly what the industry needs!' },
      { name: 'Priya S.', initials: 'PS', date: '13 June, 2026', dateISO: '2026-06-13', text: 'Love the transparency in the supply chain. VPNexues is setting the standard.' },
    ],
  },
  '2': {
    image: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001870/vpnexues/old/site-assets/news/news-spices.jpg',
    author: 'Nageswaran D.',
    authorRole: 'Head of Operations',
    comments: 7,
    readTime: '4 min',
    dateISO: '2026-06-01',
    dateDisplay: '1 June, 2026',
    title: 'From Farm to Table: The Journey of Organic Spices',
    desc: 'Explore the traceability and quality control that makes VPNexues spices stand out in international markets.',
    content: [
      'Explore the traceability and quality control that makes VPNexues spices stand out in international markets. Every spice that leaves our facility carries the story of the farmer who grew it, the soil that nurtured it, and the care that preserved its natural goodness from field to fork.',
      'Quality control is not a single checkpoint — it is a continuous process that spans harvesting, cleaning, processing, testing, packaging and shipping. At every stage, our team ensures that international food safety standards are not just met but exceeded.',
      'The global demand for authentic, organic Indian spices continues to rise as consumers become more conscious about what goes into their food. VPNexues has positioned itself at the intersection of traditional farming wisdom and modern supply chain efficiency.',
    ],
    subheadings: ['The Art of Spice Processing', 'Meeting Global Standards'],
    checkList: [
      'Every batch tested for purity, moisture content and chemical residue',
      'Cold-chain logistics preserves natural oils and flavour compounds',
      'Direct partnerships with organic spice farmers across Tamil Nadu',
      'Full FSSAI, India Organic and USDA NOP certifications',
    ],
    quote: 'Spices are the soul of Indian cuisine — we make sure that soul remains pure from farm to table.',
    tags: ['Spices', 'Organic', 'Export'],
    commentList: [
      { name: 'Meena L.', initials: 'ML', date: '2 June, 2026', dateISO: '2026-06-02', text: 'The quality of VPNexues spices is unmatched. My family can taste the difference!' },
    ],
  },
  '3': {
    image: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001868/vpnexues/old/site-assets/news/news-export.jpg',
    author: 'Admin',
    authorRole: 'VPNexues Team',
    comments: 2,
    readTime: '3 min',
    dateISO: '2026-05-15',
    dateDisplay: '15 May, 2026',
    title: 'Export Trends: Indian Organic Produce in 2026',
    desc: 'Insights into the growing demand for Indian organic products and how VPNexues is leading the charge.',
    content: [
      'Insights into the growing demand for Indian organic products and how VPNexues is leading the charge. The global organic food market continues to expand at an unprecedented rate, with Indian exports playing a pivotal role in meeting this rising demand.',
      'India\'s organic export landscape has transformed dramatically over the past few years. What was once a niche market dominated by a handful of players has now become a thriving ecosystem of certified producers, each contributing to the nation\'s organic legacy.',
      'As more countries tighten regulations around food safety and sustainability, Indian organic producers who maintain rigorous certification standards are finding unprecedented opportunities in international markets.',
    ],
    subheadings: ['Global Market Opportunities', 'India\'s Organic Advantage'],
    checkList: [
      'Indian organic exports grew by 25% in the last fiscal year',
      'Singapore, UAE and EU remain the fastest-growing markets',
      'VPNexues ships to 12+ countries from Tamil Nadu',
      'Complete organic certification chain from farm to container',
    ],
    quote: 'Indian organic produce is not just a product — it is a promise of purity backed by centuries of farming tradition.',
    tags: ['Export', 'Organic', 'Farm'],
    commentList: [
      { name: 'Sanjay M.', initials: 'SM', date: '16 May, 2026', dateISO: '2026-05-16', text: 'Wonderful to see Indian organic products gaining global recognition.' },
    ],
  },
  '4': {
    image: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790156219/vpnexues/banners/page-banner-pricing.jpg',
    author: 'Pradeep K.',
    authorRole: 'Director, VPNexues',
    comments: 3,
    readTime: '3 min',
    dateISO: '2026-05-05',
    dateDisplay: '5 May, 2026',
    title: 'Freshness You Can Taste: Our Cold-Chain Promise',
    desc: 'Every product that leaves our facility is packed with peak freshness preserved through our advanced cold-chain logistics network.',
    content: [
      'Every product that leaves our facility is packed with peak freshness preserved through our advanced cold-chain logistics network. From the moment produce is harvested, temperature-controlled systems ensure that nutrition, flavour and texture remain intact all the way to your table.',
      'Our cold-chain infrastructure spans across Tamil Nadu, connecting remote organic farms to our centrally located processing hubs. Rapid collection and same-day processing means the gap between harvest and packaging is measured in hours, not days.',
      'This commitment to freshness is what sets VPNexues apart in a market where shelf-life often comes at the cost of taste and nutrition. We believe you should never have to choose between convenience and quality.',
    ],
    subheadings: ['How Cold-Chain Works', 'Why Freshness Matters'],
    checkList: [
      'Same-day harvest-to-pack processing across all facilities',
      'Temperature-controlled storage from 2°C to 8°C',
      'Real-time GPS tracking on every delivery vehicle',
      'Shelf-life extended by 40% without preservatives',
    ],
    quote: 'Fresh is not just a label — it is a promise we keep from the moment the seed is planted to the moment it reaches your kitchen.',
    tags: ['Fresh', 'Organic', 'Farm'],
    commentList: [
      { name: 'Anita R.', initials: 'AR', date: '11 June, 2026', dateISO: '2026-06-11', text: 'The cold-chain system is impressive. You can really taste the freshness!' },
    ],
  },
  '5': {
    image: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790168677/vpnexues/news/organic-vegan.jpg',
    tallImage: true,
    author: 'Hemaanth R.',
    authorRole: 'Marketing Lead',
    comments: 5,
    readTime: '4 min',
    dateISO: '2026-04-20',
    dateDisplay: '20 April, 2026',
    title: '100% Plant-Based: Organic Vegan Produce from Tamil Nadu',
    desc: 'From naturally grown vegetables to plant-based staples, VPNexues delivers certified organic vegan products to health-conscious consumers worldwide.',
    content: [
      'From naturally grown vegetables to plant-based staples, VPNexues delivers certified organic vegan products to health-conscious consumers worldwide. The demand for plant-based food has surged globally, and Tamil Nadu is uniquely positioned to lead this movement.',
      'Our vegan product range includes organic millets, cold-pressed oils, naturally dried fruits, heirloom rice varieties and fresh vegetables — all grown without synthetic chemicals, pesticides or animal-derived inputs.',
      'Every product carries India Organic and USDA NOP certifications, giving international buyers the confidence that what they receive is genuinely plant-based and produced to the highest ethical standards.',
    ],
    subheadings: ['The Rise of Plant-Based Eating', 'Our Vegan Product Range'],
    checkList: [
      '100% plant-based, cruelty-free organic produce',
      'Certified by India Organic, USDA NOP and EU Organic',
      'No animal-derived inputs at any stage of farming',
      'Eco-friendly biodegradable packaging on all vegan lines',
    ],
    quote: 'Eating plant-based is not a compromise — it is a conscious choice for a healthier body and a healthier planet.',
    tags: ['Organic', 'Farm', 'Fresh'],
    commentList: [
      { name: 'Deepa S.', initials: 'DS', date: '6 June, 2026', dateISO: '2026-06-06', text: 'Finally a brand that truly delivers on the vegan promise. Love the millet range!' },
    ],
  },
  '6': {
    image: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790167072/vpnexues/news/local-organic.jpg',
    tallImage: true,
    author: 'Nageswaran D.',
    authorRole: 'Head of Operations',
    comments: 6,
    readTime: '3 min',
    dateISO: '2026-04-10',
    dateDisplay: '10 April, 2026',
    title: 'Pride of Tamil Nadu: Supporting Local Organic Farmers',
    desc: 'VPNexues partners with over 200 organic farms across Tamil Nadu, ensuring fair prices and sustainable practices for every farmer in our network.',
    content: [
      'VPNexues partners with over 200 organic farms across Tamil Nadu, ensuring fair prices and sustainable practices for every farmer in our network. Our direct-sourcing model eliminates middlemen and puts more money in the hands of the people who grow our food.',
      'Tamil Nadu\'s rich agricultural heritage spans centuries. The red soil of Salem, the river basins of Thanjavur and the highlands of Nilgiris each produce unique crops with distinct flavours that cannot be replicated elsewhere.',
      'By investing in farmer training, soil health programs and organic certification support, we are building an ecosystem where sustainable farming is not just possible — it is profitable.',
    ],
    subheadings: ['Direct Farmer Partnerships', 'Preserving Tamil Nadu\'s Agricultural Heritage'],
    checkList: [
      '200+ direct farmer partnerships across 15 districts',
      'Fair trade pricing guaranteed with annual contracts',
      'Free organic certification support for all partner farms',
      'Soil health monitoring and training programs quarterly',
    ],
    quote: 'When you support local organic farming, you are not just buying food — you are investing in a community and a tradition that feeds generations.',
    tags: ['Organic', 'Farm', 'Fresh'],
    commentList: [
      { name: 'Kumar V.', initials: 'KV', date: '29 May, 2026', dateISO: '2026-05-29', text: 'As a Tamil Nadu farmer myself, I appreciate the fair pricing and support VPNexues provides.' },
    ],
  },
  '7': {
    image: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001863/vpnexues/old/site-assets/news/news-banner-main.jpg',
    author: 'Libin K.',
    authorRole: 'Team Lead',
    comments: 4,
    readTime: '5 min',
    dateISO: '2026-03-28',
    dateDisplay: '28 March, 2026',
    title: 'Premium Grade: Handpicked Organic Spices for Global Kitchens',
    desc: 'Our premium spice collection is carefully handpicked, tested for purity and packaged to preserve the authentic flavour that international chefs demand.',
    content: [
      'Our premium spice collection is carefully handpicked, tested for purity and packaged to preserve the authentic flavour that international chefs demand. Each spice undergoes rigorous quality testing before it earns the VPNexues Premium badge.',
      'From the fiery red chillies of Guntur to the aromatic cardamom of the Western Ghats, our premium range represents the finest that Indian agriculture has to offer. Every batch is lab-tested for chemical residues, moisture content and essential oil concentration.',
      'International chefs and specialty food stores choose VPNexues premium spices because they know consistency matters. Every shipment delivers the same exceptional quality, batch after batch, year after year.',
    ],
    subheadings: ['Our Premium Quality Process', 'Trusted by Global Chefs'],
    checkList: [
      'Handpicked from the top 5% of each harvest',
      'Lab-tested for purity, moisture and essential oil content',
      'Vacuum-sealed packaging locks in flavour for 18+ months',
      'Trusted by 50+ specialty food stores across 5 countries',
    ],
    quote: 'Premium is not about price — it is about the care, precision and pride that goes into every single gram we deliver.',
    tags: ['Organic', 'Spices', 'Export'],
    commentList: [
      { name: 'Chef Ramanathan', initials: 'CR', date: '21 May, 2026', dateISO: '2026-05-21', text: 'The quality of VPNexues spices is consistent and exceptional. My go-to supplier for all organic needs.' },
    ],
  },
};

const POPULAR_POSTS = [
  { id: 1, image: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001847/vpnexues/old/site-assets/news/gallery-02.jpg', title: 'Smart Packaging & Product Design', date: '18 May, 2026' },
  { id: 4, image: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001849/vpnexues/old/site-assets/news/gallery-04.jpg', title: 'Drivers Deliver More Than Products', date: '29 April, 2026' },
  { id: 5, image: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001852/vpnexues/old/site-assets/news/gallery-06.jpg', title: 'Organic Mangoes: A Sweet Success', date: '10 April, 2026' },
];

const DEFAULT_ARTICLE = ARTICLES['1'];

type Article = (typeof ARTICLES)[string];
type PostLoc = { title: string; desc: string; tags: string[] };
type ArticleLoc = {
  readTime: string; dateDisplay: string; authorRole: string;
  content: string[]; subheadings: string[]; checkList: string[]; quote: string;
  commentDates: string[]; commentTexts: string[];
};

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Admin-managed article → the rich static article shape. The static original
 * (linked by legacyKey) supplies layout-only extras (subheadings, checklist,
 * quote, comments, author role); everything editable comes from the DB row so
 * admin edits always win.
 */
function buildRemoteArticle(row: NewsArticleRow, locList: PostLoc[]): Article {
  const legacy = row.legacyKey && ARTICLES[row.legacyKey] ? ARTICLES[row.legacyKey] : null;
  const paragraphs = row.content
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);
  const originalTitle = legacy?.title;
  const originalDesc = legacy?.desc;
  const legacyNo = row.legacyKey ? Number(row.legacyKey) : NaN;
  const loc = Number.isFinite(legacyNo) ? locList[legacyNo - 1] : undefined;
  return {
    image: assetUrl(row.imageUrl),
    tallImage: legacy?.tallImage ?? (row.legacyKey === '5' || row.legacyKey === '6'),
    author: row.author,
    authorRole: legacy?.authorRole ?? 'VPNexues Team',
    comments: row.comments,
    readTime: row.readTime,
    dateISO: row.publishedDate,
    dateDisplay: formatDateDisplay(row.publishedDate),
    // Translate only fields the admin has not edited.
    title: loc && row.title === originalTitle ? loc.title : row.title,
    desc: loc && (row.excerpt ?? '') === originalDesc ? loc.desc : (row.excerpt ?? legacy?.desc ?? ''),
    content: paragraphs.length ? paragraphs : [row.content],
    subheadings: legacy?.subheadings ?? [],
    checkList: legacy?.checkList ?? [],
    quote: legacy?.quote ?? '',
    tags: splitTags(row.tags),
    commentList: legacy?.commentList ?? [],
  };
}

export default function BlogDetail() {
  const { t, tRaw } = useLanguage();
  const { id } = useParams();
  const navigate = useNavigate();
  const [commentName, setCommentName] = useState('');
  const [commentEmail, setCommentEmail] = useState('');
  const [commentMsg, setCommentMsg] = useState('');
  const [commentPosted, setCommentPosted] = useState(false);
  const [localComments, setLocalComments] = useState<{ name: string; initials: string; date: string; dateISO: string; text: string }[]>([]);
  const [searchText, setSearchText] = useState('');
  const isRemoteId = !!id && UUID_RE.test(id);
  // UUID ids come from the API-backed /news list; anything else keeps the
  // original static behaviour. null = still loading, 'missing' = not found.
  const [remote, setRemote] = useState<NewsArticleRow | 'missing' | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const [retryTick, setRetryTick] = useState(0);
  const commentTimerRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (!isRemoteId || !id) return;
    let cancelled = false;
    setLoadFailed(false);
    fetchNewsById(id)
      .then((row) => {
        if (!cancelled) setRemote(row ?? 'missing');
      })
      .catch(() => {
        // cold start / offline — NOT a 404: show a retry panel, never a fake NotFound
        if (!cancelled) setLoadFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [isRemoteId, id, retryTick]);

  useEffect(() => {
    setCommentName('');
    setCommentEmail('');
    setCommentMsg('');
    setCommentPosted(false);
    try {
      const raw = localStorage.getItem(`blog-comments-${id ?? 'default'}`);
      const parsed: unknown = raw ? JSON.parse(raw) : [];
      // valid-but-non-array JSON ("{}" / "5") crashed the render spread
      setLocalComments(Array.isArray(parsed) ? parsed : []);
    } catch {
      setLocalComments([]);
    }
  }, [id]);

  function handleCommentSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!commentName.trim() || !commentMsg.trim()) return;
    const now = new Date();
    const entry = {
      name: commentName.trim(),
      initials: commentName.trim().split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase(),
      date: now.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
      dateISO: now.toISOString().slice(0, 10),
      text: commentMsg.trim(),
    };
    const next = [...localComments, entry];
    setLocalComments(next);
    try {
      localStorage.setItem(`blog-comments-${id ?? 'default'}`, JSON.stringify(next));
    } catch { /* ignore */ }
    setCommentName('');
    setCommentEmail('');
    setCommentMsg('');
    setCommentPosted(true);
    if (commentTimerRef.current) window.clearTimeout(commentTimerRef.current);
    commentTimerRef.current = window.setTimeout(() => setCommentPosted(false), 4000);
  }

  /* never leave the 4s toast-reset timer running past the page */
  useEffect(() => () => { if (commentTimerRef.current) window.clearTimeout(commentTimerRef.current); }, []);

  const { article, englishTags } = (() => {
    const rawPosts = tRaw('newsPosts.posts');
    const locList = Array.isArray(rawPosts) ? (rawPosts as PostLoc[]) : [];
    const rawDetails = tRaw('newsPosts.articleDetails');
    const detailList = Array.isArray(rawDetails) ? (rawDetails as ArticleLoc[]) : [];

    const applyDetails = (a: Article, idx: number): Article => {
      const d = detailList[idx];
      if (!d) return a;
      return {
        ...a,
        readTime: d.readTime || a.readTime,
        dateDisplay: d.dateDisplay || a.dateDisplay,
        authorRole: d.authorRole || a.authorRole,
        content: d.content?.length ? d.content : a.content,
        subheadings: d.subheadings?.length ? d.subheadings : a.subheadings,
        checkList: d.checkList?.length ? d.checkList : a.checkList,
        quote: d.quote || a.quote,
        commentList: a.commentList.map((c, i) => ({
          ...c,
          date: d.commentDates?.[i] || c.date,
          text: d.commentTexts?.[i] || c.text,
        })),
      };
    };

    if (isRemoteId) {
      if (!remote || remote === 'missing') return { article: null as Article | null, englishTags: [] as string[] };
      const merged = buildRemoteArticle(remote, locList);
      const legacyNo = remote.legacyKey ? Number(remote.legacyKey) : NaN;
      const translated = Number.isFinite(legacyNo) ? applyDetails(merged, legacyNo - 1) : merged;
      return { article: translated, englishTags: merged.tags };
    }

    const baseArticle = (id && ARTICLES[id]) || DEFAULT_ARTICLE;
    const articleIndex = id ? Number(id) - 1 : 0;
    const loc = locList[articleIndex];
    const finalArticle = loc
      ? {
          ...baseArticle,
          title: loc.title || baseArticle.title,
          desc: loc.desc || baseArticle.desc,
          tags: loc.tags.length ? loc.tags : baseArticle.tags,
        }
      : baseArticle;
    return { article: applyDetails(finalArticle as Article, articleIndex) as Article, englishTags: baseArticle.tags };
  })();

  useEffect(() => {
    if (!article) return;
    document.title = `${article.title}${t('news.blogTitleSuffix')}`;
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', article.desc);

    let ogTitle = document.querySelector('meta[property="og:title"]');
    let ogDesc = document.querySelector('meta[property="og:description"]');
    let ogImage = document.querySelector('meta[property="og:image"]');
    let ogType = document.querySelector('meta[property="og:type"]');
    let ogUrl = document.querySelector('meta[property="og:url"]');
    if (!ogTitle) { ogTitle = document.createElement('meta'); ogTitle.setAttribute('property', 'og:title'); document.head.appendChild(ogTitle); }
    if (!ogDesc) { ogDesc = document.createElement('meta'); ogDesc.setAttribute('property', 'og:description'); document.head.appendChild(ogDesc); }
    if (!ogImage) { ogImage = document.createElement('meta'); ogImage.setAttribute('property', 'og:image'); document.head.appendChild(ogImage); }
    if (!ogType) { ogType = document.createElement('meta'); ogType.setAttribute('property', 'og:type'); document.head.appendChild(ogType); }
    if (!ogUrl) { ogUrl = document.createElement('meta'); ogUrl.setAttribute('property', 'og:url'); document.head.appendChild(ogUrl); }
    ogTitle.setAttribute('content', `${article.title} — VPNexues`);
    ogDesc.setAttribute('content', article.desc);
    ogImage.setAttribute('content', article.image);
    ogType.setAttribute('content', 'article');
    ogUrl.setAttribute('content', `https://vpnexues.com/news/${id}`);
  }, [article, id, t]);

  if (isRemoteId && remote === null && loadFailed) {
    // backend cold start / offline — the article EXISTS, only the fetch failed
    return (
      <div className={styles.loading}>
        <p>{t('common.somethingWentWrong')}</p>
        <button type="button" className={styles.backLink} onClick={() => setRetryTick((x) => x + 1)}>
          {t('account.retry')}
        </button>
      </div>
    );
  }
  if (isRemoteId && remote === null) return null; // article still loading
  if (isRemoteId && remote === 'missing') return <NotFound />;
  if (!article) return null;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: article.title,
    description: article.desc,
    image: article.image,
    datePublished: article.dateISO,
    dateModified: article.dateISO,
    wordCount: article.content.join(' ').split(/\s+/).length + article.subheadings.join(' ').split(/\s+/).length + article.checkList.join(' ').split(/\s+/).length,
    articleSection: article.tags[0] || 'Organic Farming',
    author: { '@type': 'Person', name: article.author },
    publisher: {
      '@type': 'Organization',
      name: 'VPNexues',
      logo: { '@type': 'ImageObject', url: 'https://vpnexues.com/logo.png' },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': `https://vpnexues.com/news/${id}` },
  };

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://vpnexues.com/' },
      { '@type': 'ListItem', position: 2, name: 'Blog & News', item: 'https://vpnexues.com/news' },
      { '@type': 'ListItem', position: 3, name: article.title },
    ],
  };

  return (
    <div className={styles.pageWrap}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(breadcrumbLd) }} />

      {/* Mobile banner */}
      <section className={styles.mobileBanner} aria-label="Page banner">
        <img
          src="https://res.cloudinary.com/eqjshlur/image/upload/v1790001865/vpnexues/old/site-assets/news/news-banner.jpg"
          alt="VPNexues blog — organic farming news"
          className={styles.mobileBannerImg}
          width={750}
          height={320}
        />
      </section>

      {/* Desktop pg-banner */}
      <section className={styles.desktopHero} aria-label="Page banner">
        <div className={styles.heroBg} />
        <div className={styles.heroInner}>
          <nav className={styles.breadcrumb} aria-label="Breadcrumb">
            <Link to="/">{t('shop.home')}</Link>
            <span aria-hidden="true">›</span>
            <Link to="/news">{t('news.ourBlog')}</Link>
            <span aria-hidden="true">›</span>
            <span aria-current="page">{t('news.article')}</span>
          </nav>
          <h1>{article.title}</h1>
        </div>
      </section>

      {/* Blog Details Section */}
      <section className={styles.blogDetails} aria-label="Article content">
        <div className="container">
          <div className={styles.detailsGrid}>
            {/* Article Column */}
            <main className={styles.articleCol}>
              {/* Main Article Card */}
              <article className={styles.mainCard} itemScope itemType="https://schema.org/BlogPosting">
                <div className={styles.featuredWrap}>
                  <img
                    src={article.image}
                    alt={`${article.title} — VPNexues`}
                    width={1200}
                    height={675}
                    loading="eager"
                    fetchPriority="high"
                    className={`${styles.featuredThumb} ${article.tallImage ? styles.featuredThumbTall : ''}`}
                    itemProp="image"
                  />
                  <span className={styles.readBadge}>{article.readTime} {t('news.readSuffix')}</span>
                </div>
                <div className={styles.detailsContent}>
                  <div className={styles.postMeta}>
                    <span className={styles.metaItem}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                      <span itemProp="author">{article.author}</span>
                    </span>
                    <span className={styles.metaItem}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                      <time dateTime={article.dateISO} itemProp="datePublished">{article.dateDisplay}</time>
                    </span>
                    <span className={styles.metaItem}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                      {article.readTime}
                    </span>
                  </div>

                  <h2 className={styles.articleTitle} itemProp="headline">{article.title}</h2>

                  {article.content.map((p, i) => (
                    <p key={i} itemProp="articleBody">{p}</p>
                  ))}

                  {article.subheadings.map((sh, i) => (
                    <div key={i}>
                      <h3 className={styles.sectionSub}>{sh}</h3>
                      {i === 0 && (
                        <ul className={styles.checkList} role="list">
                          {article.checkList.map((item, j) => (
                            <li key={j}>
                              <span className={styles.checkIcon} aria-hidden="true">✓</span>
                              {item}
                            </li>
                          ))}
                        </ul>
                      )}
                      {i === 1 && (
                        <blockquote className={styles.quoteCard}>
                          <div className={styles.quoteMark}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z"/></svg>
                          </div>
                          <p className={styles.quoteText}>&ldquo;{article.quote}&rdquo;</p>
                          <footer className={styles.quoteFooter}>
                            <span className={styles.quoteAvatar}>{article.author.split(' ').map(n => n[0]).join('')}</span>
                            <div className={styles.quoteAuthorInfo}>
                              <strong>{article.author}</strong>
                              <span>{article.authorRole}</span>
                            </div>
                          </footer>
                        </blockquote>
                      )}
                    </div>
                  ))}

                  {/* Tags & Share */}
                  <div className={styles.tagsShare}>
                    <div className={styles.tags}>
                      <span className={styles.tagLabel}>{t('news.topicsLabel')}</span>
                      {englishTags.map((tagKey, i) => (
                        <Link key={tagKey} to={`/news?tag=${encodeURIComponent(tagKey)}`} className={styles.tagPill}>{article.tags[i] ?? tagKey}</Link>
                      ))}
                    </div>
                    <div className={styles.share}>
                      <span className={styles.shareLabel}>{t('news.share')}:</span>
                      <button type="button" className={styles.shareBtn} onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank', 'noopener')} aria-label="Share on Facebook">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                      </button>
                      <button type="button" className={styles.shareBtn} onClick={() => window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(article.title)}`, '_blank', 'noopener')} aria-label="Share on Twitter">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
                      </button>
                      <button type="button" className={styles.shareBtn} onClick={() => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`, '_blank', 'noopener')} aria-label="Share on LinkedIn">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
                      </button>
                      <button type="button" className={styles.shareBtn} onClick={() => window.open('https://youtube.com/@vpnexuesofficial?si=NvImZFv9GecM4IKy', '_blank', 'noopener')} aria-label="Watch on YouTube">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                      </button>
                    </div>
                  </div>
                </div>
              </article>

              {/* Author Box */}
              <div className={styles.authorBox}>
                <span className={styles.authorAvatar}>{article.author.split(' ').map(n => n[0]).join('')}</span>
                <div>
                  <h4 className={styles.authorName}>{article.author}</h4>
                  <p className={styles.authorRole}>{article.authorRole} {t('news.authorLine')}</p>
                </div>
              </div>

              {/* Comments */}
              <section className={styles.commentsSection} aria-label="Comments">
                <h3 className={styles.sectionTitleSm}>{t('news.commentsTitle')} ({article.commentList.length + localComments.length})</h3>
                {[...article.commentList, ...localComments].map((c, i) => (
                  <div key={i} className={styles.commentItem}>
                    <span className={styles.commentAvatar}>{c.initials}</span>
                    <div className={styles.commentBody}>
                      <h5 className={styles.commentName}>{c.name}</h5>
                      <time className={styles.commentDate} dateTime={c.dateISO}>{c.date}</time>
                      <p className={styles.commentText}>{c.text}</p>
                    </div>
                  </div>
                ))}
              </section>

              {/* Comment Form */}
              <div className={styles.commentFormWrap}>
                <h3 className={styles.sectionTitleSm}>{t('news.leaveComment')}</h3>
                <form onSubmit={handleCommentSubmit}>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel} htmlFor="comment-name">{t('account.name')} *</label>
                      <input id="comment-name" type="text" className={styles.formControl} placeholder={t('common.enterYourName')} required value={commentName} onChange={(e) => setCommentName(e.target.value)} />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel} htmlFor="comment-email">{t('account.email')} *</label>
                      <input id="comment-email" type="email" className={styles.formControl} placeholder="your@email.com" required value={commentEmail} onChange={(e) => setCommentEmail(e.target.value)} />
                    </div>
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel} htmlFor="comment-msg">{t('contact.message')} *</label>
                    <textarea id="comment-msg" className={styles.formControl} rows={5} placeholder={t('news.writeComment')} required value={commentMsg} onChange={(e) => setCommentMsg(e.target.value)} />
                  </div>
                  <button type="submit" className={styles.submitBtn}>{t('news.postComment')}</button>
                  {commentPosted && (
                    <p role="status" style={{ color: '#16a34a', fontSize: 13, marginTop: 8 }}>
                      ✓ {t('news.commentPosted') === 'news.commentPosted' ? 'Thanks! Your comment is now visible below.' : t('news.commentPosted')}{' '}
                      <span style={{ color: '#6b7280' }}>(saved on this device)</span>
                    </p>
                  )}
                </form>
              </div>
            </main>

            {/* Sidebar Column */}
            <aside className={styles.sidebar}>
              {/* Search */}
              <div className={styles.widget}>
                <h3 className={styles.widgetTitle}>{t('news.search')}</h3>
                <form className={styles.searchForm} onSubmit={(e) => { e.preventDefault(); navigate(searchText.trim() ? `/news?search=${encodeURIComponent(searchText.trim())}` : '/news'); }} role="search">
                  <input type="search" placeholder={t('news.searchPlaceholder')} aria-label={t('news.search')} value={searchText} onChange={(e) => setSearchText(e.target.value)} />
                  <button type="submit" aria-label={t('news.search')}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                  </button>
                </form>
              </div>

              {/* Popular Posts */}
              <div className={styles.widget}>
                <h3 className={styles.widgetTitle}>{t('news.popularPosts')}</h3>
                <div className={styles.popularList}>
                  {POPULAR_POSTS.map((post, i) => {
                    const raw = tRaw('newsPosts.recentPosts');
                    const list = Array.isArray(raw) ? (raw as { title: string; date: string }[]) : [];
                    const loc = list[i];
                    const title = loc?.title ?? post.title;
                    const date = loc?.date ?? post.date;
                    return (
                      <Link key={post.id} to={`/news/${post.id}`} className={styles.popularItem}>
                        <img src={post.image} alt={title} width={72} height={72} loading="lazy" className={styles.popularImg} />
                        <div className={styles.popularBody}>
                          <h4 className={styles.popularTitle}>{title}</h4>
                          <time className={styles.popularDate}>{date}</time>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Tags */}
              <div className={styles.widget}>
                <h3 className={styles.widgetTitle}>{t('news.topics')}</h3>
                <div className={styles.tagCloud}>
                  {([
                    { key: 'Organic', labelKey: 'news.tagOrganic' },
                    { key: 'Export', labelKey: 'news.tagExport' },
                    { key: 'Spices', labelKey: 'news.tagSpices' },
                    { key: 'Farm', labelKey: 'news.tagFarm' },
                    { key: 'Fresh', labelKey: 'news.tagFresh' },
                  ]).map((tag) => (
                    <Link key={tag.key} to={`/news?tag=${tag.key}`} className={styles.tagBtn}>{t(tag.labelKey)}</Link>
                  ))}
                </div>
              </div>

              {/* Back to News */}
              <Link to="/news" className={styles.backLink}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
                {t('news.backToAll')}
              </Link>
            </aside>
          </div>
        </div>
      </section>
    </div>
  );
}
