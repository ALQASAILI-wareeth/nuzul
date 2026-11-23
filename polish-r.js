/* صفحة النتائج: تحسينات شكلية إضافية فقط */
(function () {
  'use strict';
  var D = document;
  function lower() {
    var c = D.querySelector('main .chn'), hs = D.getElementById('hs'), h = D.getElementById('cardsH'), cards = D.getElementById('cards');
    if (!c || !h || !cards) return;
    c.classList.add('nz-low');
    var noList = !hs || hs.hidden;
    var anchor = noList ? cards.nextSibling : h;
    if (c.nextSibling !== anchor) h.parentNode.insertBefore(c, anchor);
  }
  (function () {
    var hs = D.getElementById('hs');
    if (hs && 'MutationObserver' in window) new MutationObserver(function () { try { lower(); } catch (e) {} }).observe(hs, { attributes: true, attributeFilter: ['hidden'] });
  })();
  var io = ('IntersectionObserver' in window) ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('nz-in'); io.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -6% 0px' }) : null;
  function reveal() {
    if (!io) return;
    var n = D.querySelectorAll('.hc:not(.nz-rv),.pc:not(.nz-rv)');
    for (var i = 0; i < n.length; i++) {
      var r = n[i].getBoundingClientRect();
      if (r.top < window.innerHeight) continue;
      n[i].classList.add('nz-rv'); io.observe(n[i]);
    }
  }
  function run() { try { lower(); reveal(); } catch (e) {} }
  if (D.readyState === 'loading') D.addEventListener('DOMContentLoaded', run); else run();
  ['hl', 'cards'].forEach(function (id) {
    var el = D.getElementById(id);
    if (el && 'MutationObserver' in window) new MutationObserver(reveal).observe(el, { childList: true });
  });

  // ---------- رموز موحّدة بدل الإيموجي ----------
  var P = {
    pin: '<path d="M12 21s7-6.2 7-11.500a7 7 0 10-14 0C5 14.800 12 21 12 21z"/><circle cx="12" cy="9.500" r="2.500"/>',
    spark: '<path d="M12 3l1.800 5.200L19 10l-5.200 1.800L12 17l-1.800-5.200L5 10l5.200-1.800L12 3z"/><path d="M19 16v4M17 18h4"/>',
    filter: '<path d="M4 7h10M18 7h2M4 17h2M10 17h10"/><circle cx="16" cy="7" r="2"/><circle cx="8" cy="17" r="2"/>',
    city: '<path d="M4 21V9l6-3v15M10 21V4l10 4v13M2 21h20"/><path d="M14 11h2M14 15h2M6.500 12h1M6.500 16h1"/>',
    bulb: '<path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 00-3.500 10.900c.6.500 1 1.200 1 2.100h5c0-.900.400-1.600 1-2.100A6 6 0 0012 3z"/>',
    cal: '<rect x="4" y="5" width="16" height="15" rx="2.500"/><path d="M4 10h16M8.500 3v4M15.500 3v4"/>',
    users: '<circle cx="9" cy="8.500" r="3.200"/><path d="M3 20c0-3.300 2.700-5.500 6-5.500s6 2.200 6 5.500"/><path d="M16 5.600a3.200 3.200 0 010 5.800M17.500 14.800c2 .600 3.500 2.400 3.500 5.200"/>',
    bed: '<path d="M3 19v-7a2 2 0 012-2h14a2 2 0 012 2v7M3 16h18M6 10V7a1 1 0 011-1h10a1 1 0 011 1v3"/>',
    pen: '<path d="M4 20l1-4L16.500 4.500a2.100 2.100 0 013 3L8 19l-4 1z"/><path d="M14.500 6.500l3 3"/>',
    cam: '<path d="M4 8.500A1.500 1.500 0 015.500 7H8l1.500-2h5L16 7h2.500A1.500 1.500 0 0120 8.500v9a1.500 1.500 0 01-1.500 1.500h-13A1.500 1.500 0 014 17.500v-9z"/><circle cx="12" cy="13" r="3.200"/>',
    chat: '<path d="M4 6a2 2 0 012-2h12a2 2 0 012 2v8a2 2 0 01-2 2h-7l-4.500 3.500V16H6a2 2 0 01-2-2V6z"/>',
    phone: '<rect x="7" y="3" width="10" height="18" rx="2.200"/><path d="M11 17.500h2"/>',
    bell: '<path d="M6 16V11a6 6 0 0112 0v5l1.500 2h-15L6 16z"/><path d="M10 20a2 2 0 004 0"/>',
    tag: '<path d="M3.500 12.500V5a1.500 1.500 0 011.500-1.500h7.500L21 12l-8.500 8.500-9-8z"/><circle cx="8" cy="8" r="1.300"/>',
    hotel: '<path d="M5 21V5a2 2 0 012-2h10a2 2 0 012 2v16M3 21h18"/><path d="M9 7h1.500M13.500 7H15M9 11h1.500M13.500 11H15M10.500 21v-4h3v4"/>',
    apt: '<rect x="4" y="4" width="16" height="17" rx="2"/><path d="M4 10h16M4 15h16M10 4v17"/>',
    home: '<path d="M4 11l8-7 8 7v9a1 1 0 01-1 1h-4.500v-6h-5v6H5a1 1 0 01-1-1v-9z"/>',
    gem: '<path d="M6 4h12l3.500 5L12 21 2.500 9 6 4z"/><path d="M2.500 9h19M9 4l-2 5 5 12 5-12-2-5"/>',
    star: '<path d="M12 3.500l2.600 5.400 5.900.800-4.300 4.100 1.100 5.800L12 16.800 6.700 19.600l1.100-5.800L3.500 9.700l5.900-.800L12 3.500z"/>',
    walk: '<circle cx="13" cy="4.500" r="1.800"/><path d="M9 21l2.500-6-2-2.500 1.500-5 3 2.500 3 1M11 7.500L8 9.500v3M13.500 15l2.500 6"/>',
    mosque: '<path d="M5 21v-7a7 7 0 0114 0v7M3 21h18M12 4v3"/><path d="M10 21v-3a2 2 0 014 0v3"/>',
    palm: '<path d="M12 21c0-5 .500-8 2-11"/><path d="M14 10c-3-3-7-2.500-9 0 3-1 6-.600 9 0zM14 10c1-4 5-5 7-3-3 0-5 1-7 3zM14 10c3 0 5.500 2 6 5-2-2.500-4-3.500-6-5z"/><path d="M5 21h14"/>',
    down: '<path d="M12 4v15M6 13l6 6 6-6"/>',
    plane: '<path d="M21 3l-7.500 18-3-8-8-3L21 3z"/><path d="M10.500 13L21 3"/>',
    check: '<path d="M5 12.500l4.500 4.500L19 7.500" stroke-width="3"/>'
  };
  var E = { '📍': 'pin', '✨': 'spark', '🎯': 'filter', '🏙': 'city', '💡': 'bulb', '📅': 'cal', '👥': 'users', '🛏': 'bed', '✏': 'pen', '📷': 'cam', '💬': 'chat', '📱': 'phone', '🔔': 'bell', '💲': 'tag', '🏨': 'hotel', '🏢': 'apt', '🏡': 'home', '💎': 'gem', '⭐': 'star', '🚶': 'walk', '🕌': 'mosque', '🏝': 'palm', '👇': 'down', '✈': 'plane', '✔': 'check' };
  var RX = new RegExp('(' + Object.keys(E).join('|') + ')\\uFE0F?', 'u');
  var NS = 'http://www.w3.org/2000/svg';
  function icon(n) {
    var s = D.createElementNS(NS, 'svg');
    s.setAttribute('class', n === 'check' ? 'nze nze-ck' : 'nze'); s.setAttribute('viewBox', '0 0 24 24'); s.setAttribute('fill', 'none');
    s.setAttribute('stroke', 'currentColor'); s.setAttribute('stroke-width', '1.8'); s.setAttribute('stroke-linecap', 'round');
    s.setAttribute('stroke-linejoin', 'round'); s.setAttribute('aria-hidden', 'true'); s.innerHTML = P[n];
    return s;
  }
  function swapNode(t) {
    var guard = 0;
    while (t && guard++ < 12) {
      var m = RX.exec(t.nodeValue); if (!m) return;
      var rest = t.splitText(m.index); rest.nodeValue = rest.nodeValue.slice(m[0].length);
      rest.parentNode.insertBefore(icon(E[m[1]]), rest);
      t = rest;
    }
  }
  function swapAll() {
    if (!D.body) return;
    var w = D.createTreeWalker(D.body, NodeFilter.SHOW_TEXT, { acceptNode: function (n) {
      var p = n.parentNode && n.parentNode.nodeName;
      if (p === 'SCRIPT' || p === 'STYLE' || p === 'TEXTAREA' || p === 'OPTION' || p === 'TITLE') return NodeFilter.FILTER_REJECT;
      return RX.test(n.nodeValue) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
    } }), list = [], n;
    while ((n = w.nextNode())) list.push(n);
    list.forEach(swapNode);
  }
  var pend = false;
  function later() { if (pend) return; pend = true; (window.requestAnimationFrame || setTimeout)(function () { pend = false; try { swapAll(); } catch (e) {} }); }
  function startIcons() {
    try { swapAll(); } catch (e) {}
    if ('MutationObserver' in window) new MutationObserver(later).observe(D.body, { childList: true, subtree: true, characterData: true });
  }
  if (D.readyState === 'loading') D.addEventListener('DOMContentLoaded', startIcons); else startIcons();
})();
