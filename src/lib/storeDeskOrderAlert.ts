/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * نغمات وتنبيه جهاز للوحات الطلب. مستقل عن تنبيهات الصالون.
 */
import {
  STORE_DESK_ORDER_ALERT_COPY,
  type StoreDeskOrderAlertProduct,
  type StoreDeskOrderAlertTone,
  type StoreDeskOrderAlertVolume,
} from '@/config/storeDeskOrderAlert';

export type StoreDeskOrderAlertPrefs = {
  armed: boolean;
  soundOn: boolean;
  lightOn: boolean;
  phoneNotify: boolean;
  vibrateOn: boolean;
  keepAwake: boolean;
  repeatWhileUnread: boolean;
  tone: StoreDeskOrderAlertTone;
  volume: StoreDeskOrderAlertVolume;
};

export const DEFAULT_STORE_DESK_ORDER_ALERT_PREFS: StoreDeskOrderAlertPrefs = {
  armed: false,
  soundOn: true,
  lightOn: true,
  phoneNotify: true,
  vibrateOn: true,
  keepAwake: true,
  repeatWhileUnread: true,
  tone: 'bell',
  volume: 'high',
};

const PREFS_KEY = 'halaqmap.storeDeskOrderAlert.v1';

type SafeAudioContextCtor = typeof AudioContext;
type ToneStep = { freq: number; at: number; dur: number; type?: OscillatorType; gain?: number };

let sharedCtx: AudioContext | null = null;
let wakeLock: WakeLockSentinel | null = null;

function storageKey(product: StoreDeskOrderAlertProduct, token: string): string {
  return `${PREFS_KEY}.${product}.${token.trim().slice(0, 80)}`;
}

export function readStoreDeskOrderAlertPrefs(
  product: StoreDeskOrderAlertProduct,
  token: string,
): StoreDeskOrderAlertPrefs {
  if (typeof window === 'undefined' || !token.trim()) return { ...DEFAULT_STORE_DESK_ORDER_ALERT_PREFS };
  try {
    const raw = window.localStorage.getItem(storageKey(product, token));
    if (!raw) return { ...DEFAULT_STORE_DESK_ORDER_ALERT_PREFS };
    const parsed = JSON.parse(raw) as Partial<StoreDeskOrderAlertPrefs>;
    return {
      armed: parsed.armed === true,
      soundOn: parsed.soundOn !== false,
      lightOn: parsed.lightOn !== false,
      phoneNotify: parsed.phoneNotify !== false,
      vibrateOn: parsed.vibrateOn !== false,
      keepAwake: parsed.keepAwake !== false,
      repeatWhileUnread: parsed.repeatWhileUnread !== false,
      tone:
        parsed.tone === 'chime' || parsed.tone === 'pulse' || parsed.tone === 'market' ? parsed.tone : 'bell',
      volume: parsed.volume === 'low' || parsed.volume === 'medium' ? parsed.volume : 'high',
    };
  } catch {
    return { ...DEFAULT_STORE_DESK_ORDER_ALERT_PREFS };
  }
}

export function writeStoreDeskOrderAlertPrefs(
  product: StoreDeskOrderAlertProduct,
  token: string,
  prefs: StoreDeskOrderAlertPrefs,
): void {
  if (typeof window === 'undefined' || !token.trim()) return;
  try {
    window.localStorage.setItem(storageKey(product, token), JSON.stringify(prefs));
  } catch {
    /* quota / private */
  }
}

function resolveAudioCtor(): SafeAudioContextCtor | null {
  if (typeof window === 'undefined') return null;
  const win = window as unknown as { AudioContext?: SafeAudioContextCtor; webkitAudioContext?: SafeAudioContextCtor };
  return win.AudioContext ?? win.webkitAudioContext ?? null;
}

function getAudioContext(): AudioContext | null {
  if (sharedCtx && sharedCtx.state !== 'closed') return sharedCtx;
  const Ctor = resolveAudioCtor();
  if (!Ctor) return null;
  try {
    sharedCtx = new Ctor();
    return sharedCtx;
  } catch {
    sharedCtx = null;
    return null;
  }
}

function primeAudio(ctx: AudioContext): void {
  try {
    const t0 = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, t0);
    gain.gain.setValueAtTime(0.00008, t0);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t0);
    osc.stop(t0 + 0.02);
  } catch {
    /* ignore */
  }
}

export function unlockStoreDeskOrderAlertAudio(): AudioContext | null {
  const ctx = getAudioContext();
  if (!ctx) return null;
  primeAudio(ctx);
  if (ctx.state === 'suspended') void ctx.resume().catch(() => undefined);
  return ctx;
}

function volumeGain(volume: StoreDeskOrderAlertVolume): number {
  if (volume === 'low') return 0.18;
  if (volume === 'medium') return 0.38;
  return 0.62;
}

function toneSteps(tone: StoreDeskOrderAlertTone): ToneStep[] {
  if (tone === 'chime') {
    return [
      { freq: 523, at: 0, dur: 0.16, type: 'triangle', gain: 0.65 },
      { freq: 784, at: 0.14, dur: 0.22, type: 'sine', gain: 0.7 },
      { freq: 1047, at: 0.3, dur: 0.26, type: 'sine', gain: 0.5 },
    ];
  }
  if (tone === 'pulse') {
    return [
      { freq: 196, at: 0, dur: 0.28, type: 'sine', gain: 0.75 },
      { freq: 247, at: 0.1, dur: 0.22, type: 'triangle', gain: 0.45 },
      { freq: 196, at: 0.36, dur: 0.24, type: 'sine', gain: 0.7 },
    ];
  }
  if (tone === 'market') {
    return [
      { freq: 440, at: 0, dur: 0.12, type: 'square', gain: 0.45 },
      { freq: 554, at: 0.12, dur: 0.12, type: 'square', gain: 0.4 },
      { freq: 659, at: 0.24, dur: 0.18, type: 'triangle', gain: 0.55 },
      { freq: 880, at: 0.4, dur: 0.2, type: 'sine', gain: 0.5 },
    ];
  }
  return [
    { freq: 784, at: 0, dur: 0.18, type: 'triangle', gain: 0.65 },
    { freq: 1175, at: 0.12, dur: 0.22, type: 'sine', gain: 0.6 },
    { freq: 1568, at: 0.28, dur: 0.28, type: 'sine', gain: 0.45 },
  ];
}

function playSteps(ctx: AudioContext, volume: number, steps: ToneStep[]): void {
  try {
    if (ctx.state === 'closed' || steps.length === 0) return;
    const t0 = ctx.currentTime;
    const endAt = t0 + Math.max(...steps.map((step) => step.at + step.dur)) + 0.1;
    const master = ctx.createGain();
    master.connect(ctx.destination);
    const peak = Math.min(1, Math.max(0.05, volume));
    master.gain.setValueAtTime(0.0001, t0);
    master.gain.linearRampToValueAtTime(peak, t0 + 0.012);
    master.gain.linearRampToValueAtTime(0.0001, endAt);
    for (const step of steps) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = step.type ?? 'sine';
      osc.frequency.setValueAtTime(step.freq, t0 + step.at);
      const stepGain = step.gain ?? 0.55;
      gain.gain.setValueAtTime(0.0001, t0 + step.at);
      gain.gain.linearRampToValueAtTime(stepGain, t0 + step.at + 0.01);
      gain.gain.linearRampToValueAtTime(0.0001, t0 + step.at + step.dur);
      osc.connect(gain);
      gain.connect(master);
      osc.start(t0 + step.at);
      osc.stop(t0 + step.at + step.dur + 0.02);
    }
  } catch {
    /* autoplay */
  }
}

export async function playStoreDeskOrderAlertTone(prefs: StoreDeskOrderAlertPrefs): Promise<boolean> {
  if (!prefs.soundOn) return true;
  let ctx = unlockStoreDeskOrderAlertAudio();
  if (!ctx) return false;
  if (ctx.state === 'suspended') {
    try {
      await ctx.resume();
    } catch {
      /* recreate */
    }
  }
  if (!ctx || ctx.state === 'closed') {
    sharedCtx = null;
    ctx = getAudioContext();
  }
  if (!ctx) return false;
  playSteps(ctx, volumeGain(prefs.volume), toneSteps(prefs.tone));
  return ctx.state === 'running' || ctx.state === 'suspended';
}

export function vibrateStoreDeskOrderAlert(): void {
  if (typeof navigator === 'undefined' || typeof navigator.vibrate !== 'function') return;
  try {
    navigator.vibrate([180, 70, 180, 70, 240]);
  } catch {
    /* ignore */
  }
}

export async function requestStoreDeskOrderAlertPhone(): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) return false;
  try {
    const { registerAppServiceWorker } = await import('@/lib/registerAppServiceWorker');
    await registerAppServiceWorker();
  } catch {
    /* optional */
  }
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;
  try {
    const result = await Notification.requestPermission();
    return result === 'granted';
  } catch {
    return false;
  }
}

export function storeDeskOrderAlertPhoneGranted(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted';
}

export async function showStoreDeskOrderNotice(shopName: string): Promise<void> {
  if (typeof window === 'undefined' || !('Notification' in window) || Notification.permission !== 'granted') return;
  const title = shopName.trim()
    ? `${STORE_DESK_ORDER_ALERT_COPY.noticeTitleAr} — ${shopName.trim().slice(0, 40)}`
    : STORE_DESK_ORDER_ALERT_COPY.noticeTitleAr;
  const body = STORE_DESK_ORDER_ALERT_COPY.noticeBodyAr;
  const opts: NotificationOptions = {
    body,
    tag: 'store-desk-order',
    renotify: true,
    silent: false,
    dir: 'rtl',
    lang: 'ar',
  };
  try {
    const reg = 'serviceWorker' in navigator ? await navigator.serviceWorker.getRegistration() : null;
    if (reg && typeof reg.showNotification === 'function') {
      await reg.showNotification(title, opts);
      return;
    }
  } catch {
    /* fallback */
  }
  try {
    new Notification(title, opts);
  } catch {
    /* ignore */
  }
}

export async function setStoreDeskOrderAlertWake(on: boolean): Promise<void> {
  if (typeof navigator === 'undefined' || !('wakeLock' in navigator)) return;
  try {
    if (!on) {
      await wakeLock?.release();
      wakeLock = null;
      return;
    }
    if (document.visibilityState !== 'visible') return;
    wakeLock = await navigator.wakeLock.request('screen');
    wakeLock.addEventListener('release', () => {
      wakeLock = null;
    });
  } catch {
    wakeLock = null;
  }
}

export async function fireStoreDeskOrderAlert(
  prefs: StoreDeskOrderAlertPrefs,
  shopName: string,
): Promise<void> {
  if (!prefs.armed) return;
  if (prefs.soundOn) void playStoreDeskOrderAlertTone(prefs);
  if (prefs.vibrateOn) vibrateStoreDeskOrderAlert();
  if (prefs.phoneNotify) void showStoreDeskOrderNotice(shopName);
}
