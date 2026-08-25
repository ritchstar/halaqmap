/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import { buildLoungeLiveLinksHtml, sendStoreResendEmail } from './storeMailIconLayout.js';

export async function sendLoungeLiveLinksEmail(input: {
  to: string;
  displayUrl: string;
  guestUrl: string;
  hostUrl: string;
  expiresLabel: string;
  renewed?: boolean;
}): Promise<boolean> {
  return sendStoreResendEmail({
    to: input.to,
    subject: input.renewed
      ? 'تمديد لاونجا1 ثلاثة أشهر — خريطة الحل'
      : 'روابط لاونجا1 — تشغيل شاشات اللاونج — خريطة الحل',
    html: buildLoungeLiveLinksHtml(input),
  });
}
