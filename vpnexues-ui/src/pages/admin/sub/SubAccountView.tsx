import { useEffect, useRef, useState } from 'react';
import { changePassword } from '../../../api/adminAuthApi';
import { useAdminAuth } from '../../../context/AdminAuthContext';
// import {
//   demoGetPrefs,
//   demoListSessions,
//   demoRevokeSession,
//   demoSavePrefs,
// } from '../../../api/demo/demoAdmin';
import type { CountryConfig } from '../../../config/countryConfig';
import { getErrorMessage } from '../../../utils/errors';
import { useToast } from '../../../components/admin/Toast';
import styles from './SubViews.module.css';
import TrustBanner from './TrustBanner';

const AVATAR_KEY = 'vpnexues-demo-avatars';
const PROFILE_KEY = 'vpnexues-demo-profiles';

function readMap(key: string): Record<string, string> {
  try {
    return (JSON.parse(sessionStorage.getItem(key) ?? '{}') as Record<string, string>) ?? {};
  } catch {
    return {};
  }
}

function writeMap(key: string, map: Record<string, string>): void {
  try {
    sessionStorage.setItem(key, JSON.stringify(map));
  } catch {
    // ignore
  }
}

export default function SubAccountView({ config }: { config: CountryConfig }) {
  const { admin } = useAdminAuth();
  const email = admin?.email ?? '';
  const [displayName, setDisplayName] = useState(admin?.name ?? '');
  const [avatar, setAvatar] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editing, setEditing] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'ok' | 'error'>('ok');
  const [twoFA, setTwoFA] = useState(false);
  const [sessions, setSessions] = useState<{ id: string; device: string; location: string; time: string; current: boolean }[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);
  const { notify } = useToast();

  useEffect(() => {
    setAvatar(readMap(AVATAR_KEY)[email] ?? null);
    const profiles = readMap(PROFILE_KEY);
    setDisplayName(profiles[`${email}:name`] ?? admin?.name ?? '');
    setEditName(profiles[`${email}:name`] ?? admin?.name ?? '');
    setTwoFA(false); // TODO: real backend prefs endpoint
    setSessions([]); // TODO: real backend sessions endpoint
  }, [email, admin?.name, config.id]);

  function uploadAvatar(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const url = String(reader.result);
      setAvatar(url);
      writeMap(AVATAR_KEY, { ...readMap(AVATAR_KEY), [email]: url });
      notify('Profile photo updated.');
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  }

  function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!editName.trim()) {
      setMessage('Name cannot be empty.');
      setMessageType('error');
      return;
    }
    writeMap(PROFILE_KEY, { ...readMap(PROFILE_KEY), [`${email}:name`]: editName.trim() });
    setDisplayName(editName.trim());
    setEditing(false);
    setMessage('Profile updated.');
    setMessageType('ok');
  }

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMessage('New passwords do not match.');
      setMessageType('error');
      return;
    }
    setSaving(true);
    setMessage('');
    try {
      await changePassword(currentPassword, newPassword);
      setMessage('Password updated successfully.');
      setMessageType('ok');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: unknown) {
      setMessage(getErrorMessage(err, 'Could not update password.'));
      setMessageType('error');
    } finally {
      setSaving(false);
    }
  }

  /* 2FA and session revocation have no backend yet — the controls below are
   * rendered disabled with an explicit label instead of fake-success toasts. */

  return (
    <div>
      <h2 className={styles.sectionTitle}>My Account — {config.name}</h2>
      {message && <p className={messageType === 'ok' ? styles.formOk : styles.formError}>{message}</p>}

      <div className={styles.grid2}>
        <div className={styles.panel}>
          <div className={styles.panelHeader}><h3 className={styles.panelTitle}>Profile</h3></div>
          <div className={styles.panelBody} style={{ textAlign: 'center' }}>
            <div
              style={{
                width: 80, height: 80, borderRadius: 20, background: '#16A34A', margin: '0 auto 12px',
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
                fontSize: avatar ? 0 : 32, fontWeight: 700, overflow: 'hidden', cursor: 'pointer',
              }}
              onClick={() => fileRef.current?.click()}
              title="Upload photo"
            >
              {avatar ? <img src={avatar} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (displayName || 'A').charAt(0).toUpperCase()}
            </div>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={uploadAvatar} />
            <h3 style={{ margin: '0 0 4px' }}>{displayName || 'Admin User'}</h3>
            <p className={styles.muted}>{email}</p>
          </div>
          <div className={styles.panelBody}>
            {!editing ? (
              <>
                <div className={styles.detailGrid}>
                  <div className={styles.detailItem}><div className={styles.detailLabel}>Phone</div><div className={styles.detailValue}>{config.adminPhone}</div></div>
                  <div className={styles.detailItem}><div className={styles.detailLabel}>Admin ID</div><div className={styles.detailValue}>{config.adminIdPrefix}-001</div></div>
                  <div className={styles.detailItem}><div className={styles.detailLabel}>Department</div><div className={styles.detailValue}>Operations</div></div>
                  <div className={styles.detailItem}><div className={styles.detailLabel}>Country</div><div className={styles.detailValue}>{config.name}</div></div>
                  <div className={styles.detailItem}><div className={styles.detailLabel}>Role</div><div className={styles.detailValue}>{admin?.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Sub Admin'}</div></div>
                  <div className={styles.detailItem}><div className={styles.detailLabel}>Status</div><div className={styles.detailValue}>Active</div></div>
                </div>
                <div className={styles.actions}>
                  <button type="button" className={styles.viewButton} onClick={() => setEditing(true)}>Edit Profile</button>
                </div>
              </>
            ) : (
              <form onSubmit={saveProfile}>
                <div className={styles.field}>
                  <label>Full Name</label>
                  <input value={editName} onChange={(e) => setEditName(e.target.value)} />
                </div>
                <div className={styles.actions}>
                  <button type="button" className={styles.ghostButton} onClick={() => setEditing(false)}>Cancel</button>
                  <button type="submit" className={styles.viewButton}>Save</button>
                </div>
              </form>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className={styles.panel} style={{ marginBottom: 0 }}>
            <div className={styles.panelHeader}><h3 className={styles.panelTitle}>Change Password</h3></div>
            <div className={styles.panelBody}>
              <form onSubmit={(e) => void handlePasswordChange(e)}>
                <div className={styles.field}><label>Current Password</label><input type="password" required value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} /></div>
                <div className={styles.field}><label>New Password</label><input type="password" required value={newPassword} onChange={(e) => setNewPassword(e.target.value)} /></div>
                <div className={styles.field}><label>Confirm New Password</label><input type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} /></div>
                <div className={styles.actions}>
                  <button type="submit" className={styles.viewButton} disabled={saving}>{saving ? 'Saving...' : 'Update Password'}</button>
                </div>
              </form>
            </div>
          </div>

          <div className={styles.panel} style={{ marginBottom: 0 }}>
            <div className={styles.panelHeader}><h3 className={styles.panelTitle}>Security</h3></div>
            <div className={styles.panelBody}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ fontSize: 14, color: '#6B7280' }}>
                  Two-factor authentication{' '}
                  <span style={{ fontSize: 11, fontWeight: 700, background: '#FEF3C7', color: '#92400E', borderRadius: 6, padding: '2px 6px', marginLeft: 6 }}>
                    Not available yet
                  </span>
                </span>
                <button
                  type="button"
                  disabled
                  style={{ width: 48, height: 26, borderRadius: 13, border: 'none', background: twoFA ? '#16A34A' : '#D1D5DB', position: 'relative', cursor: 'not-allowed', opacity: 0.6 }}
                  aria-label="Toggle 2FA (not available yet)"
                >
                  <span style={{ width: 22, height: 22, borderRadius: 11, background: '#fff', position: 'absolute', top: 2, left: twoFA ? 24 : 2, transition: 'left .2s' }} />
                </button>
              </div>
              <button type="button" className={styles.ghostButton} disabled title="Sessions API is backend pending">
                Logout Other Sessions
              </button>
              <p className={styles.muted} style={{ margin: '8px 0 0', fontSize: 12 }}>
                Session tracking is backend pending — nothing to revoke yet.
              </p>
            </div>
          </div>

          <div className={styles.panel} style={{ marginBottom: 0 }}>
            <div className={styles.panelHeader}><h3 className={styles.panelTitle}>Login Activity</h3></div>
            <div className={styles.panelBody}>
              {sessions.length === 0 ? (
                <p className={styles.empty}>No sessions recorded yet — login history is backend pending.</p>
              ) : (
                sessions.map((s) => (
                  <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #F1F5F9' }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 500 }}>{s.device}{s.current ? ' (current)' : ''}</div>
                      <div className={styles.muted}>{s.location} · {s.time}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
      <TrustBanner />
    </div>
  );
}
