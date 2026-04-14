-- =====================================================
-- أتمتة صيانة الشات الخاص (بعد migration 22)
-- الهدف: انتهاء تلقائي + صيانة دورية + منع أي تسرب حالة
-- =====================================================

-- 1) دالة صيانة دورية تُرجع عدد الجلسات التي انتهت
CREATE OR REPLACE FUNCTION public.run_private_chat_maintenance()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_count INTEGER := 0;
BEGIN
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

COMMENT ON FUNCTION public.run_private_chat_maintenance() IS
  'ينهي الجلسات الخاصة المنتهية تلقائياً ويُرجع عدد الجلسات التي تم تحديثها.';

-- 2) تشديد تلقائي قبل إدراج أي رسالة:
--    - تحديث حالة الجلسة إذا انتهت
--    - منع الإرسال إذا لم تعد مفتوحة
CREATE OR REPLACE FUNCTION public.guard_private_message_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_conv public.private_conversations%ROWTYPE;
BEGIN
  SELECT *
  INTO v_conv
  FROM public.private_conversations
  WHERE id = NEW.conversation_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Conversation not found';
  END IF;

  -- مزامنة الحالة تلقائياً عند الحاجة
  IF v_conv.status = 'active' AND v_conv.expires_at <= NOW() THEN
    UPDATE public.private_conversations
    SET status = 'expired',
        closed_at = COALESCE(closed_at, NOW())
    WHERE id = v_conv.id;
    v_conv.status := 'expired';
    v_conv.closed_at := COALESCE(v_conv.closed_at, NOW());
  END IF;

  IF v_conv.status <> 'active' OR v_conv.closed_at IS NOT NULL OR v_conv.expires_at <= NOW() THEN
    RAISE EXCEPTION 'Conversation expired or closed';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS before_private_message_insert_guard ON public.private_messages;
CREATE TRIGGER before_private_message_insert_guard
  BEFORE INSERT ON public.private_messages
  FOR EACH ROW EXECUTE FUNCTION public.guard_private_message_insert();

-- 3) إبقاء status منطقية تلقائياً عند تحديث الجلسة
CREATE OR REPLACE FUNCTION public.normalize_private_conversation_status()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.expires_at <= NOW() AND NEW.status = 'active' THEN
    NEW.status := 'expired';
    NEW.closed_at := COALESCE(NEW.closed_at, NOW());
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS before_private_conversation_normalize_status ON public.private_conversations;
CREATE TRIGGER before_private_conversation_normalize_status
  BEFORE UPDATE ON public.private_conversations
  FOR EACH ROW EXECUTE FUNCTION public.normalize_private_conversation_status();

-- 4) جدولة صيانة دورية تلقائية كل 5 دقائق (إن توفّر pg_cron)
DO $$
DECLARE
  v_jobid BIGINT;
BEGIN
  BEGIN
    CREATE EXTENSION IF NOT EXISTS pg_cron;
  EXCEPTION
    WHEN OTHERS THEN
      -- بعض المشاريع لا تسمح بإنشاء الامتداد من SQL runtime
      RAISE NOTICE 'pg_cron unavailable: %', SQLERRM;
      RETURN;
  END;

  -- حذف أي نسخة قديمة لنفس المهمة لتجنب التكرار
  FOR v_jobid IN
    SELECT jobid
    FROM cron.job
    WHERE jobname = 'private-chat-maintenance-every-5-min'
  LOOP
    PERFORM cron.unschedule(v_jobid);
  END LOOP;

  PERFORM cron.schedule(
    'private-chat-maintenance-every-5-min',
    '*/5 * * * *',
    $job$SELECT public.run_private_chat_maintenance();$job$
  );
END $$;

-- 5) تشغيل صيانة فورية مرة واحدة بعد التثبيت
SELECT public.run_private_chat_maintenance();

