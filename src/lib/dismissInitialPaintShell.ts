/** يُزيل قشرة `hm-initial-paint` بعد رسم هيرو React لتجنّب وميض LCP على الجوال. */
export function dismissInitialPaintShell(heroEl: HTMLElement | null) {
  const shell = document.getElementById('hm-initial-paint');
  if (!shell) return;

  const fadeOut = () => {
    shell.style.transition = 'opacity 120ms ease';
    shell.style.opacity = '0';
    shell.style.pointerEvents = 'none';
    window.setTimeout(() => shell.remove(), 130);
  };

  const waitForHero = (attempts = 0) => {
    if (heroEl && heroEl.getBoundingClientRect().height > 0) {
      requestAnimationFrame(() => requestAnimationFrame(fadeOut));
      return;
    }
    if (attempts > 120) {
      fadeOut();
      return;
    }
    requestAnimationFrame(() => waitForHero(attempts + 1));
  };

  waitForHero();
}
