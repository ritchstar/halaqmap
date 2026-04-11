-- =====================================================
-- جدول طلبات الاشتراك
-- =====================================================

CREATE TABLE IF NOT EXISTS public.subscription_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barber_id UUID REFERENCES public.barbers(id) ON DELETE CASCADE NOT NULL,
  tier TEXT CHECK (tier IN ('bronze', 'gold', 'diamond')) NOT NULL,
  status TEXT CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  payment_proof_url TEXT,
  notes TEXT,
  admin_notes TEXT,
  reviewed_by UUID REFERENCES public.profiles(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS subscription_requests_barber_id_idx ON public.subscription_requests(barber_id);
CREATE INDEX IF NOT EXISTS subscription_requests_status_idx ON public.subscription_requests(status);

-- تفعيل RLS
ALTER TABLE public.subscription_requests ENABLE ROW LEVEL SECURITY;

-- السياسات
CREATE POLICY "Barbers can view their own requests"
  ON public.subscription_requests FOR SELECT
  USING (
    barber_id IN (
      SELECT id FROM public.barbers WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Barbers can create requests"
  ON public.subscription_requests FOR INSERT
  WITH CHECK (
    barber_id IN (
      SELECT id FROM public.barbers WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all requests"
  ON public.subscription_requests FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND user_type = 'admin'
    )
  );

-- Trigger لتحديث updated_at
CREATE TRIGGER on_subscription_request_updated
  BEFORE UPDATE ON public.subscription_requests
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Function لإنشاء اشتراك عند الموافقة
CREATE OR REPLACE FUNCTION public.create_subscription_on_approval()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'approved' AND OLD.status = 'pending' THEN
    INSERT INTO public.subscriptions (barber_id, tier, start_date, end_date, status, price)
    VALUES (
      NEW.barber_id,
      NEW.tier,
      CURRENT_DATE,
      CURRENT_DATE + INTERVAL '30 days',
      'active',
      CASE NEW.tier
        WHEN 'bronze' THEN 100
        WHEN 'gold' THEN 150
        WHEN 'diamond' THEN 200
      END
    );
    
    -- إرسال إشعار للحلاق
    INSERT INTO public.notifications (user_id, type, title, message, link)
    SELECT 
      b.user_id,
      'subscription',
      'تم تفعيل اشتراكك',
      'تم الموافقة على طلب اشتراكك في باقة ' || NEW.tier,
      '/barber/subscription'
    FROM public.barbers b
    WHERE b.id = NEW.barber_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_subscription_request_approved
  AFTER UPDATE ON public.subscription_requests
  FOR EACH ROW EXECUTE FUNCTION public.create_subscription_on_approval();