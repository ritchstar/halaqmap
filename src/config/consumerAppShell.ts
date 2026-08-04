/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * غلاف App Store للمستخدم (iOS Capacitor) — مجاني بلا دفع داخل التطبيق.
 * مسارات الشريك/الدفع/الطاقم تُفتح في Safari خارج الغلاف.
 */

/** معرّف حزمة App Store للمستخدم */
export const CONSUMER_IOS_PACKAGE_ID = 'com.halaqmap.consumer' as const;

export const CONSUMER_APP_DISPLAY_NAME_AR = 'حلاق ماب' as const;

export const CONSUMER_APP_TAGLINE_AR =
  'اكتشف الصالونات القريبة وتواصل للحجز — تجربة المستخدم على آيفون.';

/**
 * رابط App Store — يُملأ بعد النشر.
 * مثال: https://apps.apple.com/app/idXXXXXXXX
 */
export const CONSUMER_IOS_APP_STORE_URL = '' as const;

/** نقطة الدخول الحيّة للغلاف (Live URL) */
export const CONSUMER_APP_LIVE_ORIGIN = 'https://www.halaqmap.com' as const;

/**
 * مسارات تُخرج من غلاف المستخدم إلى Safari.
 * الحجز العام `/book/...` والتقييم والخصوصية تبقى داخل التطبيق.
 */
export const CONSUMER_APP_EXTERNAL_PATH_PREFIXES = [
  '/partners',
  '/barber',
  '/payment',
  '/staff-bookings',
  '/staff-hub',
  '/admin',
  '/for-barbers',
  '/preview-partners',
] as const;

export function isConsumerAppExternalPath(pathname: string): boolean {
  const path = (pathname.split('?')[0] || '').trim() || '/';
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return CONSUMER_APP_EXTERNAL_PATH_PREFIXES.some(
    (prefix) => normalized === prefix || normalized.startsWith(`${prefix}/`),
  );
}
