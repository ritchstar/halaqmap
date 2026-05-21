import { ArrowLeft, Cog, Gavel, Lock, Moon, Scale, Shield, Siren, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { staffTheme } from '@/components/admin/staff/staffTheme';
import type { AiStaffAgentIconKind } from '@/modules/ai-staff/types';
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
  eliteCovert?: boolean;
  attentionLevel?: ZatcaAttentionLevel;
  onActivate?: () => void;
};

function StaffIcon({ kind, shortName }: { kind?: AiStaffAgentIconKind; shortName: string }) {
  const base = 'flex h-10 w-10 shrink-0 items-center justify-center rounded-md border';

  if (kind === 'zatca_shield') {
    return (
      <span className={cn(base, 'border-amber-700/50 bg-amber-950/40 relative')}>
        <Shield className="h-5 w-5 text-amber-300" strokeWidth={2} />
        <Scale className="absolute -bottom-1 -left-1 h-3.5 w-3.5 text-slate-400" aria-hidden />
      </span>
    );
  }
  if (kind === 'treasurer') {
    return (
      <span className={cn(base, 'border-emerald-700/50 bg-emerald-950/40 text-lg')}>🪙</span>
    );
  }
  if (kind === 'digital_shift') {
    return (
      <span className={cn(base, 'border-indigo-700/50 bg-indigo-950/40')}>
        <Moon className="h-5 w-5 text-indigo-300" strokeWidth={2} />
      </span>
    );
  }
  if (kind === 'partner_liaison') {
    return (
      <span className={cn(base, 'border-violet-700/50 bg-violet-950/40')}>
        <Users className="h-5 w-5 text-violet-300" strokeWidth={2} />
      </span>
    );
  }
  if (kind === 'fleet_director') {
    return (
      <span className={cn(base, 'border-red-800/60 bg-red-950/50')}>
        <Shield className="h-5 w-5 text-red-300" strokeWidth={2} />
      </span>
    );
  }
  if (kind === 'crisis_advisor') {
    return (
      <span className={cn(base, 'border-orange-700/60 bg-orange-950/50')}>
        <Siren className="h-5 w-5 text-orange-300" strokeWidth={2} />
      </span>
    );
  }
  if (kind === 'public_prosecutor') {
    return (
      <span className={cn(base, 'border-slate-500/60 bg-slate-950/60')}>
        <Gavel className="h-5 w-5 text-slate-200" strokeWidth={2} />
      </span>
    );
  }
  if (kind === 'technical_consultant') {
    return (
      <span className={cn(base, 'border-cyan-800/50 bg-cyan-950/40')}>
        <Cog className="h-5 w-5 text-cyan-300" strokeWidth={2} />
      </span>
    );
  }
  return (
    <span className={cn(base, 'border-slate-600 bg-slate-700/50 text-lg')}>
      {shortName.includes(' ') ? shortName.split(' ').slice(-1)[0] : '🤖'}
    </span>
  );
}

function AttentionDot({ level }: { level: ZatcaAttentionLevel }) {
  if (level === 'none') return null;
  return (
    <span
      className={cn(
        'absolute -top-1 -right-1 z-20 h-3 w-3 rounded-full border-2 border-slate-800',
        level === 'critical' ? 'bg-red-500' : 'bg-amber-400',
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
  eliteCovert,
  attentionLevel = 'none',
  onActivate,
}: Props) {
  const interactive = available && !locked && Boolean(onActivate);
  const title = headline ?? shortName;

  return (
    <article
      className={cn(
        'relative flex h-full min-h-[210px] flex-col rounded-lg border p-5 shadow-sm transition-colors duration-200',
        accentClass,
        interactive && 'cursor-pointer hover:border-slate-600',
        !interactive && 'opacity-75',
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

      <div className="mb-3 flex items-start justify-between gap-2">
        <StaffIcon kind={iconKind} shortName={shortName} />
        {comingSoonLabel ? (
          <Badge variant="secondary" className="text-xs bg-slate-700 text-slate-300 border-slate-600">
            {comingSoonLabel}
          </Badge>
        ) : locked ? (
          <Badge variant="outline" className="gap-1 text-xs border-slate-600 text-slate-400">
            <Lock className="h-3 w-3" />
            صلاحية مطلوبة
          </Badge>
        ) : statusBadgeAr ? (
          <span className={eliteCovert ? staffTheme.badgeCovert : staffTheme.badgeWarn}>
            {statusBadgeAr}
          </span>
        ) : (
          <span className={staffTheme.badgeOk}>نشط</span>
        )}
      </div>

      <h3 className="text-base font-semibold leading-snug text-slate-100">{title}</h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-400">{roleDescription}</p>

      {interactive ? (
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="mt-4 w-full justify-between bg-slate-700 text-slate-100 hover:bg-slate-600 border-slate-600"
          onClick={(e) => {
            e.stopPropagation();
            onActivate?.();
          }}
        >
          <span>{ctaLabelAr ?? 'فتح المكتب'}</span>
          <ArrowLeft className="h-4 w-4" />
        </Button>
      ) : null}
    </article>
  );
}
