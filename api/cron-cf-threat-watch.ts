/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
/**
 * cron-cf-threat-watch — عتبة تهديدات Cloudflare GraphQL (آخر ساعة)
 * بدون Logpush: يعتمد على المجمّعات فقط ثم opsEventRouter.
 *
 * Env:
 *  · CF_THREAT_ALERT_HOUR_THRESHOLD (افتراضي 80)
 *  · CLOUDFLARE_API_TOKEN + CLOUDFLARE_ZONE_ID
 */
import { verifyVercelCronRequest } from './_lib/vercelCronAuth.js';
import {
  cfConfigured,
  cfThreatAlertHourThreshold,
  getCfThreatAnalytics,
} from './_lib/cloudflareGuard.js';
import { createOpsServiceSupabase, routeOpsEvent } from './_lib/opsEventRouter.js';

export const config = { maxDuration: 45 };

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

  if (!cfConfigured()) {
    return Response.json(
      {
        ok: true,
        skipped: true,
        reason: 'cloudflare_not_configured',
        route: 'cron-cf-threat-watch',
      },
      { headers },
    );
  }

  const threshold = cfThreatAlertHourThreshold();
  const analytics = await getCfThreatAnalytics(24);

  if (!analytics.ok) {
    return Response.json(
      {
        ok: false,
        route: 'cron-cf-threat-watch',
        error: analytics.error || 'analytics_failed',
      },
      { status: 502, headers },
    );
  }

  const lastHour = analytics.lastHourThreats;
  if (lastHour < threshold) {
    return Response.json(
      {
        ok: true,
        route: 'cron-cf-threat-watch',
        alerted: false,
        lastHourThreats: lastHour,
        threshold,
        threats24h: analytics.threats,
        fromCache: analytics.fromCache === true,
        ranAtIso: new Date().toISOString(),
      },
      { headers },
    );
  }

  const base = createOpsServiceSupabase();
  if (base.ok === false) {
    return Response.json({ error: base.error }, { status: 503, headers });
  }

  const hourKey = new Date().toISOString().slice(0, 13);
  const dispatch = await routeOpsEvent(base.supabase, {
    type: 'edge.threat_spike',
    severity: lastHour >= threshold * 2 ? 'urgent' : 'watch',
    title: 'ارتفاع تهديدات Cloudflare (مجمّع GraphQL)',
    summary: `آخر ساعة: ${lastHour} تهديد (العتبة ${threshold}). إجمالي 24س: ${analytics.threats}. المسار بدون Logpush — ملخص حافة فقط.`,
    category: 'other',
    detail: {
      lastHourThreats: lastHour,
      lastHourRequests: analytics.lastHourRequests,
      threats24h: analytics.threats,
      totalRequests24h: analytics.totalRequests,
      threshold,
      source: 'cloudflare_graphql',
    },
    dedupeKey: `edge.threat_spike:${hourKey}`,
    dedupeHours: 1,
  });

  return Response.json(
    {
      ok: true,
      route: 'cron-cf-threat-watch',
      alerted: !dispatch.skipped,
      skipped: Boolean(dispatch.skipped),
      skipReason: dispatch.skipReason,
      lastHourThreats: lastHour,
      threshold,
      threats24h: analytics.threats,
      dispatch,
      ranAtIso: new Date().toISOString(),
    },
    { headers },
  );
}
