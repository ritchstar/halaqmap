/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * حالة المعاينة المحلية لدعوة الزواج — لا خادم ولا قائمة ضيوف.
 */
import {
  STORE_WEDDING_LIVE_AUDIO,
  STORE_WEDDING_LIVE_CANNED,
  STORE_WEDDING_LIVE_DEMO,
  STORE_WEDDING_LIVE_DEMO_WOMEN,
  STORE_WEDDING_LIVE_HOST_ROLES,
  STORE_WEDDING_LIVE_LAB_TOKEN_WOMEN,
  STORE_WEDDING_LIVE_STYLES,
  type StoreWeddingLiveHostRole,
  type StoreWeddingLiveVoice,
} from '@/config/storeWeddingLive';
import { normalizeWeddingWelcomeSetIndex } from '@/config/storeWeddingWelcomeSets';

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
  voice: StoreWeddingLiveVoice;
  hostRole: WeddingLiveHostRole;
  hostName: string;
  groomName: string;
  brideName: string;
  eventDate: string;
  eventTime: string;
  venueName: string;
  venueMapsUrl: string;
  welcomeAr: string;
  welcomeSetIndex: number;
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
  return `store-wedding-live:v4:${token.trim() || 'lab'}`;
}

export function weddingLiveVoiceFromToken(token: string): StoreWeddingLiveVoice {
  return token.trim() === STORE_WEDDING_LIVE_LAB_TOKEN_WOMEN ? 'women' : 'men';
}

export function normalizeWeddingVoice(raw: unknown): StoreWeddingLiveVoice {
  return String(raw || '').trim() === 'women' ? 'women' : 'men';
}

export function normalizeWeddingHostRole(raw: unknown, voice: StoreWeddingLiveVoice = 'men'): WeddingLiveHostRole {
  const value = String(raw || '').trim();
  const forVoice = STORE_WEDDING_LIVE_HOST_ROLES.filter((item) => item.voice === voice);
  if (forVoice.some((item) => item.id === value)) return value as WeddingLiveHostRole;
  if (voice === 'women') {
    if (value === 'groom_father') return 'groom_mother';
    if (value === 'bride_father') return 'bride_mother';
    return 'groom_mother';
  }
  if (value === 'groom_mother') return 'groom_father';
  if (value === 'bride_mother') return 'bride_father';
  return STORE_WEDDING_LIVE_HOST_ROLES.some((item) => item.id === value) ? (value as WeddingLiveHostRole) : 'self';
}

export function weddingLiveDefaultStyle(voice: StoreWeddingLiveVoice): WeddingLiveStyleId {
  return voice === 'women' ? 'rosegold' : 'gold';
}

export function weddingHostInviteLine(
  host: Pick<WeddingLiveHostState, 'hostName' | 'hostRole'> & { voice?: StoreWeddingLiveVoice },
): string {
  const voice = normalizeWeddingVoice(host.voice);
  const name = host.hostName.trim();
  const roleId = normalizeWeddingHostRole(host.hostRole, voice);
  const role = STORE_WEDDING_LIVE_HOST_ROLES.find((item) => item.id === roleId && item.voice === voice);
  const prefix = role?.linePrefixAr || (voice === 'women' ? 'الداعية' : 'الداعي');
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

export function defaultWeddingLiveLabState(voice: StoreWeddingLiveVoice = 'men'): WeddingLiveLabState {
  const demo = voice === 'women' ? STORE_WEDDING_LIVE_DEMO_WOMEN : STORE_WEDDING_LIVE_DEMO;
  return {
    host: {
      voice,
      hostRole: demo.hostRole,
      hostName: demo.hostName,
      groomName: demo.groomName,
      brideName: demo.brideName,
      eventDate: demo.eventDate,
      eventTime: demo.eventTime,
      venueName: demo.venueName,
      venueMapsUrl: demo.venueMapsUrl,
      welcomeAr: demo.welcomeAr,
      welcomeSetIndex: 0,
      youtubeUrl: demo.youtubeUrl,
      youtubeHidden: demo.youtubeHidden,
      announcement: demo.announcement,
      audioClipId: 'none',
      photoSrc: demo.photoSrc,
      panoramaSrc: demo.panoramaSrc,
      cardStyleId: weddingLiveDefaultStyle(voice),
    },
    blessings: [
      {
        id: 'seed-1',
        name: voice === 'women' ? 'سارة' : 'محمد',
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
  const voice = weddingLiveVoiceFromToken(token);
  const fallback = defaultWeddingLiveLabState(voice);
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(storageKey(token));
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as Partial<WeddingLiveLabState>;
    const parsedHost = parsed.host as Partial<WeddingLiveHostState> | undefined;
    const nextVoice = normalizeWeddingVoice(parsedHost?.voice ?? voice);
    return {
      host: {
        ...fallback.host,
        ...(parsedHost || {}),
        voice: nextVoice,
        hostRole: normalizeWeddingHostRole(parsedHost?.hostRole, nextVoice),
        welcomeSetIndex: normalizeWeddingWelcomeSetIndex(parsedHost?.welcomeSetIndex),
        cardStyleId: parsedHost?.cardStyleId || weddingLiveDefaultStyle(nextVoice),
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
        photoSrc: state.host.photoSrc.startsWith('data:')
          ? (state.host.voice === 'women' ? STORE_WEDDING_LIVE_DEMO_WOMEN.photoSrc : STORE_WEDDING_LIVE_DEMO.photoSrc)
          : state.host.photoSrc,
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
    product: state.host.voice === 'women' ? 'دعوة زواج تفاعلية نسائية' : 'دعوة زواج تفاعلية',
    brand: 'halaqmap',
    voice: state.host.voice,
    hostName: state.host.hostName,
    hostRole: state.host.hostRole,
    groomName: state.host.groomName,
    brideName: state.host.brideName,
    eventDate: state.host.eventDate,
    eventTime: state.host.eventTime,
    venueName: state.host.venueName,
    welcomeAr: state.host.welcomeAr,
    welcomeSetIndex: state.host.welcomeSetIndex,
    announcement: state.host.announcement,
    blessings: visible,
  };
  return new Blob([JSON.stringify(body, null, 2)], { type: 'application/json;charset=utf-8' });
}
