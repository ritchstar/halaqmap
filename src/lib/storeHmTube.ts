/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * مواضع أيقونة مشاهدة المتجر: الرئيسية وصفحات المنتجات فقط.
 */
import { ROUTE_PATHS } from '@/lib/routePaths';

const PRODUCT_LANDING_ROOTS = [
  ROUTE_PATHS.STORE_GROCERS,
  ROUTE_PATHS.STORE_PRODUCE,
  ROUTE_PATHS.STORE_RESTAURANT,
  ROUTE_PATHS.STORE_CAFE,
  ROUTE_PATHS.STORE_KITCHEN,
  ROUTE_PATHS.STORE_WEDDING,
  ROUTE_PATHS.STORE_EVENT,
  ROUTE_PATHS.STORE_LOUNGE,
  ROUTE_PATHS.STORE_INVITES,
] as const;

export function normalizeStorePath(pathname: string): string {
  const path = pathname.split('?')[0].replace(/\/+$/, '');
  return path || '/';
}

export function isStoreHomePath(pathname: string): boolean {
  return normalizeStorePath(pathname) === ROUTE_PATHS.STORE_LANDING;
}

export function isStoreProductLandingPath(pathname: string): boolean {
  const path = normalizeStorePath(pathname);
  if (path === ROUTE_PATHS.STORE_KITCHEN_GIFT || path.startsWith(`${ROUTE_PATHS.STORE_KITCHEN_GIFT}/`)) {
    return false;
  }
  if (path === ROUTE_PATHS.STORE_GENERAL_TRIAL || path.startsWith(`${ROUTE_PATHS.STORE_GENERAL_TRIAL}/`)) {
    return false;
  }
  return PRODUCT_LANDING_ROOTS.some((root) => path === root || path.startsWith(`${root}/`));
}

export function showStoreHmTubeMark(pathname: string): boolean {
  return isStoreHomePath(pathname) || isStoreProductLandingPath(pathname);
}
