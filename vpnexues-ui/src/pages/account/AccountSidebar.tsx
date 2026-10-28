import { useEffect, useState, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCountry } from '../../context/CountryContext';
import { useRipple } from '../../components/common/Ripple';
import { useAvatar, AVATAR_ICONS } from '../../hooks/useAvatar';
import * as ordersApi from '../../api/ordersApi';
import { useLanguage } from '../../i18n/LanguageContext';
import s from './css/Account.module.css';

const PHONE_CODE: Record<string, string> = { IN: '+91', SG: '+65', US: '+1', AE: '+971' };
function formatPhone(phone: string, country: string) {
  const p = phone.trim();
  return p.startsWith('+') ? p : `${PHONE_CODE[country] || '+91'} ${p}`;
}

interface Props {
  /** aside wrapper class — `s.side` (dashboard flow) or `s.sideBox` (layout pages) */
  asideClass?: string;
}

export default function AccountSidebar({ asideClass = s.side }: Props) {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { country } = useCountry();
  const { avatar, setAvatar } = useAvatar();
  const [localName] = useState<string | null>(null);
  const [localPhone] = useState<string | null>(null);

  const rippleDark = useRipple('dark');
  const rippleRed = useRipple('red');

  const [open, setOpen] = useState(false);
  const [deleteReason, setDeleteReason] = useState('switching');
  const [deleteComment, setDeleteComment] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [pickerOpen, setPickerOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const NAV_ITEMS = [
    { path: '/account', icon: 'fas fa-home', label: t('account.dashboard') },
    { path: '/account/orders', icon: 'fas fa-shopping-bag', label: t('account.orders') },
    { path: '/account/payment-history', icon: 'fas fa-credit-card', label: t('account.payments') },
    { path: '/account/order-tracking', icon: 'fas fa-truck', label: t('account.orderTracking') },
    { path: '/account/personal-info', icon: 'fas fa-user', label: t('account.personalInformation') },
    { path: '/account/addresses', icon: 'fas fa-map-marker-alt', label: t('account.addresses') },
    { path: '/account/help-support', icon: 'fas fa-headset', label: t('account.helpSupport') },
    { path: '/account/notifications', icon: 'fas fa-bell', label: t('account.notifications') },
    { path: '/account/terms', icon: 'fas fa-file-alt', label: t('account.terms') },
    { path: '/privacy', icon: 'fas fa-user-shield', label: t('footer.privacyPolicy') },
    { path: '/account-deletion', icon: 'fas fa-user-slash', label: t('accountDeletion.title') },
  ];

  const handleLogout = useCallback((e: React.MouseEvent<HTMLElement>) => {
    rippleRed(e);
    setTimeout(() => { logout(); navigate('/'); }, 180);
  }, [logout, navigate, rippleRed]);

  const handleDeleteAccount = useCallback(async (e: React.MouseEvent<HTMLButtonElement>) => {
    rippleRed(e);
    setDeleteError('');
    setDeleting(true);
    try {
      const { deleteAccount } = await import('../../api/authApi');
      await deleteAccount();
      sessionStorage.clear();
      setOpen(false);
      window.location.href = '/';
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t('account.failedToDelete');
      const axiosMsg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setDeleteError(axiosMsg || msg);
    } finally {
      setDeleting(false);
    }
  }, [rippleRed, t]);

  function handleAvatarFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = () => { setAvatar(reader.result as string); setPickerOpen(false); };
    reader.readAsDataURL(f);
    e.target.value = '';
  }

  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const displayName = user?.name || localName || t('account.guestUser');
  const activePath = location.pathname;
  const [ordersCount, setOrdersCount] = useState(0);

  useEffect(() => {
    if (!user) {
      setOrdersCount(0);
      return;
    }
    let cancelled = false;
    ordersApi
      .listOrders()
      .then((list) => { if (!cancelled) setOrdersCount(list.length); })
      .catch(() => { if (!cancelled) setOrdersCount(0); });
    return () => { cancelled = true; };
  }, [user]);

  // Identity in this app is proven by PHONE OTP at signup/login — `emailVerified`
  // only becomes true after the optional email-code flow on Personal Info, so
  // keying the badge off it showed "Guest account" for every real user.
  const verified = !!user && (!!user.phone || !!user.emailVerified);
  const phoneDisplay = user?.phone ? formatPhone(user.phone, country) : (localPhone ? formatPhone(localPhone, country) : '');

  const avatarNode = avatar?.startsWith('data:') ? (
    <img src={avatar} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
  ) : avatar?.startsWith('fas') || avatar?.startsWith('far') || avatar?.startsWith('fab') ? (
    <i className={avatar} />
  ) : (
    <i className="fas fa-user" />
  );

  const go = (to: string) => (e: React.MouseEvent<HTMLElement>) => { rippleDark(e); setTimeout(() => navigate(to), 120); };

  return (
    <>
      <aside className={asideClass}>
        <div className={s.profileCard}>
          <div className={s.avatarWrap}>
            <div className={s.avatar}>{avatarNode}</div>
            <button className={s.avatarEdit} onClick={e => { rippleDark(e); setPickerOpen(true); }} aria-label={t('account.changePhoto')}>
              <i className="fas fa-camera" />
            </button>
            {verified && <span className={s.avatarTick}><i className="fas fa-check" /></span>}
          </div>
          <div className={s.profileName}>{displayName}</div>
          {user?.email && <div className={s.profileSub}>{user.email}</div>}
          {phoneDisplay && <div className={s.profileSub}>{phoneDisplay}</div>}
          <div className={`${s.verifyPill} ${verified ? s.verifyOn : s.verifyOff}`}>
            <i className="fas fa-shield-alt" />
            {verified ? t('account.verifiedAccount') : t('account.guestAccount')}
          </div>
        </div>

        <nav className={s.sideNav}>
          {NAV_ITEMS.map(item => {
            const badge = item.path === '/account/orders' ? ordersCount : 0;
            return (
              <button
                key={item.path}
                className={`${s.navItem} ${activePath === item.path ? s.navActive : ''}`}
                onClick={go(item.path)}
              >
                <span className={s.navIcon}><i className={item.icon} /></span>
                <span className={s.navLabel}>{item.label}</span>
                {badge > 0 && <span className={s.navBadge}>{badge}</span>}
              </button>
            );
          })}
          <button className={`${s.navItem} ${s.navLogout}`} onClick={handleLogout}>
            <span className={s.navIcon}><i className="fas fa-sign-out-alt" /></span>
            <span className={s.navLabel}>{t('account.logout')}</span>
          </button>
          <button className={s.deleteLink} onClick={e => { rippleRed(e); setTimeout(() => setOpen(true), 150); }}>
            {t('account.deleteAccount')}
          </button>
        </nav>

        <div className={s.sideArt} aria-hidden="true" />
      </aside>

      {/* Avatar Picker */}
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
            <input ref={fileRef} type="file" accept="image/*" hidden onChange={handleAvatarFile} />
            <p className={s.pickerNote}>{t('account.avatarHint')}</p>
          </div>
        </div>,
        document.body
      )}

      {/* Delete Modal */}
      <div className={`${s.modalOverlay} ${open ? s.open : ''}`} onClick={() => setOpen(false)}>
        <div className={s.modal} onClick={e => e.stopPropagation()}>
          <div className={s.modalHeader}>
            <h2>{t('account.deleteAccountTitle')}</h2>
            <button className={s.modalClose} onClick={e => { rippleDark(e); setTimeout(() => { setOpen(false); setDeleteError(''); }, 120); }}>
              <i className="fas fa-times" />
            </button>
          </div>
          <div className={s.modalBody}>
            <p className={s.modalDesc}>{t('account.deleteAccountDesc')}</p>
            <div className={s.reasons}>
              {[
                { val: 'not_useful', label: t('account.reasonNotUseful') },
                { val: 'privacy', label: t('account.reasonPrivacy') },
                { val: 'switching', label: t('account.reasonSwitching') },
                { val: 'too_many', label: t('account.reasonTooMany') },
                { val: 'other', label: t('account.reasonOther') },
              ].map(r => (
                <label key={r.val} className={s.reason}>
                  <input type="radio" name="deleteReason" value={r.val} checked={deleteReason === r.val} onChange={() => setDeleteReason(r.val)} />
                  {r.label}
                </label>
              ))}
            </div>
            <textarea className={s.reasonTextarea} placeholder={t('account.additionalComments')} rows={3} value={deleteComment} onChange={e => setDeleteComment(e.target.value)} />
            {deleteError && <p style={{ color: '#dc2626', fontSize: 13, marginTop: 8 }}>{deleteError}</p>}
            <p style={{ color: '#b45309', fontSize: 12, marginTop: 10, background: '#fffbeb', padding: '8px 10px', borderRadius: 8, border: '1px solid #fde68a' }}>
              {t('account.deleteWarning')}
            </p>
          </div>
          <div className={s.modalFooter}>
            <button className={s.modalCancel} onClick={e => { rippleDark(e); setTimeout(() => { setOpen(false); setDeleteError(''); }, 120); }} disabled={deleting}>{t('account.cancel')}</button>
            <button className={s.modalConfirm} onClick={handleDeleteAccount} disabled={deleting} style={{ opacity: deleting ? 0.6 : 1 }}>
              {deleting ? t('account.deleting') : t('account.delete')}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
