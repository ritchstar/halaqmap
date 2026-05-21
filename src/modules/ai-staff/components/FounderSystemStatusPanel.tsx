import { useCallback, useEffect, useState } from 'react';
import {
  CheckCircle2,
  ExternalLink,
  Loader2,
  RefreshCw,
  ShieldAlert,
  Wifi,
  Zap,
} from 'lucide-react';
import { FounderGlassCard } from '@/components/admin/founder/FounderGlassCard';
import { founderTheme } from '@/components/admin/founder/founderTheme';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  fetchEngineeringHandshakeStatus,
  runEngineeringHandshakeRemote,
  type EngineeringHandshakeSnapshot,
  type HandshakeServicePing,
} from '@/lib/engineeringHandshakeRemote';
import { toast } from '@/components/ui/sonner';
import { forceHardRefresh } from '@/lib/platformBuildSync';

type Props = {
  onOpsControllerEnabledChange?: (enabled: boolean) => void;
};

function statusBadge(systemStatus: EngineeringHandshakeSnapshot['systemStatus']) {
  if (systemStatus === 'OK') {
    return (
      <Badge className="border-emerald-700/50 bg-emerald-950/50 text-emerald-200">
        System Status: OK
      </Badge>
    );
  }
  if (systemStatus === 'FAIL') {
    return (
      <Badge className="border-red-700/50 bg-red-950/50 text-red-200">System Status: FAIL</Badge>
    );
  }
  return (
    <Badge className="border-amber-700/50 bg-amber-950/50 text-amber-200">
      System Status: PENDING
    </Badge>
  );
}

function ServiceRow({ service }: { service: HandshakeServicePing }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-slate-700/80 bg-slate-950/50 px-3 py-2 text-sm">
      <div className="flex items-center gap-2 text-left">
        {service.ok ? (
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
        ) : (
          <ShieldAlert className="h-4 w-4 text-red-400" />
        )}
        <span className="text-slate-300">{service.latencyMs}ms</span>
      </div>
      <div className="flex-1 text-right">
        <p className="font-medium text-slate-100">{service.label}</p>
        <p className="text-xs text-slate-400">{service.message}</p>
      </div>
    </div>
  );
}

export function FounderSystemStatusPanel({ onOpsControllerEnabledChange }: Props) {
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [snapshot, setSnapshot] = useState<EngineeringHandshakeSnapshot | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    const result = await fetchEngineeringHandshakeStatus();
    setLoading(false);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    setSnapshot(result.snapshot);
    onOpsControllerEnabledChange?.(result.snapshot.opsControllerEnabled);
  }, [onOpsControllerEnabledChange]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const runHandshake = async () => {
    setBusy(true);
    const result = await runEngineeringHandshakeRemote();
    setBusy(false);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    setSnapshot(result.snapshot);
    onOpsControllerEnabledChange?.(result.opsControllerEnabled);
    if (result.systemStatus === 'OK') {
      toast.success('Handshake OK — Operations Controller مفعّل.');
    } else {
      toast.error('Handshake FAIL — راجع المفاتيح وخدمات الاتصال.');
    }
  };

  return (
    <FounderGlassCard className="p-5 md:p-6">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {snapshot ? statusBadge(snapshot.systemStatus) : null}
          <Badge variant="outline" className="border-cyan-700/40 text-cyan-100">
            Engineering Wing Handshake
          </Badge>
        </div>
        <div className="flex-1 space-y-1 text-right">
          <h3 className={`${founderTheme.sectionTitle} flex items-center justify-end gap-2`}>
            <Wifi className="h-5 w-5 text-cyan-300" />
            حالة النظام — Autonomous Engineering Wing
          </h3>
          <p className="text-sm text-slate-400">
            فحص رسمي لـ Supabase · Vercel · GitHub — يفعّل مراقب العمليات عند النجاح.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-8 text-slate-400">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="text-sm">جاري قراءة حالة Handshake…</span>
        </div>
      ) : (
        <div className="space-y-4">
          {snapshot?.secretIssues?.length ? (
            <div className="rounded-lg border border-amber-800/40 bg-amber-950/20 px-3 py-2 text-right text-xs text-amber-100">
              {snapshot.secretIssues.join(' · ')}
            </div>
          ) : null}

          <div className="space-y-2">
            {(snapshot?.services ?? []).length > 0 ? (
              snapshot?.services.map((service) => <ServiceRow key={service.id} service={service} />)
            ) : (
              <p className="text-center text-sm text-slate-500 py-4">
                لم يُجرَ Handshake بعد — اضغط «تشغيل Handshake».
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-700/80 pt-4">
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="border-slate-600"
                disabled={busy}
                onClick={() => void refresh()}
              >
                <RefreshCw className="ml-2 h-4 w-4" />
                تحديث
              </Button>
              <Button
                type="button"
                size="sm"
                className="bg-cyan-700 hover:bg-cyan-600 text-white"
                disabled={busy}
                onClick={() => void runHandshake()}
              >
                {busy ? (
                  <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                ) : (
                  <Wifi className="ml-2 h-4 w-4" />
                )}
                تشغيل Handshake
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="border-amber-700/60 text-amber-200 hover:bg-amber-950/40"
                disabled={busy}
                onClick={() => {
                  toast.info('جاري تحديث Tactical UI — سيُعاد تحميل الصفحة بعد ثوانٍ.');
                  void forceHardRefresh();
                }}
                title="يلغي تسجيل Service Worker القديم ويمسح Workbox cache ثم يعيد التحميل من Vercel."
              >
                <Zap className="ml-2 h-4 w-4" />
                Hard Refresh UI
              </Button>
            </div>

            {snapshot?.vercelDeploymentUrl ? (
              <a
                href={snapshot.vercelDeploymentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-cyan-300 hover:text-cyan-200"
              >
                آخر نشر Vercel
                <ExternalLink className="h-4 w-4" />
              </a>
            ) : (
              <span className="text-xs text-slate-500">لا رابط نشر متاح بعد</span>
            )}
          </div>

          {snapshot?.opsControllerEnabled ? (
            <p className="text-right text-xs text-emerald-300">
              Operations Controller: ENABLED
            </p>
          ) : (
            <p className="text-right text-xs text-slate-500">
              Operations Controller: locked until Handshake OK
            </p>
          )}
        </div>
      )}
    </FounderGlassCard>
  );
}
