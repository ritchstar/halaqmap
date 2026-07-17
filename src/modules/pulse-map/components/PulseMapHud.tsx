import type { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { Activity } from 'lucide-react';
import { PULSE_MAP_CONFIG, PULSE_MAP_COLORS, PULSE_MAP_DOCTRINE_LINE_AR } from '@/config/pulseMapConfig';
import { PULSE_MAP_CITY_MARKERS } from '@/modules/pulse-map/lib/pulseMapCities';
import type { PulseMapPayload } from '@/modules/pulse-map/types';
import { HalaqmapBrandMark } from '@/components/HalaqmapBrandMark';
import { isLabClonePath } from '@/lab/labCloneRouting';

type Props = {
  payload: PulseMapPayload | null;
  loading?: boolean;
};

/** يمين الشاشة (RTL start) — عنوان الخريطة والمفتاح */
export function PulseMapHudStart({ payload, loading }: Props) {
  const showPulses = PULSE_MAP_CONFIG.showPulses;
  const location = useLocation();
  const showLabBrand = isLabClonePath(location.pathname);

  return (
    <aside
      className="pulse-map-hud pulse-map-hud-start flex flex-col rounded-2xl border border-sky-400/20 bg-black/55 p-5 backdrop-blur-md lg:min-h-[min(48rem,78vh)]"
      dir="rtl"
    >
      {showLabBrand ? (
        <div className="pulse-map-brand-wrap mb-3 flex items-center justify-end">
          <HalaqmapBrandMark
            alt="شعار حلاق ماب"
            className="pulse-map-barber-brand h-14 w-14 rounded-2xl"
            imgClassName="rounded-2xl"
          />
        </div>
      ) : null}

      <div className="space-y-2.5">
        <div className="flex flex-wrap items-start gap-2.5">
          <Activity className="mt-0.5 h-5 w-5 shrink-0 text-sky-300" />
          <div className="min-w-0">
            <p className="text-base font-black leading-snug text-sky-100 sm:text-lg">
              {PULSE_MAP_CONFIG.titleAr}
            </p>
            <p className="mt-1 text-sm font-medium leading-relaxed text-sky-300/85">
              {PULSE_MAP_CONFIG.subtitleAr}
            </p>
          </div>
        </div>
        <span className="inline-flex rounded-full border border-sky-400/30 bg-sky-500/15 px-3 py-1 text-xs font-bold text-sky-100">
          {PULSE_MAP_CONFIG.phaseBadgeAr}
        </span>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-slate-300">{PULSE_MAP_CONFIG.pilotLabelAr}</p>
      <p className="mt-2 text-sm leading-relaxed text-amber-100/85">{PULSE_MAP_CONFIG.phaseHintAr}</p>
      <p className="mt-2 text-xs leading-relaxed text-slate-400 sm:text-sm">
        {PULSE_MAP_DOCTRINE_LINE_AR}
      </p>

      {showPulses ? (
        <div className="mt-5 space-y-3.5 border-t border-white/10 pt-5">
          <p className="text-sm font-bold text-slate-300">مفتاح الألوان</p>
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
        <p className="mt-auto pt-4 text-sm text-slate-400">جاري التحميل…</p>
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
      className="pulse-map-hud pulse-map-hud-end flex flex-col rounded-2xl border border-emerald-500/20 bg-black/55 p-5 backdrop-blur-md lg:min-h-[min(48rem,78vh)]"
      dir="rtl"
    >
      <div className="flex items-center gap-2.5">
        {!isDemo && isLive ? (
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
          </span>
        ) : isDemo ? (
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-amber-400" />
        ) : (
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
        )}
        <span className="text-base font-bold text-emerald-50">
          {loading ? 'جاري التحميل…' : isLive ? 'نبض حي' : isDemo ? 'تجريبي' : PULSE_MAP_CONFIG.phaseBadgeAr}
        </span>
      </div>
      <p className="mt-2 text-sm tabular-nums text-slate-300">آخر مزامنة · {syncLabel}</p>

      <div className="mt-5 space-y-3.5 border-t border-white/10 pt-5">
        <p className="text-sm font-bold text-slate-300">الإحصائيات</p>
        {showPulses ? (
          <>
            <StatRow
              icon={<Activity className="h-5 w-5 text-amber-300" />}
              label={PULSE_MAP_CONFIG.legendDemandAr}
              value={payload?.stats.demandCount ?? 0}
            />
            <StatRow
              icon={<Activity className="h-5 w-5 text-teal-300" />}
              label={PULSE_MAP_CONFIG.legendLinkAr}
              value={payload?.stats.linkCount ?? 0}
            />
          </>
        ) : null}
        <StatRow
          icon={<Activity className="h-5 w-5 text-sky-300" />}
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
    <div className="flex items-center gap-3">
      <span
        className="inline-flex h-4 w-4 shrink-0 rounded-full"
        style={{ background: color, boxShadow: `0 0 12px ${glow}` }}
      />
      <span className="text-sm font-medium leading-snug text-slate-100">{label}</span>
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
    <div className="pulse-map-stat-row flex items-center justify-between gap-3 rounded-xl border border-white/8 bg-white/[0.03] px-3.5 py-3">
      <div className="flex min-w-0 items-center gap-2.5">
        {icon}
        <span className="text-sm font-medium leading-snug text-slate-200">{label}</span>
      </div>
      <span className="text-xl font-black tabular-nums text-white">{value}</span>
    </div>
  );
}
