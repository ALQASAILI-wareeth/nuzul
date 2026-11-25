// نُزُل — اختبارات التواريخ في مناطق زمنية مختلفة (انحدار F-1: تاريخ المغادرة كان يطلع نفس يوم الوصول غرب UTC)
// التشغيل: BASE=http://localhost:8765 node tests/timezones.js
const p = require(process.env.PUPPETEER || 'puppeteer-core');
const B = process.env.BASE || 'http://localhost:8765';
const sleep = ms => new Promise(r => setTimeout(r, ms));
const out = []; const ok = (n, c, x) => out.push((c ? 'PASS ' : 'FAIL ') + n + (x ? ' :: ' + x : ''));
const H = { 'access-control-allow-origin': '*', 'content-type': 'application/json' };
// المناطق الخمس اللي انكتبت في الملاحظة F-1 (عليها *)، وبعدها مناطق زيادة: أبعد غرب، أبعد شرق، أنصاف ساعات، وجزر الأطلسي
const ZONES = ['Asia/Dubai', 'Europe/London', 'America/New_York', 'America/Los_Angeles', 'Pacific/Auckland',
  'Asia/Riyadh', 'Africa/Cairo', 'America/Sao_Paulo', 'America/St_Johns', 'Atlantic/Azores', 'Pacific/Honolulu', 'Pacific/Pago_Pago', 'Asia/Kolkata', 'Pacific/Kiritimati', 'UTC'];
const FIVE = ZONES.slice(0, 5);
// تواريخ حول تغيير التوقيت الصيفي في مناطق مختلفة، ونهايات الشهور والسنة، واليوم الكبيس
const EDGE = ['2028-02-28', '2028-02-29', '2028-03-11', '2028-03-12', '2028-03-25', '2028-03-26', '2028-04-01', '2028-04-02', '2028-04-27', '2028-04-28',
  '2028-09-23', '2028-09-24', '2028-10-26', '2028-10-28', '2028-10-29', '2028-11-04', '2028-11-05', '2028-12-31'];
const ymdIn = (tz, d) => new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);
const plus = (s, k) => { const a = s.split('-').map(Number); return new Date(Date.UTC(a[0], a[1] - 1, a[2] + k)).toISOString().slice(0, 10); };
const stay = href => { const u = decodeURIComponent(decodeURIComponent(href || '')); const m = u.match(/startDate=(\d{4}-\d\d-\d\d)&endDate=(\d{4}-\d\d-\d\d)/); return m ? m[1] + '>' + m[2] : 'none'; };

(async () => {
  const b = await p.launch({ executablePath: process.env.CHROME || '/usr/bin/google-chrome', args: ['--no-sandbox'] });
  async function page(tz) {
    const cx = await (b.createBrowserContext ? b.createBrowserContext() : b.createIncognitoBrowserContext());
    const pg = await cx.newPage(); pg._e = []; pg.on('pageerror', e => pg._e.push(String(e.message).split('\n')[0].slice(0, 80)));
    await pg.emulateTimezone(tz);
    await pg.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
    await pg.setRequestInterception(true);
    pg.on('request', r => { let h = ''; try { h = new URL(r.url()).hostname; } catch (e) {}
      if (/(^|\.)wikipedia\.org$/.test(h) || (h === 'commons.wikimedia.org' && /\/w\/api/.test(r.url()))) return r.respond({ status: 200, headers: H, body: '{"query":{"pages":{}}}' });
      if (/wikimedia\.org$|cloudflareinsights\.com$|fonts\.googleapis\.com$|fonts\.gstatic\.com$/.test(h)) return r.abort();
      r.continue(); });
    return pg;
  }
  for (const tz of ZONES) {
    const tag = (FIVE.includes(tz) ? '*' : ' ') + tz;
    const pg = await page(tz);
    try {
      // 1) الصفحة الرئيسية: التواريخ الافتراضية (الوصول باكر، المغادرة بعد 3 ليالي، وأقل تاريخ = اليوم)
      const t0 = ymdIn(tz, new Date());
      await pg.goto(B + '/', { waitUntil: 'networkidle2' }); await sleep(300);
      // نتأكد أول إن المتصفح فعلاً على المنطقة المطلوبة: ساعة الصيف وساعة الشتاء تطابق حساب Node لنفس المنطقة
      const clock = { hour: '2-digit', day: '2-digit', hourCycle: 'h23' }, at = [Date.UTC(2028, 0, 1, 12), Date.UTC(2028, 6, 1, 12)];
      const want = at.map(x => new Intl.DateTimeFormat('en-GB', Object.assign({ timeZone: tz }, clock)).format(x)).join('|');
      const d = await pg.evaluate((at, clock) => { const $ = id => document.getElementById(id); return { clock: at.map(x => new Intl.DateTimeFormat('en-GB', clock).format(x)).join('|'), cin: $('cin').value, cout: $('cout').value, min: $('cin').min }; }, at, clock);
      const t1 = ymdIn(tz, new Date());
      ok(tag + ' | browser clock is in this time zone', d.clock === want, 'page ' + d.clock + ' expected ' + want);
      ok(tag + ' | home: default dates are tomorrow and three nights later, earliest check-in is today',
        [t0, t1].some(t => d.min === t && d.cin === plus(t, 1) && d.cout === plus(t, 4)), 'today=' + t1 + ' got ' + d.cin + '>' + d.cout + ' min=' + d.min);
      // 2) الصفحة الرئيسية: كل يوم في سنة 2028 (كبيسة) كتاريخ وصول ← المغادرة = اليوم التالي، بدون رسالة خطأ، وزر البحث شغّال
      const h = await pg.evaluate(() => { const $ = id => document.getElementById(id); const bad = [];
        const next = s => { const a = s.split('-').map(Number); return new Date(Date.UTC(a[0], a[1] - 1, a[2] + 1)).toISOString().slice(0, 10); };
        $('dest').value = 'Dubai'; $('dest').dispatchEvent(new Event('input', { bubbles: true })); let n = 0;
        for (let i = 0; i < 366; i++) { const ci = new Date(Date.UTC(2028, 0, 1 + i)).toISOString().slice(0, 10), want = next(ci); n++;
          $('cin').value = ci; $('cin').dispatchEvent(new Event('change', { bubbles: true }));
          if ($('cout').value !== want || $('cout').min !== want || $('go').classList.contains('off') || ($('err').textContent || '').trim()) bad.push(ci + '>' + $('cout').value); }
        return { n, bad: bad.length, first: bad.slice(0, 2).join(' '), href: $('go').getAttribute('href') || '' }; });
      ok(tag + ' | home: each of 366 check-in dates fills check-out with the next day, no error, search enabled',
        h.n === 366 && h.bad === 0 && /ci=2028-12-31&co=2029-01-01/.test(h.href), 'wrong=' + h.bad + (h.first ? ' e.g. ' + h.first : ''));
      // 3) صفحة النتائج بدون تواريخ في الرابط: نفس التواريخ الافتراضية، ورابط الحجز يحملها
      const r0 = ymdIn(tz, new Date());
      await pg.goto(B + '/results.html?d=Dubai', { waitUntil: 'networkidle2' }); await sleep(300);
      const r = await pg.evaluate(() => { const $ = id => document.getElementById(id); $('editBtn').click(); const a = document.querySelector('#cards .pc a.cta');
        return { cin: $('e_cin').value, cout: $('e_cout').value, min: $('e_cin').min, href: a ? a.href : '' }; });
      const r1 = ymdIn(tz, new Date());
      ok(tag + ' | results: default dates are tomorrow and three nights later, and the booking link carries them',
        [r0, r1].some(t => r.min === t && r.cin === plus(t, 1) && r.cout === plus(t, 4) && stay(r.href) === plus(t, 1) + '>' + plus(t, 4)), 'got ' + r.cin + '>' + r.cout + ' link ' + stay(r.href));
      // 4) نموذج تعديل البحث: كل يوم في 2028 كتاريخ وصول ← المغادرة وأقل تاريخ لها = اليوم التالي
      const e = await pg.evaluate(() => { const $ = id => document.getElementById(id); const bad = [];
        const next = s => { const a = s.split('-').map(Number); return new Date(Date.UTC(a[0], a[1] - 1, a[2] + 1)).toISOString().slice(0, 10); }; let n = 0;
        for (let i = 0; i < 366; i++) { const ci = new Date(Date.UTC(2028, 0, 1 + i)).toISOString().slice(0, 10), want = next(ci); n++;
          $('e_cin').value = ci; $('e_cin').dispatchEvent(new Event('change', { bubbles: true }));
          if ($('e_cout').value !== want || $('e_cout').min !== want) bad.push(ci + '>' + $('e_cout').value); }
        return { n, bad: bad.length, first: bad.slice(0, 2).join(' ') }; });
      ok(tag + ' | results edit form: each of 366 check-in dates fills check-out with the next day', e.n === 366 && e.bad === 0, 'wrong=' + e.bad + (e.first ? ' e.g. ' + e.first : ''));
      // 5) «تحديث» بمغادرة في نفس يوم الوصول: تتصحح لليوم التالي في الرابط وفي رابط موقع الحجز
      const u = await pg.evaluate(list => { const $ = id => document.getElementById(id); const bad = [];
        const next = s => { const a = s.split('-').map(Number); return new Date(Date.UTC(a[0], a[1] - 1, a[2] + 1)).toISOString().slice(0, 10); };
        for (const ci of list) { $('e_dest').value = 'Dubai'; $('e_cin').value = ci; $('e_cout').value = ci; $('e_go').click();
          const q = new URLSearchParams(location.search), a = document.querySelector('#cards .pc a.cta'), l = decodeURIComponent(decodeURIComponent(a ? a.href : ''));
          if (q.get('ci') !== ci || q.get('co') !== next(ci) || l.indexOf('startDate=' + ci + '&endDate=' + next(ci)) < 0) bad.push(ci + '>' + q.get('co')); }
        return { n: list.length, bad: bad.length, first: bad.slice(0, 2).join(' ') }; }, EDGE);
      ok(tag + ' | results update: same-day check-out is corrected to the next day (' + EDGE.length + ' dates around clock changes, month ends, leap day)', u.bad === 0, 'wrong=' + u.bad + (u.first ? ' e.g. ' + u.first : ''));
      // 6) رابط فيه مغادرة مو بعد الوصول: الصفحة تصححها عند الفتح
      let badLoad = [];
      for (const [ci, co] of [['2028-03-12', '2028-03-12'], ['2028-12-31', '2028-06-01'], ['2028-02-29', '2028-02-29']]) {
        await pg.goto(B + '/results.html?d=Dubai&ci=' + ci + '&co=' + co, { waitUntil: 'networkidle2' }); await sleep(200);
        const s = await pg.evaluate(() => { const a = document.querySelector('#cards .pc a.cta'); return { href: a ? a.href : '', meta: document.getElementById('meta').textContent }; });
        if (stay(s.href) !== ci + '>' + plus(ci, 1) || /Invalid|NaN/.test(s.meta)) badLoad.push(ci + ' link ' + stay(s.href));
      }
      ok(tag + ' | results link with check-out not after check-in: corrected to the next day on load', badLoad.length === 0, badLoad.join(' ; '));
      // 7) «كمّل من وين وقفت»: تواريخ قديمة تتجدد من باكر بنفس عدد الليالي، وتواريخ قادمة تبقى مثل ما هي
      const k0 = ymdIn(tz, new Date()), fut = [plus(k0, 30), plus(k0, 34)];
      await pg.goto(B + '/', { waitUntil: 'networkidle2' });
      const keep = async (ci, co) => { await pg.evaluate((ci, co) => localStorage.setItem('nuzul_last', JSON.stringify({ d: 'Dubai', n: '', name: 'Dubai', ci, co, a: 2, r: 1, ts: Date.now() })), ci, co);
        await pg.reload({ waitUntil: 'networkidle2' }); await sleep(300);
        return pg.evaluate(() => { const a = document.querySelector('#nzkeep a.go'); const q = a ? new URLSearchParams(a.getAttribute('href').split('?')[1]) : null; return q ? q.get('ci') + '>' + q.get('co') : 'none'; }); };
      const stale = await keep('2020-01-10', '2020-01-13'), kept = await keep(fut[0], fut[1]); const k1 = ymdIn(tz, new Date());
      ok(tag + ' | home "continue" box: stale dates restart from tomorrow with the same nights, future dates are kept',
        [k0, k1].some(t => stale === plus(t, 1) + '>' + plus(t, 4)) && kept === fut[0] + '>' + fut[1], 'stale ' + stale + ' kept ' + kept);
      ok(tag + ' | no script errors during the date checks', pg._e.length === 0, pg._e.slice(0, 2).join(' ; '));
    } catch (err) { ok(tag + ' | test run completed', false, String(err.message).slice(0, 120)); }
    await pg.browserContext().close();
  }
  console.log(out.join('\n')); console.log('total', out.length, 'pass', out.filter(x => x.startsWith('PASS')).length);
  if (process.env.OUT) require('fs').writeFileSync(process.env.OUT, out.join('\n'));
  if (out.some(x => x.startsWith('FAIL'))) process.exitCode = 1;
  await b.close();
})();
