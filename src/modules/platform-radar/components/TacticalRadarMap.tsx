import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { GoldenPulseMarker } from '@/modules/platform-radar/components/GoldenPulseMarker';
import { TacticalKingdomBackdrop } from '@/modules/platform-radar/components/TacticalKingdomBackdrop';
import { projectKsaToPercent } from '@/modules/platform-radar/lib/saudiKingdomProjection';
import type { PlatformRadarForcePulse } from '@/modules/platform-radar/lib/platformRadarRealtime';
import type { PlatformRadarMapPulse } from '@/modules/platform-radar/types';

type Props = {
  pulses: PlatformRadarMapPulse[];
  forcePulses?: PlatformRadarForcePulse[];
  className?: string;
};

type PlacedPulse = PlatformRadarMapPulse & { left: number; top: number; ageMs: number };

function pulseOpacity(ageMs: number): number {
  const maxAge = 45 * 60 * 1000;
  const t = Math.min(1, ageMs / maxAge);
  return Math.max(0.3, 1 - t * 0.7);
}

function GoldenForceBurst({ left, top }: { left: number; top: number }) {
  return (
    <motion.div
      aria-hidden
      initial={{ scale: 0.2, opacity: 0.95 }}
      animate={{ scale: 2.6, opacity: 0 }}
      transition={{ duration: 1.4, ease: 'easeOut' }}
      className="pointer-events-none absolute z-40 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-amber-400/60 bg-amber-300/10 shadow-[0_0_48px_rgba(251,191,36,0.55)]"
      style={{
        left: `${left}%`,
        top: `${top}%`,
        width: 'clamp(2.5rem, 5vw, 4.5rem)',
        height: 'clamp(2.5rem, 5vw, 4.5rem)',
      }}
    />
  );
}

export function TacticalRadarMap({ pulses, forcePulses = [], className }: Props) {
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
        'tactical-radar-map royal-tactical-wing relative h-full w-full overflow-hidden bg-[#000205]',
        className,
      )}
      role="img"
      aria-label="الخريطة الليلية التكتيكية للمملكة — نبضات Golden Pulse"
    >
      <TacticalKingdomBackdrop />

      <div className="absolute left-[clamp(0.75rem,2vw,1.5rem)] top-[clamp(0.75rem,2vh,1.5rem)] z-10 rounded-lg border border-sky-400/25 bg-black/70 px-3 py-2 backdrop-blur-md">
        <p className="text-[clamp(0.6rem,1.1vw,0.8rem)] uppercase tracking-[0.2em] text-sky-300/75">
          Royal Tactical Wing
        </p>
        <p className="text-[clamp(0.95rem,1.8vw,1.2rem)] font-semibold text-amber-100">
          {userPulses.length.toLocaleString('ar-SA')} Golden Pulse
        </p>
      </div>

      {placedForces.map((p) => (
        <GoldenForceBurst key={p.burstKey} left={p.left} top={p.top} />
      ))}

      {userPulses.map((p) => (
        <GoldenPulseMarker
          key={p.id}
          id={p.id}
          left={p.left}
          top={p.top}
          lat={p.lat}
          lng={p.lng}
          createdAt={p.createdAt}
          label={p.label}
          inspector={p.suspicious}
          opacity={pulseOpacity(p.ageMs)}
          isNew
        />
      ))}

      {securityPulses.map((p) => (
        <GoldenPulseMarker
          key={p.id}
          id={p.id}
          left={p.left}
          top={p.top}
          lat={p.lat}
          lng={p.lng}
          createdAt={p.createdAt}
          label={p.label}
          inspector
          opacity={pulseOpacity(p.ageMs)}
          isNew
        />
      ))}

      <div className="absolute bottom-[clamp(0.75rem,2vh,1.5rem)] right-[clamp(0.75rem,2vw,1.5rem)] z-10 flex flex-wrap items-center gap-3 rounded-xl border border-sky-400/20 bg-black/75 px-[clamp(0.75rem,1.5vw,1.25rem)] py-2 backdrop-blur-md">
        <span className="inline-flex items-center gap-2 text-[clamp(0.8rem,1.4vw,1rem)] text-amber-100">
          <span className="relative flex h-4 w-4 items-center justify-center">
            <span className="golden-pulse-halo absolute inset-0 rounded-full border border-amber-400/40" />
            <span className="h-2 w-2 rounded-sm bg-amber-300 shadow-[0_0_10px_rgba(251,191,36,0.9)]" />
          </span>
          نبض بحث — مقص ومشط
        </span>
        <span className="inline-flex items-center gap-2 text-[clamp(0.8rem,1.4vw,1rem)] text-red-200">
          <span className="relative flex h-4 w-4 items-center justify-center">
            <span className="golden-pulse-halo absolute inset-0 rounded-full border border-red-400/45" />
            <span className="h-2 w-2 rounded-sm bg-red-400 shadow-[0_0_10px_rgba(248,113,113,0.85)]" />
          </span>
          Inspector Detection
        </span>
      </div>
    </div>
  );
}
