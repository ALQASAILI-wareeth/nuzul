/* صفحة النتائج: تحسينات شكلية إضافية فقط */
(function () {
  'use strict';
  var D = document;
  function lower() {
    var c = D.querySelector('main .chn'), hs = D.getElementById('hs'), h = D.getElementById('cardsH');
    if (!c || c.classList.contains('nz-low') || !h) return;
    c.classList.add('nz-low');
    h.parentNode.insertBefore(c, h);
  }
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
})();
