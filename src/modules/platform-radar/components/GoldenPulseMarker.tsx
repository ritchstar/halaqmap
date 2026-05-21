import { useId } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { formatTacticalOverlay } from '@/modules/platform-radar/lib/saudiKingdomProjection';

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

const HALO_LAYERS = [
  { scale: 1, delay: 0, opacity: 0.55 },
  { scale: 1.35, delay: 0.45, opacity: 0.38 },
  { scale: 1.75, delay: 0.9, opacity: 0.24 },
  { scale: 2.15, delay: 1.35, opacity: 0.12 },
] as const;

function GoldenBarberSilhouette({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      {/* White silhouette — scissors + comb (reference-style glyph) */}
      <path
        d="M5 4h2v10M7 4v10M9 4v10M11 4v10M5 14h7v1.5H5V14Z"
        fill="white"
        opacity="0.95"
      />
      <circle cx="16.5" cy="8" r="1.6" stroke="white" strokeWidth="1.2" />
      <circle cx="19" cy="11" r="1.6" stroke="white" strokeWidth="1.2" />
      <path
        d="M14.5 14.5 L16.5 8 M14.5 14.5 L19 11 M17.5 12.5 L20.5 16.5"
        stroke="white"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PulseHaloRing({
  index,
  scale,
  delay,
  ringOpacity,
  inspector,
}: {
  index: number;
  scale: number;
  delay: number;
  ringOpacity: number;
  inspector?: boolean;
}) {
  const ringId = useId();
  return (
    <motion.span
      key={ringId}
      className={cn(
        'pointer-events-none absolute left-1/2 top-0 block -translate-x-1/2 -translate-y-1/2 rounded-full border',
        inspector ? 'border-red-400/50' : 'border-amber-300/35',
      )}
      style={{
        width: 'clamp(2.75rem, 5.2vw, 4.25rem)',
        height: 'clamp(2.75rem, 5.2vw, 4.25rem)',
      }}
      initial={{ scale: 0.45 * scale, opacity: ringOpacity }}
      animate={{ scale: 2.35 * scale, opacity: 0 }}
      transition={{
        duration: 2.8,
        delay: delay + index * 0.08,
        repeat: Infinity,
        ease: 'easeOut',
      }}
    />
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
  const overlay = formatTacticalOverlay(createdAt, lat, lng);

  return (
    <motion.div
      layout
      initial={isNew ? { scale: 0.35, opacity: 0, filter: 'blur(8px)' } : false}
      animate={{ scale: 1, opacity, filter: 'blur(0px)' }}
      transition={{ type: 'spring', stiffness: 380, damping: 26, mass: 0.7 }}
      whileHover={{ scale: 1.12, zIndex: 60 }}
      whileTap={{ scale: 0.94 }}
      className="golden-pulse-marker group absolute z-[25] flex -translate-x-1/2 flex-col items-center"
      style={{ left: `${left}%`, top: `${top}%` }}
      title={label}
    >
      <div className="relative flex h-[clamp(2.4rem,4.6vw,3.35rem)] w-[clamp(2.4rem,4.6vw,3.35rem)] items-center justify-center">
        {HALO_LAYERS.map((layer, index) => (
          <PulseHaloRing
            key={`${id}-halo-${index}`}
            index={index}
            scale={layer.scale}
            delay={layer.delay}
            ringOpacity={layer.opacity}
            inspector={inspector}
          />
        ))}

        <motion.div
          className={cn(
            'relative z-10 flex h-[clamp(1.85rem,3.4vw,2.65rem)] w-[clamp(1.85rem,3.4vw,2.65rem)] items-center justify-center rounded-full',
            inspector
              ? 'bg-[radial-gradient(circle_at_35%_30%,#fca5a5_0%,#ef4444_42%,#991b1b_100%)] shadow-[0_0_28px_rgba(239,68,68,0.75)]'
              : 'bg-[radial-gradient(circle_at_35%_30%,#fde68a_0%,#f59e0b_45%,#b45309_100%)] shadow-[0_0_28px_rgba(251,191,36,0.75)]',
          )}
          whileHover={{ rotate: [0, -8, 8, 0] }}
          transition={{ duration: 0.42 }}
        >
          <GoldenBarberSilhouette className="h-[58%] w-[58%] drop-shadow-[0_1px_2px_rgba(0,0,0,0.45)]" />
        </motion.div>
      </div>

      <p
        className={cn(
          'mt-1 whitespace-nowrap text-center font-mono text-[clamp(0.52rem,0.95vw,0.68rem)] font-medium tabular-nums tracking-tight text-slate-100/92',
          'drop-shadow-[0_0_8px_rgba(255,255,255,0.35)] transition-opacity duration-200 group-hover:text-white',
          inspector && 'text-red-100/95',
        )}
      >
        {overlay}
      </p>

      <span className="sr-only">{label ?? id}</span>
    </motion.div>
  );
}
