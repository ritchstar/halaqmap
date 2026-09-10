/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import { buildDatesLiveLinksHtml, sendStoreResendEmail } from './storeMailIconLayout.js';

export async function sendDatesLiveLinksEmail(input: {
  to: string;
  shopUrl: string;
  deskUrl: string;
  expiresLabel: string;
  renewed?: boolean;
}): Promise<boolean> {
  return sendStoreResendEmail({
    to: input.to,
    subject: input.renewed ? 'تمديد تمرتنا1 — خريطة الحل' : 'روابط تمرتنا1 — خريطة الحل',
    html: buildDatesLiveLinksHtml(input),
  });
}
