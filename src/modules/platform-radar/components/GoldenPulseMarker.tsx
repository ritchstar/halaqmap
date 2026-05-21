import { useId } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  formatTacticalCoordinates,
  formatTacticalTime,
} from '@/modules/platform-radar/lib/saudiKingdomProjection';

type Props = {
  id: string;
  left: number;
  top: number;
  lat: number;
  lng: number;
  createdAt: string;
  label?: string;
  inspector?: boolean;
  opacity?: number;
  isNew?: boolean;
};

function GoldenBarberIcon({ className, inspector }: { className?: string; inspector?: boolean }) {
  const gradId = useId();
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(className, inspector && 'drop-shadow-[0_0_14px_rgba(248,113,113,0.9)]')}
      aria-hidden
    >
      <defs>
        <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fde68a" />
          <stop offset="45%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>
      </defs>
      {/* Comb teeth */}
      <path
        d="M8 6h3v14M11 6v14M14 6v14M17 6v14"
        stroke={`url(#${gradId})`}
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <rect x="7" y="20" width="11" height="2.5" rx="0.5" fill={`url(#${gradId})`} opacity="0.9" />
      {/* Scissors */}
      <circle cx="22" cy="10" r="2.2" stroke={`url(#${gradId})`} strokeWidth="1.3" />
      <circle cx="26" cy="14" r="2.2" stroke={`url(#${gradId})`} strokeWidth="1.3" />
      <path
        d="M20 18 L22 10 M20 18 L26 14 M24 16 L28 22"
        stroke={`url(#${gradId})`}
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {inspector ? (
        <circle cx="16" cy="16" r="14" stroke="rgba(248,113,113,0.65)" strokeWidth="1" strokeDasharray="3 2" />
      ) : null}
    </svg>
  );
}

export function GoldenPulseMarker({
  id,
  left,
  top,
  lat,
  lng,
  createdAt,
  label,
  inspector = false,
  opacity = 1,
  isNew = false,
}: Props) {
  const timeStr = formatTacticalTime(createdAt);
  const coordStr = formatTacticalCoordinates(lat, lng);

  return (
    <motion.div
      layout
      initial={isNew ? { scale: 0, opacity: 0, filter: 'blur(6px)' } : false}
      animate={{ scale: 1, opacity, filter: 'blur(0px)' }}
      transition={{
        type: 'spring',
        stiffness: 420,
        damping: 28,
        mass: 0.65,
      }}
      whileHover={{ scale: 1.14, zIndex: 50 }}
      whileTap={{ scale: 0.92 }}
      className="golden-pulse-marker group absolute z-20 flex -translate-x-1/2 flex-col items-center"
      style={{ left: `${left}%`, top: `${top}%` }}
      title={label}
    >
      {/* Pulse halo — expand & fade */}
      <span
        className={cn(
          'golden-pulse-halo pointer-events-none absolute left-1/2 top-[18px] block -translate-x-1/2 -translate-y-1/2 rounded-full',
          inspector
            ? 'h-[clamp(2.5rem,5vw,3.75rem)] w-[clamp(2.5rem,5vw,3.75rem)] border border-red-400/40'
            : 'h-[clamp(2rem,4.2vw,3.25rem)] w-[clamp(2rem,4.2vw,3.25rem)] border border-amber-400/25',
        )}
      />
      <span className="golden-pulse-halo-delay pointer-events-none absolute left-1/2 top-[18px] block h-[clamp(1.25rem,2.5vw,2rem)] w-[clamp(1.25rem,2.5vw,2rem)] -translate-x-1/2 -translate-y-1/2 rounded-full border border-amber-300/20" />

      <motion.div
        className="relative flex h-[clamp(1.75rem,3.2vw,2.5rem)] w-[clamp(1.75rem,3.2vw,2.5rem)] items-center justify-center"
        whileHover={{ rotate: [0, -6, 6, 0] }}
        transition={{ duration: 0.45 }}
      >
        <GoldenBarberIcon
          className="h-full w-full drop-shadow-[0_0_12px_rgba(251,191,36,0.85)]"
          inspector={inspector}
        />
      </motion.div>

      {/* Tactical overlay — neon telemetry */}
      <div
        className={cn(
          'mt-1 min-w-[max-content] rounded border px-1.5 py-0.5 text-center font-mono backdrop-blur-sm transition-all duration-300',
          'border-sky-400/30 bg-black/75 opacity-90 group-hover:opacity-100 group-hover:shadow-[0_0_16px_rgba(56,189,248,0.35)]',
          inspector && 'border-red-400/40 shadow-[0_0_12px_rgba(248,113,113,0.25)]',
        )}
      >
        <p className="text-[clamp(0.55rem,1vw,0.68rem)] font-semibold tabular-nums text-amber-200/95">{timeStr}</p>
        <p className="text-[clamp(0.5rem,0.9vw,0.62rem)] tabular-nums text-sky-300/90">{coordStr}</p>
      </div>

      <span className="sr-only">{label ?? id}</span>
    </motion.div>
  );
}
