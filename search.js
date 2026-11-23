/* نُزُل — فهرس البحث المشترك بين الصفحة الرئيسية وصفحة النتائج.
   يفهم اختلاف الإملاء (ة/ه، ى/ي، الهمزات، المسافات، «ال»)، أسماء الدول، أسماء الفنادق، ويقترح عند الخطأ الإملائي.
   لا يخمّن بصمت: المطابقة التقريبية تظهر كاقتراح «هل تقصد» فقط. */
(function () {
  'use strict';

  // [عربي, English, الدولة, Country] — نفس قائمة الصفحة الرئيسية (الاختبار يتأكد من تطابقهما)
  var RAW = [
    ['دبي','Dubai','الإمارات','UAE'],['أبوظبي','Abu Dhabi','الإمارات','UAE'],
    ['مكة المكرمة','Makkah','السعودية','Saudi Arabia'],['المدينة المنورة','Madinah','السعودية','Saudi Arabia'],
    ['الرياض','Riyadh','السعودية','Saudi Arabia'],['جدة','Jeddah','السعودية','Saudi Arabia'],
    ['الدوحة','Doha','قطر','Qatar'],['مسقط','Muscat','عُمان','Oman'],
    ['المنامة','Manama','البحرين','Bahrain'],['الكويت','Kuwait City','الكويت','Kuwait'],
    ['عمّان','Amman','الأردن','Jordan'],['بيروت','Beirut','لبنان','Lebanon'],
    ['إسطنبول','Istanbul','تركيا','Türkiye'],['طرابزون','Trabzon','تركيا','Türkiye'],
    ['لندن','London','بريطانيا','United Kingdom'],['باريس','Paris','فرنسا','France'],
    ['روما','Rome','إيطاليا','Italy'],['برشلونة','Barcelona','إسبانيا','Spain'],
    ['أمستردام','Amsterdam','هولندا','Netherlands'],['فيينا','Vienna','النمسا','Austria'],
    ['إنترلاكن','Interlaken','سويسرا','Switzerland'],['ميونخ','Munich','ألمانيا','Germany'],
    ['باكو','Baku','أذربيجان','Azerbaijan'],['تبليسي','Tbilisi','جورجيا','Georgia'],
    ['كوالالمبور','Kuala Lumpur','ماليزيا','Malaysia'],['بالي','Bali','إندونيسيا','Indonesia'],
    ['بانكوك','Bangkok','تايلاند','Thailand'],['بوكيت','Phuket','تايلاند','Thailand'],
    ['المالديف','Maldives','المالديف','Maldives'],['طوكيو','Tokyo','اليابان','Japan'],
    ['سنغافورة','Singapore','سنغافورة','Singapore'],['سيول','Seoul','كوريا الجنوبية','South Korea'],
    ['القاهرة','Cairo','مصر','Egypt'],['شرم الشيخ','Sharm El Sheikh','مصر','Egypt'],
    ['مراكش','Marrakech','المغرب','Morocco'],['تونس','Tunis','تونس','Tunisia'],
    ['زنجبار','Zanzibar','تنزانيا','Tanzania'],['كيب تاون','Cape Town','جنوب أفريقيا','South Africa'],
    ['نيويورك','New York','أمريكا','USA'],['لوس أنجلوس','Los Angeles','أمريكا','USA'],
    ['أورلاندو','Orlando','أمريكا','USA'],['تورونتو','Toronto','كندا','Canada'],
    ['كانكون','Cancun','المكسيك','Mexico'],['ريو دي جانيرو','Rio de Janeiro','البرازيل','Brazil'],
    ['سيدني','Sydney','أستراليا','Australia'],['ملبورن','Melbourne','أستراليا','Australia'],
    ['أوكلاند','Auckland','نيوزيلندا','New Zealand'],['فيجي','Fiji','فيجي','Fiji']
  ];

  // أسماء إضافية للمدن (تُضاف لها أسماء صفحة النتائج وقت التشغيل)
  var CITY_ALIAS = {
    'Makkah': ['Mecca','Makka','Makkah Al Mukarramah','مكة','مكه'],
    'Madinah': ['Medina','Madina','Al Madinah','المدينة','المدينه','طيبة'],
    'Istanbul': ['استانبول','اسطمبول','اسطنبول'],
    'Kuala Lumpur': ['KL','كوالا'],
    'New York': ['NYC','New York City','Manhattan','نيو يورك'],
    'Kuwait City': ['Kuwait','مدينة الكويت'],
    'Sharm El Sheikh': ['Sharm','Sharm El-Sheikh','شرم'],
    'Rio de Janeiro': ['Rio','ريو'],
    'Marrakech': ['Marrakesh','مراكيش'],
    'Munich': ['München','Muenchen','ميونيخ'],
    'Vienna': ['Wien','فينا'],
    'Rome': ['Roma'],
    'Cancun': ['Cancún'],
    'Jeddah': ['Jidda','Jeddah City','Jedda'],
    'Riyadh': ['Riyad'],
    'Abu Dhabi': ['AbuDhabi','AUH'],
    'Dubai': ['DXB'],
    'Los Angeles': ['LA','لوس انجلس','لوس انجلوس'],
    'Singapore': ['سنغافوره','سنقافورة'],
    'Tokyo': ['طوكيو','توكيو'],
    'Barcelona': ['برشلونه'],
    'Bangkok': ['بانكوك','بانكوق'],
    'Phuket': ['بوكت','فوكيت'],
    'Trabzon': ['ترابزون','طرابزن'],
    'Tbilisi': ['تبليسى','تفليس'],
    'Cape Town': ['كيبتاون'],
    'Amman': ['عمان الاردن'],
    'Maldives': ['Male','جزر المالديف','مالديف']
  };

  // أسماء إضافية للدول، بالاسم الإنجليزي المستخدم في القائمة
  var COUNTRY_ALIAS = {
    'UAE': ['United Arab Emirates','Emirates','الامارات العربية المتحدة','الامارات العربيه المتحده'],
    'Saudi Arabia': ['Saudi','KSA','Kingdom of Saudi Arabia','المملكة العربية السعودية','المملكة'],
    'Türkiye': ['Turkey','Turkiye'],
    'United Kingdom': ['UK','Britain','Great Britain','England','انجلترا','المملكة المتحدة','انكلترا'],
    'USA': ['US','United States','United States of America','America','الولايات المتحدة','الولايات المتحدة الامريكية'],
    'Thailand': ['تايلند'],
    'Egypt': ['Misr'],
    'Georgia': ['جورجيا'],
    'Indonesia': ['اندونيسيا'],
    'Germany': ['Deutschland','المانيا'],
    'Spain': ['España','اسبانيا'],
    'Italy': ['Italia','ايطاليا'],
    'Netherlands': ['Holland','هولاندا'],
    'Switzerland': ['Swiss','سويسره'],
    'South Korea': ['Korea','كوريا'],
    'South Africa': ['جنوب افريقيا'],
    'New Zealand': ['نيوزلندا','نيوزيلاندا'],
    'Australia': ['استراليا'],
    'Japan': ['Nippon'],
    'Oman': ['سلطنة عمان','عمان'],
    'Azerbaijan': ['اذربيجان'],
    'Brazil': ['Brasil'],
    'Mexico': ['México'],
    'Malaysia': ['ماليزيه']
  };

  var STOP = { 'فندق':1,'فنادق':1,'منتجع':1,'منتجعات':1,'شقق':1,'شقه':1,'في':1,'مدينه':1,'hotel':1,'hotels':1,'resort':1,'resorts':1,'in':1,'the':1,'at':1,'city':1,'and':1,'by':1,'a':1 };

  // توحيد الكتابة: كلمة واحدة
  function normWord(w) {
    w = String(w || '').toLowerCase()
      .replace(/[ً-ٰٟـ]/g, '')            // تشكيل وتطويل
      .replace(/[أإآٱ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي').replace(/ؤ/g, 'و').replace(/ئ/g, 'ي')
      .replace(/[٠-٩]/g, function (d) { return String(d.charCodeAt(0) - 1632); });
    try { w = w.normalize('NFD').replace(/[̀-ͯ]/g, ''); } catch (e) {}
    w = w.replace(/[^a-z0-9ء-ي]/g, '');
    if (w.length > 4 && w.indexOf('ال') === 0) w = w.slice(2);  // «ال» التعريف
    return w;
  }
  function tokens(s) {
    return String(s || '').split(/[\s,،\-–—_\/.()]+/).map(normWord).filter(Boolean);
  }
  function norm(s) { return tokens(s).join(''); }
  function normNoStop(s) { var t = tokens(s).filter(function (x) { return !STOP[x]; }); return t.join(''); }

  // وجهات لها قوائم فنادق في صفحة النتائج وليست في شبكة الصفحة الرئيسية
  var EXTRA = [['صلالة','Salalah','عُمان','Oman'],['باتومي','Batumi','جورجيا','Georgia']];
  var cities = RAW.concat(EXTRA).map(function (r) { return { ar: r[0], en: r[1], cAr: r[2], cEn: r[3], key: r[1].toLowerCase() }; });
  var cityByKey = {}, cityIdx = {}, countryIdx = {}, countries = {};
  function addCityName(name, c) { var n = norm(name); if (n && !cityIdx[n]) cityIdx[n] = c; }
  cities.forEach(function (c) {
    cityByKey[c.key] = c;
    addCityName(c.en, c); addCityName(c.ar, c);
    (CITY_ALIAS[c.en] || []).forEach(function (a) { addCityName(a, c); });
    if (!countries[c.cEn]) countries[c.cEn] = { en: c.cEn, ar: c.cAr, cities: [] };
    countries[c.cEn].cities.push(c);
  });
  Object.keys(countries).forEach(function (k) {
    var co = countries[k];
    [co.en, co.ar].concat(COUNTRY_ALIAS[k] || []).forEach(function (a) { var n = norm(a); if (n && !cityIdx[n] && !countryIdx[n]) countryIdx[n] = co; });
  });

  // فنادق: تُسجَّل من صفحة النتائج
  var hotels = [];
  function addHotels(cityKey, list) {
    var c = cityByKey[cityKey]; if (!c || !list) return;
    list.forEach(function (h) {
      if (!h || !h.n || h.f) return;
      hotels.push({ n: h.n, ar: h.ar || '', city: c, tk: tokens(h.n).concat(tokens(h.ar)).filter(function (x) { return !STOP[x]; }), nn: [norm(h.n), norm(h.ar)] });
    });
  }
  function addAlias(name, cityKey) { var c = cityByKey[cityKey]; if (c) addCityName(name, c); }

  // مسافة التعديل (مع تبديل حرفين متجاورين)
  function dist(a, b, max) {
    if (Math.abs(a.length - b.length) > max) return max + 1;
    var p2 = null, p = [], i, j;
    for (j = 0; j <= b.length; j++) p[j] = j;
    for (i = 1; i <= a.length; i++) {
      var cur = [i], best = i;
      for (j = 1; j <= b.length; j++) {
        var cost = a[i - 1] === b[j - 1] ? 0 : 1;
        var v = Math.min(p[j] + 1, cur[j - 1] + 1, p[j - 1] + cost);
        if (p2 && i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) v = Math.min(v, p2[j - 2] + 1);
        cur[j] = v; if (v < best) best = v;
      }
      if (best > max) return max + 1;
      p2 = p; p = cur;
    }
    return p[b.length];
  }

  function exact(q) {
    var n = norm(q), m = normNoStop(q);
    if (!n) return null;
    var c = cityIdx[n] || (m && cityIdx[m]);
    if (c) return { t: 'city', city: c, en: c.en, ar: c.ar, key: c.key };
    var co = countryIdx[n] || (m && countryIdx[m]);
    if (co) return { t: 'country', en: co.en, ar: co.ar, cities: co.cities };
    return null;
  }

  function hotelMatch(q) {
    if (!hotels.length) return null;
    var n = norm(q), i;
    for (i = 0; i < hotels.length; i++) if (hotels[i].nn[0] === n || (hotels[i].nn[1] && hotels[i].nn[1] === n)) return { t: 'hotel', hotel: hotels[i], city: hotels[i].city };
    var tk = tokens(q).filter(function (x) { return !STOP[x]; }), city = null, rest = [];
    // مدينة مذكورة ضمن البحث (كلمة أو كلمتين متتاليتين)
    for (i = 0; i < tk.length; i++) {
      var two = i + 1 < tk.length ? cityIdx[tk[i] + tk[i + 1]] : null;
      if (two) { city = city || two; i++; continue; }
      if (cityIdx[tk[i]]) { city = city || cityIdx[tk[i]]; continue; }
      rest.push(tk[i]);
    }
    if (!rest.length || rest.join('').length < 3) return null;
    var found = hotels.filter(function (h) {
      if (city && h.city !== city) return false;
      return rest.every(function (r) { return h.tk.some(function (x) { return x === r || (r.length >= 4 && x.indexOf(r) === 0); }); });
    });
    if (!found.length) return null;
    if (found.length === 1) return { t: 'hotel', hotel: found[0], city: found[0].city };
    return { t: 'hotels', list: found.slice(0, 6), city: city, more: found.length > 6 };
  }

  function fuzzy(q, limit) {
    var n = normNoStop(q) || norm(q);
    if (n.length < 4) return [];
    var max = n.length >= 7 ? 2 : 1, out = [], seen = {};
    function scan(idx, kind) {
      Object.keys(idx).forEach(function (k) {
        if (k.length < 4) return;
        var d = dist(n, k, max);
        if (d > max) return;
        var o = idx[k], id = kind + (o.en);
        if (seen[id] !== undefined && seen[id] <= d) return;
        seen[id] = d;
        out = out.filter(function (x) { return x.id !== id; });
        out.push({ id: id, d: d, kind: kind, o: o });
      });
    }
    scan(cityIdx, 'city'); scan(countryIdx, 'country');
    out.sort(function (a, b) { return a.d - b.d; });
    return out.slice(0, limit || 3).map(function (x) {
      return x.kind === 'city' ? { t: 'city', city: x.o, en: x.o.en, ar: x.o.ar, key: x.o.key } : { t: 'country', en: x.o.en, ar: x.o.ar, cities: x.o.cities };
    });
  }

  // النتيجة: city | country | hotel | hotels | fuzzy | null
  function resolve(q) {
    q = String(q || '').slice(0, 80);
    if (norm(q) === 'عمان' && !/[ّ]/.test(q) && !/[ُ]/.test(q)) {   // عمّان (الأردن) أو عُمان (السلطنة)
      var am = cityByKey['amman'], om = countries['Oman'];
      return { t: 'fuzzy', list: [{ t: 'city', city: am, en: am.en, ar: am.ar, key: am.key }, { t: 'country', en: om.en, ar: om.ar, cities: om.cities }] };
    }
    if (/عُمان/.test(q)) { var o2 = countries['Oman']; return { t: 'country', en: o2.en, ar: o2.ar, cities: o2.cities }; }
    var r = exact(q) || hotelMatch(q);
    if (r) return r;
    var f = fuzzy(q, 3);
    return f.length ? { t: 'fuzzy', list: f } : null;
  }

  // اقتراحات أثناء الكتابة (مدن ودول)
  function suggest(q, limit) {
    var n = normNoStop(q) || norm(q); limit = limit || 6;
    if (!n) return [];
    var out = [], seen = {};
    function push(o) { var id = o.t + o.en; if (!seen[id] && out.length < limit) { seen[id] = 1; out.push(o); } }
    function asCity(c) { return { t: 'city', city: c, en: c.en, ar: c.ar, cEn: c.cEn, cAr: c.cAr, key: c.key }; }
    function asCountry(co) { return { t: 'country', en: co.en, ar: co.ar, cities: co.cities }; }
    var ck = Object.keys(cityIdx), ok = Object.keys(countryIdx);
    ck.forEach(function (k) { if (k.indexOf(n) === 0) push(asCity(cityIdx[k])); });
    ok.forEach(function (k) { if (k.indexOf(n) === 0) { push(asCountry(countryIdx[k])); countryIdx[k].cities.forEach(function (c) { push(asCity(c)); }); } });
    if (n.length >= 3) ck.forEach(function (k) { if (k.indexOf(n) > 0) push(asCity(cityIdx[k])); });
    if (!out.length) fuzzy(q, limit).forEach(function (f) { push(f.t === 'city' ? asCity(f.city) : asCountry(f)); });
    return out;
  }

  window.NZ_SEARCH = { resolve: resolve, suggest: suggest, norm: norm, addHotels: addHotels, addAlias: addAlias, cities: cities, RAW: RAW };
})();
