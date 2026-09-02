-- Copyright © 2026 HalaqMap. All Rights Reserved.
-- حلانا1 — نسخ تشغيل خاصة غير معلنة. مستقل عن طبختنا1 وبقية SKU المتجر.

CREATE TABLE IF NOT EXISTS public.store_halana_copies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  status text NOT NULL DEFAULT 'issued',
  specialist_name text NOT NULL DEFAULT '',
  beneficiary_email text NOT NULL DEFAULT '',
  shop_token text NOT NULL,
  desk_token text NOT NULL,
  shop_name text NOT NULL DEFAULT '',
  flavors_ar text NOT NULL DEFAULT '',
  policy_ar text NOT NULL DEFAULT '',
  quotes_ar text NOT NULL DEFAULT '',
  whatsapp text NOT NULL DEFAULT '',
  gallery_urls text NOT NULL DEFAULT '',
  ready_lines text NOT NULL DEFAULT '',
  issued_by text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT store_halana_copies_status_chk
    CHECK (status IN ('issued', 'closed')),
  CONSTRAINT store_halana_copies_token_len
    CHECK (
      char_length(shop_token) BETWEEN 16 AND 80
      AND char_length(desk_token) BETWEEN 16 AND 80
    )
);

CREATE UNIQUE INDEX IF NOT EXISTS store_halana_copies_shop_uidx
  ON public.store_halana_copies (shop_token);
CREATE UNIQUE INDEX IF NOT EXISTS store_halana_copies_desk_uidx
  ON public.store_halana_copies (desk_token);
CREATE INDEX IF NOT EXISTS store_halana_copies_email_idx
  ON public.store_halana_copies (beneficiary_email);

CREATE TABLE IF NOT EXISTS public.store_halana_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  copy_id uuid NOT NULL REFERENCES public.store_halana_copies(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'new',
  deliver_at text NOT NULL DEFAULT '',
  quantity text NOT NULL DEFAULT '',
  sweet_type text NOT NULL DEFAULT '',
  fillings text NOT NULL DEFAULT '',
  ref_note text NOT NULL DEFAULT '',
  guest_name text NOT NULL DEFAULT '',
  guest_whatsapp text NOT NULL DEFAULT '',
  quote_amount_sar text NOT NULL DEFAULT '',
  quote_note text NOT NULL DEFAULT '',
  locked_date text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT store_halana_requests_status_chk
    CHECK (status IN (
      'new',
      'quoted',
      'awaiting_deposit',
      'confirmed',
      'preparing',
      'ready',
      'completed',
      'declined'
    ))
);

CREATE INDEX IF NOT EXISTS store_halana_requests_copy_idx
  ON public.store_halana_requests (copy_id, created_at DESC);

COMMENT ON TABLE public.store_halana_copies IS
  'حلانا1. نسخ غير معلنة تُصدر بالاسم والبريد. بلا ميسر على طلب العميلة.';
COMMENT ON TABLE public.store_halana_requests IS
  'طلبات حلانا1. الموعد يُقفل بعد تأكيد العربون يدوياً.';

ALTER TABLE public.store_halana_copies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_halana_requests ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.store_halana_copies FROM PUBLIC;
REVOKE ALL ON TABLE public.store_halana_requests FROM PUBLIC;
REVOKE ALL ON TABLE public.store_halana_copies FROM anon, authenticated;
REVOKE ALL ON TABLE public.store_halana_requests FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.store_halana_copies TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.store_halana_requests TO service_role;

DROP POLICY IF EXISTS store_halana_copies_service_role ON public.store_halana_copies;
CREATE POLICY store_halana_copies_service_role
  ON public.store_halana_copies
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS store_halana_requests_service_role ON public.store_halana_requests;
CREATE POLICY store_halana_requests_service_role
  ON public.store_halana_requests
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

NOTIFY pgrst, 'reload schema';
