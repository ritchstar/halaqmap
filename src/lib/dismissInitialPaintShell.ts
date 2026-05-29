/** يُزيل قشرة `hm-initial-paint` بعد رسم هيرو React لتجنّب وميض LCP على الجوال. */
export function dismissInitialPaintShell(heroEl?: HTMLElement | null) {
  const shell = document.getElementById('hm-initial-paint');
  if (!shell || shell.dataset.dismissing === '1') return;

  const fadeOut = () => {
    if (shell.dataset.dismissing === '1') return;
    shell.dataset.dismissing = '1';
    shell.style.transition = 'opacity 120ms ease';
    shell.style.opacity = '0';
    shell.style.pointerEvents = 'none';
    window.setTimeout(() => shell.remove(), 130);
  };

  const resolveHero = () =>
    heroEl ?? document.querySelector<HTMLElement>('#root h1');

  const waitForHero = (attempts = 0) => {
    const hero = resolveHero();
    if (hero && hero.getBoundingClientRect().height > 0) {
      requestAnimationFrame(() => requestAnimationFrame(fadeOut));
      return;
    }
    if (attempts > 180) {
      fadeOut();
      return;
    }
    requestAnimationFrame(() => waitForHero(attempts + 1));
  };

  waitForHero();
  window.setTimeout(fadeOut, 5000);
}
