// Blog client behaviour. Lives in /public and is loaded as an external module so
// it satisfies the production CSP (`script-src 'self'` blocks inline scripts).

// 1) Frosted nav once the page scrolls — mirrors the homepage behaviour.
(function () {
  const nav = document.getElementById("topnav");
  if (!nav) return;
  const onScroll = () => nav.classList.toggle("scrolled", window.scrollY > 12);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
})();

// 2) Scrollspy: highlight the TOC entry for the section currently in view.
(function () {
  const links = new Map();
  document.querySelectorAll('.post-toc a[href^="#"]').forEach((a) => {
    const id = decodeURIComponent(a.getAttribute("href").slice(1));
    links.set(id, a);
  });

  const headings = [...links.keys()]
    .map((id) => document.getElementById(id))
    .filter((el) => el !== null);
  if (headings.length === 0) return;

  let activeId = null;
  const setActive = (id) => {
    if (id === activeId) return;
    activeId = id;
    links.forEach((a) => a.classList.remove("active"));
    const a = links.get(id);
    if (a) a.classList.add("active");
  };

  const observer = new IntersectionObserver(
    (entries) => {
      // The heading nearest the top of the reading band wins.
      const intersecting = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
      if (intersecting.length > 0) setActive(intersecting[0].target.id);
    },
    // Active zone: just below the fixed nav, down to the top third of the viewport.
    { rootMargin: "-100px 0px -66% 0px", threshold: 0 },
  );

  headings.forEach((h) => observer.observe(h));
  // Seed the first entry so something is lit before the first scroll.
  setActive(headings[0].id);
})();
