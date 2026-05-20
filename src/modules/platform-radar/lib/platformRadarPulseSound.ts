function createAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const AudioCtx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtx) return null;
  return new AudioCtx();
}

/** Legacy aggregate-data pulse (metrics dashboard). */
export function playPlatformRadarPulseSound(volume = 0.12): void {
  try {
    const ctx = createAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.connect(gain);
    gain.connect(ctx.destination);

    const t = ctx.currentTime;
    osc.frequency.setValueAtTime(520, t);
    osc.frequency.exponentialRampToValueAtTime(280, t + 0.18);

    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.linearRampToValueAtTime(volume, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.45);

    osc.start(t);
    osc.stop(t + 0.46);

    window.setTimeout(() => {
      void ctx.close();
    }, 600);
  } catch {
    // Autoplay policies or missing audio — silent fail
  }
}

/**
 * Sub-harmonic tactical pulse — triggered when a NEW user search pulse hits the map.
 * Low-frequency thump (~72Hz) with soft overtone for room-scale cast monitoring.
 */
export function playTacticalUserPulseSound(volume = 0.14): void {
  try {
    const ctx = createAudioContext();
    if (!ctx) return;

    const sub = ctx.createOscillator();
    const overtone = ctx.createOscillator();
    const subGain = ctx.createGain();
    const toneGain = ctx.createGain();
    const master = ctx.createGain();

    sub.type = 'sine';
    overtone.type = 'triangle';

    sub.connect(subGain);
    overtone.connect(toneGain);
    subGain.connect(master);
    toneGain.connect(master);
    master.connect(ctx.destination);

    const t = ctx.currentTime;
    sub.frequency.setValueAtTime(72, t);
    sub.frequency.exponentialRampToValueAtTime(48, t + 0.35);
    overtone.frequency.setValueAtTime(144, t);
    overtone.frequency.exponentialRampToValueAtTime(96, t + 0.28);

    master.gain.setValueAtTime(0.0001, t);
    master.gain.linearRampToValueAtTime(volume, t + 0.03);
    master.gain.exponentialRampToValueAtTime(0.0001, t + 0.55);

    subGain.gain.setValueAtTime(0.85, t);
    toneGain.gain.setValueAtTime(0.22, t);

    sub.start(t);
    overtone.start(t);
    sub.stop(t + 0.56);
    overtone.stop(t + 0.56);

    window.setTimeout(() => {
      void ctx.close();
    }, 700);
  } catch {
    // silent fail
  }
}
