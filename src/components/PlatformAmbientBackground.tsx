import { useReducedMotion } from 'framer-motion';
import type { CSSProperties } from 'react';
import { usePlatformAmbientOptional } from '@/context/PlatformAmbientContext';
import { cn } from '@/lib/utils';
import type { AmbientPhaseId } from '@/config/platformAmbientPhases';

type Variant = 'default' | 'partner';

type BlobSpec = {
  className: string;
  style?: CSSProperties;
  animate?: boolean;
};

const PHASE_BLOBS: Record<AmbientPhaseId, Record<Variant, BlobSpec[]>> = {
  layl: {
    default: [
      {
        className:
          'absolute -right-64 top-16 h-[520px] w-[520px] rounded-full opacity-55 blur-[150px]',
        style: { background: 'rgba(20,184,166,0.14)' },
      },
      {
        className:
          'absolute -left-48 bottom-8 h-[420px] w-[420px] rounded-full opacity-35 blur-[130px]',
        style: { background: 'rgba(212,175,55,0.10)' },
      },
      {
        className:
          'absolute left-1/2 top-[38%] h-[280px] w-[280px] -translate-x-1/2 rounded-full opacity-20 blur-[100px]',
        style: { background: 'rgba(34,211,238,0.08)' },
      },
    ],
    partner: [
      {
        className:
          'absolute -right-56 top-12 h-[480px] w-[480px] rounded-full opacity-50 blur-[140px]',
        style: { background: 'rgba(245,158,11,0.12)' },
      },
      {
        className:
          'absolute -left-40 bottom-6 h-[400px] w-[400px] rounded-full opacity-30 blur-[120px]',
        style: { background: 'rgba(20,184,166,0.10)' },
      },
    ],
  },
  fajr: {
    default: [
      {
        className:
          'absolute -top-32 right-0 h-[520px] w-[620px] rounded-full opacity-70 blur-[120px]',
        style: { background: 'rgba(251,146,60,0.22)' },
        animate: true,
      },
      {
        className:
          'absolute top-24 right-1/4 h-[360px] w-[360px] rounded-full opacity-45 blur-[100px]',
        style: { background: 'rgba(253,224,71,0.14)' },
      },
      {
        className:
          'absolute -left-40 bottom-0 h-[320px] w-[320px] rounded-full opacity-25 blur-[110px]',
        style: { background: 'rgba(20,184,166,0.10)' },
      },
    ],
    partner: [
      {
        className:
          'absolute -top-28 right-0 h-[500px] w-[580px] rounded-full opacity-65 blur-[115px]',
        style: { background: 'rgba(251,191,36,0.24)' },
        animate: true,
      },
      {
        className:
          'absolute top-20 right-1/3 h-[340px] w-[340px] rounded-full opacity-40 blur-[95px]',
        style: { background: 'rgba(245,158,11,0.16)' },
      },
    ],
  },
  dhuhr: {
    default: [
      {
        className:
          'absolute left-1/2 -top-52 h-[720px] w-[900px] -translate-x-1/2 rounded-full opacity-80 blur-[150px]',
        style: { background: 'rgba(253,224,71,0.16)' },
        animate: true,
      },
      {
        className:
          'absolute left-1/2 -top-44 h-[620px] w-[780px] -translate-x-1/2 rounded-full opacity-72 blur-[135px]',
        style: { background: 'rgba(45,212,191,0.24)' },
        animate: true,
      },
      {
        className:
          'absolute -right-52 top-1/3 h-[420px] w-[420px] rounded-full opacity-42 blur-[115px]',
        style: { background: 'rgba(125,211,252,0.16)' },
      },
      {
        className:
          'absolute -left-36 bottom-12 h-[340px] w-[340px] rounded-full opacity-30 blur-[105px]',
        style: { background: 'rgba(255,255,255,0.08)' },
      },
    ],
    partner: [
      {
        className:
          'absolute left-1/2 -top-48 h-[680px] w-[860px] -translate-x-1/2 rounded-full opacity-75 blur-[145px]',
        style: { background: 'rgba(253,224,71,0.14)' },
        animate: true,
      },
      {
        className:
          'absolute left-1/2 -top-40 h-[580px] w-[720px] -translate-x-1/2 rounded-full opacity-62 blur-[130px]',
        style: { background: 'rgba(251,191,36,0.18)' },
        animate: true,
      },
      {
        className:
          'absolute -right-48 top-1/4 h-[400px] w-[400px] rounded-full opacity-42 blur-[110px]',
        style: { background: 'rgba(45,212,191,0.16)' },
      },
      {
        className:
          'absolute -left-32 bottom-10 h-[300px] w-[300px] rounded-full opacity-28 blur-[100px]',
        style: { background: 'rgba(255,255,255,0.08)' },
      },
    ],
  },
  ghuroob: {
    default: [
      {
        className:
          'absolute -top-20 -left-48 h-[480px] w-[560px] rounded-full opacity-55 blur-[120px]',
        style: { background: 'rgba(251,146,60,0.20)' },
        animate: true,
      },
      {
        className:
          'absolute bottom-0 left-1/4 h-[360px] w-[420px] rounded-full opacity-40 blur-[110px]',
        style: { background: 'rgba(192,132,252,0.14)' },
      },
      {
        className:
          'absolute -right-40 top-1/3 h-[300px] w-[300px] rounded-full opacity-25 blur-[100px]',
        style: { background: 'rgba(20,184,166,0.08)' },
      },
    ],
    partner: [
      {
        className:
          'absolute -top-16 -left-44 h-[460px] w-[540px] rounded-full opacity-50 blur-[115px]',
        style: { background: 'rgba(245,158,11,0.22)' },
        animate: true,
      },
      {
        className:
          'absolute bottom-4 left-1/3 h-[340px] w-[400px] rounded-full opacity-38 blur-[105px]',
        style: { background: 'rgba(167,139,250,0.12)' },
      },
    ],
  },
};

type PlatformAmbientBackgroundProps = {
  variant?: Variant;
  className?: string;
};

export function PlatformAmbientBackground({
  variant = 'default',
  className,
}: PlatformAmbientBackgroundProps) {
  const reduceMotion = useReducedMotion();
  const ambient = usePlatformAmbientOptional();
  const phase: AmbientPhaseId = ambient?.effectivePhase ?? 'layl';
  const blobs = PHASE_BLOBS[phase][variant];
  const isBrightNoon = phase === 'dhuhr';

  return (
    <div
      className={cn('pointer-events-none fixed inset-0 z-0 overflow-hidden', className)}
      aria-hidden
    >
      {/* طبقة تدرج سطحية حسب الوضع */}
      <div className={cn('platform-ambient-surface absolute inset-0 transition-colors duration-[2000ms]')} />

      {isBrightNoon ? (
        <div className="platform-ambient-sun-wash absolute inset-0 transition-opacity duration-[2500ms]" />
      ) : null}

      {blobs.map((blob, i) => (
        <div
          key={`${phase}-${i}`}
          className={cn(
            blob.className,
            'transition-all duration-[2500ms] ease-in-out',
            blob.animate && !reduceMotion && 'platform-ambient-pulse',
          )}
          style={blob.style}
        />
      ))}

      {/* خط أفقي خفيف — فجر/غروب */}
      {(phase === 'fajr' || phase === 'ghuroob') && !reduceMotion && (
        <div
          className={cn(
            'platform-ambient-horizon absolute inset-x-0 h-px opacity-40',
            phase === 'fajr' ? 'top-[22%]' : 'top-[58%]',
          )}
        />
      )}
    </div>
  );
}
