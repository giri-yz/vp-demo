import { useState } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { IconClose } from '../common/icons';
import styles from './css/CouponSheet.module.css';

interface Props {
  appliedCode: string;
  discount: number;
  message: string;
  onApply: (code: string) => Promise<void>;
}

export default function CouponSheet({ appliedCode, discount, message, onApply }: Props) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState('');
  const [applying, setApplying] = useState(false);

  async function handleApply() {
    if (!code.trim()) return;
    setApplying(true);
    try {
      await onApply(code.trim());
    } finally {
      setApplying(false);
    }
  }

  return (
    <>
      <button type="button" className={`${styles.strip} ${discount > 0 ? styles.stripApplied : ''}`} onClick={() => setOpen(true)}>
        {discount > 0
          ? t('checkout.couponApplied').replace('{code}', appliedCode).replace('{amount}', discount.toFixed(2))
          : t('checkout.haveCoupon')}
      </button>

      {open && (
        <div className={styles.overlay} onClick={() => setOpen(false)}>
          <div className={styles.sheet} onClick={(e) => e.stopPropagation()}>
            <div className={styles.sheetHeader}>
              <h3>{t('checkout.applyCoupon')}</h3>
              <button type="button" aria-label={t('common.closeAria')} onClick={() => setOpen(false)}>
                <IconClose />
              </button>
            </div>
            <div className={styles.row}>
              <input
                autoFocus
                placeholder={t('checkout.enterCouponCode')}
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
              <button type="button" className="btn btn-primary" disabled={applying} onClick={handleApply}>
                {applying ? t('checkout.applying') : t('checkout.apply')}
              </button>
            </div>
            {message && <p className={styles.message}>{message}</p>}
          </div>
        </div>
      )}
    </>
  );
}
