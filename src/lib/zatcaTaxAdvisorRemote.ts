import { getSupabaseClient } from '@/integrations/supabase/client';
import type { ZatcaTaxAdvisorSnapshot } from '@/types/zatcaTaxAdvisor';

async function authHeaders(): Promise<Record<string, string>> {
  const supabase = getSupabaseClient();
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error('يجب تسجيل الدخول كمشرف');
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}

export async function fetchZatcaTaxAdvisorStateRemote(): Promise<ZatcaTaxAdvisorSnapshot> {
  const headers = await authHeaders();
  const res = await fetch('/api/admin-zatca-tax-advisor', { method: 'GET', headers });
  const json = (await res.json().catch(() => ({}))) as {
    ok?: boolean;
    state?: ZatcaTaxAdvisorSnapshot['state'];
    error?: string;
  };
  if (!res.ok) throw new Error(json.error || `HTTP ${res.status}`);
  return { state: json.state ?? null, warnings: json.state?.active_warnings ?? [] };
}

export async function runZatcaTaxRadarRemote(): Promise<ZatcaTaxAdvisorSnapshot> {
  const headers = await authHeaders();
  const res = await fetch('/api/admin-zatca-tax-advisor?run=1', { method: 'GET', headers });
  const json = (await res.json().catch(() => ({}))) as {
    ok?: boolean;
    state?: ZatcaTaxAdvisorSnapshot['state'];
    warnings?: ZatcaTaxAdvisorSnapshot['warnings'];
    analytics?: ZatcaTaxAdvisorSnapshot['analytics'];
    error?: string;
  };
  if (!res.ok) throw new Error(json.error || `HTTP ${res.status}`);
  return {
    state: json.state ?? null,
    warnings: json.warnings ?? json.state?.active_warnings ?? [],
    analytics: json.analytics,
  };
}

export async function activateZatcaTaxLiveRemote(): Promise<{
  vatRatePercent: number;
  uiVatSettings: { enabled: boolean; ratePercent: number };
}> {
  const headers = await authHeaders();
  const res = await fetch('/api/admin-zatca-tax-advisor', {
    method: 'POST',
    headers,
    body: JSON.stringify({ action: 'activate_tax_live' }),
  });
  const json = (await res.json().catch(() => ({}))) as {
    ok?: boolean;
    uiVatSettings?: { enabled: boolean; ratePercent: number };
    vatRatePercent?: number;
    error?: string;
  };
  if (!res.ok) throw new Error(json.error || `HTTP ${res.status}`);
  return {
    vatRatePercent: json.vatRatePercent ?? 15,
    uiVatSettings: json.uiVatSettings ?? { enabled: true, ratePercent: 15 },
  };
}
