import { useCallback, useEffect, useState } from 'react';
import Modal from './Modal';
import { useToast } from './Toast';
import {
  generateAccessPass,
  getAccessPassHistory,
  getActiveAccessPass,
  revokeAccessPass,
  type AdminAccessPass,
  type AccessPassStatus,
} from '../../api/adminAccessPassApi';
import { getErrorMessage } from '../../utils/errors';
import styles from './css/AccessPassModal.module.css';

interface Props {
  /** The delegated account this pass unlocks. */
  target: { id: string; name: string };
  onClose: () => void;
  /** Fires after a revoke so the table can refresh its state. */
  onRevoked?: () => void;
}

const STATUS_LABEL: Record<AccessPassStatus, string> = {
  ACTIVE: 'Active',
  USED: 'Used',
  EXPIRED: 'Expired',
  INVALIDATED: 'Revoked',
};

const CHIP_CLASS: Record<AccessPassStatus, string> = {
  ACTIVE: styles.chipActive,
  USED: styles.chipUsed,
  EXPIRED: styles.chipDead,
  INVALIDATED: styles.chipDead,
};

function mmss(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const m = String(Math.floor(total / 60)).padStart(2, '0');
  const s = String(total % 60).padStart(2, '0');
  return `${m}:${s}`;
}

/**
 * Feature B — Super Admin's access-pass panel.
 *
 * Generates the 6-digit pass, shows it exactly once with a live countdown, and keeps the
 * audit trail (who issued, when used, from which IP) underneath. The plaintext code is in
 * React state only — a page refresh re-reads the status endpoint, which never returns it.
 */
export default function AccessPassModal({ target, onClose, onRevoked }: Props) {
  const { notify } = useToast();
  const [pass, setPass] = useState<AdminAccessPass | null>(null);
  const [history, setHistory] = useState<AdminAccessPass[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [now, setNow] = useState(() => Date.now());

  const refreshHistory = useCallback(() => {
    getAccessPassHistory(target.id)
      .then(setHistory)
      .catch(() => setHistory([]));
  }, [target.id]);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    Promise.all([getActiveAccessPass(target.id), getAccessPassHistory(target.id)])
      .then(([active, hist]) => {
        if (!alive) return;
        setPass(active);
        setHistory(hist);
      })
      .catch((err) => {
        if (alive) setError(getErrorMessage(err, 'Could not read the access-pass state.'));
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [target.id]);

  // Live countdown while a pass is still in the wild.
  const ticking = pass?.status === 'ACTIVE';
  useEffect(() => {
    if (!ticking) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [ticking]);

  useEffect(() => {
    if (!copied) return;
    const id = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(id);
  }, [copied]);

  const remaining = pass ? new Date(pass.expiresAt).getTime() - now : 0;
  const expired = !!pass && pass.status === 'ACTIVE' && remaining <= 0;

  async function generate() {
    setBusy(true);
    setError('');
    try {
      const created = await generateAccessPass(target.id);
      setPass(created);
      setNow(Date.now()); // restart the countdown from the server's clock
      refreshHistory();
      notify(`Access pass generated for ${target.name} — share it out-of-band.`);
    } catch (err) {
      setError(getErrorMessage(err, 'Could not generate an access pass.'));
    } finally {
      setBusy(false);
    }
  }

  async function revoke() {
    if (!window.confirm(`Revoke the live access pass for ${target.name}? They will need a new one to sign in.`)) return;
    setBusy(true);
    setError('');
    try {
      await revokeAccessPass(target.id);
      setPass(null);
      refreshHistory();
      onRevoked?.();
      notify('Access pass revoked.');
    } catch (err) {
      setError(getErrorMessage(err, 'Could not revoke the access pass.'));
    } finally {
      setBusy(false);
    }
  }

  async function copyCode() {
    if (!pass?.code) return;
    try {
      await navigator.clipboard.writeText(pass.code);
      setCopied(true);
    } catch {
      setError('Could not copy — select the code and copy it manually.');
    }
  }

  const showCode = !!pass?.code && pass.status === 'ACTIVE' && !expired;
  const liveWithoutCode = !!pass && pass.status === 'ACTIVE' && !pass.code && !expired;

  return (
    <Modal title={`Access Pass · ${target.name}`} onClose={onClose} headerDark>
      {error && <p style={{ color: '#DC2626', fontSize: 13, marginBottom: 12 }}>{error}</p>}

      {loading ? (
        <p style={{ fontSize: 13, color: '#5B6B60' }}>Reading access-pass state…</p>
      ) : (
        <>
          {pass ? (
            <div className={`${styles.passPanel} ${expired || pass.status !== 'ACTIVE' ? styles.expired : ''}`}>
              <div className={styles.panelHead}>
                {showCode
                  ? 'One-time access pass'
                  : `Access pass · ${STATUS_LABEL[expired ? 'EXPIRED' : pass.status]}`}
              </div>

              {showCode ? (
                <div className={styles.code} data-testid="access-pass-code">{pass.code}</div>
              ) : liveWithoutCode ? (
                <div className={styles.codeHidden}>•••••• &nbsp;shown once at generation</div>
              ) : (
                <div className={styles.codeHidden}>{STATUS_LABEL[expired ? 'EXPIRED' : pass.status].toUpperCase()}</div>
              )}

              <div className={styles.meta}>
                <span>
                  {pass.status === 'ACTIVE' ? (
                    <>
                      Valid for <b>{expired ? '00:00 (expired)' : mmss(remaining)}</b> more
                    </>
                  ) : pass.usedAt ? (
                    <>
                      Used <b>{new Date(pass.usedAt).toLocaleString()}</b>
                    </>
                  ) : (
                    <>
                      Issued <b>{pass.generatedAt ? new Date(pass.generatedAt).toLocaleString() : '—'}</b>
                    </>
                  )}
                </span>
                <span>
                  Attempts left: <b>{pass.attemptsRemaining}</b>
                </span>
              </div>

              {pass.usedIp && (
                <div className={styles.meta} style={{ marginTop: 6 }}>
                  <span>
                    Used from <b>{pass.usedIp}</b>
                  </span>
                  <span>
                    Issued by <b>{pass.generatedByName ?? '—'}</b>
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className={styles.passPanel}>
              <div className={styles.panelHead}>No live access pass</div>
              <div className={styles.codeHidden}>——————</div>
              <div className={styles.meta}>
                <span>Generate one for this Sub-Admin's next sign-in.</span>
                <span>
                  TTL: <b>10 min</b>
                </span>
              </div>
            </div>
          )}

          <p className={styles.note}>
            {showCode ? (
              <>
                <b>Shown once.</b> Send it to {target.name} yourself (call / WhatsApp / in person) — it will not be
                shown again, it expires in 10 minutes, and the next login needs a fresh one.
              </>
            ) : liveWithoutCode ? (
              <>
                This pass is live, but the code was only shown when it was generated. Generate a new pass if they need
                the code — re-issuing kills this one.
              </>
            ) : (
              <>A pass is single-use: it dies on the first successful sign-in, after 3 wrong codes, or when you revoke it.</>
            )}
          </p>

          <div className={styles.actions}>
            {showCode && (
              <button type="button" className={`${styles.btn} ${styles.btnGhost}`} onClick={copyCode}>
                <i className={copied ? 'fas fa-check' : 'fas fa-copy'} /> {copied ? 'Copied' : 'Copy code'}
              </button>
            )}
            {pass?.status === 'ACTIVE' && (
              <button type="button" className={`${styles.btn} ${styles.btnDanger}`} onClick={revoke} disabled={busy}>
                <i className="fas fa-ban" /> Revoke
              </button>
            )}
            <button type="button" className={`${styles.btn} ${styles.btnPrimary}`} onClick={generate} disabled={busy}>
              <i className="fas fa-key" /> {busy ? 'Working…' : pass ? 'Generate new pass' : 'Generate access pass'}
            </button>
          </div>

          <div className={styles.history}>
            <div className={styles.historyHead}>
              <span className={styles.dot} /> Audit trail
            </div>
            {history.length === 0 ? (
              <div className={styles.empty}>No passes have been issued for this account yet.</div>
            ) : (
              history.map((h) => (
                <div key={h.id} className={styles.historyRow}>
                  <div>
                    <div className={styles.historyWho}>{h.generatedByName ?? 'Super Admin'}</div>
                    <div className={styles.historyWhen}>
                      Issued {h.generatedAt ? new Date(h.generatedAt).toLocaleString() : '—'}
                      {h.usedAt && ` · used ${new Date(h.usedAt).toLocaleString()}`}
                    </div>
                  </div>
                  <span className={`${styles.statusChip} ${CHIP_CLASS[h.status]}`}>{STATUS_LABEL[h.status]}</span>
                  <span className={styles.historyIp}>{h.usedIp ?? '—'}</span>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </Modal>
  );
}
