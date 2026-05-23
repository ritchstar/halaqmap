import { getSupabaseClient } from '@/integrations/supabase/client';

const API = '/api/admin-financial-archive';

function getClientSupabaseUrl(): string {
  return String(import.meta.env.VITE_SUPABASE_URL || '').trim();
}

async function authHeadersJson(): Promise<Record<string, string> | null> {
  const client = getSupabaseClient();
  const token = (await client?.auth.getSession())?.data.session?.access_token?.trim();
  if (!token) return null;
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
    'x-client-supabase-url': getClientSupabaseUrl(),
  };
}

async function authHeadersMultipart(): Promise<Record<string, string> | null> {
  const client = getSupabaseClient();
  const token = (await client?.auth.getSession())?.data.session?.access_token?.trim();
  if (!token) return null;
  return {
    Authorization: `Bearer ${token}`,
    'x-client-supabase-url': getClientSupabaseUrl(),
  };
}

function formatErr(json: Record<string, unknown>, status: number): string {
  const err = typeof json.error === 'string' ? json.error : `HTTP ${status}`;
  const hint = typeof json.hint === 'string' ? json.hint : '';
  return hint ? `${err} — ${hint}` : err;
}

export type AdminFinancialDocumentRow = {
  id: string;
  storage_bucket: string;
  storage_object_path: string;
  original_filename: string;
  content_type: string;
  file_size_bytes: number;
  file_sha256: string | null;
  archive_label: string;
  invoice_number: string | null;
  vendor: string;
  service_period_start: string | null;
  service_period_end: string | null;
  invoice_date: string | null;
  amount: number | null;
  currency: string;
  commitment_id: string | null;
  sync_applied_at: string | null;
  notes: string | null;
  uploaded_by_email: string;
  uploaded_at: string;
};

export async function fetchAdminFinancialArchive(): Promise<
  { ok: true; documents: AdminFinancialDocumentRow[] } | { ok: false; error: string }
> {
  const h = await authHeadersJson();
  if (!h) return { ok: false, error: 'سجّل دخول كمشرف أولاً.' };
  const res = await fetch(API, { method: 'GET', headers: h });
  const json = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok || json.ok !== true) {
    return { ok: false, error: formatErr(json, res.status) };
  }
  const documents = (json.documents as AdminFinancialDocumentRow[]) || [];
  return { ok: true, documents };
}

export async function requestAdminFinancialArchiveDownloadUrl(
  documentId: string
): Promise<{ ok: true; signedUrl: string } | { ok: false; error: string }> {
  const h = await authHeadersJson();
  if (!h) return { ok: false, error: 'سجّل دخول كمشرف أولاً.' };
  const res = await fetch(`${API}?download=${encodeURIComponent(documentId)}`, { method: 'GET', headers: h });
  const json = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok || json.ok !== true || typeof json.signedUrl !== 'string') {
    return { ok: false, error: formatErr(json, res.status) };
  }
  return { ok: true, signedUrl: json.signedUrl };
}

export type AdminFinancialArchiveUploadMeta = {
  archive_label: string;
  invoice_number?: string | null;
  vendor: string;
  service_period_start?: string | null;
  service_period_end?: string | null;
  invoice_date?: string | null;
  amount?: number | null;
  currency?: string | null;
  notes?: string | null;
  commitment_id?: string | null;
  sync_commitment?: boolean;
  commitment_next_renewal_at?: string | null;
  commitment_monthly_estimate_sar?: number | null;
};

export async function uploadAdminFinancialArchiveDocument(
  file: File,
  meta: AdminFinancialArchiveUploadMeta
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const h = await authHeadersMultipart();
  if (!h) return { ok: false, error: 'سجّل دخول كمشرف أولاً.' };
  const fd = new FormData();
  fd.set('file', file);
  fd.set('meta', JSON.stringify(meta));
  const res = await fetch(API, { method: 'POST', headers: h, body: fd });
  const json = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok || json.ok !== true || typeof json.id !== 'string') {
    return { ok: false, error: formatErr(json, res.status) };
  }
  return { ok: true, id: json.id };
}

export async function deleteAdminFinancialArchiveDocument(
  id: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const h = await authHeadersMultipart();
  if (!h) return { ok: false, error: 'سجّل دخول كمشرف أولاً.' };
  const fd = new FormData();
  fd.set('action', 'delete');
  fd.set('id', id);
  const res = await fetch(API, { method: 'POST', headers: h, body: fd });
  const json = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok || json.ok !== true) {
    return { ok: false, error: formatErr(json, res.status) };
  }
  return { ok: true };
}
