// Dumps English source values for every key listed in missing-*.txt (union) as JSON.
const fs = require('fs');
const path = require('path');

const dir = __dirname;
const tdir = path.join(dir, 'translations');

function load(lang) {
  let src = fs.readFileSync(path.join(tdir, lang + '.ts'), 'utf8');
  src = src.replace(new RegExp('^export const ' + lang + ' ='), 'module.exports =');
  src = src.replace(/\}\s*as\s*const\s*;?\s*$/, '};');
  const tmp = path.join(dir, lang + '.cjs');
  fs.writeFileSync(tmp, src, 'utf8');
  delete require.cache[require.resolve(tmp)];
  return require(tmp);
}

const enObj = load('en');

const keyFiles = fs.readdirSync(dir).filter((f) => /^missing-.*\.txt$/.test(f));
const keys = new Set();
for (const kf of keyFiles) {
  for (const line of fs.readFileSync(path.join(dir, kf), 'utf8').split(/\r?\n/)) {
    if (line.trim()) keys.add(line.trim());
  }
}

const get = (obj, dotPath) =>
  dotPath.split('.').reduce((o, k) => (o == null ? undefined : o[k]), obj);

const out = {};
const notFound = [];
for (const k of [...keys].sort()) {
  const v = get(enObj, k);
  if (v === undefined) notFound.push(k);
  else out[k] = v;
}
fs.writeFileSync(path.join(dir, 'en-missing.json'), JSON.stringify(out, null, 2), 'utf8');
console.log('dumped ' + Object.keys(out).length + ' keys; notFound: ' + notFound.length + ' ' + notFound.join(','));
