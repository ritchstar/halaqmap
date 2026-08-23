/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * فورم طلب الدعوة الحرة ثم التحويل إلى ميسر على www.
 */
import { useState } from 'react';
import {
  STORE_EVENT_LIVE_CHECKOUT_ENABLED,
  STORE_EVENT_LIVE_DEMO,
  STORE_EVENT_LIVE_DEMO_WOMEN,
  STORE_EVENT_LIVE_OCCASIONS,
  STORE_EVENT_LIVE_PRICE_SAR,
  STORE_EVENT_VENUE_KINDS,
  eventLiveCopy,
  eventLiveFillClass,
  eventLiveHostRoles,
  type StoreEventLiveVoice,
} from '@/config/storeEventLive';
import { normalizeEventHostRole, normalizeEventVenueKind, type EventLiveHostRole } from '@/lib/storeEventLiveLab';
import type { StoreEventVenueKind } from '@/config/storeEventLive';
import { rememberStoreAffiliateRef } from '@/lib/storeAffiliateRef';
import { createEventLivePending } from '@/lib/storeEventLiveRemote';
import { eventLivePayHref } from '@/lib/storeHostRedirect';
import { cn } from '@/lib/utils';

export function StoreEventOrderForm({ voice = 'men' }: { voice?: StoreEventLiveVoice }) {
  const demo = voice === 'women' ? STORE_EVENT_LIVE_DEMO_WOMEN : STORE_EVENT_LIVE_DEMO;
  const copy = eventLiveCopy(voice);
  const roles = eventLiveHostRoles(voice);
  const occasions = voice === 'women' ? STORE_EVENT_LIVE_OCCASIONS.women : STORE_EVENT_LIVE_OCCASIONS.men;
  const [email, setEmail] = useState('');
  const [hostRole, setHostRole] = useState<EventLiveHostRole>(demo.hostRole);
  const [hostName, setHostName] = useState(demo.hostName);
  const [occasionTitle, setOccasionTitle] = useState(demo.occasionTitle);
  const [eventDate, setEventDate] = useState(demo.eventDate);
  const [eventTime, setEventTime] = useState(demo.eventTime);
  const [venueKind, setVenueKind] = useState<StoreEventVenueKind>(demo.venueKind);
  const [venueName, setVenueName] = useState<string>(demo.venueName);
  const [venueMapsUrl, setVenueMapsUrl] = useState(demo.venueMapsUrl);
  const [welcomeAr, setWelcomeAr] = useState(demo.welcomeAr);
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function submit() {
    if (!STORE_EVENT_LIVE_CHECKOUT_ENABLED || busy) return;
    if (!consent) {
      setError('الموافقة على شروط الخدمة مطلوبة قبل الدفع.');
      return;
    }
    setBusy(true);
    setError('');
    const result = await createEventLivePending({
      email,
      buyerName: hostName,
      affiliateCode: rememberStoreAffiliateRef(),
      voice,
      hostName,
      hostRole,
      occasionTitle,
      eventDate,
      eventTime,
      venueKind,
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
      window.sessionStorage.setItem(`event-live-host:${result.token}`, result.hostToken);
    }
    if (typeof result.guestToken === 'string') {
      window.sessionStorage.setItem(`event-live-guest:${result.token}`, result.guestToken);
    }
    const invoiceUrl = typeof result.invoiceUrl === 'string' ? result.invoiceUrl : '';
    window.location.assign(invoiceUrl.startsWith('https://') ? invoiceUrl : eventLivePayHref(result.token));
  }

  const field = 'mt-1 h-12 w-full rounded-md border border-white/15 bg-[#061018] px-3 text-[#f4efe4]';
  const fill = eventLiveFillClass(voice);
  const border = voice === 'women' ? 'border-[#e4b7c5]/30' : 'border-[#e8c547]/30';

  return (
    <form
      id="event-order"
      className={cn('rounded-2xl border bg-[#0b1a24]/90 p-5', border)}
      onSubmit={(event) => {
        event.preventDefault();
        void submit();
      }}
    >
      <h2 className="text-xl font-extrabold">{copy.orderCtaAr}</h2>
      <p className="mt-2 text-sm text-white/70">بعد السداد تصلك ثلاثة روابط سرية على البريد.</p>
      <label className="mt-4 block text-sm">
        {copy.orderEmailLabelAr}
        <input className={field} type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
      </label>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <label className="block text-sm">
          {copy.hostRoleLabelAr}
          <select
            className={field}
            value={hostRole}
            onChange={(e) => setHostRole(normalizeEventHostRole(e.target.value, voice))}
          >
            {roles.map((role) => (
              <option key={`${role.voice}-${role.id}`} value={role.id}>
                {role.labelAr}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          {copy.hostNameLabelAr}
          <input className={field} required value={hostName} onChange={(e) => setHostName(e.target.value)} />
        </label>
        <label className="block text-sm sm:col-span-2">
          {copy.occasionLabelAr}
          <input className={field} required value={occasionTitle} onChange={(e) => setOccasionTitle(e.target.value)} />
          <div className="mt-2 flex flex-wrap gap-2">
            {occasions.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setOccasionTitle(item)}
                className={cn(
                  'rounded-full px-3 py-1 text-xs',
                  occasionTitle === item ? cn('font-bold', fill) : 'border border-white/20',
                )}
              >
                {item}
              </button>
            ))}
          </div>
        </label>
        <label className="block text-sm">
          {copy.eventDateLabelAr}
          <input className={field} value={eventDate} onChange={(e) => setEventDate(e.target.value)} />
        </label>
        <label className="block text-sm">
          {copy.eventTimeLabelAr}
          <input className={field} value={eventTime} onChange={(e) => setEventTime(e.target.value)} />
        </label>
        <label className="block text-sm">
          {copy.venueKindLabelAr}
          <select
            className={field}
            value={venueKind}
            onChange={(e) => setVenueKind(normalizeEventVenueKind(e.target.value))}
          >
            {STORE_EVENT_VENUE_KINDS.map((item) => (
              <option key={item.id} value={item.id}>
                {item.labelAr}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          {copy.venueNameLabelAr}
          <input className={field} value={venueName} onChange={(e) => setVenueName(e.target.value)} />
        </label>
        <label className="block text-sm sm:col-span-2">
          {copy.venueMapsLabelAr}
          <input className={field} dir="ltr" value={venueMapsUrl} onChange={(e) => setVenueMapsUrl(e.target.value)} />
          <span className="mt-1 block text-sm text-white/55">{copy.venueMapsHintAr}</span>
        </label>
      </div>
      <label className="mt-3 block text-sm">
        {copy.hostWelcomeLabelAr}
        <textarea
          className="mt-1 h-24 w-full rounded-md border border-white/15 bg-[#061018] px-3 py-2 text-[#f4efe4]"
          value={welcomeAr}
          onChange={(e) => setWelcomeAr(e.target.value)}
        />
      </label>
      <label className="mt-4 flex items-start gap-2 text-sm leading-7">
        <input type="checkbox" className="mt-1" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
        <span>{copy.orderConsentAr}</span>
      </label>
      {error ? <p className="mt-3 text-sm text-red-300">{error}</p> : null}
      <button
        type="submit"
        disabled={busy || !STORE_EVENT_LIVE_CHECKOUT_ENABLED}
        className={cn('mt-5 w-full rounded-full py-3 text-sm font-bold disabled:opacity-50', fill)}
      >
        {busy ? 'جاري تجهيز بوابة الدفع…' : `${copy.orderSubmitAr} · ${STORE_EVENT_LIVE_PRICE_SAR} ر.س`}
      </button>
    </form>
  );
}
