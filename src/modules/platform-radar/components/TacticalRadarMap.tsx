import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { GoldenPulseMarker } from '@/modules/platform-radar/components/GoldenPulseMarker';
import { TacticalKingdomBackdrop } from '@/modules/platform-radar/components/TacticalKingdomBackdrop';
import { TacticalPulseNetwork } from '@/modules/platform-radar/components/TacticalPulseNetwork';
import { projectKsaToPercent } from '@/modules/platform-radar/lib/saudiKingdomProjection';
import type { PlatformRadarForcePulse } from '@/modules/platform-radar/lib/platformRadarRealtime';
import type { PlatformRadarMapPulse } from '@/modules/platform-radar/types';

type Props = {
  pulses: PlatformRadarMapPulse[];
  forcePulses?: PlatformRadarForcePulse[];
  tacticalView?: boolean;
  className?: string;
};

type PlacedPulse = PlatformRadarMapPulse & { left: number; top: number; ageMs: number };

function pulseOpacity(ageMs: number): number {
  const maxAge = 45 * 60 * 1000;
  const t = Math.min(1, ageMs / maxAge);
  return Math.max(0.35, 1 - t * 0.65);
}

function GoldenForceBurst({ left, top }: { left: number; top: number }) {
  return (
    <motion.div
      aria-hidden
      initial={{ scale: 0.25, opacity: 0.9 }}
      animate={{ scale: 2.8, opacity: 0 }}
      transition={{ duration: 1.5, ease: 'easeOut' }}
      className="pointer-events-none absolute z-40 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-amber-300/55 bg-amber-200/10 shadow-[0_0_52px_rgba(251,191,36,0.6)]"
      style={{
        left: `${left}%`,
        top: `${top}%`,
        width: 'clamp(2.75rem, 5.5vw, 4.75rem)',
        height: 'clamp(2.75rem, 5.5vw, 4.75rem)',
      }}
    />
  );
}

export function TacticalRadarMap({ pulses, forcePulses = [], tacticalView = true, className }: Props) {
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
  const securityPulses = tacticalView ? placed.filter((p) => p.kind === 'security') : [];

  const networkNodes = useMemo(
    () => userPulses.map((p) => ({ id: p.id, left: p.left, top: p.top })),
    [userPulses],
  );

  return (
    <div
      className={cn('tactical-radar-map relative h-full w-full overflow-hidden bg-black', className)}
      role="img"
      aria-label="الخريطة الليلية التكتيكية — Golden Pulse"
    >
      <TacticalKingdomBackdrop />
      <TacticalPulseNetwork nodes={networkNodes} maxDistance={16} maxLinksPerNode={2} />

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
          inspector={tacticalView && p.suspicious}
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
    </div>
  );
}
