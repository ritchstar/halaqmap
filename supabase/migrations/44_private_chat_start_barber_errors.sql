-- تمييز أسباب فشل start_private_conversation_by_barber_id (كانت كلها «Barber not found»)
-- حتى يُصلَح barbers.user_id أو is_active دون لبس.

CREATE OR REPLACE FUNCTION public.start_private_conversation_by_barber_id(p_barber_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_uid uuid;
  v_barber_user_id uuid;
  v_tier text;
  v_exists boolean;
  v_active boolean;
BEGIN
  v_uid := auth.uid();
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT EXISTS (SELECT 1 FROM public.barbers b WHERE b.id = p_barber_id) INTO v_exists;
  IF NOT v_exists THEN
    RAISE EXCEPTION 'Barber not found';
  END IF;

  SELECT b.user_id,
         lower(coalesce(b.tier, '')),
         coalesce(b.is_active, true)
    INTO v_barber_user_id, v_tier, v_active
  FROM public.barbers b
  WHERE b.id = p_barber_id;

  IF coalesce(v_active, true) IS FALSE THEN
    RAISE EXCEPTION 'Barber inactive';
  END IF;

  IF v_barber_user_id IS NULL THEN
    RAISE EXCEPTION 'Barber account not linked';
  END IF;

  IF v_barber_user_id = v_uid THEN
    RAISE EXCEPTION 'Invalid barber id';
  END IF;

  IF v_tier NOT IN ('gold', 'diamond') THEN
    RAISE EXCEPTION 'Private chat is available for gold and diamond salons only';
  END IF;

  RETURN public.start_private_conversation(v_barber_user_id, p_barber_id);
END;
$$;

REVOKE ALL ON FUNCTION public.start_private_conversation_by_barber_id(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.start_private_conversation_by_barber_id(uuid) TO authenticated;

COMMENT ON FUNCTION public.start_private_conversation_by_barber_id(uuid) IS
  'يبدأ أو يعيد استخدام جلسة خاصة نشطة بين auth.uid() (عميل) والحلاق عبر barbers.id؛ يتحقق من tier ذهبي/ماسي وحساب مربوط.';
