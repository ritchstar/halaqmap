import { ROUTE_PATHS } from '@/lib';

/** Query flag for read-only owner watch mode on the barber dashboard */
export const BARBER_OWNER_WATCH_VIEW = 'watch';

export function barberOwnerWatchHashPath(): string {
  return `${ROUTE_PATHS.BARBER_DASHBOARD}?view=${BARBER_OWNER_WATCH_VIEW}`;
}

export function barberOwnerWatchLoginHashPath(): string {
  const next = encodeURIComponent(barberOwnerWatchHashPath());
  return `${ROUTE_PATHS.BARBER_LOGIN}?next=${next}`;
}

/** Full page URL for bookmarking after the owner is logged in */
export function buildBarberOwnerWatchPageUrl(siteOrigin?: string): string {
  const hashPath = barberOwnerWatchHashPath();
  if (typeof window !== 'undefined') {
    const base = window.location.href.split('#')[0];
    return `${base}#${hashPath}`;
  }
  const base = String(siteOrigin || '').trim().replace(/\/+$/, '');
  return base ? `${base}/#${hashPath}` : `#${hashPath}`;
}
