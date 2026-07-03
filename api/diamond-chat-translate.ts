import { createClient } from '@supabase/supabase-js';
import {
  getCachedChatTranslation,
  storeCachedChatTranslation,
  type ChatTranslationTarget,
} from './_lib/chatTranslationCache.js';
import { registrationGuardDiagnostics, runRegistrationRouteGuards } from './_lib/registrationRouteGuard.js';
import { buildPublicApiCorsHeaders, publicApiOptionsResponse, rejectIfPublicApiCorsBlocked } from './_lib/publicApiCors.js';

export const config = {
  maxDuration: 20,
};

const CORS_OPTS = {
  allowMethods: 'GET, POST, OPTIONS',
  allowHeaders: 'Content-Type, x-supabase-anon, x-client-supabase-url',
} as const;

const ALLOWED_TARGETS = new Set<ChatTranslationTarget>(['ar', 'en']);

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

function createServiceSupabase() {
  const url = (process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '').trim();
  const serviceRole = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  if (!url || !serviceRole) return null;
  return createClient(url, serviceRole, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/**
 * ترجمة شات الماسي — كاش دائم في chat_line_translations ثم Google Cloud Translation v2.
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
  const messageId = String((body as { messageId?: unknown }).messageId ?? '').trim();

  if (!text || text.length > 4000) {
    return Response.json({ error: 'text must be 1–4000 characters' }, { status: 400, headers });
  }
  if (!ALLOWED_TARGETS.has(target as ChatTranslationTarget)) {
    return Response.json({ error: 'target must be ar or en' }, { status: 400, headers });
  }

  const targetLang = target as ChatTranslationTarget;
  const supabase = createServiceSupabase();

  if (supabase) {
    try {
      const cached = await getCachedChatTranslation(supabase, {
        messageId: messageId || undefined,
        text,
        target: targetLang,
      });
      if (cached) {
        return Response.json(
          {
            ok: true,
            translated: cached.translatedText,
            source: cached.sourceLang,
            configured: true,
            cached: true,
          },
          { headers },
        );
      }
    } catch {
      /* صامت — نتابع لجوجل */
    }
  }

  const apiKey = (process.env.GOOGLE_TRANSLATE_API_KEY || '').trim();
  if (!apiKey) {
    return Response.json(
      { ok: true, translated: null, source: null, configured: false, cached: false },
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
    const translatedRaw = t?.translatedText?.trim();
    const source = t?.detectedSourceLanguage?.trim() || null;
    const translated = translatedRaw && translatedRaw !== text ? translatedRaw : text;

    if (supabase && translatedRaw) {
      try {
        await storeCachedChatTranslation(supabase, {
          messageId: messageId || undefined,
          text,
          target: targetLang,
          translatedText: translated,
          sourceLang: source,
        });
      } catch {
        /* لا نوقف الرد */
      }
    }

    return Response.json(
      {
        ok: true,
        translated,
        source,
        configured: true,
        cached: false,
      },
      { headers },
    );
  } catch {
    return Response.json({ error: 'Translation request failed' }, { status: 502, headers });
  }
}
