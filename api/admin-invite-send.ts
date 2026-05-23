/**
 * POST /api/admin-invite-send
 *
 * Provisions a new platform admin end-to-end:
 *   1. Verifies the caller has `manage_admins` permission.
 *   2. Generates a strong temporary password.
 *   3. Creates (or, if already present, updates) the Supabase Auth user
 *      with the generated password and confirmed email — so the invitee
 *      can sign in immediately, no extra activation step.
 *   4. Upserts the `platform_admin_roles` row with the requested
 *      permissions and display name.
 *   5. Sends a professional Arabic invitation email via Resend, with
 *      the dashboard URL (pre-filled with the invitee's email) and
 *      the temporary password embedded for one-tap copy.
 *
 * Returns `{ ok: true, generatedPassword, loginUrl, emailSent }`. The
 * `generatedPassword` is returned to the caller so the founder can
 * read it back to the new admin in case the email gateway is offline
 * or the recipient inbox is unreachable.
 */
import { verifyPlatformAdminFromRequestAny } from './_lib/adminManageBarbersAuth.js';
import {
  buildAdminInvitationEmail,
  buildAdminLoginUrl,
  generateStrongPassword,
  sendAdminTransactionalEmail,
} from './_lib/adminInvitationMail.js';

export const config = { maxDuration: 30 };

function json(data: unknown, status = 200): Response {
  return Response.json(data, {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'private, no-store, max-age=0, must-revalidate',
    },
  });
}

type Body = {
  email?: unknown;
  displayName?: unknown;
  permissions?: unknown;
  isActive?: unknown;
};

function normalizeEmail(v: unknown): string {
  return String(v ?? '').trim().toLowerCase();
}

function normalizePermissionsInput(raw: unknown): Record<string, boolean> {
  if (!raw || typeof raw !== 'object') return {};
  const out: Record<string, boolean> = {};
  for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
    out[key] = Boolean(value);
  }
  return out;
}

/**
 * Supabase Admin API has no direct getByEmail — scan paginated list.
 * Typed loosely so it works with either of the two SupabaseClient
 * generic shapes the codebase currently produces.
 */
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

  const auth = await verifyPlatformAdminFromRequestAny(request, serverUrl, serviceKey, [
    'manage_admins',
  ]);
  if (auth.ok === false) return json(auth.json, auth.status);

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return json({ ok: false, error: 'invalid_json_body' }, 400);
  }

  const email = normalizeEmail(body.email);
  if (!email || !email.includes('@')) {
    return json({ ok: false, error: 'invalid_email' }, 400);
  }
  const displayName = String(body.displayName ?? '').trim();
  const permissions = normalizePermissionsInput(body.permissions);
  const isActive = body.isActive === undefined ? true : Boolean(body.isActive);

  // 1) Generate password and provision Auth user.
  const temporaryPassword = generateStrongPassword();
  let authUserId: string | null = null;
  let authUserStatus: 'created' | 'reset' = 'created';

  const { data: createdUser, error: createErr } = await auth.supabase.auth.admin.createUser({
    email,
    password: temporaryPassword,
    email_confirm: true,
    user_metadata: { display_name: displayName || undefined, role: 'platform_admin' },
  });

  if (createdUser?.user?.id) {
    authUserId = createdUser.user.id;
    authUserStatus = 'created';
  } else if (createErr) {
    // Treat "already exists" as a password-reset flow.
    const msg = (createErr.message || '').toLowerCase();
    const alreadyExists =
      msg.includes('already') ||
      msg.includes('exists') ||
      msg.includes('registered') ||
      msg.includes('duplicate');
    if (!alreadyExists) {
      return json(
        { ok: false, error: 'auth_create_failed', hint: createErr.message },
        500,
      );
    }
    authUserId = await findAuthUserIdByEmail(auth.supabase, email);
    if (!authUserId) {
      return json(
        {
          ok: false,
          error: 'auth_user_not_found_after_conflict',
          hint: 'createUser said user exists but listUsers could not locate them.',
        },
        500,
      );
    }
    const { error: updErr } = await auth.supabase.auth.admin.updateUserById(authUserId, {
      password: temporaryPassword,
      email_confirm: true,
      user_metadata: { display_name: displayName || undefined, role: 'platform_admin' },
    });
    if (updErr) {
      return json(
        { ok: false, error: 'auth_password_reset_failed', hint: updErr.message },
        500,
      );
    }
    authUserStatus = 'reset';
  } else {
    return json(
      { ok: false, error: 'auth_create_unexpected', hint: 'createUser returned no user and no error.' },
      500,
    );
  }

  // 2) Upsert platform_admin_roles row.
  const { error: roleErr } = await auth.supabase.from('platform_admin_roles').upsert(
    {
      email,
      display_name: displayName || null,
      is_active: isActive,
      permissions,
      created_by_email: auth.actorEmail || null,
    },
    { onConflict: 'email' },
  );
  if (roleErr) {
    return json(
      { ok: false, error: 'role_upsert_failed', hint: roleErr.message },
      500,
    );
  }

  // 3) Compose and send the invitation email.
  const loginUrl = buildAdminLoginUrl(email);
  const inviterDisplayName = auth.actorEmail; // limited info; falls back gracefully
  const mail = buildAdminInvitationEmail({
    recipientDisplayName: displayName,
    recipientEmail: email,
    temporaryPassword,
    loginUrl,
    permissions,
    invitedByEmail: inviterDisplayName,
  });
  const sent = await sendAdminTransactionalEmail({
    to: email,
    subject: mail.subject,
    text: mail.text,
    html: mail.html,
  });

  // 4) Audit row — best-effort; missing audit table must not fail the invite.
  try {
    await auth.supabase.from('platform_admin_invitations').insert({
      recipient_email: email,
      recipient_display_name: displayName || null,
      invited_by_email: auth.actorEmail || null,
      auth_user_status: authUserStatus,
      email_dispatch_status: sent.ok ? 'sent' : 'failed',
      email_provider_message_id: sent.ok ? sent.id || null : null,
      email_dispatch_error: sent.ok ? null : (sent as { ok: false; error: string }).error,
    });
  } catch {
    /* audit table optional */
  }

  return json({
    ok: true,
    authUserStatus,
    authUserId,
    loginUrl,
    generatedPassword: temporaryPassword,
    emailSent: sent.ok,
    emailError: sent.ok ? null : (sent as { ok: false; error: string }).error,
  });
}
