import { verifyVercelCronRequest } from './_lib/vercelCronAuth.js';
import { createOpsServiceSupabase, runOpsHealthScan } from './_lib/opsEventRouter.js';

export const config = { maxDuration: 60 };

function corsHeaders(request: Request): Record<string, string> {
  const origin = request.headers.get('origin');
  return {
    'Access-Control-Allow-Origin': origin || '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-vercel-cron-secret',
    'Access-Control-Max-Age': '86400',
  };
}

export async function OPTIONS(request: Request): Promise<Response> {
  return new Response(null, { status: 204, headers: corsHeaders(request) });
}

export async function GET(request: Request): Promise<Response> {
  const headers = corsHeaders(request);
  const auth = verifyVercelCronRequest(request);
  if (!auth.ok) {
    return Response.json(auth.json, { status: auth.status, headers });
  }

  const base = createOpsServiceSupabase();
  if (base.ok === false) {
    return Response.json({ error: base.error }, { status: 503, headers });
  }

  try {
    const results = await runOpsHealthScan(base.supabase);
    return Response.json(
      {
        ok: true,
        route: 'cron-ops-health-scan',
        eventsDispatched: results.length,
        skipped: results.filter((r) => r.skipped).length,
        ranAtIso: new Date().toISOString(),
      },
      { headers },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Health scan failed';
    return Response.json({ error: message }, { status: 500, headers });
  }
}
