/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import { buildStoreMailHtml, sendStoreResendEmail } from './storeMailIconLayout.js';
import { STORE_LINK_ROLE_EMOJI } from '../../src/config/storeLinkIcons.js';

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
          markAr: STORE_LINK_ROLE_EMOJI.emailConfirm,
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

export async function sendGeneralTrialConfirmReminderEmail(input: {
  to: string;
  confirmUrl: string;
  notMeUrl: string;
}): Promise<boolean> {
  const html = buildStoreMailHtml({
    theme: 'grocers',
    kickerAr: 'تذكير — نظام التجربة العام',
    titleAr: 'بريدك لم يُؤكَّد بعد',
    leadAr:
      'وصلنا طلب تجربة باسم بريدك هذا ولم يُؤكَّد بعد. إن كنت أنت من طلبه فاضغط «نعم، أنا من طلب» لإتمامه. إن لم تكن قد طلبت شيئاً من متجر خريطة الحل إطلاقاً، فاضغط «لا، لم أطلب هذا» لإنهاء الطلب فوراً وحماية بريدك — لا تترك الرسالة دون رد.',
    iconRows: [
      [
        {
          href: input.confirmUrl,
          markAr: STORE_LINK_ROLE_EMOJI.confirmYes,
          titleAr: 'نعم، أنا من طلب',
          captionAr: 'تأكيد البريد وإتمام الطلب',
          theme: 'grocers',
        },
        {
          href: input.notMeUrl,
          markAr: STORE_LINK_ROLE_EMOJI.notMe,
          titleAr: 'لا، لم أطلب هذا',
          captionAr: 'إنهاء الطلب فوراً',
          theme: 'grocers',
        },
      ],
    ],
    notesAr: [
      'إن لم تضغط أي زر، يبقى الطلب معلَّقاً بلا أثر على بريدك — لا اشتراك ولا رسوم بأي حال.',
    ],
  });
  return sendStoreResendEmail({
    to: input.to,
    subject: 'تذكير: هل طلبت تجربة من متجر خريطة الحل؟',
    html,
  });
}
