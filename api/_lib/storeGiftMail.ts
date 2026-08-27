/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import { buildStoreMailHtml, sendStoreResendEmail } from './storeMailIconLayout.js';

export async function sendGiftConfirmEmail(input: { to: string; confirmUrl: string }): Promise<boolean> {
  const html = buildStoreMailHtml({
    theme: 'wedding',
    kickerAr: 'هدية خريطة الحل',
    titleAr: 'أكّد بريدك لإتمام المشاركة',
    leadAr: 'اضغط الأيقونة لتأكيد البريد. لا تُحتسب المشاركة في السحب التقني إلا بعد التأكيد.',
    iconRows: [
      [
        {
          href: input.confirmUrl,
          markAr: 'ه',
          titleAr: 'تأكيد البريد',
          captionAr: 'هدية خريطة الحل',
          theme: 'wedding',
        },
      ],
    ],
    notesAr: ['إن لم تطلب المشاركة فتجاهل هذه الرسالة.'],
  });
  return sendStoreResendEmail({
    to: input.to,
    subject: 'تأكيد المشاركة في هدية خريطة الحل',
    html,
  });
}
