// Extract ARTICLES from BlogDetail.tsx → patch JSON (newsPosts.articleDetails).
const fs = require('fs');
const src = fs.readFileSync('C:/Users/sathi/Downloads/vpnreactsource-main/vpnexues-ui/src/pages/marketing/BlogDetail.tsx', 'utf8');
const start = src.indexOf('const ARTICLES');
const eq = src.indexOf('= {', start);
const open = eq + 1;
let i = open, depth = 0, q = null;
for (; i < src.length; i++) {
  const c = src[i];
  if (q) {
    if (c === '\\') { i++; continue; }
    if (c === q) q = null;
    continue;
  }
  if (c === "'" || c === '"' || c === '`') { q = c; continue; }
  if (c === '{') depth++;
  else if (c === '}') { depth--; if (depth === 0) break; }
}
const ARTICLES = eval('(' + src.slice(open, i + 1) + ')');

const details = Object.keys(ARTICLES).sort().map((k) => {
  const a = ARTICLES[k];
  return {
    readTime: a.readTime,
    dateDisplay: a.dateDisplay,
    authorRole: a.authorRole,
    content: a.content,
    subheadings: a.subheadings,
    checkList: a.checkList,
    quote: a.quote,
    commentDates: a.commentList.map((c) => c.date),
    commentTexts: a.commentList.map((c) => c.text),
  };
});
const patch = { 'newsPosts.articleDetails': details };
fs.writeFileSync('C:/Users/sathi/Downloads/vpnreactsource-main/vpnexues-ui/src/i18n/patch-en-blog.json', JSON.stringify(patch, null, 2) + '\n', 'utf8');
console.log('articles:', details.length, 'key: newsPosts.articleDetails');
