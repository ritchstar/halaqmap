/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import type { PlatformYoutubePageId } from '@/config/platformYoutubeGallery';

export type PublicYoutubeBox = {
  id: string;
  titleAr: string;
  videoId: string;
};

export type PublicYoutubeGalleryPayload =
  | { ok: true; page: PlatformYoutubePageId; boxes: PublicYoutubeBox[] }
  | { ok: false; error: string };

function endpoint(): string {
  const base = String(import.meta.env.VITE_VERCEL_API_ORIGIN || '').trim().replace(/\/$/, '');
  return `${base || ''}/api/public-youtube-gallery`;
}

export async function fetchPublicYoutubeGallery(
  page: PlatformYoutubePageId,
): Promise<PublicYoutubeGalleryPayload> {
  try {
    const res = await fetch(`${endpoint()}?page=${encodeURIComponent(page)}`);
    const json = (await res.json().catch(() => ({}))) as PublicYoutubeGalleryPayload & { error?: string };
    if (!res.ok || json.ok === false) return { ok: false, error: json.error || 'تعذر التحميل.' };
    return json;
  } catch {
    return { ok: false, error: 'تعذر الاتصال.' };
  }
}
