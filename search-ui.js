/* نُزُل — اقتراحات خانة الوجهة في الصفحة الرئيسية (مدن ودول، مع تحمّل اختلاف الإملاء) + زر Enter للبحث. */
(function () {
  'use strict';
  var inp = document.getElementById('dest'), SR = window.NZ_SEARCH, go = document.getElementById('go');
  if (!inp || !SR) return;
  inp.removeAttribute('list');
  var box = document.createElement('div');
  box.className = 'sg'; box.id = 'sg'; box.setAttribute('role', 'listbox'); box.hidden = true;
  inp.parentNode.classList.add('sgw');
  inp.parentNode.appendChild(box);
  inp.setAttribute('role', 'combobox'); inp.setAttribute('aria-autocomplete', 'list'); inp.setAttribute('aria-controls', 'sg'); inp.setAttribute('aria-expanded', 'false');
  var items = [], cur = -1;
  function isAr() { return document.documentElement.lang !== 'en'; }
  function close() { box.hidden = true; cur = -1; inp.setAttribute('aria-expanded', 'false'); }
  function pick(o) {
    inp.value = isAr() ? o.ar : o.en;
    close();
    inp.dispatchEvent(new Event('input', { bubbles: true }));
    close();
  }
  function draw() {
    var q = inp.value.trim();
    items = q ? SR.suggest(q, 6) : [];
    box.textContent = '';
    if (!items.length) return close();
    var ar = isAr();
    items.forEach(function (o, i) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'sgi'; b.setAttribute('role', 'option'); b.id = 'sg' + i;
      var m = document.createElement('b'); m.textContent = ar ? o.ar : o.en;
      var s = document.createElement('span');
      s.textContent = o.t === 'country' ? (ar ? 'دولة · ' + o.cities.length + (o.cities.length > 2 ? ' مدن' : o.cities.length === 2 ? ' مدينتين' : ' مدينة') : 'Country · ' + o.cities.length + (o.cities.length === 1 ? ' city' : ' cities')) : (ar ? o.cAr : o.cEn);
      b.appendChild(m); b.appendChild(s);
      b.addEventListener('mousedown', function (e) { e.preventDefault(); });
      b.addEventListener('click', function () { pick(o); });
      box.appendChild(b);
    });
    cur = -1; box.hidden = false; inp.setAttribute('aria-expanded', 'true');
  }
  function mark() {
    [].forEach.call(box.children, function (c, i) { c.classList.toggle('on', i === cur); });
    if (cur >= 0) inp.setAttribute('aria-activedescendant', 'sg' + cur); else inp.removeAttribute('aria-activedescendant');
  }
  var skip = false;
  inp.addEventListener('input', function () { if (skip) return; draw(); });
  inp.addEventListener('focus', function () { if (inp.value.trim() && !SR.resolve(inp.value)) draw(); });
  inp.addEventListener('blur', function () { setTimeout(close, 150); });
  inp.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowDown' && !box.hidden) { e.preventDefault(); cur = (cur + 1) % items.length; mark(); }
    else if (e.key === 'ArrowUp' && !box.hidden) { e.preventDefault(); cur = (cur - 1 + items.length) % items.length; mark(); }
    else if (e.key === 'Escape') close();
    else if (e.key === 'Enter') {
      e.preventDefault();
      if (!box.hidden && cur >= 0) { skip = true; pick(items[cur]); skip = false; return; }
      close();
      if (go) go.click();
    }
  });
})();
