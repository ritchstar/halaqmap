import { useId } from 'react';
import { useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { PulseMapOrnamentVariant } from '@/modules/pulse-map/components/PulseMapKingdomSweep';

type Props = {
  className?: string;
  variant?: PulseMapOrnamentVariant;
};

const CARDINALS = [
  { label: 'ش', angle: 0 },
  { label: 'ق', angle: 90 },
  { label: 'ج', angle: 180 },
  { label: 'غ', angle: 270 },
] as const;

const SHELL_CLASS: Record<PulseMapOrnamentVariant, string> = {
  public:
    'border-cyan-400/35 bg-[#020617]/88 shadow-[0_0_28px_rgba(34,211,238,0.18),inset_0_1px_0_rgba(165,243,252,0.12)]',
  admin:
    'border-violet-400/40 bg-[#0a0618]/90 shadow-[0_0_32px_rgba(139,92,246,0.22),inset_0_1px_0_rgba(196,181,253,0.14)]',
  cyber:
    'border-amber-400/35 bg-[#03000a]/92 shadow-[0_0_30px_rgba(251,191,36,0.16),inset_0_1px_0_rgba(34,211,238,0.12)]',
};

const INNER_RING_CLASS: Record<PulseMapOrnamentVariant, string> = {
  public: 'border-cyan-500/15 bg-[radial-gradient(circle_at_50%_38%,rgba(56,189,248,0.14),transparent_62%)]',
  admin: 'border-violet-500/20 bg-[radial-gradient(circle_at_50%_38%,rgba(139,92,246,0.16),transparent_62%)]',
  cyber:
    'border-cyan-500/18 bg-[radial-gradient(circle_at_50%_38%,rgba(34,211,238,0.12),transparent_62%)]',
};

const BADGE_CLASS: Record<PulseMapOrnamentVariant, string> = {
  public: 'border-cyan-400/25 text-cyan-200/80',
  admin: 'border-violet-400/30 text-violet-200/85',
  cyber: 'border-amber-400/30 text-amber-100/85',
};

const BADGE_LABEL: Record<PulseMapOrnamentVariant, string> = {
  public: 'نبض المنصة',
  admin: 'قيادة · النبض',
  cyber: 'عمليات · سيبر',
};

/** بوصلة مهيبة — زخرفة HTML فوق الخريطة (يمين الشاشة) */
export function PulseMapCompassOrnament({ className, variant = 'public' }: Props) {
  const reduceMotion = useReducedMotion();
  const uid = useId().replace(/:/g, '');
  const needleId = `pm-compass-needle-${uid}`;
  const needleSouthId = `pm-compass-needle-s-${uid}`;
  const ringStroke =
    variant === 'admin'
      ? 'rgba(167,139,250,0.28)'
      : variant === 'cyber'
        ? 'rgba(251,191,36,0.32)'
        : 'rgba(56,189,248,0.22)';
  const dashStroke =
    variant === 'admin'
      ? 'rgba(196,181,253,0.16)'
      : variant === 'cyber'
        ? 'rgba(34,211,238,0.18)'
        : 'rgba(125,211,252,0.12)';

  return (
    <div className={cn('pointer-events-none select-none', className)} aria-hidden>
      <div
        className={cn(
          'relative flex h-[4.75rem] w-[4.75rem] items-center justify-center rounded-2xl backdrop-blur-md sm:h-[5.25rem] sm:w-[5.25rem]',
          SHELL_CLASS[variant],
        )}
      >
        <div className={cn('absolute inset-1 rounded-xl border', INNER_RING_CLASS[variant])} />

        <svg viewBox="0 0 80 80" className="relative h-[3.4rem] w-[3.4rem] sm:h-[3.75rem] sm:w-[3.75rem]" aria-hidden>
          <defs>
            <linearGradient id={needleId} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#f59e0b" />
            </linearGradient>
            <linearGradient id={needleSouthId} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#64748b" />
              <stop offset="100%" stopColor="#334155" />
            </linearGradient>
          </defs>

          <circle cx="40" cy="40" r="34" fill="none" stroke={ringStroke} strokeWidth="1.2" />
          <circle cx="40" cy="40" r="28" fill="none" stroke={dashStroke} strokeWidth="0.8" strokeDasharray="3 4" />

          {CARDINALS.map(({ label, angle }) => {
            const rad = ((angle - 90) * Math.PI) / 180;
            const tx = 40 + Math.cos(rad) * 26;
            const ty = 40 + Math.sin(rad) * 26;
            return (
              <text
                key={label}
                x={tx}
                y={ty}
                textAnchor="middle"
                dominantBaseline="middle"
                fill={label === 'ش' ? '#fde68a' : variant === 'admin' ? 'rgba(221,214,254,0.78)' : variant === 'cyber' ? 'rgba(165,243,252,0.82)' : 'rgba(186,230,253,0.75)'}
                fontSize={label === 'ش' ? 9 : 7.5}
                fontWeight={700}
                fontFamily="system-ui"
              >
                {label}
              </text>
            );
          })}

          <g transform="translate(40 40)">
            {!reduceMotion ? (
              <g>
                <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="48s" repeatCount="indefinite" />
                <polygon points="0,-22 5,0 0,6 -5,0" fill={`url(#${needleId})`} opacity={0.95} />
                <polygon points="0,22 4,0 0,-5 -4,0" fill={`url(#${needleSouthId})`} opacity={0.85} />
              </g>
            ) : (
              <>
                <polygon points="0,-22 5,0 0,6 -5,0" fill={`url(#${needleId})`} opacity={0.95} />
                <polygon points="0,22 4,0 0,-5 -4,0" fill={`url(#${needleSouthId})`} opacity={0.85} />
              </>
            )}
          </g>

          <circle cx="40" cy="40" r="4.5" fill="#0f172a" stroke="rgba(251,191,36,0.65)" strokeWidth="1.2" />
          <circle cx="40" cy="40" r="1.8" fill="#fbbf24" />
        </svg>

        <span
          className={cn(
            'absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border bg-[#020617]/95 px-2 py-0.5 text-[0.48rem] font-bold tracking-wide',
            BADGE_CLASS[variant],
          )}
        >
          {BADGE_LABEL[variant]}
        </span>
      </div>
    </div>
  );
}
