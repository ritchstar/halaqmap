import { createClient } from '@supabase/supabase-js';
import { isRegistrationIntentMode } from './_lib/registrationIntentCrypto.js';
import { assertRegistrationServerAuth } from './_lib/registrationServerAuth.js';
import { registrationGuardDiagnostics, runRegistrationRouteGuards } from './_lib/registrationRouteGuard.js';
import { buildPublicApiCorsHeaders, publicApiOptionsResponse, rejectIfPublicApiCorsBlocked } from './_lib/publicApiCors.js';
import { runSecurityGuard } from './_lib/securityGuard.js';
import {
  probeRegistrationUploadsBucket,
  registrationUploadsBucketFailureHint,
} from './_lib/registrationUploadsBucketProbe.js';
import { isLikelyHttpUrl, normalizeSupabaseUrl } from './_lib/supabaseUrl.js';

export const config = {
  maxDuration: 60,
};

const BUCKET = 'registration-uploads';
const MAX_BYTES = 20 * 1024 * 1024;
const ORDER_ID_RE = /^HM-\d{8}-[A-Z0-9]{6}$/;
/** صور المحل والبنر والإيصال فقط — لا رفع مسارات وثائق حكومية (documents/health) وفق بروتوكول الخصوصية. */
const ALLOWED_ROOTS = new Set(['shop', 'banners', 'receipt']);

const CORS_OPTS = {
  allowMethods: 'GET, POST, OPTIONS',
  allowHeaders:
    'Content-Type, x-order-id, x-storage-subpath, x-supabase-anon, x-file-content-type, x-client-supabase-url, x-registration-intent',
} as const;

function corsHeaders(request: Request): Record<string, string> {
  return buildPublicApiCorsHeaders(request, CORS_OPTS).headers;
}

function validateStorageSubpath(sub: string): boolean {
  if (!sub || sub.includes('..') || sub.startsWith('/') || sub.includes('//')) return false;
  const root = sub.split('/')[0];
  return ALLOWED_ROOTS.has(root);
}

export async function OPTIONS(request: Request): Promise<Response> {
  return publicApiOptionsResponse(request, CORS_OPTS);
}

/** تشخيص بلا أسرار — افتح في المتصفح: /api/register-upload-file */
export async function GET(request: Request): Promise<Response> {
  try {
    const blocked = rejectIfPublicApiCorsBlocked(request, CORS_OPTS);
    if (blocked) return blocked;
    const headers = corsHeaders(request);
    const supabaseUrlRaw = normalizeSupabaseUrl(process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL);
    const url = Boolean(supabaseUrlRaw);
    const supabaseUrlValid = Boolean(supabaseUrlRaw && isLikelyHttpUrl(supabaseUrlRaw));
    const serviceRole = Boolean((process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim());
    const anon = Boolean(
      (process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '').trim()
    );

    let bucketProbe: { ok: boolean; error?: string } | { ok: false; error: string; probeFailed: true } | null = null;
    if (url && serviceRole && supabaseUrlValid) {
      try {
        const supabaseKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
        const supabase = createClient(supabaseUrlRaw, supabaseKey, {
          auth: { persistSession: false, autoRefreshToken: false },
        });
        bucketProbe = await probeRegistrationUploadsBucket(supabase, BUCKET);
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        bucketProbe = { ok: false, error: msg, probeFailed: true };
      }
    }

    return Response.json(
      {
        ok: true,
        route: 'register-upload-file',
        supabaseUrlSet: url,
        supabaseUrlValid,
        serviceRoleKeySet: serviceRole,
        anonKeySetForVerification: anon,
        registrationIntentMode: isRegistrationIntentMode(),
        ready: supabaseUrlValid && serviceRole && (isRegistrationIntentMode() || anon),
        registrationGuard: registrationGuardDiagnostics(),
        bucket: BUCKET,
        bucketProbe,
      },
      { headers }
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return Response.json(
      { ok: false, route: 'register-upload-file', stage: 'GET', error: msg },
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

export async function POST(request: Request): Promise<Response> {
  const blocked = rejectIfPublicApiCorsBlocked(request, CORS_OPTS);
  if (blocked) return blocked;
  const headers = corsHeaders(request);

  const guard = runRegistrationRouteGuards(request, 'register-upload-file');
  if (guard.ok === false) {
    return Response.json(guard.json, { status: guard.status, headers });
  }
  const secGuard = await runSecurityGuard(request, { sensitiveRoute: true, rateLimit: 10 });
  if (!secGuard.allowed) return secGuard.response;

  const url = normalizeSupabaseUrl(process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL);
  const serviceRole = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  const expectedAnon = (
    process.env.VITE_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    ''
  ).trim();

  if (!url || !serviceRole) {
    return Response.json(
      { error: 'Server upload not configured (SUPABASE_SERVICE_ROLE_KEY / URL)' },
      { status: 503, headers }
    );
  }

  if (!isLikelyHttpUrl(url)) {
    return Response.json(
      {
        error: 'Invalid Supabase URL',
        hint: 'Set SUPABASE_URL (or VITE_SUPABASE_URL) to a full https://<ref>.supabase.co URL on Vercel. Remove quotes/spaces.',
      },
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
  if (auth.ok === false) {
    return Response.json(auth.json, { status: auth.status, headers });
  }

  const ab = await request.arrayBuffer();
  if (ab.byteLength === 0) {
    return Response.json({ error: 'Empty body' }, { status: 400, headers });
  }
  if (ab.byteLength > MAX_BYTES) {
    return Response.json({ error: 'Body too large' }, { status: 413, headers });
  }

  const buf = Buffer.from(ab);
  const contentType =
    request.headers.get('x-file-content-type')?.trim() || 'application/octet-stream';

  const path = `${orderId}/${storageSubpath}`;

  const supabase = createClient(url, serviceRole, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { error } = await supabase.storage.from(BUCKET).upload(path, buf, {
    contentType,
    upsert: false,
    cacheControl: '3600',
  });

  if (error) {
    const hint = registrationUploadsBucketFailureHint({ bucketId: BUCKET, errorMessage: error.message });
    return Response.json({ error: error.message, ...(hint ? { hint } : {}) }, { status: 500, headers });
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return Response.json({ publicUrl: data.publicUrl }, { status: 200, headers });
}
