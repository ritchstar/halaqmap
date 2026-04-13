-- =====================================================
-- سياسة إدراج مبسّطة — مرفقات التسجيل في التخزين
-- يستبدل أي سياسة سابقة كانت تفرض شكلاً على المسار (foldername / split_part / regex)
-- لأن ذلك تسبب برفض رفع شرعي من الواجهة في بيئات Supabase مختلفة.
--
-- الأمان التشغيلي: الحاوية registration-uploads مخصصة لهذا المسار فقط؛ لا تُستخدم لبيانات الحلاقين المصدّقة.
-- نفّذ في SQL Editor إذا استمر رفض الرفع بعد التحديثات السابقة.
-- =====================================================

DROP POLICY IF EXISTS "anon_insert_registration_uploads" ON storage.objects;
CREATE POLICY "anon_insert_registration_uploads"
  ON storage.objects FOR INSERT TO anon
  WITH CHECK (bucket_id = 'registration-uploads');
