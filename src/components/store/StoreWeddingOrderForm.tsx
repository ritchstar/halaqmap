/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * فورم طلب دعوة الزواج ثم التحويل إلى ميسر على www.
 */
import { useState } from 'react';
import {
  STORE_WEDDING_LIVE_CHECKOUT_ENABLED,
  STORE_WEDDING_LIVE_DEMO,
  STORE_WEDDING_LIVE_DEMO_WOMEN,
  STORE_WEDDING_LIVE_PRICE_SAR,
  STORE_WEDDING_VENUE_KINDS,
  weddingLiveCopy,
  weddingLiveFillClass,
  weddingLiveHostRoles,
  type StoreWeddingLiveVoice,
} from '@/config/storeWeddingLive';
import { createWeddingLivePending } from '@/lib/storeWeddingLiveRemote';
import { weddingLivePayHref } from '@/lib/storeHostRedirect';
import {
  normalizeOffspringKind,
  normalizeVenueKind,
  normalizeWeddingHostRole,
  type WeddingLiveHostRole,
  type WeddingOffspringKind,
  type WeddingVenueKind,
} from '@/lib/storeWeddingLiveLab';
import { cn } from '@/lib/utils';

export function StoreWeddingOrderForm({ voice = 'men' }: { voice?: StoreWeddingLiveVoice }) {
  const demo = voice === 'women' ? STORE_WEDDING_LIVE_DEMO_WOMEN : STORE_WEDDING_LIVE_DEMO;
  const copy = weddingLiveCopy(voice);
  const roles = weddingLiveHostRoles(voice);
  const [email, setEmail] = useState('');
  const [hostName, setHostName] = useState(demo.hostName);
  const [hostRole, setHostRole] = useState<WeddingLiveHostRole>(demo.hostRole);
  const [offspringKind, setOffspringKind] = useState<WeddingOffspringKind>(demo.offspringKind);
  const [groomName, setGroomName] = useState<string>(demo.groomName);
  const [brideName, setBrideName] = useState<string>(demo.brideName);
  const [eventDate, setEventDate] = useState<string>(demo.eventDate);
  const [eventDateEn, setEventDateEn] = useState<string>(demo.eventDateEn);
  const [eventTime, setEventTime] = useState<string>(demo.eventTime);
  const [venueKind, setVenueKind] = useState<WeddingVenueKind>(demo.venueKind);
  const [venueName, setVenueName] = useState<string>(demo.venueName);
  const [venueMapsUrl, setVenueMapsUrl] = useState<string>(demo.venueMapsUrl);
  const [welcomeAr, setWelcomeAr] = useState<string>(demo.welcomeAr);
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
      voice,
      hostName,
      hostRole,
      offspringKind,
      groomName,
      brideName,
      eventDate,
      eventDateEn,
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
      window.sessionStorage.setItem(`wedding-live-host:${result.token}`, result.hostToken);
    }
    if (typeof result.guestToken === 'string') {
      window.sessionStorage.setItem(`wedding-live-guest:${result.token}`, result.guestToken);
    }
    const invoiceUrl = typeof result.invoiceUrl === 'string' ? result.invoiceUrl : '';
    window.location.assign(invoiceUrl.startsWith('https://') ? invoiceUrl : weddingLivePayHref(result.token));
  }

  const field = 'mt-1 h-12 w-full rounded-md border border-white/15 bg-[#061018] px-3 text-[#f4efe4]';
  const fill = weddingLiveFillClass(voice);
  const border = voice === 'women' ? 'border-[#e4b7c5]/30' : 'border-[#e8c547]/30';

  return (
    <form
      id="wedding-order"
      className={cn('rounded-2xl bg-[#0b1a24]/90 p-5', 'border', border)}
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
            onChange={(e) => setHostRole(normalizeWeddingHostRole(e.target.value, voice))}
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
          {copy.offspringKindLabelAr}
          <select
            className={field}
            value={offspringKind}
            onChange={(e) => setOffspringKind(normalizeOffspringKind(e.target.value))}
          >
            <option value="son">{copy.offspringSonAr}</option>
            <option value="daughter">{copy.offspringDaughterAr}</option>
          </select>
        </label>
        {offspringKind === 'daughter' ? (
          <>
            <label className="block text-sm">
              {copy.offspringNameDaughterAr}
              <input className={field} required value={brideName} onChange={(e) => setBrideName(e.target.value)} />
            </label>
            <label className="block text-sm">
              {copy.spouseNameDaughterAr}
              <input className={field} required value={groomName} onChange={(e) => setGroomName(e.target.value)} />
            </label>
          </>
        ) : (
          <>
            <label className="block text-sm">
              {copy.offspringNameSonAr}
              <input className={field} required value={groomName} onChange={(e) => setGroomName(e.target.value)} />
            </label>
            <label className="block text-sm">
              {copy.spouseNameSonAr}
              <input className={field} required value={brideName} onChange={(e) => setBrideName(e.target.value)} />
            </label>
          </>
        )}
        <label className="block text-sm">
          {copy.eventDateLabelAr}
          <input className={field} value={eventDate} onChange={(e) => setEventDate(e.target.value)} />
        </label>
        <label className="block text-sm">
          {copy.eventDateEnLabelAr}
          <input className={field} dir="ltr" value={eventDateEn} onChange={(e) => setEventDateEn(e.target.value)} />
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
            onChange={(e) => setVenueKind(normalizeVenueKind(e.target.value))}
          >
            {STORE_WEDDING_VENUE_KINDS.map((item) => (
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
        disabled={busy || !STORE_WEDDING_LIVE_CHECKOUT_ENABLED}
        className={cn('mt-5 w-full rounded-full py-3 text-sm font-bold disabled:opacity-50', fill)}
      >
        {busy ? 'جاري تجهيز ميسر…' : `${copy.orderSubmitAr} · ${STORE_WEDDING_LIVE_PRICE_SAR} ر.س`}
      </button>
    </form>
  );
}
