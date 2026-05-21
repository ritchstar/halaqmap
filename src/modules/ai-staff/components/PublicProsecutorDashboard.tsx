import { useCallback, useEffect, useState } from 'react';
import { Loader2, Radar, Scale, ShieldAlert } from 'lucide-react';
import { FounderGlassCard } from '@/components/admin/founder/FounderGlassCard';
import { founderTheme } from '@/components/admin/founder/founderTheme';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  auditPublicProsecutorCompliance,
  fetchPublicProsecutorDashboard,
  syncPublicProsecutorRadar,
} from '@/lib/publicProsecutorDashboardRemote';
import { PublicProsecutorWorkingPapers } from '@/modules/ai-staff/components/PublicProsecutorWorkingPapers';
import type { PublicProsecutorDashboardSnapshot } from '@/modules/ai-staff/types';
import { toast } from '@/components/ui/sonner';

type Props = {
  compact?: boolean;
  onOpenLab?: () => void;
};

export function PublicProsecutorDashboard({ compact = false, onOpenLab }: Props) {
  const [snapshot, setSnapshot] = useState<PublicProsecutorDashboardSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    const result = await fetchPublicProsecutorDashboard();
    setLoading(false);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    setSnapshot(result.snapshot);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const handleRadarSync = async () => {
    setSyncing(true);
    const result = await syncPublicProsecutorRadar();
    setSyncing(false);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    if (result.drafted) {
      toast.success('تم إعداد تقرير وقائي في التغذية التشغيلية.');
    } else {
      toast.message(result.reason === 'no_inspector_pattern' ? 'لا نمط Inspector حالياً.' : 'لم يُنشأ تقرير جديد.');
    }
    setSnapshot((prev) =>
      prev
        ? { ...prev, workingPapers: result.workingPapers, lastSyncedAt: new Date().toISOString() }
        : prev,
    );
  };

  const handleComplianceAudit = async () => {
    setSyncing(true);
    const result = await auditPublicProsecutorCompliance();
    setSyncing(false);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.message(
      result.complianceGaps > 0
        ? `رُصدت ${result.complianceGaps} فجوة امتثال في التسجيل.`
        : 'مسار ComplianceCheckbox متوافق في آخر الدفعة.',
    );
    setSnapshot((prev) =>
      prev ? { ...prev, complianceGaps: result.complianceGaps, workingPapers: result.workingPapers } : prev,
    );
  };

  return (
    <FounderGlassCard className={compact ? 'p-5 md:p-6' : 'p-6 md:p-7'}>
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="border-slate-600 bg-slate-900 text-slate-200 hover:bg-slate-800"
            disabled={syncing}
            onClick={() => void handleRadarSync()}
          >
            {syncing ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : <Radar className="ml-2 h-4 w-4" />}
            Radar Sync
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="border-slate-600 bg-slate-900 text-slate-200 hover:bg-slate-800"
            disabled={syncing}
            onClick={() => void handleComplianceAudit()}
          >
            <Scale className="ml-2 h-4 w-4" />
            Compliance Audit
          </Button>
          {onOpenLab ? (
            <Button
              type="button"
              size="sm"
              className="bg-slate-100 text-slate-900 hover:bg-white"
              onClick={onOpenLab}
            >
              مكتب المدعي العام
            </Button>
          ) : null}
        </div>
        <div className="flex-1 space-y-2 text-right">
          <div className="flex flex-wrap items-center justify-end gap-2">
            <Badge className="border-slate-500 bg-slate-900 text-slate-200">Central Governance</Badge>
            {snapshot?.crisisWatchActive ? (
              <Badge className="border-orange-700/50 bg-orange-950/40 text-orange-200">Crisis Watch</Badge>
            ) : null}
          </div>
          <h3 className={`${founderTheme.sectionTitle} flex items-center justify-end gap-2`}>
            <ShieldAlert className="h-5 w-5 text-slate-300" />
            أوراق عمل المدعي العام
          </h3>
          <p className="text-sm leading-relaxed text-slate-400">
            تجميع استباقي لتقارير الامتثال — Radar · B2B Registration · Crisis Watch · Professional Sovereignty.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-8 text-slate-400">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="text-sm">جاري تحميل أوراق العمل…</span>
        </div>
      ) : snapshot ? (
        <>
          <div className="mb-4 grid gap-3 sm:grid-cols-3">
            {[
              { label: 'Inspector (24س)', value: snapshot.inspectorPulseCount24h },
              { label: 'فجوات امتثال', value: snapshot.complianceGaps },
              { label: 'تنبيهات سيادة', value: snapshot.sovereigntyAlerts },
            ].map((metric) => (
              <div
                key={metric.label}
                className="rounded-lg border border-slate-700/80 bg-slate-950/50 px-4 py-3 text-right"
              >
                <p className="text-xs text-slate-500">{metric.label}</p>
                <p className="text-xl font-bold text-white">{metric.value}</p>
              </div>
            ))}
          </div>
          <PublicProsecutorWorkingPapers papers={snapshot.workingPapers} compact={compact} />
        </>
      ) : null}
    </FounderGlassCard>
  );
}
