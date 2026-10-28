import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../i18n/LanguageContext';
import { useCountry } from '../../context/CountryContext';
import { submitContactMessage } from '../../api/contactApi';
import { flagSrc } from '../../utils/flags';
import styles from './css/Contact.module.css';
import Reveal from '../../components/common/Reveal';

function IconHeadset(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
      <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
    </svg>
  );
}

function IconBookOpen(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  );
}

function IconQuestionCircle(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <path d="M12 17h.01" />
    </svg>
  );
}

function IconTicket(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
      <path d="M13 5v2" /><path d="M13 17v2" /><path d="M13 11v2" />
    </svg>
  );
}

function IconChevronDown(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function IconCommentDots(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      <path d="M8 10h.01" /><path d="M12 10h.01" /><path d="M16 10h.01" />
    </svg>
  );
}

function IconWhatsApp(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function IconPhone(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

function IconEnvelope(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

function IconShieldCheck(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function IconPin(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function IconClock(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  );
}

function IconGlobe(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10Z" />
    </svg>
  );
}

function IconArrowRight(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}

function IconBag(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
      <path d="M3 6h18" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  );
}

function IconEdit(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}

function IconTruck(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M1 3h15v13H1z" />
      <path d="M16 8h4l3 3v5h-7V8z" />
      <circle cx="5.5" cy="18.5" r="2.5" />
      <circle cx="18.5" cy="18.5" r="2.5" />
    </svg>
  );
}

function IconCard(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="1" y="4" width="22" height="16" rx="2" />
      <path d="M1 10h22" />
    </svg>
  );
}

function IconRefresh(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M1 4v6h6" />
      <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
    </svg>
  );
}

/* Decorative icon per step / info card — purely visual, copy is untouched */
const STEP_ICONS = [IconBag, IconPin, IconEdit];
const INFO_ICONS = [IconTruck, IconCard, IconRefresh];

/* ── Data ── */

type InfoCard = { title: string; body: string };
type HowStep = { title: string; body: string };

/** Renders a heading with its final word accented (italic) — the text itself is unchanged. */
function AccentTail({ text }: { text: string }) {
  const cut = text.lastIndexOf(' ');
  if (cut < 1) return <>{text}</>;
  return (
    <>
      {text.slice(0, cut)}
      <em>{text.slice(cut)}</em>
    </>
  );
}

/** Step titles ship from i18n as "1. Place your order" — the number is now shown as a
 *  prominent visual step badge, so the literal prefix is stripped from the display text only. */
function stripStepNumber(title: string) {
  return title.replace(/^\s*\d+\s*[.):-]?\s*/, '');
}

/* ── Global presence data ── */
type GPOffice = {
  cityKey: string;
  addressKey: string;
  badge: 'hq' | 'branch';
  photo: string;
};
type GPCountry = {
  id: string;
  flag: string;
  nameKey: string;
  status: 'live' | 'upcoming' | 'soon';
  offices: GPOffice[];
};

const GP_COUNTRIES: GPCountry[] = [
  { id: 'in', flag: 'in', nameKey: 'country.IN', status: 'live', offices: [
      { cityKey: 'common.citySalem', addressKey: 'contact.inOffice', badge: 'branch', photo: '/images/banners/page-banner-about.webp' },
      { cityKey: 'common.cityTirupattur', addressKey: 'contact.tpOffice', badge: 'hq', photo: '/images/news/news-export.jpg' },
  ]},
  { id: 'sg', flag: 'sg', nameKey: 'country.SG', status: 'live', offices: [
      { cityKey: 'common.citySingapore', addressKey: 'contact.sgOffice', badge: 'branch', photo: '/images/banners/shop-banner.jpg' },
  ]},
  { id: 'lk', flag: 'lk', nameKey: 'country.LK', status: 'upcoming', offices: [] },
  { id: 'au', flag: 'au', nameKey: 'country.AU', status: 'soon', offices: [] },
  { id: 'my', flag: 'my', nameKey: 'country.MY', status: 'soon', offices: [] },
];

/* Pin data for the world map (lon/lat -> viewBox percentages) */
const GP_PINS = [
  { id: 'in', lon: 79, lat: 23, nameKey: 'country.IN', labelSide: 'top' as const, upcoming: false },
  { id: 'lk', lon: 81, lat: 7, nameKey: 'country.LK', labelSide: 'left' as const, upcoming: true },
  { id: 'sg', lon: 104, lat: 1, nameKey: 'country.SG', labelSide: 'bottom' as const, upcoming: false },
  { id: 'my', lon: 101.5, lat: 12, nameKey: 'country.MY', labelSide: 'right' as const, upcoming: true },
  { id: 'au', lon: 134, lat: -25, nameKey: 'country.AU', labelSide: 'left' as const, upcoming: true },
];

export default function Contact() {
  const { t, tRaw } = useLanguage();
  const { country } = useCountry();

  // Contact form state (no browser persistence — identity-related)
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formSubject, setFormSubject] = useState('');
  const [formMessage, setFormMessage] = useState('');
  const [formStatus, setFormStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [sentSummary, setSentSummary] = useState<{ name: string; email: string; subject: string } | null>(null);
  const sentHeadingRef = useRef<HTMLHeadingElement>(null);

  const [activeCountryId, setActiveCountryId] = useState('in');
  const activeCountry = GP_COUNTRIES.find(c => c.id === activeCountryId) || GP_COUNTRIES[0];

  const rawSteps = tRaw('contact.howSteps');
  const HOW_STEPS: HowStep[] = Array.isArray(rawSteps) ? (rawSteps as HowStep[]) : [];
  const rawInfo = tRaw('contact.infoCards');
  const INFO_CARDS: InfoCard[] = Array.isArray(rawInfo) ? (rawInfo as InfoCard[]) : [];

  const QUICK_TILES = [
    { icon: <IconBookOpen width={16} height={16} />, title: t('contact.helpCenter'), sub: t('contact.findAnswers'), to: '/faq' },
    { icon: <IconHeadset width={16} height={16} />, title: t('contact.contactUs'), sub: t('contact.reachTeam'), href: 'tel:+917810077636' },
    { icon: <IconQuestionCircle width={16} height={16} />, title: t('contact.faqs'), sub: t('contact.commonQuestions'), to: '/faq' },
    { icon: <IconTicket width={16} height={16} />, title: t('contact.submitTicket'), sub: t('contact.wereHere'), href: 'mailto:support@vpnexues.com' },
  ];

  const HELP_CARDS = [
    { icon: <IconCommentDots width={18} height={18} />, title: t('contact.liveChat'), sub: t('contact.chatWithUs'), action: 'chat' as const },
    { icon: <IconWhatsApp width={18} height={18} />, title: t('contact.whatsapp'), sub: t('contact.messageUs'), href: 'https://wa.me/917810077636' },
    { icon: <IconPhone width={18} height={18} />, title: t('contact.callUs'), sub: t('contact.callUsSub'), href: 'tel:+917810077636' },
    { icon: <IconEnvelope width={18} height={18} />, title: t('contact.emailUs'), sub: t('contact.emailSupport'), action: 'email' as const },
  ];

  /** Typing after a success returns the send button to its idle state. */
  function handleField(setter: (v: string) => void, value: string) {
    setter(value);
    if (formStatus === 'success') setFormStatus('idle');
  }

  async function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (formStatus === 'sending') return;
    // Mirror backend limits (CreateContactMessageRequest): trim + cap lengths.
    const name = formName.trim();
    const email = formEmail.trim();
    const phone = formPhone.trim();
    const subject = formSubject.trim();
    const message = formMessage.trim();
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
    const valid =
      name.length > 0 && name.length <= 100 &&
      emailOk && email.length <= 255 &&
      phone.length <= 30 &&
      subject.length > 0 && subject.length <= 200 &&
      message.length > 0 && message.length <= 5000;
    if (!valid) {
      setFormStatus('error');
      return;
    }
    setFormStatus('sending');
    try {
      await submitContactMessage({
        name,
        email,
        phone: phone || undefined,
        countryCode: country,
        subject,
        message,
      });
      setFormName('');
      setFormEmail('');
      setFormPhone('');
      setFormSubject('');
      setFormMessage('');
      setSentSummary({ name, email, subject });
      setFormStatus('success');
    } catch {
      setFormStatus('error');
    }
  }

  function handleSendAnother() {
    setSentSummary(null);
    setFormStatus('idle');
  }

  useEffect(() => {
    if (formStatus === 'success') {
      sentHeadingRef.current?.focus();
    }
  }, [formStatus]);

  return (
    <div className={styles.contactPage}>
      {/* ── 1. Support Hero ── */}
      <section className={styles.hero}>
        <div className={styles.heroBg} />
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div className={styles.heroInner}>
            <div className={styles.heroIconCircle}>
              <IconHeadset width={26} height={26} color="#fff" />
            </div>
            <h1 className={styles.heroTitle}>{t('contact.heroTitle')}</h1>
            <p className={styles.heroSub}>{t('contact.heroSub')}</p>
          </div>
        </div>
      </section>

      {/* ── 2. Support quick links — one horizontal navigation strip ── */}
      <section className={styles.quickNavSection}>
        <div className="container">
          <Reveal>
            <nav className={styles.quickNav} aria-label={t('contact.helpCenter')}>
              {QUICK_TILES.map((tile) => {
                const content = (
                  <>
                    <span className={styles.quickNavIcon} aria-hidden="true">
                      {tile.icon}
                    </span>
                    <span className={styles.quickNavText}>
                      <strong>{tile.title}</strong>
                      <span>{tile.sub}</span>
                    </span>
                    <IconChevronDown
                      width={13}
                      height={13}
                      className={styles.quickNavArrow}
                      aria-hidden="true"
                    />
                  </>
                );
                return 'to' in tile && tile.to ? (
                  <Link key={tile.title} to={tile.to} className={styles.quickNavItem}>
                    {content}
                  </Link>
                ) : (
                  <a
                    key={tile.title}
                    href={('href' in tile && tile.href) || '#'}
                    className={styles.quickNavItem}
                  >
                    {content}
                  </a>
                );
              })}
            </nav>
          </Reveal>
        </div>
      </section>

      {/* ── 4. How support works — connected three-step process ── */}
      {HOW_STEPS.length > 0 && (
        <section className={styles.stepsSection}>
          <div className="container">
            <Reveal>
              <h2 className={styles.sectionTitle}>{t('contact.howItWorksTitle')}</h2>
              <p className={styles.sectionLead}>{t('contact.howItWorksSub')}</p>
            </Reveal>
            <ol className={styles.stepsFlow}>
              {HOW_STEPS.map((step, i) => {
                const StepIcon = STEP_ICONS[i % STEP_ICONS.length];
                return (
                  <li key={step.title} className={styles.stepItem}>
                    {/* badge sits outside the Reveal wrapper: framer-motion's transform
                        would otherwise become its containing block mid-animation */}
                    <span className={styles.stepNum}>
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <Reveal delay={i * 0.1}>
                      <h3 className={styles.stepTitle}>
                        <StepIcon
                          width={18}
                          height={18}
                          className={styles.stepIcon}
                          aria-hidden="true"
                        />
                        {stripStepNumber(step.title)}
                      </h3>
                      <span className={styles.stepRule} aria-hidden="true" />
                      <p className={styles.stepBody}>{step.body}</p>
                    </Reveal>
                  </li>
                );
              })}
            </ol>
          </div>
        </section>
      )}

      {/* ── 5. Good to know — one unified information band ── */}
      {INFO_CARDS.length > 0 && (
        <section className={styles.infoSection}>
          <div className="container">
            <Reveal>
              <h2 className={styles.sectionTitle}>{t('contact.infoTitle')}</h2>
              <p className={styles.sectionLead}>{t('contact.infoSub')}</p>
            </Reveal>
            <Reveal delay={0.1}>
              <div className={styles.infoBand}>
                {INFO_CARDS.map((c, i) => {
                  const InfoIcon = INFO_ICONS[i % INFO_ICONS.length];
                  return (
                    <div key={c.title} className={styles.infoCol}>
                      <span className={styles.infoAccent} aria-hidden="true" />
                      <span className={styles.infoColIcon} aria-hidden="true">
                        <InfoIcon width={20} height={20} />
                      </span>
                      <h3 className={styles.infoColTitle}>{c.title}</h3>
                      <p className={styles.infoColBody}>{c.body}</p>
                    </div>
                  );
                })}
              </div>
            </Reveal>
          </div>
        </section>
      )}

      {/* ── 6. Need More Help — contact channels in one clean row ── */}
      <section className={styles.helpSection}>
        <div className="container">
          <Reveal>
            <h3 className={styles.helpTitle}>
              <AccentTail text={t('contact.needMoreHelp')} />
            </h3>
            <p className={styles.sectionLead}>{t('contact.helpSub')}</p>
          </Reveal>
          <Reveal delay={0.08}>
            <div className={styles.helpRow}>
              {HELP_CARDS.map((c) => {
                const inner = (
                  <>
                    <span className={styles.helpIcon} aria-hidden="true">
                      {c.icon}
                    </span>
                    <strong className={styles.helpRowTitle}>{c.title}</strong>
                    <span className={styles.helpRowSub}>{c.sub}</span>
                  </>
                );
                return c.action === 'chat' ? (
                  <button
                    key={c.title}
                    type="button"
                    className={styles.helpRowItem}
                    onClick={() => window.dispatchEvent(new CustomEvent('vpnexues:open-chat'))}
                  >
                    {inner}
                  </button>
                ) : c.action === 'email' ? (
                  <a
                    key={c.title}
                    href="https://mail.google.com/mail/u/0/?view=cm&fs=1&tf=1&to=support@vpnexues.com&su=Website Inquiry&body=Hello VPNexues Team,"
                    target="_blank"
                    rel="noreferrer"
                    className={styles.helpRowItem}
                  >
                    {inner}
                  </a>
                ) : (
                  <a
                    key={c.title}
                    href={c.href}
                    target={c.href?.startsWith('https://') ? '_blank' : undefined}
                    rel={c.href?.startsWith('https://') ? 'noopener noreferrer' : undefined}
                    className={styles.helpRowItem}
                  >
                    {inner}
                  </a>
                );
              })}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── 8. B2B teaser ── */}
      <section className={styles.b2bSection}>
        <div className="container">
          <Reveal>
            <div className={styles.b2bBanner}>
              <div>
                <strong className={styles.b2bTitle}><AccentTail text={t('contact.b2bTitle')} /></strong>
                <p className={styles.b2bBody}>{t('contact.b2bBody')}</p>
              </div>
              <div className={styles.b2bActions}>
                <Link to="/pricing/b2b" className={styles.b2bBtn}>
                  {t('contact.b2bCta')}
                </Link>
                <a href="mailto:support@vpnexues.com?subject=B2B%20enquiry" className={styles.b2bBtnSecondary}>
                  {t('contact.b2bMail')}
                </a>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── 9. Global Presence — Visit or Call Us ── */}
      <section className={styles.gpSection}>
        <div className="container">
          <Reveal variant="scale">
            <div className={styles.gpPanel}>
              <div className={styles.gpTop}>
                <div className={styles.gpCopy}>
                  <div className={styles.gpBrand}>
                    <img src="/images/logo/vp-logo.svg" alt="" className={styles.gpBrandLogo} />
                    <span className={styles.gpBrandText}>
                      <strong>VPNexues</strong>
                      <span>Private Limited</span>
                    </span>
                  </div>
                  <span className={styles.gpEyebrow}>
                    <IconGlobe width={13} height={13} />
                    {t('contact.gpEyebrow')}
                  </span>
                  <h3 className={styles.gpTitle}><AccentTail text={t('contact.officesTitle')} /></h3>
                  <p className={styles.gpLead}>{t('contact.gpLead')}</p>
                  <span className={styles.gpHours}>
                    <IconClock width={14} height={14} />
                    {t('contact.officesSub')}
                  </span>
                </div>

                <div className={styles.gpMapWrap} aria-hidden="true">
                  <img src="/images/world-map.svg" alt="" className={styles.gpMapImg} />

                  <svg className={styles.gpRoutes} viewBox="0 0 360 140" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
                    <path d="M259 60 C 276 66, 280 74, 284 83.5" stroke="var(--color-lime)" strokeWidth="0.7" strokeDasharray="3 3" fill="none" opacity="0.5"/>
                    <path d="M259 60 C 259 66, 259 70, 261 75.5" stroke="var(--color-lime)" strokeWidth="0.7" strokeDasharray="3 3" fill="none" opacity="0.5"/>
                    <path d="M284 83.5 C 296 92, 304 100, 314 108" stroke="var(--color-lime)" strokeWidth="0.7" strokeDasharray="3 3" fill="none" opacity="0.5"/>
                    <path d="M259 60 C 270 62, 277 65, 281.5 71" stroke="var(--color-lime)" strokeWidth="0.7" strokeDasharray="3 3" fill="none" opacity="0.5"/>
                  </svg>

                  {GP_PINS.map((pin) => {
                    const x = ((pin.lon + 180) / 360) * 100;
                    const y = ((83 - pin.lat) / 140) * 100;
                    return (
                      <span key={pin.id} className={styles.gpPin} style={{ left: `${x}%`, top: `${y}%` }}>
                        <svg viewBox="0 0 20 24" className={styles.gpPinSvg} aria-hidden="true">
                          <path d="M10 20c0 5-8 8-8 8s-8-3-8-8a8 8 0 0 1 16 0Z" fill="var(--color-lime)" />
                          <circle cx="10" cy="10" r="3.5" fill="var(--color-header-dark)" />
                        </svg>
                        <span className={`${styles.gpPinLabel} ${pin.labelSide === 'left' ? styles.gpPinLabelLeft : pin.labelSide === 'bottom' ? styles.gpPinLabelBottom : pin.labelSide === 'top' ? styles.gpPinLabelTop : ''}`}>
                          {pin.upcoming && <span className={styles.gpPinUpcoming}>{t('contact.gpUpcoming')}</span>}
                          {t(pin.nameKey)}
                        </span>
                      </span>
                    );
                  })}
                </div>
              </div>

              <div className={styles.gpTabs} role="tablist" aria-label={t('contact.gpEyebrow')}>
                {GP_COUNTRIES.map((c) => {
                  const count = c.offices.length;
                  const sub = count > 0
                    ? `${count} ${count === 1 ? t('contact.gpLocation') : t('contact.gpLocations')}`
                    : c.status === 'upcoming' ? t('contact.gpUpcoming') : t('common.comingSoon');
                  return (
                    <button
                      key={c.id}
                      role="tab"
                      aria-selected={activeCountryId === c.id}
                      aria-controls={`gp-panel-${c.id}`}
                      id={`gp-tab-${c.id}`}
                      className={`${styles.gpTab} ${activeCountryId === c.id ? styles.gpTabActive : ''}`}
                      onClick={() => setActiveCountryId(c.id)}
                    >
                      <img src={flagSrc(c.flag)} alt="" className={styles.gpFlag} />
                      <span className={styles.gpTabText}>
                        <strong>{t(c.nameKey)}</strong>
                        <span>{sub}</span>
                      </span>
                      <IconArrowRight width={14} height={14} className={styles.gpTabArrow} aria-hidden="true" />
                    </button>
                  );
                })}
              </div>

              <div className={styles.gpBody} role="tabpanel" id={`gp-panel-${activeCountryId}`} aria-labelledby={`gp-tab-${activeCountryId}`}>
                <div className={styles.gpBodyHead}>
                  <img src={flagSrc(activeCountry.flag)} alt="" className={styles.gpBodyFlag} />
                  <div>
                    <strong>{t(activeCountry.nameKey)}</strong>
                    <span>{activeCountry.offices.length ? t('contact.gpOurOffices') : activeCountry.status === 'upcoming' ? t('contact.gpUpcoming') : t('common.comingSoon')}</span>
                  </div>
                </div>
                <div className={styles.gpCards}>
                  {activeCountry.offices.length > 0 ? (
                    activeCountry.offices.map((office) => (
                      <article key={office.cityKey} className={styles.gpCard}>
                        <div className={styles.gpCardImg} style={{ backgroundImage: `url(${office.photo})` }} />
                        <div className={styles.gpCardBody}>
                          <div className={styles.gpCardHead}>
                            <span className={styles.gpCardIcon} aria-hidden="true">
                              <IconPin width={16} height={16} color="var(--color-header-dark)" />
                            </span>
                            <strong className={styles.gpCardCity}>{t(office.cityKey)}</strong>
                            {office.badge === 'hq' && <span className={styles.gpCardBadgeHq}>{t('contact.gpHq')}</span>}
                            {office.badge === 'branch' && <span className={styles.gpCardBadgeBranch}>{t('contact.gpBranch')}</span>}
                          </div>
                          <address className={styles.gpCardAddr}>{t(office.addressKey)}</address>
                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(t(office.addressKey))}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.gpCardMapLink}
                            aria-label={`${t(office.cityKey)} — ${t(office.addressKey)}`}
                          >
                            <IconArrowRight width={14} height={14} aria-hidden="true" />
                          </a>
                        </div>
                      </article>
                    ))
                  ) : (
                    <div className={styles.gpCardSoon}>
                      <span className={styles.gpCardSoonIcon} aria-hidden="true">
                        <IconPin width={24} height={24} />
                      </span>
                      <div className={styles.gpCardSoonText}>
                        <span className={styles.gpCardSoonBadge}>{activeCountry.status === 'upcoming' ? t('contact.gpUpcoming') : t('common.comingSoon')}</span>
                        <p>{t('contact.lkOffice')}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── 10. Contact form ── */}
      <section className={styles.formSection}>
        <div className="container">
          <div className={styles.formSplit}>
            <Reveal className={styles.revealItem}>
              <div className={styles.formAside}>
              <div className={styles.formHead}>
                <h3 className={styles.formHeadTitle}>{t('contact.formTitle')}</h3>
                <p className={styles.formHeadSub}>{t('contact.formSub')}</p>
              </div>
              <div className={styles.satisfactionBanner}>
                <div className={styles.satisfactionIcon}>
                  <IconShieldCheck width={18} height={18} color="#fff" />
                </div>
                <div>
                  <strong>{t('contact.satisfactionTitle')}</strong>
                  <span>{t('contact.satisfactionSub')}</span>
                </div>
              </div>
            </div>
            </Reveal>
            <Reveal delay={0.12} className={styles.revealItem}>
          <div className={styles.formWrap}>
            {formStatus === 'success' && sentSummary ? (
              <div className={styles.sentPanel} role="status">
                <div className={styles.sentSeal} aria-hidden="true">
                  <span className={styles.sentRing} />
                  <span className={styles.sentRing} />
                  <span className={styles.sentCheckCircle}>
                    <svg className={styles.sentCheck} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" width={30} height={30}>
                      <path d="M4 12.5l5 5L20 6.5" />
                    </svg>
                  </span>
                </div>
                <h4 ref={sentHeadingRef} tabIndex={-1} className={styles.sentTitle}>
                  {t('contact.sentTitle')}
                </h4>
                <p className={styles.sentSub}>{t('contact.formSuccess')}</p>
                <dl className={styles.sentSummary}>
                  <div className={styles.sentRow}>
                    <dt>{t('contact.formName')}</dt>
                    <dd>{sentSummary.name}</dd>
                  </div>
                  <div className={styles.sentRow}>
                    <dt>{t('contact.formEmail')}</dt>
                    <dd>{sentSummary.email}</dd>
                  </div>
                  <div className={styles.sentRow}>
                    <dt>{t('contact.formSubject')}</dt>
                    <dd>{sentSummary.subject}</dd>
                  </div>
                </dl>
                <button type="button" className={styles.sendAnotherBtn} onClick={handleSendAnother}>
                  {t('contact.sendAnother')}
                </button>
              </div>
            ) : (
            <form className={styles.contactForm} onSubmit={handleFormSubmit}>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label htmlFor="support-name">{t('contact.formName')}</label>
                  <input
                    id="support-name"
                    type="text"
                    value={formName}
                    onChange={(e) => handleField(setFormName, e.target.value)}
                    autoComplete="name"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="support-email">{t('contact.formEmail')}</label>
                  <input
                    id="support-email"
                    type="email"
                    value={formEmail}
                    onChange={(e) => handleField(setFormEmail, e.target.value)}
                    autoComplete="email"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="support-phone">{t('contact.formPhone')}</label>
                  <input
                    id="support-phone"
                    type="tel"
                    value={formPhone}
                    onChange={(e) => handleField(setFormPhone, e.target.value)}
                    autoComplete="tel"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="support-subject">{t('contact.formSubject')}</label>
                  <input
                    id="support-subject"
                    type="text"
                    value={formSubject}
                    onChange={(e) => handleField(setFormSubject, e.target.value)}
                  />
                </div>
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="support-message">{t('contact.formMessage')}</label>
                <textarea
                  id="support-message"
                  rows={4}
                  value={formMessage}
                  onChange={(e) => handleField(setFormMessage, e.target.value)}
                />
              </div>
              {formStatus === 'error' && (
                <p className={styles.formError} role="alert">{t('contact.formError')}</p>
              )}
              <div className={styles.formSubmit}>
                <button
                  type="submit"
                  className={`${styles.submitBtn} ${formStatus === 'sending' ? styles.submitSending : ''} ${formStatus === 'error' ? styles.submitError : ''}`}
                  disabled={formStatus === 'sending'}
                  aria-live="polite"
                >
                  {formStatus === 'sending' && (
                    <>
                      <span className={styles.btnSpinner} aria-hidden="true" />
                      <span>{t('contact.formSending')}</span>
                    </>
                  )}
                  {(formStatus === 'idle' || formStatus === 'error') && t('contact.formSend')}
                </button>
              </div>
            </form>
            )}
          </div>
            </Reveal>
          </div>
        </div>
      </section>
    </div>
  );
}
