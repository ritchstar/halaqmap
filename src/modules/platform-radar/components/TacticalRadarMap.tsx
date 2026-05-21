import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { projectKsaToPercent } from '@/modules/platform-radar/lib/saudiKingdomProjection';
import type { PlatformRadarForcePulse } from '@/modules/platform-radar/lib/platformRadarRealtime';
import type { PlatformRadarMapPulse } from '@/modules/platform-radar/types';

type Props = {
  pulses: PlatformRadarMapPulse[];
  forcePulses?: PlatformRadarForcePulse[];
  tacticalView: boolean;
  className?: string;
};

type PlacedPulse = PlatformRadarMapPulse & { left: number; top: number; ageMs: number };

function pulseOpacity(ageMs: number): number {
  const maxAge = 45 * 60 * 1000;
  const t = Math.min(1, ageMs / maxAge);
  return Math.max(0.25, 1 - t * 0.75);
}

export function TacticalRadarMap({ pulses, forcePulses = [], tacticalView, className }: Props) {
  const placed = useMemo(() => {
    const now = Date.now();
    return pulses
      .map((p) => {
        const pos = projectKsaToPercent(p.lat, p.lng);
        return {
          ...p,
          left: pos.left,
          top: pos.top,
          ageMs: now - Date.parse(p.createdAt),
        } satisfies PlacedPulse;
      })
      .filter((p) => Number.isFinite(p.ageMs));
  }, [pulses]);

  const placedForces = useMemo(() => {
    return forcePulses.map((p) => {
      const pos = projectKsaToPercent(p.lat, p.lng);
      return { ...p, left: pos.left, top: pos.top };
    });
  }, [forcePulses]);

  const userPulses = placed.filter((p) => p.kind === 'user_search');
  const securityPulses = placed.filter((p) => p.kind === 'security');

  return (
    <div
      className={cn(
        'tactical-radar-map relative h-full w-full overflow-hidden bg-[#020408]',
        className,
      )}
      role="img"
      aria-label="خريطة نبضات المستخدمين عبر المملكة"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_42%,rgba(6,182,212,0.07),transparent_62%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.14] [background-image:linear-gradient(rgba(34,211,238,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.12)_1px,transparent_1px)] [background-size:clamp(28px,4vw,56px)_clamp(28px,4vw,56px)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-[8%] rounded-[2rem] border border-cyan-500/15 shadow-[inset_0_0_80px_rgba(34,211,238,0.06)]"
      />

      {/* Kingdom silhouette hint */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[78%] w-[68%] -translate-x-1/2 -translate-y-[46%] rounded-[38%_42%_36%_40%] border border-slate-700/40 bg-gradient-to-b from-slate-900/35 via-[#05070d]/55 to-[#020305]/70"
      />

      <div className="absolute left-[clamp(0.75rem,2vw,1.5rem)] top-[clamp(0.75rem,2vh,1.5rem)] z-10 rounded-lg border border-cyan-500/25 bg-black/55 px-3 py-2 backdrop-blur-md">
        <p className="text-[clamp(0.65rem,1.2vw,0.85rem)] uppercase tracking-[0.18em] text-cyan-300/80">
          KSA Grid
        </p>
        <p className="text-[clamp(0.95rem,1.8vw,1.2rem)] font-semibold text-slate-100">
          {userPulses.length.toLocaleString('ar-SA')} نبض مستخدم
        </p>
      </div>

      {placedForces.map((p) => (
        <div
          key={p.burstKey}
          aria-hidden
          className="pointer-events-none absolute z-40 -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${p.left}%`, top: `${p.top}%` }}
        >
          <span className="tactical-radar-force-ripple absolute left-1/2 top-1/2 block h-[clamp(2.5rem,5vw,4.5rem)] w-[clamp(2.5rem,5vw,4.5rem)] -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-cyan-300/70 bg-cyan-400/10 shadow-[0_0_40px_rgba(34,211,238,0.55)]" />
          <span className="tactical-radar-force-ripple-delay absolute left-1/2 top-1/2 block h-[clamp(1.5rem,3vw,2.75rem)] w-[clamp(1.5rem,3vw,2.75rem)] -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-200/50 bg-cyan-300/20" />
        </div>
      ))}

      {userPulses.map((p) => {
        const opacity = pulseOpacity(p.ageMs);
        const showInspector = tacticalView && p.suspicious;
        return (
          <div
            key={p.id}
            className="tactical-radar-pulse absolute z-20 -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${p.left}%`, top: `${p.top}%`, opacity }}
            title={p.label}
          >
            {showInspector ? (
              <span
                aria-hidden
                className="tactical-radar-inspector-halo absolute left-1/2 top-1/2 block h-[clamp(1.75rem,3.5vw,3rem)] w-[clamp(1.75rem,3.5vw,3rem)] -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-red-500/70 bg-red-500/10 shadow-[0_0_28px_rgba(239,68,68,0.55)]"
              />
            ) : null}
            <span
              aria-hidden
              className={cn(
                'tactical-radar-pulse-ring absolute left-1/2 top-1/2 block -translate-x-1/2 -translate-y-1/2 rounded-full',
                showInspector
                  ? 'h-[clamp(1rem,2vw,1.5rem)] w-[clamp(1rem,2vw,1.5rem)] border border-red-400/50'
                  : 'h-[clamp(1.25rem,2.4vw,1.85rem)] w-[clamp(1.25rem,2.4vw,1.85rem)] border border-cyan-400/35',
              )}
            />
            <span
              className={cn(
                'relative block rounded-full shadow-[0_0_18px_currentColor]',
                showInspector
                  ? 'h-[clamp(0.45rem,0.9vw,0.7rem)] w-[clamp(0.45rem,0.9vw,0.7rem)] bg-red-400 text-red-400'
                  : 'h-[clamp(0.55rem,1.1vw,0.85rem)] w-[clamp(0.55rem,1.1vw,0.85rem)] bg-cyan-300 text-cyan-300',
              )}
            />
          </div>
        );
      })}

      {tacticalView
        ? securityPulses.map((p) => (
            <div
              key={p.id}
              className="absolute z-30 -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${p.left}%`, top: `${p.top}%`, opacity: pulseOpacity(p.ageMs) }}
              title={p.label}
            >
              <span
                aria-hidden
                className="tactical-radar-inspector-halo absolute left-1/2 top-1/2 block h-[clamp(2rem,4vw,3.25rem)] w-[clamp(2rem,4vw,3.25rem)] -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-red-500/80 bg-red-600/15 shadow-[0_0_36px_rgba(220,38,38,0.65)]"
              />
              <span className="relative block h-[clamp(0.6rem,1.2vw,0.9rem)] w-[clamp(0.6rem,1.2vw,0.9rem)] rounded-full bg-red-500 shadow-[0_0_20px_rgba(239,68,68,0.9)]" />
            </div>
          ))
        : null}

      <div className="absolute bottom-[clamp(0.75rem,2vh,1.5rem)] right-[clamp(0.75rem,2vw,1.5rem)] z-10 flex flex-wrap items-center gap-3 rounded-xl border border-white/10 bg-black/60 px-[clamp(0.75rem,1.5vw,1.25rem)] py-2 backdrop-blur-md">
        <span className="inline-flex items-center gap-2 text-[clamp(0.85rem,1.5vw,1.05rem)] text-cyan-100">
          <span className="h-3 w-3 rounded-full bg-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.8)]" />
          نبض بحث
        </span>
        {tacticalView ? (
          <span className="inline-flex items-center gap-2 text-[clamp(0.85rem,1.5vw,1.05rem)] text-red-200">
            <span className="h-3 w-3 rounded-full border border-red-400 bg-red-500/30 shadow-[0_0_12px_rgba(239,68,68,0.7)]" />
            Inspector Detection
          </span>
        ) : null}
      </div>
    </div>
  );
}
