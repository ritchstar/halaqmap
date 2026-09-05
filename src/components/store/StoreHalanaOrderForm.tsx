/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import { useState } from 'react';
import { StoreEnterpriseDirectMail } from '@/components/store/StoreEnterpriseDirectMail';
import {
  STORE_HALANA_LIVE,
  STORE_HALANA_LIVE_CHECKOUT_ENABLED,
  STORE_HALANA_LIVE_PACKS,
  type StoreHalanaLivePackId,
} from '@/config/storeHalanaLive';
import { rememberStoreAffiliateRef } from '@/lib/storeAffiliateRef';
import { createHalanaLivePending } from '@/lib/storeHalanaLiveRemote';
import { halanaLivePayHref } from '@/lib/storeHostRedirect';
import { cn } from '@/lib/utils';

export function StoreHalanaOrderForm({ renewToken = '' }: { renewToken?: string }) {
  const renewing = Boolean(renewToken);
  const [packId, setPackId] = useState<StoreHalanaLivePackId>('m6');
  const [email, setEmail] = useState('');
  const [shopName, setShopName] = useState('حلويات الدار');
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const pack = STORE_HALANA_LIVE_PACKS.find((item) => item.id === packId) || STORE_HALANA_LIVE_PACKS[0];

  async function submit() {
    if (!STORE_HALANA_LIVE_CHECKOUT_ENABLED || busy) return;
    if (!consent) {
      setError('الموافقة على شروط الخدمة مطلوبة قبل الدفع.');
      return;
    }
    setBusy(true);
    setError('');
    const affiliateCode = rememberStoreAffiliateRef();
    const result = await createHalanaLivePending(
      renewing
        ? { email, renewToken, packId, affiliateCode }
        : { email, buyerName: shopName, shopName, packId, affiliateCode },
    );
    if (!result.ok || typeof result.token !== 'string') {
      setBusy(false);
      setError(result.error || 'تعذر إنشاء طلب الدفع');
      return;
    }
    if (typeof result.deskToken === 'string') {
      window.sessionStorage.setItem(`halana-live-desk:${result.token}`, result.deskToken);
    }
    const invoiceUrl = typeof result.invoiceUrl === 'string' ? result.invoiceUrl : '';
    window.location.assign(invoiceUrl.startsWith('https://') ? invoiceUrl : halanaLivePayHref(result.token));
  }

  return (
    <form
      id="halana-order"
      className="rounded-2xl border border-[#c45c7a]/30 bg-[#1a0c10]/90 p-5"
      onSubmit={(event) => {
        event.preventDefault();
        void submit();
      }}
    >
      <h2 className="text-xl font-extrabold">{renewing ? 'مدّدي اشتراك حلانا1' : STORE_HALANA_LIVE.orderCtaLandingAr}</h2>
      <p className="mt-2 text-sm leading-7 text-white/70">
        {renewing ? STORE_HALANA_LIVE.orderRenewLeadAr : STORE_HALANA_LIVE.orderNewLeadAr}
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {STORE_HALANA_LIVE_PACKS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setPackId(item.id)}
            className={cn(
              'rounded-2xl border px-4 py-3 text-right',
              packId === item.id ? 'border-[#c45c7a] bg-[#c45c7a]/15' : 'border-white/15',
            )}
          >
            <p className="font-extrabold">
              <bdi>{item.titleAr}</bdi>
            </p>
            <p className="mt-1 text-lg font-black text-[#c45c7a]">
              <bdi>{item.priceLineAr}</bdi>
            </p>
            <p className="mt-1 text-xs leading-6 text-white/65">{item.lineAr}</p>
          </button>
        ))}
      </div>
      <label className="mt-4 block text-sm">
        {STORE_HALANA_LIVE.orderEmailLabelAr}
        <input className="restaurant-field" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
      </label>
      {renewing ? null : (
        <label className="mt-3 block text-sm">
          {STORE_HALANA_LIVE.specialistNameLabelAr}
          <input className="restaurant-field" required value={shopName} onChange={(e) => setShopName(e.target.value)} />
        </label>
      )}
      <label className="mt-4 flex items-start gap-2 text-sm leading-7">
        <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-1" />
        <span>{STORE_HALANA_LIVE.orderConsentAr}</span>
      </label>
      <p className="mt-2 text-xs leading-6 text-white/55">{STORE_HALANA_LIVE.orderNoCollectAr}</p>
      {error ? <p className="mt-3 text-sm text-red-300">{error}</p> : null}
      <button
        type="submit"
        disabled={busy || !STORE_HALANA_LIVE_CHECKOUT_ENABLED}
        className="mt-4 min-h-12 w-full rounded-full bg-[#c45c7a] text-sm font-bold text-[#061018] disabled:opacity-50"
      >
        {busy ? (
          'جاري تجهيز بوابة الدفع…'
        ) : (
          <>
            {STORE_HALANA_LIVE.orderSubmitAr} — <bdi>{pack.priceSar} ر.س</bdi>
          </>
        )}
      </button>
      <StoreEnterpriseDirectMail
        className="mt-4"
        linkClassName="text-[#c45c7a]"
        productTitleAr={STORE_HALANA_LIVE.titleAr}
      />
    </form>
  );
}
