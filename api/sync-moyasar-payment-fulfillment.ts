/**
 * GET /api/sync-moyasar-payment-fulfillment?paymentId=
 * استعادة تفعيل الرخصة بعد دفع ميسر ناجح إذا فشل webhook أو أُعيد idempotent بلا طلب.
 */
import { createClient } from '@supabase/supabase-js';
import { syncMoyasarPaidFulfillment } from './_lib/moyasarPaidFulfillmentSync.js';
import { dispatchPartnerActivationMailAfterFulfill } from './_lib/partnerActivationMailDispatch.js';
import { runRegistrationRouteGuards } from './_lib/registrationRouteGuard.js';
import {
  buildPublicApiCorsHeaders,
  publicApiOptionsResponse,
  rejectIfPublicApiCorsBlocked,
} from './_lib/publicApiCors.js';

export const config = { maxDuration: 60 };

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const CORS_OPTS = {
  allowMethods: 'GET, OPTIONS',
  allowHeaders: 'Content-Type',
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

  const guard = runRegistrationRouteGuards(request, 'sync-moyasar-payment-fulfillment');
  if (guard.ok === false) {
    return Response.json(guard.json, { status: guard.status, headers });
  }

  const url = new URL(request.url);
  const paymentId = (url.searchParams.get('paymentId') || url.searchParams.get('id') || '').trim();
  if (!paymentId || !UUID_RE.test(paymentId)) {
    return Response.json(
      { ok: false, error: 'invalid_payment_id', hint: 'Provide ?paymentId=<moyasar-uuid>' },
      { status: 400, headers },
    );
  }

  const supabaseUrl = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').trim();
  const serviceRole = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  if (!supabaseUrl || !serviceRole) {
    return Response.json({ ok: false, error: 'server_misconfigured' }, { status: 503, headers });
  }

  const supabase = createClient(supabaseUrl, serviceRole, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const result = await syncMoyasarPaidFulfillment(supabase, paymentId);
  if (!result.ok) {
    return Response.json({ ok: false, error: result.error }, { status: result.status, headers });
  }

  let activationMail: Awaited<ReturnType<typeof dispatchPartnerActivationMailAfterFulfill>> = null;
  if (result.certificate) {
    try {
      activationMail = await dispatchPartnerActivationMailAfterFulfill(supabase, {
        moyasarPaymentId: paymentId,
        barberId: result.mapBind?.barberId ?? null,
        certificate: result.certificate,
      });
    } catch {
      /* البريد ثانوي — الشهادة أولوية للواجهة */
    }
  }

  return Response.json(
    {
      ok: true,
      alreadyFulfilled: result.alreadyFulfilled,
      orderId: result.orderId,
      certificate: result.certificate ?? null,
      mapBind: result.mapBind ?? null,
      unifiedActivationEmailed: activationMail?.unifiedActivationEmailed === true,
    },
    { headers },
  );
}
