/* Instituto Mauri — LP | HING Assessoria */
(() => {
  'use strict';
  const root = document.documentElement;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasGsap = typeof window.gsap !== 'undefined';
  const debounce = (fn, ms) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; };
  root.classList.add('js');
  if (!hasGsap) root.classList.remove('js-anim');

  /* Scroll suave (Lenis) ligado ao GSAP */
  let lenis = null;
  if (!reduce && typeof window.Lenis !== 'undefined') {
    lenis = new window.Lenis({ duration: 1.15, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true });
    if (hasGsap && window.ScrollTrigger) {
      lenis.on('scroll', window.ScrollTrigger.update);
      gsap.ticker.add((time) => lenis.raf(time * 1000));
      gsap.ticker.lagSmoothing(0);
    } else {
      const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    }
  }
  const headerOffset = () => -((document.querySelector('.nav-bar') || {}).offsetHeight || 60) - 24;
  document.addEventListener('click', (ev) => {
    const a = ev.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute('href');
    const target = id === '#inicio' ? document.body : document.querySelector(id);
    if (!target) return;
    ev.preventDefault();
    if (lenis) lenis.scrollTo(id === '#inicio' ? 0 : target, { offset: headerOffset() });
    else window.scrollTo({ top: id === '#inicio' ? 0 : target.getBoundingClientRect().top + window.scrollY + headerOffset(), behavior: reduce ? 'auto' : 'smooth' });
    if (id !== '#inicio') history.replaceState(null, '', id);
  });

  /* Header: pílula de vidro depois da capa */
  const header = document.querySelector('[data-header]');
  const onScroll = () => header && header.classList.toggle('is-scrolled', window.scrollY > 40);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* Menu móvel */
  const toggle = document.querySelector('.menu-toggle');
  const menu = document.getElementById('menu-mobile');
  if (toggle && menu) {
    const closeBtn = menu.querySelector('[data-menu-close]');
    let last = null;
    const focusables = () => menu.querySelectorAll('a[href], button:not([disabled])');
    const onKey = (ev) => {
      if (ev.key === 'Escape') { ev.preventDefault(); close(); return; }
      if (ev.key !== 'Tab') return;
      const f = focusables(), first = f[0], end = f[f.length - 1];
      if (ev.shiftKey && document.activeElement === first) { ev.preventDefault(); end.focus(); }
      else if (!ev.shiftKey && document.activeElement === end) { ev.preventDefault(); first.focus(); }
    };
    const open = () => {
      last = document.activeElement; menu.hidden = false; void menu.offsetWidth;
      menu.classList.add('is-open'); toggle.setAttribute('aria-expanded', 'true');
      document.body.classList.add('is-locked'); lenis && lenis.stop();
      closeBtn && closeBtn.focus();
      document.addEventListener('keydown', onKey);
    };
    const close = (restore = true) => {
      menu.classList.remove('is-open'); toggle.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('is-locked'); lenis && lenis.start();
      document.removeEventListener('keydown', onKey);
      const hide = () => { menu.hidden = true; };
      reduce ? hide() : setTimeout(hide, 300);
      if (restore && last) last.focus();
    };
    toggle.addEventListener('click', open);
    closeBtn && closeBtn.addEventListener('click', () => close());
    menu.addEventListener('click', (ev) => { if (ev.target.closest('a')) close(false); });
    window.matchMedia('(min-width: 1024px)').addEventListener('change', (m) => { if (m.matches && !menu.hidden) close(false); });
  }

  /* Animações de entrada (GSAP + ScrollTrigger) */
  if (!reduce && hasGsap && window.ScrollTrigger) {
    gsap.registerPlugin(window.ScrollTrigger);
    const sx = window.matchMedia('(max-width: 767px)').matches ? 0 : 56;
    const from = { up: { y: 48 }, down: { y: -40 }, left: { x: -sx }, right: { x: sx } };
    document.querySelectorAll('[data-reveal]').forEach((el) => gsap.set(el, from[el.dataset.reveal] || from.up));
    ScrollTrigger.batch('[data-reveal]', {
      start: 'top 88%',
      once: true,
      onEnter: (batch) => gsap.to(batch, { opacity: 1, x: 0, y: 0, duration: 1.1, ease: 'power3.out', stagger: 0.12, overwrite: 'auto' })
    });

    // Saída: ao rolar para baixo, o elemento sobe e some no topo; ao voltar, desce de novo (scrub reversível)
    document.querySelectorAll('[data-reveal], .hero__copy').forEach((el) => {
      gsap.fromTo(el, { y: 0, opacity: 1 }, {
        y: -90, opacity: 0, ease: 'none', immediateRender: false,
        scrollTrigger: { trigger: el, start: 'bottom 32%', end: 'bottom top', scrub: 0.6 }
      });
    });

    // Capa: entrada em sequência + leve parallax do Dr. Marcelo
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.fromTo('[data-hero-item]', { y: -24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, stagger: 0.08 }, 0)
      .fromTo('.hero__doctor', { y: 50 }, { y: 0, duration: 1.4 }, 0); // sem esconder: é o LCP
    gsap.to('.hero__doctor picture', { yPercent: 8, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
    gsap.to('.hero__bg img', { yPercent: 10, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

    // Sobre: o vídeo desliza mais devagar que o card
    gsap.fromTo('.about__video', { yPercent: -6 }, { yPercent: 6, ease: 'none', scrollTrigger: { trigger: '.about', start: 'top bottom', end: 'bottom top', scrub: true } });

    // Rodapé: a marca MAURI sobe de dentro do card (como o mascote do Woday)
    gsap.from('[data-giant]', { yPercent: 35, opacity: 0.2, ease: 'none', scrollTrigger: { trigger: '.footer__card', start: 'top 85%', end: 'bottom bottom', scrub: true } });
    window.addEventListener('load', () => ScrollTrigger.refresh());
  }

  /* Vídeo do Sobre: só toca quando visível */
  const video = document.querySelector('video.about__video');
  if (video) {
    if (reduce) { video.removeAttribute('autoplay'); video.pause(); }
    else if ('IntersectionObserver' in window) {
      new IntersectionObserver(([e]) => { if (e.isIntersecting) video.play().catch(() => {}); else video.pause(); }, { threshold: 0.1 }).observe(video);
    }
  }

  /* Fotos dos dentes: carrossel central (ref. GSAP showcase) */
  const stage = document.querySelector('[data-showcase]');
  if (stage) {
    const track = stage.querySelector('.showcase__track');
    const slides = [...track.children];
    const count = document.querySelector('[data-showcase-count]');
    const prev = document.querySelector('[data-showcase-prev]');
    const next = document.querySelector('[data-showcase-next]');
    let idx = 0, x = 0;
    const targetX = (i) => stage.clientWidth / 2 - (slides[i].offsetLeft + slides[i].offsetWidth / 2);
    const setX = (v, animate) => {
      x = v;
      if (hasGsap) gsap.to(track, { x: v, duration: animate && !reduce ? 0.9 : 0, ease: 'power3.out', overwrite: true });
      else track.style.transform = `translateX(${v}px)`;
    };
    const go = (i, animate = true) => {
      idx = (i + slides.length) % slides.length;
      slides.forEach((s, k) => { s.classList.toggle('is-active', k === idx); s.setAttribute('aria-hidden', k === idx ? 'false' : 'true'); });
      if (count) count.textContent = `${idx + 1} / ${slides.length}`;
      setX(targetX(idx), animate);
    };
    prev && prev.addEventListener('click', () => go(idx - 1));
    next && next.addEventListener('click', () => go(idx + 1));
    stage.addEventListener('keydown', (ev) => {
      if (ev.key === 'ArrowRight') { ev.preventDefault(); go(idx + 1); }
      if (ev.key === 'ArrowLeft') { ev.preventDefault(); go(idx - 1); }
    });
    slides.forEach((s, k) => s.addEventListener('click', () => { if (k !== idx && !moved) go(k); }));
    // Arrastar (mouse e toque)
    let startX = 0, baseX = 0, dragging = false, moved = false;
    stage.addEventListener('pointerdown', (ev) => {
      if (ev.button !== 0) return;
      dragging = true; moved = false; startX = ev.clientX; baseX = x;
      stage.setPointerCapture(ev.pointerId);
    });
    stage.addEventListener('pointermove', (ev) => {
      if (!dragging) return;
      const dx = ev.clientX - startX;
      if (Math.abs(dx) > 6) moved = true;
      if (moved) { x = baseX + dx; if (hasGsap) gsap.set(track, { x }); else track.style.transform = `translateX(${x}px)`; }
    });
    const end = (ev) => {
      if (!dragging) return;
      dragging = false;
      const dx = ev.clientX - startX;
      if (dx < -60) go(idx + 1); else if (dx > 60) go(idx - 1); else go(idx);
      setTimeout(() => { moved = false; }, 0);
    };
    stage.addEventListener('pointerup', end);
    stage.addEventListener('pointercancel', end);
    window.addEventListener('resize', debounce(() => go(idx, false), 120));
    window.addEventListener('load', () => go(idx, false));
    go(0, false);
  }

  /* Carrossel de avaliações */
  document.querySelectorAll('[data-carousel-nav]').forEach((nav) => {
    const track = document.getElementById(nav.dataset.carouselNav);
    if (!track) return;
    const prev = nav.querySelector('[data-prev]'), next = nav.querySelector('[data-next]'), count = nav.querySelector('.carousel-count');
    const items = () => [...track.children];
    const startX = () => track.getBoundingClientRect().left + (parseFloat(getComputedStyle(track).scrollPaddingLeft) || 0);
    const current = () => {
      const x = startX(); let idx = 0, best = Infinity;
      items().forEach((it, i) => { const d = Math.abs(it.getBoundingClientRect().left - x); if (d < best) { best = d; idx = i; } });
      return idx;
    };
    const update = () => {
      const max = track.scrollWidth - track.clientWidth - 4, atEnd = track.scrollLeft >= max;
      if (count) count.textContent = `${atEnd ? items().length : current() + 1}/${items().length}`;
      if (prev) prev.disabled = track.scrollLeft <= 4;
      if (next) next.disabled = atEnd;
    };
    const go = (dir) => {
      const list = items(), i = Math.min(Math.max(current() + dir, 0), list.length - 1);
      track.scrollTo({ left: track.scrollLeft + list[i].getBoundingClientRect().left - startX(), behavior: reduce ? 'auto' : 'smooth' });
    };
    prev && prev.addEventListener('click', () => go(-1));
    next && next.addEventListener('click', () => go(1));
    track.addEventListener('scroll', debounce(update, 60), { passive: true });
    track.addEventListener('keydown', (ev) => {
      if (ev.key === 'ArrowRight') { ev.preventDefault(); go(1); }
      if (ev.key === 'ArrowLeft') { ev.preventDefault(); go(-1); }
    });
    window.addEventListener('resize', debounce(update, 150), { passive: true });
    update();
  });

  /* FAQ: acordeão suave (padrão shadcn), um aberto por vez */
  document.querySelectorAll('[data-accordion]').forEach((acc) => {
    const items = [...acc.querySelectorAll('details')];
    const animate = (d, open) => {
      const body = d.querySelector('.faq__body, .acc__body');
      if (reduce || !hasGsap) { d.open = open; return; }
      if (open) {
        d.open = true;
        gsap.fromTo(body, { height: 0, opacity: 0 }, { height: 'auto', opacity: 1, duration: 0.45, ease: 'power2.out', clearProps: 'height' });
      } else {
        gsap.to(body, { height: 0, opacity: 0, duration: 0.35, ease: 'power2.inOut', onComplete: () => { d.open = false; gsap.set(body, { clearProps: 'all' }); } });
      }
    };
    items.forEach((d) => d.querySelector('summary').addEventListener('click', (ev) => {
      ev.preventDefault();
      const willOpen = !d.open;
      items.forEach((o) => { if (o !== d && o.open) animate(o, false); });
      animate(d, willOpen);
    }));
  });

  /* Ano no rodapé */
  document.querySelectorAll('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });

  /* Consentimento LGPD + GA4 (carrega só depois do "Aceitar") */
  const GA_ID = root.dataset.ga || '';
  const KEY = 'mauri-consent';
  const banner = document.getElementById('cookie');
  const read = () => { try { return localStorage.getItem(KEY); } catch (e) { return null; } };
  const write = (v) => { try { localStorage.setItem(KEY, v); } catch (e) { /* modo privado */ } };
  let gaLoaded = false;
  const loadGA = () => {
    if (gaLoaded || !/^G-[A-Z0-9]+$/.test(GA_ID)) return;
    gaLoaded = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', GA_ID, { anonymize_ip: true });
    const s = document.createElement('script');
    s.async = true; s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
    document.head.appendChild(s);
  };
  const choice = read();
  if (choice === 'accept') loadGA();
  if (banner && !choice && GA_ID) banner.hidden = false;
  if (banner) banner.addEventListener('click', (ev) => {
    const b = ev.target.closest('[data-cookie]'); if (!b) return;
    write(b.dataset.cookie); banner.hidden = true;
    if (b.dataset.cookie === 'accept') loadGA();
  });
  document.querySelectorAll('[data-cookie-open]').forEach((b) => b.addEventListener('click', () => {
    if (banner) { banner.hidden = false; banner.querySelector('button').focus(); }
  }));

  /* Evento de conversão: clique no WhatsApp (só registra se houve consentimento) */
  document.addEventListener('click', (ev) => {
    const a = ev.target.closest('a[data-wa]');
    if (a && gaLoaded && window.gtag) {
      window.gtag('event', 'whatsapp_click', { cta_local: a.dataset.wa, transport_type: 'beacon' });
    }
  });
})();
