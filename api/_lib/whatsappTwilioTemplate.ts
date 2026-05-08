/**
 * Twilio WhatsApp Template (Draft)
 * --------------------------------
 * هذا الملف جاهز للإرسال عبر Twilio WhatsApp Cloud:
 * - يحتاج فقط ضبط:
 *   TWILIO_ACCOUNT_SID
 *   TWILIO_AUTH_TOKEN
 *   TWILIO_WHATSAPP_FROM  (مثال: whatsapp:+14155238886)
 */

export type TwilioWhatsAppTemplateInput = {
  barberName: string;
  tierLabelAr: string;
  platformStartUrl: string;
  toPhoneE164: string; // مثال: +9665XXXXXXXX
};

export type TwilioWhatsAppTemplateResult =
  | { ok: true; messageSid: string }
  | { ok: false; error: string };

function normalizePhoneE164(raw: string): string {
  const value = String(raw || '').trim().replace(/\s+/g, '');
  if (!value) return '';
  if (value.startsWith('+')) return value;
  if (value.startsWith('00')) return `+${value.slice(2)}`;
  if (value.startsWith('0')) return `+966${value.slice(1)}`;
  if (/^\d+$/.test(value)) return `+${value}`;
  return value;
}

function templateText(input: TwilioWhatsAppTemplateInput): string {
  return [
    `أهلًا ${input.barberName} 👋`,
    '',
    'تم تأكيد اشتراكك بنجاح في منصة حلاق ماب.',
    `نوع الباقة: ${input.tierLabelAr}`,
    '',
    'ابدأ الآن من الرابط التالي:',
    input.platformStartUrl,
    '',
    'نتمنى لك تجربة موفقة 🌟',
    'فريق حلاق ماب',
  ].join('\n');
}

/**
 * إرسال رسالة واتساب عبر Twilio (Draft جاهز للتفعيل).
 * - لا يعمل حتى يتم ضبط مفاتيح Twilio في البيئة.
 */
export async function sendTwilioWhatsAppTemplate(
  input: TwilioWhatsAppTemplateInput,
): Promise<TwilioWhatsAppTemplateResult> {
  const accountSid = (process.env.TWILIO_ACCOUNT_SID || '').trim();
  const authToken = (process.env.TWILIO_AUTH_TOKEN || '').trim();
  const fromWhatsApp = (process.env.TWILIO_WHATSAPP_FROM || '').trim(); // whatsapp:+14155238886

  if (!accountSid || !authToken || !fromWhatsApp) {
    return {
      ok: false,
      error:
        'Twilio is not configured yet. Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_WHATSAPP_FROM.',
    };
  }

  const toPhone = normalizePhoneE164(input.toPhoneE164);
  if (!toPhone.startsWith('+')) {
    return { ok: false, error: 'Invalid toPhoneE164. Provide a valid E.164 phone number.' };
  }

  const endpoint = `https://api.twilio.com/2010-04-01/Accounts/${encodeURIComponent(accountSid)}/Messages.json`;
  const basic = Buffer.from(`${accountSid}:${authToken}`, 'utf8').toString('base64');
  const form = new URLSearchParams();
  form.set('From', fromWhatsApp);
  form.set('To', `whatsapp:${toPhone}`);
  form.set('Body', templateText(input));

  try {
    const resp = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${basic}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: form.toString(),
    });

    const raw = await resp.text();
    if (!resp.ok) {
      return { ok: false, error: raw.slice(0, 500) || 'Twilio request failed.' };
    }

    let sid = 'twilio_sent';
    try {
      const parsed = JSON.parse(raw) as { sid?: string };
      if (parsed.sid) sid = parsed.sid;
    } catch {
      // ignore JSON parse issues
    }

    return { ok: true, messageSid: sid };
  } catch {
    return { ok: false, error: 'Network error while calling Twilio API.' };
  }
}

