import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { TacticalKingdomBackdrop } from '@/modules/platform-radar/components/TacticalKingdomBackdrop';
import { TacticalPulseNetwork } from '@/modules/platform-radar/components/TacticalPulseNetwork';
import {
  CITY_BEACONS,
  KSA_VIEWBOX,
  projectShowcaseCityPercent,
} from '@/modules/platform-radar/lib/saudiKingdomGeo';
import { ShowcasePulseMarker } from '@/modules/showcase-radar/components/ShowcasePulseMarker';
import type { ShowcaseRadarPulse } from '@/modules/showcase-radar/types';

type Props = {
  pulses: ShowcaseRadarPulse[];
  showSalonClusters?: boolean;
  className?: string;
};

function pulseOpacity(ageMs: number, anchor: boolean): number {
  if (anchor) return 0.88;
  const maxAge = 45 * 60 * 1000;
  const t = Math.min(1, ageMs / maxAge);
  return Math.max(0.45, 1 - t * 0.55);
}

export function ShowcaseRadarMap({ pulses, showSalonClusters = true, className }: Props) {
  const placed = useMemo(() => {
    const now = Date.now();
    return pulses
      .filter((p) => showSalonClusters || p.kind !== 'salon_cluster')
      .map((p) => {
        const pulseKind = p.kind === 'salon_cluster' ? 'barber' : 'user';
        const pos = projectShowcaseCityPercent(p.cityAr, p.lng, p.lat, p.id, pulseKind);
        return {
          ...p,
          left: pos.left,
          top: pos.top,
          ageMs: now - Date.parse(p.createdAt),
        };
      })
      .filter((p) => Number.isFinite(p.ageMs));
  }, [pulses, showSalonClusters]);

  const demandPulses = placed.filter((p) => p.kind === 'demand');
  const salonPulses = placed.filter((p) => p.kind === 'salon_cluster');
  const ambientCitySignals = useMemo(
    () =>
      CITY_BEACONS.map((city, index) => ({
        id: `ambient-city-${city.nameAr}-${index}`,
        left: (city.view.x / KSA_VIEWBOX.width) * 100,
        top: (city.view.y / KSA_VIEWBOX.height) * 100,
        cityAr: city.nameAr,
        tier: city.tier,
        variantIndex: index,
      })),
    [],
  );

  const networkNodes = useMemo(
    () => [
      ...ambientCitySignals.map((p) => ({ id: p.id, left: p.left, top: p.top })),
      ...placed.map((p) => ({ id: p.id, left: p.left, top: p.top })),
    ],
    [ambientCitySignals, placed],
  );

  const kingdomAspect = `${KSA_VIEWBOX.width} / ${KSA_VIEWBOX.height}`;

  return (
    <div
      className={cn(
        'tactical-radar-map relative h-full w-full overflow-hidden bg-black',
        'flex items-center justify-center',
        className,
      )}
      dir="ltr"
      role="img"
      aria-label="معاينة نظام الرصد الذكي — خريطة المملكة"
    >
      <div
        className="tactical-radar-canvas relative max-h-full max-w-full"
        style={{
          aspectRatio: kingdomAspect,
          width: '100%',
          height: '100%',
          maxHeight: `min(100%, calc(100% * (${KSA_VIEWBOX.width} / ${KSA_VIEWBOX.height})))`,
        }}
      >
        <TacticalKingdomBackdrop showCapitalHeartbeat={false} />
        <TacticalPulseNetwork nodes={networkNodes} maxDistance={18} maxLinksPerNode={2} />

        {ambientCitySignals.map((city) => (
          <ShowcasePulseMarker
            key={city.id}
            id={city.id}
            left={city.left}
            top={city.top}
            createdAt={new Date().toISOString()}
            labelAr={`إشارة مدينة — ${city.cityAr}`}
            pulseKind="city"
            signalTier={city.tier}
            variantIndex={city.variantIndex}
            opacity={city.tier === 'capital' ? 0.95 : city.tier === 'major' ? 0.78 : 0.62}
          />
        ))}

        {demandPulses.map((p) => (
          <ShowcasePulseMarker
            key={p.id}
            id={p.id}
            left={p.left}
            top={p.top}
            createdAt={p.createdAt}
            labelAr={p.labelAr}
            pulseKind="user"
            opacity={pulseOpacity(p.ageMs, false)}
          />
        ))}

        {salonPulses.map((p) => (
          <ShowcasePulseMarker
            key={p.id}
            id={p.id}
            left={p.left}
            top={p.top}
            createdAt={p.createdAt}
            labelAr={p.labelAr}
            pulseKind="barber"
            opacity={pulseOpacity(p.ageMs, true)}
          />
        ))}
      </div>
    </div>
  );
}
