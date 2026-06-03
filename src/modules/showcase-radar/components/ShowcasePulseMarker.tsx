import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { formatTacticalTime } from '@/modules/platform-radar/lib/saudiKingdomProjection';

type Props = {
  id: string;
  left: number;
  top: number;
  createdAt: string;
  labelAr: string;
  pulseKind?: 'user' | 'barber' | 'city';
  opacity?: number;
  isNew?: boolean;
  signalTier?: 'capital' | 'major' | 'hub';
  variantIndex?: number;
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
  signalTier = 'hub',
  variantIndex = 0,
}: Props) {
  const isBarber = pulseKind === 'barber';
  const isCitySignal = pulseKind === 'city';
  const overlay = formatTacticalTime(createdAt);
  const cityLabel = labelAr.split('—').pop()?.trim() ?? labelAr;
  const markerSize =
    isCitySignal
      ? signalTier === 'capital'
        ? 'h-[clamp(1.15rem,1.9vw,1.5rem)] w-[clamp(1.15rem,1.9vw,1.5rem)]'
        : signalTier === 'major'
          ? 'h-[clamp(1rem,1.7vw,1.3rem)] w-[clamp(1rem,1.7vw,1.3rem)]'
          : 'h-[clamp(0.9rem,1.55vw,1.18rem)] w-[clamp(0.9rem,1.55vw,1.18rem)]'
      : 'h-[clamp(0.85rem,1.5vw,1.15rem)] w-[clamp(0.85rem,1.5vw,1.15rem)]';
  const dotSize =
    isCitySignal
      ? signalTier === 'capital'
        ? 'h-[clamp(0.82rem,1.3vw,1rem)] w-[clamp(0.82rem,1.3vw,1rem)]'
        : signalTier === 'major'
          ? 'h-[clamp(0.72rem,1.18vw,0.92rem)] w-[clamp(0.72rem,1.18vw,0.92rem)]'
          : 'h-[clamp(0.62rem,1.08vw,0.82rem)] w-[clamp(0.62rem,1.08vw,0.82rem)]'
      : 'h-[clamp(0.6rem,1.08vw,0.825rem)] w-[clamp(0.6rem,1.08vw,0.825rem)]';
  const pulseDuration = 2.6 + (variantIndex % 3) * 0.55;
  const cityTone =
    signalTier === 'capital'
      ? {
          dot: 'border-cyan-100/85 bg-[radial-gradient(circle_at_30%_25%,#e0fbff_0%,#3b82f6_42%,#1d4ed8_100%)] shadow-[0_0_10px_rgba(59,130,246,0.42)]',
          ring: 'border-cyan-200/60',
          ringFar: 'border-sky-300/30',
        }
      : signalTier === 'major'
        ? {
            dot: 'border-emerald-100/85 bg-[radial-gradient(circle_at_30%_25%,#dcfce7_0%,#22c55e_42%,#166534_100%)] shadow-[0_0_9px_rgba(34,197,94,0.36)]',
            ring: 'border-emerald-200/55',
            ringFar: 'border-cyan-200/24',
          }
        : {
            dot: 'border-amber-100/80 bg-[radial-gradient(circle_at_30%_25%,#fef3c7_0%,#f59e0b_42%,#92400e_100%)] shadow-[0_0_8px_rgba(251,191,36,0.32)]',
            ring: 'border-amber-200/45',
            ringFar: 'border-sky-200/18',
          };

  return (
    <motion.div
      layout="position"
      initial={isNew ? { scale: 0.2, opacity: 0, filter: 'blur(10px)' } : false}
      animate={{ scale: 1, opacity, filter: 'blur(0px)' }}
      transition={{ type: 'spring', stiffness: 340, damping: 24, mass: 0.75 }}
      className={cn(
        'golden-pulse-marker group absolute z-[30] flex -translate-x-1/2 flex-col items-center',
        isCitySignal
          ? 'golden-pulse-marker--city'
          : isBarber
            ? 'golden-pulse-marker--barber'
            : 'golden-pulse-marker--user',
      )}
      style={{ left: `${left}%`, top: `${top}%` }}
      title={labelAr}
    >
      <div className={cn('relative flex items-center justify-center', markerSize)}>
        {isCitySignal && (
          <>
            <motion.div
              className={cn('absolute inset-0 rounded-full border', cityTone.ring)}
              animate={{ scale: [0.8, 1.8, 2.4], opacity: [0.55, 0.18, 0] }}
              transition={{ duration: pulseDuration, repeat: Infinity, ease: 'easeOut', delay: (variantIndex % 4) * 0.18 }}
            />
            <motion.div
              className={cn('absolute inset-0 rounded-full border', cityTone.ringFar)}
              animate={{ scale: [1, 2.2, 2.9], opacity: [0.32, 0.12, 0] }}
              transition={{ duration: pulseDuration + 0.9, repeat: Infinity, ease: 'easeOut', delay: 0.45 + (variantIndex % 3) * 0.14 }}
            />
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{
                background:
                  signalTier === 'capital'
                    ? 'radial-gradient(circle, rgba(56,189,248,0.18) 0%, transparent 68%)'
                    : signalTier === 'major'
                      ? 'radial-gradient(circle, rgba(34,197,94,0.15) 0%, transparent 68%)'
                      : 'radial-gradient(circle, rgba(245,158,11,0.14) 0%, transparent 68%)',
              }}
              animate={{ scale: [1, 1.35, 1], opacity: [0.35, 0.7, 0.35] }}
              transition={{ duration: 2.8 + (variantIndex % 2) * 0.5, repeat: Infinity, ease: 'easeInOut' }}
            />
          </>
        )}
        <motion.div
          className={cn(
            'relative z-10 flex items-center justify-center rounded-full border',
            dotSize,
            isCitySignal
              ? cityTone.dot
              : isBarber
              ? 'border-teal-200/45 bg-[radial-gradient(circle_at_30%_25%,#ccfbf1_0%,#14b8a6_42%,#115e59_100%)] shadow-[0_0_6px_rgba(20,184,166,0.5)]'
              : 'border-amber-200/40 bg-[radial-gradient(circle_at_30%_25%,#fef3c7_0%,#f59e0b_42%,#92400e_100%)] shadow-[0_0_8px_rgba(251,191,36,0.55)]',
          )}
          animate={isCitySignal ? { scale: [1, 1.16, 1], opacity: [0.9, 1, 0.9] } : undefined}
          transition={isCitySignal ? { duration: 2 + (variantIndex % 3) * 0.35, repeat: Infinity, ease: 'easeInOut' } : undefined}
        >
          {isCitySignal ? null : isBarber ? (
            <BarberLinkSilhouette className="h-[52%] w-[52%]" />
          ) : (
            <UserSearchSilhouette className="h-[58%] w-[58%]" />
          )}
        </motion.div>
      </div>

      {!isCitySignal && (
        <p
          className="mt-0.5 max-w-[8rem] truncate text-center text-[clamp(0.5rem,0.85vw,0.62rem)] font-semibold text-white drop-shadow-[0_0_6px_rgba(0,0,0,0.95)]"
          dir="rtl"
        >
          {isBarber ? `ربط · ${cityLabel.replace(/\s*\(توضيحي\)\s*$/, '')}` : `${overlay} · ${cityLabel}`}
        </p>
      )}
      <span className="sr-only">{labelAr}</span>
    </motion.div>
  );
}
