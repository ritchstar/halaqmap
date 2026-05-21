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
  anchor?: boolean;
  opacity?: number;
  isNew?: boolean;
};

const HALO_LAYERS = [
  { scale: 1, delay: 0, opacity: 0.7 },
  { scale: 1.28, delay: 0.55, opacity: 0.45 },
  { scale: 1.62, delay: 1.1, opacity: 0.28 },
  { scale: 2, delay: 1.65, opacity: 0.14 },
] as const;

/** White scissors + comb silhouette — reference golden-disc style */
function GoldenBarberSilhouette({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden>
      <path
        d="M8 5.5h2.2v13.5M10.8 5.5v13.5M13.6 5.5v13.5M16.4 5.5v13.5M8 19.5h9.2v2H8v-2Z"
        fill="white"
      />
      <circle cx="22.5" cy="10.5" r="2.4" stroke="white" strokeWidth="1.5" />
      <circle cx="26.2" cy="14.8" r="2.4" stroke="white" strokeWidth="1.5" />
      <path
        d="M18.5 18.5 L22.5 10.5 M18.5 18.5 L26.2 14.8 M24 16.5 L28.5 21.5"
        stroke="white"
        strokeWidth="1.5"
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
  return (
    <motion.span
      className={cn(
        'pointer-events-none absolute left-1/2 top-1/2 block -translate-x-1/2 -translate-y-1/2 rounded-full border-2',
        inspector ? 'border-red-400/55' : 'border-amber-300/50',
      )}
      style={{
        width: 'clamp(2.5rem, 4.8vw, 3.75rem)',
        height: 'clamp(2.5rem, 4.8vw, 3.75rem)',
      }}
      initial={{ scale: 0.5 * scale, opacity: ringOpacity }}
      animate={{ scale: 2.5 * scale, opacity: 0 }}
      transition={{
        duration: 3,
        delay: delay + index * 0.06,
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
  anchor = false,
  opacity = 1,
  isNew = false,
}: Props) {
  const overlay = formatTacticalOverlay(createdAt, lat, lng);

  return (
    <motion.div
      layout="position"
      initial={isNew ? { scale: 0.2, opacity: 0, filter: 'blur(10px)' } : false}
      animate={{ scale: 1, opacity, filter: 'blur(0px)' }}
      transition={{ type: 'spring', stiffness: 340, damping: 24, mass: 0.75 }}
      whileHover={{ scale: 1.1, zIndex: 70 }}
      whileTap={{ scale: 0.93 }}
      className="golden-pulse-marker group absolute z-[30] flex -translate-x-1/2 flex-col items-center"
      style={{ left: `${left}%`, top: `${top}%` }}
      title={label}
    >
      <div className="relative flex h-[clamp(3rem, 5.5vw, 4.25rem)] w-[clamp(3rem, 5.5vw, 4.25rem)] items-center justify-center">
        {!anchor
          ? HALO_LAYERS.map((layer, index) => (
              <PulseHaloRing
                key={`${id}-ring-${index}`}
                index={index}
                scale={layer.scale}
                delay={layer.delay}
                ringOpacity={layer.opacity}
                inspector={inspector}
              />
            ))
          : null}

        <motion.div
          className={cn(
            'relative z-10 flex items-center justify-center rounded-full border-2',
            inspector
              ? 'h-[clamp(2.2rem,4vw,3rem)] w-[clamp(2.2rem,4vw,3rem)] border-red-300/60 bg-[radial-gradient(circle_at_30%_25%,#fecaca_0%,#ef4444_40%,#7f1d1d_100%)] shadow-[0_0_32px_rgba(239,68,68,0.85)]'
              : 'h-[clamp(2.2rem,4vw,3rem)] w-[clamp(2.2rem,4vw,3rem)] border-amber-200/50 bg-[radial-gradient(circle_at_30%_25%,#fef3c7_0%,#f59e0b_42%,#92400e_100%)] shadow-[0_0_32px_rgba(251,191,36,0.85)]',
            anchor && 'opacity-90',
          )}
          whileHover={{ rotate: [0, -7, 7, 0] }}
          transition={{ duration: 0.4 }}
        >
          <GoldenBarberSilhouette className="h-[62%] w-[62%]" />
        </motion.div>
      </div>

      <p
        className={cn(
          'mt-0.5 whitespace-nowrap text-center font-mono text-[clamp(0.58rem,1.05vw,0.72rem)] font-semibold tabular-nums text-white',
          'drop-shadow-[0_0_6px_rgba(0,0,0,0.95)] [text-shadow:0_0_10px_rgba(255,255,255,0.45)]',
          inspector && 'text-red-100',
        )}
      >
        {overlay}
      </p>

      <span className="sr-only">{label ?? id}</span>
    </motion.div>
  );
}
