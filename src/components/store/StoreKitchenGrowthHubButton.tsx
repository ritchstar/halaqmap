/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * رابط مركز نمو طبختنا1 — ضمن ركن النمو والدعم أسفل يسار اللوحة.
 */
import { useEffect, useState } from 'react';
import { StoreDeskCornerLink } from '@/components/store/StoreDeskCornerNav';
import {
  kitchenGrowthHubPath,
  STORE_KITCHEN_GROWTH_HUB_COPY,
} from '@/config/storeKitchenGrowthHub';
import { hasKitchenGrowthHubBadge } from '@/lib/storeKitchenGrowthHubSeen';

export function StoreKitchenGrowthHubButton({ token }: { token: string }) {
  const [unread, setUnread] = useState(false);

  useEffect(() => {
    setUnread(hasKitchenGrowthHubBadge(token));
  }, [token]);

  return (
    <StoreDeskCornerLink
      to={kitchenGrowthHubPath(token)}
      labelAr={STORE_KITCHEN_GROWTH_HUB_COPY.cornerLinkAr}
      ariaLabel={STORE_KITCHEN_GROWTH_HUB_COPY.buttonAr}
      badge={unread}
    />
  );
}
