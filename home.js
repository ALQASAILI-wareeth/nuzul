// عروض الأسبوع
// لتحديث العروض: عدّل مصفوفة DEALS فقط. أي عرض ينتهي تاريخه (until) يختفي تلقائياً.
(function () {
  var DEALS = [
    { img: "maldives", r: "all", until: "2026-12-03", color: "#D32F2F", url: {"kind": "home"},
      ar: { tag: "الجمعة البيضاء · Hotels.com", h: "خصم يصل إلى 50% على فنادق مختارة", p: "تخفيضات Hotels.com السنوية شغالة الحين لما تحجز قبل 3 ديسمبر. الخصم على فنادق مختارة، فقارن السعر قبل ما تحجز.", cta: "شوف العروض" },
      en: { tag: "Black Friday · Hotels.com", h: "Up to 50% off select hotels", p: "The Hotels.com yearly sale is on when you book by 3 December. The discount applies to select hotels, so compare before you book.", cta: "See the deals" } },
    { img: "new-york", r: "all", until: "2026-12-01", color: "#0062A8", url: {"kind": "expedia-deals"},
      ar: { tag: "الجمعة البيضاء · Expedia", h: "عروض السفر على Expedia", p: "صفحة عروض Expedia تعرض تخفيضات الجمعة البيضاء الحين، بخصم يصل إلى 50% حسب ما يعلنون: فنادق وطيران وباقات.", cta: "صفحة العروض" },
      en: { tag: "Black Friday · Expedia", h: "Travel deals on Expedia", p: "Expedia’s deals page is running its Black Friday sale now, advertised at up to 50% off: hotels, flights and packages.", cta: "Deals page" } },
    { img: "new-york", r: "all", from: "2026-12-02", until: "2027-12-31", color: "#0062A8", url: {"kind": "expedia-deals"},
      ar: { tag: "عروض Expedia", h: "صفحة العروض المحدّثة", p: "Expedia تجمع عروضها الحالية في صفحة وحدة وتحدّثها باستمرار: فنادق وطيران وباقات. طلّ عليها قبل ما تحجز.", cta: "صفحة العروض" },
      en: { tag: "Expedia deals", h: "The always-updated deals page", p: "Expedia keeps its current offers on one page and updates it regularly: hotels, flights and packages. Check it before you book.", cta: "Deals page" } },
    { img: "abu-dhabi", r: "me", until: "2026-12-03", color: "#0a8f6a", url: {"kind": "search", "city": "Abu Dhabi", "cin": "2026-12-02", "cout": "2026-12-05"},
      ar: { tag: "عيد الاتحاد 55", h: "إجازة طويلة؟ خلّها قريبة", p: "إجازة 2 و3 ديسمبر. فنادق ومنتجعات في أبوظبي والإمارات القريبة لعطلة نهاية أسبوع طويلة.", cta: "احجز الإجازة" },
      en: { tag: "UAE National Day", h: "A long weekend close to home", p: "Public holiday on 2–3 December. Hotels and resorts in Abu Dhabi for a long weekend.", cta: "Book your break" } },
    { img: "dubai", r: "me", until: "2027-01-17", color: "#c2410c", url: {"kind": "search", "city": "Dubai", "cin": "2026-12-04", "cout": "2026-12-07"},
      ar: { tag: "مهرجان دبي للتسوق", h: "تسوّق وألعاب نارية في دبي", p: "من 4 ديسمبر إلى 17 يناير: خصومات المولات والحفلات والألعاب النارية. اختر فندق قريب من الفعاليات.", cta: "فنادق دبي" },
      en: { tag: "Dubai Shopping Festival", h: "Shopping and fireworks in Dubai", p: "4 December to 17 January: mall sales, concerts and fireworks. Pick a hotel close to the action.", cta: "Dubai hotels" } },
    { img: "makkah", r: "me", until: "2027-01-31", color: "#0a8f6a", url: {"kind": "search", "city": "Makkah", "cin": "2026-12-17", "cout": "2026-12-20"},
      ar: { tag: "عمرة الشتاء", h: "أجواء معتدلة في مكة", p: "الشتاء أريح وقت للعمرة مع العائلة. قارن أسعار الفنادق القريبة من الحرم واحجز بدري.", cta: "فنادق مكة" },
      en: { tag: "Winter Umrah", h: "Mild weather in Makkah", p: "Winter is the most comfortable season for Umrah with family. Compare hotels near the Haram and book early.", cta: "Makkah hotels" } },
    { img: "madinah", r: "me", from: "2027-01-10", until: "2027-03-08", color: "#0a8f6a", url: {"kind": "search", "city": "Madinah", "cin": "2027-02-18", "cout": "2027-02-21"},
      ar: { tag: "رمضان", h: "عمرة رمضان: احجز بدري", p: "رمضان متوقع يبدأ حوالي 8 فبراير 2027 حسب رؤية الهلال. فنادق مكة والمدينة القريبة من الحرمين تمتلي بسرعة، فاحجز من الحين.", cta: "فنادق المدينة" },
      en: { tag: "Ramadan", h: "Ramadan Umrah: book early", p: "Ramadan is expected to begin around 8 February 2027, subject to moon sighting. Hotels near the Two Holy Mosques fill up fast.", cta: "Madinah hotels" } },
    { img: "cairo", r: "me", until: "2027-03-31", color: "#b45309", url: {"kind": "search", "city": "Cairo", "cin": "2027-01-14", "cout": "2027-01-18"},
      ar: { tag: "شتاء القاهرة", h: "الأهرامات في أحلى جو", p: "من أكتوبر لمارس الجو معتدل ومناسب للأهرامات والمتاحف والنيل، بعيد عن حر الصيف.", cta: "فنادق القاهرة" },
      en: { tag: "Cairo in winter", h: "The pyramids in the best weather", p: "October to March is mild and comfortable for the pyramids, museums and the Nile.", cta: "Cairo hotels" } },
    { img: "maldives", r: "as", until: "2027-04-30", color: "#0891b2", url: {"kind": "search", "city": "Maldives", "cin": "2027-01-14", "cout": "2027-01-18"},
      ar: { tag: "موسم الجفاف", h: "المالديف في أحسن أوقاتها", p: "من ديسمبر لأبريل: شمس وبحر هادي ومطر قليل. هذا الموسم العالي، فالأسعار ترتفع، واللي يحجز بدري يلقى خيارات أكثر.", cta: "منتجعات المالديف" },
      en: { tag: "Dry season", h: "The Maldives at its best", p: "December to April brings sun, calm seas and little rain. It is high season, so book early for more choice.", cta: "Maldives resorts" } },
    { img: "phuket", r: "as", until: "2027-03-31", color: "#0891b2", url: {"kind": "search", "city": "Phuket", "cin": "2027-01-21", "cout": "2027-01-25"},
      ar: { tag: "موسم الشواطئ", h: "بوكيت: بحر هادي وشمس", p: "من نوفمبر لمارس أحسن وقت لشواطئ بوكيت: مطر أقل وبحر أهدأ.", cta: "فنادق بوكيت" },
      en: { tag: "Beach season", h: "Phuket: calm seas and sunshine", p: "November to March is the best time for Phuket’s beaches, with less rain and calmer water.", cta: "Phuket hotels" } },
    { img: "bangkok", r: "as", until: "2027-02-28", color: "#7c3aed", url: {"kind": "search", "city": "Bangkok", "cin": "2027-01-07", "cout": "2027-01-11"},
      ar: { tag: "الموسم المعتدل", h: "بانكوك بدون حر ورطوبة", p: "من نوفمبر لفبراير أبرد وأجف شهور السنة في بانكوك، وأريح وقت للأسواق والمعابد.", cta: "فنادق بانكوك" },
      en: { tag: "Cool season", h: "Bangkok without the heat", p: "November to February are Bangkok’s coolest, driest months, ideal for markets and temples.", cta: "Bangkok hotels" } },
    { img: "tokyo", r: "as", from: "2027-01-15", until: "2027-04-10", color: "#db2777", url: {"kind": "search", "city": "Tokyo", "cin": "2027-03-27", "cout": "2027-03-31"},
      ar: { tag: "موسم الساكورا", h: "أزهار الكرز في طوكيو", p: "الأزهار تتفتح عادةً أواخر مارس وأوائل أبريل، والموعد يتغير شوي كل سنة. الفنادق تنحجز بدري في هالأسبوعين.", cta: "فنادق طوكيو" },
      en: { tag: "Sakura season", h: "Cherry blossom in Tokyo", p: "Blossom usually peaks in late March and early April, shifting a little each year. Hotels book up early for those weeks.", cta: "Tokyo hotels" } },
    { img: "tbilisi", r: "eu", until: "2027-02-28", color: "#0062A8", url: {"kind": "search", "city": "Tbilisi", "cin": "2027-01-07", "cout": "2027-01-11"},
      ar: { tag: "موسم الثلج", h: "شتاء جورجيا القريب", p: "ثلاث ساعات ونص تقريباً من الخليج: تبليسي والجبال الثلجية حولها. وجهة شتوية بأسعار معقولة.", cta: "فنادق تبليسي" },
      en: { tag: "Snow season", h: "Winter in nearby Georgia", p: "About three and a half hours from the Gulf: Tbilisi and the snowy mountains around it, at reasonable prices.", cta: "Tbilisi hotels" } },
    { img: "vienna", r: "eu", until: "2026-12-23", color: "#b91c1c", url: {"kind": "search", "city": "Vienna", "cin": "2026-12-11", "cout": "2026-12-14"},
      ar: { tag: "أسواق الشتاء", h: "فيينا مضوّية", p: "أسواق الشتاء في ساحات فيينا تشتغل من منتصف نوفمبر لقبل نهاية ديسمبر: أضواء ومشروبات ساخنة وهدايا.", cta: "فنادق فيينا" },
      en: { tag: "Winter markets", h: "Vienna lit up", p: "Vienna’s winter markets run from mid-November until just before the end of December.", cta: "Vienna hotels" } },
    { img: "london", r: "eu", until: "2027-01-05", color: "#1d4ed8", url: {"kind": "search", "city": "London", "cin": "2026-12-27", "cout": "2026-12-31"},
      ar: { tag: "نهاية السنة", h: "تخفيضات لندن وأضواؤها", p: "تخفيضات المحلات تبدأ 26 ديسمبر، وأضواء الشوارع وألعاب رأس السنة النارية. احجز الفندق بدري لهالأسبوع.", cta: "فنادق لندن" },
      en: { tag: "Year end", h: "London sales and lights", p: "The big shop sales start on 26 December, with street lights and New Year fireworks. Book early for that week.", cta: "London hotels" } },
    { img: "interlaken", r: "eu", until: "2027-03-31", color: "#0e7490", url: {"kind": "search", "city": "Interlaken", "cin": "2027-01-28", "cout": "2027-02-01"},
      ar: { tag: "موسم التزلج", h: "ثلج الألب في إنترلاكن", p: "من ديسمبر لمارس: تزلج وقطارات الجبال ومناظر الثلج. مناسبة للعائلة حتى لو ما تتزلجون.", cta: "فنادق إنترلاكن" },
      en: { tag: "Ski season", h: "Alpine snow in Interlaken", p: "December to March: skiing, mountain railways and snow views, good for families even if you do not ski.", cta: "Interlaken hotels" } },
    { img: "istanbul", r: "eu", until: "2027-02-28", color: "#9a3412", url: {"kind": "search", "city": "Istanbul", "cin": "2027-01-21", "cout": "2027-01-25"},
      ar: { tag: "الموسم الهادي", h: "إسطنبول بدون زحمة", p: "الشتاء موسم هادي في إسطنبول: طوابير أقصر عند المعالم، وأسعار الفنادق عادةً أقل من الصيف.", cta: "فنادق إسطنبول" },
      en: { tag: "Quiet season", h: "Istanbul without the crowds", p: "Winter is the quiet season in Istanbul, with shorter queues and hotel prices usually below summer levels.", cta: "Istanbul hotels" } },
    { img: "marrakech", r: "af", until: "2027-03-31", color: "#c2410c", url: {"kind": "search", "city": "Marrakech", "cin": "2027-02-11", "cout": "2027-02-15"},
      ar: { tag: "شتاء المغرب", h: "مراكش بجو لطيف", p: "من نوفمبر لمارس النهار دافي ومعتدل، مناسب للأسواق القديمة والرياضات وجبال الأطلس.", cta: "فنادق مراكش" },
      en: { tag: "Moroccan winter", h: "Marrakech in mild weather", p: "November to March brings warm, mild days for the old souks, riads and the Atlas mountains.", cta: "Marrakech hotels" } },
    { img: "zanzibar", r: "af", until: "2027-02-28", color: "#0891b2", url: {"kind": "search", "city": "Zanzibar", "cin": "2027-01-14", "cout": "2027-01-18"},
      ar: { tag: "موسم الشمس", h: "زنجبار: شواطئ وبهارات", p: "من ديسمبر لفبراير موسم جاف وحار في زنجبار، مناسب للشواطئ والسباحة.", cta: "فنادق زنجبار" },
      en: { tag: "Sunny season", h: "Zanzibar: beaches and spice", p: "December to February is a hot, dry season in Zanzibar, good for beaches and swimming.", cta: "Zanzibar hotels" } },
    { img: "cape-town", r: "af", until: "2027-02-28", color: "#15803d", url: {"kind": "search", "city": "Cape Town", "cin": "2027-01-21", "cout": "2027-01-25"},
      ar: { tag: "صيف الجنوب", h: "كيب تاون في عز الصيف", p: "ديسمبر إلى فبراير صيف في جنوب أفريقيا: شواطئ وجبل الطاولة ونهار طويل.", cta: "فنادق كيب تاون" },
      en: { tag: "Southern summer", h: "Cape Town in high summer", p: "December to February is summer in South Africa: beaches, Table Mountain and long days.", cta: "Cape Town hotels" } },
    { img: "sydney", r: "am", until: "2027-02-28", color: "#0369a1", url: {"kind": "search", "city": "Sydney", "cin": "2027-01-14", "cout": "2027-01-18"},
      ar: { tag: "صيف أستراليا", h: "سيدني: شمس وشواطئ", p: "ديسمبر إلى فبراير صيف في أستراليا، وألعاب رأس السنة النارية على الميناء من الأشهر في العالم.", cta: "فنادق سيدني" },
      en: { tag: "Australian summer", h: "Sydney: sun and beaches", p: "December to February is summer in Australia, and the New Year harbour fireworks are among the world’s most famous.", cta: "Sydney hotels" } },
    { img: "cancun", r: "am", until: "2027-04-30", color: "#0891b2", url: {"kind": "search", "city": "Cancun", "cin": "2027-02-11", "cout": "2027-02-15"},
      ar: { tag: "موسم الجفاف", h: "كانكون والكاريبي", p: "من ديسمبر لأبريل موسم الجفاف في كانكون: شمس وبحر كاريبي صافي.", cta: "فنادق كانكون" },
      en: { tag: "Dry season", h: "Cancun and the Caribbean", p: "December to April is Cancun’s dry season, with sunshine and clear Caribbean water.", cta: "Cancun hotels" } },
    { img: "new-york", r: "am", from: "2027-01-03", until: "2027-02-28", color: "#334155", url: {"kind": "search", "city": "New York", "cin": "2027-01-21", "cout": "2027-01-25"},
      ar: { tag: "الموسم الهادي", h: "نيويورك بسعر أهدأ", p: "يناير وفبراير أهدأ شهور السنة في نيويورك، وأسعار الفنادق فيها عادةً أقل من باقي السنة. الجو بارد، فجهّز ملابسك.", cta: "فنادق نيويورك" },
      en: { tag: "Quiet season", h: "New York for less", p: "January and February are New York’s quietest months, and hotel prices are usually lower than the rest of the year. Pack for the cold.", cta: "New York hotels" } }
  ];

  var TXT = {
    ar: { h: 'عروض ومواسم حول العالم', sub: 'عروض مواقع الحجز الحالية وأحسن وقت لكل وجهة، نحدّثها كل أسبوع', more: function (n) { return 'عرض كل العروض (' + n + ')'; }, less: 'عرض أقل', reg: { all: 'الكل', me: 'الخليج والشرق الأوسط', as: 'آسيا', eu: 'أوروبا والقوقاز', af: 'أفريقيا', am: 'الأمريكتان وأستراليا' }, left: function (d) { return d <= 0 ? 'آخر يوم اليوم' : (d === 1 ? 'باقي يوم واحد' : (d === 2 ? 'باقي يومين' : 'باقي ' + d + (d <= 10 ? ' أيام' : ' يوم'))); } },
    en: { h: 'Deals and seasons worldwide', sub: 'Current booking-site sales and the best time for each destination, updated weekly', more: function (n) { return 'Show all (' + n + ')'; }, less: 'Show less', reg: { all: 'All', me: 'Gulf & Middle East', as: 'Asia', eu: 'Europe & Caucasus', af: 'Africa', am: 'Americas & Australia' }, left: function (d) { return d <= 0 ? 'Last day today' : d + (d === 1 ? ' day left' : ' days left'); } }
  };

  function lang() { return document.documentElement.lang === 'en' ? 'en' : 'ar'; }
  // العروض تروح لـ Hotels.com (شراكة فعّالة). Booking يرجع بعد موافقة برنامج العمولة.
  var EGC = { camref: '1011l6vPKX', creativeref: '1011l66481' };
  function dealUrl(u) {
    var p = new URLSearchParams();
    if (u.kind === 'expedia-deals') return 'https://www.expedia.com/affiliate?' + new URLSearchParams({ landingPage: 'https://www.expedia.com/deals', camref: '1101l6yQPk', adref: 'deals' }).toString();
    var landing = 'https://www.hotels.com/';
    if (u.kind === 'search') {
      p.set('destination', u.city === 'Makkah' ? 'Mecca' : u.city);
      p.set('startDate', u.cin); p.set('endDate', u.cout);
      p.set('adults', '2'); p.set('rooms', '1');
      landing = 'https://www.hotels.com/Hotel-Search?' + p.toString();
    }
    var a = new URLSearchParams({ landingPage: landing, camref: EGC.camref, creativeref: EGC.creativeref, adref: 'deals' });
    return 'https://www.hotels.com/affiliate?' + a.toString();
  }
  // بطاقات العروض بدون صور: لون العرض + أيقونة الوجهة (عروض المواقع العامة تاخذ أيقونة التخفيض)
  var ICON = { 'abu-dhabi': '🕌', bangkok: '🛕', cairo: '🐪', cancun: '🏝️', 'cape-town': '⛰️', dubai: '🏙️', interlaken: '🏔️', istanbul: '🕌', london: '🎡', madinah: '🕌', makkah: '🕋',
    maldives: '🏝️', marrakech: '🏜️', 'new-york': '🗽', phuket: '🏖️', sydney: '🌊', tbilisi: '🍇', tokyo: '🗼', vienna: '🎻', zanzibar: '🌴' };
  function icon(d) { return d.r === 'all' ? '🏷️' : (ICON[d.img] || '✈️'); }
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
    '.deal .hd{position:relative;height:118px;overflow:hidden;color:#fff;background:var(--dc);background:linear-gradient(135deg,var(--dc) 0%,color-mix(in srgb,var(--dc) 55%,#041628) 100%)}' +
    '.deal .hd::before{content:"";position:absolute;width:190px;height:190px;border-radius:50%;inset-inline-end:-50px;top:-70px;background:rgba(255,255,255,.12)}' +
    '.deal .hd::after{content:"";position:absolute;width:120px;height:120px;border-radius:50%;inset-inline-end:70px;bottom:-80px;background:rgba(255,255,255,.08)}' +
    '.deal .ic{position:absolute;z-index:1;inset-inline-end:14px;bottom:12px;width:58px;height:58px;border-radius:18px;display:grid;place-items:center;font-size:32px;background:rgba(255,255,255,.18);border:1px solid rgba(255,255,255,.28);box-shadow:0 8px 20px -8px rgba(0,0,0,.35)}' +
    '.deal .tag{position:absolute;z-index:1;top:14px;inset-inline-start:14px;background:rgba(255,255,255,.95);color:var(--dc);font-weight:800;font-size:13px;padding:4px 12px;border-radius:999px;max-width:calc(100% - 28px);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}' +
    '.deal .left{position:absolute;z-index:1;bottom:14px;inset-inline-start:14px;background:rgba(4,22,40,.55);color:#FFD27A;font-weight:800;font-size:12.5px;padding:3px 10px;border-radius:999px}' +
    '.deal .bd{padding:14px 16px 16px;display:flex;flex-direction:column;gap:6px;flex:1}' +
    '.deal b{color:var(--navy);font-size:18px;line-height:1.35}' +
    '.deal p{color:var(--muted);font-size:14px;flex:1}' +
    '.deal em{font-style:normal;align-self:flex-start;background:var(--sand);color:var(--navy);font-weight:800;font-size:14px;padding:7px 16px;border-radius:10px;margin-top:4px}' +
    '.dl-tabs{display:flex;gap:8px;overflow-x:auto;padding-bottom:10px;margin-bottom:6px;scrollbar-width:none}.dl-tabs::-webkit-scrollbar{display:none}' +
    '.dl-tabs button{flex:0 0 auto;min-height:40px;border:1.5px solid var(--line);background:#fff;color:var(--navy);font:inherit;font-weight:700;font-size:14.5px;padding:0 16px;border-radius:999px;cursor:pointer;white-space:nowrap}' +
    '.dl-tabs button.on{background:var(--navy);border-color:var(--navy);color:#fff}' +
    '.dl-more{display:block;margin:16px auto 0;min-height:46px;border:1.5px solid var(--navy);background:#fff;color:var(--navy);font:inherit;font-weight:800;font-size:15px;padding:0 24px;border-radius:999px;cursor:pointer}';
  document.head.appendChild(css);

  var sec = document.createElement('section');
  sec.id = 'deals';
  sec.innerHTML = '<div class="wrap"><h2 id="dlH"></h2><p class="sub" id="dlSub"></p><div class="dl-tabs" id="dlTabs"></div><div class="deals" id="dlGrid"></div><button type="button" class="dl-more" id="dlMore"></button></div>';
  var search = document.querySelector('.search');
  var destSec = document.getElementById('destinations');
  if (destSec && destSec.parentNode) destSec.parentNode.insertBefore(sec, destSec.nextSibling);
  else if (search && search.parentNode) search.parentNode.insertBefore(sec, search.nextSibling);

  var REG = 'all', ALL = false;
  function render() {
    var l = lang(), T = TXT[l];
    document.getElementById('dlH').textContent = T.h;
    document.getElementById('dlSub').textContent = T.sub;
    var g = document.getElementById('dlGrid');
    g.innerHTML = '';
    var today = new Date().toISOString().slice(0, 10);
    var live = DEALS.filter(function (d) { return daysLeft(d.until) >= 0 && (!d.from || d.from <= today); });
    var regs = ['all', 'me', 'as', 'eu', 'af', 'am'].filter(function (r) { return r === 'all' || live.some(function (d) { return d.r === r; }); });
    if (regs.indexOf(REG) < 0) REG = 'all';
    var tabs = document.getElementById('dlTabs'); tabs.innerHTML = '';
    regs.forEach(function (r) {
      var b = document.createElement('button'); b.type = 'button'; b.textContent = T.reg[r];
      if (r === REG) b.className = 'on';
      b.onclick = function () { REG = r; ALL = false; render(); };
      tabs.appendChild(b);
    });
    // في تبويب المنطقة: عروض المنطقة أول، وبعدها العروض العامة
    var list = REG === 'all' ? live : live.filter(function (d) { return d.r === REG; }).concat(live.filter(function (d) { return d.r === 'all'; }));
    var LIMIT = 3, shown = live.length;
    list.slice(0, ALL ? list.length : LIMIT).forEach(function (d) {
      var left = daysLeft(d.until);
      var a = document.createElement('a');
      a.className = 'deal';
      a.href = dealUrl(d.url);
      a.target = '_blank';
      a.rel = 'noopener sponsored';
      a.innerHTML =
        '<div class="hd" style="--dc:' + d.color + '"><span class="ic" aria-hidden="true">' + icon(d) + '</span>' +
        '<span class="tag">' + d[l].tag + '</span>' +
        (left <= 30 ? '<span class="left">' + T.left(left) + '</span>' : '') + '</div>' +
        '<div class="bd"><b>' + d[l].h + '</b><p>' + d[l].p + '</p><em>' + d[l].cta + (l === 'en' ? ' →' : ' ←') + '</em></div>';
      g.appendChild(a);
    });
    var more = document.getElementById('dlMore');
    more.style.display = list.length > LIMIT ? '' : 'none';
    more.textContent = ALL ? T.less : T.more(list.length);
    more.onclick = function () { ALL = !ALL; render(); if (!ALL) sec.scrollIntoView({ behavior: 'smooth' }); };
    sec.style.display = shown ? '' : 'none';
  }

  render();
  new MutationObserver(render).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
})();
