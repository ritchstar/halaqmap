/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
/**
 * معرض الحزم: نوافذ دائرية على الويب، وبطاقات مكدّسة على الجوال كحلاق ماب.
 */
import { useState } from 'react';
import {
  COIFFEUR_BANNER_GALLERY_COPY,
  COIFFEUR_BANNER_SAMPLES,
  type CoiffeurBannerTierId,
} from '@/config/coiffeurBannerSamples';
import { CoiffeurPackageBanner } from '@/components/coiffeur/CoiffeurPackageBanner';

export function CoiffeurBannerGallery() {
  const [preview, setPreview] = useState<CoiffeurBannerTierId>('gold');

  return (
    <section className="relative mx-auto max-w-6xl px-5 pb-10 md:pb-20">
      <div className="mb-6 text-center md:mb-12">
        <p className="text-sm font-black tracking-[0.12em] text-[#f4d4c0]">{COIFFEUR_BANNER_GALLERY_COPY.kicker}</p>
        <h2 className="mt-2 text-2xl font-black text-white md:text-3xl">
          {COIFFEUR_BANNER_GALLERY_COPY.title}
          <span className="mt-1 block bg-gradient-to-l from-rose-200 via-[#f4d4c0] to-amber-200 bg-clip-text text-transparent">
            {COIFFEUR_BANNER_GALLERY_COPY.titleAccent}
          </span>
        </h2>
      </div>

      <div className="space-y-6 md:hidden">
        {COIFFEUR_BANNER_SAMPLES.map((item) => (
          <CoiffeurPackageBanner
            key={`card-${item.id}`}
            tierId={item.id}
            layout="card"
            selected={preview === item.id}
            onSelect={() => setPreview(item.id)}
          />
        ))}
      </div>

      <div className="hidden justify-center gap-14 md:flex lg:gap-16 xl:gap-20">
        {COIFFEUR_BANNER_SAMPLES.map((item) => (
          <CoiffeurPackageBanner
            key={`window-${item.id}`}
            tierId={item.id}
            layout="window"
            selected={preview === item.id}
            onSelect={() => setPreview(item.id)}
          />
        ))}
      </div>
    </section>
  );
}
