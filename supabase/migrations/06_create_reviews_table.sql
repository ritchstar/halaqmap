-- =====================================================
-- جدول التقييمات
-- =====================================================

CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barber_id UUID REFERENCES public.barbers(id) ON DELETE CASCADE NOT NULL,
  customer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  comment TEXT,
  images TEXT[],
  barber_reply TEXT,
  barber_reply_at TIMESTAMP WITH TIME ZONE,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS reviews_barber_id_idx ON public.reviews(barber_id);
CREATE INDEX IF NOT EXISTS reviews_customer_id_idx ON public.reviews(customer_id);
CREATE INDEX IF NOT EXISTS reviews_rating_idx ON public.reviews(rating DESC);

-- تفعيل RLS
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- السياسات
CREATE POLICY "Anyone can view reviews"
  ON public.reviews FOR SELECT
  USING (true);

CREATE POLICY "Customers can create reviews"
  ON public.reviews FOR INSERT
  WITH CHECK (customer_id = auth.uid() OR customer_id IS NULL);

CREATE POLICY "Customers can update their own reviews"
  ON public.reviews FOR UPDATE
  USING (customer_id = auth.uid());

CREATE POLICY "Barbers can reply to their reviews"
  ON public.reviews FOR UPDATE
  USING (
    barber_id IN (
      SELECT id FROM public.barbers WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all reviews"
  ON public.reviews FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND user_type = 'admin'
    )
  );

-- Trigger لتحديث updated_at
CREATE TRIGGER on_review_updated
  BEFORE UPDATE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Function لتحديث rating الحلاق
CREATE OR REPLACE FUNCTION public.update_barber_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.barbers
  SET 
    rating = (
      SELECT ROUND(AVG(rating)::numeric, 2)
      FROM public.reviews
      WHERE barber_id = NEW.barber_id
    ),
    total_reviews = (
      SELECT COUNT(*)
      FROM public.reviews
      WHERE barber_id = NEW.barber_id
    )
  WHERE id = NEW.barber_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_review_created
  AFTER INSERT ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_barber_rating();

CREATE TRIGGER on_review_updated_rating
  AFTER UPDATE ON public.reviews
  FOR EACH ROW 
  WHEN (OLD.rating IS DISTINCT FROM NEW.rating)
  EXECUTE FUNCTION public.update_barber_rating();