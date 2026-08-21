/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * سبع بانوراما تتبدل تلقائياً مع إشراق خفيف.
 */
import { useEffect, useState } from 'react';
import { STORE_LIVE_PANORAMA_MS, STORE_LIVE_PANORAMAS } from '@/config/storeLiveAtmosphere';
import { cn } from '@/lib/utils';

export function StoreLivePanoramaCycle({
  className,
  intervalMs = STORE_LIVE_PANORAMA_MS,
}: {
  className?: string;
  intervalMs?: number;
}) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % STORE_LIVE_PANORAMAS.length);
    }, intervalMs);
    return () => window.clearInterval(timer);
  }, [intervalMs]);

  return (
    <div className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)} aria-hidden>
      {STORE_LIVE_PANORAMAS.map((src, i) => (
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
