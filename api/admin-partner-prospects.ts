import { verifyPlatformAdminFromRequestAny } from './_lib/adminManageBarbersAuth.js';
import { buildPublicApiCorsHeaders, publicApiOptionsResponse, rejectIfPublicApiCorsBlocked } from './_lib/publicApiCors.js';
import { isLikelyHttpUrl, normalizeSupabaseUrl } from './_lib/supabaseUrl.js';

export const config = { maxDuration: 30 };

const CORS_OPTS = {
  allowMethods: 'GET, POST, PATCH, OPTIONS',
  allowHeaders: 'Content-Type, Authorization, x-client-supabase-url',
} as const;

const TIER_FIT = new Set(['bronze', 'gold', 'diamond', 'mixed']);
const CHANNELS = new Set(['whatsapp', 'instagram', 'email', 'website', 'phone']);
const STATUSES = new Set(['new', 'contacted', 'waiting', 'won', 'lost']);
const SOURCES = new Set(['manual', 'seed', 'b2b_strategist', 'import']);

type TierFit = 'bronze' | 'gold' | 'diamond' | 'mixed';
type Channel = 'whatsapp' | 'instagram' | 'email' | 'website' | 'phone';
type Status = 'new' | 'contacted' | 'waiting' | 'won' | 'lost';
type Source = 'manual' | 'seed' | 'b2b_strategist' | 'import';

function corsHeaders(request: Request): Record<string, string> {
  return buildPublicApiCorsHeaders(request, CORS_OPTS).headers;
}

function json(data: unknown, status: number, request: Request): Response {
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

function trimOrNull(v: unknown, max = 500): string | null {
  if (typeof v !== 'string') return null;
  const t = v.trim();
  if (!t) return null;
  return t.slice(0, max);
}

function mapRow(row: Record<string, unknown>) {
  return {
    id: String(row.id),
    legacyId: typeof row.legacy_id === 'string' ? row.legacy_id : null,
    name: String(row.name ?? ''),
    city: String(row.city ?? ''),
    region: String(row.region ?? ''),
    address: typeof row.address === 'string' ? row.address : null,
    tierFit: (row.tier_fit as TierFit) ?? 'gold',
    channel: (row.channel as Channel) ?? 'whatsapp',
    phone: typeof row.phone === 'string' ? row.phone : null,
    email: typeof row.email === 'string' ? row.email : null,
    instagram: typeof row.instagram === 'string' ? row.instagram : null,
    website: typeof row.website === 'string' ? row.website : null,
    status: (row.status as Status) ?? 'new',
    assignedTo: typeof row.assigned_to === 'string' ? row.assigned_to : null,
    notes: typeof row.notes === 'string' ? row.notes : null,
    lastContactAt: row.last_contact_at ? String(row.last_contact_at) : null,
    followUpDate: row.follow_up_date ? String(row.follow_up_date).slice(0, 10) : null,
    suggestedPitch: typeof row.suggested_pitch === 'string' ? row.suggested_pitch : null,
    source: (row.source as Source) ?? 'manual',
    sourceMeta:
      row.source_meta && typeof row.source_meta === 'object'
        ? (row.source_meta as Record<string, unknown>)
        : {},
    createdByEmail: typeof row.created_by_email === 'string' ? row.created_by_email : null,
    createdAt: row.created_at ? String(row.created_at) : null,
    updatedAt: row.updated_at ? String(row.updated_at) : null,
  };
}

function parseCreateBody(body: Record<string, unknown>) {
  const name = trimOrNull(body.name, 200);
  const city = trimOrNull(body.city, 120);
  const region = trimOrNull(body.region, 120);
  if (!name || !city || !region) {
    return { ok: false as const, error: 'الاسم والمدينة والمنطقة مطلوبة' };
  }

  const tierFitRaw = trimOrNull(body.tierFit ?? body.tier_fit, 20) ?? 'gold';
  const channelRaw = trimOrNull(body.channel, 20) ?? 'whatsapp';
  const sourceRaw = trimOrNull(body.source, 30) ?? 'manual';

  const tierFit = TIER_FIT.has(tierFitRaw) ? (tierFitRaw as TierFit) : 'gold';
  const channel = CHANNELS.has(channelRaw) ? (channelRaw as Channel) : 'whatsapp';
  const source = SOURCES.has(sourceRaw) ? (sourceRaw as Source) : 'manual';

  return {
    ok: true as const,
    row: {
      name,
      city,
      region,
      address: trimOrNull(body.address, 400),
      tier_fit: tierFit,
      channel,
      phone: trimOrNull(body.phone, 40),
      email: trimOrNull(body.email, 254),
      instagram: trimOrNull(body.instagram, 120),
      website: trimOrNull(body.website, 400),
      suggested_pitch: trimOrNull(body.suggestedPitch ?? body.suggested_pitch, 4000),
      source,
      source_meta:
        body.sourceMeta && typeof body.sourceMeta === 'object'
          ? body.sourceMeta
          : body.source_meta && typeof body.source_meta === 'object'
            ? body.source_meta
            : {},
      status: 'new' as Status,
    },
  };
}

function parsePatchBody(body: Record<string, unknown>) {
  const patch: Record<string, unknown> = {};

  if ('name' in body) {
    const name = trimOrNull(body.name, 200);
    if (!name) return { ok: false as const, error: 'الاسم لا يمكن أن يكون فارغاً' };
    patch.name = name;
  }
  if ('city' in body) {
    const city = trimOrNull(body.city, 120);
    if (!city) return { ok: false as const, error: 'المدينة لا يمكن أن تكون فارغة' };
    patch.city = city;
  }
  if ('region' in body) {
    const region = trimOrNull(body.region, 120);
    if (!region) return { ok: false as const, error: 'المنطقة لا يمكن أن تكون فارغة' };
    patch.region = region;
  }
  if ('address' in body) patch.address = trimOrNull(body.address, 400);
  if ('tierFit' in body || 'tier_fit' in body) {
    const v = trimOrNull(body.tierFit ?? body.tier_fit, 20);
    if (v && TIER_FIT.has(v)) patch.tier_fit = v;
  }
  if ('channel' in body) {
    const v = trimOrNull(body.channel, 20);
    if (v && CHANNELS.has(v)) patch.channel = v;
  }
  if ('phone' in body) patch.phone = trimOrNull(body.phone, 40);
  if ('email' in body) patch.email = trimOrNull(body.email, 254);
  if ('instagram' in body) patch.instagram = trimOrNull(body.instagram, 120);
  if ('website' in body) patch.website = trimOrNull(body.website, 400);
  if ('status' in body) {
    const v = trimOrNull(body.status, 20);
    if (v && STATUSES.has(v)) patch.status = v;
  }
  if ('assignedTo' in body || 'assigned_to' in body) {
    patch.assigned_to = trimOrNull(body.assignedTo ?? body.assigned_to, 120);
  }
  if ('notes' in body) patch.notes = trimOrNull(body.notes, 2000);
  if ('suggestedPitch' in body || 'suggested_pitch' in body) {
    patch.suggested_pitch = trimOrNull(body.suggestedPitch ?? body.suggested_pitch, 4000);
  }
  if ('followUpDate' in body || 'follow_up_date' in body) {
    const d = trimOrNull(body.followUpDate ?? body.follow_up_date, 20);
    patch.follow_up_date = d;
  }
  if ('lastContactAt' in body || 'last_contact_at' in body) {
    const raw = body.lastContactAt ?? body.last_contact_at;
    if (raw === null || raw === '') {
      patch.last_contact_at = null;
    } else if (typeof raw === 'string' && raw.trim()) {
      patch.last_contact_at = new Date(raw.trim()).toISOString();
    }
  }

  if (Object.keys(patch).length === 0) {
    return { ok: false as const, error: 'لا توجد حقول للتحديث' };
  }
  patch.updated_at = new Date().toISOString();
  return { ok: true as const, patch };
}

export async function OPTIONS(request: Request): Promise<Response> {
  return publicApiOptionsResponse(request, CORS_OPTS);
}

export async function GET(request: Request): Promise<Response> {
  const blocked = rejectIfPublicApiCorsBlocked(request, CORS_OPTS);
  if (blocked) return blocked;

  const env = getServiceEnv();
  if (!env) return json({ error: 'Server not configured' }, 503, request);

  const gate = await verifyPlatformAdminFromRequestAny(request, env.url, env.serviceRole, [
    'view_command_center',
    'manage_command_center',
  ]);
  if (gate.ok === false) return json(gate.json, gate.status, request);

  const { data, error } = await gate.supabase
    .from('partner_prospects')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(500);

  if (error) return json({ error: error.message }, 500, request);
  return json(
    {
      ok: true,
      route: 'admin-partner-prospects',
      prospects: (data || []).map((row) => mapRow(row as Record<string, unknown>)),
    },
    200,
    request,
  );
}

export async function POST(request: Request): Promise<Response> {
  const blocked = rejectIfPublicApiCorsBlocked(request, CORS_OPTS);
  if (blocked) return blocked;

  const env = getServiceEnv();
  if (!env) return json({ error: 'Server not configured' }, 503, request);

  const gate = await verifyPlatformAdminFromRequestAny(request, env.url, env.serviceRole, [
    'manage_command_center',
  ]);
  if (gate.ok === false) return json(gate.json, gate.status, request);

  let body: Record<string, unknown> = {};
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return json({ error: 'Invalid JSON body' }, 400, request);
  }

  const parsed = parseCreateBody(body);
  if (parsed.ok === false) return json({ error: parsed.error }, 400, request);

  const insertRow = {
    ...parsed.row,
    created_by_email: gate.actorEmail,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await gate.supabase
    .from('partner_prospects')
    .insert(insertRow)
    .select('*')
    .single();

  if (error) return json({ error: error.message }, 500, request);
  return json({ ok: true, prospect: mapRow(data as Record<string, unknown>) }, 201, request);
}

export async function PATCH(request: Request): Promise<Response> {
  const blocked = rejectIfPublicApiCorsBlocked(request, CORS_OPTS);
  if (blocked) return blocked;

  const env = getServiceEnv();
  if (!env) return json({ error: 'Server not configured' }, 503, request);

  const gate = await verifyPlatformAdminFromRequestAny(request, env.url, env.serviceRole, [
    'manage_command_center',
  ]);
  if (gate.ok === false) return json(gate.json, gate.status, request);

  let body: Record<string, unknown> = {};
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return json({ error: 'Invalid JSON body' }, 400, request);
  }

  const id = trimOrNull(body.id, 80);
  if (!id) return json({ error: 'معرّف lead مطلوب' }, 400, request);

  const parsed = parsePatchBody(body);
  if (parsed.ok === false) return json({ error: parsed.error }, 400, request);

  const { data, error } = await gate.supabase
    .from('partner_prospects')
    .update(parsed.patch)
    .eq('id', id)
    .select('*')
    .maybeSingle();

  if (error) return json({ error: error.message }, 500, request);
  if (!data) return json({ error: 'Not found' }, 404, request);
  return json({ ok: true, prospect: mapRow(data as Record<string, unknown>) }, 200, request);
}
