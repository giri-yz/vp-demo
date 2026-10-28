import { useState } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import styles from './css/TipSelector.module.css';

const CHIPS = [1, 2, 5];

interface Props {
  value: number;
  onChange: (value: number) => void;
}

export default function TipSelector({ value, onChange }: Props) {
  const { t } = useLanguage();
  const [customOpen, setCustomOpen] = useState(false);

  return (
    <div>
      <div className={styles.chips}>
        {CHIPS.map((amount) => (
          <button
            key={amount}
            type="button"
            className={`${styles.chip} ${!customOpen && value === amount ? styles.chipSelected : ''}`}
            onClick={() => {
              setCustomOpen(false);
              onChange(amount);
            }}
          >
            +{amount.toFixed(2)}
          </button>
        ))}
        <button
          type="button"
          className={`${styles.chip} ${customOpen ? styles.chipSelected : ''}`}
          onClick={() => setCustomOpen(true)}
        >
          {t('checkout.customTip')}
        </button>
        <button
          type="button"
          className={`${styles.chip} ${!customOpen && value === 0 ? styles.chipSelected : ''}`}
          onClick={() => {
            setCustomOpen(false);
            onChange(0);
          }}
        >
          {t('checkout.noTip')}
        </button>
        {customOpen && (
          <div className={styles.customInput}>
            <input
              type="number"
              min="0"
              step="0.5"
              autoFocus
              value={value || ''}
              placeholder="0.00"
              onChange={(e) => onChange(Math.max(0, Number(e.target.value) || 0))}
            />
          </div>
        )}
      </div>
      <p className={styles.note}>{t('checkout.tipNote')}</p>
    </div>
  );
}
