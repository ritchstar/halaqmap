import { SubscriptionTier } from '@/lib/index';

/** تسمية وحدة المنتج — تظهر في بطاقات التسعير والتسجيل */
export const SOFTWARE_PACKAGE_UNIT_LABEL_AR = 'حزمة برمجية';

/** اسم المنتج الموحّد B2B */
export const SOFTWARE_PACKAGE_GEO_PRESENCE_TITLE_AR = 'حزمة برمجية للتواجد الجغرافي';

/** شارة مدة البطاقة (30 يوم إدراج) */
export const SOFTWARE_PACKAGE_VALIDITY_LABEL_AR = `${SOFTWARE_PACKAGE_UNIT_LABEL_AR} · 30 يوم`;

/** أسعار البطاقة الواحدة (30 يوم إدراج) بالريال السعودي */
export const TIER_MONTHLY_SAR: Record<SubscriptionTier, number> = {
  [SubscriptionTier.BRONZE]: 100,
  [SubscriptionTier.GOLD]: 150,
  [SubscriptionTier.DIAMOND]: 200,
};

/** إضافة المناوب الرقمي الذكي — للباقة الماسية فقط (لكل بطاقة 30 يوم) */
export const DIGITAL_SHIFT_MONTHLY_ADDON_SAR = 25;

export const DIGITAL_SHIFT_PRICING_ADDON_LABEL_AR =
  'إضافة المناوب الرقمي الذكي (+25 ر.س/شهرياً)';

/** خيارات منتج الباقة الماسية — واجهة التسعير */
export const DIAMOND_PRODUCT_STANDARD_LABEL_AR = 'الماسية القياسية';
export const DIAMOND_PRODUCT_SMART_LABEL_AR = 'الماسية الذكية';
export const DIAMOND_PRODUCT_STANDARD_HINT_AR = 'حزمة إدراج ماسية برمجية — 200 ر.س/شهرياً';
export const DIAMOND_PRODUCT_SMART_HINT_AR =
  'شامل المناوب الرقمي الذكي — 225 ر.س/شهرياً (+25 ر.س مدمجة)';
