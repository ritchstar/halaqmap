/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import { buildStoreMailHtml, sendStoreResendEmail } from './storeMailIconLayout.js';

export async function sendStoreOperatorOtpEmail(input: { to: string; code: string }): Promise<boolean> {
  const html = buildStoreMailHtml({
    theme: 'affiliate',
    kickerAr: 'لوحة مشغّلي خريطة الحل',
    titleAr: 'رمز الدخول',
    leadAr: 'أدخل هذا الرمز في لوحة المشغّلين. صالح لعشر دقائق. لا تشاركه.',
    iconRows: [],
    notesAr: [input.code],
  });
  return sendStoreResendEmail({
    to: input.to,
    subject: 'رمز لوحة مشغّلي خريطة الحل',
    html,
  });
}
