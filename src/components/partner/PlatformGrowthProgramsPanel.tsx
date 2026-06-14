import { CircleDot, MapPinned, Orbit, Radio } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  PLATFORM_GROWTH_COMPLIANCE_NOTE_AR,
  PLATFORM_GROWTH_DASHBOARD_PERIMETER_NOTE_AR,
  PLATFORM_GROWTH_LANDING_SECTION,
  PLATFORM_GROWTH_PROGRAM_PHASES,
  PLATFORM_GROWTH_PULSE_STATIONS_PHASE1,
  PLATFORM_GROWTH_UNIFIED_TAGLINE_AR,
  type PlatformGrowthProgramPhaseId,
} from '@/config/platformGrowthPrograms';
import { cn } from '@/lib/utils';

const PHASE_ICONS = {
  orbit_readiness: Orbit,
  pulse_stations: Radio,
  orbit_perimeter: MapPinned,
} as const satisfies Record<PlatformGrowthProgramPhaseId, typeof Orbit>;

export type PlatformGrowthProgramsPanelProps = {
  variant?: 'landing' | 'register' | 'dashboard' | 'compact';
  /** pre_activation: قبل/أثناء التفعيل · post_activation: لوحة الحلاق */
  activationState?: 'pre_activation' | 'post_activation';
  className?: string;
  showCompliance?: boolean;
  showPulsePhase1?: boolean;
};

function phaseStatus(
  phaseId: PlatformGrowthProgramPhaseId,
  activationState: 'pre_activation' | 'post_activation',
): 'upcoming' | 'active' | 'done' {
  if (activationState === 'pre_activation') {
    if (phaseId === 'orbit_readiness') return 'active';
    return 'upcoming';
  }
  if (phaseId === 'orbit_readiness') return 'done';
  if (phaseId === 'pulse_stations') return 'active';
  return 'active';
}

function statusLabel(status: 'upcoming' | 'active' | 'done'): string {
  if (status === 'done') return 'مكتمل';
  if (status === 'active') return 'جارٍ';
  return 'قادم';
}

export function PlatformGrowthProgramsPanel({
  variant = 'landing',
  activationState = 'pre_activation',
  className,
  showCompliance = true,
  showPulsePhase1 = true,
}: PlatformGrowthProgramsPanelProps) {
  const isDarkRegister = variant === 'register';
  const isDashboard = variant === 'dashboard';
  const isCompact = variant === 'compact';

  const title =
    isCompact || isDashboard
      ? PLATFORM_GROWTH_UNIFIED_TAGLINE_AR
      : PLATFORM_GROWTH_LANDING_SECTION.titleAr;
  const lead = isCompact ? undefined : PLATFORM_GROWTH_LANDING_SECTION.leadAr;

  return (
    <div
      dir="rtl"
      className={cn(
        'space-y-4',
        isDarkRegister && 'rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5',
        isDashboard && 'rounded-xl border border-primary/20 bg-primary/5 p-4',
        className,
      )}
    >
      {isCompact && (
        <p className="text-xs font-bold text-foreground text-right leading-relaxed">
          {PLATFORM_GROWTH_UNIFIED_TAGLINE_AR}
        </p>
      )}

      {!isCompact && (
        <div className={cn('text-right space-y-1', isDarkRegister && 'text-center sm:text-right')}>
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <h2
              className={cn(
                'font-bold',
                isDarkRegister ? 'text-lg text-amber-100' : 'text-xl md:text-2xl text-foreground',
                isDashboard && 'text-base sm:text-lg',
              )}
            >
              {title}
            </h2>
            {!isDashboard && (
              <Badge
                variant="outline"
                className={cn(
                  'text-[10px]',
                  isDarkRegister && 'border-emerald-400/30 text-emerald-200 bg-emerald-500/10',
                )}
              >
                {PLATFORM_GROWTH_UNIFIED_TAGLINE_AR}
              </Badge>
            )}
          </div>
          {lead && (
            <p
              className={cn(
                'text-sm leading-relaxed max-w-3xl',
                isDarkRegister ? 'text-slate-400 mx-auto sm:mx-0' : 'text-muted-foreground',
              )}
            >
              {lead}
            </p>
          )}
        </div>
      )}

      <div
        className={cn(
          'grid gap-3',
          isCompact ? 'grid-cols-1' : 'sm:grid-cols-3',
        )}
      >
        {PLATFORM_GROWTH_PROGRAM_PHASES.map((phase) => {
          const Icon = PHASE_ICONS[phase.id];
          const status = phaseStatus(phase.id, activationState);
          const explain =
            isCompact || isDashboard ? phase.simpleExplainAr : phase.detailAr;

          return (
            <Card
              key={phase.id}
              className={cn(
                'h-full border transition-shadow',
                status === 'active' && 'border-primary/40 shadow-sm ring-1 ring-primary/15',
                status === 'done' && 'border-emerald-500/30 bg-emerald-500/5',
                isDarkRegister && 'border-white/10 bg-black/25 text-right',
                isDashboard && 'bg-background/80',
              )}
            >
              <CardContent className="p-4 space-y-2 text-right">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className={cn(
                        'inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
                        status === 'active'
                          ? 'bg-primary/15 text-primary'
                          : status === 'done'
                            ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                            : 'bg-muted text-muted-foreground',
                        isDarkRegister && status === 'active' && 'bg-amber-500/15 text-amber-300',
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold text-muted-foreground">المرحلة {phase.order}</p>
                      <p
                        className={cn(
                          'font-bold text-sm leading-snug',
                          isDarkRegister && 'text-white',
                        )}
                      >
                        {phase.shortTitleAr}
                      </p>
                    </div>
                  </div>
                  {(isDashboard || variant === 'register') && (
                    <Badge
                      variant={status === 'done' ? 'default' : status === 'active' ? 'secondary' : 'outline'}
                      className="shrink-0 text-[9px]"
                    >
                      {statusLabel(status)}
                    </Badge>
                  )}
                </div>
                <p
                  className={cn(
                    'text-xs leading-relaxed',
                    isDarkRegister ? 'text-slate-300' : 'text-muted-foreground',
                  )}
                >
                  {explain}
                </p>
                {phase.id === 'pulse_stations' && showPulsePhase1 && !isCompact && (
                  <p
                    className={cn(
                      'text-[11px] leading-relaxed rounded-md border px-2 py-1.5',
                      isDarkRegister
                        ? 'border-cyan-500/25 bg-cyan-500/10 text-cyan-100'
                        : 'border-cyan-500/20 bg-cyan-500/5 text-foreground/90',
                    )}
                  >
                    <span className="font-semibold">{PLATFORM_GROWTH_PULSE_STATIONS_PHASE1.titleAr}: </span>
                    {PLATFORM_GROWTH_PULSE_STATIONS_PHASE1.bodyAr}
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {isDashboard && activationState === 'post_activation' && (
        <p
          className={cn(
            'text-sm font-semibold leading-relaxed text-right rounded-lg border px-4 py-3',
            'border-primary/30 bg-primary/10 text-foreground',
          )}
        >
          {PLATFORM_GROWTH_DASHBOARD_PERIMETER_NOTE_AR}
        </p>
      )}

      {showCompliance && !isCompact && (
        <p
          className={cn(
            'text-[10px] leading-relaxed text-right flex items-start gap-1.5',
            isDarkRegister ? 'text-slate-600' : 'text-muted-foreground',
          )}
        >
          <CircleDot className="h-3 w-3 shrink-0 mt-0.5 opacity-60" />
          {PLATFORM_GROWTH_COMPLIANCE_NOTE_AR}
        </p>
      )}
    </div>
  );
}
