/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * غلاف تطبيق لوحة مشغّلي خريطة الحل — ثوابت مستقلة عن غلاف المستخدم.
 * لا يُستورد من `consumerAppShell` ولا منه، حتى لا تتقاطع الحزمتان.
 */

/** معرّف الحزمة على App Store وGoogle Play */
export const OPERATORS_APP_PACKAGE_ID = 'com.halaqmap.operators' as const;

/** معرّف فريق Apple للتوقيع */
export const OPERATORS_APPLE_TEAM_ID = '682KF3CDQM' as const;

/** الاسم الظاهر في متجري التطبيقات */
export const OPERATORS_APP_DISPLAY_NAME_AR = 'لوحة مشغّلي خريطة الحل' as const;

/** الاسم المختصر تحت الأيقونة */
export const OPERATORS_APP_LAUNCHER_NAME_AR = 'لوحة المشغّلين' as const;

/** نقطة الدخول الحيّة للغلاف */
export const OPERATORS_APP_LIVE_ORIGIN = 'https://store.halaqmap.com' as const;

/** مسار اللوحة داخل الموقع */
export const OPERATORS_APP_START_PATH = '/#/store/operators' as const;

/** الرابط الكامل الذي يفتحه الغلاف عند الإقلاع */
export const OPERATORS_APP_LIVE_URL =
  `${OPERATORS_APP_LIVE_ORIGIN}${OPERATORS_APP_START_PATH}` as const;

/** ألوان الهوية المعتمدة في غلافي أندرويد وآيفون */
export const OPERATORS_APP_THEME_COLOR = '#e8c547' as const;
export const OPERATORS_APP_BACKGROUND_COLOR = '#061018' as const;

/** النطاقات المسموح للغلاف بفتحها داخلياً */
export const OPERATORS_APP_ALLOWED_HOSTS = [
  'store.halaqmap.com',
  'www.halaqmap.com',
  'halaqmap.com',
] as const;
