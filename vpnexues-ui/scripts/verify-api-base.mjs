#!/usr/bin/env node
/**
 * API-base sanity gate (23-Oct-2026) - post-build companion to
 * rewrite-media-urls.mjs.
 *
 * Why: a bad .env.production line (a stray `VITE_API_BASE_URL=$VITE_API_BASE_URL=...`,
 * which Vite's env expansion concatenated) produced a GoDaddy bundle whose axios
 * baseURL was literally:
 *
 *   https://vpnexues-api.onrender.com=https://vpnexues-api.onrender.com
 *
 * Every request then targeted a garbage hostname -> net::ERR_NAME_NOT_RESOLVED
 * on EVERY screen (shop, login, cart) for every visitor, while the backend
 * itself was healthy. Nothing else caught it, so this gate now does:
 *
 *   1. reads VITE_API_BASE_URL the same way vite build does (.env.production, .env)
 *   2. FAILS the build if the baked value is malformed (contains '=' or is not
 *      a valid http(s) origin)
 *   3. FAILS the build if a non-empty base never made it into the bundle
 *      (silent injection failure)
 *   4. FAILS the build if the bundle contains the doubled `<base>=` corruption
 *
 * No env set (CI/dev proxy builds): logs and passes - same gating rule as
 * rewrite-media-urls.mjs.
 *
 * SECOND CHECK (from the 15-Oct-2026 "GoDaddy Zip Audit + Lesson"):
 * a deploy build must also carry the Firebase web config. That incident
 * shipped a zip that had VITE_API_BASE_URL but none of the 6 VITE_FIREBASE_*
 * keys - browsing worked, but every visitor tapping Send OTP saw
 * "Firebase is not configured" (firebase.ts never initialized, authApi's
 * guard threw). Deploy builds (API base set) now FAIL without the Firebase
 * web key baked into the bundle; CI/proxy builds still skip.
 */
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

function envValue(file, key) {
  try {
    const text = readFileSync(file, 'utf8');
    for (const line of text.split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*)$/);
      if (m && m[1] === key) return m[2].trim();
    }
  } catch {
    /* file absent - fine */
  }
  return '';
}

const KEY = 'VITE_API_BASE_URL';
let base = envValue('.env.production', KEY) || envValue('.env', KEY);
// strip surrounding quotes a hand-edited file may carry
base = base.replace(/^['"]|['"]$/g, '');

if (!base) {
  console.log('[verify-api-base] VITE_API_BASE_URL not set - dev/CI proxy build, nothing to check.');
  process.exit(0);
}

// 1) malformed source value - the exact corruption shape that broke prod
if (base.includes('=') || !/^https?:\/\/[^/\s]+$/.test(base)) {
  console.error(`[verify-api-base] FATAL: ${KEY} is malformed -> ${JSON.stringify(base)}`);
  console.error('Expected a single origin like https://vpnexues-api.onrender.com');
  process.exit(1);
}

// 2) scan the bundle
const assetsDir = join('dist', 'assets');
let files;
try {
  files = readdirSync(assetsDir).filter((f) => f.endsWith('.js') || f.endsWith('.css'));
} catch {
  console.error('[verify-api-base] FATAL: dist/assets not found - run vite build first.');
  process.exit(1);
}
files.push('index.html');
files.unshift('index.html'); // check it first for a fast fail; duplicate entry is harmless below

let sawBase = false;
let sawCorruption = false;
let sawFirebase = false;
for (const f of files) {
  const path = f === 'index.html' ? join('dist', 'index.html') : join(assetsDir, f);
  let text;
  try {
    text = readFileSync(path, 'utf8');
  } catch {
    continue;
  }
  if (text.includes(`${base}=`)) sawCorruption = true;
  if (text.includes(base)) sawBase = true;
  if (text.includes('AIzaSy')) sawFirebase = true;
  // generic doubled-URL shape: an http(s) origin immediately followed by '=' and another http(s)
  if (/https?:\/\/[^\s"'`]+=[a-z]+:\/\//i.test(text)) sawCorruption = true;
  if (sawCorruption) {
    console.error(`[verify-api-base] FATAL: doubled/malformed API base found in ${path}`);
    console.error('The bundle would request garbage hostnames (ERR_NAME_NOT_RESOLVED) in production.');
    process.exit(1);
  }
}

if (!sawBase) {
  console.error(`[verify-api-base] FATAL: ${KEY}=${base} but that string never appears in dist/`);
  console.error('The env var did not reach the bundle - check the file name (.env.production) and mode.');
  process.exit(1);
}

// 3) deploy builds must carry the Firebase web config, or OTP login dies
//    (15-Oct-2026 incident: API URL present, all 6 VITE_FIREBASE_* keys
//    missing -> red "Firebase is not configured" on every Send OTP while
//    browsing/cart/checkout kept working, which made it easy to miss)
const FB_KEY = 'VITE_FIREBASE_API_KEY';
const fbKey = (envValue('.env.production', FB_KEY) || envValue('.env', FB_KEY)).replace(/^['"]|['"]$/g, '');
if (fbKey && !fbKey.startsWith('AIza')) {
  console.error(`[verify-api-base] FATAL: ${FB_KEY} is set but is not a Firebase web key (expected AIza...).`);
  process.exit(1);
}
if (!fbKey || !sawFirebase) {
  console.error('[verify-api-base] FATAL: deploy build without Firebase web config.');
  console.error(`  ${FB_KEY} in .env.production: ${fbKey ? 'present' : 'MISSING'}`);
  console.error(`  'AIzaSy' found in dist:       ${sawFirebase ? 'yes' : 'no'}`);
  console.error('OTP login/signup would die with "Firebase is not configured" (15-Oct-2026 incident).');
  process.exit(1);
}

console.log(`[verify-api-base] OK: single clean API base -> ${base}; Firebase web key baked (${files.length} files scanned)`);
