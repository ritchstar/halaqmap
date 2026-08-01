/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
/**
 * غلاف تطبيق الصالون (PWA / Android TWA) — إعدادات وروابط.
 * الدفع والرخص تُفتح في المتصفح الخارجي حصراً لتجنّب عمولات المتاجر.
 */

/** معرّف حزمة Google Play — يُحدَّث عند نشر الغلاف */
export const PARTNER_ANDROID_PACKAGE_ID = 'com.halaqmap.partner' as const;

/**
 * رابط متجر Play — يبقى فارغاً حتى النشر الرسمي.
 * عند التوفّر: https://play.google.com/store/apps/details?id=com.halaqmap.partner
 */
export const PARTNER_ANDROID_PLAY_STORE_URL = '' as const;

export const PARTNER_APP_DISPLAY_NAME_AR = 'حلاق ماب — تطبيق الصالون' as const;

export const PARTNER_APP_TAGLINE_AR =
  'دخول سريع للوحة التحكم وإشعارات فورية — مثبت من المتصفح أو من Google Play.';

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
