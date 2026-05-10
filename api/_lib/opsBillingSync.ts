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
  /** OpenAI — رابط الفوترة + لقطة Pay-as-you-go (بدون Consumption API حتى التفعيل) */
  openai?: { ok: boolean; seeded: boolean; error?: string };
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

async function upsertCommitment(supabase: OpsBillingSupabase, row: CommitmentRow): Promise<{ error?: string }> {
  const { error } = await supabase.from('platform_ops_billing_commitments').upsert(row, {
    onConflict: 'vendor,external_stable_key',
  });
  if (error) return { error: error.message };
  return {};
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

  /** GoDaddy: رابط لوحة الاشتراكات + صفوف مرجعية من بيانات الحساب (يدوي حتى ربط API شريك). */
  try {
    const portalUrl = (
      process.env.GODADDY_SUBSCRIPTIONS_PORTAL_URL || 'https://account.godaddy.com/subscriptions?plid=1'
    ).trim();
    const ref = { portal_url: portalUrl };

    await upsertCommitment(supabase, {
      vendor: 'godaddy',
      display_label: 'GoDaddy — لوحة الاشتراكات (النطاق والخدمات)',
      integration_mode: 'manual_only',
      billing_cycle: 'custom',
      amount_expected: null,
      amount_currency: 'SAR',
      monthly_estimate_sar: null,
      next_renewal_at: null,
      last_synced_at: nowIso,
      last_sync_status: 'partial',
      last_sync_error: null,
      external_stable_key: 'godaddy:subscriptions_portal',
      external_ref: ref,
      vendor_payload: ref,
      is_manual: true,
      manual_notes: 'رابط مباشر لصفحة الاشتراكات في GoDaddy.',
      data_gap_kind: 'missing_price',
      data_gap_message: 'أضف المبالغ من لوحة GoDaddy (سجل الطلبات) عند الحاجة.',
      credential_env_hint: null,
    });

    await upsertCommitment(supabase, {
      vendor: 'godaddy',
      display_label: 'GoDaddy — أساسيات البريد Microsoft 365 (admin@halaqmap.com)',
      integration_mode: 'manual_only',
      billing_cycle: 'annual',
      amount_expected: null,
      amount_currency: 'SAR',
      monthly_estimate_sar: null,
      next_renewal_at: '2027-04-01T12:00:00.000Z',
      last_synced_at: nowIso,
      last_sync_status: 'partial',
      last_sync_error: null,
      external_stable_key: 'godaddy:m365-email-essentials',
      external_ref: { ...ref, identifier: 'admin@halaqmap.com', auto_renew: true },
      vendor_payload: { product: 'Microsoft 365 Email Essentials' },
      is_manual: true,
      manual_notes: 'تجديد تلقائي — تاريخ الفوترة من لوحة GoDaddy.',
      data_gap_kind: 'missing_price',
      data_gap_message: 'أدخل مبلغ التجديد السنوي من GoDaddy.',
      credential_env_hint: null,
    });

    await upsertCommitment(supabase, {
      vendor: 'godaddy',
      display_label: 'GoDaddy — HALAQMAP.COM (حماية النطاق الكاملة)',
      integration_mode: 'manual_only',
      billing_cycle: 'annual',
      amount_expected: null,
      amount_currency: 'SAR',
      monthly_estimate_sar: null,
      next_renewal_at: '2029-04-01T12:00:00.000Z',
      last_synced_at: nowIso,
      last_sync_status: 'partial',
      last_sync_error: null,
      external_stable_key: 'godaddy:domain-halaqmap-protection',
      external_ref: { ...ref, domain: 'halaqmap.com', auto_renew: true },
      vendor_payload: { product: 'Domain registration & full protection' },
      is_manual: true,
      manual_notes: 'تجديد تلقائي — تاريخ الفوترة من لوحة GoDaddy.',
      data_gap_kind: 'missing_price',
      data_gap_message: 'أدخل مبلغ تجديد النطاق/الحماية من GoDaddy.',
      credential_env_hint: null,
    });

    await upsertCommitment(supabase, {
      vendor: 'godaddy',
      display_label: 'GoDaddy — مواقع + تسويق (مجاني) — halaqmap.com',
      integration_mode: 'manual_only',
      billing_cycle: 'unknown',
      amount_expected: 0,
      amount_currency: 'SAR',
      monthly_estimate_sar: 0,
      next_renewal_at: null,
      last_synced_at: nowIso,
      last_sync_status: 'ok',
      last_sync_error: null,
      external_stable_key: 'godaddy:website-marketing-free',
      external_ref: { ...ref, domain: 'halaqmap.com', billing: 'free' },
      vendor_payload: { product: 'Website + Marketing (free tier)' },
      is_manual: true,
      manual_notes: 'مذكور في GoDaddy كـ «حر» — لا يُتوقع خصم.',
      data_gap_kind: null,
      data_gap_message: null,
      credential_env_hint: null,
    });

    detail.godaddy = { ok: true, portalSeeded: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    detail.godaddy = { ok: false, portalSeeded: false, error: msg };
  }

  /** OpenAI: رابط فوترة المنظّمة + لقطة مرجعية (رصيد ائتمان + إعادة شحن تلقائي — من لوحة الويب). */
  try {
    const portalUrl = (
      process.env.OPENAI_BILLING_PORTAL_URL ||
      'https://platform.openai.com/settings/organization/billing/overview'
    ).trim();
    const ref = { portal_url: portalUrl };

    await upsertCommitment(supabase, {
      vendor: 'openai',
      display_label: 'OpenAI — نظرة عامة على الفوترة (المنظّمة)',
      integration_mode: 'manual_only',
      billing_cycle: 'custom',
      amount_expected: null,
      amount_currency: 'USD',
      monthly_estimate_sar: null,
      next_renewal_at: null,
      last_synced_at: nowIso,
      last_sync_status: 'partial',
      last_sync_error: null,
      external_stable_key: 'openai:billing_overview',
      external_ref: ref,
      vendor_payload: ref,
      is_manual: true,
      manual_notes: 'رابط لوحة الفوترة في OpenAI (HalaqMapKey / Default project).',
      data_gap_kind: 'missing_api_key',
      data_gap_message:
        'التكامل البرمجي للرصيد اختياري — حتى ذلك حدّث اللقطة يدوياً أو عبر «مزامنة» بعد كل دفعة.',
      credential_env_hint: 'OPENAI_ADMIN_KEY (مستقبلاً — لا يُخزَّن هنا)',
    });

    const snapshot = {
      organization: 'HalaqMapKey',
      project: 'Default project',
      plan: 'Pay as you go',
      credit_balance_usd: 9.92,
      auto_recharge_enabled: true,
      auto_recharge_when_balance_usd: 5.0,
      auto_recharge_top_up_to_usd: 10.0,
      snapshot_note:
        'لقطة مرجعية من لوحة الفوترة؛ الرصيد يتغير — أعد المزامنة أو اربط API لاحقاً.',
    };

    await upsertCommitment(supabase, {
      vendor: 'openai',
      display_label: 'OpenAI — Pay as you go (رصيد ائتمان)',
      integration_mode: 'manual_only',
      billing_cycle: 'custom',
      amount_expected: 9.92,
      amount_currency: 'USD',
      monthly_estimate_sar: null,
      next_renewal_at: null,
      last_synced_at: nowIso,
      last_sync_status: 'partial',
      last_sync_error: null,
      external_stable_key: 'openai:payg-credit-snapshot',
      external_ref: { ...ref, ...snapshot },
      vendor_payload: snapshot,
      is_manual: true,
      manual_notes:
        'إعادة الشحن التلقائي: عند وصول الرصيد إلى 5.00 USD تُخصم طريقة الدفع لرفع الرصيد إلى 10.00 USD (حسب إعدادات المنظّمة في OpenAI).',
      data_gap_kind: 'discovery_pending',
      data_gap_message:
        'التكلفة شهرية غير ثابتة (حسب الاستخدام) — راقب سجل الفوترة في OpenAI أو حدّث المبلغ الشهري التقديري يدوياً.',
      credential_env_hint: null,
    });

    detail.openai = { ok: true, seeded: true };
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
      display_label: 'Resend — إعدادات الفوترة والاشتراكات',
      integration_mode: 'manual_only',
      billing_cycle: 'monthly',
      amount_expected: 0,
      amount_currency: 'USD',
      monthly_estimate_sar: 0,
      next_renewal_at: null,
      last_synced_at: nowIso,
      last_sync_status: 'ok',
      last_sync_error: null,
      external_stable_key: 'resend:billing_portal',
      external_ref: {
        ...ref,
        ...(invoiceEmail ? { billing_invoice_email: invoiceEmail } : {}),
        invoices: 'none_yet',
        payment_methods: 'none_free_tier',
        snapshot_note: 'لقطة منطقية — لا فواتير حتى أول دورة دفع بعد الترقية.',
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
        'خطط مجانية حالياً ($0) — لا فواتير بعد. عند الترقية حدّث المبالغ والتجديد. لإظهار بريد الفواتير في الحقول عيّن RESEND_BILLING_INVOICE_EMAIL في Vercel.',
      data_gap_kind: null,
      data_gap_message: null,
      credential_env_hint: 'RESEND_API_KEY (للإرسال — الفوترة من لوحة Resend)',
    });

    await upsertCommitment(supabase, {
      vendor: 'resend',
      display_label: 'Resend — Transactional (3,000 emails / mo)',
      integration_mode: 'manual_only',
      billing_cycle: 'monthly',
      amount_expected: 0,
      amount_currency: 'USD',
      monthly_estimate_sar: 0,
      next_renewal_at: null,
      last_synced_at: nowIso,
      last_sync_status: 'ok',
      last_sync_error: null,
      external_stable_key: 'resend:plan-transactional-free',
      external_ref: ref,
      vendor_payload: { quota_emails: 3000, price_usd_per_month: 0 },
      is_manual: true,
      manual_notes: 'كما في تبويب Subscriptions في Resend.',
      data_gap_kind: null,
      data_gap_message: null,
      credential_env_hint: null,
    });

    await upsertCommitment(supabase, {
      vendor: 'resend',
      display_label: 'Resend — Marketing (1,000 contacts / mo)',
      integration_mode: 'manual_only',
      billing_cycle: 'monthly',
      amount_expected: 0,
      amount_currency: 'USD',
      monthly_estimate_sar: 0,
      next_renewal_at: null,
      last_synced_at: nowIso,
      last_sync_status: 'ok',
      last_sync_error: null,
      external_stable_key: 'resend:plan-marketing-free',
      external_ref: ref,
      vendor_payload: { contacts: 1000, price_usd_per_month: 0 },
      is_manual: true,
      manual_notes: 'كما في تبويب Subscriptions في Resend.',
      data_gap_kind: null,
      data_gap_message: null,
      credential_env_hint: null,
    });

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
