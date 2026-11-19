// خدمات السفر الإضافية — روابط عمولة عبر Travelpayouts
(function () {
  var EXTRAS = [
    { ic: '📶', url: 'https://airalo.tpo.lu/3BRI03iF',
      ar: ['إنترنت السفر eSIM', 'شريحة إلكترونية لأكثر من 200 دولة، تفعّلها من جوالك قبل السفر'],
      en: ['Travel eSIM', 'Data in 200+ countries, activated from your phone before you fly'] },
    { ic: '🌐', url: 'https://yesim.tpo.lu/hCZ76dsc',
      ar: ['باقات إنترنت Yesim', 'باقات بيانات مرنة للمسافرين بدون تبديل الشريحة'],
      en: ['Yesim data plans', 'Flexible travel data without swapping your SIM'] },
    { ic: '✈️', url: 'https://aviasales.tpo.lu/XkLo0FCi',
      ar: ['تذاكر طيران', 'قارن أسعار مئات شركات الطيران واحجز الأرخص'],
      en: ['Flights', 'Compare hundreds of airlines and book the cheapest fare'] },
    { ic: '🚗', url: 'https://localrent.tpo.lu/cCwSXBeu',
      ar: ['استئجار سيارة', 'سيارات من شركات محلية بأسعار واضحة بدون رسوم مخفية'],
      en: ['Car rental', 'Cars from local companies with clear prices'] },
    { ic: '🚕', url: 'https://kiwitaxi.tpo.lu/Vqe8Tz4U',
      ar: ['توصيل من المطار', 'سائق ينتظرك عند الوصول بسعر ثابت محجوز مسبقاً'],
      en: ['Airport transfers', 'A driver waiting on arrival at a fixed, prepaid price'] },
    { ic: '🎟️', url: 'https://klook.tpo.lu/OtLpxRKj',
      ar: ['جولات وأنشطة', 'تذاكر المعالم والرحلات والأنشطة في وجهتك'],
      en: ['Tours & activities', 'Tickets for attractions, tours and things to do'] }
  ];
  var TXT = {
    ar: { h: 'كل ما تحتاجه لرحلتك', sub: 'خدمات سفر موثوقة من شركائنا، بنفس السعر بدون أي رسوم إضافية', go: 'اعرف أكثر ←' },
    en: { h: 'Everything for your trip', sub: 'Trusted travel services from our partners, at no extra cost to you', go: 'Learn more →' }
  };

  var css = document.createElement('style');
  css.textContent =
    '.extras{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}' +
    '@media(max-width:860px){.extras{grid-template-columns:repeat(2,1fr);gap:10px}.extra{padding:14px}.extra b{font-size:16px}.extra span{font-size:13px}}' +
    '.extra{background:var(--card);border:1.5px solid var(--line);border-radius:var(--radius);padding:18px;display:flex;flex-direction:column;gap:6px;transition:border-color .2s,transform .2s}' +
    '.extra:hover{border-color:var(--sand);transform:translateY(-2px)}' +
    '.extra .ic{font-size:30px}' +
    '.extra b{color:var(--navy);font-size:18px}' +
    '.extra span{color:var(--muted);font-size:14px;flex:1}' +
    '.extra em{font-style:normal;color:var(--navy2);font-weight:700;font-size:14px}';
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
    EXTRAS.forEach(function (e) {
      var a = document.createElement('a');
      a.className = 'extra';
      a.href = e.url;
      a.target = '_blank';
      a.rel = 'noopener sponsored';
      a.innerHTML = '<div class="ic">' + e.ic + '</div><b>' + e[l][0] + '</b><span>' + e[l][1] + '</span><em>' + TXT[l].go + '</em>';
      g.appendChild(a);
    });
  }

  render();
  new MutationObserver(render).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
})();
