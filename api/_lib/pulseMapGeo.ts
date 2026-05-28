/**
 * Pulse Map — kingdom geometry from Natural Earth 50m admin boundaries (ISO SAU).
 * Regenerate: `node scripts/generate-pulse-map-kingdom-outline.mjs`
 * Source: Natural Earth 50m ne_50m_admin_0_countries (ISO SAU)
 */

export type PulseMapLngLat = [number, number];

/** Equirectangular canvas bounds — kingdom bbox + breathing margin. */
export const PULSE_MAP_BOUNDS = {
  minLng: 34.275,
  maxLng: 55.991,
  minLat: 16.1218,
  maxLat: 32.3745,
} as const;

const LNG_SPAN = PULSE_MAP_BOUNDS.maxLng - PULSE_MAP_BOUNDS.minLng;
const LAT_SPAN = PULSE_MAP_BOUNDS.maxLat - PULSE_MAP_BOUNDS.minLat;

export const PULSE_MAP_VIEWBOX = {
  width: 1000,
  height: Math.round((LAT_SPAN / LNG_SPAN) * 1000),
} as const;

export function projectPulseMapLngLat(lng: number, lat: number): { x: number; y: number } {
  const x = ((lng - PULSE_MAP_BOUNDS.minLng) / LNG_SPAN) * PULSE_MAP_VIEWBOX.width;
  const y = ((PULSE_MAP_BOUNDS.maxLat - lat) / LAT_SPAN) * PULSE_MAP_VIEWBOX.height;
  return { x, y };
}

/** Douglas-Peucker simplified rings (ε=0.04°). Mainland + exclaves/islands. */
export const PULSE_MAP_KINGDOM_RINGS_LNGLAT: ReadonlyArray<ReadonlyArray<PulseMapLngLat>> = [
[
    [36.9017, 25.3831],
    [36.5303, 25.6016],
    [36.5336, 25.6887],
    [36.9548, 25.4146],
    [36.9017, 25.3831],
  ],
[
    [41.9877, 16.7156],
    [42.065, 16.7101],
    [42.06, 16.8035],
    [42.1704, 16.7086],
    [42.1578, 16.5707],
    [42.0718, 16.6715],
    [41.9642, 16.6535],
    [41.8016, 16.7788],
    [41.7761, 16.8469],
    [41.8582, 16.8929],
    [41.8604, 17.0025],
    [41.9479, 16.9364],
    [41.9877, 16.7156],
  ],
[
    [51.9776, 18.9961],
    [49.042, 18.5818],
    [48.1722, 18.1569],
    [47.5796, 17.4483],
    [47.4418, 17.1119],
    [47.1436, 16.9467],
    [46.9757, 16.9535],
    [46.7276, 17.2656],
    [46.3104, 17.2313],
    [45.5354, 17.3021],
    [45.148, 17.4274],
    [44.156, 17.3985],
    [43.917, 17.3247],
    [43.418, 17.5163],
    [43.1909, 17.3594],
    [43.2369, 17.2665],
    [43.156, 17.205],
    [43.1165, 16.942],
    [43.1845, 16.8118],
    [43.165, 16.6894],
    [42.7993, 16.3718],
    [42.6988, 16.737],
    [42.3833, 17.1225],
    [42.2939, 17.435],
    [41.75, 17.8857],
    [41.4317, 18.4524],
    [41.2295, 18.6784],
    [41.116, 19.0822],
    [40.7592, 19.7555],
    [40.0807, 20.2659],
    [39.7283, 20.3903],
    [39.2761, 20.974],
    [39.0936, 21.3104],
    [39.1471, 21.519],
    [38.9879, 21.8817],
    [39.0959, 22.3928],
    [39.062, 22.5922],
    [38.4642, 23.7119],
    [37.9197, 24.1854],
    [37.5431, 24.2917],
    [37.1809, 24.82],
    [37.2663, 24.9601],
    [37.1488, 25.2911],
    [36.9207, 25.6412],
    [36.7627, 25.7513],
    [36.6752, 26.0389],
    [36.5187, 26.1049],
    [36.2496, 26.5948],
    [35.1805, 28.0349],
    [34.7221, 28.1307],
    [34.625, 28.0645],
    [34.7799, 28.5073],
    [34.9508, 29.3535],
    [36.0685, 29.2005],
    [36.4761, 29.4951],
    [36.7553, 29.866],
    [37.4692, 29.9951],
    [37.6499, 30.331],
    [37.9801, 30.5],
    [36.9586, 31.4915],
    [38.9623, 31.9949],
    [39.1454, 32.1245],
    [40.3693, 31.939],
    [42.0744, 31.0804],
    [44.6908, 29.2023],
    [47.4332, 28.9896],
    [47.6713, 28.5332],
    [48.4425, 28.5429],
    [48.6264, 28.1326],
    [48.809, 27.8959],
    [48.7972, 27.7243],
    [49.2375, 27.4927],
    [49.1751, 27.4376],
    [49.4053, 27.181],
    [49.5377, 27.1518],
    [49.7165, 26.9559],
    [49.9861, 26.8289],
    [50.1498, 26.6626],
    [50.0081, 26.6785],
    [50.0273, 26.5269],
    [50.185, 26.4049],
    [50.2139, 26.3085],
    [50.1555, 26.1005],
    [50.0316, 26.111],
    [50.0811, 25.9614],
    [50.239, 25.6229],
    [50.4552, 25.4248],
    [50.5579, 25.0867],
    [50.8557, 24.6796],
    [50.966, 24.5739],
    [51.4112, 24.5708],
    [51.3099, 24.3404],
    [51.5684, 24.2862],
    [51.5926, 24.0789],
    [52.5551, 22.9328],
    [55.1043, 22.6215],
    [55.1858, 22.7041],
    [55.641, 22.0019],
    [54.9773, 19.9959],
    [51.9776, 18.9961],
  ],
[
    [36.5955, 25.7128],
    [36.5439, 25.7343],
    [36.5827, 25.8555],
    [36.5955, 25.7128],
  ],
];

export function ringsLngLatToSvgPaths(rings: ReadonlyArray<ReadonlyArray<PulseMapLngLat>>): string[] {
  return rings
    .filter((ring) => ring.length >= 3)
    .map((ring) => {
      const parts: string[] = [];
      ring.forEach(([lng, lat], idx) => {
        const { x, y } = projectPulseMapLngLat(lng, lat);
        parts.push(`${idx === 0 ? 'M' : 'L'}${x.toFixed(2)} ${y.toFixed(2)}`);
      });
      parts.push('Z');
      return parts.join(' ');
    });
}

export const PULSE_MAP_KINGDOM_OUTLINE_PATHS = ringsLngLatToSvgPaths(PULSE_MAP_KINGDOM_RINGS_LNGLAT);

export function isInsideKingdomOutline(lng: number, lat: number): boolean {
  for (const ring of PULSE_MAP_KINGDOM_RINGS_LNGLAT) {
    if (pointInRing(lng, lat, ring)) return true;
  }
  return false;
}

const PULSE_MAP_CENTROID_LNG = (PULSE_MAP_BOUNDS.minLng + PULSE_MAP_BOUNDS.maxLng) / 2;
const PULSE_MAP_CENTROID_LAT = (PULSE_MAP_BOUNDS.minLat + PULSE_MAP_BOUNDS.maxLat) / 2;

/** Nudge border cities inward so markers sit on the drawn kingdom outline. */
export function snapPulseMapCityLngLat(lng: number, lat: number): { lng: number; lat: number } {
  if (isInsideKingdomOutline(lng, lat)) return { lng, lat };
  for (let step = 1; step <= 20; step += 1) {
    const t = step / 20;
    const lng2 = lng + (PULSE_MAP_CENTROID_LNG - lng) * t;
    const lat2 = lat + (PULSE_MAP_CENTROID_LAT - lat) * t;
    if (isInsideKingdomOutline(lng2, lat2)) return { lng: lng2, lat: lat2 };
  }
  return { lng, lat };
}

function pointInRing(lng: number, lat: number, ring: ReadonlyArray<PulseMapLngLat>): boolean {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i, i += 1) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    const intersects =
      (yi > lat) !== (yj > lat) &&
      lng < ((xj - xi) * (lat - yi)) / (yj - yi + Number.EPSILON) + xi;
    if (intersects) inside = !inside;
  }
  return inside;
}
