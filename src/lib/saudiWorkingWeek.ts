/** ترتيب الأسبوع المعتاد في السعودية: يبدأ من السبت */
export const SAUDI_WEEK_DAY_LABELS = [
  'السبت',
  'الأحد',
  'الاثنين',
  'الثلاثاء',
  'الأربعاء',
  'الخميس',
  'الجمعة',
] as const;

export type WeekDayLabel = (typeof SAUDI_WEEK_DAY_LABELS)[number];

export type WorkingHourSlot = { day: string; open: string; close: string };

export type WorkingWeekFormRow = {
  day: string;
  open: string;
  close: string;
  /** يوم إجازة / مغلق */
  closed: boolean;
};

/** ساعات افتراضية للبيانات التجريبية (أسبوع كامل) */
export const STANDARD_MOCK_WORKING_HOURS: WorkingHourSlot[] = [
  { day: 'السبت', open: '09:00', close: '22:00' },
  { day: 'الأحد', open: '09:00', close: '22:00' },
  { day: 'الاثنين', open: '09:00', close: '22:00' },
  { day: 'الثلاثاء', open: '09:00', close: '22:00' },
  { day: 'الأربعاء', open: '09:00', close: '22:00' },
  { day: 'الخميس', open: '09:00', close: '22:00' },
  { day: 'الجمعة', open: '14:00', close: '22:00' },
];

export function createInitialWorkingWeekForm(): WorkingWeekFormRow[] {
  return SAUDI_WEEK_DAY_LABELS.map((day) => ({
    day,
    open: day === 'الجمعة' ? '14:00' : '10:00',
    close: '22:00',
    closed: false,
  }));
}

export function workingWeekFormToPayload(rows: WorkingWeekFormRow[]): WorkingHourSlot[] {
  return rows.map((r) =>
    r.closed ? { day: r.day, open: 'مغلق', close: 'مغلق' } : { day: r.day, open: r.open, close: r.close }
  );
}

/** تحويل بيانات الحلاق المخزّنة إلى صفوف نموذج التحرير */
export function workingSlotsToFormRows(slots: WorkingHourSlot[]): WorkingWeekFormRow[] {
  return SAUDI_WEEK_DAY_LABELS.map((day) => {
    const f = slots.find((s) => s.day === day);
    if (!f) {
      return { day, open: '10:00', close: '22:00', closed: true };
    }
    if (isDayClosed(f.open, f.close)) {
      return { day, open: '', close: '', closed: true };
    }
    return { day, open: f.open, close: f.close, closed: false };
  });
}

export function isDayClosed(open: string, close: string): boolean {
  const o = open.trim();
  const c = close.trim();
  if (o === 'مغلق' || c === 'مغلق') return true;
  return !o && !c;
}

/** صف واحد لكل يوم بالترتيب السعودي — للعرض في الواجهة */
export function getOrderedWeekHoursForDisplay(hours: WorkingHourSlot[]): {
  day: string;
  line: string;
  closed: boolean;
}[] {
  return SAUDI_WEEK_DAY_LABELS.map((day) => {
    const f = hours.find((h) => h.day === day);
    if (!f) {
      return { day, line: 'غير مُحدّد', closed: true };
    }
    if (isDayClosed(f.open, f.close)) {
      return { day, line: 'مغلق', closed: true };
    }
    return { day, line: `${f.open} – ${f.close}`, closed: false };
  });
}
