/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * ملصق QR وكرت الجوال ومشاركة المعرض على القنوات. من لوحة حلانا1 فقط.
 */
import { StoreLiveShopShareDesk } from '@/components/store/StoreLiveShopShareDesk';
import { STORE_HALANA_LIVE_ACCENT, STORE_HALANA_LIVE_COPY } from '@/config/storeHalanaLive';
import { halanaShowcaseAbsoluteUrl } from '@/lib/storeHalanaShare';

export function StoreHalanaShareDesk({ token, shopName }: { token: string; shopName: string }) {
  const copy = STORE_HALANA_LIVE_COPY;
  return (
    <StoreLiveShopShareDesk
      kind="halana"
      token={token}
      shopName={shopName}
      shopUrl={halanaShowcaseAbsoluteUrl(token)}
      qrPhraseAr={copy.qrPhraseAr}
      qrPrintAr={copy.qrPrintAr}
      accent={STORE_HALANA_LIVE_ACCENT}
      variant="halana"
    />
  );
}
