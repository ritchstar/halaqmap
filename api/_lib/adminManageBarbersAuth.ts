import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const EXTRA_BOOTSTRAP_ADMIN_EMAILS = ['admin@halaqmap.com'];

export function safeHost(rawUrl: string): string | null {
  if (!rawUrl) return null;
  try {
    return new URL(rawUrl).host;
  } catch {
    return rawUrl;
  }
}

function normalizeEmail(v: string): string {
  return v.trim().toLowerCase();
}

/** يطابق المنطق الافتراضي في `src/config/adminAuth.ts`. */
function getServerBootstrapAdminEmail(): string {
  const fromEnv = (process.env.VITE_ADMIN_EMAIL || process.env.ADMIN_EMAIL || '').trim();
  if (fromEnv) return normalizeEmail(fromEnv);
  return 'ritchstar4@gmail.com';
}

function isBootstrapAdminEmail(email: string): boolean {
  const e = normalizeEmail(email);
  const set = new Set([
    getServerBootstrapAdminEmail(),
    ...EXTRA_BOOTSTRAP_ADMIN_EMAILS.map(normalizeEmail),
  ]);
  return set.has(e);
}

/** مفاتيح JSON في عمود permissions — يجب أن تطابق src/lib/adminPermissions.ts */
export type PlatformAdminPermissionKey =
  | 'view_overview'
  | 'view_requests'
  | 'review_requests'
  | 'view_barbers'
  | 'manage_barbers'
  | 'view_payments'
  | 'review_payments'
  | 'view_command_center'
  | 'manage_command_center'
  | 'view_messages'
  | 'view_settings'
  | 'manage_admins';

function permissionFromRow(raw: unknown, key: PlatformAdminPermissionKey): boolean {
  const incoming = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};
  return Boolean(incoming[key]);
}

async function assertPlatformAdminHasPermission(
  supabase: SupabaseClient,
  actorEmail: string,
  required: PlatformAdminPermissionKey
): Promise<{ ok: true } | { ok: false; message: string }> {
  if (isBootstrapAdminEmail(actorEmail)) return { ok: true };

  const { data, error } = await supabase
    .from('platform_admin_roles')
    .select('is_active, permissions')
    .eq('email', normalizeEmail(actorEmail))
    .maybeSingle();

  if (error) return { ok: false, message: error.message || 'Admin lookup failed' };
  if (!data || data.is_active !== true) {
    return { ok: false, message: 'Forbidden: not an active platform admin' };
  }
  if (!permissionFromRow(data.permissions, required)) {
    return {
      ok: false,
      message: `Forbidden: platform permission "${required}" is required`,
    };
  }
  return { ok: true };
}

export type VerifyManageBarbersAdminResult =
  | { ok: true; supabase: SupabaseClient; actorEmail: string }
  | { ok: false; status: number; json: Record<string, unknown> };

/**
 * تحقق من توكن Supabase ثم من مفتاح صلاحية واحد في platform_admin_roles (أو bootstrap).
 */
export async function verifyPlatformAdminFromRequest(
  request: Request,
  serverSupabaseUrl: string,
  serviceRoleKey: string,
  requiredPermission: PlatformAdminPermissionKey
): Promise<VerifyManageBarbersAdminResult> {
  const clientSupabaseUrl = request.headers.get('x-client-supabase-url')?.trim() || '';
  if (clientSupabaseUrl && clientSupabaseUrl !== serverSupabaseUrl) {
    return {
      ok: false,
      status: 409,
      json: {
        error: 'Supabase project mismatch between client and server',
        hint: 'Align VITE_SUPABASE_URL and SUPABASE_URL on Vercel to the same project.',
        serverUrlHost: safeHost(serverSupabaseUrl),
        clientUrlHost: safeHost(clientSupabaseUrl),
      },
    };
  }

  const authHeader = request.headers.get('authorization')?.trim() || '';
  const accessToken =
    authHeader.startsWith('Bearer ') ? authHeader.slice('Bearer '.length).trim() : '';

  if (!accessToken) {
    return {
      ok: false,
      status: 401,
      json: {
        error: 'Unauthorized',
        hint: 'Send Authorization: Bearer <Supabase session access_token> from a signed-in admin.',
      },
    };
  }

  const supabase = createClient(serverSupabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: userData, error: userErr } = await supabase.auth.getUser(accessToken);
  const user = userData?.user;
  if (userErr || !user?.email?.trim()) {
    return {
      ok: false,
      status: 401,
      json: {
        error: 'Unauthorized',
        hint: userErr?.message || 'Invalid or expired session token',
      },
    };
  }

  const gate = await assertPlatformAdminHasPermission(supabase, user.email, requiredPermission);
  if (gate.ok === false) {
    return { ok: false, status: 403, json: { error: gate.message } };
  }

  return { ok: true, supabase, actorEmail: normalizeEmail(user.email) };
}

/**
 * تحقق من توكن Supabase للمستخدم ثم من صلاحية manage_barbers (أو بريد bootstrap).
 * يُستخدم لمسارات السيرفر التي كانت تعتمد على مطابقة anon العامة.
 */
export async function verifyManageBarbersAdminFromRequest(
  request: Request,
  serverSupabaseUrl: string,
  serviceRoleKey: string
): Promise<VerifyManageBarbersAdminResult> {
  return verifyPlatformAdminFromRequest(request, serverSupabaseUrl, serviceRoleKey, 'manage_barbers');
}
