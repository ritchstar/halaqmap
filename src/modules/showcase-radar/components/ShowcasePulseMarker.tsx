import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { formatTacticalTime } from '@/modules/platform-radar/lib/saudiKingdomProjection';

type Props = {
  id: string;
  left: number;
  top: number;
  createdAt: string;
  labelAr: string;
  salonCluster?: boolean;
  opacity?: number;
  isNew?: boolean;
};

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

export function ShowcasePulseMarker({
  id,
  left,
  top,
  createdAt,
  labelAr,
  salonCluster = false,
  opacity = 1,
  isNew = false,
}: Props) {
  const overlay = formatTacticalTime(createdAt);

  return (
    <motion.div
      layout="position"
      initial={isNew ? { scale: 0.2, opacity: 0, filter: 'blur(10px)' } : false}
      animate={{ scale: 1, opacity, filter: 'blur(0px)' }}
      transition={{ type: 'spring', stiffness: 340, damping: 24, mass: 0.75 }}
      className="golden-pulse-marker group absolute z-[30] flex -translate-x-1/2 flex-col items-center"
      style={{ left: `${left}%`, top: `${top}%` }}
      title={labelAr}
    >
      <div className="relative flex h-[clamp(2.75rem,5vw,3.75rem)] w-[clamp(2.75rem,5vw,3.75rem)] items-center justify-center">
        {!salonCluster && (
          <>
            <span className="golden-pulse-halo golden-pulse-halo--ring-1" aria-hidden />
            <span className="golden-pulse-halo golden-pulse-halo--ring-2" aria-hidden />
            <span className="golden-pulse-halo golden-pulse-halo--ring-3" aria-hidden />
          </>
        )}

        <motion.div
          className={cn(
            'relative z-10 flex items-center justify-center rounded-full border-2',
            salonCluster
              ? 'h-[clamp(2rem,3.6vw,2.75rem)] w-[clamp(2rem,3.6vw,2.75rem)] border-teal-200/50 bg-[radial-gradient(circle_at_30%_25%,#ccfbf1_0%,#14b8a6_42%,#115e59_100%)] shadow-[0_0_28px_rgba(20,184,166,0.75)]'
              : 'h-[clamp(2rem,3.6vw,2.75rem)] w-[clamp(2rem,3.6vw,2.75rem)] border-amber-200/50 bg-[radial-gradient(circle_at_30%_25%,#fef3c7_0%,#f59e0b_42%,#92400e_100%)] shadow-[0_0_28px_rgba(251,191,36,0.85)]',
          )}
        >
          <GoldenBarberSilhouette className="h-[62%] w-[62%]" />
        </motion.div>
      </div>

      <p
        className="mt-0.5 max-w-[9rem] truncate text-center text-[clamp(0.58rem,1vw,0.7rem)] font-semibold text-white drop-shadow-[0_0_6px_rgba(0,0,0,0.95)]"
        dir="rtl"
      >
        {salonCluster ? labelAr : `${overlay} · ${labelAr.split('—').pop()?.trim() ?? labelAr}`}
      </p>
      <span className="sr-only">{labelAr}</span>
    </motion.div>
  );
}
