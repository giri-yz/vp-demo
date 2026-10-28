import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCountry } from '../../context/CountryContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { formatPrice } from '../../utils/currency';
import type { CountryCode } from '../../types';
import { IconLeaf } from '../../components/common/icons';
import styles from './css/PricingPlan.module.css';

/* Product photos for the plan cards + comparison headers (Cloudinary) */
const PLAN_IMAGES = {
  smallBox: 'https://res.cloudinary.com/eqjshlur/image/upload/v1792760693/pricing/plan-small-box.jpg',
  bigBox: 'https://res.cloudinary.com/eqjshlur/image/upload/v1792760697/pricing/plan-big-box.jpg',
  b2b: 'https://res.cloudinary.com/eqjshlur/image/upload/v1792760700/pricing/plan-b2b-custom.jpg',
} as const;

interface PlanCard {
  key: string;
  name: string;
  sub: string;
  icon: string;
  price: string;
  unit: string;
  features: string[];
  cta: string;
  to: string;
}

/* Plan base prices in INR — matches screenshot design */
const PLAN_INR = { smallBox: 1550, bigBox: 5518 } as const;

/* SGD cross-rates used across the app (₹62 = S$1) — LK/MY approximate */
const FX_RATES: Record<CountryCode, number> = { IN: 62, SG: 1, US: 0.74, AE: 2.72, LK: 305, MY: 3.5 };

/* INR → country currency */
function planPrice(inr: number, country: CountryCode): string {
  return formatPrice(Math.round((inr / 62) * FX_RATES[country]), country);
}

function getPlans(country: CountryCode, t: (key: string) => string, tRaw: (key: string) => unknown): PlanCard[] {
  return [
    {
      key: 'smallBox',
      name: t('pricingPlan.smallBox'),
      sub: t('pricingPlan.smallBoxDesc'),
      icon: PLAN_IMAGES.smallBox,
      price: planPrice(PLAN_INR.smallBox, country),
      unit: t('pricingPlan.perBox'),
      features: tRaw('pricingPlan.smallBoxFeatures') as string[],
      cta: t('pricingPlan.buildSmallBox'),
      to: '/pricing/small-box',
    },
    {
      key: 'bigBox',
      name: t('pricingPlan.bigBox'),
      sub: t('pricingPlan.bigBoxDesc'),
      icon: PLAN_IMAGES.bigBox,
      price: planPrice(PLAN_INR.bigBox, country),
      unit: t('pricingPlan.perBox'),
      features: tRaw('pricingPlan.bigBoxFeatures') as string[],
      cta: t('pricingPlan.buildBigBox'),
      to: '/pricing/big-box',
    },
    {
      key: 'b2b',
      name: t('pricingPlan.b2bCustom'),
      sub: t('pricingPlan.b2bDesc'),
      icon: PLAN_IMAGES.b2b,
      price: t('pricingPlan.customPrice'),
      unit: t('pricingPlan.perQuote'),
      features: tRaw('pricingPlan.b2bFeatures') as string[],
      cta: t('pricingPlan.getStartedNow'),
      to: '/pricing/b2b',
    },
  ];
}

function getComparisonFeatures(country: CountryCode, t: (key: string) => string) {
  return [
    { label: t('pricingPlan.startingPrice'), values: [planPrice(PLAN_INR.smallBox, country) + ' ' + t('pricingPlan.perBox'), planPrice(PLAN_INR.bigBox, country) + ' ' + t('pricingPlan.perBox'), t('pricingPlan.customQuote')] },
    { label: t('pricingPlan.minimumRequirement'), values: [t('pricingPlan.min10Products'), t('pricingPlan.min10kgWeight'), t('pricingPlan.customizable')] },
    { label: t('pricingPlan.productSelection'), values: [t('pricingPlan.mixCategories'), t('pricingPlan.mixCategories'), t('pricingPlan.fullCustomization')] },
    { label: t('pricingPlan.certifications'), values: [t('pricingPlan.organicHalal'), t('pricingPlan.organicHalal'), t('pricingPlan.organicHalal')] },
    { label: t('pricingPlan.bulkDiscount'), values: [false, true, t('pricingPlan.tieredPricing')] },
    { label: t('pricingPlan.dedicatedManager'), values: [false, false, true] },
    { label: t('pricingPlan.creditTerms'), values: [false, false, t('pricingPlan.thirtyDay')] },
    { label: t('pricingPlan.invoiceBilling'), values: [false, false, true] },
    { label: t('pricingPlan.bestFor'), values: [t('pricingPlan.individuals'), t('pricingPlan.families'), t('pricingPlan.restaurantsHotels')] },
  ];
}

function getMobileComparison(country: CountryCode, t: (key: string) => string, tRaw: (key: string) => unknown) {
  return [
    {
      name: t('pricingPlan.smallBox'),
      price: planPrice(PLAN_INR.smallBox, country) + ' ' + t('pricingPlan.perBox'),
      features: tRaw('pricingPlan.smallBoxMobileFeatures') as string[],
      cta: t('pricingPlan.buildSmallBox'),
      to: '/pricing/small-box',
    },
    {
      name: t('pricingPlan.bigBox'),
      price: planPrice(PLAN_INR.bigBox, country) + ' ' + t('pricingPlan.perBox'),
      features: tRaw('pricingPlan.bigBoxMobileFeatures') as string[],
      cta: t('pricingPlan.buildBigBox'),
      to: '/pricing/big-box',
    },
    {
      name: t('pricingPlan.b2bCustom'),
      price: t('pricingPlan.customPrice') + ' ' + t('pricingPlan.perQuote'),
      features: tRaw('pricingPlan.b2bMobileFeatures') as string[],
      cta: t('pricingPlan.getStartedNow'),
      to: '/pricing/b2b',
    },
  ];
}

const STEPS = [
  { num: 1, titleKey: 'pricingPlan.step1Title', descKey: 'pricingPlan.step1Desc' },
  { num: 2, titleKey: 'pricingPlan.step2Title', descKey: 'pricingPlan.step2Desc' },
  { num: 3, titleKey: 'pricingPlan.step3Title', descKey: 'pricingPlan.step3Desc' },
];

export default function PricingPlan() {
  const [cardsVisible, setCardsVisible] = useState(false);
  const [staggerDone, setStaggerDone] = useState(false);
  const plansRef = useRef<HTMLDivElement>(null);
  const { country } = useCountry();
  const { t, tRaw } = useLanguage();

  /* Scroll-reveal: cards fade/slide in with a stagger once the grid scrolls into view */
  useEffect(() => {
    const el = plansRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setCardsVisible(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setCardsVisible(true);
          io.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  /* Clear the stagger delay once the entrance finishes so hover transitions stay instant */
  useEffect(() => {
    if (!cardsVisible) return;
    const id = setTimeout(() => setStaggerDone(true), 1200);
    return () => clearTimeout(id);
  }, [cardsVisible]);

  const PLANS = getPlans(country, t, tRaw);
  const COMPARISON_FEATURES = getComparisonFeatures(country, t);
  const MOBILE_COMPARISON = getMobileComparison(country, t, tRaw);

    return (
    <div className={styles.pageWrap}>
      {/* Desktop banner — photo style like other pages, Support-hero layout */}
      <section className={styles.desktopBanner}>
        <div className={styles.bannerOverlay}>
          <div className="container">
            <div className={styles.bannerContent}>
              <div className={styles.breadcrumb}>
                <Link to="/">{t('pricingPlan.bannerHome')}</Link> <span>&rsaquo;</span> {t('pricingPlan.bannerCurrent')}
              </div>
              <div className={styles.bannerIcon}>
                <IconLeaf width={26} height={26} aria-hidden="true" />
              </div>
              <h1>{t('pricingPlan.bannerTitle')}</h1>
              <p>{t('pricingPlan.bannerDesc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.heroBadge}>
            <span>&#127807;</span> {t('pricingPlan.heroBadge')}
          </div>
          <h1>{t('pricingPlan.heroTitle1')} <span className={styles.heroHighlight}>{t('pricingPlan.heroTitle2')}</span></h1>
          <p className={styles.heroDesc}>
            {t('pricingPlan.heroDesc')}
          </p>
          <div className={styles.heroTags}>
            <span className={styles.heroTag}>&#10003; {t('pricingPlan.heroTag1')}</span>
            <span className={styles.heroTag}>&#10003; {t('pricingPlan.heroTag2')}</span>
            <span className={styles.heroTag}>&#10003; {t('pricingPlan.heroTag3')}</span>
          </div>
          <div className={styles.heroActions}>
            <a href="#pricing-plans" className={`${styles.heroBtn} ${styles.heroBtnPrimary}`}>&#8595; {t('pricingPlan.viewPlans')}</a>
            <a href="tel:+917810077636" className={`${styles.heroBtn} ${styles.heroBtnOutline}`}>&#9742; {t('pricingPlan.talkToUs')}</a>
          </div>
        </div>
      </section>

      {/* Trust Items */}
      <section className={styles.trustSection}>
        <div className={styles.trustItems}>
          <div className={styles.trustItem}>
            <span className={styles.trustIcon}>&#128737;</span>
            <span>{t('pricingPlan.trustSfa')}</span>
          </div>
          <div className={styles.trustItem}>
            <span className={styles.trustIcon}>&#127807;</span>
            <span>{t('pricingPlan.trustOrganic')}</span>
          </div>
          <div className={styles.trustItem}>
            <span className={styles.trustIcon}>&#128666;</span>
            <span>{t('pricingPlan.trustShipping')}</span>
          </div>
          <div className={styles.trustItem}>
            <span className={styles.trustIcon}>&#9200;</span>
            <span>{t('pricingPlan.trustDelivery')}</span>
          </div>
        </div>
      </section>

      {/* Plans */}
      <section className={styles.plansSection} id="pricing-plans">
        <div className="container">
          <div className={styles.secHeader}>
            <div className={styles.secTag}><span>&#128196; {t('pricingPlan.secTag')}</span></div>
            <h2 className={styles.secTitle}>{t('pricingPlan.secTitle')}</h2>
            <p className={styles.secDesc}>{t('pricingPlan.secDesc')}</p>
          </div>
          <div className={styles.plansGrid} ref={plansRef}>
            {PLANS.map((plan, i) => (
              <div
                key={plan.key}
                className={`${styles.planCard} ${cardsVisible ? styles.revealIn : styles.reveal}`}
                style={{ transitionDelay: cardsVisible && !staggerDone ? `${i * 130}ms` : undefined }}
              >
                <div className={styles.planIcon} aria-hidden="true">
                  <img src={plan.icon} alt="" loading="lazy" />
                </div>
                <h3 className={styles.planName}>{plan.name}</h3>
                <p className={styles.planSub}>{plan.sub}</p>
                <div className={styles.planPrice}>
                  <span className={`${styles.price} ${plan.key === 'b2b' ? styles.priceCustom : ''}`}>{plan.price}</span>
                  {plan.unit && <span className={styles.unit}>{plan.unit}</span>}
                </div>
                <div className={styles.planFeatures}>
                  {plan.features.map((f, i) => (
                    <div key={i} className={styles.featItem}>
                      <span className={styles.featCheck}>&#10003;</span>
                      {f}
                    </div>
                  ))}
                </div>
                <Link to={plan.to} className={`${styles.planCta} ${styles.ctaOutlineBtn}`}>
                  {plan.cta} &#8594;
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison */}
      <section className={styles.compSection}>
        <div className="container">
          <div className={styles.secHeader}>
            <div className={styles.secTag}><span>&#9878; {t('pricingPlan.compTag')}</span></div>
            <h2 className={styles.secTitle}>{t('pricingPlan.compTitle')}</h2>
            <p className={styles.secDesc}>{t('pricingPlan.compDesc')}</p>
          </div>

          {/* Desktop Table */}
          <div className={styles.tableWrap}>
            <table className={styles.compTable}>
              <thead>
                <tr>
                  <th>{t('pricingPlan.feature')}</th>
                  <th className={styles.compHeaderSoft}>
                    <span className={styles.compPlanIcon} aria-hidden="true"><img src={PLAN_IMAGES.smallBox} alt="" /></span>
                    {t('pricingPlan.smallBox')}
                  </th>
                  <th className={styles.compHeaderSoft}>
                    <span className={styles.compPlanIcon} aria-hidden="true"><img src={PLAN_IMAGES.bigBox} alt="" /></span>
                    {t('pricingPlan.bigBox')}
                  </th>
                  <th className={styles.compHeaderSoft}>
                    <span className={styles.compPlanIcon} aria-hidden="true"><img src={PLAN_IMAGES.b2b} alt="" /></span>
                    {t('pricingPlan.b2bCustom')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON_FEATURES.map((row) => (
                  <tr key={row.label}>
                    <td className={styles.featLabel}>{row.label}</td>
                    {row.values.map((v, i) => (
                      <td key={i}>
                        {v === true ? (
                          <span className={styles.compCheck}>&#10003;</span>
                        ) : v === false ? (
                          <span className={styles.compCross}>&#8722;</span>
                        ) : (
                          v
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
                <tr className={styles.compCtaRow}>
                  <td>{t('pricingPlan.getStarted')}</td>
                  <td><Link to="/pricing/small-box" className={styles.compCta}>{t('pricingPlan.buildSmallBox')} &#8594;</Link></td>
                  <td><Link to="/pricing/big-box" className={styles.compCta}>{t('pricingPlan.buildBigBox')} &#8594;</Link></td>
                  <td><Link to="/pricing/b2b" className={styles.compCta}>{t('pricingPlan.getStartedNow')} &#8594;</Link></td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className={styles.compMobile}>
            {MOBILE_COMPARISON.map((c) => (
              <div key={c.name} className={styles.compCard}>
                <div className={styles.compCardHead}>
                  <h3>{c.name}</h3>
                  <span>{c.price}</span>
                </div>
                <div className={styles.compCardFeatures}>
                  {c.features.map((f, i) => (
                    <div key={i} className={styles.compCardFeat}>
                      <span className={styles.featCheck}>&#10003;</span> {f}
                    </div>
                  ))}
                </div>
                <Link to={c.to} className={styles.compCardCta}>
                  {c.cta} &#8594;
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className={styles.stepsSection}>
        <div className="container">
          <div className={styles.secHeader}>
            <div className={styles.secTag}><span>&#128506; {t('pricingPlan.stepsTag')}</span></div>
            <h2 className={styles.secTitle}>{t('pricingPlan.stepsTitle')}</h2>
            <p className={styles.secDesc}>{t('pricingPlan.stepsDesc')}</p>
          </div>
          <div className={styles.stepsGrid}>
            {STEPS.map((step) => (
              <div key={step.num} className={styles.stepCard}>
                <div className={styles.stepNum}>{step.num}</div>
                <h3>{t(step.titleKey)}</h3>
                <p>{t(step.descKey)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className={styles.ctaSection}>
        <div className="container">
          <h2>{t('pricingPlan.ctaTitle')}</h2>
          <p>{t('pricingPlan.ctaDesc')}</p>
          <div className={styles.ctaBtns}>
            <Link to="/shop" className={styles.ctaBtnPrimary}>{t('pricingPlan.startShopping')}</Link>
            <a href="tel:+917810077636" className={styles.ctaBtnOutline}>{t('pricingPlan.contactSales')}</a>
          </div>
        </div>
      </section>
    </div>
  );
}
