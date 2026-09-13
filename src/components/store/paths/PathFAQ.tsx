/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * أسئلة شائعة — عناصر <details> أصلية (بلا مكتبة إضافية) لإتاحة وصول كاملة
 * بلوحة المفاتيح ودون جافاسكربت إضافي، متوافقة مع prefers-reduced-motion.
 */
import type { ProductPathFaqItem } from '@/config/storeProductPathTypes';
import { StorePathEvents } from '@/lib/storePathAnalytics';

export function PathFAQ({ faq, code }: { faq: readonly ProductPathFaqItem[]; code: string }) {
  if (faq.length === 0) return null;
  return (
    <section className="rounded-2xl border border-[#bdb5a7] bg-[#fffaf4] p-5 sm:p-7">
      <h2 className="text-lg font-extrabold text-[#1f2933]">أسئلة شائعة</h2>
      <div className="mt-4 divide-y divide-[#bdb5a7]">
        {faq.map((item) => (
          <details
            key={item.questionAr}
            className="group py-3 first:pt-0 last:pb-0"
            onToggle={(event) => {
              if ((event.currentTarget as HTMLDetailsElement).open) {
                StorePathEvents.faqExpand(code, item.questionAr);
              }
            }}
          >
            <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 text-sm font-extrabold text-[#1f2933] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1d4f69]">
              <span>{item.questionAr}</span>
              <span aria-hidden="true" className="text-lg text-[#566269] group-open:rotate-45 transition-transform motion-reduce:transition-none">
                +
              </span>
            </summary>
            <p className="mt-2 text-sm leading-7 text-[#566269]">{item.answerAr}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
