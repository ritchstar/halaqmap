/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * غلاف نداء واجهة «دليلك» — مساعد اختيار المسار في متجر خريطة الحل.
 */
export type DaleelakChatRole = 'user' | 'assistant';
export type DaleelakChatMessage = { role: DaleelakChatRole; content: string };

const PATH = '/api/public-daleelak-chat';

async function readJson(res: Response): Promise<Record<string, unknown>> {
  return (await res.json().catch(() => ({}))) as Record<string, unknown>;
}

export async function askDaleelak(input: {
  message: string;
  history?: DaleelakChatMessage[];
}): Promise<{ ok: true; reply: string } | { ok: false; error: string }> {
  const message = input.message.trim();
  if (!message) return { ok: false, error: 'لا يوجد سؤال لإرساله.' };
  try {
    const res = await fetch(PATH, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, history: (input.history || []).slice(-8) }),
    });
    const data = await readJson(res);
    if (!res.ok || typeof data.reply !== 'string') {
      return { ok: false, error: typeof data.error === 'string' ? data.error : 'تعذر الحصول على رد.' };
    }
    return { ok: true, reply: data.reply };
  } catch {
    return { ok: false, error: 'تعذر الاتصال بدليلك.' };
  }
}
