import type { SubscriptionRequest } from '@/lib/index';
import { getSupabaseClient } from '@/integrations/supabase/client';

const TABLE = 'registration_submissions';

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
  if (!client) return { ok: true };

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
