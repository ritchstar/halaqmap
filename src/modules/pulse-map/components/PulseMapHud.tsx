import type { ReactNode } from 'react';
import { Activity, Radar } from 'lucide-react';
import { PULSE_MAP_CONFIG, PULSE_MAP_COLORS } from '@/config/pulseMapConfig';
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
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
          </span>
          <span className="text-xs font-semibold text-emerald-100">
            {loading ? 'جاري المزامنة…' : 'نبض حي'}
          </span>
          <span className="text-[0.62rem] tabular-nums text-slate-400">{syncLabel}</span>
        </div>
      </div>

      <div className="pointer-events-none absolute top-2 inset-inline-start-2 z-20 sm:top-3 sm:inset-inline-start-3 md:top-4 md:inset-inline-start-4">
        <div className="pointer-events-auto max-w-[min(40vw,18rem)] rounded-xl border border-sky-400/20 bg-black/60 px-4 py-3 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <Radar className="h-4 w-4 text-sky-300" />
            <p className="text-sm font-black text-sky-100">خريطة النبض</p>
          </div>
          <p className="mt-1 text-[0.68rem] leading-relaxed text-slate-400">
            {PULSE_MAP_CONFIG.pilotLabelAr}
          </p>
          {payload?.mode === 'curated' ? (
            <p className="mt-1.5 text-[0.6rem] text-amber-200/75">عرض توضيحي</p>
          ) : null}
          <div className="mt-3 flex flex-wrap gap-4 border-t border-white/10 pt-2.5">
            <div className="flex items-center gap-2">
              <span
                className="inline-flex h-3 w-3 rounded-full"
                style={{ background: PULSE_MAP_COLORS.demand.fill, boxShadow: `0 0 10px ${PULSE_MAP_COLORS.demand.glow}` }}
              />
              <span className="text-[0.65rem] text-slate-300">{PULSE_MAP_CONFIG.legendDemandAr}</span>
            </div>
            <div className="flex items-center gap-2">
              <span
                className="inline-flex h-3 w-3 rounded-full"
                style={{ background: PULSE_MAP_COLORS.link.fill, boxShadow: `0 0 8px ${PULSE_MAP_COLORS.link.glow}` }}
              />
              <span className="text-[0.65rem] text-slate-300">{PULSE_MAP_CONFIG.legendLinkAr}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-3 left-1/2 z-20 -translate-x-1/2">
        <div className="pointer-events-auto flex items-center gap-4 rounded-full border border-white/10 bg-black/55 px-4 py-2 backdrop-blur-md">
          <Stat icon={<Activity className="h-3.5 w-3.5 text-amber-300" />} label="طلب" value={payload?.stats.demandCount ?? 0} />
          <Stat icon={<Activity className="h-3.5 w-3.5 text-teal-300" />} label="ربط" value={payload?.stats.linkCount ?? 0} />
          <Stat icon={<Radar className="h-3.5 w-3.5 text-sky-300" />} label="مدن" value={payload?.stats.slotsActive ?? 0} />
        </div>
      </div>
    </>
  );
}

function Stat({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="flex items-center gap-1.5">
      {icon}
      <span className="text-[0.62rem] text-slate-400">{label}</span>
      <span className="text-sm font-bold tabular-nums text-white">{value}</span>
    </div>
  );
}
