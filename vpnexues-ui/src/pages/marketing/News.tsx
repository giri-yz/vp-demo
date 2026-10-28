import { useState, useMemo, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useLanguage } from '../../i18n/LanguageContext';
import { assetUrl, fetchNews, formatDateDisplay, splitTags, type NewsArticleRow } from '../../api/contentApi';
import { jsonLdScript } from '../../utils/jsonLd';
import { submitContactMessage } from '../../api/contactApi';
import styles from './css/News.module.css';

interface BlogPost {
  id: number | string;
  /** '1'..'7' for seeded articles — links a DB row to its built-in list entry. */
  legacyKey?: string;
  image: string;
  author: string;
  date: string;
  dateDisplay: string;
  comments: number;
  readTime: string;
  title: string;
  desc: string;
  tags: string[];
  /**
   * English tags kept alongside a translated copy — filtering and ?tag= links
   * always use English labels, only the pill display is localized.
   */
  englishTags?: string[];
  /** Portrait/tall artwork renders full-height instead of the 16:9 crop. */
  tallImage?: boolean;
  /** Mobile-only: fill the 16:9 frame instead of the natural fit. */
  mobileCover?: boolean;
}

const BLOG_POSTS: BlogPost[] = [
  {
    id: 1,
    image: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001873/vpnexues/old/site-assets/news/news-sustainable.jpg',
    author: 'Pradeep K.',
    date: '2026-06-12',
    dateDisplay: '12 June, 2026',
    comments: 4,
    readTime: '3 min',
    title: 'Sustainable Farming: Feeding the Future Responsibly',
    desc: 'Discover how VPNexues integrates organic practices with modern supply chains to deliver farm-fresh produce across the globe.',
    tags: ['Organic', 'Farm', 'Fresh'],
  },
  {
    id: 2,
    image: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001870/vpnexues/old/site-assets/news/news-spices.jpg',
    author: 'Nageswaran D.',
    date: '2026-06-01',
    dateDisplay: '1 June, 2026',
    comments: 7,
    readTime: '4 min',
    title: 'From Farm to Table: The Journey of Organic Spices',
    desc: 'Explore the traceability and quality control that makes VPNexues spices stand out in international markets.',
    tags: ['Spices', 'Organic', 'Export'],
  },
  {
    id: 3,
    image: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001868/vpnexues/old/site-assets/news/news-export.jpg',
    author: 'Admin',
    date: '2026-05-15',
    dateDisplay: '15 May, 2026',
    comments: 2,
    readTime: '3 min',
    title: 'Export Trends: Indian Organic Produce in 2026',
    desc: 'Insights into the growing demand for Indian organic products and how VPNexues is leading the charge.',
    tags: ['Export', 'Organic', 'Farm'],
  },
  {
    id: 4,
    image: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790169769/vpnexues/news/news-tractor.png',
    author: 'Pradeep K.',
    date: '2026-05-05',
    dateDisplay: '5 May, 2026',
    comments: 3,
    readTime: '3 min',
    title: 'Freshness You Can Taste: Our Cold-Chain Promise',
    desc: 'Every product that leaves our facility is packed with peak freshness preserved through our advanced cold-chain logistics network.',
    tags: ['Fresh', 'Organic', 'Farm'],
  },
  {
    id: 5,
    tallImage: true,
    mobileCover: true,
    image: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790168677/vpnexues/news/organic-vegan.jpg',
    author: 'Hemaanth R.',
    date: '2026-04-20',
    dateDisplay: '20 April, 2026',
    comments: 5,
    readTime: '4 min',
    title: '100% Plant-Based: Organic Vegan Produce from Tamil Nadu',
    desc: 'From naturally grown vegetables to plant-based staples, VPNexues delivers certified organic vegan products to health-conscious consumers worldwide.',
    tags: ['Organic', 'Farm', 'Fresh'],
  },
  {
    id: 6,
    tallImage: true,
    mobileCover: true,
    image: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790167072/vpnexues/news/local-organic.jpg',
    author: 'Nageswaran D.',
    date: '2026-04-10',
    dateDisplay: '10 April, 2026',
    comments: 6,
    readTime: '3 min',
    title: 'Pride of Tamil Nadu: Supporting Local Organic Farmers',
    desc: 'VPNexues partners with over 200 organic farms across Tamil Nadu, ensuring fair prices and sustainable practices for every farmer in our network.',
    tags: ['Organic', 'Farm', 'Fresh'],
  },
  {
    id: 7,
    image: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001863/vpnexues/old/site-assets/news/news-banner-main.jpg',
    author: 'Libin K.',
    date: '2026-03-28',
    dateDisplay: '28 March, 2026',
    comments: 4,
    readTime: '5 min',
    title: 'Premium Grade: Handpicked Organic Spices for Global Kitchens',
    desc: 'Our premium spice collection is carefully handpicked, tested for purity and packaged to preserve the authentic flavour that international chefs demand.',
    tags: ['Organic', 'Spices', 'Export'],
  },
];

const RECENT_POSTS = [
  { id: 1, image: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001847/vpnexues/old/site-assets/news/gallery-02.jpg', title: 'Smart Packaging & Product Design', date: '2026-05-18', dateDisplay: '18 May, 2026' },
  { id: 4, image: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001849/vpnexues/old/site-assets/news/gallery-04.jpg', title: 'Drivers Deliver More Than Products', date: '2026-04-29', dateDisplay: '29 April, 2026' },
  { id: 5, image: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001852/vpnexues/old/site-assets/news/gallery-06.jpg', title: 'Organic Mangoes: A Sweet Success', date: '2026-04-10', dateDisplay: '10 April, 2026' },
];

const TAGS = [
  { key: 'news.tagOrganic', label: 'Organic', emoji: '🌱', color: '#2f7d2c' },
  { key: 'news.tagExport', label: 'Export', emoji: '📦', color: '#1a5f7a' },
  { key: 'news.tagSpices', label: 'Spices', emoji: '🌶️', color: '#b45f2a' },
  { key: 'news.tagFarm', label: 'Farm', emoji: '🚜', color: '#4a7c59' },
  { key: 'news.tagFresh', label: 'Fresh', emoji: '🥬', color: '#3b8c5e' },
];

function rowToPost(row: NewsArticleRow): BlogPost {
  const legacy = row.legacyKey;
  const tall = legacy === '5' || legacy === '6';
  return {
    id: row.id,
    legacyKey: legacy ?? undefined,
    image: assetUrl(row.imageUrl),
    author: row.author,
    date: row.publishedDate,
    dateDisplay: formatDateDisplay(row.publishedDate),
    comments: row.comments,
    readTime: row.readTime,
    title: row.title,
    desc: row.excerpt ?? '',
    tags: splitTags(row.tags),
    tallImage: tall,
    mobileCover: tall,
  };
}

function sameTags(a: string[], b: string[]): boolean {
  return a.join('|') === b.join('|');
}

export default function News() {
  const { t, tRaw } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTag = searchParams.get('tag');
  const initialSearch = searchParams.get('search') ?? '';
  const [activeTag, setActiveTag] = useState<string | null>(initialTag);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [nlEmail, setNlEmail] = useState('');
  const [nlDone, setNlDone] = useState(false);
  const [nlError, setNlError] = useState('');
  const [nlSending, setNlSending] = useState(false);
  // Static BLOG_POSTS render instantly; the API replaces them on load (the
  // static copy stays as the fallback when the backend is unreachable).
  const [remotePosts, setRemotePosts] = useState<BlogPost[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchNews()
      .then((rows) => {
        if (!cancelled) setRemotePosts(rows.map(rowToPost));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  function handleSubscribe(e: React.FormEvent) {
    e.preventDefault();
    if (nlSending) return;
    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(nlEmail.trim());
    if (!ok) {
      setNlError(t('news.invalidEmail'));
      return;
    }
    setNlError('');
    setNlSending(true);
    submitContactMessage({
      name: 'Newsletter Subscriber',
      email: nlEmail.trim(),
      subject: 'Newsletter subscription',
      message: `Please subscribe ${nlEmail.trim()} to the newsletter (via news page).`,
    }).then(() => {
      setNlDone(true);
    }).catch(() => {
      setNlError(t('news.subscribeFailed') === 'news.subscribeFailed' ? 'Could not subscribe. Please try again.' : t('news.subscribeFailed'));
    }).finally(() => {
      setNlSending(false);
    });
  }

  const localizedPosts = useMemo(() => {
    const raw = tRaw('newsPosts.posts');
    const list = Array.isArray(raw) ? (raw as { title: string; desc: string; tags: string[] }[]) : [];
    const base = remotePosts ?? BLOG_POSTS;
    return base.map((post) => {
      // Translate only fields that still match the built-in English original,
      // so admin-edited titles/descriptions/tags are never overridden.
      const legacyNo = post.legacyKey
        ? Number(post.legacyKey)
        : typeof post.id === 'number'
          ? post.id
          : NaN;
      const original = Number.isFinite(legacyNo) ? BLOG_POSTS[legacyNo - 1] : undefined;
      const loc = original ? list[legacyNo - 1] : undefined;
      if (!loc || !original) return post;
      const localizeTags = loc.tags.length && sameTags(post.tags, original.tags);
      return {
        ...post,
        title: post.title === original.title ? loc.title : post.title,
        desc: post.desc === original.desc ? loc.desc : post.desc,
        tags: localizeTags ? loc.tags : post.tags,
        englishTags: localizeTags ? post.tags : undefined,
      };
    });
  }, [tRaw, remotePosts]);

  const localizedRecent = useMemo(() => {
    const raw = tRaw('newsPosts.recentPosts');
    const list = Array.isArray(raw) ? (raw as { title: string; date: string }[]) : [];
    return RECENT_POSTS.map((post, i) => {
      const loc = list[i];
      return loc ? { ...post, title: loc.title, dateDisplay: loc.date } : post;
    });
  }, [tRaw]);

  useEffect(() => {
    document.title = t('news.pageTitle');
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', 'Read the latest news, farming insights, organic produce updates and export trends from VPNexues — Tamil Nadu\'s trusted farm-to-table supplier.');

    let ogTitle = document.querySelector('meta[property="og:title"]');
    let ogDesc = document.querySelector('meta[property="og:description"]');
    let ogType = document.querySelector('meta[property="og:type"]');
    let ogUrl = document.querySelector('meta[property="og:url"]');
    if (!ogTitle) { ogTitle = document.createElement('meta'); ogTitle.setAttribute('property', 'og:title'); document.head.appendChild(ogTitle); }
    if (!ogDesc) { ogDesc = document.createElement('meta'); ogDesc.setAttribute('property', 'og:description'); document.head.appendChild(ogDesc); }
    if (!ogType) { ogType = document.createElement('meta'); ogType.setAttribute('property', 'og:type'); document.head.appendChild(ogType); }
    if (!ogUrl) { ogUrl = document.createElement('meta'); ogUrl.setAttribute('property', 'og:url'); document.head.appendChild(ogUrl); }
    ogTitle.setAttribute('content', 'Blog & News — VPNexues');
    ogDesc.setAttribute('content', 'Read the latest news, farming insights, organic produce updates and export trends from VPNexues.');
    ogType.setAttribute('content', 'website');
    ogUrl.setAttribute('content', 'https://vpnexues.com/news');
  }, [t]);

  const filteredPosts = useMemo(() => {
    let posts = localizedPosts;
    if (activeTag) {
      posts = posts.filter((post) => (post.englishTags ?? post.tags).includes(activeTag));
    }
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      posts = posts.filter(post =>
        post.title.toLowerCase().includes(q) ||
        post.desc.toLowerCase().includes(q)
      );
    }
    return posts;
  }, [localizedPosts, activeTag, searchQuery]);

  const handleTagClick = (tagLabel: string) => {
    const next = activeTag === tagLabel ? null : tagLabel;
    setActiveTag(next);
    // mirror the active pill into ?tag= so refresh/share keeps the filtered view
    // (replace:true = no history spam per pill click)
    setSearchParams((prev) => {
      const p = new URLSearchParams(prev);
      if (next) p.set('tag', next);
      else p.delete('tag');
      return p;
    }, { replace: true });
  };

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'VPNexues Blog & News',
    description: 'Farming insights, organic produce updates and export trends from VPNexues.',
    url: 'https://vpnexues.com/news',
    blogPost: localizedPosts.map((p) => {
      return {
        '@type': 'BlogPosting',
        headline: p.title,
        abstract: p.desc,
        datePublished: p.date,
        dateModified: p.date,
        author: { '@type': 'Person', name: p.author },
        image: p.image,
      };
    }),
  };

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://vpnexues.com/' },
      { '@type': 'ListItem', position: 2, name: 'Blog & News', item: 'https://vpnexues.com/news' },
    ],
  };

  return (
    <div className={styles.pageWrap}>
      {/* Structured Data */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(breadcrumbLd) }} />

      {/* Mobile banner */}
      <section className={styles.mobileBanner} aria-label="News page banner">
        <img
          src="https://res.cloudinary.com/eqjshlur/image/upload/v1790001865/vpnexues/old/site-assets/news/news-banner.jpg"
          alt="VPNexues blog and news — organic farming insights"
          className={styles.mobileBannerImg}
          width={750}
          height={320}
        />
      </section>

      {/* Desktop hero green bar */}
      <section className={styles.desktopHero}>
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <Link to="/">{t('shop.home')}</Link>
          <span aria-hidden="true">›</span>
          <span aria-current="page">{t('news.ourBlog')}</span>
        </nav>
        <svg className={`${styles.leafDeco} ${styles.leafLeft}`} viewBox="0 0 120 160" xmlns="http://www.w3.org/2000/svg">
          <path d="M60 10 C30 40, 10 80, 20 140 C20 140, 40 100, 60 80 C80 100, 100 140, 100 140 C110 80, 90 40, 60 10Z" fill="#4d7c3f" opacity="0.5"/>
          <path d="M60 10 C60 60, 60 100, 60 140" stroke="#4d7c3f" strokeWidth="1.5" fill="none" opacity="0.4"/>
        </svg>
        <svg className={`${styles.leafDeco} ${styles.leafRight}`} viewBox="0 0 120 160" xmlns="http://www.w3.org/2000/svg">
          <path d="M60 10 C30 40, 10 80, 20 140 C20 140, 40 100, 60 80 C80 100, 100 140, 100 140 C110 80, 90 40, 60 10Z" fill="#4d7c3f" opacity="0.5"/>
          <path d="M60 10 C60 60, 60 100, 60 140" stroke="#4d7c3f" strokeWidth="1.5" fill="none" opacity="0.4"/>
        </svg>
        <h1>{t('news.ourBlog')}</h1>
      </section>

      {/* Blog Section */}
      <section className={styles.blogSection} aria-label="Blog posts">
        <div className="container">
          {/* Active filter indicator */}
          {(activeTag || searchQuery) && (
            <div className={styles.activeFilterBar}>
              <span className={styles.activeFilterLabel}>
                {filteredPosts.length} {filteredPosts.length === 1 ? t('news.post') : t('news.posts')}
                {activeTag && <> {t('news.tagged')} <strong>{activeTag}</strong></>}
                {searchQuery && <> {t('news.matching')} <strong>"{searchQuery}"</strong></>}
              </span>
              <button
                type="button"
                className={styles.clearFilterBtn}
                onClick={() => { setActiveTag(null); setSearchQuery(''); setSearchParams({}, { replace: true }); }}
              >
                {t('news.clearAll')}
              </button>
            </div>
          )}

          <div className={styles.blogGrid}>
            {/* Blog Posts Column */}
            <main className={styles.postsCol}>
              {filteredPosts.length === 0 && (
                <div className={styles.noPosts}>
                  <p>{t('news.noPosts')}</p>
                </div>
              )}
              {filteredPosts.map((post, idx) => (
                <article key={post.id} className={styles.postCard} itemScope itemType="https://schema.org/BlogPosting">
                  <Link
                    to={`/news/${post.id}`}
                    className={`${styles.postThumbLink} ${post.tallImage ? styles.postThumbLinkTall : ''} ${post.mobileCover ? styles.postThumbLinkMobileCover : ''}`}
                  >
                    <img
                      src={post.image}
                      alt={`${post.title} — VPNexues blog`}
                      width={800}
                      height={450}
                      loading={idx < 2 ? 'eager' : 'lazy'}
                      decoding="async"
                      className={`${styles.postThumb} ${post.tallImage ? styles.postThumbTall : ''} ${post.mobileCover ? styles.postThumbMobileCover : ''}`}
                      itemProp="image"
                    />
                    <span className={styles.readBadge}>{post.readTime}</span>
                  </Link>
                  <div className={styles.postBody}>
                    <div className={styles.postTags}>
                      {post.tags.slice(0, 2).map(tag => (
                        <span key={tag} className={styles.postTag}>{tag}</span>
                      ))}
                    </div>
                    <h2 className={styles.postTitle} itemProp="headline">
                      <Link to={`/news/${post.id}`} itemProp="url">{post.title}</Link>
                    </h2>
                    <p className={styles.postDesc} itemProp="abstract">{post.desc}</p>
                    <div className={styles.postFooter}>
                      <div className={styles.postAuthor}>
                        <span className={styles.authorAvatar}>{post.author.split(' ').map(n => n[0]).join('')}</span>
                        <div className={styles.authorInfo}>
                          <span className={styles.authorName} itemProp="author">{post.author}</span>
                          <time className={styles.postDate} dateTime={post.date} itemProp="datePublished">{post.dateDisplay}</time>
                        </div>
                      </div>
                      <Link to={`/news/${post.id}`} className={styles.readMore}>
                        {t('news.readMore')} <span aria-hidden="true">→</span>
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </main>

            {/* Sidebar Column */}
            <aside className={styles.sidebar}>
              {/* Search */}
              <div className={styles.widget}>
                <h3 className={styles.widgetTitle}>{t('news.search')}</h3>
                <form className={styles.searchForm} onSubmit={(e) => e.preventDefault()} role="search">
                  <input
                    type="search"
                    placeholder={t('news.searchPlaceholder')}
                    value={searchQuery}
                    onChange={(e) => {
                  const v = e.target.value;
                  setSearchQuery(v);
                  // keep ?search= in sync (replace:true = no history entry per keystroke)
                  setSearchParams((prev) => {
                    const p = new URLSearchParams(prev);
                    if (v) p.set('search', v);
                    else p.delete('search');
                    return p;
                  }, { replace: true });
                }}
                    aria-label={t('news.search')}
                  />
                  <button type="submit" aria-label={t('news.search')}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                  </button>
                </form>
              </div>

              {/* Tags */}
              <div className={styles.widget}>
                <h3 className={styles.widgetTitle}>{t('news.topics')}</h3>
                <div className={styles.tagCloud}>
                  {TAGS.map((tag) => (
                    <button
                      key={tag.label}
                      type="button"
                      className={`${styles.tagBtn} ${activeTag === tag.label ? styles.tagBtnActive : ''}`}
                      style={{ '--tag-color': tag.color } as React.CSSProperties}
                      onClick={() => handleTagClick(tag.label)}
                      aria-pressed={activeTag === tag.label}
                    >
                      <span aria-hidden="true">{tag.emoji}</span> {t(tag.key)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Recent News */}
              <div className={styles.widget}>
                <h3 className={styles.widgetTitle}>{t('news.recentNews')}</h3>
                <div className={styles.recentList}>
                  {localizedRecent.map((post) => (
                    <Link key={post.id} to={`/news/${post.id}`} className={styles.recentItem}>
                      <img
                        src={post.image}
                        alt={post.title}
                        width={72}
                        height={72}
                        loading="lazy"
                        className={styles.recentImg}
                      />
                      <div className={styles.recentBody}>
                        <h4 className={styles.recentTitle}>{post.title}</h4>
                        <time className={styles.recentDate} dateTime={post.date}>{post.dateDisplay}</time>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Newsletter CTA */}
              <div className={`${styles.widget} ${styles.newsletterWidget}`}>
                <h3 className={styles.widgetTitle}>{t('news.stayUpdated')}</h3>
                <p className={styles.newsletterText}>{t('news.newsletterText')}</p>
                <form className={styles.newsletterForm} onSubmit={handleSubscribe}>
                  {nlDone ? (
                    <p className={styles.newsletterSuccess} role="status">✓ {t('news.subscribedMsg')}</p>
                  ) : (
                    <>
                      <input
                        type="email"
                        placeholder={t('news.yourEmail')}
                        aria-label={t('news.emailForNewsletter')}
                        value={nlEmail}
                        onChange={(e) => setNlEmail(e.target.value)}
                      />
                      {nlError && <p className={styles.newsletterError} role="alert">{nlError}</p>}
                      <button type="submit" disabled={nlSending}>{nlSending ? '...' : t('news.subscribeBtn')}</button>
                    </>
                  )}
                </form>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </div>
  );
}
