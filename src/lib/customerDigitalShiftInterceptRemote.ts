function resolveBaseUrl(): string {
  const override = (import.meta.env.VITE_CUSTOMER_DIGITAL_SHIFT_INTERCEPT_URL as string | undefined)?.trim();
  if (override) return override.replace(/\/$/, '');
  return '/api/customer-digital-shift-intercept';
}

export async function customerDigitalShiftInterceptRemote(conversationId: string): Promise<
  | {
      ok: true;
      replied: boolean;
      reason?: string;
      trigger?: string;
    }
  | { ok: false; error: string }
> {
  try {
    const res = await fetch(resolveBaseUrl(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ conversationId }),
    });
    const json = (await res.json().catch(() => ({}))) as {
      ok?: boolean;
      replied?: boolean;
      reason?: string;
      trigger?: string;
      error?: string;
    };
    if (!res.ok) return { ok: false, error: json.error || `HTTP ${res.status}` };
    return {
      ok: true,
      replied: json.replied === true,
      reason: json.reason,
      trigger: json.trigger,
    };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Network error' };
  }
}
