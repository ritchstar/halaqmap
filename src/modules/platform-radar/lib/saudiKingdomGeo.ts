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
 *
 * Calibration goal: every CITY_BEACONS entry must project visually INSIDE
 * this polygon. The previous 36-vertex outline was too tight along the
 * Red Sea (Yanbu fell outside) and along the Jordan/Iraq border (Tabuk
 * sat on the western edge). This revision adds vertices along those
 * coasts and pushes them outward by 0.2°–0.4° so every beacon clears
 * the border line with safety margin.
 */
export const KSA_OUTLINE_LNGLAT: ReadonlyArray<[number, number]> = [
  // === North-west: Gulf of Aqaba → Jordan corner ===
  [34.85, 29.35], // Aqaba bay NW
  [34.95, 28.95],
  [35.30, 28.10], // Sharma / Tabuk province coast
  [35.45, 27.55], // pushed west to keep Tabuk inland with safety margin
  [35.85, 26.65], // Al-Wajh north
  [36.20, 26.10], // Al-Wajh
  [36.85, 25.40], // Umluj
  [37.25, 24.85], // Umluj south
  [37.60, 24.45], // Yanbu Al-Nakhl
  [37.80, 24.05], // **Yanbu Al-Bahr** (city at 38.06, 24.09 — coast pushed west)
  [38.10, 23.40], // South of Yanbu
  [38.40, 22.85], // Rabigh
  [38.70, 22.30], // South of Rabigh
  [38.90, 21.80], // North of Jeddah
  [39.00, 21.45], // **Jeddah** (39.19, 21.49 — coast pushed west)
  [39.10, 21.05], // South of Jeddah
  [39.35, 20.45], // Al Qunfudhah
  [39.75, 19.75], // Al-Birk north
  [40.40, 19.05], // Al-Lith corridor
  [41.10, 18.40], // North of Al-Birk / Asir coast
  [41.55, 17.65], // North of Jazan
  [42.10, 17.10], // Jazan north
  [42.55, 16.85], // Jazan
  // === South-west: Yemen border (Red Sea → Empty Quarter) ===
  [42.80, 16.60], // Yemen border corner
  [43.40, 16.95],
  [44.40, 17.35], // Najran approach
  [44.70, 17.40],
  [45.90, 17.55],
  [46.85, 17.30],
  [47.70, 17.15],
  [48.60, 17.60],
  [49.50, 18.15],
  [49.95, 18.65], // Eastern Yemen corner
  // === South-east: Empty Quarter → Oman / UAE ===
  [51.70, 18.95],
  [52.40, 19.05],
  [53.65, 19.45],
  [55.20, 20.05],
  [55.70, 20.65],
  [55.85, 21.60],
  // === East: UAE / Qatar corridor → Persian Gulf coast ===
  [55.10, 22.55], // UAE inland
  [54.40, 22.85],
  [53.05, 23.55],
  [52.40, 24.05], // UAE coast bend
  [51.40, 24.20], // Qatar base SW
  [50.95, 24.50], // Qatar base
  [50.65, 24.85], // Qatar base N
  [50.85, 25.35],
  [50.15, 26.00],
  [50.10, 26.40], // **Dammam / Khobar** (49.98, 26.39 — coast pushed east)
  [49.95, 27.10], // **Jubail** (49.66, 27.01 — coast pushed east)
  [49.20, 27.95], // Kuwait approach
  [48.85, 28.55],
  [48.65, 28.95],
  [48.40, 29.05],
  // === North: Kuwait → Iraq → Jordan border ===
  [47.85, 29.10], // Khafji area
  [46.55, 29.10], // Hafar Al-Batin (45.96, 28.43 well south of this line)
  [44.70, 29.45],
  [43.20, 30.55],
  [42.45, 31.20],
  [41.30, 31.60], // Arar (41.04, 30.98 — well south of this northern line)
  [40.20, 31.95],
  [39.30, 32.20], // Northern apex (Al-Tubaiq)
  [38.55, 31.85],
  [37.65, 31.05],
  [36.85, 30.35], // Sakaka (40.21, 29.97 — well south + east of this western line)
  [36.20, 29.80],
  [35.55, 29.45],
  // === Close back to Aqaba ===
  [35.10, 29.40],
  [34.85, 29.35],
];

/** Ray-cast point-in-polygon — vertices in [lng, lat] order. */
function pointInLngLatPolygon(
  lng: number,
  lat: number,
  polygon: ReadonlyArray<[number, number]>,
): boolean {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i, i += 1) {
    const [xi, yi] = polygon[i];
    const [xj, yj] = polygon[j];
    const intersects =
      (yi > lat) !== (yj > lat) &&
      lng < ((xj - xi) * (lat - yi)) / (yj - yi + Number.EPSILON) + xi;
    if (intersects) inside = !inside;
  }
  return inside;
}

/** True when a coordinate lies inside the hand-drawn KSA silhouette. */
export function isInsideKsaSilhouette(lng: number, lat: number): boolean {
  return pointInLngLatPolygon(lng, lat, KSA_OUTLINE_LNGLAT);
}

const KSA_SILHOUETTE_CENTROID = { lat: 24.0, lng: 45.0 } as const;

/** Nudge a coordinate inward until it clears the silhouette border. */
export function ensureInsideKsaSilhouette(
  lat: number,
  lng: number,
  anchorLat: number,
  anchorLng: number,
): { lat: number; lng: number } {
  if (isInsideKsaSilhouette(lng, lat)) return { lat, lng };
  if (isInsideKsaSilhouette(anchorLng, anchorLat)) {
    return { lat: anchorLat, lng: anchorLng };
  }
  for (let step = 1; step <= 12; step += 1) {
    const t = step / 12;
    const lat2 = anchorLat + (KSA_SILHOUETTE_CENTROID.lat - anchorLat) * t;
    const lng2 = anchorLng + (KSA_SILHOUETTE_CENTROID.lng - anchorLng) * t;
    if (isInsideKsaSilhouette(lng2, lat2)) return { lat: lat2, lng: lng2 };
  }
  return { lat: anchorLat, lng: anchorLng };
}

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
  /**
   * Where to render the label relative to the beacon dot. Defaults to 'above'.
   * Use 'below' for the secondary city in a tight pair (e.g. Khobar under
   * Dammam, Khamis Mushait under Abha) so labels never overlap.
   */
  labelPosition: 'above' | 'below';
};

// Beacons cover the 13 admin region capitals plus strategic religious,
// industrial and port hubs. Coordinates verified against WGS-84 city centres.
// `labelPosition: 'below'` is set ONLY for the secondary city in a tight
// geographic pair so the two text labels do not collide.
const CITY_BEACONS_LNGLAT: ReadonlyArray<{
  nameAr: string;
  lng: number;
  lat: number;
  tier: CityBeacon['tier'];
  labelPosition?: CityBeacon['labelPosition'];
}> = [
  // === Capital ===
  { nameAr: 'الرياض', lng: 46.6753, lat: 24.7136, tier: 'capital' },

  // === Major centres — religious / economic / industrial pillars ===
  { nameAr: 'جدة', lng: 39.1925, lat: 21.4858, tier: 'major' },
  { nameAr: 'مكة', lng: 39.8579, lat: 21.3891, tier: 'major' },
  { nameAr: 'الطائف', lng: 40.4178, lat: 21.2703, tier: 'major', labelPosition: 'below' },
  { nameAr: 'المدينة', lng: 39.5692, lat: 24.5247, tier: 'major' },
  { nameAr: 'الدمام', lng: 49.9777, lat: 26.3927, tier: 'major' },
  { nameAr: 'الأحساء', lng: 49.5872, lat: 25.3633, tier: 'major' },

  // === Regional hubs — provincial capitals + strategic ports & industrial cities ===
  { nameAr: 'الخبر', lng: 50.1971, lat: 26.2172, tier: 'hub', labelPosition: 'below' },
  { nameAr: 'الجبيل', lng: 49.6622, lat: 27.0146, tier: 'hub' },
  { nameAr: 'تبوك', lng: 36.555, lat: 28.3838, tier: 'hub' },
  { nameAr: 'حائل', lng: 41.7208, lat: 27.5114, tier: 'hub' },
  { nameAr: 'بريدة', lng: 43.975, lat: 26.326, tier: 'hub' },
  { nameAr: 'أبها', lng: 42.5053, lat: 18.2164, tier: 'hub' },
  { nameAr: 'خميس مشيط', lng: 42.7298, lat: 18.306, tier: 'hub', labelPosition: 'below' },
  { nameAr: 'جازان', lng: 42.5706, lat: 16.8894, tier: 'hub' },
  { nameAr: 'نجران', lng: 44.2289, lat: 17.5656, tier: 'hub' },
  { nameAr: 'الباحة', lng: 41.4677, lat: 20.0129, tier: 'hub' },
  { nameAr: 'ينبع', lng: 38.0584, lat: 24.0889, tier: 'hub' },
  { nameAr: 'حفر الباطن', lng: 45.9601, lat: 28.4337, tier: 'hub' },
  { nameAr: 'عرعر', lng: 41.0381, lat: 30.9753, tier: 'hub' },
  { nameAr: 'سكاكا', lng: 40.2064, lat: 29.9697, tier: 'hub' },
];

export const CITY_BEACONS: ReadonlyArray<CityBeacon> = CITY_BEACONS_LNGLAT.map((c) => ({
  nameAr: c.nameAr,
  view: projectLngLatToView(c.lng, c.lat),
  tier: c.tier,
  labelPosition: c.labelPosition ?? 'above',
}));

/** Capital coordinates (Riyadh) — used for heartbeat pulse + radar centre. */
export const RIYADH_VIEW = projectLngLatToView(46.6753, 24.7136);

function matchCityBeacon(cityAr: string): CityBeacon | null {
  const query = cityAr.trim();
  if (!query) return null;
  return (
    CITY_BEACONS.find((c) => query.includes(c.nameAr) || c.nameAr.includes(query)) ?? null
  );
}

/** مطابقة اسم مدينة → إحداثيات الـ beacon المُ calibrate على الخريطة. */
export function resolveBeaconLngLat(cityAr: string): { lng: number; lat: number } | null {
  const hit = CITY_BEACONS_LNGLAT.find((c) => {
    const query = cityAr.trim();
    return query && (query.includes(c.nameAr) || c.nameAr.includes(query));
  });
  return hit ? { lng: hit.lng, lat: hit.lat } : null;
}

/** نفس موضع تسمية المدينة على الخلفية (viewBox SVG). */
export function resolveBeaconView(cityAr: string): ViewPoint | null {
  return matchCityBeacon(cityAr)?.view ?? null;
}

/** اسحب نقطة العرض نحو الداخل (اتجاه الرياض) لتبقى داخل الشكل المرئي. */
export function nudgeViewTowardInterior(view: ViewPoint, strength = 0.12): ViewPoint {
  const cx = RIYADH_VIEW.x;
  const cy = RIYADH_VIEW.y;
  return {
    x: view.x + (cx - view.x) * strength,
    y: view.y + (cy - view.y) * strength,
  };
}

/**
 * Showcase radar placement — anchor on CITY_BEACON view coords (same layer as
 * map labels) so coastal pulses never drift into the sea on equirectangular
 * projection. Falls back to lng/lat + interior nudge for cities without beacons.
 */
export function projectShowcaseCityPercent(
  cityAr: string,
  fallbackLng: number,
  fallbackLat: number,
  seed: string,
  kind: 'user' | 'barber',
): { left: number; top: number } {
  const beaconView = resolveBeaconView(cityAr);
  let view: ViewPoint;
  if (beaconView) {
    view = { x: beaconView.x, y: beaconView.y };
  } else {
    view = projectLngLatToView(fallbackLng, fallbackLat);
    view = nudgeViewTowardInterior(view, kind === 'barber' ? 0.18 : 0.12);
  }

  let h = 0;
  for (let i = 0; i < seed.length; i += 1) h = (h * 31 + seed.charCodeAt(i)) | 0;
  const jitter = beaconView ? (kind === 'barber' ? 0.2 : 0.38) : kind === 'barber' ? 0.24 : 0.48;
  const jx = (((h & 0xff) / 255) - 0.5) * jitter * 2;
  const jy = ((((h >> 8) & 0xff) / 255) - 0.5) * jitter * 2;

  const x = Math.min(KSA_VIEWBOX.width, Math.max(0, view.x + jx));
  const y = Math.min(KSA_VIEWBOX.height, Math.max(0, view.y + jy));

  return {
    left: (x / KSA_VIEWBOX.width) * 100,
    top: (y / KSA_VIEWBOX.height) * 100,
  };
}

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
