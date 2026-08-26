/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * فورم شراء لاونجا1 أو إعادة الشراء على نفس الصفحة.
 */
import { useState } from 'react';
import { StoreEnterpriseDirectMail } from '@/components/store/StoreEnterpriseDirectMail';
import {
  STORE_LOUNGE_LIVE,
  STORE_LOUNGE_LIVE_CHECKOUT_ENABLED,
  STORE_LOUNGE_LIVE_DEMO,
  STORE_LOUNGE_LIVE_EVENTS,
  STORE_LOUNGE_LIVE_PACKS,
  loungeLiveEventById,
  loungeLivePackById,
  type StoreLoungeLiveEventId,
  type StoreLoungeLivePackId,
} from '@/config/storeLoungeLive';
import { rememberStoreAffiliateRef } from '@/lib/storeAffiliateRef';
import { createLoungeLivePending } from '@/lib/storeLoungeLiveRemote';
import { loungeLivePayHref } from '@/lib/storeHostRedirect';
import { cn } from '@/lib/utils';

export function StoreLoungeOrderForm({ renewToken = '' }: { renewToken?: string }) {
  const renewing = Boolean(renewToken);
  const [packId, setPackId] = useState<StoreLoungeLivePackId>('m3');
  const [email, setEmail] = useState('');
  const [hostName, setHostName] = useState<string>(STORE_LOUNGE_LIVE_DEMO.hostName);
  const [loungeName, setLoungeName] = useState<string>(STORE_LOUNGE_LIVE_DEMO.loungeName);
  const [activeEventId, setActiveEventId] = useState<StoreLoungeLiveEventId>('welcome');
  const [welcomeAr, setWelcomeAr] = useState<string>(STORE_LOUNGE_LIVE_DEMO.welcomeAr);
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const pack = loungeLivePackById(packId);

  async function submit() {
    if (!STORE_LOUNGE_LIVE_CHECKOUT_ENABLED || busy) return;
    if (!consent) {
      setError('الموافقة على شروط الخدمة مطلوبة قبل الدفع.');
      return;
    }
    setBusy(true);
    setError('');
    const affiliateCode = rememberStoreAffiliateRef();
    const result = await createLoungeLivePending(
      renewing
        ? { email, renewToken, packId, affiliateCode }
        : {
            email,
            buyerName: hostName,
            hostName,
            loungeName,
            activeEventId,
            welcomeAr,
            packId,
            affiliateCode,
          },
    );
    if (!result.ok || typeof result.token !== 'string') {
      setBusy(false);
      setError(result.error || 'تعذر إنشاء طلب الدفع');
      return;
    }
    if (typeof result.hostToken === 'string') {
      window.sessionStorage.setItem(`lounge-live-host:${result.token}`, result.hostToken);
    }
    if (typeof result.guestToken === 'string') {
      window.sessionStorage.setItem(`lounge-live-guest:${result.token}`, result.guestToken);
    }
    const invoiceUrl = typeof result.invoiceUrl === 'string' ? result.invoiceUrl : '';
    window.location.assign(invoiceUrl.startsWith('https://') ? invoiceUrl : loungeLivePayHref(result.token));
  }

  const field = 'mt-1 h-12 w-full rounded-md border border-white/15 bg-[#061018] px-3 text-[#f4efe4]';

  return (
    <form
      id="lounge-order"
      className="rounded-2xl border border-[#d4a574]/30 bg-[#0b1a24]/90 p-5"
      onSubmit={(event) => {
        event.preventDefault();
        void submit();
      }}
    >
      <h2 className="text-xl font-extrabold">{renewing ? STORE_LOUNGE_LIVE.renewCtaAr : STORE_LOUNGE_LIVE.orderCtaAr}</h2>
      <p className="mt-2 text-sm text-white/70">
        {renewing
          ? 'نفس روابط الشاشة والضيف والمضيف تُمدَّد بعد السداد حسب المدة المختارة.'
          : 'بعد السداد تصلك ثلاثة روابط: الشاشة، الزبون، ولوحة المضيف.'}
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {STORE_LOUNGE_LIVE_PACKS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setPackId(item.id)}
            className={cn(
              'rounded-2xl border px-4 py-3 text-right',
              packId === item.id ? 'border-[#d4a574] bg-[#d4a574]/15' : 'border-white/15',
            )}
          >
            <p className="font-extrabold">{item.titleAr}</p>
            <p className="mt-1 text-lg font-black text-[#d4a574]">{item.priceLineAr}</p>
            <p className="mt-1 text-xs leading-6 text-white/65">{item.lineAr}</p>
          </button>
        ))}
      </div>
      <label className="mt-4 block text-sm">
        {STORE_LOUNGE_LIVE.orderEmailLabelAr}
        <input className={field} type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
      </label>
      {renewing ? null : (
        <>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <label className="block text-sm">
              {STORE_LOUNGE_LIVE.loungeNameLabelAr}
              <input className={field} required value={loungeName} onChange={(e) => setLoungeName(e.target.value)} />
            </label>
            <label className="block text-sm">
              {STORE_LOUNGE_LIVE.hostNameLabelAr}
              <input className={field} required value={hostName} onChange={(e) => setHostName(e.target.value)} />
            </label>
          </div>
          <p className="mt-4 text-sm font-bold text-[#d4a574]">{STORE_LOUNGE_LIVE.eventPackTitleAr}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {STORE_LOUNGE_LIVE_EVENTS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setActiveEventId(item.id);
                  setWelcomeAr(loungeLiveEventById(item.id).welcomeAr);
                }}
                className={cn(
                  'rounded-full px-3 py-1 text-xs',
                  activeEventId === item.id ? 'bg-[#d4a574] font-bold text-[#12090c]' : 'border border-white/20',
                )}
              >
                {item.titleAr}
              </button>
            ))}
          </div>
          <label className="mt-3 block text-sm">
            {STORE_LOUNGE_LIVE.hostWelcomeLabelAr}
            <textarea
              className="mt-1 h-24 w-full rounded-md border border-white/15 bg-[#061018] px-3 py-2 text-[#f4efe4]"
              value={welcomeAr}
              onChange={(e) => setWelcomeAr(e.target.value)}
            />
          </label>
        </>
      )}
      <label className="mt-4 flex items-start gap-2 text-sm leading-7">
        <input type="checkbox" className="mt-1" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
        <span>{STORE_LOUNGE_LIVE.orderConsentAr}</span>
      </label>
      {error ? <p className="mt-3 text-sm text-red-300">{error}</p> : null}
      <button
        type="submit"
        disabled={busy || !STORE_LOUNGE_LIVE_CHECKOUT_ENABLED}
        className="mt-5 w-full rounded-full bg-[#d4a574] py-3 text-sm font-bold text-[#12090c] disabled:opacity-50"
      >
        {busy ? 'جاري تجهيز بوابة الدفع…' : `${STORE_LOUNGE_LIVE.orderSubmitAr} · ${pack.priceSar} ر.س`}
      </button>
      <StoreEnterpriseDirectMail
        className="mt-4"
        linkClassName="text-[#d4a574]"
        productTitleAr={STORE_LOUNGE_LIVE.titleAr}
      />
    </form>
  );
}
