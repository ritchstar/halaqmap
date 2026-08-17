/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * يُحدَّث بالتزامن مع src/config/noGuaranteedCustomersCopy.ts
 */
export const NO_GUARANTEED_CUSTOMERS_TITLE_AR = 'ماذا يعني هذا لصاحب الصالون؟';

export const NO_GUARANTEED_CUSTOMERS_LEAD_AR =
  'العبارة لا تعني غياب الزبائن. تعني أنك تشتري جاهزية ظهور، لا عدداً مضموناً من الكراسي.';

export const NO_GUARANTEED_CUSTOMERS_POINTS_AR = [
  'المنصة تجلب الباحث الجاد إلى الاستعلام.',
  'رخصتك تجعلك مرئياً في تلك اللحظة إن كنت مفعّلاً وفي النطاق.',
  'الغائب عن الشبكة لا يدخل المقارنة أصلاً.',
  'من يظهر قد يُختار أو لا يُختار؛ هذا قرار الزبون بعد التواصل، وليس تعهداً منّا برقم كراسٍ.',
] as const;

export function noGuaranteedCustomersExplainAr(): string {
  return [
    NO_GUARANTEED_CUSTOMERS_TITLE_AR,
    NO_GUARANTEED_CUSTOMERS_LEAD_AR,
    ...NO_GUARANTEED_CUSTOMERS_POINTS_AR.map((point) => `• ${point}`),
  ].join('\n');
}
