/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * بانوراما تتبدل تلقائياً مع إشراق خفيف. الشريط يُمرَّر حسب المنتج.
 */
import { useEffect, useState } from 'react';
import { STORE_LIVE_PANORAMA_MS, STORE_LIVE_PANORAMAS } from '@/config/storeLiveAtmosphere';
import { cn } from '@/lib/utils';

function nearbyFrames(frames: readonly string[], index: number): Array<{ src: string; i: number }> {
  if (frames.length <= 4) {
    return frames.map((src, i) => ({ src, i }));
  }
  const picks = [
    (index + frames.length - 1) % frames.length,
    index,
    (index + 1) % frames.length,
  ];
  const unique = picks.filter((item, i) => picks.indexOf(item) === i);
  return unique.map((i) => ({ src: frames[i] ?? frames[0], i }));
}

export function StoreLivePanoramaCycle({
  className,
  intervalMs = STORE_LIVE_PANORAMA_MS,
  frames = STORE_LIVE_PANORAMAS,
}: {
  className?: string;
  intervalMs?: number;
  frames?: readonly string[];
}) {
  const [index, setIndex] = useState(0);
  const list = frames.length ? frames : STORE_LIVE_PANORAMAS;

  useEffect(() => {
    setIndex(0);
  }, [list]);

  useEffect(() => {
    if (list.length < 2) return undefined;
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (media.matches) return undefined;
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % list.length);
    }, intervalMs);
    return () => window.clearInterval(timer);
  }, [intervalMs, list.length]);

  const shown = nearbyFrames(list, index);

  return (
    <div className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)} aria-hidden>
      {shown.map(({ src, i }) => (
        <img
          key={src}
          src={src}
          alt=""
          className={cn(
            'absolute inset-0 h-full w-full object-cover transition-opacity duration-1000',
            i === index ? 'opacity-80' : 'opacity-0',
          )}
        />
      ))}
      <div className="store-live-lights absolute inset-0" />
      <div className="store-live-sparkle absolute inset-0" />
    </div>
  );
}
