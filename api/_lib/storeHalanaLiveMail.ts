/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import { buildStoreMailHtml, sendStoreResendEmail } from './storeMailIconLayout.js';

export async function sendHalanaLiveLinksEmail(input: {
  to: string;
  name: string;
  shopUrl: string;
  deskUrl: string;
}): Promise<boolean> {
  return sendStoreResendEmail({
    to: input.to,
    subject: 'روابط تشغيل حلانا1 — نسخة خاصة',
    html: buildStoreMailHtml({
      theme: 'kitchen',
      kickerAr: 'حلانا1 — نسخة تشغيل خاصة',
      titleAr: `نسخة ${input.name}`,
      leadAr: 'الأولى معرض أعمالك توجّهين إليه العميلات. الثانية لوحة التشغيل. النسخة غير معلنة في المتجر.',
      iconRows: [
        [
          {
            href: input.shopUrl,
            markAr: 'ح',
            titleAr: 'حلانا1',
            captionAr: 'معرض الأعمال',
            theme: 'kitchen',
          },
          {
            href: input.deskUrl,
            markAr: 'ل',
            titleAr: 'حلانا1',
            captionAr: 'لوحة التشغيل',
            theme: 'kitchen',
          },
        ],
      ],
      notesAr: ['لا ميسر على طلب العميلة. العربون صورة تحويل ثم تأكيد من اللوحة.'],
    }),
  });
}
