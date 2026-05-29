import { createClient } from '@supabase/supabase-js';
import { isBootstrapAdminEmail } from './adminManageBarbersAuth.js';
import type { UntypedSupabaseClient } from './untypedSupabase.js';

function normalizeEmail(v: string): string {
  return v.trim().toLowerCase();
}

export type MapCommunityActor =
  | {
      ok: true;
      userId: string;
      email: string;
      role: 'barber';
      barberId: string;
      displayName: string;
      isVerified: boolean;
      canPost: true;
    }
  | {
      ok: true;
      userId: string;
      email: string;
      role: 'admin';
      displayName: string;
      canPost: true;
    }
  | {
      ok: true;
      userId: string;
      email: string;
      role: 'founder';
      displayName: string;
      canPost: false;
    }
  | { ok: false; status: number; message: string };

function readBearerToken(request: Request): string {
  const authHeader = request.headers.get('authorization')?.trim() || '';
  return authHeader.startsWith('Bearer ') ? authHeader.slice('Bearer '.length).trim() : '';
}

export async function verifyMapCommunityActor(
  request: Request,
  supabase: UntypedSupabaseClient,
  opts?: { silentView?: boolean },
): Promise<MapCommunityActor> {
  const accessToken = readBearerToken(request);
  if (!accessToken) {
    return { ok: false, status: 401, message: 'Unauthorized' };
  }

  const { data: userData, error: userErr } = await supabase.auth.getUser(accessToken);
  const user = userData?.user;
  if (userErr || !user?.id || !user.email?.trim()) {
    return { ok: false, status: 401, message: userErr?.message || 'Invalid session' };
  }

  const email = normalizeEmail(user.email);
  const silentView = opts?.silentView === true;

  if (isBootstrapAdminEmail(email)) {
    if (silentView) {
      return {
        ok: true,
        userId: user.id,
        email,
        role: 'founder',
        displayName: '',
        canPost: false,
      };
    }
    return {
      ok: true,
      userId: user.id,
      email,
      role: 'admin',
      displayName: 'مشرف حلاق ماب',
      canPost: true,
    };
  }

  const { data: adminRow } = await supabase
    .from('platform_admin_roles')
    .select('display_name, is_active')
    .eq('email', email)
    .maybeSingle();

  if (adminRow && (adminRow as { is_active?: boolean }).is_active === true) {
    const displayName =
      String((adminRow as { display_name?: string | null }).display_name || '').trim() || email;
    if (silentView) {
      return {
        ok: true,
        userId: user.id,
        email,
        role: 'founder',
        displayName: '',
        canPost: false,
      };
    }
    return {
      ok: true,
      userId: user.id,
      email,
      role: 'admin',
      displayName,
      canPost: true,
    };
  }

  const { data: barber, error: barberErr } = await supabase
    .from('barbers')
    .select('id, name, is_active, is_verified')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .maybeSingle();

  if (barberErr) {
    return { ok: false, status: 500, message: barberErr.message || 'Barber lookup failed' };
  }

  if (!barber) {
    return { ok: false, status: 403, message: 'Access denied' };
  }

  const row = barber as { id: string; name: string | null; is_verified: boolean | null };
  return {
    ok: true,
    userId: user.id,
    email,
    role: 'barber',
    barberId: row.id,
    displayName: String(row.name || 'حلاق ماب').trim(),
    isVerified: Boolean(row.is_verified),
    canPost: true,
  };
}

export function createServiceSupabase(url: string, serviceRole: string): UntypedSupabaseClient {
  return createClient(url, serviceRole, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function computeHasNewCommunityPosts(
  supabase: UntypedSupabaseClient,
  userId: string | null,
): Promise<boolean> {
  if (!userId) return false;

  const { data: cursor } = await supabase
    .from('map_community_read_cursors')
    .select('last_read_at')
    .eq('user_id', userId)
    .maybeSingle();

  const since =
    cursor && (cursor as { last_read_at?: string }).last_read_at
      ? String((cursor as { last_read_at: string }).last_read_at)
      : '1970-01-01T00:00:00.000Z';

  const [msgRes, vidRes] = await Promise.all([
    supabase
      .from('map_community_messages')
      .select('id', { count: 'exact', head: true })
      .eq('is_hidden', false)
      .gt('created_at', since),
    supabase
      .from('map_community_videos')
      .select('id', { count: 'exact', head: true })
      .eq('is_published', true)
      .gt('created_at', since),
  ]);

  const msgCount = msgRes.count ?? 0;
  const vidCount = vidRes.count ?? 0;
  return msgCount + vidCount > 0;
}
