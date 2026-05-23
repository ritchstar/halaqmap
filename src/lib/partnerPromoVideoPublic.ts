export type PartnerPromoPublicPayload = {
  ok: boolean;
  enabled: boolean;
  videoUrl: string | null;
  updatedAt: string | null;
};

export async function fetchPartnerPromoVideoPublic(): Promise<PartnerPromoPublicPayload> {
  try {
    const res = await fetch('/api/partner-promo', { method: 'GET' });
    const json = (await res.json().catch(() => ({}))) as {
      ok?: boolean;
      enabled?: boolean;
      videoUrl?: string | null;
      updatedAt?: string | null;
    };
    return {
      ok: res.ok && json.ok !== false,
      enabled: Boolean(json.enabled),
      videoUrl: typeof json.videoUrl === 'string' && json.videoUrl.trim() ? json.videoUrl.trim() : null,
      updatedAt: typeof json.updatedAt === 'string' && json.updatedAt.trim() ? json.updatedAt.trim() : null,
    };
  } catch {
    return { ok: false, enabled: false, videoUrl: null, updatedAt: null };
  }
}
