import { useCallback, useEffect, useState } from 'react';
import { AlertTriangle, Loader2, Radar, Shield, ShieldCheck, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { savePlatformVatSettings } from '@/lib/platformVatSettings';
import {
  activateZatcaTaxLiveRemote,
  fetchZatcaTaxAdvisorStateRemote,
  runZatcaTaxRadarRemote,
} from '@/lib/zatcaTaxAdvisorRemote';
import type { ZatcaAdminActivationAlert, ZatcaEarlyWarningSignal } from '@/types/zatcaTaxAdvisor';
import { toast } from '@/components/ui/sonner';

type ZatcaTaxActivationAlertProps = {
  /** تشغيل رادار الإيرادات (قراءة / مسح) */
  canRunRadar: boolean;
  /** تفعيل الضريبة الحية على الواجهة */
  canActivate: boolean;
  /** يزداد عند التوجيه من مكتب الشركاء الأذكياء لإعادة التمرير بعد رسم التبويب */
  scrollFocusSignal?: number;
};

function WarningStrip({ signal }: { signal: ZatcaEarlyWarningSignal }) {
  const tone =
    signal.level === 'critical_run_rate'
      ? 'border-amber-400/40 bg-amber-500/10 text-amber-950 dark:text-amber-100'
      : signal.level === 'voluntary_limit'
        ? 'border-orange-400/35 bg-orange-500/10 text-orange-950 dark:text-orange-100'
        : 'border-cyan-400/30 bg-cyan-500/10 text-cyan-950 dark:text-cyan-100';

  return (
    <div className={`rounded-xl border px-4 py-3 text-sm leading-relaxed ${tone}`}>
      <p>{signal.messageAr}</p>
      <p className="mt-1 text-xs opacity-80">
        إجمالي الإيرادات: {signal.totalRevenueSar.toLocaleString('ar-SA')} ر.س · وتيرة يومية تقريبية:{' '}
        {signal.dailyVelocitySar.toLocaleString('ar-SA')} ر.س
        {signal.daysToMandatoryLimit != null ? ` · تقدير للحد الإلزامي: ${signal.daysToMandatoryLimit} يوم` : null}
      </p>
    </div>
  );
}

function FinancialOfficeInitialization({
  uninitialized,
  fetchError,
  canRunRadar,
  loading,
  onRunRadar,
}: {
  uninitialized: boolean;
  fetchError: string | null;
  canRunRadar: boolean;
  loading: boolean;
  onRunRadar: () => void;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-400/35 bg-gradient-to-br from-slate-500/10 via-cyan-500/8 to-slate-950/40 p-6 shadow-[0_0_32px_-10px_rgba(34,211,238,0.35)] min-h-[200px]">
      <span
        className="pointer-events-none absolute inset-0 bg-gradient-to-r from-cyan-400/5 via-transparent to-amber-400/5"
        aria-hidden
      />
      <div className="relative z-10 flex flex-col items-center text-center gap-4">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-400/35 bg-cyan-500/10 shadow-[0_0_20px_rgba(34,211,238,0.25)]">
          <Shield className="h-7 w-7 text-cyan-300" strokeWidth={1.75} aria-hidden />
        </span>
        <div className="space-y-2 max-w-lg">
          <h3 className="text-lg font-bold text-foreground">المكتب المالي جاهز للتشغيل 🛡️</h3>
          <p className="text-sm leading-relaxed text-muted-foreground">
            يرجى الضغط على زر «تحديث رادار الإيرادات» لبدء مسح المعاملات لأول مرة — يفرز الفواتير بالهللة، يحسب
            وتيرة التدفق، ويُظهر تنبيهات الامتثال الضريبي تلقائياً.
          </p>
          {uninitialized ? (
            <p className="text-xs text-cyan-700/90 dark:text-cyan-200/80">
              لم يُسجَّل بعد مسح في قاعدة البيانات (حالة إنتاج أولية) — هذا طبيعي بعد النشر.
            </p>
          ) : null}
          {fetchError ? (
            <p className="text-xs text-amber-800 dark:text-amber-200">
              تعذر تحميل الحالة: {fetchError}. يمكنك إعادة المحاولة عبر زر الرادار أدناه.
            </p>
          ) : null}
        </div>
        {canRunRadar ? (
          <Button
            type="button"
            size="lg"
            className="gap-2 border border-cyan-400/40 bg-gradient-to-l from-slate-600/90 to-cyan-600/90 text-white hover:from-slate-500 hover:to-cyan-500"
            disabled={loading}
            onClick={onRunRadar}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Radar className="h-4 w-4" />}
            تحديث رادار الإيرادات (زميل خازن)
          </Button>
        ) : (
          <p className="text-xs text-muted-foreground">صلاحية عرض المكتب المالي مطلوبة لتشغيل الرادار.</p>
        )}
      </div>
    </div>
  );
}

export function ZatcaTaxActivationAlert({
  canRunRadar,
  canActivate,
  scrollFocusSignal = 0,
}: ZatcaTaxActivationAlertProps) {
  const [loading, setLoading] = useState(true);
  const [activating, setActivating] = useState(false);
  const [alert, setAlert] = useState<ZatcaAdminActivationAlert | null>(null);
  const [warnings, setWarnings] = useState<ZatcaEarlyWarningSignal[]>([]);
  const [uninitialized, setUninitialized] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const applySnapshot = useCallback(
    (snap: Awaited<ReturnType<typeof fetchZatcaTaxAdvisorStateRemote>>) => {
      setAlert(snap.state?.admin_activation_alert ?? null);
      setWarnings(snap.warnings?.length ? snap.warnings : (snap.state?.active_warnings ?? []));
      setUninitialized(snap.uninitialized ?? snap.state == null);
      setFetchError(null);
    },
    [],
  );

  const refresh = useCallback(async () => {
    if (!canRunRadar) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const snap = await fetchZatcaTaxAdvisorStateRemote();
      applySnapshot(snap);
    } catch (e) {
      setAlert(null);
      setWarnings([]);
      setUninitialized(true);
      setFetchError(e instanceof Error ? e.message : 'تعذر الاتصال بالخادم');
    } finally {
      setLoading(false);
    }
  }, [applySnapshot, canRunRadar]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    if (scrollFocusSignal <= 0) return;
    const t = window.setTimeout(() => {
      document.getElementById('zatca-financial-office')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }, 280);
    return () => window.clearTimeout(t);
  }, [scrollFocusSignal]);

  const handleRunRadar = async () => {
    if (!canRunRadar) return;
    setLoading(true);
    try {
      const snap = await runZatcaTaxRadarRemote();
      applySnapshot(snap);
      toast.success('تم تحديث رادار زميل خازن');
    } catch (e) {
      setFetchError(e instanceof Error ? e.message : 'تعذر تشغيل الرادار');
      toast.error(e instanceof Error ? e.message : 'تعذر تشغيل الرادار');
    } finally {
      setLoading(false);
    }
  };

  const handleActivate = async () => {
    if (!canActivate) return;
    setActivating(true);
    try {
      const r = await activateZatcaTaxLiveRemote();
      savePlatformVatSettings(r.uiVatSettings);
      setAlert(null);
      toast.success('تم التفعيل الحي لضريبة القيمة المضافة (15%)');
      await refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'تعذر التفعيل');
    } finally {
      setActivating(false);
    }
  };

  const visibleWarnings = warnings.filter((w) => w.level !== 'mandatory_breached');
  const showInitialization = !loading && !alert && visibleWarnings.length === 0;

  return (
    <div className="space-y-4 min-h-[220px]" data-zatca-office-panel>
      {loading && !alert && visibleWarnings.length === 0 ? (
        <div className="flex min-h-[200px] items-center justify-center gap-2 rounded-xl border border-cyan-400/25 bg-muted/20 px-4 py-8 text-sm text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin text-cyan-600" aria-hidden />
          جاري تحميل رادار زميل خازن…
        </div>
      ) : null}

      {!loading
        ? visibleWarnings.map((w) => <WarningStrip key={`${w.level}-${w.triggeredAt}`} signal={w} />)
        : null}

      {!loading && alert ? (
        <div className="relative overflow-hidden rounded-2xl border border-cyan-400/45 bg-gradient-to-br from-cyan-500/15 via-slate-950/90 to-indigo-950/80 p-5 shadow-[0_0_40px_-8px_rgba(34,211,238,0.55)] backdrop-blur-md">
          <span
            className="pointer-events-none absolute inset-0 animate-pulse bg-gradient-to-r from-cyan-400/10 via-transparent to-cyan-400/10"
            aria-hidden
          />
          <div className="relative z-10 space-y-4 text-right">
            <div className="flex flex-wrap items-center justify-end gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-300/50 bg-cyan-500/20 px-3 py-1 text-xs font-semibold text-cyan-50">
                <Sparkles className="h-3.5 w-3.5" aria-hidden />
                {alert.agentLabelAr}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/40 bg-amber-500/15 px-3 py-1 text-xs text-amber-100">
                <AlertTriangle className="h-3.5 w-3.5" aria-hidden />
                أولوية قصوى
              </span>
            </div>
            <h3 className="text-lg font-bold text-cyan-50">{alert.titleAr}</h3>
            <p className="text-sm leading-relaxed text-cyan-100/90">{alert.bodyAr}</p>
            <p className="text-xs text-cyan-200/75">
              إجمالي الإيرادات المُرصَدة: {alert.totalRevenueSar.toLocaleString('ar-SA')} ر.س · الضريبة المُجهَّزة:{' '}
              {alert.preparedVatRatePercent}%
            </p>
            <div className="flex flex-wrap justify-end gap-2">
              <Button
                type="button"
                size="lg"
                disabled={!canActivate || activating}
                className="gap-2 border border-cyan-300/50 bg-gradient-to-l from-cyan-500 to-sky-400 font-bold text-slate-950 shadow-[0_0_24px_rgba(34,211,238,0.5)] hover:from-cyan-400 hover:to-sky-300"
                onClick={() => void handleActivate()}
              >
                {activating ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                {alert.ctaLabelAr}
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {showInitialization ? (
        <FinancialOfficeInitialization
          uninitialized={uninitialized}
          fetchError={fetchError}
          canRunRadar={canRunRadar}
          loading={loading}
          onRunRadar={() => void handleRunRadar()}
        />
      ) : null}

      {!showInitialization && !loading && canRunRadar ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-2"
          disabled={loading}
          onClick={() => void handleRunRadar()}
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Radar className="h-4 w-4" />}
          تحديث رادار الإيرادات (زميل خازن)
        </Button>
      ) : null}
    </div>
  );
}
