/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * إضاءات وشهب ملوّنة فوق قاعة العرض. بلا استيراد من App.
 */
import { useMemo } from 'react';
import { cn } from '@/lib/utils';

function seed(n: number) {
  const x = Math.sin(n * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

const METEOR_TONES = ['gold', 'rose', 'emerald', 'sapphire', 'amber', 'ivory'] as const;

export function StoreHallAtmosphere({
  voice = 'men',
  className,
}: {
  voice?: 'men' | 'women';
  className?: string;
}) {
  const meteors = useMemo(
    () =>
      Array.from({ length: 8 }, (_, i) => ({
        id: i,
        left: 6 + seed(i + 17) * 90,
        top: seed(i + 41) * 52,
        delay: 0.4 + seed(i + 71) * 9.5,
        duration: 4.8 + seed(i + 91) * 5.4,
        length: 72 + seed(i + 111) * 130,
        angle: -16 - seed(i + 131) * 28,
        tone: METEOR_TONES[i % METEOR_TONES.length],
      })),
    [],
  );
  const orbs = useMemo(
    () =>
      Array.from({ length: 4 }, (_, i) => ({
        id: i,
        left: 8 + seed(i + 201) * 74,
        top: 10 + seed(i + 221) * 62,
        size: 140 + seed(i + 241) * 160,
        delay: seed(i + 261) * 4,
        duration: 8 + seed(i + 281) * 6,
      })),
    [],
  );

  return (
    <div
      className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)}
      data-voice={voice}
      aria-hidden
    >
      <div className="wedding-hall-lights absolute inset-0" data-voice={voice} />
      <div className="store-live-sparkle absolute inset-0" />
      {orbs.map((orb) => (
        <span
          key={orb.id}
          className={cn('hall-orb', voice === 'women' && 'hall-orb--women')}
          style={{
            left: `${orb.left}%`,
            top: `${orb.top}%`,
            width: orb.size,
            height: orb.size,
            animationDelay: `${orb.delay}s`,
            animationDuration: `${orb.duration}s`,
          }}
        />
      ))}
      {meteors.map((meteor) => (
        <span
          key={meteor.id}
          className={cn('hall-meteor', `hall-meteor--${meteor.tone}`)}
          style={{
            left: `${meteor.left}%`,
            top: `${meteor.top}%`,
            width: meteor.length,
            animationDelay: `${meteor.delay}s`,
            animationDuration: `${meteor.duration}s`,
            ['--hall-meteor-angle' as string]: `${meteor.angle}deg`,
          }}
        />
      ))}
    </div>
  );
}
