import type { ReactNode } from 'react';
import { Activity, Radar } from 'lucide-react';
import { PULSE_MAP_CONFIG, PULSE_MAP_COLORS } from '@/config/pulseMapConfig';
import { PULSE_MAP_CITY_MARKERS } from '@/modules/pulse-map/lib/pulseMapCities';
import type { PulseMapPayload } from '@/modules/pulse-map/types';

type Props = {
  payload: PulseMapPayload | null;
  loading?: boolean;
};

/** يمين الشاشة (RTL start) — عنوان الخريطة والمفتاح */
export function PulseMapHudStart({ payload, loading }: Props) {
  const showPulses = PULSE_MAP_CONFIG.showPulses;

  return (
    <aside
      className="flex flex-col rounded-2xl border border-sky-400/20 bg-black/55 p-4 backdrop-blur-md lg:min-h-[min(44rem,72vh)]"
      dir="rtl"
    >
      <div className="space-y-2">
        <div className="flex flex-wrap items-start gap-2">
          <Radar className="mt-0.5 h-4 w-4 shrink-0 text-sky-300" />
          <div className="min-w-0">
            <p className="text-sm font-black text-sky-100">{PULSE_MAP_CONFIG.titleAr}</p>
            <p className="text-[0.62rem] font-medium text-sky-300/75" dir="ltr">
              {PULSE_MAP_CONFIG.subtitleEn}
            </p>
          </div>
        </div>
        <span className="inline-flex rounded-full border border-sky-400/30 bg-sky-500/15 px-2 py-0.5 text-[0.58rem] font-bold text-sky-200">
          {PULSE_MAP_CONFIG.phaseBadgeAr}
        </span>
      </div>
      <p className="mt-2 text-[0.68rem] leading-relaxed text-slate-400">
        {PULSE_MAP_CONFIG.pilotLabelAr}
      </p>
      <p className="mt-2 text-[0.6rem] leading-relaxed text-amber-200/75">
        {PULSE_MAP_CONFIG.phaseHintAr}
      </p>

      {showPulses ? (
        <div className="mt-4 space-y-3 border-t border-white/10 pt-4">
          <p className="text-[0.62rem] font-semibold text-slate-500">مفتاح الألوان</p>
          <LegendRow
            color={PULSE_MAP_COLORS.demand.fill}
            glow={PULSE_MAP_COLORS.demand.glow}
            label={PULSE_MAP_CONFIG.legendDemandAr}
          />
          <LegendRow
            color={PULSE_MAP_COLORS.link.fill}
            glow={PULSE_MAP_COLORS.link.glow}
            label={PULSE_MAP_CONFIG.legendLinkAr}
          />
        </div>
      ) : null}

      {loading ? (
        <p className="mt-auto pt-4 text-[0.62rem] text-slate-500">جاري التحميل…</p>
      ) : null}
    </aside>
  );
}

/** يسار الشاشة (RTL end) — الحالة والإحصائيات */
export function PulseMapHudEnd({ payload, loading }: Props) {
  const syncLabel = payload?.collectedAt
    ? new Date(payload.collectedAt).toLocaleTimeString('ar-SA', {
        hour: '2-digit',
        minute: '2-digit',
      })
    : '…';

  const showPulses = PULSE_MAP_CONFIG.showPulses;
  const isDemo = payload?.mode === 'demo' || payload?.mode === 'curated';
  const isLive = payload?.mode === 'live';

  return (
    <aside
      className="flex flex-col rounded-2xl border border-emerald-500/20 bg-black/55 p-4 backdrop-blur-md lg:min-h-[min(44rem,72vh)]"
      dir="rtl"
    >
      <div className="flex items-center gap-2">
        {!isDemo && isLive ? (
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
          </span>
        ) : isDemo ? (
          <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-400" />
        ) : (
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
        )}
        <span className="text-xs font-semibold text-emerald-100">
          {loading ? 'جاري التحميل…' : isLive ? 'نبض حي' : isDemo ? 'تجريبي' : PULSE_MAP_CONFIG.phaseBadgeAr}
        </span>
      </div>
      <p className="mt-1 text-[0.62rem] tabular-nums text-slate-400">آخر مزامنة · {syncLabel}</p>

      <div className="mt-4 space-y-3 border-t border-white/10 pt-4">
        <p className="text-[0.62rem] font-semibold text-slate-500">الإحصائيات</p>
        {showPulses ? (
          <>
            <StatRow
              icon={<Activity className="h-4 w-4 text-amber-300" />}
              label={PULSE_MAP_CONFIG.legendDemandAr}
              value={payload?.stats.demandCount ?? 0}
            />
            <StatRow
              icon={<Activity className="h-4 w-4 text-teal-300" />}
              label={PULSE_MAP_CONFIG.legendLinkAr}
              value={payload?.stats.linkCount ?? 0}
            />
          </>
        ) : null}
        <StatRow
          icon={<Radar className="h-4 w-4 text-sky-300" />}
          label="مدن"
          value={payload?.stats.slotsActive ?? PULSE_MAP_CITY_MARKERS.length}
        />
      </div>
    </aside>
  );
}

function LegendRow({
  color,
  glow,
  label,
}: {
  color: string;
  glow: string;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span
        className="inline-flex h-3 w-3 rounded-full"
        style={{ background: color, boxShadow: `0 0 10px ${glow}` }}
      />
      <span className="text-[0.65rem] text-slate-300">{label}</span>
    </div>
  );
}

function StatRow({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-white/8 bg-white/[0.03] px-3 py-2.5">
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-[0.65rem] text-slate-400">{label}</span>
      </div>
      <span className="text-base font-bold tabular-nums text-white">{value}</span>
    </div>
  );
}
