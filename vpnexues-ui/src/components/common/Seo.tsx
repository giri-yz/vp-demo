import { useEffect } from 'react';
import type { SeoMeta } from '../../config/seoMeta';

/* Head-only SEO metadata manager (no dependency — generalizes the DOM-upsert
 * pattern already used in pages/marketing/News.tsx and BlogDetail.tsx).
 * Renders nothing: mounting it changes no layout, CSS or visible text.
 * It writes document.title plus meta description / og:title / og:description
 * into <head>, CREATING the tags when missing — the index.html shell ships
 * none, so an "update only if present" check would silently no-op.
 * On unmount it restores the shell defaults so one page's metadata can never
 * leak onto an unmanaged route (e.g. /pricing/b2b -> /about).
 * Entries without a description (e.g. B2B, pending marketing copy) skip the
 * description tags entirely. Canonical URLs are intentionally NOT managed. */
const BASE_TITLE = 'VPNexues';
const BASE_DESCRIPTION = 'VPNexues is a modern grocery ordering and delivery platform.';

function upsertMeta(attr: 'name' | 'property', key: string, content: string): void {
  const selector = `meta[${attr}="${key}"]`;
  let el = document.head.querySelector<HTMLMetaElement>(selector);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

export default function Seo({ title, description }: SeoMeta) {
  useEffect(() => {
    document.title = title;
    upsertMeta('property', 'og:title', title);
    if (description) {
      upsertMeta('name', 'description', description);
      upsertMeta('property', 'og:description', description);
    }
    return () => {
      document.title = BASE_TITLE;
      upsertMeta('name', 'description', BASE_DESCRIPTION);
      upsertMeta('property', 'og:title', BASE_TITLE);
      upsertMeta('property', 'og:description', BASE_DESCRIPTION);
    };
  }, [title, description]);

  return null;
}
