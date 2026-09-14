/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * أصوات خفيفة لساحة الشطرنج — نغمات مولَّدة عبر Web Audio API مباشرة
 * (بلا أي ملف صوتي خارجي، فلا وزن إضافي ولا أصول ثنائية في الحزمة).
 * التفضيل (مفعّل/معطّل) محفوظ محلياً.
 */
import { CHESS_SOUND_PREF_STORAGE_KEY } from '@/config/chessArena';

export type ChessSoundKind = 'move' | 'capture' | 'check' | 'gameEnd';

type MinimalAudioContext = {
  currentTime: number;
  state: string;
  resume: () => Promise<void>;
  createOscillator: () => OscillatorNode;
  createGain: () => GainNode;
  destination: AudioDestinationNode;
};

let audioCtx: MinimalAudioContext | null = null;

function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

function getAudioContext(): MinimalAudioContext | null {
  if (!isBrowser()) return null;
  if (audioCtx) return audioCtx;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Ctor = (window as any).AudioContext || (window as any).webkitAudioContext;
  if (!Ctor) return null;
  try {
    audioCtx = new Ctor() as MinimalAudioContext;
    return audioCtx;
  } catch {
    return null;
  }
}

export function isChessSoundEnabled(): boolean {
  if (!isBrowser()) return true;
  try {
    const raw = window.localStorage.getItem(CHESS_SOUND_PREF_STORAGE_KEY);
    if (raw === null) return true; // الافتراضي: مفعّل
    return raw !== 'off';
  } catch {
    return true;
  }
}

export function setChessSoundEnabled(enabled: boolean): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(CHESS_SOUND_PREF_STORAGE_KEY, enabled ? 'on' : 'off');
  } catch {
    // تجاهل — تفضيل الصوت غير حرج لعمل اللعبة.
  }
}

interface Tone {
  freq: number;
  startAt: number;
  durationSec: number;
  gain: number;
}

const SOUND_RECIPES: Record<ChessSoundKind, Tone[]> = {
  move: [{ freq: 520, startAt: 0, durationSec: 0.08, gain: 0.05 }],
  capture: [
    { freq: 320, startAt: 0, durationSec: 0.07, gain: 0.06 },
    { freq: 220, startAt: 0.05, durationSec: 0.09, gain: 0.05 },
  ],
  check: [
    { freq: 740, startAt: 0, durationSec: 0.09, gain: 0.06 },
    { freq: 740, startAt: 0.12, durationSec: 0.09, gain: 0.06 },
  ],
  gameEnd: [
    { freq: 440, startAt: 0, durationSec: 0.12, gain: 0.06 },
    { freq: 550, startAt: 0.14, durationSec: 0.12, gain: 0.06 },
    { freq: 660, startAt: 0.28, durationSec: 0.18, gain: 0.06 },
  ],
};

export function playChessSound(kind: ChessSoundKind): void {
  if (!isChessSoundEnabled()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    if (ctx.state === 'suspended') {
      void ctx.resume();
    }
    const recipe = SOUND_RECIPES[kind];
    for (const tone of recipe) {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = tone.freq;
      const startTime = ctx.currentTime + tone.startAt;
      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(tone.gain, startTime + 0.01);
      gainNode.gain.linearRampToValueAtTime(0, startTime + tone.durationSec);
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      osc.start(startTime);
      osc.stop(startTime + tone.durationSec + 0.02);
    }
  } catch {
    // تجاهل أي فشل صوتي — لا يفترض أن يوقف اللعب.
  }
}
