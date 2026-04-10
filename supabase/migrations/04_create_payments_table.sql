-- =====================================================
-- جدول المدفوعات
-- =====================================================

CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barber_id UUID REFERENCES public.barbers(id) ON DELETE CASCADE NOT NULL,
  subscription_id UUID,
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'SAR',
  tier TEXT CHECK (tier IN ('bronze', 'gold', 'diamond')),
  payment_method TEXT CHECK (payment_method IN ('bank_transfer', 'stripe', 'tap', 'moyasar', 'cash')),
  status TEXT CHECK (status IN ('pending', 'completed', 'failed', 'refunded')) DEFAULT 'pending',
  transaction_id TEXT,
  receipt_url TEXT,
  notes TEXT,
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS payments_barber_id_idx ON public.payments(barber_id);
CREATE INDEX IF NOT EXISTS payments_status_idx ON public.payments(status);
CREATE INDEX IF NOT EXISTS payments_created_at_idx ON public.payments(created_at DESC);

-- تفعيل RLS
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- السياسات
CREATE POLICY "Barbers can view their own payments"
  ON public.payments FOR SELECT
  USING (
    barber_id IN (
      SELECT id FROM public.barbers WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all payments"
  ON public.payments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND user_type = 'admin'
    )
  );

CREATE POLICY "Admins can manage payments"
  ON public.payments FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND user_type = 'admin'
    )
  );

-- Trigger لتحديث updated_at
CREATE TRIGGER on_payment_updated
  BEFORE UPDATE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();