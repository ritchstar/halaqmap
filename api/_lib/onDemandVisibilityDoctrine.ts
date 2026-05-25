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
 * المنطق: وصول المنصة للمستخدمين حتمي — السؤال فقط: هل يكون صالونك في القائمة أم لا؟
 */
export const HALAQMAP_GROWTH_INEVITABILITY_AR =
  'وصول حلاق ماب للمستخدمين مسألة وقت — المنصة تنمو بالطلب الطبيعي لخدمة الحلاقة (الحاجة متكررة وغير قابلة للإلغاء). السؤال الحقيقي ليس «هل ستنتشر المنصة؟» بل «هل سيكون صالونك في القائمة حين تصل؟»' as const;

export const HALAQMAP_GROWTH_INEVITABILITY_SHORT_AR =
  'وصول حلاق ماب للمستخدمين مسألة وقت — فقط تأكّد أن صالونك في القائمة قبل أن يبحث عنك الزبون.' as const;

export const HALAQMAP_GROWTH_INEVITABILITY_SALES_AR =
  'بصراحة يا صاحبي — وصول حلاق ماب للمستخدمين مسألة وقت لا مسألة «إذا». الحلاقة حاجة متكررة، والرادار الجغرافي يربط الزبون بأقرب صالون فوراً. من يسجّل الآن يحجز موقعه قبل المنافسين — ومن يتأخر يجد منافسه قد أخذ المكان.' as const;
