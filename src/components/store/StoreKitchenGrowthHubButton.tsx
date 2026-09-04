/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * زر مركز نمو طبختنا1 في رأس لوحة النشاط. لا يُستورد من App.
 */
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
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
    <Link
      to={kitchenGrowthHubPath(token)}
      className="relative inline-flex items-center gap-2 rounded-full border border-[#b45a3c]/45 bg-[#b45a3c]/15 px-3 py-1.5 text-sm font-extrabold text-[#f4efe4]"
    >
      {unread ? (
        <span
          className="inline-block h-2.5 w-2.5 shrink-0 rounded-full bg-[#e23d3d]"
          aria-label={STORE_KITCHEN_GROWTH_HUB_COPY.badgeLabelAr}
        />
      ) : null}
      {STORE_KITCHEN_GROWTH_HUB_COPY.buttonAr}
    </Link>
  );
}
