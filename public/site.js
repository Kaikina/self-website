const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

// ───────── scroll reveals ─────────
const reveals = document.querySelectorAll('.reveal');
if (reduceMotion.matches) {
  // No motion: show everything immediately, skip the observer.
  reveals.forEach(el => el.classList.add('in'));
} else {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    });
  }, { threshold: .12, rootMargin: '0px 0px -8% 0px' });
  reveals.forEach(el => io.observe(el));
}

// ───────── nav state ─────────
const nav = document.getElementById('topnav');
const onScroll = () => {
  const y = window.scrollY;
  nav.classList.toggle('scrolled', y > 40);
};
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// ───────── hero portrait parallax (smooth, transform-only) ─────────
const portrait = document.getElementById('portrait');
if (portrait && !reduceMotion.matches) {
  let target = 0, current = 0, rafId = null;
  function tick() {
    current += (target - current) * 0.08;
    portrait.style.setProperty('--py', current.toFixed(2) + 'px');
    if (Math.abs(target - current) > 0.1) {
      rafId = requestAnimationFrame(tick);
    } else {
      rafId = null;
    }
  }
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    if (y < window.innerHeight) {
      target = y * 0.18;
      if (!rafId) rafId = requestAnimationFrame(tick);
    }
  }, { passive: true });
}

// ───────── testimonials carousel ─────────
const testiHost = document.querySelector('.testi-right');
const testimonials = testiHost && testiHost.dataset.testimonials
  ? JSON.parse(testiHost.dataset.testimonials)
  : [];
const nextBtn = document.getElementById('next');
const prevBtn = document.getElementById('prev');
const dotsEl = document.getElementById('dots');
if (testimonials.length > 1 && nextBtn && prevBtn && dotsEl) {
  let ti = 0;
  const tq = document.getElementById('tq');
  const tn = document.getElementById('tn');
  const tr = document.getElementById('tr');
  const dots = dotsEl.children;
  const renderQuote = (text) => {
    tq.innerHTML = '';
    text.split('\n\n').forEach((p) => {
      const para = document.createElement('p');
      para.textContent = p;
      tq.appendChild(para);
    });
  };
  function showTesti(i) {
    ti = (i + testimonials.length) % testimonials.length;
    const apply = () => {
      renderQuote(testimonials[ti].q);
      tn.textContent = testimonials[ti].n;
      tr.textContent = testimonials[ti].r;
      tq.style.opacity = 1;
      tn.style.opacity = 1;
      tr.style.opacity = 1;
      [...dots].forEach((d, idx) => d.classList.toggle('on', idx === ti));
    };
    // No motion: swap instantly, no cross-fade.
    if (reduceMotion.matches) { apply(); return; }
    tq.style.opacity = 0;
    tn.style.opacity = 0;
    tr.style.opacity = 0;
    setTimeout(apply, 240);
  }
  if (!reduceMotion.matches) {
    [tq, tn, tr].forEach(el => { el.style.transition = 'opacity .24s ease'; });
  }
  nextBtn.addEventListener('click', () => showTesti(ti + 1));
  prevBtn.addEventListener('click', () => showTesti(ti - 1));
}

// ───────── burger / mobile menu ─────────
const burger = document.getElementById('burger');
const mobileMenu = document.getElementById('mobile-menu');
if (burger && mobileMenu) {
  const labelOpen = burger.dataset.labelOpen;
  const labelClose = burger.dataset.labelClose;
  const closeBtn = document.getElementById('mm-close');
  const setMenu = (open) => {
    const wasOpen = burger.getAttribute('aria-expanded') === 'true';
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? labelClose : labelOpen);
    mobileMenu.classList.toggle('open', open);
    mobileMenu.setAttribute('aria-hidden', String(!open));
    document.body.classList.toggle('menu-open', open);
    // Keep background content out of the tab order and the AT tree while open.
    document.querySelectorAll('main, footer').forEach(el => { el.inert = open; });
    // Move focus into the menu on open, restore it to the burger on close.
    if (open && !wasOpen) {
      (closeBtn || mobileMenu.querySelector('a'))?.focus();
    } else if (!open && wasOpen) {
      burger.focus();
    }
  };
  burger.addEventListener('click', () => {
    setMenu(burger.getAttribute('aria-expanded') !== 'true');
  });
  if (closeBtn) closeBtn.addEventListener('click', () => setMenu(false));
  mobileMenu.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => setMenu(false));
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && burger.getAttribute('aria-expanded') === 'true') {
      setMenu(false);
    }
  });
  window.matchMedia('(min-width: 861px)').addEventListener('change', (e) => {
    if (e.matches) setMenu(false);
  });
}
