-- =====================================================
-- جدول الحجوزات
-- =====================================================

CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barber_id UUID REFERENCES public.barbers(id) ON DELETE CASCADE NOT NULL,
  customer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  service_name TEXT NOT NULL,
  service_price DECIMAL(10, 2),
  booking_date DATE NOT NULL,
  booking_time TIME NOT NULL,
  duration_minutes INTEGER DEFAULT 30,
  status TEXT CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled', 'no_show')) DEFAULT 'pending',
  notes TEXT,
  cancellation_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS bookings_barber_id_idx ON public.bookings(barber_id);
CREATE INDEX IF NOT EXISTS bookings_customer_id_idx ON public.bookings(customer_id);
CREATE INDEX IF NOT EXISTS bookings_date_idx ON public.bookings(booking_date DESC);
CREATE INDEX IF NOT EXISTS bookings_status_idx ON public.bookings(status);

-- تفعيل RLS
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- حذف السياسات القديمة
DROP POLICY IF EXISTS "Customers can view their own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Barbers can view their bookings" ON public.bookings;
DROP POLICY IF EXISTS "Customers can create bookings" ON public.bookings;
DROP POLICY IF EXISTS "Barbers can update their bookings" ON public.bookings;
DROP POLICY IF EXISTS "Admins can do everything" ON public.bookings;

-- السياسات
CREATE POLICY "Customers can view their own bookings"
  ON public.bookings FOR SELECT
  USING (customer_id = auth.uid());

CREATE POLICY "Barbers can view their bookings"
  ON public.bookings FOR SELECT
  USING (
    barber_id IN (
      SELECT id FROM public.barbers WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Customers can create bookings"
  ON public.bookings FOR INSERT
  WITH CHECK (customer_id = auth.uid() OR customer_id IS NULL);

CREATE POLICY "Barbers can update their bookings"
  ON public.bookings FOR UPDATE
  USING (
    barber_id IN (
      SELECT id FROM public.barbers WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can do everything"
  ON public.bookings FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND user_type = 'admin'
    )
  );

-- حذف Triggers القديمة
DROP TRIGGER IF EXISTS on_booking_updated ON public.bookings;
DROP TRIGGER IF EXISTS on_booking_created ON public.bookings;

-- Trigger لتحديث updated_at
CREATE TRIGGER on_booking_updated
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Function لإرسال إشعار عند حجز جديد
CREATE OR REPLACE FUNCTION public.notify_new_booking()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.notifications (user_id, type, title, message, link)
  SELECT 
    b.user_id,
    'booking',
    'حجز جديد',
    'لديك حجز جديد من ' || NEW.customer_name,
    '/barber/bookings/' || NEW.id
  FROM public.barbers b
  WHERE b.id = NEW.barber_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_booking_created
  AFTER INSERT ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.notify_new_booking();