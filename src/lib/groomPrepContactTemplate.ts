export type GroomPrepContactFormValues = {
  eventDate: string;
  district: string;
  venueType: string;
  servicePackage: string;
  headCount: string;
  arrivalTime: string;
  note: string;
};

export const GROOM_PREP_VENUE_TYPES = [
  { id: 'shop', label: 'محل الحلاق' },
  { id: 'home', label: 'منزل' },
  { id: 'hotel', label: 'فندق' },
  { id: 'venue', label: 'موقع المناسبة' },
] as const;

export const GROOM_PREP_PACKAGES = [
  'باقة عريس كاملة',
  'حلاقة + تجهيز',
  'تجهيز بشت/شماغ',
  'باقة العريس + العوال',
  'استفسار — تحديد لاحقاً',
] as const;

export const GROOM_PREP_ARRIVAL_WINDOWS = [
  { id: 'morning', label: 'صباحاً' },
  { id: 'afternoon', label: 'ظهراً' },
  { id: 'evening', label: 'مساءً' },
  { id: 'flexible', label: 'مرن — حسب التوفر' },
] as const;

export const GROOM_PREP_CONTACT_DISCLAIMER_AR =
  'أفهم أن هذا طلب تواصل وليس حجزاً. التنسيق والسعر النهائي والتنفيذ مباشرة بيني وبين الحلاق — المنصة ناقل تواصل تقني فقط.';

/** يُستخدم لتمييز طلبات تجهيز العريس في تنبيهات الشات. */
export function isGroomPrepContactChatBody(body: string): boolean {
  const t = body.trim();
  return t.includes('طلب تواصل — تجهيز عريس');
}

export function formatGroomPrepContactMessage(
  barberName: string,
  values: GroomPrepContactFormValues,
): string {
  const eventDate = values.eventDate.trim();
  const district = values.district.trim();
  const venueLabel =
    GROOM_PREP_VENUE_TYPES.find((v) => v.id === values.venueType)?.label ??
    values.venueType.trim();
  const pkg = values.servicePackage.trim();
  const headCount = values.headCount.trim();
  const arrivalLabel =
    GROOM_PREP_ARRIVAL_WINDOWS.find((w) => w.id === values.arrivalTime)?.label ??
    values.arrivalTime.trim();
  const note = values.note.trim();

  const lines = [
    'طلب تواصل — تجهيز عريس',
    `الصالون: ${barberName.trim()}`,
    eventDate ? `تاريخ المناسبة: ${eventDate}` : null,
    district ? `الحي / المدينة: ${district}` : null,
    venueLabel ? `مكان التجهيز: ${venueLabel}` : null,
    pkg ? `باقة الخدمة: ${pkg}` : null,
    headCount ? `عدد الأشخاص: ${headCount}` : null,
    arrivalLabel ? `وقت الوصول: ${arrivalLabel}` : null,
    note ? `ملاحظة: ${note}` : null,
    '',
    '—',
    'تنسيق وتنفيذ مباشر بين العميل والحلاق. حلاق ماب ناقل تواصل فقط.',
  ].filter(Boolean);

  return lines.join('\n');
}
