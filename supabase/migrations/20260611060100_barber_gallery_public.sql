-- =====================================================
-- معرض أعمال الحلاق: جدول + لقطة عامة على barbers (4 مميزة + العدد)
-- =====================================================

ALTER TABLE public.barbers
  ADD COLUMN IF NOT EXISTS gallery_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS featured_images jsonb NOT NULL DEFAULT '[]'::jsonb;

COMMENT ON COLUMN public.barbers.gallery_count IS
  'عدد صور معرض الأعمال المنشور للعامة (ذهبي/ماسي).';
COMMENT ON COLUMN public.barbers.featured_images IS
  'حتى 4 عناوين URL لصور البنر المميزة — مرتبة حسب sort_order.';

-- إعادة بناء العرض لالتقاط الأعمدة الجديدة (SELECT b.* لا يتوسّع تلقائياً في PostgreSQL)
DROP VIEW IF EXISTS public.barbers_public_directory CASCADE;

CREATE VIEW public.barbers_public_directory AS
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

CREATE TABLE IF NOT EXISTS public.barber_gallery_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  barber_id uuid NOT NULL REFERENCES public.barbers(id) ON DELETE CASCADE,
  object_path text NOT NULL,
  public_url text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  is_featured boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT barber_gallery_items_barber_path_unique UNIQUE (barber_id, object_path),
  CONSTRAINT barber_gallery_items_object_path_len CHECK (char_length(object_path) <= 512),
  CONSTRAINT barber_gallery_items_public_url_len CHECK (char_length(public_url) <= 2048)
);

CREATE INDEX IF NOT EXISTS idx_barber_gallery_items_barber_sort
  ON public.barber_gallery_items (barber_id, sort_order ASC, created_at ASC);

COMMENT ON TABLE public.barber_gallery_items IS
  'صور معرض الأعمال المنشور — مرتبطة بحاوية barber-portfolio. الكتابة عبر خادم التطبيق فقط.';

ALTER TABLE public.barber_gallery_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "barber_gallery_public_read" ON public.barber_gallery_items;
CREATE POLICY "barber_gallery_public_read"
  ON public.barber_gallery_items
  FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.barbers_public_directory d
      WHERE d.id = barber_gallery_items.barber_id
    )
  );

CREATE OR REPLACE FUNCTION public.refresh_barber_gallery_public_snapshot(p_barber_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count integer;
  v_featured jsonb;
  v_first_url text;
BEGIN
  IF p_barber_id IS NULL THEN
    RETURN;
  END IF;

  SELECT count(*)::integer INTO v_count
  FROM public.barber_gallery_items
  WHERE barber_id = p_barber_id;

  SELECT COALESCE(
    jsonb_agg(sub.public_url ORDER BY sub.sort_order ASC, sub.created_at ASC),
    '[]'::jsonb
  )
  INTO v_featured
  FROM (
    SELECT gi.public_url, gi.sort_order, gi.created_at
    FROM public.barber_gallery_items gi
    WHERE gi.barber_id = p_barber_id
    ORDER BY gi.sort_order ASC, gi.created_at ASC
    LIMIT 4
  ) sub;

  SELECT gi.public_url INTO v_first_url
  FROM public.barber_gallery_items gi
  WHERE gi.barber_id = p_barber_id
  ORDER BY gi.sort_order ASC, gi.created_at ASC
  LIMIT 1;

  UPDATE public.barbers b
  SET
    gallery_count = COALESCE(v_count, 0),
    featured_images = COALESCE(v_featured, '[]'::jsonb),
    cover_image = CASE
      WHEN COALESCE(v_count, 0) > 0 AND v_first_url IS NOT NULL THEN v_first_url
      ELSE b.cover_image
    END,
    updated_at = now()
  WHERE b.id = p_barber_id;

  UPDATE public.barber_gallery_items
  SET is_featured = false
  WHERE barber_id = p_barber_id;

  UPDATE public.barber_gallery_items gi
  SET is_featured = true
  FROM (
    SELECT inner_gi.id
    FROM public.barber_gallery_items inner_gi
    WHERE inner_gi.barber_id = p_barber_id
    ORDER BY inner_gi.sort_order ASC, inner_gi.created_at ASC
    LIMIT 4
  ) top4
  WHERE gi.id = top4.id;
END;
$$;

COMMENT ON FUNCTION public.refresh_barber_gallery_public_snapshot(uuid) IS
  'يحدّث gallery_count و featured_images و cover_image على barbers بعد مزامنة المعرض.';

REVOKE ALL ON FUNCTION public.refresh_barber_gallery_public_snapshot(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.refresh_barber_gallery_public_snapshot(uuid) TO service_role;

-- توسيع search_barbers_nearby: gallery_count + featured_images
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

COMMENT ON FUNCTION public.search_barbers_nearby IS
  'بحث جغرافي: barbers_public_directory + gallery_count/featured_images للبنر العام.';

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
