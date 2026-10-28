// Insert translation keys into a locale .ts file (plain object literal).
// Usage: node addkeys.cjs <lang> <patch1.json> [patch2.json ...] [--dry]
// Patch JSON shape: { "contact.faqGroups": <value>, ... } (flat dotted keys)
const fs = require('fs');
const path = require('path');

const dir = __dirname;
const tdir = path.join(dir, 'translations');

const args = process.argv.slice(2);
const dry = args.includes('--dry');
const rest = args.filter((a) => a !== '--dry');
const lang = rest[0];
const patches = rest.slice(1);
if (!lang || !patches.length) {
  console.error('Usage: node addkeys.cjs <lang> <patch.json> [...] [--dry]');
  process.exit(1);
}

function skipWs(s, i) {
  for (;;) {
    while (i < s.length && (s[i] === ' ' || s[i] === '\t' || s[i] === '\n' || s[i] === '\r')) i++;
    if (s[i] === '/' && s[i + 1] === '/') {
      while (i < s.length && s[i] !== '\n') i++;
      continue;
    }
    if (s[i] === '/' && s[i + 1] === '*') {
      const end = s.indexOf('*/', i + 2);
      i = end === -1 ? s.length : end + 2;
      continue;
    }
    return i;
  }
}

function skipString(s, i) {
  const q = s[i];
  i++;
  while (i < s.length) {
    const c = s[i];
    if (c === '\\') { i += 2; continue; }
    if (q === '`' && c === '$' && s[i + 1] === '{') {
      let depth = 1;
      i += 2;
      while (i < s.length && depth > 0) {
        if (s[i] === '{') depth++;
        else if (s[i] === '}') depth--;
        else if (s[i] === "'" || s[i] === '"') i = skipString(s, i) - 1;
        i++;
      }
      continue;
    }
    if (c === q) return i + 1;
    i++;
  }
  return i;
}

function skipArray(s, i) {
  i++; // [
  let depth = 1;
  while (i < s.length && depth > 0) {
    const c = s[i];
    if (c === "'" || c === '"' || c === '`') i = skipString(s, i);
    else if (c === '[') { depth++; i++; }
    else if (c === ']') { depth--; i++; }
    else if (c === '/' && s[i + 1] === '/') { while (i < s.length && s[i] !== '\n') i++; }
    else if (c === '/' && s[i + 1] === '*') { const e = s.indexOf('*/', i + 2); i = e === -1 ? s.length : e + 2; }
    else i++;
  }
  return i;
}

function skipScalar(s, i) {
  while (i < s.length) {
    const c = s[i];
    if (c === "'" || c === '"' || c === '`') { i = skipString(s, i); continue; }
    if (c === ',' || c === '}' || c === ']') return i;
    if (c === '/' && s[i + 1] === '/') { while (i < s.length && s[i] !== '\n') i++; continue; }
    i++;
  }
  return i;
}

function readKey(s, i) {
  if (s[i] === "'" || s[i] === '"' || s[i] === '`') {
    const start = i + 1;
    const end = skipString(s, i) - 1;
    return { key: s.slice(start, end), next: end + 1 };
  }
  let j = i;
  while (j < s.length && /[A-Za-z0-9_$\-\u0080-\uFFFF]/.test(s[j])) j++;
  return { key: s.slice(i, j), next: j };
}

// Walk the root object. Records every key path (leaf+branch) and, for object
// values, the index of the matching closing '}'.
function parseObject(s, i, prefix, ctx) {
  i++; // consume '{'
  ctx.objPaths.set(prefix, { open: i - 1 });
  for (;;) {
    i = skipWs(s, i);
    if (i >= s.length) break;
    if (s[i] === '}') {
      ctx.objPaths.get(prefix).close = i;
      return i + 1;
    }
    const { key, next } = readKey(s, i);
    i = skipWs(s, next);
    if (s[i] !== ':') throw new Error('expected : at ' + i + ' near ' + s.slice(i - 40, i + 40));
    i = skipWs(s, i + 1);
    const full = prefix ? prefix + '.' + key : key;
    const c = s[i];
    if (c === '{') {
      i = parseObject(s, i, full, ctx);
    } else if (c === '[') {
      i = skipArray(s, i);
      ctx.paths.add(full);
    } else {
      i = skipScalar(s, i);
      ctx.paths.add(full);
    }
    i = skipWs(s, i);
    if (s[i] === ',') i++;
  }
  ctx.objPaths.get(prefix).close = i;
  return i;
}

function serialize(v, indent) {
  if (typeof v === 'string') return JSON.stringify(v);
  if (v === null || typeof v !== 'object') return JSON.stringify(v);
  const js = JSON.stringify(v, null, 2);
  return js
    .split('\n')
    .map((ln, idx) => (idx === 0 ? ln : indent + ln))
    .join('\n');
}

const file = path.join(tdir, lang + '.ts');
let src = fs.readFileSync(file, 'utf8');
const open = src.indexOf('{');
if (open < 0) throw new Error('no object start found');

const ctx = { paths: new Set(), objPaths: new Map() };
parseObject(src, open, '', ctx);

// Load patches
const entries = [];
for (const p of patches) {
  const obj = JSON.parse(fs.readFileSync(p, 'utf8'));
  for (const [k, v] of Object.entries(obj)) entries.push([k, v]);
}

function reparse() {
  ctx.paths = new Set();
  ctx.objPaths = new Map();
  parseObject(src, src.indexOf('{'), '', ctx);
}

let added = 0;
const skipped = [];
for (const [key, value] of entries) {
  if (ctx.paths.has(key)) { skipped.push(key); continue; }
  const segs = key.split('.');
  const parentPath = segs.slice(0, -1).join('.');
  const leaf = segs[segs.length - 1];
  const parent = ctx.objPaths.get(parentPath);
  if (!parent || parent.close === undefined) {
    console.error('MISSING PARENT BLOCK: ' + key + ' (parent "' + parentPath + '")');
    process.exit(2);
  }
  const close = parent.close;
  const lineStart = src.lastIndexOf('\n', close - 1) + 1;
  const closeIndent = /^[ \t]*/.exec(src.slice(lineStart, close))[0];
  const childIndent = closeIndent + '  ';
  const serialized = serialize(value, childIndent);
  const chunk = `${childIndent}${leaf}: ${serialized},\n`;

  // Ensure the previous entry has a trailing comma (files keep trailing commas).
  const before = src.slice(0, lineStart);
  const trimmedBefore = before.replace(/\s+$/, '');
  const lastChar = trimmedBefore[trimmedBefore.length - 1];
  if (lastChar !== ',' && lastChar !== '{' && trimmedBefore.length > 0) {
    src = trimmedBefore + ',' + src.slice(trimmedBefore.length);
    reparse();
    const p = ctx.objPaths.get(parentPath);
    const ls = src.lastIndexOf('\n', p.close - 1) + 1;
    src = src.slice(0, ls) + chunk + src.slice(ls);
  } else {
    src = src.slice(0, lineStart) + chunk + src.slice(lineStart);
  }
  added++;
  reparse();
}

if (dry) {
  console.log(`[dry] ${lang}: would add ${added}, already present ${skipped.length}`);
} else {
  fs.writeFileSync(file, src, 'utf8');
  console.log(`${lang}: added ${added}, already present ${skipped.length}`);
}
