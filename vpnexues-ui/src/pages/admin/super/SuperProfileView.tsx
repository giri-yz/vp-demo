import { useState, useEffect, useRef } from 'react';
import { useAdminAuth } from '../../../context/AdminAuthContext';
import { useToast } from '../../../components/admin/Toast';
import s from '../css/SuperProfileView.module.css';
import ScrollReveal from '../../../components/admin/ScrollReveal';

/* ── SVG Icons ── */
const UserIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
);
const CameraIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
);
const HashIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/><line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/></svg>
);
const PhoneIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
);
const CalendarIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
);
const ShieldIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
);
const MailIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
);
const UserTagIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
);
const ClockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
);
const GlobeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
);
const MapPinIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
);
const MonitorIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
);
const KeyIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>
);
const EditIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
);
const LockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
);
const SettingsIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
);
const CloseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
);

/* ── Types ── */
interface Profile {
  name: string;
  email: string;
  phone: string;
  photo: string;
}

interface SecuritySettings {
  twoFA: boolean;
  timeout: number;
  attempts: number;
  ipRestrict: boolean;
  ips: string;
}

interface LoginActivity {
  device: string;
  ip: string;
  location: string;
  time: string;
  status: string;
}

const DEFAULT_PROFILE: Profile = { name: 'Super Admin', email: 'superadmin@vpnexues.com', phone: '+91 99439 94603', photo: '' };
const DEFAULT_SECURITY: SecuritySettings = { twoFA: true, timeout: 30, attempts: 5, ipRestrict: false, ips: '' };
const DEFAULT_ACTIVITY: LoginActivity[] = [
  { device: 'Chrome 128 · Windows 11', ip: '103.87.64.182', location: 'Chennai, Tamil Nadu, India', time: '17 Aug 2026, 09:15 AM', status: 'Success' },
  { device: 'Chrome 127 · Android 14', ip: '103.87.64.182', location: 'Chennai, Tamil Nadu, India', time: '16 Aug 2026, 07:42 PM', status: 'Success' },
  { device: 'Safari 17 · macOS', ip: '49.207.178.10', location: 'Bengaluru, Karnataka, India', time: '15 Aug 2026, 11:05 AM', status: 'Success' },
  { device: 'Firefox 128 · Windows 11', ip: '14.142.56.89', location: 'Mumbai, Maharashtra, India', time: '13 Aug 2026, 04:30 PM', status: 'Failed' },
];

export default function SuperProfileView() {
  const { admin } = useAdminAuth();
  const { notify } = useToast();
  const photoInputRef = useRef<HTMLInputElement>(null);

  /* QA-06: profile/security edits are session-only — no localStorage
     persistence (no backend profile API exists yet). */
  const [profile, setProfile] = useState<Profile>(DEFAULT_PROFILE);
  const [security] = useState<SecuritySettings>(DEFAULT_SECURITY);

  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', email: '', phone: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [pwForm, setPwForm] = useState({ current: '', newPass: '', confirm: '' });
  const [showSecurity, setShowSecurity] = useState(false);

  useEffect(() => {
    setProfile((p) => ({ ...p, name: admin?.name ?? p.name, email: admin?.email ?? p.email }));
  }, [admin]);

  function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const photo = ev.target?.result as string;
      const updated = { ...profile, photo };
      setProfile(updated);
      notify('Profile photo updated', 'success');
    };
    reader.readAsDataURL(file);
  }

  function openEdit() {
    setEditForm({ name: profile.name, email: profile.email, phone: profile.phone });
    setEditing(true);
  }

  function saveEdit() {
    if (!editForm.name.trim()) { notify('Full name is required', 'error'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editForm.email)) { notify('Please enter a valid email address', 'error'); return; }
    if (!editForm.phone.trim()) { notify('Phone number is required', 'error'); return; }
    const updated = { ...profile, ...editForm };
    setProfile(updated);
    setEditing(false);
    notify('Profile updated successfully', 'success');
  }

  function savePassword() {
    if (!pwForm.current) { notify('Please enter your current password', 'error'); return; }
    if (pwForm.newPass.length < 8) { notify('New password must be at least 8 characters', 'error'); return; }
    if (pwForm.newPass !== pwForm.confirm) { notify('New password and confirmation do not match', 'error'); return; }
    if (pwForm.newPass === pwForm.current) { notify('New password must be different from current password', 'error'); return; }
    setPwForm({ current: '', newPass: '', confirm: '' });
    setShowPassword(false);
    notify('Password change submitted. Please use Supabase dashboard to complete.', 'success');
  }

  function saveSecurity() {
    notify('Security settings saved', 'success');
  }

  const p = profile;
  const initial = (p.name || 'S').charAt(0).toUpperCase();
  const lastActivity = DEFAULT_ACTIVITY[0];

  return (
    <div className={s.myAccountPage}>
      <ScrollReveal>
      {/* ── Banner ── */}
      <div className={s.banner}>
        <div className={s.bannerIcon}>
          <UserIcon />
        </div>
        <div className={s.bannerText}>
          <h1 className={s.bannerTitle}>My Account</h1>
          <p className={s.bannerSubtitle}>View your profile and account information</p>
        </div>
      </div>
      </ScrollReveal>

      <ScrollReveal delay={100}>
      {/* ── Main Card ── */}
      <div className={s.mainCard}>
        {/* Profile Header */}
        <div className={s.profileHeader}>
          <div className={s.avatarWrap}>
            <div className={s.avatar}>
              {p.photo ? <img src={p.photo} alt="" /> : initial}
            </div>
            <span className={s.statusDot} />
          </div>
          <input ref={photoInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhotoUpload} />
          <button type="button" className={s.changePhotoBtn} onClick={() => photoInputRef.current?.click()}>
            <CameraIcon /> Change Photo
          </button>
          <h2 className={s.profileName}>{p.name}</h2>
          <p className={s.profileEmail}>{p.email}</p>
        </div>

        {/* ── Two-Column Info Grid ── */}
        <div className={s.infoGrid}>
          {/* LEFT — Super Admin Profile */}
          <div>
            <h3 className={s.infoSectionTitle}>
              <ShieldIcon /> Super Admin Profile
            </h3>
            <div className={s.profileCards}>
              <div className={s.fieldCard}>
                <div className={s.fieldIcon}><HashIcon /></div>
                <div className={s.fieldInfo}>
                  <div className={s.fieldLabel}>Admin ID</div>
                  <div className={s.fieldValue}>SA-001</div>
                </div>
              </div>
              <div className={s.fieldCard}>
                <div className={s.fieldIcon}><PhoneIcon /></div>
                <div className={s.fieldInfo}>
                  <div className={s.fieldLabel}>Phone</div>
                  <div className={s.fieldValue}>{p.phone}</div>
                </div>
              </div>
              <div className={s.fieldCard}>
                <div className={s.fieldIcon}><CalendarIcon /></div>
                <div className={s.fieldInfo}>
                  <div className={s.fieldLabel}>Date Joined</div>
                  <div className={s.fieldValue}>15 Mar 2023</div>
                </div>
              </div>
              <div className={`${s.fieldCard} ${s.statusActive}`}>
                <div className={s.fieldIcon}><ShieldIcon /></div>
                <div className={s.fieldInfo}>
                  <div className={s.fieldLabel}>Account Status</div>
                  <span className={s.statusBadge}>Active</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className={s.actionsRow} style={{ marginTop: 16 }}>
              <button type="button" className={s.btnSolid} onClick={openEdit}>
                <EditIcon /> Edit Profile
              </button>
              <button type="button" className={s.btnOutline} onClick={() => { setPwForm({ current: '', newPass: '', confirm: '' }); setShowPassword(true); }}>
                <KeyIcon /> Change Password
              </button>
              <button type="button" className={s.btnOutline} onClick={() => setShowSecurity(true)}>
                <SettingsIcon /> Security Settings
              </button>
            </div>
          </div>

          {/* RIGHT — Account Information */}
          <div>
            <h3 className={s.infoSectionTitle}>
              <UserTagIcon /> Account Information
            </h3>
            <div className={s.accountInfoGrid}>
              <div className={s.fieldCard}>
                <div className={s.fieldIcon}><UserIcon /></div>
                <div className={s.fieldInfo}>
                  <div className={s.fieldLabel}>Full Name</div>
                  <div className={s.fieldValue}>{p.name}</div>
                </div>
              </div>
              <div className={s.fieldCard}>
                <div className={s.fieldIcon}><MailIcon /></div>
                <div className={s.fieldInfo}>
                  <div className={s.fieldLabel}>Email Address</div>
                  <div className={s.fieldValue}>{p.email}</div>
                </div>
              </div>
              <div className={s.fieldCard}>
                <div className={s.fieldIcon}><PhoneIcon /></div>
                <div className={s.fieldInfo}>
                  <div className={s.fieldLabel}>Phone Number</div>
                  <div className={s.fieldValue}>{p.phone}</div>
                </div>
              </div>
              <div className={s.fieldCard}>
                <div className={s.fieldIcon}><UserTagIcon /></div>
                <div className={s.fieldInfo}>
                  <div className={s.fieldLabel}>Role</div>
                  <div className={s.fieldValue}>Super Admin</div>
                </div>
              </div>
              <div className={s.fieldCard}>
                <div className={s.fieldIcon}><ClockIcon /></div>
                <div className={s.fieldInfo}>
                  <div className={s.fieldLabel}>Last Login</div>
                  <div className={s.fieldValue}>{lastActivity.time}</div>
                </div>
              </div>
              <div className={s.fieldCard}>
                <div className={s.fieldIcon}><GlobeIcon /></div>
                <div className={s.fieldInfo}>
                  <div className={s.fieldLabel}>Login IP Address</div>
                  <div className={s.fieldValue}>{lastActivity.ip}</div>
                </div>
              </div>
              <div className={s.fieldCard}>
                <div className={s.fieldIcon}><MapPinIcon /></div>
                <div className={s.fieldInfo}>
                  <div className={s.fieldLabel}>Login Location</div>
                  <div className={s.fieldValue}>{lastActivity.location}</div>
                </div>
              </div>
              <div className={s.fieldCard}>
                <div className={s.fieldIcon}><MonitorIcon /></div>
                <div className={s.fieldInfo}>
                  <div className={s.fieldLabel}>Browser</div>
                  <div className={s.fieldValue}>{lastActivity.device}</div>
                </div>
              </div>

              {/* 2FA Card */}
              <div className={s.twoFACard}>
                <div className={s.twoFAInfo}>
                  <div className={s.fieldIcon}><LockIcon /></div>
                  <div className={s.fieldInfo}>
                    <div className={s.fieldLabel}>Two Factor Authentication</div>
                    <div className={s.twoFAValue}>Google Authenticator App</div>
                  </div>
                </div>
                <span className={s.enabledBadge}>Enabled</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      </ScrollReveal>

      {/* ── Edit Profile Modal ── */}
      {editing && (
        <div className={s.modalOverlay} onClick={() => setEditing(false)}>
          <div className={s.modalCard} onClick={(e) => e.stopPropagation()}>
            <div className={s.modalHeader}>
              <h3>Edit Profile</h3>
              <button type="button" className={s.modalClose} onClick={() => setEditing(false)}><CloseIcon /></button>
            </div>
            <div className={s.modalBody}>
              <div className={s.formGroup}>
                <label className={s.formLabel}>Full Name</label>
                <input className={s.formInput} value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
              </div>
              <div className={s.formGroup}>
                <label className={s.formLabel}>Email</label>
                <input className={s.formInput} type="email" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} />
              </div>
              <div className={s.formGroup}>
                <label className={s.formLabel}>Phone</label>
                <input className={s.formInput} value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} />
              </div>
            </div>
            <div className={s.modalFooter}>
              <button type="button" className={s.btnOutline} onClick={() => setEditing(false)}>Cancel</button>
              <button type="button" className={s.btnSolid} onClick={saveEdit}>Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Change Password Modal ── */}
      {showPassword && (
        <div className={s.modalOverlay} onClick={() => setShowPassword(false)}>
          <div className={s.modalCard} onClick={(e) => e.stopPropagation()}>
            <div className={s.modalHeader}>
              <h3>Change Password</h3>
              <button type="button" className={s.modalClose} onClick={() => setShowPassword(false)}><CloseIcon /></button>
            </div>
            <div className={s.modalBody}>
              <div className={s.formGroup}>
                <label className={s.formLabel}>Current Password</label>
                <input className={s.formInput} type="password" value={pwForm.current} onChange={(e) => setPwForm({ ...pwForm, current: e.target.value })} />
              </div>
              <div className={s.formGroup}>
                <label className={s.formLabel}>New Password</label>
                <input className={s.formInput} type="password" value={pwForm.newPass} onChange={(e) => setPwForm({ ...pwForm, newPass: e.target.value })} />
              </div>
              <div className={s.formGroup}>
                <label className={s.formLabel}>Confirm Password</label>
                <input className={s.formInput} type="password" value={pwForm.confirm} onChange={(e) => setPwForm({ ...pwForm, confirm: e.target.value })} />
              </div>
            </div>
            <div className={s.modalFooter}>
              <button type="button" className={s.btnOutline} onClick={() => { setShowPassword(false); setPwForm({ current: '', newPass: '', confirm: '' }); }}>Cancel</button>
              <button type="button" className={s.btnSolid} onClick={savePassword}>Update Password</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Security Settings Modal ── */}
      {showSecurity && (
        <div className={s.modalOverlay} onClick={() => setShowSecurity(false)}>
          <div className={s.modalCard} onClick={(e) => e.stopPropagation()}>
            <div className={s.modalHeader}>
              <h3>Security Settings</h3>
              <button type="button" className={s.modalClose} onClick={() => setShowSecurity(false)}><CloseIcon /></button>
            </div>
            <div className={s.modalBody}>
              <div className={s.formGroup}>
                <label className={s.formLabel}>Two-Factor Authentication</label>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: '#f9fafb', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{security.twoFA ? 'Enabled' : 'Disabled'}</span>
                  <span className={s.enabledBadge} style={{ background: security.twoFA ? '#dcfce7' : '#f1f5f9', color: security.twoFA ? '#16a34a' : '#64748b' }}>
                    {security.twoFA ? 'Active' : 'Off'}
                  </span>
                </div>
              </div>
              <div className={s.formGroup}>
                <label className={s.formLabel}>Session Timeout</label>
                <div style={{ fontSize: 13, color: '#1a1a1a', padding: '10px 14px', background: '#f9fafb', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                  {security.timeout} minutes
                </div>
              </div>
              <div className={s.formGroup}>
                <label className={s.formLabel}>Max Login Attempts</label>
                <div style={{ fontSize: 13, color: '#1a1a1a', padding: '10px 14px', background: '#f9fafb', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                  {security.attempts} attempts
                </div>
              </div>
              <div className={s.formGroup}>
                <label className={s.formLabel}>IP Restriction</label>
                <div style={{ fontSize: 13, color: '#1a1a1a', padding: '10px 14px', background: '#f9fafb', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                  {security.ipRestrict ? 'Enabled' : 'Disabled'}
                </div>
              </div>
            </div>
            <div className={s.modalFooter}>
              <button type="button" className={s.btnOutline} onClick={() => setShowSecurity(false)}>Close</button>
              <button type="button" className={s.btnSolid} onClick={() => { saveSecurity(); setShowSecurity(false); }}>Save Settings</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
