-- =====================================================
-- حلاقة الأطفال: متخصص + بحث جغرافي
-- =====================================================

ALTER TABLE public.barbers
  ADD COLUMN IF NOT EXISTS children_specialist boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN public.barbers.children_specialist IS
  'عند true مع وجود حلاقة أطفال في specialties: بطاقة متخصص أطفال للجمهور.';

-- العرض barbers_public_directory يُجمّد قائمة أعمدة b.* — يجب إعادة بنائه بعد ADD COLUMN
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
  'بحث جغرافي + حقن المعاينة + children_specialist لمتخصصي الأطفال.';
