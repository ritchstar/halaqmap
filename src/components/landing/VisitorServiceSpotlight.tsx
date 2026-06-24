import { motion } from 'framer-motion';
import {
  VISITOR_SERVICE_SPOTLIGHT_CARDS,
  VISITOR_SERVICE_SPOTLIGHT_SUBTITLE_AR,
  VISITOR_SERVICE_SPOTLIGHT_TITLE_AR,
} from '@/config/visitorLandingCopy';
import type { FilterState } from '@/lib/index';
import { applyVisitorServiceIntent, type VisitorServiceIntentId } from '@/lib/visitorServiceIntents';
import { VISITOR_SERVICE_INTENTS } from '@/lib/visitorServiceIntents';

type Props = {
  filters: FilterState;
  activeIntentId: VisitorServiceIntentId | null;
  onSelectIntent: (next: FilterState, intentId: VisitorServiceIntentId) => void;
  onScrollToSearch: () => void;
};

export function VisitorServiceSpotlight({
  filters,
  activeIntentId,
  onSelectIntent,
  onScrollToSearch,
}: Props) {
  return (
    <section id="خدمات-الزائر" className="relative z-10 py-20" dir="rtl">
      <div className="pointer-events-none absolute right-0 top-10 h-80 w-80 rounded-full bg-violet-500/8 blur-[100px]" />
      <div className="mx-auto max-w-6xl px-5">
        <div className="mb-10 text-center sm:text-right">
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl font-black text-white md:text-4xl"
          >
            {VISITOR_SERVICE_SPOTLIGHT_TITLE_AR}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-3 max-w-2xl text-sm leading-relaxed text-white/80 sm:mx-0 mx-auto"
          >
            {VISITOR_SERVICE_SPOTLIGHT_SUBTITLE_AR}
          </motion.p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {VISITOR_SERVICE_SPOTLIGHT_CARDS.map((card, i) => {
            const intent = VISITOR_SERVICE_INTENTS.find((x) => x.id === card.intentId);
            const active = activeIntentId === card.intentId;
            return (
              <motion.button
                key={card.intentId}
                type="button"
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ y: -4 }}
                onClick={() => {
                  onSelectIntent(applyVisitorServiceIntent(card.intentId, filters.maxDistance), card.intentId);
                  onScrollToSearch();
                }}
                className={`group relative overflow-hidden rounded-2xl border bg-gradient-to-br p-5 text-right transition-all ${card.border} ${card.accent} ${
                  active ? 'ring-2 ring-teal-400/50' : 'hover:border-white/20'
                }`}
              >
                <span className="text-2xl">{intent?.emoji ?? '✂️'}</span>
                <h3 className="mt-3 text-base font-bold text-white">{card.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-300">{card.benefit}</p>
                <span className="mt-4 inline-flex text-xs font-semibold text-teal-300 group-hover:text-teal-200">
                  {active ? 'مُفعَّل — ابدأ الاستعلام' : 'فعّل الفلتر وابحث ←'}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
