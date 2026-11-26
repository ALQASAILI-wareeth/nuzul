// نُزُل — قسم طلبات الشركات والمجموعات
// يحتاج business-parser.js قبله.
(function () {
  'use strict';

  // ===== الإعدادات =====
  var NUZUL_EMAIL = 'info@nuzultravel.com'; // إيميل استقبال طلبات الشركات
  var TP_MARKER = '805832';         // رقم الشريك في Travelpayouts (من روابطك الحالية)
  var LINKS = {
    flightsHome: 'https://aviasales.tpo.lu/qldOmSxJ',
    cars: 'https://localrent.tpo.lu/nxiaq0E0',
    transfers: 'https://gettransfer.tpo.lu/x2gSPYWf'  // GetTransfer (بدل Kiwitaxi اللي ما يفتح في الإمارات)
  };

  var P = window.NuzulParser;
  if (!P) return;

  var TX = {
    ar: {
      nav: 'للشركات',
      h: 'طلبات الشركات والمجموعات',
      sub: 'اكتب طلبك كما تكتبه لموظف الحجوزات: الوجهات، عدد الغرف، التواريخ، تذاكر الطيران، السيارات والميزانية. نرتّبه لك في خطة واحدة مع روابط الحجز.',
      ph: 'مثال: نحتاج 5 غرف في دبي و3 غرف في إسطنبول من 10 إلى 15 ديسمبر، 8 تذاكر طيران من الرياض، سيارتين في إسطنبول، توصيل من المطار، الميزانية 20 ألف دولار، فنادق 4 نجوم',
      go: 'رتّب طلبي', clear: 'مسح', try: 'جرّب مثالاً:',
      ex: [
        'نحتاج 5 غرف في دبي و3 غرف في إسطنبول من 10 إلى 15 ديسمبر، 8 تذاكر طيران من الرياض، سيارتين في إسطنبول، توصيل من المطار، الميزانية 20 ألف دولار، فنادق 4 نجوم',
        '12 موظف: لندن 4 ليالي ثم باريس 3 ليالي ابتداءً من 5 يناير، الطيران من دبي، ميزانية 150 ألف درهم',
        'مؤتمر لعشرين موظف في تركيا من 1/3 إلى 6/3، فندق 5 نجوم، توصيل بالباص، ميزانية خمسين ألف ريال'
      ],
      exL: ['دبي وإسطنبول', 'لندن ثم باريس', 'مؤتمر في تركيا'],
      empty: 'اكتب طلبك أولاً.',
      noDest: 'لم نجد اسم وجهة في الطلب. أضف الوجهات من زر «أضف وجهة» أو اذكر أسماء المدن.',
      understood: 'هذا ما فهمناه من طلبك', assumedTag: 'افتراض، عدّله إذا لزم',
      chip: { dest: 'وجهات', rooms: 'غرفة', nights: 'ليلة', people: 'شخص', tickets: 'تذكرة طيران', cars: 'سيارة', transfers: 'توصيل', budget: 'الميزانية', stars: 'نجوم', from: 'الانطلاق من' },
      notes: {
        country: function (n) { return 'ذكرت «' + n.country + '» فاخترنا ' + n.city.ar + ' كمدينة رئيسية. غيّرها إذا تقصد مدينة ثانية.'; },
        oman: function () { return 'فهمنا «عمان» على أنها سلطنة عُمان (مسقط). إذا تقصد عمّان في الأردن غيّر الوجهة.'; },
        cur: function () { return 'لم تُذكر عملة الميزانية فاعتبرناها بالدولار.'; },
        dates: 'لم تُذكر تواريخ، فوضعنا تواريخ مبدئية. عدّلها في كل وجهة.',
        nights: 'لم يُذكر عدد الليالي، فاعتبرناه 3 ليالٍ.',
        rooms: 'لم يُذكر عدد الغرف بالتفصيل، فاعتبرنا غرفة لكل شخص.',
        tickets: 'اعتبرنا عدد التذاكر يساوي عدد الأشخاص.',
        people: 'لم يُذكر عدد الأشخاص، فاعتبرناه بعدد الغرف.',
        hotels: function (n, d) { return 'طلبت ' + n + ' فنادق على ' + d + ' وجهة. يمكنك إضافة الوجهة نفسها أكثر من مرة لتوزيع الغرف على أكثر من فندق.'; },
        unnamed: function (n) { return 'ذكرت ' + n + ' وجهات بدون أسماء. اختر المدن من القوائم.'; }
      },
      plan: 'خطة الإقامة', city: 'المدينة', pick: '— اختر المدينة —', other: 'مدينة أخرى…', otherPh: 'اكتب اسم المدينة',
      cin: 'الوصول', cout: 'المغادرة', rooms: 'الغرف', adults: 'الأشخاص', stars: 'النجوم', any: 'الكل', type: 'نوع الإقامة',
      types: { '': 'فنادق', apartment: 'شقق فندقية', resort: 'منتجعات', villa: 'فلل' },
      cars: 'سيارات', transfers: 'توصيل', remove: 'حذف', add: '+ أضف وجهة',
      rn: function (r, n) { return cnt(r, 'rooms') + ' × ' + cnt(n, 'nights') + ' = ' + cnt(r * n, 'roomNights'); },
      seeHotels: 'اعرض الفنادق المناسبة', seeCars: 'استأجر السيارات', seeTr: 'احجز التوصيل',
      flights: 'تذاكر الطيران', origin: 'مدينة الانطلاق', tickets: 'عدد التذاكر', oneWay: 'ذهاب فقط',
      leg: 'ابحث عن الرحلة', noIata: 'اختر مدينة الانطلاق والوجهات لعرض رحلات الطيران.',
      group9: 'للمجموعات أكثر من 9 مسافرين، مواقع الحجز تبحث عن 9 مقاعد كحد أقصى في المرة. للحصول على سعر مجموعة أرسل الطلب لفريق نُزُل.',
      budget: 'الميزانية', amount: 'المبلغ', split: 'توزيع مقترح', bHotels: 'الإقامة', bFlights: 'الطيران', bGround: 'السيارات والتوصيل', bReserve: 'احتياطي',
      perNight: function (v, c) { return 'سقف تقريبي لسعر الليلة للغرفة: ' + v + ' ' + c; },
      perTicket: function (v, c) { return 'سقف تقريبي للتذكرة: ' + v + ' ' + c; },
      suggest: function (s) { return 'الميزانية تناسب غالباً فنادق ' + s + ' نجوم.'; },
      warn: function (want, s) { return 'طلبت فنادق ' + want + ' نجوم، والميزانية تناسب غالباً ' + s + ' نجوم. قد تحتاج زيادة الميزانية أو تقليل الليالي.'; },
      bNote: 'التوزيع تقديري لمساعدتك في الاختيار، والأسعار الفعلية تظهر في صفحات الحجز.',
      send: 'أرسل الطلب لفريق نُزُل', sendSub: 'نراجع طلب شركتك ونرسل لك عرض سعر للمجموعة.',
      name: 'الاسم', company: 'الشركة', contact: 'الجوال أو الإيميل', extra: 'ملاحظات إضافية',
      mail: 'إرسال بالإيميل', copy: 'نسخ الطلب', copied: 'تم النسخ ✓',
      noContact: 'انسخ الطلب وأرسله لنا عبر حساباتنا: @nuzul.travel',
      subj: 'طلب حجز شركة — نُزُل',
      sum: {
        title: 'طلب حجز شركة عبر نُزُل', from: 'الانطلاق من', tickets: 'تذاكر الطيران', oneWay: 'ذهاب فقط', rt: 'ذهاب وعودة',
        budget: 'الميزانية', req: 'نص الطلب الأصلي', dest: 'الوجهة', none: 'غير محددة'
      }
    },
    en: {
      nav: 'Business',
      h: 'Business & group requests',
      sub: 'Write your request the way you would to a travel agent: destinations, rooms, dates, flights, cars and budget. We turn it into one plan with booking links.',
      ph: 'e.g. We need 10 rooms in Kuala Lumpur and 6 rooms in Bali for 5 nights each from Jan 12, 10 flight tickets from Jeddah, 2 cars in Bali, budget $25,000',
      go: 'Build my plan', clear: 'Clear', try: 'Try an example:',
      ex: [
        'We need 10 rooms in Kuala Lumpur and 6 rooms in Bali for 5 nights each from Jan 12, 10 flight tickets from Jeddah, 2 cars in Bali, budget $25,000',
        '12 employees: London 4 nights then Paris 3 nights starting Jan 5, flights from Dubai, budget 150k AED',
        'Conference for 20 staff in Istanbul from 1/3 to 6/3, 5 star hotel, airport transfers, budget 50000 SAR'
      ],
      exL: ['KL & Bali', 'London then Paris', 'Istanbul conference'],
      empty: 'Write your request first.',
      noDest: 'We could not find a destination name. Add destinations with “Add destination” or mention the cities.',
      understood: 'Here is what we understood', assumedTag: 'Assumption, edit if needed',
      chip: { dest: 'destinations', rooms: 'rooms', nights: 'nights', people: 'people', tickets: 'flight tickets', cars: 'cars', transfers: 'transfers', budget: 'Budget', stars: 'stars', from: 'From' },
      notes: {
        country: function (n) { return 'You mentioned “' + n.country + '”, so we picked ' + n.city.en + ' as the main city. Change it if you meant another city.'; },
        oman: function () { return 'We read “عمان” as Oman (Muscat). If you meant Amman, Jordan, change the destination.'; },
        cur: function () { return 'No currency was given, so we assumed US dollars.'; },
        dates: 'No dates were given, so we added placeholder dates. Edit them for each destination.',
        nights: 'No number of nights was given, so we assumed 3 nights.',
        rooms: 'Room counts were not detailed, so we assumed one room per person.',
        tickets: 'We assumed one flight ticket per person.',
        people: 'The number of people was not given, so we matched it to the rooms.',
        hotels: function (n, d) { return 'You asked for ' + n + ' hotels across ' + d + ' destinations. Add the same city more than once to split rooms across hotels.'; },
        unnamed: function (n) { return 'You mentioned ' + n + ' destinations without names. Pick the cities from the lists.'; }
      },
      plan: 'Stay plan', city: 'City', pick: '— Choose a city —', other: 'Other city…', otherPh: 'Type the city name',
      cin: 'Check-in', cout: 'Check-out', rooms: 'Rooms', adults: 'Guests', stars: 'Stars', any: 'Any', type: 'Stay type',
      types: { '': 'Hotels', apartment: 'Apartments', resort: 'Resorts', villa: 'Villas' },
      cars: 'Cars', transfers: 'Transfers', remove: 'Remove', add: '+ Add destination',
      rn: function (r, n) { return cnt(r, 'rooms') + ' × ' + cnt(n, 'nights') + ' = ' + cnt(r * n, 'roomNights'); },
      seeHotels: 'See matching hotels', seeCars: 'Rent cars', seeTr: 'Book transfers',
      flights: 'Flights', origin: 'Departing from', tickets: 'Tickets', oneWay: 'One way',
      leg: 'Search this flight', noIata: 'Choose the departure city and destinations to see flights.',
      group9: 'Booking sites search up to 9 seats at a time. For a group fare, send the request to the Nuzul team.',
      budget: 'Budget', amount: 'Amount', split: 'Suggested split', bHotels: 'Stays', bFlights: 'Flights', bGround: 'Cars & transfers', bReserve: 'Reserve',
      perNight: function (v, c) { return 'Rough cap per room per night: ' + v + ' ' + c; },
      perTicket: function (v, c) { return 'Rough cap per ticket: ' + v + ' ' + c; },
      suggest: function (s) { return 'This budget usually fits ' + s + '-star hotels.'; },
      warn: function (want, s) { return 'You asked for ' + want + '-star hotels, but this budget usually fits ' + s + ' stars. Consider raising the budget or cutting nights.'; },
      bNote: 'The split is an estimate to guide your choice; real prices show on the booking pages.',
      send: 'Send the request to the Nuzul team', sendSub: 'We review your company request and send you a group quote.',
      name: 'Name', company: 'Company', contact: 'Phone or email', extra: 'Extra notes',
      mail: 'Send by email', copy: 'Copy request', copied: 'Copied ✓',
      noContact: 'Copy the request and send it to us on our accounts: @nuzul.travel',
      subj: 'Company booking request — Nuzul',
      sum: {
        title: 'Company booking request via Nuzul', from: 'Departing from', tickets: 'Flight tickets', oneWay: 'one way', rt: 'round trip',
        budget: 'Budget', req: 'Original request', dest: 'Destination', none: 'not set'
      }
    }
  };
  var CUR_LIST = ['USD', 'AED', 'SAR', 'QAR', 'KWD', 'BHD', 'OMR', 'JOD', 'EUR', 'GBP', 'EGP'];
  var CUR_AR = { USD: 'دولار', AED: 'درهم', SAR: 'ريال سعودي', QAR: 'ريال قطري', KWD: 'دينار كويتي', BHD: 'دينار بحريني', OMR: 'ريال عماني', JOD: 'دينار أردني', EUR: 'يورو', GBP: 'جنيه إسترليني', EGP: 'جنيه مصري' };

  // صيغ الجمع العربية: [مفرد، مثنى، جمع 3-10]
  var AR_FORMS = {
    rooms: ['غرفة', 'غرفتان', 'غرف'], nights: ['ليلة', 'ليلتان', 'ليالٍ'], people: ['شخص', 'شخصان', 'أشخاص'],
    tickets: ['تذكرة طيران', 'تذكرتا طيران', 'تذاكر طيران'], cars: ['سيارة', 'سيارتان', 'سيارات'], transfers: ['توصيل', 'توصيلان', 'توصيلات'],
    roomNights: ['ليلة فندقية', 'ليلتان فندقيتان', 'ليالٍ فندقية']
  };
  var EN_FORMS = { rooms: ['room', 'rooms'], nights: ['night', 'nights'], people: ['person', 'people'], tickets: ['flight ticket', 'flight tickets'],
    cars: ['car', 'cars'], transfers: ['transfer', 'transfers'], roomNights: ['room-night', 'room-nights'] };
  function cnt(n, key) {
    n = Number(n || 0);
    if (lang() === 'en') return fmtN(n) + ' ' + EN_FORMS[key][n === 1 ? 0 : 1];
    var f = AR_FORMS[key];
    if (n === 1) return f[0];
    if (n === 2) return f[1];
    if (n >= 3 && n <= 10) return fmtN(n) + ' ' + f[2];
    return fmtN(n) + ' ' + f[0];
  }

  function lang() { return document.documentElement.lang === 'en' ? 'en' : 'ar'; }
  function tx() { return TX[lang()]; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function fmtN(n) { return Number(n || 0).toLocaleString(lang() === 'ar' ? 'ar-EG' : 'en-US'); }
  function curName(c) { return lang() === 'ar' ? (CUR_AR[c] || c) : c; }
  function cityName(c) { return c ? (lang() === 'ar' ? c.ar : c.en) : ''; }

  // ---------- الروابط ----------
  function bookingAid() { try { return (typeof AID !== 'undefined' && AID) ? AID : ''; } catch (e) { return ''; } }
  var TYPE_Q = { apartment: 'ht_id=201', resort: 'ht_id=206', villa: 'ht_id=213' };
  function hotelUrl(d) {
    var place = d.city ? d.city.en : (d.other || '');
    var p = new URLSearchParams();
    p.set('ss', place);
    if (d.cin) p.set('checkin', d.cin);
    if (d.cout) p.set('checkout', d.cout);
    p.set('group_adults', d.adults || 1);
    p.set('no_rooms', d.rooms || 1);
    p.set('group_children', 0);
    var f = [];
    if (d.stars) f.push('class=' + d.stars);
    if (d.stayType && TYPE_Q[d.stayType]) f.push(TYPE_Q[d.stayType]);
    if (f.length) p.set('nflt', f.join(';'));
    var bl = lang() === 'ar' ? 'ar' : 'en-gb';
    p.set('lang', bl);
    var aid = bookingAid(); if (aid) p.set('aid', aid);
    return 'https://www.booking.com/searchresults.' + bl + '.html?' + p.toString();
  }
  function flightUrl(from, to, date, pax) {
    if (!TP_MARKER) return LINKS.flightsHome;
    var ddmm = date.slice(8, 10) + date.slice(5, 7);
    return 'https://www.aviasales.com/search/' + from + ddmm + to + Math.min(9, Math.max(1, pax || 1)) +
      '?marker=' + encodeURIComponent(TP_MARKER + '.nuzulbiz');
  }

  // ---------- الحالة ----------
  var R = null, rawText = '';

  // ---------- CSS ----------
  var css = document.createElement('style');
  css.textContent = [
    '#business{scroll-margin-top:70px}',
    '.bz-box{background:var(--card);border:3px solid var(--sand);border-radius:20px;padding:16px;box-shadow:0 10px 30px rgba(15,42,68,.10)}',
    '.bz-box textarea{width:100%;min-height:120px;border:1.5px solid var(--line);border-radius:14px;padding:12px 14px;font:inherit;font-size:16px;line-height:1.7;resize:vertical;color:var(--ink);background:#fff}',
    '.bz-box textarea:focus{outline:none;border-color:var(--navy2)}',
    '.bz-ex{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin:10px 0 2px;font-size:14px;color:var(--muted)}',
    '.bz-ex button{border:1.5px solid var(--line);background:#fff;border-radius:999px;padding:5px 12px;font:inherit;font-size:14px;font-weight:700;color:var(--navy);cursor:pointer}',
    '.bz-ex button:hover{border-color:var(--sand)}',
    '.bz-actions{display:flex;gap:10px;margin-top:12px;flex-wrap:wrap}',
    '.bz-btn{height:48px;padding:0 24px;border-radius:12px;background:var(--navy);color:#fff;font:inherit;font-weight:800;font-size:17px;border:0;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:8px;text-decoration:none}',
    '.bz-btn:hover{background:var(--navy2)}',
    '.bz-btn.ghost{background:#fff;color:var(--navy);border:1.5px solid var(--line)}',
    '.bz-btn.sand{background:var(--sand);color:var(--navy)}',
    '.bz-btn.sm{height:40px;font-size:15px;padding:0 16px;border-radius:10px}',
    '.bz-err{color:#b3261e;margin-top:8px;display:none}',
    '#bzOut{display:none;margin-top:22px}',
    '.bz-card{background:var(--card);border:1.5px solid var(--line);border-radius:var(--radius);padding:18px;margin-bottom:16px}',
    '.bz-card h3{color:var(--navy);font-size:20px;font-weight:800;margin-bottom:10px}',
    '.bz-chips{display:flex;flex-wrap:wrap;gap:8px}',
    '.bz-chip{background:#eef4f9;color:var(--navy);border-radius:999px;padding:6px 14px;font-weight:700;font-size:15px}',
    '.bz-chip b{font-weight:800}',
    '.bz-notes{margin-top:12px;display:grid;gap:6px}',
    '.bz-note{background:#fff7e6;border:1px solid #f3cf86;color:#6b4a00;border-radius:10px;padding:8px 12px;font-size:14px}',
    '.bz-dests{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(300px,100%),1fr));gap:14px;margin-bottom:12px}',
    '.bz-grid>*,.bz-row>*,.bz-f{min-width:0}.bz-f input[type=date]{min-width:0;max-width:100%;padding:0 6px}',
    '.bz-dest{border:1.5px solid var(--line);border-radius:16px;padding:14px;background:#fff;display:flex;flex-direction:column;gap:10px}',
    '.bz-dest .top{display:flex;gap:8px;align-items:center}',
    '.bz-dest .top select,.bz-dest .top input{flex:1}',
    '.bz-x{border:0;background:#f2eee6;color:var(--muted);width:36px;height:36px;border-radius:10px;font-size:18px;cursor:pointer;flex:0 0 auto}',
    '.bz-x:hover{background:#f6d9d6;color:#b3261e}',
    '.bz-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}',
    '.bz-f label{display:block;font-size:12px;font-weight:700;color:var(--muted);margin-bottom:3px}',
    '.bz-f input,.bz-f select,.bz-dest select,.bz-dest input[type=text],.bz-card select,.bz-card input{width:100%;height:42px;border:1.5px solid var(--line);border-radius:10px;padding:0 10px;font:inherit;font-size:15px;background:#fff;color:var(--ink)}',
    '.bz-f input:focus,.bz-f select:focus{outline:none;border-color:var(--navy2)}',
    '.bz-rn{font-size:14px;color:var(--muted)}',
    '.bz-links{display:flex;flex-wrap:wrap;gap:8px}',
    '.bz-legs{display:grid;gap:8px;margin-top:10px}',
    '.bz-leg{display:flex;justify-content:space-between;align-items:center;gap:10px;border:1.5px solid var(--line);border-radius:12px;padding:10px 12px;background:#fff;flex-wrap:wrap}',
    '.bz-leg b{color:var(--navy)}',
    '.bz-leg span{color:var(--muted);font-size:14px}',
    '.bz-row{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:10px;align-items:end}',
    '.bz-check{display:flex;align-items:center;gap:8px;font-weight:700;color:var(--navy);height:42px}',
    '.bz-check input{width:20px;height:20px}',
    '.bz-bars{display:grid;gap:8px;margin:12px 0}',
    '.bz-bar{display:grid;grid-template-columns:130px 1fr auto;gap:10px;align-items:center;font-size:15px}',
    '.bz-bar .t{height:12px;background:#eef1f4;border-radius:99px;overflow:hidden}',
    '.bz-bar .t i{display:block;height:100%;background:var(--sand);border-radius:99px}',
    '.bz-bar b{color:var(--navy);white-space:nowrap}',
    '.bz-tip{color:var(--navy);font-weight:700;margin-top:4px}',
    '.bz-small{font-size:13px;color:var(--muted);margin-top:8px}',
    '.bz-warn{background:#fdecea;border:1px solid #f5c2bd;color:#8c1d18;border-radius:10px;padding:8px 12px;font-size:14px;margin-top:8px}',
    '.bz-send{background:var(--navy);color:#fff;border:0}',
    '.bz-send h3{color:#fff}.bz-send p{opacity:.85;margin-bottom:12px}',
    '.bz-send label{color:#c9d3dd}',
    '.bz-send textarea{width:100%;min-height:70px;border-radius:10px;border:1.5px solid var(--line);padding:8px 10px;font:inherit;font-size:15px}',
    '@media(max-width:520px){.bz-dests{grid-template-columns:1fr}.bz-bar{grid-template-columns:100px 1fr auto}}'
  ].join('\n');
  document.head.appendChild(css);

  // ---------- الهيكل ----------
  var sec = document.createElement('section');
  sec.id = 'business';
  sec.innerHTML =
    '<div class="wrap">' +
    '<h2 id="bzH"></h2><p class="sub" id="bzSub"></p>' +
    '<div class="bz-box">' +
    '<textarea id="bzText"></textarea>' +
    '<div class="bz-ex" id="bzEx"></div>' +
    '<div class="bz-actions"><button class="bz-btn" id="bzGo" type="button"></button><button class="bz-btn ghost" id="bzClear" type="button"></button></div>' +
    '<div class="bz-err" id="bzErr"></div>' +
    '</div>' +
    '<div id="bzOut"></div>' +
    '</div>';
  var anchor = document.getElementById('how') || document.getElementById('destinations');
  anchor.parentNode.insertBefore(sec, anchor);

  var nav = document.querySelector('header nav');
  var navA = document.createElement('a');
  navA.href = '#business';
  if (nav) nav.insertBefore(navA, nav.firstChild);

  function $(id) { return document.getElementById(id); }

  function renderStatic() {
    var T = tx();
    navA.textContent = T.nav;
    $('bzH').textContent = T.h;
    $('bzSub').textContent = T.sub;
    $('bzText').placeholder = T.ph;
    $('bzGo').textContent = T.go;
    $('bzClear').textContent = T.clear;
    var ex = $('bzEx');
    ex.innerHTML = '<span>' + esc(T.try) + '</span>';
    T.ex.forEach(function (e, i) {
      var b = document.createElement('button');
      b.type = 'button'; b.textContent = T.exL[i];
      b.onclick = function () { $('bzText').value = e; run(); };
      ex.appendChild(b);
    });
  }

  // ---------- التحليل ----------
  function run() {
    var T = tx();
    rawText = $('bzText').value.trim();
    $('bzErr').style.display = 'none';
    if (!rawText) { $('bzErr').textContent = T.empty; $('bzErr').style.display = 'block'; return; }
    R = P.parse(rawText);
    R.destinations.forEach(function (d) { d.other = ''; });
    if (!R.destinations.length) {
      R.destinations.push(blankDest());
      R.noDest = true;
    }
    if (!R.budget) R.budgetEdit = { amount: '', cur: 'USD' }; else R.budgetEdit = { amount: R.budget.amount, cur: R.budget.cur };
    renderOut();
    $('bzOut').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function blankDest() {
    var base = R && R.destinations[R.destinations.length - 1];
    var cin = base && base.cout ? base.cout : P.addDays(new Date().toISOString().slice(0, 10), 14);
    return { city: null, other: '', rooms: (R && R.people) || 1, adults: (R && R.people) || 1, nights: 3, cin: cin, cout: P.addDays(cin, 3), stars: R ? R.stars : null, stayType: null, cars: 0, transfers: 0 };
  }

  // ---------- الإخراج ----------
  function renderOut() {
    var T = tx();
    var out = $('bzOut');
    out.style.display = 'block';
    out.innerHTML =
      '<div class="bz-card" id="bzUnd"></div>' +
      '<div class="bz-card"><h3>' + esc(T.plan) + '</h3><div class="bz-dests" id="bzDests"></div>' +
      '<button class="bz-btn ghost sm" id="bzAdd" type="button">' + esc(T.add) + '</button></div>' +
      '<div class="bz-card" id="bzFl"></div>' +
      '<div class="bz-card" id="bzBud"></div>' +
      '<div class="bz-card bz-send" id="bzSend"></div>';
    renderDests();
    renderFlightsForm();
    renderBudgetForm();
    renderSend();
    $('bzAdd').onclick = function () { R.destinations.push(blankDest()); renderDests(); refresh(); };
    refresh();
  }

  function cityOptions(sel) {
    var T = tx();
    var list = P.CITIES.slice().sort(function (a, b) { return cityName(a).localeCompare(cityName(b), lang()); });
    var h = '<option value="">' + esc(T.pick) + '</option>';
    list.forEach(function (c) {
      h += '<option value="' + esc(c.en) + '"' + (sel && sel.en === c.en ? ' selected' : '') + '>' + esc(cityName(c)) + ' — ' + esc(lang() === 'ar' ? c.cAr : c.cEn) + '</option>';
    });
    h += '<option value="__other">' + esc(T.other) + '</option>';
    return h;
  }

  function renderDests() {
    var T = tx();
    var box = $('bzDests');
    box.innerHTML = '';
    R.destinations.forEach(function (d, i) {
      var el = document.createElement('div');
      el.className = 'bz-dest';
      el.dataset.i = i;
      var starsOpt = ['', '3', '4', '5'].map(function (s) { return '<option value="' + s + '"' + (String(d.stars || '') === s ? ' selected' : '') + '>' + (s ? s + ' ★' : esc(T.any)) + '</option>'; }).join('');
      var typeOpt = ['', 'apartment', 'resort', 'villa'].map(function (s) { return '<option value="' + s + '"' + ((d.stayType || '') === s ? ' selected' : '') + '>' + esc(T.types[s]) + '</option>'; }).join('');
      var isOther = !d.city && d.other;
      el.innerHTML =
        '<div class="top"><select data-k="city" aria-label="' + esc(T.city) + '">' + cityOptions(d.city) + '</select>' +
        '<button class="bz-x" type="button" data-k="del" title="' + esc(T.remove) + '">×</button></div>' +
        '<input type="text" data-k="other" placeholder="' + esc(T.otherPh) + '" value="' + esc(d.other) + '" style="display:' + (isOther ? 'block' : 'none') + '">' +
        '<div class="bz-grid">' +
        fld(T.cin, '<input type="date" data-k="cin" value="' + esc(d.cin) + '">') +
        fld(T.cout, '<input type="date" data-k="cout" value="' + esc(d.cout) + '">') +
        fld(T.rooms, '<input type="number" min="1" max="500" data-k="rooms" value="' + esc(d.rooms) + '">') +
        fld(T.adults, '<input type="number" min="1" max="1000" data-k="adults" value="' + esc(d.adults) + '">') +
        fld(T.stars, '<select data-k="stars">' + starsOpt + '</select>') +
        fld(T.type, '<select data-k="stayType">' + typeOpt + '</select>') +
        fld(T.cars, '<input type="number" min="0" max="100" data-k="cars" value="' + esc(d.cars || 0) + '">') +
        fld(T.transfers, '<input type="number" min="0" max="100" data-k="transfers" value="' + esc(d.transfers || 0) + '">') +
        '</div>' +
        '<div class="bz-rn" data-o="rn"></div>' +
        '<div class="bz-links" data-o="links"></div>';
      if (isOther) el.querySelector('select[data-k=city]').value = '__other';
      box.appendChild(el);
    });
    box.oninput = box.onchange = function (e) {
      var card = e.target.closest('.bz-dest'); if (!card) return;
      var d = R.destinations[+card.dataset.i], k = e.target.dataset.k, v = e.target.value;
      if (k === 'city') {
        var other = card.querySelector('[data-k=other]');
        if (v === '__other') { d.city = null; other.style.display = 'block'; other.focus(); }
        else { d.city = v ? P.cityByEn(v) : null; d.other = ''; other.style.display = 'none'; }
      } else if (k === 'other') d.other = v.trim();
      else if (k === 'cin') { d.cin = v; if (d.cout && d.cout <= v) { d.cout = P.addDays(v, Math.max(1, d.nights || 1)); card.querySelector('[data-k=cout]').value = d.cout; } }
      else if (k === 'cout') d.cout = v;
      else if (k === 'stars') d.stars = v ? +v : null;
      else if (k === 'stayType') d.stayType = v || null;
      else if (k) d[k] = Math.max(0, parseInt(v, 10) || 0);
      if (d.cin && d.cout) d.nights = Math.max(0, P.nightsBetween(d.cin, d.cout));
      refresh();
    };
    box.onclick = function (e) {
      if (e.target.dataset.k !== 'del') return;
      var card = e.target.closest('.bz-dest');
      R.destinations.splice(+card.dataset.i, 1);
      renderDests(); refresh();
    };
  }
  function fld(label, input) { return '<div class="bz-f"><label>' + esc(label) + '</label>' + input + '</div>'; }

  function renderFlightsForm() {
    var T = tx();
    var c = $('bzFl');
    c.innerHTML = '<h3>✈️ ' + esc(T.flights) + '</h3>' +
      '<div class="bz-row">' +
      fld(T.origin, '<select id="bzOrigin">' + cityOptions(R.origin).replace(/<option value="__other">.*?<\/option>/, '') + '</select>') +
      fld(T.tickets, '<input type="number" id="bzTickets" min="0" max="500" value="' + esc(R.tickets || 0) + '">') +
      '<label class="bz-check"><input type="checkbox" id="bzOneWay"' + (R.oneWay ? ' checked' : '') + '> ' + esc(T.oneWay) + '</label>' +
      '</div><div class="bz-legs" id="bzLegs"></div><div id="bzG9"></div>';
    $('bzOrigin').onchange = function () { R.origin = this.value ? P.cityByEn(this.value) : null; refresh(); };
    $('bzTickets').oninput = function () { R.tickets = Math.max(0, parseInt(this.value, 10) || 0); refresh(); };
    $('bzOneWay').onchange = function () { R.oneWay = this.checked; refresh(); };
  }

  function renderBudgetForm() {
    var T = tx();
    var c = $('bzBud');
    var curOpt = CUR_LIST.map(function (k) { return '<option value="' + k + '"' + (R.budgetEdit.cur === k ? ' selected' : '') + '>' + esc(curName(k)) + '</option>'; }).join('');
    c.innerHTML = '<h3>💰 ' + esc(T.budget) + '</h3><div class="bz-row">' +
      fld(T.amount, '<input type="number" id="bzAmt" min="0" step="100" value="' + esc(R.budgetEdit.amount) + '">') +
      fld('', '<select id="bzCur">' + curOpt + '</select>') +
      '</div><div id="bzBudOut"></div>';
    $('bzAmt').oninput = function () { R.budgetEdit.amount = this.value; refresh(); };
    $('bzCur').onchange = function () { R.budgetEdit.cur = this.value; refresh(); };
  }

  function renderSend() {
    var T = tx();
    var c = $('bzSend');
    var canMail = !!NUZUL_EMAIL;
    c.innerHTML = '<h3>' + esc(T.send) + '</h3><p>' + esc(T.sendSub) + '</p>' +
      '<div class="bz-row">' +
      fld(T.name, '<input type="text" id="bzName">') +
      fld(T.company, '<input type="text" id="bzCo">') +
      fld(T.contact, '<input type="text" id="bzContact">') +
      '</div><div class="bz-f" style="margin-top:8px"><label>' + esc(T.extra) + '</label><textarea id="bzExtra"></textarea></div>' +
      '<div class="bz-actions">' +
      (canMail ? '<a class="bz-btn sand" id="bzMail">' + esc(T.mail) + '</a>' : '') +
      '<button class="bz-btn ghost" type="button" id="bzCopy">' + esc(T.copy) + '</button>' +
      '</div>' + (!canMail ? '<p class="bz-small" style="color:#c9d3dd">' + esc(T.noContact) + '</p>' : '');
    ['bzName', 'bzCo', 'bzContact', 'bzExtra'].forEach(function (id) { $(id).oninput = refreshSend; });
    $('bzCopy').onclick = function () {
      var txt = summary(), b = this;
      function done() { b.textContent = tx().copied; setTimeout(function () { b.textContent = tx().copy; }, 1800); }
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(txt).then(done, function () { fallbackCopy(txt); done(); });
      else { fallbackCopy(txt); done(); }
    };
  }
  function fallbackCopy(t) {
    var ta = document.createElement('textarea'); ta.value = t; document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); } catch (e) {}
    ta.remove();
  }

  // ---------- تحديث القيم المحسوبة ----------
  function legs() {
    var ds = R.destinations.filter(function (d) { return d.city && d.cin; })
      .slice().sort(function (a, b) { return a.cin < b.cin ? -1 : a.cin > b.cin ? 1 : 0; });
    if (!R.origin || !ds.length) return [];
    var total = R.tickets || R.people || 1;
    var parallel = ds.some(function (d, i) { return i > 0 && ds[i - 1].cout && d.cin < ds[i - 1].cout; });
    var L = [];
    if (parallel) {   // فرق في وجهات مختلفة بنفس الفترة: ذهاب وعودة لكل وجهة
      ds.forEach(function (d) {
        var pax = Math.min(total, d.adults || total);
        if (R.origin.iata === d.city.iata) return;
        L.push({ from: R.origin, to: d.city, date: d.cin, pax: pax });
        if (!R.oneWay && d.cout) L.push({ from: d.city, to: R.origin, date: d.cout, pax: pax });
      });
      return L;
    }
    var prev = R.origin;   // رحلة متتالية بين الوجهات
    ds.forEach(function (d) {
      if (prev.iata !== d.city.iata) L.push({ from: prev, to: d.city, date: d.cin, pax: total });
      prev = d.city;
    });
    var last = ds[ds.length - 1];
    if (!R.oneWay && last.cout && prev.iata !== R.origin.iata) L.push({ from: prev, to: R.origin, date: last.cout, pax: total });
    return L;
  }

  function refresh() {
    var T = tx();
    // بطاقات الوجهات
    document.querySelectorAll('#bzDests .bz-dest').forEach(function (card) {
      var d = R.destinations[+card.dataset.i];
      var n = d.cin && d.cout ? Math.max(0, P.nightsBetween(d.cin, d.cout)) : 0;
      card.querySelector('[data-o=rn]').textContent = (d.city || d.other) ? T.rn(d.rooms || 0, n) : '';
      var links = '';
      if (d.city || d.other) {
        links += '<a class="bz-btn sm" target="_blank" rel="noopener sponsored" href="' + esc(hotelUrl(d)) + '">🏨 ' + esc(T.seeHotels) + '</a>';
        if (d.cars) links += '<a class="bz-btn sm ghost" target="_blank" rel="noopener sponsored" href="' + esc(LINKS.cars) + '">🚗 ' + esc(T.seeCars) + ' (' + fmtN(d.cars) + ')</a>';
        if (d.transfers && LINKS.transfers) links += '<a class="bz-btn sm ghost" target="_blank" rel="noopener sponsored" href="' + esc(LINKS.transfers) + '">🚕 ' + esc(T.seeTr) + '</a>';
      }
      card.querySelector('[data-o=links]').innerHTML = links;
    });

    // ملخص الفهم
    var named = R.destinations.filter(function (d) { return d.city || d.other; });
    var rooms = R.destinations.reduce(function (a, d) { return a + (d.rooms || 0); }, 0);
    var nights = R.destinations.reduce(function (a, d) { return a + (d.cin && d.cout ? Math.max(0, P.nightsBetween(d.cin, d.cout)) : 0); }, 0);
    var cars = R.destinations.reduce(function (a, d) { return a + (d.cars || 0); }, 0);
    var trs = R.destinations.reduce(function (a, d) { return a + (d.transfers || 0); }, 0);
    var chips = [];
    function chip(n, key) { chips.push('<span class="bz-chip">' + esc(cnt(n, key)) + '</span>'); }
    if (named.length) chips.push('<span class="bz-chip">📍 ' + esc(named.map(function (d) { return d.city ? cityName(d.city) : d.other; }).join(' · ')) + '</span>');
    var roomNights = R.destinations.reduce(function (a, d) { return a + (d.rooms || 0) * (d.cin && d.cout ? Math.max(0, P.nightsBetween(d.cin, d.cout)) : 0); }, 0);
    if (rooms) chip(rooms, 'rooms');
    if (roomNights) chip(roomNights, 'roomNights');
    if (R.people) chip(R.people, 'people');
    if (R.tickets) chip(R.tickets, 'tickets');
    if (R.origin) chips.push('<span class="bz-chip">' + esc(T.chip.from) + ' <b>' + esc(cityName(R.origin)) + '</b></span>');
    if (cars) chip(cars, 'cars');
    if (trs) chip(trs, 'transfers');
    var bAmt = parseFloat(R.budgetEdit.amount);
    if (bAmt) chips.push('<span class="bz-chip">' + esc(T.chip.budget) + ' <b>' + fmtN(bAmt) + '</b> ' + esc(curName(R.budgetEdit.cur)) + '</span>');
    var starsSet = R.destinations.map(function (d) { return d.stars; }).filter(Boolean);
    if (starsSet.length) chips.push('<span class="bz-chip">' + starsSet[0] + ' ★</span>');

    var notes = [];
    if (R.noDest) notes.push(T.noDest);
    R.notes.forEach(function (n) { if (T.notes[n.k]) notes.push(T.notes[n.k](n)); });
    ['dates', 'nights', 'rooms', 'people', 'tickets'].forEach(function (k) { if (R.assumed[k]) notes.push(T.notes[k]); });
    var unnamed = R.destinations.filter(function (d) { return !d.city && !d.other; }).length;
    if (unnamed && !R.noDest) notes.push(T.notes.unnamed(unnamed));
    if (R.hotels && R.hotels > R.destinations.length) notes.push(T.notes.hotels(R.hotels, R.destinations.length));
    $('bzUnd').innerHTML = '<h3>✅ ' + esc(T.understood) + '</h3><div class="bz-chips">' + chips.join('') + '</div>' +
      (notes.length ? '<div class="bz-notes">' + notes.map(function (n) { return '<div class="bz-note">⚠️ ' + esc(n) + '</div>'; }).join('') + '</div>' : '');

    // الطيران
    var showFl = R.flightsWanted || R.origin || R.tickets;
    $('bzFl').style.display = showFl ? 'block' : 'none';
    if (showFl) {
      var L = legs(), pax = Math.max.apply(null, [1].concat(L.map(function (l) { return l.pax; })));
      $('bzLegs').innerHTML = L.length ? L.map(function (l) {
        return '<div class="bz-leg"><div><b>' + esc(cityName(l.from)) + ' ← ' + esc(cityName(l.to)) + '</b><br><span>' + esc(l.date) + ' · ' + fmtN(pax) + ' ' + esc(T.chip.tickets) + '</span></div>' +
          '<a class="bz-btn sm" target="_blank" rel="noopener sponsored" href="' + esc(flightUrl(l.from.iata, l.to.iata, l.date, l.pax)) + '">' + esc(T.leg) + '</a></div>';
      }).join('').replace(/ ← /g, lang() === 'ar' ? ' ← ' : ' → ') : '<p class="bz-small">' + esc(T.noIata) + '</p>';
      $('bzG9').innerHTML = pax > 9 && L.length ? '<div class="bz-note" style="margin-top:10px">👥 ' + esc(T.group9) + '</div>' : '';
    }

    // الميزانية
    var budgetR = {
      budget: bAmt ? { amount: bAmt, cur: R.budgetEdit.cur } : null,
      destinations: R.destinations.map(function (d) { return { city: d.city || (d.other ? {} : null), rooms: d.rooms || 0, nights: d.cin && d.cout ? Math.max(0, P.nightsBetween(d.cin, d.cout)) : 0, cars: d.cars, transfers: d.transfers }; }),
      flightsWanted: !!showFl, tickets: R.tickets
    };
    var bp = P.budgetPlan(budgetR);
    var bo = $('bzBudOut');
    if (!bp) bo.innerHTML = '';
    else {
      var cur = curName(bp.cur);
      var rows = [[T.bHotels, bp.hotels], [T.bFlights, bp.flights], [T.bGround, bp.ground], [T.bReserve, bp.reserve]].filter(function (r) { return r[1] > 0; });
      var h = '<div class="bz-small" style="margin-top:12px">' + esc(T.split) + '</div><div class="bz-bars">' + rows.map(function (r) {
        return '<div class="bz-bar"><span>' + esc(r[0]) + '</span><div class="t"><i style="width:' + Math.round(r[1] / bp.total * 100) + '%"></i></div><b>' + fmtN(r[1]) + ' ' + esc(cur) + '</b></div>';
      }).join('') + '</div>';
      if (bp.perNight) h += '<div class="bz-tip">🏨 ' + esc(T.perNight(fmtN(bp.perNight), cur)) + '</div>';
      if (bp.perTicket) h += '<div class="bz-tip">✈️ ' + esc(T.perTicket(fmtN(bp.perTicket), cur)) + '</div>';
      if (bp.suggestStars) {
        var wanted = starsSet.length ? Math.max.apply(null, starsSet) : null;
        if (wanted && wanted > bp.suggestStars) h += '<div class="bz-warn">' + esc(T.warn(wanted, bp.suggestStars)) + '</div>';
        else h += '<div class="bz-tip">⭐ ' + esc(T.suggest(bp.suggestStars)) + '</div>';
      }
      h += '<div class="bz-small">' + esc(T.bNote) + '</div>';
      bo.innerHTML = h;
    }
    refreshSend();
  }

  function summary() {
    var T = tx(), S = T.sum, ar = lang() === 'ar';
    var lines = [S.title, ''];
    var nm = $('bzName') && $('bzName').value.trim(), co = $('bzCo') && $('bzCo').value.trim(), ct = $('bzContact') && $('bzContact').value.trim();
    if (nm) lines.push(T.name + ': ' + nm);
    if (co) lines.push(T.company + ': ' + co);
    if (ct) lines.push(T.contact + ': ' + ct);
    if (nm || co || ct) lines.push('');
    R.destinations.forEach(function (d, i) {
      var name = d.city ? (ar ? d.city.ar : d.city.en) : (d.other || S.none);
      var n = d.cin && d.cout ? Math.max(0, P.nightsBetween(d.cin, d.cout)) : 0;
      var parts = [cnt(d.rooms, 'rooms'), cnt(d.adults, 'people'), cnt(n, 'nights')];
      if (d.stars) parts.push(d.stars + ' ★');
      if (d.stayType) parts.push(T.types[d.stayType]);
      if (d.cars) parts.push(cnt(d.cars, 'cars'));
      if (d.transfers) parts.push(cnt(d.transfers, 'transfers'));
      lines.push((i + 1) + '. ' + name + ' (' + (d.cin || '?') + ' → ' + (d.cout || '?') + '): ' + parts.join('، '.replace('،', ar ? '،' : ',')));
    });
    if (R.tickets || R.origin) {
      lines.push('');
      lines.push(S.tickets + ': ' + (R.tickets || '?') + (R.origin ? ' — ' + S.from + ' ' + (ar ? R.origin.ar : R.origin.en) : '') + ' (' + (R.oneWay ? S.oneWay : S.rt) + ')');
    }
    var bAmt = parseFloat(R.budgetEdit.amount);
    if (bAmt) lines.push(S.budget + ': ' + bAmt + ' ' + curName(R.budgetEdit.cur));
    var ex = $('bzExtra') && $('bzExtra').value.trim();
    if (ex) { lines.push(''); lines.push(T.extra + ': ' + ex); }
    lines.push(''); lines.push(S.req + ':'); lines.push(rawText);
    return lines.join('\n');
  }

  function refreshSend() {
    var txt = summary();
    var ml = $('bzMail'); if (ml) ml.href = 'mailto:' + NUZUL_EMAIL + '?subject=' + encodeURIComponent(tx().subj) + '&body=' + encodeURIComponent(txt);
  }

  // ---------- تشغيل ----------
  $('bzGo').onclick = run;
  $('bzClear').onclick = function () { $('bzText').value = ''; $('bzOut').style.display = 'none'; $('bzOut').innerHTML = ''; R = null; $('bzText').focus(); };
  $('bzText').addEventListener('keydown', function (e) { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) run(); });
  renderStatic();
  new MutationObserver(function () { renderStatic(); if (R) renderOut(); }).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
})();
