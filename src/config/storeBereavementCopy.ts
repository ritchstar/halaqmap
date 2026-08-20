/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * مسار بلاغات الوفاة والعزاء — خدمة مجتمعية مستقلة.
 * لا يُستورد من App.
 */
export const STORE_BEREAVEMENT_KIND = 'bereavement-notices' as const;

export const STORE_BEREAVEMENT_COPY = {
  documentTitle: 'إعلان وفاة وترتيبات الصلاة والدفن والعزاء — خريطة الحل',
  kicker: 'خدمة مجتمعية مجانية ومستقلة',
  titleAr: 'إعلان وفاة وترتيبات الصلاة والدفن والعزاء',
  leadAr:
    'بلاغات الوفاة والعزاء — خدمة مجتمعية مجانية ومستقلة من خريطة الحل. ليست مناسبة، ولا تدخل أسعار البطاقات المدفوعة.',
  consolationAr:
    'خريطة الحل تتقدم بخالص المواساة، وتسأل الله أن يتغمّد الفقيد بواسع رحمته.',
  stampAr: 'خدمة مجتمعية مقدمة من خريطة الحل',
  stampAltAr: 'أُعد هذا البلاغ عبر خريطة الحل',
  urgentModeAr: 'إعلان مختصر عاجل',
  fullModeAr: 'إعلان كامل — يُستكمل لاحقاً على نفس الرابط',
  step1Ar: 'بيانات المتوفى',
  step2Ar: 'الصلاة والدفن والعزاء',
  step3Ar: 'المراجعة والنشر',
  expiredAr: 'انتهت فترة عرض تفاصيل العزاء. نسأل الله للفقيد الرحمة والمغفرة.',
  lastUpdatedAr: 'آخر تحديث',
  condolencePhoneOnlyAr: 'العزاء عبر الاتصال فقط',
  condolenceCemeteryOnlyAr: 'العزاء في المقبرة فقط',
  condolenceNoneAr: 'لا يوجد عزاء حضوري',
  warningAccuracyAr:
    'نشر معلومات غير صحيحة عن وفاة أو ترتيبات عزاء مسؤولية منشئ البلاغ وفق الأنظمة.',
  locationHintAr:
    'المسجد والمقبرة أماكن عامة. لا تكتب عنوان منزل أو عزاء النساء في المنزل على هذه الصفحة.',
  shareIntroAr: 'إنا لله وإنا إليه راجعون',
  manageOnlyPhoneAr: 'رابط الإدارة يُرسل إلى الجوال الموثّق فقط. لا تشاركه مع الزوار.',
} as const;

export const STORE_BEREAVEMENT_GENDER = [
  { id: 'male', labelAr: 'المتوفى' },
  { id: 'female', labelAr: 'المتوفاة' },
] as const;

export const STORE_BEREAVEMENT_BURIAL = [
  { id: 'pending', labelAr: 'لم يتم الدفن بعد' },
  { id: 'done', labelAr: 'تم الدفن' },
  { id: 'unknown', labelAr: 'غير محدّد الآن' },
] as const;

export const STORE_BEREAVEMENT_PRAYERS: readonly string[] = [
  'إنا لله وإنا إليه راجعون. نسأل الله أن يتغمّده بواسع رحمته.',
  'إنا لله وإنا إليه راجعون. نسأل الله أن يتغمّدها بواسع رحمته.',
  'نسأل الله للفقيد الرحمة والمغفرة، وأن يلهم أهله الصبر والسلوان.',
  'عظم الله أجركم، وأحسن عزاءكم، وغفر لميتكم.',
];

export const STORE_BEREAVEMENT_CITIES = [
  'الرياض',
  'جدة',
  'مكة المكرمة',
  'المدينة المنورة',
  'الدمام',
  'الخبر',
  'الظهران',
  'الأحساء',
  'الطائف',
  'أبها',
  'خميس مشيط',
  'تبوك',
  'حائل',
  'بريدة',
  'نجران',
  'جازان',
  'ينبع',
  'الجبيل',
  'عرعر',
  'سكاكا',
  'الباحة',
] as const;

export type BereavementDraft = {
  gender: 'male' | 'female';
  fullName: string;
  nickname: string;
  deathDate: string;
  city: string;
  prayerAt: string;
  mosqueName: string;
  mosqueMapUrl: string;
  cemeteryName: string;
  cemeteryMapUrl: string;
  burial: 'pending' | 'done' | 'unknown';
  condolenceMode: 'phone_only' | 'cemetery_only' | 'none';
  prayerText: string;
  familyNote: string;
  phone: string;
  attestorName: string;
  attestorRole: string;
};

export const EMPTY_BEREAVEMENT_DRAFT: BereavementDraft = {
  gender: 'male',
  fullName: '',
  nickname: '',
  deathDate: '',
  city: '',
  prayerAt: '',
  mosqueName: '',
  mosqueMapUrl: '',
  cemeteryName: '',
  cemeteryMapUrl: '',
  burial: 'pending',
  condolenceMode: 'phone_only',
  prayerText: STORE_BEREAVEMENT_PRAYERS[0],
  familyNote: '',
  phone: '',
  attestorName: '',
  attestorRole: '',
};

export function bereavementShareText(name: string, url?: string): string {
  const who = name.trim() || 'الفقيد';
  const lines = [
    STORE_BEREAVEMENT_COPY.shareIntroAr,
    `انتقل إلى رحمة الله تعالى ${who}.`,
    url ? 'تفاصيل الصلاة والدفن والعزاء عبر الرابط:' : 'تفاصيل الصلاة والدفن والعزاء.',
  ];
  if (url) lines.push(url);
  return lines.join('\n');
}

export function bereavementPlainText(input: {
  fullName: string;
  gender: 'male' | 'female';
  prayerAt?: string;
  mosqueName?: string;
  cemeteryName?: string;
}): string {
  const passed = input.gender === 'female' ? 'انتقلت' : 'انتقل';
  const lines = [
    STORE_BEREAVEMENT_COPY.shareIntroAr,
    `${passed} إلى رحمة الله تعالى ${input.fullName.trim()}.`,
  ];
  if (input.prayerAt?.trim()) lines.push(`الصلاة: ${input.prayerAt.trim()}`);
  if (input.mosqueName?.trim()) lines.push(`المسجد: ${input.mosqueName.trim()}`);
  if (input.cemeteryName?.trim()) lines.push(`المقبرة: ${input.cemeteryName.trim()}`);
  return lines.join('\n');
}
