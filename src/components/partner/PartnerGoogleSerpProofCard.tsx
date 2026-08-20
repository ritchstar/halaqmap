/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * بطاقة منجز بحث قوقل — مسار الشركاء فقط.
 */
import { PARTNER_GOOGLE_SERP_PROOF as COPY } from '@/config/partnerGoogleSerpProof';

type Props = {
  tone?: 'dark' | 'light';
};

export function PartnerGoogleSerpProofCard({ tone = 'dark' }: Props) {
  const dark = tone === 'dark';
  return (
    <div
      id="منجز-البحث"
      className={
        dark
          ? 'scroll-mt-28 overflow-hidden rounded-[1.75rem] border border-teal-400/35 bg-[#041018] shadow-[0_28px_70px_-30px_rgba(20,184,166,0.45)]'
          : 'scroll-mt-8 overflow-hidden rounded-[1.6rem] border border-emerald-200 bg-white shadow-[0_16px_36px_rgba(16,185,129,0.12)]'
      }
    >
      <div className="grid items-center gap-0 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="p-6 md:p-8">
          <p
            className={
              dark
                ? 'text-xs font-black tracking-[0.18em] text-teal-200'
                : 'text-[0.72rem] font-black tracking-[0.18em] text-emerald-700'
            }
          >
            {COPY.kickerAr}
          </p>
          <h2
            className={
              dark
                ? 'mt-3 text-2xl font-black leading-snug text-white md:text-3xl'
                : 'mt-2 text-xl font-black leading-8 text-slate-950 md:text-2xl'
            }
          >
            {COPY.titleAr}
          </h2>
          <p
            className={
              dark
                ? 'mt-4 text-base leading-8 text-slate-300 md:text-lg'
                : 'mt-3 text-sm leading-8 text-slate-700 md:text-base'
            }
          >
            {COPY.leadAr}
          </p>
          <p className={dark ? 'mt-4 text-sm text-slate-400' : 'mt-4 text-sm text-slate-500'}>
            {COPY.queryLabelAr}
            <span className={dark ? 'mx-2 font-extrabold text-teal-200' : 'mx-2 font-extrabold text-emerald-800'}>
              {COPY.queryAr}
            </span>
            <code dir="ltr" className="inline-block rounded bg-black/10 px-1.5 py-0.5 text-[0.75rem]">
              {COPY.host}
            </code>
          </p>
          <p
            className={
              dark
                ? 'mt-5 text-sm font-semibold leading-7 text-teal-50'
                : 'mt-5 text-sm font-semibold leading-8 text-emerald-950'
            }
          >
            {COPY.inviteAr}
          </p>
        </div>
        <figure className={dark ? 'border-t border-teal-400/20 bg-white lg:border-t-0 lg:border-s' : 'border-t border-emerald-100 bg-white lg:border-t-0 lg:border-s'}>
          <img
            src={COPY.image}
            alt={COPY.altAr}
            className="aspect-[16/9] w-full bg-white object-contain object-top"
          />
          <figcaption
            className={
              dark
                ? 'border-t border-teal-400/20 bg-[#03151c] px-4 py-3 text-sm font-bold text-teal-200'
                : 'border-t border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-900'
            }
          >
            {COPY.captionAr}
          </figcaption>
        </figure>
      </div>
    </div>
  );
}
