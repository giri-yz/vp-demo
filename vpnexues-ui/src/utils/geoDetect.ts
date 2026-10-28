import type { CountryCode } from '../types';

const SUPPORTED: CountryCode[] = ['IN', 'SG', 'US', 'AE', 'LK', 'MY'];

const API_CASCADE: Array<{
  url: string;
  extract: (data: Record<string, unknown>) => string | undefined;
}> = [
  {
    url: 'https://ipapi.co/json/',
    extract: (d) => (d as { country_code?: string }).country_code,
  },
  {
    url: 'https://ipwho.is/',
    extract: (d) => (d as { country_code?: string }).country_code,
  },
  {
    url: 'https://get.geojs.io/v1/ip/country.json',
    extract: (d) => (d as { country?: string }).country,
  },
  {
    url: 'https://ipinfo.io/json',
    extract: (d) => (d as { country?: string }).country,
  },
];

/**
 * Detect user's country from IP using free GeoIP APIs.
 * Tries APIs in order; returns first valid supported country code.
 * Returns null if detection fails or country is not supported.
 */
export async function detectCountryFromIP(): Promise<CountryCode | null> {
  for (const api of API_CASCADE) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 4000);

      const res = await fetch(api.url, { signal: controller.signal });
      clearTimeout(timeout);

      if (!res.ok) continue;

      const data = await res.json();
      const code = api.extract(data);

      if (code && SUPPORTED.includes(code as CountryCode)) {
        return code as CountryCode;
      }
    } catch {
      // API failed or timed out — try next
    }
  }
  return null;
}

/**
 * Get user's country using browser Geolocation API + reverse geocode.
 * Falls back to null if user denies or it fails.
 */
export async function detectCountryFromGPS(): Promise<CountryCode | null> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(null);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
            { signal: AbortSignal.timeout(4000) }
          );
          if (!res.ok) {
            resolve(null);
            return;
          }
          const data = await res.json();
          const code = data?.address?.country_code?.toUpperCase();
          if (code && SUPPORTED.includes(code as CountryCode)) {
            resolve(code as CountryCode);
          } else {
            resolve(null);
          }
        } catch {
          resolve(null);
        }
      },
      () => resolve(null),
      { timeout: 5000, maximumAge: 600000 }
    );
  });
}

/**
 * Smart detection: try GPS first (more accurate), fall back to IP.
 */
export async function detectCountry(): Promise<CountryCode | null> {
  // Try GPS first
  const gpsResult = await detectCountryFromGPS();
  if (gpsResult) return gpsResult;

  // Fall back to IP geolocation
  return detectCountryFromIP();
}
