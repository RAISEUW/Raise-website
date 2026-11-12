/* ============================================================
   RAISE project showcase — renders project tiles from
   data/site-data.js (projects + thrusts) into either:
     #gallery  → minimal side-scrolling gallery
     #thrusts  → three pillars (research aims) with tiles beneath
   No inline scripts (CSP). No browser storage.
   ============================================================ */
(function () {
  'use strict';

  var data = window.RAISE_SITE_DATA || {};
  var projects = Array.isArray(data.projects) ? data.projects : [];
  var thrusts = Array.isArray(data.thrusts) ? data.thrusts : [];

  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;'); }
  function safeUrl(u) { try { var url = new URL(u, location.href); return url.protocol === 'https:' ? url.href : ''; } catch (e) { return ''; } }
  function safeImage(path) { return typeof path === 'string' && /^assets\/projects\/[a-z0-9-]+\.(webp|jpg|png)$/.test(path) ? path : ''; }
  var STATUS = { preliminary: 'Preliminary', papers: 'Papers' };

  function tile(p, opts) {
    var url = p.link && safeUrl(p.link.url);
    var img = safeImage(p.image);
    var tag = url ? 'a' : 'div';
    var attrs = url ? ' href="' + esc(url) + '" target="_blank" rel="noopener"' : '';
    var minimal = !!opts.minimal;
    return '<' + tag + ' class="ptile ptile--' + esc(p.thrust) + (img ? ' ptile--img' : '') + (minimal ? ' ptile--minimal' : '') + (url ? '' : ' ptile--nolink') + '"' + attrs + '>' +
      '<div class="ptile__visual" aria-hidden="true">' +
        (img ? '<img src="' + esc(img) + '" alt="" loading="lazy" decoding="async" />'
             : '<span class="ptile__ph">Image</span><span class="ptile__type">' + esc(p.name) + '</span>') +
      '</div>' +
      '<div class="ptile__body">' +
        (!minimal && STATUS[p.status] ? '<span class="ptile__meta">' + esc(STATUS[p.status]) + '</span>' : '') +
        '<h3 class="ptile__name">' + esc(p.name) + '</h3>' +
        (p.partner ? '<p class="ptile__partner">' + esc(p.partner) + '</p>' : '') +
        (!minimal && url ? '<span class="ptile__link">' + esc(p.link.label) + ' <span class="arr">↗</span></span>' : '') +
        (!minimal && p.linkTodo ? '<span class="ptile__todo">TODO: ' + esc(p.linkTodo) + '</span>' : '') +
      '</div></' + tag + '>';
  }

  /* ---------- minimal side-scrolling gallery ---------- */
  function initGallery() {
    var root = document.getElementById('gallery');
    if (!root || !projects.length) return;
    var track = root.querySelector('.gallery__track');
    var prev = root.querySelector('[data-dir="-1"]');
    var next = root.querySelector('[data-dir="1"]');
    track.innerHTML = projects.map(function (p) { return tile(p, { minimal: true }); }).join('');

    var reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    function step() { var first = track.querySelector('.ptile'); return first ? first.getBoundingClientRect().width + 16 : 260; }
    function update() {
      prev.disabled = track.scrollLeft <= 2;
      next.disabled = track.scrollLeft >= track.scrollWidth - track.clientWidth - 2;
    }
    [prev, next].forEach(function (b) {
      b.addEventListener('click', function () {
        track.scrollBy({ left: +b.dataset.dir * step() * Math.max(1, Math.floor(track.clientWidth / step()) - 1), behavior: reduced ? 'auto' : 'smooth' });
      });
    });
    track.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
  }

  /* ---------- three pillars with tiles beneath ---------- */
  function initThrusts() {
    var root = document.getElementById('thrusts');
    if (!root || !thrusts.length) return;
    root.innerHTML = thrusts.map(function (t, i) {
      var items = projects.filter(function (p) { return p.thrust === t.key; });
      return '<section class="thrust thrust--' + esc(t.key) + '" aria-labelledby="thrust-' + i + '">' +
        '<header class="thrust__head">' +
          '<h3 class="thrust__name" id="thrust-' + i + '">' + esc(t.name) + '</h3>' +
          '<p class="thrust__blurb">' + esc(t.blurb) + '</p>' +
        '</header>' +
        '<div class="thrust__tiles">' + items.map(function (p) { return tile(p, { minimal: false }); }).join('') + '</div>' +
      '</section>';
    }).join('');
  }

  initGallery();
  initThrusts();
})();
