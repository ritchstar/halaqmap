-- مزامنة إحداثيات طلبات التجربة المعتمدة إلى سجلات الحلاقين المطابقة بالبريد
-- مصدر الحقيقة: bronze_trial_applications.latitude/longitude

UPDATE public.barbers b
SET
  latitude = a.latitude,
  longitude = a.longitude,
  city = COALESCE(NULLIF(trim(a.city_ar), ''), b.city),
  address = COALESCE(
    NULLIF(
      trim(
        concat_ws(
          ' — ',
          NULLIF(trim(a.district_ar), ''),
          NULLIF(trim(a.city_ar), ''),
          NULLIF(trim(a.region_ar), '')
        )
      ),
      ''
    ),
    b.address
  ),
  updated_at = NOW()
FROM public.bronze_trial_applications a
WHERE a.status = 'approved'
  AND lower(trim(b.email)) = lower(trim(a.email))
  AND a.latitude IS NOT NULL
  AND a.longitude IS NOT NULL
  AND (
    b.latitude IS DISTINCT FROM a.latitude
    OR b.longitude IS DISTINCT FROM a.longitude
  );
