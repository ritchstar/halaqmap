import { createHash } from 'node:crypto';
import type { SupabaseClient } from '@supabase/supabase-js';

export type ChatTranslationTarget = 'ar' | 'en';

export type CachedChatTranslation = {
  translatedText: string;
  sourceLang: string | null;
  cached: true;
};

export function chatTranslationContentHash(text: string, target: ChatTranslationTarget): string {
  return createHash('sha256').update(`${target}\0${text}`, 'utf8').digest('hex');
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function getCachedChatTranslation(
  supabase: SupabaseClient,
  input: { messageId?: string; text: string; target: ChatTranslationTarget },
): Promise<CachedChatTranslation | null> {
  const messageId = input.messageId?.trim() ?? '';
  const contentHash = chatTranslationContentHash(input.text, input.target);

  if (messageId && UUID_RE.test(messageId)) {
    const { data, error } = await supabase
      .from('chat_line_translations')
      .select('translated_text, source_lang')
      .eq('message_id', messageId)
      .eq('target_lang', input.target)
      .maybeSingle();
    if (!error && data?.translated_text) {
      return {
        translatedText: String(data.translated_text),
        sourceLang: data.source_lang ? String(data.source_lang) : null,
        cached: true,
      };
    }
  }

  const { data: byHash, error: hashErr } = await supabase
    .from('chat_line_translations')
    .select('translated_text, source_lang')
    .eq('content_hash', contentHash)
    .eq('target_lang', input.target)
    .maybeSingle();

  if (!hashErr && byHash?.translated_text) {
    return {
      translatedText: String(byHash.translated_text),
      sourceLang: byHash.source_lang ? String(byHash.source_lang) : null,
      cached: true,
    };
  }

  return null;
}

export async function storeCachedChatTranslation(
  supabase: SupabaseClient,
  input: {
    messageId?: string;
    text: string;
    target: ChatTranslationTarget;
    translatedText: string;
    sourceLang?: string | null;
    provider?: string;
  },
): Promise<void> {
  const translated = input.translatedText.trim();
  if (!translated) return;

  const messageId = input.messageId?.trim() ?? '';
  const contentHash = chatTranslationContentHash(input.text, input.target);
  const row = {
    message_id: messageId && UUID_RE.test(messageId) ? messageId : null,
    content_hash: contentHash,
    target_lang: input.target,
    source_lang: input.sourceLang?.trim() || null,
    translated_text: translated.slice(0, 4000),
    source_char_count: input.text.length,
    provider: input.provider?.trim() || 'google',
  };

  const { error: insertErr } = await supabase.from('chat_line_translations').insert(row);
  if (!insertErr) return;

  if (insertErr.code !== '23505') return;

  if (row.message_id) {
    await supabase
      .from('chat_line_translations')
      .update({
        content_hash: row.content_hash,
        source_lang: row.source_lang,
        translated_text: row.translated_text,
        source_char_count: row.source_char_count,
        provider: row.provider,
      })
      .eq('message_id', row.message_id)
      .eq('target_lang', row.target_lang);
    return;
  }

  await supabase
    .from('chat_line_translations')
    .update({
      source_lang: row.source_lang,
      translated_text: row.translated_text,
      source_char_count: row.source_char_count,
      provider: row.provider,
    })
    .eq('content_hash', row.content_hash)
    .eq('target_lang', row.target_lang);
}
