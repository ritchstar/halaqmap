/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import { buildGrocersLiveLinksHtml, sendStoreResendEmail } from './storeMailIconLayout.js';

export async function sendGrocersLiveLinksEmail(input: {
  to: string;
  shopUrl: string;
  deskUrl: string;
  expiresLabel: string;
  renewed?: boolean;
}): Promise<boolean> {
  return sendStoreResendEmail({
    to: input.to,
    subject: input.renewed ? 'تمديد تموينات الحي — خريطة الحل' : 'روابط تموينات الحي — خريطة الحل',
    html: buildGrocersLiveLinksHtml(input),
  });
}
