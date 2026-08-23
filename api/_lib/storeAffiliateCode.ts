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
