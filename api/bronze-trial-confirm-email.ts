/**
 * تأكيد بريد طلب تجربة برونزي عبر رابط الرسالة.
 */
import { createClient } from '@supabase/supabase-js';
import { confirmBronzeTrialApplicationEmail } from './_lib/bronzeTrialApplicationService.js';
import { runRegistrationRouteGuards } from './_lib/registrationRouteGuard.js';
import {
  buildPublicApiCorsHeaders,
  publicApiOptionsResponse,
  rejectIfPublicApiCorsBlocked,
} from './_lib/publicApiCors.js';

export const config = { maxDuration: 20 };

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
  const urlObj = new URL(request.url);
  const token = (urlObj.searchParams.get('c') || urlObj.searchParams.get('token') || '').trim();
  return handleConfirm(token, headers);
}

export async function POST(request: Request): Promise<Response> {
  const blocked = rejectIfPublicApiCorsBlocked(request, CORS_OPTS);
  if (blocked) return blocked;
  const headers = corsHeaders(request);
  const guard = runRegistrationRouteGuards(request, 'bronze-trial-confirm-email');
  if (guard.ok === false) {
    return Response.json(guard.json, { status: guard.status, headers });
  }
  let body: { token?: unknown; c?: unknown } = {};
  try {
    body = (await request.json()) as typeof body;
  } catch {
    /* empty */
  }
  const token = String(body.token ?? body.c ?? '').trim();
  return handleConfirm(token, headers);
}

async function handleConfirm(token: string, headers: Record<string, string>): Promise<Response> {
  if (!token) {
    return Response.json({ ok: false, error: 'missing_token' }, { status: 400, headers });
  }
  const url = (process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '').trim();
  const serviceRole = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  if (!url || !serviceRole) {
    return Response.json({ ok: false, error: 'server_misconfigured' }, { status: 503, headers });
  }
  const supabase = createClient(url, serviceRole, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const result = await confirmBronzeTrialApplicationEmail(supabase, token);
  if (!result.ok) {
    return Response.json({ ok: false, error: result.error }, { status: result.status, headers });
  }
  return Response.json(
    {
      ok: true,
      applicationId: result.applicationId,
      messageAr: 'تم تأكيد البريد. طلبك الآن قيد المراجعة (3–5 أيام عمل).',
    },
    { status: 200, headers },
  );
}
