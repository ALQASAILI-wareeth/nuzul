// نُزُل — روابط الشركاء (مصدر واحد للموقع كله)
(function () {
  // Booking.com (CJ) — ضع رقم الشريك بعد الموافقة
  const AID = '';
  // Expedia Group Creator (Hotels.com / Expedia / Vrbo) عبر Partnerize
  const EG = { camref: '1011l6vPKX', creativeref: '1011l66481' };        // Hotels.com
  const EX = { camref: '1101l6yQPk' };                                    // Expedia.com

  // f = {type:'hotel|apartment|resort|villa', stars:3|4|5, budget:'eco|mid|lux', rating8:bool, freeCancel:bool, sort:'best|price|rating', near:bool}
  const BUDGET = { eco: [0, 100], mid: [100, 250], lux: [250, 0] };
  const BK_TYPE = { hotel: 204, apartment: 201, resort: 206, villa: 213 };
  const HC_TYPE = { hotel: 'HOTEL', apartment: 'APARTMENT', villa: 'VILLA' };

  function bookingUrl(place, o = {}, f = {}, lang = 'ar') {
    const p = new URLSearchParams();
    p.set('ss', place);
    if (o.cin) p.set('checkin', o.cin);
    if (o.cout) p.set('checkout', o.cout);
    p.set('group_adults', o.adults || 2);
    p.set('no_rooms', o.rooms || 1);
    p.set('group_children', 0);
    const n = [];
    if (f.filter) n.push(f.filter);
    if (f.type && BK_TYPE[f.type]) n.push('ht_id=' + BK_TYPE[f.type]);
    if (f.stars) for (let s = +f.stars; s <= 5; s++) n.push('class=' + s);
    if (f.rating8) n.push('review_score=80');
    if (f.freeCancel) n.push('fc=2');
    if (f.budget && BUDGET[f.budget]) {
      const [a, b] = BUDGET[f.budget];
      n.push('price=USD-' + a + '-' + (b || 'max') + '-1');
      p.set('selected_currency', 'USD');
    }
    if (n.length) p.set('nflt', n.join(';'));
    if (f.near) p.set('order', 'distance_from_search');
    else if (f.sort === 'price') p.set('order', 'price');
    else if (f.sort === 'rating') p.set('order', 'review_score_and_price');
    const bl = lang === 'ar' ? 'ar' : 'en-gb';
    p.set('lang', bl);
    if (AID) p.set('aid', AID);
    return 'https://www.booking.com/searchresults.' + bl + '.html?' + p.toString();
  }

  function egSearch(host, place, o = {}, f = {}) {
    const p = new URLSearchParams();
    const HC_NAME = { Makkah: 'Mecca', Madinah: 'Medina' };
    p.set('destination', HC_NAME[place] || place);
    if (o.cin) p.set('startDate', o.cin);
    if (o.cout) p.set('endDate', o.cout);
    const rooms = Math.max(1, +o.rooms || 1), adults = Math.max(1, +o.adults || 2);
    const per = [];
    for (let i = 0; i < rooms; i++) per.push(Math.max(1, Math.floor(adults / rooms) + (i < adults % rooms ? 1 : 0)));
    p.set('adults', per.join(','));
    p.set('rooms', rooms);
    if (f.type && HC_TYPE[f.type]) p.append('lodging', HC_TYPE[f.type]);
    if (f.stars) for (let s = +f.stars; s <= 5; s++) p.append('star', s + '0');
    if (f.rating8) p.set('guestRating', '40');
    if (f.freeCancel) p.set('paymentType', 'FREE_CANCELLATION');
    if (f.budget && BUDGET[f.budget]) {
      const [a, b] = BUDGET[f.budget];
      p.append('price', a); p.append('price', b || 1000);
    }
    if (f.near) p.set('sort', 'DISTANCE');
    else if (f.sort === 'price') p.set('sort', 'PRICE_LOW_TO_HIGH');
    else if (f.sort === 'rating') p.set('sort', 'REVIEW');
    return 'https://' + host + '/Hotel-Search?' + p.toString();
  }

  function hotelsUrl(place, o = {}, f = {}, ref = 'site') {
    const a = new URLSearchParams({ landingPage: egSearch('www.hotels.com', place, o, f), camref: EG.camref, creativeref: EG.creativeref, adref: ref });
    return 'https://www.hotels.com/affiliate?' + a.toString();
  }

  function expediaUrl(place, o = {}, f = {}, ref = 'site') {
    const a = new URLSearchParams({ landingPage: egSearch('www.expedia.com', place, o, f), camref: EX.camref, adref: ref });
    return 'https://www.expedia.com/affiliate?' + a.toString();
  }

  window.NUZUL = { AID, EG, EX, bookingUrl, hotelsUrl, expediaUrl };
})();
