import { authorizeOpsBillingRead } from './_lib/opsBillingAuth.js';
import {
  buildOpsBillingAiSystemPrompt,
  callOpenAIOpsBillingVision,
  commitmentRowForAi,
  enrichProposalsWithRows,
  loadCommitmentRows,
  parseOpsBillingAiJson,
  assertVisionMime,
} from './_lib/opsBillingAi.js';

/** Vercel serverless — allow up to 60s for vision + DB (see vercel.json). */
export const config = { maxDuration: 60 };

const OPENAI_ANALYZE_TIMEOUT_MS = 52_000;

function json(data: unknown, status = 200): Response {
  return Response.json(data, {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'private, no-store, max-age=0, must-revalidate',
    },
  });
}

const MAX_IMAGE_BYTES = 4 * 1024 * 1024;

export async function GET(request: Request): Promise<Response> {
  const auth = await authorizeOpsBillingRead(request);
  if (auth.ok === false) return json(auth.json, auth.status);

  const key = Boolean((process.env.OPENAI_API_KEY || '').trim());
  return json({
    ok: true,
    route: 'admin-resources-ai-analyze',
    openaiConfigured: key,
    model: (process.env.OPS_BILLING_AI_MODEL || process.env.ADMIN_SENTINEL_OPENAI_MODEL || 'gpt-4o').trim() || 'gpt-4o',
  });
}

export async function POST(request: Request): Promise<Response> {
  const auth = await authorizeOpsBillingRead(request);
  if (auth.ok === false) return json(auth.json, auth.status);

  let body: Record<string, unknown> = {};
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return json({ error: 'Invalid JSON body' }, 400);
  }

  const userMessage = String(body.userMessage || body.prompt || '').trim();
  const imageBase64Raw = typeof body.imageBase64 === 'string' ? body.imageBase64.trim() : '';
  const imageMime = String(body.imageMime || body.mimeType || '').trim().toLowerCase();

  if (!userMessage && !imageBase64Raw) {
    return json({ error: 'أدخل سؤالاً أو ارفع صورة فاتورة' }, 400);
  }

  let imageBase64: string | undefined;
  if (imageBase64Raw) {
    const mimeErr = assertVisionMime(imageMime);
    if (mimeErr) return json({ error: mimeErr }, 400);
    const b64 = imageBase64Raw.includes(',') ? imageBase64Raw.split(',').pop()! : imageBase64Raw;
    const bufLen = Math.ceil((b64.length * 3) / 4);
    if (bufLen > MAX_IMAGE_BYTES) {
      return json({ error: 'حجم الصورة كبير جداً (الحد 4 ميجابايت)' }, 400);
    }
    imageBase64 = b64;
  }

  const { rows, error: loadErr } = await loadCommitmentRows(auth.supabase);
  if (loadErr) return json({ error: loadErr }, 500);

  const aiContext = rows.map((r) => commitmentRowForAi(r));
  const system = buildOpsBillingAiSystemPrompt(aiContext);
  const userText = [
    userMessage || 'حلّل المرفق وحدّد التزاماً في الجدول.',
    'أعد JSON فقط حسب المخطط في تعليمات النظام.',
  ].join('\n');

  try {
    const rawModel = await callOpenAIOpsBillingVision({
      system,
      userText,
      imageBase64,
      imageMime: imageMime || undefined,
      timeoutMs: OPENAI_ANALYZE_TIMEOUT_MS,
    });
    const parsed = parseOpsBillingAiJson(rawModel);
    const rowsById = new Map(rows.map((r) => [String(r.id), r]));
    const proposals = enrichProposalsWithRows(parsed.proposals, rowsById);

    return json({
      ok: true,
      assistant_message: parsed.assistant_message,
      needs_clarification: parsed.needs_clarification,
      proposals,
      commitments_count: rows.length,
      analyzedBy: auth.actorEmail,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'فشل التحليل';
    const isTimeout =
      msg.includes('مهلة') ||
      msg.includes('timeout') ||
      msg.includes('Timeout') ||
      msg.includes('AbortError');
    return json(
      {
        error: isTimeout ? 'انتهت مهلة التحليل على الخادم — جرّب صورة أصغر أو أعد المحاولة' : msg,
        code: isTimeout ? 'analysis_timeout' : 'analysis_failed',
      },
      isTimeout ? 504 : 502,
    );
  }
}
