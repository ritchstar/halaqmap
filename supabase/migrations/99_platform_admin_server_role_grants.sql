-- =====================================================
-- منح service_role صريح لجداول الإدارة (Vercel API)
-- آمن للتشغيل اليدوي: ينشئ الجداول الناقصة ويمنح الصلاحيات فقط لما وُجد.
-- =====================================================

-- (1) جدول OPS — إن لم يُطبَّق ترحيل 81 بعد
CREATE TABLE IF NOT EXISTS public.platform_ops_controller_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  submitted_at timestamptz NOT NULL DEFAULT now(),
  client_id text NOT NULL,
  client_label text,
  reporter_email text NOT NULL,
  reporter_role text NOT NULL DEFAULT 'OPS_MANAGER',
  category text NOT NULL,
  severity text NOT NULL DEFAULT 'info',
  title text NOT NULL,
  summary text NOT NULL,
  detail jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS platform_ops_controller_reports_submitted_idx
  ON public.platform_ops_controller_reports (submitted_at DESC);
CREATE INDEX IF NOT EXISTS platform_ops_controller_reports_client_idx
  ON public.platform_ops_controller_reports (client_id);
CREATE INDEX IF NOT EXISTS platform_ops_controller_reports_reporter_idx
  ON public.platform_ops_controller_reports (reporter_email);

ALTER TABLE public.platform_ops_controller_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "platform_ops_controller_reports_no_client" ON public.platform_ops_controller_reports;
CREATE POLICY "platform_ops_controller_reports_no_client"
  ON public.platform_ops_controller_reports
  FOR ALL
  USING (false)
  WITH CHECK (false);

-- (2) منح service_role — فقط للجداول الموجودة فعلياً
DO $$
DECLARE
  tbl text;
BEGIN
  FOREACH tbl IN ARRAY ARRAY[
    'platform_admin_financial_documents',
    'platform_ops_controller_reports',
    'admin_actions_log',
    'payment_security_events'
  ]
  LOOP
    IF to_regclass('public.' || tbl) IS NULL THEN
      RAISE NOTICE 'skip grants: public.% does not exist', tbl;
      CONTINUE;
    END IF;

    EXECUTE format(
      'GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.%I TO service_role',
      tbl
    );

    IF tbl IN ('platform_ops_controller_reports', 'admin_actions_log') THEN
      EXECUTE format('REVOKE ALL ON TABLE public.%I FROM anon, authenticated', tbl);
    ELSIF tbl = 'platform_admin_financial_documents' THEN
      EXECUTE format('REVOKE ALL ON TABLE public.%I FROM anon', tbl);
    END IF;

    RAISE NOTICE 'granted service_role on public.%', tbl;
  END LOOP;
END $$;

DO $$
BEGIN
  IF to_regclass('public.platform_admin_financial_documents') IS NOT NULL THEN
    COMMENT ON TABLE public.platform_admin_financial_documents IS
      'أرشيف فواتير/وثائق مالية للإدارة — service_role عبر Vercel API؛ authenticated عبر RLS عند الحاجة.';
  END IF;

  IF to_regclass('public.platform_ops_controller_reports') IS NOT NULL THEN
    COMMENT ON TABLE public.platform_ops_controller_reports IS
      'تقارير OPS_MANAGER — مُوسَمة بـ client_id و submitted_at للتغذية التشغيلية للمؤسس.';
  END IF;
END $$;
