import { useEffect, useRef, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../i18n/LanguageContext';
import { useCountry } from '../../context/CountryContext';
import { submitContactMessage } from '../../api/contactApi';
import { IconLeaf, IconHeart, IconGlobe, IconPhone, IconMail, IconMapPin, IconCheck } from '../../components/common/icons';
import Lightbox from '../../components/common/Lightbox';
import styles from './css/About.module.css';

const PILLAR_KEYS = [
  'aboutUs', 'ourMission', 'ourVision', 'ourValues',
] as const;

const FEATURE_IMAGES = [
  'https://res.cloudinary.com/eqjshlur/image/upload/v1790001750/vpnexues/old/site-assets/home-1/feature/feature-01.png',
  'https://res.cloudinary.com/eqjshlur/image/upload/v1790001752/vpnexues/old/site-assets/home-1/feature/feature-02.png',
  'https://res.cloudinary.com/eqjshlur/image/upload/v1790001754/vpnexues/old/site-assets/home-1/feature/feature-03.png',
  'https://res.cloudinary.com/eqjshlur/image/upload/v1790001756/vpnexues/old/site-assets/home-1/feature/feature-04.png',
];

const FEATURE_KEYS = ['organic', 'farmFresh', 'importExport', 'b2bB2c'] as const;

const STORY_CHECK_KEYS = ['directFarmer', 'b2bB2c', 'globalShipping', 'qualityCertified'] as const;

const SERVICE_IDS = ['thumb1', 'thumb2', 'thumb3', 'thumb4'];
const SERVICE_KEYS = ['organicProduceExport', 'farmToDoor', 'b2bBulkSupply', 'importSourcing'] as const;
const SERVICE_LINKS = ['/pricing/small-box', '/pricing/small-box', '/pricing/b2b', '/pricing/b2b'];

const COUNTER_ENDS = [150, 25, 98, 10];
const COUNTER_SUFFIXES = ['+', 'K+', '%', '+'];
const COUNTER_KEYS = ['organicProducts', 'happyCustomers', 'customerSatisfaction', 'expertTeam'] as const;

/* Six tiles mirror the Gallery page: its first three agriculture photos
   (farmerimg1-3, captioned by gallery.notes) plus its first three team
   photos (team-image-0..2) - the same URLs as Gallery.tsx's fallback. */
const FARM_GALLERY = [
  'https://res.cloudinary.com/eqjshlur/image/upload/f_auto,q_auto:good/vpnexues/gallery/farmerimg1.jpg',
  'https://res.cloudinary.com/eqjshlur/image/upload/f_auto,q_auto:good/vpnexues/gallery/farmerimg2.jpg',
  'https://res.cloudinary.com/eqjshlur/image/upload/f_auto,q_auto:good/vpnexues/gallery/farmerimg3.jpg',
];

const TEAM_GALLERY = [
  { image: 'https://res.cloudinary.com/eqjshlur/image/upload/f_auto,q_auto:good/vpnexues/gallery/team-image-0.jpg', caption: 'Team moment' },
  { image: 'https://res.cloudinary.com/eqjshlur/image/upload/f_auto,q_auto:good/vpnexues/gallery/team-image-1.jpg', caption: 'Our team at work' },
  { image: 'https://res.cloudinary.com/eqjshlur/image/upload/f_auto,q_auto:good/vpnexues/gallery/team-image-2.jpg', caption: 'Team collaboration' },
];

type OfficeEntry = { cityKey: string; text?: string; textKey?: string; comingSoon?: boolean };

const OFFICE_ADDRESSES: OfficeEntry[] = [
  { cityKey: 'common.citySingapore', text: '412 Race Course Road, Singapore 218660' },
  { cityKey: 'common.citySriLanka', textKey: 'about.addressTba', comingSoon: true },
  { cityKey: 'common.citySalemIndia', text: 'No 312/11, Siva Towers, Perumal Malai Road, Narasothipatti, Salem Tamil Nadu, India, 636004' },
  { cityKey: 'common.cityTirupattur', text: 'VPNexues Private Limited, No. 8, Don Bosco Nagar, 3rd Floor, Aether E-Bike Showroom Building, Opposite to DBX School, Tirupattur - 635601, India' },
];

const CONTACT_PILLS: { icon: typeof IconPhone; text: string; href: string }[] = [
  { icon: IconPhone, text: '+91 78100 77636', href: 'tel:+917810077636' },
  { icon: IconPhone, text: '+91 8148197842', href: 'tel:+918148197842' },
  { icon: IconMail, text: 'support@vpnexues.com', href: 'mailto:support@vpnexues.com' },
];

/* Looping photo slides for the story circle (founder cutout <-> Singapore trip) */
const OFFICE_PHOTOS = [
  {
    src: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001749/vpnexues/old/site-assets/home-1/cta/fa2.webp',
    alt: 'VPNexues representative',
    framed: false,
    cutout: true,
  },
  {
    src: '/images/about/nagasir.jpeg',
    alt: 'VPNexues representative at Marina Bay Sands, Singapore',
    framed: true,
    cutout: false,
  },
];

type Highlight = { key: 'organicSourcing' | 'fairPricing' | 'globalReach'; icon: typeof IconLeaf };

const HIGHLIGHTS: Highlight[] = [
  { key: 'organicSourcing', icon: IconLeaf },
  { key: 'fairPricing', icon: IconHeart },
  { key: 'globalReach', icon: IconGlobe },
];

const IDENTITY_CARDS = ['introOurVision', 'introGlobalReach'] as const;

const IDENTITY_CARD_DESCS = ['introOurVisionDesc', 'introGlobalReachDesc'] as const;

const BADGES = [
  { emoji: '🌿', key: 'badgeFarmFresh' },
  { emoji: '✔', key: 'badgeCertified' },
  { emoji: '🚚', key: 'badgeDoorstep' },
] as const;

function useCountUp(end: number, duration = 2000) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const start = performance.now();
          const animate = (now: number) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            setCount(Math.floor(progress * end));
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [end, duration]);

  return { ref, count };
}

function CounterItem({ end, suffix, label, index }: { end: number; suffix: string; label: string; index: number }) {
  const { ref, count } = useCountUp(end);
  return (
    <div className={styles.statCell} ref={ref} data-reveal="up" style={{ animationDelay: `${index * 0.08}s` }}>
      <span className={styles.statValue}>{count}{suffix}</span>
      <span className={styles.statLabel}>{label}</span>
    </div>
  );
}

function CircularProgress({ percent, label }: { percent: number; label: string }) {
  const [active, setActive] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setActive(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const RADIUS = 54;
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
  const offset = CIRCUMFERENCE - (CIRCUMFERENCE * (active ? percent : 0)) / 100;

  return (
    <div className={styles.ringItem} ref={ref}>
      <div className={styles.ringBox}>
        <svg className={styles.ringSvg} viewBox="0 0 128 128" role="img" aria-label={`${label} ${percent}%`}>
          <circle className={styles.ringTrack} cx="64" cy="64" r={RADIUS} />
          <circle
            className={styles.ringFill}
            cx="64"
            cy="64"
            r={RADIUS}
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={offset}
          />
        </svg>
        <span className={styles.ringValue}>{percent}%</span>
      </div>
      <p className={styles.ringLabel}>{label}</p>
    </div>
  );
}

export default function About() {
  const { t, tRaw, lang } = useLanguage();
  const { country } = useCountry();

  const contactPoints = (() => {
    const raw = tRaw('about.contactPoints');
    return Array.isArray(raw) ? (raw as string[]) : [];
  })();
  const galleryNotes = (() => {
    const raw = tRaw('gallery.notes');
    return Array.isArray(raw) ? (raw as string[]) : [];
  })();
  const teamStats = (() => {
    const raw = tRaw('careers.stats');
    return Array.isArray(raw) ? (raw as { value: string; label: string }[]) : [];
  })();

  const galleryTiles = [
    ...FARM_GALLERY.map((src, i) => ({ src, caption: galleryNotes[i] ?? '' })),
    ...TEAM_GALLERY.map((g) => ({ src: g.image, caption: g.caption })),
  ];

  /* Headline accent: the trailing "Since 2022." renders italic + gold,
     the way the reference design highlights its closing phrase. */
  const headingRaw = t('about.heading');
  const sinceIdx = headingRaw.lastIndexOf('Since');
  const headMain = sinceIdx > 0 ? headingRaw.slice(0, sinceIdx).trim() : headingRaw;
  const headAccent = sinceIdx > 0 ? headingRaw.slice(sinceIdx).trim() : '';

  const [officePhoto, setOfficePhoto] = useState(0);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const pageRef = useRef<HTMLDivElement>(null);
  const [formData, setFormData] = useState({ email: '', fullname: '', company: '', phone: '', subject: '', message: '' });
  const [formStatus, setFormStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const filledCount = Object.values(formData).filter((v) => v.trim() !== '').length;

  const PILLARS = useMemo(() => PILLAR_KEYS.map((key, i) => ({
    index: String(i + 1).padStart(2, '0'),
    title: t(`about.carousel.${key}.title`),
    desc: t(`about.carousel.${key}.desc`),
    items: [0, 1, 2].map((j) => ({
      label: t(`about.carousel.${key}.items.${j}`),
      text: t(`about.carousel.${key}.texts.${j}`),
    })),
  })), [t]);

  const FEATURES = useMemo(() => FEATURE_KEYS.map((key, i) => ({
    image: FEATURE_IMAGES[i],
    title: t(`about.features.${key}.title`),
    desc: t(`about.features.${key}.desc`),
  })), [t]);

  const SERVICES = useMemo(() => SERVICE_KEYS.map((key, i) => ({
    id: SERVICE_IDS[i],
    title: t(`about.services.${key}.title`),
    desc: t(`about.services.${key}.desc`),
    link: SERVICE_LINKS[i],
  })), [t]);

  const COUNTERS = useMemo(() => COUNTER_KEYS.map((key, i) => ({
    end: COUNTER_ENDS[i],
    suffix: COUNTER_SUFFIXES[i],
    label: t(`about.counters.${key}`),
  })), [t]);

  const STORY_CHECKS = useMemo(() => STORY_CHECK_KEYS.map((key) => t(`about.${key}`)), [t]);

  /* Story circle photo loop: crossfade founder cutout <-> Singapore photo */
  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const timer = setInterval(() => {
      setOfficePhoto((i) => (i + 1) % OFFICE_PHOTOS.length);
    }, 4500);
    return () => clearInterval(timer);
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
      { rootMargin: '0px 0px -80px 0px' },
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (formStatus === 'sending') return;
    setFormStatus('sending');
    const message = formData.company
      ? `Company: ${formData.company}\n\n${formData.message}`
      : formData.message;
    submitContactMessage({
      name: formData.fullname.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim() || undefined,
      countryCode: country,
      subject: formData.subject,
      message,
    }).then(() => {
      setFormStatus('success');
      setFormData({ email: '', fullname: '', company: '', phone: '', subject: '', message: '' });
      setTimeout(() => setFormStatus('idle'), 3000);
    }).catch(() => {
      setFormStatus('error');
    });
  }

  const brandParts = t('about.partnersWith').split(/(\d+\+)/g);

  return (
    <div className={`${styles.aboutPage}${lang !== 'en' ? ` ${styles.aboutNonEn}` : ''}`} ref={pageRef}>
      {/* ── Page Banner (Support-hero style) — UNCHANGED ── */}
      <section className={styles.desktopBanner}>
        <div className={styles.bannerOverlay}>
          <div className="container">
            <div className={styles.bannerContent} data-reveal="up">
              <div className={styles.breadcrumb}>
                <Link to="/">{t('about.breadcrumbHome')}</Link>
                <span>&rsaquo;</span>
                {t('about.breadcrumbAbout')}
              </div>
              <div className={styles.bannerIcon}>
                <IconLeaf width={26} height={26} aria-hidden="true" />
              </div>
              <h1>{t('about.title')}</h1>
              <p>{t('about.subtitle')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 01 · Centered story hero ── */}
      <section className={styles.heroSection}>
        <div className="container">
          <div className={styles.heroInner}>
            <span className={styles.eyebrow} data-reveal="up">{t('about.aboutVpnexues')}</span>
            <h2 className={styles.heroTitle} data-reveal="up">
              {headMain}
              {headAccent && <> <em className={styles.heroAccent}>{headAccent}</em></>}
            </h2>
            <p className={styles.heroLead} data-reveal="up">{t('about.desc1')}</p>
            <p className={styles.heroKicker} data-reveal="up">{t('home.closingText')}</p>

            <div className={styles.heroActions} data-reveal="up">
              <a href="#contact-app" className={styles.themeBtn}>
                {t('about.contactUs')} <span className={styles.arrow}>&rarr;</span>
              </a>
              <Link to="/service" className={styles.outlineBtn}>
                {t('about.ourServices')} <span className={styles.arrow}>&rarr;</span>
              </Link>
            </div>

            <ul className={styles.checkChips} data-reveal="up">
              {STORY_CHECKS.map((label) => (
                <li key={label}>
                  <span className={styles.checkChipMark}><IconCheck width={11} height={11} aria-hidden="true" /></span>
                  {label}
                </li>
              ))}
            </ul>

            <div className={styles.statStrip}>
              {COUNTERS.map((c, i) => (
                <CounterItem key={c.label} end={c.end} suffix={c.suffix} label={c.label} index={i} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 02 · Trusted worldwide ── */}
      <section className={styles.trustSection}>
        <div className="container">
          <div className={styles.trustPanel} data-reveal="up">
            <span className={styles.mediaTag}>
              <IconLeaf width={15} height={15} aria-hidden="true" /> {t('about.badgeCertified')}
            </span>
            <span className={styles.trustNum}>150+</span>
            <h2 className={styles.trustTitle}>{t('about.trustedWorldwide')}</h2>
            <p className={styles.trustDesc}>{t('about.trustedDesc')}</p>
          </div>
        </div>
      </section>

      {/* ── 03 · Our story ── */}
      <section className={styles.storySection}>
        <div className="container">
          <div className={styles.storyGrid}>
            <div className={styles.storyFigure} data-reveal="left">
              <div className={styles.storyCircle}>
                <div className={styles.photoClip}>
                  {OFFICE_PHOTOS.map((p, i) => (
                    <img
                      key={p.src}
                      src={p.src}
                      alt={p.alt}
                      loading="lazy"
                      aria-hidden={i === officePhoto ? undefined : true}
                      className={`${styles.photoSlide}${i === officePhoto ? ` ${styles.photoSlideActive}` : ''}${p.framed ? ` ${styles.photoSlideFramed}` : ''}${p.cutout ? ` ${styles.photoSlideCutout}` : ''}`}
                    />
                  ))}
                </div>
                <span className={`${styles.storyChip} ${styles.storyChipStat} ${styles.storyChipCustomers}`}>
                  <strong>25K+</strong>
                  <small>{t('about.counters.happyCustomers')}</small>
                </span>
                <span className={`${styles.storyChip} ${styles.storyChipReach}`}>
                  <IconGlobe width={14} height={14} aria-hidden="true" /> {t('about.choosePoint3Title')}
                </span>
                <span className={`${styles.storyChip} ${styles.storyChipOrganic}`}>
                  <IconLeaf width={14} height={14} aria-hidden="true" /> {t('about.badgeCertified')}
                </span>
                <span className={styles.storyBadge}>
                  <strong>2022</strong>
                  <small>EST.</small>
                </span>
              </div>
            </div>

            <div className={styles.storyCopy} data-reveal="right">
              <span className={styles.eyebrow}>{t('home.closingOverline')}</span>
              <h2 className={styles.storyTitle}>{t('history.builtOnTrust')}</h2>
              <p className={styles.storyText}>{t('history.storyBody')}</p>
              <p className={styles.storyText}>{t('about.introWhoWeAreDesc')}</p>
              <div className={styles.badgeRow}>
                {BADGES.map((b) => (
                  <span key={b.key} className={styles.badge}>
                    <span aria-hidden="true">{b.emoji}</span> {t(`about.${b.key}`)}
                  </span>
                ))}
              </div>
              <p className={styles.storySign}>{t('team.visionNote')}</p>
            </div>
          </div>

          <div className={styles.noteGrid}>
            {IDENTITY_CARDS.map((key, i) => (
              <article className={styles.note} key={key}>
                <span className={styles.noteMark} aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                <h3>{t(`about.${key}`)}</h3>
                <p>{t(`about.${IDENTITY_CARD_DESCS[i]}`)}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── 04 · Beliefs card: who we are, pillars, team & reach ── */}
      <section className={styles.beliefsSection}>
        <div className="container">
          <article className={styles.beliefCard} data-reveal="up">
            <header className={styles.beliefHead}>
              <span className={styles.beliefIcon}><IconLeaf width={22} height={22} aria-hidden="true" /></span>
              <div className={styles.beliefHeadText}>
                <h3>{t('about.introWhoWeAre')}</h3>
                <p>{t('about.carousel.aboutUs.desc')}</p>
              </div>
            </header>

            <div className={styles.beliefGrid}>
              <div className={styles.beliefSide} data-reveal="left">
                <ul className={styles.checkPoints}>
                  {contactPoints.map((point, idx) => (
                    <li key={idx}>
                      <span className={styles.checkPointMark} aria-hidden="true"><IconCheck width={11} height={11} /></span>
                      {point}
                    </li>
                  ))}
                </ul>
                <Link to="/team" className={styles.outlineBtn}>
                  {t('team.breadcrumbTeam')} <span className={styles.arrow}>&rarr;</span>
                </Link>
                <figure className={styles.sideMedia} data-reveal="up">
                  <img src={FARM_GALLERY[0]} alt={galleryNotes[0] ?? ''} loading="lazy" />
                  <figcaption>
                    <span>{t('about.badgeFarmFresh')}</span>
                    {galleryNotes[0]}
                  </figcaption>
                </figure>
              </div>

              <div className={styles.pillarRows} data-reveal="right">
                {PILLARS.map((p, i) => (
                  <article
                    className={styles.pillarRow}
                    key={p.title}
                    data-reveal="up"
                    style={{ animationDelay: `${0.06 + i * 0.07}s` }}
                  >
                    <span className={styles.pillarIndex}>{p.index}</span>
                    <div className={styles.pillarBody}>
                      <h4>{p.title}</h4>
                      <p>{p.desc}</p>
                      <ul className={styles.pillarMeta}>
                        {p.items.map((item) => (
                          <li key={item.label}>
                            <strong>{item.label}</strong>
                            <span>{item.text}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </article>
                ))}
                <div className={styles.pillarCta}>
                  <div className={styles.pillarCtaText}>
                    <h4>{t('about.contactWithUs')}</h4>
                    <p>{t('about.choosePoint3Desc')}</p>
                  </div>
                  <a href="#contact-app" className={styles.pillarCtaLink}>
                    {t('about.getQuote')} <span className={styles.arrow}>&rarr;</span>
                  </a>
                </div>
              </div>
            </div>

            <footer className={styles.beliefFoot}>
              <div className={styles.teamHeadInline} data-reveal="left">
                <span className={styles.eyebrow}>{t('team.title')}</span>
                <h4>{t('team.peopleBehind')}</h4>
                <p>{t('team.subtitle')}</p>
              </div>
              <div className={styles.teamStats}>
                {teamStats.map((s, i) => (
                  <div
                    key={s.label}
                    className={styles.teamStat}
                    data-reveal="up"
                    style={{ animationDelay: `${0.05 + i * 0.07}s` }}
                  >
                    <span className={styles.teamStatValue}>{s.value}</span>
                    <span className={styles.teamStatLabel}>{s.label}</span>
                  </div>
                ))}
              </div>
            </footer>
          </article>
        </div>
      </section>

      {/* ── 05 · Our pledge (4 standards) + proof card ── */}
      <section className={styles.pledgeSection}>
        <div className="container">
          <header className={styles.sectionHead} data-reveal="up">
            <span className={styles.eyebrow}>{t('about.whyChoose')}</span>
            <h2 className={styles.blockTitle}>{t('about.growingOrganic')}</h2>
            <p className={styles.sectionLead}>{t('about.chooseDesc1')}</p>
            <p className={styles.sectionLead}>{t('about.chooseDesc2')}</p>
          </header>

          <div className={styles.pledgeGrid}>
            {FEATURES.map((f, i) => (
              <div
                key={f.title}
                className={styles.pledgeCol}
                data-reveal="up"
                style={{ animationDelay: `${0.05 + i * 0.07}s` }}
              >
                <span className={styles.pledgeAvatar}>
                  <img src={f.image} alt="" loading="lazy" />
                </span>
                <h4>{f.title}</h4>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>

          <div className={styles.proofCard} data-reveal="up">
            <header className={styles.proofHead}>
              <span className={styles.eyebrow}>{t('home.trustOverline')}</span>
              <h3>{t('home.trustTitle')}</h3>
            </header>

            <div className={styles.proofBody}>
              <div className={styles.highlightList}>
                {HIGHLIGHTS.map((p) => (
                  <div key={p.key} className={styles.highlight}>
                    <span className={styles.highlightIcon}><p.icon width={20} height={20} /></span>
                    <div className={styles.highlightBody}>
                      <h4>{t(`about.highlights.${p.key}.title`)}</h4>
                      <p>{t(`about.highlights.${p.key}.desc`)}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className={styles.proofSide}>
                <div className={styles.ringGroup}>
                  <CircularProgress percent={98} label={t('about.organicQuality')} />
                  <CircularProgress percent={90} label={t('about.exportReliability')} />
                </div>
                <div className={styles.awardLine}>
                  <span className={styles.awardMark} aria-hidden="true">
                    <img src="https://res.cloudinary.com/eqjshlur/image/upload/v1790001743/vpnexues/old/site-assets/home-1/choose/organic-icon.png" alt="" loading="lazy" />
                  </span>
                  <span className={styles.awardMark} aria-hidden="true">
                    <img src="https://res.cloudinary.com/eqjshlur/image/upload/v1790001745/vpnexues/old/site-assets/home-1/choose/ratting-icon.png" alt="" loading="lazy" />
                  </span>
                  <strong>{t('about.awardWinning')}</strong>
                </div>
                <a href="#contact-app" className={styles.themeBtn}>
                  {t('about.getQuote')} <span className={styles.arrow}>&rarr;</span>
                </a>
              </div>
            </div>
          </div>

          <p className={styles.partnerLine} data-reveal="up">
            {brandParts.map((part, i) => (
              part.match(/^\d+\+$/) ? (
                <strong key={i} className={styles.partnerNum}>{part}</strong>
              ) : (
                <span key={i}>{part}</span>
              )
            ))}
          </p>
        </div>
      </section>

      {/* ── 06 · Services, gatherings style ── */}
      <section className={styles.servicesSection}>
        <div className="container">
          <div className={styles.servicesGrid}>
            <figure className={styles.servicesMedia} data-reveal="left">
              <img src="/images/about/service.jpeg" alt="VPNexues organic produce" loading="lazy" />
              <span className={`${styles.chip} ${styles.chipTop}`}>{t('about.b2bB2c')}</span>
              <Link to="/service" className={`${styles.chip} ${styles.chipLink}`}>
                {t('about.viewDetails')} <span className={styles.arrow}>&rarr;</span>
              </Link>
            </figure>

            <div className={styles.servicesCopy} data-reveal="right">
              <span className={styles.eyebrow}>{t('about.ourServices')}</span>
              <h2 className={styles.blockTitle}>{t('about.servicesWeOffer')}</h2>
              <p className={styles.sectionLead}>{t('about.servicesDesc')}</p>

              <div className={styles.serviceTiles}>
                {SERVICES.map((s, i) => (
                  <Link
                    key={s.id}
                    to={s.link}
                    className={styles.serviceTile}
                    data-reveal="up"
                    style={{ animationDelay: `${0.05 + i * 0.06}s` }}
                  >
                    <span className={styles.serviceTileIndex}>{String(i + 1).padStart(2, '0')}</span>
                    <span className={styles.serviceTileBody}>
                      <strong>{s.title}</strong>
                      <small>{s.desc}</small>
                    </span>
                    <span className={styles.serviceTileArrow} aria-hidden="true">&rarr;</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 07 · Gallery (six photos from the Gallery page) + film ── */}
      <section className={styles.gallerySection}>
        <div className="container">
          <header className={styles.sectionHead} data-reveal="up">
            <span className={styles.eyebrow}>{t('about.ourProductGallery')}</span>
            <h2 className={styles.blockTitle}>{t('about.freshFromFarms')}</h2>
            <Link to="/gallery" className={styles.outlineBtn}>
              {t('home.showMore')} <span className={styles.arrow}>&rarr;</span>
            </Link>
          </header>

          <div className={styles.galleryGrid}>
            {galleryTiles.map((g, i) => (
              <div
                key={g.src}
                className={styles.galleryCard}
                data-reveal="up"
                style={{ animationDelay: `${0.05 + i * 0.06}s` }}
                role="button"
                tabIndex={0}
                aria-label={`${t('about.viewPhotoAria')}: ${g.caption}`}
                onClick={() => setLightboxIndex(i)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setLightboxIndex(i);
                  }
                }}
              >
                <div className={styles.galleryMedia}>
                  <img src={g.src} alt={g.caption} loading="lazy" />
                </div>
                <div className={styles.galleryCaption}>
                  <span className={styles.galleryIndex}>{String(i + 1).padStart(2, '0')}</span>
                  <h3>{g.caption}</h3>
                </div>
              </div>
            ))}
          </div>

          <div className={styles.filmRow} data-reveal="up">
            <div className={styles.videoWrapper}>
              {videoPlaying ? (
                <video
                  ref={videoRef}
                  className={styles.videoPlayer}
                  src="https://res.cloudinary.com/eqjshlur/video/upload/f_mp4,q_auto/vpnexues/about/about-farm.mp4"
                  poster="https://res.cloudinary.com/eqjshlur/image/upload/f_auto,q_auto:good/vpnexues/about/video.webp"
                  controls
                  autoPlay
                  playsInline
                  preload="auto"
                  onEnded={() => setVideoPlaying(false)}
                />
              ) : (
                <button
                  type="button"
                  className={styles.videoCover}
                  aria-label="Play video"
                  onClick={() => setVideoPlaying(true)}
                >
                  <img src="https://res.cloudinary.com/eqjshlur/image/upload/f_auto,q_auto:good/vpnexues/about/video.webp" alt="VPNexues farm video" loading="lazy" />
                  <span className={styles.videoBtn} aria-hidden="true">&#9654;</span>
                  <span className={styles.videoCaption}>{t('about.ecoAgriculture')}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── 08 · Locations + contact ── */}
      <section className={styles.closingSection} id="contact-app">
        <span className={styles.closingPattern} aria-hidden="true" />
        <div className="container">
          <header className={styles.sectionHead} data-reveal="up">
            <span className={styles.eyebrow}>{t('about.contactUs')}</span>
            <h2 className={styles.closingTitle}>{t('about.contactB2bB2c')}</h2>
          </header>

          <div className={styles.closingGrid}>
            <div className={styles.closingInfo} data-reveal="left">
              <div className={styles.locationsBlock}>
                <div className={styles.locationsHead}>
                  <span className={styles.eyebrow}>{t('about.ourLocations')}</span>
                  <h3>{t('about.contactWithUs')}</h3>
                </div>

                <ul className={styles.locationList}>
                  {OFFICE_ADDRESSES.map((office) => (
                    <li key={office.cityKey} className={styles.locationItem}>
                      <span className={styles.locationIcon} aria-hidden="true"><IconMapPin width={16} height={16} /></span>
                      <div className={styles.locationBody}>
                        <strong>
                          {t(office.cityKey)}
                          {office.comingSoon && <span className={styles.locationSoon}>{t('common.comingSoon')}</span>}
                        </strong>
                        <p>{office.textKey ? t(office.textKey) : office.text}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              <div className={styles.contactPills}>
                {CONTACT_PILLS.map((pill) => (
                  <a key={pill.href} href={pill.href} className={styles.contactPill}>
                    <span className={styles.contactPillIcon} aria-hidden="true"><pill.icon width={14} height={14} /></span>
                    {pill.text}
                  </a>
                ))}
              </div>
            </div>

            <div className={styles.closingForm} data-reveal="right">
              <div className={styles.formCard}>
                <div className={styles.formProgress}>
                  <div className={styles.formProgressBar}>
                    <span style={{ width: `${(filledCount / 6) * 100}%` }} />
                  </div>
                  <div className={styles.formProgressMeta}>
                    <span>{filledCount} {t('about.of6Fields')}</span>
                    <span>{filledCount >= 6 ? t('about.readyToSend') : t('about.almostThere')}</span>
                  </div>
                </div>
                <form className={styles.contactForm} onSubmit={handleFormSubmit}>
                  <div className={styles.formGrid}>
                    <div className={styles.formGroup}>
                      <label htmlFor="about-email" className={styles.formLabel}>{t('common.emailAria')}</label>
                      <input id="about-email" type="email" name="email" placeholder={t('about.enterEmail')} required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                    </div>
                    <div className={styles.formGroup}>
                      <label htmlFor="about-fullname" className={styles.formLabel}>{t('about.nameLabel')}</label>
                      <input id="about-fullname" type="text" name="fullname" placeholder={t('about.enterName')} required value={formData.fullname} onChange={(e) => setFormData({ ...formData, fullname: e.target.value })} />
                    </div>
                    <div className={styles.formGroup}>
                      <label htmlFor="about-company" className={styles.formLabel}>{t('about.companyLabel')}</label>
                      <input id="about-company" type="text" name="company" placeholder={t('about.companyName')} value={formData.company} onChange={(e) => setFormData({ ...formData, company: e.target.value })} />
                    </div>
                    <div className={styles.formGroup}>
                      <label htmlFor="about-phone" className={styles.formLabel}>{t('about.phoneAria')}</label>
                      <input id="about-phone" type="text" name="phone" placeholder={t('about.phoneNumber')} value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                    </div>
                    <div className={styles.formGroupFull}>
                      <label htmlFor="about-subject" className={styles.formLabel}>{t('about.subjectLabel')}</label>
                      <select id="about-subject" name="subject" required value={formData.subject} onChange={(e) => setFormData({ ...formData, subject: e.target.value })}>
                        <option value="" disabled>{t('about.yourSubject')}</option>
                        <option value="B2B bulk supply">{t('about.subjectB2b')}</option>
                        <option value="B2C retail order">{t('about.subjectB2c')}</option>
                        <option value="Partnership &amp; distribution">{t('about.subjectPartnership')}</option>
                        <option value="Other">{t('about.subjectOther')}</option>
                      </select>
                    </div>
                    <div className={styles.formGroupFull}>
                      <label htmlFor="about-message" className={styles.formLabel}>{t('about.messageLabel')}</label>
                      <textarea id="about-message" name="message" placeholder={t('about.writeMessage')} required rows={5} value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} />
                    </div>
                    <div className={styles.formSubmit}>
                      <button type="submit" className={styles.themeBtn} disabled={formStatus === 'sending'}>
                        {formStatus === 'sending' ? t('about.sending') : formStatus === 'success' ? t('about.messageSent') : t('about.sendMessage')} <span className={styles.arrow}>&rarr;</span>
                      </button>
                      {formStatus === 'error' && (
                        <p role="alert" className={styles.formError}>
                          {t('about.messageFailed') === 'about.messageFailed' ? 'Could not send your message. Please try again.' : t('about.messageFailed')}
                        </p>
                      )}
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Lightbox
        images={galleryTiles.map((g) => g.src)}
        descriptions={galleryTiles.map((g) => g.caption)}
        index={lightboxIndex ?? 0}
        open={lightboxIndex !== null}
        onClose={() => setLightboxIndex(null)}
      />
    </div>
  );
}
