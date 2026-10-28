// Compare key coverage of translation files (they're plain object literals)
const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'translations');
const langs = ['en', 'ta', 'hi', 'si', 'ms'];

function load(lang) {
  let src = fs.readFileSync(path.join(dir, lang + '.ts'), 'utf8');
  src = src.replace(new RegExp('^export const ' + lang + ' ='), 'module.exports =');
  src = src.replace(/\}\s*as\s*const\s*;?\s*$/, '};');
  const tmp = path.join(__dirname, lang + '.cjs');
  fs.writeFileSync(tmp, src, 'utf8');
  delete require.cache[require.resolve(tmp)];
  return require(tmp);
}

function flatten(obj, prefix, out) {
  for (const k of Object.keys(obj)) {
    const v = obj[k];
    const key = prefix ? prefix + '.' + k : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) flatten(v, key, out);
    else out.add(key);
  }
  return out;
}

const data = {};
for (const l of langs) {
  try { data[l] = flatten(load(l), '', new Set()); }
  catch (e) { console.log('FAIL ' + l + ': ' + e.message); }
}

const enKeys = data.en;
console.log('en keys: ' + enKeys.size);
for (const l of langs.slice(1)) {
  if (!data[l]) continue;
  const missing = [...enKeys].filter((k) => !data[l].has(k));
  const extra = [...data[l]].filter((k) => !enKeys.has(k));
  console.log(l + ': keys=' + data[l].size + ' missing=' + missing.length + ' extra=' + extra.length);
  fs.writeFileSync(path.join(__dirname, 'missing-' + l + '.txt'), missing.join('\n'), 'utf8');
}
