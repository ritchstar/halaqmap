import { useEffect, useState } from 'react';
import { Radio, ShieldAlert } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  createFleetIntelligencePing,
  FLEET_INTELLIGENCE_SEED,
} from '@/modules/ai-staff/registry';
import type { FleetIntelligencePing } from '@/modules/ai-staff/types';
import { cn } from '@/lib/utils';

const MAX_PINGS = 12;

function severityTone(severity: FleetIntelligencePing['severity']) {
  if (severity === 'secure') return 'border-emerald-500/35 bg-emerald-500/10 text-emerald-100';
  if (severity === 'watch') return 'border-amber-500/35 bg-amber-500/10 text-amber-100';
  return 'border-slate-500/35 bg-slate-500/10 text-slate-200';
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
    <Card className="border-red-500/30 bg-slate-950/90">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-end gap-2 text-base text-red-100">
          <Radio className="h-4 w-4 animate-pulse text-red-400" />
          Fleet Intelligence Log Feed
        </CardTitle>
        <CardDescription className="text-right text-xs text-red-200/70">
          قناة خلفية مشفرة — نبضات مراقبة صامتة عبر المملكة (بسرية تامة)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 max-h-72 overflow-y-auto font-mono text-[11px]">
        {pings.map((ping) => (
          <div
            key={ping.id}
            className={cn('rounded-lg border px-3 py-2 text-right leading-relaxed', severityTone(ping.severity))}
          >
            <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
              <span className="text-[10px] opacity-70">
                {new Date(ping.timestamp).toLocaleTimeString('ar-SA')}
              </span>
              <Badge variant="outline" className="h-5 border-current/30 text-[9px] uppercase">
                {ping.severity}
              </Badge>
            </div>
            <p className="flex items-start justify-end gap-1.5">
              <ShieldAlert className="mt-0.5 h-3 w-3 shrink-0 opacity-60" aria-hidden />
              {ping.messageAr}
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
