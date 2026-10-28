import { useState, useEffect } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import AccountLayout from './AccountLayout';

const SETTINGS = [
  { key: 'np_order_updates', labelKey: 'account.orderUpdates', descKey: 'account.orderUpdatesDesc', icon: 'fas fa-shopping-bag', color: '#16a34a' },
  { key: 'np_delivery_updates', labelKey: 'account.deliveryUpdates', descKey: 'account.deliveryUpdatesDesc', icon: 'fas fa-truck', color: '#2563eb' },
  { key: 'np_order_reminders', labelKey: 'account.orderReminders', descKey: 'account.orderRemindersDesc', icon: 'fas fa-bell', color: '#d97706' },
];

export default function Notifications() {
  const { t } = useLanguage();
  const [prefs, setPrefs] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const initial: Record<string, boolean> = {};
    SETTINGS.forEach(s => { initial[s.key] = localStorage.getItem(s.key) === 'true'; });
    setPrefs(initial);
  }, []);

  function toggle(key: string) {
    setPrefs(prev => {
      const next = { ...prev, [key]: !prev[key] };
      localStorage.setItem(key, String(next[key]));
      return next;
    });
  }

  return (
    <AccountLayout title={t('account.notifications')} breadcrumb={t('account.notifications')}>
      <div style={{ background: '#fff', borderRadius: 14, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,.03)' }}>
        {SETTINGS.map((s, i) => (
          <div key={s.key} onClick={() => toggle(s.key)} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 18px', borderBottom: i < SETTINGS.length - 1 ? '1px solid rgba(0,0,0,.05)' : 'none', position: 'relative', overflow: 'hidden', cursor: 'pointer', borderRadius: 0, transition: 'background .15s ease' }} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') toggle(s.key); }}>
            <span style={{ width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 12, background: `${s.color}15`, color: s.color, fontSize: 17, flexShrink: 0 }}>
              <i className={s.icon} />
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 15, fontWeight: 600, color: '#111827', margin: '0 0 2px' }}>{t(s.labelKey)}</p>
              <p style={{ fontSize: 12, color: '#111', margin: 0 }}>{t(s.descKey)}</p>
            </div>
            <button
              onClick={e => { e.stopPropagation(); toggle(s.key); }}
              style={{
                width: 48, height: 28, borderRadius: 14, border: 'none', cursor: 'pointer',
                background: prefs[s.key] ? 'linear-gradient(135deg, #16a34a, #059669)' : '#e5e7eb',
                position: 'relative', transition: 'background .2s ease', flexShrink: 0,
              }}
            >
              <span style={{
                position: 'absolute', top: 3, left: prefs[s.key] ? 23 : 3,
                width: 22, height: 22, borderRadius: '50%', background: '#fff',
                boxShadow: '0 1px 4px rgba(0,0,0,.15)', transition: 'left .2s ease',
              }} />
            </button>
          </div>
        ))}
      </div>
    </AccountLayout>
  );
}

