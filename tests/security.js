// نُزُل — اختبارات أمان: حقن السكربت عبر الرابط، التخزين المحلي، وردود ويكيبيديا
// التشغيل: BASE=http://localhost:8765 node tests/security.js
const p = require(process.env.PUPPETEER || 'puppeteer-core');
const B = process.env.BASE || 'http://localhost:8765';
const sleep = ms => new Promise(r => setTimeout(r, ms));
const out = []; const ok = (n, c, x) => out.push((c ? 'PASS ' : 'FAIL ') + n + (x ? ' :: ' + x : ''));
const PAY = [
  '<img src=x onerror="window.__x=1">',
  '"><svg onload="window.__x=1">',
  '\'><script>window.__x=1</script>',
  '</span><iframe srcdoc="<script>parent.__x=1</script>"></iframe>',
  '<a href="javascript:window.__x=1" id="zz">x</a>',
  '<b onmouseover="window.__x=1" style="position:fixed;inset:0">x</b>'
];
const H = { 'access-control-allow-origin': '*', 'content-type': 'application/json' };
(async () => {
  const b = await p.launch({ executablePath: process.env.CHROME || '/usr/bin/google-chrome', args: ['--no-sandbox'] });
  async function page(wiki) {
    const cx = await (b.createBrowserContext ? b.createBrowserContext() : b.createIncognitoBrowserContext());
    const pg = await cx.newPage(); pg._e = []; pg.on('pageerror', e => pg._e.push(e.message)); pg.on('dialog', d => { pg._dlg = 1; d.dismiss(); });
    await pg.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
    await pg.setRequestInterception(true);
    pg.on('request', r => { const u = r.url();
      if (/wikipedia\.org\/w\/api|commons\.wikimedia\.org\/w\/api/.test(u)) { if (wiki) return r.respond({ status: 200, headers: H, body: JSON.stringify(wiki(u)) }); return r.abort(); }
      if (/wikimedia|cloudflareinsights|evil\.example/.test(u)) { if (/evil\.example/.test(u)) pg._evil = 1; return r.abort(); }
      r.continue(); });
    return pg;
  }
  const state = pg => pg.evaluate(() => ({ x: window.__x === 1, bad: document.querySelectorAll('img[src="x"],img[src$="/x"],iframe,svg[onload],#zz,[onmouseover],script:not([src]):not([type])').length > 2 ? 'many' : [...document.querySelectorAll('img[src="x"],iframe,svg[onload],#zz,[onmouseover]')].length }));
  // 1) كل باراميتر × كل حمولة على صفحة النتائج
  for (const param of ['d', 'n', 'ci', 'co', 'a', 'r', 't', 'lang', 'fav']) {
    let exec = 0, inj = 0;
    for (const pay of PAY) {
      for (const base of ['d=Zzzland', 'd=Dubai']) {
        const pg = await page();
        const q = (param === 'd' ? '' : base + '&') + param + '=' + encodeURIComponent(pay);
        await pg.goto(B + '/results.html?' + q, { waitUntil: 'networkidle2' }); await sleep(500);
        await pg.evaluate(() => { const c = document.querySelector('.hc'); if (c) c.click(); }); await sleep(350);
        await pg.evaluate(() => { const l = document.getElementById('langBtn'); if (l) l.click(); }); await sleep(250);
        const s = await state(pg); if (s.x || pg._dlg) exec++; if (s.bad) inj++;
        await pg.browserContext().close();
        if (param === 'd') break;
      }
    }
    ok('results.html param "' + param + '": no script execution, no injected elements', exec === 0 && inj === 0, 'exec=' + exec + ' injected=' + inj);
  }
  // 2) تعديل البحث بنص خبيث
  { const pg = await page(); await pg.goto(B + '/results.html?d=Dubai', { waitUntil: 'networkidle2' }); await sleep(500);
    let exec = 0, inj = 0;
    for (const pay of PAY) { await pg.evaluate(v => { document.getElementById('editBtn').click(); document.getElementById('e_dest').value = v; document.getElementById('e_go').click(); }, pay); await sleep(500);
      await pg.evaluate(() => { const c = document.querySelector('.hc'); if (c) c.click(); }); await sleep(300); await pg.keyboard.press('Escape'); await sleep(250);
      const s = await state(pg); if (s.x || pg._dlg) exec++; if (s.bad) inj++; }
    ok('edit-search field: payloads rendered as text only', exec === 0 && inj === 0, 'exec=' + exec + ' injected=' + inj); await pg.browserContext().close(); }
  // 3) تنظيف وقص النص
  { const pg = await page(); const long = 'A'.repeat(300), hidden = 'Par‮is​\u0007';
    await pg.goto(B + '/results.html?d=' + encodeURIComponent(long), { waitUntil: 'networkidle2' }); await sleep(400);
    const l1 = await pg.evaluate(() => document.getElementById('title').textContent.length);
    await pg.goto(B + '/results.html?d=' + encodeURIComponent(hidden), { waitUntil: 'networkidle2' }); await sleep(400);
    const t2 = await pg.evaluate(() => document.getElementById('title').textContent);
    ok('destination text is capped and stripped of hidden characters', l1 < 120 && !/[‪-‮​-‏\u0000-\u001F]/.test(t2), 'len=' + l1);
    await pg.goto(B + '/results.html?d=Dubai&n=' + encodeURIComponent('Free iPhone here'), { waitUntil: 'networkidle2' }); await sleep(400);
    const t3 = await pg.evaluate(() => document.getElementById('title').textContent);
    ok('listed destination ignores a mismatching display name', !/iPhone/.test(t3), t3);
    await pg.goto(B + '/results.html?d=Dubai&ci=' + encodeURIComponent('2026-13-99"><b>') + '&co=zz', { waitUntil: 'networkidle2' }); await sleep(400);
    const m = await pg.evaluate(() => document.getElementById('meta').textContent);
    ok('invalid dates fall back to defaults', !/Invalid/i.test(m) && pg._e.length === 0, m.slice(0, 60)); await pg.browserContext().close(); }
  // 4) ردود ويكيبيديا خبيثة: روابط صور غير مسموحة لا تُستخدم
  { const evil = ['javascript:window.__x=1', 'http://evil.example/a.jpg', 'https://evil.example/a.jpg', 'https://upload.wikimedia.org.evil.example/a.jpg', 'data:text/html,<script>window.__x=1</script>'];
    let used = 0, exec = 0;
    for (const e of evil) {
      const pg = await page(u => { const t = decodeURIComponent(new URL(u).searchParams.get('titles') || 'x').split('|'); const pages = {};
        t.forEach((x, i) => pages[i + 1] = { title: x, pageimage: 'A"onerror="window.__x=1.jpg', imagerepository: 'shared', thumbnail: { source: e }, imageinfo: [{ thumburl: e, width: 2000, height: 1200, mime: 'image/jpeg', extmetadata: { Artist: { value: '<img src=x onerror="window.__x=1">' }, LicenseShortName: { value: '<svg onload="window.__x=1">' } } }] });
        return { query: { pages } }; });
      for (const d of ['Paris', 'Zzzland']) { await pg.goto(B + '/results.html?d=' + d, { waitUntil: 'networkidle2' }); await sleep(900);
        const r = await pg.evaluate(e => ({ bg: document.getElementById('top').style.backgroundImage.includes('evil') || document.getElementById('top').style.backgroundImage.includes('javascript'), img: [...document.querySelectorAll('img')].filter(i => /evil\.example|^javascript:|^data:text/.test(i.getAttribute('src') || '')).length, x: window.__x === 1 }), e);
        if (r.bg || r.img || pg._evil) used++; if (r.x || pg._dlg) exec++; }
      await pg.browserContext().close(); }
    ok('hostile Wikipedia responses: foreign image URLs never used, credits rendered as text', used === 0 && exec === 0, 'used=' + used + ' exec=' + exec); }
  // 5) تخزين محلي مسموم في الصفحة الرئيسية
  { const pg = await page(); await pg.goto(B + '/', { waitUntil: 'networkidle2' });
    await pg.evaluate(pay => { localStorage.setItem('nuzul_last', JSON.stringify({ d: pay, n: pay, name: pay, ci: '2026-12-10', co: '2026-12-13', a: 2, r: 1, ts: Date.now() })); localStorage.setItem('nuzul_favs', JSON.stringify([{ id: pay, city: 'dubai', d: pay, cityAr: pay, n: pay, ar: pay }])); localStorage.setItem('nuzul_visits', '5'); }, PAY[0]);
    await pg.reload({ waitUntil: 'networkidle2' }); await sleep(900); const s = await state(pg);
    ok('home page: poisoned saved searches and favourites rendered as text', !s.x && !pg._dlg && !s.bad, JSON.stringify(s)); await pg.browserContext().close(); }
  // 6) روابط خارجية
  { const pg = await page(); let miss = [];
    for (const u of ['/', '/results.html?d=Dubai', '/privacy.html']) { await pg.goto(B + u, { waitUntil: 'networkidle2' }); await sleep(700);
      if (u.startsWith('/results')) { await pg.evaluate(() => document.querySelector('.hc').click()); await sleep(400); }
      miss = miss.concat(await pg.evaluate(() => [...document.querySelectorAll('a[target="_blank"]')].filter(a => !/noopener/.test(a.rel)).map(a => a.href.slice(0, 50)))); }
    ok('every new-tab link has rel=noopener', miss.length === 0, miss.join(', ')); await pg.browserContext().close(); }
  // 7) سياسة أمان المحتوى (CSP): موجودة، ما تكسر الاستخدام العادي، وتمنع تحميل سكربت خارجي
  { const viol = []; let present = 0, blocked = 0;
    for (const u of ['/', '/results.html?d=Dubai', '/results.html?d=Zzzland', '/privacy.html', '/404.html']) {
      const pg = await page(x => ({ query: { pages: { 1: { title: 'x', pageimage: 'A.jpg', imagerepository: 'shared', thumbnail: { source: 'https://upload.wikimedia.org/a.jpg' }, imageinfo: [{ thumburl: 'https://upload.wikimedia.org/b.jpg', width: 2000, height: 1200, mime: 'image/jpeg', extmetadata: {} }] } } } }));
      pg.on('console', m => { if (/Content Security Policy|Refused to/i.test(m.text())) viol.push(u + ' :: ' + m.text().slice(0, 140)); });
      await pg.goto(B + u, { waitUntil: 'networkidle2' }); await sleep(900);
      if (await pg.evaluate(() => !!document.querySelector('meta[http-equiv="Content-Security-Policy"]'))) present++;
      await pg.evaluate(async () => { for (let y = 0; y < document.documentElement.scrollHeight; y += 600) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 40)); } const c = document.querySelector('.hc'); if (c) c.click(); const l = document.getElementById('langBtn'); if (l) l.click(); }); await sleep(600);
      const before = viol.length;
      const got = await pg.evaluate(() => new Promise(res => { let hit = false; document.addEventListener('securitypolicyviolation', () => { hit = true; }); const s = document.createElement('script'); s.src = 'https://evil.example/x.js'; s.onerror = () => setTimeout(() => res(hit), 50); s.onload = () => res(false); document.head.appendChild(s); setTimeout(() => res(hit), 1500); }));
      if (got) blocked++; viol.length = before;
      await pg.browserContext().close(); }
    ok('CSP meta tag present on all 5 page types', present === 5, 'present=' + present);
    ok('CSP: no violations during normal use', viol.length === 0, viol.slice(0, 3).join(' | '));
    ok('CSP: a script from a foreign host is blocked', blocked === 5, 'blocked=' + blocked); }
  // 8) إضافتان بعد مراجعة الإغلاق (24 نوفمبر 2026) تسدّان ثغرتين في الاختبار نفسه
  // 8-أ) الاسم المعروض n يبدأ بحرف عربي: الصفحة القديمة كانت تثق في n بهذا الشكل فقط، والحمولات فوق ما فيها حرف عربي فما كانت تختبره
  { let exec = 0, inj = 0, shown = 0;
    for (const pay of PAY) { const pg = await page();
      await pg.goto(B + '/results.html?d=Zzzland&n=' + encodeURIComponent('ع ' + pay), { waitUntil: 'networkidle2' }); await sleep(500);
      if (await pg.evaluate(() => document.getElementById('title').textContent.indexOf('ع') >= 0)) shown++;
      await pg.evaluate(() => { const c = document.querySelector('.hc'); if (c) c.click(); }); await sleep(350);
      const s1 = await state(pg);
      await pg.evaluate(() => { const l = document.getElementById('langBtn'); if (l) l.click(); }); await sleep(250);
      const s2 = await state(pg); if (s1.x || s2.x || pg._dlg) exec++; if (s1.bad || s2.bad) inj++;
      await pg.browserContext().close(); }
    ok('results.html display name "n" with an Arabic letter: shown as text, no script execution, no injected elements', exec === 0 && inj === 0 && shown === PAY.length, 'exec=' + exec + ' injected=' + inj + ' shown=' + shown); }
  // 8-ب) آخر بحث محفوظ: خانات البالغين والغرف والتواريخ فيها حمولة (الفحص رقم 5 فوق يسمّم خانات النص فقط)
  { let exec = 0, inj = 0, err = 0, n = 0; const pg = await page(); await pg.goto(B + '/', { waitUntil: 'networkidle2' });
    for (const pay of PAY) for (const pre of ['', '3']) { const e0 = pg._e.length; n++; pg._dlg = 0;
      await pg.evaluate(v => { localStorage.clear(); localStorage.setItem('nuzul_last', JSON.stringify({ d: 'Dubai', n: '', name: 'Dubai', ci: '2031-05-10' + v, co: '2031-05-13' + v, a: v, r: v, ts: Date.now() })); }, pre + pay);
      await pg.reload({ waitUntil: 'networkidle2' }); await sleep(500);
      await pg.evaluate(() => { const l = document.getElementById('langBtn'); if (l) l.click(); }); await sleep(250);
      const s = await state(pg); if (s.x || pg._dlg) exec++; if (s.bad) inj++; if (pg._e.length > e0) err++; }
    ok('home page: saved-search adults, rooms and dates carrying markup are never written as markup', exec === 0 && inj === 0 && err === 0, 'exec=' + exec + ' injected=' + inj + ' errors=' + err + ' cases=' + n); await pg.browserContext().close(); }
  console.log(out.join('\n')); console.log('total', out.length, 'pass', out.filter(x => x.startsWith('PASS')).length);
  if (process.env.OUT) require('fs').writeFileSync(process.env.OUT, out.join('\n'));
  if (out.some(x => x.startsWith('FAIL'))) process.exitCode = 1;
  await b.close();
})();
