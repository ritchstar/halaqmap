import { getSupabaseClient } from '@/integrations/supabase/client';
import type { ScannedPartnerLead } from '@/lib/partnerProspectScanTypes';

const ROUTE = '/api/admin-partner-prospects-scan';

async function authHeaders(): Promise<Record<string, string> | null> {
  const client = getSupabaseClient();
  const token = (await client?.auth.getSession())?.data.session?.access_token?.trim();
  if (!token) return null;
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

export async function scanPartnerProspectImage(
  imageBase64: string,
  imageMime: string,
): Promise<{ ok: true; leads: ScannedPartnerLead[] } | { ok: false; error: string }> {
  const h = await authHeaders();
  if (!h) return { ok: false, error: 'سجّل دخول كمشرف' };

  const res = await fetch(ROUTE, {
    method: 'POST',
    headers: h,
    body: JSON.stringify({ imageBase64, imageMime }),
  });
  const json = (await res.json().catch(() => ({}))) as {
    ok?: boolean;
    leads?: ScannedPartnerLead[];
    error?: string;
  };
  if (!res.ok || json.ok !== true) {
    return { ok: false, error: String(json.error || `HTTP ${res.status}`) };
  }
  return { ok: true, leads: Array.isArray(json.leads) ? json.leads : [] };
}

export async function fileToScanPayload(file: File): Promise<{ base64: string; mime: string }> {
  const buf = await file.arrayBuffer();
  const bytes = new Uint8Array(buf);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]!);
  return { base64: btoa(binary), mime: file.type || 'image/jpeg' };
}
