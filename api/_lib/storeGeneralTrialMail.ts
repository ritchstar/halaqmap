/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import { buildStoreMailHtml, sendStoreResendEmail } from './storeMailIconLayout.js';

export async function sendGeneralTrialConfirmEmail(input: { to: string; confirmUrl: string }): Promise<boolean> {
  const html = buildStoreMailHtml({
    theme: 'grocers',
    kickerAr: 'نظام التجربة العام',
    titleAr: 'أكّد بريدك لإتمام طلب التجربة',
    leadAr: 'اضغط الأيقونة لتأكيد البريد. بعد التأكيد يدخل الطلب طابور الإدارة، ثم تُرسل روابط التشغيل إن وُوفق.',
    iconRows: [
      [
        {
          href: input.confirmUrl,
          markAr: 'ت',
          titleAr: 'تأكيد البريد',
          captionAr: 'التجربة العامة · ستون يوماً',
          theme: 'grocers',
        },
      ],
    ],
    notesAr: ['إن لم تطلب التجربة فتجاهل هذه الرسالة.'],
  });
  return sendStoreResendEmail({
    to: input.to,
    subject: 'تأكيد طلب التجربة العامة',
    html,
  });
}
