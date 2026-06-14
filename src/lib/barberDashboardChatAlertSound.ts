import type {
  BarberChatAlertHomeTone,
  BarberChatAlertMessageTone,
  BarberChatAlertPrefs,
} from '@/lib/barberDashboardChatAlertPrefs';
import { barberChatAlertVolumeGain } from '@/lib/barberDashboardChatAlertPrefs';

type SafeAudioContextCtor = typeof AudioContext;

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

function playToneBurst(
  volume: number,
  steps: Array<{ freq: number; at: number; dur: number; type?: OscillatorType; gain?: number }>,
): void {
  try {
    const ctx = getSharedAudioContext();
    if (!ctx || ctx.state === 'closed') return;
    const t0 = ctx.currentTime;
    const master = ctx.createGain();
    master.connect(ctx.destination);
    master.gain.setValueAtTime(0.0001, t0);
    master.gain.linearRampToValueAtTime(volume, t0 + 0.02);
    master.gain.exponentialRampToValueAtTime(0.0001, t0 + Math.max(...steps.map((s) => s.at + s.dur)) + 0.05);

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

function playMessageTone(tone: BarberChatAlertMessageTone, volume: number): void {
  if (tone === 'bright') {
    playToneBurst(volume, [
      { freq: 660, at: 0, dur: 0.12, type: 'sine' },
      { freq: 880, at: 0.1, dur: 0.16, type: 'sine' },
    ]);
    return;
  }
  if (tone === 'bell') {
    playToneBurst(volume, [
      { freq: 523, at: 0, dur: 0.2, type: 'triangle', gain: 0.45 },
      { freq: 784, at: 0.08, dur: 0.22, type: 'sine', gain: 0.35 },
    ]);
    return;
  }
  playToneBurst(volume, [{ freq: 520, at: 0, dur: 0.18, type: 'sine' }]);
}

function playHomeTone(tone: BarberChatAlertHomeTone, volume: number): void {
  if (tone === 'chime') {
    playToneBurst(volume, [
      { freq: 392, at: 0, dur: 0.22, type: 'triangle' },
      { freq: 523, at: 0.18, dur: 0.28, type: 'sine' },
    ]);
    return;
  }
  if (tone === 'pulse') {
    playToneBurst(volume, [
      { freq: 96, at: 0, dur: 0.32, type: 'sine', gain: 0.7 },
      { freq: 144, at: 0.04, dur: 0.24, type: 'triangle', gain: 0.25 },
    ]);
    return;
  }
  playToneBurst(volume, [
    { freq: 440, at: 0, dur: 0.14, type: 'square', gain: 0.22 },
    { freq: 660, at: 0.16, dur: 0.2, type: 'sine', gain: 0.4 },
  ]);
}

function playGroomPrepTone(tone: BarberChatAlertHomeTone, volume: number): void {
  if (tone === 'chime') {
    playToneBurst(volume, [
      { freq: 330, at: 0, dur: 0.24, type: 'triangle' },
      { freq: 440, at: 0.2, dur: 0.3, type: 'sine' },
      { freq: 554, at: 0.38, dur: 0.28, type: 'sine', gain: 0.35 },
    ]);
    return;
  }
  if (tone === 'pulse') {
    playToneBurst(volume, [
      { freq: 110, at: 0, dur: 0.36, type: 'sine', gain: 0.65 },
      { freq: 165, at: 0.06, dur: 0.28, type: 'triangle', gain: 0.3 },
    ]);
    return;
  }
  playToneBurst(volume, [
    { freq: 392, at: 0, dur: 0.16, type: 'sine', gain: 0.45 },
    { freq: 523, at: 0.14, dur: 0.22, type: 'triangle', gain: 0.35 },
  ]);
}

export function playBarberChatAlert(
  kind: 'message' | 'home_visit' | 'groom_prep',
  prefs: Pick<BarberChatAlertPrefs, 'volume' | 'messageTone' | 'homeVisitTone'>,
): void {
  const gain = barberChatAlertVolumeGain(prefs.volume);
  if (kind === 'home_visit') {
    playHomeTone(prefs.homeVisitTone, gain * 1.05);
  } else if (kind === 'groom_prep') {
    playGroomPrepTone(prefs.homeVisitTone, gain * 1.08);
  } else {
    playMessageTone(prefs.messageTone, gain);
  }
}
