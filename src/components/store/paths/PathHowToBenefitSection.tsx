/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * كيف تستفيد من منتجك — الخطوات 1 و2 و3 و5 ثابتة، والرابعة حسب قدرة المنتج.
 */
import { BenefitIllustration } from '@/components/store/paths/BenefitIllustration';
import { STORE_PRODUCT_PATHS } from '@/lib/storeProductPathAdapter';
import {
  PATH_BENEFIT_CLOSING_STEP,
  PATH_BENEFIT_FIXED_STEPS,
  pathBenefitStepFour,
} from '@/config/storePathBenefitUse';

export function PathHowToBenefitSection() {
  const rows = STORE_PRODUCT_PATHS.flatMap((path) => {
    const step = pathBenefitStepFour(path.code);
    return step ? [{ code: path.code, name: path.shortTitleAr, step }] : [];
  });

  return (
    <section
      aria-label="كيف تستفيد من منتجك"
      className="mx-auto max-w-3xl rounded-2xl border border-[#bdb5a7] bg-[#fffdf8] px-5 py-6 text-start sm:px-7 sm:py-7"
    >
      <BenefitIllustration id="directCustomerPath" />
      <h2 className="mt-4 text-lg font-extrabold text-[#1f2933] sm:text-xl">كيف تستفيد من منتجك؟</h2>
      <ol className="mt-4 list-decimal space-y-3 pe-5 text-sm leading-8 text-[#3d3226] sm:text-base">
        {PATH_BENEFIT_FIXED_STEPS.map((step) => (
          <li key={step}>{step}</li>
        ))}
        <li>
          <p>الخطوة الرابعة تختلف حسب ما يتيحه المنتج:</p>
          <ul className="mt-2 space-y-2">
            {rows.map((row) => (
              <li key={row.code}>
                <span className="font-extrabold text-[#1f2933]">{row.name}: </span>
                {row.step}
              </li>
            ))}
          </ul>
        </li>
        <li>{PATH_BENEFIT_CLOSING_STEP}</li>
      </ol>
    </section>
  );
}
