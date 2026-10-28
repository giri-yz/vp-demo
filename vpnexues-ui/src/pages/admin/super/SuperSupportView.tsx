import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { list, remove, updateStatus } from '../../../api/adminContactMessagesApi';
import { listEnquiries, updateEnquiryStatus } from '../../../api/adminB2BEnquiriesApi';
import { prefetchChatSessions } from '../../../api/supportChatSessionsCache';
import type { ContactMessage, B2BEnquiry } from '../../../types';
import ExportMenu from '../../../components/admin/ExportMenu';
import ChatTranscripts from '../../../components/admin/ChatTranscripts';
import { useToast } from '../../../components/admin/Toast';
import { printTable, type ExportData } from '../../../utils/csvExport';
import { getErrorMessage } from '../../../utils/errors';
import { buildTicketIndex, ticketNo } from '../../../utils/ticketNo';
import styles from '../css/SuperAdminDashboard.module.css';
import ScrollReveal from '../../../components/admin/ScrollReveal';
import csStyles from '../css/CountriesSection.module.css';

const COUNTRIES = ['IN', 'SG', 'AE', 'US', 'LK'];
const PAGE_SIZE = 10;

const COUNTRY_FLAGS: Record<string, string> = {
  IN: '/images/in-flag.svg',
  SG: '/images/sg-flag.svg',
  AE: '/images/uae-flag.svg',
  US: '/images/us-flag.svg',
  LK: '/images/lk-flag.svg',
};

const COUNTRY_LABELS: Record<string, string> = {
  IN: 'India',
  SG: 'Singapore',
  AE: 'UAE',
  US: 'United States',
  LK: 'Sri Lanka',
};

const visuallyHidden: CSSProperties = {
  position: 'absolute',
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
  border: 0,
};

const STATUS_STYLES: Record<string, { bg: string; color: string }> = {
  NEW: { bg: '#DCFCE7', color: '#16A34A' },
  REPLIED: { bg: '#DBEAFE', color: '#2563EB' },
  CLOSED: { bg: '#F1F5F9', color: '#64748B' },
  IN_PROGRESS: { bg: '#FEF3C7', color: '#D97706' },
  PENDING: { bg: '#FEF3C7', color: '#D97706' },
  ACCEPTED: { bg: '#DCFCE7', color: '#16A34A' },
  IN_REVIEW: { bg: '#DBEAFE', color: '#2563EB' },
  DECLINED: { bg: '#FEE2E2', color: '#DC2626' },
};

const enquiryCell: CSSProperties = {
  padding: '10px 12px',
  color: 'rgba(255,255,255,0.85)',
  fontSize: 13,
  verticalAlign: 'top',
};

const CHANNELS = ['Admin', 'Support Lead', 'Agent Alpha', 'Agent Beta'];

function SectionTitle({ icon, title }: { icon: string; title: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, paddingBottom: 6, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
      <i className={`fas ${icon}`} style={{ color: '#86efac', fontSize: 13 }} />
      <span style={{ fontSize: 12, fontWeight: 700, color: '#86efac', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{title}</span>
    </div>
  );
}

function InfoBox({ label, value, badge, badgeColor }: { label: string; value: string; badge?: string; badgeColor?: string }) {
  return (
    <div style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '8px 10px' }}>
      <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', marginBottom: 3, textTransform: 'uppercase', fontWeight: 600 }}>{label}</div>
      {badge ? (
        <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 10, fontSize: 11, fontWeight: 600, background: `${badgeColor}26`, color: badgeColor }}>{badge}</span>
      ) : (
        <div style={{ fontSize: 12, fontWeight: 600, color: '#fff', wordBreak: 'break-word' }}>{value}</div>
      )}
    </div>
  );
}

export default function SuperSupportView() {
  const [rawMessages, setRawMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<ContactMessage | null>(null);
  const [closing, setClosing] = useState(false);
  const [replyTarget, setReplyTarget] = useState<ContactMessage | null>(null);
  const [replyText, setReplyText] = useState('');
  const [drawerReply, setDrawerReply] = useState('');
  const [saving, setSaving] = useState(false);
  const [section, setSection] = useState<'messages' | 'chats' | 'enquiries'>('messages');
  const { notify } = useToast();
  const [enquiries, setEnquiries] = useState<B2BEnquiry[]>([]);
  const [enquiriesLoading, setEnquiriesLoading] = useState(false);
  const [enquiriesError, setEnquiriesError] = useState('');
  const [enquirySavingId, setEnquirySavingId] = useState<string | null>(null);
  const loadSeqRef = useRef(0);

  /**
   * Search filters the rows already in memory — it is deliberately not part of
   * the load effect, so typing no longer re-fetches the whole inbox (and
   * re-runs the expiry purge) on every keystroke.
   */
  const messages = useMemo(() => {
    const q = search.toLowerCase().trim();
    return q
      ? rawMessages.filter((m) => `${m.name} ${m.email} ${m.subject} ${m.id}`.toLowerCase().includes(q))
      : rawMessages;
  }, [rawMessages, search]);

  /**
   * Rows older than 15 days are purged on every load. The purge used to be
   * awaited in series *before* the first paint, so the table waited on one
   * DELETE round-trip per expired row. It now runs in parallel after the list
   * is already on screen; failed deletions are reported and retried on the
   * next load instead of failing the whole load.
   */
  async function purgeExpired(rows: ContactMessage[]) {
    const FIFTEEN_DAYS = 15 * 24 * 60 * 60 * 1000;
    const now = Date.now();
    const expired = rows.filter((m) => now - new Date(m.createdAt).getTime() > FIFTEEN_DAYS);
    if (expired.length === 0) return;

    const results = await Promise.allSettled(expired.map((m) => remove(m.id)));
    const failedIds = new Set<string>();
    results.forEach((result, i) => {
      if (result.status === 'rejected') failedIds.add(expired[i].id);
    });

    const removedIds = new Set(expired.filter((m) => !failedIds.has(m.id)).map((m) => m.id));
    if (removedIds.size > 0) {
      setRawMessages((prev) => prev.filter((m) => !removedIds.has(m.id)));
    }
    if (failedIds.size > 0) {
      notify(
        `${failedIds.size} expired message${failedIds.size === 1 ? '' : 's'} could not be deleted.`,
        'error',
      );
    }
  }

  function load() {
    const seq = ++loadSeqRef.current;
    setLoading(true);
    list(status || undefined)
      .then((all) => {
        if (seq !== loadSeqRef.current) return; // superseded by a newer request
        setRawMessages(all);
        setError('');
        void purgeExpired(all);
      })
      .catch((err: unknown) => {
        if (seq === loadSeqRef.current) setError(getErrorMessage(err, 'Could not load support messages.'));
      })
      .finally(() => {
        if (seq === loadSeqRef.current) setLoading(false);
      });
  }

  // Re-running on `purgeExpired`'s (unstable) identity would refetch on every
  // render; only `status` should trigger a load — search filters in memory.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(load, [status]);

  // Warm the live-chat inbox in the background so opening the "Live chat" tab
  // does not start from a cold network request. Shares an in-flight request if
  // the tab is opened while this one is still running.
  useEffect(() => {
    prefetchChatSessions();
  }, []);

  function loadEnquiries() {
    setEnquiriesLoading(true);
    listEnquiries()
      .then((rows) => { setEnquiries(rows); setEnquiriesError(''); })
      .catch((err: unknown) => setEnquiriesError(getErrorMessage(err, 'Could not load B2B enquiries.')))
      .finally(() => setEnquiriesLoading(false));
  }

  useEffect(() => {
    if (section !== 'enquiries') return;
    loadEnquiries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [section]);

  const totalPages = Math.max(1, Math.ceil(messages.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);

  const sorted = useMemo(() => {
    if (!sortBy) return messages;
    const arr = [...messages];
    if (sortBy === 'date') arr.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    if (sortBy === 'name') arr.sort((a, b) => a.name.localeCompare(b.name));
    if (sortBy === 'priority') {
      const order: Record<string, number> = { high: 0, medium: 1, low: 2 };
      arr.sort((a, b) => (order[a.priority?.toLowerCase() ?? 'medium'] ?? 1) - (order[b.priority?.toLowerCase() ?? 'medium'] ?? 1));
    }
    return arr;
  }, [messages, sortBy]);

  const paged = sorted.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const start = messages.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1;
  const end = Math.min(safePage * PAGE_SIZE, messages.length);

  // Single pass instead of three full filter scans per render.
  const statusCounts = useMemo(() => {
    const counts = { all: messages.length, NEW: 0, REPLIED: 0, CLOSED: 0 };
    for (const m of messages) {
      if (m.status === 'NEW') counts.NEW++;
      else if (m.status === 'REPLIED') counts.REPLIED++;
      else if (m.status === 'CLOSED') counts.CLOSED++;
    }
    return counts;
  }, [messages]);

  // Display-only ticket numbers over the widest fetched set (stable within a filter).
  const ticketIndex = useMemo(() => buildTicketIndex(messages), [messages]);

  function getTicketId(m: ContactMessage): string {
    return ticketNo(ticketIndex, m.id);
  }

  function getChannel(idx: number): string {
    return CHANNELS[idx % CHANNELS.length];
  }

  function getCategory(m: ContactMessage): string {
    const s = m.subject.toLowerCase();
    if (s.includes('delivery') || s.includes('delay')) return 'Delivery';
    if (s.includes('refund') || s.includes('damaged')) return 'Order Issue';
    if (s.includes('track') || s.includes('order')) return 'Product Query';
    return m.category ?? 'General';
  }

  function openDetail(m: ContactMessage) {
    setClosing(false);
    setSelected(m);
  }

  function closeDetail() {
    setClosing(true);
    setTimeout(() => { setSelected(null); setClosing(false); }, 300);
  }

  async function markReplied() {
    if (!replyTarget) return;
    setSaving(true);
    try {
      await updateStatus(replyTarget.id, 'REPLIED');
      setReplyTarget(null);
      setReplyText('');
      load();
      notify('Reply sent successfully.');
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Could not update message status.'));
    } finally {
      setSaving(false);
    }
  }

  async function deleteMessage(m: ContactMessage) {
    if (!window.confirm('Delete this message?')) return;
    setSaving(true);
    try {
      await remove(m.id);
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
      filename: 'support-messages.csv',
      title: 'Support Messages',
      columns: ['Ticket ID', 'Subject', 'User', 'Category', 'Country', 'Status', 'Channel', 'Date'],
      rows: messages.map((m, i) => [getTicketId(m), m.subject, m.name, getCategory(m), COUNTRY_LABELS[m.countryCode ?? ''] ?? m.countryCode ?? '', m.status, getChannel(i), new Date().toLocaleDateString()]),
    };
  }

  function printList() {
    printTable(getExportData());
  }

  return (
    <div>
      {/* Banner */}
      <ScrollReveal>
        <div className={`${styles.payHero} ${styles.supHero}`}>
          {/* Text alternative for the banner art (invisible - no second visible header) */}
          <span style={visuallyHidden}>Support Messages - manage customer support inquiries from all countries</span>
          {/* Visible buttons laid over the Print / Export pills drawn into support.jpeg */}
          <div className={styles.supHeroHits}>
            <button
              type="button"
              className={`${styles.supHeroHit} ${styles.supHeroPrintHit}`}
              onClick={printList}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="6 9 6 2 18 2 18 9" /><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><rect x="6" y="14" width="12" height="8" /></svg>
              Print
            </button>
            <div className={`${styles.supHeroHit} ${styles.supHeroExportHit}`}>
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
          </div>
        </div>
      </ScrollReveal>

      {/* ── Messages / Live chat switcher ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        {([
          { key: 'messages', label: 'Messages' },
          { key: 'chats', label: 'Live chat' },
          { key: 'enquiries', label: 'B2B Enquiries' },
        ] as const).map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setSection(tab.key)}
            style={{
              padding: '8px 18px', borderRadius: 20, border: 'none',
              background: section === tab.key ? '#2E7D32' : '#fff',
              color: section === tab.key ? '#fff' : '#64748B',
              fontWeight: 600, fontSize: 13, cursor: 'pointer',
              boxShadow: section === tab.key ? '0 2px 8px rgba(46,125,50,0.25)' : '0 1px 3px rgba(0,0,0,0.08)',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {section === 'messages' ? (
      <>
      {/* Filter Tabs */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        {[
          { key: '', label: 'All', count: statusCounts.all },
          { key: 'NEW', label: 'New', count: statusCounts.NEW },
          { key: 'REPLIED', label: 'Replied', count: statusCounts.REPLIED },
          { key: 'CLOSED', label: 'Closed', count: statusCounts.CLOSED },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => { setStatus(tab.key); setPage(1); }}
            style={{
              padding: '8px 18px',
              borderRadius: 20,
              border: 'none',
              background: status === tab.key ? '#2E7D32' : '#fff',
              color: status === tab.key ? '#fff' : '#64748B',
              fontWeight: 600,
              fontSize: 13,
              cursor: 'pointer',
              boxShadow: status === tab.key ? '0 2px 8px rgba(46,125,50,0.25)' : '0 1px 3px rgba(0,0,0,0.08)',
              transition: 'all 0.2s',
            }}
          >
            {tab.label} {tab.count}
          </button>
        ))}
        <div style={{ marginLeft: 'auto' }}>
          <div style={{ position: 'relative' }}>
            <i className="fas fa-search" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', fontSize: 13 }} />
            <input
              placeholder="Search by ticket id, user, subject, message..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              style={{
                padding: '9px 14px 9px 36px',
                borderRadius: 10,
                border: '1px solid #E2E8F0',
                fontSize: 13,
                width: 320,
                outline: 'none',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              }}
            />
          </div>
        </div>
      </div>

      {/* Table Panel */}
      <ScrollReveal delay={100}>
        <div className={`${styles.panel} ${styles.panelLight}`}>
          <div style={{ padding: '12px 20px', fontSize: 13, color: '#64748B', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>{loading ? 'Loading...' : `Showing ${start}-${end} of ${messages.length} messages`}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {[
                { key: 'date', label: 'Date', icon: 'fa-calendar' },
                { key: 'name', label: 'Name', icon: 'fa-user' },
                { key: 'priority', label: 'Priority', icon: 'fa-flag' },
              ].map((btn) => (
                <button
                  key={btn.key}
                  type="button"
                  onClick={() => setSortBy(sortBy === btn.key ? '' : btn.key)}
                  style={{
                    padding: '6px 14px', borderRadius: 8,
                    border: sortBy === btn.key ? '1px solid #2E7D32' : '1px solid #E2E8F0',
                    background: sortBy === btn.key ? '#2E7D32' : '#F8FAFC',
                    color: sortBy === btn.key ? '#fff' : '#374151',
                    fontSize: 12, fontWeight: 500, cursor: 'pointer',
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                    transition: 'all 0.15s',
                  }}
                >
                  <i className={`fas ${btn.icon}`} style={{ fontSize: 11 }} />
                  {btn.label}
                </button>
              ))}
              {sortBy && (
                <button
                  type="button"
                  onClick={() => setSortBy('')}
                  style={{
                    padding: '6px 12px', borderRadius: 8,
                    border: '1px solid #E2E8F0', background: '#F8FAFC',
                    color: '#64748B', fontSize: 12, fontWeight: 500, cursor: 'pointer',
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                  }}
                >
                  <i className="fas fa-times" style={{ fontSize: 10 }} />
                  Reset
                </button>
              )}
            </div>
          </div>
          <div className={styles.tableWrapper}>
            {error ? (
              <div className={styles.panelBody}>
                <p className={styles.placeholder}>{error}</p>
                <button type="button" className={styles.viewButton} onClick={load}>Retry</button>
              </div>
            ) : loading && messages.length === 0 ? (
              <div className={styles.panelBody}><p className={styles.placeholder}>Loading support messages...</p></div>
            ) : messages.length === 0 ? (
              <div className={styles.panelBody}><p className={styles.placeholder}>No support messages match these filters.</p></div>
            ) : (
              <table className={`${styles.table} ${styles.tableLight}`}>
                <thead>
                  <tr>
                    <th>Ticket ID</th>
                    <th>Subject</th>
                    <th>User</th>
                    <th>Category</th>
                    <th>Country</th>
                    <th>Status</th>
                    <th>Channel</th>
                    <th>Date</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {paged.map((m, i) => {
                    const globalIdx = (safePage - 1) * PAGE_SIZE + i;
                    const st = STATUS_STYLES[m.status] ?? STATUS_STYLES.NEW;
                    return (
                      <tr key={m.id}>
                        <td style={{ fontWeight: 600, fontSize: 13, color: '#2E7D32' }}>{getTicketId(m)}</td>
                        <td style={{ fontSize: 13, fontWeight: 500, maxWidth: 220 }}>{m.subject}</td>
                        <td>
                          <div style={{ fontWeight: 600, fontSize: 13, color: '#1E293B' }}>{m.name}</div>
                          <div style={{ fontSize: 11, color: '#64748B' }}>{m.email}</div>
                        </td>
                        <td>
                          <span style={{
                            display: 'inline-block',
                            padding: '3px 10px',
                            borderRadius: 12,
                            fontSize: 12,
                            fontWeight: 600,
                            background: getCategory(m) === 'Delivery' ? '#DCFCE7' : getCategory(m) === 'Order Issue' ? '#FEF3C7' : '#DBEAFE',
                            color: getCategory(m) === 'Delivery' ? '#16A34A' : getCategory(m) === 'Order Issue' ? '#D97706' : '#2563EB',
                          }}>
                            {getCategory(m)}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <img src={COUNTRY_FLAGS[m.countryCode ?? ''] ?? ''} alt="" style={{ width: 18, height: 18, borderRadius: '50%', objectFit: 'cover' }} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                            <span style={{ fontSize: 13, fontWeight: 500 }}>{COUNTRY_LABELS[m.countryCode ?? ''] ?? m.countryCode ?? '—'}</span>
                          </div>
                        </td>
                        <td>
                          <span style={{
                            display: 'inline-block',
                            padding: '3px 10px',
                            borderRadius: 12,
                            fontSize: 12,
                            fontWeight: 600,
                            background: st.bg,
                            color: st.color,
                          }}>
                            {m.status.charAt(0).toUpperCase() + m.status.slice(1).toLowerCase()}
                          </span>
                        </td>
                        <td style={{ fontSize: 13, color: '#64748B' }}>{getChannel(globalIdx)}</td>
                        <td style={{ fontSize: 13, color: '#64748B' }}>{new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                        <td>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button
                              type="button"
                              onClick={() => void openDetail(m)}
                              className={csStyles.actionBtn}
                              title="View details"
                            >
                              <i className="fas fa-eye" />
                            </button>
                            <button
                              type="button"
                              onClick={() => { setReplyTarget(m); setReplyText(''); }}
                              style={{
                                width: 34, height: 34, borderRadius: 8,
                                border: '1px solid #DBEAFE', background: '#EFF6FF', color: '#2563EB',
                                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                              }}
                              title="Reply"
                            >
                              <i className="fas fa-reply" style={{ fontSize: 13 }} />
                            </button>
                            <button
                              type="button"
                              onClick={() => void deleteMessage(m)}
                              style={{
                                width: 34, height: 34, borderRadius: 8,
                                border: '1px solid #FEE2E2', background: '#FEF2F2', color: '#DC2626',
                                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                              }}
                              title="Delete"
                            >
                              <i className="fas fa-trash-alt" style={{ fontSize: 13 }} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '16px 20px' }}>
              <button
                type="button"
                disabled={safePage <= 1}
                onClick={() => setPage(safePage - 1)}
                style={{
                  padding: '7px 14px', borderRadius: 8,
                  border: '1px solid #E2E8F0', background: '#fff',
                  color: safePage <= 1 ? '#CBD5E1' : '#2E7D32',
                  fontWeight: 600, fontSize: 13,
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
                    width: 34, height: 34, borderRadius: 8,
                    border: p === safePage ? '1px solid #2E7D32' : '1px solid #E2E8F0',
                    background: p === safePage ? '#2E7D32' : '#fff',
                    color: p === safePage ? '#fff' : '#64748B',
                    fontWeight: 600, fontSize: 13, cursor: 'pointer',
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
                  padding: '7px 14px', borderRadius: 8,
                  border: '1px solid #E2E8F0', background: '#fff',
                  color: safePage >= totalPages ? '#CBD5E1' : '#2E7D32',
                  fontWeight: 600, fontSize: 13,
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
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 12000, background: 'rgba(8,30,16,0.55)', animation: closing ? 'fadeOut 0.3s ease forwards' : 'fadeIn 0.25s ease forwards' }}
          onClick={closeDetail}
        >
          <style>{`@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } } @keyframes fadeOut { from { opacity: 1; } to { opacity: 0; } } @keyframes slideIn { to { transform: translateX(0); } } @keyframes slideOut { to { transform: translateX(100%); } }`}</style>
          <div
            style={{
              position: 'fixed', top: 0, right: 0, bottom: 0, width: 520, maxWidth: '100vw',
              background: 'linear-gradient(135deg, #14472F, #0d3018)', color: '#fff',
              boxShadow: '-8px 0 30px rgba(8,30,16,0.55)',
              display: 'flex', flexDirection: 'column',
              transform: 'translateX(100%)', animation: closing ? 'slideOut 0.3s cubic-bezier(0.2,0.8,0.2,1) forwards' : 'slideIn 0.3s cubic-bezier(0.2,0.8,0.2,1) forwards',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 22px', borderBottom: '1px solid rgba(255,255,255,0.12)', background: 'linear-gradient(135deg, #065f46, #047857)', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <i className="fas fa-ticket-alt" style={{ fontSize: 18, color: '#86efac' }} />
                <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: '#fff' }}>Support Ticket Details</h2>
              </div>
              <button type="button" onClick={closeDetail} style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid rgba(255,255,255,0.16)', background: 'rgba(255,255,255,0.08)', color: '#fff', cursor: 'pointer', fontSize: 16 }}>×</button>
            </div>

            {/* Drawer Body */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '18px 20px' }}>
              {/* Ticket Details */}
              <SectionTitle icon="fa-info-circle" title="Ticket Details" />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 18 }}>
                <InfoBox label="Ticket ID" value={getTicketId(selected)} />
                <InfoBox label="Category" value={getCategory(selected)} badge={getCategory(selected)} badgeColor={getCategory(selected) === 'Delivery' ? '#16A34A' : getCategory(selected) === 'Order Issue' ? '#D97706' : '#2563EB'} />
                <InfoBox label="Priority" value={selected.priority ?? 'Medium'} badge={selected.priority ?? 'Medium'} badgeColor="#F59E0B" />
                <InfoBox label="Status" value={selected.status} badge={selected.status} badgeColor={selected.status === 'NEW' ? '#16A34A' : selected.status === 'REPLIED' ? '#2563EB' : '#64748B'} />
                <InfoBox label="Assigned To" value={selected.assignedTo ?? 'Admin'} />
                <InfoBox label="Created" value={new Date(selected.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} />
                <InfoBox label="Last Response" value="No response yet" />
                <InfoBox label="Resolution Time" value="Pending" />
              </div>

              {/* Customer Information */}
              <SectionTitle icon="fa-user" title="Customer Information" />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 18 }}>
                <InfoBox label="Customer ID" value={`CID-${selected.id.replace(/[^A-Z0-9]/gi, '').slice(-6).toUpperCase()}`} />
                <InfoBox label="Name" value={selected.name} />
                <InfoBox label="Email" value={selected.email} />
                <InfoBox label="Phone" value={selected.phone ?? '+0 000 000 0000'} />
              </div>

              {/* Original Message */}
              <SectionTitle icon="fa-envelope" title="Original Message" />
              <div style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 10, padding: 14, marginBottom: 18, fontSize: 13, lineHeight: 1.7, color: 'rgba(255,255,255,0.85)' }}>
                {selected.message}
              </div>

              {/* Conversation History */}
              <SectionTitle icon="fa-comments" title="Conversation History" />
              <div style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 10, padding: 14, marginBottom: 18 }}>
                <div style={{ fontSize: 12, lineHeight: 1.6, color: 'rgba(255,255,255,0.85)' }}>{selected.message}</div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', marginTop: 6 }}>{selected.name} · {new Date(selected.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                <div style={{ textAlign: 'center', fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 12 }}>No replies yet</div>
              </div>

              {/* Admin Response */}
              <SectionTitle icon="fa-reply" title="Admin Response" />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', marginBottom: 4, textTransform: 'uppercase', fontWeight: 600 }}>Status</div>
                  <select
                    value={selected.status}
                    onChange={(e) => setSelected({ ...selected, status: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.16)', background: 'rgba(255,255,255,0.08)', color: '#fff', fontSize: 13 }}
                  >
                    <option value="NEW">New</option>
                    <option value="READ">Read</option>
                    <option value="REPLIED">Replied</option>
                    <option value="CLOSED">Closed</option>
                  </select>
                </div>
                <div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', marginBottom: 4, textTransform: 'uppercase', fontWeight: 600 }}>Priority</div>
                  <select
                    value={selected.priority ?? 'Medium'}
                    onChange={(e) => setSelected({ ...selected, priority: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.16)', background: 'rgba(255,255,255,0.08)', color: '#fff', fontSize: 13 }}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', marginBottom: 4, textTransform: 'uppercase', fontWeight: 600 }}>Reply Message</div>
                <textarea
                  placeholder="Type your reply here..."
                  rows={4}
                  value={drawerReply}
                  onChange={(e) => setDrawerReply(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.16)', background: 'rgba(255,255,255,0.08)', color: '#fff', fontSize: 13, resize: 'vertical', outline: 'none', fontFamily: 'inherit' }}
                />
              </div>
              <button
                type="button"
                disabled={saving || !drawerReply.trim()}
                onClick={async () => {
                  if (!selected || !drawerReply.trim()) return;
                  setSaving(true);
                  try {
                    await updateStatus(selected.id, 'REPLIED');
                    setDrawerReply('');
                    load();
                    notify('Reply sent successfully.');
                  } catch (err: unknown) {
                    setError(getErrorMessage(err, 'Could not update message status.'));
                  } finally {
                    setSaving(false);
                  }
                }}
                style={{
                  width: '100%', padding: '10px 16px', borderRadius: 8, border: 'none',
                  background: 'linear-gradient(135deg, #22C55E, #16A34A)', color: '#fff',
                  cursor: 'pointer', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                }}
              >
                <i className="fas fa-paper-plane" style={{ fontSize: 12 }} />
                {saving ? 'Saving...' : 'Send Reply & Update'}
              </button>
            </div>
          </div>
        </div>
      )}
      </>
      ) : section === 'chats' ? (
        <ChatTranscripts />
      ) : (
        /* ── B2B Enquiries tab ── */
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#fff', margin: 0 }}>B2B Enquiries</h3>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>{enquiries.length} total</span>
            <button
              type="button"
              onClick={loadEnquiries}
              style={{ marginLeft: 'auto', padding: '6px 14px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.16)', background: 'rgba(255,255,255,0.08)', color: '#fff', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <i className="fas fa-sync-alt" style={{ fontSize: 11 }} /> Refresh
            </button>
          </div>

          {enquiriesLoading && enquiries.length === 0 ? (
            <div style={{ padding: 24, textAlign: 'center', color: 'rgba(255,255,255,0.6)', fontSize: 13 }}>Loading enquiries...</div>
          ) : enquiriesError ? (
            <div style={{ padding: 24, textAlign: 'center', color: '#FCA5A5', fontSize: 13 }}>{enquiriesError}</div>
          ) : enquiries.length === 0 ? (
            <div style={{ padding: 36, textAlign: 'center', color: 'rgba(255,255,255,0.5)', fontSize: 13, background: 'rgba(255,255,255,0.04)', border: '1px dashed rgba(255,255,255,0.14)', borderRadius: 12 }}>
              No B2B enquiries yet — submissions from the B2B page appear here instantly.
            </div>
          ) : (
            <div style={{ overflowX: 'auto', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 900 }}>
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,0.06)' }}>
                    {['Company', 'Contact', 'Email', 'Phone', 'Products', 'Qty', 'Status', 'Date'].map((h) => (
                      <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.4, color: 'rgba(255,255,255,0.55)', fontWeight: 700, whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {enquiries.map((q) => {
                    const st = STATUS_STYLES[q.status] ?? { bg: '#F1F5F9', color: '#64748B' };
                    return (
                      <tr key={q.id} style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                        <td style={{ ...enquiryCell, fontWeight: 600 }}>{q.companyName}</td>
                        <td style={enquiryCell}>{q.contactName}</td>
                        <td style={enquiryCell}>
                          <a href={`mailto:${q.email}`} style={{ color: '#86efac', textDecoration: 'none' }}>{q.email}</a>
                        </td>
                        <td style={{ ...enquiryCell, whiteSpace: 'nowrap' }}>{q.phone ? `${q.countryCode ?? ''}${q.phone}` : '—'}</td>
                        <td style={enquiryCell}>{q.productInterest || '—'}</td>
                        <td style={{ ...enquiryCell, whiteSpace: 'nowrap' }}>{q.quantity || '—'}</td>
                        <td style={enquiryCell}>
                          <select
                            value={q.status}
                            disabled={enquirySavingId === q.id}
                            onChange={(e) => {
                              const next = e.target.value;
                              if (next === 'DECLINED' && !window.confirm(`Decline enquiry from ${q.name}? This cannot be undone.`)) {
                                e.target.value = q.status;
                                return;
                              }
                              setEnquirySavingId(q.id);
                              updateEnquiryStatus(q.id, next)
                                .then(() => {
                                  setEnquiries((prev) => prev.map((x) => (x.id === q.id ? { ...x, status: next } : x)));
                                  notify('Enquiry status updated.');
                                })
                                .catch((err: unknown) => notify(getErrorMessage(err, 'Could not update enquiry status.'), 'error'))
                                .finally(() => setEnquirySavingId(null));
                            }}
                            style={{ padding: '5px 8px', borderRadius: 8, border: 'none', background: st.bg, color: st.color, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}
                          >
                            <option value="PENDING">Pending</option>
                            <option value="IN_REVIEW">In review</option>
                            <option value="ACCEPTED">Accepted</option>
                            <option value="DECLINED">Declined</option>
                          </select>
                        </td>
                        <td style={{ ...enquiryCell, whiteSpace: 'nowrap', color: 'rgba(255,255,255,0.6)' }}>
                          {new Date(q.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Reply Modal */}
      {replyTarget && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 13000, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'fadeIn 0.2s ease forwards' }}
          onClick={() => setReplyTarget(null)}
        >
          <style>{`@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } } @keyframes popIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }`}</style>
          <div
            style={{
              background: '#fff', borderRadius: 14, width: 420, maxWidth: '92vw', overflow: 'hidden',
              boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
              animation: 'popIn 0.25s cubic-bezier(0.2,0.8,0.2,1) forwards',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', background: 'linear-gradient(135deg, #2E7D32, #1B5E20)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <i className="fas fa-reply" style={{ fontSize: 16, color: '#fff' }} />
                <span style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>Reply to Message</span>
              </div>
              <button
                type="button"
                onClick={() => setReplyTarget(null)}
                style={{ width: 30, height: 30, borderRadius: 8, border: '1px solid rgba(255,255,255,0.25)', background: 'rgba(255,255,255,0.15)', color: '#fff', cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                ×
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '20px 22px' }}>
              <div style={{ fontSize: 13, color: '#64748B', marginBottom: 6 }}>
                Replying to ticket <strong style={{ color: '#1E293B' }}>{getTicketId(replyTarget)}</strong>
              </div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#1E293B', marginBottom: 4 }}>{replyTarget.subject}</div>
              <div style={{ fontSize: 12, color: '#94A3B8', marginBottom: 18 }}>
                To: {replyTarget.name} &lt;{replyTarget.email}&gt;
              </div>

              <div style={{ fontSize: 11, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>Your Reply</div>
              <textarea
                placeholder="Type your reply here..."
                rows={5}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                style={{
                  width: '100%', padding: '12px 14px', borderRadius: 10,
                  border: '1px solid #E2E8F0', fontSize: 13, lineHeight: 1.6,
                  resize: 'vertical', outline: 'none', fontFamily: 'inherit',
                  color: '#1E293B', background: '#F8FAFC',
                }}
              />

              {/* Actions */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 18 }}>
                <button
                  type="button"
                  onClick={() => setReplyTarget(null)}
                  style={{
                    padding: '9px 20px', borderRadius: 8, border: '1px solid #E2E8F0',
                    background: '#fff', color: '#64748B', fontWeight: 600, fontSize: 13, cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={saving || !replyText.trim()}
                  onClick={() => void markReplied()}
                  style={{
                    padding: '9px 20px', borderRadius: 8, border: 'none',
                    background: saving || !replyText.trim() ? '#94A3B8' : 'linear-gradient(135deg, #22C55E, #16A34A)',
                    color: '#fff', fontWeight: 600, fontSize: 13,
                    cursor: saving || !replyText.trim() ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', gap: 6,
                  }}
                >
                  <i className="fas fa-paper-plane" style={{ fontSize: 11 }} />
                  {saving ? 'Sending...' : 'Send Reply'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
