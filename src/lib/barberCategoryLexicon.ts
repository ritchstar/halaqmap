/** التصنيف الموحّد المخزَّن في `specialties` عند قبول حلاقة الأطفال. */
export const CHILDREN_BARBER_CATEGORY = 'حلاقة أطفال';

/** مفتاح فلتر البحث في الواجهة. */
export const CHILDREN_FILTER_ID = 'أطفال';

const CHILDREN_SPECIALTY_LABELS = new Set([
  CHILDREN_BARBER_CATEGORY,
  'أطفال',
  'حلاق أطفال',
  'صالون أطفال',
]);

/** ربط فلاتر الواجهة بصيغ التخزين المحتملة في `specialties`. */
export const CATEGORY_FILTER_ALIASES: Record<string, readonly string[]> = {
  رجالي: ['حلاقة رجالي', 'رجالي'],
  [CHILDREN_FILTER_ID]: [CHILDREN_BARBER_CATEGORY, 'أطفال', 'حلاق أطفال'],
  تقليدي: ['حلاقة تقليدية', 'تقليدي'],
  'احتياجات خاصة': ['احتياجات خاصة', 'كبار السن', 'ذوي الاحتياجات'],
  'زيارة منزلية': ['زيارة منزلية', 'خدمة منزلية'],
};

export function barberAcceptsChildren(categories: string[] | null | undefined): boolean {
  if (!Array.isArray(categories)) return false;
  return categories.some((c) => CHILDREN_SPECIALTY_LABELS.has(String(c).trim()));
}

export function barberMatchesCategoryFilter(
  categories: string[] | null | undefined,
  filterId: string,
): boolean {
  if (!Array.isArray(categories)) return false;
  const aliases = CATEGORY_FILTER_ALIASES[filterId];
  if (!aliases?.length) {
    return categories.includes(filterId);
  }
  const normalized = new Set(categories.map((c) => String(c).trim()));
  return aliases.some((alias) => normalized.has(alias));
}

export function withChildrenServiceInSpecialties(
  specialties: string[] | null | undefined,
  acceptsChildren: boolean,
): string[] {
  const base = Array.isArray(specialties)
    ? specialties.map((s) => String(s).trim()).filter(Boolean)
    : [];
  const withoutChildren = base.filter((s) => !CHILDREN_SPECIALTY_LABELS.has(s));
  if (!acceptsChildren) return withoutChildren;
  if (withoutChildren.includes(CHILDREN_BARBER_CATEGORY)) return withoutChildren;
  return [...withoutChildren, CHILDREN_BARBER_CATEGORY];
}
