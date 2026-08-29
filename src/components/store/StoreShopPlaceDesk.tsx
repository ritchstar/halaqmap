/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * حدد موقعي ثم إبراز الموقع أو إخفاؤه في لوحة التحكم.
 * مسار متحرك: تحديث موقعي الآن، وسجل، وجدول أسبوع متوقع.
 */
import { useState } from 'react';
import { STORE_MOBILE_VENDOR, STORE_MOBILE_VENDOR_WEEKDAYS_AR } from '@/config/storeMobileVendor';
import {
  appendPickupHistory,
  formatPickupUpdatedAtAr,
  mobileLocateTooSoon,
} from '@/lib/storeMobileVendor';
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
  const mobile = value.vendorMode === 'mobile';

  async function locate() {
    setBusy(true);
    setHint('');
    const result = await requestShopGeo();
    setBusy(false);
    if (result.ok === false) {
      setHint(result.denied ? copy.locateDeniedAr : copy.locateFailAr);
      return;
    }
    if (
      mobile
      && mobileLocateTooSoon(value.pickupUpdatedAt, value.pickupLat, value.pickupLng, result.lat, result.lng)
    ) {
      setHint(STORE_MOBILE_VENDOR.rateHintAr);
      return;
    }
    const mapsUrl = shopMapsSearchUrl(result.lat, result.lng);
    const at = new Date().toISOString();
    onChange({
      ...value,
      pickupLat: result.lat,
      pickupLng: result.lng,
      pickupMapsUrl: mapsUrl,
      pickupUpdatedAt: mobile ? at : value.pickupUpdatedAt,
      vendorTransit: mobile ? false : value.vendorTransit,
      pickupHistory: mobile
        ? appendPickupHistory(value.pickupHistory, { at, lat: result.lat, lng: result.lng, mapsUrl })
        : value.pickupHistory,
    });
    setHint(mobile ? STORE_MOBILE_VENDOR.locateSavedAr : copy.locateSavedAr);
  }

  return (
    <section className={cn('rounded-2xl border border-white/12 p-4', mobile && 'store-mobile-shell')} style={mobile ? { color: accent } : undefined}>
      <h3 className="font-extrabold">{copy.deskPickupTitleAr}</h3>
      <p className="mt-2 text-sm leading-7 text-white/65">{mobile ? STORE_MOBILE_VENDOR.deskLeadAr : copy.deskPickupLeadAr}</p>
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
      {mobile && value.pickupUpdatedAt ? (
        <p className="mt-2 text-xs leading-6 text-white/70">
          {STORE_MOBILE_VENDOR.updatedAtAr}: {formatPickupUpdatedAtAr(value.pickupUpdatedAt)}
        </p>
      ) : null}
      <div className="mt-2">
        <button
          type="button"
          onClick={() => void locate()}
          disabled={busy}
          className="rounded-full px-4 py-2 text-sm font-bold disabled:opacity-60"
          style={{ backgroundColor: accent, color: '#061018' }}
        >
          {busy ? copy.locatingAr : mobile ? STORE_MOBILE_VENDOR.locateNowAr : copy.locateMeAr}
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
      {mobile ? (
        <>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => onChange({ ...value, vendorTransit: true })}
              className={cn('rounded-full px-4 py-2 text-sm font-bold', value.vendorTransit ? '' : 'border border-white/20')}
              style={value.vendorTransit ? { backgroundColor: accent, color: '#061018' } : undefined}
            >
              {STORE_MOBILE_VENDOR.transitOnAr}
            </button>
            <button
              type="button"
              onClick={() => onChange({ ...value, vendorTransit: false })}
              className={cn('rounded-full px-4 py-2 text-sm font-bold', !value.vendorTransit ? '' : 'border border-white/20')}
              style={!value.vendorTransit ? { backgroundColor: accent, color: '#061018' } : undefined}
            >
              {STORE_MOBILE_VENDOR.transitOffAr}
            </button>
          </div>
          <div className="mt-4">
            <p className="text-sm font-extrabold">{STORE_MOBILE_VENDOR.weekPlanTitleAr}</p>
            <p className="mt-1 text-xs leading-6 text-white/65">{STORE_MOBILE_VENDOR.weekPlanLeadAr}</p>
            <div className="mt-2 grid gap-2">
              {STORE_MOBILE_VENDOR_WEEKDAYS_AR.map((day, index) => (
                <label key={day} className="block text-xs">
                  {day}
                  <input
                    className="mt-1 w-full rounded-xl border border-white/15 bg-black/20 px-3 py-2 text-sm text-white"
                    value={value.weekPlan[index] || ''}
                    maxLength={80}
                    onChange={(event) => {
                      const weekPlan = value.weekPlan.slice();
                      weekPlan[index] = event.target.value.slice(0, 80);
                      onChange({ ...value, weekPlan });
                    }}
                  />
                </label>
              ))}
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm font-extrabold">{STORE_MOBILE_VENDOR.historyTitleAr}</p>
            {value.pickupHistory.length === 0 ? (
              <p className="mt-1 text-xs leading-6 text-white/65">{STORE_MOBILE_VENDOR.historyEmptyAr}</p>
            ) : (
              <ul className="mt-2 space-y-1 text-xs leading-6 text-white/75">
                {value.pickupHistory.slice(0, 8).map((row) => (
                  <li key={row.at}>
                    {formatPickupUpdatedAtAr(row.at)}
                    {row.mapsUrl ? (
                      <>
                        {' · '}
                        <a href={row.mapsUrl} target="_blank" rel="noreferrer" style={{ color: accent }}>
                          {copy.pickupPlaceOpenAr}
                        </a>
                      </>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      ) : null}
    </section>
  );
}
