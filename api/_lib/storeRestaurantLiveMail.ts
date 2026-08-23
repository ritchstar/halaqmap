/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
export async function sendRestaurantLiveLinksEmail(input: {
  to: string;
  shopUrl: string;
  deskUrl: string;
  expiresLabel: string;
  renewed?: boolean;
}): Promise<boolean> {
  const apiKey = (process.env.RESEND_API_KEY || '').trim();
  const from = (process.env.RESEND_FROM_EMAIL || '').trim();
  if (!apiKey || !from) return false;
  const lead = input.renewed
    ? 'تم تمديد صفحة المطعم. الروابط نفسها لم تتغير.'
    : 'وصلت صفحة المطعم من متجر halaqmap — خريطة الحل.';
  const html = `
<div dir="rtl" style="font-family:Tajawal,Arial,sans-serif;line-height:1.8">
<p>${lead}</p>
<p>احتفظ بهذه الروابط:</p>
<p>صفحة ضيف الحي<br/><a href="${input.shopUrl}">${input.shopUrl}</a></p>
<p>لوحة المطبخ<br/><a href="${input.deskUrl}">${input.deskUrl}</a></p>
<p>تنتهي المدة في ${input.expiresLabel}. بعد انتهائها تبقى الروابط وتحيلكم لإعادة الشراء على نفس الصفحة.</p>
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
      subject: input.renewed ? 'تمديد مطعمنا1 — خريطة الحل' : 'روابط مطعمنا1 — خريطة الحل',
      html,
    }),
  });
  return resp.ok;
}
