/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * هوية العلامة الظاهرة في المتصفح، المشاركة، وبيانات المنظمة لمحركات البحث.
 * ملاحظة: خط نتائج Google نفسه لا يُخصَّص من الموقع — الأيقونة + الاسم + الوصف هم ما يظهر.
 */
export const PLATFORM_BRAND_NAME_AR = 'حلاق ماب' as const;
export const PLATFORM_BRAND_NAME_EN = 'HALAQ MAP' as const;
/** اسم الموقع في og:site_name وبيانات المنظّمة */
export const PLATFORM_BRAND_SITE_NAME = 'حلاق ماب | HALAQ MAP' as const;
/** الشعار الرسمي الحالي (يُستخدم في الواجهة والأيقونات) */
export const PLATFORM_BRAND_LOGO_PATH = '/images/halaqmap_logo_20260409_073322.png' as const;
export const PLATFORM_BRAND_LOGO_ABSOLUTE =
  'https://www.halaqmap.com/images/halaqmap_logo_20260409_073322.png' as const;
/** كسر كاش الأيقونة عند التحديث (Google يعيد جلب الـ favicon ببطء) */
export const PLATFORM_BRAND_ICON_VERSION = '20260808' as const;

export function platformBrandIconUrl(path: string, origin = 'https://www.halaqmap.com'): string {
  const base = origin.replace(/\/+$/, '');
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${base}${p}?v=${PLATFORM_BRAND_ICON_VERSION}`;
}
