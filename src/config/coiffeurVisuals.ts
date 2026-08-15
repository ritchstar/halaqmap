/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
/** صور معتمدة للرئيسية والكروت — بلا كتابة داخل الرسم */
export const COIFFEUR_VISUALS = {
  hero: '/images/coiffeur/hero-atelier.webp',
  spa: '/images/coiffeur/spa-still.webp',
  makeup: '/images/coiffeur/makeup-still.webp',
  story: '/images/coiffeur/story-path.webp',
  cardIntro: '/images/coiffeur/card-intro.webp',
  cardShare: '/images/coiffeur/card-share.webp',
} as const;

export const COIFFEUR_LANDING_MOOD = [
  { src: COIFFEUR_VISUALS.hero, alt: 'أتيليه كوافير ماب', wide: true },
  { src: COIFFEUR_VISUALS.spa, alt: 'إطلالة سبا وعناية', wide: false },
  { src: COIFFEUR_VISUALS.makeup, alt: 'إطلالة مكياج وسهرات', wide: false },
] as const;
