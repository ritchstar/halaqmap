import {
  isPartnerOrderReceptionBannerRoute,
  PARTNER_ORDER_RECEPTION_BANNER_ENABLED,
} from '@/config/partnerOrderReceptionAnnouncement';

/** شريط «فحص شامل قبل الإطلاق» — يُعطّل عبر `VITE_PARTNER_PLATFORM_INSPECTION_BANNER_ENABLED=false` */
export const PARTNER_PLATFORM_INSPECTION_BANNER_ENABLED =
  import.meta.env.VITE_PARTNER_PLATFORM_INSPECTION_BANNER_ENABLED !== 'false';

export const PARTNER_PLATFORM_INSPECTION_MARQUEE_SEGMENTS = [
  'نعمل على فحص شامل لخدمات المنصة قبل الإطلاق — لضمان سلامة كل ما وعدناكم به. انتظرونا قريباً',
  'شكراً لصبركم وتفهّمكم — نُكمل التحقق التقني لضمان تجربة آمنة لجميع الشركاء',
  'حلاق ماب · مسار الشركاء',
] as const;

export function shouldShowPartnerPlatformInspectionBanner(pathname: string): boolean {
  if (!PARTNER_PLATFORM_INSPECTION_BANNER_ENABLED) return false;
  return isPartnerOrderReceptionBannerRoute(pathname);
}

/** يُخفى شريط العدّ التنازلي القديم عند تفعيل شريط الفحص */
export function partnerOrderReceptionBannerSupersededByInspection(): boolean {
  return PARTNER_PLATFORM_INSPECTION_BANNER_ENABLED && PARTNER_ORDER_RECEPTION_BANNER_ENABLED;
}
