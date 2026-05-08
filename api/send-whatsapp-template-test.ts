import { timingSafeEqual } from 'node:crypto';
import {
  sendTwilioWhatsAppTemplate,
  type TwilioWhatsAppTemplateInput,
} from './_lib/whatsappTwilioTemplate.js';

export const config = {
  maxDuration: 20,
};

type Body = {
  toPhoneE164?: unknown;
  barberName?: unknown;
  tierLabelAr?: unknown;
  platformStartUrl?: unknown;
};

function corsHeaders(): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, x-whatsapp-test-secret',
  };
}

function verifySecret(request: Request): boolean {
  const expected = (
    process.env.WHATSAPP_TEMPLATE_TEST_SECRET ||
    process.env.WHATSAPP_INTERNAL_WEBHOOK_SECRET ||
    process.env.ONBOARDING_INTERNAL_WEBHOOK_SECRET ||
    ''
  ).trim();
  if (!expected) return false;
  const got = (request.headers.get('x-whatsapp-test-secret') || '').trim();
  if (got.length !== expected.length) return false;
  try {
    return timingSafeEqual(Buffer.from(expected, 'utf8'), Buffer.from(got, 'utf8'));
  } catch {
    return false;
  }
}

function sanitizeBody(raw: Body): TwilioWhatsAppTemplateInput | null {
  const toPhoneE164 = String(raw.toPhoneE164 || '').trim();
  const barberName = String(raw.barberName || '').trim() || 'حلاق ماب';
  const tierLabelAr = String(raw.tierLabelAr || '').trim() || 'ذهبي';
  const platformStartUrl = String(raw.platformStartUrl || '').trim() || 'https://www.halaqmap.com/#/partners/login';
  if (!toPhoneE164) return null;
  return { toPhoneE164, barberName, tierLabelAr, platformStartUrl };
}

export async function OPTIONS(): Promise<Response> {
  return new Response(null, { status: 200, headers: corsHeaders() });
}

/** فحص جاهزية endpoint والأسرار بدون إرسال رسالة. */
export async function GET(): Promise<Response> {
  const headers = corsHeaders();
  return Response.json(
    {
      ok: true,
      route: 'send-whatsapp-template-test',
      docs:
        'Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_FROM, and WHATSAPP_TEMPLATE_TEST_SECRET on Vercel.',
      testSecretSet: Boolean(
        (
          process.env.WHATSAPP_TEMPLATE_TEST_SECRET ||
          process.env.WHATSAPP_INTERNAL_WEBHOOK_SECRET ||
          process.env.ONBOARDING_INTERNAL_WEBHOOK_SECRET ||
          ''
        ).trim(),
      ),
      twilioConfigured: Boolean(
        (process.env.TWILIO_ACCOUNT_SID || '').trim() &&
          (process.env.TWILIO_AUTH_TOKEN || '').trim() &&
          (process.env.TWILIO_WHATSAPP_FROM || '').trim(),
      ),
      hint: 'POST with x-whatsapp-test-secret and JSON body to send a sandbox WhatsApp test message.',
    },
    { headers },
  );
}

export async function POST(request: Request): Promise<Response> {
  const headers = corsHeaders();
  if (!verifySecret(request)) {
    return Response.json(
      {
        ok: false,
        error: 'forbidden',
        hint: 'Set x-whatsapp-test-secret with WHATSAPP_TEMPLATE_TEST_SECRET (or fallback secret).',
      },
      { status: 403, headers },
    );
  }

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return Response.json({ ok: false, error: 'invalid_json' }, { status: 400, headers });
  }

  const input = sanitizeBody(body);
  if (!input) {
    return Response.json(
      { ok: false, error: 'invalid_input', hint: 'toPhoneE164 is required.' },
      { status: 400, headers },
    );
  }

  const sent = await sendTwilioWhatsAppTemplate(input);
  if (!sent.ok) {
    return Response.json(
      {
        ok: false,
        error: sent.error,
      },
      { status: 502, headers },
    );
  }

  return Response.json(
    {
      ok: true,
      messageSid: sent.messageSid,
      toPhoneE164: input.toPhoneE164,
    },
    { headers },
  );
}

