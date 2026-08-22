/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * سماء ليلية لصفحة لاونجا1: نجوم وشهب غير منتظمة.
 */
import { useMemo } from 'react';
import { cn } from '@/lib/utils';

function seed(n: number) {
  const x = Math.sin(n * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

const STAR_COUNT = 86;
const METEOR_COUNT = 7;

export function StoreLoungeNightSky({ className, fixed = true }: { className?: string; fixed?: boolean }) {
  const stars = useMemo(
    () =>
      Array.from({ length: STAR_COUNT }, (_, i) => ({
        id: i,
        left: seed(i + 1) * 100,
        top: seed(i + 41) * 100,
        size: 0.7 + seed(i + 77) * 2.4,
        delay: seed(i + 13) * 6.4,
        duration: 2.1 + seed(i + 29) * 4.8,
        warm: seed(i + 53) > 0.62,
      })),
    [],
  );
  const meteors = useMemo(
    () =>
      Array.from({ length: METEOR_COUNT }, (_, i) => ({
        id: i,
        left: 8 + seed(i + 101) * 92,
        top: seed(i + 131) * 58,
        delay: 1.2 + seed(i + 151) * 11,
        duration: 5.6 + seed(i + 171) * 6.2,
        length: 88 + seed(i + 191) * 110,
        angle: -18 - seed(i + 211) * 26,
      })),
    [],
  );

  return (
    <div
      className={cn(
        'lounge-night-sky pointer-events-none overflow-hidden',
        fixed ? 'fixed inset-0 z-0' : 'absolute inset-0',
        className,
      )}
      aria-hidden
    >
      {stars.map((star) => (
        <span
          key={star.id}
          className={cn('lounge-star', star.warm && 'lounge-star--warm')}
          style={{
            left: `${star.left}%`,
            top: `${star.top}%`,
            width: star.size,
            height: star.size,
            animationDelay: `${star.delay}s`,
            animationDuration: `${star.duration}s`,
          }}
        />
      ))}
      {meteors.map((meteor) => (
        <span
          key={meteor.id}
          className="lounge-meteor"
          style={{
            left: `${meteor.left}%`,
            top: `${meteor.top}%`,
            width: meteor.length,
            animationDelay: `${meteor.delay}s`,
            animationDuration: `${meteor.duration}s`,
            ['--lounge-meteor-angle' as string]: `${meteor.angle}deg`,
          }}
        />
      ))}
    </div>
  );
}
