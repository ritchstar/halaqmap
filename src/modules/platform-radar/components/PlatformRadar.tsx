import { useCallback, useEffect, useState } from 'react';
import { Activity, Crosshair, Radar, ShieldAlert, Zap } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { usePlatformRadarData } from '@/modules/platform-radar/hooks/usePlatformRadarData';
import {
  subscribePlatformRadarChannel,
  usePlatformRadarPulses,
} from '@/modules/platform-radar/hooks/usePlatformRadarPulses';
import { TacticalRadarMap } from '@/modules/platform-radar/components/TacticalRadarMap';
import {
  PLATFORM_RADAR_SIM_LAT,
  PLATFORM_RADAR_SIM_LNG,
} from '@/modules/platform-radar/lib/platformRadarRealtime';
import { playTacticalUserPulseSound } from '@/modules/platform-radar/lib/platformRadarPulseSound';
import { cn } from '@/lib/utils';

type Props = {
  /** Cast-friendly full viewport mode — zero chrome, edge-to-edge tactical map */
  commandMode?: boolean;
  soundEnabled?: boolean;
  /** Founder-only test controls (simulate pulse) */
  founderMode?: boolean;
  className?: string;
};

function HudStat({ label, value, accent = 'cyan' }: { label: string; value: string | number; accent?: 'cyan' | 'red' | 'amber' }) {
  const tone =
    accent === 'red'
      ? 'border-red-500/35 text-red-100'
      : accent === 'amber'
        ? 'border-amber-500/35 text-amber-100'
        : 'border-cyan-500/35 text-cyan-100';
  return (
    <div className={cn('rounded-xl border bg-black/55 px-[clamp(0.65rem,1.4vw,1rem)] py-[clamp(0.45rem,1vh,0.65rem)] backdrop-blur-md', tone)}>
      <p className="text-[clamp(0.65rem,1.2vw,0.85rem)] text-slate-400">{label}</p>
      <p className="text-[clamp(1.1rem,2.2vw,1.75rem)] font-bold tabular-nums">{value}</p>
    </div>
  );
}

function MetricBlock({
  label,
  value,
  sub,
  accent = 'cyan',
}: {
  label: string;
  value: string | number;
  sub?: string;
  accent?: 'cyan' | 'amber' | 'violet' | 'emerald';
}) {
  const ring =
    accent === 'amber'
      ? 'border-amber-400/40 shadow-[0_0_40px_rgba(251,191,36,0.15)]'
      : accent === 'violet'
        ? 'border-violet-400/40 shadow-[0_0_40px_rgba(167,139,250,0.12)]'
        : accent === 'emerald'
          ? 'border-emerald-400/40 shadow-[0_0_40px_rgba(52,211,153,0.12)]'
          : 'border-cyan-400/40 shadow-[0_0_40px_rgba(34,211,238,0.15)]';

  return (
    <div
      className={cn(
        'flex flex-col justify-center rounded-2xl border bg-black/40 p-[clamp(1rem,2.5vw,2rem)] backdrop-blur-sm',
        ring,
      )}
    >
      <p className="text-[clamp(1rem,2.2vw,1.75rem)] font-medium text-slate-300">{label}</p>
      <p className="mt-1 text-[clamp(2rem,5vw,4.5rem)] font-bold leading-none text-white tabular-nums">
        {value}
      </p>
      {sub ? (
        <p className="mt-2 text-[clamp(0.875rem,1.6vw,1.25rem)] text-slate-400">{sub}</p>
      ) : null}
    </div>
  );
}

export function PlatformRadar({ commandMode = false, soundEnabled = true, founderMode = false, className }: Props) {
  const [tacticalView, setTacticalView] = useState(true);
  const [showFounderTest, setShowFounderTest] = useState(false);
  const [liveConnected, setLiveConnected] = useState(false);
  const [liveHint, setLiveHint] = useState<string | null>(null);

  const { snapshot, loading, error } = usePlatformRadarData({
    soundEnabled: commandMode ? false : soundEnabled,
    pollMs: commandMode ? 25_000 : 30_000,
  });

  const {
    pulses,
    forcePulses,
    loading: pulsesLoading,
    error: pulsesError,
    lastSyncAt,
    userPulseCount,
    suspiciousCount,
    forcePulse,
    ingestRealtimeUserSearch,
  } = usePlatformRadarPulses({
    enabled: commandMode,
    soundEnabled,
    realtimeEnabled: commandMode,
    pollMs: 3_000,
  });

  const simulateSearchPulse = useCallback(() => {
    const jitter = () => (Math.random() - 0.5) * 0.08;
    const lat = PLATFORM_RADAR_SIM_LAT + jitter();
    const lng = PLATFORM_RADAR_SIM_LNG + jitter();
    forcePulse(lat, lng, {
      label: 'محاكاة — الرياض',
      suspicious: tacticalView && Math.random() > 0.65,
    });
    if (soundEnabled) playTacticalUserPulseSound(0.14);
  }, [forcePulse, soundEnabled, tacticalView]);

  useEffect(() => {
    if (!commandMode) return;

    return subscribePlatformRadarChannel({
      enabled: true,
      onUserSearch: (payload) => {
        ingestRealtimeUserSearch(payload);
      },
      onStatus: (connected, detail) => {
        setLiveConnected(connected);
        setLiveHint(connected ? null : detail ?? 'polling-fallback');
      },
    });
  }, [commandMode, ingestRealtimeUserSearch]);

  const stats = snapshot?.stats;
  const brief = snapshot?.brief;
  const ops = snapshot?.ops;

  if (commandMode) {
    return (
      <div
        className={cn(
          'platform-radar-tactical relative h-[100dvh] w-[100dvw] overflow-hidden bg-[#010104] text-white',
          className,
        )}
        dir="rtl"
      >
        <TacticalRadarMap
          pulses={pulses}
          forcePulses={forcePulses}
          tacticalView={tacticalView}
          className="absolute inset-0"
        />

        <header className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-start justify-between gap-4 p-[clamp(0.75rem,2vw,1.5rem)]">
          <div className="pointer-events-auto rounded-2xl border border-cyan-500/25 bg-black/65 px-[clamp(0.85rem,2vw,1.35rem)] py-[clamp(0.55rem,1.2vh,0.85rem)] backdrop-blur-xl">
            <p className="text-[clamp(0.65rem,1.2vw,0.85rem)] uppercase tracking-[0.22em] text-cyan-300/85">
              Tactical Mission Control
            </p>
            <h1 className="mt-1 flex items-center gap-2 text-[clamp(1.15rem,2.8vw,2rem)] font-bold text-white">
              <Radar className="h-[clamp(1rem,2.2vw,1.6rem)] w-[clamp(1rem,2.2vw,1.6rem)] text-cyan-300" />
              Platform Radar
            </h1>
          </div>

          <div className="pointer-events-auto flex flex-col items-end gap-2">
            <p className="rounded-lg border border-white/10 bg-black/55 px-3 py-1.5 text-[clamp(0.85rem,1.5vw,1.05rem)] text-slate-300 tabular-nums backdrop-blur-md">
              {pulsesLoading || loading
                ? '…'
                : lastSyncAt
                  ? new Date(lastSyncAt).toLocaleTimeString('ar-SA')
                  : snapshot?.loadedAt
                    ? new Date(snapshot.loadedAt).toLocaleTimeString('ar-SA')
                    : '—'}
              {liveConnected ? (
                <span className="mr-2 inline-flex items-center gap-1 text-cyan-300">
                  <span className="h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.9)]" />
                  LIVE
                </span>
              ) : (
                <span className="mr-2 text-amber-300/90" title={liveHint ?? undefined}>
                  POLL
                </span>
              )}
            </p>
            <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-red-500/30 bg-black/65 px-3 py-2 backdrop-blur-md">
              <Crosshair className="h-4 w-4 text-red-300" />
              <span className="text-[clamp(0.85rem,1.5vw,1.05rem)] font-medium text-red-100">Tactical View</span>
              <Switch checked={tacticalView} onCheckedChange={setTacticalView} aria-label="Tactical View" />
            </label>
          </div>
        </header>

        <aside className="pointer-events-none absolute inset-x-0 bottom-0 z-20 p-[clamp(0.75rem,2vw,1.5rem)]">
          <div className="pointer-events-auto grid gap-[clamp(0.5rem,1vw,0.85rem)] md:grid-cols-[1fr_auto] md:items-end">
            <div className="grid grid-cols-2 gap-[clamp(0.45rem,1vw,0.75rem)] sm:grid-cols-3 lg:grid-cols-6">
              <HudStat label="نبضات خريطة" value={userPulseCount} />
              <HudStat label="Inspector" value={suspiciousCount} accent="red" />
              <HudStat label="حلاقون" value={stats?.totalBarbers ?? '—'} />
              <HudStat label="مستخدمون" value={stats?.totalUsers ?? '—'} />
              <HudStat label="عاجل 24س" value={ops?.urgentCount24h ?? 0} accent="amber" />
              <HudStat label="أمن 7d" value={brief?.securityEvents7d ?? '—'} accent="red" />
            </div>

            <div className="max-w-xl rounded-2xl border border-cyan-500/20 bg-black/65 p-[clamp(0.75rem,1.5vw,1rem)] backdrop-blur-xl">
              <p className="flex items-center justify-end gap-2 text-[clamp(0.95rem,1.7vw,1.15rem)] font-semibold text-cyan-100">
                <Zap className="h-4 w-4" />
                نبض السوق
              </p>
              <p className="mt-1 line-clamp-2 text-[clamp(0.9rem,1.6vw,1.05rem)] leading-relaxed text-slate-300">
                {brief?.searchDemandLine ?? '—'}
              </p>
              {tacticalView ? (
                <p className="mt-2 flex items-center justify-end gap-1.5 text-[clamp(0.8rem,1.4vw,0.95rem)] text-red-200/90">
                  <ShieldAlert className="h-3.5 w-3.5" />
                  Inspector Detection — هالات حمراء على النشاط المريب
                </p>
              ) : null}
            </div>
          </div>
        </aside>

        {(error || pulsesError) && (
          <p className="absolute left-1/2 top-[18%] z-30 max-w-[90vw] -translate-x-1/2 rounded-xl border border-red-500/40 bg-red-950/70 px-4 py-3 text-[clamp(0.95rem,1.8vw,1.15rem)] text-red-100 backdrop-blur-md">
            {pulsesError || error}
          </p>
        )}

        {founderMode ? (
          <button
            type="button"
            aria-label="Simulate Search Pulse"
            title="Simulate Search Pulse (Founder test)"
            className={cn(
              'pointer-events-auto absolute bottom-[clamp(5rem,11vh,6.5rem)] left-[clamp(0.75rem,2vw,1.5rem)] z-30 rounded-full border border-cyan-500/20 bg-black/40 px-2 py-1 text-[10px] uppercase tracking-widest text-cyan-300/0 transition-all hover:border-cyan-400/50 hover:bg-black/70 hover:text-cyan-200/90',
              showFounderTest && 'border-cyan-400/60 text-cyan-200/90',
            )}
            onMouseEnter={() => setShowFounderTest(true)}
            onFocus={() => setShowFounderTest(true)}
            onClick={simulateSearchPulse}
          >
            {showFounderTest ? 'Simulate Search Pulse' : '·'}
          </button>
        ) : null}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'platform-radar-root relative flex min-h-[32rem] flex-col rounded-2xl border border-white/10 bg-[#030303] p-4 text-white',
        className,
      )}
      dir="rtl"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(34,211,238,0.08),transparent_55%)]"
      />

      <header className="relative z-10 flex shrink-0 items-center justify-between gap-4 border-b border-white/10 px-2 py-3">
        <div className="flex items-center gap-3">
          <span className="platform-radar-live-dot h-4 w-4 rounded-full bg-cyan-400 shadow-[0_0_16px_rgba(34,211,238,0.8)]" />
          <div className="text-right">
            <p className="text-sm uppercase tracking-[0.2em] text-cyan-300/90">Command Center</p>
            <h1 className="flex items-center justify-end gap-2 text-xl font-bold text-white">
              <Radar className="h-5 w-5 text-cyan-300" />
              Platform Radar
            </h1>
          </div>
        </div>
        <p className="text-sm text-slate-400 tabular-nums">
          {loading ? '…' : snapshot?.loadedAt ? new Date(snapshot.loadedAt).toLocaleTimeString('ar-SA') : '—'}
        </p>
      </header>

      <main className="relative z-10 grid flex-1 grid-cols-1 gap-4 p-2 md:grid-cols-2">
        {error ? (
          <p className="col-span-full rounded-xl border border-red-500/40 bg-red-950/30 p-4 text-red-100">{error}</p>
        ) : null}

        <section className="col-span-full grid grid-cols-2 gap-3 md:grid-cols-3">
          <MetricBlock label="الحلاقون" value={stats?.totalBarbers ?? '—'} sub="إجمالي السجل" />
          <MetricBlock
            label="اشتراكات نشطة"
            value={stats?.activeSubscriptions ?? '—'}
            sub={`${stats?.goldBarbers ?? 0} ذهبي · ${stats?.diamondBarbers ?? 0} ماسي`}
            accent="emerald"
          />
          <MetricBlock label="المستخدمون" value={stats?.totalUsers ?? '—'} accent="violet" />
          <MetricBlock
            label="إيراد مكتمل"
            value={stats?.totalRevenue != null ? `${stats.totalRevenue.toLocaleString('ar-SA')} ر.س` : '—'}
            accent="amber"
          />
          <MetricBlock label="مدفوعات معلّقة" value={stats?.pendingPayments ?? '—'} accent="amber" />
          <MetricBlock
            label="طلبات معلّقة"
            value={stats?.pendingRequests ?? '—'}
            sub={`${stats?.totalAppointments ?? 0} موعد`}
          />
        </section>

        <section className="flex flex-col rounded-2xl border border-cyan-500/25 bg-black/35 p-4">
          <h2 className="mb-3 flex items-center justify-end gap-2 text-lg font-bold text-cyan-100">
            <Zap className="h-5 w-5" />
            نبض السوق — بحث 24س
          </h2>
          <p className="mb-4 text-slate-200">{brief?.searchDemandLine ?? '—'}</p>
          <ul className="m-0 list-none space-y-3 p-0">
            {(brief?.topDistricts24h ?? []).slice(0, 6).map((d) => (
              <li
                key={`${d.districtName}-${d.topCity}`}
                className="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3"
              >
                <span className="text-xl font-bold tabular-nums text-cyan-200">{d.searchCount}</span>
                <span className="font-medium text-white">
                  {d.districtName}
                  {d.topCity ? ` · ${d.topCity}` : ''}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section className="flex flex-col gap-3">
          <div className="rounded-2xl border border-violet-500/30 bg-black/35 p-4">
            <h2 className="mb-3 flex items-center justify-end gap-2 text-lg font-bold text-violet-100">
              <Activity className="h-5 w-5" />
              نبض التشغيل
            </h2>
            <p className="text-2xl font-bold text-white">
              {ops?.urgentCount24h ?? 0}{' '}
              <span className="text-base font-normal text-slate-400">عاجل / 24س</span>
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <MetricBlock label="فشل مدفوعات" value={brief?.failedPayments24h ?? '—'} accent="amber" />
            <MetricBlock label="أحداث أمن" value={brief?.securityEvents7d ?? '—'} sub="7 أيام" accent="violet" />
          </div>
        </section>
      </main>
    </div>
  );
}
