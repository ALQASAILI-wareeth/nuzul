// نُزُل — طبقة التلميع: صورة الواجهة حسب الموسم، تواريخ مقروءة، أيقونات موحّدة، حركة هادئة.
// الملف إضافي فقط: لو انحذف يرجع الموقع يشتغل مثل قبل.
(function () {
  var D = document, R = D.documentElement;
  var lang = function () { return R.lang === 'en' ? 'en' : 'ar'; };

  // ---------- 1) صورة الواجهة حسب الشهر ----------
  var HERO = ['maldives', 'maldives', 'istanbul', 'istanbul', 'bali', 'interlaken', 'interlaken', 'london', 'istanbul', 'dubai', 'dubai', 'maldives'];
  var hero = D.querySelector('.hero');
  if (hero) {
    var pic = HERO[new Date().getMonth()];
    var im = new Image();
    var src = 'img/cities/' + pic + '.webp';
    if (pic === 'dubai') src = 'img/hero/dubai-' + (window.innerWidth > 760 ? 'd' : 'm') + '.webp';
    im.onload = function () { hero.style.setProperty('--hero-img', 'url("' + src + '")'); hero.classList.add('has-img'); if (pic === 'dubai') hero.classList.add('nz-bright'); };
    im.src = src;
  }

  // ---------- 2) علامات الطمأنة تحت البحث ----------
  var TR = {
    ar: [['shield', 'بدون رسوم'], ['lock', 'الدفع عند موقع الحجز'], ['chat', 'خدمة بالعربي']],
    en: [['shield', 'No fees'], ['lock', 'Pay on the booking site'], ['chat', 'Arabic support']]
  };
  var I = {
    shield: '<path d="M12 3l7 3v5c0 4.5-3 8.3-7 10-4-1.7-7-5.5-7-10V6l7-3z"/><path d="M9 12l2.2 2.2L15.5 10"/>',
    lock: '<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 018 0v3"/>',
    chat: '<path d="M4 6a2 2 0 012-2h12a2 2 0 012 2v8a2 2 0 01-2 2h-7l-4.5 3.5V16H6a2 2 0 01-2-2V6z"/>',
    plane: '<path d="M21 3l-7.5 18-3-8-8-3L21 3z"/><path d="M10.5 13L21 3"/>',
    sim: '<path d="M7 3h7l4 4v12a2 2 0 01-2 2H7a2 2 0 01-2-2V5a2 2 0 012-2z"/><rect x="8.5" y="11" width="7" height="6" rx="1"/>',
    car: '<path d="M4 13l1.6-4.6A2 2 0 017.5 7h9a2 2 0 011.9 1.4L20 13v5h-2.5v-2h-11v2H4v-5z"/><circle cx="7.8" cy="13.6" r=".9"/><circle cx="16.2" cy="13.6" r=".9"/>',
    taxi: '<path d="M9 5h6l.6 2H8.4L9 5z"/><path d="M4 14l1.6-5A2 2 0 017.5 7.6h9A2 2 0 0118.4 9L20 14v4.5h-2.5v-2h-11v2H4V14z"/><path d="M7 13.5h10"/>',
    ticket: '<path d="M4 8a2 2 0 012-2h12a2 2 0 012 2v2a2 2 0 000 4v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2a2 2 0 000-4V8z"/><path d="M14 7v10" stroke-dasharray="2 2"/>',
    bike: '<circle cx="6" cy="16" r="3.2"/><circle cx="18" cy="16" r="3.2"/><path d="M6 16l4-7h5l3 7M10 9l3 7M14 6h2.5"/>',
    clock: '<circle cx="12" cy="13" r="7.5"/><path d="M12 9v4.2l2.8 1.8M9.5 3h5"/>',
    bag: '<rect x="6" y="7" width="12" height="13" rx="2"/><path d="M9.5 7V4.5h5V7M10 11v5M14 11v5"/>',
    hotel: '<path d="M5 21V5a2 2 0 012-2h10a2 2 0 012 2v16M3 21h18"/><path d="M9 7h1.5M13.5 7H15M9 11h1.5M13.5 11H15M10.5 21v-4h3v4"/>',
    apt: '<rect x="4" y="4" width="16" height="17" rx="2"/><path d="M4 10h16M4 15h16M10 4v17"/>',
    palm: '<path d="M12 21c0-5 .5-8 2-11"/><path d="M14 10c-3-3-7-2.5-9 0 3-1 6-.6 9 0zM14 10c1-4 5-5 7-3-3 0-5 1-7 3zM14 10c3 0 5.5 2 6 5-2-2.500-4-3.500-6-5z"/><path d="M5 21h14"/>',
    home: '<path d="M4 11l8-7 8 7v9a1 1 0 01-1 1h-4.500v-6h-5v6H5a1 1 0 01-1-1v-9z"/>',
    star: '<path d="M12 3.500l2.600 5.400 5.900.800-4.300 4.100 1.100 5.800L12 16.800 6.700 19.600l1.100-5.800L3.500 9.700l5.900-.800L12 3.500z"/>',
    search: '<circle cx="11" cy="11" r="6.500"/><path d="M16 16l4.500 4.500"/>'
  };
  function svg(n) { return '<svg class="nzi" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + I[n] + '</svg>'; }

  var search = D.querySelector('.search');
  var badges = D.createElement('div');
  badges.className = 'nz-badges';
  function drawBadges() {
    badges.innerHTML = TR[lang()].map(function (t) { return '<span>' + svg(t[0]) + t[1] + '</span>'; }).join('');
  }
  if (search) { search.appendChild(badges); drawBadges(); }

  // ---------- 3) أيقونات موحّدة بدل الإيموجي ----------
  var MAP = { '📶': 'sim', '✈️': 'plane', '✈': 'plane', '🚗': 'car', '🚕': 'taxi', '🎟️': 'ticket', '🎟': 'ticket', '🛵': 'bike', '⏱️': 'clock', '⏱': 'clock', '🧳': 'bag', '🏨': 'hotel', '🏢': 'apt', '🏝️': 'palm', '🏝': 'palm', '🏡': 'home', '⭐': 'star' };
  function swapIcons(root) {
    (root || D).querySelectorAll('.xt .ic, .type .ic').forEach(function (el) {
      var k = el.textContent.trim();
      if (MAP[k]) { el.innerHTML = svg(MAP[k]); el.classList.add('nzic'); }
    });
    (root || D).querySelectorAll('.extra > b').forEach(function (el) {
      var t = el.textContent, sp = t.indexOf(' ');
      var k = sp > 0 ? t.slice(0, sp).trim() : '';
      if (MAP[k] && !el.querySelector('svg')) el.innerHTML = svg(MAP[k]) + '<span>' + t.slice(sp + 1) + '</span>';
    });
    var go = D.getElementById('go');
    if (go && go.textContent.indexOf('🔍') >= 0) go.innerHTML = svg('search') + '<span>' + go.textContent.replace('🔍', '').trim() + '</span>';
  }

  // ---------- 4) تواريخ مقروءة ----------
  function fmt(v) {
    if (!v) return '';
    var p = v.split('-'); var d = new Date(+p[0], +p[1] - 1, +p[2]);
    try { return new Intl.DateTimeFormat(lang() === 'ar' ? 'ar-AE-u-nu-latn' : 'en-GB', { day: 'numeric', month: 'long' }).format(d); }
    catch (e) { return v; }
  }
  var dates = [];
  ['cin', 'cout'].forEach(function (id) {
    var inp = D.getElementById(id); if (!inp) return;
    var w = D.createElement('div'); w.className = 'nz-date';
    inp.parentNode.insertBefore(w, inp); w.appendChild(inp);
    var lab = D.createElement('span'); lab.className = 'nz-date-l'; w.appendChild(lab);
    dates.push({ i: inp, l: lab, v: null, g: null });
  });
  function syncDates() {
    dates.forEach(function (o) {
      if (o.v !== o.i.value || o.g !== lang()) { o.v = o.i.value; o.g = lang(); o.l.textContent = fmt(o.v); }
    });
  }

  // ---------- 5) قسم الشركات يصير مطوي ----------
  function foldBusiness() {
    var b = D.getElementById('business');
    if (!b || b.dataset.fold) return;
    var wrap = b.querySelector('.wrap'); if (!wrap) return;
    b.dataset.fold = '1';
    var btn = D.createElement('button');
    btn.type = 'button'; btn.className = 'nz-fold';
    var h = D.getElementById('bzH');
    function label() { btn.innerHTML = '<span>' + (lang() === 'ar' ? 'حجز لشركة أو مجموعة؟ اكتب طلبك هنا' : 'Booking for a company or group? Write your request') + '</span><i></i>'; }
    label();
    btn.addEventListener('click', function () { b.classList.toggle('open'); btn.setAttribute('aria-expanded', b.classList.contains('open')); });
    wrap.insertBefore(btn, wrap.firstChild);
    b.classList.add('nz-folded');
    new MutationObserver(label).observe(R, { attributes: true, attributeFilter: ['lang'] });
    if (location.hash === '#business') b.classList.add('open');
  }

  // ---------- 6) حركة هادئة + زر الواتساب ----------
  var calm = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function reveal() {
    if (calm || !('IntersectionObserver' in window)) return;
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('nz-in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    D.querySelectorAll('section').forEach(function (s) {
      if (s.dataset.rv) return; s.dataset.rv = '1';
      if (s.getBoundingClientRect().top > window.innerHeight * 0.9) { s.classList.add('nz-rv'); io.observe(s); }
    });
  }
  var lastY = 0;
  window.addEventListener('scroll', function () {
    var y = window.scrollY, fab = D.querySelector('.wa-fab');
    if (fab) fab.classList.toggle('nz-hide', y > lastY && y > 300);
    lastY = y;
  }, { passive: true });

  function all() { swapIcons(); syncDates(); foldBusiness(); reveal(); drawBadges(); }
  all();
  new MutationObserver(function () { swapIcons(); foldBusiness(); reveal(); }).observe(D.body, { childList: true, subtree: true });
  new MutationObserver(function () { syncDates(); drawBadges(); }).observe(R, { attributes: true, attributeFilter: ['lang'] });
  ['change', 'input'].forEach(function (ev) { D.addEventListener(ev, syncDates, true); });
  setInterval(syncDates, 600);

  // ---------- ترتيب روابط التواصل أسفل الصفحة ----------
  (function () {
    var fls = D.querySelectorAll('footer .fl'); if (fls.length < 2) return;
    var fl = fls[1], links = [].slice.call(fl.querySelectorAll('a'));
    var MAIN = ['instagram.com', 'tiktok.com', 'snapchat.com', 'whatsapp.com/channel', 't.me/'];
    var main = [], rest = [], priv = null;
    links.forEach(function (a) {
      var h = a.getAttribute('href') || '';
      if (h.indexOf('privacy') >= 0) { priv = a; return; }
      var i = -1; MAIN.forEach(function (m, k) { if (h.indexOf(m) >= 0) i = k; });
      if (i >= 0) main[i] = a; else rest.push(a);
    });
    if (!rest.length) return;
    main.forEach(function (a) { if (a) fl.appendChild(a); });
    var btn = D.createElement('button'); btn.type = 'button'; btn.className = 'nz-more'; btn.setAttribute('aria-expanded', 'false');
    fl.appendChild(btn);
    rest.forEach(function (a) { a.classList.add('nz-extra'); fl.appendChild(a); });
    if (priv) { priv.classList.add('nz-priv'); fls[0].appendChild(priv); }
    function label() { var open = fl.classList.contains('nz-open'); btn.textContent = lang() === 'ar' ? (open ? 'أقل' : 'المزيد +') : (open ? 'Less' : 'More +'); }
    btn.addEventListener('click', function () { fl.classList.toggle('nz-open'); btn.setAttribute('aria-expanded', fl.classList.contains('nz-open')); label(); });
    label();
    var lb = D.getElementById('langBtn'); if (lb) lb.addEventListener('click', function () { setTimeout(label, 60); });
  })();

  // ---------- علامات الصح: أيقونة واضحة بدل الرمز الباهت ----------
  (function () {
    var CK = '<svg class="nz-ck" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.500l4.500 4.500L19 7.500"/></svg>';
    function fix() {
      D.querySelectorAll('.why b').forEach(function (b) {
        var t = b.textContent; if (t.indexOf('✔') < 0) return;
        b.innerHTML = CK + '<span></span>'; b.lastChild.textContent = t.replace(/✔️?\s*/, '');
      });
    }
    fix();
    var lb = D.getElementById('langBtn'); if (lb) lb.addEventListener('click', function () { setTimeout(fix, 60); });
  })();
})();
