import { useEffect, useState } from 'react';
import { Radio, ShieldAlert } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { StaffProfessionalCard } from '@/components/admin/staff/StaffProfessionalCard';
import { staffTheme } from '@/components/admin/staff/staffTheme';
import {
  createFleetIntelligencePing,
  FLEET_INTELLIGENCE_SEED,
} from '@/modules/ai-staff/registry';
import type { FleetIntelligencePing } from '@/modules/ai-staff/types';
import { cn } from '@/lib/utils';

const MAX_PINGS = 12;

function severityTone(severity: FleetIntelligencePing['severity']) {
  if (severity === 'secure') return 'border-emerald-800/50 bg-emerald-950/30 text-emerald-200';
  if (severity === 'watch') return 'border-amber-800/50 bg-amber-950/30 text-amber-200';
  return 'border-slate-700 bg-slate-800/80 text-slate-300';
}

export function FleetDirectorIntelligenceFeed() {
  const [pings, setPings] = useState<FleetIntelligencePing[]>(FLEET_INTELLIGENCE_SEED);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setPings((prev) => [createFleetIntelligencePing(), ...prev].slice(0, MAX_PINGS));
    }, 4200);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <StaffProfessionalCard className="border-red-900/40 p-0">
      <div className="border-b border-slate-700 px-4 py-3">
        <h4 className={`${staffTheme.sectionTitle} flex items-center justify-end gap-2 text-sm text-red-200`}>
          <Radio className="h-4 w-4 text-red-400" />
          Fleet Intelligence Log Feed
        </h4>
        <p className="mt-1 text-right text-xs text-slate-400">
          قناة خلفية مشفرة — نبضات مراقبة صامتة عبر المملكة (بسرية تامة)
        </p>
      </div>
      <div className="max-h-72 space-y-2 overflow-y-auto p-4 font-mono text-[11px]">
        {pings.map((ping) => (
          <div
            key={ping.id}
            className={cn('rounded-md border px-3 py-2 text-right leading-relaxed', severityTone(ping.severity))}
          >
            <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
              <span className="text-[10px] text-slate-500">
                {new Date(ping.timestamp).toLocaleTimeString('ar-SA')}
              </span>
              <Badge variant="outline" className="h-5 border-slate-600 text-[9px] uppercase text-slate-400">
                {ping.severity}
              </Badge>
            </div>
            <p className="flex items-start justify-end gap-1.5">
              <ShieldAlert className="mt-0.5 h-3 w-3 shrink-0 text-slate-500" aria-hidden />
              {ping.messageAr}
            </p>
          </div>
        ))}
      </div>
    </StaffProfessionalCard>
  );
}
