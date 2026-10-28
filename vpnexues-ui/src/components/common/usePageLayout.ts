interface PageLayout {
  hideHeader: boolean;
  isB2B: boolean;
  isShop: boolean;
}

const DEFAULT: PageLayout = { hideHeader: false, isB2B: false, isShop: false };

let config: PageLayout = { ...DEFAULT };
let listeners: Array<() => void> = [];

/** Subscribe to config changes (for useSyncExternalStore) */
export function subscribeLayout(cb: () => void) {
  listeners.push(cb);
  return () => { listeners = listeners.filter(l => l !== cb); };
}

/** Get current config snapshot (for useSyncExternalStore) */
export function getLayoutSnapshot(): PageLayout {
  return config;
}

/** Pages call this to set their layout needs. */
export function setPageLayout(update: Partial<PageLayout>) {
  config = { ...config, ...update };
  listeners.forEach(l => l());
}

/**
 * Pages call this hook at top level to declare their layout.
 * Example: usePageLayout({ hideHeader: true, isShop: true })
 */
export function usePageLayout(update: Partial<PageLayout>) {
  // Set synchronously on first render (before paint)
  setPageLayout(update);
}
