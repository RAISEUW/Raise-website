/* ============================================================
   RAISE site behaviors + data-driven rendering
   Content lives in data/site-data.json — edit it (or use
   admin.html) and the site updates. No build step.
   ============================================================ */
(function () {
  'use strict';

  function esc(s) { var d = document.createElement('div'); d.textContent = s == null ? '' : String(s); return d.innerHTML; }
  function pad(n) { return (n < 10 ? '0' : '') + n; }

  /* ---------- render hero carousel from data ---------- */
  function renderHero(pubs) {
    var slides = document.querySelector('#hero .hero__slides');
    var rail = document.getElementById('railTrack');
    if (!slides || !rail) return;
    var feats = pubs.filter(function (p) { return p.hero; }).slice(0, 5);
    if (!feats.length) return;
    slides.innerHTML = feats.map(function (p, i) {
      return '<article class="hero-slide' + (i === 0 ? ' active' : '') + '" data-slide="' + i + '">' +
        '<div class="hero-slide__bg hero-slide__bg--' + (i + 1) + '"></div>' +
        '<div class="hero__scrim"></div>' +
        '<div class="hero-slide__content">' +
          '<span class="hero__kicker">Recent research \u00b7 ' + esc(p.venue) + '</span>' +
          '<h1 class="display">' + esc(p.title) + '</h1>' +
          '<p class="hero__dek">' + esc(p.authors) + '</p>' +
          '<div class="hero__actions">' +
            '<a class="btn btn--light" href="' + esc(p.url) + '" target="_blank" rel="noopener">Read the paper <span class="arr">\u2197</span></a>' +
            '<a class="btn btn--onpurple-ghost" href="publications.html">All publications</a>' +
          '</div>' +
        '</div></article>';
    }).join('');
    rail.innerHTML = feats.map(function (p, i) {
      return '<button class="rail-item" data-go="' + i + '" aria-current="' + (i === 0 ? 'true' : 'false') + '">' +
        '<span class="rail-item__bar"></span>' +
        '<span class="rail-item__num">' + pad(i + 1) + ' / ' + pad(feats.length) + ' \u00b7 ' + esc((p.venue || '').split(' ')[0]) + '</span>' +
        '<span class="rail-item__title">' + esc(p.shortTitle || p.title) + '</span></button>';
    }).join('');
  }

  /* ---------- render selected publications from data ---------- */
  function renderPubs(pubs) {
    var list = document.getElementById('pubList');
    if (!list) return;
    var sel = pubs.filter(function (p) { return p.selected; }).slice(0, 6);
    if (!sel.length) return;
    list.innerHTML = sel.map(function (p) {
      return '<article class="pub-item reveal" data-theme="' + esc((p.themes || []).join(' ')) + '">' +
        '<div class="pub-item__tags">' + (p.tags || []).map(function (t) { return '<span class="tag">' + esc(t) + '</span>'; }).join('') + '</div>' +
        '<h3 class="pub-item__title">' + esc(p.title) + '</h3>' +
        '<p class="pub-item__authors">' + esc(p.authors) + '</p>' +
        '<div class="pub-item__foot"><span class="pub-item__venue">' + esc(p.venue) + '</span>' +
        '<a class="link-arrow" href="' + esc(p.url) + '" target="_blank" rel="noopener">Read <span class="arr">\u2197</span></a></div></article>';
    }).join('');
  }

  /* ---------- hero carousel ---------- */
  function initCarousel() {
    var hero = document.getElementById('hero');
    if (!hero) return;
    var slides = hero.querySelectorAll('.hero-slide');
    var rail = document.getElementById('railTrack');
    var railItems = rail.querySelectorAll('.rail-item');
    var n = slides.length, cur = 0, timer = null;
    var DUR = 6500;
    hero.style.setProperty('--hero-dur', DUR + 'ms');
    var reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

    function go(i, user) {
      cur = (i + n) % n;
      slides.forEach(function (s, k) { s.classList.toggle('active', k === cur); });
      railItems.forEach(function (r, k) {
        r.setAttribute('aria-current', k === cur ? 'true' : 'false');
        if (k === cur) {
          var bar = r.querySelector('.rail-item__bar');
          bar.style.animation = 'none'; void bar.offsetWidth; bar.style.animation = '';
          var rr = r.getBoundingClientRect(), tr = rail.getBoundingClientRect();
          if (rr.left < tr.left || rr.right > tr.right) {
            rail.scrollTo({ left: r.offsetLeft - rail.offsetLeft - 20, behavior: reduced ? 'auto' : 'smooth' });
          }
        }
      });
      if (user) restart();
    }
    function tick() { go(cur + 1); }
    function restart() { if (timer) clearInterval(timer); if (!reduced) timer = setInterval(tick, DUR); }

    rail.addEventListener('click', function (e) {
      var b = e.target.closest('.rail-item'); if (b) go(+b.dataset.go, true);
    });
    hero.addEventListener('mouseenter', function () { hero.classList.add('paused'); if (timer) clearInterval(timer); timer = null; });
    hero.addEventListener('mouseleave', function () { hero.classList.remove('paused'); restart(); });
    document.addEventListener('visibilitychange', function () { if (document.hidden) { if (timer) clearInterval(timer); timer = null; } else if (!hero.matches(':hover')) restart(); });
    restart();
  }

  /* ---------- header + mobile menu ---------- */
  function initChrome() {
    var header = document.getElementById('header');
    if (header) {
      if (header.dataset.fixedMode) {
        header.dataset.mode = header.dataset.fixedMode;
      } else {
        var onScroll = function () { header.dataset.mode = window.scrollY > 60 ? 'solid' : 'over'; };
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
      }
    }
    var mobileNav = document.getElementById('mobileNav'), menuBtn = document.getElementById('menuBtn');
    if (mobileNav && menuBtn) {
      var setMenu = function (open) { mobileNav.classList.toggle('open', open); menuBtn.setAttribute('aria-expanded', open); document.body.style.overflow = open ? 'hidden' : ''; };
      menuBtn.addEventListener('click', function () { setMenu(true); });
      document.getElementById('menuClose').addEventListener('click', function () { setMenu(false); });
      mobileNav.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
    }
  }

  /* ---------- publication theme filter ---------- */
  function initFilters() {
    var filters = document.getElementById('filters');
    if (!filters) return;
    var items = document.querySelectorAll('#pubList .pub-item');
    filters.addEventListener('click', function (e) {
      var btn = e.target.closest('.filter'); if (!btn) return;
      filters.querySelectorAll('.filter').forEach(function (f) { f.setAttribute('aria-pressed', f === btn); });
      var f = btn.dataset.filter;
      items.forEach(function (it) {
        var show = f === 'all' || (' ' + it.dataset.theme + ' ').indexOf(' ' + f + ' ') > -1;
        it.classList.toggle('hidden', !show);
      });
    });
  }

  /* ---------- reveal on scroll ---------- */
  function initReveal() {
    var els = document.querySelectorAll('.reveal');
    if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
      }, { rootMargin: '0px 0px -8% 0px', threshold: .08 });
      els.forEach(function (el) { io.observe(el); });
    } else {
      els.forEach(function (el) { el.classList.add('in'); });
    }
  }

  /* ---------- boot: load data, render, init ---------- */
  initChrome();
  fetch('data/site-data.json', { cache: 'no-cache' })
    .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
    .then(function (data) {
      renderHero(data.publications || []);
      renderPubs(data.publications || []);
    })
    .catch(function (e) {
      console.warn('site-data.json not loaded (' + e.message + ') \u2014 showing built-in fallback content.');
    })
    .then(function () {
      initCarousel();
      initFilters();
      initReveal();
    });
})();
