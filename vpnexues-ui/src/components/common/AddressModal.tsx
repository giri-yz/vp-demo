import { useState, useEffect, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useAddress } from '../../context/AddressContext';
import { useCountry } from '../../context/CountryContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../i18n/LanguageContext';
import type { CreateAddressInput } from '../../types';
import styles from './css/AddressModal.module.css';

/* ─── Fix default marker icon (Vite strips public assets at build) ─── */
delete ((L.Icon.Default.prototype as unknown) as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const GREEN_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="40" viewBox="0 0 28 40"><path d="M14 0C6.268 0 0 6.268 0 14c0 10.5 14 26 14 26s14-15.5 14-26C28 6.268 21.732 0 14 0z" fill="#4a7c3f"/><circle cx="14" cy="14" r="6" fill="#fff"/></svg>`;
const greenIcon = L.divIcon({ html: GREEN_SVG, className: '', iconSize: [28, 40], iconAnchor: [14, 40], popupAnchor: [0, -40] });

/* ─── Photon geocoding helpers ─── */
interface PhotonFeature { properties: { name: string; city?: string; state?: string; country?: string; countrycode?: string; postcode?: string; label?: string; street?: string; type?: string }; geometry: { coordinates: [number, number] } }

/**
 * Photon gives both a country NAME ("India") and `countrycode` (ISO-3166
 * alpha-2, "IN"). The address stores the ISO code, so prefer `countrycode`
 * and fall back to resolving the name. Blank when neither resolves — checkout
 * then falls back to the selected country rather than failing the save.
 */
const COUNTRY_NAME_TO_ISO: Record<string, string> = {
  india: 'IN', singapore: 'SG', 'united states': 'US', 'united states of america': 'US',
  'united arab emirates': 'AE', 'sri lanka': 'LK', malaysia: 'MY',
};

function toIsoCountryCode(p: { countrycode?: string; country?: string }): string {
  const code = (p.countrycode ?? '').trim().toUpperCase();
  if (/^[A-Z]{2}$/.test(code)) return code;
  const name = (p.country ?? '').trim().toLowerCase();
  return COUNTRY_NAME_TO_ISO[name] ?? '';
}

async function reverseGeocode(lat: number, lng: number, unknownLabel: string): Promise<{ address: string; city: string; state: string; pincode: string; country: string; countryCode: string } | null> {
  try {
    const r = await fetch(`https://photon.komoot.io/reverse?lat=${lat}&lon=${lng}&lang=en&limit=1`);
    const j = await r.json();
    const f: PhotonFeature | undefined = j.features?.[0];
    if (!f) return null;
    const p = f.properties;
    const parts: string[] = [];
    if (p.name && p.name !== p.city && p.name !== p.state) parts.push(p.name);
    if (p.street) parts.push(p.street);
    if (p.city) parts.push(p.city);
    if (p.state) parts.push(p.state);
    if (p.postcode) parts.push(p.postcode);
    if (p.country) parts.push(p.country);
    return { address: parts.join(', ') || p.label || unknownLabel, city: p.city ?? '', state: p.state ?? '', pincode: p.postcode ?? '', country: p.country ?? '', countryCode: toIsoCountryCode(p) };
  } catch { return null; }
}

async function searchPhoton(query: string): Promise<{ label: string; detail: string; lat: number; lng: number }[]> {
  if (!query.trim()) return [];
  try {
    const r = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=6&lang=en`);
    const j = await r.json();
    return (j.features ?? []).map((f: PhotonFeature) => {
      const p = f.properties;
      const parts: string[] = [];
      if (p.name && p.name !== p.city && p.name !== p.state) parts.push(p.name);
      if (p.street) parts.push(p.street);
      if (p.city) parts.push(p.city);
      if (p.state) parts.push(p.state);
      if (p.postcode) parts.push(p.postcode);
      if (p.country) parts.push(p.country);
      return {
        label: parts.join(', ') || p.label || p.name || 'Location',
        detail: [p.city, p.state, p.country].filter(Boolean).join(', '),
        lat: f.geometry.coordinates[1],
        lng: f.geometry.coordinates[0],
      };
    });
  } catch { return []; }
}

/* ─── Country phone codes ─── */
const COUNTRY_CODES = [
  { code: '+91', country: 'IN', label: '🇮🇳 +91' },
  { code: '+65', country: 'SG', label: '🇸🇬 +65' },
  { code: '+1',  country: 'US', label: '🇺🇸 +1' },
  { code: '+971', country: 'AE', label: '🇦🇪 +971' },
  { code: '+94', country: 'LK', label: '🇱🇰 +94' },
];

function getPhoneCode(country: string): string {
  return COUNTRY_CODES.find(c => c.country === country)?.code ?? '+91';
}

/* Country belonging to a DIAL CODE — validation/maxLength must follow the
   dropdown selection, not the address's country field (a +1 number inside an
   IN address was validated with Indian rules → always rejected). */
function countryOfCode(code: string, fallback: string): string {
  return COUNTRY_CODES.find(c => c.code === code)?.country ?? fallback;
}

/* ─── Country-aware phone validation ─── */
function validatePhone(phone: string, country: string): boolean {
  const digits = phone.replace(/\D/g, '');
  switch (country) {
    case 'IN': return digits.length === 10 && /^[6-9]/.test(digits);
    case 'SG': return digits.length >= 8;
    case 'US': return digits.length === 10;
    case 'AE': return digits.length === 9;
    case 'LK': return digits.length >= 9;
    default: return digits.length >= 6;
  }
}

function phoneMaxLength(country: string): number {
  switch (country) {
    case 'IN': return 10;
    case 'SG': return 8;
    case 'US': return 10;
    case 'AE': return 9;
    case 'LK': return 10;
    default: return 15;
  }
}

/* ─── Map click handler ─── */
function MapEvents({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({ click(e) { onPick(e.latlng.lat, e.latlng.lng); } });
  return null;
}

/* ─── Fly-to helper ─── */
function FlyTo({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => { map.flyTo(center, 16, { duration: 0.8 }); }, [center, map]);
  return null;
}

interface AddressModalProps {
  open: boolean;
  onClose: () => void;
}

export default function AddressModal({ open, onClose }: AddressModalProps) {
  const { user } = useAuth();
  const { country } = useCountry();
  const { t } = useLanguage();
  const { addresses, selectedAddress, selectAddress, addAddress, removeAddress } = useAddress();

  const [mapCenter, setMapCenter] = useState<[number, number]>([13.0827, 80.2707]); // Chennai default
  const [markerPos, setMarkerPos] = useState<[number, number] | null>(null);
  const [searchText, setSearchText] = useState('');
  const [suggestions, setSuggestions] = useState<{ label: string; detail: string; lat: number; lng: number }[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingGeo, setLoadingGeo] = useState(false);

  const [label, setLabel] = useState<'Home' | 'Work' | 'Other'>('Home');
  const [name, setName] = useState(user?.name ?? '');
  const [addressLine, setAddressLine] = useState('');
  const [flat, setFlat] = useState('');
  const [phoneCode, setPhoneCode] = useState(getPhoneCode(country));
  const [phone, setPhone] = useState(user?.phone ? user.phone.replace(/^\+\d+/, '') : '');
  const [phoneValid, setPhoneValid] = useState<boolean | null>(user?.phone ? validatePhone(user.phone, country) : null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [geoCity, setGeoCity] = useState('');
  const [geoState, setGeoState] = useState('');
  const [geoPincode, setGeoPincode] = useState('');
  // ISO-3166 alpha-2 of the picked location. Persisted on the address (V59) so
  // checkout gates delivery on the address's real country instead of the header
  // selector — blank only when reverse-geocode yields nothing.
  const [geoCountry, setGeoCountry] = useState('');

  const searchTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const searchWrapRef = useRef<HTMLDivElement>(null);

  /* Reset form when modal opens */
  useEffect(() => {
    if (open) {
      setLabel('Home');
      setName(user?.name ?? '');
      setAddressLine('');
      setFlat('');
      setPhoneCode(getPhoneCode(country));
      const initialPhone = user?.phone ?? '';
      setPhone(initialPhone ? initialPhone.replace(/^\+\d+/, '') : '');
      setPhoneValid(initialPhone ? validatePhone(initialPhone, country) : null);
      setError('');
      setSearchText('');
      setSuggestions([]);
      setShowSuggestions(false);
      setGeoCity('');
      setGeoState('');
      setGeoPincode('');
      setGeoCountry('');
      if (selectedAddress?.lat && selectedAddress?.lng) {
        setMapCenter([selectedAddress.lat, selectedAddress.lng]);
        setMarkerPos([selectedAddress.lat, selectedAddress.lng]);
        setAddressLine(selectedAddress.addressLine);
        setFlat(selectedAddress.flat ?? '');
        if (selectedAddress.phone) {
          const rawNum = selectedAddress.phone.replace(/^\+\d+/, '');
          const existingCode = selectedAddress.phone.match(/^\+(\d+)/)?.[0];
          if (existingCode) setPhoneCode(existingCode);
          setPhone(rawNum);
          setPhoneValid(validatePhone(rawNum, countryOfCode(existingCode ?? '', country)));
        }
      } else {
        setMarkerPos(null);
      }
    }
  }, [open, user, selectedAddress]);

  /* Click outside search suggestions */
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (searchWrapRef.current && !searchWrapRef.current.contains(e.target as Node)) setShowSuggestions(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleMapPick = useCallback(async (lat: number, lng: number) => {
    setMarkerPos([lat, lng]);
    setMapCenter([lat, lng]);
    setAddressLine('');
    setLoadingGeo(true);
    const info = await reverseGeocode(lat, lng, t('address.unknownLocation'));
    if (info) {
      setAddressLine(info.address);
      setGeoCity(info.city);
      setGeoState(info.state);
      setGeoPincode(info.pincode);
      setGeoCountry(info.countryCode);
    }
    setLoadingGeo(false);
  }, [t]);

  const handleMyLocation = useCallback(() => {
    if (!navigator.geolocation) return;
    setLoadingGeo(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => { handleMapPick(pos.coords.latitude, pos.coords.longitude); setLoadingGeo(false); },
      () => { setLoadingGeo(false); }
    );
  }, [handleMapPick]);

  const handleSearchInput = useCallback((val: string) => {
    setSearchText(val);
    setShowSuggestions(true);
    clearTimeout(searchTimer.current);
    if (val.trim().length < 2) { setSuggestions([]); return; }
    searchTimer.current = setTimeout(async () => {
      const results = await searchPhoton(val);
      setSuggestions(results);
    }, 350);
  }, []);

  const pickSuggestion = useCallback((s: { lat: number; lng: number; label: string }) => {
    setMarkerPos([s.lat, s.lng]);
    setMapCenter([s.lat, s.lng]);
    setAddressLine(s.label);
    setSearchText('');
    setSuggestions([]);
    setShowSuggestions(false);
    setLoadingGeo(true);
    reverseGeocode(s.lat, s.lng, t('address.unknownLocation')).then((info) => {
      if (info) {
        setGeoCity(info.city);
        setGeoState(info.state);
        setGeoPincode(info.pincode);
        setGeoCountry(info.countryCode);
      }
      setLoadingGeo(false);
    });
  }, [t]);

  const handleSave = useCallback(async () => {
    if (!markerPos) { setError(t('address.pinLocationError')); return; }
    if (!addressLine.trim()) { setError(t('address.enterAddressError')); return; }
    if (!name.trim()) { setError(t('address.enterNameError')); return; }
    if (!validatePhone(phone, countryOfCode(phoneCode, country))) { setError(t('address.invalidPhoneError')); return; }
    setSaving(true);
    try {
      const fullPhone = `${phoneCode}${phone.trim()}`;
      const input: CreateAddressInput = {
        label, name: name.trim(), phone: fullPhone,
        addressLine: addressLine.trim(), flat: flat.trim() || null,
        landmark: null,
        city: geoCity || '',
        pincode: geoPincode || '',
        state: geoState || '',
        // Prefer the geocoded country (the address's REAL country); fall back to
        // the selected country so the field is still populated when reverse
        // geocode returned nothing. This is what checkout gates on (V59).
        country: geoCountry || country || null,
        isDefault: addresses.length === 0,
        lat: markerPos?.[0] ?? null, lng: markerPos?.[1] ?? null,
      };
      const created = await addAddress(input);
      selectAddress(created);
      onClose();
    } catch (err: unknown) {
      const axiosErr =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { status?: number; data?: { message?: string } } })
          : undefined;
      // PII-safe log: only status/message — the raw axios error carries the
      // address payload (name/phone) and must never reach the console (QA-23).
      console.error(
        '[AddressModal] save failed:',
        axiosErr?.response?.status ?? (err instanceof Error ? err.message : String(err))
      );
      let msg = t('address.saveFailedError');
      const serverMsg = axiosErr?.response?.data?.message;
      if (serverMsg) msg = serverMsg;
      else if (axiosErr?.response?.status === 400) msg = t('address.missingFieldsError');
      else if (axiosErr?.response?.status === 401 || axiosErr?.response?.status === 403) msg = t('address.loginRequiredError');
      setError(msg);
    }
    setSaving(false);
  }, [label, name, phone, phoneCode, country, addressLine, flat, markerPos, geoCity, geoState, geoPincode, geoCountry, addresses, addAddress, selectAddress, onClose]);

  if (!open) return null;

  return (
    <div className={styles.overlay} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h3><i className="fas fa-location-dot" /> {t('address.title')}</h3>
          <button className={styles.closeBtn} onClick={onClose}><i className="fas fa-times" /></button>
        </div>

        {/* Map */}
        <div className={styles.mapWrap}>
          <MapContainer center={mapCenter} zoom={13} className={styles.map} zoomControl={false} attributionControl={false}>
            <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <MapEvents onPick={handleMapPick} />
            {markerPos && <Marker position={markerPos} icon={greenIcon} />}
            <FlyTo center={mapCenter} />
          </MapContainer>
          {loadingGeo && <div className={styles.mapLoading}><div className={styles.spinner} /><span>{t('address.findingLocation')}</span></div>}
          <div className={styles.mapHint}><i className="fas fa-map-marker-alt" /> {t('address.tapMapHint')}</div>
        </div>

        {/* Search toolbar */}
        <div className={styles.toolbar}>
          <div className={styles.searchWrap} ref={searchWrapRef}>
            <i className="fas fa-search" />
            <input type="text" className={styles.searchInput} placeholder={t('address.searchPlaceholder')} value={searchText} onChange={(e) => handleSearchInput(e.target.value)} onFocus={() => setShowSuggestions(true)} />
            {showSuggestions && suggestions.length > 0 && (
              <div className={styles.autocomplete}>
                {suggestions.map((sug, i) => (
                  <button key={i} type="button" className={styles.acItem} onClick={() => pickSuggestion(sug)} style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', borderBottom: '1px solid #f3f4f6', font: 'inherit', color: 'inherit', cursor: 'pointer' }}>
                    <span className={styles.acIcon}><i className="fas fa-map-marker-alt" /></span>
                    <span className={styles.acText}>
                      <span className={styles.acName}>{sug.label}</span>
                      <span className={styles.acDetail}>{sug.detail}</span>
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <button className={styles.locBtn} onClick={handleMyLocation} disabled={loadingGeo}>
            <i className="fas fa-crosshairs" /> {t('address.locBtn')}
          </button>
        </div>

        {/* Saved addresses */}
        {addresses.length > 0 && (
          <div className={styles.savedAddrs}>
            <div className={styles.savedTitle}>{t('address.savedAddresses')}</div>
            {addresses.map((addr) => (
              <div
                key={addr.id}
                className={`${styles.savedItem} ${selectedAddress?.id === addr.id ? styles.savedActive : ''}`}
                onClick={() => { selectAddress(addr); onClose(); }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selectAddress(addr); onClose(); } }}
              >
                <div className={styles.savedIcon}><i className={`fas ${addr.label === 'Home' ? 'fa-house' : addr.label === 'Work' ? 'fa-briefcase' : 'fa-location-dot'}`} /></div>
                <div className={styles.savedInfo}>
                  <div className={styles.savedLabel}>{addr.label}</div>
                  <div className={styles.savedText}>{addr.addressLine}{addr.flat ? `, ${addr.flat}` : ''}</div>
                </div>
                <button className={styles.savedDel} onClick={(e) => { e.stopPropagation(); removeAddress(addr.id); }}>
                  <i className="fas fa-trash" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Form */}
        <div className={styles.form}>
          <div className={styles.formRow}>
            <label>{t('address.label')}</label>
            <div className={styles.labelBtns}>
              {(['Home', 'Work', 'Other'] as const).map((l) => (
                <button key={l} className={`${styles.labelBtn} ${label === l ? styles.labelActive : ''}`} onClick={() => setLabel(l)}>
                  <i className={`fas ${l === 'Home' ? 'fa-house' : l === 'Work' ? 'fa-briefcase' : 'fa-location-dot'}`} /> {l === 'Home' ? t('address.home') : l === 'Work' ? t('address.work') : t('address.other')}
                </button>
              ))}
            </div>
          </div>
          <div className={styles.formRow}>
            <label>{t('address.name')}</label>
            <div className={styles.inputWrap}>
              <input type="text" placeholder={t('address.recipientName')} value={name} onChange={(e) => setName(e.target.value)} />
              <i className="fas fa-user" />
            </div>
          </div>
          <div className={styles.formRow}>
            <label>{t('address.address')}</label>
            <div className={styles.inputWrap}>
              <input type="text" placeholder={t('address.streetPlaceholder')} value={addressLine} onChange={(e) => setAddressLine(e.target.value)} />
              <i className="fas fa-map-marker-alt" />
            </div>
          </div>
          <div className={styles.formRow}>
            <label>{t('address.flatHouse')}</label>
            <div className={styles.inputWrap}>
              <input type="text" placeholder={t('address.flatPlaceholder')} value={flat} onChange={(e) => setFlat(e.target.value)} />
              <i className="fas fa-building" />
            </div>
          </div>
          <div className={styles.formRow}>
            <label>{t('address.phone')}</label>
            <div className={styles.phoneRow}>
              <div className={styles.phoneCodeWrap}>
                <select
                  className={styles.phoneCodeSelect}
                  value={phoneCode}
                  onChange={(e) => {
                    const selected = COUNTRY_CODES.find(c => c.code === e.target.value);
                    if (selected) {
                      setPhoneCode(selected.code);
                      setPhoneValid(validatePhone(phone, selected.country));
                    }
                  }}
                >
                  {COUNTRY_CODES.map(c => (
                    <option key={c.code} value={c.code}>{c.label}</option>
                  ))}
                </select>
                <i className="fas fa-chevron-down" />
              </div>
              <div className={styles.phoneInputWrap}>
                <input
                  type="tel"
                  maxLength={phoneMaxLength(countryOfCode(phoneCode, country))}
                  value={phone}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^\d]/g, '');
                    setPhone(val);
                    setPhoneValid(validatePhone(val, countryOfCode(phoneCode, country)));
                  }}
                />
                {phone.length > 0 && (
                  <span className={`${styles.validation} ${phoneValid ? styles.ok : styles.bad}`}>
                    <i className={`fas ${phoneValid ? 'fa-check-circle' : 'fa-times-circle'}`} />
                  </span>
                )}
              </div>
            </div>
          </div>
          {error && <div className={styles.errorMsg}>{error}</div>}
          {!markerPos && !error && <div className={styles.mapRequired}><i className="fas fa-map-marker-alt" /> {t('address.pinMapContinue')}</div>}
          <button className={styles.saveBtn} onClick={handleSave} disabled={saving || !addressLine.trim() || !name.trim() || !markerPos}>
            {saving ? t('address.saving') : !markerPos ? t('address.pinOnMapBtn') : t('address.save')}
          </button>
        </div>
      </div>
    </div>
  );
}
