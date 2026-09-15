/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import { buildBakhurnaLiveLinksHtml, sendStoreResendEmail } from './storeMailIconLayout.js';

export async function sendBakhurnaLiveLinksEmail(input: {
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
      ? 'هدية بخورنا1 — روابط التشغيل'
      : input.renewed
        ? 'تمديد بخورنا1 — خريطة الحل'
        : 'روابط بخورنا1 — خريطة الحل',
    html: buildBakhurnaLiveLinksHtml(input),
  });
}
