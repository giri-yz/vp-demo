import { useEffect, useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useAddress } from '../../context/AddressContext';
import * as ordersApi from '../../api/ordersApi';
import type { Order } from '../../types';
import { useCountry } from '../../context/CountryContext';
import { formatPrice } from '../../utils/currency';
import { useRipple } from '../../components/common/Ripple';
import CountryChangePrompt from '../../components/common/CountryChangePrompt';
import { useLanguage } from '../../i18n/LanguageContext';
import AccountSidebar from './AccountSidebar';
import AccountMobileMenu from './AccountMobileMenu';
import s from './css/Account.module.css';

const PHONE_CODE: Record<string, string> = { IN: '+91', SG: '+65', US: '+1', AE: '+971' };
function formatPhone(phone: string, country: string) {
  const p = phone.trim();
  return p.startsWith('+') ? p : `${PHONE_CODE[country] || '+91'} ${p}`;
}

function formatDate(d: string) {
  try { return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }); }
  catch { return d; }
}

interface ActivityItem {
  key: string;
  icon: string;
  tint: string;
  title: string;
  sub: string;
  subGreen?: boolean;
  date: string;
  to: string;
}

export default function Account() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { country } = useCountry();
  const { addresses } = useAddress();
  const prevCountryRef = useRef(country);
  const [countryPromptOpen, setCountryPromptOpen] = useState(false);
  const [promptCountry, setPromptCountry] = useState(country);

  useEffect(() => {
    if (prevCountryRef.current !== country) {
      setPromptCountry(country);
      setCountryPromptOpen(true);
      prevCountryRef.current = country;
    }
  }, [country]);
  const [showAllActions, setShowAllActions] = useState(false);

  const rippleDark = useRipple('dark');

  const QUICK_PRIMARY = [
    { to: '/account/orders', icon: 'fas fa-cube', tint: 'tileGreen', title: t('account.orders'), sub: t('account.viewYourOrders') },
    { to: '/account/payment-history', icon: 'fas fa-credit-card', tint: 'tileBlue', title: t('account.payments'), sub: t('account.paymentHistory') },
    { to: '/account/order-tracking', icon: 'fas fa-truck', tint: 'tileAmber', title: t('account.orderTracking'), sub: t('account.trackOrdersRealTime') },
    { to: '/account/addresses', icon: 'fas fa-map-marker-alt', tint: 'tilePink', title: t('account.addresses'), sub: t('account.manageYourAddresses') },
  ];
  const QUICK_EXTRA = [
    { to: '/account/personal-info', icon: 'fas fa-user', tint: 'tilePurple', title: t('account.personalInformation'), sub: t('account.managePersonalDetails') },
    { to: '/account/help-support', icon: 'fas fa-headset', tint: 'tileTeal', title: t('account.helpSupport'), sub: t('account.getHelpContact') },
    { to: '/account/notifications', icon: 'fas fa-bell', tint: 'tileOrange', title: t('account.notifications'), sub: t('account.manageNotificationSettings') },
    { to: '/account/terms', icon: 'fas fa-file-alt', tint: 'tileGray', title: t('account.terms'), sub: t('account.readTerms') },
  ];

  const [localNameAcc] = useState<string | null>(null);
  const [localPhoneAcc] = useState<string | null>(null);
  const displayNameAcc = user?.name || localNameAcc || t('account.guestUser');
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (!user) {
      setOrders([]);
      return;
    }
    let cancelled = false;
    ordersApi
      .listOrders()
      .then((list) => { if (!cancelled) setOrders(list); })
      .catch(() => { if (!cancelled) setOrders([]); });
    return () => { cancelled = true; };
  }, [user]);

  const phoneDisplay = user?.phone ? formatPhone(user.phone, country) : (localPhoneAcc ? formatPhone(localPhoneAcc, country) : '');

  const sortedOrders = [...orders].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  const latestOrder = sortedOrders[0];
  const paidOrder = sortedOrders.find(o => o.status !== 'CANCELLED');
  const earliestOrder = sortedOrders[sortedOrders.length - 1];
  const defaultAddress = addresses.find(a => a.isDefault) ?? addresses[0];

  const statusLabel = (status?: string) => {
    switch (status) {
      case 'PLACED': return t('account.statusPlaced');
      case 'CONFIRMED': return t('account.statusConfirmed');
      case 'PROCESSING': return t('account.statusProcessing');
      case 'SHIPPED': return t('account.statusShipped');
      case 'DELIVERED': return t('account.statusDelivered');
      case 'CANCELLED': return t('account.statusCancelled');
      default: return t('account.statusPlaced');
    }
  };

  const activity: ActivityItem[] = [];
  if (latestOrder) {
    activity.push({
      key: `order-${latestOrder.id}`,
      icon: 'fas fa-check-circle',
      tint: 'tileGreen',
      title: `Order #${latestOrder.orderNumber}`,
      sub: statusLabel(latestOrder.status),
      subGreen: latestOrder.status === 'DELIVERED',
      date: formatDate(latestOrder.createdAt),
      to: `/account/orders/${latestOrder.id}`,
    });
  }
  if (paidOrder) {
    activity.push({
      key: `pay-${paidOrder.id}`,
      icon: 'fas fa-rupee-sign',
      tint: 'tileBlue',
      title: t('account.paymentReceived'),
      sub: formatPrice(paidOrder.grandTotal, country),
      date: formatDate(paidOrder.createdAt),
      to: '/account/payment-history',
    });
  }
  if (defaultAddress) {
    activity.push({
      key: `addr-${defaultAddress.id}`,
      icon: 'fas fa-map-marker-alt',
      tint: 'tilePink',
      title: t('account.addressUpdated'),
      sub: defaultAddress.label,
      date: '',
      to: '/account/addresses',
    });
  }
  if (earliestOrder) {
    activity.push({
      key: 'created',
      icon: 'fas fa-user',
      tint: 'tilePurple',
      title: t('account.accountCreated'),
      sub: t('account.welcomeToVpnexues'),
      date: formatDate(earliestOrder.createdAt),
      to: '/account/personal-info',
    });
  }

  const memberSince = earliestOrder ? formatDate(earliestOrder.createdAt) : t('account.notSet');

  const go = (to: string) => (e: React.MouseEvent<HTMLElement>) => { rippleDark(e); setTimeout(() => navigate(to), 120); };

  return (
    <div className={s.page}>
      <div className={s.shell}>
        {/* Header */}
        <header className={s.header}>
          <button className={s.backBtn} onClick={e => { rippleDark(e); setTimeout(() => navigate(-1), 120); }} aria-label={t('account.goBack')}>
            <i className="fas fa-chevron-left" />
          </button>
          <Link to="/" className={s.brand}>
            <img src="https://res.cloudinary.com/eqjshlur/image/upload/v1790001831/vpnexues/old/site-assets/logo/vp-logo.svg" alt="" className={s.brandLogo} />
            <span className={s.brandText}>
              <strong>VPNexues</strong>
              <small>விவசாயம் காப்போம்</small>
            </span>
          </Link>
          <div className={s.headerSpacer} />
        </header>

        {/* Two-Column Dashboard Layout */}
        <AccountMobileMenu until1024 />
        <div className={s.twoCol}>
          <AccountSidebar />

          {/* ─── Main Content ─── */}
          <div className={s.main}>
            {/* Welcome hero */}
            <section className={s.hero}>
              <div className={s.heroBody}>
                <p className={s.heroEyebrow}>{t('account.welcomeBack')}</p>
                <h1 className={s.heroTitle}>{displayNameAcc} <i className={`fas fa-leaf ${s.heroLeaf}`} /></h1>
                <p className={s.heroDesc}>{t('account.welcomeDesc')}</p>
                <div className={s.heroTags}>
                  <span className={s.heroTag}><i className="fas fa-shield-alt" /> {t('account.freshProducts')}</span>
                  <span className={s.heroTag}><i className="fas fa-shield-alt" /> {t('account.trustedFarmers')}</span>
                  <span className={s.heroTag}><i className="fas fa-shield-alt" /> {t('account.secureEasy')}</span>
                </div>
              </div>
              <div className={s.heroScript} aria-hidden="true">
                <span>{t('account.supportFarmersLine1')}</span>
                <span>{t('account.supportFarmersLine2')}</span>
                <span>{t('account.supportFarmersLine3')}</span>
                <svg viewBox="0 0 120 12" className={s.heroSquiggle} aria-hidden="true">
                  <path d="M4 8 C 30 2, 60 2, 116 7" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                </svg>
              </div>
            </section>

            {/* Quick Actions */}
            <section className={s.block}>
              <div className={s.blockHead}>
                <h2 className={s.blockTitle}>{t('account.quickActions')}</h2>
                <button className={s.viewAll} onClick={e => { rippleDark(e); setShowAllActions(v => !v); }}>
                  {showAllActions ? t('account.showLess') : t('account.viewAll')} <i className={`fas ${showAllActions ? 'fa-chevron-up' : 'fa-arrow-right'}`} />
                </button>
              </div>
              <div className={s.quickGrid}>
                {(showAllActions ? [...QUICK_PRIMARY, ...QUICK_EXTRA] : QUICK_PRIMARY).map(card => (
                  <button key={card.to} className={s.quickCard} onClick={go(card.to)}>
                    <span className={`${s.tile} ${s[card.tint]}`}><i className={card.icon} /></span>
                    <span className={s.quickText}>
                      <strong>{card.title}</strong>
                      <span>{card.sub}</span>
                    </span>
                    <span className={`${s.chev} ${s[card.tint]}`}><i className="fas fa-chevron-right" /></span>
                  </button>
                ))}
              </div>
            </section>

            {/* Overview + Activity */}
            <div className={s.duo}>
              <section className={`${s.card} ${s.overview}`}>
                <div className={s.cardHead}>
                  <span className={`${s.tile} ${s.tileGreenSm}`}><i className="fas fa-user" /></span>
                  <span className={s.cardHeadText}>
                    <strong>{t('account.accountOverview')}</strong>
                    <span>{t('account.accountAtGlance')}</span>
                  </span>
                  <button className={s.editBtn} onClick={go('/account/personal-info')}>
                    <i className="fas fa-pencil-alt" /> {t('account.edit')}
                  </button>
                </div>
                <div className={s.ovBody}>
                  <div className={s.ovRows}>
                    {[
                      { icon: 'fas fa-user', label: t('account.name'), value: displayNameAcc },
                      { icon: 'fas fa-envelope', label: t('account.email'), value: user?.email ?? t('account.notSet') },
                      { icon: 'fas fa-phone', label: t('account.phone'), value: phoneDisplay || t('account.notSet') },
                      { icon: 'fas fa-calendar-alt', label: t('account.memberSince'), value: memberSince },
                    ].map(row => (
                      <div key={row.label} className={s.ovRow}>
                        <i className={`${row.icon} ${s.ovIcon}`} />
                        <span className={s.ovLabel}>{row.label}</span>
                        <span className={s.ovColon}>:</span>
                        <span className={s.ovValue}>{row.value}</span>
                      </div>
                    ))}
                  </div>
                  <div className={s.safeBox}>
                    <span className={s.safeShield}><i className="fas fa-shield-alt" /></span>
                    <span>{t('account.safeSecure')}</span>
                  </div>
                </div>
              </section>

              <section className={`${s.card} ${s.activity}`}>
                <div className={s.cardHead}>
                  <span className={`${s.tile} ${s.tileGreenSm}`}><i className="fas fa-clock" /></span>
                  <span className={s.cardHeadText}>
                    <strong>{t('account.recentActivity')}</strong>
                    <span>{t('account.latestActivity')}</span>
                  </span>
                  <button className={s.viewAll} onClick={go('/account/orders')}>
                    {t('account.viewAll')} <i className="fas fa-arrow-right" />
                  </button>
                </div>
                {activity.length > 0 ? (
                  <div className={s.actList}>
                    {activity.map(item => (
                      <button key={item.key} className={s.actRow} onClick={go(item.to)}>
                        <span className={`${s.tile} ${s[item.tint]}`}><i className={item.icon} /></span>
                        <span className={s.actText}>
                          <strong>{item.title}</strong>
                          <span className={item.subGreen ? s.actSubGreen : undefined}>{item.sub}</span>
                        </span>
                        {item.date && <span className={s.actDate}>{item.date}</span>}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className={s.actEmpty}>
                    <p>{t('account.noRecentActivity')}</p>
                    <button className={s.shopBtn} onClick={go('/shop')}>{t('account.startShopping')}</button>
                  </div>
                )}
              </section>
            </div>

            {/* Need Help */}
            <section className={s.help}>
              <span className={s.helpIcon}><i className="fas fa-headset" /></span>
              <span className={s.helpText}>
                <strong>{t('account.needHelp')}</strong>
                <span>{t('account.support247')}</span>
              </span>
              <button className={s.helpCta} onClick={go('/account/help-support')}>
                {t('account.contactSupport')} <i className="fas fa-arrow-right" />
              </button>
            </section>
          </div>
        </div>
      </div>

      {/* Country Change Prompt */}
      <CountryChangePrompt
        open={countryPromptOpen}
        onClose={() => setCountryPromptOpen(false)}
        newCountry={promptCountry}
      />
    </div>
  );
}
