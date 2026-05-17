type Provider = 'twilio' | 'meta';

export type WhatsAppDraftInput = {
  phoneE164: string;
  barberName: string;
  tierLabelAr: string;
  paymentId: string;
  amountSar: string;
};

export type WhatsAppDraftResult =
  | { ok: true; enabled: false; reason: string }
  | { ok: true; enabled: true; provider: Provider; messageId: string }
  | { ok: false; enabled: true; provider: Provider; error: string };

function normalizePhone(raw: string): string {
  const p = String(raw || '').trim().replace(/\s+/g, '');
  if (!p) return '';
  if (p.startsWith('+')) return p;
  if (p.startsWith('00')) return `+${p.slice(2)}`;
  if (p.startsWith('0')) return `+966${p.slice(1)}`;
  if (/^\d+$/.test(p)) return `+${p}`;
  return p;
}

function buildMessage(input: WhatsAppDraftInput): string {
  return [
    `أهلًا ${input.barberName}`,
    'تم تأكيد شراء ترخيصك الرقمي لخدمات الإدراج البرمجية في حلاق ماب.',
    `الباقة: ${input.tierLabelAr}`,
    `المبلغ: ${input.amountSar} SAR`,
    `مرجع الدفع: ${input.paymentId}`,
    'تم تفعيل حسابك الآن ويمكنك البدء باستقبال الطلبات.',
  ].join('\n');
}

async function sendViaTwilio(phone: string, body: string): Promise<WhatsAppDraftResult> {
  const sid = (process.env.TWILIO_ACCOUNT_SID || '').trim();
  const token = (process.env.TWILIO_AUTH_TOKEN || '').trim();
  const from = (process.env.TWILIO_WHATSAPP_FROM || '').trim(); // whatsapp:+14155238886
  if (!sid || !token || !from) {
    return { ok: false, enabled: true, provider: 'twilio', error: 'twilio_not_configured' };
  }
  const endpoint = `https://api.twilio.com/2010-04-01/Accounts/${encodeURIComponent(sid)}/Messages.json`;
  const basic = Buffer.from(`${sid}:${token}`, 'utf8').toString('base64');
  const form = new URLSearchParams();
  form.set('From', from);
  form.set('To', `whatsapp:${phone}`);
  form.set('Body', body);

  const resp = await fetch(endpoint, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basic}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: form.toString(),
  });
  const txt = await resp.text();
  if (!resp.ok) {
    return { ok: false, enabled: true, provider: 'twilio', error: txt.slice(0, 400) || 'twilio_failed' };
  }
  let sidOut = 'twilio_sent';
  try {
    const j = JSON.parse(txt) as { sid?: string };
    if (j.sid) sidOut = j.sid;
  } catch {
    // ignore parse
  }
  return { ok: true, enabled: true, provider: 'twilio', messageId: sidOut };
}

async function sendViaMeta(phone: string, body: string): Promise<WhatsAppDraftResult> {
  const token = (process.env.META_WHATSAPP_TOKEN || '').trim();
  const phoneId = (process.env.META_WHATSAPP_PHONE_NUMBER_ID || '').trim();
  if (!token || !phoneId) {
    return { ok: false, enabled: true, provider: 'meta', error: 'meta_not_configured' };
  }
  const endpoint = `https://graph.facebook.com/v20.0/${encodeURIComponent(phoneId)}/messages`;
  const resp = await fetch(endpoint, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to: phone.replace(/^\+/, ''),
      type: 'text',
      text: { preview_url: false, body },
    }),
  });
  const txt = await resp.text();
  if (!resp.ok) {
    return { ok: false, enabled: true, provider: 'meta', error: txt.slice(0, 400) || 'meta_failed' };
  }
  let id = 'meta_sent';
  try {
    const j = JSON.parse(txt) as { messages?: Array<{ id?: string }> };
    if (j.messages?.[0]?.id) id = j.messages[0].id;
  } catch {
    // ignore parse
  }
  return { ok: true, enabled: true, provider: 'meta', messageId: id };
}

export async function sendPaymentSuccessWhatsAppDraft(input: WhatsAppDraftInput): Promise<WhatsAppDraftResult> {
  const enabled = String(process.env.ENABLE_WHATSAPP_PAYMENT_NOTIFICATIONS || 'false')
    .trim()
    .toLowerCase() === 'true';
  if (!enabled) return { ok: true, enabled: false, reason: 'draft_disabled' };

  const phone = normalizePhone(input.phoneE164);
  if (!phone.startsWith('+')) return { ok: false, enabled: true, provider: 'twilio', error: 'invalid_phone' };

  const provider = String(process.env.WHATSAPP_PROVIDER || 'twilio').trim().toLowerCase();
  const body = buildMessage(input);
  if (provider === 'meta') return sendViaMeta(phone, body);
  return sendViaTwilio(phone, body);
}
