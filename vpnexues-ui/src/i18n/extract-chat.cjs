// Extracts static data blocks from source files into en.ts patch JSON.
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const root = path.resolve(__dirname, '..', '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8').replace(/\r\n/g, '\n');

function block(src, startMarker, endMarker) {
  const i = src.indexOf(startMarker);
  if (i < 0) throw new Error('start not found: ' + startMarker);
  const j = src.indexOf(endMarker, i);
  if (j < 0) throw new Error('end not found: ' + endMarker);
  return src.slice(i + startMarker.length, j);
}

function evalLiteral(text) {
  // eslint-disable-next-line no-new-func
  return new Function('return (' + text + ')')();
}

const patch = {};

// 1. ChatPanel: ANSWERS -> chat.answers
const chatSrc = read('src/components/common/ChatPanel.tsx');
const answers = evalLiteral('{' + block(chatSrc, 'const ANSWERS: Record<string, string> = {', '\n};\n') + '\n}');
patch['chat.answers'] = answers;

// 2. ChatPanel: TOPIC_CATEGORIES -> topicTitles + topicLabels
const topics = evalLiteral('[' + block(chatSrc, 'const TOPIC_CATEGORIES = [', '\n];\n') + '\n]');
const topicTitles = {};
const topicLabels = {};
for (const cat of topics) {
  topicTitles[cat.title] = cat.title;
  for (const item of cat.items) topicLabels[item.q] = item.label;
}
patch['chat.topicTitles'] = topicTitles;
patch['chat.topicLabels'] = topicLabels;

// 3. ChatPanel: MAIN_OPTIONS -> chat.main.<key>
const mains = evalLiteral('[' + block(chatSrc, 'const MAIN_OPTIONS = [', '\n];\n') + '\n]');
const chatMain = {};
for (const m of mains) chatMain[m.key] = m.label;
patch['chat.main'] = chatMain;

// 4. chatData: SUGGESTION_ANSWERS -> chat.sugg.<slug> (label -> answer)
const SUGGESTION_SLUGS = {
  'Free delivery on all subscription plans': 'freeDeliverySubs',
  'Same-day delivery in select cities': 'sameDayDelivery',
  'Track your delivery in real-time': 'trackDeliveryLive',
  'Flexible scheduling \u2014 choose your delivery day': 'flexibleScheduling',
  'Eco-friendly packaging \u2014 zero plastic': 'ecoPackaging',
  'Credit & Debit Cards (Visa, Mastercard, AMEX)': 'cardsAccepted',
  'UPI (Google Pay, PhonePe, Paytm)': 'upiApps',
  'Net Banking': 'netBankingSugg',
  'Digital Wallets': 'digitalWallets',
  'All transactions are secure & encrypted': 'secureEncrypted',
  'Fresh produce returns accepted within 24 hours of delivery if damaged': 'freshReturns24h',
  'Refund processed within 3-5 business days': 'refund3to5',
  'Damaged or wrong item? Share photo via support for instant replacement': 'damagedPhotoSupport',
  'Subscription can be paused or cancelled anytime \u2014 no penalty': 'subPauseCancel',
  'Bulk orders for restaurants, hotels & retailers': 'b2bBulkOrders',
  'Minimum order: 50kg per delivery': 'b2bMin50kg',
  'Custom packaging with your brand label': 'b2bCustomPack',
  'Dedicated account manager for your business': 'b2bAccountManager',
  'Export documentation & logistics handled': 'b2bExportDocs',
  'Call Us: +91 9943994603 | +91 8148197842': 'contactCall',
  'Email: support@vpnexues.com': 'contactEmail',
  'WhatsApp: +91 9943994603': 'contactWhatsApp',
  'Singapore: 412 Race Course Road, Singapore 218660': 'contactSingapore',
  'India: Siva Towers, Salem, Tamil Nadu 636004': 'contactIndia',
};
const chatDataSrc = read('src/components/common/chatData.ts');
const suggAnswers = evalLiteral('{' + block(chatDataSrc, 'export const SUGGESTION_ANSWERS: Record<string, string> = {', '\n};\n') + '\n}');
const chatSugg = {};
const suggSlugList = {};
for (const [label, answer] of Object.entries(suggAnswers)) {
  const slug = SUGGESTION_SLUGS[label];
  if (!slug) throw new Error('no slug for suggestion label: ' + label);
  chatSugg[slug] = answer;
  suggSlugList[slug] = label;
}
patch['chat.sugg'] = chatSugg;

// 5. AvoidJunk CARDS -> avoidJunk.cards.<id> (copy fields only)
const junkSrc = read('src/components/common/AvoidJunk.tsx');
const cards = evalLiteral('[' + block(junkSrc, 'const CARDS: BadCard[] = [', '\n];\n') + '\n]');
const junkCards = {};
for (const c of cards) {
  junkCards[c.id] = {
    title: c.title,
    desc: c.desc,
    chips: c.chips,
    backBrand: c.backBrand,
    backHeading: c.backHeading,
    backAccent: c.backAccent,
    backDesc: c.backDesc,
    points: c.points,
    ctaLabel: c.ctaLabel,
  };
}
patch['avoidJunk'] = { cards: junkCards };

// 6. Testimonial fallback + extra quotes
const testiSrc = read('src/pages/marketing/Testimonial.tsx');
const fb = evalLiteral('[' + block(testiSrc, 'const FALLBACK_TESTIMONIALS: TestimonialType[] = [', '\n];\n') + '\n]');
const fallback = {};
for (const item of fb) {
  fallback[item.id] = { quote: item.quote, role: item.role, location: item.location };
}
patch['testimonial.fallback'] = fallback;
const extra = evalLiteral('{' + block(testiSrc, 'const EXTRA_QUOTE_BY_NAME: Record<string, string> = {', '\n};\n') + '\n}');
patch['testimonial.extraQuotes'] = extra;

// 7. B2B TESTIMONIALS -> b2b.testimonials.<initials> (read from git HEAD — the
//    working-tree copy has already had quote/role stripped for i18n)
let b2bSrc;
try {
  b2bSrc = execSync('git show HEAD:vpnexues-ui/src/pages/pricing/B2B.tsx', { cwd: path.resolve(root, '..'), encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 });
} catch (e) {
  b2bSrc = read('src/pages/pricing/B2B.tsx');
}
const b2bTesti = evalLiteral('[' + block(b2bSrc, 'const TESTIMONIALS = [', '\n];\n') + '\n]');
const b2bMap = {};
for (const item of b2bTesti) b2bMap[item.initials] = { quote: item.quote, role: item.role };
patch['b2b.testimonials'] = b2bMap;

// Guard: extracted copy must not be empty
for (const [k, v] of Object.entries(b2bMap)) {
  if (!v.quote && !v.role) throw new Error('B2B testimonials empty for ' + k);
}

const out = path.resolve(__dirname, 'patch-en-chatdata.json');
fs.writeFileSync(out, JSON.stringify(patch, null, 2) + '\n');
console.log('wrote', out);
console.log('keys:', Object.keys(patch).join(', '));
console.log('counts:', Object.entries(patch).map(([k, v]) => k + '=' + Object.keys(v).length).join(', '));
