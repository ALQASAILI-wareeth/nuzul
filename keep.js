/* نُزُل — ما يرجّع الزائر: آخر بحث، المفضلة، الإضافة للشاشة الرئيسية.
   كل شي محفوظ على جهاز الزائر فقط (localStorage)، بدون تسجيل وبدون إرسال لأي خادم. */
(function () {
  'use strict';
  var K_LAST = 'nuzul_last', K_FAV = 'nuzul_favs', K_HIST = 'nuzul_history', HIST_MAX = 300, K_VIS = 'nuzul_visits', K_A2HS = 'nuzul_a2hs_off';

  function get(k, d) { try { var v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } }
  function set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function pad(n) { return String(n).padStart(2, '0'); }
  function ymd(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return {'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]; }); }
  function lang() { return document.documentElement.lang === 'en' ? 'en' : 'ar'; }
  // البيانات المحفوظة في المتصفح ممكن ترجع بأي شكل (قديمة، تالفة، أو معدّلة باليد): ننظفها قبل أي استخدام
  function str(v) { return typeof v === 'string' ? v : ''; }
  function num(v, lo, hi, d) { var n = (typeof v === 'number' || typeof v === 'string') ? Math.round(Number(v)) : NaN; return isFinite(n) && n !== 0 ? Math.min(hi, Math.max(lo, n)) : d; }
  function isYmd(s) { if (typeof s !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return false; var a = s.split('-'), d = new Date(+a[0], +a[1] - 1, +a[2], 12); return !isNaN(d) && ymd(d) === s; }

  var T = {
    ar: {h: 'كمّل من وين وقفت', last: 'آخر بحث', go: 'كمّل بحثك', favH: 'مفضلتك', see: 'شوف السعر', rm: 'حذف من المفضلة',
      nights: function (n) { return n === 1 ? 'ليلة' : n === 2 ? 'ليلتين' : n + ' ليالي'; }, ad: function (n) { return n === 1 ? 'بالغ واحد' : n + ' بالغين'; },
      histH: 'رحلاتي السابقة', histAll: function (n) { return 'عرض الكل (' + n + ')'; }, histLess: 'عرض أقل', histRm: 'حذف من السجل',
      histDel: 'حذف', histWent: 'فتحت موقع الحجز', histSite: function (x) { return 'فتحت ' + x; }, histNote: 'اسحب الرحلة لليمين عشان تحذفها. السجل محفوظ على جهازك فقط، وأضف نُزُل للشاشة الرئيسية عشان يبقى.',
      a2: '📲 خلّ نُزُل على شاشتك الرئيسية عشان توصله بضغطة.', a2ios: 'اضغط زر المشاركة ثم «إضافة إلى الشاشة الرئيسية».', a2b: 'أضف', a2x: 'إغلاق'},
    en: {h: 'Pick up where you left off', last: 'Last search', go: 'Continue', favH: 'Your favourites', see: 'See price', rm: 'Remove from favourites',
      nights: function (n) { return n + (n === 1 ? ' night' : ' nights'); }, ad: function (n) { return n + (n === 1 ? ' adult' : ' adults'); },
      histH: 'My past trips', histAll: function (n) { return 'Show all (' + n + ')'; }, histLess: 'Show less', histRm: 'Remove from history',
      histDel: 'Delete', histWent: 'Opened a booking site', histSite: function (x) { return 'Opened ' + x; }, histNote: 'Swipe a trip left to delete it. Saved on this device only; add Nuzul to your home screen to keep it.',
      a2: '📲 Keep Nuzul on your home screen for one-tap access.', a2ios: 'Tap Share, then “Add to Home Screen”.', a2b: 'Add', a2x: 'Close'}
  };

  /* ---------- آخر بحث ---------- */
  function saveSearch(S, name) {
    if (!S || !S.d) return;
    set(K_LAST, {d: S.d, n: S.n || '', name: name || S.n || S.d, ci: S.cin, co: S.cout, a: S.adults, r: S.rooms, ts: Date.now()});
  }
  // آخر بحث بعد التنظيف: نصوص فقط، تواريخ صحيحة فقط، وعدد البالغين والغرف أرقام ضمن الحدود
  function lastSearch() {
    var v = get(K_LAST, null);
    if (!v || typeof v !== 'object' || Array.isArray(v) || !str(v.d).trim()) return null;
    return {d: str(v.d), n: str(v.n), name: str(v.name), ci: isYmd(v.ci) ? v.ci : '', co: isYmd(v.co) ? v.co : '', a: num(v.a, 1, 10, 2), r: num(v.r, 1, 5, 1)};
  }
  // التواريخ القديمة ما تنفع: نرجّع نفس عدد الليالي ابتداءً من بكرة
  function freshDates(ci, co) {
    var today = ymd(new Date());
    if (ci && co && ci >= today && co > ci) return {ci: ci, co: co, kept: true};
    var n = 3;
    if (ci && co) { var d = Math.round((new Date(co) - new Date(ci)) / 864e5); if (d >= 1 && d <= 30) n = d; }
    var a = new Date(); a.setDate(a.getDate() + 1); var b = new Date(a); b.setDate(b.getDate() + n);
    return {ci: ymd(a), co: ymd(b), kept: false};
  }
  function resultsUrl(d, n, dates, a, r, extra) {
    var p = new URLSearchParams({d: d, n: n || '', ci: dates.ci, co: dates.co, a: a || 2, r: r || 1});
    if (extra) Object.keys(extra).forEach(function (k) { p.set(k, extra[k]); });
    return '/results.html?' + p.toString();
  }

  /* ---------- المفضلة ---------- */
  // المفضلة بعد التنظيف: نتجاهل أي عنصر مو كائن أو ناقص الاسم/المعرّف/الوجهة، والباقي يرجع نصوص فقط
  function favs() {
    var f = get(K_FAV, []);
    if (!Array.isArray(f)) return [];
    return f.filter(function (x) { return x && typeof x === 'object' && !Array.isArray(x) && str(x.id) && str(x.n) && str(x.d); })
      .map(function (x) { return {id: x.id, city: str(x.city), d: x.d, cityAr: str(x.cityAr), n: x.n, ar: str(x.ar), ts: num(x.ts, 0, 9e15, 0)}; });
  }
  function favId(city, hotel) { return (city + '|' + hotel).toLowerCase(); }
  function isFav(city, hotel) { var id = favId(city, hotel); return favs().some(function (f) { return f.id === id; }); }
  function toggleFav(o) {
    var id = favId(o.city, o.n), list = favs(), i = -1;
    list.forEach(function (f, j) { if (f.id === id) i = j; });
    if (i >= 0) list.splice(i, 1);
    else list.unshift({id: id, city: o.city, d: o.d, cityAr: o.cityAr || '', n: o.n, ar: o.ar || '', ts: Date.now()});
    set(K_FAV, list.slice(0, 40));
    return i < 0;
  }
  function favCount(city) { return favs().filter(function (f) { return f.city === city; }).length; }

  /* ---------- رحلاتي السابقة: كل فندق فتحه الزائر، من أول استخدام، على جهازه فقط ---------- */
  // السجل بعد التنظيف: نتجاهل أي عنصر تالف، والباقي نصوص وتواريخ صحيحة فقط
  function hist() {
    var h = get(K_HIST, []);
    if (!Array.isArray(h)) return [];
    return h.filter(function (x) { return x && typeof x === 'object' && !Array.isArray(x) && str(x.n) && str(x.d); })
      .map(function (x) { return {id: str(x.id), city: str(x.city), d: x.d, cityAr: str(x.cityAr), n: x.n, ar: str(x.ar), ci: isYmd(x.ci) ? x.ci : '', co: isYmd(x.co) ? x.co : '',
        a: num(x.a, 1, 10, 2), r: num(x.r, 1, 5, 1), ts: num(x.ts, 0, 9e15, 0), go: x.go === true, site: str(x.site).slice(0, 30)}; })
      .slice(0, HIST_MAX);
  }
  // نفس الفندق بنفس تاريخ الدخول = نفس الرحلة: نحدّثها وننقلها لفوق بدل ما نكررها
  function histKey(o) { return (str(o.city) + '|' + str(o.n) + '|' + str(o.ci)).toLowerCase(); }
  function addHistory(o) {
    if (!o || !str(o.n) || !str(o.d)) return;
    var id = histKey(o), list = hist(), old = null;
    list = list.filter(function (x) { if (x.id === id) { old = x; return false; } return true; });
    list.unshift({id: id, city: str(o.city), d: str(o.d), cityAr: str(o.cityAr), n: str(o.n), ar: str(o.ar), ci: isYmd(o.ci) ? o.ci : '', co: isYmd(o.co) ? o.co : '',
      a: num(o.a, 1, 10, 2), r: num(o.r, 1, 5, 1), ts: Date.now(), go: !!(old && old.go), site: old ? old.site : ''});
    set(K_HIST, list.slice(0, HIST_MAX));
  }
  function markBooked(o, site) {
    var id = histKey(o), list = hist(), hit = false;
    list.forEach(function (x) { if (x.id === id) { x.go = true; x.site = str(site).slice(0, 30); x.ts = Date.now(); hit = true; } });
    if (hit) set(K_HIST, list);
  }
  var histOpen = false;
  // سحب الرحلة نحو بداية السطر (يمين في العربي، يسار في الإنجليزي) يكشف زر الحذف، والضغط عليه يحذف
  var SW_OPEN = 92;
  function swipeRows(box) {
    var rtl = (document.documentElement.dir || (lang() === 'ar' ? 'rtl' : 'ltr')) === 'rtl', sg = rtl ? 1 : -1;
    var rows = [].slice.call(box.querySelectorAll('.hr'));
    function shut(except) { rows.forEach(function (r) { if (r !== except && r.classList.contains('open')) { r.classList.remove('open'); r.querySelector('.c').style.transform = ''; } }); }
    rows.forEach(function (r) {
      var c = r.querySelector('.c'), del = r.querySelector('.del'), x0 = 0, y0 = 0, base = 0, off = 0, drag = false, id = null, moved = false;
      c.addEventListener('pointerdown', function (e) { if (e.button > 0) return; id = e.pointerId; x0 = e.clientX; y0 = e.clientY; base = r.classList.contains('open') ? SW_OPEN : 0; off = base; drag = false; moved = false; });
      c.addEventListener('pointermove', function (e) {
        if (e.pointerId !== id) return; var dx = (e.clientX - x0) * sg, dy = e.clientY - y0;
        if (!drag) { if (Math.abs(dx) < 8 || Math.abs(dx) < Math.abs(dy)) { if (Math.abs(dy) > 10) id = null; return; } drag = true; moved = true; shut(r); r.classList.add('drag'); try { c.setPointerCapture(id); } catch (x) {} }
        off = Math.max(0, Math.min(SW_OPEN + 24, base + dx)); c.style.transform = 'translateX(' + (off * sg) + 'px)';
      });
      function end(e) { if (e.pointerId !== id) return; id = null; r.classList.remove('drag'); if (!drag) return; drag = false;
        var open = off > SW_OPEN / 2.5; r.classList.toggle('open', open); c.style.transform = open ? 'translateX(' + (SW_OPEN * sg) + 'px)' : ''; }
      c.addEventListener('pointerup', end); c.addEventListener('pointercancel', end);
      // بعد السحب ما نفتح الرابط بالغلط، ولو البطاقة مفتوحة أول ضغطة تقفلها
      c.addEventListener('click', function (e) { if (moved || r.classList.contains('open')) { e.preventDefault(); e.stopPropagation(); if (!moved) shut(); moved = false; } }, true);
      del.addEventListener('focus', function () { shut(r); r.classList.add('open'); c.style.transform = 'translateX(' + (SW_OPEN * sg) + 'px)'; });
      del.addEventListener('blur', function () { setTimeout(function () { if (document.activeElement !== del && !r.matches(':hover')) { r.classList.remove('open'); c.style.transform = ''; } }, 150); });
      del.onclick = function () { var hid = del.getAttribute('data-hrm'); r.classList.add('gone'); setTimeout(function () { set(K_HIST, hist().filter(function (h) { return h.id !== hid; })); renderHome(); }, 180); };
    });
    if (!document.__nzSw) { document.__nzSw = 1; document.addEventListener('pointerdown', function (e) { if (!e.target.closest || !e.target.closest('.nzk .hr')) { var b = document.getElementById('nzkeep'); if (b) [].slice.call(b.querySelectorAll('.hr.open')).forEach(function (r) { r.classList.remove('open'); r.querySelector('.c').style.transform = ''; }); } }); }
  }

  /* ---------- قسم «كمّل من وين وقفت» في الصفحة الرئيسية ---------- */
  function css() {
    if (document.getElementById('nzkeep-css')) return;
    var s = document.createElement('style'); s.id = 'nzkeep-css';
    s.textContent =
      '.nzk{max-width:1100px;margin:18px auto 0;padding:0 16px}' +
      '.nzk h2{font-size:19px;font-weight:800;color:#0A2540;margin:0 0 10px}' +
      '.nzk .row{display:grid;gap:10px;grid-template-columns:repeat(auto-fill,minmax(250px,1fr))}' +
      '.nzk .c{background:#fff;border:1px solid #E1E8EF;border-radius:16px;padding:12px 14px;display:flex;align-items:center;gap:10px;min-width:0}' +
      '.nzk .c.last{border:2px solid #00C2D1}' +
      '.nzk .c .tx{flex:1;min-width:0}' +
      '.nzk .c small{display:block;color:#4d5966;font-size:13px;font-weight:700}' +
      '.nzk .c b{display:block;font-size:16px;font-weight:800;color:#0A2540;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}' +
      '.nzk .c span{display:block;color:#5f6b78;font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}' +
      '.nzk .c a.go{flex-shrink:0;background:#FFB238;color:#0A2540;font-weight:800;font-size:14px;border-radius:12px;padding:0 14px;height:44px;display:flex;align-items:center;white-space:nowrap}' +
      '.nzk .c button{flex-shrink:0;width:44px;height:44px;border:0;background:#FFF0F0;color:#D32F2F;border-radius:12px;font-size:18px;cursor:pointer}' +
      '.nzk h3{font-size:15px;font-weight:800;color:#0A2540;margin:14px 0 8px}' +
      '.nzk .c small.went{color:#12804a;margin-top:2px}' +
      '.nzk .hb{display:flex;flex-wrap:wrap;gap:8px;margin-top:10px}' +
      '.nzk .hb button{height:40px;padding:0 14px;border-radius:999px;font:inherit;font-weight:800;font-size:14px;cursor:pointer;border:1.5px solid #dce7ee;background:#fff;color:#0A2540}' +
      '.nzk .hr{position:relative;border-radius:16px;overflow:hidden;transition:opacity .18s,transform .18s}' +
      '.nzk .hr.gone{opacity:0;transform:scale(.96)}' +
      '.nzk .hr .c{position:relative;z-index:1;height:100%;touch-action:pan-y;transition:transform .22s ease;user-select:none;-webkit-user-select:none}' +
      '.nzk .hr.drag .c{transition:none}' +
      '.nzk .hr .c a{-webkit-user-drag:none;-webkit-touch-callout:none}' +
      '.nzk .hr:not(.open):not(.drag) .del{opacity:0}' +
      '.nzk .hr .del{position:absolute;inset-block:0;inset-inline-end:0;width:92px;border:0;background:#d92d20;color:#fff;font:inherit;font-weight:800;font-size:14px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;cursor:pointer}' +
      '.nzk .hr .del span{font-size:20px;line-height:1}' +
      '.nzk .hr .del:focus-visible{outline:3px solid #FFB238;outline-offset:-4px}' +
      '@media(prefers-reduced-motion:reduce){.nzk .hr,.nzk .hr .c{transition:none}}' +
      '.nzk .hn{margin:8px 0 0;color:#4d5966;font-size:13.5px}' +
      '.nza{position:fixed;inset-inline:12px;bottom:12px;z-index:60;background:#0A2540;color:#fff;border-radius:16px;padding:12px 14px;box-shadow:0 10px 30px rgba(6,47,82,.35);display:flex;align-items:center;gap:10px;font-size:14px;line-height:1.5}' +
      '.nza p{margin:0;flex:1}.nza small{display:block;font-size:13.5px}' +
      '.nza button{border:0;border-radius:10px;height:44px;padding:0 14px;font:inherit;font-weight:800;cursor:pointer}' +
      '.nza .ok{background:#FFB238;color:#0A2540}.nza .x{background:transparent;color:#fff;width:44px;padding:0;font-size:20px}' +
      '@media(min-width:700px){.nza{inset-inline:auto 20px;max-width:420px}}';
    document.head.appendChild(s);
  }

  function renderHome() {
    var anchor = document.querySelector('.wrap.search'); if (!anchor) return;
    var L = T[lang()], last = lastSearch(), fv = favs(), hs = hist();
    var box = document.getElementById('nzkeep');
    if (!last && !fv.length && !hs.length) { if (box) box.remove(); return; }
    css();
    if (!box) { box = document.createElement('div'); box.id = 'nzkeep'; box.className = 'nzk'; anchor.after(box); }
    var ar = lang() === 'ar', loc = ar ? 'ar-AE' : 'en-GB';
    var dt = function (s) { return new Date(s + 'T12:00:00').toLocaleDateString(loc, {day: 'numeric', month: 'short'}); };
    var html = '<h2>' + L.h + '</h2><div class="row">';
    var base = last ? freshDates(last.ci, last.co) : freshDates('', '');
    if (last) {
      var n = Math.max(1, Math.round((new Date(base.co) - new Date(base.ci)) / 864e5));
      var nm = ar ? (last.name || last.n || last.d) : last.d;
      html += '<div class="c last"><div class="tx"><small>' + L.last + '</small><b>' + esc(nm) + '</b><span>' + esc(dt(base.ci) + ' – ' + dt(base.co) + ' · ' + L.nights(n) + ' · ' + L.ad(last.a)) + '</span></div>' +
        '<a class="go" href="' + esc(resultsUrl(last.d, last.n, base, last.a, last.r)) + '">' + L.go + '</a></div>';
    }
    html += '</div>';
    if (fv.length) {
      html += '<h3>❤️ ' + L.favH + ' (' + fv.length + ')</h3><div class="row">';
      fv.slice(0, 6).forEach(function (f) {
        html += '<div class="c"><div class="tx"><b>' + esc(ar ? (f.ar || f.n) : f.n) + '</b><span>' + esc(ar ? (f.cityAr || f.d) : f.d) + '</span></div>' +
          '<a class="go" href="' + esc(resultsUrl(f.d, '', base, last && last.a, last && last.r, {fav: 1})) + '">' + L.see + '</a>' +
          '<button type="button" data-rm="' + esc(f.id) + '" aria-label="' + L.rm + '" title="' + L.rm + '">✕</button></div>';
      });
      html += '</div>';
    }
    if (hs.length) {
      var mo = function (h) { var d = h.ci ? new Date(h.ci + 'T12:00:00') : new Date(h.ts); return isNaN(d) ? '' : d.toLocaleDateString(loc, {month: 'long', year: 'numeric'}); };
      html += '<h3 id="nzhist">🧳 ' + L.histH + ' (' + hs.length + ')</h3><div class="row">';
      (histOpen ? hs : hs.slice(0, 6)).forEach(function (h) {
        html += '<div class="hr"><button type="button" class="del" data-hrm="' + esc(h.id) + '" aria-label="' + L.histRm + '"><span aria-hidden="true">✕</span>' + L.histDel + '</button><div class="c"><div class="tx"><b>' + esc(ar ? (h.ar || h.n) : h.n) + '</b><span>' + esc((ar ? (h.cityAr || h.d) : h.d) + (mo(h) ? ' · ' + mo(h) : '')) + '</span>' +
          (h.go ? '<small class="went">✓ ' + esc(h.site ? L.histSite(h.site) : L.histWent) + '</small>' : '') + '</div>' +
          '<a class="go" draggable="false" href="' + esc(resultsUrl(h.d, '', freshDates(h.ci, h.co), h.a, h.r)) + '">' + L.see + '</a></div></div>';
      });
      html += '</div>' + (hs.length > 6 ? '<div class="hb"><button type="button" class="more" id="nzhMore">' + (histOpen ? L.histLess : L.histAll(hs.length)) + '</button></div>' : '') +
        '<p class="hn">' + L.histNote + '</p>';
    }
    box.innerHTML = html;
    swipeRows(box);
    var hm = document.getElementById('nzhMore'); if (hm) hm.onclick = function () { histOpen = !histOpen; renderHome(); };
    box.querySelectorAll('[data-rm]').forEach(function (b) {
      b.onclick = function () { set(K_FAV, favs().filter(function (f) { return f.id !== b.getAttribute('data-rm'); })); renderHome(); };
    });
  }

  /* ---------- أضف للشاشة الرئيسية (يظهر من الزيارة الثانية فقط) ---------- */
  function visits() { return num(get(K_VIS, 0), 0, 1e9, 0); }
  var deferred = null;
  window.addEventListener('beforeinstallprompt', function (e) { e.preventDefault(); deferred = e; maybeA2hs(); });
  function standalone() { return (window.matchMedia && matchMedia('(display-mode: standalone)').matches) || navigator.standalone === true; }
  function maybeA2hs() {
    if (standalone() || get(K_A2HS, 0) || document.getElementById('nza')) return;
    if (visits() < 2) return;
    // الاقتراح للجوال والتابلت بس (شاشة لمس بدون ماوس). على الكمبيوتر متصفحه يعرض زر التثبيت بنفسه
    if (!(window.matchMedia && matchMedia('(hover: none) and (pointer: coarse)').matches)) return;
    var ios = /iphone|ipad|ipod/i.test(navigator.userAgent) && !/crios|fxios/i.test(navigator.userAgent);
    if (!deferred && !ios) return;
    css();
    var L = T[lang()], d = document.createElement('div'); d.id = 'nza'; d.className = 'nza'; d.setAttribute('role', 'status');
    d.innerHTML = '<p>' + L.a2 + (deferred ? '' : '<small>' + L.a2ios + '</small>') + '</p>' +
      (deferred ? '<button type="button" class="ok">' + L.a2b + '</button>' : '') +
      '<button type="button" class="x" aria-label="' + L.a2x + '">✕</button>';
    document.body.appendChild(d);
    d.querySelector('.x').onclick = function () { set(K_A2HS, 1); d.remove(); };
    var ok = d.querySelector('.ok');
    if (ok) ok.onclick = function () { var p = deferred; deferred = null; set(K_A2HS, 1); d.remove(); if (p) p.prompt(); };
  }

  function boot() {
    // نعدّ الزيارة مرة وحدة في الجلسة
    try { if (!sessionStorage.getItem('nz_v')) { sessionStorage.setItem('nz_v', '1'); set(K_VIS, visits() + 1); } } catch (e) {}
    if (document.querySelector('.wrap.search')) {
      renderHome();
      var lb = document.getElementById('langBtn'); if (lb) lb.addEventListener('click', function () { setTimeout(renderHome, 0); });
      window.addEventListener('hashchange', function () { setTimeout(renderHome, 0); });
      window.addEventListener('pageshow', renderHome);
    }
    setTimeout(maybeA2hs, 4000);
    var lb2 = document.getElementById('langBtn'); if (lb2) lb2.addEventListener('click', function () { setTimeout(function () { var o = document.getElementById('nza'); if (o) { o.remove(); maybeA2hs(); } }, 80); });
  }

  window.NZKEEP = {addHistory: addHistory, markBooked: markBooked, history: hist, saveSearch: saveSearch, isFav: isFav, toggleFav: toggleFav, favCount: favCount, favs: favs};
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
