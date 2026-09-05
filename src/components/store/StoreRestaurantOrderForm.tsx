/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import { useEffect, useState } from 'react';
import { StoreEnterpriseDirectMail } from '@/components/store/StoreEnterpriseDirectMail';
import { StoreVendorPathPicker } from '@/components/store/StoreVendorPathPicker';
import {
  STORE_RESTAURANT_LIVE,
  STORE_RESTAURANT_LIVE_CHECKOUT_ENABLED,
  STORE_RESTAURANT_LIVE_PACKS,
  type StoreRestaurantLivePackId,
} from '@/config/storeRestaurantLive';
import { STORE_MOBILE_VENDOR, STORE_MOBILE_VENDOR_PACKS, type StoreVendorMode } from '@/config/storeMobileVendor';
import { rememberStoreAffiliateRef } from '@/lib/storeAffiliateRef';
import { createRestaurantLivePending } from '@/lib/storeRestaurantLiveRemote';
import { restaurantLivePayHref } from '@/lib/storeHostRedirect';
import { cn } from '@/lib/utils';

export function StoreRestaurantOrderForm({ renewToken = '' }: { renewToken?: string }) {
  const renewing = Boolean(renewToken);
  const [vendorMode, setVendorMode] = useState<StoreVendorMode>('fixed');
  const [packId, setPackId] = useState<StoreRestaurantLivePackId>('m6');
  const [email, setEmail] = useState('');
  const [shopName, setShopName] = useState('مطعم السدرة');
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const packs = vendorMode === 'mobile' ? STORE_MOBILE_VENDOR_PACKS : STORE_RESTAURANT_LIVE_PACKS;
  const pack = packs.find((item) => item.id === packId) || packs[0];

  useEffect(() => {
    if (!packs.some((item) => item.id === packId)) {
      setPackId(packs[0]?.id || 'm6');
    }
  }, [packId, packs]);

  async function submit() {
    if (!STORE_RESTAURANT_LIVE_CHECKOUT_ENABLED || busy) return;
    if (!consent) {
      setError('الموافقة على شروط الخدمة مطلوبة قبل الدفع.');
      return;
    }
    setBusy(true);
    setError('');
    const affiliateCode = rememberStoreAffiliateRef();
    const result = await createRestaurantLivePending(
      renewing
        ? { email, renewToken, packId, vendorMode, affiliateCode }
        : { email, buyerName: shopName, shopName, packId, vendorMode, affiliateCode },
    );
    if (!result.ok || typeof result.token !== 'string') {
      setBusy(false);
      setError(result.error || 'تعذر إنشاء طلب الدفع');
      return;
    }
    if (typeof result.deskToken === 'string') {
      window.sessionStorage.setItem(`restaurant-live-desk:${result.token}`, result.deskToken);
    }
    const invoiceUrl = typeof result.invoiceUrl === 'string' ? result.invoiceUrl : '';
    window.location.assign(invoiceUrl.startsWith('https://') ? invoiceUrl : restaurantLivePayHref(result.token));
  }

  const vendorLabel = vendorMode === 'mobile' ? STORE_MOBILE_VENDOR.mobileTitleAr : STORE_MOBILE_VENDOR.fixedTitleAr;

  return (
    <form
      id="restaurant-order"
      className="rounded-2xl border border-[#e08a3c]/30 bg-[#1a1008]/90 p-5"
      onSubmit={(event) => {
        event.preventDefault();
        void submit();
      }}
    >
      <h2 className="text-xl font-extrabold">
        {renewing ? 'أعد الشراء على نفس الصفحة' : STORE_RESTAURANT_LIVE.orderCtaLandingAr}
      </h2>
      <p className="mt-2 text-sm leading-7 text-white/70">
        {renewing ? STORE_RESTAURANT_LIVE.orderRenewLeadAr : STORE_RESTAURANT_LIVE.orderNewLeadAr}
      </p>
      <StoreVendorPathPicker value={vendorMode} onChange={setVendorMode} accent="#e08a3c" />
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {packs.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setPackId(item.id)}
            className={cn(
              'rounded-2xl border px-4 py-3 text-right',
              packId === item.id ? 'border-[#e08a3c] bg-[#e08a3c]/15' : 'border-white/15',
            )}
          >
            <p className="font-extrabold">
              <bdi>{item.titleAr}</bdi>
            </p>
            <p className="mt-1 text-lg font-black text-[#e08a3c]">
              <bdi>{item.priceLineAr}</bdi>
            </p>
            <p className="mt-1 text-xs leading-6 text-white/65">{item.lineAr}</p>
          </button>
        ))}
      </div>
      <div className="mt-4 rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm leading-7 text-white/75">
        <p>
          <span className="text-white/55">{STORE_RESTAURANT_LIVE.summaryProductAr}: </span>
          <bdi>{STORE_RESTAURANT_LIVE.titleAr}</bdi>
        </p>
        <p className="mt-1">
          <span className="text-white/55">{STORE_RESTAURANT_LIVE.summaryVendorAr}: </span>
          {vendorLabel}
        </p>
        <p className="mt-1">
          <span className="text-white/55">{STORE_RESTAURANT_LIVE.summaryTermAr}: </span>
          <bdi>{pack.titleAr}</bdi>
        </p>
        <p className="mt-2 text-base font-black text-[#e08a3c]">
          <span className="text-sm font-bold text-white/55">{STORE_RESTAURANT_LIVE.summaryTotalAr}: </span>
          <bdi>{pack.priceSar.toLocaleString('ar-SA')} ر.س</bdi>
        </p>
      </div>
      <label className="mt-4 block text-sm">
        البريد لاستلام روابط الصفحة ولوحة المطبخ وملصق QR
        <input className="restaurant-field" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
      </label>
      {renewing ? null : (
        <label className="mt-3 block text-sm">
          {STORE_RESTAURANT_LIVE.restaurantNameLabelAr}
          <input className="restaurant-field" required value={shopName} onChange={(e) => setShopName(e.target.value)} />
        </label>
      )}
      <label className="mt-4 flex items-start gap-2 text-sm leading-7">
        <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-1" />
        <span>{STORE_RESTAURANT_LIVE.orderConsentAr}</span>
      </label>
      <p className="mt-2 text-xs leading-6 text-white/55">{STORE_RESTAURANT_LIVE.orderNoCollectAr}</p>
      {error ? <p className="mt-3 text-sm text-red-300">{error}</p> : null}
      <button
        type="submit"
        disabled={busy || !STORE_RESTAURANT_LIVE_CHECKOUT_ENABLED}
        className="mt-4 min-h-12 w-full rounded-full bg-[#e08a3c] text-sm font-bold text-[#061018] disabled:opacity-50"
      >
        {busy ? (
          'جاري تجهيز بوابة الدفع…'
        ) : (
          <>
            {STORE_RESTAURANT_LIVE.orderSubmitAr} — <bdi>{pack.priceSar.toLocaleString('ar-SA')} ر.س</bdi>
          </>
        )}
      </button>
      <StoreEnterpriseDirectMail
        className="mt-4"
        linkClassName="text-[#e08a3c]"
        productTitleAr={STORE_RESTAURANT_LIVE.titleAr}
      />
    </form>
  );
}
