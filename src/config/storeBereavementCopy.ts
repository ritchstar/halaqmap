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
  condolencePhoneOnlyAr: 'العزاء عبر الاتصال',
  condolenceCemeteryOnlyAr: 'العزاء في المقبرة',
  condolenceAtHomeAr: 'العزاء في المنزل',
  condolenceAtHomeHintAr:
    'يظهر على البلاغ: العزاء في المنزل. لا تكتب عنوان السكن هنا؛ الأسرة ترسل الموقع خاصاً لمن تدعوه.',
  condolenceAtHomePublicHintAr: 'الموقع يُرسل خاصاً من الأسرة.',
  condolenceNoneAr: 'لا يوجد عزاء حضوري',
  warningAccuracyAr:
    'نشر معلومات غير صحيحة عن وفاة أو ترتيبات عزاء مسؤولية منشئ البلاغ وفق الأنظمة.',
  locationHintAr:
    'المسجد والمقبرة أماكن عامة. لا تكتب عنوان منزل أو عزاء النساء في المنزل على هذه الصفحة.',
  shareIntroAr: 'إنا لله وإنا إليه راجعون',
  condolenceMultiHintAr: 'يجوز اختيار أكثر من طريقة: اتصال وزيارة منزلية معاً إن رغبت الأسرة.',
  phoneDialHintAr: 'اختر الدولة ثم اكتب الرقم المحلي دون صفر البداية. للسعودية: 5xxxxxxxx',
  kinTitleAr: 'ذوو المتوفى للتعزية',
  kinLeadAr: 'اختياري. يظهر الاسم والصفة وزر الاتصال للزوار. لا يُنشر إلا بإذن صاحبه.',
  kinAddAr: 'إضافة قريب',
  manageOnlyPhoneAr: 'رابط الإدارة يُرسل إلى الجوال الموثّق فقط. لا تشاركه مع الزوار.',
  pausedTitleAr: 'الخدمة متوقفة مؤقتاً',
  pausedLeadAr:
    'بلاغ الوفاة والعزاء محفوظ في المنصة، وغير معروض في واجهة المتجر حتى يُستكمل إعداد التحقق. بطاقة المناسبة المدفوعة متاحة الآن.',
  pausedCtaAr: 'فتح بطاقة المناسبة',
} as const;

/** الواجهة العامة متوقفة. المسارات والكود محفوظان لإعادة التفعيل لاحقاً. */
export const STORE_BEREAVEMENT_PUBLIC_ENABLED = false;

export const STORE_BEREAVEMENT_GENDER = [
  { id: 'male', labelAr: 'المتوفى' },
  { id: 'female', labelAr: 'المتوفاة' },
] as const;

export const STORE_BEREAVEMENT_BURIAL = [
  { id: 'pending', labelAr: 'لم يتم الدفن بعد' },
  { id: 'done', labelAr: 'تم الدفن' },
  { id: 'unknown', labelAr: 'غير محدّد الآن' },
] as const;

export const STORE_BEREAVEMENT_CONDOLENCE = [
  { id: 'phone', labelAr: STORE_BEREAVEMENT_COPY.condolencePhoneOnlyAr },
  { id: 'cemetery', labelAr: STORE_BEREAVEMENT_COPY.condolenceCemeteryOnlyAr },
  { id: 'at_home', labelAr: STORE_BEREAVEMENT_COPY.condolenceAtHomeAr },
] as const;

export type BereavementCondolenceMode = (typeof STORE_BEREAVEMENT_CONDOLENCE)[number]['id'];

export function canonicalizeCondolenceMode(raw: string): BereavementCondolenceMode | null {
  if (raw === 'phone' || raw === 'phone_only') return 'phone';
  if (raw === 'cemetery' || raw === 'cemetery_only') return 'cemetery';
  if (raw === 'at_home') return 'at_home';
  return null;
}

export function condolenceLabelAr(mode: string | undefined): string {
  const id = canonicalizeCondolenceMode(String(mode || ''));
  const found = STORE_BEREAVEMENT_CONDOLENCE.find((item) => item.id === id);
  return found?.labelAr ?? STORE_BEREAVEMENT_COPY.condolencePhoneOnlyAr;
}

export function condolenceLabelsAr(modes: readonly string[] | string | undefined): string {
  const list = Array.isArray(modes) ? modes : modes ? [modes] : [];
  const labels = list
    .map((item) => canonicalizeCondolenceMode(item))
    .filter((item): item is BereavementCondolenceMode => Boolean(item))
    .map((id) => STORE_BEREAVEMENT_CONDOLENCE.find((row) => row.id === id)?.labelAr)
    .filter((label): label is string => Boolean(label));
  return labels.join(' · ') || STORE_BEREAVEMENT_COPY.condolencePhoneOnlyAr;
}

export const STORE_BEREAVEMENT_KIN_MAX = 12;

export const STORE_BEREAVEMENT_RELATIONS = [
  { id: 'father', labelAr: 'والد' },
  { id: 'mother', labelAr: 'والدة' },
  { id: 'son', labelAr: 'ابن' },
  { id: 'daughter', labelAr: 'ابنة' },
  { id: 'brother', labelAr: 'أخ' },
  { id: 'sister', labelAr: 'أخت' },
  { id: 'husband', labelAr: 'زوج' },
  { id: 'wife', labelAr: 'زوجة' },
  { id: 'uncle_paternal', labelAr: 'عم' },
  { id: 'uncle_maternal', labelAr: 'خال' },
  { id: 'other', labelAr: 'أخرى' },
] as const;

export type BereavementKinRelation = (typeof STORE_BEREAVEMENT_RELATIONS)[number]['id'];

export function kinRelationLabelAr(id: string | undefined): string {
  return STORE_BEREAVEMENT_RELATIONS.find((item) => item.id === id)?.labelAr || '';
}

export type BereavementKinRow = {
  name: string;
  phoneLocal: string;
  phoneDial: string;
  relation: BereavementKinRelation | '';
};

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
  condolenceModes: BereavementCondolenceMode[];
  kin: BereavementKinRow[];
  prayerText: string;
  familyNote: string;
  phoneDial: string;
  phoneLocal: string;
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
  condolenceModes: ['phone'],
  kin: [{ name: '', phoneLocal: '', phoneDial: '966', relation: '' }],
  prayerText: STORE_BEREAVEMENT_PRAYERS[0],
  familyNote: '',
  phoneDial: '966',
  phoneLocal: '',
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
