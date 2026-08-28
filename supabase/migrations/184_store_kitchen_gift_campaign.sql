-- Copyright © 2026 HalaqMap. All Rights Reserved.
-- هدية طبختنا1: خمس دورات × خمسون بريداً مؤكَّداً ثم سحب تقني.
-- باقة مئة وثمانين يوماً فقط. مستقلة عن هدية المناسبات. لا وصول عام.

CREATE TABLE IF NOT EXISTS public.store_kitchen_gift_cycles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slot_no integer NOT NULL CHECK (slot_no BETWEEN 1 AND 5),
  status text NOT NULL DEFAULT 'open'
    CHECK (status IN ('open', 'drawing', 'issuing', 'issued')),
  nominated_entry_id uuid,
  winner_entry_id uuid,
  kitchen_order_id uuid,
  drawn_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (slot_no)
);

CREATE TABLE IF NOT EXISTS public.store_kitchen_gift_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cycle_id uuid NOT NULL REFERENCES public.store_kitchen_gift_cycles (id) ON DELETE RESTRICT,
  given_name text NOT NULL,
  email text NOT NULL,
  email_verified_at timestamptz,
  city text NOT NULL DEFAULT '',
  source_channel text NOT NULL
    CHECK (source_channel IN ('google', 'youtube', 'x', 'snapchat', 'friend')),
  opinion_before text NOT NULL DEFAULT '',
  opinion_after text NOT NULL DEFAULT '',
  terms_version text NOT NULL DEFAULT 'kitchen-gift-1',
  terms_accepted_at timestamptz NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'pending_email'
    CHECK (status IN ('pending_email', 'qualified', 'nominated', 'chosen', 'alternate')),
  confirm_nonce text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS store_kitchen_gift_entries_email_uidx
  ON public.store_kitchen_gift_entries (email);

CREATE INDEX IF NOT EXISTS store_kitchen_gift_entries_cycle_verified_idx
  ON public.store_kitchen_gift_entries (cycle_id, email_verified_at)
  WHERE email_verified_at IS NOT NULL;

COMMENT ON TABLE public.store_kitchen_gift_cycles IS
  'دورات هدية طبختنا1. خمسة نماذج عددياً. باقة 180 يوماً من أول دخول. السحب عند اكتمال خمسين بريداً مؤكَّداً.';
COMMENT ON TABLE public.store_kitchen_gift_entries IS
  'مشاركات هدية طبختنا1. البريد الفريد للحملة. لا دفتر زبائن.';

ALTER TABLE public.store_kitchen_gift_cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_kitchen_gift_entries ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.store_kitchen_gift_cycles FROM PUBLIC;
REVOKE ALL ON TABLE public.store_kitchen_gift_cycles FROM anon, authenticated;
REVOKE ALL ON TABLE public.store_kitchen_gift_entries FROM PUBLIC;
REVOKE ALL ON TABLE public.store_kitchen_gift_entries FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.store_kitchen_gift_cycles TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.store_kitchen_gift_entries TO service_role;

DROP POLICY IF EXISTS store_kitchen_gift_cycles_service_role ON public.store_kitchen_gift_cycles;
CREATE POLICY store_kitchen_gift_cycles_service_role
  ON public.store_kitchen_gift_cycles
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS store_kitchen_gift_entries_service_role ON public.store_kitchen_gift_entries;
CREATE POLICY store_kitchen_gift_entries_service_role
  ON public.store_kitchen_gift_entries
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

INSERT INTO public.store_kitchen_gift_cycles (slot_no, status)
VALUES (1, 'open')
ON CONFLICT (slot_no) DO NOTHING;
