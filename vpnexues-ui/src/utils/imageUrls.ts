export function toSupabaseImageUrl(path: string): string {
  return path;
}

/* Cloudinary delivers on-the-fly transformations: inserting `f_webp,q_auto,w_<n>`
   after `/upload/` re-encodes the SAME source image (WebP + auto quality, capped
   at the given width) — the stored asset is never modified. Non-Cloudinary URLs
   (backend /uploads/..., placehold.co fallbacks) pass through untouched. */
const CLOUDINARY_UPLOAD_RE = /^(https:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\/)(.+)$/;

/** WebP rendition of a Cloudinary image at a fixed width; original URL otherwise. */
export function cloudinaryWidth(url: string, width: number): string {
  const m = CLOUDINARY_UPLOAD_RE.exec(url);
  if (!m) return url;
  return `${m[1]}f_webp,q_auto,w_${width}/${m[2]}`;
}

/* Shop card image slot ≈225px wide on desktop (4-col grid inside 1400px layout)
   and ≈45vw on mobile — 320/480/640/960 cover 1x-3x DPR without ever fetching
   the untransformed original. */
export const PRODUCT_IMG_WIDTHS = [320, 480, 640, 960];
export const PRODUCT_IMG_SIZES = '(min-width: 992px) 225px, 45vw';

const CLOUDINARY_UPLOAD = '/image/upload/';

/** True when the URL is a Cloudinary asset that accepts delivery transformations. */
export function isCloudinaryUrl(url: string): boolean {
  return !!url && url.includes(CLOUDINARY_UPLOAD);
}

/**
 * Insert Cloudinary delivery parameters (`f_auto,q_auto,w_<width>`) into an asset URL.
 * Non-Cloudinary URLs and URLs that already carry transformations are returned unchanged,
 * so existing image URLs stay valid.
 */
export function cloudinaryImg(url: string, width: number): string {
  if (!isCloudinaryUrl(url)) return url;
  const at = url.indexOf(CLOUDINARY_UPLOAD);
  const rest = url.slice(at + CLOUDINARY_UPLOAD.length);
  const segEnd = rest.indexOf('/');
  const firstSeg = segEnd === -1 ? rest : rest.slice(0, segEnd);
  // Already transformed (e.g. `f_auto,q_auto`) → leave it alone rather than double-apply.
  if (firstSeg.includes('_') || firstSeg.includes(',')) return url;
  return url.slice(0, at + CLOUDINARY_UPLOAD.length) + `f_auto,q_auto,w_${width}/` + rest;
}

/** `srcset` list for the given widths, or undefined when the URL cannot be transformed. */
export function cloudinarySrcSet(url: string, widths: number[]): string | undefined {
  if (!isCloudinaryUrl(url)) return undefined;
  return widths.map((w) => `${cloudinaryImg(url, w)} ${w}w`).join(', ');
}
