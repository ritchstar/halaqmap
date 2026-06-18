-- =====================================================
-- 117 — Salon owner watch (غرفة المراقبة) — Sprint 1
-- salon_members: owner/operator roles per barber_id + email
-- salon_ops_events: read-only event log for owner monitoring
-- =====================================================

CREATE TABLE IF NOT EXISTS public.salon_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barber_id UUID NOT NULL REFERENCES public.barbers(id) ON DELETE CASCADE,
  member_email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('owner', 'operator')),
  can_watch BOOLEAN NOT NULL DEFAULT true,
  notify_push BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT salon_members_email_len CHECK (char_length(member_email) BETWEEN 3 AND 254),
  CONSTRAINT salon_members_email_normalized CHECK (member_email = lower(btrim(member_email))),
  UNIQUE (barber_id, member_email)
);

CREATE INDEX IF NOT EXISTS salon_members_barber_role_idx
  ON public.salon_members (barber_id, role);

COMMENT ON TABLE public.salon_members IS
  'أعضاء صالون — مالك (owner) أو مشغّل (operator). الوصول عبر API بـ service_role فقط.';

CREATE TABLE IF NOT EXISTS public.salon_ops_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barber_id UUID NOT NULL REFERENCES public.barbers(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'info' CHECK (severity IN ('info', 'watch', 'urgent')),
  title_ar TEXT NOT NULL,
  body_ar TEXT NOT NULL DEFAULT '',
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT salon_ops_events_title_len CHECK (char_length(title_ar) BETWEEN 1 AND 240)
);

CREATE INDEX IF NOT EXISTS salon_ops_events_barber_created_idx
  ON public.salon_ops_events (barber_id, created_at DESC);

COMMENT ON TABLE public.salon_ops_events IS
  'سجل أحداث تشغيلية للمراقبة — بدون PII للزبائن.';

ALTER TABLE public.salon_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.salon_ops_events ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.salon_members FROM PUBLIC;
REVOKE ALL ON TABLE public.salon_ops_events FROM PUBLIC;
REVOKE ALL ON TABLE public.salon_members FROM anon, authenticated;
REVOKE ALL ON TABLE public.salon_ops_events FROM anon, authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.salon_members TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.salon_ops_events TO service_role;

CREATE OR REPLACE FUNCTION public.ensure_salon_owner_member(p_barber_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_email TEXT;
BEGIN
  IF p_barber_id IS NULL THEN
    RETURN;
  END IF;

  SELECT lower(btrim(coalesce(b.email, '')))
  INTO v_email
  FROM public.barbers b
  WHERE b.id = p_barber_id;

  IF coalesce(v_email, '') = '' THEN
    RETURN;
  END IF;

  INSERT INTO public.salon_members (barber_id, member_email, role, can_watch, notify_push)
  VALUES (p_barber_id, v_email, 'owner', true, true)
  ON CONFLICT (barber_id, member_email) DO UPDATE SET
    role = EXCLUDED.role,
    can_watch = true;
END;
$$;

REVOKE ALL ON FUNCTION public.ensure_salon_owner_member(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.ensure_salon_owner_member(UUID) TO service_role;

INSERT INTO public.salon_members (barber_id, member_email, role, can_watch, notify_push)
SELECT b.id, lower(btrim(b.email)), 'owner', true, true
FROM public.barbers b
WHERE coalesce(btrim(b.email), '') <> ''
ON CONFLICT (barber_id, member_email) DO NOTHING;
