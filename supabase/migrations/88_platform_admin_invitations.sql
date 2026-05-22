-- =============================================================================
-- 88_platform_admin_invitations.sql
--
-- Audit table for admin invitation + password-reset dispatches.
-- The /api/admin-invite-send and /api/admin-password-reset endpoints
-- insert one row per dispatch attempt. The table is intentionally
-- append-only and visible to admins with manage_admins permission so
-- the founder can verify exactly when an invite was sent and whether
-- the email gateway accepted it.
--
-- The table is OPTIONAL — both endpoints already swallow audit insert
-- errors. This migration just makes the audit available for governance.
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.platform_admin_invitations (
  id                          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_email             text NOT NULL,
  recipient_display_name      text,
  invited_by_email            text,
  -- 'created' (first-time invite) or 'reset' (re-send / forgot password)
  auth_user_status            text NOT NULL CHECK (auth_user_status IN ('created', 'reset')),
  -- 'sent' or 'failed'
  email_dispatch_status       text NOT NULL CHECK (email_dispatch_status IN ('sent', 'failed')),
  email_provider_message_id   text,
  email_dispatch_error        text,
  created_at                  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS platform_admin_invitations_recipient_email_idx
  ON public.platform_admin_invitations (recipient_email);

CREATE INDEX IF NOT EXISTS platform_admin_invitations_created_at_idx
  ON public.platform_admin_invitations (created_at DESC);

ALTER TABLE public.platform_admin_invitations ENABLE ROW LEVEL SECURITY;

-- Service role bypass is implicit. The only client-side role allowed to
-- read this table is an admin holding `manage_admins`. No client-side
-- INSERT is allowed; only the server-side API endpoints write here via
-- the service role.

DROP POLICY IF EXISTS platform_admin_invitations_select_for_admins
  ON public.platform_admin_invitations;

CREATE POLICY platform_admin_invitations_select_for_admins
  ON public.platform_admin_invitations
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.platform_admin_roles r
      WHERE r.email = lower((auth.jwt() ->> 'email')::text)
        AND r.is_active = true
        AND COALESCE((r.permissions ->> 'manage_admins')::boolean, false) = true
    )
  );

COMMENT ON TABLE public.platform_admin_invitations IS
  'Audit log of admin invitation and password-reset email dispatches. '
  'Written by /api/admin-invite-send and /api/admin-password-reset via '
  'the service role; readable only by admins with manage_admins.';
