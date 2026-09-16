/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { StoreCheckoutLegalConsent } from '@/components/store/StoreCheckoutLegalConsent';
import { StoreVendorPathPicker } from '@/components/store/StoreVendorPathPicker';
import {
  STORE_BAKHURNA_LIVE,
  STORE_BAKHURNA_LIVE_CHECKOUT_ENABLED,
  STORE_BAKHURNA_LIVE_PACKS,
  type StoreBakhurnaLivePackId,
} from '@/config/storeBakhurnaLive';
import { type StoreVendorMode } from '@/config/storeMobileVendor';
import { buildStorePurchaseLegalConsentFields } from '@/lib/storePurchaseLegalConsent';
import { rememberStoreAffiliateRef } from '@/lib/storeAffiliateRef';
import { createBakhurnaLivePending } from '@/lib/storeBakhurnaLiveRemote';
import { bakhurnaLivePayHref } from '@/lib/storeHostRedirect';
import { ROUTE_PATHS } from '@/lib/routePaths';
import { cn } from '@/lib/utils';

export function StoreBakhurnaOrderForm({ renewToken = '' }: { renewToken?: string }) {
  const renewing = Boolean(renewToken);
  const [vendorMode, setVendorMode] = useState<StoreVendorMode>('fixed');
  const [packId, setPackId] = useState<StoreBakhurnaLivePackId>('m6');
  const [email, setEmail] = useState('');
  const [shopName, setShopName] = useState('بخور الحي');
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const pack = STORE_BAKHURNA_LIVE_PACKS.find((item) => item.id === packId) || STORE_BAKHURNA_LIVE_PACKS[0];

  async function submit() {
    if (!STORE_BAKHURNA_LIVE_CHECKOUT_ENABLED || busy) return;
    if (!consent) {
      setError('الموافقة على شروط الخدمة مطلوبة قبل الدفع.');
      return;
    }
    setBusy(true);
    setError('');
    const affiliateCode = rememberStoreAffiliateRef();
    const consentFields = buildStorePurchaseLegalConsentFields({ includeDirectPay: true });
    const result = await createBakhurnaLivePending(
      renewing
        ? { email, renewToken, packId, vendorMode, affiliateCode, ...consentFields }
        : { email, buyerName: shopName, shopName, packId, vendorMode, affiliateCode, ...consentFields },
    );
    if (!result.ok || typeof result.token !== 'string') {
      setBusy(false);
      setError(result.error || 'تعذر إنشاء طلب الدفع');
      return;
    }
    if (typeof result.deskToken === 'string') {
      window.sessionStorage.setItem(`bakhurna-live-desk:${result.token}`, result.deskToken);
    }
    const invoiceUrl = typeof result.invoiceUrl === 'string' ? result.invoiceUrl : '';
    window.location.assign(invoiceUrl.startsWith('https://') ? invoiceUrl : bakhurnaLivePayHref(result.token));
  }

  return (
    <form
      id="bakhurna-order"
      className="rounded-2xl border border-[#6E4A26]/30 bg-[#1a140c]/90 p-5"
      onSubmit={(event) => {
        event.preventDefault();
        void submit();
      }}
    >
      <h3 className="text-lg font-extrabold">{renewing ? 'مدّد تشغيل بخورنا1' : STORE_BAKHURNA_LIVE.orderTitleAr}</h3>
      <p className="mt-2 text-sm leading-7 text-white/70">
        {renewing ? 'نفس روابط واجهة العميل ولوحة التشغيل تُمدَّد بعد السداد.' : STORE_BAKHURNA_LIVE.orderLeadAr}
      </p>
      {!renewing ? (
        <p className="mt-2 text-sm leading-7 text-white/60">
          {STORE_BAKHURNA_LIVE.orderDirectAr}{' '}
          <Link to={`${ROUTE_PATHS.STORE_GENERAL_TRIAL}?product=bakhurna`} className="font-bold text-[#6E4A26] underline-offset-4 hover:underline">
            {STORE_BAKHURNA_LIVE.trialCtaAr}
          </Link>
        </p>
      ) : null}
      <StoreVendorPathPicker
        value={vendorMode}
        onChange={setVendorMode}
        accent="#6E4A26"
        titleAr={STORE_BAKHURNA_LIVE.vendorPathTitleAr}
        leadAr={STORE_BAKHURNA_LIVE.vendorPathLeadAr}
        fixedTitleAr={STORE_BAKHURNA_LIVE.vendorFixedAr}
        mobileTitleAr={STORE_BAKHURNA_LIVE.vendorMobileAr}
      />
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {STORE_BAKHURNA_LIVE_PACKS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setPackId(item.id)}
            className={cn(
              'rounded-2xl border px-4 py-3 text-right',
              packId === item.id ? 'border-[#6E4A26] bg-[#6E4A26]/15' : 'border-white/15',
            )}
          >
            <p className="font-extrabold">{item.titleAr}</p>
            <p className="mt-1 text-lg font-black text-[#6E4A26]">{item.priceLineAr}</p>
            <p className="mt-1 text-xs leading-6 text-white/65">{item.lineAr}</p>
          </button>
        ))}
      </div>
      <label className="mt-4 block text-sm">
        البريد لاستلام روابط واجهة العميل ولوحة التشغيل ورمز QR
        <input className="bakhurna-field" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
      </label>
      {renewing ? null : (
        <label className="mt-3 block text-sm">
          {STORE_BAKHURNA_LIVE.shopNameLabelAr}
          <input className="bakhurna-field" required value={shopName} onChange={(e) => setShopName(e.target.value)} />
        </label>
      )}
      <StoreCheckoutLegalConsent checked={consent} onChange={setConsent} includeDirectPay className="mt-4" />
      <p className="mt-2 text-xs leading-6 text-white/55">{STORE_BAKHURNA_LIVE.orderNoCollectAr}</p>
      {error ? <p className="mt-3 text-sm text-red-300">{error}</p> : null}
      <button
        type="submit"
        disabled={busy || !STORE_BAKHURNA_LIVE_CHECKOUT_ENABLED}
        className="mt-4 min-h-12 w-full rounded-full bg-[#6E4A26] text-sm font-bold text-[#061018] disabled:opacity-50"
      >
        {busy ? 'جاري تجهيز بوابة الدفع…' : `${STORE_BAKHURNA_LIVE.orderSubmitAr} · ${pack.priceSar} ر.س`}
      </button>
      <p className="mt-2 text-xs leading-6 text-white/50">لا يُخلط هذا الاشتراك بفاتورة الرخصة أو خضارنا1 أو تمويناتا1.</p>
    </form>
  );
}
