/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * بوابة تشغيل إشارات الأطلس: ظهور القسم، تبويب ظاهر، وتفضيل تقليل الحركة.
 */

export function atlasSignalsAllowed(): boolean {
  if (typeof window === 'undefined') return false;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
  if (document.hidden) return false;
  const nav = navigator as Navigator & { connection?: { saveData?: boolean } };
  if (nav.connection?.saveData) return false;
  if ((navigator.hardwareConcurrency || 8) <= 2) return false;
  return true;
}

export function bindAtlasSignalPlayback(svg: SVGSVGElement | null, host: HTMLElement | null): () => void {
  if (!svg || !host) return () => {};

  let intersecting = false;

  const sync = () => {
    const live = intersecting && atlasSignalsAllowed();
    if (live) svg.unpauseAnimations();
    else svg.pauseAnimations();
    host.dataset.atlasSignals = live ? 'live' : 'static';
  };

  const io = new IntersectionObserver(
    (entries) => {
      intersecting = entries.some((entry) => entry.isIntersecting);
      sync();
    },
    { threshold: 0.35 },
  );
  io.observe(host);

  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  document.addEventListener('visibilitychange', sync);
  motionQuery.addEventListener('change', sync);
  sync();

  return () => {
    io.disconnect();
    document.removeEventListener('visibilitychange', sync);
    motionQuery.removeEventListener('change', sync);
  };
}

export type AtlasSignalPoint = { x: number; y: number };

export function atlasSignalCenter(host: DOMRect, el: Element): AtlasSignalPoint {
  const box = el.getBoundingClientRect();
  return {
    x: box.left + box.width / 2 - host.left,
    y: box.top + box.height / 2 - host.top,
  };
}
