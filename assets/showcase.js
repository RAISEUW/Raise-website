/* ============================================================
   RAISE project showcase — renders project tiles from
   data/site-data.js (projects + thrusts) into either:
     #gallery  → side-scrolling gallery (gallery)
     #thrusts  → three thrusts with tiles beneath (pillars)
   No inline scripts (CSP). No browser storage.
   ============================================================ */
(function () {
  'use strict';

  var data = window.RAISE_SITE_DATA || {};
  var projects = Array.isArray(data.projects) ? data.projects : [];
  var thrusts = Array.isArray(data.thrusts) ? data.thrusts : [];
  var thrustByKey = {};
  thrusts.forEach(function (t) { thrustByKey[t.key] = t; });

  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;'); }
  function safeUrl(u) { try { var url = new URL(u, location.href); return url.protocol === 'https:' ? url.href : ''; } catch (e) { return ''; } }
  var STATUS = { preliminary: 'Preliminary', papers: 'Papers', active: '' };

  function tile(p, opts) {
    var t = thrustByKey[p.thrust] || {};
    var url = p.link && safeUrl(p.link.url);
    var tag = url ? 'a' : 'div';
    var attrs = url ? ' href="' + esc(url) + '" target="_blank" rel="noopener"' : '';
    var meta = [];
    if (opts.showThrust && t.num) meta.push(t.num + ' · ' + (t.short || t.name));
    if (STATUS[p.status]) meta.push(STATUS[p.status]);
    return '<' + tag + ' class="ptile ptile--' + esc(p.thrust) + (url ? '' : ' ptile--nolink') + '"' + attrs + ' data-thrust="' + esc(p.thrust) + '">' +
      '<div class="ptile__visual" aria-hidden="true">' +
        '<span class="ptile__ph">Image</span>' +
        '<span class="ptile__type">' + esc(p.name) + '</span>' +
      '</div>' +
      '<div class="ptile__body">' +
        (meta.length ? '<span class="ptile__meta">' + esc(meta.join(' · ')) + '</span>' : '') +
        '<h3 class="ptile__name">' + esc(p.name) + '</h3>' +
        (p.partner ? '<p class="ptile__partner">' + esc(p.partner) + '</p>' : '') +
        (opts.showSummary && p.summary ? '<p class="ptile__summary">' + esc(p.summary) + '</p>' : '') +
        (url ? '<span class="ptile__link">' + esc(p.link.label) + ' <span class="arr">↗</span></span>' : '') +
        (p.linkTodo ? '<span class="ptile__todo">TODO: ' + esc(p.linkTodo) + '</span>' : '') +
      '</div></' + tag + '>';
  }

  /* ---------- layout A: side-scrolling gallery ---------- */
  function initGallery() {
    var root = document.getElementById('gallery');
    if (!root || !projects.length) return;
    var track = root.querySelector('.gallery__track');
    var prev = root.querySelector('[data-dir="-1"]');
    var next = root.querySelector('[data-dir="1"]');
    var filters = root.querySelector('.gallery__filters');
    var status = root.querySelector('.gallery__status');

    track.innerHTML = projects.map(function (p) { return tile(p, { showThrust: true, showSummary: true }); }).join('');

    if (filters) {
      filters.innerHTML = '<button class="filter" type="button" data-filter="all" aria-pressed="true">all projects</button>' +
        thrusts.map(function (t) { return '<button class="filter" type="button" data-filter="' + esc(t.key) + '" aria-pressed="false">' + esc(t.short || t.name) + '</button>'; }).join('');
      filters.addEventListener('click', function (e) {
        var b = e.target.closest('.filter'); if (!b) return;
        var f = b.dataset.filter;
        filters.querySelectorAll('.filter').forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
        track.querySelectorAll('.ptile').forEach(function (el) { el.hidden = !(f === 'all' || el.dataset.thrust === f); });
        track.scrollTo({ left: 0 });
        update();
      });
    }

    var reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    function step() { var first = track.querySelector('.ptile:not([hidden])'); return first ? first.getBoundingClientRect().width + 20 : 300; }
    function update() {
      var max = track.scrollWidth - track.clientWidth - 2;
      prev.disabled = track.scrollLeft <= 2;
      next.disabled = track.scrollLeft >= max;
      var n = track.querySelectorAll('.ptile:not([hidden])').length;
      if (status) status.textContent = n + (n === 1 ? ' project' : ' projects') + ' · scroll →';
    }
    [prev, next].forEach(function (b) {
      b.addEventListener('click', function () {
        track.scrollBy({ left: +b.dataset.dir * step() * Math.max(1, Math.floor(track.clientWidth / step())), behavior: reduced ? 'auto' : 'smooth' });
      });
    });
    track.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
  }

  /* ---------- layout B: three thrusts with tiles beneath ---------- */
  function initThrusts() {
    var root = document.getElementById('thrusts');
    if (!root || !thrusts.length) return;
    root.innerHTML = thrusts.map(function (t, i) {
      var items = projects.filter(function (p) { return p.thrust === t.key; });
      return '<section class="thrust thrust--' + esc(t.key) + '" aria-labelledby="thrust-' + i + '">' +
        '<header class="thrust__head">' +
          '<span class="thrust__num">' + esc(t.num) + '</span>' +
          '<h3 class="thrust__name" id="thrust-' + i + '">' + esc(t.name) + '</h3>' +
          '<p class="thrust__blurb">' + esc(t.blurb) + '</p>' +
          '<span class="thrust__count">' + items.length + (items.length === 1 ? ' project' : ' projects') + '</span>' +
        '</header>' +
        '<div class="thrust__tiles">' + items.map(function (p) { return tile(p, { showThrust: false, showSummary: false }); }).join('') + '</div>' +
      '</section>';
    }).join('');
  }

  initGallery();
  initThrusts();
})();
