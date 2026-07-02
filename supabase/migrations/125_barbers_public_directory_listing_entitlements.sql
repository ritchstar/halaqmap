-- =====================================================
-- إصلاح عرض البحث العام: barber_listing_entitlements بدل subscriptions
-- migrations 109 / 113 / 119 / 20260611060100 أعادت العرض للمنطق القديم
-- بينما مسار الدفع الحالي يكتب في barber_listing_entitlements فقط.
-- =====================================================

CREATE OR REPLACE FUNCTION public.barber_has_active_listing(p_barber_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.barber_listing_entitlements e
    WHERE e.barber_id = p_barber_id
      AND e.valid_until > NOW()
      AND e.revoked_at IS NULL
  );
$$;

COMMENT ON FUNCTION public.barber_has_active_listing IS
  'صلاحية إدراج نشطة: valid_until في المستقبل وغير ملغاة.';

CREATE OR REPLACE VIEW public.barbers_public_directory AS
SELECT
  b.*,
  true AS has_active_subscription
FROM public.barbers b
WHERE b.is_active = true
  AND COALESCE(b.is_showcase_preview, false) IS NOT TRUE
  AND (
    public.barber_has_active_listing(b.id)
    OR EXISTS (
      SELECT 1
      FROM public.subscriptions s
      WHERE s.barber_id = b.id
        AND s.status = 'active'
        AND s.end_date >= CURRENT_DATE
    )
  );

COMMENT ON VIEW public.barbers_public_directory IS
  'حلاق يظهر على الخريطة/البحث العام: نشط + إدراج ساري (entitlements) أو اشتراك legacy في subscriptions — يستثني عرض المنصة التوضيحي.';

GRANT SELECT ON public.barbers_public_directory TO anon, authenticated, service_role;

ALTER VIEW public.barbers_public_directory SET (security_invoker = true);
