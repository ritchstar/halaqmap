/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import { buildKitchenLiveLinksHtml, sendStoreResendEmail } from './storeMailIconLayout.js';

export async function sendKitchenLiveLinksEmail(input: {
  to: string;
  shopUrl: string;
  deskUrl: string;
  expiresLabel: string;
  renewed?: boolean;
  gift?: boolean;
}): Promise<boolean> {
  return sendStoreResendEmail({
    to: input.to,
    subject: input.gift
      ? 'هدية طبختنا1 — روابط التشغيل'
      : input.renewed
        ? 'تمديد طبختنا1 — خريطة الحل'
        : 'روابط طبختنا1 — خريطة الحل',
    html: buildKitchenLiveLinksHtml(input),
  });
}
