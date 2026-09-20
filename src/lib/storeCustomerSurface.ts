/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * نطاق مسارات «صفحات الزبائن» في المتجر — مشترك بين كل حرّاس التباين
 * (الأزرار والنصوص)، حتى يبقى تعريف النطاق في مكان واحد بدل تكراره.
 *
 * الرئيسية (`/`) ومسار الشركاء (`/partners`) انضمّا لهذا النطاق لاحقاً — حُوِّل
 * غلافهما الجذري من الكانفاس الداكن (`platform-dark`) لبيج خريطة الحل الفاتح
 * (`store-light-canvas`) بنفس منطق `StoreVisitorShell`، فوجب تفعيل الحارسين
 * عليهما أيضاً لتصحيح مئات فئات النص الفاتح المتبقية من الثيم الداكن تلقائياً.
 */
import { ROUTE_PATHS } from '@/lib/routePaths';

const STORE_PATH_PREFIX = (ROUTE_PATHS as { STORE_LANDING?: string }).STORE_LANDING || '/store';
const HOME_PATH = (ROUTE_PATHS as { HOME?: string }).HOME || '/';
const BARBERS_LANDING_PATH = (ROUTE_PATHS as { BARBERS_LANDING?: string }).BARBERS_LANDING || '/partners';

/** مسارات المتجر الحية + اللوحات — ليست كلها تحت `/store` (مثل `/b/:token/desk`). */
export function isStoreCustomerSurface(pathname: string): boolean {
  if (pathname === STORE_PATH_PREFIX || pathname.startsWith(`${STORE_PATH_PREFIX}/`)) return true;
  if (pathname.startsWith('/pay/')) return true;
  if (pathname === HOME_PATH) return true;
  if (pathname === BARBERS_LANDING_PATH || pathname.startsWith(`${BARBERS_LANDING_PATH}/`)) return true;
  return /^\/(b|g|r|c|k|v|t|h|e|w|l|oc)(\/|$)/i.test(pathname);
}
