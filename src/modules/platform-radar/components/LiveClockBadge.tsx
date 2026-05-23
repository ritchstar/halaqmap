import { memo, useEffect, useState } from 'react';

type Props = {
  liveConnected: boolean;
  liveHint?: string | null;
  syncLabel: string;
};

function formatClock(d: Date): string {
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

function LiveClockBadgeImpl({ liveConnected, liveHint, syncLabel }: Props) {
  const [clockLabel, setClockLabel] = useState(() => formatClock(new Date()));

  useEffect(() => {
    const tick = () => setClockLabel(formatClock(new Date()));
    const id = window.setInterval(tick, 1_000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/68 px-3 py-2 backdrop-blur-md">
      {liveConnected ? (
        <span className="inline-flex items-center gap-1.5 text-[clamp(0.82rem,1.45vw,1rem)] font-semibold text-sky-300">
          <span className="h-2.5 w-2.5 rounded-full bg-sky-400 shadow-[0_0_10px_rgba(56,189,248,0.95)]" />
          LIVE
        </span>
      ) : (
        <span className="text-[clamp(0.82rem,1.45vw,1rem)] text-amber-300" title={liveHint ?? undefined}>
          POLL
        </span>
      )}
      <span className="text-[clamp(0.82rem,1.45vw,1rem)] tabular-nums text-slate-300">{syncLabel}</span>
      <span className="text-[clamp(0.82rem,1.45vw,1rem)] tabular-nums text-slate-400">{clockLabel}</span>
    </div>
  );
}

export const LiveClockBadge = memo(LiveClockBadgeImpl);
