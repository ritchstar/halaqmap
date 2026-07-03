-- =====================================================
-- شحن محفظة المناوب الرقمي عبر ميسر (Wallet Top-up)
--  · تغيير الرصيد الترحيبي للمحافظ الجديدة من 100 ر.س إلى 15 ر.س (10000 → 1500 هللة)
--    (لا يمس الأرصدة الحالية — يؤثر فقط على التفعيلات الجديدة)
--  · جدول idempotent لعمليات الشحن: دفعة ميسر واحدة = شحنة واحدة كحد أقصى
-- =====================================================

-- (1) الرصيد الترحيبي الجديد للمحافظ المُنشأة مستقبلاً
ALTER TABLE public.barber_ai_wallet
  ALTER COLUMN balance_halalas SET DEFAULT 1500;

COMMENT ON COLUMN public.barber_ai_wallet.balance_halalas IS
  'رصيد المحفظة (هللات). الترحيبي للتفعيلات الجديدة = 1500 (15 ر.س ≈ 10 ردود). يُشحن عبر /api/wallet-topup-fulfill.';

-- (2) سجل شحن المحفظة — قفل idempotent على معرّف دفعة ميسر
CREATE TABLE IF NOT EXISTS public.barber_ai_wallet_topups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barber_id UUID NOT NULL REFERENCES public.barbers(id) ON DELETE CASCADE,
  moyasar_payment_id TEXT NOT NULL,
  wallet_sku TEXT NOT NULL,
  charged_halalas INT NOT NULL CHECK (charged_halalas >= 0),
  credited_halalas INT NOT NULL CHECK (credited_halalas >= 0),
  vat_halalas INT NOT NULL DEFAULT 0 CHECK (vat_halalas >= 0),
  currency TEXT NOT NULL DEFAULT 'SAR',
  buyer_email TEXT,
  source TEXT NOT NULL DEFAULT 'moyasar',
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT barber_ai_wallet_topups_payment_unique UNIQUE (moyasar_payment_id)
);

CREATE INDEX IF NOT EXISTS barber_ai_wallet_topups_barber_created_idx
  ON public.barber_ai_wallet_topups(barber_id, created_at DESC);

COMMENT ON TABLE public.barber_ai_wallet_topups IS
  'شحن محفظة المناوب عبر ميسر — قفل idempotent: دفعة واحدة = شحنة واحدة. يُملأ بـ service role فقط.';

ALTER TABLE public.barber_ai_wallet_topups ENABLE ROW LEVEL SECURITY;
