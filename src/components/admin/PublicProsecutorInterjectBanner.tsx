import type { PublicProsecutorGovernanceAction } from '@/modules/ai-staff/types';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type Props = {
  interject: PublicProsecutorGovernanceAction;
  className?: string;
};

export function PublicProsecutorInterjectBanner({ interject, className }: Props) {
  return (
    <div
      className={cn(
        'rounded-lg border px-4 py-3 text-right',
        interject.severity === 'urgent'
          ? 'border-red-800/60 bg-red-950/40 text-red-100'
          : 'border-amber-700/50 bg-amber-950/30 text-amber-100',
        className,
      )}
      role="alert"
    >
      <div className="mb-2 flex flex-wrap items-center justify-end gap-2">
        <Badge className="border-slate-500 bg-slate-950 text-[10px] text-slate-200">المدعي العام</Badge>
        {interject.p0RecoveryRequired ? (
          <Badge variant="destructive" className="text-[10px]">
            P0 Required
          </Badge>
        ) : null}
      </div>
      <p className="text-sm font-bold">{interject.headlineAr}</p>
      <p className="mt-1 text-xs leading-relaxed text-slate-200">{interject.directiveAr}</p>
      {interject.targetAgent ? (
        <p className="mt-2 text-[11px] text-slate-400">الوكيل المستهدف: {interject.targetAgent}</p>
      ) : null}
    </div>
  );
}
