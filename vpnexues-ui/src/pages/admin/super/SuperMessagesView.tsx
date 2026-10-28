import { useEffect, useRef, useState } from 'react';
import {
  demoListAdminMessages,
  demoMarkAdminMessageRead,
  demoSendAdminMessage,
  demoToggleAdminMessageStar,
  demoUpdateAdminMessage,
  type DemoAdminMessage,
} from '../../../api/demo/demoAdmin';
import { useToast } from '../../../components/admin/Toast';
import s from '../css/SuperMessagesView.module.css';
import ScrollReveal from '../../../components/admin/ScrollReveal';

/* ── Icons ── */
const MailIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
);
const SendIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
);
const InboxIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>
);
const SearchIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
);
const CloseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
);
const ReplyIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 17 4 12 9 7"/><path d="M20 18v-2a4 4 0 0 0-4-4H4"/></svg>
);

type ViewTab = 'send' | 'inbox';

const RECIPIENTS = [
  { id: 'us', label: 'USA', email: 'usa@vpnexues.com', flag: '\u{1F1FA}\u{1F1F8}' },
  { id: 'uae', label: 'UAE', email: 'uae@vpnexues.com', flag: '\u{1F1E6}\u{1F1EA}' },
  { id: 'singapore', label: 'Singapore', email: 'singapore@vpnexues.com', flag: '\u{1F1F8}\u{1F1EC}' },
  { id: 'india', label: 'India', email: 'india@vpnexues.com', flag: '\u{1F1EE}\u{1F1F3}' },
  { id: 'lk', label: 'Sri Lanka', email: 'lk@vpnexues.com', flag: '\u{1F1F1}\u{1F1F0}' },
];

export default function SuperMessagesView() {
  const { notify } = useToast();

  /* ── Messages data ── */
  const [messages, setMessages] = useState<DemoAdminMessage[]>([]);
  const [viewTab, setViewTab] = useState<ViewTab>('send');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<DemoAdminMessage | null>(null);
  const [replyText, setReplyText] = useState('');
  const [detailStatus, setDetailStatus] = useState('');
  const [detailPriority, setDetailPriority] = useState('');

  /* ── Send Message ── */
  const [recipients, setRecipients] = useState<string[]>(RECIPIENTS.map((r) => r.id));
  const [composing, setComposing] = useState(false);
  const [composeTo, setComposeTo] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [subjectErr, setSubjectErr] = useState('');
  const [bodyErr, setBodyErr] = useState('');
  const subjectRef = useRef<HTMLInputElement>(null);

  const allChecked = recipients.length === RECIPIENTS.length;

  function load() {
    setMessages(demoListAdminMessages('super'));
  }

  useEffect(load, []);

  /* ── Escape key closes compose modal ── */
  useEffect(() => {
    if (!composing) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setComposing(false);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [composing]);

  /* ── Auto-focus subject when compose modal opens ── */
  useEffect(() => {
    if (composing && subjectRef.current) {
      setTimeout(() => subjectRef.current?.focus(), 50);
    }
  }, [composing]);

  /* ── Derived ── */
  const received = messages.filter((m) => m.sender !== 'super');
  const unread = received.filter((m) => !m.read).length;
  const starred = messages.filter((m) => m.starred);
  const q = search.toLowerCase().trim();
  const filtered = q
    ? received.filter((m) => `${m.subject} ${m.body} ${m.from}`.toLowerCase().includes(q))
    : received;

  /* ── Actions ── */
  function toggleRecipient(id: string) {
    setRecipients((prev) => (prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]));
  }

  function toggleSelectAll() {
    setRecipients(allChecked ? [] : RECIPIENTS.map((r) => r.id));
  }

  function openDetail(m: DemoAdminMessage) {
    const updated = demoMarkAdminMessageRead(m.id, true);
    setSelected(updated);
    setReplyText('');
    setDetailStatus(updated.status || 'open');
    setDetailPriority(updated.priority || 'medium');
    load();
  }

  function sendDetailReply() {
    if (!selected) return;
    if (!replyText.trim()) { notify('Please type a reply', 'error'); return; }
    demoUpdateAdminMessage(selected.id, { status: detailStatus || 'open', priority: detailPriority || 'medium' });
    demoSendAdminMessage({ from: 'Super Admin', fromEmail: 'superadmin@vpnexues.com', to: selected.sender === 'super' ? selected.to : selected.sender, subject: `Re: ${selected.subject}`, body: replyText.trim(), sender: 'super' });
    setReplyText('');
    setSelected(null);
    load();
    notify('Reply sent.');
  }

  function toggleStar(m: DemoAdminMessage) {
    demoToggleAdminMessageStar(m.id);
    load();
  }

  function openCompose(toId: string) {
    setComposeTo(toId);
    setSubject('');
    setBody('');
    setSubjectErr('');
    setBodyErr('');
    setComposing(true);
  }

  function send(e: React.FormEvent) {
    e.preventDefault();
    let valid = true;
    if (!subject.trim()) { setSubjectErr('Subject is required'); valid = false; } else { setSubjectErr(''); }
    if (!body.trim()) { setBodyErr('Message is required'); valid = false; } else { setBodyErr(''); }
    if (!valid) return;
    demoSendAdminMessage({ from: 'Super Admin', fromEmail: 'superadmin@vpnexues.com', to: composeTo, subject: subject.trim(), body: body.trim(), sender: 'super' });
    setComposing(false);
    load();
    notify('Message sent.');
  }

  function formatTime(ts: number | string) {
    const d = new Date(ts);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }) + ', ' + d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }

  return (
    <div className={s.messagesPage}>
      {/* ── Banner ── */}
      <ScrollReveal>
      <div className={s.banner}>
        <div className={s.bannerIcon}><MailIcon /></div>
        <div className={s.bannerText}>
          <h1 className={s.bannerTitle}>Messages</h1>
          <p className={s.bannerSubtitle}>Send and receive messages from sub admins</p>
        </div>
      </div>
      </ScrollReveal>

      {/* ── Tabs ── */}
      <ScrollReveal delay={100}>
      <div className={s.tabBar}>
        <button type="button" className={`${s.tabBtn} ${viewTab === 'send' ? s.active : ''}`} onClick={() => setViewTab('send')}>
          <SendIcon /> Send Message
        </button>
        <button type="button" className={`${s.tabBtn} ${viewTab === 'inbox' ? s.active : ''}`} onClick={() => setViewTab('inbox')}>
          <InboxIcon /> Inbox {unread > 0 && `(${unread})`}
        </button>
      </div>

      {/* ═══ Send Message Tab ═══ */}
      {viewTab === 'send' && (
        <div className={s.recipientCard}>
          <div className={s.recipientHeader}>
            <div>
              <h3 className={s.recipientTitle}>Select Recipients</h3>
              <p className={s.recipientSub}>Choose sub admins to send this message</p>
            </div>
            <label className={s.selectAllCheck}>
              <input type="checkbox" checked={allChecked} onChange={toggleSelectAll} />
              Select All ( {recipients.length} )
            </label>
          </div>
          <div className={s.recipientList}>
            {RECIPIENTS.map((r) => (
              <div key={r.id} className={s.recipientRow}>
                <input
                  type="checkbox"
                  className={s.recipientCheck}
                  checked={recipients.includes(r.id)}
                  onChange={() => toggleRecipient(r.id)}
                />
                <span className={s.recipientFlag}>{r.flag}</span>
                <div className={s.recipientInfo}>
                  <div className={s.recipientName}>{r.label}</div>
                  <div className={s.recipientEmail}>{r.email}</div>
                </div>
                <span className={s.badgeSubAdmin}>Sub Admin</span>
                <button type="button" className={s.msgBtn} onClick={() => openCompose(r.id)}>
                  <ReplyIcon /> Message
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══ Inbox Tab ═══ */}
      {viewTab === 'inbox' && (
        <>
          <div className={s.searchBar}>
            <div className={s.searchWrap}>
              <SearchIcon />
              <input
                className={s.searchInput}
                placeholder="Search messages..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className={s.tableCard}>
            <div className={s.tableHead}>
              <span></span>
              <span>From</span>
              <span>To</span>
              <span>Subject</span>
              <span>Received</span>
              <span>Action</span>
            </div>
            {filtered.length === 0 ? (
              <div className={s.emptyTable}>No messages found.</div>
            ) : (
              filtered.map((m) => (
                <div key={m.id} className={s.tableRow}>
                  <button
                    type="button"
                    className={`${s.starBtn} ${m.starred ? s.active : ''}`}
                    onClick={() => toggleStar(m)}
                    title={m.starred ? 'Unstar' : 'Star'}
                  >
                    {m.starred ? '★' : '☆'}
                  </button>
                  <div>
                    <div className={s.tableCellBold}>{m.from}</div>
                  </div>
                  <div className={s.tableCell}>
                    {m.to === 'all' ? 'All regions' : m.to === 'super' ? 'Super Admin' : m.to}
                  </div>
                  <div className={s.tableCell}>{m.subject}</div>
                  <div className={s.tableCellSub}>{formatTime(m.ts)}</div>
                  <button type="button" className={s.viewBtn} onClick={() => openDetail(m)}>View</button>
                </div>
              ))
            )}
          </div>
        </>
      )}
      </ScrollReveal>

      {/* ═══ Message Detail Drawer ═══ */}
      {selected && (
        <div className={s.overlay} onClick={() => setSelected(null)}>
          <div className={s.drawer} onClick={(e) => e.stopPropagation()}>
            <div className={s.drawerHeader}>
              <div>
                <div className={s.drawerLabel}>From {selected.sender === 'super' ? 'Super Admin' : selected.from}</div>
                <h2 className={s.drawerTitle}>{selected.subject}</h2>
              </div>
              <button type="button" className={s.closeBtn} onClick={() => setSelected(null)}><CloseIcon /></button>
            </div>
            <div className={s.drawerBody}>
              <div className={s.section}>
                <div className={s.sectionHeader}>Ticket Details</div>
                <div className={s.detailGrid}>
                  <div className={s.detailItem}>
                    <div className={s.detailLabel}>From</div>
                    <div className={s.detailVal}>{selected.from}</div>
                  </div>
                  <div className={s.detailItem}>
                    <div className={s.detailLabel}>To</div>
                    <div className={s.detailVal}>{selected.to === 'all' ? 'All regions' : selected.to}</div>
                  </div>
                  <div className={s.detailItem}>
                    <div className={s.detailLabel}>Date</div>
                    <div className={s.detailVal}>{formatTime(selected.ts)}</div>
                  </div>
                  <div className={s.detailItem}>
                    <div className={s.detailLabel}>Status</div>
                    <div className={s.detailVal}>{selected.read ? 'Read' : 'Unread'}</div>
                  </div>
                </div>
              </div>

              <div className={s.section}>
                <div className={s.sectionHeader}>Original Message</div>
                <div className={s.messageBox}>{selected.body}</div>
              </div>

              <div className={s.section}>
                <div className={s.sectionHeader}>Conversation</div>
                <div className={s.conversation}>
                  <div className={`${s.bubble} ${s.incoming}`}>
                    <div>{selected.body}</div>
                    <div className={s.bubbleMeta}>{selected.from} · {formatTime(selected.ts)}</div>
                  </div>
                </div>
              </div>

              <div className={s.section}>
                <div className={s.sectionHeader}>Admin Response</div>
                <div className={s.adminForm}>
                  <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
                    <div style={{ flex: 1 }}>
                      <label className={s.adminFormLabel}>Status</label>
                      <select className={s.adminFormSelect} value={detailStatus} onChange={(e) => setDetailStatus(e.target.value)}>
                        <option value="open">Open</option>
                        <option value="in-progress">In Progress</option>
                        <option value="waiting">Waiting</option>
                        <option value="resolved">Resolved</option>
                        <option value="closed">Closed</option>
                      </select>
                    </div>
                    <div style={{ flex: 1 }}>
                      <label className={s.adminFormLabel}>Priority</label>
                      <select className={s.adminFormSelect} value={detailPriority} onChange={(e) => setDetailPriority(e.target.value)}>
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                      </select>
                    </div>
                  </div>
                  <div style={{ marginBottom: 10 }}>
                    <label className={s.adminFormLabel}>Reply Message</label>
                    <textarea
                      className={s.adminFormTextarea}
                      placeholder="Type your reply here..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                    />
                  </div>
                  <button type="button" className={s.sendReplyBtn} onClick={sendDetailReply}>
                    Send Reply & Update
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══ Compose Modal ═══ */}
      {composing && (
        <div className={s.modalOverlay} onClick={() => setComposing(false)}>
          <div className={s.modalCard} onClick={(e) => e.stopPropagation()}>
            <div className={s.composeHeader}>
              <div>
                <div className={s.composeLabel}>Send to</div>
                <div className={s.composeRecipientName}>
                  {RECIPIENTS.find((r) => r.id === composeTo)?.label || composeTo} Sub Admin
                </div>
              </div>
              <button type="button" className={s.composeClose} onClick={() => setComposing(false)}><CloseIcon /></button>
            </div>
            <form onSubmit={send}>
              <div className={s.composeBody}>
                <div className={s.formGroup}>
                  <label className={s.composeFieldLabel}>SUBJECT *</label>
                  <input
                    ref={subjectRef}
                    className={`${s.formInput} ${subjectErr ? s.inputError : ''}`}
                    value={subject}
                    onChange={(e) => { setSubject(e.target.value); if (subjectErr) setSubjectErr(''); }}
                    placeholder="Enter message subject"
                    maxLength={200}
                  />
                  {subjectErr && <div className={s.fieldError}>{subjectErr}</div>}
                </div>
                <div className={s.formGroup}>
                  <label className={s.composeFieldLabel}>MESSAGE *</label>
                  <textarea
                    className={`${s.formInput} ${s.textarea} ${bodyErr ? s.inputError : ''}`}
                    value={body}
                    onChange={(e) => { if (e.target.value.length <= 2000) { setBody(e.target.value); if (bodyErr) setBodyErr(''); } }}
                    placeholder="Enter your message..."
                  />
                  <div className={s.charCount}>{body.length}/2000</div>
                  {bodyErr && <div className={s.fieldError}>{bodyErr}</div>}
                </div>
              </div>
              <div className={s.composeFooter}>
                <button type="button" className={s.btnOutline} onClick={() => setComposing(false)}>Cancel</button>
                <button type="submit" className={s.btnSolid}>
                  <SendIcon /> Send Message
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
