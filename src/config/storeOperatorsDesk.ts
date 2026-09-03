/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * لوحة مشغّلي خريطة الحل. لا تُستورد من App.
 * بلا شراء وبلا أسعار وبلا تجربة في النصوص.
 */
import { ROUTE_PATHS } from '@/lib/routePaths';

export const STORE_OPERATORS_DESK_PUBLIC_ENABLED = true as const;

export type StoreOperatorProductId =
  | 'kitchen'
  | 'grocers'
  | 'produce'
  | 'restaurant'
  | 'cafe'
  | 'halana'
  | 'lounge';

export const STORE_OPERATOR_PRODUCT_IDS: readonly StoreOperatorProductId[] = [
  'kitchen',
  'grocers',
  'produce',
  'restaurant',
  'cafe',
  'halana',
  'lounge',
] as const;

export const STORE_OPERATOR_PRODUCTS: Record<
  StoreOperatorProductId,
  { titleAr: string; markAr: string; accent: string; openAr: string }
> = {
  kitchen: { titleAr: 'طبختنا1', markAr: 'ط', accent: '#b45a3c', openAr: 'افتح لوحة النشاط' },
  grocers: { titleAr: 'تمويناتا1', markAr: 'ت', accent: '#8fbf7a', openAr: 'افتح لوحة الكاشير' },
  produce: { titleAr: 'خضارنا1', markAr: 'خ', accent: '#3d8b4a', openAr: 'افتح لوحة الصندوق' },
  restaurant: { titleAr: 'مطعمنا1', markAr: 'م', accent: '#e08a3c', openAr: 'افتح لوحة المطبخ' },
  cafe: { titleAr: 'كافينا1', markAr: 'ك', accent: '#c48a4a', openAr: 'افتح لوحة الكاشير' },
  halana: { titleAr: 'حلانا1', markAr: 'ح', accent: '#c45c7a', openAr: 'افتح لوحة المتخصصة' },
  lounge: { titleAr: 'لاونجا1', markAr: 'ل', accent: '#d4a574', openAr: 'افتح لوحة المضيف' },
};

export const STORE_OPERATORS_DESK_COPY = {
  documentTitle: 'لوحة مشغّلي خريطة الحل',
  kickerAr: 'للمشغّل فقط',
  titleAr: 'لوحة مشغّلي خريطة الحل',
  leadAr: 'أدخل بريد التشغيل المعتمد. إن طابق بريداً مرتبطاً بلوحة، يصلك رمز من ستة أرقام.',
  emailLabelAr: 'بريد التشغيل',
  sendCodeAr: 'أرسل رمز التحقق',
  codeLabelAr: 'رمز التحقق',
  codeHintAr: 'ستة أرقام من رسالة البريد.',
  verifyAr: 'ادخل إلى اللوحة',
  sentAr: 'إن كان البريد معتمداً فسيصل الرمز خلال لحظات.',
  emptyAr: 'لا تشغيل مرتبط بهذا البريد الآن.',
  expiredAr: 'التشغيل غير متاح الآن.',
  storeHomeAr: 'خريطة الحل',
  storeHomeLeadAr: 'العودة إلى واجهة خريطة الحل.',
  logoutAr: 'خروج',
  sessionExpiredAr: 'انتهت الجلسة. أدخل البريد من جديد.',
  tilesTitleAr: 'تشغيلاتك',
  tilesLeadAr: 'افتح اللوحة التي تديرها. الزبون يبقى على صفحة الويب في متصفحه.',
  footerNavAr: 'لوحة المشغّلين',
} as const;

export const STORE_OPERATORS_STORE_HOME = ROUTE_PATHS.STORE_LANDING;
