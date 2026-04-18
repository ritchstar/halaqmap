import { createClient } from '@supabase/supabase-js';

export const config = {
  maxDuration: 15,
};

function safeHost(rawUrl: string): string | null {
  if (!rawUrl) return null;
  try {
    return new URL(rawUrl).host;
  } catch {
    return rawUrl;
  }
}

function corsHeaders(request: Request): Record<string, string> {
  const origin = request.headers.get('origin');
  return {
    'Access-Control-Allow-Origin': origin || '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, x-supabase-anon, x-client-supabase-url',
    'Access-Control-Max-Age': '86400',
  };
}

export async function OPTIONS(request: Request): Promise<Response> {
  return new Response(null, { status: 204, headers: corsHeaders(request) });
}

export async function GET(request: Request): Promise<Response> {
  const headers = corsHeaders(request);
  const resolvedUrl = (process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '').trim();
  const serviceRole = Boolean((process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim());
  const anon = Boolean(
    (process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '').trim(),
  );
  return Response.json(
    {
      ok: true,
      route: 'barber-portal-session-refresh',
      supabaseUrlSet: Boolean(resolvedUrl),
      supabaseUrlHost: safeHost(resolvedUrl),
      serviceRoleKeySet: serviceRole,
      anonKeySetForVerification: anon,
      ready: Boolean(resolvedUrl) && serviceRole && anon,
    },
    { headers },
  );
}

export async function POST(request: Request): Promise<Response> {
  const headers = corsHeaders(request);

  const url = (process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '').trim();
  const serviceRole = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  const expectedAnon = (
    process.env.VITE_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    ''
  ).trim();

  if (!url || !serviceRole) {
    return Response.json(
      { error: 'Server not configured (SUPABASE_SERVICE_ROLE_KEY / URL)' },
      { status: 503, headers },
    );
  }
  if (!expectedAnon) {
    return Response.json(
      { error: 'Server not configured (anon key for verification)' },
      { status: 503, headers },
    );
  }

  const clientSupabaseUrl = request.headers.get('x-client-supabase-url')?.trim() || '';
  if (clientSupabaseUrl && clientSupabaseUrl !== url) {
    return Response.json(
      {
        error: 'Supabase project mismatch between client and server',
        serverUrlHost: safeHost(url),
        clientUrlHost: safeHost(clientSupabaseUrl),
      },
      { status: 409, headers },
    );
  }

  const providedAnon =
    request.headers.get('x-supabase-anon')?.trim() ||
    (request.headers.get('authorization')?.startsWith('Bearer ')
      ? request.headers.get('authorization')!.slice(7).trim()
      : '');

  if (providedAnon !== expectedAnon) {
    return Response.json({ error: 'Unauthorized' }, { status: 401, headers });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400, headers });
  }

  const barberId = String((body as { barberId?: unknown }).barberId ?? '').trim();
  const rawEmail = String((body as { email?: unknown }).email ?? '').trim();

  if (!barberId || !rawEmail) {
    return Response.json({ error: 'Missing barberId or email' }, { status: 400, headers });
  }

  const supabase = createClient(url, serviceRole, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const selectCols = 'id, name, email, phone, tier, rating_invite_token, member_number, is_active';

  const { data: row, error } = await supabase.from('barbers').select(selectCols).eq('id', barberId).maybeSingle();

  if (error) {
    return Response.json({ error: error.message || 'Lookup failed' }, { status: 500, headers });
  }

  if (!row) {
    return Response.json({ error: 'Barber not found' }, { status: 404, headers });
  }

  const b = row as {
    id: string;
    name: string;
    email: string;
    phone: string;
    tier: string;
    rating_invite_token: string | null;
    member_number: number | null;
    is_active: boolean | null;
  };

  const emailNorm = rawEmail.trim().toLowerCase();
  const rowEmail = String(b.email ?? '').trim().toLowerCase();
  if (!rowEmail || rowEmail !== emailNorm) {
    return Response.json({ error: 'Email does not match this barber account' }, { status: 403, headers });
  }

  if (b.is_active === false) {
    return Response.json({ error: 'Account is not active' }, { status: 403, headers });
  }

  return Response.json(
    {
      ok: true,
      barber: {
        id: String(b.id),
        name: String(b.name ?? ''),
        email: String(b.email ?? ''),
        phone: String(b.phone ?? ''),
        tier: String(b.tier ?? 'bronze'),
        rating_invite_token: b.rating_invite_token != null ? String(b.rating_invite_token) : '',
        member_number:
          b.member_number != null && Number.isFinite(Number(b.member_number))
            ? Math.floor(Number(b.member_number))
            : null,
      },
    },
    { headers },
  );
}
