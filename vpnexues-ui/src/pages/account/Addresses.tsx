import { useState } from 'react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useAddress } from '../../context/AddressContext';
import { useCountry } from '../../context/CountryContext';
import { useRipple } from '../../components/common/Ripple';
import { useLanguage } from '../../i18n/LanguageContext';
import AddressModal from '../../components/common/AddressModal';
import AccountLayout from './AccountLayout';
import s from './css/Addresses.module.css';

const PHONE_CODE: Record<string, string> = { IN: '+91', SG: '+65', US: '+1', AE: '+971' };

delete ((L.Icon.Default.prototype as unknown) as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const GREEN_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="28" viewBox="0 0 28 40"><path d="M14 0C6.268 0 0 6.268 0 14c0 10.5 14 26 14 26s14-15.5 14-26C28 6.268 21.732 0 14 0z" fill="#4a7c3f"/><circle cx="14" cy="14" r="5" fill="#fff"/></svg>`;
const greenIcon = L.divIcon({ html: GREEN_SVG, className: '', iconSize: [20, 28], iconAnchor: [10, 28], popupAnchor: [0, -28] });

const LABEL_ICONS: Record<string, string> = { Home: 'fa-house', Work: 'fa-briefcase', Other: 'fa-location-dot' };

export default function Addresses() {
  const { addresses, loading, removeAddress } = useAddress();
  const { country } = useCountry();
  const { t } = useLanguage();
  const [modalOpen, setModalOpen] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const rippleLight = useRipple('light');
  const rippleRed = useRipple('red');

  async function handleDelete(id: string) {
    setDeleting(id);
    try { await removeAddress(id); }
    catch { /* silent — UI already updated by context */ }
  }

  return (
    <AccountLayout title={t('account.addresses')} breadcrumb={t('account.addresses')}>
      <div className={s.page}>
        <div className={s.header}>
          <div>
            <h3 className={s.sectionTitle}>{t('account.savedAddresses')}</h3>
            <p className={s.sectionSub}>
              {addresses.length === 1
                ? t('account.addressSaved')
                : t('account.addressesSaved').replace('{n}', String(addresses.length))}
            </p>
          </div>
          <button className={s.addBtn} onClick={e => { rippleLight(e); setModalOpen(true); }}>
            <i className="fas fa-plus" /> {t('address.addNew')}
          </button>
        </div>

      {loading ? (
        <div className={s.empty}><div className={s.emptyIcon}><i className="fas fa-spinner fa-spin" /></div><p className={s.emptyText}>{t('shop.loading')}</p></div>
      ) : addresses.length === 0 ? (
        <div className={s.emptyState}>
          <div className={s.emptyGraphic}>
            <div className={s.emptyCircle}><i className="fas fa-map-marker-alt" /></div>
            <div className={s.emptyDots}><span /><span /><span /></div>
          </div>
          <h3 className={s.emptyTitle}>{t('account.noSavedAddresses')}</h3>
          <p className={s.emptyText}>{t('account.addFirstAddress')}</p>
          <button className={s.emptyBtn} onClick={e => { rippleLight(e); setModalOpen(true); }}>
            <i className="fas fa-plus" /> {t('account.addYourFirstAddress')}
          </button>
        </div>
      ) : (
        <div className={s.addrGrid}>
          {addresses.map(addr => (
            <div key={addr.id} className={s.addrCard}>
              <div className={s.cardTop}>
                <div className={s.addrIconWrap}>
                  <i className={`fas ${LABEL_ICONS[addr.label] || 'fa-location-dot'}`} />
                </div>
                <div className={s.addrInfo}>
                  <div className={s.addrLabel}>{addr.label}</div>
                  {addr.isDefault && <span className={s.defaultBadge}><i className="fas fa-check" /> {t('address.default')}</span>}
                </div>
                <button className={s.deleteBtn} onClick={e => { rippleRed(e); handleDelete(addr.id); }} aria-label={t('account.delete')} disabled={deleting === addr.id}>
                  {deleting === addr.id ? <i className="fas fa-spinner fa-spin" /> : <i className="fas fa-trash-alt" />}
                </button>
              </div>

              {addr.lat && addr.lng ? (
                <div className={s.mapPreview}>
                  <MapContainer center={[addr.lat, addr.lng]} zoom={15} className={s.miniMap} zoomControl={false} attributionControl={false} dragging={false} scrollWheelZoom={false} doubleClickZoom={false} touchZoom={false} keyboard={false} boxZoom={false}>
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <Marker position={[addr.lat, addr.lng]} icon={greenIcon} />
                  </MapContainer>
                </div>
              ) : (
                <div className={s.noMap}>
                  <i className="fas fa-map" /> {t('address.noLocationPinned')}
                </div>
              )}

              <div className={s.addrDetails}>
                <div className={s.addrText}>{addr.addressLine}{addr.flat ? `, ${addr.flat}` : ''}{addr.landmark ? `, ${addr.landmark}` : ''}</div>
                <div className={s.addrText}>{addr.city}, {addr.state} - {addr.pincode}</div>
                <div className={s.addrPhone}><i className="fas fa-user" /> {addr.name} · <i className="fas fa-phone" /> {addr.phone.startsWith('+') ? addr.phone : `${PHONE_CODE[country] || '+91'} ${addr.phone}`}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      <AddressModal open={modalOpen} onClose={() => setModalOpen(false)} />
      </div>
    </AccountLayout>
  );
}
