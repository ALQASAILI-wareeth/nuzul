// Honest-wording check (no browser needed): NUZUL shows no prices, so the pages must not promise
// a best price, a price comparison done by NUZUL itself, or free cancellation it cannot verify.
// Usage: node tests/wording.js [folder]      (default folder: the repository root)
const fs = require('fs');
const path = require('path');
const root = path.resolve(process.argv[2] || path.join(__dirname, '..'));
// Phrases retired on 24 Nov 2026 with the owner's approved replacements.
const BANNED = [
  'أفضل سعر', 'بأفضل الأسعار', 'قارن أسعار الفنادق', 'أسعار شفافة', "cmp:'قارن الأسعار", "cheaperB:'💲 سعر أوفر'",
  'إلغاء مجاني لمعظم الحجوزات', 'معظم الغرف تتيح الإلغاء المجاني',
  'best price', 'Compare hotel prices', 'Transparent prices', "cmp:'Compare prices", 'Most rooms offer free cancellation'
];
const REQUIRED = [
  ['index.html', '<title>نُزُل — اختر فندقك وقارن بين مواقع الحجز</title>'],
  ['index.html', 'قارن مواقع الحجز<br>'], ['index.html', '✔ بدون رسوم من عندنا'],
  ['index.html', 'content="نُزُل — قارن مواقع حجز الفنادق واحجز بثقة"'],
  ['index.html', 'ابحث مرة وحدة وقارن بين أشهر مواقع الحجز، بدون رسوم من عندنا.'],
  ['index.html', 'وشروط كل غرفة تظهر لك في موقع الحجز قبل الدفع.'],
  ['index.html', 'Compare booking sites<br>'], ['index.html', '✔ No fees from us'],
  ['index.html', 'The terms of each room are shown on the booking site before you pay.'],
  ['index.html', 'https://nuzultravel.com/og.png?v=20261124'],
  ['results.html', '<title>نُزُل — قارن مواقع حجز الفنادق</title>'],
  ['results.html', "cmp:'شوف الأسعار ←'"], ['results.html', "cmp:'See prices →'"], ['results.html', "cheaperB:'💲 اقتصادي'"],
  ['manifest.webmanifest', '"name": "نُزُل — قارن مواقع حجز الفنادق"']
];
const FILES = ['index.html', 'results.html', 'manifest.webmanifest'];
let pass = 0; const fails = [];
const read = f => fs.readFileSync(path.join(root, f), 'utf8');
for (const f of FILES) {
  const s = read(f);
  for (const b of BANNED) { if (s.includes(b)) fails.push(f + ' still contains retired wording: ' + b); else pass++; }
}
for (const [f, r] of REQUIRED) { if (read(f).includes(r)) pass++; else fails.push(f + ' is missing approved wording: ' + r); }
// Customer contact is by email only (owner decision, 24 Nov 2026): no WhatsApp chat link or phone number in the pages.
for (const f of ['index.html', 'results.html', 'privacy.html', 'home.js', 'business.js']) {
  const s = read(f);
  if (/wa\.me\/|971504113342/.test(s)) fails.push(f + ' still contains a WhatsApp chat link or the phone number'); else pass++;
}
if (read('results.html').includes('id="mailBtn" href="mailto:info@nuzultravel.com"')) pass++; else fails.push('results.html: email contact button missing');
try { JSON.parse(read('manifest.webmanifest')); pass++; } catch (e) { fails.push('manifest.webmanifest is not valid JSON'); }
if (fs.existsSync(path.join(root, 'og.png')) && fs.statSync(path.join(root, 'og.png')).size > 20000) pass++; else fails.push('og.png missing or too small');
// Marketing sources are not part of the published site, so they are checked only where they exist (the repository):
// the ending texts of the videos follow the same rule as the pages.
let extra = 0;
for (const f of ['studio/scripts/videos.json', 'studio/scripts/overlays.py']) {
  if (!fs.existsSync(path.join(root, f))) continue;
  const s = read(f);
  for (const b of ['أفضل سعر', 'بأفضل الأسعار', 'قارن الأسعار واحجز']) {
    extra++;
    if (s.includes(b)) fails.push(f + ' still contains retired wording: ' + b); else pass++;
  }
}
fails.forEach(x => console.log('FAIL', x));
console.log('total', FILES.length * BANNED.length + REQUIRED.length + 2 + 6 + extra, 'pass', pass);
if (fails.length) process.exitCode = 1;
