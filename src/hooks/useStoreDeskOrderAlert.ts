/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import type { StoreDeskOrderAlertProduct } from '@/config/storeDeskOrderAlert';
import {
  DEFAULT_STORE_DESK_ORDER_ALERT_PREFS,
  fireStoreDeskOrderAlert,
  playStoreDeskOrderAlertTone,
  readStoreDeskOrderAlertPrefs,
  requestStoreDeskOrderAlertPhone,
  setStoreDeskOrderAlertWake,
  storeDeskOrderAlertPhoneGranted,
  unlockStoreDeskOrderAlertAudio,
  writeStoreDeskOrderAlertPrefs,
  type StoreDeskOrderAlertPrefs,
} from '@/lib/storeDeskOrderAlert';

const REPEAT_MS = 12000;
const FLASH_MS = 2200;

export function useStoreDeskOrderAlert(input: {
  product: StoreDeskOrderAlertProduct;
  token: string;
  shopName: string;
  orderIds: string[];
  unreadCount: number;
}) {
  const { product, token, shopName, orderIds, unreadCount } = input;
  const [prefs, setPrefs] = useState<StoreDeskOrderAlertPrefs>(() =>
    readStoreDeskOrderAlertPrefs(product, token),
  );
  const [flashing, setFlashing] = useState(false);
  const [phoneReady, setPhoneReady] = useState(() => storeDeskOrderAlertPhoneGranted());
  const seenRef = useRef<Set<string> | null>(null);
  const flashTimer = useRef(0);

  useEffect(() => {
    setPrefs(readStoreDeskOrderAlertPrefs(product, token));
    seenRef.current = null;
  }, [product, token]);

  const persist = useCallback(
    (next: StoreDeskOrderAlertPrefs) => {
      setPrefs(next);
      writeStoreDeskOrderAlertPrefs(product, token, next);
    },
    [product, token],
  );

  const pulseLight = useCallback(() => {
    setFlashing(true);
    window.clearTimeout(flashTimer.current);
    flashTimer.current = window.setTimeout(() => setFlashing(false), FLASH_MS);
  }, []);

  const fire = useCallback(() => {
    if (!prefs.armed) return;
    if (prefs.lightOn) pulseLight();
    void fireStoreDeskOrderAlert(prefs, shopName);
  }, [prefs, pulseLight, shopName]);

  useEffect(() => {
    const ids = orderIds.filter(Boolean);
    if (seenRef.current === null) {
      seenRef.current = new Set(ids);
      return;
    }
    const fresh = ids.filter((id) => !seenRef.current!.has(id));
    seenRef.current = new Set(ids);
    if (fresh.length) fire();
  }, [fire, orderIds.join('\u001f')]);

  useEffect(() => {
    if (!prefs.armed || !prefs.repeatWhileUnread || unreadCount <= 0) return;
    const timer = window.setInterval(() => fire(), REPEAT_MS);
    return () => window.clearInterval(timer);
  }, [fire, prefs.armed, prefs.repeatWhileUnread, unreadCount]);

  useEffect(() => {
    if (!prefs.armed || !prefs.keepAwake) {
      void setStoreDeskOrderAlertWake(false);
      return;
    }
    void setStoreDeskOrderAlertWake(true);
    const onVisible = () => {
      if (document.visibilityState === 'visible') void setStoreDeskOrderAlertWake(true);
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      document.removeEventListener('visibilitychange', onVisible);
      void setStoreDeskOrderAlertWake(false);
    };
  }, [prefs.armed, prefs.keepAwake]);

  useEffect(() => {
    return () => window.clearTimeout(flashTimer.current);
  }, []);

  const arm = useCallback(async () => {
    unlockStoreDeskOrderAlertAudio();
    let phoneOk = phoneReady;
    if (prefs.phoneNotify) phoneOk = await requestStoreDeskOrderAlertPhone();
    setPhoneReady(phoneOk);
    const next = { ...prefs, armed: true };
    persist(next);
    if (next.keepAwake) void setStoreDeskOrderAlertWake(true);
    if (unreadCount > 0) {
      if (next.lightOn) pulseLight();
      void fireStoreDeskOrderAlert(next, shopName);
      return;
    }
    void playStoreDeskOrderAlertTone(next);
  }, [persist, phoneReady, prefs, pulseLight, shopName, unreadCount]);

  const save = useCallback(
    (patch: Partial<StoreDeskOrderAlertPrefs>) => {
      const next = { ...prefs, ...patch };
      if (patch.armed === true) unlockStoreDeskOrderAlertAudio();
      if (patch.phoneNotify === true) {
        void requestStoreDeskOrderAlertPhone().then(setPhoneReady);
      }
      persist(next);
    },
    [persist, prefs],
  );

  const preview = useCallback(
    async (patch?: Partial<StoreDeskOrderAlertPrefs>) => {
      const next = { ...prefs, ...patch, soundOn: true };
      unlockStoreDeskOrderAlertAudio();
      if (next.lightOn) pulseLight();
      if (next.vibrateOn) {
        const { vibrateStoreDeskOrderAlert } = await import('@/lib/storeDeskOrderAlert');
        vibrateStoreDeskOrderAlert();
      }
      return playStoreDeskOrderAlertTone(next);
    },
    [prefs, pulseLight],
  );

  return { prefs, save, arm, preview, flashing, phoneReady };
}
