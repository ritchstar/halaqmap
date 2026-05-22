import { SubscriptionTier } from '@/lib/index';

/**
 * تسمية وحدة المنتج — تظهر في بطاقات التسعير والتسجيل.
 * التسمية الرسمية المعتمدة: «حزمة رخصة» (Software Licence Package).
 */
export const SOFTWARE_PACKAGE_UNIT_LABEL_AR = 'حزمة رخصة';

/**
 * الاسم الرسمي الموحّد للمنتج B2B (مفرد).
 * يُستخدم في عناوين البطاقات والأقسام والمستندات الرسمية.
 *
 * التسمية المعتمدة (2026): «حزمة رخصة التواجد الرقمي الجغرافي على منصة حلاق ماب».
 * تؤكّد أن المنتج هو رخصة برمجية لتفعيل التواجد الرقمي الجغرافي للحلّاق على المنصة،
 * وليس عمولة على خدمة أو وساطة تجارية.
 */
export const SOFTWARE_PACKAGE_GEO_PRESENCE_TITLE_AR =
  'حزمة رخصة التواجد الرقمي الجغرافي على منصة حلاق ماب';

/**
 * الاسم الرسمي الموحّد للمنتج B2B (جمع) — يُستخدم في الفقرات والوصف.
 */
export const SOFTWARE_PACKAGE_GEO_PRESENCE_TITLE_PLURAL_AR =
  'حزم رخصة التواجد الرقمي الجغرافي على منصة حلاق ماب';

/**
 * الأساس التقني الرسمي الذي تُبنى عليه الحزم — تسمية موحّدة معتمدة.
 * تحلّ محل أي ذكر سابق لـ"السيادة الرقمية" في وصف منتج الإدراج.
 */
export const SOFTWARE_PACKAGE_FOUNDATION_LABEL_AR =
  'نظام الرصد الذكي والادراج الرقمي';

/**
 * فقرة الوصف الرسمية الكاملة — مصدر الحقيقة الوحيد، تستوردها كل واجهة تعرضها.
 * أي تعديل لاحق يحدث هنا فقط.
 */
export const SOFTWARE_PACKAGE_GEO_PRESENCE_TAGLINE_AR =
  'حزم رخصة التواجد الرقمي الجغرافي على منصة حلاق ماب مبنية على نظام الرصد الذكي والادراج الرقمي. اختر المستوى وعدد البطاقات (كل بطاقة = 30 يوم إدراج).';

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
export const DIAMOND_PRODUCT_STANDARD_HINT_AR = 'حزمة رخصة ماسية للإدراج — 200 ر.س/شهرياً';
export const DIAMOND_PRODUCT_SMART_HINT_AR =
  'شامل المناوب الرقمي الذكي — 225 ر.س/شهرياً (+25 ر.س مدمجة)';
