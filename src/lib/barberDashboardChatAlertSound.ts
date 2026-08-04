/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * أصوات تنبيه لوحة الصالون — Web Audio مع فتح موثوق على iOS/Android
 * (يجب استدعاء التشغيل من إيماءة مستخدم؛ لا نعتمد على سياق معلّق بعد await طويل).
 */
import type {
  BarberChatAlertHomeTone,
  BarberChatAlertMessageTone,
  BarberChatAlertPrefs,
} from '@/lib/barberDashboardChatAlertPrefs';
import { barberChatAlertVolumeGain } from '@/lib/barberDashboardChatAlertPrefs';

type SafeAudioContextCtor = typeof AudioContext;

type ToneStep = {
  freq: number;
  at: number;
  dur: number;
  type?: OscillatorType;
  gain?: number;
};

let sharedCtx: AudioContext | null = null;

function resolveAudioContextCtor(): SafeAudioContextCtor | null {
  if (typeof window === 'undefined') return null;
  const win = window as unknown as {
    AudioContext?: SafeAudioContextCtor;
    webkitAudioContext?: SafeAudioContextCtor;
  };
  return win.AudioContext ?? win.webkitAudioContext ?? null;
}

function getOrCreateAudioContext(): AudioContext | null {
  if (sharedCtx && sharedCtx.state !== 'closed') return sharedCtx;
  const Ctor = resolveAudioContextCtor();
  if (!Ctor) return null;
  try {
    sharedCtx = new Ctor();
    return sharedCtx;
  } catch {
    sharedCtx = null;
    return null;
  }
}

/** نبضة صامتة تقريباً لإبقاء السياق مفتوحاً ضمن إيماءة اللمس/النقر */
function primeAudioContext(ctx: AudioContext): void {
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

/**
 * يُستدعى من معالج النقر مباشرةً (قبل أي await طويل) لفتح الصوت على iOS.
 */
export function unlockBarberChatAudioFromGesture(): AudioContext | null {
  const ctx = getOrCreateAudioContext();
  if (!ctx) return null;
  primeAudioContext(ctx);
  if (ctx.state === 'suspended') {
    void ctx.resume().catch(() => undefined);
  }
  return ctx;
}

if (typeof document !== 'undefined') {
  const unlock = () => {
    unlockBarberChatAudioFromGesture();
    document.removeEventListener('pointerdown', unlock);
    document.removeEventListener('touchstart', unlock);
    document.removeEventListener('keydown', unlock);
  };
  document.addEventListener('pointerdown', unlock, { once: true, passive: true });
  document.addEventListener('touchstart', unlock, { once: true, passive: true });
  document.addEventListener('keydown', unlock, { once: true });
}

async function ensureBarberChatAudioReady(): Promise<AudioContext | null> {
  let ctx = unlockBarberChatAudioFromGesture();
  if (!ctx) return null;

  if (ctx.state === 'suspended') {
    try {
      await ctx.resume();
    } catch {
      /* recreate below */
    }
  }

  if (!ctx || ctx.state === 'closed' || ctx.state === 'suspended') {
    try {
      if (sharedCtx && sharedCtx.state !== 'closed') {
        await sharedCtx.close().catch(() => undefined);
      }
    } catch {
      /* ignore */
    }
    sharedCtx = null;
    ctx = getOrCreateAudioContext();
    if (!ctx) return null;
    primeAudioContext(ctx);
    try {
      await ctx.resume();
    } catch {
      return null;
    }
  }

  return ctx.state === 'running' || ctx.state === 'suspended' ? ctx : null;
}

function playToneBurstOnContext(ctx: AudioContext, volume: number, steps: ToneStep[]): void {
  try {
    if (ctx.state === 'closed' || steps.length === 0) return;
    const t0 = ctx.currentTime;
    const endAt = t0 + Math.max(...steps.map((s) => s.at + s.dur)) + 0.12;
    const master = ctx.createGain();
    master.connect(ctx.destination);
    const peak = Math.min(1, Math.max(0.05, volume));
    master.gain.setValueAtTime(0.0001, t0);
    master.gain.linearRampToValueAtTime(peak, t0 + 0.015);
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
    /* autoplay / closed context */
  }
}

function playMessageToneOnContext(
  ctx: AudioContext,
  tone: BarberChatAlertMessageTone,
  volume: number,
): void {
  if (tone === 'bright') {
    playToneBurstOnContext(ctx, volume, [
      { freq: 880, at: 0, dur: 0.12, type: 'sine', gain: 0.7 },
      { freq: 1175, at: 0.1, dur: 0.16, type: 'sine', gain: 0.65 },
      { freq: 1319, at: 0.22, dur: 0.18, type: 'triangle', gain: 0.55 },
    ]);
    return;
  }
  if (tone === 'bell') {
    playToneBurstOnContext(ctx, volume, [
      { freq: 784, at: 0, dur: 0.2, type: 'triangle', gain: 0.65 },
      { freq: 1047, at: 0.1, dur: 0.24, type: 'sine', gain: 0.55 },
      { freq: 1319, at: 0.24, dur: 0.3, type: 'sine', gain: 0.45 },
    ]);
    return;
  }
  playToneBurstOnContext(ctx, volume, [
    { freq: 587, at: 0, dur: 0.16, type: 'sine', gain: 0.65 },
    { freq: 740, at: 0.14, dur: 0.2, type: 'sine', gain: 0.55 },
  ]);
}

function playAppointmentToneOnContext(ctx: AudioContext, volume: number): void {
  playToneBurstOnContext(ctx, volume, [
    { freq: 523, at: 0, dur: 0.14, type: 'triangle', gain: 0.55 },
    { freq: 659, at: 0.14, dur: 0.14, type: 'triangle', gain: 0.55 },
    { freq: 784, at: 0.28, dur: 0.22, type: 'sine', gain: 0.7 },
    { freq: 988, at: 0.44, dur: 0.28, type: 'triangle', gain: 0.6 },
  ]);
}

function playHomeToneOnContext(ctx: AudioContext, tone: BarberChatAlertHomeTone, volume: number): void {
  if (tone === 'chime') {
    playToneBurstOnContext(ctx, volume, [
      { freq: 392, at: 0, dur: 0.24, type: 'triangle', gain: 0.65 },
      { freq: 523, at: 0.18, dur: 0.3, type: 'sine', gain: 0.6 },
    ]);
    return;
  }
  if (tone === 'pulse') {
    playToneBurstOnContext(ctx, volume, [
      { freq: 180, at: 0, dur: 0.28, type: 'sine', gain: 0.75 },
      { freq: 240, at: 0.08, dur: 0.22, type: 'triangle', gain: 0.45 },
    ]);
    return;
  }
  // doorbell
  playToneBurstOnContext(ctx, volume, [
    { freq: 520, at: 0, dur: 0.16, type: 'triangle', gain: 0.6 },
    { freq: 690, at: 0.18, dur: 0.22, type: 'sine', gain: 0.65 },
    { freq: 520, at: 0.42, dur: 0.2, type: 'triangle', gain: 0.55 },
  ]);
}

function playGroomPrepToneOnContext(
  ctx: AudioContext,
  tone: BarberChatAlertHomeTone,
  volume: number,
): void {
  if (tone === 'chime') {
    playToneBurstOnContext(ctx, volume, [
      { freq: 330, at: 0, dur: 0.24, type: 'triangle', gain: 0.6 },
      { freq: 440, at: 0.2, dur: 0.3, type: 'sine', gain: 0.6 },
      { freq: 554, at: 0.38, dur: 0.34, type: 'sine', gain: 0.55 },
      { freq: 659, at: 0.58, dur: 0.36, type: 'triangle', gain: 0.5 },
    ]);
    return;
  }
  if (tone === 'pulse') {
    playToneBurstOnContext(ctx, volume, [
      { freq: 165, at: 0, dur: 0.32, type: 'sine', gain: 0.7 },
      { freq: 220, at: 0.1, dur: 0.28, type: 'triangle', gain: 0.5 },
      { freq: 277, at: 0.28, dur: 0.3, type: 'sine', gain: 0.45 },
    ]);
    return;
  }
  playToneBurstOnContext(ctx, volume, [
    { freq: 392, at: 0, dur: 0.18, type: 'sine', gain: 0.65 },
    { freq: 494, at: 0.16, dur: 0.2, type: 'triangle', gain: 0.55 },
    { freq: 587, at: 0.32, dur: 0.24, type: 'sine', gain: 0.6 },
    { freq: 740, at: 0.5, dur: 0.28, type: 'triangle', gain: 0.55 },
  ]);
}

export type BarberAlertSoundKind = 'message' | 'home_visit' | 'groom_prep' | 'appointment';

export async function playBarberChatAlert(
  kind: BarberAlertSoundKind,
  prefs: Pick<BarberChatAlertPrefs, 'volume' | 'messageTone' | 'homeVisitTone'>,
): Promise<boolean> {
  // فتح فوري ضمن نفس سلسلة الإيماءة قبل أي انتظار
  unlockBarberChatAudioFromGesture();
  const ctx = await ensureBarberChatAudioReady();
  if (!ctx) return false;

  // إن بقي معلّقاً بعد resume — لا ندّعي النجاح
  if (ctx.state === 'suspended') {
    try {
      await ctx.resume();
    } catch {
      return false;
    }
  }
  if (ctx.state !== 'running') return false;

  const gain = barberChatAlertVolumeGain(prefs.volume);
  if (kind === 'appointment') {
    playAppointmentToneOnContext(ctx, gain * 1.15);
  } else if (kind === 'home_visit') {
    playHomeToneOnContext(ctx, prefs.homeVisitTone, gain * 1.1);
  } else if (kind === 'groom_prep') {
    playGroomPrepToneOnContext(ctx, prefs.homeVisitTone, gain * 1.15);
  } else {
    playMessageToneOnContext(ctx, prefs.messageTone, gain);
  }
  return true;
}
