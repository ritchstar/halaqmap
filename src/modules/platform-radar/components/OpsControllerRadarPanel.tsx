import { BadgeCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useOpsControllerRadarStatus } from '@/modules/platform-radar/hooks/useOpsControllerRadarStatus';

function statusTone(status: 'OK' | 'PENDING' | 'FAIL'): string {
  if (status === 'OK') return 'text-emerald-400';
  if (status === 'FAIL') return 'text-red-400';
  return 'text-amber-300';
}

export function OpsControllerRadarPanel({ className }: { className?: string }) {
  const { lines, loading } = useOpsControllerRadarStatus();

  return (
    <div
      className={cn(
        'rounded-2xl border border-sky-400/20 bg-black/78 px-[clamp(0.85rem,1.8vw,1.25rem)] py-[clamp(0.65rem,1.2vh,0.9rem)] backdrop-blur-xl',
        className,
      )}
    >
      <p className="text-[clamp(0.62rem,1.1vw,0.78rem)] uppercase tracking-[0.18em] text-sky-300/80">
        Tactical Mission Control
      </p>
      <div className="mt-1 flex items-center justify-end gap-2">
        <h2 className="text-[clamp(1.05rem,2.2vw,1.65rem)] font-bold tracking-tight text-white">
          Platform Radar
        </h2>
        <BadgeCheck className="h-[clamp(1rem,2vw,1.35rem)] w-[clamp(1rem,2vw,1.35rem)] text-sky-400" />
      </div>

      <div className="mt-3 rounded-xl border border-white/10 bg-black/50 px-3 py-2.5">
        <p className="mb-2 text-right text-[clamp(0.72rem,1.3vw,0.88rem)] font-semibold uppercase tracking-[0.14em] text-slate-400">
          Ops Controller
        </p>
        <ul className="m-0 list-none space-y-1.5 p-0" dir="rtl">
          {lines.map((row) => (
            <li
              key={row.id}
              className="flex items-center justify-between gap-3 text-[clamp(0.82rem,1.45vw,1rem)]"
            >
              <span className={cn('min-w-[2.5rem] text-left font-bold tabular-nums', statusTone(row.status))}>
                {loading ? '…' : row.status}
              </span>
              <span className="text-slate-200">{row.labelAr}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
