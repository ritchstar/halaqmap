/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import { STORE_SHOP_PRESENCE_LABEL_AR, type StoreShopPresenceTag } from '@/config/storeShopPresence';
import { useStoreShopPresence } from '@/hooks/useStoreShopPresence';

export function StoreShopPresenceCount({
  productTag,
  token,
  labelAr,
}: {
  productTag: StoreShopPresenceTag;
  token: string;
  labelAr?: string;
}) {
  const count = useStoreShopPresence({ role: 'desk', productTag, token, enabled: Boolean(token) });
  return (
    <p className="mt-1 text-sm text-white/70">
      {labelAr ?? STORE_SHOP_PRESENCE_LABEL_AR} {count}
    </p>
  );
}
