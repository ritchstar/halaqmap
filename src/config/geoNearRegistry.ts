/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
/**
 * سجل صفحات الهبوط الجغرافية `/near/...` — مصدر حقيقة للفهرسة والروابط الداخلية.
 * المدن والاتجاهات: `geoNearRegistry.json`
 * الأحياء: `geoNearNeighborhoods.json`
 */
import registryJson from './geoNearRegistry.json';
import neighborhoodsJson from './geoNearNeighborhoods.json';

export const GEO_NEAR_HUB_PATH = '/near' as const;
export const GEO_NEAR_SITE_ORIGIN = 'https://www.halaqmap.com' as const;

export type GeoNearKind = 'city' | 'direction' | 'neighborhood';

export type GeoNearNode = {
  slug: string;
  nameAr: string;
  kind: GeoNearKind;
  parentSlugs: string[];
  lat: number;
  lng: number;
  aliasesAr?: string[];
  priority: number;
};

type RegistryFile = {
  version: number;
  origin: string;
  nodes: GeoNearNode[];
};

const registry = registryJson as RegistryFile;
const neighborhoods = neighborhoodsJson as RegistryFile;

export const GEO_NEAR_NODES: readonly GeoNearNode[] = [
  ...registry.nodes,
  ...neighborhoods.nodes,
];

/** مسار URL النسبي بدون شرطة ختامية — مثال: /near/riyadh/qurtubah */
export function geoNearPath(node: GeoNearNode): string {
  const parts = [...node.parentSlugs, node.slug];
  return `${GEO_NEAR_HUB_PATH}/${parts.join('/')}`;
}

export function geoNearAbsoluteUrl(node: GeoNearNode, origin = GEO_NEAR_SITE_ORIGIN): string {
  return `${origin.replace(/\/+$/, '')}${geoNearPath(node)}`;
}

export function geoNearPathKey(node: GeoNearNode): string {
  return [...node.parentSlugs, node.slug].join('/');
}

/** يبحث بعقدة عبر مفتاح المسار مثل `riyadh/badiah` أو `riyadh` */
export function findGeoNearByPathKey(pathKey: string): GeoNearNode | null {
  const key = String(pathKey || '')
    .trim()
    .replace(/^\/+/, '')
    .replace(/^near\//, '')
    .replace(/\/+$/, '');
  if (!key) return null;
  return GEO_NEAR_NODES.find((n) => geoNearPathKey(n) === key) ?? null;
}

export function listGeoNearCities(): GeoNearNode[] {
  return GEO_NEAR_NODES.filter((n) => n.kind === 'city').sort((a, b) => b.priority - a.priority);
}

export function listGeoNearChildren(citySlug: string): GeoNearNode[] {
  return GEO_NEAR_NODES.filter(
    (n) => n.parentSlugs.length === 1 && n.parentSlugs[0] === citySlug,
  ).sort((a, b) => b.priority - a.priority);
}

export function listGeoNearNeighborhoods(citySlug: string): GeoNearNode[] {
  return listGeoNearChildren(citySlug).filter((n) => n.kind === 'neighborhood');
}

export function listGeoNearDirections(citySlug: string): GeoNearNode[] {
  return listGeoNearChildren(citySlug).filter((n) => n.kind === 'direction');
}

/** رابط CTA لبدء الاستعلام داخل التطبيق مع إشارة جغرافية */
export function geoNearSearchCtaUrl(node: GeoNearNode, origin = GEO_NEAR_SITE_ORIGIN): string {
  const base = origin.replace(/\/+$/, '');
  return `${base}/#/?near=${encodeURIComponent(geoNearPathKey(node))}`;
}
