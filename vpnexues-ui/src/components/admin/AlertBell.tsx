import { useEffect, useRef, useState, useCallback } from 'react';

export interface AlertItem {
  id: string;
  label: string;
  detail: string;
  count: number;
  time?: string;
  kind?: string;
  onOpen: () => void;
}

interface BellItem extends AlertItem {
  read: boolean;
  body?: string;
  subject?: string;
}

function timeAgo(iso?: string): string {
  if (!iso) return 'just now';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

/**
 * Notification bell with read/dismiss state held in component-local state.
 * Counts stay live (recomputed on every open); only read/dismissed
 * flags persist while mounted. HTTP errors from fetchAlerts still surface as errors.
 */
export default function AlertBell({ fetchAlerts }: { fetchAlerts: () => Promise<AlertItem[]> }) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<BellItem[]>([]);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [msgPopup, setMsgPopup] = useState<{ subject: string; body: string; time?: string } | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  async function refresh() {
    setLoading(true);
    setError('');
    try {
      const fetched = await fetchAlerts();
      setItems(
        fetched
          .filter((i) => !dismissedIds.has(i.id))
          .map((i) => ({ ...i, read: readIds.has(i.id) || i.count === 0 })),
      );
    } catch {
      setError('Could not load alerts.');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  async function toggle() {
    const next = !open;
    setOpen(next);
    if (next) await refresh();
  }

  function openItem(item: BellItem) {
    if (item.kind === 'message' || item.id.startsWith('adminmsg-') || item.id.startsWith('msg-')) {
      openMessagePopup(item);
      return;
    }
    setReadIds((prev) => new Set(prev).add(item.id));
    setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, read: true } : i)));
    setOpen(false);
    item.onOpen();
  }

  function dismissItem(id: string) {
    setDismissedIds((prev) => new Set(prev).add(id));
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  function markAllRead() {
    setReadIds(new Set(items.map((i) => i.id)));
    setItems((prev) => prev.map((i) => ({ ...i, read: true })));
  }

  function clearAll() {
    setItems([]);
  }

  const openMessagePopup = useCallback((item: BellItem) => {
    setReadIds((prev) => new Set(prev).add(item.id));
    setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, read: true } : i)));
    setOpen(false);
    setMsgPopup({ subject: item.subject || item.label.replace('New message: ', ''), body: item.body || item.detail, time: item.time });
  }, []);

  const unread = items.filter((i) => !i.read).length;

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => void toggle()}
        title="Notifications"
        style={{
          position: 'relative',
          background: '#fff',
          border: '1px solid #E5E7EB',
          borderRadius: 12,
          width: 42,
          height: 42,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          color: '#F59E0B',
          fontSize: 18,
          boxShadow: '0 1px 3px rgba(0,0,0,.06)',
        }}
      >
        🔔
        {unread > 0 && (
          <span
            style={{
              position: 'absolute',
              top: -4,
              right: -4,
              background: '#DC2626',
              color: '#fff',
              fontSize: 10,
              fontWeight: 700,
              minWidth: 18,
              height: 18,
              borderRadius: 9,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 4px',
            }}
          >
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>
      {open && (
        <div
          style={{
            position: 'absolute',
            top: 48,
            right: 0,
            width: 320,
            background: '#fff',
            borderRadius: 14,
            boxShadow: '0 8px 32px rgba(0,0,0,.12)',
            border: '1px solid #E5E7EB',
            overflow: 'hidden',
            zIndex: 500,
            animation: 'bellDropdownSlideUp 0.3s cubic-bezier(0.22, 1, 0.36, 1) forwards',
          }}
        >
          <div
            style={{
              padding: '14px 16px',
              borderBottom: '1px solid #E5E7EB',
              fontWeight: 600,
              fontSize: 14,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <span style={{ flex: 1 }}>Notifications{unread > 0 ? ` (${unread} unread)` : ''}</span>
            <button
              type="button"
              onClick={markAllRead}
              style={{ background: 'none', border: 'none', color: '#16A34A', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
            >
              Mark all read
            </button>
            <button
              type="button"
              onClick={clearAll}
              style={{ background: 'none', border: 'none', color: '#64748B', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
            >
              Clear all
            </button>
          </div>
          {loading ? (
            <div style={{ padding: '20px 16px', fontSize: 13, color: '#94A3B8', textAlign: 'center' }}>Loading...</div>
          ) : error ? (
            <div style={{ padding: '20px 16px', fontSize: 13, color: '#DC2626', textAlign: 'center' }}>{error}</div>
          ) : items.length === 0 ? (
            <div style={{ padding: '20px 16px', fontSize: 13, color: '#64748B', textAlign: 'center' }}>All clear — nothing needs attention.</div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  width: '100%',
                  padding: '12px 16px',
                  borderBottom: '1px solid #F1F5F9',
                  background: item.read ? 'transparent' : '#F8FAFC',
                }}
              >
                <button
                  type="button"
                  onClick={() => openItem(item)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    flex: 1,
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                    textAlign: 'left',
                    padding: 0,
                    fontFamily: 'inherit',
                  }}
                >
                  <span
                    style={{
                      minWidth: 32,
                      height: 32,
                      borderRadius: 10,
                      background: item.count > 0 ? '#FEF2F2' : '#F0FDF4',
                      color: item.count > 0 ? '#DC2626' : '#16A34A',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: 14,
                      flexShrink: 0,
                    }}
                  >
                    {item.count}
                  </span>
                  <span style={{ flex: 1 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: item.read ? 400 : 600, fontSize: 13 }}>
                      {!item.read && (
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#DC2626', display: 'inline-block', flexShrink: 0 }} />
                      )}
                      {item.label}
                    </span>
                    <span style={{ display: 'block', fontSize: 12, color: '#64748B' }}>{item.detail}</span>
                    <span style={{ display: 'block', fontSize: 11, color: '#94A3B8', marginTop: 2 }}>
                      {item.kind ? `${item.kind} · ` : ''}{item.time ?? 'just now'}
                    </span>
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => dismissItem(item.id)}
                  title="Dismiss"
                  style={{ background: 'none', border: 'none', color: '#94A3B8', fontSize: 16, cursor: 'pointer', padding: 4, flexShrink: 0 }}
                >
                  ×
                </button>
              </div>
            ))
          )}
        </div>
      )}
      {msgPopup && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 10000,
            background: 'rgba(0,0,0,.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
          onClick={(e) => { if (e.target === e.currentTarget) setMsgPopup(null); }}
        >
          <div style={{
            background: '#fff',
            borderRadius: 14,
            width: 520,
            maxWidth: '94%',
            maxHeight: '80vh',
            overflowY: 'auto',
            boxShadow: '0 20px 60px rgba(0,0,0,.3)',
          }}>
            <div style={{
              background: '#134B2F',
              padding: '20px 24px',
              color: '#fff',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderRadius: '14px 14px 0 0',
            }}>
              <div>
                <div style={{ fontSize: 11, opacity: 0.7, marginBottom: 4 }}>From Super Admin</div>
                <div style={{ fontSize: 16, fontWeight: 700 }}>{msgPopup.subject}</div>
              </div>
              <button
                type="button"
                onClick={() => setMsgPopup(null)}
                style={{ background: 'rgba(255,255,255,.2)', border: 'none', color: '#fff', width: 30, height: 30, borderRadius: 8, cursor: 'pointer', fontSize: 16 }}
              >
                ×
              </button>
            </div>
            <div style={{ padding: '20px 24px' }}>
              <div style={{ fontSize: 12, color: '#64748B', marginBottom: 12 }}>{timeAgo(msgPopup.time)}</div>
              <div style={{ fontSize: 14, lineHeight: 1.7, color: '#1E293B', whiteSpace: 'pre-wrap' }}>{msgPopup.body || ''}</div>
            </div>
            <div style={{ padding: '12px 24px', borderTop: '1px solid #E5E7EB', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setMsgPopup(null)}
                style={{ padding: '8px 20px', borderRadius: 8, border: '1px solid #E5E7EB', background: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 500, color: '#64748B' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
