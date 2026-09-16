-- Copyright © 2026 HalaqMap. All Rights Reserved.
-- مزاد علني لتمرتنا1 — صناديق منفصلة عن payload المتجر، وصول عبر رموز الـ API فقط.

CREATE TABLE IF NOT EXISTS public.store_dates_auction_lots (
  id text PRIMARY KEY,
  dates_order_id uuid NOT NULL REFERENCES public.store_dates_live_orders (id) ON DELETE CASCADE,
  shop_token text NOT NULL,
  desk_token text NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  current_bid integer NOT NULL DEFAULT 0,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT store_dates_auction_status_chk
    CHECK (status IN ('draft', 'open', 'closed', 'cancelled')),
  CONSTRAINT store_dates_auction_bid_chk
    CHECK (current_bid >= 0),
  CONSTRAINT store_dates_auction_token_len
    CHECK (
      char_length(shop_token) BETWEEN 16 AND 80
      AND char_length(desk_token) BETWEEN 16 AND 80
    )
);

CREATE INDEX IF NOT EXISTS store_dates_auction_shop_idx
  ON public.store_dates_auction_lots (shop_token, status, updated_at DESC);
CREATE INDEX IF NOT EXISTS store_dates_auction_desk_idx
  ON public.store_dates_auction_lots (desk_token, updated_at DESC);
CREATE INDEX IF NOT EXISTS store_dates_auction_order_idx
  ON public.store_dates_auction_lots (dates_order_id);

COMMENT ON TABLE public.store_dates_auction_lots IS
  'مزاد تمرتنا1. عرض ومزايدة فقط بلا تحصيل عبر المنصة. الوصول عبر رموز API (service_role).';

ALTER TABLE public.store_dates_auction_lots ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.store_dates_auction_lots FROM PUBLIC;
REVOKE ALL ON TABLE public.store_dates_auction_lots FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.store_dates_auction_lots TO service_role;

DROP POLICY IF EXISTS store_dates_auction_service_role ON public.store_dates_auction_lots;
CREATE POLICY store_dates_auction_service_role
  ON public.store_dates_auction_lots
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

NOTIFY pgrst, 'reload schema';
