-- =====================================================
-- جدول خدمات الحلاق
-- =====================================================

CREATE TABLE IF NOT EXISTS public.barber_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barber_id UUID REFERENCES public.barbers(id) ON DELETE CASCADE NOT NULL,
  service_name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  duration_minutes INTEGER NOT NULL,
  category TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS barber_services_barber_id_idx ON public.barber_services(barber_id);
CREATE INDEX IF NOT EXISTS barber_services_category_idx ON public.barber_services(category);

-- تفعيل RLS
ALTER TABLE public.barber_services ENABLE ROW LEVEL SECURITY;

-- السياسات
CREATE POLICY "Anyone can view active services"
  ON public.barber_services FOR SELECT
  USING (is_active = true);

CREATE POLICY "Barbers can manage their own services"
  ON public.barber_services FOR ALL
  USING (
    barber_id IN (
      SELECT id FROM public.barbers WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all services"
  ON public.barber_services FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND user_type = 'admin'
    )
  );

-- Trigger لتحديث updated_at
CREATE TRIGGER on_barber_service_updated
  BEFORE UPDATE ON public.barber_services
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();