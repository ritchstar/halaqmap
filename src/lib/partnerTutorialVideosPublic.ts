export type PartnerTutorialVideoPublic = {
  id: string;
  title: string;
  description: string;
  videoUrl: string | null;
  sortOrder: number;
};

export async function fetchPartnerTutorialVideosPublic(): Promise<{ ok: boolean; videos: PartnerTutorialVideoPublic[] }> {
  try {
    const res = await fetch('/api/partner-tutorial-videos', { method: 'GET' });
    const json = (await res.json().catch(() => ({}))) as { ok?: boolean; videos?: PartnerTutorialVideoPublic[] };
    return {
      ok: res.ok && json.ok !== false,
      videos: Array.isArray(json.videos) ? json.videos : [],
    };
  } catch {
    return { ok: false, videos: [] };
  }
}

