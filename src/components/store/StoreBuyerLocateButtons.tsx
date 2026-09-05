/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * حدد موقعي ثم تأكد من موقعي على صفحات طلب جار الحي بعد موافقة المتصفح.
 */
import { useState } from 'react';
import { buyerPlaceMapsUrl, requestShopGeo, shopMapsSearchUrl } from '@/lib/storeShopPlace';

export type StoreBuyerLocateCopy = {
  locateMeAr: string;
  locatingAr: string;
  locateFailAr: string;
  locateDeniedAr: string;
  locateSavedAr: string;
  confirmPlaceAr: string;
  adoptPlaceAr?: string;
};

export function StoreBuyerLocateButtons({
  value,
  onLocated,
  onCoords,
  onAdopted,
  accent,
  copy,
}: {
  value: string;
  onLocated: (mapsUrl: string) => void;
  onCoords?: (lat: number, lng: number) => void;
  onAdopted?: () => void;
  accent: string;
  copy: StoreBuyerLocateCopy;
}) {
  const [busy, setBusy] = useState(false);
  const [hint, setHint] = useState('');
  const confirmUrl = buyerPlaceMapsUrl(value);

  async function locate() {
    setBusy(true);
    setHint('');
    const result = await requestShopGeo();
    setBusy(false);
    if (result.ok === false) {
      setHint(result.denied ? copy.locateDeniedAr : copy.locateFailAr);
      return;
    }
    onLocated(shopMapsSearchUrl(result.lat, result.lng));
    onCoords?.(result.lat, result.lng);
    setHint(copy.locateSavedAr);
  }

  function confirm() {
    if (!confirmUrl) return;
    window.open(confirmUrl, '_blank', 'noopener,noreferrer');
  }

  return (
    <div className="mt-2">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => void locate()}
          disabled={busy}
          className="rounded-full px-4 py-2 text-sm font-bold disabled:opacity-60"
          style={{ backgroundColor: accent, color: '#061018' }}
        >
          {busy ? copy.locatingAr : copy.locateMeAr}
        </button>
        <button
          type="button"
          onClick={confirm}
          disabled={!confirmUrl}
          className="rounded-full border px-4 py-2 text-sm font-bold disabled:opacity-50"
          style={{ borderColor: `${accent}99`, color: accent }}
        >
          {copy.confirmPlaceAr}
        </button>
        {copy.adoptPlaceAr && onAdopted ? (
          <button
            type="button"
            onClick={() => {
              if (!value.trim()) return;
              onAdopted();
            }}
            disabled={!value.trim()}
            className="rounded-full border px-4 py-2 text-sm font-bold disabled:opacity-50"
            style={{ borderColor: `${accent}99`, color: accent }}
          >
            {copy.adoptPlaceAr}
          </button>
        ) : null}
      </div>
      {hint ? <p className="mt-2 text-xs leading-6 text-white/70">{hint}</p> : null}
    </div>
  );
}
