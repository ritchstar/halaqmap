/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * لقطة تسويقية. إن وُجد شريط صور تتبدل اللقطات أثناء التصفح.
 */
import { useEffect, useMemo, useState } from 'react';
import {
  STORE_MARKETING_REEL_MS,
  storeMarketingFrames,
  type StoreMarketingReelId,
} from '@/config/storeMarketingReels';
import { cn } from '@/lib/utils';

type StoreShotProps = {
  src?: string;
  srcs?: readonly string[];
  reel?: StoreMarketingReelId;
  alt: string;
  className?: string;
  imgClassName?: string;
  eager?: boolean;
  intervalMs?: number;
};

function resolveFrames(src?: string, srcs?: readonly string[], reel?: StoreMarketingReelId): string[] {
  if (srcs && srcs.length > 0) return [...srcs];
  if (reel) return [...storeMarketingFrames(reel)];
  if (src) return [src];
  return [];
}

function nearbyFrames(frames: readonly string[], index: number): string[] {
  if (frames.length <= 3) return [...frames];
  const prev = frames[(index + frames.length - 1) % frames.length];
  const current = frames[index];
  const next = frames[(index + 1) % frames.length];
  return [prev, current, next].filter((item, i, list) => list.indexOf(item) === i);
}

export function StoreShot({
  src,
  srcs,
  reel,
  alt,
  className,
  imgClassName,
  eager = false,
  intervalMs = STORE_MARKETING_REEL_MS,
}: StoreShotProps) {
  const frames = useMemo(() => resolveFrames(src, srcs, reel), [src, srcs, reel]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
  }, [frames]);

  useEffect(() => {
    if (frames.length < 2) return undefined;
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (media.matches) return undefined;
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % frames.length);
    }, intervalMs);
    return () => window.clearInterval(timer);
  }, [frames.length, intervalMs]);

  if (!frames.length) return null;

  if (frames.length === 1) {
    return (
      <div className={cn('overflow-hidden bg-black/40', className)}>
        <img
          src={frames[0]}
          alt={alt}
          className={cn('h-full w-full object-cover', imgClassName)}
          loading={eager ? 'eager' : 'lazy'}
          decoding="async"
        />
      </div>
    );
  }

  const shown = nearbyFrames(frames, index);
  const current = frames[index] ?? frames[0];

  return (
    <div className={cn('relative overflow-hidden bg-black/40', className)}>
      {shown.map((frame) => (
        <img
          key={frame}
          src={frame}
          alt={frame === current ? alt : ''}
          aria-hidden={frame !== current}
          className={cn(
            'absolute inset-0 h-full w-full object-cover transition-opacity duration-700',
            frame === current ? 'opacity-100' : 'opacity-0',
            imgClassName,
          )}
          loading={eager && frame === current ? 'eager' : 'lazy'}
          decoding="async"
        />
      ))}
    </div>
  );
}
