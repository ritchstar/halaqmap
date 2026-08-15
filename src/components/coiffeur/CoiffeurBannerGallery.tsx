/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * بنرات الباقات الثلاث الافتراضية — معاينة عاملة كبنر حلاق ماب.
 */
import {
  COIFFEUR_BANNER_GALLERY_COPY,
  COIFFEUR_BANNER_SAMPLES,
} from '@/config/coiffeurBannerSamples';
import { CoiffeurPackageBanner } from '@/components/coiffeur/CoiffeurPackageBanner';

export function CoiffeurBannerGallery() {
  return (
    <section className="relative mx-auto max-w-6xl px-5 pb-10 md:pb-20">
      <div className="mb-6 text-center md:mb-10">
        <p className="text-sm font-black tracking-[0.12em] text-[#f4d4c0]">{COIFFEUR_BANNER_GALLERY_COPY.kicker}</p>
        <h2 className="mt-2 text-2xl font-black text-white md:text-3xl">
          {COIFFEUR_BANNER_GALLERY_COPY.title}
          <span className="mt-1 block bg-gradient-to-l from-rose-200 via-[#f4d4c0] to-amber-200 bg-clip-text text-transparent">
            {COIFFEUR_BANNER_GALLERY_COPY.titleAccent}
          </span>
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-[#f7efe8]/80">
          {COIFFEUR_BANNER_GALLERY_COPY.hint}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3 md:gap-5">
        {COIFFEUR_BANNER_SAMPLES.map((item) => (
          <CoiffeurPackageBanner key={item.id} tierId={item.id} sample={item} />
        ))}
      </div>
    </section>
  );
}
