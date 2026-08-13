/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
/**
 * غلاف تطبيق الصالون (PWA / Android TWA) — إعدادات وروابط.
 * الدفع والرخص تُفتح في المتصفح الخارجي حصراً لتجنّب عمولات المتاجر.
 */

/** معرّف حزمة Google Play — تطبيق الشركاء الرسمي */
export const PARTNER_ANDROID_PACKAGE_ID = 'com.halaqmap.partner' as const;

/** رابط متجر Play الرسمي — منشور ومعتمد */
export const PARTNER_ANDROID_PLAY_STORE_URL =
  'https://play.google.com/store/apps/details?id=com.halaqmap.partner' as const;

export const PARTNER_APP_DISPLAY_NAME_AR = 'حلاق ماب — تطبيق الصالون' as const;

export const PARTNER_APP_TAGLINE_AR =
  'التطبيق الرسمي لشركاء حلاق ماب على Google Play: إدارة الصالون والمواعيد والطلبات من مكان واحد.';

/** شرح مختصر يظهر في /partners/app ومسارات الشركاء */
export const PARTNER_APP_ABOUT_AR =
  'تطبيق مخصّص لصاحب الصالون — ليس لتطبيق الزبائن. منه تدخل لوحة التحكم، تتابع الحجوزات وطلبات الخدمة، وتحدّث بيانات الصالون بسهولة على أندرويد.';

export const PARTNER_APP_BULLETS_AR = [
  'إدارة يومية للصالون من الهاتف',
  'متابعة المواعيد وطلبات الخدمة',
  'تحديث بيانات الصالون والخدمات',
  'الدفع والرخص تبقى في المتصفح الآمن — بلا عمولة متاجر',
] as const;

/** مسارات مالية تُفتح دائماً في المتصفح الخارجي من داخل الغلاف (رخص/اشتراكات/دفع) */
export const PARTNER_APP_EXTERNAL_BROWSER_PATHS = [
  '/partners/payment',
  '/payment',
] as const;

export function isPartnerAppFinancialPath(pathname: string): boolean {
  const path = pathname.split('?')[0]?.trim() || '';
  return PARTNER_APP_EXTERNAL_BROWSER_PATHS.some(
    (p) => path === p || path.startsWith(`${p}/`),
  );
}
