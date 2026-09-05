/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { StoreEnterpriseDirectMail } from '@/components/store/StoreEnterpriseDirectMail';
import { StoreVendorPathPicker } from '@/components/store/StoreVendorPathPicker';
import {
  STORE_PRODUCE_LIVE,
  STORE_PRODUCE_LIVE_CHECKOUT_ENABLED,
  STORE_PRODUCE_LIVE_PACKS,
  type StoreProduceLivePackId,
} from '@/config/storeProduceLive';
import { type StoreVendorMode } from '@/config/storeMobileVendor';
import { rememberStoreAffiliateRef } from '@/lib/storeAffiliateRef';
import { createProduceLivePending } from '@/lib/storeProduceLiveRemote';
import { produceLivePayHref } from '@/lib/storeHostRedirect';
import { ROUTE_PATHS } from '@/lib/routePaths';
import { cn } from '@/lib/utils';

export function StoreProduceOrderForm({ renewToken = '' }: { renewToken?: string }) {
  const renewing = Boolean(renewToken);
  const [vendorMode, setVendorMode] = useState<StoreVendorMode>('fixed');
  const [packId, setPackId] = useState<StoreProduceLivePackId>('m6');
  const [email, setEmail] = useState('');
  const [shopName, setShopName] = useState('خضار الحي');
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const pack = STORE_PRODUCE_LIVE_PACKS.find((item) => item.id === packId) || STORE_PRODUCE_LIVE_PACKS[0];

  async function submit() {
    if (!STORE_PRODUCE_LIVE_CHECKOUT_ENABLED || busy) return;
    if (!consent) {
      setError('الموافقة على شروط الخدمة مطلوبة قبل الدفع.');
      return;
    }
    setBusy(true);
    setError('');
    const affiliateCode = rememberStoreAffiliateRef();
    const result = await createProduceLivePending(
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
      window.sessionStorage.setItem(`produce-live-desk:${result.token}`, result.deskToken);
    }
    const invoiceUrl = typeof result.invoiceUrl === 'string' ? result.invoiceUrl : '';
    window.location.assign(invoiceUrl.startsWith('https://') ? invoiceUrl : produceLivePayHref(result.token));
  }

  return (
    <form
      id="produce-order"
      className="rounded-2xl border border-[#3d8b4a]/30 bg-[#0b1a10]/90 p-5"
      onSubmit={(event) => {
        event.preventDefault();
        void submit();
      }}
    >
      <h3 className="text-lg font-extrabold">{renewing ? 'مدّد تشغيل خضارنا1' : STORE_PRODUCE_LIVE.orderTitleAr}</h3>
      <p className="mt-2 text-sm leading-7 text-white/70">
        {renewing ? 'نفس روابط واجهة العميل ولوحة التشغيل تُمدَّد بعد السداد.' : STORE_PRODUCE_LIVE.orderLeadAr}
      </p>
      {!renewing ? (
        <p className="mt-2 text-sm leading-7 text-white/60">
          {STORE_PRODUCE_LIVE.orderDirectAr}{' '}
          <Link to={`${ROUTE_PATHS.STORE_GENERAL_TRIAL}?product=produce`} className="font-bold text-[#3d8b4a] underline-offset-4 hover:underline">
            {STORE_PRODUCE_LIVE.trialCtaAr}
          </Link>
        </p>
      ) : null}
      <StoreVendorPathPicker
        value={vendorMode}
        onChange={setVendorMode}
        accent="#3d8b4a"
        titleAr={STORE_PRODUCE_LIVE.vendorPathTitleAr}
        leadAr={STORE_PRODUCE_LIVE.vendorPathLeadAr}
        fixedTitleAr={STORE_PRODUCE_LIVE.vendorFixedAr}
        mobileTitleAr={STORE_PRODUCE_LIVE.vendorMobileAr}
      />
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {STORE_PRODUCE_LIVE_PACKS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setPackId(item.id)}
            className={cn(
              'rounded-2xl border px-4 py-3 text-right',
              packId === item.id ? 'border-[#3d8b4a] bg-[#3d8b4a]/15' : 'border-white/15',
            )}
          >
            <p className="font-extrabold">{item.titleAr}</p>
            <p className="mt-1 text-lg font-black text-[#3d8b4a]">{item.priceLineAr}</p>
            <p className="mt-1 text-xs leading-6 text-white/65">{item.lineAr}</p>
          </button>
        ))}
      </div>
      <label className="mt-4 block text-sm">
        البريد لاستلام روابط واجهة العميل ولوحة التشغيل وملصق QR
        <input className="produce-field" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
      </label>
      {renewing ? null : (
        <label className="mt-3 block text-sm">
          {STORE_PRODUCE_LIVE.shopNameLabelAr}
          <input className="produce-field" required value={shopName} onChange={(e) => setShopName(e.target.value)} />
        </label>
      )}
      <label className="mt-4 flex items-start gap-2 text-sm leading-7">
        <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-1" />
        <span>{STORE_PRODUCE_LIVE.orderConsentAr}</span>
      </label>
      <p className="mt-2 text-xs leading-6 text-white/55">{STORE_PRODUCE_LIVE.orderNoCollectAr}</p>
      {error ? <p className="mt-3 text-sm text-red-300">{error}</p> : null}
      <button
        type="submit"
        disabled={busy || !STORE_PRODUCE_LIVE_CHECKOUT_ENABLED}
        className="mt-4 min-h-12 w-full rounded-full bg-[#3d8b4a] text-sm font-bold text-[#061018] disabled:opacity-50"
      >
        {busy ? 'جاري تجهيز بوابة الدفع…' : `${STORE_PRODUCE_LIVE.orderSubmitAr} · ${pack.priceSar} ر.س`}
      </button>
      <p className="mt-2 text-xs leading-6 text-white/50">لا يُخلط هذا الاشتراك بفاتورة الرخصة أو تمويناتا1 أو طبختنا1.</p>
      <StoreEnterpriseDirectMail
        className="mt-4"
        linkClassName="text-[#3d8b4a]"
        productTitleAr={STORE_PRODUCE_LIVE.titleAr}
      />
    </form>
  );
}
