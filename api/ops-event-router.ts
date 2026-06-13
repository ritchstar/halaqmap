/**
 * Ops Event Router — محرك أحداث تشغيلي صامت (بدون محادثة مع المستخدمين).
 * POST: حدث مُ normaliz ed أو webhook Supabase Database
 * GET ?scan=1: فحص صحة دوري (cron أو مشرف)
 */
import { verifyPlatformAdminFromRequestAny } from './_lib/adminManageBarbersAuth.js';
import { isCronAuthorized } from './_lib/cronAuth.js';
import {
  createOpsServiceSupabase,
  opsEventRouterDiagnostics,
  parseAndRouteOpsRequestBody,
  runOpsHealthScan,
  verifyOpsEventRouterRequest,
} from './_lib/opsEventRouter.js';

export const config = { maxDuration: 60 };

function json(data: unknown, status = 200): Response {
  return Response.json(data, {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'private, no-store, max-age=0, must-revalidate',
    },
  });
}

export async function GET(request: Request): Promise<Response> {
  const urlObj = new URL(request.url);
  const isScan = urlObj.searchParams.get('scan') === '1';

  if (!isScan) {
    return json({
      ok: true,
      route: 'ops-event-router',
      ...opsEventRouterDiagnostics(),
      usage: {
        post: 'POST JSON event { type, title, summary, ... } or Supabase webhook body',
        scan: 'GET ?scan=1 with cron secret or admin JWT',
      },
    });
  }

  const base = createOpsServiceSupabase();
  if (base.ok === false) return json({ error: base.error }, 503);

  const isCron = isCronAuthorized(request);
  if (!isCron && !verifyOpsEventRouterRequest(request)) {
    const gate = await verifyPlatformAdminFromRequestAny(
      request,
      process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || '',
      ['view_overview', 'view_ops_controller'],
    );
    if (gate.ok === false) {
      return json(gate.json, gate.status);
    }
  }

  try {
    const results = await runOpsHealthScan(base.supabase);
    return json({
      ok: true,
      route: 'ops-event-router',
      mode: 'health_scan',
      eventsDispatched: results.length,
      skipped: results.filter((r) => r.skipped).length,
      results: results.map((r) => ({
        type: r.type,
        severity: r.severity,
        skipped: r.skipped,
        skipReason: r.skipReason,
        opsReport: r.actions.opsReport?.ok,
        slack: r.actions.slack?.ok ?? r.actions.slack?.skipped,
        email: r.actions.email?.ok ?? r.actions.email?.skipped,
      })),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Health scan failed';
    return json({ error: message }, 500);
  }
}

export async function POST(request: Request): Promise<Response> {
  if (!verifyOpsEventRouterRequest(request)) {
    return json({ error: 'Unauthorized' }, 401);
  }

  const base = createOpsServiceSupabase();
  if (base.ok === false) return json({ error: base.error }, 503);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid JSON body' }, 400);
  }

  try {
    const { events, results } = await parseAndRouteOpsRequestBody(base.supabase, body);
    if (events.length === 0) {
      return json({ error: 'No routable events in body' }, 400);
    }
    return json({
      ok: true,
      route: 'ops-event-router',
      received: events.length,
      results,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Route failed';
    return json({ error: message }, 500);
  }
}
