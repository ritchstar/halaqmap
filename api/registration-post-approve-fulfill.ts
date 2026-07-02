/**
 * POST /api/registration-post-approve-fulfill
 * استرداد تلقائي لقسائم الدفع المعلّقة بعد اعتماد طلب التسجيل وربط barberId.
 */
import { createClient } from '@supabase/supabase-js';
import { verifyManageBarbersAdminFromRequest } from './_lib/adminManageBarbersAuth.js';
import {
  autoRedeemIssuedVouchersForRegistration,
  ensureDigitalShiftAddonFromPaidOrders,
} from './_lib/listingLicenseService.js';
import { buildPublicApiCorsHeaders, publicApiOptionsResponse, rejectIfPublicApiCorsBlocked } from './_lib/publicApiCors.js';

export const config = { maxDuration: 45 };

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const ORDER_ID_RE = /^HM-\d{8}-[A-Z0-9]{6}$/;

const CORS_OPTS = {
  allowMethods: 'POST, OPTIONS',
  allowHeaders: 'Content-Type, Authorization, x-client-supabase-url, x-supabase-anon',
} as const;

function corsHeaders(request: Request): Record<string, string> {
  return buildPublicApiCorsHeaders(request, CORS_OPTS).headers;
}

export async function OPTIONS(request: Request): Promise<Response> {
  return publicApiOptionsResponse(request, CORS_OPTS);
}

type Body = {
  registrationRequestId?: unknown;
  barberId?: unknown;
};

export async function POST(request: Request): Promise<Response> {
  const blocked = rejectIfPublicApiCorsBlocked(request, CORS_OPTS);
  if (blocked) return blocked;
  const headers = corsHeaders(request);

  const url = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').trim();
  const serviceRole = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  if (!url || !serviceRole) {
    return Response.json({ error: 'server_misconfigured' }, { status: 503, headers });
  }

  const admin = await verifyManageBarbersAdminFromRequest(request, url, serviceRole);
  if (!admin.ok) {
    return Response.json({ error: 'unauthorized' }, { status: admin.status, headers });
  }

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return Response.json({ error: 'invalid_json' }, { status: 400, headers });
  }

  const registrationRequestId = String(body.registrationRequestId ?? '').trim();
  const barberId = String(body.barberId ?? '').trim();

  if (!ORDER_ID_RE.test(registrationRequestId)) {
    return Response.json({ error: 'invalid_registration_request_id' }, { status: 400, headers });
  }
  if (!UUID_RE.test(barberId)) {
    return Response.json({ error: 'invalid_barber_id' }, { status: 400, headers });
  }

  const supabase = createClient(url, serviceRole, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const result = await autoRedeemIssuedVouchersForRegistration(supabase, {
    registrationRequestId,
    barberId,
  });

  if (!result.ok) {
    return Response.json({ error: result.error }, { status: 500, headers });
  }

  const digitalShiftActivated = await ensureDigitalShiftAddonFromPaidOrders(supabase, barberId);

  return Response.json(
    {
      ok: true,
      redeemedCount: result.redeemedCount,
      skippedAlreadyRedeemed: result.skippedAlreadyRedeemed,
      validUntil: result.validUntil,
      listingActivated: result.redeemedCount > 0,
      digitalShiftActivated,
    },
    { headers },
  );
}
