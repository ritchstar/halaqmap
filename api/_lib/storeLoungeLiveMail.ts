/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
export async function sendLoungeLiveLinksEmail(input: {
  to: string;
  displayUrl: string;
  guestUrl: string;
  hostUrl: string;
  expiresLabel: string;
  renewed?: boolean;
}): Promise<boolean> {
  const apiKey = (process.env.RESEND_API_KEY || '').trim();
  const from = (process.env.RESEND_FROM_EMAIL || '').trim();
  if (!apiKey || !from) return false;
  const lead = input.renewed
    ? 'تم تمديد تشغيل لاونجا1 ثلاثة أشهر أخرى. الروابط نفسها لم تتغير.'
    : 'وصل تشغيل لاونجا1 من متجر halaqmap — خريطة الحل.';
  const html = `
<div dir="rtl" style="font-family:Tajawal,Arial,sans-serif;line-height:1.8">
<p>${lead}</p>
<p>احتفظ بهذه الروابط:</p>
<p>شاشة اللاونج<br/><a href="${input.displayUrl}">${input.displayUrl}</a></p>
<p>رابط الزبون<br/><a href="${input.guestUrl}">${input.guestUrl}</a></p>
<p>لوحة المضيف<br/><a href="${input.hostUrl}">${input.hostUrl}</a></p>
<p>تنتهي مدة التشغيل في ${input.expiresLabel}. بعد انتهائها تبقى الروابط وتحيلكم إلى صفحة المنتج لإعادة الشراء على نفس الشاشة.</p>
</div>`;
  const resp = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [input.to],
      subject: input.renewed
        ? 'تمديد لاونجا1 ثلاثة أشهر — خريطة الحل'
        : 'روابط لاونجا1 — تشغيل شاشات اللاونج — خريطة الحل',
      html,
    }),
  });
  return resp.ok;
}
