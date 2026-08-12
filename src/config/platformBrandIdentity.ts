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
export const PLATFORM_BRAND_ICON_VERSION = '20260811' as const;

/** أبرز عبارات بحث لصفحات فزعة في الواجهة — مرتّبة حسب CTR في Search Console ثم Ads */
export const PLATFORM_NEAR_SEARCH_PHRASES_AR = [
  'اقرب حلاق',
  'حلاق قريب',
  'حلاق قريب مني',
  'حلاق قريب من موقعي',
  'حلاق منزلي الرياض',
  'حلاق اطفال قريب من موقعي',
  'حلاق اطفال الرياض',
  'حلاق اطفال الملقا',
  'حلاق اطفال متنقل الرياض',
  'حلاق رجال',
  'أفضل حلاق بالرياض',
  'أبي حلاق قريب',
  'عطني اقرب حلاق',
  'شف لي حلاق منزلي',
  'اقرب حلاق مفتوح من موقعي',
  'حلاق يجي البيت',
  'barber near me',
] as const;

export const PLATFORM_NEAR_SEARCH_BLURB_AR =
  'أبي أو عطني أو شف لي: اقرب حلاق، حلاق قريب، حلاق منزلي الرياض، حلاق اطفال قريب من موقعي، أو أفضل حلاق بالرياض — ابدأ فزعة الاستعلام من حلاق ماب.';

export function platformBrandIconUrl(path: string, origin = 'https://www.halaqmap.com'): string {
  const base = origin.replace(/\/+$/, '');
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${base}${p}?v=${PLATFORM_BRAND_ICON_VERSION}`;
}
