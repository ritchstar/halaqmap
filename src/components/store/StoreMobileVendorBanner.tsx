/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * حالة العربة للجار: في الموقع، في الطريق، أو غير محدّث. بلا بث حي.
 */
import { STORE_MOBILE_VENDOR, STORE_MOBILE_VENDOR_WEEKDAYS_AR } from '@/config/storeMobileVendor';
import {
  formatPickupUpdatedAtAr,
  neighborVendorState,
  type StoreNeighborVendorState,
} from '@/lib/storeMobileVendor';
import type { ShopPickupPlace } from '@/lib/storeShopPlace';

export function StoreMobileVendorBanner({
  place,
  closed,
  accent,
}: {
  place: ShopPickupPlace;
  closed: boolean;
  accent: string;
}) {
  if (place.vendorMode !== 'mobile') return null;
  const state = neighborVendorState({ ...place, closed });
  const stamp = formatPickupUpdatedAtAr(place.pickupUpdatedAt);
  const week = place.weekPlan
    .map((line, index) => ({ day: STORE_MOBILE_VENDOR_WEEKDAYS_AR[index], line: line.trim() }))
    .filter((row) => row.line);
  return (
    <aside className="store-mobile-shell rounded-2xl border px-4 py-3" style={{ color: accent, borderColor: `${accent}59` }}>
      <p className="text-sm font-extrabold leading-7">{neighborLineAr(state)}</p>
      {stamp ? (
        <p className="mt-1 text-xs leading-6 text-white/70">
          {STORE_MOBILE_VENDOR.updatedAtAr}: {stamp}
        </p>
      ) : null}
      {week.length ? (
        <ul className="mt-2 space-y-1 text-xs leading-6 text-white/75">
          {week.map((row) => (
            <li key={row.day}>
              {row.day}: {row.line}
            </li>
          ))}
        </ul>
      ) : null}
    </aside>
  );
}

function neighborLineAr(state: StoreNeighborVendorState): string {
  if (state === 'in_transit') return STORE_MOBILE_VENDOR.transitAr;
  if (state === 'at_pin') return STORE_MOBILE_VENDOR.atPinAr;
  return STORE_MOBILE_VENDOR.staleAr;
}
