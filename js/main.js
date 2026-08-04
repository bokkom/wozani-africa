/* Wozani Africa — interactions & motion */
(function () {
  'use strict';

  gsap.registerPlugin(ScrollTrigger);

  var qaMode = location.search.indexOf('qa') !== -1; // ponytail: QA hook — static render for screenshot tooling
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches || qaMode;
  if (qaMode) {
    var g = document.querySelector('.grain');
    if (g) g.style.display = 'none';
  }
  // static fallback: without the pinned horizontal tween, panels must stack vertically
  if (reduceMotion) {
    document.getElementById('servicesTrack').classList.add('is-static');
    var sp = document.getElementById('servicesProgress');
    if (sp) sp.style.display = 'none';
  }
  var isDesktop = window.matchMedia('(min-width: 900px)').matches;
  var hasHover = window.matchMedia('(hover: hover)').matches;

  /* ---------- smooth scroll ---------- */
  var lenis = null;
  if (!reduceMotion && !qaMode) {
    lenis = new Lenis({ lerp: 0.16, wheelMultiplier: 1 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
    window.__lenis = lenis;
  }

  function scrollToTarget(target) {
    if (lenis) lenis.scrollTo(target, { offset: 0, duration: 1.05 });
    else document.querySelector(target).scrollIntoView({ behavior: 'smooth' });
  }
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id.length < 2) return;
      e.preventDefault();
      closeMenu();
      scrollToTarget(id);
    });
  });

  /* ---------- char splitter ---------- */
  function splitChars(el) {
    var text = el.textContent;
    el.textContent = '';
    el.setAttribute('aria-label', text);
    text.split('').forEach(function (c) {
      var s = document.createElement('span');
      s.className = 'ch';
      s.setAttribute('aria-hidden', 'true');
      s.textContent = c === ' ' ? ' ' : c;
      el.appendChild(s);
    });
  }
  document.querySelectorAll('[data-split]').forEach(splitChars);

  /* ---------- preloader + hero intro ---------- */
  var loader = document.getElementById('loader');
  var countEl = document.getElementById('loaderCount');
  var seen = sessionStorage.getItem('wa-loaded');

  function heroIntro() {
    if (reduceMotion) {
      document.body.classList.add('is-static');
      return;
    }
    var tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
    tl.to('.hero__line .ch', { y: 0, duration: 1.1, stagger: 0.035 }, 0)
      .fromTo('[data-hero-fade]', { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.9, stagger: 0.12 }, 0.45)
      .fromTo('.hero__ticker', { yPercent: 100 }, { yPercent: 0, duration: 0.8, ease: 'power3.out' }, 0.6);
  }

  function hideLoader(instant) {
    sessionStorage.setItem('wa-loaded', '1');
    if (instant) {
      loader.style.display = 'none';
      loader.classList.add('is-done');
      heroIntro();
      return;
    }
    gsap.timeline()
      .to('.loader__inner', { opacity: 0, scale: 0.94, duration: 0.35, ease: 'power2.in' })
      .to(loader, {
        clipPath: 'inset(0 0 100% 0)', duration: 0.7, ease: 'power4.inOut',
        onComplete: function () { loader.style.display = 'none'; loader.classList.add('is-done'); }
      })
      .add(heroIntro, '-=0.35');
  }

  if (reduceMotion || seen || qaMode) {
    hideLoader(true);
  } else {
    gsap.to('.loader__mark', { opacity: 1, scale: 1, duration: 0.6, ease: 'power3.out' });
    var cnt = { v: 0 };
    gsap.to(cnt, {
      v: 100, duration: 1.1, ease: 'power2.inOut',
      onUpdate: function () { countEl.textContent = Math.round(cnt.v); },
      onComplete: function () { hideLoader(false); }
    });
  }

  /* ---------- header + scroll progress ---------- */
  var header = document.getElementById('header');
  var progressBar = document.getElementById('scrollProgress');
  var lastY = 0;
  ScrollTrigger.create({
    start: 0, end: 'max',
    onUpdate: function (self) {
      var y = self.scroll();
      header.classList.toggle('is-scrolled', y > 40);
      if (y > 500 && y > lastY + 4) header.classList.add('is-hidden');
      else if (y < lastY - 4) header.classList.remove('is-hidden');
      lastY = y;
      progressBar.style.transform = 'scaleX(' + self.progress + ')';
    }
  });

  /* ---------- mobile menu ---------- */
  var burger = document.getElementById('burger');
  var menu = document.getElementById('menu');
  function closeMenu() {
    burger.classList.remove('is-open');
    menu.classList.remove('is-open');
    menu.setAttribute('aria-hidden', 'true');
    burger.setAttribute('aria-expanded', 'false');
    if (lenis) lenis.start();
  }
  burger.addEventListener('click', function () {
    var open = !menu.classList.contains('is-open');
    burger.classList.toggle('is-open', open);
    menu.classList.toggle('is-open', open);
    menu.setAttribute('aria-hidden', String(!open));
    burger.setAttribute('aria-expanded', String(open));
    if (lenis) open ? lenis.stop() : lenis.start();
  });

  /* ---------- hero scroll parallax ---------- */
  if (!reduceMotion) {
    // desktop only: mobile hero runs the CSS ken-burns zoom instead (same property)
    if (isDesktop) {
      gsap.to('.hero__media img', {
        yPercent: 12, scale: 1.06, ease: 'none',
        scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
      });
    }
    gsap.to('.hero__content', {
      yPercent: -18, opacity: 0.25, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: '75% top', scrub: true }
    });
  }

  /* ---------- hero mouse parallax ---------- */
  if (hasHover && !reduceMotion) {
    var heroEl = document.querySelector('.hero');
    var hmx = gsap.quickTo('.hero__content', 'x', { duration: 0.9, ease: 'power3' });
    var hmy = gsap.quickTo('.hero__content', 'y', { duration: 0.9, ease: 'power3' });
    var hix = gsap.quickTo('.hero__media img', 'x', { duration: 1.2, ease: 'power3' });
    heroEl.addEventListener('mousemove', function (e) {
      var nx = (e.clientX / window.innerWidth) - 0.5;
      var ny = (e.clientY / window.innerHeight) - 0.5;
      hmx(nx * -18); hmy(ny * -10); hix(nx * 14);
    }, { passive: true });
  }

  /* ---------- image wipe reveals ---------- */
  if (!reduceMotion) {
    gsap.utils.toArray('.gallery__col figure, .promoters__media').forEach(function (fig) {
      gsap.fromTo(fig,
        { clipPath: 'inset(14% 6% 14% 6%)', opacity: 0.4 },
        {
          clipPath: 'inset(0% 0% 0% 0%)', opacity: 1, duration: 1.1, ease: 'power3.out',
          scrollTrigger: { trigger: fig, start: 'top 92%' }
        });
    });
  }

  /* ---------- generic reveals ---------- */
  document.querySelectorAll('[data-reveal]').forEach(function (el) {
    if (reduceMotion) { el.classList.add('is-in'); return; }
    gsap.to(el, {
      opacity: 1, y: 0, duration: 1, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 85%' }
    });
  });

  /* ---------- manifesto word reveal ---------- */
  var manifesto = document.querySelector('[data-words]');
  if (manifesto) {
    var words = manifesto.textContent.trim().split(/\s+/);
    manifesto.innerHTML = words.map(function (w) { return '<span class="w">' + w + '</span>'; }).join(' ');
    if (!reduceMotion) {
      gsap.to(manifesto.querySelectorAll('.w'), {
        opacity: 1, stagger: 0.06, ease: 'none',
        scrollTrigger: { trigger: manifesto, start: 'top 78%', end: 'bottom 45%', scrub: true }
      });
    } else {
      manifesto.querySelectorAll('.w').forEach(function (w) { w.style.opacity = 1; });
    }
  }

  /* ---------- counters ---------- */
  document.querySelectorAll('[data-count]').forEach(function (el) {
    var target = parseInt(el.dataset.count, 10);
    if (reduceMotion) { el.textContent = target; return; }
    var obj = { v: 0 };
    ScrollTrigger.create({
      trigger: el, start: 'top 88%', once: true,
      onEnter: function () {
        gsap.to(obj, {
          v: target, duration: 1.6, ease: 'power3.out',
          onUpdate: function () { el.textContent = Math.round(obj.v); }
        });
      }
    });
  });

  /* ---------- breather parallax ---------- */
  if (!reduceMotion) {
    document.querySelectorAll('[data-parallax]').forEach(function (img) {
      gsap.fromTo(img, { yPercent: -12 }, {
        yPercent: 2, ease: 'none',
        scrollTrigger: { trigger: img.parentElement, start: 'top bottom', end: 'bottom top', scrub: true }
      });
    });
  }

  /* ---------- breather slideshows ---------- */
  if (!reduceMotion) {
    document.querySelectorAll('[data-rotate]').forEach(function (slides) {
      var imgs = Array.prototype.slice.call(slides.querySelectorAll('img'));
      if (imgs.length < 2) return;
      var caption = slides.parentElement.querySelector('.breather__caption');
      var idx = 0, timer = null;
      function advance() {
        imgs[idx].classList.remove('is-on');
        idx = (idx + 1) % imgs.length;
        imgs[idx].classList.add('is-on');
        caption.classList.add('is-swapping');
        setTimeout(function () {
          caption.textContent = imgs[idx].dataset.caption;
          caption.classList.remove('is-swapping');
        }, 450);
      }
      // run only while on screen
      new IntersectionObserver(function (entries) {
        if (entries[0].isIntersecting) {
          if (!timer) timer = setInterval(advance, 4500);
        } else if (timer) {
          clearInterval(timer); timer = null;
        }
      }, { threshold: 0.15 }).observe(slides.parentElement);
    });
  }

  /* ---------- services horizontal scroll (desktop) ---------- */
  var mm = gsap.matchMedia();
  mm.add('(min-width: 900px)', function () {
    if (reduceMotion) return;
    var track = document.getElementById('servicesTrack');
    var panels = gsap.utils.toArray('.panel');
    var progNum = document.getElementById('servicesProgressNum');
    var progFill = document.getElementById('servicesProgressFill');
    var scrollTween = gsap.to(track, {
      x: function () { return -(track.scrollWidth - window.innerWidth); },
      ease: 'none',
      scrollTrigger: {
        trigger: '.services',
        pin: true,
        scrub: 1,
        start: 'top top',
        end: function () { return '+=' + (track.scrollWidth - window.innerWidth); },
        invalidateOnRefresh: true,
        onUpdate: function (self) {
          progFill.style.transform = 'scaleX(' + self.progress + ')';
          progNum.textContent = '0' + (Math.min(3, Math.floor(self.progress * 4)) + 1);
        }
      }
    });
    // inner image parallax while panels slide
    panels.forEach(function (panel) {
      panel.querySelectorAll('.panel__img img').forEach(function (img) {
        gsap.fromTo(img, { xPercent: -6 }, {
          xPercent: 6, ease: 'none',
          scrollTrigger: { trigger: panel, containerAnimation: scrollTween, start: 'left right', end: 'right left', scrub: true }
        });
      });
    });
    return function () {};
  });
  // mobile: simple reveals for panels
  mm.add('(max-width: 899px)', function () {
    if (reduceMotion) return;
    var track = document.getElementById('servicesTrack');
    var num = document.getElementById('servicesProgressNum');
    var fill = document.getElementById('servicesProgressFill');
    var panels = gsap.utils.toArray('.services__track .panel');

    // story-card layout: number + title live on the photo (moved back on cleanup)
    var moved = [];
    panels.forEach(function (panel) {
      var media = panel.querySelector('.panel__media');
      var text = panel.querySelector('.panel__text');
      var pnum = panel.querySelector('.panel__num');
      var title = panel.querySelector('.panel__title');
      moved.push({ text: text, pnum: pnum, title: title, anchor: panel.querySelector('.panel__copy') });
      media.appendChild(pnum);
      media.appendChild(title);
      panel.classList.add('panel--card');
    });

    // progress + center-card focus (side cards dim and shrink)
    function onSwipe() {
      var max = track.scrollWidth - track.clientWidth;
      var pr = max > 0 ? track.scrollLeft / max : 0;
      fill.style.transform = 'scaleX(' + pr + ')';
      num.textContent = '0' + (Math.min(3, Math.round(pr * 3)) + 1);
      var mid = window.innerWidth / 2;
      panels.forEach(function (p) {
        var r = p.getBoundingClientRect();
        var d = Math.min(1, Math.abs(r.left + r.width / 2 - mid) / mid);
        p.style.transform = 'scale(' + (1 - d * 0.06) + ')';
        p.style.opacity = 1 - d * 0.4;
      });
    }
    track.addEventListener('scroll', onSwipe, { passive: true });
    onSwipe();
    gsap.from('.services__viewport', {
      opacity: 0, y: 50, duration: 0.9, ease: 'power3.out',
      scrollTrigger: { trigger: '.services', start: 'top 75%' }
    });
    return function () {
      track.removeEventListener('scroll', onSwipe);
      moved.forEach(function (m) {
        m.text.insertBefore(m.pnum, m.anchor);
        m.text.insertBefore(m.title, m.anchor);
      });
      panels.forEach(function (p) {
        p.classList.remove('panel--card');
        p.style.transform = ''; p.style.opacity = '';
      });
    };
  });

  /* ---------- marquees ---------- */
  function loopTicker(track, speed, reverse) {
    /* one full cycle = one content set + the flex gap before the next copy */
    var period = track.scrollWidth + (parseFloat(getComputedStyle(track).columnGap) || 0);
    var copy = track.innerHTML;
    while (track.scrollWidth < period + window.innerWidth * 1.5) track.innerHTML += copy;
    /* ponytail: CSS animation instead of GSAP — compositor-driven, immune to rAF throttling */
    track.style.setProperty('--marquee-dist', period + 'px');
    track.style.animationDuration = (period / speed) + 's';
    track.classList.add('ticker--run');
    if (reverse) track.classList.add('ticker--reverse');
  }
  if (!reduceMotion) {
    var heroTicker = document.querySelector('[data-ticker]');
    if (heroTicker) loopTicker(heroTicker, 70, false);
    document.querySelectorAll('[data-marquee] .ticker__track').forEach(function (t, i) {
      loopTicker(t, 90, i === 1);
    });
    var footTicker = document.querySelector('.footer__marquee .ticker__track');
    if (footTicker) loopTicker(footTicker, 60, false);
  }

  /* ---------- legacy rows stagger ---------- */
  if (!reduceMotion) {
    gsap.from('.legacy__row', {
      opacity: 0, y: 34, duration: 0.7, ease: 'power3.out', stagger: 0.07,
      scrollTrigger: { trigger: '.legacy__list', start: 'top 82%' }
    });
  }

  /* ---------- legacy hover preview ---------- */
  if (isDesktop && hasHover && !reduceMotion) {
    var preview = document.getElementById('legacyPreview');
    var pimg = preview.querySelector('img');
    var px = gsap.quickTo(preview, 'x', { duration: 0.5, ease: 'power3' });
    var py = gsap.quickTo(preview, 'y', { duration: 0.5, ease: 'power3' });
    var list = document.getElementById('legacyList');
    var previewOn = false;
    var lastX = -1, lastY = -1, verifyTimer = 0, checkOnMove = false;
    function hidePreview() {
      if (!previewOn) return;
      previewOn = false;
      // overwrite:'auto' kills any still-running show tween — without it a 0.4s
      // show outlives the 0.3s hide and drags opacity back to 1 (the stick bug)
      gsap.to(preview, { opacity: 0, scale: 0.9, duration: 0.3, ease: 'power3.in', overwrite: 'auto' });
    }
    // single source of truth: preview may be visible only while a live hit-test
    // puts the pointer on a row, no overlay is open, and the tab is visible.
    // Lenis slides rows under a stationary pointer and Chromium re-dispatches
    // boundary events in an order that races the hide, so events are treated as
    // hints and elementFromPoint as the authority.
    function overlayOpen() {
      return !!document.querySelector('.lightbox.is-open, .menu.is-open');
    }
    function rowAtPointer() {
      var el = document.elementFromPoint(lastX, lastY);
      return el ? el.closest('.legacy__row') : null;
    }
    function verify() {
      if (previewOn && (document.hidden || overlayOpen() || !rowAtPointer())) hidePreview();
    }
    function trackPointer(e) { lastX = e.clientX; lastY = e.clientY; }
    // mouseover fires before mouseenter, so coords are fresh when the show-gate runs
    window.addEventListener('mouseover', trackPointer, { passive: true });
    window.addEventListener('mousemove', function (e) {
      trackPointer(e);
      if (checkOnMove) { checkOnMove = false; verify(); }
    }, { passive: true });
    list.addEventListener('mousemove', function (e) {
      px(e.clientX + 28);
      py(e.clientY - 120);
    });
    list.querySelectorAll('.legacy__row').forEach(function (row) {
      row.addEventListener('mouseenter', function () {
        // gate the show on a live hit-test: a synthetic enter for a row that has
        // already scrolled away (or under an open overlay) must not re-show
        if (rowAtPointer() !== row || overlayOpen()) return;
        pimg.src = row.dataset.img;
        previewOn = true;
        gsap.to(preview, { opacity: 1, scale: 1, duration: 0.4, ease: 'power3.out', overwrite: 'auto' });
      });
    });
    list.addEventListener('mouseleave', hidePreview);
    window.addEventListener('scroll', function () {
      verify();
      // trailing checks: a synthetic enter can land after the last scroll event,
      // so re-verify once the scroll settles and once on the next real mousemove
      checkOnMove = true;
      clearTimeout(verifyTimer);
      verifyTimer = setTimeout(verify, 150);
    }, { passive: true });
    document.addEventListener('mouseleave', hidePreview);        // pointer left the window
    document.addEventListener('visibilitychange', hidePreview);  // tab hidden
    window.addEventListener('resize', hidePreview);
    // lightbox/menu toggle via click (mouse or keyboard); verify after their handlers ran
    document.addEventListener('click', function () { requestAnimationFrame(verify); });
    // preload previews on first approach, not at page load
    list.addEventListener('mouseenter', function () {
      list.querySelectorAll('.legacy__row').forEach(function (row) {
        var im = new Image(); im.src = row.dataset.img;
      });
    }, { once: true });
  }

  /* ---------- gallery column parallax ---------- */
  if (!reduceMotion) {
    var speeds = isDesktop ? [0, -60, -140] : [0, -70, 0];
    document.querySelectorAll('.gallery__col').forEach(function (col) {
      var s = speeds[parseInt(col.dataset.speed, 10)] || 0;
      if (!s) return;
      gsap.to(col, {
        y: s, ease: 'none',
        scrollTrigger: { trigger: '.gallery__grid', start: 'top bottom', end: 'bottom top', scrub: true }
      });
    });
  }

  /* ---------- legacy spotlight (touch devices — hover preview equivalent) ---------- */
  if ((!isDesktop || !hasHover) && !reduceMotion) {
    document.querySelectorAll('.legacy__row').forEach(function (row) {
      var thumb = document.createElement('img');
      thumb.className = 'legacy__thumb';
      thumb.src = row.dataset.img;
      thumb.alt = '';
      thumb.loading = 'lazy';
      row.insertBefore(thumb, row.querySelector('.legacy__tag'));
      ScrollTrigger.create({
        trigger: row, start: 'top 56%', end: 'bottom 44%',
        toggleClass: { targets: row, className: 'is-hot' }
      });
    });
  }


  /* ---------- lightbox ---------- */
  var lightbox = document.getElementById('lightbox');
  var lbImg = document.getElementById('lbImg');
  var lbCap = document.getElementById('lbCap');
  var figures = Array.prototype.slice.call(document.querySelectorAll('.gallery__col figure'));
  var lbIndex = 0;

  function openLightbox(i) {
    lbIndex = (i + figures.length) % figures.length;
    var fig = figures[lbIndex];
    lbImg.src = fig.querySelector('img').src;
    lbImg.alt = fig.querySelector('img').alt;
    lbCap.textContent = fig.querySelector('figcaption').textContent;
    lightbox.classList.add('is-open');
    lightbox.setAttribute('aria-hidden', 'false');
    if (lenis) lenis.stop();
  }
  function closeLightbox() {
    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden', 'true');
    if (lenis) lenis.start();
  }
  figures.forEach(function (fig, i) {
    fig.setAttribute('tabindex', '0');
    fig.setAttribute('role', 'button');
    fig.setAttribute('aria-label', 'View image: ' + fig.querySelector('figcaption').textContent);
    fig.addEventListener('click', function () { openLightbox(i); });
    fig.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLightbox(i); }
    });
  });
  document.getElementById('lbClose').addEventListener('click', closeLightbox);
  document.getElementById('lbPrev').addEventListener('click', function () { openLightbox(lbIndex - 1); });
  document.getElementById('lbNext').addEventListener('click', function () { openLightbox(lbIndex + 1); });
  lightbox.addEventListener('click', function (e) { if (e.target === lightbox) closeLightbox(); });
  document.addEventListener('keydown', function (e) {
    if (!lightbox.classList.contains('is-open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') openLightbox(lbIndex - 1);
    if (e.key === 'ArrowRight') openLightbox(lbIndex + 1);
  });
  // touch swipe navigation
  var lbSx = 0, lbSy = 0;
  lightbox.addEventListener('touchstart', function (e) {
    lbSx = e.touches[0].clientX; lbSy = e.touches[0].clientY;
  }, { passive: true });
  lightbox.addEventListener('touchend', function (e) {
    var dx = e.changedTouches[0].clientX - lbSx;
    var dy = e.changedTouches[0].clientY - lbSy;
    if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      openLightbox(dx < 0 ? lbIndex + 1 : lbIndex - 1);
    }
  }, { passive: true });

  /* ---------- custom cursor ---------- */
  if (hasHover && !reduceMotion) {
    var cursor = document.getElementById('cursor');
    var cx = gsap.quickTo(cursor, 'x', { duration: 0.18, ease: 'power2' });
    var cy = gsap.quickTo(cursor, 'y', { duration: 0.18, ease: 'power2' });
    window.addEventListener('mousemove', function (e) {
      cursor.classList.add('is-on');
      cx(e.clientX); cy(e.clientY);
    }, { passive: true });
    document.documentElement.addEventListener('mouseleave', function () { cursor.classList.remove('is-on'); });
    document.documentElement.addEventListener('mouseenter', function () { cursor.classList.add('is-on'); });
    window.addEventListener('mousedown', function () { cursor.classList.add('is-down'); });
    window.addEventListener('mouseup', function () { cursor.classList.remove('is-down'); });
    document.querySelectorAll('a, button, [data-cursor]').forEach(function (el) {
      el.addEventListener('mouseenter', function () { cursor.classList.add('is-hover'); });
      el.addEventListener('mouseleave', function () { cursor.classList.remove('is-hover'); });
    });
    document.querySelectorAll('[data-cursor-view]').forEach(function (el) {
      el.addEventListener('mouseenter', function () { cursor.classList.add('is-view'); });
      el.addEventListener('mouseleave', function () { cursor.classList.remove('is-view'); });
    });
  }

  /* ---------- magnetic buttons ---------- */
  if (hasHover && !reduceMotion) {
    document.querySelectorAll('[data-magnetic]').forEach(function (el) {
      var xTo = gsap.quickTo(el, 'x', { duration: 0.4, ease: 'power3' });
      var yTo = gsap.quickTo(el, 'y', { duration: 0.4, ease: 'power3' });
      el.addEventListener('mousemove', function (e) {
        var r = el.getBoundingClientRect();
        xTo((e.clientX - r.left - r.width / 2) * 0.35);
        yTo((e.clientY - r.top - r.height / 2) * 0.45);
      });
      el.addEventListener('mouseleave', function () { xTo(0); yTo(0); });
    });
  }

  /* ---------- contact form ---------- */
  var chips = document.getElementById('chips');
  chips.addEventListener('click', function (e) {
    var b = e.target.closest('.chip');
    if (!b) return;
    chips.querySelectorAll('.chip').forEach(function (c) { c.classList.remove('is-active'); });
    b.classList.add('is-active');
  });

  document.getElementById('quoteForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var f = e.target;
    var name = f.name.value.trim();
    var email = f.email.value.trim();
    var msg = f.message.value.trim();
    var interest = chips.querySelector('.chip.is-active').textContent;
    if (!name || !email) {
      [f.name, f.email].forEach(function (inp) {
        if (!inp.value.trim()) {
          gsap.fromTo(inp, { x: -6 }, { x: 0, duration: 0.4, ease: 'elastic.out(1,0.35)' });
          inp.focus();
        }
      });
      return;
    }
    // ponytail: static site, no backend — mailto compose. Swap address if client confirms different inbox.
    var body = 'Name: ' + name + '\nEmail: ' + email + '\nInterested in: ' + interest + '\n\n' + msg;
    window.location.href = 'mailto:info@wozaniafrica.co.za?subject=' +
      encodeURIComponent('Quote request — ' + interest) + '&body=' + encodeURIComponent(body);
  });

  /* refresh triggers once images settle */
  window.addEventListener('load', function () {
    ScrollTrigger.refresh();
    if (qaMode) {
      var m = location.search.match(/at=(\d+)/);
      if (m) window.scrollTo(0, parseInt(m[1], 10));
    }
  });
})();
