import { useRef, useState } from 'react';
import type { KeyboardEvent, MouseEvent, PointerEvent } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../i18n/LanguageContext';
import { IconArrowRight, IconLeaf } from './icons';
import styles from './css/AvoidJunk.module.css';

type ChipIcon = 'leaf' | 'flask' | 'shield' | 'home';

interface BadCard {
  id: string;
  title: string;
  desc: string;
  img: string;
  imgAlt: string;
  chips: string[];
  /* Back face — mirrors the UI-team promise posters. */
  backBrand: string;
  backHeading: string;
  backAccent: string;
  backDesc: string;
  backImg: string;
  backImgAlt: string;
  points: [string, string, string];
  chipIcons: [ChipIcon, ChipIcon, ChipIcon];
  ctaLabel: string;
  ctaTo: string;
}

/* All copy mirrors the UI-team posters — no new claims introduced. */
const CARDS: BadCard[] = [
  {
    id: 'junk-food',
    title: 'Junk Food',
    desc: 'Tasty for now, harmful for your tomorrow.',
    img: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790947487/vpnexues/why-choose/xy8wuxvjvo0gopswfqrt.png',
    imgAlt: 'Burgers, fries, pizza, donuts and sugary drinks to avoid',
    chips: ['Burgers & Fries', 'Chips & Packaged Snacks', 'Sweets & Donuts', 'Sugary Drinks'],
    backBrand: 'VP NEXUES Promise',
    backHeading: 'Fresh',
    backAccent: 'Fruits',
    backDesc: 'Fresh fruits sourced from trusted growers who prioritise natural freshness over long storage.',
    backImg: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790947480/vpnexues/why-choose/wxmseyt1egcr2vzs5zkt.png',
    backImgAlt: 'Fresh fruit basket with apples, berries, mango and pomegranate',
    points: ['Naturally Fresh', 'No Artificial Ripening', 'No Preservatives'],
    chipIcons: ['leaf', 'flask', 'flask'],
    ctaLabel: 'Explore Fresh Produce',
    ctaTo: '/shop?category=Fruits',
  },
  {
    id: 'packaged-snacks',
    title: 'Packaged Snacks & Sweets',
    desc: 'Packaged snacks and treats often contain high levels of sugar, salt and unhealthy fats.',
    img: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790947491/vpnexues/why-choose/gfffgymsjscbzpj2kdgc.png',
    imgAlt: 'Packaged snacks high in sugar, salt and unhealthy fats',
    chips: ['High Added Sugar', 'Excess Salt', 'Artificial Flavours', 'Highly Processed'],
    backBrand: 'VP NEXUES Promise',
    backHeading: 'Quality',
    backAccent: 'Groceries',
    backDesc: 'Quality groceries for everyday goodness. Carefully selected essentials for your home.',
    backImg: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790947483/vpnexues/why-choose/dzndlwn2xv43d7upfz1v.png',
    backImgAlt: 'Quality grocery essentials — rice, dal, sugar, tea and sunflower oil',
    points: ['Premium Quality', 'Carefully Selected', 'Everyday Essentials'],
    chipIcons: ['shield', 'leaf', 'home'],
    ctaLabel: 'Explore Categories',
    ctaTo: '/shop',
  },
];

/* Max pointer travel (px) still treated as a tap — beyond this it's a swipe. */
const TAP_SLOP = 12;

function CrossIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" width="13" height="13" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="m9 9 6 6M15 9l-6 6" />
    </svg>
  );
}

function ChipGlyph({ icon }: { icon: ChipIcon }) {
  switch (icon) {
    case 'leaf':
      return <IconLeaf width={15} height={15} aria-hidden="true" />;
    case 'flask':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width="15" height="15" aria-hidden="true">
          <path d="M9 3h6" />
          <path d="M10 3v5.5L4.5 18a2 2 0 0 0 1.8 3h11.4a2 2 0 0 0 1.8-3L14 8.5V3" />
          <path d="m7.5 14.5 6-6" />
        </svg>
      );
    case 'shield':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width="15" height="15" aria-hidden="true">
          <path d="M12 3.5 19 6.5v5c0 5-3 8.2-7 10-4-1.8-7-5-7-10v-5l7-3Z" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      );
    case 'home':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width="15" height="15" aria-hidden="true">
          <path d="m3 10.5 9-7 9 7" />
          <path d="M5 9.5V20h14V9.5" />
          <path d="M10 20v-5h4v5" />
        </svg>
      );
  }
}

export default function AvoidJunk() {
  const { t, tRaw } = useLanguage();
  const [activeId, setActiveId] = useState<string | null>(null);
  const pressPos = useRef<{ x: number; y: number } | null>(null);

  function toggle(id: string) {
    setActiveId((cur) => (cur === id ? null : id));
  }

  function onPointerDown(e: PointerEvent<HTMLDivElement>) {
    pressPos.current = { x: e.clientX, y: e.clientY };
  }

  function onCardClick(id: string) {
    return (e: MouseEvent<HTMLDivElement>) => {
      /* CTA navigation must not toggle the card. */
      if ((e.target as HTMLElement).closest('a')) return;
      /* A swipe/scroll gesture must not flip the card. */
      const start = pressPos.current;
      pressPos.current = null;
      if (start) {
        const dx = Math.abs(e.clientX - start.x);
        const dy = Math.abs(e.clientY - start.y);
        if (dx > TAP_SLOP || dy > TAP_SLOP) return;
      }
      toggle(id);
    };
  }

  function onCardKeyDown(id: string) {
    return (e: KeyboardEvent<HTMLDivElement>) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggle(id);
      }
    };
  }

  return (
    <section className={styles.badSection} aria-labelledby="avoid-junk-title">
      <div className={styles.badContainer}>
        <div className={styles.badHead}>
          <span className={styles.badEyebrow}>
            <IconLeaf width={14} height={14} aria-hidden="true" />
            {t('avoidJunk.eyebrow')}
          </span>
          <h2 id="avoid-junk-title" className={styles.badTitle}>
            {t('avoidJunk.title')}
          </h2>
          <p className={styles.badSub}>
            {t('avoidJunk.sub')}
          </p>
        </div>

        <div className={styles.badGrid}>
          {CARDS.map((card) => {
            const rawCopy = tRaw(`avoidJunk.cards.${card.id}`);
            const copy: BadCard = typeof rawCopy === 'object' && rawCopy !== null ? { ...card, ...(rawCopy as BadCard) } : card;
            const flipped = activeId === card.id;
            return (
              <div
                key={card.id}
                className={`${styles.flipCard} ${flipped ? styles.flipped : ''}`}
                onPointerDown={onPointerDown}
                onClick={onCardClick(card.id)}
                onKeyDown={onCardKeyDown(card.id)}
                tabIndex={0}
                role="button"
                aria-expanded={flipped}
                aria-label={(flipped ? t('avoidJunk.ariaFront') : t('avoidJunk.ariaBack')).replace('{title}', copy.title)}
              >
                <div className={styles.flipInner}>
                  {/* FRONT — the bad */}
                  <article className={styles.flipFront} aria-hidden={flipped}>
                    <h3 className={styles.badCardTitle}>{copy.title}</h3>
                    <p className={styles.badCardDesc}>{copy.desc}</p>
                    <div className={styles.badMedia}>
                      <img src={card.img} alt={card.imgAlt} loading="lazy" draggable={false} />
                      {/* Decorative "avoid" seal — presses in on hover (scale 2→1). */}
                      <span className={styles.badStamp} aria-hidden="true">
                        <CrossIcon />
                      </span>
                    </div>
                    <div className={styles.badChips}>
                      {copy.chips.map((chip) => (
                        <span key={chip} className={styles.badChip}>
                          <CrossIcon />
                          {chip}
                        </span>
                      ))}
                    </div>
                  </article>

                  {/* BACK — promise poster layout */}
                  <div className={styles.flipBack} aria-hidden={!flipped}>
                    <div className={styles.posterBrand}>
                      <IconLeaf width={14} height={14} aria-hidden="true" />
                      <span>{copy.backBrand}</span>
                    </div>
                    <h3 className={styles.posterHeading}>
                      {copy.backHeading} <em>{copy.backAccent}</em>
                    </h3>
                    <p className={styles.posterDesc}>{copy.backDesc}</p>
                    <div className={styles.posterPhoto}>
                      <img src={card.backImg} alt={card.backImgAlt} loading="lazy" draggable={false} />
                    </div>
                    <div className={styles.posterChips}>
                      {copy.points.map((point, i) => (
                        <span key={point} className={styles.posterChip}>
                          <ChipGlyph icon={card.chipIcons[i]} />
                          {point}
                        </span>
                      ))}
                    </div>
                    <Link
                      to={card.ctaTo}
                      className={styles.posterCta}
                      tabIndex={flipped ? 0 : -1}
                      aria-label={copy.ctaLabel}
                    >
                      {copy.ctaLabel} <IconArrowRight width={14} height={14} aria-hidden="true" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <p className={styles.badHint}>{t('avoidJunk.hint')}</p>
      </div>
    </section>
  );
}
