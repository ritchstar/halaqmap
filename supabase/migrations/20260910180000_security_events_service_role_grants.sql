-- Copyright © 2026 HalaqMap. All Rights Reserved.
-- =====================================================================
-- Fix: security_events / security_block_list — missing service_role grants
-- =====================================================================
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.security_events TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.security_block_list TO service_role;

-- دفاع بالعمق: يبقى الجدولان مغلقين تماماً أمام anon/authenticated
REVOKE ALL ON TABLE public.security_events FROM anon, authenticated;
REVOKE ALL ON TABLE public.security_block_list FROM anon, authenticated;
