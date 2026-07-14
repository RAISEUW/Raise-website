(function () {
  'use strict';
  var all = [];
  var theme = 'all';
  var query = '';
  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;'); }
  function safeUrl(u) { try { var url = new URL(u); return url.protocol === 'https:' ? url.href : '#'; } catch (e) { return '#'; } }
  function renderActions(p) {
    var resources = Array.isArray(p.resources) ? p.resources : [];
    return '<div class="pub-item__actions">' +
      '<a class="link-arrow" href="' + esc(safeUrl(p.url)) + '" target="_blank" rel="noopener">Read <span class="arr">↗</span></a>' +
      resources.map(function (resource) {
        return '<a class="link-arrow" href="' + esc(safeUrl(resource && resource.url)) + '" target="_blank" rel="noopener">' + esc(resource && resource.label) + ' <span class="arr">↗</span></a>';
      }).join('') + '</div>';
  }
  function matches(p) {
    if (theme !== 'all' && (p.themes || []).indexOf(theme) < 0) return false;
    if (!query) return true;
    return ((p.title || '') + ' ' + (p.authors || '') + ' ' + (p.venue || '')).toLowerCase().indexOf(query) > -1;
  }
  function render() {
    var pubs = all.filter(matches);
    var byYear = {};
    pubs.forEach(function (p) { var year = Number.isInteger(p.year) ? String(p.year) : 'Undated'; (byYear[year] = byYear[year] || []).push(p); });
    var years = Object.keys(byYear).sort(function (a, b) { if (a === 'Undated') return 1; if (b === 'Undated') return -1; return Number(b) - Number(a); });
    document.getElementById('pubGroups').innerHTML = years.map(function (year) {
      return '<section class="year-group" aria-labelledby="year-' + esc(year) + '"><h2 class="year-group__year" id="year-' + esc(year) + '">' + esc(year) + '</h2><div>' +
        byYear[year].map(function (p) {
          return '<article class="pub-item"><div class="pub-item__tags">' + (p.tags || []).map(function (tag) { return '<span class="tag">' + esc(tag) + '</span>'; }).join('') + '</div>' +
            '<h3 class="pub-item__title">' + esc(p.title) + '</h3><p class="pub-item__authors">' + esc(p.authors) + '</p>' +
            '<div class="pub-item__foot"><span class="pub-item__venue">' + esc(p.venue) + '</span>' + renderActions(p) + '</div></article>';
        }).join('') + '</div></section>';
    }).join('') || '<p class="muted pub-empty">Nothing matches — try a different theme or search.</p>';
    document.getElementById('resultCount').textContent = pubs.length + ' of ' + all.length + ' publications';
  }
  document.getElementById('filters').addEventListener('click', function (event) {
    var button = event.target.closest('.filter'); if (!button) return;
    this.querySelectorAll('.filter').forEach(function (filter) { filter.setAttribute('aria-pressed', filter === button ? 'true' : 'false'); });
    theme = button.dataset.filter; render();
  });
  document.getElementById('pubSearch').addEventListener('input', function () { query = this.value.trim().toLowerCase(); render(); });
  var siteData = window.RAISE_SITE_DATA;
  if (siteData && Array.isArray(siteData.publications)) {
    all = siteData.publications;
    render();
  } else {
    document.getElementById('resultCount').textContent = 'Publications unavailable';
    document.getElementById('pubGroups').innerHTML = '<p class="muted pub-empty">Publications could not be loaded. Please try again later.</p>';
  }
})();
