/**
 * GET/POST /api/whatsapp-webhook
 *
 * MVP — وكيل واتساب للشركاء عبر Meta Cloud API.
 *
 * إعداد Meta Developer:
 * 1. WhatsApp → Configuration → Callback URL: https://YOUR_DOMAIN/api/whatsapp-webhook
 * 2. Verify Token: نفس META_WHATSAPP_VERIFY_TOKEN على Vercel
 * 3. App Secret → META_WHATSAPP_APP_SECRET
 * 4. Access Token + Phone Number ID → META_WHATSAPP_TOKEN / META_WHATSAPP_PHONE_NUMBER_ID
 * 5. ENABLE_WHATSAPP_AGENT=true
 */
import {
  appendSessionTurn,
  generateWhatsAppAgentReply,
  isWhatsAppAgentEnabled,
  parseInboundMetaPayload,
  rememberInboundMessage,
  sendMetaWhatsAppText,
  verifyMetaWebhookSignature,
} from './_lib/whatsappAgentMvp.js';

export const config = { maxDuration: 30 };

function plain(text: string, status = 200): Response {
  return new Response(text, {
    status,
    headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' },
  });
}

export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const mode = url.searchParams.get('hub.mode');
  const token = url.searchParams.get('hub.verify_token');
  const challenge = url.searchParams.get('hub.challenge');
  const expected = (process.env.META_WHATSAPP_VERIFY_TOKEN || '').trim();

  if (mode === 'subscribe' && token && expected && token === expected && challenge) {
    return plain(challenge);
  }
  return plain('forbidden', 403);
}

export async function POST(request: Request): Promise<Response> {
  if (!isWhatsAppAgentEnabled()) {
    return Response.json({ ok: true, ignored: 'agent_disabled' });
  }

  const rawBody = await request.text();
  const signature = request.headers.get('x-hub-signature-256');
  if (!verifyMetaWebhookSignature(rawBody, signature)) {
    return plain('invalid_signature', 403);
  }

  let payload: unknown;
  try {
    payload = JSON.parse(rawBody) as unknown;
  } catch {
    return plain('invalid_json', 400);
  }

  const messages = parseInboundMetaPayload(payload);
  if (messages.length === 0) {
    return Response.json({ ok: true, ignored: 'no_text_messages' });
  }

  const results: Array<{ messageId: string; sent: boolean; error?: string }> = [];

  for (const inbound of messages) {
    if (!rememberInboundMessage(inbound.messageId)) {
      results.push({ messageId: inbound.messageId, sent: false, error: 'duplicate' });
      continue;
    }

    appendSessionTurn(inbound.fromE164, 'user', inbound.text);
    const reply = await generateWhatsAppAgentReply({
      phoneE164: inbound.fromE164,
      userMessage: inbound.text,
    });
    appendSessionTurn(inbound.fromE164, 'assistant', reply);

    const sent = await sendMetaWhatsAppText(inbound.fromE164, reply);
    results.push({
      messageId: inbound.messageId,
      sent: sent.ok,
      error: sent.ok ? undefined : sent.error,
    });
  }

  return Response.json({ ok: true, results });
}
