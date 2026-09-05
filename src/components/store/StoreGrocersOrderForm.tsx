/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { StoreEnterpriseDirectMail } from '@/components/store/StoreEnterpriseDirectMail';
import { StoreVendorPathPicker } from '@/components/store/StoreVendorPathPicker';
import {
  STORE_GROCERS_LIVE,
  STORE_GROCERS_LIVE_CHECKOUT_ENABLED,
  grocersChatAddonSar,
  STORE_GROCERS_LIVE_PACKS,
  type StoreGrocersLivePackId,
} from '@/config/storeGrocersLive';
import { STORE_MOBILE_VENDOR, STORE_MOBILE_VENDOR_PACKS, type StoreVendorMode } from '@/config/storeMobileVendor';
import { rememberStoreAffiliateRef } from '@/lib/storeAffiliateRef';
import { createGrocersLivePending } from '@/lib/storeGrocersLiveRemote';
import { grocersLivePayHref } from '@/lib/storeHostRedirect';
import { ROUTE_PATHS } from '@/lib/routePaths';
import { cn } from '@/lib/utils';

function vendorModeLabel(mode: StoreVendorMode): string {
  return mode === 'mobile' ? STORE_GROCERS_LIVE.vendorMobileAr : STORE_GROCERS_LIVE.vendorFixedAr;
}

export function StoreGrocersOrderForm({
  renewToken = '',
  chatDetailsOpen = false,
  onChatDetailsToggle,
}: {
  renewToken?: string;
  chatDetailsOpen?: boolean;
  onChatDetailsToggle?: (open: boolean) => void;
}) {
  const renewing = Boolean(renewToken);
  const [vendorMode, setVendorMode] = useState<StoreVendorMode>('fixed');
  const [packId, setPackId] = useState<StoreGrocersLivePackId>('m6');
  const [email, setEmail] = useState('');
  const [shopName, setShopName] = useState('تموينات النخيل');
  const [chatAddon, setChatAddon] = useState(false);
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const packs = vendorMode === 'mobile' ? STORE_MOBILE_VENDOR_PACKS : STORE_GROCERS_LIVE_PACKS;
  const pack = packs.find((item) => item.id === packId) || packs[0];
  const chatOn = vendorMode === 'fixed' && chatAddon;
  const chatSar = chatOn ? grocersChatAddonSar(pack.id) : 0;
  const totalSar = pack.priceSar + chatSar;
  const termDays = pack.days;

  async function submit() {
    if (!STORE_GROCERS_LIVE_CHECKOUT_ENABLED || busy) return;
    if (!consent) {
      setError('الموافقة على شروط الخدمة مطلوبة قبل الدفع.');
      return;
    }
    setBusy(true);
    setError('');
    const affiliateCode = rememberStoreAffiliateRef();
    const result = await createGrocersLivePending(
      renewing
        ? { email, renewToken, packId, chatAddon: chatOn, vendorMode, affiliateCode }
        : { email, buyerName: shopName, shopName, packId, chatAddon: chatOn, vendorMode, affiliateCode },
    );
    if (!result.ok || typeof result.token !== 'string') {
      setBusy(false);
      setError(result.error || 'تعذر إنشاء طلب الدفع');
      return;
    }
    if (typeof result.deskToken === 'string') {
      window.sessionStorage.setItem(`grocers-live-desk:${result.token}`, result.deskToken);
    }
    const invoiceUrl = typeof result.invoiceUrl === 'string' ? result.invoiceUrl : '';
    window.location.assign(invoiceUrl.startsWith('https://') ? invoiceUrl : grocersLivePayHref(result.token));
  }

  return (
    <form
      id="grocers-order"
      className="rounded-2xl border border-[#8fbf7a]/30 bg-[#0b1a14]/90 p-5"
      onSubmit={(event) => {
        event.preventDefault();
        void submit();
      }}
    >
      <h3 className="text-lg font-extrabold">{renewing ? 'مدّد اشتراك تمويناتا1' : STORE_GROCERS_LIVE.orderTitleAr}</h3>
      <p className="mt-2 text-sm leading-7 text-white/70">
        {renewing ? 'نفس روابط واجهة العميل ولوحة الكاشير تُمدَّد بعد السداد.' : STORE_GROCERS_LIVE.orderLeadAr}
      </p>
      {!renewing ? (
        <p className="mt-2 text-sm leading-7 text-white/60">
          {STORE_GROCERS_LIVE.orderDirectAr}{' '}
          <Link to={`${ROUTE_PATHS.STORE_GENERAL_TRIAL}?product=grocers`} className="font-bold text-[#8fbf7a] underline-offset-4 hover:underline">
            {STORE_GROCERS_LIVE.trialCtaAr}
          </Link>
        </p>
      ) : null}
      <StoreVendorPathPicker
        value={vendorMode}
        onChange={(mode) => {
          setVendorMode(mode);
          if (mode === 'mobile') setChatAddon(false);
        }}
        accent="#8fbf7a"
        titleAr={STORE_GROCERS_LIVE.vendorPathTitleAr}
        leadAr={STORE_GROCERS_LIVE.vendorPathLeadAr}
        fixedTitleAr={STORE_GROCERS_LIVE.vendorFixedAr}
        mobileTitleAr={STORE_GROCERS_LIVE.vendorMobileAr}
      />
      {vendorMode === 'mobile' ? (
        <p className="mt-2 text-xs leading-6 text-[#8fbf7a]">{STORE_GROCERS_LIVE.vendorMobilePriceNoteAr}</p>
      ) : null}
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {packs.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setPackId(item.id)}
            className={cn(
              'rounded-2xl border px-4 py-3 text-right',
              packId === item.id ? 'border-[#8fbf7a] bg-[#8fbf7a]/15' : 'border-white/15',
            )}
          >
            <p className="font-extrabold">{item.titleAr}</p>
            <p className="mt-1 text-lg font-black text-[#8fbf7a]">{item.priceLineAr}</p>
            <p className="mt-1 text-xs leading-6 text-white/65">{item.lineAr}</p>
          </button>
        ))}
      </div>
      <label className="mt-4 block text-sm">
        البريد لاستلام روابط واجهة العميل ولوحة الكاشير وملصق QR
        <input className="grocers-field" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
      </label>
      {renewing ? null : (
        <label className="mt-3 block text-sm">
          {STORE_GROCERS_LIVE.shopNameLabelAr}
          <input className="grocers-field" required value={shopName} onChange={(e) => setShopName(e.target.value)} />
        </label>
      )}
      {vendorMode === 'fixed' ? (
        <div className="mt-4">
          <label className="flex items-start gap-2 text-sm leading-7">
            <input type="checkbox" checked={chatAddon} onChange={(e) => setChatAddon(e.target.checked)} className="mt-1" />
            <span>
              {STORE_GROCERS_LIVE.chatAddonCheckboxAr} — {grocersChatAddonSar(pack.id)} ر.س
            </span>
          </label>
          {onChatDetailsToggle ? (
            <button
              type="button"
              className="mt-1 text-xs font-bold text-[#8fbf7a] underline-offset-4 hover:underline"
              onClick={() => onChatDetailsToggle(!chatDetailsOpen)}
            >
              {STORE_GROCERS_LIVE.chatAddonDetailsAr}
            </button>
          ) : (
            <a href="#grocers-chat-addon" className="mt-1 inline-flex text-xs font-bold text-[#8fbf7a] underline-offset-4 hover:underline">
              {STORE_GROCERS_LIVE.chatAddonDetailsAr}
            </a>
          )}
        </div>
      ) : (
        <p className="mt-4 text-sm leading-7 text-white/65">{STORE_MOBILE_VENDOR.chatFixedOnlyAr.replace('صندوق المحادثة', 'قناة الاستفسار')}</p>
      )}
      <div className="mt-4 rounded-xl border border-white/12 bg-black/25 p-4 text-sm leading-7">
        <p>
          <span className="text-white/60">{STORE_GROCERS_LIVE.summaryProductAr}: </span>
          {STORE_GROCERS_LIVE.titleAr}
        </p>
        <p className="mt-1">
          <span className="text-white/60">{STORE_GROCERS_LIVE.summaryVendorAr}: </span>
          {vendorModeLabel(vendorMode)}
        </p>
        <p className="mt-1">
          <span className="text-white/60">{STORE_GROCERS_LIVE.summaryTermAr}: </span>
          {termDays} يوماً
        </p>
        <p className="mt-1">
          <span className="text-white/60">{STORE_GROCERS_LIVE.summaryChatAr}: </span>
          {chatOn ? STORE_GROCERS_LIVE.summaryChatOnAr : STORE_GROCERS_LIVE.summaryChatOffAr}
          {chatOn ? ` (+${chatSar} ر.س)` : ''}
        </p>
        <p className="mt-2 text-lg font-black text-[#8fbf7a]">
          {STORE_GROCERS_LIVE.summaryTotalAr}: {totalSar} ر.س
        </p>
      </div>
      <label className="mt-4 flex items-start gap-2 text-sm leading-7">
        <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-1" />
        <span>{STORE_GROCERS_LIVE.orderConsentAr}</span>
      </label>
      <p className="mt-2 text-xs leading-6 text-white/55">{STORE_GROCERS_LIVE.orderNoCollectAr}</p>
      {error ? <p className="mt-3 text-sm text-red-300">{error}</p> : null}
      <button
        type="submit"
        disabled={busy || !STORE_GROCERS_LIVE_CHECKOUT_ENABLED}
        className="mt-4 min-h-12 w-full rounded-full bg-[#8fbf7a] text-sm font-bold text-[#061018] disabled:opacity-50"
      >
        {busy ? 'جاري تجهيز بوابة الدفع…' : `${STORE_GROCERS_LIVE.orderSubmitAr} · ${totalSar} ر.س`}
      </button>
      <p className="mt-2 text-xs leading-6 text-white/50">{STORE_GROCERS_LIVE.orderScopeAr}</p>
      <StoreEnterpriseDirectMail
        className="mt-4"
        linkClassName="text-[#8fbf7a]"
        productTitleAr={STORE_GROCERS_LIVE.titleAr}
      />
    </form>
  );
}
