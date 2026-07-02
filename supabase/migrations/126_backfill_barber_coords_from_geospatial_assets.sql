-- =====================================================
-- إصلاح: نسخ إحداثيات geospatial_license_assets إلى barbers
-- الشهادة قد تُظهر map_live بينما barbers.latitude فارغ — البحث لا يرى الحلاق.
-- =====================================================

UPDATE public.barbers b
SET
  latitude = g.geo_latitude,
  longitude = g.geo_longitude,
  updated_at = NOW()
FROM public.geospatial_license_assets g
WHERE g.barber_id = b.id
  AND g.geo_latitude IS NOT NULL
  AND g.geo_longitude IS NOT NULL
  AND NOT (g.geo_latitude = 0 AND g.geo_longitude = 0)
  AND (
    b.latitude IS NULL
    OR b.longitude IS NULL
    OR (b.latitude = 0 AND b.longitude = 0)
  );
