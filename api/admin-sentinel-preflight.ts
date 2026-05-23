import { verifyPlatformAdminFromRequest } from './_lib/adminManageBarbersAuth.js';
import { buildPublicApiCorsHeaders, publicApiOptionsResponse, rejectIfPublicApiCorsBlocked } from './_lib/publicApiCors.js';
import {
  clientIpFromRequest,
  ipAllowlistOk,
  jwtAssuranceLevelFromAccessToken,
  parseIpAllowlist,
} from './_lib/adminSentinelRequest.js';
import { ADMIN_SENTINEL_UI_HEADER, assertSentinelUiHeader } from './_lib/adminSentinelClientHeader.js';
import { rejectIfSentinelProductionPublicOriginsMisconfigured } from './_lib/adminSentinelProductionCorsPolicy.js';

export const config = { maxDuration: 15 };

const CORS_OPTS = {
  allowMethods: 'GET, OPTIONS',
  allowHeaders: `Content-Type, Authorization, x-client-supabase-url, x-supabase-anon, ${ADMIN_SENTINEL_UI_HEADER}`,
} as const;

function corsHeaders(request: Request): Record<string, string> {
  return buildPublicApiCorsHeaders(request, CORS_OPTS).headers;
}

function envFlag(name: string): boolean {
  const v = (process.env[name] || '').trim().toLowerCase();
  return v === '1' || v === 'true' || v === 'yes';
}

export async function OPTIONS(request: Request): Promise<Response> {
  const mis = rejectIfSentinelProductionPublicOriginsMisconfigured();
  if (mis) return mis;
  return publicApiOptionsResponse(request, CORS_OPTS);
}

export async function GET(request: Request): Promise<Response> {
  const mis = rejectIfSentinelProductionPublicOriginsMisconfigured();
  if (mis) return mis;

  const blocked = rejectIfPublicApiCorsBlocked(request, CORS_OPTS);
  if (blocked) return blocked;
  const headers = corsHeaders(request);

  const ui = assertSentinelUiHeader(request);
  if (!ui.ok) {
    return Response.json(ui.json, { status: 403, headers: { ...headers, 'Content-Type': 'application/json' } });
  }

  const url = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').trim();
  const serviceRole = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  if (!url || !serviceRole) {
    return Response.json({ error: 'Server not configured' }, { status: 503, headers });
  }

  const authHeader = request.headers.get('authorization')?.trim() || '';
  const accessToken =
    authHeader.startsWith('Bearer ') ? authHeader.slice('Bearer '.length).trim() : '';

  const adminAuth = await verifyPlatformAdminFromRequest(request, url, serviceRole, 'view_command_center');
  if (adminAuth.ok === false) {
    return Response.json(adminAuth.json, { status: adminAuth.status, headers });
  }

  const allowlist = parseIpAllowlist(process.env.ADMIN_SENTINEL_IP_ALLOWLIST);
  const ipOk = ipAllowlistOk(request, allowlist);
  const clientIp = clientIpFromRequest(request);

  const requireAal2 = envFlag('ADMIN_SENTINEL_REQUIRE_AAL2');
  const aal = accessToken ? jwtAssuranceLevelFromAccessToken(accessToken) : 'unknown';
  const mfaOk = !requireAal2 || aal === 'aal2';

  const ok = ipOk && mfaOk;

  return Response.json(
    {
      ok,
      clientIp,
      ipAllowlistEnabled: allowlist.length > 0,
      ipOk,
      mfaRequired: requireAal2,
      aal,
      mfaOk,
      hint: ok
        ? null
        : !ipOk
          ? 'IP غير مسموح: أضف عنوانك إلى ADMIN_SENTINEL_IP_ALLOWLIST على الخادم (Vercel).'
          : 'يلزم MFA على حساب المدير (aal2). فعّل خطوة ثانية في Supabase ثم أعد تسجيل الدخول.',
    },
    { status: ok ? 200 : 403, headers },
  );
}
