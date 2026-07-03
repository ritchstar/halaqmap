-- تخزين دائم لترجمات شات الماسي — رسالة واحدة × لغة هدف = ترجمة واحدة (توفير حروف Google)

CREATE TABLE IF NOT EXISTS public.chat_line_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID REFERENCES public.private_messages(id) ON DELETE CASCADE,
  content_hash TEXT NOT NULL,
  target_lang TEXT NOT NULL CHECK (target_lang IN ('ar', 'en')),
  source_lang TEXT,
  translated_text TEXT NOT NULL,
  source_char_count INT NOT NULL DEFAULT 0 CHECK (source_char_count >= 0),
  provider TEXT NOT NULL DEFAULT 'google',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chat_line_translations_hash_len_chk CHECK (char_length(content_hash) >= 32),
  CONSTRAINT chat_line_translations_hash_target_unique UNIQUE (content_hash, target_lang)
);

CREATE UNIQUE INDEX IF NOT EXISTS chat_line_translations_message_target_uidx
  ON public.chat_line_translations(message_id, target_lang)
  WHERE message_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS chat_line_translations_created_idx
  ON public.chat_line_translations(created_at DESC);

COMMENT ON TABLE public.chat_line_translations IS
  'كاش ترجمة شات الماسي — يُملأ عبر /api/diamond-chat-translate (service role فقط).';

ALTER TABLE public.chat_line_translations ENABLE ROW LEVEL SECURITY;
