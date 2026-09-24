/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * القسم D — طريقة الاستعداد. لا خطوة «تفعيل بعد الدفع» أو «مراجعة
 * الجاهزية» — غير موجودتين فعلياً في المنتج، فلا تُضافان هنا.
 */
import { StoreShot } from '@/components/store/StoreShot';

export interface TabkhatnaRamadanStepsProps {
  titleAr: string;
  imageSrc: string;
  imageAltAr: string;
  items: readonly { titleAr: string }[];
}

export function TabkhatnaRamadanSteps({ titleAr, imageSrc, imageAltAr, items }: TabkhatnaRamadanStepsProps) {
  return (
    <section>
      <h2 className="text-2xl font-extrabold text-[#234226]">{titleAr}</h2>
      <figure className="mt-4 overflow-hidden rounded-2xl border border-[#3d8b4a]/20 bg-[#faf6ec]">
        <StoreShot src={imageSrc} alt={imageAltAr} className="aspect-[16/9] w-full" />
      </figure>
      <ol className="mt-4 grid gap-3 md:grid-cols-3">
        {items.map((step, i) => (
          <li key={step.titleAr} className="rounded-xl border border-[#3d8b4a]/20 bg-[#fdfaf1] px-4 py-3">
            <p className="font-extrabold text-[#3f3527]">
              <span className="ml-1 text-[#3d8b4a]">{i + 1}.</span>
              {step.titleAr}
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}
