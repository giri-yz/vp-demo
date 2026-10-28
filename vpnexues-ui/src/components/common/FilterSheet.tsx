import { useEffect, useState } from 'react';
import { IconClose } from './icons';
import { useLanguage } from '../../i18n/LanguageContext';
import styles from './css/FilterSheet.module.css';

export interface FilterSection {
  id?: string;
  label: string;
  items: { value: string; label: string; icon?: string }[];
  activeValues: string[];
  onToggle: (value: string) => void;
}

interface FilterSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onClear: () => void;
  onApply: () => void;
  sections: FilterSection[];
  quickLinks?: { value: string; label: string; icon?: string; active?: boolean; onClick: () => void }[];
  anchorRef?: React.RefObject<HTMLElement | null>;
}

export default function FilterSheet({ isOpen, onClose, onClear, onApply, sections, quickLinks, anchorRef }: FilterSheetProps) {
  const { t } = useLanguage();
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const [arrowLeft, setArrowLeft] = useState(190);

  useEffect(() => {
    if (!isOpen || !anchorRef?.current || window.innerWidth < 768) { setPos(null); return; }
    const update = () => {
      const r = anchorRef.current!.getBoundingClientRect();
      const w = 380;
      const top = r.bottom + 10;
      let left = r.left + r.width / 2 - w / 2;
      left = Math.max(16, Math.min(left, window.innerWidth - w - 16));
      setPos({ top, left });
      setArrowLeft(r.left + r.width / 2 - left);
    };
    update();
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    return () => { window.removeEventListener('resize', update); window.removeEventListener('scroll', update, true); };
  }, [isOpen, anchorRef]);

  if (!isOpen) return null;

  const isAnchored = !!pos && typeof window !== 'undefined' && window.innerWidth >= 768;
  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={styles.sheet}
        data-anchored={isAnchored ? 'true' : 'false'}
        onClick={(e) => e.stopPropagation()}
        style={isAnchored ? { position: 'fixed', top: pos!.top, left: pos!.left, right: 'auto', bottom: 'auto', margin: 0, maxHeight: '80vh' } as React.CSSProperties : undefined}
      >
        {isAnchored && <div aria-hidden style={{ position: 'absolute', top: -7, left: arrowLeft - 7, width: 14, height: 14, background: '#fff', borderLeft: '1px solid #e8ece7', borderTop: '1px solid #e8ece7', transform: 'rotate(45deg)', zIndex: 1 }} />}
        <div className={styles.handle} />
        <div className={styles.header}>
          <h3 className={styles.title}>{t('shop.filterTitle')}</h3>
          <div className={styles.headerActions}>
            <button type="button" className={styles.clearBtn} onClick={onClear}>{t('shop.clearFilters')}</button>
            <button type="button" className={styles.closeBtn} aria-label={t('shop.closeFilters')} onClick={onClose}>
              <IconClose />
            </button>
          </div>
        </div>

        <div className={styles.sectionsGrid}>
          {sections.map((section) => {
            const sectionId = section.id || section.label.toLowerCase();
            const isSingleRow = sectionId === 'preference' || sectionId === 'category' || sectionId === 'price';
            return (
            <div key={section.id || section.label} className={styles.section} data-section={sectionId}>
              <h4 className={styles.sectionLabel}>{section.label}</h4>
              <div className={`${styles.chips} ${isSingleRow ? styles.chipsSingleRow : ''}`}>
                {section.items.map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    className={`${styles.chip} ${section.activeValues.includes(item.value) ? styles.chipActive : ''}`}
                    onClick={() => section.onToggle(item.value)}
                  >
                    {item.icon && <span className={styles.chipIcon}>{item.icon}</span>}
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
            );
          })}

          {quickLinks && quickLinks.length > 0 && (
            <div className={`${styles.section} ${styles.quickLinksSection}`}>
              <h4 className={styles.sectionLabel}>{t('shop.quickLinks')}</h4>
              <div className={styles.chips}>
                {quickLinks.map((link) => (
                  <button
                    key={link.value}
                    type="button"
                    className={`${styles.chip} ${styles.linkChip} ${link.active ? styles.linkChipActive : ''}`}
                    onClick={link.onClick}
                  >
                    {link.icon && <span className={styles.chipIcon}>{link.icon}</span>}
                    {link.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <button type="button" className={styles.applyBtn} onClick={onApply}>
          {t('shop.applyFilter')}
        </button>
      </div>
    </div>
  );
}
