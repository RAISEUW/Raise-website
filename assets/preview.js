/* PREVIEW ONLY — layout + tile-image switcher for comparing designs.
   Delete this file and its <script> tag before launch.
   State lives in the URL (?tiles=type), never in browser storage. */
(function () {
  'use strict';
  var params = new URLSearchParams(location.search);
  var tiles = params.get('tiles') === 'type' ? 'type' : 'ph';
  var page = (location.pathname.split('/').pop() || '').toLowerCase();
  document.body.classList.add('show-todo', 'has-preview-bar');
  if (tiles === 'type') document.body.classList.add('tiles-type');

  function link(href, label) {
    var a = document.createElement('a');
    var q = tiles === 'type' ? '?tiles=type' : '';
    a.href = href + q; a.textContent = label;
    if (page === href) a.setAttribute('aria-current', 'page');
    return a;
  }
  function toggle(value, label) {
    var b = document.createElement('button');
    b.type = 'button'; b.textContent = label;
    b.setAttribute('aria-pressed', tiles === value ? 'true' : 'false');
    b.addEventListener('click', function () {
      tiles = value;
      document.body.classList.toggle('tiles-type', value === 'type');
      bar.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
      bar.querySelectorAll('a[data-layout]').forEach(function (a) { a.href = a.getAttribute('data-layout') + (value === 'type' ? '?tiles=type' : ''); });
      var u = new URL(location.href);
      if (value === 'type') u.searchParams.set('tiles', 'type'); else u.searchParams.delete('tiles');
      history.replaceState(null, '', u);
    });
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
  var a = link('preview-gallery.html', 'A · Gallery'); a.setAttribute('data-layout', 'preview-gallery.html');
  var b = link('preview-thrusts.html', 'B · Thrusts'); b.setAttribute('data-layout', 'preview-thrusts.html');
  bar.appendChild(group('Layout', [a, b]));
  bar.appendChild(group('Tile image', [toggle('ph', 'Placeholder'), toggle('type', 'Typographic')]));
  document.body.appendChild(bar);
})();
