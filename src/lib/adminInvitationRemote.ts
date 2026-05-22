/**
 * Frontend client for the admin invitation + password-reset endpoints.
 *
 * Both endpoints are POST. The invite endpoint requires the caller's
 * Supabase session token (Bearer) and the `manage_admins` permission.
 * The reset endpoint is public — anyone can ask for a reset, but the
 * server only acts if the email matches an active admin row.
 */
import { getSupabaseClient } from '@/integrations/supabase/client';
import type { AdminPermissions } from '@/lib/adminPermissions';

const INVITE_ROUTE = '/api/admin-invite-send';
const RESET_ROUTE = '/api/admin-password-reset';

async function authorizedHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json; charset=utf-8',
  };
  const supabase = getSupabaseClient();
  if (!supabase) return headers;
  try {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token?.trim();
    if (token) headers.Authorization = `Bearer ${token}`;
  } catch {
    /* ignore */
  }
  const url = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim();
  if (url) headers['x-client-supabase-url'] = url;
  return headers;
}

export type AdminInviteSendInput = {
  email: string;
  displayName?: string;
  permissions: AdminPermissions;
  isActive?: boolean;
};

export type AdminInviteSendSuccess = {
  ok: true;
  authUserStatus: 'created' | 'reset';
  authUserId: string;
  loginUrl: string;
  generatedPassword: string;
  emailSent: boolean;
  emailError: string | null;
};

export type AdminInviteSendFailure = {
  ok: false;
  error: string;
  hint?: string;
};

export async function sendAdminInvitation(
  input: AdminInviteSendInput,
): Promise<AdminInviteSendSuccess | AdminInviteSendFailure> {
  const headers = await authorizedHeaders();
  const resp = await fetch(INVITE_ROUTE, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      email: input.email.trim().toLowerCase(),
      displayName: (input.displayName ?? '').trim() || null,
      permissions: input.permissions,
      isActive: input.isActive ?? true,
    }),
  });

  let payload: unknown;
  try {
    payload = await resp.json();
  } catch {
    return { ok: false, error: `network_${resp.status}` };
  }
  if (!resp.ok || (payload as { ok?: boolean }).ok === false) {
    const errorPayload = payload as { error?: string; hint?: string };
    return {
      ok: false,
      error: errorPayload.error || `http_${resp.status}`,
      hint: errorPayload.hint,
    };
  }
  return payload as AdminInviteSendSuccess;
}

export type AdminPasswordResetResult = {
  ok: true;
  message: string;
};

export async function requestAdminPasswordReset(
  email: string,
): Promise<AdminPasswordResetResult> {
  // Public endpoint — no session token required.
  const resp = await fetch(RESET_ROUTE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
    body: JSON.stringify({ email: email.trim().toLowerCase() }),
  });
  // The endpoint always returns the same friendly payload to avoid leaking
  // which emails are admins; just surface that to the UI.
  try {
    const data = (await resp.json()) as { message?: string };
    return {
      ok: true,
      message:
        data.message ??
        'إذا كان البريد مسجَّلاً في فريق الإدارة، فستصلك رسالة بكلمة المرور الجديدة خلال دقائق.',
    };
  } catch {
    return {
      ok: true,
      message:
        'إذا كان البريد مسجَّلاً في فريق الإدارة، فستصلك رسالة بكلمة المرور الجديدة خلال دقائق.',
    };
  }
}
