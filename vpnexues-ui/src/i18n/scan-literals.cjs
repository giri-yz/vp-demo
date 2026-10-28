// Scan customer-facing TSX for long single-quoted English literals (heuristic).
const fs = require('fs');
const path = require('path');
const root = 'C:/Users/sathi/Downloads/vpnreactsource-main/vpnexues-ui/src';
const skip = /\\admin\\|LiveChat|SimpleFooter|WhyChoose|RequireAdminAuth|SubXxx|ChatTranscripts/;
const re = /'([A-Z][a-z][^']{9,})'/g;
const results = [];
function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) { walk(p); continue; }
    if (!e.name.endsWith('.tsx')) continue;
    if (skip.test(p)) continue;
    const src = fs.readFileSync(p, 'utf8');
    const hasI18n = /useLanguage/.test(src);
    let m; let n = 0;
    while ((m = re.exec(src))) {
      const s = m[1];
      // skip likely non-UI: paths, emails, class names, SVG, URLs, dates, SQL
      if (/^[A-Za-z]+ [A-Za-z]+ [A-Za-z]+ [A-Za-z]+$/.test(s) === false && !/[a-z] [a-z]/.test(s)) continue;
      if (/@|https?:|\.css|\.png|\.jpg|svg|font-|margin|padding|translate|Failed to|Error|error|Exception|console|localStorage|window\.|document\./.test(s)) continue;
      n++;
    }
    if (n > 0) results.push({ file: path.relative(root, p), count: n, hasI18n });
  }
}
walk(root);
results.sort((a, b) => b.count - a.count);
for (const r of results) console.log(`${r.count}\t${r.hasI18n ? 'i18n' : '----'}\t${r.file}`);
