import { useEffect, useMemo, useState } from 'react';
import { get, list, remove, updateStatus } from '../../../api/adminContactMessagesApi';
import type { ContactMessage } from '../../../types';
import type { CountryConfig } from '../../../config/countryConfig';
import { CONTACT_MESSAGE_STATUSES } from '../../../types';
import { useToast } from '../../../components/admin/Toast';
import ExportMenu from '../../../components/admin/ExportMenu';
import { hasPermission } from '../../../utils/adminScope';
import { useAdminAuth } from '../../../context/AdminAuthContext';
import ChatTranscripts from '../../../components/admin/ChatTranscripts';
import { printTable, type ExportData } from '../../../utils/csvExport';
import { getErrorMessage } from '../../../utils/errors';
import { buildTicketIndex, ticketNo } from '../../../utils/ticketNo';
import styles from './SubViews.module.css';
import msgStyles from '../css/MessageDetail.module.css';
import TrustBanner from './TrustBanner';

const CATEGORIES = ['delivery', 'order', 'product', 'refund', 'payment', 'account', 'general'];
const PAGE_SIZE = 10;

export default function SubSupportView({ config }: { config: CountryConfig }) {
  const { admin } = useAdminAuth();
  const canEdit = hasPermission(admin, 'edit');
  const canDelete = hasPermission(admin, 'delete');
  const canExport = hasPermission(admin, 'export');
  const code = config.code;
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [allMessages, setAllMessages] = useState<ContactMessage[]>([]);
  const [ticketIndex, setTicketIndex] = useState<Map<string, string>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'name'>('date');
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<ContactMessage | null>(null);
  const [showDrawer, setShowDrawer] = useState(false);
  const [showReply, setShowReply] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [saving, setSaving] = useState(false);
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({});
  const [section, setSection] = useState<'messages' | 'chats'>('messages');
  const { notify } = useToast();

  function load() {
    setLoading(true);
    list()
      .then((all) => {
        setAllMessages(all);
        const idx = buildTicketIndex(all);
        setTicketIndex(idx);
        let items = all.filter((m) => !m.countryCode || m.countryCode === code);
        if (statusFilter) items = items.filter((m) => m.status === statusFilter);
        if (categoryFilter) items = items.filter((m) => (m.category ?? '') === categoryFilter);
        if (search) {
          const q = search.toLowerCase();
          items = items.filter((m) => `${m.name} ${m.email} ${m.subject} ${idx.get(m.id) ?? ''}`.toLowerCase().includes(q));
        }
        setMessages(items);
        setError('');
      })
      .catch((err: unknown) => setError(getErrorMessage(err, 'Could not load support messages.')))
      .finally(() => setLoading(false));
  }

  useEffect(load, [statusFilter, categoryFilter, search, code]);

  useEffect(() => {
    const countryMsgs = allMessages.filter((m) => !m.countryCode || m.countryCode === code);
    const counts: Record<string, number> = { ALL: countryMsgs.length };
    for (const s of CONTACT_MESSAGE_STATUSES) {
      counts[s] = countryMsgs.filter((m) => m.status === s).length;
    }
    setStatusCounts(counts);
  }, [code, allMessages]);

  const sorted = useMemo(() => {
    const arr = [...messages];
    if (sortBy === 'name') arr.sort((a, b) => a.name.localeCompare(b.name));
    else arr.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
    return arr;
  }, [messages, sortBy]);

  const totalPages = Math.ceil(sorted.length / PAGE_SIZE);
  const paged = sorted.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  function openDetail(msg: ContactMessage) {
    setSelected(msg);
    setShowDrawer(true);
    if (msg.status === 'NEW') {
      get(msg.id).then((updated) => {
        setSelected(updated);
        load();
      }).catch(() => {});
    }
  }

  function openReply(msg: ContactMessage) {
    setSelected(msg);
    setReplyText('');
    setShowReply(true);
  }

  async function sendReply() {
    if (!selected || !replyText.trim()) return;
    setSaving(true);
    try {
      await updateStatus(selected.id, 'REPLIED');
      setShowReply(false);
      setSelected(null);
      load();
      notify('Reply sent successfully.');
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Could not send reply.'));
    } finally {
      setSaving(false);
    }
  }

  async function deleteMessage(msg: ContactMessage) {
    if (!window.confirm(`Delete support ticket ${msg.id}?`)) return;
    setSaving(true);
    try {
      await remove(msg.id);
      if (selected?.id === msg.id) { setSelected(null); setShowDrawer(false); }
      load();
      notify('Message deleted.');
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Could not delete message.'));
    } finally {
      setSaving(false);
    }
  }

  function getExportData(): ExportData {
    return {
      filename: `${config.id}-support-messages.csv`,
      title: `Support Messages — ${config.name}`,
      columns: ['Ticket', 'Customer', 'Email', 'Category', 'Subject', 'Status', 'Date'],
      rows: sorted.map((m) => [ticketNo(ticketIndex, m.id), m.name, m.email, m.category ?? '', m.subject, m.status, formatDate(m.createdAt)]),
    };
  }

  function printList() {
    const d = getExportData();
    printTable({ filename: `${config.id}-support-messages.csv`, title: d.title, columns: d.columns, rows: d.rows });
  }

  function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  function formatDateTime(dateStr: string): string {
    return new Date(dateStr).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  function getCategoryBadge(cat: string | null) {
    if (!cat) return <span className={styles.supBadge} style={{ background: 'transparent', color: '#15803D' }}>General</span>;
    return <span className={styles.supBadge} style={{ background: 'transparent', color: '#15803D' }}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</span>;
  }

  function getStatusBadge(s: string) {
    return <span className={styles.supBadge} style={{ background: 'transparent', color: '#15803D' }}>{s.charAt(0) + s.slice(1).toLowerCase()}</span>;
  }

  return (
    <div>
      {/* ── Messages / Live chat ── */}
      <div className={styles.supStatusRow}>
        {(['messages', 'chats'] as const).map((sec) => (
          <button
            key={sec}
            type="button"
            className={`${styles.supStatusBtn} ${section === sec ? styles.supStatusBtnActive : ''}`}
            onClick={() => setSection(sec)}
          >
            {sec === 'messages' ? 'Messages' : 'Live chat'}
          </button>
        ))}
      </div>

      {section === 'messages' ? (
      <>
      {/* ── Status Filter Buttons ── */}
      <div className={styles.supStatusRow}>
        {[
          { key: '', label: 'All', count: statusCounts.ALL ?? messages.length },
          { key: 'NEW', label: 'New', count: statusCounts.NEW ?? 0 },
          { key: 'REPLIED', label: 'Replied', count: statusCounts.REPLIED ?? 0 },
          { key: 'CLOSED', label: 'Closed', count: statusCounts.CLOSED ?? 0 },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            className={`${styles.supStatusBtn} ${statusFilter === tab.key ? styles.supStatusBtnActive : ''}`}
            onClick={() => { setStatusFilter(tab.key); setPage(0); }}
          >
            {tab.label}
            <span className={styles.supStatusCount}>{tab.count}</span>
          </button>
        ))}
      </div>

      {/* ── Search + Filters ── */}
      <div className={styles.supFilterCard}>
        <div className={styles.supFilterRow}>
          <div className={styles.supFilterSearch}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
            <input placeholder="Search by name, email, subject..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(0); }} />
          </div>
          <div className={styles.supFilterGroup}>
            <label className={styles.supFilterLabel}>Category</label>
            <select value={categoryFilter} onChange={(e) => { setCategoryFilter(e.target.value); setPage(0); }}>
              <option value="">All Categories</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
            </select>
          </div>
          <div className={styles.supFilterGroup}>
            <label className={styles.supFilterLabel}>Status</label>
            <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}>
              <option value="">All Statuses</option>
              {CONTACT_MESSAGE_STATUSES.map((s) => <option key={s} value={s}>{s.charAt(0) + s.slice(1).toLowerCase()}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* ── Table Controls + Table ── */}
      <div className={styles.supTableCard}>
        <div className={styles.supTableHeader}>
          <span className={styles.supTableInfo}>Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, sorted.length)} of {sorted.length} messages</span>
          <div className={styles.supTableControls}>
            <button type="button" className={`${styles.supSortBtn} ${sortBy === 'date' ? styles.supSortBtnActive : ''}`} onClick={() => setSortBy('date')}>↑ Date</button>
            <button type="button" className={`${styles.supSortBtn} ${sortBy === 'name' ? styles.supSortBtnActive : ''}`} onClick={() => setSortBy('name')}>↑ Name</button>
            {canExport && (
              <ExportMenu getData={getExportData} buttonStyle={{ padding: '6px 14px', borderRadius: 8, border: '1px solid #E2E8F0', background: '#fff', color: '#374151', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }} />
            )}
            {canExport && (
              <button type="button" onClick={printList} style={{ padding: '6px 14px', borderRadius: 8, border: '1px solid #E2E8F0', background: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 4 }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 6 2 18 2 18 9" /><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><rect x="6" y="14" width="12" height="8" /></svg>
                Print
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <p className={styles.empty}>Loading...</p>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: 24 }}>
            <p className={styles.empty}>{error}</p>
            <button type="button" className={styles.viewButton} onClick={load}>Retry</button>
          </div>
        ) : sorted.length === 0 ? (
          <p className={styles.empty}>No support messages for {config.name}.</p>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.supTable}>
              <thead>
                <tr>
                  <th>TICKET</th>
                  <th>FROM</th>
                  <th>CATEGORY</th>
                  <th>SUBJECT</th>
                  <th>STATUS</th>
                  <th>DATE</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {paged.map((m) => (
                  <tr key={m.id}>
                      <td style={{ fontWeight: 700, color: '#1E293B' }}>{ticketNo(ticketIndex, m.id)}</td>
                    <td>
                      <div style={{ fontWeight: 600, color: '#1E293B' }}>{m.name}</div>
                      <div style={{ fontSize: 12, color: '#94A3B8' }}>{m.email}</div>
                    </td>
                    <td>{getCategoryBadge(m.category)}</td>
                    <td style={{ maxWidth: 200 }}>{m.subject}</td>
                    <td>{getStatusBadge(m.status)}</td>
                    <td>{formatDate(m.createdAt)}</td>
                    <td>
                      <div className={styles.supActions}>
                        <button type="button" className={styles.supActionBtn} title="View" onClick={() => openDetail(m)}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                        </button>
                        {canEdit && (
                          <button type="button" className={styles.supActionBtn} title="Reply" onClick={() => openReply(m)}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 17 4 12 9 7" /><path d="M20 18v-2a4 4 0 0 0-4-4H4" /></svg>
                          </button>
                        )}
                        {canDelete && (
                          <button type="button" className={styles.supActionBtn} title="Delete" onClick={() => void deleteMessage(m)}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className={styles.supPagination}>
            <button type="button" disabled={page === 0} onClick={() => setPage((p) => p - 1)} className={styles.supPageBtn}>Prev</button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button key={i} type="button" className={`${styles.supPageBtn} ${page === i ? styles.supPageBtnActive : ''}`} onClick={() => setPage(i)}>{i + 1}</button>
            ))}
            <button type="button" disabled={page >= totalPages - 1} onClick={() => setPage((p) => p + 1)} className={styles.supPageBtn}>Next</button>
          </div>
        )}
      </div>
      </>
      ) : (
        <ChatTranscripts countryCode={code} />
      )}

      {/* ── Side Drawer ── */}
      {showDrawer && selected && (
        <div className={msgStyles.overlay} onClick={() => setShowDrawer(false)}>
          <div className={msgStyles.drawer} onClick={(e) => e.stopPropagation()}>
            <div className={msgStyles.drawerHeader}>
              <div>
                <div className={msgStyles.drawerLabel}>✉ Support Message Details</div>
                <h2 className={msgStyles.drawerTitle}>{selected.subject}</h2>
              </div>
              <button type="button" className={msgStyles.closeBtn} onClick={() => setShowDrawer(false)}>&times;</button>
            </div>
            <div className={msgStyles.drawerBody}>
              {/* Ticket Details */}
              <div className={msgStyles.section}>
                <div className={msgStyles.sectionHeader}>📋 TICKET DETAILS</div>
                <div className={msgStyles.detailGrid}>
                  <div className={msgStyles.detailItem}><div className={msgStyles.detailLabel}>TICKET ID</div><div className={msgStyles.detailVal}>{ticketNo(ticketIndex, selected.id)}</div></div>
                  <div className={msgStyles.detailItem}><div className={msgStyles.detailLabel}>CATEGORY</div><div className={msgStyles.detailVal}>{selected.category ?? 'General'}</div></div>
                  <div className={msgStyles.detailItem}><div className={msgStyles.detailLabel}>STATUS</div><div className={msgStyles.detailVal}>{selected.status}</div></div>
                  <div className={msgStyles.detailItem}><div className={msgStyles.detailLabel}>CREATED</div><div className={msgStyles.detailVal}>{formatDate(selected.createdAt)}</div></div>
                </div>
              </div>

              {/* Customer Information */}
              <div className={msgStyles.section}>
                <div className={msgStyles.sectionHeader}>👤 CUSTOMER INFORMATION</div>
                <div className={msgStyles.detailGrid}>
                  <div className={msgStyles.detailItem}><div className={msgStyles.detailLabel}>CUSTOMER ID</div><div className={msgStyles.detailVal}>{selected.phone ?? 'N/A'}</div></div>
                  <div className={msgStyles.detailItem}><div className={msgStyles.detailLabel}>NAME</div><div className={msgStyles.detailVal}>{selected.name}</div></div>
                  <div className={msgStyles.detailItem}><div className={msgStyles.detailLabel}>EMAIL</div><div className={msgStyles.detailVal}>{selected.email}</div></div>
                  <div className={msgStyles.detailItem}><div className={msgStyles.detailLabel}>PHONE</div><div className={msgStyles.detailVal}>{selected.phone ?? 'N/A'}</div></div>
                </div>
                {selected.address && (
                  <div className={msgStyles.detailItem} style={{ marginTop: 8 }}><div className={msgStyles.detailLabel}>ADDRESS</div><div className={msgStyles.detailVal}>{selected.address}</div></div>
                )}
              </div>

              {/* Original Message */}
              <div className={msgStyles.section}>
                <div className={msgStyles.sectionHeader}>✉ ORIGINAL MESSAGE</div>
                <div className={msgStyles.messageBox}>{selected.message}</div>
              </div>

              {/* Order/Product Info */}
              {(selected.orderId || selected.productName) ? (
                <div className={msgStyles.section}>
                  <div className={msgStyles.sectionHeader}>📦 ORDER / PRODUCT INFORMATION</div>
                  <div className={msgStyles.detailGrid}>
                    {selected.orderId && <div className={msgStyles.detailItem}><div className={msgStyles.detailLabel}>ORDER ID</div><div className={msgStyles.detailVal}>{selected.orderId}</div></div>}
                    {selected.productName && <div className={msgStyles.detailItem}><div className={msgStyles.detailLabel}>PRODUCT NAME</div><div className={msgStyles.detailVal}>{selected.productName}</div></div>}
                    {selected.productPrice != null && <div className={msgStyles.detailItem}><div className={msgStyles.detailLabel}>PRODUCT PRICE</div><div className={msgStyles.detailVal}>{config.currencySymbol}{selected.productPrice}</div></div>}
                  </div>
                </div>
              ) : (
                <div className={msgStyles.section}>
                  <div className={msgStyles.sectionHeader}>📦 ORDER / PRODUCT INFORMATION</div>
                  <div className={msgStyles.messageBox} style={{ fontSize: 13, opacity: 0.7 }}>Not applicable</div>
                </div>
              )}

              {/* Support History */}
              <div className={msgStyles.section}>
                <div className={msgStyles.sectionHeader}>📜 SUPPORT HISTORY</div>
                <div className={msgStyles.detailGrid}>
                  <div className={msgStyles.detailItem}><div className={msgStyles.detailLabel}>CREATED</div><div className={msgStyles.detailVal}>{formatDateTime(selected.createdAt)}</div></div>
                  <div className={msgStyles.detailItem}><div className={msgStyles.detailLabel}>STATUS</div><div className={msgStyles.detailVal}>{selected.status}</div></div>
                </div>
              </div>
            </div>

            <div style={{ padding: '14px 20px', borderTop: '1px solid rgba(255,255,255,.12)', display: 'flex', justifyContent: 'flex-end' }}>
              <button type="button" className={msgStyles.closeBtn} onClick={() => setShowDrawer(false)} style={{ width: 'auto', padding: '8px 20px', fontSize: 13, fontWeight: 600 }}>✕ Close</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Reply Modal ── */}
      {showReply && selected && (
        <div className={msgStyles.overlay} onClick={() => setShowReply(false)}>
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: '#166534', borderRadius: 16, width: 520, maxWidth: '95vw', maxHeight: '90vh', overflow: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,.4)' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: '18px 24px', borderBottom: '1px solid rgba(255,255,255,.12)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ margin: 0, color: '#fff', fontSize: 18, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 20 }}>↩</span> Reply to Message
              </h3>
              <button type="button" className={msgStyles.closeBtn} onClick={() => setShowReply(false)}>&times;</button>
            </div>
            <div style={{ padding: 20 }}>
              <div style={{ background: 'rgba(255,255,255,.1)', borderRadius: 10, padding: 14, marginBottom: 16 }}>
                <div style={{ color: 'rgba(255,255,255,.7)', fontSize: 12, marginBottom: 4 }}>Replying to ticket <span style={{ color: '#F2B233', fontWeight: 600 }}>{ticketNo(ticketIndex, selected.id)}</span></div>
                <div style={{ color: '#fff', fontWeight: 700, fontSize: 14 }}>{selected.subject}</div>
                <div style={{ color: 'rgba(255,255,255,.7)', fontSize: 12, marginTop: 4 }}>To: {selected.name} &lt;{selected.email}&gt;</div>
              </div>
              <label style={{ display: 'block', color: '#F2B233', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 6 }}>YOUR REPLY</label>
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Type your reply here..."
                style={{ width: '100%', minHeight: 120, padding: 12, borderRadius: 10, border: '1px solid rgba(255,255,255,.15)', background: 'rgba(255,255,255,.1)', color: '#fff', fontSize: 14, fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box' }}
              />
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 16 }}>
                <button type="button" onClick={() => setShowReply(false)} style={{ padding: '10px 20px', borderRadius: 10, border: '1px solid rgba(255,255,255,.2)', background: 'rgba(255,255,255,.1)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                <button type="button" onClick={() => void sendReply()} disabled={saving || !replyText.trim()} style={{ padding: '10px 20px', borderRadius: 10, border: 'none', background: '#F2B233', color: '#1a1a1a', fontSize: 13, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving || !replyText.trim() ? 0.6 : 1 }}>
                  {saving ? 'Sending...' : 'Send Reply'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <TrustBanner />
    </div>
  );
}
