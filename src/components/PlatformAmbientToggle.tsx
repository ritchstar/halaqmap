import { useEffect, useState } from 'react';
import { usePlatformAmbient } from '@/context/PlatformAmbientContext';
import {
  CONTROL_ICON_SHELL_CLASS,
  PHASE_ICON_SHELL_CLASS,
  PlatformAmbientPhaseIcon,
} from '@/components/PlatformAmbientPhaseIcon';
import {
  readStoredUserCoords,
  resolveUserRegion,
  type UserCoords,
} from '@/lib/userRegionWeather';
import { cn } from '@/lib/utils';

type PlatformAmbientToggleProps = {
  variant?: 'default' | 'partner' | 'compact';
  className?: string;
};

export function PlatformAmbientToggle({
  variant = 'default',
  className,
}: PlatformAmbientToggleProps) {
  const [userCoords, setUserCoords] = useState<UserCoords | null>(() => readStoredUserCoords());
  const {
    effectivePhase,
    phaseLabelAr,
    control,
    controlLabelAr,
    controlHintAr,
    riyadhTimeLabel,
    cycleControl,
  } = usePlatformAmbient();

  const isCompact = variant === 'compact';
  const isPartner = variant === 'partner';
  const isBrightNoon = effectivePhase === 'dhuhr';
  const userRegion = resolveUserRegion(userCoords, Boolean(userCoords));
  const cityNightLabel = `ليل ${userRegion.city.nameAr}`;

  useEffect(() => {
    const onCoords = (event: Event) => {
      const detail = (event as CustomEvent<UserCoords>).detail;
      if (detail?.lat != null && detail?.lng != null) {
        setUserCoords(detail);
      }
    };

    window.addEventListener('halaqmap:user-coords', onCoords);
    return () => window.removeEventListener('halaqmap:user-coords', onCoords);
  }, []);

  const shellClass = isPartner
    ? 'border-amber-300/65 bg-[linear-gradient(135deg,rgba(255,248,232,0.96),rgba(255,255,255,0.96))] text-slate-900 shadow-[0_10px_22px_rgba(245,158,11,0.10)] hover:bg-[linear-gradient(135deg,rgba(255,248,232,1),rgba(255,255,255,1))] hover:border-amber-400/70'
    : 'border-teal-400/25 bg-teal-950/55 text-teal-50 hover:bg-teal-900/45 hover:border-teal-400/40';

  const iconShellClass =
    control === 'auto'
      ? PHASE_ICON_SHELL_CLASS[effectivePhase]
      : CONTROL_ICON_SHELL_CLASS[control];

  const primaryLabel =
    control === 'auto'
      ? effectivePhase === 'layl'
        ? cityNightLabel
        : phaseLabelAr
      : control === 'bright'
        ? 'ظهر مشرق'
        : cityNightLabel;

  const secondaryLabel = control === 'auto' ? `الرياض ${riyadhTimeLabel}` : controlLabelAr;

  return (
    <button
      type="button"
      onClick={cycleControl}
      dir="rtl"
      className={cn(
        'group inline-flex items-center gap-2.5 rounded-xl border transition-all duration-300 touch-manipulation',
        shellClass,
        isBrightNoon && 'platform-ambient-toggle-bright',
        isCompact ? 'min-h-10 px-2.5 py-2' : 'min-h-10 px-3 py-2',
        className,
      )}
      aria-label={`${controlLabelAr} — ${effectivePhase === 'layl' ? cityNightLabel : phaseLabelAr} — الرياض ${riyadhTimeLabel}`}
      title={`${controlHintAr}\nالوضع: ${effectivePhase === 'layl' ? cityNightLabel : phaseLabelAr}\nالرياض: ${riyadhTimeLabel}`}
    >
      <span
        className={cn(
          'platform-ambient-toggle-icon-shell flex shrink-0 items-center justify-center rounded-lg border',
          isPartner ? 'border-amber-200 bg-white/92 shadow-sm' : iconShellClass,
          isCompact ? 'h-7 w-7' : 'h-8 w-8',
        )}
      >
        <PlatformAmbientPhaseIcon
          phase={effectivePhase}
          control={control}
          className={isCompact ? 'h-4 w-4' : 'h-[1.125rem] w-[1.125rem]'}
        />
      </span>

      {!isCompact ? (
        <span className="flex min-w-0 flex-col items-start leading-tight text-right">
          <span
            className={cn(
              'max-w-[9rem] truncate text-[0.72rem] font-black sm:max-w-none sm:text-xs',
              isPartner ? 'text-slate-900' : 'text-teal-50',
            )}
          >
            {primaryLabel}
          </span>
          <span
            className={cn(
              'hidden text-[0.58rem] font-medium sm:inline',
              isPartner ? 'text-slate-600' : 'text-teal-300/78',
            )}
          >
            {secondaryLabel}
          </span>
        </span>
      ) : null}

      {control === 'auto' && !isCompact ? (
        <span
          className={cn(
            'hidden shrink-0 rounded-full border px-1.5 py-0.5 text-[0.48rem] font-bold tracking-wide lg:inline',
            isPartner
              ? 'border-amber-300/50 bg-amber-100/80 text-amber-800'
              : 'border-teal-400/25 bg-teal-500/10 text-teal-200/85',
          )}
          aria-hidden
        >
          تلقائي
        </span>
      ) : null}
    </button>
  );
}
