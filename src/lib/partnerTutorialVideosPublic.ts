import { useEffect, useState } from 'react';

export type PartnerTutorialVideoPublic = {
  id: string;
  title: string;
  description: string;
  videoUrl: string | null;
  sortOrder: number;
};

export type PartnerTutorialVideosPublicPayload = {
  ok: boolean;
  enabled: boolean;
  videos: PartnerTutorialVideoPublic[];
};

export function isPartnerTutorialSectionVisible(payload: PartnerTutorialVideosPublicPayload): boolean {
  return payload.enabled && payload.videos.length > 0;
}

export async function fetchPartnerTutorialVideosPublic(): Promise<PartnerTutorialVideosPublicPayload> {
  try {
    const res = await fetch('/api/partner-tutorial-videos', { method: 'GET' });
    const json = (await res.json().catch(() => ({}))) as {
      ok?: boolean;
      enabled?: boolean;
      videos?: PartnerTutorialVideoPublic[];
    };
    const videos = Array.isArray(json.videos) ? json.videos : [];
    const enabled = json.enabled !== false && res.ok && json.ok !== false;
    return {
      ok: res.ok && json.ok !== false,
      enabled,
      videos: enabled ? videos : [],
    };
  } catch {
    return { ok: false, enabled: false, videos: [] };
  }
}

/** هل تُعرض صفحة فيديوهات الشرح في التنقّل والمسار العام؟ */
export function usePartnerTutorialSectionVisible(): { visible: boolean; loading: boolean } {
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    void fetchPartnerTutorialVideosPublic().then((payload) => {
      if (cancelled) return;
      setVisible(isPartnerTutorialSectionVisible(payload));
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return { visible, loading };
}
