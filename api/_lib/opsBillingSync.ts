/**
 * مزامنة أولية: Vercel (v2/user) + Supabase Management (v1/projects).
 * أسرار القراءة من متغيرات بيئة Vercel فقط — لا تُخزَّن في الجدول.
 *
 * VERCEL_OPS_API_TOKEN — رمز Vercel (صلاحيات قراءة مناسبة للفريق/الحساب).
 * SUPABASE_MANAGEMENT_API_TOKEN — Organization access token من لوحة Supabase (Account → Access Tokens).
 *
 * تواريخ التجديد والمبالغ الدقيقة غالباً غير متاحة عبر هذه النقاط؛ تُعبأ فجوات data_gap للمتابعة اليدوية.
 */
import type { SupabaseClient } from '@supabase/supabase-js';

/** الجداول الجديدة غير مضمّنة في أنواع generated بعد — عميل مرن لهذه الوحدة فقط. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type OpsBillingSupabase = SupabaseClient<any>;

export type OpsPollDetail = {
  vercel?: { ok: boolean; httpStatus?: number; error?: string };
  supabase_mgmt?: { ok: boolean; httpStatus?: number; projectCount?: number; error?: string };
  /** صفوف مرجعية من لوحة GoDaddy (بدون API) — رابط قابل للتجاوز بـ GODADDY_SUBSCRIPTIONS_PORTAL_URL */
  godaddy?: { ok: boolean; portalSeeded: boolean; error?: string };
  /**
   * OpenAI — رابط الفوترة + لقطة Pay-as-you-go؛ عند ضبط REVENUE_BILLING_MONITOR_TOKEN (أو OPENAI_ADMIN_KEY) و OPENAI_ORGANIZATION_ID
   * يُستدعى GET /v1/organization/costs (آخر 31 يوماً) مع رأس OpenAI-Organization. لا يُستخدم OPENAI_API_KEY هنا.
   */
  openai?: {
    ok: boolean;
    seeded: boolean;
    organizationCostsHeader?: boolean;
    costsApi?: { ok: boolean; last31dUsd?: number; httpStatus?: number; error?: string };
    error?: string;
  };
  /** Resend — رابط الفوترة + خطط مجانية مرجعية (حتى ربط API الفوترة إن وُجد) */
  resend?: { ok: boolean; seeded: boolean; error?: string };
};

type CommitmentRow = {
  vendor: string;
  display_label: string;
  integration_mode: string;
  billing_cycle: string;
  amount_expected: number | null;
  amount_currency: string;
  monthly_estimate_sar: number | null;
  next_renewal_at: string | null;
  last_synced_at: string;
  last_sync_status: string;
  last_sync_error: string | null;
  external_stable_key: string;
  external_ref: Record<string, unknown>;
  vendor_payload: Record<string, unknown>;
  is_manual: boolean;
  manual_notes: string | null;
  data_gap_kind: string | null;
  data_gap_message: string | null;
  credential_env_hint: string | null;
};

type ExistingCommitmentRow = {
  next_renewal_at: string | null;
  monthly_estimate_sar: number | null;
  amount_expected: number | null;
  amount_currency?: string | null;
  billing_cycle?: string | null;
  data_gap_kind: string | null;
  data_gap_message: string | null;
  manual_notes: string | null;
  last_sync_status: string;
  is_manual: boolean;
};

function isKhazenAttestedRow(notes: string | null | undefined): boolean {
  return typeof notes === 'string' && notes.includes('خازن');
}

/** لا تُمحى حقول أكّدها خازن/المالك عند فشل مزامنة API (مثل token_expired على Supabase). */
function mergeCommitmentWithExisting(
  existing: ExistingCommitmentRow | null,
  incoming: CommitmentRow,
): CommitmentRow {
  if (!existing) return incoming;

  const khazen = isKhazenAttestedRow(existing.manual_notes);
  const merged: CommitmentRow = { ...incoming };

  if (existing.next_renewal_at && !incoming.next_renewal_at) {
    merged.next_renewal_at = existing.next_renewal_at;
  }
  if (existing.monthly_estimate_sar != null && incoming.monthly_estimate_sar == null) {
    merged.monthly_estimate_sar = existing.monthly_estimate_sar;
  }
  if (existing.amount_expected != null && incoming.amount_expected == null) {
    merged.amount_expected = existing.amount_expected;
  }
  if (existing.billing_cycle && existing.billing_cycle !== 'unknown' && incoming.billing_cycle === 'unknown') {
    merged.billing_cycle = existing.billing_cycle;
  }

  if (khazen) {
    if (existing.manual_notes) merged.manual_notes = existing.manual_notes;
    if (existing.next_renewal_at || existing.monthly_estimate_sar != null) {
      merged.data_gap_kind = null;
      merged.data_gap_message = null;
      if (incoming.last_sync_status !== 'ok') {
        merged.last_sync_status = 'partial';
      }
    } else if (existing.data_gap_kind == null && incoming.data_gap_kind != null && incoming.last_sync_status !== 'ok') {
      merged.data_gap_kind = null;
      merged.data_gap_message = existing.data_gap_message;
    }
  }

  return merged;
}

async function upsertCommitment(supabase: OpsBillingSupabase, row: CommitmentRow): Promise<{ error?: string }> {
  const { data: existing, error: loadErr } = await supabase
    .from('platform_ops_billing_commitments')
    .select(
      'next_renewal_at,monthly_estimate_sar,amount_expected,amount_currency,billing_cycle,data_gap_kind,data_gap_message,manual_notes,last_sync_status,is_manual',
    )
    .eq('vendor', row.vendor)
    .eq('external_stable_key', row.external_stable_key)
    .maybeSingle();

  if (loadErr) return { error: loadErr.message };

  const finalRow = mergeCommitmentWithExisting(
    (existing as ExistingCommitmentRow | null) ?? null,
    row,
  );

  const { error } = await supabase.from('platform_ops_billing_commitments').upsert(finalRow, {
    onConflict: 'vendor,external_stable_key',
  });
  if (error) return { error: error.message };
  return {};
}

/**
 * مفتاح Admin لمنظّمة OpenAI (لـ GET /v1/organization/costs).
 * الأولوية: REVENUE_BILLING_MONITOR_TOKEN (اسم مخصص في Vercel) ثم OPENAI_ADMIN_KEY ثم OPENAI_ORGANIZATION_ADMIN_KEY.
 * لا نقرأ OPENAI_API_KEY — محجوز لمسارات الدردشة والميزات الأخرى.
 */
function getOpenAiAdminKey(): string {
  return (
    (process.env.REVENUE_BILLING_MONITOR_TOKEN || '').trim() ||
    (process.env.OPENAI_ADMIN_KEY || '').trim() ||
    (process.env.OPENAI_ORGANIZATION_ADMIN_KEY || '').trim()
  );
}

/** معرف المنظّمة (org-...) لرأس OpenAI-Organization — مطلوب مع GET /v1/organization/costs (فوترة المنظّمة). */
function getOpenAiOrganizationIdHeader(): string | null {
  const raw =
    (process.env.OPENAI_ORGANIZATION_ID || '').trim() ||
    (process.env.OPENAI_ORG_ID || '').trim();
  return raw.length > 0 ? raw : null;
}

/** رؤوس طلبات OpenAI على مستوى المنظّمة (تكاليف/استخدام). */
function buildOpenAiOrganizationApiHeaders(adminKey: string, organizationId: string): Record<string, string> {
  return {
    Authorization: `Bearer ${adminKey}`,
    'OpenAI-Organization': organizationId,
  };
}

/** جمع قيم amount.value بالدولار من استجابة organization/costs */
function sumOpenAiOrganizationCostsUsd(json: unknown): number {
  if (!json || typeof json !== 'object') return 0;
  const data = (json as { data?: unknown }).data;
  if (!Array.isArray(data)) return 0;
  let sum = 0;
  for (const bucket of data) {
    if (!bucket || typeof bucket !== 'object') continue;
    const results = (bucket as { results?: unknown }).results;
    if (!Array.isArray(results)) continue;
    for (const row of results) {
      if (!row || typeof row !== 'object') continue;
      const amount = (row as { amount?: { value?: unknown; currency?: unknown } }).amount;
      if (!amount || typeof amount !== 'object') continue;
      const cur = String(amount.currency ?? 'usd').toLowerCase();
      const val = amount.value;
      if (cur === 'usd' && typeof val === 'number' && Number.isFinite(val)) sum += val;
    }
  }
  return Math.round(sum * 1_000_000) / 1_000_000;
}

async function fetchOpenAiOrganizationCostsLast31Days(
  adminKey: string,
  organizationId: string,
): Promise<{ ok: true; totalUsd: number } | { ok: false; httpStatus: number; error: string }> {
  const end = Math.floor(Date.now() / 1000);
  const start = end - 31 * 86400;
  const url = new URL('https://api.openai.com/v1/organization/costs');
  url.searchParams.set('start_time', String(start));
  url.searchParams.set('end_time', String(end));
  url.searchParams.set('bucket_width', '1d');
  url.searchParams.set('limit', '35');

  const r = await fetch(url.toString(), {
    method: 'GET',
    headers: buildOpenAiOrganizationApiHeaders(adminKey, organizationId),
  });
  const text = await r.text();
  if (!r.ok) {
    return {
      ok: false,
      httpStatus: r.status,
      error: text.slice(0, 900) || r.statusText,
    };
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(text) as unknown;
  } catch {
    return { ok: false, httpStatus: r.status, error: 'OpenAI costs: response is not valid JSON' };
  }
  return { ok: true, totalUsd: sumOpenAiOrganizationCostsUsd(parsed) };
}

export async function runOpsBillingSync(supabase: OpsBillingSupabase): Promise<
  { ok: true; detail: OpsPollDetail } | { ok: false; error: string }
> {
  const nowIso = new Date().toISOString();
  const detail: OpsPollDetail = {};

  await supabase
    .from('platform_ops_billing_poll_state')
    .update({
      last_poll_started_at: nowIso,
      last_poll_status: 'running',
      last_poll_detail: {},
    })
    .eq('id', 1);

  const vercelToken = (process.env.VERCEL_OPS_API_TOKEN || '').trim();
  if (!vercelToken) {
    detail.vercel = { ok: false, error: 'VERCEL_OPS_API_TOKEN missing' };
    await upsertCommitment(supabase, {
      vendor: 'vercel',
      display_label: 'Vercel (Hosting)',
      integration_mode: 'api_polling',
      billing_cycle: 'unknown',
      amount_expected: null,
      amount_currency: 'USD',
      monthly_estimate_sar: null,
      next_renewal_at: null,
      last_synced_at: nowIso,
      last_sync_status: 'partial',
      last_sync_error: null,
      external_stable_key: 'vercel:account',
      external_ref: {},
      vendor_payload: {},
      is_manual: false,
      manual_notes: null,
      data_gap_kind: 'missing_api_key',
      data_gap_message: 'أضف VERCEL_OPS_API_TOKEN في بيئة Vercel ثم أعد المزامنة.',
      credential_env_hint: 'VERCEL_OPS_API_TOKEN',
    });
  } else {
    try {
      const res = await fetch('https://api.vercel.com/v2/user', {
        headers: { Authorization: `Bearer ${vercelToken}` },
      });
      const httpStatus = res.status;
      if (!res.ok) {
        const body = await res.text();
        detail.vercel = { ok: false, httpStatus, error: body.slice(0, 200) };
        await upsertCommitment(supabase, {
          vendor: 'vercel',
          display_label: 'Vercel (Hosting)',
          integration_mode: 'api_polling',
          billing_cycle: 'unknown',
          amount_expected: null,
          amount_currency: 'USD',
          monthly_estimate_sar: null,
          next_renewal_at: null,
          last_synced_at: nowIso,
          last_sync_status: res.status === 401 || res.status === 403 ? 'auth_error' : 'error',
          last_sync_error: `HTTP ${httpStatus}`,
          external_stable_key: 'vercel:account',
          external_ref: { httpStatus },
          vendor_payload: {},
          is_manual: false,
          manual_notes: null,
          data_gap_kind: res.status === 401 || res.status === 403 ? 'token_expired' : 'vendor_api_changed',
          data_gap_message: 'فشل استدعاء api.vercel.com/v2/user — راجع الصلاحيات أو انتهاء الرمز.',
          credential_env_hint: 'VERCEL_OPS_API_TOKEN',
        });
      } else {
        const j = (await res.json()) as Record<string, unknown>;
        const email = typeof j.email === 'string' ? j.email : '';
        const username = typeof j.username === 'string' ? j.username : '';
        detail.vercel = { ok: true, httpStatus };
        await upsertCommitment(supabase, {
          vendor: 'vercel',
          display_label: email ? `Vercel — ${email}` : username ? `Vercel — @${username}` : 'Vercel (Hosting)',
          integration_mode: 'api_polling',
          billing_cycle: 'unknown',
          amount_expected: null,
          amount_currency: 'USD',
          monthly_estimate_sar: null,
          next_renewal_at: null,
          last_synced_at: nowIso,
          last_sync_status: 'partial',
          last_sync_error: null,
          external_stable_key: 'vercel:account',
          external_ref: { email, username },
          vendor_payload: j,
          is_manual: false,
          manual_notes: null,
          data_gap_kind: 'discovery_pending',
          data_gap_message:
            'تم الاتصال بحساب Vercel؛ تاريخ التجديد والمبلغ غير متاحين من واجهة user — أدخل التزام التجديد يدوياً أو وسّع التكامل لاحقاً (فواتير/فريق).',
          credential_env_hint: 'VERCEL_OPS_API_TOKEN',
        });
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      detail.vercel = { ok: false, error: msg };
      await upsertCommitment(supabase, {
        vendor: 'vercel',
        display_label: 'Vercel (Hosting)',
        integration_mode: 'api_polling',
        billing_cycle: 'unknown',
        amount_expected: null,
        amount_currency: 'USD',
        monthly_estimate_sar: null,
        next_renewal_at: null,
        last_synced_at: nowIso,
        last_sync_status: 'error',
        last_sync_error: msg,
        external_stable_key: 'vercel:account',
        external_ref: {},
        vendor_payload: {},
        is_manual: false,
        manual_notes: null,
        data_gap_kind: 'vendor_api_changed',
        data_gap_message: msg,
        credential_env_hint: 'VERCEL_OPS_API_TOKEN',
      });
    }
  }

  const supaMgmt = (process.env.SUPABASE_MANAGEMENT_API_TOKEN || '').trim();
  if (!supaMgmt) {
    detail.supabase_mgmt = { ok: false, error: 'SUPABASE_MANAGEMENT_API_TOKEN missing' };
    await upsertCommitment(supabase, {
      vendor: 'supabase_mgmt',
      display_label: 'Supabase (مشاريع المنظّمة)',
      integration_mode: 'api_polling',
      billing_cycle: 'unknown',
      amount_expected: null,
      amount_currency: 'USD',
      monthly_estimate_sar: null,
      next_renewal_at: null,
      last_synced_at: nowIso,
      last_sync_status: 'partial',
      last_sync_error: null,
      external_stable_key: 'supabase:org',
      external_ref: {},
      vendor_payload: {},
      is_manual: false,
      manual_notes: null,
      data_gap_kind: 'missing_api_key',
      data_gap_message: 'أضف SUPABASE_MANAGEMENT_API_TOKEN (Organization access token) في Vercel.',
      credential_env_hint: 'SUPABASE_MANAGEMENT_API_TOKEN',
    });
  } else {
    try {
      const res = await fetch('https://api.supabase.com/v1/projects', {
        headers: {
          Authorization: `Bearer ${supaMgmt}`,
          'Content-Type': 'application/json',
        },
      });
      const httpStatus = res.status;
      if (!res.ok) {
        const body = await res.text();
        detail.supabase_mgmt = { ok: false, httpStatus, error: body.slice(0, 200) };
        await upsertCommitment(supabase, {
          vendor: 'supabase_mgmt',
          display_label: 'Supabase',
          integration_mode: 'api_polling',
          billing_cycle: 'unknown',
          amount_expected: null,
          amount_currency: 'USD',
          monthly_estimate_sar: null,
          next_renewal_at: null,
          last_synced_at: nowIso,
          last_sync_status: httpStatus === 401 || httpStatus === 403 ? 'auth_error' : 'error',
          last_sync_error: `HTTP ${httpStatus}`,
          external_stable_key: 'supabase:org',
          external_ref: { httpStatus },
          vendor_payload: {},
          is_manual: false,
          manual_notes: null,
          data_gap_kind: httpStatus === 401 || httpStatus === 403 ? 'token_expired' : 'vendor_api_changed',
          data_gap_message: 'فشل جلب قائمة المشاريع من api.supabase.com',
          credential_env_hint: 'SUPABASE_MANAGEMENT_API_TOKEN',
        });
      } else {
        const raw = (await res.json()) as unknown;
        const projects = Array.isArray(raw)
          ? raw
          : raw &&
              typeof raw === 'object' &&
              Array.isArray((raw as { projects?: unknown }).projects)
            ? ((raw as { projects: unknown[] }).projects as unknown[])
            : [];
        detail.supabase_mgmt = { ok: true, httpStatus, projectCount: projects.length };

        for (const p of projects) {
          const pr = p as Record<string, unknown>;
          const id = typeof pr.id === 'string' ? pr.id : '';
          const name = typeof pr.name === 'string' ? pr.name : id || 'مشروع';
          if (!id) continue;
          await upsertCommitment(supabase, {
            vendor: 'supabase_mgmt',
            display_label: `Supabase — ${name}`,
            integration_mode: 'api_polling',
            billing_cycle: 'unknown',
            amount_expected: null,
            amount_currency: 'USD',
            monthly_estimate_sar: null,
            next_renewal_at: null,
            last_synced_at: nowIso,
            last_sync_status: 'partial',
            last_sync_error: null,
            external_stable_key: `project:${id}`,
            external_ref: { project_id: id },
            vendor_payload: pr,
            is_manual: false,
            manual_notes: null,
            data_gap_kind: 'discovery_pending',
            data_gap_message:
              'المشروع مُكتشف عبر Management API؛ الفوترة/التجديد تُدار من لوحة Supabase — أدخل المبلغ/التاريخ يدوياً أو ربط فوترة لاحقاً.',
            credential_env_hint: 'SUPABASE_MANAGEMENT_API_TOKEN',
          });
        }

        await upsertCommitment(supabase, {
          vendor: 'supabase_mgmt',
          display_label:
            projects.length > 0
              ? `Supabase — ملخص المنظّمة (${projects.length} مشروع)`
              : 'Supabase (لا مشاريع في الاستجابة)',
          integration_mode: 'api_polling',
          billing_cycle: 'unknown',
          amount_expected: null,
          amount_currency: 'USD',
          monthly_estimate_sar: null,
          next_renewal_at: null,
          last_synced_at: nowIso,
          last_sync_status: projects.length > 0 ? 'ok' : 'partial',
          last_sync_error: null,
          external_stable_key: 'supabase:org',
          external_ref: { project_count: projects.length },
          vendor_payload: { project_count: projects.length },
          is_manual: false,
          manual_notes: null,
          data_gap_kind: 'discovery_pending',
          data_gap_message:
            projects.length > 0
              ? 'تمت مزامنة قائمة المشاريع؛ أدخل تواريخ التجديد والتكاليف المتوقعة يدوياً أو عبر توسيع التكامل.'
              : 'لا توجد مشاريع في القائمة — تحقق من صلاحية الرمز أو المنظّمة.',
          credential_env_hint: 'SUPABASE_MANAGEMENT_API_TOKEN',
        });
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      detail.supabase_mgmt = { ok: false, error: msg };
      await upsertCommitment(supabase, {
        vendor: 'supabase_mgmt',
        display_label: 'Supabase',
        integration_mode: 'api_polling',
        billing_cycle: 'unknown',
        amount_expected: null,
        amount_currency: 'USD',
        monthly_estimate_sar: null,
        next_renewal_at: null,
        last_synced_at: nowIso,
        last_sync_status: 'error',
        last_sync_error: msg,
        external_stable_key: 'supabase:org',
        external_ref: {},
        vendor_payload: {},
        is_manual: false,
        manual_notes: null,
        data_gap_kind: 'vendor_api_changed',
        data_gap_message: msg,
        credential_env_hint: 'SUPABASE_MANAGEMENT_API_TOKEN',
      });
    }
  }

  /** GoDaddy: صف واحد مُجمَّع — نطاق halaqmap.com + أساسيات البريد + مواقع مجانية. */
  try {
    const portalUrl = (
      process.env.GODADDY_SUBSCRIPTIONS_PORTAL_URL || 'https://account.godaddy.com/subscriptions?plid=1'
    ).trim();
    const domainSettingsUrl = (
      process.env.GODADDY_DOMAIN_SETTINGS_URL ||
      'https://dcc.godaddy.com/control/portfolio/halaqmap.com/settings?ventureId=890d73b2-7783-4597-9e73-6f20a36c9968&ua_placement=shared_header'
    ).trim();
    const ref = { portal_url: portalUrl, domain_settings_url: domainSettingsUrl };

    await upsertCommitment(supabase, {
      vendor: 'godaddy',
      display_label: 'GoDaddy — halaqmap.com (Domain & Essentials)',
      integration_mode: 'manual_only',
      billing_cycle: 'annual',
      amount_expected: null,
      amount_currency: 'SAR',
      monthly_estimate_sar: 40.66,
      next_renewal_at: '2027-05-01T12:00:00.000Z',
      last_synced_at: nowIso,
      last_sync_status: 'ok',
      last_sync_error: null,
      external_stable_key: 'godaddy:domain-and-essentials',
      external_ref: {
        ...ref,
        domain: 'halaqmap.com',
        includes: [
          'Microsoft 365 Email Essentials (admin@halaqmap.com)',
          'Domain renewal & full protection',
          'Website + Marketing (free tier)',
        ],
      },
      vendor_payload: {
        m365_monthly_sar: 29,
        domain_monthly_sar: 11.66,
        website_marketing_monthly_sar: 0,
        domain_renewal_at: '2029-05-01T12:00:00.000Z',
        m365_renewal_at: '2027-05-01T12:00:00.000Z',
      },
      is_manual: true,
      manual_notes:
        'صف مُجمَّع: بريد M365 + تجديد النطاق + مواقع/تسويق مجاني — حدّث التواريخ من لوحة GoDaddy عند الحاجة.',
      data_gap_kind: null,
      data_gap_message: null,
      credential_env_hint: null,
    });

    await supabase
      .from('platform_ops_billing_commitments')
      .delete()
      .in('external_stable_key', [
        'godaddy:subscriptions_portal',
        'godaddy:m365-email-essentials',
        'godaddy:domain-halaqmap-protection',
        'godaddy:website-marketing-free',
      ]);

    detail.godaddy = { ok: true, portalSeeded: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    detail.godaddy = { ok: false, portalSeeded: false, error: msg };
  }

  /** OpenAI: رابط فوترة المنظّمة + لقطة مرجعية؛ وعند REVENUE_BILLING_MONITOR_TOKEN (أو OPENAI_ADMIN_KEY) جلب تكلفة API (آخر 31 يوماً). */
  try {
    const portalUrl = (
      process.env.OPENAI_BILLING_PORTAL_URL ||
      'https://platform.openai.com/settings/organization/billing/overview'
    ).trim();
    const ref = { portal_url: portalUrl };
    const adminKey = getOpenAiAdminKey();
    const hasAdminKey = Boolean(adminKey);
    const openAiOrgId = getOpenAiOrganizationIdHeader();

    type CostsApiPoll =
      | { ok: true; last31dUsd: number }
      | { ok: false; httpStatus: number; error: string };
    let costsApi: CostsApiPoll | undefined;
    let last31dUsd: number | null = null;
    if (hasAdminKey && openAiOrgId) {
      const c = await fetchOpenAiOrganizationCostsLast31Days(adminKey, openAiOrgId);
      if (c.ok) {
        last31dUsd = c.totalUsd;
        costsApi = { ok: true, last31dUsd: c.totalUsd };
      } else {
        costsApi = { ok: false, httpStatus: c.httpStatus, error: c.error };
      }
    } else if (hasAdminKey && !openAiOrgId) {
      costsApi = {
        ok: false,
        httpStatus: 0,
        error:
          'Missing OPENAI_ORGANIZATION_ID (or OPENAI_ORG_ID). Required with Admin key for OpenAI-Organization on GET /v1/organization/costs.',
      };
    }

    const openaiOverviewGap = (() => {
      if (!hasAdminKey) {
        return {
          kind: 'missing_api_key' as const,
          message:
            'لا يوجد مفتاح مراقبة OpenAI في بيئة الخادم. أضف REVENUE_BILLING_MONITOR_TOKEN (أو OPENAI_ADMIN_KEY) — Admin API key للمنظّمة من platform.openai.com، وليس OPENAI_API_KEY. ثم أعد نشر Vercel واضغط «مزامنة».',
        };
      }
      if (!openAiOrgId) {
        return {
          kind: 'missing_api_key' as const,
          message:
            'عيّن OPENAI_ORGANIZATION_ID أو OPENAI_ORG_ID في Vercel (معرّف org-… من إعدادات المنظّمة في OpenAI) — مطلوب لرأس OpenAI-Organization مع طلبات فوترة المنظّمة.',
        };
      }
      if (costsApi && 'ok' in costsApi && costsApi.ok) {
        return { kind: null as null, message: 'تم جلب تكلفة الاستخدام (آخر 31 يوماً) عبر organization/costs.' };
      }
      const st = costsApi && 'ok' in costsApi && !costsApi.ok ? costsApi.httpStatus : 0;
      const errSnippet = costsApi && 'ok' in costsApi && !costsApi.ok ? String(costsApi.error || '').slice(0, 280) : '';
      if (st === 401 || st === 403) {
        return {
          kind: 'token_expired' as const,
          message: `رفض OpenAI (${st}) — تحقق من Admin API key للمنظّمة: https://platform.openai.com/settings/organization/admin-keys (ليس OPENAI_API_KEY). ${errSnippet ? `تفاصيل: ${errSnippet}` : ''}`,
        };
      }
      return {
        kind: 'vendor_api_changed' as const,
        message: `فشل organization/costs (HTTP ${st || '؟'}). راجع المفتاح ومعرّف المنظّمة. ${errSnippet ? `تفاصيل: ${errSnippet}` : ''}`,
      };
    })();

    const snapshot = {
      organization: 'HalaqMapKey',
      project: 'Default project',
      plan: 'Pay as you go',
      credit_balance_usd: 9.92,
      auto_recharge_enabled: true,
      auto_recharge_when_balance_usd: 5.0,
      auto_recharge_top_up_to_usd: 10.0,
      snapshot_note:
        'لقطة مرجعية من لوحة الفوترة للرصيد/إعادة الشحن؛ راقب القيم في platform.openai.com.',
      ...(last31dUsd != null
        ? {
            api_costs_last_31d_usd: last31dUsd,
            api_costs_synced_at: nowIso,
          }
        : {}),
    };

    await upsertCommitment(supabase, {
      vendor: 'openai',
      display_label: 'OpenAI API — Pay As You Go',
      integration_mode: hasAdminKey && last31dUsd != null ? 'api_polling' : 'manual_only',
      billing_cycle: 'custom',
      amount_expected: last31dUsd != null ? last31dUsd : 9.92,
      amount_currency: 'USD',
      monthly_estimate_sar: null,
      next_renewal_at: null,
      last_synced_at: nowIso,
      last_sync_status: hasAdminKey && costsApi && 'ok' in costsApi && costsApi.ok ? 'ok' : 'partial',
      last_sync_error: costsApi && 'ok' in costsApi && !costsApi.ok ? String(costsApi.error || '').slice(0, 500) : null,
      external_stable_key: 'openai:payg-consolidated',
      external_ref: { ...ref, ...snapshot },
      vendor_payload: snapshot,
      is_manual: true,
      manual_notes:
        'صف مُجمَّع: فوترة المنظّمة + Pay-as-you-go. إعادة الشحن التلقائي (5→10 USD). organization/costs لآخر 31 يوماً.',
      data_gap_kind: openaiOverviewGap.kind,
      data_gap_message: openaiOverviewGap.message,
      credential_env_hint: !hasAdminKey
        ? 'REVENUE_BILLING_MONITOR_TOKEN أو OPENAI_ADMIN_KEY'
        : !openAiOrgId
          ? 'OPENAI_ORGANIZATION_ID أو OPENAI_ORG_ID'
          : null,
    });

    await supabase
      .from('platform_ops_billing_commitments')
      .delete()
      .in('external_stable_key', ['openai:billing_overview', 'openai:payg-credit-snapshot']);

    detail.openai = {
      ok: true,
      seeded: true,
      organizationCostsHeader: Boolean(openAiOrgId),
      ...(costsApi !== undefined ? { costsApi } : {}),
    };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    detail.openai = { ok: false, seeded: false, error: msg };
  }

  /** Resend: فوترة البريد — رابط الإعدادات + لقطة خطط $0 (بدون مفاتيح API في الجدول). */
  try {
    const portalUrl = (process.env.RESEND_BILLING_PORTAL_URL || 'https://resend.com/settings/billing').trim();
    const ref = { portal_url: portalUrl };
    const invoiceEmail = (process.env.RESEND_BILLING_INVOICE_EMAIL || '').trim();

    await upsertCommitment(supabase, {
      vendor: 'resend',
      display_label: 'Resend — Transactional & Marketing Email Infrastructure',
      integration_mode: 'manual_only',
      billing_cycle: 'monthly',
      amount_expected: 0,
      amount_currency: 'USD',
      monthly_estimate_sar: 0,
      next_renewal_at: null,
      last_synced_at: nowIso,
      last_sync_status: 'ok',
      last_sync_error: null,
      external_stable_key: 'resend:infrastructure',
      external_ref: {
        ...ref,
        ...(invoiceEmail ? { billing_invoice_email: invoiceEmail } : {}),
        invoices: 'none_yet',
        payment_methods: 'none_free_tier',
        snapshot_note: 'صف مُجمَّع: Transactional 3k/mo + Marketing 1k contacts — خطط مجانية حالياً.',
      },
      vendor_payload: {
        portal_url: portalUrl,
        ...(invoiceEmail ? { billing_invoice_email: invoiceEmail } : {}),
        transactional_plan: { emails_per_month: 3000, price_usd_per_month: 0 },
        marketing_plan: { contacts: 1000, price_usd_per_month: 0 },
        billing_region_hint: 'SA',
      },
      is_manual: true,
      manual_notes:
        'صف مُجمَّع: بريد معاملاتي + تسويق. خطط مجانية ($0) — عند الترقية حدّث المبالغ. RESEND_BILLING_INVOICE_EMAIL اختياري.',
      data_gap_kind: null,
      data_gap_message: null,
      credential_env_hint: 'RESEND_API_KEY (للإرسال — الفوترة من لوحة Resend)',
    });

    await supabase
      .from('platform_ops_billing_commitments')
      .delete()
      .in('external_stable_key', [
        'resend:billing_portal',
        'resend:plan-transactional-free',
        'resend:plan-marketing-free',
      ]);

    detail.resend = { ok: true, seeded: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    detail.resend = { ok: false, seeded: false, error: msg };
  }

  const finished = new Date().toISOString();
  const overall =
    detail.vercel?.ok === true ||
    detail.supabase_mgmt?.ok === true ||
    detail.godaddy?.ok === true ||
    detail.openai?.ok === true ||
    detail.resend?.ok === true
      ? 'ok'
      : detail.vercel?.ok === false && detail.supabase_mgmt?.ok === false
        ? 'error'
        : 'partial';

  await supabase
    .from('platform_ops_billing_poll_state')
    .update({
      last_poll_finished_at: finished,
      last_poll_status: overall,
      last_poll_detail: detail as unknown as Record<string, unknown>,
    })
    .eq('id', 1);

  return { ok: true, detail };
}
