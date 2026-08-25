/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import {
  buildStoreAffiliateMagicHtml,
  sendStoreResendEmail,
  storeAffiliateCheckoutLinks,
  type StoreAffiliateCheckoutLinks,
} from './storeMailIconLayout.js';

export async function sendStoreAffiliateMagicEmail(input: {
  to: string;
  loginUrl: string;
  productLinks?: StoreAffiliateCheckoutLinks;
  code?: string;
}): Promise<boolean> {
  const productLinks = input.productLinks ?? storeAffiliateCheckoutLinks(input.code);
  return sendStoreResendEmail({
    to: input.to,
    subject: 'دخول اللوحة وروابط منتجات المتجر — خريطة الحل',
    html: buildStoreAffiliateMagicHtml({
      loginUrl: input.loginUrl,
      productLinks,
    }),
  });
}
