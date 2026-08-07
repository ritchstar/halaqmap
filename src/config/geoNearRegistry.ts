/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
/**
 * سجل صفحات الهبوط الجغرافية `/near/...` — مصدر حقيقة للفهرسة والروابط الداخلية.
 * البيانات الخام في `geoNearRegistry.json` (يقرأها سكربت البناء أيضاً).
 */
import registryJson from './geoNearRegistry.json';

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

export const GEO_NEAR_NODES: readonly GeoNearNode[] = registry.nodes;

/** مسار URL النسبي بدون شرطة ختامية — مثال: /near/riyadh/qurtubah */
export function geoNearPath(node: GeoNearNode): string {
  const parts = [...node.parentSlugs, node.slug];
  return `${GEO_NEAR_HUB_PATH}/${parts.join('/')}`;
}

export function geoNearAbsoluteUrl(node: GeoNearNode, origin = GEO_NEAR_SITE_ORIGIN): string {
  return `${origin.replace(/\/+$/, '')}${geoNearPath(node)}`;
}

export function listGeoNearCities(): GeoNearNode[] {
  return GEO_NEAR_NODES.filter((n) => n.kind === 'city').sort((a, b) => b.priority - a.priority);
}

export function listGeoNearChildren(citySlug: string): GeoNearNode[] {
  return GEO_NEAR_NODES.filter(
    (n) => n.parentSlugs.length === 1 && n.parentSlugs[0] === citySlug,
  ).sort((a, b) => b.priority - a.priority);
}

/** رابط CTA لبدء الاستعلام داخل التطبيق مع إشارة جغرافية */
export function geoNearSearchCtaUrl(node: GeoNearNode, origin = GEO_NEAR_SITE_ORIGIN): string {
  const base = origin.replace(/\/+$/, '');
  const pathKey = [...node.parentSlugs, node.slug].join('/');
  return `${base}/#/?near=${encodeURIComponent(pathKey)}`;
}
