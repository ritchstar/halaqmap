/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * مفتوح/مغلق وأوقات العمل لتمويناتا1 ومطعمنا1 وكافينا1 وطبختنا1.
 */
export type StoreShopHoursMode = 'single' | 'split';

export type StoreShopHoursState = {
  shopOpen: boolean;
  hoursEnabled: boolean;
  hoursMode: StoreShopHoursMode;
  hoursOpen: string;
  hoursClose: string;
  hoursMorningOpen: string;
  hoursMorningClose: string;
  hoursEveningOpen: string;
  hoursEveningClose: string;
};

export const DEFAULT_STORE_SHOP_HOURS: StoreShopHoursState = {
  shopOpen: true,
  hoursEnabled: false,
  hoursMode: 'single',
  hoursOpen: '09:00',
  hoursClose: '23:00',
  hoursMorningOpen: '08:00',
  hoursMorningClose: '12:00',
  hoursEveningOpen: '16:00',
  hoursEveningClose: '23:00',
};

export const STORE_SHOP_HOURS_COPY = {
  deskTitleAr: 'مفتوح ومغلق وأوقات العمل',
  deskLeadAr:
    'اضبط الحالة الآن بزر واحد. إن فعّلت الأوقات يُعرض للزائر الجدول، وخارجها يظهر مغلق مع بقاء التسوق مذكرة طلب مسبقة.',
  openNowAr: 'مفتوح الآن',
  closedToggleAr: 'مغلق الآن',
  hoursOnAr: 'تفعيل أوقات العمل',
  hoursOffAr: 'بلا جدول ساعات',
  modeSingleAr: 'فترة واحدة',
  modeSplitAr: 'فترتان: صباحية ومسائية',
  fromAr: 'من الساعة',
  toAr: 'إلى الساعة',
  morningAr: 'الفترة الصباحية',
  eveningAr: 'الفترة المسائية',
  closedBannerAr: 'مغلق الآن. بإمكانك التسوق وفتح مذكرة طلب مسبقة.',
  hoursTitleAr: 'أوقات العمل',
  preorderTitleAr: 'مذكرة طلب مسبقة',
  singleLineAr: (from: string, to: string) => `من الساعة ${from} إلى الساعة ${to}`,
  morningLineAr: (from: string, to: string) => `صباحية: من الساعة ${from} إلى الساعة ${to}`,
  eveningLineAr: (from: string, to: string) => `مسائية: من الساعة ${from} إلى الساعة ${to}`,
} as const;
