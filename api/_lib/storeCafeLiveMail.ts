/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import { buildCafeLiveLinksHtml, sendStoreResendEmail } from './storeMailIconLayout.js';

export async function sendCafeLiveLinksEmail(input: {
  to: string;
  shopUrl: string;
  deskUrl: string;
  displayUrl: string;
  quietUrl: string;
  menuUrl: string;
  guestUrl: string;
  hostUrl: string;
  expiresLabel: string;
  renewed?: boolean;
}): Promise<boolean> {
  return sendStoreResendEmail({
    to: input.to,
    subject: input.renewed ? 'تمديد كافينا1 — خريطة الحل' : 'روابط كافينا1 — خريطة الحل',
    html: buildCafeLiveLinksHtml(input),
  });
}
