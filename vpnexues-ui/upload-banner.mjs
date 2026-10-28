// One-off uploader: sends a local image to Cloudinary and prints its delivery URL.
//
//   node upload-banner.mjs "<absolute path to image>" "<public_id>"
//   e.g. node upload-banner.mjs "C:/Users/me/Downloads/pic.jpg" "vpnexues/about/page-banner-about-v2"
//
// Credentials are read from the backend .env (never hardcoded) — same keys the
// server uses. On success it prints the URL to paste into the CSS/TSX that
// renders the banner.
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import cloudinary from 'cloudinary';

const HERE = dirname(fileURLToPath(import.meta.url));
const ENV_FILE = resolve(HERE, '../vpnexues-svc/.env');

const env = Object.fromEntries(
  readFileSync(ENV_FILE, 'utf8')
    .split(/\r?\n/)
    .filter((l) => l.includes('=') && !l.trim().startsWith('#'))
    .map((l) => {
      const i = l.indexOf('=');
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    }),
);

const [file, publicId] = process.argv.slice(2);
if (!file || !publicId) {
  console.error('Usage: node upload-banner.mjs "<image path>" "<public_id>"');
  process.exit(1);
}
if (!env.CLOUDINARY_CLOUD_NAME || !env.CLOUDINARY_API_KEY || !env.CLOUDINARY_API_SECRET) {
  console.error('Missing CLOUDINARY_* keys in ' + ENV_FILE);
  process.exit(1);
}

cloudinary.v2.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
  secure: true,
});

const up = await cloudinary.v2.uploader.upload(file, {
  public_id: publicId,
  overwrite: true,
  resource_type: 'image',
});

// Same delivery transform the rest of the site uses.
const cdnUrl = up.secure_url.replace('/upload/', '/upload/f_auto,q_auto:good/');

console.log('PUBLIC_ID\t' + up.public_id);
console.log('RAW_URL\t\t' + up.secure_url);
console.log('CDN_URL\t\t' + cdnUrl);
console.log('SIZE\t\t' + up.width + 'x' + up.height + '\t' + up.bytes + ' bytes\t' + up.format);
