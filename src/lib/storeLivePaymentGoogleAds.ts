/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * إطلاق تحويل Google Ads «عملية شراء» بعد تفعيل ميسر ثم التوجيه.
 */
import { trackGoogleAdsStorePurchase } from '@/lib/googleAdsTag';

export function completeStoreLivePaymentAndGo(input: {
  paymentId: string;
  priceHalalas: number;
  product: string;
  href: string;
}): void {
  const paymentId = input.paymentId.trim();
  if (paymentId && input.priceHalalas > 0) {
    trackGoogleAdsStorePurchase({
      transactionId: paymentId,
      valueHalalas: input.priceHalalas,
      product: input.product,
    });
  }
  window.location.replace(input.href);
}
