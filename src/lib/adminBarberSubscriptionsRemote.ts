import { getSupabaseClient } from '@/integrations/supabase/client';
import { SubscriptionTier } from '@/lib/index';

export type BarberSubscriptionAdminRow = {
  id: string;
  moyasar_payment_id: string;
  registration_request_id: string | null;
  barber_id: string | null;
  tier: SubscriptionTier | string | null;
  amount_halalas: number | string | null;
  currency: string;
  status: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

function resolveApiEndpoint(): string {
  const explicit = String(import.meta.env.VITE_ADMIN_BARBER_SUBSCRIPTION_ACTION_URL || '').trim();
  if (explicit) return explicit;
  const base = String(
    import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || import.meta.env.VITE_REGISTRATION_API_ORIGIN || '',
  )
    .trim()
    .replace(/\/$/, '');
  if (base) return `${base}/api/admin-barber-subscription-action`;
  return '/api/admin-barber-subscription-action';
}

export async function fetchBarberSubscriptionsForAdmin(): Promise<BarberSubscriptionAdminRow[]> {
  const client = getSupabaseClient();
  if (!client) return [];
  const { data, error } = await client
    .from('barber_subscriptions')
    .select(
      'id,moyasar_payment_id,registration_request_id,barber_id,tier,amount_halalas,currency,status,metadata,created_at,updated_at',
    )
    .in('status', [
      'paid',
      'pending_review',
      'approved',
      'refunded',
      'pending',
      'failed',
      'cancelled',
      'authorized',
      'voided',
    ])
    .order('created_at', { ascending: false })
    .limit(100);
  if (error || !data) {
    if (import.meta.env.DEV) console.warn('[halaqmap] fetchBarberSubscriptionsForAdmin:', error?.message);
    return [];
  }
  return data as BarberSubscriptionAdminRow[];
}

export type AdminBarberSubscriptionAction =
  | { ok: true; action: string; barberId?: string; barberEmail?: string; barberName?: string; registrationOrderId?: string | null; tier?: string }
  | { ok: false; error: string; detail?: string; status?: number };

async function authHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const supabaseUrl = String(import.meta.env.VITE_SUPABASE_URL || '').trim();
  if (supabaseUrl) headers['x-client-supabase-url'] = supabaseUrl;
  const client = getSupabaseClient();
  const token = (await client?.auth.getSession())?.data.session?.access_token?.trim();
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

export async function postAdminBarberSubscriptionAction(input: {
  action: 'approve' | 'notes' | 'refund';
  rowId: string;
  notes?: string;
}): Promise<AdminBarberSubscriptionAction> {
  try {
    const res = await fetch(resolveApiEndpoint(), {
      method: 'POST',
      headers: await authHeaders(),
      body: JSON.stringify({
        action: input.action,
        rowId: input.rowId,
        ...(input.action === 'notes' && input.notes ? { notes: input.notes } : {}),
      }),
    });
    const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
    if (!res.ok) {
      return {
        ok: false,
        error: String(data.error || 'request_failed'),
        detail: data.detail != null ? String(data.detail) : undefined,
        status: res.status,
      };
    }
    if (data.ok !== true) {
      return { ok: false, error: String(data.error || 'unknown') };
    }
    return {
      ok: true,
      action: String(data.action || input.action),
      barberId: data.barberId != null ? String(data.barberId) : undefined,
      barberEmail: data.barberEmail != null ? String(data.barberEmail) : undefined,
      barberName: data.barberName != null ? String(data.barberName) : undefined,
      registrationOrderId:
        data.registrationOrderId != null ? (data.registrationOrderId as string | null) : undefined,
      tier: data.tier != null ? String(data.tier) : undefined,
    };
  } catch {
    return { ok: false, error: 'network' };
  }
}
