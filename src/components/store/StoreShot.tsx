/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * لقطة تسويقية. الشريط لا يحمّل ولا يدور إلا عند ظهوره.
 * تحميل «الإطار التالي» يُؤجَّل بعد الرسم الأول حتى لا ينافس صورة LCP على الجوال.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  STORE_MARKETING_REEL_MS,
  storeMarketingFrames,
  type StoreMarketingReelId,
} from '@/config/storeMarketingReels';
import { STORE_SHOT_SIZES, storeResponsiveWebpSrcSet } from '@/lib/storeResponsiveImage';
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

function visibleFrames(
  frames: readonly string[],
  index: number,
  active: boolean,
  preloadNext: boolean,
): string[] {
  const current = frames[index] ?? frames[0];
  if (!current) return [];
  if (!active || frames.length < 2 || !preloadNext) return [current];
  const next = frames[(index + 1) % frames.length] ?? current;
  return next === current ? [current] : [current, next];
}

function ShotFrame({
  frame,
  isCurrent,
  alt,
  solo,
  imgClassName,
  eager,
}: {
  frame: string;
  isCurrent: boolean;
  alt: string;
  solo: boolean;
  imgClassName?: string;
  eager: boolean;
}) {
  const webpSrcSet = storeResponsiveWebpSrcSet(frame);
  const loading = eager && isCurrent ? 'eager' : 'lazy';
  const fetchPriority = eager && isCurrent ? 'high' : 'low';
  const shellClass = cn(
    solo
      ? 'block h-full w-full'
      : 'absolute inset-0 block h-full w-full transition-opacity duration-700',
    !solo && (isCurrent ? 'opacity-100' : 'opacity-0'),
  );
  const imageClass = cn('h-full w-full object-cover', imgClassName);

  if (!webpSrcSet) {
    return (
      <img
        src={frame}
        alt={isCurrent ? alt : ''}
        aria-hidden={!isCurrent}
        className={cn(shellClass, imageClass)}
        loading={loading}
        fetchPriority={fetchPriority}
        decoding="async"
      />
    );
  }

  return (
    <picture className={shellClass} aria-hidden={!isCurrent}>
      <source type="image/webp" srcSet={webpSrcSet} sizes={STORE_SHOT_SIZES} />
      <img
        src={frame}
        alt={isCurrent ? alt : ''}
        aria-hidden={!isCurrent}
        className={imageClass}
        sizes={STORE_SHOT_SIZES}
        loading={loading}
        fetchPriority={fetchPriority}
        decoding="async"
      />
    </picture>
  );
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
  // يؤجَّل تحميل «الإطار التالي» بعد الرسم الأول عمداً — الإطار الحالي (خصوصاً
  // إن كان eager) هو مرشّح LCP، ولا يجب أن يتنافس مع صورة كاملة ثانية على
  // النطاق الترددي في أول لحظة من التحميل على الجوال. يبدأ التبديل التلقائي
  // أصلاً بعد intervalMs (٥٫٢ ثانية) فلا خسارة بصرية من هذا التأجيل القصير.
  const [preloadNext, setPreloadNext] = useState(false);

  useEffect(() => {
    setIndex(0);
  }, [frames]);

  useEffect(() => {
    setPreloadNext(false);
    if (frames.length < 2) return undefined;
    const timer = window.setTimeout(() => setPreloadNext(true), 1200);
    return () => window.clearTimeout(timer);
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
  const shown = visibleFrames(frames, index, active, preloadNext);

  return (
    <div ref={rootRef} className={cn('relative overflow-hidden bg-black/40', className)}>
      {shown.map((frame) => (
        <ShotFrame
          key={frame}
          frame={frame}
          isCurrent={frame === current}
          alt={alt}
          solo={shown.length === 1}
          imgClassName={imgClassName}
          eager={eager}
        />
      ))}
    </div>
  );
}
