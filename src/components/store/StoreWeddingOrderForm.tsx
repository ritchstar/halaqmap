/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * فورم طلب دعوة الزواج ثم التحويل إلى ميسر على www.
 */
import { useState } from 'react';
import {
  STORE_WEDDING_LIVE,
  STORE_WEDDING_LIVE_CHECKOUT_ENABLED,
  STORE_WEDDING_LIVE_DEMO,
  STORE_WEDDING_LIVE_PRICE_SAR,
} from '@/config/storeWeddingLive';
import { createWeddingLivePending } from '@/lib/storeWeddingLiveRemote';
import { weddingLivePayHref } from '@/lib/storeHostRedirect';

export function StoreWeddingOrderForm() {
  const [email, setEmail] = useState('');
  const [hostName, setHostName] = useState(STORE_WEDDING_LIVE_DEMO.hostName);
  const [groomName, setGroomName] = useState(STORE_WEDDING_LIVE_DEMO.groomName);
  const [brideName, setBrideName] = useState(STORE_WEDDING_LIVE_DEMO.brideName);
  const [eventDate, setEventDate] = useState(STORE_WEDDING_LIVE_DEMO.eventDate);
  const [eventTime, setEventTime] = useState(STORE_WEDDING_LIVE_DEMO.eventTime);
  const [venueName, setVenueName] = useState(STORE_WEDDING_LIVE_DEMO.venueName);
  const [venueMapsUrl, setVenueMapsUrl] = useState(STORE_WEDDING_LIVE_DEMO.venueMapsUrl);
  const [welcomeAr, setWelcomeAr] = useState(STORE_WEDDING_LIVE_DEMO.welcomeAr);
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function submit() {
    if (!STORE_WEDDING_LIVE_CHECKOUT_ENABLED || busy) return;
    if (!consent) {
      setError('الموافقة على شروط الخدمة مطلوبة قبل الدفع.');
      return;
    }
    setBusy(true);
    setError('');
    const result = await createWeddingLivePending({
      email,
      buyerName: hostName,
      hostName,
      groomName,
      brideName,
      eventDate,
      eventTime,
      venueName,
      venueMapsUrl,
      welcomeAr,
    });
    if (!result.ok || typeof result.token !== 'string') {
      setBusy(false);
      setError(result.error || 'تعذر إنشاء طلب الدفع');
      return;
    }
    if (typeof result.hostToken === 'string') {
      window.sessionStorage.setItem(`wedding-live-host:${result.token}`, result.hostToken);
    }
    if (typeof result.guestToken === 'string') {
      window.sessionStorage.setItem(`wedding-live-guest:${result.token}`, result.guestToken);
    }
    const invoiceUrl = typeof result.invoiceUrl === 'string' ? result.invoiceUrl : '';
    window.location.assign(invoiceUrl.startsWith('https://') ? invoiceUrl : weddingLivePayHref(result.token));
  }

  const field = 'mt-1 h-12 w-full rounded-md border border-white/15 bg-[#061018] px-3 text-[#f4efe4]';

  return (
    <form
      id="wedding-order"
      className="rounded-2xl border border-[#e8c547]/30 bg-[#0b1a24]/90 p-5"
      onSubmit={(event) => {
        event.preventDefault();
        void submit();
      }}
    >
      <h2 className="text-xl font-extrabold">{STORE_WEDDING_LIVE.orderCtaAr}</h2>
      <p className="mt-2 text-sm text-white/70">بعد السداد تصلك ثلاثة روابط سرية على البريد.</p>
      <label className="mt-4 block text-sm">
        {STORE_WEDDING_LIVE.orderEmailLabelAr}
        <input className={field} type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
      </label>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <label className="block text-sm">
          {STORE_WEDDING_LIVE.hostNameLabelAr}
          <input className={field} required value={hostName} onChange={(e) => setHostName(e.target.value)} />
        </label>
        <label className="block text-sm">
          {STORE_WEDDING_LIVE.groomNameLabelAr}
          <input className={field} required value={groomName} onChange={(e) => setGroomName(e.target.value)} />
        </label>
        <label className="block text-sm sm:col-span-2">
          {STORE_WEDDING_LIVE.brideNameLabelAr}
          <input className={field} required value={brideName} onChange={(e) => setBrideName(e.target.value)} />
        </label>
        <label className="block text-sm">
          {STORE_WEDDING_LIVE.eventDateLabelAr}
          <input className={field} value={eventDate} onChange={(e) => setEventDate(e.target.value)} />
        </label>
        <label className="block text-sm">
          {STORE_WEDDING_LIVE.eventTimeLabelAr}
          <input className={field} value={eventTime} onChange={(e) => setEventTime(e.target.value)} />
        </label>
        <label className="block text-sm">
          {STORE_WEDDING_LIVE.venueNameLabelAr}
          <input className={field} value={venueName} onChange={(e) => setVenueName(e.target.value)} />
        </label>
        <label className="block text-sm">
          {STORE_WEDDING_LIVE.venueMapsLabelAr}
          <input className={field} dir="ltr" value={venueMapsUrl} onChange={(e) => setVenueMapsUrl(e.target.value)} />
        </label>
      </div>
      <label className="mt-3 block text-sm">
        {STORE_WEDDING_LIVE.hostWelcomeLabelAr}
        <textarea
          className="mt-1 h-24 w-full rounded-md border border-white/15 bg-[#061018] px-3 py-2 text-[#f4efe4]"
          value={welcomeAr}
          onChange={(e) => setWelcomeAr(e.target.value)}
        />
      </label>
      <label className="mt-4 flex items-start gap-2 text-sm leading-7">
        <input type="checkbox" className="mt-1" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
        <span>{STORE_WEDDING_LIVE.orderConsentAr}</span>
      </label>
      {error ? <p className="mt-3 text-sm text-red-300">{error}</p> : null}
      <button
        type="submit"
        disabled={busy || !STORE_WEDDING_LIVE_CHECKOUT_ENABLED}
        className="mt-5 w-full rounded-full bg-[#e8c547] py-3 text-sm font-bold text-[#061018] disabled:opacity-50"
      >
        {busy ? 'جاري تجهيز ميسر…' : `${STORE_WEDDING_LIVE.orderSubmitAr} · ${STORE_WEDDING_LIVE_PRICE_SAR} ر.س`}
      </button>
    </form>
  );
}
