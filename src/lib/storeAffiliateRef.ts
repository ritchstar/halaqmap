/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * رمز المسوّق من رابط الشراء. يُحفظ على الجهاز حتى إتمام الفاتورة.
 */
import { readHashQueryParam } from '@/lib/hashQueryParams';

const KEY = 'store-affiliate-ref';

export function parseStoreAffiliateRef(raw: string | null | undefined): string {
  const value = String(raw || '')
    .trim()
    .toLowerCase();
  return /^[a-z0-9]{8,12}$/.test(value) ? value : '';
}

export function rememberStoreAffiliateRef(): string {
  if (typeof window === 'undefined') return '';
  const incoming = parseStoreAffiliateRef(readHashQueryParam('ref'));
  if (incoming) {
    window.sessionStorage.setItem(KEY, incoming);
    return incoming;
  }
  return parseStoreAffiliateRef(window.sessionStorage.getItem(KEY));
}
