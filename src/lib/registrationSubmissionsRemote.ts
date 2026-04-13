import type { SubscriptionRequest } from '@/lib/index';
import { getSupabaseClient } from '@/integrations/supabase/client';

const TABLE = 'registration_submissions';

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
      'التنفيذ في لوحة Supabase:\n' +
      ltrBlock([
        'SQL Editor → run:',
        'supabase/REGISTRATION_PUBLIC_FULL_SETUP.sql',
        'OR supabase/migrations/14_registration_submissions_public.sql',
        'Policy must allow INSERT for role anon on registration_submissions',
      ])
    );
  }
  if (m.includes('octet_length') || m.includes('violates check') || m.includes('check constraint')) {
    return (
      'تعذّر حفظ الطلب في قاعدة البيانات.\n' +
      'حجم بيانات الطلب لا يمر بسياسة الإدراج الحالية.\n\n' +
      'التنفيذ في لوحة Supabase:\n' +
      ltrBlock([
        'SQL Editor → run:',
        'supabase/migrations/19_registration_submissions_payload_limit.sql',
        '(raises payload limit to 5 MB in insert policy)',
      ])
    );
  }
  return (
    'تعذّر حفظ الطلب في قاعدة البيانات.\n\n' +
    ltrBlock([`Server message: ${message}`])
  );
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
  request: SubscriptionRequest
): Promise<{ ok: true } | { ok: false; error: string }> {
  const client = getSupabaseClient();
  if (!client) {
    return { ok: false, error: 'عميل Supabase غير متوفر رغم ظهور التهيئة.' };
  }

  const payload = payloadForInsert(request);
  const { error } = await client.from(TABLE).insert({
    id: request.id,
    payload,
  });

  if (error) {
    return { ok: false, error: error.message };
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
    Pick<SubscriptionRequest, 'status' | 'rejectionReason' | 'reviewedAt' | 'reviewedBy'>
  >
): Promise<{ ok: true } | { ok: false; error: string }> {
  const client = getSupabaseClient();
  if (!client) return { ok: false, error: 'Supabase غير مهيأ' };

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
