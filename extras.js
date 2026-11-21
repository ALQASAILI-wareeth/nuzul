// خدمات السفر الإضافية — كل خدمة فيها أكثر من شريك يختار منها الزبون (روابط عمولة عبر Travelpayouts)
// لإضافة شريك جديد: أضف {n:'الاسم', url:'الرابط'} داخل providers للخدمة. الخدمة اللي ما فيها رابط تنخفي تلقائياً.
(function () {
  var SERVICES = [
    { ic: '📶',
      ar: ['إنترنت السفر eSIM', 'شريحة إلكترونية تفعّلها من جوالك قبل السفر — قارن الباقات واختر الأنسب'],
      en: ['Travel eSIM', 'Activate data from your phone before you fly — compare plans and pick the best'],
      providers: [
        { n: 'Airalo', url: 'https://airalo.tpo.lu/3BRI03iF' },
        { n: 'Yesim', url: 'https://yesim.tpo.lu/hCZ76dsc' },
        { n: 'Saily', url: 'https://saily.tpo.lu/xL6B2qFO' }
      ] },
    { ic: '✈️',
      ar: ['تذاكر طيران', 'قارن أسعار مئات شركات الطيران واحجز الأرخص'],
      en: ['Flights', 'Compare hundreds of airlines and book the cheapest fare'],
      providers: [
        { n: 'Aviasales', url: 'https://aviasales.tpo.lu/XkLo0FCi' },
        { n: 'Kiwi.com', url: 'https://kiwi.tpo.lu/aXK0Ba8u' }
      ] },
    { ic: '🚗',
      ar: ['استئجار سيارة', 'سيارات من شركات عالمية ومحلية بأسعار واضحة'],
      en: ['Car rental', 'Cars from global and local companies with clear prices'],
      providers: [
        { n: 'Localrent', url: 'https://localrent.tpo.lu/cCwSXBeu' },
        { n: 'GetRentacar', url: 'https://getrentacar.tpo.lu/6Mi1WlvD' },
        { n: 'EconomyBookings', url: 'https://economybookings.tpo.lu/6gHnUvQh' }
      ] },
    { ic: '🚕',
      ar: ['توصيل من وإلى المطار', 'سائق ينتظرك في المطار بسعر ثابت محجوز مسبقاً'],
      en: ['Airport transfers', 'A driver waiting at arrivals, fixed price booked in advance'],
      providers: [
        // Kiwitaxi موقوف: ما يفتح من شبكات الإمارات (21 نوفمبر 2026)
        { n: 'Welcome Pickups', url: 'https://tpo.lu/XqKI7IqG' },
        { n: 'GetTransfer', url: 'https://gettransfer.tpo.lu/A2XwzXRT' },
        { n: 'Intui', url: 'https://intui.tpo.lu/AzUKXBSu' }
      ] },
    { ic: '🎟️',
      ar: ['جولات وأنشطة', 'تذاكر المعالم والرحلات والأنشطة في وجهتك'],
      en: ['Tours & activities', 'Tickets for attractions, tours and things to do'],
      providers: [
        { n: 'Klook', url: 'https://klook.tpo.lu/OtLpxRKj' },
        { n: 'Tiqets', url: 'https://tiqets.tpo.lu/6JhmqQ9H' },
        { n: 'KKday', url: 'https://kkday.tpo.lu/V24a3pmt' }
      ] },
    { ic: '🧳',
      ar: ['تخزين الأمتعة', 'خزّن شنطك بأمان في مدينتك قبل تسجيل الدخول أو بعد الخروج من الفندق'],
      en: ['Luggage storage', 'Store your bags safely before check-in or after check-out'],
      providers: [
        { n: 'Radical Storage', url: 'https://radicalstorage.tpo.lu/rr7cBgkf' }
      ] }
  ];
  var TXT = {
    ar: { h: 'كل ما تحتاجه لرحلتك', sub: 'خدمات سفر موثوقة من شركائنا — قارن بينهم واختر، بنفس السعر بدون أي رسوم إضافية', many: 'قارن بين الخيارات:' },
    en: { h: 'Everything for your trip', sub: 'Trusted travel services from our partners — compare and choose, at no extra cost', many: 'Compare options:' }
  };

  var css = document.createElement('style');
  css.textContent =
    '.extras{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}' +
    '@media(max-width:860px){.extras{grid-template-columns:repeat(2,1fr);gap:10px}.extra{padding:14px}.extra b{font-size:16px}.extra span{font-size:13px}}' +
    '@media(max-width:520px){.extras{grid-template-columns:1fr}}' +
    '.extra{background:var(--card);border:1.5px solid var(--line);border-radius:var(--radius);padding:18px;display:flex;flex-direction:column;gap:6px;transition:border-color .2s}' +
    '.extra:hover{border-color:var(--sand)}' +
    '.extra .ic{font-size:30px}' +
    '.extra b{color:var(--navy);font-size:18px}' +
    '.extra span{color:var(--muted);font-size:14px;flex:1}' +
    '.extra small{color:var(--muted);font-size:12px;margin-top:4px}' +
    '.extra .pv{display:flex;flex-wrap:wrap;gap:8px;margin-top:4px}' +
    '.extra .pv a{flex:1 1 auto;text-align:center;padding:9px 12px;border-radius:10px;background:var(--navy);color:#fff;font-weight:700;font-size:14px;text-decoration:none;transition:opacity .2s}' +
    '.extra .pv a:nth-child(2){background:var(--navy2)}' +
    '.extra .pv a:nth-child(3){background:var(--sand);color:var(--navy)}' +
    '.extra .pv a:hover{opacity:.88}';
  document.head.appendChild(css);

  var sec = document.createElement('section');
  sec.id = 'extras';
  sec.innerHTML = '<div class="wrap"><h2 id="exH"></h2><p class="sub" id="exSub"></p><div class="extras" id="exGrid"></div></div>';
  var how = document.getElementById('how');
  how.parentNode.insertBefore(sec, how);

  function curLang() {
    return document.documentElement.lang === 'en' ? 'en' : 'ar';
  }

  function render() {
    var l = curLang();
    document.getElementById('exH').textContent = TXT[l].h;
    document.getElementById('exSub').textContent = TXT[l].sub;
    var g = document.getElementById('exGrid');
    g.innerHTML = '';
    SERVICES.forEach(function (s) {
      var ps = s.providers.filter(function (p) { return p.url; });
      if (!ps.length) return;
      var card = document.createElement('div');
      card.className = 'extra';
      var html = '<div class="ic">' + s.ic + '</div><b>' + s[l][0] + '</b><span>' + s[l][1] + '</span>';
      if (ps.length > 1) html += '<small>' + TXT[l].many + '</small>';
      html += '<div class="pv">' + ps.map(function (p) {
        return '<a href="' + p.url + '" target="_blank" rel="noopener sponsored">' + p.n + (l === 'ar' ? ' ←' : ' →') + '</a>';
      }).join('') + '</div>';
      card.innerHTML = html;
      g.appendChild(card);
    });
  }

  render();
  new MutationObserver(render).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
})();
