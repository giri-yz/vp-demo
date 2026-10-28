import { useEffect, useRef, useState } from 'react';
import {
  getPlatformSettings,
  savePlatformSettings,
  type PlatformSettings,
} from '../../../config/platformSettings';
import { getSettings, updateSettings } from '../../../api/adminSettingsApi';
import {
  demoListDeleteHistory,
  demoClearDeleteHistory,
  demoRemoveDeleteEntry,
  demoRestoreSupportMessage,
} from '../../../api/demo/demoAdmin';
import httpClient from '../../../api/httpClient';
import type { StoreSettings } from '../../../types';
import { applyAppearance } from '../../../utils/appearance';
import { useToast } from '../../../components/admin/Toast';
import ScrollReveal from '../../../components/admin/ScrollReveal';
import css from '../css/SuperSettingsView.module.css';

interface DeleteLogEntry {
  id: string;
  item: string;
  type: string;
  by: string;
  at: string;
  user?: string;
  data?: unknown;
}

function applyPrimaryColor(color: string) {
  let el = document.getElementById('vpnexues-primary-color');
  if (!el) {
    el = document.createElement('style');
    el.id = 'vpnexues-primary-color';
    document.head.appendChild(el);
  }
  const r = parseInt(color.slice(1, 3), 16);
  const g = parseInt(color.slice(3, 5), 16);
  const b = parseInt(color.slice(5, 7), 16);
  el.textContent = `
    :root {
      --vpnexues-primary: ${color};
      --vpnexues-primary-rgb: ${r}, ${g}, ${b};
    }
  `;
  // Replace hardcoded green in all inline styles across the DOM
  const targets = document.querySelectorAll<HTMLElement>('[class]');
  targets.forEach((node) => {
    const elStyle = node.style;
    const len = elStyle.length;
    for (let i = 0; i < len; i++) {
      const prop = elStyle[i];
      const val = elStyle.getPropertyValue(prop);
      if (val && (val.includes('rgb(46, 125, 50)') || val.includes('#2E7D32') || val.includes('#2e7d32'))) {
        elStyle.setProperty(prop, val.replace(/rgb\(46,\s*125,\s*50\)/g, color).replace(/#2[eE]7[dD]32/gi, color));
      }
    }
  });
}

/* Error message from the backend GlobalExceptionHandler envelope ({ message }). */
function apiErrorMessage(err: unknown, fallback: string): string {
  const data = (err as { response?: { data?: { message?: string } } })?.response?.data;
  if (data?.message) return String(data.message);
  if (err instanceof Error && err.message) return err.message;
  return fallback;
}

/* Map the server-backed store row onto the overlapping General-tab fields. */
function applyServerMapping(base: PlatformSettings, s: StoreSettings): PlatformSettings {
  return {
    ...base,
    platformName: s.websiteName ?? base.platformName,
    tagline: s.tagline ?? base.tagline,
    contactEmail: s.websiteEmail ?? base.contactEmail,
    phone: s.websitePhone ?? base.phone,
    timezone: s.timezone ?? base.timezone,
    platformDescription: s.storeDescription ?? base.platformDescription,
  };
}

const CURRENCIES = ['SGD', 'USD', 'EUR', 'GBP', 'INR', 'AUD', 'MYR', 'THB'];
const DATE_FORMATS = ['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD'];
const TIME_FORMATS = ['12-hour', '24-hour'];

type Tab = 'general' | 'store' | 'email' | 'security' | 'system' | 'appearance' | 'backup' | 'notifications' | 'delete-history';

interface BackupRow {
  id: string;
  date: string;
  type: string;
  size: string;
}

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'general', label: 'General', icon: 'fas fa-cog' },
  { id: 'store', label: 'Store', icon: 'fas fa-store' },
  { id: 'email', label: 'Email (SMTP)', icon: 'fas fa-envelope' },
  { id: 'security', label: 'Security', icon: 'fas fa-shield-alt' },
  { id: 'system', label: 'System', icon: 'fas fa-server' },
  { id: 'appearance', label: 'Appearance', icon: 'fas fa-palette' },
  { id: 'backup', label: 'Backup & Restore', icon: 'fas fa-download' },
  { id: 'notifications', label: 'Notifications', icon: 'fas fa-bell' },
  { id: 'delete-history', label: 'Delete History', icon: 'fas fa-trash-alt' },
];

export default function SuperSettingsView() {
  const [tab, setTab] = useState<Tab>('general');
  const [form, setForm] = useState<PlatformSettings | null>(null);
  const [history, setHistory] = useState<DeleteLogEntry[]>([]);
  const [backupRows, setBackupRows] = useState<BackupRow[]>([
    { id: 'bk1', date: 'Jul 30, 2026 08:00 AM', type: 'Full', size: '2.4 MB' },
    { id: 'bk2', date: 'Jul 23, 2026 08:00 AM', type: 'Full', size: '2.3 MB' },
    { id: 'bk3', date: 'Jul 16, 2026 08:00 AM', type: 'Full', size: '2.1 MB' },
  ]);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [store, setStore] = useState<StoreSettings | null>(null);
  const [storeErr, setStoreErr] = useState<string | null>(null);
  const [loadingStore, setLoadingStore] = useState(true);
  const [diag, setDiag] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const importRef = useRef<HTMLInputElement>(null);
  const logoRef = useRef<HTMLInputElement>(null);
  const faviconRef = useRef<HTMLInputElement>(null);
  const { notify } = useToast();

  /* Load once on mount: local session prefs + the real server row. Tab switches
   * must not discard unsaved edits, so this no longer depends on [tab]. */
  useEffect(() => {
    const local = getPlatformSettings();
    setForm(local);
    setHistory(demoListDeleteHistory());
    if (local.primaryColor) applyPrimaryColor(local.primaryColor);
    let dead = false;
    getSettings()
      .then((s) => {
        if (dead) return;
        setStore(s);
        setStoreErr(null);
        setForm((f) => applyServerMapping(f ?? local, s));
      })
      .catch((err) => {
        if (!dead) setStoreErr(apiErrorMessage(err, 'Could not load store settings from the server.'));
      })
      .finally(() => {
        if (!dead) setLoadingStore(false);
      });
    return () => {
      dead = true;
    };
  }, []);

  useEffect(() => {
    if (form?.primaryColor) applyPrimaryColor(form.primaryColor);
  }, [form?.primaryColor]);

  if (!form) return <div className={css.empty}>Loading...</div>;

  const set = (patch: Partial<PlatformSettings>) => setForm({ ...form, ...patch });
  const setStoreField = (patch: Partial<StoreSettings>) => setStore((s) => (s ? { ...s, ...patch } : s));

  /* Reset = server row (mapped onto the form) + session defaults, not a wipe. */
  function resetForm() {
    const local = getPlatformSettings();
    setForm(store ? applyServerMapping(local, store) : local);
  }

  /* Session-only prefs always save locally; the overlapping fields plus every
   * server-backed field also go to PUT /api/admin/settings when the row loaded.
   * The DTO requires all 27 fields (currency + 4 pricing knobs are @NotNull),
   * so the payload is built from the loaded row with form edits overlaid. */
  async function save() {
    if (!form) return;
    setSaving(true);
    try {
      savePlatformSettings(form);
      // Session prefs are authoritative for theme/density — apply them the moment
      // they're saved (the Appearance tab's stated behavior). Primary color already
      // applies live via the form effect above.
      applyAppearance(form.theme, form.density);
      if (store) {
        const updated = await updateSettings({
          ...store,
          websiteName: form.platformName,
          tagline: form.tagline,
          websiteEmail: form.contactEmail,
          websitePhone: form.phone,
          timezone: form.timezone,
          storeDescription: form.platformDescription,
        });
        setStore(updated);
        setForm((f) => (f ? applyServerMapping(f, updated) : f));
        setStoreErr(null);
        notify('Settings saved.');
      } else {
        notify('Saved for this browser session only — server settings are unavailable (see the Store tab).', 'error');
      }
    } catch (err) {
      notify(apiErrorMessage(err, 'Could not save settings.'), 'error');
    } finally {
      setSaving(false);
    }
  }

  /* Real check against GET /api/health — measures actual round-trip latency. */
  async function runDiagnostics() {
    const started = Date.now();
    try {
      const { data } = await httpClient.get<{ status?: string }>('/api/health');
      const ms = Date.now() - started;
      const status = data?.status ?? 'UP';
      setDiag(`API ${status} — ${ms} ms`);
      notify(`API ${status} (${ms} ms).`);
    } catch (err) {
      setDiag('API unreachable');
      notify(apiErrorMessage(err, 'API is not reachable.'), 'error');
    }
  }

  async function reloadStore() {
    setLoadingStore(true);
    try {
      const s = await getSettings();
      setStore(s);
      setStoreErr(null);
      setForm((f) => applyServerMapping(f ?? getPlatformSettings(), s));
    } catch (err) {
      setStoreErr(apiErrorMessage(err, 'Could not load store settings from the server.'));
    } finally {
      setLoadingStore(false);
    }
  }

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>, field: 'platformLogo' | 'favicon') {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      set({ [field]: String(reader.result) } as Partial<PlatformSettings>);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  }

  function exportBackup() {
    const dump = { platformSettings: form, storeSettings: store };
    const blob = new Blob([JSON.stringify(dump, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'vpnexues-settings-backup.json';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    notify('Backup downloaded.');
  }

  /* Backup-history rows are demo data (no backup backend yet) — download gives
   * a real file and delete removes the row so the buttons aren't dead. */
  function downloadHistoryBackup(row: BackupRow) {
    const dump = { backup: row, platformSettings: form };
    const blob = new Blob([JSON.stringify(dump, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vpnexues-backup-${row.date.replace(/[^0-9]+/g, '-')}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    notify('Backup downloaded.');
  }

  function deleteHistoryBackup(row: BackupRow) {
    if (!window.confirm(`Delete the backup from ${row.date}? This cannot be undone.`)) return;
    setBackupRows((rows) => rows.filter((r) => r.id !== row.id));
    notify('Backup deleted.');
  }

  function restoreBackup(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const dump = JSON.parse(String(reader.result)) as { platformSettings?: PlatformSettings; storeSettings?: StoreSettings };
        if (dump.platformSettings) setForm(dump.platformSettings);
        if (dump.storeSettings) setStore(dump.storeSettings);
        notify('Backup restored.');
      } catch {
        notify('Invalid backup file.', 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  return (
    <div className={css.settingsPage}>
      {/* ── Banner ──────────────────────────────────────── */}
      <ScrollReveal>
      <div className={css.banner}>
        <div className={css.bannerLeft}>
          <div className={css.bannerIcon}>
            <i className="fas fa-cog" />
          </div>
          <div>
            <h1 className={css.bannerTitle}>Settings</h1>
            <p className={css.bannerSubtitle}>Configure your platform settings</p>
          </div>
        </div>
        <div className={css.bannerActions}>
          <button type="button" className={css.bannerBtn} onClick={exportBackup}>
            <i className="fas fa-file-export" /> Export
          </button>
          <button type="button" className={css.bannerBtn} onClick={() => importRef.current?.click()}>
            <i className="fas fa-file-import" /> Import
          </button>
          <input ref={importRef} type="file" accept=".json" style={{ display: 'none' }} onChange={restoreBackup} />
        </div>
      </div>
      </ScrollReveal>

      {/* ── Tabs ────────────────────────────────────────── */}
      <ScrollReveal delay={100}>
      <div className={css.tabs}>
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`${css.tab} ${tab === t.id ? css.tabActive : ''}`}
            onClick={() => setTab(t.id)}
          >
            <i className={`${t.icon} ${css.tabIcon}`} />
            {t.label}
          </button>
        ))}
      </div>
      </ScrollReveal>

      {/* ── Tab content ──────────────────────────────────── */}
      <ScrollReveal key={tab} delay={200}>
      {tab === 'general' && (
        <div className={css.twoCol}>
          {/* Left: Platform Settings form */}
          <div className={css.section}>
            <div className={css.sectionHeader}>
              <div className={css.sectionIcon}>
                <i className="fas fa-cog" />
              </div>
              <h3 className={css.sectionTitle}>Platform Settings</h3>
            </div>
            <div className={css.sectionBody}>
              <div className={css.infoNotice}>
                <i className={`fas fa-info-circle ${css.infoNoticeIcon}`} />
                <span>Platform name, tagline, contact email, phone, timezone and description are saved to the platform database. Logos, URLs, language and the switches on this page are kept for this browser session only.</span>
              </div>
              <div className={css.fieldRow}>
                <div>
                  <label className={css.fieldLabel}>Platform Name</label>
                  <input className={css.fieldInput} value={form.platformName} onChange={(e) => set({ platformName: e.target.value })} />
                </div>
                <div>
                  <label className={css.fieldLabel}>Tagline</label>
                  <input className={css.fieldInput} value={form.tagline} onChange={(e) => set({ tagline: e.target.value })} />
                </div>
              </div>
              <div className={css.fieldRow}>
                <div>
                  <label className={css.fieldLabel}>Contact Email</label>
                  <input className={css.fieldInput} value={form.contactEmail} onChange={(e) => set({ contactEmail: e.target.value })} />
                </div>
                <div>
                  <label className={css.fieldLabel}>Phone Number</label>
                  <input className={css.fieldInput} value={form.phone} onChange={(e) => set({ phone: e.target.value })} />
                </div>
              </div>
              <div className={css.fieldRow}>
                <div>
                  <label className={css.fieldLabel}>Website URL</label>
                  <input className={css.fieldInput} value={form.websiteUrl} onChange={(e) => set({ websiteUrl: e.target.value })} />
                </div>
                <div>
                  <label className={css.fieldLabel}>Support URL</label>
                  <input className={css.fieldInput} value={form.supportUrl} onChange={(e) => set({ supportUrl: e.target.value })} />
                </div>
              </div>
              <div className={css.fieldRowFull}>
                <label className={css.fieldLabel}>Platform Description</label>
                <textarea className={css.fieldTextarea} value={form.platformDescription} onChange={(e) => set({ platformDescription: e.target.value })} />
              </div>
              <div className={css.uploadRow}>
                <div className={css.uploadField}>
                  <label className={css.fieldLabel}>Platform Logo</label>
                  <div className={css.uploadInfo}>
                    <div className={css.uploadPreview} onClick={() => logoRef.current?.click()}>
                      {form.platformLogo ? (
                        <img src={form.platformLogo} alt="Platform logo" />
                      ) : (
                        <span className={css.uploadPlaceholder}><i className="fas fa-image" /></span>
                      )}
                    </div>
                    <div>
                      <p className={css.uploadText}>Recommended: 200×50px, PNG or SVG</p>
                      <p className={css.uploadHint}>Click to upload</p>
                    </div>
                  </div>
                  <input ref={logoRef} type="file" accept="image/png,image/svg+xml" style={{ display: 'none' }} onChange={(e) => handleImageUpload(e, 'platformLogo')} />
                </div>
                <div className={css.uploadField}>
                  <label className={css.fieldLabel}>Favicon</label>
                  <div className={css.uploadInfo}>
                    <div className={css.uploadPreview} onClick={() => faviconRef.current?.click()}>
                      {form.favicon ? (
                        <img src={form.favicon} alt="Favicon" />
                      ) : (
                        <span className={css.uploadPlaceholder}><i className="fas fa-image" /></span>
                      )}
                    </div>
                    <div>
                      <p className={css.uploadText}>Recommended: 32×32px, ICO or PNG</p>
                      <p className={css.uploadHint}>Click to upload</p>
                    </div>
                  </div>
                  <input ref={faviconRef} type="file" accept="image/png,image/x-icon,image/svg+xml" style={{ display: 'none' }} onChange={(e) => handleImageUpload(e, 'favicon')} />
                </div>
              </div>
              <div className={css.fieldRow}>
                <div>
                  <label className={css.fieldLabel}>Default Timezone</label>
                  <select className={css.fieldSelect} value={form.timezone} onChange={(e) => set({ timezone: e.target.value })}>
                    <option value="UTC">UTC</option>
                    <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                    <option value="Asia/Dubai">Asia/Dubai (GST)</option>
                    <option value="America/New_York">America/New_York (EST)</option>
                    <option value="America/Los_Angeles">America/Los_Angeles (PST)</option>
                    <option value="Asia/Singapore">Asia/Singapore (SGT)</option>
                    <option value="Europe/London">Europe/London (GMT)</option>
                  </select>
                </div>
                <div>
                  <label className={css.fieldLabel}>Default Language</label>
                  <select className={css.fieldSelect} value={form.language} onChange={(e) => set({ language: e.target.value })}>
                    <option value="English">English</option>
                    <option value="Hindi">Hindi</option>
                    <option value="Arabic">Arabic</option>
                    <option value="Chinese">Chinese</option>
                    <option value="Malay">Malay</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Other Preferences */}
          <div className={css.section}>
            <div className={css.sectionHeader}>
              <div className={css.sectionIcon}>
                <i className="fas fa-sliders-h" />
              </div>
              <h3 className={css.sectionTitle}>Other Preferences</h3>
            </div>
            <div className={css.sectionBody}>
              <div className={css.toggleRow}>
                <div className={css.toggleInfo}>
                  <p className={css.toggleLabel}>Enable Maintenance Mode</p>
                  <p className={css.toggleDesc}>Temporarily disable public access</p>
                </div>
                <label className={css.toggle}>
                  <input type="checkbox" checked={form.maintenanceMode} onChange={(e) => set({ maintenanceMode: e.target.checked })} />
                  <span className={css.toggleTrack} />
                </label>
              </div>
              <div className={css.toggleRow}>
                <div className={css.toggleInfo}>
                  <p className={css.toggleLabel}>Allow User Registration</p>
                  <p className={css.toggleDesc}>Allow new users to register</p>
                </div>
                <label className={css.toggle}>
                  <input type="checkbox" checked={form.allowRegistration} onChange={(e) => set({ allowRegistration: e.target.checked })} />
                  <span className={css.toggleTrack} />
                </label>
              </div>
              <div className={css.toggleRow}>
                <div className={css.toggleInfo}>
                  <p className={css.toggleLabel}>Email Verification Required</p>
                  <p className={css.toggleDesc}>Require email verification for new users</p>
                </div>
                <label className={css.toggle}>
                  <input type="checkbox" checked={form.emailVerification} onChange={(e) => set({ emailVerification: e.target.checked })} />
                  <span className={css.toggleTrack} />
                </label>
              </div>
              <div className={css.toggleRow}>
                <div className={css.toggleInfo}>
                  <p className={css.toggleLabel}>Enable Multi Language</p>
                  <p className={css.toggleDesc}>Allow users to switch languages</p>
                </div>
                <label className={css.toggle}>
                  <input type="checkbox" checked={form.multiLanguage} onChange={(e) => set({ multiLanguage: e.target.checked })} />
                  <span className={css.toggleTrack} />
                </label>
              </div>
              <div className={css.toggleRow}>
                <div className={css.toggleInfo}>
                  <p className={css.toggleLabel}>Enable Cookie Consent</p>
                  <p className={css.toggleDesc}>Show cookie consent banner to visitors</p>
                </div>
                <label className={css.toggle}>
                  <input type="checkbox" checked={form.cookieConsent} onChange={(e) => set({ cookieConsent: e.target.checked })} />
                  <span className={css.toggleTrack} />
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === 'store' && (
        <div className={css.section}>
          <div className={css.sectionHeader}>
            <div className={css.sectionIcon}>
              <i className="fas fa-store" />
            </div>
            <h3 className={css.sectionTitle}>Store Settings</h3>
          </div>
          <div className={css.sectionBody}>
            <div className={css.infoNotice}>
              <i className={`fas fa-info-circle ${css.infoNoticeIcon}`} />
              <span>Everything on this tab is saved to the platform database. The box-pricing values feed the live pricing engine on every order.</span>
            </div>

            {loadingStore ? (
              <div className={css.empty}>Loading store settings...</div>
            ) : storeErr || !store ? (
              <>
                <div className={css.infoNotice}>
                  <i className={`fas fa-exclamation-triangle ${css.infoNoticeIcon}`} />
                  <span>{storeErr ?? 'Store settings are unavailable.'}</span>
                </div>
                <div className={css.bottomActions}>
                  <button type="button" className={`${css.btn} ${css.btnSecondary}`} onClick={reloadStore}>
                    <i className="fas fa-redo" /> Retry
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className={css.sectionLabel}>Store Profile</div>
                <div className={css.fieldRow}>
                  <div>
                    <label className={css.fieldLabel}>Store Name</label>
                    <input className={css.fieldInput} value={store.storeName ?? ''} onChange={(e) => setStoreField({ storeName: e.target.value })} />
                  </div>
                  <div>
                    <label className={css.fieldLabel}>Store Email</label>
                    <input className={css.fieldInput} value={store.storeEmail ?? ''} onChange={(e) => setStoreField({ storeEmail: e.target.value })} />
                  </div>
                </div>
                <div className={css.fieldRow}>
                  <div>
                    <label className={css.fieldLabel}>Store Phone</label>
                    <input className={css.fieldInput} value={store.storePhone ?? ''} onChange={(e) => setStoreField({ storePhone: e.target.value })} />
                  </div>
                  <div>
                    <label className={css.fieldLabel}>Default Currency</label>
                    <select className={css.fieldSelect} value={store.defaultCurrency} onChange={(e) => setStoreField({ defaultCurrency: e.target.value })}>
                      {!CURRENCIES.includes(store.defaultCurrency) && <option value={store.defaultCurrency}>{store.defaultCurrency}</option>}
                      {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <div className={css.fieldRowFull}>
                  <label className={css.fieldLabel}>Store Address</label>
                  <textarea className={css.fieldTextarea} value={store.storeAddress ?? ''} onChange={(e) => setStoreField({ storeAddress: e.target.value })} />
                </div>

                <hr className={css.sectionDivider} />

                <div className={css.sectionLabel}>Date &amp; Time Format</div>
                <div className={css.fieldRow}>
                  <div>
                    <label className={css.fieldLabel}>Date Format</label>
                    <select className={css.fieldSelect} value={store.dateFormat ?? ''} onChange={(e) => setStoreField({ dateFormat: e.target.value })}>
                      {store.dateFormat && !DATE_FORMATS.includes(store.dateFormat) && <option value={store.dateFormat}>{store.dateFormat}</option>}
                      {DATE_FORMATS.map((f) => <option key={f} value={f}>{f}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={css.fieldLabel}>Time Format</label>
                    <select className={css.fieldSelect} value={store.timeFormat ?? ''} onChange={(e) => setStoreField({ timeFormat: e.target.value })}>
                      {store.timeFormat && !TIME_FORMATS.includes(store.timeFormat) && <option value={store.timeFormat}>{store.timeFormat}</option>}
                      {TIME_FORMATS.map((f) => <option key={f} value={f}>{f}</option>)}
                    </select>
                  </div>
                </div>

                <hr className={css.sectionDivider} />

                <div className={css.sectionLabel}>Box Pricing (live)</div>
                <div className={css.infoNotice}>
                  <i className={`fas fa-info-circle ${css.infoNoticeIcon}`} />
                  <span>These four values are used by the pricing engine on every order: Small Box charges the first N items at standard price and each additional item at +X%; Big Box takes Y% off the subtotal for orders of Z kg or more. Server-side limits: slots 1–1000, rates 0–1, min kg 0–1000.</span>
                </div>
                <div className={css.fieldRow}>
                  <div>
                    <label className={css.fieldLabel}>Small Box — standard slots (1–1000)</label>
                    <input className={css.fieldInput} type="number" min={1} max={1000} value={store.smallBoxStandardSlots ?? ''} onChange={(e) => setStoreField({ smallBoxStandardSlots: e.target.value === '' ? null : Number(e.target.value) })} />
                  </div>
                  <div>
                    <label className={css.fieldLabel}>Small Box — premium rate past last slot (0–1, e.g. 0.15 = +15%)</label>
                    <input className={css.fieldInput} type="number" step="0.01" min={0} max={1} value={store.smallBoxPremiumRate ?? ''} onChange={(e) => setStoreField({ smallBoxPremiumRate: e.target.value === '' ? null : Number(e.target.value) })} />
                  </div>
                </div>
                <div className={css.fieldRow}>
                  <div>
                    <label className={css.fieldLabel}>Big Box — minimum kg for bulk discount (0–1000)</label>
                    <input className={css.fieldInput} type="number" step="0.5" min={0} max={1000} value={store.bigBoxMinKg ?? ''} onChange={(e) => setStoreField({ bigBoxMinKg: e.target.value === '' ? null : Number(e.target.value) })} />
                  </div>
                  <div>
                    <label className={css.fieldLabel}>Big Box — bulk discount rate (0–1, e.g. 0.12 = 12% off)</label>
                    <input className={css.fieldInput} type="number" step="0.01" min={0} max={1} value={store.bigBoxDiscountRate ?? ''} onChange={(e) => setStoreField({ bigBoxDiscountRate: e.target.value === '' ? null : Number(e.target.value) })} />
                  </div>
                </div>

                <hr className={css.sectionDivider} />

                <div className={css.sectionLabel}>Shipping</div>
                <div className={css.infoNotice}>
                  <i className={`fas fa-info-circle ${css.infoNoticeIcon}`} />
                  <span>Stored on the server for future use. Checkout delivery fees are currently configured per country in the storefront, so these values do not change order totals yet.</span>
                </div>
                <div className={css.fieldRow}>
                  <div>
                    <label className={css.fieldLabel}>Free shipping threshold (0 = disabled)</label>
                    <input className={css.fieldInput} type="number" step="0.01" min={0} value={store.freeShippingThreshold ?? ''} onChange={(e) => setStoreField({ freeShippingThreshold: e.target.value === '' ? null : Number(e.target.value) })} />
                  </div>
                  <div>
                    <label className={css.fieldLabel}>Standard shipping rate</label>
                    <input className={css.fieldInput} type="number" step="0.01" min={0} value={store.standardShippingRate ?? ''} onChange={(e) => setStoreField({ standardShippingRate: e.target.value === '' ? null : Number(e.target.value) })} />
                  </div>
                </div>
                <div className={css.fieldRow}>
                  <div>
                    <label className={css.fieldLabel}>Express shipping rate</label>
                    <input className={css.fieldInput} type="number" step="0.01" min={0} value={store.expressShippingRate ?? ''} onChange={(e) => setStoreField({ expressShippingRate: e.target.value === '' ? null : Number(e.target.value) })} />
                  </div>
                  <div>
                    <label className={css.fieldLabel}>Default delivery days</label>
                    <input className={css.fieldInput} type="number" min={0} value={store.defaultDeliveryDays ?? ''} onChange={(e) => setStoreField({ defaultDeliveryDays: e.target.value === '' ? null : Number(e.target.value) })} />
                  </div>
                </div>

                <hr className={css.sectionDivider} />

                <div className={css.sectionLabel}>Social Links</div>
                <div className={css.fieldRow}>
                  <div>
                    <label className={css.fieldLabel}>Facebook URL</label>
                    <input className={css.fieldInput} value={store.facebookUrl ?? ''} onChange={(e) => setStoreField({ facebookUrl: e.target.value })} />
                  </div>
                  <div>
                    <label className={css.fieldLabel}>Instagram URL</label>
                    <input className={css.fieldInput} value={store.instagramUrl ?? ''} onChange={(e) => setStoreField({ instagramUrl: e.target.value })} />
                  </div>
                </div>
                <div className={css.fieldRow}>
                  <div>
                    <label className={css.fieldLabel}>Twitter / X URL</label>
                    <input className={css.fieldInput} value={store.twitterUrl ?? ''} onChange={(e) => setStoreField({ twitterUrl: e.target.value })} />
                  </div>
                  <div>
                    <label className={css.fieldLabel}>YouTube URL</label>
                    <input className={css.fieldInput} value={store.youtubeUrl ?? ''} onChange={(e) => setStoreField({ youtubeUrl: e.target.value })} />
                  </div>
                </div>
                <div className={css.fieldRow}>
                  <div>
                    <label className={css.fieldLabel}>WhatsApp URL</label>
                    <input className={css.fieldInput} value={store.whatsappUrl ?? ''} onChange={(e) => setStoreField({ whatsappUrl: e.target.value })} />
                  </div>
                  <div>
                    <label className={css.fieldLabel}>Telegram URL</label>
                    <input className={css.fieldInput} value={store.telegramUrl ?? ''} onChange={(e) => setStoreField({ telegramUrl: e.target.value })} />
                  </div>
                </div>

                <div className={css.bottomActions}>
                  <button type="button" className={`${css.btn} ${css.btnSecondary}`} onClick={reloadStore}>
                    <i className="fas fa-undo" /> Reset
                  </button>
                  <button type="button" className={`${css.btn} ${css.btnPrimary}`} disabled={saving} onClick={save}>
                    <i className="fas fa-save" /> Save Store Settings
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {tab === 'email' && (
        <div className={css.section}>
          <div className={css.sectionHeader}>
            <div className={css.sectionIcon}>
              <i className="fas fa-envelope" />
            </div>
            <h3 className={css.sectionTitle}>Email (SMTP) Settings</h3>
          </div>
          <div className={css.sectionBody}>
            <div className={css.infoNotice}>
              <i className={`fas fa-info-circle ${css.infoNoticeIcon}`} />
              <span>These SMTP fields are kept in this browser session only — the backend sends mail using its own server-side SMTP configuration, which is not editable from this screen yet.</span>
            </div>

            <div className={css.fieldRowFull}>
              <label className={css.fieldLabel}>Email Provider</label>
              <select className={css.fieldSelect} value={form.emailProvider} onChange={(e) => set({ emailProvider: e.target.value })}>
                <option value="Gmail">Gmail</option>
                <option value="Outlook">Outlook</option>
                <option value="Yahoo">Yahoo</option>
                <option value="Amazon SES">Amazon SES</option>
                <option value="SendGrid">SendGrid</option>
                <option value="Mailgun">Mailgun</option>
                <option value="Custom">Custom SMTP</option>
              </select>
            </div>

            <div className={css.fieldRow}>
              <div>
                <label className={css.fieldLabel}>SMTP Host *</label>
                <input className={css.fieldInput} value={form.smtpHost} onChange={(e) => set({ smtpHost: e.target.value })} />
              </div>
              <div>
                <label className={css.fieldLabel}>SMTP Port *</label>
                <input className={css.fieldInput} value={form.smtpPort} onChange={(e) => set({ smtpPort: e.target.value })} />
              </div>
            </div>

            <div className={css.fieldRow}>
              <div>
                <label className={css.fieldLabel}>SMTP Username *</label>
                <input className={css.fieldInput} value={form.smtpUsername} onChange={(e) => set({ smtpUsername: e.target.value })} />
              </div>
              <div>
                <label className={css.fieldLabel}>SMTP Password *</label>
                <div className={css.passwordWrap}>
                  <input className={css.fieldInput} type={showPassword ? 'text' : 'password'} value={form.smtpPassword} onChange={(e) => set({ smtpPassword: e.target.value })} />
                  <button type="button" className={css.passwordToggle} onClick={() => setShowPassword(!showPassword)}>
                    <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`} />
                  </button>
                </div>
              </div>
            </div>

            <div className={css.fieldRow}>
              <div>
                <label className={css.fieldLabel}>From Name</label>
                <input className={css.fieldInput} value={form.fromName} onChange={(e) => set({ fromName: e.target.value })} />
              </div>
              <div>
                <label className={css.fieldLabel}>From Email</label>
                <input className={css.fieldInput} value={form.fromEmail} onChange={(e) => set({ fromEmail: e.target.value })} />
              </div>
            </div>

            <div className={css.testEmailSection}>
              <p className={css.testEmailHint}>Test emails are not available yet: the backend sends mail through its own SMTP configuration, which is not connected to this screen.</p>
            </div>

            <div className={css.bottomActions}>
              <button type="button" className={`${css.btn} ${css.btnSecondary}`} onClick={resetForm}>
                Reset
              </button>
              <button type="button" className={`${css.btn} ${css.btnPrimary}`} disabled={saving} onClick={save}>
                <i className="fas fa-save" /> Save Email Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {tab === 'security' && (
        <div className={css.section}>
          <div className={css.sectionHeader}>
            <div className={css.sectionIcon}>
              <i className="fas fa-shield-alt" />
            </div>
            <h3 className={css.sectionTitle}>Security Settings</h3>
          </div>
          <div className={css.sectionBody}>
            <div className={css.infoNotice}>
              <i className={`fas fa-info-circle ${css.infoNoticeIcon}`} />
              <span>These security settings are kept in this browser session only — login and password policy are enforced by the backend, not by this screen.</span>
            </div>
            {/* 2FA */}
            <div className={css.sectionLabel}>Two-Factor Authentication (2FA)</div>
            <div className={css.toggleWithStatus}>
              <label className={css.toggle}>
                <input type="checkbox" checked={form.twoFA} onChange={(e) => set({ twoFA: e.target.checked })} />
                <span className={css.toggleTrack} />
              </label>
              <span className={`${css.toggleStatusLabel} ${form.twoFA ? css.toggleStatusEnabled : css.toggleStatusDisabled}`}>
                {form.twoFA ? 'Enabled' : 'Disabled'}
              </span>
            </div>

            <hr className={css.sectionDivider} />

            {/* Session Timeout / Max Login */}
            <div className={css.fieldRow}>
              <div>
                <label className={css.fieldLabel}>Session Timeout (Minutes)</label>
                <input className={css.fieldInput} type="number" min={1} value={form.sessionTimeout} onChange={(e) => set({ sessionTimeout: Number(e.target.value) })} />
              </div>
              <div>
                <label className={css.fieldLabel}>Max Login Attempts</label>
                <input className={css.fieldInput} type="number" min={1} value={form.maxLoginAttempts} onChange={(e) => set({ maxLoginAttempts: Number(e.target.value) })} />
              </div>
            </div>

            {/* Password Min Length / Expiry */}
            <div className={css.fieldRow}>
              <div>
                <label className={css.fieldLabel}>Password Minimum Length</label>
                <input className={css.fieldInput} type="number" min={4} value={form.passwordMinLength} onChange={(e) => set({ passwordMinLength: Number(e.target.value) })} />
              </div>
              <div>
                <label className={css.fieldLabel}>Password Expiry (Days)</label>
                <input className={css.fieldInput} type="number" min={0} value={form.passwordExpiry} onChange={(e) => set({ passwordExpiry: Number(e.target.value) })} />
                <p className={css.toggleDesc}>Set to 0 for no expiry</p>
              </div>
            </div>

            <hr className={css.sectionDivider} />

            {/* IP Whitelist */}
            <div className={css.sectionLabel}>IP Whitelist Restriction</div>
            <div className={css.toggleWithStatus}>
              <label className={css.toggle}>
                <input type="checkbox" checked={form.ipWhitelistEnabled} onChange={(e) => set({ ipWhitelistEnabled: e.target.checked })} />
                <span className={css.toggleTrack} />
              </label>
              <span className={`${css.toggleStatusLabel} ${form.ipWhitelistEnabled ? css.toggleStatusEnabled : css.toggleStatusDisabled}`}>
                {form.ipWhitelistEnabled ? 'Enabled' : 'Disabled'}
              </span>
            </div>
            <div className={css.fieldRowFull} style={{ marginTop: 12 }}>
              <label className={css.fieldLabel}>Allowed IPs (One Per Line)</label>
              <textarea className={css.fieldTextarea} placeholder="e.g., 192.168.1.1" value={form.allowedIps} onChange={(e) => set({ allowedIps: e.target.value })} />
            </div>

            <hr className={css.sectionDivider} />

            {/* Admin Password Requirement */}
            <div className={css.sectionLabel}>Admin Password Requirement</div>
            <div className={css.checkboxRow}>
              <label className={css.checkboxItem}>
                <input type="checkbox" checked={form.requireUppercase} onChange={(e) => set({ requireUppercase: e.target.checked })} />
                <span className={css.checkboxLabel}>Uppercase Letter</span>
              </label>
              <label className={css.checkboxItem}>
                <input type="checkbox" checked={form.requireLowercase} onChange={(e) => set({ requireLowercase: e.target.checked })} />
                <span className={css.checkboxLabel}>Lowercase Letter</span>
              </label>
              <label className={css.checkboxItem}>
                <input type="checkbox" checked={form.requireNumber} onChange={(e) => set({ requireNumber: e.target.checked })} />
                <span className={css.checkboxLabel}>Number</span>
              </label>
              <label className={css.checkboxItem}>
                <input type="checkbox" checked={form.requireSpecialChar} onChange={(e) => set({ requireSpecialChar: e.target.checked })} />
                <span className={css.checkboxLabel}>Special Character</span>
              </label>
            </div>

            {/* Bottom Actions */}
            <div className={css.bottomActions}>
              <button type="button" className={`${css.btn} ${css.btnSecondary}`} onClick={resetForm}>
                <i className="fas fa-undo" /> Reset
              </button>
              <button type="button" className={`${css.btn} ${css.btnPrimary}`} disabled={saving} onClick={save}>
                <i className="fas fa-save" /> Save Security Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {tab === 'system' && (
        <div className={css.section}>
          <div className={css.sectionHeader}>
            <div className={css.sectionIcon}>
              <i className="fas fa-server" />
            </div>
            <h3 className={css.sectionTitle}>System Settings</h3>
          </div>
          <div className={css.sectionBody}>
            <div className={css.infoNotice}>
              <i className={`fas fa-info-circle ${css.infoNoticeIcon}`} />
              <span>Backup scheduling, frequency and retention below are kept in this browser session only — no backup job runs on the server.</span>
            </div>
            {/* System Information — true stack facts, plus a live API health card */}
            <div className={css.sectionLabel}>System Information</div>
            <div className={css.infoGrid}>
              <div className={css.infoCard}>
                <div className={css.infoCardLabel}>
                  <i className={`fas fa-server ${css.infoCardIcon}`} /> Server
                </div>
                <div className={css.infoCardValue}>Java 17 (Spring Boot)</div>
              </div>
              <div className={css.infoCard}>
                <div className={css.infoCardLabel}>
                  <i className={`fas fa-database ${css.infoCardIcon}`} /> Database
                </div>
                <div className={css.infoCardValue}>PostgreSQL</div>
              </div>
              <div className={css.infoCard}>
                <div className={css.infoCardLabel}>
                  <i className={`fas fa-cloud ${css.infoCardIcon}`} /> Hosting
                </div>
                <div className={css.infoCardValue}>Render</div>
              </div>
              <div className={css.infoCard}>
                <div className={css.infoCardLabel}>
                  <i className={`fas fa-heartbeat ${css.infoCardIcon}`} /> API Health
                </div>
                <div className={css.infoCardValue}>{diag ?? 'Not checked yet'}</div>
              </div>
            </div>

            <hr className={css.sectionDivider} />

            {/* Automatic Backups / Frequency */}
            <div className={css.settingRow}>
              <div>
                <div className={css.sectionLabel}>Automatic Backups</div>
                <div className={css.toggleWithStatus}>
                  <label className={css.toggle}>
                    <input type="checkbox" checked={form.autoBackups} onChange={(e) => set({ autoBackups: e.target.checked })} />
                    <span className={css.toggleTrack} />
                  </label>
                  <span className={`${css.toggleStatusLabel} ${form.autoBackups ? css.toggleStatusEnabled : css.toggleStatusDisabled}`}>
                    Schedule automated backups
                  </span>
                </div>
              </div>
              <div>
                <label className={css.fieldLabel}>Backup Frequency</label>
                <select className={css.fieldSelect} value={form.backupFrequency} onChange={(e) => set({ backupFrequency: e.target.value })}>
                  <option>Hourly</option>
                  <option>Daily</option>
                  <option>Weekly</option>
                  <option>Monthly</option>
                </select>
              </div>
            </div>

            {/* Log Retention / Last Backup */}
            <div className={css.settingRow}>
              <div>
                <label className={css.fieldLabel}>Log Retention (Days)</label>
                <input className={css.fieldInput} type="number" min={1} value={form.logRetention} onChange={(e) => set({ logRetention: Number(e.target.value) })} />
              </div>
              <div>
                <label className={css.fieldLabel}>Last Backup</label>
                <div className={css.readonlyField}>{form.lastBackup || 'Never'}</div>
              </div>
            </div>

            {/* Actions */}
            <div className={css.systemActions}>
              <div className={css.systemActionsSpacer} />
              <button type="button" className={`${css.btn} ${css.btnSecondary}`} onClick={runDiagnostics}>
                <i className="fas fa-heartbeat" /> Run Diagnostics
              </button>
              <button type="button" className={`${css.btn} ${css.btnPrimary}`} disabled={saving} onClick={save}>
                <i className="fas fa-save" /> Save System Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {tab === 'appearance' && (
        <div className={css.section}>
          <div className={css.sectionHeader}>
            <div className={css.sectionIcon}>
              <i className="fas fa-palette" />
            </div>
            <h3 className={css.sectionTitle}>Appearance Settings</h3>
          </div>
          <div className={css.sectionBody}>
            <div className={css.infoNotice}>
              <i className={`fas fa-info-circle ${css.infoNoticeIcon}`} />
              <span>
                Theme applies when you save and lasts for this browser session only (it resets on
                page reload). Primary color applies live as you edit. Sidebar style, dashboard
                layout and language are saved with the session settings but aren't rendered yet.
              </span>
            </div>
            {/* Row 1: Theme / Sidebar Style */}
            <div className={css.fieldRow}>
              <div>
                <label className={css.fieldLabel}>Theme</label>
                <select className={css.fieldSelect} value={form.theme} onChange={(e) => set({ theme: e.target.value })}>
                  <option>Light</option>
                  <option>Dark</option>
                  <option>System</option>
                </select>
              </div>
              <div>
                <label className={css.fieldLabel}>Sidebar Style</label>
                <select className={css.fieldSelect} value={form.sidebarStyle} onChange={(e) => set({ sidebarStyle: e.target.value })}>
                  <option>Full Sidebar</option>
                  <option>Compact Sidebar</option>
                  <option>Hidden Sidebar</option>
                </select>
              </div>
            </div>

            {/* Row 2: Language / Dashboard Layout */}
            <div className={css.fieldRow}>
              <div>
                <label className={css.fieldLabel}>Language</label>
                <select className={css.fieldSelect} value={form.language} onChange={(e) => set({ language: e.target.value })}>
                  <option>English</option>
                  <option>Hindi</option>
                  <option>Arabic</option>
                  <option>Chinese</option>
                  <option>Malay</option>
                </select>
              </div>
              <div>
                <label className={css.fieldLabel}>Dashboard Layout</label>
                <select className={css.fieldSelect} value={form.dashboardLayout} onChange={(e) => set({ dashboardLayout: e.target.value })}>
                  <option>Default</option>
                  <option>Compact</option>
                  <option>Wide</option>
                </select>
              </div>
            </div>

            {/* Row 3: Primary Color (full width) */}
            <div className={css.fieldRowFull}>
              <label className={css.fieldLabel}>Primary Color</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <input
                  type="color"
                  value={form.primaryColor}
                  onChange={(e) => set({ primaryColor: e.target.value })}
                  style={{ width: 40, height: 36, border: '1px solid #E2E8F0', borderRadius: 6, cursor: 'pointer', padding: 2 }}
                />
                <input
                  className={css.fieldInput}
                  value={form.primaryColor}
                  onChange={(e) => set({ primaryColor: e.target.value })}
                  style={{ maxWidth: 160 }}
                />
              </div>
            </div>

            {/* Bottom Actions */}
            <div className={css.bottomActions}>
              <button type="button" className={`${css.btn} ${css.btnSecondary}`} onClick={resetForm}>
                <i className="fas fa-undo" /> Reset
              </button>
              <button type="button" className={`${css.btn} ${css.btnPrimary}`} disabled={saving} onClick={save}>
                <i className="fas fa-save" /> Save Appearance
              </button>
            </div>
          </div>
        </div>
      )}

      {tab === 'backup' && (
        <div>
          <div className={css.section} style={{ marginBottom: 24 }}>
            <div className={css.sectionHeader}>
              <div className={css.sectionIcon}>
                <i className="fas fa-download" />
              </div>
              <h3 className={css.sectionTitle}>Backup & Restore</h3>
            </div>
          </div>

          <div className={css.backupGrid}>
            {/* Create Backup Card */}
            <div className={css.backupCard}>
              <div className={css.backupCardHeader}>
                <div className={`${css.backupCardIcon} ${css.backupCardIconGreen}`}>
                  <i className="fas fa-download" />
                </div>
                <div>
                  <h4 className={css.backupCardTitle}>Create Backup</h4>
                  <p className={css.backupCardDesc}>Download the current platform + store settings as JSON</p>
                </div>
              </div>
              <div className={css.backupLabel}>Included:</div>
              <div className={css.backupNote}>
                Platform settings and store settings (pricing, currency, shipping). User, order and product data are not exported from this screen.
              </div>
              <button type="button" className={css.backupFullBtn} onClick={exportBackup}>
                <i className="fas fa-download" /> Create Backup Now
              </button>
            </div>

            {/* Restore Backup Card */}
            <div className={css.backupCard}>
              <div className={css.backupCardHeader}>
                <div className={`${css.backupCardIcon} ${css.backupCardIconBlue}`}>
                  <i className="fas fa-upload" />
                </div>
                <div>
                  <h4 className={css.backupCardTitle}>Restore Backup</h4>
                  <p className={css.backupCardDesc}>Import from a backup file</p>
                </div>
              </div>
              <div className={css.backupUploadZone} onClick={() => fileRef.current?.click()}>
                <div className={css.backupUploadIcon}>
                  <i className="fas fa-cloud-upload-alt" />
                </div>
                <p className={css.backupUploadText}>Click to select backup file</p>
                <p className={css.backupUploadHint}>Supports JSON files exported from this screen</p>
              </div>
              <input ref={fileRef} type="file" accept=".json" style={{ display: 'none' }} onChange={restoreBackup} />
              <div className={css.backupWarning}>
                <i className={`fas fa-exclamation-triangle ${css.backupWarningIcon}`} />
                Restoring a backup will overwrite current data. This action cannot be undone.
              </div>
              <button type="button" className={css.backupRestoreBtn} onClick={() => fileRef.current?.click()}>
                <i className="fas fa-upload" /> Restore from Backup
              </button>
            </div>
          </div>

          {/* Backup History */}
          <div className={css.section}>
            <div className={css.sectionBody}>
              <h4 className={css.backupHistoryTitle}>
                Backup History
                <span className={css.backupDemoBadge}>Demo</span>
              </h4>
              <table className={css.backupHistoryTable}>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Size</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {backupRows.length === 0 && (
                    <tr>
                      <td colSpan={5} style={{ textAlign: 'center', color: '#64748B', padding: 18 }}>
                        No backups yet
                      </td>
                    </tr>
                  )}
                  {backupRows.map((row) => (
                    <tr key={row.id}>
                      <td>{row.date}</td>
                      <td>{row.type}</td>
                      <td>{row.size}</td>
                      <td><span className={css.backupStatusBadge}>Completed</span></td>
                      <td>
                        <div className={css.backupHistoryActions}>
                          <button type="button" className={css.backupHistoryBtn} title="Download" onClick={() => downloadHistoryBackup(row)}>
                            <i className="fas fa-download" />
                          </button>
                          <button type="button" className={`${css.backupHistoryBtn} ${css.backupHistoryBtnRed}`} title="Delete" onClick={() => deleteHistoryBackup(row)}>
                            <i className="fas fa-trash" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {tab === 'notifications' && (
        <div className={css.section}>
          <div className={css.sectionHeader}>
            <div className={css.sectionIcon}>
              <i className="fas fa-bell" />
            </div>
            <h3 className={css.sectionTitle}>Notification Preferences</h3>
          </div>
          <div className={css.sectionBody}>
            <div className={css.infoNotice}>
              <i className={`fas fa-info-circle ${css.infoNoticeIcon}`} />
              <span>Notification preferences are kept in this browser session only — email and push delivery are not wired up yet.</span>
            </div>
            {([
              ['notifNewOrder', 'New orders', 'Get notified when a new order is placed'],
              ['notifTickets', 'Support tickets', 'Get notified on new support tickets'],
              ['notifUsers', 'New users', 'Get notified when a user registers'],
              ['notifStock', 'Low stock alerts', 'Alert when product stock is low'],
              ['notifPayments', 'Payment updates', 'Get notified on payment status changes'],
              ['notifMessages', 'Messages from sub admins', 'Get notified on incoming messages'],
              ['notifUpdates', 'Platform updates', 'Get notified on platform updates'],
              ['notifSystem', 'System alerts', 'Critical system alerts and errors'],
            ] as const).map(([key, label, desc]) => (
              <div key={key} className={css.toggleRow}>
                <div className={css.toggleInfo}>
                  <p className={css.toggleLabel}>{label}</p>
                  <p className={css.toggleDesc}>{desc}</p>
                </div>
                <label className={css.toggle}>
                  <input type="checkbox" checked={form[key]} onChange={(e) => set({ [key]: e.target.checked } as Partial<PlatformSettings>)} />
                  <span className={css.toggleTrack} />
                </label>
              </div>
            ))}
            <div style={{ borderTop: '1px solid #E5E7EB', marginTop: 16, paddingTop: 16 }}>
              <div className={css.toggleRow}>
                <div className={css.toggleInfo}>
                  <p className={css.toggleLabel}>Daily Email Digest</p>
                  <p className={css.toggleDesc}>Receive a summary of daily activity</p>
                </div>
                <label className={css.toggle}>
                  <input type="checkbox" checked={form.emailDigest} onChange={(e) => set({ emailDigest: e.target.checked })} />
                  <span className={css.toggleTrack} />
                </label>
              </div>
              <div className={css.toggleRow}>
                <div className={css.toggleInfo}>
                  <p className={css.toggleLabel}>Quiet Hours</p>
                  <p className={css.toggleDesc}>Suppress notifications during these hours</p>
                </div>
                <label className={css.toggle}>
                  <input type="checkbox" checked={form.quietHours} onChange={(e) => set({ quietHours: e.target.checked })} />
                  <span className={css.toggleTrack} />
                </label>
              </div>
              {form.quietHours && (
                <div className={css.fieldRow} style={{ marginTop: 12 }}>
                  <div>
                    <label className={css.fieldLabel}>From</label>
                    <input type="time" className={css.fieldInput} value={form.quietHoursFrom} onChange={(e) => set({ quietHoursFrom: e.target.value })} />
                  </div>
                  <div>
                    <label className={css.fieldLabel}>To</label>
                    <input type="time" className={css.fieldInput} value={form.quietHoursTo} onChange={(e) => set({ quietHoursTo: e.target.value })} />
                  </div>
                </div>
              )}
            </div>
            <div className={css.actionsBar}>
              <button type="button" className={`${css.btn} ${css.btnPrimary}`} disabled={saving} onClick={save}>
                <i className="fas fa-save" /> Save Notifications
              </button>
            </div>
          </div>
        </div>
      )}

      {tab === 'delete-history' && (
        <div className={css.section}>
          <div className={css.sectionHeader}>
            <div className={css.sectionIcon}>
              <i className="fas fa-trash-alt" />
            </div>
            <h3 className={css.sectionTitle}>Delete History</h3>
          </div>
          <div className={css.sectionBody}>
            <div className={css.infoBanner}>
              <i className={`fas fa-info-circle ${css.infoBannerIcon}`} />
              Records deletions made while the admin UI runs in offline/demo mode (kept in this browser). Items deleted through the live API are permanent and are not listed here.
            </div>

            {history.length === 0 ? (
              <div className={css.empty}>
                <div className={css.emptyIcon}><i className="fas fa-inbox" /></div>
                <p>No deleted items yet.</p>
              </div>
            ) : (
              <>
                <div className={css.tableWrapper}>
                  <table className={css.table}>
                    <thead>
                      <tr>
                        <th>Item Name</th>
                        <th>ID</th>
                        <th>User</th>
                        <th>Type</th>
                        <th>Deleted On</th>
                        <th>Deleted By</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {history.map((h) => (
                        <tr key={h.id}>
                          <td style={{ fontWeight: 500 }}>{h.item}</td>
                          <td style={{ color: '#64748B', fontFamily: 'monospace', fontSize: 12 }}>{h.id}</td>
                          <td>{h.user ?? (h.data as any)?.name ?? '—'}</td>
                          <td>
                            <span className={`${css.typeBadge} ${h.type.includes('support') ? css.typeBadgeSupport : h.type.includes('log') ? css.typeBadgeLog : css.typeBadgeOther}`}>
                              <i className={`fas ${h.type.includes('support') ? 'fa-headset' : h.type.includes('log') ? 'fa-file-alt' : 'fa-box'}`} style={{ fontSize: 10 }} />
                              {h.type}
                            </span>
                          </td>
                          <td style={{ color: '#64748B', fontSize: 12 }}>{new Date(h.at).toLocaleString()}</td>
                          <td style={{ fontWeight: 500 }}>{h.by}</td>
                          <td>
                            <div style={{ display: 'flex', gap: 6 }}>
                              {h.data ? (
                                <button
                                  type="button"
                                  className={css.actionBtn}
                                  onClick={() => {
                                    demoRestoreSupportMessage(h);
                                    setHistory(demoListDeleteHistory());
                                    notify('Item restored successfully.');
                                  }}
                                  title="Restore"
                                >
                                  <i className="fas fa-undo" />
                                </button>
                              ) : (
                                <span
                                  style={{ color: '#94A3B8', fontSize: 12, alignSelf: 'center', padding: '0 6px' }}
                                  title="No stored copy — this entry only recorded the name, type and time, so it cannot be restored."
                                >
                                  —
                                </span>
                              )}
                              <button
                                type="button"
                                className={`${css.actionBtn} ${css.actionBtnDelete}`}
                                onClick={() => {
                                  if (!window.confirm('Permanently delete this item?')) return;
                                  demoRemoveDeleteEntry(h.id);
                                  setHistory(demoListDeleteHistory());
                                  notify('Entry permanently deleted.');
                                }}
                                title="Delete permanently"
                              >
                                <i className="fas fa-trash-alt" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className={css.actionsBar}>
                  <button
                    type="button"
                    className={`${css.btn} ${css.btnDanger}`}
                    onClick={() => {
                      if (!window.confirm('Clear all delete history?')) return;
                      demoClearDeleteHistory();
                      setHistory([]);
                      notify('Delete history cleared.');
                    }}
                  >
                    <i className="fas fa-trash" /> Clear All History
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      </ScrollReveal>

      {/* ── Global Save/Reset ──────────────────────────────── */}
      {tab === 'general' && (
        <div className={css.actionsBar} style={{ marginTop: 20 }}>
          <button type="button" className={`${css.btn} ${css.btnPrimary}`} disabled={saving} onClick={save}>
            <i className="fas fa-save" /> Save
          </button>
          <button type="button" className={`${css.btn} ${css.btnSecondary}`} onClick={resetForm}>
            <i className="fas fa-undo" /> Reset
          </button>
        </div>
      )}
    </div>
  );
}
