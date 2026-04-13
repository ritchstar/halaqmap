-- =====================================================
-- رفع حد حجم payload لطلبات التسجيل (روابط مرفقات + حقول نصية)
-- نفّذ بعد 14_registration_submissions_public.sql
-- القيمة السابقة: 1 ميجابايت — قد تُرفض الطلبات الكبيرة دون رسالة واضحة في الواجهة
-- =====================================================

DROP POLICY IF EXISTS "anon_insert_registration_submissions" ON public.registration_submissions;
CREATE POLICY "anon_insert_registration_submissions"
  ON public.registration_submissions
  FOR INSERT
  TO anon
  WITH CHECK (
    char_length(id) <= 80
    AND octet_length(payload::text) <= 5242880
  );
