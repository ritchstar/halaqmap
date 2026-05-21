import { useCallback, useEffect, useState } from 'react';
import { Crown, Radar, ShieldAlert, Zap } from 'lucide-react';
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
  /** Cast-friendly full viewport mode — edge-to-edge royal tactical wing */
  commandMode?: boolean;
  soundEnabled?: boolean;
  /** Founder-only test controls (simulate pulse) */
  founderMode?: boolean;
  className?: string;
};

function HudStat({
  label,
  value,
  accent = 'gold',
}: {
  label: string;
  value: string | number;
  accent?: 'gold' | 'red' | 'sky';
}) {
  const tone =
    accent === 'red'
      ? 'border-red-500/35 text-red-100'
      : accent === 'sky'
        ? 'border-sky-500/35 text-sky-100'
        : 'border-amber-500/35 text-amber-100';
  return (
    <div
      className={cn(
        'rounded-xl border bg-black/60 px-[clamp(0.65rem,1.4vw,1rem)] py-[clamp(0.45rem,1vh,0.65rem)] backdrop-blur-md',
        tone,
      )}
    >
      <p className="text-[clamp(0.65rem,1.2vw,0.85rem)] text-slate-400">{label}</p>
      <p className="text-[clamp(1.1rem,2.2vw,1.75rem)] font-bold tabular-nums">{value}</p>
    </div>
  );
}

export function PlatformRadar({ commandMode = false, soundEnabled = true, founderMode = false, className }: Props) {
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

  const simulateSearchPulse = useCallback(() => {
    const jitter = () => (Math.random() - 0.5) * 0.08;
    const lat = PLATFORM_RADAR_SIM_LAT + jitter();
    const lng = PLATFORM_RADAR_SIM_LNG + jitter();
    forcePulse(lat, lng, {
      label: 'محاكاة — الرياض',
      suspicious: Math.random() > 0.65,
    });
    if (soundEnabled) playTacticalUserPulseSound(0.14);
  }, [forcePulse, soundEnabled]);

  useEffect(() => {
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
  }, [ingestRealtimeUserSearch]);

  const stats = snapshot?.stats;
  const brief = snapshot?.brief;
  const ops = snapshot?.ops;

  const syncLabel =
    pulsesLoading || loading
      ? '…'
      : lastSyncAt
        ? new Date(lastSyncAt).toLocaleTimeString('ar-SA')
        : snapshot?.loadedAt
          ? new Date(snapshot.loadedAt).toLocaleTimeString('ar-SA')
          : '—';

  return (
    <div
      className={cn(
        'platform-radar-tactical royal-tactical-wing relative overflow-hidden bg-[#000205] text-white',
        commandMode ? 'h-[100dvh] w-[100dvw]' : 'min-h-[42rem] w-full rounded-2xl border border-sky-400/15',
        className,
      )}
      dir="rtl"
    >
      <TacticalRadarMap pulses={pulses} forcePulses={forcePulses} className="absolute inset-0" />

      <header className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-start justify-between gap-4 p-[clamp(0.75rem,2vw,1.5rem)]">
        <div className="pointer-events-auto rounded-2xl border border-amber-500/25 bg-black/70 px-[clamp(0.85rem,2vw,1.35rem)] py-[clamp(0.55rem,1.2vh,0.85rem)] backdrop-blur-xl">
          <p className="text-[clamp(0.65rem,1.2vw,0.85rem)] uppercase tracking-[0.22em] text-amber-300/85">
            الجناح التكتيكي الملكي
          </p>
          <h1 className="mt-1 flex items-center gap-2 text-[clamp(1.15rem,2.8vw,2rem)] font-bold text-white">
            <Crown className="h-[clamp(1rem,2.2vw,1.6rem)] w-[clamp(1rem,2.2vw,1.6rem)] text-amber-300" />
            <Radar className="h-[clamp(1rem,2.2vw,1.6rem)] w-[clamp(1rem,2.2vw,1.6rem)] text-sky-300" />
            Platform Radar
          </h1>
        </div>

        <div className="pointer-events-auto flex flex-col items-end gap-2">
          <p className="rounded-lg border border-sky-400/20 bg-black/65 px-3 py-1.5 text-[clamp(0.85rem,1.5vw,1.05rem)] text-slate-300 tabular-nums backdrop-blur-md">
            {syncLabel}
            {liveConnected ? (
              <span className="mr-2 inline-flex items-center gap-1 text-amber-300">
                <span className="golden-pulse-live h-2 w-2 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.9)]" />
                LIVE
              </span>
            ) : (
              <span className="mr-2 text-sky-300/90" title={liveHint ?? undefined}>
                POLL
              </span>
            )}
          </p>
        </div>
      </header>

      <aside className="pointer-events-none absolute inset-x-0 bottom-0 z-20 p-[clamp(0.75rem,2vw,1.5rem)]">
        <div className="pointer-events-auto grid gap-[clamp(0.5rem,1vw,0.85rem)] md:grid-cols-[1fr_auto] md:items-end">
          <div className="grid grid-cols-2 gap-[clamp(0.45rem,1vw,0.75rem)] sm:grid-cols-3 lg:grid-cols-6">
            <HudStat label="Golden Pulse" value={userPulseCount} />
            <HudStat label="Inspector" value={suspiciousCount} accent="red" />
            <HudStat label="حلاقون" value={stats?.totalBarbers ?? '—'} accent="sky" />
            <HudStat label="مستخدمون" value={stats?.totalUsers ?? '—'} accent="sky" />
            <HudStat label="عاجل 24س" value={ops?.urgentCount24h ?? 0} accent="gold" />
            <HudStat label="أمن 7d" value={brief?.securityEvents7d ?? '—'} accent="red" />
          </div>

          <div className="max-w-xl rounded-2xl border border-amber-500/20 bg-black/70 p-[clamp(0.75rem,1.5vw,1rem)] backdrop-blur-xl">
            <p className="flex items-center justify-end gap-2 text-[clamp(0.95rem,1.7vw,1.15rem)] font-semibold text-amber-100">
              <Zap className="h-4 w-4" />
              نبض السوق
            </p>
            <p className="mt-1 line-clamp-2 text-[clamp(0.9rem,1.6vw,1.05rem)] leading-relaxed text-slate-300">
              {brief?.searchDemandLine ?? '—'}
            </p>
            <p className="mt-2 flex items-center justify-end gap-1.5 text-[clamp(0.8rem,1.4vw,0.95rem)] text-red-200/90">
              <ShieldAlert className="h-3.5 w-3.5" />
              Inspector Detection — هالة حمراء على النشاط المريب
            </p>
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
            'pointer-events-auto absolute bottom-[clamp(5rem,11vh,6.5rem)] left-[clamp(0.75rem,2vw,1.5rem)] z-30 rounded-full border border-amber-500/20 bg-black/40 px-2 py-1 text-[10px] uppercase tracking-widest text-amber-300/0 transition-all hover:border-amber-400/50 hover:bg-black/70 hover:text-amber-200/90',
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
