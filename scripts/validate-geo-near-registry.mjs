/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 * تحقق خفيف: أب المدينة موجود، مسار فريد، إحداثيات داخل حدود تقريبية للسعودية.
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const LAT_MIN = 16;
const LAT_MAX = 33;
const LNG_MIN = 34;
const LNG_MAX = 56;

function loadNodes() {
  const registry = JSON.parse(readFileSync(join(ROOT, 'src', 'config', 'geoNearRegistry.json'), 'utf8'));
  let neighborhoods = { nodes: [] };
  try {
    neighborhoods = JSON.parse(
      readFileSync(join(ROOT, 'src', 'config', 'geoNearNeighborhoods.json'), 'utf8'),
    );
  } catch {
    /* optional until built */
  }
  return [...(registry.nodes || []), ...(neighborhoods.nodes || [])];
}

function pathKey(node) {
  return [...node.parentSlugs, node.slug].join('/');
}

const nodes = loadNodes();
const cities = new Set(nodes.filter((n) => n.kind === 'city').map((n) => n.slug));
const seen = new Set();
const errors = [];

for (const node of nodes) {
  if (!node.slug || !node.nameAr || !node.kind) {
    errors.push(`Incomplete node: ${JSON.stringify(node)}`);
    continue;
  }
  const key = pathKey(node);
  if (seen.has(key)) errors.push(`Duplicate path: ${key}`);
  seen.add(key);

  if (node.kind !== 'city') {
    if (!Array.isArray(node.parentSlugs) || node.parentSlugs.length !== 1) {
      errors.push(`${key}: parentSlugs must be exactly one city`);
    } else if (!cities.has(node.parentSlugs[0])) {
      errors.push(`${key}: unknown parent city ${node.parentSlugs[0]}`);
    }
  } else if (node.parentSlugs?.length) {
    errors.push(`${key}: city must have empty parentSlugs`);
  }

  if (
    typeof node.lat !== 'number' ||
    typeof node.lng !== 'number' ||
    node.lat < LAT_MIN ||
    node.lat > LAT_MAX ||
    node.lng < LNG_MIN ||
    node.lng > LNG_MAX
  ) {
    errors.push(`${key}: coordinates out of KSA bounds (${node.lat}, ${node.lng})`);
  }
}

if (errors.length) {
  console.error('[validate-geo-near-registry] FAILED:');
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}

const counts = {
  city: nodes.filter((n) => n.kind === 'city').length,
  direction: nodes.filter((n) => n.kind === 'direction').length,
  neighborhood: nodes.filter((n) => n.kind === 'neighborhood').length,
};
console.log(
  `[validate-geo-near-registry] OK — ${nodes.length} nodes (city ${counts.city}, direction ${counts.direction}, neighborhood ${counts.neighborhood})`,
);
