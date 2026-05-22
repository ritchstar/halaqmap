/**
 * useCyberPlayback — timeline-driven scenario player.
 *
 * Consumes a `CyberScenario` and emits the events / agent responses on
 * the radar in real time. Uses a single rAF loop so playback is smooth
 * even when the tab is in background-throttled mode (browser will pause
 * the loop, then resume from where it left off — accuracy ≤ 1 frame).
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import type {
  CyberAgentResponse,
  CyberEvent,
  CyberScenario,
} from '../types';

type PlaybackState = 'idle' | 'playing' | 'paused' | 'finished';

export type ScenarioPlaybackHandle = {
  state: PlaybackState;
  elapsedMs: number;
  pulses: ReadonlyArray<CyberEvent>;
  agentLog: ReadonlyArray<CyberAgentResponse>;
  narrator: string | null;
  play: () => void;
  pause: () => void;
  reset: () => void;
};

let eventSeq = 0;
const nextId = (prefix: string) => `${prefix}-${Date.now()}-${++eventSeq}`;

export function useCyberPlayback(
  scenario: CyberScenario | null,
): ScenarioPlaybackHandle {
  const [state, setState] = useState<PlaybackState>('idle');
  const [elapsedMs, setElapsedMs] = useState(0);
  const [pulses, setPulses] = useState<CyberEvent[]>([]);
  const [agentLog, setAgentLog] = useState<CyberAgentResponse[]>([]);
  const [narrator, setNarrator] = useState<string | null>(null);

  // Step cursor — only emit each timeline step once per playback session.
  const cursorRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const startedAtRef = useRef<number | null>(null);
  const pausedOffsetRef = useRef(0); // accumulated paused time

  const cleanupRaf = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  const reset = useCallback(() => {
    cleanupRaf();
    cursorRef.current = 0;
    startedAtRef.current = null;
    pausedOffsetRef.current = 0;
    setState('idle');
    setElapsedMs(0);
    setPulses([]);
    setAgentLog([]);
    setNarrator(null);
  }, [cleanupRaf]);

  // Reset whenever the scenario changes.
  useEffect(() => {
    reset();
  }, [scenario, reset]);

  const tick = useCallback(() => {
    if (!scenario || startedAtRef.current === null) return;
    const now = performance.now();
    const elapsed = now - startedAtRef.current - pausedOffsetRef.current;
    setElapsedMs(elapsed);

    // Emit every step whose atMs has passed since the last tick.
    let cursor = cursorRef.current;
    let didEmit = false;
    while (cursor < scenario.steps.length && scenario.steps[cursor].atMs <= elapsed) {
      const step = scenario.steps[cursor];
      if (step.narratorAr) {
        setNarrator(step.narratorAr);
      }
      if (step.events && step.events.length > 0) {
        const stamped: CyberEvent[] = step.events.map((e) => ({
          ...e,
          id: nextId('evt'),
          timestamp: new Date().toISOString(),
        }));
        setPulses((prev) => [...prev, ...stamped]);
        didEmit = true;
      }
      if (step.agentResponses && step.agentResponses.length > 0) {
        const stamped: CyberAgentResponse[] = step.agentResponses.map((r) => ({
          ...r,
          id: nextId('resp'),
          timestamp: new Date().toISOString(),
        }));
        setAgentLog((prev) => [...stamped, ...prev].slice(0, 30));
      }
      cursor++;
    }
    cursorRef.current = cursor;

    // Garbage-collect expired pulses so the canvas doesn't leak nodes.
    if (didEmit || pulses.length > 0) {
      const cutoff = Date.now();
      setPulses((prev) =>
        prev.filter((p) => {
          if (!p.lifetimeMs) return true;
          const age = cutoff - new Date(p.timestamp).getTime();
          return age <= p.lifetimeMs;
        }),
      );
    }

    if (elapsed >= scenario.totalDurationMs) {
      cleanupRaf();
      setState('finished');
      setNarrator(null);
      return;
    }

    rafRef.current = requestAnimationFrame(tick);
  }, [cleanupRaf, pulses.length, scenario]);

  const play = useCallback(() => {
    if (!scenario) return;
    if (state === 'finished') reset();
    if (startedAtRef.current === null) {
      startedAtRef.current = performance.now();
      pausedOffsetRef.current = 0;
    } else if (state === 'paused') {
      // Came back from pause — extend pausedOffset by the pause window.
      pausedOffsetRef.current += performance.now() - (startedAtRef.current + elapsedMs);
    }
    setState('playing');
    rafRef.current = requestAnimationFrame(tick);
  }, [elapsedMs, reset, scenario, state, tick]);

  const pause = useCallback(() => {
    cleanupRaf();
    if (state === 'playing') setState('paused');
  }, [cleanupRaf, state]);

  // Cleanup on unmount.
  useEffect(() => () => cleanupRaf(), [cleanupRaf]);

  return {
    state,
    elapsedMs,
    pulses,
    agentLog,
    narrator,
    play,
    pause,
    reset,
  };
}
