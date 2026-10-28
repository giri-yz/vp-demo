import { useEffect, useRef, useState } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { en } from '../../i18n/translations/en';
import { assetUrl, fetchGalleryImages } from '../../api/contentApi';
import Lightbox from '../../components/common/Lightbox';
import styles from './css/Gallery.module.css';

type Cat = 'agriculture' | 'teams';

interface GalleryItem {
  id?: string;
  src: string;
  caption?: string | null;
  cat?: Cat;
}

// QA-10: this static fallback lists the farmerimg* photos (same set as the
// V39 seed / live /api/gallery-images rows minus the six about/* feature
// photos, which the product no longer shows). They pair with the localised
// gallery.notes i18n arrays by position (see the noteIdx counter).
const GALLERY: GalleryItem[] = [
  {
    src: 'https://res.cloudinary.com/eqjshlur/image/upload/f_auto,q_auto:good/vpnexues/gallery/farmerimg1.jpg',
    cat: 'agriculture',
  },
  {
    src: 'https://res.cloudinary.com/eqjshlur/image/upload/f_auto,q_auto:good/vpnexues/gallery/farmerimg2.jpg',
    cat: 'agriculture',
  },
  {
    src: 'https://res.cloudinary.com/eqjshlur/image/upload/f_auto,q_auto:good/vpnexues/gallery/farmerimg3.jpg',
    cat: 'agriculture',
  },
  {
    src: 'https://res.cloudinary.com/eqjshlur/image/upload/f_auto,q_auto:good/vpnexues/gallery/farmerimg4.jpg',
    cat: 'agriculture',
  },
  {
    src: 'https://res.cloudinary.com/eqjshlur/image/upload/f_auto,q_auto:good/vpnexues/gallery/farmerimg5.jpg',
    cat: 'agriculture',
  },
  {
    src: 'https://res.cloudinary.com/eqjshlur/image/upload/f_auto,q_auto:good/vpnexues/gallery/farmerimg6.jpg',
    cat: 'agriculture',
  },
  {
    src: 'https://res.cloudinary.com/eqjshlur/image/upload/f_auto,q_auto:good/vpnexues/gallery/farmerimg7.jpg',
    cat: 'agriculture',
  },
  {
    src: 'https://res.cloudinary.com/eqjshlur/image/upload/f_auto,q_auto:good/vpnexues/gallery/farmerimg8.jpg',
    cat: 'agriculture',
  },
  {
    src: 'https://res.cloudinary.com/eqjshlur/image/upload/f_auto,q_auto:good/vpnexues/gallery/farmerimg9.jpg',
    cat: 'agriculture',
  },
  {
    src: 'https://res.cloudinary.com/eqjshlur/image/upload/f_auto,q_auto:good/vpnexues/gallery/farmerimg10.jpg',
    cat: 'agriculture',
  },
  {
    src: 'https://res.cloudinary.com/eqjshlur/image/upload/f_auto,q_auto:good/vpnexues/gallery/farmerimg11.jpg',
    cat: 'agriculture',
  },
  {
    src: 'https://res.cloudinary.com/eqjshlur/image/upload/f_auto,q_auto:good/vpnexues/gallery/farmerimg12.jpg',
    cat: 'agriculture',
  },
  {
    src: 'https://res.cloudinary.com/eqjshlur/image/upload/f_auto,q_auto:good/vpnexues/gallery/farmerimg13.jpg',
    cat: 'agriculture',
  },
  {
    src: 'https://res.cloudinary.com/eqjshlur/image/upload/f_auto,q_auto:good/vpnexues/gallery/farmerimg14.jpg',
    cat: 'agriculture',
  },
  {
    src: 'https://res.cloudinary.com/eqjshlur/image/upload/f_auto,q_auto:good/vpnexues/gallery/farmerimg15.jpg',
    cat: 'agriculture',
  },
  {
    src: 'https://res.cloudinary.com/eqjshlur/image/upload/f_auto,q_auto:good/vpnexues/gallery/farmerimg16.jpg',
    cat: 'agriculture',
  },
  {
    src: 'https://res.cloudinary.com/eqjshlur/image/upload/f_auto,q_auto:good/vpnexues/gallery/farmerimg17.jpg',
    cat: 'agriculture',
  },
  {
    src: 'https://res.cloudinary.com/eqjshlur/image/upload/f_auto,q_auto:good/vpnexues/gallery/farmerimg18.jpg',
    cat: 'agriculture',
  },
  {
    src: 'https://res.cloudinary.com/eqjshlur/image/upload/f_auto,q_auto:good/vpnexues/gallery/farmerimg20.jpg',
    cat: 'agriculture',
  },
  {
    src: 'https://res.cloudinary.com/eqjshlur/image/upload/f_auto,q_auto:good/vpnexues/gallery/farmerimg22.jpg',
    cat: 'agriculture',
  },
];

/* Team photos on Cloudinary (uploaded from public/images/gallery/image*.jpeg).
   Always shown under the Teams filter — not part of the agriculture API set.
   Captions keep them off the gallery.notes index pairing. */
const TEAM_IMAGES: GalleryItem[] = [
  { src: 'https://res.cloudinary.com/eqjshlur/image/upload/f_auto,q_auto:good/vpnexues/gallery/team-image-0.jpg', caption: 'Team moment', cat: 'teams' },
  { src: 'https://res.cloudinary.com/eqjshlur/image/upload/f_auto,q_auto:good/vpnexues/gallery/team-image-1.jpg', caption: 'Our team at work', cat: 'teams' },
  { src: 'https://res.cloudinary.com/eqjshlur/image/upload/f_auto,q_auto:good/vpnexues/gallery/team-image-2.jpg', caption: 'Team collaboration', cat: 'teams' },
  { src: 'https://res.cloudinary.com/eqjshlur/image/upload/f_auto,q_auto:good/vpnexues/gallery/team-image-3.jpg', caption: 'Team celebration', cat: 'teams' },
  { src: 'https://res.cloudinary.com/eqjshlur/image/upload/f_auto,q_auto:good/vpnexues/gallery/team-image-4.jpg', caption: 'Team outing', cat: 'teams' },
  { src: 'https://res.cloudinary.com/eqjshlur/image/upload/f_auto,q_auto:good/vpnexues/gallery/team-image-6.jpg', caption: 'Team gathering', cat: 'teams' },
];

const FILTERS = [
  { key: 'all', labelKey: 'gallery.catAll' },
  { key: 'agriculture', labelKey: 'gallery.catAgriculture' },
  { key: 'teams', labelKey: 'gallery.catTeams' },
] as const;

type FilterKey = (typeof FILTERS)[number]['key'];

export default function Gallery() {
  const { t, tRaw } = useLanguage();
  const rawNotes = tRaw('gallery.notes');
  const notes = Array.isArray(rawNotes) ? (rawNotes as string[]) : [];
  const [index, setIndex] = useState(0);
  const [open, setOpen] = useState(false);
  const [cat, setCat] = useState<FilterKey>('all');
  const [images, setImages] = useState<GalleryItem[]>([...GALLERY, ...TEAM_IMAGES]);
  const pageRef = useRef<HTMLDivElement>(null);

  // gallery.notes is index-aligned with the static GALLERY fallback, but API
  // rows carry their own English caption (admin-edited via sub-admin gallery
  // CRUD), so those are localised by matching the caption's English original —
  // the same "only translate what still equals the English source" rule
  // News.tsx applies to admin-editable content.
  const localizedByEnglish = new Map<string, string>();
  en.gallery.notes.forEach((enNote, i) => {
    const loc = notes[i];
    if (typeof loc === 'string' && loc) localizedByEnglish.set(enNote, loc);
  });

  // Rows WITHOUT a caption (the static fallback's farmerimg rows) pair with
  // gallery.notes in order — a captioned row must not consume a notes slot,
  // otherwise the 20 farmerimg captions shift by the 6 about/* captions.
  let noteIdx = 0;
  const items = images
    .map((g) => {
      const note = g.caption
        ? (localizedByEnglish.get(g.caption) ?? g.caption)
        : (notes[noteIdx++] ?? '');
      return { ...g, note };
    })
    .map((g, i) => ({ ...g, num: i + 1 }))
    .filter((g) => cat === 'all' || g.cat === cat);

  // QA-29: API rows can replace the static fallback after mount (slow Render
  // cold start) and filter changes shrink the list — keep the lightbox index
  // inside the current list bounds so it never lands on a stale/missing slide.
  useEffect(() => {
    setIndex((i) => (items.length === 0 ? 0 : Math.min(i, items.length - 1)));
  }, [items.length]);

  useEffect(() => {
    let cancelled = false;
    fetchGalleryImages()
      .then((rows) => {
        if (cancelled) return;
        // V39 has no category column yet; all server photos are agriculture
        // (local TEAM_IMAGES stay under Teams and are always appended).
        // Drop the six about/* feature photos — product decision: gallery
        // shows farmerimg* + team only.
        setImages([
          ...rows
            .filter((row) => !String(row.imageUrl ?? '').includes('/about/'))
            .map((row) => ({
              id: row.id,
              src: assetUrl(row.imageUrl),
              caption: row.caption,
              cat: 'agriculture' as Cat,
            })),
          ...TEAM_IMAGES,
        ]);
      })
      .catch(() => {
        // Backend unreachable — keep the static fallback so the page still renders.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const root = pageRef.current;
    if (!root) return;
    const els = Array.from(root.querySelectorAll<HTMLElement>('[data-reveal]'));
    if (!els.length) return;
    if (typeof IntersectionObserver === 'undefined') {
      els.forEach((el) => { el.dataset.inview = 'true'; });
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).dataset.inview = 'true';
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '0px 0px -60px 0px' },
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [cat, images]);

  return (
    <div ref={pageRef}>
      {/* Mobile banner */}
      <section className={styles.mobileBanner}>
        <div className={styles.mobileBannerOverlay}>
          <div className={styles.mobileBannerContent}>
            <span className={styles.mobileBannerTag}>{t('gallery.ourGallery')}</span>
            <h1 className={styles.mobileBannerTitle}>&#128248; {t('gallery.exploreTitle')}</h1>
            <p className={styles.mobileBannerDesc}>{t('gallery.mobileDesc')}</p>
          </div>
        </div>
      </section>

      {/* Desktop banner */}
      <section className={styles.desktopBanner}>
        <div className={styles.bannerOverlay}>
          <div className="container">
            <div className={styles.bannerContent}>
              <div className={styles.bannerIcon}>
                <span aria-hidden="true">&#128248;</span>
              </div>
              <h1>{t('gallery.ourGallery')}</h1>
              <p>{t('gallery.desktopDesc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Section head + category filters + gallery grid */}
      <section className={styles.section}>
        <div className="container">
          <div className={styles.sectionHead} data-reveal="up">
            <span className={styles.sectionTag}>&#127807; {t('gallery.ourGallery')}</span>
            <div className={styles.filters} role="group" aria-label={t('gallery.filterAria')}>
              {FILTERS.map((f) => (
                <button
                  key={f.key}
                  type="button"
                  className={`${styles.filterBtn} ${cat === f.key ? styles.filterBtnActive : ''}`}
                  aria-pressed={cat === f.key}
                  onClick={() => setCat(f.key)}
                >
                  {t(f.labelKey)}
                </button>
              ))}
            </div>
            <h2 className={styles.sectionTitle}>{t('gallery.exploreTitle')}</h2>
            <span className={styles.sectionRule} aria-hidden="true" />
          </div>

          {items.length === 0 ? (
            <p className={styles.emptyNote}>{t('gallery.catEmpty')}</p>
          ) : (
            <div className={styles.grid} key={cat}>
              {items.map(({ id, src, note, num }, i) => (
                <div
                  key={id ?? src}
                  className={styles.cardItem}
                  data-reveal="up"
                  style={{ animationDelay: `${(i % 12) * 55}ms` }}
                >
                  <button
                    type="button"
                    className={styles.imgWrap}
                    onClick={() => { setIndex(i); setOpen(true); }}
                    aria-label={`${t('gallery.openPhotoAria')} ${num}: ${note}`}
                  >
                    <img src={src} alt="" className={styles.img} loading="lazy" />
                    <div className={styles.overlay}>
                      <span className={styles.cardNum}>{String(num).padStart(2, '0')}</span>
                      <span className={styles.plusIcon}>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </span>
                    </div>
                    <span className={styles.note}>{note}</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <Lightbox
        images={items.map((g) => g.src)}
        descriptions={items.map((g) => g.note)}
        index={index}
        open={open}
        onClose={() => setOpen(false)}
      />
    </div>
  );
}
