import { verifyPlatformAdminFromRequestAny } from './_lib/adminManageBarbersAuth.js';
import {
  persistHandshake,
  readStoredHandshake,
  runEngineeringWingHandshake,
  secretsDiagnostics,
} from './_lib/engineeringWingHandshake.js';

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
  const serverUrl = (process.env.SUPABASE_URL || '').trim();
  const serviceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  const auth = await verifyPlatformAdminFromRequestAny(request, serverUrl, serviceKey, [
    'manage_admins',
    'view_overview',
  ]);
  if (auth.ok === false) return json(auth.json, auth.status);

  let stored = await readStoredHandshake(auth.supabase);
  const diagnostics = secretsDiagnostics();

  // Auto-run handshake if the founder row is still in 'pending' (never executed)
  // OR if the last result is older than 12h. Avoids the FAIL-by-default state
  // where the UI reports red simply because no one clicked the button yet.
  const TWELVE_HOURS_MS = 12 * 60 * 60 * 1000;
  const lastChecked = stored?.updated_at ? Date.parse(stored.updated_at) : null;
  const isStale = lastChecked != null && Date.now() - lastChecked > TWELVE_HOURS_MS;
  const shouldAutoRun = !stored || stored.status === 'pending' || isStale;

  if (shouldAutoRun) {
    try {
      const result = await runEngineeringWingHandshake();
      await persistHandshake(auth.supabase, result, auth.actorEmail);
      stored = await readStoredHandshake(auth.supabase);
    } catch {
      // Surface whatever was stored previously; the manual button can retry.
    }
  }

  return json({
    ok: true,
    bootstrapRequired: true,
    autoRan: shouldAutoRun,
    stored: stored
      ? {
          status: stored.status,
          handshakeAt: stored.handshake_at,
          services: stored.services,
          vercelDeploymentUrl: stored.vercel_deployment_url,
          vercelDeploymentId: stored.vercel_deployment_id,
          opsControllerEnabled: stored.ops_controller_enabled,
          updatedAt: stored.updated_at,
        }
      : null,
    diagnostics,
  });
}

export async function POST(request: Request): Promise<Response> {
  const serverUrl = (process.env.SUPABASE_URL || '').trim();
  const serviceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  const auth = await verifyPlatformAdminFromRequestAny(request, serverUrl, serviceKey, [
    'manage_admins',
  ]);
  if (auth.ok === false) return json(auth.json, auth.status);

  let body: Record<string, unknown> = {};
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    body = {};
  }

  const action = String(body.action || 'handshake').trim();
  if (action !== 'handshake') {
    return json({ error: 'Unsupported action' }, 400);
  }

  const result = await runEngineeringWingHandshake();

  try {
    await persistHandshake(auth.supabase, result, auth.actorEmail);
  } catch (err) {
    return json(
      {
        ok: false,
        error: 'handshake_persist_failed',
        messageAr: 'نجح الفحص محلياً لكن فشل حفظ الحالة — نفّذ migration 86 على Supabase.',
        result,
        persistError: err instanceof Error ? err.message : String(err),
      },
      500,
    );
  }

  return json({
    ok: true,
    action,
    systemStatus: result.status === 'ok' ? 'OK' : 'FAIL',
    opsControllerEnabled: result.opsControllerEnabled,
    vercelDeploymentUrl: result.vercelDeploymentUrl,
    result,
  });
}
