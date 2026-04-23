import { safeHost, verifyPlatformAdminFromRequest } from './_lib/adminManageBarbersAuth.js';
import { buildPublicApiCorsHeaders, publicApiOptionsResponse, rejectIfPublicApiCorsBlocked } from './_lib/publicApiCors.js';

export const config = {
  maxDuration: 25,
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

export async function GET(request: Request): Promise<Response> {
  const blocked = rejectIfPublicApiCorsBlocked(request, CORS_OPTS);
  if (blocked) return blocked;
  const headers = corsHeaders(request);

  const url = (process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '').trim();
  const serviceRole = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  if (!url || !serviceRole) {
    return Response.json(
      { error: 'Server not configured (SUPABASE_SERVICE_ROLE_KEY / URL)' },
      { status: 503, headers },
    );
  }

  const adminAuth = await verifyPlatformAdminFromRequest(request, url, serviceRole, 'view_messages');
  if (!adminAuth.ok) {
    return Response.json(adminAuth.json, { status: adminAuth.status, headers });
  }
  const supabase = adminAuth.supabase;

  const u = new URL(request.url);
  const action = (u.searchParams.get('action') || '').trim();

  if (action === 'threads') {
    const { data: msgRows, error: msgErr } = await supabase
      .from('platform_support_messages')
      .select('barber_id, created_at')
      .order('created_at', { ascending: false })
      .limit(5000);

    if (msgErr) {
      return Response.json({ error: msgErr.message || 'Failed to list messages' }, { status: 500, headers });
    }

    const latestByBarber = new Map<string, string>();
    for (const row of msgRows ?? []) {
      const bid = String((row as { barber_id?: string }).barber_id ?? '');
      const ca = String((row as { created_at?: string }).created_at ?? '');
      if (bid && !latestByBarber.has(bid)) latestByBarber.set(bid, ca);
    }

    const barberIds = [...latestByBarber.keys()];
    if (barberIds.length === 0) {
      return Response.json({ ok: true, threads: [] }, { headers });
    }

    const { data: barbers, error: bErr } = await supabase
      .from('barbers')
      .select('id, name, email')
      .in('id', barberIds);

    if (bErr) {
      return Response.json({ error: bErr.message || 'Failed to load barbers' }, { status: 500, headers });
    }

    const barberMap = new Map((barbers ?? []).map((b) => [String((b as { id: string }).id), b as { id: string; name: string; email: string }]));

    const threads = barberIds
      .map((id) => {
        const b = barberMap.get(id);
        return {
          barberId: id,
          barberName: b?.name ?? '—',
          barberEmail: b?.email ?? '',
          lastMessageAt: latestByBarber.get(id) ?? null,
        };
      })
      .sort((a, b) => String(b.lastMessageAt ?? '').localeCompare(String(a.lastMessageAt ?? '')));

    return Response.json({ ok: true, threads }, { headers });
  }

  if (action === 'messages') {
    const barberId = (u.searchParams.get('barberId') || '').trim();
    if (!barberId) {
      return Response.json({ error: 'Missing barberId' }, { status: 400, headers });
    }

    const { data: rows, error } = await supabase
      .from('platform_support_messages')
      .select('id, barber_id, from_admin, body, admin_sender_email, created_at')
      .eq('barber_id', barberId)
      .order('created_at', { ascending: true })
      .limit(500);

    if (error) {
      return Response.json({ error: error.message || 'Failed to load thread' }, { status: 500, headers });
    }

    return Response.json({ ok: true, messages: rows ?? [] }, { headers });
  }

  return Response.json(
    {
      ok: true,
      route: 'admin-support-chat',
      supabaseUrlHost: safeHost(url),
      postAuth: 'Authorization: Bearer + view_messages',
      actions: ['threads', 'messages?barberId='],
    },
    { headers },
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
      { status: 503, headers },
    );
  }

  const adminAuth = await verifyPlatformAdminFromRequest(request, url, serviceRole, 'view_messages');
  if (!adminAuth.ok) {
    return Response.json(adminAuth.json, { status: adminAuth.status, headers });
  }
  const supabase = adminAuth.supabase;
  const actorEmail = adminAuth.actorEmail;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400, headers });
  }

  const barberId = String((body as { barberId?: unknown }).barberId ?? '').trim();
  const text = String((body as { body?: unknown }).body ?? '').trim();

  if (!barberId) {
    return Response.json({ error: 'Missing barberId' }, { status: 400, headers });
  }
  if (text.length < 1 || text.length > 4000) {
    return Response.json({ error: 'body must be 1–4000 characters' }, { status: 400, headers });
  }

  const { data: b, error: bErr } = await supabase.from('barbers').select('id').eq('id', barberId).maybeSingle();
  if (bErr) {
    return Response.json({ error: bErr.message || 'Lookup failed' }, { status: 500, headers });
  }
  if (!b) {
    return Response.json({ error: 'Barber not found' }, { status: 404, headers });
  }

  const { data: inserted, error: insErr } = await supabase
    .from('platform_support_messages')
    .insert({
      barber_id: barberId,
      from_admin: true,
      body: text,
      admin_sender_email: actorEmail,
    })
    .select('id, barber_id, from_admin, body, admin_sender_email, created_at')
    .maybeSingle();

  if (insErr) {
    return Response.json({ error: insErr.message || 'Insert failed' }, { status: 500, headers });
  }

  return Response.json({ ok: true, message: inserted }, { headers });
}
