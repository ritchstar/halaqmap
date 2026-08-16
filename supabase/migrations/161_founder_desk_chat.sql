-- Copyright © 2026 HalaqMap. All Rights Reserved.
-- مكتب المؤسس: شات مباشر ٦٠ دقيقة من بنر مسار الشركاء.
-- الإدراج والقراءة عبر service_role فقط — لا وصول عام من العميل.

CREATE TABLE IF NOT EXISTS public.founder_desk_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_client_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'active',
  started_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  closed_at timestamptz,
  last_message_at timestamptz,
  last_visitor_at timestamptz,
  last_founder_at timestamptz,
  visitor_preview text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT founder_desk_conversations_status_chk
    CHECK (status IN ('active', 'expired', 'closed')),
  CONSTRAINT founder_desk_conversations_preview_len
    CHECK (visitor_preview IS NULL OR char_length(visitor_preview) <= 120)
);

COMMENT ON TABLE public.founder_desk_conversations IS
  'جلسات شات مكتب المؤسس من بنر مسار الشركاء. تنتهي تلقائياً بعد ٦٠ دقيقة.';

CREATE TABLE IF NOT EXISTS public.founder_desk_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.founder_desk_conversations (id) ON DELETE CASCADE,
  sender text NOT NULL,
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  read_at timestamptz,
  CONSTRAINT founder_desk_messages_sender_chk
    CHECK (sender IN ('visitor', 'founder')),
  CONSTRAINT founder_desk_messages_body_len
    CHECK (char_length(body) BETWEEN 1 AND 800)
);

COMMENT ON TABLE public.founder_desk_messages IS
  'رسائل مكتب المؤسس. الزائر أو المؤسس فقط، بلا مناوب رقمي.';

CREATE INDEX IF NOT EXISTS founder_desk_conversations_guest_active_idx
  ON public.founder_desk_conversations (guest_client_id, status, expires_at DESC);

CREATE INDEX IF NOT EXISTS founder_desk_conversations_inbox_idx
  ON public.founder_desk_conversations (last_message_at DESC NULLS LAST, started_at DESC);

CREATE INDEX IF NOT EXISTS founder_desk_messages_conv_idx
  ON public.founder_desk_messages (conversation_id, created_at);

ALTER TABLE public.founder_desk_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.founder_desk_messages ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.founder_desk_conversations FROM PUBLIC;
REVOKE ALL ON TABLE public.founder_desk_conversations FROM anon, authenticated;
REVOKE ALL ON TABLE public.founder_desk_messages FROM PUBLIC;
REVOKE ALL ON TABLE public.founder_desk_messages FROM anon, authenticated;

GRANT SELECT, INSERT, UPDATE ON TABLE public.founder_desk_conversations TO service_role;
GRANT SELECT, INSERT, UPDATE ON TABLE public.founder_desk_messages TO service_role;

DROP POLICY IF EXISTS founder_desk_conversations_service_role ON public.founder_desk_conversations;
CREATE POLICY founder_desk_conversations_service_role
  ON public.founder_desk_conversations
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS founder_desk_messages_service_role ON public.founder_desk_messages;
CREATE POLICY founder_desk_messages_service_role
  ON public.founder_desk_messages
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
