/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * عزل واجهة متجر halaqmap على النطاق الفرعي.
 * لا تستورد partnerLegal / storeFront من هنا — App يستدعي هذا الملف عند الإقلاع.
 */
import { ROUTE_PATHS } from '@/lib/routePaths';

export const STORE_SATELLITE_HOST = 'store.halaqmap.com' as const;
export const STORE_ORIGIN = `https://${STORE_SATELLITE_HOST}` as const;

const MENS_HOSTS = new Set(['www.halaqmap.com', 'halaqmap.com']);

export function isHalaqmapStoreHost(host: string): boolean {
  return host.trim().toLowerCase() === STORE_SATELLITE_HOST;
}

export function isHalaqmapMensHost(host: string): boolean {
  return MENS_HOSTS.has(host.trim().toLowerCase());
}

function isStoreSurfacePath(path: string): boolean {
  return path === '/store' || path.startsWith('/store/');
}

export function resolveMensHostStoreRedirect(input: {
  host: string;
  hashPath: string;
  hashSearch?: string;
}): string | null {
  if (!isHalaqmapMensHost(input.host)) return null;
  const path = (input.hashPath || '/').trim() || '/';
  const rawSearch = String(input.hashSearch || '').trim();
  const search = rawSearch && rawSearch !== '?' ? (rawSearch.startsWith('?') ? rawSearch : `?${rawSearch}`) : '';
  if (!isStoreSurfacePath(path)) return null;
  return `https://${STORE_SATELLITE_HOST}/#${path}${search}`;
}

export function isStoreHostPaymentPath(path: string): boolean {
  const normalized = (path || '/').trim() || '/';
  return (
    normalized === ROUTE_PATHS.PAYMENT ||
    normalized === ROUTE_PATHS.PAYMENT_SUCCESS ||
    normalized.startsWith(`${ROUTE_PATHS.PAYMENT}/`) ||
    normalized.startsWith('/pay/occasion-card/')
  );
}

export function occasionCardPayHref(token: string): string {
  const hashPath = `/pay/occasion-card/${encodeURIComponent(token)}`;
  if (typeof window === 'undefined') return `/#${hashPath}`;
  if (isHalaqmapStoreHost(window.location.hostname)) {
    return `https://www.halaqmap.com/#${hashPath}`;
  }
  return `/#${hashPath}`;
}

export function occasionCardViewHref(token: string): string {
  const hashPath = `/store/invites/v/${encodeURIComponent(token)}`;
  if (typeof window === 'undefined') return `/#${hashPath}`;
  if (isHalaqmapMensHost(window.location.hostname)) {
    return `https://store.halaqmap.com/#${hashPath}`;
  }
  return `/#${hashPath}`;
}
