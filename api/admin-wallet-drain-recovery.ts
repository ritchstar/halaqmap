/**
 * فحص/استرداد نزيف محفظة المناوب — للمشرف أو cron secret.
 *
 * POST { barberId?, dryRun?: boolean, lookbackDays?: number }
 * Authorization: Bearer <CRON_SECRET|OPS_*_CRON_SECRET>
 */
import { createClient } from '@supabase/supabase-js';
import { isCronAuthorized } from './_lib/cronAuth.js';
import { buildPublicApiCorsHeaders, publicApiOptionsResponse, rejectIfPublicApiCorsBlocked } from './_lib/publicApiCors.js';
import {
  auditBarberWalletDrain,
  formatWalletDrainSummaryAr,
  recoverBarberWalletDrain,
  scanWalletDrainRecovery,
  walletDrainAutoRecoverEnabled,
} from './_lib/walletDrainRecovery.js';
import { dispatchWalletDrainRecoveryEmail } from './_lib/walletDrainRecoveryMail.js';

export const config = {
  maxDuration: 60,
};

const CORS_OPTS = {
  allowMethods: 'GET, POST, OPTIONS',
  allowHeaders: 'Content-Type, Authorization, x-ops-billing-cron-authorization',
} as const;

function corsHeaders(request: Request): Record<string, string> {
  return buildPublicApiCorsHeaders(request, CORS_OPTS).headers;
}

export async function OPTIONS(request: Request): Promise<Response> {
  return publicApiOptionsResponse(request, CORS_OPTS);
}

function assertAuthorized(request: Request): { ok: true } | { ok: false; status: number; message: string } {
  if (isCronAuthorized(request)) return { ok: true };
  const internal = (process.env.WALLET_DRAIN_INTERNAL_SECRET || process.env.CRON_SECRET || '').trim();
  const auth = request.headers.get('authorization')?.trim() ?? '';
  if (internal && auth === `Bearer ${internal}`) return { ok: true };
  return { ok: false, status: 401, message: 'Unauthorized — cron secret required' };
}

export async function GET(request: Request): Promise<Response> {
  const blocked = rejectIfPublicApiCorsBlocked(request, CORS_OPTS);
  if (blocked) return blocked;
  const headers = corsHeaders(request);
  return Response.json(
    {
      ok: true,
      route: 'admin-wallet-drain-recovery',
      autoRecoverDefault: walletDrainAutoRecoverEnabled(),
      usage: 'POST { barberId?, dryRun?, lookbackDays? } with Authorization: Bearer <CRON_SECRET>',
    },
    { headers },
  );
}

export async function POST(request: Request): Promise<Response> {
  const blocked = rejectIfPublicApiCorsBlocked(request, CORS_OPTS);
  if (blocked) return blocked;
  const headers = corsHeaders(request);

  const auth = assertAuthorized(request);
  if (!auth.ok) {
    return Response.json({ error: auth.message }, { status: auth.status, headers });
  }

  const url = (process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '').trim();
  const serviceRole = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  if (!url || !serviceRole) {
    return Response.json(
      { error: 'Server not configured (SUPABASE_SERVICE_ROLE_KEY / URL)' },
      { status: 503, headers },
    );
  }

  let body: Record<string, unknown> = {};
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400, headers });
  }

  const barberId = String(body.barberId ?? '').trim() || undefined;
  const dryRun = body.dryRun === true || (body.dryRun !== false && !walletDrainAutoRecoverEnabled());
  const lookbackDaysRaw = Number(body.lookbackDays);
  const lookbackDays =
    Number.isFinite(lookbackDaysRaw) && lookbackDaysRaw >= 1 ? Math.min(90, lookbackDaysRaw) : undefined;

  const supabase = createClient(url, serviceRole, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  if (barberId && body.auditOnly === true) {
    const audit = await auditBarberWalletDrain(supabase, barberId, lookbackDays);
    return Response.json({ ok: true, auditOnly: true, audit }, { headers });
  }

  if (barberId) {
    const result = await recoverBarberWalletDrain(supabase, barberId, { dryRun, lookbackDays });
    if (result.recoveredHalalas > 0 && !result.dryRun) {
      await dispatchWalletDrainRecoveryEmail(supabase, result);
    }
    return Response.json(
      {
        ok: true,
        summary: formatWalletDrainSummaryAr(result),
        result,
      },
      { headers },
    );
  }

  const scan = await scanWalletDrainRecovery(supabase, { dryRun, lookbackDays });
  for (const result of scan.results) {
    if (result.recoveredHalalas > 0 && !result.dryRun) {
      await dispatchWalletDrainRecoveryEmail(supabase, result);
    }
  }

  return Response.json({ ok: true, scan }, { headers });
}
