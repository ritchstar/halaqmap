import { createClient } from '@supabase/supabase-js';
import { verifyVercelCronRequest } from './_lib/vercelCronAuth.js';
import { emitOpsEventFireAndForget } from './_lib/opsEventRouter.js';
import {
  formatWalletDrainSummaryAr,
  scanWalletDrainRecovery,
  walletDrainAutoRecoverEnabled,
} from './_lib/walletDrainRecovery.js';
import { dispatchWalletDrainRecoveryEmail } from './_lib/walletDrainRecoveryMail.js';

export const config = {
  maxDuration: 60,
};

function corsHeaders(request: Request): Record<string, string> {
  const origin = request.headers.get('origin');
  return {
    'Access-Control-Allow-Origin': origin || '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
  };
}

export async function OPTIONS(request: Request): Promise<Response> {
  return new Response(null, { status: 204, headers: corsHeaders(request) });
}

async function runScan(request: Request, dryRunOverride?: boolean): Promise<Response> {
  const headers = corsHeaders(request);
  const gate = verifyVercelCronRequest(request);
  if (gate.ok === false) {
    return Response.json(gate.json, { status: gate.status, headers });
  }

  const url = (process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '').trim();
  const serviceRole = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  if (!url || !serviceRole) {
    return Response.json(
      { error: 'Server not configured (SUPABASE_SERVICE_ROLE_KEY / URL)' },
      { status: 503, headers },
    );
  }

  const dryRun =
    dryRunOverride ??
    (new URL(request.url).searchParams.get('dryRun') === '1' || !walletDrainAutoRecoverEnabled());

  const supabase = createClient(url, serviceRole, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const scan = await scanWalletDrainRecovery(supabase, { dryRun });

  for (const result of scan.results) {
    if (result.recoveredHalalas > 0 && !result.dryRun) {
      void dispatchWalletDrainRecoveryEmail(supabase, result).catch(() => undefined);
    }
  }

  if (scan.totalOrphanHalalas > 0 || scan.totalRecoveredHalalas > 0) {
    const summaries = scan.results.slice(0, 8).map(formatWalletDrainSummaryAr).join(' · ');
    emitOpsEventFireAndForget({
      type: 'api.error',
      severity: scan.totalRecoveredHalalas > 0 ? 'urgent' : 'watch',
      title: scan.dryRun ? 'فحص نزيف محفظة المناوب (dry-run)' : 'استرداد نزيف محفظة المناوب',
      summary: [
        `صالونات: ${scan.barbersWithOrphans}/${scan.barbersScanned}`,
        `يتيم: ${(scan.totalOrphanHalalas / 100).toFixed(2)} ر.س`,
        scan.dryRun ? 'لم يُسترد (dry-run)' : `مُسترد: ${(scan.totalRecoveredHalalas / 100).toFixed(2)} ر.س`,
        summaries,
      ].join(' — '),
      category: 'billing_ops',
      dedupeKey: `wallet.drain:${scan.dryRun ? 'dry' : 'live'}:${new Date().toISOString().slice(0, 10)}`,
      dedupeHours: 6,
      detail: {
        dryRun: scan.dryRun,
        barbersScanned: scan.barbersScanned,
        barbersWithOrphans: scan.barbersWithOrphans,
        totalOrphanHalalas: scan.totalOrphanHalalas,
        totalRecoveredHalalas: scan.totalRecoveredHalalas,
      },
    });
  }

  return Response.json(
    {
      ok: true,
      route: 'cron-wallet-drain-recovery',
      ranAtIso: new Date().toISOString(),
      ...scan,
    },
    { headers },
  );
}

export async function GET(request: Request): Promise<Response> {
  return runScan(request);
}

export async function POST(request: Request): Promise<Response> {
  let dryRun: boolean | undefined;
  try {
    const body = (await request.json()) as { dryRun?: boolean };
    if (typeof body.dryRun === 'boolean') dryRun = body.dryRun;
  } catch {
    /* GET-style cron */
  }
  return runScan(request, dryRun);
}
