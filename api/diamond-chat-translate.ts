import { registrationGuardDiagnostics, runRegistrationRouteGuards } from './_lib/registrationRouteGuard.js';
import { buildPublicApiCorsHeaders, publicApiOptionsResponse, rejectIfPublicApiCorsBlocked } from './_lib/publicApiCors.js';

export const config = {
  maxDuration: 20,
};

const CORS_OPTS = {
  allowMethods: 'GET, POST, OPTIONS',
  allowHeaders: 'Content-Type, x-supabase-anon, x-client-supabase-url',
} as const;

function corsHeaders(request: Request): Record<string, string> {
  return buildPublicApiCorsHeaders(request, CORS_OPTS).headers;
}

export async function OPTIONS(request: Request): Promise<Response> {
  return publicApiOptionsResponse(request, CORS_OPTS);
}

export async function GET(request: Request): Promise<Response> {
  const blocked = rejectIfPublicApiCorsBlocked(request, CORS_OPTS);
  if (blocked) return blocked;
  const headers = corsHeaders(request);
  return Response.json(
    {
      ok: true,
      route: 'diamond-chat-translate',
      publicApiGuard: registrationGuardDiagnostics(),
    },
    { headers },
  );
}

const ALLOWED_TARGETS = new Set(['ar', 'en']);

/**
 * ترجمة نصية اختيارية عبر Google Cloud Translation v2 (مفتاح سيرفر فقط).
 * بدون مفتاح: يُعاد النص الأصلي و translated=null.
 */
export async function POST(request: Request): Promise<Response> {
  const blocked = rejectIfPublicApiCorsBlocked(request, CORS_OPTS);
  if (blocked) return blocked;
  const headers = corsHeaders(request);

  const guard = runRegistrationRouteGuards(request, 'diamond-chat-translate');
  if (guard.ok === false) {
    return Response.json(guard.json, { status: guard.status, headers });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400, headers });
  }

  const text = String((body as { text?: unknown }).text ?? '').trim();
  const target = String((body as { target?: unknown }).target ?? 'ar').trim().toLowerCase();

  if (!text || text.length > 4000) {
    return Response.json({ error: 'text must be 1–4000 characters' }, { status: 400, headers });
  }
  if (!ALLOWED_TARGETS.has(target)) {
    return Response.json({ error: 'target must be ar or en' }, { status: 400, headers });
  }

  const apiKey = (process.env.GOOGLE_TRANSLATE_API_KEY || '').trim();
  if (!apiKey) {
    return Response.json(
      { ok: true, translated: null, source: null, configured: false },
      { headers },
    );
  }

  try {
    const url = `https://translation.googleapis.com/language/translate/v2?key=${encodeURIComponent(apiKey)}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ q: text, target }),
    });
    const json = (await res.json().catch(() => ({}))) as {
      data?: { translations?: { translatedText?: string; detectedSourceLanguage?: string }[] };
      error?: { message?: string };
    };
    if (!res.ok) {
      const msg = json.error?.message || `HTTP ${res.status}`;
      return Response.json({ error: msg }, { status: 502, headers });
    }
    const t = json.data?.translations?.[0];
    const translated = t?.translatedText?.trim();
    const source = t?.detectedSourceLanguage?.trim() || null;
    return Response.json(
      {
        ok: true,
        translated: translated && translated !== text ? translated : text,
        source,
        configured: true,
      },
      { headers },
    );
  } catch {
    return Response.json({ error: 'Translation request failed' }, { status: 502, headers });
  }
}
