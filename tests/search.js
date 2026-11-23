// Search understanding test: typed text on the home page -> what the results page shows.
// Usage: PUPPETEER=<path to puppeteer-core> CHROME=<chrome binary> BASE=http://localhost:8765 node tests/search.js
const p = require(process.env.PUPPETEER || 'puppeteer-core');
const BASE = process.env.BASE || 'http://localhost:8765';
// [typed, expectation]  city:<Arabic list title contains> | country:<n chips> | hotel (sheet opens) | hotels (several chips) | mean:<chip> | none
const CASES = [
  ['دبي','city:دبي'],['دبى','city:دبي'],['Dubai','city:دبي'],['DUBAI','city:دبي'],['فنادق دبي','city:دبي'],
  ['مكة','city:الحرم'],['مكه','city:الحرم'],['مكه المكرمه','city:الحرم'],['Mecca','city:الحرم'],
  ['أبوظبي','city:أبوظبي'],['ابوظبي','city:أبوظبي'],['أبو ظبي','city:أبوظبي'],['ابو ظبي','city:أبوظبي'],['abudhabi','city:أبوظبي'],
  ['اسطنبول','city:إسطنبول'],['استانبول','city:إسطنبول'],['القاهره','city:القاهرة'],['جده','city:جدة'],
  ['كوالا لمبور','city:كوالالمبور'],['صلاله','city:صلالة'],['ترابزون','city:طرابزون'],['NYC','city:نيويورك'],['Hotels in Paris','city:باريس'],
  ['المغرب','country:1'],['Morocco','country:1'],['تركيا','country:2'],['Turkey','country:2'],['مصر','country:2'],['السعودية','country:4'],['تايلند','country:2'],['UK','country:1'],['امريكا','country:3'],['عُمان','country:2'],
  ['Atlantis The Palm','hotel'],['العنوان داون تاون','hotel'],['Address Downtown','hotel'],['Fairmont Makkah','hotel'],['فيرمونت مكة','hotel'],
  ['هيلتون','hotels'],['Rove','hotels'],['Hilton Makkah','hotels'],
  ['Dubay','mean:دبي'],['Dubia','mean:دبي'],['istambul','mean:إسطنبول'],['عمان','mean:عمّان'],
  ['Zzzland','none'],['١٢٣','none'],['Zurich','none']
];
(async () => {
  const b = await p.launch({executablePath: process.env.CHROME || '/usr/bin/google-chrome', args: ['--no-sandbox']});
  const pg = await b.newPage(); await pg.setViewport({width: 390, height: 844, isMobile: true});
  await pg.setRequestInterception(true);
  pg.on('request', r => r.url().startsWith(BASE) ? r.continue() : r.abort());
  let pass = 0; const fails = [];
  for (const [typed, exp] of CASES) {
    await pg.goto(BASE + '/', {waitUntil: 'domcontentloaded'});
    await pg.evaluate(v => { const d = document.getElementById('dest'); d.value = v; d.dispatchEvent(new Event('input', {bubbles: true})); }, typed);
    const href = await pg.evaluate(() => document.getElementById('go').getAttribute('href'));
    await pg.goto(BASE + href, {waitUntil: 'domcontentloaded'}); await new Promise(r => setTimeout(r, 900));
    const r = await pg.evaluate(() => { const q = document.getElementById('qnote'); return {
      title: document.getElementById('hsTitle').textContent, rows: document.querySelectorAll('#hl > .hc').length,
      note: q && !q.hidden ? q.querySelector('p').textContent : '', chips: q && !q.hidden ? [...q.querySelectorAll('.qc')].map(a => a.textContent) : [],
      sheet: !!document.querySelector('.sheet.on,#sheet.on,.sh.on') }; });
    const [kind, arg] = exp.split(':'); let ok = false;
    if (kind === 'city') ok = r.title.includes(arg) && !r.note && !r.sheet;
    if (kind === 'country') ok = r.chips.length === +arg && /قوائم/.test(r.note);
    if (kind === 'hotel') ok = r.sheet && !r.note;
    if (kind === 'hotels') ok = r.chips.length >= 2 && /تطابق/.test(r.note);
    if (kind === 'mean') ok = /هل تقصد/.test(r.note) && r.chips.includes(arg);
    if (kind === 'none') ok = /ما عندنا/.test(r.note) && r.chips.length === 6;
    if (ok) pass++; else fails.push(typed + ' => expected ' + exp + ' got ' + JSON.stringify(r).slice(0, 200));
  }
  // home list and shared index must list the same 48 cities
  await pg.goto(BASE + '/', {waitUntil: 'domcontentloaded'});
  const same = await pg.evaluate(() => { const a = [...document.querySelectorAll('#cities option')].map(o => o.value).sort().join('|'); const b = NZ_SEARCH.RAW.map(r => r[0]).sort().join('|'); return a === b && NZ_SEARCH.RAW.length; });
  if (same === 48) pass++; else fails.push('home city list and search index differ: ' + same);
  // suggestions + Enter key
  await pg.type('#dest', 'مكه'); await new Promise(r => setTimeout(r, 200));
  const sg = await pg.evaluate(() => [...document.querySelectorAll('#sg .sgi b')].map(x => x.textContent));
  if (sg[0] === 'مكة المكرمة') pass++; else fails.push('suggestions for مكه: ' + JSON.stringify(sg));
  await Promise.all([pg.waitForNavigation({timeout: 5000}).catch(() => {}), pg.keyboard.press('Enter')]);
  if (/results\.html\?d=Makkah/.test(pg.url())) pass++; else fails.push('Enter key did not search: ' + pg.url());
  fails.forEach(f => console.log('FAIL', f));
  console.log('total', CASES.length + 3, 'pass', pass);
  await b.close(); if (fails.length) process.exitCode = 1;
})();
