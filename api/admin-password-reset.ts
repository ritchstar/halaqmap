/**
 * POST /api/admin-password-reset  (PUBLIC endpoint)
 *
 * Self-service password reset for platform admins. Anyone can call it,
 * but the reset only proceeds if the email is registered in
 * `platform_admin_roles` AND that row is active. This keeps the
 * surface safe (no leak of which arbitrary email is an admin) while
 * still letting a locked-out admin recover without involving the
 * founder.
 *
 * The response is intentionally identical whether the email matches an
 * admin or not — so callers cannot enumerate admin emails. The real
 * reset only happens server-side when the email matches.
 */
import { createClient } from '@supabase/supabase-js';
import {
  buildAdminLoginUrl,
  buildAdminPasswordResetEmail,
  generateStrongPassword,
  sendAdminTransactionalEmail,
} from './_lib/adminInvitationMail.js';

export const config = { maxDuration: 25 };

const PUBLIC_OK_RESPONSE = {
  ok: true,
  message:
    'إذا كان البريد مسجَّلاً في فريق الإدارة، فستصلك رسالة بكلمة المرور الجديدة خلال دقائق.',
};

function json(data: unknown, status = 200): Response {
  return Response.json(data, {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'private, no-store, max-age=0, must-revalidate',
    },
  });
}

function normalizeEmail(v: unknown): string {
  return String(v ?? '').trim().toLowerCase();
}

async function findAuthUserIdByEmail(
  supabase: { auth: { admin: { listUsers: (opts: { page: number; perPage: number }) => Promise<{ data: { users: Array<{ id: string; email?: string | null }> } | null; error: { message: string } | null }> } } },
  email: string,
): Promise<string | null> {
  const target = email.trim().toLowerCase();
  const { data, error } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (error) return null;
  const user = data?.users?.find((u) => (u.email ?? '').trim().toLowerCase() === target);
  return user?.id ?? null;
}

export async function POST(request: Request): Promise<Response> {
  const serverUrl = (process.env.SUPABASE_URL || '').trim();
  const serviceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  if (!serverUrl || !serviceKey) {
    return json(
      { ok: false, error: 'server_misconfigured', hint: 'Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.' },
      500,
    );
  }

  let body: { email?: unknown };
  try {
    body = (await request.json()) as { email?: unknown };
  } catch {
    return json(PUBLIC_OK_RESPONSE);
  }

  const email = normalizeEmail(body.email);
  if (!email.includes('@')) return json(PUBLIC_OK_RESPONSE);

  const supabase = createClient(serverUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // Confirm the email belongs to an active platform admin.
  const { data: roleRow, error: roleErr } = await supabase
    .from('platform_admin_roles')
    .select('email, display_name, is_active')
    .eq('email', email)
    .maybeSingle();

  if (roleErr || !roleRow || !roleRow.is_active) {
    // Quiet failure — same response shape as success.
    return json(PUBLIC_OK_RESPONSE);
  }

  // Locate the Supabase Auth user.
  const authUserId = await findAuthUserIdByEmail(supabase, email);
  if (!authUserId) {
    // Edge case: role exists but no Auth user — quietly succeed; founder
    // should re-invite via the dashboard.
    return json(PUBLIC_OK_RESPONSE);
  }

  // Generate a fresh password and persist it.
  const temporaryPassword = generateStrongPassword();
  const { error: updErr } = await supabase.auth.admin.updateUserById(authUserId, {
    password: temporaryPassword,
    email_confirm: true,
  });
  if (updErr) {
    return json(PUBLIC_OK_RESPONSE);
  }

  // Send the reset email.
  const loginUrl = buildAdminLoginUrl(email);
  const mail = buildAdminPasswordResetEmail({
    recipientDisplayName: roleRow.display_name ?? '',
    recipientEmail: email,
    temporaryPassword,
    loginUrl,
  });
  const sent = await sendAdminTransactionalEmail({
    to: email,
    subject: mail.subject,
    text: mail.text,
    html: mail.html,
  });

  // Audit best-effort.
  try {
    await supabase.from('platform_admin_invitations').insert({
      recipient_email: email,
      recipient_display_name: roleRow.display_name ?? null,
      invited_by_email: null,
      auth_user_status: 'reset',
      email_dispatch_status: sent.ok ? 'sent' : 'failed',
      email_provider_message_id: sent.ok ? sent.id || null : null,
      email_dispatch_error: sent.ok ? null : (sent as { ok: false; error: string }).error,
    });
  } catch {
    /* audit table optional */
  }

  return json(PUBLIC_OK_RESPONSE);
}
