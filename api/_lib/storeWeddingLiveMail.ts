/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import { buildWeddingLiveLinksHtml, sendStoreResendEmail } from './storeMailIconLayout.js';

export async function sendWeddingLiveLinksEmail(input: {
  to: string;
  displayUrl: string;
  guestUrl: string;
  hostUrl: string;
  expiresLabel: string;
}): Promise<boolean> {
  void input.guestUrl;
  return sendStoreResendEmail({
    to: input.to,
    subject: 'روابط دعوة الزواج التفاعلية — خريطة الحل',
    html: buildWeddingLiveLinksHtml({
      displayUrl: input.displayUrl,
      hostUrl: input.hostUrl,
      expiresLabel: input.expiresLabel,
    }),
  });
}
