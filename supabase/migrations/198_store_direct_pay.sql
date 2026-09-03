-- Copyright © 2026 HalaqMap. All Rights Reserved.
-- نظام موحّد لتمرير تعليمات الدفع. شريك تقني بلا تحصيل وبلا عمولة على الحرفة.

CREATE TABLE IF NOT EXISTS public.store_direct_pay_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_tag text NOT NULL,
  copy_id uuid NOT NULL,
  pay_bank_name text NOT NULL DEFAULT '',
  pay_beneficiary_name text NOT NULL DEFAULT '',
  pay_iban_cipher text NOT NULL DEFAULT '',
  pay_stc_mobile_cipher text NOT NULL DEFAULT '',
  pay_sarie_kind text NOT NULL DEFAULT '',
  pay_sarie_alias_cipher text NOT NULL DEFAULT '',
  pay_external_url text NOT NULL DEFAULT '',
  pay_cash_remainder boolean NOT NULL DEFAULT false,
  pay_network_remainder boolean NOT NULL DEFAULT false,
  enabled_iban boolean NOT NULL DEFAULT false,
  enabled_stc boolean NOT NULL DEFAULT false,
  enabled_sarie boolean NOT NULL DEFAULT false,
  enabled_external boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT store_direct_pay_profiles_tag_chk CHECK (
    product_tag IN (
      'store_halana_live',
      'store_kitchen_live',
      'store_grocers_live',
      'store_produce_live',
      'store_restaurant_live',
      'store_cafe_live',
      'store_wedding_live',
      'store_event_live',
      'store_lounge_live'
    )
  ),
  CONSTRAINT store_direct_pay_profiles_sarie_chk CHECK (
    pay_sarie_kind IN ('', 'mobile', 'email', 'entity')
  ),
  CONSTRAINT store_direct_pay_profiles_url_chk CHECK (
    pay_external_url = '' OR pay_external_url LIKE 'https://%'
  ),
  CONSTRAINT store_direct_pay_profiles_uid UNIQUE (product_tag, copy_id)
);

CREATE INDEX IF NOT EXISTS store_direct_pay_profiles_copy_idx
  ON public.store_direct_pay_profiles (copy_id);

COMMENT ON TABLE public.store_direct_pay_profiles IS
  'تمرير تعليمات دفع يملكها المشغّل. المنصة لا تستلم ولا تسوّي ولا ترد. لا عمولة على الحرفة.';

CREATE TABLE IF NOT EXISTS public.store_direct_pay_proofs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_tag text NOT NULL,
  copy_id uuid NOT NULL,
  request_ref text NOT NULL,
  image_src text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT store_direct_pay_proofs_ref_len CHECK (char_length(request_ref) BETWEEN 4 AND 80),
  CONSTRAINT store_direct_pay_proofs_src_len CHECK (char_length(image_src) BETWEEN 12 AND 180000),
  CONSTRAINT store_direct_pay_proofs_uid UNIQUE (product_tag, copy_id, request_ref)
);

CREATE INDEX IF NOT EXISTS store_direct_pay_proofs_copy_idx
  ON public.store_direct_pay_proofs (product_tag, copy_id, created_at DESC);

COMMENT ON TABLE public.store_direct_pay_proofs IS
  'إثبات تحويل مربوط بالطلب. مراجعة يدوية. ليس تأكيد وصول ولا قفل موعد. يُحذف أو يُقيَّد بعد تسعين يوماً إن لم تلزم مراجعة.';

ALTER TABLE public.store_direct_pay_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_direct_pay_proofs ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.store_direct_pay_profiles FROM PUBLIC;
REVOKE ALL ON TABLE public.store_direct_pay_proofs FROM PUBLIC;
REVOKE ALL ON TABLE public.store_direct_pay_profiles FROM anon, authenticated;
REVOKE ALL ON TABLE public.store_direct_pay_proofs FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.store_direct_pay_profiles TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.store_direct_pay_proofs TO service_role;

DROP POLICY IF EXISTS store_direct_pay_profiles_service_role ON public.store_direct_pay_profiles;
CREATE POLICY store_direct_pay_profiles_service_role
  ON public.store_direct_pay_profiles
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS store_direct_pay_proofs_service_role ON public.store_direct_pay_proofs;
CREATE POLICY store_direct_pay_proofs_service_role
  ON public.store_direct_pay_proofs
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

NOTIFY pgrst, 'reload schema';
