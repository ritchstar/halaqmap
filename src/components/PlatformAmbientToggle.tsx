import { Moon, Sun, SunDim, Sunrise, Sunset } from 'lucide-react';
import { usePlatformAmbient } from '@/context/PlatformAmbientContext';
import type { AmbientPhaseId } from '@/config/platformAmbientPhases';
import { cn } from '@/lib/utils';

const PHASE_ICONS: Record<AmbientPhaseId, typeof Sun> = {
  fajr: Sunrise,
  dhuhr: Sun,
  ghuroob: Sunset,
  layl: Moon,
};

type PlatformAmbientToggleProps = {
  variant?: 'default' | 'partner' | 'compact';
  className?: string;
};

export function PlatformAmbientToggle({
  variant = 'default',
  className,
}: PlatformAmbientToggleProps) {
  const {
    effectivePhase,
    phaseLabelAr,
    control,
    controlLabelAr,
    controlHintAr,
    riyadhTimeLabel,
    cycleControl,
  } = usePlatformAmbient();

  const PhaseIcon = PHASE_ICONS[effectivePhase];
  const isCompact = variant === 'compact';
  const isBrightNoon = effectivePhase === 'dhuhr';

  const shellClass =
    variant === 'partner'
      ? 'border-amber-300/65 bg-[linear-gradient(135deg,rgba(255,248,232,0.96),rgba(255,255,255,0.96))] text-slate-900 shadow-[0_10px_22px_rgba(245,158,11,0.10)] hover:bg-[linear-gradient(135deg,rgba(255,248,232,1),rgba(255,255,255,1))] hover:border-amber-400/70'
      : 'border-teal-400/25 bg-teal-500/10 text-teal-100 hover:bg-teal-500/18 hover:border-teal-400/40';

  return (
    <button
      type="button"
      onClick={cycleControl}
      className={cn(
        'group inline-flex items-center gap-2 rounded-xl border transition-all duration-300 touch-manipulation',
        shellClass,
        isBrightNoon && 'platform-ambient-toggle-bright',
        isCompact ? 'min-h-10 px-2.5 py-2' : 'min-h-10 px-3 py-2',
        className,
      )}
      aria-label={`${controlLabelAr} — ${phaseLabelAr} — الرياض ${riyadhTimeLabel}`}
      title={`${controlHintAr}\nالوضع: ${phaseLabelAr}\nالرياض: ${riyadhTimeLabel}`}
    >
      <span
        className={cn(
          'platform-ambient-toggle-icon-shell flex shrink-0 items-center justify-center rounded-lg',
          variant === 'partner' ? 'border border-amber-200 bg-white/92 shadow-sm' : 'bg-teal-500/15',
          isCompact ? 'h-7 w-7' : 'h-8 w-8',
        )}
      >
        {control === 'bright' ? (
          <Sun className={cn('text-amber-600 drop-shadow-[0_0_4px_rgba(245,158,11,0.25)]', isCompact ? 'h-3.5 w-3.5' : 'h-4 w-4')} />
        ) : control === 'night' ? (
          <Moon className={cn('text-slate-700', isCompact ? 'h-3.5 w-3.5' : 'h-4 w-4')} />
        ) : (
          <PhaseIcon
            className={cn(
              variant === 'partner' ? 'text-amber-700' : 'text-teal-300',
              isCompact ? 'h-3.5 w-3.5' : 'h-4 w-4',
            )}
          />
        )}
      </span>

      {!isCompact && (
        <span className="flex min-w-0 flex-col items-start leading-tight">
          <span className="max-w-[9rem] truncate text-[0.72rem] font-black text-slate-900 sm:max-w-none sm:text-xs">
            {control === 'auto' ? phaseLabelAr : control === 'bright' ? 'ظهر مشرق' : 'ليل الرادار'}
          </span>
          <span className="hidden text-[0.58rem] font-medium text-slate-600 sm:inline">
            {control === 'auto' ? `الرياض ${riyadhTimeLabel}` : controlLabelAr}
          </span>
        </span>
      )}

      {control === 'auto' && !isCompact && (
        <SunDim className="hidden h-3.5 w-3.5 shrink-0 text-amber-600/80 lg:inline" aria-hidden />
      )}
    </button>
  );
}
