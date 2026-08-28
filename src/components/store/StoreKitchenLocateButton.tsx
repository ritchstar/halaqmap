/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * تحديد موقع الزبون أو النشاط في طبختنا1 بعد موافقة المتصفح.
 */
import { useState } from 'react';
import { STORE_KITCHEN_LIVE } from '@/config/storeKitchenLive';
import { kitchenMapsSearchUrl, requestKitchenGeo } from '@/lib/storeKitchenLiveLab';

export function StoreKitchenLocateButton({
  onLocated,
}: {
  onLocated: (next: { lat: number; lng: number; mapsUrl: string }) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [hint, setHint] = useState('');

  async function locate() {
    setBusy(true);
    setHint('');
    const result = await requestKitchenGeo();
    setBusy(false);
    if (result.ok === false) {
      setHint(result.denied ? STORE_KITCHEN_LIVE.locateDeniedAr : STORE_KITCHEN_LIVE.locateFailAr);
      return;
    }
    const mapsUrl = kitchenMapsSearchUrl(result.lat, result.lng);
    onLocated({ lat: result.lat, lng: result.lng, mapsUrl });
    setHint(STORE_KITCHEN_LIVE.locateSavedAr);
  }

  return (
    <div className="mt-2">
      <button
        type="button"
        onClick={() => void locate()}
        disabled={busy}
        className="rounded-full bg-[#b45a3c] px-4 py-2 text-sm font-bold text-[#061018] disabled:opacity-60"
      >
        {busy ? STORE_KITCHEN_LIVE.locatingAr : STORE_KITCHEN_LIVE.locateMeAr}
      </button>
      {hint ? <p className="mt-2 text-xs leading-6 text-white/70">{hint}</p> : null}
    </div>
  );
}
