/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */

export type PlatformConciergeTurn = { role: 'user' | 'assistant'; content: string };

function endpoint(): string {
  const base = String(import.meta.env.VITE_VERCEL_API_ORIGIN || '').trim().replace(/\/$/, '');
  if (base) return `${base}/api/platform-consumer-concierge`;
  return '/api/platform-consumer-concierge';
}

export async function platformConsumerConciergeRemote(input: {
  message: string;
  history?: PlatformConciergeTurn[];
  cityAr?: string | null;
  districtAr?: string | null;
  coverageHint?: string | null;
}): Promise<{ ok: true; reply: string; source: string } | { ok: false; error: string }> {
  const message = input.message.trim();
  if (!message) return { ok: false, error: 'empty_message' };

  try {
    const resp = await fetch(endpoint(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: message.slice(0, 800),
        history: (input.history ?? []).slice(-8),
        cityAr: input.cityAr ?? undefined,
        districtAr: input.districtAr ?? undefined,
        coverageHint: input.coverageHint ?? undefined,
      }),
    });
    const json = (await resp.json().catch(() => ({}))) as {
      ok?: boolean;
      reply?: string;
      source?: string;
      error?: string;
    };
    if (!resp.ok || json.ok === false || !json.reply?.trim()) {
      return { ok: false, error: json.error || `http_${resp.status}` };
    }
    return { ok: true, reply: json.reply.trim(), source: String(json.source || 'unknown') };
  } catch {
    return { ok: false, error: 'network_error' };
  }
}
