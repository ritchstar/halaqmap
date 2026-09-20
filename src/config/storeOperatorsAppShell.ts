/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * غلاف لوحة مشغّلي منصة خريطة الحل (PWA / Android TWA).
 * لا يُستورد من App.tsx. بلا شراء وبلا أسعار وبلا تجربة في النصوص.
 */

export const STORE_OPERATORS_ANDROID_PACKAGE_ID = 'com.halaqmap.operators' as const;

export const STORE_OPERATORS_TWA_HOST = 'store.halaqmap.com' as const;

export const STORE_OPERATORS_TWA_START = '/store/operators' as const;

export const STORE_OPERATORS_TWA_LAUNCH_PATH = '/#/store/operators' as const;

export const STORE_OPERATORS_WEB_MANIFEST_PATH = '/manifest-operators.json' as const;

export const STORE_OPERATORS_PLAY_STORE_URL =
  'https://play.google.com/store/apps/details?id=com.halaqmap.operators' as const;

/** رابط المشاركة من الويب (حملة web_share). */
export const STORE_OPERATORS_PLAY_STORE_SHARE_URL =
  `${STORE_OPERATORS_PLAY_STORE_URL}&pcampaignid=web_share` as const;

export const STORE_OPERATORS_APP_DISPLAY_NAME_AR = 'لوحة مشغّلي منصة خريطة الحل' as const;

export const STORE_OPERATORS_APP_LAUNCHER_NAME_AR = 'لوحة المشغّلين' as const;

/** الاسم اللاتيني المختصر — يظهر تحت أيقونة التطبيق (iOS/Android) وكـ short_name للـ PWA */
export const STORE_OPERATORS_APP_NAME_LATIN = 'HMOps' as const;
