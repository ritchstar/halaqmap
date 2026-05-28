import { Radar } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  SHOWCASE_RADAR_CONFIG,
  SHOWCASE_RADAR_STAT_LABELS,
} from '@/config/showcaseRadarConfig';
import { ShowcaseRadarMap } from '@/modules/showcase-radar/components/ShowcaseRadarMap';
import type { ShowcaseRadarPayload } from '@/modules/showcase-radar/types';

type Props = {
  payload: ShowcaseRadarPayload | null;
  loading?: boolean;
  error?: string | null;
  className?: string;
};

function HudStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex min-w-[clamp(3.4rem,7vw,4.6rem)] flex-col items-center rounded-lg border border-white/10 bg-black/40 px-2 py-1 backdrop-blur-sm">
      <p className="text-[clamp(0.55rem,0.95vw,0.66rem)] leading-tight text-slate-400">{label}</p>
      <p className="text-[clamp(0.85rem,1.5vw,1.05rem)] font-bold leading-tight tabular-nums text-white">
        {value}
      </p>
    </div>
  );
}

export function ShowcaseRadarShell({ payload, loading, error, className }: Props) {
  const stats = payload?.stats;
  const syncLabel = payload?.collectedAt
    ? new Date(payload.collectedAt).toLocaleTimeString('ar-SA', {
        hour: '2-digit',
        minute: '2-digit',
      })
    : '…';

  const hudStats = [
    { key: 'pulses' as const, value: stats?.pulsesVisible ?? 0 },
    { key: 'cities' as const, value: stats?.citiesCovered ?? 0 },
    { key: 'activeSalons' as const, value: stats?.activeSalonsApprox ?? 0 },
  ];

  return (
    <div
      className={cn(
        'platform-radar-tactical royal-tactical-wing relative min-h-[min(52rem,78vh)] overflow-hidden rounded-2xl border border-sky-400/12 bg-black text-white',
        className,
      )}
      dir="ltr"
    >
      <ShowcaseRadarMap
        pulses={payload?.pulses ?? []}
        showSalonClusters={SHOWCASE_RADAR_CONFIG.showBarberAnchors === 'city_cluster'}
        className="absolute inset-0"
      />

      <header className="pointer-events-none absolute left-0 top-0 z-30 p-[clamp(0.75rem,2vw,1.5rem)]">
        <div className="pointer-events-auto flex flex-col gap-2">
          <div className="flex w-fit items-center gap-2 rounded-xl border border-emerald-500/35 bg-black/65 px-3 py-2 backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            <span className="text-[clamp(0.72rem,1.2vw,0.88rem)] font-semibold text-emerald-100">
              {loading ? 'جاري المزامنة…' : 'معاينة حية'}
            </span>
            <span className="text-[0.62rem] tabular-nums text-slate-400">{syncLabel}</span>
          </div>
        </div>
      </header>

      <div className="pointer-events-none absolute right-0 top-0 z-30 p-[clamp(0.75rem,2vw,1.5rem)]">
        <div className="pointer-events-auto max-w-[min(92vw,22rem)] rounded-xl border border-sky-400/20 bg-black/55 px-4 py-3 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <Radar className="h-4 w-4 text-sky-300" />
            <p className="text-[clamp(0.82rem,1.4vw,1rem)] font-black text-sky-100" dir="rtl">
              نظام الرصد الذكي
            </p>
          </div>
          <p className="mt-1 text-[clamp(0.68rem,1.1vw,0.82rem)] leading-relaxed text-slate-300" dir="rtl">
            {payload?.onDemandTaglineAr ?? SHOWCASE_RADAR_CONFIG.onDemandTaglineAr}
          </p>
          {payload?.mode === 'curated' ? (
            <p className="mt-2 text-[0.62rem] text-amber-200/80" dir="rtl">
              عرض توضيحي — البيانات التشغيلية الكاملة لدى إدارة المنصة.
            </p>
          ) : null}
          <div className="mt-3 flex flex-wrap gap-3 border-t border-white/10 pt-2.5" dir="rtl">
            <div className="flex items-center gap-1.5">
              <span className="inline-flex h-2.5 w-2.5 rounded-full border border-amber-200/50 bg-[radial-gradient(circle_at_30%_25%,#fef3c7_0%,#f59e0b_70%,#92400e_100%)] shadow-[0_0_8px_rgba(251,191,36,0.7)]" />
              <span className="text-[0.62rem] text-slate-300">نبض مستخدم</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="inline-flex h-3 w-3 rounded-full border border-teal-200/50 bg-[radial-gradient(circle_at_30%_25%,#ccfbf1_0%,#14b8a6_70%,#115e59_100%)] shadow-[0_0_8px_rgba(20,184,166,0.7)]" />
              <span className="text-[0.62rem] text-slate-300">نبض حلاق</span>
            </div>
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 flex items-end justify-between gap-3 px-[clamp(0.5rem,1.5vw,1.25rem)] pb-[clamp(0.35rem,1vw,0.7rem)]">
        <aside className="pointer-events-auto max-w-[min(58vw,24rem)]">
          <div className="rounded-xl border border-white/10 bg-black/55 p-2.5 backdrop-blur-md">
            <p className="text-[clamp(0.72rem,1.2vw,0.86rem)] font-semibold text-amber-200" dir="rtl">
              نبض الطلب الجغرافي
            </p>
            <p className="mt-1 line-clamp-2 text-[clamp(0.68rem,1.1vw,0.8rem)] leading-relaxed text-slate-300" dir="rtl">
              {payload?.citySignals?.length
                ? payload.citySignals
                    .slice(0, 3)
                    .map((c) => `${c.cityAr} (${c.pulseCount24h})`)
                    .join(' · ')
                : '—'}
            </p>
          </div>
        </aside>

        <footer className="pointer-events-auto flex flex-wrap justify-end gap-1.5">
          {hudStats.map((s) => (
            <HudStat key={s.key} label={SHOWCASE_RADAR_STAT_LABELS[s.key]} value={s.value} />
          ))}
        </footer>
      </div>

      {error ? (
        <p className="absolute left-1/2 top-[18%] z-40 max-w-[90vw] -translate-x-1/2 rounded-xl border border-red-500/40 bg-red-950/70 px-4 py-3 text-sm text-red-100 backdrop-blur-md" dir="rtl">
          {error}
        </p>
      ) : null}
    </div>
  );
}
