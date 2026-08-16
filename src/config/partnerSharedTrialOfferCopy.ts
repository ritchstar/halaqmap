/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * عرض تشاركي: شهر على الشريك وثلاثة أشهر على المنصة — حتى نهاية نوفمبر ٢٠٢٦.
 * تسويق مسار الشركاء فقط. لا يُخلط في صفحات المستعلم `/need`.
 */
export const PARTNER_SHARED_TRIAL_OFFER_END_ISO = '2026-11-30T23:59:59+03:00';

export const PARTNER_SHARED_TRIAL_OFFER = {
  id: 'عرض-تشاركي',
  kicker: 'عرض تشاركي من المنصة',
  untilAr: 'يستمر حتى نهاية نوفمبر ٢٠٢٦',
  headline: 'شهر عليك وثلاثة أشهر علينا',
  subhead: 'أربعة أشهر ظهور عند الطلب — ثم تحكمون بالاستمرار أو التوقف',
  body:
    'رغبة مشتركة: المنصة تريد شركاء يغطون مواقعهم الجغرافية في المدن والأحياء، وشركاؤنا يريدون خوض التجربة بتحفّظ وحذر نتفهمه. لذلك تدفعون شهراً واحداً من رخصة النفاذ، وتمنحكم المنصة ثلاثة أشهر إضافية. خلال هذه المدة يجد الباحث صالونات مفعّلة في نطاقه، وتختبرون أنتم المسار عملياً قبل أي التزام أطول.',
  disclaimer:
    'الظهور عند تطابق الموقع والفلتر. لا وعد بعدد زبائن. العرض لمن ينضم قبل نهاية نوفمبر ٢٠٢٦.',
  cta: 'سجّل صالونك ضمن العرض',
} as const;

export function isPartnerSharedTrialOfferLive(now = new Date()): boolean {
  const end = Date.parse(PARTNER_SHARED_TRIAL_OFFER_END_ISO);
  if (!Number.isFinite(end)) return false;
  return now.getTime() <= end;
}
