export type HomeServiceContactFormValues = {
  district: string;
  timeWindow: string;
  serviceType: string;
  note: string;
};

export const HOME_SERVICE_TIME_WINDOWS = [
  { id: 'morning', label: 'صباحاً' },
  { id: 'afternoon', label: 'ظهراً' },
  { id: 'evening', label: 'مساءً' },
  { id: 'flexible', label: 'مرن — حسب التوفر' },
] as const;

export const HOME_SERVICE_TYPES = [
  'قص شعر',
  'تشذيب لحية',
  'قص + لحية',
  'حلاقة أطفال',
  'خدمة أخرى',
] as const;

export const HOME_SERVICE_CONTACT_DISCLAIMER_AR =
  'أفهم أن هذا طلب تواصل وليس حجزاً. التنسيق والسعر النهائي والتنفيذ مباشرة بيني وبين الحلاق — المنصة ناقل تواصل تقني فقط.';

/** يُستخدم لتمييز طلبات الزيارة المنزلية في تنبيهات الشات. */
export function isHomeServiceContactChatBody(body: string): boolean {
  const t = body.trim();
  return t.startsWith('🏠') || t.includes('طلب تواصل — خدمة زيارة منزلية');
}

export function formatHomeServiceContactMessage(
  barberName: string,
  values: HomeServiceContactFormValues,
): string {
  const district = values.district.trim();
  const timeLabel =
    HOME_SERVICE_TIME_WINDOWS.find((w) => w.id === values.timeWindow)?.label ??
    values.timeWindow.trim();
  const service = values.serviceType.trim();
  const note = values.note.trim();

  const lines = [
    '🏠 طلب تواصل — خدمة زيارة منزلية',
    `الصالون: ${barberName.trim()}`,
    district ? `الحي / المنطقة: ${district}` : null,
    timeLabel ? `الوقت المفضل: ${timeLabel}` : null,
    service ? `نوع الخدمة: ${service}` : null,
    note ? `ملاحظة: ${note}` : null,
    '',
    '—',
    'تنسيق وتنفيذ مباشر بين العميل والحلاق. حلاق ماب ناقل تواصل فقط.',
  ].filter(Boolean);

  return lines.join('\n');
}
