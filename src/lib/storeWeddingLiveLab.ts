/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * حالة المعاينة المحلية لدعوة الزواج — لا خادم ولا قائمة ضيوف.
 */
import {
  STORE_WEDDING_LIVE_AUDIO,
  STORE_WEDDING_LIVE_CANNED,
  STORE_WEDDING_LIVE_DEMO,
  STORE_WEDDING_LIVE_HOST_ROLES,
  STORE_WEDDING_LIVE_STYLES,
  type StoreWeddingLiveHostRole,
} from '@/config/storeWeddingLive';

export type WeddingLiveAudioId = (typeof STORE_WEDDING_LIVE_AUDIO)[number]['id'];
export type WeddingLiveStyleId = (typeof STORE_WEDDING_LIVE_STYLES)[number]['id'];

export type WeddingLiveBlessing = {
  id: string;
  name: string;
  cannedId: string;
  cannedText: string;
  extra: string;
  hidden: boolean;
  at: string;
};

export type WeddingLiveHostRole = StoreWeddingLiveHostRole;

export type WeddingLiveHostState = {
  hostRole: WeddingLiveHostRole;
  hostName: string;
  groomName: string;
  brideName: string;
  eventDate: string;
  eventTime: string;
  venueName: string;
  venueMapsUrl: string;
  welcomeAr: string;
  youtubeUrl: string;
  youtubeHidden: boolean;
  announcement: string;
  audioClipId: WeddingLiveAudioId;
  photoSrc: string;
  panoramaSrc: string;
  cardStyleId: WeddingLiveStyleId;
};

export type WeddingLiveLabState = {
  host: WeddingLiveHostState;
  blessings: WeddingLiveBlessing[];
};

function storageKey(token: string): string {
  return `store-wedding-live:v3:${token.trim() || 'lab'}`;
}

export function normalizeWeddingHostRole(raw: unknown): WeddingLiveHostRole {
  const value = String(raw || '').trim();
  return STORE_WEDDING_LIVE_HOST_ROLES.some((item) => item.id === value)
    ? (value as WeddingLiveHostRole)
    : 'self';
}

export function weddingHostInviteLine(host: Pick<WeddingLiveHostState, 'hostName' | 'hostRole'>): string {
  const name = host.hostName.trim();
  const role = STORE_WEDDING_LIVE_HOST_ROLES.find((item) => item.id === normalizeWeddingHostRole(host.hostRole));
  const prefix = role?.linePrefixAr || 'الداعي';
  return name ? `${prefix} ${name}` : prefix;
}

export function weddingCoupleLine(host: WeddingLiveHostState): string {
  const groom = host.groomName.trim();
  const bride = host.brideName.trim();
  if (groom && bride) return `${groom} و${bride}`;
  return groom || bride || host.hostName.trim();
}

export function safeMapsHref(raw: string): string | null {
  const t = String(raw || '').trim();
  if (!t) return null;
  try {
    const u = new URL(t);
    if (u.protocol !== 'https:') return null;
    const host = u.hostname.replace(/^www\./, '').toLowerCase();
    if (host === 'maps.google.com' || host === 'maps.app.goo.gl') return u.toString();
    if (host === 'google.com' && u.pathname.startsWith('/maps')) return u.toString();
    return null;
  } catch {
    return null;
  }
}

export function defaultWeddingLiveLabState(): WeddingLiveLabState {
  return {
    host: {
      hostRole: STORE_WEDDING_LIVE_DEMO.hostRole,
      hostName: STORE_WEDDING_LIVE_DEMO.hostName,
      groomName: STORE_WEDDING_LIVE_DEMO.groomName,
      brideName: STORE_WEDDING_LIVE_DEMO.brideName,
      eventDate: STORE_WEDDING_LIVE_DEMO.eventDate,
      eventTime: STORE_WEDDING_LIVE_DEMO.eventTime,
      venueName: STORE_WEDDING_LIVE_DEMO.venueName,
      venueMapsUrl: STORE_WEDDING_LIVE_DEMO.venueMapsUrl,
      welcomeAr: STORE_WEDDING_LIVE_DEMO.welcomeAr,
      youtubeUrl: STORE_WEDDING_LIVE_DEMO.youtubeUrl,
      youtubeHidden: STORE_WEDDING_LIVE_DEMO.youtubeHidden,
      announcement: STORE_WEDDING_LIVE_DEMO.announcement,
      audioClipId: 'none',
      photoSrc: STORE_WEDDING_LIVE_DEMO.photoSrc,
      panoramaSrc: STORE_WEDDING_LIVE_DEMO.panoramaSrc,
      cardStyleId: 'gold',
    },
    blessings: [
      {
        id: 'seed-1',
        name: 'محمد',
        cannedId: 'baraka',
        cannedText: STORE_WEDDING_LIVE_CANNED[0].textAr,
        extra: '',
        hidden: false,
        at: new Date().toISOString(),
      },
    ],
  };
}

export function readWeddingLiveLabState(token: string): WeddingLiveLabState {
  const fallback = defaultWeddingLiveLabState();
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(storageKey(token));
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as Partial<WeddingLiveLabState>;
    return {
      host: {
        ...fallback.host,
        ...(parsed.host || {}),
        hostRole: normalizeWeddingHostRole((parsed.host as Partial<WeddingLiveHostState> | undefined)?.hostRole),
      },
      blessings: Array.isArray(parsed.blessings) ? parsed.blessings : fallback.blessings,
    };
  } catch {
    return fallback;
  }
}

export function writeWeddingLiveLabState(token: string, state: WeddingLiveLabState): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(storageKey(token), JSON.stringify(state));
  } catch {
    const slim = {
      ...state,
      host: {
        ...state.host,
        photoSrc: state.host.photoSrc.startsWith('data:') ? STORE_WEDDING_LIVE_DEMO.photoSrc : state.host.photoSrc,
        panoramaSrc: state.host.panoramaSrc.startsWith('data:')
          ? STORE_WEDDING_LIVE_DEMO.panoramaSrc
          : state.host.panoramaSrc,
      },
    };
    window.localStorage.setItem(storageKey(token), JSON.stringify(slim));
  }
}

export async function compressImageFile(file: File, maxEdge = 1400): Promise<string> {
  if (!file.type.startsWith('image/')) throw new Error('not_image');
  if (file.size > 8 * 1024 * 1024) throw new Error('too_large');
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
  const w = Math.max(1, Math.round(bitmap.width * scale));
  const h = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('canvas');
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();
  return canvas.toDataURL('image/jpeg', 0.72);
}

export function parseYoutubeVideoId(raw: string): string | null {
  const t = String(raw || '').trim();
  if (!t) return null;
  if (/^[a-zA-Z0-9_-]{11}$/.test(t)) return t;
  try {
    const u = new URL(t);
    if (u.hostname.replace(/^www\./, '') === 'youtu.be') {
      const id = u.pathname.replace(/^\//, '').slice(0, 11);
      return /^[a-zA-Z0-9_-]{11}$/.test(id) ? id : null;
    }
    const host = u.hostname.replace(/^www\./, '');
    if (host !== 'youtube.com' && host !== 'youtube-nocookie.com' && host !== 'm.youtube.com') {
      return null;
    }
    const v = u.searchParams.get('v');
    if (v && /^[a-zA-Z0-9_-]{11}$/.test(v)) return v;
    const embed = u.pathname.match(/\/embed\/([a-zA-Z0-9_-]{11})/);
    return embed?.[1] || null;
  } catch {
    return null;
  }
}

export function youtubeEmbedSrc(raw: string): string | null {
  const id = parseYoutubeVideoId(raw);
  if (!id) return null;
  return `https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1`;
}

export function playWeddingLiveChime(kind: Exclude<WeddingLiveAudioId, 'none'>): void {
  const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctx) return;
  const ctx = new Ctx();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.value = kind === 'welcome' ? 523.25 : 392;
  gain.gain.value = 0.08;
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.1);
  osc.stop(ctx.currentTime + 1.2);
  window.setTimeout(() => void ctx.close(), 1500);
}

export function weddingLiveArchiveBlob(state: WeddingLiveLabState): Blob {
  const visible = state.blessings.filter((item) => !item.hidden).map((item) => ({
    name: item.name,
    text: item.extra ? `${item.cannedText} ${item.extra}` : item.cannedText,
  }));
  const body = {
    product: 'دعوة زواج تفاعلية',
    brand: 'halaqmap',
    hostName: state.host.hostName,
    hostRole: state.host.hostRole,
    groomName: state.host.groomName,
    brideName: state.host.brideName,
    eventDate: state.host.eventDate,
    eventTime: state.host.eventTime,
    venueName: state.host.venueName,
    welcomeAr: state.host.welcomeAr,
    announcement: state.host.announcement,
    blessings: visible,
  };
  return new Blob([JSON.stringify(body, null, 2)], { type: 'application/json;charset=utf-8' });
}
