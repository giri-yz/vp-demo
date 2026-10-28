import { useEffect, useMemo, useRef, useState } from 'react';
import { removeSession, replyToSession, updateSessionStatus } from '../../api/adminSupportChatsApi';
import { fetchChatSessions, getCachedChatSessions } from '../../api/supportChatSessionsCache';
import type { ChatSessionDto } from '../../api/supportChatApi';
import { useToast } from './Toast';
import { getErrorMessage } from '../../utils/errors';

const STATUS_TABS = ['', 'OPEN', 'IN_PROGRESS', 'CLOSED'] as const;

const STATUS_STYLES: Record<string, { bg: string; color: string }> = {
  OPEN: { bg: '#DCFCE7', color: '#16A34A' },
  IN_PROGRESS: { bg: '#FEF3C7', color: '#D97706' },
  CLOSED: { bg: '#F1F5F9', color: '#64748B' },
};

function formatTime(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleString();
}

/**
 * Shared live-chat transcript inbox. Rendered inside both the super-admin
 * Support view (all countries) and the sub-admin Support view (filtered by
 * the sub-admin's country — same rule as contact messages: blank
 * countryCode is visible everywhere).
 */
export default function ChatTranscripts({ countryCode }: { countryCode?: string }) {
  const [sessions, setSessions] = useState<ChatSessionDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [status, setStatus] = useState<string>('');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<ChatSessionDto | null>(null);
  const [replyText, setReplyText] = useState('');
  const [saving, setSaving] = useState(false);
  const { notify } = useToast();
  const loadSeqRef = useRef(0);

  /**
   * `background` keeps the list already on screen (a cached view) and only
   * refreshes it — used when the mount effect has rows to paint immediately.
   * `fresh` bypasses in-flight request sharing and must be used after a
   * mutation, so a reply/status change never reads a pre-mutation response.
   */
  function load(background = false, fresh = false) {
    const seq = ++loadSeqRef.current;
    if (!background) setLoading(true);
    fetchChatSessions(status || undefined, { fresh })
      .then((rows) => {
        if (seq !== loadSeqRef.current) return;
        setSessions(rows);
        setError('');
      })
      .catch((err: unknown) => {
        if (seq === loadSeqRef.current) setError(getErrorMessage(err, 'Could not load live-chat sessions.'));
      })
      .finally(() => {
        if (seq === loadSeqRef.current) setLoading(false);
      });
  }

  /** Full reload after a mutation (or an explicit retry) — always a fresh request. */
  function reload() {
    load(false, true);
  }

  useEffect(() => {
    const cached = getCachedChatSessions(status || undefined);
    if (cached) {
      // Paint from cache immediately; revalidate in the background unless the
      // hit is already current (the Support page warms this cache on mount).
      setSessions(cached.rows);
      setError('');
      setLoading(false);
      if (cached.fresh) {
        loadSeqRef.current += 1; // supersede any load still running for the previous status
        return;
      }
      load(true);
      return;
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const visible = useMemo(() => {
    let items = countryCode
      ? sessions.filter((s) => !s.countryCode || s.countryCode === countryCode)
      : sessions;
    const q = search.toLowerCase().trim();
    if (q) {
      items = items.filter((s) =>
        `${s.visitorName} ${s.visitorEmail} ${s.subject} ${s.id}`.toLowerCase().includes(q),
      );
    }
    return items;
  }, [sessions, search, countryCode]);

  function openDetail(s: ChatSessionDto) {
    setSelected(s);
    setReplyText('');
    if (s.status === 'OPEN') {
      updateSessionStatus(s.id, 'IN_PROGRESS')
        .then((updated) => {
          setSelected(updated);
          reload();
        })
        .catch(() => {});
    }
  }

  async function sendReply() {
    if (!selected || !replyText.trim() || replyText.trim().length > 2000) return;
    setSaving(true);
    try {
      await replyToSession(selected.id, replyText.trim());
      setReplyText('');
      const fresh = await fetchChatSessions(status || undefined, { fresh: true });
      loadSeqRef.current += 1; // supersede any list refresh still in flight
      setSessions(fresh);
      const reselected = fresh.find((s) => s.id === selected.id) ?? null;
      setSelected(reselected);
      notify('Reply sent — the visitor sees it when they reopen the chat.');
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Could not send reply.'));
    } finally {
      setSaving(false);
    }
  }

  async function closeSession() {
    if (!selected) return;
    setSaving(true);
    try {
      const updated = await updateSessionStatus(selected.id, 'CLOSED');
      setSelected(updated);
      reload();
      notify('Chat closed.');
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Could not close chat.'));
    } finally {
      setSaving(false);
    }
  }

  async function deleteSession() {
    if (!selected) return;
    if (!window.confirm(`Delete chat session with ${selected.visitorName}?`)) return;
    setSaving(true);
    try {
      await removeSession(selected.id);
      setSelected(null);
      reload();
      notify('Chat deleted.');
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Could not delete chat.'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        {STATUS_TABS.map((tab) => (
          <button
            key={tab || 'all'}
            type="button"
            onClick={() => setStatus(tab)}
            style={{
              padding: '8px 18px', borderRadius: 20, border: 'none',
              background: status === tab ? '#2E7D32' : '#fff',
              color: status === tab ? '#fff' : '#64748B',
              fontWeight: 600, fontSize: 13, cursor: 'pointer',
              boxShadow: status === tab ? '0 2px 8px rgba(46,125,50,0.25)' : '0 1px 3px rgba(0,0,0,0.08)',
            }}
          >
            {tab === '' ? 'All' : tab.replace('_', ' ')}
          </button>
        ))}
        <div style={{ marginLeft: 'auto', position: 'relative' }}>
          <i className="fas fa-search" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', fontSize: 13 }} />
          <input
            placeholder="Search by visitor, email, subject..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ padding: '9px 14px 9px 36px', borderRadius: 10, border: '1px solid #E2E8F0', fontSize: 13, width: 300, outline: 'none' }}
          />
        </div>
      </div>

      {error && (
        <div style={{ marginBottom: 16, padding: '10px 14px', borderRadius: 10, background: '#FEF2F2', color: '#B91C1C', fontSize: 13 }}>
          {error}{' '}
          <button type="button" onClick={() => reload()} style={{ marginLeft: 8, textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontWeight: 700 }}>
            Retry
          </button>
        </div>
      )}

      {loading ? (
        <p style={{ color: '#64748B', fontSize: 13 }}>Loading live chats...</p>
      ) : visible.length === 0 ? (
        <p style={{ color: '#64748B', fontSize: 13 }}>No live-chat sessions yet. Chats appear here when a visitor clicks “Talk to Agent”.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {visible.map((s) => {
            const st = STATUS_STYLES[s.status] ?? STATUS_STYLES.OPEN;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => openDetail(s)}
                style={{ display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left', background: '#fff', border: '1px solid #E2E8F0', borderRadius: 12, padding: '12px 16px', cursor: 'pointer', fontFamily: 'inherit' }}
              >
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#E8F5E9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <i className="fas fa-comment-dots" style={{ color: '#2E7D32' }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 13, color: '#1E293B' }}>{s.subject}</div>
                  <div style={{ fontSize: 12, color: '#64748B' }}>
                    {s.visitorName} · {s.visitorEmail || 'Guest (no email yet)'}{s.countryCode ? ` · ${s.countryCode}` : ''} · {s.messages.length} msgs · {formatTime(s.createdAt)}
                  </div>
                </div>
                <span style={{ padding: '4px 12px', borderRadius: 12, fontSize: 11, fontWeight: 700, background: st.bg, color: st.color, flexShrink: 0 }}>
                  {s.status.replace('_', ' ')}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {selected && (
        <div
          role="dialog"
          aria-label="Chat transcript"
          onClick={() => { if (!saving) setSelected(null); }}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ background: '#fff', borderRadius: 16, maxWidth: 560, width: '100%', maxHeight: '85vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
          >
            <div style={{ padding: '14px 18px', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 800, fontSize: 14, color: '#1E293B' }}>{selected.subject}</div>
                <div style={{ fontSize: 12, color: '#64748B' }}>{selected.visitorName} · {selected.visitorEmail || 'Guest (no email yet)'}</div>
              </div>
              <button type="button" onClick={() => setSelected(null)} aria-label="Close" style={{ border: 'none', background: '#F1F5F9', borderRadius: 8, width: 32, height: 32, cursor: 'pointer' }}>
                <i className="fas fa-times" style={{ color: '#64748B' }} />
              </button>
            </div>
            <div style={{ padding: 16, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8, background: '#F8FAFC' }}>
              {selected.messages.length === 0 && (
                <p style={{ fontSize: 12, color: '#94A3B8' }}>No messages yet.</p>
              )}
              {selected.messages.map((m) => {
                const mine = m.sender === 'ADMIN';
                const bot = m.sender === 'BOT';
                return (
                  <div key={m.id} style={{ alignSelf: mine ? 'flex-end' : 'flex-start', maxWidth: '85%' }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: '#94A3B8', marginBottom: 2 }}>
                      {mine ? 'You (admin)' : bot ? 'Bot' : selected.visitorName} · {formatTime(m.createdAt)}
                    </div>
                    <div style={{
                      background: mine ? '#2E7D32' : bot ? '#E8F5E9' : '#fff',
                      color: mine ? '#fff' : '#1E293B',
                      border: mine ? 'none' : '1px solid #E2E8F0',
                      borderRadius: 12, padding: '8px 12px', fontSize: 13, lineHeight: 1.5,
                      whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                    }}>
                      {m.body}
                    </div>
                  </div>
                );
              })}
            </div>
            {selected.status !== 'CLOSED' ? (
              <div style={{ padding: 14, borderTop: '1px solid #E2E8F0', display: 'flex', gap: 8 }}>
                <input
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') void sendReply(); }}
                  placeholder="Reply as support agent..."
                  maxLength={2000}
                  style={{ flex: 1, border: '1px solid #E2E8F0', borderRadius: 10, padding: '10px 12px', fontSize: 13, outline: 'none', fontFamily: 'inherit' }}
                />
                <button
                  type="button"
                  onClick={() => void sendReply()}
                  disabled={saving || !replyText.trim()}
                  style={{ background: '#2E7D32', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 18px', fontWeight: 700, fontSize: 13, cursor: saving ? 'wait' : 'pointer', opacity: saving || !replyText.trim() ? 0.6 : 1 }}
                >
                  {saving ? '...' : 'Send'}
                </button>
                <button
                  type="button"
                  onClick={() => void closeSession()}
                  disabled={saving}
                  style={{ background: '#F1F5F9', color: '#475569', border: 'none', borderRadius: 10, padding: '10px 14px', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}
                >
                  Close
                </button>
              </div>
            ) : (
              <div style={{ padding: 14, borderTop: '1px solid #E2E8F0', display: 'flex', gap: 8, alignItems: 'center' }}>
                <span style={{ fontSize: 12, color: '#64748B', flex: 1 }}>This chat is closed.</span>
                <button
                  type="button"
                  onClick={() => void deleteSession()}
                  disabled={saving}
                  style={{ background: '#FEF2F2', color: '#B91C1C', border: 'none', borderRadius: 10, padding: '10px 14px', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
