/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
export type ShopBackgroundFields = {
  shopHeaderBg: string;
  shopPageBg: string;
};

// صور الخلفية (base64) أكبر بكثير من الشعار عادةً — قصّها عند 2400 حرفاً (الحد
// القديم) كان يُتلف بيانات الصورة نفسها بدل رفضها بوضوح. أي حد أعلى يكفي صورة
// مضغوطة بعرض 1200px تقريباً، بنفس روح STORE_HALANA_IMAGE_MAX_CHARS.
export const STORE_SHOP_BACKGROUND_IMAGE_MAX_CHARS = 200_000;

export function sanitizeShopBackground(raw: unknown, maxLen = 2400): string {
  const v = String(raw ?? '').trim();
  if (!v) return '';
  if (/^#[0-9a-fA-F]{3,8}$/.test(v)) return v.slice(0, maxLen);
  if (v.startsWith('linear-gradient(') || v.startsWith('radial-gradient(')) return v.slice(0, 600);
  if (v.startsWith('data:image/')) return v.slice(0, STORE_SHOP_BACKGROUND_IMAGE_MAX_CHARS);
  if (v.startsWith('https://')) return v.slice(0, 500);
  return '';
}

export function parseShopBackgroundFields(
  payload: Record<string, unknown> | null | undefined,
  fallback: ShopBackgroundFields = { shopHeaderBg: '', shopPageBg: '' },
): ShopBackgroundFields {
  const base = payload && typeof payload === 'object' ? payload : {};
  return {
    shopHeaderBg: sanitizeShopBackground(base.shopHeaderBg ?? fallback.shopHeaderBg),
    shopPageBg: sanitizeShopBackground(base.shopPageBg ?? fallback.shopPageBg),
  };
}

export function parseShopBackgroundSave(
  body: Record<string, unknown>,
  current: ShopBackgroundFields,
): ShopBackgroundFields {
  return {
    shopHeaderBg: sanitizeShopBackground(body.shopHeaderBg ?? current.shopHeaderBg),
    shopPageBg: sanitizeShopBackground(body.shopPageBg ?? current.shopPageBg),
  };
}
