// Dump JSX text nodes + attribute string literals from given files (i18n candidates).
const fs = require('fs');
const files = process.argv.slice(2);
for (const f of files) {
  const src = fs.readFileSync(f, 'utf8');
  const out = [];
  // JSX text: >text<
  let m;
  const jsxRe = />([^<>{}\n][^<>{}\n]{4,})</g;
  while ((m = jsxRe.exec(src))) {
    const s = m[1].trim();
    if (s && /[A-Za-z]/.test(s)) out.push('JSX: ' + s);
  }
  // template/plain literals assigned to visible attrs
  const attrRe = /(placeholder|title|label|aria-label|alt)=\{?["'`]([^"'`]{4,})["'`]\}?/g;
  while ((m = attrRe.exec(src))) out.push(m[1] + ': ' + m[2]);
  // string props like label="..." or title="..."
  console.log('===== ' + f.split(/[\\/]/).slice(-2).join('/'));
  const seen = new Set();
  for (const o of out) if (!seen.has(o)) { seen.add(o); console.log('  ' + o); }
}
