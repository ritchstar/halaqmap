import { createClient } from '@supabase/supabase-js';
import { isRegistrationIntentMode } from './_lib/registrationIntentCrypto.js';
import { assertRegistrationServerAuth } from './_lib/registrationServerAuth.js';
import { registrationGuardDiagnostics, runRegistrationRouteGuards } from './_lib/registrationRouteGuard.js';

export const config = {
  maxDuration: 30,
};

const BUCKET = 'registration-uploads';
const ORDER_ID_RE = /^HM-\d{8}-[A-Z0-9]{6}$/;
const ALLOWED_ROOTS = new Set(['documents', 'health', 'shop', 'banners', 'receipt']);

function corsHeaders(request: Request): Record<string, string> {
  const origin = request.headers.get('origin');
  return {
    'Access-Control-Allow-Origin': origin || '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers':
      'Content-Type, x-order-id, x-storage-subpath, x-supabase-anon, x-file-content-type, x-client-supabase-url, x-registration-intent',
    'Access-Control-Max-Age': '86400',
  };
}

function validateStorageSubpath(sub: string): boolean {
  if (!sub || sub.includes('..') || sub.startsWith('/') || sub.includes('//')) return false;
  const root = sub.split('/')[0];
  return ALLOWED_ROOTS.has(root);
}

export async function OPTIONS(request: Request): Promise<Response> {
  return new Response(null, { status: 204, headers: corsHeaders(request) });
}

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
      route: 'register-signed-upload',
      supabaseUrlSet: url,
      serviceRoleKeySet: serviceRole,
      anonKeySetForVerification: anon,
      registrationIntentMode: isRegistrationIntentMode(),
      ready: url && serviceRole && (isRegistrationIntentMode() || anon),
      registrationGuard: registrationGuardDiagnostics(),
    },
    { headers }
  );
}

/**
 * يُصدِر token لمسار واحد؛ العميل يرفع الملف عبر uploadToSignedUrl (لا يمرّ ثنائي الملف عبر Vercel).
 */
export async function POST(request: Request): Promise<Response> {
  const headers = corsHeaders(request);

  const guard = runRegistrationRouteGuards(request, 'register-signed-upload');
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

  const orderId = request.headers.get('x-order-id')?.trim() || '';
  const storageSubpath = request.headers.get('x-storage-subpath')?.trim() || '';

  if (!orderId || !storageSubpath) {
    return Response.json({ error: 'Missing x-order-id or x-storage-subpath' }, { status: 400, headers });
  }

  if (!ORDER_ID_RE.test(orderId)) {
    return Response.json({ error: 'Invalid order id' }, { status: 400, headers });
  }

  if (!validateStorageSubpath(storageSubpath)) {
    return Response.json({ error: 'Invalid storage subpath' }, { status: 400, headers });
  }

  const auth = assertRegistrationServerAuth(request, orderId, expectedAnon);
  if (!auth.ok) {
    return Response.json(auth.json, { status: auth.status, headers });
  }

  const objectPath = `${orderId}/${storageSubpath}`;

  const supabase = createClient(url, serviceRole, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data, error } = await supabase.storage.from(BUCKET).createSignedUploadUrl(objectPath);

  if (error || !data?.token) {
    return Response.json(
      { error: error?.message || 'Could not create signed upload URL' },
      { status: 500, headers }
    );
  }

  return Response.json(
    {
      path: data.path ?? objectPath,
      token: data.token,
      /** للعميل: رفع عبر fetch PUT بدون ترويسة Authorization (anon) — يقلل 403 من PostgREST */
      signedUrl: data.signedUrl,
    },
    { status: 200, headers }
  );
}
