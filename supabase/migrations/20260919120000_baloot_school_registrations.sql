-- Copyright © 2026 HalaqMap. All Rights Reserved.
-- مدرسة البلوت (منتج تعليمي رقمي مستقل، 199 ر.س) — المرحلة ١: التسجيل وتأكيد البريد.
-- جدول مستقل تماماً عن ساحة بلوت المجانية (/baloot) وعن مدرسة الشطرنج وكل منتجات
-- "المتجر" — لا يشاركها أي قيد. يطابق بنية chess_school_registrations حرفياً.

CREATE TABLE IF NOT EXISTS public.baloot_school_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  status TEXT NOT NULL DEFAULT 'pending_email'
    CHECK (status IN ('pending_email', 'email_confirmed', 'cancelled')),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  email_confirmed_at TIMESTAMPTZ,
  confirm_email_sent_at TIMESTAMPTZ,
  confirm_email_send_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT baloot_school_registrations_email_len
    CHECK (char_length(trim(email)) BETWEEN 5 AND 200),
  CONSTRAINT baloot_school_registrations_name_len
    CHECK (char_length(trim(full_name)) BETWEEN 2 AND 120)
);

COMMENT ON TABLE public.baloot_school_registrations IS
  'مدرسة البلوت — تسجيل بالاسم والبريد + تأكيد بريد حقيقي عبر Resend (نفس نمط chess_school_registrations). المرحلة التالية (الدفع 199 ر.س عبر Moyasar + الصفحة الخاصة) تُضاف بعمود لاحق منفصل — لا تُسبق هنا.';

CREATE INDEX IF NOT EXISTS baloot_school_registrations_status_idx
  ON public.baloot_school_registrations (status, created_at DESC);

CREATE INDEX IF NOT EXISTS baloot_school_registrations_email_idx
  ON public.baloot_school_registrations (lower(email));

ALTER TABLE public.baloot_school_registrations ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.baloot_school_registrations FROM PUBLIC;
REVOKE ALL ON TABLE public.baloot_school_registrations FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.baloot_school_registrations TO service_role;

DROP POLICY IF EXISTS baloot_school_registrations_service_role ON public.baloot_school_registrations;
CREATE POLICY baloot_school_registrations_service_role
  ON public.baloot_school_registrations
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

NOTIFY pgrst, 'reload schema';
