import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { get as httpsGet } from 'node:https';
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

const jobs = [];
for (let i = 1; i <= 22; i++) {
  jobs.push({ file: `${PUB}/images/gallery/farmerimg${i}.jpeg`, publicId: `vpnexues/gallery/farmerimg${i}` });
}
jobs.push({ file: `${PUB}/images/about/farmerimage.png`, publicId: 'vpnexues/about/farmerimage-section' });
jobs.push({ file: `${PUB}/images/home-1/new home/b2bimage.png`, publicId: 'vpnexues/home/b2bimage' });
jobs.push({ file: `${PUB}/images/banners/page-banner-gallery.jpg`, publicId: 'vpnexues/banners/page-banner-gallery' });

const cdnUrl = (secureUrl) =>
  secureUrl.replace('/upload/', '/upload/f_auto,q_auto:good/').replace(/\/v\d+\//, '/');

const sha1 = (buf) => createHash('sha1').update(buf).digest('hex');
const fetchBuf = (url) =>
  new Promise((resolve, reject) => {
    httpsGet(url, (res) => {
      if (res.statusCode !== 200) return reject(new Error('HTTP ' + res.statusCode));
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks)));
    }).on('error', reject);
  });

for (const j of jobs) {
  // Reuse existing asset only if it is byte-identical to the local file.
  try {
    const res = await cloudinary.v2.api.resource(j.publicId);
    const local = readFileSync(j.file);
    const remote = await fetchBuf(cdnUrl(res.secure_url).replace('/f_auto,q_auto:good/', '/'));
    if (sha1(remote) === sha1(local)) {
      console.log('REUSE\t' + j.publicId + '\t' + cdnUrl(res.secure_url));
      continue;
    }
  } catch {
    /* not uploaded yet */
  }
  const up = await cloudinary.v2.uploader.upload(j.file, {
    public_id: j.publicId,
    overwrite: true,
    resource_type: 'image',
  });
  console.log('UPLOADED\t' + j.publicId + '\t' + cdnUrl(up.secure_url));
}
console.log('DONE');
