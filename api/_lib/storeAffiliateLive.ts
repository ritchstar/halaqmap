/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * قيد عمولة منتجات المتجر: مبلغ ثابت من حصة المنصة بعد سداد ميسر.
 */
export type StoreAffiliateMatch = {
  lineId: string;
  commissionHalalas: number;
};

export function matchStoreAffiliateCommission(
  productTag: string,
  amountHalalas: number,
): StoreAffiliateMatch | null {
  const tag = String(productTag || '')
    .trim()
    .toLowerCase();
  const amount = Math.trunc(Number(amountHalalas) || 0);
  if (tag === 'store_occasion_card') return null;
  if (tag === 'store_wedding_live' && amount === 89900) {
    return { lineId: 'wedding', commissionHalalas: 9900 };
  }
  if (tag === 'store_event_live' && amount === 89900) {
    return { lineId: 'event', commissionHalalas: 9900 };
  }
  if (tag === 'store_lounge_live' && amount === 60000) {
    return { lineId: 'lounge', commissionHalalas: 10000 };
  }
  if (tag === 'store_grocers_live') {
    if (amount === 59900) return { lineId: 'grocers_6', commissionHalalas: 9900 };
    if (amount === 89900) return { lineId: 'grocers_12', commissionHalalas: 19900 };
    if (amount === 89800) return { lineId: 'grocers_chat_6', commissionHalalas: 19700 };
    if (amount === 139800) return { lineId: 'grocers_chat_12', commissionHalalas: 39800 };
  }
  if (tag === 'store_restaurant_live') {
    if (amount === 69900) return { lineId: 'restaurant_6', commissionHalalas: 9900 };
    if (amount === 99900) return { lineId: 'restaurant_12', commissionHalalas: 19900 };
  }
  return null;
}
