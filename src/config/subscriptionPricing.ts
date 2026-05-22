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

/** تسمية الإضافة البرمجية المتقدمة — Add-on منفصل عن رخصة الإدراج */
export const DIGITAL_SHIFT_SOFTWARE_ADDON_BADGE_AR = 'إضافة برمجية متقدمة · Software Add-on';

export const DIGITAL_SHIFT_ADDON_VALUE_AR =
  'إضافة «المناوب الرقمي الذكي» تعزّز قيمة الرخصة التقنية للماسية — أتمتة ضيافة الشات والجدولة بذكاء، منفصلة عن حزمة الإدراج الأساسية.';

export const DIGITAL_SHIFT_PRICING_ADDON_LABEL_AR =
  'إضافة برمجية متقدمة: المناوب الرقمي الذكي (+25 ر.س/حزمة رخصة)';

/** خيارات منتج الباقة الماسية — واجهة التسعير */
export const DIAMOND_LICENSE_TECHNICAL_VALUE_AR =
  'أقوى رخصة تقنية للإدراج الجغرافي والتواجد الرقمي على المنصة';

export const DIAMOND_PRODUCT_STANDARD_LABEL_AR = 'الماسية القياسية — رخصة تقنية';
export const DIAMOND_PRODUCT_SMART_LABEL_AR = 'الماسية + إضافة المناوب (Add-on)';
export const DIAMOND_PRODUCT_STANDARD_HINT_AR =
  'رخصة تقنية للإدراج الجغرافي — 200 ر.س/حزمة رخصة';
export const DIAMOND_PRODUCT_SMART_HINT_AR =
  'رخصة ماسية + إضافة برمجية متقدمة — 225 ر.س/حزمة (+25 Add-on)';
export const DIAMOND_ADDON_OPTION_LINE_AR =
  'إضافة برمجية متقدمة اختيارية: المناوب الرقمي الذكي (Add-on) يعزّز قيمة الرخصة التقنية';

/** اسم المنتج — إضافة برمجية */
export const DIGITAL_SHIFT_PRODUCT_NAME_AR = 'المناوب الرقمي الذكي 🌙';

/** بريد/تفعيل — بعد شراء Add-on */
export const DIGITAL_SHIFT_ONBOARDING_ACTIVATED_AR =
  'تم تفعيل إضافة «المناوب الرقمي الذكي» — إضافة برمجية متقدمة (Software Add-on) على رخصتك الماسية التقنية.';

export const DIGITAL_SHIFT_ONBOARDING_HEADLINE_AR = 'أهلًا — إضافة المناوب الرقمي الذكي مفعّلة';

export const DIGITAL_SHIFT_ONBOARDING_SECTION_TITLE_AR =
  '🌙 إضافة برمجية متقدمة — المناوب الرقمي الذكي مفعّل';

export const DIGITAL_SHIFT_ONBOARDING_SECTION_PLAIN_HEADER_AR =
  '—— المناوب الرقمي الذكي (Software Add-on · رخصة ماسية) ——';

/** API / لوحة الحلاق — عند غياب Add-on */
export const DIGITAL_SHIFT_NOT_ENABLED_ERROR_AR =
  'المناوب الذكي غير مفعّل — فعّل إضافة المناوب الرقمي (Add-on +25 ر.س/حزمة) مع رخصة الماسية التقنية';

export const DIGITAL_SHIFT_GATE_LOADING_AR = 'جاري التحقق من صلاحية إضافة المناوب…';

/** فواتير وZATCA — تسميات موحّدة */
export const INVOICE_DIAMOND_LICENSE_LABEL_AR = 'رخصة ماسية تقنية (200 ر.س)';
export const INVOICE_DIAMOND_WITH_ADDON_LABEL_AR = 'رخصة ماسية + Add-on المناوب (225 ر.س)';

export const INVOICE_DIGITAL_SHIFT_ADDON_LINE_AR =
  'إضافة برمجية متقدمة: المناوب الرقمي الذكي (Software Add-on)';

export const ZATCA_PLATFORM_PACKAGES_NOTE_AR =
  'حزم رخصة التواجد الرقمي الجغرافي B2B (برونزي/ذهبي/ماسي + Add-on المناوب البرمجي) — لا عمولة على الحلاقة.';
