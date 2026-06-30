import { safeHost, verifyPlatformAdminFromRequestAny } from './_lib/adminManageBarbersAuth.js';
import { buildPublicApiCorsHeaders, publicApiOptionsResponse, rejectIfPublicApiCorsBlocked } from './_lib/publicApiCors.js';
import {
  resolveSabPaymentMode,
  sabOppwaConfigured,
} from './_lib/payment-gateway/sabOppwaConfig.js';
import { isLikelyHttpUrl, normalizeSupabaseUrl } from './_lib/supabaseUrl.js';

export const config = {
  maxDuration: 30,
};

const CORS_OPTS = {
  allowMethods: 'GET, POST, OPTIONS',
  allowHeaders: 'Content-Type, Authorization, x-client-supabase-url',
} as const;

function corsHeaders(request: Request): Record<string, string> {
  return buildPublicApiCorsHeaders(request, CORS_OPTS).headers;
}

type SettingsPayload = {
  preferred_gateway: string;
  display_payment_mode: string;
  enable_moyasar_card: boolean;
  enable_sab_gateway: boolean;
  enable_bank_transfer_semiannual: boolean;
  enable_internal_onboarding_email: boolean;
  enable_whatsapp_payment_notify: boolean;
  enable_resend_payment_receipt: boolean;
  enforce_price_currency_match: boolean;
  bank_display_name_ar: string;
  bank_beneficiary_name: string;
  bank_iban: string;
  updated_at: string | null;
  updated_by_email: string | null;
};

function normalizeSettingsRow(raw: Record<string, unknown> | null): SettingsPayload {
  const r = raw || {};
  const gw = String(r.preferred_gateway || 'MOYASAR').toUpperCase() === 'SAB' ? 'SAB' : 'MOYASAR';
  const mode = String(r.display_payment_mode || 'test').toLowerCase() === 'live' ? 'live' : 'test';
  return {
    preferred_gateway: gw,
    display_payment_mode: mode,
    enable_moyasar_card: r.enable_moyasar_card !== false,
    enable_sab_gateway: r.enable_sab_gateway === true,
    enable_bank_transfer_semiannual: false,
    enable_internal_onboarding_email: r.enable_internal_onboarding_email !== false,
    enable_whatsapp_payment_notify: r.enable_whatsapp_payment_notify === true,
    enable_resend_payment_receipt: r.enable_resend_payment_receipt !== false,
    enforce_price_currency_match: r.enforce_price_currency_match !== false,
    bank_display_name_ar: String(r.bank_display_name_ar ?? '').trim(),
    bank_beneficiary_name: String(r.bank_beneficiary_name ?? '').trim(),
    bank_iban: String(r.bank_iban ?? '').trim(),
    updated_at: typeof r.updated_at === 'string' ? r.updated_at : null,
    updated_by_email: typeof r.updated_by_email === 'string' ? r.updated_by_email : null,
  };
}

export async function OPTIONS(request: Request): Promise<Response> {
  return publicApiOptionsResponse(request, CORS_OPTS);
}

export async function GET(request: Request): Promise<Response> {
  const blocked = rejectIfPublicApiCorsBlocked(request, CORS_OPTS);
  if (blocked) return blocked;
  const headers = corsHeaders(request);

  const url = normalizeSupabaseUrl(process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL);
  const serviceRole = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();

  const authHeader = request.headers.get('authorization')?.trim() || '';
  const hasBearer = authHeader.startsWith('Bearer ') && authHeader.length > 'Bearer '.length + 8;

  if (!hasBearer) {
    return Response.json(
      {
        ok: true,
        route: 'platform-payment-settings',
        supabaseUrlHost: url ? safeHost(url) : null,
        hint: 'Send Authorization: Bearer <session access_token> for full settings and monitoring.',
      },
      { headers },
    );
  }

  if (!url || !isLikelyHttpUrl(url) || !serviceRole) {
    return Response.json({ error: 'Server not configured' }, { status: 503, headers });
  }

  const adminAuth = await verifyPlatformAdminFromRequestAny(request, url, serviceRole, [
    'view_payment_settings',
    'view_settings',
    'view_payments',
  ]);
  if (adminAuth.ok === false) {
    return Response.json(adminAuth.json, { status: adminAuth.status, headers });
  }
  const supabase = adminAuth.supabase;

  const { data: row, error } = await supabase.from('platform_payment_settings').select('*').eq('id', 1).maybeSingle();

  if (error) {
    return Response.json({ error: error.message }, { status: 500, headers });
  }

  const settings = normalizeSettingsRow((row || {}) as Record<string, unknown>);

  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const { data: secRows } = await supabase
    .from('payment_security_events')
    .select('severity,event_type')
    .gte('created_at', since);

  const securityBySeverity: Record<string, number> = { info: 0, warning: 0, critical: 0 };
  const securityByType: Record<string, number> = {};
  for (const ev of secRows || []) {
    const sev = String((ev as { severity?: string }).severity || 'warning');
    securityBySeverity[sev] = (securityBySeverity[sev] ?? 0) + 1;
    const et = String((ev as { event_type?: string }).event_type || 'unknown');
    securityByType[et] = (securityByType[et] ?? 0) + 1;
  }

  const { data: subRows } = await supabase.from('barber_subscriptions').select('status');
  const subscriptionsByStatus: Record<string, number> = {};
  for (const s of subRows || []) {
    const st = String((s as { status?: string }).status || 'unknown');
    subscriptionsByStatus[st] = (subscriptionsByStatus[st] ?? 0) + 1;
  }

  return Response.json(
    {
      ok: true,
      settings,
      serverReadiness: {
        paymentEnv: resolveSabPaymentMode(),
        sabOppwaConfigured: sabOppwaConfigured(),
        moyasarPublishableKeySet: Boolean(
          (process.env.MOYASAR_PUBLISHABLE_KEY || process.env.VITE_MOYASAR_PUBLISHABLE_KEY || '').trim(),
        ),
      },
      monitoring: {
        securityEventsLast7d: (secRows || []).length,
        securityBySeverity,
        securityByTypeTop: Object.entries(securityByType)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 8)
          .map(([event_type, count]) => ({ event_type, count })),
        subscriptionsByStatus,
      },
    },
    { headers },
  );
}

export async function POST(request: Request): Promise<Response> {
  const blocked = rejectIfPublicApiCorsBlocked(request, CORS_OPTS);
  if (blocked) return blocked;
  const headers = corsHeaders(request);

  const url = normalizeSupabaseUrl(process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL);
  const serviceRole = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();

  if (!url || !isLikelyHttpUrl(url) || !serviceRole) {
    return Response.json({ error: 'Server not configured' }, { status: 503, headers });
  }

  const adminAuth = await verifyPlatformAdminFromRequestAny(request, url, serviceRole, [
    'manage_payment_settings',
    'view_settings',
  ]);
  if (adminAuth.ok === false) {
    return Response.json(adminAuth.json, { status: adminAuth.status, headers });
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return Response.json({ error: 'invalid_json' }, { status: 400, headers });
  }

  const supabase = adminAuth.supabase;

  const { data: existing } = await supabase.from('platform_payment_settings').select('*').eq('id', 1).maybeSingle();
  const base = normalizeSettingsRow((existing || {}) as Record<string, unknown>);

  const next: SettingsPayload = {
    preferred_gateway:
      String(body.preferred_gateway || base.preferred_gateway).toUpperCase() === 'SAB' ? 'SAB' : 'MOYASAR',
    display_payment_mode:
      String(body.display_payment_mode || base.display_payment_mode).toLowerCase() === 'live' ? 'live' : 'test',
    enable_moyasar_card: body.enable_moyasar_card === undefined ? base.enable_moyasar_card : Boolean(body.enable_moyasar_card),
    enable_sab_gateway: body.enable_sab_gateway === undefined ? base.enable_sab_gateway : Boolean(body.enable_sab_gateway),
    enable_bank_transfer_semiannual: false,
    enable_internal_onboarding_email:
      body.enable_internal_onboarding_email === undefined
        ? base.enable_internal_onboarding_email
        : Boolean(body.enable_internal_onboarding_email),
    enable_whatsapp_payment_notify:
      body.enable_whatsapp_payment_notify === undefined
        ? base.enable_whatsapp_payment_notify
        : Boolean(body.enable_whatsapp_payment_notify),
    enable_resend_payment_receipt:
      body.enable_resend_payment_receipt === undefined
        ? base.enable_resend_payment_receipt
        : Boolean(body.enable_resend_payment_receipt),
    enforce_price_currency_match:
      body.enforce_price_currency_match === undefined
        ? base.enforce_price_currency_match
        : Boolean(body.enforce_price_currency_match),
    bank_display_name_ar:
      body.bank_display_name_ar !== undefined ? String(body.bank_display_name_ar).trim() : base.bank_display_name_ar,
    bank_beneficiary_name:
      body.bank_beneficiary_name !== undefined ? String(body.bank_beneficiary_name).trim() : base.bank_beneficiary_name,
    bank_iban: body.bank_iban !== undefined ? String(body.bank_iban).trim().replace(/\s+/g, '') : base.bank_iban,
    updated_at: new Date().toISOString(),
    updated_by_email: adminAuth.actorEmail,
  };

  const { error: upErr } = await supabase
    .from('platform_payment_settings')
    .upsert(
      {
        id: 1,
        preferred_gateway: next.preferred_gateway,
        display_payment_mode: next.display_payment_mode,
        enable_moyasar_card: next.enable_moyasar_card,
        enable_sab_gateway: next.enable_sab_gateway,
        enable_bank_transfer_semiannual: next.enable_bank_transfer_semiannual,
        enable_internal_onboarding_email: next.enable_internal_onboarding_email,
        enable_whatsapp_payment_notify: next.enable_whatsapp_payment_notify,
        enable_resend_payment_receipt: next.enable_resend_payment_receipt,
        enforce_price_currency_match: next.enforce_price_currency_match,
        bank_display_name_ar: next.bank_display_name_ar,
        bank_beneficiary_name: next.bank_beneficiary_name,
        bank_iban: next.bank_iban,
        updated_at: next.updated_at,
        updated_by_email: next.updated_by_email,
      },
      { onConflict: 'id' },
    );

  if (upErr) {
    return Response.json({ error: upErr.message }, { status: 500, headers });
  }

  return Response.json({ ok: true, settings: next }, { headers });
}
