/**
 * Tactical KSA geometry — hand-crafted simplified vector outline of the
 * Kingdom and its immediate neighbors, calibrated for the platform radar.
 *
 * Coordinate model:
 *   • All shapes share one equirectangular SVG viewBox computed from the
 *     KSA tactical bounds (see KSA_BOUNDS) so that lat/lng pulses project
 *     to the *exact same* pixel coordinates as the country fill.
 *   • The viewBox aspect ratio is intentionally locked to longitude/latitude
 *     span so the kingdom keeps its familiar silhouette regardless of the
 *     host container size — the parent wraps this inside an aspect-ratio
 *     letterbox.
 *
 * Why no GeoJSON dependency?
 *   • The visual goal is a stylised tactical silhouette, not pixel-perfect
 *     cartography. A 30–50 vertex outline is enough to be recognisable and
 *     keeps bundle size flat. The outline is faithful to ~10–20 km along
 *     the coast and ~30 km inland, which is more than sufficient at
 *     screen sizes ≤ 4K.
 */

/** Tactical bounds — the visible canvas window of the radar (KSA-focused). */
export const KSA_TACTICAL_BOUNDS = {
  minLat: 16.0,
  maxLat: 32.25,
  minLng: 34.5,
  maxLng: 56.0,
} as const;

const LNG_SPAN = KSA_TACTICAL_BOUNDS.maxLng - KSA_TACTICAL_BOUNDS.minLng;
const LAT_SPAN = KSA_TACTICAL_BOUNDS.maxLat - KSA_TACTICAL_BOUNDS.minLat;

/** SVG viewBox dimensions — equirectangular, aspect-locked to KSA span. */
export const KSA_VIEWBOX = {
  width: 1000,
  // Equirectangular y-axis stretches by lat/lng span ratio.
  height: Math.round((LAT_SPAN / LNG_SPAN) * 1000), // ≈ 756
} as const;

export type LngLat = { lng: number; lat: number };
export type ViewPoint = { x: number; y: number };

/** Project a lng/lat coordinate into the radar's SVG viewBox space. */
export function projectLngLatToView(lng: number, lat: number): ViewPoint {
  const x = ((lng - KSA_TACTICAL_BOUNDS.minLng) / LNG_SPAN) * KSA_VIEWBOX.width;
  const y = ((KSA_TACTICAL_BOUNDS.maxLat - lat) / LAT_SPAN) * KSA_VIEWBOX.height;
  return { x, y };
}

/** Project a lng/lat coordinate into percent values for HTML positioning. */
export function projectLngLatToPercent(
  lng: number,
  lat: number,
): { left: number; top: number } {
  const left = ((lng - KSA_TACTICAL_BOUNDS.minLng) / LNG_SPAN) * 100;
  const top = ((KSA_TACTICAL_BOUNDS.maxLat - lat) / LAT_SPAN) * 100;
  return { left, top };
}

/** True when a coordinate lies inside the tactical canvas at all. */
export function isInsideTacticalCanvas(lng: number, lat: number): boolean {
  return (
    lng >= KSA_TACTICAL_BOUNDS.minLng &&
    lng <= KSA_TACTICAL_BOUNDS.maxLng &&
    lat >= KSA_TACTICAL_BOUNDS.minLat &&
    lat <= KSA_TACTICAL_BOUNDS.maxLat
  );
}

/**
 * Saudi Arabia outline — closed polygon traversed clockwise from the
 * north-west corner (Gulf of Aqaba) down the Red Sea coast, around the
 * southern Empty Quarter, up the Persian Gulf, and back along the
 * Iraq/Jordan border. Vertices in [lng, lat] order.
 */
const KSA_OUTLINE_LNGLAT: ReadonlyArray<[number, number]> = [
  // North-west (Gulf of Aqaba / Jordan corner)
  [34.95, 29.35],
  [35.6, 28.55],
  // Jordan border NE
  [37.4, 29.95],
  [38.9, 31.65],
  [39.3, 32.15],
  // Iraq border
  [42.1, 31.1],
  [44.45, 29.5],
  [46.65, 29.1],
  // Kuwait neutral zone / Khafji
  [47.5, 28.95],
  [48.45, 28.55],
  [48.65, 27.6],
  // Persian Gulf coast (Saudi)
  [49.65, 27.05],
  [49.99, 26.39],
  [50.1, 26.0],
  [50.55, 25.3],
  [50.85, 24.75],
  // Qatar / UAE base
  [51.0, 24.5],
  [51.45, 24.55],
  [52.55, 24.05],
  // UAE / Oman corridor
  [54.3, 22.5],
  [55.65, 22.0],
  [55.7, 20.5],
  // Rub al Khali — Oman / Yemen corner
  [53.6, 19.35],
  [52.4, 18.95],
  [49.95, 18.65],
  // Yemen border (south)
  [47.7, 17.05],
  [46.5, 17.1],
  [44.6, 17.4],
  [43.5, 17.35],
  // Jizan / Red Sea south corner
  [42.85, 16.65],
  [42.5, 17.45],
  // Red Sea coast (south to north)
  [41.8, 19.5],
  [41.2, 21.2],
  [40.05, 22.35],
  [39.1, 24.4],
  [38.3, 25.5],
  [37.5, 26.8],
  [36.4, 27.95],
  [35.6, 28.55],
  // Close
  [34.95, 29.35],
];

/** Convert a lat/lng polygon into an SVG `M …Lx y Lx y… Z` path string. */
function toSvgPath(vertices: ReadonlyArray<[number, number]>): string {
  const parts: string[] = [];
  vertices.forEach(([lng, lat], idx) => {
    const { x, y } = projectLngLatToView(lng, lat);
    parts.push(`${idx === 0 ? 'M' : 'L'}${x.toFixed(2)} ${y.toFixed(2)}`);
  });
  parts.push('Z');
  return parts.join(' ');
}

/** Closed SVG path data for the Saudi Arabia silhouette. */
export const KSA_OUTLINE_PATH = toSvgPath(KSA_OUTLINE_LNGLAT);

/**
 * Neighbour country hints — short coastline segments that frame the KSA
 * silhouette without claiming cartographic completeness. Each entry is an
 * open path (no `Z`) drawn with a dim stroke.
 */
const NEIGHBOUR_SEGMENTS_LNGLAT: ReadonlyArray<{
  id: string;
  labelAr: string;
  vertices: ReadonlyArray<[number, number]>;
  labelAnchor: [number, number];
}> = [
  {
    id: 'jordan',
    labelAr: 'الأردن',
    vertices: [
      [35.0, 29.5],
      [35.5, 30.3],
      [36.4, 31.0],
      [37.4, 31.65],
      [38.0, 32.0],
      [39.3, 32.15],
    ],
    labelAnchor: [37.0, 31.0],
  },
  {
    id: 'iraq',
    labelAr: 'العراق',
    vertices: [
      [39.3, 32.15],
      [41.0, 32.6],
      [43.0, 32.5],
      [44.5, 31.5],
      [46.5, 30.3],
      [47.7, 30.05],
    ],
    labelAnchor: [43.0, 32.0],
  },
  {
    id: 'kuwait',
    labelAr: 'الكويت',
    vertices: [
      [47.5, 28.95],
      [47.7, 29.5],
      [48.4, 29.7],
      [48.55, 29.0],
    ],
    labelAnchor: [47.95, 29.3],
  },
  {
    id: 'qatar',
    labelAr: 'قطر',
    vertices: [
      [50.85, 24.75],
      [50.9, 25.4],
      [51.4, 25.85],
      [51.6, 25.4],
      [51.45, 24.55],
    ],
    labelAnchor: [51.2, 25.3],
  },
  {
    id: 'uae',
    labelAr: 'الإمارات',
    vertices: [
      [51.45, 24.55],
      [52.55, 24.05],
      [54.3, 22.5],
      [55.65, 22.0],
      [56.0, 25.5],
      [54.8, 25.0],
      [53.8, 24.2],
    ],
    labelAnchor: [54.5, 24.6],
  },
  {
    id: 'oman',
    labelAr: 'عُمان',
    vertices: [
      [55.65, 22.0],
      [55.7, 20.5],
      [55.3, 19.3],
      [54.0, 18.3],
      [53.6, 19.35],
    ],
    labelAnchor: [55.0, 19.5],
  },
  {
    id: 'yemen',
    labelAr: 'اليمن',
    vertices: [
      [42.85, 16.65],
      [43.5, 16.0],
      [45.0, 15.5],
      [47.7, 16.3],
      [49.95, 18.65],
      [52.4, 18.95],
    ],
    labelAnchor: [46.8, 16.2],
  },
  {
    id: 'egypt-sinai',
    labelAr: 'سيناء',
    vertices: [
      [34.5, 28.0],
      [34.55, 29.0],
      [34.95, 29.35],
    ],
    labelAnchor: [34.55, 28.5],
  },
];

export type NeighbourSegment = {
  id: string;
  labelAr: string;
  path: string;
  labelView: ViewPoint;
};

export const NEIGHBOUR_SEGMENTS: ReadonlyArray<NeighbourSegment> =
  NEIGHBOUR_SEGMENTS_LNGLAT.map((seg) => {
    const parts: string[] = [];
    seg.vertices.forEach(([lng, lat], idx) => {
      const { x, y } = projectLngLatToView(lng, lat);
      parts.push(`${idx === 0 ? 'M' : 'L'}${x.toFixed(2)} ${y.toFixed(2)}`);
    });
    return {
      id: seg.id,
      labelAr: seg.labelAr,
      path: parts.join(' '),
      labelView: projectLngLatToView(seg.labelAnchor[0], seg.labelAnchor[1]),
    };
  });

/** Sea / body-of-water labels positioned above the radar canvas. */
export type SeaLabel = {
  id: 'red-sea' | 'persian-gulf' | 'arabian-sea';
  labelAr: string;
  view: ViewPoint;
  rotation: number;
};

const SEA_LABELS_LNGLAT: ReadonlyArray<{
  id: SeaLabel['id'];
  labelAr: string;
  anchor: [number, number];
  rotation: number;
}> = [
  { id: 'red-sea', labelAr: 'البحر الأحمر', anchor: [37.8, 22.0], rotation: -55 },
  { id: 'persian-gulf', labelAr: 'الخليج العربي', anchor: [51.3, 27.0], rotation: -28 },
  { id: 'arabian-sea', labelAr: 'بحر العرب', anchor: [55.2, 17.5], rotation: -10 },
];

export const SEA_LABELS: ReadonlyArray<SeaLabel> = SEA_LABELS_LNGLAT.map((s) => ({
  id: s.id,
  labelAr: s.labelAr,
  view: projectLngLatToView(s.anchor[0], s.anchor[1]),
  rotation: s.rotation,
}));

/** 13 Saudi administrative regions — anchored at their approximate capitals. */
export type SaudiRegion = {
  id: string;
  labelAr: string;
  anchor: ViewPoint;
};

const REGIONS_LNGLAT: ReadonlyArray<{
  id: string;
  labelAr: string;
  anchor: [number, number];
}> = [
  { id: 'riyadh', labelAr: 'الرياض', anchor: [46.6753, 24.7136] },
  { id: 'makkah', labelAr: 'مكة المكرمة', anchor: [39.8579, 21.3891] },
  { id: 'madinah', labelAr: 'المدينة المنورة', anchor: [39.6, 24.47] },
  { id: 'eastern', labelAr: 'الشرقية', anchor: [49.8, 26.3] },
  { id: 'qassim', labelAr: 'القصيم', anchor: [43.97, 26.32] },
  { id: 'hail', labelAr: 'حائل', anchor: [41.72, 27.51] },
  { id: 'tabuk', labelAr: 'تبوك', anchor: [36.55, 28.38] },
  { id: 'jouf', labelAr: 'الجوف', anchor: [40.21, 29.78] },
  { id: 'northern-borders', labelAr: 'الحدود الشمالية', anchor: [42.05, 30.97] },
  { id: 'asir', labelAr: 'عسير', anchor: [42.5, 18.22] },
  { id: 'baha', labelAr: 'الباحة', anchor: [41.46, 20.0] },
  { id: 'jizan', labelAr: 'جازان', anchor: [42.57, 16.89] },
  { id: 'najran', labelAr: 'نجران', anchor: [44.23, 17.57] },
];

export const SAUDI_REGIONS: ReadonlyArray<SaudiRegion> = REGIONS_LNGLAT.map((r) => ({
  id: r.id,
  labelAr: r.labelAr,
  anchor: projectLngLatToView(r.anchor[0], r.anchor[1]),
}));

/** Major city beacons — projected once for the backdrop's glow layer. */
export type CityBeacon = {
  nameAr: string;
  view: ViewPoint;
  tier: 'capital' | 'major' | 'hub';
};

const CITY_BEACONS_LNGLAT: ReadonlyArray<{
  nameAr: string;
  lng: number;
  lat: number;
  tier: CityBeacon['tier'];
}> = [
  { nameAr: 'الرياض', lng: 46.6753, lat: 24.7136, tier: 'capital' },
  { nameAr: 'جدة', lng: 39.1925, lat: 21.4858, tier: 'major' },
  { nameAr: 'مكة', lng: 39.8579, lat: 21.3891, tier: 'major' },
  { nameAr: 'المدينة', lng: 39.5692, lat: 24.5247, tier: 'major' },
  { nameAr: 'الدمام', lng: 49.9777, lat: 26.3927, tier: 'major' },
  { nameAr: 'الخبر', lng: 50.1971, lat: 26.2172, tier: 'hub' },
  { nameAr: 'تبوك', lng: 36.555, lat: 28.3838, tier: 'hub' },
  { nameAr: 'حائل', lng: 41.7208, lat: 27.5114, tier: 'hub' },
  { nameAr: 'بريدة', lng: 43.975, lat: 26.326, tier: 'hub' },
  { nameAr: 'أبها', lng: 42.5053, lat: 18.2164, tier: 'hub' },
  { nameAr: 'جازان', lng: 42.5706, lat: 16.8894, tier: 'hub' },
  { nameAr: 'نجران', lng: 44.2289, lat: 17.5656, tier: 'hub' },
];

export const CITY_BEACONS: ReadonlyArray<CityBeacon> = CITY_BEACONS_LNGLAT.map((c) => ({
  nameAr: c.nameAr,
  view: projectLngLatToView(c.lng, c.lat),
  tier: c.tier,
}));

/** Capital coordinates (Riyadh) — used for heartbeat pulse + radar centre. */
export const RIYADH_VIEW = projectLngLatToView(46.6753, 24.7136);

/**
 * Latitude/longitude graticule lines — every 2° within tactical bounds,
 * pre-projected so the backdrop can draw them as simple `<line>` elements.
 */
function buildGraticule(): {
  meridians: Array<{ x: number; lng: number }>;
  parallels: Array<{ y: number; lat: number }>;
} {
  const meridians: Array<{ x: number; lng: number }> = [];
  const parallels: Array<{ y: number; lat: number }> = [];

  const lngStart = Math.ceil(KSA_TACTICAL_BOUNDS.minLng / 2) * 2;
  for (let lng = lngStart; lng <= KSA_TACTICAL_BOUNDS.maxLng; lng += 2) {
    const { x } = projectLngLatToView(lng, KSA_TACTICAL_BOUNDS.minLat);
    meridians.push({ x, lng });
  }

  const latStart = Math.ceil(KSA_TACTICAL_BOUNDS.minLat / 2) * 2;
  for (let lat = latStart; lat <= KSA_TACTICAL_BOUNDS.maxLat; lat += 2) {
    const { y } = projectLngLatToView(KSA_TACTICAL_BOUNDS.minLng, lat);
    parallels.push({ y, lat });
  }

  return { meridians, parallels };
}

export const KSA_GRATICULE = buildGraticule();
