/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * القسم H — الخاتمة.
 */
import { Link } from 'react-router-dom';

export interface TabkhatnaRamadanFinalCtaProps {
  titleAr: string;
  bodyAr: string;
  ctaAr: string;
  to: string;
}

export function TabkhatnaRamadanFinalCta({ titleAr, bodyAr, ctaAr, to }: TabkhatnaRamadanFinalCtaProps) {
  return (
    <section className="rounded-2xl border border-[#3d8b4a]/35 bg-[#faf6ec] p-5 text-center md:p-8">
      <h2 className="text-2xl font-extrabold text-[#234226]">{titleAr}</h2>
      <p className="mx-auto mt-3 max-w-2xl text-sm font-bold leading-8 text-[#3f3527]/90 md:text-base">{bodyAr}</p>
      <Link
        to={to}
        className="mt-5 inline-flex rounded-full bg-[#3d8b4a] px-6 py-3 text-sm font-bold text-[#fdfaf1]"
      >
        {ctaAr}
      </Link>
    </section>
  );
}
