-- إضافة مزوّد openai لجدول التزامات التشغيل (فوترة منظّمة OpenAI)

ALTER TABLE public.platform_ops_billing_commitments
  DROP CONSTRAINT IF EXISTS platform_ops_billing_commitments_vendor_check;

ALTER TABLE public.platform_ops_billing_commitments
  ADD CONSTRAINT platform_ops_billing_commitments_vendor_check
  CHECK (
    vendor IN (
      'vercel',
      'supabase_mgmt',
      'github',
      'godaddy',
      'manual',
      'openai'
    )
  );
