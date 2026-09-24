/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * الصور الجامعة الموجودة فعلياً في public/images/store/benefit.
 * صورة «منتج مصمم للمهنة» وصورة «رابط وQR» وصور المنتجات الأربع عشرة
 * لم تُسلَّم مع هذا الربط، فلا مفاتيح لها هنا.
 * صورة الرمز لا تُعرض إلا مع hasQrShare، ولا ملف لها بعد.
 */
export const STORE_BENEFIT_ILLUSTRATIONS = {
  operatorLeads: {
    src: '/images/store/benefit/hm_benefit_operator_leads.webp',
    altAr: 'أنت قائد المنتج',
  },
  privateDestination: {
    src: '/images/store/benefit/hm_benefit_private_destination.webp',
    altAr: 'صفحة خاصة بنشاطك',
  },
  directCustomerPath: {
    src: '/images/store/benefit/hm_benefit_direct_customer_path.webp',
    altAr: 'طريق مباشر بين النشاط والعميل',
  },
  clearDiscovery: {
    src: '/images/store/benefit/hm_benefit_clear_discovery.webp',
    altAr: 'اكتشاف أوضح',
  },
  operatingTools: {
    src: '/images/store/benefit/hm_benefit_operating_tools.webp',
    altAr: 'أدوات تشغيل مرتبطة بالمنتج',
  },
} as const;

export type StoreBenefitIllustrationId = keyof typeof STORE_BENEFIT_ILLUSTRATIONS;

/** لا مصدر لصورة الرمز حتى يُسلَّم الملف، وحتى حينئذ لا تُعرض بلا hasQrShare. */
export function benefitQrIllustrationSrc(hasQrShare: boolean): string | null {
  if (!hasQrShare) return null;
  return null;
}
