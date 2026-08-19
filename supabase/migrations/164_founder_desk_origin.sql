-- Copyright © 2026 HalaqMap. All Rights Reserved.
-- مصدر جلسة مكتب المؤسس: مسار الشركاء أو واجهة المتجر. الصندوق واحد.

ALTER TABLE public.founder_desk_conversations
  ADD COLUMN IF NOT EXISTS origin text NOT NULL DEFAULT 'partners';

ALTER TABLE public.founder_desk_conversations
  DROP CONSTRAINT IF EXISTS founder_desk_conversations_origin_chk;

ALTER TABLE public.founder_desk_conversations
  ADD CONSTRAINT founder_desk_conversations_origin_chk
  CHECK (origin IN ('partners', 'store'));

COMMENT ON COLUMN public.founder_desk_conversations.origin IS
  'مصدر الجلسة: partners = مسار الشركاء، store = واجهة المتجر. صندوق الإدارة واحد.';
