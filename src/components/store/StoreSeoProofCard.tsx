/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * إثبات تطويري: ظهور عضوي لكوافير ماب في قوقل. يُحمَّل مع صفحات المتجر/المكتب فقط.
 */
import { StoreShot } from '@/components/store/StoreShot';
import { STORE_SEO_PROOF, STORE_VISUALS } from '@/config/storeFront';
import { cn } from '@/lib/utils';

type StoreSeoProofCardProps = {
  className?: string;
  eager?: boolean;
  tone?: 'store' | 'desk';
};

export function StoreSeoProofCard({ className, eager = false, tone = 'store' }: StoreSeoProofCardProps) {
  const desk = tone === 'desk';
  return (
    <figure
      className={cn(
        'overflow-hidden rounded-2xl border',
        desk
          ? 'border-[#e8c547]/35 bg-black/25 shadow-[0_24px_60px_-28px_rgba(232,197,71,0.35)]'
          : 'border-[#e8c547]/30 bg-[#0b1a24]/80 shadow-[0_24px_60px_-28px_rgba(232,197,71,0.45)]',
        className,
      )}
    >
      <div className={cn('px-4 pt-4 md:px-5 md:pt-5', desk ? 'text-white' : 'text-[#f4efe4]')}>
        <p className="text-[0.7rem] font-bold tracking-wide text-[#e8c547]">{STORE_SEO_PROOF.kickerAr}</p>
        <h2 className={cn('mt-1 font-extrabold', desk ? 'text-lg text-white' : 'text-2xl')}>
          {STORE_SEO_PROOF.titleAr}
        </h2>
        <p className={cn('mt-2 text-sm leading-7', desk ? 'text-white/70' : 'text-white/75')}>
          {STORE_SEO_PROOF.leadAr}
        </p>
        <p className="mt-2 text-xs text-white/45">
          عبارة البحث
          <span className="mx-1 font-extrabold text-[#e8c547]">{STORE_SEO_PROOF.queryAr}</span>
          <span className="mx-1 text-white/25">·</span>
          <code dir="ltr" className="inline-block rounded bg-white/10 px-1.5 py-0.5 text-[0.75rem]">
            {STORE_SEO_PROOF.host}
          </code>
        </p>
      </div>
      <StoreShot
        src={STORE_VISUALS.googleSerpCoiffeur}
        alt={STORE_SEO_PROOF.altAr}
        className="mt-4 aspect-[16/7] bg-white"
        imgClassName="object-contain object-top bg-white"
        eager={eager}
      />
      <figcaption
        className={cn(
          'border-t px-4 py-2 text-sm font-bold',
          desk ? 'border-white/10 bg-black/30 text-[#e8c547]' : 'border-white/10 bg-[#061018] text-[#e8c547]',
        )}
      >
        {STORE_SEO_PROOF.captionAr}
      </figcaption>
    </figure>
  );
}
