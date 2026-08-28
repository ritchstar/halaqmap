/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * قائمة مشاركات هدايا المتجر — للإدارة فقط. لا يُستورد من App.
 */
export const STORE_GIFT_ROSTER_CONFIRM_HOURS = 48 as const;
export const STORE_GIFT_ROSTER_RESEND_MINUTES = 10 as const;

export const STORE_GIFT_ROSTER_COPY = {
  documentTitle: 'قائمة هدايا المتجر | الإدارة',
  kickerAr: 'هدايا المتجر',
  titleAr: 'قائمة المشاركين',
  leadAr:
    'كل من طلب المشاركة يظهر هنا فور التسجيل. البريد المفعَّل مرجع النشرات والمنتج الجديد والولاء. بريد بانتظار التأكيد يُذكَّر من هنا قبل انتهاء مهلة الرابط.',
  deniedAr: 'هذه الصفحة للإدارة فقط.',
  dashAr: 'لوحة التحكم',
  allAr: 'الكل',
  occasionAr: 'هدية خريطة الحل',
  kitchenAr: 'هدية طبختنا1',
  pendingAr: 'بانتظار تأكيد البريد',
  activeAr: 'مفعل',
  expiredLinkAr: 'انتهت مهلة الرابط',
  resendAr: 'أعد إرسال التأكيد',
  resendOkAr: 'أُرسل تأكيد جديد إلى البريد.',
  copyActiveAr: 'انسخ البريد المفعَّل',
  copiedAr: 'نُسخ البريد المفعَّل.',
  emptyAr: 'لا مشاركين بعد.',
  countsAr: 'الإجمالي',
  cityAr: 'المنطقة',
  sourceAr: 'القناة',
  productAr: 'النموذج',
  joinedAr: 'التسجيل',
  deadlineAr: 'مهلة الرابط',
  refreshAr: 'تحديث',
} as const;

export const STORE_GIFT_ROSTER_SOURCE_AR: Record<string, string> = {
  google: 'بحث قوقل',
  youtube: 'اليوتيوب',
  x: 'منصة اكس',
  snapchat: 'السناب شات',
  friend: 'عن طريق صديق',
};
