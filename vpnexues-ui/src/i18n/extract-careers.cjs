// Extract JOBS from Careers.tsx and emit patch JSON (title/skills/perks/openings only).
const fs = require('fs');
const src = fs.readFileSync('C:/Users/sathi/Downloads/vpnreactsource-main/vpnexues-ui/src/pages/marketing/Careers.tsx', 'utf8');
const start = src.indexOf('const JOBS = ');
if (start < 0) throw new Error('JOBS not found');
const open = src.indexOf('[', start);
// find matching ] by bracket counting (strings contain brackets rarely; handle quotes)
let i = open, depth = 0, q = null;
for (; i < src.length; i++) {
  const c = src[i];
  if (q) {
    if (c === '\\') { i++; continue; }
    if (c === q) q = null;
    continue;
  }
  if (c === "'" || c === '"' || c === '`') { q = c; continue; }
  if (c === '[') depth++;
  else if (c === ']') { depth--; if (depth === 0) break; }
}
const literal = src.slice(open, i + 1);
const JOBS = eval(literal);

const patch = {};
for (const job of JOBS) {
  const base = `careers.jobs.${job.id}`;
  patch[`${base}.title`] = job.title;
  patch[`${base}.skills`] = job.skills;
  patch[`${base}.perks`] = job.perks;
  if (job.openings) {
    patch[`${base}.openings`] = job.openings.map((o) => ({ role: o.role, responsibilities: o.responsibilities }));
  }
}
fs.writeFileSync('C:/Users/sathi/Downloads/vpnreactsource-main/vpnexues-ui/src/i18n/patch-en-careers.json', JSON.stringify(patch, null, 2) + '\n', 'utf8');
console.log('jobs:', JOBS.length, 'keys:', Object.keys(patch).length);
