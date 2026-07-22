import type { SubscriptionRequest } from '@/lib/index';
import { getSupabaseClient } from '@/integrations/supabase/client';

const TABLE = 'registration_submissions';
const API_BASE = String(import.meta.env.VITE_API_BASE_URL || '').trim().replace(/\/$/, '');
const SERVER_INSERT_URL = API_BASE
  ? `${API_BASE}/api/register-submission`
  : ['', 'api', 'register-submission'].join('/');

const LRI = '\u2066';
const PDI = '\u2069';

function ltrBlock(lines: string[]): string {
  return `${LRI}${lines.join('\n')}${PDI}`;
}

/** رسالة للتنبيه: عربي واضح ثم تعليمات تقنية معزولة اتجاهياً. */
export function registrationSubmissionErrorForToast(message: string): string {
  const m = message.toLowerCase();

  if (m.includes('row-level security') || m.includes('violates row-level')) {
    return (
      'تعذّر حفظ الطلب في قاعدة البيانات.\n' +
      'سياسات الأمان ترفض الإدراج في جدول طلبات التسجيل.\n\n' +
      'اتبع الخطوات التالية من لوحة تحكم Supabase لديك:\n' +
      ltrBlock([
        'Preferred fix (recommended):',
        '  configure and redeploy /api/register-submission with SUPABASE_SERVICE_ROLE_KEY',
        '  then verify GET /api/register-submission => ready: true',
        '',
        'SQL Editor: paste and run ONE of:',
        '  supabase/REGISTRATION_PUBLIC_FULL_SETUP.sql',
        '  OR supabase/migrations/14_registration_submissions_public.sql',
        'Required: INSERT policy TO anon on registration_submissions',
        '  (this repo creates policy name: anon_insert_registration_submissions)',
        'Verify:',
        '  SELECT policyname, cmd, roles FROM pg_policies',
        '  WHERE tablename = \'registration_submissions\';',
      ])
    );
  }
  if (m.includes('octet_length') || m.includes('violates check') || m.includes('check constraint')) {
    return (
      'تعذّر حفظ الطلب في قاعدة البيانات.\n' +
      'حجم بيانات الطلب لا يمر بسياسة الإدراج الحالية.\n\n' +
      'اتبع الخطوات التالية من لوحة تحكم Supabase لديك:\n' +
      ltrBlock([
        'SQL Editor: paste and run:',
        '  supabase/migrations/19_registration_submissions_payload_limit.sql',
        '  (raises payload limit to 5 MB in the insert policy)',
      ])
    );
  }
  if (m.includes('infinite recursion') && m.includes('profiles')) {
    return (
      'تعذّر حفظ الطلب بسبب خطأ في سياسات الأمان (RLS) بجدول profiles.\n\n' +
      'اتبع الخطوات التالية من لوحة Supabase:\n' +
      ltrBlock([
        'SQL Editor: paste and run:',
        '  supabase/migrations/26_fix_profiles_policy_recursion.sql',
        'Then refresh the app and retry.',
      ])
    );
  }
  if (m.includes('infinite recursion') && m.includes('admin_users')) {
    return (
      'تعذّر تنفيذ العملية بسبب سياسة RLS قديمة في جدول admin_users.\n\n' +
      'اتبع الخطوات التالية من لوحة Supabase:\n' +
      ltrBlock([
        'SQL Editor: paste and run:',
        '  supabase/migrations/28_fix_admin_users_recursion_and_admin_function.sql',
        'Then refresh the app and retry.',
      ])
    );
  }
  if (m.includes('registration_intent_required')) {
    return (
      'رفض السيرفر حفظ الطلب: توقيع نية التسجيل غير صالح أو منتهي.\n\n' +
      'تحقق من لوحة Vercel:\n' +
      ltrBlock([
        'Set REGISTRATION_INTENT_SECRET (server-only) and redeploy functions + frontend.',
        'Ensure POST /api/register-mint-intent is reachable (same project as register-submission).',
        'If the site is static on cPanel: set VITE_REGISTRATION_MINT_INTENT_URL to full Vercel URL, rebuild dist, re-upload.',
      ])
    );
  }
  if (m.includes('professional_commitment_required')) {
    return (
      'تعذّر حفظ الطلب: الالتزام المهني إلزامي.\n' +
      'أعد تأشير «أوافق على الالتزام المهني» في الخطوة الأخيرة قبل الإرسال.'
    );
  }
  if (m.includes('software_product_ack_required')) {
    return (
      'تعذّر حفظ الطلب: إقرار شراء المنتج البرمجي إلزامي.\n' +
      'أعد تأشير «أوافق على إقرار شراء المنتج البرمجي» في الخطوة الأخيرة قبل الإرسال.'
    );
  }
  if (m.includes('registration_compliance_incomplete')) {
    return 'تعذّر حفظ الطلب: بيانات الامتثال القانوني غير مكتملة — أعد تأشير جميع خانات الموافقة.';
  }
  if (m.includes('invalid_tier')) {
    return 'تعذّر حفظ الطلب: الباقة المختارة غير صالحة — أعد اختيار الباقة من الرابط الرسمي.';
  }
  if (m.includes('invalid_digital_shift_addon')) {
    return 'تعذّر حفظ الطلب: الإضافة البرمجية المتقدمة متاحة للباقة الماسية فقط.';
  }
  return (
    'تعذّر حفظ الطلب في قاعدة البيانات.\n\n' +
    ltrBlock([`Server message: ${message}`])
  );
}

function getSubmissionApiUrl(): string {
  const fromEnv = (import.meta.env.VITE_REGISTRATION_SUBMISSION_URL as string | undefined)?.trim();
  return fromEnv || SERVER_INSERT_URL;
}

function getBrowserAnonKey(): string {
  return ((import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) || '').trim();
}

type ServerInsertResult =
  | { ok: true }
  | { ok: false; error: string; allowFallback: boolean };

function isServerInsertFailure(
  result: ServerInsertResult
): result is { ok: false; error: string; allowFallback: boolean } {
  return result.ok === false;
}

async function insertRegistrationSubmissionViaServer(
  rowId: string,
  payload: Record<string, unknown>,
  intentToken: string | null
): Promise<ServerInsertResult> {
  const anonKey = getBrowserAnonKey();
  if (!intentToken?.trim() && !anonKey) {
    return {
      ok: false,
      error:
        'VITE_SUPABASE_ANON_KEY غير مضبوط في الواجهة؛ أو فعّل REGISTRATION_INTENT_SECRET على السيرفر مع مسار mint.',
      allowFallback: true,
    };
  }

  const url = getSubmissionApiUrl();
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (anonKey) headers['x-supabase-anon'] = anonKey;
    const supabaseUrl = String(import.meta.env.VITE_SUPABASE_URL || '').trim();
    if (supabaseUrl) headers['x-client-supabase-url'] = supabaseUrl;
    if (intentToken?.trim()) headers['x-registration-intent'] = intentToken.trim();

    const resp = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({ id: rowId, payload }),
    });

    if (resp.ok) return { ok: true };

    let serverMsg = '';
    try {
      const parsed = (await resp.json()) as { error?: string; code?: string; reason?: string };
      serverMsg = [parsed?.error, parsed?.code, parsed?.reason].filter(Boolean).join(' — ');
    } catch {
      /* ignore non-json */
    }

    const base = serverMsg || `HTTP ${resp.status}`;
    const notReady = resp.status === 503 || /not configured/i.test(base);
    const notFound = resp.status === 404 || resp.status === 405;
    const duplicate = resp.status === 409;
    const intentRejected =
      resp.status === 401 && /registration_intent_required|missing_intent|bad_signature|order_mismatch|expired/i.test(base);

    if (duplicate) {
      return { ok: false, error: 'رقم الطلب موجود مسبقاً (تكرار). أعد المحاولة.', allowFallback: false };
    }

    if (intentRejected) {
      return { ok: false, error: base, allowFallback: false };
    }

    if (notReady || notFound) {
      return {
        ok: false,
        error: `Server route not ready: ${base}`,
        allowFallback: true,
      };
    }

    return {
      ok: false,
      error: `تعذر الحفظ عبر السيرفر: ${base}`,
      allowFallback: true,
    };
  } catch (e) {
    return {
      ok: false,
      error: `تعذر الوصول لمسار السيرفر: ${e instanceof Error ? e.message : 'unknown error'}`,
      allowFallback: true,
    };
  }
}

function payloadForInsert(request: SubscriptionRequest): Record<string, unknown> {
  const { receiptDataUrl: _omit, ...rest } = request;
  return rest as Record<string, unknown>;
}

function rowToRequest(row: { id: string; payload: unknown }): SubscriptionRequest | null {
  if (!row.payload || typeof row.payload !== 'object') return null;
  const p = row.payload as SubscriptionRequest;
  if (typeof p.barberName !== 'string' || !p.id) return null;
  return { ...p, id: row.id };
}

export async function insertRegistrationSubmissionRemote(
  request: SubscriptionRequest,
  options?: { intentToken?: string | null }
): Promise<{ ok: true } | { ok: false; error: string }> {
  const payload = payloadForInsert(request);
  const intentToken = options?.intentToken ?? null;
  // المسار الموصى به: حفظ الطلب عبر API سيرفر بمفتاح service_role لتجنب مشاكل RLS المتكررة.
  const serverRes = await insertRegistrationSubmissionViaServer(request.id, payload, intentToken);
  if (isServerInsertFailure(serverRes)) {
    const serverError = serverRes.error;
    if (!serverRes.allowFallback) return { ok: false, error: serverError };

    const client = getSupabaseClient();
    if (!client) {
      return { ok: false, error: serverError };
    }

    const { error } = await client.from(TABLE).insert({
      id: request.id,
      payload,
    });

    if (error) {
      return {
        ok: false,
        error: `${error.message}\n\n${serverError}`,
      };
    }
  }
  return { ok: true };
}

/** يعتمد على سياسة SELECT في Supabase؛ إن منعت RLS القراءة يعيد مصفوفة فارغة. */
export async function fetchRegistrationSubmissionsFromRemote(): Promise<SubscriptionRequest[]> {
  const client = getSupabaseClient();
  if (!client) return [];

  const { data, error } = await client
    .from(TABLE)
    .select('id, payload')
    .order('created_at', { ascending: false })
    .limit(500);

  if (error || !data) {
    if (import.meta.env.DEV) {
      console.warn('[halaqmap] fetch registration_submissions:', error?.message ?? 'no data');
    }
    return [];
  }

  const out: SubscriptionRequest[] = [];
  for (const row of data) {
    const req = rowToRequest(row as { id: string; payload: unknown });
    if (req) out.push(req);
  }
  return out;
}

export async function patchRegistrationSubmissionPayloadRemote(
  rowId: string,
  patch: Partial<
    Pick<
      SubscriptionRequest,
      | 'status'
      | 'rejectionReason'
      | 'reviewedAt'
      | 'reviewedBy'
      | 'adminAccountState'
      | 'suspensionReason'
      | 'linkedBarberId'
      | 'barberMemberNumber'
      /** مزامنة من تعديل الإدارة لجدول الحلاقين — يظهر في تبويب الطلبات */
      | 'email'
      | 'phone'
      | 'location'
      | 'barberName'
    >
  >
): Promise<{ ok: true } | { ok: false; error: string }> {
  const client = getSupabaseClient();
  if (!client) return { ok: false, error: 'Supabase غير مهيأ' };

  const identityKeys = ['email', 'phone', 'location', 'barberName'] as const;
  const hasIdentityPatch = identityKeys.some((k) => patch[k] !== undefined);
  if (hasIdentityPatch) {
    const { data: sessionData } = await client.auth.getSession();
    const accessToken = sessionData.session?.access_token?.trim() || '';
    if (accessToken) {
      try {
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        };
        const supabaseUrl = String(import.meta.env.VITE_SUPABASE_URL || '').trim();
        if (supabaseUrl) headers['x-client-supabase-url'] = supabaseUrl;
        const anon = String(import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();
        if (anon) headers['x-supabase-anon'] = anon;

        const identityPatch: Record<string, unknown> = {};
        if (patch.email !== undefined) identityPatch.email = patch.email;
        if (patch.phone !== undefined) identityPatch.phone = patch.phone;
        if (patch.barberName !== undefined) identityPatch.barberName = patch.barberName;
        if (patch.location !== undefined) identityPatch.location = patch.location;

        const resp = await fetch('/api/admin-registration-submission-patch', {
          method: 'POST',
          headers,
          body: JSON.stringify({ requestId: rowId, patch: identityPatch }),
        });
        const json = (await resp.json().catch(() => ({}))) as { ok?: boolean; error?: string };
        if (resp.ok && json.ok === true) {
          // أكمل بقية الحقول الإدارية عبر المسار المباشر إن وُجدت
          const rest: Record<string, unknown> = { ...patch };
          delete rest.email;
          delete rest.phone;
          delete rest.barberName;
          delete rest.location;
          if (Object.keys(rest).length === 0) return { ok: true };
          // fall through with rest only
          patch = rest as typeof patch;
        } else if (resp.status !== 404 && resp.status !== 405 && resp.status !== 503) {
          return { ok: false, error: json.error || `HTTP ${resp.status}` };
        }
        // 404/503 → fallback مباشر أدناه
      } catch {
        /* fallback */
      }
    }
  }

  if (Object.keys(patch).length === 0) return { ok: true };

  const { data: row, error: fetchErr } = await client.from(TABLE).select('payload').eq('id', rowId).maybeSingle();

  if (fetchErr) return { ok: false, error: fetchErr.message };
  if (!row || typeof row.payload !== 'object' || row.payload === null) {
    return { ok: false, error: 'السجل غير موجود' };
  }

  const merged = { ...(row.payload as Record<string, unknown>), ...patch };
  const { error } = await client.from(TABLE).update({ payload: merged }).eq('id', rowId);

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function deleteRegistrationSubmissionRemote(
  rowId: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const client = getSupabaseClient();
  if (!client) return { ok: false, error: 'Supabase غير مهيأ' };

  const { error } = await client.from(TABLE).delete().eq('id', rowId);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
