-- أرشيف فواتير ووثائق مالية للإدارة: حاوية خاصة + جدول بيانات وصفية + RLS حسب صلاحيات JWT
-- التحميل/الرفع عبر Vercel API بـ service role؛ الاستعلام من المتصفح مسموح بـ RLS للمشرفين.

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'admin-financial-archive',
  'admin-financial-archive',
  false,
  15728640,
  ARRAY['application/pdf', 'image/png', 'image/jpeg', 'image/webp']::text[]
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

CREATE TABLE IF NOT EXISTS public.platform_admin_financial_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  storage_bucket text NOT NULL DEFAULT 'admin-financial-archive',
  storage_object_path text NOT NULL,

  original_filename text NOT NULL,
  content_type text NOT NULL,
  file_size_bytes bigint NOT NULL CHECK (file_size_bytes >= 0 AND file_size_bytes <= 15728640),
  file_sha256 text,

  archive_label text NOT NULL,
  invoice_number text,
  vendor text NOT NULL
    CHECK (
      vendor IN (
        'vercel',
        'supabase_mgmt',
        'github',
        'godaddy',
        'manual',
        'openai',
        'resend',
        'other'
      )
    ),

  service_period_start date,
  service_period_end date,
  invoice_date date,

  amount numeric,
  currency text NOT NULL DEFAULT 'USD',

  commitment_id uuid REFERENCES public.platform_ops_billing_commitments (id) ON DELETE SET NULL,
  /** وقت آخر تطبيق «مزامنة التزام» من هذه الوثيقة */
  sync_applied_at timestamptz,

  notes text,

  uploaded_by_email text NOT NULL,
  uploaded_at timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT platform_admin_financial_documents_bucket_path_uidx UNIQUE (storage_bucket, storage_object_path)
);

CREATE INDEX IF NOT EXISTS platform_admin_financial_documents_uploaded_idx
  ON public.platform_admin_financial_documents (uploaded_at DESC);
CREATE INDEX IF NOT EXISTS platform_admin_financial_documents_vendor_idx
  ON public.platform_admin_financial_documents (vendor);
CREATE INDEX IF NOT EXISTS platform_admin_financial_documents_commitment_idx
  ON public.platform_admin_financial_documents (commitment_id)
  WHERE commitment_id IS NOT NULL;

COMMENT ON TABLE public.platform_admin_financial_documents IS
  'أرشيف فواتير/وثائق مالية للإدارة — مسار التخزين في admin-financial-archive؛ التتبع: من رفع، متى، وبيانات أرشيفية.';

ALTER TABLE public.platform_admin_financial_documents ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.platform_admin_financial_documents TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.platform_admin_financial_documents TO authenticated;
REVOKE ALL ON public.platform_admin_financial_documents FROM anon;

DROP POLICY IF EXISTS "platform_admin_financial_documents_select" ON public.platform_admin_financial_documents;
CREATE POLICY "platform_admin_financial_documents_select"
  ON public.platform_admin_financial_documents
  FOR SELECT
  TO authenticated
  USING (
    public.is_bootstrap_platform_admin()
    OR public.jwt_platform_admin_has_permission('view_admin_financial_archive')
    OR public.jwt_platform_admin_has_permission('manage_admin_financial_archive')
    OR public.jwt_platform_admin_has_permission('manage_centralized_billing_ops')
  );

DROP POLICY IF EXISTS "platform_admin_financial_documents_insert" ON public.platform_admin_financial_documents;
CREATE POLICY "platform_admin_financial_documents_insert"
  ON public.platform_admin_financial_documents
  FOR INSERT
  TO authenticated
  WITH CHECK (
    public.is_bootstrap_platform_admin()
    OR public.jwt_platform_admin_has_permission('manage_admin_financial_archive')
    OR public.jwt_platform_admin_has_permission('manage_centralized_billing_ops')
  );

DROP POLICY IF EXISTS "platform_admin_financial_documents_update" ON public.platform_admin_financial_documents;
CREATE POLICY "platform_admin_financial_documents_update"
  ON public.platform_admin_financial_documents
  FOR UPDATE
  TO authenticated
  USING (
    public.is_bootstrap_platform_admin()
    OR public.jwt_platform_admin_has_permission('manage_admin_financial_archive')
    OR public.jwt_platform_admin_has_permission('manage_centralized_billing_ops')
  )
  WITH CHECK (
    public.is_bootstrap_platform_admin()
    OR public.jwt_platform_admin_has_permission('manage_admin_financial_archive')
    OR public.jwt_platform_admin_has_permission('manage_centralized_billing_ops')
  );

DROP POLICY IF EXISTS "platform_admin_financial_documents_delete" ON public.platform_admin_financial_documents;
CREATE POLICY "platform_admin_financial_documents_delete"
  ON public.platform_admin_financial_documents
  FOR DELETE
  TO authenticated
  USING (
    public.is_bootstrap_platform_admin()
    OR public.jwt_platform_admin_has_permission('manage_admin_financial_archive')
    OR public.jwt_platform_admin_has_permission('manage_centralized_billing_ops')
  );

-- دمج مفاتيح الأرشيف في صفوف الأدمن الحالية
UPDATE public.platform_admin_roles
SET permissions = permissions || jsonb_build_object(
  'view_admin_financial_archive', false,
  'manage_admin_financial_archive', false
)
WHERE NOT (permissions ? 'view_admin_financial_archive');

UPDATE public.platform_admin_roles
SET permissions = permissions || jsonb_build_object(
  'view_admin_financial_archive', true,
  'manage_admin_financial_archive', true
)
WHERE (permissions->>'manage_centralized_billing_ops')::boolean IS true
   OR (permissions->>'manage_admins')::boolean IS true;
