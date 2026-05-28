import { Radar } from 'lucide-react';
import { PULSE_MAP_CONFIG } from '@/config/pulseMapConfig';
import type { PulseMapPayload } from '@/modules/pulse-map/types';

type Props = {
  payload: PulseMapPayload | null;
  loading?: boolean;
};

export function PulseMapHud({ payload, loading }: Props) {
  const syncLabel = payload?.collectedAt
    ? new Date(payload.collectedAt).toLocaleTimeString('ar-SA', {
        hour: '2-digit',
        minute: '2-digit',
      })
    : '…';

  return (
    <>
      <div className="pointer-events-none absolute top-2 inset-inline-end-2 z-20 sm:top-3 sm:inset-inline-end-3">
        <div className="pointer-events-auto flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-black/60 px-3 py-2 backdrop-blur-md">
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
          <span className="text-xs font-semibold text-emerald-100">
            {loading ? 'جاري التحميل…' : PULSE_MAP_CONFIG.phaseBadgeAr}
          </span>
          <span className="text-[0.62rem] tabular-nums text-slate-400">{syncLabel}</span>
        </div>
      </div>

      <div className="pointer-events-none absolute top-2 inset-inline-start-2 z-20 sm:top-3 sm:inset-inline-start-3 md:top-4 md:inset-inline-start-4">
        <div className="pointer-events-auto max-w-[min(40vw,18rem)] rounded-xl border border-sky-400/20 bg-black/60 px-4 py-3 backdrop-blur-md">
          <div className="flex flex-wrap items-center gap-2">
            <Radar className="h-4 w-4 text-sky-300" />
            <p className="text-sm font-black text-sky-100">خريطة النبض</p>
            <span className="rounded-full border border-sky-400/30 bg-sky-500/15 px-2 py-0.5 text-[0.58rem] font-bold text-sky-200">
              {PULSE_MAP_CONFIG.phaseBadgeAr}
            </span>
          </div>
          <p className="mt-1 text-[0.68rem] leading-relaxed text-slate-400">
            {PULSE_MAP_CONFIG.pilotLabelAr}
          </p>
          <p className="mt-1.5 text-[0.6rem] leading-relaxed text-amber-200/75">
            {PULSE_MAP_CONFIG.phaseHintAr}
          </p>
        </div>
      </div>
    </>
  );
}
