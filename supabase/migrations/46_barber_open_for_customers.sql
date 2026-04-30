-- حالة «مفتوح للعملاء» على الخريطة (منفصلة عن is_active الإداري) + رمز لمسار ويب خفيف

ALTER TABLE public.barbers
  ADD COLUMN IF NOT EXISTS open_for_customers boolean NOT NULL DEFAULT true;

ALTER TABLE public.barbers
  ADD COLUMN IF NOT EXISTS open_status_token text;

CREATE UNIQUE INDEX IF NOT EXISTS barbers_open_status_token_uidx
  ON public.barbers (open_status_token)
  WHERE open_status_token IS NOT NULL;

COMMENT ON COLUMN public.barbers.open_for_customers IS
  'عند false يُعرض الصالون كـ «مغلق» للعملاء على الخريطة مع بقاء الحساب النشط (is_active).';
COMMENT ON COLUMN public.barbers.open_status_token IS
  'رمز سري لمسار ويب خفيف يغيّر open_for_customers دون لوحة تحكم (مفيد للبرونزي).';

-- ضمان وجود أعمدة الرعاية الشاملة قبل تعريف الدالة (تنفيذ هذا الملف وحده دون 31/32)
ALTER TABLE public.barbers
  ADD COLUMN IF NOT EXISTS inclusive_care_offered boolean NOT NULL DEFAULT false;

ALTER TABLE public.barbers
  ADD COLUMN IF NOT EXISTS inclusive_care_price_sar numeric(10, 2);

COMMENT ON COLUMN public.barbers.inclusive_care_offered IS
  'الحلاق يعلن صراحة توفير تسهيلات/زيارة منزلية للفئات المذكورة في المنيو.';
COMMENT ON COLUMN public.barbers.inclusive_care_price_sar IS
  'سعر معروض بالريال عند تفعيل inclusive_care_offered.';

ALTER TABLE public.barbers
  ADD COLUMN IF NOT EXISTS inclusive_care_public_visible boolean NOT NULL DEFAULT true;

ALTER TABLE public.barbers
  ADD COLUMN IF NOT EXISTS inclusive_care_restrict_days boolean NOT NULL DEFAULT false;

ALTER TABLE public.barbers
  ADD COLUMN IF NOT EXISTS inclusive_care_days jsonb NOT NULL DEFAULT '{}'::jsonb;

ALTER TABLE public.barbers
  ADD COLUMN IF NOT EXISTS inclusive_care_customer_note text;

COMMENT ON COLUMN public.barbers.inclusive_care_public_visible IS
  'عند false تُخفى بيانات الخدمة عن واجهة العملاء رغم بقاء الإعدادات للحلاق.';
COMMENT ON COLUMN public.barbers.inclusive_care_restrict_days IS
  'عند true يُفترض الاعتماد على inclusive_care_days لأيام التوفّر.';
COMMENT ON COLUMN public.barbers.inclusive_care_days IS
  'خريطة أيام (مفاتيح عربية مثل «السبت») → boolean.';
COMMENT ON COLUMN public.barbers.inclusive_care_customer_note IS
  'ملاحظة قصيرة للعميل (ظروف، حجز مسبق، نطاق زيارة منزلية، …).';

UPDATE public.barbers
SET open_status_token = replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', '')
WHERE open_status_token IS NULL OR trim(open_status_token) = '';

-- توسيع نتيجة البحث الجغرافي بإخراج open_for_customers (بدون إخراج الرمز)
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
    ST_Distance(loc.g, u.g) / 1000.0 AS distance_km
  FROM public.barbers b
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
  WHERE b.is_active = true
    AND loc.g IS NOT NULL
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
  b.distance_km,
  (
    0.35 * CASE b.tier
      WHEN 'diamond' THEN 1.0
      WHEN 'gold' THEN 0.6666666667
      ELSE 0.3333333333
    END
    +
    0.35 * EXP(-b.distance_km / 10.0)
    +
    0.30 * (
      (
        (
          (GREATEST(0, COALESCE(b.total_reviews, 0))::double precision) /
          (GREATEST(0, COALESCE(b.total_reviews, 0))::double precision + 8.0)
        )
        * COALESCE(LEAST(5.0, GREATEST(1.0, b.rating::double precision)), 3.5)
      )
      +
      (
        8.0 /
        (GREATEST(0, COALESCE(b.total_reviews, 0))::double precision + 8.0)
      ) * 3.5
      - 1.0
    ) / 4.0
  ) AS rank_score
FROM base b
ORDER BY rank_score DESC, b.distance_km ASC
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
