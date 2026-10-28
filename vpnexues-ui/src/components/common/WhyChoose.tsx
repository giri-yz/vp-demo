import { useRef, useState } from 'react';
import type { KeyboardEvent, MouseEvent, PointerEvent } from 'react';
import { Link } from 'react-router-dom';
import { IconArrowRight, IconLeaf } from './icons';
import styles from './css/WhyChoose.module.css';

interface WhyCard {
  id: string;
  tone: 'toneSage' | 'toneCream' | 'toneMint' | 'toneIvory';
  eyebrow: string;
  title: string;
  desc: string;
  img: string;
  imgAlt: string;
  chips: [string, string, string];
  backTitle: string;
  points: [string, string, string];
  ctaLabel: string;
  ctaTo: string;
}

/* Visuals: photorealistic produce photography, no baked-in text.
   Tones echo the UI-team posters (deep green + cream + soft pastels). */
const CARDS: WhyCard[] = [
  {
    id: 'farm-fresh',
    tone: 'toneSage',
    eyebrow: 'Freshly sourced',
    title: 'Farm-Direct Freshness',
    desc: 'Fresh produce sourced with care from trusted farms and suppliers.',
    img: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790947480/vpnexues/why-choose/wxmseyt1egcr2vzs5zkt.png',
    imgAlt: 'Fresh fruit basket with apples, berries, mango and pomegranate',
    chips: ['Freshly sourced', 'Carefully selected', 'Better freshness'],
    backTitle: 'From source to shelf',
    points: ['Trusted sourcing', 'Fresh produce selection', 'Better handling'],
    ctaLabel: 'Explore Fresh Produce',
    ctaTo: '/shop?category=Vegetables',
  },
  {
    id: 'quality-checks',
    tone: 'toneCream',
    eyebrow: 'Quality first',
    title: 'Checked Every Day',
    desc: 'Products are reviewed for freshness, appearance and overall quality.',
    img: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790945501/vpnexues/why-choose/crigdkewxhs6w8sezw6c.jpg',
    imgAlt: 'VP Nexues quality groceries promise poster',
    chips: ['Freshness check', 'Quality check', 'Daily review'],
    backTitle: 'Quality before delivery',
    points: ['Visual quality checks', 'Freshness screening', 'Careful handling'],
    ctaLabel: 'Learn About Our Quality',
    ctaTo: '/about',
  },
  {
    id: 'everyday-essentials',
    tone: 'toneIvory',
    eyebrow: 'Everyday value',
    title: 'Essentials You Can Trust',
    desc: 'Fresh produce, groceries and everyday essentials in one place.',
    img: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790947483/vpnexues/why-choose/dzndlwn2xv43d7upfz1v.png',
    imgAlt: 'VP Nexues grocery essentials — rice, dal, sugar, tea and sunflower oil',
    chips: ['Fresh produce', 'Grocery essentials', 'Convenient shopping'],
    backTitle: 'Everything you need',
    points: ['Fresh produce', 'Kitchen staples', 'Business supply options'],
    ctaLabel: 'Explore Categories',
    ctaTo: '/shop',
  },
];

/* Max pointer travel (px) still treated as a tap — beyond this it's a swipe. */
const TAP_SLOP = 12;

export default function WhyChoose() {
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
    <section className={styles.whySection} aria-labelledby="why-choose-title">
      <div className={styles.whyContainer}>
        <div className={styles.whyHead}>
          <span className={styles.whyEyebrow}>
            <IconLeaf width={14} height={14} aria-hidden="true" />
            Good food, better choices
          </span>
          <h2 id="why-choose-title" className={styles.whyTitle}>
            Why Choose VPNexues?
          </h2>
          <p className={styles.whySub}>
            Fresh sourcing, careful quality checks and dependable delivery — from farm to your doorstep.
          </p>
        </div>

        <div className={styles.whyGrid}>
          {CARDS.map((card) => {
            const flipped = activeId === card.id;
            return (
              <div
                key={card.id}
                className={`${styles.flipCard} ${styles[card.tone]} ${flipped ? styles.flipped : ''}`}
                onPointerDown={onPointerDown}
                onClick={onCardClick(card.id)}
                onKeyDown={onCardKeyDown(card.id)}
                tabIndex={0}
                role="button"
                aria-expanded={flipped}
                aria-label={`${card.title} — activate to ${flipped ? 'show front' : 'show details'}`}
              >
                <div className={styles.flipInner}>
                  {/* FRONT */}
                  <div className={styles.flipFront} aria-hidden={flipped}>
                    <div className={styles.frontMedia}>
                      <img src={card.img} alt={card.imgAlt} loading="lazy" draggable={false} />
                    </div>
                    <div className={styles.frontBody}>
                      <span className={styles.frontEyebrow}>{card.eyebrow}</span>
                      <h3 className={styles.frontTitle}>{card.title}</h3>
                      <p className={styles.frontDesc}>{card.desc}</p>
                      <div className={styles.chipRow}>
                        {card.chips.map((chip) => (
                          <span key={chip} className={styles.chip}>
                            {chip}
                          </span>
                        ))}
                      </div>
                    </div>
                    <span className={styles.flipHint} aria-hidden="true">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width="15" height="15">
                        <path d="M3 12a9 9 0 0 1 15.5-6.2L21 8" />
                        <path d="M21 3v5h-5" />
                        <path d="M21 12a9 9 0 0 1-15.5 6.2L3 16" />
                        <path d="M3 21v-5h5" />
                      </svg>
                    </span>
                  </div>

                  {/* BACK */}
                  <div className={styles.flipBack} aria-hidden={!flipped}>
                    <div className={styles.backMedia}>
                      <img src={card.img} alt="" loading="lazy" draggable={false} />
                    </div>
                    <div className={styles.backBody}>
                      <span className={styles.backEyebrow}>{card.eyebrow}</span>
                      <h3 className={styles.backTitle}>{card.backTitle}</h3>
                      <ul className={styles.backPoints}>
                        {card.points.map((point) => (
                          <li key={point}>
                            <span className={styles.check} aria-hidden="true">
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" width="12" height="12">
                                <path d="m4.5 12.5 5 5 10-11" />
                              </svg>
                            </span>
                            {point}
                          </li>
                        ))}
                      </ul>
                      <Link
                        to={card.ctaTo}
                        className={styles.backCta}
                        tabIndex={flipped ? 0 : -1}
                        aria-label={card.ctaLabel}
                      >
                        {card.ctaLabel} <IconArrowRight width={14} height={14} aria-hidden="true" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <p className={styles.whyHint}>Tap a card to see more</p>
      </div>
    </section>
  );
}
