/* ============================================================
   RAISE site behaviors + data-driven rendering
   Publication content lives in data/site-data.js — edit that
   file directly and the site updates. No build step.
   ============================================================ */
(function () {
  'use strict';

  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;'); }
  function safeUrl(u) { try { var url = new URL(u, location.href); return url.protocol === 'https:' ? url.href : '#'; } catch (e) { return '#'; } }
  function safeHeroImage(path) { return typeof path === 'string' && /^assets\/hero\/[a-z0-9-]+\.webp$/.test(path) ? path : ''; }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function renderPublicationActions(p) {
    var resources = Array.isArray(p.resources) ? p.resources : [];
    return '<div class="pub-item__actions">' +
      '<a class="link-arrow" href="' + esc(safeUrl(p.url)) + '" target="_blank" rel="noopener">Read <span class="arr">\u2197</span></a>' +
      resources.map(function (resource) {
        return '<a class="link-arrow" href="' + esc(safeUrl(resource && resource.url)) + '" target="_blank" rel="noopener">' + esc(resource && resource.label) + ' <span class="arr">\u2197</span></a>';
      }).join('') + '</div>';
  }

  /* ---------- render hero carousel from data ---------- */
  function renderHero(pubs) {
    var slides = document.querySelector('#hero .hero__slides');
    var rail = document.getElementById('railTrack');
    if (!slides || !rail) return;
    var feats = pubs.filter(function (p) { return p.hero; }).slice(0, 5);
    if (!feats.length) return;
    slides.innerHTML = feats.map(function (p, i) {
      var heroImage = safeHeroImage(p.heroImage);
      return '<article class="hero-slide' + (i === 0 ? ' active' : '') + '" data-slide="' + i + '">' +
        '<div class="hero-slide__bg hero-slide__bg--' + (i + 1) + '" aria-hidden="true"' + (heroImage ? ' style="background-image:url(&quot;' + heroImage + '&quot;)"' : '') + '></div>' +
        '<div class="hero__scrim"></div>' +
        '<div class="hero-slide__content">' +
          '<span class="hero__kicker">Recent research \u00b7 ' + esc(p.venue) + '</span>' +
          '<h1 class="display">' + esc(p.title) + '</h1>' +
          '<p class="hero__dek">' + esc(p.authors) + '</p>' +
          '<div class="hero__actions">' +
            '<a class="btn btn--light" href="' + esc(safeUrl(p.url)) + '" target="_blank" rel="noopener">Read the paper <span class="arr">\u2197</span></a>' +
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
        renderPublicationActions(p) + '</div></article>';
    }).join('');
  }

  /* ---------- homepage publication filters ---------- */
  function initHomeFilters() {
    var filters = document.getElementById('filters');
    var list = document.getElementById('pubList');
    if (!filters || !list) return;

    filters.addEventListener('click', function (e) {
      var button = e.target.closest('.filter');
      if (!button || !filters.contains(button)) return;
      var selected = button.dataset.filter || 'all';

      filters.querySelectorAll('.filter').forEach(function (filterButton) {
        filterButton.setAttribute('aria-pressed', filterButton === button ? 'true' : 'false');
      });

      list.querySelectorAll('.pub-item').forEach(function (item) {
        var themes = (item.dataset.theme || '').split(/\s+/);
        var visible = selected === 'all' || themes.indexOf(selected) !== -1;
        item.classList.toggle('hidden', !visible);
        if (visible) item.removeAttribute('aria-hidden');
        else item.setAttribute('aria-hidden', 'true');
      });
    });
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
    var pauseBtn = document.getElementById('carouselToggle');
    var userPaused = reduced;
    var focusInside = false;
    if (reduced && pauseBtn) pauseBtn.hidden = true;

    function clearTimer() { if (timer) clearInterval(timer); timer = null; }
    function syncPauseButton() {
      if (!pauseBtn) return;
      pauseBtn.setAttribute('aria-pressed', userPaused ? 'true' : 'false');
      pauseBtn.textContent = userPaused ? 'Play' : 'Pause';
      pauseBtn.setAttribute('aria-label', userPaused ? 'Play research carousel' : 'Pause research carousel');
    }

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
    function restart() {
      clearTimer();
      var paused = userPaused || focusInside;
      hero.classList.toggle('paused', paused);
      if (!reduced && !paused) timer = setInterval(tick, DUR);
    }

    rail.addEventListener('click', function (e) {
      var b = e.target.closest('.rail-item'); if (b) go(+b.dataset.go, true);
    });
    hero.addEventListener('focusin', function (e) { focusInside = e.target !== pauseBtn; restart(); });
    hero.addEventListener('focusout', function (e) {
      if (!hero.contains(e.relatedTarget) || e.relatedTarget === pauseBtn) { focusInside = false; restart(); }
    });
    if (pauseBtn) pauseBtn.addEventListener('click', function () { userPaused = !userPaused; syncPauseButton(); restart(); });
    document.addEventListener('visibilitychange', function () { if (document.hidden) clearTimer(); else restart(); });
    syncPauseButton();
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
      var menuClose = document.getElementById('menuClose');
      var setMenu = function (open, restoreFocus) {
        mobileNav.classList.toggle('open', open);
        mobileNav.setAttribute('aria-hidden', open ? 'false' : 'true');
        menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
        menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
        document.body.classList.toggle('menu-open', open);
        if (open) menuClose.focus();
        else if (restoreFocus) menuBtn.focus();
      };
      menuBtn.addEventListener('click', function () { setMenu(menuBtn.getAttribute('aria-expanded') !== 'true', false); });
      menuClose.addEventListener('click', function () { setMenu(false, true); });
      mobileNav.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
      document.addEventListener('keydown', function (e) {
        if (menuBtn.getAttribute('aria-expanded') !== 'true') return;
        if (e.key === 'Escape') { e.preventDefault(); setMenu(false, true); return; }
        if (e.key !== 'Tab') return;
        var focusable = Array.prototype.slice.call(mobileNav.querySelectorAll('a, button')).filter(function (el) { return !el.disabled; });
        var first = focusable[0], last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      });
    }
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
  var siteData = window.RAISE_SITE_DATA;
  if (siteData && Array.isArray(siteData.publications)) {
    renderHero(siteData.publications);
    renderPubs(siteData.publications);
  }
  initHomeFilters();
  initCarousel();
  initReveal();
})();
