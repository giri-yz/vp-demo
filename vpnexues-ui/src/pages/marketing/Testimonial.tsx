import { useEffect, useState, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useLanguage } from '../../i18n/LanguageContext';
import * as testimonialsApi from '../../api/testimonialsApi';
import type { Testimonial as TestimonialType } from '../../types';
import { IconLeaf } from '../../components/common/icons';
import Reveal from '../../components/common/Reveal';
import styles from './css/Testimonial.module.css';

const FALLBACK_TESTIMONIALS: TestimonialType[] = [
  {
    id: 'arp-sathish-kumar',
    name: 'Arp Sathish Kumar',
    role: 'Working Professional',
    location: 'India',
    rating: 5,
    quote: 'Love the Small Box option — perfect quantity for my household without any waste.',
    photoUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001990/vpnexues/old/site-assets/testimonial/client-image.png',
    active: true,
  },
  {
    id: 'priya-nair',
    name: 'Priya Nair',
    role: 'Home Chef',
    location: 'Singapore',
    rating: 5,
    quote: 'The produce is always fresh and the delivery is right on time. VPNexues has become our weekly staple.',
    photoUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001993/vpnexues/old/site-assets/testimonial/testi-01.webp',
    active: true,
  },
  {
    id: 'james-tan',
    name: 'James Tan',
    role: 'Restaurant Owner',
    location: 'Singapore',
    rating: 5,
    quote: 'Their B2B bulk pricing and reliability make VPNexues our go-to supplier for fresh vegetables.',
    photoUrl: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001985/vpnexues/old/site-assets/testimonial/clien-01.png',
    active: true,
  },
];

const DEFAULT_PORTRAIT =
  'https://res.cloudinary.com/eqjshlur/image/upload/v1790001996/vpnexues/old/site-assets/testimonial/testimonial-01.jpg';

/** Extra supporting comment per reviewer (desktop only — edit/replace with real customer words). */
const EXTRA_QUOTE_BY_NAME: Record<string, string> = {
  'Arp Sathish Kumar': 'Delivery slots are always on time and the veggies stay fresh for days.',
  'Priya Nair': 'The weekly variety keeps my home cooking exciting — my kids love it.',
  'James Tan': 'Every bulk crate arrives graded and fresh, ready for service.',
};

/** Large left-banner portrait per reviewer (matched by name so API + fallback data both work). */
const PORTRAIT_BY_NAME: Record<string, string> = {
  'James Tan':
    'https://res.cloudinary.com/eqjshlur/image/upload/v1790165672/vpnexues/testimonial/james-tan-1.png',
  'Priya Nair':
    'https://res.cloudinary.com/eqjshlur/image/upload/v1790165673/vpnexues/testimonial/priya-nair-1.png',
};

/** Normalize any API response shape into a flat Testimonial[]. */
function normalizeTestimonials(raw: unknown): TestimonialType[] {
  if (Array.isArray(raw)) return raw;
  if (raw && typeof raw === 'object') {
    const obj = raw as Record<string, unknown>;
    if (Array.isArray(obj.content)) return obj.content as TestimonialType[];
    if (Array.isArray(obj.data)) return obj.data as TestimonialType[];
    if (Array.isArray(obj.testimonials)) return obj.testimonials as TestimonialType[];
  }
  return [];
}

export default function Testimonial() {
  const { t, tRaw } = useLanguage();
  const reduceMotion = useReducedMotion();
  const [testimonials, setTestimonials] = useState<TestimonialType[]>([]);
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    // Safety net: if API hangs, never leave user stuck on "Loading..."
    const safetyTimer = window.setTimeout(() => {
      if (mountedRef.current) {
        setTestimonials((prev) => (prev.length === 0 ? FALLBACK_TESTIMONIALS : prev));
        setLoading(false);
      }
    }, 5000);

    (async () => {
      try {
        const raw = await testimonialsApi.listPublicTestimonials();
        const items = normalizeTestimonials(raw);
        if (mountedRef.current) {
          setTestimonials(items.length > 0 ? items : FALLBACK_TESTIMONIALS);
        }
      } catch (err) {
        console.error('[Testimonial] fetch failed:', err);
        if (mountedRef.current) {
          setTestimonials(FALLBACK_TESTIMONIALS);
        }
      } finally {
        window.clearTimeout(safetyTimer);
        setLoading(false);
      }
    })();

    return () => {
      mountedRef.current = false;
      window.clearTimeout(safetyTimer);
    };
  }, []);

  const startTimer = useCallback(() => {
    const len = testimonials.length;
    if (len <= 1) return;
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % len);
    }, 5000);
  }, [testimonials.length]);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  useEffect(() => {
    startTimer();
    return () => resetTimer();
  }, [startTimer, resetTimer]);

  const goTo = (index: number) => {
    setCurrent(index);
    startTimer();
  };

  if (loading) {
    return (
      <div>
        <section className={styles.desktopBanner}>
          <div className={styles.bannerOverlay}>
            <div className="container">
              <div className={styles.bannerContent}>
                <div className={styles.breadcrumb}>
                  <Link to="/">{t('testimonial.breadcrumbHome')}</Link> <span>&rsaquo;</span> {t('testimonial.breadcrumbTestimonials')}
                </div>
                <div className={styles.bannerIcon}>
                  <IconLeaf width={26} height={26} aria-hidden="true" />
                </div>
                <h1>{t('testimonial.bannerTitle')}</h1>
                <p>{t('testimonial.bannerDesc')}</p>
              </div>
            </div>
          </div>
        </section>
        <section className={styles.section}>
          <div className="container">
            <div className={styles.loadingWrap}>
              <div className={styles.loadingSpinner} />
              <p>{t('testimonial.loadingText')}</p>
            </div>
          </div>
        </section>
      </div>
    );
  }

  if (testimonials.length === 0) {
    return (
      <div>
        <p className={styles.empty}>{t('testimonial.emptyText')}</p>
      </div>
    );
  }

  const safeIndex = current % testimonials.length;
  const currentTestimonial = testimonials[safeIndex];
  const fbRaw = tRaw('testimonial.fallback');
  const fb = typeof fbRaw === 'object' && fbRaw !== null ? (fbRaw as Record<string, { quote?: string; role?: string; location?: string }>) : {};
  const copy = fb[currentTestimonial.id];
  const extraRaw = tRaw('testimonial.extraQuotes');
  const extras = typeof extraRaw === 'object' && extraRaw !== null ? (extraRaw as Record<string, string>) : {};
  const quote = copy?.quote ?? currentTestimonial.quote;
  const roleLine = [copy?.role ?? currentTestimonial.role, copy?.location ?? currentTestimonial.location].filter(Boolean).join(', ');
  const extraQuote = extras[currentTestimonial.name] ?? EXTRA_QUOTE_BY_NAME[currentTestimonial.name];

  /** Arrow / Home / End keys on the leaf navigation move the active testimonial. */
  const handleLeafNavKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const len = testimonials.length;
    if (len <= 1) return;
    let nextIndex: number | null = null;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') nextIndex = (safeIndex + 1) % len;
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') nextIndex = (safeIndex - 1 + len) % len;
    else if (e.key === 'Home') nextIndex = 0;
    else if (e.key === 'End') nextIndex = len - 1;
    if (nextIndex === null) return;
    e.preventDefault();
    goTo(nextIndex);
    const buttons = e.currentTarget.querySelectorAll('button');
    buttons[nextIndex]?.focus();
  };

  return (
    <div>
      {/* Page banner — Support-hero layout, all screens */}
      <section className={styles.desktopBanner}>
        <div className={styles.bannerOverlay}>
          <div className="container">
            <div className={styles.bannerContent}>
              <div className={styles.breadcrumb}>
                <Link to="/">{t('testimonial.breadcrumbHome')}</Link> <span>&rsaquo;</span> {t('testimonial.breadcrumbTestimonials')}
              </div>
              <div className={styles.bannerIcon}>
                <IconLeaf width={26} height={26} aria-hidden="true" />
              </div>
              <h1>{t('testimonial.bannerTitle')}</h1>
              <p>{t('testimonial.bannerDesc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial section */}
      <section className={styles.section}>
        {/* Decorative floating leaves — behind content, non-interactive */}
        <div className={styles.decorLayer} aria-hidden="true">
          <svg className={`${styles.decorLeaf} ${styles.decorLeaf1}`} viewBox="0 0 120 160" xmlns="http://www.w3.org/2000/svg">
            <path d="M60 10 C30 40, 10 80, 20 140 C20 140, 40 100, 60 80 C80 100, 100 140, 100 140 C110 80, 90 40, 60 10Z" fill="currentColor" />
            <path d="M60 10 C60 60, 60 100, 60 140" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.5" />
          </svg>
          <svg className={`${styles.decorLeaf} ${styles.decorLeaf2}`} viewBox="0 0 120 160" xmlns="http://www.w3.org/2000/svg">
            <path d="M60 10 C30 40, 10 80, 20 140 C20 140, 40 100, 60 80 C80 100, 100 140, 100 140 C110 80, 90 40, 60 10Z" fill="currentColor" />
            <path d="M60 10 C60 60, 60 100, 60 140" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.5" />
          </svg>
          <svg className={`${styles.decorLeaf} ${styles.decorLeaf3}`} viewBox="0 0 120 160" xmlns="http://www.w3.org/2000/svg">
            <path d="M60 10 C30 40, 10 80, 20 140 C20 140, 40 100, 60 80 C80 100, 100 140, 100 140 C110 80, 90 40, 60 10Z" fill="currentColor" />
            <path d="M60 10 C60 60, 60 100, 60 140" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.5" />
          </svg>
          <svg className={`${styles.decorLeaf} ${styles.decorLeaf4}`} viewBox="0 0 120 160" xmlns="http://www.w3.org/2000/svg">
            <path d="M60 10 C30 40, 10 80, 20 140 C20 140, 40 100, 60 80 C80 100, 100 140, 100 140 C110 80, 90 40, 60 10Z" fill="currentColor" />
            <path d="M60 10 C60 60, 60 100, 60 140" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.5" />
          </svg>
        </div>

        <div className={styles.sectionInner}>
          <div className="container">
            <Reveal className={styles.headingWrap}>
              <div className={styles.sectionTag}>
                <span>&#127807; {t('testimonial.sectionTag')}</span>
              </div>
              <h2 className={styles.sectionTitle}>{t('testimonial.sectionTitle')}<br />{t('testimonial.sectionTitleLine2')}</h2>
            </Reveal>

            <div className={styles.layout}>
              {/* Left — image (follows the active testimonial) */}
              <motion.div
                className={styles.imageCol}
                initial={reduceMotion ? { opacity: 0 } : { opacity: 0, x: -36 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: reduceMotion ? 0.001 : 0.6, ease: [0.22, 0.61, 0.36, 1] }}
              >
                <div className={styles.imageWrap}>
                  <img
                    key={currentTestimonial.id}
                    src={PORTRAIT_BY_NAME[currentTestimonial.name] ?? DEFAULT_PORTRAIT}
                    alt={`${currentTestimonial.name} — VPNexues testimonial`}
                    className={styles.image}
                    loading="eager"
                    decoding="async"
                    onError={(e) => {
                      const img = e.target as HTMLImageElement;
                      if (img.src !== DEFAULT_PORTRAIT) img.src = DEFAULT_PORTRAIT;
                    }}
                  />
                </div>
              </motion.div>

              {/* Right — testimonial */}
              <Reveal className={styles.contentCol} delay={0.12}>
                <div className={styles.card}>
                  <div className={styles.cardTop} />
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                      key={currentTestimonial.id}
                      className={styles.cardBody}
                      initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -10 }}
                      transition={{ duration: reduceMotion ? 0.001 : 0.35, ease: 'easeOut' }}
                      aria-live="polite"
                    >
                      <div className={styles.stars}>
                        {'★'.repeat(currentTestimonial.rating)}{'☆'.repeat(5 - currentTestimonial.rating)}
                      </div>
                      <p className={styles.quote}>&ldquo;{quote}&rdquo;</p>
                      {extraQuote && (
                        <p className={`${styles.quote} ${styles.quoteExtra}`}>
                          &ldquo;{extraQuote}&rdquo;
                        </p>
                      )}
                      <div className={styles.clientArea}>
                        <div className={styles.clientInfo}>
                          <img
                            src={currentTestimonial.photoUrl || 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001990/vpnexues/old/site-assets/testimonial/client-image.png'}
                            alt={currentTestimonial.name}
                            className={styles.clientAvatar}
                            loading="lazy"
                            decoding="async"
                            onError={(e) => { (e.target as HTMLImageElement).src = 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001990/vpnexues/old/site-assets/testimonial/client-image.png'; }}
                          />
                          <div>
                            <span className={styles.clientRole}>{roleLine}</span>
                            <strong className={styles.clientName}>{currentTestimonial.name}</strong>
                          </div>
                        </div>
                        <div className={styles.quoteIcon}>
                          <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M20 2C10.06 2 2 10.06 2 20s8.06 18 18 18 18-8.06 18-18S29.94 2 20 2z" fill="#5b8c51" fillOpacity="0.15"/>
                            <path d="M20 2C10.06 2 2 10.06 2 20s8.06 18 18 18 18-8.06 18-18S29.94 2 20 2z" stroke="#5b8c51" strokeWidth="1.5"/>
                            <text x="20" y="27" textAnchor="middle" fill="#5b8c51" fontSize="22" fontWeight="800" fontFamily="Georgia, serif">❝</text>
                          </svg>
                        </div>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Animated capsule pagination — replaces old leaf indicators */}
                {testimonials.length > 1 && (
                  <div
                    className={styles.pillNav}
                    role="group"
                    aria-label={t('testimonial.sectionTag')}
                    onKeyDown={handleLeafNavKeyDown}
                  >
                    {testimonials.map((item, i) => {
                      const active = i === safeIndex;
                      return (
                        <button
                          key={item.id || i}
                          type="button"
                          className={styles.pillBtn}
                          onClick={() => goTo(i)}
                          aria-label={`Go to testimonial ${i + 1}: ${item.name}`}
                          aria-current={active ? 'true' : undefined}
                        >
                          {active ? (
                            <motion.span
                              layoutId="testimonialPill"
                              className={styles.pillActive}
                              transition={
                                reduceMotion
                                  ? { duration: 0 }
                                  : { type: 'spring', stiffness: 420, damping: 34 }
                              }
                            >
                              {/* Subtle gold glint to echo the star rating */}
                              <span className={styles.pillGlnt} />
                            </motion.span>
                          ) : (
                            <span className={styles.pillDot} />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </Reveal>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
