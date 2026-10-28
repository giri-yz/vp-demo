import { useEffect, useRef } from 'react';
import { APP_MODAL, type AppKind } from '../data';
import s from '../ConceptHome.module.css';

interface Props { app: AppKind | null; onClose: () => void }

export default function QrModal({ app, onClose }: Props) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!app) return;
    const opener = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      opener?.focus?.();
    };
  }, [app, onClose]);

  if (!app) return null;
  const copy = APP_MODAL[app];

  return (
    <div className={s.modal} role="dialog" aria-modal="true" aria-labelledby="conceptModalTitle" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className={s.modalCard}>
        <button ref={closeRef} type="button" className={s.modalClose} aria-label="Close" onClick={onClose}>×</button>
        <div className={s.eyebrow}>App experience</div>
        <h3 id="conceptModalTitle">{copy.title}</h3>
        <p>{copy.text}</p>
        <div className={s.qr}>SCAN &amp; DOWNLOAD<br />QR PLACEHOLDER<br /><span>Public link not added yet</span></div>
        <p className={s.modalNote}>UX/UI concept only. Replace this placeholder with the official store QR code when the app is publicly available.</p>
      </div>
    </div>
  );
}
