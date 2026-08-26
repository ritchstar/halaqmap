/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import { useState } from 'react';
import { StoreEnterpriseDirectMail } from '@/components/store/StoreEnterpriseDirectMail';
import {
  STORE_CAFE_LIVE,
  STORE_CAFE_LIVE_CHECKOUT_ENABLED,
  STORE_CAFE_LIVE_PACKS,
  type StoreCafeLivePackId,
} from '@/config/storeCafeLive';
import { rememberStoreAffiliateRef } from '@/lib/storeAffiliateRef';
import { createCafeLivePending } from '@/lib/storeCafeLiveRemote';
import { cafeLivePayHref } from '@/lib/storeHostRedirect';
import { cn } from '@/lib/utils';

export function StoreCafeOrderForm({ renewToken = '' }: { renewToken?: string }) {
  const renewing = Boolean(renewToken);
  const [packId, setPackId] = useState<StoreCafeLivePackId>('m6');
  const [email, setEmail] = useState('');
  const [shopName, setShopName] = useState('مقهى السدرة');
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const pack = STORE_CAFE_LIVE_PACKS.find((item) => item.id === packId) || STORE_CAFE_LIVE_PACKS[0];

  async function submit() {
    if (!STORE_CAFE_LIVE_CHECKOUT_ENABLED || busy) return;
    if (!consent) {
      setError('الموافقة على شروط الخدمة مطلوبة قبل الدفع.');
      return;
    }
    setBusy(true);
    setError('');
    const affiliateCode = rememberStoreAffiliateRef();
    const result = await createCafeLivePending(
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
      window.sessionStorage.setItem(`cafe-live-desk:${result.token}`, result.deskToken);
    }
    const invoiceUrl = typeof result.invoiceUrl === 'string' ? result.invoiceUrl : '';
    window.location.assign(invoiceUrl.startsWith('https://') ? invoiceUrl : cafeLivePayHref(result.token));
  }

  return (
    <form
      id="cafe-order"
      className="rounded-2xl border border-[#c48a4a]/30 bg-[#1a1008]/90 p-5"
      onSubmit={(event) => {
        event.preventDefault();
        void submit();
      }}
    >
      <h2 className="text-xl font-extrabold">{renewing ? 'أعد الشراء على نفس الصفحة' : STORE_CAFE_LIVE.orderCtaAr}</h2>
      <p className="mt-2 text-sm text-white/70">
        {renewing
          ? 'نفس روابط الصفحة ولوحة الكاشير تُمدَّد بعد السداد.'
          : 'بعد السداد يصلك رابط جار الحي وروابط الشاشات ورابط لوحة الكاشير وملصق QR. صندوق المحادثة مدرج.'}
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {STORE_CAFE_LIVE_PACKS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setPackId(item.id)}
              className={cn(
                'rounded-2xl border px-4 py-3 text-right',
                packId === item.id ? 'border-[#c48a4a] bg-[#c48a4a]/15' : 'border-white/15',
              )}
            >
              <p className="font-extrabold">{item.titleAr}</p>
              <p className="mt-1 text-lg font-black text-[#c48a4a]">{item.priceLineAr}</p>
              <p className="mt-1 text-xs leading-6 text-white/65">{item.lineAr}</p>
            </button>
          ))}
        </div>
      <label className="mt-4 block text-sm">
        البريد لاستلام روابط الصفحة والشاشات ولوحة الكاشير
        <input className="cafe-field" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
      </label>
      {renewing ? null : (
        <label className="mt-3 block text-sm">
          {STORE_CAFE_LIVE.cafeNameLabelAr}
          <input className="cafe-field" required value={shopName} onChange={(e) => setShopName(e.target.value)} />
        </label>
      )}
      <label className="mt-4 flex items-start gap-2 text-sm leading-7">
        <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-1" />
        <span>{STORE_CAFE_LIVE.orderConsentAr}</span>
      </label>
      {error ? <p className="mt-3 text-sm text-red-300">{error}</p> : null}
      <button
        type="submit"
        disabled={busy || !STORE_CAFE_LIVE_CHECKOUT_ENABLED}
        className="mt-4 min-h-12 w-full rounded-full bg-[#c48a4a] text-sm font-bold text-[#061018] disabled:opacity-50"
      >
        {busy ? 'جاري تجهيز بوابة الدفع…' : `${STORE_CAFE_LIVE.orderSubmitAr} · ${pack.priceSar} ر.س`}
      </button>
      <StoreEnterpriseDirectMail
        className="mt-4"
        linkClassName="text-[#c48a4a]"
        productTitleAr={STORE_CAFE_LIVE.titleAr}
      />
    </form>
  );
}
