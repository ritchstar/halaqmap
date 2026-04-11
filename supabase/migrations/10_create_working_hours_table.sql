-- =====================================================
-- جدول أوقات العمل
-- =====================================================

CREATE TABLE IF NOT EXISTS public.working_hours (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barber_id UUID REFERENCES public.barbers(id) ON DELETE CASCADE NOT NULL,
  day_of_week INTEGER CHECK (day_of_week >= 0 AND day_of_week <= 6) NOT NULL, -- 0 = Sunday, 6 = Saturday
  is_open BOOLEAN DEFAULT true,
  open_time TIME,
  close_time TIME,
  break_start_time TIME,
  break_end_time TIME,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(barber_id, day_of_week)
);

-- Indexes
CREATE INDEX IF NOT EXISTS working_hours_barber_id_idx ON public.working_hours(barber_id);

-- تفعيل RLS
ALTER TABLE public.working_hours ENABLE ROW LEVEL SECURITY;

-- السياسات
CREATE POLICY "Anyone can view working hours"
  ON public.working_hours FOR SELECT
  USING (true);

CREATE POLICY "Barbers can manage their own working hours"
  ON public.working_hours FOR ALL
  USING (
    barber_id IN (
      SELECT id FROM public.barbers WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all working hours"
  ON public.working_hours FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND user_type = 'admin'
    )
  );

-- Trigger لتحديث updated_at
CREATE TRIGGER on_working_hours_updated
  BEFORE UPDATE ON public.working_hours
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();