/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 * هوية متجر خريطة الحل — صفحات نية المنتجات على www، لا شعار حلاق ماب.
 */
export const STORE_BRAND_NAME_AR = 'خريطة الحل';
export const STORE_BRAND_NAME_EN = 'halaqmap';
export const STORE_SITE_NAME = 'خريطة الحل';
export const STORE_LOGO_PATH = '/images/halaqmap-store-mark-radar-square-1200x1200.png';
export const STORE_LOGO_ALT = 'شعار خريطة الحل — halaqmap';
/** يُرفع عند كل تحديث شعار المتجر لكسر كاش Google وCDN */
export const STORE_ICON_VERSION = '20260906';
export const STORE_LOGO_ABS_WWW = `https://www.halaqmap.com${STORE_LOGO_PATH}`;

export function storeLogoImgHtml({ width = 56, height = 56, className = '' } = {}) {
  const v = STORE_ICON_VERSION;
  const cls = className ? ` class="${className}"` : '';
  return `<img src="${STORE_LOGO_PATH}?v=${v}" width="${width}" height="${height}" alt="${STORE_LOGO_ALT}" decoding="async" fetchpriority="high"${cls} />`;
}
