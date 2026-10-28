// Rewrite Gallery.tsx: drop note: '...' entries from GALLERY (translations hold them).
const fs = require('fs');
const file = 'C:/Users/sathi/Downloads/vpnreactsource-main/vpnexues-ui/src/pages/marketing/Gallery.tsx';
let src = fs.readFileSync(file, 'utf8');
const before = (src.match(/note: '/g) || []).length;
src = src.replace(/[ \t]*note: '(?:[^'\\]|\\.)*',\r?\n/g, '');
const after = (src.match(/note: '/g) || []).length;
fs.writeFileSync(file, src, 'utf8');
console.log('removed', before - after, 'note fields; remaining', after);
