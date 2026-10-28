import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { createAdminUser, deleteAdminUser, listAdminUsers, updateAdminUser } from '../../../api/adminUsersApi';
import type { AdminRole, AdminUserSummary } from '../../../types';
import Modal from '../../../components/admin/Modal';
import AccessPassModal from '../../../components/admin/AccessPassModal';
import ExportMenu from '../../../components/admin/ExportMenu';
import { useToast } from '../../../components/admin/Toast';
import { printTable, type ExportData } from '../../../utils/csvExport';
import { useAdminAuth } from '../../../context/AdminAuthContext';
import { getErrorMessage } from '../../../utils/errors';
import styles from '../css/SuperAdminDashboard.module.css';
import csStyles from '../css/CountriesSection.module.css';
import ScrollReveal from '../../../components/admin/ScrollReveal';

const PAGE_SIZE = 10;
const COUNTRY_LABELS: Record<string, string> = {
  india: 'India',
  uae: 'UAE',
  us: 'United States',
  singapore: 'Singapore',
  lk: 'Sri Lanka',
};
const COUNTRY_FLAGS: Record<string, string> = {
  india: 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001490/vpnexues/old/site-assets/assets-ui/img/in-flag.svg',
  uae: '/images/uae-flag.svg',
  us: '/images/us-flag.svg',
  singapore: '/images/sg-flag.svg',
  lk: '/images/lk-flag.svg',
};

interface SubAdminRow {
  id: string;
  name: string;
  email: string;
  phone: string;
  country: string;
  role: string;
  modules: string[];
  permissions: string[];
  status: string;
  lastLogin: string;
  createdDate: string;
  /** SUPER_ADMIN collapses to role 'admin' in the form vocabulary — keep the real value. */
  isSuperAdmin: boolean;
}

const MODULE_OPTIONS: { key: string; label: string }[] = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'orders', label: 'Orders' },
  { key: 'products', label: 'Products' },
  { key: 'users', label: 'Users' },
  { key: 'reports', label: 'Reports' },
  { key: 'payments', label: 'Payments' },
  { key: 'support', label: 'Support' },
  { key: 'content', label: 'Content' },
  { key: 'careers', label: 'Careers' },
];

const PERMISSION_OPTIONS: { key: string; label: string }[] = [
  { key: 'view', label: 'View' },
  { key: 'edit', label: 'Edit' },
  { key: 'delete', label: 'Delete' },
  { key: 'hide', label: 'Hide / Show' },
  { key: 'export', label: 'Export' },
];

const COUNTRY_CODE_TO_SLUG: Record<string, string> = { IN: 'india', AE: 'uae', US: 'us', SG: 'singapore', LK: 'lk' };
const COUNTRY_SLUG_TO_CODE: Record<string, string> = { india: 'IN', uae: 'AE', us: 'US', singapore: 'SG', lk: 'LK' };
const ROLE_TO_FORM: Record<string, string> = { SUB_ADMIN: 'sub-admin', ADMIN: 'admin', SUPER_ADMIN: 'admin' };
const FORM_TO_ROLE: Record<string, AdminRole> = { 'sub-admin': 'SUB_ADMIN', 'admin': 'ADMIN' };

function fromSummary(u: AdminUserSummary): SubAdminRow {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    phone: u.phone ?? '',
    country: COUNTRY_CODE_TO_SLUG[u.countryCode ?? ''] ?? '',
    role: ROLE_TO_FORM[u.role] ?? 'sub-admin',
    // Empty/missing grants = legacy account with full access — show every option as granted.
    modules: u.modules && u.modules.length > 0 ? u.modules : MODULE_OPTIONS.map((m) => m.key),
    permissions: u.permissions && u.permissions.length > 0 ? u.permissions : PERMISSION_OPTIONS.map((p) => p.key),
    status: u.active ? 'active' : 'inactive',
    lastLogin: u.lastLogin ? new Date(u.lastLogin).toLocaleString() : '',
    createdDate: '',
    isSuperAdmin: u.role === 'SUPER_ADMIN',
  };
}

interface SubAdminForm {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: string;
  country: string;
  modules: string[];
  permissions: string[];
}

const EMPTY_FORM: SubAdminForm = {
  name: '', email: '', phone: '', password: '', role: 'sub-admin', country: 'india', modules: ['dashboard', 'orders'], permissions: ['view'],
};

const fieldStyle: React.CSSProperties = { width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #E2E8F0', fontSize: 13, boxSizing: 'border-box', transition: 'border-color .2s' };

function roleText(role: string): string {
  return role.replace('-', ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function roleBadgeStyle(role: string): React.CSSProperties {
  const map: Record<string, { bg: string; color: string }> = {
    'sub-admin': { bg: 'rgba(77,166,225,.1)', color: '#4DA6E1' },
    admin: { bg: 'rgba(239,68,68,.1)', color: '#EF4444' },
    manager: { bg: 'rgba(77,166,225,.1)', color: '#4DA6E1' },
    viewer: { bg: 'rgba(100,116,139,.1)', color: '#64748B' },
  };
  const s = map[role] || map.viewer;
  return { padding: '4px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600, background: s.bg, color: s.color };
}

function Checkboxes({ title, options, selected, onChange }: { title: string; options: { key: string; label: string }[]; selected: string[]; onChange: (next: string[]) => void }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label style={{ display: 'block', fontSize: 12, color: '#64748B', marginBottom: 6 }}>{title}</label>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {options.map((item) => (
          <label key={item.key} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 12px', border: '1px solid #E2E8F0', borderRadius: 8, fontSize: 12, fontWeight: 500, cursor: 'pointer', background: '#fff' }}>
            <input
              type="checkbox"
              checked={selected.includes(item.key)}
              onChange={(e) => {
                if (e.target.checked) onChange([...selected, item.key]);
                else onChange(selected.filter((k) => k !== item.key));
              }}
              style={{ accentColor: '#16A34A' }}
            />
            {item.label}
          </label>
        ))}
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: '14px 16px', boxShadow: '0 1px 3px rgba(0,0,0,.06)' }}>
      <div style={{ fontSize: 11, color: '#134B2F', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 5, fontWeight: 500 }}>{label}</div>
      <div style={{ fontSize: 14, fontWeight: 600, color: '#111' }}>{value}</div>
    </div>
  );
}

export default function SubAdminsView({ embedded = false }: { embedded?: boolean }) {
  const navigate = useNavigate();
  /** Used to hide Delete on your own row — the backend refuses self-deletion anyway. */
  const { admin: sessionAdmin } = useAdminAuth();
  const [admins, setAdmins] = useState<SubAdminRow[]>([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [countryFilter, setCountryFilter] = useState('');
  const [countryOpen, setCountryOpen] = useState(false);
  const countryButtonRef = useRef<HTMLButtonElement>(null);
  const [countryMenuPos, setCountryMenuPos] = useState({ top: 0, left: 0, width: 220 });
  const [sortKey, setSortKey] = useState('name');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<SubAdminRow | null>(null);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<SubAdminRow | null>(null);
  /**
   * Feature B — which account's one-time access pass panel is open.
   *
   * Deliberately just `{ id, name }` rather than the whole row: the panel is also opened straight
   * after create, before that row has come back from `load()`.
   */
  const [passTarget, setPassTarget] = useState<{ id: string; name: string } | null>(null);
  const [form, setForm] = useState<SubAdminForm>(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const { notify } = useToast();

  const menuRef = useRef<HTMLDivElement>(null);

  function load() {
    listAdminUsers()
      .then((users) => setAdmins(users.map(fromSummary)))
      .catch(() => setAdmins([]));
  }

  useEffect(load, []);

  useEffect(() => {
    if (!menuOpen) return;
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(null);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [menuOpen]);

  /* Country menu placement — portaled to document.body so no ancestor
     transform/stacking context can clip it. Closes on scroll/resize/Escape. */
  useEffect(() => {
    if (!countryOpen) return;
    const place = () => {
      const rect = countryButtonRef.current?.getBoundingClientRect();
      if (!rect) return;
      const menuW = Math.max(rect.width, 220);
      let left = rect.right - menuW;
      if (left < 8) left = 8;
      setCountryMenuPos({ top: rect.bottom + 8, left, width: menuW });
    };
    place();
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setCountryOpen(false); };
    const onScroll = () => setCountryOpen(false);
    window.addEventListener('keydown', onKey);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', place);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', place);
    };
  }, [countryOpen]);

  const q = search.toLowerCase().trim();
  let filtered = admins.filter(
    (a) =>
      (!status || a.status === status) &&
      (!countryFilter || a.country === countryFilter) &&
      (!q || `${a.name} ${a.email} ${a.phone} ${COUNTRY_LABELS[a.country] ?? a.country}`.toLowerCase().includes(q)),
  );
  const dir = sortDir === 'asc' ? 1 : -1;
  filtered = [...filtered].sort((a, b) => {
    const av = (a[sortKey as keyof SubAdminRow] ?? '').toString().toLowerCase();
    const bv = (b[sortKey as keyof SubAdminRow] ?? '').toString().toLowerCase();
    if (av < bv) return -1 * dir;
    if (av > bv) return 1 * dir;
    return 0;
  });
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages - 1);
  const paged = filtered.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE);
  const activeCount = admins.filter((a) => a.status === 'active').length;
  const inactiveCount = admins.filter((a) => a.status === 'inactive').length;

  function setSortBy(key: string) {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
    setPage(0);
  }

  function resetFilters() {
    setSearch('');
    setStatus('');
    setCountryFilter('');
    setCountryOpen(false);
    setSortKey('name');
    setSortDir('asc');
    setPage(0);
  }

  function openCreate() {
    setForm(EMPTY_FORM);
    setFormError('');
    setCreating(true);
  }

  function openEdit(a: SubAdminRow) {
    setForm({ name: a.name, email: a.email, phone: a.phone, password: '', role: a.role, country: a.country, modules: [...a.modules], permissions: [...a.permissions] });
    setFormError('');
    setEditing(a);
    setSelected(null);
    setMenuOpen(null);
  }

  function closeForm() {
    setCreating(false);
    setEditing(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) {
      setFormError('Full Name and Email are required.');
      return;
    }
    if (!editing && !form.password.trim()) {
      setFormError('Password is required.');
      return;
    }
    const role = FORM_TO_ROLE[form.role] ?? 'SUB_ADMIN';
    const countryCode = COUNTRY_SLUG_TO_CODE[form.country] ?? null;
    if (role === 'SUB_ADMIN' && !countryCode) {
      setFormError('Country is required for a Sub Admin.');
      return;
    }
    if (form.modules.length === 0) {
      setFormError('Select at least one module for the sub admin.');
      return;
    }
    setSaving(true);
    let created: AdminUserSummary | null = null;
    try {
      if (editing) {
        await updateAdminUser(editing.id, {
          name: form.name,
          role,
          active: editing.status === 'active',
          countryCode,
          phone: form.phone.trim() || null,
          modules: form.modules,
          permissions: form.permissions,
        });
        notify('Sub admin updated.');
      } else {
        created = await createAdminUser({
          email: form.email,
          password: form.password,
          name: form.name,
          role,
          countryCode,
          phone: form.phone.trim() || null,
          modules: form.modules,
          permissions: form.permissions,
        });
        notify('Sub admin added.');
      }
      setCreating(false);
      setEditing(null);
      setPage(0);
      load();
      /**
       * Open the pass panel straight away. New accounts need the Super Admin's one-time
       * pass to sign in, so mint it *now*, while this browser still holds the super-admin
       * session. Signing in as the new sub-admin replaces that cookie for the whole origin,
       * and every later SUPER_ADMIN call — including generating a pass — 403s until they
       * sign back in as the Super Admin. Doing it in this order means the code is already
       * in hand before they ever log in as the delegate.
       */
      if (created) setPassTarget({ id: created.id, name: created.name });
    } catch (err) {
      setFormError(getErrorMessage(err, 'Something went wrong.'));
    } finally {
      setSaving(false);
    }
  }

  async function toggleStatus(a: SubAdminRow) {
    setMenuOpen(null);
    const activating = a.status !== 'active';
    if (!window.confirm(activating ? `Activate sub admin ${a.name}?` : `Deactivate sub admin ${a.name}? They will lose access immediately.`)) return;
    try {
      await updateAdminUser(a.id, {
        name: a.name,
        role: FORM_TO_ROLE[a.role] ?? 'SUB_ADMIN',
        active: a.status !== 'active',
        countryCode: COUNTRY_SLUG_TO_CODE[a.country] ?? null,
        phone: a.phone || null,
        // Preserve the stored grants — the status toggle must not wipe them.
        modules: a.modules,
        permissions: a.permissions,
      });
      notify(a.status === 'active' ? 'Sub admin deactivated.' : 'Sub admin activated.');
      load();
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Could not update sub admin.', 'error');
    }
  }

  /** Mirrors the backend guards: no SUPER_ADMIN row, and never your own account. */
  function canDelete(a: SubAdminRow): boolean {
    return !a.isSuperAdmin && a.id !== sessionAdmin?.id;
  }

  async function remove(a: SubAdminRow) {
    setMenuOpen(null);
    if (
      !window.confirm(
        `Delete ${a.name} permanently? Their login and any one-time access pass are removed, and this cannot be undone.`,
      )
    ) {
      return;
    }
    try {
      await deleteAdminUser(a.id);
      notify('Sub admin deleted.');
      load();
    } catch (err) {
      notify(getErrorMessage(err, 'Could not delete sub admin.'), 'error');
    }
  }

  function openDashboard(a: SubAdminRow) {
    navigate(`/admin/sub-admin/${a.country}`);
  }

  function getExportData(): ExportData {
    return {
      filename: 'sub-admins.csv',
      title: 'Sub Admin List',
      columns: ['Sub Admin', 'Email', 'Phone', 'Country', 'Role', 'Status', 'Last Login'],
      rows: filtered.map((a) => [a.name, a.email, a.phone, COUNTRY_LABELS[a.country] ?? a.country, a.role, a.status, a.lastLogin]),
    };
  }

  function printList() {
    const d = getExportData();
    printTable({ filename: 'sub-admins.csv', title: d.title, columns: d.columns, rows: d.rows });
  }

  const sortArrow = (key: string): string => (sortKey === key ? (sortDir === 'asc' ? ' ▲' : ' ▼') : '');

  return (
    <div>
      {!embedded && (
        <ScrollReveal>
          <div className={styles.banner}>
            <div className={styles.bannerContent}>
              <div className={csStyles.bannerIcon}>
                <i className="fas fa-user-shield" />
              </div>
              <div>
                <h1 className={styles.bannerTitle}>Sub Admins</h1>
                <p className={styles.bannerSubtitle}>Manage administrator accounts and their access</p>
              </div>
            </div>
            <div className={styles.bannerActions}>
              <ExportMenu getData={getExportData} />
              &nbsp;
              <button type="button" className={styles.bannerBtn} onClick={openCreate}>Add Sub Admin</button>
            </div>
          </div>
        </ScrollReveal>
      )}

      <ScrollReveal delay={100}>
        <div className={csStyles.paleGreenContainer}>
        {/* Filter + Search Toolbar (single row) */}
        <div className={csStyles.searchToolbar}>
          <div className={csStyles.filterRow}>
            {[
              { value: '', label: 'All', count: admins.length },
              { value: 'active', label: 'Active', count: activeCount },
              { value: 'inactive', label: 'Inactive', count: inactiveCount },
            ].map((f) => (
              <button
                key={f.value || 'all'}
                type="button"
                className={`${csStyles.filterTab} ${status === f.value ? csStyles.filterTabActive : ''}`}
                onClick={() => { setStatus(f.value); setPage(0); }}
              >
                {f.label}
                <span className={`${csStyles.filterCount} ${status === f.value ? csStyles.filterCountActive : csStyles.filterCountInactive}`}>
                  {f.count}
                </span>
              </button>
            ))}
          </div>
          <div className={csStyles.searchWrapper}>
            <i className="fas fa-search" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', fontSize: 14, pointerEvents: 'none' }} />
            <input
              className={csStyles.searchInput}
              placeholder="Search name, email, phone..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(0); }}
              style={{ paddingLeft: 36 }}
            />
          </div>
          <div style={{ flexShrink: 0 }}>
            <button
              ref={countryButtonRef}
              type="button"
              onClick={() => setCountryOpen((o) => !o)}
              aria-haspopup="listbox"
              aria-expanded={countryOpen}
              title="Filter sub-admins by country"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 12px', borderRadius: 8, border: '1px solid #E2E8F0', fontSize: 13, fontWeight: 500, background: countryFilter ? '#2E7D32' : '#fff', color: countryFilter ? '#fff' : '#374151', cursor: 'pointer' }}
            >
              {countryFilter ? (
                <img src={COUNTRY_FLAGS[countryFilter]} alt="" style={{ width: 22, height: 15, objectFit: 'cover', borderRadius: 3 }} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              ) : (
                <span aria-hidden="true">🌐</span>
              )}
              {countryFilter ? `${COUNTRY_LABELS[countryFilter] ?? countryFilter} (${admins.filter((a) => a.country === countryFilter).length})` : `All countries (${admins.length})`}
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: countryOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}><polyline points="6 9 12 15 18 9" /></svg>
            </button>
            {countryOpen && createPortal(
              <>
                <div style={{ position: 'fixed', inset: 0, zIndex: 9998 }} onClick={() => setCountryOpen(false)} />
                <div role="listbox" aria-label="Filter sub-admins by country" style={{ position: 'fixed', top: countryMenuPos.top, left: countryMenuPos.left, width: countryMenuPos.width, zIndex: 9999, background: '#fff', border: '1px solid #E2E8F0', borderRadius: 12, boxShadow: '0 12px 32px rgba(0,0,0,.18)', padding: 6 }}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={!countryFilter}
                    onClick={() => { setCountryFilter(''); setPage(0); setCountryOpen(false); }}
                    style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '9px 12px', borderRadius: 8, border: 'none', background: !countryFilter ? '#F0FDF4' : 'transparent', cursor: 'pointer', fontSize: 13, fontWeight: !countryFilter ? 700 : 500, color: '#1E293B', textAlign: 'left' }}
                  >
                    <span aria-hidden="true" style={{ width: 22, textAlign: 'center' }}>🌐</span>
                    <span style={{ flex: 1 }}>All countries ({admins.length})</span>
                    {!countryFilter && <span aria-hidden="true" style={{ color: '#2E7D32', fontWeight: 800 }}>✓</span>}
                  </button>
                  {Object.entries(COUNTRY_LABELS).map(([key, label]) => {
                    const n = admins.filter((a) => a.country === key).length;
                    const active = countryFilter === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        role="option"
                        aria-selected={active}
                        onClick={() => { setCountryFilter(key); setPage(0); setCountryOpen(false); }}
                        style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '9px 12px', borderRadius: 8, border: 'none', background: active ? '#F0FDF4' : 'transparent', cursor: 'pointer', fontSize: 13, fontWeight: active ? 700 : 500, color: '#1E293B', textAlign: 'left' }}
                      >
                        <img src={COUNTRY_FLAGS[key]} alt="" style={{ width: 22, height: 15, objectFit: 'cover', borderRadius: 3, flexShrink: 0 }} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                        <span style={{ flex: 1 }}>{label} ({n})</span>
                        {active && <span aria-hidden="true" style={{ color: '#2E7D32', fontWeight: 800 }}>✓</span>}
                      </button>
                    );
                  })}
                </div>
              </>,
              document.body,
            )}
          </div>
          <div style={{ flex: 1 }} />
          <button type="button" onClick={openCreate} style={{ background: '#2E7D32', color: '#fff', padding: '10px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}>
            <i className="fas fa-plus" /> Add Sub Admin
          </button>
          <button type="button" onClick={resetFilters} style={{ padding: '10px 16px', borderRadius: 8, border: '1px solid #E2E8F0', background: '#F8FAFC', fontSize: 13, fontWeight: 500, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6, color: '#374151', whiteSpace: 'nowrap' }}>
            <i className="fas fa-undo" /> Reset
          </button>
        </div>

        {/* Table Card */}
        <div className={csStyles.tableCard}>
          {/* Table Toolbar */}
          <div className={csStyles.tableToolbar}>
            <button type="button" className={`${csStyles.sortBtn} ${sortKey === 'name' ? csStyles.sortBtnActive : ''}`} onClick={() => setSortBy('name')}>
              Name {sortArrow('name')}
            </button>
            <button type="button" className={`${csStyles.sortBtn} ${sortKey === 'country' ? csStyles.sortBtnActive : ''}`} onClick={() => setSortBy('country')}>
              Country {sortArrow('country')}
            </button>
            <div style={{ flex: 1 }} />
            <ExportMenu getData={getExportData} label="Export" buttonStyle={{ padding: '6px 14px', fontSize: 12, borderRadius: 8 }} />
            <button type="button" className={csStyles.sortBtn} onClick={printList}>
              <i className="fas fa-print" /> Print
            </button>
          </div>

          {filtered.length === 0 ? (
            <div className={styles.panelBody}><p className={styles.placeholder}>No sub-admins found</p></div>
          ) : (
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Sub Admin</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Country</th>
                    <th>Last Login</th>
                    <th>Dashboard</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {paged.map((a) => (
                    <tr key={a.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(22,163,74,.12)', color: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>
                            {(a.name ? a.name.charAt(0).toUpperCase() : '?')}
                          </div>
                          <div style={{ fontWeight: 600 }}>{a.name}</div>
                        </div>
                      </td>
                      <td>{a.email}</td>
                      <td>{a.phone}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <img src={COUNTRY_FLAGS[a.country] ?? 'https://res.cloudinary.com/eqjshlur/image/upload/v1790001490/vpnexues/old/site-assets/assets-ui/img/in-flag.svg'} alt={a.country} title={COUNTRY_LABELS[a.country] ?? a.country} style={{ width: 34, height: 24, objectFit: 'cover', borderRadius: 4, border: '1px solid #E2E8F0' }} />
                          <span style={{ fontWeight: 600 }}>{COUNTRY_LABELS[a.country] ?? a.country}</span>
                        </div>
                      </td>
                      <td>{a.lastLogin || '—'}</td>
                      <td>
                        <button type="button" className={csStyles.sortBtn} onClick={() => openDashboard(a)} style={{ fontSize: 12 }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 4, verticalAlign: 'middle' }}><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg> Dashboard
                        </button>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                          <button type="button" className={csStyles.actionBtn} title="View" onClick={() => setSelected(a)}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                          </button>
                          <div style={{ position: 'relative' }} ref={menuRef}>
                            <button type="button" className={csStyles.actionBtn} title="More actions" onClick={() => setMenuOpen(menuOpen === a.id ? null : a.id)}>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="5" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="12" cy="19" r="1" /></svg>
                            </button>
                            {menuOpen === a.id && (
                              <div onMouseDown={(e) => e.stopPropagation()} style={{ position: 'absolute', right: 0, top: 'calc(100% + 4px)', background: '#fff', border: '1px solid #E2E8F0', borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,.12)', minWidth: 190, zIndex: 50, overflow: 'hidden' }}>
                                <button type="button" onClick={() => openEdit(a)} style={{ display: 'flex', alignItems: 'center', width: '100%', padding: '10px 16px', border: 'none', background: 'transparent', cursor: 'pointer', textAlign: 'left', fontSize: 13, color: '#374151', gap: 10 }} onMouseEnter={(e) => e.currentTarget.style.background = '#F1F5F9'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                                  Edit Sub Admin
                                </button>
                                <button type="button" onClick={() => toggleStatus(a)} style={{ display: 'flex', alignItems: 'center', width: '100%', padding: '10px 16px', border: 'none', background: 'transparent', cursor: 'pointer', textAlign: 'left', fontSize: 13, color: '#374151', gap: 10 }} onMouseEnter={(e) => e.currentTarget.style.background = '#F1F5F9'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                                  {a.status === 'active' ? (
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="4.93" y1="4.93" x2="19.07" y2="19.07" /></svg>
                                  ) : (
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                                  )}
                                  {a.status === 'active' ? 'Disable' : 'Enable'}
                                </button>
                                <button type="button" onClick={() => { setPassTarget(a); setMenuOpen(null); }} style={{ display: 'flex', alignItems: 'center', width: '100%', padding: '10px 16px', border: 'none', background: 'transparent', cursor: 'pointer', textAlign: 'left', fontSize: 13, color: '#374151', gap: 10 }} onMouseEnter={(e) => e.currentTarget.style.background = '#F1F5F9'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#B45309" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" /></svg>
                                  Generate access pass
                                </button>
                                {canDelete(a) && (
                                  <button type="button" onClick={() => remove(a)} style={{ display: 'flex', alignItems: 'center', width: '100%', padding: '10px 16px', border: 'none', background: 'transparent', cursor: 'pointer', textAlign: 'left', fontSize: 13, color: '#DC2626', gap: 10 }} onMouseEnter={(e) => e.currentTarget.style.background = '#FEF2F2'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                                    Delete Sub Admin
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          <div className={styles.panelBody} style={{ display: 'flex', gap: 6, alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', borderTop: '1px solid #E2E8F0' }}>
            <button type="button" className={csStyles.sortBtn} disabled={safePage === 0} onClick={() => setPage(safePage - 1)}>Prev</button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                type="button"
                className={`${csStyles.sortBtn} ${i === safePage ? csStyles.sortBtnActive : ''}`}
                onClick={() => setPage(i)}
              >
                {i + 1}
              </button>
            ))}
            <button type="button" className={csStyles.sortBtn} disabled={safePage + 1 >= totalPages} onClick={() => setPage(safePage + 1)}>Next</button>
          </div>
        </div>
        </div>
      </ScrollReveal>

      {/* Sub Admin Detail Modal */}
      {selected && (
        <Modal title="Sub Admin Details" onClose={() => setSelected(null)} size="wide" headerDark>
          <div style={{ display: 'flex', overflow: 'hidden', minHeight: 420 }}>
            <div className={csStyles.detailSidebar}>
              <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#2E7D32', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, fontWeight: 800, color: '#fff', boxShadow: '0 4px 12px rgba(0,0,0,.2)' }}>
                {selected.name.charAt(0).toUpperCase()}
              </div>
              <h3 style={{ margin: '18px 0 8px', fontSize: 22, fontWeight: 700, color: '#fff' }}>{selected.name}</h3>
              <span style={{ padding: '5px 18px', borderRadius: 20, fontSize: 12, fontWeight: 600, background: 'rgba(255,255,255,.18)', color: '#fff' }}>
                {roleText(selected.role)}
              </span>
            </div>
            <div className={csStyles.detailContent}>
              <h4 style={{ margin: '0 0 16px', fontSize: 18, fontWeight: 700, color: '#1E293B' }}>Sub Admin Information</h4>
              <div className={csStyles.detailGrid2}>
                <DetailRow label="Full Name" value={selected.name} />
                <DetailRow label="Email" value={selected.email} />
                <DetailRow label="Phone" value={selected.phone} />
                <DetailRow label="Country" value={COUNTRY_LABELS[selected.country] ?? selected.country} />
                <DetailRow label="Role" value={roleText(selected.role)} />
                <DetailRow label="Status" value={selected.status.charAt(0).toUpperCase() + selected.status.slice(1)} />
                <DetailRow label="Last Login" value={selected.lastLogin || '—'} />
                <DetailRow label="Created Date" value={selected.createdDate || '—'} />
              </div>
              <h5 style={{ margin: '20px 0 10px', fontSize: 15, fontWeight: 700, color: '#1E293B' }}>Assigned Modules</h5>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {selected.modules && selected.modules.length ? selected.modules.map((m) => (
                  <span key={m} style={{ padding: '5px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600, background: 'rgba(34,197,94,.1)', color: '#16A34A' }}>
                    {m.charAt(0).toUpperCase() + m.slice(1)}
                  </span>
                )) : <span style={{ fontSize: 13, color: '#64748B' }}>None</span>}
              </div>
              <h5 style={{ margin: '18px 0 10px', fontSize: 15, fontWeight: 700, color: '#1E293B' }}>Permissions</h5>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {selected.permissions && selected.permissions.length ? selected.permissions.map((p) => (
                  <span key={p} style={{ padding: '5px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600, background: 'rgba(100,116,139,.1)', color: '#64748B' }}>
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </span>
                )) : <span style={{ fontSize: 13, color: '#64748B' }}>None</span>}
              </div>
            </div>
          </div>
          <div style={{ marginTop: 16, display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button type="button" className={csStyles.sortBtn} onClick={() => setSelected(null)}>Close</button>
          </div>
        </Modal>
      )}

      {/* Add / Edit Modal */}
      {(creating || editing) && (
        <Modal title={editing ? `Edit ${editing.name}` : 'Add New Sub Admin'} onClose={closeForm} headerDark>
          {formError && <p style={{ color: '#DC2626', fontSize: 13 }}>{formError}</p>}
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: 12, marginBottom: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, color: '#64748B', marginBottom: 4 }}>Full Name *</label>
                <input style={fieldStyle} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, color: '#64748B', marginBottom: 4 }}>Email *</label>
                <input style={fieldStyle} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, color: '#64748B', marginBottom: 4 }}>Phone</label>
                <input style={fieldStyle} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
              {!editing && (
                <div>
                  <label style={{ display: 'block', fontSize: 12, color: '#64748B', marginBottom: 4 }}>Password</label>
                  <input type="password" style={fieldStyle} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
                </div>
              )}
              <div>
                <label style={{ display: 'block', fontSize: 12, color: '#64748B', marginBottom: 4 }}>Role *</label>
                <select style={fieldStyle} value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                  <option value="sub-admin">Sub Admin</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, color: '#64748B', marginBottom: 4 }}>Country *</label>
                <select style={fieldStyle} value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })}>
                  {Object.entries(COUNTRY_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>
            </div>
            <Checkboxes title="Assign Modules" options={MODULE_OPTIONS} selected={form.modules} onChange={(modules) => setForm({ ...form, modules })} />
            <Checkboxes title="Assign Permissions" options={PERMISSION_OPTIONS} selected={form.permissions} onChange={(permissions) => setForm({ ...form, permissions })} />
            <div style={{ textAlign: 'right', display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button type="button" className={csStyles.sortBtn} onClick={closeForm}>Cancel</button>
              <button type="submit" disabled={saving} style={{ background: editing ? '#4DA6E1' : '#134B2F', color: '#fff', padding: '8px 20px', borderRadius: 8, fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer' }}>
                {saving ? 'Saving...' : editing ? 'Save Changes' : 'Add Sub Admin'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Feature B — one-time access pass panel */}
      {passTarget && (
        <AccessPassModal
          target={{ id: passTarget.id, name: passTarget.name }}
          onClose={() => setPassTarget(null)}
          onRevoked={load}
        />
      )}
    </div>
  );
}
