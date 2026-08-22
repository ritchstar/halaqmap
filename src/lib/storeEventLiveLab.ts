/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * حالة المعاينة المحلية للدعوة الحرة — لا خادم ولا قائمة ضيوف.
 */
import {
  STORE_EVENT_LIVE_AUDIO,
  STORE_EVENT_LIVE_CANNED,
  STORE_EVENT_LIVE_DEMO,
  STORE_EVENT_LIVE_DEMO_WOMEN,
  STORE_EVENT_LIVE_HOST_ROLES,
  STORE_EVENT_LIVE_LAB_TOKEN_WOMEN,
  STORE_EVENT_LIVE_STYLES,
  type StoreEventLiveHostRole,
  type StoreEventLiveVoice,
} from '@/config/storeEventLive';
import {
  compressImageFile,
  parseYoutubeVideoId,
  playWeddingLiveChime,
  safeMapsHref,
  youtubeEmbedSrc,
} from '@/lib/storeWeddingLiveLab';

export { compressImageFile, parseYoutubeVideoId, playWeddingLiveChime, safeMapsHref, youtubeEmbedSrc };

export type EventLiveAudioId = (typeof STORE_EVENT_LIVE_AUDIO)[number]['id'];
export type EventLiveStyleId = (typeof STORE_EVENT_LIVE_STYLES)[number]['id'];

export type EventLiveBlessing = {
  id: string;
  name: string;
  cannedId: string;
  cannedText: string;
  extra: string;
  hidden: boolean;
  at: string;
};

export type EventLiveHostRole = StoreEventLiveHostRole;

export type EventLiveHostState = {
  voice: StoreEventLiveVoice;
  hostRole: EventLiveHostRole;
  hostName: string;
  occasionTitle: string;
  eventDate: string;
  eventTime: string;
  venueName: string;
  venueMapsUrl: string;
  welcomeAr: string;
  youtubeUrl: string;
  youtubeHidden: boolean;
  announcement: string;
  audioClipId: EventLiveAudioId;
  photoSrc: string;
  panoramaSrc: string;
  cardStyleId: EventLiveStyleId;
};

export type EventLiveLabState = {
  host: EventLiveHostState;
  blessings: EventLiveBlessing[];
};

function storageKey(token: string): string {
  return `store-event-live:v1:${token.trim() || 'event-lab'}`;
}

export function eventLiveVoiceFromToken(token: string): StoreEventLiveVoice {
  return token.trim() === STORE_EVENT_LIVE_LAB_TOKEN_WOMEN ? 'women' : 'men';
}

export function normalizeEventVoice(raw: unknown): StoreEventLiveVoice {
  return String(raw || '').trim() === 'women' ? 'women' : 'men';
}

export function normalizeEventHostRole(raw: unknown, voice: StoreEventLiveVoice = 'men'): EventLiveHostRole {
  const value = String(raw || '').trim();
  const forVoice = STORE_EVENT_LIVE_HOST_ROLES.filter((item) => item.voice === voice);
  if (forVoice.some((item) => item.id === value)) return value as EventLiveHostRole;
  if (voice === 'women' && value === 'father') return 'mother';
  if (voice === 'men' && value === 'mother') return 'father';
  return 'self';
}

export function eventLiveDefaultStyle(voice: StoreEventLiveVoice): EventLiveStyleId {
  return voice === 'women' ? 'rosegold' : 'gold';
}

export function eventHostInviteLine(
  host: Pick<EventLiveHostState, 'hostName' | 'hostRole'> & { voice?: StoreEventLiveVoice },
): string {
  const voice = normalizeEventVoice(host.voice);
  const name = host.hostName.trim();
  const roleId = normalizeEventHostRole(host.hostRole, voice);
  const role = STORE_EVENT_LIVE_HOST_ROLES.find((item) => item.id === roleId && item.voice === voice);
  const prefix = role?.linePrefixAr || (voice === 'women' ? 'الداعية' : 'الداعي');
  return name ? `${prefix} ${name}` : prefix;
}

export function defaultEventLiveLabState(voice: StoreEventLiveVoice = 'men'): EventLiveLabState {
  const demo = voice === 'women' ? STORE_EVENT_LIVE_DEMO_WOMEN : STORE_EVENT_LIVE_DEMO;
  return {
    host: {
      voice,
      hostRole: 'self',
      hostName: demo.hostName,
      occasionTitle: demo.occasionTitle,
      eventDate: demo.eventDate,
      eventTime: demo.eventTime,
      venueName: demo.venueName,
      venueMapsUrl: demo.venueMapsUrl,
      welcomeAr: demo.welcomeAr,
      youtubeUrl: demo.youtubeUrl,
      youtubeHidden: demo.youtubeHidden,
      announcement: demo.announcement,
      audioClipId: 'none',
      photoSrc: demo.photoSrc,
      panoramaSrc: demo.panoramaSrc,
      cardStyleId: eventLiveDefaultStyle(voice),
    },
    blessings: [
      {
        id: 'seed-1',
        name: voice === 'women' ? 'سارة' : 'محمد',
        cannedId: 'baraka',
        cannedText: STORE_EVENT_LIVE_CANNED[0].textAr,
        extra: '',
        hidden: false,
        at: new Date().toISOString(),
      },
    ],
  };
}

export function readEventLiveLabState(token: string): EventLiveLabState {
  const voice = eventLiveVoiceFromToken(token);
  const fallback = defaultEventLiveLabState(voice);
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(storageKey(token));
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as Partial<EventLiveLabState>;
    const parsedHost = parsed.host as Partial<EventLiveHostState> | undefined;
    const nextVoice = normalizeEventVoice(parsedHost?.voice ?? voice);
    return {
      host: {
        ...fallback.host,
        ...(parsedHost || {}),
        voice: nextVoice,
        hostRole: normalizeEventHostRole(parsedHost?.hostRole, nextVoice),
        cardStyleId: parsedHost?.cardStyleId || eventLiveDefaultStyle(nextVoice),
      },
      blessings: Array.isArray(parsed.blessings) ? parsed.blessings : fallback.blessings,
    };
  } catch {
    return fallback;
  }
}

export function writeEventLiveLabState(token: string, state: EventLiveLabState): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(storageKey(token), JSON.stringify(state));
  } catch {
    const slim = {
      ...state,
      host: {
        ...state.host,
        photoSrc: state.host.photoSrc.startsWith('data:')
          ? (state.host.voice === 'women' ? STORE_EVENT_LIVE_DEMO_WOMEN.photoSrc : STORE_EVENT_LIVE_DEMO.photoSrc)
          : state.host.photoSrc,
        panoramaSrc: state.host.panoramaSrc.startsWith('data:')
          ? STORE_EVENT_LIVE_DEMO.panoramaSrc
          : state.host.panoramaSrc,
      },
    };
    window.localStorage.setItem(storageKey(token), JSON.stringify(slim));
  }
}

export function eventLiveArchiveBlob(state: EventLiveLabState): Blob {
  const visible = state.blessings.filter((item) => !item.hidden).map((item) => ({
    name: item.name,
    text: item.extra ? `${item.cannedText} ${item.extra}` : item.cannedText,
  }));
  const body = {
    product: state.host.voice === 'women' ? 'دعوة حرة تفاعلية نسائية' : 'دعوة حرة تفاعلية',
    brand: 'halaqmap',
    voice: state.host.voice,
    hostName: state.host.hostName,
    hostRole: state.host.hostRole,
    occasionTitle: state.host.occasionTitle,
    eventDate: state.host.eventDate,
    eventTime: state.host.eventTime,
    venueName: state.host.venueName,
    welcomeAr: state.host.welcomeAr,
    announcement: state.host.announcement,
    blessings: visible,
  };
  return new Blob([JSON.stringify(body, null, 2)], { type: 'application/json;charset=utf-8' });
}
