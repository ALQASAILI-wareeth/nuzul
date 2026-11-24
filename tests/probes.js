// نُزُل — فحوص حقن إضافية بأرقام ثابتة (R01–R20 صفحة النتائج، E01–E04 خانة تعديل البحث، H01–H12 الصفحة الرئيسية)
// نفس الفحوص اللي انكتبت في مراجعة الإغلاق 24 نوفمبر 2026، عشان تبقى الأرقام مرجع للتقارير
// التشغيل: BASE=http://localhost:8765 node tests/probes.js
// كل حمولة تحمل علامة (data-zz أو id=zz) وتحاول تضبط window.__x. لكل حالة نسجّل:
//   exec  = السكربت اشتغل (window.__x === 1 أو انفتحت نافذة)
//   inj   = الحمولة صارت عناصر حقيقية في الصفحة
//   shown = نص الحمولة ظاهر كنص عادي (دليل إن المسار انفحص فعلاً)
//   err   = أخطاء سكربت في الصفحة
//   badH  = روابط ما تبدأ بـ https: أو http: أو mailto: أو / أو ? أو #
// الخروج بكود 1 إذا أي حالة نفّذت سكربت، أو انحقن فيها عنصر، أو طلع فيها خطأ سكربت.
const p = require(process.env.PUPPETEER || 'puppeteer-core');
const B = process.env.BASE || 'http://localhost:8765';
const sleep = ms => new Promise(r => setTimeout(r, ms));
const AR = 'ع'; // Arabic letter ain
const ZW = '\u200B'; // zero-width space
const IMG = '<img src=x data-zz onerror="window.__x=1">';
const rows = [];
const H = { 'access-control-allow-origin': '*', 'content-type': 'application/json' };

(async () => {
  const b = await p.launch({ executablePath: process.env.CHROME || '/usr/bin/google-chrome', args: ['--no-sandbox'] });
  async function page() {
    const cx = await (b.createBrowserContext ? b.createBrowserContext() : b.createIncognitoBrowserContext());
    const pg = await cx.newPage(); pg._e = []; pg._dlg = 0;
    pg.on('pageerror', e => pg._e.push(String(e.message).slice(0, 90)));
    pg.on('dialog', d => { pg._dlg = 1; d.dismiss(); });
    await pg.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
    await pg.setRequestInterception(true);
    pg.on('request', r => { const u = r.url(); let host = ''; try { host = new URL(u).hostname; } catch (e) {}
      // decide by host name only, so a payload inside our own page address is never mistaken for an outside request
      if (/(^|\.)wikipedia\.org$/.test(host) || (host === 'commons.wikimedia.org' && /\/w\/api/.test(u))) return r.respond({ status: 200, headers: H, body: '{"query":{"pages":{}}}' });
      if (/wikimedia\.org$|cloudflareinsights\.com$|evil\.example$|fonts\.googleapis\.com$|fonts\.gstatic\.com$/.test(host)) { if (/evil\.example$/.test(host)) pg._evil = 1; return r.abort(); }
      r.continue(); });
    return pg;
  }
  const state = (pg, needle) => pg.evaluate(needle => {
    const txt = document.body ? document.body.innerText : '';
    const sheet = document.getElementById('shp');
    return {
      x: window.__x === 1,
      inj: document.querySelectorAll('[data-zz],#zz,iframe').length,
      shown: needle ? (txt.indexOf(needle) >= 0 || (sheet ? sheet.innerText.indexOf(needle) >= 0 : false)) : null,
      badHref: [...document.querySelectorAll('a[href]')].filter(a => !/^(https:|http:|mailto:|\/|\?|#)/i.test(a.getAttribute('href'))).length,
      cards: document.querySelectorAll('#hl .hc').length,
      partners: document.querySelectorAll('#cards .pc').length
    };
  }, needle || '');
  function rec(id, what, s, pg, note) {
    rows.push({ id, what, exec: (s.x || pg._dlg) ? 1 : 0, inj: s.inj, shown: s.shown, badHref: s.badHref, cards: s.cards, partners: s.partners, err: pg._e.length, e1: pg._e[0] || '', note: note || '' });
  }
  // open results page with a query, open first hotel card, toggle language, re-open
  async function results(id, what, query, needle, opt) {
    const pg = await page();
    try {
      await pg.goto(B + '/results.html?' + query, { waitUntil: 'networkidle2', timeout: 45000 }); await sleep(450);
      const s0 = await state(pg, needle);
      await pg.evaluate(() => { const c = document.querySelector('#hl .hc'); if (c) c.click(); }); await sleep(450);
      const s1 = await state(pg, needle);
      await pg.keyboard.press('Escape'); await sleep(300);
      await pg.evaluate(() => { const l = document.getElementById('langBtn'); if (l) l.click(); }); await sleep(350);
      await pg.evaluate(() => { const c = document.querySelector('#hl .hc'); if (c) c.click(); }); await sleep(450);
      if (opt && opt.hover) { for (const sel of ['[onmouseover]', '[data-zz]']) { const el = await pg.$(sel); if (el) { try { await el.hover(); } catch (e) {} } } await sleep(200); }
      const s2 = await state(pg, needle);
      const s = { x: s0.x || s1.x || s2.x, inj: Math.max(s0.inj, s1.inj, s2.inj), shown: needle ? (s0.shown || s1.shown || s2.shown) : null, badHref: Math.max(s0.badHref, s1.badHref, s2.badHref), cards: s0.cards, partners: s0.partners };
      rec(id, what, s, pg);
    } catch (e) { rows.push({ id, what, exec: '?', inj: '?', shown: '?', badHref: '?', cards: '?', partners: '?', err: 1, e1: 'RUNNER: ' + String(e.message).slice(0, 80), note: '' }); }
    await pg.browserContext().close();
  }
  const enc = encodeURIComponent;

  // ---------- results page: URL parameters ----------
  await results('R01', 'n = Arabic letter + <img onerror>, unknown destination, Arabic UI', 'd=Zzzland&n=' + enc(AR + IMG), 'onerror');
  await results('R02', 'd = <img onerror>, English UI', 'lang=en&d=' + enc(IMG), 'onerror');
  await results('R03', 'd = attribute break-out (double quote + onmouseover)', 'd=' + enc('Zzz" data-zz onmouseover="window.__x=1" x="'), 'onmouseover', { hover: 1 });
  await results('R04', 'd = single quote + <svg onload>', 'd=' + enc('Zzz\'><svg data-zz onload="window.__x=1">'), 'onload');
  await results('R05', 'd = payload split by zero-width characters (becomes a real tag after cleaning)', 'd=' + enc('<i' + ZW + 'mg src=x data-zz one' + ZW + 'rror="window.__x=1">'), 'onerror');
  await results('R06', 'd = double URL-encoded payload', 'd=' + enc(enc(IMG)), '%3Cimg');
  await results('R07', 'd = HTML-entity encoded payload', 'd=' + enc('&lt;img src=x data-zz onerror=window.__x=1&gt;'), 'onerror');
  await results('R08', 'listed destination + n = Arabic letter + payload', 'd=Dubai&n=' + enc(AR + IMG), '');
  await results('R09', 'ci = valid date followed by break-out payload', 'd=Zzzland&ci=' + enc('2026-12-10"><img src=x data-zz onerror="window.__x=1">') + '&co=2026-12-12', '');
  await results('R10', 'ci = valid date + newline + payload', 'd=Zzzland&ci=' + enc('2026-12-10\n' + IMG) + '&co=2026-12-12', '');
  await results('R11', 'a and r = number followed by payload', 'd=Zzzland&a=' + enc('2' + IMG) + '&r=' + enc('1' + IMG), '');
  await results('R12', 't, lang, fav, unknown parameter and #fragment all carrying payloads', 'd=Zzzland&t=' + enc(IMG) + '&lang=' + enc(IMG) + '&fav=' + enc('1' + IMG) + '&zz=' + enc(IMG) + '#' + enc(IMG), '');
  await results('R13', 'misspelt city (suggestion chips) + break-out payload in co', 'd=Dubia&ci=2026-12-10&co=' + enc('2026-12-12"><img src=x data-zz onerror="window.__x=1">'), '');
  await results('R14', 'd = javascript: URL text', 'd=' + enc('javascript:window.__x=1'), 'javascript:');
  await results('R15', 'd = template-style strings', 'd=' + enc('${window.__x=1}{{constructor.constructor("window.__x=1")()}}'), 'constructor');
  await results('R16', 'd = 79 letters + emoji (80-character cut lands inside the emoji)', 'd=' + enc('a'.repeat(79) + '\u{1F600}'), '');
  await results('R17', 'country name + payload', 'd=' + enc('تركيا' + IMG), 'onerror');
  await results('R18', 'd = <a href=javascript:> + <b onmouseover> (hovered)', 'd=' + enc('<a id=zz href="javascript:window.__x=1">x</a><b data-zz onmouseover="window.__x=1">y</b>'), 'onmouseover', { hover: 1 });
  await results('R19', 'd = <iframe srcdoc> payload', 'd=' + enc('<iframe srcdoc="<script>parent.__x=1</script>"></iframe>'), 'srcdoc');
  await results('R20', 'd = backtick / style break-out', 'd=' + enc('`;background:url(https://evil.example/a)`<style data-zz>*{display:none}</style>'), 'evil.example');

  // ---------- results page: edit-search field ----------
  { const pg = await page();
    try {
      await pg.goto(B + '/results.html?d=Dubai', { waitUntil: 'networkidle2', timeout: 45000 }); await sleep(450);
      const list = [['E01', 'edit field: Arabic letter + <img onerror>', AR + IMG, 'onerror'], ['E02', 'edit field: zero-width split payload', '<i' + ZW + 'mg src=x data-zz one' + ZW + 'rror="window.__x=1">', 'onerror'], ['E03', 'edit field: attribute break-out', 'Zzz" data-zz onmouseover="window.__x=1" x="', 'onmouseover'], ['E04', 'edit field: 79 letters + emoji', 'a'.repeat(79) + '\u{1F600}', '']];
      for (const [id, what, v, needle] of list) {
        const e0 = pg._e.length;
        await pg.evaluate(() => { window.__x = 0; }); pg._dlg = 0;   // each edit case is judged on its own
        await pg.evaluate(v => { document.getElementById('editBtn').click(); document.getElementById('e_dest').value = v; document.getElementById('e_go').click(); }, v); await sleep(550);
        await pg.evaluate(() => { const c = document.querySelector('#hl .hc'); if (c) c.click(); }); await sleep(400);
        const s = await state(pg, needle); await pg.keyboard.press('Escape'); await sleep(250);
        rows.push({ id, what, exec: (s.x || pg._dlg) ? 1 : 0, inj: s.inj, shown: s.shown, badHref: s.badHref, cards: s.cards, partners: s.partners, err: pg._e.length - e0, e1: pg._e[e0] || '', note: '' });
      }
    } catch (e) { rows.push({ id: 'E??', what: 'edit field', exec: '?', inj: '?', shown: '?', badHref: '?', cards: '?', partners: '?', err: 1, e1: 'RUNNER: ' + String(e.message).slice(0, 80), note: '' }); }
    await pg.browserContext().close(); }

  // ---------- home page: saved data in the browser (localStorage) ----------
  async function home(id, what, store, needle, url) {
    const pg = await page();
    try {
      await pg.goto(B + '/', { waitUntil: 'networkidle2', timeout: 45000 });
      await pg.evaluate(store => { Object.keys(store).forEach(k => localStorage.setItem(k, typeof store[k] === 'string' ? store[k] : JSON.stringify(store[k]))); }, store);
      await pg.goto(B + (url || '/'), { waitUntil: 'networkidle2', timeout: 45000 }); await sleep(800);
      const s0 = await state(pg, needle);
      await pg.evaluate(() => { const l = document.getElementById('langBtn'); if (l) l.click(); }); await sleep(500);
      const s1 = await state(pg, needle);
      rec(id, what, { x: s0.x || s1.x, inj: Math.max(s0.inj, s1.inj), shown: needle ? (s0.shown || s1.shown) : null, badHref: Math.max(s0.badHref, s1.badHref), cards: '-', partners: '-' }, pg);
    } catch (e) { rows.push({ id, what, exec: '?', inj: '?', shown: '?', badHref: '?', cards: '-', partners: '-', err: 1, e1: 'RUNNER: ' + String(e.message).slice(0, 80), note: '' }); }
    await pg.browserContext().close();
  }
  const last = o => Object.assign({ d: 'Dubai', n: '', name: 'Dubai', ci: '2026-12-10', co: '2026-12-13', a: 2, r: 1, ts: Date.now() }, o);
  await home('H01', 'saved search: adults field = <img onerror> string', { nuzul_last: last({ a: IMG }) }, 'onerror');
  await home('H02', 'saved search: rooms field = payload', { nuzul_last: last({ r: IMG }) }, '');
  await home('H03', 'saved search: date fields = payload strings', { nuzul_last: last({ ci: '9999' + IMG, co: '9999z' + IMG }) }, '');
  await home('H04', 'saved search: name / d / n = Arabic letter + payload', { nuzul_last: last({ d: AR + IMG, n: AR + IMG, name: AR + IMG }) }, 'onerror');
  await home('H05', 'saved search stored as a plain string / array instead of an object', { nuzul_last: JSON.stringify(IMG), nuzul_favs: JSON.stringify(IMG) }, '');
  await home('H06', 'favourites: all fields = payload, id = attribute break-out', { nuzul_favs: [{ id: '" data-zz onmouseover="window.__x=1', city: IMG, d: IMG, cityAr: IMG, n: IMG, ar: IMG }] }, 'onerror');
  await home('H07', 'favourites: wrong types (null entry, arrays, objects)', { nuzul_favs: [null, { id: {}, n: [IMG], ar: { a: IMG }, d: 5 }] }, '');
  await home('H08', 'language, visit counter and install-banner flags = payload', { nuzul_lang: IMG, nuzul_visits: JSON.stringify(IMG), nuzul_a2hs_off: JSON.stringify(IMG) }, '');
  await home('H09', 'home page URL: query parameters and #fragment carrying payloads', {}, '', '/?d=' + enc(IMG) + '&n=' + enc(IMG) + '&lang=' + enc(IMG) + '#' + enc(IMG));

  // ---------- home page: typed text ----------
  { const pg = await page();
    try {
      await pg.goto(B + '/', { waitUntil: 'networkidle2', timeout: 45000 }); await sleep(500);
      await pg.click('#dest'); await pg.type('#dest', AR + IMG, { delay: 5 }); await sleep(500);
      const s0 = await state(pg, '');
      const href = await pg.evaluate(() => { const g = document.getElementById('go'); return g ? g.getAttribute('href') || '' : ''; });
      rows.push({ id: 'H10', what: 'home search box: typed Arabic letter + payload (suggestion list)', exec: (s0.x || pg._dlg) ? 1 : 0, inj: s0.inj, shown: null, badHref: s0.badHref, cards: '-', partners: '-', err: pg._e.length, e1: pg._e[0] || '', note: 'search link starts with: ' + href.slice(0, 22) });
      if (href && href !== '#') { await pg.goto(new URL(href, B + '/').href, { waitUntil: 'networkidle2', timeout: 45000 }); await sleep(500);
        await pg.evaluate(() => { const c = document.querySelector('#hl .hc'); if (c) c.click(); }); await sleep(400);
        const s1 = await state(pg, 'onerror');
        rows.push({ id: 'H11', what: 'results page reached from that home search link', exec: (s1.x || pg._dlg) ? 1 : 0, inj: s1.inj, shown: s1.shown, badHref: s1.badHref, cards: s1.cards, partners: s1.partners, err: pg._e.length, e1: pg._e[0] || '', note: '' }); }
    } catch (e) { rows.push({ id: 'H10', what: 'home search box', exec: '?', inj: '?', shown: '?', badHref: '?', cards: '-', partners: '-', err: 1, e1: 'RUNNER: ' + String(e.message).slice(0, 80), note: '' }); }
    await pg.browserContext().close(); }
  { const pg = await page();
    try {
      await pg.goto(B + '/#business', { waitUntil: 'networkidle2', timeout: 45000 }); await sleep(700);
      const has = await pg.evaluate(() => !!document.getElementById('bzText'));
      if (has) {
        const text = 'نحتاج 3 غرف في دبي ' + IMG + ' و 5 تذاكر من ' + IMG + ' بميزانية 20000 ' + IMG;
        await pg.evaluate(t => { const b = document.querySelector('.bz-toggle, #bzToggle'); const ta = document.getElementById('bzText'); ta.value = t; ta.dispatchEvent(new Event('input', { bubbles: true })); document.getElementById('bzGo').click(); }, text); await sleep(700);
        // put the payload into the free-text "other destination" field too
        await pg.evaluate(v => { document.querySelectorAll('#bzDests [data-k=other]').forEach(i => { i.style.display = 'block'; i.value = v; i.dispatchEvent(new Event('input', { bubbles: true })); i.dispatchEvent(new Event('change', { bubbles: true })); }); ['bzName', 'bzCo', 'bzContact', 'bzExtra'].forEach(id => { const el = document.getElementById(id); if (el) { el.value = v; el.dispatchEvent(new Event('input', { bubbles: true })); } }); }, IMG); await sleep(500);
        const s = await state(pg, '');
        const outLen = await pg.evaluate(() => (document.getElementById('bzOut') || { innerHTML: '' }).innerHTML.length);
        rows.push({ id: 'H12', what: 'company request box: payload typed in the request and in every free-text field', exec: (s.x || pg._dlg) ? 1 : 0, inj: s.inj, shown: null, badHref: s.badHref, cards: '-', partners: '-', err: pg._e.length, e1: pg._e[0] || '', note: 'result markup length ' + outLen });
      } else rows.push({ id: 'H12', what: 'company request box', exec: '-', inj: '-', shown: '-', badHref: '-', cards: '-', partners: '-', err: 0, e1: '', note: 'box not present in this version' });
    } catch (e) { rows.push({ id: 'H12', what: 'company request box', exec: '?', inj: '?', shown: '?', badHref: '?', cards: '-', partners: '-', err: 1, e1: 'RUNNER: ' + String(e.message).slice(0, 80), note: '' }); }
    await pg.browserContext().close(); }

  const pad = (s, n) => (String(s) + ' '.repeat(n)).slice(0, n);
  console.log('BASE ' + B);
  console.log(pad('id', 4) + pad('exec', 5) + pad('inj', 4) + pad('shown', 6) + pad('badH', 5) + pad('cards', 6) + pad('prtn', 5) + pad('err', 4) + 'case');
  rows.forEach(r => console.log(pad(r.id, 4) + pad(r.exec, 5) + pad(r.inj, 4) + pad(r.shown === null ? '-' : r.shown, 6) + pad(r.badHref, 5) + pad(r.cards, 6) + pad(r.partners, 5) + pad(r.err, 4) + r.what + (r.e1 ? '  [error: ' + r.e1 + ']' : '') + (r.note ? '  [' + r.note + ']' : '')));
  const hit = rows.filter(r => r.exec === 1 || r.inj > 0), errs = rows.filter(r => r.err > 0), unsure = rows.filter(r => r.exec === '?');
  console.log('cases ' + rows.length + ' | script executed or markup injected in ' + hit.length + ': ' + hit.map(r => r.id).join(',') + ' | cases with page errors: ' + errs.map(r => r.id).join(','));
  console.log('total', rows.length, 'pass', rows.filter(r => r.exec !== 1 && r.exec !== '?' && !(r.inj > 0) && !(r.err > 0)).length);
  if (process.env.OUT) require('fs').writeFileSync(process.env.OUT, JSON.stringify(rows, null, 1));
  if (hit.length || errs.length || unsure.length) process.exitCode = 1;
  await b.close();
})();
