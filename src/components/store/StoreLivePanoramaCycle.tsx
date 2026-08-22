/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * بانوراما تتبدل تلقائياً مع إشراق خفيف. الشريط يُمرَّر حسب المنتج.
 * لا تُحمَّل اللقطة التالية إلا بعد ظهور الشاشة.
 */
import { useEffect, useRef, useState } from 'react';
import { STORE_LIVE_PANORAMA_MS, STORE_LIVE_PANORAMAS } from '@/config/storeLiveAtmosphere';
import { cn } from '@/lib/utils';

export function StoreLivePanoramaCycle({
  className,
  intervalMs = STORE_LIVE_PANORAMA_MS,
  frames = STORE_LIVE_PANORAMAS,
}: {
  className?: string;
  intervalMs?: number;
  frames?: readonly string[];
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [active, setActive] = useState(false);
  const list = frames.length ? frames : STORE_LIVE_PANORAMAS;
  const current = list[index] ?? list[0];
  const next = list.length > 1 ? list[(index + 1) % list.length] : null;
  const shown = active && next && next !== current ? [current, next] : current ? [current] : [];

  useEffect(() => {
    setIndex(0);
  }, [list]);

  useEffect(() => {
    const node = rootRef.current;
    if (!node || typeof IntersectionObserver === 'undefined') {
      setActive(true);
      return undefined;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        setActive(Boolean(entry?.isIntersecting));
      },
      { rootMargin: '80px 0px', threshold: 0.01 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!active || list.length < 2) return undefined;
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (media.matches) return undefined;
    const timer = window.setInterval(() => {
      setIndex((currentIndex) => (currentIndex + 1) % list.length);
    }, intervalMs);
    return () => window.clearInterval(timer);
  }, [active, intervalMs, list.length]);

  return (
    <div
      ref={rootRef}
      className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)}
      aria-hidden
    >
      {shown.map((src) => (
        <img
          key={src}
          src={src}
          alt=""
          className={cn(
            'absolute inset-0 h-full w-full object-cover transition-opacity duration-1000',
            src === current ? 'opacity-80' : 'opacity-0',
          )}
          loading={src === current ? 'eager' : 'lazy'}
          decoding="async"
        />
      ))}
      <div className="store-live-lights absolute inset-0" />
      <div className="store-live-sparkle absolute inset-0" />
    </div>
  );
}
