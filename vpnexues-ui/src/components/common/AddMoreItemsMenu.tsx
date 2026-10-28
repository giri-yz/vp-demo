import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../i18n/LanguageContext';
import styles from './css/AddMoreItemsMenu.module.css';

const NAV_ITEMS = [
  { icon: '🥦', key: 'nav.shop', descKey: 'common.browseAllProducts', href: '/shop' },
  { icon: '📦', key: 'shop.smallBox', descKey: 'common.curatedOrganicBox', href: '/pricing/small-box' },
  { icon: '🛒', key: 'shop.bigBox', descKey: 'common.familySizeFreshBox', href: '/pricing/big-box' },
  { icon: '🤝', key: 'shop.b2b', descKey: 'common.bulkOrdersBusinesses', href: '/pricing/b2b' },
];

export default function AddMoreItemsMenu() {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [open]);

  useEffect(() => {
    if (open && triggerRef.current) {
      triggerRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [open]);

  return (
    <div className={styles.wrap} ref={wrapRef}>
      <button ref={triggerRef} type="button" className={styles.trigger} onClick={() => setOpen((v) => !v)}>
        <span className={styles.triggerPlus}>+</span>
        <span>{t('common.addMoreItems')}</span>
        <span className={`${styles.triggerArrow} ${open ? styles.triggerArrowOpen : ''}`}>&#8594;</span>
      </button>
      {open && (
        <>
          <div className={styles.backdrop} onClick={() => setOpen(false)} />
          <div className={styles.popover} role="menu">
            <div className={styles.popoverHeader}>{t('common.navigateTo')}</div>
            {NAV_ITEMS.map((item) => (
              <Link key={item.key} to={item.href} className={styles.popoverItem} onClick={() => setOpen(false)}>
                <span className={styles.popoverIcon}>{item.icon}</span>
                <span className={styles.popoverText}>
                  <span className={styles.popoverLabel}>{t(item.key)}</span>
                  <span className={styles.popoverDesc}>{t(item.descKey)}</span>
                </span>
                <span className={styles.popoverChevron}>&rsaquo;</span>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
