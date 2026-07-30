-- Copyright © 2026 HalaqMap. All Rights Reserved.
-- =====================================================
-- إصلاح صلاحيات جداول طاقم الحجز بالاسم (permission denied)
-- الهجرة 153 أنشأت الجداول مع RLS دون GRANT لـ service_role
-- =====================================================

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.barber_team_members TO service_role;
GRANT SELECT ON TABLE public.barber_team_members TO anon, authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.barber_team_member_blocks TO service_role;

-- تخزين صور الطاقم: السماح لـ service_role بالرفع/الحذف
GRANT SELECT ON ALL TABLES IN SCHEMA storage TO service_role;

-- سياسات كتابة الحاوية عبر service role (إن وُجدت الكائنات)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'barber-team') THEN
    DROP POLICY IF EXISTS "service_role_write_barber_team" ON storage.objects;
    CREATE POLICY "service_role_write_barber_team"
      ON storage.objects FOR ALL
      TO service_role
      USING (bucket_id = 'barber-team')
      WITH CHECK (bucket_id = 'barber-team');
  END IF;
EXCEPTION
  WHEN insufficient_privilege THEN
    RAISE NOTICE 'skip storage policy — insufficient privilege';
  WHEN undefined_table THEN
    RAISE NOTICE 'skip storage policy — storage.objects missing';
END $$;
