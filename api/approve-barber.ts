import { safeHost, verifyManageBarbersAdminFromRequest } from './_lib/adminManageBarbersAuth.js';
import { whitelistBarberUpsertRow } from './_lib/approveBarberUpsertWhitelist.js';
import {
  isBarberUpsertMissingInclusiveCareColumnError,
  stripInclusiveCareKeysFromBarberUpsertRow,
} from './_lib/barberInclusiveCareUpsertRetry.js';
import { buildPublicApiCorsHeaders, publicApiOptionsResponse, rejectIfPublicApiCorsBlocked } from './_lib/publicApiCors.js';

export const config = {
  maxDuration: 30,
};

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

/** تشخيص بدون أسرار — افتح: /api/approve-barber */
export async function GET(request: Request): Promise<Response> {
  const blocked = rejectIfPublicApiCorsBlocked(request, CORS_OPTS);
  if (blocked) return blocked;
  const headers = corsHeaders(request);
  const resolvedUrl = (process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '').trim();
  const url = Boolean(resolvedUrl);
  const serviceRole = Boolean((process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim());
  return Response.json(
    {
      ok: true,
      route: 'approve-barber',
      supabaseUrlSet: url,
      supabaseUrlHost: safeHost(resolvedUrl),
      serviceRoleKeySet: serviceRole,
      postAuth: 'Authorization: Bearer <Supabase access_token> + active admin with manage_barbers',
      ready: url && serviceRole,
    },
    { headers }
  );
}

export async function POST(request: Request): Promise<Response> {
  const blocked = rejectIfPublicApiCorsBlocked(request, CORS_OPTS);
  if (blocked) return blocked;
  const headers = corsHeaders(request);

  const url = (process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '').trim();
  const serviceRole = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();

  if (!url || !serviceRole) {
    return Response.json(
      { error: 'Server not configured (SUPABASE_SERVICE_ROLE_KEY / URL)' },
      { status: 503, headers }
    );
  }

  const adminAuth = await verifyManageBarbersAdminFromRequest(request, url, serviceRole);
  if (adminAuth.ok === false) {
    const { json, status } = adminAuth;
    return Response.json(json, { status, headers });
  }
  const supabase = adminAuth.supabase;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400, headers });
  }

  const row = (body as { row?: unknown })?.row;
  if (!row || typeof row !== 'object' || Array.isArray(row)) {
    return Response.json({ error: 'Invalid row payload' }, { status: 400, headers });
  }

  const wl = whitelistBarberUpsertRow(row as Record<string, unknown>);
  if (!wl.ok) {
    return Response.json(
      {
        error: 'Row contains disallowed fields',
        disallowedKeys: wl.disallowedKeys,
        hint: 'Only barber profile columns approved for admin upsert are accepted (rating_invite_token is server-managed).',
      },
      { status: 400, headers }
    );
  }

  const email = String((wl.row as { email?: unknown }).email ?? '').trim();
  if (!email) {
    return Response.json({ error: 'Missing barber email' }, { status: 400, headers });
  }

  let upsertPayload: Record<string, unknown> = wl.row as Record<string, unknown>;
  let skippedInclusiveCareDueToSchema = false;
  let { data, error } = await supabase
    .from('barbers')
    .upsert(upsertPayload, { onConflict: 'email' })
    .select('id, member_number')
    .single();

  if (error && isBarberUpsertMissingInclusiveCareColumnError(error.message)) {
    skippedInclusiveCareDueToSchema = true;
    upsertPayload = stripInclusiveCareKeysFromBarberUpsertRow(wl.row as Record<string, unknown>);
    const second = await supabase
      .from('barbers')
      .upsert(upsertPayload, { onConflict: 'email' })
      .select('id, member_number')
      .single();
    data = second.data;
    error = second.error;
  }

  if (error || !data) {
    return Response.json({ error: error?.message || 'Upsert failed' }, { status: 500, headers });
  }

  const barberId = String((data as { id: string }).id);
  const memberNumberRaw = (data as { member_number?: number | null }).member_number;
  const memberNumber =
    memberNumberRaw != null && Number.isFinite(Number(memberNumberRaw)) ? Number(memberNumberRaw) : null;

  /** صفوف قديمة أو upsert بدون لمس العمود قد تبقي rating_invite_token فارغاً — يُعبَّأ هنا ليعمل QR والبريد */
  const { data: tokenRow, error: tokenErr } = await supabase
    .from('barbers')
    .select('rating_invite_token')
    .eq('id', barberId)
    .maybeSingle();
  if (!tokenErr && tokenRow) {
    const existing = String((tokenRow as { rating_invite_token?: string | null }).rating_invite_token ?? '').trim();
    if (!existing) {
      const bytes = new Uint8Array(24);
      crypto.getRandomValues(bytes);
      const fresh = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
      const { error: upErr } = await supabase
        .from('barbers')
        .update({ rating_invite_token: fresh })
        .eq('id', barberId);
      if (upErr) {
        return Response.json(
          { error: upErr.message || 'Failed to set rating_invite_token', barberId },
          { status: 500, headers },
        );
      }
    }
  }

  return Response.json(
    {
      ok: true,
      barberId,
      memberNumber,
      ...(skippedInclusiveCareDueToSchema
        ? {
            warning:
              'تم حفظ الحلاق دون حقول «رعاية شاملة» لأن قاعدة البيانات لا تزال بلا الأعمدة الجديدة. نفّذ ترحيل 32 أو 38 في Supabase ثم حدّث إعدادات الرعاية من لوحة الحلاق.',
          }
        : {}),
    },
    { headers }
  );
}
