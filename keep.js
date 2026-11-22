/* نُزُل — ما يرجّع الزائر: آخر بحث، المفضلة، الإضافة للشاشة الرئيسية.
   كل شي محفوظ على جهاز الزائر فقط (localStorage)، بدون تسجيل وبدون إرسال لأي خادم. */
(function () {
  'use strict';
  var K_LAST = 'nuzul_last', K_FAV = 'nuzul_favs', K_VIS = 'nuzul_visits', K_A2HS = 'nuzul_a2hs_off';

  function get(k, d) { try { var v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } }
  function set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function pad(n) { return String(n).padStart(2, '0'); }
  function ymd(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return {'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]; }); }
  function lang() { return document.documentElement.lang === 'en' ? 'en' : 'ar'; }

  var T = {
    ar: {h: 'كمّل من وين وقفت', last: 'آخر بحث', go: 'كمّل بحثك', favH: 'مفضلتك', see: 'شوف السعر', rm: 'حذف من المفضلة',
      nights: function (n) { return n === 1 ? 'ليلة' : n === 2 ? 'ليلتين' : n + ' ليالي'; }, ad: function (n) { return n + ' بالغين'; },
      a2: '📲 خلّ نُزُل على شاشتك الرئيسية عشان توصله بضغطة.', a2ios: 'اضغط زر المشاركة ثم «إضافة إلى الشاشة الرئيسية».', a2b: 'أضف', a2x: 'إغلاق'},
    en: {h: 'Pick up where you left off', last: 'Last search', go: 'Continue', favH: 'Your favourites', see: 'See price', rm: 'Remove from favourites',
      nights: function (n) { return n + (n === 1 ? ' night' : ' nights'); }, ad: function (n) { return n + ' adults'; },
      a2: '📲 Keep Nuzul on your home screen for one-tap access.', a2ios: 'Tap Share, then “Add to Home Screen”.', a2b: 'Add', a2x: 'Close'}
  };

  /* ---------- آخر بحث ---------- */
  function saveSearch(S, name) {
    if (!S || !S.d) return;
    set(K_LAST, {d: S.d, n: S.n || '', name: name || S.n || S.d, ci: S.cin, co: S.cout, a: S.adults, r: S.rooms, ts: Date.now()});
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
  function favs() { var f = get(K_FAV, []); return Array.isArray(f) ? f : []; }
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
      '.nzk .c small{display:block;color:#5f6b78;font-size:12.5px;font-weight:700}' +
      '.nzk .c b{display:block;font-size:16px;font-weight:800;color:#0A2540;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}' +
      '.nzk .c span{display:block;color:#5f6b78;font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}' +
      '.nzk .c a.go{flex-shrink:0;background:#FFB238;color:#0A2540;font-weight:800;font-size:14px;border-radius:12px;padding:0 14px;height:44px;display:flex;align-items:center;white-space:nowrap}' +
      '.nzk .c button{flex-shrink:0;width:44px;height:44px;border:0;background:#FFF0F0;color:#D32F2F;border-radius:12px;font-size:18px;cursor:pointer}' +
      '.nzk h3{font-size:15px;font-weight:800;color:#0A2540;margin:14px 0 8px}' +
      '.nza{position:fixed;inset-inline:12px;bottom:12px;z-index:60;background:#0A2540;color:#fff;border-radius:16px;padding:12px 14px;box-shadow:0 10px 30px rgba(6,47,82,.35);display:flex;align-items:center;gap:10px;font-size:14px;line-height:1.5}' +
      '.nza p{margin:0;flex:1}.nza small{display:block;opacity:.8;font-size:12.5px}' +
      '.nza button{border:0;border-radius:10px;height:44px;padding:0 14px;font:inherit;font-weight:800;cursor:pointer}' +
      '.nza .ok{background:#FFB238;color:#0A2540}.nza .x{background:transparent;color:#fff;width:44px;padding:0;font-size:20px}' +
      '@media(min-width:700px){.nza{inset-inline:auto 20px;max-width:420px}}';
    document.head.appendChild(s);
  }

  function renderHome() {
    var anchor = document.querySelector('.wrap.search'); if (!anchor) return;
    var L = T[lang()], last = get(K_LAST, null), fv = favs();
    var box = document.getElementById('nzkeep');
    if (!last && !fv.length) { if (box) box.remove(); return; }
    css();
    if (!box) { box = document.createElement('div'); box.id = 'nzkeep'; box.className = 'nzk'; anchor.after(box); }
    var ar = lang() === 'ar', loc = ar ? 'ar-AE' : 'en-GB';
    var dt = function (s) { return new Date(s + 'T12:00:00').toLocaleDateString(loc, {day: 'numeric', month: 'short'}); };
    var html = '<h2>' + L.h + '</h2><div class="row">';
    var base = last ? freshDates(last.ci, last.co) : freshDates('', '');
    if (last) {
      var n = Math.max(1, Math.round((new Date(base.co) - new Date(base.ci)) / 864e5));
      var nm = ar ? (last.name || last.n || last.d) : last.d;
      html += '<div class="c last"><div class="tx"><small>' + L.last + '</small><b>' + esc(nm) + '</b><span>' + dt(base.ci) + ' – ' + dt(base.co) + ' · ' + L.nights(n) + ' · ' + L.ad(last.a || 2) + '</span></div>' +
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
    box.innerHTML = html;
    box.querySelectorAll('[data-rm]').forEach(function (b) {
      b.onclick = function () { set(K_FAV, favs().filter(function (f) { return f.id !== b.getAttribute('data-rm'); })); renderHome(); };
    });
  }

  /* ---------- أضف للشاشة الرئيسية (يظهر من الزيارة الثانية فقط) ---------- */
  var deferred = null;
  window.addEventListener('beforeinstallprompt', function (e) { e.preventDefault(); deferred = e; maybeA2hs(); });
  function standalone() { return (window.matchMedia && matchMedia('(display-mode: standalone)').matches) || navigator.standalone === true; }
  function maybeA2hs() {
    if (standalone() || get(K_A2HS, 0) || document.getElementById('nza')) return;
    if (get(K_VIS, 0) < 2) return;
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
    try { if (!sessionStorage.getItem('nz_v')) { sessionStorage.setItem('nz_v', '1'); set(K_VIS, get(K_VIS, 0) + 1); } } catch (e) {}
    if (document.querySelector('.wrap.search')) {
      renderHome();
      var lb = document.getElementById('langBtn'); if (lb) lb.addEventListener('click', function () { setTimeout(renderHome, 0); });
      window.addEventListener('hashchange', function () { setTimeout(renderHome, 0); });
      window.addEventListener('pageshow', renderHome);
    }
    setTimeout(maybeA2hs, 4000);
  }

  window.NZKEEP = {saveSearch: saveSearch, isFav: isFav, toggleFav: toggleFav, favCount: favCount, favs: favs};
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
