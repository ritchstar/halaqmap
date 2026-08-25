/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * لوحة QR لواجهة متجر خريطة الحل — عرض على الجوال وتحميل PNG.
 * لا تُستورد من App.tsx؛ تُحمَّل كسولاً مع صفحة اللوحة فقط.
 */
import { ROUTE_PATHS } from '@/lib/routePaths';
import {
  STORE_BRAND_LATIN,
  STORE_ORIGIN,
  STORE_PUBLIC_NAME_AR,
  STORE_SATELLITE_HOST,
} from '@/config/storeFront';

export { STORE_BRAND_LATIN, STORE_PUBLIC_NAME_AR, STORE_SATELLITE_HOST };

const STORE_LANDING_PATH =
  (ROUTE_PATHS as { STORE_LANDING?: string }).STORE_LANDING || '/store';

export const STORE_QR_BOARD_COPY = {
  documentTitle: `لوحة QR — ${STORE_PUBLIC_NAME_AR}`,
  kickerAr: 'امسح للدخول',
  brandLatin: STORE_BRAND_LATIN,
  brandAr: STORE_PUBLIC_NAME_AR,
  headlineAr: 'واجهة متجر خريطة الحل',
  leadAr: 'منتجات برمجية جاهزة للتفعيل — كاردي8، افراحي1، اجواء1، لاونجا1، تمويناتا1، ومطعمنا1.',
  hostLine: STORE_SATELLITE_HOST,
  verifiedAr: 'رابط موثّق لواجهة المتجر',
  downloadAr: 'تحميل اللوحة',
  downloadingAr: 'جارٍ التحضير…',
  downloadDoneAr: 'تم التحميل',
  downloadFailAr: 'تعذّر تحميل اللوحة',
  copyAr: 'نسخ الرابط',
  copiedAr: 'تم النسخ',
  copyFailAr: 'تعذّر النسخ من المتصفح',
  hintAr: 'افتح اللوحة على الآيفون واعرضها للعميل، أو حمّلها كصورة للمشاركة والطباعة.',
  fileName: 'halaqmap-store-qr-board.png',
} as const;

/** ألوان QR للمسح الآمن — كحلي على كريمي مع إطار ذهبي. */
export const STORE_QR_BOARD_COLORS = {
  navy: '#061018',
  navyMid: '#0c1a2e',
  cream: '#f4efe4',
  gold: '#e8c547',
  bronze: '#b8860b',
  qrDark: '#061018',
  qrLight: '#f4efe4',
} as const;

/** أصل الواجهة عند العرض على نطاق المتجر أو النطاق الأم. */
export function storeQrBoardOrigin(): string {
  if (typeof window === 'undefined') return STORE_ORIGIN;
  const host = window.location.hostname.toLowerCase();
  if (host === STORE_SATELLITE_HOST || host.endsWith('.halaqmap.com')) {
    return window.location.origin.replace(/\/+$/, '');
  }
  return STORE_ORIGIN;
}

/** رابط المسح — واجهة المتجر مع وسم تتبّع للحملة الميدانية. */
export function storeQrBoardTargetUrl(): string {
  const origin = storeQrBoardOrigin();
  return `${origin}/#${STORE_LANDING_PATH}?utm_source=store_qr&utm_medium=board&utm_campaign=store_qr_board`;
}
