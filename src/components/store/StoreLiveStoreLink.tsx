/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * رابط خفيف إلى واجهة المتجر — أسفل يسار صفحات جار الحي والمدعوين.
 */
import { STORE_ORIGIN, STORE_PUBLIC_NAME_AR } from '@/config/storeFront';

const STORE_HOME_HREF = `${STORE_ORIGIN}/#/store`;

export function StoreLiveStoreLink() {
  return (
    <a
      href={STORE_HOME_HREF}
      className="store-live-store-link fixed bottom-2 left-2 z-40 pb-[env(safe-area-inset-bottom,0px)] pl-[env(safe-area-inset-left,0px)] sm:bottom-3 sm:left-3"
      aria-label={`${STORE_PUBLIC_NAME_AR} — المتجر`}
    >
      {STORE_PUBLIC_NAME_AR}
    </a>
  );
}
