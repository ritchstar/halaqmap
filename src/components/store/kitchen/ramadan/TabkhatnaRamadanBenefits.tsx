/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * القسم C — ماذا يمنحك طبختنا1؟ بطاقتا «صفحة خاصة» و«عرض أوضح» تشتركان
 * بنفس الصورة (privatePage) حسب توجيه المستند — لا صورة مستقلة للبطاقة
 * الثانية. بطاقة «مشاركة أسهل» لها صورتها الخاصة (shareLinkQr).
 */
import { StoreShot } from '@/components/store/StoreShot';

export interface TabkhatnaRamadanBenefitsProps {
  titleAr: string;
  leadAr: string;
  pageGroup: {
    imageSrc: string;
    imageAltAr: string;
    cards: readonly { titleAr: string; bodyAr: string }[];
  };
  shareCard: {
    titleAr: string;
    bodyAr: string;
    imageSrc: string;
    imageAltAr: string;
  };
}

export function TabkhatnaRamadanBenefits({ titleAr, leadAr, pageGroup, shareCard }: TabkhatnaRamadanBenefitsProps) {
  return (
    <section>
      <h2 className="text-2xl font-extrabold text-[#234226]">{titleAr}</h2>
      <p className="mt-2 max-w-3xl text-sm leading-7 text-[#3f3527]/85 md:text-base">{leadAr}</p>

      <div className="mt-5 grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
        <figure className="overflow-hidden rounded-2xl border border-[#3d8b4a]/20 bg-[#faf6ec]">
          <StoreShot src={pageGroup.imageSrc} alt={pageGroup.imageAltAr} className="aspect-[4/3] w-full" />
        </figure>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
          {pageGroup.cards.map((card) => (
            <div key={card.titleAr} className="rounded-2xl border border-[#3d8b4a]/20 bg-[#fdfaf1] px-4 py-4">
              <p className="font-extrabold text-[#3d8b4a]">{card.titleAr}</p>
              <p className="mt-2 text-sm leading-7 text-[#3f3527]/80">{card.bodyAr}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="flex flex-col justify-center rounded-2xl border border-[#3d8b4a]/20 bg-[#fdfaf1] px-4 py-4 lg:order-2">
          <p className="font-extrabold text-[#3d8b4a]">{shareCard.titleAr}</p>
          <p className="mt-2 text-sm leading-7 text-[#3f3527]/80">{shareCard.bodyAr}</p>
        </div>
        <figure className="overflow-hidden rounded-2xl border border-[#3d8b4a]/20 bg-[#faf6ec] lg:order-1">
          <StoreShot src={shareCard.imageSrc} alt={shareCard.imageAltAr} className="aspect-[4/3] w-full" />
        </figure>
      </div>
    </section>
  );
}
