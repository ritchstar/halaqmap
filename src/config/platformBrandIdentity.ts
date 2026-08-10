/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * هوية العلامة الظاهرة في المتصفح، المشاركة، وبيانات المنظمة لمحركات البحث.
 * ملاحظة: خط نتائج Google نفسه لا يُخصَّص من الموقع — الأيقونة + الاسم + الوصف هم ما يظهر.
 * صفحات البحث الجغرافية/النوايا تُسمّى خدمة «فزعة» أمام الزائر.
 */
export const PLATFORM_BRAND_NAME_AR = 'حلاق ماب' as const;
export const PLATFORM_BRAND_NAME_EN = 'HALAQ MAP' as const;
/** اسم الموقع في og:site_name وبيانات المنظّمة */
export const PLATFORM_BRAND_SITE_NAME = 'حلاق ماب | HALAQ MAP' as const;
/** اسم خدمة صفحات البحث (مدن/أحياء/نوايا/مناسبات) */
export const PLATFORM_FAZAA_NAME_AR = 'فزعة' as const;
export const PLATFORM_FAZAA_SERVICE_LINE = 'خدمة بحث سريعة من حلاق ماب' as const;
/** الشعار الرسمي الحالي (refined — يُستخدم في الواجهة والأيقونات) */
export const PLATFORM_BRAND_LOGO_PATH = '/images/halaqmap_logo_refined.png' as const;
export const PLATFORM_BRAND_LOGO_ABSOLUTE =
  'https://www.halaqmap.com/images/halaqmap_logo_refined.png' as const;
/** كسر كاش الأيقونة عند التحديث (Google/المتصفح يعيدان جلب الـ favicon ببطء) */
export const PLATFORM_BRAND_ICON_VERSION = '20260810' as const;

/** أبرز عبارات بحث لصفحات فزعة في الواجهة */
export const PLATFORM_NEAR_SEARCH_PHRASES_AR = [
  'أقرب حلاق من موقعي',
  'أبي حلاق قريب',
  'صالون قريب',
  'أقرب صالون حولي',
  'حلاق دليفري',
  'barber delivery',
  'حلاق متنقل',
  'حلاق يجيك لبيتك',
  'حلاق أطفال منزلي',
  'عطني أقرب صالون من موقعي',
  'رقم حلاق حولي',
] as const;

export const PLATFORM_NEAR_SEARCH_BLURB_AR =
  'أقرب حلاق من موقعك، صالون قريب، حلاق دليفري أو متنقل يجيك البيت، حلاق أطفال منزلي — ابدأ فزعة الاستعلام من حلاق ماب.';

export function platformBrandIconUrl(path: string, origin = 'https://www.halaqmap.com'): string {
  const base = origin.replace(/\/+$/, '');
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${base}${p}?v=${PLATFORM_BRAND_ICON_VERSION}`;
}
