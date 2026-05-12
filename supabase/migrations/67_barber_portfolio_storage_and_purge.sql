-- =====================================================
-- معرض أعمال الحلاق: حاوية تخزين عامة للقراءة + مسح تلقائي عند حذف صف الحلاق
-- =====================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('barber-portfolio', 'barber-portfolio', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "public_read_barber_portfolio" ON storage.objects;
CREATE POLICY "public_read_barber_portfolio"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'barber-portfolio');

COMMENT ON POLICY "public_read_barber_portfolio" ON storage.objects IS
  'قراءة عامة لصور معرض الحلاقين — الرفع/الحذف عبر خادم التطبيق (service role).';


CREATE OR REPLACE FUNCTION public.get_platform_resource_snapshot()
RETURNS jsonb
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = public, storage
AS $$
BEGIN
  IF NOT public.is_jwt_platform_admin() THEN
    RAISE EXCEPTION 'forbidden' USING ERRCODE = '42501';
  END IF;

  RETURN jsonb_build_object(
    'generated_at', to_jsonb(now()),
    'registration_uploads', (
      SELECT COALESCE(
        jsonb_build_object(
          'object_count', COUNT(*)::bigint,
          'approx_bytes', COALESCE(
            SUM(COALESCE(NULLIF(o.metadata->>'size', '')::bigint, 0::bigint)),
            0::bigint
          ),
          'banner_object_count', COUNT(*) FILTER (WHERE o.name LIKE '%/banners/%')::bigint
        ),
        '{"object_count":0,"approx_bytes":0,"banner_object_count":0}'::jsonb
      )
      FROM storage.objects o
      WHERE o.bucket_id = 'registration-uploads'
    ),
    'partner_promo', (
      SELECT COALESCE(
        jsonb_build_object(
          'object_count', COUNT(*)::bigint,
          'approx_bytes', COALESCE(
            SUM(COALESCE(NULLIF(o.metadata->>'size', '')::bigint, 0::bigint)),
            0::bigint
          )
        ),
        '{"object_count":0,"approx_bytes":0}'::jsonb
      )
      FROM storage.objects o
      WHERE o.bucket_id = 'partner-promo'
    ),
    'barber_portfolio', (
      SELECT COALESCE(
        jsonb_build_object(
          'object_count', COUNT(*)::bigint,
          'approx_bytes', COALESCE(
            SUM(COALESCE(NULLIF(o.metadata->>'size', '')::bigint, 0::bigint)),
            0::bigint
          )
        ),
        '{"object_count":0,"approx_bytes":0}'::jsonb
      )
      FROM storage.objects o
      WHERE o.bucket_id = 'barber-portfolio'
    ),
    'logs', jsonb_build_object(
      'search_activity_logs_count', (SELECT COUNT(*)::bigint FROM public.search_activity_logs),
      'payment_security_events_count', (SELECT COUNT(*)::bigint FROM public.payment_security_events)
    )
  );
END;
$$;

COMMENT ON FUNCTION public.get_platform_resource_snapshot() IS
  'لقطة تخزين وسجلات — لأعضاء الإدارة JWT. يشمل barber-portfolio (معرض أعمال الحلاقين).';


CREATE OR REPLACE FUNCTION public.purge_barber_portfolio_storage_before_barber_delete()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, storage
AS $$
BEGIN
  DELETE FROM storage.objects
  WHERE bucket_id = 'barber-portfolio'
    AND name LIKE (OLD.id::text || '/%');
  RETURN OLD;
END;
$$;

COMMENT ON FUNCTION public.purge_barber_portfolio_storage_before_barber_delete() IS
  'قبل حذف صف الحلاق: حذف كل ملفات معرض الأعمال لهذا المعرف من التخزين.';

DROP TRIGGER IF EXISTS trg_purge_barber_portfolio_before_barber_delete ON public.barbers;
CREATE TRIGGER trg_purge_barber_portfolio_before_barber_delete
  BEFORE DELETE ON public.barbers
  FOR EACH ROW
  EXECUTE FUNCTION public.purge_barber_portfolio_storage_before_barber_delete();
