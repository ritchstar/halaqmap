import { ROUTE_PATHS } from '@/lib';

function normalizeHashPath(path: string): string {
  if (!path || path === '/') return '/';
  return path.startsWith('/') ? path : `/${path}`;
}

export function getLabProductionOrigin(): string {
  const raw = (import.meta.env.VITE_LAB_PRODUCTION_ORIGIN as string | undefined)?.trim();
  if (raw) return raw.replace(/\/+$/, '');
  return 'https://www.halaqmap.com';
}

export function buildLabProductionUrl(path: string): string {
  const origin = getLabProductionOrigin();
  const hashPath = normalizeHashPath(path);
  return `${origin}/#${hashPath}`;
}

export function buildLabCommunityUrl(): string {
  return 'https://community.nota-council.com/#/partners/community';
}

export function isLabHomePath(pathname: string): boolean {
  return pathname === '/' || pathname === ROUTE_PATHS.ROO_LANDING_LAB;
}
