// نُزُل — اختبارات حدود يونيكود (انحدار F-3): اسم الوجهة ينقص عند 80 خانة بدون ما ينقسم إيموجي أو حرف مركّب
// التشغيل: BASE=http://localhost:8765 node tests/unicode.js
const p = require(process.env.PUPPETEER || 'puppeteer-core');
const B = process.env.BASE || 'http://localhost:8765';
const sleep = ms => new Promise(r => setTimeout(r, ms));
const out = []; const ok = (n, c, x) => out.push((c ? 'PASS ' : 'FAIL ') + n + (x ? ' :: ' + x : ''));
const H = { 'access-control-allow-origin': '*', 'content-type': 'application/json' };
const MAX = 80;
// الحروف اللي نختبر القص عندها: كل واحد منها «حرف واحد» في نظر القارئ لكنه أكثر من خانة
const TAILS = [
  ['emoji (surrogate pair)', '\u{1F600}'],
  ['emoji + skin tone', '\u{1F44D}\u{1F3FD}'],
  ['flag (two regional indicators)', '\u{1F1E6}\u{1F1EA}'],
  ['keycap digit', '1\uFE0F\u20E3'],
  ['symbol + variation selector', '\u2708\uFE0F'],
  ['Latin letter + combining accent', 'e\u0301'],
  ['Arabic letter + two marks', 'ن\u064F\u0651'],
  ['Hangul syllable in three parts', '\u1112\u1161\u11AB'],
  ['letter outside the basic plane', '\u{1D4B3}'],
  ['CJK character outside the basic plane', '\u{20BB7}'],
  ['family emoji with joiners (joiners are stripped as hidden characters)', '\u{1F468}\u200D\u{1F469}\u200D\u{1F467}']
];
// المواصفة: نشيل الرموز المخفية، ثم أطول بداية من حروف كاملة ما تتجاوز 80 خانة، وبدون أي نصف رمز
const HIDDEN = /[\u0000-\u001F\u007F-\u009F\u200B-\u200F\u202A-\u202E\u2060-\u2069\uFEFF]/g;
const tidy = s => s.replace(HIDDEN, '').replace(/\s+/g, ' ').trim();
const lone = ch => ch.length === 1 && ch >= '\uD800' && ch <= '\uDFFF';
const wellFormed = s => !Array.from(s).some(lone);
const spec = s => { let t = tidy(s);
  if (t.length > MAX) { let o = ''; for (const g of new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(t)) { if (o.length + g.segment.length > MAX) break; o += g.segment; }
    if (!o) for (const ch of t) { if (o.length + ch.length > MAX) break; o += ch; }
    t = o; }
  return Array.from(t).filter(ch => !lone(ch)).join('').trim(); };
const show = s => Array.from(s.slice(-6)).map(c => 'U+' + c.codePointAt(0).toString(16).toUpperCase()).join(' ');

(async () => {
  const b = await p.launch({ executablePath: process.env.CHROME || '/usr/bin/google-chrome', args: ['--no-sandbox'] });
  async function page() {
    const cx = await (b.createBrowserContext ? b.createBrowserContext() : b.createIncognitoBrowserContext());
    const pg = await cx.newPage(); pg._e = []; pg.on('pageerror', e => pg._e.push(String(e.message).split('\n')[0].slice(0, 60)));
    await pg.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
    await pg.setRequestInterception(true);
    pg.on('request', r => { let h = ''; try { h = new URL(r.url()).hostname; } catch (e) {}
      if (/(^|\.)wikipedia\.org$/.test(h) || (h === 'commons.wikimedia.org' && /\/w\/api/.test(r.url()))) return r.respond({ status: 200, headers: H, body: '{"query":{"pages":{}}}' });
      if (/wikimedia\.org$|cloudflareinsights\.com$|fonts\.googleapis\.com$|fonts\.gstatic\.com$/.test(h)) return r.abort();
      r.continue(); });
    return pg;
  }
  // حالة الصفحة بعد أي بحث: الاسم المستخدم (من خانة التعديل)، البطاقات، وروابط الحجز تنفك بدون خطأ
  const read = pg => pg.evaluate(() => { const $ = id => document.getElementById(id); $('editBtn').click(); const name = $('e_dest').value; $('editBtn').click();
    let links = 0, badLinks = 0; document.querySelectorAll('#cards .pc a.cta').forEach(a => { links++; try { decodeURIComponent(a.href); } catch (e) { badLinks++; } });
    return { name, cards: document.querySelectorAll('#hl .hc').length, links, badLinks }; });
  const judge = (input, s, errs) => { const want = spec(input); const why = [];
    if (errs) why.push('script error');
    if (s.cards < 1 || s.links !== 4 || s.badLinks) why.push('cards=' + s.cards + ' links=' + s.links + ' badLinks=' + s.badLinks);
    if (!wellFormed(s.name)) why.push('half a character left in the name');
    if (s.name.length > MAX) why.push('name longer than ' + MAX);
    if (s.name !== want) why.push('name ends with ' + show(s.name) + ' expected ' + show(want));
    return why; };

  // 1) خانة تعديل البحث: لكل حرف، كل المواضع حول حد الـ80 (قبله، عنده، داخله، بعده)
  { const pg = await page(); await pg.goto(B + '/results.html?lang=en&d=Zzzland', { waitUntil: 'networkidle2' }); await sleep(300);
    for (const [label, tail] of TAILS) { const L = tidy(tail).length; const fails = []; let n = 0;
      for (let k = MAX - L - 1; k <= MAX; k++) { const input = 'a'.repeat(k) + tail + 'zz'; const e0 = pg._e.length; n++;
        await pg.evaluate(v => { const $ = id => document.getElementById(id); $('e_dest').value = v; $('e_go').click(); }, input); await sleep(40);
        const why = judge(input, await read(pg), pg._e.length - e0); if (why.length) fails.push(k + ' letters: ' + why[0]); }
      ok('edit field | ' + label + ' | ' + n + ' positions around the ' + MAX + '-character cut', fails.length === 0, fails.length ? fails.length + ' wrong, e.g. ' + fails[0] : ''); }
    // نص كله إيموجي، وحرف واحد مع 100 علامة (أطول من الحد لحاله)، وأنصاف رموز مكتوبة باليد
    for (const [label, input, expectName] of [
      ['50 emoji in a row', '\u{1F600}'.repeat(50), '\u{1F600}'.repeat(40)],
      ['one letter carrying 100 combining marks', 'a' + '\u0301'.repeat(100) + ' b', 'a' + '\u0301'.repeat(79)],
      ['half a character at the end', 'Paris\uD83D', 'Paris'],
      ['half a character at the start', '\uDE00Paris', 'Paris'],
      ['half a character in the middle', 'Pa\uD83Dris', 'Paris'],
      ['only half characters', '\uD83D😀\uDE00', '\u{1F600}']]) {
      const e0 = pg._e.length;
      await pg.evaluate(v => { const $ = id => document.getElementById(id); $('e_dest').value = v; $('e_go').click(); }, input); await sleep(40);
      const s = await read(pg); const why = judge(input, s, pg._e.length - e0); if (s.name !== expectName) why.push('name is ' + show(s.name));
      ok('edit field | ' + label, why.length === 0, why[0] || ''); }
    await pg.browserContext().close(); }

  // 2) الرابط نفسه (d): القص يقع داخل الحرف
  for (const [label, tail] of TAILS) { const pg = await page(); const input = 'a'.repeat(MAX - 1) + tail + 'zz';
    await pg.goto(B + '/results.html?lang=en&d=' + encodeURIComponent(input), { waitUntil: 'networkidle2' }); await sleep(300);
    const why = judge(input, await read(pg), pg._e.length);
    ok('link, destination | ' + label + ' | cut lands inside the character', why.length === 0, why[0] || ''); await pg.browserContext().close(); }

  // 3) الاسم المعروض بالعربي (n) مع وجهة غير مدرجة: نفس القص
  for (const [label, tail] of [TAILS[0], TAILS[2], TAILS[6], TAILS[5]]) { const pg = await page(); const input = 'ب'.repeat(MAX - 1) + tail + 'بب';
    await pg.goto(B + '/results.html?d=Zzzland&n=' + encodeURIComponent(input), { waitUntil: 'networkidle2' }); await sleep(300);
    const s = await pg.evaluate(() => { const $ = id => document.getElementById(id); $('editBtn').click(); const name = $('e_dest').value; $('editBtn').click();
      let links = 0, badLinks = 0; document.querySelectorAll('#cards .pc a.cta').forEach(a => { links++; try { decodeURIComponent(a.href); } catch (e) { badLinks++; } });
      return { name, cards: document.querySelectorAll('#hl .hc').length, links, badLinks, title: document.getElementById('title').textContent }; });
    const why = judge(input, s, pg._e.length); if (!wellFormed(s.title)) why.push('half a character in the page title');
    ok('link, Arabic display name | ' + label + ' | cut lands inside the character', why.length === 0, why[0] || ''); await pg.browserContext().close(); }

  // 4) من خانة البحث في الصفحة الرئيسية: نص طويل آخره إيموجي ← صفحة نتائج سليمة
  { const pg = await page(); const input = 'a'.repeat(MAX - 1) + '\u{1F600}' + 'zz';
    await pg.goto(B + '/', { waitUntil: 'networkidle2' }); await sleep(300);
    const href = await pg.evaluate(v => { const $ = id => document.getElementById(id); $('dest').value = v; $('dest').dispatchEvent(new Event('input', { bubbles: true })); return $('go').getAttribute('href'); }, input);
    const e0 = pg._e.length;
    await pg.goto(new URL(href, B + '/').href + '&lang=en', { waitUntil: 'networkidle2' }); await sleep(300);
    const why = judge(input, await read(pg), pg._e.length - e0);
    ok('home search box | long text ending in an emoji leads to a working results page', e0 === 0 && why.length === 0, (e0 ? 'home page script error; ' : '') + (why[0] || '')); await pg.browserContext().close(); }

  // 5) «كمّل من وين وقفت» باسم محفوظ كله إيموجي وعلامات: يظهر بدون خطأ
  { const pg = await page(); await pg.goto(B + '/', { waitUntil: 'networkidle2' });
    const name = '\u{1F600}'.repeat(60) + 'ن\u064F\u0651' + '\u{1F1E6}\u{1F1EA}';
    await pg.evaluate(n => localStorage.setItem('nuzul_last', JSON.stringify({ d: n, n: n, name: n, ci: '2031-05-10', co: '2031-05-13', a: 2, r: 1, ts: Date.now() })), name);
    await pg.reload({ waitUntil: 'networkidle2' }); await sleep(400);
    const s = await pg.evaluate(() => { const b = document.querySelector('#nzkeep .c.last b'), a = document.querySelector('#nzkeep a.go'); let okLink = false; try { okLink = !!a && !!new URL(a.href).searchParams.get('d'); } catch (e) {} return { shown: b ? b.textContent : '', okLink }; });
    ok('home "continue" box | saved name made of emoji, marks and a flag is shown whole with a working link', pg._e.length === 0 && s.shown === name && s.okLink, pg._e[0] || (s.shown === name ? '' : 'name changed')); await pg.browserContext().close(); }

  console.log(out.join('\n')); console.log('total', out.length, 'pass', out.filter(x => x.startsWith('PASS')).length);
  if (process.env.OUT) require('fs').writeFileSync(process.env.OUT, out.join('\n'));
  if (out.some(x => x.startsWith('FAIL'))) process.exitCode = 1;
  await b.close();
})();
