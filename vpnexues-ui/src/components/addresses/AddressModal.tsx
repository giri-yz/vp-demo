import { useEffect, useState } from 'react';
import * as addressesApi from '../../api/addressesApi';
import type { Address, CreateAddressInput } from '../../types';
import { useLanguage } from '../../i18n/LanguageContext';
import { useCountry } from '../../context/CountryContext';
import styles from './css/AddressModal.module.css';

const EMPTY_ADDRESS: CreateAddressInput = {
  label: 'Home',
  name: '',
  phone: '',
  addressLine: '',
  flat: '',
  landmark: '',
  city: '',
  pincode: '',
  state: '',
  country: null,
  isDefault: true,
  lat: null,
  lng: null,
};

interface AddressModalProps {
  open: boolean;
  addresses: Address[];
  selectedAddressId: string | null;
  onClose: () => void;
  onSelect: (id: string) => void;
  onAddressAdded: (address: Address) => void;
}

export default function AddressModal({ open, addresses, selectedAddressId, onClose, onSelect, onAddressAdded }: AddressModalProps) {
  const { t } = useLanguage();
  const { country } = useCountry();
  const [showForm, setShowForm] = useState(addresses.length === 0);
  const [newAddress, setNewAddress] = useState<CreateAddressInput>(EMPTY_ADDRESS);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    if (open) setShowForm(addresses.length === 0);
  }, [open, addresses.length]);

  if (!open) return null;

  async function handleAddAddress(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaveError('');
    try {
      // Country has to reach the backend: checkout gates delivery on the
      // address's own country (V59), not the header selector.
      const created = await addressesApi.createAddress({ ...newAddress, country: newAddress.country || country || null });
      onAddressAdded(created);
      setNewAddress(EMPTY_ADDRESS);
      setShowForm(false);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { status?: number; data?: { message?: string } } } | undefined;
      const serverMsg = axiosErr?.response?.data?.message;
      // PII-safe log: only status/message — the raw error carries the address payload.
      console.error('[AddressModal] save failed:', axiosErr?.response?.status ?? (err instanceof Error ? err.message : String(err)));
      setSaveError(
        serverMsg ||
          (axiosErr?.response?.status === 400 ? t('address.missingFieldsError') : '') ||
          (axiosErr?.response?.status === 401 || axiosErr?.response?.status === 403 ? t('address.loginRequiredError') : '') ||
          t('address.saveFailedError')
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className={styles.overlay}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className={styles.modal}>
        <div className={styles.header}>
          <h3>{showForm ? t('address.addTitle') : t('address.selectTitle')}</h3>
          <button type="button" className={styles.closeBtn} onClick={onClose}>
            ×
          </button>
        </div>

        <div className={styles.body}>
          {!showForm && (
            <div className={styles.list}>
              {addresses.map((a) => (
                <div
                  key={a.id}
                  className={`${styles.addressItem} ${selectedAddressId === a.id ? styles.addressItemActive : ''}`}
                  onClick={() => {
                    onSelect(a.id);
                    onClose();
                  }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { onSelect(a.id); onClose(); } }}
                >
                  <span className={styles.addressIcon}>📍</span>
                  <div className={styles.addressInfo}>
                    <div className={styles.addressLabel}>{a.label === 'Home' ? t('address.home') : a.label === 'Work' ? t('address.work') : a.label === 'Other' ? t('address.other') : a.label}</div>
                    <div className={styles.addressText}>
                      {a.name}, {a.addressLine}, {a.city}, {a.state} {a.pincode}
                    </div>
                  </div>
                </div>
              ))}
              <button type="button" className={styles.addNewBtn} onClick={() => setShowForm(true)}>
                + {t('address.addNew')}
              </button>
            </div>
          )}

          {showForm && (
            <form onSubmit={handleAddAddress} className={styles.form}>
              <div className={styles.formRow}>
                <label>
                  {t('address.fullName')}
                  <input
                    required
                    value={newAddress.name}
                    onChange={(e) => setNewAddress({ ...newAddress, name: e.target.value })}
                  />
                </label>
                <label>
                  {t('address.phone')}
                  <input
                    required
                    value={newAddress.phone}
                    onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                  />
                </label>
              </div>
              <label className={styles.full}>
                {t('address.address')}
                <input
                  required
                  value={newAddress.addressLine}
                  onChange={(e) => setNewAddress({ ...newAddress, addressLine: e.target.value })}
                />
              </label>
              <div className={styles.formRow}>
                <label>
                  {t('address.city')}
                  <input
                    required
                    value={newAddress.city}
                    onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                  />
                </label>
                <label>
                  {t('address.state')}
                  <input
                    required
                    value={newAddress.state}
                    onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                  />
                </label>
              </div>
              <label className={styles.full}>
                {t('address.pincode')}
                <input
                  required
                  value={newAddress.pincode}
                  onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value })}
                />
              </label>

              <div className={styles.formActions}>
                <button type="submit" className={styles.saveBtn} disabled={saving}>
                  {saving ? t('address.saving') : t('address.save')}
                </button>
                {addresses.length > 0 && (
                  <button type="button" className={styles.cancelBtn} onClick={() => setShowForm(false)}>
                    {t('address.cancel')}
                  </button>
                )}
              </div>
              {saveError && (
                <p role="alert" style={{ color: '#dc2626', fontSize: 13, marginTop: 8 }}>
                  {saveError}
                </p>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
