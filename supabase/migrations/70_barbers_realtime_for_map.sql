-- =====================================================
-- Realtime: تحديثات جدول barbers للواجهة العامة (حالة مفتوح/مغلق على الخريطة/القائمة)
-- =====================================================

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'barbers'
  ) THEN
    RETURN;
  END IF;
  ALTER PUBLICATION supabase_realtime ADD TABLE public.barbers;
END
$$;
