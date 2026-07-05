import { isPartnerBannerRoute } from '@/config/partnerBannerRoutes';
import { PARTNER_PLATFORM_LAUNCH_BANNER_ENABLED } from '@/config/partnerPlatformLaunchBanner';

/**
 * يُخفى الشريط عند:
 * - `VITE_PARTNER_PLATFORM_INSPECTION_BANNER_DISABLED=true`
 * - تفعيل شريط الإطلاق (Live)
 */
export const PARTNER_PLATFORM_INSPECTION_BANNER_DISABLED =
  import.meta.env.VITE_PARTNER_PLATFORM_INSPECTION_BANNER_DISABLED === 'true' ||
  import.meta.env.VITE_PARTNER_PLATFORM_INSPECTION_BANNER_ENABLED === 'false' ||
  PARTNER_PLATFORM_LAUNCH_BANNER_ENABLED;

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
