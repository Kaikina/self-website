// ───────── scroll reveals ─────────
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('in');
      io.unobserve(e.target);
    }
  });
}, { threshold: .12, rootMargin: '0px 0px -8% 0px' });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));

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
    tq.style.opacity = 0;
    tn.style.opacity = 0;
    tr.style.opacity = 0;
    setTimeout(() => {
      renderQuote(testimonials[ti].q);
      tn.textContent = testimonials[ti].n;
      tr.textContent = testimonials[ti].r;
      tq.style.opacity = 1;
      tn.style.opacity = 1;
      tr.style.opacity = 1;
      [...dots].forEach((d, idx) => d.classList.toggle('on', idx === ti));
    }, 240);
  }
  [tq, tn, tr].forEach(el => { el.style.transition = 'opacity .24s ease'; });
  nextBtn.addEventListener('click', () => showTesti(ti + 1));
  prevBtn.addEventListener('click', () => showTesti(ti - 1));
}

// ───────── burger / mobile menu ─────────
const burger = document.getElementById('burger');
const mobileMenu = document.getElementById('mobile-menu');
if (burger && mobileMenu) {
  const labelOpen = burger.dataset.labelOpen;
  const labelClose = burger.dataset.labelClose;
  const setMenu = (open) => {
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? labelClose : labelOpen);
    mobileMenu.classList.toggle('open', open);
    mobileMenu.setAttribute('aria-hidden', String(!open));
    document.body.classList.toggle('menu-open', open);
  };
  burger.addEventListener('click', () => {
    setMenu(burger.getAttribute('aria-expanded') !== 'true');
  });
  const closeBtn = document.getElementById('mm-close');
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

// ───────── smooth-scroll polite offset for fixed nav ─────────
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const id = a.getAttribute('href').slice(1);
    if (!id) return;
    const target = document.getElementById(id);
    if (!target) return;
    e.preventDefault();
    const top = target.getBoundingClientRect().top + window.scrollY - 40;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});
