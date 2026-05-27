import { useCallback, useEffect, useRef, useState } from 'react';
import { Crosshair, ShieldAlert, Zap } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { usePlatformRadarData } from '@/modules/platform-radar/hooks/usePlatformRadarData';
import {
  subscribePlatformRadarChannel,
  usePlatformRadarPulses,
} from '@/modules/platform-radar/hooks/usePlatformRadarPulses';
import { TacticalRadarMap } from '@/modules/platform-radar/components/TacticalRadarMap';
import { OpsControllerRadarPanel } from '@/modules/platform-radar/components/OpsControllerRadarPanel';
import { LiveClockBadge } from '@/modules/platform-radar/components/LiveClockBadge';
import {
  PLATFORM_RADAR_SIM_LAT,
  PLATFORM_RADAR_SIM_LNG,
} from '@/modules/platform-radar/lib/platformRadarRealtime';
import { playTacticalUserPulseSound } from '@/modules/platform-radar/lib/platformRadarPulseSound';
import { cn } from '@/lib/utils';
import { POLL_MS } from '@/lib/pollingPolicy';

type Props = {
  commandMode?: boolean;
  soundEnabled?: boolean;
  founderMode?: boolean;
  className?: string;
};

function HudStat({ label, value }: { label: string; value: string | number }) {
  const display = value === '—' || value === '--' ? 0 : value;
  return (
    <div className="flex min-w-[clamp(3.4rem,7vw,4.6rem)] flex-col items-center rounded-lg border border-white/10 bg-black/40 px-2 py-1 backdrop-blur-sm">
      <p className="text-[clamp(0.55rem,0.95vw,0.66rem)] leading-tight text-slate-400">{label}</p>
      <p className="text-[clamp(0.85rem,1.5vw,1.05rem)] font-bold leading-tight tabular-nums text-white">
        {display}
      </p>
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
    enabled: true,
    soundEnabled,
    realtimeEnabled: true,
    pollMs: POLL_MS.RADAR_PULSES,
  });

  // Stable handler — Realtime subscription should never tear down/re-open
  // because `soundEnabled` or `tacticalView` toggled.
  const ingestRef = useRef(ingestRealtimeUserSearch);
  useEffect(() => {
    ingestRef.current = ingestRealtimeUserSearch;
  }, [ingestRealtimeUserSearch]);

  const simulateSearchPulse = useCallback(() => {
    const jitter = () => (Math.random() - 0.5) * 0.08;
    forcePulse(PLATFORM_RADAR_SIM_LAT + jitter(), PLATFORM_RADAR_SIM_LNG + jitter(), {
      label: 'محاكاة — الرياض',
      suspicious: tacticalView && Math.random() > 0.65,
    });
    if (soundEnabled) playTacticalUserPulseSound(0.14);
  }, [forcePulse, soundEnabled, tacticalView]);

  useEffect(() => {
    return subscribePlatformRadarChannel({
      enabled: true,
      onUserSearch: (payload) => ingestRef.current(payload),
      onStatus: (connected, detail) => {
        setLiveConnected(connected);
        setLiveHint(connected ? null : detail ?? 'polling-fallback');
      },
    });
  }, []);

  const stats = snapshot?.stats;
  const brief = snapshot?.brief;
  const ops = snapshot?.ops;

  const syncLabel =
    pulsesLoading || loading
      ? '…'
      : lastSyncAt
        ? new Date(lastSyncAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
        : snapshot?.loadedAt
          ? new Date(snapshot.loadedAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
          : '—';

  return (
    <div
      className={cn(
        'platform-radar-tactical royal-tactical-wing relative overflow-hidden bg-black text-white',
        commandMode ? 'h-[100dvh] w-[100dvw]' : 'min-h-[42rem] w-full rounded-2xl border border-sky-400/12',
        className,
      )}
      dir="ltr"
    >
      <TacticalRadarMap
        pulses={pulses}
        forcePulses={forcePulses}
        tacticalView={tacticalView}
        className="absolute inset-0"
      />

      {/* Top-left — LIVE + clock + Tactical View (reference layout) */}
      <header className="pointer-events-none absolute left-0 top-0 z-30 p-[clamp(0.75rem,2vw,1.5rem)]">
        <div className="pointer-events-auto flex flex-col gap-2">
          <LiveClockBadge
            liveConnected={liveConnected}
            liveHint={liveHint}
            syncLabel={syncLabel}
          />

          <label className="flex w-fit cursor-pointer items-center gap-2 rounded-xl border border-emerald-500/30 bg-black/68 px-3 py-2 backdrop-blur-md">
            <Crosshair className="h-4 w-4 text-red-300" />
            <span className="text-[clamp(0.82rem,1.45vw,1rem)] font-medium text-red-100">Tactical View</span>
            <Switch checked={tacticalView} onCheckedChange={setTacticalView} aria-label="Tactical View" />
          </label>
        </div>
      </header>

      {/* Top-right — Platform Radar + Ops Controller */}
      <div className="pointer-events-none absolute right-0 top-0 z-30 p-[clamp(0.75rem,2vw,1.5rem)]">
        <OpsControllerRadarPanel className="pointer-events-auto" />
      </div>

      {/* Bottom strip — collapsible Market pulse + metrics row. Hugs the
          bottom edge with minimal vertical footprint so the map stays
          visible. User can collapse the market-pulse text on demand. */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 flex items-end justify-between gap-3 px-[clamp(0.5rem,1.5vw,1.25rem)] pb-[clamp(0.35rem,1vw,0.7rem)]">
        {/* Bottom-left — Market pulse (compact, collapsible) */}
        <aside className="pointer-events-auto max-w-[min(58vw,22rem)]">
          <details className="group">
            <summary className="flex cursor-pointer list-none items-center gap-2 rounded-full border border-white/10 bg-black/45 px-3 py-1.5 backdrop-blur-sm transition hover:bg-black/65">
              <Zap className="h-3.5 w-3.5 shrink-0 text-amber-300" />
              <span className="text-[clamp(0.72rem,1.2vw,0.88rem)] font-semibold text-white" dir="rtl">
                نبض السوق
              </span>
              <span
                className="ms-auto text-[10px] text-slate-400 transition group-open:rotate-180"
                aria-hidden
              >
                ▾
              </span>
            </summary>
            <div className="mt-1.5 rounded-xl border border-white/10 bg-black/55 p-2.5 backdrop-blur-md">
              <p
                className="line-clamp-2 text-[clamp(0.72rem,1.25vw,0.86rem)] leading-relaxed text-slate-200"
                dir="rtl"
              >
                {brief?.searchDemandLine ?? '—'}
              </p>
              {tacticalView ? (
                <p
                  className="mt-1.5 flex items-center gap-1.5 text-[clamp(0.65rem,1.15vw,0.78rem)] text-red-200/85"
                  dir="rtl"
                >
                  <ShieldAlert className="h-3 w-3 shrink-0" />
                  Inspector Detection — هالات حمراء على النشاط المريب
                </p>
              ) : null}
            </div>
          </details>
        </aside>

        {/* Bottom-right — compact metrics row */}
        <footer className="pointer-events-auto flex flex-wrap justify-end gap-1.5">
          <HudStat label="نبضات" value={userPulseCount} />
          <HudStat label="Inspector" value={suspiciousCount} />
          <HudStat label="حلاقون" value={stats?.totalBarbers ?? 0} />
          <HudStat label="مستخدمون" value={stats?.totalUsers ?? 0} />
          <HudStat label="عاجل 24س" value={ops?.urgentCount24h ?? 0} />
          <HudStat label="آمن 7d" value={brief?.securityEvents7d ?? 0} />
        </footer>
      </div>

      {(error || pulsesError) && (
        <p className="absolute left-1/2 top-[18%] z-40 max-w-[90vw] -translate-x-1/2 rounded-xl border border-red-500/40 bg-red-950/70 px-4 py-3 text-[clamp(0.95rem,1.8vw,1.15rem)] text-red-100 backdrop-blur-md">
          {pulsesError || error}
        </p>
      )}

      {founderMode ? (
        <button
          type="button"
          aria-label="Simulate Search Pulse"
          title="Simulate Search Pulse (Founder test)"
          className={cn(
            'pointer-events-auto absolute bottom-[clamp(5rem,11vh,6.5rem)] left-[clamp(0.75rem,2vw,1.5rem)] z-40 rounded-full border border-amber-500/20 bg-black/40 px-2 py-1 text-[10px] uppercase tracking-widest text-amber-300/0 transition-all hover:border-amber-400/50 hover:bg-black/70 hover:text-amber-200/90',
            showFounderTest && 'border-amber-400/60 text-amber-200/90',
          )}
          onMouseEnter={() => setShowFounderTest(true)}
          onFocus={() => setShowFounderTest(true)}
          onClick={simulateSearchPulse}
        >
          {showFounderTest ? 'Simulate Golden Pulse' : '·'}
        </button>
      ) : null}
    </div>
  );
}
