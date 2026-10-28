/**
 * Self-hosted flag images (project rule: no flagcdn — it is blocked in some
 * regions and adds a third-party request to every page). All files live in
 * `public/images/` and are served by the same origin as the app.
 *
 * Usage: `<img src={flagSrc(country)} />` — accepts 'IN'/'in'/'ae' etc.
 */
const FLAG_FILES: Record<string, string> = {
  in: 'in-flag.svg',
  sg: 'sg-flag.svg',
  us: 'us-flag.svg',
  ae: 'uae-flag.svg', // file is named uae-flag.svg, code is 'ae'
  lk: 'lk-flag.svg',
  my: 'my-flag.svg',
  gb: 'gb-flag.svg', // English-language indicator in the header language menu
};

export function flagSrc(code: string | null | undefined): string {
  const key = (code || '').trim().toLowerCase();
  if (!key) return '/images/sg-flag.svg';
  const file = FLAG_FILES[key] || `${key}-flag.svg`;
  return `/images/${file}`;
}
