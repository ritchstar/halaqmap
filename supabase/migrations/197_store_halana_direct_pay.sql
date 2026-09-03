-- Copyright © 2026 HalaqMap. All Rights Reserved.
-- حلانا1 — تمرير تعليمات التحويل. بلا ميسر على سلة العميلة، بلا تأكيد آلي للوصول.

ALTER TABLE public.store_halana_copies
  ADD COLUMN IF NOT EXISTS pay_bank_name text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS pay_beneficiary_name text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS pay_iban_cipher text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS pay_cash_remainder boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS pay_network_remainder boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN public.store_halana_copies.pay_iban_cipher IS
  'حلانا1. آيبان مشفّر. لا يُعرض في المعرض العام. يظهر بعد عرض السعر فقط.';
COMMENT ON COLUMN public.store_halana_copies.pay_cash_remainder IS
  'حلانا1. نقد عند الاستلام للمتبقي بعد العربون.';
COMMENT ON COLUMN public.store_halana_copies.pay_network_remainder IS
  'حلانا1. شبكة عند الاستلام للمتبقي بعد العربون. بلا بيانات بطاقة في الصفحة.';

CREATE TABLE IF NOT EXISTS public.store_halana_pay_proofs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  copy_id uuid NOT NULL REFERENCES public.store_halana_copies(id) ON DELETE CASCADE,
  request_id uuid NOT NULL REFERENCES public.store_halana_requests(id) ON DELETE CASCADE,
  image_src text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT store_halana_pay_proofs_src_len CHECK (char_length(image_src) BETWEEN 12 AND 180000)
);

CREATE UNIQUE INDEX IF NOT EXISTS store_halana_pay_proofs_request_uidx
  ON public.store_halana_pay_proofs (request_id);
CREATE INDEX IF NOT EXISTS store_halana_pay_proofs_copy_idx
  ON public.store_halana_pay_proofs (copy_id, created_at DESC);

COMMENT ON TABLE public.store_halana_pay_proofs IS
  'حلانا1. إثبات تحويل مربوط بالطلب. مراجعة يدوية. ليس قفل موعد ولا تأكيد وصول. يُحذف أو يُقيَّد بعد تسعين يوماً إن لم تلزم مراجعة.';

ALTER TABLE public.store_halana_pay_proofs ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.store_halana_pay_proofs FROM PUBLIC;
REVOKE ALL ON TABLE public.store_halana_pay_proofs FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.store_halana_pay_proofs TO service_role;

DROP POLICY IF EXISTS store_halana_pay_proofs_service_role ON public.store_halana_pay_proofs;
CREATE POLICY store_halana_pay_proofs_service_role
  ON public.store_halana_pay_proofs
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

NOTIFY pgrst, 'reload schema';
