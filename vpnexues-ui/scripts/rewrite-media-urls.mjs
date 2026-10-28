#!/usr/bin/env node
/**
 * AWS image-cutover post-build pass (16-Oct-2026).
 *
 * What it does: after `vite build`, rewrites every hardcoded Cloudinary
 * upload URL baked into the bundle (JS string literals, i18n dictionaries,
 * CSS url() backgrounds, index.html) to the AWS media mirror:
 *
 *   https://res.cloudinary.com/eqjshlur/image/upload/<transforms>/<vN>/<id>
 *   →  ${VITE_MEDIA_BASE_URL}/media/<id>
 *
 * Why a build pass instead of source edits: ~330 literals across ~50 files
 * (gallery/news/testimonial static data, hero slides, flags, banners in CSS).
 * A post-build rewrite covers ALL of them — including CSS, which a JS util
 * can never reach — with zero source churn, so the same source tree still
 * builds the GoDaddy/Cloudinary flavour untouched.
 *
 * GATING (safety): exits immediately unless VITE_MEDIA_BASE_URL is set.
 * - AWS build:      $env:VITE_MEDIA_BASE_URL='https://d1hs0...cloudfront.net'
 *                   npm run build   (postbuild runs this automatically)
 * - GoDaddy build:  VITE_API_BASE_URL='https://vpnexues-api.onrender.com'
 *                   npm run build   (var unset → this script is a no-op)
 *
 * Runtime URLs (products/cart/order rows fetched from the API at runtime)
 * are handled separately by src/utils/mediaUrl.ts — this script only fixes
 * what the bundler statically embedded. KEEP THE PARSE RULES IN SYNC with
 * mediaUrl.ts: skip delivery-transform segments (contain ',' or <1-3 letters>_),
 * skip the vN version segment, everything after = public_id, keep %-encoding.
 *
 * Idempotent: already-rewritten URLs do not match the Cloudinary pattern.
 */
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join, extname } from 'node:path';

const BASE = (process.env.VITE_MEDIA_BASE_URL || '').replace(/\/+$/, '');
if (!BASE) {
  console.log('[rewrite-media-urls] VITE_MEDIA_BASE_URL not set — GoDaddy/Cloudinary build, nothing to do.');
  process.exit(0);
}

const DIST = join(process.cwd(), 'dist');
const PROCESS_EXT = new Set(['.js', '.css', '.html']);

// Full Cloudinary upload URL up to a quote/backtick/whitespace terminator.
// Parens stay inside the match (public ids like `red-lentils-(masoor).jpg`);
// a trailing `)` is CSS url() syntax and is re-appended by toMediaUrl().
const URL_RE = /https:\/\/res\.cloudinary\.com\/[a-z0-9-]+\/(?:image|video)\/upload\/[^"'`\s]+/g;

const TRANSFORM_SEG_RE = /^[a-z]{1,2}_[a-z0-9]/i; // f_webp, q_auto:good, w_640, c_fill...
const VERSION_SEG_RE = /^v\d+$/; // v1790001005

function toMediaUrl(raw) {
  let url = raw;
  let trailing = '';
  if (url.endsWith(')')) {
    // Unquoted CSS url(...) — the ')' is syntax, not part of the URL.
    url = url.slice(0, -1);
    trailing = ')';
  }
  url = url.split('?')[0]; // drop cache busters (?v=5)
  const m = /^https:\/\/res\.cloudinary\.com\/[^/]+\/(?:image|video)\/upload\/(.+)$/.exec(url);
  if (!m) return raw;
  const segs = m[1].split('/');
  let i = 0;
  while (i < segs.length && (segs[i].includes(',') || TRANSFORM_SEG_RE.test(segs[i]))) i++;
  if (i < segs.length && VERSION_SEG_RE.test(segs[i])) i++;
  const publicId = segs.slice(i).join('/');
  if (!publicId) return raw;
  return `${BASE}/media/${publicId}${trailing}`;
}

function* walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) yield* walk(p);
    else yield p;
  }
}

let totalFiles = 0;
let totalRepl = 0;
let leftover = 0;

for (const file of walk(DIST)) {
  if (!PROCESS_EXT.has(extname(file))) continue; // skip .map sourcemaps, fonts, images
  const before = readFileSync(file, 'utf8');
  if (!before.includes('res.cloudinary.com')) continue;
  let count = 0;
  const after = before.replace(URL_RE, (match) => {
    const out = toMediaUrl(match);
    if (out !== match) count++;
    return out;
  });
  if (count > 0) {
    writeFileSync(file, after);
    totalFiles++;
    totalRepl += count;
    console.log(`  ${file.slice(DIST.length + 1)}: ${count} URL(s) rewritten`);
  }
  // Anything still pointing at Cloudinary in plain (non-escaped) form?
  leftover += (after.match(/https:\/\/res\.cloudinary\.com\/[a-z0-9-]+\/(?:image|video)\/upload\//g) || []).length;
}

console.log(`[rewrite-media-urls] base=${BASE} files=${totalFiles} rewritten=${totalRepl}`);
if (leftover > 0) {
  console.warn(`[rewrite-media-urls] WARN: ${leftover} Cloudinary URL(s) still present in dist (check terminator rules).`);
} else {
  console.log('[rewrite-media-urls] OK: 0 plain Cloudinary URLs left in dist.');
}
