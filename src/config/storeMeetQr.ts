/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * رمز مقابلة متجر خريطة الحل — يُحمَّل مع صفحة العرض، لا يُستورد من App.
 * الهدف دائماً نطاق المتجر بلا هاش.
 */
import { ROUTE_PATHS } from '@/lib/routePaths';
import {
  STORE_BRAND_LATIN,
  STORE_ORIGIN,
  STORE_PUBLIC_NAME_AR,
  STORE_SATELLITE_HOST,
} from '@/config/storeFront';
import { STORE_INTRO_CARD_SECTORS } from '@/config/storeIntroCardCopy';

export const STORE_MEET_QR_TARGET_URL = `${STORE_ORIGIN}${ROUTE_PATHS.STORE_LANDING}` as const;

export function storeMeetQrTargetUrl(): string {
  return STORE_MEET_QR_TARGET_URL;
}

export const STORE_MEET_QR_COPY = {
  documentTitle: 'رمز خريطة الحل',
  kickerAr: 'للعرض من الآيفون أثناء المقابلة',
  titleAr: STORE_PUBLIC_NAME_AR,
  latinMark: STORE_BRAND_LATIN,
  scanHintAr: 'امسح الرمز لدخول واجهة خريطة الحل',
  hostLine: `${STORE_SATELLITE_HOST}/store`,
  presentCtaAr: 'وضع العرض',
  presentExitAr: 'إغلاق العرض',
  presentTapAr: 'اضغط الشاشة لإظهار الأدوات',
  saveCtaAr: 'حفظ في الصور',
  savingAr: 'جاري التجهيز…',
  saveOkAr: 'جهّز الصورة. احفظها في الصور من قائمة الجهاز.',
  saveFailAr: 'تعذّر التجهيز. أعد المحاولة من المتصفح.',
  leadAr:
    'افتح هذه الصفحة على الآيفون ثم اضغط وضع العرض أمام العميل. المسح يفتح واجهة خريطة الحل على نطاقه بلا هاش.',
  landingDoorTitleAr: 'رمز المقابلة على الآيفون',
  landingDoorLeadAr:
    'لوحة بستايل خريطة الحل لعرضها من الجوال أثناء المقابلة. المسح يدخل الواجهة بلا هاش.',
  landingDoorCtaAr: 'افتح رمز المقابلة',
} as const;

export const STORE_MEET_QR_SECTORS = STORE_INTRO_CARD_SECTORS;

export { STORE_BRAND_LATIN, STORE_PUBLIC_NAME_AR, STORE_SATELLITE_HOST, STORE_ORIGIN };
