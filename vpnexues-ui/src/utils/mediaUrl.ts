/**
 * AWS media mirror rewrite (image cutover, 16-Oct-2026).
 *
 * All product/site assets are mirrored from Cloudinary into S3
 * (`vpnexues-web/media/<public_id>`) and served through the CloudFront
 * distribution. The DB keeps Cloudinary URLs as the source of truth, so the
 * swap happens at render time: every Cloudinary upload URL is mapped to
 * `${VITE_MEDIA_BASE_URL}/media/<public_id>` — same file, AWS edge instead of
 * Cloudinary.
 *
 * BUILD GATING (important):
 * - AWS build: `VITE_MEDIA_BASE_URL=https://d1hs0xydm3t52x.cloudfront.net`
 *   → rewrite active, site loads images from AWS.
 * - GoDaddy/www build: var NOT set → every function here is a passthrough,
 *   bundle behaves byte-for-byte like before (images from Cloudinary).
 * Never put VITE_MEDIA_BASE_URL into .env.production — pass it as a shell
 * env var only in the AWS build recipe (see AWS-Deploy-Manual.html).
 *
 * Mapping rules (mirror of scripts/rewrite-media-urls.mjs — keep in sync):
 * 1. Only `https://res.cloudinary.com/<cloud>/(image|video)/upload/...` URLs.
 * 2. Skip delivery-transform segments (`f_webp,q_auto,w_640`, `f_auto,q_auto:good`,
 *    `c_fill,w_3400,h_384,...`, `f_mp4,q_auto`, or single flags like `w_640`).
 * 3. Skip the auto-version segment (`v1790001005`).
 * 4. Everything after that is the public_id path — keep %-encoding as-is
 *    (`Cane%20Jaggery.jpg` hits the S3 key `Cane Jaggery.jpg`).
 * 5. Idempotent: AWS URLs (and anything else) pass through unchanged, so the
 *    same helper is safe on rows that already store mirror URLs.
 */
const MEDIA_BASE = (import.meta.env.VITE_MEDIA_BASE_URL || '').replace(/\/+$/, '');

const CLOUDINARY_UPLOAD_RE =
  /^https:\/\/res\.cloudinary\.com\/[^/]+\/(?:image|video)\/upload\/(.+)$/;
/** Delivery transform flag: 1-2 letters + underscore (f_, q_, w_, c_, e_...). */
const TRANSFORM_SEG_RE = /^[a-z]{1,2}_[a-z0-9]/i;
const VERSION_SEG_RE = /^v\d+$/;

export function mediaUrl(url: string | null | undefined): string {
  if (!url || !MEDIA_BASE) return url || '';
  // Drop any cache-buster query (?v=5) before parsing.
  const clean = url.split('?')[0];
  const m = CLOUDINARY_UPLOAD_RE.exec(clean);
  if (!m) return url;
  const segs = m[1].split('/');
  let i = 0;
  while (i < segs.length && (segs[i].includes(',') || TRANSFORM_SEG_RE.test(segs[i]))) i++;
  if (i < segs.length && VERSION_SEG_RE.test(segs[i])) i++;
  const publicId = segs.slice(i).join('/');
  if (!publicId) return url;
  return `${MEDIA_BASE}/media/${publicId}`;
}

/** True when the AWS mirror rewrite is active in this build. */
export const MEDIA_REWRITE_ENABLED = Boolean(MEDIA_BASE);
