/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * حالة المعاينة المحلية للاونجا1 — لا خادم ولا قائمة زبائن.
 */
import {
  STORE_LOUNGE_LIVE_CANNED,
  STORE_LOUNGE_LIVE_DEMO,
  STORE_LOUNGE_LIVE_EVENTS,
  loungeLiveEventById,
  type StoreLoungeLiveEventId,
} from '@/config/storeLoungeLive';
import {
  compressImageFile,
  parseYoutubeVideoId,
  playWeddingLiveChime,
  safeMapsHref,
  youtubeEmbedSrc,
} from '@/lib/storeWeddingLiveLab';

export { compressImageFile, parseYoutubeVideoId, playWeddingLiveChime, safeMapsHref, youtubeEmbedSrc };

export type LoungeLiveBlessing = {
  id: string;
  name: string;
  cannedId: string;
  cannedText: string;
  extra: string;
  hidden: boolean;
  at: string;
};

export type LoungeLiveHostState = {
  loungeName: string;
  hostName: string;
  activeEventId: StoreLoungeLiveEventId;
  customEventTitle: string;
  welcomeAr: string;
  youtubeUrl: string;
  youtubeHidden: boolean;
  announcement: string;
  photoSrc: string;
  panoramaSrc: string;
};

export type LoungeLiveLabState = {
  host: LoungeLiveHostState;
  blessings: LoungeLiveBlessing[];
};

function storageKey(token: string): string {
  return `store-lounge-live:v1:${token.trim() || 'lounge-lab'}`;
}

export function defaultLoungeLiveLabState(): LoungeLiveLabState {
  return {
    host: { ...STORE_LOUNGE_LIVE_DEMO },
    blessings: [],
  };
}

export function loungeScreenTitle(host: LoungeLiveHostState): string {
  if (host.activeEventId === 'custom' && host.customEventTitle.trim()) {
    return host.customEventTitle.trim();
  }
  return loungeLiveEventById(host.activeEventId).titleAr;
}

export function applyLoungeEvent(host: LoungeLiveHostState, eventId: StoreLoungeLiveEventId): LoungeLiveHostState {
  const pack = loungeLiveEventById(eventId);
  return {
    ...host,
    activeEventId: eventId,
    welcomeAr: eventId === 'custom' && host.welcomeAr.trim() ? host.welcomeAr : pack.welcomeAr,
  };
}

export function readLoungeLiveLabState(token: string): LoungeLiveLabState {
  const fallback = defaultLoungeLiveLabState();
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(storageKey(token));
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as Partial<LoungeLiveLabState>;
    return {
      host: { ...fallback.host, ...(parsed.host || {}) },
      blessings: Array.isArray(parsed.blessings) ? parsed.blessings : [],
    };
  } catch {
    return fallback;
  }
}

export function writeLoungeLiveLabState(token: string, state: LoungeLiveLabState): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(storageKey(token), JSON.stringify(state));
  } catch {
    /* ignore quota */
  }
}

export const LOUNGE_LIVE_CANNED = STORE_LOUNGE_LIVE_CANNED;
export const LOUNGE_LIVE_EVENTS = STORE_LOUNGE_LIVE_EVENTS;
