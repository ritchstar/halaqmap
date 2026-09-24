/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * ماذا تحصل عليه عند البدء — عناصر مثبتة لهذا المنتج وحده.
 */
import { benefitQrIllustrationSrc } from '@/config/storeBenefitIllustrations';
import {
  PATH_RETURN_FACILITATION_AR,
  pathShowsReturnFacilitation,
  pathStartGains,
} from '@/config/storePathBenefitUse';

export function PathStartGainsSection({ code }: { code: string }) {
  const items = pathStartGains(code);
  const qrSrc = items.includes('رابط ورمز مشاركة') ? benefitQrIllustrationSrc(true) : null;
  if (items.length === 0) return null;

  return (
    <section className="rounded-3xl border border-[#bdb5a7] bg-[#fffaf4] px-5 py-8 sm:px-8">
      <h2 className="text-lg font-extrabold text-[#1f2933]">ماذا تحصل عليه عند البدء؟</h2>
      {qrSrc ? (
        <img src={qrSrc} alt="رابط ورمز مشاركة لتسهيل العودة" className="mx-auto mt-4 h-auto w-full max-w-xs rounded-2xl object-contain" />
      ) : null}
      <ul className="mt-4 space-y-2 text-sm leading-7 text-[#3d3226] sm:text-base">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      {pathShowsReturnFacilitation(code) ? (
        <p className="mt-4 text-sm leading-8 text-[#566269]">{PATH_RETURN_FACILITATION_AR}</p>
      ) : null}
    </section>
  );
}
