/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import { buildRestaurantLiveLinksHtml, sendStoreResendEmail } from './storeMailIconLayout.js';

export async function sendRestaurantLiveLinksEmail(input: {
  to: string;
  shopUrl: string;
  deskUrl: string;
  expiresLabel: string;
  renewed?: boolean;
}): Promise<boolean> {
  return sendStoreResendEmail({
    to: input.to,
    subject: input.renewed ? 'تمديد مطعمنا1 — خريطة الحل' : 'روابط مطعمنا1 — خريطة الحل',
    html: buildRestaurantLiveLinksHtml(input),
  });
}
