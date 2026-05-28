import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { formatTacticalTime } from '@/modules/platform-radar/lib/saudiKingdomProjection';

type Props = {
  id: string;
  left: number;
  top: number;
  createdAt: string;
  labelAr: string;
  pulseKind?: 'user' | 'barber';
  opacity?: number;
  isNew?: boolean;
};

/** أيقونة حلاق مصغّرة — نبض ربط */
function BarberLinkSilhouette({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden>
      <circle cx="11" cy="11" r="2.2" stroke="white" strokeWidth="1.6" />
      <circle cx="15.5" cy="14.5" r="2.2" stroke="white" strokeWidth="1.6" />
      <path
        d="M13 16 L11 11 M13 16 L15.5 14.5 M14.5 15.5 L18 19"
        stroke="white"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M8 6h1.4v10M9.4 6v10M11.2 6v10" stroke="white" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

/** أيقونة بحث — نبض مستخدم (أصغر 70%) */
function UserSearchSilhouette({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden>
      <circle cx="14" cy="14" r="6.5" stroke="white" strokeWidth="2" />
      <path
        d="M18.5 18.5 L24.5 24.5"
        stroke="white"
        strokeWidth="2.2"
        strokeLinecap="round"
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
  pulseKind = 'user',
  opacity = 1,
  isNew = false,
}: Props) {
  const isBarber = pulseKind === 'barber';
  const overlay = formatTacticalTime(createdAt);
  const cityLabel = labelAr.split('—').pop()?.trim() ?? labelAr;
  const markerSize =
    'h-[clamp(0.85rem,1.5vw,1.15rem)] w-[clamp(0.85rem,1.5vw,1.15rem)]';
  const dotSize =
    'h-[clamp(0.6rem,1.08vw,0.825rem)] w-[clamp(0.6rem,1.08vw,0.825rem)]';

  return (
    <motion.div
      layout="position"
      initial={isNew ? { scale: 0.2, opacity: 0, filter: 'blur(10px)' } : false}
      animate={{ scale: 1, opacity, filter: 'blur(0px)' }}
      transition={{ type: 'spring', stiffness: 340, damping: 24, mass: 0.75 }}
      className={cn(
        'golden-pulse-marker group absolute z-[30] flex -translate-x-1/2 flex-col items-center',
        isBarber ? 'golden-pulse-marker--barber' : 'golden-pulse-marker--user',
      )}
      style={{ left: `${left}%`, top: `${top}%` }}
      title={labelAr}
    >
      <div className={cn('relative flex items-center justify-center', markerSize)}>
        <motion.div
          className={cn(
            'relative z-10 flex items-center justify-center rounded-full border',
            dotSize,
            isBarber
              ? 'border-teal-200/45 bg-[radial-gradient(circle_at_30%_25%,#ccfbf1_0%,#14b8a6_42%,#115e59_100%)] shadow-[0_0_6px_rgba(20,184,166,0.5)]'
              : 'border-amber-200/40 bg-[radial-gradient(circle_at_30%_25%,#fef3c7_0%,#f59e0b_42%,#92400e_100%)] shadow-[0_0_8px_rgba(251,191,36,0.55)]',
          )}
        >
          {isBarber ? (
            <BarberLinkSilhouette className="h-[52%] w-[52%]" />
          ) : (
            <UserSearchSilhouette className="h-[58%] w-[58%]" />
          )}
        </motion.div>
      </div>

      <p
        className="mt-0.5 max-w-[8rem] truncate text-center text-[clamp(0.5rem,0.85vw,0.62rem)] font-semibold text-white drop-shadow-[0_0_6px_rgba(0,0,0,0.95)]"
        dir="rtl"
      >
        {isBarber ? `ربط · ${cityLabel.replace(/\s*\(توضيحي\)\s*$/, '')}` : `${overlay} · ${cityLabel}`}
      </p>
      <span className="sr-only">{labelAr}</span>
    </motion.div>
  );
}
