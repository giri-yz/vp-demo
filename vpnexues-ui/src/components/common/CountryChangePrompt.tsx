import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../i18n/LanguageContext';
import * as accountApi from '../../api/accountApi';
import { useRipple } from './Ripple';
import s from './css/CountryChangePrompt.module.css';

const PHONE_CODE: Record<string, string> = { IN: '+91', SG: '+65', US: '+1', AE: '+971' };
const PHONE_MAX: Record<string, number> = { IN: 10, SG: 8, US: 10, AE: 9 };
const PHONE_PLACEHOLDER: Record<string, string> = {
  IN: '10-digit mobile (starts 6-9)',
  SG: '8-digit mobile number',
  US: '10-digit phone number',
  AE: '9-digit phone number',
};
const COUNTRY_FLAGS: Record<string, string> = { IN: '\u{1F1EE}\u{1F1F3}', SG: '\u{1F1F8}\u{1F1EC}', US: '\u{1F1FA}\u{1F1F8}', AE: '\u{1F1E6}\u{1F1EA}' };

function validatePhone(phone: string, country: string): boolean {
  const digits = phone.replace(/\D/g, '');
  const max = PHONE_MAX[country] || 10;
  if (digits.length !== max) return false;
  if (country === 'IN' && !/^[6-9]/.test(digits)) return false;
  return true;
}

interface Props {
  open: boolean;
  onClose: () => void;
  newCountry: string;
}

export default function CountryChangePrompt({ open, onClose, newCountry }: Props) {
  const { user, refresh } = useAuth();
  const { t } = useLanguage();
  const rippleDark = useRipple('dark');

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (open) {
      setName(user?.name || '');
      setPhone('');
      setError('');
      setSuccess(false);
    }
  }, [open, user?.id, user?.phone, user?.name]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    const trimmedName = name.trim();
    if (trimmedName.length < 2) { setError(t('common.nameMin2')); return; }
    if (phone && !validatePhone(phone, newCountry)) {
      setError(t('common.enterValidPhone').replace('{n}', String(PHONE_MAX[newCountry])));
      return;
    }
    setBusy(true);
    try {
      if (trimmedName !== (user?.name || '')) {
        await accountApi.updateProfile(trimmedName);
      }
      if (phone) {
        await accountApi.updatePhone(phone.replace(/\D/g, ''));
      }
      try { await refresh(); } catch { /* ignore */ }
      setSuccess(true);
      setTimeout(onClose, 1200);
    } catch {
      setError(t('common.couldNotSaveProfile'));
    } finally { setBusy(false); }
  }

  if (!open) return null;

  return createPortal(
    <div className={s.overlay} onClick={onClose}>
      <div className={s.sheet} onClick={e => e.stopPropagation()}>
        <div className={s.header}>
          <div className={s.flag}>{COUNTRY_FLAGS[newCountry] || '🌍'}</div>
          <h3>{t('common.switchedTo').replace('{code}', newCountry)}</h3>
          <button className={s.closeBtn} onClick={onClose} aria-label={t('common.closeAria')}><i className="fas fa-times" /></button>
        </div>

        {success ? (
          <div className={s.successState}>
            <div className={s.successIcon}><i className="fas fa-check-circle" /></div>
            <p>{t('common.profileUpdatedFor').replace('{code}', newCountry)}</p>
          </div>
        ) : (
          <form onSubmit={handleSave} className={s.form}>
            <p className={s.hint}>{t('common.updateDetailsFor').replace('{code}', newCountry)}</p>

            <label className={s.fieldLabel}>{t('checkout.name')}</label>
            <input
              className={s.input}
              placeholder={t('common.enterYourName')}
              required
              value={name}
              onChange={e => setName(e.target.value)}
            />

            <label className={s.fieldLabel}>{t('checkout.phone')} ({newCountry})</label>
            <div className={s.phoneRow}>
              <span className={s.phonePrefix}>{PHONE_CODE[newCountry]}</span>
              <input
                className={s.phoneInput}
                placeholder={PHONE_PLACEHOLDER[newCountry]}
                value={phone}
                onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, PHONE_MAX[newCountry] || 10))}
                maxLength={PHONE_MAX[newCountry] || 10}
                inputMode="numeric"
              />
            </div>
            <span className={s.phoneHint}>{PHONE_PLACEHOLDER[newCountry]}</span>

            {error && <div className={s.error}><i className="fas fa-exclamation-circle" /> {error}</div>}

            <div className={s.actions}>
              <button type="button" className={s.skipBtn} onClick={e => { rippleDark(e); onClose(); }}>{t('common.skip')}</button>
              <button type="submit" className={s.saveBtn} disabled={busy} onClick={rippleDark}>
                {busy ? <i className="fas fa-spinner fa-spin" /> : t('common.save')}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>,
    document.body
  );
}
