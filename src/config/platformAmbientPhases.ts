/** أوضاع الإضاءة المحيطية — مرتبطة بوقت الرياض (Asia/Riyadh). */

export type AmbientPhaseId = 'fajr' | 'dhuhr' | 'ghuroob' | 'layl';

export type AmbientControlMode = 'auto' | 'bright' | 'night';

export const PLATFORM_AMBIENT_STORAGE_KEY = 'halaqmap-ambient-control';

export const RIYADH_TIMEZONE = 'Asia/Riyadh';

export type AmbientPhaseDefinition = {
  id: AmbientPhaseId;
  labelAr: string;
  shortLabelAr: string;
  /** بداية inclusive — HH:MM بتوقيت الرياض */
  start: string;
  descriptionAr: string;
};

/**
 * حدود تقريبية يومية — تُحدَّث لاحقاً بجدول شروق/غروب فلكي إن لزم.
 * الترتيب: layl → fajr → dhuhr → ghuroob → layl
 */
export const AMBIENT_PHASES_ORDER: readonly AmbientPhaseDefinition[] = [
  {
    id: 'layl',
    labelAr: 'ليل الرادار',
    shortLabelAr: 'ليل',
    start: '19:00',
    descriptionAr: 'توهج تيل/سيان خافت — جو الرادار الليلي',
  },
  {
    id: 'fajr',
    labelAr: 'فجر الرياض',
    shortLabelAr: 'فجر',
    start: '05:00',
    descriptionAr: 'شروق ذهبي من الشرق — بداية النهار',
  },
  {
    id: 'dhuhr',
    labelAr: 'ظهر مشرق',
    shortLabelAr: 'ظهر',
    start: '06:30',
    descriptionAr: 'إضاءة علوية تيل — أقصى سطوع للمنصة وإشعاع البنرات الكبرى',
  },
  {
    id: 'ghuroob',
    labelAr: 'غروب دافئ',
    shortLabelAr: 'غروب',
    start: '17:00',
    descriptionAr: 'كهرماني وبنفسجي من الغرب — انتقال لليل',
  },
] as const;

export const AMBIENT_CONTROL_LABELS: Record<
  AmbientControlMode,
  { labelAr: string; hintAr: string }
> = {
  auto: {
    labelAr: 'تلقائي — ساعة الرياض',
    hintAr: 'يتبع وقت الرياض: فجر · ظهر · غروب · ليل',
  },
  bright: {
    labelAr: 'إضاءة ظهر دائمة',
    hintAr: 'ظهر مشرق — إشعاع البنرات والصفحة معاً',
  },
  night: {
    labelAr: 'ليل دائم',
    hintAr: 'رادار ليلي — الهوية التكتيكية',
  },
};
