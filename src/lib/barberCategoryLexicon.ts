/** التصنيف الموحّد المخزَّن في `specialties` عند قبول حلاقة الأطفال. */
export const CHILDREN_BARBER_CATEGORY = 'حلاقة أطفال';

/** مفتاح فلتر البحث في الواجهة. */
export const CHILDREN_FILTER_ID = 'أطفال';

/** فلتر موسّع: خدمة حلاقة على مدار 24 ساعة — يظهر كـ «24» فقط. */
export const OPEN_24H_FILTER_ID = '24';
/** القيمة المخزّنة في `specialties` عند إعلان الخدمة. */
export const OPEN_24H_SPECIALTY = 'حلاقة 24 ساعة';

const CHILDREN_SPECIALTY_LABELS = new Set([
  CHILDREN_BARBER_CATEGORY,
  'أطفال',
  'حلاق أطفال',
  'صالون أطفال',
]);

const OPEN_24H_SPECIALTY_LABELS = new Set([
  OPEN_24H_SPECIALTY,
  '24',
  '24 ساعة',
  'حلاق 24 ساعة',
  'صالون 24 ساعة',
  'على مدار الساعة',
]);

/** ربط فلاتر الواجهة بصيغ التخزين المحتملة في `specialties`. */
export const CATEGORY_FILTER_ALIASES: Record<string, readonly string[]> = {
  رجالي: ['حلاقة رجالي', 'رجالي'],
  [CHILDREN_FILTER_ID]: [CHILDREN_BARBER_CATEGORY, 'أطفال', 'حلاق أطفال'],
  تقليدي: ['حلاقة تقليدية', 'تقليدي'],
  'احتياجات خاصة': ['احتياجات خاصة', 'كبار السن', 'ذوي الاحتياجات'],
  'زيارة منزلية': ['زيارة منزلية', 'خدمة منزلية'],
  'تجهيز عريس': ['تجهيز عريس'],
  [OPEN_24H_FILTER_ID]: [
    OPEN_24H_SPECIALTY,
    '24',
    '24 ساعة',
    'حلاق 24 ساعة',
    'صالون 24 ساعة',
    'على مدار الساعة',
  ],
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

function parseHourMinuteToMinutes(raw: string): number | null {
  const m = /^(\d{1,2}):(\d{2})$/.exec(String(raw ?? '').trim());
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (!Number.isFinite(h) || !Number.isFinite(min) || h > 24 || min > 59) return null;
  if (h === 24 && min === 0) return 24 * 60;
  if (h === 24) return null;
  return h * 60 + min;
}

function slotLooksLike24Hours(open: string, close: string): boolean {
  const o = String(open ?? '').trim();
  const c = String(close ?? '').trim();
  if (!o || !c) return false;
  if (OPEN_24H_SPECIALTY_LABELS.has(o) || OPEN_24H_SPECIALTY_LABELS.has(c)) return true;
  if (/^24/.test(o) || /^24/.test(c)) return true;
  const om = parseHourMinuteToMinutes(o);
  const cm = parseHourMinuteToMinutes(c);
  if (om == null || cm == null) return false;
  // 00:00–00:00 أو 00:00–23:59/24:00 = يوم كامل
  if (om <= 15 && (cm >= 23 * 60 + 45 || cm === 0 || cm >= 24 * 60)) return true;
  return false;
}

/**
 * هل يعلن الصالون خدمة حلاقة 24 ساعة؟
 * عبر التخصص أو جدول أوقات يومي يغطي كامل اليوم لكل أيام الأسبوع الظاهرة.
 */
export function barberOffers24HourService(input: {
  categories?: string[] | null;
  workingHours?: Array<{ open: string; close: string }> | null;
}): boolean {
  if (barberMatchesCategoryFilter(input.categories, OPEN_24H_FILTER_ID)) return true;
  const hours = Array.isArray(input.workingHours) ? input.workingHours : [];
  if (hours.length < 7) return false;
  return hours.every((h) => slotLooksLike24Hours(h.open, h.close));
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
