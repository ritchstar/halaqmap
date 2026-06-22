import type { AmbientControlMode, AmbientPhaseId } from '@/config/platformAmbientPhases';
import { cn } from '@/lib/utils';

type Props = {
  phase: AmbientPhaseId;
  control: AmbientControlMode;
  className?: string;
};

/** أيقونات مراحل اليوم — SVG مخصّص أنظف من lucide للواجهة الداكنة */
export function PlatformAmbientPhaseIcon({ phase, control, className }: Props) {
  const base = cn('shrink-0', className);

  if (control === 'bright') {
    return (
      <svg viewBox="0 0 24 24" className={base} fill="none" aria-hidden>
        <circle cx="12" cy="12" r="4.25" className="fill-amber-400/90 stroke-amber-300" strokeWidth="1.2" />
        {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
          const rad = (deg * Math.PI) / 180;
          const x1 = 12 + Math.cos(rad) * 6.2;
          const y1 = 12 + Math.sin(rad) * 6.2;
          const x2 = 12 + Math.cos(rad) * 8.4;
          const y2 = 12 + Math.sin(rad) * 8.4;
          return (
            <line
              key={deg}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              className="stroke-amber-300/85"
              strokeWidth="1.35"
              strokeLinecap="round"
            />
          );
        })}
      </svg>
    );
  }

  if (control === 'night') {
    return (
      <svg viewBox="0 0 24 24" className={base} fill="none" aria-hidden>
        <path
          d="M15.5 4.5a7.5 7.5 0 1 0 4.2 12.8A6.2 6.2 0 0 1 15.5 4.5Z"
          className="fill-indigo-300/25 stroke-indigo-200"
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
        <circle cx="17.5" cy="7" r="0.65" className="fill-indigo-100/70" />
      </svg>
    );
  }

  switch (phase) {
    case 'fajr':
      return (
        <svg viewBox="0 0 24 24" className={base} fill="none" aria-hidden>
          <path d="M3.5 16h17" className="stroke-amber-200/55" strokeWidth="1.3" strokeLinecap="round" />
          <path
            d="M7 16a5 5 0 0 1 10 0"
            className="stroke-amber-300"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path d="M12 16V9.5" className="stroke-amber-200/75" strokeWidth="1.2" strokeLinecap="round" />
          <path d="M9.2 11.2 12 9.5l2.8 1.7" className="stroke-amber-200/65" strokeWidth="1.1" strokeLinecap="round" />
        </svg>
      );
    case 'dhuhr':
      return (
        <svg viewBox="0 0 24 24" className={base} fill="none" aria-hidden>
          <circle cx="12" cy="12" r="4.1" className="fill-amber-300/88 stroke-amber-100" strokeWidth="1.1" />
          {[0, 60, 120, 180, 240, 300].map((deg) => {
            const rad = (deg * Math.PI) / 180;
            return (
              <line
                key={deg}
                x1={12 + Math.cos(rad) * 5.6}
                y1={12 + Math.sin(rad) * 5.6}
                x2={12 + Math.cos(rad) * 7.4}
                y2={12 + Math.sin(rad) * 7.4}
                className="stroke-amber-100/80"
                strokeWidth="1.25"
                strokeLinecap="round"
              />
            );
          })}
        </svg>
      );
    case 'ghuroob':
      return (
        <svg viewBox="0 0 24 24" className={base} fill="none" aria-hidden>
          <path d="M3.5 14.5h17" className="stroke-orange-200/50" strokeWidth="1.3" strokeLinecap="round" />
          <path
            d="M7 14.5a5 5 0 0 0 10 0"
            className="fill-orange-400/35 stroke-orange-300"
            strokeWidth="1.45"
            strokeLinecap="round"
          />
          <path
            d="M9.5 11.5h5"
            className="stroke-violet-200/45"
            strokeWidth="1.1"
            strokeLinecap="round"
          />
        </svg>
      );
    case 'layl':
    default:
      return (
        <svg viewBox="0 0 24 24" className={base} fill="none" aria-hidden>
          <path
            d="M16 5.2a6.8 6.8 0 1 0 3.6 11.2A5.4 5.4 0 0 1 16 5.2Z"
            className="fill-teal-300/18 stroke-teal-200"
            strokeWidth="1.4"
            strokeLinejoin="round"
          />
          <circle cx="17.8" cy="7.4" r="0.55" className="fill-teal-100/65" />
        </svg>
      );
  }
}

export const PHASE_ICON_SHELL_CLASS: Record<AmbientPhaseId, string> = {
  fajr: 'border-amber-400/30 bg-gradient-to-br from-amber-500/22 to-orange-600/10 shadow-[0_0_14px_rgba(251,191,36,0.14)]',
  dhuhr: 'border-amber-300/35 bg-gradient-to-br from-amber-400/28 to-teal-500/12 shadow-[0_0_16px_rgba(251,191,36,0.18)]',
  ghuroob: 'border-orange-400/32 bg-gradient-to-br from-orange-500/24 to-violet-500/14 shadow-[0_0_16px_rgba(251,146,60,0.16)]',
  layl: 'border-indigo-400/28 bg-gradient-to-br from-indigo-500/16 to-teal-900/22 shadow-[0_0_14px_rgba(99,102,241,0.12)]',
};

export const CONTROL_ICON_SHELL_CLASS: Record<Exclude<AmbientControlMode, 'auto'>, string> = {
  bright: 'border-amber-300/40 bg-gradient-to-br from-amber-400/30 to-yellow-300/12 shadow-[0_0_16px_rgba(251,191,36,0.2)]',
  night: 'border-indigo-400/30 bg-gradient-to-br from-indigo-500/18 to-slate-800/30 shadow-[0_0_14px_rgba(99,102,241,0.14)]',
};
