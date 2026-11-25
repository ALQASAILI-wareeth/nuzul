// نُزُل — اختبارات البيانات المحفوظة في المتصفح لما تكون تالفة أو معدّلة (انحدار F-2 و F-4)
// آخر بحث (nuzul_last)، المفضلة (nuzul_favs)، عدّاد الزيارات، اللغة، وحالة «التخزين مقفول»
// التشغيل: BASE=http://localhost:8765 node tests/storage.js
const p = require(process.env.PUPPETEER || 'puppeteer-core');
const B = process.env.BASE || 'http://localhost:8765';
const sleep = ms => new Promise(r => setTimeout(r, ms));
const out = []; const ok = (n, c, x) => out.push((c ? 'PASS ' : 'FAIL ') + n + (x ? ' :: ' + x : ''));
const H = { 'access-control-allow-origin': '*', 'content-type': 'application/json' };
const IMG = '<img src=x data-zz onerror="window.__x=1">';
const pad = n => String(n).padStart(2, '0');
const ymd = d => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
const inDays = k => { const d = new Date(); d.setDate(d.getDate() + k); return ymd(d); };
const J = JSON.stringify;
const FUT = [inDays(20), inDays(23)];
const realDate = s => { if (!/^\d{4}-\d\d-\d\d$/.test(s || '')) return false; const a = s.split('-').map(Number), d = new Date(a[0], a[1] - 1, a[2], 12); return ymd(d) === s; };
const HOTEL = { id: 'dubai|address downtown', city: 'dubai', d: 'Dubai', cityAr: 'دبي', n: 'Address Downtown', ar: 'العنوان داون تاون', ts: 1 };
const HOTEL2 = { id: 'dubai|atlantis the palm', city: 'dubai', d: 'Dubai', cityAr: 'دبي', n: 'Atlantis The Palm', ar: '', ts: 2 };

(async () => {
  const b = await p.launch({ executablePath: process.env.CHROME || '/usr/bin/google-chrome', args: ['--no-sandbox'] });
  async function page(init) {
    const cx = await (b.createBrowserContext ? b.createBrowserContext() : b.createIncognitoBrowserContext());
    const pg = await cx.newPage(); pg._e = []; pg._dlg = 0;
    pg.on('pageerror', e => pg._e.push(String(e.message).split('\n')[0].slice(0, 70))); pg.on('dialog', d => { pg._dlg = 1; d.dismiss(); });
    if (init) await pg.evaluateOnNewDocument(init);
    await pg.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
    await pg.setRequestInterception(true);
    pg.on('request', r => { let h = ''; try { h = new URL(r.url()).hostname; } catch (e) {}
      if (/(^|\.)wikipedia\.org$/.test(h) || (h === 'commons.wikimedia.org' && /\/w\/api/.test(r.url()))) return r.respond({ status: 200, headers: H, body: '{"query":{"pages":{}}}' });
      if (/wikimedia\.org$|cloudflareinsights\.com$|fonts\.googleapis\.com$|fonts\.gstatic\.com$/.test(h)) return r.abort();
      r.continue(); });
    return pg;
  }
  // نحط القيم الخام في التخزين (نص كما هو)، نعيد التحميل، ونرجّع حالة الصفحة الرئيسية
  async function home(pg, store) {
    const e0 = pg._e.length;
    await pg.evaluate(store => { localStorage.clear(); sessionStorage.clear(); Object.keys(store).forEach(k => localStorage.setItem(k, store[k])); window.__x = 0; }, store);
    await pg.reload({ waitUntil: 'networkidle2' }); await sleep(350);
    const s = await pg.evaluate(() => { const $ = id => document.getElementById(id);
      const last = document.querySelector('#nzkeep .c.last'), a = last ? last.querySelector('a.go') : null, q = a ? new URLSearchParams(a.getAttribute('href').split('?')[1]) : null;
      $('dest').value = 'Dubai'; $('dest').dispatchEvent(new Event('input', { bubbles: true }));
      return { x: window.__x === 1, inj: document.querySelectorAll('[data-zz]').length, form: !!$('dest'), cities: document.querySelectorAll('#grid .city').length,
        search: ($('go').getAttribute('href') || '').indexOf('/results.html?d=Dubai') === 0, box: !!$('nzkeep'), last: !!last,
        text: last ? last.querySelector('span').textContent : '', name: last ? last.querySelector('b').textContent : '',
        link: q ? { d: q.get('d'), ci: q.get('ci'), co: q.get('co'), a: q.get('a'), r: q.get('r') } : null,
        favs: document.querySelectorAll('#nzkeep [data-rm]').length, favNames: [...document.querySelectorAll('#nzkeep .c:not(.last) b')].map(x => x.textContent),
        polluted: ({}).polluted !== undefined, lang: document.documentElement.lang }; });
    s.err = pg._e.slice(e0); s.dlg = pg._dlg; return s;
  }
  // الصفحة سليمة: بدون خطأ سكربت، بدون تنفيذ أو حقن، والبحث شغّال
  const sound = s => { const why = []; if (s.err.length) why.push('script error: ' + s.err[0]); if (s.x || s.dlg) why.push('script executed'); if (s.inj) why.push('markup injected');
    if (!s.form || s.cities < 8 || !s.search) why.push('home page not working (cities=' + s.cities + ' search=' + s.search + ')'); if (s.polluted) why.push('prototype polluted'); return why; };
  // صندوق «كمّل من وين وقفت» معقول: عدد البالغين 1–10، ليالي ≥ 1، تواريخ حقيقية والمغادرة بعد الوصول
  const sane = s => { const why = []; if (!s.last || !s.link) return ['box missing'];
    const ad = (s.text.match(/(\d+) adults?/) || [])[1], ni = (s.text.match(/(\d+) nights?/) || [])[1];
    if (!(+ad >= 1 && +ad <= 10) || String(+ad) !== ad) why.push('adults shown as "' + (ad || s.text.slice(-25)) + '"');
    if (!(+ni >= 1)) why.push('nights shown wrong'); if (/Invalid|NaN|undefined|null|object/i.test(s.text)) why.push('bad text: ' + s.text.slice(0, 40));
    if (!/^(?:[1-9]|10)$/.test(s.link.a)) why.push('link adults=' + s.link.a); if (!/^[1-5]$/.test(s.link.r)) why.push('link rooms=' + s.link.r);
    if (!realDate(s.link.ci) || !realDate(s.link.co) || !(s.link.co > s.link.ci)) why.push('link dates ' + s.link.ci + '>' + s.link.co); return why; };
  const group = async (pg, title, cases, check) => { const fails = [];
    for (const [label, store] of cases) { const s = await home(pg, store); const why = sound(s).concat(check ? check(s, label) : []); if (why.length) fails.push(label + ' → ' + why[0]); }
    ok(title + ' (' + cases.length + ' cases)', fails.length === 0, fails.length ? fails.length + ' wrong, e.g. ' + fails[0] : ''); };
  const last = o => ({ nuzul_last: J(Object.assign({ d: 'Dubai', n: '', name: 'Dubai', ci: FUT[0], co: FUT[1], a: 2, r: 1, ts: 1 }, o)) });

  const part = async (name, fn) => { try { await fn(); } catch (e) { ok(name + ' | checks could run to the end', false, String(e.message).split('\n')[0].slice(0, 110)); } };
  await part('home page', async () => { const pg = await page(); await pg.goto(B + '/#en', { waitUntil: 'networkidle2' }); await sleep(300);
    // ---- آخر بحث ----
    await group(pg, 'saved search | not a usable record: ignored, no box, page works', [
      ['broken JSON', { nuzul_last: '{bad json' }], ['null', { nuzul_last: 'null' }], ['a plain string', { nuzul_last: J('text') }], ['a number', { nuzul_last: '123' }], ['true', { nuzul_last: 'true' }],
      ['an empty list', { nuzul_last: '[]' }], ['a list', { nuzul_last: '[1,2,3]' }], ['an empty record', { nuzul_last: '{}' }], ['destination is a number', { nuzul_last: J({ d: 123 }) }],
      ['destination is null', { nuzul_last: J({ d: null, n: 'x' }) }], ['destination is only spaces', { nuzul_last: J({ d: '   ' }) }], ['destination is a list', { nuzul_last: J({ d: ['Dubai'], n: { a: 1 }, name: 5 }) }],
      ['destination is a record', { nuzul_last: J({ d: { toString: 'x' } }) }], ['empty text', { nuzul_last: '' }]
    ], s => s.last ? ['a box was shown'] : []);
    await group(pg, 'saved search | only a destination: box shown with default guests and fresh dates', [['destination only', { nuzul_last: J({ d: 'Dubai' }) }]],
      s => sane(s).concat(s.link && (s.link.a !== '2' || s.link.r !== '1' || s.link.ci !== inDays(1) || s.link.co !== inDays(4)) ? ['defaults wrong: ' + J(s.link)] : []));
    await group(pg, 'saved search | adults and rooms saved as text numbers are understood, dates in the future are kept', [['"3" adults, "2" rooms', last({ a: '3', r: '2' })]],
      s => sane(s).concat(s.link && (s.link.a !== '3' || s.link.r !== '2' || s.link.ci !== FUT[0] || s.link.co !== FUT[1] || !/3 adults/.test(s.text)) ? ['got ' + J(s.link) + ' ' + s.text] : []));
    await group(pg, 'saved search | adults is not a sensible number: shown and linked as a whole number from 1 to 10',
      [0, -5, 99, 2.7, '1e9', null, true, [5], { x: 1 }, 'abc', '', 'Infinity', IMG, '3' + IMG, '"><svg data-zz onload="window.__x=1">', '7 adults'].map(v => ['adults=' + J(v).slice(0, 24), last({ a: v })]), sane);
    await group(pg, 'saved search | rooms is not a sensible number: linked as a whole number from 1 to 5',
      [0, -1, 99, 1.5, 'abc', [], {}, null, IMG, '2' + IMG].map(v => ['rooms=' + J(v).slice(0, 24), last({ r: v })]), sane);
    await group(pg, 'saved search | dates are not real dates: replaced by fresh valid dates, nothing odd is shown',
      [[5, 6], [null, null], ['x', 'y'], ['2031-13-45', '2031-13-50'], ['2031-02-30', '2031-03-02'], ['2031-06-31', '2031-07-02'], [{ y: 1 }, [2]], ['9999' + IMG, '9999z' + IMG],
        ['2031-05-10T00:00', '2031-05-12'], ['2031-5-1', '2031-5-3'], [FUT[1], FUT[0]], [FUT[0], FUT[0]], ['0000-00-00', '0000-00-01'], ['', '']
      ].map(v => ['dates=' + J(v).slice(0, 34), last({ ci: v[0], co: v[1] })]), sane);
    await group(pg, 'saved search | text fields carry markup, half characters or 100,000 letters: shown as text, page works', [
      ['markup in every text field', last({ d: IMG, n: IMG, name: IMG })], ['half a character', { nuzul_last: '{"d":"Dubai\\ud83d","n":"\\ud83d","name":"\\ude00x","a":2,"r":1}' }],
      ['100,000 letters', last({ d: 'A'.repeat(100000), name: 'B'.repeat(100000) })], ['prototype keys', { nuzul_last: '{"__proto__":{"polluted":1},"constructor":{"prototype":{"polluted":1}},"d":"Dubai"}' }]
    ], s => s.last ? [] : ['box missing']);

    // ---- المفضلة ----
    await group(pg, 'favourites | not a list: treated as empty, page works', [
      ['broken JSON', { nuzul_favs: '{bad' }], ['null', { nuzul_favs: 'null' }], ['a string', { nuzul_favs: J('x') }], ['a number', { nuzul_favs: '5' }], ['true', { nuzul_favs: 'true' }], ['a record', { nuzul_favs: '{}' }], ['empty text', { nuzul_favs: '' }]
    ], s => s.favs ? ['favourites were shown'] : []);
    await group(pg, 'favourites | entries that are not hotel records are skipped', [
      ['one empty entry', { nuzul_favs: '[null]' }], ['mixed junk', { nuzul_favs: J([1, 'a', true, [], {}, null]) }], ['a list inside the list', { nuzul_favs: J([[HOTEL]]) }],
      ['numbers where names should be', { nuzul_favs: J([{ id: 1, n: 2, d: 3 }]) }], ['id only', { nuzul_favs: J([{ id: 'x|y' }]) }], ['empty names', { nuzul_favs: J([{ id: '', n: '', d: '' }]) }]
    ], s => s.favs ? ['an invalid entry was shown'] : []);
    await group(pg, 'favourites | valid hotels survive next to junk, with the right count', [
      ['two valid among four invalid', { nuzul_favs: J([null, HOTEL, 5, { id: 'x' }, HOTEL2, { id: 1, n: 2, d: 3 }]) }]
    ], s => (s.favs === 2 && s.favNames.join('|') === 'Address Downtown|Atlantis The Palm') ? [] : ['shown: ' + s.favs + ' ' + s.favNames.join('|')]);
    await group(pg, 'favourites | optional fields of the wrong type do not break the entry', [
      ['wrong optional fields', { nuzul_favs: J([Object.assign({}, HOTEL, { ar: { a: 1 }, cityAr: [1], city: 7, ts: 'x' })]) }]
    ], s => (s.favs === 1 && s.favNames[0] === 'Address Downtown') ? [] : ['shown: ' + s.favNames.join('|')]);
    await group(pg, 'favourites | markup in every field and 200 entries: shown as text, page works', [
      ['markup in every field', { nuzul_favs: J([{ id: '" data-zz onmouseover="window.__x=1', city: IMG, d: IMG, cityAr: IMG, n: IMG, ar: IMG }]) }],
      ['200 entries', { nuzul_favs: J(Array.from({ length: 200 }, (x, i) => Object.assign({}, HOTEL, { id: 'dubai|h' + i, n: 'Hotel ' + i }))) }]
    ], s => s.favs >= 1 && s.favs <= 6 ? [] : ['shown: ' + s.favs]);
    // حذف مفضلة من قائمة فيها عناصر تالفة: القائمة تنقص واحد والتخزين يرجع نظيف
    { const s0 = await home(pg, { nuzul_favs: J([null, HOTEL, 5, HOTEL2, { id: 1 }]) }); const e0 = pg._e.length;
      await pg.evaluate(() => { const x = document.querySelector('#nzkeep [data-rm]'); if (x) x.click(); }); await sleep(200);
      const r = await pg.evaluate(() => { let v = null; try { v = JSON.parse(localStorage.getItem('nuzul_favs')); } catch (e) {} return { left: document.querySelectorAll('#nzkeep [data-rm]').length, stored: Array.isArray(v) ? v.map(x => x && x.n) : 'not a list' }; });
      ok('favourites | removing one from a damaged list works and leaves a clean list in storage', sound(s0).length === 0 && pg._e.length === e0 && r.left === 1 && J(r.stored) === J(['Atlantis The Palm']), J(r)); }

    // ---- مفاتيح ثانية ----
    { const fails = [];
      for (const v of [J(IMG), '{}', '[]', '-5', '1e99', 'null', '{bad', '"7"', '3.9', 'true']) { const s = await home(pg, { nuzul_visits: v }); const st = await pg.evaluate(() => { let x; try { x = JSON.parse(localStorage.getItem('nuzul_visits')); } catch (e) { x = 'unparsable'; } return x; });
        if (sound(s).length || typeof st !== 'number' || !isFinite(st) || st < 1 || Math.round(st) !== st) fails.push(v.slice(0, 20) + ' → stored ' + J(st) + ' ' + (sound(s)[0] || '')); }
      ok('visit counter | any stored value becomes a whole number again, page works (10 cases)', fails.length === 0, fails[0] || ''); }
    await group(pg, 'language and install-banner flags | junk values are ignored', [
      ['language = markup', { nuzul_lang: IMG }], ['language = record', { nuzul_lang: '{"a":1}' }], ['banner flag = markup', { nuzul_a2hs_off: J(IMG), nuzul_visits: '9' }], ['banner flag = broken JSON', { nuzul_a2hs_off: '{bad', nuzul_visits: '9' }]
    ], s => (s.lang === 'en' || s.lang === 'ar') ? [] : ['language attribute is ' + s.lang]);
    await pg.browserContext().close(); });

  // ---- صفحة النتائج مع مفضلة تالفة ----
  await part('results page', async () => { const pg = await page(); const url = B + '/results.html?lang=en&d=Dubai&ci=' + FUT[0] + '&co=' + FUT[1];
    await pg.goto(url, { waitUntil: 'networkidle2' }); await sleep(300);
    const res = async favs => { const e0 = pg._e.length;
      await pg.evaluate(f => { localStorage.clear(); localStorage.setItem('nuzul_favs', f); window.__x = 0; }, favs); await pg.goto(url, { waitUntil: 'networkidle2' }); await sleep(350);
      const s = await pg.evaluate(() => ({ x: window.__x === 1, inj: document.querySelectorAll('[data-zz]').length, cards: document.querySelectorAll('#hl .hc').length, partner: document.querySelectorAll('#cards .pc').length,
        hearts: document.querySelectorAll('#hl .fv.on').length, tab: [...document.querySelectorAll('#htabs .chip')].map(c => c.textContent).filter(t => /\(\d+\)/.test(t)).join('') }));
      s.err = pg._e.slice(e0); return s; };
    const fails = [];
    for (const [label, favs, hearts] of [['one empty entry', '[null]', 0], ['mixed junk', J([1, 'a', true, [], {}, null]), 0], ['broken JSON', '{bad', 0], ['not a list', J({ a: 1 }), 0], ['numbers where names should be', J([{ id: 1, n: 2, d: 3, city: 4 }]), 0],
      ['valid hotel among junk', J([null, HOTEL, 5, { id: 'x' }]), 1], ['markup in every field', J([{ id: IMG, city: 'dubai', d: IMG, n: IMG, ar: IMG }]), 0]]) {
      const s = await res(favs);
      if (s.err.length || s.x || s.inj || s.cards < 10 || s.partner !== 3 || s.hearts !== hearts) fails.push(label + ' → ' + (s.err[0] || ('cards=' + s.cards + ' sites=' + s.partner + ' hearts=' + s.hearts + ' exec=' + s.x + ' inj=' + s.inj))); }
    ok('results page | damaged favourites: hotel list and booking-site cards still render, only real favourites are marked (7 cases)', fails.length === 0, fails.length ? fails.length + ' wrong, e.g. ' + fails[0] : '');
    // تبديل القلب على قائمة فيها عناصر تالفة: يشتغل ويرجّع التخزين نظيف
    { const s = await res(J([null, HOTEL, 5, { id: 'x' }])); const e0 = pg._e.length;
      await pg.evaluate(() => { const on = document.querySelector('#hl .fv.on'); if (on) on.click(); }); await sleep(250);
      await pg.evaluate(() => { const off = [...document.querySelectorAll('#hl .fv')].find(x => !x.classList.contains('on')); if (off) off.click(); }); await sleep(250);
      const r = await pg.evaluate(() => { let v = null; try { v = JSON.parse(localStorage.getItem('nuzul_favs')); } catch (e) {} return { hearts: document.querySelectorAll('#hl .fv.on').length, clean: Array.isArray(v) && v.every(x => x && typeof x === 'object' && typeof x.id === 'string' && typeof x.n === 'string'), n: Array.isArray(v) ? v.length : -1 }; });
      ok('results page | removing and adding a favourite on a damaged list works and leaves a clean list in storage', s.err.length === 0 && pg._e.length === e0 && s.hearts === 1 && r.hearts === 1 && r.clean && r.n === 1, J(r) + (pg._e[e0] ? ' ' + pg._e[e0] : '')); }
    await pg.browserContext().close(); });

  // ---- التخزين مقفول أو ممتلئ ----
  for (const [label, init] of [
    ['storage blocked (every read and write throws)', () => { const boom = () => { throw new DOMException('blocked', 'SecurityError'); }; Storage.prototype.getItem = boom; Storage.prototype.setItem = boom; Storage.prototype.removeItem = boom; }],
    ['storage full (every write throws)', () => { Storage.prototype.setItem = () => { throw new DOMException('full', 'QuotaExceededError'); }; }]]) {
    await part(label, async () => { const pg = await page(init); const why = [];
    await pg.goto(B + '/', { waitUntil: 'networkidle2' }); await sleep(300);
    const h = await pg.evaluate(() => { const $ = id => document.getElementById(id); $('dest').value = 'Dubai'; $('dest').dispatchEvent(new Event('input', { bubbles: true })); $('langBtn').click();
      return { cities: document.querySelectorAll('#grid .city').length, search: ($('go').getAttribute('href') || '').indexOf('/results.html?d=Dubai') === 0, lang: document.documentElement.lang }; });
    if (h.cities < 8 || !h.search || h.lang !== 'en') why.push('home: ' + J(h));
    await pg.goto(B + '/results.html?d=Dubai', { waitUntil: 'networkidle2' }); await sleep(300);
    const r = await pg.evaluate(() => { const f = document.querySelector('#hl .fv'); if (f) f.click(); const l = document.getElementById('langBtn'); if (l) l.click(); const c = document.querySelector('#hl .hc'); if (c) c.click();
      const sh = document.getElementById('sh'); return { cards: document.querySelectorAll('#hl .hc').length, partner: document.querySelectorAll('#cards .pc').length, sheet: !!sh && !sh.hidden }; });
    if (r.cards < 10 || r.partner !== 3 || !r.sheet) why.push('results: ' + J(r)); if (pg._e.length) why.push('script error: ' + pg._e[0]);
    ok(label + ' | home and results pages still work', why.length === 0, why[0] || ''); await pg.browserContext().close(); }); }

  // رحلاتي السابقة (25 نوفمبر 2026): كل فندق يفتحه الزائر ينحفظ على جهازه، من أول استخدام لآخر استخدام
  { const pg = await page(); await pg.goto(B + '/', { waitUntil: 'networkidle2' }); await pg.evaluate(() => localStorage.clear());
    const pick = async (d, n, book) => { await pg.goto(B + '/results.html?d=' + encodeURIComponent(d), { waitUntil: 'networkidle2' }); await sleep(400);
      await pg.evaluate(async (n, book) => { document.addEventListener('click', e => { if (e.target.closest('a')) e.preventDefault(); }, true);
        const c = document.querySelectorAll('.hc')[n]; c.click(); await new Promise(r => setTimeout(r, 400)); if (book) document.querySelector('.sha.b3').click(); }, n, book); await sleep(150); };
    await pick('Paris', 0, false); await pick('Istanbul', 0, false); await pick('Abu Dhabi', 1, true); await pick('Cairo', 0, false); await pick('London', 0, true); await pick('London', 0, true);
    const h = await pg.evaluate(() => JSON.parse(localStorage.getItem('nuzul_history') || '[]'));
    ok('trip history: every opened hotel saved, newest first, same hotel and date kept once', h.length === 5 && /london/i.test(h[0].d) && /paris/i.test(h[4].d) && h[0].go === true && h[0].site === 'Expedia' && h.filter(x => x.go).length === 2 && h.every(x => realDate(x.ci) && realDate(x.co) && x.n),
      h.map(x => x.d + (x.go ? '*' : '')).join(','));
    await pg.goto(B + '/', { waitUntil: 'networkidle2' }); await sleep(400);
    const v = await pg.evaluate(() => ({ t: (document.getElementById('nzhist') || {}).textContent || '', cards: document.querySelectorAll('#nzkeep [data-hrm]').length, went: document.querySelectorAll('#nzkeep small.went').length,
      first: (document.querySelector('#nzkeep [data-hrm]') || { closest: () => null }).closest('.c').querySelector('span').textContent,
      links: [...document.querySelectorAll('#nzkeep [data-hrm]')].map(b => b.closest('.c').querySelector('a.go').getAttribute('href')) }));
    ok('home page: «رحلاتي السابقة» lists the 5 trips with booking marks and working links', /رحلاتي السابقة \(5\)/.test(v.t) && v.cards === 5 && v.went === 2 && /لندن|London/.test(v.first) && v.links.every(l => { const q = new URLSearchParams(l.split('?')[1]); return l.startsWith('/results.html?') && realDate(q.get('ci')) && q.get('co') > q.get('ci') && q.get('ci') >= ymd(new Date()); }), JSON.stringify(v).slice(0, 300));
    await pg.evaluate(() => document.querySelector('#nzkeep [data-hrm]').click()); await sleep(150);
    const r1 = await pg.evaluate(() => [JSON.parse(localStorage.getItem('nuzul_history')).length, document.querySelectorAll('#nzkeep [data-hrm]').length].join('/'));
    await pg.evaluate(() => document.getElementById('nzhClr').click()); await sleep(150);
    const r2 = await pg.evaluate(() => [JSON.parse(localStorage.getItem('nuzul_history')).length, document.getElementById('nzhClr').textContent].join('/'));
    await pg.evaluate(() => document.getElementById('nzhClr').click()); await sleep(150);
    const r3 = await pg.evaluate(() => [JSON.parse(localStorage.getItem('nuzul_history')).length, !!document.getElementById('nzhist')].join('/'));
    ok('trip history: remove one, clear needs a second tap, no browser dialog', r1 === '4/4' && /^4\/متأكد/.test(r2) && r3 === '0/false' && !pg._dlg && pg._e.length === 0, [r1, r2, r3, pg._e[0]].join(' | '));
    // سنوات من الاستخدام: 320 رحلة تنقص لآخر 300، ويظهر 6 ثم «عرض الكل»
    await pg.evaluate(() => { const L = []; for (let i = 0; i < 320; i++) L.push({ id: 'c|h' + i + '|', city: 'c', d: 'City ' + i, cityAr: '', n: 'Hotel ' + i, ar: '', ci: '2019-0' + (1 + i % 9) + '-10', co: '2019-0' + (1 + i % 9) + '-12', a: 2, r: 1, ts: 1e12 + i, go: false });
      localStorage.setItem('nuzul_history', JSON.stringify(L)); });
    await pg.reload({ waitUntil: 'networkidle2' }); await sleep(300);
    const big0 = await pg.evaluate(() => document.querySelectorAll('#nzkeep [data-hrm]').length); await pg.evaluate(() => document.getElementById('nzhMore').click()); await sleep(200);
    const big1 = await pg.evaluate(() => [document.querySelectorAll('#nzkeep [data-hrm]').length, document.getElementById('nzhist').textContent].join('/'));
    await pick('Dubai', 0, false); const cap = await pg.evaluate(() => JSON.parse(localStorage.getItem('nuzul_history')).length);
    ok('trip history: years of trips kept up to 300, home shows 6 then «show all»', big0 === 6 && /^300\//.test(big1) && cap === 300, big0 + ' ' + big1 + ' cap=' + cap); await pg.browserContext().close(); }
  // سجل تالف أو معدّل باليد: الصفحة تشتغل وما ينفّذ شي
  { const pg = await page(); await pg.goto(B + '/', { waitUntil: 'networkidle2' }); const bad = [];
    for (const raw of ['{bad', '"x"', '42', 'null', '{}', J([1, null, 'x', [], { n: IMG }, { d: IMG }]), J([{ n: IMG, d: IMG, ar: IMG, cityAr: IMG, ci: IMG, co: '2026-02-31', a: IMG, r: -5, ts: IMG, go: IMG, site: IMG, id: IMG }]), J([{ n: 'A', d: 'B', __proto__: { polluted: 1 }, constructor: { prototype: { polluted: 1 } } }])]) {
      const s = await home(pg, { nuzul_history: raw }); const why = sound(s); const t = await pg.evaluate(() => document.querySelectorAll('#nzkeep a.go').length ? [...document.querySelectorAll('#nzkeep a.go')].map(a => a.getAttribute('href')).join(' ') : '');
      if (/Invalid|NaN|undefined|2026-02-31/.test(t)) why.push('bad link ' + t.slice(0, 60)); if (why.length) bad.push(raw.slice(0, 20) + ': ' + why.join('; ')); }
    ok('trip history: corrupt or hostile saved data never breaks the page or runs script', bad.length === 0, bad.slice(0, 3).join(' | ')); await pg.browserContext().close(); }
  console.log(out.join('\n')); console.log('total', out.length, 'pass', out.filter(x => x.startsWith('PASS')).length);
  if (process.env.OUT) require('fs').writeFileSync(process.env.OUT, out.join('\n'));
  if (out.some(x => x.startsWith('FAIL'))) process.exitCode = 1;
  await b.close();
})();
