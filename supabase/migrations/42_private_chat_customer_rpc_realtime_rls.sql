-- =====================================================
-- شات عميل–حلاق: RPC بدء الجلسة عبر barber_id + تشديد خصوصية القراءة + Realtime
-- متوافق مع بروتوكول الاستنفار: RLS صارم، لا تسرّب رسائل بعد انتهاء الجلسة
-- =====================================================

-- 1) ملفات شخصية آمنة عند غياب البريد (مثلاً جلسات مجهولة للعميل في المتصفح)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    COALESCE(
      NULLIF(trim(NEW.email), ''),
      replace(NEW.id::text, '-', '') || '@customer.halaqmap.local'
    ),
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'عميل')
  );
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.handle_new_user() IS
  'يُنشئ profile للمستخدم؛ عند غياب بريد صالح يُستخدم معرف داخلي فريد (دعم تسجيل مجهول للشات).';

-- 2) بدء جلسة خاصة كعميل مُصدَّق عبر معرّف الصالون (يُستخرج user_id داخلياً — لا تسريب لقائمة الخريطة)
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
BEGIN
  v_uid := auth.uid();
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT b.user_id, lower(coalesce(b.tier, '')) INTO v_barber_user_id, v_tier
  FROM public.barbers b
  WHERE b.id = p_barber_id
    AND coalesce(b.is_active, true) IS NOT FALSE;

  IF v_barber_user_id IS NULL THEN
    RAISE EXCEPTION 'Barber not found';
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
  'يبدأ أو يعيد استخدام جلسة خاصة نشطة بين auth.uid() (عميل) والحلاق عبر barbers.id؛ يتحقق من tier ذهبي/ماسي.';

-- 3) تشديد قراءة الرسائل: لا SELECT بعد انتهاء الجلسة أو الإغلاق (خصوصية 60 دقيقة)
DROP POLICY IF EXISTS "participants_select_private_messages" ON public.private_messages;
CREATE POLICY "participants_select_private_messages_open_only"
  ON public.private_messages
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.private_conversations c
      WHERE c.id = private_messages.conversation_id
        AND (c.customer_id = auth.uid() OR c.barber_user_id = auth.uid())
        AND c.status = 'active'
        AND c.closed_at IS NULL
        AND c.expires_at > now()
    )
  );

-- 4) Realtime لجدولي المحادثة والرسائل
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'private_messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.private_messages;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'private_conversations'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.private_conversations;
  END IF;
END
$$;
