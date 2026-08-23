/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
export async function sendStoreAffiliateMagicEmail(input: {
  to: string;
  loginUrl: string;
}): Promise<boolean> {
  const apiKey = (process.env.RESEND_API_KEY || '').trim();
  const from = (process.env.RESEND_FROM_EMAIL || '').trim();
  if (!apiKey || !from) return false;
  const html = `
<div dir="rtl" style="font-family:Tajawal,Arial,sans-serif;line-height:1.8">
<p>رابط دخول سري إلى لوحة التسويق بالعمولة في خريطة الحل.</p>
<p>افتح الرابط من جهازك. إن تم الشراء من روابطك تُقيَّد عمولتك الثابتة فقط من حصة المنصة.</p>
<p><a href="${input.loginUrl}">${input.loginUrl}</a></p>
<p>الرابط لمرة واحدة وينتهي بعد ثلاثين دقيقة.</p>
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
      subject: 'رابط دخول لوحة التسويق بالعمولة — خريطة الحل',
      html,
    }),
  });
  return resp.ok;
}
