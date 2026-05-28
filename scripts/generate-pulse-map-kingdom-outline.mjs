/**
 * Build Pulse Map kingdom outline from Natural Earth 50m admin boundaries (ISO SAU).
 * Source: https://www.naturalearthdata.com/downloads/50m-cultural-vectors/50m-admin-0-countries/
 *
 * Usage: node scripts/generate-pulse-map-kingdom-outline.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const NE_URL =
  'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_50m_admin_0_countries.geojson';
const OUT_JSON = path.join(__dirname, 'pulse-map-kingdom-outline.generated.json');
const RDP_EPSILON = 0.04;
const PAD_LNG = 0.35;
const PAD_LAT = 0.25;

function perpDist(p, a, b) {
  const [x, y] = p;
  const [x1, y1] = a;
  const [x2, y2] = b;
  const dx = x2 - x1;
  const dy = y2 - y1;
  if (dx === 0 && dy === 0) return Math.hypot(x - x1, y - y1);
  const t = Math.max(0, Math.min(1, ((x - x1) * dx + (y - y1) * dy) / (dx * dx + dy * dy)));
  return Math.hypot(x - (x1 + t * dx), y - (y1 + t * dy));
}

function rdp(points, eps) {
  if (points.length <= 2) return points;
  let max = 0;
  let idx = 0;
  for (let i = 1; i < points.length - 1; i += 1) {
    const d = perpDist(points[i], points[0], points[points.length - 1]);
    if (d > max) {
      max = d;
      idx = i;
    }
  }
  if (max > eps) {
    const left = rdp(points.slice(0, idx + 1), eps);
    const right = rdp(points.slice(idx), eps);
    return left.slice(0, -1).concat(right);
  }
  return [points[0], points[points.length - 1]];
}

function fmt(n) {
  return Number(n.toFixed(4));
}

function ringToTs(ring, indent) {
  const lines = ring.map(([lng, lat]) => `${indent}[${lng}, ${lat}],`);
  return `[\n${lines.join('\n')}\n${indent.slice(0, -2)}]`;
}

function buildGeoModule({ bounds, rings, meta }, isServer) {
  const ringsTs = rings.map((ring) => ringToTs(ring, '    ')).join(',\n');
  return `/**
 * Pulse Map — kingdom geometry from Natural Earth 50m admin boundaries (ISO SAU).
 * Regenerate: \`node scripts/generate-pulse-map-kingdom-outline.mjs\`
 * Source: ${meta.source}
 */
${isServer ? '' : "import type { PlatformCityRegion } from '@/config/platformCoveredCities';\n"}
export type PulseMapLngLat = [number, number];

/** Equirectangular canvas bounds — kingdom bbox + breathing margin. */
export const PULSE_MAP_BOUNDS = {
  minLng: ${bounds.minLng},
  maxLng: ${bounds.maxLng},
  minLat: ${bounds.minLat},
  maxLat: ${bounds.maxLat},
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

/** Douglas-Peucker simplified rings (ε=${meta.epsilon}°). Mainland + exclaves/islands. */
export const PULSE_MAP_KINGDOM_RINGS_LNGLAT: ReadonlyArray<ReadonlyArray<PulseMapLngLat>> = [
${ringsTs},
];

export function ringsLngLatToSvgPaths(rings: ReadonlyArray<ReadonlyArray<PulseMapLngLat>>): string[] {
  return rings
    .filter((ring) => ring.length >= 3)
    .map((ring) => {
      const parts: string[] = [];
      ring.forEach(([lng, lat], idx) => {
        const { x, y } = projectPulseMapLngLat(lng, lat);
        parts.push(\`\${idx === 0 ? 'M' : 'L'}\${x.toFixed(2)} \${y.toFixed(2)}\`);
      });
      parts.push('Z');
      return parts.join(' ');
    });
}

export const PULSE_MAP_KINGDOM_OUTLINE_PATHS = ringsLngLatToSvgPaths(PULSE_MAP_KINGDOM_RINGS_LNGLAT);

/** Step 2+ — major city anchors (empty until city layer is added). */
export type PulseMapCityAnchor = {
  id: string;
  nameAr: string;
  region?: PlatformCityRegion;
  lng: number;
  lat: number;
};

export const PULSE_MAP_CITY_ANCHORS: readonly PulseMapCityAnchor[] = [];

export function projectPulseMapCity(anchor: PulseMapCityAnchor): { x: number; y: number } {
  return projectPulseMapLngLat(anchor.lng, anchor.lat);
}

export function isInsideKingdomOutline(lng: number, lat: number): boolean {
  for (const ring of PULSE_MAP_KINGDOM_RINGS_LNGLAT) {
    if (pointInRing(lng, lat, ring)) return true;
  }
  return false;
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
`;
}

async function main() {
  const res = await fetch(NE_URL);
  if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
  const geo = await res.json();
  const sa = geo.features.find((f) => f.properties?.ISO_A3 === 'SAU');
  if (!sa) throw new Error('Saudi Arabia (SAU) not found in Natural Earth dataset');

  const rings = sa.geometry.coordinates.map((poly) => rdp(poly[0], RDP_EPSILON));
  let minLng = Infinity;
  let maxLng = -Infinity;
  let minLat = Infinity;
  let maxLat = -Infinity;
  for (const ring of rings) {
    for (const [lng, lat] of ring) {
      minLng = Math.min(minLng, lng);
      maxLng = Math.max(maxLng, lng);
      minLat = Math.min(minLat, lat);
      maxLat = Math.max(maxLat, lat);
    }
  }

  const payload = {
    bounds: {
      minLng: fmt(minLng - PAD_LNG),
      maxLng: fmt(maxLng + PAD_LNG),
      minLat: fmt(minLat - PAD_LAT),
      maxLat: fmt(maxLat + PAD_LAT),
    },
    rings: rings.map((ring) => ring.map(([lng, lat]) => [fmt(lng), fmt(lat)])),
    meta: {
      source: 'Natural Earth 50m ne_50m_admin_0_countries (ISO SAU)',
      epsilon: RDP_EPSILON,
      ringCounts: rings.map((r) => r.length),
    },
  };

  fs.writeFileSync(OUT_JSON, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');

  const clientPath = path.join(ROOT, 'src/modules/pulse-map/lib/pulseMapGeo.ts');
  const serverPath = path.join(ROOT, 'api/_lib/pulseMapGeo.ts');
  const serverModule = buildGeoModule(payload, true).replace(
    'region?: PlatformCityRegion;',
    'region?: string;',
  );
  fs.writeFileSync(clientPath, buildGeoModule(payload, false), 'utf8');
  fs.writeFileSync(serverPath, serverModule, 'utf8');

  console.log('Wrote', OUT_JSON);
  console.log('Wrote', clientPath);
  console.log('Wrote', serverPath);
  console.log('Rings:', payload.meta.ringCounts.join(', '));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
