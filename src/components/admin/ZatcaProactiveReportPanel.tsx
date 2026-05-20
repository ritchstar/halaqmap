import type {
  ZatcaComplianceReport,
  ZatcaExternalIntelBrief,
  ZatcaHypotheticalScenario,
} from '@/types/zatcaTaxAdvisor';

function urgencyLabel(urgency: ZatcaComplianceReport['vatActivationGuidance']['urgency']): string {
  switch (urgency) {
    case 'immediate':
      return 'فوري';
    case 'prepare_now':
      return 'تجهيز الآن';
    case 'prepare_soon':
      return 'تجهيز قريب';
    default:
      return 'مراقبة';
  }
}

function urgencyClass(urgency: ZatcaComplianceReport['vatActivationGuidance']['urgency']): string {
  switch (urgency) {
    case 'immediate':
      return 'border-red-400/40 bg-red-500/10 text-red-100';
    case 'prepare_now':
      return 'border-amber-400/40 bg-amber-500/10 text-amber-100';
    case 'prepare_soon':
      return 'border-orange-400/35 bg-orange-500/10 text-orange-100';
    default:
      return 'border-slate-500/40 bg-slate-800/80 text-slate-200';
  }
}

function ScenarioRow({ s }: { s: ZatcaHypotheticalScenario }) {
  return (
    <tr className="border-b border-slate-700/80 last:border-0">
      <td className="py-2.5 pe-3 text-sm text-slate-200">{s.labelAr}</td>
      <td className="py-2.5 px-2 text-end tabular-nums text-slate-300">{s.subtotalSar.toLocaleString('ar-SA')}</td>
      <td className="py-2.5 px-2 text-end tabular-nums text-slate-400">{s.vatRatePercent}%</td>
      <td className="py-2.5 px-2 text-end tabular-nums text-slate-300">{s.vatSar.toLocaleString('ar-SA')}</td>
      <td className="py-2.5 ps-2 text-end tabular-nums font-semibold text-slate-100">
        {s.totalSar.toLocaleString('ar-SA')}
      </td>
    </tr>
  );
}

type Props = {
  report: ZatcaComplianceReport;
  externalIntel?: ZatcaExternalIntelBrief | null;
  onRefreshIntel?: () => void;
  intelRefreshing?: boolean;
};

export function ZatcaProactiveReportPanel({ report, externalIntel, onRefreshIntel, intelRefreshing }: Props) {
  const g = report.vatActivationGuidance;

  return (
    <div className="space-y-4 rounded-xl border border-slate-600/50 bg-slate-900/60 p-4 md:p-5">
      <header className="space-y-1 text-right">
        <h4 className="text-base font-bold text-slate-100">تقرير استباقي — زميل خازن · ZATCA</h4>
        <p className="text-xs leading-relaxed text-slate-400">{report.disclaimerAr}</p>
      </header>

      <div className={`rounded-lg border px-4 py-3 text-sm leading-relaxed ${urgencyClass(g.urgency)}`}>
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wide opacity-80">{g.triggerLabelAr}</span>
          <span className="rounded-md border border-current/30 px-2 py-0.5 text-[11px] font-semibold">
            أولوية: {urgencyLabel(g.urgency)}
          </span>
        </div>
        <p>{g.summaryAr}</p>
        <p className="mt-2 text-xs opacity-90">
          الرقم المرجعي لتفعيل العرض:{' '}
          <strong className="tabular-nums">{g.triggerSar.toLocaleString('ar-SA')} ر.س</strong> إيرادات مُرصَدة ·
          اختياري: {g.voluntaryLimitSar.toLocaleString('ar-SA')} · إلزامي: {g.mandatoryLimitSar.toLocaleString('ar-SA')}{' '}
          · نسبة مُجهَّزة: {g.preparedVatRatePercent}%
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-slate-700 bg-slate-800/60 p-3 text-right">
          <p className="text-[11px] text-slate-500">إيرادات مُرصَدة</p>
          <p className="text-lg font-bold tabular-nums text-white">
            {report.currentRevenueSar.toLocaleString('ar-SA')} <span className="text-sm font-normal">ر.س</span>
          </p>
        </div>
        <div className="rounded-lg border border-slate-700 bg-slate-800/60 p-3 text-right">
          <p className="text-[11px] text-slate-500">وتيرة يومية تقريبية</p>
          <p className="text-lg font-bold tabular-nums text-white">
            {report.dailyVelocitySar.toLocaleString('ar-SA')} <span className="text-sm font-normal">ر.س</span>
          </p>
        </div>
        <div className="rounded-lg border border-slate-700 bg-slate-800/60 p-3 text-right">
          <p className="text-[11px] text-slate-500">تقدير 30 يوماً</p>
          <p className="text-lg font-bold tabular-nums text-white">
            {(report.projectedRevenue30dSar ?? 0).toLocaleString('ar-SA')}{' '}
            <span className="text-sm font-normal">ر.س</span>
          </p>
        </div>
        <div className="rounded-lg border border-slate-700 bg-slate-800/60 p-3 text-right">
          <p className="text-[11px] text-slate-500">أيام للحد الإلزامي</p>
          <p className="text-lg font-bold tabular-nums text-white">
            {report.daysToMandatoryLimit != null ? report.daysToMandatoryLimit : '—'}
          </p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-slate-700">
        <table className="w-full min-w-[520px] text-right text-sm">
          <thead>
            <tr className="border-b border-slate-700 bg-slate-800/80 text-xs text-slate-400">
              <th className="py-2 pe-3 font-medium">حد الامتثال</th>
              <th className="py-2 px-2 font-medium">الحد (ر.س)</th>
              <th className="py-2 px-2 font-medium">متبقٍ</th>
              <th className="py-2 ps-2 font-medium">الحالة</th>
            </tr>
          </thead>
          <tbody>
            {report.thresholds.map((t) => (
              <tr key={t.id} className="border-b border-slate-800 last:border-0">
                <td className="py-2.5 pe-3 text-slate-200">{t.labelAr}</td>
                <td className="py-2.5 px-2 tabular-nums text-slate-300">{t.limitSar.toLocaleString('ar-SA')}</td>
                <td className="py-2.5 px-2 tabular-nums text-slate-400">{t.remainingSar.toLocaleString('ar-SA')}</td>
                <td className="py-2.5 ps-2">
                  <span
                    className={`text-xs font-semibold ${t.breached ? 'text-amber-300' : 'text-slate-500'}`}
                  >
                    {t.breached ? 'تم البلوغ' : 'لم يُبلَغ'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div>
        <h5 className="mb-2 text-sm font-semibold text-slate-200">احتسابات افتراضية (ض.ق.م {g.preparedVatRatePercent}%)</h5>
        <div className="overflow-x-auto rounded-lg border border-slate-700">
          <table className="w-full min-w-[560px] text-right text-sm">
            <thead>
              <tr className="border-b border-slate-700 bg-slate-800/80 text-xs text-slate-400">
                <th className="py-2 pe-3 font-medium">السيناريو</th>
                <th className="py-2 px-2 font-medium">أساس (ر.س)</th>
                <th className="py-2 px-2 font-medium">النسبة</th>
                <th className="py-2 px-2 font-medium">ض.ق.م</th>
                <th className="py-2 ps-2 font-medium">الإجمالي</th>
              </tr>
            </thead>
            <tbody>
              {report.hypotheticalScenarios.map((s) => (
                <ScenarioRow key={`${s.kind}-${s.labelAr}`} s={s} />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {externalIntel ? (
        <div className="space-y-3 rounded-lg border border-cyan-500/25 bg-cyan-950/20 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h5 className="text-sm font-semibold text-cyan-100">مسح مصادر ZATCA ذات الصلة</h5>
            {onRefreshIntel ? (
              <button
                type="button"
                className="text-xs text-cyan-300 underline-offset-2 hover:underline disabled:opacity-50"
                disabled={intelRefreshing}
                onClick={onRefreshIntel}
              >
                {intelRefreshing ? 'جاري التحديث…' : 'تحديث المصادر'}
              </button>
            ) : null}
          </div>
          <p className="text-xs leading-relaxed text-cyan-100/80">{externalIntel.summaryAr}</p>
          <ul className="space-y-2">
            {externalIntel.sources.map((src) => (
              <li key={src.id} className="rounded-md border border-slate-700/80 bg-slate-900/50 p-3 text-right">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <a
                    href={src.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-cyan-200 hover:underline"
                  >
                    {src.labelAr}
                  </a>
                  <span className="text-[10px] text-slate-500">{src.orgAr}</span>
                </div>
                {src.ok ? (
                  <>
                    {src.title ? <p className="mt-1 text-xs text-slate-300">{src.title}</p> : null}
                    {src.snippetAr ? (
                      <p className="mt-1 text-[11px] leading-relaxed text-slate-500 line-clamp-3">{src.snippetAr}</p>
                    ) : null}
                  </>
                ) : (
                  <p className="mt-1 text-xs text-amber-300/90">{src.errorAr ?? 'تعذر القراءة'}</p>
                )}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
