import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../../context/AuthContext';
import { useCountry } from '../../context/CountryContext';
import { useLanguage } from '../../i18n/LanguageContext';
import * as accountApi from '../../api/accountApi';
import { useRipple } from '../../components/common/Ripple';
import { useAvatar, AVATAR_ICONS } from '../../hooks/useAvatar';
import CountryChangePrompt from '../../components/common/CountryChangePrompt';
import AccountLayout from './AccountLayout';
import s from './css/PersonalInfo.module.css';

const PHONE_CODE: Record<string, string> = { IN: '+91', SG: '+65', US: '+1', AE: '+971' };
const PHONE_MAX: Record<string, number> = { IN: 10, SG: 8, US: 10, AE: 9 };
const PHONE_PLACEHOLDER: Record<string, string> = {
  IN: '10-digit mobile (starts 6-9)',
  SG: '8-digit mobile number',
  US: '10-digit phone number',
  AE: '9-digit phone number',
};
function formatPhone(phone: string, country: string) {
  const p = phone.trim();
  if (p.startsWith('+')) return p;
  return `${PHONE_CODE[country] || '+91'} ${p}`;
}
function validatePhone(phone: string, country: string): boolean {
  const digits = phone.replace(/\D/g, '');
  const max = PHONE_MAX[country] || 10;
  if (digits.length !== max) return false;
  if (country === 'IN' && !/^[6-9]/.test(digits)) return false;
  return true;
}

export default function PersonalInfo() {
  const { user, refresh } = useAuth();
  const { t } = useLanguage();
  const [emailStep, setEmailStep] = useState<'idle' | 'code'>('idle');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [nameEdit, setNameEdit] = useState(false);
  const [draftName, setDraftName] = useState('');
  const [nameBusy, setNameBusy] = useState(false);
  const [nameError, setNameError] = useState('');
  const [phoneEdit, setPhoneEdit] = useState(false);
  const [draftPhone, setDraftPhone] = useState('');
  const [phoneBusy, setPhoneBusy] = useState(false);
  const [phoneError, setPhoneError] = useState('');
  const [pickerOpen, setPickerOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const { avatar, setAvatar } = useAvatar();
  const [localName] = useState<string | null>(null);
  const { country } = useCountry();
  const rippleDark = useRipple('dark');
  const rippleLight = useRipple('light');

  const prevCountryRef = useRef(country);
  const [countryPromptOpen, setCountryPromptOpen] = useState(false);
  const [promptCountry, setPromptCountry] = useState(country);

  useEffect(() => {
    if (prevCountryRef.current !== country) {
      setPromptCountry(country);
      setCountryPromptOpen(true);
      prevCountryRef.current = country;
    }
  }, [country]);

  const [localPhone] = useState<string | null>(null);

  const effectivePhone = user?.phone || localPhone || '';

  async function handleSendCode(e: React.FormEvent) {
    e.preventDefault(); setError(''); setBusy(true);
    try { await accountApi.sendEmailCode(email); setEmailStep('code'); }
    catch { setError(t('account.couldNotSendCode')); }
    finally { setBusy(false); }
  }

  async function handleVerifyCode(e: React.FormEvent) {
    e.preventDefault(); setError(''); setBusy(true);
    try { await accountApi.verifyEmailCode(email, code); await refresh(); setEmailStep('idle'); setCode(''); }
    catch { setError(t('account.invalidCode')); }
    finally { setBusy(false); }
  }

  async function handleSaveName(e: React.FormEvent) {
    e.preventDefault(); setNameError('');
    const val = draftName.trim();
    if (val.length < 2) { setNameError(t('common.nameMin2')); return; }
    setNameBusy(true);
    try {
      await accountApi.updateProfile(val);
      await refresh();
      setNameEdit(false);
    } catch {
      setNameError(t('account.couldNotSaveName'));
      try { await refresh(); } catch { /* ignore */ }
    } finally { setNameBusy(false); }
  }

  async function handleSavePhone(e: React.FormEvent) {
    e.preventDefault(); setPhoneError('');
    const digits = draftPhone.replace(/\D/g, '');
    if (!validatePhone(digits, country)) {
      setPhoneError(t('common.enterValidPhone').replace('{n}', String(PHONE_MAX[country])));
      return;
    }
    setPhoneBusy(true);
    try {
      await accountApi.updatePhone(digits);
      await refresh();
      setPhoneEdit(false);
    } catch {
      setPhoneError(t('account.couldNotSavePhone'));
      try { await refresh(); } catch { /* ignore */ }
    } finally { setPhoneBusy(false); }
  }

  const displayName = user?.name || localName || '';
  const initials = (displayName || 'G').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = () => { setAvatar(reader.result as string); setPickerOpen(false); };
    reader.readAsDataURL(f);
    e.target.value = '';
  }

  return (
    <AccountLayout title={t('account.personalInfo')} breadcrumb={t('account.personalInfo')}>
      <div className={s.page}>
        <div className={s.banner}>
          <div className={s.bannerBg} />
          <div className={s.bannerContent}>
          <div className={s.avatarWrap}>
            <div className={s.avatar}>
              {avatar?.startsWith('data:') ? (
                <img src={avatar} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
              ) : avatar?.startsWith('fas') || avatar?.startsWith('far') || avatar?.startsWith('fab') ? (
                <i className={avatar} />
              ) : (
                initials || <i className="fas fa-user" />
              )}
            </div>
            <button className={s.avatarCamBtn} onClick={e => { rippleDark(e); setPickerOpen(true); }} aria-label={t('account.changePhoto')}>
              <i className="fas fa-camera" />
            </button>
          </div>
          <div className={s.bannerInfo}>
            <h2 className={s.bannerName}>{displayName || t('account.guestUser')}</h2>
            <p className={s.bannerPhone}>{effectivePhone ? formatPhone(effectivePhone, country) : ''}</p>
          </div>
        </div>
      </div>

      {/* Avatar Picker â€” like Flipkart/Amazon */}
      {pickerOpen && createPortal(
        <div className={s.pickerOverlay} onClick={() => setPickerOpen(false)}>
          <div className={s.pickerSheet} onClick={e => e.stopPropagation()}>
            <div className={s.pickerHeader}>
              <h3>{t('account.chooseAvatar')}</h3>
              <button onClick={() => setPickerOpen(false)} className={s.pickerClose} aria-label={t('account.closeAria')}><i className="fas fa-times" /></button>
            </div>
            <div className={s.pickerGrid}>
              {AVATAR_ICONS.map(a => (
                <button
                  key={a.icon}
                  onClick={e => { rippleDark(e); setAvatar(a.icon); setPickerOpen(false); }}
                  className={`${s.pickerIconBtn} ${avatar === a.icon ? s.pickerActive : ''}`}
                  style={{ background: a.bg, color: a.color } as React.CSSProperties}
                >
                  <i className={a.icon} />
                </button>
              ))}
            </div>
            <div className={s.pickerActions}>
              <button onClick={() => fileRef.current?.click()} className={s.pickerUpload}>
                <i className="fas fa-image" /> {t('account.uploadPhoto')}
              </button>
              {avatar && <button onClick={() => { setAvatar(null); setPickerOpen(false); }} className={s.pickerRemove}>{t('account.remove')}</button>}
            </div>
            <input ref={fileRef} type="file" accept="image/*" hidden onChange={handleFile} />
            <p style={{ fontSize: 11, color: '#111', textAlign: 'center', marginTop: 10 }}>{t('account.avatarHint')}</p>
          </div>
        </div>,
        document.body
      )}

      {/* Details Card */}
      <div className={s.card}>
        <h3 className={s.cardTitle}><i className="fas fa-id-card" /> {t('account.personalDetails')}</h3>

        <div className={s.fieldRow}>
          <div className={s.fieldIcon}><i className="fas fa-user" /></div>
          <div className={s.fieldContent}>
            <span className={s.fieldLabel}>{t('auth.fullName')}</span>
            {!nameEdit ? (
              <span className={s.fieldValue}>
                {displayName || t('account.notSet')}
                <button
                  type="button"
                  onClick={e => { rippleDark(e); setDraftName(displayName || ''); setNameEdit(true); setNameError(''); }}
                  style={{ marginLeft: 8, width: 28, height: 28, borderRadius: '50%', border: '1.5px solid #e5e7eb', background: '#fff', color: '#16a34a', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 11 }}
                  aria-label={t('account.editName')}
                >
                  <i className="fas fa-pen" />
                </button>
              </span>
            ) : (
              <form onSubmit={handleSaveName} className={s.emailForm} style={{ marginTop: 6 }}>
                <input className={s.emailInput} placeholder={t('auth.enterFullName')} required value={draftName} onChange={e => setDraftName(e.target.value)} />
                <button type="submit" className={s.sendBtn} disabled={nameBusy} onClick={rippleDark}>{nameBusy ? <i className="fas fa-spinner fa-spin" /> : t('common.save')}</button>
                <button type="button" className={s.cancelBtn} onClick={e => { rippleDark(e); setNameEdit(false); setNameError(''); }}>{t('address.cancel')}</button>
              </form>
            )}
            {nameError && <div style={{ marginTop: 6, fontSize: 12, color: '#dc2626', fontWeight: 600 }}><i className="fas fa-exclamation-circle" /> {nameError}</div>}
          </div>
        </div>

        <div className={s.fieldRow}>
          <div className={s.fieldIcon}><i className="fas fa-phone" /></div>
          <div className={s.fieldContent}>
            <span className={s.fieldLabel}>{t('auth.phoneNumber')} ({country})</span>
            {!phoneEdit ? (
              <span className={s.fieldValue}>
                {effectivePhone ? formatPhone(effectivePhone, country) : '—'}
                {effectivePhone && <span className={s.verifiedBadge}><i className="fas fa-check-circle" /> {t('account.verified')}</span>}
                <button
                  type="button"
                  onClick={e => { rippleDark(e); setDraftPhone((effectivePhone || '').replace(/^\+\d+\s*/, '')); setPhoneEdit(true); setPhoneError(''); }}
                  style={{ marginLeft: 8, width: 28, height: 28, borderRadius: '50%', border: '1.5px solid #e5e7eb', background: '#fff', color: '#16a34a', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 11 }}
                  aria-label={t('account.editPhone')}
                >
                  <i className="fas fa-pen" />
                </button>
              </span>
            ) : (
              <form onSubmit={handleSavePhone} className={s.emailForm} style={{ marginTop: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 0, flex: '1 1 160px' }}>
                  <span style={{ padding: '12px 10px', background: '#f0fdf4', border: '1.5px solid #e5e7eb', borderRight: 'none', borderRadius: '10px 0 0 10px', fontSize: 13, fontWeight: 700, color: '#16a34a', whiteSpace: 'nowrap' }}>{PHONE_CODE[country]}</span>
                  <input
                    className={s.emailInput}
                    placeholder={PHONE_PLACEHOLDER[country]}
                    required
                    value={draftPhone}
                    onChange={e => setDraftPhone(e.target.value.replace(/\D/g, '').slice(0, PHONE_MAX[country] || 10))}
                    maxLength={PHONE_MAX[country] || 10}
                    inputMode="numeric"
                    style={{ borderRadius: '0 10px 10px 0' }}
                  />
                </div>
                <button type="submit" className={s.sendBtn} disabled={phoneBusy} onClick={rippleDark}>{phoneBusy ? <i className="fas fa-spinner fa-spin" /> : t('common.save')}</button>
                <button type="button" className={s.cancelBtn} onClick={e => { rippleDark(e); setPhoneEdit(false); setPhoneError(''); }}>{t('address.cancel')}</button>
              </form>
            )}
            {phoneError && <div style={{ marginTop: 6, fontSize: 12, color: '#dc2626', fontWeight: 600 }}><i className="fas fa-exclamation-circle" /> {phoneError}</div>}
          </div>
        </div>

        <div className={s.fieldRow}>
          <div className={s.fieldIcon}><i className="fas fa-envelope" /></div>
          <div className={s.fieldContent}>
            <span className={s.fieldLabel}>{t('auth.emailAddress')}</span>
            {user?.email && user.emailVerified ? (
              <span className={s.fieldValue}>{user.email} <span className={s.verifiedBadge}><i className="fas fa-check-circle" /> {t('account.verified')}</span></span>
            ) : emailStep === 'idle' ? (
              <form onSubmit={handleSendCode} className={s.emailForm}>
                <input type="email" className={s.emailInput} placeholder={t('auth.enterEmail')} required value={email} onChange={e => setEmail(e.target.value)} />
                <button type="submit" className={s.sendBtn} disabled={busy} onClick={rippleDark}>{busy ? <i className="fas fa-spinner fa-spin" /> : t('account.sendCode')}</button>
              </form>
            ) : (
              <form onSubmit={handleVerifyCode} className={s.codeForm}>
                <input type="text" inputMode="numeric" className={s.codeInput} placeholder={t('account.enterCode')} required value={code} onChange={e => setCode(e.target.value)} />
                <button type="submit" className={s.verifyBtn} disabled={busy} onClick={rippleLight}>{busy ? <i className="fas fa-spinner fa-spin" /> : t('account.verify')}</button>
                <button type="button" className={s.cancelBtn} onClick={e => { rippleDark(e); setEmailStep('idle'); setCode(''); setError(''); }}>{t('account.cancel')}</button>
              </form>
            )}
          </div>
        </div>

        {error && <div className={s.error}><i className="fas fa-exclamation-circle" /> {error}</div>}
      </div>

      {/* Account Overview â€” extra details */}
      <div className={s.card}>
        <h3 className={s.cardTitle}><i className="fas fa-shield-halved" /> {t('account.accountOverview')}</h3>
        <div className={s.fieldRow}>
          <div className={s.fieldIcon}><i className="fas fa-hashtag" /></div>
          <div className={s.fieldContent}>
            <span className={s.fieldLabel}>{t('account.userId')}</span>
            <span className={s.fieldValue} style={{ fontFamily: 'monospace', fontSize: 13 }}>{user?.id ? `#${user.id.slice(0, 8).toUpperCase()}` : '—'}</span>
          </div>
        </div>
        <div className={s.fieldRow}>
          <div className={s.fieldIcon}><i className="fas fa-user-check" /></div>
          <div className={s.fieldContent}>
            <span className={s.fieldLabel}>{t('account.accountStatus')}</span>
            <span className={s.fieldValue}><span className={s.verifiedBadge}><i className="fas fa-check-circle" /> {t('account.active')}</span> <span style={{ fontSize: 12, color: '#111', marginLeft: 6 }}>{t('account.customerAccount')}</span></span>
          </div>
        </div>
        <div className={s.fieldRow}>
          <div className={s.fieldIcon}><i className="fas fa-calendar" /></div>
          <div className={s.fieldContent}>
            <span className={s.fieldLabel}>{t('account.memberSince')}</span>
            <span className={s.fieldValue} style={{ fontSize: 13 }}>{t('account.welcomeSince')}</span>
          </div>
        </div>
      </div>

      {/* Quick Info */}
      <div className={s.infoStrip}>
        <div className={s.infoItem}>
          <i className="fas fa-shield-halved" />
          <span>{t('account.dataEncrypted')}</span>
        </div>
      </div>

      {/* Country Change Prompt */}
      <CountryChangePrompt
        open={countryPromptOpen}
        onClose={() => setCountryPromptOpen(false)}
        newCountry={promptCountry}
      />
      </div>
    </AccountLayout>
  );
}

