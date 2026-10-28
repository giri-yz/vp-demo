import { createContext, useContext, useState, useCallback, useEffect, useRef, type ReactNode } from 'react';
import type { CountryCode } from '../types';
import { detectCountry } from '../utils/geoDetect';

const STORAGE_KEY = 'vpnexues-country';
const DETECTED_KEY = 'vpnexues-country-detected';
const LEGACY_KEY = 'vpnexues_detected_country'; // pre-QA header key (finding: stale value reverted the user's choice)
const SUPPORTED: CountryCode[] = ['IN', 'SG', 'US', 'AE', 'LK', 'MY'];

function readStored(): CountryCode | null {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored && SUPPORTED.includes(stored as CountryCode)) {
    return stored as CountryCode;
  }
  // One-time migration of the legacy Header key, then drop it so no other code
  // can read a stale second copy of the country preference.
  const legacy = localStorage.getItem(LEGACY_KEY);
  if (legacy) {
    try { localStorage.removeItem(LEGACY_KEY); } catch { /* ignore */ }
    if (SUPPORTED.includes(legacy as CountryCode)) {
      localStorage.setItem(STORAGE_KEY, legacy);
      return legacy as CountryCode;
    }
  }
  return null;
}

export type DetectSource = 'stored' | 'gps' | 'ip' | 'manual' | 'default';

const COUNTRY_NAMES: Record<CountryCode, string> = {
  IN: 'India',
  SG: 'Singapore',
  US: 'United States',
  AE: 'UAE',
  LK: 'Sri Lanka',
  MY: 'Malaysia',
};

interface LocationNotification {
  message: string;
  country: CountryCode;
}

interface CountryContextValue {
  country: CountryCode;
  detectSource: DetectSource;
  setCountry: (country: CountryCode) => void;
  autoDetect: () => Promise<void>;
  detecting: boolean;
  notification: LocationNotification | null;
  clearNotification: () => void;
}

const CountryContext = createContext<CountryContextValue | undefined>(undefined);

/** Update country + notify entire app in real-time */
function setCountryGlobal(next: CountryCode, source: DetectSource) {
  localStorage.setItem(STORAGE_KEY, next);
  localStorage.setItem(DETECTED_KEY, source);
  // Dispatch event so any component can listen
  window.dispatchEvent(new CustomEvent('country:changed', { detail: { country: next, source } }));
}

export function CountryProvider({ children }: { children: ReactNode }) {
  const stored = readStored();
  const [country, setCountryState] = useState<CountryCode>(stored ?? 'SG');
  const [detectSource, setDetectSource] = useState<DetectSource>(stored ? 'stored' : 'default');
  const [detecting, setDetecting] = useState(!stored);
  const [notification, setNotification] = useState<LocationNotification | null>(null);
  const hasDetected = useRef(false);
  const prevCountry = useRef<CountryCode>(stored ?? 'SG');

  const clearNotification = useCallback(() => setNotification(null), []);
  const notifTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const showNotification = useCallback((c: CountryCode) => {
    setNotification({
      message: `Location detected: ${COUNTRY_NAMES[c]}`,
      country: c,
    });
    // restart the auto-dismiss window; an older timer must not kill a newer toast
    if (notifTimerRef.current) clearTimeout(notifTimerRef.current);
    notifTimerRef.current = setTimeout(() => setNotification(null), 4000);
  }, []);

  // never leave the auto-dismiss timer running past unmount
  useEffect(() => () => { if (notifTimerRef.current) clearTimeout(notifTimerRef.current); }, []);

  const setCountry = useCallback((next: CountryCode) => {
    setCountryState(next);
    setDetectSource('manual');
    setCountryGlobal(next, 'manual');
    showNotification(next);
  }, [showNotification]);

  const autoDetect = useCallback(async () => {
    setDetecting(true);
    try {
      const detected = await detectCountry();
      if (detected) {
        setCountryState(detected);
        setDetectSource('ip');
        setCountryGlobal(detected, 'ip');

        if (detected !== prevCountry.current) {
          showNotification(detected);
        }
        prevCountry.current = detected;
      }
    } catch {
      // detection failed — keep current country
    } finally {
      setDetecting(false);
    }
  }, [showNotification]);

  // Auto-detect on first load if no stored value
  useEffect(() => {
    if (stored || hasDetected.current) return;
    hasDetected.current = true;
    autoDetect();
  }, [stored, autoDetect]);

  // Re-detect country after login
  useEffect(() => {
    function onLogin() {
      // never overwrite an explicit manual pick with an IP/GPS re-detection
      if (detectSource === 'manual') return;
      autoDetect();
    }
    window.addEventListener('auth:login', onLogin);
    return () => window.removeEventListener('auth:login', onLogin);
  }, [autoDetect, detectSource]);

  // Expose for console testing + external access
  useEffect(() => {
    (window as unknown as Record<string, unknown>).VPNexuesCountry = {
      detect: autoDetect,
      set: (code: CountryCode) => {
        if (SUPPORTED.includes(code)) {
          setCountry(code);
        } else {
          console.error(`Unsupported country: ${code}. Supported: ${SUPPORTED.join(', ')}`);
        }
      },
      get: () => country,
      getSource: () => detectSource,
      isDetecting: () => detecting,
      force: async (code?: CountryCode) => {
        // Force detection or force-set a specific country
        if (code && SUPPORTED.includes(code)) {
          setCountryState(code);
          setDetectSource('manual');
          setCountryGlobal(code, 'manual');
          showNotification(code);
        } else {
          // Force re-detect even if already stored
          prevCountry.current = country; // reset to trigger notification
          await autoDetect();
        }
      },
      clear: () => {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(DETECTED_KEY);
        console.log('Country cleared. Refresh page to re-detect.');
      },
      help: () => {
        console.log(`
🌍 VPNexuesCountry — Console Commands
──────────────────────────────────────
VPNexuesCountry.get()              → Current country (e.g. "IN")
VPNexuesCountry.getSource()        → How it was detected ("ip"/"manual"/"stored")
VPNexuesCountry.isDetecting()      → Is detection in progress?

VPNexuesCountry.detect()           → Re-run GPS → IP detection
VPNexuesCountry.set("SG")          → Set country manually (shows notification)
VPNexuesCountry.force("US")        → Force-set country (bypasses storage check)
VPNexuesCountry.force()            → Force re-detect (even if already stored)
VPNexuesCountry.clear()            → Clear stored country, refresh to re-detect

Supported countries: IN (India), SG (Singapore), US (USA), AE (UAE)
        `);
      },
    };
  }, [country, detectSource, detecting, autoDetect, setCountry, showNotification]);

  return (
    <CountryContext.Provider value={{ country, detectSource, setCountry, autoDetect, detecting, notification, clearNotification }}>
      {children}
    </CountryContext.Provider>
  );
}

export function useCountry(): CountryContextValue {
  const ctx = useContext(CountryContext);
  if (!ctx) throw new Error('useCountry must be used within CountryProvider');
  return ctx;
}
