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
  const parts = [tq, tn, tr];
  const EASE = 'cubic-bezier(.2, .7, .2, 1)';
  const setParts = (x, opacity, ms) => {
    parts.forEach(el => {
      el.style.transition = ms ? `opacity ${ms}ms ease, transform ${ms}ms ${EASE}` : 'none';
      el.style.transform = x ? `translateX(${x}px)` : '';
      el.style.opacity = opacity;
    });
  };
  let swapTimer = null, pendingApply = null;
  // dir: 1 = next (content leaves left, new one enters from right), -1 = prev.
  function showTesti(i, dir = 1) {
    ti = (i + testimonials.length) % testimonials.length;
    // Dots answer immediately; only the text waits for the cross-fade.
    [...dots].forEach((d, idx) => d.classList.toggle('on', idx === ti));
    const apply = () => {
      renderQuote(testimonials[ti].q);
      tn.textContent = testimonials[ti].n;
      tr.textContent = testimonials[ti].r;
    };
    // No motion: swap instantly, no cross-fade.
    if (reduceMotion.matches) { apply(); return; }
    // A new request supersedes any swap still in flight.
    clearTimeout(swapTimer);
    pendingApply = apply;
    setParts(-dir * 24, 0, 200);
    swapTimer = setTimeout(() => {
      pendingApply = null;
      apply();
      setParts(dir * 24, 0, 0);
      tq.offsetWidth; // commit the off-screen start position before animating in
      setParts(0, 1, 320);
    }, 200);
  }
  nextBtn.addEventListener('click', () => showTesti(ti + 1, 1));
  prevBtn.addEventListener('click', () => showTesti(ti - 1, -1));

  // Touch swipe: track the finger 1:1, then decide by velocity sign or distance.
  if (!reduceMotion.matches) {
    let start = null, dragging = false, samples = [];
    const reset = () => { start = null; dragging = false; samples = []; };
    tq.addEventListener('pointerdown', (e) => {
      if (e.pointerType === 'mouse') return;
      start = { x: e.clientX, y: e.clientY, id: e.pointerId };
      samples = [{ x: e.clientX, t: e.timeStamp }];
    });
    tq.addEventListener('pointermove', (e) => {
      if (!start || e.pointerId !== start.id) return;
      const dx = e.clientX - start.x, dy = e.clientY - start.y;
      if (!dragging) {
        // ~10px hysteresis before committing to a direction.
        if (Math.abs(dy) > 10 && Math.abs(dy) > Math.abs(dx)) { reset(); return; }
        if (Math.abs(dx) < 10) return;
        dragging = true;
        // Grabbed mid-swap: land the new text now so the finger holds it.
        clearTimeout(swapTimer);
        if (pendingApply) { pendingApply(); pendingApply = null; }
        tq.setPointerCapture(e.pointerId);
      }
      samples.push({ x: e.clientX, t: e.timeStamp });
      if (samples.length > 5) samples.shift();
      setParts(dx, Math.max(.25, 1 - Math.abs(dx) / 400), 0);
    });
    const release = (e) => {
      if (!start || e.pointerId !== start.id) return;
      if (dragging) {
        const dx = e.clientX - start.x;
        const first = samples[0], last = samples[samples.length - 1];
        const v = last.t > first.t ? (last.x - first.x) / (last.t - first.t) : 0; // px/ms
        const flick = Math.abs(v) > .3 ? Math.sign(v) : 0;
        const dir = flick || (Math.abs(dx) > 80 ? Math.sign(dx) : 0);
        if (e.type === 'pointerup' && dir) {
          showTesti(ti - dir, -dir);
        } else {
          setParts(0, 1, 280);
        }
      }
      reset();
    };
    tq.addEventListener('pointerup', release);
    tq.addEventListener('pointercancel', release);
  }
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
