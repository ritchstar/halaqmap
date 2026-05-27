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
      ? 'border-amber-400/25 bg-amber-500/10 text-amber-100 hover:bg-amber-500/18 hover:border-amber-400/40'
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
          variant === 'partner' ? 'bg-amber-500/15' : 'bg-teal-500/15',
          isCompact ? 'h-7 w-7' : 'h-8 w-8',
        )}
      >
        {control === 'bright' ? (
          <Sun className={cn('text-amber-200 drop-shadow-[0_0_8px_rgba(253,224,71,0.65)]', isCompact ? 'h-3.5 w-3.5' : 'h-4 w-4')} />
        ) : control === 'night' ? (
          <Moon className={cn('text-slate-300', isCompact ? 'h-3.5 w-3.5' : 'h-4 w-4')} />
        ) : (
          <PhaseIcon
            className={cn(
              variant === 'partner' ? 'text-amber-300' : 'text-teal-300',
              isCompact ? 'h-3.5 w-3.5' : 'h-4 w-4',
            )}
          />
        )}
      </span>

      {!isCompact && (
        <span className="flex min-w-0 flex-col items-start leading-tight">
          <span className="max-w-[9rem] truncate text-[0.68rem] font-bold sm:max-w-none sm:text-xs">
            {control === 'auto' ? phaseLabelAr : control === 'bright' ? 'ظهر مشرق' : 'ليل الرادار'}
          </span>
          <span className="hidden text-[0.58rem] opacity-70 sm:inline">
            {control === 'auto' ? `الرياض ${riyadhTimeLabel}` : controlLabelAr}
          </span>
        </span>
      )}

      {control === 'auto' && !isCompact && (
        <SunDim className="hidden h-3.5 w-3.5 shrink-0 opacity-50 lg:inline" aria-hidden />
      )}
    </button>
  );
}
