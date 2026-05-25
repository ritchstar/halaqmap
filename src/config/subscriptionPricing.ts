import { SubscriptionTier } from '@/lib/index';
import {
  ON_DEMAND_VISIBILITY_FUNCTIONAL_DESCRIPTION_AR,
  ON_DEMAND_VISIBILITY_PRODUCT_NAME_AR,
  ON_DEMAND_VISIBILITY_TAGLINE_SHORT_AR,
  SMART_RESPONSE_SYSTEM_LABEL_AR,
} from '@/config/onDemandVisibilityDoctrine';

/**
 * تسمية وحدة المنتج — تظهر في بطاقات التسعير والتسجيل.
 * التسمية الرسمية المعتمدة: «حزمة رخصة» (Software Licence Package).
 */
export const SOFTWARE_PACKAGE_UNIT_LABEL_AR = 'حزمة رخصة';

/**
 * الاسم الرسمي الموحّد للمنتج B2B (مفرد).
 * يُستخدم في عناوين البطاقات والأقسام والمستندات الرسمية.
 *
 * التسمية المعتمدة (2026-05-23): «رخصة نفاذ حلاق ماب الرقمية (نظام الاستجابة الذكية)».
 * تؤكّد أن المنتج هو رخصة برمجية بحضور غير ثابت يُفعَّل عند الطلب،
 * وليس وساطة تجارية أو إشغالاً دائماً للمساحة الرقمية.
 */
export const SOFTWARE_PACKAGE_GEO_PRESENCE_TITLE_AR =
  ON_DEMAND_VISIBILITY_PRODUCT_NAME_AR;

/**
 * الاسم الرسمي الموحّد للمنتج B2B (جمع) — يُستخدم في الفقرات والوصف.
 */
export const SOFTWARE_PACKAGE_GEO_PRESENCE_TITLE_PLURAL_AR =
  'حزم رخصة نفاذ حلاق ماب الرقمية (نظام الاستجابة الذكية)';

/**
 * الأساس التقني الرسمي الذي تُبنى عليه الحزم — تسمية موحّدة معتمدة.
 * تحلّ محل أي ذكر سابق لـ«السيادة الرقمية» أو «نظام الرصد الذكي والإدراج الرقمي»
 * في وصف منتج الرخصة.
 */
export const SOFTWARE_PACKAGE_FOUNDATION_LABEL_AR =
  `${SMART_RESPONSE_SYSTEM_LABEL_AR} (الظهور عند الطلب · On-Demand Visibility)`;

/**
 * فقرة الوصف الرسمية الكاملة — مصدر الحقيقة الوحيد، تستوردها كل واجهة تعرضها.
 * أي تعديل لاحق يحدث في `onDemandVisibilityDoctrine.ts` فقط.
 */
export const SOFTWARE_PACKAGE_GEO_PRESENCE_TAGLINE_AR =
  `${ON_DEMAND_VISIBILITY_FUNCTIONAL_DESCRIPTION_AR} اختر المستوى وعدد الحزم (كل حزمة = 30 يوم نفاذ).`;

/** سطر تسويقي قصير — للهيرو والشارات. */
export const SOFTWARE_PACKAGE_SHORT_TAGLINE_AR = ON_DEMAND_VISIBILITY_TAGLINE_SHORT_AR;

/** شارة مدة البطاقة (30 يوم إدراج) */
export const SOFTWARE_PACKAGE_VALIDITY_LABEL_AR = `${SOFTWARE_PACKAGE_UNIT_LABEL_AR} · 30 يوم`;

/** أسعار البطاقة الواحدة (30 يوم إدراج) بالريال السعودي */
export const TIER_MONTHLY_SAR: Record<SubscriptionTier, number> = {
  [SubscriptionTier.BRONZE]: 100,
  [SubscriptionTier.GOLD]: 150,
  [SubscriptionTier.DIAMOND]: 200,
};

/** إضافة المكتب الخاص — للباقة الماسية فقط (لكل بطاقة 30 يوم) */
export const DIGITAL_SHIFT_MONTHLY_ADDON_SAR = 25;

/** تسمية الإضافة البرمجية المتقدمة — Add-on منفصل عن رخصة الإدراج */
export const DIGITAL_SHIFT_SOFTWARE_ADDON_BADGE_AR = 'إضافة المكتب الخاص · Software Add-on';

export const DIGITAL_SHIFT_ADDON_VALUE_AR =
  'إضافة «المكتب الخاص» تمنح رخصتك الماسية قدرتين متصلتين: مساعد داخلي في لوحة تحكمك يستقبل تعليماتك ويُقدّم لك التقارير، ومناوب على الشات يُنفّذ تعليماتك أمام الزبائن ويرسل لك ما يستقبله.';

export const DIGITAL_SHIFT_PRICING_ADDON_LABEL_AR =
  'إضافة المكتب الخاص (+25 ر.س/حزمة): مساعد داخلي + مناوب شات مترابطان';

/** خيارات منتج الباقة الماسية — واجهة التسعير */
export const DIAMOND_LICENSE_TECHNICAL_VALUE_AR =
  'أقوى رخصة نفاذ للصالونات الجادة: صدارة في الطلبات القريبة، صورة أقوى، وتنظيم مواعيد أفضل';

export const DIAMOND_PRODUCT_STANDARD_LABEL_AR = 'الماسية القياسية — رخصة نفاذ';
export const DIAMOND_PRODUCT_SMART_LABEL_AR = 'الماسية + إضافة المكتب الخاص';
export const DIAMOND_PRODUCT_STANDARD_HINT_AR =
  'رخصة نفاذ ضمن نظام الاستجابة الذكية — 200 ر.س/حزمة';
export const DIAMOND_PRODUCT_SMART_HINT_AR =
  'رخصة نفاذ ماسية + إضافة المكتب الخاص — 225 ر.س/حزمة (+25 Add-on)';
export const DIAMOND_ADDON_OPTION_LINE_AR =
  'Add-on اختياري: إضافة المكتب الخاص — مساعد داخلي يأخذ تعليماتك + مناوب شات ينفّذها أمام الزبائن';

/** اسم المنتج — إضافة المكتب الخاص */
export const DIGITAL_SHIFT_PRODUCT_NAME_AR = 'إضافة المكتب الخاص 🏛️';

/** بريد/تفعيل — بعد شراء Add-on */
export const DIGITAL_SHIFT_ONBOARDING_ACTIVATED_AR =
  'تم تفعيل إضافة «المكتب الخاص» — مساعد داخلي + مناوب شات مترابطان على رخصتك الماسية.';

export const DIGITAL_SHIFT_ONBOARDING_HEADLINE_AR = 'أهلًا — إضافة المكتب الخاص مفعّلة';

export const DIGITAL_SHIFT_ONBOARDING_SECTION_TITLE_AR =
  '🏛️ إضافة المكتب الخاص — المساعد الداخلي والمناوب متصلان';

export const DIGITAL_SHIFT_ONBOARDING_SECTION_PLAIN_HEADER_AR =
  '—— إضافة المكتب الخاص (Software Add-on · رخصة ماسية) ——';

/** API / لوحة الحلاق — عند غياب Add-on */
export const DIGITAL_SHIFT_NOT_ENABLED_ERROR_AR =
  'إضافة المكتب الخاص غير مفعّلة — فعّلها (+25 ر.س/حزمة) مع رخصة الماسية للحصول على المساعد الداخلي والمناوب';

export const DIGITAL_SHIFT_GATE_LOADING_AR = 'جاري التحقق من صلاحية إضافة المكتب الخاص…';

/** فواتير وZATCA — تسميات موحّدة */
export const INVOICE_DIAMOND_LICENSE_LABEL_AR = 'رخصة نفاذ ماسية (200 ر.س)';
export const INVOICE_DIAMOND_WITH_ADDON_LABEL_AR =
  'رخصة نفاذ ماسية + إضافة المكتب الخاص (225 ر.س)';

export const INVOICE_DIGITAL_SHIFT_ADDON_LINE_AR =
  'إضافة المكتب الخاص (مساعد داخلي + مناوب شات · Software Add-on)';

export const ZATCA_PLATFORM_PACKAGES_NOTE_AR =
  'حزم رخصة نفاذ حلاق ماب الرقمية (نظام الاستجابة الذكية) B2B — برونزي/ذهبي/ماسي + إضافة المكتب الخاص. لا عمولة على الحلاقة، والظهور برمجي عند الطلب.';
