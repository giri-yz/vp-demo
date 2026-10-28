import { useEffect, useState } from 'react';
import ChatPanel from './ChatPanel';
import { useLanguage } from '../../i18n/LanguageContext';
import s from './css/FloatingChat.module.css';

interface Props {
  /** true when the mobile bottom nav is visible — lifts the button above it */
  raised?: boolean;
  /** hide the launcher/panel entirely on mobile (≤767px) — used on cart & checkout */
  hideOnMobile?: boolean;
}

export default function FloatingChat({ raised = false, hideOnMobile = false }: Props) {
  const [open, setOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(() => window.matchMedia('(max-width: 767px)').matches);
  const { t } = useLanguage();

  // Track the mobile breakpoint so cart/checkout can drop the chat on small screens only
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const onChange = () => setIsMobile(mq.matches);
    onChange();
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  // Pages can open the site-wide chat (e.g. Contact "Live Chat" card)
  useEffect(() => {
    const handleOpen = () => setOpen(true);
    window.addEventListener('vpnexues:open-chat', handleOpen);
    return () => window.removeEventListener('vpnexues:open-chat', handleOpen);
  }, []);

  if (hideOnMobile && isMobile) return null;

  return (
    <>
      <div className={`${s.launcherWrap} ${raised ? s.raised : ''} ${open ? s.launcherHidden : ''}`}>
        <div className={s.launcherFloat}>
          <button
            type="button"
            className={s.launcher}
            onClick={() => setOpen(true)}
            aria-label={t('chat.title')}
            title={t('chat.title')}
          >
            <span className={s.chatIcon} aria-hidden="true">
              <svg className={s.iconBubble} viewBox="0 0 36 36" width="28" height="28">
                <ellipse cx="18" cy="12" rx="15" ry="12" fill="#fff" />
                <path d="M7 18 C5 25 3 30 1 33 C8 31 12 27 15 22 Z" fill="#fff" />
                <circle cx="11" cy="12" r="2.5" fill="#0a8a3c" />
                <circle cx="18" cy="12" r="2.5" fill="#0a8a3c" />
                <circle cx="25" cy="12" r="2.5" fill="#0a8a3c" />
              </svg>
            </span>
          </button>
          <span className={s.onlineDot} aria-hidden="true" />
        </div>
      </div>
      <ChatPanel open={open} onClose={() => setOpen(false)} />
    </>
  );
}
