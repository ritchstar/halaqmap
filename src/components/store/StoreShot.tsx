/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * لقطة تسويقية. الشريط لا يحمّل ولا يدور إلا عند ظهوره.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
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

function visibleFrames(frames: readonly string[], index: number, active: boolean): string[] {
  const current = frames[index] ?? frames[0];
  if (!current) return [];
  if (!active || frames.length < 2) return [current];
  const next = frames[(index + 1) % frames.length] ?? current;
  return next === current ? [current] : [current, next];
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
  const rootRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [active, setActive] = useState(eager);

  useEffect(() => {
    setIndex(0);
  }, [frames]);

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
    if (!active || frames.length < 2) return undefined;
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (media.matches) return undefined;
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % frames.length);
    }, intervalMs);
    return () => window.clearInterval(timer);
  }, [active, frames.length, intervalMs]);

  if (!frames.length) return null;

  const current = frames[index] ?? frames[0];
  const shown = visibleFrames(frames, index, active);

  return (
    <div ref={rootRef} className={cn('relative overflow-hidden bg-black/40', className)}>
      {shown.map((frame) => (
        <img
          key={frame}
          src={frame}
          alt={frame === current ? alt : ''}
          aria-hidden={frame !== current}
          className={cn(
            shown.length === 1
              ? 'h-full w-full object-cover'
              : 'absolute inset-0 h-full w-full object-cover transition-opacity duration-700',
            shown.length > 1 && (frame === current ? 'opacity-100' : 'opacity-0'),
            imgClassName,
          )}
          loading={eager && frame === current ? 'eager' : 'lazy'}
          fetchPriority={eager && frame === current ? 'high' : 'low'}
          decoding="async"
        />
      ))}
    </div>
  );
}
