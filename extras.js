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
        { n: 'Saily', url: 'https://saily.tpo.lu/xL6B2qFO' },
        { n: 'GigSky', url: 'https://gigsky.tpo.lu/lDBPe6q3' },
        { n: 'Drimsim', url: 'https://drimsim.tpo.lu/PWjORAGB' }
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
        { n: 'EconomyBookings', url: 'https://economybookings.tpo.lu/6gHnUvQh' },
        { n: 'QEEQ', url: 'https://qeeq.tpo.lu/HN4FzDK7' },
        { n: 'Auto Europe', url: 'https://autoeurope.tpo.lu/9sjsI0TF' }
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
        { n: 'KKday', url: 'https://kkday.tpo.lu/V24a3pmt' },
        { n: 'WeGoTrip', url: 'https://wegotrip.tpo.lu/lAgsr2Uf' },
        { n: 'Go City', url: 'https://gocity.tpo.lu/ke1Lofin' }
      ] },
    { ic: '🛵',
      ar: ['تأجير دراجات وسكوتر', 'دراجات نارية وسكوتر وهوائية للتنقل بحرية في وجهتك'],
      en: ['Bike & scooter rental', 'Motorbikes, scooters and bicycles to get around freely'],
      providers: [
        { n: 'BikesBooking', url: 'https://bikesbooking.tpo.lu/8tVszIZ4' }
      ] },
    { ic: '⏱️',
      ar: ['تعويض تأخير الرحلات', 'رحلتك تأخرت أو انلغت؟ اطلب تعويض يوصل إلى 600 يورو'],
      en: ['Flight delay compensation', 'Delayed or cancelled flight? Claim up to €600'],
      providers: [
        { n: 'Compensair', url: 'https://compensair.tpo.lu/d7M2PjSw' },
        { n: 'AirHelp Plus', url: 'https://airhelp.tpo.lu/Q09nuxhT' }
      ] },
    { ic: '🧳',
      ar: ['تخزين الأمتعة', 'خزّن شنطك بأمان في مدينتك قبل تسجيل الدخول أو بعد الخروج من الفندق'],
      en: ['Luggage storage', 'Store your bags safely before check-in or after check-out'],
      providers: [
        { n: 'Radical Storage', url: 'https://radicalstorage.tpo.lu/rr7cBgkf' }
      ] }
  ];
  var TXT = {
    ar: { h: 'كل ما تحتاجه لرحلتك', sub: 'اضغط على الخدمة وقارن بين شركائنا، بنفس السعر وبدون أي رسوم إضافية', many: 'قارن بين الخيارات:' },
    en: { h: 'Everything for your trip', sub: 'Tap a service and compare our partners, at no extra cost', many: 'Compare options:' }
  };

  var css = document.createElement('style');
  css.textContent =
    '.extras{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}' +
    '@media(max-width:860px){.extras{grid-template-columns:repeat(2,1fr)}}' +
    '.xt{display:flex;align-items:center;gap:10px;background:var(--card);border:1.5px solid var(--line);border-radius:14px;padding:12px;font:inherit;font-weight:800;font-size:15px;color:var(--navy);cursor:pointer;text-align:start;min-height:56px;transition:border-color .2s,background .2s}' +
    '.xt .ic{font-size:24px;flex:0 0 auto}' +
    '.xt:hover{border-color:var(--sand)}' +
    '.xt.on{border-color:var(--navy);background:var(--navy);color:#fff}' +
    '.extra{grid-column:1/-1;background:var(--card);border:1.5px solid var(--navy);border-radius:var(--radius);padding:16px;display:flex;flex-direction:column;gap:6px}' +
    '.extra b{color:var(--navy);font-size:18px}' +
    '.extra span{color:var(--muted);font-size:15px}' +
    '.extra small{color:var(--muted);font-size:13px;margin-top:4px}' +
    '.extra .pv{display:flex;flex-wrap:wrap;gap:8px;margin-top:4px}' +
    '.extra .pv a{flex:1 1 150px;white-space:nowrap;text-align:center;padding:11px 10px;border-radius:10px;background:var(--navy2);color:#fff;font-weight:700;font-size:15px;text-decoration:none;transition:opacity .2s}' +
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

  var open = -1; // رقم الخدمة المفتوحة (-1 = ولا وحدة)
  function render() {
    var l = curLang();
    document.getElementById('exH').textContent = TXT[l].h;
    document.getElementById('exSub').textContent = TXT[l].sub;
    var g = document.getElementById('exGrid');
    g.innerHTML = '';
    var list = SERVICES.filter(function (s) { return s.providers.some(function (p) { return p.url; }); });
    var cols = window.innerWidth <= 860 ? 2 : 4;
    list.forEach(function (s, i) {
      var t = document.createElement('button');
      t.type = 'button';
      t.className = 'xt' + (i === open ? ' on' : '');
      t.setAttribute('aria-expanded', String(i === open));
      t.innerHTML = '<span class="ic">' + s.ic + '</span><span>' + s[l][0] + '</span>';
      t.addEventListener('click', function () { open = (open === i ? -1 : i); render(); });
      g.appendChild(t);
      // بطاقة التفاصيل تنحط بعد آخر مربع في نفس الصف
      var rowEnd = Math.min(list.length - 1, Math.floor(i / cols) * cols + cols - 1);
      if (open >= 0 && i === rowEnd && Math.floor(open / cols) === Math.floor(i / cols)) {
        var sv = list[open];
        var ps = sv.providers.filter(function (p) { return p.url; });
        var card = document.createElement('div');
        card.className = 'extra';
        var html = '<b>' + sv.ic + ' ' + sv[l][0] + '</b><span>' + sv[l][1] + '</span>';
        if (ps.length > 1) html += '<small>' + TXT[l].many + '</small>';
        html += '<div class="pv">' + ps.map(function (p) {
          return '<a href="' + p.url + '" target="_blank" rel="noopener sponsored">' + p.n + (l === 'ar' ? ' ←' : ' →') + '</a>';
        }).join('') + '</div>';
        card.innerHTML = html;
        g.appendChild(card);
      }
    });
  }

  render();
  new MutationObserver(render).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
})();
