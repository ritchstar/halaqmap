import { useCallback, useEffect, useState } from 'react';
import { Activity, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StaffProfessionalCard } from '@/components/admin/staff/StaffProfessionalCard';
import { staffTheme } from '@/components/admin/staff/staffTheme';
import { fetchOpsControllerFeed } from '@/lib/opsControllerRemote';
import {
  opsReportCategoryLabelAr,
  opsReportSeverityLabelAr,
} from '@/modules/ops-controller/registry';
import type { OpsControllerReport } from '@/modules/ops-controller/types';
import { cn } from '@/lib/utils';

function formatSubmittedAt(iso: string): string {
  try {
    return new Intl.DateTimeFormat('ar-SA', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function severityBadgeClass(severity: OpsControllerReport['severity']): string {
  if (severity === 'urgent') return staffTheme.badgeWarn;
  if (severity === 'watch') return staffTheme.badgeNeutral;
  return staffTheme.badgeOk;
}

type Props = {
  isActive?: boolean;
  pollMs?: number;
  compact?: boolean;
  titleAr?: string;
  subtitleAr?: string;
};

export function FounderOperationalFeedPanel({
  isActive = true,
  pollMs = 15_000,
  compact = false,
  titleAr = 'التغذية التشغيلية',
  subtitleAr = 'تقارير OPS_MANAGER — مُوسَمة بـ client_id والوقت.',
}: Props) {
  const [reports, setReports] = useState<OpsControllerReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const result = await fetchOpsControllerFeed(compact ? 12 : 30);
    if (!result.ok) {
      setError(result.error);
      setLoading(false);
      return;
    }
    setError(null);
    setReports(result.body.reports);
    setLoading(false);
  }, [compact]);

  useEffect(() => {
    if (!isActive) return;
    setLoading(true);
    void load();
  }, [isActive, load]);

  useEffect(() => {
    if (!isActive || pollMs <= 0) return;
    const id = window.setInterval(() => void load(), pollMs);
    return () => window.clearInterval(id);
  }, [isActive, load, pollMs]);

  return (
    <StaffProfessionalCard className={cn('p-5 md:p-6', compact && 'p-4')}>
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1 text-right">
          <div className="flex items-center justify-end gap-2">
            <Activity className="h-4 w-4 text-slate-400" aria-hidden />
            <p className={staffTheme.pageEyebrow}>Operations Feed</p>
          </div>
          <h3 className={compact ? staffTheme.sectionTitle : staffTheme.pageTitle}>{titleAr}</h3>
          {!compact ? <p className={staffTheme.muted}>{subtitleAr}</p> : null}
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => {
            setLoading(true);
            void load();
          }}
          className="text-slate-400 hover:bg-slate-700 hover:text-slate-100"
          aria-label="تحديث التغذية"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {loading && reports.length === 0 ? (
        <div className="flex items-center justify-center gap-2 py-8 text-sm text-slate-400">
          <Loader2 className="h-4 w-4 animate-spin" />
          جاري تحميل التقارير...
        </div>
      ) : null}

      {error ? (
        <p className="rounded-lg border border-amber-800/50 bg-amber-950/30 px-3 py-2 text-sm text-amber-200">
          {error}
        </p>
      ) : null}

      {!loading && !error && reports.length === 0 ? (
        <p className="py-6 text-center text-sm text-slate-500">لا توجد تقارير تشغيلية بعد.</p>
      ) : null}

      <ul className="m-0 list-none space-y-3 p-0">
        {reports.map((report) => (
          <li
            key={report.id}
            className="rounded-lg border border-slate-700 bg-slate-900/80 p-4 text-right"
          >
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <span className={severityBadgeClass(report.severity)}>
                {opsReportSeverityLabelAr(report.severity)}
              </span>
              <time className="text-[11px] text-slate-500" dateTime={report.submittedAt}>
                {formatSubmittedAt(report.submittedAt)}
              </time>
            </div>
            <p className="text-sm font-semibold text-slate-100">{report.title}</p>
            <p className="mt-1 text-sm leading-relaxed text-slate-400">{report.summary}</p>
            <dl className="mt-3 grid gap-1 text-[11px] text-slate-500 sm:grid-cols-2">
              <div>
                <dt className="inline text-slate-600">client_id: </dt>
                <dd className="inline font-mono text-slate-300">{report.clientId}</dd>
              </div>
              {report.clientLabel ? (
                <div>
                  <dt className="inline text-slate-600">المحل: </dt>
                  <dd className="inline text-slate-300">{report.clientLabel}</dd>
                </div>
              ) : null}
              <div>
                <dt className="inline text-slate-600">التصنيف: </dt>
                <dd className="inline text-slate-300">{opsReportCategoryLabelAr(report.category)}</dd>
              </div>
              <div>
                <dt className="inline text-slate-600">المُبلّغ: </dt>
                <dd className="inline text-slate-300">{report.reporterEmail}</dd>
              </div>
            </dl>
          </li>
        ))}
      </ul>
    </StaffProfessionalCard>
  );
}
