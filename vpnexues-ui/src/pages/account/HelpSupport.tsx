import { useState } from 'react';
import { Link } from 'react-router-dom';
import ChatPanel from '../../components/common/ChatPanel';
import { useRipple } from '../../components/common/Ripple';
import { useLanguage } from '../../i18n/LanguageContext';
import AccountLayout from './AccountLayout';
import s from './css/HelpSupport.module.css';

export default function HelpSupport() {
  const { t } = useLanguage();
  const [chatOpen, setChatOpen] = useState(false);
  const rippleLight = useRipple('light');
  const rippleDark = useRipple('dark');

  return (
    <AccountLayout
      title={t('account.helpSupport')}
      breadcrumb={t('account.helpSupport')}
    >
      <div className={s.page}>
        {/* Contact Us */}
        <section className={s.section}>
          <h2 className={s.sectionTitle}>{t('contact.contactUs')}</h2>

          <div className={s.card}>
            <a
              href="tel:+917810077636"
              onClick={rippleDark}
              className={s.row}
            >
              <span className={`${s.iconWrap} ${s.iconGreen}`}>
                <i className="fas fa-phone" />
              </span>

              <div className={s.rowCol}>
                <p className={s.rowTitle}>{t('contact.callUs')}</p>
                <p className={s.rowText}>
                  +91 78100 77636 | +91 8148197842 | +65 8851 0445
                </p>
              </div>
            </a>

            <a
              href="mailto:support@vpnexues.com"
              onClick={rippleDark}
              className={s.row}
            >
              <span className={`${s.iconWrap} ${s.iconBlue}`}>
                <i className="fas fa-envelope" />
              </span>

              <div className={s.rowCol}>
                <p className={s.rowTitle}>{t('contact.emailUs')}</p>
                <p className={s.rowText}>support@vpnexues.com</p>
              </div>
            </a>

            <a
              href="https://wa.me/917810077636"
              target="_blank"
              rel="noopener noreferrer"
              onClick={rippleDark}
              className={s.row}
            >
              <span className={`${s.iconWrap} ${s.iconGreen}`}>
                <i className="fab fa-whatsapp" />
              </span>

              <div className={s.rowCol}>
                <p className={s.rowTitle}>{t('contact.whatsapp')}</p>
                <p className={s.rowText}>
                  {t('contact.chatWithUs')}
                </p>
              </div>
            </a>
          </div>
        </section>

        {/* Office Locations */}
        <section className={s.section}>
          <h2 className={s.sectionTitle}>
            {t('helpSupport.ourOffices')}
          </h2>

          <div className={s.card}>
            {/* Singapore Office */}
            <div className={s.row}>
              <span className={`${s.iconWrap} ${s.iconAmber}`}>
                <i className="fas fa-map-marker-alt" />
              </span>

              <div className={s.rowCol}>
                <p className={s.rowTitle}>
                  {t('helpSupport.singaporeOffice')}
                </p>
                <p className={s.rowText}>
                  412 Race Course Road, Singapore 218660
                </p>
              </div>
            </div>

            {/* India Office */}
            <div className={s.row}>
              <span className={`${s.iconWrap} ${s.iconRed}`}>
                <i className="fas fa-map-marker-alt" />
              </span>

              <div className={s.rowCol}>
                <p className={s.rowTitle}>
                  {t('helpSupport.indiaOffice')}
                </p>

                <p className={s.rowTitle}>Salem</p>
                <p className={s.rowText}>
                  No 312/11, Siva Towers, Perumal Malai Road,
                  Narasothipatti, Salem, Tamil Nadu 636004
                </p>

                <p className={s.rowTitle}>Tirupattur</p>
                <p className={s.rowText}>
                  No. 8, Don Bosco Nagar, 3rd Floor, Aether E-Bike
                  Showroom Building, Opposite to DBX School,
                  Tirupattur - 635601, Tamil Nadu, India
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Actions */}
        <div className={s.actions}>
          <button
            type="button"
            className={s.btnPrimary}
            onClick={(e) => {
              rippleLight(e);
              setChatOpen(true);
            }}
          >
            <i className="fas fa-comments" /> Live Chat
          </button>

          <Link
            to="/faq"
            className={s.btnGhost}
            onClick={(e) => {
              rippleDark(e);
            }}
          >
            <i className="fas fa-question-circle" /> FAQ
          </Link>
        </div>
      </div>

      <ChatPanel
        open={chatOpen}
        onClose={() => setChatOpen(false)}
      />
    </AccountLayout>
  );
}