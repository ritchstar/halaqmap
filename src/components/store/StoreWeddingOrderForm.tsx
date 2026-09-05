/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * فورم طلب دعوة الزواج ثم التحويل إلى ميسر على www.
 */
import { useMemo, useState } from 'react';
import { StoreEnterpriseDirectMail } from '@/components/store/StoreEnterpriseDirectMail';
import {
  STORE_WEDDING_LIVE_CHECKOUT_ENABLED,
  STORE_WEDDING_LIVE_DEMO,
  STORE_WEDDING_LIVE_DEMO_WOMEN,
  STORE_WEDDING_LIVE_PRICE_SAR,
  STORE_WEDDING_VENUE_KINDS,
  weddingLiveCopy,
  weddingLiveFillClass,
  weddingLiveHostRoles,
  weddingLiveTextClass,
  type StoreWeddingLiveVoice,
} from '@/config/storeWeddingLive';
import { rememberStoreAffiliateRef } from '@/lib/storeAffiliateRef';
import { ProductEvents } from '@/lib/analytics/productAnalytics';
import { createWeddingLivePending } from '@/lib/storeWeddingLiveRemote';
import { weddingLivePayHref } from '@/lib/storeHostRedirect';
import {
  normalizeOffspringKind,
  normalizeVenueKind,
  normalizeWeddingHostRole,
  syncWeddingEventDates,
  weddingEventDatePreview,
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
  const [hostName, setHostName] = useState<string>(demo.hostName);
  const [hostRole, setHostRole] = useState<WeddingLiveHostRole>(demo.hostRole);
  const [hostRoleCustomAr, setHostRoleCustomAr] = useState('');
  const [offspringKind, setOffspringKind] = useState<WeddingOffspringKind>(demo.offspringKind);
  const [groomName, setGroomName] = useState<string>(demo.groomName);
  const [brideName, setBrideName] = useState<string>(demo.brideName);
  const [eventDateIso, setEventDateIso] = useState<string>(demo.eventDateIso || '2026-09-24');
  const [eventTime, setEventTime] = useState<string>(demo.eventTime);
  const [venueKind, setVenueKind] = useState<WeddingVenueKind>(demo.venueKind);
  const [venueName, setVenueName] = useState<string>(demo.venueName);
  const [venueMapsUrl, setVenueMapsUrl] = useState<string>(demo.venueMapsUrl);
  const [welcomeAr, setWelcomeAr] = useState<string>(demo.welcomeAr);
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const datePreview = useMemo(() => weddingEventDatePreview(eventDateIso), [eventDateIso]);
  const syncedDates = useMemo(() => syncWeddingEventDates(eventDateIso), [eventDateIso]);
  const mapsHref = useMemo(() => {
    const t = venueMapsUrl.trim();
    if (!t) return null;
    try {
      const u = new URL(t.startsWith('http') ? t : `https://${t}`);
      return u.protocol === 'https:' ? u.toString() : null;
    } catch {
      return null;
    }
  }, [venueMapsUrl]);

  async function submit() {
    if (!STORE_WEDDING_LIVE_CHECKOUT_ENABLED || busy) return;
    if (!consent) {
      setError('الموافقة على شروط الخدمة مطلوبة قبل الدفع.');
      return;
    }
    if (groomName.trim().length < 2) {
      setError('اسم العريس مطلوب.');
      return;
    }
    ProductEvents.storeWeddingPayClick({ voice });
    setBusy(true);
    setError('');
    const result = await createWeddingLivePending({
      email,
      buyerName: hostName,
      affiliateCode: rememberStoreAffiliateRef(),
      voice,
      hostName,
      hostRole,
      hostRoleCustomAr,
      offspringKind,
      groomName,
      brideName: brideName.trim() || '—',
      eventDate: syncedDates.eventDate,
      eventDateEn: syncedDates.eventDateEn,
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

  const field = 'mt-1 h-12 w-full rounded-md border border-white/15 bg-[#061018] px-3 text-base text-[#f4efe4]';
  const fill = weddingLiveFillClass(voice);
  const text = weddingLiveTextClass(voice);
  const border = voice === 'women' ? 'border-[#e4b7c5]/30' : 'border-[#e8c547]/30';

  return (
    <form
      id="wedding-order"
      className={cn('scroll-mt-24 rounded-2xl bg-[#0b1a24]/90 p-5', 'border', border)}
      onSubmit={(event) => {
        event.preventDefault();
        void submit();
      }}
    >
      <h2 className="text-xl font-extrabold">
        <bdi>{copy.activateCtaAr}</bdi>
      </h2>
      <p className="mt-2 text-sm leading-7 text-white/70">{copy.orderLinksIntroAr}</p>
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
        {hostRole === 'custom' ? (
          <label className="block text-sm sm:col-span-2">
            {copy.hostRoleCustomLabelAr}
            <input className={field} required value={hostRoleCustomAr} onChange={(e) => setHostRoleCustomAr(e.target.value)} />
          </label>
        ) : null}
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
        <label className="block text-sm">
          {copy.groomNameLabelAr}
          <input className={field} required value={groomName} onChange={(e) => setGroomName(e.target.value)} />
        </label>
        <label className="block text-sm">
          {copy.brideNameLabelAr}
          <input className={field} value={brideName} onChange={(e) => setBrideName(e.target.value)} />
        </label>
        <label className="block text-sm sm:col-span-2">
          {copy.eventDateLabelAr}
          <input
            className={field}
            type="date"
            dir="ltr"
            required
            value={eventDateIso}
            onChange={(e) => setEventDateIso(e.target.value)}
          />
          {datePreview ? (
            <span className="mt-1 block text-sm text-white/55">
              <bdi>{datePreview}</bdi>
            </span>
          ) : (
            <span className="mt-1 block text-sm text-white/55">{copy.eventDatePreviewHintAr}</span>
          )}
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
        <label className="block text-sm sm:col-span-2">
          {copy.venueNameLabelAr}
          <input className={field} value={venueName} onChange={(e) => setVenueName(e.target.value)} />
        </label>
        <label className="block text-sm sm:col-span-2">
          {copy.venueMapsLabelAr}
          <input className={field} dir="ltr" value={venueMapsUrl} onChange={(e) => setVenueMapsUrl(e.target.value)} />
          <span className="mt-1 block text-sm text-white/55">{copy.venueMapsHintAr}</span>
          {mapsHref ? (
            <a
              href={mapsHref}
              target="_blank"
              rel="noopener noreferrer"
              className={cn('mt-2 inline-flex text-sm font-bold', text)}
            >
              {copy.venueMapsVerifyAr}
            </a>
          ) : null}
        </label>
      </div>
      <label className="mt-3 block text-sm">
        {copy.hostWelcomeLabelAr}
        <textarea
          className="mt-1 h-24 w-full rounded-md border border-white/15 bg-[#061018] px-3 py-2 text-base text-[#f4efe4]"
          value={welcomeAr}
          onChange={(e) => setWelcomeAr(e.target.value)}
          maxLength={200}
          placeholder="تفضلوا طعام العشاء، وحياكم الله."
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
        {busy ? 'جاري تجهيز بوابة الدفع…' : `${copy.orderSubmitAr} · ${STORE_WEDDING_LIVE_PRICE_SAR} ر.س`}
      </button>
      <StoreEnterpriseDirectMail
        className="mt-4"
        linkClassName={text}
        productTitleAr={copy.titleAr}
      />
    </form>
  );
}
