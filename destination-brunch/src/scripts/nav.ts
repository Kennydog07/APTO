// Mobile navigation toggle (closes on Escape, on link tap and when resizing to desktop).
const btn = document.querySelector<HTMLButtonElement>('.menu-btn');
const nav = document.getElementById('site-nav');

if (btn && nav) {
  const set = (open: boolean) => {
    btn.setAttribute('aria-expanded', String(open));
    btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    nav.classList.toggle('open', open);
  };
  btn.addEventListener('click', () => set(btn.getAttribute('aria-expanded') !== 'true'));
  nav.addEventListener('click', (e) => {
    if ((e.target as HTMLElement).closest('a')) set(false);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && nav.classList.contains('open')) {
      set(false);
      btn.focus();
    }
  });
  matchMedia('(min-width: 861px)').addEventListener('change', (m) => m.matches && set(false));
}

// Product pages: show the sticky mobile buy bar once the main buy box scrolls away.
const bar = document.querySelector<HTMLElement>('.buybar');
const box = document.querySelector('.buybox');
if (bar && box && 'IntersectionObserver' in window) {
  new IntersectionObserver(([e]) => bar.classList.toggle('show', !e.isIntersecting && e.boundingClientRect.top < 0)).observe(box);
}
