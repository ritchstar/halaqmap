-- =====================================================
-- منح service_role صريح لجداول الإدارة التي تُدار حصرياً عبر Vercel API
-- (PostgREST + service_role يحتاج GRANT على الجدول حتى مع bypass RLS)
--
-- السبب: 72_admin_financial_archive.sql منح authenticated فقط، بينما
-- api/admin-financial-archive.ts يستخدم مفتاح service_role.
-- =====================================================

-- أرشيف الفواتير — API + (اختياري) قراءة JWT عبر RLS للـ authenticated
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.platform_admin_financial_documents TO service_role;
REVOKE ALL ON TABLE public.platform_admin_financial_documents FROM anon;

-- تقارير OPS_MANAGER — service_role فقط (RLS تمنع authenticated)
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.platform_ops_controller_reports TO service_role;
REVOKE ALL ON TABLE public.platform_ops_controller_reports FROM anon, authenticated;

-- سجل Sentinel — service_role فقط
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.admin_actions_log TO service_role;
REVOKE ALL ON TABLE public.admin_actions_log FROM anon, authenticated;

-- أحداث أمان الدفع — الكتابة من API
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.payment_security_events TO service_role;

COMMENT ON TABLE public.platform_admin_financial_documents IS
  'أرشيف فواتير/وثائق مالية للإدارة — service_role عبر Vercel API؛ authenticated عبر RLS عند الحاجة.';
