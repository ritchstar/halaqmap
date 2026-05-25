/**
 * useCyberAudio — منظومة الصوت التفاعلية لغرفة العمليات السيبرانية
 *
 * أصوات مُولَّدة بالكامل عبر Web Audio API — لا ملفات خارجية.
 * تتناغم مع أحداث الرادار: زيارة · تسجيل · استطلاع · هجوم · دفاع
 * مع درون محيطي هادئ يعطي الغرفة "نبضها" الحي.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import type { CyberEvent } from '../types';

// ─── Web Audio يُنشَأ عند أول تفاعل ──────────────────────────────────────────
let sharedCtx: AudioContext | null = null;
function getAudioCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!sharedCtx || sharedCtx.state === 'closed') {
    try { sharedCtx = new AudioContext(); } catch { return null; }
  }
  return sharedCtx;
}

// ─── Master gain لتحكم موحَّد بالحجم ─────────────────────────────────────────
let masterGain: GainNode | null = null;
function getMasterGain(ctx: AudioContext): GainNode {
  if (!masterGain || masterGain.context !== ctx) {
    masterGain = ctx.createGain();
    masterGain.gain.value = 0.7;
    masterGain.connect(ctx.destination);
  }
  return masterGain;
}

// ─── Reverb بسيط لإعطاء عمق الغرفة ──────────────────────────────────────────
let reverbNode: ConvolverNode | null = null;
function getReverbNode(ctx: AudioContext): ConvolverNode {
  if (reverbNode && reverbNode.context === ctx) return reverbNode;
  const len = ctx.sampleRate * 1.5;
  const buf = ctx.createBuffer(2, len, ctx.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const d = buf.getChannelData(ch);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.5);
  }
  reverbNode = ctx.createConvolver();
  reverbNode.buffer = buf;
  reverbNode.connect(getMasterGain(ctx));
  return reverbNode;
}

// ─── مولّدات الصوت ────────────────────────────────────────────────────────────

/** صوت نقرة/ping للزيارات */
function playPing(ctx: AudioContext, freq = 880, vol = 0.04, dur = 0.12) {
  const osc = ctx.createOscillator();
  const g   = ctx.createGain();
  osc.type = 'sine'; osc.frequency.value = freq;
  g.gain.setValueAtTime(vol, ctx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
  osc.connect(g); g.connect(getReverbNode(ctx));
  osc.start(); osc.stop(ctx.currentTime + dur);
}

/** صوت تسجيل — رنّة إيجابية ثنائية */
function playChime(ctx: AudioContext) {
  [[440, 0.06], [660, 0.04]].forEach(([freq, vol], i) => {
    const osc = ctx.createOscillator();
    const g   = ctx.createGain();
    osc.type = 'triangle'; osc.frequency.value = freq;
    g.gain.setValueAtTime(0, ctx.currentTime + i * 0.08);
    g.gain.linearRampToValueAtTime(vol, ctx.currentTime + i * 0.08 + 0.02);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.08 + 0.4);
    osc.connect(g); g.connect(getReverbNode(ctx));
    osc.start(ctx.currentTime + i * 0.08);
    osc.stop(ctx.currentTime + i * 0.08 + 0.4);
  });
}

/** صوت استطلاع مريب — نبضة تحذيرية هادئة */
function playProbe(ctx: AudioContext) {
  const osc = ctx.createOscillator();
  const g   = ctx.createGain();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(180, ctx.currentTime);
  osc.frequency.linearRampToValueAtTime(120, ctx.currentTime + 0.35);
  g.gain.setValueAtTime(0.06, ctx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass'; filter.frequency.value = 600;
  osc.connect(filter); filter.connect(g); g.connect(getReverbNode(ctx));
  osc.start(); osc.stop(ctx.currentTime + 0.4);
}

/** صوت هجوم نشط — إنذار سيبراني متحكَّم فيه */
function playAttack(ctx: AudioContext) {
  // نبضة تحذيرية ثلاثية
  [0, 0.15, 0.30].forEach((offset) => {
    const osc = ctx.createOscillator();
    const g   = ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(240, ctx.currentTime + offset);
    osc.frequency.exponentialRampToValueAtTime(180, ctx.currentTime + offset + 0.12);
    g.gain.setValueAtTime(0.08, ctx.currentTime + offset);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + offset + 0.12);
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass'; filter.frequency.value = 500; filter.Q.value = 2;
    osc.connect(filter); filter.connect(g); g.connect(getMasterGain(ctx));
    osc.start(ctx.currentTime + offset);
    osc.stop(ctx.currentTime + offset + 0.12);
  });
  // Sub-bass kick
  const kick = ctx.createOscillator();
  const kickG = ctx.createGain();
  kick.frequency.setValueAtTime(80, ctx.currentTime);
  kick.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + 0.2);
  kickG.gain.setValueAtTime(0.2, ctx.currentTime);
  kickG.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
  kick.connect(kickG); kickG.connect(getMasterGain(ctx));
  kick.start(); kick.stop(ctx.currentTime + 0.25);
}

/** صوت إجراء دفاعي — تحييد مُرضٍ */
function playDefence(ctx: AudioContext) {
  [880, 660, 440].forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const g   = ctx.createGain();
    osc.type = 'sine'; osc.frequency.value = freq;
    g.gain.setValueAtTime(0.05, ctx.currentTime + i * 0.1);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.1 + 0.3);
    osc.connect(g); g.connect(getReverbNode(ctx));
    osc.start(ctx.currentTime + i * 0.1);
    osc.stop(ctx.currentTime + i * 0.1 + 0.3);
  });
}

/** صوت تسجيل دخول ناجح */
function playLogin(ctx: AudioContext) {
  const osc = ctx.createOscillator();
  const g   = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(500, ctx.currentTime);
  osc.frequency.linearRampToValueAtTime(700, ctx.currentTime + 0.1);
  g.gain.setValueAtTime(0.05, ctx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
  osc.connect(g); g.connect(getReverbNode(ctx));
  osc.start(); osc.stop(ctx.currentTime + 0.25);
}

// ─── Ambient drone — نبض الغرفة الدائم ───────────────────────────────────────
let droneOscs: OscillatorNode[] = [];
let droneGain: GainNode | null = null;

function startDrone(ctx: AudioContext) {
  if (droneOscs.length > 0) return;
  const master = getMasterGain(ctx);
  droneGain = ctx.createGain();
  droneGain.gain.value = 0;
  droneGain.connect(master);

  [[40, 'sine', 0.18], [80, 'sine', 0.10], [53, 'sine', 0.07]].forEach(([freq, type, vol]) => {
    const osc = ctx.createOscillator();
    const g   = ctx.createGain();
    const lfo = ctx.createOscillator();
    const lg  = ctx.createGain();
    osc.type = type as OscillatorType; osc.frequency.value = freq as number;
    lfo.frequency.value = 0.05 + Math.random() * 0.08;
    lg.gain.value = (freq as number) * 0.015;
    g.gain.value = vol as number;
    lfo.connect(lg); lg.connect(osc.frequency);
    osc.connect(g); g.connect(droneGain!);
    lfo.start(); osc.start();
    droneOscs.push(osc);
  });

  // Fade in
  droneGain.gain.linearRampToValueAtTime(1, ctx.currentTime + 3);
}

function stopDrone() {
  if (droneGain) {
    droneGain.gain.linearRampToValueAtTime(0, (sharedCtx?.currentTime ?? 0) + 1);
    setTimeout(() => {
      droneOscs.forEach(o => { try { o.stop(); } catch { /**/ } });
      droneOscs = [];
      droneGain = null;
    }, 1200);
  }
}

// ─── React Hook ───────────────────────────────────────────────────────────────
export type CyberAudioHandle = {
  muted: boolean;
  toggleMute: () => void;
  playEventSound: (kind: CyberEvent['kind']) => void;
  activate: () => void;
};

export function useCyberAudio(): CyberAudioHandle {
  const [muted, setMuted] = useState(false);
  const [activated, setActivated] = useState(false);
  const lastEventTime = useRef<Partial<Record<string, number>>>({});

  const activate = useCallback(() => {
    if (activated) return;
    const ctx = getAudioCtx();
    if (!ctx) return;
    if (ctx.state === 'suspended') void ctx.resume();
    setActivated(true);
    startDrone(ctx);
  }, [activated]);

  // Drone on/off
  useEffect(() => {
    if (!activated) return;
    const ctx = getAudioCtx();
    if (!ctx) return;
    if (muted) {
      droneGain?.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5);
    } else {
      droneGain?.gain.linearRampToValueAtTime(1, ctx.currentTime + 0.5);
    }
  }, [muted, activated]);

  const toggleMute = useCallback(() => setMuted(m => !m), []);

  const playEventSound = useCallback((kind: CyberEvent['kind']) => {
    if (muted || !activated) return;
    const ctx = getAudioCtx();
    if (!ctx || ctx.state === 'suspended') return;

    // Rate limiting per kind — لا تكرار أصوات كثيرة في ثانية واحدة
    const RATE_LIMITS: Partial<Record<string, number>> = {
      visit_internal: 400,
      visit_external: 500,
      registration: 800,
      login_success: 600,
      threat_probe: 600,
      threat_attack: 350,
      defence_action: 500,
    };
    const now = Date.now();
    const last = lastEventTime.current[kind] ?? 0;
    const limit = RATE_LIMITS[kind] ?? 400;
    if (now - last < limit) return;
    lastEventTime.current[kind] = now;

    switch (kind) {
      case 'visit_internal':  playPing(ctx, 880, 0.03, 0.10); break;
      case 'visit_external':  playPing(ctx, 660, 0.03, 0.12); break;
      case 'registration':    playChime(ctx); break;
      case 'login_success':   playLogin(ctx); break;
      case 'threat_probe':    playProbe(ctx); break;
      case 'threat_attack':   playAttack(ctx); break;
      case 'defence_action':  playDefence(ctx); break;
    }
  }, [muted, activated]);

  // تنظيف عند الإغلاق
  useEffect(() => {
    return () => { if (droneOscs.length > 0) stopDrone(); };
  }, []);

  return { muted, toggleMute, playEventSound, activate };
}
