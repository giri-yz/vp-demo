import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { IconClose } from './icons';
import { useLanguage } from '../../i18n/LanguageContext';
import styles from './css/CategoriesPopup.module.css';

interface CategoriesPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate?: () => void;
}

export default function CategoriesPopup({ isOpen, onClose, onNavigate }: CategoriesPopupProps) {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const sheetRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);

  const CATEGORIES = [
    { label: t('nav.shop'), icon: '🥕', to: '/shop' },
    { label: t('nav.smallBox'), icon: '🎁', to: '/pricing/small-box' },
    { label: t('nav.bigBox'), icon: '📦', to: '/pricing/big-box' },
    { label: t('nav.b2b'), icon: '🤝', to: '/pricing/b2b' },
  ];

  useEffect(() => {
    if (isOpen) {
      previousFocus.current = document.activeElement as HTMLElement;
      document.body.style.overflow = 'hidden';
      closeButtonRef.current?.focus();
    } else {
      document.body.style.overflow = '';
      previousFocus.current?.focus();
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSelect = (to: string) => {
    if (onNavigate) {
      onNavigate();
    }
    document.body.style.overflow = '';
    navigate(to);
  };

  return (
    <div
      className={styles.overlay}
      onClick={onClose}
      role="presentation"
    >
      <div
        ref={sheetRef}
        className={styles.sheet}
        role="dialog"
        aria-modal="true"
        aria-label="Browse categories"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.header}>
          <div className={styles.brand}>
            <img
              src="https://res.cloudinary.com/eqjshlur/image/upload/v1790001831/vpnexues/old/site-assets/logo/vp-logo.svg"
              alt="VPNexues logo"
              className={styles.logo}
            />
            <div className={styles.brandText}>
              <strong className={styles.brandName}>VPNexues</strong>
              <small className={styles.brandTag}>விவசாயம் காப்போம்</small>
            </div>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Close categories"
          >
            <IconClose />
          </button>
        </div>

        <div className={styles.list}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.label}
              type="button"
              className={styles.card}
              onClick={() => handleSelect(cat.to)}
            >
              <span className={styles.cardIcon}>{cat.icon}</span>
              <span className={styles.cardLabel}>{cat.label}</span>
              <svg
                className={styles.chevron}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m9 18 6-6-6-6" />
              </svg>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
