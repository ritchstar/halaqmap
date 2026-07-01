import { isPartnerBannerRoute } from '@/config/partnerBannerRoutes';

/**
 * يُخفى الشريط فقط عند `VITE_PARTNER_PLATFORM_INSPECTION_BANNER_DISABLED=true`
 * (لا تستخدم ENABLED=false — كان يسبب لبساً ويُدمَج في البناء).
 */
export const PARTNER_PLATFORM_INSPECTION_BANNER_DISABLED =
  import.meta.env.VITE_PARTNER_PLATFORM_INSPECTION_BANNER_DISABLED === 'true' ||
  import.meta.env.VITE_PARTNER_PLATFORM_INSPECTION_BANNER_ENABLED === 'false';

export const PARTNER_PLATFORM_INSPECTION_BANNER_ENABLED = !PARTNER_PLATFORM_INSPECTION_BANNER_DISABLED;

export const PARTNER_PLATFORM_INSPECTION_MARQUEE_SEGMENTS = [
  'نعمل على فحص شامل لخدمات المنصة قبل الإطلاق — لضمان سلامة كل ما وعدناكم به. انتظرونا قريباً',
  'شكراً لصبركم وتفهّمكم — نُكمل التحقق التقني لضمان تجربة آمنة لجميع الشركاء',
  'حلاق ماب · مسار الشركاء',
] as const;

export function shouldShowPartnerPlatformInspectionBanner(pathname: string): boolean {
  if (PARTNER_PLATFORM_INSPECTION_BANNER_DISABLED) return false;
  return isPartnerBannerRoute(pathname);
}
