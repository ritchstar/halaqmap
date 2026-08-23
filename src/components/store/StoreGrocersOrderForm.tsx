/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import { useState } from 'react';
import {
  STORE_GROCERS_LIVE,
  STORE_GROCERS_LIVE_CHECKOUT_ENABLED,
  grocersChatAddonSar,
  STORE_GROCERS_LIVE_PACKS,
  type StoreGrocersLivePackId,
} from '@/config/storeGrocersLive';
import { rememberStoreAffiliateRef } from '@/lib/storeAffiliateRef';
import { createGrocersLivePending } from '@/lib/storeGrocersLiveRemote';
import { grocersLivePayHref } from '@/lib/storeHostRedirect';
import { cn } from '@/lib/utils';

export function StoreGrocersOrderForm({ renewToken = '' }: { renewToken?: string }) {
  const renewing = Boolean(renewToken);
  const [packId, setPackId] = useState<StoreGrocersLivePackId>('m6');
  const [email, setEmail] = useState('');
  const [shopName, setShopName] = useState('تموينات النخيل');
  const [chatAddon, setChatAddon] = useState(false);
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const pack = STORE_GROCERS_LIVE_PACKS.find((item) => item.id === packId) || STORE_GROCERS_LIVE_PACKS[0];

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
        ? { email, renewToken, chatAddon, affiliateCode }
        : { email, buyerName: shopName, shopName, packId, chatAddon, affiliateCode },
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
      <h2 className="text-xl font-extrabold">{renewing ? 'أعد الشراء على نفس الصفحة' : STORE_GROCERS_LIVE.orderCtaAr}</h2>
      <p className="mt-2 text-sm text-white/70">
        {renewing
          ? 'نفس روابط المتجر والكاشير تُمدَّد بعد السداد.'
          : 'بعد السداد يصلك رابط المتجر ورابط لوحة الكاشير وملصق QR.'}
      </p>
      {!renewing ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {STORE_GROCERS_LIVE_PACKS.map((item) => (
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
      ) : null}
      <label className="mt-4 block text-sm">
        البريد لاستلام روابط المتجر والكاشير وملصق QR
        <input className="grocers-field" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
      </label>
      {renewing ? null : (
        <label className="mt-3 block text-sm">
          اسم التموينات
          <input className="grocers-field" required value={shopName} onChange={(e) => setShopName(e.target.value)} />
        </label>
      )}
      <label className="mt-4 flex items-start gap-2 text-sm leading-7">
        <input type="checkbox" checked={chatAddon} onChange={(e) => setChatAddon(e.target.checked)} className="mt-1" />
        <span>
          {STORE_GROCERS_LIVE.chatAddonTitleAr} · {STORE_GROCERS_LIVE.chatAddonPriceAr}. {STORE_GROCERS_LIVE.chatAddonLeadAr}
        </span>
      </label>
      <label className="mt-4 flex items-start gap-2 text-sm leading-7">
        <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-1" />
        <span>{STORE_GROCERS_LIVE.orderConsentAr}</span>
      </label>
      {error ? <p className="mt-3 text-sm text-red-300">{error}</p> : null}
      <button
        type="submit"
        disabled={busy || !STORE_GROCERS_LIVE_CHECKOUT_ENABLED}
        className="mt-4 min-h-12 w-full rounded-full bg-[#8fbf7a] text-sm font-bold text-[#061018] disabled:opacity-50"
      >
        {busy
          ? 'جاري تجهيز بوابة الدفع…'
          : `${STORE_GROCERS_LIVE.orderSubmitAr} · ${pack.priceSar + (chatAddon ? grocersChatAddonSar(pack.id) : 0)} ر.س`}
      </button>
      <p className="mt-2 text-xs leading-6 text-white/50">لا يُخلط هذا الاشتراك بفاتورة الرخصة أو قاعات المناسبة.</p>
    </form>
  );
}
