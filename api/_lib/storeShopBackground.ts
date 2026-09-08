/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
export type ShopBackgroundFields = {
  shopHeaderBg: string;
  shopPageBg: string;
};

export function sanitizeShopBackground(raw: unknown, maxLen = 2400): string {
  const v = String(raw ?? '').trim().slice(0, maxLen);
  if (!v) return '';
  if (/^#[0-9a-fA-F]{3,8}$/.test(v)) return v;
  if (v.startsWith('linear-gradient(') || v.startsWith('radial-gradient(')) return v.slice(0, 600);
  if (v.startsWith('data:image/')) return v.slice(0, maxLen);
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
