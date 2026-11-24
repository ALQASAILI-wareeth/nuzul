// Honest-wording check (no browser needed): NUZUL shows no prices, so the pages must not promise
// a best price or a price comparison done by NUZUL itself.
// Usage: node tests/wording.js        (run from the repository root)
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
// Phrases retired on 24 Nov 2026 with the owner's approved replacements.
const BANNED = [
  'احجز فندقك بأفضل سعر', 'قارن أسعار الفنادق<br>', 'أسعار شفافة', "cmp:'قارن الأسعار",
  'Book your hotel at the best price', 'Compare hotel prices<br>', 'Transparent prices', "cmp:'Compare prices"
];
const REQUIRED = [
  ['index.html', 'نُزُل — اختر فندقك وقارن بين مواقع الحجز'], ['index.html', 'قارن مواقع الحجز<br>'], ['index.html', '✔ بدون رسوم من عندنا'],
  ['index.html', 'Compare booking sites<br>'], ['index.html', '✔ No fees from us'],
  ['results.html', "cmp:'شوف الأسعار ←'"], ['results.html', "cmp:'See prices →'"]
];
const FILES = ['index.html', 'results.html'];
let pass = 0; const fails = [];
for (const f of FILES) {
  const s = fs.readFileSync(path.join(root, f), 'utf8');
  for (const b of BANNED) { if (s.includes(b)) fails.push(f + ' still contains retired wording: ' + b); else pass++; }
}
for (const [f, r] of REQUIRED) {
  const s = fs.readFileSync(path.join(root, f), 'utf8');
  if (s.includes(r)) pass++; else fails.push(f + ' is missing approved wording: ' + r);
}
fails.forEach(x => console.log('FAIL', x));
console.log('total', FILES.length * BANNED.length + REQUIRED.length, 'pass', pass);
if (fails.length) process.exitCode = 1;
