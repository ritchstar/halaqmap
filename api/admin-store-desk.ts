/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * مكتب طلبات متجر halaqmap — قائمة، اجتماع وكلاء، حفظ مسودة الرد.
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { verifyPlatformAdminFromRequestAny } from './_lib/adminManageBarbersAuth.js';
import { buildPublicApiCorsHeaders, publicApiOptionsResponse, rejectIfPublicApiCorsBlocked } from './_lib/publicApiCors.js';
import { STORE_SERVICE_REQUEST_TABLE } from './_lib/storeServiceRequest.js';
import {
  buildStoreDeskCouncilPrompt,
  extractLuxuryReplyDraft,
  type StoreDeskChatTurn,
  type StoreDeskRequestBrief,
} from './_lib/storeDeskCouncil.js';
import { callMarketingCouncilChat } from './_lib/marketingCouncilLab.js';

export const config = { maxDuration: 60 };

const MAX_ROWS = 120;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const STATUSES = new Set(['new', 'studying', 'offered', 'closed']);
const SELECT_FULL =
  'id, applicant_name, entity_name, freelance_work_doc, email_normalized, phone, whatsapp, request_body, source, created_at, status, reply_draft, council_transcript, admin_notes, updated_at';
const SELECT_BASE =
  'id, applicant_name, entity_name, freelance_work_doc, email_normalized, phone, whatsapp, request_body, source, created_at';

const CORS_OPTS = {
  allowMethods: 'GET, POST, OPTIONS',
  allowHeaders: 'Content-Type, Authorization, x-client-supabase-url, x-supabase-anon',
} as const;

function corsHeaders(request: Request): Record<string, string> {
  return buildPublicApiCorsHeaders(request, CORS_OPTS).headers;
}

export async function OPTIONS(request: Request): Promise<Response> {
  return publicApiOptionsResponse(request, CORS_OPTS);
}

function mapRow(row: Record<string, unknown>) {
  return {
    id: String(row.id ?? ''),
    applicantName: String(row.applicant_name ?? ''),
    entityName: row.entity_name ? String(row.entity_name) : '',
    freelanceWorkDoc: row.freelance_work_doc ? String(row.freelance_work_doc) : '',
    email: String(row.email_normalized ?? ''),
    phone: String(row.phone ?? ''),
    whatsapp: String(row.whatsapp ?? ''),
    requestBody: String(row.request_body ?? ''),
    source: row.source ? String(row.source) : '',
    createdAt: String(row.created_at ?? ''),
    status: String(row.status ?? 'new'),
    replyDraft: row.reply_draft ? String(row.reply_draft) : '',
    councilTranscript: row.council_transcript ? String(row.council_transcript) : '',
    adminNotes: row.admin_notes ? String(row.admin_notes) : '',
    updatedAt: row.updated_at ? String(row.updated_at) : '',
  };
}

function missingOpsColumns(message: string): boolean {
  return /status|reply_draft|council_transcript|admin_notes|updated_at|schema cache|does not exist/i.test(
    message || '',
  );
}

async function loadRows(supabase: SupabaseClient) {
  const full = await supabase
    .from(STORE_SERVICE_REQUEST_TABLE)
    .select(SELECT_FULL, { count: 'exact' })
    .order('created_at', { ascending: false })
    .limit(MAX_ROWS);

  if (!full.error) {
    const rows = (full.data as Record<string, unknown>[] | null)?.map(mapRow) ?? [];
    return {
      ok: true as const,
      tableMissing: false,
      hint: undefined as string | undefined,
      total: typeof full.count === 'number' ? full.count : rows.length,
      rows,
    };
  }

  if (/store_service_requests|does not exist|schema cache/i.test(full.error.message || '')) {
    return {
      ok: true as const,
      tableMissing: true,
      hint: 'Apply migration 163_store_service_requests.sql on Supabase.',
      total: 0,
      rows: [] as ReturnType<typeof mapRow>[],
    };
  }

  if (missingOpsColumns(full.error.message || '')) {
    const base = await supabase
      .from(STORE_SERVICE_REQUEST_TABLE)
      .select(SELECT_BASE, { count: 'exact' })
      .order('created_at', { ascending: false })
      .limit(MAX_ROWS);
    if (base.error) {
      return { ok: false as const, error: 'query_failed' };
    }
    const rows = (base.data as Record<string, unknown>[] | null)?.map(mapRow) ?? [];
    return {
      ok: true as const,
      tableMissing: false,
      hint: 'Apply migration 165_store_desk_ops.sql on Supabase.',
      total: typeof base.count === 'number' ? base.count : rows.length,
      rows,
    };
  }

  return { ok: false as const, error: 'query_failed' };
}

async function loadOne(supabase: SupabaseClient, id: string) {
  const full = await supabase.from(STORE_SERVICE_REQUEST_TABLE).select(SELECT_FULL).eq('id', id).maybeSingle();
  if (!full.error) return full.data as Record<string, unknown> | null;
  if (!missingOpsColumns(full.error.message || '')) return null;
  const base = await supabase.from(STORE_SERVICE_REQUEST_TABLE).select(SELECT_BASE).eq('id', id).maybeSingle();
  if (base.error) return null;
  return base.data as Record<string, unknown> | null;
}

function parseHistory(raw: unknown): StoreDeskChatTurn[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => {
      if (!item || typeof item !== 'object') return null;
      const o = item as Record<string, unknown>;
      const role = o.role === 'assistant' ? 'assistant' : o.role === 'user' ? 'user' : null;
      const content = String(o.content || '').trim();
      if (!role || !content) return null;
      return { role, content: content.slice(0, 8000) };
    })
    .filter((x): x is StoreDeskChatTurn => x !== null)
    .slice(-10);
}

function briefFromRow(row: Record<string, unknown>): StoreDeskRequestBrief {
  return {
    applicantName: String(row.applicant_name ?? ''),
    entityName: row.entity_name ? String(row.entity_name) : '',
    freelanceWorkDoc: row.freelance_work_doc ? String(row.freelance_work_doc) : '',
    email: String(row.email_normalized ?? ''),
    phone: String(row.phone ?? ''),
    whatsapp: String(row.whatsapp ?? ''),
    requestBody: String(row.request_body ?? ''),
    source: row.source ? String(row.source) : '',
  };
}

async function authorize(request: Request, write: boolean) {
  const serverUrl = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').trim();
  const serviceRole = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  if (!serverUrl || !serviceRole) {
    return { ok: false as const, status: 503, json: { error: 'server_misconfigured' } };
  }
  const caps = write
    ? (['review_requests', 'manage_barbers', 'view_overview'] as const)
    : (['view_overview', 'view_requests', 'review_requests', 'view_partner_marketing'] as const);
  const auth = await verifyPlatformAdminFromRequestAny(request, serverUrl, serviceRole, [...caps]);
  if (auth.ok === false) return { ok: false as const, status: auth.status, json: auth.json };
  const supabase = createClient(serverUrl, serviceRole, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return { ok: true as const, supabase };
}

export async function GET(request: Request): Promise<Response> {
  const blocked = rejectIfPublicApiCorsBlocked(request, CORS_OPTS);
  if (blocked) return blocked;
  const headers = corsHeaders(request);
  const auth = await authorize(request, false);
  if (auth.ok === false) return Response.json(auth.json, { status: auth.status, headers });

  const snapshot = await loadRows(auth.supabase);
  if (snapshot.ok === false) {
    return Response.json(snapshot, { status: 500, headers });
  }
  return Response.json(
    {
      ...snapshot,
      openaiConfigured: Boolean((process.env.OPENAI_API_KEY || '').trim()),
    },
    { headers },
  );
}

export async function POST(request: Request): Promise<Response> {
  const blocked = rejectIfPublicApiCorsBlocked(request, CORS_OPTS);
  if (blocked) return blocked;
  const headers = corsHeaders(request);
  const auth = await authorize(request, true);
  if (auth.ok === false) return Response.json(auth.json, { status: auth.status, headers });

  let body: Record<string, unknown> = {};
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return Response.json({ error: 'invalid_json' }, { status: 400, headers });
  }

  const action = String(body.action ?? '').trim();
  const id = String(body.requestId ?? '').trim();
  if (!UUID_RE.test(id)) {
    return Response.json({ error: 'معرّف الطلب غير صالح' }, { status: 400, headers });
  }

  const row = await loadOne(auth.supabase, id);
  if (!row) {
    return Response.json({ error: 'الطلب غير موجود' }, { status: 404, headers });
  }

  if (action === 'save') {
    const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (typeof body.replyDraft === 'string') patch.reply_draft = body.replyDraft.trim().slice(0, 4000);
    if (typeof body.adminNotes === 'string') patch.admin_notes = body.adminNotes.trim().slice(0, 4000);
    if (typeof body.status === 'string' && STATUSES.has(body.status)) patch.status = body.status;
    const updated = await auth.supabase.from(STORE_SERVICE_REQUEST_TABLE).update(patch).eq('id', id);
    if (updated.error && missingOpsColumns(updated.error.message || '')) {
      return Response.json(
        { ok: false, error: 'apply_migration_165', hint: 'Apply migration 165_store_desk_ops.sql on Supabase.' },
        { status: 409, headers },
      );
    }
    if (updated.error) {
      return Response.json({ ok: false, error: 'save_failed' }, { status: 500, headers });
    }
    const next = await loadOne(auth.supabase, id);
    return Response.json({ ok: true, row: next ? mapRow(next) : mapRow(row) }, { headers });
  }

  if (action !== 'council') {
    return Response.json({ error: 'إجراء غير معروف' }, { status: 400, headers });
  }

  const userMessage =
    String(body.userMessage || '').trim() ||
    'اعقدوا اجتماع المكتب الآن حول هذا الطلب، وقدّموا الفرضيات ومسودة الرد للعميل.';
  const history = parseHistory(body.conversationHistory);
  const system = buildStoreDeskCouncilPrompt(briefFromRow(row));

  try {
    const transcript = await callMarketingCouncilChat({
      system,
      userText: userMessage.slice(0, 4000),
      conversationHistory: history,
    });
    const draft = extractLuxuryReplyDraft(transcript);
    const patch: Record<string, unknown> = {
      council_transcript: transcript.slice(0, 12000),
      updated_at: new Date().toISOString(),
    };
    if (draft) patch.reply_draft = draft;
    if (String(row.status ?? 'new') === 'new') patch.status = 'studying';
    const saved = await auth.supabase.from(STORE_SERVICE_REQUEST_TABLE).update(patch).eq('id', id);
    if (saved.error && !missingOpsColumns(saved.error.message || '')) {
      return Response.json({ ok: false, error: 'save_council_failed' }, { status: 500, headers });
    }
    return Response.json(
      {
        ok: true,
        transcript,
        replyDraft: draft,
        row: mapRow({ ...row, ...patch }),
      },
      { headers },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'تعذّر اجتماع الوكلاء';
    return Response.json({ ok: false, error: message }, { status: 502, headers });
  }
}
