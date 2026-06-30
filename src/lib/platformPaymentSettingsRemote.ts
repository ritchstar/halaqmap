import { getSupabaseClient } from '@/integrations/supabase/client';

const API = '/api/platform-payment-settings';

function getClientSupabaseUrl(): string {
  return String(import.meta.env.VITE_SUPABASE_URL || '').trim();
}

export type PlatformPaymentSettingsPayload = {
  preferred_gateway: 'MOYASAR' | 'SAB';
  display_payment_mode: 'test' | 'live';
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

export type PlatformPaymentMonitoring = {
  securityEventsLast7d: number;
  securityBySeverity: Record<string, number>;
  securityByTypeTop: { event_type: string; count: number }[];
  subscriptionsByStatus: Record<string, number>;
};

export type PlatformPaymentServerReadiness = {
  paymentEnv: 'test' | 'live';
  sabOppwaConfigured: boolean;
  moyasarPublishableKeySet: boolean;
};

async function authHeaders(): Promise<Record<string, string> | null> {
  const client = getSupabaseClient();
  const token = (await client?.auth.getSession())?.data.session?.access_token?.trim();
  if (!token) return null;
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
    'x-client-supabase-url': getClientSupabaseUrl(),
  };
}

export async function fetchPlatformPaymentSettingsAdmin(): Promise<
  | {
      ok: true;
      settings: PlatformPaymentSettingsPayload;
      monitoring: PlatformPaymentMonitoring;
      serverReadiness: PlatformPaymentServerReadiness | null;
    }
  | { ok: false; error: string }
> {
  const h = await authHeaders();
  if (!h) return { ok: false, error: 'غير مسجّل' };
  const res = await fetch(API, { method: 'GET', headers: h });
  const json = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok || json.ok !== true) {
    return { ok: false, error: typeof json.error === 'string' ? json.error : `HTTP ${res.status}` };
  }
  const settings = json.settings as PlatformPaymentSettingsPayload;
  const monitoring = json.monitoring as PlatformPaymentMonitoring;
  const serverReadiness = (json.serverReadiness as PlatformPaymentServerReadiness | undefined) ?? null;
  if (!settings || !monitoring) return { ok: false, error: 'استجابة غير صالحة' };
  return { ok: true, settings, monitoring, serverReadiness };
}

export async function savePlatformPaymentSettingsAdmin(
  patch: Partial<PlatformPaymentSettingsPayload>,
): Promise<{ ok: true; settings: PlatformPaymentSettingsPayload } | { ok: false; error: string }> {
  const h = await authHeaders();
  if (!h) return { ok: false, error: 'غير مسجّل' };
  const res = await fetch(API, {
    method: 'POST',
    headers: h,
    body: JSON.stringify(patch),
  });
  const json = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok || json.ok !== true) {
    return { ok: false, error: typeof json.error === 'string' ? json.error : `HTTP ${res.status}` };
  }
  const settings = json.settings as PlatformPaymentSettingsPayload;
  if (!settings) return { ok: false, error: 'استجابة غير صالحة' };
  return { ok: true, settings };
}
