import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useLanguage } from '../../i18n/LanguageContext';
import { getProductName } from '../../i18n/productNames';
import { getProductInformation } from '../../data/productInformation';
import { mediaUrl } from '../../utils/mediaUrl';
import styles from './css/ProductInformationModal.module.css';

interface ProductInformationModalProps {
  name: string;
  imageUrl: string | null;
  onClose: () => void;
}

const NUTRITION_ROWS = [
  ['energyKcal', 'cart.energy', 'kcal'],
  ['proteinG', 'cart.protein', 'g'],
  ['carbsG', 'cart.carbohydrates', 'g'],
  ['fatG', 'cart.fat', 'g'],
  ['fibreG', 'cart.fibre', 'g'],
  ['vitaminCMg', 'cart.vitaminC', 'mg'],
  ['betaCaroteneUg', 'cart.betaCarotene', 'µg'],
  ['calciumMg', 'cart.calcium', 'mg'],
  ['ironMg', 'cart.iron', 'mg'],
  ['potassiumMg', 'cart.potassium', 'mg'],
  ['magnesiumMg', 'cart.magnesium', 'mg'],
  ['zincMg', 'cart.zinc', 'mg'],
] as const;

export default function ProductInformationModal({ name, imageUrl, onClose }: ProductInformationModalProps) {
  const { t, lang } = useLanguage();
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    document.body.style.overflow = 'hidden';
    closeButtonRef.current?.focus();

    function handleModalKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onCloseRef.current();
      } else if (event.key === 'Tab') {
        event.preventDefault();
        closeButtonRef.current?.focus();
      }
    }

    window.addEventListener('keydown', handleModalKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleModalKeyDown);
      previousFocus?.focus();
    };
  }, []);

  const info = getProductInformation(name);
  const displayName = getProductName(name, lang);

  return createPortal(
    <div
      className={styles.overlay}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section className={styles.dialog} role="dialog" aria-modal="true" aria-labelledby="product-info-title">
        <header className={styles.header}>
          <h2 id="product-info-title">{displayName}</h2>
          <button
            ref={closeButtonRef}
            type="button"
            className={styles.close}
            onClick={onClose}
            aria-label={t('cart.closeProductInfo')}
          >
            <span aria-hidden="true">&times;</span>
          </button>
        </header>
        <div className={styles.body}>
          <div className={styles.hero}>
            {imageUrl ? (
              <img
                src={mediaUrl(imageUrl)}
                alt={displayName}
                onError={(event) => {
                  event.currentTarget.src = `https://placehold.co/400x400/f4f9f0/4a7c3f?text=${encodeURIComponent(name.split(' ')[0])}&font=roboto`;
                }}
              />
            ) : (
              <div className={styles.imagePlaceholder} aria-hidden="true">🥬</div>
            )}
            <div>
              <h3>{t('cart.description')}</h3>
              <p>{info?.description ?? t('cart.productInfoUnavailable')}</p>
            </div>
          </div>

          <section className={styles.section}>
            <h3>{t('cart.howToUse')}</h3>
            <p>{info?.howToUse ?? t('cart.productInfoUnavailable')}</p>
          </section>

          <section className={styles.section}>
            <div className={styles.nutritionHeading}>
              <h3>{t('cart.nutritionalValue')}</h3>
              <span>{t('cart.per100g')}</span>
            </div>
            {info ? (
              <>
                <div className={styles.nutritionGrid}>
                  {NUTRITION_ROWS.map(([field, label, unit]) => {
                    const value = info.nutrition[field];
                    if (value == null) return null;
                    return (
                      <div key={field} className={styles.nutritionItem}>
                        <span>{t(label)}</span>
                        <strong>{new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(value)} {unit}</strong>
                      </div>
                    );
                  })}
                </div>
                <p className={styles.nutritionSource}>
                  <strong>{t('cart.nutritionSource')}:</strong> {info.nutritionSource}
                </p>
                <p className={styles.nutritionBasis}>{info.nutritionBasis}</p>
              </>
            ) : (
              <p>{t('cart.productInfoUnavailable')}</p>
            )}
          </section>
        </div>
      </section>
    </div>,
    document.body
  );
}
