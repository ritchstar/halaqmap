-- Copyright © 2026 HalaqMap. All Rights Reserved.
-- الإنتاج لم يكن فيه الدالة؛ المنح وحده يفشل بـ 42883.
-- ينشئ الدالة ثم يمنح service_role لكرون فيرسل.

CREATE OR REPLACE FUNCTION public.run_private_chat_maintenance()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_count INTEGER := 0;
BEGIN
  IF to_regclass('public.private_conversations') IS NULL THEN
    RETURN 0;
  END IF;

  UPDATE public.private_conversations c
  SET status = 'expired',
      closed_at = COALESCE(c.closed_at, NOW())
  WHERE c.status = 'active'
    AND c.expires_at <= NOW();

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;

REVOKE ALL ON FUNCTION public.run_private_chat_maintenance() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.run_private_chat_maintenance() TO authenticated;
GRANT EXECUTE ON FUNCTION public.run_private_chat_maintenance() TO service_role;

COMMENT ON FUNCTION public.run_private_chat_maintenance() IS
  'ينهي الجلسات الخاصة المنتهية تلقائياً. يُنفَّذ من كرون فيرسل بمفتاح `service_role` ومن الجلسة المصدَّقة.';
