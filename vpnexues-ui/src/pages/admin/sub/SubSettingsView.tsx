import { useEffect, useState } from 'react';
import {
  demoClearDeleteHistory,
  demoGetPrefs,
  demoListDeleteHistory,
  demoSavePrefs,
  type DeleteLogEntry,
  type DemoPrefs,
} from '../../../api/demo/demoAdmin';
import { useToast } from '../../../components/admin/Toast';
import type { CountryConfig } from '../../../config/countryConfig';
import {
  APPEARANCE_OPTIONS,
  type AppearanceMode,
  appearanceFromPrefs,
  applyAppearance,
  prefsFromAppearance,
} from '../../../utils/appearance';
import styles from './SubViews.module.css';
import TrustBanner from './TrustBanner';

const ACCORDIONS = ['Notifications', 'Language & Region', 'Delete History', 'Appearance', 'Security'];

const NOTIF_LABELS: [string, string][] = [
  ['orders', 'Order updates'],
  ['tickets', 'Support tickets'],
  ['users', 'New users'],
  ['stock', 'Low stock alerts'],
  ['payments', 'Payment updates'],
  ['system', 'System notices'],
];

export default function SubSettingsView({ config }: { config: CountryConfig }) {
  const [open, setOpen] = useState<string | null>('Notifications');
  const [prefs, setPrefs] = useState<DemoPrefs | null>(null);
  const [history, setHistory] = useState<DeleteLogEntry[]>([]);
  const [saving, setSaving] = useState(false);
  const { notify } = useToast();

  useEffect(() => {
    setPrefs(demoGetPrefs(config.id));
    setHistory(demoListDeleteHistory());
  }, [config.id]);

  if (!prefs) return <p className={styles.empty}>Loading...</p>;

  const set = (patch: Partial<DemoPrefs>) => setPrefs({ ...prefs, ...patch });

  function save(msg = 'Settings saved.') {
    if (!prefs) return;
    setSaving(true);
    try {
      demoSavePrefs(prefs);
      if (msg === 'Appearance saved.') applyAppearance(prefs.theme, prefs.density);
      notify(msg);
    } finally {
      setSaving(false);
    }
  }

  const appearance: AppearanceMode = appearanceFromPrefs(prefs);

  function setAppearance(mode: AppearanceMode) {
    const next = prefsFromAppearance(mode);
    setPrefs({ ...prefs!, ...next });
  }

  const sectionStyle: React.CSSProperties = { background: '#fff', borderRadius: 14, border: '1px solid #E5E7EB', marginBottom: 16, overflow: 'hidden' };
  const headStyle: React.CSSProperties = { width: '100%', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', border: 'none', background: '#fff', fontSize: 15, fontWeight: 600, textAlign: 'left' };
  const inputStyle: React.CSSProperties = { padding: '8px 12px', borderRadius: 10, border: '1px solid #E5E7EB', fontSize: 13, background: '#fff' };

  return (
    <div>
      <h2 className={styles.sectionTitle}>Settings — {config.name}</h2>
      <p className={styles.muted} style={{ marginTop: -4, marginBottom: 14, fontSize: 12 }}>
        Preferences below are saved in this browser for the {config.name} panel. Platform-wide
        settings (store currency, pricing, shipping, contact details) are managed by the super admin.
      </p>

      {ACCORDIONS.map((section) => (
        <div key={section} style={sectionStyle}>
          <button type="button" style={headStyle} onClick={() => setOpen(open === section ? null : section)}>
            <span>{section}</span>
            <span style={{ marginLeft: 'auto', color: '#94A3B8' }}>{open === section ? '▾' : '▸'}</span>
          </button>
          {open !== section ? null : section === 'Notifications' ? (
            <div style={{ padding: '0 20px 16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
                {NOTIF_LABELS.map(([key, label]) => (
                  <label key={key} style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input type="checkbox" checked={prefs.emailToggles[key] ?? false} onChange={(e) => set({ emailToggles: { ...prefs.emailToggles, [key]: e.target.checked } })} />
                    {label}
                  </label>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 12, marginBottom: 12, flexWrap: 'wrap' }}>
                <div>
                  <div className={styles.muted}>Digest frequency</div>
                  <select style={inputStyle} value={prefs.digest} onChange={(e) => set({ digest: e.target.value })}>
                    <option>Realtime</option><option>Hourly</option><option>Daily</option><option>Weekly</option>
                  </select>
                </div>
                <div>
                  <div className={styles.muted}>Quiet hours from</div>
                  <input type="time" style={inputStyle} value={prefs.quietFrom} onChange={(e) => set({ quietFrom: e.target.value })} />
                </div>
                <div>
                  <div className={styles.muted}>Quiet hours to</div>
                  <input type="time" style={inputStyle} value={prefs.quietTo} onChange={(e) => set({ quietTo: e.target.value })} />
                </div>
              </div>
              <p className={styles.muted} style={{ marginBottom: 12, fontSize: 12 }}>
                Digest frequency and quiet hours are saved on this device; admin notification
                emails are not sent yet.
              </p>
              <button type="button" className={styles.viewButton} disabled={saving} onClick={() => save()}>Save Notifications</button>
            </div>
          ) : section === 'Language & Region' ? (
            <div style={{ padding: '0 20px 16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: 12, marginBottom: 12 }}>
                <div>
                  <div className={styles.muted}>Language</div>
                  <select style={{ ...inputStyle, width: '100%' }} value={prefs.language} onChange={(e) => set({ language: e.target.value })}>
                    {config.languages.map((l) => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
                <div>
                  <div className={styles.muted}>Timezone</div>
                  <select style={{ ...inputStyle, width: '100%' }} value={prefs.timezone} onChange={(e) => set({ timezone: e.target.value })}>
                    {config.timezones.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <div className={styles.muted}>Date format</div>
                  <select style={{ ...inputStyle, width: '100%' }} value={prefs.dateFormat} onChange={(e) => set({ dateFormat: e.target.value })}>
                    <option>DD/MM/YYYY</option><option>MM/DD/YYYY</option>
                  </select>
                </div>
                <div>
                  <div className={styles.muted}>Currency</div>
                  <select style={{ ...inputStyle, width: '100%' }} value={prefs.currency} onChange={(e) => set({ currency: e.target.value })}>
                    {config.currencies.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <div className={styles.muted}>Weight unit</div>
                  <select style={{ ...inputStyle, width: '100%' }} value={prefs.weight} onChange={(e) => set({ weight: e.target.value })}>
                    <option>kg</option><option>g</option><option>lb</option><option>oz</option>
                  </select>
                </div>
              </div>
              <p className={styles.muted} style={{ marginBottom: 12, fontSize: 12 }}>
                Saved in this browser for this panel. Platform defaults (store currency, timezone,
                date format) come from the super admin's Settings.
              </p>
              <button type="button" className={styles.viewButton} disabled={saving} onClick={() => save('Preferences saved.')}>Save Preferences</button>
            </div>
          ) : section === 'Delete History' ? (
            <div style={{ padding: '0 20px 16px' }}>
              <p className={styles.muted} style={{ marginBottom: 10, fontSize: 12 }}>
                Deletions recorded in this browser — read-only for sub-admins.
              </p>
              {history.length === 0 ? <p className={styles.empty}>No deleted items yet.</p> : (
                <>
                  <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                      <thead><tr><th>Item</th><th>Type</th><th>Deleted By</th><th>Deleted On</th></tr></thead>
                      <tbody>
                        {history.map((h) => (
                          <tr key={h.id}><td>{h.item}</td><td>{h.type}</td><td>{h.by}</td><td>{new Date(h.at).toLocaleString()}</td></tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div style={{ marginTop: 12, textAlign: 'right' }}>
                    <button
                      type="button"
                      className={styles.viewButton}
                      onClick={() => {
                        if (!window.confirm('Clear delete history?')) return;
                        demoClearDeleteHistory();
                        setHistory([]);
                        notify('Delete history cleared.');
                      }}
                    >
                      Clear History
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : section === 'Appearance' ? (
            <div style={{ padding: '0 20px 16px' }}>
              <div style={{ display: 'flex', gap: 12, marginBottom: 12, flexWrap: 'wrap' }}>
                {APPEARANCE_OPTIONS.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setAppearance(t)}
                    style={{ padding: '10px 20px', borderRadius: 10, border: appearance === t ? '2px solid #16A34A' : '1px solid #E5E7EB', background: appearance === t ? '#F0FDF4' : '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 500, color: appearance === t ? '#16A34A' : '#64748B' }}
                  >
                    {t}
                  </button>
                ))}
              </div>
              <p className={styles.muted} style={{ marginBottom: 12, fontSize: 12 }}>
                Saved on this device and applied across this panel — the choice survives reloads.
              </p>
              <button type="button" className={styles.viewButton} disabled={saving} onClick={() => save('Appearance saved.')}>Save Appearance</button>
            </div>
          ) : section === 'Security' ? (
            <div style={{ padding: '0 20px 16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ fontSize: 14 }}>Two-factor authentication</span>
                <button
                  type="button"
                  onClick={() => set({ twoFA: !prefs.twoFA })}
                  style={{ width: 48, height: 26, borderRadius: 13, border: 'none', background: prefs.twoFA ? '#16A34A' : '#D1D5DB', position: 'relative', cursor: 'pointer' }}
                  aria-label="Toggle 2FA"
                >
                  <span style={{ width: 22, height: 22, borderRadius: 11, background: '#fff', position: 'absolute', top: 2, left: prefs.twoFA ? 24 : 2, transition: 'left .2s' }} />
                </button>
              </div>
              <p className={styles.muted}>
                Two-factor authentication is stored as a preference on this device — the backend
                does not enforce it yet. Session management will be available once backend
                support is added.
              </p>
              <div style={{ display: 'flex', gap: 8 }}>
                <button type="button" className={styles.viewButton} disabled={saving} onClick={() => save('Security saved.')}>Save Security</button>
              </div>
            </div>
          ) : (
            null
          )}
        </div>
      ))}
      <TrustBanner />
    </div>
  );
}
