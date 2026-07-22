-- ترحيل هوية طلب التجربة/التسجيل إلى كل الحلاقين (اسم، جوال، صور، إحداثيات، ساعات)

-- 1) شركاء التجربة المعتمدون: فرض بيانات الطلب
UPDATE public.barbers b
SET
  name = coalesce(nullif(trim(a.salon_name), ''), b.name),
  phone = coalesce(nullif(trim(a.phone), ''), b.phone),
  latitude = a.latitude,
  longitude = a.longitude,
  city = coalesce(nullif(trim(a.city_ar), ''), b.city),
  address = coalesce(
    nullif(
      trim(
        concat_ws(
          ' — ',
          nullif(trim(a.district_ar), ''),
          nullif(trim(a.city_ar), ''),
          nullif(trim(a.region_ar), '')
        )
      ),
      ''
    ),
    b.address
  ),
  cover_image = coalesce(nullif(trim(a.photo_exterior_sign_url), ''), b.cover_image),
  profile_image = coalesce(
    nullif(trim(a.photo_interior_1_url), ''),
    nullif(trim(a.photo_exterior_sign_url), ''),
    b.profile_image
  ),
  featured_images = (
    SELECT coalesce(jsonb_agg(to_jsonb(u) ORDER BY ord), b.featured_images)
    FROM (
      SELECT 1 AS ord, nullif(trim(a.photo_exterior_sign_url), '') AS u
      UNION ALL SELECT 2, nullif(trim(a.photo_exterior_2_url), '')
      UNION ALL SELECT 3, nullif(trim(a.photo_interior_1_url), '')
      UNION ALL SELECT 4, nullif(trim(a.photo_interior_2_url), '')
    ) x
    WHERE u IS NOT NULL
  ),
  updated_at = now()
FROM public.bronze_trial_applications a
WHERE a.status = 'approved'
  AND lower(trim(b.email)) = lower(trim(a.email))
  AND a.latitude IS NOT NULL
  AND a.longitude IS NOT NULL;

-- 2) باقي الحلاقين المرتبطين بتسجيل: فرض الاسم/الجوال/الإحداثيات من أقدم طلب (مصدر التسجيل)
UPDATE public.barbers b
SET
  name = coalesce(nullif(trim(s.payload->>'barberName'), ''), b.name),
  phone = coalesce(nullif(trim(s.payload->>'phone'), ''), b.phone),
  latitude = coalesce((s.payload->'location'->>'lat')::float8, b.latitude),
  longitude = coalesce((s.payload->'location'->>'lng')::float8, b.longitude),
  address = coalesce(nullif(trim(s.payload->'location'->>'address'), ''), b.address),
  updated_at = now()
FROM (
  SELECT DISTINCT ON (lower(trim(coalesce(payload->>'email',''))))
    id,
    payload,
    lower(trim(coalesce(payload->>'email',''))) AS email_key,
    payload->>'linkedBarberId' AS linked_id
  FROM public.registration_submissions
  WHERE jsonb_typeof(payload) = 'object'
  ORDER BY lower(trim(coalesce(payload->>'email',''))), created_at ASC
) s
WHERE NOT EXISTS (
  SELECT 1 FROM public.bronze_trial_applications a
  WHERE a.status = 'approved' AND lower(trim(a.email)) = lower(trim(b.email))
)
AND (
  (s.linked_id IS NOT NULL AND s.linked_id = b.id::text)
  OR (s.email_key <> '' AND s.email_key = lower(trim(b.email)))
)
AND (s.payload->'location'->>'lat') IS NOT NULL
AND (s.payload->'location'->>'lng') IS NOT NULL;
