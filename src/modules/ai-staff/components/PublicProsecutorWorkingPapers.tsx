import { Badge } from '@/components/ui/badge';
import type { ProsecutorWorkingPaper } from '@/modules/ai-staff/types';
import { cn } from '@/lib/utils';

const SEVERITY_CLASS: Record<ProsecutorWorkingPaper['severity'], string> = {
  info: 'border-slate-600/60 bg-slate-900/50 text-slate-300',
  watch: 'border-amber-700/40 bg-amber-950/30 text-amber-100',
  urgent: 'border-red-800/50 bg-red-950/30 text-red-100',
};

const KIND_LABEL: Record<ProsecutorWorkingPaper['kind'], string> = {
  radar_inspector: 'Radar Sync',
  compliance_deviation: 'Compliance',
  crisis_watch: 'Crisis Watch',
  sovereignty_alert: 'Sovereignty',
  proactive_audit: 'Audit',
};

type Props = {
  papers: ProsecutorWorkingPaper[];
  compact?: boolean;
};

export function PublicProsecutorWorkingPapers({ papers, compact = false }: Props) {
  if (papers.length === 0) {
    return (
      <p className="text-right text-sm text-slate-400">لا توجد أوراق عمل حالياً — التدقيق الاستباقي قيد التشغيل.</p>
    );
  }

  return (
    <div className={cn('space-y-3', compact && 'space-y-2')}>
      {papers.map((paper) => (
        <article
          key={paper.id}
          className={cn(
            'rounded-lg border px-4 py-3 text-right',
            SEVERITY_CLASS[paper.severity],
            compact && 'px-3 py-2',
          )}
        >
          <div className="mb-2 flex flex-wrap items-center justify-end gap-2">
            <Badge variant="outline" className="border-slate-600 bg-slate-950/40 text-[10px] text-slate-300">
              {KIND_LABEL[paper.kind]}
            </Badge>
            {paper.targetAgent ? (
              <Badge variant="outline" className="border-slate-500 text-[10px] text-slate-400">
                {paper.targetAgent}
              </Badge>
            ) : null}
          </div>
          <h4 className={cn('font-semibold text-slate-100', compact ? 'text-sm' : 'text-base')}>
            {paper.titleAr}
          </h4>
          <p className={cn('mt-1 leading-relaxed text-slate-300', compact ? 'text-xs' : 'text-sm')}>
            {paper.summaryAr}
          </p>
          {paper.recommendedActionAr ? (
            <p className={cn('mt-2 text-slate-400', compact ? 'text-[11px]' : 'text-xs')}>
              <span className="font-semibold text-slate-300">الإجراء الموصى به: </span>
              {paper.recommendedActionAr}
            </p>
          ) : null}
        </article>
      ))}
    </div>
  );
}
