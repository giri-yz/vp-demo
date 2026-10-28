// Show heuristic English literals with line numbers for given files.
const fs = require('fs');
const files = process.argv.slice(2);
const re = /'([A-Z][a-z][^']{9,})'/g;
for (const f of files) {
  const src = fs.readFileSync(f, 'utf8');
  console.log('===== ' + f);
  src.split('\n').forEach((line, i) => {
    re.lastIndex = 0;
    let m;
    while ((m = re.exec(line))) {
      const s = m[1];
      if (!/[a-z] [a-z]/.test(s)) continue;
      if (/@|https?:|\.css|\.png|\.jpg|svg|font-|console|localStorage/.test(s)) continue;
      console.log('  ' + (i + 1) + ': ' + line.trim().slice(0, 160));
      break;
    }
  });
}
