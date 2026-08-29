/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import { buildProduceLiveLinksHtml, sendStoreResendEmail } from './storeMailIconLayout.js';

export async function sendProduceLiveLinksEmail(input: {
  to: string;
  shopUrl: string;
  deskUrl: string;
  expiresLabel: string;
  renewed?: boolean;
}): Promise<boolean> {
  return sendStoreResendEmail({
    to: input.to,
    subject: input.renewed ? 'تمديد خضارنا1 — خريطة الحل' : 'روابط خضارنا1 — خريطة الحل',
    html: buildProduceLiveLinksHtml(input),
  });
}
