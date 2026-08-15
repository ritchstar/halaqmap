-- Copyright © 2026 HalaqMap. All Rights Reserved.
-- موافقة صريحة لإبراز الصالون على صفحات فزعة العامة (قد يفهرسها جوجل).
-- الإدراج والتحديث عبر service_role فقط — لا قراءة عامة من العميل.

CREATE TABLE IF NOT EXISTS public.fazaa_seo_listing_consents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  barber_id uuid NOT NULL REFERENCES public.barbers (id) ON DELETE CASCADE,
  token_hash text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  consent_version text NOT NULL,
  city_slug text NOT NULL,
  city_name_ar text NOT NULL,
  neighborhood_slugs text[] NOT NULL DEFAULT '{}',
  area_label_ar text NOT NULL,
  specialty_hint_ar text,
  banner_url text,
  name_snapshot text NOT NULL,
  email_to text NOT NULL,
  email_sent_at timestamptz,
  expires_at timestamptz NOT NULL,
  accepted_at timestamptz,
  declined_at timestamptz,
  revoked_at timestamptz,
  accept_ip text,
  accept_user_agent text,
  created_by_email text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT fazaa_seo_listing_consents_status_chk
    CHECK (status IN ('pending', 'accepted', 'declined', 'revoked', 'expired')),
  CONSTRAINT fazaa_seo_listing_consents_token_hash_unique UNIQUE (token_hash),
  CONSTRAINT fazaa_seo_listing_consents_city_slug_chk
    CHECK (char_length(city_slug) BETWEEN 2 AND 64),
  CONSTRAINT fazaa_seo_listing_consents_email_len
    CHECK (char_length(email_to) BETWEEN 3 AND 254)
);

COMMENT ON TABLE public.fazaa_seo_listing_consents IS
  'موافقة الشريك الصريحة على نشر اسمه وبنره في صفحات فزعة العامة القابلة لفهرسة جوجل. خارج بطاقة المنصة.';

CREATE INDEX IF NOT EXISTS fazaa_seo_listing_consents_barber_status_idx
  ON public.fazaa_seo_listing_consents (barber_id, status, created_at DESC);

CREATE INDEX IF NOT EXISTS fazaa_seo_listing_consents_status_idx
  ON public.fazaa_seo_listing_consents (status, accepted_at DESC);

ALTER TABLE public.fazaa_seo_listing_consents ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.fazaa_seo_listing_consents FROM PUBLIC;
REVOKE ALL ON TABLE public.fazaa_seo_listing_consents FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON TABLE public.fazaa_seo_listing_consents TO service_role;

DROP POLICY IF EXISTS fazaa_seo_listing_consents_service_role ON public.fazaa_seo_listing_consents;
CREATE POLICY fazaa_seo_listing_consents_service_role
  ON public.fazaa_seo_listing_consents
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
