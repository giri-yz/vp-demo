import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useRipple } from '../../components/common/Ripple';
import { useLanguage } from '../../i18n/LanguageContext';
import AccountLayout from './AccountLayout';
import legalStyles from '../marketing/css/Legal.module.css';

type LegalSection = { title: string; body: string };

export default function Terms() {
  const { t, tRaw } = useLanguage();
  const [openIdx, setOpenIdx] = useState<number | null>(0);
  const rippleDark = useRipple('dark');
  const raw = tRaw('terms.sections');
  const sections: LegalSection[] = Array.isArray(raw) ? raw as LegalSection[] : [];

  return (
    <AccountLayout title={t('account.terms')} breadcrumb={t('account.terms')}>
      {/* Banner */}
      <div style={{
        position: 'relative', borderRadius: 18, overflow: 'hidden', marginBottom: 16,
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(135deg, #14472F, #1a5c38, #1f6e42)',
        }} />
        <div style={{
          position: 'absolute', top: -30, right: -30, width: 120, height: 120, borderRadius: '50%',
          background: 'rgba(255,255,255,.07)',
        }} />
        <div style={{
          position: 'relative', zIndex: 1, padding: '28px 20px', textAlign: 'center',
        }}>
          <div style={{
            width: 56, height: 56, borderRadius: '50%', margin: '0 auto 14px',
            background: 'rgba(255,255,255,.15)', border: '2.5px solid rgba(255,255,255,.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 24, color: '#fff', boxShadow: '0 4px 16px rgba(0,0,0,.2)',
          }}>
            <i className="fas fa-file-contract" />
          </div>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: '#fff', margin: '0 0 6px' }}>{t('terms.title')}</h2>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,.7)', margin: 0 }}>
            {t('terms.dpdpLine')}
          </p>
        </div>
      </div>

      {/* Accordion — 16 sections matching live vpnexues.com/terms */}
      <div style={{ background: '#fff', borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,.04)' }}>
        {sections.map((section, i) => {
          const isOpen = openIdx === i;
          return (
            <div key={i} style={{ borderBottom: i < sections.length - 1 ? '1px solid rgba(0,0,0,.05)' : 'none' }}>
              <button
                onClick={e => { rippleDark(e); setOpenIdx(isOpen ? null : i); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12, width: '100%',
                  padding: '16px 18px', border: 'none', background: isOpen ? '#f0fdf4' : 'none',
                  cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit',
                  transition: 'background .2s ease',
                  position: 'relative', overflow: 'hidden',
                }}
              >
                <span style={{
                  width: 32, height: 32, borderRadius: 8, display: 'flex',
                  alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  background: isOpen ? 'linear-gradient(135deg, #14472F, #1a5c38)' : 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
                  color: isOpen ? '#fff' : '#14472F', fontSize: 13, fontWeight: 700,
                  transition: 'all .2s ease',
                }}>
                  {i + 1}
                </span>
                <span style={{ flex: 1, fontSize: 15, fontWeight: 600, color: '#111' }}>{section.title}</span>
                <i className={`fas fa-chevron-${isOpen ? 'up' : 'down'}`} style={{ fontSize: 12, color: '#14472F' }} />
              </button>
              {isOpen && (
                <div style={{
                  padding: '0 18px 18px 62px', fontSize: 14, color: '#222', lineHeight: 1.7,
                }}>
                  <div style={{
                    fontSize: 13, fontWeight: 700, color: '#5b8c51', marginBottom: 10,
                  }}>
                    {t('terms.sectionOf')
                      .replace('{n}', String(i + 1))
                      .replace('{total}', String(sections.length))}
                  </div>
                  <div className={legalStyles.legalSection} dangerouslySetInnerHTML={{ __html: section.body }} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Cross-links */}
      <div style={{
        marginTop: 16, padding: '14px 18px', background: '#f6f9f2', borderRadius: 12,
        border: '1px solid #e5e8e2', fontSize: 14, color: '#333', lineHeight: 1.6,
      }}>
        {t('terms.fullTextNote')}{' '}
        <Link to="/terms" style={{ color: '#1a6b2a', fontWeight: 700 }}>/terms</Link> — {t('terms.seeAlso')}{' '}
        <Link to="/privacy" style={{ color: '#1a6b2a', fontWeight: 700 }}>{t('terms.privacyPolicy')}</Link>.
      </div>
    </AccountLayout>
  );
}
