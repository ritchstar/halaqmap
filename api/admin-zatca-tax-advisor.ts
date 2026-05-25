import { createClient } from '@supabase/supabase-js';
import { buildZatcaComplianceReport } from './_lib/agents/zatcaComplianceReport.js';
import { ZatcaTaxAdvisorAgent } from './_lib/agents/ZatcaTaxAdvisorAgent.js';
import { verifyPlatformAdminFromRequestAny } from './_lib/adminManageBarbersAuth.js';
import { normalizeSupabaseUrl } from './_lib/supabaseUrl.js';

export const config = { maxDuration: 60 };

const ZATCA_READ_PERMISSIONS = [
  'manage_platform_commerce_rules',
  'view_ops_billing_monitor',
  'manage_centralized_billing_ops',
  'activate_zatca_tax_live',
] as const;

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
  if (!url || !serviceRole) {
    return { ok: false as const, status: 503, body: { error: 'Server not configured' } };
  }
  const supabase = createClient(url, serviceRole, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return { ok: true as const, supabase, url };
}

async function authorizeRead(request: Request) {
  const base = await getServiceSupabase();
  if (!base.ok) return { ok: false as const, status: base.status, json: base.body };

  const gate = await verifyPlatformAdminFromRequestAny(
    request,
    base.url,
    process.env.SUPABASE_SERVICE_ROLE_KEY || '',
    [...ZATCA_READ_PERMISSIONS],
  );
  if (gate.ok === false) return { ok: false as const, status: gate.status, json: gate.json };
  return { ok: true as const, supabase: gate.supabase, actorEmail: gate.actorEmail };
}

async function authorizeTaxLiveActivation(request: Request) {
  const base = await getServiceSupabase();
  if (!base.ok) return { ok: false as const, status: base.status, json: base.body };

  const gate = await verifyPlatformAdminFromRequestAny(request, base.url, process.env.SUPABASE_SERVICE_ROLE_KEY || '', [
    'activate_zatca_tax_live',
    'manage_platform_commerce_rules',
  ]);
  if (gate.ok === false) return { ok: false as const, status: gate.status, json: gate.json };
  return { ok: true as const, supabase: gate.supabase, actorEmail: gate.actorEmail };
}

export async function GET(request: Request): Promise<Response> {
  const auth = await authorizeRead(request);
  if (auth.ok === false) return json(auth.json, auth.status);

  try {
    const agent = new ZatcaTaxAdvisorAgent(auth.supabase);
    const url = new URL(request.url);
    const runRadar = url.searchParams.get('run') === '1' || url.searchParams.get('radar') === '1';
    const refreshIntel = url.searchParams.get('intel') === '1' || url.searchParams.get('refresh_intel') === '1';
    const briefOnly = url.searchParams.get('brief') === '1';

    if (briefOnly) {
      const brief = await agent.getComplianceBrief({ refreshIntel });
      const state = await agent.getState();
      return json({
        ok: true,
        route: 'admin-zatca-tax-advisor',
        mode: 'brief',
        state,
        warnings: state?.active_warnings ?? [],
        uninitialized: state == null,
        ...brief,
      });
    }

    if (runRadar) {
      const result = await agent.runRevenueRadar({ refreshIntel });
      const state = await agent.getState();
      const { ok: _ok, ...radar } = result;
      return json({ ok: true, route: 'admin-zatca-tax-advisor', mode: 'radar', state, ...radar });
    }

    const state = await agent.getState();
    const snap = state?.cached_revenue_snapshot;
    const analytics =
      snap && typeof snap === 'object' && 'totalHistoricalSar' in snap
        ? snap
        : null;
    const complianceReport =
      snap && typeof snap === 'object' && 'complianceReport' in snap
        ? (snap as { complianceReport?: ReturnType<typeof buildZatcaComplianceReport> }).complianceReport
        : buildZatcaComplianceReport(analytics as Parameters<typeof buildZatcaComplianceReport>[0]);

    const cachedIntel =
      state?.cached_vat_config &&
      typeof state.cached_vat_config === 'object' &&
      'externalIntel' in state.cached_vat_config
        ? (state.cached_vat_config as { externalIntel?: unknown }).externalIntel
        : null;

    let externalIntel = cachedIntel;
    if (refreshIntel) {
      const brief = await agent.getComplianceBrief({ refreshIntel: true });
      externalIntel = brief.externalIntel;
    } else if (!externalIntel) {
      const brief = await agent.getComplianceBrief({ refreshIntel: false });
      externalIntel = brief.externalIntel;
    }

    return json({
      ok: true,
      route: 'admin-zatca-tax-advisor',
      mode: 'state',
      state,
      uninitialized: state == null,
      warnings: state?.active_warnings ?? [],
      complianceReport,
      externalIntel,
      analytics,
    });
  } catch (e) {
    console.error('[admin-zatca-tax-advisor] GET failed:', e);
    return json(
      {
        error: e instanceof Error ? e.message : 'تعذر تحميل مكتب ZATCA',
        code: 'zatca_office_load_failed',
      },
      500,
    );
  }
}

export async function POST(request: Request): Promise<Response> {
  let body: Record<string, unknown> = {};
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return json({ error: 'Invalid JSON' }, 400);
  }

  const action = String(body.action ?? '').trim();

  if (action === 'run_radar' || action === 'runRadar') {
    const auth = await authorizeRead(request);
    if (auth.ok === false) return json(auth.json, auth.status);
    try {
      const refreshIntel = body.refreshIntel === true || body.refresh_intel === true;
      const agent = new ZatcaTaxAdvisorAgent(auth.supabase);
      const result = await agent.runRevenueRadar({ refreshIntel });
      const state = await agent.getState();
      const { ok: _ok, ...radar } = result;
      return json({ ok: true, route: 'admin-zatca-tax-advisor', action, state, ...radar });
    } catch (e) {
      console.error('[admin-zatca-tax-advisor] run_radar failed:', e);
      return json({ error: e instanceof Error ? e.message : 'تعذر تشغيل الرادار', code: 'radar_failed' }, 500);
    }
  }

  if (action === 'refresh_intel' || action === 'refreshIntel') {
    const auth = await authorizeRead(request);
    if (auth.ok === false) return json(auth.json, auth.status);
    try {
      const agent = new ZatcaTaxAdvisorAgent(auth.supabase);
      const brief = await agent.getComplianceBrief({ refreshIntel: true });
      const state = await agent.getState();
      return json({ ok: true, route: 'admin-zatca-tax-advisor', action, state, ...brief });
    } catch (e) {
      console.error('[admin-zatca-tax-advisor] refresh_intel failed:', e);
      return json({ error: e instanceof Error ? e.message : 'تعذر تحديث المصادر', code: 'intel_failed' }, 500);
    }
  }

  if (action === 'activate_tax_live' || action === 'activateTaxLive') {
    const activateAuth = await authorizeTaxLiveActivation(request);
    if (activateAuth.ok === false) return json(activateAuth.json, activateAuth.status);

    const agent = new ZatcaTaxAdvisorAgent(activateAuth.supabase);
    try {
      const result = await agent.activateTaxLive(activateAuth.actorEmail);
      const { ok: _ok, ...activation } = result;
      return json({
        ok: true,
        route: 'admin-zatca-tax-advisor',
        action,
        ...activation,
        uiVatSettings: { enabled: true, ratePercent: result.vatRatePercent },
      });
    } catch (e) {
      const code = e instanceof Error ? e.message : 'activation_failed';
      if (code === 'tax_already_enabled') {
        return json({ error: 'ضريبة القيمة المضافة مفعّلة مسبقاً على الواجهة.', code }, 409);
      }
      if (code === 'activation_not_ready') {
        return json(
          {
            error:
              'التفعيل متاح فقط بعد بلوغ الحد الإلزامي (375,000 ر.س) أو ظهور تنبيه التفعيل من رادار ZATCA.',
            code,
          },
          403,
        );
      }
      return json({ error: e instanceof Error ? e.message : 'تعذر التفعيل', code }, 500);
    }
  }

  return json({ error: 'Unknown action', allowed: ['run_radar', 'refresh_intel', 'activate_tax_live'] }, 400);
}
