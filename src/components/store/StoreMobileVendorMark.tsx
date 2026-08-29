/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import { STORE_MOBILE_VENDOR } from '@/config/storeMobileVendor';

export function StoreMobileVendorMark({ accent }: { accent: string }) {
  return (
    <span className="store-mobile-mark" style={{ color: accent }}>
      {STORE_MOBILE_VENDOR.markAr}
    </span>
  );
}
