import { useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties, MouseEvent as ReactMouseEvent } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectFade } from 'swiper/modules';
import type { Swiper as SwiperInstance } from 'swiper/types';
import 'swiper/css';
import 'swiper/css/effect-fade';
import { listProducts } from '../../api/productsApi';
import { useCountry } from '../../context/CountryContext';
import { useLanguage } from '../../i18n/LanguageContext';
import type { Product } from '../../types';
import {
  IconApple,
  IconArrowRight,
  IconBasket,
  IconBoxes,
  IconBuilding,
  IconLeaf,
  IconPackage,
} from '../../components/common/icons';
import ProductCard from '../../components/common/ProductCard';
import AvoidJunk from '../../components/common/AvoidJunk';
import Reveal from '../../components/common/Reveal';
import Seo from '../../components/common/Seo';
import { SEO } from '../../config/seoMeta';
import styles from './css/Home.module.css';

/* ===================================================================
   3D / motion helpers (framer-motion + CSS transforms, no new deps).
   All pointer effects are gated to fine-pointer devices that have NOT
   requested reduced motion, so touch screens keep the plain layout.
   =================================================================== */
function canHoverMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return (
    window.matchMedia('(hover: hover) and (pointer: fine)').matches &&
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

/* Hero parallax — writes −1..1 normalised cursor position onto the stage as
   CSS vars; the three depth layers read them at different rates (background
   slow, foreground fast) via any translate3d. */
function heroParallaxMove(e: ReactMouseEvent<HTMLDivElement>) {
  if (!canHoverMotion()) return;
  const el = e.currentTarget;
  const r = el.getBoundingClientRect();
  if (!r.width || !r.height) return;
  el.style.setProperty('--hero-px', (((e.clientX - r.left) / r.width - 0.5) * 2).toFixed(3));
  el.style.setProperty('--hero-py', (((e.clientY - r.top) / r.height - 0.5) * 2).toFixed(3));
}
function heroParallaxLeave(e: ReactMouseEvent<HTMLDivElement>) {
  const el = e.currentTarget;
  el.style.setProperty('--hero-px', '0');
  el.style.setProperty('--hero-py', '0');
}

/* Magnetic CTA — the button leans a few px toward the cursor and springs back
   on leave (paired with the 3D lift in CSS). */
function magneticMove(e: ReactMouseEvent<HTMLElement>) {
  if (!canHoverMotion()) return;
  const el = e.currentTarget;
  const r = el.getBoundingClientRect();
  el.style.setProperty('--mag-x', `${((e.clientX - (r.left + r.width / 2)) * 0.28).toFixed(1)}px`);
  el.style.setProperty('--mag-y', `${((e.clientY - (r.top + r.height / 2)) * 0.28).toFixed(1)}px`);
}
function magneticLeave(e: ReactMouseEvent<HTMLElement>) {
  const el = e.currentTarget;
  el.style.setProperty('--mag-x', '0px');
  el.style.setProperty('--mag-y', '0px');
}

/* Mouse-track tilt — writes rotateX/rotateY (capped) from cursor position for
   preserve-3d cards. Returns handlers so a `max` per surface can be baked in. */
function tiltMove(max: number) {
  return (e: ReactMouseEvent<HTMLElement>) => {
    if (!canHoverMotion()) return;
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    if (!r.width || !r.height) return;
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    el.style.setProperty('--tilt-ry', `${((px - 0.5) * 2 * max).toFixed(2)}deg`);
    el.style.setProperty('--tilt-rx', `${((0.5 - py) * 2 * max).toFixed(2)}deg`);
  };
}
function tiltLeave(e: ReactMouseEvent<HTMLElement>) {
  const el = e.currentTarget;
  el.style.removeProperty('--tilt-ry');
  el.style.removeProperty('--tilt-rx');
}

/* Stable per-surface handlers (built once, not per render). */
const categoryTiltMove = tiltMove(12); // Shop-by-Category cards — 12deg cap
const phoneTiltMove = tiltMove(10); // App-section phone mockup — 10deg cap

/* Deterministic pseudo-random seeds (stable across renders / StrictMode). */
function seeded(i: number, salt: number): number {
  return (((Math.sin(i * 12.9898 + salt * 78.233) * 43758.5453) % 1) + 1) % 1;
}

/* Falling-leaf + soil-particle field for the hero (generated, no assets). */
const HERO_LEAVES = Array.from({ length: 9 }, (_, i) => ({
  left: 5 + seeded(i, 1) * 90,
  size: 14 + Math.round(seeded(i, 2) * 16),
  duration: 6 + seeded(i, 3) * 5,
  delay: -seeded(i, 4) * 10,
  drift: Math.round((seeded(i, 5) - 0.5) * 180),
  rot: 360 + Math.round(seeded(i, 6) * 720),
  blur: seeded(i, 7) * 1.4,
  opacity: 0.45 + seeded(i, 8) * 0.45,
}));

const HERO_SOIL = Array.from({ length: 16 }, (_, i) => ({
  left: seeded(i, 21) * 100,
  size: 2 + seeded(i, 22) * 3,
  duration: 4 + seeded(i, 23) * 4,
  delay: -seeded(i, 24) * 8,
  drift: Math.round((seeded(i, 25) - 0.5) * 90),
  blur: seeded(i, 26) * 1.2,
  opacity: 0.2 + seeded(i, 27) * 0.35,
}));

/* Splits a heading into per-word spans so each word can fade-up in 3D on a
   stagger. Word-level (not letter) keeps every locale readable — Tamil/Hindi
   etc. still split cleanly without breaking grapheme clusters. */
function HeroWords({ text }: { text: string }) {
  const words = text.split(' ');
  return (
    <>
      {words.map((word, i) => (
        <span
          key={`${word}-${i}`}
          className={styles.heroWord}
          style={{ '--wi': i } as CSSProperties}
        >
          {word}
          {i < words.length - 1 ? '\u00A0' : ''}
        </span>
      ))}
    </>
  );
}

/* Decorative falling leaves + drifting soil particles, purely aria-hidden. */
function HeroParticles() {
  return (
    <div className={styles.heroParticles} aria-hidden="true">
      {HERO_SOIL.map((p, i) => (
        <span
          key={`soil-${i}`}
          className={styles.heroSoil}
          style={{
            left: `${p.left}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            opacity: p.opacity,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
            '--drift': `${p.drift}px`,
            '--blur': `${p.blur}px`,
          } as CSSProperties}
        />
      ))}
      {HERO_LEAVES.map((l, i) => (
        <span
          key={`leaf-${i}`}
          className={styles.heroLeaf}
          style={{
            left: `${l.left}%`,
            width: `${l.size}px`,
            height: `${l.size}px`,
            opacity: l.opacity,
            animationDuration: `${l.duration}s`,
            animationDelay: `${l.delay}s`,
            '--drift': `${l.drift}px`,
            '--rot': `${l.rot}deg`,
            '--blur': `${l.blur}px`,
          } as CSSProperties}
        >
          <IconLeaf width="100%" height="100%" />
        </span>
      ))}
    </div>
  );
}

/* Trust-bar entrance: each card flips up into place on scroll (staggered). */
const PROMISE_CONTAINER: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09 } },
};
const PROMISE_ITEM: Variants = {
  hidden: { opacity: 0, y: 30, rotateX: -55 },
  show: {
    opacity: 1,
    y: 0,
    rotateX: 0,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
};

const HERO_SLIDE_KEYS = [
  {
    image: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001637/vpnexues/old/site-assets/hero/home-1.png',
    eyebrow: 'home.hero1Eyebrow',
    line1: 'home.hero1Line1',
    line2: 'home.hero1Line2',
    subtitle: 'home.hero1Subtitle',
    primaryCta: { label: 'home.hero1Primary', to: '/about' },
    secondaryCta: { label: 'home.ourServices', to: '/service' },
  },
  {
    image: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001670/vpnexues/old/site-assets/hero/home-3.png',
    eyebrow: 'home.heroEyebrow2',
    line1: 'home.heroLine2a',
    line2: 'home.heroLine2b',
    subtitle: 'home.hero2Subtitle',
    primaryCta: { label: 'home.exploreProducts', to: '/shop' },
    secondaryCta: { label: 'home.ourServices', to: '/service' },
  },
  {
    image: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001685/vpnexues/old/site-assets/hero/home-4.png',
    eyebrow: 'home.hero3Eyebrow',
    line1: 'home.hero3Line1',
    line2: 'home.hero3Line2',
    subtitle: 'home.hero3Subtitle',
    primaryCta: { label: 'header.shopNow', to: '/shop' },
    secondaryCta: { label: 'home.learnMore', to: '/service' },
  },
] as const;

const PROMISE_KEYS = [
  { title: 'service.fastDelivery', text: 'service.fastDeliveryDesc' },
  { title: 'service.bestQuality', text: 'service.bestQualityDesc' },
  { title: 'service.noMinOrder', text: 'service.noMinOrderDesc' },
  { title: 'service.easyReturns', text: 'service.easyReturnsDesc' },
] as const;

/* Card background tint per category (token colours defined in tokens.css) */
const CATEGORY_TINT_CLASS = {
  sageMid: styles.catImgCardSageMid,
  leaf: styles.catImgCardLeaf,
} as const;

const CATEGORY_KEYS = [
  { label: 'home.vegetables', sub: 'home.vegetablesSub', alt: 'home.vegetablesAlt', explore: 'home.exploreVegetables', icon: 'leaf', img: 'https://res.cloudinary.com/eqjshlur/image/upload/v1792144816/vpnexues/home/categories/vegetables-basket.png', to: '/shop?category=Vegetables', tint: 'sageMid' },
  { label: 'home.fruits', sub: 'home.fruitsSub', alt: 'home.fruitsAlt', explore: 'home.exploreFruits', icon: 'apple', img: 'https://res.cloudinary.com/eqjshlur/image/upload/v1792144819/vpnexues/home/categories/fruits-basket.png', to: '/shop?category=Fruits', tint: 'leaf' },
  { label: 'home.groceries', sub: 'home.groceriesSub', alt: 'home.groceriesAlt', explore: 'home.exploreGroceries', icon: 'basket', img: 'https://res.cloudinary.com/eqjshlur/image/upload/v1792144822/vpnexues/home/categories/grocery-basket.png', to: '/shop?category=Groceries', tint: 'sageMid' },
  { label: 'home.smallBox', sub: 'home.smallBoxSub', alt: 'home.smallBoxAlt', explore: 'home.exploreSmallBox', icon: 'package', img: 'https://res.cloudinary.com/eqjshlur/image/upload/v1792144826/vpnexues/home/categories/small-box.png', to: '/pricing/small-box', tint: 'leaf' },
  { label: 'home.bigBox', sub: 'home.bigBoxSub', alt: 'home.bigBoxAlt', explore: 'home.exploreBigBox', icon: 'boxes', img: 'https://res.cloudinary.com/eqjshlur/image/upload/v1792144830/vpnexues/home/categories/big-box.png', to: '/pricing/big-box', tint: 'sageMid' },
  { label: 'home.b2bSupply', sub: 'home.b2bSupplySub', alt: 'home.b2bAlt', explore: 'home.exploreB2b', icon: 'building', img: 'https://res.cloudinary.com/eqjshlur/image/upload/v1792144832/vpnexues/home/categories/b2b-supply.png', to: '/pricing/b2b', tint: 'leaf' },
] as const;

/* Icon badge per category card (matches the `icon` field on CATEGORY_KEYS) */
const CATEGORY_ICONS = {
  leaf: IconLeaf,
  apple: IconApple,
  basket: IconBasket,
  package: IconPackage,
  boxes: IconBoxes,
  building: IconBuilding,
} as const;

const PRODUCT_CATEGORY_KEYS = [
  { key: 'Vegetables', title: 'home.freshVegetables', overline: 'home.farmPickedDaily' },
  { key: 'Fruits', title: 'home.freshFruits', overline: 'home.seasonalFavourites' },
  { key: 'Groceries', title: 'home.groceryEssentials', overline: 'home.kitchenStaples' },
] as const;

export default function Home() {
  const { country } = useCountry();
  const { t } = useLanguage();
  const [catProducts, setCatProducts] = useState<Record<string, Product[]>>({});
  const [activeSlide, setActiveSlide] = useState(0);
  const heroSwiperRef = useRef<SwiperInstance | null>(null);
  const [catReducedMotion] = useState(
    () => typeof window !== 'undefined' && !!window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );

  // Fresh Picks — one side-scrolling rail per category
  const pickRailRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const scrollPickRowBy = (key: string, dir: 1 | -1) => {
    const rail = pickRailRefs.current[key];
    if (!rail) return;
    rail.scrollBy({
      left: dir * Math.max(rail.clientWidth * 0.8, 240),
      behavior: catReducedMotion ? 'auto' : 'smooth',
    });
  };

  useEffect(() => {
    let cancelled = false; // stale-response guard: rapid country switches (GeoIP → manual pill)
    async function loadProducts() {
      try {
        const results = await Promise.all(
          PRODUCT_CATEGORY_KEYS.map((cat) =>
            listProducts({ country, category: cat.key, size: 12 }).then((res) => [cat.key, res.content] as const)
          )
        );
        if (cancelled) return;
        const map: Record<string, Product[]> = {};
        for (const [key, items] of results) {
          map[key] = items;
        }
        setCatProducts(map);
      } catch {
        // one rejected category must not blank the whole section as an unhandled rejection
      }
    }
    loadProducts();
    return () => {
      cancelled = true;
    };
  }, [country]);

  return (
    <div className={styles.homePage}>
      <Seo {...SEO.home} />
      {/* Hero */}
      <section className={styles.heroSection}>
        {/* Mouse parallax writes --hero-px/--hero-py here; layers read them. */}
        <div
          className={styles.heroContainer}
          onMouseMove={heroParallaxMove}
          onMouseLeave={heroParallaxLeave}
        >
          <Swiper modules={[Autoplay, EffectFade]} effect="fade" fadeEffect={{ crossFade: true }} autoplay={{ delay: 5500, disableOnInteraction: false }} loop onSwiper={(s) => { heroSwiperRef.current = s; }} onSlideChange={(s) => { setActiveSlide(s.realIndex); }} className={styles.heroSwiper}>
            {HERO_SLIDE_KEYS.map((slide) => (
              <SwiperSlide key={slide.image}>
                <div className={styles.heroSlide}>
                  {/* Layer 1 (deep) — parallax wrapper; the img keeps its own
                      slow Ken-Burns scale so the two motions don't clash. */}
                  <div className={styles.heroParallaxBg}>
                    <img src={slide.image} alt="" className={styles.heroSlideImage} />
                  </div>
                  {/* Layer 2 (mid) — gradient scrim, drifts with the pointer. */}
                  <div className={styles.heroSlideOverlay} />
                  {/* Layer 3 (foreground) — copy, moves fastest. */}
                  <div className={`container ${styles.heroContent}`}>
                    <span className={styles.heroEyebrow}>
                      <IconLeaf className={styles.heroEyebrowIcon} /> {t(slide.eyebrow)}
                    </span>
                    <h1 className={styles.heroLine1}><HeroWords text={t(slide.line1)} /></h1>
                    <h2 className={styles.heroLine2}><HeroWords text={t(slide.line2)} /></h2>
                    {slide.subtitle && <p className={styles.heroSubtitle}>{t(slide.subtitle)}</p>}
                    <div className={styles.heroActions}>
                      <Link to={slide.primaryCta.to} className={styles.heroBtnPrimary} onMouseMove={magneticMove} onMouseLeave={magneticLeave}>{t(slide.primaryCta.label)} <IconArrowRight /></Link>
                      <Link to={slide.secondaryCta.to} className={styles.heroBtnSecondary}>{t(slide.secondaryCta.label)} <IconArrowRight /></Link>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Generated falling leaves + soil motes (above scrim, below copy). */}
          <HeroParticles />

          {/* Progress indicator */}
          <div className={styles.heroDots}>
            {HERO_SLIDE_KEYS.map((_, i) => (
              <button
                key={i}
                type="button"
                className={`${styles.heroDot} ${i === activeSlide ? styles.heroDotActive : ''}`}
                aria-label={t('home.goSlide').replace('{n}', String(i + 1))}
                onClick={() => heroSwiperRef.current?.slideToLoop(i)}
              />
            ))}
          </div>


        </div>
      </section>

      {/* Promises bar */}
      <section className={styles.promises}>
        <div className={styles.homeContainer}>
          <motion.div
            className={styles.promisesGrid}
            variants={PROMISE_CONTAINER}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
          >
            {PROMISE_KEYS.map((p) => (
              <motion.div key={p.title} className={styles.promiseItem} variants={PROMISE_ITEM} whileHover={{ y: -4 }}>
                <span className={styles.promiseIcon}>
                  {p.title === 'service.fastDelivery' && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width="18" height="18"><path d="M1 3h15v13H1z" /><path d="M16 8h4l3 3v5h-7V8z" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" /></svg>}
                  {p.title === 'service.bestQuality' && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width="18" height="18"><circle cx="12" cy="8" r="6" /><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" /></svg>}
                  {p.title === 'service.noMinOrder' && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width="18" height="18"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" /></svg>}
                  {p.title === 'service.easyReturns' && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width="18" height="18"><polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" /><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" /></svg>}
                </span>
                <div>
                  <strong>{t(p.title)}</strong>
                  <span>{t(p.text)}</span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Shop by Category — reference card layout, VPNexues palette */}
      <section className={styles.catSection} id="shop-by-category">
        <div className={styles.catContainer}>
          <div className={styles.catHeader}>
            <Reveal>
              <h2 className={styles.catHeading}>
                {t('home.shopBy')} {t('home.categoryWord')}
              </h2>
            </Reveal>
            <Reveal delay={0.08}>
              <p className={styles.catSubtitle}>{t('home.catSubtitle')}</p>
            </Reveal>
            <Reveal delay={0.14}>
              <p className={styles.catSecondary}>{t('home.catSecondary')}</p>
            </Reveal>
          </div>

          {/* Category grid — icon badge top-left, dark title/subtitle, gold Shop Now pill */}
          <div className={styles.catGrid}>
            {CATEGORY_KEYS.map((cat, i) => {
              const CatIcon = CATEGORY_ICONS[cat.icon];
              /* Brand tints: produce cards sage-mid, B2B leaf, box cards soft sage */
              const tintClass = 'tint' in cat ? CATEGORY_TINT_CLASS[cat.tint] : undefined;
              return (
                <Link
                  key={cat.label}
                  to={cat.to}
                  className={
                    tintClass
                      ? `${styles.catImgCard} ${styles.catImgCardTinted} ${tintClass}`
                      : styles.catImgCard
                  }
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <img src={cat.img} alt={t(cat.alt)} loading="lazy" draggable={false} />
                  <span className={styles.catImgCardShade} aria-hidden="true" />
                  <span className={styles.catImgCardBody}>
                    <span className={styles.catImgCardIcon} aria-hidden="true">
                      <CatIcon />
                    </span>
                    <span className={styles.catImgCardTexts}>
                      <span className={styles.catImgCardTitle}>{t(cat.label)}</span>
                      <span className={styles.catImgCardSub}>{t(cat.sub)}</span>
                    </span>
                    <span className={styles.catImgCardBtn}>
                      {t('header.shopNow')}
                      <IconArrowRight width={14} height={14} aria-hidden="true" />
                    </span>
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Fresh Picks — one side-scrolling rail per category. Same data/handlers. */}
      {(() => {
        const rows = PRODUCT_CATEGORY_KEYS.map((cat) => {
          const rawItems = catProducts[cat.key] ?? [];
          const items = (cat.key === 'Fruits'
            ? rawItems.filter((p) => p.slug !== 'coconut-fresh' && p.slug !== 'coconut-fresh-legacy' && !p.name.toLowerCase().includes('coconut (fresh)'))
            : rawItems
          ).slice(0, 12);
          return { ...cat, items };
        });
        if (rows.every((row) => row.items.length === 0)) return null;
        return (
          <section className={`${styles.premiumSection} ${styles.freshClean}`}>
            <div className={styles.homeContainer}>
              <div className={styles.freshCleanHead}>
                <div className={styles.freshCleanTitles}>
                  <Reveal>
                    <span className={styles.freshCleanOverline}>
                      <IconLeaf width={13} height={13} aria-hidden="true" />
                      {t('home.farmPickedDaily')}
                    </span>
                  </Reveal>
                  <Reveal delay={0.08}>
                    <h2 className={styles.sectionTitle}>{t('home.freshPicks')}</h2>
                  </Reveal>
                </div>
              </div>
              {rows.map((row, ri) =>
                row.items.length === 0 ? null : (
                  <Reveal key={row.key} delay={0.06 * ri} className={styles.pickRow}>
                    <div className={styles.pickRowHead}>
                      <div className={styles.pickRowTitles}>
                        <span className={styles.pickRowOverline}>{t(row.overline)}</span>
                        <h3 className={styles.pickRowTitle}>{t(row.title)}</h3>
                      </div>
                    </div>
                    <div className={styles.pickRailWrap}>
                      <div
                        className={styles.pickRail}
                        ref={(el) => {
                          pickRailRefs.current[row.key] = el;
                        }}
                      >
                        {row.items.map((p) => (
                          <div key={p.id} className={styles.pickCell}>
                            <ProductCard product={p} compact />
                          </div>
                        ))}
                      </div>
                      <div className={styles.pickRowNav}>
                        <button
                          type="button"
                          className={styles.pickRowBtn}
                          aria-label={t('home.scrollPrev')}
                          onClick={() => scrollPickRowBy(row.key, -1)}
                        >
                          <IconArrowRight width={18} height={18} />
                        </button>
                        <button
                          type="button"
                          className={styles.pickRowBtn}
                          aria-label={t('home.scrollNext')}
                          onClick={() => scrollPickRowBy(row.key, 1)}
                        >
                          <IconArrowRight width={18} height={18} />
                        </button>
                      </div>
                    </div>
                  </Reveal>
                )
              )}
            </div>
          </section>
        );
      })()}

      {/* Know What to Avoid — flip cards: bad front, better choice back */}
      <AvoidJunk />

      {/* Mobile app promo — farm-to-home design (end of page, below "Know What to Avoid") */}
      <section className={styles.appPromoSection}>
        <div className={styles.homeContainer}>
          <Reveal>
          <div className={styles.appPromoCard}>
            <img
              className={styles.appPromoBannerImg}
              src="https://res.cloudinary.com/eqjshlur/image/upload/f_auto,q_auto:good/v1792762533/vpnexues/home/app-promo-banner.jpg"
              alt={t('home.appPromoSubtitle')}
              loading="lazy"
            />
          </div>
          </Reveal>
        </div>
      </section>

      {/* Closing story strip */}
      <section className={styles.closingSection}>
        <div className={styles.homeContainer}>
          <div className={styles.closingCard}>
            <div className={styles.closingImage}>
              <img src="https://res.cloudinary.com/eqjshlur/image/upload/v1790001879/vpnexues/old/site-assets/page-banner-order-success.png" alt="Fresh produce from Tamil Nadu farms" loading="lazy" />
            </div>
            {/* Original desktop elements — hidden on mobile via CSS */}
            <span className={styles.closingLeaf}><IconLeaf width={22} height={22} /></span>
            <div className={styles.closingBar}>
              <p><strong>{t('home.closingHighlight')}</strong> {t('home.closingText')}</p>
            </div>
            {/* New mobile content — hidden on desktop via CSS */}
            <div className={styles.closingContent}>
              <span className={styles.closingEyebrow}>{t('home.closingOverline')}</span>
              <p className={styles.closingHighlight}>{t('home.closingHighlight')}</p>
              <p className={styles.closingText}>{t('home.closingText')}</p>
            </div>
            <Link to="/about" className={styles.closingLink}>
              {t('home.ourStory')} <IconArrowRight width={16} height={16} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
