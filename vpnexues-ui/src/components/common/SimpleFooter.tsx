import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  IconArrowRight,
  IconFacebook,
  IconInstagram,
  IconLinkedin,
} from './icons';
import styles from './css/SimpleFooter.module.css';

const SOCIAL_LINKS = [
  { label: 'Facebook', href: 'https://www.facebook.com/share/1Cda4sCpk5/', icon: IconFacebook },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/company/vpnexues/', icon: IconLinkedin },
  { label: 'Instagram', href: 'https://www.instagram.com/vpnexues?igsh=dzViZDMyNXllNTFw', icon: IconInstagram },
];

export default function SimpleFooter() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [showNotice, setShowNotice] = useState(false);
  const [sending, setSending] = useState(false);

  function validateEmail(value: string): boolean {
    if (!value.trim()) {
      setError('Please enter your email address.');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setError('Please enter a valid email address.');
      return false;
    }
    setError('');
    return true;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (sending) return;
    if (!validateEmail(email)) return;
    setSending(true);
    import('../../api/contactApi').then(({ submitContactMessage }) =>
      submitContactMessage({
        name: 'Newsletter Subscriber',
        email: email.trim(),
        subject: 'Newsletter subscription',
        message: `Please subscribe ${email.trim()} to the newsletter (via footer).`,
      })
    ).then(() => {
      setShowNotice(true);
      setEmail('');
    }).catch(() => {
      setError('Could not subscribe. Please try again.');
    }).finally(() => {
      setSending(false);
    });
  }

  return (
    <footer className={styles.footerSimple}>
      <div className={styles.footerSimple__container}>
        {/* ── Top Row ── */}
        <div className={styles.footerSimple__top}>
          <Link to="/" className={styles.footerSimple__brand}>
            <img src="https://res.cloudinary.com/eqjshlur/image/upload/v1790001831/vpnexues/old/site-assets/logo/vp-logo.svg" alt="VPNexues logo" className={styles.footerSimple__logo} />
            <span className={styles.footerSimple__brandName}>
              <strong>VPNexues</strong>
              <small>விவசாயம் காப்போம்</small>
            </span>
          </Link>

          <div className={styles.footerSimple__newsletterTitle}>
            <h3>Subscribe to Our Newsletter to Get More Updates</h3>
          </div>

          <form onSubmit={handleSubmit} className={styles.footerSimple__form}>
            <div className={styles.footerSimple__formInner}>
              <svg className={styles.footerSimple__mailIcon} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="4" width="20" height="16" rx="2"/>
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
              </svg>
              <input
                type="email"
                name="email"
                placeholder="Your email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(''); }}
                className={styles.footerSimple__input}
                aria-label="Email address"
                required
              />
              <button type="submit" className={styles.footerSimple__submit} disabled={sending}>
                {sending ? '...' : 'Subscribe'} <IconArrowRight className={styles.footerSimple__submitIcon} />
              </button>
            </div>
            {error && <p className={styles.footerSimple__error}>{error}</p>}
            {showNotice && !error && (
              <p className={styles.footerSimple__notice}>Thank you for subscribing!</p>
            )}
          </form>
        </div>

        {/* ── Divider ── */}
        <div className={styles.footerSimple__divider} />

        {/* ── Bottom Row ── */}
        <div className={styles.footerSimple__bottom}>
          <p className={styles.footerSimple__copyright}>
            &copy; 2026 VPNexues Import &amp; Export. All Rights Reserved
          </p>

          <div className={styles.footerSimple__socials}>
            {SOCIAL_LINKS.map((s) => (
              <a key={s.label} href={s.href} target="_blank" rel="noreferrer" aria-label={s.label} className={styles.footerSimple__socialLink}>
                <s.icon />
              </a>
            ))}
          </div>

          <div className={styles.footerSimple__payments}>
            <div className={styles.footerSimple__paymentIcons}>
              <span className={styles.footerSimple__paymentCard} style={{ background: '#fff' }}>
                <svg viewBox="0 0 48 32" width="40" height="26"><rect width="48" height="32" rx="4" fill="#fff"/><text x="24" y="20" textAnchor="middle" fontSize="13" fontWeight="800" fontFamily="Arial,sans-serif" fill="#1a1f71" letterSpacing="0.5">VISA</text></svg>
              </span>
              <span className={styles.footerSimple__paymentCard}>
                <svg viewBox="0 0 48 32" width="40" height="26"><rect width="48" height="32" rx="4" fill="#252525"/><circle cx="19" cy="16" r="9" fill="#eb001b"/><circle cx="29" cy="16" r="9" fill="#f79e1b"/><path d="M24 9.3a9 9 0 010 13.4 9 9 0 000-13.4z" fill="#ff5f00"/></svg>
              </span>
              <span className={styles.footerSimple__paymentCard} style={{ background: '#006fcf' }}>
                <svg viewBox="0 0 48 32" width="40" height="26"><rect width="48" height="32" rx="4" fill="#006fcf"/><text x="24" y="20" textAnchor="middle" fontSize="10" fontWeight="800" fontFamily="Arial,sans-serif" fill="#fff" letterSpacing="0.3">AMEX</text></svg>
              </span>
              <span className={styles.footerSimple__paymentCard} style={{ background: '#fff' }}>
                <svg viewBox="0 0 48 32" width="40" height="26"><rect width="48" height="32" rx="4" fill="#fff"/><text x="24" y="14" textAnchor="middle" fontSize="7" fontWeight="800" fontFamily="Arial,sans-serif" fill="#003087">Pay</text><text x="24" y="24" textAnchor="middle" fontSize="7" fontWeight="800" fontFamily="Arial,sans-serif" fill="#009cde">Pal</text></svg>
              </span>
              <span className={styles.footerSimple__paymentCard} style={{ background: '#fff' }}>
                <svg viewBox="0 0 48 32" width="40" height="26"><rect width="48" height="32" rx="4" fill="#fff"/><text x="24" y="20" textAnchor="middle" fontSize="10" fontWeight="800" fontFamily="Arial,sans-serif" fill="#2e2e8a" letterSpacing="0.3">RuPay</text></svg>
              </span>
              <span className={styles.footerSimple__paymentCard} style={{ background: '#fff' }}>
                <svg viewBox="0 0 48 32" width="40" height="26"><rect width="48" height="32" rx="4" fill="#fff"/><text x="24" y="20" textAnchor="middle" fontSize="12" fontWeight="800" fontFamily="Arial,sans-serif" fill="#097969" letterSpacing="0.3">UPI</text></svg>
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
