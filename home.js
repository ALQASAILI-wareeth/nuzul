// عروض الأسبوع + زر واتساب العائم
// لتحديث العروض: عدّل مصفوفة DEALS فقط. أي عرض ينتهي تاريخه (until) يختفي تلقائياً.
(function () {
  var WA = '971568599446';

  var DEALS = [
    {
      img: 'maldives', until: '2026-12-02', color: '#0062A8',
      url: { kind: 'booking-deals' },
      ar: { tag: 'الجمعة البيضاء', h: 'خصومات حتى 40٪ على الفنادق', p: 'عروض Booking.com السنوية على الإقامة والطيران والسيارات، لسفرات 2026 و2027.', cta: 'شوف العروض' },
      en: { tag: 'Black Friday', h: 'Up to 40% off hotels', p: 'Booking.com’s yearly sale on stays, flights and car rentals for trips in 2026 and 2027.', cta: 'See the deals' }
    },
    {
      img: 'abu-dhabi', until: '2026-12-03', color: '#0a8f6a',
      url: { kind: 'search', city: 'Abu Dhabi', cin: '2026-12-02', cout: '2026-12-05' },
      ar: { tag: 'عيد الاتحاد 55', h: 'إجازة طويلة؟ خلّها قريبة', p: 'إجازة 2 و3 ديسمبر. فنادق ومنتجعات في أبوظبي والإمارات القريبة لعطلة نهاية أسبوع طويلة.', cta: 'احجز الإجازة' },
      en: { tag: 'UAE National Day', h: 'A long weekend close to home', p: 'Public holiday on 2–3 December. Hotels and resorts in Abu Dhabi for a long weekend.', cta: 'Book your break' }
    },
    {
      img: 'dubai', until: '2027-01-17', color: '#c2410c',
      url: { kind: 'search', city: 'Dubai', cin: '2026-12-04', cout: '2026-12-07' },
      ar: { tag: 'مهرجان دبي للتسوق', h: 'تسوّق وألعاب نارية في دبي', p: 'من 4 ديسمبر إلى 17 يناير: خصومات المولات والحفلات والألعاب النارية. اختر فندقك قريب من الفعاليات.', cta: 'فنادق دبي' },
      en: { tag: 'Dubai Shopping Festival', h: 'Shopping and fireworks in Dubai', p: '4 December to 17 January: mall sales, concerts and fireworks. Pick a hotel close to the action.', cta: 'Dubai hotels' }
    }
  ];

  var TXT = {
    ar: { h: 'عروض هالأسبوع', sub: 'أهم العروض والمواسم القادمة، نحدّثها كل أسبوع', left: function (d) { return d <= 0 ? 'آخر يوم اليوم' : (d === 1 ? 'باقي يوم واحد' : (d === 2 ? 'باقي يومين' : 'باقي ' + d + (d <= 10 ? ' أيام' : ' يوم'))); }, wa: 'تواصل معنا عبر واتساب', waMsg: 'مرحبا نُزُل، أبي مساعدة في حجز رحلتي' },
    en: { h: 'This week’s deals', sub: 'Top offers and upcoming seasons, updated weekly', left: function (d) { return d <= 0 ? 'Last day today' : d + (d === 1 ? ' day left' : ' days left'); }, wa: 'Chat with us on WhatsApp', waMsg: 'Hi Nuzul, I need help booking my trip' }
  };

  function lang() { return document.documentElement.lang === 'en' ? 'en' : 'ar'; }
  function aid() { try { return (typeof AID !== 'undefined' && AID) ? AID : ''; } catch (e) { return ''; } }
  function dealUrl(u) {
    var bl = lang() === 'en' ? 'en-gb' : 'ar';
    var p = new URLSearchParams();
    if (aid()) p.set('aid', aid());
    p.set('lang', bl);
    if (u.kind === 'booking-deals') return 'https://www.booking.com/deals.html?' + p.toString();
    p.set('ss', u.city); p.set('checkin', u.cin); p.set('checkout', u.cout);
    p.set('group_adults', '2'); p.set('no_rooms', '1');
    return 'https://www.booking.com/searchresults.' + bl + '.html?' + p.toString();
  }
  function daysLeft(until) {
    var end = new Date(until + 'T23:59:59+04:00');
    return Math.floor((end - new Date()) / 86400000);
  }

  var css = document.createElement('style');
  css.textContent =
    '.deals{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}' +
    '@media(max-width:860px){.deals{grid-template-columns:1fr}}' +
    '.deal{display:flex;flex-direction:column;background:var(--card);border:1.5px solid var(--line);border-radius:var(--radius);overflow:hidden;transition:transform .2s,box-shadow .2s}' +
    '.deal:hover{transform:translateY(-3px);box-shadow:0 10px 24px rgba(6,47,82,.14)}' +
    '.deal .ph{height:130px;background-size:cover;background-position:center;position:relative}' +
    '.deal .tag{position:absolute;top:12px;inset-inline-start:12px;color:#fff;font-weight:800;font-size:13px;padding:4px 12px;border-radius:999px}' +
    '.deal .left{position:absolute;bottom:10px;inset-inline-end:12px;background:rgba(4,22,40,.78);color:#FFD27A;font-weight:700;font-size:12px;padding:3px 10px;border-radius:999px}' +
    '.deal .bd{padding:14px 16px 16px;display:flex;flex-direction:column;gap:6px;flex:1}' +
    '.deal b{color:var(--navy);font-size:18px;line-height:1.35}' +
    '.deal p{color:var(--muted);font-size:14px;flex:1}' +
    '.deal em{font-style:normal;align-self:flex-start;background:var(--sand);color:var(--navy);font-weight:800;font-size:14px;padding:7px 16px;border-radius:10px;margin-top:4px}' +
    '.wa-fab{position:fixed;bottom:18px;left:18px;z-index:50;width:56px;height:56px;border-radius:50%;background:#25D366;display:flex;align-items:center;justify-content:center;box-shadow:0 6px 18px rgba(0,0,0,.25);transition:transform .2s}' +
    '.wa-fab:hover{transform:scale(1.07)}' +
    '.wa-fab svg{width:30px;height:30px;fill:#fff}';
  document.head.appendChild(css);

  var sec = document.createElement('section');
  sec.id = 'deals';
  sec.innerHTML = '<div class="wrap"><h2 id="dlH"></h2><p class="sub" id="dlSub"></p><div class="deals" id="dlGrid"></div></div>';
  var search = document.querySelector('.search');
  if (search && search.parentNode) search.parentNode.insertBefore(sec, search.nextSibling);

  var fab = document.createElement('a');
  fab.className = 'wa-fab';
  fab.target = '_blank';
  fab.rel = 'noopener';
  fab.innerHTML = '<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M16 3C8.8 3 3 8.7 3 15.8c0 2.5.7 4.9 2 7L3 29l6.4-2c2 1.1 4.3 1.7 6.6 1.7 7.2 0 13-5.7 13-12.8S23.2 3 16 3zm0 23.4c-2.1 0-4.1-.6-5.9-1.7l-.4-.3-3.8 1.2 1.2-3.7-.3-.4c-1.2-1.8-1.9-3.9-1.9-6.1C4.9 9.8 9.9 5 16 5s11.1 4.8 11.1 10.8S22.1 26.4 16 26.4zm6.1-8c-.3-.2-2-1-2.3-1.1-.3-.1-.5-.2-.8.2-.2.3-.9 1.1-1.1 1.3-.2.2-.4.3-.7.1-.3-.2-1.4-.5-2.7-1.7-1-.9-1.7-2-1.9-2.3-.2-.3 0-.5.1-.7l.5-.6c.2-.2.2-.4.3-.6.1-.2 0-.4 0-.6l-1-2.5c-.3-.7-.6-.6-.8-.6h-.7c-.2 0-.6.1-.9.4-.3.3-1.2 1.2-1.2 2.9s1.2 3.4 1.4 3.6c.2.2 2.4 3.7 5.9 5.2.8.4 1.5.6 2 .7.8.3 1.6.2 2.2.1.7-.1 2-.8 2.3-1.6.3-.8.3-1.5.2-1.6-.1-.1-.3-.2-.6-.4z"/></svg>';
  document.body.appendChild(fab);

  function render() {
    var l = lang(), T = TXT[l];
    document.getElementById('dlH').textContent = T.h;
    document.getElementById('dlSub').textContent = T.sub;
    var g = document.getElementById('dlGrid');
    g.innerHTML = '';
    var shown = 0;
    DEALS.forEach(function (d) {
      var left = daysLeft(d.until);
      if (left < 0) return;
      shown++;
      var a = document.createElement('a');
      a.className = 'deal';
      a.href = dealUrl(d.url);
      a.target = '_blank';
      a.rel = 'noopener sponsored';
      a.innerHTML =
        '<div class="ph" style="background-image:url(\'/img/cities/' + d.img + '.webp\')">' +
        '<span class="tag" style="background:' + d.color + '">' + d[l].tag + '</span>' +
        (left <= 30 ? '<span class="left">' + T.left(left) + '</span>' : '') + '</div>' +
        '<div class="bd"><b>' + d[l].h + '</b><p>' + d[l].p + '</p><em>' + d[l].cta + (l === 'en' ? ' →' : ' ←') + '</em></div>';
      g.appendChild(a);
    });
    sec.style.display = shown ? '' : 'none';
    fab.href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(T.waMsg);
    fab.setAttribute('aria-label', T.wa);
    fab.title = T.wa;
  }

  render();
  new MutationObserver(render).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
})();
