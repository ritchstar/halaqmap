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
let resumePending = false;

function resolveAudioContextCtor(): SafeAudioContextCtor | null {
  if (typeof window === 'undefined') return null;
  const win = window as unknown as {
    AudioContext?: SafeAudioContextCtor;
    webkitAudioContext?: SafeAudioContextCtor;
  };
  return win.AudioContext ?? win.webkitAudioContext ?? null;
}

function getSharedAudioContext(): AudioContext | null {
  if (sharedCtx && sharedCtx.state !== 'closed') {
    if (sharedCtx.state === 'suspended' && !resumePending) {
      resumePending = true;
      void sharedCtx.resume().finally(() => {
        resumePending = false;
      });
    }
    return sharedCtx;
  }
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

if (typeof document !== 'undefined') {
  const unlock = () => {
    const ctx = getSharedAudioContext();
    if (ctx && ctx.state === 'suspended') {
      void ctx.resume().catch(() => undefined);
    }
    document.removeEventListener('click', unlock);
    document.removeEventListener('touchstart', unlock);
    document.removeEventListener('keydown', unlock);
  };
  document.addEventListener('click', unlock, { once: true, passive: true });
  document.addEventListener('touchstart', unlock, { once: true, passive: true });
  document.addEventListener('keydown', unlock, { once: true });
}

async function ensureBarberChatAudioReady(): Promise<AudioContext | null> {
  const ctx = getSharedAudioContext();
  if (!ctx || ctx.state === 'closed') return null;
  if (ctx.state === 'suspended') {
    try {
      await ctx.resume();
    } catch {
      return null;
    }
  }
  return ctx.state === 'running' ? ctx : null;
}

function playToneBurstOnContext(ctx: AudioContext, volume: number, steps: ToneStep[]): void {
  try {
    if (ctx.state === 'closed' || steps.length === 0) return;
    const t0 = ctx.currentTime;
    const master = ctx.createGain();
    master.connect(ctx.destination);
    master.gain.setValueAtTime(0.0001, t0);
    master.gain.linearRampToValueAtTime(volume, t0 + 0.02);
    master.gain.exponentialRampToValueAtTime(
      0.0001,
      t0 + Math.max(...steps.map((s) => s.at + s.dur)) + 0.08,
    );

    for (const step of steps) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = step.type ?? 'sine';
      osc.frequency.setValueAtTime(step.freq, t0 + step.at);
      gain.gain.setValueAtTime(step.gain ?? 0.5, t0 + step.at);
      osc.connect(gain);
      gain.connect(master);
      osc.start(t0 + step.at);
      osc.stop(t0 + step.at + step.dur);
    }
  } catch {
    /* autoplay policy */
  }
}

function playMessageToneOnContext(
  ctx: AudioContext,
  tone: BarberChatAlertMessageTone,
  volume: number,
): void {
  if (tone === 'bright') {
    playToneBurstOnContext(ctx, volume, [
      { freq: 660, at: 0, dur: 0.12, type: 'sine' },
      { freq: 880, at: 0.1, dur: 0.16, type: 'sine' },
    ]);
    return;
  }
  if (tone === 'bell') {
    playToneBurstOnContext(ctx, volume, [
      { freq: 523, at: 0, dur: 0.2, type: 'triangle', gain: 0.45 },
      { freq: 784, at: 0.08, dur: 0.22, type: 'sine', gain: 0.35 },
    ]);
    return;
  }
  playToneBurstOnContext(ctx, volume, [{ freq: 520, at: 0, dur: 0.18, type: 'sine' }]);
}

function playHomeToneOnContext(ctx: AudioContext, tone: BarberChatAlertHomeTone, volume: number): void {
  if (tone === 'chime') {
    playToneBurstOnContext(ctx, volume, [
      { freq: 392, at: 0, dur: 0.22, type: 'triangle' },
      { freq: 523, at: 0.18, dur: 0.28, type: 'sine' },
    ]);
    return;
  }
  if (tone === 'pulse') {
    playToneBurstOnContext(ctx, volume, [
      { freq: 96, at: 0, dur: 0.32, type: 'sine', gain: 0.7 },
      { freq: 144, at: 0.04, dur: 0.24, type: 'triangle', gain: 0.25 },
    ]);
    return;
  }
  playToneBurstOnContext(ctx, volume, [
    { freq: 440, at: 0, dur: 0.14, type: 'square', gain: 0.22 },
    { freq: 660, at: 0.16, dur: 0.2, type: 'sine', gain: 0.4 },
  ]);
}

function playGroomPrepToneOnContext(
  ctx: AudioContext,
  tone: BarberChatAlertHomeTone,
  volume: number,
): void {
  if (tone === 'chime') {
    playToneBurstOnContext(ctx, volume, [
      { freq: 330, at: 0, dur: 0.24, type: 'triangle' },
      { freq: 440, at: 0.2, dur: 0.3, type: 'sine' },
      { freq: 554, at: 0.38, dur: 0.34, type: 'sine', gain: 0.42 },
      { freq: 659, at: 0.58, dur: 0.36, type: 'triangle', gain: 0.38 },
    ]);
    return;
  }
  if (tone === 'pulse') {
    playToneBurstOnContext(ctx, volume, [
      { freq: 110, at: 0, dur: 0.36, type: 'sine', gain: 0.65 },
      { freq: 165, at: 0.06, dur: 0.28, type: 'triangle', gain: 0.3 },
      { freq: 220, at: 0.22, dur: 0.3, type: 'sine', gain: 0.35 },
    ]);
    return;
  }
  playToneBurstOnContext(ctx, volume, [
    { freq: 392, at: 0, dur: 0.18, type: 'sine', gain: 0.5 },
    { freq: 494, at: 0.16, dur: 0.2, type: 'triangle', gain: 0.42 },
    { freq: 587, at: 0.32, dur: 0.24, type: 'sine', gain: 0.45 },
    { freq: 740, at: 0.5, dur: 0.28, type: 'triangle', gain: 0.4 },
  ]);
}

export async function playBarberChatAlert(
  kind: 'message' | 'home_visit' | 'groom_prep',
  prefs: Pick<BarberChatAlertPrefs, 'volume' | 'messageTone' | 'homeVisitTone'>,
): Promise<boolean> {
  const ctx = await ensureBarberChatAudioReady();
  if (!ctx) return false;

  const gain = barberChatAlertVolumeGain(prefs.volume);
  if (kind === 'home_visit') {
    playHomeToneOnContext(ctx, prefs.homeVisitTone, gain * 1.05);
  } else if (kind === 'groom_prep') {
    playGroomPrepToneOnContext(ctx, prefs.homeVisitTone, gain * 1.15);
  } else {
    playMessageToneOnContext(ctx, prefs.messageTone, gain);
  }
  return true;
}
