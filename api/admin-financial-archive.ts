import { createHash } from 'node:crypto';
import {
  safeHost,
  verifyPlatformAdminFromRequestAny,
} from './_lib/adminManageBarbersAuth.js';
import { buildPublicApiCorsHeaders, publicApiOptionsResponse, rejectIfPublicApiCorsBlocked } from './_lib/publicApiCors.js';
import { isLikelyHttpUrl, normalizeSupabaseUrl } from './_lib/supabaseUrl.js';

export const config = {
  maxDuration: 60,
};

const BUCKET = 'admin-financial-archive';

const CORS_OPTS = {
  allowMethods: 'GET, POST, OPTIONS',
  allowHeaders: 'Content-Type, Authorization, x-client-supabase-url',
} as const;

const VENDORS = new Set([
  'vercel',
  'supabase_mgmt',
  'github',
  'godaddy',
  'manual',
  'openai',
  'resend',
  'other',
]);

const ALLOWED_UPLOAD_MIME = new Set(['application/pdf', 'image/png', 'image/jpeg', 'image/webp']);

const MAX_BYTES = 15 * 1024 * 1024;

function corsHeaders(request: Request): Record<string, string> {
  return buildPublicApiCorsHeaders(request, CORS_OPTS).headers;
}

function json(data: unknown, status = 200, request: Request): Response {
  return Response.json(data, {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'private, no-store, max-age=0, must-revalidate',
      ...corsHeaders(request),
    },
  });
}

function getServiceEnv(): { url: string; serviceRole: string } | null {
  const url = normalizeSupabaseUrl(process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL);
  const serviceRole = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  if (!url || !isLikelyHttpUrl(url) || !serviceRole) return null;
  return { url, serviceRole };
}

function sanitizeFilename(name: string): string {
  const base = name.trim().slice(0, 180) || 'document';
  return base.replace(/[^a-zA-Z0-9._-]+/g, '_');
}

export async function OPTIONS(request: Request): Promise<Response> {
  return publicApiOptionsResponse(request, CORS_OPTS);
}

export async function GET(request: Request): Promise<Response> {
  const blocked = rejectIfPublicApiCorsBlocked(request, CORS_OPTS);
  if (blocked) return blocked;

  const env = getServiceEnv();
  if (!env) {
    return json({ error: 'Server not configured' }, 503, request);
  }

  const gate = await verifyPlatformAdminFromRequestAny(request, env.url, env.serviceRole, [
    'view_admin_financial_archive',
    'manage_admin_financial_archive',
    'manage_centralized_billing_ops',
  ]);
  if (gate.ok === false) {
    return json(gate.json, gate.status, request);
  }

  const supabase = gate.supabase;
  const urlObj = new URL(request.url);
  const downloadId = (urlObj.searchParams.get('download') || '').trim();

  if (downloadId) {
    const { data: row, error: rErr } = await supabase
      .from('platform_admin_financial_documents')
      .select('id, storage_bucket, storage_object_path')
      .eq('id', downloadId)
      .maybeSingle();
    if (rErr || !row) {
      return json({ error: rErr?.message || 'Not found' }, 404, request);
    }
    const bucket = typeof row.storage_bucket === 'string' ? row.storage_bucket : BUCKET;
    const path = typeof row.storage_object_path === 'string' ? row.storage_object_path : '';
    if (!path) return json({ error: 'Invalid row' }, 500, request);
    const { data: signed, error: sErr } = await supabase.storage.from(bucket).createSignedUrl(path, 120);
    if (sErr || !signed?.signedUrl) {
      return json({ error: sErr?.message || 'Could not sign URL' }, 500, request);
    }
    return json({ ok: true, signedUrl: signed.signedUrl, expiresIn: 120 }, 200, request);
  }

  const { data: rows, error } = await supabase
    .from('platform_admin_financial_documents')
    .select('*')
    .order('uploaded_at', { ascending: false })
    .limit(200);

  if (error) {
    return json({ error: error.message }, 500, request);
  }
  return json({ ok: true, route: 'admin-financial-archive', documents: rows || [] }, 200, request);
}

type UploadMeta = {
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

export async function POST(request: Request): Promise<Response> {
  const blocked = rejectIfPublicApiCorsBlocked(request, CORS_OPTS);
  if (blocked) return blocked;

  const env = getServiceEnv();
  if (!env) {
    return json({ error: 'Server not configured' }, 503, request);
  }

  const ct = (request.headers.get('content-type') || '').toLowerCase();
  if (!ct.includes('multipart/form-data')) {
    return json({ error: 'Expected multipart/form-data' }, 400, request);
  }

  const gate = await verifyPlatformAdminFromRequestAny(request, env.url, env.serviceRole, [
    'manage_admin_financial_archive',
    'manage_centralized_billing_ops',
  ]);
  if (gate.ok === false) {
    return json(gate.json, gate.status, request);
  }

  const supabase = gate.supabase;
  const actorEmail = gate.actorEmail;

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return json({ error: 'Invalid multipart body' }, 400, request);
  }

  const action = String(form.get('action') || 'upload').trim();

  if (action === 'delete') {
    const id = String(form.get('id') || '').trim();
    if (!id) return json({ error: 'id required' }, 400, request);
    const { data: row, error: rErr } = await supabase
      .from('platform_admin_financial_documents')
      .select('id, storage_bucket, storage_object_path')
      .eq('id', id)
      .maybeSingle();
    if (rErr || !row) return json({ error: rErr?.message || 'Not found' }, 404, request);
    const bucket = typeof row.storage_bucket === 'string' ? row.storage_bucket : BUCKET;
    const path = typeof row.storage_object_path === 'string' ? row.storage_object_path : '';
    await supabase.storage.from(bucket).remove([path]);
    const { error: dErr } = await supabase.from('platform_admin_financial_documents').delete().eq('id', id);
    if (dErr) return json({ error: dErr.message }, 500, request);
    return json({ ok: true, deleted: id }, 200, request);
  }

  const file = form.get('file');
  if (!(file instanceof File)) {
    return json({ error: 'file field required (PDF or image)' }, 400, request);
  }

  const metaRaw = String(form.get('meta') || '').trim();
  let meta: UploadMeta;
  try {
    meta = metaRaw ? (JSON.parse(metaRaw) as UploadMeta) : ({} as UploadMeta);
  } catch {
    return json({ error: 'meta must be valid JSON' }, 400, request);
  }

  const archiveLabel = String(meta.archive_label || '').trim();
  if (!archiveLabel) {
    return json({ error: 'archive_label required in meta' }, 400, request);
  }

  const vendor = String(meta.vendor || '').trim().toLowerCase();
  if (!VENDORS.has(vendor)) {
    return json({ error: `Invalid vendor — allowed: ${[...VENDORS].join(', ')}` }, 400, request);
  }

  const mime = (file.type || 'application/octet-stream').toLowerCase();
  if (!ALLOWED_UPLOAD_MIME.has(mime)) {
    return json({ error: 'Unsupported file type' }, 400, request);
  }

  const buf = Buffer.from(await file.arrayBuffer());
  if (buf.length > MAX_BYTES) {
    return json({ error: `File too large (max ${MAX_BYTES} bytes)` }, 400, request);
  }

  const sha256 = createHash('sha256').update(buf).digest('hex');
  const year = new Date().getUTCFullYear();
  const objectPath = `${year}/${crypto.randomUUID()}_${sanitizeFilename(file.name)}`;

  const { error: upErr } = await supabase.storage.from(BUCKET).upload(objectPath, buf, {
    contentType: mime,
    upsert: false,
  });
  if (upErr) {
    return json({ error: upErr.message }, 500, request);
  }

  const currency = String(meta.currency || 'USD').trim().slice(0, 8) || 'USD';
  const invoiceNumber = meta.invoice_number != null ? String(meta.invoice_number).trim().slice(0, 120) : null;
  const notes = meta.notes != null ? String(meta.notes).trim().slice(0, 2000) : null;

  const insertRow = {
    storage_bucket: BUCKET,
    storage_object_path: objectPath,
    original_filename: file.name.slice(0, 500),
    content_type: mime,
    file_size_bytes: buf.length,
    file_sha256: sha256,
    archive_label: archiveLabel.slice(0, 500),
    invoice_number: invoiceNumber,
    vendor,
    service_period_start: meta.service_period_start || null,
    service_period_end: meta.service_period_end || null,
    invoice_date: meta.invoice_date || null,
    amount: meta.amount != null && Number.isFinite(Number(meta.amount)) ? Number(meta.amount) : null,
    currency,
    commitment_id: meta.commitment_id && String(meta.commitment_id).trim() ? String(meta.commitment_id).trim() : null,
    notes,
    uploaded_by_email: actorEmail,
  };

  const { data: inserted, error: insErr } = await supabase
    .from('platform_admin_financial_documents')
    .insert(insertRow)
    .select('id')
    .maybeSingle();

  if (insErr || !inserted?.id) {
    await supabase.storage.from(BUCKET).remove([objectPath]);
    return json({ error: insErr?.message || 'Insert failed' }, 500, request);
  }

  const docId = String(inserted.id);

  if (meta.sync_commitment === true && meta.commitment_id && String(meta.commitment_id).trim()) {
    const cid = String(meta.commitment_id).trim();
    const { data: com, error: cErr } = await supabase
      .from('platform_ops_billing_commitments')
      .select('id')
      .eq('id', cid)
      .maybeSingle();
    if (cErr || !com) {
      await supabase.from('platform_admin_financial_documents').delete().eq('id', docId);
      await supabase.storage.from(BUCKET).remove([objectPath]);
      return json({ error: cErr?.message || 'commitment_id not found' }, 400, request);
    }

    const patch: Record<string, unknown> = {
      last_synced_at: new Date().toISOString(),
      last_sync_status: 'ok',
      data_gap_kind: null,
      data_gap_message: null,
    };

    const nr = meta.commitment_next_renewal_at != null ? String(meta.commitment_next_renewal_at).trim() : '';
    if (nr) patch.next_renewal_at = nr;

    const ms = meta.commitment_monthly_estimate_sar;
    if (ms != null && Number.isFinite(Number(ms))) {
      patch.monthly_estimate_sar = Number(ms);
    } else if (meta.amount != null && Number.isFinite(Number(meta.amount)) && currency.toUpperCase() === 'SAR') {
      patch.monthly_estimate_sar = Number(meta.amount);
    }

    if (meta.service_period_end) {
      const d = String(meta.service_period_end).trim();
      if (d && !nr) {
        patch.next_renewal_at = `${d}T23:59:59.000Z`;
      }
    }

    const { error: uErr } = await supabase.from('platform_ops_billing_commitments').update(patch).eq('id', cid);
    if (uErr) {
      await supabase.from('platform_admin_financial_documents').delete().eq('id', docId);
      await supabase.storage.from(BUCKET).remove([objectPath]);
      return json({ error: uErr.message }, 500, request);
    }

    await supabase
      .from('platform_admin_financial_documents')
      .update({ sync_applied_at: new Date().toISOString() })
      .eq('id', docId);
  }

  return json(
    {
      ok: true,
      id: docId,
      storage_object_path: objectPath,
      supabaseUrlHost: safeHost(env.url),
    },
    200,
    request
  );
}
