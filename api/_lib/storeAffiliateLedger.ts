/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * قيد عمولة منتجات المتجر بعد سداد ميسر. لا كاردي8.
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import { parseStoreAffiliateCode } from './storeAffiliateCode.js';
import { matchStoreAffiliateCommission } from './storeAffiliateLive.js';

export async function creditStoreAffiliateLedger(
  db: SupabaseClient,
  input: {
    productTag: string;
    amountHalalas: number;
    paymentId: string;
    affiliateCode?: unknown;
  },
): Promise<boolean> {
  const paymentId = String(input.paymentId || '').trim();
  const code = parseStoreAffiliateCode(input.affiliateCode);
  const tag = String(input.productTag || '')
    .trim()
    .toLowerCase();
  if (!paymentId || !code || tag === 'store_occasion_card') return false;
  const match = matchStoreAffiliateCommission(tag, input.amountHalalas);
  if (!match) return false;
  const { data: marketer } = await db
    .from('store_affiliate_marketers')
    .select('id')
    .eq('code', code)
    .maybeSingle();
  if (!marketer?.id) return false;
  const price = Math.trunc(Number(input.amountHalalas) || 0);
  const { error } = await db.from('store_affiliate_ledger').insert({
    marketer_id: marketer.id,
    moyasar_payment_id: paymentId,
    product_tag: tag,
    line_id: match.lineId,
    price_halalas: price,
    commission_halalas: match.commissionHalalas,
    net_halalas: price - match.commissionHalalas,
  });
  if (!error) return true;
  return error.code === '23505';
}
