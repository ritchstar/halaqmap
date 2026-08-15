/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
/**
 * Mirror of `src/config/onDemandVisibilityDoctrine.ts` — للاستخدام في
 * api/_lib بدون اعتمادات frontend. **عند تعديل أي ثابت يجب تحديث الملفين معاً.**
 *
 * المنطق الجوهري: المزود لا يمتلك حضوراً جغرافياً ثابتاً؛ يُفعَّل الظهور
 * البرمجي حصراً عند وجود طلب نشط في محيطه الجغرافي.
 */

export const ON_DEMAND_VISIBILITY_PRODUCT_NAME_AR =
  'رخصة نفاذ حلاق ماب الرقمية (نظام الاستجابة الذكية)' as const;

export const SMART_RESPONSE_SYSTEM_LABEL_AR =
  'نظام الاستجابة الذكية' as const;

export const ON_DEMAND_VISIBILITY_LABEL_EN = 'On-Demand Visibility' as const;

export const ON_DEMAND_VISIBILITY_ALGO_CODE = 'on_demand_visibility_v1' as const;

export const ON_DEMAND_VISIBILITY_FUNCTIONAL_DESCRIPTION_AR =
  'رخصة نفاذ حلاق ماب الرقمية (نظام الاستجابة الذكية): حزمة تقنية تمنح مزود الخدمة حضوراً جغرافياً غير ثابت، حيث يتم تفعيل الظهور البرمجي للمزود حصرياً عند وجود طلب نشط في محيطه الجغرافي، مما يضمن كفاءة الربط ودقة الاستهداف.' as const;

export const ON_DEMAND_VISIBILITY_LEGAL_DEFINITION_AR =
  'تعتمد هذه الرخصة على خوارزمية (الظهور عند الطلب — On-Demand Visibility)؛ حيث يقتصر النفاذ الإعلامي للمزود على النطاق الجغرافي والزمني لحاجة طالب الخدمة، وهو ما يحقق غرض المنصة في ربط الطرفين بكفاءة تقنية دون الحاجة للإشغال الدائم للمساحات الرقمية.' as const;

export const ON_DEMAND_VISIBILITY_TAGLINE_SHORT_AR =
  'حضور جغرافي غير ثابت — يُفعَّل برمجياً عند وجود طلب نشط في محيطك.' as const;

export const ON_DEMAND_VISIBILITY_POLICY_TITLE_AR =
  'سياسة رخصة نفاذ حلاق ماب الرقمية (نظام الاستجابة الذكية)' as const;

export const ON_DEMAND_VISIBILITY_END_USER_NOTE_AR =
  'الصالونات تُعرض وفق نظام الاستجابة الذكية — يظهر مزود الخدمة عند وجود طلب نشط في محيطك الجغرافي وضمن النطاق الذي تختاره، لا كقائمة دائمة.' as const;

export const ON_DEMAND_VISIBILITY_PARTNER_NOTE_AR =
  'صالونك يُفعَّل تقنياً عند وجود طلب نشط في محيطه الجغرافي — هذه كفاءة استهداف، وليست محدودية ظهور. كلما زاد الطلب في حيّك، زاد ظهورك البرمجي.' as const;

export const ON_DEMAND_VISIBILITY_LEGAL_CLAUSES_AR: readonly string[] = [
  'الرخصة هي حزمة تقنية لحضور جغرافي غير ثابت — لا تشمل التزاماً بظهور دائم على الخريطة.',
  'يقتصر النفاذ الإعلامي للمزود على النطاق الجغرافي والزمني لحاجة طالب الخدمة.',
  'لا تترتب على المنصة عمولة على خدمة الحلاقة — العلاقة التعاقدية بين الزبون والمزود مباشرة.',
  'كفاءة الربط ودقة الاستهداف هما الغرض المعلن للرخصة، لا الإشغال الدائم للمساحات الرقمية.',
] as const;

export const ON_DEMAND_VISIBILITY_TECH_FACTS = {
  algoCode: ON_DEMAND_VISIBILITY_ALGO_CODE,
  productNameAr: ON_DEMAND_VISIBILITY_PRODUCT_NAME_AR,
  systemLabelAr: SMART_RESPONSE_SYSTEM_LABEL_AR,
  labelEn: ON_DEMAND_VISIBILITY_LABEL_EN,
} as const;

/**
 * ── الجملة التسويقية الجوهرية ──
 * تُحقَن في جميع الوكلاء ذوي العلاقة التسويقية.
 * المنطق: جماهيرية وسيو قائمان، والمزيد في الطريق — السؤال: هل صالونك جاهز للظهور؟
 */
export const HALAQMAP_GROWTH_INEVITABILITY_AR =
  'حلاق ماب تملك جماهيرية بحث وسيوًا واسعاً — والمزيد من المستعلمين في الطريق. السؤال الحقيقي ليس «هل يصل الباحث؟» بل «هل سيكون صالونك جاهزاً للظهور حين يستعلم في حيّك؟»' as const;

export const HALAQMAP_GROWTH_INEVITABILITY_SHORT_AR =
  'الجماهيرية والسيو قائمان — والمزيد في الطريق. تأكّد أن صالونك جاهز للظهور عند الاستعلام.' as const;

export const HALAQMAP_GROWTH_INEVITABILITY_SALES_AR =
  'بصراحة يا صاحبي — الجماهيرية والسيو عندنا قائمان، والمزيد قادم. الحلاقة حاجة متكررة، والمنصة تعرض الصالون المناسب فور تنشّط الطلب. من يفعّل الآن يظهر في لحظة الاستعلام — ومن يتأخر قد يجد منافسه سبقه إلى الجاهزية.' as const;

/** مبدأ المؤسس — صياغة الفعل لكل طرف */
export const FOUNDER_END_USER_ACTION_AR = 'ابدأ الاستعلام' as const;

export const FOUNDER_PARTNER_ACTION_AR = 'سجّل طلبك' as const;

export const FOUNDER_PLATFORM_ACTION_DOCTRINE_AR =
  'مبدأ المؤسس: للمستخدم النهائي (B2C) نقول «ابدأ الاستعلام» — لا «سجّل طلبك». للحلاق المنظم للمنصة (B2B) نقول «سجّل طلبك» — لا «ابدأ الاستعلام». لا تخلط الصياغتين بين الطرفين.' as const;
