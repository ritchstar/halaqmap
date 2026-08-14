-- Copyright © 2026 HalaqMap. All Rights Reserved.
-- =====================================================
-- طلبات صفحة العرض الخاصة — ذهبي/ماسي برخصة سارية فقط.
-- الكتابة عبر service_role من API البوابة؛ لا إدراج من anon.
-- =====================================================

CREATE TABLE IF NOT EXISTS public.salon_private_page_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  barber_id uuid NOT NULL REFERENCES public.barbers(id) ON DELETE CASCADE,
  sku text NOT NULL,
  page_count integer NOT NULL CHECK (page_count >= 1 AND page_count <= 7),
  unit_sar numeric NOT NULL CHECK (unit_sar > 0),
  base_sar numeric NOT NULL CHECK (base_sar > 0),
  base_halalas integer NOT NULL CHECK (base_halalas > 0),
  status text NOT NULL DEFAULT 'submitted'
    CHECK (status IN (
      'submitted',
      'awaiting_payment',
      'paid',
      'in_design',
      'live',
      'cancelled'
    )),
  salon_display_name text NOT NULL,
  city text,
  district text,
  about_text text NOT NULL,
  services_text text NOT NULL,
  products_text text,
  brand_notes text,
  contact_whatsapp text,
  surface text NOT NULL DEFAULT 'halaqmap',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS salon_private_page_requests_barber_created_idx
  ON public.salon_private_page_requests (barber_id, created_at DESC);

COMMENT ON TABLE public.salon_private_page_requests IS
  'طلبات صفحة العرض الخاصة — إضافة برمجية لأصحاب رخصة ذهبية/ماسية مفعّلة.';

ALTER TABLE public.salon_private_page_requests ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.salon_private_page_requests FROM PUBLIC;
REVOKE ALL ON TABLE public.salon_private_page_requests FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON TABLE public.salon_private_page_requests TO service_role;

DROP POLICY IF EXISTS salon_private_page_requests_service_role ON public.salon_private_page_requests;
CREATE POLICY salon_private_page_requests_service_role
  ON public.salon_private_page_requests
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
