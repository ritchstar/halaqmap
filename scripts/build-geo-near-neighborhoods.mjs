/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 * يبني src/config/geoNearNeighborhoods.json من البذور + مراكز المدن.
 */
import { writeFileSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { NEIGHBORHOOD_SEEDS } from './data/geoNearNeighborhoodSeeds.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const REGISTRY_PATH = join(ROOT, 'src', 'config', 'geoNearRegistry.json');
const OUT_PATH = join(ROOT, 'src', 'config', 'geoNearNeighborhoods.json');

const registry = JSON.parse(readFileSync(REGISTRY_PATH, 'utf8'));
const cities = new Map(
  registry.nodes.filter((n) => n.kind === 'city').map((c) => [c.slug, c]),
);

const nodes = [];
for (const [citySlug, seeds] of Object.entries(NEIGHBORHOOD_SEEDS)) {
  const city = cities.get(citySlug);
  if (!city) {
    throw new Error(`Unknown city slug in neighborhood seeds: ${citySlug}`);
  }
  seeds.forEach((entry, index) => {
    const [slug, nameAr, a, b, absolute] = entry;
    let lat;
    let lng;
    if (absolute === true) {
      lat = a;
      lng = b;
    } else {
      lat = Number((city.lat + (a ?? 0)).toFixed(5));
      lng = Number((city.lng + (b ?? 0)).toFixed(5));
    }
    nodes.push({
      slug,
      nameAr,
      kind: 'neighborhood',
      parentSlugs: [citySlug],
      lat,
      lng,
      priority: Math.max(20, 85 - index),
    });
  });
}

const out = {
  version: 1,
  origin: 'https://www.halaqmap.com',
  nodes,
};

writeFileSync(OUT_PATH, `${JSON.stringify(out, null, 2)}\n`, 'utf8');
console.log(`[build-geo-near-neighborhoods] wrote ${nodes.length} neighborhoods → ${OUT_PATH}`);
