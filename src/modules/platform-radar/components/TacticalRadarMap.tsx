import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { GoldenPulseMarker } from '@/modules/platform-radar/components/GoldenPulseMarker';
import { TacticalKingdomBackdrop } from '@/modules/platform-radar/components/TacticalKingdomBackdrop';
import { TacticalPulseNetwork } from '@/modules/platform-radar/components/TacticalPulseNetwork';
import { useTacticalBarberAnchors } from '@/modules/platform-radar/hooks/useTacticalBarberAnchors';
import { projectKsaToPercent } from '@/modules/platform-radar/lib/saudiKingdomProjection';
import { KSA_VIEWBOX } from '@/modules/platform-radar/lib/saudiKingdomGeo';
import type { PlatformRadarForcePulse } from '@/modules/platform-radar/lib/platformRadarRealtime';
import type { PlatformRadarMapPulse } from '@/modules/platform-radar/types';

type Props = {
  pulses: PlatformRadarMapPulse[];
  forcePulses?: PlatformRadarForcePulse[];
  tacticalView?: boolean;
  className?: string;
};

type PlacedPulse = PlatformRadarMapPulse & { left: number; top: number; ageMs: number };

function pulseOpacity(ageMs: number, anchor: boolean): number {
  if (anchor) return 0.92;
  const maxAge = 45 * 60 * 1000;
  const t = Math.min(1, ageMs / maxAge);
  return Math.max(0.45, 1 - t * 0.55);
}

function GoldenForceBurst({ left, top }: { left: number; top: number }) {
  return (
    <motion.div
      aria-hidden
      initial={{ scale: 0.2, opacity: 0.95 }}
      animate={{ scale: 2.9, opacity: 0 }}
      transition={{ duration: 1.55, ease: 'easeOut' }}
      className="pointer-events-none absolute z-[45] -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-amber-300/65 bg-amber-200/12 shadow-[0_0_56px_rgba(251,191,36,0.65)]"
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
  const barberAnchors = useTacticalBarberAnchors(true);

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

  const placedAnchors = useMemo(() => {
    return barberAnchors.map((p) => {
      const pos = projectKsaToPercent(p.lat, p.lng);
      return { ...p, left: pos.left, top: pos.top, ageMs: 0 };
    });
  }, [barberAnchors]);

  const placedForces = useMemo(() => {
    return forcePulses.map((p) => {
      const pos = projectKsaToPercent(p.lat, p.lng);
      return { ...p, left: pos.left, top: pos.top };
    });
  }, [forcePulses]);

  const userPulses = placed.filter((p) => p.kind === 'user_search');
  const securityPulses = tacticalView ? placed.filter((p) => p.kind === 'security') : [];

  const networkNodes = useMemo(
    () =>
      [...userPulses, ...placedAnchors].map((p) => ({ id: p.id, left: p.left, top: p.top })),
    [userPulses, placedAnchors],
  );

  // Aspect ratio locked to the KSA viewBox — guarantees that backdrop SVG
  // and HTML pulse markers share one coordinate space (no more drift
  // between satellite raster and projected pulse positions).
  const kingdomAspect = `${KSA_VIEWBOX.width} / ${KSA_VIEWBOX.height}`;

  return (
    <div
      className={cn(
        'tactical-radar-map relative h-full w-full overflow-hidden bg-black',
        'flex items-center justify-center',
        className,
      )}
      role="img"
      aria-label="الخريطة التكتيكية للمملكة العربية السعودية — Golden Pulse"
    >
      {/* Aspect-locked canvas: backdrop + markers project to the same percent grid. */}
      <div
        className="tactical-radar-canvas relative max-h-full max-w-full"
        style={{
          aspectRatio: kingdomAspect,
          width: '100%',
          height: '100%',
          // Keep the kingdom as tall/wide as possible without spilling.
          maxHeight: `min(100%, calc(100% * (${KSA_VIEWBOX.width} / ${KSA_VIEWBOX.height})))`,
        }}
      >
        <TacticalKingdomBackdrop />
        <TacticalPulseNetwork nodes={networkNodes} maxDistance={18} maxLinksPerNode={2} />

        {placedForces.map((p) => (
          <GoldenForceBurst key={p.burstKey} left={p.left} top={p.top} />
        ))}

        {placedAnchors.map((p) => (
          <GoldenPulseMarker
            key={p.id}
            id={p.id}
            left={p.left}
            top={p.top}
            lat={p.lat}
            lng={p.lng}
            createdAt={p.createdAt}
            label={p.label}
            anchor
            opacity={pulseOpacity(p.ageMs, true)}
          />
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
            opacity={pulseOpacity(p.ageMs, false)}
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
            opacity={pulseOpacity(p.ageMs, false)}
          />
        ))}
      </div>
    </div>
  );
}
