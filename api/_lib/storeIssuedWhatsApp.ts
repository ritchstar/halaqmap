/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * إرسال رمز بلاغ الوفاة ورابط الإدارة إلى الجوال.
 * الرسالة النصية أولاً — واتساب الحر لا يصل لمن لم يراسل الرقم من قبل.
 */
export const STORE_ISSUED_OTP_UNAVAILABLE_AR =
  'تعذر إرسال رمز التحقق الآن. أعد المحاولة أو راسل الإدارة.';

export const STORE_ISSUED_OTP_DELIVERY_FAILED_AR =
  'تعذر إرسال الرسالة إلى الجوال الموثّق.';

const OTP_TTL_MINUTES_AR = 'عشر دقائق';

export function normalizeWhatsAppFrom(raw: string): string {
  const value = String(raw || '').trim();
  if (!value) return '';
  const rest = value.toLowerCase().startsWith('whatsapp:') ? value.slice('whatsapp:'.length).trim() : value;
  if (!rest) return '';
  const e164 = rest.startsWith('+') ? rest : `+${rest.replace(/^\+/, '')}`;
  return `whatsapp:${e164}`;
}

export function normalizeSmsFrom(raw: string): string {
  const value = String(raw || '').trim();
  if (!value) return '';
  const number = value.replace(/^whatsapp:/i, '').trim();
  if (!number) return '';
  return number.startsWith('+') ? number : `+${number}`;
}

export function storeIssuedOtpBody(code: string): string {
  return `رمز التحقق لبلاغ الوفاة في خريطة الحل: ${code}\nلا تشارك الرمز. صالح ل${OTP_TTL_MINUTES_AR}.`;
}

function twilioSid(): string {
  return (process.env.TWILIO_ACCOUNT_SID || '').trim();
}

function twilioToken(): string {
  return (process.env.TWILIO_AUTH_TOKEN || '').trim();
}

function twilioBasic(sid: string, token: string): string {
  return Buffer.from(`${sid}:${token}`, 'utf8').toString('base64');
}

function configuredMessagingServiceSid(): string {
  return (process.env.TWILIO_MESSAGING_SERVICE_SID || '').trim();
}

function configuredSmsFrom(): string {
  return normalizeSmsFrom(
    process.env.TWILIO_SMS_FROM || process.env.TWILIO_PHONE_NUMBER || process.env.TWILIO_FROM || '',
  );
}

function configuredWhatsAppFrom(): string {
  return normalizeWhatsAppFrom(process.env.TWILIO_WHATSAPP_FROM || '');
}

function otpContentSid(): string {
  return (process.env.TWILIO_WHATSAPP_OTP_CONTENT_SID || '').trim();
}

let cachedIncomingSmsFrom = '';

async function discoverTwilioSmsFrom(sid: string, token: string): Promise<string> {
  if (cachedIncomingSmsFrom) return cachedIncomingSmsFrom;
  const endpoint = `https://api.twilio.com/2010-04-01/Accounts/${encodeURIComponent(sid)}/IncomingPhoneNumbers.json?PageSize=20`;
  const resp = await fetch(endpoint, {
    headers: { Authorization: `Basic ${twilioBasic(sid, token)}` },
  });
  if (!resp.ok) return '';
  let parsed: {
    incoming_phone_numbers?: Array<{ phone_number?: string; capabilities?: { sms?: boolean } }>;
  };
  try {
    parsed = (await resp.json()) as typeof parsed;
  } catch {
    return '';
  }
  const numbers = Array.isArray(parsed.incoming_phone_numbers) ? parsed.incoming_phone_numbers : [];
  const smsCapable = numbers.find((item) => item.capabilities?.sms !== false && item.phone_number);
  const picked = String(smsCapable?.phone_number || numbers[0]?.phone_number || '').trim();
  if (picked) cachedIncomingSmsFrom = picked;
  return cachedIncomingSmsFrom;
}

async function postTwilioMessage(
  sid: string,
  token: string,
  form: URLSearchParams,
): Promise<{ ok: boolean; status: number; text: string }> {
  const endpoint = `https://api.twilio.com/2010-04-01/Accounts/${encodeURIComponent(sid)}/Messages.json`;
  try {
    const resp = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${twilioBasic(sid, token)}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: form.toString(),
    });
    const text = await resp.text();
    if (!resp.ok) {
      console.error('[store-issued-otp]', resp.status, text.slice(0, 220));
    }
    return { ok: resp.ok, status: resp.status, text };
  } catch {
    return { ok: false, status: 0, text: 'network' };
  }
}

async function sendTwilioSms(phoneE164Plus: string, body: string): Promise<boolean> {
  const sid = twilioSid();
  const token = twilioToken();
  if (!sid || !token) return false;

  const form = new URLSearchParams();
  form.set('To', phoneE164Plus);
  form.set('Body', body);

  const messagingSid = configuredMessagingServiceSid();
  if (messagingSid) {
    form.set('MessagingServiceSid', messagingSid);
    const sent = await postTwilioMessage(sid, token, form);
    if (sent.ok) return true;
  }

  const from =
    configuredSmsFrom() ||
    normalizeSmsFrom(process.env.TWILIO_WHATSAPP_FROM || '') ||
    (await discoverTwilioSmsFrom(sid, token));
  if (!from) return false;
  form.delete('MessagingServiceSid');
  form.set('From', from);
  const sent = await postTwilioMessage(sid, token, form);
  return sent.ok;
}

async function sendTwilioWhatsApp(
  phoneE164Plus: string,
  body: string,
  otpCode?: string,
): Promise<boolean> {
  const sid = twilioSid();
  const token = twilioToken();
  const from = configuredWhatsAppFrom();
  if (!sid || !token || !from) return false;

  const form = new URLSearchParams();
  form.set('From', from);
  form.set('To', `whatsapp:${phoneE164Plus}`);
  const contentSid = otpCode ? otpContentSid() : '';
  if (contentSid && otpCode) {
    form.set('ContentSid', contentSid);
    form.set('ContentVariables', JSON.stringify({ '1': otpCode }));
  } else {
    form.set('Body', body);
  }
  const sent = await postTwilioMessage(sid, token, form);
  return sent.ok;
}

async function sendMetaWhatsApp(phoneE164Plus: string, body: string): Promise<boolean> {
  const token = (process.env.META_WHATSAPP_TOKEN || '').trim();
  const phoneId = (process.env.META_WHATSAPP_PHONE_NUMBER_ID || '').trim();
  if (!token || !phoneId) return false;
  const endpoint = `https://graph.facebook.com/v20.0/${encodeURIComponent(phoneId)}/messages`;
  try {
    const resp = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: phoneE164Plus.replace(/^\+/, ''),
        type: 'text',
        text: { preview_url: true, body },
      }),
    });
    if (!resp.ok) {
      const text = await resp.text();
      console.error('[store-issued-otp-meta]', resp.status, text.slice(0, 220));
    }
    return resp.ok;
  } catch {
    return false;
  }
}

function hasAnyDeliveryChannel(): boolean {
  if (twilioSid() && twilioToken()) return true;
  const metaToken = (process.env.META_WHATSAPP_TOKEN || '').trim();
  const metaPhone = (process.env.META_WHATSAPP_PHONE_NUMBER_ID || '').trim();
  return Boolean(metaToken && metaPhone);
}

export function storeIssuedDeliveryConfigured(): boolean {
  return hasAnyDeliveryChannel();
}

async function deliverStoreIssuedMessage(
  phoneE164Plus: string,
  body: string,
  otpCode?: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!hasAnyDeliveryChannel()) {
    return { ok: false, error: STORE_ISSUED_OTP_UNAVAILABLE_AR };
  }
  if (await sendTwilioSms(phoneE164Plus, body)) return { ok: true };
  if (await sendTwilioWhatsApp(phoneE164Plus, body, otpCode)) return { ok: true };
  if (await sendMetaWhatsApp(phoneE164Plus, body)) return { ok: true };
  return { ok: false, error: STORE_ISSUED_OTP_DELIVERY_FAILED_AR };
}

export async function sendStoreIssuedOtp(
  phoneE164Plus: string,
  code: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  return deliverStoreIssuedMessage(phoneE164Plus, storeIssuedOtpBody(code), code);
}

export async function sendStoreIssuedWhatsApp(
  phoneE164Plus: string,
  body: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  return deliverStoreIssuedMessage(phoneE164Plus, body);
}
