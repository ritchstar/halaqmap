/** Subtle UI pulse — audible market heartbeat for command-center / cast mode. */
export function playPlatformRadarPulseSound(volume = 0.12): void {
  if (typeof window === 'undefined') return;

  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;

    const ctx = new AudioCtx();
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
