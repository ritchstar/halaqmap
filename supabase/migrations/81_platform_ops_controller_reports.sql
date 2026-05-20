-- تقارير مراقب العمليات (OPS_MANAGER) — تظهر في تغذية المؤسس.
-- الإدراج والقراءة عبر API (service_role) فقط.

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

COMMENT ON TABLE public.platform_ops_controller_reports IS
  'تقارير OPS_MANAGER — مُوسَمة بـ client_id و submitted_at للتغذية التشغيلية للمؤسس.';

ALTER TABLE public.platform_ops_controller_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "platform_ops_controller_reports_no_client" ON public.platform_ops_controller_reports;
CREATE POLICY "platform_ops_controller_reports_no_client"
  ON public.platform_ops_controller_reports
  FOR ALL
  USING (false)
  WITH CHECK (false);
