/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * إرسال رمز بلاغ الوفاة ورابط الإدارة إلى الجوال.
 * واتساب خارج نافذة 24 ساعة يتطلب قالباً معتمداً (ContentSid)، لا نصاً حراً.
 * قالب التجربة العام في Twilio Sandbox:
 * HXb5b62575e6e4ff6129ad7c8efe1f983e — متغيران {{1}} و{{2}}.
 */
export const STORE_ISSUED_OTP_UNAVAILABLE_AR =
  'تعذر إرسال رمز التحقق الآن. أعد المحاولة أو راسل الإدارة.';

export const STORE_ISSUED_OTP_DELIVERY_FAILED_AR =
  'تعذر إرسال الرسالة إلى الجوال الموثّق.';

export const STORE_ISSUED_OTP_SANDBOX_HINT_AR =
  'تعذر إرسال واتساب التجربة. تأكد أن هذا الجوال ما زال منضماً إلى رقم التجربة، ثم أعد المحاولة.';

export const TWILIO_SANDBOX_VOICE_NUMBER = '+14155238886';

export function extractTwilioErrorCode(text: string): number | null {
  try {
    const parsed = JSON.parse(text) as { code?: unknown; error_code?: unknown };
    const raw = parsed.code ?? parsed.error_code;
    const n = Number(raw);
    return Number.isFinite(n) && n > 0 ? Math.trunc(n) : null;
  } catch {
    return null;
  }
}

export function smsFromLooksLikeWhatsAppSandbox(from: string): boolean {
  return String(from || '').replace(/\D/g, '') === TWILIO_SANDBOX_VOICE_NUMBER.replace(/\D/g, '');
}

export function storeIssuedTwilioErrorAr(code: number | null | undefined): string | null {
  if (code === 63015) {
    return 'واتساب التجربة لا يرسل لهذا الجوال حتى يرسل منه رسالة انضمام إلى رقم واتساب التجربة في Twilio، ثم يعيد إرسال الرمز.';
  }
  if (code === 63016) {
    return 'واتساب رفض النص الحر خارج نافذة المحادثة. يلزم قالب معتمد.';
  }
  if (code === 21608) {
    return 'حساب Twilio التجريبي لا يرسل إلا إلى أرقام موثّقة مسبقاً في لوحة Twilio.';
  }
  if (code === 21408) {
    return 'إرسال الرسائل النصية إلى هذه الدولة غير مفعّل في Twilio.';
  }
  if (code === 21211) {
    return 'رقم الجوال غير مقبول لدى Twilio.';
  }
  if (code === 21606 || code === 21659) {
    return 'رقم المرسل غير صالح للرسائل النصية.';
  }
  if (code === 21656 || code === 21661) {
    return 'قالب واتساب التجربة غير مرتبط بهذا الحساب. راجع ContentSid في Twilio.';
  }
  if (code === 63007) {
    return 'رقم المرسل غير مفعّل لواتساب في Twilio.';
  }
  if (code === 63003) {
    return 'تعذر توثيق قناة واتساب في Twilio.';
  }
  return null;
}

const OTP_TTL_MINUTES_AR = 'عشر دقائق';

export function normalizeWhatsAppFrom(raw: string): string {
  const value = String(raw || '').trim();
  if (!value) return '';
  const rest = value.toLowerCase().startsWith('whatsapp:') ? value.slice('whatsapp:'.length).trim() : value;
  if (!rest) return '';
  const e164 = rest.startsWith('+') ? rest : `+${rest.replace(/^\+/, '')}`;
  return `whatsapp:${e164}`;
}

export function resolveWhatsAppFrom(raw: string): string {
  return normalizeWhatsAppFrom(raw) || normalizeWhatsAppFrom(TWILIO_SANDBOX_VOICE_NUMBER);
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

/** قالب تجربة واتساب الرسمي في Twilio — نفس الذي يظهر في أداة Make Request. */
export const TWILIO_SANDBOX_WHATSAPP_CONTENT_SID = 'HXb5b62575e6e4ff6129ad7c8efe1f983e';

export function resolveWhatsAppOtpContentSid(): string {
  const raw = (process.env.TWILIO_WHATSAPP_OTP_CONTENT_SID || '').trim();
  const lowered = raw.toLowerCase();
  if (lowered === 'false' || lowered === '0' || lowered === 'off') return '';
  if (raw) return raw;
  return TWILIO_SANDBOX_WHATSAPP_CONTENT_SID;
}

export function storeIssuedOtpContentVariables(code: string): string {
  return JSON.stringify({ '1': code, '2': code });
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
  return resolveWhatsAppFrom(process.env.TWILIO_WHATSAPP_FROM || '');
}

function otpContentSid(): string {
  return resolveWhatsAppOtpContentSid();
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

type TwilioPostResult = { ok: boolean; status: number; text: string; twilioCode: number | null };

async function postTwilioMessage(
  sid: string,
  token: string,
  form: URLSearchParams,
): Promise<TwilioPostResult> {
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
    const twilioCode = extractTwilioErrorCode(text);
    if (!resp.ok) {
      console.error('[store-issued-otp]', resp.status, twilioCode, text.slice(0, 220));
    }
    return { ok: resp.ok, status: resp.status, text, twilioCode };
  } catch {
    return { ok: false, status: 0, text: 'network', twilioCode: null };
  }
}

type ChannelSendResult = { ok: boolean; twilioCode: number | null };

async function sendTwilioSms(phoneE164Plus: string, body: string): Promise<ChannelSendResult> {
  const sid = twilioSid();
  const token = twilioToken();
  if (!sid || !token) return { ok: false, twilioCode: null };

  const form = new URLSearchParams();
  form.set('To', phoneE164Plus);
  form.set('Body', body);

  const messagingSid = configuredMessagingServiceSid();
  if (messagingSid) {
    form.set('MessagingServiceSid', messagingSid);
    const sent = await postTwilioMessage(sid, token, form);
    if (sent.ok) return { ok: true, twilioCode: null };
    if (sent.twilioCode) return { ok: false, twilioCode: sent.twilioCode };
  }

  const from = configuredSmsFrom() || (await discoverTwilioSmsFrom(sid, token));
  if (!from || smsFromLooksLikeWhatsAppSandbox(from)) {
    if (from && smsFromLooksLikeWhatsAppSandbox(from)) {
      logOtpSkip('skipped_sandbox_sms_from');
    }
    return { ok: false, twilioCode: null };
  }
  form.delete('MessagingServiceSid');
  form.set('From', from);
  const sent = await postTwilioMessage(sid, token, form);
  return { ok: sent.ok, twilioCode: sent.ok ? null : sent.twilioCode };
}

async function sendTwilioWhatsApp(
  phoneE164Plus: string,
  body: string,
  otpCode?: string,
): Promise<ChannelSendResult> {
  const sid = twilioSid();
  const token = twilioToken();
  const from = configuredWhatsAppFrom();
  if (!sid || !token || !from) return { ok: false, twilioCode: null };

  const form = new URLSearchParams();
  form.set('From', from);
  form.set('To', `whatsapp:${phoneE164Plus}`);
  const contentSid = otpCode ? otpContentSid() : '';
  if (contentSid && otpCode) {
    form.set('ContentSid', contentSid);
    form.set('ContentVariables', storeIssuedOtpContentVariables(otpCode));
    const templated = await postTwilioMessage(sid, token, form);
    if (templated.ok) return { ok: true, twilioCode: null };
    form.delete('ContentSid');
    form.delete('ContentVariables');
    if (templated.twilioCode === 63015) return { ok: false, twilioCode: 63015 };
  }
  form.set('Body', body);
  const sent = await postTwilioMessage(sid, token, form);
  return { ok: sent.ok, twilioCode: sent.ok ? null : sent.twilioCode };
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

export type StoreIssuedDeliveryProbe = {
  hasSid: boolean;
  hasToken: boolean;
  hasWhatsAppFrom: boolean;
  hasSmsFrom: boolean;
  contentSid: string;
  missing: string[];
};

export function storeIssuedDeliveryProbe(): StoreIssuedDeliveryProbe {
  const missing: string[] = [];
  if (!twilioSid()) missing.push('TWILIO_ACCOUNT_SID');
  if (!twilioToken()) missing.push('TWILIO_AUTH_TOKEN');
  return {
    hasSid: Boolean(twilioSid()),
    hasToken: Boolean(twilioToken()),
    hasWhatsAppFrom: Boolean(configuredWhatsAppFrom()),
    hasSmsFrom: Boolean(configuredSmsFrom() || configuredMessagingServiceSid()),
    contentSid: resolveWhatsAppOtpContentSid(),
    missing,
  };
}

function logOtpSkip(stage: string, extra?: Record<string, unknown>): void {
  const probe = storeIssuedDeliveryProbe();
  console.error('[store-issued-otp]', stage, {
    hasSid: probe.hasSid,
    hasToken: probe.hasToken,
    hasWhatsAppFrom: probe.hasWhatsAppFrom,
    hasSmsFrom: probe.hasSmsFrom,
    contentSid: probe.contentSid,
    missing: probe.missing,
    ...extra,
  });
}

export type StoreIssuedDeliveryResult =
  | { ok: true }
  | { ok: false; error: string; code: string; probe: StoreIssuedDeliveryProbe; twilioCode?: number | null };

async function deliverStoreIssuedMessage(
  phoneE164Plus: string,
  body: string,
  otpCode?: string,
): Promise<StoreIssuedDeliveryResult> {
  if (!hasAnyDeliveryChannel()) {
    logOtpSkip('blocked_before_twilio');
    return {
      ok: false,
      error: STORE_ISSUED_OTP_UNAVAILABLE_AR,
      code: 'otp_channel_unconfigured',
      probe: storeIssuedDeliveryProbe(),
    };
  }
  let twilioCode: number | null = null;
  if (otpCode) {
    const whatsapp = await sendTwilioWhatsApp(phoneE164Plus, body, otpCode);
    if (whatsapp.ok) return { ok: true };
    twilioCode = whatsapp.twilioCode ?? twilioCode;
  }
  const sms = await sendTwilioSms(phoneE164Plus, body);
  if (sms.ok) return { ok: true };
  twilioCode = sms.twilioCode ?? twilioCode;
  if (!otpCode) {
    const whatsapp = await sendTwilioWhatsApp(phoneE164Plus, body);
    if (whatsapp.ok) return { ok: true };
    twilioCode = whatsapp.twilioCode ?? twilioCode;
  }
  if (await sendMetaWhatsApp(phoneE164Plus, body)) return { ok: true };
  logOtpSkip('all_channels_failed', { twilioCode });
  return {
    ok: false,
    error:
      storeIssuedTwilioErrorAr(twilioCode) ||
      STORE_ISSUED_OTP_SANDBOX_HINT_AR,
    code: 'otp_dispatch_failed',
    probe: storeIssuedDeliveryProbe(),
    twilioCode,
  };
}

export async function sendStoreIssuedOtp(
  phoneE164Plus: string,
  code: string,
): Promise<StoreIssuedDeliveryResult> {
  return deliverStoreIssuedMessage(phoneE164Plus, storeIssuedOtpBody(code), code);
}

export async function sendStoreIssuedWhatsApp(
  phoneE164Plus: string,
  body: string,
): Promise<StoreIssuedDeliveryResult> {
  return deliverStoreIssuedMessage(phoneE164Plus, body);
}
