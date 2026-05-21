-- Engineering Wing Handshake — founder activation gate for Operations Controller.

CREATE TABLE IF NOT EXISTS public.platform_engineering_handshake (
  id text PRIMARY KEY DEFAULT 'founder',
  status text NOT NULL DEFAULT 'pending',
  handshake_at timestamptz,
  services jsonb NOT NULL DEFAULT '{}'::jsonb,
  vercel_deployment_url text,
  vercel_deployment_id text,
  ops_controller_enabled boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.platform_engineering_handshake IS
  'Founder Engineering Wing handshake — service pings + Ops Controller activation gate.';

ALTER TABLE public.platform_engineering_handshake ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "platform_engineering_handshake_no_client" ON public.platform_engineering_handshake;
CREATE POLICY "platform_engineering_handshake_no_client"
  ON public.platform_engineering_handshake FOR ALL USING (false) WITH CHECK (false);

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.platform_engineering_handshake TO service_role;
REVOKE ALL ON TABLE public.platform_engineering_handshake FROM anon, authenticated;

INSERT INTO public.platform_engineering_handshake (id, status, ops_controller_enabled)
VALUES ('founder', 'pending', false)
ON CONFLICT (id) DO NOTHING;
