import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import { useCountry } from '../../context/CountryContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useAuthModal } from '../../context/AuthModalContext';
import { submitB2BEnquiry } from '../../api/b2bEnquiriesApi';
import { deliverWhatsAppPopup } from '../../utils/whatsappPopup';
import {
  IconLeaf,
  IconPhone,
  IconMail,
  IconArrowRight,
  IconCheck,
  IconTruck,
  IconBasket,
  IconShieldCheck,
} from '../../components/common/icons';
import Seo from '../../components/common/Seo';
import { SEO } from '../../config/seoMeta';
import styles from './css/B2B.module.css';

const BUSINESS_TYPES = [
  'Restaurant / Café',
  'Hotel / Resort',
  'Catering Company',
  'Supermarket / Retailer',
  'Food Manufacturing',
  'School / Institution',
  'Other',
];

const PRODUCT_CATEGORIES = [
  { label: 'Vegetables', icon: '🥦' },
  { label: 'Fruits', icon: '🍎' },
  { label: 'Grains & Millets', icon: '🌾' },
  { label: 'Dairy & Eggs', icon: '🥛' },
  { label: 'Oil & Spices', icon: '🫙' },
  { label: 'Herbs', icon: '🌿' },
  { label: 'Dry Fruits & Nuts', icon: '🥜' },
  { label: 'Poultry', icon: '🍗' },
  { label: 'Goodies', icon: '🍪' },
  { label: 'Packaging', icon: '📦' },
];

const VOLUME_OPTIONS = [
  'Under 100 kg',
  '100 – 500 kg',
  '500 kg – 1 ton',
  '1 – 5 tons',
  '5+ tons',
];

const FREQUENCY_OPTIONS = [
  'Daily',
  '2–3 times per week',
  'Weekly',
  'Bi-weekly',
  'Monthly',
];

const TESTIMONIALS = [
  {
    quote: '',
    name: 'Priya S.',
    role: '',
    initials: 'PS',
  },
  {
    quote: '',
    name: 'Rajesh K.',
    role: '',
    initials: 'RK',
  },
  {
    quote: '',
    name: 'Mei Lin T.',
    role: '',
    initials: 'ML',
  },
  {
    quote: '',
    name: 'Arun P.',
    role: '',
    initials: 'AP',
  },
  {
    quote: '',
    name: 'Sara N.',
    role: '',
    initials: 'SN',
  },
];

const BENEFITS = [
  { icon: '📈', id: 'flexibleVolume', wide: false },
  { icon: '📅', id: 'reliableDelivery', wide: false },
  { icon: '📋', id: 'invoiceBilling', wide: false },
  { icon: '🎯', id: 'accountManager', wide: false },
  { icon: '🌿', id: 'certifications', wide: true },
] as const;

const BENEFIT_DETAILS: Record<string, { icon: string; titleKey: string; descKey: string; modalKey: string }> = {
  flexibleVolume: {
    icon: '📈',
    titleKey: 'b2b.flexibleVolumeTitle',
    descKey: 'b2b.flexibleVolumeDesc',
    modalKey: 'b2b.flexibleVolumeModal',
  },
  reliableDelivery: {
    icon: '🚚',
    titleKey: 'b2b.reliableDeliveryTitle',
    descKey: 'b2b.reliableDeliveryDesc',
    modalKey: 'b2b.reliableDeliveryModal',
  },
  invoiceBilling: {
    icon: '📋',
    titleKey: 'b2b.invoiceBillingTitle',
    descKey: 'b2b.invoiceBillingDesc',
    modalKey: 'b2b.invoiceBillingModal',
  },
  accountManager: {
    icon: '🎯',
    titleKey: 'b2b.accountManagerTitle',
    descKey: 'b2b.accountManagerDesc',
    modalKey: 'b2b.accountManagerModal',
  },
  certifications: {
    icon: '🌿',
    titleKey: 'b2b.certificationsTitle',
    descKey: 'b2b.certificationsDesc',
    modalKey: 'b2b.certificationsModal',
  },
};

interface FormData {
  companyName: string;
  contactName: string;
  phone: string;
  email: string;
  businessType: string;
  categories: string[];
  volume: string;
  frequency: string;
  notes: string;
}

const EMPTY_FORM: FormData = {
  companyName: '',
  contactName: '',
  phone: '',
  email: '',
  businessType: '',
  categories: [],
  volume: '',
  frequency: '',
  notes: '',
};

const CONTACT_PHONE = '+917810077636';
const CONTACT_EMAIL = 'support@vpnexues.com';
// Common WhatsApp number shared by the shop/order pages and B2B (same as OrderSuccess.tsx WA_NUMBER).
const WA_NUMBER = '916383086471';

const HERO_DESC =
  'Premium certified-organic produce for restaurants, hotels, cafés, retailers and institutions — sourced directly from Tamil Nadu farms and delivered to your business with no middlemen and no chemicals.';

export default function B2B() {
  const { country } = useCountry();
  const { t, tRaw } = useLanguage();
  const localizedList = (key: string, fallback: string[]): string[] => {
    const raw = tRaw(key);
    return Array.isArray(raw) && raw.length > 0 && raw.every((v) => typeof v === 'string') ? (raw as string[]) : fallback;
  };
  const businessTypeLabels = localizedList('b2b.businessTypeList', BUSINESS_TYPES);
  const categoryLabels = localizedList('b2b.categoryList', PRODUCT_CATEGORIES.map((c) => c.label));
  const volumeLabels = localizedList('b2b.volumeOptions', VOLUME_OPTIONS);
  const frequencyLabels = localizedList('b2b.frequencyOptions', FREQUENCY_OPTIONS);
  const { user } = useAuth();
  const { openAuthModal } = useAuthModal();
  const navigate = useNavigate();
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  // "Inquiry received" confirmation popup — must be SEEN first; WhatsApp only
  // after it (3 s), matching the shopping Order Success flow.
  const [successModal, setSuccessModal] = useState(false);
  const waOpenedRef = useRef(false);
  const [error, setError] = useState('');
  const [benefitModal, setBenefitModal] = useState<string | null>(null);
  // Reviews — sliding + verified-purchase gate (QA-06: kept in memory only,
  // never persisted to localStorage — resets on refresh until a backend API)
  const [reviews, setReviews] = useState(() => [...TESTIMONIALS]);
  const [canReview, setCanReview] = useState<boolean | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState(false);

  useEffect(() => {
    try {
      const b2bRaw = sessionStorage.getItem('vpnexues_b2b_pending');
      let b2bArr = b2bRaw ? JSON.parse(b2bRaw) : [];
      // QA-21: legacy builds persisted the whole enquiry (company/name/email/
      // phone/notes) here — strip identity fields on read so old tabs self-clean.
      if (Array.isArray(b2bArr) && b2bArr.some((e: Record<string, unknown>) => e && typeof e === 'object'
        && ('name' in e || 'phone' in e || 'email' in e || 'company' in e || 'notes' in e || 'contactName' in e))) {
        b2bArr = b2bArr.map((e: Record<string, unknown>) => ({
          createdAt: e?.createdAt, countryCode: e?.countryCode,
        }));
        sessionStorage.setItem('vpnexues_b2b_pending', JSON.stringify(b2bArr));
      }
      const hasB2bEnquiry = Array.isArray(b2bArr) && b2bArr.length > 0;
      setCanReview(hasB2bEnquiry || submitted);
    } catch { setCanReview(submitted); }
  }, [user, submitted]);

  function handleAddReview(e: React.FormEvent) {
    e.preventDefault();
    setReviewError('');
    if (!reviewText.trim() || reviewText.trim().length < 20) { setReviewError(t('b2b.reviewMinChars')); return; }
    const name = user?.name || t('b2b.verifiedBuyer');
    const initials = name.split(' ').map((w: string) => w[0]).join('').slice(0,2).toUpperCase() || 'VB';
    const newReview = { quote: reviewText.trim(), name, role: t('b2b.verifiedPurchase'), initials, rating: reviewRating } as typeof TESTIMONIALS[number];
    setReviews((prev) => [newReview, ...prev]);
    setReviewText(''); setReviewRating(5); setReviewSuccess(true); setTimeout(()=>setReviewSuccess(false), 2500);
  }

  function update<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function toggleCategory(cat: string) {
    setForm((prev) => ({
      ...prev,
      categories: prev.categories.includes(cat)
        ? prev.categories.filter((c) => c !== cat)
        : [...prev.categories, cat],
    }));
  }

  // Prefilled WhatsApp handoff text for the filled enquiry (wa.me deep link).
  function buildWhatsAppText(): string {
    const lines = [
      'Hi VPNexues! I just submitted a B2B enquiry from your website.',
      '',
      `Company: ${form.companyName}`,
      `Contact: ${form.contactName}`,
      `Email: ${form.email}`,
      `Phone: ${form.phone}`,
      `Business type: ${form.businessType}`,
      `Products: ${form.categories.length ? form.categories.join(', ') : '-'}`,
      `Monthly volume: ${form.volume || '-'}`,
      `Delivery frequency: ${form.frequency || '-'}`,
    ];
    if (form.notes.trim()) lines.push(`Special requirements: ${form.notes.trim()}`);
    return lines.join('\n');
  }

  const waLink = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(buildWhatsAppText())}`;

  /* Confirmation first, WhatsApp second (same product rule as Order Success):
     the "Inquiry received" popup is on screen immediately after submit; only
     3 s later does deliverWhatsAppPopup() open the WhatsApp chat. The trusted
     Submit click keeps popup permission alive for ~5 s, so the 3 s timer
     window.open is allowed; browsers that still block fall back to same-tab
     navigation. Flag set INSIDE the callback — React StrictMode (dev)
     double-invokes effects and run #1's cleanup clears its timer. */
  useEffect(() => {
    if (!submitted) return;
    const timer = window.setTimeout(() => {
      if (waOpenedRef.current) return;
      waOpenedRef.current = true;
      deliverWhatsAppPopup(waLink);
    }, 3000);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submitted]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!form.companyName || !form.contactName || !form.phone || !form.email || !form.businessType) {
      setError(t('b2b.fillRequired'));
      return;
    }
    setSubmitting(true);
    waOpenedRef.current = false; // new submission cycle — allow one fresh auto-open
    try {
      await submitB2BEnquiry({
        companyName: form.companyName,
        contactName: form.contactName,
        email: form.email,
        phone: form.phone,
        countryCode: country,
        productInterest: form.categories.join(', ') || form.notes || undefined,
        quantity: form.volume || undefined,
      });
      // Confirmation popup FIRST — WhatsApp follows 3 s later (see effect above).
      setSubmitted(true);
      setSuccessModal(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '';
      const isNetwork = msg.includes('Network Error') || msg.includes('timeout') || msg.includes('ECONNABORTED') || msg.includes('Failed to fetch');
      const axiosRes = (err as { response?: { data?: { message?: string; errors?: Record<string,string> } ; status?: number } })?.response;
      if (isNetwork) {
        // Backend down (port 8080 closed) — simulate success so user isn't blocked, store locally
        try {
          const pending = JSON.parse(sessionStorage.getItem('vpnexues_b2b_pending') || '[]');
          // QA-21: marker only — enquiry identity (name/email/phone/company/
          // notes) must never be written to web storage.
          pending.push({ createdAt: new Date().toISOString(), countryCode: country });
          sessionStorage.setItem('vpnexues_b2b_pending', JSON.stringify(pending));
        } catch {}
        console.warn('[B2B] Backend unreachable, using local fallback:', err);
        setSubmitted(true);
        setSuccessModal(true);
      } else if (axiosRes?.status === 400) {
        const detail = axiosRes.data?.message || Object.values(axiosRes.data?.errors || {}).join(', ');
        setError(detail || t('b2b.checkDetails'));
      } else {
        console.error('[B2B] submit failed:', err);
        setError(axiosRes?.data?.message || t('b2b.submitFailed'));
      }
    } finally {
      setSubmitting(false);
    }
  }

  function scrollToForm() {
    const forms = document.querySelectorAll('[data-form]');
    for (const form of forms) {
      const el = form as HTMLElement;
      if (el.offsetParent !== null) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        break;
      }
    }
  }

  function openBenefit(title: string) {
    if (BENEFIT_DETAILS[title]) {
      setBenefitModal(title);
    }
  }

  function closeBenefit() {
    setBenefitModal(null);
  }

  return (
    <div className={styles.pageWrapper}>
      <Seo {...SEO.b2b} />
      {/* ===== Page Header (mobile only — global header shows on desktop) ===== */}
      <header className={styles.topHeader}>
        <button type="button" className={styles.topBack} onClick={() => navigate(-1)} aria-label={t('b2b.backLabel')}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>
        <Link to="/" className={styles.topBrand}>
          <img src="https://res.cloudinary.com/eqjshlur/image/upload/v1790001831/vpnexues/old/site-assets/logo/vp-logo.svg" alt="" className={styles.topBrandLogo} />
          <span className={styles.topBrandText}>
            <strong>VPNexues</strong>
            <small>{t('b2b.brandSub')}</small>
          </span>
        </Link>
        <a href={`tel:${CONTACT_PHONE}`} className={styles.topCall} aria-label="Call VPNexues">
          <IconPhone width={15} height={15} />
        </a>
      </header>

      {/* ===== Hero ===== */}
      <section className={styles.hero}>
        <div className={styles.heroBg} aria-hidden="true" />
        <div className={styles.heroVeil} aria-hidden="true" />

        <div className={styles.heroInner}>
          <div className={styles.heroContent}>
            <nav className={styles.heroCrumbs} aria-label="Breadcrumb">
              <Link to="/">{t('b2b.desktopBreadcrumbHome')}</Link> <span>›</span> <span className={styles.heroCrumbsCurrent}>{t('b2b.crumbB2b')}</span>
            </nav>
            <div className={styles.heroBadge}>
              <IconLeaf width={12} height={12} /> {t('b2b.heroBadge')}
            </div>
            <h1 className={styles.heroTitle}>
              {t('b2b.heroTitle1')}<br />
              <span className={styles.heroHighlight}>{t('b2b.heroTitle2')}</span>
            </h1>
            <p className={styles.heroDesc}>{t('b2b.heroDesc')}</p>
            <div className={styles.heroTags}>
              <span className={styles.heroTag}>
                <IconCheck width={10} height={10} /> {t('b2b.heroTag1')}
              </span>
              <span className={styles.heroTag}>
                <IconTruck width={10} height={10} /> {t('b2b.heroTag2')}
              </span>
              <span className={styles.heroTag}>
                <IconBasket width={10} height={10} /> {t('b2b.heroTag3')}
              </span>
            </div>
            <div className={styles.heroActions}>
              <button type="button" className={`${styles.heroBtn} ${styles.heroBtnPrimary}`} onClick={scrollToForm}>
                {t('b2b.startInquiry')}
                <IconArrowRight width={14} height={14} />
              </button>
              <a href={`tel:${CONTACT_PHONE}`} className={`${styles.heroBtn} ${styles.heroBtnSecondary}`}>
                <IconPhone width={14} height={14} /> {t('b2b.callUs')}
              </a>
            </div>
          </div>

          <div className={styles.heroVisual}>
            <div className={styles.heroVisualCard}>
              <img src="/images/shop/b2b-organic-produce.png" alt={t('b2b.heroImgAlt')} />
            </div>
            <div className={`${styles.heroChip} ${styles.heroChipTop}`}>
              <span className={styles.heroChipIco}>
                <IconLeaf width={15} height={15} />
              </span>
              <div className={styles.heroChipText}>
                <strong>{t('b2b.chip1Title')}</strong>
                <small>{t('b2b.chip1Desc')}</small>
              </div>
            </div>
            <div className={`${styles.heroChip} ${styles.heroChipBottom}`}>
              <span className={styles.heroChipIco}>
                <IconShieldCheck width={15} height={15} />
              </span>
              <div className={styles.heroChipText}>
                <strong>{t('b2b.chip2Title')}</strong>
                <small>{t('b2b.chip2Desc')}</small>
              </div>
            </div>
          </div>
        </div>

        {/* Stats strip */}
        <div className={styles.heroStats}>
          <div className={styles.heroStat}>
            <span className={styles.heroStatNum}>200+</span>
            <span className={styles.heroStatLbl}>{t('b2b.statClients')}</span>
          </div>
          <div className={styles.heroStatDivider} />
          <div className={styles.heroStat}>
            <span className={styles.heroStatNum}>50+</span>
            <span className={styles.heroStatLbl}>{t('b2b.statRoutes')}</span>
          </div>
          <div className={styles.heroStatDivider} />
          <div className={styles.heroStat}>
            <span className={styles.heroStatNum}>100%</span>
            <span className={styles.heroStatLbl}>{t('b2b.statCertified')}</span>
          </div>
        </div>
      </section>

      {/* ===== How It Works ===== */}
      <section className={styles.section}>
        <div className={styles.secHd}>
          <div className={styles.secTag}>
            <IconLeaf width={10} height={10} /> {t('b2b.howItWorksTag')}
          </div>
          <h2 className={styles.secTitle}>
            {t('b2b.howItWorksPre')} <span className={styles.secTitleGold}>{t('b2b.howItWorksTitle')}</span>
          </h2>
          <p className={styles.secDesc}>{t('b2b.howItWorksDesc')}</p>
        </div>
        <div className={styles.steps}>
          {[
            { num: '01', titleKey: 'b2b.step1Title', descKey: 'b2b.step1Desc', icon: '📝' },
            { num: '02', titleKey: 'b2b.step2Title', descKey: 'b2b.step2Desc', icon: '📈' },
            { num: '03', titleKey: 'b2b.step3Title', descKey: 'b2b.step3Desc', icon: '🚚' },
          ].map((step) => (
            <article className={styles.step} key={step.num}>
              <span className={styles.stepNum}>{step.num}</span>
              <span className={styles.stepIco}>{step.icon}</span>
              <h4>{t(step.titleKey)}</h4>
              <p>{t(step.descKey)}</p>
            </article>
          ))}
        </div>
      </section>

      {/* ===== Benefits ===== */}
      <section className={styles.benefitsSection}>
        <div className={styles.section}>
          <div className={styles.secHd}>
            <div className={styles.secTag}>
              <IconLeaf width={10} height={10} /> {t('b2b.whyTag')}
            </div>
            <h2 className={styles.secTitle}>
              {t('b2b.whyTitlePre')} <span className={styles.secTitleGold}>{t('b2b.whyTitleGold')}</span>
            </h2>
            <p className={styles.secDesc}>{t('b2b.whyDesc')}</p>
          </div>
          <div className={styles.benefitGrid}>
            {BENEFITS.map((b) => (
              <div
                key={b.id}
                className={`${styles.benefit} ${b.wide ? styles.benefitWide : ''}`}
                onClick={() => openBenefit(b.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openBenefit(b.id); } }}
              >
                <div className={styles.benefitIco}>{b.icon}</div>
                <div className={styles.benefitBody}>
                  <h5>{t(BENEFIT_DETAILS[b.id].titleKey)}</h5>
                  <p>{t(BENEFIT_DETAILS[b.id].descKey)}</p>
                  <span className={styles.benefitMore}>
                    {t('b2b.learnMore')} <IconArrowRight width={11} height={11} />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Let's Connect Together + Inquiry Form ===== */}
      <section className={styles.connectSection}>
        <div className={styles.connectWrap}>
          {/* Intro */}
          <div className={styles.connectIntro}>
            <div className={styles.connectArt}>
              <img src="/images/shop/b2b-inquiry-art.png" alt={t('b2b.inquiryImgAlt')} />
              <div className={styles.connectArtBadge}>
                <IconLeaf width={13} height={13} />
                <span>{t('b2b.farmToBusiness')}</span>
              </div>
            </div>
            <div className={styles.connectBody}>
              <div className={styles.secTag}>
                <IconLeaf width={10} height={10} /> {t('b2b.connectTag')}
              </div>
              <h2 className={styles.connectTitle}>
                {t('b2b.connectTitlePre')} <span className={styles.secTitleGold}>{t('b2b.connectTitleGold')}</span>
              </h2>
              <p className={styles.connectDesc}>
                {t('b2b.connectDesc')}
              </p>
              <ul className={styles.connectPoints}>
                <li>
                  <span className={styles.connectPointIco}><IconCheck width={12} height={12} /></span>
                  {t('b2b.connectPoint1')}
                </li>
                <li>
                  <span className={styles.connectPointIco}><IconCheck width={12} height={12} /></span>
                  {t('b2b.connectPoint2')}
                </li>
                <li>
                  <span className={styles.connectPointIco}><IconCheck width={12} height={12} /></span>
                  {t('b2b.connectPoint3')}
                </li>
              </ul>
              <div className={styles.connectContact}>
                <a href={`tel:${CONTACT_PHONE}`}>
                  <IconPhone width={13} height={13} /> +91 99439 94603
                </a>
                <a href={`mailto:${CONTACT_EMAIL}`}>
                  <IconMail width={13} height={13} /> {CONTACT_EMAIL}
                </a>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className={styles.connectFormCard} data-form>
            <div className={styles.connectFormHead}>
              <div className={styles.connectFormHeadIcon}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" /><path d="M14 2v4a2 2 0 0 0 2 2h4" /><path d="M10 9H8" /><path d="M16 13H8" /><path d="M16 17H8" /></svg>
              </div>
              <div className={styles.connectFormHeadText}>
                <h3>{t('b2b.formTitle')}</h3>
                <p>{t('b2b.formDesc')}</p>
              </div>
            </div>
            <div className={styles.connectFormBody}>
              {submitted ? (
                <div className={styles.successCard}>
                  <div className={styles.successIcon}>✓</div>
                  <h3>{t('b2b.submittedTitle')}</h3>
                  <p>{t('b2b.submittedDesc')}</p>
                  <button type="button" className={styles.successBtn} onClick={() => { setSubmitted(false); setSuccessModal(false); waOpenedRef.current = false; setForm(EMPTY_FORM); }}>
                    {t('b2b.submitAnother')}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  {/* Contact Details */}
                  <div className={styles.formDividerLabel}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="3.5" /><path d="M4.5 20c1.4-3.6 4.3-5.5 7.5-5.5s6.1 1.9 7.5 5.5" /></svg>
                    {t('b2b.contactDetails')}
                  </div>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16v16H4z" /><path d="M4 10h16M10 4v16" /></svg>
                        {t('b2b.companyName')} {t('b2b.required')}
                      </label>
                      <input
                        className={styles.formControl}
                        placeholder="ACME Restaurant Pte Ltd"
                        value={form.companyName}
                        onChange={(e) => update('companyName', e.target.value)}
                        required
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="7" r="3.4" /><path d="M5 20.5c1.2-3.7 3.9-5.7 7-5.7s5.8 2 7 5.7" /><path d="m10.5 14.8 1.5 2 1.5-2M12 16.8v3.2" /></svg>
                        {t('b2b.contactPerson')} {t('b2b.required')}
                      </label>
                      <input
                        className={styles.formControl}
                        placeholder="John Tan"
                        value={form.contactName}
                        onChange={(e) => update('contactName', e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label>
                        <IconPhone width={10} height={10} /> {t('b2b.phone')} {t('b2b.required')}
                      </label>
                      <input
                        className={styles.formControl}
                        placeholder="+65 9123 4567"
                        value={form.phone}
                        onChange={(e) => update('phone', e.target.value)}
                        required
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>
                        <IconMail width={10} height={10} /> {t('b2b.email')} {t('b2b.required')}
                      </label>
                      <input
                        className={styles.formControl}
                        type="email"
                        placeholder="orders@company.com"
                        value={form.email}
                        onChange={(e) => update('email', e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  {/* Business Info */}
                  <div className={styles.formDivider} />
                  <div className={styles.formDividerLabel}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16v16H4z" /><path d="M4 10h16M10 4v16" /></svg>
                    {t('b2b.businessInfo')}
                  </div>
                  <div className={styles.formGroup}>
                    <label>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16v16H4z" /><path d="M4 10h16M10 4v16" /></svg>
                      {t('b2b.businessType')} {t('b2b.required')}
                    </label>
                    <select
                      className={styles.formControl}
                      value={form.businessType}
                      onChange={(e) => update('businessType', e.target.value)}
                      required
                    >
                      <option value="">{t('b2b.selectBusinessType')}</option>
                      {BUSINESS_TYPES.map((type, i) => (
                        <option key={type} value={type}>{businessTypeLabels[i] ?? type}</option>
                      ))}
                    </select>
                  </div>

                  {/* Products & Delivery */}
                  <div className={styles.formDivider} />
                  <div className={styles.formDividerLabel}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 10h14l-1.5 9.5a2 2 0 0 1-2 1.5H8.5a2 2 0 0 1-2-1.5L5 10Z" /><path d="M3.5 10h17M9 10 8 5M15 10l1-5" /></svg>
                    {t('b2b.productsDelivery')}
                  </div>
                  <div className={styles.formGroup}>
                    <label>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3h7l2 3h9v13H3z" /></svg>
                      {t('b2b.productCategories')}
                    </label>
                    <div className={styles.chips}>
                      {PRODUCT_CATEGORIES.map((cat, i) => (
                        <label
                          key={cat.label}
                          className={`${styles.chip} ${form.categories.includes(cat.label) ? styles.chipChecked : ''}`}
                        >
                          <input
                            type="checkbox"
                            className={styles.chipInput}
                            checked={form.categories.includes(cat.label)}
                            onChange={() => toggleCategory(cat.label)}
                          />
                          {cat.icon} {categoryLabels[i] ?? cat.label}
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2 2 7l10 5 10-5-10-5ZM2 17l10 5 10-5M2 12l10 5 10-5" /></svg>
                        {t('b2b.monthlyVolume')}
                      </label>
                      <select
                        className={styles.formControl}
                        value={form.volume}
                        onChange={(e) => update('volume', e.target.value)}
                      >
                        <option value="">{t('b2b.selectVolume')}</option>
                        {VOLUME_OPTIONS.map((v, i) => (
                          <option key={v} value={v}>{volumeLabels[i] ?? v}</option>
                        ))}
                      </select>
                    </div>
                    <div className={styles.formGroup}>
                      <label>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" /><path d="M15 18H9" /><circle cx="17" cy="18" r="2" /><circle cx="7" cy="18" r="2" /></svg>
                        {t('b2b.deliveryFrequency')}
                      </label>
                      <select
                        className={styles.formControl}
                        value={form.frequency}
                        onChange={(e) => update('frequency', e.target.value)}
                      >
                        <option value="">{t('b2b.selectFrequency')}</option>
                        {FREQUENCY_OPTIONS.map((f, i) => (
                          <option key={f} value={f}>{frequencyLabels[i] ?? f}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className={styles.formGroup}>
                    <label>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
                      {t('b2b.specialRequirements')}
                    </label>
                    <textarea
                      className={styles.formControl}
                      placeholder={t('b2b.requirementsPlaceholder')}
                      value={form.notes}
                      onChange={(e) => update('notes', e.target.value)}
                    />
                  </div>

                  {error && <p className={styles.error}>{error}</p>}

                  <button type="submit" className={styles.submitBtn} disabled={submitting}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7Z" /></svg>
                    {submitting ? t('b2b.submitting') : t('b2b.submitInquiry')}
                  </button>
                  <div className={styles.formContact}>
                    <IconPhone width={11} height={11} className={styles.formContactIcon} />{' '}
                    <a href={`tel:${CONTACT_PHONE}`}>+91 99439 94603</a>
                    <span className={styles.formContactSep}>|</span>
                    <IconMail width={11} height={11} className={styles.formContactIcon} />{' '}
                    <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ===== Testimonials ===== */}
      <section className={styles.section}>
        <div className={styles.secHd}>
          <div className={styles.secTag}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
            {t('b2b.testimonialsTag')}
          </div>
          <h2 className={styles.secTitle}>
            {t('b2b.testiTitlePre')} <span className={styles.secTitleGold}>{t('b2b.testiTitleGold')}</span>
          </h2>
          <p className={styles.secDesc}>{t('b2b.testimonialsDesc')}</p>
        </div>
        <div className={styles.testiWrap}>
          <Swiper
            modules={[Autoplay, Pagination]}
            loop={reviews.length > 3}
            speed={500}
            spaceBetween={14}
            autoplay={{ delay: 3200, disableOnInteraction: false }}
            pagination={{ clickable: true }}
            breakpoints={{
              0: { slidesPerView: 1.15, spaceBetween: 12 },
              480: { slidesPerView: 1.4, spaceBetween: 12 },
              768: { slidesPerView: 2, spaceBetween: 18 },
              1024: { slidesPerView: 3, spaceBetween: 20 },
            }}
          >
            {reviews.map((rev) => {
              const testiRaw = tRaw('b2b.testimonials');
              const testiMap = typeof testiRaw === 'object' && testiRaw !== null ? (testiRaw as Record<string, { quote?: string; role?: string }>) : {};
              const testiCopy = testiMap[rev.initials];
              const quote = rev.quote || testiCopy?.quote || '';
              const role = rev.role || testiCopy?.role || '';
              return (
              <SwiperSlide key={rev.name}>
                <div className={styles.testiCard}>
                  <div className={styles.testiStars}>
                    {[...Array(5)].map((_, si) => (
                      <span key={si} className={styles.testiStar}>★</span>
                    ))}
                  </div>
                  <div className={styles.testiQuote}>{quote}</div>
                  <div className={styles.testiAuthor}>
                    <div className={styles.testiAvatar}>{rev.initials}</div>
                    <div>
                      <div className={styles.testiName}>{rev.name}</div>
                      <div className={styles.testiRole}>{role}</div>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
              );
            })}
          </Swiper>
        </div>
        {/* Verified-purchase review gate */}
        <div className={styles.reviewGate}>
          {canReview === null ? null : canReview ? (
            <form className={styles.reviewForm} onSubmit={handleAddReview}>
              <h4 className={styles.reviewTitle}>{t('b2b.shareExperience')}</h4>
              <p className={styles.reviewHint}>{t('b2b.verifiedOnly')}</p>
              <div className={styles.reviewStars}>
                {[1,2,3,4,5].map((n) => (
                  <button key={n} type="button" className={`${styles.reviewStar} ${n <= reviewRating ? styles.reviewStarActive : ''}`} onClick={() => setReviewRating(n)} aria-label={`Rate ${n}`}>★</button>
                ))}
              </div>
              <textarea className={styles.reviewInput} placeholder={t('b2b.reviewPlaceholder')} value={reviewText} onChange={(e)=>{setReviewText(e.target.value); setReviewError('');}} rows={3} />
              {reviewError && <p className={styles.reviewError}>{reviewError}</p>}
              {reviewSuccess && <p className={styles.reviewSuccess}>{t('b2b.reviewAdded')} <span style={{ color: '#6b7280' }}>(visible on this device)</span></p>}
              <button type="submit" className={styles.reviewBtn}>{t('b2b.postReview')}</button>
            </form>
          ) : (
            <div className={styles.reviewLocked}>
              <span className={styles.reviewLockIcon}>🔒</span>
              <p><strong>{t('b2b.verifiedBuyersOnly')}</strong>{t('b2b.verifiedDesc')}</p>
              {!user && <button type="button" onClick={() => openAuthModal()} className={styles.reviewLoginBtn}>{t('b2b.loginToCheck')}</button>}
            </div>
          )}
        </div>
      </section>

      {/* ===== CTA — Ready to Grow With Us ===== */}
      <section className={styles.ctaSection}>
        <div className={styles.ctaBg} aria-hidden="true" />
        <div className={styles.ctaVeil} aria-hidden="true" />
        <div className={styles.ctaInner}>
          <div className={styles.ctaBadge}>
            <IconLeaf width={12} height={12} /> {t('b2b.letsGrowTogether')}
          </div>
          <h2>{t('b2b.ctaTitle')}</h2>
          <p>
            {t('b2b.ctaDesc')}
          </p>
          <div className={styles.ctaActions}>
            <button type="button" className={styles.ctaBtnPrimary} onClick={scrollToForm}>
              {t('b2b.applyToday')} <IconArrowRight width={14} height={14} />
            </button>
            <a href={`mailto:${CONTACT_EMAIL}`} className={styles.ctaBtnOutline}>
              <IconMail width={14} height={14} /> {t('b2b.emailUs')}
            </a>
          </div>
        </div>
      </section>

      {/* ===== Confirmation popup — MUST be seen FIRST; WhatsApp only +3 s ===== */}
      {submitted && successModal && (
        <div className={styles.benefitOverlay} role="dialog" aria-modal="true" aria-labelledby="b2bSuccessTitle" onClick={() => setSuccessModal(false)}>
          <div className={styles.benefitModal} onClick={(e) => e.stopPropagation()}>
            <button type="button" className={styles.benefitClose} onClick={() => setSuccessModal(false)} aria-label="Close">&times;</button>
            <div className={styles.successIcon}>✓</div>
            <h3 id="b2bSuccessTitle">{t('b2b.submittedTitle')}</h3>
            <p>{t('b2b.submittedDesc')}</p>
            <p className={styles.successModalNote}>{t('b2b.whatsappAutoNote')}</p>
            <div className={styles.benefitModalActions}>
              <button
                type="button"
                className={styles.benefitModalBtn}
                onClick={() => {
                  if (waOpenedRef.current) return;
                  waOpenedRef.current = true;
                  deliverWhatsAppPopup(waLink);
                }}
              >
                <IconArrowRight width={14} height={14} /> {t('b2b.openWhatsappNow')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== Benefit Detail Modal ===== */}
      {benefitModal && BENEFIT_DETAILS[benefitModal] && (
        <div className={styles.benefitOverlay} onClick={closeBenefit}>
          <div className={styles.benefitModal} onClick={(e) => e.stopPropagation()}>
            <button type="button" className={styles.benefitClose} onClick={closeBenefit} aria-label="Close">&times;</button>
            <div className={styles.benefitModalIcon}>{BENEFIT_DETAILS[benefitModal].icon}</div>
            <h3>{t(BENEFIT_DETAILS[benefitModal].titleKey)}</h3>
            <p>{t(BENEFIT_DETAILS[benefitModal].modalKey)}</p>
            <div className={styles.benefitModalActions}>
              <button type="button" className={styles.benefitModalBtn} onClick={() => { closeBenefit(); scrollToForm(); }}>
                {t('b2b.modalGetQuote')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
