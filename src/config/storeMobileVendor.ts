/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * مسار عربة مشمول في السعر لمطعمنا1 وتمويناتا1 وكافينا1.
 * ليست إضافة مدفوعة وليست منتجاً رابعاً. اللقب الظاهر لا يتغير.
 */
export const STORE_MOBILE_VENDOR_PRICE_6_SAR = 799 as const;
export const STORE_MOBILE_VENDOR_PRICE_12_SAR = 1250 as const;
export const STORE_MOBILE_VENDOR_PRICE_6_HALALAS = 79900 as const;
export const STORE_MOBILE_VENDOR_PRICE_12_HALALAS = 125000 as const;
export const STORE_MOBILE_VENDOR_DAYS_6 = 180 as const;
export const STORE_MOBILE_VENDOR_DAYS_12 = 365 as const;
export const STORE_MOBILE_VENDOR_AFFILIATE_6_SAR = 99 as const;
export const STORE_MOBILE_VENDOR_AFFILIATE_12_SAR = 250 as const;
export const STORE_MOBILE_VENDOR_STALE_MS = 40 * 60 * 1000;
export const STORE_MOBILE_VENDOR_LOCATE_GAP_MS = 2 * 60 * 1000;
export const STORE_MOBILE_VENDOR_HISTORY_CAP = 30 as const;

export type StoreVendorMode = 'fixed' | 'mobile';

export const STORE_MOBILE_VENDOR_WEEKDAYS_AR = [
  'الأحد',
  'الاثنين',
  'الثلاثاء',
  'الأربعاء',
  'الخميس',
  'الجمعة',
  'السبت',
] as const;

export const STORE_MOBILE_VENDOR_PACKS = [
  {
    id: 'm6' as const,
    months: 6,
    days: STORE_MOBILE_VENDOR_DAYS_6,
    priceSar: STORE_MOBILE_VENDOR_PRICE_6_SAR,
    priceHalalas: STORE_MOBILE_VENDOR_PRICE_6_HALALAS,
    titleAr: 'باقة مئة وثمانين يوماً',
    priceLineAr: '799 ر.س لمئة وثمانين يوماً',
    lineAr: 'مسار عربة. تحديث الموقع مشمول في السعر، بلا إضافة مدفوعة.',
  },
  {
    id: 'm12' as const,
    months: 12,
    days: STORE_MOBILE_VENDOR_DAYS_12,
    priceSar: STORE_MOBILE_VENDOR_PRICE_12_SAR,
    priceHalalas: STORE_MOBILE_VENDOR_PRICE_12_HALALAS,
    titleAr: 'باقة ثلاثمئة وخمسة وستين يوماً',
    priceLineAr: '1250 ر.س لثلاثمئة وخمسة وستين يوماً',
    lineAr: 'مدة أطول لنفس الصفحة واللوحة ومسار العربة.',
  },
] as const;

export const STORE_MOBILE_VENDOR = {
  markAr: 'متحرك',
  pathTitleAr: 'مسار التشغيل',
  fixedTitleAr: 'ثابت',
  mobileTitleAr: 'متحرك',
  fixedLeadAr: 'محل في مكانه. تحديد الموقع مرة ثم إبرازه أو إخفاؤه.',
  mobileLeadAr: 'عربة حي. تحديث الموقع من اللوحة مشمول في سعر الباقة، بلا إضافة مدفوعة.',
  priceLineAr: 'مسار متحرك: 799 ر.س لمئة وثمانين يوماً، أو 1250 ر.س لثلاثمئة وخمسة وستين يوماً',
  locateNowAr: 'تحديث موقعي الآن',
  locateSavedAr: 'حُفظ موقع العربة.',
  transitOnAr: 'في الطريق',
  transitOffAr: 'وصلت إلى الموقع',
  weekPlanTitleAr: 'جدول الأسبوع المتوقع',
  weekPlanLeadAr: 'سطر لكل يوم: الحي أو المعلم. توقع لا التزام بموعد.',
  historyTitleAr: 'سجل التحديثات',
  historyEmptyAr: 'لا تحديث بعد. اضغط تحديث موقعي الآن بعد موافقة المتصفح.',
  updatedAtAr: 'آخر تحديث',
  staleAr: 'الموقع غير محدّث الآن. اطلب مسبقاً.',
  transitAr: 'العربة في الطريق. اطلب مسبقاً واستلم عند الوصول.',
  atPinAr: 'العربة في موقعها الآن.',
  pickupFromCartAr: 'استلام من العربة',
  placeHintAr: 'حيّك أو أقرب معلم',
  rateHintAr: 'انتظر قليلاً قبل تحديث آخر، أو تحرّك ثم حدّث.',
  chatFixedOnlyAr: 'صندوق المحادثة إضافة على المسار الثابت فقط.',
  deskLeadAr:
    'حدّث موقع العربة من اللوحة بعد موافقة المتصفح. الإحداثيات تظهر لجار الحي فقط إن أبرزتها وما دام التحديث حديثاً ولست في الطريق.',
} as const;
