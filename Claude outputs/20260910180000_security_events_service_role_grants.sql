-- Copyright © 2026 HalaqMap. All Rights Reserved.
-- =====================================================================
-- Fix: security_events / security_block_list — missing service_role grants
-- =====================================================================
-- سبب المشكلة:
-- تم إنشاء الجدولين في ترحيل 89 (security_protection.sql) بعد أن ألغى
-- الترحيل 74 (prepare_data_api_explicit_grants_defaults.sql) المنح الافتراضية
-- التلقائية لأي جدول جديد في مخطط public — لجميع الأدوار بما فيها service_role.
-- الترحيل 89 أضاف سياسات RLS فقط (service_role_all_*) لكنه لم يضِف عبارات
-- GRANT الصريحة المطلوبة بعد هذا التغيير. RLS طبقة منفصلة عن صلاحيات الجدول
-- الأساسية (GRANT) — بدون GRANT لا يصل أي دور للجدول عبر PostgREST/Data API،
-- حتى service_role نفسه.
--
-- الأثر الفعلي:
-- كل استدعاء من الخادم عبر supabase-js بمفتاح service_role
-- (api/_lib/securityGuard.ts, api/admin-security-action.ts,
--  api/admin-security-agents.ts) كان يفشل بخطأ
-- "permission denied for table security_events" /
-- "permission denied for table security_block_list" — وهو مصدر الغالبية
-- العظمى من أخطاء Postgres المرصودة.
--
-- الإصلاح: نفس النمط المستخدم فعلياً لجداول مشابهة (74/99 مع
-- payment_security_events وغيرها).
-- =====================================================================

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.security_events TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.security_block_list TO service_role;

-- دفاع بالعمق: يبقى الجدولان مغلقين تماماً أمام anon/authenticated
-- (تم سحبهما فعلاً في الترحيل 120 — نكررها هنا للوضوح ولضمان التوافق idempotent).
REVOKE ALL ON TABLE public.security_events FROM anon, authenticated;
REVOKE ALL ON TABLE public.security_block_list FROM anon, authenticated;
