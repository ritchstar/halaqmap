import type { SupabaseClient } from '@supabase/supabase-js';
import {
  isBootstrapAdminEmail,
  safeHost,
  verifyPlatformAdminFromRequestAny,
} from './_lib/adminManageBarbersAuth.js';
import { buildPublicApiCorsHeaders, publicApiOptionsResponse, rejectIfPublicApiCorsBlocked } from './_lib/publicApiCors.js';
import { isLikelyHttpUrl, normalizeSupabaseUrl } from './_lib/supabaseUrl.js';

export const config = { maxDuration: 30 };

const CORS_OPTS = {
  allowMethods: 'GET, POST, OPTIONS',
  allowHeaders: 'Content-Type, Authorization, x-client-supabase-url',
} as const;

const CATEGORIES = new Set([
  'field_issue',
  'partner_friction',
  'compliance',
  'billing_ops',
  'geo_presence',
  'other',
]);

const SEVERITIES = new Set(['info', 'watch', 'urgent']);

const OPS_MANAGER_ROLE = 'OPS_MANAGER';

function corsHeaders(request: Request): Record<string, string> {
  return buildPublicApiCorsHeaders(request, CORS_OPTS).headers;
}

function json(data: unknown, status: number, request: Request): Response {
  return Response.json(data, {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'private, no-store, max-age=0, must-revalidate',
      ...corsHeaders(request),
    },
  });
}

function getServiceEnv(): { url: string; serviceRole: string } | null {
  const url = normalizeSupabaseUrl(process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL);
  const serviceRole = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  if (!url || !isLikelyHttpUrl(url) || !serviceRole) return null;
  return { url, serviceRole };
}

function mapRow(raw: Record<string, unknown>) {
  return {
    id: String(raw.id),
    submittedAt: String(raw.submitted_at ?? raw.created_at ?? ''),
    clientId: String(raw.client_id ?? ''),
    clientLabel: raw.client_label != null ? String(raw.client_label) : undefined,
    reporterEmail: String(raw.reporter_email ?? ''),
    reporterRole: OPS_MANAGER_ROLE,
    category: String(raw.category ?? 'other'),
    severity: String(raw.severity ?? 'info'),
    title: String(raw.title ?? ''),
    summary: String(raw.summary ?? ''),
    detail:
      raw.detail && typeof raw.detail === 'object' && !Array.isArray(raw.detail)
        ? (raw.detail as Record<string, unknown>)
        : undefined,
  };
}

async function actorCanViewAllReports(
  supabase: SupabaseClient,
  actorEmail: string,
): Promise<boolean> {
  if (isBootstrapAdminEmail(actorEmail)) return true;
  const { data } = await supabase
    .from('platform_admin_roles')
    .select('permissions')
    .eq('email', actorEmail)
    .maybeSingle();
  const perms =
    data?.permissions && typeof data.permissions === 'object'
      ? (data.permissions as Record<string, unknown>)
      : {};
  return Boolean(perms.view_ops_controller || perms.view_overview);
}

export async function OPTIONS(request: Request): Promise<Response> {
  return publicApiOptionsResponse(request, CORS_OPTS);
}

export async function GET(request: Request): Promise<Response> {
  const blocked = rejectIfPublicApiCorsBlocked(request, CORS_OPTS);
  if (blocked) return blocked;

  const env = getServiceEnv();
  if (!env) {
    return json({ error: 'Server not configured', serverUrlHost: safeHost('') }, 503, request);
  }

  const gate = await verifyPlatformAdminFromRequestAny(request, env.url, env.serviceRole, [
    'view_ops_controller',
    'submit_ops_controller',
    'view_overview',
  ]);
  if (gate.ok === false) {
    return json(gate.json, gate.status, request);
  }

  const urlObj = new URL(request.url);
  const limitRaw = Number(urlObj.searchParams.get('limit') || '40');
  const limit = Number.isFinite(limitRaw) ? Math.min(Math.max(Math.floor(limitRaw), 1), 100) : 40;

  let query = gate.supabase
    .from('platform_ops_controller_reports')
    .select(
      'id, created_at, submitted_at, client_id, client_label, reporter_email, reporter_role, category, severity, title, summary, detail',
    )
    .order('submitted_at', { ascending: false })
    .limit(limit);

  const seeAll = await actorCanViewAllReports(gate.supabase, gate.actorEmail);
  if (!seeAll) {
    query = query.eq('reporter_email', gate.actorEmail);
  }

  const { data, error } = await query;
  if (error) {
    return json({ error: error.message || 'Feed query failed' }, 500, request);
  }

  const reports = (Array.isArray(data) ? data : []).map((row) =>
    mapRow(row as Record<string, unknown>),
  );

  return json({ reports }, 200, request);
}

export async function POST(request: Request): Promise<Response> {
  const blocked = rejectIfPublicApiCorsBlocked(request, CORS_OPTS);
  if (blocked) return blocked;

  const env = getServiceEnv();
  if (!env) {
    return json({ error: 'Server not configured' }, 503, request);
  }

  const gate = await verifyPlatformAdminFromRequestAny(request, env.url, env.serviceRole, [
    'submit_ops_controller',
  ]);
  if (gate.ok === false) {
    return json(gate.json, gate.status, request);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid JSON body' }, 400, request);
  }

  const payload = body as Record<string, unknown>;
  const clientId = String(payload.clientId ?? '').trim();
  const clientLabel = String(payload.clientLabel ?? '').trim();
  const category = String(payload.category ?? '').trim();
  const severity = String(payload.severity ?? 'info').trim();
  const title = String(payload.title ?? '').trim();
  const summary = String(payload.summary ?? '').trim();

  if (!clientId) {
    return json({ error: 'clientId is required' }, 400, request);
  }
  if (!CATEGORIES.has(category)) {
    return json({ error: 'Invalid category', allowed: [...CATEGORIES] }, 400, request);
  }
  if (!SEVERITIES.has(severity)) {
    return json({ error: 'Invalid severity', allowed: [...SEVERITIES] }, 400, request);
  }
  if (title.length < 4) {
    return json({ error: 'title too short' }, 400, request);
  }
  if (summary.length < 12) {
    return json({ error: 'summary too short' }, 400, request);
  }

  const submittedAt = new Date().toISOString();
  const insertRow = {
    submitted_at: submittedAt,
    client_id: clientId,
    client_label: clientLabel || null,
    reporter_email: gate.actorEmail,
    reporter_role: OPS_MANAGER_ROLE,
    category,
    severity,
    title,
    summary,
    detail: {
      source: 'ops_controller_ui',
      submitted_at: submittedAt,
      client_id: clientId,
    },
  };

  const { data, error } = await gate.supabase
    .from('platform_ops_controller_reports')
    .insert(insertRow)
    .select(
      'id, created_at, submitted_at, client_id, client_label, reporter_email, reporter_role, category, severity, title, summary, detail',
    )
    .single();

  if (error || !data) {
    return json({ error: error?.message || 'Insert failed' }, 500, request);
  }

  return json({ ok: true, report: mapRow(data as Record<string, unknown>) }, 201, request);
}
