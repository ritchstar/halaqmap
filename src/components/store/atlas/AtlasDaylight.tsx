/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * ضوء الأطلس: طبقة نهارية هادئة خلف الخلفية الليلية. ليست Light Mode.
 */
import { useEffect, useRef } from 'react';

function atlasDaylightShouldAnimate(): boolean {
  if (typeof window === 'undefined') return false;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
  const nav = navigator as Navigator & { connection?: { saveData?: boolean } };
  if (nav.connection?.saveData) return false;
  if ((navigator.hardwareConcurrency || 8) <= 2) return false;
  return true;
}

export function AtlasDaylight({ enabled }: { enabled: boolean }) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!enabled) return;
    const root = rootRef.current;
    if (!root) return;

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const pointerQuery = window.matchMedia('(hover: hover) and (pointer: fine)');
    let frame = 0;
    let listening = false;

    const apply = (px: number, py: number, sy: number) => {
      root.style.setProperty('--atlas-px', `${px}px`);
      root.style.setProperty('--atlas-py', `${py}px`);
      root.style.setProperty('--atlas-sy', `${sy}px`);
    };

    const onPointer = (event: PointerEvent) => {
      if (!pointerQuery.matches) return;
      const nx = Math.max(-12, Math.min(12, ((event.clientX / window.innerWidth) - 0.5) * 24));
      const ny = Math.max(-12, Math.min(12, ((event.clientY / window.innerHeight) - 0.5) * 24));
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const sy = Number.parseFloat(root.style.getPropertyValue('--atlas-sy') || '0') || 0;
        apply(nx, ny, sy);
      });
    };

    const onScroll = () => {
      const t = Math.min(1, window.scrollY / 1100);
      const sy = (t - 0.35) * 18;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const px = Number.parseFloat(root.style.getPropertyValue('--atlas-px') || '0') || 0;
        const py = Number.parseFloat(root.style.getPropertyValue('--atlas-py') || '0') || 0;
        apply(px, py, sy);
      });
    };

    const detach = () => {
      if (!listening) return;
      listening = false;
      cancelAnimationFrame(frame);
      window.removeEventListener('pointermove', onPointer);
      window.removeEventListener('scroll', onScroll);
    };

    const syncMotion = () => {
      const animate = atlasDaylightShouldAnimate();
      root.dataset.atlasMotion = animate ? 'live' : 'static';
      if (!animate) {
        apply(0, 0, 0);
        detach();
        return;
      }
      if (listening) return;
      listening = true;
      if (pointerQuery.matches) window.addEventListener('pointermove', onPointer, { passive: true });
      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
    };

    syncMotion();
    motionQuery.addEventListener('change', syncMotion);
    return () => {
      motionQuery.removeEventListener('change', syncMotion);
      detach();
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div ref={rootRef} className="store-atlas-daylight" aria-hidden>
      <div className="store-atlas-daylight__day" />
      <div className="store-atlas-daylight__wave" />
      <div className="store-atlas-daylight__grain" />
    </div>
  );
}
