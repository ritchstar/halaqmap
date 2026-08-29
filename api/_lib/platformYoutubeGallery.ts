/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import { parseYoutubeVideoId } from './youtubeUrl.js';

export const PLATFORM_YOUTUBE_PAGE_IDS = ['halaq', 'store'] as const;
export type PlatformYoutubePageId = (typeof PLATFORM_YOUTUBE_PAGE_IDS)[number];
export const PLATFORM_YOUTUBE_BOX_SAFETY_CAP = 400;
export const PLATFORM_YOUTUBE_GALLERY_TABLE = 'platform_youtube_galleries';

export type PlatformYoutubeBox = {
  id: string;
  titleAr: string;
  youtubeUrl: string;
  videoId: string;
};

export function isPlatformYoutubePageId(raw: string): raw is PlatformYoutubePageId {
  return (PLATFORM_YOUTUBE_PAGE_IDS as readonly string[]).includes(raw);
}

function newId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `box-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function cleanTitle(raw: string): string {
  return raw.replace(/\s+/g, ' ').trim().slice(0, 80);
}

export function parseYoutubeDraftBox(raw: unknown): PlatformYoutubeBox | null {
  if (!raw || typeof raw !== 'object') return null;
  const row = raw as Record<string, unknown>;
  const titleAr = cleanTitle(String(row.titleAr || ''));
  const youtubeUrl = String(row.youtubeUrl || '').trim().slice(0, 240);
  const videoId = parseYoutubeVideoId(youtubeUrl) || parseYoutubeVideoId(String(row.videoId || '')) || '';
  const id = String(row.id || '').trim() || newId();
  return { id, titleAr, youtubeUrl, videoId };
}

export function parseYoutubeDraftBoxes(raw: unknown): PlatformYoutubeBox[] {
  if (!Array.isArray(raw)) return [];
  const out: PlatformYoutubeBox[] = [];
  const seen = new Set<string>();
  for (const item of raw) {
    const box = parseYoutubeDraftBox(item);
    if (!box || seen.has(box.id)) continue;
    seen.add(box.id);
    out.push(box);
    if (out.length >= PLATFORM_YOUTUBE_BOX_SAFETY_CAP) break;
  }
  return out;
}

export function parseYoutubeBox(raw: unknown): PlatformYoutubeBox | null {
  if (!raw || typeof raw !== 'object') return null;
  const row = raw as Record<string, unknown>;
  const titleAr = cleanTitle(String(row.titleAr || ''));
  const youtubeUrl = String(row.youtubeUrl || '').trim().slice(0, 240);
  const videoId = parseYoutubeVideoId(youtubeUrl) || parseYoutubeVideoId(String(row.videoId || ''));
  const id = String(row.id || '').trim() || newId();
  if (!titleAr || !videoId) return null;
  return { id, titleAr, youtubeUrl: youtubeUrl || `https://www.youtube.com/watch?v=${videoId}`, videoId };
}

export function parseYoutubeBoxes(raw: unknown): PlatformYoutubeBox[] {
  if (!Array.isArray(raw)) return [];
  const out: PlatformYoutubeBox[] = [];
  const seen = new Set<string>();
  for (const item of raw) {
    const box = parseYoutubeBox(item);
    if (!box || seen.has(box.id)) continue;
    seen.add(box.id);
    out.push(box);
    if (out.length >= PLATFORM_YOUTUBE_BOX_SAFETY_CAP) break;
  }
  return out;
}

export function publicYoutubeBoxes(boxes: PlatformYoutubeBox[]): Array<Pick<PlatformYoutubeBox, 'id' | 'titleAr' | 'videoId'>> {
  return boxes.map((box) => ({ id: box.id, titleAr: box.titleAr, videoId: box.videoId }));
}
