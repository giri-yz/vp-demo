import { useState } from 'react';
import { Link } from 'react-router-dom';import { IconArrowRight, IconFacebook, IconInstagram, IconLinkedin } from './icons';
import { useLanguage } from '../../i18n/LanguageContext';

interface FooterProps { isHome?: boolean; isAbout?: boolean; }

export default function Footer({ isHome, isAbout }: FooterProps) {
  const { t, lang } = useLanguage();
  const [email, setEmail] = useState('');
  const [err, setErr] = useState('');
  const [ok, setOk] = useState(false);
  const [sending, setSending] = useState(false);
  const handleSub = (e: React.FormEvent) => {
    e.preventDefault();
    if (sending) return;
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setErr(t('news.invalidEmail')); return; }
    setErr('');
    setSending(true);
    import('../../api/contactApi').then(({ submitContactMessage }) =>
      submitContactMessage({
        name: 'Newsletter Subscriber',
        email: email.trim(),
        subject: 'Newsletter subscription',
        message: `Please subscribe ${email.trim()} to the newsletter (via footer).`,
      })
    ).then(() => {
      setOk(true);
      setEmail('');
    }).catch(() => {
      setErr(t('news.subscribeFailed'));
    }).finally(() => {
      setSending(false);
    });
  };
  const shared = (
    <footer className={`common-footer ${lang === 'ta' ? 'is-tamil' : ''}`} style={{ background: '#2d652f', color: '#fff', fontFamily: 'inherit' }}>
      <style>{`
      .common-footer.is-tamil .footer-mobile-row { display: grid; grid-template-columns: minmax(220px, 0.8fr) minmax(0, 2fr); gap: 48px; align-items: center; }
      .common-footer.is-tamil .footer-mobile-sub { display: flex; flex-direction: column; align-items: flex-start; gap: 12px; flex-wrap: wrap; flex: 1; justify-content: flex-start; }
      .common-footer.is-tamil .footer-mobile-sub strong { white-space: normal; font-size: 20px; word-break: normal; overflow-wrap: anywhere; line-height: 1.3; }
      .common-footer.is-tamil .newsletter-row { max-width: 640px; width: 100%; }
      @media (max-width: 767px) {
          .footer-shared { padding: 32px 16px 90px !important; }
          .footer-shared-grid { grid-template-columns: 1fr 1fr !important; gap: 20px 16px !important; }
          .footer-shared-brand { grid-column: 1 / -1; }
          div[class*="_root_"] { padding-bottom: 0 !important; }
        }
      `}</style>
      <div className="footer-shared" style={{ maxWidth: '100%', margin: '0 auto', padding: '50px 40px 40px' }}>
        <div className="footer-shared-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px,1fr))', gap: 40, alignItems: 'start' }}>
          <div className="footer-shared-brand">
            <Link to="/" style={{ textDecoration: 'none', color: '#fff', display: 'flex', alignItems: 'center', gap: 10 }}>
              <img src="https://res.cloudinary.com/eqjshlur/image/upload/v1790001831/vpnexues/old/site-assets/logo/vp-logo.svg" alt="VPNexues" width={44} height={44} style={{ borderRadius: 10 }} />
              <span style={{ fontWeight: 700, fontSize: 20, letterSpacing: 0.5, lineHeight: 1.2 }}><strong>VPNexues</strong><br/><small style={{ fontWeight: 400, fontSize: 13, opacity: 0.85 }}>விவசாயம் காப்போம்</small></span>
            </Link>
            <p style={{ marginTop: 14, fontSize: 14, lineHeight: 1.6, opacity: 0.9, maxWidth: 260 }}>{t('footer.homeDesc')}</p>
          </div>
          <div>
            <h4 style={{ fontSize: 12, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 16, opacity: 1, fontWeight: 700, color: '#fff' }}>{t('footer.company')}</h4>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 14, opacity: 0.85 }}>
              <Link to="/about" style={{ color: '#e8ede6', textDecoration: 'none' }}>{t('nav.aboutUs')}</Link>
              <Link to="/team" style={{ color: '#e8ede6', textDecoration: 'none' }}>{t('footer.ourFarmers')}</Link>
              <Link to="/news" style={{ color: '#e8ede6', textDecoration: 'none' }}>{t('footer.newsUpdates')}</Link>
              <Link to="/careers" style={{ color: '#e8ede6', textDecoration: 'none' }}>{t('nav.careers')}</Link>
              <Link to="/contact" style={{ color: '#e8ede6', textDecoration: 'none' }}>{t('footer.contactUs')}</Link>
            </nav>
          </div>
          <div>
            <h4 style={{ fontSize: 12, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 16, opacity: 1, fontWeight: 700, color: '#fff' }}>{t('nav.shop')}</h4>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 14, opacity: 0.85 }}>
              <Link to="/shop" style={{ color: '#e8ede6', textDecoration: 'none' }}>{t('footer.allProducts')}</Link>
              <Link to="/shop?category=Vegetables" style={{ color: '#e8ede6', textDecoration: 'none' }}>{t('footer.vegetables')}</Link>
              <Link to="/shop?category=Fruits" style={{ color: '#e8ede6', textDecoration: 'none' }}>{t('footer.fruits')}</Link>
              <Link to="/pricing/small-box" style={{ color: '#e8ede6', textDecoration: 'none' }}>{t('nav.smallBox')}</Link>
              <Link to="/pricing/big-box" style={{ color: '#e8ede6', textDecoration: 'none' }}>{t('nav.bigBox')}</Link>
              <Link to="/shop?category=Groceries" style={{ color: '#e8ede6', textDecoration: 'none' }}>{t('footer.comboOffers')}</Link>
            </nav>
          </div>
          <div>
            <h4 style={{ fontSize: 12, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 16, opacity: 1, fontWeight: 700, color: '#fff' }}>{t('nav.support')}</h4>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 14, opacity: 0.85 }}>
              <Link to="/help-support" style={{ color: '#e8ede6', textDecoration: 'none' }}>{t('footer.helpCentre')}</Link>
              <Link to="/faq" style={{ color: '#e8ede6', textDecoration: 'none' }}>{t('nav.faqs')}</Link>
              <Link to="/contact" style={{ color: '#e8ede6', textDecoration: 'none' }}>{t('footer.shippingDelivery')}</Link>
              <Link to="/faq" style={{ color: '#e8ede6', textDecoration: 'none' }}>{t('footer.returnsRefunds')}</Link>
              <Link to="/pricing/b2b" style={{ color: '#e8ede6', textDecoration: 'none' }}>{t('footer.b2bSupply')}</Link>
              <Link to="/privacy" style={{ color: '#e8ede6', textDecoration: 'none' }}>{t('footer.privacy')}</Link>
            </nav>
          </div>
          <div>
            <h4 style={{ fontSize: 12, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 16, opacity: 1, fontWeight: 700, color: '#fff' }}>{t('footer.directors')}</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <Link to="/team" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none', color: '#fff' }}>
                <img src="https://res.cloudinary.com/eqjshlur/image/upload/v1790001882/vpnexues/old/site-assets/preed-bg.jpg" alt="Pradeep Kumar" width={85} height={110} style={{ borderRadius: 8, objectFit: 'cover', border: '2px solid rgba(255,255,255,0.15)' }} />
                <div><div style={{ fontWeight: 700, fontSize: 14 }}>Pradeep Kumar</div><div style={{ fontSize: 12, opacity: 0.8 }}>{t('footer.director')}</div></div>
              </Link>
              <Link to="/team" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none', color: '#fff' }}>
                <img src="https://res.cloudinary.com/eqjshlur/image/upload/v1790001842/vpnexues/old/site-assets/nag-bg.jpg" alt="Nageswaran Duraiswamy" width={85} height={110} style={{ borderRadius: 8, objectFit: 'cover', border: '2px solid rgba(255,255,255,0.15)' }} />
                <div><div style={{ fontWeight: 700, fontSize: 14 }}>Nageswaran Duraiswamy</div><div style={{ fontSize: 12, opacity: 0.8 }}>{t('footer.director')}</div></div>
              </Link>
            </div>
          </div>
        </div>
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', marginTop: 40, paddingTop: 18, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, fontSize: 13, opacity: 0.8 }}>
          <span>{t('footer.copyright')}</span>
          <span style={{ fontStyle: 'italic', opacity: 0.9 }}>{t('footer.freshThoughtfully')}</span>
        </div>
      </div>
    </footer>
  );
  if (isHome || isAbout) return shared;
  return (
    <footer className={`common-footer ${lang === 'ta' ? 'is-tamil' : ''}`} style={{ background: '#2d652f', color: '#fff', fontFamily: 'inherit', overflowX: 'hidden', paddingBottom: 'calc(25px + env(safe-area-inset-bottom, 0px))' }}>
      <style>{`
      .common-footer .footer-mobile-row { display: flex; align-items: center; justify-content: space-between; gap: 24px; flex-wrap: wrap; padding-bottom: 22px; border-bottom: 1px solid rgba(255,255,255,0.1); }
      .common-footer .footer-mobile-sub { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; flex: 1; justify-content: flex-end; }
      .common-footer .footer-mobile-sub strong { white-space: normal; font-size: 20px; }
      .common-footer .newsletter-row { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
      .common-footer .newsletter-input { flex: 1; min-width: 120px; background: transparent; border: none; outline: none; font-size: 13px; }
      .common-footer .newsletter-button { flex-shrink: 0; white-space: nowrap; padding: 6px 14px; border-radius: 20px; border: none; background: #3a7d44; color: #fff; font-weight: 600; cursor: pointer; font-size: 13px; display: inline-flex; align-items: center; gap: 4px; }
      .common-footer .footer-mobile-bottom { display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap; padding-top: 16px; font-size: 12px; opacity: 0.8; }
      .common-footer .footer-mobile-hide-links { display: flex; gap: 14px; align-items: center; flex-wrap: wrap; }
      .common-footer .footer-mobile-hide-links a { white-space: nowrap; }
      .common-footer .footer-shared { max-width: 100%; margin: 0 auto; padding: 50px 40px 40px; }
      .common-footer.is-tamil .footer-mobile-row { display: grid; grid-template-columns: minmax(220px, 0.7fr) minmax(0, 1.7fr); gap: 48px; align-items: center; padding-bottom: 22px; border-bottom: 1px solid rgba(255,255,255,0.1); }
      .common-footer.is-tamil .footer-mobile-sub { display: flex; flex-direction: column; align-items: flex-start; gap: 22px; flex-wrap: wrap; flex: 1; justify-content: flex-start; }
      .common-footer.is-tamil .footer-mobile-sub strong { white-space: normal; font-size: 20px; word-break: normal; overflow-wrap: break-word; line-height: 1.3; max-width: 100%; }
      @media (max-width: 767px) {
        .common-footer .footer-mobile-row { flex-direction: column !important; align-items: flex-start !important; gap: 16px !important; }
        .common-footer .footer-mobile-sub { justify-content: flex-start !important; gap: 10px !important; flex-wrap: wrap !important; }
        .common-footer .footer-mobile-sub strong { white-space: normal !important; font-size: 16px !important; }
        .common-footer .footer-mobile-hide-links { display: none !important; }
        .common-footer .footer-mobile-bottom { flex-direction: column !important; align-items: flex-start !important; gap: 8px !important; }
        div[class*="_root_"] { padding-bottom: 0 !important; }
        .common-footer .footer-container { padding-left: 16px !important; padding-right: 16px !important; }
      }
      .common-footer.is-tamil .footer-mobile-bottom { display: flex; align-items: center; justify-content: space-between; gap: 14px 24px; flex-wrap: wrap; padding-top: 16px; font-size: 12px; opacity: 0.8; }
      .common-footer.is-tamil .footer-mobile-bottom > div { display: flex; gap: 14px; align-items: center; flex-wrap: wrap; }
      `}</style>
      <div className="footer-container" style={{ maxWidth: '100%', margin: '0 auto', padding: '28px 40px 22px' }}>
        <div className="footer-mobile-row" style={lang === 'ta' ? { display: 'grid', gridTemplateColumns: 'minmax(220px, 0.7fr) minmax(0, 1.7fr)', gap: 48, alignItems: 'center', paddingBottom: 22, borderBottom: '1px solid rgba(255,255,255,0.1)' } : { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap', paddingBottom: 22, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 6, textDecoration: 'none', color: '#fff' }}>
            <img src="https://res.cloudinary.com/eqjshlur/image/upload/v1790001831/vpnexues/old/site-assets/logo/vp-logo.svg" alt="VPNexues" width={36} height={36} style={{ borderRadius: 8 }} />
            <span style={{ fontWeight: 700, fontSize: 16, letterSpacing: 0.2, lineHeight: 1.15 }}><strong>VPNexues</strong><br/><small style={{ fontWeight: 400, fontSize: 11, opacity: 0.8, display: 'block', marginTop: 0 }}>விவசாயம் காப்போம்</small></span>
          </Link>
          <div className="footer-mobile-sub" style={lang === 'ta' ? { display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 22, flexWrap: 'wrap', flex: 1, justifyContent: 'flex-start' } : { display: 'flex', alignItems: 'center', gap: 150, flexWrap: 'wrap', flex: 1, justifyContent: 'flex-end' }}>
            <strong style={lang === 'ta' ? { fontSize: 20, whiteSpace: 'normal', wordBreak: 'normal', overflowWrap: 'anywhere', lineHeight: 1.3, maxWidth: '100%' } : { fontSize: 20, whiteSpace: 'nowrap', marginRight: 12 }}>{t('footer.subscribeNewsletter') || 'Subscribe to Our Newsletter to Get More Updates'}</strong>
            <form onSubmit={handleSub} style={lang === 'ta' ? { display: 'flex', gap: 8, alignItems: 'center', background: '#fff', borderRadius: 30, padding: '6px 10px 6px 14px', flexWrap: 'wrap', maxWidth: 640, width: '100%' } : { display: 'flex', gap: 28, alignItems: 'flex-end', background: '#fff', borderRadius: 30, padding: '6px 10px 6px 14px' }}>
              <input type="email" placeholder={t('footer.emailPlaceholder') || 'Your email'} value={email} onChange={e => setEmail(e.target.value)} style={lang === 'ta' ? { border: 'none', outline: 'none', fontSize: 13, minWidth: 0, flex: 1, background: 'transparent', whiteSpace: 'normal' } : { border: 'none', outline: 'none', fontSize: 13, minWidth: 180, background: 'transparent' }} required />
              <button type="submit" disabled={sending} style={lang === 'ta' ? { padding: '6px 14px', borderRadius: 20, border: 'none', background: '#3a7d44', color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap', flexShrink: 0, opacity: sending ? 0.6 : 1 } : { padding: '6px 14px', borderRadius: 20, border: 'none', background: '#3a7d44', color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 4, opacity: sending ? 0.6 : 1 }}>
                {sending ? '...' : (t('footer.subscribe') || 'Subscribe')} <IconArrowRight style={{ width: 12, height: 12 }} />
              </button>
            </form>
          </div>
        </div>
        {ok && <p style={{ color: '#3a7d44', marginTop: 4, fontSize: 13 }}>{t('footer.thankYouSubscribe')}</p>}
        {err && <p style={{ color: '#c00', marginTop: 4, fontSize: 13 }}>{err}</p>}
        <div className="footer-mobile-bottom" style={lang === 'ta' ? { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14, flexWrap: 'wrap', paddingTop: 16, fontSize: 12, opacity: 0.8 } : { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', paddingTop: 16, fontSize: 12, opacity: 0.8 }}>
          <span>{t('footer.copyright')}</span>
          <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
            <a href="https://www.facebook.com/share/1Cda4sCpk5/" aria-label="Facebook" style={{ color: '#fff', opacity: 0.9 }}><IconFacebook /></a>
            <a href="https://www.linkedin.com/company/vpnexues/" aria-label="LinkedIn" style={{ color: '#fff', opacity: 0.9 }}><IconLinkedin /></a>
            <a href="https://www.instagram.com/vpnexues?igsh=7fxWQMvZLQ%3D%3D" aria-label="Instagram" style={{ color: '#fff', opacity: 0.9 }}><IconInstagram /></a>
          </div>
          <div className="footer-mobile-hide-links" style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
            <Link to="/privacy" style={{ color: '#fff', textDecoration: 'none', fontSize: 12, opacity: 0.85 }}>{t('footer.privacyPolicy')}</Link>
            <Link to="/terms" style={{ color: '#fff', textDecoration: 'none', fontSize: 12, opacity: 0.85 }}>{t('footer.termsOfService')}</Link>
            <Link to="/contact" style={{ color: '#fff', textDecoration: 'none', fontSize: 12, opacity: 0.85 }}>{t('footer.shippingReturns')}</Link>
            <span style={{ border: '1px solid rgba(255,255,255,0.25)', borderRadius: 20, padding: '4px 10px', fontSize: 11, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 6, color: '#fff' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><rect x="3" y="11" width="18" height="10" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
              {t('footer.secureCheckout')}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
