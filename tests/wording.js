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
try { JSON.parse(read('manifest.webmanifest')); pass++; } catch (e) { fails.push('manifest.webmanifest is not valid JSON'); }
if (fs.existsSync(path.join(root, 'og.png')) && fs.statSync(path.join(root, 'og.png')).size > 20000) pass++; else fails.push('og.png missing or too small');
fails.forEach(x => console.log('FAIL', x));
console.log('total', FILES.length * BANNED.length + REQUIRED.length + 2, 'pass', pass);
if (fails.length) process.exitCode = 1;
