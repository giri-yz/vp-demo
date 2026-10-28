import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import * as adminCustomersApi from '../../../api/adminCustomersApi';
import {
  demoAddCustomer,
  demoAddNote,
  demoDeleteCustomer,
  demoGetOrder,
  demoGetUserMeta,
  demoListAddresses,
  demoListNotes,
  demoListOrders,
  demoSaveUserMeta,
  demoUpdateCustomer,
  type DemoNote,
  type DemoUserAddress,
} from '../../../api/demo/demoAdmin';
import type { AdminCustomer, AdminOrderSummary } from '../../../types';
import { getAllCountries } from '../../../config/countryConfig';
import Modal from '../../../components/admin/Modal';
import ScrollReveal from '../../../components/admin/ScrollReveal';
import ExportMenu from '../../../components/admin/ExportMenu';
import { useToast } from '../../../components/admin/Toast';
import { printTable, type ExportData } from '../../../utils/csvExport';
import { getErrorMessage } from '../../../utils/errors';
import styles from '../css/SuperAdminDashboard.module.css';
import csStyles from '../css/CountriesSection.module.css';

type DetailTab = 'overview' | 'orders' | 'products' | 'notes' | 'addresses';
type SubTab = 'info' | 'recent-orders' | 'payment';

const PAGE_SIZE = 10;
const COUNTRY_ORDER = ['india', 'singapore', 'us', 'uae', 'lk'];
const COUNTRY_LABELS: Record<string, string> = { IN: 'india', SG: 'singapore', US: 'us', AE: 'uae', LK: 'lk' };


function deriveCountry(c: AdminCustomer): string {
  if (c.countryCode) return c.countryCode;
  const p = (c.phone ?? '').trim();
  if (p.startsWith('+91')) return 'IN';
  if (p.startsWith('+971') || p.startsWith('+97')) return 'AE';
  if (p.startsWith('+65')) return 'SG';
  if (p.startsWith('+94')) return 'LK';
  if (p.startsWith('+1')) return 'US';
  return '';
}

function countryKey(c: AdminCustomer): string {
  return (COUNTRY_LABELS[deriveCountry(c) ?? ''] ?? (deriveCountry(c) ?? '').toLowerCase());
}

function flagFor(c: AdminCustomer): string {
  const key = countryKey(c);
  return getAllCountries().find((cc) => cc.id === key)?.flagImg ?? '';
}

/**
 * Per-row derived data (status / address / last order / flag).
 *
 * These used to be read straight from localStorage inside `.filter()` and
 * `.map()`, so a single render of a 10-row page cost hundreds of full
 * collection parses. They are now precomputed once per customers load.
 */
type RowInfo = { status: 'active' | 'pending' | 'inactive'; address: string; lastOrder: string; flag: string; code: string };

const EMPTY_INFO: RowInfo = { status: 'active', address: '—', lastOrder: '—', flag: '', code: '' };

function buildRowInfo(customers: AdminCustomer[], allOrders: AdminOrderSummary[]): Map<string, RowInfo> {
  const index = new Map<string, RowInfo>();
  for (const c of customers) {
    const meta = demoGetUserMeta(c.id);
    const addresses = demoListAddresses(c.id);

    const qq = (c.email ?? c.phone).toLowerCase();
    const mine = allOrders.filter((o) =>
      `${o.buyerName ?? ''} ${o.buyerPhone ?? ''}`.toLowerCase().includes(qq),
    );
    const lastOrder = mine.length === 0
      ? '—'
      : new Date(mine.map((o) => o.createdAt).sort().reverse()[0])
          .toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

    index.set(c.id, {
      status: meta.status,
      address: addresses.length > 0 ? `${addresses[0].line}, ${addresses[0].city}` : meta.address,
      lastOrder,
      flag: flagFor(c),
      code: countryCodeDisplay(c),
    });
  }
  return index;
}

function countryCodeDisplay(c: AdminCustomer): string {
  return deriveCountry(c) || '—';
}

export default function SuperUsersView() {
  const [customers, setCustomers] = useState<AdminCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  // Setters unused — filters render via tabs/ExportMenu only.
  const [type] = useState('');
  const [country, setCountry] = useState('');
  const [countryOpen, setCountryOpen] = useState(false);
  const countryButtonRef = useRef<HTMLButtonElement>(null);
  const [countryMenuPos, setCountryMenuPos] = useState({ top: 0, left: 0, width: 230 });
  const [search] = useState('');
  const [sortKey] = useState('name');
  const [sortDir] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<AdminCustomer | null>(null);
  const [detailTab, setDetailTab] = useState<DetailTab>('overview');
  const [subTab, setSubTab] = useState<SubTab>('info');
  const [detailOrders, setDetailOrders] = useState<AdminOrderSummary[]>([]);
  const [notes, setNotes] = useState<DemoNote[]>([]);
  const [addresses, setAddresses] = useState<DemoUserAddress[]>([]);
  const [noteText, setNoteText] = useState('');
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<AdminCustomer | null>(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '', countryCode: 'IN', customerType: 'B2C', address: '', status: 'active', verification: 'verified' });
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const { notify } = useToast();

  function load() {
    setLoading(true);
    // Country is filtered client-side via deriveCountry (phone prefix fallback),
    // so users with no orders (backend countryCode = null) are still included.
    adminCustomersApi
      .listCustomers({ type: type || undefined, search: search || undefined })
      .then((c) => {
        setCustomers(c);
        setError('');
      })
      .catch((err: unknown) => setError(getErrorMessage(err, 'Could not load users.')))
      .finally(() => setLoading(false));
  }

  useEffect(load, [type, search]);

  useEffect(() => {
    if (!countryOpen) return;
    // Portal the menu to document.body (fixed position from the button rect)
    // so the ScrollReveal transform / panel stacking context can't clip it.
    const place = () => {
      const rect = countryButtonRef.current?.getBoundingClientRect();
      if (!rect) return;
      const menuW = Math.max(rect.width, 230);
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

  // Orders are only needed to derive "last order date" per user — read once per
  // customers load rather than once per rendered row (see buildRowInfo).
  const allOrderSummaries = useMemo(() => {
    try {
      return demoListOrders({ size: 1000 }).content;
    } catch {
      return [] as AdminOrderSummary[];
    }
  }, []);

  const rowInfo = useMemo(
    () => buildRowInfo(customers, allOrderSummaries),
    [customers, allOrderSummaries],
  );

  const infoOf = (c: AdminCustomer): RowInfo => rowInfo.get(c.id) ?? EMPTY_INFO;

  const statusCounts = useMemo(() => {
    const counts = { active: 0, pending: 0, inactive: 0 };
    for (const c of customers) counts[rowInfo.get(c.id)?.status ?? 'active']++;
    return counts;
  }, [customers, rowInfo]);

  const q = search.toLowerCase().trim();
  const filtered = useMemo(() => {
    const list = customers.filter(
      (c) =>
        (!statusFilter || infoOf(c).status === statusFilter) &&
        (!country || deriveCountry(c) === country) &&
        (!q || `${c.name ?? ''} ${c.email ?? ''} ${c.phone} ${infoOf(c).address}`.toLowerCase().includes(q)),
    );
    const dir = sortDir === 'asc' ? 1 : -1;
    return [...list].sort((a, b) => {
      const orderOf = (cc: string): number => {
        const i = COUNTRY_ORDER.indexOf(cc);
        return i < 0 ? 99 : i;
      };
      const ca = orderOf(countryKey(a));
      const cb = orderOf(countryKey(b));
      if (ca !== cb) return ca - cb;
      let av: string | number = '';
      let bv: string | number = '';
      if (sortKey === 'name') {
        av = (a.name ?? '').toLowerCase();
        bv = (b.name ?? '').toLowerCase();
      } else if (sortKey === 'orders') {
        av = a.orderCount;
        bv = b.orderCount;
      } else {
        av = a.totalSpent;
        bv = b.totalSpent;
      }
      if (av < bv) return -1 * dir;
      if (av > bv) return 1 * dir;
      return 0;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customers, rowInfo, statusFilter, country, q, sortKey, sortDir]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages - 1);
  const paged = filtered.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE);
  const start = safePage * PAGE_SIZE;
  const end = Math.min(start + paged.length, filtered.length);

  function openDetail(c: AdminCustomer) {
    setSelected(c);
    setDetailTab('overview');
    setSubTab('info');
    const cName = (c.name ?? '').toLowerCase();
    const cPhone = c.phone.toLowerCase();
    const allOrders = demoListOrders({}).content;
    const matched = allOrders.filter((o) => {
      const oName = (o.buyerName ?? '').toLowerCase();
      const oPhone = (o.buyerPhone ?? '').toLowerCase();
      return oName === cName || oPhone === cPhone;
    });
    setDetailOrders(matched.length > 0 ? matched : allOrders.slice(0, 6));
    setNotes(demoListNotes(c.id).length > 0 ? demoListNotes(c.id) : [{ id: 'demo-note-fallback', userId: c.id, text: 'Customer account created and verified.', at: new Date().toISOString() }]);
    setAddresses(demoListAddresses(c.id).length > 0 ? demoListAddresses(c.id) : [{ id: 'demo-addr-fallback', userId: c.id, label: 'Home', line: '123 Main Street', city: c.countryCode === 'IN' ? 'Mumbai' : c.countryCode === 'SG' ? 'Singapore' : c.countryCode === 'AE' ? 'Dubai' : 'New York' }]);
    setNoteText('');
  }

  function addNote() {
    if (!selected || !noteText.trim()) return;
    demoAddNote(selected.id, noteText.trim());
    setNotes(demoListNotes(selected.id));
    setNoteText('');
    notify('Note added.');
  }

  function openCreate() {
    setForm({ name: '', email: '', phone: '', countryCode: 'IN', customerType: 'B2C', address: '', status: 'active', verification: 'verified' });
    setFormError('');
    setCreating(true);
  }

  function openEdit(c: AdminCustomer) {
    const meta = demoGetUserMeta(c.id);
    setForm({ name: c.name ?? '', email: c.email ?? '', phone: c.phone, countryCode: c.countryCode ?? 'IN', customerType: c.customerType, address: meta.address === '—' ? '' : meta.address, status: meta.status, verification: meta.verification });
    setFormError('');
    setEditing(c);
    setSelected(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) {
      setFormError('Full Name and Email are required.');
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        demoUpdateCustomer(editing.id, { name: (form.name || editing.name) ?? '', email: (form.email || editing.email) ?? '', phone: (form.phone || editing.phone) ?? '' });
        demoSaveUserMeta(editing.id, { address: form.address || '—', status: form.status as 'active' | 'pending' | 'inactive', verification: form.verification || 'verified' });
        notify('User updated.');
      } else {
        const created = demoAddCustomer({ name: form.name.trim(), email: form.email.trim(), phone: form.phone || '—', countryCode: form.countryCode, customerType: form.customerType });
        demoSaveUserMeta(created.id, { address: form.address || '—', status: 'active', verification: 'pending' });
        notify('User added.');
      }
      setCreating(false);
      setEditing(null);
      setPage(0);
      load();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setSaving(false);
    }
  }

  function deleteUser(c: AdminCustomer) {
    if (!window.confirm(`Delete ${c.name ?? c.phone}?`)) return;
    try {
      demoDeleteCustomer(c.id);
      setSelected(null);
      load();
      notify('User deleted.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not delete user.');
    }
  }

  function getExportData(): ExportData {
    return {
      filename: 'users.csv',
      title: 'Users',
      columns: ['User', 'Email', 'Phone', 'Address', 'Country', 'Orders', 'Total Spent', 'Last Orders', 'Status'],
      rows: filtered.map((c) => {
        const info = infoOf(c);
        return [c.name ?? '', c.email ?? '', c.phone, info.address.replace(/,/g, ' '), info.code, c.orderCount, c.totalSpent, info.lastOrder, info.status];
      }),
    };
  }

  function printList() {
    const d = getExportData();
    printTable({ filename: 'users.csv', title: d.title, columns: ['User', 'Phone', 'Address', 'Country', 'Orders', 'Total Spent', 'Last Orders'], rows: d.rows.map((r) => [`${r[0]} (${r[1]})`, r[2], r[3], r[4], r[5], r[6], r[7]]) });
  }

  const purchasedItems = useMemo(
    () => detailOrders.flatMap((o) => {
      try {
        return demoGetOrder(o.id).items;
      } catch {
        return [];
      }
    }),
    [detailOrders],
  );

  const meta = useMemo(() => (selected ? demoGetUserMeta(selected.id) : null), [selected]);
  const statusText = meta ? meta.status.charAt(0).toUpperCase() + meta.status.slice(1) : '';
  const statusColor = !meta || meta.status === 'active' ? '#22C55E' : meta.status === 'pending' ? '#CA8A04' : '#EF4444';
  const avgOrder = selected && selected.orderCount > 0 ? `$${(selected.totalSpent / selected.orderCount).toLocaleString(undefined, { maximumFractionDigits: 2 })}` : '$0';

  return (
    <div>
      <ScrollReveal>
      <div className={`${styles.banner} ${styles.usersHero}`}>
        <div className={styles.usersHeroLayer}>
          {/* Dark scrim matching the artwork, hiding the JPEG's own faded title/subtitle */}
          <div className={styles.usersHeroScrim}><div /></div>
          {/* Crisp header copy - same position as the artwork's text, sharp white weight-800 */}
          <div className={styles.usersHeroText}>
            <div className={styles.usersHeroIcon} aria-hidden="true">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
            </div>
            <div>
              <h1 className={`${styles.bannerTitle} ${styles.usersHeroTitle}`}>Users</h1>
              <p className={`${styles.bannerSubtitle} ${styles.usersHeroSub}`}>Manage all registered users across countries</p>
            </div>
          </div>
          {/* Visible buttons laid over the artwork's Export / Add User pills */}
          <div className={`${styles.usersHeroHit} ${styles.usersHeroExportHit}`}>
            <ExportMenu
              getData={getExportData}
              buttonStyle={{
                width: '100%',
                height: '100%',
                padding: 0,
                margin: 0,
                background: 'transparent',
                border: 'none',
                borderRadius: 10,
                color: 'inherit',
                fontSize: 'inherit',
                fontWeight: 'inherit',
                fontFamily: 'inherit',
                boxShadow: 'none',
                cursor: 'pointer',
              }}
            />
          </div>
          <button
            type="button"
            className={`${styles.usersHeroHit} ${styles.usersHeroAddHit}`}
            onClick={openCreate}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><line x1="19" y1="8" x2="19" y2="14" /><line x1="22" y1="11" x2="16" y2="11" /></svg>
            Add User
          </button>
        </div>
      </div>
      </ScrollReveal>

      <ScrollReveal delay={100}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 20 }}>
      <div className={styles.tabs} style={{ marginBottom: 0 }}>
        {['', 'active', 'pending', 'inactive'].map((s) => (
          <button
            key={s || 'all'}
            type="button"
            className={`${styles.tab} ${statusFilter === s ? styles.tabActive : ''}`}
            onClick={() => { setStatusFilter(s); setPage(0); }}
          >
            {s || 'All'} ({s ? statusCounts[s as keyof typeof statusCounts] : customers.length})
          </button>
        ))}
      </div>
      <div style={{ flexShrink: 0 }}>
        <button
          ref={countryButtonRef}
          type="button"
          onClick={() => setCountryOpen((o) => !o)}
          aria-haspopup="listbox"
          aria-expanded={countryOpen}
          title="Filter users by country"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 20, border: '1px solid #E2E8F0', fontSize: 13, fontWeight: 500, background: country ? '#2E7D32' : '#fff', color: country ? '#fff' : '#64748B', cursor: 'pointer' }}
        >
          {(() => {
            const sel = getAllCountries().find((cc) => cc.code === country);
            return sel ? (
              <img src={sel.flagImg} alt="" style={{ width: 22, height: 15, objectFit: 'cover', borderRadius: 3 }} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            ) : (
              <span aria-hidden="true">🌐</span>
            );
          })()}
          {getAllCountries().find((cc) => cc.code === country)?.name ?? 'All countries'} ({country ? customers.filter((c) => deriveCountry(c) === country).length : customers.length})
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: countryOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}><polyline points="6 9 12 15 18 9" /></svg>
        </button>
        {countryOpen && createPortal(
          <>
            <div style={{ position: 'fixed', inset: 0, zIndex: 9998 }} onClick={() => setCountryOpen(false)} />
            <div role="listbox" aria-label="Filter users by country" style={{ position: 'fixed', top: countryMenuPos.top, left: countryMenuPos.left, width: countryMenuPos.width, zIndex: 9999, background: '#fff', border: '1px solid #E2E8F0', borderRadius: 12, boxShadow: '0 12px 32px rgba(0,0,0,.18)', padding: 6 }}>
              <button
                type="button"
                role="option"
                aria-selected={!country}
                onClick={() => { setCountry(''); setPage(0); setCountryOpen(false); }}
                style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '9px 12px', borderRadius: 8, border: 'none', background: !country ? '#F0FDF4' : 'transparent', cursor: 'pointer', fontSize: 13, fontWeight: !country ? 700 : 500, color: '#1E293B', textAlign: 'left' }}
              >
                <span aria-hidden="true" style={{ width: 22, textAlign: 'center' }}>🌐</span>
                <span style={{ flex: 1 }}>All countries ({customers.length})</span>
                {!country && <span aria-hidden="true" style={{ color: '#2E7D32', fontWeight: 800 }}>✓</span>}
              </button>
              {getAllCountries().map((cc) => {
                const n = customers.filter((c) => deriveCountry(c) === cc.code).length;
                const active = country === cc.code;
                return (
                  <button
                    key={cc.code}
                    type="button"
                    role="option"
                    aria-selected={active}
                    onClick={() => { setCountry(cc.code); setPage(0); setCountryOpen(false); }}
                    style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '9px 12px', borderRadius: 8, border: 'none', background: active ? '#F0FDF4' : 'transparent', cursor: 'pointer', fontSize: 13, fontWeight: active ? 700 : 500, color: '#1E293B', textAlign: 'left' }}
                  >
                    <img src={cc.flagImg} alt="" style={{ width: 22, height: 15, objectFit: 'cover', borderRadius: 3, flexShrink: 0 }} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                    <span style={{ flex: 1 }}>{cc.name} ({n})</span>
                    {active && <span aria-hidden="true" style={{ color: '#2E7D32', fontWeight: 800 }}>✓</span>}
                  </button>
                );
              })}
            </div>
          </>,
          document.body,
        )}
      </div>
      </div>
      </ScrollReveal>

      <ScrollReveal delay={100}>
      <div className={`${styles.panel} ${styles.panelLight}`}>
        <div className={styles.panelHeader}>
          <h2 className={styles.panelTitle}>
            {filtered.length ? (country ? `Showing ${start + 1}-${end} of ${filtered.length} users in ${getAllCountries().find((cc) => cc.code === country)?.name ?? country}` : `${filtered.length} users`) : 'No users found'}
          </h2>
          <button type="button" className={styles.viewButton} onClick={printList} style={{ marginLeft: 'auto' }} title="Download the current list as CSV">
            <i className="fas fa-print" /> Print CSV
          </button>
        </div>
        {loading ? (
          <div className={styles.panelBody}><p className={styles.placeholder}>Loading...</p></div>
        ) : error ? (
          <div className={styles.panelBody}>
            <p className={styles.placeholder}>{error}</p>
            <button type="button" className={styles.viewButton} onClick={load}>Retry</button>
          </div>
        ) : filtered.length === 0 ? (
          <div className={styles.panelBody}><p className={styles.placeholder}>No users found</p></div>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr><th>User</th><th>Phone</th><th>Address</th><th>Country</th><th>Orders</th><th>Total Spent</th><th>Last Orders</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {paged.map((c) => {
                  const info = infoOf(c);
                  const addr = info.address;
                  const flag = info.flag;
                  return (
                    <tr key={c.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(30,64,175,.12)', color: '#1e40af', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>
                            {(c.name ? c.name.charAt(0).toUpperCase() : '?')}
                          </div>
                          <div>
                            <button type="button" onClick={(e) => { e.stopPropagation(); openDetail(c); }} style={{ fontWeight: 600, color: '#1e40af', background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontSize: 'inherit', textAlign: 'left' }}>{c.name}</button>
                            <div style={{ fontSize: 11, color: '#64748B' }}>{c.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>{c.phone}</td>
                      <td style={{ maxWidth: 220 }}><span style={{ fontSize: 12, display: 'block', whiteSpace: 'normal', lineHeight: 1.4 }}>{addr}</span></td>
                      <td>{flag && <img src={flag} alt="" style={{ width: 24, height: 16, objectFit: 'cover', borderRadius: 3 }} />}</td>
                      <td><span style={{ padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: 'rgba(22,163,74,.1)' }}>{c.orderCount}</span></td>
                      <td style={{ fontWeight: 600 }}>${c.totalSpent.toLocaleString()}</td>
                      <td>{info.lastOrder}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                          <button type="button" className={csStyles.actionBtn} title="View" onClick={(e) => { e.stopPropagation(); openDetail(c); }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        <div className={styles.panelBody} style={{ display: 'flex', gap: 6, alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button type="button" className={styles.viewButton} disabled={safePage === 0} onClick={() => setPage(safePage - 1)}>Prev</button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              type="button"
              className={styles.viewButton}
              style={i === safePage ? {} : { background: '#F1F5F9', color: '#64748B' }}
              onClick={() => setPage(i)}
            >
              {i + 1}
            </button>
          ))}
          <button type="button" className={styles.viewButton} disabled={safePage + 1 >= totalPages} onClick={() => setPage(safePage + 1)}>Next</button>
        </div>
      </div>
      </ScrollReveal>

      {selected && meta && (
        <Modal title={`${selected.name ?? selected.phone} — User Details`} onClose={() => setSelected(null)} size="wide">
          <div style={{ border: '1px solid #e2e8f0', borderRadius: 14, overflow: 'hidden', marginBottom: 20 }}>
            <div style={{ background: '#134B2F', padding: '20px 22px', color: '#fff', display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ width: 62, height: 62, borderRadius: '50%', background: 'rgba(255,255,255,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
                <img src={flagFor(selected)} alt="" style={{ width: 30, height: 20, objectFit: 'cover', borderRadius: 4, border: '1px solid rgba(255,255,255,.5)' }} />
              </div>
              <div style={{ flex: 1, minWidth: 180 }}>
                <h3 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#fff' }}>{selected.name}</h3>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,.85)', marginTop: 3 }}>{selected.email} · {selected.phone}</div>
                <span style={{ display: 'inline-block', marginTop: 8, padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, background: statusColor }}>{statusText}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, minWidth: 280 }}>
                <div style={{ background: 'rgba(255,255,255,.15)', borderRadius: 10, padding: '12px 14px', textAlign: 'center' }}>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,.8)', textTransform: 'uppercase', letterSpacing: '.5px' }}>Orders</div>
                  <div style={{ fontSize: 20, fontWeight: 800, marginTop: 3 }}>{selected.orderCount}</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,.15)', borderRadius: 10, padding: '12px 14px', textAlign: 'center' }}>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,.8)', textTransform: 'uppercase', letterSpacing: '.5px' }}>Total Spent</div>
                  <div style={{ fontSize: 16, fontWeight: 800, marginTop: 3 }}>${selected.totalSpent.toLocaleString()}</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,.15)', borderRadius: 10, padding: '12px 14px', textAlign: 'center' }}>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,.8)', textTransform: 'uppercase', letterSpacing: '.5px' }}>Verification</div>
                  <div style={{ fontSize: 14, fontWeight: 800, marginTop: 3 }}>{meta.verification.charAt(0).toUpperCase() + meta.verification.slice(1)}</div>
                </div>
              </div>
            </div>
            <div style={{ padding: '20px 22px' }}>
              <h4 style={{ margin: '0 0 14px', fontSize: 16, fontWeight: 700 }}>User Information</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {([
                  ['Full Name', selected.name ?? '—'],
                  ['Email', selected.email ?? '—'],
                  ['Phone', selected.phone],
                    ['Country', countryCodeDisplay(selected)],
                  ['Joined', selected.registeredAt ? new Date(selected.registeredAt).toLocaleDateString() : '—'],
                  ['Status', statusText],
                ] as const).map(([k, v]) => (
                  <div key={k} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: '11px 13px' }}>
                    <div style={{ fontSize: 10, color: '#64748b', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 4 }}>{k}</div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{v}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className={styles.tabs} style={{ marginTop: 8 }}>
            {(['overview', 'orders', 'products', 'notes', 'addresses'] as DetailTab[]).map((t) => (
              <button
                key={t}
                type="button"
                className={`${styles.tab} ${detailTab === t ? styles.tabActive : ''}`}
                onClick={() => setDetailTab(t)}
              >
                {t === 'orders' ? 'Order History' : t === 'products' ? 'Products Purchased' : t === 'notes' ? 'Notes & Activity' : t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>

          {detailTab === 'overview' && (
            <div>
              <div className={styles.tabs}>
                {(['info', 'recent-orders', 'payment'] as SubTab[]).map((t) => (
                  <button
                    key={t}
                    type="button"
                    className={`${styles.tab} ${subTab === t ? styles.tabActive : ''}`}
                    onClick={() => setSubTab(t)}
                  >
                    {t === 'info' ? 'User Information' : t === 'recent-orders' ? 'Recent Orders' : 'Payment Summary'}
                  </button>
                ))}
              </div>
              {subTab === 'info' && (
                <div style={{ marginTop: 4 }}>
                  {([
                    ['Full Name', selected.name ?? '—'],
                    ['Email', selected.email ?? '—'],
                    ['Phone', selected.phone],
                  ['Country', countryCodeDisplay(selected)],
                    ['Joined', selected.registeredAt ? new Date(selected.registeredAt).toLocaleDateString() : '—'],
                    ['Status', statusText],
                  ] as const).map(([k, v]) => (
                    <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 0', borderBottom: '1px solid #f1f5f9' }}>
                      <div style={{ fontSize: 13, color: '#64748B', whiteSpace: 'nowrap', flexShrink: 0, minWidth: 110 }}>{k}</div>
                      <div style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v}</div>
                    </div>
                  ))}
                </div>
              )}
              {subTab === 'recent-orders' && (
                detailOrders.length === 0 ? <p className={styles.placeholder}>No recent orders.</p> : (
                  <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                      <thead><tr><th>Order</th><th>Date</th><th>Amount</th><th>Status</th></tr></thead>
                      <tbody>
                        {detailOrders.slice(0, 5).map((o) => (
                          <tr key={o.id}><td style={{ fontWeight: 600 }}>{o.orderNumber}</td><td>{new Date(o.createdAt).toLocaleDateString()}</td><td style={{ fontWeight: 700 }}>${o.grandTotal.toLocaleString()}</td><td>{o.status}</td></tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )
              )}
              {subTab === 'payment' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14, marginTop: 8 }}>
                  {([
                    ['Total Spent', `$${selected.totalSpent.toLocaleString()}`],
                    ['Total Orders', String(selected.orderCount)],
                    ['Avg. Order Value', avgOrder],
                  ] as const).map(([k, v]) => (
                    <div key={k} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: '14px 16px', textAlign: 'center' }}>
                      <div style={{ fontSize: 11, color: '#64748B', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 6 }}>{k}</div>
                      <div style={{ fontSize: 18, fontWeight: 700, color: '#111827' }}>{v}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {detailTab === 'orders' && (
            detailOrders.length === 0 ? <p className={styles.placeholder}>No orders found for this user.</p> : (
              <div>
                <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: 140, background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, padding: '12px 16px', textAlign: 'center' }}>
                    <div style={{ fontSize: 11, color: '#16A34A', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.5px' }}>Total Orders</div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: '#15803D', marginTop: 4 }}>{detailOrders.length}</div>
                  </div>
                  <div style={{ flex: 1, minWidth: 140, background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 10, padding: '12px 16px', textAlign: 'center' }}>
                    <div style={{ fontSize: 11, color: '#2563EB', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.5px' }}>Total Spent</div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: '#1D4ED8', marginTop: 4 }}>${detailOrders.reduce((s, o) => s + o.grandTotal, 0).toLocaleString()}</div>
                  </div>
                  <div style={{ flex: 1, minWidth: 140, background: '#fefce8', border: '1px solid #fde68a', borderRadius: 10, padding: '12px 16px', textAlign: 'center' }}>
                    <div style={{ fontSize: 11, color: '#CA8A04', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.5px' }}>Avg. Order</div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: '#A16207', marginTop: 4 }}>${(detailOrders.reduce((s, o) => s + o.grandTotal, 0) / detailOrders.length).toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {detailOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((o) => {
                    const sc = o.status === 'DELIVERED' ? '#22C55E' : o.status === 'PROCESSING' ? '#3B82F6' : o.status === 'CANCELLED' ? '#EF4444' : o.status === 'SHIPPED' ? '#F59E0B' : '#6B7280';
                    const bg = o.status === 'DELIVERED' ? '#f0fdf4' : o.status === 'PROCESSING' ? '#eff6ff' : o.status === 'CANCELLED' ? '#fef2f2' : o.status === 'SHIPPED' ? '#fffbeb' : '#f9fafb';
                    return (
                      <div key={o.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, transition: 'box-shadow 0.2s' }}>
                        <div style={{ width: 42, height: 42, borderRadius: 10, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <span style={{ fontSize: 18 }}>{o.status === 'DELIVERED' ? '✅' : o.status === 'PROCESSING' ? '⏳' : o.status === 'CANCELLED' ? '❌' : o.status === 'SHIPPED' ? '🚚' : '📋'}</span>
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                            <span style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>#{o.orderNumber}</span>
                            <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 12, fontWeight: 600, background: bg, color: sc, border: `1px solid ${sc}30` }}>{o.status.charAt(0) + o.status.slice(1).toLowerCase()}</span>
                          </div>
                          <div style={{ fontSize: 12, color: '#64748B' }}>{new Date(o.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} &middot; {o.channel}</div>
                        </div>
                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                          <div style={{ fontSize: 16, fontWeight: 800, color: '#111827' }}>${o.grandTotal.toLocaleString()}</div>
                          <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>#{o.id.slice(-6)}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )
          )}

          {detailTab === 'products' && (
            purchasedItems.length === 0 ? <p className={styles.placeholder}>No products purchased yet.</p> : (
              <div>
                <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: 140, background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, padding: '12px 16px', textAlign: 'center' }}>
                    <div style={{ fontSize: 11, color: '#16A34A', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.5px' }}>Unique Products</div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: '#15803D', marginTop: 4 }}>{new Set(purchasedItems.map((i) => i.name)).size}</div>
                  </div>
                  <div style={{ flex: 1, minWidth: 140, background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 10, padding: '12px 16px', textAlign: 'center' }}>
                    <div style={{ fontSize: 11, color: '#2563EB', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.5px' }}>Total Qty</div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: '#1D4ED8', marginTop: 4 }}>{purchasedItems.reduce((s, i) => s + i.qty, 0)}</div>
                  </div>
                  <div style={{ flex: 1, minWidth: 140, background: '#fefce8', border: '1px solid #fde68a', borderRadius: 10, padding: '12px 16px', textAlign: 'center' }}>
                    <div style={{ fontSize: 11, color: '#CA8A04', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.5px' }}>Total Value</div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: '#A16207', marginTop: 4 }}>${purchasedItems.reduce((s, i) => s + i.lineTotal, 0).toLocaleString()}</div>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
                  {(() => {
                    const grouped = new Map<string, { qty: number; total: number; unitPrice: number; boxType: string | null }>();
                    for (const item of purchasedItems) {
                      const existing = grouped.get(item.name) ?? { qty: 0, total: 0, unitPrice: item.unitPrice, boxType: item.boxType };
                      existing.qty += item.qty;
                      existing.total += item.lineTotal;
                      grouped.set(item.name, existing);
                    }
                    return [...grouped.entries()].map(([name, data]) => (
                      <div key={name} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(22,163,74,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>🛒</div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 13, fontWeight: 700, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</div>
                            {data.boxType && <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>{data.boxType}</div>}
                          </div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderTop: '1px solid #f1f5f9', paddingTop: 8, marginTop: 2 }}>
                          <div style={{ fontSize: 12, color: '#64748B' }}>Qty: <span style={{ fontWeight: 700, color: '#334155' }}>{data.qty}</span></div>
                          <div style={{ fontSize: 14, fontWeight: 800, color: '#16A34A' }}>${data.total.toLocaleString()}</div>
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              </div>
            )
          )}

          {detailTab === 'notes' && (
            <div>
              {notes.length === 0 && <p className={styles.placeholder}>No notes yet.</p>}
              {notes.map((n) => (
                <div key={n.id} style={{ display: 'flex', gap: 10, padding: '11px 14px', border: '1px solid #e2e8f0', borderRadius: 10, background: '#fff', marginBottom: 8 }}>
                  <div style={{ color: '#d97706', fontSize: 13, marginTop: 2 }}>📝</div>
                  <div><div style={{ fontSize: 13 }}>{n.text}</div><div style={{ fontSize: 11, color: '#64748b', marginTop: 3 }}>{new Date(n.at).toLocaleString()}</div></div>
                </div>
              ))}
              <h4 style={{ margin: '22px 0 12px', fontSize: 16, fontWeight: 700 }}>Activity</h4>
              <div style={{ border: '1px solid #e2e8f0', borderRadius: 10, background: '#fff', padding: '14px 16px' }}>
                {detailOrders.length === 0 ? <p className={styles.placeholder}>No recent activity.</p> : detailOrders.slice(0, 5).map((o) => (
                  <div key={o.id} style={{ display: 'flex', gap: 10, padding: '10px 0' }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#16A34A', marginTop: 5, flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13 }}>Order {o.orderNumber} {o.status.toLowerCase()}</div>
                      <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{new Date(o.createdAt).toLocaleString()}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                <input placeholder="Add a note..." value={noteText} onChange={(e) => setNoteText(e.target.value)} style={{ flex: 1, padding: '8px 12px', borderRadius: 8, border: '1px solid #E2E8F0', fontSize: 13 }} />
                <button type="button" className={styles.viewButton} onClick={addNote}>Add</button>
              </div>
            </div>
          )}

          {detailTab === 'addresses' && (
            addresses.length === 0 ? <p className={styles.placeholder}>No saved addresses.</p> : (
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
                  {addresses.map((a, idx) => (
                    <div key={a.id} style={{ background: '#fff', border: idx === 0 ? '2px solid #22C55E' : '1px solid #e2e8f0', borderRadius: 12, padding: 0, overflow: 'hidden' }}>
                      {idx === 0 && (
                        <div style={{ background: '#f0fdf4', padding: '6px 16px', borderBottom: '1px solid #bbf7d0', display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontSize: 12 }}>⭐</span>
                          <span style={{ fontSize: 11, fontWeight: 700, color: '#16A34A', textTransform: 'uppercase', letterSpacing: '.5px' }}>Default Address</span>
                        </div>
                      )}
                      <div style={{ padding: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                          <div style={{ width: 38, height: 38, borderRadius: 10, background: a.label === 'Home' ? '#f0fdf4' : '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
                            {a.label === 'Home' ? '🏠' : a.label === 'Work' ? '🏢' : '📍'}
                          </div>
                          <div>
                            <div style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>{a.label}</div>
                            <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 1 }}>Address {idx + 1} of {addresses.length}</div>
                          </div>
                        </div>
                        <div style={{ background: '#f8fafc', borderRadius: 8, padding: '12px 14px' }}>
                          <div style={{ fontSize: 13, color: '#334155', lineHeight: 1.6 }}>
                            <div style={{ fontWeight: 600 }}>{a.line}</div>
                            <div>{a.city}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          )}

          <div style={{ marginTop: 16, display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button type="button" className={styles.viewButton} onClick={() => openEdit(selected)}>Edit</button>
            <button type="button" className={styles.viewButton} onClick={() => deleteUser(selected)}>Delete</button>
          </div>
        </Modal>
      )}

      {(creating || editing) && (
        <Modal title={editing ? `Edit ${editing.name ?? editing.phone}` : 'Add New User'} onClose={() => { setCreating(false); setEditing(null); }}>
          {formError && <p style={{ color: '#DC2626', fontSize: 13 }}>{formError}</p>}
          <form onSubmit={(e) => void handleSubmit(e)}>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', fontSize: 12, marginBottom: 4 }}>Name</label>
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={{ width: '100%', padding: '8px 12px' }} />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', fontSize: 12, marginBottom: 4 }}>Email</label>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} style={{ width: '100%', padding: '8px 12px' }} />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', fontSize: 12, marginBottom: 4 }}>Phone</label>
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} style={{ width: '100%', padding: '8px 12px' }} />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', fontSize: 12, marginBottom: 4 }}>Address</label>
              <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} style={{ width: '100%', padding: '8px 12px' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: 12, marginBottom: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, marginBottom: 4 }}>Country</label>
                <select value={form.countryCode} onChange={(e) => setForm({ ...form, countryCode: e.target.value })}>
                  <option value="IN">India</option><option value="SG">Singapore</option>
                  <option value="AE">UAE</option><option value="US">US</option>
                  <option value="LK">Sri Lanka</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, marginBottom: 4 }}>Type</label>
                <select value={form.customerType} onChange={(e) => setForm({ ...form, customerType: e.target.value })}>
                  <option value="B2C">B2C</option><option value="B2B">B2B</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, marginBottom: 4 }}>Status</label>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  <option value="active">Active</option><option value="pending">Pending</option><option value="inactive">Inactive</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, marginBottom: 4 }}>Verification</label>
                <select value={form.verification} onChange={(e) => setForm({ ...form, verification: e.target.value })}>
                  <option value="verified">Verified</option><option value="pending">Pending</option>
                </select>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <button type="submit" className={styles.viewButton} disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
