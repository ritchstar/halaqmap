/**
 * Operations Intelligence Report — daily founder briefing from OPS_MANAGER field reports.
 * Cron: GET ?cron=1 at 05:00 UTC (08:00 Asia/Riyadh) via vercel.json
 */
import { createClient } from '@supabase/supabase-js';
import { verifyPlatformAdminFromRequestAny } from './_lib/adminManageBarbersAuth.js';
import { isCronAuthorized } from './_lib/cronAuth.js';
import { runOpsIntelligenceReport } from './_lib/opsIntelligenceReport.js';
import { isLikelyHttpUrl, normalizeSupabaseUrl } from './_lib/supabaseUrl.js';

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

async function getServiceSupabase() {
  const url = normalizeSupabaseUrl(process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL);
  const serviceRole = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  if (!url || !isLikelyHttpUrl(url) || !serviceRole) {
    return { ok: false as const, status: 503, body: { error: 'Server not configured' } };
  }
  const supabase = createClient(url, serviceRole, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return { ok: true as const, supabase, url };
}

export async function GET(request: Request): Promise<Response> {
  const base = await getServiceSupabase();
  if (base.ok === false) return json(base.body, base.status);

  const urlObj = new URL(request.url);
  const isCron = urlObj.searchParams.get('cron') === '1';
  const force = urlObj.searchParams.get('force') === '1';

  if (isCron) {
    if (!isCronAuthorized(request)) {
      return json({ error: 'Unauthorized cron' }, 401);
    }
  } else {
    const gate = await verifyPlatformAdminFromRequestAny(
      request,
      base.url,
      process.env.SUPABASE_SERVICE_ROLE_KEY || '',
      ['view_overview', 'view_ops_controller'],
    );
    if (gate.ok === false) {
      return json(gate.json, gate.status);
    }
    if (!gate.actorEmail) {
      return json({ error: 'Unauthorized' }, 401);
    }
  }

  try {
    const result = await runOpsIntelligenceReport(base.supabase, { force: force || isCron });
    return json({
      ok: true,
      route: 'ops-intelligence-report',
      skipped: result.skipped ?? false,
      reason: result.reason,
      reportId: result.reportId,
      digestYmd: result.briefing.digestYmd,
      totalFieldReports: result.briefing.totalReports,
      redFlags: result.briefing.redFlags.length,
      patterns: result.briefing.patterns.length,
      email: result.email,
      summary: result.briefing.summaryText,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Report generation failed';
    return json({ error: message }, 500);
  }
}
