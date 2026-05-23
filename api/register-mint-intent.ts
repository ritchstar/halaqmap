import { registrationGuardDiagnostics, runRegistrationRouteGuards } from './_lib/registrationRouteGuard.js';
import {
  getRegistrationIntentSecret,
  isRegistrationIntentMode,
  mintRegistrationIntentToken,
  REGISTRATION_ORDER_ID_RE,
} from './_lib/registrationIntentCrypto.js';
import { buildPublicApiCorsHeaders, publicApiOptionsResponse, rejectIfPublicApiCorsBlocked } from './_lib/publicApiCors.js';

export const config = { maxDuration: 15 };

const CORS_OPTS = {
  allowMethods: 'GET, POST, OPTIONS',
  allowHeaders: 'Content-Type, x-client-supabase-url, x-supabase-anon, x-registration-intent',
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
      route: 'register-mint-intent',
      intentSigningEnabled: isRegistrationIntentMode(),
      publicApiGuard: registrationGuardDiagnostics(),
      ready: true,
      note: 'POST with { orderId } returns intentToken when REGISTRATION_INTENT_SECRET is set on the server.',
    },
    { headers },
  );
}

export async function POST(request: Request): Promise<Response> {
  const blocked = rejectIfPublicApiCorsBlocked(request, CORS_OPTS);
  if (blocked) return blocked;
  const headers = corsHeaders(request);

  const guard = runRegistrationRouteGuards(request, 'register-mint-intent');
  if (guard.ok === false) {
    return Response.json(guard.json, { status: guard.status, headers });
  }

  const secret = getRegistrationIntentSecret();
  if (!secret) {
    return Response.json(
      {
        ok: true,
        intentDisabled: true,
        hint: 'Set REGISTRATION_INTENT_SECRET on the server to enforce signed registration intents (recommended for production).',
      },
      { headers },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400, headers });
  }

  const orderId = String((body as { orderId?: unknown })?.orderId ?? '').trim();
  if (!orderId || !REGISTRATION_ORDER_ID_RE.test(orderId)) {
    return Response.json({ error: 'Invalid or missing orderId' }, { status: 400, headers });
  }

  const intentToken = mintRegistrationIntentToken(orderId, secret);
  return Response.json({ ok: true, intentToken, intentDisabled: false }, { headers });
}
