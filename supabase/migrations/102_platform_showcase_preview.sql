-- =====================================================
-- معاينة المنصة (مكتب ماسي) — للمؤسس + fallback عند غياب نتائج البحث
-- =====================================================

ALTER TABLE public.barbers
  ADD COLUMN IF NOT EXISTS is_showcase_preview boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN public.barbers.is_showcase_preview IS
  'حلاق معاينة تشغيلية/تسويقية — يُدار من لوحة المؤسس؛ ليس شريكاً تجارياً حقيقياً.';

CREATE INDEX IF NOT EXISTS barbers_showcase_preview_idx
  ON public.barbers (is_showcase_preview)
  WHERE is_showcase_preview = true;

CREATE TABLE IF NOT EXISTS public.platform_showcase_settings (
  id smallint PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  barber_id uuid REFERENCES public.barbers(id) ON DELETE SET NULL,
  /** إظهار المعاينة على الخريطة عند غياب نتائج حقيقية */
  fallback_when_empty boolean NOT NULL DEFAULT true,
  /** مفتاح عام: إظهار/إخفاء المعاينة للعملاء */
  map_visible boolean NOT NULL DEFAULT true,
  education_intro_ar text NOT NULL DEFAULT
    'هذا عرض توضيحي من منصة حلاق ماب — لتتعرف على شكل البنر والمعرض قبل انضمام صالونات حقيقية في منطقتك.',
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by_email text
);

COMMENT ON TABLE public.platform_showcase_settings IS
  'إعدادات بنر المعاينة الماسي — قراءة/كتابة عبر Vercel API (service role) فقط.';

INSERT INTO public.platform_showcase_settings (id)
VALUES (1)
ON CONFLICT (id) DO NOTHING;

ALTER TABLE public.platform_showcase_settings ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.platform_showcase_settings TO service_role;

-- إعادة بناء العرض: PostgreSQL لا يسمح بـ CREATE OR REPLACE عند تغيّر أعمدة b.*
-- (بعد إضافة is_showcase_preview يتغيّر ترتيب/عدد الأعمدة مقارنة بالعرض القديم)
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

-- search_barbers_nearby يعتمد على العرض — يُعاد إنشاؤه بعد DROP CASCADE
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
  gallery_count integer,
  featured_images jsonb,
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
  b.gallery_count,
  b.featured_images,
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
