/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import { useEffect, useState } from 'react';
import {
  STORE_SHOP_PRESENCE_PING_MS,
  isStoreShopPresenceLabToken,
  type StoreShopPresenceTag,
} from '@/config/storeShopPresence';
import {
  countStoreShopPresence,
  leaveStoreShopPresence,
  pingStoreShopPresence,
  readStoreShopVisitorKey,
  subscribeLabPresence,
} from '@/lib/storeShopPresence';

export function useStoreShopPresence(opts: {
  role: 'shop' | 'desk';
  productTag: StoreShopPresenceTag;
  token: string;
  enabled?: boolean;
}): number {
  const { role, productTag, token, enabled = true } = opts;
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!enabled || !token) return;
    const isLab = isStoreShopPresenceLabToken(token);

    if (role === 'shop') {
      const visitorKey = readStoreShopVisitorKey(productTag, token);
      const tick = () => {
        if (typeof document !== 'undefined' && document.hidden) return;
        void pingStoreShopPresence(productTag, token, visitorKey);
      };
      tick();
      const timer = window.setInterval(tick, STORE_SHOP_PRESENCE_PING_MS);
      const onVis = () => {
        if (!document.hidden) tick();
      };
      document.addEventListener('visibilitychange', onVis);
      const onHide = () => {
        void leaveStoreShopPresence(productTag, token, visitorKey);
      };
      window.addEventListener('pagehide', onHide);
      return () => {
        window.clearInterval(timer);
        document.removeEventListener('visibilitychange', onVis);
        window.removeEventListener('pagehide', onHide);
        void leaveStoreShopPresence(productTag, token, visitorKey);
      };
    }

    const pull = () => {
      void countStoreShopPresence(productTag, token).then((n) => setCount(n));
    };
    pull();
    const timer = window.setInterval(pull, STORE_SHOP_PRESENCE_PING_MS);
    const unsub = isLab ? subscribeLabPresence(productTag, token, pull) : () => undefined;
    return () => {
      window.clearInterval(timer);
      unsub();
    };
  }, [enabled, productTag, role, token]);

  return count;
}
