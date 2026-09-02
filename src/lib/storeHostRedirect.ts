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
  if (path === '/store/ops' || path.startsWith('/store/ops/')) return false;
  return (
    path === '/store' ||
    path.startsWith('/store/') ||
    path === '/oc' ||
    path.startsWith('/oc/') ||
    path === '/w' ||
    path.startsWith('/w/') ||
    path === '/e' ||
    path.startsWith('/e/') ||
    path === '/l' ||
    path.startsWith('/l/') ||
    path === '/g' ||
    path.startsWith('/g/') ||
    path === '/r' ||
    path.startsWith('/r/') ||
    path === '/c' ||
    path.startsWith('/c/') ||
    path === '/k' ||
    path.startsWith('/k/') ||
    path === '/h' ||
    path.startsWith('/h/')
  );
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
  if (path === '/oc' || path.startsWith('/oc/')) {
    const token = path.replace(/^\/oc\/?/, '').split('/')[0];
    if (!token) return `https://${STORE_SATELLITE_HOST}/#${ROUTE_PATHS.STORE_INVITES}`;
    return `https://${STORE_SATELLITE_HOST}/#/store/invites/v/${encodeURIComponent(token)}`;
  }
  if (!isStoreSurfacePath(path)) return null;
  return `https://${STORE_SATELLITE_HOST}/#${path}${search}`;
}

export function isStoreHostPaymentPath(path: string): boolean {
  const normalized = (path || '/').trim() || '/';
  return (
    normalized === ROUTE_PATHS.PAYMENT ||
    normalized === ROUTE_PATHS.PAYMENT_SUCCESS ||
    normalized.startsWith(`${ROUTE_PATHS.PAYMENT}/`) ||
    normalized.startsWith('/pay/occasion-card/') ||
    normalized.startsWith('/pay/wedding/') ||
    normalized.startsWith('/pay/event/') ||
    normalized.startsWith('/pay/lounge/') ||
    normalized.startsWith('/pay/grocers/') ||
    normalized.startsWith('/pay/restaurant/') ||
    normalized.startsWith('/pay/cafe/') ||
    normalized.startsWith('/pay/kitchen/')
  );
}

export function weddingLivePayHref(token: string): string {
  const hashPath = `/pay/wedding/${encodeURIComponent(token)}`;
  if (typeof window === 'undefined') return `/#${hashPath}`;
  if (isHalaqmapStoreHost(window.location.hostname)) {
    return `https://www.halaqmap.com/#${hashPath}`;
  }
  return `/#${hashPath}`;
}

export function weddingLiveViewHref(token: string): string {
  const hashPath = `/w/${encodeURIComponent(token)}`;
  if (typeof window === 'undefined') return `/#${hashPath}`;
  if (isHalaqmapMensHost(window.location.hostname)) {
    return `https://store.halaqmap.com/#${hashPath}`;
  }
  return `/#${hashPath}`;
}

export function eventLivePayHref(token: string): string {
  const hashPath = `/pay/event/${encodeURIComponent(token)}`;
  if (typeof window === 'undefined') return `/#${hashPath}`;
  if (isHalaqmapStoreHost(window.location.hostname)) {
    return `https://www.halaqmap.com/#${hashPath}`;
  }
  return `/#${hashPath}`;
}

export function eventLiveViewHref(token: string): string {
  const hashPath = `/e/${encodeURIComponent(token)}`;
  if (typeof window === 'undefined') return `/#${hashPath}`;
  if (isHalaqmapMensHost(window.location.hostname)) {
    return `https://store.halaqmap.com/#${hashPath}`;
  }
  return `/#${hashPath}`;
}

export function loungeLivePayHref(token: string): string {
  const hashPath = `/pay/lounge/${encodeURIComponent(token)}`;
  if (typeof window === 'undefined') return `/#${hashPath}`;
  if (isHalaqmapStoreHost(window.location.hostname)) {
    return `https://www.halaqmap.com/#${hashPath}`;
  }
  return `/#${hashPath}`;
}

export function loungeLiveViewHref(token: string): string {
  const hashPath = `/l/${encodeURIComponent(token)}`;
  if (typeof window === 'undefined') return `/#${hashPath}`;
  if (isHalaqmapMensHost(window.location.hostname)) {
    return `https://store.halaqmap.com/#${hashPath}`;
  }
  return `/#${hashPath}`;
}

export function grocersLivePayHref(token: string): string {
  const hashPath = `/pay/grocers/${encodeURIComponent(token)}`;
  if (typeof window === 'undefined') return `/#${hashPath}`;
  if (isHalaqmapStoreHost(window.location.hostname)) {
    return `https://www.halaqmap.com/#${hashPath}`;
  }
  return `/#${hashPath}`;
}

export function grocersLiveViewHref(token: string): string {
  const hashPath = `/g/${encodeURIComponent(token)}`;
  if (typeof window === 'undefined') return `/#${hashPath}`;
  if (isHalaqmapMensHost(window.location.hostname)) {
    return `https://store.halaqmap.com/#${hashPath}`;
  }
  return `/#${hashPath}`;
}

export function restaurantLivePayHref(token: string): string {
  const hashPath = `/pay/restaurant/${encodeURIComponent(token)}`;
  if (typeof window === 'undefined') return `/#${hashPath}`;
  if (isHalaqmapStoreHost(window.location.hostname)) {
    return `https://www.halaqmap.com/#${hashPath}`;
  }
  return `/#${hashPath}`;
}

export function restaurantLiveViewHref(token: string): string {
  const hashPath = `/r/${encodeURIComponent(token)}`;
  if (typeof window === 'undefined') return `/#${hashPath}`;
  if (isHalaqmapMensHost(window.location.hostname)) {
    return `https://store.halaqmap.com/#${hashPath}`;
  }
  return `/#${hashPath}`;
}

export function cafeLivePayHref(token: string): string {
  const hashPath = `/pay/cafe/${encodeURIComponent(token)}`;
  if (typeof window === 'undefined') return `/#${hashPath}`;
  if (isHalaqmapStoreHost(window.location.hostname)) {
    return `https://www.halaqmap.com/#${hashPath}`;
  }
  return `/#${hashPath}`;
}

export function cafeLiveViewHref(token: string): string {
  const hashPath = `/c/${encodeURIComponent(token)}`;
  if (typeof window === 'undefined') return `/#${hashPath}`;
  if (isHalaqmapMensHost(window.location.hostname)) {
    return `https://store.halaqmap.com/#${hashPath}`;
  }
  return `/#${hashPath}`;
}

export function kitchenLivePayHref(token: string): string {
  const hashPath = `/pay/kitchen/${encodeURIComponent(token)}`;
  if (typeof window === 'undefined') return `/#${hashPath}`;
  if (isHalaqmapStoreHost(window.location.hostname)) {
    return `https://www.halaqmap.com/#${hashPath}`;
  }
  return `/#${hashPath}`;
}

export function kitchenLiveViewHref(token: string): string {
  const hashPath = `/k/${encodeURIComponent(token)}`;
  if (typeof window === 'undefined') return `/#${hashPath}`;
  if (isHalaqmapMensHost(window.location.hostname)) {
    return `https://store.halaqmap.com/#${hashPath}`;
  }
  return `/#${hashPath}`;
}

export function produceLivePayHref(token: string): string {
  const hashPath = `/pay/produce/${encodeURIComponent(token)}`;
  if (typeof window === 'undefined') return `/#${hashPath}`;
  if (isHalaqmapStoreHost(window.location.hostname)) {
    return `https://www.halaqmap.com/#${hashPath}`;
  }
  return `/#${hashPath}`;
}

export function produceLiveViewHref(token: string): string {
  const hashPath = `/v/${encodeURIComponent(token)}`;
  if (typeof window === 'undefined') return `/#${hashPath}`;
  if (isHalaqmapMensHost(window.location.hostname)) {
    return `https://store.halaqmap.com/#${hashPath}`;
  }
  return `/#${hashPath}`;
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

/** مسار بلا هاش حتى تقرأ واتساب/السوشال وسم البطاقة لا عنوان أقرب حلاق. */
export function occasionCardShareHref(token: string): string {
  const safe = String(token || '').trim();
  return `${STORE_ORIGIN}/oc/${encodeURIComponent(safe)}`;
}
