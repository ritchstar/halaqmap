-- =====================================================
-- تجهيز عريس (ماسي فقط): إعلان + بحث جغرافي + fallback
-- =====================================================

ALTER TABLE public.barbers
  ADD COLUMN IF NOT EXISTS groom_prep_offered boolean NOT NULL DEFAULT false;

ALTER TABLE public.barbers
  ADD COLUMN IF NOT EXISTS groom_prep_price_sar numeric;

ALTER TABLE public.barbers
  ADD COLUMN IF NOT EXISTS groom_prep_public_visible boolean NOT NULL DEFAULT true;

ALTER TABLE public.barbers
  ADD COLUMN IF NOT EXISTS groom_prep_customer_note text;

COMMENT ON COLUMN public.barbers.groom_prep_offered IS
  'الحلاق يعلن توفير تجهيز عريس — ماسي فقط في لوحة التحكم.';

COMMENT ON COLUMN public.barbers.groom_prep_price_sar IS
  'سعر إرشادي معروض للعميل (ريال) عند تفعيل تجهيز العريس.';

COMMENT ON COLUMN public.barbers.groom_prep_public_visible IS
  'إخفاء مؤقت عن بطاقة العرض دون حذف الإعدادات.';

COMMENT ON COLUMN public.barbers.groom_prep_customer_note IS
  'ملاحظة للعميل (شروط، تنسيق مسبق، …) — لا عنوان دقيق.';

DROP VIEW IF EXISTS public.barbers_public_directory CASCADE;

CREATE VIEW public.barbers_public_directory AS
SELECT
  b.*,
  true AS has_active_subscription
FROM public.barbers b
WHERE b.is_active = true
  AND COALESCE(b.is_showcase_preview, false) = false
  AND public.barber_has_active_listing(b.id);

COMMENT ON VIEW public.barbers_public_directory IS
  'حلاق يظهر على الخريطة: نشط + إدراج ساري — باستثناء is_showcase_preview (fallback منفصل).';

GRANT SELECT ON public.barbers_public_directory TO anon, authenticated, service_role;

ALTER VIEW public.barbers_public_directory SET (security_invoker = true);

DROP FUNCTION IF EXISTS public.search_barbers_nearby(
  double precision,
  double precision,
  double precision,
  integer,
  integer,
  text[],
  numeric
);

CREATE OR REPLACE FUNCTION public.search_barbers_nearby(
  p_lat double precision,
  p_lng double precision,
  p_radius_km double precision DEFAULT 25,
  p_limit integer DEFAULT 120,
  p_offset integer DEFAULT 0,
  p_tiers text[] DEFAULT NULL,
  p_min_rating numeric DEFAULT 0
)
RETURNS TABLE (
  id uuid,
  name text,
  phone text,
  latitude double precision,
  longitude double precision,
  address text,
  tier text,
  rating numeric,
  total_reviews integer,
  profile_image text,
  cover_image text,
  is_active boolean,
  is_verified boolean,
  account_linked boolean,
  open_for_customers boolean,
  specialties text[],
  inclusive_care_offered boolean,
  inclusive_care_price_sar numeric,
  inclusive_care_public_visible boolean,
  inclusive_care_restrict_days boolean,
  inclusive_care_days jsonb,
  inclusive_care_customer_note text,
  children_specialist boolean,
  home_service_offered boolean,
  home_service_price_sar numeric,
  home_service_radius_km integer,
  home_service_public_visible boolean,
  home_service_customer_note text,
  groom_prep_offered boolean,
  groom_prep_price_sar numeric,
  groom_prep_public_visible boolean,
  groom_prep_customer_note text,
  has_active_subscription boolean,
  profile_updated_at timestamptz,
  gallery_count integer,
  featured_images jsonb,
  distance_km double precision,
  rank_score double precision,
  is_showcase_preview boolean
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
WITH user_point AS (
  SELECT ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography AS g
),
base AS (
  SELECT
    b.id,
    b.name,
    b.phone,
    b.latitude,
    b.longitude,
    b.address,
    b.tier,
    b.rating,
    b.total_reviews,
    b.profile_image,
    b.cover_image,
    b.is_active,
    b.is_verified,
    b.user_id,
    b.open_for_customers,
    b.specialties,
    b.inclusive_care_offered,
    b.inclusive_care_price_sar,
    b.inclusive_care_public_visible,
    b.inclusive_care_restrict_days,
    b.inclusive_care_days,
    b.inclusive_care_customer_note,
    COALESCE(b.children_specialist, false) AS children_specialist,
    COALESCE(b.home_service_offered, false) AS home_service_offered,
    b.home_service_price_sar,
    b.home_service_radius_km,
    COALESCE(b.home_service_public_visible, true) AS home_service_public_visible,
    b.home_service_customer_note,
    COALESCE(b.groom_prep_offered, false) AS groom_prep_offered,
    b.groom_prep_price_sar,
    COALESCE(b.groom_prep_public_visible, true) AS groom_prep_public_visible,
    b.groom_prep_customer_note,
    COALESCE(b.gallery_count, 0) AS gallery_count,
    COALESCE(b.featured_images, '[]'::jsonb) AS featured_images,
    COALESCE(b.updated_at, b.created_at) AS last_activity_at,
    true AS has_active_subscription,
    ST_Distance(loc.g, u.g) / 1000.0 AS distance_km
  FROM public.barbers_public_directory b
  CROSS JOIN user_point u
  CROSS JOIN LATERAL (
    SELECT COALESCE(
      b.location,
      CASE
        WHEN b.latitude IS NOT NULL AND b.longitude IS NOT NULL
          THEN ST_SetSRID(ST_MakePoint(b.longitude, b.latitude), 4326)::geography
        ELSE NULL
      END
    ) AS g
  ) loc
  WHERE loc.g IS NOT NULL
    AND ST_DWithin(loc.g, u.g, GREATEST(1, COALESCE(p_radius_km, 25)) * 1000)
    AND (p_tiers IS NULL OR array_length(p_tiers, 1) IS NULL OR b.tier = ANY (p_tiers))
    AND COALESCE(b.rating, 0) >= COALESCE(p_min_rating, 0)
),
real_results AS (
  SELECT
    b.id,
    b.name,
    b.phone,
    b.latitude,
    b.longitude,
    b.address,
    b.tier,
    b.rating,
    b.total_reviews,
    b.profile_image,
    b.cover_image,
    b.is_active,
    b.is_verified,
    (b.user_id IS NOT NULL) AS account_linked,
    COALESCE(b.open_for_customers, true) AS open_for_customers,
    b.specialties,
    b.inclusive_care_offered,
    b.inclusive_care_price_sar,
    b.inclusive_care_public_visible,
    b.inclusive_care_restrict_days,
    b.inclusive_care_days,
    b.inclusive_care_customer_note,
    b.children_specialist,
    b.home_service_offered,
    b.home_service_price_sar,
    b.home_service_radius_km,
    b.home_service_public_visible,
    b.home_service_customer_note,
    b.groom_prep_offered,
    b.groom_prep_price_sar,
    b.groom_prep_public_visible,
    b.groom_prep_customer_note,
    b.has_active_subscription,
    b.last_activity_at AS profile_updated_at,
    b.gallery_count,
    b.featured_images,
    b.distance_km,
    (
      (1000000.0::double precision - LEAST(b.distance_km, 999999.0::double precision))
      + CASE WHEN COALESCE(b.open_for_customers, true) THEN 0.99::double precision ELSE 0.0::double precision END
    ) AS rank_score,
    false AS is_showcase_preview
  FROM base b
  ORDER BY b.distance_km ASC, COALESCE(b.open_for_customers, true) DESC
  LIMIT LEAST(200, GREATEST(1, COALESCE(p_limit, 120)))
  OFFSET GREATEST(0, COALESCE(p_offset, 0))
),
showcase_settings AS (
  SELECT ps.*
  FROM public.platform_showcase_settings ps
  WHERE ps.id = 1
    AND COALESCE(ps.map_visible, false) IS TRUE
    AND COALESCE(ps.fallback_when_empty, false) IS TRUE
    AND ps.barber_id IS NOT NULL
),
showcase_row AS (
  SELECT
    sb.id,
    sb.name,
    sb.phone,
    sb.latitude::double precision AS latitude,
    sb.longitude::double precision AS longitude,
    sb.address,
    sb.tier,
    sb.rating,
    sb.total_reviews,
    sb.profile_image,
    sb.cover_image,
    sb.is_active,
    sb.is_verified,
    (sb.user_id IS NOT NULL) AS account_linked,
    COALESCE(sb.open_for_customers, true) AS open_for_customers,
    sb.specialties,
    sb.inclusive_care_offered,
    sb.inclusive_care_price_sar,
    sb.inclusive_care_public_visible,
    sb.inclusive_care_restrict_days,
    sb.inclusive_care_days,
    sb.inclusive_care_customer_note,
    COALESCE(sb.children_specialist, false) AS children_specialist,
    COALESCE(sb.home_service_offered, false) AS home_service_offered,
    sb.home_service_price_sar,
    sb.home_service_radius_km,
    COALESCE(sb.home_service_public_visible, true) AS home_service_public_visible,
    sb.home_service_customer_note,
    COALESCE(sb.groom_prep_offered, false) AS groom_prep_offered,
    sb.groom_prep_price_sar,
    COALESCE(sb.groom_prep_public_visible, true) AS groom_prep_public_visible,
    sb.groom_prep_customer_note,
    true AS has_active_subscription,
    COALESCE(sb.updated_at, sb.created_at) AS profile_updated_at,
    COALESCE(sb.gallery_count, 0) AS gallery_count,
    COALESCE(sb.featured_images, '[]'::jsonb) AS featured_images,
    CASE
      WHEN sb.latitude IS NOT NULL AND sb.longitude IS NOT NULL THEN
        ST_Distance(
          ST_SetSRID(ST_MakePoint(sb.longitude, sb.latitude), 4326)::geography,
          (SELECT g FROM user_point)
        ) / 1000.0
      ELSE 0.0
    END AS distance_km,
    999999.99::double precision AS rank_score,
    true AS is_showcase_preview
  FROM showcase_settings ss
  JOIN public.barbers sb ON sb.id = ss.barber_id
  WHERE COALESCE(sb.is_showcase_preview, false) IS TRUE
    AND sb.is_active IS TRUE
    AND sb.latitude IS NOT NULL
    AND sb.longitude IS NOT NULL
    AND (
      p_tiers IS NULL
      OR array_length(p_tiers, 1) IS NULL
      OR sb.tier = ANY (p_tiers)
    )
    AND COALESCE(sb.rating, 0) >= COALESCE(p_min_rating, 0)
)
SELECT * FROM real_results
UNION ALL
SELECT sr.* FROM showcase_row sr
WHERE NOT EXISTS (SELECT 1 FROM real_results);
$$;

REVOKE ALL ON FUNCTION public.search_barbers_nearby(
  double precision,
  double precision,
  double precision,
  integer,
  integer,
  text[],
  numeric
) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.search_barbers_nearby(
  double precision,
  double precision,
  double precision,
  integer,
  integer,
  text[],
  numeric
) TO anon, authenticated, service_role;

COMMENT ON FUNCTION public.search_barbers_nearby IS
  'بحث جغرافي + حقن المعاينة + home_service + groom_prep.';

-- =====================================================
-- RPC المعاينة: حقول تجهيز عريس في صف fallback
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
      'groom_prep_offered', COALESCE(v_barber.groom_prep_offered, false),
      'groom_prep_price_sar', v_barber.groom_prep_price_sar,
      'groom_prep_public_visible', COALESCE(v_barber.groom_prep_public_visible, true),
      'groom_prep_customer_note', v_barber.groom_prep_customer_note,
      'gallery_count', COALESCE(v_barber.gallery_count, 0),
      'featured_images', COALESCE(v_barber.featured_images, '[]'::jsonb),
      'is_showcase_preview', true,
      'has_active_subscription', true
    )
  );
END;
$$;

COMMENT ON FUNCTION public.get_public_showcase_fallback IS
  'يعيد حلاق المعاينة + home_service + groom_prep + children_specialist عند fallback.';

REVOKE ALL ON FUNCTION public.get_public_showcase_fallback() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_public_showcase_fallback() TO anon, authenticated, service_role;
