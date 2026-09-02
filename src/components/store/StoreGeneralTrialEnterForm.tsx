/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  STORE_GENERAL_TRIAL_COPY,
  STORE_GENERAL_TRIAL_KEYS,
  STORE_GENERAL_TRIAL_TERMS_COPY,
  STORE_PRODUCT_TRIAL_PRODUCTS,
  type StoreGeneralTrialKey,
} from '@/config/storeProductTrial';
import { enterStoreGeneralTrial } from '@/lib/storeGeneralTrialRemote';
import { ROUTE_PATHS } from '@/lib/routePaths';
import { cn } from '@/lib/utils';

const fieldClass =
  'mt-1 w-full rounded-xl border border-white/15 bg-[#061018] px-3 py-2.5 text-sm text-[#f4efe4] outline-none focus:border-teal-400/50';

export function StoreGeneralTrialEnterForm() {
  const copy = STORE_GENERAL_TRIAL_COPY;
  const [productKey, setProductKey] = useState<StoreGeneralTrialKey | ''>('');
  const [shopName, setShopName] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [committed, setCommitted] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (busy) return;
    if (!productKey) {
      toast.error(copy.needProductAr);
      return;
    }
    if (shopName.trim().length < 2) {
      toast.error(copy.needShopAr);
      return;
    }
    if (city.trim().length < 2) {
      toast.error(copy.needCityAr);
      return;
    }
    if (neighborhood.trim().length < 2) {
      toast.error(copy.needNeighborhoodAr);
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      toast.error(copy.needEmailAr);
      return;
    }
    if (!committed) {
      toast.error(copy.needCommitAr);
      return;
    }
    if (!acceptedTerms) {
      toast.error(copy.needConsentAr);
      return;
    }
    setBusy(true);
    const result = await enterStoreGeneralTrial({
      productKey,
      shopName,
      email,
      city,
      neighborhood,
      whatsapp,
      committed,
      acceptedTerms,
    });
    setBusy(false);
    if (!result.ok) {
      toast.error(result.error || 'تعذر إرسال الطلب.');
      return;
    }
    toast.success(copy.confirmSentAr);
    setShopName('');
    setEmail('');
    setCity('');
    setNeighborhood('');
    setWhatsapp('');
    setCommitted(false);
    setAcceptedTerms(false);
  }

  return (
    <form onSubmit={(event) => void onSubmit(event)} className="space-y-4">
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" />
      <p className="text-lg font-extrabold text-[#f4efe4]">{copy.formTitleAr}</p>
      <fieldset>
        <legend className="text-sm font-bold text-white/80">{copy.pickTitleAr}</legend>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {STORE_GENERAL_TRIAL_KEYS.map((key) => {
            const product = STORE_PRODUCT_TRIAL_PRODUCTS[key];
            const selected = productKey === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setProductKey(key)}
                className={cn(
                  'rounded-2xl border px-4 py-3 text-start',
                  selected
                    ? 'border-teal-300 bg-teal-400/10'
                    : 'border-white/12 bg-[#061018] hover:border-teal-300/40',
                )}
              >
                <p className="font-extrabold text-[#f4efe4]">{product.titleAr}</p>
                <p className="mt-1 text-xs leading-6 text-white/65">{product.cardLeadAr}</p>
              </button>
            );
          })}
        </div>
      </fieldset>
      <label className="block text-sm">
        {copy.shopLabelAr}
        <input className={fieldClass} value={shopName} onChange={(event) => setShopName(event.target.value)} />
      </label>
      <label className="block text-sm">
        {copy.emailLabelAr}
        <input
          className={fieldClass}
          dir="ltr"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        <span className="mt-1 block text-xs leading-6 text-white/50">{copy.emailHintAr}</span>
      </label>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block text-sm">
          {copy.cityLabelAr}
          <input className={fieldClass} value={city} onChange={(event) => setCity(event.target.value)} />
        </label>
        <label className="block text-sm">
          {copy.neighborhoodLabelAr}
          <input
            className={fieldClass}
            value={neighborhood}
            onChange={(event) => setNeighborhood(event.target.value)}
          />
        </label>
      </div>
      <label className="block text-sm">
        {copy.whatsappLabelAr}
        <input
          className={fieldClass}
          dir="ltr"
          inputMode="tel"
          value={whatsapp}
          onChange={(event) => setWhatsapp(event.target.value)}
        />
        <span className="mt-1 block text-xs leading-6 text-white/50">{copy.whatsappOptionalAr}</span>
      </label>
      <label className="flex items-start gap-2 text-sm leading-7 text-white/80">
        <input
          type="checkbox"
          className="mt-1.5"
          checked={committed}
          onChange={(event) => setCommitted(event.target.checked)}
        />
        <span>{copy.commitAr}</span>
      </label>
      <Collapsible open={termsOpen} onOpenChange={setTermsOpen}>
        <CollapsibleTrigger className="flex w-full items-center justify-between rounded-xl border border-white/12 px-3 py-2 text-sm font-bold text-teal-200">
          {copy.termsFoldTriggerAr}
          <ChevronDown className={cn('h-4 w-4 transition-transform', termsOpen && 'rotate-180')} />
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-2 space-y-3 rounded-xl border border-white/10 bg-[#061018] p-4 text-sm leading-7 text-white/70">
          {STORE_GENERAL_TRIAL_TERMS_COPY.sections.map((section) => (
            <p key={section.titleAr}>
              <strong className="text-white">{section.titleAr}.</strong> {section.bodyAr}
            </p>
          ))}
          <Link to={ROUTE_PATHS.STORE_GENERAL_TRIAL_TERMS} className="inline-block font-bold text-teal-200 underline">
            {copy.termsLinkAr}
          </Link>
        </CollapsibleContent>
      </Collapsible>
      <label className="flex items-start gap-2 text-sm leading-7 text-white/80">
        <input
          type="checkbox"
          className="mt-1.5"
          checked={acceptedTerms}
          onChange={(event) => setAcceptedTerms(event.target.checked)}
        />
        <span>{copy.consentAr}</span>
      </label>
      <button
        type="submit"
        disabled={busy}
        className="w-full rounded-full bg-teal-400 px-5 py-3 text-sm font-extrabold text-[#061018] disabled:opacity-60"
      >
        {copy.submitAr}
      </button>
    </form>
  );
}
