/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * تفسير تجاري لجملة «بلا وعد بعدد زبائن مضمون» — مسار الشركاء فقط.
 * لا تُخلط في صفحات المستعلم. لا تُسحب إلى استيراد App الثابت.
 */
export const NO_GUARANTEED_CUSTOMERS_PHRASE_AR = 'بلا وعد بعدد زبائن مضمون';

export const NO_GUARANTEED_CUSTOMERS_TITLE_AR = 'ماذا يعني هذا لصاحب الصالون؟';

export const NO_GUARANTEED_CUSTOMERS_LEAD_AR =
  'العبارة لا تعني غياب الزبائن. تعني أنك تشتري جاهزية ظهور، لا عدداً مضموناً من الكراسي.';

export const NO_GUARANTEED_CUSTOMERS_POINTS_AR = [
  'المنصة تجلب الباحث الجاد إلى الاستعلام.',
  'رخصتك تجعلك مرئياً في تلك اللحظة إن كنت مفعّلاً وفي النطاق.',
  'الغائب عن الشبكة لا يدخل المقارنة أصلاً.',
  'من يظهر قد يُختار أو لا يُختار؛ هذا قرار الزبون بعد التواصل، وليس تعهداً منّا برقم كراسٍ.',
] as const;

export function mentionsNoGuaranteedCustomers(text: string): boolean {
  return /وعد بعدد|نعد بعدد|وعود بعدد/.test(String(text || ''));
}

export function noGuaranteedCustomersExplainAr(): string {
  return [
    NO_GUARANTEED_CUSTOMERS_TITLE_AR,
    NO_GUARANTEED_CUSTOMERS_LEAD_AR,
    ...NO_GUARANTEED_CUSTOMERS_POINTS_AR.map((point) => `• ${point}`),
  ].join('\n');
}
