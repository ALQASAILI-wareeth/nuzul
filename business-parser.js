// نُزُل — محلل طلبات الشركات (يعمل داخل المتصفح بدون خادم)
// يفهم طلباً مكتوباً بالعربية أو الإنجليزية ويستخرج: الوجهات، الغرف، الليالي، التواريخ،
// التذاكر، السيارات، التوصيل، الميزانية، النجوم، ومدينة الانطلاق.
(function (root) {
  'use strict';

  // [عربي, English, الدولة, Country, IATA, أسماء بديلة (بعد التطبيع)]
  var CITY_DATA = [
    ['دبي', 'Dubai', 'الإمارات', 'UAE', 'DXB', ['دبي', 'dubai']],
    ['أبوظبي', 'Abu Dhabi', 'الإمارات', 'UAE', 'AUH', ['ابوظبي', 'ابو ظبي', 'abu dhabi', 'abudhabi']],
    ['الشارقة', 'Sharjah', 'الإمارات', 'UAE', 'SHJ', ['الشارقه', 'شارقه', 'sharjah']],
    ['مكة المكرمة', 'Makkah', 'السعودية', 'Saudi Arabia', 'JED', ['مكه المكرمه', 'مكه', 'makkah', 'mecca']],
    ['المدينة المنورة', 'Madinah', 'السعودية', 'Saudi Arabia', 'MED', ['المدينه المنوره', 'madinah', 'medina']],
    ['الرياض', 'Riyadh', 'السعودية', 'Saudi Arabia', 'RUH', ['الرياض', 'رياض', 'riyadh']],
    ['جدة', 'Jeddah', 'السعودية', 'Saudi Arabia', 'JED', ['جده', 'jeddah', 'jedda']],
    ['الدمام', 'Dammam', 'السعودية', 'Saudi Arabia', 'DMM', ['الدمام', 'dammam']],
    ['الدوحة', 'Doha', 'قطر', 'Qatar', 'DOH', ['الدوحه', 'دوحه', 'doha']],
    ['مسقط', 'Muscat', 'عُمان', 'Oman', 'MCT', ['مسقط', 'muscat']],
    ['المنامة', 'Manama', 'البحرين', 'Bahrain', 'BAH', ['المنامه', 'manama']],
    ['الكويت', 'Kuwait City', 'الكويت', 'Kuwait', 'KWI', ['الكويت', 'kuwait']],
    ['عمّان', 'Amman', 'الأردن', 'Jordan', 'AMM', ['amman']],
    ['بيروت', 'Beirut', 'لبنان', 'Lebanon', 'BEY', ['بيروت', 'beirut']],
    ['إسطنبول', 'Istanbul', 'تركيا', 'Türkiye', 'IST', ['اسطنبول', 'استنبول', 'اسطانبول', 'istanbul']],
    ['طرابزون', 'Trabzon', 'تركيا', 'Türkiye', 'TZX', ['طرابزون', 'trabzon']],
    ['أنطاليا', 'Antalya', 'تركيا', 'Türkiye', 'AYT', ['انطاليا', 'antalya']],
    ['لندن', 'London', 'بريطانيا', 'United Kingdom', 'LON', ['لندن', 'london']],
    ['باريس', 'Paris', 'فرنسا', 'France', 'PAR', ['باريس', 'paris']],
    ['روما', 'Rome', 'إيطاليا', 'Italy', 'ROM', ['روما', 'rome']],
    ['ميلانو', 'Milan', 'إيطاليا', 'Italy', 'MIL', ['ميلانو', 'ميلان', 'milan']],
    ['برشلونة', 'Barcelona', 'إسبانيا', 'Spain', 'BCN', ['برشلونه', 'barcelona']],
    ['مدريد', 'Madrid', 'إسبانيا', 'Spain', 'MAD', ['مدريد', 'madrid']],
    ['أمستردام', 'Amsterdam', 'هولندا', 'Netherlands', 'AMS', ['امستردام', 'amsterdam']],
    ['فيينا', 'Vienna', 'النمسا', 'Austria', 'VIE', ['فيينا', 'vienna']],
    ['جنيف', 'Geneva', 'سويسرا', 'Switzerland', 'GVA', ['جنيف', 'geneva']],
    ['زيورخ', 'Zurich', 'سويسرا', 'Switzerland', 'ZRH', ['زيورخ', 'zurich']],
    ['إنترلاكن', 'Interlaken', 'سويسرا', 'Switzerland', 'ZRH', ['انترلاكن', 'interlaken']],
    ['ميونخ', 'Munich', 'ألمانيا', 'Germany', 'MUC', ['ميونخ', 'ميونيخ', 'munich']],
    ['برلين', 'Berlin', 'ألمانيا', 'Germany', 'BER', ['برلين', 'berlin']],
    ['فرانكفورت', 'Frankfurt', 'ألمانيا', 'Germany', 'FRA', ['فرانكفورت', 'frankfurt']],
    ['باكو', 'Baku', 'أذربيجان', 'Azerbaijan', 'GYD', ['باكو', 'baku']],
    ['تبليسي', 'Tbilisi', 'جورجيا', 'Georgia', 'TBS', ['تبليسي', 'تبيليسي', 'tbilisi']],
    ['كوالالمبور', 'Kuala Lumpur', 'ماليزيا', 'Malaysia', 'KUL', ['كوالالمبور', 'كوالا لمبور', 'kuala lumpur']],
    ['بالي', 'Bali', 'إندونيسيا', 'Indonesia', 'DPS', ['بالي', 'bali']],
    ['جاكرتا', 'Jakarta', 'إندونيسيا', 'Indonesia', 'JKT', ['جاكرتا', 'jakarta']],
    ['بانكوك', 'Bangkok', 'تايلاند', 'Thailand', 'BKK', ['بانكوك', 'bangkok']],
    ['بوكيت', 'Phuket', 'تايلاند', 'Thailand', 'HKT', ['بوكيت', 'فوكيت', 'phuket']],
    ['المالديف', 'Maldives', 'المالديف', 'Maldives', 'MLE', ['المالديف', 'مالديف', 'maldives']],
    ['طوكيو', 'Tokyo', 'اليابان', 'Japan', 'TYO', ['طوكيو', 'tokyo']],
    ['سنغافورة', 'Singapore', 'سنغافورة', 'Singapore', 'SIN', ['سنغافوره', 'singapore']],
    ['سيول', 'Seoul', 'كوريا الجنوبية', 'South Korea', 'SEL', ['سيول', 'seoul']],
    ['القاهرة', 'Cairo', 'مصر', 'Egypt', 'CAI', ['القاهره', 'cairo']],
    ['شرم الشيخ', 'Sharm El Sheikh', 'مصر', 'Egypt', 'SSH', ['شرم الشيخ', 'شرم', 'sharm el sheikh', 'sharm']],
    ['الدار البيضاء', 'Casablanca', 'المغرب', 'Morocco', 'CMN', ['الدار البيضاء', 'كازابلانكا', 'casablanca']],
    ['مراكش', 'Marrakech', 'المغرب', 'Morocco', 'RAK', ['مراكش', 'marrakech', 'marrakesh']],
    ['تونس', 'Tunis', 'تونس', 'Tunisia', 'TUN', ['تونس', 'tunis']],
    ['زنجبار', 'Zanzibar', 'تنزانيا', 'Tanzania', 'ZNZ', ['زنجبار', 'zanzibar']],
    ['كيب تاون', 'Cape Town', 'جنوب أفريقيا', 'South Africa', 'CPT', ['كيب تاون', 'cape town']],
    ['نيويورك', 'New York', 'أمريكا', 'USA', 'NYC', ['نيويورك', 'new york']],
    ['لوس أنجلوس', 'Los Angeles', 'أمريكا', 'USA', 'LAX', ['لوس انجلوس', 'los angeles']],
    ['أورلاندو', 'Orlando', 'أمريكا', 'USA', 'MCO', ['اورلاندو', 'orlando']],
    ['تورونتو', 'Toronto', 'كندا', 'Canada', 'YTO', ['تورونتو', 'تورنتو', 'toronto']],
    ['كانكون', 'Cancun', 'المكسيك', 'Mexico', 'CUN', ['كانكون', 'cancun']],
    ['ريو دي جانيرو', 'Rio de Janeiro', 'البرازيل', 'Brazil', 'RIO', ['ريو دي جانيرو', 'rio de janeiro']],
    ['سيدني', 'Sydney', 'أستراليا', 'Australia', 'SYD', ['سيدني', 'sydney']],
    ['ملبورن', 'Melbourne', 'أستراليا', 'Australia', 'MEL', ['ملبورن', 'melbourne']],
    ['أوكلاند', 'Auckland', 'نيوزيلندا', 'New Zealand', 'AKL', ['اوكلاند', 'auckland']],
    ['فيجي', 'Fiji', 'فيجي', 'Fiji', 'NAN', ['فيجي', 'fiji']]
  ];
  var CITIES = CITY_DATA.map(function (r) {
    return { ar: r[0], en: r[1], cAr: r[2], cEn: r[3], iata: r[4], aliases: r[5] };
  });
  function cityByEn(en) { for (var i = 0; i < CITIES.length; i++) if (CITIES[i].en === en) return CITIES[i]; return null; }

  // الدولة ← المدينة الرئيسية
  var COUNTRY_MAIN = [
    [['تركيا', 'turkey', 'turkiye'], 'Istanbul'], [['الامارات', 'uae', 'emirates'], 'Dubai'],
    [['السعوديه', 'saudi', 'ksa'], 'Riyadh'], [['قطر', 'qatar'], 'Doha'], [['سلطنه عمان', 'oman'], 'Muscat'],
    [['البحرين', 'bahrain'], 'Manama'], [['الاردن', 'jordan'], 'Amman'], [['لبنان', 'lebanon'], 'Beirut'],
    [['بريطانيا', 'انجلترا', 'المملكه المتحده', 'uk', 'england', 'britain'], 'London'], [['فرنسا', 'france'], 'Paris'],
    [['ايطاليا', 'italy'], 'Rome'], [['اسبانيا', 'spain'], 'Barcelona'], [['هولندا', 'netherlands', 'holland'], 'Amsterdam'],
    [['النمسا', 'austria'], 'Vienna'], [['سويسرا', 'switzerland'], 'Zurich'], [['المانيا', 'germany'], 'Munich'],
    [['اذربيجان', 'azerbaijan'], 'Baku'], [['جورجيا', 'georgia'], 'Tbilisi'], [['ماليزيا', 'malaysia'], 'Kuala Lumpur'],
    [['اندونيسيا', 'indonesia'], 'Bali'], [['تايلاند', 'thailand'], 'Bangkok'], [['اليابان', 'japan'], 'Tokyo'],
    [['كوريا', 'korea'], 'Seoul'], [['مصر', 'egypt'], 'Cairo'], [['المغرب', 'morocco'], 'Marrakech'],
    [['تنزانيا', 'tanzania'], 'Zanzibar'], [['جنوب افريقيا', 'south africa'], 'Cape Town'],
    [['امريكا', 'الولايات المتحده', 'usa', 'america'], 'New York'], [['كندا', 'canada'], 'Toronto'],
    [['المكسيك', 'mexico'], 'Cancun'], [['البرازيل', 'brazil'], 'Rio de Janeiro'], [['استراليا', 'australia'], 'Sydney'],
    [['نيوزيلندا', 'new zealand'], 'Auckland']
  ];

  var L = 'a-z\\u0621-\\u064A';            // حروف الكلمة
  var NB = '(?=$|[^' + L + '])';           // نهاية كلمة
  var SB = '(^|[^' + L + '0-9])';          // بداية كلمة (مجموعة ملتقطة)

  function norm(s) {
    return String(s || '')
      .replace(/[ً-ٰٟـ]/g, '')
      .replace(/[أإآٱ]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه').replace(/ؤ/g, 'و').replace(/ئ/g, 'ي')
      .replace(/[٠-٩]/g, function (d) { return String(d.charCodeAt(0) - 0x0660); })
      .replace(/[۰-۹]/g, function (d) { return String(d.charCodeAt(0) - 0x06F0); })
      .replace(/٫/g, '.').replace(/٬/g, ',')
      .replace(/[‏‎]/g, '')
      .toLowerCase();
  }

  var NUMW = {
    'واحد': 1, 'واحده': 1, 'اثنين': 2, 'اثنان': 2, 'اثنتين': 2, 'اثنتان': 2, 'ثنتين': 2, 'زوج': 2,
    'ثلاث': 3, 'ثلاثه': 3, 'اربع': 4, 'اربعه': 4, 'خمس': 5, 'خمسه': 5, 'ست': 6, 'سته': 6, 'سبع': 7, 'سبعه': 7,
    'ثمان': 8, 'ثماني': 8, 'ثمانيه': 8, 'تسع': 9, 'تسعه': 9, 'عشر': 10, 'عشره': 10,
    'احدعشر': 11, 'احد عشر': 11, 'اثنا عشر': 12, 'اثني عشر': 12, 'اطنعش': 12, 'خمسطعش': 15, 'خمسه عشر': 15, 'خمس عشره': 15,
    'عشرين': 20, 'عشرون': 20, 'ثلاثين': 30, 'اربعين': 40, 'خمسين': 50, 'ستين': 60, 'سبعين': 70, 'ثمانين': 80, 'تسعين': 90,
    'ميه': 100, 'مئه': 100, 'مايه': 100, 'ميتين': 200, 'مئتين': 200, 'مئتان': 200,
    'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5, 'six': 6, 'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10,
    'eleven': 11, 'twelve': 12, 'fifteen': 15, 'twenty': 20, 'thirty': 30, 'forty': 40, 'fifty': 50, 'hundred': 100,
    'a couple of': 2, 'couple of': 2, 'a single': 1, 'single': 1
  };
  var DUALS = [
    [['غرفتين', 'غرفتان'], 'غرف'], [['تذكرتين', 'تذكرتان'], 'تذاكر'], [['سيارتين', 'سيارتان'], 'سيارات'],
    [['ليلتين', 'ليلتان'], 'ليالي'], [['يومين', 'يومان'], 'ايام'], [['فندقين', 'فندقان'], 'فنادق'],
    [['شخصين', 'شخصان'], 'اشخاص'], [['اسبوعين', 'اسبوعان'], 'اسابيع'], [['دولتين', 'دولتان'], 'دول'],
    [['مدينتين', 'مدينتان'], 'مدن'], [['وجهتين', 'وجهتان'], 'وجهات'], [['توصيلتين'], 'توصيل'],
    [['باصين', 'حافلتين'], 'باصات']
  ];

  var N = {
    room: 'غرف|غرفه|الغرف|room|rooms',
    night: 'ليالي|ليال|ليله|الليالي|night|nights',
    day: 'ايام|يوم|day|days',
    week: 'اسابيع|اسبوع|week|weeks',
    people: 'اشخاص|شخص|موظفين|موظف|افراد|فرد|مسافرين|مسافر|نفر|ضيوف|ضيف|بالغين|people|persons|person|employees|employee|staff|travellers|travelers|traveller|traveler|pax|guests|adults',
    ticket: 'تذاكر|تذكره|ticket|tickets|flight tickets|seats|مقاعد|مقعد',
    car: 'سيارات|سياره|cars|car|vehicles|vehicle',
    transfer: 'توصيلات|توصيل|باصات|باص|حافلات|حافله|transfers|transfer|pickups|pickup|shuttles|shuttle|buses|bus|vans|van',
    hotel: 'فنادق|فندق|hotels|hotel',
    dest: 'وجهات|وجهه|دول|دوله|مدن|مدينه|destinations|destination|countries|country|cities|city'
  };

  var MONTHS = [
    [['يناير', 'كانون الثاني', 'january', 'jan'], 1], [['فبراير', 'شباط', 'february', 'feb'], 2],
    [['مارس', 'اذار', 'march', 'mar'], 3], [['ابريل', 'نيسان', 'april', 'apr'], 4], [['مايو', 'ايار', 'may'], 5],
    [['يونيو', 'حزيران', 'june', 'jun'], 6], [['يوليو', 'تموز', 'july', 'jul'], 7], [['اغسطس', 'august', 'aug'], 8],
    [['سبتمبر', 'ايلول', 'september', 'sept', 'sep'], 9], [['اكتوبر', 'تشرين الاول', 'october', 'oct'], 10],
    [['نوفمبر', 'تشرين الثاني', 'november', 'nov'], 11], [['ديسمبر', 'كانون الاول', 'december', 'dec'], 12]
  ];
  var MONTH_ALT = [], MONTH_NUM = {};
  MONTHS.forEach(function (m) { m[0].forEach(function (w) { MONTH_ALT.push(w); MONTH_NUM[w] = m[1]; }); });
  MONTH_ALT.sort(function (a, b) { return b.length - a.length; });
  var MON = '(' + MONTH_ALT.join('|') + ')';

  var CUR = [
    [['دولار', 'دولارات', 'usd', 'us\\$', '\\$', 'dollars', 'dollar'], 'USD'], [['درهم', 'دراهم', 'aed', 'dhs', 'dh'], 'AED'],
    [['ريال سعودي', 'ريال', 'ريالات', 'sar', 'sr'], 'SAR'], [['ريال قطري', 'qar'], 'QAR'], [['دينار كويتي', 'kwd'], 'KWD'],
    [['دينار بحريني', 'bhd'], 'BHD'], [['ريال عماني', 'omr'], 'OMR'], [['دينار اردني', 'دينار', 'jod'], 'JOD'],
    [['يورو', 'eur', '€', 'euros', 'euro'], 'EUR'], [['جنيه استرليني', 'استرليني', 'gbp', '£'], 'GBP'], [['جنيه', 'egp'], 'EGP']
  ];
  var CUR_ALT = [], CUR_CODE = {};
  CUR.forEach(function (c) { c[0].forEach(function (w) { CUR_ALT.push(w); CUR_CODE[w.replace(/\\/g, '')] = c[1]; }); });
  CUR_ALT.sort(function (a, b) { return b.replace(/\\/g, '').length - a.replace(/\\/g, '').length; });
  var CURRE = '(' + CUR_ALT.join('|') + ')';
  // تقريبي، يستخدم فقط لاقتراح فئة النجوم (العملات الخليجية مربوطة بالدولار)
  var TO_USD = { USD: 1, AED: 1 / 3.6725, SAR: 1 / 3.75, QAR: 1 / 3.64, KWD: 3.25, BHD: 2.66, OMR: 2.6, JOD: 1.41, EUR: 1.08, GBP: 1.27, EGP: 0.02 };

  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function iso(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function addDays(isoStr, n) { var p = isoStr.split('-'); var d = new Date(+p[0], +p[1] - 1, +p[2]); d.setDate(d.getDate() + n); return iso(d); }
  function nightsBetween(a, b) {
    var pa = a.split('-'), pb = b.split('-');
    return Math.round((new Date(+pb[0], +pb[1] - 1, +pb[2]) - new Date(+pa[0], +pa[1] - 1, +pa[2])) / 864e5);
  }

  function prep(text) {
    var s = ' ' + norm(text) + ' ';
    s = s.replace(/(\d),(?=\d{3}(?!\d))/g, '$1');                         // 20,000 → 20000
    // كلمات الأعداد (الأطول أولاً)
    var words = Object.keys(NUMW).sort(function (a, b) { return b.length - a.length; });
    s = s.replace(new RegExp(SB + '(و|ب|ل)?(' + words.join('|') + ')' + NB, 'g'), function (m, a, p, w) {
      return a + (p || '') + NUMW[w];
    });
    s = s.replace(/(^|[^0-9])([1-9])\s*و\s*([2-9]0)(?![0-9])/g, function (m, a, x, y) { return a + (+x + +y); }); // خمسه وعشرين
    // ألف/آلاف/مليون
    s = s.replace(/(\d+(?:\.\d+)?)\s*(?:الاف|الف|k|thousand)(?=$|[^a-zء-ي])/g, function (m, n) { return String(Math.round(parseFloat(n) * 1000)); });
    s = s.replace(/(\d+(?:\.\d+)?)\s*(?:مليون|million|m)(?=$|[^a-zء-ي])/g, function (m, n) { return String(Math.round(parseFloat(n) * 1e6)); });
    s = s.replace(new RegExp(SB + '(و|ب)?الفين' + NB, 'g'), '$1$2 2000');
    s = s.replace(new RegExp(SB + '(و|ب)?الف' + NB, 'g'), '$1$2 1000');
    // المثنى
    DUALS.forEach(function (d) {
      s = s.replace(new RegExp(SB + '(و|ب|ل)?(' + d[0].join('|') + ')' + NB, 'g'), function (m, a, p) {
        return a + (p || '') + ' 2 ' + d[1];
      });
    });
    s = s.replace(/\s+/g, ' ');
    return s;
  }

  // ---------- التواريخ ----------
  function mkDate(y, m, d, today) {
    if (!(m >= 1 && m <= 12 && d >= 1 && d <= 31)) return null;
    if (!y) {
      y = today.getFullYear();
      var cand = new Date(y, m - 1, d);
      if (cand < new Date(today.getFullYear(), today.getMonth(), today.getDate())) y += 1;
    } else if (y < 100) y += 2000;
    return iso(new Date(y, m - 1, d));
  }

  function findDates(c, today) {
    var out = [];
    var re, m;
    // 2026-12-10
    re = /(20\d\d)[-\/.](\d{1,2})[-\/.](\d{1,2})/g;
    while ((m = re.exec(c))) out.push({ i: m.index, d: mkDate(+m[1], +m[2], +m[3], today) });
    // 10/12/2026 أو 10/12
    re = /(?:^|[^\d\/.-])(\d{1,2})[\/.](\d{1,2})(?:[\/.](\d{2,4}))?(?![\d\/])/g;
    while ((m = re.exec(c))) out.push({ i: m.index, d: mkDate(m[3] ? +m[3] : 0, +m[2], +m[1], today) });
    // 10 - 15 ديسمبر  /  من 10 الي 15 ديسمبر
    re = new RegExp('(\\d{1,2})\\s*(?:-|–|الي|إلى|لين|حتي|to|till|until)\\s*(\\d{1,2})\\s*(?:من\\s*)?(?:شهر\\s*)?' + MON + NB + '(?:\\s*(20\\d\\d))?', 'g');
    var used = [];
    while ((m = re.exec(c))) {
      var mo = MONTH_NUM[m[3]], y = m[4] ? +m[4] : 0;
      out.push({ i: m.index, d: mkDate(y, mo, +m[1], today) });
      out.push({ i: m.index + 1, d: mkDate(y, mo, +m[2], today) });
      used.push([m.index, m.index + m[0].length]);
    }
    // Feb 10-14
    re = new RegExp(SB + MON + '\\s+(\\d{1,2})\\s*(?:-|–|الي|to|till|until)\\s*(\\d{1,2})(?!\\d)(?:\\s*,?\\s*(20\\d\\d))?', 'g');
    while ((m = re.exec(c))) {
      var mo2 = MONTH_NUM[m[2]], y2 = m[5] ? +m[5] : 0;
      out.push({ i: m.index, d: mkDate(y2, mo2, +m[3], today) });
      out.push({ i: m.index + 1, d: mkDate(y2, mo2, +m[4], today) });
      used.push([m.index, m.index + m[0].length]);
    }
    // بداية/منتصف/نهاية الشهر
    re = new RegExp('(بدايه|اول|اوايل|اوائل|مطلع|منتصف|نص|نهايه|اخر|اواخر|beginning of|early|start of|mid|middle of|end of|late)\\s*(?:شهر\\s*)?' + MON + NB, 'g');
    while ((m = re.exec(c))) {
      var part = m[1], day = /منتصف|نص|mid|middle/.test(part) ? 15 : (/نهايه|اخر|اواخر|end|late/.test(part) ? 24 : 1);
      out.push({ i: m.index, d: mkDate(0, MONTH_NUM[m[2]], day, today) });
      used.push([m.index, m.index + m[0].length]);
    }
    // 10 ديسمبر / ديسمبر 10
    re = new RegExp('(\\d{1,2})\\s*(?:من\\s*)?(?:شهر\\s*)?' + MON + NB + '(?:\\s*,?\\s*(20\\d\\d))?', 'g');
    while ((m = re.exec(c))) {
      var inside = used.some(function (u) { return m.index >= u[0] && m.index < u[1]; });
      if (!inside) out.push({ i: m.index, d: mkDate(m[3] ? +m[3] : 0, MONTH_NUM[m[2]], +m[1], today) });
    }
    re = new RegExp(SB + MON + '\\s+(\\d{1,2})(?!\\d)(?:\\s*,?\\s*(20\\d\\d))?', 'g');
    while ((m = re.exec(c))) {
      var ins2 = used.some(function (u) { return m.index >= u[0] && m.index < u[1]; });
      if (!ins2) out.push({ i: m.index, d: mkDate(m[4] ? +m[4] : 0, MONTH_NUM[m[2]], +m[3], today) });
    }
    out = out.filter(function (x) { return x.d; }).sort(function (a, b) { return a.i - b.i; });
    var seen = {}, res = [];
    out.forEach(function (x) { if (!seen[x.d]) { seen[x.d] = 1; res.push(x.d); } });
    // التاريخ الثاني قبل الأول (مثل 28 ديسمبر الي 3 يناير بلا سنة) → السنة التالية
    if (res.length >= 2 && res[1] <= res[0]) {
      var p = res[1].split('-'); res[1] = iso(new Date(+p[0] + 1, +p[1] - 1, +p[2]));
    }
    return res;
  }

  // ---------- الكميات ----------
  function qty(c, key) {
    var noun = N[key];
    var re = new RegExp('(\\d+)\\s*(?:من\\s*)?(?:ال)?(?:' + noun + ')' + NB);
    var m = c.match(re);
    if (m) return +m[1];
    re = new RegExp(SB + '(?:' + noun + ')\\s*(?:عدد|عددها|عددهم|:|=|x|×)?\\s*(\\d+)(?!\\s*(?:' + N.night + '|' + N.day + '|' + N.people + '|' + N.room + '|نجوم|نجمات|نجم|stars?|\\*)' + NB + ')(?![\\d/.-])');
    m = c.match(re);
    if (m) {
      // تجنب أخذ رقم يوم من تاريخ (مثل "غرف 10 ديسمبر")
      var after = c.slice(c.indexOf(m[0]) + m[0].length);
      if (new RegExp('^\\s*' + MON + NB).test(after)) return null;
      return +m[2];
    }
    return null;
  }
  function has(c, key) { return new RegExp(SB + '(?:و|ب|ل|ال)?(?:' + N[key] + ')' + NB).test(c); }

  // ---------- المدن ----------
  var ALIASES = [];
  CITIES.forEach(function (city) { city.aliases.forEach(function (a) { ALIASES.push({ a: a, city: city }); }); });
  ALIASES.sort(function (x, y) { return y.a.length - x.a.length; });

  function findCities(c) {
    var found = [], mask = c.split('');
    ALIASES.forEach(function (al) {
      var forms = [al.a];
      if (al.a.indexOf('ال') === 0) forms.push('ل' + al.a.slice(1)); // للرياض
      forms.forEach(function (f) {
        var re = new RegExp('(^|[^' + L + '])((?:و|ب|ل|ف|وب|ول|وال)?)(' + f.replace(/ /g, '\\s*') + ')' + NB, 'g'), m;
        while ((m = re.exec(c))) {
          var start = m.index + m[1].length, end = start + m[2].length + m[3].length;
          var free = true;
          for (var k = start; k < end; k++) if (mask[k] === '\u0000') { free = false; break; }
          if (!free) continue;
          for (k = start; k < end; k++) mask[k] = '\u0000';
          var before = c.slice(Math.max(0, start - 22), start);
          var role = /(?:^|[^a-zء-ي])(?:من|from|مغادره من|انطلاقا من|departing from|flying from|leaving from)\s*(?:مطار\s*)?$/.test(before) ? 'origin' : 'dest';
          found.push({ i: start, city: al.city, role: role });
        }
      });
    });
    // عمان: عُمان (الدولة) أو عمّان (الأردن)
    var reO = new RegExp('(^|[^' + L + '])((?:و|ب|ل|من)?\\s?)(عمان)' + NB, 'g'), mo;
    while ((mo = reO.exec(c))) {
      var st = mo.index + mo[1].length;
      if (mask[st] === '\u0000' || /سلطنه\s*$/.test(c.slice(0, st))) continue;
      var amman = /الاردن|jordan/.test(c) || /عمّان/.test(c);
      var bef = c.slice(Math.max(0, st - 22), st);
      found.push({ i: st, city: cityByEn(amman ? 'Amman' : 'Muscat'), role: /(?:من|from)\s*$/.test(bef + mo[2]) ? 'origin' : 'dest', ambiguousOman: !amman });
    }
    found.sort(function (a, b) { return a.i - b.i; });
    return found;
  }

  function findCountries(c) {
    var res = [];
    COUNTRY_MAIN.forEach(function (cm) {
      cm[0].forEach(function (w) {
        var re = new RegExp('(^|[^' + L + '])((?:و|ب|ل|ف|من|وب|ول)?)(' + w + ')' + NB);
        var m = c.match(re);
        if (m) {
          var before = c.slice(0, c.indexOf(m[0]) + m[1].length);
          var origin = /(?:من|from)\s*$/.test(before + m[2].replace(/(و|ب|ل|ف)$/, '')) || m[2] === 'من';
          res.push({ city: cityByEn(cm[1]), country: w, role: origin ? 'origin' : 'dest', i: c.indexOf(m[0]) });
        }
      });
    });
    return res;
  }

  // ---------- المحلل الرئيسي ----------
  function parse(text, opts) {
    opts = opts || {};
    var today = opts.today ? new Date(opts.today) : new Date();
    var s = prep(text);
    var R = {
      destinations: [], origin: null, tickets: null, flightsWanted: false, oneWay: false,
      people: null, rooms: null, nights: null, cin: null, cout: null, cars: null, transfers: null, transfersWanted: false,
      hotels: null, destCount: null, budget: null, stars: null, stayType: null, notes: [], assumed: {}
    };

    // تقسيم إلى جمل
    var t = s.replace(/(^|\s)و(?=\s*\d)/g, ' | ')
      .replace(/\s(?:and|then|plus|after that|followed by|ثم|وبعدها|بعدها|بعد ذلك|وبعدين|بعدين|بالاضافه الي|اضافه الي|كذلك|ايضا)\s/g, ' | ')
      .replace(/[،,؛;\n!؟?]|\.(?!\d)/g, ' | ');
    var clauses = t.split('|').map(function (x) { return ' ' + x.trim() + ' '; }).filter(function (x) { return x.trim(); });

    var byCity = {}, order = [], lastGroup = null, lastNoun = null;
    function dest(city) {
      if (!byCity[city.en]) { byCity[city.en] = { city: city, rooms: null, adults: null, nights: null, cin: null, cout: null, stars: null, cars: null, transfers: null, stayType: null }; order.push(city.en); }
      return byCity[city.en];
    }

    var KEYS = ['room', 'night', 'people', 'ticket', 'car', 'transfer'];
    clauses.forEach(function (c) {
      var eachRe = /(?:^|\s)(?:each|per destination|لكل منها|في كل منها|لكل وحده|لكل واحده|كل وحده)(?=\s|$)/;
      var perCity = eachRe.test(c) || /(?:لكل|في كل|كل)\s*(?:مدينه|وجهه|دوله|فندق)|(?:each|per|every)\s*(?:city|destination|country|hotel)/.test(c);
      var cities = findCities(c);
      var countries = findCountries(c).filter(function (k) {
        return !cities.some(function (ci) { return ci.city.cEn === k.city.cEn; });
      });
      countries.forEach(function (k) {
        if (k.role === 'dest') R.notes.push({ k: 'country', country: k.country, city: k.city });
        cities.push({ i: k.i, city: k.city, role: k.role, fromCountry: true });
      });
      cities.forEach(function (ci) { if (ci.ambiguousOman) R.notes.push({ k: 'oman' }); });

      var origins = cities.filter(function (x) { return x.role === 'origin'; });
      var dests = cities.filter(function (x) { return x.role === 'dest'; });
      if (origins.length && !R.origin) R.origin = origins[0].city;

      var q = {};
      KEYS.forEach(function (k) { q[k] = qty(c, k); });
      // أسبوع/أيام → ليالي
      if (q.night == null) {
        var w = qty(c, 'week'); if (w != null) q.night = w * 7;
        else if (has(c, 'week')) q.night = 7;
        else { var dd = qty(c, 'day'); if (dd != null) q.night = Math.max(1, dd - 1 >= 1 && /يوم|day/.test(c) && !/ليل|night/.test(c) ? dd : dd); }
      }
      // رقم مجرد مع مدينة يرث نوع آخر كمية: "5 غرف في دبي و3 في اسطنبول"
      var any = KEYS.some(function (k) { return q[k] != null; });
      if (!any && lastNoun && dests.length) {
        var bare = c.match(/^\s*(\d+)(?![\d\/.-])/);
        if (bare && !new RegExp('^\\s*\\d+\\s*(?:من\\s*)?' + MON + NB).test(c)) q[lastNoun] = +bare[1];
      }
      KEYS.forEach(function (k) { if (q[k] != null && k !== 'night') lastNoun = k; });

      var hotelsN = qty(c, 'hotel'); if (hotelsN != null) R.hotels = (R.hotels || 0) + hotelsN;
      var destN = qty(c, 'dest'); if (destN != null) R.destCount = Math.max(R.destCount || 0, destN);

      // النجوم ونوع الإقامة
      var st = c.match(/([3-5])\s*(?:نجوم|نجمات|نجمه|نجم|stars?|\*|★)/);
      var stars = st ? +st[1] : (/فاخر|فخم|luxury|vip/.test(c) ? 5 : (/اقتصادي|رخيص|economy|budget hotel|cheap/.test(c) ? 3 : null));
      var stay = /شقق|شقه|apartment/.test(c) ? 'apartment' : (/منتجع|resort/.test(c) ? 'resort' : (/فلل|فيلا|villa/.test(c) ? 'villa' : null));

      var dates = findDates(c, today);
      if (/ذهاب فقط|اتجاه واحد|one[- ]way/.test(c)) R.oneWay = true;
      if (/طيران|طياره|طائره|رحلات جويه|رحله جويه|flight|flights|fly|airline/.test(c)) R.flightsWanted = true;
      if (/توصيل|استقبال|مواصلات|نقل|transfer|pickup|shuttle|transport/.test(c)) R.transfersWanted = true;
      if (q.ticket != null) R.tickets = (R.tickets || 0) + q.ticket;
      if (q.people != null) R.people = Math.max(R.people || 0, q.people);

      var group = dests.length ? dests.map(function (x) { return dest(x.city); }) : null;
      var target = group || (perCity ? null : (lastGroup && !perCity ? lastGroup : null));
      if (group) lastGroup = group;

      if (target) {
        target.forEach(function (d) {
          if (q.room != null) { d.rooms = (d.rooms || 0) + q.room; d._roomsGiven = true; }
          if (q.night != null) d.nights = q.night;
          if (q.car != null) d.cars = (d.cars || 0) + q.car;
          else if (has(c, 'car')) d.cars = d.cars || 1;
          if (q.transfer != null) d.transfers = (d.transfers || 0) + q.transfer;
          if (q.people != null && group && group.length === 1) { d.adults = q.people; d._adultsGiven = true; }
          if (group) {
            if (stars) d.stars = stars;
            if (stay) d.stayType = stay;
            if (dates.length >= 2) { d.cin = dates[0]; d.cout = dates[1]; }
            else if (dates.length === 1) d.cin = dates[0];
          }
        });
        if (perCity && q.night != null) R.nights = q.night;
      }
      if (!group) {
        if (!target) {
          if (q.room != null) R.rooms = (R.rooms || 0) + q.room;
          if (q.night != null) R.nights = q.night;
          if (q.car != null) R.cars = (R.cars || 0) + q.car;
          else if (has(c, 'car') && R.cars == null) R.cars = 1;
          if (q.transfer != null) R.transfers = (R.transfers || 0) + q.transfer;
        }
        if (stars) R.stars = stars;
        if (stay) R.stayType = stay;
        if (dates.length >= 2 && !R.cin) { R.cin = dates[0]; R.cout = dates[1]; }
        else if (dates.length === 1 && !R.cin) R.cin = dates[0];
      }

      // الميزانية
      var bm = c.match(new RegExp('(\\d+(?:\\.\\d+)?)\\s*' + CURRE + '(?=$|[^a-z\\u0621-\\u064A])')) ||
               c.match(new RegExp(CURRE + '\\s*(\\d+(?:\\.\\d+)?)'));
      if (bm) {
        var amt = +(/^\d/.test(bm[1]) ? bm[1] : bm[2]);
        var cw = (/^\d/.test(bm[1]) ? bm[2] : bm[1]).trim();
        if (amt >= 50 && (!R.budget || /ميزانيه|budget|بحدود|حدود|اجمالي|total|max/.test(c))) R.budget = { amount: amt, cur: CUR_CODE[cw] || 'USD' };
      } else if (/ميزانيه|budget/.test(c)) {
        var bn = c.match(/(\d{3,})/);
        if (bn) { R.budget = { amount: +bn[1], cur: 'USD' }; R.notes.push({ k: 'cur' }); }
      }
    });

    // ---------- استكمال القيم ----------
    var dests = order.map(function (k) { return byCity[k]; });
    if (R.origin) {
      // مدينة الانطلاق ليست وجهة إلا إذا ذُكرت كوجهة صراحة بكميات
      dests = dests.filter(function (d) {
        return !(d.city.en === R.origin.en && d.rooms == null && d.cars == null && d.nights == null);
      });
    }
    // وجهات بلا أسماء
    var missing = Math.max(0, (R.destCount || 0) - dests.length);
    for (var i = 0; i < missing; i++) dests.push({ city: null, rooms: null, adults: null, nights: null, cin: null, cout: null, stars: null, cars: null, transfers: null, stayType: null });

    if (R.people == null) {
      if (R.tickets) R.people = R.tickets;
      else if (R.rooms) { R.people = R.rooms; R.assumed.people = true; }
      else {
        var sumRooms = dests.reduce(function (a, d) { return a + (d.rooms || 0); }, 0);
        if (sumRooms) { R.people = Math.max.apply(null, dests.map(function (d) { return d.rooms || 0; })); R.assumed.people = true; }
      }
    }
    if (R.rooms == null && !dests.some(function (d) { return d.rooms; }) && R.people) { R.rooms = R.people; R.assumed.rooms = true; }
    if ((R.flightsWanted || R.origin) && R.tickets == null && R.people) { R.tickets = R.people; R.assumed.tickets = true; }
    if (R.tickets) R.flightsWanted = true;

    // تاريخ واحد مذكور مع وجهة واحدة فقط → يعتبر تاريخ الرحلة كلها
    var dated = dests.filter(function (d) { return d.cin; });
    if (!R.cin && dated.length === 1 && dests.length > 1) {
      R.cin = dated[0].cin; R.cout = dated[0].cout; dated[0].cin = null; dated[0].cout = null;
      if (R.cout && dests.some(function (d) { return d.nights; })) R.cout = null;   // "4 ليالي ثم 3 ليالي ابتداء من..."
    }
    // التواريخ: عالمية أو متسلسلة
    var defaultStart = addDays(iso(today), 14);
    if (!R.cin && !dests.some(function (d) { return d.cin; })) { R.cin = defaultStart; R.assumed.dates = true; }
    if (R.cin && R.cout && R.nights == null) R.nights = nightsBetween(R.cin, R.cout);
    var chain = R.cin && !R.cout && dests.length > 1 && dests.some(function (d) { return d.nights; });
    var cursor = R.cin, prevRooms = null;
    dests.forEach(function (d) {
      if (d.rooms == null && R.rooms == null && prevRooms) d.rooms = prevRooms;
      if (d.rooms == null) { d.rooms = R.rooms || (R.people || 1); if (R.rooms == null) R.assumed.rooms = true; }
      prevRooms = d.rooms;
      if (d.adults == null) d.adults = Math.max(d.rooms, R.people || d.rooms);
      if (d.stars == null) d.stars = R.stars;
      if (d.stayType == null) d.stayType = R.stayType;
      if (d.cars == null) d.cars = R.cars != null ? R.cars : 0;
      if (d.transfers == null) d.transfers = R.transfers != null ? R.transfers : (R.transfersWanted ? 1 : 0);
      if (d.cin && d.cout) { d.nights = nightsBetween(d.cin, d.cout); cursor = d.cout; return; }
      var n = d.nights || R.nights || 3;
      if (!d.nights && !R.nights) R.assumed.nights = true;
      d.nights = n;
      if (!d.cin) d.cin = chain ? cursor : (R.cin || cursor || defaultStart);
      d.cout = (!chain && R.cout && d.cin === R.cin) ? R.cout : addDays(d.cin, n);
      d.nights = nightsBetween(d.cin, d.cout);
      cursor = d.cout;
    });
    // فرق متوازية في وجهات مختلفة: توزيع الأشخاص حسب الغرف
    var sorted = dests.filter(function (d) { return d.cin; }).slice().sort(function (a, b) { return a.cin < b.cin ? -1 : 1; });
    var parallel = sorted.some(function (d, i) { return i > 0 && d.cin < sorted[i - 1].cout; });
    var explicitRooms = dests.filter(function (d) { return d.city && d._roomsGiven; });
    var sumR = explicitRooms.reduce(function (a, d) { return a + d.rooms; }, 0);
    if (parallel && R.people && explicitRooms.length > 1 && sumR >= R.people) {
      explicitRooms.forEach(function (d) { if (!d._adultsGiven) d.adults = Math.max(1, Math.round(R.people * d.rooms / sumR)); });
    }
    R.parallel = parallel;
    // حذف التكرار في الملاحظات
    var seen = {};
    R.notes = R.notes.filter(function (n) { var k = n.k + (n.country || ''); if (seen[k]) return false; seen[k] = 1; return true; });
    R.destinations = dests;
    return R;
  }

  // ---------- الميزانية والتوصيات ----------
  function budgetPlan(R) {
    if (!R.budget) return null;
    var dests = R.destinations.filter(function (d) { return d.city; });
    var roomNights = dests.reduce(function (a, d) { return a + d.rooms * d.nights; }, 0);
    var ground = dests.some(function (d) { return d.cars || d.transfers; });
    var fl = R.flightsWanted && R.tickets;
    var w = fl ? (ground ? [0.55, 0.30, 0.10] : [0.62, 0.33, 0]) : (ground ? [0.82, 0, 0.13] : [0.95, 0, 0]);
    var B = R.budget.amount, usd = TO_USD[R.budget.cur] || 1;
    var hotels = Math.round(B * w[0]), flights = Math.round(B * w[1]), grnd = Math.round(B * w[2]);
    var perNight = roomNights ? Math.round(hotels / roomNights) : null;
    var perTicket = fl ? Math.round(flights / R.tickets) : null;
    var nUsd = perNight ? perNight * usd : null;
    var suggest = nUsd == null ? null : (nUsd < 75 ? 3 : (nUsd < 170 ? 4 : 5));
    return { cur: R.budget.cur, total: B, hotels: hotels, flights: flights, ground: grnd, reserve: B - hotels - flights - grnd,
             roomNights: roomNights, perNight: perNight, perTicket: perTicket, suggestStars: suggest };
  }

  var api = { parse: parse, budgetPlan: budgetPlan, CITIES: CITIES, norm: norm, prep: prep, addDays: addDays, nightsBetween: nightsBetween, cityByEn: cityByEn };
  root.NuzulParser = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
