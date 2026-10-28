import { IconCheck } from '../common/icons';
import { useLanguage } from '../../i18n/LanguageContext';
import styles from './css/PaymentMethodPicker.module.css';

interface MethodDef {
  key: string;
  labelKey: string;
  subOptions?: string[];
}

const METHODS: MethodDef[] = [
  { key: 'Cash on Delivery', labelKey: 'checkout.cashOnDelivery' },
];

interface Props {
  value: string;
  onChange: (value: string) => void;
}

/** value is a plain descriptive string ("Card", "UPI - Google Pay", ...) — Order.paymentMethod is a free-text field. */
export default function PaymentMethodPicker({ value, onChange }: Props) {
  const { t } = useLanguage();

  function isSelected(method: MethodDef) {
    return value === method.key || value.startsWith(`${method.key} - `);
  }

  return (
    <div className={styles.list}>
      {METHODS.map((method) => {
        const selected = isSelected(method);
        return (
          <div key={method.key} className={`${styles.option} ${selected ? styles.optionSelected : ''}`}>
            <button
              type="button"
              className={styles.optionHead}
              aria-pressed={selected}
              onClick={() => onChange(method.subOptions ? `${method.key} - ${method.subOptions[0]}` : method.key)}
              style={{ width: '100%', textAlign: 'left', font: 'inherit', color: 'inherit' }}
            >
              {selected && <IconCheck />}
              <span className={styles.optionLabel}>{t(method.labelKey)}</span>
            </button>
            {method.subOptions && selected && (
              <div className={styles.subOptions}>
                {method.subOptions.map((sub) => (
                  <button
                    key={sub}
                    type="button"
                    className={`${styles.subOption} ${value === `${method.key} - ${sub}` ? styles.subOptionSelected : ''}`}
                    onClick={() => onChange(`${method.key} - ${sub}`)}
                  >
                    {sub}
                  </button>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
