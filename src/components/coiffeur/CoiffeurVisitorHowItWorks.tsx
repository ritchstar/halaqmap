/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import { Sparkles, Search, Store, Navigation } from 'lucide-react';
import { COIFFEUR_VISITOR_HOW_IT_WORKS } from '@/config/coiffeurMapUmbrella';

const STEP_ICONS = [Sparkles, Search, Store, Navigation] as const;

export function CoiffeurVisitorHowItWorks() {
  const copy = COIFFEUR_VISITOR_HOW_IT_WORKS;

  return (
    <section className="relative mx-auto max-w-6xl px-5 pb-10 md:pb-16">
      <div className="overflow-hidden rounded-3xl border border-rose-200/15 bg-gradient-to-b from-white/[0.07] to-white/[0.02] px-5 py-8 shadow-[inset_0_1px_0_rgba(244,212,192,0.16)] md:rounded-[2rem] md:px-10 md:py-12">
        <p className="text-center text-sm font-black tracking-[0.12em] text-[#f4d4c0]">{copy.kicker}</p>
        <h2 className="mt-2 text-center text-2xl font-black text-white md:text-3xl">
          {copy.title}
          <span className="mt-1 block bg-gradient-to-l from-rose-200 via-[#f4d4c0] to-amber-200 bg-clip-text text-transparent">
            {copy.titleAccent}
          </span>
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-center text-base leading-8 text-[#f7efe8]">{copy.lead}</p>

        <ol className="mt-8 grid gap-3 sm:grid-cols-2">
          {copy.steps.map((step, index) => {
            const Icon = STEP_ICONS[index] ?? Navigation;
            return (
              <li
                key={step.title}
                className="rounded-2xl border border-white/10 bg-[#14080e]/40 px-4 py-4"
              >
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#f4d4c0]/40 bg-[#e8b4a2]/15 text-[#f4d4c0]">
                    <Icon className="h-5 w-5" aria-hidden />
                  </span>
                  <div className="min-w-0">
                    <p className="font-black text-white">{step.title}</p>
                    <p className="mt-1 text-sm leading-7 text-[#f7efe8]">{step.body}</p>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>

        <div className="mt-8 rounded-2xl border border-[#f4d4c0]/25 bg-[#e8b4a2]/10 px-4 py-5 text-center md:px-8">
          <p className="font-black text-[#f4d4c0]">{copy.freeTitle}</p>
          <p className="mt-2 text-sm leading-7 text-[#f7efe8] md:text-base">{copy.freeBody}</p>
          <p className="mt-3 text-sm leading-7 text-rose-50/80">{copy.honesty}</p>
        </div>
      </div>
    </section>
  );
}
