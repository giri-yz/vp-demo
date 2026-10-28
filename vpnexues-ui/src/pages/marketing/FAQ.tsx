import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../i18n/LanguageContext';
import {
  IconCart,
  IconCrown,
  IconShieldCheck,
  IconTruck,
  IconFresh,
  IconUserRoundCheck,
  IconLeaf,
  IconBasket,
  IconChevronDown,
} from '../../components/common/icons';
import styles from './css/FAQ.module.css';

const CATEGORY_KEYS = [
  'faq.categories.placingOrder',
  'faq.categories.plansPricing',
  'faq.categories.paymentMethods',
  'faq.categories.deliveryTracking',
  'faq.categories.productsFreshness',
  'faq.categories.accountSupport',
  'faq.categories.aboutFarmers',
  'faq.categories.organicQuality',
] as const;

const FAQ_QUESTION_KEYS = [
  'faqQuestions.placingOrder',
  'faqQuestions.plansPricing',
  'faqQuestions.paymentMethods',
  'faqQuestions.deliveryTracking',
  'faqQuestions.productsFreshness',
  'faqQuestions.accountSupport',
  'faqQuestions.aboutFarmers',
  'faqQuestions.organicQuality',
] as const;

const CATEGORY_ICONS = [
  IconCart,
  IconCrown,
  IconShieldCheck,
  IconTruck,
  IconFresh,
  IconUserRoundCheck,
  IconLeaf,
  IconBasket,
];

export default function FAQ() {
  const { t, tRaw } = useLanguage();
  const [activeCat, setActiveCat] = useState(0);
  const [openKey, setOpenKey] = useState<string | null>('0-0');

  const questionsFor = (ci: number): Array<{ q: string; a: string }> => {
    const raw = tRaw(FAQ_QUESTION_KEYS[ci]);
    return Array.isArray(raw) ? (raw as Array<{ q: string; a: string }>) : [];
  };

  const handleSelectCat = (ci: number) => {
    setActiveCat(ci);
    setOpenKey(`${ci}-0`);
  };

  const handleToggle = (key: string) => {
    setOpenKey(openKey === key ? null : key);
  };

  const activeQuestions = questionsFor(activeCat);

  return (
    <div>
      {/* Page banner — Support-hero layout, all screens */}
      <section className={styles.desktopBanner}>
        <div className={styles.bannerOverlay}>
          <div className="container">
            <div className={styles.bannerContent}>
              <div className={styles.breadcrumb}>
                <Link to="/">{t('faq.breadcrumbHome')}</Link> <span>&rsaquo;</span> {t('faq.breadcrumbFaqs')}
              </div>
              <div className={styles.bannerIcon}>
                <IconLeaf width={26} height={26} aria-hidden="true" />
              </div>
              <h1>{t('faq.title')}</h1>
              <p>{t('faq.subtitle')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className={styles.section}>
        <div className="container">
          <div className={styles.sectionTitleArea}>
            <div className={styles.secTag}>
              <img src="https://res.cloudinary.com/eqjshlur/image/upload/v1790001925/vpnexues/old/site-assets/sub-title.svg" alt="" className={styles.secTagIcon} />
              {t('faq.ourFaqs')}
            </div>
            <h2 className={styles.secTitle}>{t('faq.faqTitle')}</h2>
          </div>

          <div className={styles.faqLayout}>
            {/* ── LEFT: category navigation ── */}
            <aside className={styles.faqSide}>
              <nav className={styles.sideNav} aria-label="FAQ categories">
                {CATEGORY_KEYS.map((catTitleKey, ci) => {
                  const Icon = CATEGORY_ICONS[ci];
                  const isActive = ci === activeCat;
                  return (
                    <div key={ci} className={`${styles.sideGroup} ${isActive ? styles.sideGroupActive : ''}`}>
                      <button
                        type="button"
                        className={styles.sideItem}
                        onClick={() => handleSelectCat(ci)}
                        aria-current={isActive ? 'true' : undefined}
                      >
                        <span className={styles.sideIcon}>
                          <Icon width={18} height={18} />
                        </span>
                        <span className={styles.sideLabel}>{t(catTitleKey)}</span>
                        <span className={styles.sideChevron}>
                          <IconChevronDown width={16} height={16} />
                        </span>
                      </button>
                    </div>
                  );
                })}
              </nav>
            </aside>

            {/* ── RIGHT: active category content ── */}
            <div className={styles.faqMain}>
              <h3 className={styles.mainTitle}>
                <span className={styles.mainTitleIcon}>
                  {(() => {
                    const ActiveIcon = CATEGORY_ICONS[activeCat];
                    return <ActiveIcon width={26} height={26} />;
                  })()}
                </span>
                {t(CATEGORY_KEYS[activeCat])}
              </h3>
              <p className={styles.mainIntro}>
                {t('faq.subtitle')} <Link to="/contact">{t('faq.contactUs')} &rarr;</Link>
              </p>

              <div className={styles.faqCard}>
                <ul className={styles.qList}>
                  {activeQuestions.map((item, ii) => {
                    const key = `${activeCat}-${ii}`;
                    const isOpen = openKey === key;
                    return (
                      <li key={ii} className={styles.qItem}>
                        <button
                          type="button"
                          className={`${styles.qBtn} ${isOpen ? styles.qBtnActive : ''}`}
                          onClick={() => handleToggle(key)}
                          aria-expanded={isOpen}
                          aria-controls={`faq-answer-${activeCat}-${ii}`}
                        >
                          <span className={styles.qNum}>{ii + 1}</span>
                          <span className={styles.qText}>{item.q}</span>
                          <span className={styles.qChevron}>
                            <IconChevronDown width={16} height={16} />
                          </span>
                        </button>
                        {isOpen && (
                          <div className={styles.qAnswer} id={`faq-answer-${activeCat}-${ii}`}>
                            <p>{item.a}</p>
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
