import { useId } from 'react';
import { useReducedMotion } from 'framer-motion';
import { PULSE_MAP_KINGDOM_OUTLINE_PATHS } from '@/modules/pulse-map/lib/pulseMapGeo';

export type PulseMapOrnamentVariant = 'public' | 'admin' | 'cyber';

type Props = {
  cx: number;
  cy: number;
  variant?: PulseMapOrnamentVariant;
  /** Clip to kingdom silhouette — defaults to pulse-map outline paths. */
  clipPaths?: readonly string[];
  sweepRadius?: number;
};

const DEFAULT_SWEEP_RADIUS = 520;

const VARIANT_STYLE: Record<
  PulseMapOrnamentVariant,
  {
    ringStroke: string;
    pulseStroke: string;
    beamLine: string;
    hubStops: [string, string, string];
    beamStops: [string, string, string];
    sweepSeconds: number;
  }
> = {
  public: {
    ringStroke: 'rgba(56,189,248,0.14)',
    pulseStroke: 'rgba(125,211,252,0.35)',
    beamLine: '#a5f3fc',
    hubStops: ['#fbbf24', '#38bdf8', '#0ea5e9'],
    beamStops: ['#67e8f9', '#22d3ee', '#0891b2'],
    sweepSeconds: 22,
  },
  admin: {
    ringStroke: 'rgba(167,139,250,0.18)',
    pulseStroke: 'rgba(196,181,253,0.38)',
    beamLine: '#c4b5fd',
    hubStops: ['#fbbf24', '#a78bfa', '#7c3aed'],
    beamStops: ['#ddd6fe', '#8b5cf6', '#5b21b6'],
    sweepSeconds: 18,
  },
  cyber: {
    ringStroke: 'rgba(251,191,36,0.16)',
    pulseStroke: 'rgba(34,211,238,0.38)',
    beamLine: '#fcd34d',
    hubStops: ['#fbbf24', '#22d3ee', '#0891b2'],
    beamStops: ['#fde68a', '#22d3ee', '#0e7490'],
    sweepSeconds: 16,
  },
};

/** مسح راداري محوري من الرياض — طبقة SVG زخرفية فقط */
export function PulseMapKingdomSweep({
  cx,
  cy,
  variant = 'public',
  clipPaths = PULSE_MAP_KINGDOM_OUTLINE_PATHS,
  sweepRadius = DEFAULT_SWEEP_RADIUS,
}: Props) {
  const reduceMotion = useReducedMotion();
  const uid = useId().replace(/:/g, '');
  const style = VARIANT_STYLE[variant];
  const sweepDur = reduceMotion ? '0s' : `${style.sweepSeconds}s`;
  const pulseDur = reduceMotion ? '0s' : '4.8s';
  const clipId = `pm-sweep-kingdom-clip-${uid}`;
  const hubId = `pm-sweep-hub-${uid}`;
  const beamId = `pm-sweep-beam-${uid}`;
  const glowId = `pm-sweep-glow-${uid}`;

  return (
    <g aria-hidden clipPath={`url(#${clipId})`}>
      <defs>
        <clipPath id={clipId}>
          {clipPaths.map((d, idx) => (
            <path key={`clip-${idx}`} d={d} />
          ))}
        </clipPath>

        <radialGradient id={hubId} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={style.hubStops[0]} stopOpacity="0.95" />
          <stop offset="35%" stopColor={style.hubStops[1]} stopOpacity="0.55" />
          <stop offset="100%" stopColor={style.hubStops[2]} stopOpacity="0" />
        </radialGradient>

        <radialGradient id={beamId} cx="0%" cy="50%" r="100%">
          <stop offset="0%" stopColor={style.beamStops[0]} stopOpacity="0.55" />
          <stop offset="45%" stopColor={style.beamStops[1]} stopOpacity="0.24" />
          <stop offset="100%" stopColor={style.beamStops[2]} stopOpacity="0" />
        </radialGradient>

        <filter id={glowId} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {[140, 240, 340, 440].map((r, i) => (
        <circle
          key={`ring-${r}`}
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={style.ringStroke}
          strokeWidth={1.2 - i * 0.15}
          opacity={0.85 - i * 0.12}
        />
      ))}

      {!reduceMotion
        ? [180, 300, 420].map((baseR, i) => (
            <circle
              key={`pulse-${baseR}`}
              cx={cx}
              cy={cy}
              r={baseR}
              fill="none"
              stroke={style.pulseStroke}
              strokeWidth={1.5}
            >
              <animate attributeName="r" values={`${baseR};${baseR + 90};${baseR}`} dur={pulseDur} begin={`${i * 1.6}s`} repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.45;0;0.45" dur={pulseDur} begin={`${i * 1.6}s`} repeatCount="indefinite" />
            </circle>
          ))
        : null}

      <g filter={`url(#${glowId})`}>
        <g transform={`translate(${cx} ${cy})`}>
          {!reduceMotion ? (
            <g>
              <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur={sweepDur} repeatCount="indefinite" />
              <path
                d={`M 0 0 L 0 ${-sweepRadius} A ${sweepRadius} ${sweepRadius} 0 0 1 ${sweepRadius * Math.sin((28 * Math.PI) / 180)} ${-sweepRadius * Math.cos((28 * Math.PI) / 180)} Z`}
                fill={`url(#${beamId})`}
                opacity={variant === 'admin' || variant === 'cyber' ? 0.78 : 0.72}
              />
              <path
                d={`M 0 0 L 0 ${-sweepRadius} A ${sweepRadius} ${sweepRadius} 0 0 1 ${sweepRadius * Math.sin((12 * Math.PI) / 180)} ${-sweepRadius * Math.cos((12 * Math.PI) / 180)} Z`}
                fill={`url(#${beamId})`}
                opacity={0.38}
              />
              <line x1={0} y1={0} x2={0} y2={-sweepRadius} stroke={style.beamLine} strokeWidth={1.4} opacity={0.85} />
            </g>
          ) : (
            <circle cx={0} cy={0} r={sweepRadius * 0.55} fill={`url(#${beamId})`} opacity={0.12} />
          )}
        </g>
      </g>

      <circle
        cx={cx}
        cy={cy}
        r={22}
        fill={`url(#${hubId})`}
        opacity={variant === 'public' ? 0.28 : 0.34}
      />
      <ellipse cx={cx} cy={cy + 4} rx={12} ry={4} fill="rgba(8,47,73,0.35)" opacity={0.6} />
    </g>
  );
}
