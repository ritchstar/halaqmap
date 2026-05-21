import { verifyPlatformAdminFromRequestAny } from './_lib/adminManageBarbersAuth.js';
import {
  buildWorkingPapersFromContext,
  draftPreventiveRadarReport,
  evaluateProsecutorInterject,
  loadPublicProsecutorLabContext,
  repairRegistrationSubmissionsCompliance,
} from './_lib/publicProsecutorLab.js';

export const config = { maxDuration: 60 };

const PROSECUTOR_PERMS = ['manage_admins', 'view_overview'] as const;

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
    ...PROSECUTOR_PERMS,
  ]);
  if (auth.ok === false) return json(auth.json, auth.status);

  const ctx = await loadPublicProsecutorLabContext(auth.supabase);
  const workingPapers = buildWorkingPapersFromContext(ctx);
  const sovereigntyAlerts = workingPapers.filter(
    (p) => p.severity === 'urgent' || p.kind === 'compliance_deviation',
  ).length;

  return json({
    ok: true,
    anchorLabelAr: ctx.anchorLabelAr,
    workingPapers,
    sovereigntyAlerts,
    inspectorPulseCount24h: ctx.inspectorPulseCount24h,
    complianceGaps: ctx.complianceGaps,
    crisisWatchActive: ctx.crisisWatchActive,
    lastSyncedAt: new Date().toISOString(),
    governanceContext: ctx,
  });
}

export async function POST(request: Request): Promise<Response> {
  const serverUrl = (process.env.SUPABASE_URL || '').trim();
  const serviceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  const auth = await verifyPlatformAdminFromRequestAny(request, serverUrl, serviceKey, [
    ...PROSECUTOR_PERMS,
  ]);
  if (auth.ok === false) return json(auth.json, auth.status);

  let body: Record<string, unknown> = {};
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return json({ error: 'Invalid JSON body' }, 400);
  }

  const action = String(body.action || 'sync_radar').trim();
  const ctx = await loadPublicProsecutorLabContext(auth.supabase);

  if (action === 'sync_radar') {
    const result = await draftPreventiveRadarReport(auth.supabase, auth.actorEmail, ctx);
    return json({
      ok: true,
      action,
      ...result,
      workingPapers: buildWorkingPapersFromContext(ctx),
    });
  }

  if (action === 'audit_compliance') {
    return json({
      ok: true,
      action,
      complianceGaps: ctx.complianceGaps,
      complianceGapSamples: ctx.complianceGapSamples,
      workingPapers: buildWorkingPapersFromContext(ctx),
    });
  }

  if (action === 'evaluate_interject') {
    const userMessage = String(body.userMessage || '').trim();
    const assistantSnippet = String(body.assistantSnippet || '').trim() || undefined;
    const watchAgent = String(body.watchAgent || '').trim() || undefined;
    const crisisMode = body.crisisMode === true;
    const interject = evaluateProsecutorInterject({
      userMessage,
      assistantSnippet,
      watchAgent,
      crisisMode,
    });
    return json({ ok: true, action, interject });
  }

  if (action === 'repair_compliance') {
    const result = await repairRegistrationSubmissionsCompliance(auth.supabase);
    const ctx = await loadPublicProsecutorLabContext(auth.supabase);
    return json({
      ok: true,
      action,
      ...result,
      workingPapers: buildWorkingPapersFromContext(ctx),
      complianceGaps: ctx.complianceGaps,
    });
  }

  return json(
    {
      error: 'Unknown action',
      allowed: ['sync_radar', 'audit_compliance', 'evaluate_interject', 'repair_compliance'],
    },
    400,
  );
}
