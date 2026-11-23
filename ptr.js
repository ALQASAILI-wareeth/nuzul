/* نُزُل — اسحب لتحت من أعلى الصفحة عشان تتحدّث (للجوال) */
(function () {
  'use strict';
  if (!('ontouchstart' in window)) return;
  var D = document, TH = 85, MAX = 130, y0 = null, x0 = 0, dy = 0, live = false, busy = false, el = null;
  function make() {
    el = D.createElement('div');
    el.setAttribute('aria-hidden', 'true');
    el.style.cssText = 'position:fixed;top:0;left:50%;z-index:200;width:42px;height:42px;margin-left:-21px;border-radius:50%;background:#fff;box-shadow:0 4px 14px rgba(6,47,82,.25);display:flex;align-items:center;justify-content:center;transform:translateY(-60px);opacity:0;pointer-events:none';
    el.innerHTML = '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#0062A8" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 12a8 8 0 11-2.6-5.900"/><path d="M20 4v5h-5"/></svg>';
    D.body.appendChild(el);
  }
  function top() { return (window.pageYOffset || D.documentElement.scrollTop || 0) <= 0; }
  function blocked(t) {
    if (D.body.classList.contains('shlock')) return true;
    for (var n = t; n && n !== D.body; n = n.parentNode) {
      if (n.nodeType !== 1) continue;
      if (n.tagName === 'INPUT' || n.tagName === 'SELECT' || n.tagName === 'TEXTAREA') return true;
      var s = getComputedStyle(n);
      if ((s.overflowY === 'auto' || s.overflowY === 'scroll') && n.scrollTop > 0) return true;
    }
    return false;
  }
  function draw() {
    if (!el) return;
    var p = Math.min(dy, MAX);
    el.style.transition = 'none';
    el.style.opacity = String(Math.min(1, p / TH));
    el.style.transform = 'translateY(' + (p * 0.75 - 40) + 'px) rotate(' + (p * 3) + 'deg)';
  }
  function reset() {
    if (!el) return;
    el.style.transition = 'transform .25s,opacity .25s';
    el.style.transform = 'translateY(-60px)'; el.style.opacity = '0';
  }
  D.addEventListener('touchstart', function (e) {
    if (busy || e.touches.length !== 1 || !top() || blocked(e.target)) { y0 = null; return; }
    y0 = e.touches[0].clientY; x0 = e.touches[0].clientX; dy = 0; live = false;
  }, { passive: true });
  D.addEventListener('touchmove', function (e) {
    if (y0 === null || busy) return;
    var t = e.touches[0], d = t.clientY - y0;
    if (!live) {
      if (Math.abs(t.clientX - x0) > Math.abs(d) || d < 0 || !top()) { y0 = null; return; }
      if (d < 12) return;
      live = true; if (!el) make();
    }
    if (!top()) { y0 = null; live = false; reset(); return; }
    dy = Math.max(0, d * 0.6); draw();
  }, { passive: true });
  function end() {
    if (y0 === null || !live) { y0 = null; return; }
    y0 = null; live = false;
    if (dy >= TH) {
      busy = true;
      el.style.transition = 'transform .2s'; el.style.transform = 'translateY(28px)';
      el.firstChild.style.animation = 'nzspin .7s linear infinite';
      if (!D.getElementById('nzspin')) { var st = D.createElement('style'); st.id = 'nzspin'; st.textContent = '@keyframes nzspin{to{transform:rotate(360deg)}}'; D.head.appendChild(st); }
      setTimeout(function () { try { location.reload(); } catch (e) { location.href = location.href; } }, 250);
    } else reset();
  }
  D.addEventListener('touchend', end, { passive: true });
  D.addEventListener('touchcancel', function () { y0 = null; live = false; reset(); }, { passive: true });
})();
