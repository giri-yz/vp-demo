/**
 * Frontend-only demo persistence (localStorage, `vpnexues-demo-*` keys).
 * Seeds each collection on first use; mutations persist across refresh.
 * Used ONLY when the backend is unreachable — real API always wins.
 *
 * PERFORMANCE: every read used to do `localStorage.getItem` + `JSON.parse`, and
 * several admin views called these helpers once per rendered table row (and again
 * for tab counts, export rows and sorting). On a few hundred orders that meant
 * thousands of full-JSON parses per keystroke, which is what made the Users /
 * Countries pages crawl. Reads now go through an in-memory cache that is only
 * invalidated when this module writes.
 */

const PREFIX = 'vpnexues-demo-';

/** Parsed collections keyed by the unprefixed storage key. */
const cache = new Map<string, unknown[]>();

function readCache<T>(key: string): T[] | undefined {
  return cache.get(key) as T[] | undefined;
}

function writeCache<T>(key: string, items: T[]): void {
  cache.set(key, items);
}

/** Drop one collection (or all of them) from memory after an external write/removal. */
export function invalidateCollection(key?: string): void {
  if (key === undefined) cache.clear();
  else cache.delete(key);
}

export function loadCollectionVersioned<T>(key: string, version: string, seed: () => T[]): T[] {
  const vKey = PREFIX + key + ':v';
  try {
    if (localStorage.getItem(vKey) !== version) {
      localStorage.removeItem(PREFIX + key);
      localStorage.setItem(vKey, version);
      cache.delete(key);
    }
  } catch { /* ignore */ }
  return loadCollection(key, seed);
}

export function loadCollection<T>(key: string, seed: () => T[]): T[] {
  const cached = readCache<T>(key);
  if (cached) return [...cached];

  let fresh: T[];
  try {
    const raw = localStorage.getItem(PREFIX + key);
    const parsed = raw ? (JSON.parse(raw) as T[]) : null;
    if (Array.isArray(parsed)) {
      fresh = parsed;
    } else {
      fresh = seed();
      try {
        localStorage.setItem(PREFIX + key, JSON.stringify(fresh));
      } catch {
        // Storage unavailable (private mode) -> serve in-memory only.
      }
    }
  } catch {
    // Corrupt storage -> reseed below.
    fresh = seed();
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify(fresh));
    } catch {
      // Storage unavailable (private mode) -> serve in-memory only.
    }
  }

  writeCache(key, fresh);
  return [...fresh];
}

export function saveCollection<T>(key: string, items: T[]): void {
  // Update memory first so callers that mutate-then-save see their own write.
  writeCache(key, [...items]);
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(items));
  } catch {
    // Non-fatal: demo edits simply won't survive refresh.
  }
}

export function clearDemoStorage(): void {
  cache.clear();
  try {
    const doomed: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(PREFIX)) doomed.push(k);
    }
    doomed.forEach((k) => localStorage.removeItem(k));
  } catch {
    // Ignore.
  }
}
