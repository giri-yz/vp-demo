import { Link } from 'react-router-dom';
import {
  IconFacebook,
  IconInstagram,
  IconLinkedin,
} from './icons';
import { useLanguage } from '../../i18n/LanguageContext';
import styles from './css/AboutPageFooter.module.css';

const SOCIAL_LINKS = [
  { label: 'Facebook', href: 'https://www.facebook.com/share/1Cda4sCpk5/', icon: IconFacebook },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/company/vpnexues/', icon: IconLinkedin },
  { label: 'Instagram', href: 'https://www.instagram.com/vpnexues?igsh=dzViZDMyNXllNTFw', icon: IconInstagram },
];

export default function AboutPageFooter() {
  const { t } = useLanguage();

  const USEFUL_LINKS = [
    { label: t('footer.aboutVpnexues'), to: '/about' },
    { label: t('footer.ourTeam'), to: '/team' },
    { label: t('footer.contactUs'), to: '/contact' },
    { label: t('footer.b2bEnquiries'), to: '/pricing/b2b' },
    { label: t('nav.faqs'), to: '/faq' },
    { label: t('footer.pricingPlans'), to: '/pricing/small-box' },
  ];

  const SERVICES = [
    { label: t('footer.organicVegetables'), to: '/shop' },
    { label: t('footer.tropicalFruits'), to: '/shop' },
    { label: t('footer.premiumSpices'), to: '/shop' },
    { label: t('footer.organicGrains'), to: '/shop' },
    { label: t('footer.foodIngredients'), to: '/shop' },
  ];

  const DIRECTORS = [
    { name: 'Pradeep Kumar', role: t('footer.director'), image: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001882/vpnexues/old/site-assets/preed-bg.jpg' },
    { name: 'Nageswaran Duraiswamy', role: t('footer.director'), image: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001842/vpnexues/old/site-assets/nag-bg.jpg' },
  ];

  return (
    <>
      <footer className={styles.aboutFooter}>
        <div className={styles.aboutFooter__decoration} aria-hidden="true" />
        <div className={styles.aboutFooter__container}>
          <div className={styles.aboutFooter__main}>
            <div className={styles.aboutFooter__brand}>
              <Link to="/" className={styles.aboutFooter__logo}>
                <img src="https://res.cloudinary.com/eqjshlur/image/upload/v1790001831/vpnexues/old/site-assets/logo/vp-logo.svg" alt="VPNexues logo" />
                <span className={styles.aboutFooter__brandName}>
                  <strong>VPNexues</strong>
                  <small>விவசாயம் காப்போம்</small>
                </span>
              </Link>
              <p className={styles.aboutFooter__description}>
                {t('footer.homeDesc')}
              </p>
            </div>

            <div className={styles.aboutFooter__links}>
              <h5 className={styles.aboutFooter__heading}>{t('footer.usefulLinks')}</h5>
              <ul className={styles.aboutFooter__list}>
                {USEFUL_LINKS.map((link) => (
                  <li key={link.to}>
                    <Link to={link.to} className={styles.aboutFooter__link}>{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className={styles.aboutFooter__links}>
              <h5 className={styles.aboutFooter__heading}>{t('footer.ourServices')}</h5>
              <ul className={styles.aboutFooter__list}>
                {SERVICES.map((svc, i) => (
                  <li key={i}>
                    <Link to={svc.to} className={styles.aboutFooter__link}>{svc.label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className={styles.aboutFooter__directors}>
              <h5 className={styles.aboutFooter__heading}>{t('footer.directors')}</h5>
              <div className={styles.aboutFooter__directorsList}>
                {DIRECTORS.map((d) => (
                  <div key={d.name} className={styles.aboutFooter__director}>
                    <div className={styles.aboutFooter__directorImage}>
                      <img src={d.image} alt={d.name} />
                    </div>
                    <div className={styles.aboutFooter__directorInfo}>
                      <strong>{d.name}</strong>
                      <span>{d.role}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className={styles.aboutFooter__bottom}>
          <div className={styles.aboutFooter__bottomInner}>
            <p className={styles.aboutFooter__copyright}>
              {t('footer.copyright')}
            </p>
            <p className={styles.aboutFooter__tagline}>{t('footer.freshThoughtfully')}</p>
            <div className={styles.aboutFooter__socials}>
              {SOCIAL_LINKS.map((s) => (
                <a key={s.label} href={s.href} target="_blank" rel="noreferrer" aria-label={s.label} className={styles.aboutFooter__socialIcon}>
                  <s.icon />
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
