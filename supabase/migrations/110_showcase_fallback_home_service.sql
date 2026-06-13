-- =====================================================
-- RPC المعاينة: حقول زيارة منزلية في صف fallback
-- =====================================================

CREATE OR REPLACE FUNCTION public.get_public_showcase_fallback()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
DECLARE
  v_settings public.platform_showcase_settings%ROWTYPE;
  v_barber public.barbers%ROWTYPE;
BEGIN
  SELECT * INTO v_settings FROM public.platform_showcase_settings WHERE id = 1;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('available', false, 'reason', 'not_found');
  END IF;

  IF COALESCE(v_settings.map_visible, false) IS NOT TRUE
     OR COALESCE(v_settings.fallback_when_empty, false) IS NOT TRUE
     OR v_settings.barber_id IS NULL THEN
    RETURN jsonb_build_object('available', false, 'reason', 'disabled');
  END IF;

  SELECT * INTO v_barber
  FROM public.barbers b
  WHERE b.id = v_settings.barber_id
    AND COALESCE(b.is_showcase_preview, false) IS TRUE
    AND b.is_active IS TRUE
    AND b.latitude IS NOT NULL
    AND b.longitude IS NOT NULL;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('available', false, 'reason', 'not_configured');
  END IF;

  RETURN jsonb_build_object(
    'available', true,
    'education_intro_ar', v_settings.education_intro_ar,
    'row', jsonb_build_object(
      'id', v_barber.id,
      'name', v_barber.name,
      'phone', v_barber.phone,
      'latitude', v_barber.latitude::double precision,
      'longitude', v_barber.longitude::double precision,
      'address', v_barber.address,
      'tier', v_barber.tier,
      'rating', v_barber.rating,
      'total_reviews', v_barber.total_reviews,
      'profile_image', v_barber.profile_image,
      'cover_image', v_barber.cover_image,
      'is_active', v_barber.is_active,
      'is_verified', v_barber.is_verified,
      'open_for_customers', COALESCE(v_barber.open_for_customers, true),
      'specialties', COALESCE(to_jsonb(v_barber.specialties), '[]'::jsonb),
      'children_specialist', COALESCE(v_barber.children_specialist, false),
      'home_service_offered', COALESCE(v_barber.home_service_offered, false),
      'home_service_price_sar', v_barber.home_service_price_sar,
      'home_service_radius_km', v_barber.home_service_radius_km,
      'home_service_public_visible', COALESCE(v_barber.home_service_public_visible, true),
      'home_service_customer_note', v_barber.home_service_customer_note,
      'gallery_count', COALESCE(v_barber.gallery_count, 0),
      'featured_images', COALESCE(v_barber.featured_images, '[]'::jsonb),
      'is_showcase_preview', true,
      'has_active_subscription', true
    )
  );
END;
$$;

COMMENT ON FUNCTION public.get_public_showcase_fallback IS
  'يعيد حلاق المعاينة + home_service + children_specialist عند fallback.';

REVOKE ALL ON FUNCTION public.get_public_showcase_fallback() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_public_showcase_fallback() TO anon, authenticated, service_role;
