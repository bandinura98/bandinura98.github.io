/* ═══════════════════════════════════════════════════════════
   Batuhan Senoglu — portfolio · behaviour
   No dependencies. Everything degrades gracefully.
   ═══════════════════════════════════════════════════════════ */

(() => {
  'use strict';

  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── 1. language ─────────────────────────────────────── */
  const DICT = window.I18N || {};
  const LANGS = ['en', 'tr'];
  const store = {
    get() { try { return localStorage.getItem('lang'); } catch { return null; } },
    set(v) { try { localStorage.setItem('lang', v); } catch { /* private mode */ } }
  };

  const pickLang = () => {
    const saved = store.get();
    if (LANGS.includes(saved)) return saved;
    return (navigator.language || 'en').toLowerCase().startsWith('tr') ? 'tr' : 'en';
  };

  const applyLang = (lang) => {
    const d = DICT[lang];
    if (!d) return;

    $$('[data-i18n]').forEach((el) => {
      const v = d[el.dataset.i18n];
      if (v != null) el.innerHTML = v;
    });

    document.documentElement.lang = lang;
    if (d['doc.title']) document.title = d['doc.title'];
    const desc = $('meta[name="description"]');
    if (desc && d['doc.desc']) desc.setAttribute('content', d['doc.desc']);

    $$('.lang button').forEach((b) => {
      const on = b.dataset.lang === lang;
      b.classList.toggle('on', on);
      b.setAttribute('aria-pressed', String(on));
    });

    store.set(lang);
  };

  let lang = pickLang();
  applyLang(lang);

  $$('.lang button').forEach((b) => {
    b.addEventListener('click', () => {
      lang = b.dataset.lang;
      applyLang(lang);
      // Line counts change between languages, so anything measured by position
      // has to be recomputed rather than left at its old value.
      requestAnimationFrame(() => { sweep(); onScroll(); });
    });
  });

  /* ── 2. veil ─────────────────────────────────────────── */
  const veil = $('#veil');
  const lift = () => veil && veil.classList.add('gone');
  // Prefer fonts-ready so the hero does not swap typefaces in front of the reader,
  // but never hold the page hostage to a slow CDN.
  const fontsReady = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
  fontsReady.then(() => setTimeout(lift, reduced ? 0 : 400));
  setTimeout(lift, 1800);

  /* ── 3. hero sigil tick marks ────────────────────────── */
  const ticks = $('.hero__sigil .ticks');
  if (ticks) {
    const NS = 'http://www.w3.org/2000/svg';
    for (let i = 0; i < 72; i++) {
      const a = (i / 72) * Math.PI * 2;
      const long = i % 6 === 0;
      const r1 = 230, r2 = long ? 252 : 241;
      const l = document.createElementNS(NS, 'line');
      l.setAttribute('x1', 300 + Math.cos(a) * r1);
      l.setAttribute('y1', 300 + Math.sin(a) * r1);
      l.setAttribute('x2', 300 + Math.cos(a) * r2);
      l.setAttribute('y2', 300 + Math.sin(a) * r2);
      l.setAttribute('opacity', long ? '.9' : '.35');
      ticks.appendChild(l);
    }
  }

  /* ── 4. reveal on scroll ─────────────────────────────── */
  const pending = new Set($$('.reveal'));
  let io = null;
  const show = (el) => {
    el.classList.add('in');
    pending.delete(el);
    if (io) io.unobserve(el);
  };

  if ('IntersectionObserver' in window && !reduced) {
    io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) show(e.target); });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });
    pending.forEach((el) => io.observe(el));
  } else {
    [...pending].forEach(show);
  }

  /* ── 5. stat counters ────────────────────────────────── */
  const runCounter = (el) => {
    const target = Number(el.dataset.count) || 0;
    if (reduced || target === 0) { el.textContent = String(target); return; }
    const dur = 1100, t0 = performance.now();
    const step = (t) => {
      const p = Math.min(1, (t - t0) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = String(Math.round(target * eased));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  const counting = new Set($$('[data-count]'));

  /* Safety net. An instant jump — a #deep-link, End/Home, a scroll position
     restored on reload — can carry an element from below the fold to above it
     between two frames, so IntersectionObserver never sees it intersect and the
     content stays at opacity 0 forever. Sweep whatever is still pending. */
  function sweep() {
    if (pending.size) {
      for (const el of [...pending]) {
        if (el.getBoundingClientRect().top < innerHeight * 0.9) show(el);
      }
    }
    if (counting.size) {
      for (const el of [...counting]) {
        if (el.getBoundingClientRect().top < innerHeight * 0.85) {
          counting.delete(el);
          runCounter(el);
        }
      }
    }
  }
  addEventListener('hashchange', () => requestAnimationFrame(sweep));
  addEventListener('load', sweep);
  addEventListener('resize', sweep, { passive: true });
  // A background tab reports innerHeight 0, which makes the sweep a no-op; run it
  // again the moment the tab is actually laid out.
  addEventListener('visibilitychange', () => { if (!document.hidden) requestAnimationFrame(sweep); });

  /* ── 6. nav: sticky state, progress bar, active link ──── */
  const nav = $('#nav');
  const fill = $('#scrollFill');
  const links = $$('.nav__links a');
  const sections = links
    .map((a) => ({ a, el: document.querySelector(a.getAttribute('href')) }))
    .filter((x) => x.el);

  let queued = false;
  function onScroll() {
    const y = scrollY;
    if (nav) nav.classList.toggle('stuck', y > 40);

    const max = document.documentElement.scrollHeight - innerHeight;
    if (fill) fill.style.width = (max > 0 ? (y / max) * 100 : 0) + '%';

    let current = null;
    for (const s of sections) {
      if (s.el.getBoundingClientRect().top <= innerHeight * 0.4) current = s.a;
    }
    links.forEach((a) => a.classList.toggle('on', a === current));

    sweep();
    queued = false;
  }
  addEventListener('scroll', () => {
    if (!queued) { queued = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
  onScroll();

  /* ── 7. mobile menu ──────────────────────────────────── */
  const burger = $('#burger');
  const menu = $('.nav__links');
  if (burger && menu) {
    const setOpen = (open) => {
      menu.classList.toggle('open', open);
      burger.setAttribute('aria-expanded', String(open));
    };
    burger.addEventListener('click', () => setOpen(!menu.classList.contains('open')));
    menu.addEventListener('click', (e) => { if (e.target.closest('a')) setOpen(false); });
    addEventListener('keydown', (e) => { if (e.key === 'Escape') setOpen(false); });
  }

  /* ── 8. pointer aura ─────────────────────────────────── */
  const aura = $('#aura');
  if (aura && !reduced && matchMedia('(pointer:fine)').matches) {
    let tx = innerWidth / 2, ty = innerHeight / 2, cx = tx, cy = ty;
    addEventListener('pointermove', (e) => {
      tx = e.clientX; ty = e.clientY;
      document.body.classList.add('pointer');
    }, { passive: true });
    (function drift() {
      cx += (tx - cx) * 0.07;
      cy += (ty - cy) * 0.07;
      aura.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%)`;
      requestAnimationFrame(drift);
    })();
  }

  /* ── 9. drifting dust ────────────────────────────────── */
  const cv = $('#dust');
  if (cv && !reduced) {
    const ctx = cv.getContext('2d');
    let motes = [];
    const dpr = Math.min(devicePixelRatio || 1, 2);

    const seed = () => {
      cv.width = innerWidth * dpr;
      cv.height = innerHeight * dpr;
      cv.style.width = innerWidth + 'px';
      cv.style.height = innerHeight + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.round(Math.min(90, (innerWidth * innerHeight) / 22000));
      motes = Array.from({ length: n }, () => ({
        x: Math.random() * innerWidth,
        y: Math.random() * innerHeight,
        r: Math.random() * 1.3 + 0.25,
        vx: (Math.random() - 0.5) * 0.12,
        vy: -(Math.random() * 0.22 + 0.04),
        a: Math.random() * 0.4 + 0.08,
        gold: Math.random() > 0.35
      }));
    };

    const tick = () => {
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      for (const m of motes) {
        m.x += m.vx; m.y += m.vy;
        if (m.y < -6) { m.y = innerHeight + 6; m.x = Math.random() * innerWidth; }
        if (m.x < -6) m.x = innerWidth + 6;
        if (m.x > innerWidth + 6) m.x = -6;
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
        ctx.fillStyle = m.gold ? `rgba(201,162,39,${m.a})` : `rgba(180,140,255,${m.a * 0.8})`;
        ctx.fill();
      }
      requestAnimationFrame(tick);
    };

    seed();
    tick();
    let rt;
    addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(seed, 200); }, { passive: true });
  }

  /* ── 10. card tilt ───────────────────────────────────── */
  if (!reduced && matchMedia('(pointer:fine)').matches) {
    $$('.card, .work').forEach((el) => {
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform = `translateY(-6px) rotateX(${-py * 4}deg) rotateY(${px * 5}deg)`;
        el.style.transformStyle = 'preserve-3d';
      });
      el.addEventListener('pointerleave', () => { el.style.transform = ''; });
    });
  }

  /* ── 11. year ────────────────────────────────────────── */
  const yr = $('#yr');
  if (yr) yr.textContent = String(new Date().getFullYear());
})();
