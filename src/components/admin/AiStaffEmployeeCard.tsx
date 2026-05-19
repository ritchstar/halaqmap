import { ArrowLeft, Lock, Scale, Shield, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { AiStaffAgentIconKind } from '@/config/adminAiStaffOffice';
import type { ZatcaAttentionLevel } from '@/hooks/useZatcaTaxAdvisorAttention';
import { cn } from '@/lib/utils';

type Props = {
  shortName: string;
  headline?: string;
  roleDescription: string;
  accentClass: string;
  available: boolean;
  comingSoonLabel?: string;
  locked?: boolean;
  statusBadgeAr?: string;
  ctaLabelAr?: string;
  iconKind?: AiStaffAgentIconKind;
  attentionLevel?: ZatcaAttentionLevel;
  onActivate?: () => void;
};

function StaffIcon({ kind, shortName }: { kind?: AiStaffAgentIconKind; shortName: string }) {
  if (kind === 'zatca_shield') {
    return (
      <span className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-amber-400/40 bg-gradient-to-br from-amber-500/25 to-cyan-500/15 shadow-[0_0_16px_rgba(251,191,36,0.25)]">
        <Shield className="h-6 w-6 text-amber-200 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]" strokeWidth={1.75} />
        <Scale className="absolute -bottom-1 -left-1 h-4 w-4 text-cyan-300/90" aria-hidden />
      </span>
    );
  }
  if (kind === 'treasurer') {
    return (
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/20 to-cyan-500/10 text-2xl shadow-inner">
        🪙
      </span>
    );
  }
  return (
    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border bg-background/80 text-2xl shadow-inner">
      {shortName.includes(' ') ? shortName.split(' ').slice(-1)[0] : '🤖'}
    </span>
  );
}

function AttentionDot({ level }: { level: ZatcaAttentionLevel }) {
  if (level === 'none') return null;
  return (
    <span
      className={cn(
        'absolute -top-1 -right-1 z-20 h-3.5 w-3.5 rounded-full border-2 border-background',
        level === 'critical'
          ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.9)] animate-pulse'
          : 'bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.85)] animate-pulse',
      )}
      title={level === 'critical' ? 'تنبيه حرج — ZATCA' : 'تحذير امتثال — ZATCA'}
      aria-hidden
    />
  );
}

export function AiStaffEmployeeCard({
  shortName,
  headline,
  roleDescription,
  accentClass,
  available,
  comingSoonLabel,
  locked,
  statusBadgeAr,
  ctaLabelAr,
  iconKind,
  attentionLevel = 'none',
  onActivate,
}: Props) {
  const interactive = available && !locked && Boolean(onActivate);
  const title = headline ?? shortName;

  return (
    <article
      className={cn(
        'group relative flex h-full min-h-[220px] flex-col rounded-xl border bg-gradient-to-br p-5 shadow-sm transition-all duration-300',
        accentClass,
        interactive && 'cursor-pointer hover:-translate-y-0.5 hover:shadow-md hover:border-primary/40',
        !interactive && 'opacity-80',
      )}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      onClick={interactive ? onActivate : undefined}
      onKeyDown={
        interactive
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onActivate?.();
              }
            }
          : undefined
      }
    >
      <AttentionDot level={attentionLevel} />

      <div className="flex items-start justify-between gap-2 mb-3">
        <StaffIcon kind={iconKind} shortName={shortName} />
        {comingSoonLabel ? (
          <Badge variant="secondary" className="text-xs">
            {comingSoonLabel}
          </Badge>
        ) : locked ? (
          <Badge variant="outline" className="gap-1 text-xs">
            <Lock className="h-3 w-3" />
            صلاحية مطلوبة
          </Badge>
        ) : statusBadgeAr ? (
          <Badge className="gap-1 border-amber-400/40 bg-amber-500/20 text-xs text-amber-950 hover:bg-amber-500/25 dark:text-amber-50">
            <Sparkles className="h-3 w-3" />
            {statusBadgeAr}
          </Badge>
        ) : (
          <Badge className="gap-1 bg-emerald-600/90 text-xs hover:bg-emerald-600">
            <Sparkles className="h-3 w-3" />
            نشط
          </Badge>
        )}
      </div>

      <h3 className="text-lg font-bold leading-snug text-foreground">{title}</h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{roleDescription}</p>

      {interactive && (
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className={cn(
            'mt-4 w-full justify-between group-hover:text-primary-foreground',
            iconKind === 'zatca_shield'
              ? 'group-hover:bg-gradient-to-l group-hover:from-amber-500 group-hover:to-cyan-500'
              : 'group-hover:bg-primary',
          )}
          onClick={(e) => {
            e.stopPropagation();
            onActivate?.();
          }}
        >
          <span>{ctaLabelAr ?? 'فتح المكتب'}</span>
          <ArrowLeft className="h-4 w-4" />
        </Button>
      )}
    </article>
  );
}
