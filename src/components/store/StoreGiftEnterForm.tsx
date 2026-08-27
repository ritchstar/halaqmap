/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  STORE_GIFT_COPY,
  STORE_GIFT_EVENT_VOICE_OPTIONS,
  STORE_GIFT_PRODUCT_OPTIONS,
  STORE_GIFT_SOURCE_OPTIONS,
  STORE_GIFT_TERMS_COPY,
  type StoreGiftProductChoice,
  type StoreGiftSource,
  type StoreGiftVoice,
} from '@/config/storeGiftCampaign';
import { enterStoreGift } from '@/lib/storeGiftCampaignRemote';
import { ROUTE_PATHS } from '@/lib/routePaths';
import { cn } from '@/lib/utils';

const fieldClass =
  'mt-1 w-full rounded-xl border border-white/15 bg-[#061018] px-3 py-2.5 text-sm text-[#f4efe4] outline-none focus:border-[#e8c547]/50';

export function StoreGiftEnterForm({ accepting }: { accepting: boolean }) {
  const copy = STORE_GIFT_COPY;
  const [productChoice, setProductChoice] = useState<StoreGiftProductChoice | ''>('');
  const [eventVoice, setEventVoice] = useState<StoreGiftVoice | ''>('');
  const [givenName, setGivenName] = useState('');
  const [city, setCity] = useState('');
  const [occasionDate, setOccasionDate] = useState('');
  const [source, setSource] = useState<StoreGiftSource | ''>('');
  const [email, setEmail] = useState('');
  const [opinionBefore, setOpinionBefore] = useState('');
  const [opinionAfter, setOpinionAfter] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!accepting || busy) return;
    if (!productChoice) {
      toast.error(copy.needProductAr);
      return;
    }
    if (productChoice === 'event' && !eventVoice) {
      toast.error(copy.needEventVoiceAr);
      return;
    }
    if (givenName.trim().split(/\s+/).length < 2) {
      toast.error(copy.needNameAr);
      return;
    }
    if (city.trim().length < 2) {
      toast.error(copy.needCityAr);
      return;
    }
    if (!occasionDate) {
      toast.error(copy.needDateAr);
      return;
    }
    if (!source) {
      toast.error(copy.needSourceAr);
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      toast.error(copy.needEmailAr);
      return;
    }
    if (!acceptedTerms) {
      toast.error(copy.needConsentAr);
      return;
    }
    setBusy(true);
    const result = await enterStoreGift({
      givenName,
      email,
      productChoice,
      eventVoice: productChoice === 'event' ? eventVoice : undefined,
      city,
      occasionDate,
      source,
      opinionBefore,
      opinionAfter,
      acceptedTerms: true,
    });
    setBusy(false);
    if (!result.ok) {
      toast.error(result.error || 'تعذر حفظ المشاركة.');
      return;
    }
    toast.success(copy.confirmSentAr);
    setAcceptedTerms(false);
  }

  if (!accepting) return null;

  return (
    <form
      id="store-gift-enter"
      onSubmit={onSubmit}
      className="rounded-2xl border border-[#e8c547]/30 bg-[#0b1a24]/80 p-5 md:p-6"
    >
      <h2 className="text-2xl font-extrabold text-[#f4efe4]">{copy.formTitleAr}</h2>
      <label className="mt-5 block text-sm font-bold text-white/80">
        {copy.productLabelAr}
        <select
          className={fieldClass}
          value={productChoice}
          onChange={(e) => setProductChoice(e.target.value as StoreGiftProductChoice | '')}
        >
          <option value="">—</option>
          {STORE_GIFT_PRODUCT_OPTIONS.map((item) => (
            <option key={item.id} value={item.id}>
              {item.labelAr}
            </option>
          ))}
        </select>
      </label>
      {productChoice === 'event' ? (
        <label className="mt-4 block text-sm font-bold text-white/80">
          {copy.eventVoiceLabelAr}
          <select
            className={fieldClass}
            value={eventVoice}
            onChange={(e) => setEventVoice(e.target.value as StoreGiftVoice | '')}
          >
            <option value="">—</option>
            {STORE_GIFT_EVENT_VOICE_OPTIONS.map((item) => (
              <option key={item.id} value={item.id}>
                {item.labelAr}
              </option>
            ))}
          </select>
        </label>
      ) : null}
      <label className="mt-4 block text-sm font-bold text-white/80">
        {copy.nameLabelAr}
        <input className={fieldClass} value={givenName} onChange={(e) => setGivenName(e.target.value)} autoComplete="name" />
      </label>
      <label className="mt-4 block text-sm font-bold text-white/80">
        {copy.cityLabelAr}
        <input className={fieldClass} value={city} onChange={(e) => setCity(e.target.value)} />
      </label>
      <label className="mt-4 block text-sm font-bold text-white/80">
        {copy.dateLabelAr}
        <input className={fieldClass} type="date" value={occasionDate} onChange={(e) => setOccasionDate(e.target.value)} />
      </label>
      <label className="mt-4 block text-sm font-bold text-white/80">
        {copy.sourceLabelAr}
        <select className={fieldClass} value={source} onChange={(e) => setSource(e.target.value as StoreGiftSource | '')}>
          <option value="">—</option>
          {STORE_GIFT_SOURCE_OPTIONS.map((item) => (
            <option key={item.id} value={item.id}>
              {item.labelAr}
            </option>
          ))}
        </select>
      </label>
      <label className="mt-4 block text-sm font-bold text-white/80">
        {copy.emailLabelAr}
        <input
          className={fieldClass}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />
        <span className="mt-1 block text-xs font-normal leading-6 text-white/55">{copy.emailHintAr}</span>
      </label>
      <label className="mt-4 block text-sm font-bold text-white/80">
        {copy.opinionBeforeLabelAr}
        <span className="mr-2 text-xs font-normal text-white/45">{copy.optionalAr}</span>
        <textarea className={fieldClass} rows={3} value={opinionBefore} onChange={(e) => setOpinionBefore(e.target.value)} />
      </label>
      <label className="mt-4 block text-sm font-bold text-white/80">
        {copy.opinionAfterLabelAr}
        <span className="mr-2 text-xs font-normal text-white/45">{copy.optionalAr}</span>
        <textarea className={fieldClass} rows={3} value={opinionAfter} onChange={(e) => setOpinionAfter(e.target.value)} />
      </label>

      <Collapsible open={termsOpen} onOpenChange={setTermsOpen} className="mt-5">
        <CollapsibleTrigger
          type="button"
          className="flex w-full items-center justify-between gap-3 rounded-xl border border-[#e8c547]/25 bg-white/5 px-4 py-3 text-right text-sm font-bold text-[#e8c547]"
        >
          <span>{copy.termsFoldTriggerAr}</span>
          <ChevronDown className={cn('h-4 w-4 shrink-0 transition-transform', termsOpen && 'rotate-180')} />
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-3 space-y-3 rounded-xl border border-white/10 bg-[#061018]/70 p-4">
          {STORE_GIFT_TERMS_COPY.sections.map((section) => (
            <div key={section.titleAr}>
              <p className="text-sm font-extrabold text-[#f4efe4]">{section.titleAr}</p>
              <p className="mt-1 text-sm leading-7 text-white/70">{section.bodyAr}</p>
            </div>
          ))}
          <Link to={ROUTE_PATHS.STORE_GIFT_TERMS} className="inline-flex text-sm font-bold text-[#e8c547]">
            {copy.termsLinkAr}
          </Link>
        </CollapsibleContent>
      </Collapsible>

      <label className="mt-4 flex items-start gap-3 text-sm leading-7 text-white/80">
        <input
          type="checkbox"
          className="mt-1 h-4 w-4 accent-[#e8c547]"
          checked={acceptedTerms}
          onChange={(e) => setAcceptedTerms(e.target.checked)}
        />
        <span>
          {copy.consentAr}{' '}
          <Link to={ROUTE_PATHS.STORE_GIFT_TERMS} className="font-bold text-[#e8c547]">
            {copy.termsLinkAr}
          </Link>
        </span>
      </label>

      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />

      <button
        type="submit"
        disabled={busy}
        className="mt-5 w-full rounded-full bg-[#e8c547] px-5 py-3 text-sm font-extrabold text-[#061018] disabled:opacity-60"
      >
        {copy.submitAr}
      </button>
    </form>
  );
}
