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
    subject: 'روابط تشغيل حلانا1 — خريطة الحل',
    html: buildStoreMailHtml({
      theme: 'halana',
      kickerAr: 'حلانا1 — روابط التشغيل',
      titleAr: `نسخة ${input.name}`,
      leadAr: 'الأولى معرض أعمالك توجّهين إليه العميلات. الثانية لوحة التشغيل.',
      iconRows: [
        [
          {
            href: input.shopUrl,
            markAr: 'ح',
            titleAr: 'حلانا1',
            captionAr: 'معرض الأعمال',
            theme: 'halana',
          },
          {
            href: input.deskUrl,
            markAr: 'ل',
            titleAr: 'حلانا1',
            captionAr: 'لوحة التشغيل',
            theme: 'halana',
          },
        ],
      ],
      notesAr: ['لا ميسر على طلب العميلة. العربون صورة تحويل ثم تأكيد من اللوحة.'],
    }),
  });
}
