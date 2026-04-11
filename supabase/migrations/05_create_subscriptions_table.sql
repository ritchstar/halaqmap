-- =====================================================
-- جدول الاشتراكات
-- =====================================================

CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barber_id UUID REFERENCES public.barbers(id) ON DELETE CASCADE NOT NULL,
  tier TEXT CHECK (tier IN ('bronze', 'gold', 'diamond')) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT CHECK (status IN ('active', 'expired', 'cancelled', 'pending')) DEFAULT 'pending',
  auto_renew BOOLEAN DEFAULT false,
  price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS subscriptions_barber_id_idx ON public.subscriptions(barber_id);
CREATE INDEX IF NOT EXISTS subscriptions_status_idx ON public.subscriptions(status);
CREATE INDEX IF NOT EXISTS subscriptions_end_date_idx ON public.subscriptions(end_date);

-- تفعيل RLS
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- السياسات
CREATE POLICY "Barbers can view their own subscriptions"
  ON public.subscriptions FOR SELECT
  USING (
    barber_id IN (
      SELECT id FROM public.barbers WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all subscriptions"
  ON public.subscriptions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND user_type = 'admin'
    )
  );

-- Trigger لتحديث updated_at
CREATE TRIGGER on_subscription_updated
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Function لتحديث tier الحلاق عند تفعيل الاشتراك
CREATE OR REPLACE FUNCTION public.update_barber_tier_on_subscription()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'active' AND (OLD.status IS NULL OR OLD.status != 'active') THEN
    UPDATE public.barbers
    SET tier = NEW.tier
    WHERE id = NEW.barber_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_subscription_activated
  AFTER INSERT OR UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_barber_tier_on_subscription();