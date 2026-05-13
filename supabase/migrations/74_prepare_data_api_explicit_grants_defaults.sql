-- =====================================================
-- تجهيز المشروع لسلوك Supabase: منح Data API صريح لكل جدول جديد في public
-- المرجع الرسمي (الجدول الزمني حتى 2026-10-30):
--   https://supabase.com/changelog/45329-breaking-change-tables-not-exposed-to-data-and-graphql-api-automatically
--
-- ماذا يفعل هذا الملف؟
-- - يوقف المنح الافتراضية التلقائية لـ anon / authenticated / service_role على
--   الجداول والتسلسلات التي ينشئها دور postgres في المخطط public مستقبلاً.
-- - الجداول والكائنات الموجودة مسبقاً لا تُغيّر صلاحياتها بهذه الأوامر.
--
-- ماذا يلزم بعد ذلك؟
-- - مع كل CREATE TABLE / VIEW / FUNCTION تُعرض عبر PostgREST أضف في نفس migration
--   أوامر GRANT المناسبة (مثال في وثائق Supabase أعلاه).
-- - RLS يبقى طبقة منفصلة؛ بدون GRANT لن يصل PostgREST للجدول أصلاً.
-- =====================================================

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  REVOKE SELECT, INSERT, UPDATE, DELETE ON TABLES FROM anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  REVOKE USAGE, SELECT ON SEQUENCES FROM anon, authenticated, service_role;

-- =====================================================
-- جداول تُدار من خادم التطبيق (service role) ولم تُذكر فيها GRANT في migrations الإنشاء
-- يضمن بقاءها قابلة للوصول عبر PostgREST بعد تعطيل المنح التلقائية،
-- مع سحب صلاحيات anon/authenticated حيث لا يُقصد الوصول من العميل.
-- =====================================================

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.partner_tutorial_videos TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.partner_promo_video_config TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.platform_payment_settings TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.platform_ops_billing_commitments TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.platform_ops_billing_poll_state TO service_role;

REVOKE ALL ON TABLE public.partner_tutorial_videos FROM anon, authenticated;
REVOKE ALL ON TABLE public.partner_promo_video_config FROM anon, authenticated;
REVOKE ALL ON TABLE public.platform_payment_settings FROM anon, authenticated;
REVOKE ALL ON TABLE public.platform_ops_billing_commitments FROM anon, authenticated;
REVOKE ALL ON TABLE public.platform_ops_billing_poll_state FROM anon, authenticated;
