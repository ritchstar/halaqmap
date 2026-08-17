/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import { NoGuaranteedCustomersNoteIf } from '@/components/partner/NoGuaranteedCustomersNote';
import {
  PARTNER_SHARED_TRIAL_OFFER,
  isPartnerSharedTrialOfferLive,
} from '@/config/partnerSharedTrialOfferCopy';

type Props = {
  onRegister?: () => void;
};

export function PartnerSharedTrialOfferBanner({ onRegister }: Props) {
  if (!isPartnerSharedTrialOfferLive()) return null;
  const copy = PARTNER_SHARED_TRIAL_OFFER;

  return (
    <aside
      id={copy.id}
      dir="rtl"
      className="relative mb-6 overflow-hidden rounded-[1.6rem] border border-amber-300/55 bg-[linear-gradient(145deg,rgba(69,26,3,0.55),rgba(4,16,24,0.92)_42%,rgba(8,47,73,0.55))] px-4 py-5 shadow-[0_0_48px_rgba(251,191,36,0.28)] md:mb-8 md:px-6 md:py-6"
    >
      <div className="pointer-events-none absolute -left-10 top-0 h-28 w-28 animate-pulse rounded-full bg-amber-300/35 blur-3xl" />
      <div className="pointer-events-none absolute -right-6 bottom-0 h-24 w-24 animate-pulse rounded-full bg-yellow-200/25 blur-3xl" />
      <div className="relative">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-amber-300/40 bg-amber-400/15 px-3 py-1 text-[0.68rem] font-black text-amber-100">
            {copy.kicker}
          </span>
          <span className="text-[0.72rem] font-black tracking-wide text-amber-200 [text-shadow:0_0_14px_rgba(251,191,36,0.95)]">
            {copy.untilAr}
          </span>
        </div>
        <p className="text-[clamp(1.45rem,4.2vw,2.15rem)] font-black leading-snug text-amber-50 [text-shadow:0_0_18px_rgba(250,204,21,1),0_0_42px_rgba(251,191,36,0.75),0_0_72px_rgba(245,158,11,0.45)]">
          {copy.headline}
        </p>
        <p className="mt-2 text-sm font-bold leading-7 text-yellow-100/95 md:text-base">
          {copy.subhead}
        </p>
        <p className="mt-3 text-sm leading-8 text-slate-100 md:text-[0.95rem]">
          {copy.body}
        </p>
        <p className="mt-3 text-xs leading-7 text-amber-100/80">
          {copy.disclaimer}
        </p>
        <NoGuaranteedCustomersNoteIf text={copy.disclaimer} variant="dark" className="mt-3" />
        {onRegister ? (
          <button
            type="button"
            onClick={onRegister}
            className="mt-4 inline-flex items-center justify-center rounded-xl bg-gradient-to-l from-amber-300 via-yellow-200 to-amber-400 px-5 py-3 text-sm font-black text-slate-950 shadow-[0_0_28px_rgba(251,191,36,0.45)]"
          >
            {copy.cta}
          </button>
        ) : null}
      </div>
    </aside>
  );
}
