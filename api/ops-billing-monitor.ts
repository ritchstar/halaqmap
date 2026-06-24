import { createClient } from '@supabase/supabase-js';
import {
  safeHost,
  verifyPlatformAdminFromRequest,
  verifyPlatformAdminFromRequestAny,
} from './_lib/adminManageBarbersAuth.js';
import { isLikelyHttpUrl, normalizeSupabaseUrl } from './_lib/supabaseUrl.js';
import { runOpsBillingSync, type OpsBillingSupabase } from './_lib/opsBillingSync.js';

export const config = {
  maxDuration: 60,
};

function json(data: unknown, status = 200): Response {
  return Response.json(data, {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      /** منع كاش CDN/المتصفح لاستجابات المزامنة والالتزامات — القيم من Supabase وليست ثابتة. */
      'Cache-Control': 'private, no-store, max-age=0, must-revalidate',
    },
  });
}

async function getServiceSupabase(): Promise<
  | { ok: true; supabase: OpsBillingSupabase; url: string }
  | { ok: false; status: number; body: Record<string, unknown> }
> {
  const url = normalizeSupabaseUrl(process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL);
  const serviceRole = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  if (!url || !isLikelyHttpUrl(url) || !serviceRole) {
    return {
      ok: false,
      status: 503,
      body: { error: 'Server not configured', hint: 'SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY required' },
    };
  }
  const supabase = createClient(url, serviceRole, {
    auth: { persistSession: false, autoRefreshToken: false },
  }) as OpsBillingSupabase;
  return { ok: true, supabase, url };
}

function bearerFromHeader(h: string | null): string | null {
  const v = h?.trim() || '';
  if (!v.startsWith('Bearer ')) return null;
  const t = v.slice('Bearer '.length).trim();
  return t.length > 0 ? t : null;
}

/** يطابق CRON_SECRET أو OPS_BILLING_CRON_SECRET فقط — لا يُخلط مع JWT المشرف. */
function isCronSecretToken(token: string): boolean {
  const t = token.trim();
  const candidates = [process.env.CRON_SECRET, process.env.OPS_BILLING_CRON_SECRET]
    .map((s) => (typeof s === 'string' ? s.trim() : ''))
    .filter((s) => s.length > 0);
  return candidates.some((c) => c === t);
}

/**
 * مصادقة Cron: من Authorization: Bearer … أو من رأس منفصل حتى يبقى Bearer الأول لجلسة Supabase.
 * رأس الواجهة: X-Ops-Billing-Cron-Authorization: Bearer <OPS_BILLING_CRON_SECRET|CRON_SECRET>
 */
function isCronAuthorized(request: Request): boolean {
  const fromAuth = bearerFromHeader(request.headers.get('authorization'));
  if (fromAuth && isCronSecretToken(fromAuth)) return true;
  const fromX = bearerFromHeader(request.headers.get('x-ops-billing-cron-authorization'));
  if (fromX && isCronSecretToken(fromX)) return true;
  return false;
}

/** قراءة لوحة التزامات التشغيل: مدير نشط بصلاحية عرض أو سوبر مزامنة، أو Cron. */
async function authorizeOpsBillingRead(
  request: Request,
): Promise<
  | { ok: true; supabase: OpsBillingSupabase; actorEmail: string | null }
  | { ok: false; status: number; json: Record<string, unknown> }
> {
  const base = await getServiceSupabase();
  if (base.ok === false) return { ok: false, status: base.status, json: base.body };

  if (isCronAuthorized(request)) {
    return { ok: true, supabase: base.supabase, actorEmail: null };
  }

  const gate = await verifyPlatformAdminFromRequestAny(request, base.url, process.env.SUPABASE_SERVICE_ROLE_KEY || '', [
    'view_ops_billing_monitor',
    'manage_centralized_billing_ops',
  ]);
  if (gate.ok === false) {
    return { ok: false, status: gate.status, json: gate.json };
  }
  return { ok: true, supabase: gate.supabase as OpsBillingSupabase, actorEmail: gate.actorEmail };
}

/** تعديلات المزامنة والالتزامات: `manage_centralized_billing_ops` أو Cron فقط. */
async function authorizeOpsBillingWrite(
  request: Request,
): Promise<
  | { ok: true; supabase: OpsBillingSupabase; actorEmail: string | null }
  | { ok: false; status: number; json: Record<string, unknown> }
> {
  const base = await getServiceSupabase();
  if (base.ok === false) return { ok: false, status: base.status, json: base.body };

  if (isCronAuthorized(request)) {
    return { ok: true, supabase: base.supabase, actorEmail: null };
  }

  const gate = await verifyPlatformAdminFromRequest(
    request,
    base.url,
    process.env.SUPABASE_SERVICE_ROLE_KEY || '',
    'manage_centralized_billing_ops',
  );
  if (gate.ok === false) {
    return { ok: false, status: gate.status, json: gate.json };
  }
  return { ok: true, supabase: gate.supabase as OpsBillingSupabase, actorEmail: gate.actorEmail };
}

function monthlyEstimateSarToNumber(v: unknown): number | null {
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  if (typeof v === 'string' && v.trim() !== '') {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function summarize(rows: Record<string, unknown>[]) {
  let nearest: string | null = null;
  let monthlySum = 0;
  for (const r of rows) {
    const mNum = monthlyEstimateSarToNumber(r.monthly_estimate_sar);
    if (mNum !== null) monthlySum += mNum;
    const nr = r.next_renewal_at;
    if (typeof nr === 'string' && nr) {
      if (!nearest || new Date(nr).getTime() < new Date(nearest).getTime()) nearest = nr;
    }
  }
  const now = Date.now();
  const countdownMs = nearest ? Math.max(0, new Date(nearest).getTime() - now) : null;
  return { nearestRenewalAt: nearest, monthlyEstimateSarTotal: monthlySum, countdownMs };
}

export async function GET(request: Request): Promise<Response> {
  const auth = await authorizeOpsBillingRead(request);
  if (auth.ok === false) return json(auth.json, auth.status);

  const { supabase } = auth;
  const urlObj = new URL(request.url);
  if (isCronAuthorized(request) && urlObj.searchParams.get('cron') === '1') {
    const syncOut = await runOpsBillingSync(supabase);
    if (syncOut.ok === false) {
      return json({ error: syncOut.error, poll: 'sync_failed' }, 500);
    }
  }

  const { data: commitments, error: cErr } = await supabase
    .from('platform_ops_billing_commitments')
    .select('*')
    .order('next_renewal_at', { ascending: true, nullsFirst: false });

  if (cErr) return json({ error: cErr.message }, 500);

  const { data: poll, error: pErr } = await supabase.from('platform_ops_billing_poll_state').select('*').eq('id', 1).maybeSingle();
  if (pErr) return json({ error: pErr.message }, 500);

  const rows = (commitments || []) as Record<string, unknown>[];
  const gaps = rows.filter((r) => r.data_gap_kind);

  const url = normalizeSupabaseUrl(process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL);
  return json({
    ok: true,
    route: 'ops-billing-monitor',
    supabaseUrlHost: url ? safeHost(url) : null,
    poll,
    commitments: rows,
    gaps,
    summary: summarize(rows),
    hints: {
      env: [
        'VERCEL_OPS_API_TOKEN',
        'SUPABASE_MANAGEMENT_API_TOKEN',
        'GODADDY_SUBSCRIPTIONS_PORTAL_URL (اختياري — افتراضي: بوابة GoDaddy)',
        'OPENAI_BILLING_PORTAL_URL (اختياري — افتراضي: نظرة عامة على فوترة المنظّمة في OpenAI)',
        'REVENUE_BILLING_MONITOR_TOKEN — Organization Admin API key من /settings/organization/admin-keys (ليس مفتاح المشروع الافتراضي)',
        'OPENAI_ADMIN_KEY (بديل لـ REVENUE_BILLING_MONITOR_TOKEN؛ نفس نوع المفتاح)',
        'OPENAI_ORGANIZATION_ID أو OPENAI_ORG_ID — مطلوب مع المفتاح؛ يُرسل كرأس OpenAI-Organization مع GET /v1/organization/costs',
        'RESEND_BILLING_PORTAL_URL (اختياري — افتراضي: إعدادات الفوترة في Resend)',
        'RESEND_BILLING_INVOICE_EMAIL (اختياري — بريد الفواتير كما في Resend للعرض في الملخص فقط)',
        'CRON_SECRET أو OPS_BILLING_CRON_SECRET (جدولة Vercel: Authorization: Bearer …)',
        'VITE_OPS_BILLING_CRON_SECRET — نفس قيمة السرّ أعلاه للواجهة (يُرسل Authorization: Bearer … من المتصفح؛ يُنشر مع البناء)',
      ],
      cron:
        'GET ?cron=1 أو POST action=sync مع Authorization: Bearer <CRON_SECRET|OPS_BILLING_CRON_SECRET>؛ أو رأس X-Ops-Billing-Cron-Authorization: Bearer <السرّ> مع Authorization لمشرف',
    },
  });
}

export async function POST(request: Request): Promise<Response> {
  const auth = await authorizeOpsBillingWrite(request);
  if (auth.ok === false) return json(auth.json, auth.status);

  const { supabase, actorEmail } = auth;
  let body: Record<string, unknown> = {};
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return json({ error: 'Invalid JSON body' }, 400);
  }

  const action = String(body.action || '').trim();

  if (action === 'sync' || action === 'poll') {
    const out = await runOpsBillingSync(supabase);
    if (out.ok === false) return json({ error: out.error }, 500);
    return json({ ok: true, syncedBy: actorEmail || 'cron', detail: out.detail });
  }

  if (action === 'manual_commitment') {
    const label = String(body.display_label || '').trim();
    if (!label) return json({ error: 'display_label required' }, 400);
    const monthly = body.monthly_estimate_sar;
    const monthlyNum = typeof monthly === 'number' ? monthly : Number(monthly);
    const row = {
      vendor: 'manual' as const,
      display_label: label,
      integration_mode: 'manual_only',
      billing_cycle: String(body.billing_cycle || 'custom'),
      amount_expected: body.amount_expected != null ? Number(body.amount_expected) : null,
      amount_currency: String(body.amount_currency || 'SAR'),
      monthly_estimate_sar: Number.isFinite(monthlyNum) ? monthlyNum : null,
      next_renewal_at: typeof body.next_renewal_at === 'string' ? body.next_renewal_at : null,
      last_synced_at: new Date().toISOString(),
      last_sync_status: 'ok',
      last_sync_error: null,
      external_stable_key: String(body.external_stable_key || '').trim(),
      external_ref: {},
      vendor_payload: {},
      is_manual: true,
      manual_notes: typeof body.manual_notes === 'string' ? body.manual_notes : null,
      data_gap_kind: null,
      data_gap_message: null,
      credential_env_hint: null,
    };
    const { data: ins, error } = await supabase.from('platform_ops_billing_commitments').insert(row).select('id').maybeSingle();
    if (error) return json({ error: error.message }, 500);
    return json({ ok: true, id: ins?.id });
  }

  if (action === 'update_commitment') {
    const id = String(body.id || '').trim();
    if (!id) return json({ error: 'id required' }, 400);
    const patch: Record<string, unknown> = {};
    if (typeof body.display_label === 'string') patch.display_label = body.display_label;
    if (typeof body.next_renewal_at === 'string' || body.next_renewal_at === null)
      patch.next_renewal_at = body.next_renewal_at;
    if (body.monthly_estimate_sar !== undefined) {
      const n = Number(body.monthly_estimate_sar);
      patch.monthly_estimate_sar = Number.isFinite(n) ? n : null;
    }
    if (body.amount_expected !== undefined) {
      const n = Number(body.amount_expected);
      patch.amount_expected = Number.isFinite(n) ? n : null;
    }
    if (typeof body.amount_currency === 'string') patch.amount_currency = body.amount_currency;
    if (typeof body.manual_notes === 'string') patch.manual_notes = body.manual_notes;
    if (body.clear_gap === true) {
      patch.data_gap_kind = null;
      patch.data_gap_message = null;
    }
    if (Object.keys(patch).length === 0) return json({ error: 'No fields to update' }, 400);
    const { error } = await supabase.from('platform_ops_billing_commitments').update(patch).eq('id', id);
    if (error) return json({ error: error.message }, 500);
    return json({ ok: true, updatedBy: actorEmail });
  }

  return json({ error: 'Unknown action', allowed: ['sync', 'poll', 'manual_commitment', 'update_commitment'] }, 400);
}
