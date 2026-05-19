function resolveBaseUrl(): string {
  const override = (import.meta.env.VITE_BARBER_DIGITAL_SHIFT_URL as string | undefined)?.trim();
  if (override) return override.replace(/\/$/, '');
  return '/api/barber-digital-shift-assistant';
}

export type DigitalShiftRecommendation = {
  id: string;
  barber_id: string;
  category: 'balance' | 'banner' | 'gallery' | 'shift_chat';
  title: string;
  body: string;
  priority: number;
  status: string;
  metadata: Record<string, unknown>;
  created_at: string;
  expires_at: string | null;
};

export type DigitalShiftSummary = {
  context: {
    barberId: string;
    barberName: string;
    assistantName: string;
    shopOpen: boolean;
    listingDaysRemaining: number;
    walletBalanceHalalas: number;
    walletLowThresholdHalalas: number;
    replyDelayMinutes: number;
  };
  config: {
    assistant_display_name: string;
    reply_delay_minutes: number;
    enabled: boolean;
    last_insights_refresh_at: string | null;
  } | null;
  wallet: {
    balance_halalas: number;
    total_spent_halalas: number;
    low_balance_threshold_halalas: number;
  } | null;
  recommendations: DigitalShiftRecommendation[];
};

async function post<T>(payload: Record<string, unknown>): Promise<T | { ok: false; error: string }> {
  try {
    const res = await fetch(resolveBaseUrl(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const json = (await res.json().catch(() => ({}))) as T & { error?: string };
    if (!res.ok) return { ok: false, error: json.error || `HTTP ${res.status}` };
    return json;
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Network error' };
  }
}

export async function fetchDigitalShiftSummaryRemote(params: {
  barberId: string;
  email: string;
}): Promise<{ ok: true; data: DigitalShiftSummary } | { ok: false; error: string }> {
  const r = await post<{ ok: true } & DigitalShiftSummary>({
    action: 'summary',
    barberId: params.barberId,
    email: params.email,
  });
  if ('error' in r && !('context' in r)) return { ok: false, error: r.error || 'Failed' };
  return { ok: true, data: r as DigitalShiftSummary };
}

export async function refreshDigitalShiftRecommendationsRemote(params: {
  barberId: string;
  email: string;
  bannerImageUrls?: string[];
  showDiscountBadge?: boolean;
  discountPercent?: number | null;
  galleryItems?: { id: string; createdAt?: string; imageUrl?: string }[];
}): Promise<{ ok: true; recommendations: DigitalShiftRecommendation[] } | { ok: false; error: string }> {
  const r = await post<{ ok: true; recommendations: DigitalShiftRecommendation[] }>({
    action: 'refresh_recommendations',
    ...params,
  });
  if ('error' in r && !('recommendations' in r)) return { ok: false, error: r.error || 'Failed' };
  return { ok: true, recommendations: r.recommendations ?? [] };
}

export async function updateDigitalShiftSettingsRemote(params: {
  barberId: string;
  email: string;
  assistantDisplayName?: string;
  enabled?: boolean;
  replyDelayMinutes?: number;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const r = await post<{ ok: true }>({ action: 'update_settings', ...params });
  if ('error' in r && r.ok !== true) return { ok: false, error: (r as { error: string }).error };
  return { ok: true };
}

export async function dismissDigitalShiftRecommendationRemote(params: {
  barberId: string;
  email: string;
  recommendationId: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const r = await post<{ ok: true }>({ action: 'dismiss_recommendation', ...params });
  if ('error' in r && r.ok !== true) return { ok: false, error: (r as { error: string }).error };
  return { ok: true };
}

export async function digitalShiftBarberChatRemote(params: {
  barberId: string;
  email: string;
  message: string;
  history?: { role: 'user' | 'assistant'; content: string }[];
}): Promise<{ ok: true; reply: string } | { ok: false; error: string }> {
  const r = await post<{ ok: true; reply: string }>({ action: 'barber_chat', ...params });
  if ('error' in r && !('reply' in r)) return { ok: false, error: r.error || 'Failed' };
  return { ok: true, reply: String(r.reply ?? '') };
}
