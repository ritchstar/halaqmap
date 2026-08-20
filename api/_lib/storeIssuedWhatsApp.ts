/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
export async function sendStoreIssuedWhatsApp(phoneE164Plus: string, body: string): Promise<
  | { ok: true }
  | { ok: false; error: string }
> {
  const sid = (process.env.TWILIO_ACCOUNT_SID || '').trim();
  const token = (process.env.TWILIO_AUTH_TOKEN || '').trim();
  const from = (process.env.TWILIO_WHATSAPP_FROM || '').trim();
  if (!sid || !token || !from) {
    return { ok: false, error: 'تعذر إرسال رمز التحقق الآن. أعد المحاولة أو راسل الإدارة.' };
  }
  const endpoint = `https://api.twilio.com/2010-04-01/Accounts/${encodeURIComponent(sid)}/Messages.json`;
  const basic = Buffer.from(`${sid}:${token}`, 'utf8').toString('base64');
  const form = new URLSearchParams();
  form.set('From', from);
  form.set('To', `whatsapp:${phoneE164Plus}`);
  form.set('Body', body);
  const resp = await fetch(endpoint, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basic}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: form.toString(),
  });
  if (!resp.ok) {
    return { ok: false, error: 'تعذر إرسال الرسالة إلى الجوال الموثّق.' };
  }
  return { ok: true };
}
