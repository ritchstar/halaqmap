-- Copyright © 2026 HalaqMap. All Rights Reserved.
-- =====================================================================
-- Fix: /admin/cyber Realtime feed — admin SELECT + publication registration
-- =====================================================================
GRANT SELECT ON TABLE public.security_events TO authenticated;

DROP POLICY IF EXISTS "jwt_admin_select_security_events" ON public.security_events;
CREATE POLICY "jwt_admin_select_security_events"
  ON public.security_events FOR SELECT TO authenticated
  USING (public.is_jwt_platform_admin());

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'security_events'
  ) THEN
    RETURN;
  END IF;
  ALTER PUBLICATION supabase_realtime ADD TABLE public.security_events;
END
$$;
