export type BarberChatAlertVolume = 'low' | 'medium' | 'high';
export type BarberChatAlertMessageTone = 'soft' | 'bright' | 'bell';
export type BarberChatAlertHomeTone = 'doorbell' | 'chime' | 'pulse';

export type BarberChatAlertPrefs = {
  enabled: boolean;
  volume: BarberChatAlertVolume;
  messageTone: BarberChatAlertMessageTone;
  homeVisitTone: BarberChatAlertHomeTone;
  pushEnabled: boolean;
  /** لا صوت للمحادثة المفتوحة حالياً في اللوحة */
  muteWhenChatOpen: boolean;
};

export const DEFAULT_BARBER_CHAT_ALERT_PREFS: BarberChatAlertPrefs = {
  enabled: true,
  pushEnabled: false,
  volume: 'medium',
  messageTone: 'soft',
  homeVisitTone: 'doorbell',
  muteWhenChatOpen: true,
};

const PREFS_KEY_PREFIX = 'halaqmap.barberChatAlertPrefs.v1.';
const SEEN_KEY_PREFIX = 'halaqmap.barberChatAlertSeen.v1.';
const SEEN_CAP = 400;

function prefsStorageKey(barberId: string): string {
  return `${PREFS_KEY_PREFIX}${barberId.trim()}`;
}

function seenStorageKey(barberId: string): string {
  return `${SEEN_KEY_PREFIX}${barberId.trim()}`;
}

export function readBarberChatAlertPrefs(barberId: string): BarberChatAlertPrefs {
  if (!barberId.trim()) return { ...DEFAULT_BARBER_CHAT_ALERT_PREFS };
  try {
    const raw = localStorage.getItem(prefsStorageKey(barberId));
    if (!raw) return { ...DEFAULT_BARBER_CHAT_ALERT_PREFS };
    const parsed = JSON.parse(raw) as Partial<BarberChatAlertPrefs>;
    return {
      enabled: parsed.enabled !== false,
      pushEnabled: parsed.pushEnabled === true,
      volume:
        parsed.volume === 'low' || parsed.volume === 'high' || parsed.volume === 'medium'
          ? parsed.volume
          : DEFAULT_BARBER_CHAT_ALERT_PREFS.volume,
      messageTone:
        parsed.messageTone === 'bright' || parsed.messageTone === 'bell'
          ? parsed.messageTone
          : DEFAULT_BARBER_CHAT_ALERT_PREFS.messageTone,
      homeVisitTone:
        parsed.homeVisitTone === 'chime' || parsed.homeVisitTone === 'pulse'
          ? parsed.homeVisitTone
          : DEFAULT_BARBER_CHAT_ALERT_PREFS.homeVisitTone,
      muteWhenChatOpen: parsed.muteWhenChatOpen !== false,
    };
  } catch {
    return { ...DEFAULT_BARBER_CHAT_ALERT_PREFS };
  }
}

export function writeBarberChatAlertPrefs(barberId: string, prefs: BarberChatAlertPrefs): void {
  if (!barberId.trim()) return;
  try {
    localStorage.setItem(prefsStorageKey(barberId), JSON.stringify(prefs));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('halaqmap:barber-alert-prefs-changed', { detail: { barberId } }),
      );
    }
  } catch {
    /* quota / private mode */
  }
}

export function readBarberChatAlertSeenIds(barberId: string): Set<string> {
  if (!barberId.trim()) return new Set();
  try {
    const raw = localStorage.getItem(seenStorageKey(barberId));
    if (!raw) return new Set();
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter((id): id is string => typeof id === 'string' && id.length > 0));
  } catch {
    return new Set();
  }
}

export function writeBarberChatAlertSeenIds(barberId: string, seen: Set<string>): void {
  if (!barberId.trim()) return;
  try {
    const ids = [...seen].slice(-SEEN_CAP);
    localStorage.setItem(seenStorageKey(barberId), JSON.stringify(ids));
  } catch {
    /* ignore */
  }
}

export const BARBER_CHAT_ALERT_VOLUME_LABELS: Record<BarberChatAlertVolume, string> = {
  low: 'خفيف',
  medium: 'متوسط',
  high: 'عالٍ',
};

export const BARBER_CHAT_ALERT_MESSAGE_TONE_LABELS: Record<BarberChatAlertMessageTone, string> = {
  soft: 'هادئ',
  bright: 'واضح',
  bell: 'جرس',
};

export const BARBER_CHAT_ALERT_HOME_TONE_LABELS: Record<BarberChatAlertHomeTone, string> = {
  doorbell: 'جرس باب',
  chime: 'نغمة مزدوجة',
  pulse: 'نبضة',
};

export function barberChatAlertVolumeGain(volume: BarberChatAlertVolume): number {
  if (volume === 'low') return 0.07;
  if (volume === 'high') return 0.2;
  return 0.13;
}
