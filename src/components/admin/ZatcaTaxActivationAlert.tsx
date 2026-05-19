import { useCallback, useEffect, useState } from 'react';
import { AlertTriangle, Loader2, ShieldCheck, Sparkles } from 'lucide-react';
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
  canActivate: boolean;
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

export function ZatcaTaxActivationAlert({ canActivate }: ZatcaTaxActivationAlertProps) {
  const [loading, setLoading] = useState(true);
  const [activating, setActivating] = useState(false);
  const [alert, setAlert] = useState<ZatcaAdminActivationAlert | null>(null);
  const [warnings, setWarnings] = useState<ZatcaEarlyWarningSignal[]>([]);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const snap = await fetchZatcaTaxAdvisorStateRemote();
      setAlert(snap.state?.admin_activation_alert ?? null);
      setWarnings(snap.warnings ?? []);
    } catch {
      setAlert(null);
      setWarnings([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const handleRunRadar = async () => {
    setLoading(true);
    try {
      const snap = await runZatcaTaxRadarRemote();
      setAlert(snap.state?.admin_activation_alert ?? null);
      setWarnings(snap.warnings ?? []);
      toast.success('تم تحديث رادار زميل خازن');
    } catch (e) {
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

  if (loading && !alert && warnings.length === 0) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-border/60 bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
        جاري تحميل رادار زميل خازن…
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {warnings
        .filter((w) => w.level !== 'mandatory_breached')
        .map((w) => (
          <WarningStrip key={`${w.level}-${w.triggeredAt}`} signal={w} />
        ))}

      {alert ? (
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

      {canActivate ? (
        <Button type="button" variant="outline" size="sm" className="gap-2" disabled={loading} onClick={() => void handleRunRadar()}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          تحديث رادار الإيرادات (زميل خازن)
        </Button>
      ) : null}
    </div>
  );
}
