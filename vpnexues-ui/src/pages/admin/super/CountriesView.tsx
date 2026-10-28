import { useEffect, useState } from 'react';
import {
  demoCreateCountry,
  demoDeleteCountry,
  demoGetCountry,
  demoListCountries,
  demoUpdateCountry,
  type DemoCountry,
} from '../../../api/demo/demoAdmin';
import Modal from '../../../components/admin/Modal';
import ExportMenu from '../../../components/admin/ExportMenu';
import { useToast } from '../../../components/admin/Toast';
import { printTable, type ExportData } from '../../../utils/csvExport';
import styles from '../css/SuperAdminDashboard.module.css';
import csStyles from '../css/CountriesSection.module.css';

const PAGE_SIZE = 10;

import CountryFlag from '../../../components/admin/CountryFlag';

interface CountryForm {
  name: string;
  code: string;
  currency: string;
  currencyCode: string;
  currencySymbol: string;
  phoneCode: string;
  language: string;
  timezone: string;
  admin: string;
  adminEmail: string;
  details: string;
}

const EMPTY_FORM: CountryForm = {
  name: '', code: '', currency: '', currencyCode: '', currencySymbol: '',
  phoneCode: '', language: '', timezone: '', admin: '', adminEmail: '', details: '',
};

const fieldStyle: React.CSSProperties = { width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #E2E8F0', fontSize: 13, boxSizing: 'border-box', transition: 'border-color .2s' };
const labelStyle: React.CSSProperties = { display: 'block', fontSize: 11, color: '#134B2F', textTransform: 'uppercase' as const, letterSpacing: '.5px', fontWeight: 500, marginBottom: 6 };

function parseRevenue(value: string | number): number {
  if (typeof value === 'number') return value;
  return Number(String(value).replace(/[^0-9.]/g, '')) || 0;
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: '14px 16px', boxShadow: '0 1px 3px rgba(0,0,0,.06)' }}>
      <div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 5, fontWeight: 500 }}>{label}</div>
      <div style={{ fontSize: 14, fontWeight: 600, color: '#111' }}>{value}</div>
    </div>
  );
}

export default function CountriesView({ embedded = false }: { embedded?: boolean }) {
  const [countries, setCountries] = useState<DemoCountry[]>([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [sortKey, setSortKey] = useState('name');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<DemoCountry | null>(null);
  const [editing, setEditing] = useState<DemoCountry | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<CountryForm>(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const { notify } = useToast();

  function load() {
    setCountries(demoListCountries());
  }

  useEffect(load, []);

  const q = search.toLowerCase().trim();
  let filtered = countries.filter(
    (c) =>
      (!status || c.status === status) &&
      (!q || `${c.name} ${c.code} ${c.currencyCode} ${c.currency} ${c.adminEmail} ${c.phoneCode} ${c.language} ${c.timezone}`.toLowerCase().includes(q)),
  );
  const dir = sortDir === 'asc' ? 1 : -1;
  filtered = [...filtered].sort((a, b) => {
    let av: string | number = '';
    let bv: string | number = '';
    if (sortKey === 'name') {
      av = a.name.toLowerCase();
      bv = b.name.toLowerCase();
    } else if (sortKey === 'orders') {
      av = a.orders;
      bv = b.orders;
    } else {
      av = parseRevenue(a.revenue);
      bv = parseRevenue(b.revenue);
    }
    if (av < bv) return -1 * dir;
    if (av > bv) return 1 * dir;
    return 0;
  });
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages - 1);
  const paged = filtered.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE);

  const allCount = countries.length;
  const activeCount = countries.filter((c) => c.status === 'active').length;
  const inactiveCount = countries.filter((c) => c.status === 'inactive').length;

  function setSortBy(key: string) {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
    setPage(0);
  }

  function handleDeleteCountry(c: DemoCountry) {
    if (!window.confirm(`Delete ${c.name} (${c.code})?`)) return;
    try {
      demoDeleteCountry(c.id);
      notify('Country deleted.');
      load();
      setPage(0);
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Failed to delete country.');
    }
  }

  function resetFilters() {
    setSearch('');
    setStatus('');
    setSortKey('name');
    setSortDir('asc');
    setPage(0);
  }

  function openCreate() {
    setForm(EMPTY_FORM);
    setFormError('');
    setCreating(true);
  }

  function openEdit(c: DemoCountry) {
    setForm({
      name: c.name, code: c.code, currency: c.currency, currencyCode: c.currencyCode,
      currencySymbol: c.currencySymbol, phoneCode: c.phoneCode, language: c.language,
      timezone: c.timezone, admin: c.admin, adminEmail: c.adminEmail, details: c.details || '',
    });
    setFormError('');
    setEditing(c);
    setSelected(null);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.code.trim()) {
      setFormError('Country Name and Country Code are required.');
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        demoUpdateCountry(editing.id, {
          name: form.name || editing.name,
          code: form.code || editing.code,
          currency: form.currency || editing.currency,
          currencyCode: form.currencyCode || editing.currencyCode,
          currencySymbol: form.currencySymbol,
          phoneCode: form.phoneCode || editing.phoneCode,
          language: form.language || editing.language,
          timezone: form.timezone || editing.timezone,
          admin: form.admin || editing.admin,
          adminEmail: form.adminEmail || editing.adminEmail,
          details: form.details,
        });
        notify('Country updated.');
      } else {
        demoCreateCountry({ ...form });
        notify('Country added.');
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

  function getExportData(): ExportData {
    return {
      filename: 'countries.csv',
      title: 'Country List',
      columns: ['Country', 'Code', 'Currency', 'CurrencyCode', 'Symbol', 'PhoneCode', 'Language', 'Timezone', 'Orders', 'Revenue', 'Admin', 'AdminEmail', 'Status'],
      rows: filtered.map((c) => [c.name, c.code, c.currency, c.currencyCode, c.currencySymbol, c.phoneCode, c.language, c.timezone, c.orders, c.revenue, c.admin, c.adminEmail, c.status]),
    };
  }

  function printList() {
    const d = getExportData();
    printTable({ filename: 'countries.csv', title: d.title, columns: d.columns, rows: d.rows });
  }

  const sortArrow = (key: string): string => (sortKey === key ? (sortDir === 'asc' ? ' ▲' : ' ▼') : '');

  return (
    <div>
      {!embedded && (
        <div className={styles.banner}>
          <div className={styles.bannerContent}>
            <div className={csStyles.bannerIcon}>
              <i className="fas fa-globe-americas" />
            </div>
            <div>
              <h1 className={styles.bannerTitle}>Countries</h1>
              <p className={styles.bannerSubtitle}>Configured store countries and their regional settings</p>
            </div>
          </div>
          <div className={styles.bannerActions}>
            <ExportMenu getData={getExportData} />
            &nbsp;
            <button type="button" className={styles.bannerBtn} onClick={openCreate}>Add Country</button>
          </div>
        </div>
      )}

      <div className={csStyles.paleGreenContainer}>
        {/* Filter + Search Toolbar (single row) */}
        <div className={csStyles.searchToolbar}>
          <div className={csStyles.filterRow}>
            {[
              { value: '', label: 'All', count: allCount },
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
              placeholder="Search countries, codes, currencies..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(0); }}
              style={{ paddingLeft: 36 }}
            />
          </div>
          <div style={{ flex: 1 }} />
          <button type="button" className={styles.bannerBtn} onClick={openCreate} style={{ background: '#2E7D32', color: '#fff', padding: '10px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}>
            <i className="fas fa-plus" /> Add Country
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
            <button type="button" className={`${csStyles.sortBtn} ${sortKey === 'orders' ? csStyles.sortBtnActive : ''}`} onClick={() => setSortBy('orders')}>
              Orders {sortArrow('orders')}
            </button>
            <button type="button" className={`${csStyles.sortBtn} ${sortKey === 'revenue' ? csStyles.sortBtnActive : ''}`} onClick={() => setSortBy('revenue')}>
              Revenue {sortArrow('revenue')}
            </button>
            <div style={{ flex: 1 }} />
            <ExportMenu getData={getExportData} label="Export" buttonStyle={{ padding: '6px 14px', fontSize: 12, borderRadius: 8 }} />
            <button type="button" className={csStyles.sortBtn} onClick={printList}>
              <i className="fas fa-print" /> Print
            </button>
          </div>

          {filtered.length === 0 ? (
            <div className={styles.panelBody}><p className={styles.placeholder}>No countries found</p></div>
          ) : (
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Country</th>
                    <th>Currency</th>
                    <th>Phone Code</th>
                    <th>Language</th>
                    <th>Timezone</th>
                    <th>Orders</th>
                    <th>Revenue</th>
                    <th>Admin</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paged.map((c) => (
                    <tr key={c.id}>
                      <td>
                        <div className={styles.tableCountry} onClick={() => setSelected(demoGetCountry(c.id))} title={`View ${c.name} details`} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <CountryFlag code={c.code} name={c.name} />
                          <span style={{ fontWeight: 600 }}>{c.name}</span>
                        </div>
                      </td>
                      <td><div style={{ fontWeight: 600 }}>{c.currencySymbol} {c.currencyCode}</div><div style={{ fontSize: 11, color: '#64748B' }}>{c.currency}</div></td>
                      <td>{c.phoneCode}</td>
                      <td>{c.language}</td>
                      <td>{c.timezone}</td>
                      <td style={{ fontWeight: 600 }}>{c.orders}</td>
                      <td style={{ fontWeight: 600 }}>{c.currencySymbol}{c.revenue}</td>
                      <td><div style={{ fontWeight: 600 }}>{c.admin}</div><div style={{ fontSize: 11, color: '#64748B' }}>{c.adminEmail}</div></td>
                      <td>
                        <button type="button" className={csStyles.actionBtn} title="View" onClick={() => setSelected(demoGetCountry(c.id))}>
                          <i className="fas fa-eye" />
                        </button>
                        <button type="button" className={csStyles.actionBtn} title="Edit" onClick={(e) => { e.stopPropagation(); openEdit(c); }}>
                          <i className="fas fa-pencil-alt" />
                        </button>
                        <button type="button" className={`${csStyles.actionBtn} ${csStyles.actionBtnDanger}`} title="Delete" onClick={(e) => { e.stopPropagation(); handleDeleteCountry(c); }}>
                          <i className="fas fa-trash-alt" />
                        </button>
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

      {/* Country Detail Modal */}
      {selected && (
        <Modal title="Country Details" onClose={() => setSelected(null)} size="wide" headerDark>
          <div style={{ display: 'flex', borderRadius: 0, overflow: 'hidden', minHeight: 420 }}>
            <div className={csStyles.detailSidebar}>
              <div style={{ width: 180, height: 120, borderRadius: 14, overflow: 'hidden', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 20px rgba(0,0,0,.15)' }}>
                <CountryFlag code={selected.code} name={selected.name} />
              </div>
              <h3 style={{ margin: '18px 0 8px', fontSize: 22, fontWeight: 700, color: '#fff' }}>{selected.name}</h3>
              <span style={{ padding: '5px 18px', borderRadius: 20, fontSize: 12, fontWeight: 600, background: 'rgba(255,255,255,.2)', color: '#fff' }}>
                {selected.status.charAt(0).toUpperCase() + selected.status.slice(1)}
              </span>
            </div>
            <div className={csStyles.detailContent}>
              <h4 style={{ margin: '0 0 16px', fontSize: 18, fontWeight: 700, color: '#1E293B' }}>Country Details</h4>
              <div className={csStyles.detailGrid3}>
                <DetailRow label="Country Name" value={selected.name} />
                <DetailRow label="Country Code" value={selected.code} />
                <DetailRow label="Currency" value={`${selected.currencySymbol} ${selected.currencyCode}`} />
                <DetailRow label="Phone Code" value={selected.phoneCode} />
                <DetailRow label="Language" value={selected.language} />
                <DetailRow label="Timezone" value={selected.timezone} />
                <DetailRow label="Orders" value={String(selected.orders)} />
                <DetailRow label="Total Orders" value={String(selected.orders)} />
                <DetailRow label="Revenue" value={`${selected.currencySymbol}${selected.revenue}`} />
                <DetailRow label="Customers" value={String(selected.customers || 0)} />
              </div>
              <h5 style={{ margin: '20px 0 10px', fontSize: 15, fontWeight: 700, color: '#1E293B' }}>Additional Information</h5>
              <div className={csStyles.detailGrid3}>
                <DetailRow label="Cities" value={selected.cities || '—'} />
                <DetailRow label="Created Date" value={selected.createdDate || '—'} />
                <DetailRow label="Last Updated" value={selected.lastUpdatedDate || '—'} />
              </div>
            </div>
          </div>
          <div style={{ marginTop: 16, display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button type="button" className={csStyles.sortBtn} onClick={() => setSelected(null)}>Close</button>
          </div>
        </Modal>
      )}

      {/* Add / Edit Modal */}
      {(creating || editing) && (
        <Modal title={editing ? `Edit ${editing.name}` : 'Add New Country'} onClose={() => { setCreating(false); setEditing(null); }} headerDark>
          {formError && <p style={{ color: '#DC2626', fontSize: 13 }}>{formError}</p>}
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: 16, marginBottom: 16 }}>
              <div>
                <label style={labelStyle}>Country Name *</label>
                <input style={fieldStyle} placeholder="e.g., India" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <label style={labelStyle}>Country Code *</label>
                <input style={fieldStyle} placeholder="e.g., US" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
              </div>
              <div>
                <label style={labelStyle}>Phone Code *</label>
                <input style={fieldStyle} placeholder="e.g., +1" value={form.phoneCode} onChange={(e) => setForm({ ...form, phoneCode: e.target.value })} />
              </div>
              <div>
                <label style={labelStyle}>Language *</label>
                <input style={fieldStyle} placeholder="e.g., English" value={form.language} onChange={(e) => setForm({ ...form, language: e.target.value })} />
              </div>
              <div>
                <label style={labelStyle}>Currency *</label>
                <input style={fieldStyle} placeholder="e.g., US Dollar" value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} />
              </div>
              <div>
                <label style={labelStyle}>Currency Code *</label>
                <input style={fieldStyle} placeholder="e.g., USD" value={form.currencyCode} onChange={(e) => setForm({ ...form, currencyCode: e.target.value })} />
              </div>
              <div>
                <label style={labelStyle}>Currency Symbol *</label>
                <input style={fieldStyle} placeholder="e.g., $" value={form.currencySymbol} onChange={(e) => setForm({ ...form, currencySymbol: e.target.value })} />
              </div>
              <div>
                <label style={labelStyle}>Timezone *</label>
                <input style={fieldStyle} placeholder="e.g., America/New_York (UTC-5)" value={form.timezone} onChange={(e) => setForm({ ...form, timezone: e.target.value })} />
              </div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Details</label>
              <textarea style={{ ...fieldStyle, minHeight: 80, resize: 'vertical' as const }} placeholder="Describe the country market..." value={form.details} onChange={(e) => setForm({ ...form, details: e.target.value })} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: 16, marginBottom: 20 }}>
              <div>
                <label style={labelStyle}>Admin Name *</label>
                <input style={fieldStyle} placeholder="e.g., John Smith" value={form.admin} onChange={(e) => setForm({ ...form, admin: e.target.value })} />
              </div>
              <div>
                <label style={labelStyle}>Admin Email *</label>
                <input style={fieldStyle} placeholder="e.g., john@example.com" value={form.adminEmail} onChange={(e) => setForm({ ...form, adminEmail: e.target.value })} />
              </div>
            </div>
            <div style={{ textAlign: 'right', display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button type="button" className={csStyles.sortBtn} onClick={() => { setCreating(false); setEditing(null); }}>Cancel</button>
              <button type="submit" className={styles.bannerBtn} disabled={saving} style={{ background: '#134B2F', color: '#fff', padding: '10px 24px', borderRadius: 10, fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer' }}>
                {saving ? 'Saving...' : editing ? 'Save Changes' : 'Add Country'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
