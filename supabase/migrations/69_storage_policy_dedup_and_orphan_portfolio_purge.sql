-- =====================================================
-- 69: إزالة تكرار سياسات القراءة على barber-images + تنظيف يتيمة معرض الأعمال
-- =====================================================

-- سياسة قديمة من migration 13 (نفس التأثير تقريباً لـ public_read_barber_images في 68) — إزالتها تمنع ازدواجية/التباس في النشر
DROP POLICY IF EXISTS "Anyone can view images" ON storage.objects;

-- تنظيف يدوي/دوري: حذف كائنات barber-portfolio التي لا تطابق أي صف في barbers (ملفات يتيمة بعد فشل رفع، إلخ)
CREATE OR REPLACE FUNCTION public.admin_purge_orphan_barber_portfolio_objects()
RETURNS jsonb
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = public, storage
AS $$
DECLARE
  n bigint;
BEGIN
  IF NOT public.is_bootstrap_platform_admin() THEN
    RAISE EXCEPTION 'forbidden' USING ERRCODE = '42501';
  END IF;

  DELETE FROM storage.objects o
  WHERE o.bucket_id = 'barber-portfolio'
    AND NOT EXISTS (
      SELECT 1
      FROM public.barbers b
      WHERE o.name LIKE (b.id::text || '/%')
    );

  GET DIAGNOSTICS n = ROW_COUNT;
  RETURN jsonb_build_object('bucket', 'barber-portfolio', 'deleted_orphan_rows', n);
END;
$$;

COMMENT ON FUNCTION public.admin_purge_orphan_barber_portfolio_objects() IS
  'حذف كائنات معرض أعمال لا ترتبط بأي حلاق (يتيمة) — للمالك bootstrap فقط.';

REVOKE ALL ON FUNCTION public.admin_purge_orphan_barber_portfolio_objects() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_purge_orphan_barber_portfolio_objects() TO authenticated;
