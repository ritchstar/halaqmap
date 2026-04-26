type PartnerAssistantRole = 'user' | 'assistant';

export type PartnerAssistantMessage = {
  role: PartnerAssistantRole;
  content: string;
};

/** مسار API الافتراضي للمساعد — يجب أن يطابق دالة Vercel `api/partner-assistant-chat`. */
export const PARTNER_ASSISTANT_CHAT_API_PATH = '/api/partner-assistant-chat';

function endpoint(): string {
  return String(import.meta.env.VITE_PARTNER_ASSISTANT_CHAT_URL || PARTNER_ASSISTANT_CHAT_API_PATH).trim();
}

/** يزيل فقاعات المساعد الأولى حتى يبدأ الطلب بـ user (مطلوب لبعض المزودين). */
export function toPartnerAssistantApiMessages(
  messages: PartnerAssistantMessage[],
  maxTurns = 24
): PartnerAssistantMessage[] {
  const firstUser = messages.findIndex((m) => m.role === 'user');
  if (firstUser === -1) return [];
  let out = messages.slice(firstUser);
  if (out.length > maxTurns) out = out.slice(-maxTurns);
  while (out.length > 0 && out[0]!.role !== 'user') out = out.slice(1);
  return out;
}

export async function askPartnerAssistant(input: {
  messages: PartnerAssistantMessage[];
  pathname?: string;
}): Promise<{ ok: true; reply: string } | { ok: false; error: string }> {
  const ep = endpoint();
  if (!ep) return { ok: false, error: 'مسار مساعد الشركاء غير مضبوط.' };

  const payloadMessages = toPartnerAssistantApiMessages(input.messages);
  if (payloadMessages.length === 0) {
    return { ok: false, error: 'لا يوجد سؤال لإرساله.' };
  }

  try {
    const response = await fetch(ep, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: payloadMessages,
        pathname: input.pathname || '',
      }),
    });

    const payload = (await response.json().catch(() => ({}))) as {
      ok?: boolean;
      reply?: unknown;
      error?: unknown;
      hint?: unknown;
    };

    if (!response.ok) {
      const base = String(payload.error || `HTTP ${response.status}`);
      const hint = String(payload.hint || '').trim();
      return { ok: false, error: hint ? `${base} — ${hint}` : base };
    }

    const reply = String(payload.reply || '').trim();
    if (!reply) return { ok: false, error: 'لم يصل رد من المساعد حالياً.' };
    return { ok: true, reply };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'فشل الاتصال بخدمة مساعد الشركاء.';
    return { ok: false, error: message };
  }
}
