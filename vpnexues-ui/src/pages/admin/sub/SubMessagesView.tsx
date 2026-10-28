import { useEffect, useState } from 'react';
import Modal from '../../../components/admin/Modal';
import { useToast } from '../../../components/admin/Toast';
import type { CountryConfig } from '../../../config/countryConfig';
import styles from './SubViews.module.css';
import TrustBanner from './TrustBanner';

type Tab = 'all' | 'unread' | 'starred' | 'sent';

interface MessageItem {
  id: string;
  from: string;
  fromEmail?: string;
  subject: string;
  body: string;
  sender: string;
  read: boolean;
  starred: boolean;
  ts: string;
}

const fieldStyle: React.CSSProperties = { width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #E5E7EB', fontSize: 13, boxSizing: 'border-box' };

/* In-memory demo rows only — the messages API doesn't exist yet and the
 * no-PII-in-browser rule forbids persisting conversation data to storage. */
function seedMessages(id: string): MessageItem[] {
  return [
    {
      id: `${id}-m1`,
      from: 'Super Admin',
      subject: 'Weekly country report',
      body: 'Please share this week’s order summary and any delivery escalations for your region.',
      sender: 'super',
      read: false,
      starred: true,
      ts: '2026-10-05T09:15:00',
    },
    {
      id: `${id}-m2`,
      from: 'Super Admin',
      subject: 'New pricing rules live',
      body: 'Small Box +15% past item 10 and Big Box 12% bulk discount past 10kg are now enforced server-side.',
      sender: 'super',
      read: false,
      starred: false,
      ts: '2026-10-04T16:40:00',
    },
    {
      id: `${id}-m3`,
      from: 'You',
      subject: 'Re: Sub-admin access list',
      body: 'Added the two new sub-admins for India region — please review when convenient.',
      sender: id,
      read: true,
      starred: false,
      ts: '2026-10-03T11:05:00',
    },
  ];
}

export default function SubMessagesView({ config }: { config: CountryConfig }) {
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [tab, setTab] = useState<Tab>('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<MessageItem | null>(null);
  const [composing, setComposing] = useState(false);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [formError, setFormError] = useState('');
  const { notify } = useToast();

  useEffect(() => {
    setMessages(seedMessages(config.id));
  }, [config.id]);

  const mine = config.id;
  const q = search.toLowerCase().trim();
  let base = messages;
  if (tab === 'unread') base = base.filter((m) => !m.read && m.sender === 'super');
  if (tab === 'starred') base = base.filter((m) => m.starred);
  if (tab === 'sent') base = base.filter((m) => m.sender === mine);
  if (q) base = base.filter((m) => `${m.subject} ${m.body} ${m.from}`.toLowerCase().includes(q));

  const unread = messages.filter((m) => !m.read && m.sender === 'super').length;
  const starred = messages.filter((m) => m.starred).length;
  const sent = messages.filter((m) => m.sender === mine).length;

  function openDetail(m: MessageItem) {
    setSelected({ ...m, read: true });
    setMessages((prev) => prev.map((x) => (x.id === m.id ? { ...x, read: true } : x)));
  }

  function toggleStar(m: MessageItem) {
    const starred = !m.starred;
    setMessages((prev) => prev.map((x) => (x.id === m.id ? { ...x, starred } : x)));
    setSelected((s) => (s && s.id === m.id ? { ...s, starred } : s));
  }

  function deleteMessage(m: MessageItem) {
    if (!window.confirm('Delete this message?')) return;
    setMessages((prev) => prev.filter((x) => x.id !== m.id));
    setSelected(null);
    notify('Message deleted.');
  }

  function openCompose() {
    setSubject('');
    setBody('');
    setFormError('');
    setComposing(true);
  }

  function send(e: React.FormEvent) {
    e.preventDefault();
    if (!subject.trim() || !body.trim()) {
      setFormError('Subject and message body are required.');
      return;
    }
    setMessages((prev) => [
      {
        id: `local-${Date.now()}`,
        from: 'You',
        subject: subject.trim(),
        body: body.trim(),
        sender: mine,
        read: true,
        starred: false,
        ts: new Date().toISOString(),
      },
      ...prev,
    ]);
    setComposing(false);
    notify('Message sent to Super Admin.');
  }

  return (
    <div>
      <div className={styles.toolbar}>
        <h2 className={styles.sectionTitle}>Messages — {config.name}</h2>
        <button type="button" className={styles.viewButton} onClick={openCompose}>Compose</button>
      </div>

      <div
        style={{
          margin: '10px 0 0',
          padding: '8px 12px',
          borderRadius: 8,
          background: '#FEF3C7',
          border: '1px solid #FDE68A',
          color: '#92400E',
          fontSize: 12,
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}
      >
        <i className="fas fa-flask" aria-hidden="true" />
        Demo — backend pending. Messages live in memory only and reset on reload.
      </div>

      <div className={styles.filterRow}>
        {(['all', 'unread', 'starred', 'sent'] as Tab[]).map((t) => (
          <button key={t} type="button" className={`${styles.filterBtn} ${tab === t ? styles.filterBtnActive : ''}`} onClick={() => setTab(t)}>
            {t === 'all' ? `All (${messages.length})` : t === 'unread' ? `Unread (${unread})` : t === 'starred' ? `Important (${starred})` : `Sent (${sent})`}
          </button>
        ))}
        <input placeholder="Search messages..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className={styles.panel}>
        {base.length === 0 ? (
          <p className={styles.empty}>No messages here.</p>
        ) : (
          base.map((m) => (
            <div
              key={m.id}
              onClick={() => openDetail(m)}
              style={{ padding: '14px 20px', borderBottom: '1px solid #F1F5F9', cursor: 'pointer', background: !m.read && m.sender === 'super' ? '#F8FAFC' : 'transparent' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <span style={{ fontWeight: !m.read && m.sender === 'super' ? 600 : 400, fontSize: 13 }}>
                  {m.starred ? '★ ' : ''}{m.from}
                </span>
                <span className={styles.muted}>{new Date(m.ts).toLocaleString()}</span>
              </div>
              <div style={{ fontSize: 14, fontWeight: 500 }}>{m.subject}</div>
              <div className={styles.muted}>{m.body.slice(0, 120)}{m.body.length > 120 ? '…' : ''}</div>
            </div>
          ))
        )}
      </div>

      {selected && (
        <Modal title={selected.subject} onClose={() => setSelected(null)}>
          <p className={styles.muted}>From {selected.from} · {new Date(selected.ts).toLocaleString()}</p>
          <p style={{ fontSize: 14, lineHeight: 1.7 }}>{selected.body}</p>
          <div className={styles.actions}>
            <button type="button" className={styles.ghostButton} onClick={() => toggleStar(selected)}>
              {selected.starred ? 'Unstar' : 'Star'}
            </button>
            <button type="button" className={styles.ghostButton} onClick={() => deleteMessage(selected)}>Delete</button>
          </div>
        </Modal>
      )}

      {composing && (
        <Modal title="Compose — to Super Admin" onClose={() => setComposing(false)}>
          {formError && <p className={styles.formError}>{formError}</p>}
          <form onSubmit={send}>
            <div className={styles.field}>
              <label>Subject</label>
              <input style={fieldStyle} value={subject} onChange={(e) => setSubject(e.target.value)} />
            </div>
            <div className={styles.field}>
              <label>Message</label>
              <textarea style={{ ...fieldStyle, minHeight: 100 }} value={body} onChange={(e) => setBody(e.target.value)} />
            </div>
            <div className={styles.actions}>
              <button type="submit" className={styles.viewButton}>Send</button>
            </div>
          </form>
        </Modal>
      )}
      <TrustBanner />
    </div>
  );
}
