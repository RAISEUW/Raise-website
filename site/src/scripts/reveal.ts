export function setupReveal() {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const reveals = document.querySelectorAll<HTMLElement>('.reveal:not(.visible)');
  if (!reveals.length) return;

  if (prefersReducedMotion) {
    // ANI-04: don't leave content invisible for reduced-motion users
    reveals.forEach((el) => el.classList.add('visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) =>
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          observer.unobserve(e.target);
        }
      }),
    { threshold: 0.15, rootMargin: '0px 0px -10% 0px' },
  );
  reveals.forEach((el) => observer.observe(el));
}
