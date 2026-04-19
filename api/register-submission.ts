import { createClient } from '@supabase/supabase-js';
import { isRegistrationIntentMode } from './_lib/registrationIntentCrypto';
import { assertRegistrationServerAuth } from './_lib/registrationServerAuth';
import { registrationGuardDiagnostics, runRegistrationRouteGuards } from './_lib/registrationRouteGuard';

export const config = {
  maxDuration: 30,
};

const TABLE = 'registration_submissions';
const ORDER_ID_RE = /^HM-\d{8}-[A-Z0-9]{6}$/;
const MAX_PAYLOAD_TEXT_BYTES = 5 * 1024 * 1024;

function corsHeaders(request: Request): Record<string, string> {
  const origin = request.headers.get('origin');
  return {
    'Access-Control-Allow-Origin': origin || '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, x-supabase-anon, x-client-supabase-url, x-registration-intent',
    'Access-Control-Max-Age': '86400',
  };
}

export async function OPTIONS(request: Request): Promise<Response> {
  return new Response(null, { status: 204, headers: corsHeaders(request) });
}

/** تشخيص بلا أسرار — افتح في المتصفح: /api/register-submission */
export async function GET(request: Request): Promise<Response> {
  const headers = corsHeaders(request);
  const url = Boolean((process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').trim());
  const serviceRole = Boolean((process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim());
  const anon = Boolean(
    (process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '').trim()
  );
  return Response.json(
    {
      ok: true,
      route: 'register-submission',
      supabaseUrlSet: url,
      serviceRoleKeySet: serviceRole,
      anonKeySetForVerification: anon,
      registrationIntentMode: isRegistrationIntentMode(),
      ready: url && serviceRole && (isRegistrationIntentMode() || anon),
      registrationGuard: registrationGuardDiagnostics(),
      note: 'Server-side insert for registration_submissions (avoids anon RLS pitfalls).',
    },
    { headers }
  );
}

export async function POST(request: Request): Promise<Response> {
  const headers = corsHeaders(request);

  const guard = runRegistrationRouteGuards(request, 'register-submission');
  if (!guard.ok) {
    return Response.json(guard.json, { status: guard.status, headers });
  }

  const url = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').trim();
  const serviceRole = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  const expectedAnon = (
    process.env.VITE_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    ''
  ).trim();

  if (!url || !serviceRole) {
    return Response.json(
      { error: 'Server not configured (SUPABASE_SERVICE_ROLE_KEY / URL)' },
      { status: 503, headers }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400, headers });
  }

  const rowId = String((body as { id?: unknown })?.id ?? '').trim();
  const payload = (body as { payload?: unknown })?.payload;
  if (!rowId || !ORDER_ID_RE.test(rowId)) {
    return Response.json({ error: 'Invalid order id' }, { status: 400, headers });
  }
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return Response.json({ error: 'Invalid payload object' }, { status: 400, headers });
  }

  const auth = assertRegistrationServerAuth(request, rowId, expectedAnon);
  if (!auth.ok) {
    return Response.json(auth.json, { status: auth.status, headers });
  }

  const payloadText = JSON.stringify(payload);
  if (new TextEncoder().encode(payloadText).byteLength > MAX_PAYLOAD_TEXT_BYTES) {
    return Response.json({ error: 'Payload too large' }, { status: 413, headers });
  }

  const supabase = createClient(url, serviceRole, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { error } = await supabase.from(TABLE).insert({
    id: rowId,
    payload,
  });

  if (error) {
    const duplicate = String(error.message || '').toLowerCase().includes('duplicate');
    return Response.json(
      { error: error.message, code: duplicate ? 'duplicate' : 'insert_failed' },
      { status: duplicate ? 409 : 500, headers }
    );
  }

  return Response.json({ ok: true }, { status: 200, headers });
}
