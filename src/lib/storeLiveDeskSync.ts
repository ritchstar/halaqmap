/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * مزامنة لوحة الكاشير والمضيف: لا يُكتب النبض فوق الحقول أثناء التعديل،
 * والحفظ مؤجّل حتى يستقر النص حتى لا تتسابق الأحرف.
 */
import { useEffect, useRef } from 'react';

export const STORE_LIVE_DESK_SAVE_DELAY_MS = 700;
export const STORE_LIVE_DESK_HOLD_AFTER_SAVE_MS = 4000;

export function liveHostText(raw: unknown, fallback: string): string {
  return typeof raw === 'string' ? raw : fallback;
}

export function mergeDeskPollState<T extends { host: unknown }>(
  current: T,
  incoming: T,
  dirty: boolean,
): T {
  if (!dirty) return incoming;
  const held = { ...incoming, host: current.host };
  if ('shelf' in current) {
    return { ...held, shelf: (current as T & { shelf: unknown }).shelf };
  }
  return held;
}

export function shouldHoldDeskPoll(dirty: boolean, holdUntil: number, now = Date.now()): boolean {
  return dirty || now < holdUntil;
}

export function useStoreLiveDeskSync(enabled: boolean) {
  const dirty = useRef(false);
  const gen = useRef(0);
  const timer = useRef(0);
  const latest = useRef<unknown>(null);
  const saveFn = useRef<((state: unknown) => Promise<{ ok?: boolean } | void>) | null>(null);
  const holdUntil = useRef(0);

  useEffect(() => {
    return () => {
      window.clearTimeout(timer.current);
      if (dirty.current && latest.current != null && saveFn.current) {
        void saveFn.current(latest.current);
      }
    };
  }, []);

  function applyPoll<T extends { host: unknown }>(current: T, incoming: T): T {
    const hold = enabled && shouldHoldDeskPoll(dirty.current, holdUntil.current);
    return mergeDeskPollState(current, incoming, hold);
  }

  function scheduleSave<T>(next: T, save: (state: T) => Promise<{ ok?: boolean } | void>) {
    if (!enabled) return;
    dirty.current = true;
    latest.current = next;
    saveFn.current = save as (state: unknown) => Promise<{ ok?: boolean } | void>;
    window.clearTimeout(timer.current);
    const my = ++gen.current;
    timer.current = window.setTimeout(() => {
      const payload = latest.current as T;
      void Promise.resolve(save(payload))
        .then((res) => {
          if (my !== gen.current) return;
          if (res && typeof res === 'object' && res.ok === false) return;
          dirty.current = false;
          holdUntil.current = Date.now() + STORE_LIVE_DESK_HOLD_AFTER_SAVE_MS;
        })
        .catch(() => undefined);
    }, STORE_LIVE_DESK_SAVE_DELAY_MS);
  }

  return {
    applyPoll,
    scheduleSave,
    isDirty: () => dirty.current,
  };
}
