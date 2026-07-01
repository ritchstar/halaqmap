import { ROUTE_PATHS } from '@/lib/index';

/** مسارات مسار الشركاء B2B التي تعرض شريط الإعلان */
const BANNER_ROUTE_PREFIXES = [
  ROUTE_PATHS.BARBERS_LANDING,
  ROUTE_PATHS.PARTNERS_B2B_LANDING,
  ROUTE_PATHS.PARTNER_INTEREST,
  ROUTE_PATHS.REGISTER,
  ROUTE_PATHS.REGISTER_SUCCESS,
  ROUTE_PATHS.PAYMENT,
  ROUTE_PATHS.PARTNER_WHY,
  ROUTE_PATHS.PARTNER_STORY,
  ROUTE_PATHS.PARTNER_TUTORIALS,
  ROUTE_PATHS.PARTNER_SALES_OFFICE,
  ROUTE_PATHS.PARTNERS_BANNERS_PREVIEW,
  ROUTE_PATHS.LANDING_PARTNERS_PREVIEW,
  '/for-barbers',
  '/register',
  '/payment',
] as const;

const BANNER_ROUTE_EXCLUDES = [
  ROUTE_PATHS.SHOP_OPEN_STATUS,
  ROUTE_PATHS.SHOP_OPEN_ROTATE,
  ROUTE_PATHS.SHOP_OPEN_ROTATE_CONFIRM,
  ROUTE_PATHS.BARBER_PORTAL_ENTER,
  ROUTE_PATHS.BARBER_DASHBOARD,
] as const;

function normalizePath(pathname: string): string {
  const raw = pathname.replace(/\/+$/, '') || '/';
  return raw.startsWith('/') ? raw : `/${raw}`;
}

export function isPartnerBannerRoute(pathname: string): boolean {
  const path = normalizePath(pathname);
  if (BANNER_ROUTE_EXCLUDES.some((p) => path === p || path.startsWith(`${p}/`))) {
    return false;
  }
  return BANNER_ROUTE_PREFIXES.some((p) => path === p || path.startsWith(`${p}/`));
}
