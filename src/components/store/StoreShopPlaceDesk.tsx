/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * حدد موقعي ثم إبراز الموقع أو إخفاؤه في لوحة التحكم.
 */
import { useState } from 'react';
import { requestShopGeo, shopMapsSearchUrl, type ShopPickupPlace } from '@/lib/storeShopPlace';
import { cn } from '@/lib/utils';

export type StoreShopPlaceCopy = {
  locateMeAr: string;
  locatingAr: string;
  locateFailAr: string;
  locateDeniedAr: string;
  locateSavedAr: string;
  deskPickupTitleAr: string;
  deskPickupLeadAr: string;
  pickupShowAr: string;
  pickupHideAr: string;
  pickupPlaceOpenAr: string;
};

export function StoreShopPlaceDesk({
  value,
  onChange,
  copy,
  accent,
}: {
  value: ShopPickupPlace;
  onChange: (next: ShopPickupPlace) => void;
  copy: StoreShopPlaceCopy;
  accent: string;
}) {
  const [busy, setBusy] = useState(false);
  const [hint, setHint] = useState('');

  async function locate() {
    setBusy(true);
    setHint('');
    const result = await requestShopGeo();
    setBusy(false);
    if (result.ok === false) {
      setHint(result.denied ? copy.locateDeniedAr : copy.locateFailAr);
      return;
    }
    onChange({
      ...value,
      pickupLat: result.lat,
      pickupLng: result.lng,
      pickupMapsUrl: shopMapsSearchUrl(result.lat, result.lng),
    });
    setHint(copy.locateSavedAr);
  }

  return (
    <section className="rounded-2xl border border-white/12 p-4">
      <h3 className="font-extrabold">{copy.deskPickupTitleAr}</h3>
      <p className="mt-2 text-sm leading-7 text-white/65">{copy.deskPickupLeadAr}</p>
      {value.pickupMapsUrl ? (
        <a
          className="mt-3 inline-flex rounded-full border px-3 py-1.5 text-xs"
          style={{ borderColor: `${accent}66`, color: accent }}
          href={value.pickupMapsUrl}
          target="_blank"
          rel="noreferrer"
        >
          {copy.pickupPlaceOpenAr}
        </a>
      ) : null}
      <div className="mt-2">
        <button
          type="button"
          onClick={() => void locate()}
          disabled={busy}
          className="rounded-full px-4 py-2 text-sm font-bold disabled:opacity-60"
          style={{ backgroundColor: accent, color: '#061018' }}
        >
          {busy ? copy.locatingAr : copy.locateMeAr}
        </button>
        {hint ? <p className="mt-2 text-xs leading-6 text-white/70">{hint}</p> : null}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onChange({ ...value, pickupPlaceVisible: true })}
          className={cn(
            'rounded-full px-4 py-2 text-sm font-bold',
            value.pickupPlaceVisible ? '' : 'border border-white/20',
          )}
          style={value.pickupPlaceVisible ? { backgroundColor: accent, color: '#061018' } : undefined}
        >
          {copy.pickupShowAr}
        </button>
        <button
          type="button"
          onClick={() => onChange({ ...value, pickupPlaceVisible: false })}
          className={cn(
            'rounded-full px-4 py-2 text-sm font-bold',
            !value.pickupPlaceVisible ? '' : 'border border-white/20',
          )}
          style={!value.pickupPlaceVisible ? { backgroundColor: accent, color: '#061018' } : undefined}
        >
          {copy.pickupHideAr}
        </button>
      </div>
    </section>
  );
}
