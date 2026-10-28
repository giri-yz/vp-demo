import { useEffect, useState } from 'react';
import { demoDeleteLog, demoListLogs, type DemoLog } from '../../../api/demo/demoAdmin';
import ExportMenu from '../../../components/admin/ExportMenu';
import ScrollReveal from '../../../components/admin/ScrollReveal';
import { useToast } from '../../../components/admin/Toast';
import { printTable, type ExportData } from '../../../utils/csvExport';
import styles from '../css/SuperAdminDashboard.module.css';
import actStyles from '../css/ActivityDetail.module.css';
import csStyles from '../css/CountriesSection.module.css';

const CATEGORIES = ['login', 'logout', 'product', 'country', 'settings', 'admin'];
const COUNTRIES = ['india', 'singapore', 'uae', 'us', 'lk'];
const PAGE_SIZE = 10;

const FLAGS: Record<string, string> = {
  india: '/images/in-flag.svg',
  singapore: '/images/sg-flag.svg',
  uae: '/images/uae-flag.svg',
  us: '/images/us-flag.svg',
  lk: '/images/lk-flag.svg',
};

const COUNTRY_LABELS: Record<string, string> = {
  india: 'India',
  singapore: 'Singapore',
  uae: 'UAE',
  us: 'United States',
  lk: 'Sri Lanka',
};

const CATEGORY_LABELS: Record<string, string> = {
  login: 'Login',
  logout: 'Logout',
  product: 'Product',
  country: 'Country',
  settings: 'Settings',
  admin: 'Admin',
};

export default function SuperActivityView() {
  const [logs, setLogs] = useState<DemoLog[]>([]);
  const [deletedLogs, setDeletedLogs] = useState<DemoLog[]>([]);
  const [showDeleted, setShowDeleted] = useState(false);
  const [category, setCategory] = useState('');
  const [country, setCountry] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<DemoLog | null>(null);
  const [closing, setClosing] = useState(false);
  const { notify } = useToast();

  function load() {
    setLogs(demoListLogs({ category: category || undefined, country: country || undefined, search: search || undefined }));
    setPage(1);
  }

  useEffect(load, [category, country, search]);

  const totalPages = Math.max(1, Math.ceil(logs.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paged = logs.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const start = logs.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1;
  const end = Math.min(safePage * PAGE_SIZE, logs.length);

  const categoryCounts = CATEGORIES.reduce((acc, c) => {
    acc[c] = logs.filter((l) => l.category === c).length;
    return acc;
  }, {} as Record<string, number>);

  function deleteLog(log: DemoLog) {
    if (!window.confirm(`Permanently delete log "${log.details || log.id}"?`)) return;
    demoDeleteLog(log.id);
    setDeletedLogs((prev) => [...prev, { ...log, deletedAt: new Date().toISOString() }]);
    setSelected(null);
    load();
    notify('Activity log moved to delete history.');
  }

  function restoreLog(log: DemoLog) {
    setDeletedLogs((prev) => prev.filter((l) => l.id !== log.id));
    notify('Activity log restored.');
  }

  function permanentDelete(log: DemoLog) {
    if (!window.confirm(`Perently delete ${log.id}? This cannot be undone.`)) return;
    setDeletedLogs((prev) => prev.filter((l) => l.id !== log.id));
    notify('Activity log permanently deleted.');
  }

  function openDetail(log: DemoLog) {
    setClosing(false);
    setSelected(log);
  }

  function closeDetail() {
    setClosing(true);
    setTimeout(() => { setSelected(null); setClosing(false); }, 450);
  }

  function getExportData(): ExportData {
    return {
      filename: 'activity-logs.csv',
      title: 'Activity Logs',
      columns: ['ID', 'Timestamp', 'User', 'Category', 'Details', 'Country', 'IP', 'Status', 'Action'],
      rows: logs.map((l) => [l.id, l.timestamp, l.user, l.category, l.details, l.country, l.ipAddress, l.status, l.action]),
    };
  }

  function printList() {
    printTable(getExportData());
  }

  function DetailSection({ title, icon, delay, children }: { title: string; icon: string; delay: number; children: React.ReactNode }) {
    return (
      <div className={actStyles.section} style={{ animationDelay: `${delay * 0.1}s` }}>
        <div className={actStyles.sectionHeader}>
          <i className={`fas ${icon}`} style={{ color: '#86efac' }} />
          {title}
        </div>
        <div className={actStyles.sectionBody}>{children}</div>
      </div>
    );
  }

  function DetailRow({ label, value, badge, color }: { label: string; value?: string; badge?: string; color?: string }) {
    return (
      <div className={actStyles.row}>
        <span className={actStyles.rowLabel}>{label}</span>
        {badge ? (
          <span className={actStyles.badge} style={{ background: `${color}26`, color }}>{badge}</span>
        ) : (
          <span className={actStyles.rowValue}>{value}</span>
        )}
      </div>
    );
  }

  return (
    <div>
      {/* Banner */}
      <ScrollReveal>
      <div className={styles.banner}>
        <div className={styles.bannerContent}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <i className="fas fa-clipboard-list" style={{ fontSize: 22, color: '#fff' }} />
            </div>
            <div>
              <h1 className={styles.bannerTitle}>Activity Logs</h1>
              <p className={styles.bannerSubtitle}>Track all system activities and events</p>
            </div>
          </div>
        </div>
        <div className={styles.bannerActions}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              type="button"
              onClick={printList}
              style={{
                padding: '8px 16px',
                borderRadius: 10,
                border: '1px solid rgba(255,255,255,.2)',
                background: 'rgba(255,255,255,.15)',
                color: '#fff',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                whiteSpace: 'nowrap',
              }}
            >
              <i className="fas fa-print" style={{ fontSize: 12 }} /> Print
            </button>
            <ExportMenu getData={getExportData} />
          </div>
        </div>
      </div>
      </ScrollReveal>

      {/* Filter Tabs */}
      <ScrollReveal delay={100}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={() => setCategory('')}
          style={{
            padding: '8px 18px',
            borderRadius: 20,
            border: 'none',
            background: category === '' ? '#2E7D32' : '#fff',
            color: category === '' ? '#fff' : '#64748B',
            fontWeight: 600,
            fontSize: 13,
            cursor: 'pointer',
            boxShadow: category === '' ? '0 2px 8px rgba(46,125,50,0.25)' : '0 1px 3px rgba(0,0,0,0.08)',
            transition: 'all 0.2s',
          }}
        >
          All {logs.length}
        </button>
        {CATEGORIES.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCategory(c)}
            style={{
              padding: '8px 18px',
              borderRadius: 20,
              border: 'none',
              background: category === c ? '#2E7D32' : '#fff',
              color: category === c ? '#fff' : '#64748B',
              fontWeight: 600,
              fontSize: 13,
              cursor: 'pointer',
              boxShadow: category === c ? '0 2px 8px rgba(46,125,50,0.25)' : '0 1px 3px rgba(0,0,0,0.08)',
              transition: 'all 0.2s',
            }}
          >
            {CATEGORY_LABELS[c]} {categoryCounts[c]}
          </button>
        ))}
        <div style={{ marginLeft: 'auto' }}>
          <div style={{ position: 'relative' }}>
            <i className="fas fa-search" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', fontSize: 13 }} />
            <input
              placeholder="Search logs by user, action..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                padding: '9px 14px 9px 36px',
                borderRadius: 10,
                border: '1px solid #E2E8F0',
                fontSize: 13,
                width: 260,
                outline: 'none',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              }}
            />
          </div>
        </div>
      </div>
      </ScrollReveal>

      {/* Table Panel */}
      <ScrollReveal delay={200}>
      <div className={styles.panel}>
        <div className={styles.tableWrapper}>
          {showDeleted ? (
            deletedLogs.length === 0 ? (
              <div className={styles.panelBody}><p className={styles.placeholder}>No deleted activity logs.</p></div>
            ) : (
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>User</th>
                    <th>Category</th>
                    <th>Details</th>
                    <th>Country</th>
                    <th>Deleted At</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {deletedLogs.map((l) => (
                    <tr key={l.id}>
                      <td style={{ fontSize: 13, color: '#64748B' }}>{new Date(l.timestamp).toLocaleString()}</td>
                      <td>
                        <div style={{ fontWeight: 600, fontSize: 13, color: '#1E293B' }}>{l.user}</div>
                      </td>
                      <td>
                        <span style={{ fontSize: 13, color: '#64748B' }}>{CATEGORY_LABELS[l.category] ?? l.category}</span>
                      </td>
                      <td style={{ fontSize: 13, color: '#475569', maxWidth: 280 }}>{l.details}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontSize: 13, fontWeight: 500 }}>{COUNTRY_LABELS[l.country.toLowerCase()] ?? l.country}</span>
                        </div>
                      </td>
                      <td style={{ fontSize: 13, color: '#DC2626' }}>{(l as any).deletedAt ? new Date((l as any).deletedAt).toLocaleString() : '—'}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button
                            type="button"
                            onClick={() => restoreLog(l)}
                            style={{
                              padding: '6px 12px',
                              borderRadius: 8,
                              border: '1px solid #DCFCE7',
                              background: '#DCFCE7',
                              color: '#16A34A',
                              cursor: 'pointer',
                              fontSize: 12,
                              fontWeight: 600,
                              display: 'flex',
                              alignItems: 'center',
                              gap: 4,
                            }}
                            title="Restore log"
                          >
                            <i className="fas fa-undo" style={{ fontSize: 11 }} />
                            Restore
                          </button>
                          <button
                            type="button"
                            onClick={() => permanentDelete(l)}
                            style={{
                              padding: '6px 12px',
                              borderRadius: 8,
                              border: '1px solid #FEE2E2',
                              background: '#FEF2F2',
                              color: '#DC2626',
                              cursor: 'pointer',
                              fontSize: 12,
                              fontWeight: 600,
                              display: 'flex',
                              alignItems: 'center',
                              gap: 4,
                            }}
                            title="Permanently delete"
                          >
                            <i className="fas fa-trash" style={{ fontSize: 11 }} />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          ) : (
            logs.length === 0 ? (
              <div className={styles.panelBody}><p className={styles.placeholder}>No activity logs match these filters.</p></div>
            ) : (
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>User</th>
                    <th>Category</th>
                    <th>Details</th>
                    <th>Country</th>
                    <th>IP Address</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {paged.map((l) => (
                    <tr key={l.id}>
                      <td style={{ fontSize: 13, color: '#64748B' }}>{new Date(l.timestamp).toLocaleString()}</td>
                      <td>
                        <div style={{ fontWeight: 600, fontSize: 13, color: '#1E293B' }}>{l.user}</div>
                      </td>
                      <td>
                        <span style={{ fontSize: 13, color: '#64748B' }}>{CATEGORY_LABELS[l.category] ?? l.category}</span>
                      </td>
                      <td style={{ fontSize: 13, color: '#475569', maxWidth: 280 }}>{l.details}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontSize: 13, fontWeight: 500 }}>{COUNTRY_LABELS[l.country.toLowerCase()] ?? l.country}</span>
                        </div>
                      </td>
                      <td style={{ fontSize: 13, fontFamily: 'monospace', color: '#64748B' }}>{l.ipAddress}</td>
                      <td>
                        <span style={{
                          display: 'inline-block',
                          padding: '3px 10px',
                          borderRadius: 12,
                          fontSize: 12,
                          fontWeight: 600,
                          background: l.status === 'success' ? '#DCFCE7' : l.status === 'failed' ? '#FEE2E2' : '#FEF3C7',
                          color: l.status === 'success' ? '#16A34A' : l.status === 'failed' ? '#DC2626' : '#D97706',
                        }}>
                          {l.status.charAt(0).toUpperCase() + l.status.slice(1)}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button
                            type="button"
                            onClick={() => openDetail(l)}
                            className={csStyles.actionBtn}
                            title="View details"
                          >
                            <i className="fas fa-eye" />
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteLog(l)}
                            style={{
                              width: 34,
                              height: 34,
                              borderRadius: 8,
                              border: '1px solid #FEE2E2',
                              background: '#FEF2F2',
                              color: '#DC2626',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transition: 'all 0.2s',
                            }}
                            title="Delete log"
                          >
                            <i className="fas fa-trash-alt" style={{ fontSize: 13 }} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          )}
        </div>

        {/* Pagination - only show for active logs */}
        {!showDeleted && totalPages > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '16px 20px' }}>
            <span style={{ fontSize: 13, color: '#64748B', marginRight: 12 }}>Showing {start}-{end} of {logs.length} logs</span>
            <button
              type="button"
              disabled={safePage <= 1}
              onClick={() => setPage(safePage - 1)}
              style={{
                padding: '7px 14px',
                borderRadius: 8,
                border: '1px solid #E2E8F0',
                background: '#fff',
                color: safePage <= 1 ? '#CBD5E1' : '#2E7D32',
                fontWeight: 600,
                fontSize: 13,
                cursor: safePage <= 1 ? 'not-allowed' : 'pointer',
              }}
            >
              Prev
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPage(p)}
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 8,
                  border: p === safePage ? '1px solid #2E7D32' : '1px solid #E2E8F0',
                  background: p === safePage ? '#2E7D32' : '#fff',
                  color: p === safePage ? '#fff' : '#64748B',
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: 'pointer',
                }}
              >
                {p}
              </button>
            ))}
            <button
              type="button"
              disabled={safePage >= totalPages}
              onClick={() => setPage(safePage + 1)}
              style={{
                padding: '7px 14px',
                borderRadius: 8,
                border: '1px solid #E2E8F0',
                background: '#fff',
                color: safePage >= totalPages ? '#CBD5E1' : '#2E7D32',
                fontWeight: 600,
                fontSize: 13,
                cursor: safePage >= totalPages ? 'not-allowed' : 'pointer',
              }}
            >
              Next
            </button>
          </div>
        )}
      </div>
      </ScrollReveal>

      {/* Detail Drawer */}
      {selected && (
        <div className={`${actStyles.overlay} ${closing ? actStyles.closing : ''}`} onClick={closeDetail}>
          <div className={`${actStyles.drawer} ${closing ? actStyles.drawerClosing : ''}`} onClick={(e) => e.stopPropagation()}>
            <div className={actStyles.drawerHeader}>
              <div>
                <h2 className={actStyles.drawerTitle}>Activity Details</h2>
                <div className={actStyles.drawerSubtitle}>{selected.user} · {selected.country}</div>
              </div>
              <button type="button" className={actStyles.closeBtn} onClick={closeDetail}>×</button>
            </div>
            <div className={actStyles.drawerBody}>
              <DetailSection title="Activity Details" icon="fa-circle-info" delay={0}>
                <DetailRow label="Activity Type" value={selected.action} />
                <DetailRow label="Timestamp" value={new Date(selected.timestamp).toLocaleString()} />
                <DetailRow label="Status" badge={selected.status} color={selected.status === 'success' ? '#16a34a' : selected.status === 'failed' ? '#dc2626' : '#d97706'} />
                <DetailRow label="Category" value={selected.category.charAt(0).toUpperCase() + selected.category.slice(1)} />
              </DetailSection>

              <DetailSection title="Activity Information" icon="fa-clock" delay={1}>
                <DetailRow label="Log ID" value={selected.id} />
                <DetailRow label="Action" value={selected.action} />
                <DetailRow label="Outcome" badge={selected.status === 'success' ? 'Successful' : selected.status.charAt(0).toUpperCase() + selected.status.slice(1)} color={selected.status === 'success' ? '#16a34a' : '#dc2626'} />
                <DetailRow label="Duration" value="1.2s" />
                <DetailRow label="Location" value={selected.country.charAt(0).toUpperCase() + selected.country.slice(1)} />
              </DetailSection>

              <DetailSection title="User Information" icon="fa-user" delay={2}>
                <DetailRow label="Full Name" value={selected.user} />
                <DetailRow label="Role" value={selected.role} />
                <DetailRow label="Country" value={selected.country.charAt(0).toUpperCase() + selected.country.slice(1)} />
                <DetailRow label="Status" badge={selected.status} color={selected.status === 'success' ? '#16a34a' : '#dc2626'} />
              </DetailSection>

              <DetailSection title="Target Information" icon="fa-crosshairs" delay={3}>
                <DetailRow label="Target Account" value={`Target-${selected.id}`} />
                <DetailRow label="Target Type" value="System Resource" />
                <DetailRow label="Resource" value={`${selected.category} module`} />
                <DetailRow label="Region" value={selected.country.charAt(0).toUpperCase() + selected.country.slice(1)} />
              </DetailSection>

              <DetailSection title="Request Information" icon="fa-network-wired" delay={4}>
                <DetailRow label="IP Address" value={selected.ipAddress} />
                <DetailRow label="Device" value={selected.country === 'india' ? 'Android · Chrome' : selected.country === 'us' ? 'iPhone · Safari' : 'Windows · Edge'} />
                <DetailRow label="Browser" value="Chrome 126" />
                <DetailRow label="Request Method" value={`POST /api/${selected.category}`} />
                <DetailRow label="Session ID" value={`SES-${selected.id.replace(/[^A-Z0-9]/gi, '').slice(-5).toUpperCase()}-A`} />
              </DetailSection>

              <DetailSection title="Additional Information" icon="fa-layer-group" delay={5}>
                <DetailRow label="Details" value={selected.details} />
                <DetailRow label="Action" value={selected.action} />
                <DetailRow label="Category" value={selected.category.charAt(0).toUpperCase() + selected.category.slice(1)} />
                <DetailRow label="Status" badge={selected.status} color={selected.status === 'success' ? '#16a34a' : '#dc2626'} />
              </DetailSection>

              <div className={actStyles.actions}>
                <button type="button" className={actStyles.actionBtn} onClick={() => deleteLog(selected)}>Delete Log</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
