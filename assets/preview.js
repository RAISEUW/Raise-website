/* PREVIEW ONLY — layout, background, and tile-image switcher for comparing designs.
   Delete this file and its <script> tag before launch.
   State lives in the URL (?tiles=type&hero=campus), never in browser storage. */
(function () {
  'use strict';
  var HEROES = {
    library: { src: 'assets/backgrounds/seattle-central-library.webp', credit: 'Seattle Central Library · Carol M. Highsmith, Library of Congress (public domain)' },
    campus: { src: 'assets/backgrounds/uw-campus-autumn.webp', credit: 'University of Washington' },
    none: { src: '', credit: '' }
  };
  var params = new URLSearchParams(location.search);
  var state = {
    tiles: params.get('tiles') === 'type' ? 'type' : 'ph',
    hero: HEROES[params.get('hero')] ? params.get('hero') : 'library'
  };
  var page = (location.pathname.split('/').pop() || '').toLowerCase();
  var heroImg = document.getElementById('heroImg');
  var heroCredit = document.getElementById('heroCredit');
  document.body.classList.add('show-todo', 'has-preview-bar');

  function query() {
    var q = [];
    if (state.tiles === 'type') q.push('tiles=type');
    if (state.hero !== 'library') q.push('hero=' + state.hero);
    return q.length ? '?' + q.join('&') : '';
  }
  function apply() {
    document.body.classList.toggle('tiles-type', state.tiles === 'type');
    if (heroImg) {
      var h = HEROES[state.hero];
      heroImg.hidden = !h.src;
      if (h.src) heroImg.src = h.src;
      if (heroCredit) heroCredit.textContent = h.credit;
    }
    bar.querySelectorAll('a[data-layout]').forEach(function (a) { a.href = a.getAttribute('data-layout') + query(); });
    bar.querySelectorAll('button[data-key]').forEach(function (b) { b.setAttribute('aria-pressed', state[b.dataset.key] === b.dataset.value ? 'true' : 'false'); });
    history.replaceState(null, '', location.pathname + query());
  }
  function link(href, label) {
    var a = document.createElement('a');
    a.setAttribute('data-layout', href); a.textContent = label;
    if (page === href) a.setAttribute('aria-current', 'page');
    return a;
  }
  function toggle(key, value, label) {
    var b = document.createElement('button');
    b.type = 'button'; b.textContent = label; b.dataset.key = key; b.dataset.value = value;
    b.addEventListener('click', function () { state[key] = value; apply(); });
    return b;
  }
  function group(label, items) {
    var g = document.createElement('div'); g.className = 'preview-bar__group';
    var s = document.createElement('span'); s.className = 'preview-bar__label'; s.textContent = label; g.appendChild(s);
    items.forEach(function (i) { g.appendChild(i); });
    return g;
  }
  var bar = document.createElement('div');
  bar.className = 'preview-bar'; bar.setAttribute('role', 'region'); bar.setAttribute('aria-label', 'Design preview controls');
  bar.appendChild(group('Layout', [link('preview-gallery.html', 'Gallery'), link('preview-pillars.html', 'Pillars')]));
  if (heroImg) bar.appendChild(group('Background', [toggle('hero', 'library', 'Library'), toggle('hero', 'campus', 'Campus'), toggle('hero', 'none', 'Plain')]));
  bar.appendChild(group('Tiles', [toggle('tiles', 'ph', 'Images'), toggle('tiles', 'type', 'Typographic')]));
  document.body.appendChild(bar);
  apply();
})();
