import { readFileSync } from 'node:fs';
import cloudinary from 'cloudinary';

const ROOT = 'C:/Users/sathi/Downloads/vpnreactsource-main';
const PUB = ROOT + '/vpnexues-ui/public';

const env = Object.fromEntries(
  readFileSync(ROOT + '/vpnexues-svc/env', 'utf8')
    .split(/\r?\n/)
    .filter((l) => l.includes('=') && !l.trim().startsWith('#'))
    .map((l) => {
      const i = l.indexOf('=');
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    }),
);

cloudinary.v2.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
  secure: true,
});

const names = [
  'vegetables-basket',
  'fruits-basket',
  'grocery-basket',
  'small-box',
  'big-box',
  'b2b-supply',
];

for (const n of names) {
  const up = await cloudinary.v2.uploader.upload(`${PUB}/images/categories/${n}.png`, {
    public_id: `vpnexues/home/categories/${n}`,
    overwrite: true,
    resource_type: 'image',
  });
  console.log(`${n}\t${up.secure_url}`);
}
console.log('DONE');
