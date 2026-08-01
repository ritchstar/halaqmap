-- Copyright © 2026 HalaqMap. All Rights Reserved.
-- ترشيحات تغطية المناطق من المستعلمين (ملف تسويقي مستقل — لا يظهر في البحث العام)

CREATE TABLE IF NOT EXISTS public.coverage_salon_nominations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  status TEXT NOT NULL DEFAULT 'new'
    CHECK (status IN ('new', 'reviewed', 'contacted', 'archived')),
  salon_name TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  photo_url TEXT,
  inside_salon_confirmed BOOLEAN NOT NULL DEFAULT TRUE,
  location_shared BOOLEAN NOT NULL DEFAULT TRUE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT coverage_salon_nominations_lat_chk CHECK (latitude BETWEEN -90 AND 90),
  CONSTRAINT coverage_salon_nominations_lng_chk CHECK (longitude BETWEEN -180 AND 180),
  CONSTRAINT coverage_salon_nominations_salon_name_len CHECK (char_length(trim(salon_name)) BETWEEN 2 AND 120),
  CONSTRAINT coverage_salon_nominations_phone_len CHECK (char_length(trim(contact_phone)) BETWEEN 8 AND 32)
);

COMMENT ON TABLE public.coverage_salon_nominations IS
  'ترشيحات مستعلمين لتغطية المنطقة — ملف تسويقي؛ لا تنشئ حساباً ولا ظهوراً عاماً.';

CREATE INDEX IF NOT EXISTS coverage_salon_nominations_status_created_idx
  ON public.coverage_salon_nominations (status, created_at DESC);

CREATE INDEX IF NOT EXISTS coverage_salon_nominations_geo_idx
  ON public.coverage_salon_nominations (latitude, longitude);

ALTER TABLE public.coverage_salon_nominations ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.coverage_salon_nominations FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.coverage_salon_nominations TO service_role;
