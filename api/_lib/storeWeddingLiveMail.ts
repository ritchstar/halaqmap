/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
export async function sendWeddingLiveLinksEmail(input: {
  to: string;
  displayUrl: string;
  guestUrl: string;
  hostUrl: string;
  expiresLabel: string;
}): Promise<boolean> {
  const apiKey = (process.env.RESEND_API_KEY || '').trim();
  const from = (process.env.RESEND_FROM_EMAIL || '').trim();
  if (!apiKey || !from) return false;
  const html = `
<div dir="rtl" style="font-family:Tajawal,Arial,sans-serif;line-height:1.8">
<p>وصلت دعوة الزواج التفاعلية من متجر halaqmap — خريطة الحل.</p>
<p>احتفظ بهذه الروابط السرية:</p>
<p>شاشة القاعة<br/><a href="${input.displayUrl}">${input.displayUrl}</a></p>
<p>لوحة المضيف — من هنا تصدرون روابط المدعوين<br/><a href="${input.hostUrl}">${input.hostUrl}</a></p>
<p>رابط الضيف العام لا يُفتح وحده. أنشئوا من اللوحة رابطاً لكل مدعو وأرسلوه من جهازكم. إعادة إرساله من مدعو تُحظر.</p>
<p>تنتهي الصفحة في ${input.expiresLabel}. احفظ الأرشيف من لوحة المضيف قبل انتهائها.</p>
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
      subject: 'روابط دعوة الزواج التفاعلية — خريطة الحل',
      html,
    }),
  });
  return resp.ok;
}
