import { isPartnerBannerRoute } from '@/config/partnerBannerRoutes';

/**
 * شريط الإطلاق — يُعرض بعد جاهزية Live بدلاً من «فحص شامل قبل الإطلاق».
 * يُخفى عند `VITE_PARTNER_PLATFORM_LAUNCH_BANNER_ENABLED=false`.
 */
export const PARTNER_PLATFORM_LAUNCH_BANNER_ENABLED =
  import.meta.env.VITE_PARTNER_PLATFORM_LAUNCH_BANNER_ENABLED !== 'false';

export const PARTNER_PLATFORM_LAUNCH_MARQUEE_SEGMENTS = [
  'بدأنا تشغيل المنصة — نستقبل الآن طلبات تسجيل الصالونات والحلاقين',
  'رخصة النفاذ الرقمية · دفع آمن عبر ميسر · تفعيل فوري بعد إتمام الدفع',
  'جهّز بيانات صالونك وصور الواجهة — التسجيل يستغرق دقائق فقط',
  'حلاق ماب · مسار الشركاء',
] as const;

export function shouldShowPartnerPlatformLaunchBanner(pathname: string): boolean {
  if (!PARTNER_PLATFORM_LAUNCH_BANNER_ENABLED) return false;
  return isPartnerBannerRoute(pathname);
}
