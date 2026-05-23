-- =====================================================
-- تفعيل Realtime لجدول سجل أمان الحجز (لوحة التحكم)
-- =====================================================

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'platform_booking_security_log'
  ) THEN
    RETURN;
  END IF;
  ALTER PUBLICATION supabase_realtime ADD TABLE public.platform_booking_security_log;
END
$$;
