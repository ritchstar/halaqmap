-- =====================================================
-- محادثة خاصة عميل <-> حلاق (صلاحية الجلسة: ساعة واحدة)
-- أمان صارم عبر RLS: لا يرى الرسائل إلا الطرفان المشاركان
-- =====================================================

-- 1) جدول الجلسات الخاصة
CREATE TABLE IF NOT EXISTS public.private_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  barber_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  barber_id UUID REFERENCES public.barbers(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'closed', 'expired')),
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '1 hour'),
  closed_at TIMESTAMPTZ,
  last_message_at TIMESTAMPTZ,
  CHECK (customer_id <> barber_user_id)
);

CREATE INDEX IF NOT EXISTS private_conversations_customer_idx
  ON public.private_conversations(customer_id);
CREATE INDEX IF NOT EXISTS private_conversations_barber_user_idx
  ON public.private_conversations(barber_user_id);
CREATE INDEX IF NOT EXISTS private_conversations_status_expires_idx
  ON public.private_conversations(status, expires_at DESC);

-- جلسة نشطة واحدة فقط لكل زوج عميل/حلاق (قبل انتهاء الصلاحية أو الإغلاق)
CREATE UNIQUE INDEX IF NOT EXISTS private_conversations_one_active_per_pair_idx
  ON public.private_conversations(customer_id, barber_user_id)
  WHERE status = 'active';

-- 2) جدول الرسائل الخاصة
CREATE TABLE IF NOT EXISTS public.private_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.private_conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  body TEXT NOT NULL CHECK (char_length(body) BETWEEN 1 AND 2000),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  read_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS private_messages_conversation_created_idx
  ON public.private_messages(conversation_id, created_at DESC);
CREATE INDEX IF NOT EXISTS private_messages_sender_idx
  ON public.private_messages(sender_id);

-- 3) دوال مساعدة (RLS / صلاحية الجلسة)
CREATE OR REPLACE FUNCTION public.is_private_conversation_participant(conv public.private_conversations)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
AS $$
  SELECT auth.uid() IS NOT NULL
     AND (auth.uid() = conv.customer_id OR auth.uid() = conv.barber_user_id);
$$;

CREATE OR REPLACE FUNCTION public.is_private_conversation_open(conv public.private_conversations)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
AS $$
  SELECT conv.status = 'active'
     AND conv.closed_at IS NULL
     AND conv.expires_at > NOW();
$$;

-- تحديث آلي لحقل آخر رسالة
CREATE OR REPLACE FUNCTION public.touch_private_conversation_last_message()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.private_conversations
  SET last_message_at = NEW.created_at
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_private_message_created_touch_conversation ON public.private_messages;
CREATE TRIGGER on_private_message_created_touch_conversation
  AFTER INSERT ON public.private_messages
  FOR EACH ROW EXECUTE FUNCTION public.touch_private_conversation_last_message();

-- منع العبث بالهوية أو تمديد الجلسة يدوياً
CREATE OR REPLACE FUNCTION public.guard_private_conversation_update()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.customer_id <> OLD.customer_id
     OR NEW.barber_user_id <> OLD.barber_user_id
     OR NEW.started_at <> OLD.started_at THEN
    RAISE EXCEPTION 'Participants and started_at are immutable';
  END IF;

  IF NEW.expires_at <> OLD.expires_at THEN
    RAISE EXCEPTION 'expires_at cannot be changed manually';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_private_conversation_guard_update ON public.private_conversations;
CREATE TRIGGER on_private_conversation_guard_update
  BEFORE UPDATE ON public.private_conversations
  FOR EACH ROW EXECUTE FUNCTION public.guard_private_conversation_update();

-- إنهاء تلقائي للجلسات المنتهية
CREATE OR REPLACE FUNCTION public.expire_private_conversations(
  p_customer_id UUID DEFAULT NULL,
  p_barber_user_id UUID DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  UPDATE public.private_conversations c
  SET status = 'expired',
      closed_at = COALESCE(c.closed_at, NOW())
  WHERE c.status = 'active'
    AND c.expires_at <= NOW()
    AND (p_customer_id IS NULL OR c.customer_id = p_customer_id)
    AND (p_barber_user_id IS NULL OR c.barber_user_id = p_barber_user_id);
END;
$$;

REVOKE ALL ON FUNCTION public.expire_private_conversations(UUID, UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.expire_private_conversations(UUID, UUID) TO authenticated;

-- بدء/استعادة جلسة نشطة (ساعة واحدة)
CREATE OR REPLACE FUNCTION public.start_private_conversation(
  p_barber_user_id UUID,
  p_barber_id UUID DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_uid UUID;
  v_conv_id UUID;
BEGIN
  v_uid := auth.uid();
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF p_barber_user_id IS NULL OR p_barber_user_id = v_uid THEN
    RAISE EXCEPTION 'Invalid barber user id';
  END IF;

  -- أغلق المنتهي قبل البحث/الإنشاء حتى لا يتعارض unique active index
  PERFORM public.expire_private_conversations(v_uid, p_barber_user_id);

  SELECT c.id
    INTO v_conv_id
  FROM public.private_conversations c
  WHERE c.customer_id = v_uid
    AND c.barber_user_id = p_barber_user_id
    AND c.status = 'active'
    AND c.expires_at > NOW()
  ORDER BY c.started_at DESC
  LIMIT 1;

  IF v_conv_id IS NULL THEN
    INSERT INTO public.private_conversations (
      customer_id, barber_user_id, barber_id, status, started_at, expires_at
    )
    VALUES (
      v_uid, p_barber_user_id, p_barber_id, 'active', NOW(), NOW() + INTERVAL '1 hour'
    )
    RETURNING id INTO v_conv_id;
  END IF;

  RETURN v_conv_id;
END;
$$;

REVOKE ALL ON FUNCTION public.start_private_conversation(UUID, UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.start_private_conversation(UUID, UUID) TO authenticated;

-- إغلاق يدوي للجلسة من أي طرف مشارك
CREATE OR REPLACE FUNCTION public.close_private_conversation(p_conversation_id UUID)
RETURNS VOID
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, auth
AS $$
  UPDATE public.private_conversations c
  SET status = 'closed', closed_at = NOW()
  WHERE c.id = p_conversation_id
    AND c.status = 'active'
    AND (c.customer_id = auth.uid() OR c.barber_user_id = auth.uid());
$$;

REVOKE ALL ON FUNCTION public.close_private_conversation(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.close_private_conversation(UUID) TO authenticated;

-- 4) RLS policies
ALTER TABLE public.private_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.private_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "participants_select_private_conversations" ON public.private_conversations;
CREATE POLICY "participants_select_private_conversations"
  ON public.private_conversations
  FOR SELECT TO authenticated
  USING (public.is_private_conversation_participant(private_conversations));

DROP POLICY IF EXISTS "customer_insert_private_conversations" ON public.private_conversations;
CREATE POLICY "customer_insert_private_conversations"
  ON public.private_conversations
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = customer_id
    AND customer_id <> barber_user_id
    AND status = 'active'
  );

DROP POLICY IF EXISTS "participants_update_private_conversations" ON public.private_conversations;
CREATE POLICY "participants_update_private_conversations"
  ON public.private_conversations
  FOR UPDATE TO authenticated
  USING (public.is_private_conversation_participant(private_conversations))
  WITH CHECK (public.is_private_conversation_participant(private_conversations));

DROP POLICY IF EXISTS "participants_select_private_messages" ON public.private_messages;
CREATE POLICY "participants_select_private_messages"
  ON public.private_messages
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.private_conversations c
      WHERE c.id = private_messages.conversation_id
        AND (c.customer_id = auth.uid() OR c.barber_user_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "participants_insert_private_messages_open_only" ON public.private_messages;
CREATE POLICY "participants_insert_private_messages_open_only"
  ON public.private_messages
  FOR INSERT TO authenticated
  WITH CHECK (
    sender_id = auth.uid()
    AND EXISTS (
      SELECT 1
      FROM public.private_conversations c
      WHERE c.id = private_messages.conversation_id
        AND (c.customer_id = auth.uid() OR c.barber_user_id = auth.uid())
        AND public.is_private_conversation_open(c)
    )
  );

DROP POLICY IF EXISTS "participants_update_private_messages" ON public.private_messages;
CREATE POLICY "participants_update_private_messages"
  ON public.private_messages
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.private_conversations c
      WHERE c.id = private_messages.conversation_id
        AND (c.customer_id = auth.uid() OR c.barber_user_id = auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.private_conversations c
      WHERE c.id = private_messages.conversation_id
        AND (c.customer_id = auth.uid() OR c.barber_user_id = auth.uid())
    )
  );

COMMENT ON TABLE public.private_conversations IS
  'جلسة محادثة خاصة بين عميل وحلاق لمدة ساعة. ينتهي الوصول للإرسال بعد انتهاء expires_at.';

COMMENT ON TABLE public.private_messages IS
  'رسائل محادثة خاصة مرتبطة بـ private_conversations مع حماية RLS للمشاركين فقط.';

