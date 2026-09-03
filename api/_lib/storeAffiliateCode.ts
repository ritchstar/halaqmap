/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * رمز المسوّق على فاتورة ميسر — لا كاردي8.
 */
export function parseStoreAffiliateCode(raw: unknown): string {
  const value = String(raw ?? '')
    .trim()
    .toLowerCase();
  if (!/^[a-z0-9]{8,12}$/.test(value)) return '';
  return value;
}

export function withStoreAffiliateCode(
  meta: Record<string, string>,
  raw: unknown,
): Record<string, string> {
  const code = parseStoreAffiliateCode(raw);
  if (!code) return meta;
  return { ...meta, store_affiliate_code: code };
}

export function storeAffiliateCodeFromMeta(meta: Record<string, unknown> | null | undefined): string {
  if (!meta || typeof meta !== 'object') return '';
  return parseStoreAffiliateCode(meta.store_affiliate_code ?? meta.storeAffiliateCode);
}

export type StoreAffiliateCheckoutLinks = {
  wedding: string;
  event: string;
  lounge: string;
  grocers: string;
  restaurant: string;
  cafe: string;
  kitchen: string;
  produce: string;
  halana: string;
};

/** روابط شراء منتجات المتجر باسم المسوّق — ليست كاردي8. */
export function storeAffiliateCheckoutLinks(rawCode: unknown): StoreAffiliateCheckoutLinks {
  const code = parseStoreAffiliateCode(rawCode);
  const q = code ? `?ref=${code}` : '';
  return {
    wedding: `https://www.halaqmap.com/#/store/wedding${q}`,
    event: `https://www.halaqmap.com/#/store/event${q}`,
    lounge: `https://www.halaqmap.com/#/store/lounge${q}`,
    grocers: `https://www.halaqmap.com/#/store/grocers${q}`,
    restaurant: `https://www.halaqmap.com/#/store/restaurant${q}`,
    cafe: `https://www.halaqmap.com/#/store/cafe${q}`,
    kitchen: `https://www.halaqmap.com/#/store/kitchen${q}`,
    produce: `https://www.halaqmap.com/#/store/produce${q}`,
    halana: `https://www.halaqmap.com/#/store/halana${q}`,
  };
}
