-- بروتوكول الخصوصية: إزالة مفاتيح روابط الوثائق الحكومية من حقل payload في طلبات التسجيل (JSONB).
-- لم تكن هناك أعمدة منفصلة في جدول barbers لهذه الروابط؛ القيم كانت ضمن registrationAttachmentUrls داخل payload.
-- يُنفَّذ مرة واحدة بأمان: يحدّث الصفوف التي تحتوي المفتاح فقط.

UPDATE public.registration_submissions
SET payload =
  CASE
    WHEN payload ? 'registrationAttachmentUrls' THEN
      jsonb_set(
        payload,
        '{registrationAttachmentUrls}',
        (payload->'registrationAttachmentUrls')
          - 'commercialRegistry'
          - 'municipalLicense'
          - 'healthCertificates',
        true
      )
    ELSE payload
  END
WHERE payload ? 'registrationAttachmentUrls';
