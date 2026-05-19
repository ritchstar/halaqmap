import { SubscriptionTier } from '@/lib/index';

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
export const DIAMOND_PRODUCT_STANDARD_HINT_AR = 'ترخيص إدراج ماسي — 200 ر.س/شهرياً';
export const DIAMOND_PRODUCT_SMART_HINT_AR =
  'شامل المناوب الرقمي الذكي — 225 ر.س/شهرياً (+25 ر.س مدمجة)';
