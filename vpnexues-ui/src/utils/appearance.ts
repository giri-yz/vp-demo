import type { DemoPrefs } from '../api/demo/demoAdmin';

export type AppearanceMode = 'Light' | 'Dark' | 'System' | 'Compact';

export const APPEARANCE_OPTIONS: AppearanceMode[] = ['Light', 'Dark', 'System', 'Compact'];

/** Derive the active appearance chip from existing prefs (theme + density). */
export function appearanceFromPrefs(prefs: Pick<DemoPrefs, 'theme' | 'density'>): AppearanceMode {
  if (prefs.density === 'Compact') return 'Compact';
  if (prefs.theme === 'Dark') return 'Dark';
  if (prefs.theme === 'System') return 'System';
  return 'Light';
}

/** Map a mutually-exclusive appearance choice onto existing DemoPrefs fields. */
export function prefsFromAppearance(mode: AppearanceMode): Pick<DemoPrefs, 'theme' | 'density'> {
  switch (mode) {
    case 'Compact':
      return { theme: 'Light', density: 'Compact' };
    case 'Dark':
      return { theme: 'Dark', density: 'Comfortable' };
    case 'System':
      return { theme: 'System', density: 'Comfortable' };
    case 'Light':
    default:
      return { theme: 'Light', density: 'Comfortable' };
  }
}

function resolveTheme(theme: string): 'light' | 'dark' {
  if (theme === 'Dark') return 'dark';
  if (theme === 'System') {
    return typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  }
  return 'light';
}

let systemCleanup: (() => void) | null = null;

/** Apply theme + density attributes to documentElement (admin shell reads these). */
export function applyAppearance(theme: string, density: string): void {
  const root = document.documentElement;
  root.setAttribute('data-theme', resolveTheme(theme));
  root.setAttribute('data-density', density === 'Compact' ? 'compact' : 'comfortable');

  systemCleanup?.();
  systemCleanup = null;
  if (theme === 'System' && typeof window !== 'undefined') {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => {
      root.setAttribute('data-theme', mq.matches ? 'dark' : 'light');
    };
    mq.addEventListener('change', onChange);
    systemCleanup = () => mq.removeEventListener('change', onChange);
  }
}

/** Read saved prefs from the existing demo prefs store and apply appearance. */
export function bootstrapAppearanceForCountry(country: string, getPrefs: (c: string) => DemoPrefs): void {
  try {
    const prefs = getPrefs(country);
    applyAppearance(prefs.theme, prefs.density);
  } catch {
    applyAppearance('Light', 'Comfortable');
  }
}
