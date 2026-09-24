/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * القسم F — دعوة التعلم قبل رمضان. يحمل المعرّف `learn-before-season`
 * الذي يستهدفه زر الهيرو الثانوي بالتمرير السلس.
 */
import { Link } from 'react-router-dom';

export interface TabkhatnaRamadanLearningCtaProps {
  titleAr: string;
  bodyAr: string;
  primaryCtaAr: string;
  primaryTo: string;
  secondaryCtaAr: string;
  secondaryTo: string;
}

export function TabkhatnaRamadanLearningCta({
  titleAr,
  bodyAr,
  primaryCtaAr,
  primaryTo,
  secondaryCtaAr,
  secondaryTo,
}: TabkhatnaRamadanLearningCtaProps) {
  return (
    <section
      id="learn-before-season"
      className="scroll-mt-20 rounded-2xl border border-[#d8ac52]/45 bg-[#faf6ec] p-5 md:p-7"
    >
      <h2 className="text-2xl font-extrabold text-[#234226]">{titleAr}</h2>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-[#3f3527]/85 md:text-base md:leading-8">{bodyAr}</p>
      <div className="mt-5 flex flex-wrap gap-3">
        <Link to={primaryTo} className="rounded-full bg-[#3d8b4a] px-5 py-2.5 text-sm font-bold text-[#fdfaf1]">
          {primaryCtaAr}
        </Link>
        <Link
          to={secondaryTo}
          className="rounded-full border border-[#3d8b4a]/50 px-5 py-2.5 text-sm font-bold text-[#3d8b4a]"
        >
          {secondaryCtaAr}
        </Link>
      </div>
    </section>
  );
}
