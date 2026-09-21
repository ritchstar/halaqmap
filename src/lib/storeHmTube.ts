/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * مواضع أيقونة مشاهدة المتجر: الرئيسية وصفحات المنتجات فقط.
 */
import { ROUTE_PATHS } from '@/lib/routePaths';
import type { StoreGeneralTrialKey } from '@/config/storeProductTrial';

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
  ROUTE_PATHS.STORE_DATES,
  ROUTE_PATHS.STORE_HALANA,
  ROUTE_PATHS.STORE_BAKHURNA,
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

/** جذر كل صفحة هبوط منتج ↔ مفتاحه في نظام التجربة العامة (storeProductTrial.ts). */
const TRIAL_LANDING_ROOT_KEYS: Record<string, StoreGeneralTrialKey> = {
  [ROUTE_PATHS.STORE_LOUNGE]: 'lounge',
  [ROUTE_PATHS.STORE_GROCERS]: 'grocers',
  [ROUTE_PATHS.STORE_RESTAURANT]: 'restaurant',
  [ROUTE_PATHS.STORE_CAFE]: 'cafe',
  [ROUTE_PATHS.STORE_KITCHEN]: 'kitchen',
  [ROUTE_PATHS.STORE_PRODUCE]: 'produce',
  [ROUTE_PATHS.STORE_HALANA]: 'halana',
  [ROUTE_PATHS.STORE_DATES]: 'dates',
  [ROUTE_PATHS.STORE_BAKHURNA]: 'bakhurna',
};

/** صفحات إهداء فرعية لا تخص التجربة العامة، رغم وقوعها تحت جذر منتج مؤهَّل. */
const TRIAL_EXCLUDED_SUBPATHS = [ROUTE_PATHS.STORE_KITCHEN_GIFT, ROUTE_PATHS.STORE_BAKHURNA_GIFT];

/** يُعيد مفتاح التجربة العامة لصفحة هبوط المنتج الحالية، أو null إن لم تكن مؤهَّلة. */
export function storeTrialLandingKeyForPath(pathname: string): StoreGeneralTrialKey | null {
  const path = normalizeStorePath(pathname);
  if (TRIAL_EXCLUDED_SUBPATHS.some((prefix) => path === prefix || path.startsWith(`${prefix}/`))) {
    return null;
  }
  for (const [root, key] of Object.entries(TRIAL_LANDING_ROOT_KEYS)) {
    if (path === root || path.startsWith(`${root}/`)) return key;
  }
  return null;
}
