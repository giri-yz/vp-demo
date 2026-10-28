import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { flagSrc } from '../../utils/flags';
import { useAuthModal } from '../../context/AuthModalContext';
import { useCart } from '../../context/CartContext';
import { useCountry } from '../../context/CountryContext';
import { useLanguage, type LangCode } from '../../i18n/LanguageContext';
import type { CountryCode } from '../../types';
import {
  IconBasket,
  IconBriefcase,
  IconCart,
  IconChevronDown,
  IconClose,
  IconFacebook,
  IconGrid,
  IconHeadset,
  IconHome,
  IconInfo,
  IconArrowRight,
  IconInstagram,
  IconLeaf,
  IconLinkedin,
  IconMail,
  IconMapPin,
  IconPhone,
  IconUser,
} from './icons';
import styles from './css/Header.module.css';

const COUNTRIES: CountryCode[] = ['IN', 'SG', 'US', 'AE', 'LK', 'MY'];
const COUNTRY_FLAG: Record<CountryCode, string> = { IN: 'in', SG: 'sg', US: 'us', AE: 'ae', LK: 'lk', MY: 'my' };
const FLAG_OVERRIDE: Record<string, string> = { GB: 'uk', AE: 'ae' };

const LANGUAGES: { code: LangCode; label: string; flag: string }[] = [
  { code: 'en', label: 'English', flag: 'gb' },
  { code: 'hi', label: 'हिन्दी', flag: 'in' },
  { code: 'ta', label: 'தமிழ்', flag: 'in' },
  { code: 'si', label: 'සිංහල', flag: 'lk' },
  { code: 'ms', label: 'Bahasa Melayu', flag: 'my' },
];

interface NavItemDef {
  labelKey: string;
  to?: string;
  end?: boolean;
  children?: { to: string; labelKey: string }[];
}

const NAV_ITEMS: NavItemDef[] = [
  { labelKey: 'nav.home', to: '/', end: true },
  { labelKey: 'nav.aboutUs', to: '/about' },
  {
    labelKey: 'nav.pages',
    children: [
      { to: '/team', labelKey: 'nav.ourTeam' },
      { to: '/market', labelKey: 'nav.market' },
      { to: '/pricing/plan', labelKey: 'nav.pricingPlan' },
      { to: '/testimonial', labelKey: 'nav.testimonials' },
      { to: '/faq', labelKey: 'nav.faqs' },
      { to: '/news', labelKey: 'nav.news' },
      { to: '/gallery', labelKey: 'nav.gallery' },
    ],
  },
  {
    labelKey: 'nav.shop',
    children: [
      { to: '/shop', labelKey: 'nav.shop' },
      { to: '/pricing/small-box', labelKey: 'nav.smallBox' },
      { to: '/pricing/big-box', labelKey: 'nav.bigBox' },
      { to: '/pricing/b2b', labelKey: 'nav.b2b' },
    ],
  },
  { labelKey: 'nav.support', to: '/contact' },
  { labelKey: 'nav.careers', to: '/careers' },
];

const NAV_ICONS: Record<string, React.ReactNode> = {
  'nav.home': <IconHome />,
  'nav.aboutUs': <IconInfo />,
  'nav.pages': <IconGrid />,
  'nav.shop': <IconBasket />,
  'nav.support': <IconHeadset />,
  'nav.careers': <IconBriefcase />,
};

export default function Header() {
  const { user } = useAuth();
  const { openAuthModal } = useAuthModal();
  const { cart } = useCart();
  const location = useLocation();
  const { country, setCountry } = useCountry();
  const { lang, setLang, t } = useLanguage();

  const [mobileOpen, setMobileOpen] = useState(() => sessionStorage.getItem('vpnexues_mobile_menu') === 'open');
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);
  const [hoveredDropdown, setHoveredDropdown] = useState<string | null>(null);
  const [countryDropdownOpen, setCountryDropdownOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [countriesExpanded, setCountriesExpanded] = useState(false);
  const [locationsOpen, setLocationsOpen] = useState(false);
  const [callOpen, setCallOpen] = useState(false);
  const [emailOpen, setEmailOpen] = useState(false);
  const countryDropdownRef = useRef<HTMLDivElement>(null);

  // Two-tone hero script: “Freshness” (white) + “Delivered with Care” (gold),
  // split on the first comma so it works in every locale.
  const freshnessText = t('header.freshness');
  const commaAt = freshnessText.indexOf(',');
  const freshWord = commaAt > 0 ? freshnessText.slice(0, commaAt).trim() : freshnessText;
  const freshRest = commaAt > 0 ? freshnessText.slice(commaAt + 1).trim() : '';

  const wrapperRef = useRef<HTMLDivElement>(null);
  const navbarRef = useRef<HTMLElement>(null);

  const { pathname } = location;
  const isShopPage =
    pathname === '/shop' || pathname.startsWith('/shop/') ||
    pathname === '/pricing/small-box' || pathname === '/pricing/big-box';

  useEffect(() => {
    if (isShopPage) return;
    const el = wrapperRef.current;
    if (!el) return;

    const SCROLL_THRESHOLD = 10;
    let isScrolled = false;
    let ticking = false;

    function updateHeader() {
      const y = window.scrollY;
      const shouldBeScrolled = y > SCROLL_THRESHOLD;
      if (shouldBeScrolled !== isScrolled) {
        isScrolled = shouldBeScrolled;
        el?.classList.toggle('is-scrolled', isScrolled);
      }
      ticking = false;
    }

    function onScroll() {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(updateHeader);
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    return () => {
      window.removeEventListener('scroll', onScroll);
    };
  }, [isShopPage]);

  useEffect(() => {
    const el = wrapperRef.current;
    if (el) {
      el.classList.remove('is-scrolled');
    }
    window.scrollTo(0, 0);
    if (sessionStorage.getItem('vpnexues_mobile_menu') === 'open') {
      setMobileOpen(true);
    }
  }, [location.pathname]);

  useEffect(() => {
    if (!countryDropdownOpen) return;
    function handleClickOutside(e: MouseEvent) {
      if (countryDropdownRef.current && !countryDropdownRef.current.contains(e.target as Node)) {
        setCountryDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [countryDropdownOpen]);

  useEffect(() => {
    if (!mobileOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileOpen]);

  function closeMobileMenu() {
    setMobileOpen(false);
    setExpandedGroup(null);
    sessionStorage.removeItem('vpnexues_mobile_menu');
  }

  function handleDrawerLinkClick() {
    setMobileOpen(false);
    setExpandedGroup(null);
    sessionStorage.setItem('vpnexues_mobile_menu', 'open');
  }

  function handleDropdownHover(label: string, isHovering: boolean) {
    setHoveredDropdown(isHovering ? label : null);
  }

  function handleCountryChange(code: CountryCode) {
    // Single source of truth = CountryContext (persists vpnexues-country itself).
    // The old vpnexues_detected_country write here went stale whenever Shop/SmallBox/
    // BigBox set the country via the context only — the next page load then reverted
    // the user's pick (and fired a phantom "Location detected" toast).
    setCountry(code);
  }

  function getFlagCode(code: CountryCode): string {
    return FLAG_OVERRIDE[code] || COUNTRY_FLAG[code];
  }

  const totalItems = useMemo(() => cart?.items?.reduce((sum, i) => sum + i.qty, 0) ?? 0, [cart]);
  const currentCountry = country;
  const currentLang = LANGUAGES.find((l) => l.code === lang) || LANGUAGES[0];

  return (
    <div ref={wrapperRef} className={styles.wrapper}>
      {/* Top bar */}
      <div className={styles.topBar}>
        <div className={styles.topBarInner}>
          <ul className={styles.contactList}>
            <li>
              <IconMail className={styles.contactIcon} />
              <a
                href="https://mail.google.com/mail/u/0/?view=cm&fs=1&tf=1&to=support@vpnexues.com&su=Website Inquiry&body=Hello VPNexues Team,"
                target="_blank"
                rel="noreferrer"
              >
                support@vpnexues.com
              </a>
            </li>
            <li>
              <IconPhone className={styles.contactIcon} />
              <a href="tel:+917810077636">+91 78100 77636</a> | <a href="tel:+918148197842">+91 8148197842</a> | <a href="tel:+6588510445">+65 8851 0445</a>
            </li>
          </ul>
          <div className={styles.topRight}>
            {/* Language label */}
            <div className={styles.countryPicker}>
              <span
                className={styles.countryPickerBtn}
                aria-label={`Language: ${currentLang.code.toUpperCase()}`}
              >
                <span className={styles.countryCode}>{currentLang.code.toUpperCase()}</span>
              </span>
            </div>
            <span className={styles.divider} aria-hidden="true" />
            {/* Country picker + Language switcher */}
            <div className={styles.countryPicker} ref={countryDropdownRef}>
              <button
                type="button"
                className={styles.countryPickerBtn}
                onClick={() => { setCountryDropdownOpen(!countryDropdownOpen); if (countryDropdownOpen) setCountriesExpanded(false); }}
                aria-expanded={countryDropdownOpen}
                aria-haspopup="listbox"
              >
                <img
                  className={styles.flagImg}
                  src={flagSrc(getFlagCode(currentCountry))}
                  alt=""
                  width={24}
                  height={18}
                />
                <span className={styles.countryCode}>{currentCountry}</span>
                <IconChevronDown className={`${styles.countryChevron} ${countryDropdownOpen ? styles.countryChevronOpen : ''}`} />
              </button>
              {countryDropdownOpen && (
                <div className={styles.countryDropdown} role="listbox">
                  {countriesExpanded ? (
                    <>
                      {COUNTRIES.map((code) => (
                        <button
                          key={code}
                          type="button"
                          className={`${styles.countryOption} ${code === currentCountry ? styles.countryOptionActive : ''}`}
                          onClick={() => { handleCountryChange(code); setCountriesExpanded(false); setCountryDropdownOpen(false); }}
                          role="option"
                          aria-selected={code === currentCountry}
                        >
                          <img
                            className={styles.countryOptionFlag}
                            src={flagSrc(getFlagCode(code))}
                            alt=""
                            width={24}
                            height={18}
                          />
                          <span className={styles.countryOptionLabel}>{t('country.' + code)}</span>
                        </button>
                      ))}
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        className={styles.countryOption}
                        onClick={() => setCountriesExpanded(true)}
                      >
                        <img
                          className={styles.countryOptionFlag}
                          src={flagSrc(getFlagCode(currentCountry))}
                          alt=""
                          width={24}
                          height={18}
                        />
                        <span className={styles.countryOptionLabel}>{t('country.' + currentCountry)}</span>
                      </button>
                      <div className={styles.countryDivider} />
                      <button
                        type="button"
                        className={styles.countryOption}
                        onClick={() => setCountriesExpanded(true)}
                      >
                        <svg className={styles.changeCountryIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10" />
                          <line x1="2" y1="12" x2="22" y2="12" />
                          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                        </svg>
                        <span className={styles.countryOptionLabel}>{t('header.changeCountry')}</span>
                        <svg className={styles.changeCountryChevron} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="9 18 15 12 9 6" />
                        </svg>
                      </button>
                    </>
                  )}
                  <div className={styles.langSectionHeader}>{t('header.selectLanguage')}</div>
                  {LANGUAGES.map((l) => (
                    <button
                      key={l.code}
                      type="button"
                      className={`${styles.countryOption} ${styles.langOption} ${l.code === lang ? styles.countryOptionActive : ''}`}
                      onClick={() => { setLang(l.code); setCountryDropdownOpen(false); }}
                      role="option"
                      aria-selected={l.code === lang}
                    >
                      {l.code !== 'en' && (
                        <img
                          className={styles.langFlag}
                          src={flagSrc(l.flag)}
                          alt=""
                          width={16}
                          height={12}
                        />
                      )}
                      <span className={styles.langOptionLabel}>{l.label} - {l.code.toUpperCase()}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <span className={styles.divider} aria-hidden="true" />
            <div className={styles.socialIcons}>
              <a href="https://www.facebook.com/share/1Cda4sCpk5/" target="_blank" rel="noreferrer" aria-label="Facebook">
                <IconFacebook />
              </a>
              <a href="https://www.linkedin.com/company/vpnexues/" target="_blank" rel="noreferrer" aria-label="LinkedIn">
                <IconLinkedin />
              </a>
              <a href="https://www.instagram.com/vpnexues?igsh=dzViZDMyNXllNTFw" target="_blank" rel="noreferrer" aria-label="Instagram">
                <IconInstagram />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Navbar */}
      <nav ref={navbarRef} className={styles.navbar} role="navigation" aria-label="Main navigation">
        <Link to="/" className={styles.logo} onClick={closeMobileMenu}>
          <img src="https://res.cloudinary.com/eqjshlur/image/upload/v1790001831/vpnexues/old/site-assets/logo/vp-logo.svg" alt="" className={styles.logoIcon} />
          <span className={styles.logoText}>
            <span className={styles.logoWordmark}>VPNexues</span>
            <span className={styles.logoTagline}>விவசாயம் காப்போம்</span>
          </span>
        </Link>

        <nav className={styles.nav} aria-label="Primary navigation">
          {NAV_ITEMS.map((item) =>
            item.children ? (
              <div
                key={item.labelKey}
                className={styles.dropdown}
                onMouseEnter={() => handleDropdownHover(item.labelKey, true)}
                onMouseLeave={() => handleDropdownHover(item.labelKey, false)}
              >
                <button
                  type="button"
                  className={styles.dropdownTrigger}
                  aria-haspopup="true"
                  aria-expanded={hoveredDropdown === item.labelKey}
                  onClick={() => handleDropdownHover(item.labelKey, hoveredDropdown !== item.labelKey)}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleDropdownHover(item.labelKey, hoveredDropdown !== item.labelKey); } if (e.key === 'Escape') handleDropdownHover(item.labelKey, false); }}
                >
                  {t(item.labelKey)}
                  <IconChevronDown className={styles.dropdownChevron} />
                </button>
                <div className={`${styles.dropdownMenu} ${hoveredDropdown === item.labelKey ? styles.dropdownMenuOpen : ''}`} role="menu">
                  {item.children.map((child) => (
                    <NavLink key={child.to} to={child.to} className={({ isActive }) => (isActive ? `${styles.dropdownLink} ${styles.dropdownLinkActive}` : styles.dropdownLink)} role="menuitem" onClick={closeMobileMenu}>
                      {t(child.labelKey)}
                    </NavLink>
                  ))}
                </div>
              </div>
            ) : (
              <NavLink key={item.to} to={item.to!} end={item.end} className={({ isActive }) => (isActive ? `${styles.link} ${styles.linkActive}` : styles.link)}>
                {t(item.labelKey)}
              </NavLink>
            ),
          )}
        </nav>

        <div className={styles.actions}>
          <Link to="/cart" className={styles.cartLink} aria-label="View cart">
            <IconCart className={styles.cartIcon} />
            {totalItems > 0 && <span className={styles.cartBadge}>{totalItems}</span>}
          </Link>

          {user ? (
            <Link to="/account" className={styles.accountLink}>
              <IconUser className={styles.accountIcon} />
              <span className={styles.accountLabel}>{t('nav.myAccount')}</span>
            </Link>
          ) : (
            <button type="button" className={styles.accountLink} onClick={() => openAuthModal()}>
              <IconUser className={styles.accountIcon} />
              <span className={styles.accountLabel}>{t('nav.login')}</span>
            </button>
          )}

          {/* Mobile language picker */}
          <div className={styles.langPickerMobile}>
            <button type="button" className={styles.countryPickerBtn} onClick={() => setLangDropdownOpen(!langDropdownOpen)}>
              <span className={styles.countryCode}>{currentLang.code.toUpperCase()}</span>
            </button>
            {langDropdownOpen && (
              <div className={`${styles.countryDropdown} ${styles.langDropdown}`} role="listbox">
                {LANGUAGES.map((l) => (
                  <button key={l.code} type="button" className={`${styles.countryOption} ${l.code === lang ? styles.countryOptionActive : ''}`} onClick={() => { setLang(l.code); setLangDropdownOpen(false); }} role="option" aria-selected={l.code === lang}>
                    <span className={styles.countryOptionLabel}>{l.label} - {l.code.toUpperCase()}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            type="button"
            className={`${styles.menuToggle} ${mobileOpen ? styles.menuToggleOpen : ''}`}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
            aria-controls="header-offcanvas"
            onClick={() => setMobileOpen((v) => { const next = !v; if (next) sessionStorage.setItem('vpnexues_mobile_menu', 'open'); else sessionStorage.removeItem('vpnexues_mobile_menu'); return next; })}
          >
            <span className={styles.menuToggleLine} />
            <span className={`${styles.menuToggleLine} ${styles.menuToggleLineMid}`} />
            <span className={styles.menuToggleLine} />
          </button>
        </div>
      </nav>

      <div className={styles.navbarSpacer} />

      <div className={`${styles.mobileOverlay} ${mobileOpen ? styles.mobileOverlayOpen : ''}`} onClick={closeMobileMenu} aria-hidden="true" />

      <aside
        id="header-offcanvas"
        className={`${styles.mobileDrawer} ${mobileOpen ? styles.mobileDrawerOpen : ''}`}
        aria-hidden={!mobileOpen}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation"
      >
        <div className={styles.mobileHero}>
          <div className={styles.mobileDrawerTop}>
            <Link to="/" className={styles.mobileDrawerLogo} onClick={closeMobileMenu}>
              <img src="https://res.cloudinary.com/eqjshlur/image/upload/v1790001831/vpnexues/old/site-assets/logo/vp-logo.svg" alt="" className={styles.logoIcon} />
              <span className={styles.logoWordmark}>VPNexues</span>
            </Link>
            <button type="button" className={styles.mobileDrawerClose} onClick={closeMobileMenu} aria-label="Close menu">
              <IconClose />
            </button>
          </div>

          {/* ivory banner card (Manrope heading + tagline + fruit basket) */}
          <div className={styles.mobileHeroBanner}>
            <div className={styles.mobileHeroScene}>
              <div className={styles.mobileHeroCopy}>
                <p className={styles.mobileHeroScript}>
                  <span className={styles.scriptLead}>{freshWord}</span>
                  {freshRest && <span className={styles.scriptAccent}>{freshRest}</span>}
                </p>
                <p className={styles.mobileHeroTagline}>{t('header.farmToTable')}</p>
              </div>
              <FarmHeroArt />
            </div>

            {/* organic curve with a golden-yellow edge, separating banner from the nav */}
            <div className={styles.mobileHeroWave} aria-hidden="true">
              <svg viewBox="0 0 400 46" preserveAspectRatio="none">
                {/* gold crest line */}
                <path
                  className={styles.mobileHeroWaveAccent}
                  d="M0 14c48-12 96 10 146 7s84-19 132-13 78 17 122 11v11c-44 6-82-5-122-10s-84 6-132 11S48 27 0 33Z"
                />
                {/* ivory body below the line */}
                <path d="M0 26c46-15 92 9 140 5s86-23 134-17 84 21 126 13v19H0Z" />
              </svg>
            </div>
          </div>

          <p className={styles.mobileDrawerTitle}>{t('header.mobileDesc')}</p>
        </div>

        <nav className={styles.mobileNav} aria-label="Mobile navigation">
          {NAV_ITEMS.map((item) =>
            item.children ? (
              <Fragment key={item.labelKey}>
                <button
                  type="button"
                  className={`${styles.mobileNavCard} ${expandedGroup === item.labelKey ? styles.mobileNavCardOpen : ''}`}
                  onClick={() => setExpandedGroup((g) => (g === item.labelKey ? null : item.labelKey))}
                  aria-expanded={expandedGroup === item.labelKey}
                  aria-controls={`submenu-${item.labelKey}`}
                >
                  <span className={styles.mobileNavIcon}>{NAV_ICONS[item.labelKey]}</span>
                  <span className={styles.mobileNavLabel}>
                    <span className={styles.mobileNavText}>{t(item.labelKey)}</span>
                    <span className={styles.mobileNavMeta}>
                      <IconChevronDown className={`${styles.mobileNavChevron} ${expandedGroup === item.labelKey ? styles.mobileNavChevronOpen : ''}`} />
                    </span>
                  </span>
                </button>
                {expandedGroup === item.labelKey && (
                  <div id={`submenu-${item.labelKey}`} className={styles.mobileSubNav} role="menu">
                    {item.children.map((child) => (
                      <NavLink key={child.to} to={child.to} onClick={handleDrawerLinkClick} className={({ isActive }) => (isActive ? `${styles.mobileSubLink} ${styles.mobileSubLinkActive}` : styles.mobileSubLink)} role="menuitem">
                        {t(child.labelKey)}
                      </NavLink>
                    ))}
                  </div>
                )}
              </Fragment>
            ) : (
              <NavLink
                key={item.to}
                to={item.to!}
                end={item.end}
                onClick={handleDrawerLinkClick}
                className={({ isActive }) =>
                  [
                    styles.mobileNavCard,
                    item.to === '/' || item.labelKey === 'nav.careers' ? styles.mobileNavWide : '',
                    isActive ? styles.mobileNavCardActive : '',
                  ]
                    .filter(Boolean)
                    .join(' ')
                }
              >
                {({ isActive }) => (
                  <>
                    <span className={styles.mobileNavIcon}>{NAV_ICONS[item.labelKey]}</span>
                    <span className={styles.mobileNavLabel}>
                      <span className={styles.mobileNavText}>{t(item.labelKey)}</span>
                      <span className={styles.mobileNavMeta}>
                        {item.to === '/' && isActive && <em className={styles.mobileNavHint}>{t('header.youAreHere')}</em>}
                        {item.labelKey === 'nav.careers' && <em className={styles.mobileNavHint}>{t('header.weReHiring')}</em>}
                        <span className={styles.mobileNavArrow} aria-hidden="true">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 6 6 6-6 6" /></svg>
                        </span>
                      </span>
                    </span>
                  </>
                )}
              </NavLink>
            ),
          )}
        </nav>

        {user ? (
          <Link to="/account" className={styles.mobileLoginBtn} onClick={closeMobileMenu}>
            <IconUser className={styles.mobileLoginIcon} />
            {t('nav.myAccount')}
          </Link>
        ) : (
          <button type="button" className={styles.mobileLoginBtn} onClick={() => { closeMobileMenu(); openAuthModal(); }}>
            <IconUser className={styles.mobileLoginIcon} />
            {t('nav.loginSignUp')}
          </button>
        )}

        <div className={styles.mobileContactBlock}>
          <span className={`${styles.leafCorner} ${styles.leafCornerTop}`} aria-hidden="true"><LeafSprig /></span>
          <span className={`${styles.leafCorner} ${styles.leafCornerBottom}`} aria-hidden="true"><LeafSprig /></span>
          <h3>{t('header.contactUs')}</h3>

          <div className={styles.mobileContactCards}>
            <button
              type="button"
              className={`${styles.mobileContactCard} ${callOpen ? styles.mobileContactCardActive : ''}`}
              onClick={() => setCallOpen((v) => !v)}
              aria-expanded={callOpen}
              aria-controls="drawer-call"
            >
              <span className={styles.mobileContactCardIcon}><IconPhone /></span>
              <span className={styles.mobileContactCardLabel}>{t('header.callUs')}</span>
            </button>
            <button
              type="button"
              className={`${styles.mobileContactCard} ${emailOpen ? styles.mobileContactCardActive : ''}`}
              onClick={() => setEmailOpen((v) => !v)}
              aria-expanded={emailOpen}
              aria-controls="drawer-email"
            >
              <span className={styles.mobileContactCardIcon}><IconMail /></span>
              <span className={styles.mobileContactCardLabel}>{t('header.sendEmail')}</span>
            </button>
            <button
              type="button"
              className={`${styles.mobileContactCard} ${locationsOpen ? styles.mobileContactCardActive : ''}`}
              onClick={() => setLocationsOpen((v) => !v)}
              aria-expanded={locationsOpen}
              aria-controls="drawer-locations"
            >
              <span className={styles.mobileContactCardIcon}><IconMapPin /></span>
              <span className={styles.mobileContactCardLabel}>{t('header.location')}</span>
            </button>
          </div>

          {(callOpen || emailOpen) && (
            <div className={styles.mobileContactLines}>
              {callOpen && (
                <span id="drawer-call" className={styles.mobileContactCallLine}>
                  <a href="tel:+917810077636">+91 78100 77636</a>
                  <span aria-hidden="true"> | </span>
                  <a href="tel:+918148197842">+91 8148197842</a>
                  <span aria-hidden="true"> | </span>
                  <a href="tel:+6588510445">+65 8851 0445</a>
                </span>
              )}
              {emailOpen && (
                <a id="drawer-email" href="mailto:support@vpnexues.com">support@vpnexues.com</a>
              )}
            </div>
          )}

          {locationsOpen && (
            <div className={styles.mobileLocations} id="drawer-locations">
              <div className={styles.mobileLocation}>
                <strong>{t('common.citySingapore')}</strong>
                <span>412 Race Course Road, Singapore 218660,</span>
                <span>+91 78100 77636 | +91 8148197842</span>
              </div>
              <div className={styles.mobileLocationRow}>
                <div className={styles.mobileLocation}>
                  <strong>{t('common.citySriLanka')}</strong>
                  <span className={styles.mobileComingSoon}>{t('common.comingSoon')}</span>
                </div>
                <div className={styles.mobileLocation}>
                  <strong>{t('common.cityAustralia')}</strong>
                  <span className={styles.mobileComingSoon}>{t('common.comingSoon')}</span>
                </div>
              </div>
              <p className={styles.mobileLocationGroup}>{t('common.countryIndia')}</p>
              <div className={styles.mobileLocation}>
                <strong>{t('common.cityBangalore')}</strong>
                <span>Sapthagiri Enclave, 38 1st Cross Road, Karamchand Layout, 1st Stage, Lingarajapuram, Bengaluru 560084, Karnataka, India,</span>
                <span>+91 78100 77636 | +91 8148197842</span>
              </div>
              <p className={styles.mobileLocationGroup}>{t('common.stateTamilNadu')}</p>
              <div className={styles.mobileLocation}>
                <strong>{t('common.citySalem')}</strong>
                <span>No 312/11, Siva towers, Perumal Malai Road, Narasothipatti, Salem Tamil Nadu, India, 636004,</span>
                <span>+91 78100 77636 | +91 8148197842</span>
              </div>
              <div className={styles.mobileLocation}>
                <strong>{t('common.cityTirupattur')}</strong>
                <span>No. 8, Don Bosco Nagar, 3rd Floor, Aether E-Bike Showroom Building, Opposite to DBX School, Tirupattur - 635601, Tamil Nadu, India,</span>
                <span>+91 78100 77636 | +91 8148197842</span>
              </div>
            </div>
          )}

          <div className={styles.mobileSocial}>
            <a href="https://www.facebook.com/share/1Cda4sCpk5/" target="_blank" rel="noreferrer" aria-label="Facebook" className={styles.socialFb}><IconFacebook /></a>
            <a href="https://www.instagram.com/vpnexues?igsh=dzViZDMyNXllNTFw" target="_blank" rel="noreferrer" aria-label="Instagram" className={styles.socialIg}><IconInstagram /></a>
            <a href="https://www.linkedin.com/company/vpnexues/" target="_blank" rel="noreferrer" aria-label="LinkedIn" className={styles.socialLi}><IconLinkedin /></a>
          </div>

          <Link to="/shop" className={styles.mobileShopNowBtn} onClick={closeMobileMenu}>
            <IconLeaf className={styles.shopNowLeaf} aria-hidden="true" />
            {t('header.shopFresh')}
            <IconArrowRight className={styles.shopNowArrow} aria-hidden="true" />
          </Link>
        </div>

        {/* Decorative farm footer — cute produce friends + leaves (non-interactive) */}
        <div className={styles.mobileFarmFooter} aria-hidden="true">
          <FarmFooterArt />
        </div>
      </aside>
    </div>
  );
}

/* ── Farm-to-table drawer illustrations ────────────────────────────
   Hand-drawn inline SVG (no remote assets): kawaii produce friends,
   crate, clouds, hills and leaves for the mobile drawer.            */

function KawaiiFace({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse className={styles.faceBlush} cx={-12} cy={4} rx={5.5} ry={3.2} />
      <ellipse className={styles.faceBlush} cx={12} cy={4} rx={5.5} ry={3.2} />
      <circle className={styles.faceEye} cx={-6.5} cy={-3} r={3} />
      <circle className={styles.faceEye} cx={6.5} cy={-3} r={3} />
      <circle className={styles.faceGlint} cx={-5.3} cy={-4.2} r={1.1} />
      <circle className={styles.faceGlint} cx={7.7} cy={-4.2} r={1.1} />
      <path className={styles.faceMouth} d="M-4.5 3.2q4.5 4.4 9 0" />
    </g>
  );
}

function FarmHeroArt() {
  return (
    <svg className={styles.farmArt} viewBox="35 4 249 186" aria-hidden="true">
      {/* soft ground shadow under the crate */}
      <ellipse className={styles.farmArtShadow} cx={164} cy={187} rx={112} ry={6} />
      {/* leafy greens (back left) */}
      <g className={styles.vegLeafy}>
        <circle className={styles.leafy} cx={58} cy={104} r={21} />
        <circle className={styles.leafy} cx={80} cy={92} r={18} />
        <circle className={styles.leafy} cx={94} cy={110} r={15} />
      </g>
      {/* sweet corn (back center) */}
      <g className={styles.vegCorn}>
        <path className={styles.cornHusk} d="M120 118q-12-22 0-38 8 18 4 38z" />
        <path className={styles.cornHusk} d="M142 118q12-22 0-38-8 18-4 38z" />
        <ellipse className={styles.cornBody} cx={131} cy={82} rx={13} ry={30} />
      </g>
      {/* carrot (back right) */}
      <g className={styles.vegCarrot}>
        <path className={styles.carrotTop} d="M238 40q-14-18 0-30 8 12 4 30z" />
        <path className={styles.carrotTopDark} d="M252 42q14-16 2-28-10 10-8 28z" />
        <path className={styles.carrotTop} d="M245 38q-2-18 8-24 4 14-2 24z" />
        <path className={styles.carrotBody} d="M234 40q14 0 24 8l-12 76q-6 5-13 1l-13-72q4-11 14-13z" />
        <path className={styles.carrotRidge} d="M239 58l-4 26M247 62l-3 22" />
        <KawaiiFace x={242} y={64} s={0.72} />
      </g>
      {/* tomato buddy (front left) */}
      <g className={styles.vegTomato}>
        <circle className={styles.tomatoBody} cx={116} cy={122} r={33} />
        <ellipse className={styles.tomatoHighlight} cx={103} cy={106} rx={9} ry={6} transform="rotate(-28 103 106)" />
        <path className={styles.calyx} d="M116 99c-9-3-14 1-15 5 4 1 9 1 12-1 2 3 7 3 11 2 0-4-3-6-8-6z" />
        <rect className={styles.calyx} x={113.5} y={84} width={5} height={13} rx={2.5} />
        <KawaiiFace x={116} y={112} s={1.05} />
      </g>
      {/* mango buddy (front center) */}
      <g className={styles.vegLemon}>
        <ellipse className={styles.mangoBody} cx={176} cy={118} rx={27} ry={23} />
        <ellipse className={styles.mangoBlush} cx={191} cy={111} rx={13} ry={11} />
        <circle className={styles.mangoBody} cx={176} cy={95} r={4.5} />
        <ellipse className={styles.lemonHighlight} cx={164} cy={106} rx={8} ry={5} transform="rotate(-25 164 106)" />
        <KawaiiFace x={176} y={110} s={0.95} />
      </g>
      {/* avocado buddy (front right) */}
      <g className={styles.vegAvocado}>
        <ellipse className={styles.avocadoSkin} cx={238} cy={120} rx={29} ry={32} />
        <ellipse className={styles.avocadoFlesh} cx={238} cy={121} rx={21} ry={24} />
        <KawaiiFace x={238} y={104} s={0.8} />
      </g>
      {/* wooden crate (in front — friends peek out from behind) */}
      <g>
        <rect className={styles.wood} x={46} y={122} width={236} height={17} rx={8} />
        <path className={styles.wood} d="M54 139h192l-9 41q-1.5 6-8.5 6H71.5q-7 0-8.5-6z" />
        <rect className={styles.woodSlat} x={62} y={150} width={176} height={7} rx={3.5} />
        <rect className={styles.woodSlat} x={64} y={165} width={172} height={7} rx={3.5} />
        <rect className={styles.woodHandle} x={74} y={152} width={30} height={12} rx={6} />
        <rect className={styles.woodHandle} x={194} y={152} width={30} height={12} rx={6} />
        <path className={styles.crateLeaf} d="M156 178c-1-6 3-11 10-11 1 6-3 11-10 11z" />
      </g>
    </svg>
  );
}

function FarmFooterArt() {
  return (
    <svg className={styles.farmArt} viewBox="0 0 400 120" aria-hidden="true">
      <path className={styles.hillBack} d="M0 64q70-30 140-14t130-10q70-14 130 8v72H0z" />
      <path className={styles.hillFront} d="M0 88q90-24 180-8t140-6q44-8 80 4v42H0z" />
      {/* broccoli buddy (left) */}
      <g className={styles.vegBroccoli}>
        <rect className={styles.broccoliStalk} x={62} y={82} width={16} height={28} rx={8} />
        <circle className={styles.broccoliHead} cx={54} cy={74} r={15} />
        <circle className={styles.broccoliHead} cx={76} cy={66} r={17} />
        <circle className={styles.broccoliHead} cx={94} cy={78} r={14} />
        <circle className={styles.broccoliHead} cx={72} cy={86} r={15} />
        <KawaiiFace x={74} y={72} s={0.9} />
      </g>
      {/* tomato buddy (right) */}
      <g className={styles.vegTomatoSm}>
        <circle className={styles.tomatoBody} cx={318} cy={88} r={24} />
        <path className={styles.calyx} d="M318 71c-7-2-11 1-11 4 4 1 8 1 11-1 3 2 7 2 11 1 0-3-4-6-11-4z" />
        <KawaiiFace x={318} y={89} s={0.78} />
      </g>
      {/* lemon buddy (right) */}
      <g className={styles.vegLemonSm}>
        <ellipse className={styles.lemonBody} cx={356} cy={98} rx={20} ry={16} />
        <KawaiiFace x={356} y={97} s={0.6} />
      </g>
      {/* scattered leaves */}
      <path className={`${styles.sproutLeaf} ${styles.sproutOne}`} d="M150 40c0-7 6-12 14-12 0 7-6 12-14 12z" />
      <path className={`${styles.sproutLeaf} ${styles.sproutTwo}`} d="M248 28c0-6 5-11 12-11 0 6-5 11-12 11z" />
      <path className={`${styles.sproutLeaf} ${styles.sproutThree}`} d="M204 58c0-6 5-10 11-10 0 6-5 10-11 10z" />
      <path className={`${styles.sproutLeaf} ${styles.sproutOne}`} d="M30 34c0-6 5-10 11-10 0 6-5 10-11 10z" />
    </svg>
  );
}

/* little leafy sprig used as a corner decoration */
function LeafSprig() {
  return (
    <svg viewBox="0 0 36 36" fill="currentColor" aria-hidden="true">
      <path d="M4 32C4 21 12 10 27 7c1 12-8 23-23 25z" />
      <path d="M14 34C16 26 22 19 31 16c-1 9-7 16-17 18z" opacity="0.7" />
      <path d="M2 20C4 13 9 7 17 4c0 8-5 14-15 16z" opacity="0.85" />
    </svg>
  );
}

export function NavItem(props: React.ComponentProps<typeof NavLink>) {
  return <NavLink {...props} />;
}

export function MobileNavItem(props: React.ComponentProps<typeof NavLink>) {
  return <NavLink {...props} />;
}
