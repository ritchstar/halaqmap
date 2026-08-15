/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
/**
 * مركز كوافير ماب للإدارة — قائمة المهتمات من coiffeur_interest_signups.
 * قراءة فقط بعد تحقق أدمن. لا يُعرض العدد في الواجهة العامة.
 */
import { createClient } from '@supabase/supabase-js';
import { verifyPlatformAdminFromRequestAny } from './_lib/adminManageBarbersAuth.js';
import { buildPublicApiCorsHeaders, publicApiOptionsResponse, rejectIfPublicApiCorsBlocked } from './_lib/publicApiCors.js';

export const config = { maxDuration: 20 };

const TABLE = 'coiffeur_interest_signups';
const MAX_ROWS = 200;

const CORS_OPTS = {
  allowMethods: 'GET, OPTIONS',
  allowHeaders: 'Content-Type, Authorization, x-client-supabase-url, x-supabase-anon',
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

  const serverUrl = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').trim();
  const serviceRole = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  if (!serverUrl || !serviceRole) {
    return Response.json({ error: 'server_misconfigured' }, { status: 503, headers });
  }

  const auth = await verifyPlatformAdminFromRequestAny(request, serverUrl, serviceRole, [
    'view_overview',
    'view_partner_marketing',
  ]);
  if (auth.ok === false) {
    return Response.json(auth.json, { status: auth.status, headers });
  }

  const supabase = createClient(serverUrl, serviceRole, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data, error, count } = await supabase
    .from(TABLE)
    .select(
      'id, email_normalized, display_name, role, intent_id, source, phone, created_at, consent_follow_updates',
      { count: 'exact' },
    )
    .order('created_at', { ascending: false })
    .limit(MAX_ROWS);

  if (error) {
    if (/coiffeur_interest_signups|does not exist|schema cache/i.test(error.message || '')) {
      return Response.json(
        {
          ok: true,
          tableMissing: true,
          total: 0,
          rows: [],
          hint: 'Apply migration 159_coiffeur_interest_signups.sql on Supabase.',
        },
        { headers },
      );
    }
    return Response.json({ ok: false, error: 'query_failed' }, { status: 500, headers });
  }

  const rows = (data ?? []).map((row) => ({
    id: String(row.id ?? ''),
    email: String(row.email_normalized ?? ''),
    displayName: row.display_name ? String(row.display_name) : '',
    role: row.role ? String(row.role) : '',
    intentId: row.intent_id ? String(row.intent_id) : '',
    source: row.source ? String(row.source) : '',
    phone: row.phone ? String(row.phone) : '',
    createdAt: String(row.created_at ?? ''),
    consent: row.consent_follow_updates === true,
  }));

  return Response.json(
    {
      ok: true,
      tableMissing: false,
      total: typeof count === 'number' ? count : rows.length,
      rows,
    },
    { headers },
  );
}
