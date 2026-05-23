-- =====================================================
-- Geospatial_License_Asset + Digital Activation Certificate
-- Software License Manager doctrine · ISIC4 474151
-- API-Driven map integration on payment fulfillment
-- =====================================================

CREATE TABLE IF NOT EXISTS public.geospatial_license_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barber_id UUID REFERENCES public.barbers (id) ON DELETE SET NULL,
  entitlement_id UUID REFERENCES public.barber_listing_entitlements (id) ON DELETE SET NULL,
  order_id UUID NOT NULL REFERENCES public.listing_license_orders (id) ON DELETE CASCADE,
  isic_code TEXT NOT NULL DEFAULT '474151',
  asset_status TEXT NOT NULL DEFAULT 'pending_activation'
    CHECK (asset_status IN ('pending_activation', 'map_live', 'suspended', 'expired')),
  map_integration_protocol TEXT NOT NULL DEFAULT 'api_driven_v1',
  geo_latitude DOUBLE PRECISION,
  geo_longitude DOUBLE PRECISION,
  geo_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
  map_integrated_at TIMESTAMPTZ,
  activated_at TIMESTAMPTZ,
  valid_until TIMESTAMPTZ,
  tier TEXT NOT NULL CHECK (tier IN ('bronze', 'gold', 'diamond')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS geospatial_license_assets_order_id_uidx
  ON public.geospatial_license_assets (order_id);
CREATE INDEX IF NOT EXISTS geospatial_license_assets_barber_id_idx
  ON public.geospatial_license_assets (barber_id)
  WHERE barber_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS geospatial_license_assets_status_idx
  ON public.geospatial_license_assets (asset_status);

COMMENT ON TABLE public.geospatial_license_assets IS
  'Geospatial_License_Asset — كل إدراج جغرافي = أصل رخصة برمجية ISIC4 474151 مرتبط بصلاحية الإدراج.';

CREATE TABLE IF NOT EXISTS public.digital_activation_certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID NOT NULL UNIQUE REFERENCES public.geospatial_license_assets (id) ON DELETE CASCADE,
  order_id UUID NOT NULL REFERENCES public.listing_license_orders (id) ON DELETE CASCADE,
  barber_id UUID REFERENCES public.barbers (id) ON DELETE SET NULL,
  entitlement_id UUID REFERENCES public.barber_listing_entitlements (id) ON DELETE SET NULL,
  certificate_number TEXT NOT NULL UNIQUE,
  public_token TEXT NOT NULL UNIQUE,
  isic_code TEXT NOT NULL DEFAULT '474151',
  tier TEXT NOT NULL CHECK (tier IN ('bronze', 'gold', 'diamond')),
  issued_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  valid_until TIMESTAMPTZ NOT NULL,
  map_integration_status TEXT NOT NULL DEFAULT 'pending_geospatial_bind'
    CHECK (map_integration_status IN ('pending_geospatial_bind', 'map_live')),
  certificate_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS digital_activation_certificates_order_id_idx
  ON public.digital_activation_certificates (order_id);
CREATE INDEX IF NOT EXISTS digital_activation_certificates_public_token_idx
  ON public.digital_activation_certificates (public_token);
CREATE INDEX IF NOT EXISTS digital_activation_certificates_moyasar_lookup_idx
  ON public.digital_activation_certificates (order_id);

COMMENT ON TABLE public.digital_activation_certificates IS
  'Digital Activation Certificate — شهادة تفعيل رقمية بديلاً عن رسائل التأكيد التقليدية.';

ALTER TABLE public.geospatial_license_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.digital_activation_certificates ENABLE ROW LEVEL SECURITY;
