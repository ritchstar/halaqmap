/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * نطاق مسارات «صفحات الزبائن» في المتجر — مشترك بين كل حرّاس التباين
 * (الأزرار والنصوص)، حتى يبقى تعريف النطاق في مكان واحد بدل تكراره.
 */
import { ROUTE_PATHS } from '@/lib/routePaths';

const STORE_PATH_PREFIX = (ROUTE_PATHS as { STORE_LANDING?: string }).STORE_LANDING || '/store';

/** مسارات المتجر الحية + اللوحات — ليست كلها تحت `/store` (مثل `/b/:token/desk`). */
export function isStoreCustomerSurface(pathname: string): boolean {
  if (pathname === STORE_PATH_PREFIX || pathname.startsWith(`${STORE_PATH_PREFIX}/`)) return true;
  if (pathname.startsWith('/pay/')) return true;
  return /^\/(b|g|r|c|k|v|t|h|e|w|l|oc)(\/|$)/i.test(pathname);
}
