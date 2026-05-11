-- =====================================================
-- عرض الخريطة/البحث: مصفاة اشتراك نشط فقط + ترتيب بالمسافة ثم الفتح
-- لا يغيّر جداول الباقات أو الدفع — تصفية واستعلام فقط.
-- subscriptions.status = 'active' و end_date >= اليوم ⟺ اشتراك نشط
-- =====================================================

CREATE OR REPLACE VIEW public.barbers_public_directory AS
SELECT
  b.*,
  true AS has_active_subscription
FROM public.barbers b
WHERE b.is_active = true
  AND EXISTS (
    SELECT 1
    FROM public.subscriptions s
    WHERE s.barber_id = b.id
      AND s.status = 'active'
      AND s.end_date >= CURRENT_DATE
  );

COMMENT ON VIEW public.barbers_public_directory IS
  'حلاق يظهر على الخريطة/البحث العام: نشط + اشتراك شهري فعّال في جدول subscriptions.';

GRANT SELECT ON public.barbers_public_directory TO anon, authenticated, service_role;

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
  has_active_subscription boolean,
  profile_updated_at timestamptz,
  distance_km double precision,
  rank_score double precision
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
)
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
  b.has_active_subscription,
  b.last_activity_at AS profile_updated_at,
  b.distance_km,
  (
    (1000000.0::double precision - LEAST(b.distance_km, 999999.0::double precision))
    + CASE WHEN COALESCE(b.open_for_customers, true) THEN 0.99::double precision ELSE 0.0::double precision END
  ) AS rank_score
FROM base b
ORDER BY b.distance_km ASC, COALESCE(b.open_for_customers, true) DESC
LIMIT LEAST(200, GREATEST(1, COALESCE(p_limit, 120)))
OFFSET GREATEST(0, COALESCE(p_offset, 0));
$$;

COMMENT ON FUNCTION public.search_barbers_nearby IS
  'بحث جغرافي: من barbers_public_directory (اشتراك نشط فقط). ترتيب: الأقرب ثم مفتوح للعملاء أولاً. rank_score مشتق من المسافة والفقط، دون أولوية باقة/سعر.';

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
