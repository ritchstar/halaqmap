import { useCallback, useEffect, useState } from 'react';
import { Check, Loader2, Shield, X } from 'lucide-react';
import { FounderGlassCard } from '@/components/admin/founder/FounderGlassCard';
import { founderTheme } from '@/components/admin/founder/founderTheme';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  approveEngineeringExecutionRemote,
  fetchPendingEngineeringApprovals,
  rejectEngineeringExecutionRemote,
} from '@/lib/engineeringCouncilRemote';
import type { EngineeringExecution } from '@/modules/ai-staff/types';
import { toast } from '@/components/ui/sonner';

export function EngineeringPendingApprovalsPanel() {
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [pending, setPending] = useState<EngineeringExecution[]>([]);

  const refresh = useCallback(async () => {
    setLoading(true);
    const result = await fetchPendingEngineeringApprovals();
    setLoading(false);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    setPending(result.pendingApprovals);
  }, []);

  useEffect(() => {
    void refresh();
    const id = window.setInterval(() => void refresh(), 30_000);
    return () => window.clearInterval(id);
  }, [refresh]);

  const handleApprove = async (executionId: string) => {
    setBusyId(executionId);
    const result = await approveEngineeringExecutionRemote(executionId);
    setBusyId(null);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success(result.messageAr);
    void refresh();
  };

  const handleReject = async (executionId: string) => {
    setBusyId(executionId);
    const result = await rejectEngineeringExecutionRemote(executionId, 'Founder rejected execution');
    setBusyId(null);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.message('تم رفض التنفيذ.');
    void refresh();
  };

  return (
    <FounderGlassCard className="p-5 md:p-6">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <Badge className="border-cyan-700/40 bg-cyan-950/40 text-cyan-100">Pending Approval</Badge>
        <div className="flex-1 space-y-1 text-right">
          <h3 className={`${founderTheme.sectionTitle} flex items-center justify-end gap-2`}>
            <Shield className="h-5 w-5 text-cyan-300" />
            موافقة التنفيذ — Engineering Wing
          </h3>
          <p className="text-sm text-slate-400">
            لا يُنفَّذ refactor على Draft Branch / Cursor إلا بعد «Approve Execution».
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-8 text-slate-400">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="text-sm">جاري التحميل…</span>
        </div>
      ) : pending.length === 0 ? (
        <p className="text-center text-sm text-slate-500 py-6">لا مهام معلّقة — المجلس في وضع الاستعداد.</p>
      ) : (
        <div className="space-y-3">
          {pending.map((exec) => (
            <article
              key={exec.id}
              className="rounded-lg border border-cyan-900/40 bg-slate-950/60 p-4 text-right"
            >
              <p className="font-semibold text-white">{exec.title}</p>
              <p className="mt-1 text-xs text-slate-400">{exec.taskDescription.slice(0, 200)}</p>
              {exec.draftBranch ? (
                <p className="mt-2 text-xs text-cyan-200">Draft: {exec.draftBranch}</p>
              ) : null}
              {exec.prosecutorVerdict ? (
                <p className="mt-2 text-xs text-slate-300">
                  Prosecutor:{' '}
                  {String((exec.prosecutorVerdict as { headlineAr?: string }).headlineAr ?? '—')}
                </p>
              ) : null}
              <div className="mt-3 flex flex-wrap gap-2 justify-end">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="border-slate-600"
                  disabled={busyId === exec.id}
                  onClick={() => void handleReject(exec.id)}
                >
                  <X className="ml-2 h-4 w-4" />
                  رفض
                </Button>
                <Button
                  type="button"
                  size="sm"
                  className="bg-emerald-700 hover:bg-emerald-600 text-white"
                  disabled={busyId === exec.id}
                  onClick={() => void handleApprove(exec.id)}
                >
                  {busyId === exec.id ? (
                    <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="ml-2 h-4 w-4" />
                  )}
                  Approve Execution
                </Button>
              </div>
            </article>
          ))}
        </div>
      )}
    </FounderGlassCard>
  );
}
