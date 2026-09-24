/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * القسم B — المشكلة اليومية. بطاقات بأيقونات مجردة، بلا نص داخل صورة.
 */
import { TabkhatnaRamadanIcon, type TabkhatnaRamadanIconName } from './TabkhatnaRamadanIcons';

export interface TabkhatnaRamadanProblemProps {
  titleAr: string;
  bodyAr: string;
  cards: readonly { titleAr: string; icon: TabkhatnaRamadanIconName }[];
}

export function TabkhatnaRamadanProblem({ titleAr, bodyAr, cards }: TabkhatnaRamadanProblemProps) {
  return (
    <section className="rounded-2xl border border-[#3d8b4a]/20 bg-[#faf6ec] p-5 md:p-7">
      <h2 className="text-2xl font-extrabold text-[#234226]">{titleAr}</h2>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-[#3f3527]/85 md:text-base md:leading-8">{bodyAr}</p>
      <ul className="mt-5 grid gap-3 sm:grid-cols-3">
        {cards.map((card) => (
          <li
            key={card.titleAr}
            className="flex flex-col items-center gap-2 rounded-xl border border-[#3d8b4a]/15 bg-[#fdfaf1] px-4 py-5 text-center"
          >
            <TabkhatnaRamadanIcon name={card.icon} className="h-9 w-9 text-[#7c8b52]" />
            <p className="text-sm font-bold leading-6 text-[#3f3527]">{card.titleAr}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
