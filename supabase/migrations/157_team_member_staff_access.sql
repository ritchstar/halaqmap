-- Copyright © 2026 HalaqMap. All Rights Reserved.
-- =====================================================
-- رابط سري لصفحة حجوزات الطاقم + رقم واتساب للتنبيه اليدوي
-- =====================================================

ALTER TABLE public.barber_team_members
  ADD COLUMN IF NOT EXISTS staff_access_token text,
  ADD COLUMN IF NOT EXISTS notify_phone text;

COMMENT ON COLUMN public.barber_team_members.staff_access_token IS
  'رمز سري طويل لصفحة متابعة حجوزات الحلاق (بدون حساب بوابة). قابل لإعادة الإصدار.';

COMMENT ON COLUMN public.barber_team_members.notify_phone IS
  'جوال واتساب اختياري لعضو الطاقم — يستخدمه المالك لنبضة يدوية فقط.';

-- فهرس فريد للبحث بالتوكن (القيم الفارغة لا تُفهرس)
CREATE UNIQUE INDEX IF NOT EXISTS barber_team_members_staff_access_token_uidx
  ON public.barber_team_members (staff_access_token)
  WHERE staff_access_token IS NOT NULL;

-- توليد توكنات للأعضاء الحاليين بدون رمز
UPDATE public.barber_team_members
SET staff_access_token = encode(gen_random_bytes(32), 'hex'),
    updated_at = now()
WHERE staff_access_token IS NULL OR btrim(staff_access_token) = '';

-- لا نعرض أعمدة الطاقم الحساسة عبر anon/authenticated مباشرة.
-- واجهة الحجز العامة تستخدم service_role فقط.
DROP POLICY IF EXISTS "Public can read active team members" ON public.barber_team_members;

REVOKE SELECT ON TABLE public.barber_team_members FROM anon, authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.barber_team_members TO service_role;
