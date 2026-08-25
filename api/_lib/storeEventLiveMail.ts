/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import { buildEventLiveLinksHtml, sendStoreResendEmail } from './storeMailIconLayout.js';

export async function sendEventLiveLinksEmail(input: {
  to: string;
  displayUrl: string;
  guestUrl: string;
  hostUrl: string;
  expiresLabel: string;
}): Promise<boolean> {
  void input.guestUrl;
  return sendStoreResendEmail({
    to: input.to,
    subject: 'روابط الدعوة الحرة التفاعلية — خريطة الحل',
    html: buildEventLiveLinksHtml({
      displayUrl: input.displayUrl,
      hostUrl: input.hostUrl,
      expiresLabel: input.expiresLabel,
    }),
  });
}
