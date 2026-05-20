-- سجل إجراءات «الوكيل المراقب» / العمليات الحساسة — يُكتب من دوال Vercel فقط (مفتاح الخدمة).
-- لا يُعرّض للعميل مباشرة؛ الاستعلام عبر لوحة أو أدوات إدارية لاحقاً.

CREATE TABLE IF NOT EXISTS public.admin_actions_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  actor_email text NOT NULL,
  action_type text NOT NULL,
  detail jsonb NOT NULL DEFAULT '{}'::jsonb,
  client_ip text,
  client_user_agent text
);

CREATE INDEX IF NOT EXISTS admin_actions_log_created_at_idx ON public.admin_actions_log (created_at DESC);
CREATE INDEX IF NOT EXISTS admin_actions_log_actor_idx ON public.admin_actions_log (actor_email);

COMMENT ON TABLE public.admin_actions_log IS
  'سجل عمليات الوكيل الإداري (تنبيه، طلب مراجعة، إلخ). الإدراج من الخادم فقط.';

ALTER TABLE public.admin_actions_log ENABLE ROW LEVEL SECURITY;

-- لا وصول مباشر من anon/authenticated؛ الاستخدام عبر service_role من API فقط.
DROP POLICY IF EXISTS "admin_actions_log_no_client" ON public.admin_actions_log;
CREATE POLICY "admin_actions_log_no_client"
  ON public.admin_actions_log
  FOR ALL
  USING (false)
  WITH CHECK (false);

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.admin_actions_log TO service_role;
REVOKE ALL ON TABLE public.admin_actions_log FROM anon, authenticated;
