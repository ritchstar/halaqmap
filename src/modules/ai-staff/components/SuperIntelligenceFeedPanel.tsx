import { useCallback, useEffect, useState } from 'react';
import { Brain, Loader2, Shield } from 'lucide-react';
import { FounderGlassCard } from '@/components/admin/founder/FounderGlassCard';
import { founderTheme } from '@/components/admin/founder/founderTheme';
import { Badge } from '@/components/ui/badge';
import {
  SUPER_INTELLIGENCE_DOCTRINE,
  SUPER_INTELLIGENCE_PROTOCOL_LABELS_AR,
} from '@/config/superIntelligenceFeed';
import { fetchSuperIntelligenceFeed, type SuperIntelligenceFeedSnapshot } from '@/lib/superIntelligenceFeedRemote';
import { toast } from '@/components/ui/sonner';

export function SuperIntelligenceFeedPanel() {
  const [loading, setLoading] = useState(true);
  const [snapshot, setSnapshot] = useState<SuperIntelligenceFeedSnapshot | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    const result = await fetchSuperIntelligenceFeed();
    setLoading(false);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    setSnapshot(result.snapshot);
  }, []);

  useEffect(() => {
    void refresh();
    const id = window.setInterval(() => void refresh(), 45_000);
    return () => window.clearInterval(id);
  }, [refresh]);

  return (
    <FounderGlassCard className="p-5 md:p-6">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <Badge className="border-violet-700/40 bg-violet-950/40 text-violet-100">
          Executive Strategic Mode
        </Badge>
        <div className="flex-1 space-y-1 text-right">
          <h3 className={`${founderTheme.sectionTitle} flex items-center justify-end gap-2`}>
            <Brain className="h-5 w-5 text-violet-300" />
            Super-Intelligence Feed
          </h3>
          <p className="text-sm text-slate-400">
            Hive Mind · Prosecutor Gate · Crisis Simulation · Performance Delta
          </p>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap justify-end gap-1">
        {Object.values(SUPER_INTELLIGENCE_PROTOCOL_LABELS_AR).map((label) => (
          <Badge key={label} variant="outline" className="border-slate-600 text-[10px] text-slate-300">
            {label}
          </Badge>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-8 text-slate-400">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="text-sm">جاري تحميل Hive Mind…</span>
        </div>
      ) : snapshot ? (
        <div className="space-y-4 text-right">
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            <Metric label="Compliance Gaps" value={String(snapshot.baseline.complianceGaps)} />
            <Metric label="Radar Pulses 24h" value={String(snapshot.baseline.inspectorPulseCount24h)} />
            <Metric label="Pending Approvals" value={String(snapshot.baseline.pendingEngineeringApprovals)} />
            <Metric
              label="Handshake"
              value={snapshot.baseline.handshakeOk ? 'OK' : 'PENDING'}
              accent={snapshot.baseline.handshakeOk ? 'ok' : 'warn'}
            />
          </div>

          <div className="rounded-lg border border-slate-700/80 bg-slate-950/50 p-3">
            <p className="mb-2 flex items-center justify-end gap-2 text-xs font-semibold text-slate-300">
              <Shield className="h-4 w-4 text-violet-300" />
              Council Bus (latest)
            </p>
            <div className="max-h-48 space-y-2 overflow-y-auto">
              {snapshot.councilMessages.length === 0 ? (
                <p className="text-xs text-slate-500">لا رسائل — شغّل Engineering Protocol.</p>
              ) : (
                snapshot.councilMessages.slice(0, 8).map((msg) => (
                  <article key={msg.id} className="rounded border border-slate-800 px-2 py-1.5 text-xs">
                    <div className="flex justify-end gap-2 text-slate-500">
                      <span>{msg.message_type}</span>
                      <span>
                        {msg.from_agent} → {msg.to_agent}
                      </span>
                    </div>
                    <p className="font-medium text-slate-200">{msg.title}</p>
                  </article>
                ))
              )}
            </div>
          </div>

          <ul className="space-y-1 text-xs text-slate-400">
            {SUPER_INTELLIGENCE_DOCTRINE.slice(0, 4).map((line) => (
              <li key={line}>• {line}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </FounderGlassCard>
  );
}

function Metric({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: 'ok' | 'warn';
}) {
  return (
    <div className="rounded-lg border border-slate-700/80 bg-slate-950/40 px-3 py-2 text-right">
      <p className="text-[10px] uppercase tracking-wide text-slate-500">{label}</p>
      <p
        className={`text-lg font-semibold ${
          accent === 'ok' ? 'text-emerald-300' : accent === 'warn' ? 'text-amber-300' : 'text-slate-100'
        }`}
      >
        {value}
      </p>
    </div>
  );
}
