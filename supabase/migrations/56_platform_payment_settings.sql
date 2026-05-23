-- إعدادات بوابات الدفع والقنوات — صف واحد (id=1)، يُحدَّث من لوحة الإدارة عبر API بصلاحية service role.

CREATE TABLE IF NOT EXISTS public.platform_payment_settings (
  id smallint PRIMARY KEY DEFAULT 1 CHECK (id = 1),

  preferred_gateway text NOT NULL DEFAULT 'MOYASAR'
    CHECK (preferred_gateway IN ('MOYASAR', 'SAB')),

  -- للعرض الإداري فقط؛ المفاتيح الفعلية ما زالت من متغيرات البناء/الخادم.
  display_payment_mode text NOT NULL DEFAULT 'test'
    CHECK (display_payment_mode IN ('test', 'live')),

  enable_moyasar_card boolean NOT NULL DEFAULT true,
  enable_sab_gateway boolean NOT NULL DEFAULT false,
  enable_bank_transfer_semiannual boolean NOT NULL DEFAULT true,

  enable_internal_onboarding_email boolean NOT NULL DEFAULT true,
  enable_whatsapp_payment_notify boolean NOT NULL DEFAULT false,
  enable_resend_payment_receipt boolean NOT NULL DEFAULT true,

  enforce_price_currency_match boolean NOT NULL DEFAULT true,

  bank_display_name_ar text NOT NULL DEFAULT '',
  bank_beneficiary_name text NOT NULL DEFAULT '',
  bank_iban text NOT NULL DEFAULT '',

  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by_email text
);

ALTER TABLE public.platform_payment_settings ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE public.platform_payment_settings IS
  'إعدادات الدفع الموحّدة — القراءة/الكتابة عبر Edge Function أو Vercel API (service role) فقط؛ لا سياسات لـ anon/authenticated.';

INSERT INTO public.platform_payment_settings (id)
VALUES (1)
ON CONFLICT (id) DO NOTHING;
