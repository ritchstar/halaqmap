/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import { COIFFEUR_LANDING_MOOD } from '@/config/coiffeurVisuals';
import { CoiffeurGlowFrame } from '@/components/coiffeur/CoiffeurGlowFrame';

export function CoiffeurMoodGallery() {
  const hero = COIFFEUR_LANDING_MOOD[0];
  const tiles = COIFFEUR_LANDING_MOOD.slice(1);

  return (
    <section className="relative mx-auto max-w-6xl px-5 pb-10 md:pb-16">
      <CoiffeurGlowFrame>
        <img
          src={hero.src}
          alt={hero.alt}
          width={1600}
          height={900}
          className="aspect-[16/9] w-full object-cover"
          decoding="async"
        />
      </CoiffeurGlowFrame>
      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        {tiles.map((item) => (
          <CoiffeurGlowFrame key={item.src}>
            <img
              src={item.src}
              alt={item.alt}
              width={1080}
              height={1080}
              className="aspect-square w-full object-cover"
              decoding="async"
            />
          </CoiffeurGlowFrame>
        ))}
      </div>
    </section>
  );
}
