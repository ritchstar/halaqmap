/**
 * Cyber radar geography — KSA is the centre target; external attack
 * sources are projected onto a stylised peripheral ring (NOT to scale)
 * around the KSA viewBox so the user sees inbound vectors landing
 * inside the country.
 *
 * Why a ring instead of a world map? The point of the radar is to make
 * the country (the asset under protection) feel central and important.
 * A full Mercator world map would dwarf KSA visually and dilute the
 * focus. The peripheral ring keeps the kingdom dominant while still
 * communicating "this attack came from country X".
 */

import {
  CITY_BEACONS,
  KSA_VIEWBOX,
  projectLngLatToView,
} from '@/modules/platform-radar/lib/saudiKingdomGeo';
import type { ViewPoint } from '@/modules/platform-radar/lib/saudiKingdomGeo';

/** Public re-export — pulses inside KSA use the standard projection. */
export { projectLngLatToView, CITY_BEACONS, KSA_VIEWBOX };

/**
 * External source identifiers — fictional jurisdictions used in scenarios.
 * Real live attacks would expose IP-derived country codes; we render
 * those onto the ring with the same identifier set.
 */
export const EXTERNAL_SOURCES = [
  // Compass placements (angle in degrees from east, going CCW).
  { id: 'east_asia', labelAr: 'شرق آسيا', angleDeg: 60 },
  { id: 'south_asia', labelAr: 'جنوب آسيا', angleDeg: 30 },
  { id: 'gulf_neighbours', labelAr: 'دول الجوار', angleDeg: 0 },
  { id: 'horn_of_africa', labelAr: 'القرن الأفريقي', angleDeg: -30 },
  { id: 'north_africa', labelAr: 'شمال أفريقيا', angleDeg: 200 },
  { id: 'europe', labelAr: 'أوروبا', angleDeg: 140 },
  { id: 'east_europe', labelAr: 'شرق أوروبا', angleDeg: 110 },
  { id: 'americas', labelAr: 'الأمريكيتان', angleDeg: 180 },
  { id: 'levant', labelAr: 'بلاد الشام', angleDeg: 95 },
  { id: 'central_asia', labelAr: 'آسيا الوسطى', angleDeg: 80 },
] as const;

export type ExternalSourceId = (typeof EXTERNAL_SOURCES)[number]['id'];

/** Centre of the radar canvas — used as the anchor for the peripheral ring. */
const CENTER: ViewPoint = {
  x: KSA_VIEWBOX.width / 2,
  y: KSA_VIEWBOX.height / 2,
};

/** Ring radius in viewBox units — sized to sit just outside the KSA outline. */
const RING_RADIUS = Math.min(KSA_VIEWBOX.width, KSA_VIEWBOX.height) * 0.62;

/** Project an external source onto the peripheral ring. */
export function projectExternalSource(id: ExternalSourceId): ViewPoint {
  const source = EXTERNAL_SOURCES.find((s) => s.id === id);
  if (!source) return CENTER;
  const rad = (source.angleDeg * Math.PI) / 180;
  return {
    x: CENTER.x + Math.cos(rad) * RING_RADIUS,
    y: CENTER.y - Math.sin(rad) * RING_RADIUS,
  };
}

/** Map id → label for the event-log chip. */
export function externalSourceLabelAr(id: ExternalSourceId): string {
  return EXTERNAL_SOURCES.find((s) => s.id === id)?.labelAr ?? id;
}

/** Pick a random KSA city beacon view point — handy for live scenarios. */
export function randomKsaCityPoint(): { point: ViewPoint; nameAr: string } {
  const beacon = CITY_BEACONS[Math.floor(Math.random() * CITY_BEACONS.length)];
  return { point: beacon.view, nameAr: beacon.nameAr };
}

/** Project an arbitrary KSA lng/lat (for live simulated operational feed). */
export function ksaLngLatToView(lng: number, lat: number): ViewPoint {
  return projectLngLatToView(lng, lat);
}
