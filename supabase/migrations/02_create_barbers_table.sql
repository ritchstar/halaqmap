-- =====================================================
-- تفعيل PostGIS Extension للبحث الجغرافي
-- =====================================================

-- تفعيل PostGIS (مطلوب للبحث الجغرافي)
CREATE EXTENSION IF NOT EXISTS postgis;

-- =====================================================
-- جدول الحلاقين
-- =====================================================

CREATE TABLE IF NOT EXISTS public.barbers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  address TEXT NOT NULL,
  city TEXT,
  tier TEXT CHECK (tier IN ('bronze', 'gold', 'diamond')) DEFAULT 'bronze',
  rating DECIMAL(3, 2) DEFAULT 0.0,
  total_reviews INTEGER DEFAULT 0,
  profile_image TEXT,
  cover_image TEXT,
  bio TEXT,
  experience_years INTEGER,
  specialties TEXT[],
  is_active BOOLEAN DEFAULT true,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إضافة عمود location بعد إنشاء الجدول
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'barbers' AND column_name = 'location'
  ) THEN
    ALTER TABLE public.barbers ADD COLUMN location GEOGRAPHY(POINT, 4326);
  END IF;
END $$;

-- تحديث location من latitude و longitude
UPDATE public.barbers
SET location = ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography
WHERE latitude IS NOT NULL AND longitude IS NOT NULL AND location IS NULL;

-- إنشاء Indexes
CREATE INDEX IF NOT EXISTS barbers_location_idx ON public.barbers USING GIST(location);
CREATE INDEX IF NOT EXISTS barbers_tier_idx ON public.barbers(tier);
CREATE INDEX IF NOT EXISTS barbers_rating_idx ON public.barbers(rating DESC);
CREATE INDEX IF NOT EXISTS barbers_city_idx ON public.barbers(city);

-- تفعيل RLS
ALTER TABLE public.barbers ENABLE ROW LEVEL SECURITY;

-- حذف السياسات القديمة إذا وُجدت
DROP POLICY IF EXISTS "Anyone can view active barbers" ON public.barbers;
DROP POLICY IF EXISTS "Barbers can update their own profile" ON public.barbers;
DROP POLICY IF EXISTS "Admins can do everything" ON public.barbers;

-- السياسات
CREATE POLICY "Anyone can view active barbers"
  ON public.barbers FOR SELECT
  USING (is_active = true);

CREATE POLICY "Barbers can update their own profile"
  ON public.barbers FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Admins can do everything"
  ON public.barbers FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND user_type = 'admin'
    )
  );

-- حذف Triggers القديمة إذا وُجدت
DROP TRIGGER IF EXISTS on_barber_updated ON public.barbers;
DROP TRIGGER IF EXISTS on_barber_location_updated ON public.barbers;

-- Trigger لتحديث updated_at
CREATE TRIGGER on_barber_updated
  BEFORE UPDATE ON public.barbers
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Function لتحديث location عند تغيير latitude أو longitude
CREATE OR REPLACE FUNCTION public.update_barber_location()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.latitude IS NOT NULL AND NEW.longitude IS NOT NULL THEN
    NEW.location = ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326)::geography;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger لتحديث location
CREATE TRIGGER on_barber_location_updated
  BEFORE INSERT OR UPDATE ON public.barbers
  FOR EACH ROW EXECUTE FUNCTION public.update_barber_location();