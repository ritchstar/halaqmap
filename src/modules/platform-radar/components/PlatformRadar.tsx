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

type Props = {
  commandMode?: boolean;
  soundEnabled?: boolean;
  founderMode?: boolean;
  className?: string;
};

function HudStat({ label, value }: { label: string; value: string | number }) {
  const display = value === '—' || value === '--' ? 0 : value;
  return (
    <div className="min-w-[clamp(5.5rem,11vw,7.5rem)] rounded-xl border border-white/12 bg-black/68 px-[clamp(0.55rem,1.1vw,0.85rem)] py-[clamp(0.4rem,0.9vh,0.6rem)] backdrop-blur-md">
      <p className="text-[clamp(0.62rem,1.1vw,0.78rem)] text-slate-400">{label}</p>
      <p className="text-[clamp(1.05rem,2vw,1.55rem)] font-bold tabular-nums text-white">{display}</p>
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
    pollMs: 3_000,
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

      {/* Bottom-left — Market pulse */}
      <aside className="pointer-events-none absolute bottom-0 left-0 z-30 max-w-[min(92vw,28rem)] p-[clamp(0.75rem,2vw,1.5rem)]">
        <div className="pointer-events-auto rounded-2xl border border-white/10 bg-black/72 p-[clamp(0.75rem,1.5vw,1rem)] backdrop-blur-xl">
          <p className="flex items-center gap-2 text-[clamp(0.95rem,1.7vw,1.15rem)] font-semibold text-white" dir="rtl">
            <Zap className="h-4 w-4 text-amber-300" />
            نبض السوق
          </p>
          <p className="mt-1 line-clamp-2 text-[clamp(0.86rem,1.5vw,1rem)] leading-relaxed text-slate-300" dir="rtl">
            {brief?.searchDemandLine ?? '—'}
          </p>
          {tacticalView ? (
            <p className="mt-2 flex items-center gap-1.5 text-[clamp(0.76rem,1.35vw,0.92rem)] text-red-200/90" dir="rtl">
              <ShieldAlert className="h-3.5 w-3.5 shrink-0" />
              Inspector Detection — هالات حمراء على النشاط المريب
            </p>
          ) : null}
        </div>
      </aside>

      {/* Bottom-right — metrics row (reference) */}
      <footer className="pointer-events-none absolute bottom-0 right-0 z-30 p-[clamp(0.75rem,2vw,1.5rem)]">
        <div className="pointer-events-auto flex flex-wrap justify-end gap-[clamp(0.4rem,0.9vw,0.65rem)]">
          <HudStat label="نبضات الخريطة" value={userPulseCount} />
          <HudStat label="Inspector" value={suspiciousCount} />
          <HudStat label="حلاقون" value={stats?.totalBarbers ?? 0} />
          <HudStat label="مستخدمون" value={stats?.totalUsers ?? 0} />
          <HudStat label="عاجل 24س" value={ops?.urgentCount24h ?? 0} />
          <HudStat label="آمن 7d" value={brief?.securityEvents7d ?? 0} />
        </div>
      </footer>

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
