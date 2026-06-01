import { getAdminPortalBasePaths } from '@/config/adminAuth';
import { LEGACY_PARTNER_ROUTE_PATHS, ROUTE_PATHS } from '@/lib';

export const LAB_CLONE_BASE_PATH = ROUTE_PATHS.ROO_LANDING_LAB;
const LAB_UNAVAILABLE_SEGMENT = 'unavailable';

const STATIC_LAB_CLONE_PATHS = new Set<string>([
  ROUTE_PATHS.HOME,
  ROUTE_PATHS.ABOUT,
  ROUTE_PATHS.TERMS_OF_SERVICE,
  ROUTE_PATHS.USER_PRIVACY_POLICY,
  ROUTE_PATHS.PRIVACY_DETAILED,
  ROUTE_PATHS.PRIVACY,
  ROUTE_PATHS.PLATFORM_REVIEWS,
  ROUTE_PATHS.LANDING_PREVIEW,
  ROUTE_PATHS.LANDING_PARTNERS_PREVIEW,
  ROUTE_PATHS.COSMIC_SHOWCASE,
  ROUTE_PATHS.SAUDI_AGENT,
  ROUTE_PATHS.RADAR_SHOWCASE,
  ROUTE_PATHS.BARBERS_LANDING,
  ROUTE_PATHS.PARTNER_INTEREST,
  ROUTE_PATHS.PARTNER_WHY,
  ROUTE_PATHS.PARTNER_STORY,
  ROUTE_PATHS.REGISTER,
  ROUTE_PATHS.REGISTER_SUCCESS,
  ROUTE_PATHS.SHOP_OPEN_STATUS,
  ROUTE_PATHS.PARTNER_PRIVACY,
  ROUTE_PATHS.SUBSCRIPTION_POLICY,
  ROUTE_PATHS.BARBER_LOGIN,
  ROUTE_PATHS.BARBER_PORTAL_ENTER,
  ROUTE_PATHS.PAYMENT,
  ROUTE_PATHS.PARTNER_TUTORIALS,
  ROUTE_PATHS.MAP_COMMUNITY,
  ROUTE_PATHS.PARTNER_SUPPORT,
  ROUTE_PATHS.BARBER_DASHBOARD,
  ROUTE_PATHS.BARBER_ACCOUNT_DELETE_REQUEST,
  ROUTE_PATHS.HOSPITALITY_B2B_REQUEST,
  ROUTE_PATHS.DIGITAL_SHIFT_FEATURE,
  ROUTE_PATHS.PRIVATE_OFFICE_GUIDE,
  LEGACY_PARTNER_ROUTE_PATHS.BARBERS_LANDING,
  LEGACY_PARTNER_ROUTE_PATHS.REGISTER,
  LEGACY_PARTNER_ROUTE_PATHS.REGISTER_SUCCESS,
  LEGACY_PARTNER_ROUTE_PATHS.SUBSCRIPTION_POLICY,
  LEGACY_PARTNER_ROUTE_PATHS.BARBER_LOGIN,
  LEGACY_PARTNER_ROUTE_PATHS.PAYMENT,
  '/admin/in',
  '/admin/ctrl',
  '/admin/sentinel',
  '/admin/radar/full-screen',
  '/admin/cyber',
  '/admin/staff-hub',
  '/admin',
]);

function normalizePathname(pathname: string): string {
  if (!pathname || pathname === '/') return '/';
  const withSlash = pathname.startsWith('/') ? pathname : `/${pathname}`;
  return withSlash.replace(/\/+$/, '') || '/';
}

function toLabSubPath(pathname: string): string {
  if (pathname === '/') return '/';
  return pathname.startsWith('/') ? pathname : `/${pathname}`;
}

export function isLabClonePath(pathname: string): boolean {
  const normalized = normalizePathname(pathname);
  return normalized === LAB_CLONE_BASE_PATH || normalized.startsWith(`${LAB_CLONE_BASE_PATH}/`);
}

export function toCanonicalFromLabPath(pathname: string): string {
  const normalized = normalizePathname(pathname);
  if (!isLabClonePath(normalized)) return normalized;
  if (normalized === LAB_CLONE_BASE_PATH) return '/';
  const suffix = normalized.slice(LAB_CLONE_BASE_PATH.length);
  return normalizePathname(suffix);
}

export function toLabClonePath(pathname: string): string {
  const normalized = normalizePathname(pathname);
  if (normalized === '/') return LAB_CLONE_BASE_PATH;
  if (normalized.startsWith(`${LAB_CLONE_BASE_PATH}/`)) return normalized;
  if (normalized === LAB_CLONE_BASE_PATH) return LAB_CLONE_BASE_PATH;
  return `${LAB_CLONE_BASE_PATH}${toLabSubPath(normalized)}`;
}

export function toLabUnavailablePath(targetPathname: string): string {
  const params = new URLSearchParams();
  params.set('target', targetPathname);
  return `${LAB_CLONE_BASE_PATH}/${LAB_UNAVAILABLE_SEGMENT}?${params.toString()}`;
}

function isAdminPortalPath(pathname: string): boolean {
  return getAdminPortalBasePaths().some(
    (adminBase) => pathname === `${adminBase}/in`
      || pathname === `${adminBase}/ctrl`
      || pathname === `${adminBase}/sentinel`
      || pathname === `${adminBase}/radar/full-screen`
      || pathname === `${adminBase}/cyber`
      || pathname === `${adminBase}/staff-hub`,
  );
}

export function isLabCloneSupportedPath(pathname: string): boolean {
  const normalized = normalizePathname(pathname);
  if (normalized === `${LAB_CLONE_BASE_PATH}/${LAB_UNAVAILABLE_SEGMENT}`) return true;
  if (STATIC_LAB_CLONE_PATHS.has(normalized)) return true;
  if (isAdminPortalPath(normalized)) return true;
  return false;
}

export function resolveLabPathOrFallback(pathname: string): string {
  const canonical = toCanonicalFromLabPath(pathname);
  if (isLabCloneSupportedPath(canonical)) return toLabClonePath(canonical);
  return toLabUnavailablePath(canonical);
}
